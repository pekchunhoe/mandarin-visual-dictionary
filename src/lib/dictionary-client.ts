import type { Word } from '../types';
import { words } from '../data/learning';
export type DictionaryRequest = { type: 'search'; query: string } | { type: 'entry'; entryId: string; senseId?: string } | { type: 'refresh'; words: Word[] };
let worker: Worker | undefined; let sequence = 0;
const requests = new Map<number, { resolve: (words: Word[]) => void; reject: (error: Error) => void; onPartial?: (words: Word[]) => void }>();
export function requestDictionary(request: DictionaryRequest, signal?: AbortSignal, onPartial?: (words: Word[]) => void): Promise<Word[]> {
  if (signal?.aborted) return Promise.reject(new DOMException('Cancelled', 'AbortError'));
  if (!worker) {
    worker = new Worker(new URL('./dictionary.worker.ts', import.meta.url), { type: 'module' });
    // Reuse the already loaded starter collection instead of bundling it twice.
    worker.postMessage({ type: 'init', words });
    worker.onmessage = ({ data }) => {
      const pending = requests.get(data.id); if (!pending) return;
      if (data.partial) { pending.onPartial?.(data.results); return; }
      requests.delete(data.id);
      if (data.error) pending.reject(new Error(data.error)); else pending.resolve(data.results);
    };
    worker.onerror = () => {
      for (const pending of requests.values()) pending.reject(new Error('Dictionary failed to load. Please retry.'));
      requests.clear(); worker?.terminate(); worker = undefined;
    };
  }
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const abort = () => { requests.delete(id); reject(new DOMException('Cancelled', 'AbortError')); };
    signal?.addEventListener('abort', abort, { once: true });
    requests.set(id, {
      onPartial,
      resolve: words => { signal?.removeEventListener('abort', abort); resolve(words); },
      reject: error => { signal?.removeEventListener('abort', abort); reject(error); }
    });
    worker!.postMessage({ ...request, id });
  });
}
export function refreshSavedWords(words: Word[], signal?: AbortSignal) {
  return words.length ? requestDictionary({ type: 'refresh', words }, signal) : Promise.resolve(words);
}
