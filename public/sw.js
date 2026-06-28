const CACHE = "mediship-shell-v1"

// Pre-cache the pages most useful offline for field reps
const PRECACHE = ["/sales/new", "/crm/leads/new"]

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || !e.request.url.startsWith("http")) return

  // Always cache Next.js static assets
  if (e.request.url.includes("/_next/static/")) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached
        return fetch(e.request).then((res) => {
          caches.open(CACHE).then((c) => c.put(e.request, res.clone()))
          return res
        })
      })
    )
    return
  }

  // Network-first for everything else; fall back to cache
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          caches.open(CACHE).then((c) => c.put(e.request, res.clone()))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
