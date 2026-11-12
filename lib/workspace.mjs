import { validateParts } from "./inventory.mjs";

export const starterCollections = [
  { id: "electronics", name: "Electronics bench", parentId: null },
  { id: "garage", name: "Garage", parentId: null },
  ...[
    ["components", "Components"],
    ["test-equipment", "Test equipment"],
    ["boards", "Development boards"],
    ["cables", "Cables"],
  ].map(([id, name]) => ({ id, name, parentId: "electronics" })),
  ...[
    ["hand-tools", "Hand tools"],
    ["power-tools", "Power tools"],
    ["equipment", "Equipment"],
    ["consumables", "Consumables"],
    ["spares", "Spare parts"],
  ].map(([id, name]) => ({ id, name, parentId: "garage" })),
];
export function migrateInventory(parts) {
  return {
    collections: structuredClone(starterCollections),
    parts: validateParts(parts).map((p) => ({
      ...p,
      collectionId: p.collectionId ?? "electronics",
    })),
  };
}
export function collectionPath(collections, id) {
  const path = [];
  const seen = new Set();
  while (id && !seen.has(id)) {
    seen.add(id);
    const c = collections.find((c) => c.id === id);
    if (!c) break;
    path.unshift(c.name);
    id = c.parentId;
  }
  return path.join(" / ");
}
export function descendantIds(collections, id) {
  const ids = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of collections)
      if (ids.has(c.parentId) && !ids.has(c.id)) {
        if (
          c.visibility != null &&
          !["public", "private"].includes(c.visibility)
        )
          throw new Error("Invalid collection visibility.");
        ids.add(c.id);
        changed = true;
      }
  }
  return ids;
}
export function validateInventory(data) {
  if (
    !data ||
    !Array.isArray(data.collections) ||
    data.collections.length > 1000
  )
    throw new Error("Invalid collections.");
  const ids = new Set();
  for (const c of data.collections) {
    if (
      !c ||
      typeof c.id !== "string" ||
      !c.id.trim() ||
      ["home", "all"].includes(c.id) ||
      ids.has(c.id) ||
      typeof c.name !== "string" ||
      !c.name.trim() ||
      c.name.length > 120 ||
      !(c.parentId === null || typeof c.parentId === "string")
    )
      throw new Error("Invalid collection.");
    if (c.visibility != null && !["public", "private"].includes(c.visibility))
      throw new Error("Invalid collection visibility.");
    ids.add(c.id);
  }
  for (const c of data.collections) {
    const seen = new Set([c.id]);
    let parent = c.parentId;
    while (parent !== null) {
      if (!ids.has(parent) || seen.has(parent))
        throw new Error("Invalid collection hierarchy.");
      seen.add(parent);
      parent = data.collections.find((c) => c.id === parent).parentId;
    }
    if (
      data.collections.some(
        (other) =>
          other.id !== c.id &&
          other.parentId === c.parentId &&
          other.name.trim().toLowerCase() === c.name.trim().toLowerCase(),
      )
    )
      throw new Error("A collection with that name already exists here.");
  }
  validateParts(data.parts);
  for (const part of data.parts) {
    if (
      part.visibility != null &&
      !["public", "private"].includes(part.visibility)
    )
      throw new Error("Invalid item visibility.");
    if (!ids.has(part.collectionId))
      throw new Error("Choose a valid collection for every item.");
    for (const key of [
      "notes",
      "brand",
      "model",
      "serialNumber",
      "condition",
      "purchaseDate",
      "warrantyUntil",
      "maintenanceDue",
      "createdAt",
    ])
      if (part[key] != null && typeof part[key] !== "string")
        throw new Error("Invalid item detail.");
    if (part.datasheetUrl && !/^https?:\/\//i.test(part.datasheetUrl))
      throw new Error("Links must begin with http:// or https://.");
    for (const key of ["purchaseDate", "warrantyUntil", "maintenanceDue"])
      if (part[key] && !/^\d{4}-\d{2}-\d{2}$/.test(part[key]))
        throw new Error("Invalid date.");
  }
  return { collections: data.collections, parts: data.parts };
}
export function workspaceBackup(data) {
  return {
    format: "bench-inventory",
    version: 2,
    exportedAt: new Date().toISOString(),
    ...validateInventory(data),
  };
}
export function readWorkspaceBackup(text) {
  const data = JSON.parse(text);
  if (data?.format !== "bench-inventory")
    throw new Error("Unsupported backup.");
  if (data.version === 1) return migrateInventory(data.parts);
  if (data.version !== 2) throw new Error("Unsupported backup.");
  return validateInventory(data);
}
export function workspaceCsv(data) {
  validateInventory(data);
  const extra = [
    "collection",
    "brand",
    "model",
    "serialNumber",
    "condition",
    "purchaseDate",
    "warrantyUntil",
    "maintenanceDue",
    "notes",
    "createdAt",
  ];
  // Use the same quoting and formula protection for every added field.
  const cell = (v) =>
    '"' +
    (/^[\s]*[=+@-]/.test(String(v ?? "")) ? "'" : "") +
    String(v ?? "").replaceAll('"', '""') +
    '"';
  const fields = [
    "id",
    "name",
    "category",
    "quantity",
    "location",
    "pkg",
    "supplier",
    "partNumber",
    "datasheetUrl",
    "cost",
    "lowStock",
    "specs",
    ...extra,
  ];
  return (
    "\uFEFF" +
    fields.join(",") +
    "\r\n" +
    data.parts
      .map((p) =>
        fields
          .map((f) =>
            cell(
              f === "collection"
                ? collectionPath(data.collections, p.collectionId)
                : f === "specs"
                  ? JSON.stringify(p.specs ?? [])
                  : p[f],
            ),
          )
          .join(","),
      )
      .join("\r\n") +
    "\r\n"
  );
}
