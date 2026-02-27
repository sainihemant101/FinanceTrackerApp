const CACHE_NAME = 'fintracker-v1';
const STATIC_ASSETS = [
  '/FinanceTrackerApp/',
  '/FinanceTrackerApp/index.html',
  '/FinanceTrackerApp/manifest.json',
  '/FinanceTrackerApp/icon-192.png',
  '/FinanceTrackerApp/icon-512.png'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first, fall back to cache for the app shell
self.addEventListener('fetch', event => {
  // Skip non-GET and Firebase/Google API requests — always go live for those
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.hostname.includes('firebase') || url.hostname.includes('google') || url.hostname.includes('googleapis')) return;

  event.respondWith(
    fetch(event.request)
      .then(res => {
        // Update cache with fresh response
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
