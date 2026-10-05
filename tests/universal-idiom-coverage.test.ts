// @vitest-environment node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { expect, it, vi } from 'vitest';
import { fromRow, type RawRow } from '../src/lib/dictionary-entry';
import { inferVisualIntent } from '../src/lib/visual-inference';
import { idiomGloss } from '../src/lib/idiom-gloss';
import { visualQuery } from '../src/lib/visual';
import { imageSearchPlan } from '../server/image-plan';
import { normalizePixabay } from '../server/providers';
import { rankImageCandidates } from '../server/visual-search';
import { clearImageCache, getImages } from '../server/images';

const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
const cases = [
  ['狼吞虎咽', "to wolf down one's food (idiom); to devour ravenously", "to wolf down one's food; to devour ravenously", 'eat', 'person eating ravenously', 'person actively eating food', 'wolf tiger animal'],
  ['惊慌失措', "to lose one's head out of fear (idiom)", "to lose one's head out of fear", 'panicked', 'panicked person', 'panicked frightened person', 'head anatomy calm portrait'],
  ['人山人海', '(idiom) multitude; vast crowd', 'multitude; vast crowd', 'crowd', 'large crowd', 'large dense crowd of people', 'mountain ocean empty street single person'],
] as const;

it.each(cases)('%s uses the selected English semantics with unchanged presentation', (text, gloss, normalized, predicate, query, good, bad) => {
  const row = rows.find(row => row[1] === text && row[3].includes(gloss))!;
  expect(row).toBeDefined();
  const word = fromRow(row); const sense = word.senses.find(sense => sense.english === gloss)!;
  expect(sense.english).toBe(gloss);
  expect(sense.id).toBe(`sense-${row[3].filter(g => !/^CL:/i.test(g)).indexOf(gloss)}`);
  expect(idiomGloss(gloss).normalized).toBe(normalized);
  expect(inferVisualIntent(gloss)?.semanticPredicate).toBe(predicate);
  const plan = imageSearchPlan(word, sense)!;
  expect(visualQuery(sense)).toBeTruthy(); expect(plan.primary.query).toBe(query);
  expect(plan.candidates.length).toBeGreaterThanOrEqual(3);
  expect(plan.candidates.every(c => c.senseId === sense.id && !/wolf|tiger|head|mountain|sea|idiom|fig\.|[\u3400-\u9fff]/.test(c.query))).toBe(true);
  const photos = normalizePixabay([bad, 'generic person portrait', 'restaurant building food', good].map((tags, id) => ({ id, tags, pageURL: `https://pixabay.com/photos/test-${id}/`, webformatURL: `https://pixabay.com/get/test-${id}_640.jpg`, imageWidth: 900, imageHeight: 700 })), query);
  expect(rankImageCandidates(photos, plan).map(p => p.id)).toEqual(['pixabay-3']);
});

it('retains fear synonyms when reranking the idiom-specific fallback queries', () => {
  const word = fromRow(rows.find(row => row[1] === '惊慌失措')!);
  const plan = imageSearchPlan(word, word.senses[0])!;
  const photos = normalizePixabay(['frightened person', 'scared person', 'generic person portrait', 'head anatomy', 'happy person'].map((tags, id) => ({
    id: id + 1, tags, pageURL: `https://pixabay.com/photos/fear-${id}/`, webformatURL: `https://pixabay.com/get/fear-${id}_640.jpg`, imageWidth: 900, imageHeight: 700
  })), plan.primary.query);
  expect(rankImageCandidates(photos, plan).map(photo => photo.id)).toEqual(['pixabay-1', 'pixabay-2']);
});

it.each([
  ['to lend a helping hand (idiom)', /helping/], ['to burst into tears (idiom)', /crying/],
  ['(idiom) heavy traffic', /traffic/], ['long queue (idiom)', /queue/], ['(idiom) pile of books', /books/],
  ['in complete chaos (idiom)', /chaotic/], ['packed like sardines (idiom)', /crowd/],
  ['(idiom) exhausted', /exhausted|tired/], ['(idiom) confused', /confused/],
  ['(idiom) overjoyed', /happy/], ['fig. to be frightened stiff', /panicked|frightened/],
  ['(idiom) unknown opaque expression', /opaque/], ['to eat (idiom) ravenously', /eating/],
  ['(idiom) multitude; vast crowd', /large crowd/], ['(idiom) obscure notion; confused', /confused/],
  ['(idiom) responsibility; vast crowd', /large crowd/],
  ['(idiom) opaque; abstruse; arcane; ineffable; vast crowd', /large crowd/],
  ['lit. mountain of people (idiom); fig. vast crowd', /large crowd/],
  ['by leaps and bounds; rapid growth (idiom)', /rapid growth/],
])('provides a semantic plan for %s', (gloss, query) => expect(inferVisualIntent(gloss)?.query).toMatch(query));

it('does not treat ordinary label words or cross-references as idiom metadata', () => {
  for (const gloss of ['idiom', 'proverb', 'figuratively', 'figurative meaning (of a word)', 'set phrase', 'it goes without saying', 'to hold back (from saying sth)', 'lightly touching water (as the dragonfly in the idiom 蜻蜓點水)', '(in set phrases like 恩同再造) to save sb']) expect(idiomGloss(gloss).tagged, gloss).toBe(false);
  expect(idiomGloss('(idiom, from Mencius) to help (a person)').normalized).toBe('to help (a person)');
  for (const gloss of ['(modern idiom) opaque idea', '(proverb) wisdom', '(Buddhist saying) wisdom', '(often fig.) confusion', '(lit. and fig.) puppet']) expect(idiomGloss(gloss).tagged, gloss).toBe(true);
});

it('replaces obsolete null expectations with conservative English-only plans', () => {
  for (const gloss of ['fig. however', '(fig.) cold', '(fig.) tiger', 'colloquial fig. cold', 'fig. to kick the bucket', 'kicking the bucket (idiom)', 'unknown opaque expression (idiom)']) expect(inferVisualIntent(gloss)?.query, gloss).toBeTruthy();
  expect(inferVisualIntent('(fig.) cold')?.query).not.toMatch(/winter|weather/);
  for (const gloss of ['however', 'not happy', 'classifier for people', 'used as a particle', 'to kill']) expect(inferVisualIntent(gloss), gloss).toBeNull();
});

it.each(['pixabay', 'pexels'] as const)('tries three bounded semantic queries with only %s configured', async provider => {
  clearImageCache();
  const word = fromRow(rows.find(row => row[1] === '狼吞虎咽')!);
  const queries: string[] = [];
  const fetcher = vi.fn(async (url: string | URL | Request) => {
    if (new URL(String(url)).hostname === 'api.openverse.org') return new Response(JSON.stringify({ results: [] }));
    const params = new URL(String(url)).searchParams;
    const query = params.get('q') ?? params.get('query')!; queries.push(query);
    const ready = queries.length === 3;
    return new Response(JSON.stringify(provider === 'pixabay' ? { hits: ready ? [{ id: 1, tags: 'person actively eating food', pageURL: 'https://pixabay.com/photos/eating-1/', webformatURL: 'https://pixabay.com/get/eating_640.jpg', imageWidth: 900, imageHeight: 700 }] : [] } : { photos: ready ? [{ id: 1, alt: 'person actively eating food', url: 'https://www.pexels.com/photo/eating-1/', src: { medium: 'https://images.pexels.com/photos/1/medium.jpg', large: 'https://images.pexels.com/photos/1/large.jpg' }, width: 900, height: 700 }] : [] }));
  });
  const options = { [provider === 'pixabay' ? 'pixabayKey' : 'pexelsKey']: 'idiom-fallback-fixture', fetcher };
  const result = await getImages(word.id, 'sense-0', options);
  expect(result.status).toBe('live'); expect(result.images[0].provider).toBe(provider);
  expect(queries).toEqual(['person eating ravenously', 'person eating quickly', 'person eating food']);
  await getImages(word.id, 'sense-0', options);
  expect(fetcher.mock.calls.filter(([url]) => new URL(String(url)).hostname !== 'api.openverse.org')).toHaveLength(3);
});

it('bounds primary and Openverse searches to four, with one legacy Pexels fallback', async () => {
  clearImageCache();
  const word = fromRow(rows.find(row => row[1] === '人山人海')!);
  const fetcher = vi.fn(async () => new Response(JSON.stringify({ hits: [], photos: [], results: [] })));
  await getImages(word.id, 'sense-0', { pixabayKey: 'pixabay-fixture', pexelsKey: 'pexels-fixture', fetcher });
  expect(fetcher).toHaveBeenCalledTimes(5);
});

it('gives EVERY idiom-tagged corpus sense a bounded English query plan', () => {
  const totals = { dictionaryRows: rows.length, meaningRecords: rows.reduce((n, row) => n + row[3].length, 0), TOTAL_IDIOM_SENSES: 0, IDIOM_WITH_VISUAL_PLAN: 0, IDIOM_WITHOUT_VISUAL_PLAN: 0, normal: 0, 'idiom-semantic': 0, 'idiom-last-resort': 0 };
  const failures: unknown[] = [];
  for (const row of rows) {
    // Independent minimum inventory prevents a broken detector from shrinking
    // the audit to an easy subset. The total includes all observed extended labels.
    for (const gloss of row[3]) if (/\(idiom\b|\(fig\.\)|^fig\.\s/.test(gloss)) expect(idiomGloss(gloss).tagged, gloss).toBe(true);
    if (!row[3].some(gloss => idiomGloss(gloss).tagged)) continue;
    const word = fromRow(row);
    for (const sense of word.senses) {
      const info = idiomGloss(sense.english); if (!info.tagged) continue;
      totals.TOTAL_IDIOM_SENSES++;
      const intent = inferVisualIntent(sense.english);
      const plan = imageSearchPlan(word, sense);
      const candidates = plan?.candidates.map(candidate => candidate.query) ?? [];
      const valid = visualQuery(sense) && candidates.length > 0 && candidates.length <= 5 && candidates.every(query => /[a-z]{2}/.test(query) && !/[\u3400-\u9fff]|\bidiom\b|\bfig\./.test(query));
      if (valid) totals.IDIOM_WITH_VISUAL_PLAN++;
      else { totals.IDIOM_WITHOUT_VISUAL_PLAN++; failures.push({ word: word.simplified, senseId: sense.id, original: sense.english, normalized: info.normalized, reason: !intent ? 'missing intent' : 'missing or invalid English query', candidates }); }
      if (intent?.planSource) totals[intent.planSource]++;
    }
  }
  mkdirSync('.tmp', { recursive: true });
  writeFileSync('.tmp/idiom-after.json', JSON.stringify({ totals, failures }, null, 2));
  console.log(JSON.stringify(totals, null, 2));
  expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
  expect(totals.TOTAL_IDIOM_SENSES).toBe(8583);
  expect(totals.IDIOM_WITH_VISUAL_PLAN).toBe(totals.TOTAL_IDIOM_SENSES);
  expect(totals.normal + totals['idiom-semantic'] + totals['idiom-last-resort']).toBe(totals.TOTAL_IDIOM_SENSES);
}, 30000);
