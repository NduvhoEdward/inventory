const categories = new Set(['leds', 'resistors', 'capacitors', 'transistors', 'ics', 'devboards', 'connectors', 'sensors', 'inductors', 'tools', 'equipment', 'consumables', 'spares', 'other']);

export function validateParts(parts) {
  if (!Array.isArray(parts)) throw new Error('Inventory must be a list of components.');
  const ids = new Set();
  for (const part of parts) {
    if (!part || typeof part !== 'object' || Array.isArray(part)) throw new Error('Invalid component.');
    if (typeof part.id !== 'string' || !part.id.trim() || ids.has(part.id)) throw new Error('Each component needs a unique ID.');
    ids.add(part.id);
    if (typeof part.name !== 'string' || !part.name.trim()) throw new Error('Each component needs a name.');
    if (!categories.has(part.category)) throw new Error('Unknown component category.');
    if (!Number.isSafeInteger(part.quantity) || part.quantity < 0) throw new Error('Quantities must be whole numbers of zero or more.');
    if (part.lowStock != null && (!Number.isSafeInteger(part.lowStock) || part.lowStock < 0)) throw new Error('Low-stock levels must be whole numbers of zero or more.');
    for (const field of ['location', 'pkg', 'supplier', 'partNumber', 'datasheetUrl', 'cost']) {
      if (part[field] != null && typeof part[field] !== 'string') throw new Error(`Invalid ${field} value.`);
    }
    if (part.specs != null && (!Array.isArray(part.specs) || part.specs.some(s => !s || typeof s.key !== 'string' || typeof s.value !== 'string'))) throw new Error('Invalid component specifications.');
  }
  return parts;
}

export function createBackup(parts, exportedAt = new Date().toISOString()) {
  return { format: 'bench-inventory', version: 1, exportedAt, parts: validateParts(parts) };
}

export function readBackup(text) {
  const data = JSON.parse(text);
  if (data?.format !== 'bench-inventory' || data.version !== 1) throw new Error('Unsupported inventory backup.');
  return validateParts(data.parts);
}

export function toCsv(parts) {
  validateParts(parts);
  const fields = ['id', 'name', 'category', 'quantity', 'location', 'pkg', 'supplier', 'partNumber', 'datasheetUrl', 'cost', 'lowStock', 'specs'];
  const cell = value => {
    let text = String(value ?? '');
    // Prevent component text from being interpreted as a spreadsheet formula.
    if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  const rows = parts.map(part => fields.map(field => cell(field === 'specs' ? JSON.stringify(part.specs ?? []) : part[field])).join(','));
  return '\uFEFF' + [fields.join(','), ...rows].join('\r\n') + '\r\n';
}
