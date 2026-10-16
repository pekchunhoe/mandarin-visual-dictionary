import type { MalayTranslation, Word } from '../types';

// Keep word boundaries: "rendah hati" must not collide with "rendahhati".
export function normalizeMalay(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase('ms-MY').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}
export interface MalayRecord extends MalayTranslation { entryId: string; senseId: string; english: string; key: string; malay: string }
export interface MalayAsset { schema: 1; version: string; corpusSha256: string; records: MalayRecord[] }
type Posting = { word: Word; senseId: string; rank: number; confidence: number; familiar: boolean };
function grams(value: string) { return [...new Set(Array.from({ length: Math.max(0, value.length - 2) }, (_, i) => value.slice(i, i + 3)))]; }
function near(a: string, b: string) {
  // One edit, including adjacent transposition; only considered after indexed matches.
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const diffs = [...a].flatMap((c, i) => c !== b[i] ? [i] : []);
    return diffs.length === 1 || diffs.length === 2 && diffs[1] === diffs[0] + 1 && a[diffs[0]] === b[diffs[1]] && a[diffs[1]] === b[diffs[0]];
  }
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  let i = 0; while (i < short.length && short[i] === long[i]) i++;
  return short.slice(i) === long.slice(i + 1);
}
export class MalaySearchIndex {
  private exact = new Map<string, Posting[]>();
  private tokens = new Map<string, Set<string>>();
  private trigrams = new Map<string, Set<string>>();
  private keys: string[];
  constructor(words: Word[]) {
    const normalized = new Map<string, string>();
    const normalizeOnce = (term: string) => {
      let key = normalized.get(term);
      if (key === undefined) { key = normalizeMalay(term); normalized.set(term, key); }
      return key;
    };
    for (const word of words) for (const sense of word.senses) {
      if (!sense.malay?.trim()) continue;
      const phrases = sense.malay.split(/[;,]/).map(normalizeMalay).filter(Boolean);
      const lexical = sense.malayLexical?.text.split(/[/;,]/).map(t => t.trim()).filter(Boolean) ?? [];
      const groups = [[...lexical, ...sense.malaySearchTerms ?? phrases], [sense.malay, ...phrases, ...sense.malayDefinition?.text ? [sense.malayDefinition.text] : []], sense.malaySynonyms ?? [], sense.malayMorphology ?? []];
      groups.forEach((terms, rank) => { for (const term of terms) {
        const key = normalizeOnce(term); if (!key) continue;
        const postings = this.exact.get(key) ?? [];
        if (!postings.some(p => p.word.id === word.id && p.senseId === sense.id && p.rank <= rank)) postings.push({ word, senseId: sense.id, rank, confidence: sense.translationConfidence ?? 0.5, familiar: !!word.category || sense.translationSource === 'KANJIAN existing editorial learning collection' });
        this.exact.set(key, postings);
      } });
    }
    this.keys = [...this.exact.keys()].sort();
    for (const key of this.keys) {
      for (const token of new Set(key.split(' '))) { const keys = this.tokens.get(token) ?? new Set(); keys.add(key); this.tokens.set(token, keys); }
      for (const gram of grams(key)) { const keys = this.trigrams.get(gram) ?? new Set(); keys.add(key); this.trigrams.set(gram, keys); }
    }
  }
  statistics() {
    const snapshot = { equivalents: [...this.exact].map(([term, posts]) => [term, posts.map(p => [p.word.dictionaryId ?? p.word.id, p.senseId, p.rank])]), tokens: [...this.tokens].map(([token, terms]) => [token, [...terms]]), trigrams: [...this.trigrams].map(([gram, terms]) => [gram, [...terms]]) };
    return { vocabularyTerms: this.keys.length, tokenKeys: this.tokens.size, trigramKeys: this.trigrams.size, postings: [...this.exact.values()].reduce((n, p) => n + p.length, 0), serializedBytes: new TextEncoder().encode(JSON.stringify(snapshot)).length };
  }
  hasExact(query: string) { return this.exact.has(normalizeMalay(query)); }
  search(query: string, limit = 24): Word[] {
    const key = normalizeMalay(query); if (!key) return [];
    const hits = new Map<string, Posting>();
    const add = (term: string, fallback?: number) => {
      for (const posting of this.exact.get(term) ?? []) {
        const hit = { ...posting, rank: fallback ?? posting.rank };
        const identity = hit.word.dictionaryId ?? hit.word.id;
        const old = hits.get(identity);
        if (!old || hit.rank < old.rank || hit.rank === old.rank && hit.confidence > old.confidence) hits.set(identity, hit);
      }
    };
    add(key);
    // Intersect token postings for phrases; no headword or meaning scan.
    const tokenSets = key.split(' ').map(t => this.tokens.get(t));
    if (tokenSets.every(Boolean)) {
      const ordered = (tokenSets as Set<string>[]).sort((a, b) => a.size - b.size);
      for (const term of ordered[0]) if (ordered.every(s => s.has(term)) && term.includes(key) && term !== key) add(term, 4);
    }
    // Sorted vocabulary lower-bound prefix retrieval, including an indexed last token.
    const prefixTerms = new Set<string>();
    let lo = 0, hi = this.keys.length;
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (this.keys[mid] < key) lo = mid + 1; else hi = mid; }
    for (let i = lo; i < this.keys.length && this.keys[i].startsWith(key) && prefixTerms.size < 256; i++) prefixTerms.add(this.keys[i]);
    for (const term of prefixTerms) if (term !== key) add(term, 4);
    if (key.length >= 4 && hits.size < limit) {
      const candidates = new Map<string, number>();
      for (const gram of grams(key)) for (const term of this.trigrams.get(gram) ?? []) candidates.set(term, (candidates.get(term) ?? 0) + 1);
      for (const [term] of [...candidates].sort((a, b) => b[1] - a[1]).slice(0, 256)) {
        if (term.includes(key)) add(term, 4);
        else if (near(key, term)) add(term, 5);
      }
    }
    return [...hits.values()].sort((a, b) => a.rank - b.rank || b.confidence - a.confidence || Number(b.familiar) - Number(a.familiar) || a.word.simplified.length - b.word.simplified.length || a.word.id.localeCompare(b.word.id)).slice(0, limit)
      .map(hit => ({ ...hit.word, matchedSenseId: hit.senseId, matchedLanguage: 'malay' }));
  }
}

export function applyMalayRecords(words: Word[], asset: MalayAsset): Word[] {
  if (asset.schema !== 1 || !Array.isArray(asset.records)) throw new Error('Unsupported Malay dictionary schema');
  const records = new Map(asset.records.map(r => [`${r.entryId}\t${r.senseId}`, r]));
  const translatedEntries = new Set(asset.records.map(r => r.entryId));
  return words.map(word => {
    if (!translatedEntries.has(word.dictionaryId ?? word.id)) return word;
    let changed = false;
    const senses = word.senses.map(sense => {
    const record = records.get(`${word.dictionaryId ?? word.id}\t${sense.id}`);
    // A corpus edit can never attach an old translation to a different sense.
    if (!record || record.english !== sense.english || !record.malay?.trim()) return sense;
    if (sense.malay?.trim()) {
      // Starter/editorial meanings remain protected; add only missing supplements.
      const additions = { ...!sense.malayLexical && record.malayLexical ? { malayLexical: record.malayLexical } : {}, ...!sense.malayDefinition && record.malayDefinition ? { malayDefinition: record.malayDefinition } : {} };
      if (!Object.keys(additions).length) return sense;
      changed = true; return { ...sense, ...additions };
    }
    const { entryId: _entry, senseId: _sense, english: _english, key: _key, ...translation } = record;
    changed = true;
    return { ...sense, ...translation };
    });
    return changed ? { ...word, senses } : word;
  });
}
