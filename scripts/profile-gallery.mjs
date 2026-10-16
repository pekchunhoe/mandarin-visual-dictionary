// Same semantic data and controlled providers before/after. No real API calls.
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const baseline = process.argv[2]; if (!baseline) throw new Error('Provide rollback project directory');
const fixtureFile = resolve('.tmp/ultra-fast/gallery-fixtures.mjs');
await build({ entryPoints: ['tests/large-gallery-data.ts'], outfile: fixtureFile, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' });
const { largeGalleryCases, largeGalleryRecords } = await import(pathToFileURL(fixtureFile).href);
const reports = [];
for (const legacy of [true, false]) {
  const outfile = resolve(`.tmp/ultra-fast/gallery-${legacy ? 'before' : 'after'}.mjs`);
  await build({ entryPoints: ['server/images.ts'], outfile, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent', plugins: legacy ? [{ name: 'rollback-gallery', setup(builder) { builder.onLoad({ filter: /server[/\\]images\.ts$/ }, () => ({ contents: readFileSync(resolve(baseline, 'server/images.ts'), 'utf8'), loader: 'ts', resolveDir: resolve('server') })); } }] : [] });
  const service = await import(pathToFileURL(outfile).href);
  for (const fast of ['pixabay', 'openverse']) {
    service.clearImageCache(); const records = largeGalleryRecords(largeGalleryCases[1]);
    const start = performance.now(), progress = [], trace = [], calls = [];
    const options = { pixabayKey: 'timing-fixture', onProgress: result => progress.push({ ms: performance.now() - start, count: result.images.length }), onTrace: event => trace.push({ ms: performance.now() - start, ...event }), fetcher: async input => {
      const host = new URL(String(input)).hostname; const provider = host === 'pixabay.com' ? 'pixabay' : 'openverse';
      calls.push(provider); await new Promise(r => setTimeout(r, provider === fast ? 100 : 800));
      return new Response(JSON.stringify(provider === 'pixabay' ? { hits: records.hits.slice(0, 4) } : { results: records.results }));
    } };
    const result = await service.getImages('跑', 'sense-0', options), finalMs = performance.now() - start;
    const count = calls.length, warm = performance.now(); await service.getImages('跑', 'sense-0', options);
    reports.push({ legacy, fast, firstMetadataMs: progress[0]?.ms ?? finalMs, firstFourMs: progress.find(e => e.count >= 4)?.ms ?? finalMs, finalMs, cachedServerMs: performance.now() - warm, requests: count, cachedExtraRequests: calls.length - count, finalCount: result.images.length, uniqueIds: new Set(result.images.map(p => p.id)).size, selectedIds: result.images.map(p => p.id), providers: result.images.reduce((counts,p)=>({ ...counts,[p.provider]: (counts[p.provider]??0)+1 }),{}), progress: progress.filter(e=>e.ms<=finalMs), trace: trace.filter(e=>e.ms<=finalMs) });
  }
}
for (const fast of ['pixabay', 'openverse']) assert.deepEqual(reports.find(r => !r.legacy && r.fast === fast).selectedIds, reports.find(r => r.legacy && r.fast === fast).selectedIds, 'Final gallery selection/order changed');
writeFileSync('.tmp/ultra-fast/gallery-comparison.json', JSON.stringify({ fixture: true, reports }, null, 2));
console.log(JSON.stringify(reports.map(({ trace, ...report }) => report), null, 2));
