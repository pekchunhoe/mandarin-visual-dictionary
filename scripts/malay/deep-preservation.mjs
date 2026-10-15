import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { corpus, hash } from './corpus.mjs';
import { runtimeRecord, qualityIssues } from './quality.mjs';
import { read, saveJSON, DEEP_ROOT } from './deep-cache.mjs';
const backup = read(`${DEEP_ROOT}/backup.json`), manifest = read(`${backup.root}/manifest.json`), data = corpus();
const baseline = read(`${backup.root}/project/scripts/data/malay-translations-v1.json`), oldRuntime = read(`${backup.root}/project/src/data/malay-runtime.json`);
for (const file of ['scripts/data/malay-translations-v1.json', 'src/data/malay-runtime.json']) assert.equal(hash(readFileSync(`${backup.root}/project/${file}`)), manifest.files[file].sha256, 'Baseline backup changed');
const currentBytes = readFileSync('scripts/data/malay-translations-v1.json'), runtimeBytes = readFileSync('src/data/malay-runtime.json');
const current = JSON.parse(currentBytes), runtime = JSON.parse(runtimeBytes), currentByKey = new Map(current.records.map(r => [r.key, r]));
const runtimeByKey = new Map(runtime.records.map(r => [r.key, r])), senses = new Map(data.senses.map(s => [s.key, s]));
assert.equal(currentByKey.size, current.records.length); assert.equal(data.senses.length, manifest.baseline.senseRecords);
for (const file of ['public/data/cedict.json', 'cedict.txt.gz', 'src/data/learning-runtime.json']) assert.equal(hash(readFileSync(file)), manifest.files[file].sha256);
for (const r of baseline.records) assert.equal(JSON.stringify(currentByKey.get(r.key)), JSON.stringify(r), `Changed old store record ${r.key}`);
for (const r of oldRuntime.records) assert.equal(JSON.stringify(runtimeByKey.get(r.key)), JSON.stringify(r), `Changed old runtime record ${r.key}`);
assert.deepEqual(runtime.records, current.records.map(runtimeRecord));
const originalKeys = new Set(baseline.records.map(r => r.key)), added = current.records.filter(r => !originalKeys.has(r.key));
for (const r of added) {
  assert(senses.has(r.key)); assert.deepEqual(qualityIssues(r, senses.get(r.key)), []);
  assert.equal(r.translationStatus, 'generated'); assert.equal(r.translationQuality, 'automated-review-required');
  assert.equal(r.translationConfidence, undefined); assert.equal(r.translationReviewer, undefined);
  assert(['lexical-equivalent', 'definition-translation'].includes(r.translationKind));
}
const preservedUntracked = readFileSync(`${backup.root}/working-tree.txt`, 'utf8').split(/\r?\n/).filter(l => l.startsWith('?? ')).map(l => l.slice(3));
for (const file of preservedUntracked) assert.equal(hash(readFileSync(file)), manifest.files[file].sha256);
const kinds = records => Object.fromEntries(['lexical-equivalent', 'definition-translation', 'legacy-unspecified'].map(kind => [kind, records.filter(r => (r.translationKind ?? 'legacy-unspecified') === kind).length]));
const report = { pass: true, time: new Date().toISOString(), backup: backup.root, corpusSha256: data.digest, senses: data.senses.length, entries: data.rows.length,
  originalTranslationsPreserved: baseline.records.length, originalRuntimePreserved: oldRuntime.records.length, originalUntrackedFilesPreserved: preservedUntracked.length,
  added: added.length, beforeKinds: kinds(baseline.records), addedKinds: kinds(added), finalKinds: kinds(current.records),
  finalStoredMeanings: current.records.length, remaining: data.senses.length - current.records.length, coveragePercent: current.records.length / data.senses.length * 100,
  independentHumanReviewed: current.records.filter(r => r.translationQuality === 'human-verified').length,
  storeSha256: hash(currentBytes), runtimeSha256: hash(runtimeBytes), storeBytes: currentBytes.length, runtimeBytes: runtimeBytes.length };
saveJSON(`${DEEP_ROOT}/preservation.json`, report); console.log(JSON.stringify(report, null, 2));
