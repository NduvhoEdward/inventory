import { test } from "node:test";
import assert from "node:assert/strict";
import {
  migrateInventory,
  validateInventory,
  descendantIds,
  collectionPath,
  workspaceBackup,
  readWorkspaceBackup,
  workspaceCsv,
} from "../lib/workspace.mjs";
const part = {
  id: "old",
  name: "Resistor",
  category: "resistors",
  quantity: 10,
  location: "Drawer 1",
  specs: [],
};
test("migration preserves every original field and assigns electronics", () => {
  const d = migrateInventory([part]);
  assert.deepEqual(d.parts, [{ ...part, collectionId: "electronics" }]);
  assert.ok(d.collections.some((c) => c.id === "garage"));
  validateInventory(d);
});
test("arbitrary nested collections and paths work", () => {
  const d = migrateInventory([]);
  d.collections.push(
    { id: "wood", name: "Woodworking", parentId: "garage" },
    { id: "saws", name: "Saws", parentId: "wood" },
  );
  validateInventory(d);
  assert.ok(descendantIds(d.collections, "garage").has("saws"));
  assert.equal(
    collectionPath(d.collections, "saws"),
    "Garage / Woodworking / Saws",
  );
});
test("cycles, orphans, duplicate names and missing item destinations are rejected", () => {
  const d = migrateInventory([part]);
  for (const update of [
    (x) => (x.collections[0].parentId = "components"),
    (x) => (x.collections[0].parentId = "missing"),
    (x) =>
      x.collections.push({ id: "duplicate", name: "garage", parentId: null }),
    (x) => (x.parts[0].collectionId = "missing"),
  ]) {
    const copy = structuredClone(d);
    update(copy);
    assert.throws(() => validateInventory(copy));
  }
});
test("renaming and moving collections preserve item ownership", () => {
  const d = migrateInventory([part]);
  d.collections.find((c) => c.id === "electronics").name = "Workshop";
  d.collections.find((c) => c.id === "electronics").parentId = "garage";
  validateInventory(d);
  assert.equal(
    collectionPath(d.collections, d.parts[0].collectionId),
    "Garage / Workshop",
  );
});
test("v2 backup preserves collections, tool details and empty collections; v1 remains readable", () => {
  const d = migrateInventory([part]);
  Object.assign(d.parts[0], {
    brand: "Example",
    notes: "Keep dry",
    maintenanceDue: "2027-01-01",
  });
  assert.deepEqual(readWorkspaceBackup(JSON.stringify(workspaceBackup(d))), d);
  assert.deepEqual(
    readWorkspaceBackup(
      JSON.stringify({ format: "bench-inventory", version: 1, parts: [part] }),
    ),
    migrateInventory([part]),
  );
});
test("CSV includes collection paths and neutralizes formulas in tool fields", () => {
  const d = migrateInventory([part]);
  d.parts[0].brand = "=SUM(1)";
  const csv = workspaceCsv(d);
  assert.ok(csv.includes("Electronics bench"));
  assert.ok(csv.includes('"\'=SUM(1)"'));
  assert.ok(csv.includes("maintenanceDue"));
});
