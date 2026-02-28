// Real Tree Guy OS — Production PWA Service Worker
const CACHE_NAME = "rtg-os-v5";

// Only cache the core shell — never dynamic pages or API calls
const CORE_FILES = [
  "/",
  "/index.html",
  "/manifest.json",

  // Global styles
  "/assets/styles.css",
  "/assets/styles-measure.css",

  // Global JS (api.js MUST be cached)
  "/js/api.js",

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
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH — network first for everything except core shell
self.addEventListener("fetch", event => {
  const req = event.request;

  // Never cache API calls (Node backend)
  if (req.url.includes("/api/")) {
    event.respondWith(fetch(req).catch(() => new Response("Offline", { status: 503 })));
    return;
  }

  // Only handle GET
  if (req.method !== "GET") return;

  // Network-first with fallback to cache
  event.respondWith(
    fetch(req)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
