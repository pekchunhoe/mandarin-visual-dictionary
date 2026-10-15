import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { idiomGloss } from '../../src/lib/idiom-gloss.ts';
export const hash = value => createHash('sha256').update(value).digest('hex');
export const display = english => english.replace(/\s*\(CL:[^)]*\)/g, '').trim();
export function corpus() {
  const bytes = readFileSync('public/data/cedict.json');
  const rows = JSON.parse(bytes);
  const senses = rows.flatMap(([traditional, simplified, pinyin, definitions]) => {
    const entryId = `${simplified}|${traditional}|${pinyin}`;
    return definitions.filter(d => !/^CL:/i.test(d)).map((rawEnglish, index) => ({
      key: hash(JSON.stringify([entryId, index, rawEnglish])), entryId, senseId: `sense-${index}`,
      simplified, traditional, pinyin, rawEnglish, english: display(rawEnglish),
      idiom: idiomGloss(rawEnglish).tagged
    }));
  });
  return { rows, senses, digest: hash(bytes), bytes: bytes.length };
}
export function auditCorpus(data = corpus()) {
  const { rows, senses } = data;
  const learning = JSON.parse(readFileSync('src/data/learning-runtime.json', 'utf8')).words;
  return {
    dictionarySha256: data.digest, dictionaryBytes: data.bytes, rows: rows.length,
    uniqueEntries: new Set(senses.map(s => s.entryId)).size,
    uniqueSimplifiedHeadwords: new Set(rows.map(r => r[1])).size,
    senseRecords: senses.length, rawDefinitions: rows.reduce((n, r) => n + r[3].length, 0),
    classifierOnlyRecords: rows.reduce((n, r) => n + r[3].filter(d => /^CL:/i.test(d)).length, 0),
    singleCharacterEntries: rows.filter(r => [...r[1]].length === 1).length,
    uniqueSingleCharacters: new Set(rows.filter(r => [...r[1]].length === 1).map(r => r[1])).size,
    singleHanCharacterEntries: rows.filter(r => /^\p{Script=Han}$/u.test(r[1])).length,
    uniqueSingleHanCharacters: new Set(rows.filter(r => /^\p{Script=Han}$/u.test(r[1])).map(r => r[1])).size,
    uniqueHanCharactersAcrossBothScripts: new Set(rows.flatMap(r => [...r[0], ...r[1]].filter(c => /\p{Script=Han}/u.test(c)))).size,
    compoundEntries: rows.filter(r => [...r[1]].length > 1).length,
    idiomSenses: senses.filter(s => s.idiom).length,
    englishNonempty: senses.filter(s => s.english.trim()).length,
    multipleSenseEntries: rows.filter(r => r[3].filter(d => !/^CL:/i.test(d)).length > 1).length,
    starterEntries: learning.length, starterSenses: learning.flatMap(w => w.senses).length,
    existingStarterMalay: learning.flatMap(w => w.senses).filter(s => s.malay?.trim()).length
  };
}
