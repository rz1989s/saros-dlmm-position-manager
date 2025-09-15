'use client'

import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { ReactNode, useState, useRef } from 'react'
import { Trash2, Archive, Star, MoreHorizontal, ArrowLeft, ArrowRight } from 'lucide-react'

interface SwipeAction {
  icon: ReactNode
  label: string
  color: string
  backgroundColor: string
  onAction: () => void
}

interface SwipeableCardProps {
  children: ReactNode
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  className?: string
  contentClassName?: string
  threshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  hapticFeedback?: boolean
  showIndicators?: boolean
  disabled?: boolean
}

export function SwipeableCard({
  children,
  leftActions = [],
  rightActions = [],
  className = '',
  contentClassName = '',
  threshold = 80,
  onSwipeLeft,
  onSwipeRight,
  hapticFeedback = true,
  showIndicators = true,
  disabled = false
}: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])
  const scale = useTransform(x, [-100, 0, 100], [0.95, 1, 0.95])

  const triggerHaptic = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  const handleDragStart = () => {
    if (disabled) return
    setIsDragging(true)
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return

    const { offset } = info
    const direction = offset.x > 0 ? 'right' : 'left'

    if (Math.abs(offset.x) > threshold && swipeDirection !== direction) {
      setSwipeDirection(direction)
      triggerHaptic()
    } else if (Math.abs(offset.x) <= threshold && swipeDirection) {
      setSwipeDirection(null)
    }
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return

    setIsDragging(false)
    setSwipeDirection(null)

    const { offset, velocity } = info
    const swipeThreshold = threshold
    const velocityThreshold = 500

    // Determine if swipe was strong enough
    const shouldSwipe = Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold

    if (shouldSwipe) {
      if (offset.x > 0 && rightActions.length > 0) {
        // Swiped right
        onSwipeRight?.()
        if (rightActions[0]) {
          rightActions[0].onAction()
        }
      } else if (offset.x < 0 && leftActions.length > 0) {
        // Swiped left
        onSwipeLeft?.()
        if (leftActions[0]) {
          leftActions[0].onAction()
        }
      }
    }

    // Reset position
    x.set(0)
  }

  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') => {
    if (actions.length === 0) return null

    return (
      <div
        className={`absolute top-0 bottom-0 flex items-center ${
          side === 'left' ? 'left-0' : 'right-0'
        }`}
      >
        {actions.map((action, index) => (
          <motion.div
            key={index}
            className="flex items-center justify-center h-full px-6"
            style={{ backgroundColor: action.backgroundColor, color: action.color }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isDragging && swipeDirection === side ? 1 : 0.7,
              scale: isDragging && swipeDirection === side ? 1.1 : 1
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center gap-1">
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  const cardVariants = {
    initial: { x: 0 },
    animate: { x: 0 }
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Left Actions */}
      {renderActions(leftActions, 'left')}

      {/* Right Actions */}
      {renderActions(rightActions, 'right')}

      {/* Swipe Indicators */}
      {showIndicators && !disabled && (
        <>
          {leftActions.length > 0 && (
            <motion.div
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none"
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: swipeDirection === 'left' ? 1 : 0,
                x: swipeDirection === 'left' ? 0 : -20
              }}
            >
              <ArrowLeft className="h-6 w-6 text-white" />
            </motion.div>
          )}

          {rightActions.length > 0 && (
            <motion.div
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none"
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: swipeDirection === 'right' ? 1 : 0,
                x: swipeDirection === 'right' ? 0 : 20
              }}
            >
              <ArrowRight className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </>
      )}

      {/* Card Content */}
      <motion.div
        ref={cardRef}
        className={`relative z-20 bg-background ${contentClassName}`}
        style={{ x, opacity, scale }}
        variants={cardVariants}
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

interface QuickSwipeCardProps {
  children: ReactNode
  onDelete?: () => void
  onArchive?: () => void
  onFavorite?: () => void
  className?: string
  deleteLabel?: string
  archiveLabel?: string
  favoriteLabel?: string
}

export function QuickSwipeCard({
  children,
  onDelete,
  onArchive,
  onFavorite,
  className = '',
  deleteLabel = 'Delete',
  archiveLabel = 'Archive',
  favoriteLabel = 'Favorite'
}: QuickSwipeCardProps) {
  const leftActions: SwipeAction[] = []
  const rightActions: SwipeAction[] = []

  if (onDelete) {
    leftActions.push({
      icon: <Trash2 className="h-5 w-5" />,
      label: deleteLabel,
      color: 'white',
      backgroundColor: '#ef4444',
      onAction: onDelete
    })
  }

  if (onArchive) {
    rightActions.push({
      icon: <Archive className="h-5 w-5" />,
      label: archiveLabel,
      color: 'white',
      backgroundColor: '#6b7280',
      onAction: onArchive
    })
  }

  if (onFavorite) {
    rightActions.push({
      icon: <Star className="h-5 w-5" />,
      label: favoriteLabel,
      color: 'white',
      backgroundColor: '#f59e0b',
      onAction: onFavorite
    })
  }

  return (
    <SwipeableCard
      leftActions={leftActions}
      rightActions={rightActions}
      className={className}
    >
      {children}
    </SwipeableCard>
  )
}

interface SwipeToRevealProps {
  children: ReactNode
  revealContent: ReactNode
  side?: 'left' | 'right'
  threshold?: number
  className?: string
  revealClassName?: string
}

export function SwipeToReveal({
  children,
  revealContent,
  side = 'right',
  threshold = 100,
  className = '',
  revealClassName = ''
}: SwipeToRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const x = useMotionValue(0)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info
    const shouldReveal = side === 'right' ? offset.x > threshold : offset.x < -threshold

    if (shouldReveal && !isRevealed) {
      setIsRevealed(true)
      x.set(side === 'right' ? 200 : -200)
    } else if (!shouldReveal && isRevealed) {
      setIsRevealed(false)
      x.set(0)
    } else if (!shouldReveal) {
      x.set(0)
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Reveal Content */}
      <div className={`absolute inset-0 ${revealClassName}`}>
        {revealContent}
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 bg-background"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: side === 'left' ? -200 : 0, right: side === 'right' ? 200 : 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

interface SwipeableListItemProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftContent?: ReactNode
  rightContent?: ReactNode
  className?: string
  threshold?: number
}

export function SwipeableListItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftContent,
  rightContent,
  className = '',
  threshold = 60
}: SwipeableListItemProps) {
  const x = useMotionValue(0)
  const leftOpacity = useTransform(x, [0, threshold], [0, 1])
  const rightOpacity = useTransform(x, [-threshold, 0], [1, 0])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info

    if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }

    x.set(0)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Left Content */}
      {leftContent && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 flex items-center justify-start px-4"
          style={{ opacity: leftOpacity }}
        >
          {leftContent}
        </motion.div>
      )}

      {/* Right Content */}
      {rightContent && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 flex items-center justify-end px-4"
          style={{ opacity: rightOpacity }}
        >
          {rightContent}
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="relative z-10 bg-background"
      >
        {children}
      </motion.div>
    </div>
  )
}