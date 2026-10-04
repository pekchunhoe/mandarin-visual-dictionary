import { readFileSync, readdirSync, statSync } from 'node:fs';
import assert from 'node:assert/strict';
const graph = JSON.parse(readFileSync('.tmp/browser-bundle-graph.json', 'utf8'));
const worker = JSON.parse(readFileSync('.tmp/worker-bundle-graph.json', 'utf8'));
const chunks = new Map(graph.filter(item => !item.asset).map(item => [item.file, item]));
const initial = new Set();
function visit(file) { if (initial.has(file)) return; initial.add(file); for (const child of chunks.get(file)?.imports ?? []) visit(child); }
for (const item of chunks.values()) if (item.entry) visit(item.file);
const forbidden = /(?:visual-inference|dictionary-entry|learning-source|cedict-core|visual-lexicon(?:-source)?\.json(?!\?url)|concept-templates|visual-templates|\/server\/)/;
for (const item of chunks.values()) {
  for (const module of item.modules) assert(!forbidden.test(module), `Heavy/server data entered UI chunk: ${module}`);
  for (const module of item.modules) assert(!/node_modules\/(?:vitest|@playwright|@testing-library|esbuild)\//.test(module), `Development tooling entered UI chunk: ${module}`);
  if (initial.has(item.file)) for (const module of item.modules) assert(!/\/(WordDetail|VisualGallery|PictureQuiz)\.tsx$/.test(module), `Detail feature entered startup: ${module}`);
}
const modules = worker.flatMap(item => item.modules ?? []);
assert(modules.some(module => module.endsWith('/visual-inference-core.ts')));
assert(modules.some(module => module.endsWith('/visual-lexicon.json?url')));
assert(!modules.some(module => module.endsWith('/visual-lexicon.json')), 'Worker must fetch data, not bundle a second JS copy');
assert(!modules.some(module => module.endsWith('/learning-runtime.json')), 'Worker must reuse the UI starter collection');
const assets = readdirSync('dist/assets');
const semantic = assets.filter(file => /^visual-lexicon.*\.json$/.test(file));
assert.equal(semantic.length, 1);
assert.deepEqual(JSON.parse(readFileSync('dist/assets/' + semantic[0], 'utf8')), JSON.parse(readFileSync('src/data/visual-lexicon.json', 'utf8')));
const sw = readFileSync('dist/sw.js', 'utf8');
const precache = JSON.parse(sw.match(/cache\.addAll\((\[[^\]]*\])\)/)[1]);
const immutable = JSON.parse(sw.match(/const IMMUTABLE_ASSETS = new Set\((\[[^\]]*\])\)/)[1]);
assert(immutable.length > 0);
for (const url of immutable) {
  assert(/^\/assets\/.+-[\w-]{8,}\.[\w]+$/.test(url), `Non-hashed immutable asset: ${url}`);
  assert(assets.includes(url.slice('/assets/'.length)), `Unknown immutable asset: ${url}`);
}
for (const file of chunks.keys()) assert(immutable.includes('/' + file), `Lazy module missing immutable matching: ${file}`);
assert(immutable.includes('/assets/' + semantic[0]));
assert(!precache.includes('/assets/' + semantic[0]), 'Fresh home install must not download semantic data');
for (const file of chunks.keys()) assert(precache.includes('/' + file), `Lazy UI unavailable offline: ${file}`);
assert(precache.some(file => /dictionary\.worker.*\.js$/.test(file)));
assert(sw.includes('/assets/' + semantic[0]), 'Worker runtime data missing from upgrade cache allowlist');
assert(statSync('server/image-service.mjs').size < 1_000_000);
console.log('PASS: UI/worker/server boundaries, lazy features, one complete semantic JSON asset, and offline chunk coverage.');
