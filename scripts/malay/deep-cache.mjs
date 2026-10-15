import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { corpus, hash } from './corpus.mjs';
import { loadRun } from './offline-prepare.mjs';

export const DEEP_ROOT = '.tmp/malay-deep';
export const read = path => JSON.parse(readFileSync(path, 'utf8'));
export function priorCandidates() {
  const root = '.tmp/malay-complete', baseline = read(`${root}/baseline.json`), plan = read(`${root}/bulk-plan.json`);
  const bytes = readFileSync(`${root}/tasks.jsonl`);
  assert.equal(hash(bytes), plan.originalInputSha256);
  const tasks = bytes.toString('utf8').trim().split('\n').map(JSON.parse), rows = [], runs = [];
  for (const part of plan.runs) {
    if (part.frozen) assert.equal(hash(readFileSync(`${root}/${part.directory}/checkpoint.json`)), part.checkpointSha256);
    const run = loadRun(`${root}/${part.directory}`, `${root}/${part.input}`);
    assert.equal(rows.length, part.offset); assert.equal(run.rows.length, part.count);
    rows.push(...run.rows.map(r => ({ ...r, modelIdentity: { ...run.checkpoint.identity, license: 'CC-BY-4.0' }, originalDirectory: part.directory })));
    runs.push({ directory: part.directory, ...run.checkpoint, shards: run.checkpoint.shards.length });
  }
  assert.equal(rows.length, baseline.missing);
  rows.forEach((r, i) => { assert.equal(r.key, tasks[i].key); assert.equal(r.inferenceKey, tasks[i].inferenceKey); });
  const alternatives = new Map();
  for (const [directory, input, license] of [['lexical-m2m100', 'lexical-tasks.jsonl', 'MIT'], ['surname-hplt', 'surname-tasks.jsonl', 'CC-BY-4.0']]) {
    const run = loadRun(`${root}/${directory}`, `${root}/${input}`);
    assert.equal(run.rows.length, run.tasks.length);
    run.rows.forEach((r, i) => { const group = alternatives.get(r.key) ?? []; group.push({ task: run.tasks[i], output: r, model: { ...run.checkpoint.identity, license } }); alternatives.set(r.key, group); });
    runs.push({ directory, ...run.checkpoint, shards: run.checkpoint.shards.length });
  }
  const data = corpus(), senses = new Map(data.senses.map(s => [s.key, s]));
  assert.equal(data.digest, baseline.corpusSha256);
  for (const task of tasks) { const sense = senses.get(task.key); assert(sense); for (const field of ['entryId', 'senseId', 'english', 'pinyin', 'simplified']) assert.equal(task[field], sense[field]); }
  return { data, tasks, rows, alternatives, runs };
}
export function saveJSON(path, value) { mkdirSync(DEEP_ROOT, { recursive: true }); writeFileSync(path, JSON.stringify(value, null, 2) + '\n'); }
