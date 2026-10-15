import { readFileSync, mkdirSync } from 'node:fs';
import { corpus } from './corpus.mjs';
import { atomicJSON } from './pipeline.mjs';
const data = corpus();
const definitions = JSON.parse(readFileSync('scripts/data/malay-benchmark-cases.json', 'utf8'));
const cases = definitions.cases.map((item, index) => {
  const matches = data.senses.filter(s => s.simplified === item.simplified && s.english === item.english && (!item.pinyin || s.pinyin === item.pinyin));
  if (matches.length !== 1) throw new Error(`Benchmark case ${index} is not uniquely sense-aligned (${matches.length}).`);
  return { ...matches[0], category:item.category, references:item.references };
});
mkdirSync('.tmp/malay-benchmark', { recursive:true });
atomicJSON('.tmp/malay-benchmark/cases.json', { version:definitions.version, corpusSha256:data.digest, referenceStatus:definitions.referenceStatus, cases });
atomicJSON('.tmp/malay-benchmark/direct-input.json', { texts:cases.map(s => s.simplified) });
// Gloss mode retains semantic qualifiers. No instruction text is prepended to
// a translation-only model; each separate sense remains a separate source.
atomicJSON('.tmp/malay-benchmark/english-input.json', { texts:cases.map(s => s.english) });
atomicJSON('.tmp/malay-benchmark/english-cleaned-input.json', { texts:cases.map(s => s.english.replace(/^\(bound form\)\s*/i,'').replace(/\(idiom\)/gi,'').replace(/\(?fig\.\)?\s*/gi,'figuratively: ').replace(/\(?lit\.\)?\s*/gi,'literally: ').replace(/\bsth\b/g,'something').replace(/\bsb\b/g,'someone').trim()) });
console.log(`Prepared ${cases.length} exact corpus senses for direct vs English-context evaluation.`);
