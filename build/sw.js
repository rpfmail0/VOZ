const CACHE_NAME = 'voz-ia-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                if (!event.request.url.startsWith('http') || event.request.url.includes('/api/')) return;
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Offline fallback logic here if needed
        });
      })
  );
});
