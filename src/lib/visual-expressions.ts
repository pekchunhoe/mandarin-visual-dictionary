import type { VisualIntent } from './visual-inference-core';

/** Speech acts with a specific observable action, not generic conversation. */
export function expressionVisual(english: string): VisualIntent | null {
  const phrase = english.replace(/\([^)]*\)/g, ' ').replace(/^(?:lit\.|coll\.)\s*/i, '').trim().toLowerCase();
  const rules: [RegExp, string, string][] = [
    [/^(?:watch out|look out|beware|proceed with caution|fore!|timber!|warning shouted)/, 'warn', 'person warning another person'],
    [/^(?:cheers!|bottoms up!|here's to you!)/, 'toast', 'people raising glasses in toast'],
    [/^(?:congratulations|hurray|hurrah|yippee|happy new year|may you have a prosperous new year)/, 'celebrate', 'people celebrating together'],
    [/^(?:thank you|we are most grateful)/, 'thank', 'person thanking another person'],
    [/^(?:good (?:morning|afternoon|evening)|hi!|greetings!|welcome!)/, 'greet', 'people greeting each other'],
    [/^(?:bye|have a nice trip|bon voyage|take good care|take care!)/, 'farewell', 'person waving goodbye'],
    [/^(?:wow!|amazing!|just incredible!|oh my!|my goodness!|good heavens!|omg!)/, 'surprise', 'surprised person expression'],
    [/^(?:hurry up!|get a move on!)/, 'hurry', 'person hurrying'],
    [/^(?:wait a (?:minute|moment)!|hold on!|stay a bit!)/, 'wait', 'person waiting'],
    [/^(?:stand up!)/, 'stand', 'person standing up'],
    [/^(?:march!|number off!|count off!)/, 'march', 'people marching in formation'],
    [/^(?:stand at ease!|attention!)/, 'attention', 'people standing at attention'],
    [/^(?:halt!)/, 'stop', 'person signaling stop'],
    [/^(?:move aside!)/, 'move aside', 'person moving aside'],
    [/^(?:hush!|shut up!)/, 'quiet', 'person requesting silence'],
    [/^(?:spread the word!)/, 'announce', 'person making announcement'],
    [/^(?:rise and shine!)/, 'wake', 'person waking up'],
    [/^(?:come on!|let's do this!|bring it on!|give me all you got!)/, 'encourage', 'person encouraging another person'],
    [/^(?:sorry!|excuse me!)/, 'apologize', 'person apologizing'],
    [/^(?:what a pity!|oh no!|alas!)/, 'sad', 'sad person expression'],
    [/^(?:ouch!)/, 'pain', 'person wincing in pain'],
    [/^(?:good night!)/, 'sleep', 'person going to bed'],
    [/^(?:no comment!)/, 'refuse comment', 'person refusing to comment'],
    [/^(?:calm down)/, 'calm', 'person calming down'],
    [/^(?:save me!|may i help you|what can i do for you)/, 'help', 'person helping another person'],
    [/^(?:could i have a word|may i ask|what happened\?|what's (?:up|wrong|the matter)\?|what do you think\?)/, 'ask', 'person asking question'],
    [/^(?:no smoking!)/, 'no smoking', 'no smoking sign'],
    [/^(?:do not enter!)/, 'do not enter', 'do not enter road sign']
  ];
  for (const [pattern, predicate, query] of rules) if (pattern.test(phrase))
    return { visualType: 'action', subject: predicate, semanticPredicate: predicate, query, fallback: query, fallbackQueries: [query], planSource: 'english-definition' };
  return null;
}
