import { readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { corpus, hash } from './corpus.mjs';
import { deepResources, recoverAlignment, evidenceFor } from './deep-quality.mjs';
import { referenceSource } from './reference-definition.mjs';
import { qualityIssues, runtimeRecord } from './quality.mjs';
import { buildMalay } from './pipeline.mjs';
import { atomicJSON } from './io.mjs';
import { normalizeMalay } from '../../src/lib/malay-search.ts';

export const VERSION = 'sense-lexical-enrichment-v1';
const read = file => JSON.parse(readFileSync(file, 'utf8'));
const policy = read('scripts/data/malay-lexical-review-policy.json');
const sourceFiles = ['scripts/malay/lexical-enrichment.mjs', 'scripts/data/malay-lexical-review-policy.json',
  'scripts/malay/deep-quality.mjs', 'scripts/data/malay-deep-review-policy.json', 'scripts/data/malay-offline-review-policy.json',
  'scripts/malay/quality.mjs', 'scripts/malay/lexical-alignment.mjs', 'scripts/malay/bulk-dataset.mjs', 'scripts/malay/dataset-reader.mjs',
  'scripts/data/malay-bulk-review-policy.json', 'scripts/malay/offline-quality.mjs'];
const storeFile = 'scripts/data/malay-translations-v1.json', runtimeFile = 'src/data/malay-runtime.json';
export const ROOT = '.tmp/malay-lexical-accuracy/run-final';
const count = list => list.reduce((a, key) => (a[key] = (a[key] ?? 0) + 1, a), {});
const normalizedEnglish = value => value.replace(/^\((?:bound form|literary|coll\.|formal|informal)\)\s*/i, '').toLowerCase();

export function lexicalPolicyIssue(sense, term, resources, { strict = true } = {}) {
  const english = normalizedEnglish(sense.english), normalized = normalizeMalay(term);
  if (policy.excludedPairs?.[`${english}|${normalized}`] || policy.excludedSenses[`${sense.simplified}|${english}`] || policy.excludedEnglish[english] || policy.excludedTerms[normalized]) return 'lexical-scope-locale-or-category-review';
  if (!/^[\p{Script=Latin}\p{M} '-]+$/u.test(term) || term.length > 100 || !term.trim()) return 'invalid-lexical-shape';
  const evidence = evidenceFor(sense, term, resources);
  if (evidence.issues) return evidence.issues[0];
  if (strict && !(evidence.wordnet && evidence.wiktionary)) return 'requires-both-licensed-reference-families';
  if (evidence.alignment.method.includes('no-chinese') && evidence.alignment.clauses.some(c => resources.lexical.english.byLemma.get(c)?.size !== 1)) return 'polysemy-without-mandarin-concordance';
  // POS agreement alone cannot establish transitivity or justify bare roots.
  if (strict && evidence.alignment.pos === 'verb' && !/^(?:me|ber|ter)/.test(normalized) && normalized !== 'turun takhta') return 'verb-form-needs-grammatical-review';
  if (/^(?:a|an|the)\s/i.test(english) && evidence.alignment.pos !== 'noun') return 'article-pos-conflict';
  return null;
}

export function directLexical(sense, resources) {
  const alignment = recoverAlignment(sense, resources);
  if (!alignment.synset) return { reason: alignment.reason };
  const candidates = [...new Map((resources.lexical.malay.bySynset.get(alignment.synset) ?? []).map(t => [normalizeMalay(t), t])).values()];
  const terms = [], withheld = [];
  for (const term of candidates) {
    const reason = lexicalPolicyIssue(sense, term, resources);
    if (reason) withheld.push({ term, reason }); else terms.push(term);
  }
  if (!terms.length || terms.length > 3) return { reason: terms.length ? 'too-many-alternatives' : 'no-qualified-lexical-reference', candidates: withheld };
  const evidence = terms.map(t => evidenceFor(sense, t, resources));
  return { text: terms.join('; '), evidence: { method: 'complete-sense-two-reference-families', ...alignment,
    sources: [...new Map(evidence.flatMap(e => e.sources).map(s => [JSON.stringify(s), s])).values()] }, withheld };
}

export function classifyMalay(record, sense, resources) {
  const invalid = qualityIssues(record, sense);
  if (invalid.length) return { category: 'invalid-or-questionable', evidence: invalid };
  if (record.translationKind === 'definition-translation') return { category: 'translated-definition', evidence: ['explicit-existing-type'] };
  if (record.translationKind === 'lexical-equivalent') return { category: 'lexical-equivalent', evidence: ['explicit-existing-type'] };
  if (record.idiomExplanation === true) return { category: 'translated-definition', evidence: ['explicit-existing-idiom-explanation'] };
  const terms = record.malay.split(';').map(s => s.trim());
  const issues = terms.map(t => lexicalPolicyIssue(sense, t, resources, { strict: false })).filter(Boolean);
  if (!issues.length) return { category: 'lexical-equivalent', evidence: ['complete-sense-and-POS-reference-attestation'] };
  return { category: 'mixed-or-ambiguous', evidence: [...new Set(issues)] };
}

export function entryIndex(senses) {
  const entries = new Map();
  for (const sense of senses) { const group = entries.get(sense.entryId) ?? []; group.push(sense); entries.set(sense.entryId, group); }
  return entries;
}

export function referenceLexical(sense, entries, seed) {
  const ref = referenceSource(sense.english);
  // "see" is not an equivalence assertion. Never follow it automatically.
  if (!ref || !['variant', 'old-variant', 'erhua-variant', 'erhua-form', 'abbreviation', 'also-written'].includes(ref.rule.id)) return { reason: 'not-an-equivalence-reference' };
  const [, forms, pinyin] = /^(.+)\[([^\]]+)\]$/.exec(ref.reference);
  const scripts = forms.split('|'), entryId = `${scripts.at(-1)}|${scripts[0]}|${pinyin}`;
  const targets = entries.get(entryId);
  if (!targets) return { reason: 'exact-target-script-or-pinyin-unavailable' };
  // Every target sense must be independently qualified; one convenient sense
  // cannot be copied across a polysemous entry. Seeds are frozen, never recursive.
  const lexical = targets.map(t => seed.get(t.key));
  if (lexical.some(t => !t)) return { reason: 'target-has-unresolved-senses' };
  const terms = new Set(lexical.map(r => r.text.split(';').map(normalizeMalay).sort().join(';')));
  const poses = new Set(lexical.map(r => r.evidence.pos));
  if (terms.size !== 1 || poses.size !== 1) return { reason: 'target-has-conflicting-senses-or-pos' };
  return { text: lexical[0].text, evidence: { method: 'exact-equivalence-reference-all-target-senses',
    reference: ref.reference, relation: ref.rule.id, targetEntryId: entryId, targetKeys: targets.map(t => t.key),
    pos: lexical[0].evidence.pos, targetEvidence: lexical.map(t => t.evidence) } };
}

function supplement(candidate) {
  return { text: candidate.text, status: 'generated', quality: 'automated-review-required',
    source: 'CC-CEDICT exact sense; Wordnet Bahasa; Chinese Open Wordnet; Princeton WordNet; English Wiktionary contributors',
    license: 'CC-BY-SA-4.0; MIT (Wordnet Bahasa); Chinese Open Wordnet license; Princeton WordNet 3.0 license', version: VERSION };
}

export function coverage(records, total) {
  const lexical = records.filter(r => r.translationKind === 'lexical-equivalent' || r.malayLexical).length;
  const definitions = records.filter(r => r.translationKind === 'definition-translation' || r.malayDefinition).length;
  return { senses: total, content: records.length, contentPercent: records.length / total * 100, explicitLexical: lexical,
    explicitDefinitions: definitions, both: records.filter(r => (r.translationKind === 'lexical-equivalent' || r.malayLexical) && (r.translationKind === 'definition-translation' || r.malayDefinition)).length,
    legacyUntyped: records.filter(r => !r.translationKind).length, generatedRecords: records.filter(r => r.translationStatus === 'generated').length,
    generatedSupplements: records.filter(r => r.malayLexical?.status === 'generated').length,
    humanReviewed: records.filter(r => r.translationStatus === 'verified' && r.translationReviewer).length,
    untranslated: total - records.length };
}

export async function prepareEnrichment({ root = ROOT, data = corpus(), resources = null } = {}) {
  const start = performance.now(); resources ??= await deepResources();
  assert(!existsSync(`${root}/preparation.json`), 'Frozen preparation exists; use integrate or a new run directory.');
  mkdirSync(root, { recursive: true });
  const baselineBytes = readFileSync(storeFile), baseline = JSON.parse(baselineBytes), byKey = new Map(baseline.records.map(r => [r.key, r]));
  const senses = new Map(data.senses.map(s => [s.key, s])), entries = entryIndex(data.senses);
  const audit = baseline.records.map(r => ({ key: r.key, ...classifyMalay(r, senses.get(r.key), resources) }));
  const categories = new Map(audit.map(r => [r.key, r.category]));
  const seed = new Map(), direct = new Map(), ledger = [], candidates = [], withheldAlternatives = [];
  // Stage 1: independent exact-reference extraction, not neural paraphrase.
  for (const sense of data.senses) {
    const result = directLexical(sense, resources); direct.set(sense.key, result);
    if (result.text) seed.set(sense.key, result);
    else {
      const old = byKey.get(sense.key);
      if (!old || old.translationKind === 'definition-translation' || old.idiomExplanation) continue;
      const terms = old.malay.split(';').map(t => t.trim());
      if (terms.every(t => !lexicalPolicyIssue(sense, t, resources, { strict: false }))) {
        const ev = evidenceFor(sense, terms[0], resources);
        seed.set(sense.key, { text: old.malay, evidence: { method: 'preserved-lexical-meaning-revalidated-for-reference-use', ...ev.alignment,
          sources: terms.flatMap(t => evidenceFor(sense, t, resources).sources), sourceRecordKey: old.key } });
      }
    }
  }
  // Stage 2 prioritizes definitions, then the entire missing backlog. No cap.
  const ordered = [...data.senses].sort((a, b) => Number(byKey.get(b.key)?.translationKind === 'definition-translation') - Number(byKey.get(a.key)?.translationKind === 'definition-translation'));
  for (const sense of ordered) {
    const old = byKey.get(sense.key);
    if (old && (old.malayLexical || categories.get(sense.key) === 'lexical-equivalent')) continue;
    const result = direct.get(sense.key)?.text ? direct.get(sense.key) : referenceLexical(sense, entries, seed);
    const alternate = direct.get(sense.key)?.candidates ?? direct.get(sense.key)?.withheld ?? [];
    if (alternate.length) withheldAlternatives.push({ key: sense.key, candidates: alternate });
    if (!result.text || old && categories.get(sense.key) === 'mixed-or-ambiguous') {
      ledger.push({ key: sense.key, english: sense.english, oldCategory: old ? categories.get(sense.key) : 'missing',
        reason: result.text ? 'legacy-meaning-needs-type-review' : result.reason, directReason: direct.get(sense.key)?.reason }); continue;
    }
    const metadata = supplement(result);
    const record = old ? { ...old, malayLexical: metadata, lexicalEvidence: result.evidence } : {
      key: sense.key, entryId: sense.entryId, senseId: sense.senseId, english: sense.english, malay: result.text,
      malaySearchTerms: result.text.split(';').map(t => t.trim()), translationKind: 'lexical-equivalent',
      translationStatus: 'generated', translationQuality: 'automated-review-required', translationSource: metadata.source,
      translationLicense: metadata.license, translationVersion: VERSION,
      translationNotes: 'Licensed exact-sense reference extraction; provisional, independent Malaysian Malay review pending.',
      translationAlignment: result.evidence, idiomExplanation: false,
      ...(normalizeMalay(result.text) === normalizeMalay(sense.english) ? { sameTextJustification: 'Both licensed reference families attest the complete English/POS sense.' } : {}) };
    const issues = qualityIssues(record, sense);
    if (issues.length) { ledger.push({ key: sense.key, reason: 'structural-validation-rejected', issues }); continue; }
    candidates.push({ record, previousSha256: old ? hash(JSON.stringify(old)) : null, evidence: result.evidence });
  }
  atomicJSON(`${root}/baseline-store.json`, baseline); copyFileSync(runtimeFile, `${root}/baseline-runtime.json`);
  atomicJSON(`${root}/candidates.json`, { schema: 1, records: candidates });
  writeFileSync(`${root}/review-queue.jsonl`, [...ledger, ...withheldAlternatives.map(r => ({ ...r, reason: 'withheld-lexical-alternatives' })), ...candidates.map(c => ({ key: c.record.key, reason: 'provisional-language-review-pending', candidate: c.record.malayLexical?.text ?? c.record.malay, evidence: c.evidence }))].map(r => JSON.stringify(r)).join('\n') + '\n');
  atomicJSON(`${root}/audit.json`, { categories: count(audit.map(r => r.category)), records: audit });
  const prepared = { schema: 1, version: VERSION, corpusSha256: data.digest, baselineStoreSha256: hash(baselineBytes),
    baselineRuntimeSha256: hash(readFileSync(runtimeFile)), candidatesSha256: hash(readFileSync(`${root}/candidates.json`)),
    sourceSha256: Object.fromEntries(sourceFiles.map(f => [f, hash(readFileSync(f))])),
    before: coverage(baseline.records, data.senses.length), audited: audit.length, categories: count(audit.map(r => r.category)),
    definitionOnlyAnalyzed: baseline.records.filter(r => categories.get(r.key) === 'translated-definition').length,
    exactReferenceCandidates: candidates.filter(c => c.evidence.method.includes('equivalence-reference')).length,
    directReferenceCandidates: candidates.filter(c => !c.evidence.method.includes('equivalence-reference')).length,
    enriched: candidates.filter(c => c.previousSha256).length, newlyCovered: candidates.filter(c => !c.previousSha256).length,
    withheldSenses: ledger.length, withheldReasons: count(ledger.map(r => r.reason)), candidateAlternativesWithheld: withheldAlternatives.reduce((n, r) => n + r.candidates.length, 0),
    seconds: (performance.now() - start) / 1000, independentHumanReviewed: 0, costUsd: 0 };
  atomicJSON(`${root}/preparation.json`, prepared);
  console.log(JSON.stringify(prepared, null, 2)); return prepared;
}

export function integrateEnrichment({ root = ROOT, promote = false, data = corpus() } = {}) {
  const prep = read(`${root}/preparation.json`), incoming = read(`${root}/candidates.json`).records;
  assert.equal(hash(readFileSync(`${root}/candidates.json`)), prep.candidatesSha256);
  for (const [file, expected] of Object.entries(prep.sourceSha256)) assert.equal(hash(readFileSync(file)), expected, `Prepared policy changed: ${file}`);
  assert.equal(data.digest, prep.corpusSha256);
  const baseline = read(`${root}/baseline-store.json`);
  assert.equal(hash(readFileSync(`${root}/baseline-store.json`)), prep.baselineStoreSha256);
  const beforeStore = readFileSync(storeFile), beforeRuntime = readFileSync(runtimeFile), current = JSON.parse(beforeStore);
  const currentByKey = new Map(current.records.map(r => [r.key, r]));
  const applied = incoming.every(c => JSON.stringify(currentByKey.get(c.record.key)) === JSON.stringify(c.record));
  assert(hash(beforeStore) === prep.baselineStoreSha256 || applied, 'Store changed after preparation.');
  assert.equal(new Set(incoming.map(c => c.record.key)).size, incoming.length, 'Duplicate candidate keys');
  const map = new Map(baseline.records.map(r => [r.key, r])), senses = new Map(data.senses.map(s => [s.key, s]));
  for (const c of incoming) {
    const old = map.get(c.record.key);
    assert.equal(old ? hash(JSON.stringify(old)) : null, c.previousSha256);
    assert.deepEqual(qualityIssues(c.record, senses.get(c.record.key)), []);
    if (old) {
      assert(!old.malayLexical, 'Supplement overwrite prohibited');
      const { malayLexical, lexicalEvidence, ...preserved } = c.record;
      assert.deepEqual(preserved, old, 'An existing field was overwritten');
      assert.equal(malayLexical.status, 'generated'); assert.equal(malayLexical.quality, 'automated-review-required');
      assert.deepEqual(lexicalEvidence, c.evidence);
    } else { assert.equal(c.record.translationStatus, 'generated'); assert.equal(c.record.translationKind, 'lexical-equivalent'); }
    map.set(c.record.key, c.record);
  }
  const stagedStore = `${root}/staged-store.json`, stagedRuntime = `${root}/staged-runtime.json`;
  atomicJSON(stagedStore, { ...baseline, records: [...map.values()] });
  const { asset, report } = buildMalay(data, stagedStore, stagedRuntime, { reports: false });
  assert.equal(report.rejected.length, 0); assert.equal(report.staleCount, 0);
  const next = read(stagedStore), afterMap = new Map(next.records.map(r => [r.key, r]));
  assert.equal(next.records.length, baseline.records.length + prep.newlyCovered);
  for (const old of baseline.records) {
    const nextRecord = afterMap.get(old.key);
    assert(nextRecord, 'Existing sense lost');
    for (const [key, value] of Object.entries(old)) assert.deepEqual(nextRecord[key], value, `Existing ${key} changed`);
  }
  assert.deepEqual(asset.records, next.records.map(runtimeRecord));
  const journal = `${root}/promotion-journal.json`;
  assert(!existsSync(journal) || read(journal).state !== 'pending', 'Recover the paired backup before resuming.');
  if (promote && !applied) {
    copyFileSync(storeFile, `${root}/promotion-before-store.json`); copyFileSync(runtimeFile, `${root}/promotion-before-runtime.json`);
    atomicJSON(journal, { state: 'pending', beforeStoreSha256: hash(beforeStore), beforeRuntimeSha256: hash(beforeRuntime), targetVersion: next.version });
    try { atomicJSON(storeFile, next); atomicJSON(runtimeFile, asset); atomicJSON(journal, { state: 'complete', version: next.version }); }
    catch (error) { atomicJSON(storeFile, JSON.parse(beforeStore)); atomicJSON(runtimeFile, JSON.parse(beforeRuntime)); atomicJSON(journal, { state: 'rolled-back' }); throw error; }
  }
  const result = { promoted: promote, alreadyApplied: applied, addedThisImport: applied ? 0 : prep.newlyCovered,
    enrichedThisImport: applied ? 0 : prep.enriched, preservedExistingRecords: baseline.records.length,
    before: prep.before, after: coverage(next.records, data.senses.length),
    storeSha256: hash(readFileSync(stagedStore)), runtimeSha256: hash(readFileSync(stagedRuntime)),
    storeBytes: readFileSync(stagedStore).length, runtimeBytes: readFileSync(stagedRuntime).length };
  atomicJSON(`${root}/integration.json`, result); console.log(JSON.stringify(result, null, 2)); return result;
}

if (resolve(process.argv[1] ?? '') === resolve('scripts/malay/lexical-enrichment.mjs')) {
  if (process.argv[2] === 'prepare') await prepareEnrichment();
  else if (process.argv[2] === 'integrate') integrateEnrichment({ promote: process.argv.includes('--promote-local') });
  else throw Error('Use prepare or integrate [--promote-local].');
}
