// @vitest-environment node
import { copyFileSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
// @ts-expect-error Native maintenance ESM.
import { integrateEnrichment } from '../scripts/malay/lexical-enrichment.mjs';
// @ts-expect-error Native maintenance ESM.
import { hash } from '../scripts/malay/corpus.mjs';
function fixture() {
  const dir = mkdtempSync(resolve('.tmp/malay-lexical-import-'));
  const store = readFileSync('scripts/data/malay-translations-v1.json');
  const old = JSON.parse(store.toString()).records.find((r: { translationKind: string; malayLexical?: unknown }) => r.translationKind === 'definition-translation' && !r.malayLexical);
  const evidence = { method: 'test-fixture-only' };
  const candidates = { records: [{ record: { ...old, malayLexical: { text: 'makna ujian', status: 'generated', quality: 'automated-review-required', source: 'test fixture', license: 'MIT', version: 'fixture-only' }, lexicalEvidence: evidence }, previousSha256: hash(JSON.stringify(old)), evidence }] };
  const prep = { ...JSON.parse(readFileSync('scripts/data/malay-lexical-manifest.json', 'utf8')), baselineStoreSha256: hash(store), newlyCovered: 0 };
  copyFileSync('scripts/data/malay-translations-v1.json', `${dir}/baseline-store.json`);
  writeFileSync(`${dir}/candidates.json`, JSON.stringify(candidates) + '\n');
  prep.candidatesSha256 = hash(readFileSync(`${dir}/candidates.json`));
  writeFileSync(`${dir}/preparation.json`, JSON.stringify(prep));
  return { dir, candidates: JSON.parse(readFileSync(`${dir}/candidates.json`, 'utf8')), prep: JSON.parse(readFileSync(`${dir}/preparation.json`, 'utf8')) };
}
function write(f: ReturnType<typeof fixture>) {
  writeFileSync(`${f.dir}/candidates.json`, JSON.stringify(f.candidates) + '\n');
  f.prep.candidatesSha256 = hash(readFileSync(`${f.dir}/candidates.json`));
  writeFileSync(`${f.dir}/preparation.json`, JSON.stringify(f.prep));
}
it('refuses a tampered candidate payload and never writes to the canonical store', () => {
  const f = fixture(), before = hash(readFileSync('scripts/data/malay-translations-v1.json'));
  f.candidates.records[0].record.malayLexical.text = 'wrong sense';
  writeFileSync(`${f.dir}/candidates.json`, JSON.stringify(f.candidates));
  expect(() => integrateEnrichment({ root: f.dir })).toThrow();
  expect(hash(readFileSync('scripts/data/malay-translations-v1.json'))).toBe(before);
});
it('rejects duplicate original sense keys even in a newly hashed batch', () => {
  const f = fixture(); f.candidates.records.push(f.candidates.records[0]); write(f);
  expect(() => integrateEnrichment({ root: f.dir })).toThrow();
});
it('prevents overwriting an existing explanatory meaning', () => {
  const f = fixture(); f.candidates.records[0].record.malay = 'different explanation'; write(f);
  expect(() => integrateEnrichment({ root: f.dir })).toThrow();
});
it('invalidates prepared imports when their bound policy hashes change', () => {
  const f = fixture(); f.prep.sourceSha256['scripts/malay/quality.mjs'] = 'changed';
  writeFileSync(`${f.dir}/preparation.json`, JSON.stringify(f.prep));
  expect(() => integrateEnrichment({ root: f.dir })).toThrow();
});
