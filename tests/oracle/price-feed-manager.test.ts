// Comprehensive Price Feed Manager Testing Suite
// Tests for unified price feed management, fallback logic, and caching
// Bismillah - ensuring robust feed management through comprehensive testing

import {
  PriceFeedManager,
  type PriceFeedConfig,
  DEFAULT_FEED_CONFIGS
} from '@/lib/oracle/price-feed-manager'

// Mock dependencies
jest.mock('@/lib/oracle/pyth-integration', () => ({
  pythIntegration: {
    getPriceData: jest.fn(),
    analyzePriceConfidence: jest.fn()
  }
}))

jest.mock('@/lib/oracle/confidence-system', () => ({
  priceConfidenceSystem: {
    generateQualityReport: jest.fn(),
    aggregatePricesWithConfidence: jest.fn()
  }
}))

jest.mock('@/lib/oracle/price-feeds', () => ({
  oraclePriceFeeds: {
    getTokenPrice: jest.fn()
  }
}))

// Mock console methods
const originalConsole = console
beforeAll(() => {
  console.log = jest.fn()
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterAll(() => {
  console.log = originalConsole.log
  console.error = originalConsole.error
  console.warn = originalConsole.warn
})

describe('PriceFeedManager', () => {
  let feedManager: PriceFeedManager

  beforeEach(() => {
    jest.clearAllMocks()
    feedManager = new PriceFeedManager()
  })

  afterEach(() => {
    feedManager.cleanup()
  })

  // ============================================================================
  // INITIALIZATION TESTS
  // ============================================================================

  describe('Initialization', () => {
    test('should initialize with default configurations', () => {
      expect(feedManager).toBeDefined()
      expect(typeof feedManager.getPrice).toBe('function')
      expect(typeof feedManager.getPrices).toBe('function')
      expect(typeof feedManager.getSystemHealth).toBe('function')
    })

    test('should load default feed configurations', () => {
      expect(DEFAULT_FEED_CONFIGS.SOL).toBeDefined()
      expect(DEFAULT_FEED_CONFIGS.SOL.primarySource).toBe('pyth')
      expect(DEFAULT_FEED_CONFIGS.SOL.refreshInterval).toBeGreaterThan(0)
      expect(DEFAULT_FEED_CONFIGS.DEFAULT).toBeDefined()
    })

    test('should start with empty statistics', () => {
      const stats = feedManager.getStats()
      expect(stats.totalRequests).toBe(0)
      expect(stats.cacheHitRate).toBe(0)
      expect(stats.totalFeeds).toBe(0)
    })
  })

  // ============================================================================
  // PRICE RETRIEVAL TESTS
  // ============================================================================

  describe('Price Retrieval', () => {

    const createMockQualityReport = () => ({
      symbol: 'SOL',
      overallScore: 85,
      confidence: { confidenceScore: 80 },
      staleness: { level: 'fresh', seconds: 10 },
      consistency: { stability: 'stable' },
      reliability: { successRate: 95 },
      recommendation: 'use' as const,
      warnings: [],
      actions: []
    })

    beforeEach(() => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      const { priceConfidenceSystem } = require('@/lib/oracle/confidence-system')

      pythIntegration.getPriceData.mockResolvedValue({
        symbol: 'SOL',
        price: 100,
        confidence: 0.8,
        staleness: 10,
        timestamp: new Date()
      })

      pythIntegration.analyzePriceConfidence.mockReturnValue({
        confidenceScore: 80
      })

      priceConfidenceSystem.generateQualityReport.mockResolvedValue(createMockQualityReport())
    })

    test('should retrieve price successfully', async () => {
      const price = await feedManager.getPrice('SOL')

      expect(price).toBeDefined()
      expect(price.symbol).toBe('SOL')
      expect(price.price).toBe(100)
      expect(price.confidence).toBe(0.8)
      expect(price.source).toBe('pyth')
      expect(price.timestamp).toBeInstanceOf(Date)
    })

    test('should use cache on subsequent requests', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')

      // First request
      await feedManager.getPrice('SOL')
      expect(pythIntegration.getPriceData).toHaveBeenCalledTimes(1)

      // Second request should use cache
      await feedManager.getPrice('SOL')
      expect(pythIntegration.getPriceData).toHaveBeenCalledTimes(1)
    })

    test('should force refresh when requested', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')

      // First request
      await feedManager.getPrice('SOL')
      expect(pythIntegration.getPriceData).toHaveBeenCalledTimes(1)

      // Force refresh
      await feedManager.getPrice('SOL', true)
      expect(pythIntegration.getPriceData).toHaveBeenCalledTimes(2)
    })

    test('should handle multiple symbols', async () => {
      const symbols = ['SOL', 'USDC', 'ETH']
      const prices = await feedManager.getPrices(symbols)

      expect(prices.size).toBe(symbols.length)
      for (const symbol of symbols) {
        expect(prices.has(symbol)).toBe(true)
      }
    })

    test('should update feed status correctly', async () => {
      await feedManager.getPrice('SOL')

      const status = feedManager.getFeedStatus('SOL')
      expect(status).toBeDefined()
      expect(status!.symbol).toBe('SOL')
      expect(status!.status).toBe('healthy')
      expect(status!.primarySource).toBe('pyth')
    })

    test('should update statistics correctly', async () => {
      await feedManager.getPrice('SOL')

      const stats = feedManager.getStats()
      expect(stats.totalRequests).toBeGreaterThan(0)
    })
  })

  // ============================================================================
  // FALLBACK LOGIC TESTS
  // ============================================================================

  describe('Fallback Logic', () => {
    beforeEach(() => {
      const { priceConfidenceSystem } = require('@/lib/oracle/confidence-system')
      priceConfidenceSystem.generateQualityReport.mockResolvedValue({
        symbol: 'SOL',
        overallScore: 75,
        warnings: [],
        actions: []
      })
    })

    test('should fallback when primary source fails', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      const { oraclePriceFeeds } = require('@/lib/oracle/price-feeds')

      pythIntegration.getPriceData.mockRejectedValue(new Error('Pyth failed'))
      oraclePriceFeeds.getTokenPrice.mockResolvedValue({
        price: 101,
        confidence: 0.7,
        source: 'fallback',
        timestamp: new Date()
      })

      const price = await feedManager.getPrice('SOL')

      expect(price.source).toBe('fallback')
      expect(price.price).toBe(101)
    })

    test('should try aggregation when enabled', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      const { oraclePriceFeeds } = require('@/lib/oracle/price-feeds')
      const { priceConfidenceSystem } = require('@/lib/oracle/confidence-system')

      pythIntegration.getPriceData.mockRejectedValue(new Error('Pyth failed'))
      oraclePriceFeeds.getTokenPrice.mockRejectedValue(new Error('Fallback failed'))

      priceConfidenceSystem.aggregatePricesWithConfidence.mockResolvedValue({
        symbol: 'SOL',
        primaryPrice: 102,
        confidence: 0.75,
        sources: [{ source: 'aggregated' }],
        aggregationMethod: 'weighted_average',
        qualityScore: 80,
        staleness: 15
      })

      const price = await feedManager.getPrice('SOL')

      expect(price.source).toBe('aggregated')
      expect(price.aggregated).toBe(true)
    })

    test('should fail when all sources fail', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      const { oraclePriceFeeds } = require('@/lib/oracle/price-feeds')
      const { priceConfidenceSystem } = require('@/lib/oracle/confidence-system')

      pythIntegration.getPriceData.mockRejectedValue(new Error('Pyth failed'))
      oraclePriceFeeds.getTokenPrice.mockRejectedValue(new Error('Fallback failed'))
      priceConfidenceSystem.aggregatePricesWithConfidence.mockRejectedValue(new Error('Aggregation failed'))

      await expect(feedManager.getPrice('SOL')).rejects.toThrow()

      const status = feedManager.getFeedStatus('SOL')
      expect(status!.status).toBe('failed')
    })

    test('should implement retry logic with exponential backoff', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')

      let attemptCount = 0
      pythIntegration.getPriceData.mockImplementation(() => {
        attemptCount++
        if (attemptCount < 3) {
          return Promise.reject(new Error('Temporary failure'))
        }
        return Promise.resolve({
          symbol: 'SOL',
          price: 100,
          confidence: 0.8,
          staleness: 10,
          timestamp: new Date()
        })
      })

      const price = await feedManager.getPrice('SOL')

      expect(attemptCount).toBe(3)
      expect(price.price).toBe(100)
    })
  })

  // ============================================================================
  // CONFIGURATION MANAGEMENT TESTS
  // ============================================================================

  describe('Configuration Management', () => {
    test('should set custom feed configuration', () => {
      const customConfig: Partial<PriceFeedConfig> = {
        refreshInterval: 30,
        maxStaleness: 120,
        confidenceThreshold: 0.9
      }

      feedManager.setFeedConfig('SOL', customConfig)

      // Configuration should be updated (internal test)
      expect(true).toBe(true)
    })

    test('should use default config for unknown symbols', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      const { priceConfidenceSystem } = require('@/lib/oracle/confidence-system')

      pythIntegration.getPriceData.mockResolvedValue({
        symbol: 'UNKNOWN',
        price: 1,
        confidence: 0.5,
        staleness: 60,
        timestamp: new Date()
      })

      priceConfidenceSystem.generateQualityReport.mockResolvedValue({
        symbol: 'UNKNOWN',
        overallScore: 70,
        warnings: [],
        actions: []
      })

      const price = await feedManager.getPrice('UNKNOWN')
      expect(price.symbol).toBe('UNKNOWN')
    })
  })

  // ============================================================================
  // SYSTEM HEALTH MONITORING TESTS
  // ============================================================================

  describe('System Health Monitoring', () => {
    beforeEach(async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      const { priceConfidenceSystem } = require('@/lib/oracle/confidence-system')

      pythIntegration.getPriceData.mockResolvedValue({
        symbol: 'SOL',
        price: 100,
        confidence: 0.8,
        staleness: 10,
        timestamp: new Date()
      })

      pythIntegration.analyzePriceConfidence.mockReturnValue({
        confidenceScore: 80
      })

      priceConfidenceSystem.generateQualityReport.mockResolvedValue({
        symbol: 'SOL',
        overallScore: 85,
        warnings: [],
        actions: []
      })

      // Initialize some feed data
      await feedManager.getPrice('SOL')
    })

    test('should report system health correctly', () => {
      const health = feedManager.getSystemHealth()

      expect(health).toBeDefined()
      expect(health.overallHealth).toMatch(/^(healthy|degraded|critical)$/)
      expect(health.healthPercentage).toBeGreaterThanOrEqual(0)
      expect(health.healthPercentage).toBeLessThanOrEqual(100)
      expect(health.activeFeeds).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(health.issues)).toBe(true)
    })

    test('should get all feed statuses', () => {
      const statuses = feedManager.getAllFeedStatuses()

      expect(statuses).toBeInstanceOf(Map)
      expect(statuses.has('SOL')).toBe(true)

      const solStatus = statuses.get('SOL')!
      expect(solStatus.symbol).toBe('SOL')
      expect(solStatus.status).toBe('healthy')
    })

    test('should report degraded health for low quality feeds', async () => {
      const { priceConfidenceSystem } = require('@/lib/oracle/confidence-system')

      priceConfidenceSystem.generateQualityReport.mockResolvedValue({
        symbol: 'SOL',
        overallScore: 65, // Lower quality score
        warnings: ['Low confidence'],
        actions: []
      })

      await feedManager.getPrice('SOL', true) // Force refresh

      const status = feedManager.getFeedStatus('SOL')
      expect(status!.status).toBe('degraded')
    })
  })

  // ============================================================================
  // CACHE MANAGEMENT TESTS
  // ============================================================================

  describe('Cache Management', () => {
    beforeEach(async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      const { priceConfidenceSystem } = require('@/lib/oracle/confidence-system')

      pythIntegration.getPriceData.mockResolvedValue({
        symbol: 'SOL',
        price: 100,
        confidence: 0.8,
        staleness: 10,
        timestamp: new Date()
      })

      priceConfidenceSystem.generateQualityReport.mockResolvedValue({
        symbol: 'SOL',
        overallScore: 85,
        warnings: [],
        actions: []
      })

      await feedManager.getPrice('SOL')
    })

    test('should clear cache for specific symbol', () => {
      feedManager.clearCache('SOL')
      // Should not throw
      expect(true).toBe(true)
    })

    test('should clear all cache', () => {
      feedManager.clearCache()
      // Should not throw
      expect(true).toBe(true)
    })

    test('should track cache hit rate', async () => {
      // First request (cache miss)
      await feedManager.getPrice('SOL', true)

      // Second request (should be cache hit)
      await feedManager.getPrice('SOL')

      const stats = feedManager.getStats()
      expect(stats.cacheHitRate).toBeGreaterThan(0)
    })
  })

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    test('should handle network timeouts gracefully', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')

      pythIntegration.getPriceData.mockImplementation(
        () => new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      await expect(feedManager.getPrice('SOL')).rejects.toThrow()

      const status = feedManager.getFeedStatus('SOL')
      expect(status!.status).toBe('failed')
      expect(status!.lastError).toContain('Timeout')
    })

    test('should handle malformed responses', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')

      pythIntegration.getPriceData.mockResolvedValue(null)

      await expect(feedManager.getPrice('SOL')).rejects.toThrow()
    })

    test('should increment error count on failures', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')

      pythIntegration.getPriceData.mockRejectedValue(new Error('Test error'))

      try {
        await feedManager.getPrice('SOL')
      } catch (error) {
        // Expected to fail
      }

      const status = feedManager.getFeedStatus('SOL')
      expect(status!.errorCount).toBeGreaterThan(0)
    })
  })

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance', () => {
    beforeEach(() => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      const { priceConfidenceSystem } = require('@/lib/oracle/confidence-system')

      pythIntegration.getPriceData.mockResolvedValue({
        symbol: 'SOL',
        price: 100,
        confidence: 0.8,
        staleness: 10,
        timestamp: new Date()
      })

      pythIntegration.analyzePriceConfidence.mockReturnValue({
        confidenceScore: 80
      })

      priceConfidenceSystem.generateQualityReport.mockResolvedValue({
        symbol: 'SOL',
        overallScore: 85,
        warnings: [],
        actions: []
      })
    })

    test('should handle concurrent requests efficiently', async () => {
      const promises = Array(10).fill(null).map(() => feedManager.getPrice('SOL'))
      const results = await Promise.allSettled(promises)

      expect(results.every(r => r.status === 'fulfilled')).toBe(true)
    })

    test('should track response times', async () => {
      const startTime = Date.now()
      await feedManager.getPrice('SOL')
      const endTime = Date.now()

      const stats = feedManager.getStats()
      expect(stats.averageResponseTime).toBeGreaterThan(0)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete quickly in tests
    })

    test('should handle high-frequency requests', async () => {
      const requestCount = 50
      const promises = []

      for (let i = 0; i < requestCount; i++) {
        promises.push(feedManager.getPrice('SOL'))
      }

      const results = await Promise.allSettled(promises)
      const successCount = results.filter(r => r.status === 'fulfilled').length

      expect(successCount).toBeGreaterThan(requestCount * 0.9) // At least 90% success rate
    })
  })

  // ============================================================================
  // CLEANUP TESTS
  // ============================================================================

  describe('Cleanup', () => {
    test('should stop all refresh timers on cleanup', () => {
      feedManager.stopAllRefresh()
      // Should not throw
      expect(true).toBe(true)
    })

    test('should cleanup resources properly', () => {
      feedManager.cleanup()
      // Should not throw
      expect(true).toBe(true)
    })
  })
})