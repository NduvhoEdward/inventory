import { test } from "node:test";
import assert from "node:assert/strict";
import { publicInventory, collectionPrivate } from "../lib/privacy.mjs";
import { migrateInventory } from "../lib/workspace.mjs";
test("private parents protect public children and private items remain hidden", () => {
  const d = migrateInventory([]);
  d.collections.push({
    id: "child",
    name: "Child",
    parentId: "garage",
    visibility: "public",
  });
  d.parts = [
    {
      id: "tool",
      name: "Tool",
      category: "tools",
      quantity: 1,
      collectionId: "child",
    },
    {
      id: "secret",
      name: "Secret",
      category: "other",
      quantity: 1,
      collectionId: "electronics",
      visibility: "private",
    },
  ];
  assert.equal(publicInventory(d).parts.length, 0);
  assert.equal(collectionPrivate(d.collections, "child"), true);
  d.collections.find((c) => c.id === "garage").visibility = "public";
  assert.equal(publicInventory(d).parts.length, 1);
});
test("private electronics subcollection can hide records without changing their data", () => {
  const d = migrateInventory([]);
  d.collections.find((c) => c.id === "components").visibility = "private";
  d.parts = [
    {
      id: "p",
      name: "Part",
      category: "other",
      quantity: 7,
      collectionId: "components",
    },
  ];
  const before = JSON.stringify(d);
  assert.equal(publicInventory(d).parts.length, 0);
  assert.equal(JSON.stringify(d), before);
});
