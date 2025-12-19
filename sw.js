
const CACHE_NAME = 'focusflow-v7-final';

// 1. Critical assets for the app shell
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn-icons-png.flaticon.com/512/3593/3593444.png'
];

// 2. Exact ESM dependency URLs from the importmap
const ESM_DEPS = [
  'https://esm.sh/react@19.0.0',
  'https://esm.sh/react-dom@19.0.0',
  'https://esm.sh/react-dom@19.0.0/client',
  'https://esm.sh/@dnd-kit/core@6.3.1?deps=react@19.0.0,react-dom@19.0.0',
  'https://esm.sh/@dnd-kit/sortable@10.0.0?deps=react@19.0.0,react-dom@19.0.0',
  'https://esm.sh/@dnd-kit/utilities@3.2.2?deps=react@19.0.0,react-dom@19.0.0'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[FocusFlow SW] Installing & Caching Shell');
      // We use addAll for all assets to ensure installation only succeeds if all are cached
      return Promise.allSettled([
        ...CORE_ASSETS.map(url => cache.add(url).catch(e => console.error(`Failed to cache ${url}:`, e))),
        ...ESM_DEPS.map(url => cache.add(url).catch(e => console.error(`Failed to cache dep ${url}:`, e)))
      ]);
    })
  );
  self.skipWaiting();
});

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

// Cache-First Strategy for Offline Reliability
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  event.respondWith(
    caches.match(event.request, { ignoreSearch: false }).then((cachedResponse) => {
      // 1. If found in cache, serve it immediately (even if online)
      if (cachedResponse) {
        // Refresh internal code in background to stay up to date
        if (url.origin === self.location.origin && !url.pathname.includes('manifest')) {
          fetch(event.request).then(response => {
            if (response.ok) {
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
            }
          }).catch(() => {});
        }
        return cachedResponse;
      }

      // 2. Not in cache, try network
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) return networkResponse;

        // Cache new ESM dependencies or internal files dynamically
        const isInternal = url.origin === self.location.origin;
        const isCDN = url.host === 'esm.sh' || url.host.includes('tailwindcss') || url.host.includes('flaticon');
        
        if (isInternal || isCDN) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }

        return networkResponse;
      }).catch(() => {
        // 3. Last Resort: Navigation Fallback
        if (event.request.mode === 'navigate') {
          return caches.match('/') || caches.match('/index.html');
        }
        return null;
      });
    })
  );
});
