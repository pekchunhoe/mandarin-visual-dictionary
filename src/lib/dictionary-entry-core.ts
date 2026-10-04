import type { Word } from '../types';
import { displayMeaning, toneMarks } from './dictionary';
import type { createVisualInference } from './visual-inference-core';
export type RawRow = [string, string, string, string[]];
export function canonicalWordId([traditional, simplified, pinyin]: RawRow) { return `${simplified}|${traditional}|${pinyin}`; }
export function canonicalSenseId(index: number) { return `sense-${index}`; }
export function createDictionaryEntries(buildVisualQuery: ReturnType<typeof createVisualInference>['buildVisualQuery']) {
  function fromRow(row: RawRow): Word {
    const [traditional, simplified, numericPinyin, definitions] = row; const id = canonicalWordId(row);
    return { id, dictionaryId: id, simplified, traditional, numericPinyin, pinyin: toneMarks(numericPinyin), source: 'CC-CEDICT', senses: definitions.filter(d => !/^CL:/i.test(d)).map((definition, index) => {
      const intent = buildVisualQuery({ englishMeaning: definition });
      return { id: canonicalSenseId(index), english: displayMeaning(definition), visualType: intent?.visualType ?? 'abstract', visualQuery: intent?.query, visualSubject: intent?.subject, visualOrigin: 'inferred', examples: [] };
    }) };
  }

  /** Saved words retain definitions, not obsolete visual classification decisions. */
  function refreshWordVisuals(word: Word): Word {
    return { ...word, senses: word.senses.map(sense => {
      if (sense.visualOrigin === 'curated' && (sense.visualQuery || sense.visualType === 'abstract')) return sense;
      const intent = buildVisualQuery({ englishMeaning: sense.english, partOfSpeech: sense.partOfSpeech });
      return { ...sense, visualType: sense.visualOrigin === 'curated' ? sense.visualType : intent?.visualType ?? 'abstract', visualQuery: intent?.query, visualSubject: intent?.subject, visualOrigin: sense.visualOrigin ?? 'inferred' };
    }) };
  }
  return { fromRow, refreshWordVisuals };
}
