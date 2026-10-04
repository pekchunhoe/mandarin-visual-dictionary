import { DictionaryIndex } from './dictionary';
import type { Word } from '../types';
import { canonicalWordId, createDictionaryEntries, type RawRow } from './dictionary-entry-core';
import { createVisualInference } from './visual-inference-core';
import lexiconUrl from '../data/visual-lexicon.json?url';
import type { DictionaryRequest } from './dictionary-client';
let index: DictionaryIndex | undefined;
let words: Word[] = [];
let loading: Promise<void> | undefined;
let semantic: Promise<ReturnType<typeof createDictionaryEntries>> | undefined;
function entries() {
  // One cached JSON asset, parsed only in the worker, never in React startup.
  return semantic ??= fetch(lexiconUrl).then(async response => {
    if (!response.ok) throw new Error('Visual dictionary could not be downloaded.');
    return createDictionaryEntries(createVisualInference(await response.json()).buildVisualQuery);
  }).catch(() => {
    semantic = undefined;
    // Preserve the existing optional-WordNet fallback; a semantic asset failure
    // must not block dictionary lookup, templates or function-word detection.
    return createDictionaryEntries(createVisualInference(null).buildVisualQuery);
  });
}
async function load() {
  if (index) return;
  if (!loading) loading = (async () => {
    const [response, dictionary] = await Promise.all([fetch('/data/cedict.json'), entries()]);
    if (!response.ok) throw new Error('Dictionary could not be downloaded.');
    const rows: RawRow[] = await response.json();
    const curated = new Set(words.map(w => w.dictionaryId));
    index = new DictionaryIndex([...words, ...rows.filter(r => !curated.has(canonicalWordId(r))).map(dictionary.fromRow)]);
  })().catch(error => { loading = undefined; throw error; });
  await loading;
}
self.onmessage = async ({ data }: MessageEvent<(DictionaryRequest & { id: number }) | { type: 'init'; words: Word[] }>) => {
  if (data.type === 'init') { words = data.words; return; }
  try {
    if (data.type === 'refresh') {
      const dictionary = await entries();
      self.postMessage({ id: data.id, results: data.words.map(dictionary.refreshWordVisuals) });
    } else {
      await load(); self.postMessage({ id: data.id, results: index!.search(data.query) });
    }
  }
  catch { self.postMessage({ id: data.id, error: 'The full dictionary is unavailable. Check your connection and try again. The learning collection still works offline.' }); }
};
