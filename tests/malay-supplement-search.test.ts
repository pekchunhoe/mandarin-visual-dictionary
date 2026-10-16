import { expect, it } from 'vitest';
import { applyMalayRecords, MalaySearchIndex, type MalayAsset } from '../src/lib/malay-search';
import type { Word } from '../src/types';
const lexical = { text: 'arus elektrik', status: 'generated', quality: 'automated-review-required', source: 'licensed reference', license: 'MIT', version: 'fixture' } as const;
const word: Word = { id: 'entry', simplified: '电流', traditional: '電流', pinyin: 'diànliú', numericPinyin: 'dian4 liu2', source: 'CC-CEDICT', senses: [{ id: 'sense-0', english: 'electric current', malay: 'Kadar aliran cas elektrik.', translationKind: 'definition-translation', visualType: 'abstract', examples: [] }] };
const asset: MalayAsset = { schema: 1, corpusSha256: 'fixture', version: 'fixture', records: [{ key: 'key', entryId: 'entry', senseId: 'sense-0', english: 'electric current', malay: 'Kadar aliran cas elektrik.', malayLexical: lexical }] };
it('attaches supplementary meanings to protected editorial senses and indexes their exact phrase', () => {
  const before = JSON.stringify(word), words = applyMalayRecords([word], asset);
  expect(words[0].senses[0].malay).toBe(word.senses[0].malay);
  expect(words[0].senses[0].malayLexical).toEqual(lexical);
  expect(new MalaySearchIndex(words).search('arus elektrik')[0]).toMatchObject({ id: 'entry', matchedSenseId: 'sense-0', matchedLanguage: 'malay' });
  expect(JSON.stringify(word)).toBe(before);
});
it('does not overwrite a supplement or attach one to changed English or a different sense ID', () => {
  const existing = { ...word, senses: [{ ...word.senses[0], malayLexical: { ...lexical, text: 'protected equivalent' } }] };
  expect(applyMalayRecords([existing], asset)[0].senses[0].malayLexical?.text).toBe('protected equivalent');
  for (const changed of [{ ...asset.records[0], english: 'present current' }, { ...asset.records[0], senseId: 'sense-1' }]) expect(applyMalayRecords([word], { ...asset, records: [changed] })[0].senses[0].malayLexical).toBeUndefined();
});
