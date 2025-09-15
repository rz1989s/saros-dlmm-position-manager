'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, Children, isValidElement, cloneElement } from 'react'
import { staggerContainer, fadeInUp } from '@/lib/animations'

interface StaggerListProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
  variant?: 'fade' | 'slideUp' | 'slideLeft' | 'scale'
  duration?: number
  once?: boolean
  onAnimationComplete?: () => void
}

export function StaggerList({
  children,
  staggerDelay = 0.1,
  className = '',
  variant = 'slideUp',
  duration = 0.3,
  once = true,
  onAnimationComplete
}: StaggerListProps) {
  const getItemVariant = () => {
    switch (variant) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        }
      case 'slideUp':
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 }
        }
      case 'slideLeft':
        return {
          initial: { opacity: 0, x: 30 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -30 }
        }
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 }
        }
      default:
        return fadeInUp
    }
  }

  const containerVariant = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    },
    exit: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  }

  const itemVariant = getItemVariant()

  return (
    <motion.div
      className={className}
      variants={containerVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      onAnimationComplete={onAnimationComplete}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child

        return (
          <motion.div
            key={child.key || index}
            variants={itemVariant}
            transition={{
              duration: duration,
              ease: 'easeOut'
            }}
          >
            {child}
          </motion.div>
        )
      })}
    </motion.div>
  )
}

interface AnimatedGridProps {
  children: ReactNode
  cols?: number
  gap?: number
  className?: string
  staggerDelay?: number
  animateOnMount?: boolean
}

export function AnimatedGrid({
  children,
  cols = 1,
  gap = 4,
  className = '',
  staggerDelay = 0.05,
  animateOnMount = true
}: AnimatedGridProps) {
  const gridClass = `grid grid-cols-${cols} gap-${gap} ${className}`

  const containerVariant = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: animateOnMount ? 0.2 : 0
      }
    }
  }

  const itemVariant = {
    initial: {
      opacity: 0,
      scale: 0.9,
      y: 20
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  }

  return (
    <motion.div
      className={gridClass}
      variants={containerVariant}
      initial={animateOnMount ? 'initial' : false}
      animate="animate"
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child

        return (
          <motion.div
            key={child.key || index}
            variants={itemVariant}
          >
            {child}
          </motion.div>
        )
      })}
    </motion.div>
  )
}

interface StaggerTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  staggerDelay?: number
}

export function StaggerText({
  text,
  className = '',
  delay = 0,
  duration = 0.3,
  staggerDelay = 0.03
}: StaggerTextProps) {
  const letters = text.split('')

  const containerVariant = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  }

  const letterVariant = {
    initial: {
      opacity: 0,
      y: 20
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: duration,
        ease: 'easeOut'
      }
    }
  }

  return (
    <motion.span
      className={className}
      variants={containerVariant}
      initial="initial"
      animate="animate"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterVariant}
          className="inline-block"
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.span>
  )
}

interface AnimatedListProps {
  items: Array<{ id: string | number; content: ReactNode }>
  className?: string
  itemClassName?: string
  onItemClick?: (id: string | number) => void
  animateHeight?: boolean
  variant?: 'fade' | 'slide' | 'scale'
}

export function AnimatedList({
  items,
  className = '',
  itemClassName = '',
  onItemClick,
  animateHeight = true,
  variant = 'slide'
}: AnimatedListProps) {
  const getVariants = () => {
    switch (variant) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        }
      case 'slide':
        return {
          initial: { opacity: 0, x: -20, height: animateHeight ? 0 : 'auto' },
          animate: { opacity: 1, x: 0, height: 'auto' },
          exit: { opacity: 0, x: 20, height: animateHeight ? 0 : 'auto' }
        }
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.8 }
        }
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        }
    }
  }

  const variants = getVariants()

  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
              layout: { duration: 0.2 }
            }}
            className={itemClassName}
            onClick={() => onItemClick?.(item.id)}
            style={animateHeight ? { overflow: 'hidden' } : undefined}
          >
            {item.content}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

interface RevealOnScrollProps {
  children: ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
  variant?: 'fade' | 'slideUp' | 'slideLeft' | 'scale'
  once?: boolean
}

export function RevealOnScroll({
  children,
  threshold = 0.1,
  rootMargin = '0px',
  className = '',
  variant = 'slideUp',
  once = true
}: RevealOnScrollProps) {
  const getVariants = () => {
    switch (variant) {
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }
      case 'slideUp':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 }
        }
      case 'slideLeft':
        return {
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 }
        }
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 }
        }
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }
    }
  }

  const variants = getVariants()

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ threshold, rootMargin, once }}
      variants={variants}
      transition={{
        duration: 0.6,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  )
}