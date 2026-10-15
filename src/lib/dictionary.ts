import type { Word } from '../types';
import { MalaySearchIndex } from './malay-search';
export function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/u:/g, 'v').normalize('NFD').replace(/u\u0308/g, 'v').replace(/[\u0300-\u036f]/g, '').replace(/([a-z])([1-5])/g, '$1').replace(/[\s'’\-]/g, '');
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
  words: Word[]; private exact = new Map<string, Word[]>(); private searchable: { word: Word; keys: string[] }[]; private malay: MalaySearchIndex;
  private sortedKeys: string[];
  private order = new Map<string, number>();
  private trigrams = new Map<string, number>();
  private gramRanges: Uint32Array;
  private gramPostings: Uint32Array;
  constructor(words: Word[], malayWords: Word[] = words) {
    this.words = words;
    this.malay = new MalaySearchIndex(malayWords);
    const postings = new Map<string, number[]>();
    this.searchable = words.map((word, order) => {
      this.order.set(word.id, order);
      const keys = [...new Set([word.simplified, word.traditional, word.pinyin, word.numericPinyin, ...word.senses.flatMap(s => [s.english, ...s.english.split(/[;,]/)])].map(normalize).filter(Boolean))];
      for (const key of keys) this.exact.set(key, [...(this.exact.get(key) ?? []), word]);
      const grams = new Set<string>();
      for (const key of keys) for (let i = 0; i < key.length - 2; i++) grams.add(key.slice(i, i + 3));
      for (const gram of grams) { const list = postings.get(gram) ?? []; list.push(order); postings.set(gram, list); }
      return { word, keys };
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
    const matches = new Map((this.exact.get(key) ?? []).map(w => [w.id, w]));
    const exactIds = new Set(matches.keys());
    const malay = this.malay.search(query, limit);
    if (matches.size < limit) {
      let lo = 0, hi = this.sortedKeys.length;
      while (lo < hi) { const mid = (lo + hi) >>> 1; if (this.sortedKeys[mid] < key) lo = mid + 1; else hi = mid; }
      const candidates = new Set<number>();
      for (let i = lo; i < this.sortedKeys.length && this.sortedKeys[i].startsWith(key); i++) for (const word of this.exact.get(this.sortedKeys[i])!) candidates.add(this.order.get(word.id)!);
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
        const { word, keys } = this.searchable[order];
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
