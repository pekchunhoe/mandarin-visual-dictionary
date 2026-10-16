import type { MalayTranslation } from '../types';
import { malayContent } from '../lib/malay-content';
import { translationLabel } from '../lib/translation-label';

export function MalayMeaning({ sense }: { sense: MalayTranslation }) {
  const content = malayContent(sense);
  return <div className="malay-meanings">
    {content.lexical && <div className="malay-lexical"><span className="eyebrow">BAHASA MELAYU</span><p lang="ms">{content.lexical}</p><small className="translation-quality">{sense.malayLexical ? (sense.malayLexical.status === 'verified' ? 'Reviewed Malay equivalent' : 'Provisional equivalent · awaiting language review') : translationLabel(sense)}</small></div>}
    {content.definition && <div className="malay-definition"><span className="eyebrow">PENERANGAN BAHASA MELAYU</span><p lang="ms">{content.definition}</p><small className="translation-quality">{sense.malayDefinition ? (sense.malayDefinition.status === 'verified' ? 'Reviewed Malay explanation' : 'Provisional explanation · awaiting language review') : translationLabel(sense)}</small></div>}
    {content.legacy && <div><span className="eyebrow">MAKNA BAHASA MELAYU</span><p lang="ms">{content.legacy}</p><small className="translation-quality">{translationLabel(sense)}</small></div>}
    {!content.lexical && !content.definition && !content.legacy && <div><span className="eyebrow">MAKNA BAHASA MELAYU</span><p lang="ms" className="subtle">Makna ini belum diterjemahkan.</p></div>}
  </div>;
}
