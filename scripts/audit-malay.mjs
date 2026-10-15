import { mkdirSync, writeFileSync } from 'node:fs';
import { auditCorpus } from './malay/corpus.mjs';
mkdirSync('.tmp', { recursive: true });
const audit = auditCorpus();
writeFileSync('.tmp/malay-corpus-baseline.json', JSON.stringify(audit, null, 2) + '\n');
console.log(JSON.stringify(audit, null, 2));
