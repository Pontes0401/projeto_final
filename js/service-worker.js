const CACHE_NAME = "v1";
const OFFLINE_URL = "offline.html";
const ASSETS = [
  "/login.html",
  "/login.js",
  "/login.css",
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then(response =>
        response || caches.match(OFFLINE_URL)
      )
    )
  );
});
