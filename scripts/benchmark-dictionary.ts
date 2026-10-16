import { readFileSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { DictionaryIndex } from '../src/lib/dictionary';
import { fromRow, type RawRow } from '../src/lib/dictionary-entry';
import { createDictionaryEntries } from '../src/lib/dictionary-entry-core';
import { applyMalayRecords, type MalayAsset } from '../src/lib/malay-search';
import { decodeMalayAsset } from '../src/lib/malay-codec';
const rows: RawRow[] = JSON.parse(readFileSync('public/data/cedict.json', 'utf8'));
const started = performance.now();
const lightweight = createDictionaryEntries(() => null);
const packed = process.argv.includes('--packed');
const index = new DictionaryIndex(applyMalayRecords(rows.map(lightweight.fromRow), decodeMalayAsset(JSON.parse(readFileSync(packed ? 'src/data/malay-runtime-packed.json' : 'src/data/malay-runtime.json', 'utf8'))) as MalayAsset));
const builtMs = performance.now() - started;
const rowMap = new Map(rows.map(row => [`${row[1]}|${row[0]}|${row[2]}`, row]));
const visualCache = new Map();
const samples: Record<string, number[]> = {};
for (let repeat = 0; repeat < 8; repeat++) for (const query of ['猫', 'chang jing lu', 'dog', 'help', 'anjing', 'membantu', 'tidak malu bertanya', 'qzxqzxqzx']) {
  const start = performance.now();
  for (const word of index.search(query)) if (!visualCache.has(word.id)) visualCache.set(word.id, fromRow(rowMap.get(word.id)!));
  (samples[query] ??= []).push(performance.now() - start);
}
const result = { builtMs, heapUsedBytes: process.memoryUsage().heapUsed, rssBytes: process.memoryUsage().rss, queries: Object.fromEntries(Object.entries(samples).map(([q, times]) => [q, { medianMs: times.sort((a, b) => a - b)[4], maxMs: Math.max(...times) }])) };
if (globalThis.gc) { globalThis.gc(); Object.assign(result, { retainedHeapBytes: process.memoryUsage().heapUsed, retainedRssBytes: process.memoryUsage().rss }); }
writeFileSync(process.argv[2] ?? '.tmp/dictionary-benchmark.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
