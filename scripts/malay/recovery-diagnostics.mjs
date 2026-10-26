import { readFileSync } from 'node:fs';
import { corpus } from './corpus.mjs';
import { lexicalResources, alignLexicalSense } from './lexical-alignment.mjs';
import { qualityIssues } from './quality.mjs';
import { atomicJSON } from './io.mjs';
const data=corpus(),senses=new Map(data.senses.map(s=>[s.key,s]));
const prior=JSON.parse(readFileSync('scripts/data/malay-model-benchmark-results.json','utf8'));
const results=prior.results.map(method=>{
 const rows=method.rows.map(row=>{
  const sense=senses.get(row.key);
  const record={...sense,malay:row.output,translationSource:method.model,translationVersion:method.revision,translationLicense:method.license,translationStatus:'generated',translationConfidence:0.5,idiomExplanation:row.category==='idiom'};
  const flags=qualityIssues(record,sense);
  return {...row,structuralFlags:flags,structurallyAccepted:flags.length===0,assessmentSource:'Previous exploratory assistant judgment; not independent human ground truth'};
 });
 return {name:method.name,model:method.model,revision:method.revision,total:rows.length,formatPassButAssistantAssessedWrongOrIncomplete:rows.filter(r=>r.structurallyAccepted&&r.assistantAdequacy!=='acceptable-candidate').length,assistantAcceptableButStructurallyFlagged:rows.filter(r=>!r.structurallyAccepted&&r.assistantAdequacy==='acceptable-candidate').length,rows};
});
const resources=lexicalResources();
const loans=new Set(['laser','internet','hotel','radio','video','drama','audit','bonus','data','formula','zoo','status','dialog','dialogue','log','ion','protein','modem','radar','hormon','golf','jazz']);
const examples=[];
for(const sense of data.senses) {
 if(!loans.has(sense.english.toLowerCase())||examples.some(e=>e.english===sense.english))continue;
 const alignment=alignLexicalSense(sense,resources);
 if(!alignment.synset)continue;
 const term=(resources.malay.bySynset.get(alignment.synset)??[]).find(t=>t.toLowerCase()===sense.english.toLowerCase());
 if(!term)continue;
 const record={...sense,malay:term,translationSource:'Licensed zsm concordance diagnostic',translationVersion:resources.revision,translationLicense:'MIT',translationStatus:'generated',translationConfidence:0.5};
 examples.push({key:sense.key,chinese:sense.simplified,english:sense.english,malay:term,synset:alignment.synset,flags:qualityIssues(record,sense),classification:'Reference-supported loanword rejection candidate; confirm Malaysia usage and exact sense before granting a scoped exception',source:`https://github.com/omwn/omw-data/blob/${resources.revision}/wns/msa/wn-data-zsm.tab`});
}
const vocab={};
for(const name of ['zh-ms','en-mul']) {
 const v=JSON.parse(readFileSync(`.tmp/malay-models/${name}/vocab.json`,'utf8'));
 const config=JSON.parse(readFileSync(`.tmp/malay-models/${name}/config.json`,'utf8'));
 vocab[name]={actualLanguageTokens:Object.keys(v).filter(k=>/^>>.*<<$/.test(k)),decoderStartTokenId:config.decoder_start_token_id,eosTokenId:config.eos_token_id,padTokenId:config.pad_token_id};
}
atomicJSON('scripts/data/malay-recovery-diagnostics.json',{schema:1,oldModelsRetested:false,vocabulary:vocab,structuralVersusSemantic:results,referenceSupportedLoanwordRejections:examples,configurationFinding:'M2M100 source language and forced Malay target prefix match the documented encoder/decoder convention. No demonstrated M2M100 configuration fix justified retesting. Contributions of int8 quantization were not isolated from base-model quality.',gateFinding:'Structural validation is necessary but cannot establish semantic fidelity. Prior hard-coded assistant pass lists are exploratory annotations, not a reusable or human-certified evaluator. No global quality gate was weakened.'});
console.log(JSON.stringify({methods:results.map(({rows,...summary})=>summary),loanwordExamples:examples,vocabulary:vocab},null,2));
