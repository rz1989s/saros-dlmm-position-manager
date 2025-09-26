import { renderHook, act, waitFor } from '@testing-library/react'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import {
  useAdvancedBinAnalysis,
  useBinLiquidityMetrics,
  useBinArrayInfo,
  useBinReserves,
  useBinCacheManagement,
  useComprehensiveBinData
} from '@/hooks/use-bin-analytics'

// Mock the wallet adapter
const mockUseWallet = {
  publicKey: new PublicKey('11111111111111111111111111111112') as PublicKey | null,
  connected: true,
}

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockUseWallet,
}))

// Mock the advanced bin operations
jest.mock('@/lib/dlmm/bin-operations', () => ({
  advancedBinOperations: {
    getAdvancedBinAnalysis: jest.fn(),
    getBinLiquidityMetrics: jest.fn(),
    getEnhancedBinArrayInfo: jest.fn(),
    getEnhancedBinReserves: jest.fn(),
    getCacheStats: jest.fn(),
    invalidateCache: jest.fn(),
  },
}))

// Get the mocked operations for type checking
import { advancedBinOperations } from '@/lib/dlmm/bin-operations'
const mockAdvancedBinOperations = advancedBinOperations as jest.Mocked<typeof advancedBinOperations>

// Mock constants
jest.mock('@/lib/constants', () => ({
  REFRESH_INTERVALS: {
    prices: 1000, // 1 second for testing
    analytics: 2000, // 2 seconds for testing
    positions: 3000,
  },
}))

describe('Bin Analytics Hooks', () => {
  const mockPoolAddress = new PublicKey('33333333333333333333333333333333')
  const mockPositionAddress = new PublicKey('44444444444444444444444444444444')

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()

    // Reset wallet connection state
    mockUseWallet.connected = true

    // Setup default mock returns
    mockAdvancedBinOperations.getCacheStats.mockReturnValue({
      count: 120,
      oldestTimestamp: Date.now() - 3600000, // 1 hour ago
    })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('useAdvancedBinAnalysis', () => {
    const mockAnalysis = {
      activeBins: [
        {
          binId: 123,
          liquidityX: '1000',
          liquidityY: '2000',
          price: 100.5,
          isActive: true,
          feeRate: 0.0025,
          volume24h: '50000',
        },
        {
          binId: 124,
          liquidityX: '1500',
          liquidityY: '3000',
          price: 101.0,
          isActive: true,
          feeRate: 0.0025,
          volume24h: '75000',
        },
      ],
      recommendedBins: [123, 124, 125],
      liquidityDistribution: {
        concentrated: 0.65,
        spread: 0.35,
        ranges: [
          {
            min: 95.0,
            max: 105.0,
            binIds: [123, 124, 125],
            liquidity: '7500'
          }
        ]
      },
      priceRanges: [
        {
          min: 95.0,
          max: 105.0,
          binIds: [123, 124, 125],
          liquidity: '7500'
        },
        {
          min: 90.0,
          max: 110.0,
          binIds: [120, 121, 122, 123, 124, 125, 126, 127, 128],
          liquidity: '15000'
        }
      ],
      optimalRanges: {
        conservative: {
          min: 98.0,
          max: 103.0,
          binIds: [122, 123, 124, 125],
          liquidity: '5000'
        },
        balanced: {
          min: 95.0,
          max: 106.0,
          binIds: [121, 122, 123, 124, 125, 126],
          liquidity: '8000'
        },
        aggressive: {
          min: 90.0,
          max: 112.0,
          binIds: [118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129],
          liquidity: '12000'
        }
      },
      binEfficiency: {
        highActivity: 0.75,
        mediumActivity: 0.45,
        lowActivity: 0.15,
      },
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useAdvancedBinAnalysis())

      expect(result.current.analysis).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.lastUpdate).toBeNull()
    })

    it('should fetch bin analysis successfully', async () => {
      mockAdvancedBinOperations.getAdvancedBinAnalysis.mockResolvedValue(mockAnalysis)

      const { result } = renderHook(() => useAdvancedBinAnalysis(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.analysis).toEqual(mockAnalysis)
      expect(result.current.lastUpdate).toBeDefined()
      expect(mockAdvancedBinOperations.getAdvancedBinAnalysis).toHaveBeenCalledWith(
        mockPoolAddress,
        mockUseWallet.publicKey
      )
    })

    it('should handle string pool address', async () => {
      mockAdvancedBinOperations.getAdvancedBinAnalysis.mockResolvedValue(mockAnalysis)

      const { result } = renderHook(() =>
        useAdvancedBinAnalysis('33333333333333333333333333333333', false)
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockAdvancedBinOperations.getAdvancedBinAnalysis).toHaveBeenCalledWith(
        expect.any(PublicKey),
        mockUseWallet.publicKey
      )
    })

    it('should handle missing pool address', async () => {
      const { result } = renderHook(() => useAdvancedBinAnalysis(undefined, false))

      await waitFor(() => {
        expect(result.current.analysis).toBeNull()
      })

      expect(mockAdvancedBinOperations.getAdvancedBinAnalysis).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockAdvancedBinOperations.getAdvancedBinAnalysis.mockRejectedValue(new Error('Analysis failed'))

      const { result } = renderHook(() => useAdvancedBinAnalysis(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Analysis failed')
        expect(result.current.analysis).toBeNull()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should refresh analysis manually', async () => {
      mockAdvancedBinOperations.getAdvancedBinAnalysis.mockResolvedValue(mockAnalysis)

      const { result } = renderHook(() => useAdvancedBinAnalysis(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshAnalysis()
      })

      expect(mockAdvancedBinOperations.getAdvancedBinAnalysis).toHaveBeenCalledTimes(2)
    })

    it('should set up real-time polling when enabled', async () => {
      mockAdvancedBinOperations.getAdvancedBinAnalysis.mockResolvedValue(mockAnalysis)

      renderHook(() => useAdvancedBinAnalysis(mockPoolAddress, true))

      await waitFor(() => {
        expect(mockAdvancedBinOperations.getAdvancedBinAnalysis).toHaveBeenCalledTimes(1)
      })

      // Advance timer to trigger polling
      act(() => {
        jest.advanceTimersByTime(2000) // REFRESH_INTERVALS.analytics
      })

      await waitFor(() => {
        expect(mockAdvancedBinOperations.getAdvancedBinAnalysis).toHaveBeenCalledTimes(2)
      })
    })

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() => useAdvancedBinAnalysis(mockPoolAddress, true))

      unmount()

      act(() => {
        jest.advanceTimersByTime(2000)
      })

      expect(mockAdvancedBinOperations.getAdvancedBinAnalysis).toHaveBeenCalledTimes(1)
    })

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockAdvancedBinOperations.getAdvancedBinAnalysis.mockRejectedValue('String error')

      const { result } = renderHook(() => useAdvancedBinAnalysis(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch bin analysis')
      })

      consoleErrorSpy.mockRestore()
    })

    it('should pass undefined publicKey when wallet not connected', async () => {
      mockUseWallet.connected = false
      mockUseWallet.publicKey = null

      mockAdvancedBinOperations.getAdvancedBinAnalysis.mockResolvedValue(mockAnalysis)

      renderHook(() => useAdvancedBinAnalysis(mockPoolAddress, false))

      await waitFor(() => {
        expect(mockAdvancedBinOperations.getAdvancedBinAnalysis).toHaveBeenCalledWith(
          mockPoolAddress,
          undefined
        )
      })
    })
  })

  describe('useBinLiquidityMetrics', () => {
    const mockMetrics = {
      totalLiquidity: '75000',
      activeBinCount: 25,
      averageLiquidity: '3000',
      liquidityConcentration: 0.72,
      priceVolatility: 0.15,
      utilizationRate: 0.85,
      concentrationIndex: 0.72,
      liquidityDepth: {
        above: 35000,
        below: 40000,
      },
      spreadAnalysis: {
        averageSpread: 0.002,
        maxSpread: 0.005,
        minSpread: 0.001,
      },
      volumeMetrics: {
        volume24h: 250000,
        volumePerBin: 10000,
        turnoverRate: 3.33,
      },
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useBinLiquidityMetrics())

      expect(result.current.metrics).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.lastUpdate).toBeNull()
    })

    it('should fetch bin metrics successfully', async () => {
      mockAdvancedBinOperations.getBinLiquidityMetrics.mockResolvedValue(mockMetrics)

      const { result } = renderHook(() => useBinLiquidityMetrics(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.metrics).toEqual(mockMetrics)
      expect(result.current.lastUpdate).toBeDefined()
      expect(mockAdvancedBinOperations.getBinLiquidityMetrics).toHaveBeenCalledWith(
        mockPoolAddress,
        mockUseWallet.publicKey
      )
    })

    it('should handle string pool address', async () => {
      mockAdvancedBinOperations.getBinLiquidityMetrics.mockResolvedValue(mockMetrics)

      const { result } = renderHook(() =>
        useBinLiquidityMetrics('33333333333333333333333333333333', false)
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockAdvancedBinOperations.getBinLiquidityMetrics).toHaveBeenCalledWith(
        expect.any(PublicKey),
        mockUseWallet.publicKey
      )
    })

    it('should handle missing pool address', async () => {
      const { result } = renderHook(() => useBinLiquidityMetrics(undefined, false))

      await waitFor(() => {
        expect(result.current.metrics).toBeNull()
      })

      expect(mockAdvancedBinOperations.getBinLiquidityMetrics).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockAdvancedBinOperations.getBinLiquidityMetrics.mockRejectedValue(new Error('Metrics failed'))

      const { result } = renderHook(() => useBinLiquidityMetrics(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Metrics failed')
        expect(result.current.metrics).toBeNull()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should refresh metrics manually', async () => {
      mockAdvancedBinOperations.getBinLiquidityMetrics.mockResolvedValue(mockMetrics)

      const { result } = renderHook(() => useBinLiquidityMetrics(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshMetrics()
      })

      expect(mockAdvancedBinOperations.getBinLiquidityMetrics).toHaveBeenCalledTimes(2)
    })

    it('should set up real-time polling when enabled', async () => {
      mockAdvancedBinOperations.getBinLiquidityMetrics.mockResolvedValue(mockMetrics)

      renderHook(() => useBinLiquidityMetrics(mockPoolAddress, true))

      await waitFor(() => {
        expect(mockAdvancedBinOperations.getBinLiquidityMetrics).toHaveBeenCalledTimes(1)
      })

      // Advance timer to trigger polling (prices interval for metrics)
      act(() => {
        jest.advanceTimersByTime(1000) // REFRESH_INTERVALS.prices
      })

      await waitFor(() => {
        expect(mockAdvancedBinOperations.getBinLiquidityMetrics).toHaveBeenCalledTimes(2)
      })
    })

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() => useBinLiquidityMetrics(mockPoolAddress, true))

      unmount()

      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(mockAdvancedBinOperations.getBinLiquidityMetrics).toHaveBeenCalledTimes(1)
    })

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockAdvancedBinOperations.getBinLiquidityMetrics.mockRejectedValue('String error')

      const { result } = renderHook(() => useBinLiquidityMetrics(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch bin metrics')
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('useBinArrayInfo', () => {
    const mockBinArrayInfo = {
      index: 5,
      version: 1,
      lbPair: mockPoolAddress,
      bins: [
        { binId: 123, reserveX: '1000', reserveY: '2000' },
        { binId: 124, reserveX: '1500', reserveY: '3000' },
      ],
      merkleRoot: 'merkle-hash-123',
      liquidityConfigurations: {
        activeId: 123,
        binStep: 25,
      },
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useBinArrayInfo())

      expect(result.current.binArrayInfo).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should fetch bin array info successfully', async () => {
      mockAdvancedBinOperations.getEnhancedBinArrayInfo.mockResolvedValue(mockBinArrayInfo)

      const { result } = renderHook(() => useBinArrayInfo(mockPoolAddress, 5, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.binArrayInfo).toEqual(mockBinArrayInfo)
      expect(mockAdvancedBinOperations.getEnhancedBinArrayInfo).toHaveBeenCalledWith(
        mockPoolAddress,
        5,
        mockUseWallet.publicKey
      )
    })

    it('should handle string pool address', async () => {
      mockAdvancedBinOperations.getEnhancedBinArrayInfo.mockResolvedValue(mockBinArrayInfo)

      const { result } = renderHook(() =>
        useBinArrayInfo('33333333333333333333333333333333', 5, false)
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockAdvancedBinOperations.getEnhancedBinArrayInfo).toHaveBeenCalledWith(
        expect.any(PublicKey),
        5,
        mockUseWallet.publicKey
      )
    })

    it('should handle missing parameters', async () => {
      const { result } = renderHook(() => useBinArrayInfo())

      await waitFor(() => {
        expect(result.current.binArrayInfo).toBeNull()
      })

      expect(mockAdvancedBinOperations.getEnhancedBinArrayInfo).not.toHaveBeenCalled()
    })

    it('should handle missing publicKey', async () => {
      mockUseWallet.connected = false
      mockUseWallet.publicKey = null

      const { result } = renderHook(() => useBinArrayInfo(mockPoolAddress, 5, false))

      await waitFor(() => {
        expect(result.current.binArrayInfo).toBeNull()
      })

      expect(mockAdvancedBinOperations.getEnhancedBinArrayInfo).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockAdvancedBinOperations.getEnhancedBinArrayInfo.mockRejectedValue(
        new Error('Bin array info failed')
      )

      const { result } = renderHook(() => useBinArrayInfo(mockPoolAddress, 5, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Bin array info failed')
        expect(result.current.binArrayInfo).toBeNull()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should refresh bin array info manually', async () => {
      mockAdvancedBinOperations.getEnhancedBinArrayInfo.mockResolvedValue(mockBinArrayInfo)

      const { result } = renderHook(() => useBinArrayInfo(mockPoolAddress, 5, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshBinArrayInfo()
      })

      expect(mockAdvancedBinOperations.getEnhancedBinArrayInfo).toHaveBeenCalledTimes(2)
    })

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockAdvancedBinOperations.getEnhancedBinArrayInfo.mockRejectedValue('String error')

      const { result } = renderHook(() => useBinArrayInfo(mockPoolAddress, 5, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch bin array info')
      })

      consoleErrorSpy.mockRestore()
    })

    it('should update when parameters change', async () => {
      mockAdvancedBinOperations.getEnhancedBinArrayInfo.mockResolvedValue(mockBinArrayInfo)

      const { rerender } = renderHook(
        ({ index }) => useBinArrayInfo(mockPoolAddress, index, false),
        { initialProps: { index: 5 } }
      )

      await waitFor(() => {
        expect(mockAdvancedBinOperations.getEnhancedBinArrayInfo).toHaveBeenCalledWith(
          mockPoolAddress,
          5,
          mockUseWallet.publicKey
        )
      })

      // Change index
      rerender({ index: 6 })

      await waitFor(() => {
        expect(mockAdvancedBinOperations.getEnhancedBinArrayInfo).toHaveBeenCalledWith(
          mockPoolAddress,
          6,
          mockUseWallet.publicKey
        )
      })
    })
  })

  describe('useBinReserves', () => {
    const mockReserves = [
      {
        binId: 123,
        reserveX: '1000',
        reserveY: '2000',
        totalSupply: '3000',
        liquidityShare: new BN('500'),
        binPosistion: 0,
        feesX: '10',
        feesY: '20',
      },
      {
        binId: 124,
        reserveX: '1500',
        reserveY: '3000',
        totalSupply: '4500',
        liquidityShare: new BN('750'),
        binPosistion: 1,
        feesX: '15',
        feesY: '30',
      },
    ]

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useBinReserves())

      expect(result.current.reserves).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should fetch bin reserves successfully', async () => {
      mockAdvancedBinOperations.getEnhancedBinReserves.mockResolvedValue(mockReserves)

      const { result } = renderHook(() =>
        useBinReserves(mockPositionAddress, mockPoolAddress, false)
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.reserves).toEqual(mockReserves)
      expect(mockAdvancedBinOperations.getEnhancedBinReserves).toHaveBeenCalledWith(
        mockPositionAddress,
        mockPoolAddress,
        mockUseWallet.publicKey
      )
    })

    it('should handle string addresses', async () => {
      mockAdvancedBinOperations.getEnhancedBinReserves.mockResolvedValue(mockReserves)

      const { result } = renderHook(() =>
        useBinReserves(
          '44444444444444444444444444444444',
          '33333333333333333333333333333333',
          false
        )
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockAdvancedBinOperations.getEnhancedBinReserves).toHaveBeenCalledWith(
        expect.any(PublicKey),
        expect.any(PublicKey),
        mockUseWallet.publicKey
      )
    })

    it('should handle missing parameters', async () => {
      const { result } = renderHook(() => useBinReserves())

      await waitFor(() => {
        expect(result.current.reserves).toEqual([])
      })

      expect(mockAdvancedBinOperations.getEnhancedBinReserves).not.toHaveBeenCalled()
    })

    it('should handle missing publicKey', async () => {
      mockUseWallet.connected = false
      mockUseWallet.publicKey = null

      const { result } = renderHook(() =>
        useBinReserves(mockPositionAddress, mockPoolAddress, false)
      )

      await waitFor(() => {
        expect(result.current.reserves).toEqual([])
      })

      expect(mockAdvancedBinOperations.getEnhancedBinReserves).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockAdvancedBinOperations.getEnhancedBinReserves.mockRejectedValue(
        new Error('Bin reserves failed')
      )

      const { result } = renderHook(() =>
        useBinReserves(mockPositionAddress, mockPoolAddress, false)
      )

      await waitFor(() => {
        expect(result.current.error).toBe('Bin reserves failed')
        expect(result.current.reserves).toEqual([])
      })

      consoleErrorSpy.mockRestore()
    })

    it('should refresh bin reserves manually', async () => {
      mockAdvancedBinOperations.getEnhancedBinReserves.mockResolvedValue(mockReserves)

      const { result } = renderHook(() =>
        useBinReserves(mockPositionAddress, mockPoolAddress, false)
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshBinReserves()
      })

      expect(mockAdvancedBinOperations.getEnhancedBinReserves).toHaveBeenCalledTimes(2)
    })

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockAdvancedBinOperations.getEnhancedBinReserves.mockRejectedValue('String error')

      const { result } = renderHook(() =>
        useBinReserves(mockPositionAddress, mockPoolAddress, false)
      )

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch bin reserves')
      })

      consoleErrorSpy.mockRestore()
    })

    it('should update when parameters change', async () => {
      mockAdvancedBinOperations.getEnhancedBinReserves.mockResolvedValue(mockReserves)

      const newPositionAddress = new PublicKey('55555555555555555555555555555555')

      const { rerender } = renderHook(
        ({ positionAddress }) => useBinReserves(positionAddress, mockPoolAddress, false),
        { initialProps: { positionAddress: mockPositionAddress } }
      )

      await waitFor(() => {
        expect(mockAdvancedBinOperations.getEnhancedBinReserves).toHaveBeenCalledWith(
          mockPositionAddress,
          mockPoolAddress,
          mockUseWallet.publicKey
        )
      })

      // Change position address
      rerender({ positionAddress: newPositionAddress })

      await waitFor(() => {
        expect(mockAdvancedBinOperations.getEnhancedBinReserves).toHaveBeenCalledWith(
          newPositionAddress,
          mockPoolAddress,
          mockUseWallet.publicKey
        )
      })
    })
  })

  describe('useBinCacheManagement', () => {
    const mockCacheStats = {
      count: 120,
      oldestTimestamp: Date.now() - 300000, // 5 minutes ago
    }

    it('should initialize with cache stats', () => {
      mockAdvancedBinOperations.getCacheStats.mockReturnValue(mockCacheStats)

      const { result } = renderHook(() => useBinCacheManagement())

      expect(result.current.cacheStats).toEqual(mockCacheStats)
    })

    it('should refresh cache stats', () => {
      const { result } = renderHook(() => useBinCacheManagement())

      act(() => {
        result.current.refreshCacheStats()
      })

      expect(mockAdvancedBinOperations.getCacheStats).toHaveBeenCalledTimes(2) // Initial + refresh
    })

    it('should invalidate cache with specific type', () => {
      const { result } = renderHook(() => useBinCacheManagement())

      act(() => {
        result.current.invalidateCache('analysis')
      })

      expect(mockAdvancedBinOperations.invalidateCache).toHaveBeenCalledWith('analysis')
      expect(mockAdvancedBinOperations.getCacheStats).toHaveBeenCalledTimes(2) // Initial + after invalidate
    })

    it('should invalidate all cache when no type specified', () => {
      const { result } = renderHook(() => useBinCacheManagement())

      act(() => {
        result.current.invalidateCache()
      })

      expect(mockAdvancedBinOperations.invalidateCache).toHaveBeenCalledWith(undefined)
    })

    it('should refresh cache stats periodically', () => {
      renderHook(() => useBinCacheManagement())

      act(() => {
        jest.advanceTimersByTime(10000) // 10 seconds
      })

      expect(mockAdvancedBinOperations.getCacheStats).toHaveBeenCalledTimes(2) // Initial + periodic
    })

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() => useBinCacheManagement())

      unmount()

      act(() => {
        jest.advanceTimersByTime(10000)
      })

      expect(mockAdvancedBinOperations.getCacheStats).toHaveBeenCalledTimes(1) // Only initial
    })

    it('should handle all cache invalidation types', () => {
      const { result } = renderHook(() => useBinCacheManagement())

      const cacheTypes = ['analysis', 'metrics', 'all'] as const

      cacheTypes.forEach((type) => {
        act(() => {
          result.current.invalidateCache(type)
        })

        expect(mockAdvancedBinOperations.invalidateCache).toHaveBeenCalledWith(type)
      })
    })
  })

  describe('useComprehensiveBinData', () => {
    const mockAnalysis = {
      activeBins: [
        { binId: 123, liquidityX: '1000', liquidityY: '2000', price: 100.0, isActive: true, feeRate: 0.0025, volume24h: '5000' },
      ],
      recommendedBins: [123],
      liquidityDistribution: {
        concentrated: 0.65,
        spread: 0.35,
        ranges: [
          {
            min: 95.0,
            max: 105.0,
            binIds: [123],
            liquidity: '3000'
          }
        ]
      },
      priceRanges: [
        {
          min: 95.0,
          max: 105.0,
          binIds: [123],
          liquidity: '3000'
        }
      ],
      optimalRanges: {
        conservative: {
          min: 98.0,
          max: 103.0,
          binIds: [123],
          liquidity: '2000'
        },
        balanced: {
          min: 95.0,
          max: 105.0,
          binIds: [123],
          liquidity: '3000'
        },
        aggressive: {
          min: 90.0,
          max: 110.0,
          binIds: [123],
          liquidity: '5000'
        }
      },
      binEfficiency: {
        highActivity: 0.75,
        mediumActivity: 0.45,
        lowActivity: 0.15,
      },
    }

    const mockMetrics = {
      totalLiquidity: '75000',
      activeBinCount: 25,
      averageLiquidity: '3000',
      liquidityConcentration: 0.65,
      priceVolatility: 0.12,
      utilizationRate: 0.85,
    }

    const mockCacheStats = {
      count: 120,
      oldestTimestamp: Date.now() - 300000, // 5 minutes ago
    }

    beforeEach(() => {
      mockAdvancedBinOperations.getAdvancedBinAnalysis.mockResolvedValue(mockAnalysis)
      mockAdvancedBinOperations.getBinLiquidityMetrics.mockResolvedValue(mockMetrics)
      mockAdvancedBinOperations.getCacheStats.mockReturnValue(mockCacheStats)
    })

    it('should combine analysis and metrics data', async () => {
      const { result } = renderHook(() => useComprehensiveBinData(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.analysis).toEqual(mockAnalysis)
      expect(result.current.metrics).toEqual(mockMetrics)
      expect(result.current.cacheStats).toEqual(mockCacheStats)
      expect(result.current.hasData).toBe(true)
    })

    it('should handle loading states correctly', () => {
      mockAdvancedBinOperations.getAdvancedBinAnalysis.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockAnalysis), 100))
      )

      const { result } = renderHook(() => useComprehensiveBinData(mockPoolAddress, false))

      expect(result.current.loading).toBe(true)
      expect(result.current.hasData).toBe(false)
    })

    it('should handle error states from either component', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockAdvancedBinOperations.getAdvancedBinAnalysis.mockRejectedValue(new Error('Analysis error'))

      const { result } = renderHook(() => useComprehensiveBinData(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Analysis error')
        expect(result.current.hasData).toBe(false)
      })

      consoleErrorSpy.mockRestore()
    })

    it('should indicate hasData correctly when both analysis and metrics are present', async () => {
      const { result } = renderHook(() => useComprehensiveBinData(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.hasData).toBe(true)
      })
    })

    it('should indicate no data when analysis is missing', async () => {
      mockAdvancedBinOperations.getAdvancedBinAnalysis.mockRejectedValue(new Error('Analysis failed'))

      const { result } = renderHook(() => useComprehensiveBinData(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.hasData).toBe(false)
      })
    })

    it('should indicate no data when metrics is missing', async () => {
      mockAdvancedBinOperations.getBinLiquidityMetrics.mockRejectedValue(new Error('Metrics failed'))

      const { result } = renderHook(() => useComprehensiveBinData(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.hasData).toBe(false)
      })
    })

    it('should enable real-time updates when specified', async () => {
      renderHook(() => useComprehensiveBinData(mockPoolAddress, true))

      await waitFor(() => {
        expect(mockAdvancedBinOperations.getAdvancedBinAnalysis).toHaveBeenCalledTimes(1)
        expect(mockAdvancedBinOperations.getBinLiquidityMetrics).toHaveBeenCalledTimes(1)
      })

      // Analysis uses analytics interval (2 seconds)
      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(mockAdvancedBinOperations.getAdvancedBinAnalysis).toHaveBeenCalledTimes(2)
      })

      // Metrics uses prices interval (1 second)
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(mockAdvancedBinOperations.getBinLiquidityMetrics).toHaveBeenCalledTimes(3) // 1 initial + 1 from first advance + 1 from second advance
      })
    })

    it('should handle errors from metrics component', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockAdvancedBinOperations.getBinLiquidityMetrics.mockRejectedValue(new Error('Metrics error'))

      const { result } = renderHook(() => useComprehensiveBinData(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Metrics error')
      })

      consoleErrorSpy.mockRestore()
    })

    it('should handle missing pool address', async () => {
      const { result } = renderHook(() => useComprehensiveBinData(undefined, false))

      await waitFor(() => {
        expect(result.current.analysis).toBeNull()
        expect(result.current.metrics).toBeNull()
        expect(result.current.hasData).toBe(false)
      })

      expect(mockAdvancedBinOperations.getAdvancedBinAnalysis).not.toHaveBeenCalled()
      expect(mockAdvancedBinOperations.getBinLiquidityMetrics).not.toHaveBeenCalled()
    })

    it('should provide cache stats regardless of data state', async () => {
      const { result } = renderHook(() => useComprehensiveBinData(undefined, false))

      expect(result.current.cacheStats).toEqual(mockCacheStats)
    })
  })
})