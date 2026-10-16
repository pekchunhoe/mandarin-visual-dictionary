// Lossless column transport. The authoritative, readable runtime stays intact.
import { readFileSync, writeFileSync } from 'node:fs';
import { deepStrictEqual } from 'node:assert';
const asset = JSON.parse(readFileSync('src/data/malay-runtime.json', 'utf8'));
const fields = [...new Set(asset.records.flatMap(Object.keys))];
const frequency = new Map();
for (const record of asset.records) for (const value of Object.values(record)) {
  if (value === null || typeof value === 'number' && value < 0) throw new Error('Unsupported packed Malay value');
  if (typeof value === 'string') frequency.set(value, (frequency.get(value) ?? 0) + 1);
}
const strings = [...frequency].filter(([text, count]) => text.length > 12 && count > 1).map(([text]) => text);
const ids = new Map(strings.map((text, i) => [text, -i - 1]));
const records = asset.records.map(record => fields.map(field => {
  const value = record[field]; return value === undefined ? null : typeof value === 'string' ? ids.get(value) ?? value : value;
}));
const packed = { ...asset, schema: 2, fields, strings, records };
// Independently reconstruct every record before emitting the derived asset.
const restored = records.map(row => Object.fromEntries(fields.flatMap((field, i) => row[i] === null ? [] : [[field, typeof row[i] === 'number' && row[i] < 0 ? strings[-row[i] - 1] : row[i]]])));
deepStrictEqual(restored, asset.records, 'Malay transport round trip failed');
writeFileSync('src/data/malay-runtime-packed.json', JSON.stringify(packed) + '\n');
console.log(`Lossless Malay transport: ${Buffer.byteLength(JSON.stringify(packed))} bytes, ${records.length} records`);
