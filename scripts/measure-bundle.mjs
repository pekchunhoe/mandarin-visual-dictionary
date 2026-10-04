import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync, brotliCompressSync } from 'node:zlib';
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
const files = walk('dist').map(file => {
  const data = readFileSync(file);
  return { file: file.replaceAll('\\', '/'), bytes: data.length, ...(/\.(js|css|json)$/.test(file) ? { gzip: gzipSync(data).length, brotli: brotliCompressSync(data).length } : {}) };
});
const graph = JSON.parse(readFileSync('.tmp/browser-bundle-graph.json', 'utf8'));
const chunks = new Map(graph.filter(item => !item.asset).map(item => [item.file, item]));
const initialFiles = new Set();
function visit(file) { if (initialFiles.has(file)) return; initialFiles.add(file); for (const child of chunks.get(file)?.imports ?? []) visit(child); }
for (const chunk of chunks.values()) if (chunk.entry) visit(chunk.file);
const initial = files.filter(file => initialFiles.has(file.file.slice(5)));
const server = readFileSync('server/image-service.mjs');
const report = { files, initial, initialBytes: initial.reduce((sum, file) => sum + file.bytes, 0), initialGzip: initial.reduce((sum, file) => sum + file.gzip, 0), totalJS: files.filter(file => file.file.endsWith('.js')).reduce((sum, file) => sum + file.bytes, 0), totalDist: files.reduce((sum, file) => sum + file.bytes, 0), serverBytes: server.length, serverGzip: gzipSync(server).length };
writeFileSync('.tmp/bundle-after.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, files: files.filter(file => /\.(js|css|json)$/.test(file.file)) }, null, 2));
