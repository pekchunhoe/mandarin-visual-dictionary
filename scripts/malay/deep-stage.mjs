import { readFileSync, mkdirSync } from 'node:fs';
import { read, saveJSON, DEEP_ROOT } from './deep-cache.mjs';
import { corpus, hash } from './corpus.mjs';
import { integrateOffline } from './offline-integrate.mjs';
const phase = process.argv.includes('--new') ? 'new' : 'recovery';
const source = `${DEEP_ROOT}/${phase === 'new' ? 'combined-candidates' : 'recovered'}.json`, payload = read(source);
const current = readFileSync('scripts/data/malay-translations-v1.json'), data = corpus();
const dir = `${DEEP_ROOT}/${phase}-import`; mkdirSync(dir, { recursive: true });
const policyFiles = ['scripts/malay/deep-quality.mjs', 'scripts/malay/reference-definition.mjs', 'scripts/data/malay-deep-review-policy.json'];
if (!process.argv.includes('--resume')) {
  saveJSON(`${dir}/candidates.json`, payload);
  saveJSON(`${dir}/preparation.json`, { schema: 1, corpusSha256: data.digest, baselineStoreSha256: hash(current), baselineRecords: JSON.parse(current).records.length,
    processedSenses: data.senses.length - JSON.parse(current).records.length,
    processingMeaning: 'Complete missing-sense reassessment; this field is not a new neural inference count.',
    usableProvisionalCandidates: payload.records.length, candidatesSha256: hash(readFileSync(`${dir}/candidates.json`)),
    policySha256: hash(readFileSync('scripts/data/malay-bulk-review-policy.json')),
    offlineReviewPolicySha256: hash(readFileSync('scripts/data/malay-offline-review-policy.json')), templatesSha256: hash(readFileSync('scripts/data/malay-offline-templates.json')),
    additionalSourceSha256: Object.fromEntries(policyFiles.map(file => [file, hash(readFileSync(file))])) });
}
integrateOffline({ root: dir, promote: process.argv.includes('--promote-local') });
