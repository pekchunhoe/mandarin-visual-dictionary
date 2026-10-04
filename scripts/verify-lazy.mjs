import { chromium, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
const pageErrors = [];
try {
  const context = await browser.newContext();
  const requests = []; const workers = [];
  context.on('request', request => requests.push(request.url()));
  const page = await context.newPage(); page.on('worker', worker => workers.push(worker));
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') console.error('Browser:', message.text()); });
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('.hero')).toBeVisible();
  await expect(page.getByRole('combobox')).toBeEditable();
  await page.evaluate(() => navigator.serviceWorker.ready);
  expect(requests.filter(url => /visual-lexicon.*\.json/.test(url))).toHaveLength(0);
  expect(requests.filter(url => url.endsWith('/data/cedict.json'))).toHaveLength(0);
  expect(workers).toHaveLength(0);
  // Detail, quiz and local photos work offline immediately after a fresh install.
  await page.reload(); await context.setOffline(true);
  await page.goto('http://127.0.0.1:4173/#word=' + encodeURIComponent('苹果'));
  await expect(page.locator('.gallery-grid figure')).toHaveCount(8);
  await page.goto('http://127.0.0.1:4173/#practice=');
  await expect(page.locator('.quiz-options button').first()).toBeVisible();
  expect(workers).toHaveLength(0);
  expect(requests.filter(url => /visual-lexicon.*\.json/.test(url))).toHaveLength(0);
  await context.setOffline(false);
  const open = async text => {
    await page.goto('http://127.0.0.1:4173/#search=' + encodeURIComponent(text));
    const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: text, exact: true }) }).first();
    await expect(card).toBeVisible({ timeout: 30000 }); await card.click();
    await expect(page.locator('.word-header h1')).toHaveText(text);
    await expect(page.locator('.gallery-section')).toBeVisible();
    await expect(page.locator('.abstract-card')).toHaveCount(0);
  };
  await open('长颈鹿');
  const semanticRequests = requests.filter(url => /visual-lexicon.*\.json/.test(url)).length;
  expect(semanticRequests).toBeGreaterThan(0);
  expect(workers).toHaveLength(1);
  await open('政治');
  for (const text of ['恐慌', '经济', '数学', '科学', '金融', '瀑布', '厨师']) await open(text);
  await open('政治');
  expect(requests.filter(url => /visual-lexicon.*\.json/.test(url))).toHaveLength(semanticRequests);
  await page.getByRole('button', { name: 'Save word', exact: true }).click();
  const saved = await page.evaluate(() => [localStorage.getItem('kanjian-saved'), localStorage.getItem('kanjian-saved-entries')]);
  await context.setOffline(true); await page.reload();
  await expect(page.locator('.word-header h1')).toHaveText('政治', { timeout: 30000 });
  await expect(page.locator('.gallery-section')).toBeVisible();
  expect(await page.evaluate(() => [localStorage.getItem('kanjian-saved'), localStorage.getItem('kanjian-saved-entries')])).toEqual(saved);
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('.hero')).toBeVisible();
  await context.close();

  // Upgrade the previous bundled-worker release with its downloaded dictionary.
  // The new semantic asset must be installed before the old cache is removed.
  const upgrade = await browser.newContext(); const oldPage = await upgrade.newPage();
  oldPage.on('pageerror', error => pageErrors.push(error.message));
  await oldPage.goto('http://127.0.0.1:4173/favicon.svg');
  await oldPage.evaluate(async dictionary => {
    const cache = await caches.open('kanjian-dictionary-visual-v4-old-bundled-worker');
    await cache.put('/data/cedict.json', new Response(dictionary, { headers: { 'Content-Type': 'application/json' } }));
    await cache.put('/api/images?word=politics&sense=sense-0', new Response('{"images":[],"status":"unavailable"}'));
    await cache.put('/assets/WordDetail-obsolete.js', new Response('throw new Error("obsolete module")'));
  }, readFileSync('public/data/cedict.json', 'utf8'));
  await oldPage.goto('http://127.0.0.1:4173/');
  await oldPage.evaluate(() => navigator.serviceWorker.ready); await oldPage.reload();
  expect(await oldPage.evaluate(() => caches.keys())).not.toContain('kanjian-dictionary-visual-v4-old-bundled-worker');
  expect(await oldPage.evaluate(async () => Boolean(await caches.match('/assets/WordDetail-obsolete.js')))).toBe(false);
  await upgrade.setOffline(true);
  await oldPage.goto('http://127.0.0.1:4173/#search=' + encodeURIComponent('政治'));
  const politics = oldPage.locator('.word-card-main').filter({ has: oldPage.getByRole('heading', { name: '政治', exact: true }) }).first();
  await expect(politics).toBeVisible({ timeout: 30000 }); await politics.click();
  await expect(oldPage.locator('.gallery-section')).toBeVisible();
  await expect(oldPage.locator('.abstract-card')).toHaveCount(0);
  await oldPage.goto('http://127.0.0.1:4173/#practice=');
  await expect(oldPage.locator('.quiz-options button').first()).toBeVisible();
  await upgrade.close();
  // A legacy install could have a bundled classifier and saved words without
  // ever downloading CC-CEDICT. Upgrade must preserve that offline capability.
  const legacy = await browser.newContext(); const savedPage = await legacy.newPage();
  savedPage.on('pageerror', error => pageErrors.push(error.message));
  await savedPage.goto('http://127.0.0.1:4173/favicon.svg');
  await savedPage.evaluate(async saved => {
    const cache = await caches.open('kanjian-dictionary-visual-v4-legacy-worker-only');
    await cache.put('/assets/dictionary.worker-old.js', new Response('/* wordnet-3.1-cedict-legacy */'));
    localStorage.setItem('kanjian-saved', saved[0]);
    localStorage.setItem('kanjian-saved-entries', saved[1]);
  }, saved);
  await savedPage.goto('http://127.0.0.1:4173/');
  await savedPage.evaluate(() => navigator.serviceWorker.ready); await savedPage.reload();
  expect(await savedPage.evaluate(() => caches.keys())).not.toContain('kanjian-dictionary-visual-v4-legacy-worker-only');
  await legacy.setOffline(true);
  await savedPage.goto('http://127.0.0.1:4173/#saved=');
  await expect(savedPage.getByRole('heading', { name: '政治', exact: true })).toBeVisible();
  await savedPage.locator('.word-card-main').first().click();
  await expect(savedPage.locator('.gallery-section')).toBeVisible();
  expect(await savedPage.evaluate(() => [localStorage.getItem('kanjian-saved'), localStorage.getItem('kanjian-saved-entries')])).toEqual(saved);
  await legacy.close();
  expect(pageErrors).toEqual([]);
  console.log('PASS: fresh home avoids semantic data/worker execution; starter lazy features work offline; dictionary data loads on demand once; saved words and upgrades retain offline inference.');
} finally { await browser.close(); }
