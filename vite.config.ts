import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import images from './server/image-handler';
import { VISUAL_SCHEMA } from './src/lib/visual-schema';
import { bundleAudit } from './scripts/bundle-audit';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ['PIXABAY_', 'PEXELS_']));
  return { worker: { format: 'es', plugins: () => [bundleAudit('worker')] }, plugins: [react(), bundleAudit('browser'), { name: 'local-image-api', configureServer(server) { server.middlewares.use('/api/images', (req, res) => { void images(req, res); }); } }, { name: 'offline-shell', writeBundle(_, bundle) {
    const runtime = ['/data/cedict.json', ...Object.keys(bundle).filter(file => /visual-lexicon.*\.json$/.test(file)).map(file => `/${file}`)];
    const assets = ['/', '/favicon.svg', '/manifest.webmanifest', ...Object.keys(bundle).filter(file => !runtime.includes(`/${file}`)).map(file => `/${file}`), ...readdirSync('public/photos').map(file => `/photos/${file}`)];
    const immutable = Object.keys(bundle).filter(file => /^assets\/.+-[\w-]{8,}\.[\w]+$/.test(file)).map(file => `/${file}`);
    const version = createHash('sha256').update(JSON.stringify([assets, runtime])).digest('hex').slice(0, 12);
    const sw = readFileSync('public/sw.js', 'utf8').replace(/const CACHE = '[^']+';/, `const CACHE = 'kanjian-${VISUAL_SCHEMA}-${version}';`).replace("['/', '/favicon.svg', '/manifest.webmanifest']", JSON.stringify(assets)).replace("const RUNTIME_ASSETS = [];", `const RUNTIME_ASSETS = ${JSON.stringify(runtime)};`);
    writeFileSync('dist/sw.js', sw.replace('const IMMUTABLE_ASSETS = new Set([]);', `const IMMUTABLE_ASSETS = new Set(${JSON.stringify(immutable)});`));
  } }], test: { environment: 'jsdom', setupFiles: ['./tests/setup.ts'], exclude: ['node_modules/**', 'dist/**', 'tests/browser/**'] } };
});
