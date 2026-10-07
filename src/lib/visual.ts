import type { Photo, Sense, Word } from '../types';
import { VISUAL_SCHEMA, IMAGE_RELEVANCE_SCHEMA, IMAGE_SEARCH_STRATEGY } from './visual-schema';
export function visualQuery(sense: Sense): string | null {
  if (sense.visualOrigin === 'curated' && sense.visualType === 'abstract') return null;
  if (sense.visualQuery && sense.visualType !== 'abstract') return sense.visualQuery;
  return null; // All UI senses arrive classified by the build or dictionary worker.
}
export const IMAGE_TTL = 86_400_000;
const facetLabels: Record<string, string> = { subject: 'Subject', expression: 'Expression', 'body-language': 'Body language', situation: 'Reaction', education: 'Learning', professional: 'Work', interaction: 'Interaction', recipient: 'Helping others', actor: 'People', environment: 'Setting', practice: 'Practice', appearance: 'Appearance', usage: 'Use', behavior: 'Behavior', symbol: 'Symbol', object: 'Object', 'self-directed': 'Personal action' };
export function pictureOverview(photos: Photo[]) {
  const covered = new Set<string>(); const chosen = new Set<number>();
  const samples = Array.from({ length: Math.min(3, photos.length) }, (_, i) => Math.floor((i + .5) * photos.length / Math.min(3, photos.length)));
  return samples.map(sample => {
    const indices = photos.map((_, i) => i).filter(i => !chosen.has(i));
    const facets = (i: number) => (photos[i].galleryFacets ?? ['subject']).filter(f => f !== 'symbol');
    indices.sort((a, b) => facets(b).filter(f => !covered.has(f)).length - facets(a).filter(f => !covered.has(f)).length || Math.abs(a - sample) - Math.abs(b - sample) || a - b);
    const index = indices[0]; chosen.add(index);
    const represented = facets(index); const label = represented.find(f => !covered.has(f)) ?? represented[0] ?? 'symbol';
    represented.forEach(f => covered.add(f));
    return { photo: photos[index], index, label: facetLabels[label] ?? 'Another view' };
  });
}
export function imageCacheKey(word: Word, sense: Sense) { return JSON.stringify([VISUAL_SCHEMA, IMAGE_RELEVANCE_SCHEMA, IMAGE_SEARCH_STRATEGY, word.id, sense.id, visualQuery(sense)?.trim().replace(/\s+/g, ' ').toLowerCase() ?? 'explanation', sense.visualType, word.category ?? '', 'photo+all']); }
// Openverse aggregates many hosts. Only its normalized results may use public
// HTTPS URLs outside the existing stock-provider allowlist; no server URL proxy.
export function isPublicHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value); const host = url.hostname.toLowerCase();
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(host) && !/^[\d.]+$/.test(host) &&
      !/(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(host);
  } catch { return false; }
}
export function photoLicense(photo: Photo): string {
  if (!photo.license) return '';
  const label = photo.license === 'pdm' ? 'Public Domain Mark' : photo.license === 'cc0' ? 'CC0' : `CC ${photo.license.toUpperCase()}`;
  return [label, photo.licenseVersion].filter(Boolean).join(' ');
}
export function isImageUrl(value: string): boolean {
  if (/^\/photos\/[a-z0-9-]+\.jpg$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && (
      url.hostname === 'images.pexels.com' && url.pathname.startsWith('/photos/') ||
      ['pixabay.com', 'www.pixabay.com', 'cdn.pixabay.com'].includes(url.hostname) && /^\/(get|photo|illustrations|vectors)\//.test(url.pathname)
    );
  } catch { return false; }
}
export function imageIdentity(value: string): string {
  try {
    const url = new URL(value, 'https://local.invalid');
    let path = url.pathname.replace(/_(?:150|180|340|640|960|1280|1920)(?=\.[a-z]+$)/i, '');
    // Flickr's documented size variants retain the same photo/secret identity.
    if (/(?:^|\.)staticflickr\.com$/.test(url.hostname)) path = path.replace(/_[sqtmnzwcbhko](?=\.[a-z]+$)/i, '');
    for (const key of [...url.searchParams.keys()]) if (/^(?:w|h|width|height|fit|crop|auto|quality|q|flip|fm|utm_.*)$/i.test(key)) url.searchParams.delete(key);
    url.searchParams.sort();
    return `${url.hostname}${path}${url.search}`;
  } catch { return value; }
}
function sourceIdentity(value: string): string {
  try {
    const url = new URL(value);
    for (const key of [...url.searchParams.keys()]) if (/^(?:utm_|ref$|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
    url.searchParams.sort();
    // Keep item IDs in query parameters: many museum source pages use them.
    return `${url.hostname.replace(/^www\./, '')}${url.pathname.replace(/\/$/, '')}${url.search}`;
  } catch { return ''; }
}
export function photoIdentityKeys(image: Photo): string[] {
  const page = sourceIdentity(image.sourceUrl);
  return [`id:${image.id}`, ...[image.thumbnailUrl, image.displayUrl, image.largeUrl].filter((url): url is string => !!url).map(url => `image:${imageIdentity(url)}`), ...(page ? [`page:${page}`] : [])];
}
export function deduplicateImages(images: Photo[], limit = 12): Photo[] {
  const ids = new Set<string>(); const urls = new Set<string>(); const pages = new Set<string>();
  return images.filter(image => {
    const identities = [image.thumbnailUrl, image.displayUrl, image.largeUrl].filter((url): url is string => !!url).map(imageIdentity);
    const page = sourceIdentity(image.sourceUrl);
    if (ids.has(image.id) || identities.some(url => urls.has(url)) || page && pages.has(page) || !Number.isFinite(image.width) || !Number.isFinite(image.height) || image.width < 300 || image.height < 200) return false;
    const validUrl = image.provider === 'openverse' ? isPublicHttpsUrl : isImageUrl;
    if (!validUrl(image.thumbnailUrl) || !validUrl(image.largeUrl) || (image.displayUrl && !validUrl(image.displayUrl))) return false;
    ids.add(image.id); identities.forEach(url => urls.add(url)); if (page) pages.add(page); return true;
  }).slice(0, limit);
}
