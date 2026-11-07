import { validateParts } from './inventory.mjs';

// Dependency injection keeps migration behavior testable without a live database.
export function createPostgresStore(sql, readLegacy) {
  let schemaReady;
  async function ensureSchema() {
    if (!schemaReady) {
      schemaReady = sql.transaction([
        sql`SELECT pg_advisory_xact_lock(1062050936)`,
        sql`CREATE TABLE IF NOT EXISTS bench_inventory (
          id SMALLINT PRIMARY KEY CHECK (id = 1),
          parts JSONB NOT NULL CHECK (jsonb_typeof(parts) = 'array'),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`,
      ]).catch(error => { schemaReady = undefined; throw error; });
    }
    await schemaReady;
  }

  async function load() {
    await ensureSchema();
    const rows = await sql`SELECT parts FROM bench_inventory WHERE id = 1`;
    if (rows.length) return validateParts(rows[0].parts);
    // Never fall back to an empty inventory when the source database fails.
    const parts = validateParts(await readLegacy());
    // Concurrent first requests must never overwrite an inventory already saved.
    await sql`INSERT INTO bench_inventory (id, parts) VALUES (1, ${JSON.stringify(parts)}::jsonb) ON CONFLICT (id) DO NOTHING`;
    const migrated = await sql`SELECT parts FROM bench_inventory WHERE id = 1`;
    if (!migrated.length) throw new Error('Inventory migration did not complete');
    return validateParts(migrated[0].parts);
  }

  async function save(parts) {
    validateParts(parts);
    await load();
    await sql`UPDATE bench_inventory SET parts = ${JSON.stringify(parts)}::jsonb, updated_at = NOW() WHERE id = 1`;
  }

  return { load, save };
}
