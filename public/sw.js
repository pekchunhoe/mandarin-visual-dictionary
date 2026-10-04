const CACHE = 'kanjian-dictionary-visual-v4';
const RUNTIME_ASSETS = [];
const IMMUTABLE_ASSETS = new Set([]);
self.addEventListener('install', event => { event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  await cache.addAll(['/', '/favicon.svg', '/manifest.webmanifest']);
  // An existing offline dictionary needs the matching semantic data during an
  // upgrade from the old bundled classifier. Fresh home installs stay light.
  for (const key of await caches.keys()) {
    if (key === CACHE || !key.startsWith('kanjian-')) continue;
    const previous = await caches.open(key);
    const worker = (await previous.keys()).find(request => /\/dictionary\.worker[^/]*\.js$/.test(new URL(request.url).pathname));
    const legacyClassifier = worker && (await (await previous.match(worker)).text()).includes('wordnet-3.1-cedict-');
    if (legacyClassifier || await previous.match('/data/cedict.json')) {
      await cache.addAll(RUNTIME_ASSETS.filter(url => url !== '/data/cedict.json'));
      break;
    }
  }
})()); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil((async () => {
  const current = await caches.open(CACHE);
  for (const key of await caches.keys()) {
    if (!key.startsWith('kanjian-') || key === CACHE) continue;
    const previous = await caches.open(key);
    // Keep previously downloaded dictionary data across shell upgrades. Only
    // current content-hashed semantic data is eligible; never copy API results.
    for (const url of RUNTIME_ASSETS) {
      const hit = await previous.match(url);
      if (hit && !await current.match(url)) await current.put(url, hit);
    }
    await caches.delete(key);
  }
  await self.clients.claim();
})()); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (event.request.mode === 'navigate') { try { const response = await fetch(event.request); if (response.ok) await cache.put('/', response.clone()); return response; } catch { return await cache.match('/') || Response.error(); } }
    // Hashed build assets are immutable same-origin files. Preview servers may
    // vary on Origin between install-time fetches and later module imports.
    const hit = await cache.match(event.request, { ignoreVary: !url.search && IMMUTABLE_ASSETS.has(url.pathname) }); if (hit) return hit;
    try { const response = await fetch(event.request); if (response.ok && /\.(js|css|json|jpg|svg|webmanifest)$/.test(url.pathname)) await cache.put(event.request, response.clone()); return response; } catch { return Response.error(); }
  })());
});
