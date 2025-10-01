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
} from '@/hooks/use-portfolio-aggregation'

// Mock the wallet adapter
const mockUseWallet = {
  publicKey: new PublicKey('11111111111111111111111111111112'),
  connected: true,
}

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockUseWallet,
}))

// Mock the portfolio aggregation manager
jest.mock('@/lib/dlmm/portfolio-aggregation', () => ({
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
import { portfolioAggregationManager } from '@/lib/dlmm/portfolio-aggregation'
const mockPortfolioAggregationManager = portfolioAggregationManager as jest.Mocked<typeof portfolioAggregationManager>

// Mock constants
jest.mock('@/lib/constants', () => ({
  REFRESH_INTERVALS: {
    positions: 30000, // 30 seconds
    prices: 5000,     // 5 seconds
    analytics: 60000, // 1 minute
  },
}))

describe('Portfolio Aggregation Hooks', () => {
  const mockPositions = [
    {
      id: '1',
      poolAddress: new PublicKey('22222222222222222222222222222222'),
      userAddress: new PublicKey('11111111111111111111111111111112'),
      tokenX: {
        address: new PublicKey('USDC00000000000000000000000000000'),
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        price: 1.0
      },
      tokenY: {
        address: new PublicKey('SOL0000000000000000000000000000000'),
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        price: 100.0
      },
      activeBin: 100,
      liquidityAmount: '1000',
      feesEarned: {
        tokenX: '10',
        tokenY: '20'
      },
      createdAt: new Date(),
      lastUpdated: new Date(),
      isActive: true
    },
    {
      id: '2',
      poolAddress: new PublicKey('33333333333333333333333333333333'),
      userAddress: new PublicKey('11111111111111111111111111111112'),
      tokenX: {
        address: new PublicKey('USDC00000000000000000000000000000'),
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        price: 1.0
      },
      tokenY: {
        address: new PublicKey('SOL0000000000000000000000000000000'),
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        price: 100.0
      },
      activeBin: 110,
      liquidityAmount: '2000',
      feesEarned: {
        tokenX: '20',
        tokenY: '40'
      },
      createdAt: new Date(),
      lastUpdated: new Date(),
      isActive: true
    },
  ]

  const mockAnalytics = [
    {
      totalValue: 1000,
      pnl: {
        amount: 100,
        percentage: 10.0,
      },
      feesEarned: 50,
      impermanentLoss: {
        amount: -20,
        percentage: -2.0,
      },
      apr: 12.5,
      duration: 30,
    },
    {
      totalValue: 2000,
      pnl: {
        amount: 300,
        percentage: 15.0,
      },
      feesEarned: 100,
      impermanentLoss: {
        amount: -50,
        percentage: -2.5,
      },
      apr: 15.0,
      duration: 45,
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
      count: 80,
      keys: ['portfolio-key-1', 'portfolio-key-2', 'portfolio-key-3']
    })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('usePortfolioAggregation', () => {
    const mockPortfolioPositions = [
      {
        id: 'portfolio-1',
        positions: mockPositions,
        tokenPair: 'USDC/SOL',
        tokenX: {
          address: new PublicKey('USDC00000000000000000000000000000'),
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          price: 1.0
        },
        tokenY: {
          address: new PublicKey('SOL0000000000000000000000000000000'),
          symbol: 'SOL',
          name: 'Solana',
          decimals: 9,
          price: 100.0
        },
        aggregatedMetrics: {
          totalLiquidity: '3000',
          totalValue: 3000,
          weightedApr: 13.75,
          totalFeesEarned: 150,
          averageActiveBin: 105,
          positionCount: 2,
        },
        diversificationScore: 75.0,
        riskMetrics: {
          concentrationRisk: 15.0,
          correlationRisk: 10.0,
          liquidityRisk: 15.0,
          overallRiskScore: 27.5,
        },
        optimization: {
          canConsolidate: true,
          consolidationBenefit: 25.0,
          recommendedActions: ['Consider consolidating positions']
        }
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
      mockUseWallet.publicKey = new PublicKey('11111111111111111111111111111111')

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
      totalPositions: 2,
      totalValue: 3000,
      totalLiquidity: '3000',
      diversifiedPairs: 1,
      topPerformingPairs: ['USDC/SOL'],
      underPerformingPairs: [],
      riskDistribution: {
        low: 0,
        medium: 2,
        high: 0,
      },
      assetAllocation: [
        {
          symbol: 'USDC',
          percentage: 50,
          value: 1500,
          positions: 1
        },
        {
          symbol: 'SOL',
          percentage: 50,
          value: 1500,
          positions: 1
        }
      ],
      performanceMetrics: {
        totalPnl: 150,
        totalPnlPercentage: 5.0,
        bestPosition: mockPositions[0],
        worstPosition: null,
        avgApr: 13.75,
        totalFeesEarned: 150,
      },
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
      mockUseWallet.publicKey = new PublicKey('11111111111111111111111111111111')

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
        targetPair: 'USDC/SOL',
        positions: [mockPositions[0], mockPositions[1]],
        currentPools: [mockPositions[0].poolAddress, mockPositions[1].poolAddress],
        recommendedPool: new PublicKey('44444444444444444444444444444444'),
        benefits: {
          reducedGasCosts: 15.0,
          improvedLiquidity: 10.0,
          betterApr: 2.5,
          simplifiedManagement: true
        },
        consolidationCost: 5.0,
        projectedSavings: 25.0,
        priority: 'high' as const,
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
      mockUseWallet.publicKey = new PublicKey('11111111111111111111111111111111')

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
        dominantToken: 'USDC',
        dominantPercentage: 60.0,
        recommendations: [
          'Consider reducing USDC concentration',
          'Add more diverse tokens'
        ]
      },
      pairDiversification: {
        uniquePairs: 2,
        topPairs: [
          { pair: 'USDC/SOL', percentage: 70.0 },
          { pair: 'USDC/BTC', percentage: 30.0 }
        ],
        concentrationWarnings: [
          'High concentration in USDC/SOL pair'
        ]
      },
      poolDiversification: {
        uniquePools: 2,
        averagePoolSize: '50000',
        liquidityDistribution: 'concentrated' as const
      }
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
      const { rerender } = renderHook(
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
        id: 'portfolio-insights-1',
        positions: [mockPositions[0]],
        tokenPair: 'USDC/SOL',
        tokenX: {
          address: new PublicKey('USDC00000000000000000000000000000'),
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          price: 1.0,
        },
        tokenY: {
          address: new PublicKey('SOL0000000000000000000000000000000'),
          symbol: 'SOL',
          name: 'Solana',
          decimals: 9,
          price: 100.0,
        },
        aggregatedMetrics: {
          totalLiquidity: '2000',
          totalValue: 2000,
          weightedApr: 12.5,
          totalFeesEarned: 100,
          averageActiveBin: 1000,
          positionCount: 2,
        },
        diversificationScore: 75,
        riskMetrics: {
          concentrationRisk: 60,
          correlationRisk: 40,
          liquidityRisk: 30,
          overallRiskScore: 75, // High risk
        },
        optimization: {
          canConsolidate: true,
          consolidationBenefit: 50,
          recommendedActions: ['Consider consolidation'],
        },
      },
      {
        id: 'portfolio-insights-2',
        positions: [mockPositions[1]],
        tokenPair: 'USDC/BTC',
        tokenX: {
          address: new PublicKey('USDC00000000000000000000000000000'),
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          price: 1.0,
        },
        tokenY: {
          address: new PublicKey('BTC0000000000000000000000000000000'),
          symbol: 'BTC',
          name: 'Bitcoin',
          decimals: 8,
          price: 50000.0,
        },
        aggregatedMetrics: {
          totalLiquidity: '1000',
          totalValue: 1000,
          weightedApr: 15.0,
          totalFeesEarned: 50,
          averageActiveBin: 2000,
          positionCount: 1,
        },
        diversificationScore: 85,
        riskMetrics: {
          concentrationRisk: 20,
          correlationRisk: 15,
          liquidityRisk: 10,
          overallRiskScore: 25, // Low risk
        },
        optimization: {
          canConsolidate: false,
          consolidationBenefit: 0,
          recommendedActions: ['Maintain current position'],
        },
      },
    ]

    const mockSummary = {
      totalPositions: 2,
      totalValue: 3000,
      totalLiquidity: '3000',
      diversifiedPairs: 2,
      topPerformingPairs: ['USDC/SOL'],
      underPerformingPairs: ['USDC/BTC'],
      riskDistribution: {
        low: 1,
        medium: 0,
        high: 1,
      },
      assetAllocation: [
        {
          symbol: 'USDC',
          percentage: 40.0,
          value: 1200,
          positions: 2,
        },
        {
          symbol: 'SOL',
          percentage: 35.0,
          value: 1050,
          positions: 1,
        },
        {
          symbol: 'BTC',
          percentage: 25.0,
          value: 750,
          positions: 1,
        },
      ],
      performanceMetrics: {
        totalPnl: 400,
        totalPnlPercentage: 15.0,
        bestPosition: mockPositions[0],
        worstPosition: mockPositions[1],
        avgApr: 15.0,
        totalFeesEarned: 150,
      },
    }

    const mockOpportunities = [
      {
        id: 'consolidation-1',
        targetPair: 'USDC/SOL',
        positions: [mockPositions[0]],
        currentPools: [new PublicKey('22222222222222222222222222222222')],
        recommendedPool: new PublicKey('11111111111111111111111111111111'),
        benefits: {
          reducedGasCosts: 15,
          improvedLiquidity: 20,
          betterApr: 2.5,
          simplifiedManagement: true,
        },
        consolidationCost: 10,
        projectedSavings: 50,
        priority: 'high' as const,
      },
      {
        id: 'consolidation-2',
        targetPair: 'USDC/BTC',
        positions: [mockPositions[1]],
        currentPools: [new PublicKey('33333333333333333333333333333333')],
        recommendedPool: new PublicKey('44444444444444444444444444444444'),
        benefits: {
          reducedGasCosts: 8,
          improvedLiquidity: 12,
          betterApr: 1.8,
          simplifiedManagement: true,
        },
        consolidationCost: 5,
        projectedSavings: 25,
        priority: 'medium' as const,
      },
    ]

    const mockDiversificationAnalysis = {
      overallScore: 85.5,
      tokenDiversification: {
        uniqueTokens: 3,
        dominantToken: 'USDC',
        dominantPercentage: 40.0,
        recommendations: ['Consider adding more diverse tokens'],
      },
      pairDiversification: {
        uniquePairs: 2,
        topPairs: [
          { pair: 'USDC/SOL', percentage: 65.0 },
          { pair: 'USDC/BTC', percentage: 35.0 },
        ],
        concentrationWarnings: ['Consider spreading across more pairs'],
      },
      poolDiversification: {
        uniquePools: 2,
        averagePoolSize: '1750000',
        liquidityDistribution: 'balanced' as const,
      },
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
      const lowDiversificationAnalysis = {
        overallScore: 30,
        tokenDiversification: {
          uniqueTokens: 1,
          dominantToken: 'USDC',
          dominantPercentage: 80.0,
          recommendations: ['Add more token diversity']
        },
        pairDiversification: {
          uniquePairs: 1,
          topPairs: [{ pair: 'USDC/SOL', percentage: 100.0 }],
          concentrationWarnings: ['High concentration']
        },
        poolDiversification: {
          uniquePools: 1,
          averagePoolSize: '30000',
          liquidityDistribution: 'concentrated' as const
        }
      }
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
          usePortfolioInsights([], null, [], {
            overallScore: score,
            tokenDiversification: {
              uniqueTokens: 1,
              dominantToken: 'USDC',
              dominantPercentage: 60.0,
              recommendations: []
            },
            pairDiversification: {
              uniquePairs: 1,
              topPairs: [{ pair: 'USDC/SOL', percentage: 100.0 }],
              concentrationWarnings: []
            },
            poolDiversification: {
              uniquePools: 1,
              averagePoolSize: '50000',
              liquidityDistribution: 'balanced' as const
            }
          })
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
      count: 80,
      keys: ['portfolio-key-1', 'portfolio-key-2', 'portfolio-key-3']
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
        id: 'portfolio-1',
        positions: mockPositions,
        tokenPair: 'USDC/SOL',
        tokenX: {
          address: new PublicKey('USDC00000000000000000000000000000'),
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          price: 1.0
        },
        tokenY: {
          address: new PublicKey('SOL0000000000000000000000000000000'),
          symbol: 'SOL',
          name: 'Solana',
          decimals: 9,
          price: 100.0
        },
        aggregatedMetrics: {
          totalLiquidity: '3000',
          totalValue: 3000,
          weightedApr: 15.0,
          totalFeesEarned: 100,
          averageActiveBin: 105,
          positionCount: 2,
        },
        diversificationScore: 75.0,
        riskMetrics: {
          concentrationRisk: 15.0,
          correlationRisk: 10.0,
          liquidityRisk: 15.0,
          overallRiskScore: 30,
        },
        optimization: {
          canConsolidate: true,
          consolidationBenefit: 25.0,
          recommendedActions: ['Consider consolidating positions']
        }
      },
    ]

    const mockSummary = {
      totalPositions: 2,
      totalValue: 3000,
      totalLiquidity: '3000',
      diversifiedPairs: 1,
      topPerformingPairs: ['USDC/SOL'],
      underPerformingPairs: [],
      riskDistribution: {
        low: 1,
        medium: 1,
        high: 0,
      },
      assetAllocation: [
        {
          symbol: 'USDC',
          percentage: 50,
          value: 1500,
          positions: 1
        },
        {
          symbol: 'SOL',
          percentage: 50,
          value: 1500,
          positions: 1
        }
      ],
      performanceMetrics: {
        totalPnl: 100,
        totalPnlPercentage: 3.33,
        bestPosition: mockPositions[0],
        worstPosition: null,
        avgApr: 15.0,
        totalFeesEarned: 100,
      },
    }

    const mockOpportunities = [
      {
        id: 'consolidation-1',
        targetPair: 'USDC/SOL',
        positions: [mockPositions[0]],
        currentPools: [mockPositions[0].poolAddress],
        recommendedPool: new PublicKey('44444444444444444444444444444444'),
        benefits: {
          reducedGasCosts: 20.0,
          improvedLiquidity: 15.0,
          betterApr: 1.5,
          simplifiedManagement: true
        },
        consolidationCost: 10.0,
        projectedSavings: 50,
        priority: 'high' as const,
      },
    ]

    const mockDiversificationAnalysis = {
      overallScore: 75.5,
      tokenDiversification: {
        uniqueTokens: 2,
        dominantToken: 'USDC',
        dominantPercentage: 50.0,
        recommendations: ['Good token diversity']
      },
      pairDiversification: {
        uniquePairs: 1,
        topPairs: [{ pair: 'USDC/SOL', percentage: 100.0 }],
        concentrationWarnings: []
      },
      poolDiversification: {
        uniquePools: 1,
        averagePoolSize: '50000',
        liquidityDistribution: 'concentrated' as const
      }
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
      const mockEmptySummary = {
        totalPositions: 0,
        totalValue: 0,
        totalLiquidity: '0',
        diversifiedPairs: 0,
        topPerformingPairs: [],
        underPerformingPairs: [],
        riskDistribution: {
          low: 0,
          medium: 0,
          high: 0,
        },
        assetAllocation: [],
        performanceMetrics: {
          totalPnl: 0,
          totalPnlPercentage: 0,
          bestPosition: null,
          worstPosition: null,
          avgApr: 0,
          totalFeesEarned: 0,
        },
      }
      mockPortfolioAggregationManager.generatePortfolioSummary.mockResolvedValue(mockEmptySummary)

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
      mockPortfolioAggregationManager.analyzeDiversification.mockReturnValue({
        overallScore: 30,
        tokenDiversification: {
          uniqueTokens: 1,
          dominantToken: 'USDC',
          dominantPercentage: 90.0,
          recommendations: ['Add more tokens']
        },
        pairDiversification: {
          uniquePairs: 1,
          topPairs: [{ pair: 'USDC/SOL', percentage: 100.0 }],
          concentrationWarnings: ['High concentration']
        },
        poolDiversification: {
          uniquePools: 1,
          averagePoolSize: '20000',
          liquidityDistribution: 'concentrated' as const
        }
      })

      const { result: result2 } = renderHook(() =>
        useComprehensivePortfolioManagement(mockPositions, mockAnalytics, false)
      )

      await waitFor(() => {
        expect(result2.current.hasOptimizationOpportunities).toBe(true)
      })

      // Test with no opportunities and good diversification
      mockPortfolioAggregationManager.analyzeDiversification.mockReturnValue({
        overallScore: 80,
        tokenDiversification: {
          uniqueTokens: 3,
          dominantToken: 'USDC',
          dominantPercentage: 40.0,
          recommendations: ['Excellent diversification']
        },
        pairDiversification: {
          uniquePairs: 3,
          topPairs: [
            { pair: 'USDC/SOL', percentage: 40.0 },
            { pair: 'USDC/BTC', percentage: 30.0 },
            { pair: 'SOL/ETH', percentage: 30.0 }
          ],
          concentrationWarnings: []
        },
        poolDiversification: {
          uniquePools: 3,
          averagePoolSize: '100000',
          liquidityDistribution: 'distributed' as const
        }
      })

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