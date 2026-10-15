import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { loadRun } from './offline-prepare.mjs';
import { atomicJSON } from './io.mjs';
import { hash } from './corpus.mjs';
const root = '.tmp/malay-complete';
const source = `${root}/tasks.jsonl`, prefixFile = `${root}/full-hplt/checkpoint.json`;
const prefix = loadRun(`${root}/full-hplt`, source);
assert(prefix.rows.length > 0 && prefix.rows.length < prefix.tasks.length);
const tail = prefix.tasks.slice(prefix.rows.length), bytes = Buffer.from(tail.map(t => JSON.stringify(t)).join('\n') + '\n');
const plan = { schema: 1, originalInputSha256: hash(readFileSync(source)), prefixCheckpointSha256: hash(readFileSync(prefixFile)),
  preservedCompletedSenses: prefix.rows.length, remaining: tail.length, tailSha256: hash(bytes),
  reason: 'One-beam pilot was faster and passed more exact licensed reference concordance checks; outputs remain provisional and use the same import gate.',
  prefixBeamSize: 4, tailBeamSize: 1 };
if (existsSync(`${root}/tail-plan.json`)) assert.deepEqual(JSON.parse(readFileSync(`${root}/tail-plan.json`)), plan, 'Tail plan changed; do not repeat completed inference');
else { writeFileSync(`${root}/tasks-tail.jsonl`, bytes); atomicJSON(`${root}/tail-plan.json`, plan); }
console.log(JSON.stringify(plan, null, 2));
