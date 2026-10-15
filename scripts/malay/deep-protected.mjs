import { readFileSync, writeFileSync } from 'node:fs';
import { priorCandidates, read, saveJSON, DEEP_ROOT } from './deep-cache.mjs';
import { referenceSource, protectedReferenceInput } from './reference-definition.mjs';
import { hash } from './corpus.mjs';
const prior = priorCandidates(), store = read('scripts/data/malay-translations-v1.json'), covered = new Set(store.records.map(r => r.key));
const tag = process.argv.includes('--v2') ? 'protected2' : 'protected';
const tasks = prior.tasks.filter(t => !covered.has(t.key) && !t.idiom && referenceSource(t.english)).map(t => {
  const { rule, reference } = referenceSource(t.english), input = tag === 'protected2' ? protectedReferenceInput(rule) : rule.english + 'KANJIANREF';
  return { ...t, originalInferenceKey: t.inferenceKey, input, protectedReference: reference, referenceRule: rule.id,
    // The ONLY translated variable here is a fixed dictionary relation. The
    // citation is opaque, unmodified data, restored independently per sense ID.
    inferenceKey: hash(JSON.stringify(['protected-dictionary-reference-v1', rule.id, input])) };
});
// Interleave rules so the 500-sense pilot covers every eligible relation.
const groups = [...new Set(tasks.map(t => t.referenceRule))].map(rule => tasks.filter(t => t.referenceRule === rule).sort((a, b) => a.key.localeCompare(b.key)));
const ordered = []; for (let i = 0; ordered.length < tasks.length; i++) for (const group of groups) if (group[i]) ordered.push(group[i]);
writeFileSync(`${DEEP_ROOT}/${tag}-tasks.jsonl`, ordered.map(t => JSON.stringify(t)).join('\n') + '\n');
saveJSON(`${DEEP_ROOT}/${tag}-plan.json`, { totalSenses: ordered.length, uniqueRelationInputs: new Set(ordered.map(t => t.inferenceKey)).size,
  inputSha256: hash(readFileSync(`${DEEP_ROOT}/${tag}-tasks.jsonl`)), relations: Object.fromEntries(groups.map(g => [g[0].referenceRule, g.length])),
  method: 'Local MT of fixed dictionary relations with exact source citation protection and per-sense literal restoration. This is a bounded definition template, not general lexical translation.' });
console.log(JSON.stringify({ tasks: ordered.length, uniqueInputs: new Set(ordered.map(t => t.inferenceKey)).size }));
