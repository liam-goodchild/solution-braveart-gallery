var CACHE_NAME = "braveart-images-v1";

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    })
  );
});

self.addEventListener("fetch", function (event) {
  var url = event.request.url;

  if (!(event.request.method === "GET" && url.indexOf("files.stripe.com") !== -1)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;

      return fetch(url, { mode: "no-cors" }).then(function (response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, clone);
        });
        return response;
      });
    }).catch(function () {
      return fetch(url, { mode: "no-cors" });
    })
  );
});
