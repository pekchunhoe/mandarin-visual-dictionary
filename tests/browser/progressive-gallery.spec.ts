import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { build } from 'esbuild';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { largeGalleryCases, largeGalleryRecords } from '../large-gallery-data';
let service: typeof import('../../server/images');
let server: ReturnType<typeof createServer>, port: number;
test.beforeAll(async () => {
  const outfile = resolve('.tmp/progressive-browser-service.mjs');
  await build({ entryPoints: ['server/images.ts'], outfile, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' });
  service = await import(pathToFileURL(outfile).href);
  server = createServer(async (req, res) => {
    const params = new URL(req.url!, 'http://local').searchParams;
    res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Content-Type', 'application/x-ndjson');
    const records = largeGalleryRecords(largeGalleryCases[1]);
    const emit = (result: unknown, done: boolean) => res.write(JSON.stringify({ result, done }) + '\n');
    const result = await service.getImages(params.get('word')!, params.get('sense')!, { pixabayKey: 'browser-stream-fixture', onProgress: result => emit(result, false), fetcher: async input => {
      const pixabay = new URL(String(input)).hostname === 'pixabay.com';
      await new Promise(r => setTimeout(r, pixabay ? 50 : 2000));
      return new Response(JSON.stringify(pixabay ? { hits: records.hits.slice(0, 4) } : { results: records.results }));
    } });
    emit(result, true); res.end();
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r)); port = (server.address() as { port: number }).port;
});
test.afterAll(async () => { await new Promise<void>(r => server.close(() => r())); });
for (const width of [390, 1280]) test(`real HTTP stream displays early decoded pictures then all 20 at ${width}px`, async ({ page }) => {
  service.clearImageCache(); await page.setViewportSize({ width, height: 844 });
  let calls = 0; const requested: string[] = [];
  await page.route('https://images.example.org/**', route => { requested.push(route.request().url()); return route.fulfill({ path: resolve('public/photos/school.jpg'), contentType: 'image/jpeg' }); });
  await page.route('https://pixabay.com/get/**', route => route.fulfill({ path: resolve('public/photos/school.jpg'), contentType: 'image/jpeg' }));
  await page.route('**/api/images?**', route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('mode') === 'thumbnail') return route.fulfill({ json: { status: 'unavailable', images: [] } });
    calls++; return route.continue({ url: `http://127.0.0.1:${port}/?${params}` });
  });
  await page.goto('/#word=' + encodeURIComponent('跑'));
  await expect(page.locator('.gallery-grid figure').first()).toBeVisible();
  await page.waitForFunction(() => [...document.querySelectorAll('.gallery-grid img')].some(i => (i as HTMLImageElement).naturalWidth > 0));
  expect(await page.locator('.gallery-grid figure').count()).toBeLessThan(20);
  await expect(page.locator('.gallery-section')).toContainText('Finding pictures');
  await expect(page.locator('.gallery-grid figure')).toHaveCount(20, { timeout: 15000 });
  for (const figure of await page.locator('.gallery-grid figure').all()) await figure.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('.gallery-grid img')].filter(i => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0).length === 20);
  expect(requested.filter(url => !url.includes('-thumb'))).toEqual([]);
  await page.locator('.gallery-grid figure').last().getByRole('button').click();
  await expect(page.getByRole('dialog')).toContainText('20 / 20');
  await expect(page.getByRole('dialog').locator('.preview-content > img')).toHaveJSProperty('complete', true);
  await page.getByRole('button', { name: 'Close picture preview' }).click();
  expect(requested.some(url => !url.includes('-thumb'))).toBe(true);
  await page.evaluate(() => { location.hash = ''; }); await expect(page.locator('.hero')).toBeVisible();
  await page.evaluate(() => { location.hash = 'word=' + encodeURIComponent('跑'); });
  await expect(page.locator('.gallery-grid figure')).toHaveCount(20); expect(calls).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
