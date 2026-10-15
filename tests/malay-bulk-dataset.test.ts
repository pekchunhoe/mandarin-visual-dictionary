// @vitest-environment node
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
// @ts-expect-error maintenance module is native ESM
import { readDataset, normalizeEntry } from '../scripts/malay/dataset-reader.mjs';
// @ts-expect-error maintenance module is native ESM
import { normalizeSource, indexRecords, matchSense, integrateBulk, reviewPolicy } from '../scripts/malay/bulk-dataset.mjs';
// @ts-expect-error maintenance module is native ESM
import { corpus, hash } from '../scripts/malay/corpus.mjs';
// @ts-expect-error maintenance module is native ESM
import { qualityIssues } from '../scripts/malay/quality.mjs';

const temp = () => mkdtempSync(resolve('.tmp/malay-bulk-test-'));
const collect = async (file: string) => { const records = []; for await (const r of readDataset(file)) records.push(r); return records; };
const licensed = { id: 'test-licensed', orientation: 'en-ms', license: 'CC-BY-SA-4.0', attribution: 'Fixture author', version: '1', redistributable: true, url: 'https://example.org/fixture' };
it('reads JSON arrays, object maps, JSONL and quoted multiline CSV/TSV without reversing languages', async () => {
  const dir = temp();
  const fixtures = {
    'array.json': '[{"english":"cat","malay":"kucing"},{"english":"bank","malay":"bank"}]',
    'map.json': '{"cat":"kucing","bank":"bank"}',
    'rows.jsonl': '{"english":"cat","malay":"kucing"}\ninvalid\n{"english":"bank","malay":"bank"}\n',
    'rows.csv': 'english,malay,definition\r\ncat,kucing,"a domestic\ncat"\r\nbank,bank,"a ""financial"" institution"\r\n',
    'rows.tsv': 'english\tmalay\npos\tkata\n'
  };
  for (const [name, text] of Object.entries(fixtures)) writeFileSync(resolve(dir, name), text);
  expect((await collect(resolve(dir, 'array.json'))).map(r => r.value.malay)).toEqual(['kucing', 'bank']);
  expect((await collect(resolve(dir, 'map.json'))).map(r => r.value.english)).toEqual(['cat', 'bank']);
  expect((await collect(resolve(dir, 'rows.jsonl'))).map(r => r.error ?? r.value.malay)).toEqual(['kucing', 'malformed-json', 'bank']);
  expect((await collect(resolve(dir, 'rows.csv')))[1].value.definition).toBe('a "financial" institution');
  expect((await collect(resolve(dir, 'rows.tsv')))[0].value.malay).toBe('kata');
});
it('rejects truncated containers and malformed fields while preserving valid Unicode', async () => {
  const dir = temp(), file = resolve(dir, 'broken.json'); writeFileSync(file, '[{"english":"cat","malay":"kucing"}');
  await expect(collect(file)).rejects.toThrow('Truncated');
  expect(normalizeEntry({ english: '  human\u3000being ', malay: 'orang', pos: 'n' }, licensed).records[0]).toMatchObject({ english: 'human being', malay: 'orang', pos: 'noun' });
  expect(normalizeEntry({ english: 'cat', malay: '猫' }, licensed).error).toBeTruthy();
  expect(normalizeEntry({ english: 'cat', malay: null }, licensed).error).toBeTruthy();
  expect(normalizeEntry({ english: 'cat', malay: 'kucing' }, { ...licensed, orientation: 'unknown' }).error).toBeTruthy();
});
it('filters Indonesian entries, restricted regional senses and inflected-form redirects from Wiktionary', () => {
  const source = { ...licensed, orientation: 'wiktionary-ms-en' };
  const entry = { word: 'cat', lang_code: 'ms', pos: 'noun', senses: [{ glosses: ['paint'] }] };
  expect(normalizeEntry(entry, source).records[0]).toMatchObject({ english: 'paint', malay: 'cat', pos: 'noun' });
  expect(normalizeEntry({ ...entry, lang_code: 'id' }, source).error).toBe('not-malay-language');
  for (const sense of [{ glosses: ['paint'], tags: ['Indonesia'] }, { glosses: ['paint'], form_of: [{ word: 'x' }] }]) expect(normalizeEntry({ ...entry, senses: [sense] }, source).error).toBeTruthy();
});
it('resumes immutable batches, removes exact duplicates and detects changed/corrupt inputs', async () => {
  const dir = temp(), file = resolve(dir, 'source.jsonl');
  writeFileSync(file, ['{"english":"cat","malay":"kucing"}', 'broken', '{"english":"cat","malay":"kucing"}', '{"english":"dog","malay":"anjing"}'].join('\n'));
  const source = { ...licensed, file, sha256: hash(readFileSync(file)) };
  const first = await normalizeSource(source, dir, { batchSize: 2, stopAfterBatches: 1 });
  expect(first.interrupted).toBe(true);
  const resumed = await normalizeSource(source, dir, { batchSize: 2 });
  expect(resumed.records.map((r: { malay: string }) => r.malay)).toEqual(['kucing', 'anjing']);
  expect(resumed.checkpoint).toMatchObject({ completed: true, inputRows: 4, normalizedRecords: 2, exactDuplicates: 1, rejectedRows: 1 });
  expect((await normalizeSource(source, dir)).cached).toBe(true);
  writeFileSync(file, '{}'); await expect(normalizeSource(source, dir)).rejects.toThrow('SHA-256');
});
it('blocks datasets lacking approved redistribution metadata before reading them', async () => {
  await expect(normalizeSource({ ...licensed, file: 'does-not-exist', redistributable: false })).rejects.toThrow('redistribution');
  await expect(normalizeSource({ ...licensed, file: 'does-not-exist', license: 'unknown' })).rejects.toThrow('redistribution');
});

// Deliberately share English spellings across unrelated semantic IDs. The
// available Mandarin concordance and source POS must choose the right meaning.
it.each([
  ['bank', [['银行', 'bank', '90000001-n'], ['河岸', 'tebing sungai', '90000002-n']]],
  ['light', [['光', 'cahaya', '90000003-n'], ['轻', 'ringan', '90000004-a']]],
  ['spring', [['春', 'musim bunga', '90000005-n'], ['弹簧', 'pegas', '90000006-n'], ['泉', 'mata air', '90000007-n']]],
  ['current', [['电流', 'arus elektrik', '90000008-n'], ['当前', 'semasa', '90000009-a']]]
])('separates contextual meanings of %s and refuses word-only or wrong-POS candidates', (english, cases) => {
  const rows = cases as string[][];
  const englishMap = new Map([[english as string, new Set(rows.map(r => r[2]))]]);
  const resources = { english: { byLemma: englishMap, bySynset: new Map(rows.map(r => [r[2], [english]])) }, chinese: { byLemma: new Map(rows.map(r => [r[0], new Set([r[2]])])) }, malay: { bySynset: new Map(rows.map(r => [r[2], [r[1]]])) }, revision: 'fixture' };
  const records = rows.map((r, i) => ({ english, malay: r[1], pos: r[2].endsWith('-a') ? 'adj' : 'noun', definition: english, sourceId: 'fixture', url: `https://example.org/${i}` }));
  for (const [chinese, malay] of rows) {
    const sense = { key: hash(chinese), entryId: chinese, senseId: 'sense-0', english, rawEnglish: english, simplified: chinese, traditional: chinese, pinyin: 'fixture', idiom: false };
    expect(matchSense(sense, resources, indexRecords(records)).record.malay).toBe(malay);
    expect(matchSense(sense, resources, indexRecords(records.map(r => ({ ...r, pos: 'verb' })))).record).toBeUndefined();
    const other = records.filter(r => r.malay !== malay);
    expect(matchSense(sense, resources, indexRecords(other)).record).toBeUndefined();
  }
});
it('preserves the corpus, excludes known false concordances and does not invent confidence probabilities', () => {
  const data = corpus();
  expect(data.digest).toBe('29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a');
  expect(data.senses).toHaveLength(198245);
  const store = JSON.parse(readFileSync('scripts/data/malay-translations-v1.json', 'utf8'));
  const sense = data.senses.find((s: { key: string }) => s.key === store.records[0].key);
  expect(qualityIssues({ ...store.records[0], translationConfidence: undefined }, sense)).toEqual([]);
  expect(qualityIssues({ ...store.records[0], translationConfidence: NaN }, sense)).toContain('invalid-confidence');
  expect(reviewPolicy.excludedSynsets['02934168-n']).toContain('telegram');
});
it('rejects a modified import batch before touching authoritative assets', () => {
  const root = temp(); mkdirSync(resolve(root, 'isolated'));
  const before = ['scripts/data/malay-translations-v1.json', 'src/data/malay-runtime.json'].map(f => hash(readFileSync(f)));
  writeFileSync(resolve(root, 'preparation.json'), JSON.stringify({ candidatesSha256: 'untrusted' }));
  writeFileSync(resolve(root, 'candidates.json'), JSON.stringify({ records: [] }));
  expect(() => integrateBulk({ root, promote: true })).toThrow('candidate batch changed');
  expect(['scripts/data/malay-translations-v1.json', 'src/data/malay-runtime.json'].map(f => hash(readFileSync(f)))).toEqual(before);
});
