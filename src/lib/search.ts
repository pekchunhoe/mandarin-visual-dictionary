import { words } from '../data/learning';
import { DictionaryIndex, normalize } from './dictionary';
import type { Word } from '../types';
import { requestDictionary } from './dictionary-client';
import { normalizeMalay } from './malay-search';
export const coreIndex = new DictionaryIndex(words);
const results = new Map<string, Word[]>();
export async function searchDictionary(query: string, signal?: AbortSignal, onPartial?: (words: Word[]) => void): Promise<Word[]> {
  const key = `${normalize(query)}|${normalizeMalay(query)}`; if (!query.trim()) return [];
  const core = coreIndex.search(query);
  if (core.some(w => [w.simplified, w.traditional, w.pinyin, w.numericPinyin, ...w.senses.map(s => s.english)].some(v => normalize(v) === normalize(query)))) return core;
  if (results.has(key)) return results.get(key)!;
  // Keep the starter collection responsive while the complete worker corpus
  // loads; the final result still includes corpus-wide Malay matches.
  if (core.length) onPartial?.(core);
  let found: Word[];
  try { found = await requestDictionary({ type: 'search', query }, signal, onPartial); }
  catch (error) { if (signal?.aborted || !core.length) throw error; return core; }
  results.set(key, found); if (results.size > 100) results.delete(results.keys().next().value!); return found;
}
