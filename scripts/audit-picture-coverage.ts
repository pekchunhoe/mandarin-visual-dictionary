import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fromRow, type RawRow } from '../src/lib/dictionary-entry';
import { inferVisualIntent } from '../src/lib/visual-inference';
import { imageSearchPlan } from '../server/image-plan';
import { visualQuery } from '../src/lib/visual';
import { metadataExclusion } from '../src/lib/visual-exclusions';

const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
const totals = { rows: rows.length, meaningRecords: 0, totalSenses: 0, englishSenses: 0, normal: 0, idiomFallback: 0, englishFallback: 0, validPlans: 0, invalidPlans: 0, noPlan: 0, intentionallyExcluded: 0, unresolvedNoPlan: 0, knownPicturableWithoutPlan: 0, classifierRecordsOmitted: 0, noEnglish: 0 };
const decisions: unknown[] = []; const failures: unknown[] = []; const examples: unknown[] = [];
const exclusions: Record<string, number> = {};
// Independent review of absent plans. Absence itself is NEVER an exclusion
// reason: ambiguous/unreviewed definitions remain unresolved in the report.
function exclusionReason(english: string): string | undefined {
  const metadata = metadataExclusion(english); if (metadata) return metadata;
  if (/\b(?:surname|given name|personal name|company|corporation|inc\.|brand|trademark|province|county|dynasty|emperor|mythology|deity)\b/i.test(english)) return 'existing named-entity policy';
  if (/\b(?:sexual|sex|genital|penis|vagina|porn|prostitut|rape|suicide|kill|murder|torture|weapon|gun|bomb|cocaine|heroin|narcotic|vulgar|offensive|slur)\b|\((?:euph\.?|derog\.?)\)/i.test(english)) return 'existing age-appropriate content policy';
  const plain = english.replace(/\([^)]*\)/g, ' ').trim();
  if (/^(?:CL:|see\b|(?:old |unofficial )?variant of\b|(?:informal )?abbr\.|abbreviation|also (?:written|called)|alternative (?:name|term) for|(?:Taiwan |Japanese )?pr\.|also pr\.)/i.test(plain)) return 'cross-reference or pronunciation metadata';
  if (/\b(?:particle|suffix|prefix|classifier|action marker|modal marker|discourse connector)\b/i.test(english) || /^\(?(?:used (?:as|in|to)|grammatical|bound form|phonetic|interj\.)/i.test(english)) return 'grammar or usage metadata';
  if (/^(?:to )?(?:not|never|without)\b/i.test(plain)) return 'negation without a validated positive scenario';
  if (/^(?:to )?(?:die|suffer|attack|fight|shoot|stab|burn|cut|inject|strip|undress|bleed|vomit|defecate|urinate|seduce|molest|abuse|threaten|insult|swear)(?:\b|ing)/i.test(plain)) return 'existing excluded-action policy';
  if (/^(?:because|although|though|if|whether|unless|despite|but|already|possibly|possible|perhaps|maybe|therefore|thus|hence|moreover|furthermore|however|and|or|then|as well as|in addition|so that|provided that|very|also|again|still|yet|even|only|just|almost|rather|quite|too|such|some|any|each|every|all|both|either|neither|other|another|what|which|who|when|where|why|how|can|could|may|might|must|should|would|will|shall|is|are|was|were|be|being|been|of|so|probable|probably|likely)[?.!]?$/i.test(plain)) return 'function word or ambiguous standalone auxiliary';
}
// Concrete definitions found independently while reviewing missing-plan rows.
// Retain them here even after repairs, so future audits detect lost coverage.
const reviewedPicturable = [
  /^Père David's deer/, /^\(bird species of China\) Mrs\. Gould's sunbird/, /^bamboo container for a hat/,
  /^leather shoe stuffed with/, /^plants such as algae/,
  /^grains of Job's tears plant/, /^yellow dye made from the bark/
];
const intents = createHash('sha256'); const words = createHash('sha256'); const presentation = createHash('sha256');
const wanted = new Set(['不耻下问', '狼吞虎咽', '小题大做', '机械师', '窃窃私语']);
for (const row of rows) {
  totals.meaningRecords += row[3].length;
  totals.classifierRecordsOmitted += row[3].filter(gloss => /^CL:/i.test(gloss)).length;
  for (const gloss of row[3]) intents.update(JSON.stringify(inferVisualIntent(gloss)) + '\n');
  const word = fromRow(row);
  words.update(JSON.stringify(word) + '\n');
  presentation.update(JSON.stringify({ ...word, senses: word.senses.map(({ id, english }) => ({ id, english })) }) + '\n');
  for (const sense of word.senses) {
    totals.totalSenses++;
    if (!/[a-z]/i.test(sense.english)) { totals.noEnglish++; continue; }
    totals.englishSenses++;
    const intent = inferVisualIntent(sense.english); const plan = imageSearchPlan(word, sense);
    const source = intent?.planSource as string | undefined;
    if (intent) {
      if (source === 'english-definition') totals.englishFallback++;
      else if (source?.startsWith('idiom-')) totals.idiomFallback++;
      else totals.normal++;
      const valid = !!visualQuery(sense) && !!plan?.candidates.length && plan.candidates.length <= 5 && plan.candidates.every(c => c.query.length <= 100 && /[a-z]/i.test(c.query) && !/[\u3400-\u9fff]|[\u0000-\u001f]/.test(c.query));
      if (valid) totals.validPlans++;
      else { totals.invalidPlans++; failures.push({ word: word.simplified, ...sense }); }
    } else {
      totals.noPlan++;
      const knownPicturable = reviewedPicturable.some(pattern => pattern.test(sense.english));
      const reason = knownPicturable ? undefined : exclusionReason(sense.english);
      if (knownPicturable) totals.knownPicturableWithoutPlan++;
      if (reason) { totals.intentionallyExcluded++; exclusions[reason] = (exclusions[reason] ?? 0) + 1; }
      else totals.unresolvedNoPlan++;
      decisions.push({ word: word.simplified, english: sense.english, reason: reason ?? (knownPicturable ? 'known picturable coverage gap' : 'requires semantic review'), knownPicturable });
    }
    if (wanted.has(word.simplified)) examples.push({ word: word.simplified, sense: sense.id, english: sense.english, intent, queries: plan?.candidates.map(c => c.query) ?? [], stages: intent ? ['PLAN', 'QUERY', 'PROVIDER_ELIGIBLE', 'GALLERY_ELIGIBLE'] : ['NO_PLAN', 'NON_VISUAL', 'NO_QUERY', 'OPENVERSE_NOT_CALLED', 'UI_SUPPRESSED'] });
  }
}
const result = { totals, exclusions, coverageClaim: totals.unresolvedNoPlan ? 'Universal semantic coverage NOT established; unresolved senses are not counted as exclusions.' : 'All absent plans have an explicit exclusion reason.', hashes: { words: words.digest('hex'), intents: intents.digest('hex'), presentation: presentation.digest('hex') }, examples, failures, noPlan: decisions };
mkdirSync('.tmp', { recursive: true });
writeFileSync(process.argv[2] ?? '.tmp/picture-coverage.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify({ totals, exclusions, coverageClaim: result.coverageClaim, hashes: result.hashes, examples, invalidPlans: failures.slice(0, 10) }, null, 2));
// All three decisions are mutually exclusive. Unreviewed/invalid records fail
// the audit, rather than silently becoming an exclusion or shrinking scope.
if (totals.englishSenses !== totals.validPlans + totals.intentionallyExcluded + totals.unresolvedNoPlan + totals.invalidPlans || totals.unresolvedNoPlan || totals.invalidPlans) process.exitCode = 1;
