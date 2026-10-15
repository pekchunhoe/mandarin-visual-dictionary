import { expect, test } from '@playwright/test';

test('missing meanings open only the selected English sense on the official Google site when clicked', async ({ page, context }) => {
  const googleRequests: { url: string; method: string; navigation: boolean }[] = [];
  const errors: string[] = [];
  context.on('request', request => { if (/google|translate|huggingface|onnx/i.test(new URL(request.url()).hostname)) googleRequests.push({ url: request.url(), method: request.method(), navigation: request.isNavigationRequest() }); });
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/images?**', route => route.fulfill({ json: { status: 'unavailable', images: [] } }));
  // Exercise a real new-tab navigation while keeping third-party page contents
  // deterministic; this test neither requests nor reads a Google translation.
  await context.route('https://translate.google.com/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Official destination fixture</title>' }));
  await page.goto('/#search=' + encodeURIComponent('河岸'));
  const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: '河岸', exact: true }) }).first();
  await expect(card).toBeVisible({ timeout: 45000 }); await card.click();
  await expect(page.locator('.meaning-panel p[lang="en"]')).toHaveText('riverside');
  let url = new URL(await page.getByRole('link', { name: 'Translate with Google' }).getAttribute('href') ?? '');
  expect(url.searchParams.get('text')).toBe('riverside');
  await page.getByRole('button', { name: '2. river bank', exact: true }).click();
  url = new URL(await page.getByRole('link', { name: 'Translate with Google' }).getAttribute('href') ?? '');
  expect(url.origin).toBe('https://translate.google.com'); expect(url.searchParams.get('sl')).toBe('en'); expect(url.searchParams.get('tl')).toBe('ms');
  expect(url.searchParams.get('text')).toBe('river bank');
  expect(googleRequests).toEqual([]);
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  const popupPromise = context.waitForEvent('page'); await page.getByRole('link', { name: 'Translate with Google' }).click();
  const popup = await popupPromise; await popup.waitForURL(url.href);
  expect(await popup.evaluate(() => window.opener === null)).toBe(true);
  await popup.close();
  expect(googleRequests).toEqual([{ url: url.href, method: 'GET', navigation: true }]);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(stored);
  await page.setViewportSize({ width: 320, height: 700 });
  await expect(page.getByRole('link', { name: 'Translate with Google' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(page.getByRole('link', { name: 'Translate with Google' })).toBeVisible({ timeout: 45000 });
  expect(errors).toEqual([]);
});

test('stored Malay meanings remain available through Mandarin, English and Malay search', async ({ page }) => {
  test.setTimeout(90000);
  await page.route('**/api/images?**', route => route.fulfill({ json: { status: 'unavailable', images: [] } }));
  for (const query of ['人口普查', 'census', 'banci']) {
    await page.goto('/#search=' + encodeURIComponent(query));
    const card = page.locator('.word-card-main').filter({ has: page.getByRole('heading', { name: '人口普查', exact: true }) }).first();
    await expect(card).toBeVisible({ timeout: 45000 }); await card.click();
    await expect(page.locator('.meaning-panel p[lang="ms"]')).toHaveText('banci');
    await expect(page.getByRole('link', { name: 'Translate with Google' })).toHaveCount(0);
  }
});
