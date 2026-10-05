// @vitest-environment node
import { readFileSync } from 'node:fs';
import { beforeEach, expect, it, vi } from 'vitest';
import { fromRow, type RawRow } from '../src/lib/dictionary-entry';
import { byId } from '../src/data/learning';
import { imageSearchPlan } from '../server/image-plan';
import { imageRelevance, normalizeVisualSearchMeaning, rankImageCandidates } from '../server/visual-search';
import { normalizePixabay } from '../server/providers';
import { clearImageCache, getImages } from '../server/images';

const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
const fear = fromRow(rows.find(row => row[1] === '恐惧')!);
const planFor = (meaning: string) => { const word = fromRow(['測試', '测试', 'ce4 shi4', [meaning]]); return imageSearchPlan(word, word.senses[0])!; };
const hit = (id: number, tags: string, type = 'photo') => ({ id, tags, type, pageURL: `https://pixabay.com/photos/test-${id}/`, webformatURL: `https://pixabay.com/get/test-${id}_640.jpg`, imageWidth: 900, imageHeight: 700 });
const response = (hits: ReturnType<typeof hit>[]) => ({ ok: true, json: async () => ({ hits }) });
beforeEach(clearImageCache);

it.each([
  ['to be frightened', 'frightened'], ['to be happy', 'happy'], ['to become angry', 'angry'],
  ['to run quickly', 'run'], ['the act of swimming', 'swimming'], ['the state of being happy', 'happy'],
  ['a person who teaches', 'teacher'], ['one who teaches', 'teacher'], ['someone who teaches', 'teacher'],
  ['something used for cutting', 'cutting tool'], ['someone who teaches children', 'someone who teaches children']
])('normalizes only meaning-preserving wrappers: %s', (meaning, normalized) => expect(normalizeVisualSearchMeaning(meaning)).toBe(normalized));

it('keeps the exact frightened predicate before related fear expressions', () => {
  const plan = planFor('to be frightened');
  expect(plan.candidates.map(candidate => [candidate.tier, candidate.query])).toEqual([
    ['A', 'frightened person'], ['B', 'scared person'], ['C', 'frightened face']
  ]);
  expect(plan.relevance.related).toEqual(expect.arrayContaining(['fear', 'afraid', 'terrified']));
  expect(planFor('fear').primary.query).toBe('scared person');
});

it.each([
  ['angry', 'angry person'], ['to become angry', 'angry person'], ['to cry', 'person crying'],
  ['to run', 'person running'], ['run', 'person running'], ['to sleep', 'person sleeping'], ['to eat', 'person eating food'],
  ['teacher', 'teacher teaching'], ['a person who teaches', 'teacher teaching'],
  ['the act of swimming', 'person swimming'], ['something used for cutting', 'cutting tool object']
])('prioritizes a directly visible meaning for %s', (meaning, query) => {
  expect(planFor(meaning).primary).toMatchObject({ query, tier: 'A' });
});

it('preserves literal apple disambiguation and the conceptual domain paths', () => {
  const apple = byId.get('苹果')!;
  expect(imageSearchPlan(apple, apple.senses[0])!.primary.query).toBe('apple fruit');
  for (const [meaning, query] of [['politics', 'government parliament politics'], ['economy', 'economy business finance'], ['science', 'science laboratory research'], ['culture', 'culture traditions people'], ['education', 'students learning classroom']]) {
    expect(planFor(meaning).primary).toMatchObject({ query, tier: 'D', imageType: 'all' });
  }
  for (const meaning of ['because', 'already', 'not happy', 'used as a particle']) expect(planFor(meaning)).toBeNull();
  expect(planFor('nervous (physiology)').primary.tier).toBe('D');
  expect(planFor('cold (of water)').primary.query).toBe('cold water');
});

it('ranks semantic metadata before generic people, wrong emotions, popularity, or query tier', () => {
  const plan = planFor('to be frightened');
  const weak = normalizePixabay([hit(1, 'person, portrait, smiling'), hit(2, 'angry, face'), hit(3, 'crowd, police officer'), hit(4, 'woman, neutral portrait')], plan.primary.query);
  const strong = normalizePixabay([hit(5, 'scared, afraid, face'), hit(6, 'terrified, person'), hit(7, 'frightened, child')], plan.supporting.query);
  const ranked = rankImageCandidates([...weak, ...strong], plan);
  expect(ranked.map(photo => photo.id)).toEqual(['pixabay-7', 'pixabay-5', 'pixabay-6']);
  expect(ranked.every(photo => imageRelevance(photo, plan).semantic)).toBe(true);
});

it('keeps meaningful candidates beyond the old 12-result truncation and merges queries before deduplication', () => {
  const plan = planFor('to be frightened');
  const first = normalizePixabay([...Array.from({ length: 20 }, (_, i) => hit(i + 1, 'person, facial expression')), hit(21, 'frightened')], plan.primary.query);
  const second = normalizePixabay([hit(21, 'frightened'), hit(22, 'scared', 'illustration'), hit(23, 'terrified', 'vector')], plan.supporting.query);
  expect(rankImageCandidates([...first, ...second], plan).map(photo => photo.id)).toEqual(['pixabay-21', 'pixabay-22', 'pixabay-23']);
});

it('does not turn generated alt text or missing metadata into semantic evidence', () => {
  const plan = planFor('to be frightened');
  const unknown = normalizePixabay([hit(1, '')], plan.primary.query)[0];
  expect(unknown.alt).toBe('frightened person');
  expect(imageRelevance(unknown, plan).semantic).toBe(false);
  const dog = planFor('dog');
  const broad = normalizePixabay([hit(2, 'animal, nature')], dog.primary.query)[0];
  expect(imageRelevance(broad, dog).semantic).toBe(false);
});

it('runs secondary queries for weak galleries, ranks their strong results first, and reuses cached searches', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(response(Array.from({ length: 20 }, (_, i) => hit(i + 1, 'smiling person, crowd, portrait'))))
    .mockResolvedValueOnce(response(Array.from({ length: 12 }, (_, i) => hit(i + 30, i % 2 ? 'scared person' : 'frightened person', i % 2 ? 'illustration' : 'photo'))));
  const options = { pixabayKey: 'fixture-relevance-key', fetcher };
  const result = await getImages(fear.id, 'sense-0', options);
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(result.images).toHaveLength(12);
  expect(result.images.every(photo => photo.tags?.some(tag => /frightened|scared/.test(tag)))).toBe(true);
  expect(result.images[0].tags).toContain('frightened person');
  await getImages(fear.id, 'sense-0', options);
  await getImages(fear.id, 'sense-0', { ...options, mode: 'thumbnail' });
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it('stops after sufficient strong results and shares concurrent identical searches', async () => {
  const fetcher = vi.fn().mockResolvedValue(response(Array.from({ length: 12 }, (_, i) => hit(i + 1, 'frightened person'))));
  const options = { pixabayKey: 'fixture-relevance-key', fetcher };
  await Promise.all([getImages(fear.id, 'sense-0', options), getImages(fear.id, 'sense-0', options)]);
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it('does not mistake a concrete word category for enough subject matches', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(response(Array.from({ length: 12 }, (_, i) => hit(i + 1, 'fruit, food'))))
    .mockResolvedValueOnce(response(Array.from({ length: 6 }, (_, i) => hit(i + 30, 'apples, fruit'))));
  const result = await getImages('苹果', 'sense-0', { pixabayKey: 'fixture-relevance-key', fetcher });
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(result.images.filter(photo => photo.provider === 'pixabay').every(photo => photo.tags?.includes('apples'))).toBe(true);
});

it('bounds weak-result searches and refuses to fill an emotion gallery with generic portraits', async () => {
  const fetcher = vi.fn().mockResolvedValue(response(Array.from({ length: 12 }, (_, i) => hit(i + 1, 'person, portrait'))));
  const result = await getImages(fear.id, 'sense-0', { pixabayKey: 'fixture-relevance-key', fetcher });
  expect(fetcher).toHaveBeenCalledTimes(4); // Three primary queries, then Openverse.
  expect(result.images).toEqual([]);
  expect(result.status).toBe('unavailable');
});

it('caches different senses independently, even when their emotion family is shared', async () => {
  const fetcher = vi.fn(async (url: string | URL | Request) => new Response(JSON.stringify({ hits: [hit(1, new URL(String(url)).searchParams.get('q')!)] })));
  const options = { pixabayKey: 'fixture-relevance-key', fetcher, mode: 'thumbnail' as const };
  await getImages(fear.id, 'sense-0', options);
  await getImages(fear.id, 'sense-1', options);
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls.map(([url]) => new URL(String(url)).searchParams.get('q'))).toEqual(['frightened person', 'scared person']);
});
