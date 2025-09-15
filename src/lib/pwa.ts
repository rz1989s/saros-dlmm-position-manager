'use client'

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export interface PWAInstallState {
  isInstallable: boolean
  isInstalled: boolean
  isStandalone: boolean
  canPrompt: boolean
  platform: string | null
}

export interface NotificationState {
  permission: NotificationPermission
  isSupported: boolean
  registration: ServiceWorkerRegistration | null
}

// Service Worker Registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Worker not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    })

    console.log('[PWA] Service Worker registered:', registration.scope)

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              dispatchEvent(new CustomEvent('sw-update-available', {
                detail: { registration }
              }))
            } else {
              // Content is cached for offline use
              dispatchEvent(new CustomEvent('sw-cached', {
                detail: { registration }
              }))
            }
          }
        })
      }
    })

    return registration
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error)
    return null
  }
}

// Install Prompt Management
export class PWAInstallManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null
  private listeners: Set<(state: PWAInstallState) => void> = new Set()

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupEventListeners()
    }
  }

  private setupEventListeners() {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e as BeforeInstallPromptEvent
      this.notifyListeners()
    })

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null
      this.notifyListeners()
    })

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.notifyListeners()
    }
  }

  public getState(): PWAInstallState {
    const isStandalone = typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
       (window.navigator as any).standalone === true ||
       document.referrer.includes('android-app://'))

    const isInstalled = isStandalone ||
      (typeof window !== 'undefined' && window.location.search.includes('pwa=true'))

    return {
      isInstallable: !!this.deferredPrompt,
      isInstalled,
      isStandalone,
      canPrompt: !!this.deferredPrompt && !isInstalled,
      platform: this.detectPlatform()
    }
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('[PWA] No install prompt available')
      return false
    }

    try {
      await this.deferredPrompt.prompt()
      const { outcome } = await this.deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt')
        this.deferredPrompt = null
        this.notifyListeners()
        return true
      } else {
        console.log('[PWA] User dismissed install prompt')
        return false
      }
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error)
      return false
    }
  }

  private detectPlatform(): string | null {
    if (typeof window === 'undefined') return null

    const userAgent = navigator.userAgent.toLowerCase()

    if (/android/.test(userAgent)) return 'android'
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
    if (/windows/.test(userAgent)) return 'windows'
    if (/macintosh|mac os x/.test(userAgent)) return 'macos'
    if (/linux/.test(userAgent)) return 'linux'

    return 'unknown'
  }

  public subscribe(callback: (state: PWAInstallState) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners() {
    const state = this.getState()
    this.listeners.forEach(callback => callback(state))
  }
}

// Push Notifications
export class NotificationManager {
  private registration: ServiceWorkerRegistration | null = null

  constructor(registration?: ServiceWorkerRegistration) {
    this.registration = registration || null
  }

  public getState(): NotificationState {
    return {
      permission: typeof window !== 'undefined' ? Notification.permission : 'default',
      isSupported: typeof window !== 'undefined' && 'Notification' in window,
      registration: this.registration
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('[PWA] Notifications not supported')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    try {
      const permission = await Notification.requestPermission()
      console.log('[PWA] Notification permission:', permission)
      return permission
    } catch (error) {
      console.error('[PWA] Failed to request notification permission:', error)
      return 'denied'
    }
  }

  public async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.warn('[PWA] No service worker registration')
      return null
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      })

      console.log('[PWA] Push subscription created')
      return subscription
    } catch (error) {
      console.error('[PWA] Failed to subscribe to push notifications:', error)
      return null
    }
  }

  public async showNotification(
    title: string,
    options: NotificationOptions = {}
  ): Promise<void> {
    if (!this.registration) {
      // Fallback to browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options)
      }
      return
    }

    try {
      await this.registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [200, 100, 200],
        ...options
      })
    } catch (error) {
      console.error('[PWA] Failed to show notification:', error)
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

// Offline Detection
export class OfflineManager {
  private listeners: Set<(isOnline: boolean) => void> = new Set()
  private isOnline: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine
      this.setupEventListeners()
    }
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.notifyListeners()
      console.log('[PWA] Back online')
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifyListeners()
      console.log('[PWA] Gone offline')
    })
  }

  public getState(): boolean {
    return this.isOnline
  }

  public subscribe(callback: (isOnline: boolean) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.isOnline))
  }
}

// Background Sync
export async function requestBackgroundSync(tag: string): Promise<void> {
  if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
    console.warn('[PWA] Background Sync not supported')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    await registration.sync.register(tag)
    console.log(`[PWA] Background sync registered: ${tag}`)
  } catch (error) {
    console.error('[PWA] Background sync registration failed:', error)
  }
}

// Cache Management
export class CacheManager {
  public async clearCache(cacheNames?: string[]): Promise<void> {
    if (!('caches' in window)) {
      console.warn('[PWA] Cache API not supported')
      return
    }

    try {
      const names = cacheNames || await caches.keys()

      await Promise.all(
        names.map(name => caches.delete(name))
      )

      console.log('[PWA] Cache cleared:', names)
    } catch (error) {
      console.error('[PWA] Failed to clear cache:', error)
    }
  }

  public async getCacheSize(): Promise<number> {
    if (!('caches' in window) || !('estimate' in navigator.storage)) {
      return 0
    }

    try {
      const estimate = await navigator.storage.estimate()
      return estimate.usage || 0
    } catch (error) {
      console.error('[PWA] Failed to get cache size:', error)
      return 0
    }
  }

  public async preloadRoute(url: string): Promise<void> {
    if (!('caches' in window)) return

    try {
      const cache = await caches.open('saros-dynamic-v1.0.0')
      await cache.add(url)
      console.log(`[PWA] Route preloaded: ${url}`)
    } catch (error) {
      console.error(`[PWA] Failed to preload route: ${url}`, error)
    }
  }
}

// PWA Analytics
export function trackPWAEvent(event: string, data?: any) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    ;(window as any).gtag('event', event, {
      event_category: 'PWA',
      ...data
    })
  }

  console.log(`[PWA] Event: ${event}`, data)
}

// Export singleton instances
export const installManager = typeof window !== 'undefined' ? new PWAInstallManager() : null
export const offlineManager = typeof window !== 'undefined' ? new OfflineManager() : null
export const cacheManager = typeof window !== 'undefined' ? new CacheManager() : null