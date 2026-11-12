import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import {
  randomBytes,
  createHash,
  scrypt as derive,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(derive);
const cookieName =
  process.env.NODE_ENV === "production"
    ? "__Host-inventory-session"
    : "inventory-session";
export const digest = (value) =>
  createHash("sha256").update(value).digest("hex");
let ready;
function sql() {
  if (!process.env.DATABASE_URL) throw Error("Database unavailable");
  return neon(process.env.DATABASE_URL);
}
export async function ensureAuth() {
  if (!ready)
    ready = (async () => {
      const db = sql();
      await db`CREATE TABLE IF NOT EXISTS inventory_auth (id INTEGER PRIMARY KEY CHECK(id=1), salt TEXT NOT NULL, hash TEXT NOT NULL)`;
      await db`CREATE TABLE IF NOT EXISTS inventory_sessions (token_hash TEXT PRIMARY KEY, expires_at TIMESTAMPTZ NOT NULL)`;
      await db`CREATE TABLE IF NOT EXISTS inventory_login_limits (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires_at TIMESTAMPTZ NOT NULL)`;
    })().catch((e) => {
      ready = undefined;
      throw e;
    });
  await ready;
}
export function sameOrigin(request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
export async function isOwner() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  await ensureAuth();
  const db = sql();
  return (
    (
      await db`SELECT token_hash FROM inventory_sessions WHERE token_hash=${digest(token)} AND expires_at>NOW()`
    ).length > 0
  );
}
export async function allowedAttempt(request) {
  await ensureAuth();
  const db = sql();
  const ip =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for") ||
    "unknown";
  const key = digest(ip.split(",")[0].trim());
  for (const [bucket, limit] of [
    [key, 10],
    ["global", 200],
  ]) {
    const [row] =
      await db`INSERT INTO inventory_login_limits (key,attempts,expires_at) VALUES (${bucket},1,NOW()+INTERVAL '15 minutes') ON CONFLICT (key) DO UPDATE SET attempts=CASE WHEN inventory_login_limits.expires_at<=NOW() THEN 1 ELSE inventory_login_limits.attempts+1 END, expires_at=CASE WHEN inventory_login_limits.expires_at<=NOW() THEN NOW()+INTERVAL '15 minutes' ELSE inventory_login_limits.expires_at END RETURNING attempts`;
    if (row.attempts > limit) return false;
  }
  return true;
}
export async function setup(token, password) {
  if (
    typeof token !== "string" ||
    digest(token) !==
      "ca2007c12b7ee2a9a461ba650139a813c86c220cfb083b344b08ea3e20b775af"
  )
    return false;
  await ensureAuth();
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)).toString("hex");
  const db = sql();
  return (
    (
      await db`INSERT INTO inventory_auth (id,salt,hash) VALUES (1,${salt},${hash}) ON CONFLICT(id) DO NOTHING RETURNING id`
    ).length > 0
  );
}
export async function login(password, remember) {
  await ensureAuth();
  const db = sql();
  const [auth] = await db`SELECT salt,hash FROM inventory_auth WHERE id=1`;
  if (!auth) return false;
  const hash = await scrypt(password, auth.salt, 64);
  if (!timingSafeEqual(hash, Buffer.from(auth.hash, "hex"))) return false;
  const token = randomBytes(32).toString("hex"),
    seconds = remember ? 2592000 : 28800;
  await db`DELETE FROM inventory_sessions WHERE expires_at<=NOW()`;
  await db`DELETE FROM inventory_login_limits WHERE expires_at<=NOW()`;
  await db`INSERT INTO inventory_sessions (token_hash,expires_at) VALUES (${digest(token)},${new Date(Date.now() + seconds * 1000).toISOString()}::timestamptz)`;
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: seconds,
  });
  return true;
}
export async function logout() {
  const jar = await cookies(),
    token = jar.get(cookieName)?.value;
  if (token) {
    await ensureAuth();
    const db = sql();
    await db`DELETE FROM inventory_sessions WHERE token_hash=${digest(token)}`;
  }
  jar.set(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
