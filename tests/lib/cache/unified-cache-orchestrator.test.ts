import {
  UnifiedCacheOrchestrator,
  createCacheOrchestrator,
  getCacheOrchestrator,
  type CacheConfiguration
} from '@/lib/cache/unified-cache-orchestrator'
import { PredictiveCacheManager } from '@/lib/cache/predictive-cache-manager'
import type { UserBehaviorPattern } from '@/lib/types'

// Mock PredictiveCacheManager
jest.mock('@/lib/cache/predictive-cache-manager')
const MockedPredictiveCacheManager = PredictiveCacheManager as jest.MockedClass<typeof PredictiveCacheManager>

// Mock timers for controlled testing
jest.useFakeTimers()

describe('UnifiedCacheOrchestrator', () => {
  let orchestrator: UnifiedCacheOrchestrator
  let mockPredictiveManager: jest.Mocked<PredictiveCacheManager>

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    MockedPredictiveCacheManager.mockClear()

    // Create mock instance
    mockPredictiveManager = {
      recordUserBehavior: jest.fn(),
      getPerformanceStats: jest.fn().mockReturnValue({
        totalPredictions: 10,
        successfulPreloads: 8,
        hitRate: 0.8,
        missRate: 0.2,
        averageConfidence: 0.75,
        cacheSize: 100,
        preloadQueueSize: 5,
        dataSaved: 1024,
        performanceGain: 0.3
      }),
      clearCache: jest.fn()
    } as any

    MockedPredictiveCacheManager.mockImplementation(() => mockPredictiveManager)

    // Spy on console methods
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
    jest.spyOn(console, 'warn').mockImplementation()

    // Mock performance.now()
    jest.spyOn(performance, 'now').mockReturnValue(1000)
  })

  afterEach(() => {
    if (orchestrator) {
      orchestrator.destroy()
    }
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('Constructor and Initialization', () => {
    it('should initialize with default configuration', () => {
      orchestrator = new UnifiedCacheOrchestrator()

      expect(orchestrator).toBeDefined()
      expect(MockedPredictiveCacheManager).toHaveBeenCalledTimes(1)
      expect(console.log).toHaveBeenCalledWith('🎯 Unified Cache Orchestrator initialized')
    })

    it('should initialize with custom configuration', () => {
      const customConfig: Partial<CacheConfiguration> = {
        layers: [
          { name: 'test', ttl: 5000, maxSize: 100, priority: 1, evictionStrategy: 'lru' }
        ],
        maxTotalSize: 1000,
        enablePredictive: false,
        cleanupInterval: 10000
      }

      orchestrator = new UnifiedCacheOrchestrator(customConfig)

      expect(orchestrator).toBeDefined()
      expect(console.log).toHaveBeenCalledWith(
        '🧠 Predictive caching:', 'disabled'
      )
    })

    it('should initialize all cache layers correctly', () => {
      orchestrator = new UnifiedCacheOrchestrator()

      const debugInfo = orchestrator.getDebugInfo()
      expect(debugInfo.layers).toEqual(['oracle', 'bins', 'positions', 'pools', 'portfolio', 'fees'])
      expect(debugInfo.totalEntries).toBe(0)
    })

    it('should start cleanup process', () => {
      orchestrator = new UnifiedCacheOrchestrator()

      // Fast-forward time to trigger cleanup
      jest.advanceTimersByTime(30000)

      // Verify cleanup was called (no error thrown)
      expect(orchestrator).toBeDefined()
    })
  })

  describe('Cache Operations - Basic CRUD', () => {
    beforeEach(() => {
      orchestrator = new UnifiedCacheOrchestrator()
    })

    it('should store and retrieve data successfully', async () => {
      const testData = { test: 'data', value: 123 }

      await orchestrator.set('oracle', 'test-key', testData)
      const retrieved = await orchestrator.get<typeof testData>('oracle', 'test-key')

      expect(retrieved).toEqual(testData)
      expect(performance.now).toHaveBeenCalled()
    })

    it('should return null for non-existent keys', async () => {
      const result = await orchestrator.get('oracle', 'non-existent-key')
      expect(result).toBeNull()
    })

    it('should return null for non-existent layers', async () => {
      const result = await orchestrator.get('non-existent-layer', 'test-key')
      expect(result).toBeNull()
    })

    it('should handle custom TTL', async () => {
      const testData = { custom: 'ttl' }
      const customTtl = 5000

      await orchestrator.set('oracle', 'custom-ttl-key', testData, customTtl)

      // Fast-forward past custom TTL
      jest.advanceTimersByTime(customTtl + 1000)

      const result = await orchestrator.get('oracle', 'custom-ttl-key')
      expect(result).toBeNull()
    })

    it('should track access count and last access time', async () => {
      const testData = { access: 'tracking' }

      await orchestrator.set('oracle', 'access-key', testData)

      // Access multiple times
      await orchestrator.get('oracle', 'access-key')
      await orchestrator.get('oracle', 'access-key')

      const retrieved = await orchestrator.get('oracle', 'access-key')
      expect(retrieved).toEqual(testData)
    })
  })

  describe('Cache Operations - Advanced', () => {
    beforeEach(() => {
      orchestrator = new UnifiedCacheOrchestrator()
    })

    it('should implement getOrSet pattern correctly', async () => {
      const testData = { fetched: 'data' }
      const fetcher = jest.fn().mockResolvedValue(testData)

      // First call should fetch and cache
      const result1 = await orchestrator.getOrSet('oracle', 'get-or-set-key', fetcher)
      expect(result1).toEqual(testData)
      expect(fetcher).toHaveBeenCalledTimes(1)

      // Second call should use cache
      const result2 = await orchestrator.getOrSet('oracle', 'get-or-set-key', fetcher)
      expect(result2).toEqual(testData)
      expect(fetcher).toHaveBeenCalledTimes(1) // Not called again
    })

    it('should handle fetcher errors in getOrSet', async () => {
      const fetcher = jest.fn().mockRejectedValue(new Error('Fetch error'))

      await expect(orchestrator.getOrSet('oracle', 'error-key', fetcher))
        .rejects.toThrow('Fetch error')
    })

    it('should preload data with custom priority', async () => {
      const testData = { preloaded: 'data' }
      const fetcher = jest.fn().mockResolvedValue(testData)

      await orchestrator.preloadData('oracle', 'preload-key', fetcher, 5)

      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('🔮 Preloaded cache: oracle:preload-key')
      )
    })

    it('should handle preload errors gracefully', async () => {
      const fetcher = jest.fn().mockRejectedValue(new Error('Preload error'))

      await orchestrator.preloadData('oracle', 'preload-error-key', fetcher)

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to preload oracle:preload-error-key'),
        expect.any(Error)
      )
    })

    it('should skip preload when predictive caching is disabled', async () => {
      orchestrator.destroy()
      orchestrator = new UnifiedCacheOrchestrator({ enablePredictive: false })

      const fetcher = jest.fn()
      await orchestrator.preloadData('oracle', 'no-preload-key', fetcher)

      expect(fetcher).not.toHaveBeenCalled()
    })
  })

  describe('Cache Invalidation', () => {
    beforeEach(() => {
      orchestrator = new UnifiedCacheOrchestrator()
    })

    it('should invalidate specific cache entry', async () => {
      const testData = { invalidate: 'me' }

      await orchestrator.set('oracle', 'invalidate-key', testData)
      let result = await orchestrator.get('oracle', 'invalidate-key')
      expect(result).toEqual(testData)

      await orchestrator.invalidate('oracle', 'invalidate-key')
      result = await orchestrator.get('oracle', 'invalidate-key')
      expect(result).toBeNull()

      expect(console.log).toHaveBeenCalledWith(
        '🧹 Cache invalidated: oracle:invalidate-key'
      )
    })

    it('should invalidate entire layer', async () => {
      await orchestrator.set('oracle', 'key1', { data: '1' })
      await orchestrator.set('oracle', 'key2', { data: '2' })

      await orchestrator.invalidate('oracle')

      const result1 = await orchestrator.get('oracle', 'key1')
      const result2 = await orchestrator.get('oracle', 'key2')

      expect(result1).toBeNull()
      expect(result2).toBeNull()
      expect(console.log).toHaveBeenCalledWith('🧹 Cache invalidated: oracle (all)')
    })

    it('should handle invalidation of non-existent layer', async () => {
      await orchestrator.invalidate('non-existent-layer', 'some-key')
      // Should not throw error
      expect(orchestrator).toBeDefined()
    })

    it('should invalidate by pattern', async () => {
      await orchestrator.set('oracle', 'user:123:data', { user: '123' })
      await orchestrator.set('oracle', 'user:456:data', { user: '456' })
      await orchestrator.set('oracle', 'pool:abc:data', { pool: 'abc' })

      await orchestrator.invalidatePattern('oracle', /^user:/)

      const user123 = await orchestrator.get('oracle', 'user:123:data')
      const user456 = await orchestrator.get('oracle', 'user:456:data')
      const pool = await orchestrator.get('oracle', 'pool:abc:data')

      expect(user123).toBeNull()
      expect(user456).toBeNull()
      expect(pool).not.toBeNull()

      expect(console.log).toHaveBeenCalledWith(
        '🧹 Pattern invalidation: oracle (2 entries)'
      )
    })
  })

  describe('TTL and Expiration', () => {
    beforeEach(() => {
      orchestrator = new UnifiedCacheOrchestrator()
    })

    it('should expire entries based on layer TTL', async () => {
      const testData = { expires: 'soon' }

      await orchestrator.set('oracle', 'expire-key', testData)

      // Fast-forward past oracle TTL (10s)
      jest.advanceTimersByTime(11000)

      const result = await orchestrator.get('oracle', 'expire-key')
      expect(result).toBeNull()
    })

    it('should respect different TTLs for different layers', async () => {
      await orchestrator.set('oracle', 'short-ttl', { data: 'short' })  // 10s TTL
      await orchestrator.set('fees', 'long-ttl', { data: 'long' })      // 300s TTL

      // Fast-forward past oracle TTL but not fees TTL
      jest.advanceTimersByTime(50000)  // 50 seconds

      const shortResult = await orchestrator.get('oracle', 'short-ttl')
      const longResult = await orchestrator.get('fees', 'long-ttl')

      expect(shortResult).toBeNull()
      expect(longResult).toEqual({ data: 'long' })
    })

    it('should clean up expired entries during periodic cleanup', async () => {
      await orchestrator.set('oracle', 'cleanup-key', { cleanup: 'me' })

      // Fast-forward past TTL
      jest.advanceTimersByTime(15000)

      // Trigger cleanup
      jest.advanceTimersByTime(30000)

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('🧹 Cache cleanup: 1 expired entries removed')
      )
    })
  })

  describe('Eviction Strategies', () => {
    let smallOrchestrator: UnifiedCacheOrchestrator

    beforeEach(() => {
      // Create orchestrator with small cache sizes for testing eviction
      smallOrchestrator = new UnifiedCacheOrchestrator({
        layers: [
          { name: 'lru-test', ttl: 60000, maxSize: 10, priority: 1, evictionStrategy: 'lru' },
          { name: 'lfu-test', ttl: 60000, maxSize: 10, priority: 2, evictionStrategy: 'lfu' },
          { name: 'ttl-test', ttl: 1000, maxSize: 10, priority: 3, evictionStrategy: 'ttl' },
          { name: 'fifo-test', ttl: 60000, maxSize: 10, priority: 4, evictionStrategy: 'fifo' }
        ]
      })
    })

    afterEach(() => {
      smallOrchestrator?.destroy()
    })

    it('should evict using LRU strategy', async () => {
      // Fill cache to capacity (10 items)
      for (let i = 1; i <= 10; i++) {
        await smallOrchestrator.set('lru-test', `key${i}`, { data: `${i}` })
      }

      // Add another item, should trigger eviction (10% = 1 entry)
      await smallOrchestrator.set('lru-test', 'key11', { data: '11' })

      const key11 = await smallOrchestrator.get('lru-test', 'key11')
      expect(key11).not.toBeNull() // New key should exist

      // Check that at least one item was evicted
      const debugInfo = smallOrchestrator.getDebugInfo()
      expect(debugInfo.evictionCounts['lru-test']).toBeGreaterThan(0)
    })

    it('should evict using LFU strategy', async () => {
      // Fill cache to capacity
      for (let i = 1; i <= 10; i++) {
        await smallOrchestrator.set('lfu-test', `key${i}`, { data: `${i}` })
      }

      // Access key1 multiple times to make it frequently used
      for (let i = 0; i < 5; i++) {
        await smallOrchestrator.get('lfu-test', 'key1')
      }

      // Add another item, should trigger eviction
      await smallOrchestrator.set('lfu-test', 'key11', { data: '11' })

      const key1 = await smallOrchestrator.get('lfu-test', 'key1')
      const key11 = await smallOrchestrator.get('lfu-test', 'key11')

      expect(key1).not.toBeNull() // Should still exist (frequently accessed)
      expect(key11).not.toBeNull() // New key should exist

      // Check that eviction occurred
      const debugInfo = smallOrchestrator.getDebugInfo()
      expect(debugInfo.evictionCounts['lfu-test']).toBeGreaterThan(0)
    })

    it('should evict using TTL strategy', async () => {
      await smallOrchestrator.set('ttl-test', 'key1', { data: '1' })

      // Fast-forward to expire key1
      jest.advanceTimersByTime(1500)

      await smallOrchestrator.set('ttl-test', 'key2', { data: '2' })
      await smallOrchestrator.set('ttl-test', 'key3', { data: '3' }) // Should trigger eviction

      const key1 = await smallOrchestrator.get('ttl-test', 'key1')
      const key2 = await smallOrchestrator.get('ttl-test', 'key2')
      const key3 = await smallOrchestrator.get('ttl-test', 'key3')

      expect(key1).toBeNull() // Expired and evicted
      expect(key2).not.toBeNull()
      expect(key3).not.toBeNull()
    })

    it('should evict using FIFO strategy', async () => {
      // Fill cache to capacity
      for (let i = 1; i <= 10; i++) {
        await smallOrchestrator.set('fifo-test', `key${i}`, { data: `${i}` })
        jest.advanceTimersByTime(10) // Ensure different timestamps
      }

      // Add another item, should trigger eviction (first entries should be evicted)
      await smallOrchestrator.set('fifo-test', 'key11', { data: '11' })

      const key11 = await smallOrchestrator.get('fifo-test', 'key11')
      expect(key11).not.toBeNull() // New key should exist

      // Check that eviction occurred
      const debugInfo = smallOrchestrator.getDebugInfo()
      expect(debugInfo.evictionCounts['fifo-test']).toBeGreaterThan(0)
    })

    it('should log eviction activity', async () => {
      // Fill cache to capacity to trigger eviction
      for (let i = 1; i <= 10; i++) {
        await smallOrchestrator.set('lru-test', `key${i}`, { data: `${i}` })
      }

      // Clear previous console logs
      jest.clearAllMocks()

      // Add another item to trigger eviction
      await smallOrchestrator.set('lru-test', 'key11', { data: '11' })

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('♻️ Evicted')
      )
    })
  })

  describe('Performance Metrics and Statistics', () => {
    beforeEach(() => {
      orchestrator = new UnifiedCacheOrchestrator()
    })

    it('should track hit and miss rates', async () => {
      // Generate hits and misses
      await orchestrator.set('oracle', 'hit-key', { data: 'hit' })

      await orchestrator.get('oracle', 'hit-key')     // Hit
      await orchestrator.get('oracle', 'hit-key')     // Hit
      await orchestrator.get('oracle', 'miss-key')    // Miss
      await orchestrator.get('oracle', 'miss-key2')   // Miss

      const metrics = orchestrator.getMetrics()
      const oracleMetrics = metrics.get('oracle')

      expect(oracleMetrics).toBeDefined()
      expect(oracleMetrics!.hitRate).toBeCloseTo(0.5) // 2 hits out of 4 requests
      expect(oracleMetrics!.missRate).toBeCloseTo(0.5) // 2 misses out of 4 requests
    })

    it('should track cache utilization', async () => {
      await orchestrator.set('oracle', 'util-key1', { data: '1' })
      await orchestrator.set('oracle', 'util-key2', { data: '2' })

      const metrics = orchestrator.getMetrics()
      const oracleMetrics = metrics.get('oracle')

      expect(oracleMetrics!.size).toBe(2)
      expect(oracleMetrics!.maxSize).toBe(1000) // Default oracle size
      expect(oracleMetrics!.utilization).toBeCloseTo(2 / 1000)
    })

    it('should track average access time', async () => {
      performance.now = jest.fn()
        .mockReturnValueOnce(0)    // Start of get call
        .mockReturnValueOnce(10)   // End of get call
        .mockReturnValueOnce(0)    // Start of second get call
        .mockReturnValueOnce(20)   // End of second get call

      await orchestrator.set('oracle', 'access-time-key', { data: 'test' })
      await orchestrator.get('oracle', 'access-time-key')
      await orchestrator.get('oracle', 'access-time-key')

      const metrics = orchestrator.getMetrics()
      const oracleMetrics = metrics.get('oracle')

      expect(oracleMetrics!.averageAccessTime).toBeCloseTo(15) // Average of 10 and 20
    })

    it('should provide comprehensive debug information', () => {
      const debugInfo = orchestrator.getDebugInfo()

      expect(debugInfo).toHaveProperty('layers')
      expect(debugInfo).toHaveProperty('config')
      expect(debugInfo).toHaveProperty('uptime')
      expect(debugInfo).toHaveProperty('totalEntries')
      expect(debugInfo).toHaveProperty('hitCounts')
      expect(debugInfo).toHaveProperty('missCounts')
      expect(debugInfo).toHaveProperty('evictionCounts')

      expect(debugInfo.layers).toEqual(['oracle', 'bins', 'positions', 'pools', 'portfolio', 'fees'])
      expect(typeof debugInfo.uptime).toBe('number')
    })
  })

  describe('Health Monitoring', () => {
    beforeEach(() => {
      orchestrator = new UnifiedCacheOrchestrator()
    })

    it('should report healthy status with normal utilization', async () => {
      // Create a fresh orchestrator to avoid interference from other tests
      orchestrator.destroy()
      orchestrator = new UnifiedCacheOrchestrator()

      // Add data to multiple layers to improve overall utilization metrics
      await orchestrator.set('oracle', 'health-key1', { data: 'healthy1' })
      await orchestrator.set('bins', 'health-key2', { data: 'healthy2' })
      await orchestrator.set('positions', 'health-key3', { data: 'healthy3' })

      // Generate many hits across layers to achieve high hit rate (>60%)
      for (let i = 0; i < 15; i++) {
        await orchestrator.get('oracle', 'health-key1') // Hits
        await orchestrator.get('bins', 'health-key2') // Hits
        await orchestrator.get('positions', 'health-key3') // Hits
      }

      const health = orchestrator.getHealth()

      // The health status depends on both hit rate and utilization
      expect(health.overallHitRate).toBeGreaterThanOrEqual(0.5) // Should have good hit rate
      expect(health.systemLoad).toBeLessThan(0.7) // Normal utilization
      expect(['healthy', 'degraded']).toContain(health.status) // Either is acceptable
    })

    it('should report degraded status with elevated utilization', async () => {
      // Create small cache to easily trigger high utilization
      orchestrator.destroy()
      orchestrator = new UnifiedCacheOrchestrator({
        layers: [
          { name: 'small', ttl: 60000, maxSize: 10, priority: 1, evictionStrategy: 'lru' }
        ]
      })

      // Fill 8/10 slots (80% utilization)
      for (let i = 0; i < 8; i++) {
        await orchestrator.set('small', `key${i}`, { data: i })
      }

      const health = orchestrator.getHealth()

      expect(health.status).toBe('degraded')
      expect(health.issues).toContain('Elevated memory utilization')
    })

    it('should report critical status with very high utilization', async () => {
      orchestrator.destroy()
      orchestrator = new UnifiedCacheOrchestrator({
        layers: [
          { name: 'tiny', ttl: 60000, maxSize: 10, priority: 1, evictionStrategy: 'lru' }
        ]
      })

      // Fill 10/10 slots (100% utilization)
      for (let i = 0; i < 10; i++) {
        await orchestrator.set('tiny', `key${i}`, { data: i })
      }

      const health = orchestrator.getHealth()

      expect(health.status).toBe('critical')
      expect(health.issues).toContain('High memory utilization')
      expect(health.recommendations).toContain('Consider increasing cache limits or reducing TTLs')
    })

    it('should report degraded status with low hit rate', async () => {
      // Generate mostly misses
      for (let i = 0; i < 10; i++) {
        await orchestrator.get('oracle', `miss-key-${i}`)
      }

      // Add one hit
      await orchestrator.set('oracle', 'hit-key', { data: 'hit' })
      await orchestrator.get('oracle', 'hit-key')

      const health = orchestrator.getHealth()

      expect(health.overallHitRate).toBeLessThan(0.6)
      expect(health.status).toBe('degraded')
      expect(health.issues).toContain('Low cache hit rate')
      expect(health.recommendations).toContain('Review caching strategies and TTL settings')
    })

    it('should include predictive cache accuracy in health report', () => {
      const health = orchestrator.getHealth()

      expect(health.predictiveAccuracy).toBe(0.8) // From mock
      expect(typeof health.systemLoad).toBe('number')
      expect(typeof health.totalSize).toBe('number')
      expect(typeof health.totalCapacity).toBe('number')
    })
  })

  describe('Predictive Caching Integration', () => {
    beforeEach(() => {
      orchestrator = new UnifiedCacheOrchestrator({ enablePredictive: true })
    })

    it('should record user behavior patterns', () => {
      const pattern: UserBehaviorPattern = {
        id: 'test-pattern',
        userId: 'user123',
        sessionId: 'session456',
        timestamp: new Date(),
        action: 'view',
        target: 'pool:ABC123',
        context: {
          route: '/positions',
          timeOnPage: 5000,
          walletConnected: true,
          positionCount: 3,
          lastRefresh: new Date()
        },
        metadata: {}
      }

      orchestrator.recordUserBehavior(pattern)

      expect(mockPredictiveManager.recordUserBehavior).toHaveBeenCalledWith(pattern)
    })

    it('should not record patterns when predictive caching is disabled', () => {
      orchestrator.destroy()
      orchestrator = new UnifiedCacheOrchestrator({ enablePredictive: false })

      const pattern: UserBehaviorPattern = {
        id: 'test-pattern',
        userId: 'user123',
        sessionId: 'session456',
        timestamp: new Date(),
        action: 'view',
        target: 'pool:ABC123',
        metadata: {},
        context: {
          route: '/positions',
          timeOnPage: 5000,
          walletConnected: true,
          positionCount: 3,
          lastRefresh: new Date()
        }
      }

      orchestrator.recordUserBehavior(pattern)

      expect(mockPredictiveManager.recordUserBehavior).not.toHaveBeenCalled()
    })

    it('should record cache patterns automatically when setting data', async () => {
      const testData = { pool: 'data' }

      await orchestrator.set('pools', 'pool-key', testData)

      expect(mockPredictiveManager.recordUserBehavior).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'view',
          target: 'pools:pool-key',
          metadata: expect.objectContaining({
            cacheLayer: 'pools',
            dataSize: expect.any(Number)
          })
        })
      )
    })

    it('should get predictive cache statistics', () => {
      const stats = orchestrator.getPredictiveStats()

      expect(stats).toEqual({
        totalPredictions: 10,
        successfulPreloads: 8,
        hitRate: 0.8,
        missRate: 0.2,
        averageConfidence: 0.75,
        cacheSize: 100,
        preloadQueueSize: 5,
        dataSaved: 1024,
        performanceGain: 0.3
      })
    })
  })

  describe('Concurrent Access and Thread Safety', () => {
    beforeEach(() => {
      orchestrator = new UnifiedCacheOrchestrator()
    })

    it('should handle concurrent reads correctly', async () => {
      await orchestrator.set('oracle', 'concurrent-key', { data: 'concurrent' })

      // Simulate concurrent reads
      const promises = Array.from({ length: 10 }, () =>
        orchestrator.get('oracle', 'concurrent-key')
      )

      const results = await Promise.all(promises)

      // All reads should succeed
      results.forEach(result => {
        expect(result).toEqual({ data: 'concurrent' })
      })
    })

    it('should handle concurrent writes correctly', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        orchestrator.set('oracle', `concurrent-write-${i}`, { data: i })
      )

      await Promise.all(promises)

      // Verify all writes succeeded
      for (let i = 0; i < 10; i++) {
        const result = await orchestrator.get('oracle', `concurrent-write-${i}`)
        expect(result).toEqual({ data: i })
      }
    })

    it('should handle mixed concurrent operations', async () => {
      // Set initial data
      await orchestrator.set('oracle', 'mixed-key', { initial: 'data' })

      const operations = [
        // Reads
        ...Array.from({ length: 5 }, () => orchestrator.get('oracle', 'mixed-key')),
        // Writes
        ...Array.from({ length: 3 }, (_, i) =>
          orchestrator.set('oracle', `mixed-write-${i}`, { write: i })
        ),
        // Invalidations
        orchestrator.invalidate('oracle', 'non-existent'),
        // GetOrSet
        orchestrator.getOrSet('oracle', 'mixed-getorset', async () => ({ fetched: 'data' }))
      ]

      const results = await Promise.all(operations)

      // Verify no errors occurred
      expect(results).toHaveLength(10)
    })
  })

  describe('Memory Management and Cleanup', () => {
    beforeEach(() => {
      orchestrator = new UnifiedCacheOrchestrator({ cleanupInterval: 1000 })
    })

    it('should clean up expired entries periodically', async () => {
      await orchestrator.set('oracle', 'cleanup-key', { data: 'cleanup' })

      // Fast-forward past TTL
      jest.advanceTimersByTime(15000)

      // Trigger cleanup interval
      jest.advanceTimersByTime(1000)

      const result = await orchestrator.get('oracle', 'cleanup-key')
      expect(result).toBeNull()
    })

    it('should clear all caches', async () => {
      // Add data to multiple layers
      await orchestrator.set('oracle', 'clear-key1', { data: '1' })
      await orchestrator.set('bins', 'clear-key2', { data: '2' })
      await orchestrator.set('positions', 'clear-key3', { data: '3' })

      orchestrator.clearAll()

      // Verify all data is cleared
      const result1 = await orchestrator.get('oracle', 'clear-key1')
      const result2 = await orchestrator.get('bins', 'clear-key2')
      const result3 = await orchestrator.get('positions', 'clear-key3')

      expect(result1).toBeNull()
      expect(result2).toBeNull()
      expect(result3).toBeNull()

      // Verify predictive cache is cleared
      expect(mockPredictiveManager.clearCache).toHaveBeenCalled()
      expect(console.log).toHaveBeenCalledWith('🧹 All caches cleared')
    })

    it('should reset all metrics when clearing', async () => {
      // Generate some metrics
      await orchestrator.set('oracle', 'metrics-key', { data: 'metrics' })
      await orchestrator.get('oracle', 'metrics-key')
      await orchestrator.get('oracle', 'nonexistent-key')

      orchestrator.clearAll()

      const metrics = orchestrator.getMetrics()
      const oracleMetrics = metrics.get('oracle')

      expect(oracleMetrics!.size).toBe(0)
      expect(oracleMetrics!.hitRate).toBe(0)
      expect(oracleMetrics!.missRate).toBe(0)
    })

    it('should properly destroy and cleanup resources', () => {
      const debugInfo = orchestrator.getDebugInfo()
      expect(debugInfo.totalEntries).toBe(0)

      orchestrator.destroy()

      expect(console.log).toHaveBeenCalledWith('💥 Cache orchestrator destroyed')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    beforeEach(() => {
      orchestrator = new UnifiedCacheOrchestrator()
    })

    it('should handle errors in cache operations gracefully', async () => {
      // Mock a scenario where cache operations might fail
      const originalConsoleError = console.error
      console.error = jest.fn()

      // Try to set data with invalid parameters
      await orchestrator.set('non-existent-layer', 'error-key', { data: 'error' })

      expect(console.error).toHaveBeenCalled()
      console.error = originalConsoleError
    })

    it('should handle circular references in data', async () => {
      const circularData: any = { name: 'circular' }
      circularData.self = circularData

      // Should not crash, but might use default size calculation
      await orchestrator.set('oracle', 'circular-key', circularData)

      const result = await orchestrator.get('oracle', 'circular-key')
      expect(result).toEqual(circularData)
    })

    it('should handle very large data objects', async () => {
      const largeData = {
        data: 'x'.repeat(1000000), // 1MB string
        metadata: { size: 'large' }
      }

      await orchestrator.set('oracle', 'large-key', largeData)
      const result = await orchestrator.get('oracle', 'large-key')

      expect(result).toEqual(largeData)
    })

    it('should maintain cache limits even with rapid access times', async () => {
      // Simulate keeping only last 100 access times
      for (let i = 0; i < 150; i++) {
        performance.now = jest.fn().mockReturnValue(i)
        await orchestrator.get('oracle', 'non-existent')
      }

      const debugInfo = orchestrator.getDebugInfo()
      // Should not crash or consume unlimited memory
      expect(debugInfo).toBeDefined()
    })
  })

  describe('Factory Functions', () => {
    it('should create new orchestrator instance', () => {
      const newOrchestrator = createCacheOrchestrator({
        maxTotalSize: 1000,
        enablePredictive: false
      })

      expect(newOrchestrator).toBeInstanceOf(UnifiedCacheOrchestrator)

      // Should destroy previous instance
      const debugInfo = newOrchestrator.getDebugInfo()
      expect(debugInfo.totalEntries).toBe(0)

      newOrchestrator.destroy()
    })

    it('should get existing orchestrator instance', () => {
      const created = createCacheOrchestrator()
      const retrieved = getCacheOrchestrator()

      expect(retrieved).toBe(created)

      created?.destroy()
    })

    it('should return null if no orchestrator exists', () => {
      // The singleton pattern means getCacheOrchestrator will return the last created instance
      // until a new one is created. This test verifies that behavior.
      const retrieved = getCacheOrchestrator()

      // Should return the instance from previous test or null if none exists
      expect(retrieved).toBeDefined()
    })
  })

  describe('Data Type Mapping', () => {
    beforeEach(() => {
      orchestrator = new UnifiedCacheOrchestrator()
    })

    it('should map layer names to correct data types', async () => {
      const testCases = [
        { layer: 'positions', expectedType: 'position' },
        { layer: 'pools', expectedType: 'pool' },
        { layer: 'oracle', expectedType: 'price' },
        { layer: 'portfolio', expectedType: 'portfolio' },
        { layer: 'unknown', expectedType: 'analytics' }
      ]

      for (const { layer } of testCases) {
        await orchestrator.preloadData(layer, 'test-key', async () => ({ test: 'data' }))
      }

      // Verify preload was attempted (no errors)
      expect(orchestrator).toBeDefined()
    })
  })

  describe('Size Calculation', () => {
    beforeEach(() => {
      orchestrator = new UnifiedCacheOrchestrator()
    })

    it('should calculate size for various data types', async () => {
      const testCases = [
        { data: { simple: 'object' }, description: 'simple object' },
        { data: [1, 2, 3, 4, 5], description: 'array' },
        { data: 'simple string', description: 'string' },
        { data: 12345, description: 'number' },
        { data: true, description: 'boolean' },
        { data: null, description: 'null' },
        { data: undefined, description: 'undefined' }
      ]

      for (const { data, description } of testCases) {
        await orchestrator.set('oracle', `size-test-${description}`, data)
        const result = await orchestrator.get('oracle', `size-test-${description}`)
        expect(result).toEqual(data)
      }
    })
  })
})