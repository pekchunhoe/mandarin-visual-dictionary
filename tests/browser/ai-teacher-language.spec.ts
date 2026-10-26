import { test, expect } from '@playwright/test';
import type { TeacherResult } from '../../src/lib/ai-teacher-schema';
import { sentenceText, relationsText } from '../../src/lib/teacher-clipboard';
import { idiomCases, switchOn, happyRelations } from '../teacher-language-fixtures';
import { relations, teacherResponse } from '../teacher-fixtures';

// All results are editorial mock fixtures, never new live outputs. Interception
// covers every teacher request; unmatched requests cannot reach the real API.
test.beforeEach(async ({ page, context, baseURL }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseURL! });
  await page.route('**/api/images?**', route => route.fulfill({ json: { images: [], status: 'unavailable' } }));
  await page.route('**/api/teacher', route => {
    const { word, action } = route.request().postDataJSON();
    let result: TeacherResult | undefined;
    if (action === 'sentences') result = word.startsWith('开') ? switchOn : idiomCases.find(item => item.id === word || item.result.word === word)?.result;
    if (action === 'synonyms-antonyms') result = word.startsWith('高兴') ? happyRelations : word.startsWith('苹果') ? relations : undefined;
    return result ? route.fulfill({ json: teacherResponse(action, result) }) : route.fulfill({ status: 400, json: { code: 'invalid_request' } });
  });
});
const clipboard = async (page: import('@playwright/test').Page) => (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n');

for (const fixture of idiomCases) {
  test(`editorial idiom ${fixture.result.word}: contextual translations and all three clipboard buttons`, async ({ page }) => {
    test.setTimeout(60_000);
    let calls = 0; page.on('request', request => { if (request.url().endsWith('/api/teacher')) calls++; });
    await page.goto(`/#word=${encodeURIComponent(fixture.result.word)}&entry=${encodeURIComponent(fixture.id)}&sense=sense-0`);
    await expect(page.locator('.word-header h1')).toHaveText(fixture.result.word, { timeout: 30_000 });
    expect(calls).toBe(0);
    await page.getByRole('button', { name: /造句 · Example Sentences/ }).click();
    await expect(page.locator('.teacher-sentence')).toHaveCount(3);
    for (const [index, row] of fixture.result.sentences.entries()) {
      const card = page.locator('.teacher-sentence').nth(index);
      await expect(card.locator('[lang="zh-Hans"]')).toContainText(row.chinese);
      await expect(card.locator('[lang="en"]')).toContainText(row.english);
      await expect(card.locator('[lang="ms"]')).toContainText(row.malay);
      await card.getByRole('button', { name: '复制 · Copy', exact: true }).click();
      await expect(card.getByText('已复制 · Copied', { exact: true })).toBeVisible();
      expect(await clipboard(page)).toBe(sentenceText(row));
    }
    expect(calls).toBe(1);
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.ai-teacher').screenshot({ path: `.tmp/teacher-language-${fixture.result.word === '画蛇添足' ? 'addition' : 'remedy'}-${width}.png` });
    }
  });
}

test('broad genuine-vocabulary fixture: Copy All includes collapsed alternatives and all languages', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/#word=高兴&entry=' + encodeURIComponent('高兴|高興|gao1 xing4'));
  await expect(page.locator('.word-header h1')).toHaveText('高兴', { timeout: 30_000 });
  await page.getByRole('button', { name: /近义词和反义词 · Synonyms/ }).click();
  await expect(page.locator('.teacher-relations').first().locator('tbody tr')).toHaveCount(8);
  await expect(page.locator('.teacher-table').getByRole('cell', { name: '欢欣', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '复制全部 · Copy All', exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: '复制全部 · Copy All', exact: true }).click();
  await expect(page.getByText('已复制 · Copied', { exact: true })).toBeVisible();
  expect(await clipboard(page)).toBe(relationsText(happyRelations));
  await page.getByRole('button', { name: /Show all 10/ }).click();
  await expect(page.locator('.teacher-relations').first().locator('tbody tr')).toHaveCount(10);
  for (const row of [...happyRelations.synonyms, ...happyRelations.antonyms]) {
    const displayed = page.locator('.teacher-table tbody tr').filter({ has: page.getByRole('cell', { name: row.chinese, exact: true }) });
    await expect(displayed).toContainText(row.english); await expect(displayed).toContainText(row.malay);
  }
});

test('polysemous entry keeps the chosen switch-on sense in the UI, request and trilingual copy', async ({ page }) => {
  let body: Record<string, string> = {};
  page.on('request', request => { if (request.url().endsWith('/api/teacher')) body = request.postDataJSON(); });
  await page.goto('/#word=开'); await page.getByRole('button', { name: /2. to turn on/ }).click();
  await page.getByRole('button', { name: /造句 · Example Sentences/ }).click();
  await expect(page.locator('.teacher-sentence')).toHaveCount(3);
  expect(body).toEqual({ word: '开', sense: 'sense-2', action: 'sentences' });
  await expect(page.locator('.teacher-sentence').first()).toContainText('Sila pasang lampu');
  await page.locator('.teacher-sentence').first().getByRole('button', { name: '复制 · Copy', exact: true }).click();
  expect(await clipboard(page)).toBe(sentenceText(switchOn.sentences[0]));
});

test('empty antonym fixture retains all three explanations and a complete Copy All result', async ({ page }) => {
  await page.goto('/#word=苹果'); await page.getByRole('button', { name: /近义词和反义词 · Synonyms/ }).click();
  await expect(page.getByText('没有常用的反义词。', { exact: true })).toBeVisible();
  await expect(page.getByText('English: No commonly recognized antonym.', { exact: true })).toBeVisible();
  await expect(page.getByText('Bahasa Melayu: Tiada antonim yang lazim digunakan.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '复制全部 · Copy All', exact: true }).click();
  expect(await clipboard(page)).toBe(relationsText(relations));
});
