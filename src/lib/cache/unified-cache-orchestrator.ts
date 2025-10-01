import { PredictiveCacheManager } from './predictive-cache-manager'
import type {
  CacheEntry,
  UserBehaviorPattern,
  PredictiveCacheStats
} from '@/lib/types'

export interface CacheLayer {
  name: string
  ttl: number
  maxSize: number
  priority: number
  evictionStrategy: 'lru' | 'lfu' | 'fifo' | 'ttl'
}

export interface CacheMetrics {
  layer: string
  hitRate: number
  missRate: number
  size: number
  maxSize: number
  utilization: number
  evictions: number
  averageAccessTime: number
}

export interface CacheConfiguration {
  layers: CacheLayer[]
  globalTtl: number
  maxTotalSize: number
  enablePredictive: boolean
  enableCompression: boolean
  enablePersistence: boolean
  cleanupInterval: number
}

export interface CacheHealth {
  status: 'healthy' | 'degraded' | 'critical' | 'offline'
  overallHitRate: number
  totalSize: number
  totalCapacity: number
  predictiveAccuracy: number
  systemLoad: number
  issues: string[]
  recommendations: string[]
}

/**
 * Unified Cache Orchestrator System
 *
 * Enterprise-grade cache management system that orchestrates multiple cache layers:
 * - Oracle price feeds cache (10s TTL)
 * - Bin data cache (15s TTL)
 * - Position analytics cache (30s TTL)
 * - Pool metrics cache (60s TTL)
 * - Portfolio analysis cache (120s TTL)
 * - Fee tier analysis cache (300s TTL)
 *
 * Features:
 * - Multi-layer intelligent caching with variable TTLs
 * - Predictive cache preloading using ML patterns
 * - Automatic cache warming and cleanup
 * - Performance monitoring and optimization
 * - Distributed cache support (future)
 */
export class UnifiedCacheOrchestrator {
  private layers: Map<string, Map<string, CacheEntry>> = new Map()
  private layerConfigs: Map<string, CacheLayer> = new Map()
  private predictiveManager: PredictiveCacheManager
  private metrics: Map<string, CacheMetrics> = new Map()
  private cleanupInterval?: NodeJS.Timeout
  private config: CacheConfiguration
  private startTime: number = Date.now()

  // Performance tracking
  private hitCounts: Map<string, number> = new Map()
  private missCounts: Map<string, number> = new Map()
  private evictionCounts: Map<string, number> = new Map()
  private accessTimes: Map<string, number[]> = new Map()

  constructor(config?: Partial<CacheConfiguration>) {
    this.config = {
      layers: [
        { name: 'oracle', ttl: 10000, maxSize: 1000, priority: 1, evictionStrategy: 'ttl' },
        { name: 'bins', ttl: 15000, maxSize: 5000, priority: 2, evictionStrategy: 'lru' },
        { name: 'positions', ttl: 30000, maxSize: 2000, priority: 3, evictionStrategy: 'lru' },
        { name: 'pools', ttl: 60000, maxSize: 1500, priority: 4, evictionStrategy: 'lru' },
        { name: 'portfolio', ttl: 120000, maxSize: 500, priority: 5, evictionStrategy: 'lru' },
        { name: 'fees', ttl: 300000, maxSize: 1000, priority: 6, evictionStrategy: 'lfu' }
      ],
      globalTtl: 300000, // 5 minutes max
      maxTotalSize: 50000, // 50k entries total
      enablePredictive: true,
      enableCompression: false,
      enablePersistence: false,
      cleanupInterval: 30000, // 30 seconds
      ...config
    }

    this.predictiveManager = new PredictiveCacheManager()
    this.initializeLayers()
    this.startCleanupProcess()

    console.log('🎯 Unified Cache Orchestrator initialized')
    console.log('📊 Cache layers:', this.config.layers.map(l => l.name).join(', '))
    // logger.debug('🧠 Predictive caching:', this.config.enablePredictive ? 'enabled' : 'disabled')
  }

  private initializeLayers(): void {
    for (const layerConfig of this.config.layers) {
      this.layers.set(layerConfig.name, new Map())
      this.layerConfigs.set(layerConfig.name, layerConfig)
      this.metrics.set(layerConfig.name, {
        layer: layerConfig.name,
        hitRate: 0,
        missRate: 0,
        size: 0,
        maxSize: layerConfig.maxSize,
        utilization: 0,
        evictions: 0,
        averageAccessTime: 0
      })
      this.hitCounts.set(layerConfig.name, 0)
      this.missCounts.set(layerConfig.name, 0)
      this.evictionCounts.set(layerConfig.name, 0)
      this.accessTimes.set(layerConfig.name, [])
    }
  }

  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup()
      this.updateMetrics()
    }, this.config.cleanupInterval)
  }

  async get<T>(layer: string, key: string): Promise<T | null> {
    const startTime = performance.now()

    try {
      const cache = this.layers.get(layer)
      if (!cache) {
        this.recordMiss(layer)
        return null
      }

      const entry = cache.get(key)
      if (!entry) {
        this.recordMiss(layer)
        return null
      }

      // Check TTL
      if (this.isExpired(entry)) {
        cache.delete(key)
        this.recordMiss(layer)
        return null
      }

      // Update access metrics
      entry.accessCount++
      entry.lastAccess = Date.now()

      this.recordHit(layer)
      this.recordAccessTime(layer, performance.now() - startTime)

      return entry.data as T

    } catch (error) {
      console.error(`Cache get error (${layer}:${key}):`, error)
      this.recordMiss(layer)
      return null
    }
  }

  async set<T>(
    layer: string,
    key: string,
    data: T,
    customTtl?: number
  ): Promise<void> {
    try {
      const cache = this.layers.get(layer)
      const layerConfig = this.layerConfigs.get(layer)

      if (!cache || !layerConfig) {
        throw new Error(`Unknown cache layer: ${layer}`)
      }

      // Check capacity and evict if necessary
      if (cache.size >= layerConfig.maxSize) {
        this.evictFromLayer(layer)
      }

      const ttl = customTtl || layerConfig.ttl
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        accessCount: 0,
        lastAccess: Date.now(),
        size: this.calculateSize(data),
        source: 'user_request'
      }

      cache.set(key, entry)

      // Record behavior for predictive caching
      if (this.config.enablePredictive) {
        this.recordCachePattern(layer, key, data)
      }

    } catch (error) {
      console.error(`Cache set error (${layer}:${key}):`, error)
    }
  }

  async getOrSet<T>(
    layer: string,
    key: string,
    fetcher: () => Promise<T>,
    customTtl?: number
  ): Promise<T> {
    const cached = await this.get<T>(layer, key)
    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    await this.set(layer, key, data, customTtl)
    return data
  }

  async invalidate(layer: string, key?: string): Promise<void> {
    const cache = this.layers.get(layer)
    if (!cache) return

    if (key) {
      cache.delete(key)
    } else {
      cache.clear()
    }

    console.log(`🧹 Cache invalidated: ${layer}${key ? `:${key}` : ' (all)'}`)
  }

  async invalidatePattern(layer: string, pattern: RegExp): Promise<void> {
    const cache = this.layers.get(layer)
    if (!cache) return

    let deletedCount = 0
    for (const key of cache.keys()) {
      if (pattern.test(key)) {
        cache.delete(key)
        deletedCount++
      }
    }

    console.log(`🧹 Pattern invalidation: ${layer} (${deletedCount} entries)`)
  }

  async preloadData<T>(
    layer: string,
    key: string,
    fetcher: () => Promise<T>,
    _priority: number = 1
  ): Promise<void> {
    if (this.config.enablePredictive) {
      // Add to predictive preload queue
      // Prediction created for future implementation
      // const _prediction: CachePrediction = { ... }

      // Execute preload in background
      try {
        const data = await fetcher()
        await this.set(layer, key, data)
        // logger.debug(`🔮 Preloaded cache: ${layer}:${key}`)
      } catch (error) {
        console.warn(`Failed to preload ${layer}:${key}:`, error)
      }
    }
  }

  recordUserBehavior(pattern: UserBehaviorPattern): void {
    if (this.config.enablePredictive) {
      this.predictiveManager.recordUserBehavior(pattern)
    }
  }

  private recordCachePattern<T>(layer: string, key: string, data: T): void {
    // Record cache access patterns for ML analysis
    const pattern: UserBehaviorPattern = {
      id: `cache_${Date.now()}`,
      userId: 'system',
      sessionId: 'cache_session',
      timestamp: new Date(),
      action: 'view',
      target: `${layer}:${key}`,
      context: {
        route: layer,
        timeOnPage: 0,
        walletConnected: true,
        positionCount: 0,
        lastRefresh: new Date()
      },
      metadata: {
        cacheLayer: layer,
        dataSize: this.calculateSize(data),
        timestamp: Date.now()
      }
    }

    this.recordUserBehavior(pattern)
  }

  private evictFromLayer(layer: string): void {
    const cache = this.layers.get(layer)
    const config = this.layerConfigs.get(layer)

    if (!cache || !config) return

    const entries = Array.from(cache.entries())
    let toEvict: string[] = []

    switch (config.evictionStrategy) {
      case 'lru': // Least Recently Used
        toEvict = entries
          .sort(([, a], [, b]) => a.lastAccess - b.lastAccess)
          .slice(0, Math.floor(config.maxSize * 0.1))
          .map(([key]) => key)
        break

      case 'lfu': // Least Frequently Used
        toEvict = entries
          .sort(([, a], [, b]) => a.accessCount - b.accessCount)
          .slice(0, Math.floor(config.maxSize * 0.1))
          .map(([key]) => key)
        break

      case 'ttl': // Time To Live
        toEvict = entries
          .filter(([, entry]) => this.isExpired(entry))
          .map(([key]) => key)
        break

      case 'fifo': // First In First Out
        toEvict = entries
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)
          .slice(0, Math.floor(config.maxSize * 0.1))
          .map(([key]) => key)
        break
    }

    toEvict.forEach(key => cache.delete(key))

    const evictionCount = this.evictionCounts.get(layer) || 0
    this.evictionCounts.set(layer, evictionCount + toEvict.length)

    if (toEvict.length > 0) {
      console.log(`♻️ Evicted ${toEvict.length} entries from ${layer} layer`)
    }
  }

  private performCleanup(): void {
    let totalEvicted = 0

    for (const [layerName, cache] of this.layers) {
      const before = cache.size

      // Remove expired entries
      for (const [key, entry] of cache) {
        if (this.isExpired(entry)) {
          cache.delete(key)
        }
      }

      const evicted = before - cache.size
      totalEvicted += evicted

      if (evicted > 0) {
        const evictionCount = this.evictionCounts.get(layerName) || 0
        this.evictionCounts.set(layerName, evictionCount + evicted)
      }
    }

    if (totalEvicted > 0) {
      console.log(`🧹 Cache cleanup: ${totalEvicted} expired entries removed`)
    }
  }

  private updateMetrics(): void {
    for (const [layerName, cache] of this.layers) {
      const config = this.layerConfigs.get(layerName)!
      const hits = this.hitCounts.get(layerName) || 0
      const misses = this.missCounts.get(layerName) || 0
      const total = hits + misses
      const accessTimes = this.accessTimes.get(layerName) || []

      const metrics: CacheMetrics = {
        layer: layerName,
        hitRate: total > 0 ? hits / total : 0,
        missRate: total > 0 ? misses / total : 0,
        size: cache.size,
        maxSize: config.maxSize,
        utilization: cache.size / config.maxSize,
        evictions: this.evictionCounts.get(layerName) || 0,
        averageAccessTime: accessTimes.length > 0 ?
          accessTimes.reduce((sum, time) => sum + time, 0) / accessTimes.length : 0
      }

      this.metrics.set(layerName, metrics)
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private calculateSize(data: any): number {
    // Simple size estimation
    try {
      return JSON.stringify(data).length
    } catch {
      return 1000 // Default size
    }
  }


  private recordHit(layer: string): void {
    const current = this.hitCounts.get(layer) || 0
    this.hitCounts.set(layer, current + 1)
  }

  private recordMiss(layer: string): void {
    const current = this.missCounts.get(layer) || 0
    this.missCounts.set(layer, current + 1)
  }

  private recordAccessTime(layer: string, time: number): void {
    const times = this.accessTimes.get(layer) || []
    times.push(time)

    // Keep only last 100 access times
    if (times.length > 100) {
      times.shift()
    }

    this.accessTimes.set(layer, times)
  }

  // Public API methods
  getMetrics(): Map<string, CacheMetrics> {
    this.updateMetrics()
    return new Map(this.metrics)
  }

  getHealth(): CacheHealth {
    this.updateMetrics()

    const totalSize = Array.from(this.layers.values())
      .reduce((sum, cache) => sum + cache.size, 0)

    const totalCapacity = Array.from(this.layerConfigs.values())
      .reduce((sum, config) => sum + config.maxSize, 0)

    const overallHitRate = Array.from(this.metrics.values())
      .reduce((sum, metrics) => sum + metrics.hitRate, 0) / this.metrics.size

    const utilization = totalSize / totalCapacity
    // const _uptime = Date.now() - this.startTime // Unused for now

    let status: CacheHealth['status'] = 'healthy'
    const issues: string[] = []
    const recommendations: string[] = []

    if (utilization > 0.9) {
      status = 'critical'
      issues.push('High memory utilization')
      recommendations.push('Consider increasing cache limits or reducing TTLs')
    } else if (utilization > 0.7) {
      status = 'degraded'
      issues.push('Elevated memory utilization')
    }

    if (overallHitRate < 0.6) {
      if (status === 'healthy') status = 'degraded'
      issues.push('Low cache hit rate')
      recommendations.push('Review caching strategies and TTL settings')
    }

    return {
      status,
      overallHitRate,
      totalSize,
      totalCapacity,
      predictiveAccuracy: this.config.enablePredictive ?
        this.predictiveManager.getPerformanceStats().hitRate : 0,
      systemLoad: utilization,
      issues,
      recommendations
    }
  }

  getPredictiveStats(): PredictiveCacheStats {
    return this.predictiveManager.getPerformanceStats()
  }

  clearAll(): void {
    for (const cache of this.layers.values()) {
      cache.clear()
    }

    // Reset counters
    for (const layerName of this.layers.keys()) {
      this.hitCounts.set(layerName, 0)
      this.missCounts.set(layerName, 0)
      this.evictionCounts.set(layerName, 0)
      this.accessTimes.set(layerName, [])
    }

    this.predictiveManager.clearCache()
    console.log('🧹 All caches cleared')
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clearAll()
    console.log('💥 Cache orchestrator destroyed')
  }

  // Statistics and debugging
  getDebugInfo() {
    return {
      layers: Array.from(this.layers.keys()),
      config: this.config,
      uptime: Date.now() - this.startTime,
      totalEntries: Array.from(this.layers.values())
        .reduce((sum, cache) => sum + cache.size, 0),
      hitCounts: Object.fromEntries(this.hitCounts),
      missCounts: Object.fromEntries(this.missCounts),
      evictionCounts: Object.fromEntries(this.evictionCounts)
    }
  }
}

// Singleton instance for global use
let orchestratorInstance: UnifiedCacheOrchestrator | null = null

export function createCacheOrchestrator(config?: Partial<CacheConfiguration>): UnifiedCacheOrchestrator {
  if (orchestratorInstance) {
    orchestratorInstance.destroy()
  }

  orchestratorInstance = new UnifiedCacheOrchestrator(config)
  return orchestratorInstance
}

export function getCacheOrchestrator(): UnifiedCacheOrchestrator | null {
  return orchestratorInstance
}

export default UnifiedCacheOrchestrator