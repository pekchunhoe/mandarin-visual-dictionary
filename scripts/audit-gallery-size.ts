import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { fromRow, type RawRow } from '../src/lib/dictionary-entry';
import { byId } from '../src/data/learning';
import { getImages, clearImageCache, type CompetitionTrace } from '../server/images';
import { largeGalleryCases, largeGalleryRecords } from '../tests/large-gallery-data';
import { px, ov } from '../tests/gallery-data';
const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
const measurements = [];
for (const example of largeGalleryCases) {
  clearImageCache();
  const word = byId.get(example.word) ?? fromRow(rows.find(r => r[1] === example.word)!);
  const sense = word.senses.find(s => s.english === example.meaning) ?? word.senses[0];
  const records = largeGalleryRecords(example); const traces: CompetitionTrace[] = [];
  let calls = 0, raw = 0;
  const started = performance.now();
  const result = await getImages(word.id, sense.id, { pixabayKey: 'size-audit-fixture', onTrace: t => traces.push(t), fetcher: async input => {
    calls++;
    await new Promise(resolve => setTimeout(resolve, 20));
    const isPixabay = new URL(String(input)).hostname === 'pixabay.com';
    const body = isPixabay ? { hits: records.hits.slice(0, 18) } : { results: records.results.slice(18) };
    raw += isPixabay ? body.hits!.length : body.results!.length;
    return new Response(JSON.stringify(body));
  } });
  const final = traces.find(t => t.stage === 'final')!;
  const qualified = final.evaluated!.filter(p => p.semantic);
  measurements.push({ word: example.word, meaning: sense.english, calls, rounds: traces.filter(t => t.stage === 'round').length, raw, normalized: final.candidates,
    qualified: qualified.length, deduped: new Set(qualified.map(p => p.id)).size, clusters: new Set(qualified.map(p => p.cluster)).size,
    diversityQualified: final.composition!.length, returned: result.images.length, latencyMs: Math.round(performance.now() - started), providers: final.providerDistribution });
}
// A lower-yield inventory needs three distinct facet searches. Each provider
// returns four strong new scenes and twelve unrelated records per query.
clearImageCache();
const example = largeGalleryCases[0]; const word = byId.get(example.word)!;
const traces: CompetitionTrace[] = []; const queries = new Map<string, number>();
let calls = 0; const started = performance.now();
const result = await getImages(word.id, word.senses[0].id, { pixabayKey: 'depth-audit-fixture', onTrace: t => traces.push(t), fetcher: async input => {
  calls++; await new Promise(resolve => setTimeout(resolve, 20));
  const url = new URL(String(input)); const query = url.searchParams.get('q')!;
  if (!queries.has(query)) queries.set(query, queries.size);
  const offset = queries.get(query)! * 100; const records = largeGalleryRecords(example, 8, offset);
  return new Response(JSON.stringify(url.hostname === 'pixabay.com'
    ? { hits: [...records.hits.slice(0, 4), ...Array.from({ length: 12 }, (_, i) => px(offset + 5000 + i, 'laptop computer technology'))] }
    : { results: [...records.results.slice(4), ...Array.from({ length: 12 }, (_, i) => ov(offset + 5000 + i, 'student portrait classroom'))] }));
} });
const final = traces.find(t => t.stage === 'final')!;
const depthMeasurement = { word: example.word, calls, rounds: queries.size, raw: final.raw, normalized: final.candidates,
  qualified: final.qualified, deduped: final.deduplicated, clusters: final.clusters, diversityQualified: final.diversityQualified,
  returned: result.images.length, latencyMs: Math.round(performance.now() - started),
  roundsDetail: traces.filter(t => t.stage === 'round').map(t => ({ query: t.query, providerCounts: t.providerCounts,
    newUnique: t.newUnique, newQualified: t.newQualified, newFacets: t.newFacets, finalCount: t.finalCount })) };
mkdirSync('.tmp', { recursive: true });
const report = { kind: 'deterministic mock inventory; 20 ms delay per provider request, not live latency', measurements, depthMeasurement };
writeFileSync(process.argv[2] ?? '.tmp/gallery-size-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
