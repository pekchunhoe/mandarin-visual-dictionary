import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { loadRun } from './offline-prepare.mjs';
import { atomicJSON } from './io.mjs';
import { hash } from './corpus.mjs';
const root = '.tmp/malay-complete';
if (existsSync(`${root}/bulk-plan.json`)) throw Error('A bulk partition plan already exists. Resume its workers instead of partitioning again.');
const first = loadRun(`${root}/full-hplt`, `${root}/tasks.jsonl`);
const second = loadRun(`${root}/full-hplt-fast`, `${root}/tasks-tail.jsonl`);
const completed = first.rows.length + second.rows.length;
const tasks = first.tasks, remaining = tasks.slice(completed);
const baseline = JSON.parse(readFileSync(`${root}/baseline.json`));
assert.equal(tasks.length, baseline.missing); assert.equal(tasks.length + baseline.baselineRecords, baseline.senses);
assert(completed > 0 && remaining.length > 0);
second.rows.forEach((r, i) => assert.equal(r.key, tasks[first.rows.length + i].key));
// Observed CPU ~44 senses/s and GPU ~65 senses/s: proportional independent
// partitions use existing local hardware without changing either driver or plan.
const cpuCount = Math.floor(remaining.length * 0.4);
const cpu = remaining.slice(0, cpuCount), gpu = remaining.slice(cpuCount);
for (const [name, rows] of [['tasks-cpu-final.jsonl', cpu], ['tasks-gpu-final.jsonl', gpu]]) writeFileSync(`${root}/${name}`, rows.map(r => JSON.stringify(r)).join('\n') + '\n');
const runs = [
  { directory: 'full-hplt', input: 'tasks.jsonl', count: first.rows.length, checkpointSha256: hash(readFileSync(`${root}/full-hplt/checkpoint.json`)), frozen: true },
  { directory: 'full-hplt-fast', input: 'tasks-tail.jsonl', count: second.rows.length, checkpointSha256: hash(readFileSync(`${root}/full-hplt-fast/checkpoint.json`)), frozen: true },
  { directory: 'full-cpu-final', input: 'tasks-cpu-final.jsonl', count: cpu.length, device: 'cpu', precision: 'int8', beamSize: 1 },
  { directory: 'full-gpu-final', input: 'tasks-gpu-final.jsonl', count: gpu.length, device: 'cuda', precision: 'float32', beamSize: 1 }
];
let offset = 0; for (const run of runs) { run.offset = offset; offset += run.count; }
assert.equal(offset, tasks.length);
atomicJSON(`${root}/bulk-plan.json`, { schema: 1, originalInputSha256: hash(readFileSync(`${root}/tasks.jsonl`)), preservedCompleted: completed, cpuRemaining: cpu.length, gpuRemaining: gpu.length, runs });
console.log(JSON.stringify({ preservedCompleted: completed, cpuRemaining: cpu.length, gpuRemaining: gpu.length }));
