import type { SentenceResult, RelationResult, TeacherAction, TeacherResult, TeacherResponse } from '../src/lib/ai-teacher-schema';
import { TEACHER_MODEL, TEACHER_VERSION, TEACHER_TTL } from '../src/lib/ai-teacher-schema';
export const sentences: SentenceResult = { word: '苹果', sentences: [
  { chinese: '我每天吃一个苹果。', english: 'I eat an apple every day.', malay: 'Saya makan sebiji epal setiap hari.' },
  { chinese: '妈妈买了一袋苹果。', english: 'Mum bought a bag of apples.', malay: 'Ibu membeli sebeg epal.' },
  { chinese: '树上的苹果已经成熟了。', english: 'The apples on the tree are ripe.', malay: 'Buah epal di pokok itu sudah masak.' },
] };
export const relations: RelationResult = { word: '苹果', synonyms: [], antonyms: [] };
export const teacherResponse = (action: TeacherAction, result: TeacherResult): TeacherResponse => ({ action, result, model: TEACHER_MODEL, version: TEACHER_VERSION, expiresAt: Date.now() + TEACHER_TTL });
export const geminiResponse = (value: unknown) => new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(value) }] } }] }));
