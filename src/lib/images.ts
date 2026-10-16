import type { ImageMode, ImageResult, Sense, Word } from '../types';
import { offlineGallery } from '../data/photos';
import { IMAGE_TTL, imageCacheKey, visualQuery } from './visual';
import { TARGET_GALLERY_SIZE } from './visual-schema';
const cache = new Map<string, ImageResult>();
const pending = new Map<string, Promise<ImageResult>>();
const listeners = new Map<string, Set<(result: ImageResult) => void>>();
const partial = new Map<string, ImageResult>();
let retryAfter = 0;
function cached(key: string) {
  const result = cache.get(key);
  if (result && result.expiresAt! > Date.now()) return result;
  cache.delete(key);
}
export function cachedImages(word: Word, sense: Sense, mode: ImageMode): ImageResult | undefined {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return undefined;
  const base = imageCacheKey(word, sense);
  const hit = cached(`${base}|${mode}`);
  if (hit || mode === 'gallery') return hit;
  const gallery = cached(`${base}|gallery`);
  return gallery ? { ...gallery, images: gallery.images.slice(0, 1) } : undefined;
}
export function fetchImages(word: Word, sense: Sense, retry = false, mode: ImageMode = 'gallery', onProgress?: (result: ImageResult) => void): Promise<ImageResult> {
  if (!visualQuery(sense)) return Promise.resolve({ images: [], status: 'unavailable' });
  if (typeof navigator !== 'undefined' && !navigator.onLine) return Promise.resolve({ images: word.photo && sense.id === word.senses[0].id ? offlineGallery(word.photo, sense.english).slice(0, mode === 'thumbnail' ? 1 : TARGET_GALLERY_SIZE) : [], status: 'curated' });
  const base = imageCacheKey(word, sense); const key = `${base}|${mode}`;
  const single = (result: ImageResult): ImageResult => ({ ...result, images: result.images.slice(0, 1) });
  if (mode === 'thumbnail') {
    const gallery = cached(`${base}|gallery`); if (gallery) return Promise.resolve(single(gallery));
    const available = partial.get(`${base}|gallery`); if (available && available.expiresAt! > Date.now()) return Promise.resolve(single(available));
    if (pending.has(`${base}|gallery`)) return pending.get(`${base}|gallery`)!.then(single);
  }
  if (retry) cache.delete(key);
  const hit = cached(key); if (hit) return Promise.resolve(hit);
  if (Date.now() < retryAfter) return Promise.reject(new Error('Too many picture requests. Try again in a minute.'));
  if (onProgress) {
    const observers = listeners.get(key) ?? new Set(); observers.add(onProgress); listeners.set(key, observers);
    const current = partial.get(key); if (current) { try { onProgress(current); } catch { /* observer only */ } }
  }
  if (pending.has(key)) return pending.get(key)!;
  const request = fetch(`/api/images?word=${encodeURIComponent(word.id)}&sense=${encodeURIComponent(sense.id)}&mode=${mode}`, { cache: 'no-store', headers: mode === 'gallery' ? { Accept: 'application/x-ndjson' } : undefined, signal: AbortSignal.timeout(10000) }).then(async response => {
    if (!response.ok) {
      if (response.status === 429) retryAfter = Date.now() + Math.max(60, Math.min(Number(response.headers?.get('Retry-After')) || 60, 86400)) * 1000;
      throw new Error(response.status === 429 ? 'Too many picture requests. Try again in a minute.' : '图片暂时无法载入。 Pictures are temporarily unavailable.');
    }
    const validate = (body: ImageResult): ImageResult => {
      if (!body || !Array.isArray(body.images) || !['live', 'curated', 'unavailable'].includes(body.status)) throw new Error('Pictures are temporarily unavailable.');
      const expiry = typeof body.expiresAt === 'number' && Number.isFinite(body.expiresAt) ? body.expiresAt : Date.now() + IMAGE_TTL;
      const expiresAt = Math.min(expiry, Date.now() + (body.status === 'live' ? IMAGE_TTL : 60_000), ...body.images.map(p => typeof p.expiresAt === 'number' && Number.isFinite(p.expiresAt) ? p.expiresAt : Infinity));
      if (expiresAt <= Date.now()) throw new Error('Pictures have expired. Please try again.');
      const result = { ...body, expiresAt, images: body.images.slice(0, mode === 'thumbnail' ? 1 : TARGET_GALLERY_SIZE) };
      return result;
    };
    let result: ImageResult;
    if (response.headers?.get('Content-Type')?.includes('application/x-ndjson') && response.body) {
      const reader = response.body.getReader(); const decoder = new TextDecoder();
      let buffer = '', bytes = 0, final: ImageResult | undefined;
      const line = (value: string) => {
        if (!value.trim()) return;
        if (final) throw new Error('Invalid picture stream.');
        const event = JSON.parse(value) as { result: ImageResult; done: boolean };
        if (typeof event.done !== 'boolean') throw new Error('Invalid picture stream.');
        const next = validate(event.result);
        if (event.done) final = next;
        else {
          partial.set(key, next);
          for (const observer of listeners.get(key) ?? []) { try { observer(next); } catch { /* observer only */ } }
        }
      };
      try {
        while (true) {
          const chunk = await reader.read(); if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > 1024 * 1024) throw new Error('Invalid picture stream.');
          buffer += decoder.decode(chunk.value, { stream: true });
          let end: number;
          while ((end = buffer.indexOf('\n')) >= 0) { line(buffer.slice(0, end)); buffer = buffer.slice(end + 1); }
        }
        buffer += decoder.decode(); line(buffer);
        if (!final) throw new Error('Picture search interrupted. Please retry.');
        result = final;
      } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
    } else result = validate(await response.json());
    cache.set(key, result);
    if (cache.size > 100) cache.delete(cache.keys().next().value!);
    return result;
  }).finally(() => { pending.delete(key); listeners.delete(key); partial.delete(key); });
  pending.set(key, request); return request;
}
export function clearBrowserImageCache() { cache.clear(); pending.clear(); listeners.clear(); partial.clear(); retryAfter = 0; }
