const CACHE = "mediship-shell-v4"

// offline.html is public (no auth) — always precached so offline always works
const PRECACHE = ["/offline.html", "/login"]

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .catch(() => {}) // don't block SW install if precache fetch fails
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
  if (!e.request.url.startsWith("http")) return

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

  // Network-first for everything else; fall back to cache, then offline.html for navigation
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && res.type !== "opaque") {
          caches.open(CACHE).then((c) => c.put(e.request, res.clone()))
        }
        return res
      })
      .catch(async () => {
        const cached = await caches.match(e.request)
        if (cached) return cached
        // For page navigations with no cache, serve the offline shell
        if (e.request.mode === "navigate") {
          return caches.match("/offline.html")
        }
      })
  )
})

// Message from client: warm cache for protected pages after login
self.addEventListener("message", (e) => {
  if (e.data?.type === "CACHE_PAGES") {
    const pages = e.data.pages || []
    caches.open(CACHE).then((cache) => {
      pages.forEach((url) => {
        fetch(url, { credentials: "include" }).then((res) => {
          if (res.ok) cache.put(url, res)
        }).catch(() => {})
      })
    })
  }
})
