// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import handler from '../server/image-handler';
import { clearImageCache } from '../server/images';
beforeEach(() => { clearImageCache(); vi.stubEnv('PIXABAY_API_KEY', ''); vi.stubEnv('PEXELS_API_KEY', ''); });
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
async function request(url: string, method = 'GET', ip = 'test') {
  let body = ''; const headers: Record<string, string> = {};
  const req = { url, method, headers: {}, socket: { remoteAddress: ip } } as IncomingMessage;
  const res = { statusCode: 200, setHeader: (k: string, v: string) => { headers[k] = v; }, end: (value: string) => { body = value; } } as unknown as ServerResponse;
  await handler(req, res); return { status: res.statusCode, headers, body: JSON.parse(body) };
}
describe('server API safeguards', () => {
  it('normalizes malformed request URLs', async () => expect((await request('http://[')).status).toBe(400));
  it('rejects unsupported methods', async () => expect((await request('/?word=苹果&sense=sense-0', 'POST')).status).toBe(405));
  it('rejects arbitrary image queries and URL proxies', async () => { expect((await request('/?q=anything')).status).toBe(400); expect((await request('/?word=苹果&sense=sense-0&url=https://example.com')).status).toBe(400); });
  it('validates sense and input length', async () => { expect((await request('/?word=苹果&sense=other')).status).toBe(400); expect((await request('/?word=' + 'a'.repeat(41) + '&sense=sense-0')).status).toBe(400); });
  it('allows only approved dictionary entries', async () => expect((await request('/?word=unknown&sense=sense-0')).status).toBe(400));
  it('returns useful fallback without leaking secrets', async () => { vi.stubEnv('PEXELS_API_KEY', ''); const result = await request('/?word=苹果&sense=sense-0'); expect(result.status).toBe(200); expect(result.body.images).toHaveLength(8); expect(result.body.status).toBe('curated'); vi.unstubAllEnvs(); });
  it('rate limits repeated calls', async () => { for (let i = 0; i < 30; i++) await request('/?word=因为&sense=sense-0', 'GET', 'limited-test-client'); const result = await request('/?word=因为&sense=sense-0', 'GET', 'limited-test-client'); expect(result.status).toBe(429); expect(result.headers['Retry-After']).toBe('60'); });
  it.each(['safesearch=false', 'key=client-key', 'image_type=all', 'category=anything', 'per_page=200', 'mode=anything', 'mode=thumbnail&mode=gallery', 'word=猫'])('rejects unapproved or duplicate client parameters: %s', async extra => {
    const fetcher = vi.spyOn(globalThis, 'fetch'); expect((await request('/?word=苹果&sense=sense-0&' + extra)).status).toBe(400); expect(fetcher).not.toHaveBeenCalled();
  });
  it('accepts thumbnail mode and returns exactly one bundled image', async () => {
    const result = await request('/?word=苹果&sense=sense-0&mode=thumbnail', 'GET', 'thumbnail-client'); expect(result.body.images).toHaveLength(1); expect(result.headers['Cache-Control']).toBe('no-store');
  });
  it('keeps the server Pixabay key out of responses and provider failures', async () => {
    vi.stubEnv('PIXABAY_API_KEY', 'private-key-not-for-browser');
    const fetcher = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('https://pixabay.com/api/?key=private-key-not-for-browser'));
    const result = await request('/?word=苹果&sense=sense-0', 'GET', 'secret-test-client'); expect(result.status).toBe(200); expect(JSON.stringify(result)).not.toContain('private-key-not-for-browser'); expect(new URL(String(fetcher.mock.calls[0][0])).searchParams.get('safesearch')).toBe('true');
  });
});
