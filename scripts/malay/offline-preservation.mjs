import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { corpus, hash } from './corpus.mjs';
import { qualityIssues, runtimeRecord } from './quality.mjs';
const root = '.tmp/malay-complete';
const read = file => JSON.parse(readFileSync(file, 'utf8'));
const baseline = read(`${root}/baseline.json`);
assert(baseline.backupRoot, 'Record the verified pre-translation project backup first');
const backup = baseline.backupRoot, manifest = read(`${backup}/manifest.json`);
const data = corpus(), store = read('scripts/data/malay-translations-v1.json'), runtime = read('src/data/malay-runtime.json');
const originalStore = read(`${backup}/project/scripts/data/malay-translations-v1.json`);
const originalRuntime = read(`${backup}/project/src/data/malay-runtime.json`);
assert.equal(originalStore.records.length, baseline.baselineRecords);
assert.equal(hash(readFileSync(`${backup}/project/scripts/data/malay-translations-v1.json`)), baseline.storeSha256);
const immutable = ['public/data/cedict.json', 'cedict.txt.gz', 'src/data/learning-runtime.json'];
for (const file of immutable) assert.equal(hash(readFileSync(file)), manifest.files[file].sha256, `Original dictionary changed: ${file}`);
assert.equal(data.digest, baseline.corpusSha256); assert.equal(data.senses.length, baseline.senses);
assert.equal(store.corpusSha256, data.digest); assert.equal(runtime.corpusSha256, data.digest);
assert.equal(runtime.version, store.version); assert.deepEqual(runtime.records, store.records.map(runtimeRecord));
const byKey = new Map(store.records.map(r => [r.key, r])), runtimeByKey = new Map(runtime.records.map(r => [r.key, r]));
assert.equal(byKey.size, store.records.length); assert.equal(runtimeByKey.size, runtime.records.length);
for (const r of originalStore.records) assert.equal(JSON.stringify(byKey.get(r.key)), JSON.stringify(r), 'Original store record changed');
for (const r of originalRuntime.records) assert.equal(JSON.stringify(runtimeByKey.get(r.key)), JSON.stringify(r), 'Original runtime record changed');
const senses = new Map(data.senses.map(s => [s.key, s]));
for (const r of store.records) { assert(senses.has(r.key)); assert.deepEqual(qualityIssues(r, senses.get(r.key)), []); }
const originalKeys = new Set(originalStore.records.map(r => r.key)), added = store.records.filter(r => !originalKeys.has(r.key));
for (const r of added) { assert.equal(r.translationStatus, 'generated'); assert.equal(r.translationQuality, 'automated-review-required'); assert(['lexical-equivalent', 'definition-translation'].includes(r.translationKind)); assert.equal(r.translationConfidence, undefined); }
const originalUncommitted = readFileSync(`${backup}/working-tree.txt`, 'utf8').split(/\r?\n/).filter(line => line.startsWith('?? ')).map(line => line.slice(3));
for (const file of originalUncommitted) assert.equal(hash(readFileSync(file)), manifest.files[file].sha256, `Original uncommitted work changed: ${file}`);
assert.equal(hash(readFileSync('.tmp/malay-datasets/production-before/cedict.json')), baseline.corpusSha256);
assert.equal(hash(readFileSync('.tmp/malay-datasets/production-before/malay-runtime.json')), hash(readFileSync(`${backup}/project/src/data/malay-runtime.json`)));
const report = { pass: true, time: new Date().toISOString(), baselineGitSha: baseline.gitSha, backup, corpusSha256: data.digest,
  senseCount: data.senses.length, entries: data.rows.length, originalTranslationsPreserved: originalStore.records.length,
  originalRuntimeRecordsPreserved: originalRuntime.records.length, originalUncommittedFilesPreserved: originalUncommitted.length,
  newProvisionalRecords: added.length, newLexicalEquivalents: added.filter(r => r.translationKind === 'lexical-equivalent').length,
  newTranslatedDefinitions: added.filter(r => r.translationKind === 'definition-translation').length,
  storedTranslations: store.records.length, remaining: data.senses.length - store.records.length, coveragePercent: store.records.length / data.senses.length * 100,
  independentlyHumanVerified: store.records.filter(r => r.translationStatus === 'verified').length,
  storeSha256: hash(readFileSync('scripts/data/malay-translations-v1.json')), runtimeSha256: hash(readFileSync('src/data/malay-runtime.json')),
  examples: added.filter(r => ['不动产', '研究员', '肾脏', '碳水化合物', '丁'].includes(r.entryId.split('|')[0])).map(r => ({ chinese: r.entryId.split('|')[0], pinyin: senses.get(r.key).pinyin, english: r.english, malay: r.malay, kind: r.translationKind })) };
writeFileSync(`${root}/preservation.json`, JSON.stringify(report, null, 2) + '\n'); console.log(JSON.stringify(report, null, 2));
