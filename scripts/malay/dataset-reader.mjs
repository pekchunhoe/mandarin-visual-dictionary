import { createReadStream, readFileSync, statSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { extname } from 'node:path';
import { createHash } from 'node:crypto';

export async function fileDigest(file) {
  const digest = createHash('sha256');
  for await (const bytes of createReadStream(file)) digest.update(bytes);
  return digest.digest('hex');
}
const parsed = text => { try { return { value: JSON.parse(text) }; } catch { return { error: 'malformed-json' }; } };

// JSONL and top-level JSON arrays stream with bounded per-record memory. JSON
// object maps are intentionally bounded; larger sources must use JSONL/arrays.
export async function* readDataset(file, { format = extname(file).slice(1).toLowerCase(), maxRecordBytes = 1024 * 1024 } = {}) {
  if (['jsonl', 'ndjson'].includes(format)) {
    for await (const line of createInterface({ input: createReadStream(file, { encoding: 'utf8' }), crlfDelay: Infinity })) {
      if (!line.trim()) continue;
      yield Buffer.byteLength(line) > maxRecordBytes ? { error: 'oversized-record' } : parsed(line.replace(/^\uFEFF/, ''));
    }
    return;
  }
  if (format === 'json') {
    let started = false, array = false, buffer = '', depth = 0, quoted = false, escaped = false, ended = false, oversized = false;
    for await (const chunk of createReadStream(file, { encoding: 'utf8' })) for (const char of chunk.replace(!started ? /^\uFEFF/ : /$^/, '')) {
      if (!started) { if (/\s/.test(char)) continue; started = true; array = char === '['; if (array) continue; }
      if (!array) {
        // Object maps are less common and cannot be split without losing keys.
        if (statSync(file).size > 64 * 1024 * 1024) throw Error('JSON object map exceeds 64 MiB; convert to JSONL.');
        const result = parsed(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
        if (result.error) { yield result; return; }
        const v = result.value;
        if (Array.isArray(v?.records ?? v?.entries)) { for (const value of v.records ?? v.entries) yield { value }; }
        else if (v && typeof v === 'object') for (const [english, malay] of Object.entries(v)) yield { value: { english, malay } };
        else yield { error: 'invalid-json-container' };
        return;
      }
      if (ended) { if (!/\s/.test(char)) throw Error('Trailing JSON content'); continue; }
      if (!quoted && depth === 0 && (char === ',' || char === ']')) {
        if (buffer.trim() || oversized) yield oversized ? { error: 'oversized-record' } : parsed(buffer.trim());
        buffer = ''; oversized = false; if (char === ']') ended = true; continue;
      }
      if (!oversized) { buffer += char; if (buffer.length > maxRecordBytes) { oversized = true; buffer = ''; } }
      if (quoted) { if (escaped) escaped = false; else if (char === '\\') escaped = true; else if (char === '"') quoted = false; }
      else if (char === '"') quoted = true;
      else if (char === '{' || char === '[') depth++;
      else if (char === '}' || char === ']') depth--;
    }
    if (array && !ended) throw Error('Truncated JSON array; source is not committed to cache.');
    return;
  }
  if (!['csv', 'tsv'].includes(format)) throw Error(`Unsupported dataset format: ${format}`);
  const delimiter = format === 'tsv' ? '\t' : ',';
  let fields = [], field = '', quoted = false, afterQuote = false, headers, invalid = false, rowSize = 0;
  const finish = () => {
    fields.push(field.replace(/\r$/, '')); field = '';
    const row = fields; fields = []; rowSize = 0;
    if (!headers) { headers = row.map(h => h.replace(/^\uFEFF/, '').trim()); return; }
    if (row.length === 1 && !row[0]) return;
    const result = invalid || row.length !== headers.length ? { error: 'malformed-delimited-row' } : { value: Object.fromEntries(headers.map((h, i) => [h, row[i]])) };
    invalid = false; return result;
  };
  for await (const chunk of createReadStream(file, { encoding: 'utf8' })) for (const char of chunk) {
    if (++rowSize > maxRecordBytes) { invalid = true; field = ''; }
    if (afterQuote) {
      if (char === '"') { if (!invalid) field += '"'; quoted = true; afterQuote = false; continue; }
      afterQuote = false; quoted = false;
      if (char !== delimiter && char !== '\n' && char !== '\r') invalid = true;
    }
    if (quoted) { if (char === '"') afterQuote = true; else if (!invalid) field += char; continue; }
    if (char === '"') { if (field) invalid = true; quoted = true; continue; }
    if (char === delimiter) { fields.push(field); field = ''; }
    else if (char === '\n') { const row = finish(); if (row) yield row; }
    else if (!invalid) field += char;
  }
  if (field || fields.length) { if (quoted && !afterQuote) invalid = true; const row = finish(); if (row) yield row; }
}

export const normalizeText = text => typeof text === 'string' ? text.normalize('NFC').replace(/\s+/gu, ' ').trim() : '';
export const normalizeEnglish = text => normalizeText(text).toLowerCase().replace(/^(?:a|an|the|to) /, '').replace(/\.$/, '');
const posMap = { n: 'noun', v: 'verb', a: 'adj', s: 'adj', r: 'adv', adjective: 'adj', adverb: 'adv' };
export const normalizePos = pos => posMap[normalizeText(pos).toLowerCase()] ?? normalizeText(pos).toLowerCase();
export function normalizeEntry(value, source) {
  if (Array.isArray(value) && source.orientation === 'en-ms' && value.length === 2) value = { english: value[0], malay: value[1] };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { error: 'not-an-entry' };
  const entries = [];
  if (source.orientation === 'wiktionary-ms-en') {
    if (value.lang_code !== 'ms') return { error: 'not-malay-language' };
    for (const sense of value.senses ?? []) {
      const tags = [...value.tags ?? [], ...sense.tags ?? [], ...sense.raw_tags ?? []];
      if (sense.form_of || sense.alt_of || /Indonesia|obsolete|archaic|rare|dialect|nonstandard|colloquial|slang|vulgar|offensive|derogatory|no-gloss|form-of|alternative/i.test(tags.join(' '))) continue;
      for (const gloss of sense.glosses ?? []) entries.push({ english: gloss, malay: value.word, pos: value.pos, definition: gloss, tags, url: `https://en.wiktionary.org/wiki/${encodeURIComponent(value.word)}#Malay` });
    }
  } else if (source.orientation === 'en-ms') {
    const english = value.english ?? value.en ?? value.headword;
    const translations = value.malay ?? value.ms ?? value.bm ?? value.translations ?? value.translation;
    for (const malay of Array.isArray(translations) ? translations : [translations]) entries.push({ english, malay, pos: value.pos ?? value.partOfSpeech, definition: value.definition ?? value.gloss ?? '', tags: value.tags ?? [], url: value.url ?? source.url, chinese: value.chinese });
  } else return { error: 'unconfirmed-language-orientation' };
  const records = entries.map(r => ({ ...r, english: normalizeText(r.english), malay: normalizeText(r.malay), definition: normalizeText(r.definition), pos: normalizePos(r.pos), sourceId: source.id }))
    .filter(r => r.english && r.malay && r.english.length < 1000 && r.malay.length < 120 && /^[\p{L}\p{N} '-]+$/u.test(r.malay) && !/[\p{Script=Han}\ufffd\p{Script=Arabic}]/u.test(r.malay) && !/\ufffd/.test(r.english));
  return records.length ? { records } : { error: 'no-usable-lexical-record' };
}
