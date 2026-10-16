import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
const store = JSON.parse(readFileSync('scripts/data/malay-translations-v1.json', 'utf8'));

test('lexical enrichment preserves its explanation and is searchable on desktop and mobile', async ({ page }) => {
  test.setTimeout(120000);
  const record = store.records.find((r: { entryId: string; malayLexical?: unknown }) => r.entryId.split('|')[0] === '家俱' && r.malayLexical);
  expect(record).toBeDefined();
  const errors: string[] = [], forbidden: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (/huggingface\.co|translate\.google|translation\.googleapis|api\.openai/.test(r.url())) forbidden.push(r.url()); });
  await page.route('**/api/images?**', r => r.fulfill({ json: { status: 'unavailable', images: [] } }));
  for (const query of ['家俱', 'perabot']) {
    await page.goto('/#search=' + encodeURIComponent(query));
    const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: '家俱', exact: true }) }).first();
    await expect(card).toBeVisible({ timeout: 60000 });
    await expect(card.locator('.card-malay')).toHaveText('perabot');
    await card.click();
    await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveText(record.english);
    await expect(page.locator('.malay-lexical p[lang="ms"]')).toHaveText('perabot');
    await expect(page.locator('.malay-definition p[lang="ms"]')).toHaveText(record.malay);
    await expect(page.getByText('Provisional equivalent · awaiting language review', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Translate with Google' })).toHaveCount(0);
    await page.setViewportSize({ width: 320, height: 700 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.malay-definition p')).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 720 });
  }
  expect(errors).toEqual([]); expect(forbidden).toEqual([]);
});

test('new dictionary-only scientific vocabulary retains its exact sense and provisional status', async ({ page }) => {
  const record = store.records.find((r: { entryId: string; english: string }) => r.entryId.split('|')[0] === '哺乳动物' && r.english === 'mammal');
  expect(record).toBeDefined();
  await page.route('**/api/images?**', r => r.fulfill({ json: { status: 'unavailable', images: [] } }));
  await page.goto('/#search=' + encodeURIComponent('哺乳动物'));
  const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: '哺乳动物', exact: true }) }).first();
  await expect(card).toBeVisible({ timeout: 60000 }); await card.click();
  await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveText('mammal');
  await expect(page.locator('.malay-lexical p[lang="ms"]')).toHaveText('mamalia');
  await expect(page.getByText('Provisional dictionary equivalent · awaiting language review', { exact: true })).toBeVisible();
});
