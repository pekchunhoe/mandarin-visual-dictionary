import type { Photo } from '../types';
import appleGallery from './apple-gallery.json';
import dimensions from './photo-metadata.json';
// Real, locally cached Pexels photos. IDs link to their original source, never invented credits.
export const photoIds: Record<string, number> = { apple: 102104, cat: 1170986, dog: 1108099, bird: 326900, fish: 128756, elephant: 3739327, banana: 61127, watermelon: 1313267, airplane: 358319, car: 170811, house: 106399, umbrella: 35625424, book: 5503752, school: 256541, doctor: 5452201, running: 2526878, happy: 3760854, cold: 688660, tree: 8905675, flower: 736230 };
export function localPhoto(key: string, label: string): Photo | undefined {
  const id = photoIds[key]; if (!id) return;
  const size = dimensions[key as keyof typeof dimensions];
  return { id: `pexels-${id}`, thumbnailUrl: `/photos/${key}.jpg`, largeUrl: `/photos/${key}.jpg`, ...size, alt: label, source: 'Pexels', sourceUrl: `https://www.pexels.com/photo/${id}/` };
}
export function offlineGallery(photoKey: string, label: string): Photo[] {
  const cover = localPhoto(photoKey, label); if (!cover) return [];
  if (photoKey !== 'apple') return [cover];
  return [cover, ...appleGallery.map(p => ({ id: `pexels-${p.id}`, thumbnailUrl: `/photos/${p.key}.jpg`, largeUrl: `/photos/${p.key}.jpg`, ...dimensions[p.key as keyof typeof dimensions], alt: p.alt, photographer: p.photographer, photographerUrl: `https://www.pexels.com/photo/${p.id}/`, source: 'Pexels', sourceUrl: `https://www.pexels.com/photo/${p.id}/` }))];
}
