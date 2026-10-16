// @vitest-environment node
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { decodeMalayAsset } from '../src/lib/malay-codec';
it('losslessly restores all 14,761 records and every field, including licensing and review evidence', () => {
  const original = JSON.parse(readFileSync('src/data/malay-runtime.json', 'utf8'));
  const packed = JSON.parse(readFileSync('src/data/malay-runtime-packed.json', 'utf8'));
  const decoded = decodeMalayAsset(packed);
  expect(decoded).toEqual(original);
  expect(decoded.records).toHaveLength(14761);
  expect(decodeMalayAsset(original)).toBe(original);
});
it('rejects unsupported or malformed transport instead of attaching incomplete translations', () => {
  for (const asset of [null, {}, { schema: 3, records: [] }, { schema: 2, records: [[]], fields: ['malay'], strings: [] }, { schema: 2, records: [[-99]], fields: ['malay'], strings: [] }]) expect(() => decodeMalayAsset(asset)).toThrow();
});
