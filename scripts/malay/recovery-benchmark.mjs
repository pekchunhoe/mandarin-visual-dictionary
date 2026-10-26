import { readFileSync, existsSync } from 'node:fs';
import { corpus, hash } from './corpus.mjs';
import { atomicJSON } from './io.mjs';
import { lexicalResources, alignLexicalSense } from './lexical-alignment.mjs';
import { normalizeMalay } from '../../src/lib/malay-search.ts';
const read=file=>JSON.parse(readFileSync(file,'utf8'));
const data=corpus(),resources=lexicalResources(),byKey=new Map(data.senses.map(s=>[s.key,s]));
const entryContext=new Map(data.rows.map(([trad,simp,pinyin,defs])=>[`${simp}|${trad}|${pinyin}`,defs]));
const cases=[];
function add(sense,category,references,referenceEvidence,referenceTier,extra={}) {
  if(cases.some(c=>c.key===sense.key))return;
  cases.push({...sense,caseId:`ms-${sense.key.slice(0,14)}`,category,partOfSpeech:extra.synset?.at(-1)??(/^(?:\([^)]*\)\s*)?to\s/.test(sense.english)?'verb-inferred':'unknown'),entryContext:entryContext.get(sense.entryId),references,referenceEvidence,referenceTier,referenceHumanApproved:false,...extra});
}
const old=read('scripts/data/malay-benchmark-cases.json').cases;
for(const item of old) {
  const matches=data.senses.filter(s=>s.simplified===item.simplified&&s.english===item.english&&(!item.pinyin||s.pinyin===item.pinyin));
  if(matches.length!==1)throw Error('Old benchmark not uniquely aligned.');
  add(matches[0],item.category,item.references,[{source:'Prior assistant-authored exploratory reference',license:'CC-BY-SA-4.0',path:'scripts/data/malay-benchmark-cases.json'}],'draft-human-review-required');
}
for(const item of read('scripts/data/malay-recovery-polysemy.json').cases) {
  const matches=data.senses.filter(s=>s.simplified===item.simplified&&s.pinyin===item.pinyin&&s.english===item.english);
  if(matches.length!==1)throw Error('Polysemy benchmark not uniquely aligned.');
  add(matches[0],'polysemy-and-grammar',item.references,[{source:'Assistant-authored exact-sense draft',license:'CC-BY-SA-4.0',path:'scripts/data/malay-recovery-polysemy.json'}],'draft-human-review-required');
}
const store=read('scripts/data/malay-translations-v1.json');
const idioms=store.records.filter(r=>r.idiomExplanation&&r.idiom&&!cases.some(c=>c.key===r.key)).sort((a,b)=>hash(a.key).localeCompare(hash(b.key))).slice(0,20);
for(const r of idioms)add(byKey.get(r.key),'idiom',[r.malay],[{source:r.translationSource,license:r.translationLicense,path:'scripts/data/malay-qualified-idioms.tsv'}],'draft-human-review-required');
if(cases.length!==80)throw Error(`Expected 80 difficult cases, found ${cases.length}.`);
// References are sourced BEFORE new model inference. Published candidates only
// select a sensible zsm equivalent; the independent licensed lexical evidence
// and the still-unreviewed alignment are exposed, never labelled human gold.
const selectedSynsets=new Set(cases.map(c=>alignLexicalSense(c,resources).synset).filter(Boolean));
const selectedEnglish=new Set(cases.map(c=>c.english));
const wiktionaryFile='.tmp/malay-recovery/wiktionary-malay.jsonl';
if(!existsSync(wiktionaryFile))throw Error('Download the licensed independent references first.');
const wikiManifest=read('.tmp/malay-recovery/wiktionary-manifest.json');
const normalizeEnglish=t=>t.toLowerCase().replace(/^(?:a|an|the|to) /,'').replace(/\.$/,'').trim();
const wiki=new Map();
for(const word of readFileSync(wiktionaryFile,'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse)) {
 if(word.lang_code!=='ms')continue;
 for(const s of word.senses??[]) {
  if(/Indonesia|obsolete|archaic|rare|dialect|nonstandard/i.test([...(s.tags??[]),...(s.raw_tags??[])].join(' ')))continue;
  for(const gloss of s.glosses??[]) {
   const key=normalizeEnglish(gloss),matches=wiki.get(key)??[];
   matches.push({word:word.word,pos:word.pos,gloss,tags:s.tags??[]});wiki.set(key,matches);
  }
 }
}
const unique=new Map(),covered=new Set(store.records.map(r=>r.key));
// Prefer missing senses: this evaluates the actual backlog rather than only
// words whose translations were selected by the previous editorial pipeline.
const sourceSenses=[...data.senses].sort((a,b)=>Number(covered.has(a.key))-Number(covered.has(b.key))||hash(a.key).localeCompare(hash(b.key)));
for(const sense of sourceSenses) {
 const concordance=alignLexicalSense(sense,resources),synset=concordance.synset;
 if(!synset||selectedSynsets.has(synset)||selectedEnglish.has(sense.english)||unique.has(synset))continue;
 const terms=new Set((resources.malay.bySynset.get(synset)??[]).map(normalizeMalay));
 const expectedPos={n:'noun',v:'verb',a:'adj',s:'adj',r:'adv'}[synset.at(-1)];
 const matches=(wiki.get(normalizeEnglish(sense.english))??[]).filter(w=>w.pos===expectedPos&&terms.has(normalizeMalay(w.word))&&/^[\p{L} '-]+$/u.test(w.word));
 if(!matches.length)continue;
 const preferred=store.records.find(r=>r.key===sense.key)?.malay;
 const witness=matches.find(m=>normalizeMalay(m.word)===normalizeMalay(preferred??''))??matches[0];
 unique.set(synset,{...sense,malay:witness.word,wiki:witness,translationAlignment:{synset}});
}
const candidates=[...unique.values()].sort((a,b)=>hash(a.key+'recovery-1').localeCompare(hash(b.key+'recovery-1')));
const technical=/\b(?:atom|acid|carbon|nitrogen|nuclear|electric|electron|circuit|laser|micro|diode|polymer|protein|syndrome|enzyme|isotope|chemical|galaxy|coefficient|decibel|amp|volt|photon)|(?:itis|osis|ology|metry|accharide|osterone|gen|phenol|oxide|chloride|benzene|aldehyde|onductor)\b/i;
const abstract=/\b(?:ethics|faith|belief|creed|enmity|hostility|hatred|prejudice|bias|sympathy|importance|opinion|ignorance|patriotism|mercy|pity|loyalty|dignity|virtue|pride|reputation|prestige|addiction|ambition|emotion|fear|panic|phobia|independence|poverty|imagination|equality|efficiency|justice|law|negligence|slavery|confidentiality|freedom|discrimination|achievement|serenity|success|failure|benefit|oppression|revenge|victory|conflict|ideology|personality|humanity|rationality|thought|defeat|delusion|trust|misfortune|initiative|relief|future|past|right|advantage|theory|concept|happiness|sadness|affection)\b/i;
const groups={modifier:[],verb:[],technical:[],abstract:[],everyday:[]};
for(const r of candidates) {
  const pos=r.translationAlignment.synset.at(-1);
  const category=['a','s','r'].includes(pos)?'modifier':pos==='v'?'verb':technical.test(r.english)?'technical':abstract.test(r.english)?'abstract':'everyday';
  groups[category].push(r);
}
const quotas={modifier:16,verb:70,technical:60,abstract:45,everyday:109};
const chosen=[];
for(const [category,quota] of Object.entries(quotas))chosen.push(...groups[category].slice(0,quota).map(r=>({r,category})));
for(const r of candidates)if(chosen.length<300&&!chosen.some(x=>x.r.key===r.key))chosen.push({r,category:'additional-lexical'});
if(chosen.length!==300)throw Error('Insufficient licensed lexical references for a 300-case panel.');
for(const {r,category} of chosen) {
  const synset=r.translationAlignment.synset;
  add(byKey.get(r.key),category,[r.malay],[{source:'English Wiktionary contributors, Malay sense via Kaikki/Wiktextract',word:r.wiki.word,englishGloss:r.wiki.gloss,partOfSpeech:r.wiki.pos,tags:r.wiki.tags,datasetSha256:wikiManifest.sha256,dump:wikiManifest.dump,url:`https://en.wiktionary.org/wiki/${encodeURIComponent(r.wiki.word)}#Malay`,license:'CC-BY-SA-4.0; original entries also GFDL'},{source:'Wordnet Bahasa zsm lemma',synset,revision:resources.revision,url:`https://github.com/omwn/omw-data/blob/${resources.revision}/wns/msa/wn-data-zsm.tab`,license:'MIT'},{source:'Chinese Open Wordnet and Princeton WordNet 3.0 exact-clause concordance',synset,license:'Chinese Open Wordnet license; Princeton WordNet 3.0 license'}],'licensed-cross-source-lexical-alignment-needs-review',{synset,previouslyMissing:!covered.has(r.key)});
}
const benchmark={schema:1,version:'ms-quality-recovery-1',corpusSha256:data.digest,created:'2026-10-15',referencePolicy:'300 exact-English/POS lexical references independently corroborated by Malay Wiktionary, Wordnet Bahasa, Chinese Open Wordnet and Princeton WordNet; plus 80 difficult drafts. Alignment and naturalness still require independent human approval. Inflected equivalents are allowed: dictionary lemmas are not exhaustive gloss answers. Exact-match counts are not semantic accuracy. References never enter candidate prompts.',cases};
benchmark.digest=hash(JSON.stringify(benchmark));
atomicJSON('scripts/data/malay-recovery-benchmark.json',benchmark);
atomicJSON('.tmp/malay-recovery/review-template.json',{schema:1,benchmarkDigest:benchmark.digest,reviewer:'',reviewerRole:'independent-human',referenceReviewComplete:false,ratings:cases.map(c=>({caseId:c.caseId,key:c.key,referenceApproved:false,referenceCorrection:null,candidates:[]}))});
console.log(JSON.stringify({cases:cases.length,licensedLexical:300,difficultDrafts:80,humanApproved:0,categories:cases.reduce((a,c)=>(a[c.category]=(a[c.category]??0)+1,a),{}),digest:benchmark.digest},null,2));
