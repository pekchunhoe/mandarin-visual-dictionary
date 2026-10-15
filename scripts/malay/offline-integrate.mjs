import { readFileSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { corpus, hash } from './corpus.mjs';
import { atomicJSON } from './io.mjs';
import { buildMalay } from './pipeline.mjs';
import { qualityIssues } from './quality.mjs';
const read = file => JSON.parse(readFileSync(file, 'utf8'));
export function integrateOffline({ root = '.tmp/malay-complete', promote = false, data = corpus() } = {}) {
  const prepared = read(`${root}/preparation.json`), incoming = read(`${root}/candidates.json`).records;
  const storeFile = 'scripts/data/malay-translations-v1.json', runtimeFile = 'src/data/malay-runtime.json';
  assert.equal(hash(readFileSync(`${root}/candidates.json`)), prepared.candidatesSha256);
  assert.equal(hash(readFileSync('scripts/data/malay-bulk-review-policy.json')), prepared.policySha256);
  assert.equal(hash(readFileSync('scripts/data/malay-offline-review-policy.json')), prepared.offlineReviewPolicySha256);
  assert.equal(hash(readFileSync('scripts/data/malay-offline-templates.json')), prepared.templatesSha256);
  assert.equal(prepared.corpusSha256, data.digest);
  assert.equal(prepared.processedSenses + prepared.baselineRecords, data.senses.length, 'Full corpus inference must finish before integration');
  assert.equal(prepared.usableProvisionalCandidates, incoming.length);
  assert.equal(new Set(incoming.map(r => r.key)).size, incoming.length);
  const beforeStore = readFileSync(storeFile), beforeRuntime = readFileSync(runtimeFile), baseline = JSON.parse(beforeStore);
  const existing = new Map(baseline.records.map(r => [r.key, r])), senses = new Map(data.senses.map(s => [s.key, s]));
  const alreadyApplied = incoming.every(r => JSON.stringify(existing.get(r.key)) === JSON.stringify(r));
  assert(hash(beforeStore) === prepared.baselineStoreSha256 || alreadyApplied, 'Current store changed after queue extraction');
  for (const r of incoming) {
    assert(senses.has(r.key)); assert.deepEqual(qualityIssues(r, senses.get(r.key)), []);
    assert.equal(r.translationStatus, 'generated'); assert.equal(r.translationQuality, 'automated-review-required');
    if (existing.has(r.key)) assert.deepEqual(existing.get(r.key), r, 'Never overwrite an existing translation');
  }
  const dir = `${root}/isolated`; mkdirSync(dir, { recursive: true });
  const checkpointFile = `${dir}/import-checkpoint.json`, stagedFile = `${dir}/store.json`;
  const signature = hash(JSON.stringify([prepared.candidatesSha256, hash(beforeStore)]));
  let checkpoint = existsSync(checkpointFile) ? read(checkpointFile) : { signature, imported: 0, batches: [] };
  let staged;
  if (checkpoint.signature !== signature) {
    // A completed promotion can be revalidated with the new store baseline.
    assert(alreadyApplied); checkpoint = { signature, imported: 0, batches: [] };
  }
  if (checkpoint.imported) {
    assert.equal(hash(readFileSync(`${dir}/${checkpoint.snapshot}`)), checkpoint.stagedSha256, 'Interrupted import snapshot mismatch'); staged = read(`${dir}/${checkpoint.snapshot}`);
  } else { staged = structuredClone(baseline); atomicJSON(stagedFile, staged); }
  const stagedKeys = new Set(staged.records.map(r => r.key));
  while (checkpoint.imported < incoming.length) {
    const batch = incoming.slice(checkpoint.imported, checkpoint.imported + 128);
    for (const r of batch) if (!stagedKeys.has(r.key)) { staged.records.push(r); stagedKeys.add(r.key); }
    checkpoint.imported += batch.length;
    checkpoint.snapshot = `store-${signature.slice(0, 12)}-${checkpoint.imported}.json`;
    atomicJSON(`${dir}/${checkpoint.snapshot}`, staged);
    checkpoint.stagedSha256 = hash(readFileSync(`${dir}/${checkpoint.snapshot}`));
    checkpoint.batches.push({ through: checkpoint.imported, stagedSha256: checkpoint.stagedSha256 }); atomicJSON(checkpointFile, checkpoint);
  }
  atomicJSON(stagedFile, staged);
  copyFileSync(runtimeFile, `${dir}/runtime.json`);
  const { report, asset } = buildMalay(data, stagedFile, `${dir}/runtime.json`, { reports: false });
  const next = read(stagedFile), byKey = new Map(next.records.map(r => [r.key, r]));
  assert.equal(next.records.length, baseline.records.length + incoming.filter(r => !existing.has(r.key)).length);
  assert.equal(report.rejected.length, 0); assert.equal(report.staleCount, 0);
  for (const r of baseline.records) assert.equal(JSON.stringify(byKey.get(r.key)), JSON.stringify(r), 'Original translation changed');
  assert.equal(data.digest, hash(readFileSync('public/data/cedict.json')));
  if (promote && !alreadyApplied) {
    const journal = `${root}/promotion-journal.json`;
    assert(!existsSync(journal) || read(journal).state !== 'pending', 'Restore the paired pre-promotion backup before resuming');
    copyFileSync(storeFile, `${root}/promotion-before-store.json`); copyFileSync(runtimeFile, `${root}/promotion-before-runtime.json`);
    atomicJSON(journal, { state: 'pending', beforeStoreSha256: hash(beforeStore), beforeRuntimeSha256: hash(beforeRuntime), targetVersion: next.version });
    try { atomicJSON(storeFile, next); atomicJSON(runtimeFile, asset); atomicJSON(journal, { state: 'complete', version: next.version }); }
    catch (error) { atomicJSON(storeFile, JSON.parse(beforeStore)); atomicJSON(runtimeFile, JSON.parse(beforeRuntime)); throw error; }
  }
  const result = { promoted: promote, before: baseline.records.length, added: incoming.filter(r => !existing.has(r.key)).length,
    after: next.records.length, preserved: baseline.records.length, missing: data.senses.length - next.records.length,
    coveragePercent: next.records.length / data.senses.length * 100, version: next.version, corpusSha256: data.digest,
    storeSha256: hash(readFileSync(stagedFile)), runtimeSha256: hash(readFileSync(`${dir}/runtime.json`)) };
  atomicJSON(`${root}/integration.json`, result);
  if (promote && !existsSync(`${root}/integration-first.json`)) atomicJSON(`${root}/integration-first.json`, result);
  console.log(JSON.stringify(result, null, 2)); return result;
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/offline-integrate.mjs')) integrateOffline({ promote: process.argv.includes('--promote-local') });
