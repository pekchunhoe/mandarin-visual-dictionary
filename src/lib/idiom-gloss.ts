/** CC-CEDICT annotations observed in the checked-in corpus, not headword rules. */
const figurative = /\b(?:fig\.|figurative(?:ly)?\b)/i;
const idiomaticNote = /\bidiom(?:atic usage)?\b/i;
const referenceOnly = /^(?:cf\b|as .*\bthe idiom\b|in set phrases?\b)/i;
function isIdiomNote(note: string) {
  if (referenceOnly.test(note)) return false;
  return figurative.test(note) || idiomaticNote.test(note) ||
    /^(?:(?:ancient|European|Zen) )?proverb\b/i.test(note) ||
    /^(?:(?:an? auspicious|Buddhist|popular|traditional|Mao Zedong's) )?saying\b/i.test(note) ||
    /^(?:variant of a Sichuanese saying|admonishment derived from the saying|from the saying|2nd half of the saying)\b/i.test(note);
}
const prefix = /^(?:(?:fig\.|figuratively\b)\s*:?\s*|(?:idiom|figurative|proverb|saying)\s*:\s*)/i;

export function idiomGloss(meaning: string) {
  const original = meaning.trim().replace(/[’‘]/g, "'");
  if (!/fig\.|figurativ|\bidiom|\bproverb|\bsaying\b/i.test(original)) return { tagged: false, normalized: original, labels: [] as string[] };
  let tagged = false;
  const labels: string[] = [];
  let normalized = original.replace(/\(([^)]+)\)/g, (whole, note: string) => {
    if (!isIdiomNote(note)) return whole;
    tagged = true; labels.push(note);
    // Citation/usage labels are metadata. Semantic qualifiers are retained:
    // e.g. "also fig. beyond reason" and "fig. of a story with great momentum".
    if (/^(?:(?:modern|loan) )?idiom\b|^idiomatic usage$|proverb\b|saying\b|, idiom$/i.test(note)) return ' ';
    const content = note.replace(/\b(?:fig\.|figurative(?:ly)?\b)/gi, '')
      .replace(/\b(?:lit\.|literal|and|or|also|often|usu\.|usually|used|both)\b\.?/gi, ' ')
      .replace(/^[\s,.:;-]+|[\s,.:;-]+$/g, '').trim();
    return content ? `(${content})` : ' ';
  });
  normalized = normalized.split(/([;/])/).map(part => {
    let value = part.trim();
    // Labels may follow another recognized register annotation.
    const leading = value.match(/^(?:(?:coll\.|colloquial|slang|formal|informal)\s+)+/i)?.[0] ?? '';
    value = value.slice(leading.length);
    if (prefix.test(value) && value.replace(prefix, '').trim()) { tagged = true; labels.push(value.match(prefix)![0].trim()); value = value.replace(prefix, ''); }
    return leading + value;
  }).join(' ').replace(/\s+([;/])/g, '$1').replace(/\s+/g, ' ').trim();
  // Only metadata-only records need their remaining English usage information.
  // They still receive a best-effort plan; they are not silently excluded.
  if (tagged && !/[a-z]{2}/i.test(normalized)) normalized = labels.join(' ')
    .replace(/\[[^\]]*\]/g, ' ').replace(/\b(?:idiom|fig\.|figurative(?:ly)?|proverb|saying)\b/gi, ' ').trim();
  return { tagged, normalized, labels };
}

export function idiomAlternatives(meaning: string) {
  // Preserve separators inside disambiguating parentheses.
  const raw = meaning.replace(/\([^)]*\)/g, note => note.replace(/[;/]/g, ',')).split(/[;/]/);
  const explicit = raw.filter(text => /^\s*(?:\(fig\.\)|fig\.|\(figurative(?:ly)?\)|figuratively:?)\s*/i.test(text));
  const selected = explicit.length ? explicit.join('; ') : meaning;
  return idiomGloss(selected).normalized.replace(/\([^)]*\)/g, note => note.replace(/[;/]/g, ',')).split(/[;/]/)
    .map(text => text.trim()).filter(Boolean);
}
