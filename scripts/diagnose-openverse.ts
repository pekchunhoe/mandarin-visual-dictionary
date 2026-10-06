import { writeFileSync } from 'node:fs';
import { openverseToken } from '../server/openverse-auth';
import { openverseRequest, normalizeOpenverse } from '../server/providers';

// Deliberately bounded live diagnostic. Never print credentials, tokens, headers,
// upstream error bodies, or raw result metadata.
const anonymous = [];
for (const size of [undefined, 20, 21, 32]) {
  const url = new URL('https://api.openverse.org/v1/images/');
  url.searchParams.set('q', 'apple');
  if (size) url.searchParams.set('page_size', String(size));
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const body = await response.json();
    const normalized = response.ok ? normalizeOpenverse(body.results ?? [], 'apple') : [];
    anonymous.push({ pageSize: size ?? 'default', status: response.status, returned: body.results?.length ?? 0, normalized: normalized.length });
  } catch { anonymous.push({ pageSize: size ?? 'default', status: 'NETWORK_UNAVAILABLE' }); }
}
const options = { openverseClientId: process.env.OPENVERSE_CLIENT_ID, openverseClientSecret: process.env.OPENVERSE_CLIENT_SECRET };
let authenticated: Record<string, unknown> = { status: 'NOT POSSIBLE', reason: 'Credentials not configured in process environment' };
if (options.openverseClientId && options.openverseClientSecret) {
  const token = await openverseToken(options, fetch, Date.now() + 15000);
  authenticated = { tokenAcquisition: token ? 'PASS' : 'FAIL', status: 'NOT POSSIBLE' };
  if (token) {
    const request = openverseRequest({ wordId: 'apple', senseId: 'sense-0', query: 'apple', imageType: 'all' }, token);
    try {
      const response = await fetch(request.url, { headers: request.headers, signal: AbortSignal.timeout(15000) });
      const body = await response.json();
      authenticated = { tokenAcquisition: 'PASS', status: response.status, requestedPageSize: new URL(request.url).searchParams.get('page_size'), returned: body.results?.length ?? 0, normalized: response.ok ? normalizeOpenverse(body.results ?? [], 'apple').length : 0 };
    } catch { authenticated.status = 'NETWORK_UNAVAILABLE'; }
  }
}
const result = { anonymous, authenticated };
writeFileSync('.tmp/openverse-diagnosis.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
