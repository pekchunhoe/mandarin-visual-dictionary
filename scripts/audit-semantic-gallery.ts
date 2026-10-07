import { readFileSync, writeFileSync } from 'node:fs';
import { fromRow, type RawRow } from '../src/lib/dictionary-entry';
import { imageSearchPlan } from '../server/image-plan';
import { candidateSemantics, MAX_FACETS, queryIdentity } from '../server/semantic-gallery';
import { rankImageCandidates, imageRelevance } from '../server/visual-search';
import { galleryExamples, examplePool } from '../tests/gallery-fixtures';
const fixturesOnly = process.argv.includes('--fixtures-only');
const previous = fixturesOnly ? JSON.parse(readFileSync('.tmp/gallery-corpus-audit.json', 'utf8')) : undefined;
const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
let eligible = 0, facets = 0, queries = 0, maxFacets = 0, maxQueries = 0;
const failures: unknown[] = []; const categories: Record<string, { count: number; samples: unknown[] }> = {};
for (const row of fixturesOnly ? [] : rows) for (const sense of fromRow(row).senses) {
  if (!/[a-z]/i.test(sense.english)) continue;
  const word = fromRow(row); const plan = imageSearchPlan(word, sense); if (!plan) continue;
  eligible++; facets += plan.facets.length; queries += plan.searches.length;
  maxFacets = Math.max(maxFacets, plan.facets.length); maxQueries = Math.max(maxQueries, plan.searches.length);
  if (plan.facets.length > MAX_FACETS || plan.searches.length > 3 || !plan.searches.length || new Set(plan.searches.map(s => queryIdentity(s.query))).size !== plan.searches.length || plan.searches.some(s => s.query.length > 100 || /[\u3400-\u9fff\u0000-\u001f]/.test(s.query)) || plan.meaning !== sense.english) failures.push({ word: word.id, sense: sense.id });
  const key = plan.relevance.idiom ? 'idiom' : sense.visualType;
  const category = categories[key] ??= { count: 0, samples: [] }; category.count++;
  if (category.samples.length < 12) category.samples.push({ word: word.simplified, meaning: sense.english, facets: plan.facets.map(f => f.id), queries: plan.searches.map(s => s.query) });
}
const examples = galleryExamples.map(example => {
  const { plan, photos } = examplePool(example);
  // Old independent ranking and provider-order ties, on this same fixture pool.
  const before = [...photos].filter(p => imageRelevance(p, plan).semantic).sort((a, b) => imageRelevance(b, plan).score - imageRelevance(a, plan).score).slice(0, 6);
  const after = rankImageCandidates(photos, plan, 6);
  const summarize = (images: typeof photos) => {
    const clusters: Record<string, number> = {}; const providers: Record<string, number> = {};
    images.forEach(p => { const cluster = candidateSemantics(p, plan).cluster; clusters[cluster] = (clusters[cluster] ?? 0) + 1; providers[p.provider!] = (providers[p.provider!] ?? 0) + 1; });
    return { titles: images.map(p => p.title ?? p.tags?.join(', ')), clusters, providers, dominantFraction: Math.max(...Object.values(clusters)) / images.length, symbolic: images.filter(p => candidateSemantics(p, plan).symbolic).length };
  };
  return { word: example.word, meaning: example.meaning, before: summarize(before), after: summarize(after), senseDrift: after.filter(p => !imageRelevance(p, plan).semantic).length };
});
const result = { eligible, averageFacets: facets / eligible, averageUniqueQueries: queries / eligible, maxFacets, maxQueries, failures, categories, fixtureExamples: examples,
  fixtureDominatedBefore: examples.filter(e => e.before.dominantFraction > .5).length, fixtureDominatedAfter: examples.filter(e => e.after.dominantFraction > .5).length,
  fixtureSymbolDominatedBefore: examples.filter(e => e.before.symbolic > 3).length, fixtureSymbolDominatedAfter: examples.filter(e => e.after.symbolic > 3).length };
if (previous) for (const key of ['eligible', 'averageFacets', 'averageUniqueQueries', 'maxFacets', 'maxQueries', 'failures', 'categories']) (result as Record<string, unknown>)[key] = previous[key];
writeFileSync('.tmp/gallery-corpus-audit.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify({ ...result, categories: Object.fromEntries(Object.entries(categories).map(([key, c]) => [key, c.count])) }, null, 2));
if (failures.length || result.eligible !== 177753) process.exitCode = 1;
