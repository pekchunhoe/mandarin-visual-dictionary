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
import { candidateSemantics, enoughSemanticCoverage, type CompositionDecision, type SemanticFacet } from './semantic-gallery';
import { clearOpenverseTokens, openverseConfiguration, openverseToken, rejectOpenverseToken, type OpenverseCredentials } from './openverse-auth';
export { normalizePexels } from './providers';

interface CachedSearch { images: Photo[]; expiresAt: number; failed?: boolean; diagnostic?: string }
const cache = new Map<string, CachedSearch>();
const pending = new Map<string, Promise<CachedSearch>>();
const cooldown = new Map<string, number>();
export interface CompetitionTrace {
  stage: 'plan' | 'provider' | 'round' | 'final';
  wordId?: string; senseId?: string; english?: string; queries?: string[];
  provider?: ImageProvider; query?: string; cache?: 'hit' | 'pending' | 'miss' | 'cooldown';
  raw?: number; normalized?: number; diagnostic?: string; elapsedMs?: number;
  candidates?: number; duplicates?: number; rejected?: number;
  facets?: SemanticFacet[]; composition?: CompositionDecision[];
  evaluated?: { id: string; provider?: string; score: number; semantic: boolean; excluded?: boolean; facets: string[]; cluster: string }[];
  providerDistribution?: Record<string, number>; facetDistribution?: Record<string, number>;
  selected?: { id: string; provider?: string; score: number }[];
}
interface Options extends OpenverseCredentials { pixabayKey?: string; pexelsKey?: string; fetcher?: typeof fetch; mode?: ImageMode; onTrace?: (event: CompetitionTrace) => void }
// Opt-in server/test instrumentation. No URLs, credentials, headers, upstream
// bodies or automatic production logging; observer errors never affect results.
function observe(options: Options, event: CompetitionTrace) { try { options.onTrace?.(event); } catch { /* diagnostic observer only */ } }
function cached(key: string) {
  const value = cache.get(key);
  if (value && value.expiresAt > Date.now()) return value;
  cache.delete(key);
}
async function searchProvider(provider: ImageProvider, search: ImageSearch, secret: string, options: Options, deadline: number): Promise<CachedSearch> {
  const trace = (cache: CompetitionTrace['cache']) => observe(options, { stage: 'provider', provider, query: search.query, cache });
  // Credential changes invalidate old authentication failures without exposing keys.
  const configuration = `${provider}:${provider === 'openverse' ? openverseConfiguration(options) : createHash('sha256').update(secret).digest('hex').slice(0, 16)}`;
  const base = `${providerCacheKey(provider, search)}|${configuration}`;
  const galleryKey = `${base}|gallery`;
  // Visible cards may reuse a full search already requested by a detail page.
  if (options.mode === 'thumbnail') {
    const full = cached(galleryKey); if (full) { trace('hit'); return full; }
    if (pending.has(galleryKey)) { trace('pending'); return pending.get(galleryKey)!; }
  }
  const key = `${base}|${options.mode ?? 'gallery'}`;
  const hit = cached(key); if (hit) { trace('hit'); return hit; }
  if (pending.has(key)) { trace('pending'); return pending.get(key)!; }
  const unavailable = (diagnostic = `${provider}_upstream_failure`): CachedSearch => ({ images: [], failed: true, expiresAt: Date.now() + 60_000, diagnostic });
  if ((cooldown.get(configuration) ?? 0) > Date.now()) { trace('cooldown'); return unavailable(`${provider}_cooldown`); }
  if (deadline <= Date.now()) return unavailable(`${provider}_timeout`);
  const request = (async () => {
    const started = Date.now(); trace('miss');
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
      const records = body as { hits?: unknown[]; results?: unknown[]; photos?: unknown[] };
      observe(options, { stage: 'provider', provider, query: search.query, raw: (records.hits ?? records.results ?? records.photos)?.length ?? 0, normalized: images.length, elapsedMs: Date.now() - started });
      result = { images, expiresAt, diagnostic: images.length ? undefined : `${provider}_empty_results` };
    } catch (error) { result = unavailable(error instanceof Error && /^(TimeoutError|AbortError)$/.test(error.name) ? `${provider}_timeout` : diagnostic); }
    if (result.failed) observe(options, { stage: 'provider', provider, query: search.query, diagnostic: result.diagnostic, elapsedMs: Date.now() - started });
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
  let composition: CompositionDecision[] = [];
  const ranked = () => rankImageCandidates(images, plan, limit, decisions => { composition = decisions; });
  const enough = () => enoughSemanticCoverage(ranked(), plan, options.mode === 'thumbnail');
  observe(options, { stage: 'plan', wordId: word.id, senseId: sense.id, english: plan.meaning, facets: plan.facets, queries: plan.searches.map(c => c.query) });
  const failedProviders = new Set<ImageProvider>();
  let openverseAttempted = false;
  const collect = (provider: ImageProvider, result: CachedSearch) => {
    images.push(...result.images); failed ||= !!result.failed;
    if (result.failed) failedProviders.add(provider);
    if (result.images.length && !result.images.some(photo => imageRelevance(photo, plan).semantic)) diagnostics.push(`${provider}_relevance_rejected`);
    if (result.diagnostic) diagnostics.push(result.diagnostic);
  };
  const snapshot = (stage: 'round' | 'final', selected?: Photo[]) => {
    if (!options.onTrace) return;
    const chosen = selected ?? ranked();
    const providerDistribution: Record<string, number> = {}; const facetDistribution: Record<string, number> = {};
    for (const decision of composition) {
      const provider = decision.provider ?? 'curated'; providerDistribution[provider] = (providerDistribution[provider] ?? 0) + 1;
      for (const facet of decision.facets) facetDistribution[facet] = (facetDistribution[facet] ?? 0) + 1;
    }
    observe(options, {
      stage, composition, providerDistribution, facetDistribution, candidates: images.length,
      duplicates: images.length - deduplicateImages(images, images.length).length,
      rejected: images.filter(photo => !imageRelevance(photo, plan).semantic).length,
      evaluated: images.map(photo => { const semantics = candidateSemantics(photo, plan); return { id: photo.id, provider: photo.provider, ...imageRelevance(photo, plan), facets: semantics.facets, cluster: semantics.cluster }; }),
      selected: chosen.map(photo => ({ id: photo.id, provider: photo.provider, score: imageRelevance(photo, plan).score }))
    });
  };
  const rounds = plan.searches.slice(0, options.mode === 'thumbnail' ? 2 : 3);
  for (const search of rounds) {
    if (Date.now() >= deadline) break;
    const jobs: { provider: ImageProvider; request: Promise<CachedSearch> }[] = [];
    if (options.pixabayKey?.trim() && !failedProviders.has('pixabay'))
      jobs.push({ provider: 'pixabay', request: searchProvider('pixabay', search, options.pixabayKey.trim(), options, deadline) });
    else if (!options.pixabayKey?.trim()) diagnostics.push('pixabay_not_configured');
    if (!failedProviders.has('openverse')) {
      openverseAttempted = true;
      jobs.push({ provider: 'openverse', request: searchProvider('openverse', { ...search, category: undefined, imageType: 'all' }, '', options, deadline) });
    }
    const settled = await Promise.allSettled(jobs.map(job => job.request));
    settled.forEach((result, i) => collect(jobs[i].provider, result.status === 'fulfilled' ? result.value : {
      images: [], failed: true, expiresAt: Date.now() + 60_000, diagnostic: `${jobs[i].provider}_upstream_failure`
    }));
    snapshot('round');
    // This decision happens ONLY after both providers have had a chance.
    if (enough() || !jobs.length) break;
  }
  // Preserve the optional legacy provider, without making it compete with or
  // displace either normal provider before their shared rounds have completed.
  if (ranked().length < (options.mode === 'thumbnail' ? 1 : 6) && options.pexelsKey?.trim()) {
    const legacy = plan.relevance.idiom && !options.pixabayKey?.trim() ? rounds : [plan.primary];
    for (const search of legacy) {
      if (Date.now() >= deadline) break;
      const result = await searchProvider('pexels', search, options.pexelsKey.trim(), options, deadline);
      collect('pexels', result);
      if (result.failed || enough()) break;
    }
  }
  const ordered = ranked();
  snapshot('final', ordered);
  const relevant = ordered.filter(photo => imageRelevance(photo, plan).semantic);
  if (!openverseAttempted) diagnostics.push('openverse_not_called');
  if (images.length && !relevant.length) diagnostics.push('all_results_below_threshold');
  // Do not pad a clear subject with broad-category hits just to reach twelve.
  // Sparse/absent metadata is not semantic evidence.
  const live = relevant.slice(0, limit);
  if (live.length) return { images: live, status: 'live', diagnostics: [...new Set(diagnostics)], expiresAt: Math.min(...live.map(p => p.expiresAt!)) };
  return { images: fallback, status: fallback.length ? 'curated' : 'unavailable', expiresAt: Date.now() + 60_000,
    diagnostics: [...new Set([...diagnostics, 'fallback_used'])],
    message: failed ? '图片暂时无法载入。 You can still learn this word. Pictures are temporarily unavailable.' : fallback.length ? 'No additional pictures are available for this meaning yet. Showing available curated pictures.' : '暂时找不到合适的图片。 Try another meaning or word.' };
}
export function clearImageCache() { cache.clear(); pending.clear(); cooldown.clear(); clearOpenverseTokens(); }
