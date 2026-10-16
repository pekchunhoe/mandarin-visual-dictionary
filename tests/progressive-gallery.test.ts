// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
import { createServer, get } from 'node:http';
import handler from '../server/image-handler';
import { clearImageCache, getImages } from '../server/images';
import { imageRelevance } from '../server/visual-search';
import { imageSearchPlan } from '../server/image-plan';
import { byId } from '../src/data/learning';
import { largeGalleryCases, largeGalleryRecords } from './large-gallery-data';
import { json, ov, px } from './gallery-data';
beforeEach(clearImageCache);

it.each(['pixabay', 'openverse'])('publishes one valid %s image before a slow peer, then compares both', async fast => {
  let release!: () => void; const slow = new Promise<void>(r => { release = r; });
  let complete = false; const snapshots: string[][] = [];
  const word = byId.get('跑')!, plan = imageSearchPlan(word, word.senses[0])!;
  const options = { pixabayKey: 'stream-fixture', fetcher: vi.fn(async (input: string | URL | Request) => {
    const pixabay = new URL(String(input)).hostname === 'pixabay.com';
    if (pixabay !== (fast === 'pixabay')) await slow;
    return pixabay ? json({ hits: [px(1, 'person running park')] }) : json({ results: [ov(2, 'athlete running track training outdoors')] });
  }), onProgress: (result: Awaited<ReturnType<typeof getImages>>) => {
    expect(result.images.every(photo => imageRelevance(photo, plan).semantic)).toBe(true);
    snapshots.push(result.images.map(photo => photo.id));
  } };
  const request = getImages('跑', 'sense-0', options).then(result => { complete = true; return result; });
  await vi.waitFor(() => expect(snapshots.length).toBeGreaterThan(0));
  expect(complete).toBe(false); expect(snapshots[0]).toHaveLength(1);
  expect(snapshots[0][0]).toContain(fast);
  release(); const final = await request;
  expect(new Set(final.images.map(photo => photo.provider))).toEqual(new Set(['pixabay', 'openverse']));
  const count = options.fetcher.mock.calls.length;
  await getImages('跑', 'sense-0', options); expect(options.fetcher).toHaveBeenCalledTimes(count);
});

it('publishes valid inventory before the other provider fails', async () => {
  let release!: () => void; const slow = new Promise<void>(r => { release = r; });
  const progress = vi.fn();
  const request = getImages('跑', 'sense-0', { pixabayKey: 'failure-fixture', onProgress: progress, fetcher: async input => {
    if (new URL(String(input)).hostname === 'pixabay.com') return json({ hits: [px(1, 'athlete running track')] });
    await slow; throw new Error('failed provider');
  } });
  await vi.waitFor(() => expect(progress).toHaveBeenCalled()); release();
  expect((await request).images).toHaveLength(1);
});

it('streams actual HTTP chunks, still returns 20, and preserves JSON errors and licensing', async () => {
  vi.stubEnv('PIXABAY_API_KEY', 'http-stream-fixture');
  vi.stubEnv('OPENVERSE_CLIENT_ID', ''); vi.stubEnv('OPENVERSE_CLIENT_SECRET', '');
  let release!: () => void; const slow = new Promise<void>(r => { release = r; });
  const records = largeGalleryRecords(largeGalleryCases[1]);
  const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
    const url = new URL(String(input));
    if (url.hostname === 'pixabay.com') return json({ hits: records.hits.slice(0, 4) });
    await slow; return json({ results: records.results });
  });
  const server = createServer((req, res) => { void handler(req, res); });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  const port = (server.address() as { port: number }).port;
  const request = (path: string) => new Promise<import('node:http').IncomingMessage>((resolve, reject) => { get(`http://127.0.0.1:${port}/${path}`, { headers: { Accept: 'application/x-ndjson' } }, resolve).on('error', reject); });
  try {
    const invalid = await request('?word=unknown&sense=sense-0');
    expect(invalid.statusCode).toBe(400); expect(invalid.headers['content-type']).toContain('application/json'); invalid.resume();
    const response = await request(`?word=${encodeURIComponent('跑')}&sense=sense-0`);
    expect(response.headers['content-type']).toContain('application/x-ndjson');
    expect(response.headers['cache-control']).toContain('no-store');
    const reader = response[Symbol.asyncIterator]();
    const first = String((await reader.next()).value);
    expect(JSON.parse(first.trim()).done).toBe(false);
    expect(JSON.parse(first.trim()).result.images.length).toBeGreaterThan(0);
    release(); let rest = '';
    while (true) { const chunk = await reader.next(); if (chunk.done) break; rest += String(chunk.value); }
    const final = JSON.parse(rest.trim().split('\n').at(-1)!);
    expect(final.done).toBe(true); expect(final.result.images).toHaveLength(20);
    expect(final.result.images.some((p: { provider: string; licenseUrl?: string }) => p.provider === 'openverse' && p.licenseUrl)).toBe(true);
    expect(new Set(final.result.images.map((p: { id: string }) => p.id)).size).toBe(20);
  } finally { release(); await new Promise<void>(r => server.close(() => r())); fetcher.mockRestore(); vi.unstubAllEnvs(); }
});
