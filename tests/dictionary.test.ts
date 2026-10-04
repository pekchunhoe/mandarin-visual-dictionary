import { describe, expect, it } from 'vitest';
import { DictionaryIndex, normalize, toneMarks } from '../src/lib/dictionary';
import { byId, words } from '../src/data/learning';
import { imageCacheKey, visualQuery } from '../src/lib/visual';
const index = new DictionaryIndex(words);
describe('real CC-CEDICT learning collection', () => {
  it('includes at least 50 genuine dictionary words', () => { expect(words.length).toBeGreaterThanOrEqual(50); expect(words.every(w => w.source === 'CC-CEDICT')).toBe(true); });
  it.each(['苹果', '蘋果', 'ping guo', 'píngguǒ', 'ping2 guo3', 'APPLE', ' epal '])('finds apple using %s', query => { expect(index.search(query)[0].simplified).toBe('苹果'); expect(index.search(query)[0].senses[0].english).toBe('apple'); });
  it('does not mix the fruit with Apple Inc.', () => { expect(byId.get('苹果公司')!.senses[0].english).toBe('Apple Inc.'); expect(visualQuery(byId.get('苹果公司')!.senses[0])).toBeNull(); });
  it.each([['跑','pǎo'],['书','shū'],['鸟','niǎo'],['云','yún'],['冷','lěng']])('selects the learning pronunciation for %s', (id, expected) => expect(byId.get(id)!.pinyin).toBe(expected));
  it('normalizes marked ü and numeric u: consistently', () => { expect(normalize('lǜ')).toBe(normalize('lu:4')); expect(normalize('110')).toBe('110'); });
  it('handles blank and unknown queries', () => { expect(index.search('')).toEqual([]); expect(index.search('qzxqzxqzx')).toEqual([]); });
  it('supports partial input and backspace', () => { expect(index.search('app').some(w => w.id === '苹果')).toBe(true); expect(index.search('ap').some(w => w.id === '苹果')).toBe(true); });
  it('converts numeric pinyin with proper vowel priority', () => { expect(toneMarks('liu2 shui3 xue2 lv4 dou1')).toBe('liú shuǐ xué lǜ dōu'); });
});
describe('meaning-aware images', () => {
  it.each([['苹果','apple fruit'],['银行','bank financial institution'],['猫','domestic cat'],['跑','person running action'],['高兴','happy smiling person'],['冷','person feeling cold'],['医生','doctor medical professional'],['飞机','passenger airplane']])('%s uses a specific visual query', (id, query) => expect(visualQuery(byId.get(id)!.senses[0])).toContain(query));
  it.each(['因为','虽然','已经','但是','可能','如果'])('%s does not force photographs', id => expect(visualQuery(byId.get(id)!.senses[0])).toBeNull());
  it('separates senses and cache keys', () => { const word = byId.get('开')!; expect(word.senses).toHaveLength(2); expect(imageCacheKey(word, word.senses[0])).not.toBe(imageCacheKey(word, word.senses[1])); expect(word.senses[0].visualQuery).not.toBe(word.senses[1].visualQuery); });
});
