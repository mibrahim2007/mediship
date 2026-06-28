const CACHE = "mediship-shell-v2"

// Pages pre-cached so field reps can open them offline
const PRECACHE = ["/sales/new", "/crm/leads/new", "/sales"]

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .catch(() => {}) // don't block install if a page redirects to login
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
  if (e.request.method !== "GET") return
  if (!e.request.url.startsWith("http"))  return

  const url = new URL(e.request.url)

  // Cache-first for Next.js static assets (immutable hashed files)
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached
        return fetch(e.request).then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()))
          return res
        })
      })
    )
    return
  }

  // Network-first for everything else; fall back to cache when offline
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && res.type !== "opaque") {
          caches.open(CACHE).then((c) => c.put(e.request, res.clone()))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
