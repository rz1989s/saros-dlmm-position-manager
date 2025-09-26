'use client'

import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  description?: string
  snapPoints?: number[]
  initialSnap?: number
  onSnapChange?: (snap: number) => void
  showHandle?: boolean
  showCloseButton?: boolean
  className?: string
  contentClassName?: string
  maxHeight?: string | number
  preventBodyScroll?: boolean
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  description,
  snapPoints = [0.3, 0.7, 0.95],
  initialSnap = 1,
  onSnapChange,
  showHandle = true,
  showCloseButton = true,
  className = '',
  contentClassName = '',
  maxHeight = '95vh',
  preventBodyScroll = true
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap)
  const sheetRef = useRef<HTMLDivElement>(null)
  const [, setIsDragging] = useState(false)

  useEffect(() => {
    if (preventBodyScroll && isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
    return undefined
  }, [isOpen, preventBodyScroll])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info
    const height = window.innerHeight
    const currentY = height * (1 - snapPoints[currentSnap])

    // Determine new snap point based on drag distance and velocity
    let newSnapIndex = currentSnap

    if (Math.abs(velocity.y) > 500) {
      // Fast drag
      newSnapIndex = velocity.y > 0 ? Math.max(0, currentSnap - 1) : Math.min(snapPoints.length - 1, currentSnap + 1)
    } else {
      // Slow drag - find closest snap point
      const newY = currentY + offset.y
      const newPosition = 1 - (newY / height)

      let closestIndex = 0
      let closestDistance = Math.abs(snapPoints[0] - newPosition)

      snapPoints.forEach((snap, index) => {
        const distance = Math.abs(snap - newPosition)
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      newSnapIndex = closestIndex
    }

    // Close if dragged to first snap point (0) or below
    if (newSnapIndex === 0 || snapPoints[newSnapIndex] < 0.1) {
      onClose()
      return
    }

    setCurrentSnap(newSnapIndex)
    onSnapChange?.(newSnapIndex)
    setIsDragging(false)
  }

  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const sheetVariants = {
    initial: {
      y: '100%'
    },
    animate: {
      y: `${(1 - snapPoints[currentSnap]) * 100}%`
    },
    exit: {
      y: '100%'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            className={`fixed inset-x-0 bottom-0 bg-background border-t border-border rounded-t-xl shadow-2xl z-50 flex flex-col ${className}`}
            style={{ maxHeight }}
            variants={sheetVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            dragMomentum={false}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-border">
              {/* Drag Handle */}
              {showHandle && (
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-1 bg-muted rounded-full" />
                </div>
              )}

              {/* Title and Close Button */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {title && (
                    <h3 className="text-lg font-semibold leading-6">{title}</h3>
                  )}
                  {description && (
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                  )}
                </div>

                {showCloseButton && (
                  <motion.button
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                    onClick={onClose}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-y-auto ${contentClassName}`}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface BottomSheetTriggerProps {
  children: ReactNode
  bottomSheet: ReactNode
  title?: string
  description?: string
  snapPoints?: number[]
  className?: string
}

export function BottomSheetTrigger({
  children,
  bottomSheet,
  title,
  description,
  snapPoints,
  className = ''
}: BottomSheetTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div
        className={`cursor-pointer ${className}`}
        onClick={() => setIsOpen(true)}
      >
        {children}
      </div>

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        description={description}
        snapPoints={snapPoints}
      >
        {bottomSheet}
      </BottomSheet>
    </>
  )
}

interface QuickActionsBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  actions: Array<{
    icon: ReactNode
    label: string
    description?: string
    onClick: () => void
    variant?: 'default' | 'destructive'
  }>
}

export function QuickActionsBottomSheet({
  isOpen,
  onClose,
  actions
}: QuickActionsBottomSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Actions"
      snapPoints={[0.4]}
      initialSnap={0}
    >
      <div className="p-4 space-y-2">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            className={`w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-colors ${
              action.variant === 'destructive'
                ? 'border-red-200 hover:bg-red-50 text-red-600'
                : 'border-border hover:bg-muted'
            }`}
            onClick={() => {
              action.onClick()
              onClose()
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex-shrink-0">
              {action.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium">{action.label}</div>
              {action.description && (
                <div className="text-sm text-muted-foreground">
                  {action.description}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </BottomSheet>
  )
}