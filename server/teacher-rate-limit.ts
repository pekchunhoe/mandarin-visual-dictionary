import type { IncomingMessage } from 'node:http';
import { checkRateLimit } from '@vercel/firewall';
import { TeacherError } from './ai-teacher';
const localBuckets = new Map<string, { until: number; count: number }>();
const LOCAL_REQUESTS_PER_MINUTE = 20;
export async function limitTeacher(req: IncomingMessage) {
  if (process.env.VERCEL === '1') {
    // The named Vercel rule owns the production threshold (20/minute).
    // No custom rateLimitKey: the SDK buckets by Vercel's trusted x-real-ip,
    // rather than a shared constant or the function's proxy socket address.
    // SDK errors fail closed. Never fall back to process-local protection here.
    try {
      const headers = new Headers();
      for (const [name, value] of Object.entries(req.headers)) {
        if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
      }
      const request = new Request(new URL(req.url ?? '/api/teacher', `https://${req.headers.host ?? 'localhost'}`), { method: 'POST', headers });
      const result = await checkRateLimit('kanjian-ai-teacher', { request, timeout: 2000 });
      if (result.error === 'not-found') throw new TeacherError(503, 'unavailable');
      if (result.rateLimited) throw new TeacherError(429, 'rate_limited');
    } catch (error) {
      if (error instanceof TeacherError) throw error;
      throw new TeacherError(503, 'unavailable');
    }
    return;
  }
  if (process.env.NODE_ENV === 'production') throw new TeacherError(503, 'unavailable');
  const now = Date.now(), ip = req.socket.remoteAddress ?? 'local';
  for (const [id, bucket] of localBuckets) if (bucket.until <= now) localBuckets.delete(id);
  if (localBuckets.size >= 1000 && !localBuckets.has(ip)) throw new TeacherError(429, 'rate_limited');
  const bucket = localBuckets.get(ip) ?? { until: now + 60_000, count: 0 };
  localBuckets.set(ip, bucket);
  if (++bucket.count > LOCAL_REQUESTS_PER_MINUTE) throw new TeacherError(429, 'rate_limited');
}
