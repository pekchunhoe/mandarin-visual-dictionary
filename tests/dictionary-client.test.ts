// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
import { byId } from '../src/data/learning';
afterEach(() => vi.unstubAllGlobals());
it('delivers partial results without resolving or caching them as final, and ignores aborted worker updates', async () => {
  vi.resetModules();
  let instance!: { onmessage: (event: { data: unknown }) => void; postMessage: ReturnType<typeof vi.fn> };
  vi.stubGlobal('Worker', class { onmessage!: (event: { data: unknown }) => void; onerror?: () => void; postMessage = vi.fn(); constructor() { instance = this; } terminate() {} });
  const { requestDictionary } = await import('../src/lib/dictionary-client');
  const partial = vi.fn(), words = [byId.get('猫')!]; let complete = false;
  const controller = new AbortController();
  const pending = requestDictionary({ type: 'search', query: '猫' }, controller.signal, partial).then(result => { complete = true; return result; });
  const id = instance.postMessage.mock.calls.at(-1)![0].id;
  instance.onmessage({ data: { id, partial: true, results: words } }); await Promise.resolve();
  expect(partial).toHaveBeenCalledWith(words); expect(complete).toBe(false);
  instance.onmessage({ data: { id, results: words } }); expect(await pending).toEqual(words);
  const cancelled = new AbortController(), obsolete = vi.fn();
  const rejected = requestDictionary({ type: 'search', query: '狗' }, cancelled.signal, obsolete);
  const oldId = instance.postMessage.mock.calls.at(-1)![0].id; cancelled.abort();
  instance.onmessage({ data: { id: oldId, partial: true, results: words } });
  instance.onmessage({ data: { id: oldId, results: words } });
  await expect(rejected).rejects.toMatchObject({ name: 'AbortError' }); expect(obsolete).not.toHaveBeenCalled();
});
