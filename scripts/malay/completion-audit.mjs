import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { corpus, auditCorpus } from './corpus.mjs';
import { atomicJSON } from './io.mjs';
import { runtimeRecord, qualityIssues } from './quality.mjs';
import { MalaySearchIndex } from '../../src/lib/malay-search.ts';
const read = file => JSON.parse(readFileSync(file,'utf8'));
const data = corpus(), store = read('scripts/data/malay-translations-v1.json'), asset = read('src/data/malay-runtime.json');
const senses = new Map(data.senses.map(s=>[s.key,s]));
assert.deepEqual(asset.records,store.records.map(runtimeRecord));
assert.equal(new Set(store.records.map(r=>r.key)).size,store.records.length);
for (const r of store.records) assert.deepEqual(qualityIssues(r,senses.get(r.key)),[]);
const byEntry = new Map();
for (const r of store.records) {
  const s=senses.get(r.key);
  const word=byEntry.get(r.entryId)??{id:r.entryId,simplified:s.simplified,traditional:s.traditional,pinyin:s.pinyin,source:'CC-CEDICT',senses:[]};
  word.senses.push({id:r.senseId,english:r.english,...runtimeRecord(r),visualType:'abstract',examples:[]});
  byEntry.set(r.entryId,word);
}
const started=performance.now(), index=new MalaySearchIndex([...byEntry.values()]), buildMs=performance.now()-started;
for(const r of store.records) {
  assert(index.hasExact(r.malay),`Missing indexed term ${r.key}`);
  assert(index.search(r.malay,store.records.length).some(w=>w.id===r.entryId),`Missing translated entry ${r.key}`);
}
const previousFile='.tmp/full-malay-translations-before.json';
let preservedPrevious;
if(existsSync(previousFile)) {
  const before=read(previousFile), current=new Map(store.records.map(r=>[r.key,r]));
  for(const r of before.records)assert.deepEqual(current.get(r.key),r);
  preservedPrevious=before.records.length;
}
const newRecords=store.records.filter(r=>r.translationStatus==='generated');
const initialLexical=existsSync('.tmp/malay-lexical/candidates.json') ? read('.tmp/malay-lexical/candidates.json').records : [];
const acceptedKeys=new Set(store.records.map(r=>r.key));
const rejectedLexical=initialLexical.filter(r=>!acceptedKeys.has(r.key));
atomicJSON('.tmp/malay-qualified/rejected-lexical.json',{schema:1,status:'rejected',reason:'Not qualified for publication; terminology, sense/POS or Malaysia review required.',records:rejectedLexical.map(r=>({key:r.key,chinese:r.simplified,english:r.english,malay:r.malay,synset:r.translationAlignment.synset,status:'rejected'}))});
const sampleStep=Math.max(1,Math.floor(newRecords.length/100));
const linguisticSample=newRecords.filter((_,i)=>i%sampleStep===0).slice(0,100);
const report={...auditCorpus(data),accepted:store.records.length,acceptedAutomated:newRecords.length,humanVerified:store.records.filter(r=>r.translationStatus==='verified').length,automatedHighConfidence:store.records.filter(r=>r.translationQuality==='automated-high-confidence').length,requiringHumanReview:store.records.filter(r=>r.translationStatus!=='verified').length,missing:data.senses.length-store.records.length,coveragePercent:store.records.length/data.senses.length*100,preservedPrevious,generatedLexicalCandidates:initialLexical.length,rejectedLexicalCandidates:rejectedLexical.length,newExplicitExplanations:newRecords.filter(r=>r.idiomExplanation).length,acceptedTaggedIdioms:store.records.filter(r=>senses.get(r.key).idiom).length,allAcceptedTermsIndexed:true,allAcceptedEntriesRetrievable:true,indexBuildMs:buildMs,index:index.statistics(),runtimeBytes:Buffer.byteLength(JSON.stringify(asset)+'\n'),version:store.version};
atomicJSON('scripts/data/malay-completion-statistics.json',report);
atomicJSON('scripts/data/malay-linguistic-review.json',{status:'Independent human review pending',assessment:'Assistant-assessed candidates; automatic gates and sampling are not proof of semantic correctness. Confidence values are heuristics, not calibrated probabilities.',sampling:`${linguisticSample.length} generated records distributed by ordinal every ${sampleStep} records; initial 215 verb alignments also inspected before acceptance. Broad or wrong-sense alignments quarantined in qualified-adapter.mjs.`,records:linguisticSample,idiomExplanations:newRecords.filter(r=>r.idiomExplanation)});
console.log(JSON.stringify(report,null,2));
