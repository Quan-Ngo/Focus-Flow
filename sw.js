
const CACHE_NAME = 'focusflow-v3-core';
const STATIC_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn-icons-png.flaticon.com/512/3593/3593444.png'
];

// Install: Pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
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

// Fetch: Aggressive Cache-First Strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Return from cache immediately if found
      if (cachedResponse) {
        // Optional: Update cache in background (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {}); // Ignore network failures
        
        return cachedResponse;
      }

      // 2. Otherwise, fetch from network and cache for next time
      return fetch(event.request).then((networkResponse) => {
        // Don't cache if not a successful response
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Cache external dependencies (esm.sh, tailwind, icons) and internal scripts
        const shouldCache = 
          url.origin === self.location.origin || 
          url.host === 'esm.sh' || 
          url.host === 'cdn.tailwindcss.com' ||
          url.host === 'cdn-icons-png.flaticon.com';

        if (shouldCache) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch(() => {
        // 3. Offline Fallback: If network fails and not in cache, try to return index.html for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('index.html') || caches.match('./');
        }
        return null;
      });
    })
  );
});
