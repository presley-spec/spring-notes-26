// 1L Study Hub — Service Worker v1.0
const CACHE_NAME = '1l-study-hub-v1';
const GAME_FILES = [
  './',
  './LawSchool_Study_Hub.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // Study Platforms
  './CrimLaw_Study_Platform.html',
  './ConLaw_Study_Platform.html',
  './PropertyLaw_Study_Platform.html',
  './Finals_Study_Guide_Spring_2026.html',
  // Original Games
  './Esquire_Rising_v3.html',
  './galactic-high-tribunal.html',
  './Property_Law_Quahog_Court.html',
  './FascismInc.html',
  './Law_School_Sporcle.html',
  './Rick_and_Morty_Crim_Exam_Hypo.html',
  // NYT Games
  './Law_Connections.html',
  './Law_Wordle.html',
  './Law_Crossword.html',
  './Law_Issue_Spotter.html',
  './Law_Strands.html',
  './Law_Case_Quotes.html',
  // Exam Skills Games
  './Law_Devils_Advocate.html',
  './Law_Majority_Minority.html',
  './Law_Case_Timeline.html',
  './Law_Hypo_Builder.html',
  './Law_IRAC_Sprint.html'
];

// Install: cache all game files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching all game files');
      return cache.addAll(GAME_FILES);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for game files, network-first for everything else
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // For Google Fonts and external resources: network with cache fallback
  if (url.origin !== location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetched = fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetched;
      })
    );
    return;
  }

  // For local files: cache-first, then network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
