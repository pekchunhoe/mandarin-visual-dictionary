// @vitest-environment node
import { readFileSync } from 'node:fs';
import { beforeEach, expect, it, vi } from 'vitest';
import { fromRow, refreshWordVisuals, type RawRow } from '../src/lib/dictionary-entry';
import { inferVisualIntent, normalizeVisualMeaning } from '../src/lib/visual-inference';
import { imageCacheKey, visualQuery } from '../src/lib/visual';
import { imageSearchPlan, providerCacheKey } from '../server/image-plan';
import { normalizeVisualSearchMeaning, rankImageCandidates } from '../server/visual-search';
import { normalizePixabay } from '../server/providers';
import { clearImageCache, getImages } from '../server/images';
import { resolveImageWord } from '../server/dictionary';
import { byId } from '../src/data/learning';

const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
const idiom = fromRow(rows.find(row => row[1] === '魂飞魄散')!);
const selected = idiom.senses[1];
const planFor = (meaning: string) => {
  const word = fromRow(['測試', '测试', 'ce4 shi4', [meaning]]);
  return word.senses.length ? imageSearchPlan(word, word.senses[0]) : null;
};
const hit = (id: number, tags: string) => ({ id, tags, pageURL: `https://pixabay.com/photos/idiom-${id}/`, webformatURL: `https://pixabay.com/get/idiom-${id}_640.jpg`, imageWidth: 900, imageHeight: 700 });
beforeEach(clearImageCache);

it('passes the exact selected idiom sense from canonical dictionary resolution to a targeted plan', () => {
  expect(selected).toMatchObject({ id: 'sense-1', english: 'fig. to be frightened stiff', visualType: 'emotion' });
  expect(selected.malay).toBeUndefined();
  expect(resolveImageWord(idiom.id)?.senses[1]).toEqual(selected);
  expect(normalizeVisualMeaning(selected.english)).toBe('to be frightened stiff');
  expect(inferVisualIntent(selected.english)?.semanticPredicate).toBe('frightened');
  expect(normalizeVisualSearchMeaning(selected.english)).toBe('frightened');
  const plan = imageSearchPlan(idiom, selected)!;
  expect(plan.candidates.map(c => c.query)).toEqual(['frightened person', 'scared person', 'frightened face']);
  expect(plan.relevance.exact).toEqual(['frightened']);
  expect(plan.candidates.every(c => c.senseId === 'sense-1' && c.wordId === idiom.id)).toBe(true);
});

it.each(['fig.', 'figurative', 'figuratively:', '(fig.)', '(figurative)', '(idiom)', 'idiom:', 'coll.', 'colloquial', 'slang', 'formal', 'informal', 'archaic', 'dialect'])('normalizes the %s label without changing the displayed definition', label => {
  const meaning = `${label} to be frightened stiff`;
  const word = fromRow(['測試', '测试', 'ce4 shi4', [meaning]]);
  expect(word.senses[0].english).toBe(meaning);
  expect(normalizeVisualMeaning(meaning)).toBe('to be frightened stiff');
  expect(planFor(meaning)?.primary.query).toBe('frightened person');
});

it.each([
  ["spooked out of one's mind", 'spooked person'], ['terror-stricken', 'scared person'],
  ['burst into tears', 'person crying'], ['over the moon', 'happy person'],
  ['lend a helping hand', 'person helping'], ['keep an eye on', 'person watching'],
  ['as busy as a bee', 'person working'], ["lose one's temper", 'angry person'],
  ['lose her temper', 'angry person'], ['a person who is frightened stiff', 'frightened person'],
  ['fig. to be utterly terrified out of your mind', 'terrified person'],
  ['laughing loudly', 'person laughing'], ['running away', 'person running away'],
  ['whispering', 'person whispering'], ['hugging', 'person hugging'], ['hugging someone', 'person hugging'], ['celebrating', 'person celebrating'],
  ['carrying something', 'person carrying'], ['helping someone', 'person helping']
])('extracts the visible predicate from %s', (meaning, query) => {
  expect(planFor(meaning)?.primary.query).toBe(query);
});

it('keeps literal and figurative plans and caches independent', () => {
  const plans = idiom.senses.map(s => imageSearchPlan(idiom, s)!);
  expect(idiom.senses.map(s => s.id)).toEqual(['sense-0', 'sense-1', 'sense-2', 'sense-3']);
  expect(plans[0].primary.query).toContain('soul');
  expect(plans[0].primary.query).not.toMatch(/frightened|scared|terror/);
  for (const plan of plans.slice(1)) expect(plan.primary.query).not.toMatch(/soul|flies|scatters|fig|idiom/);
  expect(new Set(idiom.senses.map(s => imageCacheKey(idiom, s))).size).toBe(4);
  expect(new Set(plans.map(p => providerCacheKey('pixabay', p.primary))).size).toBe(4);
  expect(planFor('lit. over the moon (idiom)')?.primary.query).toContain('moon');
  expect(planFor('lit. over the moon (idiom)')?.relevance.emotion).toBe(false);
});

it('ranks the extracted fear predicate above generic portraits and literal idiom imagery', () => {
  const plan = imageSearchPlan(idiom, selected)!;
  const weak = ['person portrait', 'smiling person', 'flying object', 'soul spirit art', 'dictionary text', 'scenery', 'stiff board'];
  const photos = normalizePixabay([...weak.map((tags, i) => hit(i + 1, tags)), hit(20, 'scared person'), hit(21, 'frightened person'), hit(22, 'terrified face')], plan.primary.query);
  expect(rankImageCandidates(photos, plan).map(p => p.id)).toEqual(['pixabay-21', 'pixabay-20', 'pixabay-22']);
});

it('uses the same bounded provider retrieval, combined reranking, and independent sense caches', async () => {
  const queries: string[] = [];
  const fetcher = vi.fn(async (url: string | URL | Request) => {
    const query = new URL(String(url)).searchParams.get('q')!; queries.push(query);
    const tags = query === 'frightened person' ? 'generic person portrait' : query;
    return new Response(JSON.stringify({ hits: Array.from({ length: 6 }, (_, i) => hit(i + 1, tags)) }));
  });
  const options = { pixabayKey: 'idiom-fixture-key', fetcher };
  const result = await getImages(idiom.id, selected.id, options);
  expect(result.status).toBe('live');
  expect(result.images).toHaveLength(6);
  expect(result.images.every(p => p.tags?.includes('scared person'))).toBe(true);
  expect(queries).toEqual(['frightened person', 'scared person']);
  await getImages(idiom.id, 'sense-2', options);
  await getImages(idiom.id, 'sense-3', options);
  expect(queries).toEqual(['frightened person', 'scared person', 'spooked person', 'scared person']);
  for (const sense of idiom.senses.slice(1)) await getImages(idiom.id, sense.id, options);
  expect(queries).toHaveLength(4);
});

it('reclassifies saved inferred idiom senses while preserving editorial explanations and definitions', () => {
  const stale = { ...idiom, senses: idiom.senses.map(s => ({ ...s, visualType: 'abstract' as const, visualQuery: undefined })) };
  const refreshed = refreshWordVisuals(stale);
  expect(visualQuery(refreshed.senses[1])).toBeTruthy();
  expect(refreshed.senses.map(s => [s.id, s.english])).toEqual(idiom.senses.map(s => [s.id, s.english]));
  const editorial = { ...stale, senses: [{ ...stale.senses[1], visualOrigin: 'curated' as const, chineseExplanation: 'Reviewed explanation' }] };
  expect(refreshWordVisuals(editorial).senses[0]).toEqual(editorial.senses[0]);
});

it.each(['', '没有英文', 'however', 'therefore', 'although', 'fig. however', 'CL:个[ge4]', 'classifier for people', 'grammatical use of 了', 'used as a particle', 'not happy', '(fig.) cold', '(fig.) tiger', 'colloquial fig. cold', 'fig. to kick the bucket', 'kicking the bucket (idiom)', 'unknown opaque expression (idiom)', 'to kill'])('keeps non-imageable or unsupported meaning %j out of provider search', meaning => {
  expect(planFor(meaning)).toBeNull();
});

it.each([['shining', 'visible-adjective'], ['drooping', 'human-state'], ['beaming', 'emotion'], ['steaming', 'physical-state']])('does not reinterpret the existing descriptor %s as an action', (meaning, visualType) => {
  expect(inferVisualIntent(meaning)?.visualType).toBe(visualType);
});

it.each(['formal clothing', 'literary giant', 'slang', 'dialect', 'literal'])('preserves %s when a label word is ordinary semantic content', meaning => {
  expect(normalizeVisualMeaning(meaning)).toBe(meaning);
});

it('preserves modal willingness rather than treating it as a visible action', () => {
  expect(inferVisualIntent('willing (to do sth)')).toMatchObject({ visualType: 'conceptual', query: 'willing concept' });
});

it('retains ordinary concrete and action queries', () => {
  for (const [text, query] of [['苹果', 'apple fruit'], ['狗', 'domestic dog animal'], ['飞机', 'passenger airplane'], ['老师', 'teacher teaching'], ['跑', 'person running action'], ['吃', 'person eating food'], ['游泳', 'person swimming']]) {
    const word = byId.get(text) ?? fromRow(rows.find(row => row[1] === text)!);
    expect(imageSearchPlan(word, word.senses[0])?.primary.query).toBe(query);
  }
});
