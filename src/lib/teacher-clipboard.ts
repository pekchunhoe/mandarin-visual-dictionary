import type { RelationResult, TrilingualText } from './ai-teacher-schema';
export const EMPTY_ANTONYMS = '没有常用的反义词。\nEnglish: No commonly recognized antonym.\nBahasa Melayu: Tiada antonim yang lazim digunakan.';
export const EMPTY_SYNONYMS = '没有常用的近义词。\nEnglish: No commonly recognized synonym.\nBahasa Melayu: Tiada sinonim yang lazim digunakan.';
export const sentenceText = (row: TrilingualText) => `中文：${row.chinese}\nEnglish: ${row.english}\nBahasa Melayu: ${row.malay}`;
export function relationsText(result: RelationResult) {
  const rows = (items: TrilingualText[]) => items.map(row => `${row.chinese} — ${row.english} — ${row.malay}`).join('\n');
  return `搜索词：${result.word}\n\n近义词 · Synonyms\n${rows(result.synonyms) || EMPTY_SYNONYMS}\n\n反义词 · Antonyms\n${rows(result.antonyms) || EMPTY_ANTONYMS}`;
}
export async function copyTeacherText(text: string) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return; } catch { /* Supported legacy fallback below. */ }
  }
  const previous = document.activeElement as HTMLElement | null;
  const field = document.createElement('textarea');
  field.value = text; field.readOnly = true; field.setAttribute('aria-label', 'Copy learning content');
  field.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
  document.body.append(field);
  try {
    field.focus(); field.select(); field.setSelectionRange(0, field.value.length);
    if (!document.execCommand?.('copy')) throw new Error('Copy unavailable');
  } finally { field.remove(); previous?.focus({ preventScroll: true }); }
}
