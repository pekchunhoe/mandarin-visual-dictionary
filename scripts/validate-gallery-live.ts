import { writeFileSync } from 'node:fs';
import { openverseRequest, normalizeOpenverse } from '../server/providers';
const search = { wordId: 'sample', senseId: 'sample', query: 'person running', imageType: 'all' as const };
const results: unknown[] = [];
for (const provider of ['openverse', 'pixabay']) {
 const url = provider === 'openverse' ? openverseRequest(search, '').url : 'https://pixabay.com/api/?q=person+running&safesearch=true&per_page=20';
 try {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: 'error' });
  if (provider === 'openverse' && response.ok) {
   const body = await response.json() as { results: unknown[] }; const images = normalizeOpenverse(body.results, search.query);
   results.push({ provider, status: response.status, pageSize: 20, raw: body.results.length, normalized: images.length,
    withTitle: images.filter(p => p.title).length, withDescription: images.filter(p => p.description).length, withAlt: images.filter(p => p.semanticAlt).length,
    withCreator: images.filter(p => p.photographer).length, withSource: images.filter(p => p.sourceUrl).length, withLicense: images.filter(p => p.license && p.licenseUrl).length });
  } else results.push({ provider, status: response.status, note: provider === 'pixabay' ? 'No key configured; reachability only, search not authenticated' : 'Live search unavailable' });
 } catch { results.push({ provider, status: 'network_or_timeout' }); }
}
const report = { anonymousOnly: true, authenticatedOpenverse: 'credentials unavailable', authenticatedPixabay: 'credentials unavailable', results };
writeFileSync('.tmp/gallery-live-validation.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify(report));
