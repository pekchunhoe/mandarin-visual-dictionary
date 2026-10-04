import { mkdir, mkdtemp, copyFile, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

// Outside the repository: source files and its node_modules cannot rescue a
// missing runtime dependency. Each failure scenario starts a fresh process.
const root = await mkdtemp(join(tmpdir(), 'kanjian-function-'));
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
assert.equal(config.functions['api/images.js'].includeFiles, 'public/data/cedict.json');
assert.equal(pkg.engines.node, '24.x');
for (const folder of ['api', 'server', 'public/data', 'different-cwd']) await mkdir(join(root, folder), { recursive: true });
for (const file of ['api/images.js', 'server/image-service.mjs', 'public/data/cedict.json']) await copyFile(file, join(root, file));
await writeFile(join(root, 'package.json'), JSON.stringify({ type: pkg.type }));
const runner = `
import assert from 'node:assert/strict';
import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import handler from './api/images.js';
const scenario = process.argv[2];
const rows = JSON.parse(readFileSync(new URL('./public/data/cedict.json', import.meta.url), 'utf8'));
const canonical = text => { const row = rows.find(r => r[1] === text); return [row[1], row[0], row[2]].join('|'); };
const secret = 'packaging-fixture-not-a-real-key';
process.env.PIXABAY_API_KEY = secret;
process.env.PEXELS_API_KEY = '';
let calls = 0;
const logs = [];
console.error = (...args) => logs.push(args.join(' '));
globalThis.fetch = async url => {
  calls++;
  if (scenario === 'provider-failure') throw new Error('https://pixabay.com/api/?key=' + secret);
  const query = new URL(url);
  assert.equal(query.origin, 'https://pixabay.com');
  assert.equal(query.searchParams.get('safesearch'), 'true');
  assert.equal(query.searchParams.get('lang'), 'en');
  return { ok: true, json: async () => ({ hits: [{ id: 1, pageURL: 'https://pixabay.com/photos/example-1/', webformatURL: 'https://pixabay.com/get/example_640.jpg', imageWidth: 900, imageHeight: 600, tags: 'example' }] }) };
};
async function request(word, sense = 'sense-0') {
  let body; const headers = {};
  const response = { statusCode: 200, setHeader(k, v) { headers[k] = v; }, end(value) { body = JSON.parse(value); } };
  await handler({ method: 'GET', url: '/api/images?' + new URLSearchParams({ word, sense, mode: 'thumbnail' }), headers: {}, socket: { remoteAddress: 'packaging-check' } }, response);
  assert.equal(headers['Content-Type'], 'application/json; charset=utf-8');
  assert.equal(headers['Cache-Control'], 'no-store');
  assert(!JSON.stringify(body).includes(secret));
  assert(!JSON.stringify(body).includes('stack'));
  return { status: response.statusCode, body };
}
if (scenario === 'missing-service' || scenario === 'broken-service') {
  const path = new URL('./server/image-service.mjs', import.meta.url);
  if (scenario === 'missing-service') renameSync(path, new URL('./server/saved-service.mjs', import.meta.url));
  else writeFileSync(path, 'throw new Error(' + JSON.stringify(secret) + ');');
  const result = await request('苹果');
  assert.equal(result.status, 500);
  assert.equal(result.body.diagnostic, 'image_service_initialization_failed');
  assert.deepEqual(logs, ['[images] image_service_initialization_failed']);
  assert.equal(calls, 0);
} else if (scenario === 'missing-dictionary') {
  renameSync(new URL('./public/data/cedict.json', import.meta.url), new URL('./public/data/saved-cedict.json', import.meta.url));
  assert.equal((await request('苹果')).body.status, 'live');
  const result = await request(canonical('长颈鹿'));
  assert.equal(result.status, 500);
  assert.equal(result.body.diagnostic, 'image_resolution_failed');
  assert.deepEqual(logs, ['[images] image_resolution_failed']);
  assert.equal((await request('invalid-word')).status, 400);
} else if (scenario === 'missing-key' || scenario === 'provider-failure') {
  if (scenario === 'missing-key') delete process.env.PIXABAY_API_KEY;
  const curated = await request('苹果'); const generic = await request(canonical('长颈鹿'));
  assert.equal(curated.status, 200); assert.equal(curated.body.status, 'curated');
  assert.equal(curated.body.images.length, 1);
  assert.equal(generic.status, 200); assert.equal(generic.body.status, 'unavailable');
  assert.equal(generic.body.images.length, 0);
  assert(curated.body.diagnostics.includes(scenario === 'missing-key' ? 'pixabay_not_configured' : 'pixabay_upstream_failure'));
  assert(calls === (scenario === 'missing-key' ? 0 : 2));
} else {
  // Intentionally not the function root: file reads must be module-relative.
  process.chdir(fileURLToPath(new URL('./different-cwd', import.meta.url)));
  const visualWords = ['苹果', ...['长颈鹿', '冰箱', '厨师', '瀑布', '鳄鱼', '游泳', '恐慌', '惊讶', '生气', '害怕', '困惑', '饿', '渴', '慢', '哭', '跳舞', '政治', '经济', '金融', '数学', '科学'].map(canonical)];
  for (const word of visualWords) {
    const result = await request(word);
    assert.equal(result.status, 200); assert.equal(result.body.status, 'live');
    assert.equal(result.body.images[0].provider, 'pixabay');
  }
  assert.equal(calls, visualWords.length);
  const abstract = await request('因为');
  assert.equal(abstract.status, 200); assert.equal(abstract.body.status, 'unavailable');
  assert.deepEqual(abstract.body.images, []);
  assert.equal((await request('invalid-word')).status, 400);
  assert.equal((await request(canonical('长颈鹿'), 'sense-999')).status, 400);
  assert.equal((await request('')).status, 400);
  assert.equal(calls, visualWords.length);
}
assert(!logs.join(' ').includes(secret));
console.log('PASS: isolated deployment artifact — ' + scenario);
`;
await writeFile(join(root, 'verify.mjs'), runner);
for (const scenario of ['normal', 'missing-key', 'provider-failure', 'missing-dictionary', 'missing-service', 'broken-service']) {
  // Restore the two assets that the deliberate failure scenarios can alter.
  for (const file of ['server/image-service.mjs', 'public/data/cedict.json']) await copyFile(file, join(root, file));
  const result = spawnSync(process.execPath, [join(root, 'verify.mjs'), scenario], { cwd: root, encoding: 'utf8', timeout: 30000 });
  process.stdout.write(result.stdout ?? ''); process.stderr.write(result.stderr ?? '');
  assert.equal(result.status, 0, 'Production function packaging check failed: ' + scenario);
}
