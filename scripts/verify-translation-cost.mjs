import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const dependencies = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
assert(!dependencies.some(name => /google-cloud.*translate|google-translate|googletrans|deepl|@huggingface\/inference|client-translate|azure.*translation/i.test(name)), 'Translation API/scraper dependency is prohibited.');
assert.deepEqual(readdirSync('api').filter(name => !name.startsWith('.')).sort(), ['images.js', 'teacher.js'], 'Only the image API and explicitly requested AI Teacher are allowed. Dictionary translation stays offline.');
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
const files = walk('dist');
assert(!files.some(file => /\.(?:onnx|gguf|safetensors|bin)$/i.test(file)), 'Unvalidated model weights may not enter this release.');
for (const file of files.filter(file => /\.(?:js|html)$/.test(file))) {
  assert(!/translation\.googleapis\.com|translate\.googleapis\.com|translate-pa\.googleapis\.com|clients5\.google\.com\/translate|translate\.google\.com\/translate_a\//i.test(readFileSync(file, 'utf8')), `Translation API/scraper endpoint in ${file}`);
}
const helper = readFileSync('src/lib/google-translate.ts', 'utf8');
assert(helper.includes('https://translate.google.com/'));
assert(!/fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage/.test(helper), 'The external link must not request or persist a translation.');
const csp = JSON.parse(readFileSync('vercel.json', 'utf8')).headers[0].headers.find(h => h.key === 'Content-Security-Policy').value;
assert(csp.split(';').map(s => s.trim()).includes("connect-src 'self'"), 'Preserve same-origin application connections.');
console.log('PASS: dictionary translation remains offline; only the separately requested, click-initiated AI Teacher endpoint is allowed.');
