import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

function getClient() {
  // The recovery database uses its own Vercel integration prefix.
  // Keep the original environment setup available for other installations.
  const url = process.env.INVENTORY_KV_REST_API_URL;
  const token = process.env.INVENTORY_KV_REST_API_TOKEN;
  if (url || token) {
    if (!url || !token) throw new Error('Incomplete inventory database configuration');
    return new Redis({ url, token });
  }
  return Redis.fromEnv();
}

export async function GET() {
  try {
    const redis = getClient();
    const parts = await redis.get('parts');
    return Response.json({ parts: parts || null });
  } catch (err) {
    return Response.json({ error: 'Could not reach the database. Check your Upstash environment variables.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const redis = getClient();
    const body = await request.json();
    if (!Array.isArray(body.parts)) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }
    await redis.set('parts', body.parts);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: 'Could not reach the database. Check your Upstash environment variables.' }, { status: 500 });
  }
}
