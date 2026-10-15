import assert from 'node:assert/strict';
import { read, saveJSON, DEEP_ROOT } from './deep-cache.mjs';
const lexical = read(`${DEEP_ROOT}/new-candidates.json`), definitions = read(`${DEEP_ROOT}/protected2-candidates.json`);
assert.equal(lexical.corpusSha256, definitions.corpusSha256);
const records = [...lexical.records, ...definitions.records];
assert.equal(new Set(records.map(r => r.key)).size, records.length);
saveJSON(`${DEEP_ROOT}/combined-candidates.json`, { schema: 1, corpusSha256: lexical.corpusSha256, records });
console.log(JSON.stringify({ lexical: lexical.records.length, definitions: definitions.records.length, combined: records.length }));
