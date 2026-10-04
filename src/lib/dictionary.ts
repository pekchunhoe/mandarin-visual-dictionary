import type { Word } from '../types';
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
  words: Word[]; private exact = new Map<string, Word[]>(); private searchable: { word: Word; keys: string[] }[];
  constructor(words: Word[]) {
    this.words = words;
    this.searchable = words.map(word => {
      const keys = [...new Set([word.simplified, word.traditional, word.pinyin, word.numericPinyin, ...word.senses.flatMap(s => [s.english, s.malay ?? '', ...s.english.split(/[;,]/)])].map(normalize).filter(Boolean))];
      for (const key of keys) this.exact.set(key, [...(this.exact.get(key) ?? []), word]);
      return { word, keys };
    });
  }
  search(query: string, limit = 24): Word[] {
    const key = normalize(query); if (!key) return [];
    const matches = new Map((this.exact.get(key) ?? []).map(w => [w.id, w]));
    if (matches.size < limit) for (const { word, keys } of this.searchable) {
      if (keys.some(k => k.startsWith(key))) matches.set(word.id, word);
      if (matches.size >= limit) break;
    }
    if (matches.size < limit && key.length > 2) for (const { word, keys } of this.searchable) {
      if (keys.some(k => k.includes(key))) matches.set(word.id, word);
      if (matches.size >= limit) break;
    }
    return [...matches.values()].slice(0, limit);
  }
}
