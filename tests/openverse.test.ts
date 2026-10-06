// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearImageCache, getImages } from '../server/images';
import { normalizeOpenverse, normalizePixabay, openverseRequest } from '../server/providers';
import { openverseToken } from '../server/openverse-auth';
import { imageSearchPlan, providerCacheKey } from '../server/image-plan';
import { imageRelevance, rankImageCandidates } from '../server/visual-search';
import { byId } from '../src/data/learning';
import { fromRow } from '../src/lib/dictionary-entry';
import { deduplicateImages, isImageUrl, isPublicHttpsUrl } from '../src/lib/visual';

const credentials = { openverseClientId: 'fixture-client-id', openverseClientSecret: 'fixture-client-secret' };
const token = 'fixture-access-token';
const ov = (id = 1, title = 'apple fruit') => ({ id: `image-${id}`, title, url: `https://live.staticflickr.com/123/apple-${id}.jpg`, thumbnail: `https://api.openverse.org/v1/images/image-${id}/thumb/`, width: 900, height: 700, creator: 'Test Creator', creator_url: 'https://www.flickr.com/people/test', foreign_landing_url: `https://www.flickr.com/photos/test/${id}/`, license: 'by', license_version: '4.0', license_url: 'https://creativecommons.org/licenses/by/4.0/', attribution: 'Apple by Test Creator is licensed under CC BY 4.0.', provider: 'flickr', source: 'flickr', tags: [{ name: title }], mature: false });
const px = (id = 1, tags = 'apple fruit') => ({ id, tags, pageURL: `https://pixabay.com/photos/apple-${id}/`, webformatURL: `https://pixabay.com/get/apple-${id}_640.jpg`, imageWidth: 900, imageHeight: 700 });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const mockProviders = (pixabay = [] as ReturnType<typeof px>[], openverse = [ov()]) => vi.fn(async (input: string | URL | Request) => {
  const url = new URL(String(input));
  return url.pathname.includes('auth_tokens') ? json({ access_token: token, token_type: 'Bearer', expires_in: 3600 }) : url.hostname === 'pixabay.com' ? json({ hits: pixabay }) : json({ results: openverse });
});
const callsFor = (fetcher: ReturnType<typeof vi.fn>, host: string) => fetcher.mock.calls.filter(([url]) => new URL(String(url)).hostname === host);
beforeEach(clearImageCache);
it.each([
  ['', 'gallery', '20'], [token, 'gallery', '32'], ['', 'thumbnail', '3'], [token, 'thumbnail', '3']
] as const)('respects Openverse page limits for token=%s mode=%s', (accessToken, mode, size) => {
  const request = openverseRequest({ wordId: 'apple', senseId: 'sense-0', query: 'apple', imageType: 'all' }, accessToken, mode);
  expect(new URL(request.url).searchParams.get('page_size')).toBe(size);
  expect(request.headers).toEqual(accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined);
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('secondary provider flow', () => {
  it('skips Openverse, including OAuth, when Pixabay has six strong gallery results', async () => {
    const fetcher = mockProviders(Array.from({ length: 6 }, (_, i) => px(i + 1)));
    const result = await getImages('苹果', 'sense-0', { pixabayKey: 'pixabay-fixture-key', ...credentials, fetcher });
    expect(fetcher).toHaveBeenCalledTimes(1); expect(result.images[0].provider).toBe('pixabay');
  });
  it('skips Openverse when one strong thumbnail is available', async () => {
    const fetcher = mockProviders([px()]);
    await getImages('苹果', 'sense-0', { pixabayKey: 'pixabay-fixture-key', fetcher, mode: 'thumbnail' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('uses anonymous Openverse after empty Pixabay and reuses gallery cache for thumbnails', async () => {
    const fetcher = mockProviders([], Array.from({ length: 6 }, (_, i) => ov(i + 1)));
    const options = { pixabayKey: 'pixabay-fixture-key', fetcher };
    const result = await getImages('苹果', 'sense-0', options);
    expect(result.images.filter(photo => photo.provider === 'openverse')).toHaveLength(6);
    const calls = callsFor(fetcher, 'api.openverse.org'); expect(calls).toHaveLength(1);
    expect(new URL(calls[0][0]).searchParams.get('q')).toBe('apple fruit');
    expect(calls[0][1].headers).toBeUndefined();
    await getImages('苹果', 'sense-0', options);
    expect((await getImages('苹果', 'sense-0', { ...options, mode: 'thumbnail' })).images).toHaveLength(1);
    expect(callsFor(fetcher, 'api.openverse.org')).toHaveLength(1);
  });
  it('supplements sparse Pixabay and ranks both providers together without padding with generic matches', async () => {
    const fetcher = mockProviders([px(1, 'apple')], [ov(2, 'apple fruit'), ov(3, 'person portrait')]);
    const result = await getImages('苹果', 'sense-0', { pixabayKey: 'pixabay-fixture-key', fetcher });
    expect(result.images.slice(0, 2).map(photo => photo.provider)).toEqual(['openverse', 'pixabay']);
    expect(result.images.some(photo => photo.id === 'openverse-image-3')).toBe(false);
  });
  it('uses Openverse after primary filtering rejects every result', async () => {
    const fetcher = mockProviders([px(1, 'apple iphone technology')]);
    const result = await getImages('苹果', 'sense-0', { pixabayKey: 'pixabay-fixture-key', fetcher });
    expect(result.images[0].provider).toBe('openverse');
  });
  it('does not count generic concept illustrations as acceptable primary results', async () => {
    const fetcher = mockProviders(Array.from({ length: 6 }, (_, i) => px(i + 1, 'generic concept illustration')), [ov(99, 'government parliament politics')]);
    const result = await getImages('政治|政治|zheng4 zhi4', 'sense-0', { pixabayKey: 'pixabay-fixture-key', fetcher });
    expect(callsFor(fetcher, 'api.openverse.org').length).toBeGreaterThan(0);
    expect(result.images.map(photo => photo.id)).toEqual(['openverse-image-99']);
  });
  it('keeps curated and text fallbacks when neither provider has usable results', async () => {
    const fetcher = mockProviders([], []);
    expect((await getImages('苹果', 'sense-0', { fetcher })).status).toBe('curated');
    expect((await getImages('银行', 'sense-0', { fetcher })).status).toBe('unavailable');
  });
  it('handles unavailable Pixabay while Openverse serves results', async () => {
    const fetcher = mockProviders().mockImplementationOnce(async () => json({}, 503));
    expect((await getImages('苹果', 'sense-0', { pixabayKey: 'pixabay-fixture-key', fetcher })).images[0].provider).toBe('openverse');
  });
  it('reserves secondary search time when slow primary queries consume their budget', async () => {
    vi.useFakeTimers(); const start = Date.now();
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      if (url.hostname === 'pixabay.com') {
        vi.advanceTimersByTime(fetcher.mock.calls.length === 1 ? 3500 : 1500);
        return json({ hits: [] });
      }
      expect(Date.now() - start).toBe(5000);
      return json({ results: Array.from({ length: 6 }, (_, i) => ov(i + 1)) });
    });
    expect((await getImages('苹果', 'sense-0', { pixabayKey: 'pixabay-fixture-key', fetcher })).images[0].provider).toBe('openverse');
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
  it('retains strong Pixabay images when Openverse fails', async () => {
    const fetcher = vi.fn(async (input: string | URL | Request) => new URL(String(input)).hostname === 'pixabay.com' ? json({ hits: [px()] }) : json({}, 503));
    expect((await getImages('苹果', 'sense-0', { pixabayKey: 'pixabay-fixture-key', fetcher })).images[0].provider).toBe('pixabay');
  });
  it('uses English queries and does not repeat Pixabay type/category variants on Openverse', async () => {
    const fetcher = mockProviders([], []);
    expect((await getImages('苹果', 'sense-0', { fetcher })).status).toBe('curated');
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls.every(([url]) => /^[a-z ]+$/.test(new URL(String(url)).searchParams.get('q')!))).toBe(true);
  });
  it('shares concurrent searches and separates provider and sense cache keys', async () => {
    const fetcher = mockProviders([], Array.from({ length: 6 }, (_, i) => ov(i + 1)));
    await Promise.all([getImages('苹果', 'sense-0', { ...credentials, fetcher }), getImages('苹果', 'sense-0', { ...credentials, fetcher })]);
    expect(fetcher).toHaveBeenCalledTimes(2);
    const word = byId.get('苹果')!; const search = imageSearchPlan(word, word.senses[0])!.primary;
    const keys = [providerCacheKey('openverse', search), providerCacheKey('pixabay', search), providerCacheKey('openverse', { ...search, senseId: 'sense-1' }), providerCacheKey('openverse', { ...search, query: 'pear fruit' })];
    expect(new Set(keys).size).toBe(4);
  });
});

describe('server OAuth', () => {
  it('posts form credentials once, sends only a bearer token on searches and never exposes either', async () => {
    const fetcher = mockProviders([], Array.from({ length: 6 }, (_, i) => ov(i + 1)));
    const result = await getImages('苹果', 'sense-0', { ...credentials, fetcher });
    const init = (fetcher.mock.calls as unknown[][])[0][1] as RequestInit;
    expect(init.method).toBe('POST'); expect(init.redirect).toBe('error');
    expect(Object.fromEntries(init.body as URLSearchParams)).toEqual({ grant_type: 'client_credentials', client_id: credentials.openverseClientId, client_secret: credentials.openverseClientSecret });
    expect((fetcher.mock.calls as unknown[][])[1][1]).toMatchObject({ headers: { Authorization: `Bearer ${token}` } });
    await getImages('猫', 'sense-0', { ...credentials, fetcher, mode: 'thumbnail' });
    expect(fetcher.mock.calls.filter(([url]) => String(url).includes('auth_tokens'))).toHaveLength(1);
    for (const secret of [...Object.values(credentials), token]) expect(JSON.stringify(result)).not.toContain(secret);
  });
  it('deduplicates token acquisition and reacquires after expiry, with clock skew allowance', async () => {
    vi.useFakeTimers(); const fetcher = mockProviders();
    expect(await Promise.all([openverseToken(credentials, fetcher, Date.now() + 8000), openverseToken(credentials, fetcher, Date.now() + 8000)])).toEqual([token, token]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(3_570_000);
    expect(await openverseToken(credentials, fetcher, Date.now() + 8000)).toBe(token);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('isolates changed credentials and authenticates a newly configured client', async () => {
    const fetcher = mockProviders();
    await openverseToken(credentials, fetcher, Date.now() + 8000);
    await openverseToken({ ...credentials, openverseClientSecret: 'rotated-secret' }, fetcher, Date.now() + 8000);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it.each(['missing', 'partial', 'http', 'network', 'malformed', 'timeout'])('uses anonymous search after %s credentials/token failure', async kind => {
    const fetcher = mockProviders([], Array.from({ length: 6 }, (_, i) => ov(i + 1)));
    if (kind === 'http') fetcher.mockImplementationOnce(async () => json({}, 401));
    if (kind === 'network' || kind === 'timeout') fetcher.mockRejectedValueOnce(new DOMException('private failure', kind === 'timeout' ? 'TimeoutError' : 'NetworkError'));
    if (kind === 'malformed') fetcher.mockImplementationOnce(async () => json({ access_token: token, expires_in: -1 }));
    const auth = kind === 'missing' ? {} : kind === 'partial' ? { openverseClientId: credentials.openverseClientId } : credentials;
    const result = await getImages('苹果', 'sense-0', { ...auth, fetcher });
    expect(result.images[0].provider).toBe('openverse');
    expect((fetcher.mock.calls as unknown[][]).at(-1)?.[1]).toMatchObject({ headers: undefined });
    expect(new URL(String(fetcher.mock.calls.at(-1)![0])).searchParams.get('page_size')).toBe('20');
    await getImages('猫', 'sense-0', { ...auth, fetcher, mode: 'thumbnail' });
    expect(fetcher.mock.calls.filter(([url]) => String(url).includes('auth_tokens')).length).toBeLessThanOrEqual(1);
  });
  it('invalidates rejected tokens and retries search anonymously only once', async () => {
    const fetcher = mockProviders([], Array.from({ length: 6 }, (_, i) => ov(i + 1)));
    fetcher.mockImplementationOnce(async () => json({ access_token: token, token_type: 'Bearer', expires_in: 3600 })).mockImplementationOnce(async () => json({}, 401));
    const result = await getImages('苹果', 'sense-0', { ...credentials, fetcher });
    expect(result.images[0].provider).toBe('openverse'); expect(fetcher).toHaveBeenCalledTimes(3);
    expect((fetcher.mock.calls as unknown[][])[2][1]).toMatchObject({ headers: undefined });
    expect(fetcher.mock.calls.slice(1, 3).map(([url]) => new URL(String(url)).searchParams.get('page_size'))).toEqual(['32', '20']);
    await getImages('猫', 'sense-0', { ...credentials, fetcher, mode: 'thumbnail' });
    expect(fetcher.mock.calls.filter(([url]) => String(url).includes('auth_tokens'))).toHaveLength(1);
  });
  it.each([...Object.values(credentials), token])('rejects an upstream credential echo: %s', async secret => {
    const fetcher = mockProviders([], [{ ...ov(), creator: secret }]);
    const result = await getImages('苹果', 'sense-0', { ...credentials, fetcher });
    expect(result.status).toBe('curated'); expect(JSON.stringify(result)).not.toContain(secret);
  });
});

describe('normalization, relevance and failures', () => {
  it('preserves licensing, creator, title, origin and source, without trusting raw HTML', () => {
    const photo = normalizeOpenverse([ov()], 'apple fruit')[0];
    expect(photo).toMatchObject({ provider: 'openverse', title: 'apple fruit', photographer: 'Test Creator', source: 'Openverse', originalProvider: 'flickr', originalSource: 'flickr', license: 'by', licenseVersion: '4.0', licenseUrl: ov().license_url, attribution: ov().attribution, sourceUrl: ov().foreign_landing_url });
  });
  it('rejects malformed, unsafe, unlicensed, mature, tiny and wrong-subject results; tolerates absent optional metadata', () => {
    const result = normalizeOpenverse([null, {}, ov(), { ...ov(2), thumbnail: null, creator: null, tags: null }, { ...ov(3), mature: true }, { ...ov(4), url: 'javascript:alert(1)' }, { ...ov(5), width: 50 }, { ...ov(6), license: null }, { ...ov(7), license_url: null }, { ...ov(8), title: 'Apple iPhone', tags: [] }], 'apple fruit');
    expect(result.map(photo => photo.id)).toEqual(['openverse-image-1', 'openverse-image-2']);
    expect(result[1].thumbnailUrl).toBe(result[1].largeUrl);
    expect(isImageUrl(ov().url)).toBe(false); expect(isPublicHttpsUrl(ov().url)).toBe(true);
    for (const url of ['https://localhost/a', 'https://127.0.0.1/a', 'https://[::1]/a', 'https://user:secret@example.com/a', 'https://example.com:444/a', 'http://example.com/a']) expect(isPublicHttpsUrl(url)).toBe(false);
  });
  it('deduplicates cross-provider image URLs, resized variants and canonical source pages', () => {
    const first = normalizePixabay([px()], 'apple fruit')[0];
    const duplicateUrl = normalizeOpenverse([{ ...ov(), url: first.largeUrl }], 'apple fruit')[0];
    const duplicatePage = normalizeOpenverse([{ ...ov(2), foreign_landing_url: first.sourceUrl + '?ref=openverse' }], 'apple fruit')[0];
    expect(deduplicateImages([first, duplicateUrl, duplicatePage, ...normalizeOpenverse([ov(3)], 'apple fruit')])).toHaveLength(2);
    const distinctPages = normalizeOpenverse([{ ...ov(4), foreign_landing_url: 'https://museum.example.com/item?id=4' }, { ...ov(5), foreign_landing_url: 'https://museum.example.com/item?id=5' }], 'apple fruit');
    expect(distinctPages).toHaveLength(2);
  });
  it.each(['apple', 'to whisper', 'to be frightened', 'heavy', 'to be frightened stiff (idiom)'])('passes %s through the existing semantic plan and reranker', meaning => {
    const word = fromRow(['測試', '测试', 'ce4 shi4', [meaning]]); const plan = imageSearchPlan(word, word.senses[0])!;
    const strong = plan.relevance.exact.join(' ');
    const candidates = normalizeOpenverse([ov(1, 'person portrait'), ov(2, strong)], plan.primary.query);
    const ranked = rankImageCandidates(candidates, plan);
    expect(ranked[0].id).toBe('openverse-image-2'); expect(imageRelevance(ranked[0], plan).semantic).toBe(true);
    if (plan.relevance.emotion || plan.relevance.idiom) expect(ranked).toHaveLength(1);
  });
  it('never treats a generated alt/query as semantic evidence', () => {
    const word = byId.get('苹果')!; const plan = imageSearchPlan(word, word.senses[0])!;
    const photo = normalizeOpenverse([{ ...ov(), title: null, tags: [] }], plan.primary.query)[0];
    expect(photo.alt).toBe(plan.primary.query); expect(imageRelevance(photo, plan).semantic).toBe(false);
  });
  it('always excludes mature results and uses the supported license subset', () => {
    const word = byId.get('苹果')!; const request = openverseRequest(imageSearchPlan(word, word.senses[0])!.primary, '', 'thumbnail');
    expect(Object.fromEntries(new URL(request.url).searchParams)).toMatchObject({ mature: 'false', license: 'by,by-sa,cc0,pdm', page_size: '3' });
  });
  it.each(['timeout', 'network', 'malformed', 'invalid-json', '429', '503'])('keeps dictionary usable after Openverse %s and briefly caches failures', async kind => {
    const fetcher = vi.fn(async () => {
      if (kind === 'timeout') throw new DOMException('private upstream URL', 'TimeoutError');
      if (kind === 'network') throw new Error('private upstream URL');
      if (kind === 'invalid-json') return new Response('bad json');
      return json({ results: {} }, /^\d+$/.test(kind) ? Number(kind) : 200);
    });
    expect((await getImages('苹果', 'sense-0', { fetcher })).status).toBe('curated');
    await getImages('苹果', 'sense-0', { fetcher }); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('uses provider-wide rate-limit cooldown across words', async () => {
    const fetcher = vi.fn(async () => new Response('', { status: 429, headers: { 'Retry-After': '120' } }));
    await getImages('苹果', 'sense-0', { fetcher }); await getImages('猫', 'sense-0', { fetcher });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('aborts a stalled Openverse request and returns curated images', async () => {
    vi.spyOn(AbortSignal, 'timeout').mockImplementation(() => {
      const controller = new AbortController(); setTimeout(() => controller.abort(), 5); return controller.signal;
    });
    const fetcher = vi.fn((_input: string | URL | Request, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init!.signal!.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));
    expect((await getImages('苹果', 'sense-0', { fetcher })).status).toBe('curated');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
