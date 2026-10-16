import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { deepResources, qualifyRecovered } from './deep-quality.mjs';
import { directLexical, lexicalPolicyIssue, ROOT, VERSION } from './lexical-enrichment.mjs';
import { loadRun } from './offline-prepare.mjs';
import { hash, corpus } from './corpus.mjs';
import { normalizeMalay } from '../../src/lib/malay-search.ts';
import { atomicJSON } from './io.mjs';
const read = file => JSON.parse(readFileSync(file, 'utf8'));
const panel = read('scripts/data/malay-offline-benchmark.json'), resources = await deepResources();
const previous = read('scripts/data/malay-offline-evaluation.json');
const senseMap = new Map(corpus().senses.map(s => [s.key, s]));
const baselineRecords = read(`${ROOT}/baseline-store.json`).records;
const initialAudit = new Map(read(`${ROOT}/audit.json`).records.map(r => [r.key, r]));
const storedAudit = baselineRecords.map(r => {
  const initial = initialAudit.get(r.key);
  if (initial.category === 'translated-definition') return initial;
  const concerns = r.malay.split(';').map(t => lexicalPolicyIssue(senseMap.get(r.key), t.trim(), resources, { strict: false }))
    .filter(issue => ['known-scope-or-locale-conflict', 'lexical-scope-locale-or-category-review'].includes(issue));
  return concerns.length ? { key: r.key, category: 'invalid-or-questionable', evidence: [...new Set(concerns)],
    note: 'Policy-based linguistic concern requiring review; not a proven error. Original stored content preserved.' } : initial;
});
atomicJSON(`${ROOT}/linguistic-audit.json`, { records: storedAudit });
const runs = ['pilot-hplt-v3', 'pilot-m2m100-v3'].map(name => ({ name, ...loadRun(`.tmp/malay-complete/${name}`, '.tmp/malay-complete/pilot.jsonl') }));
assert.equal(panel.cases.length, 380);
assert.equal(panel.cases.filter(c => c.referenceTier.startsWith('licensed-')).length, 300);
const start = performance.now();
const cases = panel.cases.map((sense, i) => {
  assert(runs.every(run => run.tasks[i].key === sense.key));
  const improved = directLexical(sense, resources);
  const refs = new Set(sense.references.flatMap(s => s.split(';')).map(normalizeMalay));
  const match = text => !!text && text.split(';').every(s => refs.has(normalizeMalay(s)));
  return { key: sense.key, chinese: sense.simplified, pinyin: sense.pinyin, english: sense.english, category: sense.category,
    referenceTier: sense.referenceTier, references: sense.references, referenceEvidence: sense.referenceEvidence,
    previous: runs.map(run => {
      const model = { ...run.checkpoint.identity, license: run.name.includes('m2m') ? 'MIT' : 'CC-BY-4.0' };
      const result = qualifyRecovered(run.tasks[i], run.rows[i], model, resources);
      return { model: model.model, text: run.rows[i].text, scopedGateAccepted: !!result.record,
        referenceLemmaMatch: match(run.rows[i].text), issues: result.issues ?? [] };
    }), improved: { text: improved.text ?? null, reason: improved.reason ?? null, referenceLemmaMatch: match(improved.text) }, humanApproved: false };
});
const stats = rows => ({ cases: rows.length, candidateLexical: rows.filter(c => c.improved.text).length,
  referenceLemmaMatches: rows.filter(c => c.improved.referenceLemmaMatch).length,
  nonmatchingCandidates: rows.filter(c => c.improved.text && !c.improved.referenceLemmaMatch).length,
  withheld: rows.filter(c => !c.improved.text).length,
  previous: runs.map((r, i) => ({ model: r.checkpoint.identity.model,
    scopedGateAccepted: rows.filter(c => c.previous[i].scopedGateAccepted).length, referenceLemmaMatches: rows.filter(c => c.previous[i].referenceLemmaMatch).length })) });
const result = { schema: 1, version: VERSION, corpusSha256: panel.corpusSha256,
  benchmarkSourceSha256: hash(readFileSync('scripts/data/malay-offline-benchmark.json')),
  previousEvaluationSha256: hash(readFileSync('scripts/data/malay-offline-evaluation.json')),
  limitation: '300 independently authored licensed dictionary references, 80 assistant drafts; zero independent human review. The extractor uses overlapping dictionary sources, so improved reference agreement is a consistency measure, not independent semantic accuracy. This panel is not a newly blinded holdout. Nonmatches can be valid alternatives; withheld cases are not proven false rejections.',
  storedAudit: { categories: storedAudit.reduce((a, r) => (a[r.category] = (a[r.category] ?? 0) + 1, a), {}),
    sha256: hash(readFileSync(`${ROOT}/linguistic-audit.json`)), questionableSenses: storedAudit.filter(r => r.category === 'invalid-or-questionable').map(r => r.key),
    humanReviewed: 0, meaningsChanged: 0 },
  all: stats(cases), licensed: stats(cases.filter(c => c.referenceTier.startsWith('licensed-'))), drafts: stats(cases.filter(c => !c.referenceTier.startsWith('licensed-'))),
  categories: Object.fromEntries([...new Set(cases.map(c => c.category))].map(k => [k, cases.filter(c => c.category === k).length])),
  elapsedSeconds: (performance.now() - start) / 1000, priorMeasuredModelConfigurations: previous.summaries,
  verifiedCheckpointInputs: runs.map(r => ({ name: r.name, identity: r.checkpoint.identity, completed: r.checkpoint.completed,
    checkpointSha256: hash(readFileSync(`.tmp/malay-complete/${r.name}/checkpoint.json`)), shardsVerified: r.checkpoint.shards.length })),
  semanticCorrectness: null, incorrectSenseAssignments: null, grammaticalQuality: null, malaysiaSuitability: null,
  correctExplanations: null, falseAcceptances: null, falseRejections: null, independentHumanReviewed: 0, newNeuralInferenceCalls: 0, costUsd: 0, cases };
atomicJSON('scripts/data/malay-lexical-evaluation.json', result);
const preparation = read(`${ROOT}/preparation.json`), incoming = read(`${ROOT}/candidates.json`).records;
atomicJSON('scripts/data/malay-lexical-manifest.json', { ...preparation, auditSha256: hash(readFileSync(`${ROOT}/audit.json`)),
  reviewQueueSha256: hash(readFileSync(`${ROOT}/review-queue.jsonl`)), evaluationSha256: hash(readFileSync('scripts/data/malay-lexical-evaluation.json')) });
const pageSources = evidence => [...(evidence.sources ?? []), ...(evidence.targetEvidence ?? []).flatMap(pageSources)];
atomicJSON('public/data/MALAY-LEXICAL-ATTRIBUTION.json', { schema: 1, version: VERSION,
  attribution: 'English Wiktionary contributors via Kaikki/Wiktextract and Mesolitica mirror (one source family); Wordnet Bahasa contributors; Chinese Open Wordnet; Princeton University WordNet; CC-CEDICT contributors. Adapted exact-sense additions CC BY-SA 4.0. Full original notices and licenses in MALAY-NOTICE.txt.',
  records: incoming.map(c => ({ key: c.record.key, chinese: c.record.entryId.split('|')[0], english: c.record.english,
    malay: c.record.malayLexical?.text ?? c.record.malay, method: c.evidence.method, pos: c.evidence.pos,
    sourceRecordKeys: c.evidence.targetKeys ?? [], sourcePages: [...new Set(pageSources(c.evidence).map(s => s.url))] })) });
const esc = s => String(s).replaceAll('|', '\\|').replaceAll(/\r?\n/g, ' ');
writeFileSync('KANJIAN_MALAY_LEXICAL_REVIEW_SHEET.md', '# Pending independent Malaysian Malay review\n\nEvery addition below is provisional. Check Mandarin/pinyin, exact English sense, grammatical role, Malaysian terminology and the linked source evidence. No automatic result is human approval. Uncertain and rejected alternatives remain in the hashed local review queue.\n\n| Sense key | Mandarin | English | Lexical equivalent | Preserved explanation | Human review |\n| --- | --- | --- | --- | --- | --- |\n' + incoming.map(c => '| ' + [c.record.key, c.record.entryId.split('|')[0], c.record.english, c.record.malayLexical?.text ?? c.record.malay, c.previousSha256 ? c.record.malay : '', 'Pending'].map(esc).join(' | ') + ' |').join('\n') + '\n');
const flagged = baselineRecords.filter(r => result.storedAudit.questionableSenses.includes(r.key));
writeFileSync(`${ROOT}/stored-review-queue.jsonl`, flagged.map(r => JSON.stringify({ key: r.key, chinese: r.entryId.split('|')[0], english: r.english, malay: r.malay, status: 'pending-independent-human-review', changed: false })).join('\n') + '\n');
writeFileSync('KANJIAN_MALAY_LEXICAL_REVIEW_SHEET.md', readFileSync('KANJIAN_MALAY_LEXICAL_REVIEW_SHEET.md', 'utf8') + '\n## Existing meanings flagged for review\n\nThese policy warnings are not findings of error. Every original field is preserved.\n\n| Sense key | Mandarin | English | Stored Malay | Review |\n| --- | --- | --- | --- | --- |\n' + flagged.map(r => '| ' + [r.key, r.entryId.split('|')[0], r.english, r.malay, 'Pending; unchanged'].map(esc).join(' | ') + ' |').join('\n') + '\n');
console.log(JSON.stringify({ all: result.all, licensed: result.licensed, categories: result.categories, elapsedSeconds: result.elapsedSeconds, independentHumanReviewed: 0 }, null, 2));
