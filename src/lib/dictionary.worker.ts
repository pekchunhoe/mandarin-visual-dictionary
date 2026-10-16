import { DictionaryIndex } from './dictionary';
import type { Word } from '../types';
import { createDictionaryEntries, type RawRow } from './dictionary-entry-core';
import { createVisualInference } from './visual-inference-core';
import lexiconUrl from '../data/visual-lexicon.json?url';
import malayUrl from '../data/malay-runtime-packed.json?url';
import { decodeMalayAsset } from './malay-codec';
import { applyMalayRecords, type MalayAsset } from './malay-search';
import type { DictionaryRequest } from './dictionary-client';
let index: DictionaryIndex | undefined;
let words: Word[] = [];
let fullWords: Word[] = [];
let rowsByEntry = new Map<string, RawRow>();
let byEntry = new Map<string, Word>();
const visualCache = new Map<string, Word>();
let malayLoaded = false;
let loading: Promise<void> | undefined;
let semantic: Promise<ReturnType<typeof createDictionaryEntries>> | undefined;
let activeDictionary: ReturnType<typeof createDictionaryEntries> | undefined;
let translations: Promise<MalayAsset | undefined> | undefined;
const earlySearches = new Set<() => Promise<void>>();
function malayEntries() {
  return translations ??= fetch(malayUrl).then(async response => {
    if (!response.ok) throw new Error('Malay dictionary could not be downloaded.');
    const asset = decodeMalayAsset(await response.json());
    return asset;
  }).catch(() => { translations = undefined; return undefined; });
}
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
async function hydrate(word: Word): Promise<Word> {
  const dictionary = activeDictionary ?? await entries();
  const row = rowsByEntry.get(word.id);
  // Starter/saved editorial senses retain their established visual decisions.
  if (!row) return dictionary.refreshWordVisuals(word);
  let prepared = visualCache.get(word.id);
  if (!prepared) {
    const classified = dictionary.fromRow(row);
    prepared = { ...word, senses: word.senses.map(sense => {
      if (sense.visualOrigin === 'curated') return sense;
      const visual = classified.senses.find(s => s.id === sense.id)!;
      return { ...sense, visualType: visual.visualType, visualQuery: visual.visualQuery, visualSubject: visual.visualSubject, visualOrigin: visual.visualOrigin };
    }) };
    visualCache.set(word.id, prepared);
    if (visualCache.size > 200) visualCache.delete(visualCache.keys().next().value!);
  }
  return { ...prepared, matchedSenseId: word.matchedSenseId, matchedLanguage: word.matchedLanguage };
}
async function load() {
  if (index && malayLoaded) return;
  if (!loading) loading = (async () => {
    performance.mark('kanjian-dictionary-start');
    const malayTask = malayEntries();
    if (!fullWords.length) {
      const [response, visualDictionary] = await Promise.all([fetch('/data/cedict.json'), entries()]);
      activeDictionary = visualDictionary;
      if (!response.ok) throw new Error('Dictionary could not be downloaded.');
      const rows: RawRow[] = await response.json();
      // Index text first. Apply the unchanged raw-sense classifier only to
      // requested results, rather than all 198,245 senses before the first hit.
      const dictionary = createDictionaryEntries(() => null);
      const learningById = new Map(words.map(w => [w.dictionaryId ?? w.id, w]));
      fullWords = rows.map(row => {
        const word = dictionary.fromRow(row), learning = learningById.get(word.id);
        rowsByEntry.set(word.id, row);
        if (!learning) return word;
        return { ...word, photo: learning.photo, category: learning.category, related: learning.related, senses: word.senses.map(sense => {
          const editorial = learning.senses.find(s => s.english === sense.english);
          return editorial ? { ...editorial, id: sense.id } : sense;
        }) };
      });
    }
    const malay = await malayTask;
    const curated = new Set(words.map(w => w.dictionaryId));
    // Keep ALL corpus senses, including those hidden by the editorial starter
    // replacement. Canonical corpus identities remain available to Malay search.
    const translated = malay ? applyMalayRecords(fullWords, malay) : fullWords;
    fullWords = translated; malayLoaded = !!malay;
    visualCache.clear();
    byEntry = new Map([...words, ...translated].map(w => [w.id, w]));
    // Exact Han headwords already have complete senses, Malay and visuals.
    // Let React show those while the worker builds broader-language postings;
    // the eventual full ranked result still resolves the original request.
    await Promise.all([...earlySearches].map(publish => publish()));
    performance.mark('kanjian-index-start');
    index = new DictionaryIndex([...words, ...translated.filter(w => !curated.has(w.id))], [...translated, ...words]);
    performance.measure('kanjian-index-build', 'kanjian-index-start');
    performance.measure('kanjian-dictionary-ready', 'kanjian-dictionary-start');
  })().catch(error => { loading = undefined; throw error; });
  await loading; loading = undefined;
}
self.onmessage = async ({ data }: MessageEvent<(DictionaryRequest & { id: number }) | { type: 'init'; words: Word[] }>) => {
  if (data.type === 'init') { words = data.words; return; }
  try {
    if (data.type === 'refresh') {
      const dictionary = await entries();
      const refreshed = data.words.map(dictionary.refreshWordVisuals);
      // Refreshing saved words remains offline-safe and retains valuable glosses.
      const malay = await malayEntries();
      self.postMessage({ id: data.id, results: malay ? applyMalayRecords(refreshed, malay) : refreshed });
    } else {
      const publish = async () => {
        if (data.type !== 'search' || !/^\p{Script=Han}+$/u.test(data.query.trim())) return;
        const query = data.query.trim(), curated = new Set(words.map(word => word.dictionaryId));
        const exact = [...words.filter(word => word.simplified === query || word.traditional === query), ...fullWords.filter(word => !curated.has(word.id) && (word.simplified === query || word.traditional === query))].slice(0, 24);
        if (exact.length) self.postMessage({ id: data.id, partial: true, results: await Promise.all(exact.map(hydrate)) });
      };
      earlySearches.add(publish);
      try { await load(); } finally { earlySearches.delete(publish); }
      if (data.type === 'entry') {
        const word = byEntry.get(data.entryId);
        self.postMessage({ id: data.id, results: word ? [await hydrate({ ...word, matchedSenseId: data.senseId })] : [] });
      } else self.postMessage({ id: data.id, results: await Promise.all(index!.search(data.query).map(hydrate)) });
    }
  }
  catch { self.postMessage({ id: data.id, error: 'The full dictionary is unavailable. Check your connection and try again. The learning collection still works offline.' }); }
};
