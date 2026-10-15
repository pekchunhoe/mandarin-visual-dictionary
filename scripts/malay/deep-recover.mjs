import { readFileSync, writeFileSync } from 'node:fs';
import { priorCandidates, read, saveJSON, DEEP_ROOT } from './deep-cache.mjs';
import { deepResources, qualifyRecovered, recoverAlignment } from './deep-quality.mjs';
import { hash } from './corpus.mjs';
const start = performance.now(), prior = priorCandidates(), resources = await deepResources();
const bytes = readFileSync('scripts/data/malay-translations-v1.json'), store = JSON.parse(bytes), covered = new Set(store.records.map(r => r.key));
const candidates = [], withheld = [], reasons = {}, eligible = [];
for (let i = 0; i < prior.tasks.length; i++) {
  const task = prior.tasks[i]; if (covered.has(task.key)) continue;
  const possibilities = [{ task, output: prior.rows[i], model: prior.rows[i].modelIdentity }, ...prior.alternatives.get(task.key) ?? []];
  const results = possibilities.map(p => qualifyRecovered(p.task, p.output, p.model, resources));
  const record = results.find(r => r.record)?.record;
  if (record) candidates.push(record);
  else { const issues = [...new Set(results.flatMap(r => r.issues))]; for (const issue of issues) reasons[issue] = (reasons[issue] ?? 0) + 1; withheld.push({ key: task.key, issues }); }
  const alignment = recoverAlignment(task, resources);
  if (!record && alignment.synset) eligible.push({ ...task, recoveryAlignment: alignment });
}
saveJSON(`${DEEP_ROOT}/recovered.json`, { schema: 1, corpusSha256: prior.data.digest, records: candidates });
writeFileSync(`${DEEP_ROOT}/eligible-tasks.jsonl`, eligible.map(r => JSON.stringify(r)).join('\n') + '\n');
saveJSON(`${DEEP_ROOT}/recovery-withheld.json`, { records: withheld });
const report = { schema: 1, created: new Date().toISOString(), corpusSha256: prior.data.digest, baselineStoreSha256: hash(bytes), baselineRecords: store.records.length,
  assessedMissingSenses: candidates.length + withheld.length, recovered: candidates.length, lexicalEquivalents: candidates.filter(r => r.translationKind === 'lexical-equivalent').length, definitionTranslations: candidates.filter(r => r.translationKind === 'definition-translation').length,
  additionalInferenceEligible: eligible.length, withheld: withheld.length, reasons, seconds: (performance.now() - start) / 1000,
  candidatesSha256: hash(readFileSync(`${DEEP_ROOT}/recovered.json`)), independentlyHumanReviewed: 0 };
saveJSON(`${DEEP_ROOT}/recovery.json`, report);
console.log(JSON.stringify(report, null, 2));
