import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as [string, string, string, string[]][];

for (const text of ['政治', '经济', '文化', '科学', '法律']) {
  test(`${text} requests conceptual pictures before showing a gallery and preview`, async ({ page }) => {
    const row = rows.find(r => r[1] === text)!;
    const id = `${row[1]}|${row[0]}|${row[2]}`;
    const requests: URL[] = [];
    let releaseGallery!: () => void;
    const galleryReady = new Promise<void>(resolve => { releaseGallery = resolve; });
    await page.route('**/api/images?**', async route => {
      const url = new URL(route.request().url()); requests.push(url);
      if (url.searchParams.get('mode') === 'gallery') await galleryReady;
      await route.fulfill({ json: { status: 'live', expiresAt: Date.now() + 86400000, images: [{ id: 'concept-fixture', provider: 'pixabay', thumbnailUrl: '/photos/school.jpg', largeUrl: '/photos/school.jpg', width: 900, height: 700, alt: `Concept fixture ${text}`, source: 'Pixabay', sourceUrl: 'https://pixabay.com/illustrations/concept-1/' }] } });
    });
    await page.goto('/#search=' + encodeURIComponent(text));
    await page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: text, exact: true }) }).first().click();
    await expect(page.locator('.word-header h1')).toHaveText(text);
    await expect.poll(() => requests.some(url => url.searchParams.get('word') === id && url.searchParams.get('mode') === 'gallery')).toBe(true);
    await expect(page.locator('.abstract-card')).toHaveCount(0);
    releaseGallery();
    await expect(page.locator('.gallery-grid figure')).toHaveCount(1);
    await page.getByRole('button', { name: `Enlarge picture: Concept fixture ${text}`, exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    expect(requests.some(url => url.searchParams.get('word') === id && url.searchParams.get('mode') === 'thumbnail')).toBe(true);
    if (text === '政治') await page.screenshot({ path: '.tmp/politics-visual-regression.png', fullPage: true });
  });
}

test('saved politics and economy replace v3 nonvisual decisions without deleting the words', async ({ page }) => {
  const words = rows.filter(r => ['政治', '经济'].includes(r[1])).map(row => ({ id: `${row[1]}|${row[0]}|${row[2]}`, simplified: row[1], traditional: row[0], pinyin: row[2], numericPinyin: row[2], source: 'CC-CEDICT', senses: [{ id: 'sense-0', english: row[3][0], visualOrigin: 'inferred', visualType: 'abstract', examples: [] }] }));
  await page.addInitScript(words => {
    localStorage.setItem('kanjian-saved', JSON.stringify(words.map(w => w.id)));
    localStorage.setItem('kanjian-saved-entries', JSON.stringify(words));
    localStorage.setItem('kanjian-images', JSON.stringify({ schema: 'dictionary-visual-v3', images: [], status: 'unavailable' }));
  }, words);
  const requests: string[] = [];
  await page.route('**/api/images?**', route => {
    requests.push(route.request().url());
    return route.fulfill({ json: { status: 'live', expiresAt: Date.now() + 86400000, images: [{ id: 'fresh-concept', thumbnailUrl: '/photos/school.jpg', largeUrl: '/photos/school.jpg', width: 900, height: 700, alt: 'Fresh concept fixture', source: 'Pixabay', sourceUrl: 'https://pixabay.com/illustrations/concept-1/' }] } });
  });
  for (const word of words) {
    await page.goto('/#saved=');
    await page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: word.simplified, exact: true }) }).click();
    await expect(page.getByRole('button', { name: 'Enlarge picture: Fresh concept fixture', exact: true })).toBeVisible();
    await expect(page.locator('.abstract-card')).toHaveCount(0);
    expect(requests.some(url => new URL(url).searchParams.get('word') === word.id)).toBe(true);
  }
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kanjian-saved')!))).toEqual(words.map(w => w.id));
});
