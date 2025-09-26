'use client'

import { useState } from 'react'
import {
  Smartphone,
  Bell,
  Trash2,
  RefreshCw,
  Wifi,
  HardDrive,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressIndicator } from '@/components/accessibility/accessible-components'
// Switch and Label components not available - implementing simple toggle with Button
import { useInstallPrompt, useNotifications, useCacheManager, useStorageUsage } from '@/hooks/use-pwa'
import { InstallButton, InstallStatus } from './install-prompt'
import { UpdateButton } from './update-prompt'
import { ConnectionStatus } from './offline-indicator'
import { PWAStatus } from './pwa-provider'

export function PWASettings() {
  const { canPrompt, isInstalled } = useInstallPrompt()
  const { permission, requestPermission, subscribeToPush } = useNotifications()
  const { clearCache, refreshCacheSize } = useCacheManager()
  const { percentage, usedFormatted, quotaFormatted } = useStorageUsage()

  const [notificationsEnabled, setNotificationsEnabled] = useState(permission === 'granted')
  const [isClearing, setIsClearing] = useState(false)

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const result = await requestPermission()
      if (result === 'granted') {
        await subscribeToPush()
        setNotificationsEnabled(true)
      } else {
        setNotificationsEnabled(false)
      }
    } else {
      setNotificationsEnabled(enabled)
    }
  }

  const handleClearCache = async () => {
    setIsClearing(true)
    try {
      await clearCache()
      await refreshCacheSize()
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* PWA Installation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            App Installation
          </CardTitle>
          <CardDescription>
            Install this web app on your device for a native app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Installation Status</p>
              <div className="flex items-center gap-2">
                {isInstalled ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Installed
                  </Badge>
                ) : canPrompt ? (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Available
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Not Available
                  </Badge>
                )}
                <InstallStatus />
              </div>
            </div>

            {canPrompt && <InstallButton size="sm" />}
          </div>

          {isInstalled && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✅ App is installed and ready to use offline
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Get notified about important position updates and market changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label htmlFor="notifications" className="font-medium">Enable Notifications</label>
              <p className="text-sm text-muted-foreground">
                Permission: <span className="capitalize">{permission}</span>
              </p>
            </div>
            <Button
              id="notifications"
              variant={notificationsEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => handleNotificationToggle(!notificationsEnabled)}
              disabled={permission === 'denied'}
            >
              {notificationsEnabled ? 'On' : 'Off'}
            </Button>
          </div>

          {permission === 'denied' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                Notifications are blocked. Please enable them in your browser settings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage & Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage & Cache
          </CardTitle>
          <CardDescription>
            Manage offline data storage and cache
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage Used</span>
              <span>{usedFormatted} of {quotaFormatted}</span>
            </div>
            <ProgressIndicator value={percentage} max={100} label="Storage Usage" showValue={false} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {percentage.toFixed(1)}% of available storage used
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Clear Cache</p>
              <p className="text-sm text-muted-foreground">
                Remove cached data to free up space
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              disabled={isClearing}
              className="gap-2"
            >
              {isClearing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isClearing ? 'Clearing...' : 'Clear Cache'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            Monitor your network connection and app updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Network Status</p>
              <p className="text-sm text-muted-foreground">
                Current connection state
              </p>
            </div>
            <ConnectionStatus />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">App Updates</p>
              <p className="text-sm text-muted-foreground">
                Check for app updates
              </p>
            </div>
            <UpdateButton />
          </div>
        </CardContent>
      </Card>

      {/* Advanced PWA Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Status
          </CardTitle>
          <CardDescription>
            Detailed PWA feature status and diagnostics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PWAStatus />
        </CardContent>
      </Card>
    </div>
  )
}

// Compact PWA controls for dashboard/header
export function PWAControls() {
  return (
    <div className="flex items-center gap-2">
      <ConnectionStatus className="text-xs" />
      <InstallButton size="sm" variant="ghost" />
      <UpdateButton />
    </div>
  )
}