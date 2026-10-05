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
  // Updated only after the full 199,713-meaning before/after audit. Phrase and
  // label eligibility intentionally change; preserve the complete new snapshot.
  expect(hash.digest('hex')).toBe('a281d875b2e018216976b136507beff760eb5d20822d9e2d853c4d56ec7b422d');
  expect(intents.digest('hex')).toBe('b910e68e10227856dec1552636519d355438d91593d75c77492afd46fa394210');
}, 20000);

it('worker-loaded JSON and server imports produce identical representative words', () => {
  const data = JSON.parse(readFileSync('src/data/visual-lexicon.json', 'utf8'));
  const worker = createDictionaryEntries(createVisualInference(data).buildVisualQuery);
  const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
  const wanted = new Set('魂飞魄散 苹果 猫 跑 惊讶 恐慌 冷 政治 经济 金融 数学 科学 长颈鹿 瀑布 厨师 文化 法律 社会 和平 自由 因为 但是 虽然 所以 的 了 吗 呢'.split(' '));
  for (const row of rows.filter(row => wanted.has(row[1]))) expect(worker.fromRow(row)).toEqual(fromRow(row));
});
