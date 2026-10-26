import { createHash } from 'node:crypto';
import type { Word, Sense } from '../src/types';
import { primaryMalay } from '../src/lib/malay-content';
import { TEACHER_MODEL, TEACHER_VERSION, TEACHER_TTL, validateTeacherResult } from '../src/lib/ai-teacher-schema';
import type { TeacherAction, TeacherResponse } from '../src/lib/ai-teacher-schema';
import { teacherInstructions } from './teacher-instructions';

export class TeacherError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}
const cache = new Map<string, TeacherResponse>();
const pending = new Map<string, Promise<TeacherResponse>>();
let cooldown = 0;
export function clearTeacherCache() { cache.clear(); pending.clear(); cooldown = 0; }
function responseSchema(action: TeacherAction) {
  const item = { type: 'object', properties: { chinese: { type: 'string' }, english: { type: 'string' }, malay: { type: 'string' } }, required: ['chinese', 'english', 'malay'], additionalProperties: false };
  const list = { type: 'array', items: item, maxItems: 30 };
  const properties = action === 'sentences' ? { word: { type: 'string' }, sentences: { ...list, minItems: 3, maxItems: 3 } } : { word: { type: 'string' }, synonyms: list, antonyms: list };
  return { type: 'object', properties, required: action === 'sentences' ? ['word', 'sentences'] : ['word', 'synonyms', 'antonyms'], additionalProperties: false };
}

async function boundedJson(response: Response): Promise<unknown> {
  if (Number(response.headers.get('content-length')) > 96_000 || !response.body) throw new TeacherError(502, 'invalid_output');
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > 96_000) { await reader.cancel(); throw new TeacherError(502, 'invalid_output'); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } finally { reader.releaseLock(); }
}

export async function generateTeacher(word: Word, sense: Sense, action: TeacherAction): Promise<TeacherResponse> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new TeacherError(503, 'not_configured');
  const context = { headword: word.simplified, traditional: word.traditional, selectedMeaning: sense.english, malay: primaryMalay(sense) || undefined, partOfSpeech: sense.partOfSpeech, idiom: /\bidiom\b/i.test(sense.english) || undefined };
  const key = createHash('sha256').update(JSON.stringify([TEACHER_MODEL, TEACHER_VERSION, word.id, sense.id, context, action, apiKey])).digest('hex');
  const hit = cache.get(key); if (hit && hit.expiresAt > Date.now()) return hit;
  cache.delete(key);
  const existing = pending.get(key); if (existing) return existing;
  if (cooldown > Date.now()) throw new TeacherError(429, 'quota_exceeded');
  if (pending.size >= 8) throw new TeacherError(503, 'busy');
  const request = (async () => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TEACHER_MODEL}:generateContent`, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(22_000),
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: teacherInstructions[action] }] }, contents: [{ role: 'user', parts: [{ text: JSON.stringify(context) }] }], generationConfig: { responseMimeType: 'application/json', responseJsonSchema: responseSchema(action), maxOutputTokens: action === 'sentences' ? 2200 : 6000, temperature: 0.5 } }),
      });
      if (!response.ok) {
        await response.body?.cancel();
        if (response.status === 429) { cooldown = Date.now() + 60_000; throw new TeacherError(429, 'quota_exceeded'); }
        throw new TeacherError(503, 'unavailable');
      }
      const data = await boundedJson(response) as { candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
      const candidate = data.candidates?.[0];
      if (data.candidates?.length !== 1 || candidate?.finishReason !== 'STOP') throw new TeacherError(502, 'invalid_output');
      const raw = candidate.content?.parts?.filter(part => !part.thought).map(part => part.text ?? '').join('') ?? '';
      if (raw.includes(apiKey) || raw.includes(encodeURIComponent(apiKey))) throw new TeacherError(502, 'invalid_output');
      const result = validateTeacherResult(JSON.parse(raw), action, word.simplified);
      const value: TeacherResponse = { action, model: TEACHER_MODEL, version: TEACHER_VERSION, expiresAt: Date.now() + TEACHER_TTL, result };
      for (const [id, cached] of cache) if (cached.expiresAt <= Date.now()) cache.delete(id);
      if (cache.size >= 200) cache.delete(cache.keys().next().value!);
      cache.set(key, value); return value;
    } catch (error) {
      if (error instanceof TeacherError) throw error;
      if (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)) throw new TeacherError(504, 'timeout');
      // Never log or return raw provider errors, bodies, headers, prompts or secrets.
      throw new TeacherError(502, 'invalid_output');
    }
  })();
  pending.set(key, request);
  try { return await request; } finally { pending.delete(key); }
}
