// Rezervario Service Worker — versiune minimă pentru instalare PWA
// (fără cache agresiv, ca să nu servească date vechi de rezervări)

var CACHE_NAME = 'rezervario-v1';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
             .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

// Fără fetch handler agresiv — lăsăm totul să treacă direct la rețea,
// ca aplicația să aibă mereu date proaspete din Firebase.
self.addEventListener('fetch', function(event) {
  // pass-through, no caching strategy applied
});
