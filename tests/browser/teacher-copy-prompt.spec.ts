import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

// These tests copy instructions only. Every teacher/image request is intercepted.
test.beforeEach(async ({ page, context, baseURL }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseURL! });
  await page.route('**/api/images?**', route => route.fulfill({ json: { images: [], status: 'unavailable' } }));
  await page.route('**/api/teacher', route => route.fulfill({ status: 503, json: { code: 'unavailable' } }));
});
const copyButton = (page: Page, word: string, relations = false) => page.getByRole('button', { name: `Copy ${relations ? 'synonym and antonym' : 'sentence'} prompt for ${word}`, exact: true });
const clipboard = async (page: Page) => (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n');

test('both one-click prompts copy complete readable instructions using the actual selected entry', async ({ page }) => {
  let calls = 0; page.on('request', request => { if (request.url().endsWith('/api/teacher')) calls++; });
  await page.goto('/#word=美丽&entry=' + encodeURIComponent('美丽|美麗|mei3 li4'));
  await expect(page.locator('.word-header h1')).toHaveText('美丽', { timeout: 30_000 });
  await expect(page.locator('.teacher-prompt-button')).toHaveCount(2);
  await expect(page.locator('.teacher-generate')).toHaveCount(2);
  const examples: Record<string, string> = {};
  for (const relations of [false, true]) {
    const button = copyButton(page, '美丽', relations);
    await expect(button).toHaveAttribute('title', /preferred AI chat/);
    await button.click(); await expect(button.locator('..').getByRole('status')).toHaveText('Prompt copied!');
    const text = await clipboard(page);
    expect(text).toContain('Chinese word: 美丽'); expect(text).toContain('Selected meaning (English): beautiful');
    expect(text).toContain('Pinyin: měi lì'); expect(text).toContain('standard Malaysian Bahasa Melayu');
    expect(text).toContain('Do not return JSON'); expect(text).not.toMatch(/teacher-v2|gemini-|API_KEY|systemInstruction|responseJsonSchema/);
    expect(text).toContain(relations ? '近义词 — Synonyms' : 'exactly THREE');
    expect(text).toContain(relations ? 'up to 30 per category' : 'Sentence 1, Sentence 2 and Sentence 3');
    examples[relations ? 'synonyms-antonyms' : 'sentences'] = text;
  }
  expect(calls).toBe(0);
  await expect(page.locator('.teacher-panel')).toHaveCount(0);
  mkdirSync('.tmp', { recursive: true }); writeFileSync('.tmp/teacher-copy-prompt-examples.json', JSON.stringify(examples, null, 2));
});

test('compact controls fit desktop/mobile, support keyboard activation and have accessible feedback', async ({ page }) => {
  await page.goto('/#word=苹果'); await expect(copyButton(page, '苹果')).toBeVisible();
  await copyButton(page, '苹果').focus(); await page.keyboard.press('Enter');
  await expect(copyButton(page, '苹果').locator('..').getByRole('status')).toHaveText('Prompt copied!');
  await page.keyboard.press('Tab'); await expect(page.locator('.teacher-generate').nth(1)).toBeFocused();
  await page.keyboard.press('Tab'); await expect(copyButton(page, '苹果', true)).toBeFocused();
  await page.keyboard.press('Space');
  expect(await clipboard(page)).toContain('Chinese word: 苹果'); expect(await clipboard(page)).toContain('never invent opposites');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const control of await page.locator('.teacher-prompt-button').all()) {
      const box = await control.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(24); expect(box!.width).toBeLessThan(150);
    }
    await page.locator('.ai-teacher').screenshot({ path: `.tmp/teacher-copy-prompts-${width}.png` });
    const audit = await new AxeBuilder({ page }).include('.ai-teacher').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(audit.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) }))).toEqual([]);
  }
});

test('changing senses and entries copies current context and clears stale feedback', async ({ page }) => {
  await page.goto('/#word=苹果'); await copyButton(page, '苹果').click();
  await page.goto('/#word=开'); await page.getByRole('button', { name: /2. to turn on/ }).click();
  await expect(page.getByText('Prompt copied!', { exact: true })).toHaveCount(0);
  await copyButton(page, '开').click();
  expect(await clipboard(page)).toContain('Selected meaning (English): to turn on'); expect(await clipboard(page)).not.toContain('Chinese word: 苹果');
  await page.getByRole('button', { name: /1. to open/ }).click();
  await expect(page.getByText('Prompt copied!', { exact: true })).toHaveCount(0);
  await copyButton(page, '开', true).click();
  expect(await clipboard(page)).toContain('Selected meaning (English): to open'); expect(await clipboard(page)).not.toContain('Selected meaning (English): to turn on');
});

for (const [code, status] of [['rate_limited', 429], ['unavailable', 503]] as const) {
  test(`copy remains independent after Gemini ${status}`, async ({ page }) => {
    let calls = 0; page.on('request', request => { if (request.url().endsWith('/api/teacher')) calls++; });
    await page.route('**/api/teacher', route => route.fulfill({ status, json: { code } }));
    await page.goto('/#word=苹果'); await page.getByRole('button', { name: /造句 · Example Sentences/ }).click();
    await expect(page.locator('.teacher-error')).toBeVisible();
    for (const relations of [false, true]) {
      await copyButton(page, '苹果', relations).click(); expect(await clipboard(page)).toContain('Chinese word: 苹果');
    }
    expect(calls).toBe(1); await expect(page.getByRole('button', { name: /重试 · Retry/ })).toBeEnabled();
  });
}

test('already loaded dictionary entry copies both prompts with the browser offline', async ({ page, context }) => {
  let calls = 0; page.on('request', request => { if (request.url().endsWith('/api/teacher')) calls++; });
  await page.goto('/#word=苹果'); await expect(copyButton(page, '苹果')).toBeVisible();
  await context.setOffline(true);
  try {
    for (const relations of [false, true]) {
      await copyButton(page, '苹果', relations).click();
      expect(await clipboard(page)).toContain('Selected meaning (English): apple');
      await expect(copyButton(page, '苹果', relations).locator('..').getByRole('status')).toHaveText('Prompt copied!');
    }
    expect(calls).toBe(0);
  } finally { await context.setOffline(false); }
});

test('clipboard denial presents the complete selected prompt for guided manual copying', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Clipboard denied'); } } });
    document.execCommand = () => false;
  });
  await page.goto('/#word=苹果'); await copyButton(page, '苹果', true).click();
  const field = page.getByRole('textbox', { name: 'synonym and antonym prompt for manual copying' });
  await expect(field).toBeFocused(); await expect(field).toHaveAttribute('readonly', '');
  expect(await field.inputValue()).toContain('Chinese word: 苹果'); expect(await field.inputValue()).toContain('Return neatly formatted, human-readable text only.');
  expect(await field.evaluate((el: HTMLTextAreaElement) => el.selectionStart === 0 && el.selectionEnd === el.value.length)).toBe(true);
  await expect(page.locator('.teacher-prompt-manual [role=alert]')).toContainText('copy it manually');
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include('.ai-teacher').analyze()).violations).toEqual([]);
});
