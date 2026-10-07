// @vitest-environment node
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fromRow } from '../src/lib/dictionary-entry';
import type { RawRow } from '../src/lib/dictionary-entry';
import { buildVisualQuery, inferVisualIntent } from '../src/lib/visual-inference';
import { visualQuery } from '../src/lib/visual';
import { clearImageCache, getImages } from '../server/images';
import { imageSearchPlan } from '../server/image-plan';

// Remove enhancements in this suite so even existing starter words MUST pass
// through English inference and the server's full canonical dictionary index.
vi.mock('../src/data/learning', () => ({ byId: new Map(), words: [] }));
const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
const entries = (text: string) => rows.filter(row => row[1] === text).map(fromRow);
beforeEach(clearImageCache);
// Describe the depicted activity for an idiomatic gloss, not its literal words.
const live = (meaning: string) => ({ ok: true, json: async () => ({ hits: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, pageURL: `https://pixabay.com/photos/expression-${i + 1}/`, webformatURL: `https://pixabay.com/get/expression-${i + 1}_640.jpg`, imageWidth: 900, imageHeight: 700, tags: meaning === 'to go to bed' ? 'sleeping person bed' : `${meaning} person` })) }) });

describe('English meaning to visuals without curated metadata', () => {
  const emotions = '恐慌 惊讶 高兴 快乐 伤心 生气 害怕 紧张 兴奋 失望 困惑 担心'.split(' ');
  const actions = '跑 走 跳 吃 喝 写 读 看 听 笑 哭 睡觉 游泳 唱歌 跳舞 开车'.split(' ');
  const states = '冷 热 高 矮 大 小 快 慢 干净 肮脏 累 饿 渴 胖 漂亮'.split(' ');
  it.each([...emotions, ...actions, ...states])('%s uses its selected English sense to reach Pixabay', async text => {
    const candidates = entries(text);
    const word = candidates.find(w => w.senses.some(s => visualQuery(s)));
    expect(word, JSON.stringify(candidates.map(w => w.senses.map(s => s.english)))).toBeDefined();
    const sense = word!.senses.find(s => visualQuery(s))!;
    expect(sense.visualOrigin).toBe('inferred');
    if (emotions.includes(text)) expect(sense.visualType).toBe('emotion');
    const fetcher = vi.fn().mockResolvedValue(live(sense.english));
    const result = await getImages(word!.id, sense.id, { pixabayKey: 'meaning-test-key', fetcher });
    expect(result.status).toBe('live'); expect(result.images).toHaveLength(8);
    expect(fetcher.mock.calls.length).toBeGreaterThanOrEqual(2); expect(fetcher.mock.calls.length).toBeLessThanOrEqual(6);
    const params = new URL(fetcher.mock.calls[0][0]).searchParams;
    expect(params.get('q')).toBe(imageSearchPlan(word!, sense)!.primary.query);
    expect(params.get('q')).toMatch(/^[a-z -]+$/);
    expect(params.get('safesearch')).toBe('true'); expect(params.get('lang')).toBe('en');
  });
  it.each([
    ['恐慌', 'panic', 'panicked person facial expression', 'panicked person'],
    ['惊讶', 'amazed', 'surprised person facial expression', 'amazed person'],
    ['生气', 'to get angry; to be furious', 'angry person facial expression', 'angry person'],
    ['害怕', 'to be afraid; to be scared', 'scared person facial expression', 'afraid person'],
    ['冷', 'cold', 'person feeling cold winter', 'person feeling cold winter'],
    ['跑', 'to run', 'person running', 'person running']
  ])('%s preserves the exact selected meaning %s', async (text, meaning, query, visualSearch) => {
    const word = entries(text).find(w => w.senses.some(s => s.english === meaning))!;
    const sense = word.senses.find(s => s.english === meaning)!;
    expect(sense.visualQuery).toBe(query);
    const fetcher = vi.fn().mockResolvedValue(live(sense.english));
    await getImages(word.id, sense.id, { pixabayKey: 'meaning-test-key', fetcher });
    expect(new URL(fetcher.mock.calls[0][0]).searchParams.get('q')).toBe(visualSearch);
  });
  it.each('因为 但是 虽然 如果 所以 而且 已经 然而 以及'.split(' '))('%s still skips image providers', async text => {
    const fetcher = vi.fn();
    for (const word of entries(text)) for (const sense of word.senses) {
      expect(visualQuery(sense)).toBeNull();
      expect((await getImages(word.id, sense.id, { pixabayKey: 'meaning-test-key', fetcher })).images).toEqual([]);
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each(['panic / panicky / panic-stricken', 'panicky', 'panic-stricken'])('canonicalizes %s without concatenating synonyms', meaning => {
    expect(inferVisualIntent(meaning)?.query).toBe('panicked person facial expression');
  });
  it.each(['to be surprised / astonished', '(of a person) amazed', 'astonishment', 'surprise'])('canonicalizes surprise: %s', meaning => {
    expect(inferVisualIntent(meaning)?.query).toBe('surprised person facial expression');
  });
  it('bounds emotion searches to three specific expressions and keeps a human context', async () => {
    const word = entries('恐慌')[0]; const sense = word.senses[0];
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ hits: [] }) });
    await getImages(word.id, sense.id, { pixabayKey: 'meaning-test-key', fetcher });
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(fetcher.mock.calls.map(call => new URL(call[0]).searchParams.get('q'))).toEqual(['panicked person', 'panicked person', 'panicked facial expression', 'panicked person body language']);
    expect(imageSearchPlan(word, sense)?.supporting.imageType).toBe('all');
  });
  it('does not borrow a query from another selected sense', () => {
    const word = entries('紧张')[0];
    expect(visualQuery(word.senses[0])).toContain('nervous person');
    expect(visualQuery(word.senses.find(s => s.english === 'in short supply')!)).toBe('in short supply concept');
  });
  it.each('喜悦 沮丧 羞涩 尴尬 孤独 疲倦 潮湿 干燥 明亮 黑暗 粗糙 光滑 发抖 鼓掌 蹲 拥抱 擦 拖'.split(' '))('infers further dictionary entry %s without Mandarin metadata', async text => {
    const word = entries(text).find(w => w.senses.some(s => visualQuery(s)));
    expect(word).toBeDefined();
    const sense = word!.senses.find(s => visualQuery(s))!;
    const fetcher = vi.fn().mockResolvedValue(live(sense.english));
    expect((await getImages(word!.id, sense.id, { pixabayKey: 'meaning-test-key', mode: 'thumbnail', fetcher })).images).toHaveLength(1);
    expect(fetcher.mock.calls.length).toBeGreaterThanOrEqual(2); expect(fetcher.mock.calls.length).toBeLessThanOrEqual(6);
  });
  it.each(['to be panicky', 'to feel panicked', 'to get panic-stricken'])('recognizes the state in %s before filtering the copula', meaning => {
    expect(buildVisualQuery({ englishMeaning: meaning, partOfSpeech: 'verb' })?.query).toBe('panicked person facial expression');
  });
  it.each(['because of', 'classifier for happy people', 'not happy / sad', 'used as an adjective for tall people'])('does not turn nonliteral/grammatical %s into stock photography', meaning => {
    expect(inferVisualIntent(meaning)).toBeNull();
  });
  it.each(['cold (of personality)', 'short (of duration)', 'nervous (physiology)'])('keeps the domain of %s instead of using a literal photo template', meaning => {
    expect(inferVisualIntent(meaning)?.visualType).toBe('conceptual');
    expect(inferVisualIntent(meaning)?.query).not.toMatch(/\bperson\b/);
  });
  it('preserves explicit physical subjects', () => {
    expect(inferVisualIntent('cold (of water)')?.query).toBe('cold water');
    expect(inferVisualIntent('tall (of a building)')?.query).toBe('tall building');
  });
});
