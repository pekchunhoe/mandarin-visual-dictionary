import { normalizeMalay } from '../../src/lib/malay-search.ts';
import { qualityIssues } from './quality.mjs';
import { lexicalResources } from './lexical-alignment.mjs';
import { normalizeSource, sources, indexRecords } from './bulk-dataset.mjs';
import { offlinePolicy, cleanModelText } from './offline-quality.mjs';
import { readFileSync } from 'node:fs';
import { referenceDefinition, REFERENCE_DEFINITION_VERSION } from './reference-definition.mjs';
const posMap = { n: 'noun', v: 'verb', a: 'adj', s: 'adj', r: 'adv' };
const clause = s => s.trim().replace(/^(?:to|a|an|the)\s+/i, '').replace(/\.$/, '').toLowerCase();
export async function deepResources() {
  const lexical = lexicalResources(), policy = offlinePolicy();
  const review = JSON.parse(readFileSync('scripts/data/malay-deep-review-policy.json'));
  for (const field of ['excludedSenseOutputs', 'excludedEnglishMalay', 'excludedTerms']) policy[field] = { ...policy[field], ...review[field] };
  const dictionaries = [];
  for (const source of sources) dictionaries.push(...(await normalizeSource(source)).records);
  return { lexical, policy, dictionaries: indexRecords(dictionaries), alignments: new Map() };
}
export function recoverAlignment(task, resources) {
  if (resources.alignments?.has(task.key)) return resources.alignments.get(task.key);
  const finish = r => { resources.alignments?.set(task.key, r); return r; };
  if (task.idiom || /\b(?:idiom|fig\.|lit\.|surname|variant|abbr\.|classifier)\b/i.test(task.english)) return finish({ reason: 'special-context' });
  const english = task.english.replace(/^\((?:bound form|literary|coll\.|formal|informal)\)\s*/i, '');
  if (/[()[\]|]/.test(english)) return finish({ reason: 'unresolved-qualifier' });
  const clauses = english.split(/[;/]/).map(clause);
  if (!clauses.length || clauses.some(c => !c || c.length > 100)) return finish({ reason: 'not-lexical' });
  const { lexical } = resources;
  let candidates;
  for (const c of clauses) {
    const found = lexical.english.byLemma.get(c);
    if (!found) return finish({ reason: 'no-exact-english-reference' });
    candidates = new Set([...(candidates ?? found)].filter(id => found.has(id) && (!/^to\s/.test(english) || id.endsWith('-v'))));
  }
  const chinese = lexical.chinese.byLemma.get(task.simplified) ?? lexical.chinese.byLemma.get(task.traditional);
  if (chinese) candidates = new Set([...candidates].filter(id => chinese.has(id)));
  if (candidates.size !== 1) return finish({ reason: candidates.size ? 'ambiguous-synset' : 'contradictory-chinese-english-reference' });
  const [synset] = candidates;
  return finish({ synset, clauses, pos: posMap[synset.at(-1)], method: chinese ? 'chinese-and-complete-english-concordance' : 'unique-complete-english-synset-no-chinese-reference' });
}
export function evidenceFor(task, text, resources) {
  const alignment = recoverAlignment(task, resources);
  if (!alignment.synset) return { issues: [alignment.reason] };
  const { synset, clauses, pos } = alignment, term = normalizeMalay(text);
  const p = resources.policy;
  if (p.excludedSynsets[synset] || p.excludedTerms[term] || p.excludedSenseOutputs?.[`${task.simplified}|${task.english.toLowerCase()}|${term}`]
    || p.excludedEnglishMalay[`${task.english.toLowerCase()}|${term}|${synset}`] || p.excludedEnglishMalay[`${task.english.toLowerCase()}|${term}`]) return { issues: ['known-scope-or-locale-conflict'] };
  const wordnet = (resources.lexical.malay.bySynset.get(synset) ?? []).some(t => normalizeMalay(t.replaceAll('_', ' ')) === term);
  const matches = clauses.map(c => (resources.dictionaries.get(c) ?? []).filter(r => r.pos === pos && normalizeMalay(r.malay) === term));
  const wiktionary = matches.every(group => group.length);
  // Both sources are required where Mandarin has no WordNet entry. A loanword
  // is scoped to its actual sense and POS, never admitted by spelling alone.
  if (!wordnet && !wiktionary || alignment.method.includes('no-chinese') && !(wordnet && wiktionary)) return { issues: ['insufficient-scoped-reference-evidence'] };
  if (normalizeMalay(task.english.replace(/^to\s+/i, '')) === term && !wiktionary) return { issues: ['loanword-needs-independent-malay-attestation'] };
  if (pos === 'verb' && !/^(?:me|ber|ter|memper)/.test(term) && !term.includes(' ') && !p.allowedBareVerbs.includes(term)) {
    // Wiktionary explicitly attests grammatical verb usage; an arbitrary noun
    // in a broad WordNet synset remains insufficient (racun != to poison).
    if (!wiktionary) return { issues: ['bare-verb-needs-verb-attestation'] };
  }
  return { alignment, wordnet, wiktionary, sources: wiktionary ? [...new Map(matches.flat().map(r => [JSON.stringify(r), r])).values()] : [] };
}
export function qualifyRecovered(task, output, model, resources) {
  if (output.key !== task.key || output.inferenceKey !== task.inferenceKey) return { issues: ['sense-misalignment'] };
  const definition = !task.idiom && referenceDefinition(task.english, output.text, task.input);
  if (definition) {
    const record = { key: task.key, entryId: task.entryId, senseId: task.senseId, english: task.english, malay: definition.malay,
      malaySearchTerms: [definition.malay], translationKind: 'definition-translation', translationStatus: 'generated', translationQuality: 'automated-review-required',
      translationSource: `${model.model}; local cached inference; exact original cross-reference and Malay definition-grammar validation`,
      translationLicense: `${model.license}; CC-BY-SA-4.0 corpus alignment and maintainer-authored normalization`, translationVersion: REFERENCE_DEFINITION_VERSION,
      translationModel: model.model, translationModelRevision: model.revision,
      translationNotes: 'Translation of the complete English dictionary cross-reference, not a lexical equivalent. The complete referenced Chinese spelling and numeric pinyin are unchanged. Malay grammar normalized. Where sourceInput uses an opaque placeholder, the citation was protected before local inference and restored literally afterward. Independent language review pending.',
      translationAlignment: { method: REFERENCE_DEFINITION_VERSION, referenceRule: definition.rule, preservedReference: definition.reference,
        sourceInput: task.input, inferenceKey: task.inferenceKey, originalInferenceKey: task.originalInferenceKey ?? task.inferenceKey, preprocessing: model.preprocessing,
        rawModelOutput: output.text, runtime: `CTranslate2 ${model.runtime}`, device: model.device ?? 'cpu', quantization: model.quantization, beamSize: model.beamSize }, idiomExplanation: false };
    const issues = [...output.issues.filter(i => !['unicode-or-target-script'].includes(i)), ...qualityIssues(record, task)];
    return issues.length ? { issues: [...new Set(issues)] } : { record };
  }
  const raw = cleanModelText(output.text), text = (/^to\s/i.test(task.english) ? raw.replace(/^untuk\s+/i, '') : raw).replace(/\.$/, '').trim();
  if (!/^[\p{Script=Latin}\p{M}\p{N} ,'’()-]+$/u.test(text) || !text || text.length > 120) return { issues: ['not-whole-lexical-output'] };
  const evidence = evidenceFor(task, text, resources);
  if (evidence.issues) return evidence;
  const issues = output.issues.filter(i => i !== 'english-copy');
  const record = { key: task.key, entryId: task.entryId, senseId: task.senseId, english: task.english, malay: text,
    malaySearchTerms: [text], translationKind: 'lexical-equivalent', translationStatus: 'generated', translationQuality: 'automated-review-required',
    translationSource: `${model.model}; local cached inference; scoped Wordnet Bahasa / Chinese Open Wordnet / Princeton WordNet / English Wiktionary evidence`,
    translationLicense: `${model.license}; MIT (Wordnet Bahasa); Chinese Open Wordnet license; Princeton WordNet 3.0 license; CC-BY-SA-4.0`,
    translationVersion: 'deep-scoped-recovery-v1', translationModel: model.model, translationModelRevision: model.revision,
    translationNotes: 'Recovered whole model output. Complete English/POS sense evidence; Mandarin concordance where available. Loanwords and bare verbs require scoped Malay Wiktionary attestation. Provisional, independent Malaysian Malay review pending.',
    translationAlignment: { ...evidence.alignment, wordnetAttested: evidence.wordnet, wiktionaryAttested: evidence.wiktionary, sources: evidence.sources,
      sourceInput: task.input, inferenceKey: task.inferenceKey, rawModelOutput: output.text, runtime: `CTranslate2 ${model.runtime}`, device: model.device ?? 'cpu', quantization: model.quantization, beamSize: model.beamSize }, idiomExplanation: false };
  if (normalizeMalay(text) === normalizeMalay(task.english)) record.sameTextJustification = `Exact Malay Wiktionary definition and ${evidence.alignment.pos}; aligned synset ${evidence.alignment.synset}.`;
  issues.push(...qualityIssues(record, task));
  return issues.length ? { issues: [...new Set(issues)] } : { record };
}
