import { readFileSync, writeFileSync } from 'node:fs';
import { atomicJSON } from './io.mjs';
import { hash } from './corpus.mjs';
const read = file => JSON.parse(readFileSync(file));
const preparation = read('.tmp/malay-datasets/preparation.json');
const integration = read('.tmp/malay-datasets/integration-first.json');
const records = read('.tmp/malay-datasets/candidates.json').records;
const attribution = records.map(r => ({ key: r.key, entryId: r.entryId, senseId: r.senseId, english: r.english, malay: r.malay,
  synset: r.translationAlignment.synset, sourceIds: [...new Set(r.translationAlignment.sources.map(s => s.sourceId))],
  urls: [...new Set(r.translationAlignment.sources.map(s => s.url))] }));
atomicJSON('public/data/MALAY-DATASET-ATTRIBUTION.json', { license: 'CC-BY-SA-4.0', creators: 'English Wiktionary contributors', extractor: 'Tatu Ylonen / Wiktextract / Kaikki; supplementary filtering by Mesolitica', modifications: 'Filtered original Malay lexical glosses/POS, normalized NFC/whitespace, aligned to unchanged CC-CEDICT and WordNet senses; no source quotations or examples reused.',
  sourceVersions: preparation.sourceResults.map(({ id, sha256, version, url, attribution, license }) => ({ id, sha256, version, url, attribution, license })), records: attribution });
const excluded = read('.tmp/malay-datasets/sources/200k-english-malay.json');
atomicJSON('scripts/data/malay-bulk-statistics.json', { ...preparation, integration, licensingExcludedCountedRecords: excluded.length,
  excludedSources: [
    { name: '200k English-Malay', version: '87c0562cb41966babc62b299cd2812e620d1c23e', url: 'https://raw.githubusercontent.com/malaysia-ai/malaysian-dataset/87c0562cb41966babc62b299cd2812e620d1c23e/dictionary/200k-english-malay/200k-english-malay.json', sha256: hash(readFileSync('.tmp/malay-datasets/sources/200k-english-malay.json')), countedRecords: excluded.length, format: 'JSON array of [English, Malay] pairs', reason: 'Google Translate-derived; research-only staging, no confirmed redistribution grant. Entire list excluded.' },
    { name: 'Cambridge English-Malaysian', version: '4f6a54fc39110a7b3289c12f58122ead7cf5dcbb', url: 'https://huggingface.co/datasets/mesolitica/crawl-cambridge-english-malaysian/resolve/4f6a54fc39110a7b3289c12f58122ead7cf5dcbb/cambridge-english-malaysian.json', countedRecords: null, advertisedWords: 25171, reason: 'Crawled Cambridge publication. Rights-holder permission not supplied; contents not downloaded or imported.' },
    { name: 'DBP', version: '3a4d87670803d0f69e51e97b5c43f8347b70dd88', url: 'https://huggingface.co/datasets/mesolitica/dbp/resolve/3a4d87670803d0f69e51e97b5c43f8347b70dd88/dbp.zip', countedRecords: null, advertisedWords: 78670, reason: 'PRPM/DBP crawl; no applicable public redistribution grant supplied. Contents not downloaded or imported.' },
    { name: 'Kamus Dewan', url: 'https://huggingface.co/datasets/mesolitica/kamus-dewan/raw/main/Kamus_Dewan_Bahasa_Edisi_Keempat.json', countedRecords: null, reason: 'DBP publication; no applicable redistribution permission supplied. Contents not downloaded or imported.' }
  ] });
// A deterministic spread across POS, technical, abstract and everyday entries.
const selected = new Map();
for (const r of records) {
  const pos = r.translationAlignment.pos;
  const category = /syndrome|cancer|sociology|arthropod|aerodynamics|prism|magnet|tuberculosis|computer|carcinogen/.test(r.english) ? 'technical' : pos === 'verb' ? 'verb' : pos === 'adj' ? 'modifier' : /idea|concept|meaning|intention|research|management|regret|cooperation|crime|prestige/.test(r.english) ? 'abstract' : 'everyday';
  const list = selected.get(category) ?? []; list.push(r); selected.set(category, list);
}
const sample = [...selected].flatMap(([category, group]) => [...group].sort((a, b) => hash(a.key).localeCompare(hash(b.key))).slice(0, 12).map(r => ({ category, ...r, reviewer: null, independentHumanApproved: false, assistantAssessment: 'Plausible exact-sense provisional candidate; not independent linguistic verification.' })));
atomicJSON('scripts/data/malay-bulk-review-samples.json', { instructions: 'An independent Mandarin–Malaysian Malay reviewer should assess equivalence, grammatical form, register and regional use. No source match or assistant assessment constitutes human approval.', records: sample });
const cell = text => String(text ?? '').replace(/[\t\r\n]+/g, ' ');
writeFileSync('.tmp/malay-datasets/review-sheet.tsv', ['category\tChinese\tpinyin\tEnglish\tMalay\tsenseKey\tsourcePages\treviewer\tdecision\tcomment', ...sample.map(r => [r.category, r.simplified, r.pinyin, r.english, r.malay, r.key, r.translationAlignment.sources.map(s => s.url).join(' '), '', '', ''].map(cell).join('\t'))].join('\n') + '\n');
console.log(JSON.stringify({ attributionRecords: attribution.length, reviewSample: sample.length, licensingExcludedCountedRecords: excluded.length }));
