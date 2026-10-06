import { resolveImageWord } from './dictionary';
import { offlineGallery } from '../src/data/photos';
import { deduplicateImages, IMAGE_TTL } from '../src/lib/visual';
import type { ImageMode, ImageResult, Photo } from '../src/types';
import { imageSearchPlan, providerCacheKey } from './image-plan';
import type { ImageSearch } from './image-plan';
import { providers } from './providers';
import type { ImageProvider } from './providers';
import { createHash } from 'node:crypto';
import { imageRelevance, rankImageCandidates } from './visual-search';
import { clearOpenverseTokens, openverseConfiguration, openverseToken, rejectOpenverseToken, type OpenverseCredentials } from './openverse-auth';
export { normalizePexels } from './providers';

interface CachedSearch { images: Photo[]; expiresAt: number; failed?: boolean; diagnostic?: string }
const cache = new Map<string, CachedSearch>();
const pending = new Map<string, Promise<CachedSearch>>();
const cooldown = new Map<string, number>();
interface Options extends OpenverseCredentials { pixabayKey?: string; pexelsKey?: string; fetcher?: typeof fetch; mode?: ImageMode }
function cached(key: string) {
  const value = cache.get(key);
  if (value && value.expiresAt > Date.now()) return value;
  cache.delete(key);
}
async function searchProvider(provider: ImageProvider, search: ImageSearch, secret: string, options: Options, deadline: number): Promise<CachedSearch> {
  // Credential changes invalidate old authentication failures without exposing keys.
  const configuration = `${provider}:${provider === 'openverse' ? openverseConfiguration(options) : createHash('sha256').update(secret).digest('hex').slice(0, 16)}`;
  const base = `${providerCacheKey(provider, search)}|${configuration}`;
  const galleryKey = `${base}|gallery`;
  // Visible cards may reuse a full search already requested by a detail page.
  if (options.mode === 'thumbnail') {
    const full = cached(galleryKey); if (full) return full;
    if (pending.has(galleryKey)) return pending.get(galleryKey)!;
  }
  const key = `${base}|${options.mode ?? 'gallery'}`;
  const hit = cached(key); if (hit) return hit;
  if (pending.has(key)) return pending.get(key)!;
  const unavailable = (diagnostic = `${provider}_upstream_failure`): CachedSearch => ({ images: [], failed: true, expiresAt: Date.now() + 60_000, diagnostic });
  if ((cooldown.get(configuration) ?? 0) > Date.now()) return unavailable(`${provider}_cooldown`);
  if (deadline <= Date.now()) return unavailable(`${provider}_timeout`);
  const request = (async () => {
    let result: CachedSearch; let diagnostic = `${provider}_upstream_failure`;
    try {
      const adapter = providers[provider];
      const fetcher = options.fetcher ?? fetch;
      const token = provider === 'openverse' ? await openverseToken(options, fetcher, deadline) : undefined;
      const send = (credential: string) => {
        if (deadline <= Date.now()) throw new DOMException('Image search timed out', 'TimeoutError');
        const upstream = adapter.request(search, credential, options.mode ?? 'gallery');
        return fetcher(upstream.url, { headers: upstream.headers, redirect: 'error', signal: AbortSignal.timeout(Math.max(1, Math.min(3500, deadline - Date.now()))) });
      };
      let response = await send(provider === 'openverse' ? token ?? '' : secret);
      // A revoked/rejected token must not block anonymous access. One retry only;
      // cooldown prevents repeatedly acquiring the same rejected credentials.
      if (provider === 'openverse' && token && [401, 403].includes(response.status)) {
        rejectOpenverseToken(options);
        response = await send('');
      }
      if (!response.ok) {
        if (response.status === 429) {
          const seconds = Number(response.headers?.get('Retry-After') || response.headers?.get('X-RateLimit-Reset'));
          diagnostic = `${provider}_rate_limited`;
          cooldown.set(configuration, Date.now() + Math.max(60, Math.min(Number.isFinite(seconds) ? seconds : 60, 86400)) * 1000);
        } else if (response.status === 401 || response.status === 403) { diagnostic = `${provider}_authentication_failed`; cooldown.set(configuration, Date.now() + 60_000); }
        throw new Error('Image provider unavailable');
      }
      const expiresAt = Date.now() + IMAGE_TTL;
      // Provider errors/URLs are never returned or logged. Reject any unexpected echo of the secret.
      const body: unknown = await response.json();
      const sensitive = [options.pixabayKey, options.pexelsKey, options.openverseClientId, options.openverseClientSecret, token].map(value => value?.trim()).filter((value): value is string => !!value);
      const serialized = JSON.stringify(body);
      if (sensitive.some(value => serialized.includes(value) || serialized.includes(encodeURIComponent(value)))) throw new Error('Invalid image response');
      const images = adapter.normalize(body, search.query).map(photo => ({ ...photo, expiresAt }));
      result = { images, expiresAt, diagnostic: images.length ? undefined : `${provider}_empty_results` };
    } catch (error) { result = unavailable(error instanceof Error && /^(TimeoutError|AbortError)$/.test(error.name) ? `${provider}_timeout` : diagnostic); }
    cache.set(key, result);
    if (cache.size > 500) cache.delete(cache.keys().next().value!);
    return result;
  })();
  pending.set(key, request);
  try { return await request; } finally { pending.delete(key); }
}
export async function getImages(wordId: string, senseId: string, options: Options = {}): Promise<ImageResult> {
  const word = resolveImageWord(wordId); const sense = word?.senses.find(s => s.id === senseId);
  if (!word || !sense) throw Object.assign(new Error('Choose a known dictionary word and meaning.'), { status: 400, diagnostic: !word ? 'dictionary_word_not_found' : 'sense_not_found' });
  const plan = imageSearchPlan(word, sense);
  if (!plan) return { images: [], status: 'unavailable', diagnostics: ['non_visual_word', 'no_plan', 'openverse_not_called'], message: 'This meaning is explained with words and diagrams.' };
  const limit = options.mode === 'thumbnail' ? 1 : 12;
  const fallback = word.photo && sense === word.senses[0] ? offlineGallery(word.photo, word.simplified + ' · ' + sense.english).slice(0, limit) : [];
  const images: Photo[] = []; let failed = false; const diagnostics: string[] = plan.relevance.englishFallback ? ['english_definition_plan'] : [];
  const deadline = Date.now() + 8000;
  const ranked = () => rankImageCandidates(images, plan);
  const enough = () => ranked().filter(photo => imageRelevance(photo, plan).semantic).length >= (options.mode === 'thumbnail' ? 1 : 6);
  let searchesUsed = 0;
  const providerOrder = ['pixabay', 'openverse', 'pexels'] as const;
  // Definition fallback plans try each ranked query on the primary provider,
  // then the secondary, before advancing. Bound to three pairs (two on cards).
  // This gives Openverse meaningful alternatives even after weak Pixabay hits.
  const sequence = plan.relevance.englishFallback
    ? [...plan.candidates.filter((c, i, all) => all.findIndex(item => item.query === c.query) === i)
      .slice(0, options.mode === 'thumbnail' ? 2 : 3).flatMap(search => providerOrder.slice(0, 2).map(provider => ({ provider, search }))), { provider: 'pexels' as const, search: plan.primary }]
    : providerOrder.map(provider => ({ provider, search: undefined }));
  const failedProviders = new Set<ImageProvider>();
  let openverseAttempted = false;
  for (const { provider, search: plannedSearch } of sequence) {
    if (failedProviders.has(provider)) continue;
    const secret = (provider === 'pixabay' ? options.pixabayKey : provider === 'pexels' ? options.pexelsKey : '')?.trim() ?? '';
    if (provider !== 'openverse' && !secret) { diagnostics.push(`${provider}_not_configured`); continue; }
    // Preserve primary semantic retries and the six-result stopping threshold.
    // Openverse uses remaining semantic queries within a four-search budget;
    // optional legacy Pexels still gets its final fallback opportunity.
    const searches = plannedSearch ? [{ ...plannedSearch, ...(provider === 'openverse' ? { category: undefined, imageType: 'all' as const } : {}) }] : provider === 'openverse'
      // Pixabay category/type variants do not change an Openverse query.
      ? plan.candidates.filter((candidate, index, all) => all.findIndex(item => item.query === candidate.query) === index)
        .slice(0, Math.min(options.mode === 'thumbnail' ? 2 : 3, Math.max(1, 4 - searchesUsed)))
        .map(candidate => ({ ...candidate, category: undefined, imageType: 'all' as const }))
      : provider === 'pixabay' || plan.relevance.idiom && !options.pixabayKey?.trim()
        ? plan.candidates.slice(0, options.mode === 'thumbnail' ? 2 : 3) : [plan.primary];
    for (const search of searches) {
      // Reserve three seconds for the secondary provider even if Pixabay stalls.
      const result = await searchProvider(provider, search, secret, options, provider === 'pixabay' ? deadline - 3000 : deadline);
      if (provider === 'openverse') openverseAttempted = true;
      searchesUsed++;
      images.push(...result.images); failed ||= !!result.failed;
      if (result.failed) failedProviders.add(provider);
      if (result.images.length && !rankImageCandidates(result.images, plan).some(photo => imageRelevance(photo, plan).semantic)) diagnostics.push(`${provider}_relevance_rejected`);
      if (result.diagnostic) diagnostics.push(result.diagnostic);
      if (result.failed || enough()) break;
    }
    if (enough()) break;
  }
  const ordered = ranked();
  const relevant = ordered.filter(photo => imageRelevance(photo, plan).semantic);
  if (!openverseAttempted) diagnostics.push('openverse_not_called');
  if (images.length && !relevant.length) diagnostics.push('all_results_below_threshold');
  // Do not pad a clear subject with broad-category hits just to reach twelve.
  // Sparse/absent metadata remains a small last resort, not semantic evidence.
  const live = (relevant.length ? relevant : ordered.filter(photo => !photo.tags?.length).slice(0, 2)).slice(0, limit);
  if (live.length) return { images: deduplicateImages([...live, ...fallback]).slice(0, limit), status: 'live', diagnostics: [...new Set(diagnostics)], expiresAt: Math.min(...live.map(p => p.expiresAt!)) };
  return { images: fallback, status: fallback.length ? 'curated' : 'unavailable', expiresAt: Date.now() + 60_000,
    diagnostics: [...new Set([...diagnostics, 'fallback_used'])],
    message: failed ? '图片暂时无法载入。 You can still learn this word. Pictures are temporarily unavailable.' : fallback.length ? 'No additional pictures are available for this meaning yet. Showing available curated pictures.' : '暂时找不到合适的图片。 Try another meaning or word.' };
}
export function clearImageCache() { cache.clear(); pending.clear(); cooldown.clear(); clearOpenverseTokens(); }
