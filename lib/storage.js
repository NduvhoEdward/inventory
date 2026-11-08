import { neon } from "@neondatabase/serverless";
import { Redis } from "@upstash/redis";
import { createPostgresStore } from "./postgres-store.mjs";
import { validateParts } from "./inventory.mjs";

function getLegacyClient() {
  const url = process.env.INVENTORY_KV_REST_API_URL;
  const token = process.env.INVENTORY_KV_REST_API_TOKEN;
  if (url || token) {
    if (!url || !token)
      throw new Error("Incomplete legacy database configuration");
    return new Redis({ url, token });
  }
  return Redis.fromEnv();
}

function hasLegacyDatabase() {
  return Boolean(
    process.env.INVENTORY_KV_REST_API_URL ||
    process.env.INVENTORY_KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_URL ||
    process.env.KV_REST_API_TOKEN,
  );
}

async function readLegacy() {
  if (!hasLegacyDatabase()) return [];
  return validateParts((await getLegacyClient().get("parts")) ?? []);
}

let postgresStore;
function getPostgresStore() {
  if (!postgresStore)
    postgresStore = createPostgresStore(
      neon(process.env.DATABASE_URL),
      readLegacy,
    );
  return postgresStore;
}

export async function getParts() {
  if (process.env.DATABASE_URL) return getPostgresStore().load();
  // Allows a safe rollout before the Neon integration is connected.
  return validateParts((await getLegacyClient().get("parts")) ?? []);
}

export async function saveParts(parts) {
  validateParts(parts);
  if (process.env.DATABASE_URL) {
    const error = new Error("Refresh the app to use collections.");
    error.needsUpgrade = true;
    throw error;
  }
  await getLegacyClient().set("parts", parts);
}

let workspaceStore;
async function getWorkspaceStore() {
  if (!process.env.DATABASE_URL)
    throw new Error("Neon is required for collections.");
  if (!workspaceStore) {
    const { createWorkspaceStore } = await import("./workspace-store.mjs");
    workspaceStore = createWorkspaceStore(
      neon(process.env.DATABASE_URL),
      getPostgresStore(),
    );
  }
  return workspaceStore;
}
export async function getInventory() {
  return (await getWorkspaceStore()).load();
}
export async function saveInventory(data, revision) {
  return (await getWorkspaceStore()).save(data, revision);
}
