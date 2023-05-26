// Service Worker Installation
self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('skypuzzle-cache').then(function(cache) {
        return cache.addAll([
          '/', // Add the URLs of the files you want to cache
          '/index.html',
          '/style.css',
          '/main.js',
          // Add more URLs of your site's static assets
        ]);
      })
    );
  });
  
  // Service Worker Activation
  self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            // Delete outdated caches
            return cacheName.startsWith('skypuzzle-cache') && cacheName !== 'skypuzzle-cache';
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });
  
  // Service Worker Fetch
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
  