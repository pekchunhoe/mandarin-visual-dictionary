import type { Word } from '../types';
import { displayMeaning, toneMarks } from './dictionary';
import { inferVisualIntent } from './visual-inference';
export type RawRow = [string, string, string, string[]];
export function canonicalWordId([traditional, simplified, pinyin]: RawRow) { return `${simplified}|${traditional}|${pinyin}`; }
export function canonicalSenseId(index: number) { return `sense-${index}`; }
export function fromRow(row: RawRow): Word {
  const [traditional, simplified, numericPinyin, definitions] = row; const id = canonicalWordId(row);
  return { id, dictionaryId: id, simplified, traditional, numericPinyin, pinyin: toneMarks(numericPinyin), source: 'CC-CEDICT', senses: definitions.filter(d => !/^CL:/i.test(d)).map((definition, index) => {
    const intent = inferVisualIntent(definition);
    return { id: canonicalSenseId(index), english: displayMeaning(definition), visualType: intent?.visualType ?? 'abstract', visualQuery: intent?.query, visualSubject: intent?.subject, visualOrigin: 'inferred', examples: [] };
  }) };
}
