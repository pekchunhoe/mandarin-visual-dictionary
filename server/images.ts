import { byId } from '../src/data/learning';
import { offlineGallery } from '../src/data/photos';
import { deduplicateImages, IMAGE_TTL } from '../src/lib/visual';
import type { ImageMode, ImageResult, Photo } from '../src/types';
import { imageSearchPlan, providerCacheKey } from './image-plan';
import type { ImageSearch } from './image-plan';
import { providers } from './providers';
import type { ImageProvider } from './providers';
export { normalizePexels } from './providers';

interface CachedSearch { images: Photo[]; expiresAt: number; failed?: boolean }
const cache = new Map<string, CachedSearch>();
const pending = new Map<string, Promise<CachedSearch>>();
const cooldown = new Map<ImageProvider, number>();
interface Options { pixabayKey?: string; pexelsKey?: string; fetcher?: typeof fetch; mode?: ImageMode }
function cached(key: string) {
  const value = cache.get(key);
  if (value && value.expiresAt > Date.now()) return value;
  cache.delete(key);
}
async function searchProvider(provider: ImageProvider, search: ImageSearch, secret: string, options: Options, deadline: number): Promise<CachedSearch> {
  const base = providerCacheKey(provider, search);
  const galleryKey = `${base}|gallery`;
  // Visible cards may reuse a full search already requested by a detail page.
  if (options.mode === 'thumbnail') {
    const full = cached(galleryKey); if (full) return full;
    if (pending.has(galleryKey)) return pending.get(galleryKey)!;
  }
  const key = `${base}|${options.mode ?? 'gallery'}`;
  const hit = cached(key); if (hit) return hit;
  if (pending.has(key)) return pending.get(key)!;
  const unavailable = (): CachedSearch => ({ images: [], failed: true, expiresAt: Date.now() + 60_000 });
  if ((cooldown.get(provider) ?? 0) > Date.now() || deadline <= Date.now()) return unavailable();
  const request = (async () => {
    let result: CachedSearch;
    try {
      const adapter = providers[provider];
      const upstream = adapter.request(search, secret, options.mode ?? 'gallery');
      const response = await (options.fetcher ?? fetch)(upstream.url, {
        headers: upstream.headers, redirect: 'error', signal: AbortSignal.timeout(Math.max(1, Math.min(3500, deadline - Date.now())))
      });
      if (!response.ok) {
        if (response.status === 429) {
          const seconds = Number(response.headers?.get('Retry-After') || response.headers?.get('X-RateLimit-Reset'));
          cooldown.set(provider, Date.now() + Math.max(60, Math.min(Number.isFinite(seconds) ? seconds : 60, 86400)) * 1000);
        } else if (response.status === 401 || response.status === 403) cooldown.set(provider, Date.now() + 60_000);
        throw new Error('Image provider unavailable');
      }
      const expiresAt = Date.now() + IMAGE_TTL;
      // Provider errors/URLs are never returned or logged. Reject any unexpected echo of the secret.
      const body: unknown = await response.json();
      if (JSON.stringify(body).includes(secret)) throw new Error('Invalid image response');
      const images = adapter.normalize(body, search.query).map(photo => ({ ...photo, expiresAt }));
      result = { images, expiresAt };
    } catch { result = unavailable(); }
    cache.set(key, result);
    if (cache.size > 500) cache.delete(cache.keys().next().value!);
    return result;
  })();
  pending.set(key, request);
  try { return await request; } finally { pending.delete(key); }
}
export async function getImages(wordId: string, senseId: string, options: Options = {}): Promise<ImageResult> {
  const word = byId.get(wordId); const sense = word?.senses.find(s => s.id === senseId);
  if (!word || !sense) throw Object.assign(new Error('Choose a known dictionary word and meaning.'), { status: 400 });
  const plan = imageSearchPlan(word, sense);
  if (!plan) return { images: [], status: 'unavailable', message: 'This meaning is explained with words and diagrams.' };
  const limit = options.mode === 'thumbnail' ? 1 : 12;
  const fallback = word.photo && sense === word.senses[0] ? offlineGallery(word.photo, word.simplified + ' · ' + sense.english).slice(0, limit) : [];
  const images: Photo[] = []; let failed = false;
  const deadline = Date.now() + 8000;
  for (const provider of ['pixabay', 'pexels'] as const) {
    const secret = (provider === 'pixabay' ? options.pixabayKey : options.pexelsKey)?.trim();
    if (!secret) continue;
    const searches = provider === 'pixabay' && options.mode !== 'thumbnail' ? [plan.primary, plan.supporting] : [plan.primary];
    for (const search of searches) {
      const result = await searchProvider(provider, search, secret, options, deadline);
      images.push(...result.images); failed ||= !!result.failed;
      if (result.failed || deduplicateImages(images).length >= (options.mode === 'thumbnail' ? 1 : 6)) break;
    }
    if (deduplicateImages(images).length >= (options.mode === 'thumbnail' ? 1 : 6)) break;
  }
  const live = deduplicateImages(images).slice(0, limit);
  if (live.length) return { images: deduplicateImages([...live, ...fallback]).slice(0, limit), status: 'live', expiresAt: Math.min(...live.map(p => p.expiresAt!)) };
  return { images: fallback, status: fallback.length ? 'curated' : 'unavailable', expiresAt: Date.now() + 60_000,
    message: failed ? '图片暂时无法载入。 The image service is unavailable. You can still learn this word.' : 'No additional pictures are available for this meaning yet. Showing available curated pictures.' };
}
export function clearImageCache() { cache.clear(); pending.clear(); cooldown.clear(); }
