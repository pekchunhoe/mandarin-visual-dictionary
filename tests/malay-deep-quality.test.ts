// @vitest-environment node
import { describe, expect, it } from 'vitest';
// @ts-expect-error Native maintenance ESM.
import { referenceDefinition, referenceRules, validReferenceDefinition } from '../scripts/malay/reference-definition.mjs';
// @ts-expect-error Native maintenance ESM.
import { qualifyRecovered } from '../scripts/malay/deep-quality.mjs';
// @ts-expect-error Native maintenance ESM.
import { qualityIssues } from '../scripts/malay/quality.mjs';

const reference = '開金|开金[kai1 jin1]';
const model = { model: 'local-model', revision: 'pinned', license: 'CC-BY-4.0', runtime: '4.8.3', quantization: 'int8', beamSize: 1 };
const task = (english: string, simplified = '测试') => ({ key: 'key', entryId: 'entry', senseId: 'sense-0', english, simplified, traditional: simplified, input: english, inferenceKey: 'context', idiom: false });
const output = (text: string, issues: string[] = []) => ({ key: 'key', inferenceKey: 'context', text, issues });
function resources(english: string, malay: string, pos = 'n', wiktionaryPos = 'noun') {
  return { lexical: { english: { byLemma: new Map([[english, new Set([`id-${pos}`])]]) }, chinese: { byLemma: new Map([['测试', new Set([`id-${pos}`])]]) }, malay: { bySynset: new Map([[`id-${pos}`, [malay]]]) } },
    dictionaries: new Map([[english, [{ malay, english, pos: wiktionaryPos, url: 'licensed-reference' }]]]),
    policy: { excludedSynsets: {}, excludedTerms: {}, excludedSenseOutputs: {}, excludedEnglishMalay: {}, allowedBareVerbs: [] } };
}
describe('complete dictionary-reference definition recovery', () => {
  const prefixes = ['varian lama dari ', 'varian erhua dari ', 'varian dari ', 'bentuk erhua dari ', 'singkatan untuk ', 'lihat ', 'juga ditulis '];
  for (const [i, rule] of referenceRules.entries()) it(`accepts ${rule.id} only with the complete unchanged citation`, () => {
    const source = task(rule.english + reference), raw = prefixes[i] + reference;
    const r = qualifyRecovered(source, output(raw, ['unicode-or-target-script']), model, {});
    expect(r.record.translationKind).toBe('definition-translation');
    expect(r.record.translationStatus).toBe('generated');
    expect(r.record.translationConfidence).toBeUndefined();
    expect(validReferenceDefinition(r.record, source)).toBe(true);
    expect(qualityIssues(r.record, source)).toEqual([]);
    for (const bad of [raw.replace('kai1', 'kai2'), raw.replace('开金', '银行'), raw + ' tambahan', raw.replace('[kai1 jin1]', '')]) {
      expect(referenceDefinition(source.english, bad)).toBeNull();
    }
    expect(referenceDefinition(source.english + ' (rare)', raw)).toBeNull();
  });
  it('retains old and erhua qualifiers, rejects unsupported Han and forged metadata', () => {
    expect(referenceDefinition('old variant of ' + reference, 'varian dari ' + reference)).toBeNull();
    expect(referenceDefinition('erhua variant of ' + reference, 'varian dari ' + reference)).toBeNull();
    const source = task('see ' + reference);
    const { record } = qualifyRecovered(source, output('lihat ' + reference), model, {});
    expect(qualityIssues({ ...record, malay: 'Lihat 银行[yin2 hang2].' }, source)).toContain('invalid-language-or-unicode');
    expect(qualityIssues({ ...record, translationKind: 'lexical-equivalent' }, source)).toContain('invalid-language-or-unicode');
    expect(qualityIssues({ ...record, translationAlignment: {} }, source)).toContain('invalid-language-or-unicode');
    expect(qualityIssues({ ...record, translationAlignment: { ...record.translationAlignment, sourceInput: undefined } }, source)).toContain('invalid-language-or-unicode');
    expect(qualityIssues({ ...record, malay: record.malay + '\uFFFD' }, source)).toContain('invalid-language-or-unicode');
  });
  it('restores only a protected complete citation from an exact bounded source template', () => {
    const source = { ...task('variant of ' + reference), input: 'variant of KANJIANREF' };
    const { record } = qualifyRecovered(source, output('varian dari KANJIANREF'), model, {});
    expect(record.malay).toBe('Varian bagi ' + reference + '.');
    expect(record.translationAlignment.rawModelOutput).toBe('varian dari KANJIANREF');
    expect(qualityIssues(record, source)).toEqual([]);
    for (const raw of ['varian dari KANJIANREF KANJIANREF', 'varian dari KANJIANREF tambahan', 'varian dari DIFFERENTREF']) expect(referenceDefinition(source.english, raw, source.input)).toBeNull();
    expect(referenceDefinition(source.english, 'varian dari KANJIANREF', 'old variant of KANJIANREF')).toBeNull();
    expect(referenceDefinition('old variant of ' + reference, 'bentuk tulisan lama x', 'old written form of X')?.reference).toBe(reference);
    expect(referenceDefinition('also written ' + reference, 'Ditulis juga sebagai X', 'also written as X')?.reference).toBe(reference);
  });
});
it('accepts sense-attested unchanged loanwords, rejects uncorroborated English copies and wrong senses', () => {
  for (const term of ['bank', 'hotel', 'radio', 'internet', 'hospital']) {
    const r = qualifyRecovered(task(term), output(term, ['english-copy']), model, resources(term, term));
    expect(r.record.malay).toBe(term);
    expect(r.record.sameTextJustification).toContain('Wiktionary');
    expect(qualifyRecovered(task(term), output(term), model, { ...resources(term, term), dictionaries: new Map() }).record).toBeUndefined();
  }
  expect(qualifyRecovered(task('riverbank'), output('bank'), model, resources('riverbank', 'tebing sungai')).record).toBeUndefined();
  expect(qualifyRecovered(task('company'), output('company', ['english-copy']), model, resources('company', 'syarikat')).record).toBeUndefined();
});
it('accepts whole compounds and explicitly attested verb lemmas without dropping explanations or POS', () => {
  expect(qualifyRecovered(task('riverbank'), output('tebing sungai'), model, resources('riverbank', 'tebing sungai')).record.malay).toBe('tebing sungai');
  expect(qualifyRecovered(task('to rain'), output('untuk hujan'), model, resources('rain', 'hujan', 'v', 'verb')).record.malay).toBe('hujan');
  expect(qualifyRecovered(task('to poison'), output('untuk racun'), model, resources('poison', 'racun', 'v', 'noun')).record).toBeUndefined();
  expect(qualifyRecovered(task('riverbank'), output('tebing sungai: bank kewangan'), model, resources('riverbank', 'tebing sungai')).record).toBeUndefined();
});
it('requires both references when Chinese concordance is absent and never ignores a Chinese contradiction', () => {
  const r = resources('radio', 'radio'); r.lexical.chinese.byLemma = new Map();
  expect(qualifyRecovered(task('radio'), output('radio'), model, r).record).toBeDefined();
  r.lexical.chinese.byLemma = new Map([['测试', new Set(['different-n'])]]);
  expect(qualifyRecovered(task('radio'), output('radio'), model, r).record).toBeUndefined();
});
it('retains scoped known-conflict exclusions and never strips infinitive markers from noun outputs', () => {
  const r = resources('tuition', 'tuisyen');
  r.policy.excludedSenseOutputs = { '测试|tuition|tuisyen': 'Fees versus private tutoring.' };
  expect(qualifyRecovered(task('tuition'), output('tuisyen'), model, r).issues).toContain('known-scope-or-locale-conflict');
  expect(qualifyRecovered(task('riverbank'), output('untuk tebing sungai'), model, resources('riverbank', 'tebing sungai')).record).toBeUndefined();
});
it('does not propagate alternate Malay meanings across the ten polysemy regression senses', () => {
  for (const [english, good, wrong] of [
    ['riverbank', 'tebing sungai', 'bank'], ['illumination', 'cahaya', 'ringan'], ['electrical charge', 'cas elektrik', 'bayaran'],
    ['electric current', 'arus elektrik', 'semasa'], ['spring season', 'musim bunga', 'mata air'], ['right side', 'sebelah kanan', 'betul'],
    ['matchstick', 'batang mancis', 'perlawanan'], ['set of objects', 'set objek', 'menetapkan'], ['to run', 'berlari', 'mengendalikan'], ['to break', 'memecahkan', 'berehat'],
  ]) {
    const r = resources(english.replace(/^to /, ''), good, english.startsWith('to ') ? 'v' : 'n', english.startsWith('to ') ? 'verb' : 'noun');
    expect(qualifyRecovered(task(english), output(good), model, r).record).toBeDefined();
    expect(qualifyRecovered(task(english), output(wrong), model, r).record).toBeUndefined();
  }
});
