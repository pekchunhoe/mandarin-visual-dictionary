import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolveImageWord } from './dictionary';
import { generateTeacher, TeacherError } from './ai-teacher';
import { limitTeacher } from './teacher-rate-limit';
import type { TeacherAction } from '../src/lib/ai-teacher-schema';

async function readBody(req: IncomingMessage & { body?: unknown }) {
  if (Number(req.headers['content-length']) > 2048) throw new TeacherError(413, 'invalid_request');
  if (req.body !== undefined) {
    if (Buffer.byteLength(JSON.stringify(req.body)) > 2048) throw new TeacherError(413, 'invalid_request');
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  return new Promise<unknown>((resolve, reject) => {
    const chunks: Buffer[] = []; let size = 0;
    const cleanup = () => { clearTimeout(timeout); req.off('data', data); req.off('end', end); req.off('error', fail); req.off('aborted', aborted); };
    const fail = (error: unknown) => { cleanup(); req.pause(); reject(error); };
    const aborted = () => fail(new TeacherError(400, 'invalid_request'));
    const data = (chunk: Buffer) => { size += chunk.length; if (size > 2048) fail(new TeacherError(413, 'invalid_request')); else chunks.push(chunk); };
    const end = () => { cleanup(); try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(new TeacherError(400, 'invalid_request')); } };
    const timeout = setTimeout(() => fail(new TeacherError(408, 'invalid_request')), 5000);
    req.on('data', data); req.once('end', end); req.once('error', fail); req.once('aborted', aborted);
  });
}
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const send = (status: number, data: unknown) => { res.statusCode = status; res.end(JSON.stringify(data)); };
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(405, { error: 'Method not allowed', code: 'invalid_request' }); }
  try {
    if (!req.headers['content-type']?.match(/^application\/json(?:\s*;|$)/i) || new URL(req.url ?? '/', 'http://localhost').search) throw new TeacherError(400, 'invalid_request');
    const origin = req.headers.origin;
    if (req.headers['sec-fetch-site'] === 'cross-site' || (origin && new URL(origin).host !== req.headers.host)) throw new TeacherError(403, 'invalid_request');
    const body = await readBody(req) as Record<string, unknown>;
    if (!body || Array.isArray(body) || typeof body !== 'object' || Object.keys(body).sort().join('|') !== 'action|sense|word' || typeof body.word !== 'string' || !body.word || body.word.length > 300 || /[\u0000-\u001f\u007f]/.test(body.word) || typeof body.sense !== 'string' || !/^sense-\d{1,4}$/.test(body.sense) || !['sentences', 'synonyms-antonyms'].includes(String(body.action))) throw new TeacherError(400, 'invalid_request');
    await limitTeacher(req);
    const word = resolveImageWord(body.word, body.sense), sense = word?.senses.find(item => item.id === body.sense);
    if (!word || !sense) throw new TeacherError(400, 'invalid_request');
    return send(200, await generateTeacher(word, sense, body.action as TeacherAction));
  } catch (error) {
    const safe = error instanceof TeacherError ? error : new TeacherError(400, 'invalid_request');
    if (safe.status === 429) res.setHeader('Retry-After', '60');
    return send(safe.status, { code: safe.code, error: safe.status === 400 || safe.status === 413 || safe.status === 403 ? 'Choose a known dictionary word, meaning and AI action.' : 'AI Teacher is temporarily unavailable. Please try again later.' });
  }
}
