import { readFileSync, existsSync, mkdirSync, copyFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import assert from 'node:assert/strict';
import { readDataset, fileDigest, normalizeEntry, normalizeEnglish, normalizeText } from './dataset-reader.mjs';
import { corpus, hash } from './corpus.mjs';
import { lexicalResources, alignLexicalSense } from './lexical-alignment.mjs';
import { atomicJSON } from './io.mjs';
import { buildMalay } from './pipeline.mjs';
import { qualityIssues, runtimeRecord } from './quality.mjs';

export const BULK_VERSION = 'licensed-bulk-concordance-1';
const read = file => JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
export const reviewPolicy = read('scripts/data/malay-bulk-review-policy.json');
export const sources = [
  { id: 'kaikki-ms-2026-09-02', file: '.tmp/malay-recovery/wiktionary-malay.jsonl', orientation: 'wiktionary-ms-en', license: 'CC-BY-SA-4.0', redistributable: true,
    sha256: '09719ea7c3ca0448a35ecfacd1a88ef5d816d072523b81b46d2baffb1b51f207', version: 'enwiktionary-2026-09-02-extracted-2026-10-03', url: 'https://kaikki.org/dictionary/Malay/kaikki.org-dictionary-Malay.jsonl', attribution: 'English Wiktionary contributors; extracted by Tatu Ylonen / Wiktextract / Kaikki' },
  { id: 'mesolitica-wiktionary-5da140040840', file: '.tmp/malay-datasets/sources/wiktionary-bahasa.json', orientation: 'wiktionary-ms-en', license: 'CC-BY-SA-4.0', redistributable: true,
    sha256: 'e5ab7a2d168da66529e59fe269bb5d4be5745e4655879be8e4c608280c067363', version: '5da1400408400a49f5550277166afb00aadd0f33', url: 'https://huggingface.co/datasets/mesolitica/wiktionary-bahasa/resolve/5da1400408400a49f5550277166afb00aadd0f33/wiktionary-bahasa.json', attribution: 'English Wiktionary contributors; Kaikki extraction, filtered by Mesolitica. Original dump date unspecified.' }
];

// Shards are immutable and committed before their checkpoint. An interruption
// can repeat at most one batch; exact hashes prevent duplicate output on resume.
export async function normalizeSource(source, root = '.tmp/malay-datasets/cache', { batchSize = 500, stopAfterBatches = Infinity } = {}) {
  if (source.redistributable !== true || source.license !== 'CC-BY-SA-4.0' || !source.attribution || !source.version || !source.url) throw Error('Source has no approved redistribution provenance.');
  const sha256 = await fileDigest(source.file);
  if (source.sha256 && sha256 !== source.sha256) throw Error(`Dataset SHA-256 mismatch: ${source.id}`);
  const signature = hash(JSON.stringify([BULK_VERSION, sha256, source.orientation, source.license, source.id]));
  const dir = resolve(root, signature); mkdirSync(dir, { recursive: true });
  const manifestFile = resolve(dir, 'checkpoint.json');
  const checkpoint = existsSync(manifestFile) ? read(manifestFile) : { signature, sourceId: source.id, sha256, completed: false, inputRows: 0, normalizedRecords: 0, exactDuplicates: 0, rejectedRows: 0, rejectionReasons: {}, batches: [] };
  const records = [], seen = new Set();
  for (const batch of checkpoint.batches) {
    const file = resolve(dir, batch.file);
    if (await fileDigest(file) !== batch.sha256) throw Error('Corrupt normalized cache shard.');
    for (const r of read(file).records) { records.push(r); seen.add(hash(JSON.stringify(r))); }
  }
  if (checkpoint.completed) return { records, checkpoint, cached: true };
  let at = 0, pending = [], batchStart = checkpoint.inputRows, newBatches = 0;
  const save = () => {
    const name = `rows-${String(batchStart).padStart(9, '0')}-${String(checkpoint.inputRows).padStart(9, '0')}.json`;
    const file = resolve(dir, name); atomicJSON(file, { records: pending });
    checkpoint.batches.push({ file: name, sha256: hash(readFileSync(file)) });
    atomicJSON(manifestFile, checkpoint); pending = []; batchStart = checkpoint.inputRows; newBatches++;
  };
  for await (const row of readDataset(source.file)) {
    if (at++ < checkpoint.inputRows) continue;
    checkpoint.inputRows++;
    const result = row.error ? row : normalizeEntry(row.value, source);
    if (result.error) { checkpoint.rejectedRows++; checkpoint.rejectionReasons[result.error] = (checkpoint.rejectionReasons[result.error] ?? 0) + 1; }
    for (const r of result.records ?? []) {
      const key = hash(JSON.stringify(r));
      if (seen.has(key)) { checkpoint.exactDuplicates++; continue; }
      seen.add(key); records.push(r); pending.push(r); checkpoint.normalizedRecords++;
    }
    if (checkpoint.inputRows - batchStart >= batchSize) { save(); if (newBatches >= stopAfterBatches) return { records, checkpoint, interrupted: true }; }
  }
  if (checkpoint.inputRows !== batchStart) save();
  checkpoint.completed = true; atomicJSON(manifestFile, checkpoint);
  return { records, checkpoint, cached: false };
}

export function indexRecords(records) {
  const index = new Map();
  for (const r of records) { const key = normalizeEnglish(r.english); const list = index.get(key) ?? []; list.push(r); index.set(key, list); }
  return index;
}
export function matchSense(sense, resources, index, policy = reviewPolicy) {
  const aligned = alignLexicalSense(sense, resources);
  const synset = aligned.synset;
  if (!synset) return { reason: aligned.reason };
  const pos = { n: 'noun', v: 'verb', a: 'adj', s: 'adj', r: 'adv' }[synset.at(-1)];
  const allowed = new Set((resources.malay.bySynset.get(synset) ?? []).map(t => normalizeText(t).toLowerCase()));
  const exactEnglish = normalizeEnglish(sense.english);
  const clauses = sense.english.replace(/^\((?:bound form|literary|coll\.|formal|informal)\)\s*/i, '').split(/[;/]/).map(normalizeEnglish);
  const groups = [exactEnglish, ...clauses].map(k => index.get(k) ?? []);
  const matches = groups.map(group => group.filter(r => r.pos === pos && allowed.has(r.malay.toLowerCase())));
  const candidates = new Map();
  for (const r of matches[0]) candidates.set(r.malay.toLowerCase(), [r]);
  // Every clause must independently attest the SAME Malay lemma and POS;
  // a partial English sense never becomes a complete translation.
  if (matches.length > 1) for (const r of matches[1]) {
    const evidence = matches.slice(1).map(group => group.filter(t => t.malay.toLowerCase() === r.malay.toLowerCase())).flat();
    if (matches.slice(1).every(group => group.some(t => t.malay.toLowerCase() === r.malay.toLowerCase()))) candidates.set(r.malay.toLowerCase(), evidence);
  }
  if (!candidates.size) return { reason: groups.some(g => g.length) ? 'pos-or-malay-concordance-mismatch' : 'no-exact-wiktionary-definition', synset };
  const withheld = [];
  if (policy.excludedSynsets[synset]) return { reason: 'reviewed-context-conflict', synset, candidates: [...candidates.keys()], notes: policy.excludedSynsets[synset] };
  for (const [term] of candidates) {
    const reason = policy.excludedTerms[term] ?? policy.excludedEnglishMalay[`${exactEnglish}|${term}|${synset}`] ?? policy.excludedEnglishMalay[`${exactEnglish}|${term}`]
      ?? (pos === 'verb' && !/^(?:me|ber|ter|memper)/.test(term) && !term.includes(' ') && !policy.allowedBareVerbs.includes(term) ? 'Bare verb root requires grammatical review.' : undefined);
    // terima is an uninflected root, despite sharing the letters of ter-.
    if (reason || term === 'terima') { withheld.push({ term, reason: reason ?? 'Bare verb root requires grammatical review.' }); candidates.delete(term); }
  }
  if (!candidates.size) return { reason: 'malaysian-scope-or-grammar-review', synset, candidates: withheld };
  if (candidates.size > 5) return { reason: 'too-many-lexical-alternatives', synset, candidates: [...candidates.keys()] };
  const evidence = [...candidates.values()].flat();
  const terms = [...candidates.keys()].sort();
  const record = { ...sense, malay: terms.join('; '), malaySearchTerms: terms, malaySynonyms: [], malayMorphology: [],
    translationSource: 'English Wiktionary contributors via Kaikki/Mesolitica; Wordnet Bahasa zsm, Chinese Open Wordnet, Princeton WordNet 3.0',
    translationLicense: 'CC-BY-SA-4.0; MIT (Wordnet Bahasa); Chinese Open Wordnet license; Princeton WordNet 3.0 license',
    translationVersion: BULK_VERSION, translationStatus: 'unreviewed', translationQuality: 'automated-review-required',
    translationNotes: `Provisional dictionary concordance; independent Malaysian Malay review pending. Source pages: ${[...new Set(evidence.map(r => r.url))].join(' ')}`,
    translationAlignment: { method: 'exact-English-definition-and-POS-plus-unique-Chinese-English-Malay-synset', synset, pos, englishClauses: clauses, sources: [...new Map(evidence.map(r => [JSON.stringify(r), r])).values()] }, idiomExplanation: false
  };
  // Identical loanwords are allowed only with scoped independent Malay evidence.
  if (normalizeEnglish(record.malay) === normalizeEnglish(sense.english)) record.sameTextJustification = `Malay Wiktionary POS and Wordnet Bahasa zsm both attest this lemma in ${synset}.`;
  const issues = qualityIssues(record, sense);
  return issues.length ? { reason: 'structural-quality-review', issues, synset, candidates: terms } : { record, synset, withheld };
}

export async function prepareBulk({ root = '.tmp/malay-datasets', storeFile = 'scripts/data/malay-translations-v1.json' } = {}) {
  const start = performance.now(), data = corpus(), resources = lexicalResources(), baseline = read(storeFile);
  const covered = new Set(baseline.records.map(r => r.key)), normalized = [], sourceResults = [];
  for (const source of sources) {
    const time = performance.now(), result = await normalizeSource(source);
    normalized.push(...result.records); sourceResults.push({ ...source, bytes: statSync(source.file).size, ...result.checkpoint, cached: result.cached, milliseconds: performance.now() - time });
  }
  const index = indexRecords(normalized), records = [], additional = [], quarantine = [], reasons = {};
  const headwordKeys = new Set(), highConfidenceKeys = new Set();
  for (const sense of data.senses) {
    const headwordHit = index.has(normalizeEnglish(sense.english));
    if (headwordHit) headwordKeys.add(sense.key);
    const result = matchSense(sense, resources, index);
    if (result.record) {
      highConfidenceKeys.add(sense.key);
      (covered.has(sense.key) ? additional : records).push(result.record);
      if (result.withheld.length) quarantine.push({ key: sense.key, entryId: sense.entryId, senseId: sense.senseId, english: sense.english, simplified: sense.simplified, pinyin: sense.pinyin, reason: 'alternative-terms-withheld', candidates: result.withheld, candidateEvidence: (index.get(normalizeEnglish(sense.english)) ?? []), partiallyMatched: true });
    } else {
      reasons[result.reason] = (reasons[result.reason] ?? 0) + 1;
      if (headwordHit || result.candidates) quarantine.push({ key: sense.key, entryId: sense.entryId, senseId: sense.senseId, english: sense.english, simplified: sense.simplified, pinyin: sense.pinyin, ...result, candidateEvidence: (index.get(normalizeEnglish(sense.english)) ?? []) });
    }
  }
  const result = { schema: 1, method: BULK_VERSION, reviewPolicySha256: hash(JSON.stringify(reviewPolicy)), corpusSha256: data.digest, baselineSha256: hash(readFileSync(storeFile)), baselineCount: baseline.records.length, sourceResults, headwordMatchedSenses: headwordKeys.size,
    distinctEnglishHeadwordMatches: new Set(data.senses.filter(s => headwordKeys.has(s.key)).map(s => normalizeEnglish(s.english))).size,
    highConfidenceSenseMatches: highConfidenceKeys.size, newProvisionalCandidates: records.length, existingWithAdditionalCandidates: additional.length,
    ambiguousSenses: quarantine.filter(r => !r.partiallyMatched).length, ambiguousMissingSenses: quarantine.filter(r => !r.partiallyMatched && !covered.has(r.key)).length, partialMatchesWithWithheldAlternatives: quarantine.filter(r => r.partiallyMatched).length,
    reasons, milliseconds: performance.now() - start, heapBytes: process.memoryUsage().heapUsed };
  atomicJSON(`${root}/candidates.json`, { schema: 1, corpusSha256: data.digest, records });
  result.candidatesSha256 = hash(readFileSync(`${root}/candidates.json`));
  atomicJSON(`${root}/additional-existing-candidates.json`, { records: additional });
  atomicJSON(`${root}/quarantine.json`, { instructions: 'Candidates are unassigned. Do not approve based on English headword alone.', records: quarantine });
  atomicJSON(`${root}/preparation.json`, result);
  console.log(JSON.stringify(result, (k, v) => k === 'batches' ? { count: v.length } : v, 2));
  return { result, records };
}

export function integrateBulk({ root = '.tmp/malay-datasets', promote = false } = {}) {
  const data = corpus(), prepared = read(`${root}/preparation.json`), incoming = read(`${root}/candidates.json`).records;
  const storeFile = 'scripts/data/malay-translations-v1.json', runtimeFile = 'src/data/malay-runtime.json';
  assert.equal(hash(readFileSync(`${root}/candidates.json`)), prepared.candidatesSha256, 'Prepared candidate batch changed');
  assert.equal(hash(JSON.stringify(reviewPolicy)), prepared.reviewPolicySha256, 'Review policy changed; prepare again');
  const oldStoreBytes = readFileSync(storeFile), oldRuntimeBytes = readFileSync(runtimeFile), baseline = JSON.parse(oldStoreBytes);
  // Resume is idempotent even after the asset has already been promoted.
  const existing = new Map(baseline.records.map(r => [r.key, r]));
  if (hash(oldStoreBytes) !== prepared.baselineSha256 && !incoming.every(r => JSON.stringify(existing.get(r.key)) === JSON.stringify(r))) throw Error('Authoritative store changed since preparation; prepare again.');
  assert.equal(prepared.corpusSha256, data.digest);
  assert.equal(new Set(incoming.map(r => r.key)).size, incoming.length);
  const senses = new Map(data.senses.map(s => [s.key, s]));
  for (const r of incoming) { assert(senses.has(r.key)); assert.deepEqual(qualityIssues(r, senses.get(r.key)), []); assert.equal(r.translationStatus, 'unreviewed'); if (existing.has(r.key)) assert.deepEqual(existing.get(r.key), r); }
  const dir = `${root}/isolated`; mkdirSync(dir, { recursive: true });
  const combined = [...baseline.records, ...incoming.filter(r => !existing.has(r.key))];
  atomicJSON(`${dir}/store.json`, { ...baseline, records: combined }); copyFileSync(runtimeFile, `${dir}/runtime.json`);
  const { asset, report } = buildMalay(data, `${dir}/store.json`, `${dir}/runtime.json`, { reports: false });
  const next = read(`${dir}/store.json`), nextMap = new Map(next.records.map(r => [r.key, r]));
  assert.equal(next.records.length, combined.length); assert.equal(report.rejected.length, 0); assert.equal(report.staleCount, 0);
  for (const r of baseline.records) assert.equal(JSON.stringify(nextMap.get(r.key)), JSON.stringify(r), 'Existing record changed');
  assert.deepEqual(asset.records, next.records.map(runtimeRecord));
  assert.equal(corpus().digest, data.digest);
  if (promote) {
    // Journal contains the independently restorable pre-write pair. If a crash
    // occurs between file renames, the next invocation refuses further writes
    // until this checksummed pair has been restored and validated.
    const journal = `${root}/promotion-journal.json`;
    if (existsSync(journal) && read(journal).state === 'pending') throw Error('Interrupted promotion: restore promotion-before-store/runtime.json and rerun validation.');
    copyFileSync(storeFile, `${root}/promotion-before-store.json`); copyFileSync(runtimeFile, `${root}/promotion-before-runtime.json`);
    atomicJSON(journal, { state: 'pending', storeSha256: hash(oldStoreBytes), runtimeSha256: hash(oldRuntimeBytes), targetVersion: next.version });
    try { atomicJSON(storeFile, next); atomicJSON(runtimeFile, asset); atomicJSON(journal, { state: 'complete', targetVersion: next.version }); }
    catch (error) { atomicJSON(storeFile, JSON.parse(oldStoreBytes)); atomicJSON(runtimeFile, JSON.parse(oldRuntimeBytes)); throw error; }
  }
  const result = { promoted: promote, before: baseline.records.length, added: combined.length - baseline.records.length, after: next.records.length, missing: data.senses.length - next.records.length, coveragePercent: next.records.length / data.senses.length * 100, existingPreserved: baseline.records.length, corpusSha256: data.digest, version: next.version, storeBytesBefore: oldStoreBytes.length, storeBytesAfter: statSync(`${dir}/store.json`).size, runtimeBytesBefore: oldRuntimeBytes.length, runtimeBytesAfter: statSync(`${dir}/runtime.json`).size };
  atomicJSON(`${root}/integration.json`, result);
  if (promote && !existsSync(`${root}/integration-first.json`)) atomicJSON(`${root}/integration-first.json`, result);
  console.log(JSON.stringify(result, null, 2)); return result;
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/bulk-dataset.mjs')) {
  const command = process.argv[2] ?? 'prepare';
  if (command === 'prepare') await prepareBulk();
  else if (command === 'integrate') integrateBulk({ promote: process.argv.includes('--promote-local') });
  else throw Error('Use prepare or integrate [--promote-local].');
}
