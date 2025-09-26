'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PWAInstallState,
  NotificationState,
  installManager,
  offlineManager,
  cacheManager,
  registerServiceWorker,
  NotificationManager,
  requestBackgroundSync,
  trackPWAEvent
} from '@/lib/pwa'

// Install Prompt Hook
export function useInstallPrompt() {
  const [state, setState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    canPrompt: false,
    platform: null
  })

  useEffect(() => {
    if (!installManager) return

    const unsubscribe = installManager.subscribe(setState)
    setState(installManager.getState())

    return () => {
      unsubscribe()
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!installManager) return false

    trackPWAEvent('install_prompt_triggered', { platform: state.platform })

    const result = await installManager.promptInstall()

    trackPWAEvent('install_prompt_result', {
      platform: state.platform,
      accepted: result
    })

    return result
  }, [state.platform])

  return {
    ...state,
    promptInstall
  }
}

// Offline Status Hook
export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (!offlineManager) return

    const unsubscribe = offlineManager.subscribe(setIsOnline)
    setIsOnline(offlineManager.getState())

    return () => {
      unsubscribe()
    }
  }, [])

  return isOnline
}

// Service Worker Hook
export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    let mounted = true

    const handleUpdateAvailable = (_event: any) => {
      if (mounted) {
        setUpdateAvailable(true)
        trackPWAEvent('sw_update_available')
      }
    }

    const handleCached = () => {
      if (mounted) {
        trackPWAEvent('sw_cached')
      }
    }

    // Listen for service worker events
    window.addEventListener('sw-update-available', handleUpdateAvailable)
    window.addEventListener('sw-cached', handleCached)

    // Register service worker
    setIsInstalling(true)
    registerServiceWorker()
      .then((reg) => {
        if (mounted) {
          setRegistration(reg)
          setIsInstalling(false)
          if (reg) {
            trackPWAEvent('sw_registered')
          }
        }
      })
      .catch((error) => {
        if (mounted) {
          setIsInstalling(false)
          console.error('Service worker registration failed:', error)
        }
      })

    return () => {
      mounted = false
      window.removeEventListener('sw-update-available', handleUpdateAvailable)
      window.removeEventListener('sw-cached', handleCached)
    }
  }, [])

  const updateApp = useCallback(async () => {
    if (!registration || !updateAvailable) return

    try {
      await registration.unregister()
      window.location.reload()
      trackPWAEvent('sw_updated')
    } catch (error) {
      console.error('Failed to update app:', error)
    }
  }, [registration, updateAvailable])

  const skipUpdate = useCallback(() => {
    setUpdateAvailable(false)
    trackPWAEvent('sw_update_skipped')
  }, [])

  return {
    registration,
    updateAvailable,
    isInstalling,
    updateApp,
    skipUpdate
  }
}

// Push Notifications Hook
export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSupported: false,
    registration: null
  })
  const [notificationManager, setNotificationManager] = useState<NotificationManager | null>(null)

  const { registration } = useServiceWorker()

  useEffect(() => {
    const manager = new NotificationManager(registration || undefined)
    setNotificationManager(manager)
    setState(manager.getState())
  }, [registration])

  const requestPermission = useCallback(async () => {
    if (!notificationManager) return 'denied'

    trackPWAEvent('notification_permission_requested')

    const permission = await notificationManager.requestPermission()
    setState(notificationManager.getState())

    trackPWAEvent('notification_permission_result', { permission })

    return permission
  }, [notificationManager])

  const subscribeToPush = useCallback(async () => {
    if (!notificationManager) return null

    trackPWAEvent('push_subscription_requested')

    const subscription = await notificationManager.subscribeToPush()

    if (subscription) {
      trackPWAEvent('push_subscription_created')
      // Send subscription to your backend
      try {
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        })
      } catch (error) {
        console.error('Failed to send subscription to backend:', error)
      }
    }

    return subscription
  }, [notificationManager])

  const showNotification = useCallback(async (
    title: string,
    options?: NotificationOptions
  ) => {
    if (!notificationManager) return

    await notificationManager.showNotification(title, options)
    trackPWAEvent('notification_shown', { title })
  }, [notificationManager])

  return {
    ...state,
    requestPermission,
    subscribeToPush,
    showNotification
  }
}

// Background Sync Hook
export function useBackgroundSync() {
  const requestSync = useCallback(async (tag: string, data?: any) => {
    await requestBackgroundSync(tag)
    trackPWAEvent('background_sync_requested', { tag })

    // Store data for sync if provided
    if (data) {
      try {
        const request = indexedDB.open('SarosDLMM', 1)

        request.onupgradeneeded = () => {
          const db = request.result
          if (!db.objectStoreNames.contains(tag)) {
            db.createObjectStore(tag, { keyPath: 'id', autoIncrement: true })
          }
        }

        request.onsuccess = () => {
          const db = request.result
          const transaction = db.transaction([tag], 'readwrite')
          const store = transaction.objectStore(tag)
          store.add({ ...data, timestamp: Date.now() })
        }
      } catch (error) {
        console.error('Failed to store background sync data:', error)
      }
    }
  }, [])

  return { requestSync }
}

// Cache Management Hook
export function useCacheManager() {
  const [cacheSize, setCacheSize] = useState(0)

  useEffect(() => {
    if (cacheManager) {
      cacheManager.getCacheSize().then(setCacheSize)
    }
  }, [])

  const clearCache = useCallback(async (cacheNames?: string[]) => {
    if (!cacheManager) return

    await cacheManager.clearCache(cacheNames)
    const newSize = await cacheManager.getCacheSize()
    setCacheSize(newSize)

    trackPWAEvent('cache_cleared', { cacheNames })
  }, [])

  const preloadRoute = useCallback(async (url: string) => {
    if (!cacheManager) return

    await cacheManager.preloadRoute(url)
    trackPWAEvent('route_preloaded', { url })
  }, [])

  const refreshCacheSize = useCallback(async () => {
    if (!cacheManager) return

    const size = await cacheManager.getCacheSize()
    setCacheSize(size)
  }, [])

  return {
    cacheSize,
    clearCache,
    preloadRoute,
    refreshCacheSize
  }
}

// PWA Status Hook - combines all PWA features
export function usePWAStatus() {
  const installState = useInstallPrompt()
  const isOnline = useOffline()
  const serviceWorker = useServiceWorker()
  const notifications = useNotifications()

  const isPWAEnabled = serviceWorker.registration !== null
  const isAppLike = installState.isStandalone || installState.isInstalled

  return {
    install: installState,
    isOnline,
    serviceWorker,
    notifications,
    isPWAEnabled,
    isAppLike
  }
}

// Update Prompt Hook
export function useUpdatePrompt() {
  const { updateAvailable, updateApp, skipUpdate } = useServiceWorker()
  const [dismissed, setDismissed] = useState(false)

  const showPrompt = updateAvailable && !dismissed

  const handleUpdate = useCallback(async () => {
    await updateApp()
    setDismissed(true)
  }, [updateApp])

  const handleDismiss = useCallback(() => {
    skipUpdate()
    setDismissed(true)
  }, [skipUpdate])

  return {
    showPrompt,
    handleUpdate,
    handleDismiss
  }
}

// Network Status Hook with retry capability
export function useNetworkStatus() {
  const isOnline = useOffline()
  const [retryCount, setRetryCount] = useState(0)

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    trackPWAEvent('network_retry_attempted', { retryCount: retryCount + 1 })
  }, [retryCount])

  const resetRetry = useCallback(() => {
    setRetryCount(0)
  }, [])

  useEffect(() => {
    if (isOnline) {
      resetRetry()
    }
  }, [isOnline, resetRetry])

  return {
    isOnline,
    retryCount,
    retry,
    resetRetry
  }
}

// Storage Usage Hook
export function useStorageUsage() {
  const [usage, setUsage] = useState({ used: 0, quota: 0, percentage: 0 })

  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        const used = estimate.usage || 0
        const quota = estimate.quota || 0
        const percentage = quota > 0 ? (used / quota) * 100 : 0

        setUsage({ used, quota, percentage })
      })
    }
  }, [])

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  return {
    ...usage,
    usedFormatted: formatBytes(usage.used),
    quotaFormatted: formatBytes(usage.quota)
  }
}