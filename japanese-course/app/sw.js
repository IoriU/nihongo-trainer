// にほんご Trainer service worker — offline cache (stale-while-revalidate).
// Bump CACHE when you want to force-evict old assets. Normal updates are
// picked up automatically on the next load (revalidate-in-background below).
const CACHE = 'nihongo-trainer-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './data.js',
  './app.js',
  './manifest.json',
  './icon.svg',
  './lessons/L01.md'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Only handle same-origin GETs; let everything else hit the network.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached); // offline: fall back to cache
        // Serve cache immediately if present; refresh it in the background.
        return cached || network;
      })
    )
  );
});
