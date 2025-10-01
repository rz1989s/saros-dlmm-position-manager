import React from 'react'
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
  dataMode: 'real' as const,
  isMockDataMode: false,
  setDataMode: jest.fn(),
}

jest.mock('../../src/contexts/data-source-context', () => ({
  useDataSource: () => mockUseDataSource,
  DataSourceProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
}))

// Mock constants
jest.mock('../../src/lib/constants', () => ({
  REFRESH_INTERVALS: {
    prices: 1000,
    analytics: 2000, // 2 seconds for testing
    positions: 3000,
  },
}))

// Create wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', {}, children)
}

describe('Pool Analytics Hooks', () => {
  const mockPoolAddress = new PublicKey('33333333333333333333333333333333')

  const mockAnalyticsData = {
    metrics: {
      tvl: '2500000',
      volume24h: '1500000',
      fees24h: '15000',
      apr: 12.5,
      activeBins: 25,
      priceChange24h: 2.5,
      volumeChange24h: -5.2,
      aprChange24h: 1.8,
      totalBins: 100,
      lastUpdated: new Date('2024-01-15'),
    },
    feeDistribution: [
      {
        binRange: '123-125',
        percentage: 25.0,
        feesCollected: '500',
        binIds: [123],
      },
      {
        binRange: '124-126',
        percentage: 37.5,
        feesCollected: '750',
        binIds: [124],
      },
      {
        binRange: '125-127',
        percentage: 12.5,
        feesCollected: '250',
        binIds: [125],
      },
    ],
    liquidityConcentration: {
      concentrationRatio: 0.65,
      highActivityBins: 5,
      mediumActivityBins: 10,
      lowActivityBins: 85,
      optimalRange: true,
      binEfficiency: {
        highActivity: 95.0,
        mediumActivity: 70.0,
        lowActivity: 30.0,
      },
    },
    historicalPerformance: {
      apr7d: 5.2,
      apr30d: 18.7,
      aprChange7d: 2.3,
      aprChange30d: -1.5,
      poolAge: 45,
      poolAgeCategory: 'mature' as const,
      volume7d: '10500000',
      volume30d: '45000000',
      fees7d: '105000',
      fees30d: '450000',
    },
    poolInfo: {
      address: new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'),
      tokenX: {
        address: new PublicKey('SOL0000000000000000000000000000000'),
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        price: 100.0,
      },
      tokenY: {
        address: new PublicKey('USDC00000000000000000000000000000'),
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        price: 1.0,
      },
      activeBin: {
        binId: 124,
        price: 100.0,
        liquidityX: '15000',
        liquidityY: '1500000',
        totalLiquidity: '1515000',
        isActive: true,
        feeRate: 0.0025,
        volume24h: '750000',
      },
      totalLiquidity: '2500000',
      volume24h: '1500000',
      fees24h: '15000',
      apr: 12.5,
      createdAt: new Date('2024-01-01'),
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

    // Setup default mock returns with better error handling
    mockDlmmClient.getCacheStats.mockReturnValue({
      pairs: { count: 10, oldestTimestamp: Date.now() - 30000 },
      positions: { count: 25, oldestTimestamp: Date.now() - 60000 },
    })

    // Ensure mocks return valid data to prevent null reference errors
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
      const { result } = renderHook(() => usePoolAnalytics(), {
        wrapper: TestWrapper
      })

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
        expect(result.current).not.toBeNull()
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
        expect(result.current).not.toBeNull()
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })

      // Add null check before accessing refreshAnalytics
      expect(result.current.refreshAnalytics).toBeDefined()

      // Track initial calls
      const initialCalls = mockDlmmClient.getPoolAnalytics.mock.calls.length

      await act(async () => {
        await result.current.refreshAnalytics()
      })

      expect(result.current.refreshing).toBe(false)
      expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledTimes(initialCalls + 1)
    })

    it('should handle refreshing state correctly', async () => {
      const { result } = renderHook(() => usePoolAnalytics(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })

      // Add null check before accessing refreshAnalytics
      expect(result.current.refreshAnalytics).toBeDefined()

      // Start refresh and immediately check refreshing state
      act(() => {
        result.current.refreshAnalytics()
      })

      // Check refreshing state before waiting for completion
      await waitFor(() => {
        expect(result.current.refreshing).toBe(false)
      }, { timeout: 5000 })
    })

    it('should set up real-time polling when enabled', async () => {
      const { result } = renderHook(() => usePoolAnalytics(mockPoolAddress, true))

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })

      // Clear initial call
      mockDlmmClient.getPoolAnalytics.mockClear()

      // Advance timer to trigger polling
      act(() => {
        jest.advanceTimersByTime(2000) // REFRESH_INTERVALS.analytics
      })

      await waitFor(() => {
        expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledTimes(1)
      }, { timeout: 5000 })
    })

    it('should not poll when refreshing', async () => {
      const { result } = renderHook(() => usePoolAnalytics(mockPoolAddress, true))

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })

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
        expect(resultReal.current).not.toBeNull()
        expect(resultReal.current.loading).toBe(false)
      }, { timeout: 5000 })

      expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledWith(mockPoolAddress, true)

      // Test mock data mode
      mockUseDataSource.isRealDataMode = false
      const { result: resultMock } = renderHook(() => usePoolAnalytics(mockPoolAddress, false))

      await waitFor(() => {
        expect(resultMock.current).not.toBeNull()
        expect(resultMock.current.loading).toBe(false)
      }, { timeout: 5000 })

      expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledWith(mockPoolAddress, false)
    })

    it('should handle non-Error exceptions', async () => {
      mockDlmmClient.getPoolAnalytics.mockRejectedValue('String error')

      const { result } = renderHook(() => usePoolAnalytics(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.error).toBe('Unknown error occurred')
      }, { timeout: 5000 })
    })

    it('should clear data when pool address becomes undefined', async () => {
      const { result, rerender } = renderHook(
        ({ poolAddress }) => usePoolAnalytics(poolAddress, false),
        { initialProps: { poolAddress: mockPoolAddress } }
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.analyticsData).toEqual(mockAnalyticsData)
      }, { timeout: 5000 })

      // Change to different pool
      rerender({ poolAddress: new PublicKey('33333333333333333333333333333333') })

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.analyticsData).toBeNull()
        expect(result.current.error).toBeNull()
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })
    })

    it('should refetch when pool address changes', async () => {
      const newPoolAddress = new PublicKey('44444444444444444444444444444444')

      const { rerender } = renderHook(
        ({ poolAddress }) => usePoolAnalytics(poolAddress, false),
        { initialProps: { poolAddress: mockPoolAddress } }
      )

      await waitFor(() => {
        expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledWith(mockPoolAddress, true)
      }, { timeout: 5000 })

      // Change pool address
      rerender({ poolAddress: newPoolAddress })

      await waitFor(() => {
        expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledWith(newPoolAddress, true)
      }, { timeout: 5000 })

      expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledTimes(2)
    })

    it('should refetch when data mode changes', async () => {
      const { rerender } = renderHook(() => usePoolAnalytics(mockPoolAddress, false))

      await waitFor(() => {
        expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledWith(mockPoolAddress, true)
      }, { timeout: 5000 })

      // Change data mode
      mockUseDataSource.isRealDataMode = false
      rerender()

      await waitFor(() => {
        expect(mockDlmmClient.getPoolAnalytics).toHaveBeenCalledWith(mockPoolAddress, false)
      }, { timeout: 5000 })
    })
  })

  describe('usePoolList', () => {
    it('should initialize with fallback pools', async () => {
      const { result } = renderHook(() => usePoolList())

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

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
        expect(result.current).not.toBeNull()
        expect(result.current.pools).toEqual(customPoolList)
      }, { timeout: 5000 })

      expect(mockDlmmClient.getAvailablePools).toHaveBeenCalled()
    })

    it('should use fallback pools when SDK returns empty array', async () => {
      mockDlmmClient.getAvailablePools.mockResolvedValue([])

      const { result } = renderHook(() => usePoolList())

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.pools).toHaveLength(2)
        expect(result.current.pools[0].name).toBe('SOL/USDC')
      }, { timeout: 5000 })
    })

    it('should handle API errors gracefully with fallback', async () => {
      mockDlmmClient.getAvailablePools.mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => usePoolList())

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.pools).toHaveLength(2)
        expect(result.current.error).toBe('API Error')
      }, { timeout: 5000 })
    })

    it('should refresh pools manually', async () => {
      const { result } = renderHook(() => usePoolList())

      await waitFor(() => {
        expect(mockDlmmClient.getAvailablePools).toHaveBeenCalledTimes(1)
      })

      // Add null check to prevent TypeError
      expect(result.current).not.toBeNull()
      expect(result.current.refreshPools).toBeDefined()

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

      // Add null check before accessing properties
      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.refreshPools).toBeDefined()
      })

      const refreshPromise = act(async () => {
        result.current.refreshPools()
      })

      expect(result.current.loading).toBe(true)

      await refreshPromise
      expect(result.current.loading).toBe(false)
    })

    it('should handle null pool list response', async () => {
      mockDlmmClient.getAvailablePools.mockResolvedValue([])

      const { result } = renderHook(() => usePoolList())

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.pools).toHaveLength(2) // Should use fallback
      }, { timeout: 5000 })
    })
  })

  describe('usePoolMetrics', () => {
    it('should return metrics from analytics data', async () => {
      const { result } = renderHook(() => usePoolMetrics(mockPoolAddress))

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })

      expect(result.current.metrics).toEqual(mockAnalyticsData.metrics)
      expect(result.current.error).toBeNull()
    })

    it('should return null metrics when no analytics data', async () => {
      const { result } = renderHook(() => usePoolMetrics())

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      expect(result.current.metrics).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('should handle analytics errors', async () => {
      mockDlmmClient.getPoolAnalytics.mockRejectedValue(new Error('Metrics failed'))

      const { result } = renderHook(() => usePoolMetrics(mockPoolAddress))

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.error).toBe('Metrics failed')
        expect(result.current.metrics).toBeNull()
      }, { timeout: 5000 })
    })
  })

  describe('usePoolFeeDistribution', () => {
    it('should return fee distribution from analytics data', async () => {
      const { result } = renderHook(() => usePoolFeeDistribution(mockPoolAddress))

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })

      expect(result.current.feeDistribution).toEqual(mockAnalyticsData.feeDistribution)
      expect(result.current.error).toBeNull()
    })

    it('should return empty array when no analytics data', async () => {
      const { result } = renderHook(() => usePoolFeeDistribution())

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      expect(result.current.feeDistribution).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it('should handle analytics errors', async () => {
      mockDlmmClient.getPoolAnalytics.mockRejectedValue(new Error('Fee distribution failed'))

      const { result } = renderHook(() => usePoolFeeDistribution(mockPoolAddress))

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.error).toBe('Fee distribution failed')
        expect(result.current.feeDistribution).toEqual([])
      }, { timeout: 5000 })
    })
  })

  describe('usePoolLiquidityConcentration', () => {
    it('should return liquidity concentration from analytics data', async () => {
      const { result } = renderHook(() => usePoolLiquidityConcentration(mockPoolAddress))

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })

      expect(result.current.liquidityConcentration).toEqual(mockAnalyticsData.liquidityConcentration)
      expect(result.current.error).toBeNull()
    })

    it('should return null when no analytics data', async () => {
      const { result } = renderHook(() => usePoolLiquidityConcentration())

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      expect(result.current.liquidityConcentration).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('should handle analytics errors', async () => {
      mockDlmmClient.getPoolAnalytics.mockRejectedValue(new Error('Liquidity concentration failed'))

      const { result } = renderHook(() => usePoolLiquidityConcentration(mockPoolAddress))

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.error).toBe('Liquidity concentration failed')
        expect(result.current.liquidityConcentration).toBeNull()
      }, { timeout: 5000 })
    })
  })

  describe('usePoolHistoricalPerformance', () => {
    it('should return historical performance from analytics data', async () => {
      const { result } = renderHook(() => usePoolHistoricalPerformance(mockPoolAddress))

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })

      expect(result.current.historicalPerformance).toEqual(mockAnalyticsData.historicalPerformance)
      expect(result.current.error).toBeNull()
    })

    it('should return null when no analytics data', async () => {
      const { result } = renderHook(() => usePoolHistoricalPerformance())

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      expect(result.current.historicalPerformance).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('should handle analytics errors', async () => {
      mockDlmmClient.getPoolAnalytics.mockRejectedValue(new Error('Historical performance failed'))

      const { result } = renderHook(() => usePoolHistoricalPerformance(mockPoolAddress))

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.error).toBe('Historical performance failed')
        expect(result.current.historicalPerformance).toBeNull()
      }, { timeout: 5000 })
    })

    it('should update when analytics data changes', async () => {
      const { result, rerender } = renderHook(
        ({ poolAddress }) => usePoolHistoricalPerformance(poolAddress),
        { initialProps: { poolAddress: mockPoolAddress } }
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.historicalPerformance).toEqual(mockAnalyticsData.historicalPerformance)
      }, { timeout: 5000 })

      // Change to different pool with different data
      const newPoolAddress = new PublicKey('44444444444444444444444444444444')
      const newHistoricalData = {
        apr7d: 3.2,
        apr30d: 12.7,
        aprChange7d: 1.5,
        aprChange30d: -2.3,
        poolAge: 30,
        poolAgeCategory: 'growing' as const,
        volume7d: '7500000',
        volume30d: '32000000',
        fees7d: '75000',
        fees30d: '320000',
      }

      mockDlmmClient.getPoolAnalytics.mockResolvedValue({
        ...mockAnalyticsData,
        historicalPerformance: newHistoricalData,
      })

      rerender({ poolAddress: newPoolAddress })

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.historicalPerformance).toEqual(newHistoricalData)
      }, { timeout: 5000 })
    })
  })

  describe('Integration Tests', () => {
    it('should handle multiple specialized hooks using same analytics data', async () => {
      const { result: metricsResult } = renderHook(() => usePoolMetrics(mockPoolAddress))
      const { result: feeResult } = renderHook(() => usePoolFeeDistribution(mockPoolAddress))
      const { result: liquidityResult } = renderHook(() => usePoolLiquidityConcentration(mockPoolAddress))
      const { result: historyResult } = renderHook(() => usePoolHistoricalPerformance(mockPoolAddress))

      await waitFor(() => {
        expect(metricsResult.current).not.toBeNull()
        expect(feeResult.current).not.toBeNull()
        expect(liquidityResult.current).not.toBeNull()
        expect(historyResult.current).not.toBeNull()
        expect(metricsResult.current.loading).toBe(false)
        expect(feeResult.current.loading).toBe(false)
        expect(liquidityResult.current.loading).toBe(false)
        expect(historyResult.current.loading).toBe(false)
      }, { timeout: 10000 })

      // All should have the same data from the same analytics call
      expect(metricsResult.current.metrics).toEqual(mockAnalyticsData.metrics)
      expect(feeResult.current.feeDistribution).toEqual(mockAnalyticsData.feeDistribution)
      expect(liquidityResult.current.liquidityConcentration).toEqual(mockAnalyticsData.liquidityConcentration)
      expect(historyResult.current.historicalPerformance).toEqual(mockAnalyticsData.historicalPerformance)
    })

    it('should handle cache integration correctly', async () => {
      const { result } = renderHook(() => usePoolAnalytics(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })

      expect(mockDlmmClient.getCacheStats).toHaveBeenCalled()
    })

    it('should handle polling with multiple hooks efficiently', async () => {
      const { result: analytics } = renderHook(() => usePoolAnalytics(mockPoolAddress, true))
      const { result: metrics } = renderHook(() => usePoolMetrics(mockPoolAddress))

      await waitFor(() => {
        expect(analytics.current).not.toBeNull()
        expect(metrics.current).not.toBeNull()
        expect(analytics.current.loading).toBe(false)
        expect(metrics.current.loading).toBe(false)
      }, { timeout: 5000 })

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