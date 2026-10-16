// @vitest-environment node
import { expect, it } from 'vitest';
// @ts-expect-error Native maintenance ESM.
import { directLexical, referenceLexical, entryIndex, classifyMalay } from '../scripts/malay/lexical-enrichment.mjs';
// @ts-expect-error Native maintenance ESM.
import { qualityIssues, runtimeRecord } from '../scripts/malay/quality.mjs';
const task = (english: string, simplified = '测试', pinyin = 'ce4 shi4', key = 'key') => ({ key, entryId: `${simplified}|${simplified}|${pinyin}`, senseId: 'sense-0', simplified, traditional: simplified, pinyin, english, idiom: false });
function resources(english: string, malay: string, pos = 'n', lexicalPOS = 'noun') {
  return { lexical: { english: { byLemma: new Map([[english, new Set([`id-${pos}`])]]) }, chinese: { byLemma: new Map([['测试', new Set([`id-${pos}`])]]) }, malay: { bySynset: new Map([[`id-${pos}`, [malay]]]) } },
    dictionaries: new Map([[english, [{ malay, english, pos: lexicalPOS, url: 'https://en.wiktionary.org/wiki/test#Malay' }]]]),
    policy: { excludedSynsets: {}, excludedTerms: {}, excludedSenseOutputs: {}, excludedEnglishMalay: {}, allowedBareVerbs: [] } };
}
for (const [english, good, wrong, pos, lexicalPOS] of [
  ['riverbank', 'tebing sungai', 'bank', 'n', 'noun'], ['illumination', 'cahaya', 'ringan', 'n', 'noun'],
  ['electric charge', 'cas elektrik', 'caj', 'n', 'noun'], ['electric current', 'arus elektrik', 'semasa', 'n', 'noun'],
  ['collection', 'himpunan', 'meletakkan', 'n', 'noun'], ['to place', 'meletakkan', 'himpunan', 'v', 'verb'],
  ['to solidify', 'mengeras', 'himpunan', 'v', 'verb']
]) it(`extracts the complete ${english} sense and rejects alternate sense ${wrong}`, () => {
  const r = resources(english.replace(/^to /, ''), good, pos, lexicalPOS);
  expect(directLexical(task(english), r).text).toBe(good);
  r.lexical.malay.bySynset.set(`id-${pos}`, [wrong]);
  expect(directLexical(task(english), r).text).toBeUndefined();
});
it('rejects a single convenient clause, noun-to-verb swaps and contradictory Chinese evidence', () => {
  expect(directLexical(task('assistance; aid'), resources('assistance', 'bantuan')).text).toBeUndefined();
  expect(directLexical(task('to poison'), resources('poison', 'racun', 'v', 'noun')).text).toBeUndefined();
  const r = resources('light', 'cahaya'); r.lexical.chinese.byLemma.set('测试', new Set(['other-n']));
  expect(directLexical(task('light'), r).text).toBeUndefined();
});
it('withholds polysemous English without Mandarin evidence and bare verb roots despite POS attestation', () => {
  const r = resources('region', 'kawasan'); r.lexical.chinese.byLemma.clear(); r.lexical.english.byLemma.set('region', new Set(['id-n', 'other-n']));
  expect(directLexical(task('region'), r).text).toBeUndefined();
  expect(directLexical(task('to puncture'), resources('puncture', 'pancit', 'v', 'verb')).text).toBeUndefined();
});
it('scopes exclusions to the questioned English/Malay pair without rejecting valid alternative senses', () => {
  expect(directLexical(task('opportunity'), resources('opportunity', 'can')).text).toBeUndefined();
  expect(directLexical(task('opportunity'), resources('opportunity', 'peluang')).text).toBe('peluang');
  expect(directLexical(task('bastard'), resources('bastard', 'bangsat')).text).toBe('bangsat');
  expect(directLexical(task('bedbug'), resources('bedbug', 'bangsat')).text).toBeUndefined();
});
it('does not turn an unreferenced short legacy definition into a lexical equivalent', () => {
  const s = task('a complex explanation'), r = { ...s, malay: 'Suatu perkara', translationStatus: 'generated', translationSource: 'fixture', translationLicense: 'MIT', translationVersion: 'fixture' };
  expect(classifyMalay(r, s, resources('unrelated', 'perkara')).category).toBe('mixed-or-ambiguous');
});
it('follows only exact equivalence references with identical target meaning and POS in EVERY target sense', () => {
  const target = task('furniture', '家具', 'jia1 ju4', 'target');
  const source = task('variant of 家具[jia1 ju4]');
  const seed = new Map([['target', { text: 'perabot', evidence: { pos: 'noun' } }]]);
  expect(referenceLexical(source, entryIndex([target]), seed).text).toBe('perabot');
  expect(referenceLexical(task('variant of 家具[jia1 ju3]'), entryIndex([target]), seed).text).toBeUndefined();
  expect(referenceLexical(task('see 家具[jia1 ju4]'), entryIndex([target]), seed).text).toBeUndefined();
  const second = { ...target, key: 'target2', senseId: 'sense-1', english: 'another sense' };
  expect(referenceLexical(source, entryIndex([target, second]), seed).text).toBeUndefined();
  seed.set('target2', { text: 'barang', evidence: { pos: 'noun' } });
  expect(referenceLexical(source, entryIndex([target, second]), seed).text).toBeUndefined();
  seed.set('target2', { text: 'perabot', evidence: { pos: 'verb' } });
  expect(referenceLexical(source, entryIndex([target, second]), seed).text).toBeUndefined();
});
it('keeps explanation and lexical provenance separate and rejects swaps, corrupt text and unsupported review', () => {
  const s = task('furniture');
  const record = { ...s, malay: 'Perabot untuk rumah.', translationKind: 'definition-translation', translationStatus: 'generated', translationSource: 'fixture', translationLicense: 'MIT', translationVersion: 'fixture', malayLexical: { text: 'perabot', status: 'generated', quality: 'automated-review-required', source: 'fixture', license: 'MIT', version: 'fixture' }, lexicalEvidence: { raw: 'maintenance-only' } };
  expect(qualityIssues(record, s)).toEqual([]);
  expect(runtimeRecord(record).malayLexical.text).toBe('perabot');
  expect(runtimeRecord(record).lexicalEvidence).toBeUndefined();
  expect(qualityIssues({ ...record, translationKind: 'lexical-equivalent' }, s)).toContain('duplicate-malayLexical-kind');
  for (const text of ['家具', 'TODO', '\uFFFD', '\uD800']) expect(qualityIssues({ ...record, malayLexical: { ...record.malayLexical, text } }, s).length).toBeGreaterThan(0);
  expect(qualityIssues({ ...record, malayLexical: { ...record.malayLexical, status: 'verified', quality: 'human-verified' } }, s)).toContain('unsupported-malayLexical-verification');
});
