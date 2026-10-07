// @vitest-environment node
import { readFileSync } from 'node:fs';
import { beforeEach, expect, it, vi } from 'vitest';
import { fromRow, type RawRow } from '../src/lib/dictionary-entry';
import { inferVisualIntent } from '../src/lib/visual-inference';
import { createVisualInference } from '../src/lib/visual-inference-core';
import { imageSearchPlan } from '../server/image-plan';
import { clearImageCache, getImages } from '../server/images';
import { imageRelevance, rankImageCandidates } from '../server/visual-search';
import { normalizeOpenverse } from '../server/providers';
const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
const word = fromRow(rows.find(row => row[1] === '不耻下问')!);
const gloss = "not feel ashamed to ask and learn from one's subordinates";
const photo = (id: number, title = 'people asking question') => ({ id: `fixture-${id}`, title, tags: [{ name: title }], url: `https://images.example.com/ask-${id}.jpg`, width: 900, height: 700, foreign_landing_url: `https://example.com/ask-${id}`, creator: 'Fixture Creator', creator_url: 'https://example.com/creator', source: 'flickr', license: 'by', license_version: '4.0', license_url: 'https://creativecommons.org/licenses/by/4.0/', attribution: 'Fixture attribution' });
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
beforeEach(clearImageCache);

it('traces the screenshot sense through a real canonical dictionary row into an English definition plan', () => {
  expect(word.pinyin).toBe('bù chǐ xià wèn'); expect(word.senses[0].english).toBe(gloss);
  expect(word.senses[0].chineseExplanation).toBeUndefined(); expect(word.senses[0].examples).toEqual([]);
  const intent = inferVisualIntent(gloss)!;
  expect(intent.planSource).toBe('english-definition'); expect(intent.semanticPredicate).toBe('ask');
  expect(imageSearchPlan(word, word.senses[0])!.candidates.map(c => c.query)).toEqual(['person asking question', 'people asking for advice', 'people learning together']);
  expect(createVisualInference(null).inferVisualIntent(gloss)?.query).toBe(intent.query);
});
it.each([
  ['apple', /apple/], ['to run', /running/], ['heavy', /heavy|body size/], ['to carry a heavy box', /carrying heavy box/],
  ['very frightened', /frightened|scared|panicked/], ['one who repairs cars', /mechanic repairing car/],
  ['to whisper quietly to another person', /whispering/], ['a plant that grows in wet soil', /plant/],
  ['(idiom) pile of books', /books/], ['make a mountain out of a molehill', /exaggerating/],
  [gloss, /asking question/], ['a person who repairs a broken bicycle for another person', /repairing broken bicycle/],
  ['asking for help', /asking/], ['learning from other people', /learning/], ['cooperating with others', /cooperating/],
  ['making a mistake', /mistake/], ['warning someone', /warning/],
  ["Père David's deer (Elaphurus davidianus), species of deer native to China", /pere david's deer/],
  ["(bird species of China) Mrs. Gould's sunbird (Aethopyga gouldiae)", /mrs gould's sunbird/],
  ['bamboo container for a hat used in the capping ceremony 冠禮 in ancient times', /bamboo container/],
  ['leather shoe stuffed with Carex meyeriana 烏拉草, worn during winter', /leather shoe/],
  ['plants such as algae 藻類, moss 苔蘚 and fern 蕨類 that reproduce by spores', /plants/],
  ['yellow dye made from the bark of the 柘 tree', /yellow dye/],
  ["grains of Job's tears plant 薏苡[yi4 yi3]", /grains of job's tears plant/]
])('creates concise English picture queries for %s', (meaning, expected) => {
  const intent = inferVisualIntent(meaning)!;
  expect(intent?.query).toMatch(expected); expect(intent.query.length).toBeLessThanOrEqual(100);
});
it('uses botanical context and edible grains without confusing a plant with a factory', () => {
  const plant = inferVisualIntent('a plant that grows in wet soil')!;
  expect(plant.visualType).toBe('nature'); expect(plant.query).not.toContain('building');
  const grains = inferVisualIntent("grains of Job's tears plant 薏苡[yi4 yi3]")!;
  expect(grains.visualType).toBe('food'); expect(grains.semanticPredicate).toBe('grains');
  expect(grains.fallbackQueries?.join(' ')).not.toContain('plant building');
});
it.each(['not happy', 'not happy / sad', 'not willing to help', 'not able to learn', 'without happiness / happy', 'without fear of water', 'never happy; smiling', 'because', 'however', 'used as a particle', 'happy (a sentence-final particle)', 'classifier for people', 'to kill', 'what a cheek!', 'OK!', 'You swine!', '"Red Poppies", novel by 阿來'])('does not invent a positive scene for %s', meaning => {
  expect(inferVisualIntent(meaning)).toBeNull();
});
it.each(['without hesitation to ask for advice', 'never feel ashamed to ask and learn', 'not be afraid to ask for help'])('preserves the positive action after a negated inhibition: %s', meaning => {
  expect(inferVisualIntent(meaning)).toMatchObject({ semanticPredicate: 'ask', query: 'person asking question', planSource: 'english-definition' });
});
it.each([
  ['a plant that grows in wet soil (used in gardens; ornamental)', /plant/],
  ['to carry a heavy box; to move luggage', /carrying heavy box/],
  ['not feel ashamed to ask and learn from another person (學習; study)', /asking question/],
  ['to teach children who need help with their reading and writing in a classroom', /teaching students/],
  ['politics', /government parliament politics/], ['science', /science/]
])('retains meaning through definition annotations: %s', (meaning, query) => {
  const entry = fromRow(['測試', '测试', 'ce4 shi4', [meaning]]);
  const plan = imageSearchPlan(entry, entry.senses[0])!;
  expect(plan.primary.query).toMatch(query);
  expect(plan.candidates.every(candidate => !/[\u3400-\u9fff]|[();/]/.test(candidate.query))).toBe(true);
});

it.each(['supplement', 'duplicates', 'openverse-fails'])('keeps acceptable primary results through %s', async scenario => {
  const fetcher = vi.fn(async (input: string | URL | Request) => {
    if (new URL(String(input)).hostname === 'pixabay.com') return response({ hits: [{ id: 1, tags: 'asking question', webformatURL: 'https://pixabay.com/get/asking_640.jpg', pageURL: 'https://pixabay.com/photos/asking-1/', imageWidth: 900, imageHeight: 700 }] });
    if (scenario === 'openverse-fails') return response({}, 503);
    return response({ results: [...(scenario === 'duplicates' ? [{ ...photo(99), url: 'https://pixabay.com/get/asking_1280.jpg' }] : []), ...Array.from({ length: 5 }, (_, i) => photo(i + 1))] });
  });
  const result = await getImages(word.id, 'sense-0', { pixabayKey: 'primary-fixture-key', fetcher });
  expect(result.status).toBe('live');
  expect(result.images.filter(p => p.provider === 'pixabay')).toHaveLength(scenario === 'duplicates' ? 0 : 1);
  expect(result.images.filter(p => p.provider === 'openverse')).toHaveLength(scenario === 'openverse-fails' ? 0 : scenario === 'duplicates' ? 6 : 2);
  expect(fetcher.mock.calls.some(([url]) => new URL(String(url)).hostname === 'api.openverse.org')).toBe(true);
});
it('ranks identical metadata identically regardless of provider identity', () => {
  const plan = imageSearchPlan(word, word.senses[0])!;
  const [candidate] = normalizeOpenverse([photo(1)], plan.primary.query);
  expect(imageRelevance(candidate, plan)).toEqual(imageRelevance({ ...candidate, provider: 'pixabay', source: 'Pixabay' }, plan));
});
it.each(['the walls have ears (idiom)', 'to agree on sth', 'as for', 'flying locusts', 'to ask the price', 'to help oneself to food'])('does not invent literal subjects or social roles for %s', meaning => {
  expect(inferVisualIntent(meaning)?.planSource).not.toBe('english-definition');
});
it('retains predicates over generic person/student/object tags, while matching synonyms and morphology', () => {
  const plan = imageSearchPlan(word, word.senses[0])!;
  const candidates = normalizeOpenverse(['person portrait', 'student', 'ashamed embarrassed', 'asking question', 'learning together', 'seeking advice'].map((title, i) => photo(i + 1, title)), plan.primary.query);
  const ranked = rankImageCandidates(candidates, plan);
  expect(ranked[0].id).toBe('openverse-fixture-4');
  expect(ranked.map(p => p.id).sort()).toEqual(['openverse-fixture-4', 'openverse-fixture-5', 'openverse-fixture-6']);
  expect(ranked.every(p => imageRelevance(p, plan).semantic)).toBe(true);
});
it.each(['zero', 'irrelevant', 'failure'])('reaches Openverse and a relevant gallery after Pixabay %s', async primary => {
  const fetcher = vi.fn(async (input: string | URL | Request) => {
    if (new URL(String(input)).hostname === 'pixabay.com') return primary === 'failure' ? response({}, 503) : response({ hits: primary === 'zero' ? [] : [{ id: 1, tags: 'person student portrait', webformatURL: 'https://pixabay.com/get/portrait_640.jpg', pageURL: 'https://pixabay.com/photos/portrait-1/', imageWidth: 900, imageHeight: 700 }] });
    return response({ results: [photo(99, 'student portrait'), ...Array.from({ length: 6 }, (_, i) => photo(i + 1))] });
  });
  const result = await getImages(word.id, 'sense-0', { pixabayKey: 'primary-fixture-key', fetcher });
  expect(fetcher.mock.calls.slice(0, 2).map(([url]) => new URL(String(url)).hostname)).toEqual(['pixabay.com', 'api.openverse.org']);
  expect(result.status).toBe('live'); expect(result.images).toHaveLength(6);
  expect(result.images.every(p => p.provider === 'openverse')).toBe(true);
  expect(result.images[0]).toMatchObject({ photographer: 'Fixture Creator', license: 'by', licenseVersion: '4.0', attribution: 'Fixture attribution' });
  expect(result.diagnostics).toContain('english_definition_plan');
  if (primary === 'irrelevant') expect(result.diagnostics).toContain('pixabay_relevance_rejected');
  await getImages(word.id, 'sense-0', { pixabayKey: 'primary-fixture-key', fetcher });
  expect(fetcher).toHaveBeenCalledTimes(primary === 'failure' ? 3 : 4);
});
it('tries a second Openverse alternative after weak first searches and stops on sufficient matches', async () => {
  const fetcher = vi.fn(async (input: string | URL | Request) => {
    const url = new URL(String(input));
    return response(url.hostname === 'pixabay.com' ? { hits: [] } : { results: url.searchParams.get('q') === 'student asking teacher question classroom' ? Array.from({ length: 6 }, (_, i) => photo(i + 1, i % 2 ? 'student asking teacher classroom' : 'colleague asking advice office')) : [photo(99, 'student portrait')] });
  });
  const result = await getImages(word.id, 'sense-0', { pixabayKey: 'primary-fixture-key', fetcher });
  expect(result.images).toHaveLength(4); expect(fetcher).toHaveBeenCalledTimes(6);
  expect(fetcher.mock.calls.map(([url]) => new URL(String(url)).searchParams.get('q'))).toEqual(['person asking question', 'person asking question', 'student asking teacher question classroom', 'student asking teacher question classroom', 'person asking colleague advice', 'person asking colleague advice']);
});
it('does not return arbitrary images when all alternatives lack predicate evidence', async () => {
  const fetcher = vi.fn(async (url: string | URL | Request) => response(new URL(String(url)).hostname === 'pixabay.com' ? { hits: [] } : { results: [photo(1, 'student portrait')] }));
  const result = await getImages(word.id, 'sense-0', { pixabayKey: 'primary-fixture-key', fetcher });
  expect(result.images).toEqual([]); expect(fetcher).toHaveBeenCalledTimes(4);
  expect(result.diagnostics).toContain('all_results_below_threshold');
});
it('keeps meanings of the same word independent', () => {
  const entry = fromRow(['測試', '测试', 'ce4 shi4', [gloss, 'not happy', 'one who repairs cars']]);
  expect(imageSearchPlan(entry, entry.senses[0])!.primary.query).toBe('person asking question');
  expect(imageSearchPlan(entry, entry.senses[1])).toBeNull();
  expect(imageSearchPlan(entry, entry.senses[2])!.primary.query).toBe('car mechanic repairing car');
});
