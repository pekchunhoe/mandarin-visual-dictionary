import { normalizeMalay } from '../../src/lib/malay-search.ts';
import { qualityIssues } from './quality.mjs';
import { readFileSync } from 'node:fs';
import { lexicalResources, malayTermsForSynset } from './lexical-alignment.mjs';
const surnameTemplate = JSON.parse(readFileSync('scripts/data/malay-offline-templates.json')).surname;

export const OFFLINE_POLICY = 'licensed-sense-concordance-v1';
export function offlinePolicy() {
  const base = JSON.parse(readFileSync('scripts/data/malay-bulk-review-policy.json'));
  const review = JSON.parse(readFileSync('scripts/data/malay-offline-review-policy.json'));
  const normalizedKeys = (object, termIndex) => Object.fromEntries(Object.entries(object).map(([key, reason]) => {
    const parts = key.split('|'); parts[termIndex] = normalizeMalay(parts[termIndex]); return [parts.join('|'), reason];
  }));
  return { ...base, excludedEnglishMalay: normalizedKeys({ ...base.excludedEnglishMalay, ...review.excludedEnglishMalay }, 1),
    excludedSenseOutputs: normalizedKeys(review.excludedSenseOutputs ?? {}, 2),
    excludedTerms: Object.fromEntries(Object.entries({ ...base.excludedTerms, ...review.excludedTerms }).map(([term, reason]) => [normalizeMalay(term), reason])),
    resources: lexicalResources(), referenceCache: new Map() };
}
export function cleanModelText(text) {
  return text.normalize('NFC').trim().replace(/^[•·]\s*/, '');
}
export function qualifyOffline(task, output, model, policy) {
  const issues = [...output.issues];
  if (output.key !== task.key || output.inferenceKey !== task.inferenceKey) issues.push('sense-misalignment');
  const text = cleanModelText(output.text);
  if (!/^[\p{Script=Latin}\p{M}\p{N} ,;:.'’()-]+$/u.test(text)) issues.push('non-lexical-symbols-or-script');
  if (/\p{Co}|\p{Cs}|<unk>|sitemap|bookingsuite|tel\/fax|artikel-nr|pilihan peminat|copyright|[✔←]/iu.test(text)) issues.push('corrupt-or-hallucinated');
  const surname = /^surname ([A-Za-z][A-Za-z '-]*)$/.exec(task.english);
  const annotationName = /^nama keluarga(?:\s*:\s*|\s+)([A-Za-z][A-Za-z '-]*)\.?$/i.exec(text)?.[1];
  if (surname && !task.idiom && surnameTemplate.malay === 'nama keluarga' && annotationName === surname[1]) {
    const record = { key: task.key, entryId: task.entryId, senseId: task.senseId, english: task.english, malay: text,
      malaySearchTerms: [text], translationKind: 'definition-translation', translationStatus: 'generated', translationQuality: 'automated-review-required',
      translationSource: `${model.model}; local ${model.device === 'cuda' ? 'GPU' : 'CPU'} inference; Wordnet Bahasa licensed surname annotation validation`,
      translationModel: model.model, translationModelRevision: model.revision, translationLicense: `${model.license}; MIT (Wordnet Bahasa); CC-BY-SA-4.0 corpus alignment`,
      translationVersion: 'licensed-definition-template-v1',
      translationNotes: 'Machine translation of the English surname annotation, not a Malay lexical equivalent of the Chinese name. The whole output matches licensed nama keluarga plus the unchanged Roman name. Independent human review pending.',
      translationAlignment: { method: 'surname-definition-template-v1', anchorSynset: surnameTemplate.synset, anchorRevision: surnameTemplate.revision,
        preservedProperName: surname[1], inferenceKey: task.inferenceKey, sourceInput: task.input, rawModelOutput: output.text, quantization: model.quantization,
        runtime: `CTranslate2 ${model.runtime}`, device: model.device ?? 'cpu', beamSize: output.beamSize ?? model.beamSize }, idiomExplanation: false };
    issues.push(...qualityIssues(record, task));
    return issues.length ? { issues: [...new Set(issues)] } : { record };
  }
  if (text.includes(':')) issues.push('unresolved-definition-structure');
  if (task.idiom || /\b(?:idiom|fig\.|lit\.|surname|variant|abbr\.|classifier)\b/i.test(task.english)) issues.push('special-sense-needs-context-review');
  let referenceTerms = task.referenceTerms;
  if (task.synset && policy.resources) {
    if (!policy.referenceCache.has(task.synset)) policy.referenceCache.set(task.synset, malayTermsForSynset(task.synset, policy.resources));
    referenceTerms = policy.referenceCache.get(task.synset);
  }
  if (!task.synset || !referenceTerms.length) issues.push('no-independent-sense-reference');
  if (policy.excludedSynsets[task.synset]) issues.push('known-synset-scope-conflict');
  const terms = text.split(/;/).map(t => t.trim()).filter(Boolean);
  const allowed = new Set(referenceTerms.map(normalizeMalay));
  for (const term of terms) {
    const equivalent = term.replace(/^untuk\s+/i, '');
    if (!allowed.has(normalizeMalay(equivalent))) issues.push('whole-output-reference-mismatch');
    const normalized = normalizeMalay(equivalent);
    if (policy.excludedSenseOutputs?.[`${task.simplified}|${task.english.toLowerCase()}|${normalized}`]) issues.push('mandarin-context-conflict');
    if (policy.excludedTerms[normalized] || policy.excludedEnglishMalay[`${task.english.toLowerCase()}|${normalized}|${task.synset}`]
      || policy.excludedEnglishMalay[`${task.english.toLowerCase()}|${normalized}`]) issues.push('malaysian-scope-review');
    if (task.partOfSpeech === 'v' && !/^(?:me|ber|ter|memper)/.test(normalized) && !normalized.includes(' ') && !policy.allowedBareVerbs.includes(normalized)) issues.push('bare-verb-needs-review');
    if (normalized === 'terima') issues.push('bare-verb-needs-review');
  }
  if (!terms.length) issues.push('empty');
  // Only whole, short equivalent(s) supported by the exact Chinese/English sense
  // concordance qualify. Never clip a translated definition to its first word.
  const equivalents = [...new Map(terms.map(t => t.replace(/^untuk\s+/i, '')).map(t => [normalizeMalay(t), t])).values()];
  const record = { key: task.key, entryId: task.entryId, senseId: task.senseId, english: task.english, malay: equivalents.join('; '),
    malaySearchTerms: equivalents,
    translationKind: 'lexical-equivalent', translationStatus: 'generated', translationQuality: 'automated-review-required',
    translationSource: `${model.model}; local ${model.device === 'cuda' ? 'GPU' : 'CPU'} inference; Wordnet Bahasa zsm / Chinese Open Wordnet / Princeton WordNet sense concordance`,
    translationModel: model.model, translationModelRevision: model.revision, translationLicense: `${model.license}; MIT (Wordnet Bahasa); Chinese Open Wordnet license; Princeton WordNet 3.0 license; CC-BY-SA-4.0 corpus alignment`,
    translationVersion: OFFLINE_POLICY,
    translationNotes: 'Machine-generated provisional equivalent. Leading infinitive untuk and case-equivalent duplicate alternatives normalized. Licensed sense concordance is an automated filter, not independent human verification.',
    translationAlignment: { synset: task.synset, method: OFFLINE_POLICY, inferenceKey: task.inferenceKey, sourceInput: task.input, rawModelOutput: output.text, quantization: model.quantization ?? 'int8', beamSize: output.beamSize ?? model.beamSize, runtime: `CTranslate2 ${model.runtime ?? '4.8.3'}`, device: model.device ?? 'cpu' },
    idiomExplanation: false };
  if (normalizeMalay(text) === normalizeMalay(task.english) && allowed.has(normalizeMalay(text))) record.sameTextJustification = `Scoped Wordnet Bahasa zsm equivalent attested for ${task.synset}; human review pending.`;
  issues.push(...qualityIssues(record, task));
  return issues.length ? { issues: [...new Set(issues)] } : { record };
}
