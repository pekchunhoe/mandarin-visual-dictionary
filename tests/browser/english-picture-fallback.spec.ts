import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

let service: typeof import('../../server/images');
test.beforeAll(async () => {
  const outfile = resolve('.tmp/english-browser-service.mjs');
  await build({ entryPoints: ['server/images.ts'], outfile, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' });
  service = await import(pathToFileURL(outfile).href);
});

for (const primary of ['empty', 'rejected', 'partial']) test(`不耻下问 shows Openverse with no reviewed explanation after ${primary} Pixabay`, async ({ page }) => {
  service.clearImageCache();
  const providers: string[] = []; const queries: string[] = []; const errors: string[] = [];
  let galleryRequests = 0;
  page.on('pageerror', error => errors.push(error.message));
  // Only image bytes are fixtures. Keep real provider URLs and metadata in the
  // API response so the browser's validation and attribution path are exercised.
  await page.route('https://images.example.com/**', route => route.fulfill({ path: resolve('public/photos/school.jpg'), contentType: 'image/jpeg' }));
  await page.route('https://pixabay.com/get/**', route => route.fulfill({ path: resolve('public/photos/school.jpg'), contentType: 'image/jpeg' }));
  await page.route('**/api/images?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('mode') !== 'gallery') return route.fulfill({ json: { status: 'unavailable', images: [] } });
    galleryRequests++;
    const result = await service.getImages(params.get('word')!, params.get('sense')!, {
      pixabayKey: 'browser-fixture-key',
      fetcher: async input => {
        const url = new URL(String(input)); providers.push(url.hostname); queries.push(url.searchParams.get('q')!);
        if (url.hostname === 'pixabay.com') return new Response(JSON.stringify({ hits: primary === 'empty' ? [] : [{ id: 1, tags: primary === 'partial' ? 'asking question' : 'generic student portrait', pageURL: 'https://pixabay.com/photos/asking-1/', webformatURL: 'https://pixabay.com/get/asking_640.jpg', imageWidth: 900, imageHeight: 700 }] }));
        return new Response(JSON.stringify({ results: Array.from({ length: primary === 'partial' ? 5 : 6 }, (_, i) => ({ id: `asking-${i}`, title: 'People asking questions and learning together', tags: [{ name: 'asking question' }], url: `https://images.example.com/asking-${i}.jpg`, width: 900, height: 700, foreign_landing_url: `https://example.com/asking-${i}`, creator: 'Learning Photographer', creator_url: 'https://example.com/creator', source: 'flickr', license: 'by', license_version: '4.0', license_url: 'https://creativecommons.org/licenses/by/4.0/' })) }));
      }
    });
    expect(result.diagnostics).toContain('english_definition_plan');
    expect(result.images.filter(image => image.provider === 'openverse')).toHaveLength(primary === 'partial' ? 2 : 6);
    await route.fulfill({ json: result });
  });
  await page.goto('/#word=' + encodeURIComponent('不耻下问'));
  await expect(page.locator('.word-header h1')).toHaveText('不耻下问', { timeout: 30000 });
  await expect(page.locator('.detail-pinyin')).toHaveText('bù chǐ xià wèn');
  await expect(page.locator('.meaning-panel p').first()).toHaveText("not feel ashamed to ask and learn from one's subordinates");
  await expect(page.locator('.definition-card')).toHaveCount(0);
  await expect(page.locator('.example-placeholder')).toBeVisible();
  await expect(page.locator('.gallery-grid figure')).toHaveCount(primary === 'partial' ? 3 : 6);
  const openverse = page.locator('.gallery-grid figure').filter({ hasText: 'Openverse' }).first();
  await expect(openverse).toBeVisible();
  await expect.poll(() => openverse.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(openverse.getByRole('link', { name: 'Learning Photographer' })).toHaveAttribute('href', 'https://example.com/creator');
  await expect(openverse.getByRole('link', { name: 'Openverse / flickr' })).toHaveAttribute('href', /https:\/\/example.com\/asking-\d/);
  await expect(openverse.getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
  expect(providers).toEqual(['pixabay.com', 'api.openverse.org', 'pixabay.com', 'api.openverse.org', 'pixabay.com', 'api.openverse.org']);
  expect(queries).toEqual(['person asking question', 'person asking question', 'student asking teacher question classroom', 'student asking teacher question classroom', 'person asking colleague advice', 'person asking colleague advice']);
  expect(galleryRequests).toBe(1); expect(errors).toEqual([]);
  await page.screenshot({ path: `.tmp/english-fallback-${primary}.png`, fullPage: true });
});
