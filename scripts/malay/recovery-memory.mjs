import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { corpus, hash } from './corpus.mjs';
import { lexicalResources, alignLexicalSense } from './lexical-alignment.mjs';
import { atomicJSON } from './io.mjs';

export function contextKey(sense, entryMeanings) {
  // Same English alone is NEVER a memory identity. Retain pronunciation, full
  // neighbouring sense context, original qualifiers and figurative status.
  return hash(JSON.stringify([sense.simplified, sense.pinyin, sense.rawEnglish, sense.english, sense.idiom, entryMeanings]));
}
export function semanticKey(sense, synset) {
  if (!synset || sense.idiom) return null;
  return hash(JSON.stringify([sense.english, synset, synset.at(-1), sense.idiom]));
}
export function reusableMemory(record, sense, context) {
  return Boolean(record.reviewStatus === 'human-verified' && record.verifiedMalay?.trim()
    && record.reviewerRole === 'independent-human' && !!record.reviewer?.trim()
    && !/assistant|model|codex|automated|gpt/i.test(record.reviewer)
    && record.english === sense.english && record.contextKey === context
    && record.approvedSenseKeys?.includes(sense.key));
}
const add = (map,key,value) => { const group=map.get(key)??[]; group.push(value); map.set(key,group); };
const chars = values => values.reduce((n,s)=>n+[...s.english].length,0);
export function prepareMemory() {
  const data=corpus(),resources=lexicalResources();
  const store=JSON.parse(readFileSync('scripts/data/malay-translations-v1.json','utf8'));
  const byKey=new Map(store.records.map(r=>[r.key,r]));
  const meanings=new Map(data.rows.map(([trad,simp,pinyin,defs])=>[`${simp}|${trad}|${pinyin}`,defs]));
  const missing=data.senses.filter(s=>!byKey.has(s.key));
  const exact=new Map(),strict=new Map(),semantic=new Map(),memory=[];
  const collisions=new Map();
  let alignedMissing=0;
  for (const sense of data.senses) {
    const context=contextKey(sense,meanings.get(sense.entryId));
    const result=alignLexicalSense(sense,resources);
    const synset=result.synset, pos=synset?.at(-1) ?? (/^(?:\([^)]*\)\s*)?to\s/.test(sense.english)?'verb-inferred':'unknown');
    const semanticId=semanticKey(sense,synset);
    if (!byKey.has(sense.key)) {
      add(exact,sense.english,sense); add(strict,context,sense);
      add(semantic,semanticId??context,sense); if(semanticId)alignedMissing++;
    }
    if (['firm','bank','film','to charge','to draw','to open','head'].includes(sense.english)) add(collisions,sense.english,{key:sense.key,chinese:sense.simplified,pinyin:sense.pinyin,synset:synset??null,contextKey:context});
    const old=byKey.get(sense.key);
    if(old)memory.push({id:hash(JSON.stringify([sense.key,context])),senseKey:sense.key,english:sense.english,rawEnglish:sense.rawEnglish,mandarin:{simplified:sense.simplified,traditional:sense.traditional,pinyin:sense.pinyin},partOfSpeech:pos,partOfSpeechSource:synset?'WordNet 3.0 synset':pos==='unknown'?'not available':'English to-infinitive heuristic',synset:synset??null,contextKey:context,semanticKey:semanticId,entryContext:meanings.get(sense.entryId),candidateMalay:old.malay,verifiedMalay:old.translationStatus==='verified'?old.malay:null,source:old.translationSource,license:old.translationLicense,sourceVersion:old.translationVersion,confidence:old.translationConfidence,reviewStatus:old.translationStatus==='verified'?'human-verified':'provisional',reviewer:old.translationReviewer??null,reviewerRole:null,approvedSenseKeys:[],automaticReuseAllowed:false});
  }
  const verified=memory.filter(r=>r.reviewStatus==='human-verified');
  const strictGroups=[...strict.values()], semanticGroups=[...semantic.values()];
  const englishTasks=[...exact.values()].map(g=>g[0]);
  const report={schema:1,corpusSha256:data.digest,totalSenses:data.senses.length,provisionalMemoryRecords:memory.length,humanVerifiedMemoryRecords:verified.length,immediatelyReusableVerifiedRecords:0,missingSenses:missing.length,exactEnglishTasks:exact.size,unsafeEnglishOnlySavings:missing.length-exact.size,unsafeEnglishOnlySavingsPercent:(missing.length-exact.size)/missing.length*100,strictContextTasks:strict.size,strictContextSourceSavings:missing.length-strict.size,reviewAssistedSemanticTasks:semantic.size,reviewAssistedSemanticSavings:missing.length-semantic.size,missingWithLexicalConcordance:alignedMissing,sourceCharacters:chars(missing),exactEnglishCharacters:chars(englishTasks),strictContextCharacters:chars(strictGroups.map(g=>g[0])),semanticTaskCharacters:chars(semanticGroups.map(g=>g[0])),caveat:'Source-task deduplication does not verify translations. Cross-headword synset grouping is a review-assisted estimate, not automatic permission to propagate translations. All current memory remains provisional.'};
  atomicJSON('scripts/data/malay-translation-memory-v1.json',{schema:1,corpusSha256:data.digest,records:memory});
  atomicJSON('scripts/data/malay-recovery-deduplication.json',{...report,ambiguousEnglishExamples:Object.fromEntries(collisions)});
  mkdirSync('.tmp/malay-recovery',{recursive:true});
  writeFileSync('.tmp/malay-recovery/source-tasks.jsonl',strictGroups.map(group=>JSON.stringify({taskId:contextKey(group[0],meanings.get(group[0].entryId)),source:group[0],members:group.map(s=>s.key),entryContext:meanings.get(group[0].entryId),reusePolicy:'one identical full source context; generated text still requires validation'})).join('\n')+'\n');
  console.log(JSON.stringify(report,null,2));return {report,data,resources,memory};
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href)prepareMemory();
