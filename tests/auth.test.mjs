import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import * as crypto from "node:crypto";
import { promisify } from "node:util";
function fixture() {
  const sessions = new Map(),
    limits = new Map(),
    jar = new Map();
  const auth = {
    salt: "test-salt",
    hash: crypto.scryptSync("test-passphrase", "test-salt", 64).toString("hex"),
  };
  const db = async (strings, ...v) => {
    const q = strings.join("?");
    if (q.startsWith("CREATE")) return [];
    if (q.startsWith("SELECT salt")) return [auth];
    if (q.startsWith("SELECT token_hash"))
      return sessions.has(v[0]) && sessions.get(v[0]) > Date.now()
        ? [{ token_hash: v[0] }]
        : [];
    if (q.startsWith("INSERT INTO inventory_sessions")) {
      sessions.set(v[0], Date.parse(v[1]));
      return [];
    }
    if (q.startsWith("DELETE FROM inventory_sessions WHERE token_hash")) {
      sessions.delete(v[0]);
      return [];
    }
    if (q.startsWith("DELETE")) return [];
    if (q.startsWith("INSERT INTO inventory_login_limits")) {
      const count = (limits.get(v[0]) || 0) + 1;
      limits.set(v[0], count);
      return [{ attempts: count }];
    }
    throw Error("Unexpected query");
  };
  const source = fs
    .readFileSync(new URL("../lib/auth.js", import.meta.url), "utf8")
    .replace(/^import[\s\S]*?;\r?$/gm, "")
    .replaceAll("export async function", "async function")
    .replaceAll("export function", "function")
    .replaceAll("export const", "const");
  const module = { exports: {} };
  vm.runInNewContext(
    source +
      "\nmodule.exports={isOwner,login,logout,allowedAttempt,sameOrigin,setup};",
    {
      module,
      Buffer,
      Date,
      process: { env: { NODE_ENV: "production", DATABASE_URL: "test" } },
      neon: () => db,
      cookies: async () => ({
        get: (n) => jar.get(n),
        set: (n, value, options) => jar.set(n, { value, options }),
      }),
      promisify,
      randomBytes: crypto.randomBytes,
      createHash: crypto.createHash,
      derive: crypto.scrypt,
      timingSafeEqual: crypto.timingSafeEqual,
      URL,
    },
  );
  return { ...module.exports, jar, sessions };
}
test("password verification, secure cookies, server session validation and logout", async () => {
  const f = fixture();
  assert.equal(await f.isOwner(), false);
  assert.equal(await f.login("wrong", false), false);
  assert.equal(await f.login("test-passphrase", false), true);
  const cookie = f.jar.get("__Host-inventory-session");
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.secure, true);
  assert.equal(cookie.options.sameSite, "strict");
  assert.equal(await f.isOwner(), true);
  await f.logout();
  assert.equal(await f.isOwner(), false);
  assert.equal(f.sessions.size, 0);
});
test("forged and expired sessions do not unlock", async () => {
  const f = fixture();
  f.jar.set("__Host-inventory-session", { value: "a".repeat(64) });
  assert.equal(await f.isOwner(), false);
  await f.login("test-passphrase", false);
  for (const key of f.sessions.keys()) f.sessions.set(key, 0);
  assert.equal(await f.isOwner(), false);
});
test("login attempts are limited across requests and origin is checked", async () => {
  const f = fixture();
  const req = new Request("https://test/api/auth", {
    headers: { Origin: "https://test", "x-vercel-forwarded-for": "192.0.2.1" },
  });
  for (let i = 0; i < 10; i++) assert.equal(await f.allowedAttempt(req), true);
  assert.equal(await f.allowedAttempt(req), false);
  assert.equal(f.sameOrigin(req), true);
  assert.equal(
    f.sameOrigin(
      new Request("https://test/api/auth", {
        headers: { Origin: "https://evil.test" },
      }),
    ),
    false,
  );
  assert.equal(await f.setup("wrong-token", "test"), false);
});
