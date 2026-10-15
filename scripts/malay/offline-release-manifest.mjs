import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { hash } from './corpus.mjs';
const root = '.tmp/malay-complete';
const read = file => JSON.parse(readFileSync(file, 'utf8'));
const baseline = read(`${root}/baseline.json`), prepared = read(`${root}/preparation.json`), preserved = read(`${root}/preservation.json`);
const unit = read(`${root}/unit-final-results.json`), browser = read(`${root}/browser-final-results.json`);
assert(preserved.pass); assert.equal(unit.numFailedTests, 0); assert.equal(browser.stats.unexpected, 0); assert.equal(browser.stats.skipped, 0);
assert.equal(hash(readFileSync('scripts/data/malay-translations-v1.json')), preserved.storeSha256);
assert.equal(hash(readFileSync('src/data/malay-runtime.json')), preserved.runtimeSha256);
const sources = ['scripts/malay/prepare-hplt.py', 'scripts/malay/offline-bulk.py', 'scripts/malay/offline-quality.mjs', 'scripts/malay/offline-prepare.mjs',
  'scripts/malay/offline-integrate.mjs', 'scripts/malay/lexical-alignment.mjs', 'scripts/malay/quality.mjs',
  'scripts/data/malay-bulk-review-policy.json', 'scripts/data/malay-offline-review-policy.json', 'scripts/data/malay-offline-templates.json'];
const manifest = { schema: 1, created: new Date().toISOString(), baselineGitSha: baseline.gitSha, corpusSha256: baseline.corpusSha256,
  baselineStoreSha256: baseline.storeSha256, finalStoreSha256: preserved.storeSha256, finalRuntimeSha256: preserved.runtimeSha256,
  totalSenses: baseline.senses, originalPreserved: baseline.baselineRecords, fullWorkloadProcessed: prepared.processedSenses,
  nonemptyRawModelCandidates: prepared.nonemptyGeneratedSenses, importedProvisional: preserved.newProvisionalRecords,
  newLexicalEquivalents: preserved.newLexicalEquivalents, newEnglishDefinitionTranslations: preserved.newTranslatedDefinitions,
  finalStoredMeanings: preserved.storedTranslations, remaining: preserved.remaining, coveragePercent: preserved.coveragePercent,
  withheldSenses: prepared.quarantinedSenses, independentlyHumanVerified: 0, sourceCounts: prepared.sourceCounts,
  candidateFileSha256: prepared.candidatesSha256, originalWorkloadSha256: baseline.tasksSha256,
  identifiedEquivalentContexts: baseline.missing - baseline.uniqueInferenceContexts,
  modelRuns: prepared.inferenceRuns.flatMap(r => r.subRuns ?? [{ ...r, directory: r.identity.model.includes('m2m100') ? 'lexical-m2m100' : 'surname-hplt' }]).map(r => ({
    purpose: r.directory, ...r.identity, checkpointedSenses: r.completed, inferenceSeconds: r.inferenceSeconds, checkpointObservedPeakRssBytes: r.peakRssBytes })),
  sourceSha256: Object.fromEntries(sources.map(file => [file, hash(readFileSync(file))])),
  tests: { unitPassed: unit.numPassedTests, unitFiles: unit.testResults.length, browserPassed: browser.stats.expected, browserFailed: browser.stats.unexpected, browserSkipped: browser.stats.skipped, browserFlaky: browser.stats.flaky },
  translationApiCalls: 0, translationApiChargesUsd: 0, productionInference: false,
  limitations: 'All new outputs are machine-generated provisional additions requiring independent Mandarin–Malaysian Malay review. Reference matching and assistant screening do not establish general semantic accuracy. Withheld outputs include potentially correct but unqualified candidates.' };
writeFileSync('scripts/data/malay-offline-import-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ manifest: 'scripts/data/malay-offline-import-manifest.json', importedProvisional: manifest.importedProvisional, remaining: manifest.remaining }));
