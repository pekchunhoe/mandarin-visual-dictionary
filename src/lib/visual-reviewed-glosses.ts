import type { VisualIntent } from './visual-inference-core';
import { semanticEnglish, withoutParentheses } from './visual-gloss-normalization';

// Final residual review. Keys describe English constructions, never Mandarin
// entries. Each exclusion states evidence; there is intentionally no default.
const scenes: [RegExp, string, string][] = [
  [/^stripping ratio$/, 'mining stripping ratio', 'mining overburden to ore ratio diagram'],
  [/^stabbing pain$/, 'sharp pain', 'sharp pain illustration'],
  [/^.*warring states physician.*nicknamed bian que/, 'bian que', 'bian que physician portrait'],
  [/^if three walk together/, 'learn', 'person learning from other people'],
  [/^if you work at it hard enough/, 'persevere', 'person persevering at difficult task'],
  [/^if you tough it out/, 'persevere', 'person persevering through difficulty'],
  [/^if something doesn't work here/, 'adapt', 'person trying another approach'],
  [/^although i don't understand it/, 'admire', 'person admiring unfamiliar work'],
  [/^cutting the gordian knot/, 'solve', 'person solving difficult problem'],
  [/^can the leopard change his spots/, 'unchanging character', 'unchanging personal character concept'],
  [/^a still.*for distilling alcohol/, 'distillation', 'alcohol distillation apparatus'],
  [/^a still.*from a movie/, 'film still', 'film still photograph'],
  [/^a can.*loanword/, 'tin can', 'tin can container'],
  [/^1,[24]-benzoquinone/, 'benzoquinone', 'benzoquinone chemical structure'],
  [/^5-1.*may 1st/, 'may day', 'may day calendar'],
  [/^the who.*rock band/, 'the who', 'the who rock band'],
  [/^turkish:.*canakkale/, 'canakkale strait', 'canakkale strait'],
  [/^hua quan.*martial art/, 'hua quan', 'hua quan martial art'],
  [/^yu-gi-oh!/, 'yu-gi-oh', 'yu-gi-oh card game'],
  [/^smiley/, 'smiley', 'smiley face symbol'],
  [/^identity.*math/, 'mathematical identity', 'mathematical identity equation'],
  [/^the not-very-distant past/, 'recent past', 'recent past timeline'],
  [/^\(onom\.\).*sound of a bell/, 'bell', 'bell ringing'],
  [/^\(onom\.\).*sound made by a camera shutter/, 'camera shutter', 'camera shutter'],
  [/^\(onom\.\).*sound of sth smashing/, 'smash', 'object smashing on ground'],
  [/^\(literary\).*species of linden/, 'linden', 'linden tree'],
  [/^lightly touching the water/, 'touch water', 'lightly touching water surface'],
  [/^\(athletics\) on your mark!/, 'start race', 'runners preparing at starting line'],
  [/^\(drawing attention to\) look!/, 'point', 'person pointing something out'],
  [/^\(onom\.\) "look!"/, 'look', 'person looking'],
  [/^i've got a solution!/, 'solve', 'person solving problem']
];

export function reviewedVisual(english: string): VisualIntent | null {
  const normalized = semanticEnglish(english).toLowerCase();
  const raw = english.toLowerCase();
  for (const [pattern, predicate, query] of scenes) if (pattern.test(raw) || pattern.test(normalized))
    return { visualType: 'conceptual', subject: predicate, semanticPredicate: predicate, query, fallback: query, fallbackQueries: [query], planSource: 'english-definition' };
  return null;
}

const formulas = new Set(`won't get away with it|goodness gracious|oh my lord|nonsense|damn it|oh my god|it's just the pits|so unfair|don't ...|don't mention it|you're welcome|ignore it|get along with you|go to hell|drop dead|friendship over|the same to you|...right|...ok|smack|hey|oh|pah|bah|pooh|tut|da|kitty kitty|eh|whoa|holy crap|jeez|uh-oh|ah|oops|oh no|oh snap|humph|my|may your business prosper|pshaw|here|aye aye|ss|whoosh|gosh|long may you live|big deal|heavens|heaven knows|goddam|ladies first|blast it|all right|ok|my god|oh boy|man|what a cheek|good shot|nice hit|well played|fuck|motherfucker|correct|give me a break|save it|mind your own business|don't interfere|what a coincidence|cool|sweet|whatever for|you don't say|no kidding|that's enough|roger|yessir|what an awful mess|no wonder|so that's why|keep away|enjoy your meal|bon appetit|that will do|what a scandal|whatever next|are you kidding me|crap|what the ...|that's insane|bosh|as if|yeah right|down with ...|great|please|utter rubbish|geez|no way|bless you|spit it out|out with it|glug-glug haha|damn|forget about it|don't forget|sure|rest assured|absolutely disgraceful|get lost|beat it|scram|fuck off|get out|get out of here|go away|wham|ta da|really|you're really quite something|you're just amazing|super|got it|wish you all the best|you got me|you win|you are something|it's none of your business|darn|so uneducated|so ignorant|shame on you|repent and ye shall be saved|long live|to hell with it|true|please do as you wish|you are welcome to do whatever you like|gentlemen|ladies and gentlemen|yes|shit|you praise me too much|you swine|may i trouble you to...|please would you mind...|how dare you|this is an outrage|have a nice weekend|a plague on him|oh that's true|that's so out-of-date|none of your goddamn business|may the lord buddha preserve us|merciful buddha|jolly good|be grateful for all your blessings|please do not be too severe on me|who would believe it|what rubbish`.split('|'));

export function reviewedExclusion(english: string): string | undefined {
  const plain = withoutParentheses(english).toLowerCase().replace(/[“”"]/g, '').replace(/[’‘]/g, "'").trim();
  const clauses = plain.split(/[;!?]+/).filter(x => x.trim());
  if (/[!?]/.test(english) && clauses.length > 0 && clauses.every(x => formulas.has(x.trim()))) return 'FUNCTION_WORD'; // Pragmatic formula, no determinate visual referent.
  if (/^\(interjection|\(old\).*interjection|^\(interjection expressing/i.test(english) && /[!?]/.test(english)) return 'FUNCTION_WORD';
  if (/^\(note:|^\(internet slang\) \(pun on|meaningless syntactic element|similar to .*used before an adjective/i.test(english)) return 'GRAMMAR_ONLY';
  if (/^consonant ng or/i.test(english)) return 'PRONUNCIATION_NOTE';
  if (/^[\p{Script=Han}]+\[[^\]]+\]$/u.test(english)) return 'CROSS_REFERENCE_ONLY';
  if (/^(?:\(internet slang\) )?if this is an infringement|^whether it's right or wrong|^if one does not know|^if you live a life of crime|^if you are lazy|^if you can't do anything|^if one is too calculating|^if sth is used properly|^if an official|^\(if there is one monk/i.test(english)) return 'NON_VISUAL_LOGICAL_RELATION';
  if (/^if the father is a hero|^serve the people!|^roast!|^\(esp\.\) the eight-character slogan|^friend or foe\?/i.test(english)) return 'NAMED_ENTITY_POLICY';
  if (/^if you take too big a stride|^cutting off the ears/i.test(english)) return 'AGE_APPROPRIATE_CONTENT_POLICY';
  if (/^we wish you success|^\(slang\) alternative for|^\(slang\) something awesome|^\(internet slang\).*wtf|^just who do|^¿que sera/i.test(semanticEnglish(english))) return 'FUNCTION_WORD';
  if (/^so, actually, as it turns out$|^and, by extension,$/i.test(english)) return 'FUNCTION_WORD';
  if (/^cutting edge or point of a knife, sword or tool$/i.test(english)) return 'EXCLUDED_ACTION_POLICY';
}
