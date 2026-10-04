import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
const context = await browser.newContext(); const page = await context.newPage();
// Seed obsolete data before the current worker activates. No manual browser
// storage reset should be needed when the newly hashed app bundle is deployed.
await page.goto('http://127.0.0.1:4173/favicon.svg');
await page.evaluate(async () => {
  for (const name of ['kanjian-v1', 'kanjian-dictionary-visual-v2', 'kanjian-dictionary-visual-v3']) {
    const cache = await caches.open(name);
    await cache.put('/api/images?word=politics&sense=sense-0', new Response(JSON.stringify({ images: [], status: 'unavailable' })));
  }
});
await page.goto('http://127.0.0.1:4173/');
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload();
expect(await page.evaluate(() => caches.keys())).not.toContain('kanjian-dictionary-visual-v2');
expect(await page.evaluate(() => caches.keys())).not.toContain('kanjian-dictionary-visual-v3');
expect(await page.evaluate(() => caches.keys())).not.toContain('kanjian-v1');
expect(await page.evaluate(() => caches.keys())).toEqual([expect.stringMatching(/^kanjian-dictionary-visual-v4-[a-f0-9]+$/)]);
await page.goto('http://127.0.0.1:4173/#search=computer');
await expect(page.locator('.results-page .word-card').first()).toBeVisible({ timeout: 30000 });
await context.setOffline(true);
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
console.log('PASS: production shell, local photos, downloaded dictionary, emotion/concept classification, obsolete-cache deletion and image API cache bypass work offline.');
await browser.close();
