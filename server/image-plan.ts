import type { Sense, Word } from '../src/types';
import { visualQuery } from '../src/lib/visual';
import { inferVisualIntent, VISUAL_SCHEMA } from '../src/lib/visual-inference';
import { IMAGE_RELEVANCE_SCHEMA } from '../src/lib/visual-schema';
import { visualSearchPlan, type VisualSearchPlan } from './visual-search';
export const PIXABAY_CATEGORIES = ['backgrounds', 'fashion', 'nature', 'science', 'education', 'feelings', 'health', 'people', 'religion', 'places', 'animals', 'industry', 'computer', 'food', 'sports', 'transportation', 'travel', 'buildings', 'business', 'music'] as const;
export type PixabayCategory = typeof PIXABAY_CATEGORIES[number];
export type ImageType = 'photo' | 'illustration' | 'all';
export interface ImageSearch { wordId: string; senseId: string; query: string; category?: PixabayCategory; imageType: ImageType }
export function normalizeVisualQuery(value: string): string {
  const query = value.trim().replace(/\s+/g, ' ').toLowerCase();
  if (!query || [...query].length > 100 || /[\u0000-\u001f\u007f]/.test(query)) throw new Error('Invalid visual query');
  return query;
}
export function pixabayCategory(word: Word, sense: Sense): PixabayCategory | undefined {
  if (sense.visualType === 'abstract' || sense.visualType === 'conceptual') return;
  if (/\b(doctor|hospital|medical|healthcare)\b/.test(sense.visualQuery ?? '')) return 'health';
  if (sense.visualType === 'animal') return 'animals';
  if (['food', 'fruit', 'vegetable'].includes(sense.visualType)) return 'food';
  if (sense.visualType === 'vehicle') return 'transportation';
  if (sense.visualType === 'building') return 'buildings';
  if (sense.visualType === 'nature' || sense.visualType === 'weather') return 'nature';
  if (word.category === 'Transport') return 'transportation';
  if (sense.visualType === 'emotion') return 'feelings';
  if (sense.visualType === 'human-state') return 'people';
  if (sense.visualType === 'person') return 'people';
  if (word.category === 'School') return 'education';
  if (word.category === 'Nature' || word.category === 'Weather') return 'nature';
  if (sense.visualType === 'place' && /building|house/.test(sense.visualQuery ?? '')) return 'buildings';
  // Actions and ambiguous properties do not benefit from a forced category.
}
const primaryQueries: Record<string, string> = { '苹果': 'apple fruit', '飞机': 'passenger airplane', '雨伞': 'umbrella rain', '西瓜': 'watermelon fruit' };
export function imageSearchPlan(word: Word, sense: Sense): VisualSearchPlan | null {
  const query = visualQuery(sense); if (!query) return null;
  const reviewedPrimary = sense.id === word.senses[0].id ? primaryQueries[word.id] : undefined;
  const primary: ImageSearch = { wordId: word.id, senseId: sense.id, query: normalizeVisualQuery(reviewedPrimary ?? query), category: pixabayCategory(word, sense), imageType: sense.visualType === 'conceptual' ? 'all' : 'photo' };
  // One cheaper query broadens image type and removes optional category/context,
  // while preserving disambiguation for curated intents and action subjects.
  const inferred = inferVisualIntent(sense.english);
  const subject = sense.visualOrigin === 'curated' ? (inferred?.subject && query.startsWith(inferred.subject) ? inferred.subject : query) : inferred?.query === query ? inferred.fallback ?? inferred.subject : sense.visualSubject ?? query;
  const supporting = /financial institution|apple fruit/.test(primary.query) ? primary.query.replace(/ building$/, '') : subject;
  return visualSearchPlan(sense, primary, { ...primary, query: normalizeVisualQuery(supporting), category: undefined, imageType: 'all' });
}
export function providerCacheKey(provider: 'pixabay' | 'pexels', search: ImageSearch) {
  return JSON.stringify([VISUAL_SCHEMA, IMAGE_RELEVANCE_SCHEMA, provider, search.wordId, search.senseId, normalizeVisualQuery(search.query), search.category ?? '', search.imageType, 'safe=true', 'en', 'popular', 32, 300, 200]);
}
