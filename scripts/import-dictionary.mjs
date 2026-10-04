import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
// Obtain the original public export from MDBG; this runs at maintenance time, never per search.
const text = gunzipSync(await readFile('cedict.txt.gz')).toString('utf8');
const rows = text.split('\n').flatMap(line => {
  const match = line.trimEnd().match(/^(\S+) (\S+) \[([^\]]+)\] \/(.+)\/$/);
  return match ? [[match[1], match[2], match[3], match[4].split('/')]] : [];
});
await mkdir('public/data', { recursive: true });
await mkdir('src/data', { recursive: true });
await writeFile('public/data/cedict.json', JSON.stringify(rows));
const learningSource = await readFile('src/data/learning.ts', 'utf8');
const learningWords = new Set([...learningSource.matchAll(/^  '([^']+)':/gm)].map(match => match[1]));
await writeFile('src/data/cedict-core.json', JSON.stringify(rows.filter(r => learningWords.has(r[1])), null, 2));
await writeFile('public/data/NOTICE.txt', text.split('\n').filter(l => l.startsWith('#')).join('\n') + '\n\nSource: https://www.mdbg.net/chinese/dictionary?page=cedict\nLicense: https://creativecommons.org/licenses/by-sa/4.0/\nThis compact JSON conversion preserves the original dictionary fields.\n');
console.log(`Imported ${rows.length} genuine CC-CEDICT entries; generated a small offline learning subset.`);
