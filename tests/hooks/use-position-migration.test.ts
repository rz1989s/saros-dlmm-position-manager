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
        address: new PublicKey('BTC0000000000000000000000000000000'),
        symbol: 'BTC',
        name: 'Bitcoin',
        decimals: 8,
        price: 50000.0
      },
      activeBin: 200,
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

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()

    // Reset wallet connection state
    mockUseWallet.connected = true

    // Setup default mock returns
    mockPositionMigrationManager.getCacheStats.mockReturnValue({
      count: 60,
      keys: ['migration-key-1', 'migration-key-2', 'migration-key-3']
    })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('useMigrationOpportunities', () => {
    const mockOpportunities = [
      {
        fromPosition: mockPositions[0],
        targetPool: new PublicKey('44444444444444444444444444444444'),
        targetPair: 'USDC/SOL',
        improvementMetrics: {
          feeImprovement: 1.5,
          aprImprovement: 2.5,
          liquidityImprovement: 15.0,
          volumeImprovement: 10.0,
        },
        migrationCost: 15.0,
        projectedBenefit: 250.5,
        recommendation: 'highly_recommended' as const,
      },
      {
        fromPosition: mockPositions[1],
        targetPool: new PublicKey('55555555555555555555555555555555'),
        targetPair: 'USDC/BTC',
        improvementMetrics: {
          feeImprovement: 0.8,
          aprImprovement: 1.2,
          liquidityImprovement: 5.0,
          volumeImprovement: 3.0,
        },
        migrationCost: 25.0,
        projectedBenefit: 100.0,
        recommendation: 'recommended' as const,
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
      mockUseWallet.publicKey = new PublicKey('11111111111111111111111111111111')

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
        fromPosition: mockPositions[0],
        targetPool: new PublicKey('44444444444444444444444444444444'),
        targetPair: 'USDC/SOL',
        improvementMetrics: {
          feeImprovement: 1.5,
          aprImprovement: 2.5,
          liquidityImprovement: 15.0,
          volumeImprovement: 10.0,
        },
        migrationCost: 15.0,
        projectedBenefit: 250.5,
        recommendation: 'highly_recommended' as const,
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
      name: 'USDC/SOL Migration Plan',
      description: 'Migrate position to better pool',
      positions: [mockPositions[0]],
      routes: [
        {
          id: 'route-1',
          fromPool: mockPositions[0].poolAddress,
          toPool: new PublicKey('44444444444444444444444444444444'),
          fromPair: 'USDC/SOL',
          toPair: 'USDC/SOL',
          migrationReason: 'better_fees' as const,
          estimatedCost: 15.0,
          estimatedBenefit: 250.5,
          timeToBreakeven: 30,
          confidence: 0.95
        },
      ],
      totalCost: 15.0,
      totalBenefit: 250.5,
      estimatedDuration: 5.5,
      riskLevel: 'low' as const,
      steps: [
        {
          id: '1',
          order: 1,
          type: 'remove_liquidity' as const,
          description: 'Remove liquidity from source pool',
          poolAddress: mockPositions[0].poolAddress,
          estimatedGas: 0.005,
          estimatedTime: 30,
          dependencies: []
        },
        {
          id: '2',
          order: 2,
          type: 'add_liquidity' as const,
          description: 'Add liquidity to target pool',
          poolAddress: new PublicKey('44444444444444444444444444444444'),
          estimatedGas: 0.005,
          estimatedTime: 30,
          dependencies: ['1']
        },
      ],
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
      mockUseWallet.publicKey = new PublicKey('11111111111111111111111111111111')

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
        () => new Promise(resolve => setTimeout(() => resolve({
          id: 'plan-123',
          name: 'Test Plan',
          description: 'Test migration plan',
          positions: [],
          routes: [],
          totalCost: 10.0,
          totalBenefit: 50.0,
          estimatedDuration: 5.5,
          riskLevel: 'low' as const,
          steps: []
        }), 100))
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
      name: 'Test Migration Plan',
      description: 'Test migration for execution',
      positions: [mockPositions[0]],
      routes: [],
      totalCost: 10.0,
      totalBenefit: 50.0,
      estimatedDuration: 5.5,
      riskLevel: 'low' as const,
      steps: [
        {
          id: '1',
          order: 1,
          type: 'remove_liquidity' as const,
          description: 'Remove liquidity',
          poolAddress: mockPositions[0].poolAddress,
          estimatedGas: 0.003,
          estimatedTime: 30,
          dependencies: []
        },
        {
          id: '2',
          order: 2,
          type: 'swap_tokens' as const,
          description: 'Swap tokens',
          poolAddress: mockPositions[0].poolAddress,
          estimatedGas: 0.003,
          estimatedTime: 30,
          dependencies: ['1']
        },
        {
          id: '3',
          order: 3,
          type: 'add_liquidity' as const,
          description: 'Add liquidity',
          poolAddress: mockPositions[0].poolAddress,
          estimatedGas: 0.003,
          estimatedTime: 30,
          dependencies: ['2']
        },
      ],
    }

    const mockProgress = {
      planId: 'plan-123',
      status: 'completed' as const,
      currentStep: 3,
      totalSteps: 3,
      completedSteps: ['1', '2', '3'],
      failedSteps: [],
      rolledBackSteps: [],
      startTime: new Date(),
      endTime: new Date(),
      errors: [] as Array<{ stepId: string; error: string; timestamp: Date }>,
      safetyChecks: {
        preExecutionValidation: true,
        postExecutionValidation: true,
        rollbackCapability: true,
        atomicityEnsured: true,
      },
      transactionHashes: [],
      totalGasUsed: 0,
      estimatedGasRemaining: 0,
    }

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useMigrationExecution())

      expect(result.current.progress).toBeNull()
      expect(result.current.isExecuting).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should execute migration plan successfully', async () => {
      mockPositionMigrationManager.executeMigrationPlan.mockImplementation(
        (plan: any, _userAddress: PublicKey, onProgress?: (progress: any) => void) => {
          // Simulate progress updates
          onProgress?.({
            planId: plan.id,
            status: 'in_progress',
            currentStep: 1,
            totalSteps: 3,
            completedSteps: ['1'],
            failedSteps: [],
            startTime: new Date(),
            errors: [] as Array<{ stepId: string; error: string; timestamp: Date }> as Array<{ stepId: string; error: string; timestamp: Date }>
          })
          onProgress?.({
            planId: plan.id,
            status: 'in_progress',
            currentStep: 2,
            totalSteps: 3,
            completedSteps: ['1', '2'],
            failedSteps: [],
            startTime: new Date(),
            errors: [] as Array<{ stepId: string; error: string; timestamp: Date }> as Array<{ stepId: string; error: string; timestamp: Date }>
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
      mockUseWallet.publicKey = new PublicKey('11111111111111111111111111111111')

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
        (_plan: any, _userAddress: PublicKey, _onProgress?: (progress: any) => void) => new Promise(resolve => setTimeout(() => resolve({
          planId: 'plan-123',
          status: 'completed' as const,
          currentStep: 3,
          totalSteps: 3,
          completedSteps: ['1', '2', '3'],
          failedSteps: [],
          rolledBackSteps: [],
          startTime: new Date(),
          endTime: new Date(),
          errors: [] as Array<{ stepId: string; error: string; timestamp: Date }>,
          safetyChecks: {
            preExecutionValidation: true,
            postExecutionValidation: true,
            rollbackCapability: true,
            atomicityEnsured: true,
          },
          transactionHashes: [],
          totalGasUsed: 0,
          estimatedGasRemaining: 0,
        }), 100))
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
        fromPosition: mockPositions[0],
        targetPool: new PublicKey('44444444444444444444444444444444'),
        targetPair: 'USDC/SOL',
        improvementMetrics: {
          feeImprovement: 1.5,
          aprImprovement: 2.5,
          liquidityImprovement: 15.0,
          volumeImprovement: 10.0,
        },
        migrationCost: 15.0,
        projectedBenefit: 250.5,
        recommendation: 'highly_recommended' as const,
      },
      {
        fromPosition: mockPositions[1],
        targetPool: new PublicKey('55555555555555555555555555555555'),
        targetPair: 'USDC/BTC',
        improvementMetrics: {
          feeImprovement: 0.8,
          aprImprovement: 1.2,
          liquidityImprovement: 5.0,
          volumeImprovement: 3.0,
        },
        migrationCost: 25.0,
        projectedBenefit: 100.0,
        recommendation: 'recommended' as const,
      },
      {
        fromPosition: mockPositions[0],
        targetPool: new PublicKey('66666666666666666666666666666666'),
        targetPair: 'USDC/ETH',
        improvementMetrics: {
          feeImprovement: 0.3,
          aprImprovement: 0.8,
          liquidityImprovement: 2.0,
          volumeImprovement: 1.0,
        },
        migrationCost: 30.0,
        projectedBenefit: 50.0,
        recommendation: 'neutral' as const,
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
      count: 60,
      keys: ['migration-key-1', 'migration-key-2', 'migration-key-3']
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
        fromPosition: mockPositions[0],
        targetPool: new PublicKey('44444444444444444444444444444444'),
        targetPair: 'USDC/SOL',
        improvementMetrics: {
          feeImprovement: 1.5,
          aprImprovement: 2.5,
          liquidityImprovement: 15.0,
          volumeImprovement: 10.0,
        },
        migrationCost: 15.0,
        projectedBenefit: 250.5,
        recommendation: 'highly_recommended' as const,
      },
      {
        fromPosition: mockPositions[1],
        targetPool: new PublicKey('55555555555555555555555555555555'),
        targetPair: 'USDC/BTC',
        improvementMetrics: {
          feeImprovement: 0.8,
          aprImprovement: 1.5,
          liquidityImprovement: 8.0,
          volumeImprovement: 5.0,
        },
        migrationCost: 20.0,
        projectedBenefit: 150.0,
        recommendation: 'recommended' as const,
      },
    ]

    const mockMigrationPlan = {
      id: 'plan-123',
      name: 'Comprehensive Migration Plan',
      description: 'Full migration plan',
      positions: mockPositions,
      routes: [],
      totalCost: 35.0,
      totalBenefit: 400.5,
      estimatedDuration: 5.5,
      riskLevel: 'low' as const,
      steps: [],
    }

    const mockProgress = {
      planId: 'plan-123',
      status: 'completed' as const,
      currentStep: 3,
      totalSteps: 3,
      completedSteps: ['1', '2', '3'],
      failedSteps: [],
      rolledBackSteps: [],
      startTime: new Date(),
      endTime: new Date(),
      errors: [] as Array<{ stepId: string; error: string; timestamp: Date }>,
      safetyChecks: {
        preExecutionValidation: true,
        postExecutionValidation: true,
        rollbackCapability: true,
        atomicityEnsured: true,
      },
      transactionHashes: [],
      totalGasUsed: 0,
      estimatedGasRemaining: 0,
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
          fromPosition: mockPositions[0],
          targetPool: new PublicKey('44444444444444444444444444444444'),
          targetPair: 'USDC/SOL',
          improvementMetrics: {
            feeImprovement: 2.0,
            aprImprovement: 3.0,
            liquidityImprovement: 20.0,
            volumeImprovement: 15.0,
          },
          migrationCost: 10.0,
          projectedBenefit: 150.0, // Above 100 threshold
          recommendation: 'highly_recommended' as const,
        },
        {
          fromPosition: mockPositions[1],
          targetPool: new PublicKey('55555555555555555555555555555555'),
          targetPair: 'USDC/BTC',
          improvementMetrics: {
            feeImprovement: 1.0,
            aprImprovement: 1.5,
            liquidityImprovement: 5.0,
            volumeImprovement: 3.0,
          },
          migrationCost: 15.0,
          projectedBenefit: 50.0, // Below threshold but highly recommended
          recommendation: 'recommended' as const,
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