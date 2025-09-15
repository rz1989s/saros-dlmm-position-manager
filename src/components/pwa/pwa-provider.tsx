'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { usePWAStatus } from '@/hooks/use-pwa'
import { InstallPrompt } from './install-prompt'
import { UpdatePrompt } from './update-prompt'
import { OfflineIndicator } from './offline-indicator'

interface PWAContextType {
  install: ReturnType<typeof usePWAStatus>['install']
  isOnline: boolean
  serviceWorker: ReturnType<typeof usePWAStatus>['serviceWorker']
  notifications: ReturnType<typeof usePWAStatus>['notifications']
  isPWAEnabled: boolean
  isAppLike: boolean
}

const PWAContext = createContext<PWAContextType | null>(null)

interface PWAProviderProps {
  children: ReactNode
  enableInstallPrompt?: boolean
  enableUpdatePrompt?: boolean
  enableOfflineIndicator?: boolean
  installPromptDelay?: number
}

export function PWAProvider({
  children,
  enableInstallPrompt = true,
  enableUpdatePrompt = true,
  enableOfflineIndicator = true,
  installPromptDelay = 5000
}: PWAProviderProps) {
  const pwaStatus = usePWAStatus()

  useEffect(() => {
    // Track PWA status changes
    console.log('[PWA] Status updated:', {
      isPWAEnabled: pwaStatus.isPWAEnabled,
      isAppLike: pwaStatus.isAppLike,
      isOnline: pwaStatus.isOnline,
      canInstall: pwaStatus.install.canPrompt
    })
  }, [pwaStatus])

  return (
    <PWAContext.Provider value={pwaStatus}>
      {children}

      {/* PWA UI Components */}
      {enableInstallPrompt && (
        <InstallPrompt
          variant="banner"
          showDelay={installPromptDelay}
          dismissible={true}
        />
      )}

      {enableUpdatePrompt && (
        <UpdatePrompt
          variant="toast"
          autoShow={true}
        />
      )}

      {enableOfflineIndicator && (
        <OfflineIndicator
          variant="banner"
          showRetry={true}
        />
      )}
    </PWAContext.Provider>
  )
}

export function usePWA() {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}

// PWA Status Display Component
export function PWAStatus() {
  const pwa = usePWA()

  return (
    <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
      <h4 className="font-medium">PWA Status</h4>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span>PWA Enabled:</span>
          <span className={pwa.isPWAEnabled ? 'text-green-600' : 'text-red-600'}>
            {pwa.isPWAEnabled ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>App-like:</span>
          <span className={pwa.isAppLike ? 'text-green-600' : 'text-gray-600'}>
            {pwa.isAppLike ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Online:</span>
          <span className={pwa.isOnline ? 'text-green-600' : 'text-red-600'}>
            {pwa.isOnline ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Installable:</span>
          <span className={pwa.install.canPrompt ? 'text-green-600' : 'text-gray-600'}>
            {pwa.install.canPrompt ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>SW Ready:</span>
          <span className={pwa.serviceWorker.registration ? 'text-green-600' : 'text-red-600'}>
            {pwa.serviceWorker.registration ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Notifications:</span>
          <span className={
            pwa.notifications.permission === 'granted'
              ? 'text-green-600'
              : pwa.notifications.permission === 'denied'
              ? 'text-red-600'
              : 'text-yellow-600'
          }>
            {pwa.notifications.permission}
          </span>
        </div>
      </div>

      {pwa.install.platform && (
        <div className="text-xs text-muted-foreground">
          Platform: {pwa.install.platform}
        </div>
      )}
    </div>
  )
}