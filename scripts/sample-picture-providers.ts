import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fromRow, type RawRow } from '../src/lib/dictionary-entry';
import { imageSearchPlan } from '../server/image-plan';
import { getImages } from '../server/images';
import { byId } from '../src/data/learning';

// Opt-in live sample only. Never part of npm test/build or the corpus audit.
const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
const samples: unknown[] = [];
for (const text of ['苹果', '不耻下问', '机械师', '小题大做']) {
  const word = byId.get(text) ?? fromRow(rows.find(row => row[1] === text)!);
  const requests: { provider: string; query: string | null; status?: number; failure?: string }[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    if (url.origin !== 'https://api.openverse.org' || url.pathname !== '/v1/images/' || new Headers(init?.headers).has('authorization') || init?.body)
      throw new Error('Anonymous image search only');
    const record = { provider: url.hostname === 'pixabay.com' ? 'pixabay' : url.pathname.includes('auth_tokens') ? 'openverse-oauth' : 'openverse', query: url.searchParams.get('q') } as typeof requests[number];
    requests.push(record);
    try { const response = await fetch(input, init); record.status = response.status; return response; }
    catch { record.failure = 'network_or_timeout'; throw new Error('Provider sample unavailable'); }
  };
  // Deliberately anonymous: this live sample never reads or transmits credentials.
  const result = await getImages(word.id, word.senses[0].id, { fetcher });
  const candidates = result.images.filter(p => p.provider === 'openverse');
  samples.push({ word: text, query: imageSearchPlan(word, word.senses[0])?.primary.query, requests, status: result.status, diagnostics: result.diagnostics, liveImages: candidates.length, providers: [...new Set(result.images.map(p => p.provider).filter(Boolean))], metadata: candidates.map(p => ({ id: p.id, creatorPresent: !!p.photographer, sourcePresent: !!p.sourceUrl, license: p.license, licenseUrl: p.licenseUrl, attributionPresent: !!p.attribution })) });
}
const result = { mode: 'anonymous-openverse-only', samples };
mkdirSync('.tmp', { recursive: true }); writeFileSync('.tmp/picture-live-sample.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
