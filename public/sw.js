// Service Worker DERMAYU PWA (Native Standalone & Offline Support)
const CACHE_NAME = "dermayu-pwa-v1";
const PRECACHE_ASSETS = [
  "/",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      }),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  // Hanya proses request GET http/https
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  // Jangan tangani API requests agar data TMA dan laporan selalu live
  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.mode === "navigate") {
          const fallback = await caches.match("/");
          if (fallback) return fallback;
        }
        return Response.error();
      })
  );
});

