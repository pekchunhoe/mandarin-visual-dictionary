import { expect, test } from '@playwright/test';

test('Malay lookup carries the matched corpus sense into a combined-provider gallery and reload', async ({ page }) => {
  test.setTimeout(180000);
  const dataRequests: string[] = [], galleryRequests: URL[] = [];
  page.on('request', request => { if (/cedict\.json|malay-runtime.*\.json|visual-lexicon.*\.json/.test(request.url()) && !/[?&](?:import|url)(?:[&=]|$)/.test(request.url())) dataRequests.push(request.url()); });
  await page.route('**/api/images?**', async route => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('mode') === 'gallery') galleryRequests.push(url);
    const count = url.searchParams.get('mode') === 'thumbnail' ? 1 : 20;
    await route.fulfill({ json: { status: 'live', expiresAt: Date.now() + 86400000, images: Array.from({ length: count }, (_, i) => ({
      id: `malay-${url.searchParams.get('sense')}-${i}`, provider: i % 2 ? 'openverse' : 'pixabay',
      thumbnailUrl: '/photos/dog.jpg', largeUrl: '/photos/dog.jpg', width: 900, height: 700,
      alt: `Sense ${url.searchParams.get('sense')} perspective ${i}`, source: i % 2 ? 'Openverse' : 'Pixabay',
      sourceUrl: i % 2 ? 'https://example.org/licensed-photo' : 'https://pixabay.com/photos/dog-1/',
      ...(i % 2 ? { title: 'Licensed perspective', license: 'by', licenseVersion: '4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', attribution: 'Fixture creator, CC BY 4.0' } : {})
    })) } });
  });
  await page.goto('/'); await expect(page.locator('.hero')).toBeVisible();
  expect(dataRequests).toEqual([]);
  for (const [query, chinese, english, senseId] of [
    ['anjing', '狗', 'dog', 'sense-0'],
    ['membantu', '帮助', 'to help; to assist', 'sense-1'],
    ['mendidih', '开', 'to boil', 'sense-3'],
    ['tidak malu bertanya', '不耻下问', "not feel ashamed to ask and learn from one's subordinates", 'sense-0'],
    ['semikonduktor', '半导体', 'semiconductor', 'sense-0'],
    ['kebenaran akhirnya terbongkar', '水落石出', '(fig.) the truth comes to light', 'sense-1']
  ]) {
    await page.goto('/#search=' + encodeURIComponent(query));
    const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: chinese, exact: true }) }).first();
    await expect(card).toBeVisible({ timeout: 45000 });
    await expect(card.locator('[lang="ms"]')).not.toBeEmpty();
    await card.click();
    await expect(page.locator('.word-header h1')).toHaveText(chinese);
    await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveText(english);
    await expect(page.locator('.meaning-panel p[lang="ms"]')).not.toBeEmpty();
    await expect(page.locator('.gallery-grid figure')).toHaveCount(20);
    expect(galleryRequests.at(-1)?.searchParams.get('sense')).toBe(senseId);
    const imageWord = galleryRequests.at(-1)?.searchParams.get('word');
    expect(imageWord === chinese || imageWord?.startsWith(chinese + '|')).toBe(true);
    await page.getByRole('radio', { name: 'Bahasa Melayu only', exact: true }).check();
    await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveCount(0);
    await page.getByRole('radio', { name: 'English + Bahasa Melayu', exact: true }).check();
    await page.reload();
    await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveText(english, { timeout: 45000 });
  }
});

for (const [device, viewport] of [['phone', { width: 390, height: 844 }], ['tablet', { width: 820, height: 1180 }]] as const) {
  test(`long Malay meaning remains readable on ${device}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.route('**/api/images?**', route => route.fulfill({ json: { status: 'unavailable', images: [] } }));
    await page.goto('/#search=' + encodeURIComponent('tidak malu bertanya'));
    const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: '不耻下问', exact: true }) }).first();
    await expect(card).toBeVisible({ timeout: 45000 }); await card.click();
    await expect(page.locator('.meaning-panel p[lang="ms"]')).toContainText('Tidak malu bertanya');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.tmp/malay-${device}.png`, fullPage: true });
  });
}

test('new licensed bulk meanings appear through Mandarin, English and Malay searches', async ({ page }) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/images?**', route => route.fulfill({ json: { status: 'unavailable', images: [] } }));
  for (const [chinese, english, malay] of [
    ['人口普查', 'census', 'banci'],
    ['灯泡', 'light bulb', 'mentol'],
    ['脚踝', 'ankle', 'buku lali'],
    ['研究', 'research', 'penyelidikan']
  ]) {
    for (const query of [chinese, english, malay]) {
      await page.goto('/#search=' + encodeURIComponent(query));
      const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: chinese, exact: true }) }).first();
      await expect(card).toBeVisible({ timeout: 45000 }); await card.click();
      await expect(page.locator('.word-header h1')).toHaveText(chinese);
      await expect(page.locator('.detail-pinyin')).not.toBeEmpty();
      await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveText(english);
      await expect(page.locator('.meaning-panel p[lang="ms"]')).toHaveText(malay);
      await expect(page.getByText('Malay meaning awaiting language review', { exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Malay sources & licenses', exact: true })).toHaveAttribute('href', '/data/MALAY-NOTICE.txt');
    }
  }
  expect(errors).toEqual([]);
});
