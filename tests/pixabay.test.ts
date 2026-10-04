// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearImageCache, getImages } from '../server/images';
import { normalizePixabay, pixabayRequest } from '../server/providers';
import { imageSearchPlan, normalizeVisualQuery, providerCacheKey } from '../server/image-plan';
import { byId } from '../src/data/learning';
import { IMAGE_TTL } from '../src/lib/visual';
export const hit = (id = 1, tags = 'apple, fruit, food') => ({ id, tags, pageURL: `https://pixabay.com/photos/apple-${id}/`, webformatURL: `https://pixabay.com/get/apple-${id}_640.jpg`, largeImageURL: `https://pixabay.com/get/apple-${id}_1280.jpg`, webformatWidth: 640, webformatHeight: 480, imageWidth: 1600, imageHeight: 1200, user: 'Example Contributor', user_id: 123, downloads: 12, likes: 2 });
const success = (hits = Array.from({ length: 12 }, (_, i) => hit(i + 1))) => ({ ok: true, json: async () => ({ hits }) });
const options = (fetcher: typeof fetch) => ({ pixabayKey: 'test-pixabay-secret-12345', pexelsKey: 'test-pexels-secret-12345', fetcher });
beforeEach(clearImageCache);
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
describe('Pixabay integration', () => {
  it('uses Pixabay first with mandatory safe search and normalized metadata', async () => {
    const fetcher = vi.fn().mockResolvedValue(success());
    const result = await getImages('苹果', 'sense-0', options(fetcher));
    expect(fetcher).toHaveBeenCalledTimes(1);
    const url = new URL(fetcher.mock.calls[0][0]);
    expect(url.origin).toBe('https://pixabay.com');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({ q: 'apple fruit', safesearch: 'true', image_type: 'photo', category: 'food', lang: 'en', per_page: '32' });
    expect(fetcher.mock.calls[0][1]).toMatchObject({ redirect: 'error', signal: expect.any(AbortSignal) });
    expect(result.images).toHaveLength(12);
    expect(result.images[0]).toMatchObject({ id: 'pixabay-1', provider: 'pixabay', thumbnailUrl: 'https://pixabay.com/get/apple-1_340.jpg', displayUrl: 'https://pixabay.com/get/apple-1_640.jpg', largeUrl: 'https://pixabay.com/get/apple-1_1280.jpg', width: 1600, height: 1200, tags: ['apple', 'fruit', 'food'], photographer: 'Example Contributor', sourceUrl: 'https://pixabay.com/photos/apple-1/', queryContext: 'apple fruit' });
    expect(JSON.stringify(result)).not.toContain(options(fetcher).pixabayKey);
  });
  it.each([['苹果', 'apple fruit'], ['银行', 'bank financial institution'], ['猫', 'domestic cat animal'], ['跑', 'person running'], ['医生', 'doctor medical professional']])('uses the reviewed intent for %s', async (word, query) => {
    const fetcher = vi.fn().mockResolvedValue(success([]));
    await getImages(word, 'sense-0', { ...options(fetcher), mode: 'thumbnail' });
    const url = new URL(fetcher.mock.calls[0][0]);
    expect(url.searchParams.get('q')).toContain(query); expect(url.searchParams.get('safesearch')).toBe('true');
  });
  it.each(['因为', '但是', '虽然', '已经', '如果', '可能'])('does not search stock photos for %s', async word => {
    const fetcher = vi.fn(); expect((await getImages(word, 'sense-0', options(fetcher))).images).toEqual([]); expect(fetcher).not.toHaveBeenCalled();
  });
  it('deduplicates IDs and resized URLs; rejects malformed, tiny, unsafe, irrelevant and wrong-intent hits', () => {
    const result = normalizePixabay([hit(), hit(), { ...hit(2), largeImageURL: hit().largeImageURL }, { ...hit(3), webformatURL: 'javascript:alert(1)' }, { ...hit(4), imageWidth: 10 }, hit(5, 'apple, iphone, technology'), hit(6, 'mountain'), null, {}], 'apple fruit');
    expect(result.map(p => p.id)).toEqual(['pixabay-1']);
    expect(normalizePixabay([hit(1, 'bank, riverbank'), hit(2, 'bank, finance')], 'bank financial institution').map(p => p.id)).toEqual(['pixabay-2']);
  });
  it('uses at most one supporting search to fill a sparse gallery', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(success([hit()])).mockResolvedValueOnce(success(Array.from({ length: 8 }, (_, i) => hit(i + 2))));
    const result = await getImages('苹果', 'sense-0', options(fetcher));
    expect(fetcher).toHaveBeenCalledTimes(2); expect(result.images.filter(p => p.provider === 'pixabay')).toHaveLength(9);
    expect(new URL(fetcher.mock.calls[1][0]).searchParams.get('q')).toBe('apple orchard');
  });
  it('returns one thumbnail and uses only the minimum Pixabay page size', async () => {
    const fetcher = vi.fn().mockResolvedValue(success([hit(), hit(2), hit(3)]));
    const result = await getImages('苹果', 'sense-0', { ...options(fetcher), mode: 'thumbnail' });
    expect(result.images).toHaveLength(1); expect(fetcher).toHaveBeenCalledTimes(1);
    expect(new URL(fetcher.mock.calls[0][0]).searchParams.get('per_page')).toBe('3');
  });
  it('deduplicates concurrent calls and lets thumbnails reuse gallery results', async () => {
    const fetcher = vi.fn().mockResolvedValue(success());
    await Promise.all([getImages('苹果', 'sense-0', options(fetcher)), getImages('苹果', 'sense-0', options(fetcher)), getImages('苹果', 'sense-0', { ...options(fetcher), mode: 'thumbnail' })]);
    expect((await getImages('苹果', 'sense-0', { ...options(fetcher), mode: 'thumbnail' })).images).toHaveLength(1); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('expires server results after exactly 24 hours without extending old URLs', async () => {
    vi.useFakeTimers(); const fetcher = vi.fn().mockResolvedValue(success());
    const first = await getImages('苹果', 'sense-0', options(fetcher));
    vi.advanceTimersByTime(IMAGE_TTL - 1); expect((await getImages('苹果', 'sense-0', options(fetcher))).expiresAt).toBe(first.expiresAt); expect(fetcher).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1); await getImages('苹果', 'sense-0', options(fetcher)); expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('separates senses, queries, providers, categories and image types in the cache', async () => {
    const word = byId.get('开')!; const first = imageSearchPlan(word, word.senses[0])!.primary;
    const keys = [providerCacheKey('pixabay', first), providerCacheKey('pexels', first), providerCacheKey('pixabay', { ...first, senseId: 'sense-1' }), providerCacheKey('pixabay', { ...first, query: 'other reviewed query' }), providerCacheKey('pixabay', { ...first, category: 'people' }), providerCacheKey('pixabay', { ...first, imageType: 'illustration' })];
    expect(new Set(keys).size).toBe(keys.length);
    const fetcher = vi.fn().mockResolvedValue(success([]));
    await getImages('开', word.senses[0].id, { pixabayKey: 'test-key', fetcher, mode: 'thumbnail' });
    await getImages('开', word.senses[1].id, { pixabayKey: 'test-key', fetcher, mode: 'thumbnail' });
    expect(fetcher).toHaveBeenCalledTimes(2); expect(fetcher.mock.calls[0][0]).not.toBe(fetcher.mock.calls[1][0]);
  });
  it('falls through empty Pixabay searches to configured Pexels', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(success([])).mockResolvedValueOnce(success([])).mockResolvedValueOnce({ ok: true, json: async () => ({ photos: [{ id: 99, width: 900, height: 700, url: 'https://www.pexels.com/photo/99/', src: { medium: 'https://images.pexels.com/photos/99/medium.jpg', large: 'https://images.pexels.com/photos/99/large.jpg' } }] }) });
    const result = await getImages('苹果', 'sense-0', options(fetcher));
    expect(result.images[0].provider).toBe('pexels'); expect(new URL(fetcher.mock.calls[2][0]).hostname).toBe('api.pexels.com');
  });
  it('caches empty searches for 24 hours and falls back to bundled photos', async () => {
    const fetcher = vi.fn().mockResolvedValue(success([]));
    const opts = { pixabayKey: 'test-key', fetcher };
    expect((await getImages('苹果', 'sense-0', opts)).status).toBe('curated'); await getImages('苹果', 'sense-0', opts); expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it.each([400, 401, 403, 429, 500, 503])('handles HTTP %s without leaking provider errors or retrying immediately', async status => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status, headers: new Headers(), json: vi.fn(() => { throw new Error('test-secret'); }) });
    const opts = { pixabayKey: 'test-secret', fetcher };
    const result = await getImages('苹果', 'sense-0', opts); expect(result.status).toBe('curated'); expect(JSON.stringify(result)).not.toContain('test-secret');
    await getImages('苹果', 'sense-0', opts); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('respects a provider-wide 429 cooldown across different words', async () => {
    vi.useFakeTimers(); const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 429, headers: new Headers({ 'X-RateLimit-Reset': '120' }) });
    const opts = { pixabayKey: 'test-key', fetcher, mode: 'thumbnail' as const };
    await getImages('苹果', 'sense-0', opts); await getImages('猫', 'sense-0', opts); vi.advanceTimersByTime(119000); await getImages('跑', 'sense-0', opts); expect(fetcher).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000); await getImages('猫', 'sense-0', opts); expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it.each(['network', 'malformed', 'invalid-json', 'secret-echo'])('falls back on %s', async kind => {
    const fetcher = vi.fn().mockImplementation(async () => {
      if (kind === 'network') throw new Error('https://pixabay.com/api/?key=test-secret');
      return { ok: true, json: async () => { if (kind === 'invalid-json') throw new Error('bad json'); return kind === 'malformed' ? { hits: {} } : { hits: [{ ...hit(), user: 'test-secret' }] }; } };
    });
    const result = await getImages('苹果', 'sense-0', { pixabayKey: 'test-secret', fetcher }); expect(result.status).toBe('curated'); expect(JSON.stringify(result)).not.toContain('test-secret');
  });
  it('aborts a stalled upstream request and returns a usable fallback', async () => {
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockImplementation(() => { const controller = new AbortController(); setTimeout(() => controller.abort(), 5); return controller.signal; });
    const fetcher = vi.fn((_url, init) => new Promise<Response>((_resolve, reject) => { init.signal.addEventListener('abort', () => reject(new Error('timed out'))); }));
    expect((await getImages('苹果', 'sense-0', { pixabayKey: 'test-key', fetcher })).status).toBe('curated'); expect(timeout).toHaveBeenCalledWith(3500);
  });
  it('does not request anything without keys and keeps text fallback available', async () => {
    const fetcher = vi.fn(); expect((await getImages('银行', 'sense-0', { fetcher })).status).toBe('unavailable'); expect(fetcher).not.toHaveBeenCalled();
  });
  it('validates query lengths and approved parameter values', () => {
    expect(normalizeVisualQuery('  Apple   FRUIT ')).toBe('apple fruit'); expect(() => normalizeVisualQuery('a'.repeat(101))).toThrow(); expect(() => normalizeVisualQuery('bad\u0000query')).toThrow();
    const plan = imageSearchPlan(byId.get('苹果')!, byId.get('苹果')!.senses[0])!;
    expect(() => pixabayRequest({ ...plan.primary, category: 'unsafe' as never }, 'test-key')).toThrow(); expect(() => pixabayRequest({ ...plan.primary, imageType: 'video' as never }, 'test-key')).toThrow();
  });
});
