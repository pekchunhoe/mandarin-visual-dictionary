import { readFileSync, writeFileSync } from 'node:fs';
import { priorCandidates, read, saveJSON, DEEP_ROOT } from './deep-cache.mjs';
import { deepResources, qualifyRecovered, recoverAlignment, evidenceFor } from './deep-quality.mjs';
import { qualifyOffline } from './offline-quality.mjs';
import { hash } from './corpus.mjs';
const prior = priorCandidates(), resources = await deepResources();
const baseline = read(`${DEEP_ROOT}/recovery.json`), store = read('scripts/data/malay-translations-v1.json');
const covered = new Set(store.records.map(r => r.key));
const recovered = new Set(read(`${DEEP_ROOT}/recovered.json`).records.map(r => r.key));
function category(t) {
  if (t.idiom) return 'idiom';
  if (/\b(?:bank|light|charge|current|spring|right|match|set|run|break)\b/i.test(t.english)) return 'polysemy';
  if (t.english.length > 90) return 'long-definition';
  if (/\b(?:physics|chemistry|math|biology|computer|species|chemical|syndrome|acid|enzyme|function|electron|molecular|scientific)\b/i.test(t.english)) return 'technical';
  if (/^to /.test(t.english)) return 'verb';
  const a = recoverAlignment(t, resources); if (['adj', 'adv'].includes(a.pos)) return 'modifier';
  if ([...t.simplified].length === 1 && t.english.length > 20) return 'rare-or-bound';
  return 'common';
}
const quotas = { idiom: 40, polysemy: 50, 'long-definition': 40, technical: 60, verb: 100, modifier: 50, 'rare-or-bound': 40, common: 120 };
// A fixed 500-sense stratified pilot, selected by source key before new inference.
const groups = Object.fromEntries(Object.keys(quotas).map(k => [k, []]));
const available = prior.tasks.filter(t => !covered.has(t.key));
for (const t of available) groups[category(t)].push(t);
const pilot = [];
for (const [name, quota] of Object.entries(quotas)) {
  groups[name].sort((a, b) => a.key.localeCompare(b.key));
  pilot.push(...groups[name].slice(0, quota).map(t => ({ ...t, pilotCategory: name })));
}
const byKey = new Map(prior.rows.map(r => [r.key, r]));
const assessments = pilot.map(t => {
  const o = byKey.get(t.key), improved = qualifyRecovered(t, o, o.modelIdentity, resources), previous = qualifyOffline(t, o, o.modelIdentity, resources.policy);
  return { key: t.key, simplified: t.simplified, english: t.english, category: t.pilotCategory, output: o.text,
    previousAccepted: Boolean(previous.record), improvedAccepted: Boolean(improved.record), translationKind: improved.record?.translationKind,
    issues: improved.issues ?? [], referenceEvidence: improved.record?.translationAlignment ?? null, independentHumanApproved: false };
});
saveJSON(`${DEEP_ROOT}/cached-pilot.json`, { cases: assessments, categories: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, { available: v.length, sampled: pilot.filter(t => t.pilotCategory === k).length }])),
  casesCount: pilot.length, previousAccepted: assessments.filter(r => r.previousAccepted).length, improvedAccepted: assessments.filter(r => r.improvedAccepted).length,
  exactAlignment: true, independentHumanReviewed: 0, warning: 'Acceptance yield, not independently measured semantic accuracy. Unqualified cases remain withheld.' });
// Choose only tasks with at least one scoped, usable target reference. Never
// repeat old M2M100 inference just because the validation policy changed.
const eligible = [];
for (const t of available) {
  if (recovered.has(t.key) || prior.alternatives.get(t.key)?.some(a => a.model.model === 'facebook/m2m100_418M')) continue;
  const a = recoverAlignment(t, resources); if (!a.synset) continue;
  const targets = [...new Set([...(resources.lexical.malay.bySynset.get(a.synset) ?? []), ...a.clauses.flatMap(c => (resources.dictionaries.get(c) ?? []).map(r => r.malay))])]
    .filter(text => /^[\p{Script=Latin}\p{M}\p{N} ,'’()-]+$/u.test(text) && text.length < 120 && !evidenceFor(t, text, resources).issues);
  if (targets.length) eligible.push({ ...t, recoveryReferenceTerms: targets, recoveryAlignment: a });
}
eligible.sort((a, b) => a.key.localeCompare(b.key));
writeFileSync(`${DEEP_ROOT}/new-tasks.jsonl`, eligible.map(t => JSON.stringify(t)).join('\n') + '\n');
saveJSON(`${DEEP_ROOT}/new-plan.json`, { model: 'facebook/m2m100_418M', totalTasks: eligible.length, inputSha256: hash(readFileSync(`${DEEP_ROOT}/new-tasks.jsonl`)),
  previousUntranslated: baseline.assessedMissingSenses, skipPreviouslyInferred: true, skipRecovered: true,
  pilotLimit: Math.min(500, eligible.length), sourceCategory: 'New exact-sense/reference-eligible English meanings absent from the previous M2M100 workload.' });
console.log(JSON.stringify({ cachedPilot: assessments.length, cachedPilotAccepts: assessments.filter(r => r.improvedAccepted).length, newEligibleTasks: eligible.length }));
