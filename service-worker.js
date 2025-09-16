const CACHE_NAME = 'hot-cache-v1';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'service-worker.js',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// Install: cache assets
self.addEventListener('install', (evt) => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if(k !== CACHE_NAME) return caches.delete(k);
    })))
  );
  self.clients.claim();
});

// Fetch: try cache first, then network
self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then(cached => {
      if(cached) return cached;
      return fetch(evt.request).then(response => {
        // optionally cache new requests for navigation/GET
        return response;
      }).catch(() => {
        // fallback for navigation requests: return cached index.html
        if(evt.request.mode === 'navigate') return caches.match('index.html');
      });
    })
  );
});
