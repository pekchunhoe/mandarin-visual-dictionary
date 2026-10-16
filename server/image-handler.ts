import type { IncomingMessage, ServerResponse } from 'node:http';
import { getImages } from './images';
const buckets = new Map<string, { count: number; until: number }>();
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  const send = (status: number, data: unknown) => { res.statusCode = status; res.end(JSON.stringify(data)); };
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return send(405, { error: 'Method not allowed' }); }
  let url: URL;
  try { url = new URL(req.url ?? '/', 'http://localhost'); }
  catch { return send(400, { error: 'Invalid dictionary word or sense.' }); }
  const word = url.searchParams.get('word') ?? ''; const sense = url.searchParams.get('sense') ?? '';
  const mode = url.searchParams.get('mode') ?? 'gallery';
  if (!word || word.length > 300 || (!word.includes('|') && word.length > 40) || !/^sense-\d{1,4}$/.test(sense) || !['gallery', 'thumbnail'].includes(mode) || [...url.searchParams.keys()].some(k => !['word', 'sense', 'mode'].includes(k) || url.searchParams.getAll(k).length > 1)) return send(400, { error: 'Invalid dictionary word or sense.' });
  const forwarded = req.headers['x-vercel-forwarded-for'];
  const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress) ?? 'unknown';
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.until < now) buckets.delete(key);
  if (buckets.size >= 5000 && !buckets.has(ip)) return send(429, { error: 'Please try again in a minute.' });
  const bucket = buckets.get(ip) ?? { count: 0, until: now + 60_000 }; buckets.set(ip, bucket);
  if (++bucket.count > 30) { res.setHeader('Retry-After', '60'); return send(429, { error: 'Please try again in a minute.' }); }
  try {
    // Opt-in transport; existing JSON callers, validation and rate limits stay
    // intact. No header flush until a valid, relevant result is available.
    const streaming = mode === 'gallery' && req.headers.accept?.includes('application/x-ndjson');
    const write = (result: unknown, done: boolean) => {
      if (res.destroyed) return;
      res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, no-transform');
      res.write(JSON.stringify({ result, done }) + '\n');
    };
    const result = await getImages(word, sense, { pixabayKey: process.env.PIXABAY_API_KEY, pexelsKey: process.env.PEXELS_API_KEY, openverseClientId: process.env.OPENVERSE_CLIENT_ID, openverseClientSecret: process.env.OPENVERSE_CLIENT_SECRET, mode: mode as 'gallery' | 'thumbnail', onProgress: streaming ? result => {
      // Headers may only be changed before the first streamed chunk.
      if (res.headersSent) { if (!res.destroyed) res.write(JSON.stringify({ result, done: false }) + '\n'); }
      else write(result, false);
    } : undefined });
    // Explicit expiry travels with the result. No additional HTTP cache may extend URL lifetime.
    if (streaming) {
      if (res.headersSent) { if (!res.destroyed) res.write(JSON.stringify({ result, done: true }) + '\n'); }
      else write(result, true);
      res.end();
    } else { res.setHeader('Cache-Control', 'no-store'); send(200, result); }
  } catch (error) {
    const detail = (error ?? {}) as { status?: number; diagnostic?: string };
    const status = detail.status === 400 ? 400 : 500;
    if (status === 500) console.error('[images] image_resolution_failed');
    if (res.headersSent) { if (!res.destroyed) res.end(JSON.stringify({ error: 'Images unavailable', done: true }) + '\n'); }
    else send(status, { error: status === 400 ? 'Choose a known dictionary word and meaning.' : 'Images unavailable', diagnostic: ['dictionary_word_not_found', 'sense_not_found'].includes(detail.diagnostic ?? '') ? detail.diagnostic : 'image_resolution_failed' });
  }
}
