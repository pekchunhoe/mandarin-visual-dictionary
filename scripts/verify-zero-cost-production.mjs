import { chromium, expect } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { hash } from './malay/corpus.mjs';

const base = process.env.KANJIAN_TEST_URL ?? 'https://mandarin-visual-dictionary.vercel.app';
const root = process.env.KANJIAN_ZERO_COST_EVIDENCE_ROOT ?? '.tmp/zero-cost'; mkdirSync(root, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
const context = await browser.newContext(); const page = await context.newPage();
const errors = [], appGoogleRequests = [], googleDocuments = [];
const malayAssets = new Set();
let officialDestination;
page.on('pageerror', error => errors.push(error.message));
page.on('request', request => { if (new URL(request.url()).hostname.endsWith('google.com')) appGoogleRequests.push(request.url()); });
page.on('response', response => { if (new URL(response.url()).origin === new URL(base).origin && /\/assets\/malay-runtime[^/]+\.json$/.test(new URL(response.url()).pathname)) malayAssets.add(response.url()); });
context.on('response', response => {
  // Match the chosen navigation URL without accessing a popup frame before it
  // exists. Never inspect translation contents or the site's internal requests.
  if (response.request().isNavigationRequest() && response.request().resourceType() === 'document' && response.url() === officialDestination) googleDocuments.push({ status: response.status(), url: response.url() });
});
try {
  const start = Date.now(); await page.goto(base); await expect(page.locator('.hero')).toBeVisible(); const homeMs = Date.now() - start;
  const corpusResponse = await context.request.get(base + '/data/cedict.json'); expect(corpusResponse.ok()).toBe(true);
  expect(hash(await corpusResponse.body())).toBe(hash(readFileSync('public/data/cedict.json')));
  await page.goto(base + '/#search=' + encodeURIComponent('河岸'));
  const bank = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: '河岸', exact: true }) }).first();
  await expect(bank).toBeVisible({ timeout: 45000 }); await bank.click();
  await page.getByRole('button', { name: '2. river bank', exact: true }).click();
  const link = page.getByRole('link', { name: 'Translate with Google', exact: true }); await expect(link).toBeVisible();
  const url = new URL(await link.getAttribute('href'));
  officialDestination = url.href;
  expect(url.origin).toBe('https://translate.google.com'); expect(url.searchParams.get('sl')).toBe('en'); expect(url.searchParams.get('tl')).toBe('ms'); expect(url.searchParams.get('text')).toBe('river bank');
  expect(appGoogleRequests).toEqual([]);
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  const popupPromise = context.waitForEvent('page'); await link.click(); const popup = await popupPromise;
  await popup.waitForURL(url.href); await popup.waitForLoadState('domcontentloaded');
  expect(await popup.evaluate(() => window.opener === null)).toBe(true);
  expect(googleDocuments.some(r => r.status === 200)).toBe(true); await popup.close();
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(stored);
  await expect(page.locator('.meaning-panel p[lang="ms"]')).toHaveText('Makna ini belum diterjemahkan.');
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: root + '/live-phone.png', fullPage: true });
  const queries = [];
  for (const query of ['人口普查', 'census', 'banci']) {
    await page.goto(base + '/#search=' + encodeURIComponent(query));
    const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: '人口普查', exact: true }) }).first();
    await expect(card).toBeVisible({ timeout: 45000 }); await card.click();
    await expect(page.locator('.meaning-panel p[lang="ms"]')).toHaveText('banci');
    await expect(page.getByRole('link', { name: 'Translate with Google' })).toHaveCount(0); queries.push(query);
  }
  expect(malayAssets.size).toBeGreaterThan(0);
  const asset = await context.request.get([...malayAssets][0]); expect(asset.ok()).toBe(true);
  expect(await asset.json()).toEqual(JSON.parse(readFileSync('src/data/malay-runtime.json')));
  expect(errors).toEqual([]);
  const report = { pass: true, base, homeMs, googleNavigation: url.href, googleDocuments, noAutomaticGoogleRequests: appGoogleRequests.length === 0, noGoogleResultReadOrPersisted: true, sameDictionaryAndMalayAssets: true, translations: JSON.parse(readFileSync('src/data/malay-runtime.json')).records.length, queries, appErrors: errors };
  writeFileSync(root + '/production-smoke.json', JSON.stringify(report, null, 2) + '\n'); console.log(JSON.stringify(report, null, 2));
} finally { await context.close(); await browser.close(); }
