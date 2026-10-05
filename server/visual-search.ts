import lexicon from '../src/data/visual-lexicon.json';
import templates from '../src/data/visual-templates.json';
import { buildVisualQuery, inferVisualIntent, normalizeVisualMeaning, participle } from '../src/lib/visual-inference';
import { deduplicateImages } from '../src/lib/visual';
import type { Photo, Sense } from '../src/types';
import type { ImageSearch } from './image-plan';

export type QueryTier = 'A' | 'B' | 'C' | 'D' | 'E';
export interface VisualCandidate extends ImageSearch { tier: QueryTier }
export interface VisualSearchPlan {
  primary: VisualCandidate; supporting: VisualCandidate; candidates: VisualCandidate[];
  relevance: { exact: string[]; related: string[]; context: string[]; emotion: boolean; conceptual: boolean };
}
const verbs = new Set(lexicon.verbs.split('|'));
const people = new Set(lexicon.nouns.person.split('|'));
const families = new Map<string, keyof typeof templates>();
for (const [family, lemmas] of Object.entries(lexicon.descriptors)) {
  for (const lemma of lemmas.split('|')) if (!families.has(lemma)) families.set(lemma, family as keyof typeof templates);
}
for (const [family, template] of Object.entries(templates)) for (const anchor of template.anchors) families.set(anchor.split(':')[1].replaceAll('-', ' '), family as keyof typeof templates);
// These two existing WordNet families express the same visible fear response.
// Do not combine unrelated families (e.g. anger and happiness) for variety.
const relatedFamilies: Partial<Record<keyof typeof templates, (keyof typeof templates)[]>> = { panic: ['afraid'], afraid: ['panic'] };
const generic = new Set('a an the to of in on at for and or with be person people man woman child face facial expression portrait human emotion feeling concept object scene photo illustration vector'.split(' '));
function words(value: string) { return value.toLowerCase().match(/[a-z]+/g) ?? []; }
function terms(value: string) { return words(value).filter(word => !generic.has(word)); }
function verbRoot(value: string) {
  const stem = value.endsWith('ing') ? value.slice(0, -3) : value;
  return [value, value.replace(/ies$/, 'y'), value.replace(/es$/, ''), value.replace(/s$/, ''), stem, stem + 'e', stem.slice(0, -1)].find(word => verbs.has(word));
}

/** Only remove recognized grammatical wrappers, never arbitrary relative clauses. */
export function normalizeVisualSearchMeaning(meaning: string): string | null {
  const clean = normalizeVisualMeaning(meaning); if (!clean) return null;
  let value = clean.replace(/^(?:the )?(?:act|state) of /, '');
  const agent = value.match(/^(?:person|one|someone) who ([a-z]+)$/);
  if (agent) {
    const verb = verbRoot(agent[1]);
    const noun = verb && [verb + 'er', verb.replace(/e$/, '') + 'er', verb + 'or'].find(word => people.has(word));
    if (noun) value = noun;
  }
  const tool = value.match(/^something used for ([a-z]+ing)$/);
  if (tool && verbRoot(tool[1])) value = tool[1] + ' tool';
  const predicate = value.replace(/^(?:to )?(?:be|become|get|feel|look|seem|being|becoming|getting|feeling) /, '');
  if (families.has(predicate)) value = predicate;
  if (/^(?:to )?[a-z]+ quickly$/.test(value) && inferVisualIntent(value)?.visualType === 'action') value = value.replace(/ quickly$/, '');
  return value.replace(/^to /, '');
}

/** Selected English sense is the authority; no Mandarin membership or other senses. */
export function visualSearchPlan(sense: Sense, primary: ImageSearch, supporting: ImageSearch): VisualSearchPlan {
  const normalized = normalizeVisualSearchMeaning(sense.english) ?? sense.english.toLowerCase();
  const original = inferVisualIntent(sense.english);
  // Keep domain and physical-subject annotations; only normalized wrappers may
  // change a generic concept into a more directly depictable intent.
  const normalizedIntent = buildVisualQuery({ englishMeaning: normalized, partOfSpeech: /^(?:the )?act of /i.test(sense.english) ? 'verb' : sense.partOfSpeech });
  let inferred = /[()]/.test(sense.english) || original?.visualType !== 'conceptual' ? original : normalizedIntent ?? original;
  // Bare action lemmas such as run/sleep also have abstract event/state noun
  // entries in WordNet. Prefer their visible action; explicit domains and
  // physical nouns (school, fire, rain) retain their existing interpretation.
  if (!/[()]/.test(sense.english) && inferred?.visualType === 'conceptual' && ['act', 'state', 'event', 'process', 'general'].includes(inferred.conceptDomain ?? '') && verbs.has(normalized)) {
    const action = buildVisualQuery({ englishMeaning: normalized, partOfSpeech: 'verb' });
    if (action?.visualType === 'action') inferred = action;
  }
  const family = families.get(normalized) ?? (Object.keys(templates) as (keyof typeof templates)[]).find(name => templates[name].query === inferred?.query);
  const emotion = inferred?.visualType === 'emotion' && !!family;
  const conceptual = inferred?.visualType === 'conceptual';
  const candidates: VisualCandidate[] = [];
  const add = (query: string, tier: QueryTier, first = false) => {
    query = query.trim().replace(/\s+/g, ' ').slice(0, 100);
    const candidate = { ...primary, query, tier, category: first ? primary.category : undefined, imageType: first ? primary.imageType : 'all' as const };
    if (!candidates.some(item => item.query === query && item.imageType === candidate.imageType && item.category === candidate.category)) candidates.push(candidate);
  };
  const related: string[] = [];
  if (emotion && family) {
    const template = templates[family];
    const familyNames = [family, ...relatedFamilies[family] ?? []];
    const noun = template.anchors.some(anchor => anchor.startsWith('noun:') && anchor.split(':')[1] === normalized);
    const adjective = noun ? terms(template.fallback)[0] : normalized.replace(/ person$/, '');
    add(`${adjective} person`, 'A', true);
    // Prefer a complementary lexical family when one exists; otherwise use the
    // existing canonical expression as the morphological/synonym alternative.
    const alternative = templates[relatedFamilies[family]?.[0] ?? family].fallback;
    if (alternative !== candidates[0].query) add(alternative, 'B');
    add(`${adjective} face`, 'C');
    const nounAnchor = template.anchors.find(anchor => anchor.startsWith('noun:'))?.split(':')[1];
    if (candidates.length < 3 && nounAnchor) add(`${nounAnchor} expression`, 'C');
    for (const name of familyNames) {
      related.push(...terms(templates[name].fallback), ...templates[name].anchors.map(anchor => anchor.split(':')[1].replaceAll('-', ' ')));
    }
    // WordNet's small panic family has unambiguous fear-response synonyms.
    // Avoid treating every expanded descriptor as an interchangeable tag:
    // e.g. the angry family also contains polysemous "black", "sore", "mad".
    if (familyNames.includes('panic')) related.push(...lexicon.descriptors.panic.split('|'));
  } else if (inferred?.visualType === 'action') {
    const query = sense.visualOrigin === 'curated' ? primary.query : inferred.query;
    add(query, 'A', true);
    add(query.replace(/^person /, ''), 'B');
    related.push(...terms(inferred.subject));
  } else if (inferred?.visualType === 'person' && people.has(normalized) && /er$/.test(normalized)) {
    const root = [normalized.slice(0, -2), normalized.slice(0, -1)].find(verb => verbs.has(verb));
    add(root ? `${normalized} ${participle(root)}` : primary.query, 'A', true);
    add(normalized, 'B');
    if (root) related.push(root, participle(root));
  } else {
    const query = original?.visualType === 'conceptual' && inferred && !conceptual ? inferred.query : primary.query;
    add(query, conceptual ? 'D' : 'A', true);
    add(query === primary.query ? supporting.query : inferred!.subject, conceptual ? 'E' : 'B');
  }
  if (candidates.length === 1) add(candidates[0].query, 'B');
  const exact = terms(normalized);
  // The complete query context is useful for domains, but generic words such
  // as person/expression cannot count as evidence for a visible emotion.
  return { primary: candidates[0], supporting: candidates[1], candidates,
    relevance: { exact, related: [...new Set(related.flatMap(terms))], context: terms(primary.query), emotion, conceptual } };
}

function forms(term: string) {
  const result = new Set([term, term + 's']);
  if (term.endsWith('s')) result.add(term.slice(0, -1));
  if (term.endsWith('ies')) result.add(term.slice(0, -3) + 'y');
  if (verbs.has(term)) result.add(participle(term));
  return result;
}
function matches(metadata: Set<string>, target: string[]) { return target.filter(term => [...forms(term)].some(form => metadata.has(form))).length; }
export function imageRelevance(photo: Photo, plan: VisualSearchPlan) {
  // Use actual provider descriptions only. A generated alt/query is not proof
  // that an image contains its requested subject.
  const metadata = new Set(words((photo.tags ?? []).join(' ')));
  const profile = plan.relevance;
  const exact = matches(metadata, profile.exact); const related = matches(metadata, profile.related);
  const context = matches(metadata, profile.context);
  const semantic = exact > 0 || related > 0 || profile.conceptual && context > 0;
  const priority = plan.candidates.findIndex(candidate => candidate.query === photo.queryContext);
  const score = (exact ? 300 : related ? 200 : context ? 30 : 0) + Math.min(9, exact + related + context) * 3 + Math.max(0, 5 - (priority < 0 ? 5 : priority));
  // For emotions, people/portrait/expression or an unrelated emotion is not an
  // illustration of the selected meaning. Missing metadata stays uncertain.
  return { score, semantic, excluded: profile.emotion && metadata.size > 0 && !semantic };
}

export function rankImageCandidates(images: Photo[], plan: VisualSearchPlan): Photo[] {
  const ranked = images.map((photo, order) => ({ photo, order, ...imageRelevance(photo, plan) })).filter(item => !item.excluded);
  ranked.sort((a, b) => b.score - a.score || a.order - b.order);
  // Diversity is only a tie-breaker at identical semantic scores, never a
  // reason to put a weaker scene above a stronger selected-meaning match.
  const ordered: Photo[] = []; const seen = new Map<string, number>();
  while (ranked.length) {
    const score = ranked[0].score;
    const tied = ranked.filter(item => item.score === score);
    const identity = (photo: Photo) => `${photo.imageType ?? ''}|${photo.photographerUrl ?? photo.photographer ?? photo.id}`;
    tied.sort((a, b) => (seen.get(identity(a.photo)) ?? 0) - (seen.get(identity(b.photo)) ?? 0) || a.order - b.order);
    const next = tied[0]; ranked.splice(ranked.indexOf(next), 1); ordered.push(next.photo);
    seen.set(identity(next.photo), (seen.get(identity(next.photo)) ?? 0) + 1);
  }
  return deduplicateImages(ordered, 32);
}
