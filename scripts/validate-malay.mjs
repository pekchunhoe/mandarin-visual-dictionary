import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { corpus, auditCorpus } from './malay/corpus.mjs';
import { qualityIssues, runtimeRecord } from './malay/quality.mjs';
import { MalaySearchIndex, applyMalayRecords } from '../src/lib/malay-search.ts';
const data = corpus();
const original = gunzipSync(readFileSync('cedict.txt.gz')).toString('utf8').split('\n').flatMap(line => {
  const match = line.trimEnd().match(/^(\S+) (\S+) \[([^\]]+)\] \/(.+)\/$/);
  return match ? [[match[1], match[2], match[3], match[4].split('/')]] : [];
});
assert.deepEqual(data.rows, original, 'Original Chinese, pinyin and English corpus must remain byte-equivalent in value');
const store = JSON.parse(readFileSync('scripts/data/malay-translations-v1.json', 'utf8'));
const runtime = JSON.parse(readFileSync('src/data/malay-runtime.json', 'utf8'));
assert.equal(store.corpusSha256, data.digest);
assert.equal(runtime.corpusSha256, data.digest);
assert.deepEqual(runtime.records, store.records.map(runtimeRecord));
assert.equal(new Set(store.records.map(r => r.key)).size, store.records.length);
assert.equal(new Set(store.records.map(r => `${r.entryId}\t${r.senseId}`)).size, store.records.length);
const senses = new Map(data.senses.map(s => [s.key, s]));
const failures = store.records.flatMap(r => { const sense = senses.get(r.key); const issues = sense ? qualityIssues(r, sense) : ['unknown-sense']; return issues.length ? [{ key: r.key, issues }] : []; });
assert.deepEqual(failures, []);
const rowWords = data.rows.map(([traditional, simplified, numericPinyin, definitions]) => ({
  id: `${simplified}|${traditional}|${numericPinyin}`, traditional, simplified, numericPinyin, pinyin: numericPinyin, source: 'CC-CEDICT',
  senses: definitions.filter(d => !/^CL:/i.test(d)).map((english, i) => ({ id: `sense-${i}`, english: english.replace(/\s*\(CL:[^)]*\)/g, '').trim(), visualType: 'abstract', examples: [] }))
}));
const words = applyMalayRecords(rowWords, runtime);
const index = new MalaySearchIndex(words);
const cases = [['anjing','狗'], ['kucing','猫'], ['membantu','帮助'], ['belajar','学习'], ['sekolah','学校'], ['guru','老师'], ['keberanian','勇气'], ['rendah hati','谦虚'], ['tidak malu bertanya','不耻下问'], ['bantu','帮助'], ['bantuan','帮助'], ['pertolongan','帮助'], ['menolong','帮助'], ['ANJING','狗'], ['  rendah　hati  ','谦虚'], ['anjnig','狗'], ['mendidih','开'], ['tumbuh','长'], ['algoritma','算法'], ['sentiasa','总是']];
const search = cases.map(([query, expected]) => {
  const matches = index.search(query); const word = matches.find(w => w.simplified === expected);
  assert(word, `${query} must retrieve ${expected}`);
  assert(word.senses.find(s => s.id === word.matchedSenseId)?.malay);
  return { query, expected, rank: matches.indexOf(word) + 1, senseId: word.matchedSenseId };
});
const report = { ...auditCorpus(data), validTranslations: store.records.length, rejectedTranslations: failures.length, corpusPreserved: true, automatedSemanticGuarantee: false, index: index.statistics(), search };
writeFileSync('.tmp/malay-qa.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
