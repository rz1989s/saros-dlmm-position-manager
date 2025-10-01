'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone, Monitor, Tablet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useInstallPrompt } from '@/hooks/use-pwa'

interface InstallPromptProps {
  className?: string
  variant?: 'banner' | 'modal' | 'inline'
  showDelay?: number
  dismissible?: boolean
  onInstall?: () => void
  onDismiss?: () => void
}

export function InstallPrompt({
  className = '',
  variant = 'banner',
  showDelay = 3000,
  dismissible = true,
  onInstall,
  onDismiss
}: InstallPromptProps) {
  const { canPrompt, platform, promptInstall, isInstalled } = useInstallPrompt()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Check localStorage for dismissal state on mount
  useEffect(() => {
    const dismissedUntil = localStorage.getItem('pwa-install-dismissed-until')
    if (dismissedUntil) {
      const expiryTime = parseInt(dismissedUntil, 10)
      if (Date.now() < expiryTime) {
        setIsDismissed(true)
      } else {
        // Expired, remove the item
        localStorage.removeItem('pwa-install-dismissed-until')
      }
    }
  }, [])

  useEffect(() => {
    if (canPrompt && !isDismissed && !isInstalled) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, showDelay)

      return () => clearTimeout(timer)
    }

    // Return undefined for the else case to satisfy TS7030
    return undefined
  }, [canPrompt, isDismissed, isInstalled, showDelay])

  const handleInstall = async () => {
    const success = await promptInstall()
    if (success) {
      onInstall?.()
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)

    // Persist dismissal for 7 days
    const dismissUntil = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days in milliseconds
    localStorage.setItem('pwa-install-dismissed-until', dismissUntil.toString())

    onDismiss?.()
  }

  const getPlatformIcon = () => {
    switch (platform) {
      case 'android':
      case 'ios':
        return <Smartphone className="h-5 w-5" />
      case 'windows':
      case 'macos':
      case 'linux':
        return <Monitor className="h-5 w-5" />
      default:
        return <Tablet className="h-5 w-5" />
    }
  }

  const getBenefits = () => {
    const baseBenefits = [
      'Faster loading and better performance',
      'Works offline for core features',
      'Native app-like experience'
    ]

    const platformBenefits = {
      android: [
        'Add to home screen',
        'Push notifications',
        'Full screen experience'
      ],
      ios: [
        'Add to home screen',
        'Safari integration',
        'Status bar integration'
      ],
      default: [
        'Desktop shortcut',
        'Taskbar integration',
        'System notifications'
      ]
    }

    return [...baseBenefits, ...(platformBenefits[platform as keyof typeof platformBenefits] || platformBenefits.default)]
  }

  if (!isVisible || isInstalled) {
    return null
  }

  const promptVariants = {
    banner: {
      initial: { y: -100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -100, opacity: 0 }
    },
    modal: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 }
    },
    inline: {
      initial: { height: 0, opacity: 0 },
      animate: { height: 'auto', opacity: 1 },
      exit: { height: 0, opacity: 0 }
    }
  }

  const BannerContent = () => (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-50 ${className}`}
      variants={promptVariants.banner}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <Card className="rounded-none border-b border-border bg-background/95 backdrop-blur-sm">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {getPlatformIcon()}
            <div>
              <p className="font-medium text-sm">Install Saros DLMM</p>
              <p className="text-xs text-muted-foreground">
                Get the full app experience
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleInstall}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Install
            </Button>

            {dismissible && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const ModalContent = () => (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        variants={promptVariants.modal}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <Card className={`w-full max-w-md ${className}`}>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {getPlatformIcon()}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Install Saros DLMM</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get the best experience with our native app
                </p>
              </div>

              <div className="text-left space-y-2">
                <p className="text-sm font-medium">Benefits:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {getBenefits().map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={handleInstall}
                >
                  <Download className="h-4 w-4" />
                  Install App
                </Button>

                {dismissible && (
                  <Button
                    variant="outline"
                    onClick={handleDismiss}
                  >
                    Not Now
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )

  const InlineContent = () => (
    <motion.div
      className={className}
      variants={promptVariants.inline}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <Card className="border-dashed border-primary/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {getPlatformIcon()}
            </div>

            <div className="flex-1 space-y-2">
              <div>
                <h4 className="font-medium">Install as App</h4>
                <p className="text-sm text-muted-foreground">
                  Add to your {platform === 'ios' || platform === 'android' ? 'home screen' : 'desktop'} for quick access
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="gap-2"
                >
                  <Download className="h-3 w-3" />
                  Install
                </Button>

                {dismissible && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <AnimatePresence mode="wait">
      {variant === 'banner' && <BannerContent />}
      {variant === 'modal' && <ModalContent />}
      {variant === 'inline' && <InlineContent />}
    </AnimatePresence>
  )
}

// Compact install button
interface InstallButtonProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
}

export function InstallButton({
  className = '',
  size = 'md',
  variant = 'default'
}: InstallButtonProps) {
  const { canPrompt, promptInstall, isInstalled } = useInstallPrompt()

  if (!canPrompt || isInstalled) {
    return null
  }

  // Map size to valid Button sizes
  const buttonSize = size === 'md' ? 'default' : size

  return (
    <Button
      size={buttonSize}
      variant={variant}
      onClick={promptInstall}
      className={`gap-2 ${className}`}
    >
      <Download className="h-4 w-4" />
      Install App
    </Button>
  )
}

// Install status indicator
export function InstallStatus() {
  const { isInstalled, isStandalone, platform } = useInstallPrompt()

  if (!isInstalled && !isStandalone) {
    return null
  }

  const getStatusIcon = () => {
    switch (platform) {
      case 'android':
      case 'ios':
        return <Smartphone className="h-3 w-3" />
      case 'windows':
      case 'macos':
      case 'linux':
        return <Monitor className="h-3 w-3" />
      default:
        return <Tablet className="h-3 w-3" />
    }
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {getStatusIcon()}
      <span>Running as installed app</span>
    </div>
  )
}

