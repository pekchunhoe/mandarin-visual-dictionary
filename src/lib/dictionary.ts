import type { Word } from '../types';
import { MalaySearchIndex } from './malay-search';
export function normalize(value: string): string {
  let key = value.trim().toLowerCase().replace(/u:/g, 'v');
  // Most English glosses and numeric pinyin are ASCII: Unicode decomposition
  // and accent removal cannot change them. Keep the full path for other text.
  if (/[^\x00-\x7f]/.test(key)) key = key.normalize('NFD').replace(/u\u0308/g, 'v').replace(/[\u0300-\u036f]/g, '');
  return key.replace(/([a-z])([1-5])/g, '$1').replace(/[\s'’\-]/g, '');
}
const vowels: Record<string, string> = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ' };
export function toneMarks(pinyin: string) {
  return pinyin.replace(/u:|v/g, 'ü').replace(/([a-zü]+)([1-5])/gi, (_, raw: string, num: string) => {
    const syllable = raw.toLowerCase(); const tone = Number(num);
    if (tone === 5) return raw;
    let at = syllable.search(/[ae]/);
    if (at < 0 && syllable.includes('ou')) at = syllable.indexOf('o');
    if (at < 0) for (let i = syllable.length - 1; i >= 0; i--) if (vowels[syllable[i]]) { at = i; break; }
    if (at < 0) return raw;
    const letter = vowels[syllable[at]][tone - 1];
    return raw.slice(0, at) + (raw[at] === raw[at].toUpperCase() ? letter.toUpperCase() : letter) + raw.slice(at + 1);
  });
}
export function displayMeaning(english: string) { return english.replace(/\s*\(CL:[^)]*\)/g, '').trim(); }
export class DictionaryIndex {
  words: Word[]; private exact = new Map<string, number | number[]>(); private searchable: string[][]; private malay: MalaySearchIndex;
  private sortedKeys: string[];
  private trigrams = new Map<string, number>();
  private gramRanges: Uint32Array;
  private gramPostings: Uint32Array;
  constructor(words: Word[], malayWords: Word[] = words) {
    this.words = words;
    this.malay = new MalaySearchIndex(malayWords);
    const postings = new Map<string, number[]>();
    this.searchable = words.map((word, order) => {
      // Deduplicate raw strings before normalization (most definitions have no
      // separators), then deduplicate normalized keys as before. Singleton
      // postings need no array and repeated keys append without copying lists.
      const raw = new Set([word.simplified, word.traditional, word.pinyin, word.numericPinyin, ...word.senses.flatMap(s => [s.english, ...s.english.split(/[;,]/)])]);
      const keys = [...new Set([...raw].map(normalize).filter(Boolean))];
      for (const key of keys) {
        const prior = this.exact.get(key);
        if (prior === undefined) this.exact.set(key, order);
        else if (typeof prior === 'number') this.exact.set(key, [prior, order]);
        else prior.push(order);
      }
      const grams = new Set<string>();
      for (const key of keys) for (let i = 0; i < key.length - 2; i++) grams.add(key.slice(i, i + 3));
      for (const gram of grams) { const list = postings.get(gram) ?? []; list.push(order); postings.set(gram, list); }
      return keys;
    });
    this.sortedKeys = [...this.exact.keys()].sort();
    this.gramRanges = new Uint32Array(postings.size * 2);
    this.gramPostings = new Uint32Array([...postings.values()].reduce((n, list) => n + list.length, 0));
    let at = 0, gramIndex = 0;
    for (const [gram, list] of postings) {
      this.trigrams.set(gram, gramIndex);
      this.gramRanges[gramIndex * 2] = at; this.gramRanges[gramIndex * 2 + 1] = list.length;
      this.gramPostings.set(list, at); at += list.length; gramIndex++;
      postings.delete(gram);
    }
  }
  search(query: string, limit = 24): Word[] {
    const key = normalize(query); if (!key) return [];
    const orders = (value: number | number[] | undefined) => value === undefined ? [] : typeof value === 'number' ? [value] : value;
    const matches = new Map(orders(this.exact.get(key)).map(i => [this.words[i].id, this.words[i]]));
    const exactIds = new Set(matches.keys());
    const malay = this.malay.search(query, limit);
    if (matches.size < limit) {
      let lo = 0, hi = this.sortedKeys.length;
      while (lo < hi) { const mid = (lo + hi) >>> 1; if (this.sortedKeys[mid] < key) lo = mid + 1; else hi = mid; }
      const candidates = new Set<number>();
      for (let i = lo; i < this.sortedKeys.length && this.sortedKeys[i].startsWith(key); i++) for (const order of orders(this.exact.get(this.sortedKeys[i]))) candidates.add(order);
      for (const order of [...candidates].sort((a, b) => a - b)) { const word = this.words[order]; matches.set(word.id, word); if (matches.size >= limit) break; }
    }
    if (matches.size < limit && key.length > 2) {
      let start = 0, count = Infinity;
      for (let i = 0; i < key.length - 2; i++) {
        const gram = this.trigrams.get(key.slice(i, i + 3));
        const size = gram === undefined ? 0 : this.gramRanges[gram * 2 + 1];
        if (size < count) { count = size; start = gram === undefined ? 0 : this.gramRanges[gram * 2]; }
      }
      for (let i = start; i < start + count; i++) {
        const order = this.gramPostings[i];
        const word = this.words[order], keys = this.searchable[order];
        if (keys.some(k => k.includes(key))) matches.set(word.id, word);
        if (matches.size >= limit) break;
      }
    }
    const exact = [...matches.values()].filter(w => exactIds.has(w.id));
    const partial = [...matches.values()].filter(w => !exactIds.has(w.id));
    // An ambiguous Latin input can be exact in both languages. Reserve space
    // for Malay matches while retaining the relative legacy result order.
    const legacySlots = Math.max(1, limit - Math.min(malay.length, Math.ceil(limit / 2)));
    const legacy = [...exact, ...partial];
    const ranked = this.malay.hasExact(query) ? [...exact.slice(0, legacySlots), ...malay, ...exact.slice(legacySlots), ...partial] : [...legacy.slice(0, legacySlots), ...malay, ...legacy.slice(legacySlots)];
    const unique = new Map<string, Word>();
    for (const word of ranked) if (!unique.has(word.dictionaryId ?? word.id)) unique.set(word.dictionaryId ?? word.id, word);
    return [...unique.values()].slice(0, limit);
  }
}
