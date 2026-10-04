// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
afterEach(() => { vi.doUnmock('../src/data/visual-lexicon.json'); vi.resetModules(); vi.restoreAllMocks(); });
it.each([null, {}, { nouns: { animal: null }, verbs: null }])('keeps inference and curated words usable with unavailable WordNet data: %j', async data => {
  vi.resetModules();
  vi.doMock('../src/data/visual-lexicon.json', () => ({ default: data }));
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const { inferVisualIntent } = await import('../src/lib/visual-inference');
  const { byId } = await import('../src/data/learning');
  expect(inferVisualIntent('giraffe')).toMatchObject({ visualType: 'conceptual', fallback: 'giraffe' });
  expect(inferVisualIntent('because')).toBeNull();
  expect(inferVisualIntent('to understand')?.visualType).toBe('conceptual');
  expect(inferVisualIntent('politics')?.query).toBe('government parliament politics');
  expect(inferVisualIntent('intergenerational equity')?.fallback).toBe('intergenerational equity');
  expect(inferVisualIntent('happy')?.visualType).toBe('emotion');
  expect(byId.get('苹果')?.senses[0].visualQuery).toBeTruthy();
  expect(warning).toHaveBeenCalledWith('[visuals] optional_lexicon_unavailable');
});
it('uses its own phrase for unresolved terms without inheriting object prototype properties', async () => {
  const { inferVisualIntent } = await import('../src/lib/visual-inference');
  for (const word of ['unrecognizedxyz', 'constructor', 'hasownproperty']) {
    expect(inferVisualIntent(word)?.query).toBe(`${word} concept`);
    expect(inferVisualIntent(word)?.fallback).toBe(word);
  }
});
