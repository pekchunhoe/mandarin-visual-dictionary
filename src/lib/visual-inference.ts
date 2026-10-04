import lexicon from '../data/visual-lexicon.json';
import type { VisualType } from '../types';
export const VISUAL_SCHEMA = 'dictionary-visual-v2';
export interface VisualIntent { visualType: VisualType; query: string; subject: string }
// WordNet is compiled into the bundle, with no runtime package or data path.
// If its structure is unavailable, preserve curated overrides and conservative
// rule-based classifications; unresolved meanings safely stay non-visual.
function loadLexicon(data: unknown): { nouns: Record<string, string>; verbs: Set<string> } {
  try {
    const value = data as { nouns: Record<string, string>; verbs: string };
    const nouns: Record<string, string> = Object.create(null);
    for (const [category, lemmas] of Object.entries(value.nouns)) {
      for (const lemma of lemmas.split('|')) nouns[lemma] = category;
    }
    return { nouns, verbs: new Set(value.verbs.split('|')) };
  } catch {
    console.warn('[visuals] optional_lexicon_unavailable');
    return { nouns: Object.create(null), verbs: new Set() };
  }
}
const { nouns, verbs } = loadLexicon(lexicon);
const unsuitable = /\b(?:surname|given name|personal name|company|corporation|inc\.|brand|trademark|province|county|dynasty|emperor|mythology|deity|sexual|sex|genital|penis|vagina|porn|prostitut|rape|suicide|kill|murder|torture|weapon|gun|bomb|cocaine|heroin|narcotic|vulgar|offensive|slur)\b/i;
const grammatical = /^(?:because|but|although|though|if|already|possibly|possible|perhaps|maybe|therefore|thus|hence|moreover|furthermore|however|and|or|then|as well as|in addition|so that|provided that|whether|unless|despite|not|very|also|again|still|yet|even|only|just|almost|rather|quite|too|such|some|any|each|every|all|both|either|neither|other|another|what|which|who|when|where|why|how|can|could|may|might|must|should|would|will|shall|is|are|was|were|be|being|been)(?:\b|$)/i;
const nonvisualVerbs = /^(?:be|have|do|make|get|take|go|come|mean|think|know|believe|consider|suppose|seem|become|exist|happen|occur|allow|require|depend|include|contain|belong|represent|understand|remember|forget|intend|want|need|hope|feel|regard|refer|relate|imply|cause|affect|change|die|suffer|attack|fight|shoot|stab|burn|cut|inject|strip|undress|bleed|vomit|defecate|urinate|seduce|molest|abuse|threaten|insult|swear)$/;

/** Clean only the selected CC-CEDICT meaning; never concatenate other senses. */
export function normalizeVisualMeaning(meaning: string): string | null {
  if (!meaning || meaning.length > 1000 || unsuitable.test(meaning) || /^(?:CL:|see\b|variant of\b|old variant of\b|abbr\.|abbreviation|used (?:as|in|to)|a (?:particle|suffix|prefix)|grammatical)/i.test(meaning.trim())) return null;
  if (/\((?:fig(?:uratively)?\.?|idiom|literary|archaic|classical|euph\.?|derog\.?|slang)\)/i.test(meaning)) return null;
  // Preserve nouns in parenthetical disambiguators rather than confusing e.g. a
  // river bank with a financial institution. Drop pronunciation/grammar notes.
  const context = [...meaning.matchAll(/\(([^)]+)\)/g)].map(m => m[1]).filter(note => /\b(?:animal|fruit|vegetable|food|river|financial|building|person|appliance|vehicle)\b/i.test(note)).join(' ');
  const clean = meaning.replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ').replace(/\bCL:.*$/i, '').split(/[;/]/)[0]
    .trim().replace(/^(?:a |an |the )/i, '').replace(/\b(?:esp\.|e\.g\.|i\.e\.).*$/i, '').replace(/[,].*$/, '').trim();
  if (!clean || /[^a-zA-Z\s'-]/.test(clean) || grammatical.test(clean) || /^(probable|probably|likely|likelihood|possibility|probability)\b/i.test(clean)) return null;
  return `${clean} ${context}`.trim().toLowerCase().replace(/\s+/g, ' ');
}
export function participle(verb: string): string {
  if (verb.endsWith('ie')) return verb.slice(0, -2) + 'ying';
  if (/[^e]e$/.test(verb)) return verb.slice(0, -1) + 'ing';
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(verb)) return verb + verb.at(-1) + 'ing';
  return verb + 'ing';
}
function actionVerb(phrase: string): string | undefined {
  const first = phrase.replace(/^to /, '').split(' ')[0];
  if (verbs.has(first)) return first;
  if (first.endsWith('ing')) {
    const stem = first.slice(0, -3);
    return [stem, stem + 'e', stem.slice(0, -1)].find(v => verbs.has(v) && participle(v) === first);
  }
}
export function inferVisualIntent(meaning: string): VisualIntent | null {
  if (unsuitable.test(meaning) || /\((?:fig(?:uratively)?\.?|idiom|literary|archaic|classical|euph\.?|derog\.?|slang)\)/i.test(meaning)) return null;
  // Semicolon-separated synonyms belong to this selected sense. Try them
  // independently, never concatenate raw dictionary annotations into a query.
  if (meaning.includes(';') && !unsuitable.test(meaning)) {
    for (const synonym of meaning.replace(/\([^)]*\)/g, ' ').split(';').slice(0, 4)) {
      const intent = inferVisualIntent(synonym); if (intent) return intent;
    }
    return null;
  }
  const phrase = normalizeVisualMeaning(meaning); if (!phrase) return null;
  const verb = actionVerb(phrase);
  if (/^to /.test(phrase) || (!nouns[phrase] && /^\w+ing(?: |$)/.test(phrase))) {
    if (!verb || nonvisualVerbs.test(verb)) return null;
    const context: Record<string, string> = { eat: 'food', drink: 'water', read: 'book', drive: 'vehicle', ride: 'bicycle', cook: 'food', play: 'game', wash: 'hands' };
    return { visualType: 'action', subject: `person ${participle(verb)}`, query: `person ${participle(verb)}${context[verb] ? ' ' + context[verb] : ''}` };
  }
  if (/^(happy|sad|angry|afraid|surprised|excited|worried|tired|sleepy)$/.test(phrase)) return { visualType: 'emotion', subject: `${phrase} person`, query: `${phrase} person facial expression` };
  if (/^(red|blue|green|yellow|purple|orange|black|white|pink|brown)$/.test(phrase)) return { visualType: 'property', subject: `${phrase} color`, query: `${phrase} color objects` };
  const tokens = phrase.split(' ');
  // Match a lexical noun phrase, or a descriptive noun with a recognized head.
  // Never infer concreteness from an arbitrary word buried in a definition.
  let subject = phrase; let category = nouns[subject];
  if (!category && tokens.length <= 5 && !/\b(?:of|for|that|which|with|without|by|at|as|from)\b/.test(phrase)) {
    const head = tokens.at(-1)!;
    const singular = head.endsWith('ies') ? head.slice(0, -3) + 'y' : head.endsWith('s') ? head.slice(0, -1) : head;
    category = nouns[head] ?? nouns[singular];
  }
  if (!category) return null;
  const contexts: Record<string, string> = { animal: 'animal', fruit: 'fruit food', vegetable: 'vegetable food', food: 'food', vehicle: 'vehicle', household: 'household object', technology: 'device', clothing: 'clothing', building: 'building', weather: 'weather', body: 'body', person: 'person', nature: 'nature', place: 'place', object: 'object' };
  let context = contexts[category] ?? 'object';
  if (/\b(?:refrigerator|freezer|oven|washer|machine|fan)\b/.test(subject) && category === 'household') context = 'appliance';
  if (/\b(?:ship|boat|ferry)\b/.test(subject)) context = 'vessel';
  if (category === 'person' && /^(?:cook|chef)$/.test(subject)) { subject = 'chef'; context = 'person cooking'; }
  if (/\b(?:school|hospital|library|supermarket|museum|airport|post office)\b/.test(subject)) { category = 'building'; context = 'building'; }
  return { visualType: category as VisualType, subject, query: `${subject} ${context}`.replace(/\s+/g, ' ').slice(0, 100) };
}
