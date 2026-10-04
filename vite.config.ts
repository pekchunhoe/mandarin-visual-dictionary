import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import images from './api/images';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ['PIXABAY_', 'PEXELS_']));
  return { plugins: [react(), { name: 'local-image-api', configureServer(server) { server.middlewares.use('/api/images', (req, res) => { void images(req, res); }); } }, { name: 'offline-shell', writeBundle(_, bundle) {
    const assets = ['/', '/favicon.svg', '/manifest.webmanifest', ...Object.keys(bundle).map(file => `/${file}`), ...readdirSync('public/photos').map(file => `/photos/${file}`)];
    const version = createHash('sha256').update(JSON.stringify(assets)).digest('hex').slice(0, 12);
    const sw = readFileSync('public/sw.js', 'utf8').replace("'kanjian-v1'", `'kanjian-${version}'`).replace("['/', '/favicon.svg', '/manifest.webmanifest']", JSON.stringify(assets));
    writeFileSync('dist/sw.js', sw);
  } }], test: { environment: 'jsdom', setupFiles: ['./tests/setup.ts'], exclude: ['node_modules/**', 'dist/**', 'tests/browser/**'] } };
});
