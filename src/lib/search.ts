import { words } from '../data/learning';
import { DictionaryIndex, normalize } from './dictionary';
import type { Word } from '../types';
export const coreIndex = new DictionaryIndex(words);
let worker: Worker | undefined; let sequence = 0;
const requests = new Map<number, { resolve: (words: Word[]) => void; reject: (error: Error) => void }>();
const results = new Map<string, Word[]>();
export async function searchDictionary(query: string, signal?: AbortSignal): Promise<Word[]> {
  const key = normalize(query); if (!key) return [];
  const core = coreIndex.search(query);
  if (core.some(w => [w.simplified, w.traditional, w.pinyin, w.numericPinyin, ...w.senses.flatMap(s => [s.english, s.malay ?? ''])].some(v => normalize(v) === key))) return core;
  if (results.has(key)) return results.get(key)!;
  if (!worker) {
    worker = new Worker(new URL('./dictionary.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => { const request = requests.get(data.id); if (!request) return; requests.delete(data.id); if (data.error) request.reject(new Error(data.error)); else request.resolve(data.results); };
    worker.onerror = () => { for (const request of requests.values()) request.reject(new Error('Dictionary failed to load. Please retry.')); requests.clear(); worker?.terminate(); worker = undefined; };
  }
  const id = ++sequence;
  const found = await new Promise<Word[]>((resolve, reject) => {
    const abort = () => { requests.delete(id); reject(new DOMException('Cancelled', 'AbortError')); };
    if (signal?.aborted) return abort();
    signal?.addEventListener('abort', abort, { once: true });
    requests.set(id, { resolve: data => { signal?.removeEventListener('abort', abort); resolve(data); }, reject: error => { signal?.removeEventListener('abort', abort); reject(error); } });
    worker!.postMessage({ query, id });
  });
  results.set(key, found); if (results.size > 100) results.delete(results.keys().next().value!); return found;
}
