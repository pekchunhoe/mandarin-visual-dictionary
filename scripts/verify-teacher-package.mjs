import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadEnv } from 'vite';

// Read local secrets in memory for comparisons only. Never print values or dotenv contents.
const environment = loadEnv('production', process.cwd(), ['GEMINI_API_KEY', 'PIXABAY_', 'PEXELS_', 'OPENVERSE_']);
const localKeyConfigured = Boolean(environment.GEMINI_API_KEY?.trim());
assert(readFileSync('.gitignore', 'utf8').split(/\r?\n/).includes('.env.local'), 'Private environment files must be ignored.');
if (existsSync('.git')) {
  execFileSync('git', ['check-ignore', '.env.local'], { stdio: 'pipe' });
  const trackedEnvironmentFiles = execFileSync('git', ['ls-files', '.env*'], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
  assert(trackedEnvironmentFiles.every(path => path === '.env.example'), 'A private environment file is tracked.');
}
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(join(directory, item.name)) : [join(directory, item.name)]);
const sources = [...walk('src'), ...walk('server'), ...walk('api'), ...walk('scripts'), ...walk('tests'), ...walk('dist')].filter(file => !file.startsWith(join('scripts', 'data')) && /\.(?:ts|tsx|js|mjs|json|css|html|md|map)$/.test(file));
const credentials = Object.values(environment).filter(value => value.trim().length >= 8);
for (const file of sources) {
  const source = readFileSync(file, 'utf8');
  assert(!credentials.some(value => source.includes(value) || source.includes(encodeURIComponent(value))), 'A configured credential appears in a source or generated asset.');
}
const browserGraph = JSON.parse(readFileSync('.tmp/browser-bundle-graph.json', 'utf8'));
const initial = browserGraph.filter(item => item.entry);
assert(initial.every(item => !item.modules.some(module => /ai-teacher|AITeacher|teacher-clipboard/.test(module))), 'AI Teacher must not enter the startup bundle.');
assert(browserGraph.every(item => !item.modules?.some(module => /[/\\]server[/\\]|@vercel\/firewall/.test(module))), 'Server code must not enter the browser.');

// Test the actual packaged entrypoint with a dummy key and a fully mocked fetch.
process.env.GEMINI_API_KEY = 'packaged-fixture-key';
process.env.NODE_ENV = 'test'; delete process.env.VERCEL;
const sentences = ['我每天吃苹果。', '妈妈买了一袋苹果。', '树上的苹果成熟了。'].map((chinese, i) => ({ chinese, english: `Apple sentence ${i}.`, malay: `Ayat epal ${i}.` }));
let calls = 0;
globalThis.fetch = async (url, init) => {
  calls++;
  assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent');
  assert.equal(init.headers['x-goog-api-key'], 'packaged-fixture-key');
  const payload = JSON.parse(init.body), context = JSON.parse(payload.contents[0].parts[0].text);
  assert.equal(context.selectedMeaning, 'apple');
  const instructions = payload.systemInstruction.parts[0].text;
  assert(instructions.includes('standard Malaysian Bahasa Melayu (ms-MY), not Indonesian'));
  assert(instructions.includes('intended contextual meaning and effect of the whole expression'));
  assert(instructions.includes('selectedMeaning is authoritative'));
  const result = payload.generationConfig.responseJsonSchema.properties.sentences ? { word: '苹果', sentences } : { word: '苹果', synonyms: [], antonyms: [] };
  return new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(result) }] } }] }));
};
const { default: handler } = await import('../api/teacher.js');
for (const action of ['sentences', 'synonyms-antonyms']) {
  let body; const headers = {};
  const res = { statusCode: 200, setHeader(name, value) { headers[name] = value; }, end(value) { body = JSON.parse(value); } };
  await handler({ method: 'POST', url: '/api/teacher', headers: { host: 'localhost', 'content-type': 'application/json' }, socket: { remoteAddress: 'packaged-teacher' }, body: { word: '苹果', sense: 'sense-0', action } }, res);
  assert.equal(res.statusCode, 200); assert.equal(body.model, 'gemini-3.5-flash-lite'); assert.equal(body.version, 'teacher-v2-linguistic'); assert.equal(headers['Cache-Control'], 'no-store');
  assert(!JSON.stringify(body).includes('packaged-fixture-key'));
}
assert.equal(calls, 2);
console.log(`PASS: local server key ${localKeyConfigured ? 'present' : 'absent (AI remains optional)'}, private env files ignored, credentials absent from source/assets, lazy browser boundary, and both native teacher actions (mocked).`);
