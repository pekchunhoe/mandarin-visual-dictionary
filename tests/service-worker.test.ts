// @vitest-environment node
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it, vi } from 'vitest';

function worker() {
  const listeners = new Map<string, (event: unknown) => void>();
  const match = vi.fn().mockResolvedValue(new Response('cached'));
  const source = readFileSync('public/sw.js', 'utf8').replace('new Set([])', 'new Set(["/assets/index-AbCd1234.js"])');
  runInNewContext(source, {
    self: { addEventListener: (name: string, handler: (event: unknown) => void) => listeners.set(name, handler), location: { origin: 'https://example.test' } },
    caches: { open: async () => ({ match }) }, URL, Response
  });
  async function request(path: string, method = 'GET') {
    let response: Promise<Response> | undefined;
    listeners.get('fetch')!({ request: new Request(new URL(path, 'https://example.test'), { method }), respondWith: (value: Promise<Response>) => { response = value; } });
    await response;
    return response;
  }
  return { request, match };
}

it('relaxes Vary only for exact known immutable assets, preserving query and dynamic matching', async () => {
  const { request, match } = worker();
  for (const [path, ignoreVary] of [
    ['/assets/index-AbCd1234.js', true],
    ['/assets/index-AbCd1234.js?user=one', false],
    ['/assets/unlisted-AbCd1234.js', false],
    ['/assets/profile.json', false],
    ['/data/cedict.json', false]
  ] as const) {
    await request(path);
    expect(match.mock.lastCall?.[1]).toEqual({ ignoreVary });
    expect(match.mock.lastCall?.[0].url).toBe('https://example.test' + path);
  }
});

it('never intercepts API, external provider or non-GET requests', async () => {
  const { request, match } = worker();
  expect(await request('/api/images?word=politics')).toBeUndefined();
  expect(await request('https://pixabay.com/photos/example')).toBeUndefined();
  expect(await request('/assets/index-AbCd1234.js', 'POST')).toBeUndefined();
  expect(match).not.toHaveBeenCalled();
});
