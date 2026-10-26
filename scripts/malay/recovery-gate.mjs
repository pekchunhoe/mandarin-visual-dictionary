import { hash } from './corpus.mjs';

export const RECOVERY_POLICY=Object.freeze({version:'ms-recovery-gate-1',minimumCases:300,minimumSemanticRate:0.95,minimumNaturalRate:0.90,minimumStratumSemanticRate:0.90,requiredAlignmentRate:1,maximumCriticalErrors:0,minimumStrata:{idiom:30,polysemy:20,technical:20,verb:30,modifier:8,abstract:10}});
export function stratum(caseRecord) {
 const c=caseRecord.category;
 if(c.includes('idiom'))return 'idiom';
 if(/polysemy|grammar/.test(c))return 'polysemy';
 if(c.includes('technical'))return 'technical';
 if(c.includes('verb'))return 'verb';
 if(c.includes('abstract'))return 'abstract';
 if(/modifier|adjective/.test(c))return 'modifier';
 return 'common';
}
export const candidateDigest = record => hash(JSON.stringify([record.key,record.methodId,record.inputDigest,record.text,record.modelSha256,record.promptVersion,record.generationConfigSha256,record.runtimeVersion]));
export function evaluateRecovery(benchmark,outputs,review,methodId) {
 const blockers=[];
 const {digest,...benchmarkBody}=benchmark;
 if(digest!==hash(JSON.stringify(benchmarkBody)))blockers.push('benchmark-digest-mismatch');
 if(benchmark.cases.length<RECOVERY_POLICY.minimumCases)blockers.push('insufficient-benchmark-cases');
 if(!review||review.benchmarkDigest!==benchmark.digest)blockers.push('missing-or-stale-human-review');
 if(!review?.reviewer?.trim()||review?.reviewerRole!=='independent-human'||/assistant|codex|model|automated|gpt/i.test(review?.reviewer??''))blockers.push('independent-human-reviewer-required');
 const expected=new Set(benchmark.cases.map(c=>c.key));
 const selected=outputs.filter(o=>o.methodId===methodId),byKey=new Map(selected.map(o=>[o.key,o]));
 if(selected.length!==byKey.size)blockers.push('duplicate-output');
 if(selected.some(o=>!expected.has(o.key)))blockers.push('unknown-output-key');
 for(const field of ['modelSha256','promptVersion','generationConfigSha256','runtimeVersion'])if(new Set(selected.map(o=>o[field])).size!==1)blockers.push(`mixed-generation-provenance:${field}`);
 const ratings=review?.ratings??[];
 if(new Set(ratings.map(r=>r.key)).size!==ratings.length)blockers.push('duplicate-review-key');
 if(ratings.some(r=>!expected.has(r.key)))blockers.push('unknown-review-key');
 const byReview=new Map(ratings.map(r=>[r.key,r]));
 let reviewed=0,semantic=0,natural=0,aligned=0,critical=0;const strata={},stratumSemantic={};
 for(const c of benchmark.cases) {
  strata[stratum(c)]=(strata[stratum(c)]??0)+1;
  const o=byKey.get(c.key),r=byReview.get(c.key),rating=r?.candidates?.find(r=>r.methodId===methodId);
  if(!o){blockers.push(`missing-output:${c.caseId}`);continue;}
  if(typeof o.text!=='string'||!o.text.trim()||!o.promptVersion||!o.runtimeVersion||!['modelSha256','inputDigest','generationConfigSha256'].every(f=>/^[a-f0-9]{64}$/.test(o[f]??''))||o.hardErrors?.length||o.stoppedByLimit||o.inputTruncated)blockers.push(`invalid-output:${c.caseId}`);
  if(!r?.referenceApproved||!rating||rating.candidateDigest!==candidateDigest(o)||![0,1,2].includes(rating.semantic)||![0,1,2].includes(rating.natural)||typeof rating.aligned!=='boolean'||typeof rating.critical!=='boolean') {
   blockers.push(`unreviewed-or-stale-case:${c.caseId}`);continue;
  }
  reviewed++;if(rating.semantic===2){semantic++;stratumSemantic[stratum(c)]=(stratumSemantic[stratum(c)]??0)+1;}if(rating.natural===2)natural++;if(rating.aligned)aligned++;if(rating.critical)critical++;
 }
 for(const [name,min] of Object.entries(RECOVERY_POLICY.minimumStrata))if((strata[name]??0)<min)blockers.push(`missing-stratum:${name}`);
 for(const [name,count] of Object.entries(strata))if((stratumSemantic[name]??0)/count<RECOVERY_POLICY.minimumStratumSemanticRate)blockers.push(`stratum-quality-below-threshold:${name}`);
 const total=benchmark.cases.length;
 if(reviewed!==total)blockers.push('entire-locked-benchmark-must-be-reviewed');
 if(semantic/total<RECOVERY_POLICY.minimumSemanticRate)blockers.push('semantic-quality-below-threshold');
 if(natural/total<RECOVERY_POLICY.minimumNaturalRate)blockers.push('malaysian-naturalness-below-threshold');
 if(aligned/total<RECOVERY_POLICY.requiredAlignmentRate)blockers.push('sense-alignment-below-threshold');
 if(critical>RECOVERY_POLICY.maximumCriticalErrors)blockers.push('critical-errors');
 return {policy:RECOVERY_POLICY,methodId,total,reviewed,semanticRate:semantic/total,naturalRate:natural/total,alignmentRate:aligned/total,criticalErrors:critical,strata,eligibleForBulk:blockers.length===0,blockers:[...new Set(blockers)],note:'Review attestation is required; this validates review data, not the reviewer’s identity. Automatic metrics and a model judging its own output cannot substitute for independent human ratings.'};
}
