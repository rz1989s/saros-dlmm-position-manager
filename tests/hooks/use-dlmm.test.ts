import { renderHook, act, waitFor } from '@testing-library/react'
import { PublicKey } from '@solana/web3.js'
import { useUserPositions, usePoolData, useSwapQuote } from '../../src/hooks/use-dlmm'

// Mock the wallet adapter
const mockUseWallet = {
  publicKey: new PublicKey('11111111111111111111111111111112'),
  connected: true,
}

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockUseWallet,
}))

// Mock the DLMM client
jest.mock('../../src/lib/dlmm/client', () => ({
  dlmmClient: {
    getUserPositions: jest.fn(),
    getLbPair: jest.fn(),
    getBinLiquidity: jest.fn(),
    simulateSwap: jest.fn(),
  },
}))

// Get the mocked client for type checking
import { dlmmClient } from '../../src/lib/dlmm/client'
const mockDlmmClient = dlmmClient as jest.Mocked<typeof dlmmClient>

// Mock the utility functions
jest.mock('../../src/lib/dlmm/utils', () => ({
  formatBinData: jest.fn((data) => data),
}))

// Mock constants
jest.mock('../../src/lib/constants', () => ({
  REFRESH_INTERVALS: {
    positions: 1000, // 1 second for testing
    analytics: 2000, // 2 seconds for testing
    prices: 500, // 0.5 second for testing
  },
}))

describe('DLMM Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('useUserPositions', () => {
    const mockPositions = [
      {
        id: '1',
        poolAddress: 'pool1',
        tokenX: { address: 'USDC', symbol: 'USDC', decimals: 6 },
        tokenY: { address: 'SOL', symbol: 'SOL', decimals: 9 },
        liquidityAmount: '1000',
        feesEarned: { tokenX: '10', tokenY: '20' },
        createdAt: new Date(),
        lastUpdated: new Date(),
        isActive: true,
      },
    ]

    it('should fetch positions successfully', async () => {
      mockDlmmClient.getUserPositions.mockResolvedValue(mockPositions)

      const { result } = renderHook(() => useUserPositions(false)) // Disable realtime for testing

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.positions).toHaveLength(1)
      expect(mockDlmmClient.getUserPositions).toHaveBeenCalledWith(mockUseWallet.publicKey)
    })

    it('should handle empty positions when not connected', async () => {
      mockUseWallet.connected = false

      const { result } = renderHook(() => useUserPositions(false))

      await waitFor(() => {
        expect(result.current.positions).toEqual([])
        expect(result.current.loading).toBe(false)
      })

      mockUseWallet.connected = true // Reset for other tests
    })

    it('should refresh positions', async () => {
      mockDlmmClient.getUserPositions.mockResolvedValue(mockPositions)

      const { result } = renderHook(() => useUserPositions(false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.refreshPositions()
      })

      expect(result.current.refreshing).toBe(true)

      await waitFor(() => {
        expect(result.current.refreshing).toBe(false)
      })

      expect(mockDlmmClient.getUserPositions).toHaveBeenCalledTimes(2)
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockDlmmClient.getUserPositions.mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useUserPositions(false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.positions).toEqual([])
      consoleErrorSpy.mockRestore()
    })

    it('should set up real-time polling when enabled', async () => {
      mockDlmmClient.getUserPositions.mockResolvedValue(mockPositions)

      renderHook(() => useUserPositions(true)) // Enable realtime

      // Initial call
      await waitFor(() => {
        expect(mockDlmmClient.getUserPositions).toHaveBeenCalledTimes(1)
      })

      // Fast forward time to trigger polling
      act(() => {
        jest.advanceTimersByTime(1000) // REFRESH_INTERVALS.positions
      })

      await waitFor(() => {
        expect(mockDlmmClient.getUserPositions).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('usePoolData', () => {
    const mockPoolAddress = new PublicKey('11111111111111111111111111111112')
    const mockPairData = {
      publicKey: mockPoolAddress,
      tokenX: { mint: 'USDC', symbol: 'USDC' },
      tokenY: { mint: 'SOL', symbol: 'SOL' },
      activeBin: { binId: 123, price: 100 },
    }
    const mockBinData = [
      { binId: 122, liquidityX: '100', liquidityY: '200' },
      { binId: 123, liquidityX: '150', liquidityY: '300' },
    ]

    it('should fetch pool data successfully', async () => {
      mockDlmmClient.getLbPair.mockResolvedValue(mockPairData)
      mockDlmmClient.getBinLiquidity.mockResolvedValue(mockBinData)

      const { result } = renderHook(() => usePoolData(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.poolData).toBeDefined()
      expect(result.current.binData).toEqual(mockBinData)
      expect(mockDlmmClient.getLbPair).toHaveBeenCalledWith(mockPoolAddress)
      expect(mockDlmmClient.getBinLiquidity).toHaveBeenCalledWith(mockPoolAddress, PublicKey.default)
    })

    it('should handle empty pool address', async () => {
      const { result } = renderHook(() => usePoolData(undefined, false))

      await waitFor(() => {
        expect(result.current.poolData).toBeNull()
        expect(result.current.binData).toEqual([])
      })

      expect(mockDlmmClient.getLbPair).not.toHaveBeenCalled()
      expect(mockDlmmClient.getBinLiquidity).not.toHaveBeenCalled()
    })

    it('should refresh pool data', async () => {
      mockDlmmClient.getLbPair.mockResolvedValue(mockPairData)
      mockDlmmClient.getBinLiquidity.mockResolvedValue(mockBinData)

      const { result } = renderHook(() => usePoolData(mockPoolAddress, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.refreshPoolData()
      })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockDlmmClient.getLbPair).toHaveBeenCalledTimes(2)
    })

    it('should set up real-time polling when enabled', async () => {
      mockDlmmClient.getLbPair.mockResolvedValue(mockPairData)
      mockDlmmClient.getBinLiquidity.mockResolvedValue(mockBinData)

      const { result } = renderHook(() => usePoolData(mockPoolAddress, true)) // Enable realtime

      // Wait for initial loading to finish
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear mock call history after initial fetch
      mockDlmmClient.getLbPair.mockClear()

      // Fast forward time to trigger polling
      act(() => {
        jest.advanceTimersByTime(2000) // REFRESH_INTERVALS.analytics
      })

      // Should trigger second call
      await waitFor(() => {
        expect(mockDlmmClient.getLbPair).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('useSwapQuote', () => {
    const mockPoolAddress = new PublicKey('11111111111111111111111111111112')
    const mockTokenIn = new PublicKey('33333333333333333333333333333333')
    const mockQuoteData = {
      amountOut: '950',
      priceImpact: 0.02,
      fee: '5',
    }

    it('should get swap quote successfully', async () => {
      mockDlmmClient.simulateSwap.mockResolvedValue(mockQuoteData)

      const { result } = renderHook(() =>
        useSwapQuote(mockPoolAddress, '1000', mockTokenIn, 0.5, false)
      )

      // Advance timers to trigger debounced call
      act(() => {
        jest.advanceTimersByTime(500)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.quote).toEqual(mockQuoteData)
      expect(mockDlmmClient.simulateSwap).toHaveBeenCalledWith(
        mockPoolAddress,
        '1000',
        mockTokenIn,
        0.5
      )
    })

    it('should handle empty parameters', async () => {
      const { result } = renderHook(() => useSwapQuote(undefined, undefined, undefined, 0.5, false))

      await waitFor(() => {
        expect(result.current.quote).toBeNull()
        expect(result.current.loading).toBe(false)
      })

      expect(mockDlmmClient.simulateSwap).not.toHaveBeenCalled()
    })

    it('should handle zero amount', async () => {
      const { result } = renderHook(() =>
        useSwapQuote(mockPoolAddress, '0', mockTokenIn, 0.5, false)
      )

      await waitFor(() => {
        expect(result.current.quote).toBeNull()
      })

      expect(mockDlmmClient.simulateSwap).not.toHaveBeenCalled()
    })

    it('should debounce quote requests', async () => {
      mockDlmmClient.simulateSwap.mockResolvedValue(mockQuoteData)

      const { result, rerender } = renderHook(
        ({ amount }) => useSwapQuote(mockPoolAddress, amount, mockTokenIn, 0.5, false),
        { initialProps: { amount: '1000' } }
      )

      // Change amount multiple times quickly
      rerender({ amount: '1001' })
      rerender({ amount: '1002' })
      rerender({ amount: '1003' })

      // Fast forward past debounce time
      act(() => {
        jest.advanceTimersByTime(500)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should only call once after debounce
      expect(mockDlmmClient.simulateSwap).toHaveBeenCalledTimes(1)
      expect(mockDlmmClient.simulateSwap).toHaveBeenCalledWith(
        mockPoolAddress,
        '1003', // Latest amount
        mockTokenIn,
        0.5
      )
    })

    it('should set up real-time polling for prices when enabled', async () => {
      mockDlmmClient.simulateSwap.mockResolvedValue(mockQuoteData)

      renderHook(() => useSwapQuote(mockPoolAddress, '1000', mockTokenIn, 0.5, true))

      // Initial call after debounce
      act(() => {
        jest.advanceTimersByTime(500)
      })

      await waitFor(() => {
        expect(mockDlmmClient.simulateSwap).toHaveBeenCalled()
      })

      // Fast forward time to trigger polling
      act(() => {
        jest.advanceTimersByTime(500) // REFRESH_INTERVALS.prices
      })

      await waitFor(() => {
        expect(mockDlmmClient.simulateSwap).toHaveBeenCalledTimes(2)
      })
    })
  })
})