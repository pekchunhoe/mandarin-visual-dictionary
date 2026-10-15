import { readFileSync } from 'node:fs';
import { corpus } from './corpus.mjs';
import { atomicJSON } from './io.mjs';
import { qualityIssues } from './quality.mjs';
import { normalizeMalay } from '../../src/lib/malay-search.ts';
import { createHash } from 'node:crypto';

function tab(file, language) {
  const byLemma=new Map(), bySynset=new Map();
  for(const line of readFileSync(file,'utf8').split(/\r?\n/)) {
    if(!line || line.startsWith('#'))continue;
    const [synset,field,lemma]=line.split('\t');
    if(!lemma || ![`${language}:lemma`,'lemma'].includes(field))continue;
    const term=lemma.replaceAll('_',' ').trim();
    const key=term.toLowerCase();
    const sets=byLemma.get(key)??new Set();sets.add(synset);byLemma.set(key,sets);
    const terms=bySynset.get(synset)??[];if(!terms.includes(term))terms.push(term);bySynset.set(synset,terms);
  }
  return {byLemma,bySynset};
}
export function lexicalResources(root='.tmp/malay-lexical') {
  const manifest=JSON.parse(readFileSync(`${root}/download-manifest.json`,'utf8'));
  if (manifest.revision !== '406bf83b3c507a3d1f26e88252d5d66893fd36bf') throw new Error('Unqualified lexical revision. Reassess licensing and terminology before changing it.');
  for (const [file, expected] of Object.entries(manifest.files)) {
    const bytes = readFileSync(`${root}/${file}`);
    if (bytes.length !== expected.bytes || createHash('sha256').update(bytes).digest('hex') !== expected.sha256) throw new Error(`Lexical resource integrity failure: ${file}`);
  }
  return {revision:manifest.revision,english:tab(`${root}/wns/eng/wn-data-eng.tab`,'eng'),chinese:tab(`${root}/wns/cow/wn-data-cmn.tab`,'cmn'),malay:tab(`${root}/wns/msa/wn-data-zsm.tab`,'zsm')};
}
const loanwords=new Set(['atom','proton','neutron','nitrogen','virus','hospital','pen','bank','panda','durian','tomato']);
export function malayTermsForSynset(synset, resources) {
  const englishTerms=new Set((resources.english.bySynset.get(synset)??[]).map(normalizeMalay));
  const terms=(resources.malay.bySynset.get(synset)??[]).map(t=>t.replace(/\byg\b/g,'yang').replace(/\bsso\b/g,'seseorang').replace(/\bsst\b/g,'sesuatu'))
    .filter(t=>t && /^[\p{L}\p{N} ,'-]+$/u.test(t) && t.length<100 && (!englishTerms.has(normalizeMalay(t))||loanwords.has(normalizeMalay(t))))
    .filter(t=>!/\b(?:mobil|sepeda|kantor|rumah sakit|telepon|apotik|kulkas|handuk|gratis|obat|hewan|bebek|sapi|sumur|algoritme)\b/i.test(t));
  return [...new Set(terms)];
}
export function alignLexicalSense(sense, resources) {
  if(sense.idiom || /\b(?:fig\.|idiom|surname|variant|abbr\.|classifier|lit\.)/i.test(sense.english))return {reason:'needs-contextual-explanation'};
  let english=sense.english.replace(/^\((?:bound form|literary|coll\.|formal|informal)\)\s*/i,'').trim();
  const isVerb=/^to\s/.test(english);
  // Qualifiers and whole explanations are never silently discarded to create a match.
  if(/[()[\]|]/.test(english))return {reason:'unresolved-qualifier'};
  const clauses=english.split(/[;/]/).map(c=>c.trim().replace(/^to\s+/i,'').toLowerCase());
  if(!clauses.length || clauses.some(c=>!c || c.length>70))return {reason:'not-lexical'};
  const chinese=resources.chinese.byLemma.get(sense.simplified)??resources.chinese.byLemma.get(sense.traditional);
  if(!chinese)return {reason:'no-chinese-concordance'};
  let candidates=new Set(chinese);
  for(const clause of clauses) {
    const englishCandidates=resources.english.byLemma.get(clause);
    if(!englishCandidates)return {reason:'no-exact-english-lemma'};
    candidates=new Set([...candidates].filter(id=>englishCandidates.has(id)&&(!isVerb||id.endsWith('-v'))));
  }
  if(candidates.size!==1)return {reason:candidates.size?'ambiguous-synset':'no-common-synset'};
  const [synset]=candidates;
  const unique=malayTermsForSynset(synset, resources);
  if(!unique.length)return {reason:'no-usable-malaysian-lemma',synset};
  const malay=unique.slice(0,3).join('; ');
  const record={...sense,malay,malaySearchTerms:unique.slice(0,3),malaySynonyms:[],malayMorphology:[],
    translationSource:'Wordnet Bahasa (zsm), aligned through Chinese Open Wordnet and Princeton WordNet 3.0',
    translationLicense:'MIT; Chinese Open Wordnet license; Princeton WordNet 3.0 license; CC-BY-SA-4.0 corpus alignment',
    translationVersion:`omw-${resources.revision.slice(0,12)}-strict-1`,translationModel:'Exact three-language synset concordance',
    translationModelRevision:resources.revision,translationQuality:'automated-review-required',translationStatus:'generated',translationConfidence:0.75,
    translationNotes:`Unique synset ${synset}; every English clause and the Chinese spelling agree. Malaysian zsm lemmas only. Context/POS and language review still required.`,
    translationAlignment:{synset,englishClauses:clauses,method:'strict-chinese-and-all-english-clauses'},idiomExplanation:false};
  const issues=qualityIssues(record,sense);
  return issues.length ? {reason:'quality-rejected',issues,synset} : {record,synset};
}

if(process.argv[1]?.replaceAll('\\','/').endsWith('/lexical-alignment.mjs')) {
  const data=corpus(),resources=lexicalResources();
  const covered=new Set(JSON.parse(readFileSync('scripts/data/malay-translations-v1.json','utf8')).records.map(r=>r.key));
  const records=[],reasons={};
  for(const sense of data.senses) {
    if(covered.has(sense.key))continue;
    const result=alignLexicalSense(sense,resources);
    if(result.record)records.push(result.record);else reasons[result.reason]=(reasons[result.reason]??0)+1;
  }
  atomicJSON('.tmp/malay-lexical/candidates.json',{schema:1,corpusSha256:data.digest,resourceRevision:resources.revision,records});
  const cases=JSON.parse(readFileSync('.tmp/malay-benchmark/cases.json','utf8')).cases;
  atomicJSON('.tmp/malay-lexical/benchmark.json',{cases:cases.map(s=>({ ...s,result:alignLexicalSense(s,resources) }))});
  // Deterministic spread, rather than just the first alphabetically sorted candidates.
  atomicJSON('.tmp/malay-lexical/review-samples.json',{records:records.filter((_,i)=>i%Math.max(1,Math.floor(records.length/100))===0).slice(0,100)});
  console.log(JSON.stringify({candidateRecords:records.length,reasons,resourceRevision:resources.revision}));
}
