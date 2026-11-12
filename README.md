# My Inventory

A mobile-friendly personal inventory for electronics, tools, equipment and other belongings. Hosted on Vercel with Neon Postgres Free.

## Collections

The overview shows top-level collections, recent items and low stock or overdue maintenance. Start with Electronics bench and Garage; add, rename, nest or move any collection using Add collection, Subcollection, or Edit collection > Inside. Collection views include their descendants. An item belongs to one collection; use its edit form to move it. Storage location is a separate field (for example Garage / Cabinet 2 / Shelf 1).

Delete only empty collections without children. Move their contents elsewhere first. Each device can choose its starting collection in the footer. Search from Overview or All items to search everything; inside a collection search is scoped to that collection and its descendants.

Item forms retain electronics fields and add brand, model, serial number, condition, purchase date, warranty, maintenance date and notes. Low stock and due maintenance appear under Needs attention. Photos and lending tracking are not included.

## Database and migration

Set DATABASE_URL through the Neon integration in Vercel (Free). No credentials belong in this repository. The optional INVENTORY_KV_REST_API_URL / INVENTORY_KV_REST_API_TOKEN variables are only for migrating the former Redis inventory.

The existing bench_inventory singleton row is retained. On first access, additive collections and revision columns are created, existing items are assigned to Electronics bench, and starter collections are inserted atomically only if the collections column is still null. Future starts preserve custom collections and empty inventories. No fake items are created. The original Redis database is not altered. Older clients cannot write through /api/parts after the collections schema exists: refresh those clients.

/api/inventory validates all collection relationships and item destinations. Writes require the last loaded revision; concurrent edits receive HTTP 409 rather than overwriting newer data. Reload and reapply your edit after a conflict. The inventory is stored as JSONB in one row; suitable for a personal inventory, with a relational item model a future option for much larger deployments.

## Backups

Download backup exports all collections and all item fields as version 2 JSON, including empty collections. Export CSV includes readable collection paths and tool details, with spreadsheet formula escaping. Existing version 1 JSON backups remain readable by readWorkspaceBackup; there is no restore/import UI yet. CSV is an item export, not a complete restore format for empty collections.

## Local development

Copy .env.example to .env.local and set your Neon development database URL. Then run npm install and npm run dev. Run npm test and npm run build before publishing. Push main to trigger the existing Vercel deployment.


## Access and privacy

Public visitors receive read-only inventory data. Unlock enables editing and full backups. Any collection or item can be marked Private; descendants of a private collection remain private even if marked public. Garage defaults to private when no visibility is set. Public responses omit locations, serial numbers, notes, specifications and purchase/maintenance details. No inventory records are deleted or rewritten when enabling access controls.

Authentication uses scrypt password hashes stored in Neon, random opaque server sessions, HttpOnly Secure SameSite=Strict host-only cookies, same-origin mutation checks, and database-backed login throttling. Sessions expire after eight hours or 30 days when remembered; Lock revokes the current session. Each hostname requires its own login.

The current inventory table is atomically renamed from bench_inventory to inventory_private on first access. This preserves records and isolates the current data from pre-authentication deployment code that still queries the old table. Do not roll back to a pre-authentication deployment: it cannot load the protected inventory. Existing copies or downloads obtained before privacy was enabled cannot be revoked.

Initial password enrollment uses a one-time random 256-bit setup token held outside the repository; only its SHA-256 digest is deployed. The setup endpoint inserts a singleton password record atomically and cannot replace an existing password. Never commit the setup token or plaintext passphrase. To recover access, the database administrator must reset inventory_auth and revoke inventory_sessions, then deploy a new bootstrap-token digest and enroll again through HTTPS. There is no public password reset flow.
