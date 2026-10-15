import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test('stored offline model additions retain exact senses, machine labels, and multilingual search', async ({ page }) => {
  test.setTimeout(180000);
  const store = JSON.parse(readFileSync('scripts/data/malay-translations-v1.json', 'utf8'));
  const errors: string[] = [], forbiddenRequests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/huggingface\.co|googleapis\.com|translate\.google\.com|api\.openai\.com/.test(request.url())) forbiddenRequests.push(request.url()); });
  await page.route('**/api/images?**', route => route.fulfill({ json: { status: 'unavailable', images: [] } }));
  for (const [chinese, english] of [['不动产', 'real estate'], ['研究员', 'researcher'], ['肾脏', 'kidney'], ['碳水化合物', 'carbohydrate']]) {
    const record = store.records.find((r: { entryId: string; english: string; translationVersion: string }) => r.entryId.split('|')[0] === chinese && r.english === english && r.translationVersion === 'licensed-sense-concordance-v1');
    expect(record, `New stored machine translation for ${chinese}`).toBeDefined();
    expect(record.translationStatus).toBe('generated'); expect(record.translationQuality).toBe('automated-review-required');
    for (const query of [chinese, english, record.malaySearchTerms[0]]) {
      await page.goto('/#search=' + encodeURIComponent(query));
      const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: chinese, exact: true }) }).first();
      await expect(card).toBeVisible({ timeout: 45000 }); await card.click();
      await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveText(english);
      await expect(page.locator('.meaning-panel p[lang="ms"]')).toHaveText(record.malay);
      await expect(page.locator('.detail-pinyin')).not.toBeEmpty();
      await expect(page.getByText('Machine-translated equivalent · awaiting language review', { exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Translate with Google' })).toHaveCount(0);
    }
  }
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1280, height: 720 });
  const annotation = store.records.find((r: { entryId: string; english: string; translationKind: string }) => r.entryId.split('|')[0] === '丁' && r.english === 'surname Ding' && r.translationKind === 'definition-translation');
  expect(annotation).toBeDefined();
  await page.goto('/#search=' + encodeURIComponent(annotation.malay));
  const surnameCard = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: '丁', exact: true }) }).first();
  await expect(surnameCard).toBeVisible({ timeout: 45000 }); await surnameCard.click();
  await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveText('surname Ding');
  await expect(page.locator('.meaning-panel p[lang="ms"]')).toHaveText(annotation.malay);
  await expect(page.getByText('Machine-translated English definition · awaiting language review', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]); expect(forbiddenRequests).toEqual([]);
});
