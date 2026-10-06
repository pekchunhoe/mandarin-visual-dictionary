// @vitest-environment node
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { byId } from '../src/data/learning';
import { fromRow } from '../src/lib/dictionary-entry';
import type { RawRow } from '../src/lib/dictionary-entry';
import { visualQuery } from '../src/lib/visual';
import { clearImageCache, getImages } from '../server/images';
import { DictionaryIndex } from '../src/lib/dictionary';
import { inferVisualIntent, normalizeVisualMeaning } from '../src/lib/visual-inference';
import { resolveImageWord } from '../server/dictionary';
beforeEach(clearImageCache);
const rows = JSON.parse(readFileSync('public/data/cedict.json', 'utf8')) as RawRow[];
describe('non-curated dictionary visual coverage', () => {
  it.each(['长颈鹿', '瀑布', '冰箱', '厨师', '鳄鱼'])('%s reaches the image provider without starter metadata', async text => {
    expect(byId.has(text)).toBe(false);
    const word = fromRow(rows.find(row => row[1] === text)!);
    expect(visualQuery(word.senses[0])).toBeTruthy();
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ hits: [{ id: 123, pageURL: 'https://pixabay.com/photos/example-123/', webformatURL: 'https://pixabay.com/get/example_640.jpg', largeImageURL: 'https://pixabay.com/get/example_1280.jpg', imageWidth: 900, imageHeight: 700, tags: word.senses[0].english }] }) });
    const result = await getImages(word.id, word.senses[0].id, { pixabayKey: 'coverage-fixture-key', fetcher });
    expect(fetcher).toHaveBeenCalled();
    expect(result.status).toBe('live'); expect(result.images[0].provider).toBe('pixabay');
    const params = new URL(fetcher.mock.calls[0][0]).searchParams;
    expect(params.get('safesearch')).toBe('true'); expect(params.get('lang')).toBe('en');
  });
  const concrete = '猫 狗 老虎 大象 长颈鹿 鸟 鱼 鸡 鸭 苹果 香蕉 芒果 草莓 葡萄 西瓜 榴莲 汽车 摩托车 飞机 火车 轮船 自行车 医生 护士 警察 厨师 老师 学生 学校 医院 银行 超市 图书馆 机场 公园 桌子 椅子 铅笔 橡皮擦 书包 电脑 手机 电视 冰箱 太阳 月亮 星星 山 河 海 瀑布 森林 跑 走 跳 游泳 吃 喝 写 读 睡觉 唱歌 鳄鱼 企鹅 松鼠 骆驼 菠萝 木瓜 救护车 直升机 牙刷 洗衣机 电风扇 邮局 博物馆 消防员 理发师 沙滩'.split(' ');
  it('retains all 78 distinct supplied concrete regression examples', () => expect(new Set(concrete).size).toBe(78));
  it.each(concrete)('%s has a visual sense that reaches mocked Pixabay', async text => {
    const candidates = byId.has(text) ? [byId.get(text)!] : rows.filter(r => r[1] === text).map(fromRow);
    expect(candidates.length).toBeGreaterThan(0);
    const word = candidates.find(w => w.senses.some(s => visualQuery(s)));
    expect(word, JSON.stringify(candidates.map(w => w.senses.map(s => s.english)))).toBeDefined();
    const sense = word!.senses.find(s => visualQuery(s))!;
    expect(resolveImageWord(word!.id)?.senses.find(s => s.id === sense.id)?.visualQuery).toBe(sense.visualQuery);
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ hits: [{ id: 123, pageURL: 'https://pixabay.com/photos/example-123/', webformatURL: 'https://pixabay.com/get/example_640.jpg', imageWidth: 900, imageHeight: 700, tags: sense.english === 'to go to bed' ? 'sleeping person bed' : sense.english }] }) });
    const result = await getImages(word!.id, sense.id, { pixabayKey: 'coverage-fixture-key', fetcher, mode: 'thumbnail' });
    expect(result.status).toBe('live'); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it.each('长颈鹿 瀑布 冰箱 厨师 鳄鱼 企鹅 松鼠 骆驼 菠萝 木瓜 榴莲 救护车 直升机 牙刷 洗衣机 电风扇 邮局 博物馆 消防员 理发师 沙滩'.split(' '))('%s remains outside curated Mandarin metadata', text => expect(byId.has(text)).toBe(false));
  it.each([['游泳', 'swimming'], ['唱歌', 'singing'], ['跑', 'running'], ['写', 'writing'], ['读', 'reading'], ['吃', 'eating'], ['喝', 'drinking'], ['睡觉', 'sleeping']])('%s infers person %s directly from dictionary definitions', (text, action) => {
    const inferred = rows.filter(row => row[1] === text).flatMap(row => fromRow(row).senses);
    expect(inferred.some(sense => sense.visualQuery?.startsWith('person ' + action))).toBe(true);
  });
  it.each(['因为', '但是', '虽然', '如果', '已经', '所以', '而且', '然后', '然而', '以及'])('%s skips stock images', async text => {
    const word = byId.get(text) ?? fromRow(rows.find(r => r[1] === text)!); const fetcher = vi.fn();
    for (const sense of word.senses) { expect(visualQuery(sense)).toBeNull(); await getImages(word.id, sense.id, { pixabayKey: 'test-key', fetcher }); }
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([['giraffe', 'giraffe animal'], ['waterfall', 'waterfall nature'], ['refrigerator', 'refrigerator appliance'], ['cook', 'chef person cooking'], ['to swim', 'person swimming'], ['to sing a song', 'person singing'], ['to write', 'person writing'], ['to read aloud', 'person reading book'], ['to sleep', 'person sleeping'], ['mango', 'mango fruit food'], ['motorcycle', 'motorcycle vehicle']])('derives %s from English semantics', (meaning, query) => expect(inferVisualIntent(meaning)?.query).toBe(query));
  it('keeps curated overrides and fruit/company meanings separate', () => {
    expect(visualQuery(byId.get('猫')!.senses[0])).toBe('domestic cat animal');
    expect(visualQuery(byId.get('苹果公司')!.senses[0])).toBeNull();
    expect(inferVisualIntent('Apple Inc.')).toBeNull();
  });
  it('removes classifiers and grammar notes without sending slash-separated definitions', () => {
    expect(normalizeVisualMeaning('(coll.) a giraffe / another meaning / CL:只[zhi1]')).toBe('giraffe');
    expect(inferVisualIntent('to run / to move quickly / CL:只[zhi1]')?.query).toBe('person running');
    expect(inferVisualIntent('surname Wang')).toBeNull(); expect(inferVisualIntent('variant of 長頸鹿[chang2 jing3 lu4]')).toBeNull();
  });
  it('resolves identical canonical IDs/senses across simplified, traditional, pinyin and English', () => {
    const giraffe = fromRow(rows.find(r => r[1] === '长颈鹿')!); const index = new DictionaryIndex([giraffe]);
    for (const query of ['长颈鹿', '長頸鹿', 'chang jing lu', 'cháng jǐng lù', 'giraffe']) {
      const result = index.search(query)[0]; const resolved = resolveImageWord(result.id)!;
      expect(resolved.id).toBe(giraffe.id); expect(resolved.senses).toEqual(giraffe.senses);
    }
  });
  it('separates distinct senses and rejects forged IDs', async () => {
    const word = fromRow(rows.find(r => r[1] === '游泳')!);
    expect(word.senses.map(s => s.id)).toEqual(['sense-0', 'sense-1']);
    await expect(getImages(word.id, 'sense-99')).rejects.toMatchObject({ diagnostic: 'sense_not_found' });
    await expect(getImages(word.id + '|forged', 'sense-0')).rejects.toMatchObject({ diagnostic: 'dictionary_word_not_found' });
  });
  it('supports further ordinary dictionary nouns without adding Mandarin metadata', () => {
    for (const text of ['刺猬', '袋鼠', '章鱼', '石榴', '小提琴', '望远镜', '帐篷', '螺丝刀']) {
      expect(byId.has(text)).toBe(false);
      expect(rows.filter(r => r[1] === text).map(fromRow).some(w => w.senses.some(s => visualQuery(s))), text).toBe(true);
    }
  });
  it('does not turn figurative, dangerous or proper-name meanings into generic pictures', () => {
    for (const meaning of ['sexual organ', 'surname Smith', 'Apple Inc.', 'to kill']) expect(inferVisualIntent(meaning), meaning).toBeNull();
  });
  it('uses one simplified all-image fallback after an empty enriched query', async () => {
    const word = fromRow(rows.find(r => r[1] === '冰箱')!);
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ hits: [], results: [] }) });
    const result = await getImages(word.id, 'sense-0', { pixabayKey: 'fixture-key', fetcher });
    expect(fetcher).toHaveBeenCalledTimes(4);
    const primary = new URL(fetcher.mock.calls[0][0]).searchParams; const fallback = new URL(fetcher.mock.calls[1][0]).searchParams;
    expect(primary.get('q')).toBe('refrigerator appliance'); expect(primary.get('image_type')).toBe('photo');
    expect(fallback.get('q')).toBe('refrigerator'); expect(fallback.get('image_type')).toBe('all'); expect(fallback.get('safesearch')).toBe('true'); expect(fallback.get('lang')).toBe('en');
    expect(result.message).toContain('Try another meaning'); expect(result.diagnostics).toContain('pixabay_empty_results');
  });
});
