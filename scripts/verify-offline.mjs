import { chromium, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
const context = await browser.newContext(); const page = await context.newPage();
const dictionary = readFileSync('public/data/cedict.json', 'utf8');
const savedWords = JSON.parse(dictionary).filter(row => ['狼吞虎咽', '惊慌失措', '人山人海'].includes(row[1])).map(row => ({
  id: `${row[1]}|${row[0]}|${row[2]}`, simplified: row[1], traditional: row[0], numericPinyin: row[2], pinyin: row[2], source: 'CC-CEDICT',
  senses: row[3].filter(gloss => !/^CL:/i.test(gloss)).map((english, i) => ({ id: `sense-${i}`, english, visualType: 'abstract', visualOrigin: 'inferred', examples: [] }))
}));
expect(savedWords).toHaveLength(3);
const saved = JSON.stringify(savedWords.map(word => word.id));
const entries = JSON.stringify(savedWords);
const dictionaryDownloads = [];
context.on('response', response => { if (new URL(response.url()).pathname === '/data/cedict.json' && !response.fromServiceWorker()) dictionaryDownloads.push(response.url()); });
// Seed obsolete data before the current worker activates. No manual browser
// storage reset should be needed when the newly hashed app bundle is deployed.
await page.goto('http://127.0.0.1:4173/favicon.svg');
await page.evaluate(async ({ dictionary, saved, entries }) => {
  for (const name of ['kanjian-v1', 'kanjian-dictionary-visual-v2', 'kanjian-dictionary-visual-v3', 'kanjian-dictionary-visual-v5', 'kanjian-dictionary-visual-v5-123abc']) {
    const cache = await caches.open(name);
    await cache.put('/api/images?word=politics&sense=sense-0', new Response(JSON.stringify({ images: [], status: 'unavailable' })));
  }
  const previous = await caches.open('kanjian-dictionary-visual-v5-123abc');
  await previous.put('/data/cedict.json', new Response(dictionary, { headers: { 'Content-Type': 'application/json' } }));
  await previous.put('/assets/obsolete-v5.js', new Response('throw new Error("obsolete shell")'));
  localStorage.setItem('kanjian-saved', saved);
  localStorage.setItem('kanjian-saved-entries', entries);
  localStorage.setItem('kanjian-recent', JSON.stringify(['computer']));
}, { dictionary, saved, entries });
await page.goto('http://127.0.0.1:4173/');
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload();
expect(await page.evaluate(() => caches.keys())).not.toContain('kanjian-dictionary-visual-v2');
expect(await page.evaluate(() => caches.keys())).not.toContain('kanjian-dictionary-visual-v3');
expect(await page.evaluate(() => caches.keys())).not.toContain('kanjian-v1');
expect(await page.evaluate(() => caches.keys())).toEqual([expect.stringMatching(/^kanjian-dictionary-visual-v6-[a-f0-9]+$/)]);
expect(await page.evaluate(async () => (await caches.match('/data/cedict.json'))?.text())).toBe(dictionary);
expect(await page.evaluate(async () => Boolean(await caches.match('/assets/obsolete-v5.js')))).toBe(false);
expect(await page.evaluate(async () => Boolean(await caches.match('/api/images?word=politics&sense=sense-0')))).toBe(false);
await page.goto('http://127.0.0.1:4173/#search=computer');
await expect(page.locator('.results-page .word-card').first()).toBeVisible({ timeout: 30000 });
await context.setOffline(true);
// Previously saved negative eligibility must refresh through the new worker,
// even offline, without rewriting the user's definitions or saved collection.
for (const word of savedWords) {
  await page.goto('http://127.0.0.1:4173/#' + new URLSearchParams({ word: word.simplified, entry: word.id }));
  await expect(page.locator('.word-header h1')).toHaveText(word.simplified, { timeout: 30000 });
  await expect(page.locator('.meaning-panel p').first()).toHaveText(word.senses[0].english);
  await expect(page.locator('.gallery-section')).toBeVisible();
  await expect(page.locator('.abstract-card')).toHaveCount(0);
}
expect(await page.evaluate(() => [localStorage.getItem('kanjian-saved'), localStorage.getItem('kanjian-saved-entries'), localStorage.getItem('kanjian-recent')])).toEqual([saved, entries, JSON.stringify(['computer'])]);
expect(dictionaryDownloads).toEqual([]);
await page.goto('http://127.0.0.1:4173/#search=computer');
// Even if a legacy cache contains an empty API response, the SW must not serve it.
expect(await page.evaluate(async () => {
  const url = '/api/images?word=legacy&sense=sense-0';
  const cache = await caches.open('kanjian-legacy-image-test');
  await cache.put(url, new Response(JSON.stringify({ images: [], status: 'unavailable' }), { headers: { 'Content-Type': 'application/json' } }));
  try { await fetch(url); return false; } catch { return true; }
  finally { await caches.delete('kanjian-legacy-image-test'); }
})).toBe(true);
await page.reload();
await expect(page.locator('.results-page .word-card').first()).toBeVisible({ timeout: 30000 });
await page.goto('http://127.0.0.1:4173/#word=苹果');
await expect(page.locator('.word-header h1')).toHaveText('苹果');
await expect(page.locator('.gallery-grid figure')).toHaveCount(8);
await expect(page.locator('.gallery-grid img').first()).toBeVisible();
expect(await page.locator('.gallery-grid img').first().evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
await page.reload();
await expect(page.locator('.word-header h1')).toHaveText('苹果');
await expect(page.locator('.offline-banner')).toBeVisible();
await page.goto('http://127.0.0.1:4173/#word=' + encodeURIComponent('恐慌'));
await expect(page.locator('.word-header h1')).toHaveText('恐慌', { timeout: 30000 });
await expect(page.locator('.gallery-section')).toBeVisible();
await expect(page.locator('.abstract-card')).toHaveCount(0);
for (const text of ['政治', '经济', '文化', '科学', '法律']) {
  await page.goto('http://127.0.0.1:4173/#search=' + encodeURIComponent(text));
  const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: text, exact: true }) }).first();
  await expect(card).toBeVisible({ timeout: 30000 });
  await card.click();
  await expect(page.locator('.word-header h1')).toHaveText(text);
  await expect(page.locator('.gallery-section')).toBeVisible();
  await expect(page.locator('.abstract-card')).toHaveCount(0);
}
console.log('PASS: v5-to-v6 migration preserves saved words and dictionary bytes without redownloading, refreshes all three saved idioms, removes obsolete visuals/shell, and retains offline photos, classification and image API cache bypass.');
await browser.close();
