/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

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
