import { words } from '../data/learning';
import { DictionaryIndex, normalize } from './dictionary';
import type { Word } from '../types';
import { requestDictionary } from './dictionary-client';
export const coreIndex = new DictionaryIndex(words);
const results = new Map<string, Word[]>();
export async function searchDictionary(query: string, signal?: AbortSignal): Promise<Word[]> {
  const key = normalize(query); if (!key) return [];
  const core = coreIndex.search(query);
  if (core.some(w => [w.simplified, w.traditional, w.pinyin, w.numericPinyin, ...w.senses.flatMap(s => [s.english, s.malay ?? ''])].some(v => normalize(v) === key))) return core;
  if (results.has(key)) return results.get(key)!;
  const found = await requestDictionary({ type: 'search', query }, signal);
  results.set(key, found); if (results.size > 100) results.delete(results.keys().next().value!); return found;
}
