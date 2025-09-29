// Comprehensive Confidence System Testing Suite
// Tests for price confidence analysis, quality reporting, and aggregation
// Bismillah - ensuring robust confidence analysis through comprehensive testing

import {
  PriceConfidenceSystem,
  type ConfidenceThresholds,
  DEFAULT_CONFIDENCE_THRESHOLDS,
  DEFAULT_VALIDATION_RULES
} from '@/lib/oracle/confidence-system'
import type { PythPriceData } from '@/lib/oracle/pyth-integration'

// Mock the pythIntegration module
jest.mock('@/lib/oracle/pyth-integration', () => ({
  pythIntegration: {
    getPriceData: jest.fn(),
    analyzePriceConfidence: jest.fn(),
    getFeedConfig: jest.fn()
  }
}))

// Mock the oracle price feeds
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

describe('PriceConfidenceSystem', () => {
  let confidenceSystem: PriceConfidenceSystem

  beforeEach(() => {
    jest.clearAllMocks()
    confidenceSystem = new PriceConfidenceSystem()
  })

  // ============================================================================
  // INITIALIZATION TESTS
  // ============================================================================

  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      expect(confidenceSystem).toBeDefined()
      expect(typeof confidenceSystem.generateQualityReport).toBe('function')
      expect(typeof confidenceSystem.aggregatePricesWithConfidence).toBe('function')
    })

    test('should initialize with custom thresholds', () => {
      const customThresholds: ConfidenceThresholds = {
        veryHigh: { maxConfidencePercent: 0.05, maxStaleness: 5, minScore: 98 },
        high: { maxConfidencePercent: 0.3, maxStaleness: 20, minScore: 90 },
        medium: { maxConfidencePercent: 0.8, maxStaleness: 45, minScore: 75 },
        low: { maxConfidencePercent: 1.5, maxStaleness: 90, minScore: 60 }
      }

      const customSystem = new PriceConfidenceSystem(customThresholds)
      expect(customSystem).toBeDefined()
    })

    test('should have valid default thresholds', () => {
      expect(DEFAULT_CONFIDENCE_THRESHOLDS.veryHigh.maxStaleness).toBeLessThan(
        DEFAULT_CONFIDENCE_THRESHOLDS.high.maxStaleness
      )
      expect(DEFAULT_CONFIDENCE_THRESHOLDS.high.minScore).toBeGreaterThan(
        DEFAULT_CONFIDENCE_THRESHOLDS.medium.minScore
      )
    })
  })

  // ============================================================================
  // QUALITY REPORT GENERATION TESTS
  // ============================================================================

  describe('Quality Report Generation', () => {
    const createMockPythPrice = (overrides: Partial<PythPriceData> = {}): PythPriceData => ({
      symbol: 'SOL',
      priceId: 'test-price-id',
      price: 100,
      confidence: 0.5,
      expo: -8,
      publishTime: Date.now(),
      timestamp: new Date(),
      staleness: 10,
      emaPrice: 99.5,
      emaConfidence: 0.6,
      status: 'trading',
      source: 'pyth',
      ...overrides
    })

    const createMockConfidence = (overrides: any = {}) => ({
      confidenceLevel: 'high' as const,
      confidenceScore: 85,
      qualityFlags: [],
      recommendation: 'use',
      details: {
        confidencePercent: 0.5,
        stalenessSeconds: 10,
        tradingStatus: 'trading'
      },
      ...overrides
    })

    beforeEach(() => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      pythIntegration.getPriceData.mockResolvedValue(createMockPythPrice())
      pythIntegration.analyzePriceConfidence.mockReturnValue(createMockConfidence())
      pythIntegration.getFeedConfig.mockReturnValue({ updateFrequency: 1 })
    })

    test('should generate quality report for healthy price feed', async () => {
      const report = await confidenceSystem.generateQualityReport('SOL')

      expect(report).toBeDefined()
      expect(report.symbol).toBe('SOL')
      expect(report.overallScore).toBeGreaterThan(0)
      expect(report.overallScore).toBeLessThanOrEqual(100)
      expect(report.confidence).toBeDefined()
      expect(report.staleness).toBeDefined()
      expect(report.consistency).toBeDefined()
      expect(report.reliability).toBeDefined()
      expect(report.recommendation).toMatch(/^(use|use_with_caution|fallback|reject)$/)
    })

    test('should handle fresh price data correctly', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      pythIntegration.getPriceData.mockResolvedValue(createMockPythPrice({ staleness: 5 }))

      const report = await confidenceSystem.generateQualityReport('SOL')

      expect(report.staleness.level).toBe('fresh')
      expect(report.staleness.recommendation).toContain('fresh')
      expect(report.overallScore).toBeGreaterThan(80)
    })

    test('should handle stale price data correctly', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      pythIntegration.getPriceData.mockResolvedValue(createMockPythPrice({ staleness: 120 }))

      const report = await confidenceSystem.generateQualityReport('SOL')

      expect(report.staleness.level).toBe('stale')
      expect(report.warnings).toContain('Price data is stale')
      expect(report.actions).toContain('Consider refreshing price data')
    })

    test('should handle expired price data correctly', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      pythIntegration.getPriceData.mockResolvedValue(createMockPythPrice({ staleness: 300 }))

      const report = await confidenceSystem.generateQualityReport('SOL')

      expect(report.staleness.level).toBe('expired')
      expect(report.recommendation).toBe('reject')
      expect(report.warnings).toContain('Price data is expired')
    })

    test('should analyze price consistency with history', async () => {
      // Add some history first
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      pythIntegration.getPriceData.mockResolvedValue(createMockPythPrice({ price: 100 }))
      await confidenceSystem.generateQualityReport('SOL')

      pythIntegration.getPriceData.mockResolvedValue(createMockPythPrice({ price: 105 }))
      await confidenceSystem.generateQualityReport('SOL')

      pythIntegration.getPriceData.mockResolvedValue(createMockPythPrice({ price: 95 }))
      const report = await confidenceSystem.generateQualityReport('SOL')

      expect(report.consistency).toBeDefined()
      expect(report.consistency.volatility).toBeGreaterThan(0)
      expect(['stable', 'moderate', 'volatile', 'extreme']).toContain(report.consistency.stability)
    })

    test('should handle low confidence prices', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      pythIntegration.analyzePriceConfidence.mockReturnValue(
        createMockConfidence({
          confidenceLevel: 'low',
          confidenceScore: 30,
          qualityFlags: ['LOW_CONFIDENCE']
        })
      )

      const report = await confidenceSystem.generateQualityReport('SOL')

      expect(report.warnings).toContain('Low price confidence')
      expect(report.actions).toContain('Increase slippage tolerance or delay transaction')
      expect(report.recommendation).not.toBe('use')
    })

    test('should handle non-trading status', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      pythIntegration.analyzePriceConfidence.mockReturnValue(
        createMockConfidence({
          qualityFlags: ['NON_TRADING_STATUS']
        })
      )

      const report = await confidenceSystem.generateQualityReport('SOL')

      expect(report.warnings).toContain('Market not in trading status')
      expect(report.actions).toContain('Verify market status before executing trades')
    })

    test('should cache quality reports', async () => {
      const report1 = await confidenceSystem.generateQualityReport('SOL')
      const cachedReport = confidenceSystem.getCachedQualityReport('SOL')

      expect(cachedReport).toEqual(report1)
    })

    test('should handle API errors gracefully', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      pythIntegration.getPriceData.mockRejectedValue(new Error('API Error'))

      await expect(confidenceSystem.generateQualityReport('SOL')).rejects.toThrow('API Error')
    })
  })

  // ============================================================================
  // PRICE AGGREGATION TESTS
  // ============================================================================

  describe('Price Aggregation', () => {
    beforeEach(() => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      const { oraclePriceFeeds } = require('@/lib/oracle/price-feeds')

      pythIntegration.getPriceData.mockResolvedValue({
        symbol: 'SOL',
        price: 100,
        confidence: 0.5,
        staleness: 10,
        timestamp: new Date()
      })

      pythIntegration.analyzePriceConfidence.mockReturnValue({
        confidenceScore: 85
      })

      oraclePriceFeeds.getTokenPrice.mockResolvedValue({
        price: 101,
        confidence: 0.8,
        source: 'fallback',
        timestamp: new Date()
      })
    })

    test('should aggregate prices from multiple sources', async () => {
      const aggregated = await confidenceSystem.aggregatePricesWithConfidence('SOL')

      expect(aggregated).toBeDefined()
      expect(aggregated.symbol).toBe('SOL')
      expect(aggregated.primaryPrice).toBeGreaterThan(0)
      expect(aggregated.sources.length).toBeGreaterThan(0)
      expect(aggregated.aggregationMethod).toBe('weighted_average')
      expect(aggregated.qualityScore).toBeGreaterThan(0)
    })

    test('should handle weighted average calculation', async () => {
      const aggregated = await confidenceSystem.aggregatePricesWithConfidence('SOL')

      // Should be weighted average between 100 and 101
      expect(aggregated.primaryPrice).toBeGreaterThan(99)
      expect(aggregated.primaryPrice).toBeLessThan(102)
      expect(aggregated.sources.length).toBe(2)
    })

    test('should handle single source failure', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      pythIntegration.getPriceData.mockRejectedValue(new Error('Pyth failed'))

      const aggregated = await confidenceSystem.aggregatePricesWithConfidence('SOL')

      expect(aggregated.sources.length).toBe(1)
      expect(aggregated.sources[0].source).toBe('fallback')
    })

    test('should handle all sources failing', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      const { oraclePriceFeeds } = require('@/lib/oracle/price-feeds')

      pythIntegration.getPriceData.mockRejectedValue(new Error('Pyth failed'))
      oraclePriceFeeds.getTokenPrice.mockRejectedValue(new Error('Fallback failed'))

      await expect(confidenceSystem.aggregatePricesWithConfidence('SOL')).rejects.toThrow()
    })

    test('should calculate source weights correctly', async () => {
      const aggregated = await confidenceSystem.aggregatePricesWithConfidence('SOL')

      // Higher confidence source should have higher weight
      const pythSource = aggregated.sources.find(s => s.source === 'pyth')
      const fallbackSource = aggregated.sources.find(s => s.source === 'fallback')

      expect(pythSource).toBeDefined()
      expect(fallbackSource).toBeDefined()
      expect(fallbackSource!.weight).toBeGreaterThan(pythSource!.weight) // fallback has higher confidence
    })
  })

  // ============================================================================
  // CACHE AND HISTORY MANAGEMENT TESTS
  // ============================================================================

  describe('Cache and History Management', () => {
    test('should maintain price history with size limit', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      pythIntegration.getPriceData.mockResolvedValue({
        symbol: 'SOL',
        price: 100,
        confidence: 0.5,
        staleness: 10,
        timestamp: new Date()
      })
      pythIntegration.analyzePriceConfidence.mockReturnValue({
        confidenceScore: 85
      })
      pythIntegration.getFeedConfig.mockReturnValue({ updateFrequency: 1 })

      // Generate more than max history size
      for (let i = 0; i < 110; i++) {
        await confidenceSystem.generateQualityReport('SOL')
      }

      const history = confidenceSystem.getPriceHistory('SOL')
      expect(history.length).toBeLessThanOrEqual(100) // Should respect max size
    })

    test('should clear cache correctly', () => {
      confidenceSystem.clearCache()
      const cachedReport = confidenceSystem.getCachedQualityReport('SOL')
      expect(cachedReport).toBeNull()
    })

    test('should get system statistics', () => {
      const stats = confidenceSystem.getSystemStats()

      expect(stats).toBeDefined()
      expect(typeof stats.trackedSymbols).toBe('number')
      expect(typeof stats.totalPricePoints).toBe('number')
      expect(typeof stats.qualityReports).toBe('number')
      expect(typeof stats.averageQuality).toBe('number')
      expect(stats.trackedSymbols).toBeGreaterThanOrEqual(0)
      expect(stats.averageQuality).toBeGreaterThanOrEqual(0)
      expect(stats.averageQuality).toBeLessThanOrEqual(100)
    })
  })

  // ============================================================================
  // EDGE CASES AND ERROR HANDLING
  // ============================================================================

  describe('Edge Cases and Error Handling', () => {
    test('should handle unknown symbols', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      pythIntegration.getPriceData.mockResolvedValue({
        symbol: 'UNKNOWN',
        price: 1,
        confidence: 1,
        staleness: 60,
        timestamp: new Date()
      })
      pythIntegration.analyzePriceConfidence.mockReturnValue({
        confidenceScore: 50
      })

      const report = await confidenceSystem.generateQualityReport('UNKNOWN')
      expect(report.symbol).toBe('UNKNOWN')
    })

    test('should handle extreme price volatility', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')

      // Create history with extreme volatility
      const prices = [100, 200, 50, 300, 25]
      for (const price of prices) {
        pythIntegration.getPriceData.mockResolvedValue({
          symbol: 'VOLATILE',
          price,
          confidence: 0.5,
          staleness: 10,
          timestamp: new Date()
        })
        pythIntegration.analyzePriceConfidence.mockReturnValue({
          confidenceScore: 70
        })
        await confidenceSystem.generateQualityReport('VOLATILE')
      }

      const finalReport = await confidenceSystem.generateQualityReport('VOLATILE')
      expect(finalReport.consistency.stability).toBe('extreme')
      expect(finalReport.warnings).toContain('High price volatility detected')
    })

    test('should handle zero prices', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      pythIntegration.getPriceData.mockResolvedValue({
        symbol: 'ZERO',
        price: 0,
        confidence: 0,
        staleness: 10,
        timestamp: new Date()
      })
      pythIntegration.analyzePriceConfidence.mockReturnValue({
        confidenceScore: 0
      })

      const report = await confidenceSystem.generateQualityReport('ZERO')
      expect(report).toBeDefined()
      expect(report.recommendation).toBe('reject')
    })

    test('should handle concurrent quality report requests', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')
      pythIntegration.getPriceData.mockResolvedValue({
        symbol: 'SOL',
        price: 100,
        confidence: 0.5,
        staleness: 10,
        timestamp: new Date()
      })
      pythIntegration.analyzePriceConfidence.mockReturnValue({
        confidenceScore: 85
      })

      const promises = Array(5).fill(null).map(() =>
        confidenceSystem.generateQualityReport('SOL')
      )

      const reports = await Promise.allSettled(promises)
      expect(reports.every(r => r.status === 'fulfilled')).toBe(true)
    })
  })

  // ============================================================================
  // VALIDATION RULES TESTS
  // ============================================================================

  describe('Validation Rules', () => {
    test('should apply different rules for different tokens', () => {
      expect(DEFAULT_VALIDATION_RULES.SOL.maxPriceDeviation).toBeDefined()
      expect(DEFAULT_VALIDATION_RULES.USDC.maxPriceDeviation).toBeLessThan(
        DEFAULT_VALIDATION_RULES.SOL.maxPriceDeviation
      )
      expect(DEFAULT_VALIDATION_RULES.DEFAULT).toBeDefined()
    })

    test('should handle price deviation warnings', async () => {
      const { pythIntegration } = require('@/lib/oracle/pyth-integration')

      // Create price data with large deviation from EMA
      pythIntegration.getPriceData.mockResolvedValue({
        symbol: 'SOL',
        price: 100,
        confidence: 0.5,
        emaPrice: 80, // 20% deviation
        staleness: 10,
        timestamp: new Date()
      })
      pythIntegration.analyzePriceConfidence.mockReturnValue({
        confidenceScore: 70
      })

      const report = await confidenceSystem.generateQualityReport('SOL')
      expect(report.warnings).toContain('Significant price deviation from EMA')
      expect(report.actions).toContain('Verify price against alternative sources')
    })
  })
})