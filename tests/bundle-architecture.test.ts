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

it('preserves dictionary presentation and snapshots phrase-aware classification for all 125,173 rows', () => {
  const bytes = readFileSync('public/data/cedict.json');
  expect(createHash('sha256').update(bytes).digest('hex')).toBe('29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a');
  const rows = JSON.parse(bytes.toString()) as RawRow[];
  expect(rows).toHaveLength(125173);
  const hash = createHash('sha256');
  const intents = createHash('sha256');
  const presentation = createHash('sha256');
  const inference = createVisualInference(JSON.parse(readFileSync('src/data/visual-lexicon.json', 'utf8')));
  const worker = createDictionaryEntries(inference.buildVisualQuery);
  for (const row of rows) {
    const word = worker.fromRow(row);
    hash.update(JSON.stringify(word) + '\n');
    presentation.update(JSON.stringify({ ...word, senses: word.senses.map(({ id, english }) => ({ id, english })) }) + '\n');
    for (const englishMeaning of row[3]) intents.update(JSON.stringify(inference.buildVisualQuery({ englishMeaning })) + '\n');
  }
  // Captured independently from the previous classifier: labels, displayed
  // meanings, pinyin, headwords, and stable sense IDs must remain unchanged.
  expect(presentation.digest('hex')).toBe('e60e3644bbd33c8d19040fab277681a3daa6759ede7a38c53afa75145bb18d63');
  // Updated after the complete definition-fallback audit. These are structural
  // snapshots, not a claim that every unplanned sense is non-picturable.
  expect(hash.digest('hex')).toBe('032f7f356f533aaab5adc5c7116a488f06cdbb8f9de625b18bfb9e5cf4087152');
  expect(intents.digest('hex')).toBe('b566748f0830bb4ff93473b86fd5a1061e12f5a944999b08b6e86a5c2829450f');
}, 60000);

it('worker-loaded JSON and server imports produce identical representative words', () => {
  const data = JSON.parse(readFileSync('src/data/visual-lexicon.json', 'utf8'));
  const worker = createDictionaryEntries(createVisualInference(data).buildVisualQuery);
  const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
  const wanted = new Set('魂飞魄散 苹果 猫 跑 惊讶 恐慌 冷 政治 经济 金融 数学 科学 长颈鹿 瀑布 厨师 文化 法律 社会 和平 自由 因为 但是 虽然 所以 的 了 吗 呢'.split(' '));
  for (const row of rows.filter(row => wanted.has(row[1]))) expect(worker.fromRow(row)).toEqual(fromRow(row));
});
