/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare let self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Dados da API (catálogo, espécies, avistamentos públicos): tenta rede,
// usa cache se offline — mantém os dados razoavelmente atualizados mas
// disponíveis sem conexão.
registerRoute(
  ({ url }) => url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/rest/v1/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 })],
  })
)

// Fotos de espécies e avistamentos (Supabase Storage + Wikimedia): cache
// duradouro, já que fotos publicadas raramente mudam.
registerRoute(
  ({ url, request }) =>
    request.destination === 'image' &&
    (url.hostname.endsWith('.supabase.co') || url.hostname.includes('wikimedia.org')),
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  })
)

// Tiles do mapa (OpenStreetMap): cache para permitir consultar o mapa já
// visitado mesmo sem conexão.
registerRoute(
  ({ url }) => url.hostname.endsWith('tile.openstreetmap.org'),
  new CacheFirst({
    cacheName: 'map-tiles-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 })],
  })
)

// Navegação (trocar de tela no app): tenta rede primeiro, cai para o
// index.html em cache se estiver offline — mantém o app abrindo mesmo sem sinal.
registerRoute(new NavigationRoute(new NetworkFirst({ cacheName: 'pages-cache' })))

interface PushPayload {
  title?: string
  body?: string
  url?: string
}

self.addEventListener('push', (event: PushEvent) => {
  let data: PushPayload = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'É uma cobra venenosa?', body: event.data?.text() ?? 'Novo registro de serpente na Paraíba.' }
  }
  const title = data.title ?? 'É uma cobra venenosa?'
  const options: NotificationOptions = {
    body: data.body ?? 'Novo registro de serpente na Paraíba.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url ?? '/' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const url = (event.notification.data as { url?: string })?.url ?? '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})
