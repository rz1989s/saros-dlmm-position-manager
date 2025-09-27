import { useCallback, useEffect, useRef, useMemo } from 'react'
import { logger } from '@/lib/logger'

export interface PerformanceOptions {
  enableDebounce?: boolean
  debounceMs?: number
  enableThrottle?: boolean
  throttleMs?: number
  enableMemoization?: boolean
  trackPerformance?: boolean
}

export function usePerformanceOptimization(options: PerformanceOptions = {}) {
  const {
    enableDebounce = false,
    debounceMs = 300,
    enableThrottle = false,
    throttleMs = 100,
    enableMemoization = true,
    trackPerformance = process.env.NODE_ENV === 'development'
  } = options

  const performanceMetrics = useRef({
    renderCount: 0,
    lastRenderTime: 0,
    totalRenderTime: 0,
    averageRenderTime: 0
  })

  // Track render performance
  useEffect(() => {
    if (trackPerformance) {
      const renderTime = performance.now() - performanceMetrics.current.lastRenderTime
      performanceMetrics.current.renderCount++
      performanceMetrics.current.totalRenderTime += renderTime
      performanceMetrics.current.averageRenderTime =
        performanceMetrics.current.totalRenderTime / performanceMetrics.current.renderCount

      if (renderTime > 16) { // More than one frame (60fps)
        logger.warn(`[Performance] Slow render detected: ${renderTime.toFixed(2)}ms`)
      }
    }
    performanceMetrics.current.lastRenderTime = performance.now()
  })

  // Shared refs for debounce and throttle
  const timeoutMapRef = useRef<Map<any, NodeJS.Timeout>>(new Map())
  const lastCallMapRef = useRef<Map<any, number>>(new Map())

  // Debounce function
  const debounce = useCallback(
    <T extends (...args: any[]) => any>(func: T, delay: number = debounceMs): T => {
      return ((...args: Parameters<T>) => {
        const existingTimeout = timeoutMapRef.current.get(func)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
        }
        const newTimeout = setTimeout(() => func(...args), delay)
        timeoutMapRef.current.set(func, newTimeout)
      }) as T
    },
    [debounceMs]
  )

  // Throttle function
  const throttle = useCallback(
    <T extends (...args: any[]) => any>(func: T, delay: number = throttleMs): T => {
      return ((...args: Parameters<T>) => {
        const now = Date.now()
        const lastCall = lastCallMapRef.current.get(func) || 0
        if (now - lastCall >= delay) {
          lastCallMapRef.current.set(func, now)
          return func(...args)
        }
      }) as T
    },
    [throttleMs]
  )

  // Memoized function wrapper
  const memoize = useCallback(
    <T extends (...args: any[]) => any>(func: T): T => {
      const cache = new Map()

      return ((...args: Parameters<T>) => {
        const key = JSON.stringify(args)

        if (cache.has(key)) {
          if (trackPerformance) {
            logger.cache.hit(key, 'function')
          }
          return cache.get(key)
        }

        if (trackPerformance) {
          logger.cache.miss(key, 'function')
        }

        const result = func(...args)
        cache.set(key, result)

        // Limit cache size to prevent memory leaks
        if (cache.size > 100) {
          const firstKey = cache.keys().next().value
          cache.delete(firstKey)
        }

        return result
      }) as T
    },
    [trackPerformance]
  )

  // Optimized function creator
  const optimizeFunction = useCallback(
    <T extends (...args: any[]) => any>(func: T, functionOptions?: PerformanceOptions): T => {
      let optimizedFunc = func

      if (functionOptions?.enableMemoization ?? enableMemoization) {
        optimizedFunc = memoize(optimizedFunc)
      }

      if (functionOptions?.enableDebounce ?? enableDebounce) {
        optimizedFunc = debounce(optimizedFunc, functionOptions?.debounceMs ?? debounceMs)
      }

      if (functionOptions?.enableThrottle ?? enableThrottle) {
        optimizedFunc = throttle(optimizedFunc, functionOptions?.throttleMs ?? throttleMs)
      }

      return optimizedFunc
    },
    [enableMemoization, enableDebounce, enableThrottle, memoize, debounce, throttle, debounceMs, throttleMs]
  )

  // Performance monitoring
  const getPerformanceMetrics = useCallback(() => {
    return {
      ...performanceMetrics.current,
      memoryUsage: typeof window !== 'undefined' && 'memory' in performance
        ? (performance as any).memory
        : null
    }
  }, [])

  // Log performance metrics
  const logPerformanceMetrics = useCallback(() => {
    if (trackPerformance) {
      const metrics = getPerformanceMetrics()
      logger.info('[Performance Metrics]', metrics)
    }
  }, [trackPerformance, getPerformanceMetrics])

  return {
    debounce,
    throttle,
    memoize,
    optimizeFunction,
    getPerformanceMetrics,
    logPerformanceMetrics
  }
}

// Specialized hook for RPC operations
export function useRpcPerformanceOptimization() {
  const performance = usePerformanceOptimization({
    enableThrottle: true,
    throttleMs: 500, // Throttle RPC calls to max 2 per second
    enableMemoization: true,
    trackPerformance: true
  })

  const optimizeRpcCall = useCallback(
    <T extends (...args: any[]) => Promise<any>>(rpcCall: T): T => {
      return performance.optimizeFunction(rpcCall, {
        enableThrottle: true,
        throttleMs: 500,
        enableMemoization: true
      })
    },
    [performance]
  )

  return {
    ...performance,
    optimizeRpcCall
  }
}

// Hook for UI performance optimization
export function useUIPerformanceOptimization() {
  const performance = usePerformanceOptimization({
    enableDebounce: true,
    debounceMs: 200,
    enableMemoization: true,
    trackPerformance: true
  })

  // Optimized handlers for common UI operations
  const optimizeInputHandler = useCallback(
    (handler: (value: string) => void) => {
      return performance.optimizeFunction(handler, {
        enableDebounce: true,
        debounceMs: 300
      })
    },
    [performance]
  )

  const optimizeScrollHandler = useCallback(
    (handler: (event: Event) => void) => {
      return performance.optimizeFunction(handler, {
        enableThrottle: true,
        throttleMs: 16 // 60fps
      })
    },
    [performance]
  )

  const optimizeResizeHandler = useCallback(
    (handler: (event: Event) => void) => {
      return performance.optimizeFunction(handler, {
        enableThrottle: true,
        throttleMs: 100
      })
    },
    [performance]
  )

  return {
    ...performance,
    optimizeInputHandler,
    optimizeScrollHandler,
    optimizeResizeHandler
  }
}

// Memory leak prevention hook
export function useMemoryLeakPrevention() {
  const activeTimeouts = useRef<Set<NodeJS.Timeout>>(new Set())
  const activeIntervals = useRef<Set<NodeJS.Timeout>>(new Set())
  const activeEventListeners = useRef<Array<{
    element: EventTarget
    event: string
    handler: EventListener
  }>>([])

  // Cleanup timeout helper
  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      activeTimeouts.current.delete(timeout)
      callback()
    }, delay)

    activeTimeouts.current.add(timeout)
    return timeout
  }, [])

  // Cleanup interval helper
  const safeSetInterval = useCallback((callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay)
    activeIntervals.current.add(interval)
    return interval
  }, [])

  // Cleanup event listener helper
  const safeAddEventListener = useCallback((
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options)
    activeEventListeners.current.push({ element, event, handler })
  }, [])

  // Cleanup all resources
  useEffect(() => {
    return () => {
      // Clear all timeouts
      activeTimeouts.current.forEach(timeout => clearTimeout(timeout))
      activeTimeouts.current.clear()

      // Clear all intervals
      activeIntervals.current.forEach(interval => clearInterval(interval))
      activeIntervals.current.clear()

      // Remove all event listeners
      activeEventListeners.current.forEach(({ element, event, handler }) => {
        try {
          element.removeEventListener(event, handler)
        } catch (error) {
          // Ignore cleanup errors
        }
      })
      activeEventListeners.current = []
    }
  }, [])

  return {
    safeSetTimeout,
    safeSetInterval,
    safeAddEventListener
  }
}