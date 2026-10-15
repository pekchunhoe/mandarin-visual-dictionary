import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { hash } from './corpus.mjs';
import { read, saveJSON, DEEP_ROOT } from './deep-cache.mjs';
const preservation = read(`${DEEP_ROOT}/preservation.json`), forensics = read(`${DEEP_ROOT}/forensics.json`);
const backup = read(`${DEEP_ROOT}/backup.json`), before = read(`${backup.root}/project/scripts/data/malay-translations-v1.json`);
const store = read('scripts/data/malay-translations-v1.json'), keys = new Set(before.records.map(r => r.key)), added = store.records.filter(r => !keys.has(r.key));
const recoveredKeys = new Set(read(`${DEEP_ROOT}/recovered.json`).records.map(r => r.key));
const addedByKey = new Map(added.map(r => [r.key, r]));
const originalClassified = readFileSync(`${DEEP_ROOT}/classified-withheld.jsonl`, 'utf8').trim().split('\n').map(JSON.parse);
const outcomes = originalClassified.map(r => ({ key: r.key, originalEvidenceCategory: r.category,
  outcome: recoveredKeys.has(r.key) ? 'admitted-cached-provisional' : addedByKey.has(r.key) ? 'admitted-new-provisional' : 'withheld-semantic-or-scope-review',
  translationKind: addedByKey.get(r.key)?.translationKind, independentHumanVerified: false }));
writeFileSync(`${DEEP_ROOT}/recovery-outcomes.jsonl`, outcomes.map(r => JSON.stringify(r)).join('\n') + '\n');
const inventory = root => readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory()).flatMap(d => {
  let checkpoint; try { checkpoint = read(`${root}/${d.name}/checkpoint.json`); } catch { return []; }
  if (!checkpoint.identity || !checkpoint.shards) return [];
  let rows = [];
  for (const s of checkpoint.shards) { const bytes = readFileSync(`${root}/${d.name}/${s.file}`); if (hash(bytes) !== s.sha256) throw Error('Checkpoint integrity failure'); const batch = JSON.parse(bytes); if (batch.length !== s.records) throw Error('Checkpoint count failure'); rows.push(...batch); }
  if (rows.length !== checkpoint.completed) throw Error('Incomplete checkpoint inventory');
  return [{ directory: d.name, identity: checkpoint.identity, checkpointRows: rows.length, distinctInputContexts: new Set(rows.map(r => r.inferenceKey)).size,
    nonemptyRows: rows.filter(r => r.text.trim()).length, emptyRows: rows.filter(r => !r.text.trim()).length,
    inferenceFailureRows: rows.filter(r => r.issues.includes('local-inference-failed')).length, inferenceSeconds: checkpoint.inferenceSeconds, peakRssBytes: checkpoint.peakRssBytes }];
});
const previousRuns = inventory('.tmp/malay-complete'), newRuns = inventory(DEEP_ROOT);
const summary = { ...forensics, samples: undefined, previousCompleteRunCheckpoints: previousRuns,
  previousCompleteRunCheckpointRowsIncludingPilots: previousRuns.reduce((n, r) => n + r.checkpointRows, 0),
  fullClassificationLedgerSha256: hash(readFileSync(`${DEEP_ROOT}/classified-withheld.jsonl`)),
  finalOutcomeLedgerSha256: hash(readFileSync(`${DEEP_ROOT}/recovery-outcomes.jsonl`)),
  finalOutcomeCounts: Object.fromEntries([...new Set(outcomes.map(r => r.outcome))].map(outcome => [outcome, outcomes.filter(r => r.outcome === outcome).length])),
  recoveryAdmitted: added.filter(r => recoveredKeys.has(r.key)).length };
// Avoid treating aggregate warning counts as mutually exclusive semantic labels.
saveJSON('scripts/data/malay-deep-forensics.json', summary);
const cachedPilot = read(`${DEEP_ROOT}/cached-pilot.json`), lexical = read(`${DEEP_ROOT}/new-evaluation.json`), protectedPilot = read(`${DEEP_ROOT}/protected2-pilot.json`), protectedFull = read(`${DEEP_ROOT}/protected2-evaluation.json`);
const uniqueRelations = [...new Map(protectedFull.cases.map(c => [c.referenceRule, c])).values()];
saveJSON('scripts/data/malay-deep-evaluation.json', { schema: 1, independentlyHumanReviewed: 0,
  warning: 'Reference-based screening and assistant review, not a human gold benchmark or semantic accuracy estimate. The two Wiktionary extracts are mirrors of one source.',
  cachedStratifiedPilot: cachedPilot, lexicalReferenceHoldout: lexical,
  protectedDefinitionPilot: { ...protectedPilot, cases: undefined }, protectedDefinitionFull: { ...protectedFull, cases: uniqueRelations } });
const attribution = { schema: 1, license: 'CC-BY-SA-4.0 corpus additions, with retained model and lexical-resource notices',
  reviewStatus: 'All new meanings are machine-generated provisional; no independent human verification.',
  modelNotice: '/data/MALAY-OFFLINE-MODELS.json', lexicalNotice: '/data/MALAY-NOTICE.txt',
  definitionMethod: 'Bounded dictionary relation translations. Original Chinese citations and tone-number pinyin are preserved literally. Protected mode translates seven fixed relations, then restores per-sense opaque references; this is not independent semantic translation of every cited word.',
  maintainerGrammarAttribution: 'KANJIAN contributors; assistant-authored Malay grammar normalization and source protection, CC BY-SA 4.0.',
  lexicalRecords: added.filter(r => r.translationKind === 'lexical-equivalent').map(r => ({ key: r.key, chinese: r.entryId.split('|')[0], english: r.english, malay: r.malay,
    synset: r.translationAlignment.synset, sourcePages: [...new Set((r.translationAlignment.sources ?? []).map(s => s.url))], model: r.translationModel, revision: r.translationModelRevision })) };
saveJSON('public/data/MALAY-RECOVERY-ATTRIBUTION.json', attribution);
const esc = s => String(s).replaceAll('|', '\\|').replaceAll('\n', ' ').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
writeFileSync('KANJIAN_MALAY_RECOVERY_REVIEW_SHEET.md', '# KANJIAN — pending independent Malay review\n\nAll ' + added.length + ' additions are provisional. No row is approved. Check the complete Mandarin/English sense, Malaysian usage, grammatical role and translation type before approving; do not infer approval from model/reference agreement. Full IDs, original model inputs and raw outputs are in the authoritative store.\n\n| Sense key | Mandarin | English sense | Malay | Type | Human review |\n| --- | --- | --- | --- | --- | --- |\n' + added.map(r => [r.key, r.entryId.split('|')[0], r.english, r.malay, r.translationKind, 'Pending'].map(esc).join(' | ')).map(s => '| ' + s + ' |').join('\n') + '\n');
const sourceFiles = readdirSync('scripts/malay').filter(n => n.startsWith('deep-') || n === 'reference-definition.mjs').map(n => 'scripts/malay/' + n);
const manifest = { schema: 1, created: new Date().toISOString(), baselineGitSha: read(`${DEEP_ROOT}/baseline.json`).gitSha, ...preservation,
  recoveredPriorCandidates: read(`${DEEP_ROOT}/recovery.json`).recovered,
  newM2mRows: lexical.assessed, newM2mAccepted: lexical.accepted, protectedDefinitionRows: protectedFull.assessedSenses, protectedDefinitionAccepted: protectedFull.acceptedDefinitions,
  previousCandidateRows: forensics.allCheckpointOutputRows, previousCheckpointRowsIncludingPilots: previousRuns.reduce((n, r) => n + r.checkpointRows, 0),
  newCheckpointRowsIncludingFailedPilot: newRuns.reduce((n, r) => n + r.checkpointRows, 0), newRuns,
  sourceSha256: Object.fromEntries([...sourceFiles, 'scripts/data/malay-deep-review-policy.json', 'scripts/malay/offline-bulk.py', 'scripts/malay/offline-integrate.mjs', 'scripts/malay/quality.mjs'].map(f => [f, hash(readFileSync(f))])),
  translationApiCalls: 0, translationApiChargesUsd: 0, productionInference: false,
  validation: existsSync(`${DEEP_ROOT}/validation.json`) ? read(`${DEEP_ROOT}/validation.json`) : undefined,
  limitations: 'Coverage includes explicitly typed definitions and legacy unspecified records. All new meanings await independent language review. Withheld candidates are not all known incorrect.' };
saveJSON('scripts/data/malay-deep-recovery-manifest.json', manifest);
console.log(JSON.stringify({ added: added.length, kinds: preservation.addedKinds, previousCheckpointRows: manifest.previousCheckpointRowsIncludingPilots,
  newCheckpointRows: manifest.newCheckpointRowsIncludingFailedPilot, sourceFiles: sourceFiles.length }));
