import type { MalayTranslation } from '../types';

export function translationLabel(sense: MalayTranslation): string {
  if (sense.translationStatus === 'verified') return 'Reviewed Malay meaning';
  if (sense.translationVersion === 'sense-lexical-enrichment-v1') return 'Provisional dictionary equivalent · awaiting language review';
  if (sense.translationStatus === 'generated' && sense.translationKind) {
    return sense.translationKind === 'definition-translation'
      ? 'Machine-translated English definition · awaiting language review'
      : 'Machine-translated equivalent · awaiting language review';
  }
  return 'Malay meaning awaiting language review';
}
