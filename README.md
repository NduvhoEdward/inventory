# Bench Inventory

Personal electronics components inventory, built with Next.js and Neon PostgreSQL.
The website stays on GitHub + Vercel, with a shared inventory on phone and desktop.

## Features

- Add/edit components, quantities, storage locations, suppliers, datasheets, and custom specs.
- Search across component details; filter categories and stock status; sort by name, quantity, or location.
- Phone-friendly controls and part forms; keyboard focus management.
- Download a complete JSON backup or a spreadsheet-friendly CSV export. Exports include all components even when the screen is filtered.
- Failed database requests never replace your inventory with sample data. Failed saves preserve form entries for retry.

## Database setup

Use the **Neon Free** integration in the Vercel project's Storage page. Connect it
to Production and Preview without a custom prefix, so it supplies `DATABASE_URL`.
Keep the plan Free; no payment method or paid plan is required for this setup.

The application creates its `bench_inventory` table on the first database request.
Component records retain their original fields inside PostgreSQL JSONB.

### Migration from Upstash

If `DATABASE_URL` is present and Neon has no inventory row, the app reads the old
Redis `parts` key and inserts it into Neon. The existing Vercel source variables are
`INVENTORY_KV_REST_API_URL` and `INVENTORY_KV_REST_API_TOKEN`. Original
`UPSTASH_REDIS_REST_*` or `KV_REST_API_*` names also remain supported.

Migration never deletes or writes to the legacy database. A failed source read
stops migration rather than creating an empty inventory. Concurrent initialization
cannot overwrite an already initialized Neon inventory. Once the Neon row exists,
all reads and writes use Neon, even if the old Upstash database becomes unavailable.
If Neon fails, the app reports an error rather than silently switching datasets.

Without `DATABASE_URL`, the existing Redis backend continues working, allowing
safe deployment before connecting the Neon integration.

## Downloadable backups

**Download backup** saves a JSON file with format `bench-inventory`, version `1`,
an export timestamp, and every component with its full specifications. Keep a copy
on your computer or another storage location you control. **Export CSV** makes a
spreadsheet-friendly copy with Unicode support and formula-safe text cells.
JSON is the lossless backup format; CSV is intended for viewing in spreadsheets.

Free cloud plans have usage limits and may change their policies. Neon suspends
idle compute and automatically resumes on demand; archived branches also restore
automatically. Download independent backups after substantial inventory changes.

## Local development

```powershell
npm install
Copy-Item .env.example .env.local
# Fill DATABASE_URL in .env.local with your own Neon connection string.
npm run dev
```

Open http://localhost:3000. Never commit `.env.local`, database connection strings,
or tokens. The production URL remains https://inventory-eta-seven.vercel.app/.

## Validation

```powershell
npm test
npm run build
```

Tests cover lossless backups, CSV escaping, invalid records, migration failures,
concurrent initialization, and independence from the old database after migration.
