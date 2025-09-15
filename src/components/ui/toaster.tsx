'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastAction,
} from '@/components/ui/toast'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, AlertTriangle, Info, Loader2, X } from 'lucide-react'

interface ToasterProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  className?: string
}

export function Toaster({ position = 'top-right', className }: ToasterProps) {
  const { toasts } = useToast()

  const getIcon = (variant?: string) => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'destructive':
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case 'loading':
        return <Loader2 className="h-5 w-5 text-gray-600 dark:text-gray-400 animate-spin" />
      default:
        return null
    }
  }

  const getPositionClasses = (pos: string) => {
    switch (pos) {
      case 'top-left':
        return 'top-0 left-0 flex-col'
      case 'top-center':
        return 'top-0 left-1/2 transform -translate-x-1/2 flex-col'
      case 'top-right':
        return 'top-0 right-0 flex-col'
      case 'bottom-left':
        return 'bottom-0 left-0 flex-col-reverse'
      case 'bottom-center':
        return 'bottom-0 left-1/2 transform -translate-x-1/2 flex-col-reverse'
      case 'bottom-right':
        return 'bottom-0 right-0 flex-col-reverse'
      default:
        return 'top-0 right-0 flex-col'
    }
  }

  const containerVariants = {
    initial: {},
    animate: {},
    exit: {}
  }

  const toastVariants = {
    initial: (position: string) => {
      const isTop = position.includes('top')
      const isLeft = position.includes('left')
      const isRight = position.includes('right')

      return {
        opacity: 0,
        scale: 0.95,
        x: isLeft ? -300 : isRight ? 300 : 0,
        y: isTop ? -100 : 100
      }
    },
    animate: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.4
      }
    },
    exit: (position: string) => {
      const isTop = position.includes('top')
      const isLeft = position.includes('left')
      const isRight = position.includes('right')

      return {
        opacity: 0,
        scale: 0.95,
        x: isLeft ? -300 : isRight ? 300 : 0,
        y: isTop ? -100 : 100,
        transition: {
          duration: 0.2
        }
      }
    }
  }

  return (
    <ToastProvider duration={5000}>
      <AnimatePresence mode="popLayout">
        {toasts.map(function (toast) {
          const toastPosition = toast.position || position

          return (
            <motion.div
              key={toast.id}
              custom={toastPosition}
              variants={toastVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
              className={`fixed z-[100] pointer-events-none ${getPositionClasses(toastPosition)} p-4 max-w-[420px] w-full ${className}`}
              style={{
                // Ensure proper stacking for multiple toasts
                zIndex: 100 + parseInt(toast.id)
              }}
            >
              <Toast
                {...toast}
                className="pointer-events-auto group"
                onOpenChange={(open) => {
                  if (!open) {
                    toast.onDismiss?.()
                  }
                }}
              >
                <div className="flex items-start gap-3 flex-1">
                  {toast.showIcon !== false && getIcon(toast.variant)}

                  <div className="flex-1 space-y-1">
                    {toast.title && (
                      <ToastTitle>{toast.title}</ToastTitle>
                    )}
                    {toast.description && (
                      <ToastDescription>
                        {toast.description}
                      </ToastDescription>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {toast.action && (
                    <ToastAction
                      altText="Action"
                      onClick={toast.onAction}
                    >
                      {toast.action}
                    </ToastAction>
                  )}

                  <ToastClose onClick={toast.onDismiss} />
                </div>
              </Toast>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Traditional viewport for fallback */}
      <ToastViewport className="hidden" />
    </ToastProvider>
  )
}

// Multi-position toaster that can show toasts in different positions
export function MultiPositionToaster() {
  const { toasts } = useToast()
  const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const

  return (
    <ToastProvider duration={5000}>
      {positions.map(position => {
        const positionToasts = toasts.filter(toast => toast.position === position)

        if (positionToasts.length === 0) return null

        return (
          <div
            key={position}
            className={`fixed z-[100] pointer-events-none ${getPositionClasses(position)} p-4 max-w-[420px] w-full`}
          >
            <AnimatePresence mode="popLayout">
              {positionToasts.map(toast => (
                <motion.div
                  key={toast.id}
                  custom={position}
                  variants={{
                    initial: (pos: string) => {
                      const isTop = pos.includes('top')
                      const isLeft = pos.includes('left')
                      const isRight = pos.includes('right')

                      return {
                        opacity: 0,
                        scale: 0.95,
                        x: isLeft ? -300 : isRight ? 300 : 0,
                        y: isTop ? -100 : 100
                      }
                    },
                    animate: {
                      opacity: 1,
                      scale: 1,
                      x: 0,
                      y: 0,
                      transition: {
                        type: 'spring',
                        damping: 25,
                        stiffness: 300,
                        duration: 0.4
                      }
                    },
                    exit: (pos: string) => {
                      const isTop = pos.includes('top')
                      const isLeft = pos.includes('left')
                      const isRight = pos.includes('right')

                      return {
                        opacity: 0,
                        scale: 0.95,
                        x: isLeft ? -300 : isRight ? 300 : 0,
                        y: isTop ? -100 : 100,
                        transition: { duration: 0.2 }
                      }
                    }
                  }}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                  className="pointer-events-auto mb-2"
                >
                  <ToastComponent toast={toast} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      })}

      <ToastViewport className="hidden" />
    </ToastProvider>
  )
}

// Individual toast component
function ToastComponent({ toast }: { toast: any }) {
  const getIcon = (variant?: string) => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'destructive':
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case 'loading':
        return <Loader2 className="h-5 w-5 text-gray-600 dark:text-gray-400 animate-spin" />
      default:
        return null
    }
  }

  return (
    <Toast
      {...toast}
      onOpenChange={(open) => {
        if (!open) {
          toast.onDismiss?.()
        }
      }}
    >
      <div className="flex items-start gap-3 flex-1">
        {toast.showIcon !== false && getIcon(toast.variant)}

        <div className="flex-1 space-y-1">
          {toast.title && (
            <ToastTitle>{toast.title}</ToastTitle>
          )}
          {toast.description && (
            <ToastDescription>
              {toast.description}
            </ToastDescription>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {toast.action && (
          <ToastAction
            altText="Action"
            onClick={toast.onAction}
          >
            {toast.action}
          </ToastAction>
        )}

        <ToastClose onClick={toast.onDismiss} />
      </div>
    </Toast>
  )
}

function getPositionClasses(position: string) {
  switch (position) {
    case 'top-left':
      return 'top-0 left-0 flex-col'
    case 'top-center':
      return 'top-0 left-1/2 transform -translate-x-1/2 flex-col'
    case 'top-right':
      return 'top-0 right-0 flex-col'
    case 'bottom-left':
      return 'bottom-0 left-0 flex-col-reverse'
    case 'bottom-center':
      return 'bottom-0 left-1/2 transform -translate-x-1/2 flex-col-reverse'
    case 'bottom-right':
      return 'bottom-0 right-0 flex-col-reverse'
    default:
      return 'top-0 right-0 flex-col'
  }
}