// Sites that will be cached
var CACHE = "site-cache-v1";
const DATA_CACHE = "data-cache-v1";
var CACHED_SITES = [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.webmanifest",
  "/styles.css",
];
self.addEventListener("install", function(event) {
  // Install
  event.waitUntil(
    caches.open(CACHE).then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(CACHED_SITES);
    })
  );
});
self.addEventListener("fetch", function(event) {
  // Cache all get requests
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE).then(cache => {
        return fetch(event.request)
          .then(response => {
              cache.put(event.request.url, response.clone());
            return response;
          })
          .catch(err => {
          return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );
    return;
  }
  // Response to request, prevents browser's default fetch handling 
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
        }
      });
    })
  );
});
