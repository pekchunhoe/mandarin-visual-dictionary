import { chromium, expect } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { corpus } from './malay/corpus.mjs';
import { ROOT } from './malay/lexical-enrichment.mjs';
const before = process.argv.includes('--before'), base = process.env.KANJIAN_TEST_URL ?? 'https://mandarin-visual-dictionary.vercel.app';
const dir = '.tmp/malay-lexical-accuracy/live'; mkdirSync(dir, { recursive: true });
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const get = async path => { const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(60000) }); expect(response.ok).toBe(true); return Buffer.from(await response.arrayBuffer()); };
const html = (await get('/')).toString(), main = html.match(/src="([^"]+\/index-[^"]+\.js)"/)[1];
const mainBytes = await get(main), worker = mainBytes.toString().match(/\/assets\/dictionary\.worker-[\w-]+\.js/)[0];
const workerBytes = await get(worker), runtime = workerBytes.toString().match(/malay-runtime-[\w-]+\.json/)[0];
const dictionaryBytes = await get('/data/cedict.json'), runtimeBytes = await get('/assets/' + runtime), asset = JSON.parse(runtimeBytes);
expect(hash(dictionaryBytes)).toBe(hash(readFileSync('public/data/cedict.json')));
const expected = before ? readFileSync(`${ROOT}/baseline-runtime.json`) : readFileSync('src/data/malay-runtime.json');
expect(hash(runtimeBytes)).toBe(hash(expected));
const result = { time: new Date().toISOString(), beforeRelease: before, base,
  dictionarySha256: hash(dictionaryBytes), runtimeSha256: hash(runtimeBytes), runtimeVersion: asset.version, storedSenses: asset.records.length,
  assets: { main, mainSha256: hash(mainBytes), worker, workerSha256: hash(workerBytes), runtime }, browser: null };
if (!before) {
  for (const path of [main, worker, '/assets/' + runtime]) expect(hash(await get(path))).toBe(hash(readFileSync('dist' + path)));
  expect(hash(await get('/data/MALAY-LEXICAL-ATTRIBUTION.json'))).toBe(hash(readFileSync('public/data/MALAY-LEXICAL-ATTRIBUTION.json')));
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
  const context = await browser.newContext(), page = await context.newPage(), errors = [], forbidden = [], apiResponses = [], examples = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (/huggingface\.co|api\.openai\.com|translation\.googleapis\.com|translate\.google/.test(r.url())) forbidden.push(r.url()); });
  page.on('response', r => { if (new URL(r.url()).pathname === '/api/images') apiResponses.push(r.status()); });
  try {
    const begun = Date.now(); await page.goto(base); await expect(page.locator('.hero')).toBeVisible(); const homeMs = Date.now() - begun;
    for (const [query, chinese, english] of [['家俱', '家俱', 'variant of 家具[jia1 ju4]'], ['perabot', '家俱', 'variant of 家具[jia1 ju4]'], ['哺乳动物', '哺乳动物', 'mammal'], ['mamalia', '哺乳动物', 'mammal']]) {
      await page.goto(base + '/#search=' + encodeURIComponent(query));
      const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: chinese, exact: true }) }).first();
      await expect(card).toBeVisible({ timeout: 60000 }); await card.click();
      const source = asset.records.find(r => r.entryId.split('|')[0] === chinese && r.english === english);
      await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveText(english);
      await expect(page.locator('.malay-lexical p')).toHaveText(source.malayLexical?.text ?? source.malay);
      if (source.malayLexical) await expect(page.locator('.malay-definition p')).toHaveText(source.malay);
      await expect(page.locator('.detail-pinyin')).not.toBeEmpty();
      await page.setViewportSize({ width: 320, height: 700 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `${dir}/${chinese}-${query === chinese ? 'chinese' : 'malay'}-phone.png`, fullPage: true });
      await page.setViewportSize({ width: 1280, height: 720 });
      examples.push({ query, chinese, english, lexical: source.malayLexical?.text ?? source.malay, explanation: source.malayLexical ? source.malay : null });
    }
    // A missing canonical sense retains the official, optional navigation link.
    const keys = new Set(asset.records.map(r => r.key)), data = corpus();
    const missing = data.senses.find(s => s.simplified === '电流' && !keys.has(s.key)) ?? data.senses.find(s => s.simplified.length === 2 && /^[\p{Script=Han}]+$/u.test(s.simplified) && !keys.has(s.key));
    await page.goto(base + '/#search=' + encodeURIComponent(missing.simplified));
    const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: missing.simplified, exact: true }) }).first();
    await expect(card).toBeVisible({ timeout: 60000 }); await card.click();
    if (missing.senseId !== 'sense-0') await page.getByRole('group', { name: 'Word meaning' }).getByRole('button', { name: `${Number(missing.senseId.slice(6)) + 1}. ${missing.english}`, exact: true }).click();
    const fallback = new URL(await page.getByRole('link', { name: 'Translate with Google' }).getAttribute('href'));
    expect(fallback.origin).toBe('https://translate.google.com'); expect(fallback.searchParams.get('sl')).toBe('en'); expect(fallback.searchParams.get('tl')).toBe('ms'); expect(fallback.searchParams.get('text')).toBe(missing.english);
    await page.goto(base + '/#search=' + encodeURIComponent('猫'));
    const cat = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: '猫', exact: true }) }).first();
    await expect(cat).toBeVisible({ timeout: 60000 }); await cat.click(); await expect(page.locator('.gallery-section')).toBeVisible();
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]); expect(forbidden).toEqual([]); expect(apiResponses.some(s => s >= 500)).toBe(false);
    result.browser = { homeMs, examples, fallbackSense: { chinese: missing.simplified, english: missing.english },
      galleryItems: await page.locator('.gallery-grid figure').count(), apiResponses, errors, forbiddenRequests: forbidden, mobileWidth: 320 };
  } finally { await browser.close(); }
}
writeFileSync(`${dir}/${before ? 'before' : 'after'}.json`, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
