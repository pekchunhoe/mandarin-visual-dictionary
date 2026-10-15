// A small, auditable grammar for dictionary cross-reference definitions. It
// never accepts arbitrary Han in Malay, missing qualifiers or changed pinyin.
// Malay wording is maintainer-authored CC BY-SA 4.0; model output is mandatory.
export const REFERENCE_DEFINITION_VERSION = 'preserved-reference-definition-v1';
export const referenceRules = [
  { id: 'old-variant', english: 'old variant of ', malay: 'Varian lama bagi ', output: /^(?:varian|versi|bentuk|bentuk tulisan|bentuk bertulis) lama(?: dari| daripada| bagi)?\s+/iu },
  { id: 'erhua-variant', english: 'erhua variant of ', malay: 'Varian erhua bagi ', output: /^(?:varian erhua|erhua varian)(?: dari| daripada| bagi)?\s+/iu },
  { id: 'variant', english: 'variant of ', malay: 'Varian bagi ', output: /^(?:varian|bentuk lain|bentuk alternatif|bentuk tulisan alternatif|bentuk bertulis alternatif)(?: dari| daripada| bagi)?\s+/iu },
  { id: 'erhua-form', english: 'erhua form of ', malay: 'Bentuk erhua bagi ', output: /^bentuk erhua(?: dari| daripada| bagi)?\s+/iu },
  { id: 'abbreviation', english: 'abbr. for ', malay: 'Singkatan bagi ', output: /^singkatan(?: untuk| dari| daripada| bagi)?\s+/iu },
  { id: 'see', english: 'see ', malay: 'Lihat ', output: /^lihat\s+/iu },
  { id: 'also-written', english: 'also written ', malay: 'Juga ditulis ', output: /^(?:juga ditulis|ditulis juga)(?: sebagai)?\s+/iu },
];
export function protectedReferenceInput(rule) {
  return ({ 'old-variant': 'old written form of X', 'variant': 'alternative written form of X', 'erhua-variant': 'erhua variant of X',
    'erhua-form': 'erhua form of X', abbreviation: 'abbreviation for X', see: 'see X', 'also-written': 'also written as X' })[rule.id];
}
export function referenceSource(english) {
  const rule = referenceRules.find(r => english.startsWith(r.english));
  if (!rule) return null;
  const reference = english.slice(rule.english.length);
  // One complete canonical CC-CEDICT reference, including its exact tone IDs.
  // Additional English explanations and multiple references need other review.
  if (!/^[\p{L}\p{N}〇○·|]+\[[A-Za-züÜvV0-5 :'’-]+\]$/u.test(reference) || !/[\p{Script=Han}〇○]/u.test(reference)) return null;
  return { rule, reference };
}
export function referenceDefinition(english, rawText, sourceInput = english) {
  const source = referenceSource(english); if (!source) return null;
  const { rule, reference } = source;
  const protectedInput = rule.english + 'KANJIANREF';
  const protectedMode = sourceInput !== english;
  if (protectedMode && sourceInput !== protectedInput && sourceInput !== protectedReferenceInput(rule)) return null;
  const placeholder = sourceInput === protectedInput ? 'KANJIANREF' : 'X';
  const raw = rawText.normalize('NFC').trim().replace(/^[•·]\s*/, '').replace(/\.$/, '');
  const match = rule.output.exec(raw);
  const restoredSlot = match && raw.slice(match[0].length);
  if (!match || (protectedMode && placeholder === 'X' ? !/^[Xx]$/.test(restoredSlot) : restoredSlot !== (protectedMode ? placeholder : reference))) return null;
  return { version: REFERENCE_DEFINITION_VERSION, rule: rule.id, reference, malay: rule.malay + reference + '.' };
}
export function validReferenceDefinition(record, sense) {
  if (record.translationKind !== 'definition-translation' || record.translationAlignment?.method !== REFERENCE_DEFINITION_VERSION
    || typeof record.translationAlignment.sourceInput !== 'string' || sense.idiom) return false;
  const proof = referenceDefinition(sense.english, record.translationAlignment.rawModelOutput ?? '', record.translationAlignment.sourceInput);
  return Boolean(proof && proof.malay === record.malay && proof.reference === record.translationAlignment.preservedReference
    && proof.rule === record.translationAlignment.referenceRule);
}
