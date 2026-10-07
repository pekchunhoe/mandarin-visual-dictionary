// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
import { clearImageCache, getImages, type CompetitionTrace } from '../server/images';
import { imageRelevance, rankImageCandidates } from '../server/visual-search';
import { candidateSemantics, enoughSemanticCoverage, queryIdentity, MAX_FACETS } from '../server/semantic-gallery';
import { normalizeOpenverse, normalizePixabay, openverseRequest } from '../server/providers';
import { askingMeaning, examplePool, galleryExamples, json, ov, planFor, px } from './gallery-fixtures';
import { imageCacheKey } from '../src/lib/visual';
import { IMAGE_SEARCH_STRATEGY, VISUAL_SCHEMA } from '../src/lib/visual-schema';
import { byId } from '../src/data/learning';
import { readFileSync } from 'node:fs';
import { fromRow, type RawRow } from '../src/lib/dictionary-entry';

beforeEach(clearImageCache);
it.each(['pixabay', 'openverse'] as const)('%s wins on semantic evidence, never popularity or provider order', provider => {
  const plan = planFor('to run');
  const p = normalizePixabay([{ ...px(1, provider === 'pixabay' ? 'athlete running' : 'person portrait'), downloads: 9999999 }, px(2, 'running shoes')], plan.primary.query);
  const o = normalizeOpenverse([ov(3, provider === 'openverse' ? 'athlete running' : 'person portrait'), ov(4, 'running shoes')], plan.primary.query);
  expect(rankImageCandidates([...p, ...o], plan)[0].provider).toBe(provider);
  expect(rankImageCandidates([...o, ...p], plan).map(p => p.id)).toEqual(rankImageCandidates([...p, ...o], plan).map(p => p.id));
});
it('starts both providers before waiting and allows Openverse to beat six acceptable Pixabay results', async () => {
  let release!: () => void; const barrier = new Promise<void>(resolve => { release = resolve; });
  const requests: string[] = [];
  const fetcher = vi.fn(async (input: string | URL | Request) => {
    const host = new URL(String(input)).hostname; requests.push(host);
    if (host === 'pixabay.com') { await barrier; return json({ hits: Array.from({ length: 6 }, (_, i) => px(i + 1, 'jogging')) }); }
    release(); return json({ results: [ov(99, 'athlete running outdoors park')] });
  });
  const result = await getImages('跑', 'sense-0', { pixabayKey: 'competition-fixture', fetcher });
  expect(requests.slice(0, 2)).toEqual(['pixabay.com', 'api.openverse.org']);
  expect(result.images[0].provider).toBe('openverse');
  expect(requests.length).toBeLessThanOrEqual(6);
});
it.each(galleryExamples)('$word preserves meaning and composes complementary scenes', example => {
  const { plan, photos } = examplePool(example);
  expect(plan.meaning).toBeTruthy(); expect(plan.facets.length).toBeGreaterThan(2);
  expect(plan.facets.length).toBeLessThanOrEqual(MAX_FACETS);
  const selected = rankImageCandidates(photos, plan, 6);
  const profiles = selected.map(p => candidateSemantics(p, plan));
  expect(new Set(profiles.map(p => p.cluster)).size).toBeGreaterThan(1);
  expect(selected.every(p => imageRelevance(p, plan).semantic)).toBe(true);
  expect(profiles.filter(p => p.symbolic).length).toBeLessThanOrEqual(1);
  expect(selected.map(p => p.id)).toEqual(rankImageCandidates([...photos].reverse(), plan, 6).map(p => p.id));
});
it('retains complete asking/learning meaning, generic rules and scene queries', () => {
  const plan = planFor(askingMeaning);
  expect(plan.meaning).toBe(askingMeaning);
  expect(plan.facets.map(f => f.id)).toEqual(expect.arrayContaining(['education', 'professional', 'interaction']));
  expect(plan.searches).toHaveLength(3);
  expect(new Set(plan.searches.map(c => queryIdentity(c.query))).size).toBe(plan.searches.length);
  expect(queryIdentity('person asking a question')).toBe(queryIdentity('asking question person'));
  expect(plan.facets.every(f => f.intent === askingMeaning)).toBe(true);
});
it('rewards information gain after one symbolic concept and rejects generic portraits', () => {
  const plan = planFor(askingMeaning);
  const candidates = normalizeOpenverse(['red question mark', 'blue question mark', 'hand holding question mark symbol', 'student asking teacher', 'colleague asking advice', 'learner learning together mentor', 'student portrait'].map((t, i) => ov(i + 1, t)), plan.primary.query);
  const selected = rankImageCandidates(candidates, plan, 6);
  expect(selected.some(p => p.title === 'student portrait')).toBe(false);
  expect(selected.filter(p => candidateSemantics(p, plan).symbolic)).toHaveLength(1);
  expect(selected.filter(p => candidateSemantics(p, plan).human)).toHaveLength(3);
  expect(selected[0].title).toContain('student asking');
});
it('accuracy beats diversity; one valid facet and fewer than twelve remain usable', () => {
  const plan = planFor('to run');
  const candidates = normalizePixabay([...Array.from({ length: 6 }, (_, i) => px(i + 1, 'person running athlete')), px(50, 'classroom learning'), px(51, 'running shoes'), px(52, 'running water')], plan.primary.query);
  const result = rankImageCandidates(candidates, plan, 12);
  expect(result).toHaveLength(6);
  expect(result.every(p => p.tags?.includes('person running athlete'))).toBe(true);
});
it.each([
  ['apple fruit', 'apple iphone logo', 'apple fruit sliced'],
  ['mouse (animal)', 'computer mouse keyboard', 'mouse rodent animal'],
  ['bank (financial institution)', 'river bank water', 'bank financial institution building'],
  ['to run', 'running engine software', 'person running athlete'],
  ['to be afraid', 'person happy portrait', 'afraid person trembling']
])('rejects wrong sense before diversity for %s', (meaning, wrong, right) => {
  const plan = planFor(meaning);
  const candidates = normalizeOpenverse([ov(1, wrong), ov(2, right)], plan.primary.query);
  expect(imageRelevance(candidates[0], plan).semantic).toBe(false);
  expect(rankImageCandidates(candidates, plan).map(p => p.id)).toEqual(['openverse-scene-2']);
});
it('selects a cross-provider duplicate once, keeping the winning complete attribution', () => {
  const plan = planFor('apple');
  const p = normalizePixabay([px(1, 'apple')], plan.primary.query);
  const o = normalizeOpenverse([{ ...ov(2, 'apple fruit sliced'), url: p[0].largeUrl }], plan.primary.query);
  const result = rankImageCandidates([...p, ...o], plan);
  expect(result).toHaveLength(1); expect(result[0].license).toBe('by');
  expect(rankImageCandidates([...o, ...p], plan)).toEqual(result);
});
it('repeated metadata cannot inflate quality and generated alt is not evidence', () => {
  const plan = planFor('to run'); const [p] = normalizeOpenverse([ov(1, 'athlete running')], plan.primary.query);
  expect(imageRelevance({ ...p, description: p.title, semanticAlt: p.title, tags: [p.title!, p.title!] }, plan).score).toBe(imageRelevance(p, plan).score);
  expect(imageRelevance({ ...p, title: undefined, tags: [], alt: 'athlete running' }, plan).semantic).toBe(false);
});
it.each(['pixabay', 'openverse'] as const)('isolates %s failure and timeout', async provider => {
  for (const timeout of [false, true]) {
    clearImageCache();
    const fetcher: typeof fetch = async input => {
      const failed = new URL(String(input)).hostname.includes(provider);
      if (failed && timeout) throw new DOMException('fixture timeout', 'TimeoutError');
      return failed ? json({}, 503) : new URL(String(input)).hostname === 'pixabay.com' ? json({ hits: [px(1, 'athlete running')] }) : json({ results: [ov(2, 'athlete running')] });
    };
    const result = await getImages('跑', 'sense-0', { pixabayKey: 'failure-fixture', fetcher });
    expect(result.images[0].provider).toBe(provider === 'pixabay' ? 'openverse' : 'pixabay');
    expect(result.diagnostics).toContain(`${provider}_${timeout ? 'timeout' : 'upstream_failure'}`);
  }
});
it('traces bounded facet rounds, reuses cache, and does not stop on repetitive symbols', async () => {
  const traces: CompetitionTrace[] = [];
  const fetcher = vi.fn(async (input: string | URL | Request) => {
    const url = new URL(String(input));
    const title = url.searchParams.get('q')!.includes('classroom') ? 'student asking teacher classroom' : url.searchParams.get('q')!.includes('colleague') ? 'colleague asking advice office' : 'asking question mark symbol';
    return json(url.hostname === 'pixabay.com' ? { hits: Array.from({ length: 8 }, (_, i) => px(i + (title.includes('classroom') ? 20 : title.includes('colleague') ? 40 : 1), title)) } : { results: [ov(99, title)] });
  });
  const options = { pixabayKey: 'trace-fixture', fetcher, onTrace: (event: CompetitionTrace) => traces.push(event) };
  // Resolve the real non-curated entry by its canonical ID.
  const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
  const word = fromRow(rows.find(row => row[1] === '不耻下问')!);
  const result = await getImages(word.id, 'sense-0', options);
  expect(result.status).toBe('live'); expect(fetcher).toHaveBeenCalledTimes(6);
  expect(traces.filter(t => t.stage === 'round')).toHaveLength(3);
  expect(traces.find(t => t.stage === 'final')?.composition?.some(d => d.coverageGain > 0)).toBe(true);
  await getImages(word.id, 'sense-0', options);
  expect(fetcher).toHaveBeenCalledTimes(6);
  expect(JSON.stringify(traces)).not.toContain('trace-fixture');
});
it('versions only image strategies, retains rich Openverse metadata, caps authenticated and anonymous pages', () => {
  const plan = planFor('apple');
  for (const token of ['', 'fixture-token']) expect(new URL(openverseRequest(plan.primary, token).url).searchParams.get('page_size')).toBe('20');
  const [p] = normalizeOpenverse([{ ...ov(1, 'apple'), description: 'Sliced apple on a table', alt_text: 'Apple halves' }], plan.primary.query);
  expect(p).toMatchObject({ description: 'Sliced apple on a table', semanticAlt: 'Apple halves', photographer: 'Fixture Creator', photographerUrl: 'https://images.example.org/creator', originalProvider: 'flickr', originalSource: 'flickr', license: 'by', providerRank: 0 });
  const word = byId.get('苹果')!;
  expect(imageCacheKey(word, word.senses[0])).toContain(IMAGE_SEARCH_STRATEGY);
  expect(IMAGE_SEARCH_STRATEGY).toBe('dual-provider-360-20-v2'); expect(VISUAL_SCHEMA).toBe('dictionary-visual-v7');
  expect(enoughSemanticCoverage([], plan)).toBe(false);
});

it.each([
  ['apple fruit', 'pear fruit nature', 'apple sliced fruit'],
  ['mouse (animal)', 'elephant animal nature', 'mouse animal'],
  ['cat', 'cat food product', 'cat sleeping home'],
  ['to repair a car', 'person', 'person repairing car'],
  ['to repair a car', 'person repairing', 'person repairing car'],
  ['to repair a car', 'car vehicle', 'person repairing car'],
  ['to carry a heavy box', 'person carrying suitcase', 'person carrying heavy box'],
  ['one who repairs clocks', 'person repairing car', 'person repairing clock']
])('requires specific subject and explicit action object: %s', (meaning, wrong, right) => {
  const plan = planFor(meaning);
  const photos = normalizeOpenverse([ov(1, wrong), ov(2, right)], plan.primary.query);
  expect(rankImageCandidates(photos, plan).map(p => p.id)).toEqual(['openverse-scene-2']);
});
it('does not invent interpersonal facets for a self-directed action or drop a stated object', () => {
  const self = planFor('to help oneself to food');
  expect(self.facets.map(f => f.id)).not.toContain('recipient');
  expect(self.searches.some(s => s.query.includes('oneself'))).toBe(true);
  const figurative = planFor('to bury oneself in work (idiom)');
  expect(figurative.searches.every(s => !/idiom/.test(s.query))).toBe(true);
  expect(figurative.searches[1].query).toContain(figurative.primary.query);
  expect(planFor('to ask the price').searches.some(s => s.query.includes('price'))).toBe(true);
});

it('matches visible assistance through the same helping family without accepting generic people', () => {
  const plan = planFor('assistance; aid');
  const photos = normalizeOpenverse([ov(1, 'person helping elderly neighbor'), ov(2, 'generic people portrait')], plan.primary.query);
  expect(rankImageCandidates(photos, plan).map(p => p.id)).toEqual(['openverse-scene-1']);
});
