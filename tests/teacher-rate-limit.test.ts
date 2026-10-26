// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
import type { IncomingMessage } from 'node:http';
vi.mock('@vercel/firewall', () => ({ checkRateLimit: vi.fn() }));
import { checkRateLimit } from '@vercel/firewall';
import { limitTeacher } from '../server/teacher-rate-limit';
const req = { url: '/api/teacher', method: 'POST', headers: { host: 'example.vercel.app', 'x-real-ip': '192.0.2.1' }, socket: { remoteAddress: 'local-test' } } as unknown as IncomingMessage;
afterEach(() => { vi.unstubAllEnvs(); });
it('requires shared Vercel counters and passes the request with a bounded timeout', async () => {
  vi.stubEnv('VERCEL', '1'); vi.mocked(checkRateLimit).mockResolvedValue({ rateLimited: false });
  await expect(limitTeacher(req)).resolves.toBeUndefined();
  const [id, options] = vi.mocked(checkRateLimit).mock.calls.at(-1)!;
  expect(id).toBe('kanjian-ai-teacher'); expect(options?.timeout).toBe(2000); expect(options?.request?.headers.get('x-real-ip')).toBe('192.0.2.1');
  expect(options).not.toHaveProperty('rateLimitKey');
});
it.each([{ rateLimited: true }, { rateLimited: true, error: 'blocked' as const }])('honors distributed rate limit rejections %#', async value => {
  vi.stubEnv('VERCEL', '1'); vi.mocked(checkRateLimit).mockResolvedValue(value);
  await expect(limitTeacher(req)).rejects.toHaveProperty('status', 429);
});
it('fails closed when the Vercel rule is missing or the shared check fails', async () => {
  vi.stubEnv('VERCEL', '1'); vi.mocked(checkRateLimit).mockResolvedValue({ rateLimited: false, error: 'not-found' });
  await expect(limitTeacher(req)).rejects.toHaveProperty('status', 503);
  vi.mocked(checkRateLimit).mockRejectedValue(new Error('fixture-sensitive-message'));
  await expect(limitTeacher(req)).rejects.toHaveProperty('status', 503);
});
it('does not use a local-only limiter for an unsupported production deployment', async () => {
  vi.stubEnv('VERCEL', ''); vi.stubEnv('NODE_ENV', 'production');
  await expect(limitTeacher(req)).rejects.toHaveProperty('status', 503);
});
