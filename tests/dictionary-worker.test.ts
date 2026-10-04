// @vitest-environment node
import { readFileSync } from 'node:fs';
import { afterEach, expect, it, vi } from 'vitest';
import { fromRow, refreshWordVisuals, type RawRow } from '../src/lib/dictionary-entry';
import type { Word } from '../src/types';

const lexicon = readFileSync('src/data/visual-lexicon.json', 'utf8');
const rows: RawRow[] = [['長頸鹿', '长颈鹿', 'chang2 jing3 lu4', ['giraffe']], ['政治', '政治', 'zheng4 zhi4', ['politics']]];
afterEach(() => vi.unstubAllGlobals());
async function start(fetcher: ReturnType<typeof vi.fn>) {
  vi.resetModules();
  const scope = { onmessage: undefined as unknown as (event: { data: unknown }) => Promise<void>, postMessage: vi.fn() };
  vi.stubGlobal('self', scope); vi.stubGlobal('fetch', fetcher);
  await import('../src/lib/dictionary.worker');
  const send = (data: unknown) => scope.onmessage({ data });
  await send({ type: 'init', words: [] });
  return { send, responses: scope.postMessage };
}

it('defers data until needed and shares one semantic request across concurrent searches and refreshes', async () => {
  let release!: (response: Response) => void;
  const pending = new Promise<Response>(resolve => { release = resolve; });
  const fetcher = vi.fn((url: string) => url === '/data/cedict.json' ? Promise.resolve(new Response(JSON.stringify(rows))) : pending);
  const { send, responses } = await start(fetcher);
  expect(fetcher).not.toHaveBeenCalled();
  const saved = { ...fromRow(rows[1]), note: 'Keep my content', senses: [{ ...fromRow(rows[1]).senses[0], visualType: 'abstract', visualQuery: undefined }] } as Word;
  const tasks = [send({ type: 'search', query: '长颈鹿', id: 1 }), send({ type: 'search', query: '政治', id: 2 }), send({ type: 'refresh', words: [saved], id: 3 })];
  expect(fetcher).toHaveBeenCalledTimes(2);
  release(new Response(lexicon)); await Promise.all(tasks);
  expect(responses.mock.calls.find(([response]) => response.id === 3)?.[0].results).toEqual([refreshWordVisuals(saved)]);
  await send({ type: 'search', query: 'politics', id: 4 });
  await send({ type: 'refresh', words: [saved], id: 5 });
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(responses.mock.calls.every(([response]) => !response.error)).toBe(true);
});

it.each(['network', 'http', 'json'])('keeps saved content on %s failure and permits a semantic retry', async failure => {
  const fetcher = vi.fn().mockImplementationOnce(() => failure === 'network' ? Promise.reject(new Error('offline')) : Promise.resolve(new Response(failure === 'json' ? '{' : '', { status: failure === 'http' ? 503 : 200 }))).mockResolvedValue(new Response(lexicon));
  const { send, responses } = await start(fetcher);
  const saved = fromRow(rows[0]);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  await send({ type: 'refresh', words: [saved], id: 1 });
  expect(responses.mock.calls[0][0].results[0]).toMatchObject({ id: saved.id, simplified: saved.simplified, senses: [{ english: saved.senses[0].english }] });
  await send({ type: 'refresh', words: [saved], id: 2 });
  expect(responses.mock.calls[1][0].results).toEqual([refreshWordVisuals(saved)]);
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it('reports dictionary download failures and retries without reloading successful semantic data', async () => {
  let attempts = 0;
  const fetcher = vi.fn((url: string) => Promise.resolve(new Response(url === '/data/cedict.json' ? JSON.stringify(rows) : lexicon, { status: url === '/data/cedict.json' && ++attempts === 1 ? 503 : 200 })));
  const { send, responses } = await start(fetcher);
  await send({ type: 'search', query: '政治', id: 1 });
  expect(responses.mock.calls[0][0].error).toContain('try again');
  await send({ type: 'search', query: '政治', id: 2 });
  expect(responses.mock.calls[1][0].results[0].simplified).toBe('政治');
  expect(fetcher).toHaveBeenCalledTimes(3);
});
