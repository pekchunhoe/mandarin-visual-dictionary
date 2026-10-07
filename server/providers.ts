import type { ImageMode, Photo } from '../src/types';
import { deduplicateImages, isImageUrl, isPublicHttpsUrl } from '../src/lib/visual';
import { normalizeVisualQuery, PIXABAY_CATEGORIES } from './image-plan';
import type { ImageSearch } from './image-plan';
export type ImageProvider = 'pixabay' | 'openverse' | 'pexels';
export interface ProviderAdapter { id: ImageProvider; request: (search: ImageSearch, key: string, mode: ImageMode) => { url: string; headers?: Record<string, string> }; normalize: (body: unknown, query: string) => Photo[] }
function record(value: unknown): Record<string, unknown> { return value && typeof value === 'object' ? value as Record<string, unknown> : {}; }
function text(value: unknown): string { return typeof value === 'string' ? value : ''; }
function dimension(value: unknown): number { return typeof value === 'number' && Number.isFinite(value) ? value : 0; }
function sourceUrl(value: unknown, hosts: string[]): string {
  try { const url = new URL(text(value)); return url.protocol === 'https:' && hosts.includes(url.hostname) && !url.username && !url.password && !url.port && !url.search ? url.href : ''; } catch { return ''; }
}
export function pixabayRequest(search: ImageSearch, key: string, mode: ImageMode = 'gallery') {
  if (!key || !['photo', 'illustration', 'all'].includes(search.imageType) || (search.category && !PIXABAY_CATEGORIES.includes(search.category))) throw new Error('Invalid image provider configuration');
  const params = new URLSearchParams({ key, q: normalizeVisualQuery(search.query), safesearch: 'true', lang: 'en', image_type: search.imageType, order: 'popular', per_page: mode === 'thumbnail' ? '3' : '20', min_width: '300', min_height: '200', orientation: 'all' });
  if (search.category) params.set('category', search.category);
  return { url: `https://pixabay.com/api/?${params}` };
}
export function normalizePixabay(hits: unknown[], query: string): Photo[] {
  const ranked = hits.slice(0, 32).flatMap((value, providerRank) => {
    const hit = record(value); const id = dimension(hit.id); const medium = text(hit.webformatURL); const large = text(hit.largeImageURL) || medium;
    const page = sourceUrl(hit.pageURL, ['pixabay.com', 'www.pixabay.com']);
    const width = dimension(hit.imageWidth); const height = dimension(hit.imageHeight); const aspect = width / height;
    if (!Number.isSafeInteger(id) || id <= 0 || !page || !isImageUrl(medium) || !isImageUrl(large) || width < 300 || height < 200 || aspect > 5 || aspect < 0.2) return [];
    const tags = text(hit.tags).split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 15);
    const photographer = text(hit.user).trim() || undefined; const userId = dimension(hit.user_id);
    const thumbnail = medium.replace(/_640(?=\.[a-z]+(?:\?|$))/i, '_340');
    const photo: Photo = { id: `pixabay-${id}`, provider: 'pixabay', providerRank, title: text(hit.title) || undefined, description: text(hit.description) || undefined, semanticAlt: text(hit.alt) || undefined, thumbnailUrl: thumbnail, displayUrl: medium, largeUrl: large, width, height, alt: tags.length ? tags.join(', ') : query, tags, photographer, photographerUrl: photographer && userId > 0 ? `https://pixabay.com/users/${encodeURIComponent(photographer)}-${userId}/` : undefined, source: 'Pixabay', sourceUrl: page, queryContext: query };
    if (['photo', 'illustration', 'vector'].includes(text(hit.type))) photo.imageType = hit.type as Photo['imageType'];
    return [photo];
  });
  // Keep the whole provider page until selected-sense reranking has run.
  return deduplicateImages(ranked, 32);
}
export function normalizePexels(photos: unknown[], query: string): Photo[] {
  return deduplicateImages(photos.flatMap(value => {
    const p = record(value); const src = record(p.src); const page = sourceUrl(p.url, ['www.pexels.com']); const id = dimension(p.id);
    if (!id || !page || !isImageUrl(text(src.medium)) || !isImageUrl(text(src.large))) return [];
    return [{ id: `pexels-${id}`, provider: 'pexels' as const, imageType: 'photo' as const, thumbnailUrl: text(src.medium), displayUrl: text(src.large), largeUrl: text(src.large), width: dimension(p.width), height: dimension(p.height), alt: text(p.alt) || query, tags: text(p.alt) ? [text(p.alt)] : [], photographer: text(p.photographer) || undefined, photographerUrl: sourceUrl(p.photographer_url, ['www.pexels.com']) || undefined, source: 'Pexels', sourceUrl: page, queryContext: query }];
  }), 24);
}
export function openverseRequest(search: ImageSearch, token: string, mode: ImageMode = 'gallery') {
  const params = new URLSearchParams({ q: normalizeVisualQuery(search.query), page_size: mode === 'thumbnail' ? '3' : '20', mature: 'false', license: 'by,by-sa,cc0,pdm' });
  return { url: `https://api.openverse.org/v1/images/?${params}`, headers: token ? { Authorization: `Bearer ${token}` } : undefined };
}
export function normalizeOpenverse(results: unknown[], query: string): Photo[] {
  const url = (value: unknown) => isPublicHttpsUrl(text(value)) ? text(value) : '';
  return deduplicateImages(results.slice(0, 32).flatMap((value, providerRank) => {
    const p = record(value); const id = text(p.id); const large = url(p.url); const page = url(p.foreign_landing_url);
    const width = dimension(p.width); const height = dimension(p.height); const aspect = width / height;
    const license = text(p.license).toLowerCase(); const licenseUrl = url(p.license_url);
    if (!/^[a-z0-9-]+$/i.test(id) || !large || !page || p.mature === true || width < 300 || height < 200 || aspect > 5 || aspect < 0.2 || !['by', 'by-sa', 'cc0', 'pdm'].includes(license) || !licenseUrl) return [];
    const title = text(p.title).trim();
    const tags = (Array.isArray(p.tags) ? p.tags.map(tag => text(record(tag).name)) : []).filter(Boolean).slice(0, 32);
    return [{ id: `openverse-${id}`, provider: 'openverse' as const, providerRank, description: text(p.description) || undefined, semanticAlt: text(p.alt_text) || text(p.alt) || undefined, thumbnailUrl: url(p.thumbnail) || large, displayUrl: large, largeUrl: large, width, height, alt: title || query, title: title || undefined, tags, photographer: text(p.creator) || undefined, photographerUrl: url(p.creator_url) || undefined, source: 'Openverse', sourceUrl: page, originalProvider: text(p.provider) || undefined, originalSource: text(p.source) || undefined, license, licenseVersion: text(p.license_version) || undefined, licenseUrl, attribution: text(p.attribution) || undefined, queryContext: query }];
  }), 32);
}
export const providers: Record<ImageProvider, ProviderAdapter> = {
  openverse: { id: 'openverse', request: openverseRequest, normalize(body, query) { const results = record(body).results; if (!Array.isArray(results)) throw new Error('Invalid image response'); return normalizeOpenverse(results, query); } },
  pixabay: { id: 'pixabay', request: pixabayRequest, normalize(body, query) { const hits = record(body).hits; if (!Array.isArray(hits)) throw new Error('Invalid image response'); return normalizePixabay(hits, query); } },
  pexels: { id: 'pexels', request: (search, key, mode) => ({ url: `https://api.pexels.com/v1/search?query=${encodeURIComponent(search.query)}&per_page=${mode === 'thumbnail' ? 1 : 24}&locale=en-US`, headers: { Authorization: key } }), normalize(body, query) { const photos = record(body).photos; if (!Array.isArray(photos)) throw new Error('Invalid image response'); return normalizePexels(photos, query); } }
};
