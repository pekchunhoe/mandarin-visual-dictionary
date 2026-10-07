import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { galleryExamples, px, ov } from '../gallery-data';
let service: typeof import('../../server/images');
test.beforeAll(async () => {
  const outfile = resolve('.tmp/gallery-browser-service.mjs');
  await build({ entryPoints: ['server/images.ts'], outfile, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' });
  service = await import(pathToFileURL(outfile).href);
});
for (const [index, example] of galleryExamples.entries()) for (const width of [375, 768, 1280]) {
  test(`complementary gallery ${index + 1} at ${width}px`, async ({ page }) => {
    service.clearImageCache(); await page.setViewportSize({ width, height: 900 });
    const providers = new Set<string>(); const errors: string[] = [];
    let selectedCount = 0;
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://images.example.org/**', route => route.fulfill({ path: resolve('public/photos/school.jpg'), contentType: 'image/jpeg' }));
    await page.route('https://pixabay.com/get/**', route => route.fulfill({ path: resolve('public/photos/school.jpg'), contentType: 'image/jpeg' }));
    await page.route('**/api/images?**', async route => {
      const params = new URL(route.request().url()).searchParams;
      if (params.get('mode') !== 'gallery') return route.fulfill({ json: { status: 'unavailable', images: [] } });
      const traces: import('../../server/images').CompetitionTrace[] = [];
      const result = await service.getImages(params.get('word')!, params.get('sense')!, {
        onTrace: event => traces.push(event),
        pixabayKey: 'browser-gallery-fixture', fetcher: async input => {
          const host = new URL(String(input)).hostname; providers.add(host);
          return new Response(JSON.stringify(host === 'pixabay.com'
            ? { hits: [...Array.from({ length: 6 }, (_, i) => px(i + 1, example.repeated)), px(20, example.scenes[0]), px(80, 'generic student portrait'), px(81, 'iphone computer river bank running shoes')] }
            : { results: example.scenes.slice(1).map((title, i) => ov(i + 30, title)) }));
        }
      });
      if (index !== 1 || params.get('sense') === 'sense-1') {
        expect(result.status).toBe('live');
        expect(result.images.length).toBeLessThan(12);
        expect(result.images.some(p => p.id === 'pixabay-80' || p.id === 'pixabay-81')).toBe(false);
        expect(result.images.some(p => p.provider === 'openverse')).toBe(true);
        expect(result.images.some(p => p.provider === 'pixabay')).toBe(true);
        const final = traces.find(event => event.stage === 'final')!;
        const selected = final.composition!;
        expect(final.evaluated!.filter(candidate => result.images.some(photo => photo.id === candidate.id)).every(candidate => candidate.semantic)).toBe(true);
        expect(selected.filter(candidate => candidate.cluster === 'symbol').length).toBeLessThanOrEqual(1);
        expect(new Set(selected.map(candidate => candidate.cluster)).size).toBeGreaterThan(1);
        for (const cluster of new Set(selected.map(candidate => candidate.cluster)))
          expect(selected.filter(candidate => candidate.cluster === cluster).length).toBeLessThanOrEqual(2);
        expect(selected.some(candidate => candidate.coverageGain > 0)).toBe(true);
        expect(traces.filter(event => event.stage === 'round').length).toBeLessThanOrEqual(3);
        if (index === 0) {
          expect(traces[0].english).toBe(example.meaning);
          expect(selected[0].cluster).not.toBe('symbol');
        }
        if (index === 1) expect(traces[0].queries!.every(query => !/soul|flies|scatter/.test(query))).toBe(true);
        selectedCount = result.images.length;
      }
      await route.fulfill({ json: result });
    });
    await page.goto('/#word=' + encodeURIComponent(example.word));
    await expect(page.locator('.word-header h1')).toHaveText(example.word, { timeout: 30000 });
    if (index === 1) await page.getByRole('button', { name: '2. fig. to be frightened stiff', exact: true }).click();
    await expect(page.locator('.gallery-grid figure').filter({ hasText: 'Openverse' }).first()).toBeVisible();
    await expect(page.locator('.gallery-grid figure').filter({ hasText: 'Pixabay' }).first()).toBeVisible();
    await expect(page.locator('.gallery-grid figure')).toHaveCount(selectedCount);
    await expect(page.locator('.gallery-grid').getByRole('link', { name: 'CC BY 4.0' }).first()).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
    expect([...providers].sort()).toEqual(['api.openverse.org', 'pixabay.com']);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    if (index === 0) await page.screenshot({ path: `.tmp/gallery-${width}.png`, fullPage: true });
  });
}
for (const mode of ['pixabay-only', 'openverse-only', 'pixabay-first', 'openverse-first', 'pixabay-failure', 'openverse-failure']) {
  test(`provider competition renders ${mode}`, async ({ page }) => {
    service.clearImageCache();
    let first = '';
    await page.route('https://images.example.org/**', route => route.fulfill({ path: resolve('public/photos/running.jpg'), contentType: 'image/jpeg' }));
    await page.route('https://pixabay.com/get/**', route => route.fulfill({ path: resolve('public/photos/running.jpg'), contentType: 'image/jpeg' }));
    await page.route('**/api/images?**', async route => {
      const params = new URL(route.request().url()).searchParams;
      if (params.get('mode') !== 'gallery') return route.fulfill({ json: { status: 'unavailable', images: [] } });
      const result = await service.getImages(params.get('word')!, params.get('sense')!, {
        pixabayKey: 'browser-provider-fixture', fetcher: async input => {
          const isPixabay = new URL(String(input)).hostname === 'pixabay.com';
          const provider = isPixabay ? 'pixabay' : 'openverse';
          if (mode === `${provider}-failure`) return new Response('{}', { status: 503 });
          const wrong = mode === `${isPixabay ? 'openverse' : 'pixabay'}-only`;
          const exact = mode === `${provider}-first` || !mode.endsWith('-first');
          const title = wrong ? 'running shoes product' : exact ? 'athlete running outdoors' : 'jogging';
          return new Response(JSON.stringify(isPixabay ? { hits: [px(1, title)] } : { results: [ov(2, title)] }));
        }
      });
      first = result.images[0].provider!;
      expect(result.images.length).toBeLessThanOrEqual(2);
      await route.fulfill({ json: result });
    });
    await page.goto('/#word=' + encodeURIComponent('\u8dd1'));
    await expect(page.locator('.gallery-grid figure').first()).toBeVisible();
    const winner = mode.startsWith('pixabay') ? mode.endsWith('failure') ? 'openverse' : 'pixabay' : mode.endsWith('failure') ? 'pixabay' : 'openverse';
    expect(first).toBe(winner);
    await expect(page.locator('.gallery-grid figure').first()).toContainText(winner === 'pixabay' ? 'Pixabay' : 'Openverse');
  });
}

test('six relevant images survive a single-facet pool, duplicates and reversed provider completion', async ({ page }) => {
  let order = 'pixabay';
  let release!: () => void;
  let barrier: Promise<void>;
  let selected: string[] = [];
  const calls: string[] = [];
  await page.route('https://images.example.org/**', route => route.fulfill({ path: resolve('public/photos/running.jpg'), contentType: 'image/jpeg' }));
  await page.route('https://pixabay.com/get/**', route => route.fulfill({ path: resolve('public/photos/running.jpg'), contentType: 'image/jpeg' }));
  await page.route('**/api/images?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('mode') !== 'gallery') return route.fulfill({ json: { status: 'unavailable', images: [] } });
    const result = await service.getImages(params.get('word')!, params.get('sense')!, {
      pixabayKey: 'browser-single-facet-fixture', fetcher: async input => {
        const url = new URL(String(input));
        const provider = url.hostname === 'pixabay.com' ? 'pixabay' : 'openverse';
        calls.push(provider);
        if (provider !== order) await barrier;
        else release();
        // Openverse supplies a duplicate plus irrelevant alternative contexts.
        // Neither a second copy nor diversity filler may increase the count.
        const hits = Array.from({ length: 6 }, (_, i) => px(i + 1, 'person running athlete'));
        const results = [{ ...ov(99, 'person running athlete'), url: hits[0].webformatURL }, ov(90, 'student learning classroom'), ov(91, 'running shoes product'), ov(92, 'swimming pool athlete')];
        if (order === 'openverse') { hits.reverse(); results.reverse(); }
        return new Response(JSON.stringify(provider === 'pixabay' ? { hits } : { results }));
      }
    });
    expect(result.images).toHaveLength(6);
    expect(result.images.every(photo => photo.alt === 'person running athlete')).toBe(true);
    selected = result.images.map(photo => photo.id);
    await route.fulfill({ json: result });
  });
  const selections: string[][] = [];
  for (order of ['pixabay', 'openverse']) {
    service.clearImageCache(); calls.length = 0;
    barrier = new Promise<void>(resolve => { release = resolve; });
    await page.goto('/#word=' + encodeURIComponent('跑'));
    if (selections.length) await page.reload();
    await expect(page.locator('.gallery-grid figure')).toHaveCount(6);
    expect(calls).toHaveLength(6);
    expect(calls.filter(provider => provider === 'openverse')).toHaveLength(3);
    selections.push([...selected]);
    const rendered = await page.locator('.gallery-grid img').evaluateAll(images => images.map(image => image.getAttribute('src')));
    expect(new Set(rendered).size).toBe(6);
  }
  expect(selections[1]).toEqual(selections[0]);
});

test('Openverse competes after six good Pixabay results and can render first', async ({ page }) => {
  service.clearImageCache();
  const providers: string[] = [];
  await page.route('https://images.example.org/**', route => route.fulfill({ path: resolve('public/photos/running.jpg'), contentType: 'image/jpeg' }));
  await page.route('https://pixabay.com/get/**', route => route.fulfill({ path: resolve('public/photos/running.jpg'), contentType: 'image/jpeg' }));
  await page.route('**/api/images?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('mode') !== 'gallery') return route.fulfill({ json: { status: 'unavailable', images: [] } });
    const result = await service.getImages(params.get('word')!, params.get('sense')!, {
      pixabayKey: 'browser-six-good-fixture', fetcher: async input => {
        const host = new URL(String(input)).hostname; providers.push(host);
        return new Response(JSON.stringify(host === 'pixabay.com'
          ? { hits: Array.from({ length: 6 }, (_, i) => px(i + 1, 'jogging')) }
          : { results: [ov(99, 'athlete running outdoors park')] }));
      }
    });
    expect(result.images[0].provider).toBe('openverse');
    await route.fulfill({ json: result });
  });
  await page.goto('/#word=' + encodeURIComponent('跑'));
  await expect(page.locator('.gallery-grid figure').first()).toContainText('Openverse');
  expect(providers.slice(0, 2)).toEqual(['pixabay.com', 'api.openverse.org']);
  expect(providers.length).toBeLessThanOrEqual(6);
});

test('a broken provider image keeps attribution, meaning and pronunciation usable', async ({ page }) => {
  service.clearImageCache();
  await page.route('https://images.example.org/**', route => route.abort());
  await page.route('**/api/images?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('mode') !== 'gallery') return route.fulfill({ json: { status: 'unavailable', images: [] } });
    const result = await service.getImages(params.get('word')!, params.get('sense')!, {
      fetcher: async () => new Response(JSON.stringify({ results: [ov(1, 'athlete running')] }))
    });
    await route.fulfill({ json: result });
  });
  await page.goto('/#word=' + encodeURIComponent('跑'));
  const figure = page.locator('.gallery-grid figure');
  await expect(figure).toHaveCount(1);
  await expect(figure.getByText('Picture unavailable')).toBeVisible();
  await expect(figure.getByRole('link', { name: 'Fixture Creator' })).toHaveAttribute('href', 'https://images.example.org/creator');
  await expect(figure.getByRole('link', { name: 'Openverse / flickr' })).toBeVisible();
  await expect(figure.getByRole('link', { name: 'CC BY 4.0' })).toBeVisible();
  await expect(page.locator('.meaning-panel p').first()).toHaveText('to run');
  await expect(page.getByRole('button', { name: 'Listen to 跑', exact: true }).first()).toBeVisible();
});

test('an explicit repair action needs both the action and its object through the dictionary path', async ({ page }) => {
  service.clearImageCache();
  await page.route('https://images.example.org/**', route => route.fulfill({ path: resolve('public/photos/school.jpg'), contentType: 'image/jpeg' }));
  await page.route('**/api/images?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('mode') !== 'gallery') return route.fulfill({ json: { status: 'unavailable', images: [] } });
    const result = await service.getImages(params.get('word')!, params.get('sense')!, {
      fetcher: async () => new Response(JSON.stringify({ results: [
        ov(1, 'person'), ov(2, 'person repairing'), ov(3, 'bike vehicle'), ov(4, 'person repairing bike')
      ] }))
    });
    await route.fulfill({ json: result });
  });
  await page.goto('/#word=' + encodeURIComponent('修车'));
  await expect(page.locator('.word-header h1')).toHaveText('修车', { timeout: 30000 });
  await expect(page.locator('.meaning-panel p').first()).toHaveText('to repair a bike (car etc)');
  await expect(page.locator('.gallery-grid figure')).toHaveCount(1);
  await expect(page.locator('.gallery-grid img')).toHaveAttribute('alt', 'person repairing bike');
});
