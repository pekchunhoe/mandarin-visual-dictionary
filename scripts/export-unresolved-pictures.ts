import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createVisualInference } from '../src/lib/visual-inference-core';
import { canonicalWordId, type RawRow } from '../src/lib/dictionary-entry-core';
import { displayMeaning, toneMarks } from '../src/lib/dictionary';
import lexicon from '../src/data/visual-lexicon.json';

const baselinePath = '.tmp/unresolved-picture-baseline.json';
const inference = createVisualInference(lexicon);
function cluster(english: string) {
  const plain = english.replace(/\([^)]*\)/g, ' ').trim();
  if (/pronounc|\bpr\.|phonetic|spelling|written as|variant|abbrev|acronym|abbr\.|radical|character|equivalent|^see\b|name for/i.test(english)) return 'Dictionary metadata / cross-reference';
  if (/^\([^)]*\)$/.test(english)) return 'Parenthesis-only gloss';
  if (/\b(?:BC|AD)\b|\d{3,4}\s*[-–]|\(\d{3,4}/.test(english)) return 'Dated names / history';
  if (/\b[A-Z][a-z]?\d+[A-Z0-9(]|\b[A-Z][a-z]?[A-Z][a-z]?\d|\b(?:acid|chloride|oxide|isotope|chemical)\b/.test(english)) return 'Chemical / scientific notation';
  if (/\p{Script=Han}/u.test(english)) return 'Embedded Chinese annotation';
  if (/[^\x00-\x7f]/.test(english)) return 'Unicode punctuation / accented words';
  if (/\d/.test(plain)) return 'Numeric modifier / quantity';
  if (/[!?]/.test(plain)) return 'Questions / exclamations';
  if (/["“”]/.test(plain)) return 'Quoted gloss / title';
  if (/\b(?:not|without|unable|having no|lack of)\b/.test(plain)) return 'Negation';
  if (/[;/]/.test(plain)) return 'Alternative clauses';
  return 'Other rejected English construction';
}
mkdirSync('.tmp', { recursive: true });
if (!existsSync(baselinePath)) {
  const baseline = JSON.parse(readFileSync('scripts/data/picture-coverage-baseline.json', 'utf8'));
  const pending = new Set(baseline.map((record: { word: string; english: string }) => JSON.stringify([record.word, record.english])));
  const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
  const records = rows.flatMap((row, rowIndex) => row[3].filter(d => !/^CL:/i.test(d)).flatMap((rawEnglish, senseIndex) => {
    const english = displayMeaning(rawEnglish);
    if (!pending.has(JSON.stringify([row[1], english]))) return [];
    return [{ word: row[1], pinyin: toneMarks(row[2]), numericPinyin: row[2], rowId: canonicalWordId(row), rowIndex, senseId: `sense-${senseIndex}`, rawEnglish, english, partOfSpeech: null,
      annotations: [...english.matchAll(/\(([^)]*)\)/g)].map(match => match[1]), cluster: cluster(english), ...inference.diagnoseVisualMeaning(english) }];
  }));
  if (records.length !== 3885) throw new Error(`Expected the frozen 3,885-sense baseline; found ${records.length}`);
  writeFileSync(baselinePath, JSON.stringify(records, null, 2));
}
const records = JSON.parse(readFileSync(baselinePath, 'utf8'));
const counts: Record<string, number> = {};
for (const record of records) counts[record.cluster] = (counts[record.cluster] ?? 0) + 1;
const clusters = Object.entries(counts).sort((a, b) => b[1] - a[1]);
writeFileSync('.tmp/unresolved-picture-clusters.json', JSON.stringify(clusters, null, 2));
console.log(JSON.stringify({ count: records.length, clusters }, null, 2));
