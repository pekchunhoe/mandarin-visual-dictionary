/** Positive evidence of a nonvisual dictionary record; null inference is never evidence. */
import { reviewedExclusion } from './visual-reviewed-glosses';
export function metadataExclusion(english: string): string | undefined {
  if (/^\((?:loanword from|etymologically|pronunciation|also written)[^)]*\)\s+[a-z]/i.test(english)) return undefined;
  const reviewed = reviewedExclusion(english); if (reviewed) return reviewed;
  const plain = english.replace(/^\((?:old|archaic|dialect|coll\.?|literary|slang)\)\s*/i, '').trim();
  if (/\b(?:Inc\.|Corp\.|Co\.,|Ltd\.|p\.l\.c\.)/i.test(english) || /[,;]\s*(?:a |an |the )?(?:novel|poem|song|film|movie|book|translation)\b/i.test(english)) return 'NAMED_ENTITY_POLICY';
  if (/^(?:\(?etymologically|\(?loanword from|\(?originally (?:Cantonese|from)|\(?transliteration (?:of|from))\b/i.test(plain) && !/:\s*[a-z]/i.test(plain)) return 'TRANSLITERATION_ONLY';
  if (/^(?:\(?(?:erhua |ancient |archaic |dialectal |cursive |simplified |traditional |nonstandard |non-standard |euphemistic |orthographic |obsolete |common |original |old |unofficial )*(?:variant|form|spelling) of|\(?same as|\(?contrasted with|\(?equivalent to|\(?cf\.|\(?see also)\b/i.test(plain)) return 'VARIANT_REFERENCE_ONLY';
  if (/^(?:\(?[a-z -]*pronunciation\b|(?:Beijing|Taiwan|Japanese|also) pr\.|\(?pronounced\b)/i.test(plain)) return 'PRONUNCIATION_NOTE';
  if (/^(?:\(?often written|\(?now written|\(?also written|\(?censored spelling|\(?\w+ spelling of)/i.test(plain) || /(?:radical|component) (?:in|of) Chinese characters|Kangxi radical/i.test(plain)) return 'ORTHOGRAPHIC_NOTE';
  if (/^(?:acronym for|abbr(?:eviation)?\.?(?: for| of)|short for|shortened form of)\b/i.test(plain)) return 'CROSS_REFERENCE_ONLY';
  if (/^\((?:used |after |before |followed |following |indicat|emphasiz|verb complement|result complement|old sentence-final|in letters|any number of possible translations|not only|when |usually |sometimes |often |also an official title|also used|in popular usage)/i.test(plain)) return 'GRAMMAR_ONLY';
  if (/\b(?:meaning (?:unknown|unclear)|precise meaning unknown)\b/i.test(plain)) return 'UNSEARCHABLE_FRAGMENT';
  if (/^also\s*[\p{Script=Han}]/u.test(plain) || /^\(?(?:also|i\.e\. same as|not to be confused with)\s*[\p{Script=Han}]/u.test(plain)) return 'CROSS_REFERENCE_ONLY';
  if (/^\(?(?:abbr\.|transliterated as|the spelling|originally written|appears as phonetic|today used as a phonetic|depending on the source)/i.test(plain) || /\b(?:component .*in Chinese characters|character stroke|missing or illegible character)\b/i.test(plain)) return 'ORTHOGRAPHIC_NOTE';
  if (/^\((?:neologism c\. [0-9]+|onom\.|loanword|interrog\.|exclamation|Chinese medicine)\)$|^\((?:feminine name|common place name|place name|ancient place name)\)$/i.test(plain)) return 'METADATA_ONLY';
  if (/^\((?:syllable filler|nonverbal grunt|adverbial expression|derived from|can also|introduces object|element in|courteous|adverb for|attached to|past tense marker|melodramatic form|term of endearment|third-person pronoun|sentence intensifier|separable verb|placed between|traditional title|honorific appellation|respectful term|salutation|polite form|complimentary name|pet name|ancient character|in an expression|the 3rd part|pattern:)/i.test(plain)) return 'GRAMMAR_ONLY';
  const unlabelled = plain.replace(/\([^)]*\)/g, ' ').replace(/^(?:lit\.|literary)\s*/i, '').trim();
  if (/^(?:because|although|though|if|whether|unless|despite|in case|even if|even though|the reason why|on account of|owing to)\b/i.test(unlabelled) && (unlabelled.split(/\s+/).length < 9 || /\.{3}|…/.test(unlabelled))) return 'NON_VISUAL_LOGICAL_RELATION';
  if (/^(?:afterwards|after that|as a result|really and truly|the only|the other|the will|so, actually|we or us|and, by extension)(?:\s|$)/i.test(unlabelled)) return 'FUNCTION_WORD';
  if (/^(?:perhaps|maybe|still|yet|and|but|however|in addition|moreover|very|quite|possibly|each|every|then|hence|therefore|only|just|furthermore)(?:\s*[;,]\s*(?:perhaps|maybe|still|yet|and|but|however|in addition|moreover|very|quite|possibly|each|every|then|hence|therefore|only|just|furthermore|as well as|after that|afterwards))*$/i.test(unlabelled)) return 'FUNCTION_WORD';
  if (/^(?:used in ladies' names|used in expressions|figurative meaning|how, what)/i.test(unlabelled)) return 'GRAMMAR_ONLY';
  if (/\b(?:rhetorical question|before a noun|before a verb|interrogative disbelief|posing a question)\b/i.test(plain) && /[?]/.test(plain)) return 'GRAMMAR_ONLY';
  if (/^(?:what|which|who|when|where|why|how|whence|is|isn't|are|can|could|would|wouldn't|did|do|does|don't|have|for (?:which|what)|at what|good or not|right or wrong|true or false|your venerable age)\b.*\?/i.test(unlabelled) && !/leopard|ax handle/.test(unlabelled)) return 'FUNCTION_WORD';
  if (/^\(?(?:editorial (?:question|query)|editor's (?:question|query)|example:|cf book of songs)/i.test(plain)) return 'METADATA_ONLY';
  if (/^(?:lit\. )?not\b/i.test(unlabelled) && !/^not (?:feel|be) (?:ashamed|embarrassed|afraid|hesitant|reluctant) to /i.test(unlabelled)) return 'NEGATION_WITHOUT_VALIDATED_SCENE';
}
