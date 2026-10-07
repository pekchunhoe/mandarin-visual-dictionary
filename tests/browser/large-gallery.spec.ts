import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { largeGalleryCases, largeGalleryRecords } from '../large-gallery-data';
import { ov } from '../gallery-data';
let service: typeof import('../../server/images');
test.beforeAll(async () => {
  const outfile = resolve('.tmp/large-gallery-browser-service.mjs');
  await build({ entryPoints: ['server/images.ts'], outfile, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' });
  service = await import(pathToFileURL(outfile).href);
});

async function imageRoutes(page: import('@playwright/test').Page) {
  await page.route('https://images.example.org/**', route => route.fulfill({ path: resolve('public/photos/school.jpg'), contentType: 'image/jpeg' }));
  await page.route('https://pixabay.com/get/**', route => route.fulfill({ path: resolve('public/photos/school.jpg'), contentType: 'image/jpeg' }));
}
for (const example of largeGalleryCases) {
  const widths = example.word === '战战兢兢' ? [375, 768, 1280] : [1280];
  for (const width of widths) test(`${example.word} exposes 20 unique selected-sense pictures at ${width}px`, async ({ page }) => {
    service.clearImageCache(); await page.setViewportSize({ width, height: 900 });
    await imageRoutes(page);
    const providers = new Set<string>(); const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && /same key|unique.*key/i.test(m.text())) errors.push(m.text()); });
    const records = largeGalleryRecords(example);
    await page.route('**/api/images?**', async route => {
      const params = new URL(route.request().url()).searchParams;
      if (params.get('mode') !== 'gallery') return route.fulfill({ json: { status: 'unavailable', images: [] } });
      const result = await service.getImages(params.get('word')!, params.get('sense')!, { pixabayKey: 'large-browser-fixture', fetcher: async input => {
        const host = new URL(String(input)).hostname; providers.add(host);
        return new Response(JSON.stringify(host === 'pixabay.com' ? { hits: records.hits.slice(0, 18) } : { results: [
          ...records.results.slice(18),
          { ...ov(900, 'Knitted sweater'), tags: [], description: 'My grandmother made this sweater with fear and trepidation.' },
          { ...ov(901, 'Animals by a fence'), tags: [], description: 'I approached these animals with trepidation, hoping my camera would work.' }
        ] }));
      } });
      expect(result.images.some(p => ['openverse-scene-900', 'openverse-scene-901'].includes(p.id))).toBe(false);
      await route.fulfill({ json: result });
    });
    await page.goto('/#word=' + encodeURIComponent(example.word));
    await expect(page.locator('.word-header h1')).toHaveText(example.word, { timeout: 30000 });
    if (example.word === '战战兢兢') await page.getByRole('button', { name: '2. with fear and trepidation', exact: true }).click();
    await expect(page.locator('.gallery-grid figure')).toHaveCount(20);
    if (example.word === '战战兢兢' || example.word === '不耻下问') await expect(page.locator('.meaning-panel p').first()).toHaveText(example.meaning);
    const urls = await page.locator('.gallery-grid img').evaluateAll(images => images.map(img => img.getAttribute('src')));
    expect(new Set(urls).size).toBe(20);
    expect([...providers].sort()).toEqual(['api.openverse.org', 'pixabay.com']);
    await expect(page.locator('.gallery-grid').getByRole('link', { name: 'CC BY 4.0' }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const captionsFit = await page.locator('.gallery-grid figcaption').evaluateAll(captions => captions.every(c => c.scrollWidth <= c.clientWidth + 1));
    expect(captionsFit).toBe(true);
    await page.locator('.gallery-grid figure').last().getByRole('button').click();
    await expect(page.getByRole('dialog')).toContainText('20 / 20');
    await page.getByRole('button', { name: 'Close picture preview' }).click();
    const overview = page.locator('.context-cards button'); await expect(overview).toHaveCount(3);
    const overviewUrls = await overview.locator('img').evaluateAll(images => images.map(img => img.getAttribute('src')));
    const overviewAlt = await overview.first().locator('img').getAttribute('alt');
    expect(overviewUrls).not.toEqual(urls.slice(0, 3));
    await overview.first().click(); await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').locator('.preview-content > img')).toHaveAttribute('alt', overviewAlt!);
    expect(errors).toEqual([]);
  });
}

for (const count of [4, 12]) test(`limited inventory exposes exactly ${count} pictures`, async ({ page }) => {
  service.clearImageCache(); await imageRoutes(page);
  await page.route('**/api/images?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('mode') !== 'gallery') return route.fulfill({ json: { status: 'unavailable', images: [] } });
    const records = largeGalleryRecords(largeGalleryCases[1], count);
    const result = await service.getImages(params.get('word')!, params.get('sense')!, { fetcher: async () => new Response(JSON.stringify({ results: records.results })) });
    await route.fulfill({ json: result });
  });
  await page.goto('/#word=' + encodeURIComponent('跑'));
  await expect(page.locator('.gallery-grid figure')).toHaveCount(count);
});
