import { normalizeMalay } from '../../src/lib/malay-search.ts';
import { validReferenceDefinition } from './reference-definition.mjs';
const borrowed = new Set(['durian', 'tomato', 'pen', 'hospital', 'proton', 'neutron', 'atom', 'virus', 'nitrogen', 'bank', 'panda']);
export function qualityIssues(record, sense) {
  const issues = [];
  if (!record || typeof record.malay !== 'string' || !record.malay.trim()) return ['missing-malay'];
  const malay = normalizeMalay(record.malay), english = normalizeMalay(sense.english);
  if (record.entryId !== sense.entryId || record.senseId !== sense.senseId || record.english !== sense.english || record.key !== sense.key) issues.push('sense-misalignment');
  if (malay === english && !borrowed.has(malay) && !record.sameTextJustification) issues.push('english-copy');
  if (/\b(?:TODO|TBD|placeholder|undefined|null|translation pending|not available|terjemahan belum)\b/i.test(record.malay)) issues.push('placeholder');
  if (/\ufffd|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(record.malay)
    || /\p{Script=Han}/u.test(record.malay) && !validReferenceDefinition(record, sense)) issues.push('invalid-language-or-unicode');
  if (/\b(?:the|to|of|with|from|which|something|someone)\b/i.test(record.malay)) issues.push('english-language-warning');
  if (/\b(?:mobil|sepeda|kantor|sekolah dasar|rumah sakit|telepon|apotik|kulkas|handuk|gratis)\b/i.test(record.malay)) issues.push('indonesian-localization-review');
  if (/\{\\|\\(?:an\d|pos|fad|k\d)|\b(?:brim|subordinate|superfluous|invoice)\b/i.test(record.malay)) issues.push('corrupt-or-untranslated-output');
  if (record.translationQuality !== undefined && !['human-verified', 'automated-high-confidence', 'automated-review-required'].includes(record.translationQuality)) issues.push('invalid-quality-status');
  if (record.translationQuality === 'human-verified' && (record.translationStatus !== 'verified' || !record.translationReviewer)) issues.push('unsupported-human-verification');
  if (!['generated', 'unreviewed', 'verified'].includes(record.translationStatus)) issues.push('invalid-status');
  if (record.translationKind !== undefined && !['lexical-equivalent', 'definition-translation'].includes(record.translationKind)) issues.push('invalid-translation-kind');
  // Evidence-based dictionary imports need no invented numeric probability.
  // Existing generator confidence values retain their original validation.
  if (record.translationConfidence !== undefined && (!Number.isFinite(record.translationConfidence) || record.translationConfidence < 0 || record.translationConfidence > 1)) issues.push('invalid-confidence');
  if (!record.translationSource || !record.translationLicense || !record.translationVersion) issues.push('missing-provenance');
  if (/DBP|PRPM/i.test(record.translationSource) && !record.referencePermission) issues.push('unsupported-dbp-attribution');
  if (record.translationStatus === 'verified' && !record.translationReviewer) issues.push('missing-reviewer');
  if (sense.idiom && !record.idiomExplanation) issues.push('idiom-needs-semantic-explanation');
  for (const field of ['malaySearchTerms', 'malaySynonyms', 'malayMorphology']) {
    if (record[field] !== undefined && (!Array.isArray(record[field]) || record[field].some(t => typeof t !== 'string' || !normalizeMalay(t)))) issues.push(`invalid-${field}`);
  }
  for (const field of ['malayLexical', 'malayDefinition']) {
    const value = record[field];
    if (value === undefined) continue;
    if (!value || typeof value !== 'object' || typeof value.text !== 'string' || !value.text.trim()) { issues.push(`invalid-${field}`); continue; }
    if (!['generated', 'unreviewed', 'verified'].includes(value.status) || !['automated-review-required', 'human-verified'].includes(value.quality)) issues.push(`invalid-${field}-status`);
    if ((value.status === 'verified' || value.quality === 'human-verified') && !(value.status === 'verified' && value.quality === 'human-verified' && value.reviewer)) issues.push(`unsupported-${field}-verification`);
    if (!value.source || !value.license || !value.version) issues.push(`missing-${field}-provenance`);
    if (/\ufffd|[\uD800-\uDFFF]/u.test(value.text) || /\b(?:TODO|TBD|placeholder|undefined|null)\b/i.test(value.text)) issues.push(`invalid-${field}-text`);
    if (field === 'malayLexical' && (!/^[\p{Script=Latin}\p{M} ;'’-]+$/u.test(value.text) || value.text.length > 200 || sense.idiom)) issues.push('invalid-lexical-supplement');
    if (field === 'malayLexical' && record.translationKind === 'lexical-equivalent' || field === 'malayDefinition' && record.translationKind === 'definition-translation') issues.push(`duplicate-${field}-kind`);
  }
  return issues;
}
export function runtimeRecord(record) {
  const fields = ['key', 'entryId', 'senseId', 'english', 'malay', 'malayLexical', 'malayDefinition', 'malaySearchTerms', 'malaySynonyms', 'malayMorphology', 'translationSource', 'translationStatus', 'translationKind', 'translationQuality', 'translationModel', 'translationModelRevision', 'translationConfidence', 'translationLicense', 'translationVersion', 'translationReviewer', 'translationNotes'];
  return Object.fromEntries(fields.filter(k => record[k] !== undefined).map(k => [k, record[k]]));
}
