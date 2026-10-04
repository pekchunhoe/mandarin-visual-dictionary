import type { IncomingMessage, ServerResponse } from 'node:http';
import { getImages } from '../server/images';
const buckets = new Map<string, { count: number; until: number }>();
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  const send = (status: number, data: unknown) => { res.statusCode = status; res.end(JSON.stringify(data)); };
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return send(405, { error: 'Method not allowed' }); }
  const url = new URL(req.url ?? '/', 'http://localhost');
  const word = url.searchParams.get('word') ?? ''; const sense = url.searchParams.get('sense') ?? '';
  const mode = url.searchParams.get('mode') ?? 'gallery';
  if (!word || word.length > 40 || !/^sense-\d+$/.test(sense) || !['gallery', 'thumbnail'].includes(mode) || [...url.searchParams.keys()].some(k => !['word', 'sense', 'mode'].includes(k) || url.searchParams.getAll(k).length > 1)) return send(400, { error: 'Invalid dictionary word or sense.' });
  const forwarded = req.headers['x-vercel-forwarded-for'];
  const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress) ?? 'unknown';
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.until < now) buckets.delete(key);
  if (buckets.size >= 5000 && !buckets.has(ip)) return send(429, { error: 'Please try again in a minute.' });
  const bucket = buckets.get(ip) ?? { count: 0, until: now + 60_000 }; buckets.set(ip, bucket);
  if (++bucket.count > 30) { res.setHeader('Retry-After', '60'); return send(429, { error: 'Please try again in a minute.' }); }
  try {
    const result = await getImages(word, sense, { pixabayKey: process.env.PIXABAY_API_KEY, pexelsKey: process.env.PEXELS_API_KEY, mode: mode as 'gallery' | 'thumbnail' });
    // Explicit expiry travels with the result. No additional HTTP cache may extend URL lifetime.
    res.setHeader('Cache-Control', 'no-store');
    send(200, result);
  } catch (error) { const status = (error as { status?: number }).status === 400 ? 400 : 500; send(status, { error: status === 400 ? 'Choose a known dictionary word and meaning.' : 'Images unavailable' }); }
}
