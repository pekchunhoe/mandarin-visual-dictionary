import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import type { TeacherResponse, SentenceResult, RelationResult } from '../../src/lib/ai-teacher-schema';
import { TEACHER_MODEL, TEACHER_VERSION } from '../../src/lib/ai-teacher-schema';
import { sentenceText, relationsText } from '../../src/lib/teacher-clipboard';

// Opt-in replay of already captured live outputs. This suite NEVER calls Gemini.
// Normal browser tests skip it; creating a recording requires separate explicit authorization.
const recordingPath = process.env.KANJIAN_TEACHER_RECORDING;
type Recording = { request: { word: string; headword: string; sense: string; action: string }; response: TeacherResponse };
const recordings: Record<string, Recording> = recordingPath ? JSON.parse(readFileSync(recordingPath, 'utf8')) : {};
// Windows' native clipboard returns CRLF. Normalize line endings only;
// every character, translation, item and section must otherwise match exactly.
const normalizedClipboard = (text: string) => text.replace(/\r\n/g, '\n');
test.skip(!recordingPath, 'Requires an explicitly supplied, existing live-response recording; no live requests are made.');
test.skip(!!recordingPath && Object.values(recordings).some(item => item.response.model !== TEACHER_MODEL || item.response.version !== TEACHER_VERSION), 'Historical recordings use a different model/prompt version and cannot verify current generation. No new live requests are authorized by this test.');

test.beforeEach(async ({ page, context, baseURL }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseURL! });
  await page.route('**/api/images?**', route => route.fulfill({ json: { images: [], status: 'unavailable' } }));
  await page.route('**/api/teacher', route => {
    const body = route.request().postDataJSON();
    const captured = Object.values(recordings).find(item => item.request.action === body.action && item.request.sense === body.sense && [item.request.word, item.request.headword].includes(body.word));
    // Never fall through to the live local API, including unmatched actions.
    return captured ? route.fulfill({ json: captured.response }) : route.fulfill({ status: 400, json: { code: 'invalid_request' } });
  });
});

for (const id of ['beautiful-sentences', 'idiom-sentences']) {
  test(`recorded live ${id}: all three real clipboard buttons copy only their own complete translations`, async ({ page }) => {
    test.setTimeout(60_000);
    const captured = recordings[id], result = captured.response.result as SentenceResult;
    let calls = 0; page.on('request', request => { if (request.url().endsWith('/api/teacher')) calls++; });
    await page.goto(`/#word=${encodeURIComponent(captured.request.headword)}&entry=${encodeURIComponent(captured.request.word)}&sense=${captured.request.sense}`);
    await expect(page.locator('.word-header h1')).toHaveText(result.word, { timeout: 30_000 });
    expect(calls).toBe(0);
    await page.getByRole('button', { name: /造句 · Example Sentences/ }).click();
    await expect(page.locator('.teacher-sentence')).toHaveCount(3);
    for (const [index, row] of result.sentences.entries()) {
      const card = page.locator('.teacher-sentence').nth(index);
      await expect(card.locator('[lang="zh-Hans"]')).toContainText(row.chinese);
      await expect(card.locator('[lang="en"]')).toContainText(row.english);
      await expect(card.locator('[lang="ms"]')).toContainText(row.malay);
      await card.getByRole('button', { name: '复制 · Copy', exact: true }).click();
      await expect(card.getByText('已复制 · Copied', { exact: true })).toBeVisible();
      expect(normalizedClipboard(await page.evaluate(() => navigator.clipboard.readText()))).toBe(sentenceText(row));
    }
    expect(calls).toBe(1);
    await page.setViewportSize({ width: 390, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.ai-teacher').screenshot({ path: `.tmp/final-live-${id}-mobile.png` });
  });
}

test('recorded live beautiful relations: complete Chinese, English and Malay lists copy together', async ({ page }) => {
  test.setTimeout(60_000);
  const captured = recordings['beautiful-relations'], result = captured.response.result as RelationResult;
  await page.goto(`/#word=${encodeURIComponent(result.word)}&entry=${encodeURIComponent(captured.request.word)}`);
  await expect(page.locator('.word-header h1')).toHaveText(result.word, { timeout: 30_000 });
  await page.getByRole('button', { name: /近义词和反义词 · Synonyms/ }).click();
  await expect(page.locator('.teacher-table tbody tr')).toHaveCount(result.synonyms.length + result.antonyms.length);
  for (const row of [...result.synonyms, ...result.antonyms]) {
    const displayed = page.locator('.teacher-table tbody tr').filter({ has: page.getByRole('cell', { name: row.chinese, exact: true }) });
    await expect(displayed).toContainText(row.english); await expect(displayed).toContainText(row.malay);
  }
  await expect(page.getByRole('button', { name: '复制全部 · Copy All', exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: '复制全部 · Copy All', exact: true }).click();
  await expect(page.getByText('已复制 · Copied', { exact: true })).toBeVisible();
  expect(normalizedClipboard(await page.evaluate(() => navigator.clipboard.readText()))).toBe(relationsText(result));
  await page.locator('.ai-teacher').screenshot({ path: '.tmp/final-live-beautiful-relations-desktop.png' });
});

test('recorded live apple: empty relations explain the absence of a lexical antonym and copy correctly', async ({ page }) => {
  const result = recordings['apple-relations'].response.result as RelationResult;
  expect(result.antonyms).toEqual([]);
  await page.goto('/#word=苹果'); await page.getByRole('button', { name: /近义词和反义词 · Synonyms/ }).click();
  await expect(page.getByText('No commonly recognized antonym.', { exact: false })).toBeVisible();
  await expect(page.getByText('Tiada antonim yang lazim digunakan.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '复制全部 · Copy All', exact: true }).click();
  await expect(page.getByText('已复制 · Copied', { exact: true })).toBeVisible();
  expect(normalizedClipboard(await page.evaluate(() => navigator.clipboard.readText()))).toBe(relationsText(result));
});
