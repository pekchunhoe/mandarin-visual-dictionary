// @vitest-environment node
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it, vi } from 'vitest';
// @ts-expect-error maintenance module is native ESM
import { corpus } from '../scripts/malay/corpus.mjs';
// @ts-expect-error maintenance module is native ESM
import { buildMalay, generate } from '../scripts/malay/pipeline.mjs';
// @ts-expect-error maintenance module is native ESM
import { qualityIssues } from '../scripts/malay/quality.mjs';
const data = corpus();
const store = JSON.parse(readFileSync('scripts/data/malay-translations-v1.json', 'utf8'));
it('validates every accepted sense and has an honest incomplete coverage count', () => {
  const senses = new Map(data.senses.map((s: { key: string }) => [s.key, s]));
  for (const record of store.records) expect(qualityIssues(record, senses.get(record.key))).toEqual([]);
  expect(store.records.length).toBeLessThan(data.senses.length);
  expect(store.records.filter((r: { translationStatus: string }) => r.translationStatus === 'verified')).toHaveLength(0);
});
it('rejects copied English, placeholders, misalignment, wrong language, invalid Unicode and unsupported verification', () => {
  const sense = data.senses.find((s: { english: string }) => s.english === 'dog');
  const record = store.records.find((r: { key: string }) => r.key === sense.key);
  for (const malay of ['dog', 'TODO', 'the animal', 'mobil', '狗', '\uFFFD', '\uD800']) expect(qualityIssues({ ...record, malay }, sense).length).toBeGreaterThan(0);
  expect(qualityIssues({ ...record, english: 'cat' }, sense)).toContain('sense-misalignment');
  expect(qualityIssues({ ...record, translationStatus: 'verified' }, sense)).toContain('missing-reviewer');
  expect(qualityIssues({ ...record, translationSource: 'DBP verified' }, sense)).toContain('unsupported-dbp-attribution');
  const idiom = data.senses.find((s: { idiom: boolean }) => s.idiom);
  expect(qualityIssues({ ...record, ...idiom }, idiom)).toContain('idiom-needs-semantic-explanation');
});
it('builds deterministically and preserves reviewed records without modifying the original corpus', () => {
  const dir = mkdtempSync(resolve('.tmp/malay-build-test-'));
  const file = resolve(dir, 'store.json'), runtime = resolve(dir, 'runtime.json');
  const reviewed = { ...store.records[0], translationStatus: 'verified', translationReviewer: 'Fixture language reviewer' };
  writeFileSync(file, JSON.stringify({ records: [reviewed] }));
  vi.spyOn(console, 'log').mockImplementation(() => {});
  const first = buildMalay(data, file, runtime, { reports: false });
  const original = readFileSync(runtime, 'utf8');
  const second = buildMalay(data, file, runtime, { reports: false });
  expect(readFileSync(runtime, 'utf8')).toBe(original);
  expect(first.report.version).toBe(second.report.version);
  expect(second.asset.records.find((r: { key: string }) => r.key === reviewed.key)?.translationReviewer).toBe('Fixture language reviewer');
  expect(corpus().digest).toBe(data.digest);
  vi.restoreAllMocks();
}, 20000);
it('resumes cached offline batches, sanitizes failures and never labels model output verified', async () => {
  const dir = mkdtempSync(resolve('.tmp/malay-provider-test-'));
  const adapter = resolve(dir, 'adapter.mjs'), config = resolve(dir, 'config.json'), checkpoint = resolve(dir, 'checkpoint.json'), output = resolve(dir, 'output.json');
  writeFileSync(adapter, `export const version='fixture-1',source='Licensed offline fixture',license='CC-BY-SA-4.0';
    let calls=0; export async function translateBatch(senses) { if(++calls===1) throw new Error('secret credential must never be logged'); return { records:senses.map(s=>({key:s.key,malay:'makna ujian',idiomExplanation:true,translationStatus:'verified'})),usage:{inputTokens:12,outputTokens:3,costUsd:0} }; }`);
  writeFileSync(config, JSON.stringify({ enabled: true, offline: true, adapter, checkpoint, output, maxRecords: 3, batchSize: 2, concurrency: 1 }));
  vi.spyOn(console, 'log').mockImplementation(() => {});
  await generate(config, data);
  const first = JSON.parse(readFileSync(checkpoint, 'utf8'));
  expect(first.cacheSize).toBe(3); expect(first.cacheFiles).toHaveLength(2); expect(first.cache).toBeUndefined();
  expect(JSON.parse(readFileSync(output, 'utf8')).records.every((r: { translationStatus: string }) => r.translationStatus === 'generated')).toBe(true);
  await generate(config, data);
  expect(JSON.parse(readFileSync(checkpoint, 'utf8')).inputTokens).toBe(first.inputTokens);
  expect(readFileSync(checkpoint, 'utf8')).not.toContain('secret credential');
  writeFileSync(config, JSON.stringify({ enabled: true, offline: false, adapter, maxRecords: 3 }));
  await expect(generate(config, data)).rejects.toThrow('strict zero-cost');
  vi.restoreAllMocks();
});
it('rejects all network/budget configurations and legacy pending work before importing an adapter', async () => {
  const dir = mkdtempSync(resolve('.tmp/malay-budget-test-'));
  const adapter = resolve(dir, 'adapter.mjs'), config = resolve(dir, 'config.json'), checkpoint = resolve(dir, 'checkpoint.json'), output = resolve(dir, 'output.json');
  const marker = resolve(dir, 'adapter-loaded');
  writeFileSync(adapter, `import {writeFileSync} from 'node:fs'; writeFileSync(${JSON.stringify(marker)},'must not execute'); export const version='fixture',source='fixture',license='MIT'; export async function translateBatch(){throw Error('must not execute');}`);
  const settings = { enabled: true, adapter, checkpoint, output, maxRecords: 3 };
  for (const policy of [{ offline: false, maxCostUsd: 1, maxBatchCostUsd: 1 }, {}, { offline: true, maxCostUsd: 1 }, { offline: true, maxBatchCostUsd: 0.01 }]) {
    writeFileSync(config, JSON.stringify({ ...settings, ...policy }));
    await expect(generate(config, data)).rejects.toThrow('strict zero-cost');
    expect(existsSync(marker)).toBe(false);
  }
  const pending = JSON.stringify({ schema: 2, costUsd: 0, reservedUsd: 1, pending: { old: { keys: ['fixture'] } } });
  writeFileSync(checkpoint, pending); writeFileSync(config, JSON.stringify({ ...settings, offline: true }));
  await expect(generate(config, data)).rejects.toThrow('checkpoint is preserved');
  expect(readFileSync(checkpoint, 'utf8')).toBe(pending); expect(existsSync(marker)).toBe(false);
});

it('quarantines a non-zero usage claim without retrying or publishing candidates', async () => {
  const dir = mkdtempSync(resolve('.tmp/malay-cost-policy-'));
  const adapter = resolve(dir, 'adapter.mjs'), config = resolve(dir, 'config.json'), checkpoint = resolve(dir, 'checkpoint.json'), output = resolve(dir, 'output.json');
  writeFileSync(adapter, `export const version='cost-fixture',source='Local protocol fixture, no network',license='MIT'; export let calls=0; export async function translateBatch(senses,options){calls++;if(options.maxCostUsd!==0)throw Error('nonzero ceiling');return{records:senses.map(s=>({...s,malay:'makna ujian'})),usage:{costUsd:1}};}`);
  writeFileSync(config, JSON.stringify({ enabled: true, offline: true, adapter, checkpoint, output, maxRecords: 1 }));
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  await generate(config, data); await generate(config, data);
  const module = await import(new URL('file:///' + adapter.replaceAll('\\', '/')).href);
  expect(module.calls).toBe(1);
  expect(JSON.parse(readFileSync(output, 'utf8')).records).toEqual([]);
  expect(JSON.parse(readFileSync(checkpoint, 'utf8')).costUsd).toBe(0);
  log.mockRestore();
});
it('checkpoints rejections once, keeps them out of candidates, and invalidates cache when policy options change', async () => {
  const dir = mkdtempSync(resolve('.tmp/malay-rejection-test-'));
  const adapter = resolve(dir,'adapter.mjs'), config = resolve(dir,'config.json'), checkpoint = resolve(dir,'checkpoint.json'), output = resolve(dir,'output.json');
  writeFileSync(adapter, `export const version='rejection-fixture', source='Local fixture', license='CC-BY-SA-4.0'; export async function translateBatch(senses,options){return {records:options.allow ? senses.map(s=>({key:s.key,malay:'makna ujian',idiomExplanation:true,translationQuality:'human-verified'})):[],rejections:senses.map(s=>({key:s.key,reason:'semantic-rejection'})),usage:{costUsd:0}}}`);
  const settings = {enabled:true,offline:true,adapter,checkpoint,output,maxRecords:2,batchSize:1,adapterOptions:{allow:false}};
  writeFileSync(config,JSON.stringify(settings));
  await generate(config,data);
  const first = readFileSync(checkpoint,'utf8');
  expect(JSON.parse(readFileSync(output,'utf8')).records).toHaveLength(0);
  await generate(config,data);
  expect(readFileSync(checkpoint,'utf8')).toBe(first);
  writeFileSync(config,JSON.stringify({...settings,adapterOptions:{allow:true}}));
  await generate(config,data);
  const accepted = JSON.parse(readFileSync(output,'utf8')).records;
  expect(accepted).toHaveLength(2);
  expect(accepted.every((r: { translationQuality: string })=>r.translationQuality==='automated-review-required')).toBe(true);
  const key = accepted[0].key;
  const selection = resolve(dir,'selection.json'); writeFileSync(selection,JSON.stringify({keys:[key]}));
  writeFileSync(config,JSON.stringify({...settings,adapterOptions:{allow:true},selection}));
  await generate(config,data);
  expect(JSON.parse(readFileSync(output,'utf8')).records.map((r: {key:string})=>r.key)).toEqual([key]);
});
