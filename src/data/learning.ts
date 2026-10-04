import runtime from './learning-runtime.json';
import type { Word } from '../types';
// Generated from unchanged editorial source using the full classifier at build time.
export const words = runtime.words as Word[];
export const categories = runtime.categories;
export const byId = new Map(words.map(word => [word.id, word]));
