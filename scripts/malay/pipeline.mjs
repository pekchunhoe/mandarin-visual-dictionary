import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { corpus, auditCorpus, hash } from './corpus.mjs';
import { qualityIssues, runtimeRecord } from './quality.mjs';
import { normalizeMalay } from '../../src/lib/malay-search.ts';
import { atomicJSON } from './io.mjs';
export { atomicJSON } from './io.mjs';

const loadJSON = (file, fallback) => existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback;
const guards = { patient: ['病人', '患者'], heart: ['心脏'], old: ['旧', '陈旧'], too: [], short: ['短'], cold: ['冷', '寒冷'], hot: ['热', '炎热'], fast: ['快', '快速'], mouse: ['鼠', '老鼠'], to: [] };
export function editorialCandidates(data) {
  const glosses = loadJSON('scripts/data/malay-glosses.json');
  const overrides = loadJSON('scripts/data/malay-sense-overrides.json');
  const candidates = [];
  for (const sense of data.senses) {
    const override = overrides.records.find(o => o.simplified === sense.simplified && o.english === sense.english);
    const key = sense.english.toLowerCase();
    const generic = !sense.idiom && (!guards[key] || guards[key].includes(sense.simplified)) && glosses.glosses[key];
    if (!override && !generic) continue;
    const search = glosses.search[key];
    const malay = override?.malay ?? generic;
    candidates.push({ ...sense, malay,
      malaySearchTerms: override?.malaySearchTerms ?? search?.equivalents ?? malay.split(/[;,]/).map(t => t.trim()),
      malaySynonyms: override?.malaySynonyms ?? search?.synonyms ?? [],
      malayMorphology: override?.malayMorphology ?? search?.morphology ?? [],
      translationSource: override ? overrides.source : glosses.source, translationStatus: 'unreviewed',
      translationConfidence: override ? 0.9 : 0.8, translationLicense: 'CC-BY-SA-4.0',
      translationVersion: override ? overrides.version : glosses.version,
      translationNotes: sense.idiom || override?.idiomExplanation ? 'Figurative explanation; requires separate Malaysian Malay idiom review.' : 'Exact English sense candidate; Malaysian Malay human review pending.',
      idiomExplanation: override?.idiomExplanation ?? false
    });
  }
  // Preserve original learning translations, attaching only when the English sense matches.
  const learning = loadJSON('src/data/learning-runtime.json').words;
  const byEntry = new Map();
  for (const sense of data.senses) { const list = byEntry.get(sense.entryId) ?? []; list.push(sense); byEntry.set(sense.entryId, list); }
  for (const word of learning) for (const original of word.senses) {
    if (!original.malay?.trim()) continue;
    const aligned = byEntry.get(word.dictionaryId ?? word.id)?.filter(s => s.english === original.english) ?? [];
    for (const sense of aligned) {
      const position = candidates.findIndex(r => r.key === sense.key);
      const candidate = position >= 0 ? candidates[position] : undefined;
      const preserved = { ...candidate, ...sense, malay: original.malay,
      malaySearchTerms: [...new Set([...original.malay.split(/[;,]/).map(t => t.trim()), ...candidate?.malaySearchTerms ?? []])],
      translationSource: 'KANJIAN existing editorial learning collection', translationStatus: 'unreviewed',
      translationConfidence: 0.8, translationLicense: 'CC-BY-SA-4.0', translationVersion: 'learning-original-1',
      translationNotes: 'Preserved original learning gloss; no independent linguistic verification claimed.', idiomExplanation: false
      };
      if (position >= 0) candidates[position] = preserved; else candidates.push(preserved);
    }
  }
  return candidates;
}
export function buildMalay(data = corpus(), storeFile = 'scripts/data/malay-translations-v1.json', runtimeFile = 'src/data/malay-runtime.json', { reports = true } = {}) {
  const previousAsset = loadJSON(runtimeFile, { records: [] });
  const senseByKey = new Map(data.senses.map(s => [s.key, s]));
  const existing = loadJSON(storeFile, { records: [] });
  const records = new Map(); const rejected = []; const stale = [];
  // Preserve previous accepted content before considering new candidates.
  for (const record of [...existing.records, ...editorialCandidates(data)]) {
    const sense = senseByKey.get(record.key);
    if (!sense) { stale.push(record); continue; }
    const issues = qualityIssues(record, sense);
    if (issues.length) { rejected.push({ key: record.key, english: record.english, issues }); continue; }
    if (!records.has(record.key)) records.set(record.key, record);
  }
  const ordinal = (a, b) => a < b ? -1 : a > b ? 1 : 0;
  const accepted = [...records.values()].sort((a, b) => ordinal(a.entryId, b.entryId) || ordinal(a.senseId, b.senseId));
  const version = `ms-MY-v1-${hash(JSON.stringify(accepted)).slice(0, 12)}`;
  const store = { schema: 1, version, corpusSha256: data.digest, records: accepted };
  atomicJSON(storeFile, store);
  const asset = { schema: 1, version, corpusSha256: data.digest, records: accepted.map(runtimeRecord) };
  atomicJSON(runtimeFile, asset);
  const idioms = accepted.filter(r => senseByKey.get(r.key).idiom);
  const audit = auditCorpus(data);
  const normalizedTerms = new Set(accepted.flatMap(r => [r.malay, ...r.malaySearchTerms ?? [], ...r.malaySynonyms ?? [], ...r.malayMorphology ?? []]).map(normalizeMalay));
  const report = { ...audit, version, usableMalay: accepted.length, verified: accepted.filter(r => r.translationStatus === 'verified').length,
    automatedHighConfidence: accepted.filter(r => r.translationQuality === 'automated-high-confidence').length,
    requiringHumanReview: accepted.filter(r => r.translationStatus !== 'verified').length,
    generated: accepted.filter(r => r.translationStatus === 'generated').length, unreviewed: accepted.filter(r => r.translationStatus === 'unreviewed').length,
    missing: data.senses.length - accepted.length, coveragePercent: accepted.length / data.senses.length * 100,
    translatedIdiomSenses: idioms.length, idiomCoveragePercent: idioms.length / audit.idiomSenses * 100,
    normalizedMalayTerms: normalizedTerms.size, runtimeBytes: Buffer.byteLength(JSON.stringify(asset) + '\n'), rejected, staleCount: stale.length };
  if (reports) {
    const previousByKey = new Map(previousAsset.records.map(r => [r.key, r]));
    const currentKeys = new Set(asset.records.map(r => r.key));
    const changed = asset.records.filter(r => JSON.stringify(previousByKey.get(r.key)) !== JSON.stringify(r));
    // Development delta is applied through the existing lazy worker asset on
    // reload. Models, checkpoints and rejection ledgers never enter that asset.
    const deltaFile = `.tmp/malay-index-deltas/${previousAsset.version ?? 'initial'}--${version}.json`;
    if (changed.length || previousByKey.size !== currentKeys.size) atomicJSON(deltaFile, { schema: 1, fromVersion: previousAsset.version, toVersion: version, corpusSha256: data.digest, upserts: changed, removals: [...previousByKey.keys()].filter(k => !currentKeys.has(k)) });
    atomicJSON('.tmp/malay-coverage.json', report);
    atomicJSON('.tmp/malay-stale-translations.json', stale);
    const difficult = data.senses.filter(s => s.idiom && !records.has(s.key)).slice(0, 100);
    atomicJSON('scripts/data/malay-human-review-samples.json', { instructions: 'Review sense equivalence, Malaysia terminology and figurative meaning. Do not approve solely from automatic QA.', translatedIdioms: accepted.filter(r => r.idiom || r.idiomExplanation), unreviewedSamples: accepted.filter(r => !r.idiom && !r.idiomExplanation).slice(0, 100), missingIdiomSamples: difficult });
  }
  console.log(JSON.stringify({ ...report, rejected: rejected.length }, null, 2));
  return { asset, report };
}
export function exportQueue(file, data = corpus()) {
  const existing = loadJSON('scripts/data/malay-translations-v1.json', { records: [] });
  const covered = new Set(existing.records.map(r => r.key));
  const queue = data.senses.filter(s => !covered.has(s.key));
  mkdirSync(resolve(file, '..'), { recursive: true });
  writeFileSync(file, queue.map(s => JSON.stringify({ ...s, locale: 'ms-MY', instruction: s.idiom ? 'Explain the figurative meaning in Malaysian Malay; retain literal context separately. Do not invent a proverb equivalent.' : 'Translate this distinct English sense with Mandarin and pinyin context into concise Malaysian Malay. Preserve sense distinctions.' })).join('\n') + '\n');
  console.log(`Exported ${queue.length} individual senses to ${file}`);
}
export function importRecords(file, data = corpus()) {
  const incoming = loadJSON(file).records;
  if (!Array.isArray(incoming)) throw new Error('Import must contain a records array.');
  if (new Set(incoming.map(r => r.key)).size !== incoming.length) throw new Error('Import contains duplicate sense records.');
  const senses = new Map(data.senses.map(s => [s.key, s]));
  const invalid = incoming.flatMap(r => { const sense = senses.get(r.key); const issues = sense ? qualityIssues(r, sense) : ['unknown-sense']; return issues.length ? [{ key: r.key, issues }] : []; });
  if (invalid.length) throw new Error(`Import rejected atomically: ${JSON.stringify(invalid.slice(0, 10))}`);
  const previous = loadJSON('scripts/data/malay-translations-v1.json', { records: [] });
  const byKey = new Map(previous.records.map(r => [r.key, r]));
  for (const record of incoming) {
    const old = byKey.get(record.key);
    if (old && JSON.stringify(old) !== JSON.stringify(record) && old.translationStatus === 'verified') throw new Error(`Protected verified record ${record.key}; submit an explicit reviewed correction separately.`);
    if (!old || record.translationStatus === 'verified') byKey.set(record.key, record);
  }
  atomicJSON('scripts/data/malay-translations-v1.json', { ...previous, records: [...byKey.values()] });
  return buildMalay(data);
}
export async function generate(configPath, data = corpus()) {
  const config = loadJSON(configPath);
  if (config.enabled !== true || !config.adapter || !Number.isInteger(config.maxRecords) || config.maxRecords < 1) throw new Error('Generation requires enabled=true, a local adapter and a positive explicit maxRecords.');
  if (config.concurrency !== undefined && (!Number.isInteger(config.concurrency) || config.concurrency < 1 || config.concurrency > 8)) throw new Error('concurrency must be an integer between 1 and 8.');
  if (config.batchSize !== undefined && (!Number.isInteger(config.batchSize) || config.batchSize < 1 || config.batchSize > 100)) throw new Error('batchSize must be an integer between 1 and 100.');
  const concurrency = config.concurrency ?? 1;
  const batchSize = config.batchSize ?? 25;
  const paid = config.offline !== true;
  if (paid && (!Number.isFinite(config.maxCostUsd) || !(config.maxCostUsd > 0) || !Number.isFinite(config.maxBatchCostUsd) || !(config.maxBatchCostUsd > 0))) throw new Error('A network provider requires explicit maxCostUsd and a conservative maxBatchCostUsd ceiling.');
  const adapter = await import(pathToFileURL(resolve(config.adapter)).href);
  if (typeof adapter.translateBatch !== 'function' || !adapter.version || !adapter.source || !adapter.license) throw new Error('Adapter must export translateBatch, version, source and license.');
  const checkpointFile = config.checkpoint ?? '.tmp/malay-generation-checkpoint.json';
  const checkpoint = loadJSON(checkpointFile, { schema: 2, cache: {}, cacheFiles: [], costUsd: 0, reservedUsd: 0, pending: {}, inputTokens: 0, outputTokens: 0, errors: [] });
  checkpoint.reservedUsd ??= 0; checkpoint.pending ??= {};
  checkpoint.cacheFiles ??= []; checkpoint.cache ??= {};
  const rejectedKeys = new Set();
  const cacheDirectory = checkpointFile + '.batches';
  for (const name of checkpoint.cacheFiles) {
    const saved = loadJSON(resolve(cacheDirectory, name));
    Object.assign(checkpoint.cache, Object.fromEntries(saved.entries));
    for (const error of saved.errors ?? []) if (error.cacheKey) rejectedKeys.add(error.cacheKey);
  }
  // Migrate the earlier single-file checkpoint without losing cached work.
  if (checkpoint.schema === 1 && Object.keys(checkpoint.cache).length) {
    const name = `legacy-${hash(JSON.stringify(checkpoint.cache)).slice(0, 16)}.json`;
    atomicJSON(resolve(cacheDirectory, name), { entries: Object.entries(checkpoint.cache) });
    if (!checkpoint.cacheFiles.includes(name)) checkpoint.cacheFiles.push(name);
  }
  checkpoint.schema = 2;
  checkpoint.cacheSize = Object.keys(checkpoint.cache).length;
  checkpoint.errorCount ??= checkpoint.errors.length;
  const recordErrors = errors => { checkpoint.errorCount += errors.length; checkpoint.errors = [...checkpoint.errors, ...errors].slice(-1000); };
  const saveCheckpoint = () => {
    const { cache, ...manifest } = checkpoint;
    // Growing translation data lives in immutable batch files. The manifest
    // stays small, avoiding rewriting the whole corpus after every 25 senses.
    atomicJSON(checkpointFile, manifest);
  };
  const prior = loadJSON('scripts/data/malay-translations-v1.json', { records: [] });
  const covered = new Set(prior.records.filter(r => !config.regenerateUnreviewed || r.translationStatus === 'verified').map(r => r.key));
  const signature = hash(JSON.stringify([adapter.version, config.model ?? '', config.promptVersion ?? 'ms-MY-1', config.adapterOptions ?? {}]));
  const selected = config.selection ? loadJSON(config.selection).keys : undefined;
  const allKeys = new Set(data.senses.map(s => s.key));
  if (selected && (!Array.isArray(selected) || selected.some(k => typeof k !== 'string') || new Set(selected).size !== selected.length || selected.some(k => !allKeys.has(k)))) throw new Error('Selection requires unique, current sense keys.');
  const selectedKeys = selected ? new Set(selected) : undefined;
  const queue = data.senses.filter(s => !covered.has(s.key) && (!selectedKeys || selectedKeys.has(s.key))).slice(0, config.maxRecords);
  const batches = Array.from({ length: Math.ceil(queue.length / batchSize) }, (_, i) => queue.slice(i * batchSize, (i + 1) * batchSize));
  for (let at = 0; at < batches.length; at += concurrency) {
    const tasks = [];
    for (const batch of batches.slice(at, at + concurrency)) {
      const pendingKeys = new Set(Object.values(checkpoint.pending).flatMap(p => p.keys));
      const uncached = batch.filter(s => !checkpoint.cache[`${signature}:${s.key}`] && (config.retryRejected || !rejectedKeys.has(`${signature}:${s.key}`)) && !pendingKeys.has(s.key));
      if (!uncached.length) continue;
      const batchKey = hash(JSON.stringify([signature, uncached.map(s => s.key)]));
      if (checkpoint.pending[batchKey]) continue; // Unknown billing needs manual reconciliation.
      if (paid && checkpoint.costUsd + checkpoint.reservedUsd + config.maxBatchCostUsd > config.maxCostUsd) break;
      if (paid) {
        checkpoint.reservedUsd += config.maxBatchCostUsd;
        checkpoint.pending[batchKey] = { ceilingUsd: config.maxBatchCostUsd, keys: uncached.map(s => s.key) };
        saveCheckpoint(); // Persist budget BEFORE any provider request.
      }
      tasks.push((async () => {
        // Retries are allowed only for failures certified not billed by the adapter.
        for (let attempt = 0; attempt < 3; attempt++) try {
          const result = await adapter.translateBatch(uncached, { ...config.adapterOptions, locale: 'ms-MY', model: config.model, promptVersion: config.promptVersion, maxCostUsd: config.maxBatchCostUsd, attempt });
          if (!result || !Array.isArray(result.records)) throw new Error('Adapter must return a records array.');
          if (paid && (!Number.isFinite(result.usage?.costUsd) || result.usage.costUsd < 0 || result.usage.costUsd > config.maxBatchCostUsd)) throw new Error('Provider omitted usage or exceeded the declared batch ceiling.');
          for (const field of ['inputTokens', 'outputTokens']) if (result.usage?.[field] !== undefined && (!Number.isInteger(result.usage[field]) || result.usage[field] < 0)) throw new Error('Provider token usage must be a nonnegative integer.');
          if (result.usage?.costUsd !== undefined && (!Number.isFinite(result.usage.costUsd) || result.usage.costUsd < 0)) throw new Error('Invalid provider cost usage.');
          checkpoint.costUsd += result.usage?.costUsd ?? 0;
          if (paid) { checkpoint.reservedUsd -= config.maxBatchCostUsd; delete checkpoint.pending[batchKey]; }
          checkpoint.inputTokens += result.usage?.inputTokens ?? 0; checkpoint.outputTokens += result.usage?.outputTokens ?? 0;
          const returned = new Set();
          for (const candidate of result.records) {
            if (!uncached.some(s => s.key === candidate.key) || returned.has(candidate.key)) throw new Error('Adapter returned an unknown or duplicate sense key.');
            returned.add(candidate.key);
          }
          const batchEntries = [];
          const batchErrors = [];
          for (const candidate of result.records ?? []) {
            const sense = uncached.find(s => s.key === candidate.key);
            const record = { ...sense, ...candidate, translationSource: adapter.source, translationLicense: adapter.license, translationVersion: adapter.version, translationStatus: 'generated', translationQuality: 'automated-review-required', translationConfidence: candidate.translationConfidence ?? 0.6 };
            const issues = qualityIssues(record, sense);
            if (issues.length) batchErrors.push({ key: sense.key, issues });
            else {
              if (!checkpoint.cache[`${signature}:${sense.key}`]) checkpoint.cacheSize++;
              checkpoint.cache[`${signature}:${sense.key}`] = record; batchEntries.push([`${signature}:${sense.key}`, record]);
            }
          }
          const explicitRejections = new Map((result.rejections ?? []).map(r => [r.key, r.reason]));
          for (const sense of uncached) if (!returned.has(sense.key)) batchErrors.push({ key: sense.key, issues: [explicitRejections.get(sense.key) ?? 'provider-omitted-sense'] });
          for (const error of batchErrors) { error.cacheKey = `${signature}:${error.key}`; error.status = 'rejected'; rejectedKeys.add(error.cacheKey); }
          recordErrors(batchErrors);
          const name = `${batchKey}.json`;
          atomicJSON(resolve(cacheDirectory, name), { entries: batchEntries, errors: batchErrors });
          if (!checkpoint.cacheFiles.includes(name)) checkpoint.cacheFiles.push(name);
          saveCheckpoint(); return;
        } catch (error) {
          if (attempt === 2 || paid && error.notBilled !== true) {
            if (paid && error.notBilled === true) { checkpoint.reservedUsd -= config.maxBatchCostUsd; delete checkpoint.pending[batchKey]; }
            const errors = [{ keys: uncached.map(s => s.key), message: 'Adapter failed; inspect adapter locally. Credential-bearing errors are not persisted.' }];
            recordErrors(errors);
            const name = `${batchKey}-failure.json`;
            atomicJSON(resolve(cacheDirectory, name), { entries: [], errors });
            if (!checkpoint.cacheFiles.includes(name)) checkpoint.cacheFiles.push(name);
            saveCheckpoint(); return;
          }
          await new Promise(resolve => setTimeout(resolve, 250 * 2 ** attempt));
        }
      })());
    }
    await Promise.all(tasks);
    if (!tasks.length && paid && checkpoint.costUsd + checkpoint.reservedUsd + config.maxBatchCostUsd > config.maxCostUsd) break;
  }
  const currentSenses = new Map(data.senses.map(s => [s.key, s]));
  const queueKeys = new Set(queue.map(s => s.key));
  const output = Object.entries(checkpoint.cache).filter(([k]) => k.startsWith(signature + ':')).map(([, v]) => v).filter(r => queueKeys.has(r.key) && currentSenses.has(r.key) && qualityIssues(r, currentSenses.get(r.key)).length === 0);
  const outputFile = config.output ?? '.tmp/malay-generated-candidates.json';
  atomicJSON(outputFile, { schema: 1, records: output });
  console.log(JSON.stringify({ candidateRecords: output.length, costUsd: checkpoint.costUsd, reservedUsd: checkpoint.reservedUsd, inputTokens: checkpoint.inputTokens, outputTokens: checkpoint.outputTokens, errors: checkpoint.errorCount, outputFile }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [command = 'build', argument] = process.argv.slice(2);
  if (command === 'build') buildMalay();
  else if (command === 'queue' && argument) exportQueue(argument);
  else if (command === 'import' && argument) importRecords(argument);
  else if (command === 'generate' && argument) await generate(argument);
  else throw new Error('Usage: node scripts/malay/pipeline.mjs build | queue FILE.jsonl | import FILE.json | generate CONFIG.json');
}
