// Compare actual corpus result identities/order against a supplied rollback
// checkout. Run after code changes; never imports provider APIs or secrets.
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const baseline = process.argv[2];
if (!baseline) throw new Error('Provide the verified backup project directory');
const entry = `import { DictionaryIndex, normalize } from './src/lib/dictionary'; export { DictionaryIndex, normalize }; import { createDictionaryEntries } from './src/lib/dictionary-entry-core'; export { createDictionaryEntries }; import { applyMalayRecords } from './src/lib/malay-search'; export { applyMalayRecords };`;
for (const legacy of [true, false]) await build({ stdin: { contents: entry, resolveDir: process.cwd(), sourcefile: 'search-order.ts' }, bundle: true, platform: 'node', format: 'esm', outfile: `.tmp/ultra-fast/order-${legacy ? 'before' : 'after'}.mjs`, plugins: legacy ? [{ name: 'rollback-index', setup(builder) { builder.onLoad({ filter: /src[/\\]lib[/\\](?:dictionary|malay-search)\.ts$/ }, args => ({ contents: readFileSync(resolve(baseline, args.path.endsWith('dictionary.ts') ? 'src/lib/dictionary.ts' : 'src/lib/malay-search.ts'), 'utf8'), loader: 'ts', resolveDir: resolve('src/lib') })); } }] : [] });
const old = await import(pathToFileURL(resolve('.tmp/ultra-fast/order-before.mjs')).href);
const current = await import(pathToFileURL(resolve('.tmp/ultra-fast/order-after.mjs')).href);
const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8'));
const words = current.applyMalayRecords(rows.map(current.createDictionaryEntries(() => null).fromRow), JSON.parse(readFileSync('src/data/malay-runtime.json', 'utf8')));
let normalizedValues = 0;
for (const word of words) for (const value of [word.simplified, word.traditional, word.pinyin, word.numericPinyin, ...word.senses.flatMap(s => [s.english, ...s.english.split(/[;,]/)])]) {
  assert.equal(current.normalize(value), old.normalize(value), `Normalization changed: ${value}`); normalizedValues++;
}
const a = new old.DictionaryIndex(words), b = new current.DictionaryIndex(words);
const queries = new Set(['猫', '狗', '苹果', '学生', '长颈鹿', '不耻下问', 'bank', 'light', 'current', 'spring', 'charge', 'anjing', 'membantu', 'mendidih', 'tidak malu bertanya', 'chang jing lu', 'cháng jǐng lù', 'nv', 'nu:', 'surname', 'to', 'a', 'qzxqzxqzx']);
for (let i = 0; i < words.length; i += 997) {
  const word = words[i]; queries.add(word.simplified); queries.add(word.traditional); queries.add(word.pinyin); queries.add(word.numericPinyin); queries.add(word.senses[0]?.english ?? '');
  for (const query of [word.numericPinyin.slice(0, 3), word.senses[0]?.english.slice(2, 8)]) if (query) queries.add(query);
}
const identity = results => results.map(word => [word.id, word.matchedSenseId, word.matchedLanguage]);
for (const query of queries) assert.deepEqual(identity(b.search(query)), identity(a.search(query)), `Search order changed: ${query}`);
const report = { entries: words.length, senses: words.reduce((n,w)=>n+w.senses.length,0), normalizedValues, queries: queries.size, exactResultOrderParity: true };
writeFileSync('.tmp/ultra-fast/search-order.json', JSON.stringify(report, null, 2)); console.log(report);
