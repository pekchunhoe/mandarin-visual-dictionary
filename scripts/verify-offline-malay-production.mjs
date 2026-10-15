import { chromium, expect } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { hash } from './malay/corpus.mjs';
const base = process.env.KANJIAN_TEST_URL ?? 'https://mandarin-visual-dictionary.vercel.app';
const root = '.tmp/malay-complete/live'; mkdirSync(root, { recursive: true });
const store = JSON.parse(readFileSync('scripts/data/malay-translations-v1.json'));
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
const context = await browser.newContext(); const page = await context.newPage();
const errors = [], apiErrors = [], forbidden = [], examples = [], runtimes = new Set();
page.on('pageerror', e => errors.push(e.message));
page.on('request', r => { if (/huggingface\.co|translation\.googleapis\.com|api\.openai\.com/.test(r.url())) forbidden.push(r.url()); });
page.on('response', r => { if (new URL(r.url()).pathname === '/api/images' && r.status() >= 500) apiErrors.push(r.status()); if (/\/assets\/malay-runtime[^/]+\.json$/.test(new URL(r.url()).pathname)) runtimes.add(r.url()); });
try {
  const start = Date.now(); await page.goto(base); await expect(page.locator('.hero')).toBeVisible(); const homeMs = Date.now() - start;
  for (const [chinese, english] of [['不动产', 'real estate'], ['研究员', 'researcher'], ['肾脏', 'kidney'], ['碳水化合物', 'carbohydrate']]) {
    const record = store.records.find(r => r.entryId.split('|')[0] === chinese && r.english === english && r.translationVersion === 'licensed-sense-concordance-v1'); expect(record).toBeDefined();
    for (const query of [chinese, english, record.malaySearchTerms[0]]) {
      const begun = Date.now(); await page.goto(base + '/#search=' + encodeURIComponent(query));
      const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: chinese, exact: true }) }).first();
      await expect(card).toBeVisible({ timeout: 60000 }); await card.click();
      await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveText(english);
      await expect(page.locator('.meaning-panel p[lang="ms"]')).toHaveText(record.malay);
      await expect(page.getByText('Machine-translated equivalent · awaiting language review', { exact: true })).toBeVisible();
      const pinyin = await page.locator('.detail-pinyin').innerText(); expect(pinyin).not.toBe('');
      examples.push({ query, chinese, english, malay: record.malay, pinyin, displayMs: Date.now() - begun });
    }
  }
  const annotation = store.records.find(r => r.entryId.split('|')[0] === '丁' && r.english === 'surname Ding' && r.translationKind === 'definition-translation'); expect(annotation).toBeDefined();
  await page.goto(base + '/#search=' + encodeURIComponent(annotation.malay));
  const surnameCard = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: '丁', exact: true }) }).first();
  await expect(surnameCard).toBeVisible({ timeout: 60000 }); await surnameCard.click();
  await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveText('surname Ding');
  await expect(page.locator('.meaning-panel p[lang="ms"]')).toHaveText(annotation.malay);
  await expect(page.getByText('Machine-translated English definition · awaiting language review', { exact: true })).toBeVisible();
  examples.push({ query: annotation.malay, chinese: '丁', english: annotation.english, malay: annotation.malay, kind: 'definition-translation' });
  for (const [width, height, name] of [[320, 700, 'phone'], [1440, 1000, 'desktop']]) {
    await page.setViewportSize({ width, height }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${root}/${name}.png`, fullPage: true });
  }
  const corpus = await context.request.get(base + '/data/cedict.json'); expect(corpus.ok()).toBe(true);
  expect(hash(await corpus.body())).toBe(hash(readFileSync('public/data/cedict.json')));
  expect(runtimes.size).toBeGreaterThan(0);
  const asset = await context.request.get([...runtimes][0]); expect(asset.ok()).toBe(true);
  const raw = await asset.body(); expect(JSON.parse(raw)).toEqual(JSON.parse(readFileSync('src/data/malay-runtime.json')));
  writeFileSync(`${root}/malay-runtime.json`, raw);
  const notice = await context.request.get(base + '/data/MALAY-OFFLINE-MODELS.json'); expect(notice.ok()).toBe(true);
  expect(await notice.json()).toEqual(JSON.parse(readFileSync('public/data/MALAY-OFFLINE-MODELS.json')));
  expect(errors).toEqual([]); expect(apiErrors).toEqual([]); expect(forbidden).toEqual([]);
  const report = { pass: true, base, time: new Date().toISOString(), homeMs, translations: store.records.length, runtimeSha256: hash(raw), corpusSha256: hash(await corpus.body()), examples, errors, apiErrors, forbiddenTranslationRequests: forbidden };
  writeFileSync(`${root}/verification.json`, JSON.stringify(report, null, 2) + '\n'); console.log(JSON.stringify(report, null, 2));
} finally { await context.close(); await browser.close(); }
