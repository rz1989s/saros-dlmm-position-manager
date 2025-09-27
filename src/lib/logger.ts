// Enhanced logging utility with environment awareness and error tracking
// Only logs in development, reduces noise in production builds

const isDevelopment = process.env.NODE_ENV === 'development'
const isServer = typeof window === 'undefined'

interface PerformanceMetrics {
  rpcCalls: number
  cacheHits: number
  cacheMisses: number
  errors: number
  startTime: number
}

class Logger {
  private metrics: PerformanceMetrics = {
    rpcCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0,
    startTime: Date.now()
  }

  info(...args: any[]) {
    if (isDevelopment) {
      console.log(`[${new Date().toISOString()}]`, ...args)
    }
  }

  warn(...args: any[]) {
    if (isDevelopment) {
      console.warn(`[${new Date().toISOString()}]`, ...args)
    }
  }

  error(...args: any[]) {
    // Always log errors, even in production
    this.metrics.errors++
    console.error(`[${new Date().toISOString()}] ERROR:`, ...args)

    // Track error for analytics in production
    if (!isDevelopment && typeof window !== 'undefined') {
      this.trackError(args[0])
    }
  }

  debug(...args: any[]) {
    if (isDevelopment && !isServer) {
      console.log(`[${new Date().toISOString()}] DEBUG:`, ...args)
    }
  }

  // Special logger for build-time initialization (always silent during SSG)
  init(...args: any[]) {
    if (isDevelopment && !isServer) {
      console.log(`[${new Date().toISOString()}] INIT:`, ...args)
    }
  }

  // Performance tracking methods
  trackRpcCall() {
    this.metrics.rpcCalls++
    if (isDevelopment) {
      console.log(`[METRICS] RPC calls: ${this.metrics.rpcCalls}`)
    }
  }

  trackCacheHit() {
    this.metrics.cacheHits++
    if (isDevelopment) {
      console.log(`[METRICS] Cache hit (${this.metrics.cacheHits}/${this.metrics.cacheHits + this.metrics.cacheMisses})`)
    }
  }

  trackCacheMiss() {
    this.metrics.cacheMisses++
    if (isDevelopment) {
      console.log(`[METRICS] Cache miss (${this.metrics.cacheHits}/${this.metrics.cacheHits + this.metrics.cacheMisses})`)
    }
  }

  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime
    const cacheHitRate = this.metrics.cacheHits + this.metrics.cacheMisses > 0
      ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100).toFixed(1)
      : '0'

    return {
      ...this.metrics,
      uptime: Math.floor(uptime / 1000), // seconds
      cacheHitRate: `${cacheHitRate}%`
    }
  }

  logMetrics() {
    if (isDevelopment) {
      const metrics = this.getMetrics()
      console.table(metrics)
    }
  }

  // RPC-specific logging
  rpc = {
    start: (endpoint: string, operation: string) => {
      this.trackRpcCall()
      if (isDevelopment) {
        console.log(`🔄 RPC START: ${operation} -> ${endpoint}`)
      }
    },

    success: (endpoint: string, operation: string, duration?: number) => {
      if (isDevelopment) {
        const durationMsg = duration ? ` (${duration}ms)` : ''
        console.log(`✅ RPC SUCCESS: ${operation} -> ${endpoint}${durationMsg}`)
      }
    },

    error: (endpoint: string, operation: string, error: any) => {
      this.metrics.errors++
      console.error(`❌ RPC ERROR: ${operation} -> ${endpoint}:`, error?.message || error)
    },

    fallback: (fromEndpoint: string, toEndpoint: string, operation: string) => {
      if (isDevelopment) {
        console.warn(`🔄 RPC FALLBACK: ${operation} from ${fromEndpoint} to ${toEndpoint}`)
      }
    }
  }

  // Cache-specific logging
  cache = {
    hit: (key: string, type: string = 'general') => {
      this.trackCacheHit()
      if (isDevelopment) {
        console.log(`💾 CACHE HIT: ${type}:${key}`)
      }
    },

    miss: (key: string, type: string = 'general') => {
      this.trackCacheMiss()
      if (isDevelopment) {
        console.log(`🔍 CACHE MISS: ${type}:${key}`)
      }
    },

    set: (key: string, type: string = 'general', ttl?: number) => {
      if (isDevelopment) {
        const ttlMsg = ttl ? ` (TTL: ${ttl}ms)` : ''
        console.log(`💾 CACHE SET: ${type}:${key}${ttlMsg}`)
      }
    },

    invalidate: (key: string, type: string = 'general') => {
      if (isDevelopment) {
        console.log(`🗑️ CACHE INVALIDATE: ${type}:${key}`)
      }
    }
  }

  private trackError(error: any) {
    try {
      // In a real app, send to error tracking service like Sentry
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'exception', {
          description: error?.message || 'Unknown error',
          fatal: false
        })
      }
    } catch (e) {
      // Ignore tracking errors
    }
  }
}

export const logger = new Logger()

// Performance monitoring interval (development only)
if (isDevelopment && !isServer) {
  setInterval(() => {
    logger.logMetrics()
  }, 60000) // Log metrics every minute
}