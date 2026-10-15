import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { corpus, hash } from './corpus.mjs';
import { atomicJSON } from './io.mjs';
import { qualifyOffline, OFFLINE_POLICY, offlinePolicy } from './offline-quality.mjs';
const root = '.tmp/malay-complete';
const read = file => JSON.parse(readFileSync(file, 'utf8'));
export function loadRun(directory, inputFile) {
  const checkpoint = read(`${directory}/checkpoint.json`), bytes = readFileSync(inputFile);
  if (checkpoint.identity.inputSha256 !== hash(bytes)) throw Error('Inference input hash mismatch');
  const tasks = bytes.toString('utf8').trim().split('\n').map(JSON.parse);
  const rows = checkpoint.shards.flatMap(shard => {
    const raw = readFileSync(`${directory}/${shard.file}`);
    if (hash(raw) !== shard.sha256) throw Error('Inference checkpoint shard hash mismatch');
    const records = JSON.parse(raw); if (records.length !== shard.records) throw Error('Shard cardinality mismatch'); return records;
  });
  if (rows.length !== checkpoint.completed || new Set(rows.map(r => r.key)).size !== rows.length) throw Error('Duplicate or missing output rows');
  rows.forEach((r, i) => { if (r.key !== tasks[i].key || r.inferenceKey !== tasks[i].inferenceKey) throw Error('Output alignment changed'); });
  return { tasks, rows, checkpoint };
}
export function prepareOffline() {
  const baseline = read(`${root}/baseline.json`), data = corpus();
  if (baseline.corpusSha256 !== data.digest) throw Error('Corpus changed');
  let full;
  if (existsSync(`${root}/bulk-plan.json`)) {
    const plan = read(`${root}/bulk-plan.json`), tasksBytes = readFileSync(`${root}/tasks.jsonl`);
    if (hash(tasksBytes) !== plan.originalInputSha256) throw Error('Partition workload changed');
    const tasks = tasksBytes.toString('utf8').trim().split('\n').map(JSON.parse), rows = [], subRuns = [];
    for (const part of plan.runs) {
      if (part.frozen && hash(readFileSync(`${root}/${part.directory}/checkpoint.json`)) !== part.checkpointSha256) throw Error('Frozen inference checkpoint changed');
      const run = loadRun(`${root}/${part.directory}`, `${root}/${part.input}`);
      if (run.rows.length !== part.count || rows.length !== part.offset) throw Error(`Partition incomplete: ${part.directory}`);
      rows.push(...run.rows.map(r => ({ ...r, modelIdentity: run.checkpoint.identity, beamSize: run.checkpoint.identity.beamSize })));
      subRuns.push({ ...run.checkpoint, directory: part.directory, shards: run.checkpoint.shards.length });
    }
    if (rows.length !== tasks.length || new Set(rows.map(r => r.key)).size !== rows.length) throw Error('Partition coverage or duplicate failure');
    rows.forEach((r, i) => { if (r.key !== tasks[i].key || r.inferenceKey !== tasks[i].inferenceKey) throw Error('Partition sense alignment failure'); });
    full = { tasks, rows, checkpoint: { identity: { model: subRuns[0].identity.model, revision: subRuns[0].identity.revision }, completed: rows.length,
      inferenceSeconds: subRuns.reduce((n, r) => n + r.inferenceSeconds, 0), peakRssBytes: Math.max(...subRuns.map(r => r.peakRssBytes)),
      shards: [], subRuns } };
  } else full = loadRun(`${root}/full-hplt`, `${root}/tasks.jsonl`);
  if (!existsSync(`${root}/bulk-plan.json`) && existsSync(`${root}/tail-plan.json`)) {
    const plan = read(`${root}/tail-plan.json`);
    if (hash(readFileSync(`${root}/full-hplt/checkpoint.json`)) !== plan.prefixCheckpointSha256) throw Error('Preserved prefix changed after decoder transition');
    const tail = loadRun(`${root}/full-hplt-fast`, `${root}/tasks-tail.jsonl`);
    if (tail.rows.length !== plan.remaining || full.rows.length !== plan.preservedCompletedSenses) throw Error('Bulk continuation incomplete');
    const rows = [...full.rows.map(r => ({ ...r, beamSize: 4 })), ...tail.rows.map(r => ({ ...r, beamSize: 1 }))];
    rows.forEach((r, i) => { if (r.key !== full.tasks[i].key || r.inferenceKey !== full.tasks[i].inferenceKey) throw Error('Continuation sense alignment mismatch'); });
    full = { ...full, rows, checkpoint: { identity: { ...full.checkpoint.identity, beamSize: [4, 1] }, completed: rows.length,
      inferenceSeconds: full.checkpoint.inferenceSeconds + tail.checkpoint.inferenceSeconds,
      peakRssBytes: Math.max(full.checkpoint.peakRssBytes, tail.checkpoint.peakRssBytes), shards: [...full.checkpoint.shards, ...tail.checkpoint.shards],
      subRuns: [full.checkpoint, tail.checkpoint].map(c => ({ ...c, shards: c.shards.length })) } };
  }
  if (full.rows.length !== baseline.missing) throw Error(`Bulk inference incomplete: ${full.rows.length}/${baseline.missing}`);
  const secondary = loadRun(`${root}/lexical-m2m100`, `${root}/lexical-tasks.jsonl`);
  if (secondary.rows.length !== secondary.tasks.length) throw Error('Secondary inference incomplete');
  const annotations = loadRun(`${root}/surname-hplt`, `${root}/surname-tasks.jsonl`);
  if (annotations.rows.length !== annotations.tasks.length) throw Error('Surname annotation inference incomplete');
  const policy = offlinePolicy();
  const incoming = new Map(), reasons = {}, quarantine = [], sourceCounts = {};
  const secondaryByKey = new Map(secondary.rows.map(r => [r.key, r]));
  const annotationByKey = new Map(annotations.rows.map((r, i) => [r.key, { output: r, task: annotations.tasks[i] }]));
  for (let i = 0; i < full.tasks.length; i++) {
    const task = full.tasks[i], first = full.rows[i];
    const candidates = [[first, { ...(first.modelIdentity ?? full.checkpoint.identity), license: 'CC-BY-4.0' }, task]];
    if (secondaryByKey.has(task.key)) candidates.push([secondaryByKey.get(task.key), { ...secondary.checkpoint.identity, license: 'MIT' }, task]);
    if (annotationByKey.has(task.key)) {
      const a = annotationByKey.get(task.key);
      if (a.task.originalInferenceKey !== task.inferenceKey || a.task.entryId !== task.entryId || a.task.senseId !== task.senseId || a.task.english !== task.english
        || a.task.input !== `Family name: ${task.english.slice(8)}.`) throw Error('Surname preprocessing changed the original sense/name');
      candidates.push([a.output, { ...annotations.checkpoint.identity, license: 'CC-BY-4.0' }, a.task]);
    }
    const results = candidates.map(([output, model, sourceTask]) => qualifyOffline(sourceTask, output, model, policy));
    const accepted = results.find(r => r.record)?.record;
    if (accepted) { incoming.set(task.key, accepted); sourceCounts[accepted.translationModel] = (sourceCounts[accepted.translationModel] ?? 0) + 1; }
    else {
      const issues = [...new Set(results.flatMap(r => r.issues))];
      for (const issue of issues) reasons[issue] = (reasons[issue] ?? 0) + 1;
      quarantine.push({ key: task.key, issues, outputs: candidates.map(([r, m, t]) => ({ text: r.text, input: t.input, model: m.model, revision: m.revision, runtime: m.runtime, quantization: m.quantization, device: m.device ?? 'cpu' })) });
    }
  }
  const records = [...incoming.values()];
  atomicJSON(`${root}/candidates.json`, { schema: 1, corpusSha256: data.digest, records });
  writeFileSync(`${root}/quarantine.jsonl`, quarantine.map(r => JSON.stringify(r)).join('\n') + '\n');
  const report = { schema: 1, policy: OFFLINE_POLICY, corpusSha256: data.digest, baselineStoreSha256: baseline.storeSha256, baselineRecords: baseline.baselineRecords,
    processedSenses: full.rows.length, nonemptyGeneratedSenses: full.rows.filter(r => r.text.trim()).length,
    eligibleLexicalContexts: secondary.tasks.length, secondaryInferenceAttempts: secondary.rows.length, usableProvisionalCandidates: records.length,
    surnameAnnotationAttempts: annotations.rows.length, surnameAnnotationsQualified: records.filter(r => r.translationKind === 'definition-translation').length,
    lexicalEquivalentsQualified: records.filter(r => r.translationKind === 'lexical-equivalent').length,
    quarantinedSenses: quarantine.length, reasons, sourceCounts, humanVerified: 0,
    candidatesSha256: hash(readFileSync(`${root}/candidates.json`)), policySha256: hash(readFileSync('scripts/data/malay-bulk-review-policy.json')),
    offlineReviewPolicySha256: hash(readFileSync('scripts/data/malay-offline-review-policy.json')), templatesSha256: hash(readFileSync('scripts/data/malay-offline-templates.json')),
    inferenceRuns: [full, secondary, annotations].map(r => ({ ...r.checkpoint, shards: r.checkpoint.shards.length })) };
  atomicJSON(`${root}/preparation.json`, report); console.log(JSON.stringify(report, null, 2)); return report;
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/offline-prepare.mjs')) {
  if (process.argv[2] === 'lexical-queue') {
    const tasks = readFileSync(`${root}/tasks.jsonl`, 'utf8').trim().split('\n').map(JSON.parse).filter(t => t.synset && t.referenceTerms.length);
    mkdirSync(root, { recursive: true }); writeFileSync(`${root}/lexical-tasks.jsonl`, tasks.map(t => JSON.stringify(t)).join('\n') + '\n'); console.log(JSON.stringify({ lexicalTasks: tasks.length }));
  } else prepareOffline();
}
