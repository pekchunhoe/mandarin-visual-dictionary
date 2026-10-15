import { readFileSync } from 'node:fs';
import { corpus, hash } from './corpus.mjs';
import { loadRun } from './offline-prepare.mjs';
import { read, saveJSON, DEEP_ROOT } from './deep-cache.mjs';
import { qualifyRecovered } from './deep-quality.mjs';
import { referenceSource, protectedReferenceInput } from './reference-definition.mjs';
const pilot = process.argv.includes('--pilot'), tag = process.argv.includes('--v2') ? 'protected2' : 'protected', plan = read(`${DEEP_ROOT}/${tag}-plan.json`);
const run = loadRun(`${DEEP_ROOT}/${tag}-hplt`, `${DEEP_ROOT}/${tag}-tasks.jsonl`), data = corpus(), byKey = new Map(data.senses.map(s => [s.key, s]));
if (hash(readFileSync(`${DEEP_ROOT}/${tag}-tasks.jsonl`)) !== plan.inputSha256) throw Error('Changed protected workload');
const count = pilot ? Math.min(500, plan.totalSenses) : plan.totalSenses;
if (run.rows.length < count) throw Error('Incomplete protected-reference run');
const model = { ...run.checkpoint.identity, license: 'CC-BY-4.0' }, records = [], cases = [];
for (let i = 0; i < count; i++) {
  const t = run.tasks[i], o = run.rows[i], s = byKey.get(t.key), ref = referenceSource(s?.english ?? '');
  if (!s || t.english !== s.english || t.entryId !== s.entryId || t.senseId !== s.senseId || t.pinyin !== s.pinyin || !ref
    || t.protectedReference !== ref.reference || t.input !== (tag === 'protected2' ? protectedReferenceInput(ref.rule) : ref.rule.english + 'KANJIANREF')
    || t.inferenceKey !== hash(JSON.stringify(['protected-dictionary-reference-v1', ref.rule.id, t.input]))) throw Error('Protected definition alignment failure');
  const r = qualifyRecovered(t, o, model, {}); if (r.record) records.push(r.record);
  cases.push({ key: t.key, simplified: t.simplified, english: t.english, input: t.input, output: o.text, restoredMalay: r.record?.malay,
    referenceRule: t.referenceRule, accepted: Boolean(r.record), issues: r.issues ?? [], independentHumanApproval: false });
}
const report = { schema: 1, model, assessedSenses: count, acceptedDefinitions: records.length, withheld: count - records.length,
  distinctFixedRelationInputs: new Set(run.tasks.slice(0, count).map(t => t.input)).size, allCheckpointRows: run.rows.length,
  inferenceSeconds: run.checkpoint.inferenceSeconds, peakRssBytes: run.checkpoint.peakRssBytes, independentlyHumanReviewed: 0,
  warning: 'Fixed dictionary relations only. The original citation is opaque protected data restored per exact sense; these are definition translations, not lexical equivalents or independently human-reviewed meanings.', cases };
saveJSON(`${DEEP_ROOT}/${tag}-${pilot ? 'pilot' : 'evaluation'}.json`, report);
if (!pilot) saveJSON(`${DEEP_ROOT}/${tag}-candidates.json`, { schema: 1, corpusSha256: data.digest, records });
console.log(JSON.stringify({ ...report, cases: undefined }, null, 2));
