import { renderHook, act, waitFor } from '@testing-library/react'
import { PublicKey } from '@solana/web3.js'
import {
  usePoolAnalytics,
  usePoolList,
  usePoolMetrics,
  usePoolFeeDistribution,
  usePoolLiquidityConcentration,
  usePoolHistoricalPerformance
} from '../../src/hooks/use-pool-analytics'

// Mock the DLMM client
jest.mock('../../src/lib/dlmm/client', () => ({
  dlmmClient: {
    getPoolAnalytics: jest.fn(),
    getAvailablePools: jest.fn(),
    getCacheStats: jest.fn(),
  },
}))

// Get the mocked client for type checking
import { dlmmClient } from '../../src/lib/dlmm/client'
const mockDlmmClient = dlmmClient as jest.Mocked<typeof dlmmClient>

// Mock the data source context
const mockUseDataSource = {
  isRealDataMode: true,
}

jest.mock('../../src/contexts/data-source-context', () => ({
  useDataSource: () => mockUseDataSource,
}))

// Mock constants
jest.mock('../../src/lib/constants', () => ({
  REFRESH_INTERVALS: {
    prices: 1000,
    analytics: 2000, // 2 seconds for testing
    positions: 3000,
  },
}))

describe('Pool Analytics Hooks', () => {
  const mockPoolAddress = new PublicKey('33333333333333333333333333333333')

  const mockAnalyticsData = {
    metrics: {
      tvl: 2500000,
      volume24h: 1500000,
      apr: 12.5,
      activeBins: 25,
      feesGenerated: 15000,
      priceRange: { min: 95.0, max: 105.0 },
    },
    feeDistribution: [
      { binId: 123, fees: 500, percentage: 25.0 },
      { binId: 124, fees: 750, percentage: 37.5 },
      { binId: 125, fees: 250, percentage: 12.5 },
    ],
    liquidityConcentration: {
      concentrated: 0.65,
      spread: 0.35,
      bins: [
        { binId: 123, liquidity: 10000, percentage: 40.0 },
        { binId: 124, liquidity: 15000, percentage: 60.0 },
      ],
    },
    historicalPerformance: {
      performance7d: 5.2,
      performance30d: 18.7,
      performance90d: 52.3,
      maxDrawdown: -8.5,
      sharpeRatio: 1.85,
      dataPoints: [
        { timestamp: new Date('2024-01-01'), value: 100 },
        { timestamp: new Date('2024-01-02'), value: 105 },
      ],
    },
  }

  const mockPoolList = [
    {
      address: new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'),
      name: 'SOL/USDC',
      tokenX: 'SOL',
      tokenY: 'USDC',
      tvl: '2500000',
      volume24h: '1500000',
      apr: 12.5,
      isActive: true,
    },
    {
      address: new PublicKey('Cx4xoCsJbvFLLH61MPdUp6CvEeaUKgUnpWzTRZC81rXG'),
      name: 'RAY/SOL',
      tokenX: 'RAY',
      tokenY: 'SOL',
      tvl: '1800000',
      volume24h: '900000',
      apr: 15.8,
      isActive: true,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()

    // Reset console spies to avoid interference
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})

    // Setup default mock returns
    mockDlmmClient.getCacheStats.mockReturnValue({
      hitRate: 95.0,
      missRate: 5.0,
      totalRequests: 300,
      cacheSize: 150,
      lastClear: new Date(),
    })

    mockDlmmClient.getPoolAnalytics.mockResolvedValue(mockAnalyticsData)
    mockDlmmClient.getAvailablePools.mockResolvedValue(mockPoolList)

    mockUseDataSource.isRealDataMode = true
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('usePoolAnalytics', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => usePoolAnalytics())

      expect(result.current.analyticsData).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.refreshing).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.lastUpdate).toBeNull()
    })

    it('should fetch analytics data successfully', async () => {
      const { result } = renderHook(() => usePoolAnalytics(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.analyticsData).toEqual(mockAnalyticsData)
      expect(result.current.lastUpdate).toBeDefined()
      expect(result.current.error).toBeNull()
      expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledWith(mockPoolAddress, true)
    })

    it('should handle string pool address', async () => {
      const { result } = renderHook(() =>
        usePoolAnalytics('33333333333333333333333333333333', false)
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledWith(
        expect.any(PublicKey),
        true
      )
    })

    it('should handle missing pool address', async () => {
      const { result } = renderHook(() => usePoolAnalytics(undefined, false))

      await waitFor(() => {
        expect(result.current.analyticsData).toBeNull()
        expect(result.current.error).toBeNull()
      })

      expect(mockDlmmClient.getPoolAnalytics).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      mockDlmmClient.getPoolAnalytics.mockRejectedValue(new Error('Analytics failed'))

      const { result } = renderHook(() => usePoolAnalytics(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Analytics failed')
        expect(result.current.analyticsData).toBeNull()
        expect(result.current.loading).toBe(false)
      })
    })

    it('should refresh analytics manually', async () => {
      const { result } = renderHook(() => usePoolAnalytics(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshAnalytics()
      })

      expect(result.current.refreshing).toBe(false)
      expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledTimes(2)
    })

    it('should handle refreshing state correctly', async () => {
      const { result } = renderHook(() => usePoolAnalytics(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Start refresh
      const refreshPromise = act(async () => {
        result.current.refreshAnalytics()
      })

      expect(result.current.refreshing).toBe(true)

      await refreshPromise
      expect(result.current.refreshing).toBe(false)
    })

    it('should set up real-time polling when enabled', async () => {
      const { result } = renderHook(() => usePoolAnalytics(mockPoolAddress, true))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear initial call
      mockDlmmClient.getPoolAnalytics.mockClear()

      // Advance timer to trigger polling
      act(() => {
        jest.advanceTimersByTime(2000) // REFRESH_INTERVALS.analytics
      })

      await waitFor(() => {
        expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledTimes(1)
      })
    })

    it('should not poll when refreshing', async () => {
      const { result } = renderHook(() => usePoolAnalytics(mockPoolAddress, true))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Start a manual refresh
      const refreshPromise = act(async () => {
        result.current.refreshAnalytics()
      })

      // Clear the call from refresh
      mockDlmmClient.getPoolAnalytics.mockClear()

      // Advance timer while refreshing
      act(() => {
        jest.advanceTimersByTime(2000)
      })

      // Should not have made additional calls while refreshing
      expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledTimes(1) // Only from the manual refresh

      await refreshPromise
    })

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() => usePoolAnalytics(mockPoolAddress, true))

      unmount()

      // Clear initial calls
      mockDlmmClient.getPoolAnalytics.mockClear()

      act(() => {
        jest.advanceTimersByTime(2000)
      })

      expect(mockDlmmClient.getPoolAnalytics).not.toHaveBeenCalled()
    })

    it('should respect data source mode', async () => {
      // Test real data mode
      mockUseDataSource.isRealDataMode = true
      const { result: resultReal } = renderHook(() => usePoolAnalytics(mockPoolAddress, false))

      await waitFor(() => {
        expect(resultReal.current.loading).toBe(false)
      })

      expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledWith(mockPoolAddress, true)

      // Test mock data mode
      mockUseDataSource.isRealDataMode = false
      const { result: resultMock } = renderHook(() => usePoolAnalytics(mockPoolAddress, false))

      await waitFor(() => {
        expect(resultMock.current.loading).toBe(false)
      })

      expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledWith(mockPoolAddress, false)
    })

    it('should handle non-Error exceptions', async () => {
      mockDlmmClient.getPoolAnalytics.mockRejectedValue('String error')

      const { result } = renderHook(() => usePoolAnalytics(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Unknown error occurred')
      })
    })

    it('should clear data when pool address becomes undefined', async () => {
      const { result, rerender } = renderHook(
        ({ poolAddress }) => usePoolAnalytics(poolAddress, false),
        { initialProps: { poolAddress: mockPoolAddress } }
      )

      await waitFor(() => {
        expect(result.current.analyticsData).toEqual(mockAnalyticsData)
      })

      // Change to undefined
      rerender({ poolAddress: undefined })

      await waitFor(() => {
        expect(result.current.analyticsData).toBeNull()
        expect(result.current.error).toBeNull()
        expect(result.current.loading).toBe(false)
      })
    })

    it('should refetch when pool address changes', async () => {
      const newPoolAddress = new PublicKey('44444444444444444444444444444444')

      const { result, rerender } = renderHook(
        ({ poolAddress }) => usePoolAnalytics(poolAddress, false),
        { initialProps: { poolAddress: mockPoolAddress } }
      )

      await waitFor(() => {
        expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledWith(mockPoolAddress, true)
      })

      // Change pool address
      rerender({ poolAddress: newPoolAddress })

      await waitFor(() => {
        expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledWith(newPoolAddress, true)
      })

      expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledTimes(2)
    })

    it('should refetch when data mode changes', async () => {
      const { rerender } = renderHook(() => usePoolAnalytics(mockPoolAddress, false))

      await waitFor(() => {
        expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledWith(mockPoolAddress, true)
      })

      // Change data mode
      mockUseDataSource.isRealDataMode = false
      rerender()

      await waitFor(() => {
        expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledWith(mockPoolAddress, false)
      })
    })
  })

  describe('usePoolList', () => {
    it('should initialize with fallback pools', () => {
      const { result } = renderHook(() => usePoolList())

      expect(result.current.pools).toHaveLength(2)
      expect(result.current.pools[0].name).toBe('SOL/USDC')
      expect(result.current.pools[1].name).toBe('RAY/SOL')
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should fetch available pools successfully', async () => {
      const customPoolList = [
        {
          address: new PublicKey('11111111111111111111111111111111'),
          name: 'BTC/USDC',
          tokenX: 'BTC',
          tokenY: 'USDC',
          tvl: '5000000',
          volume24h: '3000000',
          apr: 20.0,
          isActive: true,
        },
      ]

      mockDlmmClient.getAvailablePools.mockResolvedValue(customPoolList)

      const { result } = renderHook(() => usePoolList())

      await waitFor(() => {
        expect(result.current.pools).toEqual(customPoolList)
      })

      expect(mockDlmmClient.getAvailablePools).toHaveBeenCalled()
    })

    it('should use fallback pools when SDK returns empty array', async () => {
      mockDlmmClient.getAvailablePools.mockResolvedValue([])

      const { result } = renderHook(() => usePoolList())

      await waitFor(() => {
        expect(result.current.pools).toHaveLength(2)
        expect(result.current.pools[0].name).toBe('SOL/USDC')
      })
    })

    it('should handle API errors gracefully with fallback', async () => {
      mockDlmmClient.getAvailablePools.mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => usePoolList())

      await waitFor(() => {
        expect(result.current.pools).toHaveLength(2)
        expect(result.current.error).toBe('API Error')
      })
    })

    it('should refresh pools manually', async () => {
      const { result } = renderHook(() => usePoolList())

      await waitFor(() => {
        expect(mockDlmmClient.getAvailablePools).toHaveBeenCalledTimes(1)
      })

      await act(async () => {
        await result.current.refreshPools()
      })

      expect(mockDlmmClient.getAvailablePools).toHaveBeenCalledTimes(2)
      expect(result.current.loading).toBe(false)
    })

    it('should handle loading state during refresh', async () => {
      mockDlmmClient.getAvailablePools.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPoolList), 100))
      )

      const { result } = renderHook(() => usePoolList())

      const refreshPromise = act(async () => {
        result.current.refreshPools()
      })

      expect(result.current.loading).toBe(true)

      await refreshPromise
      expect(result.current.loading).toBe(false)
    })

    it('should handle null pool list response', async () => {
      mockDlmmClient.getAvailablePools.mockResolvedValue(null)

      const { result } = renderHook(() => usePoolList())

      await waitFor(() => {
        expect(result.current.pools).toHaveLength(2) // Should use fallback
      })
    })
  })

  describe('usePoolMetrics', () => {
    it('should return metrics from analytics data', async () => {
      const { result } = renderHook(() => usePoolMetrics(mockPoolAddress))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.metrics).toEqual(mockAnalyticsData.metrics)
      expect(result.current.error).toBeNull()
    })

    it('should return null metrics when no analytics data', () => {
      const { result } = renderHook(() => usePoolMetrics())

      expect(result.current.metrics).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('should handle analytics errors', async () => {
      mockDlmmClient.getPoolAnalytics.mockRejectedValue(new Error('Metrics failed'))

      const { result } = renderHook(() => usePoolMetrics(mockPoolAddress))

      await waitFor(() => {
        expect(result.current.error).toBe('Metrics failed')
        expect(result.current.metrics).toBeNull()
      })
    })
  })

  describe('usePoolFeeDistribution', () => {
    it('should return fee distribution from analytics data', async () => {
      const { result } = renderHook(() => usePoolFeeDistribution(mockPoolAddress))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.feeDistribution).toEqual(mockAnalyticsData.feeDistribution)
      expect(result.current.error).toBeNull()
    })

    it('should return empty array when no analytics data', () => {
      const { result } = renderHook(() => usePoolFeeDistribution())

      expect(result.current.feeDistribution).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it('should handle analytics errors', async () => {
      mockDlmmClient.getPoolAnalytics.mockRejectedValue(new Error('Fee distribution failed'))

      const { result } = renderHook(() => usePoolFeeDistribution(mockPoolAddress))

      await waitFor(() => {
        expect(result.current.error).toBe('Fee distribution failed')
        expect(result.current.feeDistribution).toEqual([])
      })
    })
  })

  describe('usePoolLiquidityConcentration', () => {
    it('should return liquidity concentration from analytics data', async () => {
      const { result } = renderHook(() => usePoolLiquidityConcentration(mockPoolAddress))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.liquidityConcentration).toEqual(mockAnalyticsData.liquidityConcentration)
      expect(result.current.error).toBeNull()
    })

    it('should return null when no analytics data', () => {
      const { result } = renderHook(() => usePoolLiquidityConcentration())

      expect(result.current.liquidityConcentration).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('should handle analytics errors', async () => {
      mockDlmmClient.getPoolAnalytics.mockRejectedValue(new Error('Liquidity concentration failed'))

      const { result } = renderHook(() => usePoolLiquidityConcentration(mockPoolAddress))

      await waitFor(() => {
        expect(result.current.error).toBe('Liquidity concentration failed')
        expect(result.current.liquidityConcentration).toBeNull()
      })
    })
  })

  describe('usePoolHistoricalPerformance', () => {
    it('should return historical performance from analytics data', async () => {
      const { result } = renderHook(() => usePoolHistoricalPerformance(mockPoolAddress))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.historicalPerformance).toEqual(mockAnalyticsData.historicalPerformance)
      expect(result.current.error).toBeNull()
    })

    it('should return null when no analytics data', () => {
      const { result } = renderHook(() => usePoolHistoricalPerformance())

      expect(result.current.historicalPerformance).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('should handle analytics errors', async () => {
      mockDlmmClient.getPoolAnalytics.mockRejectedValue(new Error('Historical performance failed'))

      const { result } = renderHook(() => usePoolHistoricalPerformance(mockPoolAddress))

      await waitFor(() => {
        expect(result.current.error).toBe('Historical performance failed')
        expect(result.current.historicalPerformance).toBeNull()
      })
    })

    it('should update when analytics data changes', async () => {
      const { result, rerender } = renderHook(
        ({ poolAddress }) => usePoolHistoricalPerformance(poolAddress),
        { initialProps: { poolAddress: mockPoolAddress } }
      )

      await waitFor(() => {
        expect(result.current.historicalPerformance).toEqual(mockAnalyticsData.historicalPerformance)
      })

      // Change to different pool with different data
      const newPoolAddress = new PublicKey('44444444444444444444444444444444')
      const newHistoricalData = {
        performance7d: 3.2,
        performance30d: 12.7,
        performance90d: 35.3,
        maxDrawdown: -5.5,
        sharpeRatio: 2.15,
        dataPoints: [],
      }

      mockDlmmClient.getPoolAnalytics.mockResolvedValue({
        ...mockAnalyticsData,
        historicalPerformance: newHistoricalData,
      })

      rerender({ poolAddress: newPoolAddress })

      await waitFor(() => {
        expect(result.current.historicalPerformance).toEqual(newHistoricalData)
      })
    })
  })

  describe('Integration Tests', () => {
    it('should handle multiple specialized hooks using same analytics data', async () => {
      const { result: metricsResult } = renderHook(() => usePoolMetrics(mockPoolAddress))
      const { result: feeResult } = renderHook(() => usePoolFeeDistribution(mockPoolAddress))
      const { result: liquidityResult } = renderHook(() => usePoolLiquidityConcentration(mockPoolAddress))
      const { result: historyResult } = renderHook(() => usePoolHistoricalPerformance(mockPoolAddress))

      await waitFor(() => {
        expect(metricsResult.current.loading).toBe(false)
        expect(feeResult.current.loading).toBe(false)
        expect(liquidityResult.current.loading).toBe(false)
        expect(historyResult.current.loading).toBe(false)
      })

      // All should have the same data from the same analytics call
      expect(metricsResult.current.metrics).toEqual(mockAnalyticsData.metrics)
      expect(feeResult.current.feeDistribution).toEqual(mockAnalyticsData.feeDistribution)
      expect(liquidityResult.current.liquidityConcentration).toEqual(mockAnalyticsData.liquidityConcentration)
      expect(historyResult.current.historicalPerformance).toEqual(mockAnalyticsData.historicalPerformance)
    })

    it('should handle cache integration correctly', async () => {
      const { result } = renderHook(() => usePoolAnalytics(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockDlmmClient.getCacheStats).toHaveBeenCalled()
    })

    it('should handle polling with multiple hooks efficiently', async () => {
      const { result: analytics } = renderHook(() => usePoolAnalytics(mockPoolAddress, true))
      const { result: metrics } = renderHook(() => usePoolMetrics(mockPoolAddress))

      await waitFor(() => {
        expect(analytics.current.loading).toBe(false)
        expect(metrics.current.loading).toBe(false)
      })

      // Clear call count
      mockDlmmClient.getPoolAnalytics.mockClear()

      // Advance timer
      act(() => {
        jest.advanceTimersByTime(2000)
      })

      // Only the analytics hook with polling enabled should make additional calls
      expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledTimes(1)
    })
  })
})