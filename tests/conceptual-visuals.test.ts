// @vitest-environment node
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fromRow, refreshWordVisuals, type RawRow } from '../src/lib/dictionary-entry';
import { inferVisualIntent, buildVisualQuery, VISUAL_SCHEMA } from '../src/lib/visual-inference';
import { imageCacheKey, visualQuery } from '../src/lib/visual';
import { imageSearchPlan, providerCacheKey } from '../server/image-plan';
import { clearImageCache, getImages } from '../server/images';
import lexicon from '../src/data/visual-lexicon.json';

// All entries, including starter words, must traverse generic English inference.
vi.mock('../src/data/learning', () => ({ byId: new Map(), words: [] }));
const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
const entries = (text: string) => rows.filter(row => row[1] === text).map(fromRow);
const selected = (text: string, meaning: string) => {
  const word = entries(text).find(word => word.senses.some(s => s.english === meaning))!;
  expect(word, `${text}: ${meaning}`).toBeDefined();
  return { word, sense: word.senses.find(s => s.english === meaning)! };
};
const examples = [
  ['政治', 'politics', 'politics', 'government parliament politics'],
  ['经济', 'economy', 'economy', 'economy business finance'],
  ['金融', 'finance', 'finance', 'finance banking money'],
  ['数学', 'mathematics', 'mathematics', 'mathematics numbers education'],
  ['科学', 'science', 'science', 'science laboratory research'],
  ['文化', 'culture', 'culture', 'culture traditions people'],
  ['法律', 'law', 'law', 'law courthouse justice'],
  ['社会', 'society', 'society', 'community people society'],
  ['教育', 'education', 'education', 'students learning classroom'],
  ['科技', 'science and technology', 'technology', 'technology computers innovation'],
  ['历史', 'history', 'history', 'museum historical documents'],
  ['环境', 'environment', 'environment', 'nature environment conservation'],
  ['健康', 'health', 'health', 'healthcare healthy lifestyle'],
  ['农业', 'agriculture', 'agriculture', 'farming agriculture crops'],
  ['工业', 'industry', 'industry', 'factory manufacturing industry'],
  ['商业', 'commerce', 'business', 'business commerce marketplace'],
  ['艺术', 'art', 'art', 'art painting gallery'],
  ['音乐', 'music', 'music', 'musicians musical instruments'],
  ['体育', 'sports', 'sports', 'sports athletes exercise'],
  ['和平', 'peace', 'peace', 'peace people unity'],
  ['自由', 'freedom; liberty', 'freedom', 'freedom people outdoors'],
  ['合作', 'to cooperate; to collaborate; to work together', 'cooperation', 'cooperation people teamwork'],
  ['友谊', 'friendship', 'friendship', 'friendship people together'],
  ['沟通', 'to communicate', 'communication', 'communication people technology'],
  ['发展', 'development', 'development', 'development progress'],
  ['组织', 'organization', 'organization', 'organization teamwork office']
];
const hits = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, pageURL: `https://pixabay.com/illustrations/concept-${i + 1}/`, webformatURL: `https://cdn.pixabay.com/illustrations/concept-${i + 1}_640.png`, imageWidth: 900, imageHeight: 700, tags: 'concept illustration' }));
beforeEach(clearImageCache);

describe('conceptual content through the selected English meaning', () => {
  it.each(examples)('%s: %s reaches Pixabay and returns a gallery', async (text, meaning, domain, query) => {
    const { word, sense } = selected(text, meaning);
    expect(sense.visualOrigin).toBe('inferred');
    expect(sense.visualType).toBe('conceptual');
    expect(inferVisualIntent(meaning)?.conceptDomain).toBe(domain);
    expect(visualQuery(sense)).toBe(query);
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ hits }) });
    const result = await getImages(word.id, sense.id, { pixabayKey: 'concept-fixture-key', fetcher });
    expect(result.status).toBe('live'); expect(result.images).toHaveLength(6);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const params = new URL(fetcher.mock.calls[0][0]).searchParams;
    expect(params.get('q')).toBe(query); expect(params.get('image_type')).toBe('all');
    expect(params.get('safesearch')).toBe('true'); expect(params.get('lang')).toBe('en');
    await getImages(word.id, sense.id, { pixabayKey: 'concept-fixture-key', fetcher });
    await getImages(word.id, sense.id, { pixabayKey: 'concept-fixture-key', fetcher, mode: 'thumbnail' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it.each(['politics', 'finance', 'mathematics', 'science', 'economics', 'law', 'history', 'education'])('evaluates domain %s as content, with or without annotations', meaning => {
    expect(inferVisualIntent(meaning)?.visualType).toBe('conceptual');
    expect(inferVisualIntent(`(finance) ${meaning}`)?.query).toBe(inferVisualIntent(meaning)?.query);
  });
  it.each(['solidarity', 'resilience', 'social cohesion', 'intergenerational equity', 'to understand', 'possibility', 'particle physics', 'can opener'])('does not reject lexical content %s', meaning => {
    const intent = inferVisualIntent(meaning)!;
    expect(intent).not.toBeNull(); expect(intent.query).toMatch(/^[a-z -]+$/);
    expect(intent.query.length).toBeLessThanOrEqual(100);
  });
  it('retains WordNet abstract categories independently of English query templates', () => {
    const categories = Object.entries(lexicon.nouns).filter(([category]) => category.startsWith('concept:'));
    expect(categories).toHaveLength(18);
    for (const lemma of ['politics', 'mathematics', 'solidarity', 'cooperation', 'development']) {
      expect(categories.some(([, terms]) => terms.split('|').includes(lemma)), lemma).toBe(true);
    }
  });
  it.each([['政治', 'politics'], ['经济', 'economy']])('uses only one simpler fallback for %s, then Pexels', async (text, meaning) => {
    const { word, sense } = selected(text, meaning);
    const fetcher = vi.fn().mockImplementation(async url => ({ ok: true, json: async () => new URL(url).hostname === 'pixabay.com' ? { hits: [] } : { photos: [] } }));
    const result = await getImages(word.id, sense.id, { pixabayKey: 'concept-fixture-key', pexelsKey: 'pexels-fixture-key', fetcher });
    expect(result.status).toBe('unavailable'); expect(fetcher).toHaveBeenCalledTimes(3);
    const urls = fetcher.mock.calls.map(call => new URL(call[0]));
    expect(urls.map(url => url.hostname)).toEqual(['pixabay.com', 'pixabay.com', 'api.pexels.com']);
    expect(urls.slice(0, 2).map(url => url.searchParams.get('q'))).toEqual([sense.visualQuery, meaning]);
    expect(urls.slice(0, 2).every(url => url.searchParams.get('image_type') === 'all')).toBe(true);
  });
  it('reclassifies old saved concepts, retaining definitions, examples and saved IDs', () => {
    const { word } = selected('政治', 'politics');
    const stale = { ...word, senses: word.senses.map(s => ({ ...s, visualType: 'abstract' as const, visualQuery: 'obsolete query', visualOrigin: undefined })) };
    const refreshed = refreshWordVisuals(stale);
    expect(refreshed.id).toBe(stale.id); expect(refreshed.senses[0].english).toBe('politics');
    expect(refreshed.senses[0].examples).toEqual(stale.senses[0].examples);
    expect(refreshed.senses[0].visualQuery).toBe('government parliament politics');
    expect(VISUAL_SCHEMA).toBe('dictionary-visual-v4');
    expect(imageCacheKey(refreshed, refreshed.senses[0])).toContain(VISUAL_SCHEMA);
    expect(providerCacheKey('pixabay', imageSearchPlan(refreshed, refreshed.senses[0])!.primary)).toContain(VISUAL_SCHEMA);
  });
});

describe('grammar and lexical homonyms stay separate', () => {
  it.each('因为 但是 虽然 所以 如果 而且 然而 以及'.split(' '))('%s skips all provider calls', async text => {
    const fetcher = vi.fn();
    for (const word of entries(text)) for (const sense of word.senses) {
      expect(visualQuery(sense), sense.english).toBeNull();
      await getImages(word.id, sense.id, { pixabayKey: 'concept-fixture-key', fetcher });
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([['的', 'de5'], ['了', 'le5'], ['吗', 'ma5'], ['呢', 'ne5']])('%s skips providers for its grammatical pronunciation %s', async (text, pronunciation) => {
    const word = entries(text).find(w => w.numericPinyin === pronunciation)!;
    expect(word).toBeDefined(); const fetcher = vi.fn();
    for (const sense of word.senses) {
      expect(visualQuery(sense), sense.english).toBeNull();
      await getImages(word.id, sense.id, { pixabayKey: 'concept-fixture-key', fetcher });
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('does not suppress lexical homonyms using Mandarin membership', () => {
    expect(selected('了', 'to finish').sense.visualQuery).toBeTruthy();
    expect(selected('呢', 'dense wool fabric (used for coats and jackets)').sense.visualQuery).toBeTruthy();
    expect(buildVisualQuery({ englishMeaning: 'connection', partOfSpeech: 'conjunction' })).toBeNull();
  });
  it('distinguishes a modal from the lexical concept in the same dictionary entry', () => {
    expect(selected('可能', 'maybe').sense.visualQuery).toBeUndefined();
    expect(selected('可能', 'probability').sense.visualType).toBe('conceptual');
  });
  it('uses a domain without copying explanatory annotation text into a query', () => {
    expect(inferVisualIntent('market (finance, e.g. 金融)')?.query).toBe('market finance concept');
    expect(inferVisualIntent('to finance (finance)')?.query).toBe('finance banking money');
  });
});
