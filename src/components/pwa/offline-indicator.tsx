'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNetworkStatus } from '@/hooks/use-pwa'

interface OfflineIndicatorProps {
  className?: string
  variant?: 'banner' | 'badge' | 'toast'
  showRetry?: boolean
}

export function OfflineIndicator({
  className = '',
  variant = 'banner',
  showRetry = true
}: OfflineIndicatorProps) {
  const { isOnline, retryCount, retry } = useNetworkStatus()

  const indicatorVariants = {
    banner: {
      initial: { y: -100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -100, opacity: 0 }
    },
    badge: {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0, opacity: 0 }
    },
    toast: {
      initial: { x: -400, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -400, opacity: 0 }
    }
  }

  const BannerContent = () => (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-40 ${className}`}
      variants={indicatorVariants.banner}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <Card className="rounded-none border-b border-red-200 bg-red-50/95 backdrop-blur-sm dark:border-red-800 dark:bg-red-950/95">
        <CardContent className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-medium text-sm text-red-900 dark:text-red-100">
                You&apos;re offline
              </p>
              <p className="text-xs text-red-700 dark:text-red-200">
                Some features may be limited. Cached data is being used.
              </p>
            </div>
          </div>

          {showRetry && (
            <Button
              size="sm"
              onClick={retry}
              variant="outline"
              className="gap-2 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-200 dark:hover:bg-red-900"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
              {retryCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 h-4 text-xs">
                  {retryCount}
                </Badge>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  const BadgeContent = () => (
    <motion.div
      variants={indicatorVariants.badge}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      <Badge
        variant="secondary"
        className="gap-1 bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
      >
        <WifiOff className="h-3 w-3" />
        Offline
      </Badge>
    </motion.div>
  )

  const ToastContent = () => (
    <motion.div
      className={`fixed bottom-4 left-4 z-50 ${className}`}
      variants={indicatorVariants.toast}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <Card className="w-80 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />

            <div className="flex-1 space-y-2">
              <div>
                <p className="font-medium text-sm text-red-900 dark:text-red-100">
                  Connection Lost
                </p>
                <p className="text-xs text-red-700 dark:text-red-200">
                  Working offline with cached data
                </p>
              </div>

              {showRetry && (
                <Button
                  size="sm"
                  onClick={retry}
                  variant="outline"
                  className="gap-2 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-200 dark:hover:bg-red-900"
                >
                  <RefreshCw className="h-3 w-3" />
                  Try Reconnecting
                  {retryCount > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1 h-4 text-xs">
                      {retryCount}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (isOnline) {
    return null
  }

  return (
    <AnimatePresence mode="wait">
      {variant === 'banner' && <BannerContent />}
      {variant === 'badge' && <BadgeContent />}
      {variant === 'toast' && <ToastContent />}
    </AnimatePresence>
  )
}

// Online status indicator
export function OnlineIndicator({ className = '' }: { className?: string }) {
  const { isOnline } = useNetworkStatus()

  return (
    <AnimatePresence>
      {isOnline && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className={className}
        >
          <Badge
            variant="secondary"
            className="gap-1 bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
          >
            <Wifi className="h-3 w-3" />
            Online
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Connection status with both online/offline states
export function ConnectionStatus({ className = '' }: { className?: string }) {
  const { isOnline, retryCount } = useNetworkStatus()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <AnimatePresence mode="wait">
        {isOnline ? (
          <motion.div
            key="online"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Badge
              variant="secondary"
              className="gap-1 bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
            >
              <Wifi className="h-3 w-3" />
              Connected
            </Badge>
          </motion.div>
        ) : (
          <motion.div
            key="offline"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Badge
              variant="secondary"
              className="gap-1 bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
            >
              <WifiOff className="h-3 w-3" />
              Offline
              {retryCount > 0 && (
                <span className="ml-1">({retryCount})</span>
              )}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Network quality indicator
export function NetworkQuality() {
  const { isOnline } = useNetworkStatus()

  // In a real app, you might detect connection quality
  const quality = isOnline ? 'good' : 'offline'

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400'
      case 'good':
        return 'text-green-500 dark:text-green-300'
      case 'fair':
        return 'text-yellow-500 dark:text-yellow-300'
      case 'poor':
        return 'text-orange-500 dark:text-orange-300'
      case 'offline':
        return 'text-red-500 dark:text-red-300'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'offline':
        return <WifiOff className="h-4 w-4" />
      default:
        return <Wifi className="h-4 w-4" />
    }
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${getQualityColor(quality)}`}>
      {getQualityIcon(quality)}
      <span className="capitalize">{quality}</span>
    </div>
  )
}