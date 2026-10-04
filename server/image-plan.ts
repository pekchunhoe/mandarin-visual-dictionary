import type { Sense, Word } from '../src/types';
import { visualQuery } from '../src/lib/visual';
export const PIXABAY_CATEGORIES = ['backgrounds', 'fashion', 'nature', 'science', 'education', 'feelings', 'health', 'people', 'religion', 'places', 'animals', 'industry', 'computer', 'food', 'sports', 'transportation', 'travel', 'buildings', 'business', 'music'] as const;
export type PixabayCategory = typeof PIXABAY_CATEGORIES[number];
export type ImageType = 'photo' | 'illustration';
export interface ImageSearch { wordId: string; senseId: string; query: string; category?: PixabayCategory; imageType: ImageType }
export function normalizeVisualQuery(value: string): string {
  const query = value.trim().replace(/\s+/g, ' ').toLowerCase();
  if (!query || [...query].length > 100 || /[\u0000-\u001f\u007f]/.test(query)) throw new Error('Invalid visual query');
  return query;
}
export function pixabayCategory(word: Word, sense: Sense): PixabayCategory | undefined {
  if (sense.visualType === 'abstract') return;
  if (/\b(doctor|hospital|medical|healthcare)\b/.test(sense.visualQuery ?? '')) return 'health';
  if (sense.visualType === 'animal') return 'animals';
  if (sense.visualType === 'food') return 'food';
  if (word.category === 'Transport') return 'transportation';
  if (sense.visualType === 'emotion') return 'feelings';
  if (sense.visualType === 'person') return 'people';
  if (word.category === 'School') return 'education';
  if (word.category === 'Nature' || word.category === 'Weather') return 'nature';
  if (sense.visualType === 'place' && /building|house/.test(sense.visualQuery ?? '')) return 'buildings';
  // Actions and ambiguous properties do not benefit from a forced category.
}
const primaryQueries: Record<string, string> = { '苹果': 'apple fruit', '飞机': 'passenger airplane', '雨伞': 'umbrella rain', '西瓜': 'watermelon fruit' };
const supportingQueries: Record<string, string> = { '苹果': 'apple orchard', '猫': 'cat sitting', '飞机': 'airplane flying', '跑': 'person jogging', '雨伞': 'person holding umbrella' };
export function imageSearchPlan(word: Word, sense: Sense): { primary: ImageSearch; supporting: ImageSearch } | null {
  const query = visualQuery(sense); if (!query) return null;
  const reviewedPrimary = sense.id === word.senses[0].id ? primaryQueries[word.id] : undefined;
  const primary: ImageSearch = { wordId: word.id, senseId: sense.id, query: normalizeVisualQuery(reviewedPrimary ?? query), category: pixabayCategory(word, sense), imageType: 'photo' };
  const supporting = sense.id === word.senses[0].id ? supportingQueries[word.id] : undefined;
  return { primary, supporting: { ...primary, query: normalizeVisualQuery(supporting ?? primary.query), imageType: supporting ? 'photo' : 'illustration' } };
}
export function providerCacheKey(provider: 'pixabay' | 'pexels', search: ImageSearch) {
  return JSON.stringify([provider, search.wordId, search.senseId, normalizeVisualQuery(search.query), search.category ?? '', search.imageType, 'safe=true', 'en', 'popular', 32, 400, 300]);
}
