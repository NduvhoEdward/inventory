import { getParts } from '../../../lib/storage';
import { createBackup, toCsv } from '../../../lib/inventory.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const format = new URL(request.url).searchParams.get('format') ?? 'json';
  if (!['json', 'csv'].includes(format)) return Response.json({ error: 'Choose JSON or CSV.' }, { status: 400 });
  try {
    const backup = createBackup(await getParts());
    const text = format === 'json' ? JSON.stringify(backup, null, 2) : toCsv(backup.parts);
    return new Response(text, { headers: {
      'Content-Type': format === 'json' ? 'application/json; charset=utf-8' : 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bench-inventory-${backup.exportedAt.slice(0, 10)}.${format}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch {
    return Response.json({ error: 'Could not create a backup. Your saved inventory has not changed.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
