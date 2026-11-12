import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {
  validateInventory,
  migrateInventory,
  workspaceBackup,
  workspaceCsv,
} from "../lib/workspace.mjs";
import { publicInventory } from "../lib/privacy.mjs";
const item = { id: "p", name: "LED", category: "leds", quantity: 2 };
function route(name, deps = {}) {
  const source = fs
    .readFileSync(
      new URL("../app/api/" + name + "/route.js", import.meta.url),
      "utf8",
    )
    .replace(/^import[\s\S]*?;\r?$/gm, "")
    .replace(/^export const dynamic.*;\r?$/gm, "")
    .replaceAll("export async function", "async function");
  const module = { exports: {} };
  vm.runInNewContext(
    source +
      '\nmodule.exports={...(typeof GET!=="undefined"?{GET}:{}),...(typeof POST!=="undefined"?{POST}:{})};',
    {
      module,
      Response,
      URL,
      Date,
      validateInventory,
      workspaceBackup,
      workspaceCsv,
      publicInventory,
      isOwner: async () => false,
      sameOrigin: () => true,
      ...deps,
    },
  );
  return module.exports;
}
test("public inventory excludes private records and sensitive fields", async () => {
  const data = {
    ...migrateInventory([
      {
        ...item,
        location: "Secret drawer",
        serialNumber: "serial",
        notes: "secret",
      },
    ]),
    revision: 4,
  };
  data.parts.push({ ...item, id: "garage-tool", collectionId: "garage" });
  const h = route("inventory", { getInventory: async () => data });
  const r = await h.GET();
  const d = await r.json();
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.equal(d.owner, false);
  assert.equal(d.revision, undefined);
  assert.equal(d.parts.length, 1);
  assert.equal(d.parts[0].location, undefined);
  assert.ok(!JSON.stringify(d).includes("secret"));
});
test("anonymous writes never access inventory writer", async () => {
  let writes = 0;
  const h = route("inventory", { saveInventory: async () => writes++ });
  assert.equal(
    (
      await h.POST(
        new Request("https://test/api/inventory", {
          method: "POST",
          body: "{}",
        }),
      )
    ).status,
    403,
  );
  assert.equal(writes, 0);
});
test("cross-origin owner writes are rejected", async () => {
  const h = route("inventory", {
    isOwner: async () => true,
    sameOrigin: () => false,
  });
  assert.equal(
    (
      await h.POST(
        new Request("https://test/api/inventory", {
          method: "POST",
          body: "{}",
        }),
      )
    ).status,
    403,
  );
});
test("owner receives full data and saves with revision", async () => {
  const data = { ...migrateInventory([item]), revision: 2 };
  const h = route("inventory", {
    isOwner: async () => true,
    getInventory: async () => data,
    saveInventory: async () => 3,
  });
  assert.deepEqual((await (await h.GET()).json()).parts, data.parts);
  const r = await h.POST(
    new Request("https://test/api/inventory", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  );
  assert.deepEqual(await r.json(), { revision: 3 });
});
test("invalid data, conflicts and outages retain appropriate statuses", async () => {
  const request = (body) =>
    new Request("https://test/api/inventory", {
      method: "POST",
      body: JSON.stringify(body),
    });
  const h = route("inventory", {
    isOwner: async () => true,
    saveInventory: async () => {
      throw Object.assign(Error(), { conflict: true });
    },
  });
  assert.equal((await h.POST(request({}))).status, 400);
  assert.equal(
    (await h.POST(request({ ...migrateInventory([]), revision: 1 }))).status,
    409,
  );
  assert.equal(
    (
      await route("inventory", {
        getInventory: async () => {
          throw Error();
        },
      }).GET()
    ).status,
    503,
  );
});
test("legacy route filters public data and never permits writes", async () => {
  const data = migrateInventory([{ ...item, collectionId: "garage" }]);
  const h = route("parts", { getInventory: async () => data });
  assert.deepEqual(await (await h.GET()).json(), { parts: [] });
  assert.equal((await h.POST()).status, 403);
});
test("backup endpoint requires owner and exports complete private backup", async () => {
  const data = migrateInventory([{ ...item, collectionId: "garage" }]);
  assert.equal(
    (await route("backup").GET(new Request("https://test/api/backup"))).status,
    403,
  );
  const h = route("backup", {
    isOwner: async () => true,
    getInventory: async () => data,
  });
  const r = await h.GET(new Request("https://test/api/backup"));
  assert.deepEqual((await r.json()).parts, data.parts);
  assert.match(r.headers.get("content-disposition"), /attachment/);
  assert.equal(
    (await h.GET(new Request("https://test/api/backup?format=csv"))).status,
    200,
  );
});
