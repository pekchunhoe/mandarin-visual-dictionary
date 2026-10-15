// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { DictionaryIndex } from '../src/lib/dictionary';
import { applyMalayRecords, MalaySearchIndex, normalizeMalay, type MalayAsset } from '../src/lib/malay-search';
import { createDictionaryEntries } from '../src/lib/dictionary-entry-core';
import type { RawRow } from '../src/lib/dictionary-entry-core';
import { imageSearchPlan } from '../server/image-plan';
import { visualQuery } from '../src/lib/visual';
import { fromRow } from '../src/lib/dictionary-entry';
import { resolveImageWord } from '../server/dictionary';
import { getImages, clearImageCache, type CompetitionTrace } from '../server/images';
import { largeGalleryCases, largeGalleryRecords } from './large-gallery-data';
import { imageRelevance } from '../server/visual-search';
const rows: RawRow[] = JSON.parse(readFileSync('public/data/cedict.json', 'utf8'));
const asset: MalayAsset = JSON.parse(readFileSync('src/data/malay-runtime.json', 'utf8'));
// Whole corpus search without costly visual inference; gallery tests use actual inference below.
const lightweight = createDictionaryEntries(() => null);
const words = applyMalayRecords(rows.map(lightweight.fromRow), asset);
const index = new DictionaryIndex(words);

describe('sense-aligned Malaysian Malay search', () => {
  it.each([['anjing','狗'], ['kucing','猫'], ['membantu','帮助'], ['bantu','帮助'], ['bantuan','帮助'], ['pertolongan','帮助'], ['menolong','帮助'], ['belajar','学习'], ['sekolah','学校'], ['guru','老师'], ['keberanian','勇气'], ['rendah hati','谦虚'], ['tidak malu bertanya','不耻下问'], ['algoritma','算法'], ['sentiasa','总是'], ['gembira','高兴'], ['panas','热'], ['membaca','读']])('finds %s in actual corpus as %s', (query, expected) => {
    const match = index.search(query).find(w => w.simplified === expected);
    expect(match).toBeDefined();
    expect(match?.senses.find(s => s.id === match.matchedSenseId)?.malay).toBeTruthy();
  });
  it.each(['ANJING', 'ＡＮＪＩＮＧ', '  anjing ', 'anjnig', 'anjin', 'anji'])('normalizes and tolerates partial/typo input %s', query => expect(index.search(query).some(w => w.simplified === '狗')).toBe(true));
  it('keeps phrase boundaries and all senses separate', () => {
    expect(normalizeMalay('rendah　hati')).toBe('rendah hati');
    expect(normalizeMalay('rendahhati')).not.toBe(normalizeMalay('rendah hati'));
    const opening = index.search('membuka').find(w => w.simplified === '开')!;
    const boiling = index.search('mendidih').find(w => w.simplified === '开')!;
    expect(opening.matchedSenseId).toBe('sense-0');
    expect(boiling.matchedSenseId).toBe('sense-3');
    expect(boiling.senses).toHaveLength(9);
    expect(boiling.senses.find(s => s.english.startsWith('(directional complement)'))?.malay).toBeUndefined();
  });
  it.each(['猫', '貓', 'mao1', 'māo', 'cat', 'APPLE', 'chang jing lu', 'giraffe'])('preserves lookup via %s', query => expect(index.search(query).length).toBeGreaterThan(0));
  it('does not overwrite existing glosses or apply changed/shifted English senses', () => {
    const raw = lightweight.fromRow(rows.find(r => r[1] === '狗')!);
    const original = structuredClone(raw); raw.senses[0].malay = 'existing valuable gloss';
    expect(applyMalayRecords([raw], asset)[0].senses[0].malay).toBe('existing valuable gloss');
    original.senses[0].english = 'a different meaning';
    expect(applyMalayRecords([original], asset)[0].senses[0].malay).toBeUndefined();
    expect(rows.find(r => r[1] === '狗')![3][0]).toBe('dog');
  });
  it('orders equivalents, phrases, synonyms, approved variants, partials and fuzzy matches', () => {
    const base = words[0];
    const kinds = ['equivalent','phrase','synonym','morphology','partial','fuzzy'];
    const fixtures = kinds.map((id, i) => ({ ...base, id, dictionaryId: id, senses: [{ ...base.senses[0], malay: ['bantu', 'bantu', 'sokong', 'pertolongan', 'bantuan', 'bntu'][i], malaySearchTerms: i === 0 ? ['bantu'] : [], malaySynonyms: i === 2 ? ['bantu'] : [], malayMorphology: i === 3 ? ['bantu'] : [] }] }));
    expect(new MalaySearchIndex(fixtures).search('bantu').map(w => w.id)).toEqual(kinds);
  });
  it('reuses the established image plan for the exact matched Mandarin sense', () => {
    const hit = index.search('mendidih').find(w => w.simplified === '开')!;
    const real = resolveImageWord(hit.id, hit.matchedSenseId)!;
    const sense = real.senses.find(s => s.id === hit.matchedSenseId)!;
    const plan = imageSearchPlan(real, sense);
    if (!plan) throw new Error('Matched sense must have an image plan');
    expect(sense.english).toBe('to boil');
    expect(visualQuery(sense)).toBeTruthy();
    expect(plan.candidates.every(c => c.senseId === 'sense-3')).toBe(true);
    expect(plan.candidates.map(c => c.query).join(' ')).toMatch(/boil/);
    expect(plan.candidates.map(c => c.query).join(' ')).not.toMatch(/door|mendidih/);
  });
  it.each([['membantu', 3], ['tidak malu bertanya', 4]] as const)('retrieves 20 semantically qualified provider pictures through Malay %s', async (query, exampleIndex) => {
    clearImageCache();
    const example = largeGalleryCases[exampleIndex];
    const hit = index.search(query).find(w => w.simplified === example.word)!;
    const real = resolveImageWord(hit.id, hit.matchedSenseId)!;
    const sense = real.senses.find(s => s.id === hit.matchedSenseId)!;
    const plan = imageSearchPlan(real, sense)!;
    const records = largeGalleryRecords(example);
    const traces: CompetitionTrace[] = [];
    const fetcher = vi.fn(async input => new Response(JSON.stringify(new URL(String(input)).hostname === 'pixabay.com' ? { hits: records.hits.slice(0, 18) } : { results: records.results.slice(18) })));
    const result = await getImages(hit.id, hit.matchedSenseId!, { pixabayKey: 'malay-semantic-fixture', fetcher, onTrace: event => traces.push(event) });
    expect(result.images).toHaveLength(20);
    expect(result.images.every(photo => imageRelevance(photo, plan).semantic)).toBe(true);
    expect(result.images.some(photo => photo.provider === 'openverse' && photo.license)).toBe(true);
    expect(result.images.some(photo => photo.provider === 'pixabay')).toBe(true);
    expect(traces.find(event => event.stage === 'plan')?.senseId).toBe(hit.matchedSenseId);
    expect(traces.find(event => event.stage === 'plan')?.english).toBe(sense.english);
  });
});
