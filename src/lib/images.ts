import type { ImageMode, ImageResult, Sense, Word } from '../types';
import { offlineGallery } from '../data/photos';
import { IMAGE_TTL, imageCacheKey, visualQuery } from './visual';
const cache = new Map<string, ImageResult>();
const pending = new Map<string, Promise<ImageResult>>();
let retryAfter = 0;
function cached(key: string) {
  const result = cache.get(key);
  if (result && result.expiresAt! > Date.now()) return result;
  cache.delete(key);
}
export function fetchImages(word: Word, sense: Sense, retry = false, mode: ImageMode = 'gallery'): Promise<ImageResult> {
  if (!visualQuery(sense)) return Promise.resolve({ images: [], status: 'unavailable' });
  if (typeof navigator !== 'undefined' && !navigator.onLine) return Promise.resolve({ images: word.photo && sense.id === word.senses[0].id ? offlineGallery(word.photo, sense.english).slice(0, mode === 'thumbnail' ? 1 : 12) : [], status: 'curated' });
  const base = imageCacheKey(word, sense); const key = `${base}|${mode}`;
  const single = (result: ImageResult): ImageResult => ({ ...result, images: result.images.slice(0, 1) });
  if (mode === 'thumbnail') {
    const gallery = cached(`${base}|gallery`); if (gallery) return Promise.resolve(single(gallery));
    if (pending.has(`${base}|gallery`)) return pending.get(`${base}|gallery`)!.then(single);
  }
  if (retry) cache.delete(key);
  const hit = cached(key); if (hit) return Promise.resolve(hit);
  if (pending.has(key)) return pending.get(key)!;
  if (Date.now() < retryAfter) return Promise.reject(new Error('Too many picture requests. Try again in a minute.'));
  const request = fetch(`/api/images?word=${encodeURIComponent(word.id)}&sense=${encodeURIComponent(sense.id)}&mode=${mode}`, { cache: 'no-store', signal: AbortSignal.timeout(10000) }).then(async response => {
    if (!response.ok) {
      if (response.status === 429) retryAfter = Date.now() + Math.max(60, Math.min(Number(response.headers?.get('Retry-After')) || 60, 86400)) * 1000;
      throw new Error(response.status === 429 ? 'Too many picture requests. Try again in a minute.' : '图片暂时无法载入。 Pictures are temporarily unavailable.');
    }
    const body: ImageResult = await response.json();
    if (!body || !Array.isArray(body.images) || !['live', 'curated', 'unavailable'].includes(body.status)) throw new Error('Pictures are temporarily unavailable.');
    const expiry = typeof body.expiresAt === 'number' && Number.isFinite(body.expiresAt) ? body.expiresAt : Date.now() + IMAGE_TTL;
    const expiresAt = Math.min(expiry, Date.now() + (body.status === 'live' ? IMAGE_TTL : 60_000), ...body.images.map(p => typeof p.expiresAt === 'number' && Number.isFinite(p.expiresAt) ? p.expiresAt : Infinity));
    if (expiresAt <= Date.now()) throw new Error('Pictures have expired. Please try again.');
    const result = { ...body, expiresAt, images: body.images.slice(0, mode === 'thumbnail' ? 1 : 12) };
    cache.set(key, result);
    if (cache.size > 100) cache.delete(cache.keys().next().value!);
    return result;
  }).finally(() => pending.delete(key));
  pending.set(key, request); return request;
}
export function clearBrowserImageCache() { cache.clear(); pending.clear(); retryAfter = 0; }
