import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { corpus, hash } from './corpus.mjs';
import { lexicalResources, alignLexicalSense } from './lexical-alignment.mjs';
import { atomicJSON } from './io.mjs';

const root = '.tmp/malay-complete';
mkdirSync(root, { recursive: true });
const data = corpus(), resources = lexicalResources();
const definitions = JSON.parse(readFileSync('.tmp/malay-datasets/sources/wordnet-definitions.json'));
const storeBytes = readFileSync('scripts/data/malay-translations-v1.json');
const store = JSON.parse(storeBytes), existing = new Set(store.records.map(r => r.key));
const contexts = new Map(data.rows.map(([trad, simp, pinyin, defs]) => [`${simp}|${trad}|${pinyin}`, defs]));
function task(sense) {
  const alignment = alignLexicalSense(sense, resources);
  // WordNet glosses also contain quotations/examples. They are not definitions
  // of this dictionary sense and must not be imported or translated as such.
  const definition = definitions[alignment.synset]?.split(/;?\s*"/)[0].replace(/;\s*$/, '').trim();
  // Append a licensed, sense-aligned definition when available. Do not concatenate
  // unrelated senses into the model input or issue chat instructions to an MT model.
  // Translate only the complete original sense. WordNet remains side evidence
  // for disambiguation/QA: its broad gloss can describe a different nuance and
  // the pilot showed that appending it produced incorrect extra definitions.
  const input = sense.english;
  const entryContext = contexts.get(sense.entryId);
  const semanticContext = [sense.simplified, sense.pinyin, sense.rawEnglish, entryContext, alignment.synset ?? null, input];
  return { ...sense, entryContext, lexicalDefinition: definition, partOfSpeech: alignment.synset?.at(-1) ?? (/^to\s/.test(sense.english) ? 'v-inferred' : 'unknown'),
    existingStatus: existing.has(sense.key) ? 'protected-existing' : 'missing', synset: alignment.synset,
    referenceTerms: alignment.record?.malaySearchTerms ?? [], input,
    translationKind: 'definition-translation', inferenceKey: hash(JSON.stringify(semanticContext)) };
}
const tasks = data.senses.filter(s => !existing.has(s.key)).map(task);
const panel = JSON.parse(readFileSync('scripts/data/malay-offline-benchmark.json'));
const pilot = panel.cases.map(c => ({ ...task(c), references: c.references, category: c.category, referenceEvidence: c.referenceEvidence, referenceHumanApproved: false }));
function jsonl(file, rows) { writeFileSync(file, rows.map(r => JSON.stringify(r)).join('\n') + '\n'); }
jsonl(`${root}/tasks.jsonl`, tasks); jsonl(`${root}/pilot.jsonl`, pilot);
atomicJSON(`${root}/baseline.json`, { schema: 1, created: new Date().toISOString(), gitSha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  corpusSha256: data.digest, storeSha256: hash(storeBytes), baselineRecords: store.records.length, senses: data.senses.length,
  missing: tasks.length, uniqueInferenceContexts: new Set(tasks.map(t => t.inferenceKey)).size,
  tasksSha256: hash(readFileSync(`${root}/tasks.jsonl`)), pilotSha256: hash(readFileSync(`${root}/pilot.jsonl`)),
  pilotCases: pilot.length, licensedReferenceCases: pilot.filter(t => t.referenceEvidence.some(e => e.source.includes('Wiktionary'))).length });
console.log(JSON.stringify({ tasks: tasks.length, pilot: pilot.length, contexts: new Set(tasks.map(t => t.inferenceKey)).size }));
