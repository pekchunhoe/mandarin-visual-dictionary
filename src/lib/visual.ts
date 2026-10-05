import type { Photo, Sense, Word } from '../types';
import { VISUAL_SCHEMA, IMAGE_RELEVANCE_SCHEMA } from './visual-schema';
export function visualQuery(sense: Sense): string | null {
  if (sense.visualOrigin === 'curated' && sense.visualType === 'abstract') return null;
  if (sense.visualQuery && sense.visualType !== 'abstract') return sense.visualQuery;
  return null; // All UI senses arrive classified by the build or dictionary worker.
}
export const IMAGE_TTL = 86_400_000;
export function imageCacheKey(word: Word, sense: Sense) { return JSON.stringify([VISUAL_SCHEMA, IMAGE_RELEVANCE_SCHEMA, 'pixabay>pexels>curated', word.id, sense.id, visualQuery(sense)?.trim().replace(/\s+/g, ' ').toLowerCase() ?? 'explanation', sense.visualType, word.category ?? '', 'photo+all']); }
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
  try { const url = new URL(value, 'https://local.invalid'); return `${url.hostname}${url.pathname.replace(/_(?:150|180|340|640|960|1280|1920)(?=\.[a-z]+$)/i, '')}`; } catch { return value; }
}
export function deduplicateImages(images: Photo[], limit = 12): Photo[] {
  const ids = new Set<string>(); const urls = new Set<string>();
  return images.filter(image => {
    const identities = [image.thumbnailUrl, image.displayUrl, image.largeUrl].filter((url): url is string => !!url).map(imageIdentity);
    if (ids.has(image.id) || identities.some(url => urls.has(url)) || !Number.isFinite(image.width) || !Number.isFinite(image.height) || image.width < 300 || image.height < 200) return false;
    if (!isImageUrl(image.thumbnailUrl) || !isImageUrl(image.largeUrl) || (image.displayUrl && !isImageUrl(image.displayUrl))) return false;
    ids.add(image.id); identities.forEach(url => urls.add(url)); return true;
  }).slice(0, limit);
}
