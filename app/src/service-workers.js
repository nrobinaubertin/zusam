import { Store, set, get } from "idb-keyval";

const ZUSAM_VERSION = "4.1";
const CACHE_VERSION = "0.2";
const CACHE = "zusam-" + ZUSAM_VERSION + "-simplecache-" + CACHE_VERSION;
const cache_store = new Store("zusam-" + ZUSAM_VERSION, CACHE);
const cached_routes = {
  "/api/users/": 1000 * 60 * 60 * 24, // 24h
  "/api/images/crop/": null,
  "/api/images/thumbnail/": null,
  "/api/links/by_url?": null
};

// On fetch, use cache but update the entry with the latest contents
// from the server.
self.addEventListener("fetch", function(evt) {
  if (evt.request.method == "GET") {
    // cache-update routes: retrieve from cache and update in background
    if (Object.keys(cached_routes).some(r => evt.request.url.includes(r))) {
      // You can use `respondWith()` to answer immediately, without waiting for the
      // network response to reach the service worker...
      evt.respondWith(fromCache(evt.request));

      // ...and `waitUntil()` to prevent the worker from being killed until the function is finished.
      evt.waitUntil(_ => {
        get(evt.request.url, cache_store)
          .then(r => {
            if (r && r.hasOwnProperty("lastUsed") && r.lastUsed != null) {
              const timeout =
                r.lastUsed +
                cached_routes[
                  Object.keys(cached_routes).find(r =>
                    evt.request.url.includes(r)
                  )
                ];
              // update the cache only if the timeout is reached
              if (timeout < Date.now()) {
                update(evt.request);
              }
            }
          })
          .catch(_ => update(evt.request));
      });
    } else {
      // from-network without cache is the default
      return fromNetwork(evt.request, false);
    }
  }
});

// Make a network request, return the result and add it to cache if asked
function fromNetwork(request, addToCache) {
  return fetch(request).then(response => {
    if (addToCache) {
      // response may be used only once
      // we need to save clone to put one copy in cache
      // and serve second one
      let responseClone = response.clone();
      caches.open(CACHE).then(cache => {
        addToCache(cache, request, responseClone);
      });
    }
    return response;
  });
}

// Open the cache where the assets were stored and search for the requested
// resource. Notice that in case of no matching, the promise still resolves
// but it does with `undefined` as value.
function fromCache(request) {
  return caches.open(CACHE).then(cache => {
    return cache.match(request).then(matching => {
      if (matching) {
        // reset lastUsed
        return set(
          request.url,
          {
            lastUsed: Date.now()
          },
          cache_store
        ).then(_ => matching);
      } else {
        // if nothing matches, return response from network
        return fromNetwork(request, true);
      }
    });
  });
}

// Update consists in opening the cache, performing a network request and
// storing the new response data.
function update(request) {
  return caches.open(CACHE).then(cache => {
    return fetch(request).then(response => {
      return addToCache(cache, request, response);
    });
  });
}

// Add response to cache and store the lastUsed timestamp at the same time
function addToCache(cache, request, response) {
  return set(
    request.url,
    {
      lastUsed: Date.now()
    },
    cache_store
  ).then(_ => cache.put(request, response));
}