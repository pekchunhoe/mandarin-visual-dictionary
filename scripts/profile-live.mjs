// Actual Production checks. Never prints credentials or raw upstream responses.
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
const base = 'https://mandarin-visual-dictionary.vercel.app';
const label = process.argv[2] ?? 'after';
const report = { at: new Date().toISOString(), base, api: [], browser: [] };
const rows = JSON.parse(await readFile('public/data/cedict.json', 'utf8'));
for (const word of process.argv.includes('--idiom-only') ? ['不耻下问'] : ['跑', '不耻下问']) {
  const start = performance.now();
  try {
    const row = rows.find(row => row[1] === word);
    const wordId = word === '跑' ? word : `${row[1]}|${row[0]}|${row[2]}`;
    const response = await fetch(`${base}/api/images?word=${encodeURIComponent(wordId)}&sense=sense-0`, { headers: { Accept: 'application/x-ndjson' }, signal: AbortSignal.timeout(20000) });
    const headersMs = performance.now() - start;
    let firstMs, last, chunks = 0, networkChunks = 0, bytes = 0; const events = [];
    if (response.headers.get('Content-Type')?.includes('application/x-ndjson')) {
      let buffer = ''; const decoder = new TextDecoder();
      for await (const chunk of response.body) {
        networkChunks++;
        bytes += chunk.length; buffer += decoder.decode(chunk, { stream: true });
        let end;
        while ((end = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, end); buffer = buffer.slice(end + 1); if (!line.trim()) continue;
          const event = JSON.parse(line); last = event.result; chunks++;
          events.push({ ms: performance.now() - start, done: event.done, count: last?.images?.length });
          if (last?.images?.length && firstMs === undefined) firstMs = performance.now() - start;
        }
      }
    } else { last = await response.json(); bytes = Buffer.byteLength(JSON.stringify(last)); firstMs = performance.now() - start; chunks = 1; }
    report.api.push({ word, status: response.status, headersMs, firstMetadataMs: firstMs, finalMs: performance.now() - start, chunks, networkChunks, events, bytes, transport: response.headers.get('Content-Type'), count: last?.images?.length, resultStatus: last?.status, diagnostics: last?.diagnostics, providerCounts: last?.images?.reduce((counts, image) => ({ ...counts, [image.provider ?? 'curated']: (counts[image.provider ?? 'curated'] ?? 0) + 1 }), {}), distinctIds: new Set(last?.images?.map(p => p.id)).size, licenses: last?.images?.filter(p => p.provider === 'openverse' && p.license && p.licenseUrl).length });
  } catch (error) { report.api.push({ word, failure: error.name, elapsedMs: performance.now() - start }); }
}
if (process.argv.includes('--api-only')) { await writeFile(`.tmp/ultra-fast/live-${label}.json`, JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2)); } else {
const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : { channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined) }), headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => { window.galleryLoads = []; document.addEventListener('load', e => { if (e.target instanceof HTMLImageElement && e.target.closest('.gallery-grid')) window.galleryLoads.push({ at: performance.now(), alt: e.target.alt, remote: e.target.currentSrc.startsWith('https:') }); }, true); });
  await page.goto(base); await page.locator('.hero').waitFor();
  const homeMs = await page.evaluate(() => performance.now());
  const searchStart = await page.evaluate(() => { location.hash = 'search=' + encodeURIComponent('长颈鹿'); return performance.now(); });
  await page.getByRole('heading', { name: '长颈鹿', exact: true }).first().waitFor({ timeout: 60000 });
  report.browser.push({ scenario: 'cold full dictionary', homeMs, firstSearchMs: await page.evaluate(() => performance.now()) - searchStart, worker: await page.workers()[0]?.evaluate(() => ({ measures: performance.getEntriesByType('measure').map(e => ({ name: e.name, duration: e.duration })), resources: performance.getEntriesByType('resource').map(e => ({ path: new URL(e.name).pathname, duration: e.duration, bytes: e.encodedBodySize })) })) });
  const start = await page.evaluate(() => { window.galleryLoads = []; location.hash = 'word=' + encodeURIComponent('跑'); return performance.now(); });
  await page.locator('.word-header h1').waitFor();
  await page.waitForFunction(() => !document.querySelector('.gallery-section .section-heading')?.textContent.includes('Finding pictures'), null, { timeout: 20000 }).catch(() => {});
  for (const figure of await page.locator('.gallery-grid figure').all()) await figure.scrollIntoViewIfNeeded();
  await page.waitForTimeout(5000);
  report.browser.push({ scenario: 'live mobile gallery, unthrottled network', elapsedMs: await page.evaluate(() => performance.now()) - start, ...await page.evaluate(start => { const images = [...document.querySelectorAll('.gallery-grid img')]; return { firstDecodedMs: window.galleryLoads[0]?.at - start, firstFourDecodedMs: window.galleryLoads[3]?.at - start, figures: document.querySelectorAll('.gallery-grid figure').length, decoded: images.filter(i => i.complete && i.naturalWidth).length, failed: images.filter(i => i.complete && !i.naturalWidth).length, overflow: document.documentElement.scrollWidth > innerWidth }; }, start), errors });
  await page.screenshot({ path: `.tmp/ultra-fast/live-${label}.png`, fullPage: true }); await context.close();
} finally { await browser.close(); await writeFile(`.tmp/ultra-fast/live-${label}.json`, JSON.stringify(report, null, 2)); }
console.log(JSON.stringify(report, null, 2));

}
