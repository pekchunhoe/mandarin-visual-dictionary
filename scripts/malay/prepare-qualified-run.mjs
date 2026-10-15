import { readFileSync, mkdirSync, writeFileSync, renameSync, copyFileSync } from 'node:fs';
import { corpus } from './corpus.mjs';
import { qualify, version } from './qualified-adapter.mjs';
import { atomicJSON } from './pipeline.mjs';
import { qualityIssues } from './quality.mjs';
const data = corpus(), prior = JSON.parse(readFileSync('scripts/data/malay-translations-v1.json','utf8'));
const covered = new Set(prior.records.map(r => r.key));
const keys = [], dispositions = [], reasons = {};
const started = performance.now();
for (const sense of data.senses) {
  if (covered.has(sense.key)) continue;
  const result = qualify(sense);
  const issues = result.record ? qualityIssues({ ...result.record, translationSource:'qualifier', translationLicense:'CC-BY-SA-4.0', translationVersion:version, translationStatus:'generated', translationConfidence:0.8 },sense) : [];
  const reason = issues.length ? `quality:${issues.join(',')}` : result.reason;
  if (result.record && !issues.length) keys.push(sense.key);
  else reasons[reason] = (reasons[reason] ?? 0) + 1;
  dispositions.push(JSON.stringify({key:sense.key, disposition: result.record && !issues.length ? 'qualified-candidate' : 'missing', reason}));
}
mkdirSync('.tmp/malay-qualified',{recursive:true});
writeFileSync('.tmp/malay-qualified/full-scan.jsonl.next', dispositions.join('\n')+'\n');
renameSync('.tmp/malay-qualified/full-scan.jsonl.next','.tmp/malay-qualified/full-scan.jsonl');
atomicJSON('.tmp/malay-qualified/selection.json',{corpusSha256:data.digest,version,keys});
atomicJSON('.tmp/malay-qualified/config.json',{enabled:true,offline:true,adapter:'scripts/malay/qualified-adapter.mjs',selection:'.tmp/malay-qualified/selection.json',maxRecords:data.senses.length,batchSize:100,concurrency:1,checkpoint:'.tmp/malay-qualified/checkpoint.json',output:'.tmp/malay-qualified/accepted-candidates.json'});
const summary = {corpusSha256:data.digest,totalSenses:data.senses.length,previouslyAccepted:covered.size,scannedMissing:dispositions.length,qualifiedCandidates:keys.length,reasons,seconds:(performance.now()-started)/1000,heapBytes:process.memoryUsage().heapUsed,version};
atomicJSON('.tmp/malay-qualified/full-scan-summary.json',summary);
mkdirSync('public/data/licenses',{recursive:true});
for (const [source,target] of [['msa','WORDNET-BAHASA-LICENSE.txt'],['cow','CHINESE-OPEN-WORDNET-LICENSE.txt'],['eng','PRINCETON-WORDNET-3.0-LICENSE.txt']]) copyFileSync(`.tmp/malay-lexical/wns/${source}/LICENSE`,`public/data/licenses/${target}`);
console.log(JSON.stringify(summary,null,2));
