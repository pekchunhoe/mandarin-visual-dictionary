import { DictionaryIndex } from './dictionary';
import { fromRow, words } from '../data/learning';
import type { RawRow } from '../data/learning';
let index: DictionaryIndex | undefined;
let loading: Promise<void> | undefined;
async function load() {
  if (index) return;
  if (!loading) loading = (async () => {
    const response = await fetch('/data/cedict.json');
    if (!response.ok) throw new Error('Dictionary could not be downloaded.');
    const rows: RawRow[] = await response.json();
    const curated = new Set(words.map(w => w.simplified));
    index = new DictionaryIndex([...words, ...rows.filter(r => !curated.has(r[1])).map(fromRow)]);
  })().catch(error => { loading = undefined; throw error; });
  await loading;
}
self.onmessage = async ({ data }: MessageEvent<{ query: string; id: number }>) => {
  try { await load(); self.postMessage({ id: data.id, results: index!.search(data.query) }); }
  catch { self.postMessage({ id: data.id, error: 'The full dictionary is unavailable. Check your connection and try again. The learning collection still works offline.' }); }
};
