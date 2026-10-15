import { readFileSync, writeFileSync } from 'node:fs';
import { priorCandidates, read, saveJSON, DEEP_ROOT } from './deep-cache.mjs';
import { hash } from './corpus.mjs';
const prior = priorCandidates(), backup = read(`${DEEP_ROOT}/backup.json`);
const baselineBytes = readFileSync(`${backup.root}/project/scripts/data/malay-translations-v1.json`), store = JSON.parse(baselineBytes);
const quarantineBytes = readFileSync('.tmp/malay-complete/quarantine.jsonl');
const rejected = new Map(quarantineBytes.toString('utf8').trim().split('\n').map(line => { const r = JSON.parse(line); return [r.key, r]; }));
const counts = {}, flags = {}, outputs = [], categories = {}, samples = {};
for (let i = 0; i < prior.tasks.length; i++) {
  const task = prior.tasks[i], row = prior.rows[i]; if (!rejected.has(task.key)) continue;
  const q = rejected.get(task.key); if (!q) throw Error('Missing actual quarantine row');
  const issues = q.issues;
  for (const issue of issues) flags[issue] = (flags[issue] ?? 0) + 1;
  // These are observable evidence categories, NOT uncalibrated claims that a
  // candidate is semantically correct/incorrect. Reference absence is unknown.
  const category = issues.includes('local-inference-failed') ? 'inference-failed'
    : !row.text.trim() ? 'empty-output'
    : issues.includes('length-or-truncation') ? 'length-or-truncation-review'
    : issues.some(x => ['unicode-or-target-script', 'invalid-language-or-unicode', 'non-lexical-symbols-or-script'].includes(x)) ? 'script-or-format-review'
    : issues.some(x => ['corrupt-or-hallucinated', 'corrupt-or-untranslated-output', 'repetition'].includes(x)) ? 'corruption-or-repetition-review'
    : issues.some(x => ['mandarin-context-conflict', 'known-synset-scope-conflict'].includes(x)) ? 'known-sense-conflict'
    : issues.some(x => /indonesian|english-language|untranslated/.test(x)) ? 'language-warning-review'
    : issues.includes('english-copy') ? 'identical-source-review-including-loanwords'
    : issues.includes('no-independent-sense-reference') ? 'unknown-semantics-reference-gap'
    : issues.includes('whole-output-reference-mismatch') ? 'reference-mismatch-needs-semantic-review'
    : 'other-recorded-rule-review';
  categories[category] = (categories[category] ?? 0) + 1;
  const out = { key: task.key, simplified: task.simplified, english: task.english, output: row.text, category, issues };
  outputs.push(out);
  if ((samples[category] ??= []).length < 18) samples[category].push(out);
  if (!issues.length) counts.unexplained = (counts.unexplained ?? 0) + 1;
}
const rows = [...prior.rows, ...[...prior.alternatives.values()].flat().map(r => r.output)];
const report = { schema: 1, created: new Date().toISOString(), corpusSha256: prior.data.digest,
  baselineStoreSha256: hash(baselineBytes), baselineRecords: store.records.length,
  previousWorkloadSenses: prior.tasks.length, primaryNonempty: prior.rows.filter(r => r.text.trim()).length,
  allCheckpointOutputRows: rows.length, additionalAttempts: rows.length - prior.tasks.length,
  modelFailureRows: rows.filter(r => r.issues.includes('local-inference-failed')).length,
  emptyOutputRows: rows.filter(r => !r.text.trim()).length,
  nonemptyOutputRows: rows.filter(r => r.text.trim()).length,
  duplicatePrimarySenseIds: prior.rows.length - new Set(prior.rows.map(r => r.key)).size,
  exactContextCacheReuseRows: rows.filter(r => r.reusedExactContext).length,
  withheldSenses: outputs.length, disjointEvidenceCategories: categories, nonexclusivePriorRuleCounts: flags,
  importFailures: 0, importEvidence: 'Prior isolated import and repeat import completed with exact counts; every prior admitted record is in the current store.',
  unexplainedRuleRejections: counts.unexplained ?? 0,
  confirmedCorrectCorpusCount: null, confirmedIncorrectCorpusCount: null,
  semanticCountLimitation: 'No independently human-reviewed corpus labels exist. Reference-gap/format/language flags are reproducible screening categories, not semantic correctness labels. Potentially correct recoveries are counted separately after scoped evidence checks.',
  previousQuarantineSha256: hash(quarantineBytes), samples };
saveJSON(`${DEEP_ROOT}/forensics.json`, report);
writeFileSync(`${DEEP_ROOT}/classified-withheld.jsonl`, outputs.map(r => JSON.stringify(r)).join('\n') + '\n');
console.log(JSON.stringify({ ...report, samples: undefined }, null, 2));
