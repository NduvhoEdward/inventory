import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPostgresStore } from '../lib/postgres-store.mjs';
const part = { id: 'p1', name: 'ESP32', category: 'devboards', quantity: 2 };

function database(initial) {
  let parts = initial;
  let failSchema = false;
  let beforeInsert;
  const statements = [];
  const sql = (strings, ...values) => {
    const text = strings.join('?');
    return { text, values, then(resolve, reject) { return execute(text, values).then(resolve, reject); } };
  };
  async function execute(text, values) {
    statements.push(text);
    if (text.includes('CREATE TABLE') && failSchema) { failSchema = false; throw new Error('Temporary outage'); }
    if (text.startsWith('SELECT parts')) return parts === undefined ? [] : [{ parts: structuredClone(parts) }];
    if (text.startsWith('INSERT')) { if (beforeInsert) beforeInsert(); if (parts === undefined) parts = JSON.parse(values[0]); }
    if (text.startsWith('UPDATE')) parts = JSON.parse(values[0]);
    return [];
  }
  sql.transaction = async queries => { const results = []; for (const query of queries) results.push(await query); return results; };
  return {sql, statements, get parts(){return parts;}, set parts(value){parts=value;}, set failSchema(value){failSchema=value;}, set beforeInsert(value){beforeInsert=value;} };
}

test('first load migrates all legacy parts once', async () => {
  const db = database(); let reads = 0;
  const store = createPostgresStore(db.sql, async () => { reads++; return [part]; });
  assert.deepEqual(await store.load(), [part]);
  assert.deepEqual(await store.load(), [part]);
  assert.equal(reads, 1);
});
test('an initialized Neon inventory is independent of Upstash, including empty inventory', async () => {
  const db = database([]);
  const store = createPostgresStore(db.sql, async () => { throw new Error('Archived Upstash'); });
  assert.deepEqual(await store.load(), []);
  await store.save([part]); assert.deepEqual(db.parts, [part]);
});
test('failed legacy read never initializes an empty Neon row', async () => {
  const db = database();
  const store = createPostgresStore(db.sql, async () => { throw new Error('Source unavailable'); });
  await assert.rejects(store.load(), /Source unavailable/);
  assert.equal(db.parts, undefined);
  assert.ok(!db.statements.some(s => s.startsWith('INSERT')));
});
test('migration does not overwrite a concurrent save', async () => {
  const db = database(); const current = [{ ...part, quantity: 15 }];
  db.beforeInsert = () => { db.parts = current; };
  const store = createPostgresStore(db.sql, async () => [part]);
  assert.deepEqual(await store.load(), current);
});
test('schema initialization retries after a transient failure', async () => {
  const db = database([]); db.failSchema = true;
  const store = createPostgresStore(db.sql, async () => []);
  await assert.rejects(store.load(), /Temporary outage/);
  assert.deepEqual(await store.load(), []);
});
test('invalid inventory cannot overwrite saved data', async () => {
  const db = database([part]);
  const store = createPostgresStore(db.sql, async () => []);
  await assert.rejects(store.save([{ ...part, quantity: -4 }]));
  assert.deepEqual(db.parts, [part]);
});
