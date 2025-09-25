import { renderHook, act, waitFor } from '@testing-library/react'
import { PublicKey } from '@solana/web3.js'
import {
  useFeeOptimization,
  useAvailableFeeTiers,
  useFeeRecommendations,
  useMigrationImpact,
  useCustomFeeTier,
  useFeeTierCache,
  useComprehensiveFeeManagement
} from '../../src/hooks/use-fee-optimization'

// Mock the wallet adapter
const mockUseWallet = {
  publicKey: new PublicKey('11111111111111111111111111111112'),
  connected: true,
}

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockUseWallet,
}))

// Mock the fee tier manager
jest.mock('../../src/lib/dlmm/fee-tiers', () => ({
  feeTierManager: {
    analyzeFeeOptimization: jest.fn(),
    getAvailableFeeTiers: jest.fn(),
    getMarketBasedRecommendations: jest.fn(),
    calculateMigrationImpact: jest.fn(),
    createCustomFeeTier: jest.fn(),
    getCacheStats: jest.fn(),
    clearCache: jest.fn(),
  },
}))

// Get the mocked manager for type checking
import { feeTierManager } from '../../src/lib/dlmm/fee-tiers'
const mockFeeTierManager = feeTierManager as jest.Mocked<typeof feeTierManager>

// Mock constants
jest.mock('../../src/lib/constants', () => ({
  REFRESH_INTERVALS: {
    prices: 1000,
    analytics: 2000,
    positions: 3000,
  },
}))

describe('Fee Optimization Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()

    // Setup default mock returns
    mockFeeTierManager.getCacheStats.mockReturnValue({
      hitRate: 90.5,
      missRate: 9.5,
      totalRequests: 200,
      cacheSize: 75,
      lastClear: new Date(),
    })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('useFeeOptimization', () => {
    const mockPoolAddress = new PublicKey('33333333333333333333333333333333')
    const mockAnalysis = {
      currentTier: {
        name: 'Standard',
        baseFeeBps: 30,
        protocolFeeBps: 5,
      },
      recommendedTier: {
        name: 'Premium',
        baseFeeBps: 20,
        protocolFeeBps: 3,
      },
      potentialSavings: 150.75,
      analysisDetails: {
        volumeAnalysis: { daily: 10000, weekly: 70000 },
        liquidityAnalysis: { utilization: 85.5 },
        competitorAnalysis: { avgFee: 25 },
      },
    }

    const mockSettings = {
      riskTolerance: 'moderate' as const,
      liquidityRange: 'moderate' as const,
      rebalanceFrequency: 'daily' as const,
      maxSlippage: 0.01,
      prioritizeFees: true,
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useFeeOptimization())

      expect(result.current.analysis).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.lastUpdate).toBeNull()
    })

    it('should fetch fee optimization analysis successfully', async () => {
      mockFeeTierManager.analyzeFeeOptimization.mockResolvedValue(mockAnalysis)

      const { result } = renderHook(() =>
        useFeeOptimization(mockPoolAddress, '1000', 'USDC/SOL', mockSettings)
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.analysis).toEqual(mockAnalysis)
      expect(result.current.lastUpdate).toBeDefined()
      expect(mockFeeTierManager.analyzeFeeOptimization).toHaveBeenCalledWith(
        mockPoolAddress,
        '1000',
        'USDC/SOL',
        mockSettings
      )
    })

    it('should handle string pool address', async () => {
      mockFeeTierManager.analyzeFeeOptimization.mockResolvedValue(mockAnalysis)

      const { result } = renderHook(() =>
        useFeeOptimization('33333333333333333333333333333333', '1000', 'USDC/SOL')
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockFeeTierManager.analyzeFeeOptimization).toHaveBeenCalledWith(
        expect.any(PublicKey),
        '1000',
        'USDC/SOL',
        expect.any(Object) // Default settings
      )
    })

    it('should use default settings when not provided', async () => {
      mockFeeTierManager.analyzeFeeOptimization.mockResolvedValue(mockAnalysis)

      const { result } = renderHook(() =>
        useFeeOptimization(mockPoolAddress, '1000', 'USDC/SOL')
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockFeeTierManager.analyzeFeeOptimization).toHaveBeenCalledWith(
        mockPoolAddress,
        '1000',
        'USDC/SOL',
        {
          riskTolerance: 'moderate',
          liquidityRange: 'moderate',
          rebalanceFrequency: 'daily',
          maxSlippage: 0.01,
          prioritizeFees: true,
        }
      )
    })

    it('should handle missing parameters', async () => {
      const { result } = renderHook(() => useFeeOptimization())

      await waitFor(() => {
        expect(result.current.analysis).toBeNull()
      })

      expect(mockFeeTierManager.analyzeFeeOptimization).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFeeTierManager.analyzeFeeOptimization.mockRejectedValue(new Error('Analysis failed'))

      const { result } = renderHook(() =>
        useFeeOptimization(mockPoolAddress, '1000', 'USDC/SOL')
      )

      await waitFor(() => {
        expect(result.current.error).toBe('Analysis failed')
        expect(result.current.analysis).toBeNull()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should refresh analysis manually', async () => {
      mockFeeTierManager.analyzeFeeOptimization.mockResolvedValue(mockAnalysis)

      const { result } = renderHook(() =>
        useFeeOptimization(mockPoolAddress, '1000', 'USDC/SOL')
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshAnalysis()
      })

      expect(mockFeeTierManager.analyzeFeeOptimization).toHaveBeenCalledTimes(2)
    })

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFeeTierManager.analyzeFeeOptimization.mockRejectedValue('String error')

      const { result } = renderHook(() =>
        useFeeOptimization(mockPoolAddress, '1000', 'USDC/SOL')
      )

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to analyze fee optimization')
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('useAvailableFeeTiers', () => {
    const mockFeeTiers = [
      {
        name: 'Low Fee',
        baseFeeBps: 10,
        protocolFeeBps: 2,
        description: 'Low volatility pairs',
        recommendedFor: ['stablecoins'],
        minLiquidity: '1000',
      },
      {
        name: 'Standard',
        baseFeeBps: 30,
        protocolFeeBps: 5,
        description: 'Most trading pairs',
        recommendedFor: ['general'],
        minLiquidity: '500',
      },
    ]

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useAvailableFeeTiers())

      expect(result.current.feeTiers).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should fetch available fee tiers successfully', async () => {
      mockFeeTierManager.getAvailableFeeTiers.mockReturnValue(mockFeeTiers)

      const { result } = renderHook(() => useAvailableFeeTiers('USDC/SOL', '1000'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.feeTiers).toEqual(mockFeeTiers)
      expect(mockFeeTierManager.getAvailableFeeTiers).toHaveBeenCalledWith('USDC/SOL', '1000')
    })

    it('should handle missing parameters', async () => {
      const { result } = renderHook(() => useAvailableFeeTiers())

      await waitFor(() => {
        expect(result.current.feeTiers).toEqual([])
      })

      expect(mockFeeTierManager.getAvailableFeeTiers).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFeeTierManager.getAvailableFeeTiers.mockImplementation(() => {
        throw new Error('Fetch failed')
      })

      const { result } = renderHook(() => useAvailableFeeTiers('USDC/SOL', '1000'))

      await waitFor(() => {
        expect(result.current.error).toBe('Fetch failed')
        expect(result.current.feeTiers).toEqual([])
      })

      consoleErrorSpy.mockRestore()
    })

    it('should refresh fee tiers manually', async () => {
      mockFeeTierManager.getAvailableFeeTiers.mockReturnValue(mockFeeTiers)

      const { result } = renderHook(() => useAvailableFeeTiers('USDC/SOL', '1000'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.refreshFeeTiers()
      })

      expect(mockFeeTierManager.getAvailableFeeTiers).toHaveBeenCalledTimes(2)
    })
  })

  describe('useFeeRecommendations', () => {
    const mockRecommendations = [
      {
        tier: {
          name: 'Premium',
          baseFeeBps: 20,
          protocolFeeBps: 3,
        },
        confidence: 95.5,
        reasoning: 'High volume pair with stable liquidity',
      },
      {
        tier: {
          name: 'Standard',
          baseFeeBps: 30,
          protocolFeeBps: 5,
        },
        confidence: 75.0,
        reasoning: 'Good balance for moderate volume',
      },
    ]

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useFeeRecommendations())

      expect(result.current.recommendations).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should fetch fee recommendations successfully', async () => {
      mockFeeTierManager.getMarketBasedRecommendations.mockResolvedValue(mockRecommendations)

      const { result } = renderHook(() => useFeeRecommendations('USDC/SOL', '1000'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.recommendations).toEqual(mockRecommendations)
      expect(mockFeeTierManager.getMarketBasedRecommendations).toHaveBeenCalledWith('USDC/SOL', '1000')
    })

    it('should handle missing parameters', async () => {
      const { result } = renderHook(() => useFeeRecommendations())

      await waitFor(() => {
        expect(result.current.recommendations).toEqual([])
      })

      expect(mockFeeTierManager.getMarketBasedRecommendations).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFeeTierManager.getMarketBasedRecommendations.mockRejectedValue(new Error('Recommendations failed'))

      const { result } = renderHook(() => useFeeRecommendations('USDC/SOL', '1000'))

      await waitFor(() => {
        expect(result.current.error).toBe('Recommendations failed')
        expect(result.current.recommendations).toEqual([])
      })

      consoleErrorSpy.mockRestore()
    })

    it('should refresh recommendations manually', async () => {
      mockFeeTierManager.getMarketBasedRecommendations.mockResolvedValue(mockRecommendations)

      const { result } = renderHook(() => useFeeRecommendations('USDC/SOL', '1000'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshRecommendations()
      })

      expect(mockFeeTierManager.getMarketBasedRecommendations).toHaveBeenCalledTimes(2)
    })
  })

  describe('useMigrationImpact', () => {
    const mockCurrentTier = {
      name: 'Standard',
      baseFeeBps: 30,
      protocolFeeBps: 5,
    }

    const mockTargetTier = {
      name: 'Premium',
      baseFeeBps: 20,
      protocolFeeBps: 3,
    }

    const mockImpact = {
      migrationCost: 50.0,
      dailySavings: 5.25,
      breakEvenDays: 9.5,
      annualBenefit: 1916.25,
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useMigrationImpact())

      expect(result.current.impact).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should calculate migration impact successfully', async () => {
      mockFeeTierManager.calculateMigrationImpact.mockResolvedValue(mockImpact)

      const { result } = renderHook(() =>
        useMigrationImpact(mockCurrentTier, mockTargetTier, '10000', '5000')
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.impact).toEqual(mockImpact)
      expect(mockFeeTierManager.calculateMigrationImpact).toHaveBeenCalledWith(
        mockCurrentTier,
        mockTargetTier,
        '10000',
        '5000'
      )
    })

    it('should handle missing parameters', async () => {
      const { result } = renderHook(() => useMigrationImpact())

      await waitFor(() => {
        expect(result.current.impact).toBeNull()
      })

      expect(mockFeeTierManager.calculateMigrationImpact).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFeeTierManager.calculateMigrationImpact.mockRejectedValue(new Error('Calculation failed'))

      const { result } = renderHook(() =>
        useMigrationImpact(mockCurrentTier, mockTargetTier, '10000', '5000')
      )

      await waitFor(() => {
        expect(result.current.error).toBe('Calculation failed')
        expect(result.current.impact).toBeNull()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should refresh impact calculation manually', async () => {
      mockFeeTierManager.calculateMigrationImpact.mockResolvedValue(mockImpact)

      const { result } = renderHook(() =>
        useMigrationImpact(mockCurrentTier, mockTargetTier, '10000', '5000')
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshImpact()
      })

      expect(mockFeeTierManager.calculateMigrationImpact).toHaveBeenCalledTimes(2)
    })
  })

  describe('useCustomFeeTier', () => {
    const mockCustomTier = {
      name: 'Custom Tier',
      baseFeeBps: 25,
      protocolFeeBps: 4,
      description: 'Custom tier for specific needs',
      recommendedFor: ['custom'],
      minLiquidity: '2000',
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useCustomFeeTier())

      expect(result.current.isCreating).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should create custom fee tier successfully', async () => {
      mockFeeTierManager.createCustomFeeTier.mockReturnValue(mockCustomTier)

      const { result } = renderHook(() => useCustomFeeTier())

      let createdTier: any
      await act(async () => {
        createdTier = await result.current.createCustomTier(
          'Custom Tier',
          25,
          4,
          'Custom tier for specific needs',
          ['custom'],
          '2000'
        )
      })

      expect(createdTier).toEqual(mockCustomTier)
      expect(mockFeeTierManager.createCustomFeeTier).toHaveBeenCalledWith(
        'Custom Tier',
        25,
        4,
        'Custom tier for specific needs',
        ['custom'],
        '2000'
      )
      expect(result.current.isCreating).toBe(false)
    })

    it('should handle creation errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFeeTierManager.createCustomFeeTier.mockImplementation(() => {
        throw new Error('Creation failed')
      })

      const { result } = renderHook(() => useCustomFeeTier())

      await act(async () => {
        try {
          await result.current.createCustomTier('Test', 25, 4, 'Test tier', ['test'], '1000')
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Creation failed')
      expect(result.current.isCreating).toBe(false)

      consoleErrorSpy.mockRestore()
    })

    it('should handle loading state during creation', async () => {
      mockFeeTierManager.createCustomFeeTier.mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve(mockCustomTier), 100))
      })

      const { result } = renderHook(() => useCustomFeeTier())

      const createPromise = act(async () => {
        result.current.createCustomTier('Test', 25, 4, 'Test tier', ['test'], '1000')
      })

      expect(result.current.isCreating).toBe(true)

      await createPromise
      expect(result.current.isCreating).toBe(false)
    })
  })

  describe('useFeeTierCache', () => {
    const mockCacheStats = {
      hitRate: 90.5,
      missRate: 9.5,
      totalRequests: 200,
      cacheSize: 75,
      lastClear: new Date(),
    }

    it('should initialize with cache stats', () => {
      mockFeeTierManager.getCacheStats.mockReturnValue(mockCacheStats)

      const { result } = renderHook(() => useFeeTierCache())

      expect(result.current.cacheStats).toEqual(mockCacheStats)
    })

    it('should refresh cache stats', () => {
      const { result } = renderHook(() => useFeeTierCache())

      act(() => {
        result.current.refreshCacheStats()
      })

      expect(mockFeeTierManager.getCacheStats).toHaveBeenCalledTimes(2) // Initial + refresh
    })

    it('should clear cache', () => {
      const { result } = renderHook(() => useFeeTierCache())

      act(() => {
        result.current.clearCache()
      })

      expect(mockFeeTierManager.clearCache).toHaveBeenCalled()
      expect(mockFeeTierManager.getCacheStats).toHaveBeenCalledTimes(2) // Initial + after clear
    })

    it('should refresh cache stats periodically', () => {
      renderHook(() => useFeeTierCache())

      act(() => {
        jest.advanceTimersByTime(30000) // 30 seconds
      })

      expect(mockFeeTierManager.getCacheStats).toHaveBeenCalledTimes(2) // Initial + periodic
    })

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() => useFeeTierCache())

      unmount()

      act(() => {
        jest.advanceTimersByTime(30000)
      })

      expect(mockFeeTierManager.getCacheStats).toHaveBeenCalledTimes(1) // Only initial
    })
  })

  describe('useComprehensiveFeeManagement', () => {
    const mockPoolAddress = new PublicKey('33333333333333333333333333333333')

    const mockAnalysis = {
      currentTier: { name: 'Standard', baseFeeBps: 30 },
      recommendedTier: { name: 'Premium', baseFeeBps: 20 },
      potentialSavings: 150,
    }

    const mockFeeTiers = [
      { name: 'Low Fee', baseFeeBps: 10 },
      { name: 'Standard', baseFeeBps: 30 },
    ]

    const mockRecommendations = [
      { tier: { name: 'Premium', baseFeeBps: 20 }, confidence: 95 },
    ]

    const mockCacheStats = {
      hitRate: 90.5,
      missRate: 9.5,
      totalRequests: 200,
      cacheSize: 75,
      lastClear: new Date(),
    }

    beforeEach(() => {
      mockFeeTierManager.analyzeFeeOptimization.mockResolvedValue(mockAnalysis)
      mockFeeTierManager.getAvailableFeeTiers.mockReturnValue(mockFeeTiers)
      mockFeeTierManager.getMarketBasedRecommendations.mockResolvedValue(mockRecommendations)
      mockFeeTierManager.getCacheStats.mockReturnValue(mockCacheStats)
    })

    it('should combine all fee management data', async () => {
      const { result } = renderHook(() =>
        useComprehensiveFeeManagement(mockPoolAddress, '1000', 'USDC/SOL')
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.analysis).toEqual(mockAnalysis)
      expect(result.current.feeTiers).toEqual(mockFeeTiers)
      expect(result.current.recommendations).toEqual(mockRecommendations)
      expect(result.current.cacheStats).toEqual(mockCacheStats)
      expect(result.current.hasData).toBe(true)
    })

    it('should handle loading states correctly', () => {
      mockFeeTierManager.analyzeFeeOptimization.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockAnalysis), 100))
      )

      const { result } = renderHook(() =>
        useComprehensiveFeeManagement(mockPoolAddress, '1000', 'USDC/SOL')
      )

      expect(result.current.loading).toBe(true)
      expect(result.current.hasData).toBe(false)
    })

    it('should handle error states from any component', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFeeTierManager.analyzeFeeOptimization.mockRejectedValue(new Error('Analysis error'))

      const { result } = renderHook(() =>
        useComprehensiveFeeManagement(mockPoolAddress, '1000', 'USDC/SOL')
      )

      await waitFor(() => {
        expect(result.current.error).toBe('Analysis error')
      })

      consoleErrorSpy.mockRestore()
    })

    it('should indicate hasData correctly when all data is present', async () => {
      const { result } = renderHook(() =>
        useComprehensiveFeeManagement(mockPoolAddress, '1000', 'USDC/SOL')
      )

      await waitFor(() => {
        expect(result.current.hasData).toBe(true)
      })
    })

    it('should indicate no data when analysis is missing', async () => {
      mockFeeTierManager.analyzeFeeOptimization.mockResolvedValue(null)

      const { result } = renderHook(() =>
        useComprehensiveFeeManagement(mockPoolAddress, '1000', 'USDC/SOL')
      )

      await waitFor(() => {
        expect(result.current.hasData).toBe(false)
      })
    })

    it('should indicate no data when fee tiers are empty', async () => {
      mockFeeTierManager.getAvailableFeeTiers.mockReturnValue([])

      const { result } = renderHook(() =>
        useComprehensiveFeeManagement(mockPoolAddress, '1000', 'USDC/SOL')
      )

      await waitFor(() => {
        expect(result.current.hasData).toBe(false)
      })
    })

    it('should pass custom settings to fee optimization', async () => {
      const customSettings = {
        riskTolerance: 'aggressive' as const,
        liquidityRange: 'wide' as const,
        rebalanceFrequency: 'weekly' as const,
        maxSlippage: 0.02,
        prioritizeFees: false,
      }

      renderHook(() =>
        useComprehensiveFeeManagement(mockPoolAddress, '1000', 'USDC/SOL', customSettings)
      )

      await waitFor(() => {
        expect(mockFeeTierManager.analyzeFeeOptimization).toHaveBeenCalledWith(
          mockPoolAddress,
          '1000',
          'USDC/SOL',
          customSettings
        )
      })
    })
  })
})