/** Remove dictionary annotations, preserving the English semantic clause. */
export function semanticEnglish(meaning: string): string {
  return meaning.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[øØ]/g, 'o').replace(/[łŁ]/g, 'l').replace(/[æÆ]/g, 'ae').replace(/ʻ/g, "'")
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/[\p{Script=Han}\p{Script=Bopomofo}\p{Script=Hiragana}\p{Script=Katakana}]+(?:\|[\p{Script=Han}]+)?/gu, ' ')
    .replace(/[|]/g, ' ').replace(/[“”"]/g, '').replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-').replace(/\b(Mr|Mrs|Ms|Dr|St)\./gi, '$1')
    .replace(/\b3D print(?:ing)?\b/gi, 'three dimensional printing')
    .replace(/\b([A-Za-z])\.(?=[A-Za-z]\.)/g, '$1').replace(/\.(?!\d)/g, ' ')
    .replace(/&/g, ' and ').replace(/°/g, ' degrees ').replace(/%/g, ' percent ')
    .replace(/[<>={}#_*~+]/g, ' ')
    .replace(/[·☯♦♥♣♠☺〔〕《》─√]/g, ' ').replace(/≥/g, ' at least ').replace(/⁄/g, ' to ')
    .replace(/\s+/g, ' ').trim();
}

export function withoutParentheses(value: string): string {
  let previous;
  do { previous = value; value = value.replace(/\([^()]*\)/g, ' '); } while (value !== previous);
  return value.replace(/\s+/g, ' ').trim();
}
