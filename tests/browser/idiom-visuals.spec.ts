import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

let service: typeof import('../../server/images');
test.beforeAll(async () => {
  // Bundle the real server entry for Node's JSON import rules, as production does.
  const outfile = resolve('.tmp/idiom-browser-service.mjs');
  await build({ entryPoints: ['server/images.ts'], outfile, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' });
  service = await import(pathToFileURL(outfile).href);
});

for (const [text, gloss, query] of [
  ['狼吞虎咽', "to wolf down one's food (idiom); to devour ravenously", 'person eating ravenously'],
  ['惊慌失措', "to lose one's head out of fear (idiom)", 'panicked person'],
  ['人山人海', '(idiom) multitude; vast crowd', 'large crowd'],
]) test(`${text} mounts the dynamic gallery through the real selected-sense planner`, async ({ page }) => {
  service.clearImageCache();
  const errors: string[] = []; const requests: string[] = []; const queries: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('**/api/images?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('mode') !== 'gallery') return route.fulfill({ json: { status: 'unavailable', images: [] } });
    requests.push(`${params.get('word')}|${params.get('sense')}`);
    const result = await service.getImages(params.get('word')!, params.get('sense')!, {
      pixabayKey: 'universal-idiom-browser-fixture',
      fetcher: async url => {
        if (new URL(String(url)).hostname === 'api.openverse.org') return new Response(JSON.stringify({ results: [] }));
        const actual = new URL(String(url)).searchParams.get('q')!; queries.push(actual);
        // Empty primary exercises bounded fallback inside the real image service.
        const hits = actual === query ? [] : Array.from({ length: 6 }, (_, i) => ({ id: i + 101, tags: actual, pageURL: `https://pixabay.com/photos/universal-${i}/`, webformatURL: `https://pixabay.com/get/universal-${i}_640.jpg`, imageWidth: 900, imageHeight: 700 }));
        return new Response(JSON.stringify({ hits }));
      }
    });
    await route.fulfill({ json: { ...result, images: result.images.map(photo => ({ ...photo, thumbnailUrl: '/photos/school.jpg', displayUrl: '/photos/school.jpg', largeUrl: '/photos/school.jpg' })) } });
  });
  await page.goto('/#word=' + encodeURIComponent(text));
  await expect(page.locator('.word-header h1')).toHaveText(text, { timeout: 30000 });
  const selected = page.getByRole('button', { name: `1. ${gloss}`, exact: true });
  if (text === '狼吞虎咽') await expect(selected).toHaveAttribute('aria-pressed', 'true');
  else await expect(page.getByRole('group', { name: 'Word meaning' })).toHaveCount(0);
  await expect(page.locator('.meaning-panel p').first()).toHaveText(gloss);
  await expect(page.locator('.gallery-grid figure')).toHaveCount(6);
  await expect(page.locator('.gallery-grid img').first()).toBeVisible();
  await expect.poll(() => page.locator('.gallery-grid img').first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator('.abstract-card')).toHaveCount(0);
  expect(queries[0]).toBe(query);
  expect(queries).toHaveLength(query === 'large crowd' ? 2 : 3);
  expect(queries.every(value => !/wolf|tiger|head|mountain|sea|[\u3400-\u9fff]/.test(value))).toBe(true);
  expect(requests).toHaveLength(1); expect(requests[0]).toMatch(/\|sense-0$/);
  // A UI round-trip must use the same selected-sense cache without a request loop.
  await page.getByRole('link', { name: 'Kànjiàn home', exact: true }).click();
  await expect(page.locator('.hero')).toBeVisible();
  await page.goBack();
  await expect(page.locator('.word-header h1')).toHaveText(text);
  await expect(page.locator('.gallery-grid figure')).toHaveCount(6);
  expect(requests).toHaveLength(1); expect(queries).toHaveLength(query === 'large crowd' ? 2 : 3);
  expect(errors).toEqual([]);
});

test('idiom senses use the shared semantic planner and retain loading, error, empty, and independent cached galleries', async ({ page }) => {
  service.clearImageCache();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && !message.text().includes('503')) errors.push(message.text()); });
  const requests: string[] = []; const queries: string[] = [];
  let releaseFear!: () => void;
  const fearReady = new Promise<void>(resolve => { releaseFear = resolve; });
  let terrorAttempts = 0;
  await page.route('**/api/images?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('mode') !== 'gallery') return route.fulfill({ json: { status: 'unavailable', images: [] } });
    const sense = params.get('sense')!; requests.push(sense);
    if (sense === 'sense-3' && ++terrorAttempts === 1) return route.fulfill({ status: 503, json: { error: 'Fixture unavailable' } });
    if (sense === 'sense-3' && terrorAttempts === 3) service.clearImageCache();
    const result = await service.getImages(params.get('word')!, sense, {
      pixabayKey: 'browser-idiom-fixture',
      fetcher: async url => {
        if (new URL(String(url)).hostname === 'api.openverse.org') return new Response(JSON.stringify({ results: [] }));
        const query = new URL(String(url)).searchParams.get('q')!; queries.push(query);
        const tags = query === 'frightened person' ? 'generic person portrait' : query;
        const hits = sense === 'sense-3' && terrorAttempts === 2 ? [] : Array.from({ length: 6 }, (_, i) => ({ id: i + 1, tags, pageURL: `https://pixabay.com/photos/idiom-${i + 1}/`, webformatURL: `https://pixabay.com/get/idiom-${i + 1}_640.jpg`, imageWidth: 900, imageHeight: 700 }));
        return new Response(JSON.stringify({ hits }));
      }
    });
    if (sense === 'sense-1') await fearReady;
    await route.fulfill({ json: { ...result, images: result.images.map(p => ({ ...p, thumbnailUrl: '/photos/school.jpg', displayUrl: '/photos/school.jpg', largeUrl: '/photos/school.jpg', alt: `${sense}: ${p.alt}` })) } });
  });
  await page.goto('/#word=' + encodeURIComponent('魂飞魄散'));
  await expect(page.locator('.word-header h1')).toHaveText('魂飞魄散', { timeout: 30000 });
  await expect(page.locator('.gallery-grid figure')).toHaveCount(6);
  expect(queries[0]).toBe('soul flies away and scatters concept');
  const fear = page.getByRole('button', { name: '2. fig. to be frightened stiff', exact: true });
  await fear.click();
  await expect(fear).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.meaning-panel')).toContainText('fig. to be frightened stiff');
  await expect(page.getByRole('status', { name: 'Loading pictures' })).toBeVisible();
  await expect.poll(() => queries).toContain('frightened person');
  await expect.poll(() => queries).toContain('frightened facial expression');
  await page.getByRole('button', { name: "3. spooked out of one's mind", exact: true }).click();
  await expect(page.getByRole('button', { name: 'Enlarge picture: sense-2: spooked person', exact: true }).first()).toBeVisible();
  const oldResponse = page.waitForResponse(r => new URL(r.url()).searchParams.get('sense') === 'sense-1');
  releaseFear(); await oldResponse;
  await expect(page.getByRole('button', { name: /^Enlarge picture: sense-1: frightened/ })).toHaveCount(0);
  await fear.click();
  await expect(page.getByRole('button', { name: /^Enlarge picture: sense-1: frightened/ }).first()).toBeVisible();
  expect(requests).toEqual(['sense-0', 'sense-1', 'sense-2']);
  await page.getByRole('button', { name: '4. terror-stricken', exact: true }).click();
  await expect(page.locator('.image-notice')).toContainText('Pictures are temporarily unavailable');
  await expect(page.locator('.gallery-grid figure')).toHaveCount(0);
  await page.getByRole('button', { name: 'Retry pictures' }).click();
  await expect(page.locator('.empty-panel')).toBeVisible();
  await expect(page.locator('.image-notice')).toContainText('Try another meaning');
  await page.getByRole('button', { name: 'Retry pictures' }).click();
  await expect(page.getByRole('button', { name: 'Enlarge picture: sense-3: scared person', exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Enlarge picture: sense-3: scared person', exact: true }).first().click();
  await expect(page.getByRole('dialog').locator('img')).toHaveAttribute('alt', 'sense-3: scared person');
  await page.keyboard.press('Escape');
  await expect(page.locator('.abstract-card')).toHaveCount(0);
  expect(requests).toEqual(['sense-0', 'sense-1', 'sense-2', 'sense-3', 'sense-3', 'sense-3']);
  expect(errors).toEqual([]);
});
