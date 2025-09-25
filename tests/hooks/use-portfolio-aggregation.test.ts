import { renderHook, act, waitFor } from '@testing-library/react'
import { PublicKey } from '@solana/web3.js'
import {
  usePortfolioAggregation,
  usePortfolioSummary,
  useConsolidationOpportunities,
  useDiversificationAnalysis,
  usePortfolioInsights,
  usePortfolioCache,
  useComprehensivePortfolioManagement
} from '../../src/hooks/use-portfolio-aggregation'

// Mock the wallet adapter
const mockUseWallet = {
  publicKey: new PublicKey('11111111111111111111111111111112'),
  connected: true,
}

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockUseWallet,
}))

// Mock the portfolio aggregation manager
jest.mock('../../src/lib/dlmm/portfolio-aggregation', () => ({
  portfolioAggregationManager: {
    aggregatePositionsByPair: jest.fn(),
    generatePortfolioSummary: jest.fn(),
    identifyConsolidationOpportunities: jest.fn(),
    analyzeDiversification: jest.fn(),
    getCacheStats: jest.fn(),
    clearCache: jest.fn(),
  },
}))

// Get the mocked manager for type checking
import { portfolioAggregationManager } from '../../src/lib/dlmm/portfolio-aggregation'
const mockPortfolioAggregationManager = portfolioAggregationManager as jest.Mocked<typeof portfolioAggregationManager>

// Mock constants
jest.mock('../../src/lib/constants', () => ({
  REFRESH_INTERVALS: {
    prices: 1000,
    analytics: 2000,
    positions: 3000,
  },
}))

describe('Portfolio Aggregation Hooks', () => {
  const mockPositions = [
    {
      id: '1',
      poolAddress: new PublicKey('22222222222222222222222222222222'),
      tokenX: { address: 'USDC', symbol: 'USDC', decimals: 6 },
      tokenY: { address: 'SOL', symbol: 'SOL', decimals: 9 },
      liquidityAmount: '1000',
    },
    {
      id: '2',
      poolAddress: new PublicKey('33333333333333333333333333333333'),
      tokenX: { address: 'USDC', symbol: 'USDC', decimals: 6 },
      tokenY: { address: 'SOL', symbol: 'SOL', decimals: 9 },
      liquidityAmount: '2000',
    },
  ]

  const mockAnalytics = [
    {
      positionId: '1',
      currentValue: 1000,
      totalFees: 50,
      apr: 12.5,
      riskScore: 25,
    },
    {
      positionId: '2',
      currentValue: 2000,
      totalFees: 100,
      apr: 15.0,
      riskScore: 30,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()

    // Reset wallet connection state
    mockUseWallet.connected = true

    // Setup default mock returns
    mockPortfolioAggregationManager.getCacheStats.mockReturnValue({
      hitRate: 92.5,
      missRate: 7.5,
      totalRequests: 180,
      cacheSize: 80,
      lastClear: new Date(),
    })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('usePortfolioAggregation', () => {
    const mockPortfolioPositions = [
      {
        tokenPair: 'USDC/SOL',
        positions: mockPositions,
        aggregatedMetrics: {
          totalValue: 3000,
          totalLiquidity: '3000',
          positionCount: 2,
          avgApr: 13.75,
          totalFees: 150,
        },
        riskMetrics: {
          overallRiskScore: 27.5,
          volatilityScore: 20,
          liquidityRisk: 15,
        },
      },
    ]

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => usePortfolioAggregation([], false))

      expect(result.current.portfolioPositions).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.lastUpdate).toBeNull()
    })

    it('should aggregate positions successfully', async () => {
      mockPortfolioAggregationManager.aggregatePositionsByPair.mockResolvedValue(mockPortfolioPositions)

      const { result } = renderHook(() => usePortfolioAggregation(mockPositions, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.portfolioPositions).toEqual(mockPortfolioPositions)
      expect(result.current.lastUpdate).toBeDefined()
      expect(mockPortfolioAggregationManager.aggregatePositionsByPair).toHaveBeenCalledWith(
        mockPositions,
        mockUseWallet.publicKey
      )
    })

    it('should handle empty positions array', async () => {
      const { result } = renderHook(() => usePortfolioAggregation([], false))

      await waitFor(() => {
        expect(result.current.portfolioPositions).toEqual([])
      })

      expect(mockPortfolioAggregationManager.aggregatePositionsByPair).not.toHaveBeenCalled()
    })

    it('should handle disconnected wallet', async () => {
      mockUseWallet.connected = false
      mockUseWallet.publicKey = null

      const { result } = renderHook(() => usePortfolioAggregation(mockPositions, false))

      await waitFor(() => {
        expect(result.current.portfolioPositions).toEqual([])
      })

      expect(mockPortfolioAggregationManager.aggregatePositionsByPair).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPortfolioAggregationManager.aggregatePositionsByPair.mockRejectedValue(
        new Error('Aggregation failed')
      )

      const { result } = renderHook(() => usePortfolioAggregation(mockPositions, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Aggregation failed')
        expect(result.current.portfolioPositions).toEqual([])
      })

      consoleErrorSpy.mockRestore()
    })

    it('should refresh aggregation manually', async () => {
      mockPortfolioAggregationManager.aggregatePositionsByPair.mockResolvedValue(mockPortfolioPositions)

      const { result } = renderHook(() => usePortfolioAggregation(mockPositions, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshAggregation()
      })

      expect(mockPortfolioAggregationManager.aggregatePositionsByPair).toHaveBeenCalledTimes(2)
    })

    it('should set up real-time polling when enabled', async () => {
      mockPortfolioAggregationManager.aggregatePositionsByPair.mockResolvedValue(mockPortfolioPositions)

      renderHook(() => usePortfolioAggregation(mockPositions, true))

      await waitFor(() => {
        expect(mockPortfolioAggregationManager.aggregatePositionsByPair).toHaveBeenCalledTimes(1)
      })

      // Advance timer to trigger polling (2 seconds = 2000ms)
      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(mockPortfolioAggregationManager.aggregatePositionsByPair).toHaveBeenCalledTimes(2)
      })
    })

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() => usePortfolioAggregation(mockPositions, true))

      unmount()

      act(() => {
        jest.advanceTimersByTime(2000)
      })

      expect(mockPortfolioAggregationManager.aggregatePositionsByPair).toHaveBeenCalledTimes(1)
    })

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPortfolioAggregationManager.aggregatePositionsByPair.mockRejectedValue('String error')

      const { result } = renderHook(() => usePortfolioAggregation(mockPositions, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to aggregate portfolio positions')
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('usePortfolioSummary', () => {
    const mockPortfolioSummary = {
      totalValue: 3000,
      totalPositions: 2,
      diversifiedPairs: 1,
      performanceMetrics: {
        avgApr: 13.75,
        totalFees: 150,
        bestPerformingPair: 'USDC/SOL',
        worstPerformingPair: null,
      },
      riskAnalysis: {
        overallRiskScore: 27.5,
        riskDistribution: {
          low: 0,
          medium: 2,
          high: 0,
        },
      },
      topPerformingPairs: ['USDC/SOL'],
      recommendations: ['Consider diversifying into additional token pairs'],
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => usePortfolioSummary([], []))

      expect(result.current.summary).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should generate portfolio summary successfully', async () => {
      mockPortfolioAggregationManager.generatePortfolioSummary.mockResolvedValue(mockPortfolioSummary)

      const { result } = renderHook(() => usePortfolioSummary(mockPositions, mockAnalytics))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.summary).toEqual(mockPortfolioSummary)
      expect(result.current.lastUpdate).toBeDefined()
      expect(mockPortfolioAggregationManager.generatePortfolioSummary).toHaveBeenCalledWith(
        mockPositions,
        mockAnalytics,
        mockUseWallet.publicKey
      )
    })

    it('should handle empty positions', async () => {
      const { result } = renderHook(() => usePortfolioSummary([], []))

      await waitFor(() => {
        expect(result.current.summary).toBeNull()
      })

      expect(mockPortfolioAggregationManager.generatePortfolioSummary).not.toHaveBeenCalled()
    })

    it('should handle disconnected wallet', async () => {
      mockUseWallet.connected = false
      mockUseWallet.publicKey = null

      const { result } = renderHook(() => usePortfolioSummary(mockPositions, mockAnalytics))

      await waitFor(() => {
        expect(result.current.summary).toBeNull()
      })

      expect(mockPortfolioAggregationManager.generatePortfolioSummary).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPortfolioAggregationManager.generatePortfolioSummary.mockRejectedValue(
        new Error('Summary generation failed')
      )

      const { result } = renderHook(() => usePortfolioSummary(mockPositions, mockAnalytics))

      await waitFor(() => {
        expect(result.current.error).toBe('Summary generation failed')
        expect(result.current.summary).toBeNull()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should refresh summary manually', async () => {
      mockPortfolioAggregationManager.generatePortfolioSummary.mockResolvedValue(mockPortfolioSummary)

      const { result } = renderHook(() => usePortfolioSummary(mockPositions, mockAnalytics))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshSummary()
      })

      expect(mockPortfolioAggregationManager.generatePortfolioSummary).toHaveBeenCalledTimes(2)
    })

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPortfolioAggregationManager.generatePortfolioSummary.mockRejectedValue('String error')

      const { result } = renderHook(() => usePortfolioSummary(mockPositions, mockAnalytics))

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to generate portfolio summary')
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('useConsolidationOpportunities', () => {
    const mockOpportunities = [
      {
        id: 'consolidation-1',
        type: 'same_pair_different_pools',
        positions: [mockPositions[0], mockPositions[1]],
        targetPool: new PublicKey('44444444444444444444444444444444'),
        projectedSavings: 25.0,
        migrationCost: 5.0,
        priority: 'high' as const,
        reasoning: 'Multiple positions in same token pair can be consolidated',
      },
    ]

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useConsolidationOpportunities([]))

      expect(result.current.opportunities).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should identify consolidation opportunities successfully', async () => {
      mockPortfolioAggregationManager.identifyConsolidationOpportunities.mockResolvedValue(
        mockOpportunities
      )

      const { result } = renderHook(() => useConsolidationOpportunities(mockPositions))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.opportunities).toEqual(mockOpportunities)
      expect(result.current.lastUpdate).toBeDefined()
      expect(mockPortfolioAggregationManager.identifyConsolidationOpportunities).toHaveBeenCalledWith(
        mockPositions,
        mockUseWallet.publicKey
      )
    })

    it('should handle empty positions', async () => {
      const { result } = renderHook(() => useConsolidationOpportunities([]))

      await waitFor(() => {
        expect(result.current.opportunities).toEqual([])
      })

      expect(mockPortfolioAggregationManager.identifyConsolidationOpportunities).not.toHaveBeenCalled()
    })

    it('should handle disconnected wallet', async () => {
      mockUseWallet.connected = false
      mockUseWallet.publicKey = null

      const { result } = renderHook(() => useConsolidationOpportunities(mockPositions))

      await waitFor(() => {
        expect(result.current.opportunities).toEqual([])
      })

      expect(mockPortfolioAggregationManager.identifyConsolidationOpportunities).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPortfolioAggregationManager.identifyConsolidationOpportunities.mockRejectedValue(
        new Error('Consolidation analysis failed')
      )

      const { result } = renderHook(() => useConsolidationOpportunities(mockPositions))

      await waitFor(() => {
        expect(result.current.error).toBe('Consolidation analysis failed')
        expect(result.current.opportunities).toEqual([])
      })

      consoleErrorSpy.mockRestore()
    })

    it('should refresh opportunities manually', async () => {
      mockPortfolioAggregationManager.identifyConsolidationOpportunities.mockResolvedValue(
        mockOpportunities
      )

      const { result } = renderHook(() => useConsolidationOpportunities(mockPositions))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshOpportunities()
      })

      expect(mockPortfolioAggregationManager.identifyConsolidationOpportunities).toHaveBeenCalledTimes(2)
    })

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPortfolioAggregationManager.identifyConsolidationOpportunities.mockRejectedValue('String error')

      const { result } = renderHook(() => useConsolidationOpportunities(mockPositions))

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to identify consolidation opportunities')
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('useDiversificationAnalysis', () => {
    const mockDiversificationAnalysis = {
      overallScore: 75.5,
      tokenDiversification: {
        uniqueTokens: 3,
        mostCommonToken: 'USDC',
        tokenDistribution: {
          'USDC': 0.6,
          'SOL': 0.3,
          'BTC': 0.1,
        },
      },
      pairDiversification: {
        uniquePairs: 2,
        mostCommonPair: 'USDC/SOL',
        pairDistribution: {
          'USDC/SOL': 0.7,
          'USDC/BTC': 0.3,
        },
      },
      recommendations: [
        'Consider adding positions in different token pairs',
        'Reduce concentration in USDC/SOL pair',
      ],
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useDiversificationAnalysis([]))

      expect(result.current.analysis).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('should analyze diversification successfully', () => {
      mockPortfolioAggregationManager.analyzeDiversification.mockReturnValue(mockDiversificationAnalysis)

      const { result } = renderHook(() => useDiversificationAnalysis(mockPositions))

      expect(result.current.analysis).toEqual(mockDiversificationAnalysis)
      expect(result.current.loading).toBe(false)
      expect(mockPortfolioAggregationManager.analyzeDiversification).toHaveBeenCalledWith(mockPositions)
    })

    it('should handle empty positions', () => {
      const { result } = renderHook(() => useDiversificationAnalysis([]))

      expect(result.current.analysis).toBeNull()
      expect(mockPortfolioAggregationManager.analyzeDiversification).not.toHaveBeenCalled()
    })

    it('should refresh analysis manually', () => {
      mockPortfolioAggregationManager.analyzeDiversification.mockReturnValue(mockDiversificationAnalysis)

      const { result } = renderHook(() => useDiversificationAnalysis(mockPositions))

      act(() => {
        result.current.refreshAnalysis()
      })

      expect(mockPortfolioAggregationManager.analyzeDiversification).toHaveBeenCalledTimes(2)
    })

    it('should handle analysis errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPortfolioAggregationManager.analyzeDiversification.mockImplementation(() => {
        throw new Error('Analysis failed')
      })

      const { result } = renderHook(() => useDiversificationAnalysis(mockPositions))

      expect(result.current.analysis).toBeNull()
      expect(result.current.loading).toBe(false)

      consoleErrorSpy.mockRestore()
    })

    it('should update analysis when positions change', () => {
      const { result, rerender } = renderHook(
        ({ positions }) => useDiversificationAnalysis(positions),
        { initialProps: { positions: [mockPositions[0]] } }
      )

      expect(mockPortfolioAggregationManager.analyzeDiversification).toHaveBeenCalledWith([
        mockPositions[0],
      ])

      rerender({ positions: mockPositions })

      expect(mockPortfolioAggregationManager.analyzeDiversification).toHaveBeenCalledWith(mockPositions)
    })
  })

  describe('usePortfolioInsights', () => {
    const mockPortfolioPositions = [
      {
        tokenPair: 'USDC/SOL',
        aggregatedMetrics: {
          totalValue: 2000,
          positionCount: 2,
        },
        riskMetrics: {
          overallRiskScore: 75, // High risk
        },
      },
      {
        tokenPair: 'USDC/BTC',
        aggregatedMetrics: {
          totalValue: 1000,
          positionCount: 1,
        },
        riskMetrics: {
          overallRiskScore: 25, // Low risk
        },
      },
    ]

    const mockSummary = {
      totalValue: 3000,
      performanceMetrics: {
        avgApr: 15.0,
      },
      topPerformingPairs: ['USDC/SOL'],
    }

    const mockOpportunities = [
      {
        priority: 'high',
        projectedSavings: 50,
      },
      {
        priority: 'medium',
        projectedSavings: 25,
      },
    ]

    const mockDiversificationAnalysis = {
      overallScore: 85.5,
    }

    it('should calculate insights correctly', () => {
      const { result } = renderHook(() =>
        usePortfolioInsights(
          mockPortfolioPositions,
          mockSummary,
          mockOpportunities,
          mockDiversificationAnalysis
        )
      )

      expect(result.current.totalAggregatedPositions).toBe(2)
      expect(result.current.positionsPerPair).toBe(1.5) // (2 + 1) / 2
      expect(result.current.largestPosition).toEqual(mockPortfolioPositions[0])
      expect(result.current.highRiskPositions).toBe(1)
      expect(result.current.averageRiskScore).toBe(50) // (75 + 25) / 2
      expect(result.current.consolidationPotential).toBe(2)
      expect(result.current.highPriorityConsolidations).toBe(1)
      expect(result.current.totalPotentialSavings).toBe(75)
      expect(result.current.diversificationScore).toBe(85.5)
      expect(result.current.diversificationLevel).toBe('excellent')
      expect(result.current.topPerformingPair).toBe('USDC/SOL')
      expect(result.current.totalPortfolioValue).toBe(3000)
      expect(result.current.portfolioApr).toBe(15.0)
    })

    it('should handle empty data gracefully', () => {
      const { result } = renderHook(() => usePortfolioInsights([], null, [], null))

      expect(result.current.totalAggregatedPositions).toBe(0)
      expect(result.current.positionsPerPair).toBe(0)
      expect(result.current.largestPosition).toBeNull()
      expect(result.current.highRiskPositions).toBe(0)
      expect(result.current.averageRiskScore).toBe(0)
      expect(result.current.consolidationPotential).toBe(0)
      expect(result.current.diversificationScore).toBe(0)
      expect(result.current.diversificationLevel).toBe('unknown')
      expect(result.current.totalPortfolioValue).toBe(0)
      expect(result.current.portfolioApr).toBe(0)
      expect(result.current.recommendedActions).toEqual([])
    })

    it('should generate recommended actions correctly', () => {
      const lowDiversificationAnalysis = { overallScore: 30 }
      const { result } = renderHook(() =>
        usePortfolioInsights(
          mockPortfolioPositions,
          mockSummary,
          mockOpportunities,
          lowDiversificationAnalysis
        )
      )

      expect(result.current.recommendedActions).toContain('Consolidate 1 high-priority positions')
      expect(result.current.recommendedActions).toContain('Improve portfolio diversification')
      expect(result.current.recommendedActions).toContain('Review high-risk positions')
    })

    it('should calculate diversification levels correctly', () => {
      const testCases = [
        { score: 80, expected: 'excellent' },
        { score: 60, expected: 'good' },
        { score: 40, expected: 'fair' },
        { score: 20, expected: 'poor' },
      ]

      testCases.forEach(({ score, expected }) => {
        const { result } = renderHook(() =>
          usePortfolioInsights([], null, [], { overallScore: score })
        )

        expect(result.current.diversificationLevel).toBe(expected)
      })
    })

    it('should find largest position correctly', () => {
      const { result } = renderHook(() =>
        usePortfolioInsights(mockPortfolioPositions, null, [], null)
      )

      expect(result.current.largestPosition).toEqual(mockPortfolioPositions[0]) // Has higher total value
    })

    it('should update insights when data changes', () => {
      const { result, rerender } = renderHook(
        ({ positions }) => usePortfolioInsights(positions, null, [], null),
        { initialProps: { positions: [mockPortfolioPositions[0]] } }
      )

      expect(result.current.totalAggregatedPositions).toBe(1)

      rerender({ positions: mockPortfolioPositions })

      expect(result.current.totalAggregatedPositions).toBe(2)
    })
  })

  describe('usePortfolioCache', () => {
    const mockCacheStats = {
      hitRate: 92.5,
      missRate: 7.5,
      totalRequests: 180,
      cacheSize: 80,
      lastClear: new Date(),
    }

    it('should initialize with cache stats', () => {
      mockPortfolioAggregationManager.getCacheStats.mockReturnValue(mockCacheStats)

      const { result } = renderHook(() => usePortfolioCache())

      expect(result.current.cacheStats).toEqual(mockCacheStats)
    })

    it('should refresh cache stats', () => {
      const { result } = renderHook(() => usePortfolioCache())

      act(() => {
        result.current.refreshCacheStats()
      })

      expect(mockPortfolioAggregationManager.getCacheStats).toHaveBeenCalledTimes(2)
    })

    it('should clear cache', () => {
      const { result } = renderHook(() => usePortfolioCache())

      act(() => {
        result.current.clearCache()
      })

      expect(mockPortfolioAggregationManager.clearCache).toHaveBeenCalled()
      expect(mockPortfolioAggregationManager.getCacheStats).toHaveBeenCalledTimes(2)
    })

    it('should refresh cache stats periodically', () => {
      renderHook(() => usePortfolioCache())

      act(() => {
        jest.advanceTimersByTime(30000) // 30 seconds
      })

      expect(mockPortfolioAggregationManager.getCacheStats).toHaveBeenCalledTimes(2)
    })

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() => usePortfolioCache())

      unmount()

      act(() => {
        jest.advanceTimersByTime(30000)
      })

      expect(mockPortfolioAggregationManager.getCacheStats).toHaveBeenCalledTimes(1)
    })
  })

  describe('useComprehensivePortfolioManagement', () => {
    const mockPortfolioPositions = [
      {
        tokenPair: 'USDC/SOL',
        aggregatedMetrics: {
          totalValue: 3000,
          positionCount: 2,
        },
        riskMetrics: {
          overallRiskScore: 30,
        },
      },
    ]

    const mockSummary = {
      totalValue: 3000,
      performanceMetrics: {
        avgApr: 15.0,
      },
      topPerformingPairs: ['USDC/SOL'],
    }

    const mockOpportunities = [
      {
        priority: 'high',
        projectedSavings: 50,
      },
    ]

    const mockDiversificationAnalysis = {
      overallScore: 75.5,
    }

    beforeEach(() => {
      mockPortfolioAggregationManager.aggregatePositionsByPair.mockResolvedValue(mockPortfolioPositions)
      mockPortfolioAggregationManager.generatePortfolioSummary.mockResolvedValue(mockSummary)
      mockPortfolioAggregationManager.identifyConsolidationOpportunities.mockResolvedValue(
        mockOpportunities
      )
      mockPortfolioAggregationManager.analyzeDiversification.mockReturnValue(mockDiversificationAnalysis)
    })

    it('should combine all portfolio management functionality', async () => {
      const { result } = renderHook(() =>
        useComprehensivePortfolioManagement(mockPositions, mockAnalytics, false)
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.portfolioPositions).toEqual(mockPortfolioPositions)
      expect(result.current.summary).toEqual(mockSummary)
      expect(result.current.opportunities).toEqual(mockOpportunities)
      expect(result.current.diversificationAnalysis).toEqual(mockDiversificationAnalysis)
      expect(result.current.insights).toBeDefined()
      expect(result.current.hasData).toBe(true)
      expect(result.current.hasOptimizationOpportunities).toBe(true)
    })

    it('should handle loading states correctly', () => {
      mockPortfolioAggregationManager.aggregatePositionsByPair.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPortfolioPositions), 100))
      )

      const { result } = renderHook(() =>
        useComprehensivePortfolioManagement(mockPositions, mockAnalytics, false)
      )

      expect(result.current.loading).toBe(true)
    })

    it('should handle error states from any component', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPortfolioAggregationManager.aggregatePositionsByPair.mockRejectedValue(
        new Error('Aggregation error')
      )

      const { result } = renderHook(() =>
        useComprehensivePortfolioManagement(mockPositions, mockAnalytics, false)
      )

      await waitFor(() => {
        expect(result.current.error).toBe('Aggregation error')
      })

      consoleErrorSpy.mockRestore()
    })

    it('should indicate hasData correctly', async () => {
      const { result } = renderHook(() =>
        useComprehensivePortfolioManagement(mockPositions, mockAnalytics, false)
      )

      await waitFor(() => {
        expect(result.current.hasData).toBe(true)
      })
    })

    it('should indicate no data when portfolio positions are empty', async () => {
      mockPortfolioAggregationManager.aggregatePositionsByPair.mockResolvedValue([])

      const { result } = renderHook(() =>
        useComprehensivePortfolioManagement(mockPositions, mockAnalytics, false)
      )

      await waitFor(() => {
        expect(result.current.hasData).toBe(false)
      })
    })

    it('should indicate no data when summary is null', async () => {
      mockPortfolioAggregationManager.generatePortfolioSummary.mockResolvedValue(null)

      const { result } = renderHook(() =>
        useComprehensivePortfolioManagement(mockPositions, mockAnalytics, false)
      )

      await waitFor(() => {
        expect(result.current.hasData).toBe(false)
      })
    })

    it('should indicate optimization opportunities correctly', async () => {
      // Test with opportunities
      const { result } = renderHook(() =>
        useComprehensivePortfolioManagement(mockPositions, mockAnalytics, false)
      )

      await waitFor(() => {
        expect(result.current.hasOptimizationOpportunities).toBe(true)
      })

      // Test with low diversification score (< 50)
      mockPortfolioAggregationManager.identifyConsolidationOpportunities.mockResolvedValue([])
      mockPortfolioAggregationManager.analyzeDiversification.mockReturnValue({ overallScore: 30 })

      const { result: result2 } = renderHook(() =>
        useComprehensivePortfolioManagement(mockPositions, mockAnalytics, false)
      )

      await waitFor(() => {
        expect(result2.current.hasOptimizationOpportunities).toBe(true)
      })

      // Test with no opportunities and good diversification
      mockPortfolioAggregationManager.analyzeDiversification.mockReturnValue({ overallScore: 80 })

      const { result: result3 } = renderHook(() =>
        useComprehensivePortfolioManagement(mockPositions, mockAnalytics, false)
      )

      await waitFor(() => {
        expect(result3.current.hasOptimizationOpportunities).toBe(false)
      })
    })

    it('should enable real-time updates when specified', async () => {
      renderHook(() => useComprehensivePortfolioManagement(mockPositions, mockAnalytics, true))

      await waitFor(() => {
        expect(mockPortfolioAggregationManager.aggregatePositionsByPair).toHaveBeenCalledTimes(1)
      })

      act(() => {
        jest.advanceTimersByTime(2000) // Analytics interval
      })

      await waitFor(() => {
        expect(mockPortfolioAggregationManager.aggregatePositionsByPair).toHaveBeenCalledTimes(2)
      })
    })

    it('should handle empty positions correctly', async () => {
      const { result } = renderHook(() => useComprehensivePortfolioManagement([], [], false))

      await waitFor(() => {
        expect(result.current.portfolioPositions).toEqual([])
        expect(result.current.hasData).toBe(false)
      })
    })

    it('should propagate all errors correctly', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      // Test summary error propagation
      mockPortfolioAggregationManager.generatePortfolioSummary.mockRejectedValue(new Error('Summary error'))

      const { result } = renderHook(() =>
        useComprehensivePortfolioManagement(mockPositions, mockAnalytics, false)
      )

      await waitFor(() => {
        expect(result.current.error).toBe('Summary error')
      })

      consoleErrorSpy.mockRestore()
    })
  })
})