import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { corpus, hash } from './corpus.mjs';
const root = '.tmp/malay-complete', prepared = JSON.parse(readFileSync(`${root}/preparation.json`));
const bytes = readFileSync(`${root}/candidates.json`); assert.equal(hash(bytes), prepared.candidatesSha256);
const records = JSON.parse(bytes).records, senses = new Map(corpus().senses.map(s => [s.key, s]));
assert.equal(new Set(records.map(r => r.key.slice(0, 14))).size, records.length);
const cell = text => String(text ?? '').replaceAll('|', '\\|').replaceAll(/\r?\n/g, ' ');
const lines = ['# KANJIAN offline Malay review sheet', '',
  'All entries below are machine-generated provisional additions. Independent human approvals: **0**. A reviewer must check the exact Mandarin sense, Malaysian usage, grammar, names and scope before changing any review status.', '',
  `New lexical equivalents: **${prepared.lexicalEquivalentsQualified}**. Translated English surname annotations: **${prepared.surnameAnnotationsQualified}**. Surname annotations are not new Malay lexical equivalents for Chinese names.`, '',
  'The full 64-character keys, canonical entry/sense IDs, models, revisions, licenses and alignment evidence are in `scripts/data/malay-translations-v1.json`. The unique key prefixes below identify those records. Model/reference evaluation with source URLs is in `scripts/data/malay-offline-evaluation.json`; licenses are in `public/data/MALAY-NOTICE.txt` and `public/data/MALAY-OFFLINE-MODELS.json`.', '',
  'Record the independent reviewer’s name, date, corrected text if needed, and reasoning. Do not approve from model agreement or automated concordance alone.', '',
  '| Key prefix | Mandarin | Pinyin | Original English sense | Provisional Malay | Type | Model | Human review |',
  '| --- | --- | --- | --- | --- | --- | --- | --- |'];
for (const r of records) {
  const s = senses.get(r.key); assert(s && s.english === r.english);
  lines.push(`| ${[r.key.slice(0, 14), s.simplified, s.pinyin, r.english, r.malay, r.translationKind === 'definition-translation' ? 'English definition' : 'Lexical equivalent', r.translationModel.startsWith('HPLT/') ? 'HPLT' : 'M2M100', 'Pending'].map(cell).join(' | ')} |`);
}
writeFileSync('KANJIAN_OFFLINE_MALAY_REVIEW_SHEET.md', lines.join('\n') + '\n');
console.log(JSON.stringify({ reviewRows: records.length, independentHumanApprovals: 0 }));
