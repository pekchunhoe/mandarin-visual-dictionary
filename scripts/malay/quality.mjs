import { normalizeMalay } from '../../src/lib/malay-search.ts';
const borrowed = new Set(['durian', 'tomato', 'pen', 'hospital', 'proton', 'neutron', 'atom', 'virus', 'nitrogen', 'bank', 'panda']);
export function qualityIssues(record, sense) {
  const issues = [];
  if (!record || typeof record.malay !== 'string' || !record.malay.trim()) return ['missing-malay'];
  const malay = normalizeMalay(record.malay), english = normalizeMalay(sense.english);
  if (record.entryId !== sense.entryId || record.senseId !== sense.senseId || record.english !== sense.english || record.key !== sense.key) issues.push('sense-misalignment');
  if (malay === english && !borrowed.has(malay) && !record.sameTextJustification) issues.push('english-copy');
  if (/\b(?:TODO|TBD|placeholder|undefined|null|translation pending|not available|terjemahan belum)\b/i.test(record.malay)) issues.push('placeholder');
  if (/\p{Script=Han}|\ufffd|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(record.malay)) issues.push('invalid-language-or-unicode');
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
  return issues;
}
export function runtimeRecord(record) {
  const fields = ['key', 'entryId', 'senseId', 'english', 'malay', 'malaySearchTerms', 'malaySynonyms', 'malayMorphology', 'translationSource', 'translationStatus', 'translationKind', 'translationQuality', 'translationModel', 'translationModelRevision', 'translationConfidence', 'translationLicense', 'translationVersion', 'translationReviewer', 'translationNotes'];
  return Object.fromEntries(fields.filter(k => record[k] !== undefined).map(k => [k, record[k]]));
}
