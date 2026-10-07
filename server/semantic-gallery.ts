import type { Photo, Sense } from '../src/types';
import type { VisualCandidate, VisualSearchPlan } from './visual-search';

export const MAX_FACETS = 6;
export const MAX_GALLERY_ROUNDS = 3;
export interface SemanticFacet {
  id: string; concept: string; intent: string; queries: string[]; importance: number;
  sceneType: 'subject' | 'human' | 'context' | 'symbol';
  cues: string[];
}
const stop = new Set('a an the to of for and or with in on at person people someone something one ones photo image illustration picture generic red blue green yellow background'.split(' '));
export function semanticTokens(value: string): string[] {
  return [...new Set((value.toLowerCase().match(/[a-z]+/g) ?? []).filter(t => !stop.has(t)))];
}
export function queryIdentity(value: string) { return semanticTokens(value).sort().join(' '); }
export function photoEvidence(photo: Photo) {
  return [photo.title, photo.description, photo.semanticAlt, ...(photo.tags ?? [])].filter(Boolean).join(' ').toLowerCase();
}
const has = (text: string, cues: string[]) => cues.some(cue => new RegExp(`\\b${cue}\\b`).test(text));

/** Extend a validated plan. Rules describe reusable scenes, never Chinese words. */
export function semanticFacets(sense: Sense, candidates: VisualCandidate[], emotion: boolean) {
  const primary = candidates[0].query;
  const meaning = sense.english.toLowerCase();
  const reflexive = /\b(?:oneself|himself|herself|yourself|itself)\b/.test(meaning);
  const complement = meaning.match(/^to [a-z]+ (?:a|an|the) ([a-z]+(?: [a-z]+){0,2})$/)?.[1];
  const facets: SemanticFacet[] = [];
  const add = (id: string, query: string, cues: string[], sceneType: SemanticFacet['sceneType'], importance = 1) => {
    query = query.toLowerCase().replace(/[^a-z0-9 -]/g, ' ').replace(/\s+/g, ' ').trim();
    if (facets.length < MAX_FACETS) facets.push({ id, concept: query, intent: sense.english, queries: [query.slice(0, 100)], importance, sceneType, cues });
  };
  add('subject', primary, [], 'subject');
  // The validated predicate controls the domain. The complete selected gloss
  // supplies additional purpose/relationship cues, without literalizing idioms.
  if (reflexive) {
    const object = meaning.match(/\b(?:oneself|himself|herself|yourself|itself) (?:to|with|in) ([a-z]+)/)?.[1] ?? '';
    add('self-directed', `${primary} oneself ${object}`, ['oneself', ...(object ? [object] : [])], 'context');
  } else if (complement && !primary.includes(complement)) {
    add('object', `${primary} ${complement}`, semanticTokens(complement), 'context', 1.3);
  } else if (/\b(?:advice|question|learn\w*|teach\w*)\b/.test(primary)) {
    if (/\b(?:ask\w*|advice|question)\b/.test(primary)) {
      add('education', 'student asking teacher question classroom', ['student', 'teacher', 'classroom', 'raising hand'], 'human', 1.3);
      add('professional', 'person asking colleague advice', ['colleague', 'coworker', 'workplace', 'office'], 'human', 1.2);
    }
    if (/\b(?:learn\w*|teach\w*|knowledge|guidance|advice|subordinates)\b/.test(`${primary} ${meaning}`))
      add('interaction', 'people learning together mentor guidance', ['mentor', 'learner', 'learning together', 'sharing knowledge', 'guidance'], 'human', 1.2);
  } else if (/\b(?:help\w*|assist\w*|cooperat\w*|teamwork)\b/.test(primary)) {
    add('recipient', 'person helping another person', ['elderly', 'another', 'disabled', 'neighbor', 'neighbour'], 'human', 1.2);
    add('professional', 'people helping teamwork work', ['teamwork', 'work', 'colleague', 'coworker'], 'human');
    add('education', 'student helping learning', ['student', 'teacher', 'learning', 'classroom'], 'human');
  } else if (emotion || sense.visualType === 'human-state') {
    const predicate = primary.replace(/\b(?:person|people|face|expression)\b/g, '').trim();
    add('expression', `${predicate} facial expression`, ['face', 'facial', 'expression', 'eyes'], 'human', 1.2);
    add('body-language', `${predicate} person body language`, ['body language', 'cowering', 'trembling', 'hiding', 'posture', 'gesture'], 'human');
    add('situation', `${predicate} person reacting`, ['reacting', 'reaction', 'situation', 'danger', 'surprise'], 'human');
  } else if (sense.visualType === 'action' || /^person \w+ing\b/.test(primary)) {
    add('actor', primary.replace(/^person /, 'child '), ['child', 'children', 'adult', 'woman', 'man'], 'human');
    if (/\b(?:running|jogging|walking|swimming|cycling|jumping)\b/.test(primary)) {
      add('environment', `${primary} outdoors`, ['outdoor', 'outdoors', 'park', 'trail', 'beach'], 'context');
      add('practice', `${primary} athlete`, ['athlete', 'runner', 'race', 'training', 'track'], 'human');
    } else add('interaction', `${primary} together`, ['together', 'group', 'partner', 'family'], 'human');
  } else if (['fruit', 'vegetable', 'food'].includes(sense.visualType)) {
    add('appearance', `${primary} sliced`, ['sliced', 'slice', 'slices', 'cut', 'halves'], 'context');
    add('environment', `${primary} market`, ['market', 'basket', 'tree', 'orchard', 'garden'], 'context');
    add('usage', `person eating ${primary}`, ['eating', 'eat', 'meal', 'cooking'], 'human');
  } else if (sense.visualType === 'animal') {
    add('environment', `${primary} habitat`, ['habitat', 'forest', 'home', 'wild', 'garden'], 'context');
    add('behavior', `${primary} moving`, ['walking', 'running', 'flying', 'swimming', 'sleeping', 'feeding'], 'context');
  } else if (sense.visualType === 'person') {
    add('professional', `${primary} working`, ['working', 'work', 'workplace'], 'human');
    add('interaction', `${primary} helping people`, ['helping', 'teaching', 'patient', 'customer'], 'human');
  } else {
    // Existing alternatives already encode meaning-specific domains for places,
    // qualities and abstract concepts; retain them instead of inventing settings.
    for (const candidate of candidates.slice(1)) {
      const cues = semanticTokens(candidate.query).filter(t => !semanticTokens(primary).includes(t));
      if (cues.length && queryIdentity(candidate.query) !== queryIdentity(primary))
        add(`context-${facets.length}`, candidate.query, cues, 'context');
    }
  }
  const human = !['food', 'fruit', 'vegetable', 'animal'].includes(sense.visualType) && facets.some(f => f.sceneType === 'human');
  if (human) add('symbol', primary, ['symbol', 'icon', 'sign', 'graphic', 'question mark', 'text only', 'logo'], 'symbol', .4);
  // Search distinct facets before lexical variants. A repeated primary query
  // cannot consume a second provider round just by changing category/type.
  const searches: VisualCandidate[] = []; const seen = new Set<string>();
  for (const query of [primary, ...facets.filter(f => f.id !== 'subject' && f.sceneType !== 'symbol').flatMap(f => f.queries), ...candidates.map(c => c.query)]) {
    const key = queryIdentity(query); if (!key || seen.has(key)) continue;
    seen.add(key);
    searches.push({ ...candidates[0], query, ...(searches.length ? { category: undefined, imageType: 'all' as const, tier: 'B' as const } : {}) });
    if (searches.length === MAX_GALLERY_ROUNDS) break;
  }
  return { facets, searches, human };
}

export interface SemanticProfile { facets: string[]; cluster: string; symbolic: boolean; human: boolean; tokens: string[] }
export function candidateSemantics(photo: Photo, plan: VisualSearchPlan): SemanticProfile {
  const text = photoEvidence(photo);
  const symbolic = has(text, ['symbol', 'symbols', 'icon', 'icons', 'sign', 'graphic', 'logo', 'question mark', 'text only']);
  const human = !symbolic && has(text, ['person', 'people', 'student', 'teacher', 'child', 'children', 'man', 'woman', 'colleague', 'coworker', 'mentor', 'learner', 'athlete', 'runner', 'elderly']);
  const facets = plan.facets.filter(f => f.id !== 'subject' && (f.sceneType === 'symbol' ? symbolic : !symbolic && has(text, f.cues))).map(f => f.id);
  // Broad colors, asset IDs and provider names cannot make new concept clusters.
  const tokens = semanticTokens(text);
  const cluster = symbolic ? 'symbol' : facets.length ? [...facets].sort().join('+') : human ? 'human-subject' : 'subject';
  return { facets: facets.length ? facets : ['subject'], cluster, symbolic, human, tokens };
}
export interface CompositionDecision {
  id: string; provider?: string; score: number; facets: string[]; cluster: string;
  coverageGain: number; redundancyPenalty: number; marginalValue: number; reason: string;
}
/** Quality has already been checked. Novelty can only reorder eligible images. */
export function composeGallery(pool: { photo: Photo; score: number }[], plan: VisualSearchPlan, limit: number) {
  const remaining = pool.map(item => ({ ...item, semantics: candidateSemantics(item.photo, plan) }));
  const bestScore = Math.max(0, ...pool.map(p => p.score));
  const complementary = new Set(remaining.filter(item => item.score >= bestScore - 110).map(item => item.semantics.cluster)).size >= 2;
  const hasRealScenes = plan.humanScenes && remaining.some(item => item.semantics.human);
  const selected: typeof remaining = []; const decisions: CompositionDecision[] = [];
  const counts = new Map<string, number>(); const clusters = new Map<string, number>();
  while (remaining.length && selected.length < limit) {
    // Once a symbol contributes its explanation, do not pad a human meaning
    // with more symbols. A symbol-only pool still retains its accurate fallback.
    if (hasRealScenes && (counts.get('symbol') ?? 0) >= 1) {
      for (let i = remaining.length - 1; i >= 0; i--) if (remaining[i].semantics.symbolic) remaining.splice(i, 1);
      if (!remaining.length) break;
    }
    // A narrow cluster has diminishing teaching value once several strong
    // alternatives exist. Keep one-facet galleries intact; otherwise stop
    // repetitive padding after two examples of a cluster.
    if (complementary) {
      for (let i = remaining.length - 1; i >= 0; i--) if ((clusters.get(remaining[i].semantics.cluster) ?? 0) >= 2) remaining.splice(i, 1);
      if (!remaining.length) break;
    }
    const evaluated = remaining.map(item => {
      const s = item.semantics;
      const coverageGain = s.facets.reduce((sum, id) => sum + (id === 'subject' || counts.has(id) ? 0 : 38 * (plan.facets.find(f => f.id === id)?.importance ?? 1)), 0);
      const similar = Math.max(0, ...selected.map(other => {
        const a = s.tokens; const b = other.semantics.tokens;
        return a.filter(t => b.includes(t)).length / Math.max(1, new Set([...a, ...b]).size);
      }));
      const repetitions = clusters.get(s.cluster) ?? 0;
      const redundancyPenalty = Math.min(180, repetitions * 65) + similar * 30 + (s.symbolic ? (counts.get('symbol') ?? 0) * 120 : 0);
      const realScene = plan.humanScenes && s.human ? 30 : 0;
      const marginalValue = item.score + coverageGain + realScene - redundancyPenalty;
      return { item, coverageGain, redundancyPenalty, marginalValue };
    });
    // Input pool is already deterministically sorted by quality and asset identity.
    evaluated.sort((a, b) => b.marginalValue - a.marginalValue);
    const next = evaluated[0]; const { item } = next;
    selected.push(item); remaining.splice(remaining.indexOf(item), 1);
    item.semantics.facets.forEach(id => counts.set(id, (counts.get(id) ?? 0) + 1));
    clusters.set(item.semantics.cluster, (clusters.get(item.semantics.cluster) ?? 0) + 1);
    decisions.push({ id: item.photo.id, provider: item.photo.provider, score: item.score, facets: item.semantics.facets, cluster: item.semantics.cluster,
      coverageGain: next.coverageGain, redundancyPenalty: next.redundancyPenalty, marginalValue: next.marginalValue,
      reason: next.coverageGain ? 'complementary meaning context' : selected.length === 1 ? 'strong selected-sense match' : 'additional relevant example' });
  }
  return { images: selected.map(item => item.photo), decisions };
}

export function enoughSemanticCoverage(images: Photo[], plan: VisualSearchPlan, thumbnail = false) {
  if (thumbnail) return images.length > 0;
  if (images.length < 4) return false;
  const profiles = images.map(photo => candidateSemantics(photo, plan));
  const contextual = new Set(profiles.flatMap(p => p.facets).filter(id => id !== 'subject' && id !== 'symbol'));
  const target = Math.min(2, plan.facets.filter(f => f.id !== 'subject' && f.sceneType !== 'symbol').length);
  return images.length >= (target >= 2 ? 4 : 6) && contextual.size >= target && (!plan.humanScenes || profiles.some(p => p.human));
}
