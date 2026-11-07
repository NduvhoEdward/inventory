import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateParts, createBackup, readBackup, toCsv } from '../lib/inventory.mjs';
const part = { id: 'one', name: 'Resistor 220Ω', category: 'resistors', quantity: 20, lowStock: 5, location: 'Drawer 1', specs: [{ key: 'Tolerance', value: '5%' }] };

test('JSON backup preserves all component fields and round-trips', () => {
  const parts = [part];
  const backup = createBackup(parts, '2026-11-08T10:00:00.000Z');
  assert.equal(backup.version, 1);
  assert.deepEqual(readBackup(JSON.stringify(backup)), parts);
});
test('empty inventory is a valid backup', () => assert.deepEqual(readBackup(JSON.stringify(createBackup([]))), []));
test('invalid quantities, duplicate IDs, and malformed specs are rejected', () => {
  assert.throws(() => validateParts([{ ...part, quantity: -1 }]));
  assert.throws(() => validateParts([{ ...part, quantity: 1.5 }]));
  assert.throws(() => validateParts([part, part]));
  assert.throws(() => validateParts([{ ...part, specs: [null] }]));
  assert.throws(() => readBackup('{"format":"unknown","version":1,"parts":[]}'));
});
test('CSV quotes commas, quotes, line breaks, and preserves Unicode', () => {
  const csv = toCsv([{ ...part, name: 'Resistor 220Ω, "precision"', location: 'Shelf\nA' }]);
  assert.ok(csv.startsWith('\uFEFFid,name,'));
  assert.ok(csv.includes('"Resistor 220Ω, ""precision"""'));
  assert.ok(csv.includes('"Shelf\nA"'));
});
test('CSV neutralizes spreadsheet formulas', () => {
  const csv = toCsv([{ ...part, name: '=1+1', supplier: '  @formula' }]);
  assert.ok(csv.includes("\"'=1+1\""));
  assert.ok(csv.includes("\"'  @formula\""));
});
