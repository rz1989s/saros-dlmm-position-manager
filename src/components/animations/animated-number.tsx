'use client'

import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import { numberChange, priceChange } from '@/lib/animations'

interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  animateOnChange?: boolean
  showPriceChange?: boolean
  previousValue?: number
}

export function AnimatedNumber({
  value,
  duration = 0.5,
  decimals = 2,
  prefix = '',
  suffix = '',
  className = '',
  animateOnChange = true,
  showPriceChange = false,
  previousValue
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const springValue = useSpring(value, { duration })
  const transformed = useTransform(springValue, (latest) =>
    (prefix + latest.toFixed(decimals) + suffix).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  )

  const getPriceChangeVariant = (): string => {
    if (!showPriceChange || previousValue === undefined) return 'initial'

    if (value > previousValue) {
      return 'positive'
    } else if (value < previousValue) {
      return 'negative'
    }
    return 'initial'
  }

  useEffect(() => {
    if (value !== displayValue) {
      springValue.set(value)
      setDisplayValue(value)
    }
  }, [value, displayValue, springValue])

  if (!animateOnChange) {
    return (
      <span className={className}>
        {(prefix + value.toFixed(decimals) + suffix).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      </span>
    )
  }

  return (
    <motion.span
      className={className}
      variants={showPriceChange ? priceChange : numberChange}
      animate={showPriceChange ? (value !== previousValue ? getPriceChangeVariant() : 'initial') : 'animate'}
      key={value} // Re-trigger animation on value change
    >
      <motion.span>{transformed}</motion.span>
    </motion.span>
  )
}

interface CounterProps {
  from?: number
  to: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  onComplete?: () => void
}

export function AnimatedCounter({
  from = 0,
  to,
  duration = 1,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  onComplete
}: CounterProps) {
  const [count, setCount] = useState(from)
  const springValue = useSpring(from, {
    duration: duration * 1000
  })

  const transformed = useTransform(springValue, (latest) => {
    const value = latest.toFixed(decimals)
    return (prefix + value + suffix).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  })

  useEffect(() => {
    springValue.set(to)
    setCount(to)

    if (onComplete) {
      const timer = setTimeout(onComplete, duration * 1000)
      return () => clearTimeout(timer)
    }
  }, [to, springValue, onComplete, duration])

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {transformed}
    </motion.span>
  )
}

interface ProgressNumberProps {
  current: number
  total: number
  label?: string
  className?: string
  showPercentage?: boolean
  animated?: boolean
}

export function ProgressNumber({
  current,
  total,
  label,
  className = '',
  showPercentage = true,
  animated = true
}: ProgressNumberProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0
  const [displayPercentage, setDisplayPercentage] = useState(0)

  const springValue = useSpring(0, {
    duration: animated ? 800 : 0
  })

  const displayValue = useTransform(springValue, (latest) => {
    const rounded = Math.round(latest)
    setDisplayPercentage(rounded)
    return rounded
  })

  useEffect(() => {
    if (animated) {
      springValue.set(percentage)
    } else {
      setDisplayPercentage(percentage)
    }
  }, [percentage, springValue, animated])

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <span className="text-sm text-muted-foreground">{label}:</span>
      )}
      <motion.div
        className="flex items-center gap-1"
        initial={animated ? { opacity: 0, scale: 0.9 } : false}
        animate={animated ? { opacity: 1, scale: 1 } : false}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <span className="font-medium">
          {Math.round(displayPercentage * 100) / 100}
          {showPercentage ? '%' : ''}
        </span>
        <span className="text-xs text-muted-foreground">
          ({current.toLocaleString()}/{total.toLocaleString()})
        </span>
      </motion.div>
    </div>
  )
}

interface DeltaNumberProps {
  value: number
  delta: number
  deltaPercentage?: number
  prefix?: string
  suffix?: string
  className?: string
  showArrow?: boolean
  large?: boolean
}

export function DeltaNumber({
  value,
  delta,
  deltaPercentage,
  prefix = '',
  suffix = '',
  className = '',
  showArrow = true,
  large = false
}: DeltaNumberProps) {
  const isPositive = delta > 0
  const isNegative = delta < 0
  const isNeutral = delta === 0

  const colorClass = isPositive
    ? 'text-green-600'
    : isNegative
    ? 'text-red-600'
    : 'text-muted-foreground'

  const ArrowIcon = showArrow ? (
    isPositive ? (
      <motion.svg
        className="w-3 h-3"
        fill="currentColor"
        viewBox="0 0 20 20"
        initial={{ y: 2, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </motion.svg>
    ) : isNegative ? (
      <motion.svg
        className="w-3 h-3"
        fill="currentColor"
        viewBox="0 0 20 20"
        initial={{ y: -2, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <path
          fillRule="evenodd"
          d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </motion.svg>
    ) : null
  ) : null

  return (
    <div className={`flex flex-col ${className}`}>
      <motion.div
        className={large ? 'text-2xl font-bold' : 'text-lg font-semibold'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatedNumber
          value={value}
          prefix={prefix}
          suffix={suffix}
          animateOnChange={true}
        />
      </motion.div>

      {!isNeutral && (
        <motion.div
          className={`flex items-center gap-1 text-sm ${colorClass}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {ArrowIcon}
          <span>
            {isPositive ? '+' : ''}
            <AnimatedNumber
              value={Math.abs(delta)}
              prefix={prefix}
              suffix={suffix}
              animateOnChange={true}
            />
            {deltaPercentage !== undefined && (
              <>
                {' '}(
                <AnimatedNumber
                  value={Math.abs(deltaPercentage)}
                  suffix="%"
                  decimals={1}
                  animateOnChange={true}
                />
                )
              </>
            )}
          </span>
        </motion.div>
      )}
    </div>
  )
}