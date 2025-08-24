// Service Worker for SatsCircle Push Notifications

const CACHE_NAME = 'satscircle-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/placeholder-logo.png',
  '/placeholder-logo.svg'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()
    const options = {
      body: data.message || 'You have a new notification from SatsCircle',
      icon: '/placeholder-logo.png',
      badge: '/placeholder-logo.png',
      tag: data.tag || 'satscircle-notification',
      requireInteraction: true,
      data: data,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/placeholder-logo.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'SatsCircle Notification', options)
    )
  } catch (error) {
    console.error('Error handling push notification:', error)
    
    // Fallback notification
    const options = {
      body: 'You have a new notification from SatsCircle',
      icon: '/placeholder-logo.png',
      badge: '/placeholder-logo.png',
      tag: 'satscircle-fallback',
      requireInteraction: true
    }

    event.waitUntil(
      self.registration.showNotification('SatsCircle Notification', options)
    )
  }
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  // Handle notification click
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // If app is already open, focus it
        if (clients.length > 0) {
          const client = clients[0]
          client.focus()
          
          // Navigate to relevant page if data exists
          if (event.notification.data && event.notification.data.circleId) {
            client.postMessage({
              type: 'navigate',
              url: `/circle/${event.notification.data.circleId}`
            })
          }
        } else {
          // If app is not open, open it
          self.clients.openWindow('/dashboard')
        }
      })
  )
})

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      console.log('Background sync triggered')
    )
  }
})

// Message event from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip non-HTTP(S) requests
  if (!event.request.url.startsWith('http')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Return cached version if available
        return caches.match(event.request)
      })
  )
})
