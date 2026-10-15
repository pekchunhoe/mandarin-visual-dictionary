import type { MalayTranslation } from '../types';

export function translationLabel(sense: MalayTranslation): string {
  if (sense.translationStatus === 'verified') return 'Reviewed Malay meaning';
  if (sense.translationStatus === 'generated' && sense.translationKind) {
    return sense.translationKind === 'definition-translation'
      ? 'Machine-translated English definition · awaiting language review'
      : 'Machine-translated equivalent · awaiting language review';
  }
  return 'Malay meaning awaiting language review';
}
