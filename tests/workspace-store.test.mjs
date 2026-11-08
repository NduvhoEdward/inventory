import { test } from "node:test";
import assert from "node:assert/strict";
import { createWorkspaceStore } from "../lib/workspace-store.mjs";
function fixture() {
  let row = {
    parts: [{ id: "old", name: "LED", category: "leds", quantity: 3 }],
    collections: null,
    revision: 0,
  };
  let legacyLoads = 0;
  const sql = async (strings, ...values) => {
    const q = strings.join("?");
    if (q.startsWith("ALTER")) return [];
    if (q.startsWith("SELECT")) return [structuredClone(row)];
    if (q.includes("collections IS NULL")) {
      if (row.collections === null) {
        row.parts = JSON.parse(values[0]);
        row.collections = JSON.parse(values[1]);
        row.revision++;
      }
      return [];
    }
    if (q.includes("RETURNING revision")) {
      if (row.revision !== values[2]) return [];
      row.parts = JSON.parse(values[0]);
      row.collections = JSON.parse(values[1]);
      row.revision++;
      return [{ revision: row.revision }];
    }
    throw Error("Unexpected SQL");
  };
  return {
    sql,
    legacy: {
      load: async () => {
        legacyLoads++;
        return row.parts;
      },
    },
    get row() {
      return row;
    },
    get legacyLoads() {
      return legacyLoads;
    },
  };
}
test("workspace migration persists once and preserves original parts", async () => {
  const f = fixture(),
    store = createWorkspaceStore(f.sql, f.legacy);
  const d = await store.load();
  assert.equal(d.revision, 1);
  assert.equal(d.parts[0].collectionId, "electronics");
  await store.load();
  assert.equal(f.legacyLoads, 1);
  assert.equal(f.row.revision, 1);
});
test("stale revision cannot overwrite a newer item or collection", async () => {
  const f = fixture(),
    store = createWorkspaceStore(f.sql, f.legacy);
  const a = await store.load(),
    b = structuredClone(a);
  a.parts[0].quantity = 4;
  const revision = await store.save(a, a.revision);
  assert.equal(revision, 2);
  b.collections[0].name = "Stale edit";
  await assert.rejects(store.save(b, b.revision), (e) => e.conflict === true);
  assert.equal(f.row.parts[0].quantity, 4);
  assert.equal(f.row.collections[0].name, "Electronics bench");
});
test("invalid hierarchy cannot change stored data", async () => {
  const f = fixture(),
    store = createWorkspaceStore(f.sql, f.legacy);
  const d = await store.load();
  d.collections[0].parentId = "components";
  await assert.rejects(store.save(d, d.revision));
  assert.equal(f.row.revision, 1);
});
