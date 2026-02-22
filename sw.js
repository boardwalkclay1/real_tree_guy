// Real Tree Guy OS — Modern PWA Service Worker
const CACHE_NAME = "rtg-os-v3";

// Only cache the core shell — NOT every module
const CORE_FILES = [
  "/index.html",
  "/manifest.json",
  "/assets/styles.css",
  "/assets/styles-measure.css",

  // Icons
  "/assets/icons/rtg-logo-192.png",
  "/assets/icons/rtg-logo-512.png"
];

// INSTALL — cache core files only
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES))
  );
  self.skipWaiting();
});

// ACTIVATE — remove old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH — network first, fallback to cache
self.addEventListener("fetch", event => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== "GET") return;

  event.respondWith(
    fetch(req)
      .then(res => {
        // Save a copy to cache
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
