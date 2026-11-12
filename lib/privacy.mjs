export function collectionPrivate(collections, id) {
  const seen = new Set();
  while (id) {
    if (seen.has(id)) return true;
    seen.add(id);
    const c = collections.find((c) => c.id === id);
    if (!c) return true;
    if (
      c.visibility === "private" ||
      (c.id === "garage" && c.visibility !== "public")
    )
      return true;
    id = c.parentId;
  }
  return false;
}
export function publicInventory(data) {
  const collections = data.collections
    .filter((c) => !collectionPrivate(data.collections, c.id))
    .map(({ id, name, parentId }) => ({ id, name, parentId }));
  const ids = new Set(collections.map((c) => c.id));
  const parts = data.parts
    .filter((p) => p.visibility !== "private" && ids.has(p.collectionId))
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      quantity: p.quantity,
      collectionId: p.collectionId,
      pkg: p.pkg || "",
      partNumber: p.partNumber || "",
      datasheetUrl: p.datasheetUrl || "",
      lowStock: p.lowStock ?? 5,
    }));
  return { collections, parts };
}
