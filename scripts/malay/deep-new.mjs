import { readFileSync } from 'node:fs';
import { loadRun } from './offline-prepare.mjs';
import { read, saveJSON, DEEP_ROOT } from './deep-cache.mjs';
import { deepResources, qualifyRecovered } from './deep-quality.mjs';
import { hash } from './corpus.mjs';
const pilot = process.argv.includes('--pilot');
const run = loadRun(`${DEEP_ROOT}/new-m2m100`, `${DEEP_ROOT}/new-tasks.jsonl`), resources = await deepResources();
const plan = read(`${DEEP_ROOT}/new-plan.json`);
if (run.rows.length < (pilot ? plan.pilotLimit : plan.totalTasks)) throw Error('Required inference partition incomplete');
const count = pilot ? plan.pilotLimit : run.tasks.length;
const model = { ...run.checkpoint.identity, license: 'MIT' }, records = [], cases = [];
for (let i = 0; i < count; i++) {
  const t = run.tasks[i], o = run.rows[i], r = qualifyRecovered(t, o, model, resources);
  if (r.record) records.push(r.record);
  cases.push({ key: t.key, simplified: t.simplified, pinyin: t.pinyin, english: t.english, output: o.text,
    accepted: Boolean(r.record), issues: r.issues ?? [], referenceTerms: t.recoveryReferenceTerms, alignment: t.recoveryAlignment,
    independentHumanApproval: false });
}
const report = { schema: 1, model, checkpointCompleted: run.rows.length, assessed: count, accepted: records.length, withheld: count - records.length,
  nonemptyOutputs: run.rows.filter(r => r.text.trim()).length, inferenceSeconds: run.checkpoint.inferenceSeconds, peakRssBytes: run.checkpoint.peakRssBytes,
  referencePolicy: 'Pinned Wordnet Bahasa/PWN/CWN and Malay Wiktionary, fixed before new model inference; not machine-generated references. Sense alignment remains automated and requires independent review.',
  independentlyHumanReviewed: 0, warning: 'Acceptance yield is not semantic accuracy. Known model errors and unsupported outputs remain withheld.', cases };
saveJSON(`${DEEP_ROOT}/${pilot ? 'new-pilot-evaluation' : 'new-evaluation'}.json`, report);
if (!pilot) saveJSON(`${DEEP_ROOT}/new-candidates.json`, { schema: 1, corpusSha256: read(`${DEEP_ROOT}/recovery.json`).corpusSha256, records });
console.log(JSON.stringify({ ...report, cases: undefined, candidatesSha256: !pilot ? hash(readFileSync(`${DEEP_ROOT}/new-candidates.json`)) : undefined }, null, 2));
