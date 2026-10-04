export type VisualType = 'object' | 'person' | 'place' | 'animal' | 'food' | 'action' | 'emotion' | 'property' | 'abstract';
export interface Example { chinese: string; pinyin: string; english: string; malay: string }
export interface Sense { id: string; english: string; malay?: string; chineseExplanation?: string; partOfSpeech?: string; visualType: VisualType; visualQuery?: string; examples: Example[]; relationship?: [string, string, string]; contexts?: string[] }
export interface Word { id: string; simplified: string; traditional: string; pinyin: string; numericPinyin: string; senses: Sense[]; category?: string; photo?: string; related?: string[]; source: 'CC-CEDICT' }
export interface Photo { id: string; thumbnailUrl: string; displayUrl?: string; largeUrl: string; width: number; height: number; alt: string; photographer?: string; photographerUrl?: string; source: string; sourceUrl: string; provider?: 'pixabay' | 'pexels'; tags?: string[]; queryContext?: string; expiresAt?: number }
export interface ImageResult { images: Photo[]; status: 'live' | 'curated' | 'unavailable'; message?: string; expiresAt?: number }
export type ImageMode = 'gallery' | 'thumbnail';
