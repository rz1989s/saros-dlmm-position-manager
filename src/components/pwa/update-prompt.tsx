'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useUpdatePrompt } from '@/hooks/use-pwa'

interface UpdatePromptProps {
  className?: string
  variant?: 'banner' | 'toast' | 'modal'
  autoShow?: boolean
}

export function UpdatePrompt({
  className = '',
  variant = 'toast',
  autoShow = true
}: UpdatePromptProps) {
  const { showPrompt, handleUpdate, handleDismiss } = useUpdatePrompt()

  if (!autoShow || !showPrompt) {
    return null
  }

  const promptVariants = {
    banner: {
      initial: { y: -100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -100, opacity: 0 }
    },
    toast: {
      initial: { x: 400, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 400, opacity: 0 }
    },
    modal: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 }
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
      <Card className="rounded-none border-b border-amber-200 bg-amber-50/95 backdrop-blur-sm dark:border-amber-800 dark:bg-amber-950/95">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-medium text-sm text-amber-900 dark:text-amber-100">
                App Update Available
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-200">
                New features and improvements are ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Update
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-amber-700 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const ToastContent = () => (
    <motion.div
      className={`fixed bottom-4 right-4 z-50 ${className}`}
      variants={promptVariants.toast}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <Card className="w-80 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />

            <div className="flex-1 space-y-2">
              <div>
                <p className="font-medium text-sm text-amber-900 dark:text-amber-100">
                  Update Available
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-200">
                  A new version with improvements is ready to install
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <RefreshCw className="h-3 w-3" />
                  Update Now
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-amber-700 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900"
                >
                  Later
                </Button>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="p-1 h-auto text-amber-700 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900"
            >
              <X className="h-4 w-4" />
            </Button>
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
                <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Update Available</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A new version of the app is ready with latest features and improvements
                </p>
              </div>

              <div className="text-left space-y-2">
                <p className="text-sm font-medium">What's New:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Performance improvements
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Bug fixes and stability updates
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Enhanced user experience
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={handleUpdate}
                >
                  <RefreshCw className="h-4 w-4" />
                  Update Now
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDismiss}
                >
                  Update Later
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )

  return (
    <AnimatePresence mode="wait">
      {variant === 'banner' && <BannerContent />}
      {variant === 'toast' && <ToastContent />}
      {variant === 'modal' && <ModalContent />}
    </AnimatePresence>
  )
}

// Manual update button for settings
export function UpdateButton() {
  const { showPrompt, handleUpdate } = useUpdatePrompt()

  if (!showPrompt) {
    return null
  }

  return (
    <Button
      onClick={handleUpdate}
      variant="outline"
      className="gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      Update Available
    </Button>
  )
}