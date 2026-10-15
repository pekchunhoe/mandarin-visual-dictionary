import { readFileSync } from 'node:fs';
import { alignLexicalSense, lexicalResources } from './lexical-alignment.mjs';
import { hash } from './corpus.mjs';
import { normalizeMalay } from '../../src/lib/malay-search.ts';

const termsText = readFileSync('scripts/data/malay-qualified-terms.tsv', 'utf8');
const idiomsText = readFileSync('scripts/data/malay-qualified-idioms.tsv', 'utf8');
function rows(text, width) {
  const values = text.split(/\r?\n/).filter(line => line && !line.startsWith('#')).map(line => line.split('\t'));
  if (values.some(row => row.length !== width || row.some(v => !v.trim()))) throw new Error('Invalid terminology row.');
  const keys = values.map(row => row.slice(0, width - 1).join('\t'));
  if (new Set(keys).size !== keys.length) throw new Error('Duplicate terminology key.');
  return values;
}
const terms = new Map(rows(termsText, 2));
const idioms = new Map(rows(idiomsText, 3).map(([chinese, english, malay]) => [`${chinese}\t${english}`, malay]));
// Sampled linguistic assessment exposed these broad resource alignments.
// Quarantine them instead of trusting a shared synset or a superficially valid verb.
const excluded = new Set(['to lean', 'to relieve', 'to decide', 'to sink', 'to flee', 'to assassinate', 'dagger', 'meat cleaver', 'to pay']);
const excludedSenses = new Set(['估价\tto value', '报答\tto repay', '回顾\tto review', '助长\tto foster', '公猪\tboar']);
let resources;
export const version = `qualified-ms-MY-1-${hash(termsText + idiomsText + readFileSync(new URL(import.meta.url), 'utf8') + readFileSync(new URL('./lexical-alignment.mjs', import.meta.url), 'utf8')).slice(0, 12)}`;
export const source = 'KANJIAN assistant-authored Malaysian Malay terms with exact Chinese/English WordNet concordance, or explicitly scoped idiom explanations; independent human review pending';
export const license = 'CC-BY-SA-4.0; MIT (Wordnet Bahasa); Chinese Open Wordnet license; Princeton WordNet 3.0 license';
export function qualify(sense) {
  const idiom = idioms.get(`${sense.simplified}\t${sense.english}`);
  if (idiom) return { record: { ...sense, malay: idiom, malaySearchTerms: [idiom], malaySynonyms: [], malayMorphology: [], idiomExplanation: true, translationModel: 'Assistant-authored exact-sense explanation', translationModelRevision: version, translationNotes: 'Figurative meaning and scope checked against this exact English sense; assistant assessment, NOT independent human verification.', translationConfidence: 0.8 } };
  const term = terms.get(sense.english);
  if (excluded.has(sense.english) || excludedSenses.has(`${sense.simplified}\t${sense.english}`)) return { reason: 'linguistic-assessment-rejected' };
  if (!term) return { reason: 'no-qualified-exact-sense-term' };
  resources ??= lexicalResources();
  const aligned = alignLexicalSense(sense, resources);
  if (!aligned.record) return aligned;
  const available = resources.malay.bySynset.get(aligned.synset) ?? [];
  if (!available.some(t => normalizeMalay(t) === normalizeMalay(term))) return { reason: 'qualified-term-not-in-concordant-synset' };
  return { record: { ...aligned.record, malay: term, malaySearchTerms: [term], malaySynonyms: [], translationModel: 'Qualified term + exact three-language synset concordance', translationModelRevision: resources.revision, translationNotes: `Unique synset ${aligned.synset}; independently authored term occurs in zsm and matches every English clause. Other unqualified WordNet synonyms excluded. Assistant linguistic assessment; NOT independent human verification.` } };
}
export async function translateBatch(senses) {
  const records = [], rejections = [];
  for (const sense of senses) { const result = qualify(sense); if (result.record) records.push(result.record); else rejections.push({ key: sense.key, reason: result.reason }); }
  return { records, rejections, usage: { costUsd: 0, inputTokens: 0, outputTokens: 0 } };
}
