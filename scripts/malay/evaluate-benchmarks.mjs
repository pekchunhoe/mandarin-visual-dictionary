import { readFileSync } from 'node:fs';
import { atomicJSON } from './io.mjs';
import { normalizeMalay } from '../../src/lib/malay-search.ts';
const read = file => JSON.parse(readFileSync(file,'utf8'));
const cases = read('.tmp/malay-benchmark/cases.json').cases;
// Exploratory assistant assessment, not human-reviewed gold scoring. Acceptable
// means all central meanings are preserved, Malaysia terminology is suitable,
// and an idiom explains the figurative sense rather than its English metaphor.
// Exact-match scores are reported separately and do NOT measure semantic truth.
const approaches = [
  ['OPUS Chinese default (no ms-MY selector)', 'direct-output.json', [0,1,2,3,8,16,22], 'Apache-2.0', false],
  ['OPUS English → zlm_Latn', 'english-output.json', [0,2,3,8,16], 'Apache-2.0', true],
  ['M2M100 Chinese → ms', 'm2m-zh-output.json', [0,1,2,3,8,16,19,20], 'MIT', true],
  ['M2M100 English sense → ms', 'm2m-en-output.json', [0,1,2,3,4,5,8,9,14,16,19,20,23,26,37], 'MIT', true],
  ['M2M100 cleaned English sense → ms', 'm2m-cleaned-output.json', [0,1,2,3,4,5,8,9,14,16,19,20,23,26,37], 'MIT', true]
];
const results = approaches.map(([name,file,acceptable,license,hasMalaySelector]) => {
  const output = read(`.tmp/malay-benchmark/${file}`), accepted = new Set(acceptable);
  if (output.outputs.length !== cases.length) throw new Error('Benchmark output is not sense-aligned.');
  const rows = cases.map((sense,i) => ({ key:sense.key, chinese:sense.simplified, english:sense.english, category:sense.category, references:sense.references, output:output.outputs[i].text, assistantAdequacy:accepted.has(i) ? 'acceptable-candidate' : 'fails-or-needs-correction', exactReferenceMatch:sense.references.some(r => normalizeMalay(r) === normalizeMalay(output.outputs[i].text)), empty:!output.outputs[i].text.trim(), hitLengthLimit:output.outputs[i].hitLengthLimit }));
  const idioms = rows.filter(r => r.category === 'idiom');
  return {name,model:output.model,revision:output.revision,license,hasMalaySelector,targetToken:output.targetToken,runtime:output.runtime,seconds:output.seconds,sensesPerSecond:cases.length/output.seconds,rssBytes:output.rssBytes,inputTokens:output.inputTokens,outputTokens:output.outputTokens,total:rows.length,assistantAcceptable:acceptable.length,assistantAcceptablePercent:acceptable.length/rows.length*100,acceptableIdiomCases:idioms.filter(r=>r.assistantAdequacy==='acceptable-candidate').length,totalIdiomCases:idioms.length,exactReferenceMatches:rows.filter(r=>r.exactReferenceMatch).length,eligibleForUnrestrictedBulk:false,rows};
});
atomicJSON('scripts/data/malay-model-benchmark-results.json',{schema:1,assessment:'Assistant assessment against independently authored sense references; exploratory, NOT independent human linguistic verification. Models were evaluated before publishing additions. No trained evaluator, BLEU or statistical population guarantee claimed.',gate:'Unrestricted bulk requires >=90% complete acceptable senses, no severe hallucination, and adequate sense/idiom performance. Every tested model fails decisively; no model-generated benchmark output is automatically imported.',cases:cases.length,results});
console.log(JSON.stringify(results.map(({rows,...summary})=>summary),null,2));
