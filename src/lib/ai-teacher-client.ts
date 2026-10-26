import { TEACHER_MODEL, TEACHER_VERSION, TEACHER_TTL, validateTeacherResult } from './ai-teacher-schema';
import type { TeacherAction, TeacherResponse } from './ai-teacher-schema';

const cache = new Map<string, TeacherResponse>();
const pending = new Map<string, Promise<TeacherResponse>>();
export class TeacherClientError extends Error {
  constructor(public code: string) { super(code); }
}
export function clearTeacherClientCache() { cache.clear(); pending.clear(); }
/** Imported only after a feature click. No prefetching, background retries or persistent browser storage. */
export async function requestTeacher(word: string, sense: string, action: TeacherAction, headword: string, meaning: string): Promise<TeacherResponse> {
  const key = JSON.stringify([TEACHER_MODEL, TEACHER_VERSION, word, sense, meaning, action]);
  const hit = cache.get(key); if (hit && hit.expiresAt > Date.now()) return hit;
  cache.delete(key);
  const existing = pending.get(key); if (existing) return existing;
  const task = (async () => {
    try {
      if (navigator.onLine === false) throw new TeacherClientError('offline');
      const response = await fetch('/api/teacher', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word, sense, action }), signal: AbortSignal.timeout(29_000) });
      const data = await response.json();
      if (!response.ok) throw new TeacherClientError(response.status === 429 ? 'rate_limited' : data.code === 'not_configured' ? 'not_configured' : 'unavailable');
      if (data.model !== TEACHER_MODEL || data.version !== TEACHER_VERSION || data.action !== action || !Number.isFinite(data.expiresAt) || data.expiresAt <= Date.now() || data.expiresAt > Date.now() + TEACHER_TTL + 60_000) throw new TeacherClientError('unavailable');
      const value: TeacherResponse = { ...data, result: validateTeacherResult(data.result, action, headword) };
      for (const [id, item] of cache) if (item.expiresAt <= Date.now()) cache.delete(id);
      if (cache.size >= 50) cache.delete(cache.keys().next().value!);
      cache.set(key, value); return value;
    } catch (error) {
      if (error instanceof TeacherClientError) throw error;
      throw new TeacherClientError('unavailable');
    }
  })();
  pending.set(key, task);
  try { return await task; } finally { pending.delete(key); }
}
