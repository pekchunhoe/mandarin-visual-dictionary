import { chromium, expect } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { hash } from './malay/corpus.mjs';
const base = process.env.KANJIAN_TEST_URL ?? 'https://mandarin-visual-dictionary.vercel.app', dir = '.tmp/malay-deep/live';
mkdirSync(dir, { recursive: true });
const store = JSON.parse(readFileSync('scripts/data/malay-translations-v1.json'));
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
const context = await browser.newContext(), page = await context.newPage(), errors = [], apiErrors = [], forbidden = [], runtimes = new Set(), examples = [], polysemy = [];
page.on('pageerror', e => errors.push(e.message));
page.on('request', r => { if (/huggingface\.co|translation\.googleapis\.com|api\.openai\.com/.test(r.url())) forbidden.push(r.url()); });
page.on('response', r => { const path = new URL(r.url()).pathname; if (path === '/api/images' && r.status() >= 500) apiErrors.push(r.status()); if (/\/assets\/malay-runtime[^/]+\.json$/.test(path)) runtimes.add(r.url()); });
try {
  const start = Date.now(); await page.goto(base); await expect(page.locator('.hero')).toBeVisible(); const homeMs = Date.now() - start;
  for (const [chinese, english] of [['互联网', 'Internet'], ['海啸', 'tsunami'], ['轮椅', 'wheelchair'], ['T裇', 'variant of T恤[T xu4]'], ['B超', 'abbr. for B型超聲|B型超声[B xing2 chao1 sheng1]']]) {
    const record = store.records.find(r => r.entryId.split('|')[0] === chinese && r.english === english); expect(record).toBeDefined();
    for (const query of [chinese, record.malay]) {
      const begun = Date.now(); await page.goto(base + '/#search=' + encodeURIComponent(query));
      const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: chinese, exact: true }) }).first();
      await expect(card).toBeVisible({ timeout: 60000 }); await card.click();
      if (query === chinese && record.senseId !== 'sense-0') await page.getByRole('group', { name: 'Word meaning' }).getByRole('button', { name: `${Number(record.senseId.slice(6)) + 1}. ${english}`, exact: true }).click();
      await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveText(english);
      await expect(page.locator('.meaning-panel p[lang="ms"]')).toHaveText(record.malay);
      const label = record.translationKind === 'definition-translation' ? 'Machine-translated English definition · awaiting language review' : 'Machine-translated equivalent · awaiting language review';
      await expect(page.getByText(label, { exact: true })).toBeVisible();
      examples.push({ query, chinese, english, malay: record.malay, kind: record.translationKind, pinyin: await page.locator('.detail-pinyin').innerText(), displayMs: Date.now() - begun });
    }
  }
  for (const [width, height, name] of [[320, 700, 'phone'], [1440, 1000, 'desktop']]) {
    await page.setViewportSize({ width, height }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
  }
  for (const query of ['bank', 'light', 'charge', 'current', 'spring', 'right', 'match', 'set', 'run', 'break']) {
    await page.goto(base + '/#search=' + query); const card = page.locator('.word-card-main').first(); await expect(card).toBeVisible({ timeout: 60000 });
    const before = await card.locator('p[lang="en"]').innerText(); await card.click();
    const english = await page.locator('.meaning-panel p[lang="en"]').innerText(); expect(english.split(';')[0]).toBe(before);
    polysemy.push({ query, selectedEnglish: english, chinese: await page.locator('.word-header h1').innerText() });
  }
  const corpus = await context.request.get(base + '/data/cedict.json'); expect(corpus.ok()).toBe(true); expect(hash(await corpus.body())).toBe(hash(readFileSync('public/data/cedict.json')));
  expect(runtimes.size).toBeGreaterThan(0); const runtime = await context.request.get([...runtimes][0]); expect(runtime.ok()).toBe(true);
  expect(hash(await runtime.body())).toBe(hash(readFileSync('src/data/malay-runtime.json')));
  const attribution = await context.request.get(base + '/data/MALAY-RECOVERY-ATTRIBUTION.json'); expect(attribution.ok()).toBe(true);
  expect(await attribution.json()).toEqual(JSON.parse(readFileSync('public/data/MALAY-RECOVERY-ATTRIBUTION.json')));
  expect(errors).toEqual([]); expect(apiErrors).toEqual([]); expect(forbidden).toEqual([]);
  const report = { pass: true, base, time: new Date().toISOString(), homeMs, translations: store.records.length, runtimeSha256: hash(await runtime.body()), corpusSha256: hash(await corpus.body()), examples, polysemy, errors, apiErrors, forbiddenTranslationRequests: forbidden };
  writeFileSync(`${dir}/verification.json`, JSON.stringify(report, null, 2) + '\n'); console.log(JSON.stringify(report, null, 2));
} finally { await context.close(); await browser.close(); }
