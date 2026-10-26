import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { switchOn } from '../teacher-language-fixtures';
import { teacherResponse } from '../teacher-fixtures';

type Row = [string, string, string, string[]];
const rows: Row[] = JSON.parse(readFileSync('public/data/cedict.json', 'utf8'));
const id = (row: Row) => `${row[1]}|${row[0]}|${row[2]}`;
const named = ['新官上任三把火', '苹果', '学习', '不耻下问', '近朱者赤，近墨者黑', '火'];
const longest = [...rows].filter(row => /\p{Script=Han}/u.test(row[1])).sort((a, b) => [...b[1]].length - [...a[1]].length).slice(0, 4);
const longEnglish = [...rows].sort((a, b) => Math.max(...b[3].map(text => text.length)) - Math.max(...a[3].map(text => text.length))).slice(0, 2);
const malayRecords: { entryId: string; senseId: string; malay: string }[] = JSON.parse(readFileSync('src/data/malay-runtime.json', 'utf8')).records;
const longMalay = [...malayRecords].sort((a, b) => b.malay.length - a.malay.length).slice(0, 3);
const fixtures = [
  ...named.map(name => ({ row: rows.find(row => row[1] === name && (name !== '苹果' || row[2] === 'ping2 guo3'))!, sense: 'sense-0', malay: '' })),
  ...[...longest, ...longEnglish].map(row => ({ row, sense: 'sense-0', malay: '' })),
  ...longMalay.map(record => ({ row: rows.find(row => id(row) === record.entryId)!, sense: record.senseId, malay: record.malay })),
];
const viewports = [
  [375, 667], [430, 932], [600, 900], [601, 900], [768, 1024], [799, 1024], [800, 1024], [801, 1180],
  [820, 1180], [1024, 1366], [1099, 1366], [1100, 1366], [1101, 820], [1180, 820], [1440, 900], [1920, 1080],
] as const;

test.beforeEach(async ({ page }) => {
  // No provider credentials or live quota are used. Galleries use local photos.
  await page.route('**/api/images?**', route => route.fulfill({ json: { status: 'curated', images: Array.from({ length: 8 }, (_, index) => ({ id: `layout-${index}`, thumbnailUrl: '/photos/apple.jpg', largeUrl: '/photos/apple.jpg', width: 900, height: 700, alt: 'Responsive gallery fixture', source: 'Pixabay', sourceUrl: 'https://pixabay.com/photos/apple-1/' })) } }));
  await page.route('**/api/teacher', route => route.fulfill({ status: 503, json: { code: 'unavailable' } }));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text: string) => { (window as unknown as { copiedPrompt: string }).copiedPrompt = text; } } });
  });
});

async function dimensions(page: Page) {
  return page.locator('.word-header').evaluate(header => {
    const bounds = (element: Element | Range) => element.getBoundingClientRect().toJSON();
    const identity = header.querySelector('.word-identity')!, heading = header.querySelector('h1')!;
    const english = header.querySelector('p[lang="en"]')!, panel = header.querySelector('.meaning-panel')!;
    const pinyin = header.querySelector('.detail-pinyin')!, listen = header.querySelector('.pronunciation-line button')!;
    const paragraphs = [...header.querySelectorAll<HTMLParagraphElement>('p[lang="en"],p[lang="ms"]')];
    const brokenWords: string[] = [];
    const canvas = document.createElement('canvas'), context = canvas.getContext('2d')!;
    for (const paragraph of paragraphs) {
      const node = paragraph.firstChild;
      if (node?.nodeType !== Node.TEXT_NODE) continue;
      context.font = getComputedStyle(paragraph).font;
      for (const match of paragraph.textContent!.matchAll(/[A-Za-z][A-Za-z'-]{2,}/g)) {
        if (context.measureText(match[0]).width > paragraph.clientWidth) continue; // Genuine unbreakable-token fallback.
        const range = document.createRange(); range.setStart(node, match.index!); range.setEnd(node, match.index! + match[0].length);
        const lines = new Set([...range.getClientRects()].filter(rect => rect.width > 0).map(rect => Math.round(rect.top)));
        if (lines.size > 1) brokenWords.push(match[0]);
      }
    }
    const characterBoxes = [];
    let offset = 0;
    for (const character of heading.textContent!) {
      const range = document.createRange(); range.setStart(heading.firstChild!, offset); offset += character.length; range.setEnd(heading.firstChild!, offset);
      characterBoxes.push(bounds(range));
    }
    const style = getComputedStyle(header);
    return { viewport: innerWidth, pageWidth: document.documentElement.scrollWidth, header: bounds(header), identity: bounds(identity), heading: bounds(heading), english: bounds(english), panel: bounds(panel), pinyin: bounds(pinyin), listen: bounds(listen), save: bounds(header.querySelector('.save-word')!), sense: header.querySelector('.sense-selector') ? bounds(header.querySelector('.sense-selector')!) : undefined,
      texts: paragraphs.map(element => element.textContent), textOverflow: paragraphs.some(element => element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1), brokenWords, characterBoxes,
      padding: parseFloat(style.paddingTop) + parseFloat(style.paddingBottom), gap: parseFloat(style.rowGap),
    };
  });
}

for (const [width, height] of viewports) {
  test(`real-corpus header and tools remain readable at ${width} × ${height}`, async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height });
    let teacherCalls = 0; page.on('request', request => { if (request.url().endsWith('/api/teacher')) teacherCalls++; });
    const evidence = [];
    for (const [index, fixture] of fixtures.entries()) {
      expect(fixture.row, 'Fixture must be an actual corpus row').toBeTruthy();
      await page.goto('/#' + new URLSearchParams({ word: fixture.row[1], entry: id(fixture.row), sense: fixture.sense }));
      await expect(page.locator('.word-header h1')).toHaveText(fixture.row[1], { timeout: 30_000 });
      if (fixture.malay) await expect(page.locator('.meaning-panel')).toContainText(fixture.malay);
      const layout = await dimensions(page); evidence.push({ entry: id(fixture.row), requestedSense: fixture.sense, ...layout });
      expect(layout.pageWidth, fixture.row[1]).toBeLessThanOrEqual(width);
      expect(layout.english.width, 'Comfortable definition width').toBeGreaterThanOrEqual(Math.min(320, layout.header.width) - 2);
      expect(layout.textOverflow, 'Complete definitions remain unclipped').toBe(false);
      expect(layout.brokenWords, 'Ordinary English/Malay words must not split over lines').toEqual([]);
      for (const box of layout.characterBoxes) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.left).toBeGreaterThanOrEqual(layout.heading.left - 1);
        expect(box.right).toBeLessThanOrEqual(layout.heading.right + 1);
      }
      if ([...fixture.row[1]].length >= 17) expect(new Set(layout.characterBoxes.map(box => Math.round(box.top))).size, 'Long headwords must wrap').toBeGreaterThan(1);
      expect(layout.pinyin.right <= layout.listen.left + 1 || layout.listen.right <= layout.pinyin.left + 1 || layout.pinyin.bottom <= layout.listen.top + 1 || layout.listen.bottom <= layout.pinyin.top + 1, 'Pinyin and Listen must not overlap').toBe(true);
      if (width <= 1100) {
        expect(layout.save.bottom, 'Save control must not overlap the headword or pronunciation').toBeLessThanOrEqual(layout.identity.top);
        expect(layout.english.width).toBeGreaterThanOrEqual(layout.header.width - 2);
        expect(layout.panel.top).toBeGreaterThanOrEqual(layout.identity.bottom);
        if (layout.sense) { expect(layout.sense.top).toBeGreaterThanOrEqual(layout.identity.bottom); expect(layout.panel.top).toBeGreaterThanOrEqual(layout.sense.bottom); }
        const contentHeight = layout.identity.height + layout.panel.height + (layout.sense?.height ?? 0);
        expect(layout.header.height, 'No unexplained vertical whitespace').toBeLessThanOrEqual(contentHeight + layout.padding + layout.gap * (layout.sense ? 2 : 1) + 2);
      } else {
        expect(layout.identity.right).toBeLessThanOrEqual(layout.panel.left);
        expect(layout.identity.width).toBeLessThanOrEqual(layout.header.width * .45 + 1);
      }
      if (index === 0) {
        expect(layout.english.height).toBeLessThan(120);
        expect(layout.header.height).toBeLessThan(width <= 430 ? 760 : 650);
        mkdirSync('.tmp/ipad-responsive', { recursive: true });
        await page.locator('.word-header').screenshot({ path: `.tmp/ipad-responsive/after-${testInfo.project.name || 'edge'}-${width}.png` });
      }
      const controls = page.locator('.ai-teacher .teacher-generate,.ai-teacher .teacher-prompt-button');
      await expect(controls).toHaveCount(4);
      for (const control of await controls.all()) {
        await expect(control).toBeEnabled();
        const box = (await control.boundingBox())!;
        expect(box.width).toBeGreaterThan(80); expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      }
      if (await page.locator('.gallery-grid').count()) {
        const gallery = (await page.locator('.gallery-grid').boundingBox())!;
        expect(gallery.width).toBeGreaterThan(layout.header.width - 5); expect(gallery.x + gallery.width).toBeLessThanOrEqual(width);
      }
    }
    expect(teacherCalls).toBe(0);
    writeFileSync(`.tmp/ipad-responsive/metrics-${testInfo.project.name || 'edge'}-${width}.json`, JSON.stringify(evidence, null, 2));
  });
}

test('selected meaning, copy prompts and generated results survive portrait/landscape transitions', async ({ page }) => {
  let teacherCalls = 0;
  await page.route('**/api/teacher', route => { teacherCalls++; return route.fulfill({ json: teacherResponse('sentences', switchOn) }); });
  await page.goto('/#word=开'); await page.getByRole('button', { name: /2. to turn on/ }).click();
  const selectedEnglish = await page.locator('.meaning-panel p[lang=en]').innerText();
  const selectedMalay = await page.locator('.meaning-panel p[lang=ms]').innerText();
  expect(selectedEnglish).toContain('to turn on'); expect(selectedMalay.length).toBeGreaterThan(0);
  for (const [width, height] of [[820, 1180], [1180, 820], [1024, 1366], [1440, 900], [768, 1024]]) {
    await page.setViewportSize({ width, height });
    await expect(page.locator('.meaning-panel p[lang=en]')).toHaveText(selectedEnglish);
    await expect(page.locator('.meaning-panel p[lang=ms]')).toHaveText(selectedMalay);
    await expect(page.getByRole('button', { name: /2. to turn on/ })).toHaveAttribute('aria-pressed', 'true');
    for (const name of ['Copy sentence prompt for 开', 'Copy synonym and antonym prompt for 开']) {
      await page.getByRole('button', { name, exact: true }).click();
      expect(await page.evaluate(() => (window as unknown as { copiedPrompt: string }).copiedPrompt)).toContain('Selected meaning (English): to turn on');
    }
    expect(teacherCalls).toBe(0);
  }
  await page.getByRole('button', { name: /造句 · Example Sentences/ }).click();
  await expect(page.locator('.teacher-sentence')).toHaveCount(3); expect(teacherCalls).toBe(1);
  await page.setViewportSize({ width: 1180, height: 820 }); await expect(page.locator('.teacher-sentence')).toHaveCount(3);
  await expect(page.getByRole('button', { name: '复制 · Copy', exact: true })).toHaveCount(3);
});

test('header language choices, save control and tablet accessibility remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 }); await page.goto('/#word=苹果');
  await page.getByRole('radio', { name: 'English only', exact: true }).check(); await expect(page.locator('.meaning-panel p[lang=ms]')).toHaveCount(0);
  await page.getByRole('radio', { name: 'Bahasa Melayu only', exact: true }).check(); await expect(page.locator('.meaning-panel p[lang=en]')).toHaveCount(0);
  await page.getByRole('radio', { name: 'English + Bahasa Melayu', exact: true }).check();
  await expect(page.locator('.meaning-panel p[lang=ms]')).toContainText('epal');
  await page.getByRole('button', { name: 'Save word', exact: true }).click(); await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeVisible();
  const audit = await new AxeBuilder({ page }).include('.word-header').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze(); expect(audit.violations).toEqual([]);
});
