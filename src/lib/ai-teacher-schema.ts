export const TEACHER_MODEL = 'gemini-3.5-flash-lite';
export const TEACHER_VERSION = 'teacher-v2-linguistic';
export const TEACHER_TTL = 6 * 60 * 60 * 1000;
export type TeacherAction = 'sentences' | 'synonyms-antonyms';
export interface TrilingualText { chinese: string; english: string; malay: string }
export interface SentenceResult { word: string; sentences: TrilingualText[] }
export interface RelationResult { word: string; synonyms: TrilingualText[]; antonyms: TrilingualText[] }
export type TeacherResult = SentenceResult | RelationResult;
export interface TeacherResponse { action: TeacherAction; model: typeof TEACHER_MODEL; version: string; expiresAt: number; result: TeacherResult }

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid AI content');
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, expected: string[]) {
  if (Object.keys(value).sort().join('|') !== expected.sort().join('|')) throw new Error('Invalid AI content');
}
function text(value: unknown, limit: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > limit || /[\u0000-\u001f\u007f<>]/u.test(value)) throw new Error('Invalid AI content');
  return value.trim();
}
const normalized = (value: string) => value.normalize('NFKC').replace(/[\p{P}\p{Z}\s]/gu, '').toLowerCase();
function list(value: unknown, limit: number, sentence: boolean): TrilingualText[] {
  if (!Array.isArray(value) || value.length > limit || (sentence && value.length !== 3)) throw new Error('Invalid AI content');
  const seen = new Set<string>();
  return value.map(item => {
    const row = object(item); keys(row, ['chinese', 'english', 'malay']);
    const result = { chinese: text(row.chinese, sentence ? 400 : 80), english: text(row.english, 600), malay: text(row.malay, 600) };
    if (!/\p{Script=Han}/u.test(result.chinese) || !/[a-z]/i.test(result.english) || !/[a-z]/i.test(result.malay) || /\p{Script=Han}/u.test(result.english + result.malay)) throw new Error('Invalid AI content');
    const key = normalized(result.chinese);
    if (seen.has(key)) throw new Error('Duplicate AI content');
    seen.add(key); return result;
  });
}
/** Revalidated on the server and browser; no Markdown, HTML or missing translations. */
export function validateTeacherResult(value: unknown, action: TeacherAction, word: string): TeacherResult {
  const data = object(value);
  keys(data, action === 'sentences' ? ['word', 'sentences'] : ['word', 'synonyms', 'antonyms']);
  if (data.word !== word) throw new Error('Wrong AI headword');
  if (action === 'sentences') {
    const sentences = list(data.sentences, 3, true);
    if (sentences.some(row => !row.chinese.includes(word))) throw new Error('Missing AI headword');
    return { word, sentences };
  }
  const synonyms = list(data.synonyms, 30, false), antonyms = list(data.antonyms, 30, false);
  const all = [...synonyms, ...antonyms].map(row => normalized(row.chinese));
  if (new Set(all).size !== all.length || all.includes(normalized(word))) throw new Error('Conflicting AI relations');
  return { word, synonyms, antonyms };
}
