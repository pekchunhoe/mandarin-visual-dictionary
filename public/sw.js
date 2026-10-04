const CACHE = 'kanjian-v1';
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/', '/favicon.svg', '/manifest.webmanifest']))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('kanjian-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (event.request.mode === 'navigate') { try { const response = await fetch(event.request); if (response.ok) await cache.put('/', response.clone()); return response; } catch { return await cache.match('/') || Response.error(); } }
    const hit = await cache.match(event.request); if (hit) return hit;
    try { const response = await fetch(event.request); if (response.ok && /\.(js|css|json|jpg|svg|webmanifest)$/.test(url.pathname)) await cache.put(event.request, response.clone()); return response; } catch { return Response.error(); }
  })());
});
