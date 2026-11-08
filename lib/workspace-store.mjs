import { migrateInventory, validateInventory } from "./workspace.mjs";
export function createWorkspaceStore(sql, legacyStore) {
  let ready;
  async function ensure() {
    if (!ready)
      ready = (async () => {
        await legacyStore.load();
        await sql`ALTER TABLE bench_inventory ADD COLUMN IF NOT EXISTS collections JSONB, ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 0`;
        const rows =
          await sql`SELECT parts, collections FROM bench_inventory WHERE id=1`;
        if (rows[0].collections === null) {
          const initial = migrateInventory(rows[0].parts);
          await sql`UPDATE bench_inventory SET parts=${JSON.stringify(initial.parts)}::jsonb, collections=${JSON.stringify(initial.collections)}::jsonb, revision=revision+1 WHERE id=1 AND collections IS NULL`;
        }
      })().catch((e) => {
        ready = undefined;
        throw e;
      });
    await ready;
  }
  async function load() {
    await ensure();
    const [row] =
      await sql`SELECT parts, collections, revision FROM bench_inventory WHERE id=1`;
    return { ...validateInventory(row), revision: row.revision };
  }
  async function save(data, revision) {
    const clean = validateInventory(data);
    if (!Number.isSafeInteger(revision) || revision < 0)
      throw new Error("Invalid revision.");
    await ensure();
    const rows =
      await sql`UPDATE bench_inventory SET parts=${JSON.stringify(clean.parts)}::jsonb, collections=${JSON.stringify(clean.collections)}::jsonb, revision=revision+1, updated_at=NOW() WHERE id=1 AND revision=${revision} RETURNING revision`;
    if (!rows.length) {
      const error = new Error(
        "Inventory changed in another session. Reload before saving.",
      );
      error.conflict = true;
      throw error;
    }
    return rows[0].revision;
  }
  return { load, save };
}
