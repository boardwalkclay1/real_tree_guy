// Real Tree Guy — Full App Service Worker
const CACHE_NAME = "rtg-cache-v1";

const FILES_TO_CACHE = [
  // Core
  "index.html",
  "manifest.json",
  "assets/styles.css",

  // Icons
  "assets/icons/rtg-192.png",
  "assets/icons/rtg-512.png",

  // Standalone pages
  "profile.html",
  "profile.js",

  // ============================
  // MODULES (HTML + JS per folder)
  // ============================

  // Angle
  "modules/angle/angle.html",
  "modules/angle/angle.js",

  // Application
  "modules/application/application.html",
  "modules/application/application.js",

  // Business
  "modules/business/business.html",
  "modules/business/business.js",

  // Calendar
  "modules/calendar/calendar.html",
  "modules/calendar/calendar.js",

  // Climbing
  "modules/climbing/climbing.html",
  "modules/climbing/climbing.js",

  // Contracts (multiple pages)
  "modules/contracts/contracts.html",
  "modules/contracts/contracts.js",
  "modules/contracts/contract-form.html",
  "modules/contracts/contract-form.js",
  "modules/contracts/contract-sign.html",
  "modules/contracts/contract-sign.js",
  "modules/contracts/contract-client.html",
  "modules/contracts/contract-client.js",

  // Customers
  "modules/customers/customers.html",
  "modules/customers/customers.js",

  // Cuts
  "modules/cuts/cuts.html",
  "modules/cuts/cuts.js",

  // Fall
  "modules/fall/fall.html",
  "modules/fall/fall.js",

  // Flyers
  "modules/flyers/flyers.html",
  "modules/flyers/flyers.js",

  // Jobs
  "modules/jobs/jobs.html",
  "modules/jobs/jobs.js",

  // Landing
  "modules/landing/landing.html",
  "modules/landing/landing.js",

  // Manual
  "modules/manual/manual.html",
  "modules/manual/manual.js",

  // Map (Real Tree Map)
  "modules/map/real-tree-map.html",
  "modules/map/real-tree-map.js",

  // Measurement
  "modules/measurement/measurement.html",
  "modules/measurement/measurement.js",

  // Overlay
  "modules/overlay/overlay.html",
  "modules/overlay/overlay.js",

  // Photo
  "modules/photo/photo.html",
  "modules/photo/photo.js",

  // Roles
  "modules/roles/roles.html",
  "modules/roles/roles.js"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
