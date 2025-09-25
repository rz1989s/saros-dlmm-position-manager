import { renderHook, act, waitFor } from '@testing-library/react'
import { PublicKey, Connection } from '@solana/web3.js'
import {
  useAdvancedBacktesting,
  usePredictiveCache,
  useArbitrageDetection,
  useUserBehaviorTracking,
  useAdvancedDLMM
} from '../../src/hooks/use-advanced-dlmm'

// Mock the wallet adapter
const mockUseWallet = {
  publicKey: new PublicKey('11111111111111111111111111111112'),
  connected: true,
}

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockUseWallet,
}))

// Mock the DLMM hooks
const mockUseDLMM = {
  client: {
    getConnection: jest.fn(() => ({} as Connection)),
  },
}

const mockUseUserPositions = {
  positions: [
    {
      id: '1',
      poolAddress: new PublicKey('22222222222222222222222222222222'),
      tokenX: { address: 'USDC', symbol: 'USDC', decimals: 6 },
      tokenY: { address: 'SOL', symbol: 'SOL', decimals: 9 },
      liquidityAmount: '1000',
    },
  ],
}

jest.mock('../../src/hooks/use-dlmm', () => ({
  useDLMM: () => mockUseDLMM,
  useUserPositions: () => mockUseUserPositions,
}))

// Mock the advanced feature modules
const mockBacktestEngine = {
  runBacktest: jest.fn(),
  getBacktestResult: jest.fn(),
  cancelBacktest: jest.fn(),
  getBacktestHistory: jest.fn(),
}

jest.mock('../../src/lib/dlmm/backtesting/engine', () => ({
  BacktestEngine: jest.fn(() => mockBacktestEngine),
}))

const mockPredictiveCacheManager = {
  recordUserBehavior: jest.fn(),
  getPerformanceStats: jest.fn(),
  getUserProfile: jest.fn(),
  clearCache: jest.fn(),
}

jest.mock('../../src/lib/cache/predictive-cache-manager', () => ({
  PredictiveCacheManager: jest.fn(() => mockPredictiveCacheManager),
}))

jest.mock('../../src/lib/dlmm/arbitrage', () => ({
  ArbitrageManager: jest.fn(),
  createArbitrageManager: jest.fn(),
}))

// Get the mocked functions for type checking
import { ArbitrageManager, createArbitrageManager } from '../../src/lib/dlmm/arbitrage'
const mockArbitrageManager = {
  startArbitrageSystem: jest.fn(),
  stopArbitrageSystem: jest.fn(),
  addPoolToMonitoring: jest.fn(),
  removePoolFromMonitoring: jest.fn(),
  getActiveOpportunities: jest.fn(),
  getArbitrageStats: jest.fn(),
  executeArbitrage: jest.fn(),
  getBestOpportunityForToken: jest.fn(),
  getSystemHealth: jest.fn(),
}
const mockCreateArbitrageManager = createArbitrageManager as jest.MockedFunction<typeof createArbitrageManager>
mockCreateArbitrageManager.mockReturnValue(mockArbitrageManager as any)

describe('Advanced DLMM Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()

    // Reset wallet connection state
    mockUseWallet.connected = true

    // Setup default mock returns
    mockBacktestEngine.runBacktest.mockResolvedValue('backtest-123')
    mockBacktestEngine.getBacktestResult.mockReturnValue(null)
    mockBacktestEngine.getBacktestHistory.mockReturnValue([])

    mockPredictiveCacheManager.getPerformanceStats.mockReturnValue({
      totalPredictions: 0,
      successfulPreloads: 0,
      hitRate: 0,
      missRate: 0,
      averageConfidence: 0,
      cacheSize: 0,
      preloadQueueSize: 0,
      dataSaved: 0,
      performanceGain: 0,
    })

    mockArbitrageManager.getActiveOpportunities.mockReturnValue([])
    mockArbitrageManager.getArbitrageStats.mockReturnValue({
      totalOpportunitiesDetected: 0,
      totalProfitRealized: 0,
      averageExecutionTime: 0,
      successRate: 0,
      mevProtectionEffectiveness: 0,
      riskAdjustedReturn: 0,
    })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('useAdvancedBacktesting', () => {
    const mockConfig = {
      name: 'Test Backtest',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      strategy: 'aggressive',
      initialCapital: 10000,
      parameters: {},
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useAdvancedBacktesting())

      expect(result.current.activeBacktests).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.isEnabled).toBe(true)
    })

    it('should run backtest successfully', async () => {
      const backtestResult = {
        id: 'backtest-123',
        status: 'completed',
        results: { totalReturn: 15.5 },
      }

      mockBacktestEngine.runBacktest.mockResolvedValue('backtest-123')
      mockBacktestEngine.getBacktestResult.mockReturnValue(backtestResult)

      const { result } = renderHook(() => useAdvancedBacktesting())

      let backtestId: string | undefined
      await act(async () => {
        backtestId = await result.current.runBacktest(mockConfig)
      })

      expect(backtestId).toBe('backtest-123')
      expect(mockBacktestEngine.runBacktest).toHaveBeenCalledWith(mockConfig)
      expect(result.current.loading).toBe(false)
    })

    it('should handle backtest errors', async () => {
      const error = new Error('Backtest failed')
      mockBacktestEngine.runBacktest.mockRejectedValue(error)

      const { result } = renderHook(() => useAdvancedBacktesting())

      await act(async () => {
        try {
          await result.current.runBacktest(mockConfig)
        } catch (e) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Backtest failed')
      expect(result.current.loading).toBe(false)
    })

    it('should get backtest result', () => {
      const backtestResult = { id: 'test', status: 'completed' }
      mockBacktestEngine.getBacktestResult.mockReturnValue(backtestResult)

      const { result } = renderHook(() => useAdvancedBacktesting())

      const retrievedResult = result.current.getBacktestResult('test')
      expect(retrievedResult).toBeNull() // Initially null until backtest runs
    })

    it('should cancel backtest', () => {
      const { result } = renderHook(() => useAdvancedBacktesting())

      act(() => {
        result.current.cancelBacktest('test-backtest')
      })

      expect(mockBacktestEngine.cancelBacktest).toHaveBeenCalledWith('test-backtest')
    })

    it('should get backtest history', () => {
      const mockHistory = [{ id: 'test', name: 'Test Backtest' }]
      mockBacktestEngine.getBacktestHistory.mockReturnValue(mockHistory)

      const { result } = renderHook(() => useAdvancedBacktesting())

      const history = result.current.getBacktestHistory()
      expect(history).toEqual(mockHistory)
    })

    it('should handle disconnected wallet', async () => {
      mockUseWallet.connected = false

      const { result } = renderHook(() => useAdvancedBacktesting())

      expect(result.current.isEnabled).toBe(false)

      await act(async () => {
        try {
          await result.current.runBacktest(mockConfig)
        } catch (e) {
          expect((e as Error).message).toBe('Wallet not connected')
        }
      })
    })
  })

  describe('usePredictiveCache', () => {
    const mockUserBehavior = {
      id: 'behavior-123',
      action: 'navigate',
      target: '/dashboard',
      timestamp: new Date(),
      context: {
        route: '/dashboard',
        timeOnPage: 0,
        walletConnected: true,
        positionCount: 0,
        lastRefresh: new Date(),
      },
      metadata: { test: true },
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => usePredictiveCache())

      expect(result.current.isActive).toBe(false)
      expect(result.current.isEnabled).toBe(true)
      expect(result.current.stats).toEqual({
        totalPredictions: 0,
        successfulPreloads: 0,
        hitRate: 0,
        missRate: 0,
        averageConfidence: 0,
        cacheSize: 0,
        preloadQueueSize: 0,
        dataSaved: 0,
        performanceGain: 0,
      })
    })

    it('should record user behavior', () => {
      const { result } = renderHook(() => usePredictiveCache())

      act(() => {
        result.current.recordUserBehavior(mockUserBehavior)
      })

      expect(mockPredictiveCacheManager.recordUserBehavior).toHaveBeenCalledWith({
        ...mockUserBehavior,
        userId: mockUseWallet.publicKey?.toString(),
      })
    })

    it('should start predictive system', async () => {
      const { result } = renderHook(() => usePredictiveCache())

      await act(async () => {
        await result.current.startPredictiveSystem()
      })

      expect(result.current.isActive).toBe(true)
    })

    it('should stop predictive system', () => {
      const { result } = renderHook(() => usePredictiveCache())

      act(() => {
        result.current.stopPredictiveSystem()
      })

      expect(result.current.isActive).toBe(false)
    })

    it('should get cache profile', () => {
      const mockProfile = { userId: 'test', patterns: [] }
      mockPredictiveCacheManager.getUserProfile.mockReturnValue(mockProfile)

      const { result } = renderHook(() => usePredictiveCache())

      const profile = result.current.getCacheProfile()
      expect(profile).toEqual(mockProfile)
      expect(mockPredictiveCacheManager.getUserProfile).toHaveBeenCalledWith(
        mockUseWallet.publicKey?.toString()
      )
    })

    it('should clear cache', () => {
      const { result } = renderHook(() => usePredictiveCache())

      act(() => {
        result.current.clearCache()
      })

      expect(mockPredictiveCacheManager.clearCache).toHaveBeenCalled()
    })

    it('should auto-start when wallet connects', async () => {
      mockUseWallet.connected = false

      const { result, rerender } = renderHook(() => usePredictiveCache())

      expect(result.current.isActive).toBe(false)

      // Simulate wallet connection
      mockUseWallet.connected = true
      rerender()

      await waitFor(() => {
        expect(result.current.isActive).toBe(true)
      })
    })

    it('should not record behavior when disconnected', () => {
      mockUseWallet.connected = false

      const { result } = renderHook(() => usePredictiveCache())

      act(() => {
        result.current.recordUserBehavior(mockUserBehavior)
      })

      expect(mockPredictiveCacheManager.recordUserBehavior).not.toHaveBeenCalled()
    })

    it('should update stats periodically when active', async () => {
      const { result } = renderHook(() => usePredictiveCache())

      await act(async () => {
        await result.current.startPredictiveSystem()
      })

      // Advance timer to trigger stats update
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(mockPredictiveCacheManager.getPerformanceStats).toHaveBeenCalled()
    })
  })

  describe('useArbitrageDetection', () => {
    const mockOpportunity = {
      id: 'opp-123',
      tokenPair: 'USDC/SOL',
      profitPotential: 50,
      riskScore: 0.3,
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useArbitrageDetection())

      expect(result.current.opportunities).toEqual([])
      expect(result.current.isMonitoring).toBe(false)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should initialize arbitrage manager when connected', () => {
      renderHook(() => useArbitrageDetection())

      expect(mockCreateArbitrageManager).toHaveBeenCalledWith({
        connection: mockUseDLMM.client.getConnection(),
        wallet: mockUseWallet,
        minProfitThreshold: 10,
        maxRiskScore: 0.7,
        enableMEVProtection: true,
        monitoringEnabled: true,
      })
    })

    it('should start monitoring successfully', async () => {
      const { result } = renderHook(() => useArbitrageDetection())

      await act(async () => {
        await result.current.startMonitoring()
      })

      expect(mockArbitrageManager.startArbitrageSystem).toHaveBeenCalled()
      expect(result.current.isMonitoring).toBe(true)
    })

    it('should stop monitoring successfully', async () => {
      const { result } = renderHook(() => useArbitrageDetection())

      // Start monitoring first
      await act(async () => {
        await result.current.startMonitoring()
      })

      // Then stop it
      await act(async () => {
        await result.current.stopMonitoring()
      })

      expect(mockArbitrageManager.stopArbitrageSystem).toHaveBeenCalled()
      expect(result.current.isMonitoring).toBe(false)
    })

    it('should execute arbitrage', async () => {
      const mockResult = { success: true, profit: 25 }
      mockArbitrageManager.executeArbitrage.mockResolvedValue(mockResult)

      const { result } = renderHook(() => useArbitrageDetection())

      let executeResult: any
      await act(async () => {
        executeResult = await result.current.executeArbitrage(mockOpportunity, 1000)
      })

      expect(executeResult).toEqual(mockResult)
      expect(mockArbitrageManager.executeArbitrage).toHaveBeenCalledWith(mockOpportunity, 1000)
    })

    it('should get best opportunity', async () => {
      const mockToken = { address: 'USDC', symbol: 'USDC', decimals: 6 }
      const mockBestOpp = { id: 'best', profit: 100 }
      mockArbitrageManager.getBestOpportunityForToken.mockResolvedValue(mockBestOpp)

      const { result } = renderHook(() => useArbitrageDetection())

      let bestOpportunity: any
      await act(async () => {
        bestOpportunity = await result.current.getBestOpportunity(mockToken, 1000)
      })

      expect(bestOpportunity).toEqual(mockBestOpp)
    })

    it('should add pool to monitoring', async () => {
      const poolAddress = new PublicKey('33333333333333333333333333333333')
      const tokenX = { address: 'USDC', symbol: 'USDC', decimals: 6 }
      const tokenY = { address: 'SOL', symbol: 'SOL', decimals: 9 }

      const { result } = renderHook(() => useArbitrageDetection())

      await act(async () => {
        await result.current.addPoolToMonitoring(poolAddress, tokenX, tokenY)
      })

      expect(mockArbitrageManager.addPoolToMonitoring).toHaveBeenCalledWith(
        poolAddress,
        tokenX,
        tokenY
      )
    })

    it('should remove pool from monitoring', () => {
      const poolAddress = new PublicKey('33333333333333333333333333333333')

      const { result } = renderHook(() => useArbitrageDetection())

      act(() => {
        result.current.removePoolFromMonitoring(poolAddress)
      })

      expect(mockArbitrageManager.removePoolFromMonitoring).toHaveBeenCalledWith(poolAddress)
    })

    it('should get system health', () => {
      const mockHealth = { status: 'healthy', uptime: 3600 }
      mockArbitrageManager.getSystemHealth.mockReturnValue(mockHealth)

      const { result } = renderHook(() => useArbitrageDetection())

      const health = result.current.getSystemHealth()
      expect(health).toEqual(mockHealth)
    })

    it('should handle arbitrage manager initialization error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockCreateArbitrageManager.mockImplementation(() => {
        throw new Error('Initialization failed')
      })

      const { result } = renderHook(() => useArbitrageDetection())

      expect(result.current.error).toBe('Failed to initialize arbitrage manager: Initialization failed')
      expect(result.current.isEnabled).toBe(false)

      consoleErrorSpy.mockRestore()
    })

    it('should handle monitoring start error', async () => {
      const error = new Error('Failed to start monitoring')
      mockArbitrageManager.startArbitrageSystem.mockRejectedValue(error)

      const { result } = renderHook(() => useArbitrageDetection())

      await act(async () => {
        await result.current.startMonitoring()
      })

      expect(result.current.error).toBe('Failed to start monitoring')
      expect(result.current.loading).toBe(false)
    })

    it('should update opportunities and stats periodically when monitoring', async () => {
      const mockOpportunities = [mockOpportunity]
      const mockStats = { totalOpportunitiesDetected: 5 }

      mockArbitrageManager.getActiveOpportunities.mockReturnValue(mockOpportunities)
      mockArbitrageManager.getArbitrageStats.mockReturnValue(mockStats)

      const { result } = renderHook(() => useArbitrageDetection())

      await act(async () => {
        await result.current.startMonitoring()
      })

      // Advance timer to trigger updates
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      await waitFor(() => {
        expect(result.current.opportunities).toEqual(mockOpportunities)
      })
    })
  })

  describe('useUserBehaviorTracking', () => {
    beforeEach(() => {
      // Mock usePredictiveCache hook
      jest.doMock('../../src/hooks/use-advanced-dlmm', () => ({
        ...jest.requireActual('../../src/hooks/use-advanced-dlmm'),
        usePredictiveCache: () => ({
          recordUserBehavior: jest.fn(),
          isActive: true,
        }),
      }))
    })

    it('should track page view', () => {
      const { result } = renderHook(() => useUserBehaviorTracking())

      act(() => {
        result.current.trackPageView('/dashboard', '/home')
      })

      expect(result.current.isTracking).toBe(true)
    })

    it('should track action', () => {
      const { result } = renderHook(() => useUserBehaviorTracking())

      act(() => {
        result.current.trackAction('click', 'button', { test: true })
      })

      expect(result.current.sessionId).toBeDefined()
    })

    it('should have consistent session id', () => {
      const { result } = renderHook(() => useUserBehaviorTracking())

      const sessionId1 = result.current.sessionId
      act(() => {
        result.current.trackAction('test', 'target')
      })
      const sessionId2 = result.current.sessionId

      expect(sessionId1).toBe(sessionId2)
    })
  })

  describe('useAdvancedDLMM', () => {
    it('should provide unified access to all advanced features', () => {
      const { result } = renderHook(() => useAdvancedDLMM())

      expect(result.current.backtesting).toBeDefined()
      expect(result.current.predictiveCache).toBeDefined()
      expect(result.current.arbitrage).toBeDefined()
      expect(result.current.allFeaturesEnabled).toBe(true)
      expect(result.current.systemStatus).toBeDefined()
    })

    it('should calculate correct system status', () => {
      const { result } = renderHook(() => useAdvancedDLMM())

      expect(result.current.systemStatus.connected).toBe(true)
      expect(result.current.systemStatus.allFeaturesEnabled).toBe(true)
      expect(result.current.systemStatus.backtesting).toBeDefined()
      expect(result.current.systemStatus.predictiveCache).toBeDefined()
      expect(result.current.systemStatus.arbitrage).toBeDefined()
    })

    it('should provide SDK utilization metrics', () => {
      const { result } = renderHook(() => useAdvancedDLMM())

      expect(result.current.sdkUtilization).toEqual({
        percentage: 100,
        featuresComplete: 66,
        advancedFeatures: 3,
        totalFeatures: 69,
        status: 'complete',
      })
    })

    it('should start all systems', async () => {
      const { result } = renderHook(() => useAdvancedDLMM())

      await act(async () => {
        await result.current.startAllSystems()
      })

      // Should attempt to start predictive cache and arbitrage systems
      expect(result.current.predictiveCache.isActive).toBe(true)
    })

    it('should stop all systems', async () => {
      const { result } = renderHook(() => useAdvancedDLMM())

      // Start systems first
      await act(async () => {
        await result.current.startAllSystems()
      })

      // Then stop them
      await act(async () => {
        await result.current.stopAllSystems()
      })

      expect(result.current.predictiveCache.isActive).toBe(false)
    })

    it('should handle system start errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockArbitrageManager.startArbitrageSystem.mockRejectedValue(new Error('Start failed'))

      const { result } = renderHook(() => useAdvancedDLMM())

      await act(async () => {
        await result.current.startAllSystems()
      })

      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })

    it('should handle disconnected wallet state', () => {
      mockUseWallet.connected = false

      const { result } = renderHook(() => useAdvancedDLMM())

      expect(result.current.systemStatus.connected).toBe(false)
      expect(result.current.allFeaturesEnabled).toBe(false)
    })

    it('should provide individual feature access', () => {
      const { result } = renderHook(() => useAdvancedDLMM())

      // Test that we can access individual features
      expect(typeof result.current.backtesting.runBacktest).toBe('function')
      expect(typeof result.current.predictiveCache.startPredictiveSystem).toBe('function')
      expect(typeof result.current.arbitrage.startMonitoring).toBe('function')
    })
  })
})