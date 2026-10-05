import { createHash } from 'node:crypto';

export interface OpenverseCredentials { openverseClientId?: string; openverseClientSecret?: string }
interface TokenState { token?: string; expiresAt: number; retryAt: number; pending?: Promise<string | undefined> }
const tokens = new Map<string, TokenState>();
export function openverseConfiguration(options: OpenverseCredentials) {
  return createHash('sha256').update(JSON.stringify([options.openverseClientId?.trim() ?? '', options.openverseClientSecret?.trim() ?? ''])).digest('hex');
}
function stateFor(options: OpenverseCredentials) {
  const key = openverseConfiguration(options);
  if (!tokens.has(key)) {
    if (tokens.size >= 10) tokens.delete(tokens.keys().next().value!);
    tokens.set(key, { expiresAt: 0, retryAt: 0 });
  }
  return tokens.get(key)!;
}
export async function openverseToken(options: OpenverseCredentials, fetcher: typeof fetch, deadline: number): Promise<string | undefined> {
  const clientId = options.openverseClientId?.trim(); const clientSecret = options.openverseClientSecret?.trim();
  if (!clientId || !clientSecret || deadline <= Date.now()) return;
  const state = stateFor(options);
  if (state.token && state.expiresAt > Date.now()) return state.token;
  if (state.pending) return state.pending;
  if (state.retryAt > Date.now()) return;
  state.pending = (async () => {
    try {
      const response = await fetcher('https://api.openverse.org/v1/auth_tokens/token/', {
        method: 'POST', redirect: 'error', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
        signal: AbortSignal.timeout(Math.max(1, Math.min(1000, deadline - Date.now())))
      });
      if (!response.ok) throw new Error('Authentication unavailable');
      const body = await response.json();
      if (typeof body?.access_token !== 'string' || !/^[\x21-\x7e]+$/.test(body.access_token) ||
          typeof body.expires_in !== 'number' || !Number.isFinite(body.expires_in) || body.expires_in <= 0 ||
          typeof body.token_type !== 'string' || body.token_type.toLowerCase() !== 'bearer') throw new Error('Invalid token response');
      state.token = body.access_token;
      // Refresh slightly early, including for unusually short-lived tokens.
      state.expiresAt = Date.now() + body.expires_in * 1000 - Math.min(30_000, body.expires_in * 100);
      state.retryAt = 0;
      return state.token;
    } catch {
      state.token = undefined; state.expiresAt = 0; state.retryAt = Date.now() + 60_000;
      return undefined; // Anonymous search remains available; never log upstream errors.
    }
  })();
  try { return await state.pending; } finally { state.pending = undefined; }
}
export function rejectOpenverseToken(options: OpenverseCredentials) {
  const state = stateFor(options);
  state.token = undefined; state.expiresAt = 0; state.retryAt = Date.now() + 60_000;
}
export function clearOpenverseTokens() { tokens.clear(); }
