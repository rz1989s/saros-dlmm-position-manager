import { PublicKey } from '@solana/web3.js'
import {
  HistoricalDataService
} from '../../../../src/lib/dlmm/backtesting/historical-data'

// Mock fetch for API testing
global.fetch = jest.fn()
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('HistoricalDataService', () => {
  let service: HistoricalDataService
  let testPoolAddress: PublicKey
  let startDate: Date
  let endDate: Date

  beforeEach(() => {
    service = new HistoricalDataService({
      cacheSize: 5,
      cacheTTL: 1000 * 60 * 5, // 5 minutes for testing
      fallbackToMock: true,
      apiEndpoint: 'https://api.test.com',
    })

    testPoolAddress = new PublicKey('11111111111111111111111111111112')
    startDate = new Date('2024-01-01T00:00:00Z')
    endDate = new Date('2024-01-02T00:00:00Z')

    jest.clearAllMocks()
  })

  afterEach(() => {
    service.clearCache()
  })

  describe('fetchHistoricalData', () => {
    it('should fetch and cache historical data successfully', async () => {
      const result = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      expect(result).toBeDefined()
      expect(result.poolAddress).toEqual(testPoolAddress)
      expect(result.priceData).toHaveLength(24) // 24 hours
      expect(result.metadata.source).toBe('mock')
      expect(result.metadata.coverage).toBe(1.0)
    })

    it('should return cached data on second request', async () => {
      const firstResult = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')
      const secondResult = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      expect(firstResult).toEqual(secondResult)

      const cacheStats = service.getCacheStats()
      expect(cacheStats.totalHits).toBe(1)
    })

    it('should handle different intervals correctly', async () => {
      const intervals = ['1m', '5m', '15m', '1h', '4h', '1d'] as const

      for (const interval of intervals) {
        const result = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, interval)

        expect(result.timeRange.interval).toBe(interval)
        expect(result.priceData.length).toBeGreaterThan(0)
      }
    })

    it('should generate realistic price data with proper OHLC relationships', async () => {
      const result = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      for (const pricePoint of result.priceData) {
        // High should be >= max(open, close)
        expect(pricePoint.high).toBeGreaterThanOrEqual(Math.max(pricePoint.open, pricePoint.close))

        // Low should be <= min(open, close)
        expect(pricePoint.low).toBeLessThanOrEqual(Math.min(pricePoint.open, pricePoint.close))

        // All prices should be positive
        expect(pricePoint.open).toBeGreaterThan(0)
        expect(pricePoint.high).toBeGreaterThan(0)
        expect(pricePoint.low).toBeGreaterThan(0)
        expect(pricePoint.close).toBeGreaterThan(0)

        // Volume should be positive
        expect(parseFloat(pricePoint.volume)).toBeGreaterThan(0)
        expect(parseFloat(pricePoint.volumeX)).toBeGreaterThan(0)
        expect(parseFloat(pricePoint.volumeY)).toBeGreaterThan(0)
      }
    })

    it('should generate continuous timestamps based on interval', async () => {
      const result = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      for (let i = 1; i < result.priceData.length; i++) {
        const prevTime = result.priceData[i - 1].timestamp.getTime()
        const currTime = result.priceData[i].timestamp.getTime()
        const diff = currTime - prevTime

        expect(diff).toBe(60 * 60 * 1000) // 1 hour in milliseconds
      }
    })

    it('should generate realistic liquidity data', async () => {
      const result = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '4h')

      expect(result.liquidityData.length).toBeGreaterThan(0)

      // Group by timestamp to check bins per timestamp
      const timestampGroups = new Map()
      for (const liquidityPoint of result.liquidityData) {
        const timestamp = liquidityPoint.timestamp.getTime()
        if (!timestampGroups.has(timestamp)) {
          timestampGroups.set(timestamp, [])
        }
        timestampGroups.get(timestamp).push(liquidityPoint)
      }

      // Each timestamp should have multiple bins
      for (const bins of timestampGroups.values()) {
        expect(bins.length).toBeGreaterThan(10) // At least 10 bins per timestamp

        // Check liquidity values are reasonable
        for (const bin of bins) {
          expect(parseFloat(bin.liquidityX)).toBeGreaterThan(0)
          expect(parseFloat(bin.liquidityY)).toBeGreaterThan(0)
          expect(bin.feeRate).toBeGreaterThan(0)
          expect(bin.feeRate).toBeLessThan(0.1) // Less than 10%
        }
      }
    })

    it('should handle extreme date ranges', async () => {
      const longStartDate = new Date('2023-01-01')
      const longEndDate = new Date('2024-01-01')

      const result = await service.fetchHistoricalData(
        testPoolAddress,
        longStartDate,
        longEndDate,
        '1d'
      )

      expect(result.priceData.length).toBe(365) // 1 year of daily data
      expect(result.metadata.dataPoints).toBe(365)
    })

    it('should handle short time ranges', async () => {
      const shortEndDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour later

      const result = await service.fetchHistoricalData(
        testPoolAddress,
        startDate,
        shortEndDate,
        '1m'
      )

      expect(result.priceData.length).toBe(60) // 60 minutes
    })

    it('should fail when mock data is disabled and API fails', async () => {
      const noMockService = new HistoricalDataService({
        fallbackToMock: false,
        apiEndpoint: 'https://api.test.com',
      })

      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(
        noMockService.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')
      ).rejects.toThrow('Unable to fetch historical data and mock data is disabled')
    })

    it('should respect cache size limits', async () => {
      const smallCacheService = new HistoricalDataService({ cacheSize: 2 })

      // Fill cache beyond limit
      await smallCacheService.fetchHistoricalData(
        new PublicKey('11111111111111111111111111111111'),
        startDate, endDate, '1h'
      )
      await smallCacheService.fetchHistoricalData(
        new PublicKey('22222222222222222222222222222222'),
        startDate, endDate, '1h'
      )
      await smallCacheService.fetchHistoricalData(
        new PublicKey('33333333333333333333333333333333'),
        startDate, endDate, '1h'
      )

      const stats = smallCacheService.getCacheStats()
      expect(stats.size).toBeLessThanOrEqual(2)
    })

    it('should handle cache expiration', async () => {
      const shortTTLService = new HistoricalDataService({
        cacheTTL: 10 // 10ms TTL
      })

      await shortTTLService.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 20))

      // Second request should not use cache (will regenerate with different random values)
      await shortTTLService.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      const stats = shortTTLService.getCacheStats()
      expect(stats.totalHits).toBe(0) // No cache hits due to expiration
    })
  })

  describe('generateMockData', () => {
    it('should generate data with realistic volatility patterns', async () => {
      const result = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      const returns = []
      for (let i = 1; i < result.priceData.length; i++) {
        const prevClose = result.priceData[i - 1].close
        const currClose = result.priceData[i].close
        const returnPct = (currClose - prevClose) / prevClose
        returns.push(returnPct)
      }

      // Calculate volatility
      const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length
      const volatility = Math.sqrt(variance)

      // Volatility should be within reasonable bounds (1-15% for hourly data)
      expect(volatility).toBeGreaterThan(0.01)
      expect(volatility).toBeLessThan(0.15)
    })

    it('should generate volume correlated with price volatility', async () => {
      const result = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      let highVolatilityVolume = 0
      let lowVolatilityVolume = 0
      let highVolCount = 0
      let lowVolCount = 0

      for (let i = 1; i < result.priceData.length; i++) {
        const priceChange = Math.abs(result.priceData[i].close - result.priceData[i - 1].close)
        const avgPrice = (result.priceData[i].close + result.priceData[i - 1].close) / 2
        const volatility = priceChange / avgPrice
        const volume = parseFloat(result.priceData[i].volume)

        if (volatility > 0.02) { // High volatility
          highVolatilityVolume += volume
          highVolCount++
        } else { // Low volatility
          lowVolatilityVolume += volume
          lowVolCount++
        }
      }

      if (highVolCount > 0 && lowVolCount > 0) {
        const avgHighVolVolume = highVolatilityVolume / highVolCount
        const avgLowVolVolume = lowVolatilityVolume / lowVolCount

        // High volatility periods should generally have higher volume
        expect(avgHighVolVolume).toBeGreaterThan(avgLowVolVolume * 0.8)
      }
    })

    it('should maintain price continuity between periods', async () => {
      const result = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      for (let i = 1; i < result.priceData.length; i++) {
        const prevClose = result.priceData[i - 1].close
        const currOpen = result.priceData[i].open

        // Open should equal previous close (with small tolerance for mock data)
        expect(Math.abs(currOpen - prevClose)).toBeLessThan(0.01)
      }
    })

    it('should generate active liquidity bins around current price', async () => {
      const result = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      // Group liquidity data by timestamp
      const liquidityByTimestamp = new Map()
      for (const liquidityPoint of result.liquidityData) {
        const timestamp = liquidityPoint.timestamp.getTime()
        if (!liquidityByTimestamp.has(timestamp)) {
          liquidityByTimestamp.set(timestamp, [])
        }
        liquidityByTimestamp.get(timestamp).push(liquidityPoint)
      }

      // Check each timestamp's liquidity distribution
      for (const [, bins] of liquidityByTimestamp) {
        const activeBins = bins.filter((bin: any) => bin.isActive)
        const inactiveBins = bins.filter((bin: any) => !bin.isActive)

        // Should have some active bins
        expect(activeBins.length).toBeGreaterThan(0)
        expect(activeBins.length).toBeLessThanOrEqual(5) // Active range should be limited

        // Active bins should have higher liquidity on average
        if (activeBins.length > 0 && inactiveBins.length > 0) {
          const avgActiveLiquidity = activeBins.reduce((sum: number, bin: any) =>
            sum + parseFloat(bin.liquidityX) + parseFloat(bin.liquidityY), 0
          ) / activeBins.length

          const avgInactiveLiquidity = inactiveBins.reduce((sum: number, bin: any) =>
            sum + parseFloat(bin.liquidityX) + parseFloat(bin.liquidityY), 0
          ) / inactiveBins.length

          expect(avgActiveLiquidity).toBeGreaterThan(avgInactiveLiquidity * 0.8)
        }
      }
    })
  })

  describe('caching functionality', () => {
    it('should generate cache keys consistently', async () => {
      const result1 = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')
      const result2 = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      expect(result1).toEqual(result2)

      const stats = service.getCacheStats()
      expect(stats.totalHits).toBe(1)
    })

    it('should differentiate cache keys for different parameters', async () => {
      await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')
      await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '4h') // Different interval
      await service.fetchHistoricalData(
        new PublicKey('22222222222222222222222222222222'), // Different address
        startDate, endDate, '1h'
      )

      const stats = service.getCacheStats()
      expect(stats.size).toBe(3) // Three different cache entries
      expect(stats.totalHits).toBe(0) // No cache hits
    })

    it('should estimate data size reasonably', async () => {
      await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      const stats = service.getCacheStats()
      expect(stats.totalSize).toBeGreaterThan(1000) // Should have some size
      expect(stats.totalSize).toBeLessThan(1000000) // But not excessive
    })

    it('should track cache hits correctly', async () => {
      // First call - cache miss
      await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      // Second call - cache hit
      await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      // Third call - cache hit
      await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      const stats = service.getCacheStats()
      expect(stats.totalHits).toBe(2)
      expect(stats.entries[0].hits).toBe(2)
    })

    it('should clear cache properly', async () => {
      await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      let stats = service.getCacheStats()
      expect(stats.size).toBe(1)

      service.clearCache()

      stats = service.getCacheStats()
      expect(stats.size).toBe(0)
      expect(stats.totalHits).toBe(0)
    })

    it('should sort cache entries by hits in stats', async () => {
      const addr1 = new PublicKey('11111111111111111111111111111111')
      const addr2 = new PublicKey('22222222222222222222222222222222')

      // Create first entry and hit it twice
      await service.fetchHistoricalData(addr1, startDate, endDate, '1h')
      await service.fetchHistoricalData(addr1, startDate, endDate, '1h')

      // Create second entry and hit it once
      await service.fetchHistoricalData(addr2, startDate, endDate, '1h')

      const stats = service.getCacheStats()
      expect(stats.entries).toHaveLength(2)
      expect(stats.entries[0].hits).toBeGreaterThan(stats.entries[1].hits)
    })
  })

  describe('interval handling', () => {
    it('should convert intervals to milliseconds correctly', async () => {
      const intervals: { [key: string]: number } = {
        '1m': 60 * 1000,
        '5m': 5 * 60 * 1000,
        '15m': 15 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '4h': 4 * 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
      }

      for (const [interval, expectedMs] of Object.entries(intervals)) {
        const result = await service.fetchHistoricalData(
          testPoolAddress,
          startDate,
          new Date(startDate.getTime() + expectedMs * 2), // 2 intervals
          interval as any
        )

        expect(result.priceData).toHaveLength(2)
      }
    })

    it('should default to 1h for unknown intervals', async () => {
      const result = await service.fetchHistoricalData(
        testPoolAddress,
        startDate,
        endDate,
        'invalid' as any
      )

      // Should default to hourly (24 hours in a day)
      expect(result.priceData).toHaveLength(24)
    })
  })

  describe('preloadCommonData', () => {
    it('should preload data for common pools', async () => {
      await service.preloadCommonData()

      const stats = service.getCacheStats()
      expect(stats.size).toBeGreaterThan(0) // Should have cached some data
    })

    it('should not fail if preloading encounters errors', async () => {
      // Mock fetch to fail for preloading
      mockFetch.mockRejectedValue(new Error('Preload failed'))

      // Should not throw
      await expect(service.preloadCommonData()).resolves.toBeUndefined()
    })
  })

  describe('error handling', () => {
    it('should handle memory constraints gracefully', async () => {
      // Request a very large dataset
      const largeStartDate = new Date('2020-01-01')
      const largeEndDate = new Date('2024-01-01')

      const result = await service.fetchHistoricalData(
        testPoolAddress,
        largeStartDate,
        largeEndDate,
        '1m'
      )

      // Should complete without memory issues
      expect(result.priceData.length).toBeGreaterThan(1000000) // Very large dataset
      expect(result.metadata.coverage).toBe(1.0)
    })

    it('should handle date range validation', async () => {
      const invalidEndDate = new Date(startDate.getTime() - 1000) // Before start date

      const result = await service.fetchHistoricalData(
        testPoolAddress,
        startDate,
        invalidEndDate,
        '1h'
      )

      // Should handle gracefully (may return empty data or swap dates)
      expect(result).toBeDefined()
    })

    it('should validate input parameters', async () => {
      // Test with various edge case parameters
      const edgeCases = [
        { start: new Date(0), end: new Date(), interval: '1h' },
        { start: new Date(), end: new Date(Date.now() + 1000), interval: '1m' },
      ]

      for (const testCase of edgeCases) {
        const result = await service.fetchHistoricalData(
          testPoolAddress,
          testCase.start,
          testCase.end,
          testCase.interval as any
        )

        expect(result).toBeDefined()
        expect(result.priceData.length).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('data quality validation', () => {
    it('should generate realistic bid-ask spreads', async () => {
      const result = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1m')

      for (const pricePoint of result.priceData) {
        // High-Low spread should be reasonable (less than 5% of price)
        const spread = (pricePoint.high - pricePoint.low) / pricePoint.close
        expect(spread).toBeLessThan(0.05)
        expect(spread).toBeGreaterThanOrEqual(0)
      }
    })

    it('should maintain volume consistency', async () => {
      const result = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      for (const pricePoint of result.priceData) {
        const totalVolume = parseFloat(pricePoint.volume)
        const volumeX = parseFloat(pricePoint.volumeX)
        const volumeY = parseFloat(pricePoint.volumeY)

        // VolumeX + VolumeY should approximately equal total volume
        expect(Math.abs(totalVolume - (volumeX + volumeY))).toBeLessThan(totalVolume * 0.1)
      }
    })

    it('should create meaningful price trends', async () => {
      const result = await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')

      // Check that there are both upward and downward movements
      let upMoves = 0
      let downMoves = 0

      for (let i = 1; i < result.priceData.length; i++) {
        const priceChange = result.priceData[i].close - result.priceData[i - 1].close
        if (priceChange > 0) upMoves++
        if (priceChange < 0) downMoves++
      }

      // Should have both up and down movements (not monotonic)
      expect(upMoves).toBeGreaterThan(0)
      expect(downMoves).toBeGreaterThan(0)
    })
  })

  describe('performance characteristics', () => {
    it('should generate data efficiently for large time ranges', async () => {
      const startTime = Date.now()

      await service.fetchHistoricalData(
        testPoolAddress,
        new Date('2023-01-01'),
        new Date('2024-01-01'),
        '1h'
      )

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete within reasonable time (less than 5 seconds)
      expect(duration).toBeLessThan(5000)
    })

    it('should cache data to improve subsequent performance', async () => {
      const startTime1 = Date.now()
      await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')
      const duration1 = Date.now() - startTime1

      const startTime2 = Date.now()
      await service.fetchHistoricalData(testPoolAddress, startDate, endDate, '1h')
      const duration2 = Date.now() - startTime2

      // Cached request should be significantly faster
      expect(duration2).toBeLessThan(duration1 * 0.5)
    })
  })
})