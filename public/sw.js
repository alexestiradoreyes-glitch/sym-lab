// SYM LAB Service Worker — Cache-first para estáticos, Network-first para API
const CACHE = 'symlab-v5'

// Páginas que nunca deben cachearse (datos en tiempo real)
const NO_CACHE_PAGES = ['/admin', '/api/', '/ideas/']

const PRECACHE = [
  '/',
  '/ideas/nueva',
  '/enlaces',
  '/manifest.json',
  '/images/logo-symlab.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // Ignorar peticiones no-GET y extensiones de desarrollo
  if (request.method !== 'GET') return
  if (url.pathname.startsWith('/_next/webpack-hmr')) return
  if (url.pathname.startsWith('/__nextjs')) return

  // Páginas dinámicas y API: siempre de red, nunca desde caché
  if (NO_CACHE_PAGES.some(p => url.pathname.startsWith(p))) {
    e.respondWith(
      fetch(request).catch(() => new Response(
        JSON.stringify({ error: 'Sin conexión.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      ))
    )
    return
  }

  // Assets Next.js (_next/static): Cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(request, clone))
        return res
      }))
    )
    return
  }

  // Páginas y recursos estáticos: Stale-While-Revalidate
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(request)
      const fetchPromise = fetch(request).then(res => {
        if (res.ok) cache.put(request, res.clone())
        return res
      }).catch(() => cached)

      return cached || fetchPromise
    })
  )
})

// ─── Push notifications ───────────────────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return
  const data = e.data.json()
  e.waitUntil(
    self.registration.showNotification(data.titulo, {
      body: `${data.persona}: ${data.mensaje}`,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tipo,
      renotify: true,
      data: { url: data.url || '/' },
      vibrate: [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.endsWith(url) && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
