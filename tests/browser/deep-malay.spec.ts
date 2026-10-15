import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
const store = JSON.parse(readFileSync('scripts/data/malay-translations-v1.json', 'utf8'));
test('recovered loanwords, protected citations and lexical meanings retain exact senses and mobile layout', async ({ page }) => {
  test.setTimeout(180000);
  const errors: string[] = [], forbidden: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (/huggingface\.co|translate\.google|translation\.googleapis|api\.openai/.test(r.url())) forbidden.push(r.url()); });
  await page.route('**/api/images?**', r => r.fulfill({ json: { status: 'unavailable', images: [] } }));
  for (const [chinese, english] of [['互联网', 'Internet'], ['海啸', 'tsunami'], ['轮椅', 'wheelchair'], ['T裇', 'variant of T恤[T xu4]'], ['B超', 'abbr. for B型超聲|B型超声[B xing2 chao1 sheng1]']]) {
    const record = store.records.find((r: { entryId: string; english: string }) => r.entryId.split('|')[0] === chinese && r.english === english);
    expect(record).toBeDefined();
    for (const query of [chinese, record.malay]) {
      await page.goto('/#search=' + encodeURIComponent(query));
      const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: chinese, exact: true }) }).first();
      await expect(card).toBeVisible({ timeout: 60000 }); await card.click();
      if (query === chinese && record.senseId !== 'sense-0') await page.getByRole('group', { name: 'Word meaning' }).getByRole('button', { name: `${Number(record.senseId.slice(6)) + 1}. ${english}`, exact: true }).click();
      await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveText(english);
      await expect(page.locator('.meaning-panel p[lang="ms"]')).toHaveText(record.malay);
      await expect(page.locator('.detail-pinyin')).not.toBeEmpty();
      const label = record.translationKind === 'definition-translation' ? 'Machine-translated English definition · awaiting language review' : 'Machine-translated equivalent · awaiting language review';
      await expect(page.getByText(label, { exact: true })).toBeVisible();
      await page.setViewportSize({ width: 320, height: 700 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.setViewportSize({ width: 1280, height: 720 });
    }
  }
  expect(errors).toEqual([]); expect(forbidden).toEqual([]);
});
test('all ten requested polysemous English queries keep their selected canonical meanings', async ({ page }) => {
  test.setTimeout(180000);
  await page.route('**/api/images?**', r => r.fulfill({ json: { status: 'unavailable', images: [] } }));
  for (const query of ['bank', 'light', 'charge', 'current', 'spring', 'right', 'match', 'set', 'run', 'break']) {
    await page.goto('/#search=' + query);
    const card = page.locator('.word-card-main').first();
    await expect(card).toBeVisible({ timeout: 60000 });
    const english = await card.locator('p[lang="en"]').innerText();
    await card.click();
    const selected = await page.locator('.meaning-panel p[lang="en"]').innerText();
    expect(selected.split(';')[0]).toBe(english);
    await expect(page.locator('.detail-pinyin')).not.toBeEmpty();
  }
});
