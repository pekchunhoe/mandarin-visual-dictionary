import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { sentences, relations, teacherResponse } from '../teacher-fixtures';
test.beforeEach(async ({ page }) => {
  await page.route('**/api/images?**', route => route.fulfill({ json: { images: [], status: 'unavailable' } }));
  // Every AI interaction is mocked; no test uses the configured key or live quota.
  await page.route('**/api/teacher', route => {
    const { action } = route.request().postDataJSON();
    return route.fulfill({ json: teacherResponse(action, action === 'sentences' ? sentences : relations) });
  });
});
test('AI Teacher is click-only, responsive and accessible on desktop and mobile', async ({ page }) => {
  let calls = 0; page.on('request', request => { if (request.url().endsWith('/api/teacher')) calls++; });
  await page.goto('/#word=苹果'); await expect(page.locator('.ai-teacher')).toBeVisible(); expect(calls).toBe(0);
  await page.getByRole('button', { name: /造句 · Example Sentences/ }).click(); await expect(page.locator('.teacher-sentence')).toHaveCount(3);
  await expect(page.getByRole('button', { name: '复制 · Copy', exact: true })).toHaveCount(3);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.ai-teacher').screenshot({ path: `.tmp/teacher-sentences-${width}.png` });
  }
  await page.getByRole('button', { name: /近义词和反义词 · Synonyms/ }).click(); await expect(page.getByText('No commonly recognized antonym.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: '复制全部 · Copy All', exact: true })).toHaveCount(1);
  await page.locator('.ai-teacher').screenshot({ path: '.tmp/teacher-relations-desktop.png' });
  await page.getByRole('button', { name: /造句 · Example Sentences/ }).click(); expect(calls).toBe(2);
  const accessibility = await new AxeBuilder({ page }).include('.ai-teacher').analyze(); expect(accessibility.violations).toEqual([]);
});
test('copies individual trilingual content and all relations', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (value: string) => { (window as unknown as { copied: string }).copied = value; } } });
  });
  await page.goto('/#word=苹果'); await page.getByRole('button', { name: /造句 · Example Sentences/ }).click();
  for (const [index, row] of sentences.sentences.entries()) {
    await page.getByRole('button', { name: '复制 · Copy', exact: true }).nth(index).click();
    await expect(page.getByText('已复制 · Copied')).toHaveCount(index + 1);
    const copied = await page.evaluate(() => (window as unknown as { copied: string }).copied);
    expect(copied).toBe(`中文：${row.chinese}\nEnglish: ${row.english}\nBahasa Melayu: ${row.malay}`);
    for (const [otherIndex, other] of sentences.sentences.entries()) if (otherIndex !== index) expect(copied).not.toContain(other.chinese);
  }
  await page.getByRole('button', { name: /近义词和反义词 · Synonyms/ }).click(); await page.getByRole('button', { name: '复制全部 · Copy All' }).click();
  expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toContain('Tiada antonim yang lazim digunakan.');
});
test('uses selected Mandarin headword and sense and keeps failed AI retryable', async ({ page }) => {
  let body: Record<string, string> = {};
  await page.route('**/api/teacher', route => { body = route.request().postDataJSON(); return route.fulfill({ status: 503, json: { code: 'unavailable' } }); });
  await page.goto('/#word=开'); await page.getByRole('button', { name: /2. to turn on/ }).click();
  await page.getByRole('button', { name: /造句 · Example Sentences/ }).click(); await expect(page.locator('.ai-teacher [role=alert]')).toContainText('temporarily unavailable');
  expect(body).toEqual({ word: '开', sense: 'sense-2', action: 'sentences' });
  await expect(page.getByText('Please turn on the light.')).toBeVisible(); await expect(page.getByRole('button', { name: /重试 · Retry/ })).toBeEnabled();
  await page.getByRole('button', { name: /1. to open/ }).click(); await expect(page.locator('.ai-teacher [role=alert]')).toHaveCount(0);
});
