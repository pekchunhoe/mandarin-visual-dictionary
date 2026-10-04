// @vitest-environment node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { words as generated, categories as generatedCategories } from '../src/data/learning';
import { words as source, categories as sourceCategories } from '../src/data/learning-source';
import { fromRow, type RawRow } from '../src/lib/dictionary-entry';
import { createDictionaryEntries } from '../src/lib/dictionary-entry-core';
import { createVisualInference } from '../src/lib/visual-inference-core';

it('generates the starter collection without changing any meaning, ID, query or learning content', () => {
  expect(JSON.stringify(generated)).toBe(JSON.stringify(source));
  expect(generatedCategories).toEqual(sourceCategories);
});

it('preserves every classification in the unchanged 125,173-row dictionary', () => {
  const bytes = readFileSync('public/data/cedict.json');
  expect(createHash('sha256').update(bytes).digest('hex')).toBe('29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a');
  const rows = JSON.parse(bytes.toString()) as RawRow[];
  expect(rows).toHaveLength(125173);
  const hash = createHash('sha256');
  const intents = createHash('sha256');
  const inference = createVisualInference(JSON.parse(readFileSync('src/data/visual-lexicon.json', 'utf8')));
  const worker = createDictionaryEntries(inference.buildVisualQuery);
  for (const row of rows) {
    hash.update(JSON.stringify(worker.fromRow(row)) + '\n');
    for (const englishMeaning of row[3]) intents.update(JSON.stringify(inference.buildVisualQuery({ englishMeaning })) + '\n');
  }
  // Captured from the pre-optimization classifier, not a bundle-byte budget.
  expect(hash.digest('hex')).toBe('ea77c225a7eddda8c623c4b340e768863b2523d099586e7d4b90fbded42cb480');
  // Independently compared with the pre-optimization source for all 199,713
  // meanings, including fallback queries and concept domains absent from Word.
  expect(intents.digest('hex')).toBe('fc466297f9ad2027585e3bf9330d701ba0af9566ee5978379cc75c22e017bbb8');
}, 20000);

it('worker-loaded JSON and server imports produce identical representative words', () => {
  const data = JSON.parse(readFileSync('src/data/visual-lexicon.json', 'utf8'));
  const worker = createDictionaryEntries(createVisualInference(data).buildVisualQuery);
  const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
  const wanted = new Set('苹果 猫 跑 惊讶 恐慌 冷 政治 经济 金融 数学 科学 长颈鹿 瀑布 厨师 文化 法律 社会 和平 自由 因为 但是 虽然 所以 的 了 吗 呢'.split(' '));
  for (const row of rows.filter(row => wanted.has(row[1]))) expect(worker.fromRow(row)).toEqual(fromRow(row));
});
