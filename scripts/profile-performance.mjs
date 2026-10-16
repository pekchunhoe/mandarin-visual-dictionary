// Reproducible browser benchmark. Provider inventory/latency and JPEG bytes are
// deterministic fixtures, NOT measurements of live provider/network performance.
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { gzipSync } from 'node:zlib';
const label = process.argv[2] ?? 'after';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const result = count => ({ status: 'live', expiresAt: Date.now() + 86400000, images: Array.from({ length: count }, (_, i) => ({ id: `scene-${i}`, provider: i % 2 ? 'openverse' : 'pixabay', thumbnailUrl: `/fixture-${i}.jpg`, displayUrl: `/fixture-${i}-display.jpg`, largeUrl: `/fixture-${i}-large.jpg`, width: 900, height: 700, alt: `giraffe animal perspective ${i}`, source: i % 2 ? 'Openverse' : 'Pixabay', sourceUrl: 'https://example.org/photo', license: 'by', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' })) });
let apiRequests = 0;
const jpeg = await readFile('public/photos/school.jpg');
const compressed = new Map();
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://local').pathname;
    if (path === '/api/images') {
      apiRequests++;
      if (req.headers.accept?.includes('application/x-ndjson')) {
        res.setHeader('Content-Type', 'application/x-ndjson');
        await sleep(200); res.write(JSON.stringify({ result: result(4), done: false }) + '\n');
        await sleep(1000); res.end(JSON.stringify({ result: result(20), done: true }) + '\n');
      } else { await sleep(1200); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(result(20))); }
      return;
    }
    if (path.startsWith('/fixture-')) { await sleep(80); res.setHeader('Content-Type', 'image/jpeg'); res.end(jpeg); return; }
    const file = resolve('dist', path === '/' ? 'index.html' : '.' + path);
    if (!file.startsWith(resolve('dist') + '/') && !file.startsWith(resolve('dist') + '\\')) { res.statusCode = 404; res.end(); return; }
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
    res.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
    res.setHeader('Cache-Control', 'public,max-age=86400');
    if (/\.(js|json|css|html)$/.test(file) && req.headers['accept-encoding']?.includes('gzip')) {
      if (!compressed.has(file)) compressed.set(file, gzipSync(await readFile(file)));
      res.setHeader('Content-Encoding', 'gzip'); res.end(compressed.get(file));
    } else res.end(await readFile(file));
  } catch { res.statusCode = 404; res.end(); }
});
await new Promise(r => server.listen(5179, '127.0.0.1', r));
const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : { channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined) }), headless: true });
const reports = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 }, serviceWorkers: 'block' });
    const page = await context.newPage(); const cdp = await context.newCDPSession(page);
    page.on('pageerror', e => console.error('page error', e.message));
    page.on('console', m => { if (m.type() === 'error') console.error('browser', m.text()); });
    if (mobile) { await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 100, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750000 / 8 }); }
    await page.addInitScript(() => {
      window.perf = { tasks: [], shifts: [], loaded: [] };
      new PerformanceObserver(list => window.perf.tasks.push(...list.getEntries().map(e => e.duration))).observe({ type: 'longtask', buffered: true });
      new PerformanceObserver(list => window.perf.shifts.push(...list.getEntries().filter(e => !e.hadRecentInput).map(e => e.value))).observe({ type: 'layout-shift', buffered: true });
      document.addEventListener('load', e => { if (e.target instanceof HTMLImageElement && e.target.closest('.gallery-grid')) window.perf.loaded.push({ id: e.target.alt, at: performance.now(), url: e.target.currentSrc }); }, true);
    });
    await page.goto('http://127.0.0.1:5179/'); await page.locator('.hero').waitFor();
    const homeMs = await page.evaluate(() => performance.now()); console.log('home', { mobile, homeMs });
    const started = await page.evaluate(() => { location.hash = 'search=' + encodeURIComponent('长颈鹿'); return performance.now(); });
    await page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: '长颈鹿', exact: true }) }).first().waitFor({ timeout: 120000 }).catch(async error => { console.error(await page.locator('main').innerText()); throw error; });
    const searchMs = await page.evaluate(() => performance.now()) - started; console.log('search', { mobile, searchMs });
    const workerMetrics = await page.workers()[0]?.evaluate(() => ({ resources: performance.getEntriesByType('resource').map(e => ({ name: new URL(e.name).pathname, startTime: e.startTime, duration: e.duration, bytes: e.transferSize, encodedBytes: e.encodedBodySize })), measures: performance.getEntriesByType('measure').map(e => ({ name: e.name, duration: e.duration })) }));
    const workerReadyMs = await page.evaluate(() => performance.now()) - started;
    const requestsBefore = apiRequests;
    const galleryStart = await page.evaluate(() => { window.perf.loaded = []; location.hash = 'word=' + encodeURIComponent('长颈鹿'); return performance.now(); });
    await page.waitForFunction(() => document.querySelectorAll('.gallery-grid figure').length === 20, null, { timeout: 120000 });
    const metadataMs = await page.evaluate(() => performance.now()) - galleryStart;
    for (const figure of await page.locator('.gallery-grid figure').all()) { await figure.scrollIntoViewIfNeeded(); }
    await page.waitForFunction(() => [...document.querySelectorAll('.gallery-grid img')].every(i => i.complete && i.naturalWidth > 0));
    const metrics = await page.evaluate(() => ({ ...window.perf, resources: performance.getEntriesByType('resource').map(r => ({ name: new URL(r.name).pathname, duration: r.duration, bytes: r.transferSize, encodedBytes: r.encodedBodySize })), memory: performance.memory?.usedJSHeapSize, allImages: [...document.querySelectorAll('.gallery-grid img')].filter(i => i.complete && i.naturalWidth).length, overflow: document.documentElement.scrollWidth > innerWidth }));
    const warmStart = await page.evaluate(() => { location.hash = ''; return performance.now(); });
    await page.locator('.hero').waitFor(); await page.evaluate(() => { window.perf.loaded = []; location.hash = 'word=' + encodeURIComponent('长颈鹿'); });
    await page.waitForFunction(() => document.querySelectorAll('.gallery-grid figure').length === 20);
    const warmMs = await page.evaluate(() => performance.now()) - warmStart;
    reports.push({ mobile, homeMs, searchMs, workerReadyMs, workerMetrics, metadataMs, firstImageMs: metrics.loaded[0]?.at - galleryStart, firstFourMs: metrics.loaded[3]?.at - galleryStart, maxLoadedMs: Math.max(...metrics.loaded.map(e => e.at)) - galleryStart, warmGalleryNavigationMs: warmMs, galleryApiRequests: apiRequests - requestsBefore, ...metrics });
    await context.close();
  }
  await writeFile(`.tmp/ultra-fast/browser-${label}.json`, JSON.stringify({ fixture: true, jpegBytes: jpeg.length, profiles: reports }, null, 2));
  console.log(JSON.stringify(reports.map(({ resources, loaded, ...r }) => ({ ...r, tasks: r.tasks.length, shifts: r.shifts.reduce((a,b) => a+b,0), imageBytes: resources.filter(x => x.name.startsWith('/fixture-')).reduce((a,b)=>a+b.encodedBytes,0) })), null, 2));
} finally { await browser.close(); await new Promise(r => server.close(r)); }
