import lexicon from '../src/data/visual-lexicon.json';
import templates from '../src/data/visual-templates.json';
import { buildVisualQuery, inferVisualIntent, normalizeVisualMeaning, participle } from '../src/lib/visual-inference';
import { deduplicateImages, imageIdentity, photoIdentityKeys } from '../src/lib/visual';
import type { Photo, Sense } from '../src/types';
import type { ImageSearch } from './image-plan';
import { semanticFacets, composeGallery, photoEvidence, subjectEvidence, type SemanticFacet, type CompositionDecision } from './semantic-gallery';
import { TARGET_GALLERY_SIZE } from '../src/lib/visual-schema';

export type QueryTier = 'A' | 'B' | 'C' | 'D' | 'E';
export interface VisualCandidate extends ImageSearch { tier: QueryTier }
export interface VisualSearchPlan {
  primary: VisualCandidate; supporting: VisualCandidate; candidates: VisualCandidate[];
  meaning: string; facets: SemanticFacet[]; searches: VisualCandidate[]; humanScenes: boolean;
  relevance: { exact: string[]; related: string[]; context: string[]; emotion: boolean; conceptual: boolean; idiom?: boolean; englishFallback?: boolean; negative?: string[]; negativePhrases?: string[]; required?: string[][] };
}
const verbs = new Set(lexicon.verbs.split('|'));
const physicalNouns = new Set(Object.entries(lexicon.nouns).filter(([category]) => !category.startsWith('concept:')).flatMap(([, values]) => values.split('|')));
const people = new Set(lexicon.nouns.person.split('|'));
const feelings = new Set(lexicon.nouns['concept:feeling'].split('|'));
const families = new Map<string, keyof typeof templates>();
for (const [family, lemmas] of Object.entries(lexicon.descriptors)) {
  for (const lemma of lemmas.split('|')) if (!families.has(lemma)) families.set(lemma, family as keyof typeof templates);
}
for (const [family, template] of Object.entries(templates)) for (const anchor of template.anchors) families.set(anchor.split(':')[1].replaceAll('-', ' '), family as keyof typeof templates);
// These two existing WordNet families express the same visible fear response.
// Do not combine unrelated families (e.g. anger and happiness) for variety.
const relatedFamilies: Partial<Record<keyof typeof templates, (keyof typeof templates)[]>> = { panic: ['afraid'], afraid: ['panic'] };
const generic = new Set('a an the to of in on at for and or with be person people someone somebody man woman child student face facial expression portrait human emotion feeling concept object scene photo illustration vector'.split(' '));
function words(value: string) { return value.toLowerCase().match(/[a-z]+/g) ?? []; }
function terms(value: string) { return words(value).filter(word => !generic.has(word)); }
function verbRoot(value: string) {
  const stem = value.endsWith('ing') ? value.slice(0, -3) : value;
  return [value, value.replace(/ies$/, 'y'), value.replace(/es$/, ''), value.replace(/s$/, ''), stem, stem + 'e', stem.slice(0, -1)].find(word => verbs.has(word));
}

/** Only remove recognized grammatical wrappers, never arbitrary relative clauses. */
export function normalizeVisualSearchMeaning(meaning: string): string | null {
  const extracted = inferVisualIntent(meaning)?.semanticPredicate;
  if (extracted) return extracted;
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
  let inferred = original?.planSource || /[()]/.test(sense.english) || original?.visualType !== 'conceptual' ? original : normalizedIntent ?? original;
  // Bare action lemmas such as run/sleep also have abstract event/state noun
  // entries in WordNet. Prefer their visible action; explicit domains and
  // physical nouns (school, fire, rain) retain their existing interpretation.
  if (!original?.planSource && !/[()]/.test(sense.english) && inferred?.visualType === 'conceptual' && ['act', 'state', 'event', 'process', 'general'].includes(inferred.conceptDomain ?? '') && verbs.has(normalized)) {
    const action = buildVisualQuery({ englishMeaning: normalized, partOfSpeech: 'verb' });
    if (action?.visualType === 'action') inferred = action;
  }
  // General state phrases reuse existing English emotion families. This only
  // improves server retrieval; dictionary classification/content is untouched.
  const state = normalized.match(/^(?:with|in) ([a-z]+)(?: and ([a-z]+))?$/);
  const stateFamily = state && families.get(state[1]);
  const phraseFamily = stateFamily && templates[stateFamily].visualType === 'emotion' && state.slice(1).filter(Boolean).every(term => feelings.has(term) && (!families.has(term) || families.get(term) === stateFamily || relatedFamilies[stateFamily]?.includes(families.get(term)!))) ? stateFamily : undefined;
  const family = phraseFamily ?? families.get(normalized) ?? (Object.keys(templates) as (keyof typeof templates)[]).find(name => templates[name].query === inferred?.query);
  const emotion = !!phraseFamily || inferred?.visualType === 'emotion' && !!family;
  const conceptual = !emotion && inferred?.visualType === 'conceptual';
  const candidates: VisualCandidate[] = [];
  const add = (query: string, tier: QueryTier, first = false) => {
    query = query.trim().replace(/\s+/g, ' ').slice(0, 100);
    const candidate = { ...primary, query, tier, category: first ? primary.category : undefined, imageType: first ? primary.imageType : 'all' as const };
    if (!candidates.some(item => item.query === query && item.imageType === candidate.imageType && item.category === candidate.category)) candidates.push(candidate);
  };
  const related: string[] = inferred?.relevanceTerms ? [...inferred.relevanceTerms] : [];
  if (inferred?.fallbackQueries) {
    add(inferred.query, conceptual ? 'D' : 'A', true);
    for (const query of inferred.fallbackQueries.slice(0, 3)) add(query, 'B');
    if (emotion && family) {
      const familyNames = [family, ...relatedFamilies[family] ?? []];
      for (const name of familyNames) {
        related.push(...terms(templates[name].fallback), ...templates[name].anchors.map(anchor => anchor.split(':')[1].replaceAll('-', ' ')));
      }
      if (familyNames.includes('panic')) related.push(...lexicon.descriptors.panic.split('|'));
    }
  } else if (emotion && family) {
    const template = templates[family];
    const familyNames = [family, ...relatedFamilies[family] ?? []];
    const noun = template.anchors.some(anchor => anchor.startsWith('noun:') && anchor.split(':')[1] === normalized);
    const adjective = noun || phraseFamily ? terms(template.fallback)[0] : normalized.replace(/ person$/, '');
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
  if (candidates.length === 1 && inferred?.planSource !== 'idiom-last-resort') add(candidates[0].query, 'B');
  const broad = new Set('animal fruit food nature plant building vehicle appliance action outdoor indoors object scene'.split(' '));
  const rawExact = terms(normalized);
  const specific = rawExact.filter(t => !broad.has(t));
  const exact = specific.length ? specific : rawExact;
  // A generic role remains a real target when it IS the selected standalone
  // meaning, rather than incidental context for a specific action or state.
  if (!exact.length && /^[a-z]+$/.test(normalized)) exact.push(normalized);
  if (/\b(?:help(?:ing)?|assist(?:ance|ing)?)\b/.test(primary.query)) related.push('help', 'assist', 'assistance');
  const target = `${normalized} ${primary.query}`.toLowerCase();
  const negative: string[] = []; const negativePhrases: string[] = [];
  // Small reusable ambiguity domains, applied equally to all provider metadata.
  if (/\bapple\b/.test(target) && /\b(?:fruit|food)\b/.test(target)) negative.push('iphone', 'macbook', 'computer', 'logo');
  if (/\bmouse\b/.test(target)) {
    if (/\b(?:animal|rodent)\b/.test(target)) negative.push('computer', 'keyboard', 'electronics', 'device');
    else if (/\b(?:computer|device)\b/.test(target)) negative.push('rodent', 'animal');
  }
  if (/\bbank\b/.test(target)) {
    if (/\b(?:financial|finance|institution)\b/.test(target)) negative.push('river', 'riverbank', 'piggy');
    else if (/\briver\b/.test(target)) negative.push('financial', 'finance', 'atm');
  }
  if (/\b(?:person running|runner|jogging)\b/.test(primary.query)) negativePhrases.push('running shoe', 'running shoes', 'running water', 'running engine', 'running software', 'car race', 'motor race');
  if (/\bcold\b/.test(target) && /\b(?:person|feeling|shivering|temperature)\b/.test(primary.query)) negative.push('medicine', 'coldplay', 'beer');
  // The complete query context is useful for domains, but generic words such
  // as person/expression cannot count as evidence for a visible emotion.
  if (inferred?.visualType === 'animal' && /^[a-z]+$/.test(normalized))
    for (const accessory of ['food', 'toy', 'collar', 'accessories']) negativePhrases.push(`${normalized} ${accessory}`);
  const required: string[][] = [];
  // Preserve a concrete object already present in the validated action query.
  // Carrying a box and repairing a clock require both predicate AND object.
  const actionObject = candidates[0].query.match(/^person [a-z]+ing (.+)$/)?.[1];
  const last = actionObject?.split(' ').at(-1);
  if (last && !broad.has(last) && !generic.has(last) && [...forms(last)].some(noun => physicalNouns.has(noun)) && words(sense.english).some(token => forms(last).has(token))) required.push([last]);
  const gallery = semanticFacets(sense, candidates, emotion);
  return { primary: candidates[0], supporting: candidates[1] ?? candidates[0], candidates,
    meaning: sense.english, facets: gallery.facets, searches: gallery.searches, humanScenes: gallery.human,
    relevance: { exact, related: [...new Set(related.flatMap(terms))].filter(t => !specific.length || !broad.has(t)), context: terms(primary.query).filter(t => !specific.length || !broad.has(t)), emotion, conceptual, idiom: !!original?.planSource && original.planSource !== 'english-definition', englishFallback: original?.planSource === 'english-definition', negative, negativePhrases, required } };
}

function forms(term: string) {
  const result = new Set([term, term + 's']);
  if (families.has(term) && families.get(term + 'ful') === families.get(term)) result.add(term + 'ful');
  if (term.endsWith('s')) result.add(term.slice(0, -1));
  if (term.endsWith('ies')) result.add(term.slice(0, -3) + 'y');
  const root = verbRoot(term);
  if (root) { result.add(root); result.add(participle(root)); result.add(participle(root).slice(0, -3) + 'er'); }
  return result;
}
function matches(metadata: Set<string>, target: string[]) { return target.filter(term => [...forms(term)].some(form => metadata.has(form))).length; }
export function imageRelevance(photo: Photo, plan: VisualSearchPlan) {
  // Use actual provider descriptions only. A generated alt/query is not proof
  // that an image contains its requested subject.
  const evidence = photoEvidence(photo);
  const metadata = new Set(words(evidence));
  const profile = plan.relevance;
  const exact = matches(metadata, profile.exact); const related = matches(metadata, profile.related);
  const context = matches(metadata, profile.context);
  const wrongSense = matches(metadata, profile.negative ?? []) > 0 || (profile.negativePhrases ?? []).some(phrase => new RegExp(`\\b${phrase}\\b`).test(evidence));
  const askingScene = /\b(?:asking|question|advice)\b/.test(plan.primary.query) && /\b(?:raising hand|sharing knowledge|seeking guidance)\b/.test(evidence);
  const visibleState = /\b(?:person|people|man|woman|child|children|student|teacher|colleague|mentor|learner|face|facial|expression|eyes|body language|gesture|posture|reaction|reacting|symbol|icon|sign|graphic|illustration)\b/.test(evidence);
  const explicitStateTag = (photo.tags ?? []).some(tag => {
    const tokens = words(subjectEvidence({ ...photo, title: undefined, description: undefined, semanticAlt: undefined, tags: [tag] }));
    return tokens.length > 0 && tokens.length <= 4 && matches(new Set(tokens), [...profile.exact, ...profile.related]) > 0;
  });
  const semantic = !wrongSense && (!profile.emotion || visibleState || explicitStateTag) && (profile.required ?? []).every(group => matches(metadata, group) > 0) && (exact > 0 || related > 0 || profile.conceptual && context > 0 || askingScene);
  const priority = plan.candidates.findIndex(candidate => candidate.query === photo.queryContext);
  const direct = new Set(words(subjectEvidence(photo)));
  const captionOnly = !matches(direct, [...profile.exact, ...profile.related, ...profile.context]) && !askingScene;
  const score = (exact ? 300 : related || askingScene ? 200 : context ? 30 : 0) + Math.min(9, new Set([...profile.exact, ...profile.related, ...profile.context].filter(t => matches(metadata, [t]))).size) * 3 + Math.max(0, 5 - (priority < 0 ? 5 : priority)) - (captionOnly ? 35 : 0);
  // For emotions, people/portrait/expression or an unrelated emotion is not an
  // illustration of the selected meaning. Missing metadata stays uncertain.
  return { score: wrongSense ? -1 : score, semantic, excluded: wrongSense || !!profile.englishFallback && !semantic || (profile.emotion || profile.idiom) && metadata.size > 0 && !semantic };
}

export function qualifiedImageCandidates(images: Photo[], plan: VisualSearchPlan) {
  // Group identities before competition. Choose the strongest metadata record
  // within each group, preserving that record's complete attribution/license.
  const groups: { keys: Set<string>; photos: Photo[] }[] = [];
  for (const photo of images) {
    const keys = photoIdentityKeys(photo);
    const overlaps = groups.filter(group => keys.some(key => group.keys.has(key)));
    const group = { keys: new Set(keys), photos: [photo] };
    for (const old of overlaps) { old.keys.forEach(key => group.keys.add(key)); group.photos.push(...old.photos); groups.splice(groups.indexOf(old), 1); }
    groups.push(group);
  }
  // Stable asset identity resolves equal scores independently of provider,
  // response timing and upstream popularity. No provider quota or score bonus.
  const stable = (photo: Photo) => {
    let hash = 2166136261;
    for (const char of imageIdentity(photo.largeUrl)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    return hash >>> 0;
  };
  const usability = (photo: Photo) => Math.min(2, Math.log2(Math.max(1, photo.width * photo.height / 60000))) - Math.abs(Math.log2(photo.width / photo.height));
  const compare = (a: { photo: Photo; score: number }, b: { photo: Photo; score: number }) => b.score - a.score || usability(b.photo) - usability(a.photo) || stable(a.photo) - stable(b.photo) || a.photo.sourceUrl.localeCompare(b.photo.sourceUrl) || photoEvidence(a.photo).localeCompare(photoEvidence(b.photo)) || Number(!!b.photo.licenseUrl) - Number(!!a.photo.licenseUrl) || a.photo.id.replace(/^(?:pixabay|openverse|pexels)-/, '').localeCompare(b.photo.id.replace(/^(?:pixabay|openverse|pexels)-/, ''));
  const ranked = groups.map(group => group.photos.filter(photo => deduplicateImages([photo]).length).map(photo => ({ photo, ...imageRelevance(photo, plan) })).filter(item => item.semantic).sort(compare)[0]).filter((item): item is NonNullable<typeof item> => !!item);
  ranked.sort(compare);
  return ranked;
}

export function rankImageCandidates(images: Photo[], plan: VisualSearchPlan, limit = TARGET_GALLERY_SIZE, onDecision?: (decisions: CompositionDecision[]) => void): Photo[] {
  const ranked = qualifiedImageCandidates(images, plan);
  const composed = composeGallery(ranked, plan, limit);
  onDecision?.(composed.decisions);
  return composed.images;
}
