import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
// Every browser test is independent of configured provider credentials and external services.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/images?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    const images = params.get('word') === '苹果' && params.get('sense') === 'sense-0' ? ['apple', 'apple-basket', 'apple-green', 'apple-halves', 'apple-hand', 'apple-tree', 'apple-slices', 'apple-picking'].map((name, i) => ({ id: `bundled-${i}`, thumbnailUrl: `/photos/${name}.jpg`, largeUrl: `/photos/${name}.jpg`, width: 900, height: 700, alt: 'Apple fruit', source: 'Pexels', sourceUrl: 'https://www.pexels.com/photo/102104/' })) : [];
    await route.fulfill({ json: { status: images.length ? 'curated' : 'unavailable', images: images.slice(0, params.get('mode') === 'thumbnail' ? 1 : 12) } });
  });
});
for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440]) {
  test(`home and word page fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 }); await page.goto('/');
    await expect(page.getByRole('heading', { name: /Every word opens/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto('/#word=苹果'); await expect(page.locator('.word-header h1')).toHaveText('苹果');
    await expect(page.locator('.gallery-grid')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const columns = await page.locator('.gallery-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(columns).toBeGreaterThanOrEqual(1);
  });
}
test('all four search languages, clearing, IME, and keyboard suggestions', async ({ page }) => {
  await page.goto('/'); const input = page.getByRole('combobox');
  await input.fill('apple'); await page.getByRole('button', { name: 'Clear search' }).click(); await expect(input).toBeFocused(); await expect(input).toHaveValue('');
  await input.dispatchEvent('compositionstart'); await input.fill('苹'); await input.press('Enter'); await expect(page).not.toHaveURL(/search|word/); await input.fill('苹果'); await input.dispatchEvent('compositionend', { data: '苹果' }); await input.press('Enter'); await expect(page.locator('.word-header h1')).toHaveText('苹果');
  for (const query of ['蘋果', 'ping guo', 'apple', 'epal']) { await page.getByRole('combobox').fill(query); await page.getByRole('combobox').press('Enter'); await expect(page.getByRole('heading', { name: '苹果', exact: true })).toBeVisible(); }
});
test('full dictionary, unknown word, and error recovery', async ({ page }) => {
  await page.goto('/#search=computer'); await expect(page.locator('.results-page .word-card').first()).toBeVisible({ timeout: 30000 });
  await page.goto('/#search=xyzqzxqzx'); await expect(page.getByText('A different spelling might help.')).toBeVisible();
  const failing = await page.context().newPage(); await failing.route('**/data/cedict.json', route => route.abort()); await failing.goto('/#search=astronomy'); await expect(failing.getByRole('alert')).toContainText('full dictionary is unavailable'); await failing.close();
});
test('preview closes with Escape and returns focus; saves persist', async ({ page }) => {
  await page.goto('/#word=苹果'); const enlarge = page.getByRole('button', { name: /Enlarge picture/ }).first(); await enlarge.click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).not.toBeVisible(); await expect(enlarge).toBeFocused();
  await page.getByRole('button', { name: 'Save word', exact: true }).click(); await page.reload(); await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeVisible(); await page.goto('/#saved='); await expect(page.getByRole('heading', { name: '苹果', exact: true })).toBeVisible();
});
test('separate senses and abstract explanation', async ({ page }) => {
  await page.goto('/#word=开'); await expect(page.getByText('Please open the door.')).toBeVisible(); await page.getByRole('button', { name: /2. to turn on/ }).click(); await expect(page.getByText('Please turn on the light.')).toBeVisible(); await expect(page.getByText('Please open the door.')).not.toBeVisible();
  await page.goto('/#word=因为'); await expect(page.getByText('An idea you can picture.')).toBeVisible(); await expect(page.locator('.gallery-section')).toHaveCount(0);
});
test('12-image gallery handles failure, caches, and responsive layouts', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/images?**', async route => { if (new URL(route.request().url()).searchParams.get('mode') === 'thumbnail') return route.fallback(); calls++; await route.fulfill({ json: { status: 'live', images: Array.from({ length: 12 }, (_, i) => ({ id: `fixture-${i}`, thumbnailUrl: '/photos/apple.jpg', largeUrl: '/photos/apple.jpg', width: 900, height: 700, alt: `Apple test picture ${i + 1}`, source: 'Pixabay', provider: 'pixabay', sourceUrl: 'https://pixabay.com/photos/apple-1/' })) } }); });
  await page.goto('/#word=苹果'); await expect(page.locator('.gallery-grid figure')).toHaveCount(12);
  for (const width of [320, 390, 768, 1024, 1440]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); const cols = await page.locator('.gallery-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length); expect(cols).toBe(width <= 600 ? 2 : width <= 800 ? 3 : 4); }
  await page.goto('/#category=All'); await page.goto('/#word=苹果'); await expect(page.locator('.gallery-grid figure')).toHaveCount(12); expect(calls).toBe(1);
});
test('image failure leaves dictionary and pronunciation usable', async ({ page }) => { await page.route('**/api/images?**', route => route.fulfill({ status: 503, body: '{}' })); await page.goto('/#word=苹果'); await expect(page.getByText('Pictures are temporarily unavailable.', { exact: false })).toBeVisible(); await expect(page.locator('.word-header h1')).toHaveText('苹果'); await expect(page.getByRole('button', { name: 'Listen to 苹果', exact: true }).first()).toBeVisible(); await expect(page.getByRole('button', { name: 'Retry pictures' })).toBeVisible(); });
test('quiz gives correct and incorrect feedback', async ({ page }) => { await page.goto('/#word=苹果'); const quiz = page.locator('.quiz-card'); await quiz.getByRole('button', { name: 'A 猫', exact: true }).click(); await expect(quiz.getByText('Look once more. You can try again!')).toBeVisible(); await quiz.getByRole('button', { name: /苹果/ }).click(); await expect(quiz.getByText('答对了！ That’s right. Well done!')).toBeVisible(); });
test('full dictionary entries can be saved and reopened', async ({ page }) => {
  await page.goto('/#search=computer'); await page.locator('.results-page .word-card-main').first().click();
  await expect(page.locator('.word-header h1')).toBeVisible(); const word = await page.locator('.word-header h1').innerText();
  await page.getByRole('button', { name: 'Save word', exact: true }).click();
  await page.goto('/#saved='); await page.reload();
  await expect(page.getByRole('heading', { name: word, exact: true })).toBeVisible();
  await page.locator('.word-card-main').first().click(); await expect(page.locator('.word-header h1')).toHaveText(word);
});
test('homepage and detail have no serious accessibility violations', async ({ page }) => { for (const url of ['/', '/#word=苹果', '/#word=因为']) { await page.goto(url); await expect(page.locator('h1')).toBeVisible(); const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze(); expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]); } });
test('Pixabay hero, thumbnail and preview use the right sizes and retain attribution', async ({ page }) => {
  await page.route('https://pixabay.com/get/**', route => route.fulfill({ path: 'public/photos/apple.jpg', contentType: 'image/jpeg' }));
  await page.route('**/api/images?**', route => route.fulfill({ json: { status: 'live', expiresAt: Date.now() + 86400000, images: Array.from({ length: 6 }, (_, i) => ({ id: `pixabay-${i}`, provider: 'pixabay', thumbnailUrl: `https://pixabay.com/get/apple-${i}_340.jpg`, displayUrl: `https://pixabay.com/get/apple-${i}_640.jpg`, largeUrl: `https://pixabay.com/get/apple-${i}_1280.jpg`, width: 1600, height: 1200, alt: `Apple fruit ${i}`, source: 'Pixabay', sourceUrl: `https://pixabay.com/photos/apple-${i}/`, photographer: 'Fixture Contributor', photographerUrl: 'https://pixabay.com/users/fixture-1/' })) } }));
  await page.goto('/#word=苹果');
  await expect(page.locator('.gallery-grid figure')).toHaveCount(6);
  await expect(page.locator('.gallery-grid img').first()).toHaveAttribute('src', /_640\.jpg$/);
  await expect(page.locator('.gallery-grid img').nth(1)).toHaveAttribute('src', /_340\.jpg$/);
  await expect(page.locator('.gallery-grid figure').first().getByRole('link', { name: 'Pixabay' })).toHaveAttribute('href', 'https://pixabay.com/photos/apple-0/');
  await page.getByRole('button', { name: 'Enlarge picture: Apple fruit 0' }).click();
  await expect(page.getByRole('dialog').locator('img')).toHaveAttribute('src', /_1280\.jpg$/);
  await page.keyboard.press('ArrowRight'); await expect(page.getByRole('dialog').locator('img')).toHaveAttribute('src', /apple-1_1280/);
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).not.toBeVisible();
});
test('category and related cards lazily request thumbnails, never background galleries', async ({ page }) => {
  const urls: URL[] = [];
  page.on('request', request => { if (request.url().includes('/api/images?')) urls.push(new URL(request.url())); });
  await page.setViewportSize({ width: 390, height: 600 }); await page.goto('/');
  await expect(page.locator('.hero')).toBeVisible(); expect(urls).toHaveLength(0);
  await page.getByRole('button', { name: 'Explore Food', exact: true }).scrollIntoViewIfNeeded();
  await expect.poll(() => urls.length).toBeGreaterThan(0); expect(urls.every(url => url.searchParams.get('mode') === 'thumbnail')).toBe(true);
  await page.goto('/#word=苹果'); await expect(page.locator('.word-header h1')).toHaveText('苹果');
  await page.locator('.related-grid').scrollIntoViewIfNeeded();
  await expect.poll(() => urls.some(url => url.searchParams.get('mode') === 'thumbnail' && url.searchParams.get('word') === '香蕉')).toBe(true);
  expect(urls.filter(url => url.searchParams.get('mode') === 'gallery')).toHaveLength(1);
});
test('a non-curated giraffe entry reaches the gallery through Chinese, traditional, pinyin and English search', async ({ page }) => {
  const requests: URL[] = [];
  await page.route('**/api/images?**', async route => {
    const url = new URL(route.request().url());
    if (!url.searchParams.get('word')?.startsWith('长颈鹿|')) return route.fallback();
    requests.push(url);
    await route.fulfill({ json: { status: 'live', expiresAt: Date.now() + 86400000, images: [{ id: 'pixabay-fixture', provider: 'pixabay', thumbnailUrl: '/photos/cat.jpg', largeUrl: '/photos/cat.jpg', width: 900, height: 700, alt: 'Mocked giraffe visual', source: 'Pixabay', sourceUrl: 'https://pixabay.com/photos/giraffe-1/' }] } });
  });
  for (const query of ['长颈鹿', '長頸鹿', 'chang jing lu', 'giraffe']) {
    await page.goto('/#search=' + encodeURIComponent(query));
    const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: '长颈鹿', exact: true }) }).first();
    await expect(card).toBeVisible({ timeout: 30000 }); await card.click();
    await expect(page.locator('.word-header h1')).toHaveText('长颈鹿');
    await expect(page.getByRole('button', { name: 'Enlarge picture: Mocked giraffe visual' })).toBeVisible();
  }
  expect(new Set(requests.map(url => url.searchParams.get('word')))).toEqual(new Set(['长颈鹿|長頸鹿|chang2 jing3 lu4']));
  expect(requests.every(url => url.searchParams.get('sense') === 'sense-0')).toBe(true);
  expect(requests.some(url => url.searchParams.get('mode') === 'gallery')).toBe(true);
});
