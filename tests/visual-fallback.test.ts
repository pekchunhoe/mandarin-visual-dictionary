// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
afterEach(() => { vi.doUnmock('../src/data/visual-lexicon.json'); vi.resetModules(); vi.restoreAllMocks(); });
it.each([null, {}, { nouns: { animal: null }, verbs: null }])('keeps inference and curated words usable with unavailable WordNet data: %j', async data => {
  vi.resetModules();
  vi.doMock('../src/data/visual-lexicon.json', () => ({ default: data }));
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const { inferVisualIntent } = await import('../src/lib/visual-inference');
  const { byId } = await import('../src/data/learning');
  expect(inferVisualIntent('giraffe')).toBeNull();
  expect(inferVisualIntent('because')).toBeNull();
  expect(inferVisualIntent('to understand')).toBeNull();
  expect(inferVisualIntent('happy')?.visualType).toBe('emotion');
  expect(byId.get('苹果')?.senses[0].visualQuery).toBeTruthy();
  expect(warning).toHaveBeenCalledWith('[visuals] optional_lexicon_unavailable');
});
it('treats unresolved English terms and object prototype names as non-visual', async () => {
  const { inferVisualIntent } = await import('../src/lib/visual-inference');
  for (const word of ['unrecognizedxyz', 'constructor', 'hasownproperty']) expect(inferVisualIntent(word)).toBeNull();
});
