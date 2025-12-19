
const CACHE_NAME = 'focusflow-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/types.ts',
  'https://cdn.tailwindcss.com',
  'https://cdn-icons-png.flaticon.com/512/3593/3593444.png'
];

// Install: Cache all known assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Purge old versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Strategy for offline reliability
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. If it's in the cache, return it immediately
      if (cachedResponse) {
        // Asynchronously update the cache for non-CDN assets
        if (!url.host.includes('esm.sh') && !url.host.includes('cdn')) {
            fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
                }
            }).catch(() => {});
        }
        return cachedResponse;
      }

      // 2. Not in cache: Fetch and dynamically cache
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Cache external dependencies forever
        const isDependency = url.host === 'esm.sh' || url.host.includes('tailwindcss') || url.host.includes('flaticon');
        if (isDependency || url.origin === self.location.origin) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }

        return networkResponse;
      }).catch(() => {
        // 3. Last resort offline: return index.html for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }
        return null;
      });
    })
  );
});
