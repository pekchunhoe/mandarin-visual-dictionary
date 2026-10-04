import { buildVisualQuery } from './visual-inference';
import { createDictionaryEntries } from './dictionary-entry-core';
export { canonicalWordId, canonicalSenseId } from './dictionary-entry-core';
export type { RawRow } from './dictionary-entry-core';
export const { fromRow, refreshWordVisuals } = createDictionaryEntries(buildVisualQuery);
