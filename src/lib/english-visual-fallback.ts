import type { VisualIntent } from './visual-inference-core';

interface Vocabulary {
  classify: (value: string) => VisualIntent | null;
  verb: (value: string) => string | undefined;
  participle: (value: string) => string;
}
// Small English relationship templates complement the shared lexicon. They are
// reusable predicates, never Mandarin headword or dictionary-row overrides.
const social: Record<string, { queries: string[]; related: string[] }> = {
  ask: { queries: ['person asking question', 'people asking for advice', 'person seeking guidance'], related: ['question', 'inquire', 'advice', 'guidance'] },
  learn: { queries: ['people learning together', 'person learning from another person', 'students studying together'], related: ['study', 'education', 'lesson'] },
  teach: { queries: ['person teaching students', 'teacher explaining lesson', 'people learning together'], related: ['teaching', 'lesson', 'instruct'] },
  help: { queries: ['person helping another person', 'people offering assistance'], related: ['assist', 'assistance', 'helpful'] },
  cooperate: { queries: ['people cooperating on task', 'team working together'], related: ['cooperation', 'teamwork', 'collaborate', 'collaboration'] },
  think: { queries: ['person thinking', 'thoughtful person'], related: ['thoughtful', 'contemplate', 'ponder'] },
  warn: { queries: ['person warning another person', 'person giving warning'], related: ['warning', 'caution'] }
};
const clean = (value: string) => value.toLowerCase().replace(/[’‘]/g, "'").replace(/\[[^\]]*\]/g, ' ')
  .replace(/\([^)]*\)/g, ' ').replace(/^(?:(?:fig|lit|coll|esp|usu)\.\s*)+/, '').replace(/\s+/g, ' ').trim();
function make(predicate: string, queries: string[], related: string[] = [], visualType: VisualIntent['visualType'] = 'action'): VisualIntent {
  const alternatives = [...new Set(queries.map(q => q.replace(/\s+/g, ' ').trim()).filter(q => q && q.length <= 100))].slice(0, 4);
  return { visualType, subject: predicate, semanticPredicate: predicate, query: alternatives[0], fallback: alternatives[1] ?? alternatives[0], fallbackQueries: alternatives.slice(1), planSource: 'english-definition', relevanceTerms: related };
}

/** Extract a depictable predicate/subject from the selected English gloss only. */
export function englishVisualFallback(meaning: string, vocabulary: Vocabulary, literalSubjects = true): VisualIntent | null {
  let phrase = clean(meaning).split(/[;/]/)[0].replace(/^["“]|["”.!?]+$/g, '').trim();
  if (!/[a-z]/i.test(meaning) || meaning.length > 1000) return null;
  if (/[!?]/.test(clean(meaning)) || /^(?:formerly|also |common name for|alternative (?:name|term) for)/i.test(phrase)) return null;
  if (/[,;]\s*(?:a |an |the )?(?:novel|poem|song|film|movie|book|translation)\b/i.test(meaning)) return null;
  if (/\b(?:radical in|chinese characters|pronunciation|pronounced|spelling|abbreviation|acronym)\b/.test(phrase)) return null;
  // Negating an inhibiting attitude does not negate the following positive act.
  // Do not generalize this to "not willing to", "not able to" or bare "not happy".
  const negatedInhibition = positiveAction(phrase) !== phrase;
  phrase = positiveAction(phrase);
  if (/^unable to sleep$/.test(phrase)) return make('sleepless', ['sleepless person lying awake'], ['insomnia'], 'human-state');
  if (/^lack of (?:water|food|sleep)$/.test(phrase)) {
    const object = phrase.slice(8);
    return make(`${object} shortage`, [`${object} shortage`], [], 'conceptual');
  }
  if (/\b(?:not|never|without|unable|cannot|can't|don't|doesn't|neither|nor)\b/.test(phrase)) return null;
  const state = phrase.match(/^(?:the )?state of (?:being )?(.+)$/);
  if (state) {
    if (/^(?:exhausted|exhaustion)$/.test(state[1])) return make('exhausted', ['exhausted person resting'], ['exhaustion', 'tired'], 'human-state');
    const intent = vocabulary.classify(state[1]);
    if (intent && ['emotion', 'human-state', 'physical-state'].includes(intent.visualType)) return make(state[1], [intent.query], [], intent.visualType);
  }
  if (/^(?:to )?(?:make a mountain out of a molehill|make a big fuss over a (?:small|minor) (?:issue|problem))\b/.test(phrase))
    return make('exaggerate', ['person exaggerating small problem', 'person overreacting to problem'], ['exaggeration', 'overreact', 'overreaction']);
  if (/^(?:to )?(?:make|making) (?:a |an )?(?:mistake|error)$/.test(phrase))
    return make('mistake', ['person making mistake', 'person correcting error'], ['error', 'incorrect']);
  const agent = phrase.match(/^(?:a |an |the )?(?:one|person|someone|somebody|worker) who (.+)$/);
  const activity = phrase.match(/^(?:(?:the )?(?:act|activity|process|practice) of|(?:a )?(?:way|method) of) (.+)$/);
  const content = (agent?.[1].replace(/^after [^,]+,\s*/, '') ?? activity?.[1] ?? phrase).replace(/^to /, '');
  const tokens = content.split(' '); const root = vocabulary.verb(tokens[0]);
  if (root && (agent || activity || /^to /.test(phrase) || /ing$/.test(tokens[0]) || social[root])) {
    const tail = tokens.slice(1).join(' ');
    if (agent && !tail) return null; // Existing occupation-head normalization handles this.
    if (!agent && !activity && /^(?:someone|somebody|something|sb|sth)$/.test(tail)) return null;
    if (social[root] && (agent || activity || tail || root === 'think' || root === 'cooperate')) {
      // Asking someone to perform an unrelated act is not asking a question.
      if (root === 'ask' && /\bto \w+/.test(tail)) return null;
      if (root === 'ask' && /\b(?:price|trouble|troubles|permission|leave|money)\b/.test(tail)) return null;
      if (root === 'help' && /\b(?:oneself|himself|herself|themselves)\b/.test(tail)) return null;
      const template = social[root];
      const alsoLearning = root === 'ask' && /\b(?:and )?learn\b/.test(tail);
      return make(root, [...template.queries.slice(0, 2), ...(alsoLearning ? [social.learn.queries[0]] : template.queries.slice(2))], [...template.related, ...(alsoLearning ? ['learn', 'study', 'education'] : [])]);
    }
    // Keep concrete objects and their modifiers. Only take an object immediately
    // after the verb, not a random noun buried in a long or figurative sentence.
    const object = tail.replace(/^(?:(?:quietly|quickly|slowly|carefully) )*/, '').replace(/^(?:a|an|the|one's|his|her|their) /, '').split(/\b(?:and|while|when|because|in order to|so that|with|from|to|for)\b/)[0].trim();
    const objectIntent = object && vocabulary.classify(object);
    const concrete = literalSubjects && (agent || activity || /^to /.test(phrase) || !/^(?:fly|trail|climb)$/.test(root)) && objectIntent && /^[a-z -]+$/.test(object) && !/\b(?:of|on|in|at|as|or|sb|sth|someone|somebody|something|oneself|somewhere|who|which|that)\b/.test(object) && !['abstract', 'conceptual', 'action', 'emotion'].includes(objectIntent.visualType) && object.split(' ').length <= 5;
    if (concrete) {
      const action = vocabulary.participle(root);
      if (agent && root === 'repair' && /^(?:car|cars|automobile|automobiles)$/.test(object))
        return make('repair', ['car mechanic repairing car', 'mechanic working on car'], ['mechanic', 'fix']);
      return make(root, [`person ${action} ${object}`, `${action} ${object}`], root === 'repair' ? ['fix'] : []);
    }
    if ((agent || activity) && !tail) {
      const action = vocabulary.classify(`to ${root}`);
      if (action?.visualType === 'action') return make(root, [action.query, action.query.replace(/^person /, '')]);
    }
  }
  if (negatedInhibition || !literalSubjects) return null;
  // Definitions of tools, plants, occupations and objects often state a head
  // noun followed by a relative/usage clause. Keep that head and its modifiers.
  const described = phrase.match(/^(?:a |an |the )?([a-z -]{2,60}?) (?:that|which|used (?:for|to)|made from|made of|fed on|found in|grown in|stuffed with|such as|for)\b/);
  if (described && !/^(?:as|of|in|on|at|to|from|by)$/.test(described[1])) {
    if (/\bplants?$/.test(described[1]) && /\b(?:soil|algae|moss|fern|flowers|leaves|spores|grows?)\b/.test(phrase))
      return make(described[1], [`${described[1]} nature`], [], 'nature');
    const head = vocabulary.classify(described[1]);
    if (head?.conceptDomain === 'substance') return make(described[1], [described[1]], [], 'object');
    if (head && !['abstract', 'conceptual', 'action', 'emotion'].includes(head.visualType))
      return make(described[1], [head.query, described[1]], [], head.visualType);
  }
  // Parenthesis-only concrete glosses and punctuation/technical modifiers are
  // content too: "(tree)", '"red apple"', "3D printer". Accept only a known
  // concrete lexical head; do not turn pronunciation/meta notes into a scene.
  const lexical = (phrase || meaning.match(/^\(([a-z -]+)\)$/i)?.[1] || '').split(/[,;:]|\s[–—]\s|[\u3400-\u9fff]/)[0]
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(mr|mrs|ms|dr)\./g, '$1').replace(/["“”]/g, '').replace(/^(?:a|an|the) /, '').trim();
  const qualified = lexical.match(/^([a-z -]+) of ([a-z '-]+)$/);
  if (qualified && lexical.split(' ').length <= 8 && lexical !== clean(meaning)) {
    const head = vocabulary.classify(qualified[1]);
    if (head && ['food', 'fruit', 'vegetable'].includes(head.visualType))
      return make(qualified[1], [lexical], [], head.visualType);
  }
  if (/^[a-z0-9 '-]+$/i.test(lexical) && !/\b(?:who|that|which|have|has|had|is|are|was|were|be|being|or|and|sb|sth|someone|somebody|something|oneself|somewhere|of|on|in|at|as|to|from|for)\b/.test(lexical) && lexical.split(' ').length <= 5) {
    const candidates = [vocabulary.classify(lexical), vocabulary.classify(lexical.split(' ').at(-1)!)];
    const species = meaning.match(/^\((bird|animal|plant) species\b/i)?.[1];
    if (species) candidates.push(vocabulary.classify(species));
    const head = candidates.find(intent => intent && !['abstract', 'conceptual', 'action', 'emotion'].includes(intent.visualType));
    if (head && !['abstract', 'conceptual', 'action', 'emotion'].includes(head.visualType) && lexical !== clean(meaning))
      // Keep the complete cleaned name. A lexical homonym's broad category
      // (e.g. jade -> animal, constellation -> building) is not a safe retry.
      return make(lexical, [lexical], [], head.visualType);
    if (head && /\d/.test(lexical) && !['abstract', 'conceptual', 'action', 'emotion'].includes(head.visualType))
      return make(lexical.split(' ').at(-1)!, [lexical], [], head.visualType);
  }
  return null;
}

/** These constructions negate an inhibition, not the following action. */
export function positiveAction(phrase: string): string {
  return phrase.replace(/^(?:to )?(?:not|never) (?:feel|be) (?:ashamed|embarrassed|afraid|hesitant|reluctant) to /i, 'to ')
    .replace(/^without (?:hesitation|fear|embarrassment),? (?:to )?/i, 'to ');
}
