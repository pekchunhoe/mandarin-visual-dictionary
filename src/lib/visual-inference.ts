import lexicon from '../data/visual-lexicon.json';
import { createVisualInference } from './visual-inference-core';
export { VISUAL_SCHEMA } from './visual-schema';
export type { VisualIntent } from './visual-inference-core';
// Server/build entry. The browser worker supplies data asynchronously instead.
export const { normalizeVisualMeaning, participle, buildVisualQuery, inferVisualIntent } = createVisualInference(lexicon);
