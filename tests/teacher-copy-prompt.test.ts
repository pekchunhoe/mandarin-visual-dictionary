// @vitest-environment node
import { readFileSync } from 'node:fs';
import { expect, it, vi } from 'vitest';
import { buildTeacherCopyPrompt } from '../src/lib/teacher-copy-prompt';
import { resolveImageWord } from '../server/dictionary';
import { byId } from '../src/data/learning';
import type { TeacherAction } from '../src/lib/ai-teacher-schema';

const cases: [string, TeacherAction][] = [
  ['美丽|美麗|mei3 li4', 'sentences'], ['美丽|美麗|mei3 li4', 'synonyms-antonyms'],
  ['苹果', 'synonyms-antonyms'], ['画蛇添足|畫蛇添足|hua4 she2 tian1 zu2', 'sentences'],
];
it.each(cases)('builds a complete portable prompt for %s / %s', (id, action) => {
  const word = resolveImageWord(id, 'sense-0')!, sense = word.senses[0];
  const prompt = buildTeacherCopyPrompt(word, sense, action);
  expect(prompt).toContain(`Chinese word: ${word.simplified}`);
  expect(prompt).toContain(`Pinyin: ${word.pinyin}`);
  expect(prompt).toContain(`Selected meaning (English): ${sense.english}`);
  expect(prompt).toContain('standard Malaysian Bahasa Melayu'); expect(prompt).toContain('not Indonesian');
  expect(prompt).toContain('all three languages'); expect(prompt).toContain('Do not return JSON');
  expect(prompt).not.toMatch(/responseMimeType|responseJsonSchema|generationConfig|systemInstruction|GEMINI_API_KEY|teacher-v2-linguistic|\/api\/teacher|sense-\d/);
  if (action === 'sentences') {
    expect(prompt).toContain('exactly THREE'); expect(prompt).toContain('Sentence 1, Sentence 2 and Sentence 3');
    expect(prompt).toContain('中文：, English:, and Bahasa Melayu:');
  } else {
    expect(prompt).toContain('up to 30 per category'); expect(prompt).toContain('近义词 — Synonyms');
    expect(prompt).toContain('反义词 — Antonyms'); expect(prompt).toContain('broader categories, narrower categories, varieties/cultivars');
    expect(prompt).toContain('historical or literary'); expect(prompt).toContain('context-dependent');
    expect(prompt).toContain('never invent opposites');
  }
});
it('marks known idioms and requests the contextual meaning of the whole expression', () => {
  const word = resolveImageWord('画蛇添足|畫蛇添足|hua4 she2 tian1 zu2', 'sense-0')!;
  const prompt = buildTeacherCopyPrompt(word, word.senses[0], 'sentences');
  expect(prompt).toContain('Idiom:'); expect(prompt).toContain('ruin the effect by adding sth superfluous');
  expect(prompt).toContain('complete expression rather than interpreting individual characters');
  expect(prompt).toContain('Apply this rule even if no idiom label is supplied');
});
it('uses the exact selected meaning rather than the first sense of a polysemous word', () => {
  const word = byId.get('开')!, sense = word.senses.find(item => /\bto turn on\b/.test(item.english))!;
  for (const action of ['sentences', 'synonyms-antonyms'] as const) {
    const prompt = buildTeacherCopyPrompt(word, sense, action);
    expect(prompt).toContain(`Selected meaning (English): ${sense.english}`);
    expect(prompt).not.toContain(`Selected meaning (English): ${word.senses[0].english}\n`);
  }
});
it('uses available displayed Malay/part-of-speech context and omits private provenance/configuration', () => {
  const original = byId.get('苹果')!;
  const word = { ...original, dictionaryId: 'PRIVATE_INTERNAL_ROW', privateConfiguration: 'PRIVATE_CONFIGURATION_FIXTURE' };
  const sense = { ...word.senses[0], partOfSpeech: 'noun', malay: 'epal', chineseExplanation: '一种水果。', translationSource: 'PRIVATE_PROVENANCE_FIXTURE' };
  const prompt = buildTeacherCopyPrompt(word, sense, 'sentences');
  expect(prompt).toContain('Existing Malaysian Malay meaning (reference): epal'); expect(prompt).toContain('Part of speech: noun');
  expect(prompt).toContain('Sense clarification (中文): 一种水果。'); expect(prompt).not.toMatch(/PRIVATE_|dictionaryId|translationSource/);
});
it('omits unavailable metadata without inventing values', () => {
  const original = byId.get('苹果')!, word = { ...original, pinyin: '' };
  const sense = { ...word.senses[0], malay: undefined, malayLexical: undefined, malayDefinition: undefined, partOfSpeech: undefined, chineseExplanation: undefined };
  const prompt = buildTeacherCopyPrompt(word, sense, 'sentences');
  expect(prompt).toContain('Selected meaning (English): apple');
  expect(prompt).not.toMatch(/^Pinyin:|^Part of speech:|^Existing Malaysian Malay meaning|^Idiom:|^Sense clarification/m);
  expect(prompt).not.toMatch(/undefined|null/);
});
it('constructs both prompts entirely locally with no API or network dependency', () => {
  const fetcher = vi.spyOn(globalThis, 'fetch'), word = byId.get('苹果')!;
  buildTeacherCopyPrompt(word, word.senses[0], 'sentences'); buildTeacherCopyPrompt(word, word.senses[0], 'synonyms-antonyms');
  expect(fetcher).not.toHaveBeenCalled();
  const source = readFileSync('src/lib/teacher-copy-prompt.ts', 'utf8');
  expect(source).not.toMatch(/美丽|苹果|画蛇添足|fetch\(|process\.env|import\.meta\.env|from.*server/);
});
it('refuses incomplete dictionary context instead of copying a partial prompt', () => {
  const word = byId.get('苹果')!;
  expect(() => buildTeacherCopyPrompt({ ...word, simplified: '' }, word.senses[0], 'sentences')).toThrow('Choose');
  expect(() => buildTeacherCopyPrompt(word, { ...word.senses[0], english: '' }, 'synonyms-antonyms')).toThrow('Choose');
});
