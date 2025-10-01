'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useState } from 'react'
import { Plus, X } from 'lucide-react'

interface FABProps {
  icon?: ReactNode
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'accent'
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left'
  offset?: { x?: number; y?: number }
  disabled?: boolean
  children?: ReactNode
}

export function FloatingActionButton({
  icon = <Plus className="h-6 w-6" />,
  onClick,
  className = '',
  size = 'md',
  variant = 'primary',
  position = 'bottom-right',
  offset = { x: 16, y: 16 },
  disabled = false,
  children
}: FABProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-12 w-12'
      case 'md':
        return 'h-14 w-14'
      case 'lg':
        return 'h-16 w-16'
      default:
        return 'h-14 w-14'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-saros-primary hover:bg-saros-primary/90 text-white shadow-lg'
      case 'secondary':
        return 'bg-saros-secondary hover:bg-saros-secondary/90 text-white shadow-lg'
      case 'accent':
        return 'bg-saros-accent hover:bg-saros-accent/90 text-white shadow-lg'
      default:
        return 'bg-saros-primary hover:bg-saros-primary/90 text-white shadow-lg'
    }
  }

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50'
    switch (position) {
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`
      case 'top-right':
        return `${baseClasses} top-4 right-4`
      case 'top-left':
        return `${baseClasses} top-4 left-4`
      default:
        return `${baseClasses} bottom-4 right-4`
    }
  }

  const fabVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  }

  const style = {
    transform: `translate(${offset.x || 0}px, ${offset.y || 0}px)`
  }

  return (
    <motion.button
      className={`
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${getPositionClasses()}
        rounded-full flex items-center justify-center
        transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
        ${className}
      `}
      style={style}
      variants={fabVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : "tap"}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children || icon}
    </motion.button>
  )
}

interface ExpandableFABProps {
  mainIcon?: ReactNode
  actions: Array<{
    icon: ReactNode
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'accent'
  }>
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'accent'
}

export function ExpandableFAB({
  mainIcon = <Plus className="h-6 w-6" />,
  actions,
  className = '',
  position = 'bottom-right',
  size = 'md',
  variant = 'primary'
}: ExpandableFABProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const actionVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
      y: 20
    },
    visible: () => ({
      scale: 1,
      opacity: 1,
      y: 0
    })
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const mainButtonVariants = {
    closed: { rotate: 0 },
    open: { rotate: 45 }
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <AnimatePresence>
        {isExpanded && (
          <div className={`fixed z-50 ${position === 'bottom-right' ? 'bottom-20 right-4' : 'bottom-20 left-4'}`}>
            <div className="flex flex-col-reverse gap-3">
              {actions.map((action, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3"
                  custom={index}
                  variants={actionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 400,
                    damping: 25
                  }}
                >
                  {/* Label */}
                  <motion.div
                    className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg"
                    initial={{ opacity: 0, x: position === 'bottom-right' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: position === 'bottom-right' ? 20 : -20 }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                  >
                    <span className="text-sm font-medium whitespace-nowrap">
                      {action.label}
                    </span>
                  </motion.div>

                  {/* Action Button */}
                  <FloatingActionButton
                    icon={action.icon}
                    onClick={() => {
                      action.onClick()
                      setIsExpanded(false)
                    }}
                    size="sm"
                    variant={action.variant || 'secondary'}
                    position="bottom-right"
                    className="relative"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <FloatingActionButton
        icon={
          <motion.div variants={mainButtonVariants} animate={isExpanded ? 'open' : 'closed'}>
            {isExpanded ? <X className="h-6 w-6" /> : mainIcon}
          </motion.div>
        }
        onClick={() => setIsExpanded(!isExpanded)}
        className={className}
        position={position}
        size={size}
        variant={variant}
      />
    </>
  )
}

interface SpeedDialFABProps {
  mainIcon?: ReactNode
  actions: Array<{
    icon: ReactNode
    label: string
    onClick: () => void
    color?: string
  }>
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
  buttonClassName?: string
}

export function SpeedDialFAB({
  mainIcon = <Plus className="h-6 w-6" />,
  actions,
  direction = 'up',
  className = '',
  buttonClassName = ''
}: SpeedDialFABProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getActionPosition = (index: number) => {
    const distance = 60 + index * 60
    switch (direction) {
      case 'up':
        return { y: -distance, x: 0 }
      case 'down':
        return { y: distance, x: 0 }
      case 'left':
        return { x: -distance, y: 0 }
      case 'right':
        return { x: distance, y: 0 }
      default:
        return { y: -distance, x: 0 }
    }
  }

  const actionVariants = {
    closed: {
      scale: 0,
      opacity: 0,
      x: 0,
      y: 0
    },
    open: (index: number) => {
      const position = getActionPosition(index)
      return {
        scale: 1,
        opacity: 1,
        x: position.x,
        y: position.y
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Action Buttons */}
      <AnimatePresence>
        {actions.map((action, index) => (
          <motion.button
            key={index}
            className={`absolute h-12 w-12 rounded-full bg-background border border-border shadow-lg flex items-center justify-center z-40 ${buttonClassName}`}
            custom={index}
            variants={actionVariants}
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            exit="closed"
            transition={{
              delay: index * 0.1,
              type: 'spring',
              stiffness: 400,
              damping: 25
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              action.onClick()
              setIsOpen(false)
            }}
            style={{ color: action.color }}
          >
            {action.icon}
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Main Button */}
      <FloatingActionButton
        icon={
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {mainIcon}
          </motion.div>
        }
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50"
      />
    </div>
  )
}