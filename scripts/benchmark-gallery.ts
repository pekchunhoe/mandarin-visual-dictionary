import { writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { getImages, clearImageCache } from '../server/images';
import { px, ov } from '../tests/gallery-fixtures';
const requests: { provider: string; query: string | null }[] = [];
const started = performance.now();
const result = await getImages('\u8dd1', 'sense-0', { pixabayKey: 'benchmark-fixture', fetcher: async input => {
 const url = new URL(String(input)); requests.push({ provider: url.hostname, query: url.searchParams.get('q') });
 await new Promise(resolve => setTimeout(resolve, 30));
 return new Response(JSON.stringify(url.hostname === 'pixabay.com' ? { hits: Array.from({ length: 8 }, (_, i) => px(i + 1, i % 2 ? 'person running park outdoors' : 'athlete running track')) } : { results: [ov(99, 'athlete running park outdoors track')] }));
} });
const report = { mode: process.argv[2], latencyMs: Math.round(performance.now() - started), requests, providers: result.images.map(p => p.provider) };
writeFileSync(`.tmp/gallery-benchmark-${process.argv[2]}.json`, JSON.stringify(report, null, 2)); console.log(JSON.stringify(report));
clearImageCache();
