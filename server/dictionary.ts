import { readFileSync } from 'node:fs';
import { byId, words } from '../src/data/learning';
import { canonicalWordId, fromRow } from '../src/lib/dictionary-entry';
import type { RawRow } from '../src/lib/dictionary-entry';
import type { Word } from '../src/types';
let entries: Map<string, RawRow> | undefined;
const curatedByRow = new Map(words.map(word => [word.dictionaryId, word]));
/** The browser's exact row ID is authoritative. Text aliases are starter-only. */
export function resolveImageWord(id: string): Word | undefined {
  const curated = byId.get(id) ?? curatedByRow.get(id); if (curated) return curated;
  if (!id.includes('|')) return;
  if (!entries) {
    // Both source and generated bundle live in server/. Resolve from the module,
    // so initialization also works when the host uses a different working directory.
    const rows = JSON.parse(readFileSync(new URL('../public/data/cedict.json', import.meta.url), 'utf8')) as RawRow[];
    entries = new Map(rows.map(row => [canonicalWordId(row), row]));
  }
  const row = entries.get(id); return row ? fromRow(row) : undefined;
}
