import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
async function files(dir) { return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(entry => entry.isDirectory() ? files(`${dir}/${entry.name}`) : `${dir}/${entry.name}`))).flat(); }
for (const file of await files('src')) {
  if (!/\.(tsx?|js)$/.test(file)) continue;
  const source = await readFile(file, 'utf8');
  assert(!/PIXABAY_API_KEY|PEXELS_API_KEY|from\s+['"][^'"]*server\//.test(source), `Server boundary violated: ${file}`);
}
const example = await readFile('.env.example', 'utf8');
for (const name of ['PIXABAY_API_KEY', 'PEXELS_API_KEY']) {
  assert(new RegExp(`^${name}=\\s*$`, 'm').test(example), `Missing empty environment placeholder: ${name}`);
  for (const file of (await files('dist')).filter(file => /\.(js|html)$/.test(file))) {
    const source = await readFile(file, 'utf8');
    assert(!source.includes(name), `Server environment name leaked into ${file}`);
    if (process.env[name]?.length > 8) assert(!source.includes(process.env[name]), `Server credential leaked into ${file}`);
    assert(!source.includes('https://pixabay.com/api/'), `Upstream API leaked into ${file}`);
  }
}
assert((await readFile('.gitignore', 'utf8')).split(/\r?\n/).includes('.env.local'), 'Local secrets must be ignored');
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const csp = config.headers[0].headers.find(header => header.key === 'Content-Security-Policy').value;
assert(csp.includes('https://pixabay.com') && csp.includes('https://cdn.pixabay.com') && csp.includes("connect-src 'self'"));
assert((await readFile('public/sw.js', 'utf8')).includes("url.pathname.startsWith('/api/')"), 'Service worker must not cache image API responses');
assert(config.functions['api/images.js'].includeFiles === 'public/data/cedict.json', 'Server dictionary must be explicitly packaged');
assert((await readFile('api/images.js', 'utf8')).includes('../server/image-service.mjs'), 'Production API must use its native Node bundle');
console.log('PASS: server/browser boundary, built assets, empty environment placeholders, secret ignore rules, CSP, and API service-worker exclusion.');
