import { renderHook, act, waitFor } from '@testing-library/react'
import { PublicKey } from '@solana/web3.js'
import {
  useTokenPrice,
  useMultipleTokenPrices,
  usePositionValuation,
  useOracleCache,
  useComprehensivePriceData
} from '@/hooks/use-oracle-prices'

// Mock the wallet adapter
const mockUseWallet = {
  publicKey: new PublicKey('11111111111111111111111111111112'),
  connected: true,
}

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockUseWallet,
}))

// Mock the oracle price feeds
jest.mock('@/lib/oracle/price-feeds', () => ({
  oraclePriceFeeds: {
    getTokenPrice: jest.fn(),
    getMultipleTokenPrices: jest.fn(),
    getPositionValue: jest.fn(),
    getCacheStats: jest.fn(),
    getSupportedTokens: jest.fn(),
    clearPriceCache: jest.fn(),
  },
}))

// Get the mocked price feeds for type checking
import { oraclePriceFeeds } from '@/lib/oracle/price-feeds'
const mockOraclePriceFeeds = oraclePriceFeeds as jest.Mocked<typeof oraclePriceFeeds>

// Mock constants
jest.mock('@/lib/constants', () => ({
  REFRESH_INTERVALS: {
    prices: 1000, // 1 second for testing
    analytics: 2000,
    positions: 3000,
  },
}))

describe('Oracle Prices Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()

    // Setup default mock returns
    mockOraclePriceFeeds.getCacheStats.mockReturnValue({
      count: 50,
      symbols: ['USDC', 'SOL', 'BTC', 'ETH'],
    })

    mockOraclePriceFeeds.getSupportedTokens.mockReturnValue(['USDC', 'SOL', 'BTC', 'ETH'])
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('useTokenPrice', () => {
    const mockPriceData = {
      symbol: 'SOL',
      price: 100.5,
      source: 'pyth' as const,
      confidence: 0.95,
      timestamp: new Date(),
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useTokenPrice())

      expect(result.current.priceData).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.lastUpdate).toBeNull()
    })

    it('should fetch token price successfully', async () => {
      mockOraclePriceFeeds.getTokenPrice.mockResolvedValue(mockPriceData)

      const { result } = renderHook(() => useTokenPrice('SOL', false)) // Disable realtime for testing

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.priceData).toEqual(mockPriceData)
      expect(result.current.lastUpdate).toBeDefined()
      expect(mockOraclePriceFeeds.getTokenPrice).toHaveBeenCalledWith('SOL')
    })

    it('should handle missing symbol', async () => {
      const { result } = renderHook(() => useTokenPrice(undefined, false))

      await waitFor(() => {
        expect(result.current.priceData).toBeNull()
      })

      expect(mockOraclePriceFeeds.getTokenPrice).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockOraclePriceFeeds.getTokenPrice.mockRejectedValue(new Error('Price fetch failed'))

      const { result } = renderHook(() => useTokenPrice('SOL', false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Price fetch failed')
      expect(result.current.priceData).toBeNull()
      consoleErrorSpy.mockRestore()
    })

    it('should refresh price manually', async () => {
      mockOraclePriceFeeds.getTokenPrice.mockResolvedValue(mockPriceData)

      const { result } = renderHook(() => useTokenPrice('SOL', false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Manual refresh
      await act(async () => {
        await result.current.refreshPrice()
      })

      expect(mockOraclePriceFeeds.getTokenPrice).toHaveBeenCalledTimes(2)
    })

    it('should set up real-time polling when enabled', async () => {
      mockOraclePriceFeeds.getTokenPrice.mockResolvedValue(mockPriceData)

      renderHook(() => useTokenPrice('SOL', true)) // Enable realtime

      // Wait for initial fetch
      await waitFor(() => {
        expect(mockOraclePriceFeeds.getTokenPrice).toHaveBeenCalledTimes(1)
      })

      // Advance timer to trigger polling
      act(() => {
        jest.advanceTimersByTime(1000) // REFRESH_INTERVALS.prices
      })

      await waitFor(() => {
        expect(mockOraclePriceFeeds.getTokenPrice).toHaveBeenCalledTimes(2)
      })
    })

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() => useTokenPrice('SOL', true))

      unmount()

      // Advance timer - should not trigger more calls
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      // Should only have the initial call
      expect(mockOraclePriceFeeds.getTokenPrice).toHaveBeenCalledTimes(1)
    })

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockOraclePriceFeeds.getTokenPrice.mockRejectedValue('String error')

      const { result } = renderHook(() => useTokenPrice('SOL', false))

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch price')
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('useMultipleTokenPrices', () => {
    const mockMultiplePrices = {
      SOL: {
        symbol: 'SOL',
        price: 100.5,
        source: 'pyth' as const,
        confidence: 0.95,
        timestamp: new Date(),
      },
      USDC: {
        symbol: 'USDC',
        price: 1.0,
        source: 'pyth' as const,
        confidence: 0.99,
        timestamp: new Date(),
      },
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useMultipleTokenPrices([], false))

      expect(result.current.priceData).toEqual({})
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should fetch multiple token prices successfully', async () => {
      mockOraclePriceFeeds.getMultipleTokenPrices.mockResolvedValue(mockMultiplePrices)

      const { result } = renderHook(() => useMultipleTokenPrices(['SOL', 'USDC'], false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.priceData).toEqual(mockMultiplePrices)
      expect(mockOraclePriceFeeds.getMultipleTokenPrices).toHaveBeenCalledWith(['SOL', 'USDC'])
    })

    it('should handle empty symbols array', async () => {
      const { result } = renderHook(() => useMultipleTokenPrices([], false))

      await waitFor(() => {
        expect(result.current.priceData).toEqual({})
      })

      expect(mockOraclePriceFeeds.getMultipleTokenPrices).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockOraclePriceFeeds.getMultipleTokenPrices.mockRejectedValue(new Error('Fetch failed'))

      const { result } = renderHook(() => useMultipleTokenPrices(['SOL', 'USDC'], false))

      await waitFor(() => {
        expect(result.current.error).toBe('Fetch failed')
        expect(result.current.priceData).toEqual({})
      })

      consoleErrorSpy.mockRestore()
    })

    it('should refresh prices manually', async () => {
      mockOraclePriceFeeds.getMultipleTokenPrices.mockResolvedValue(mockMultiplePrices)

      const { result } = renderHook(() => useMultipleTokenPrices(['SOL', 'USDC'], false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshPrices()
      })

      expect(mockOraclePriceFeeds.getMultipleTokenPrices).toHaveBeenCalledTimes(2)
    })

    it('should set up real-time polling when enabled', async () => {
      mockOraclePriceFeeds.getMultipleTokenPrices.mockResolvedValue(mockMultiplePrices)

      renderHook(() => useMultipleTokenPrices(['SOL', 'USDC'], true))

      await waitFor(() => {
        expect(mockOraclePriceFeeds.getMultipleTokenPrices).toHaveBeenCalledTimes(1)
      })

      act(() => {
        jest.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(mockOraclePriceFeeds.getMultipleTokenPrices).toHaveBeenCalledTimes(2)
      })
    })

    it('should update when symbols array changes', async () => {
      mockOraclePriceFeeds.getMultipleTokenPrices.mockResolvedValue(mockMultiplePrices)

      const { rerender } = renderHook(
        ({ symbols }) => useMultipleTokenPrices(symbols, false),
        { initialProps: { symbols: ['SOL'] } }
      )

      await waitFor(() => {
        expect(mockOraclePriceFeeds.getMultipleTokenPrices).toHaveBeenCalledWith(['SOL'])
      })

      // Change symbols
      rerender({ symbols: ['SOL', 'USDC'] })

      await waitFor(() => {
        expect(mockOraclePriceFeeds.getMultipleTokenPrices).toHaveBeenCalledWith(['SOL', 'USDC'])
      })
    })
  })

  describe('usePositionValuation', () => {
    const mockValuation = {
      totalValue: 1500.75,
      tokenXValue: 750.0,
      tokenYValue: 750.75,
      priceData: {
        USDC: {
          symbol: 'USDC',
          price: 1.0,
          source: 'pyth' as const,
          confidence: 0.99,
          timestamp: new Date(),
        },
        SOL: {
          symbol: 'SOL',
          price: 100.5,
          source: 'pyth' as const,
          confidence: 0.95,
          timestamp: new Date(),
        },
      },
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => usePositionValuation())

      expect(result.current.valuation).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should calculate position valuation successfully', async () => {
      mockOraclePriceFeeds.getPositionValue.mockResolvedValue(mockValuation)

      const { result } = renderHook(() =>
        usePositionValuation('USDC', 'SOL', '1000', '500', false)
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.valuation).toEqual(mockValuation)
      expect(mockOraclePriceFeeds.getPositionValue).toHaveBeenCalledWith(
        'USDC',
        'SOL',
        '1000',
        '500'
      )
    })

    it('should handle missing parameters', async () => {
      const { result } = renderHook(() => usePositionValuation(undefined, 'SOL', '1000', '500', false))

      await waitFor(() => {
        expect(result.current.valuation).toBeNull()
      })

      expect(mockOraclePriceFeeds.getPositionValue).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockOraclePriceFeeds.getPositionValue.mockRejectedValue(new Error('Valuation failed'))

      const { result } = renderHook(() =>
        usePositionValuation('USDC', 'SOL', '1000', '500', false)
      )

      await waitFor(() => {
        expect(result.current.error).toBe('Valuation failed')
        expect(result.current.valuation).toBeNull()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should refresh valuation manually', async () => {
      mockOraclePriceFeeds.getPositionValue.mockResolvedValue(mockValuation)

      const { result } = renderHook(() =>
        usePositionValuation('USDC', 'SOL', '1000', '500', false)
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshValuation()
      })

      expect(mockOraclePriceFeeds.getPositionValue).toHaveBeenCalledTimes(2)
    })

    it('should set up real-time updates when enabled', async () => {
      mockOraclePriceFeeds.getPositionValue.mockResolvedValue(mockValuation)

      renderHook(() => usePositionValuation('USDC', 'SOL', '1000', '500', true))

      await waitFor(() => {
        expect(mockOraclePriceFeeds.getPositionValue).toHaveBeenCalledTimes(1)
      })

      act(() => {
        jest.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(mockOraclePriceFeeds.getPositionValue).toHaveBeenCalledTimes(2)
      })
    })

    it('should handle parameter changes', async () => {
      mockOraclePriceFeeds.getPositionValue.mockResolvedValue(mockValuation)

      const { rerender } = renderHook(
        ({ tokenXAmount }) => usePositionValuation('USDC', 'SOL', tokenXAmount, '500', false),
        { initialProps: { tokenXAmount: '1000' } }
      )

      await waitFor(() => {
        expect(mockOraclePriceFeeds.getPositionValue).toHaveBeenCalledWith('USDC', 'SOL', '1000', '500')
      })

      // Change amount
      rerender({ tokenXAmount: '2000' })

      await waitFor(() => {
        expect(mockOraclePriceFeeds.getPositionValue).toHaveBeenCalledWith('USDC', 'SOL', '2000', '500')
      })
    })
  })

  describe('useOracleCache', () => {
    const mockCacheStats = {
      count: 50,
      symbols: ['USDC', 'SOL', 'BTC', 'ETH'],
    }

    const mockSupportedTokens = ['USDC', 'SOL', 'BTC', 'ETH']

    it('should initialize with cache stats and supported tokens', () => {
      mockOraclePriceFeeds.getCacheStats.mockReturnValue(mockCacheStats)
      mockOraclePriceFeeds.getSupportedTokens.mockReturnValue(mockSupportedTokens)

      const { result } = renderHook(() => useOracleCache())

      expect(result.current.cacheStats).toEqual(mockCacheStats)
      expect(result.current.supportedTokens).toEqual(mockSupportedTokens)
    })

    it('should refresh cache stats', () => {
      const { result } = renderHook(() => useOracleCache())

      act(() => {
        result.current.refreshCacheStats()
      })

      expect(mockOraclePriceFeeds.getCacheStats).toHaveBeenCalledTimes(2) // Initial + refresh
    })

    it('should clear cache', () => {
      const { result } = renderHook(() => useOracleCache())

      act(() => {
        result.current.clearCache()
      })

      expect(mockOraclePriceFeeds.clearPriceCache).toHaveBeenCalled()
      expect(mockOraclePriceFeeds.getCacheStats).toHaveBeenCalledTimes(2) // Initial + after clear
    })

    it('should refresh cache stats periodically', () => {
      renderHook(() => useOracleCache())

      // Advance timer to trigger periodic refresh
      act(() => {
        jest.advanceTimersByTime(15000) // 15 seconds
      })

      expect(mockOraclePriceFeeds.getCacheStats).toHaveBeenCalledTimes(2) // Initial + periodic
    })

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() => useOracleCache())

      unmount()

      act(() => {
        jest.advanceTimersByTime(15000)
      })

      // Should only have the initial call
      expect(mockOraclePriceFeeds.getCacheStats).toHaveBeenCalledTimes(1)
    })
  })

  describe('useComprehensivePriceData', () => {
    const mockMultiplePrices = {
      SOL: {
        symbol: 'SOL',
        price: 100.5,
        source: 'pyth' as const,
        confidence: 0.95,
        timestamp: new Date(),
      },
      USDC: {
        symbol: 'USDC',
        price: 1.0,
        source: 'pyth' as const,
        confidence: 0.99,
        timestamp: new Date(),
      },
    }

    const mockCacheStats = {
      count: 50,
      symbols: ['USDC', 'SOL', 'BTC', 'ETH'],
    }

    it('should combine multiple token prices with cache data', async () => {
      mockOraclePriceFeeds.getMultipleTokenPrices.mockResolvedValue(mockMultiplePrices)
      mockOraclePriceFeeds.getCacheStats.mockReturnValue(mockCacheStats)
      mockOraclePriceFeeds.getSupportedTokens.mockReturnValue(['SOL', 'USDC', 'BTC'])

      const { result } = renderHook(() => useComprehensivePriceData(['SOL', 'USDC'], false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.priceData).toEqual(mockMultiplePrices)
      expect(result.current.cacheStats).toEqual(mockCacheStats)
      expect(result.current.supportedTokens).toEqual(['SOL', 'USDC', 'BTC'])
      expect(result.current.hasData).toBe(true)
    })

    it('should handle loading states correctly', () => {
      mockOraclePriceFeeds.getMultipleTokenPrices.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockMultiplePrices), 100))
      )

      const { result } = renderHook(() => useComprehensivePriceData(['SOL', 'USDC'], false))

      expect(result.current.loading).toBe(true)
      expect(result.current.hasData).toBe(false)
    })

    it('should handle error states correctly', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockOraclePriceFeeds.getMultipleTokenPrices.mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useComprehensivePriceData(['SOL', 'USDC'], false))

      await waitFor(() => {
        expect(result.current.error).toBe('API Error')
        expect(result.current.hasData).toBe(false)
      })

      consoleErrorSpy.mockRestore()
    })

    it('should indicate no data when price data is empty', async () => {
      mockOraclePriceFeeds.getMultipleTokenPrices.mockResolvedValue({})

      const { result } = renderHook(() => useComprehensivePriceData(['SOL', 'USDC'], false))

      await waitFor(() => {
        expect(result.current.hasData).toBe(false)
      })
    })

    it('should enable real-time updates when specified', async () => {
      mockOraclePriceFeeds.getMultipleTokenPrices.mockResolvedValue(mockMultiplePrices)

      renderHook(() => useComprehensivePriceData(['SOL', 'USDC'], true))

      await waitFor(() => {
        expect(mockOraclePriceFeeds.getMultipleTokenPrices).toHaveBeenCalledTimes(1)
      })

      act(() => {
        jest.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(mockOraclePriceFeeds.getMultipleTokenPrices).toHaveBeenCalledTimes(2)
      })
    })
  })
})