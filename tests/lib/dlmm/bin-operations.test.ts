import { PublicKey, Connection } from '@solana/web3.js'
import {
  AdvancedBinOperations,
  type AdvancedBinAnalysis,
  type BinLiquidityMetrics
} from '../../../src/lib/dlmm/bin-operations'
import type { BinInfo, LiquidityDistribution, PriceRange } from '../../../src/lib/types'
import {
  type GetBinsArrayInfoParams,
  type GetBinsReserveParams,
  type GetBinsReserveResponse
} from '@saros-finance/dlmm-sdk'

// Mock the DLMM client
jest.mock('../../../src/lib/dlmm/client', () => ({
  dlmmClient: {
    getLbPair: jest.fn(),
    getBinArrayInfo: jest.fn(),
    getBinReserves: jest.fn(),
    getConnection: jest.fn(() => new Connection('http://localhost:8899'))
  }
}))

// Mock connection manager
jest.mock('../../../src/lib/connection-manager', () => ({
  connectionManager: {
    getCurrentConnection: jest.fn(() => ({
      rpcEndpoint: 'http://localhost:8899',
      commitment: 'confirmed'
    })),
    makeRpcCall: jest.fn(async (fn) => fn()),
    executeWithFallback: jest.fn(async (fn) => fn())
  }
}))

describe('AdvancedBinOperations', () => {
  let binOperations: AdvancedBinOperations
  let mockConnection: Connection
  let mockPoolAddress: PublicKey
  let mockUserAddress: PublicKey
  let mockPositionAddress: PublicKey
  let mockGetLbPair: jest.Mock
  let mockGetBinArrayInfo: jest.Mock
  let mockGetBinReserves: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockConnection = new Connection('http://localhost:8899')
    binOperations = new AdvancedBinOperations(mockConnection)
    mockPoolAddress = new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2')
    mockUserAddress = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
    mockPositionAddress = new PublicKey('PositionAddress111111111111111111111111111')

    const { dlmmClient } = require('../../../src/lib/dlmm/client')
    mockGetLbPair = dlmmClient.getLbPair as jest.Mock
    mockGetBinArrayInfo = dlmmClient.getBinArrayInfo as jest.Mock
    mockGetBinReserves = dlmmClient.getBinReserves as jest.Mock

    // Default mock implementations
    mockGetLbPair.mockResolvedValue({
      activeId: 8388608,
      feeInfo: { baseFactor: 500 },
      tokenX: {
        address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        symbol: 'USDC',
        decimals: 6
      },
      tokenY: {
        address: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
        symbol: 'USDT',
        decimals: 6
      }
    })

    mockGetBinArrayInfo.mockResolvedValue({
      binArrayIndex: 0,
      bins: Array.from({ length: 10 }, (_, i) => ({
        binId: 8388600 + i,
        liquidityX: (Math.random() * 1000).toString(),
        liquidityY: (Math.random() * 1000).toString(),
        price: 100 + i * 0.01
      }))
    })

    mockGetBinReserves.mockResolvedValue(
      Array.from({ length: 21 }, (_, i) => ({
        binId: 8388598 + i,
        reserveX: (Math.random() * 1000).toString(),
        reserveY: (Math.random() * 1000).toString(),
        price: 100 + (i - 10) * 0.01,
        isActive: Math.random() > 0.3
      }))
    )
  })

  afterEach(() => {
    binOperations.invalidateCache('all')
  })

  describe('getAdvancedBinAnalysis', () => {
    it('should perform comprehensive bin analysis', async () => {
      const analysis = await binOperations.getAdvancedBinAnalysis(
        mockPoolAddress,
        mockUserAddress
      )

      expect(analysis).toMatchObject({
        activeBins: expect.arrayContaining([
          expect.objectContaining({
            binId: expect.any(Number),
            price: expect.any(Number),
            liquidityX: expect.any(String),
            liquidityY: expect.any(String),
            totalLiquidity: expect.any(String),
            isActive: expect.any(Boolean),
            feeRate: expect.any(Number),
            volume24h: expect.any(String)
          })
        ]),
        liquidityDistribution: expect.objectContaining({
          concentrated: expect.any(Number),
          spread: expect.any(Number),
          ranges: expect.any(Array)
        }),
        priceRanges: expect.any(Array),
        optimalRanges: expect.objectContaining({
          conservative: expect.objectContaining({
            min: expect.any(Number),
            max: expect.any(Number),
            binIds: expect.any(Array),
            liquidity: expect.any(String)
          }),
          balanced: expect.objectContaining({
            min: expect.any(Number),
            max: expect.any(Number),
            binIds: expect.any(Array),
            liquidity: expect.any(String)
          }),
          aggressive: expect.objectContaining({
            min: expect.any(Number),
            max: expect.any(Number),
            binIds: expect.any(Array),
            liquidity: expect.any(String)
          })
        }),
        binEfficiency: expect.objectContaining({
          highActivity: expect.any(Number),
          mediumActivity: expect.any(Number),
          lowActivity: expect.any(Number)
        }),
        recommendedBins: expect.arrayContaining([expect.any(Number)])
      })
    })

    it('should cache bin analysis results', async () => {
      const analysis1 = await binOperations.getAdvancedBinAnalysis(mockPoolAddress)
      const analysis2 = await binOperations.getAdvancedBinAnalysis(mockPoolAddress)

      expect(analysis1).toEqual(analysis2)
      expect(mockGetLbPair).toHaveBeenCalledTimes(1)
    })

    it('should handle pool not found error', async () => {
      mockGetLbPair.mockResolvedValue(null)

      await expect(binOperations.getAdvancedBinAnalysis(mockPoolAddress)).rejects.toThrow(
        'Pool not found'
      )
    })

    it('should analyze bins around active bin correctly', async () => {
      const analysis = await binOperations.getAdvancedBinAnalysis(mockPoolAddress)

      // Should analyze ±20 bins around active bin (8388608)
      const binRange = analysis.activeBins.map(b => b.binId)
      expect(Math.min(...binRange)).toBe(8388588) // 8388608 - 20
      expect(Math.max(...binRange)).toBe(8388628) // 8388608 + 20
    })

    it('should generate appropriate price ranges', async () => {
      const analysis = await binOperations.getAdvancedBinAnalysis(mockPoolAddress)

      analysis.priceRanges.forEach(range => {
        expect(range.min).toBeLessThan(range.max)
        expect(range.binIds).toHaveLength(5) // Should contain 5 bins per range
        expect(parseFloat(range.liquidity)).toBeGreaterThan(0)
      })
    })

    it('should calculate optimal ranges with correct risk levels', async () => {
      const analysis = await binOperations.getAdvancedBinAnalysis(mockPoolAddress)
      const activePrice = 100 * Math.pow(1.01, 8388608) // Calculated based on active bin

      // Conservative range should be tightest
      const conservativeRange = analysis.optimalRanges.conservative.max - analysis.optimalRanges.conservative.min
      const balancedRange = analysis.optimalRanges.balanced.max - analysis.optimalRanges.balanced.min
      const aggressiveRange = analysis.optimalRanges.aggressive.max - analysis.optimalRanges.aggressive.min

      expect(conservativeRange).toBeLessThan(balancedRange)
      expect(balancedRange).toBeLessThan(aggressiveRange)
    })

    it('should recommend strategic bins', async () => {
      const analysis = await binOperations.getAdvancedBinAnalysis(mockPoolAddress)

      // Should include active bin
      expect(analysis.recommendedBins).toContain(8388608)

      // Should be sorted
      const sorted = [...analysis.recommendedBins].sort((a, b) => a - b)
      expect(analysis.recommendedBins).toEqual(sorted)

      // Should have strategic distribution
      expect(analysis.recommendedBins.length).toBeGreaterThan(5)
    })

    it('should handle different active bin positions', async () => {
      mockGetLbPair.mockResolvedValue({ activeId: 9000000 })

      const analysis = await binOperations.getAdvancedBinAnalysis(mockPoolAddress)

      expect(analysis.recommendedBins).toContain(9000000)
      expect(analysis.optimalRanges.conservative.binIds).toEqual([8999995, 9000005])
    })
  })

  describe('getBinLiquidityMetrics', () => {
    it('should calculate comprehensive liquidity metrics', async () => {
      const metrics = await binOperations.getBinLiquidityMetrics(
        mockPoolAddress,
        mockUserAddress
      )

      expect(metrics).toMatchObject({
        totalLiquidity: expect.any(String),
        activeBinCount: expect.any(Number),
        averageLiquidity: expect.any(String),
        liquidityConcentration: expect.any(Number),
        priceVolatility: expect.any(Number),
        utilizationRate: expect.any(Number)
      })

      expect(parseFloat(metrics.totalLiquidity)).toBeGreaterThan(0)
      expect(metrics.activeBinCount).toBeGreaterThan(0)
      expect(parseFloat(metrics.averageLiquidity)).toBeGreaterThan(0)
      expect(metrics.liquidityConcentration).toBeGreaterThanOrEqual(0)
      expect(metrics.liquidityConcentration).toBeLessThanOrEqual(1)
      expect(metrics.utilizationRate).toBeGreaterThanOrEqual(0)
      expect(metrics.utilizationRate).toBeLessThanOrEqual(1)
    })

    it('should cache liquidity metrics', async () => {
      const metrics1 = await binOperations.getBinLiquidityMetrics(mockPoolAddress)
      const metrics2 = await binOperations.getBinLiquidityMetrics(mockPoolAddress)

      expect(metrics1).toEqual(metrics2)
      expect(mockGetLbPair).toHaveBeenCalledTimes(1)
    })

    it('should calculate concentration correctly', async () => {
      // Mock bins with concentrated liquidity around active bin
      const concentratedBins = Array.from({ length: 21 }, (_, i) => {
        const binId = 8388598 + i
        const distanceFromActive = Math.abs(binId - 8388608)
        const liquidity = distanceFromActive <= 5 ? 1000 : 10 // High liquidity in center

        return {
          binId,
          reserveX: liquidity.toString(),
          reserveY: liquidity.toString(),
          price: 100 + (i - 10) * 0.01,
          isActive: liquidity > 100
        }
      })

      mockGetBinReserves.mockResolvedValue(concentratedBins)

      const metrics = await binOperations.getBinLiquidityMetrics(mockPoolAddress)

      // Should show high concentration (most liquidity in central bins)
      expect(metrics.liquidityConcentration).toBeGreaterThan(0.7)
    })

    it('should handle zero liquidity gracefully', async () => {
      mockGetBinReserves.mockResolvedValue(
        Array.from({ length: 21 }, (_, i) => ({
          binId: 8388598 + i,
          reserveX: '0',
          reserveY: '0',
          price: 100 + (i - 10) * 0.01,
          isActive: false
        }))
      )

      const metrics = await binOperations.getBinLiquidityMetrics(mockPoolAddress)

      expect(metrics.totalLiquidity).toBe('0')
      expect(metrics.activeBinCount).toBe(0)
      expect(metrics.averageLiquidity).toBe('0')
      expect(metrics.utilizationRate).toBe(0)
    })

    it('should calculate price volatility accurately', async () => {
      // Mock bins with varying prices for volatility calculation
      const volatileBins = Array.from({ length: 21 }, (_, i) => ({
        binId: 8388598 + i,
        reserveX: '100',
        reserveY: '100',
        price: 100 + Math.sin(i) * 10, // Volatile price pattern
        isActive: true
      }))

      mockGetBinReserves.mockResolvedValue(volatileBins)

      const metrics = await binOperations.getBinLiquidityMetrics(mockPoolAddress)

      expect(metrics.priceVolatility).toBeGreaterThan(0)
      expect(Number.isFinite(metrics.priceVolatility)).toBe(true)
    })
  })

  describe('getEnhancedBinArrayInfo', () => {
    it('should call SDK with correct parameters', async () => {
      const binArrayIndex = 0

      await binOperations.getEnhancedBinArrayInfo(
        mockPoolAddress,
        binArrayIndex,
        mockUserAddress
      )

      expect(mockGetBinArrayInfo).toHaveBeenCalledWith({
        binArrayIndex,
        pair: mockPoolAddress,
        payer: mockUserAddress
      } as GetBinsArrayInfoParams)
    })

    it('should handle SDK errors gracefully', async () => {
      mockGetBinArrayInfo.mockRejectedValue(new Error('SDK Error'))

      await expect(binOperations.getEnhancedBinArrayInfo(
        mockPoolAddress,
        0,
        mockUserAddress
      )).rejects.toThrow('SDK Error')
    })

    it('should return SDK response directly', async () => {
      const mockResponse = { binArrayIndex: 0, bins: [] }
      mockGetBinArrayInfo.mockResolvedValue(mockResponse)

      const result = await binOperations.getEnhancedBinArrayInfo(
        mockPoolAddress,
        0,
        mockUserAddress
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe('getEnhancedBinReserves', () => {
    it('should call SDK with correct parameters', async () => {
      await binOperations.getEnhancedBinReserves(
        mockPositionAddress,
        mockPoolAddress,
        mockUserAddress
      )

      expect(mockGetBinReserves).toHaveBeenCalledWith({
        position: mockPositionAddress,
        pair: mockPoolAddress,
        payer: mockUserAddress
      } as GetBinsReserveParams)
    })

    it('should return empty array on error', async () => {
      mockGetBinReserves.mockRejectedValue(new Error('SDK Error'))

      const result = await binOperations.getEnhancedBinReserves(
        mockPositionAddress,
        mockPoolAddress,
        mockUserAddress
      )

      expect(result).toEqual([])
    })

    it('should return SDK response on success', async () => {
      const mockResponse: GetBinsReserveResponse[] = [
        {
          binId: 8388608,
          reserveX: '1000',
          reserveY: '1000',
          price: 1.0,
          isActive: true
        }
      ]
      mockGetBinReserves.mockResolvedValue(mockResponse)

      const result = await binOperations.getEnhancedBinReserves(
        mockPositionAddress,
        mockPoolAddress,
        mockUserAddress
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe('bin price calculations', () => {
    it('should calculate bin prices correctly', async () => {
      const analysis = await binOperations.getAdvancedBinAnalysis(mockPoolAddress)

      analysis.activeBins.forEach((bin, i) => {
        if (i > 0) {
          // Prices should increase with bin ID
          if (bin.binId > analysis.activeBins[i - 1].binId) {
            expect(bin.price).toBeGreaterThanOrEqual(analysis.activeBins[i - 1].price)
          }
        }
      })
    })

    it('should handle extreme bin IDs', async () => {
      mockGetLbPair.mockResolvedValue({ activeId: 0 }) // Minimum bin ID

      const analysis = await binOperations.getAdvancedBinAnalysis(mockPoolAddress)

      analysis.activeBins.forEach(bin => {
        expect(bin.price).toBeGreaterThan(0)
        expect(Number.isFinite(bin.price)).toBe(true)
      })
    })
  })

  describe('liquidity distribution analysis', () => {
    it('should calculate distribution percentages correctly', async () => {
      const analysis = await binOperations.getAdvancedBinAnalysis(mockPoolAddress)

      const { concentrated, spread } = analysis.liquidityDistribution

      expect(concentrated).toBeGreaterThanOrEqual(0)
      expect(concentrated).toBeLessThanOrEqual(1)
      expect(spread).toBeGreaterThanOrEqual(0)
      expect(spread).toBeLessThanOrEqual(1)
      expect(Math.abs(concentrated + spread - 1)).toBeLessThan(0.01) // Should sum to ~1
    })

    it('should identify price ranges correctly', async () => {
      const analysis = await binOperations.getAdvancedBinAnalysis(mockPoolAddress)

      analysis.liquidityDistribution.ranges.forEach(range => {
        expect(range.binIds).toHaveLength(5)
        expect(range.min).toBeLessThan(range.max)
        expect(parseFloat(range.liquidity)).toBeGreaterThan(0)

        // Bin IDs should be consecutive
        range.binIds.sort((a, b) => a - b)
        for (let i = 1; i < range.binIds.length; i++) {
          expect(range.binIds[i]).toBe(range.binIds[i - 1] + 1)
        }
      })
    })
  })

  describe('bin efficiency calculations', () => {
    it('should provide realistic efficiency metrics', async () => {
      const analysis = await binOperations.getAdvancedBinAnalysis(mockPoolAddress)

      const { highActivity, mediumActivity, lowActivity } = analysis.binEfficiency

      expect(highActivity).toBeGreaterThan(mediumActivity)
      expect(mediumActivity).toBeGreaterThan(lowActivity)

      // All should be between 0 and 1
      expect(highActivity).toBeGreaterThan(0)
      expect(highActivity).toBeLessThanOrEqual(1)
      expect(mediumActivity).toBeGreaterThan(0)
      expect(mediumActivity).toBeLessThanOrEqual(1)
      expect(lowActivity).toBeGreaterThan(0)
      expect(lowActivity).toBeLessThanOrEqual(1)
    })
  })

  describe('cache management', () => {
    it('should invalidate specific cache types', () => {
      binOperations.invalidateCache('analysis')

      // Should not throw any errors
      expect(() => binOperations.invalidateCache('metrics')).not.toThrow()
      expect(() => binOperations.invalidateCache('all')).not.toThrow()
    })

    it('should provide cache statistics', () => {
      const stats = binOperations.getCacheStats()

      expect(stats).toMatchObject({
        count: expect.any(Number),
        oldestTimestamp: expect.any(Number)
      })

      expect(stats.count).toBeGreaterThanOrEqual(0)
      expect(stats.oldestTimestamp).toBeGreaterThan(0)
    })

    it('should track cache age correctly', async () => {
      const beforeTime = Date.now()
      await binOperations.getAdvancedBinAnalysis(mockPoolAddress)

      const stats = binOperations.getCacheStats()
      expect(stats.oldestTimestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(stats.count).toBe(1)
    })

    it('should update cache statistics after operations', async () => {
      const initialStats = binOperations.getCacheStats()

      await binOperations.getAdvancedBinAnalysis(mockPoolAddress)
      await binOperations.getBinLiquidityMetrics(mockPoolAddress)

      const finalStats = binOperations.getCacheStats()
      expect(finalStats.count).toBeGreaterThan(initialStats.count)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle missing active ID gracefully', async () => {
      mockGetLbPair.mockResolvedValue({ activeId: undefined })

      const analysis = await binOperations.getAdvancedBinAnalysis(mockPoolAddress)

      // Should use 0 as default active ID
      expect(analysis.recommendedBins).toContain(0)
    })

    it('should handle empty bin data', async () => {
      mockGetBinReserves.mockResolvedValue([])

      const metrics = await binOperations.getBinLiquidityMetrics(mockPoolAddress)

      expect(metrics.totalLiquidity).toBe('0')
      expect(metrics.activeBinCount).toBe(0)
      expect(metrics.averageLiquidity).toBe('0')
      expect(metrics.utilizationRate).toBe(0)
    })

    it('should handle bins with null/undefined reserves', async () => {
      mockGetBinReserves.mockResolvedValue([
        { binId: 1, reserveX: null, reserveY: undefined, price: 1.0, isActive: false },
        { binId: 2, reserveX: '100', reserveY: '200', price: 1.01, isActive: true }
      ])

      const metrics = await binOperations.getBinLiquidityMetrics(mockPoolAddress)

      expect(parseFloat(metrics.totalLiquidity)).toBe(300) // Only valid reserves counted
      expect(metrics.activeBinCount).toBe(1)
    })

    it('should handle single bin scenarios', async () => {
      mockGetBinReserves.mockResolvedValue([
        { binId: 8388608, reserveX: '1000', reserveY: '1000', price: 1.0, isActive: true }
      ])

      const metrics = await binOperations.getBinLiquidityMetrics(mockPoolAddress)

      expect(metrics.priceVolatility).toBe(0) // No variance with single price
      expect(metrics.utilizationRate).toBe(1) // 100% utilization
    })

    it('should handle extreme liquidity concentrations', async () => {
      // All liquidity in one bin
      const extremeBins = Array.from({ length: 21 }, (_, i) => ({
        binId: 8388598 + i,
        reserveX: i === 10 ? '10000' : '0', // All liquidity in middle bin
        reserveY: i === 10 ? '10000' : '0',
        price: 100 + (i - 10) * 0.01,
        isActive: i === 10
      }))

      mockGetBinReserves.mockResolvedValue(extremeBins)

      const metrics = await binOperations.getBinLiquidityMetrics(mockPoolAddress)

      expect(metrics.liquidityConcentration).toBeGreaterThan(0.9) // Highly concentrated
      expect(metrics.activeBinCount).toBe(1)
    })

    it('should handle negative or zero prices', async () => {
      const invalidPriceBins = Array.from({ length: 21 }, (_, i) => ({
        binId: 8388598 + i,
        reserveX: '100',
        reserveY: '100',
        price: i < 10 ? 0 : -1, // Invalid prices
        isActive: true
      }))

      mockGetBinReserves.mockResolvedValue(invalidPriceBins)

      const metrics = await binOperations.getBinLiquidityMetrics(mockPoolAddress)

      expect(metrics.priceVolatility).toBe(0) // Should filter out invalid prices
    })

    it('should handle very large numbers', async () => {
      const largeBins = Array.from({ length: 21 }, (_, i) => ({
        binId: 8388598 + i,
        reserveX: '999999999999999999', // Very large number
        reserveY: '999999999999999999',
        price: 1000000 + i,
        isActive: true
      }))

      mockGetBinReserves.mockResolvedValue(largeBins)

      const metrics = await binOperations.getBinLiquidityMetrics(mockPoolAddress)

      expect(Number.isFinite(parseFloat(metrics.totalLiquidity))).toBe(true)
      expect(Number.isFinite(metrics.priceVolatility)).toBe(true)
    })
  })

  describe('bin array management', () => {
    it('should handle multiple bin array indices', async () => {
      const binArrayIndices = [0, 1, -1, 2]

      for (const index of binArrayIndices) {
        await expect(binOperations.getEnhancedBinArrayInfo(
          mockPoolAddress,
          index,
          mockUserAddress
        )).resolves.toBeDefined()

        expect(mockGetBinArrayInfo).toHaveBeenCalledWith(
          expect.objectContaining({ binArrayIndex: index })
        )
      }
    })

    it('should handle bin array overflow/underflow', async () => {
      const extremeIndices = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, 0]

      for (const index of extremeIndices) {
        await binOperations.getEnhancedBinArrayInfo(
          mockPoolAddress,
          index,
          mockUserAddress
        )

        expect(mockGetBinArrayInfo).toHaveBeenCalledWith(
          expect.objectContaining({ binArrayIndex: index })
        )
      }
    })
  })

  describe('bin reserve calculations', () => {
    it('should calculate reserves accurately for position', async () => {
      const mockReserves: GetBinsReserveResponse[] = [
        { binId: 1, reserveX: '1000.5', reserveY: '2000.75', price: 1.0, isActive: true },
        { binId: 2, reserveX: '1500.25', reserveY: '3000.50', price: 1.01, isActive: true }
      ]

      mockGetBinReserves.mockResolvedValue(mockReserves)

      const reserves = await binOperations.getEnhancedBinReserves(
        mockPositionAddress,
        mockPoolAddress,
        mockUserAddress
      )

      expect(reserves).toEqual(mockReserves)
      expect(reserves).toHaveLength(2)

      reserves.forEach(reserve => {
        expect(reserve.binId).toBeDefined()
        expect(reserve.reserveX).toBeDefined()
        expect(reserve.reserveY).toBeDefined()
        expect(reserve.price).toBeDefined()
        expect(typeof reserve.isActive).toBe('boolean')
      })
    })

    it('should handle decimal precision in reserves', async () => {
      const preciseReserves: GetBinsReserveResponse[] = [
        {
          binId: 1,
          reserveX: '1000.123456789',
          reserveY: '2000.987654321',
          price: 1.000001,
          isActive: true
        }
      ]

      mockGetBinReserves.mockResolvedValue(preciseReserves)

      const reserves = await binOperations.getEnhancedBinReserves(
        mockPositionAddress,
        mockPoolAddress,
        mockUserAddress
      )

      expect(reserves[0].reserveX).toBe('1000.123456789')
      expect(reserves[0].reserveY).toBe('2000.987654321')
    })
  })
})