import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { validateParts, createBackup, toCsv } from '../lib/inventory.mjs';
const part = { id: 'p1', name: 'ESP32', category: 'devboards', quantity: 2 };
function route(file, dependencies) {
  const source = fs.readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import .*;\r?$/gm, '')
    .replace(/^export const dynamic.*;\r?$/gm, '')
    .replaceAll('export async function', 'async function');
  const module = { exports: {} };
  vm.runInNewContext(source + '\nmodule.exports = { GET, ...(typeof POST === "function" ? {POST} : {}) };', {module, Response, URL, Date, validateParts, createBackup, toCsv, ...dependencies});
  return module.exports;
}

test('parts route returns fresh inventory with caching disabled', async () => {
  const handlers = route('../app/api/parts/route.js', {getParts: async () => [part]});
  const res = await handlers.GET();
  assert.equal(res.status, 200); assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await res.json(), {parts:[part]});
});
test('invalid JSON and invalid parts never call the database writer', async () => {
  let writes = 0;
  const handlers = route('../app/api/parts/route.js', {saveParts: async () => { writes++; }});
  for (const body of ['{', JSON.stringify({parts:[{...part, quantity:-1}]})]) {
    const res = await handlers.POST(new Request('http://localhost/api/parts', {method:'POST', body}));
    assert.equal(res.status, 400);
  }
  assert.equal(writes, 0);
});
test('save success and database failure return distinct statuses', async () => {
  let saved;
  const good = route('../app/api/parts/route.js', {saveParts: async parts => { saved=parts; }});
  const res = await good.POST(new Request('http://localhost/api/parts', {method:'POST', body:JSON.stringify({parts:[part]})}));
  assert.equal(res.status, 200); assert.deepEqual(saved, [part]);
  const bad = route('../app/api/parts/route.js', {saveParts: async () => { throw new Error('outage'); }});
  assert.equal((await bad.POST(new Request('http://localhost/api/parts', {method:'POST', body:'{"parts":[]}'}))).status, 503);
});
test('JSON download is a full lossless attachment', async () => {
  const handlers = route('../app/api/backup/route.js', {getParts: async () => [part]});
  const res = await handlers.GET(new Request('http://localhost/api/backup?format=json'));
  assert.equal(res.status, 200); assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.match(res.headers.get('content-disposition'), /^attachment; filename="bench-inventory-.*\.json"$/);
  const data = await res.json(); assert.equal(data.format,'bench-inventory'); assert.deepEqual(data.parts,[part]);
});
test('CSV downloads have the correct content type and reject unknown formats', async () => {
  const handlers = route('../app/api/backup/route.js', {getParts: async () => [part]});
  const csv = await handlers.GET(new Request('http://localhost/api/backup?format=csv'));
  assert.match(csv.headers.get('content-type'), /^text\/csv/); assert.ok((await csv.text()).includes('ESP32'));
  assert.equal((await handlers.GET(new Request('http://localhost/api/backup?format=unknown'))).status,400);
});
test('failed backup does not produce a misleading empty attachment', async () => {
  const handlers = route('../app/api/backup/route.js', {getParts: async () => {throw new Error('outage');}});
  const res = await handlers.GET(new Request('http://localhost/api/backup'));
  assert.equal(res.status,503); assert.equal(res.headers.get('content-disposition'),null);
});
