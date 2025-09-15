'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { pageFade, pageSlideLeft, pageSlideRight } from '@/lib/animations'

interface PageTransitionProps {
  children: ReactNode
  pathname: string
  direction?: 'left' | 'right' | 'fade'
  duration?: number
  className?: string
}

export function PageTransition({
  children,
  pathname,
  direction = 'fade',
  duration = 0.3,
  className = ''
}: PageTransitionProps) {
  const getVariants = () => {
    switch (direction) {
      case 'left':
        return pageSlideLeft
      case 'right':
        return pageSlideRight
      case 'fade':
      default:
        return pageFade
    }
  }

  const variants = getVariants()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className={className}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration,
          ease: 'easeInOut'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

interface RouteTransitionProps {
  children: ReactNode
  routeKey: string
  className?: string
}

export function RouteTransition({
  children,
  routeKey,
  className = ''
}: RouteTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

interface TabTransitionProps {
  children: ReactNode
  activeTab: string
  className?: string
  direction?: 'horizontal' | 'vertical'
}

export function TabTransition({
  children,
  activeTab,
  className = '',
  direction = 'horizontal'
}: TabTransitionProps) {
  const variants = {
    initial: {
      opacity: 0,
      x: direction === 'horizontal' ? 20 : 0,
      y: direction === 'vertical' ? 20 : 0
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0
    },
    exit: {
      opacity: 0,
      x: direction === 'horizontal' ? -20 : 0,
      y: direction === 'vertical' ? -20 : 0
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        className={className}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: 0.25,
          ease: 'easeInOut'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

interface ModalTransitionProps {
  children: ReactNode
  isOpen: boolean
  className?: string
  backdropClassName?: string
  onBackdropClick?: () => void
  variant?: 'fade' | 'scale' | 'slideUp' | 'slideDown'
}

export function ModalTransition({
  children,
  isOpen,
  className = '',
  backdropClassName = '',
  onBackdropClick,
  variant = 'scale'
}: ModalTransitionProps) {
  const getContentVariants = () => {
    switch (variant) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        }
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 }
        }
      case 'slideUp':
        return {
          initial: { opacity: 0, y: 50, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 50, scale: 0.95 }
        }
      case 'slideDown':
        return {
          initial: { opacity: 0, y: -50, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -50, scale: 0.95 }
        }
      default:
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 }
        }
    }
  }

  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const contentVariants = getContentVariants()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={`fixed inset-0 bg-black/50 z-40 ${backdropClassName}`}
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onBackdropClick}
          />

          {/* Modal Content */}
          <motion.div
            className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${className}`}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3,
              ease: 'easeOut'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onBackdropClick?.()
              }
            }}
          >
            <div onClick={(e) => e.stopPropagation()}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface DrawerTransitionProps {
  children: ReactNode
  isOpen: boolean
  side?: 'left' | 'right' | 'top' | 'bottom'
  className?: string
  backdropClassName?: string
  onBackdropClick?: () => void
  width?: string | number
  height?: string | number
}

export function DrawerTransition({
  children,
  isOpen,
  side = 'right',
  className = '',
  backdropClassName = '',
  onBackdropClick,
  width = '320px',
  height = '100%'
}: DrawerTransitionProps) {
  const getDrawerVariants = () => {
    switch (side) {
      case 'left':
        return {
          initial: { x: '-100%' },
          animate: { x: 0 },
          exit: { x: '-100%' }
        }
      case 'right':
        return {
          initial: { x: '100%' },
          animate: { x: 0 },
          exit: { x: '100%' }
        }
      case 'top':
        return {
          initial: { y: '-100%' },
          animate: { y: 0 },
          exit: { y: '-100%' }
        }
      case 'bottom':
        return {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' }
        }
      default:
        return {
          initial: { x: '100%' },
          animate: { x: 0 },
          exit: { x: '100%' }
        }
    }
  }

  const getDrawerStyles = () => {
    const baseStyles = 'fixed bg-background border shadow-lg z-50'

    switch (side) {
      case 'left':
        return `${baseStyles} left-0 top-0 bottom-0 border-r`
      case 'right':
        return `${baseStyles} right-0 top-0 bottom-0 border-l`
      case 'top':
        return `${baseStyles} top-0 left-0 right-0 border-b`
      case 'bottom':
        return `${baseStyles} bottom-0 left-0 right-0 border-t`
      default:
        return `${baseStyles} right-0 top-0 bottom-0 border-l`
    }
  }

  const getDrawerSize = () => {
    if (side === 'left' || side === 'right') {
      return { width, height: '100%' }
    } else {
      return { width: '100%', height }
    }
  }

  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const drawerVariants = getDrawerVariants()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={`fixed inset-0 bg-black/50 z-40 ${backdropClassName}`}
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onBackdropClick}
          />

          {/* Drawer */}
          <motion.div
            className={`${getDrawerStyles()} ${className}`}
            style={getDrawerSize()}
            variants={drawerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3,
              ease: 'easeOut'
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}