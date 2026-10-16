import type { MalayTranslation } from '../types';

// Untyped legacy text is never inferred to be lexical just because it is short.
export function malayContent(sense: MalayTranslation) {
  return {
    lexical: sense.malayLexical?.text ?? (sense.translationKind === 'lexical-equivalent' ? sense.malay : undefined),
    definition: sense.malayDefinition?.text ?? (sense.translationKind === 'definition-translation' ? sense.malay : undefined),
    legacy: !sense.translationKind ? sense.malay : undefined
  };
}
export function primaryMalay(sense: MalayTranslation) {
  const content = malayContent(sense);
  return content.lexical ?? content.legacy ?? content.definition;
}
