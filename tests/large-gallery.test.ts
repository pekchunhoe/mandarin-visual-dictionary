// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fromRow, type RawRow } from '../src/lib/dictionary-entry';
import { byId } from '../src/data/learning';
import { getImages, clearImageCache, type CompetitionTrace } from '../server/images';
import { imageSearchPlan } from '../server/image-plan';
import { imageRelevance, rankImageCandidates } from '../server/visual-search';
import { candidateSemantics } from '../server/semantic-gallery';
import { normalizeOpenverse, normalizePixabay } from '../server/providers';
import { planFor, px, ov, json } from './gallery-fixtures';
import { largeGalleryCases, largeGalleryRecords } from './large-gallery-data';
const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
const dictionaryWord = (text: string) => byId.get(text) ?? fromRow(rows.find(r => r[1] === text)!);
beforeEach(clearImageCache);

it.each(largeGalleryCases)('$word exposes exactly 20 strong unique pictures from a larger qualified pool', async example => {
  const word = dictionaryWord(example.word);
  const sense = word.senses.find(s => s.english === example.meaning) ?? word.senses[0];
  const plan = imageSearchPlan(word, sense)!;
  const records = largeGalleryRecords(example);
  const pool = [...normalizePixabay(records.hits.slice(0, 18), plan.primary.query), ...normalizeOpenverse(records.results.slice(18), plan.primary.query)];
  expect(pool.filter(p => imageRelevance(p, plan).semantic).length).toBeGreaterThan(30);
  const selected = rankImageCandidates(pool, plan);
  expect(selected).toHaveLength(20);
  expect(new Set(selected.map(p => p.largeUrl)).size).toBe(20);
  expect(selected.every(p => imageRelevance(p, plan).semantic)).toBe(true);
  expect(new Set(selected.map(p => candidateSemantics(p, plan).cluster)).size).toBeGreaterThan(1);
  expect(rankImageCandidates([...pool].reverse(), plan).map(p => p.id)).toEqual(selected.map(p => p.id));
  const traces: CompetitionTrace[] = [];
  const fetcher = vi.fn(async input => {
    const url = new URL(String(input));
    return json(url.hostname === 'pixabay.com' ? { hits: records.hits.slice(0, 18) } : { results: records.results.slice(18) });
  });
  const result = await getImages(word.id, sense.id, { pixabayKey: 'large-gallery-fixture', fetcher, onTrace: t => traces.push(t) });
  expect(result.images).toHaveLength(20);
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(traces.find(t => t.stage === 'plan')?.english).toBe(sense.english);
});

it.each([4, 7, 9, 12, 14, 17])('returns only %i strong single-facet candidates without weak filler', count => {
  const plan = planFor('to run');
  const pool = normalizePixabay([...Array.from({ length: count }, (_, i) => px(i + 1, 'person running athlete')), px(90, 'running shoes'), px(91, 'student portrait')], plan.primary.query);
  expect(rankImageCandidates(pool, plan)).toHaveLength(count);
});

it('uses progressive same-facet depth while keeping repeated symbols a minority', () => {
  const example = largeGalleryCases[4]; const plan = planFor(example.meaning);
  const records = largeGalleryRecords(example, 30);
  const pool = [...normalizePixabay(records.hits, plan.primary.query), ...normalizeOpenverse(Array.from({ length: 12 }, (_, i) => ov(200 + i, 'asking question mark symbol')), plan.primary.query)];
  const selected = rankImageCandidates(pool, plan);
  expect(selected).toHaveLength(20);
  expect(selected.filter(p => candidateSemantics(p, plan).symbolic).length).toBeLessThanOrEqual(2);
  const clusters = selected.map(p => candidateSemantics(p, plan).cluster);
  expect(Math.max(...[...new Set(clusters)].map(c => clusters.filter(v => v === c).length))).toBeGreaterThan(2);
  expect(Math.max(...[...new Set(clusters)].map(c => clusters.filter(v => v === c).length))).toBeLessThanOrEqual(10);
});

it.each(['description', 'title', 'semanticAlt'] as const)('rejects incidental fear/trepidation in narrative %s without visual subject evidence', field => {
  const plan = planFor('with fear and trepidation');
  const [good, sweater, animals] = normalizeOpenverse([ov(1, 'scared person reacting to danger'), { ...ov(2, 'Knitted sweater'), tags: [] }, { ...ov(3, 'Animals by a fence'), tags: [] }], plan.primary.query);
  const narrative = 'I made this sweater with fear and trepidation. It took many weeks and my grandmother chose the yarn.';
  const bad = [{ ...sweater, [field]: narrative }, { ...animals, [field]: 'I approached these animals with some trepidation, wondering whether my camera was working.' }];
  expect(imageRelevance(good, plan).semantic).toBe(true);
  expect(bad.every(p => !imageRelevance(p, plan).semantic)).toBe(true);
  expect(rankImageCandidates([good, ...bad], plan)).toEqual([good]);
});

it('does not launder a narrative Openverse title through its synthesized tags', () => {
  const plan = planFor('with fear and trepidation');
  const [photo] = normalizeOpenverse([{ ...ov(1, 'My grandmother made this sweater with fear and trepidation'), tags: [] }], plan.primary.query);
  expect(imageRelevance(photo, plan).semantic).toBe(false);
});

it('requires visible emotional context beyond a bare abstract title or object description', () => {
  const plan = planFor('with fear and trepidation');
  const candidates = normalizeOpenverse([
    { ...ov(1, 'Fear and trepidation'), tags: [] },
    { ...ov(2, 'Sweater'), tags: [], description: 'The sweater was made with fear and trepidation.' },
    { ...ov(3, 'Fearful person reacting to danger'), tags: [] }
  ], plan.primary.query);
  expect(candidates.map(p => imageRelevance(p, plan).semantic)).toEqual([false, false, true]);
});

it('retains concise visible descriptions and independent evidence in a long narrative', () => {
  const plan = planFor('to be afraid');
  const [photo] = normalizeOpenverse([{ ...ov(1, 'Portrait'), tags: [], description: 'A frightened child trembling beside a door.' }], plan.primary.query);
  expect(imageRelevance(photo, plan).semantic).toBe(true);
  expect(imageRelevance({ ...photo, tags: ['frightened child'], description: 'I was afraid my camera would fail. '.repeat(40) }, plan).semantic).toBe(true);
});

it('collects useful complementary rounds until 20 and traces marginal yield safely', async () => {
  const example = largeGalleryCases[0]; const word = dictionaryWord(example.word);
  const queries = new Map<string, number>(); const traces: CompetitionTrace[] = [];
  const fetcher = vi.fn(async input => {
    const url = new URL(String(input)); const query = url.searchParams.get('q')!;
    if (!queries.has(query)) queries.set(query, queries.size);
    const round = queries.get(query)!; const records = largeGalleryRecords(example, 8, round * 100);
    return json(url.hostname === 'pixabay.com' ? { hits: records.hits.slice(0, 4) } : { results: records.results.slice(4) });
  });
  const opts = { pixabayKey: 'marginal-yield-fixture', fetcher, onTrace: (t: CompetitionTrace) => traces.push(t) };
  expect((await getImages(word.id, word.senses[0].id, opts)).images).toHaveLength(20);
  expect(fetcher).toHaveBeenCalledTimes(6);
  expect(queries.size).toBe(3);
  expect(traces.filter(t => t.stage === 'round').every(t => (t.newQualified ?? 0) > 0)).toBe(true);
  expect(traces.find(t => t.stage === 'final')?.target).toBe(20);
  expect(JSON.stringify(traces)).not.toContain('marginal-yield-fixture');
  await getImages(word.id, word.senses[0].id, opts);
  expect(fetcher).toHaveBeenCalledTimes(6);
});

it('stops after a repeated round adds no useful unique candidates', async () => {
  const example = largeGalleryCases[0]; const word = dictionaryWord(example.word); const records = largeGalleryRecords(example, 9);
  const fetcher = vi.fn(async input => json(new URL(String(input)).hostname === 'pixabay.com' ? { hits: records.hits } : { results: [] }));
  const result = await getImages(word.id, word.senses[0].id, { pixabayKey: 'diminishing-yield-fixture', fetcher });
  expect(result.images).toHaveLength(9);
  expect(fetcher).toHaveBeenCalledTimes(4);
});
