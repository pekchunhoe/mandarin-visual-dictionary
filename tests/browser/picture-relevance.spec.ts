import { test, expect } from '@playwright/test';

test('selected fear meanings replace the gallery and ignore a late response for the previous sense', async ({ page }) => {
  let releaseFirst!: () => void;
  const firstReady = new Promise<void>(resolve => { releaseFirst = resolve; });
  const requests: string[] = [];
  await page.route('**/api/images?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('mode') !== 'gallery') return route.fulfill({ json: { status: 'unavailable', images: [] } });
    const sense = params.get('sense')!; requests.push(sense);
    if (sense === 'sense-0') await firstReady;
    const alt = sense === 'sense-0' ? 'Frightened meaning fixture' : 'Fear meaning fixture';
    await route.fulfill({ json: { status: 'live', expiresAt: Date.now() + 86400000, images: [{ id: sense, provider: 'pixabay', thumbnailUrl: '/photos/school.jpg', largeUrl: '/photos/school.jpg', width: 900, height: 700, alt, source: 'Pixabay', sourceUrl: 'https://pixabay.com/photos/fixture-1/' }] } });
  });
  await page.goto('/#word=' + encodeURIComponent('恐惧'));
  await expect(page.locator('.word-header h1')).toHaveText('恐惧', { timeout: 30000 });
  await expect.poll(() => requests).toContain('sense-0');
  await page.getByRole('button', { name: '2. fear', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Enlarge picture: Fear meaning fixture', exact: true })).toBeVisible();
  const firstResponse = page.waitForResponse(response => {
    const url = new URL(response.url());
    return url.pathname === '/api/images' && url.searchParams.get('mode') === 'gallery' && url.searchParams.get('sense') === 'sense-0';
  });
  releaseFirst(); await firstResponse;
  await expect.poll(() => requests).toEqual(['sense-0', 'sense-1']);
  await expect(page.getByRole('button', { name: 'Enlarge picture: Frightened meaning fixture', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Enlarge picture: Fear meaning fixture', exact: true }).click();
  await expect(page.getByRole('dialog').locator('img')).toHaveAttribute('alt', 'Fear meaning fixture');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '1. to be frightened', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Enlarge picture: Frightened meaning fixture', exact: true })).toBeVisible();
  expect(requests).toEqual(['sense-0', 'sense-1']);
});
