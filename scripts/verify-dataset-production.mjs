import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { hash } from './malay/corpus.mjs';
const base = process.env.KANJIAN_TEST_URL ?? 'https://mandarin-visual-dictionary.vercel.app';
const before = process.argv.includes('--before');
const dir = `${process.env.KANJIAN_DATASET_EVIDENCE_ROOT ?? '.tmp/malay-datasets'}/production-${before ? 'before' : 'after'}`; mkdirSync(dir, { recursive: true });
const corpusResponse = await fetch(`${base}/data/cedict.json`, { signal: AbortSignal.timeout(60000), cache: 'no-store' });
if (!corpusResponse.ok) throw Error(`Production dictionary HTTP ${corpusResponse.status}`);
const bytes = Buffer.from(await corpusResponse.arrayBuffer());
writeFileSync(`${dir}/cedict.json`, bytes);
const baseline = { base, time: new Date().toISOString(), corpusSha256: hash(bytes), dictionaryBytes: bytes.length, entries: JSON.parse(bytes).length };
expect(baseline.corpusSha256).toBe(hash(readFileSync('public/data/cedict.json')));
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
const context = await browser.newContext(); const page = await context.newPage();
const pageErrors = [], apiResponses = [], failedRequests = [], runtimeAssets = [];
page.on('pageerror', error => pageErrors.push(error.message));
page.on('requestfailed', request => { if (!/ERR_ABORTED/.test(request.failure()?.errorText ?? '')) failedRequests.push({ url: request.url(), failure: request.failure()?.errorText }); });
const saves = [];
page.on('response', response => {
  if (new URL(response.url()).pathname === '/api/images') apiResponses.push({ status: response.status(), url: response.url() });
  if (/\/assets\/malay-runtime[^/]+\.json/.test(response.url())) saves.push((async () => {
    const raw = await response.body(), data = JSON.parse(raw);
    writeFileSync(`${dir}/malay-runtime.json`, raw);
    runtimeAssets.push({ url: response.url(), sha256: hash(raw), version: data.version, translations: data.records.length });
    if (!before) expect(data).toEqual(JSON.parse(readFileSync('src/data/malay-runtime.json')));
  })());
});
const examples = [];
try {
  const start = Date.now(); await page.goto(base); await expect(page.locator('.hero')).toBeVisible({ timeout: 30000 });
  baseline.homeVisibleMs = Date.now() - start;
  if (before) {
    await page.goto(`${base}/#search=${encodeURIComponent('人口普查')}`);
    await expect(page.getByRole('heading', { name: '人口普查', exact: true })).toBeVisible({ timeout: 60000 });
  } else {
    for (const [chinese, english, malay] of [['人口普查', 'census', 'banci'], ['灯泡', 'light bulb', 'mentol'], ['脚踝', 'ankle', 'buku lali'], ['研究', 'research', 'penyelidikan'], ['银行', 'bank', 'bank'], ['狗', 'dog', 'anjing']]) {
      for (const query of [...new Set([chinese, english, malay])]) {
        const start = Date.now(); await page.goto(`${base}/#search=${encodeURIComponent(query)}`);
        const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: chinese, exact: true }) }).first();
        await expect(card).toBeVisible({ timeout: 60000 }); await card.click();
        await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveText(english);
        await expect(page.locator('.meaning-panel p[lang="ms"]')).toHaveText(malay);
        const pinyin = await page.locator('.detail-pinyin').innerText(); expect(pinyin.length).toBeGreaterThan(0);
        examples.push({ query, chinese, english, malay, pinyin, displayedMs: Date.now() - start });
      }
    }
    // The last preserved entry is the dog. Verify an actual rendered gallery,
    // in addition to HTTP success; live provider results are never mocked here.
    await expect(page.locator('.gallery-grid figure').first()).toBeVisible({ timeout: 30000 });
    baseline.preservedGalleryPictures = await page.locator('.gallery-grid figure').count();
    await page.goto(`${base}/#search=${encodeURIComponent('河岸')}`);
    const river = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: '河岸', exact: true }) }).first();
    await expect(river).toBeVisible({ timeout: 30000 }); await river.click();
    await expect(page.locator('.meaning-panel p[lang="ms"]')).not.toHaveText('bank');
    await page.goto(`${base}/#search=banci`);
    const census = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: '人口普查', exact: true }) }).first();
    await expect(census).toBeVisible({ timeout: 30000 }); await census.click();
    await expect(page.locator('.meaning-panel p[lang="ms"]')).toHaveText('banci');
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${dir}/phone.png`, fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: `${dir}/desktop.png`, fullPage: true });
    const notices = await context.request.get(`${base}/data/MALAY-DATASET-ATTRIBUTION.json`); expect(notices.ok()).toBe(true);
    expect((await notices.json()).records).toHaveLength(316);
    const license = await context.request.get(`${base}/data/licenses/CC-BY-SA-4.0.txt`); expect(license.ok()).toBe(true);
  }
  await Promise.all(saves);
  expect(pageErrors).toEqual([]);
  expect(apiResponses.filter(r => r.status >= 500)).toEqual([]);
  if (!before) expect(runtimeAssets.length).toBeGreaterThan(0);
  const report = { ...baseline, productionPass: true, beforeRelease: before, runtimeAssets, examples, pageErrors, apiResponses, failedRequests };
  writeFileSync(`${dir}/smoke.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { await context.close(); await browser.close(); }
