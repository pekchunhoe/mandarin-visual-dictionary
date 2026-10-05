import type { VisualIntent } from './visual-inference-core';

const filler = new Set("a an the to of in on at for and or with by from into out one's ones his her their your my our its someone's somebody's sb sth someone somebody something oneself be being been is are was were have has had do does did get gets got make makes made very really utterly completely also etc i e g esp cf idiom idiomatic figurative figuratively proverb saying person people human concept scene unknown expression phrase".split(' '));
export function idiomContentWords(text: string) {
  const tokens = text.toLowerCase().replace(/\[[^\]]*\]/g, ' ').replace(/\b[\w]+['’]s\b/g, ' ')
    .replace(/\b(?:lit|fig|coll|usu|esp)\./g, ' ').match(/[a-z]+(?:-[a-z]+)*/g) ?? [];
  return [...new Set(tokens.filter(word => word.length > 1 && !filler.has(word)))];
}
function intent(visualType: VisualIntent['visualType'], predicate: string, queries: string[]): VisualIntent {
  return { visualType, subject: predicate, semanticPredicate: predicate, query: queries[0], fallback: queries[1] ?? queries[0], fallbackQueries: queries.slice(1), planSource: 'idiom-semantic' };
}

/** English constructions apply to any headword. Never read Chinese characters. */
export function idiomSemanticFallback(text: string, classify: (text: string) => VisualIntent | null): VisualIntent | null {
  const plain = text.toLowerCase().replace(/[’‘]/g, "'").replace(/^(?:lit\.|to|a|an|the)\s+/g, '').trim();
  if (/\b(?:not|never|without)\b/.test(plain)) return null;
  if (/\b(?:wolf down|devour ravenously|eat ravenously|eat very quickly)\b/.test(plain))
    return intent('action', 'eat', ['person eating ravenously', 'person eating quickly', 'person eating food']);
  if (/lose (?:one's|his|her|your|their) head.*fear|\bpanic(?:ked)?\b/.test(plain))
    return intent('emotion', 'panicked', ['panicked person', 'frightened person', 'scared confused person']);
  if (/packed like sardines|\b(?:vast|huge|large|dense) crowd\b/.test(plain))
    return intent('place', 'crowd', ['large crowd', 'dense crowd', 'crowd of people']);
  if (/\b(?:complete chaos|chaotic)\b/.test(plain))
    return intent('place', 'chaos', ['chaotic crowded scene', 'disorder crowded scene', 'chaos']);
  if (/run for (?:one's|his|her|your|their) life/.test(plain))
    return intent('action', 'run', ['person running away', 'person running quickly', 'person running']);
  if (/\b(?:growth|improvement|progress)\b/.test(plain) && /leaps and bounds|rapid/.test(plain))
    return intent('conceptual', 'rapid growth', ['rapid growth', 'growth progress']);
  if (/^overjoyed$/.test(plain)) return intent('emotion', 'happy', ['happy excited person', 'happy person', 'excited person']);
  // Reuse lexical heads, morphology, and descriptors from the shared classifier.
  // This accepts "heavy traffic" or "pile of books" without accepting arbitrary
  // body parts buried inside an opaque metaphor as the intended subject.
  const candidate = classify(text);
  if (candidate && !['abstract', 'conceptual', 'property', 'body', 'animal', 'physical-state', 'visible-adjective', 'comparison'].includes(candidate.visualType)) {
    const predicate = candidate.semanticPredicate ?? candidate.subject;
    if (candidate.visualType === 'action' && !/^(?:to )?\w+(?: (?:\w+ly|someone|somebody|something|sb|sth|away))*$/.test(text)) return null;
    return { ...candidate, semanticPredicate: predicate, planSource: 'idiom-semantic' };
  }
  const grouped = plain.match(/^(?:pile|stack|heap|group|crowd) of ([a-z ]+)$/);
  const head = grouped ? classify(grouped[1]) : null;
  if (grouped && head && head.visualType !== 'conceptual')
    return intent('object', plain, [plain, grouped[1]]);
  return null;
}

export function lastResortIdiom(text: string): VisualIntent {
  const content = idiomContentWords(text);
  // Keep meaningful word order, negatives and modifiers; bound query length on
  // word boundaries. One query only when no justified broadening is available.
  const tokens = content.length ? content : text.toLowerCase().match(/[a-z]+/g) ?? ['meaning'];
  let query = '';
  for (const token of tokens.slice(0, 10)) {
    if ((query + ' ' + token).trim().length > 100) break;
    query = (query + ' ' + token).trim();
  }
  query ||= tokens[0].slice(0, 100);
  return { visualType: 'conceptual', subject: query, query, fallback: query, semanticPredicate: query, planSource: 'idiom-last-resort', fallbackQueries: [] };
}

export function idiomVisualScore(text: string, candidate: VisualIntent): number {
  const imageability = candidate.planSource === 'idiom-last-resort' ? 0 : candidate.visualType === 'conceptual' ? 10 : 40;
  const specificity = Math.min(6, idiomContentWords(text).length);
  const usefulness = candidate.semanticPredicate ? 5 : 0;
  return imageability + specificity + usefulness;
}
