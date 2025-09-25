import { renderHook, act, waitFor } from '@testing-library/react'
import { PublicKey } from '@solana/web3.js'
import {
  useMigrationOpportunities,
  useMigrationPlan,
  useMigrationExecution,
  useMigrationInsights,
  useMigrationCache,
  useComprehensiveMigration
} from '../../src/hooks/use-position-migration'

// Mock the wallet adapter
const mockUseWallet = {
  publicKey: new PublicKey('11111111111111111111111111111112'),
  connected: true,
}

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockUseWallet,
}))

// Mock the position migration manager
jest.mock('../../src/lib/dlmm/position-migration', () => ({
  positionMigrationManager: {
    analyzeMigrationOpportunities: jest.fn(),
    createMigrationPlan: jest.fn(),
    executeMigrationPlan: jest.fn(),
    getCacheStats: jest.fn(),
    clearCache: jest.fn(),
  },
}))

// Get the mocked manager for type checking
import { positionMigrationManager } from '../../src/lib/dlmm/position-migration'
const mockPositionMigrationManager = positionMigrationManager as jest.Mocked<typeof positionMigrationManager>

describe('Position Migration Hooks', () => {
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
      tokenY: { address: 'BTC', symbol: 'BTC', decimals: 8 },
      liquidityAmount: '2000',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()

    // Reset wallet connection state
    mockUseWallet.connected = true

    // Setup default mock returns
    mockPositionMigrationManager.getCacheStats.mockReturnValue({
      hitRate: 88.5,
      missRate: 11.5,
      totalRequests: 150,
      cacheSize: 60,
      lastClear: new Date(),
    })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('useMigrationOpportunities', () => {
    const mockOpportunities = [
      {
        id: 'opp-1',
        sourcePosition: mockPositions[0],
        targetPool: new PublicKey('44444444444444444444444444444444'),
        recommendation: 'highly_recommended',
        projectedBenefit: 250.5,
        migrationCost: 15.0,
        improvementMetrics: {
          aprImprovement: 2.5,
          liquidityImprovement: 15.0,
          riskReduction: 10.0,
        },
      },
      {
        id: 'opp-2',
        sourcePosition: mockPositions[1],
        targetPool: new PublicKey('55555555555555555555555555555555'),
        recommendation: 'recommended',
        projectedBenefit: 100.0,
        migrationCost: 25.0,
        improvementMetrics: {
          aprImprovement: 1.2,
          liquidityImprovement: 5.0,
          riskReduction: 2.0,
        },
      },
    ]

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useMigrationOpportunities([], false))

      expect(result.current.opportunities).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.lastUpdate).toBeNull()
    })

    it('should analyze migration opportunities successfully', async () => {
      mockPositionMigrationManager.analyzeMigrationOpportunities.mockResolvedValue(mockOpportunities)

      const { result } = renderHook(() => useMigrationOpportunities(mockPositions, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.opportunities).toEqual(mockOpportunities)
      expect(result.current.lastUpdate).toBeDefined()
      expect(mockPositionMigrationManager.analyzeMigrationOpportunities).toHaveBeenCalledWith(
        mockPositions,
        mockUseWallet.publicKey
      )
    })

    it('should handle empty positions array', async () => {
      const { result } = renderHook(() => useMigrationOpportunities([], false))

      await waitFor(() => {
        expect(result.current.opportunities).toEqual([])
      })

      expect(mockPositionMigrationManager.analyzeMigrationOpportunities).not.toHaveBeenCalled()
    })

    it('should handle disconnected wallet', async () => {
      mockUseWallet.connected = false
      mockUseWallet.publicKey = null

      const { result } = renderHook(() => useMigrationOpportunities(mockPositions, false))

      await waitFor(() => {
        expect(result.current.opportunities).toEqual([])
      })

      expect(mockPositionMigrationManager.analyzeMigrationOpportunities).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPositionMigrationManager.analyzeMigrationOpportunities.mockRejectedValue(
        new Error('Analysis failed')
      )

      const { result } = renderHook(() => useMigrationOpportunities(mockPositions, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Analysis failed')
        expect(result.current.opportunities).toEqual([])
      })

      consoleErrorSpy.mockRestore()
    })

    it('should refresh opportunities manually', async () => {
      mockPositionMigrationManager.analyzeMigrationOpportunities.mockResolvedValue(mockOpportunities)

      const { result } = renderHook(() => useMigrationOpportunities(mockPositions, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshOpportunities()
      })

      expect(mockPositionMigrationManager.analyzeMigrationOpportunities).toHaveBeenCalledTimes(2)
    })

    it('should set up real-time polling when enabled', async () => {
      mockPositionMigrationManager.analyzeMigrationOpportunities.mockResolvedValue(mockOpportunities)

      renderHook(() => useMigrationOpportunities(mockPositions, true))

      await waitFor(() => {
        expect(mockPositionMigrationManager.analyzeMigrationOpportunities).toHaveBeenCalledTimes(1)
      })

      // Fast forward to trigger polling (5 minutes = 300000ms)
      act(() => {
        jest.advanceTimersByTime(300000)
      })

      await waitFor(() => {
        expect(mockPositionMigrationManager.analyzeMigrationOpportunities).toHaveBeenCalledTimes(2)
      })
    })

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() => useMigrationOpportunities(mockPositions, true))

      unmount()

      act(() => {
        jest.advanceTimersByTime(300000)
      })

      expect(mockPositionMigrationManager.analyzeMigrationOpportunities).toHaveBeenCalledTimes(1)
    })

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPositionMigrationManager.analyzeMigrationOpportunities.mockRejectedValue('String error')

      const { result } = renderHook(() => useMigrationOpportunities(mockPositions, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to analyze migration opportunities')
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('useMigrationPlan', () => {
    const mockOpportunities = [
      {
        id: 'opp-1',
        sourcePosition: mockPositions[0],
        targetPool: new PublicKey('44444444444444444444444444444444'),
        recommendation: 'highly_recommended',
        projectedBenefit: 250.5,
        migrationCost: 15.0,
      },
    ]

    const mockPreferences = {
      riskTolerance: 'moderate' as const,
      maxGasCost: 100,
      prioritizeSpeed: false,
      consolidatePositions: true,
    }

    const mockMigrationPlan = {
      id: 'plan-123',
      routes: [
        {
          from: mockPositions[0].poolAddress,
          to: new PublicKey('44444444444444444444444444444444'),
          steps: ['withdraw', 'swap', 'deposit'],
        },
      ],
      steps: [
        { id: '1', action: 'withdraw', status: 'pending' },
        { id: '2', action: 'swap', status: 'pending' },
        { id: '3', action: 'deposit', status: 'pending' },
      ],
      estimatedDuration: 5.5,
      totalCost: 15.0,
      expectedBenefit: 250.5,
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useMigrationPlan())

      expect(result.current.plan).toBeNull()
      expect(result.current.creating).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should create migration plan successfully', async () => {
      mockPositionMigrationManager.createMigrationPlan.mockResolvedValue(mockMigrationPlan)

      const { result } = renderHook(() => useMigrationPlan())

      let createdPlan: any
      await act(async () => {
        createdPlan = await result.current.createPlan(mockOpportunities, mockPreferences)
      })

      expect(createdPlan).toEqual(mockMigrationPlan)
      expect(result.current.plan).toEqual(mockMigrationPlan)
      expect(mockPositionMigrationManager.createMigrationPlan).toHaveBeenCalledWith(
        mockOpportunities,
        mockUseWallet.publicKey,
        mockPreferences
      )
    })

    it('should handle disconnected wallet', async () => {
      mockUseWallet.connected = false
      mockUseWallet.publicKey = null

      const { result } = renderHook(() => useMigrationPlan())

      await act(async () => {
        try {
          await result.current.createPlan(mockOpportunities, mockPreferences)
        } catch (error) {
          expect((error as Error).message).toBe('Wallet not connected')
        }
      })
    })

    it('should handle plan creation errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPositionMigrationManager.createMigrationPlan.mockRejectedValue(new Error('Plan creation failed'))

      const { result } = renderHook(() => useMigrationPlan())

      await act(async () => {
        try {
          await result.current.createPlan(mockOpportunities, mockPreferences)
        } catch (error) {
          expect((error as Error).message).toBe('Plan creation failed')
        }
      })

      expect(result.current.error).toBe('Plan creation failed')
      consoleErrorSpy.mockRestore()
    })

    it('should clear plan', () => {
      mockPositionMigrationManager.createMigrationPlan.mockResolvedValue(mockMigrationPlan)

      const { result } = renderHook(() => useMigrationPlan())

      act(() => {
        result.current.clearPlan()
      })

      expect(result.current.plan).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should handle loading state during creation', async () => {
      mockPositionMigrationManager.createMigrationPlan.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockMigrationPlan), 100))
      )

      const { result } = renderHook(() => useMigrationPlan())

      const createPromise = act(async () => {
        result.current.createPlan(mockOpportunities, mockPreferences)
      })

      expect(result.current.creating).toBe(true)

      await createPromise
      expect(result.current.creating).toBe(false)
    })

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPositionMigrationManager.createMigrationPlan.mockRejectedValue('String error')

      const { result } = renderHook(() => useMigrationPlan())

      await act(async () => {
        try {
          await result.current.createPlan(mockOpportunities, mockPreferences)
        } catch (error) {
          // Expected
        }
      })

      expect(result.current.error).toBe('Failed to create migration plan')
      consoleErrorSpy.mockRestore()
    })
  })

  describe('useMigrationExecution', () => {
    const mockMigrationPlan = {
      id: 'plan-123',
      routes: [],
      steps: [
        { id: '1', action: 'withdraw', status: 'pending' },
        { id: '2', action: 'swap', status: 'pending' },
        { id: '3', action: 'deposit', status: 'pending' },
      ],
      estimatedDuration: 5.5,
    }

    const mockProgress = {
      id: 'progress-123',
      planId: 'plan-123',
      status: 'completed',
      currentStep: 3,
      totalSteps: 3,
      completedSteps: ['1', '2', '3'],
      failedSteps: [],
      startTime: new Date(),
      endTime: new Date(),
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useMigrationExecution())

      expect(result.current.progress).toBeNull()
      expect(result.current.isExecuting).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should execute migration plan successfully', async () => {
      const mockProgressCallback = jest.fn()
      mockPositionMigrationManager.executeMigrationPlan.mockImplementation(
        (plan, publicKey, progressCallback) => {
          // Simulate progress updates
          progressCallback({
            id: 'progress-123',
            planId: plan.id,
            status: 'running',
            currentStep: 1,
            totalSteps: 3,
          })
          progressCallback({
            id: 'progress-123',
            planId: plan.id,
            status: 'running',
            currentStep: 2,
            totalSteps: 3,
          })
          return Promise.resolve(mockProgress)
        }
      )

      const { result } = renderHook(() => useMigrationExecution())

      let executionResult: any
      await act(async () => {
        executionResult = await result.current.executePlan(mockMigrationPlan)
      })

      expect(executionResult).toEqual(mockProgress)
      expect(result.current.progress).toEqual(mockProgress)
      expect(mockPositionMigrationManager.executeMigrationPlan).toHaveBeenCalledWith(
        mockMigrationPlan,
        mockUseWallet.publicKey,
        expect.any(Function)
      )
    })

    it('should handle disconnected wallet', async () => {
      mockUseWallet.connected = false
      mockUseWallet.publicKey = null

      const { result } = renderHook(() => useMigrationExecution())

      await act(async () => {
        try {
          await result.current.executePlan(mockMigrationPlan)
        } catch (error) {
          expect((error as Error).message).toBe('Wallet not connected')
        }
      })
    })

    it('should handle execution errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPositionMigrationManager.executeMigrationPlan.mockRejectedValue(new Error('Execution failed'))

      const { result } = renderHook(() => useMigrationExecution())

      await act(async () => {
        try {
          await result.current.executePlan(mockMigrationPlan)
        } catch (error) {
          expect((error as Error).message).toBe('Execution failed')
        }
      })

      expect(result.current.error).toBe('Execution failed')
      consoleErrorSpy.mockRestore()
    })

    it('should reset execution state', () => {
      const { result } = renderHook(() => useMigrationExecution())

      act(() => {
        result.current.resetExecution()
      })

      expect(result.current.progress).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.isExecuting).toBe(false)
    })

    it('should handle loading state during execution', async () => {
      mockPositionMigrationManager.executeMigrationPlan.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockProgress), 100))
      )

      const { result } = renderHook(() => useMigrationExecution())

      const executePromise = act(async () => {
        result.current.executePlan(mockMigrationPlan)
      })

      expect(result.current.isExecuting).toBe(true)

      await executePromise
      expect(result.current.isExecuting).toBe(false)
    })

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPositionMigrationManager.executeMigrationPlan.mockRejectedValue('String error')

      const { result } = renderHook(() => useMigrationExecution())

      await act(async () => {
        try {
          await result.current.executePlan(mockMigrationPlan)
        } catch (error) {
          // Expected
        }
      })

      expect(result.current.error).toBe('Migration execution failed')
      consoleErrorSpy.mockRestore()
    })
  })

  describe('useMigrationInsights', () => {
    const mockOpportunities = [
      {
        id: 'opp-1',
        recommendation: 'highly_recommended',
        projectedBenefit: 250.5,
        migrationCost: 15.0,
        improvementMetrics: { aprImprovement: 2.5 },
      },
      {
        id: 'opp-2',
        recommendation: 'recommended',
        projectedBenefit: 100.0,
        migrationCost: 25.0,
        improvementMetrics: { aprImprovement: 1.2 },
      },
      {
        id: 'opp-3',
        recommendation: 'neutral',
        projectedBenefit: 50.0,
        migrationCost: 30.0,
        improvementMetrics: { aprImprovement: 0.8 },
      },
    ]

    it('should calculate insights correctly', () => {
      const { result } = renderHook(() => useMigrationInsights(mockOpportunities))

      expect(result.current.totalOpportunities).toBe(3)
      expect(result.current.highlyRecommended).toBe(1)
      expect(result.current.recommended).toBe(1)
      expect(result.current.neutral).toBe(1)
      expect(result.current.totalPotentialBenefit).toBe(400.5)
      expect(result.current.totalMigrationCost).toBe(70.0)
      expect(result.current.averageAprImprovement).toBeCloseTo(1.5)
      expect(result.current.bestOpportunity).toEqual(mockOpportunities[0])
    })

    it('should handle empty opportunities array', () => {
      const { result } = renderHook(() => useMigrationInsights([]))

      expect(result.current.totalOpportunities).toBe(0)
      expect(result.current.highlyRecommended).toBe(0)
      expect(result.current.recommended).toBe(0)
      expect(result.current.neutral).toBe(0)
      expect(result.current.totalPotentialBenefit).toBe(0)
      expect(result.current.totalMigrationCost).toBe(0)
      expect(result.current.averageAprImprovement).toBe(0)
      expect(result.current.bestOpportunity).toBeNull()
    })

    it('should update insights when opportunities change', () => {
      const { result, rerender } = renderHook(
        ({ opportunities }) => useMigrationInsights(opportunities),
        { initialProps: { opportunities: [mockOpportunities[0]] } }
      )

      expect(result.current.totalOpportunities).toBe(1)

      rerender({ opportunities: mockOpportunities })

      expect(result.current.totalOpportunities).toBe(3)
    })
  })

  describe('useMigrationCache', () => {
    const mockCacheStats = {
      hitRate: 88.5,
      missRate: 11.5,
      totalRequests: 150,
      cacheSize: 60,
      lastClear: new Date(),
    }

    it('should initialize with cache stats', () => {
      mockPositionMigrationManager.getCacheStats.mockReturnValue(mockCacheStats)

      const { result } = renderHook(() => useMigrationCache())

      expect(result.current.cacheStats).toEqual(mockCacheStats)
    })

    it('should refresh cache stats', () => {
      const { result } = renderHook(() => useMigrationCache())

      act(() => {
        result.current.refreshCacheStats()
      })

      expect(mockPositionMigrationManager.getCacheStats).toHaveBeenCalledTimes(2)
    })

    it('should clear cache', () => {
      const { result } = renderHook(() => useMigrationCache())

      act(() => {
        result.current.clearCache()
      })

      expect(mockPositionMigrationManager.clearCache).toHaveBeenCalled()
      expect(mockPositionMigrationManager.getCacheStats).toHaveBeenCalledTimes(2)
    })

    it('should refresh cache stats periodically', () => {
      renderHook(() => useMigrationCache())

      act(() => {
        jest.advanceTimersByTime(30000) // 30 seconds
      })

      expect(mockPositionMigrationManager.getCacheStats).toHaveBeenCalledTimes(2)
    })

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() => useMigrationCache())

      unmount()

      act(() => {
        jest.advanceTimersByTime(30000)
      })

      expect(mockPositionMigrationManager.getCacheStats).toHaveBeenCalledTimes(1)
    })
  })

  describe('useComprehensiveMigration', () => {
    const mockOpportunities = [
      {
        id: 'opp-1',
        recommendation: 'highly_recommended',
        projectedBenefit: 250.5,
        migrationCost: 15.0,
      },
      {
        id: 'opp-2',
        recommendation: 'recommended',
        projectedBenefit: 150.0,
        migrationCost: 20.0,
      },
    ]

    const mockMigrationPlan = {
      id: 'plan-123',
      routes: [],
      steps: [],
      estimatedDuration: 5.5,
    }

    const mockProgress = {
      id: 'progress-123',
      status: 'completed',
      currentStep: 3,
      totalSteps: 3,
    }

    beforeEach(() => {
      mockPositionMigrationManager.analyzeMigrationOpportunities.mockResolvedValue(mockOpportunities)
      mockPositionMigrationManager.createMigrationPlan.mockResolvedValue(mockMigrationPlan)
      mockPositionMigrationManager.executeMigrationPlan.mockResolvedValue(mockProgress)
    })

    it('should combine all migration functionality', async () => {
      const { result } = renderHook(() => useComprehensiveMigration(mockPositions, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.opportunities).toEqual(mockOpportunities)
      expect(result.current.insights).toBeDefined()
      expect(result.current.hasOpportunities).toBe(true)
    })

    it('should execute selected opportunities', async () => {
      const preferences = {
        riskTolerance: 'moderate' as const,
        maxGasCost: 100,
        prioritizeSpeed: false,
        consolidatePositions: true,
      }

      const { result } = renderHook(() => useComprehensiveMigration(mockPositions, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let executionResult: any
      await act(async () => {
        executionResult = await result.current.executeSelectedOpportunities(
          [mockOpportunities[0]],
          preferences
        )
      })

      expect(executionResult).toEqual(mockProgress)
      expect(mockPositionMigrationManager.createMigrationPlan).toHaveBeenCalledWith(
        [mockOpportunities[0]],
        mockUseWallet.publicKey,
        preferences
      )
    })

    it('should handle loading states correctly', () => {
      mockPositionMigrationManager.analyzeMigrationOpportunities.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockOpportunities), 100))
      )

      const { result } = renderHook(() => useComprehensiveMigration(mockPositions, false))

      expect(result.current.loading).toBe(true)
    })

    it('should handle error states correctly', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPositionMigrationManager.analyzeMigrationOpportunities.mockRejectedValue(
        new Error('Analysis error')
      )

      const { result } = renderHook(() => useComprehensiveMigration(mockPositions, false))

      await waitFor(() => {
        expect(result.current.error).toBe('Analysis error')
      })

      consoleErrorSpy.mockRestore()
    })

    it('should indicate high value opportunities correctly', async () => {
      const highValueOpportunities = [
        {
          id: 'high-1',
          recommendation: 'highly_recommended',
          projectedBenefit: 150.0, // Above 100 threshold
        },
        {
          id: 'high-2',
          recommendation: 'recommended',
          projectedBenefit: 50.0, // Below threshold but highly recommended
        },
      ]

      mockPositionMigrationManager.analyzeMigrationOpportunities.mockResolvedValue(
        highValueOpportunities
      )

      const { result } = renderHook(() => useComprehensiveMigration(mockPositions, false))

      await waitFor(() => {
        expect(result.current.hasHighValueOpportunities).toBe(true)
      })
    })

    it('should handle empty positions', async () => {
      const { result } = renderHook(() => useComprehensiveMigration([], false))

      await waitFor(() => {
        expect(result.current.opportunities).toEqual([])
        expect(result.current.hasOpportunities).toBe(false)
      })
    })

    it('should enable real-time updates when specified', async () => {
      renderHook(() => useComprehensiveMigration(mockPositions, true))

      await waitFor(() => {
        expect(mockPositionMigrationManager.analyzeMigrationOpportunities).toHaveBeenCalledTimes(1)
      })

      act(() => {
        jest.advanceTimersByTime(300000) // 5 minutes
      })

      await waitFor(() => {
        expect(mockPositionMigrationManager.analyzeMigrationOpportunities).toHaveBeenCalledTimes(2)
      })
    })

    it('should handle execution errors in executeSelectedOpportunities', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPositionMigrationManager.createMigrationPlan.mockRejectedValue(new Error('Plan failed'))

      const { result } = renderHook(() => useComprehensiveMigration(mockPositions, false))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        try {
          await result.current.executeSelectedOpportunities([mockOpportunities[0]], {
            riskTolerance: 'moderate',
            maxGasCost: 100,
            prioritizeSpeed: false,
            consolidatePositions: true,
          })
        } catch (error) {
          expect((error as Error).message).toBe('Plan failed')
        }
      })

      consoleErrorSpy.mockRestore()
    })
  })
})