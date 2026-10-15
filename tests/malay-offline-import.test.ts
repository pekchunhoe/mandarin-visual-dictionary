// @vitest-environment node
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it, vi } from 'vitest';
// @ts-expect-error Native ESM maintenance module.
import { corpus, hash } from '../scripts/malay/corpus.mjs';
// @ts-expect-error Native ESM maintenance module.
import { integrateOffline } from '../scripts/malay/offline-integrate.mjs';
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
it('stages a complete workload idempotently, preserves every existing record, and rejects incomplete or changed batches', () => {
  const root = mkdtempSync(resolve('.tmp/malay-offline-import-'));
  const storePath = 'scripts/data/malay-translations-v1.json';
  const original = readFileSync(storePath), runtime = readFileSync('src/data/malay-runtime.json');
  const data = corpus(), store = JSON.parse(original.toString());
  const keys = new Set(store.records.map((r: { key: string }) => r.key));
  const sense = data.senses.find((s: { key: string; idiom: boolean }) => !keys.has(s.key) && !s.idiom);
  const candidate = { ...sense, malay: 'makna ujian', translationStatus: 'generated', translationQuality: 'automated-review-required', translationKind: 'definition-translation', translationSource: 'Test fixture only', translationLicense: 'CC-BY-SA-4.0', translationVersion: 'test-only' };
  writeFileSync(`${root}/candidates.json`, JSON.stringify({ records: [candidate] }));
  const prepared = { candidatesSha256: hash(readFileSync(`${root}/candidates.json`)), policySha256: hash(readFileSync('scripts/data/malay-bulk-review-policy.json')), offlineReviewPolicySha256: hash(readFileSync('scripts/data/malay-offline-review-policy.json')), templatesSha256: hash(readFileSync('scripts/data/malay-offline-templates.json')), corpusSha256: data.digest, baselineStoreSha256: hash(original), baselineRecords: store.records.length, processedSenses: data.senses.length - store.records.length, usableProvisionalCandidates: 1 };
  writeFileSync(`${root}/preparation.json`, JSON.stringify(prepared));
  vi.spyOn(console, 'log').mockImplementation(() => {});
  try {
    const first = integrateOffline({ root, data }); const second = integrateOffline({ root, data });
    expect(first.added).toBe(1); expect(second).toEqual(first);
    const isolated = read(`${root}/isolated/store.json`);
    const byKey = new Map(isolated.records.map((r: { key: string }) => [r.key, r]));
    for (const r of store.records) expect(byKey.get(r.key)).toEqual(r);
    expect(hash(readFileSync(storePath))).toBe(hash(original)); expect(hash(readFileSync('src/data/malay-runtime.json'))).toBe(hash(runtime));
    writeFileSync(`${root}/preparation.json`, JSON.stringify({ ...prepared, processedSenses: 1 }));
    expect(() => integrateOffline({ root, data })).toThrow('Full corpus inference must finish');
    writeFileSync(`${root}/preparation.json`, JSON.stringify(prepared));
    writeFileSync(`${root}/candidates.json`, JSON.stringify({ records: [{ ...candidate, senseId: 'sense-wrong' }] }));
    expect(() => integrateOffline({ root, data })).toThrow();
  } finally { vi.restoreAllMocks(); }
}, 60000);
