// @vitest-environment node
import { expect, it } from 'vitest';
// @ts-expect-error Native ESM maintenance module.
import { qualifyOffline } from '../scripts/malay/offline-quality.mjs';
// @ts-expect-error Native ESM maintenance module.
import { runtimeRecord } from '../scripts/malay/quality.mjs';
const task = { key: 'exact-id', entryId: '河岸|河岸|he2 an4', senseId: 'sense-0', english: 'riverbank', input: 'riverbank', inferenceKey: 'context-id', synset: 'test-n', referenceTerms: ['tebing sungai'], partOfSpeech: 'n', idiom: false };
const model = { model: 'HPLT/translate-en-ms-v2.0-hplt_opus', revision: 'pinned', license: 'CC-BY-4.0', beamSize: 4 };
const policy = { excludedSynsets: {}, excludedTerms: {}, excludedEnglishMalay: {}, allowedBareVerbs: [] };
const output = { key: task.key, inferenceKey: task.inferenceKey, text: 'tebing sungai', issues: [] };
it('imports only whole output with exact sense concordance and keeps machine provenance in runtime', () => {
  const result = qualifyOffline(task, output, model, policy);
  expect(result.record.translationKind).toBe('lexical-equivalent');
  expect(result.record.translationStatus).toBe('generated');
  expect(result.record.translationQuality).toBe('automated-review-required');
  expect(result.record.translationConfidence).toBeUndefined();
  expect(runtimeRecord(result.record).translationKind).toBe('lexical-equivalent');
  expect(runtimeRecord(result.record).translationModelRevision).toBe('pinned');
});
it('withholds financial bank, hallucinated text, missing context and output containing unsupported extra definitions', () => {
  for (const text of ['bank', 'tebing sungai: bank kewangan', 'Sitemap', 'tebing sungai\uE000', 'tebing sungai; tambahan']) {
    expect(qualifyOffline(task, { ...output, text }, model, policy).record).toBeUndefined();
  }
  expect(qualifyOffline({ ...task, synset: undefined }, output, model, policy).issues).toContain('no-independent-sense-reference');
  expect(qualifyOffline(task, { ...output, key: 'another-sense' }, model, policy).issues).toContain('sense-misalignment');
  expect(qualifyOffline(task, output, model, { ...policy, excludedSynsets: { 'test-n': 'scope conflict' } }).record).toBeUndefined();
});
it('validates complete surname annotations with unchanged names and preserves the definition distinction', () => {
  const surname = { ...task, english: 'surname Sun', input: 'surname Sun', synset: undefined, referenceTerms: [] };
  const valid = qualifyOffline(surname, { ...output, text: 'nama keluarga Sun' }, model, policy);
  expect(valid.record.translationKind).toBe('definition-translation');
  expect(valid.record.translationAlignment.preservedProperName).toBe('Sun');
  expect(valid.record.translationStatus).toBe('generated');
  expect(qualifyOffline(surname, { ...output, text: 'Nama keluarga: Sun.' }, model, policy).record.translationKind).toBe('definition-translation');
  for (const text of ['nama keluarga Matahari', 'nama keluarga sun', 'Sun', 'nama keluarga', 'nama keluarga Sun yang terkenal']) expect(qualifyOffline(surname, { ...output, text }, model, policy).record).toBeUndefined();
});
