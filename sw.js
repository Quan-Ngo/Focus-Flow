
const CACHE_NAME = 'focusflow-v6-stable';

// Core app assets
const CORE_ASSETS = [
  './',
  'index.html',
  'index.tsx',
  'App.tsx',
  'types.ts',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn-icons-png.flaticon.com/512/3593/3593444.png'
];

// Pinned ESM dependencies to prevent multiple React instances
const DEPENDENCIES = [
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
      console.log('[SW] Pre-caching all assets');
      return Promise.allSettled([
        ...CORE_ASSETS.map(url => cache.add(url)),
        ...DEPENDENCIES.map(url => cache.add(url))
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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Immediate cache return
      if (cachedResponse) {
        // Background refresh for internal files
        if (url.origin === self.location.origin && !url.pathname.endsWith('.json')) {
          fetch(event.request).then(resp => {
             if (resp.status === 200) caches.open(CACHE_NAME).then(c => c.put(event.request, resp));
          }).catch(() => {});
        }
        return cachedResponse;
      }

      // 2. Network fallback + dynamic caching
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) return networkResponse;

        const shouldCache = 
          url.origin === self.location.origin || 
          url.host === 'esm.sh' || 
          url.host.includes('tailwindcss') || 
          url.host.includes('flaticon');

        if (shouldCache) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }

        return networkResponse;
      }).catch(() => {
        // 3. Last-ditch offline navigation
        if (event.request.mode === 'navigate') {
          return caches.match('index.html') || caches.match('./');
        }
        return null;
      });
    })
  );
});
