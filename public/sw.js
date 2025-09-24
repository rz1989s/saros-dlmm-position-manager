const CACHE_NAME = 'saros-dlmm-v1.0.0'
const STATIC_CACHE = 'saros-static-v1.0.0'
const DYNAMIC_CACHE = 'saros-dynamic-v1.0.0'
const API_CACHE = 'saros-api-v1.0.0'

const STATIC_ASSETS = [
  '/',
  '/analytics',
  '/strategies',
  '/manifest.json',
  '/_next/static/css/',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

const API_ROUTES = [
  '/api/',
  'https://mainnet.helius-rpc.com',
  'https://solana-rpc.publicnode.com',
  'https://api.devnet.solana.com',
  'https://api.saros.finance'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Installation complete')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Activation complete')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve cached content and implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }

  event.respondWith(handleFetch(request))
})

async function handleFetch(request) {
  const url = new URL(request.url)

  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE)
    }

    // Strategy 2: Network First for API calls with fallback
    if (isApiCall(url)) {
      return await networkFirstWithFallback(request, API_CACHE)
    }

    // Strategy 3: Stale While Revalidate for dynamic pages
    if (isDynamicPage(url)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE)
    }

    // Default: Network only
    return await fetch(request)

  } catch (error) {
    console.error('[SW] Fetch failed:', error)
    return await handleOfflineFallback(request)
  }
}

// Cache First Strategy - for static assets
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  const networkResponse = await fetch(request)
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone())
  }

  return networkResponse
}

// Network First with Fallback - for API calls
async function networkFirstWithFallback(request, cacheName) {
  const cache = await caches.open(cacheName)

  try {
    const networkResponse = await fetch(request, {
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (networkResponse.ok) {
      // Cache successful API responses for 5 minutes
      const responseToCache = networkResponse.clone()
      const cacheWithExpiry = {
        response: responseToCache,
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000 // 5 minutes
      }

      cache.put(request, new Response(JSON.stringify(cacheWithExpiry)))
    }

    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      const cachedData = await cachedResponse.json()

      // Check if cache is still valid
      if (Date.now() - cachedData.timestamp < cachedData.ttl) {
        return new Response(JSON.stringify(cachedData.response), {
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    throw error
  }
}

// Stale While Revalidate - for dynamic pages
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  // Fetch in background to update cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  })

  // Return cached version immediately if available
  return cachedResponse || fetchPromise
}

// Offline fallback handling
async function handleOfflineFallback(request) {
  const url = new URL(request.url)

  // Return cached page for navigation requests
  if (request.destination === 'document') {
    const cache = await caches.open(DYNAMIC_CACHE)
    const fallback = await cache.match('/') ||
                    await cache.match('/offline.html')

    if (fallback) {
      return fallback
    }
  }

  // Return offline indicator for API calls
  if (isApiCall(url)) {
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'No network connection available',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  // Default offline response
  return new Response('Offline', { status: 503 })
}

// Helper functions
function isStaticAsset(url) {
  // Exclude JavaScript files from cache-first strategy to prevent module caching issues
  // Only cache true static assets like images and CSS
  return url.pathname.includes('/icons/') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.ico') ||
         url.pathname.endsWith('.css')
}

function isApiCall(url) {
  return url.pathname.startsWith('/api/') ||
         API_ROUTES.some(route => url.href.includes(route))
}

function isDynamicPage(url) {
  return url.origin === self.location.origin &&
         !isStaticAsset(url) &&
         !isApiCall(url)
}

// Background sync for pending actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'position-updates') {
    event.waitUntil(syncPositionUpdates())
  }

  if (event.tag === 'strategy-actions') {
    event.waitUntil(syncStrategyActions())
  }
})

async function syncPositionUpdates() {
  try {
    // Get pending position updates from IndexedDB
    const pendingUpdates = await getPendingUpdates('positions')

    for (const update of pendingUpdates) {
      try {
        await fetch('/api/positions/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update)
        })

        // Remove from pending updates
        await removePendingUpdate('positions', update.id)
      } catch (error) {
        console.error('[SW] Failed to sync position update:', error)
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

async function syncStrategyActions() {
  try {
    const pendingActions = await getPendingUpdates('strategies')

    for (const action of pendingActions) {
      try {
        await fetch('/api/strategies/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action)
        })

        await removePendingUpdate('strategies', action.id)
      } catch (error) {
        console.error('[SW] Failed to sync strategy action:', error)
      }
    }
  } catch (error) {
    console.error('[SW] Strategy sync failed:', error)
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'View Position',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ],
    requireInteraction: data.urgent,
    tag: data.tag || 'default'
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const action = event.action
  const data = event.notification.data

  if (action === 'view' && data?.url) {
    event.waitUntil(
      clients.openWindow(data.url)
    )
  } else if (action === 'dismiss') {
    // Just close the notification
    return
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Utility functions for IndexedDB operations
async function getPendingUpdates(store) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SarosDLMM', 1)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction([store], 'readonly')
      const objectStore = transaction.objectStore(store)
      const getAllRequest = objectStore.getAll()

      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result)
      }
    }

    request.onerror = () => reject(request.error)
  })
}

async function removePendingUpdate(store, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SarosDLMM', 1)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction([store], 'readwrite')
      const objectStore = transaction.objectStore(store)
      const deleteRequest = objectStore.delete(id)

      deleteRequest.onsuccess = () => resolve()
    }

    request.onerror = () => reject(request.error)
  })
}

console.log('[SW] Service Worker loaded successfully')