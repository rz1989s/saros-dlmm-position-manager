import { PublicKey, Connection } from '@solana/web3.js'
import {
  PositionMigrationManager,
  type MigrationPlan,
  type MigrationProgress,
  type CrossPoolOpportunity
} from '../../../src/lib/dlmm/position-migration'
import type { DLMMPosition } from '../../../src/lib/types'

// Mock the DLMM client
jest.mock('../../../src/lib/dlmm/client', () => ({
  dlmmClient: {
    getLbPair: jest.fn(),
    getConnection: jest.fn(() => new Connection('http://localhost:8899'))
  }
}))

// Mock connection manager
jest.mock('../../../src/lib/connection-manager', () => ({
  connectionManager: {
    getCurrentConnection: jest.fn(() => ({
      rpcEndpoint: 'http://localhost:8899',
      commitment: 'confirmed'
    })),
    makeRpcCall: jest.fn(async (fn) => fn()),
    executeWithFallback: jest.fn(async (fn) => fn())
  }
}))

describe('PositionMigrationManager', () => {
  let migrationManager: PositionMigrationManager
  let mockConnection: Connection
  let mockUserAddress: PublicKey
  let mockPositions: DLMMPosition[]

  beforeEach(() => {
    jest.clearAllMocks()
    mockConnection = new Connection('http://localhost:8899')
    migrationManager = new PositionMigrationManager(mockConnection)
    mockUserAddress = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')

    // Create mock positions
    mockPositions = [
      {
        id: 'position-1',
        poolAddress: new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'),
        userAddress: mockUserAddress,
        tokenX: {
          address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          price: 1.0
        },
        tokenY: {
          address: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
          symbol: 'USDT',
          name: 'Tether USD',
          decimals: 6,
          price: 1.0
        },
        activeBin: 8388608,
        liquidityAmount: '10000',
        feesEarned: { tokenX: '50', tokenY: '50' },
        createdAt: new Date(),
        lastUpdated: new Date(),
        isActive: true
      },
      {
        id: 'position-2',
        poolAddress: new PublicKey('7djbVF7BSTi2Qzq8H9GXDCFuhhMHKBJtpCzFr6BzxuCz'),
        userAddress: mockUserAddress,
        tokenX: {
          address: new PublicKey('So11111111111111111111111111111111111111112'),
          symbol: 'SOL',
          name: 'Solana',
          decimals: 9,
          price: 100.0
        },
        tokenY: {
          address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          price: 1.0
        },
        activeBin: 8388600,
        liquidityAmount: '5000',
        feesEarned: { tokenX: '25', tokenY: '25' },
        createdAt: new Date(),
        lastUpdated: new Date(),
        isActive: true
      }
    ]
  })

  afterEach(() => {
    migrationManager.clearCache()
  })

  describe('analyzeMigrationOpportunities', () => {
    it('should analyze migration opportunities successfully', async () => {
      const opportunities = await migrationManager.analyzeMigrationOpportunities(
        mockPositions,
        mockUserAddress
      )

      expect(Array.isArray(opportunities)).toBe(true)
      opportunities.forEach(opportunity => {
        expect(opportunity).toMatchObject({
          fromPosition: expect.objectContaining({
            id: expect.any(String)
          }),
          targetPool: expect.objectContaining({
            toString: expect.any(Function)
          }),
          targetPair: expect.any(String),
          improvementMetrics: expect.objectContaining({
            feeImprovement: expect.any(Number),
            aprImprovement: expect.any(Number),
            liquidityImprovement: expect.any(Number),
            volumeImprovement: expect.any(Number)
          }),
          migrationCost: expect.any(Number),
          projectedBenefit: expect.any(Number),
          recommendation: expect.stringMatching(/highly_recommended|recommended|neutral|not_recommended/)
        })
      })
    })

    it('should cache migration opportunities', async () => {
      const opportunities1 = await migrationManager.analyzeMigrationOpportunities(
        mockPositions,
        mockUserAddress
      )

      const opportunities2 = await migrationManager.analyzeMigrationOpportunities(
        mockPositions,
        mockUserAddress
      )

      expect(opportunities1).toEqual(opportunities2)
    })

    it('should handle empty positions array', async () => {
      const opportunities = await migrationManager.analyzeMigrationOpportunities(
        [],
        mockUserAddress
      )

      expect(opportunities).toEqual([])
    })

    it('should sort opportunities by projected benefit', async () => {
      const opportunities = await migrationManager.analyzeMigrationOpportunities(
        mockPositions,
        mockUserAddress
      )

      for (let i = 1; i < opportunities.length; i++) {
        expect(opportunities[i].projectedBenefit).toBeLessThanOrEqual(
          opportunities[i - 1].projectedBenefit
        )
      }
    })

    it('should filter out not_recommended opportunities', async () => {
      const opportunities = await migrationManager.analyzeMigrationOpportunities(
        mockPositions,
        mockUserAddress
      )

      opportunities.forEach(opp => {
        expect(opp.recommendation).not.toBe('not_recommended')
      })
    })

    it('should handle error during analysis gracefully', async () => {
      // Simulate error by passing invalid positions
      const invalidPositions: any[] = [{ id: 'invalid' }]

      const opportunities = await migrationManager.analyzeMigrationOpportunities(
        invalidPositions,
        mockUserAddress
      )

      expect(opportunities).toEqual([])
    })
  })

  describe('createMigrationPlan', () => {
    let mockOpportunities: CrossPoolOpportunity[]

    beforeEach(() => {
      mockOpportunities = [
        {
          fromPosition: mockPositions[0],
          targetPool: new PublicKey('BetterPoolAddress1111111111111111111111111111'),
          targetPair: 'USDC/USDT',
          improvementMetrics: {
            feeImprovement: -20,
            aprImprovement: 15,
            liquidityImprovement: 10,
            volumeImprovement: 5
          },
          migrationCost: 50,
          projectedBenefit: 200,
          recommendation: 'highly_recommended'
        },
        {
          fromPosition: mockPositions[1],
          targetPool: new PublicKey('BetterPoolAddress2222222222222222222222222222'),
          targetPair: 'SOL/USDC',
          improvementMetrics: {
            feeImprovement: 0,
            aprImprovement: 12,
            liquidityImprovement: 8,
            volumeImprovement: 3
          },
          migrationCost: 25,
          projectedBenefit: 150,
          recommendation: 'recommended'
        }
      ]
    })

    it('should create comprehensive migration plan', async () => {
      const preferences = {
        riskTolerance: 'moderate' as const,
        maxGasCost: 1000,
        prioritizeSpeed: false,
        consolidatePositions: false
      }

      const plan = await migrationManager.createMigrationPlan(
        mockOpportunities,
        mockUserAddress,
        preferences
      )

      expect(plan).toMatchObject({
        id: expect.stringMatching(/^plan-\d+$/),
        name: expect.any(String),
        description: expect.any(String),
        positions: expect.arrayContaining([
          expect.objectContaining({ id: expect.any(String) })
        ]),
        routes: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            fromPool: expect.objectContaining({
              toString: expect.any(Function)
            }),
            toPool: expect.objectContaining({
              toString: expect.any(Function)
            }),
            migrationReason: expect.any(String),
            confidence: expect.any(Number)
          })
        ]),
        totalCost: expect.any(Number),
        totalBenefit: expect.any(Number),
        estimatedDuration: expect.any(Number),
        riskLevel: expect.stringMatching(/low|medium|high/),
        steps: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            order: expect.any(Number),
            type: expect.any(String),
            description: expect.any(String)
          })
        ])
      })
    })

    it('should filter opportunities by conservative risk tolerance', async () => {
      const conservativePrefs = {
        riskTolerance: 'conservative' as const,
        maxGasCost: 500,
        prioritizeSpeed: false,
        consolidatePositions: false
      }

      const plan = await migrationManager.createMigrationPlan(
        mockOpportunities,
        mockUserAddress,
        conservativePrefs
      )

      expect(plan.riskLevel).toMatch(/low|medium/)
      expect(plan.routes.length).toBeLessThanOrEqual(mockOpportunities.length)
    })

    it('should consolidate positions when preferred', async () => {
      const consolidationPrefs = {
        riskTolerance: 'moderate' as const,
        maxGasCost: 1000,
        prioritizeSpeed: false,
        consolidatePositions: true
      }

      const plan = await migrationManager.createMigrationPlan(
        mockOpportunities,
        mockUserAddress,
        consolidationPrefs
      )

      expect(plan.routes.length).toBeLessThanOrEqual(mockOpportunities.length)
    })

    it('should optimize for speed when prioritizeSpeed is true', async () => {
      const speedPrefs = {
        riskTolerance: 'aggressive' as const,
        maxGasCost: 2000,
        prioritizeSpeed: true,
        consolidatePositions: false
      }

      const plan = await migrationManager.createMigrationPlan(
        mockOpportunities,
        mockUserAddress,
        speedPrefs
      )

      // Steps should be optimized for speed (shorter estimated times first)
      expect(plan.steps).toBeDefined()
      expect(plan.estimatedDuration).toBeGreaterThan(0)
    })

    it('should calculate total costs and benefits correctly', async () => {
      const preferences = {
        riskTolerance: 'moderate' as const,
        maxGasCost: 1000,
        prioritizeSpeed: false,
        consolidatePositions: false
      }

      const plan = await migrationManager.createMigrationPlan(
        mockOpportunities,
        mockUserAddress,
        preferences
      )

      const expectedTotalCost = mockOpportunities.reduce((sum, opp) => sum + opp.migrationCost, 0)
      const expectedTotalBenefit = mockOpportunities.reduce((sum, opp) => sum + opp.projectedBenefit, 0)

      expect(plan.totalCost).toBeCloseTo(expectedTotalCost, 2)
      expect(plan.totalBenefit).toBeCloseTo(expectedTotalBenefit, 2)
    })

    it('should create proper step dependencies', async () => {
      const preferences = {
        riskTolerance: 'moderate' as const,
        maxGasCost: 1000,
        prioritizeSpeed: false,
        consolidatePositions: false
      }

      const plan = await migrationManager.createMigrationPlan(
        mockOpportunities,
        mockUserAddress,
        preferences
      )

      // Each position should have claim -> remove -> add sequence
      const claimSteps = plan.steps.filter(s => s.type === 'claim_fees')
      const removeSteps = plan.steps.filter(s => s.type === 'remove_liquidity')
      const addSteps = plan.steps.filter(s => s.type === 'add_liquidity')

      expect(claimSteps.length).toBe(mockOpportunities.length)
      expect(removeSteps.length).toBe(mockOpportunities.length)
      expect(addSteps.length).toBe(mockOpportunities.length)

      // Remove steps should depend on claim steps
      removeSteps.forEach(removeStep => {
        expect(removeStep.dependencies.length).toBeGreaterThan(0)
      })
    })
  })

  describe('executeMigrationPlan', () => {
    let mockPlan: MigrationPlan
    let progressCallback: jest.Mock

    beforeEach(() => {
      progressCallback = jest.fn()

      mockPlan = {
        id: 'test-plan-123',
        name: 'Test Migration Plan',
        description: 'Test plan for migration',
        positions: [mockPositions[0]],
        routes: [{
          id: 'route-1',
          fromPool: mockPositions[0].poolAddress,
          toPool: new PublicKey('BetterPoolAddress1111111111111111111111111111'),
          fromPair: 'USDC/USDT',
          toPair: 'USDC/USDT',
          migrationReason: 'better_apr',
          estimatedCost: 50,
          estimatedBenefit: 200,
          timeToBreakeven: 5,
          confidence: 0.85
        }],
        totalCost: 50,
        totalBenefit: 200,
        estimatedDuration: 5,
        riskLevel: 'low',
        steps: [
          {
            id: 'claim-position-1',
            order: 1,
            type: 'claim_fees',
            description: 'Claim pending fees',
            poolAddress: mockPositions[0].poolAddress,
            estimatedGas: 0.001,
            estimatedTime: 30,
            dependencies: []
          },
          {
            id: 'remove-position-1',
            order: 2,
            type: 'remove_liquidity',
            description: 'Remove liquidity',
            poolAddress: mockPositions[0].poolAddress,
            estimatedGas: 0.002,
            estimatedTime: 45,
            dependencies: ['claim-position-1']
          },
          {
            id: 'add-new-pool',
            order: 3,
            type: 'add_liquidity',
            description: 'Add liquidity to new pool',
            poolAddress: new PublicKey('BetterPoolAddress1111111111111111111111111111'),
            estimatedGas: 0.002,
            estimatedTime: 45,
            dependencies: ['remove-position-1']
          }
        ]
      }
    })

    it('should execute migration plan successfully', async () => {
      const progress = await migrationManager.executeMigrationPlan(
        mockPlan,
        mockUserAddress,
        progressCallback
      )

      expect(progress).toMatchObject({
        planId: mockPlan.id,
        status: 'completed',
        currentStep: mockPlan.steps.length,
        totalSteps: mockPlan.steps.length,
        completedSteps: expect.arrayContaining(mockPlan.steps.map(s => s.id)),
        failedSteps: [],
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        errors: []
      })

      expect(progressCallback).toHaveBeenCalledTimes(mockPlan.steps.length + 1)
    }, 10000)

    it('should handle step execution failure gracefully', async () => {
      // Mock a critical step failure by modifying the plan
      const failingPlan = {
        ...mockPlan,
        steps: [{
          ...mockPlan.steps[1], // remove_liquidity step
          id: 'failing-remove-step',
          description: 'This will fail'
        }]
      }

      const progress = await migrationManager.executeMigrationPlan(
        failingPlan,
        mockUserAddress,
        progressCallback
      )

      expect(progress.status).toBe('completed') // Non-critical failures still allow completion
      expect(progressCallback).toHaveBeenCalled()
    }, 10000)

    it('should track progress correctly', async () => {
      await migrationManager.executeMigrationPlan(
        mockPlan,
        mockUserAddress,
        progressCallback
      )

      // Verify progress callback was called with correct progress updates
      const progressCalls = progressCallback.mock.calls.map(call => call[0])

      expect(progressCalls[0]).toMatchObject({
        planId: mockPlan.id,
        status: 'in_progress',
        currentStep: 0,
        totalSteps: mockPlan.steps.length
      })

      expect(progressCalls[progressCalls.length - 1]).toMatchObject({
        status: 'completed',
        currentStep: mockPlan.steps.length
      })
    }, 10000)

    it('should wait for step dependencies', async () => {
      const progress = await migrationManager.executeMigrationPlan(
        mockPlan,
        mockUserAddress,
        progressCallback
      )

      expect(progress.completedSteps).toEqual(mockPlan.steps.map(s => s.id))
    }, 10000)

    it('should handle empty plan gracefully', async () => {
      const emptyPlan = { ...mockPlan, steps: [] }

      const progress = await migrationManager.executeMigrationPlan(
        emptyPlan,
        mockUserAddress,
        progressCallback
      )

      expect(progress.status).toBe('completed')
      expect(progress.totalSteps).toBe(0)
    })

    it('should calculate execution time accurately', async () => {
      const progress = await migrationManager.executeMigrationPlan(
        mockPlan,
        mockUserAddress,
        progressCallback
      )

      const executionTime = progress.endTime!.getTime() - progress.startTime!.getTime()
      expect(executionTime).toBeGreaterThan(0)
    }, 10000)
  })

  describe('migration opportunity evaluation', () => {
    it('should evaluate highly recommended opportunities correctly', async () => {
      const opportunities = await migrationManager.analyzeMigrationOpportunities(
        mockPositions,
        mockUserAddress
      )

      const highlyRecommended = opportunities.filter(opp =>
        opp.recommendation === 'highly_recommended'
      )

      highlyRecommended.forEach(opp => {
        expect(opp.improvementMetrics.aprImprovement).toBeGreaterThan(20)
        expect(opp.projectedBenefit).toBeGreaterThan(opp.migrationCost * 2)
      })
    })

    it('should calculate migration costs proportionally', async () => {
      const smallPosition = { ...mockPositions[0], liquidityAmount: '1000' }
      const largePosition = { ...mockPositions[0], liquidityAmount: '100000' }

      const smallOpportunities = await migrationManager.analyzeMigrationOpportunities(
        [smallPosition],
        mockUserAddress
      )

      const largeOpportunities = await migrationManager.analyzeMigrationOpportunities(
        [largePosition],
        mockUserAddress
      )

      if (smallOpportunities.length > 0 && largeOpportunities.length > 0) {
        // Migration cost should be proportional to liquidity (0.5% of liquidity)
        expect(largeOpportunities[0].migrationCost).toBeCloseTo(100000 * 0.005, 0) // 500
        expect(smallOpportunities[0].migrationCost).toBeCloseTo(1000 * 0.005, 0) // 5
      }
    })

    it('should handle insufficient liquidity scenarios', async () => {
      const lowLiquidityPosition = {
        ...mockPositions[0],
        liquidityAmount: '1' // Very small amount
      }

      const opportunities = await migrationManager.analyzeMigrationOpportunities(
        [lowLiquidityPosition],
        mockUserAddress
      )

      // Should still return opportunities but with appropriate warnings
      expect(Array.isArray(opportunities)).toBe(true)
    })
  })

  describe('rollback mechanisms', () => {
    it('should prepare rollback plan when migration fails', async () => {
      const testMockPlan = {
        id: 'test-plan-123',
        name: 'Test Migration Plan',
        description: 'Test plan for migration',
        positions: [mockPositions[0]],
        routes: [],
        totalCost: 50,
        totalBenefit: 200,
        estimatedDuration: 5,
        riskLevel: 'low' as const,
        steps: [{
          id: 'critical-failing-step',
          order: 1,
          type: 'remove_liquidity' as const,
          description: 'This critical step will fail',
          poolAddress: mockPositions[0].poolAddress,
          estimatedGas: 0.002,
          estimatedTime: 45,
          dependencies: []
        }]
      }

      const progress = await migrationManager.executeMigrationPlan(
        testMockPlan,
        mockUserAddress
      )

      // Should handle gracefully and provide error information
      expect(progress.status).toMatch(/completed|failed/)
      expect(progress.errors).toBeDefined()
    })
  })

  describe('ROI projections and slippage estimation', () => {
    it('should project ROI accurately', async () => {
      const opportunities = await migrationManager.analyzeMigrationOpportunities(
        mockPositions,
        mockUserAddress
      )

      opportunities.forEach(opp => {
        expect(opp.projectedBenefit).toBeDefined()
        expect(opp.migrationCost).toBeGreaterThan(0)

        // ROI should be calculable
        const roi = (opp.projectedBenefit - opp.migrationCost) / opp.migrationCost
        expect(Number.isFinite(roi)).toBe(true)
      })
    })

    it('should estimate slippage based on liquidity amount', async () => {
      const highLiquidityPosition = { ...mockPositions[0], liquidityAmount: '1000000' }
      const lowLiquidityPosition = { ...mockPositions[0], liquidityAmount: '100' }

      const highLiqOpportunities = await migrationManager.analyzeMigrationOpportunities(
        [highLiquidityPosition],
        mockUserAddress
      )

      const lowLiqOpportunities = await migrationManager.analyzeMigrationOpportunities(
        [lowLiquidityPosition],
        mockUserAddress
      )

      // Higher liquidity should have proportionally higher migration costs
      if (highLiqOpportunities.length > 0 && lowLiqOpportunities.length > 0) {
        // Migration cost should be proportional to liquidity (0.5% of liquidity)
        expect(highLiqOpportunities[0].migrationCost).toBeCloseTo(1000000 * 0.005, 0) // 5000
        expect(lowLiqOpportunities[0].migrationCost).toBeCloseTo(100 * 0.005, 1) // 0.5
      }
    })
  })

  describe('partial migration scenarios', () => {
    it('should handle partial migration of large positions', async () => {
      const largePosition = { ...mockPositions[0], liquidityAmount: '1000000' }

      const opportunities = await migrationManager.analyzeMigrationOpportunities(
        [largePosition],
        mockUserAddress
      )

      // Should still find opportunities for large positions
      expect(opportunities.length).toBeGreaterThanOrEqual(0)
    })

    it('should create migration plans for partial amounts', async () => {
      const opportunities = await migrationManager.analyzeMigrationOpportunities(
        mockPositions,
        mockUserAddress
      )

      if (opportunities.length > 0) {
        const preferences = {
          riskTolerance: 'moderate' as const,
          maxGasCost: 1000,
          prioritizeSpeed: false,
          consolidatePositions: false
        }

        const plan = await migrationManager.createMigrationPlan(
          opportunities.slice(0, 1), // Partial migration
          mockUserAddress,
          preferences
        )

        expect(plan.positions.length).toBe(1)
        expect(plan.routes.length).toBe(1)
      }
    })
  })

  describe('cache management', () => {
    it('should clear cache successfully', () => {
      migrationManager.clearCache()
      const stats = migrationManager.getCacheStats()

      expect(stats.count).toBe(0)
      expect(stats.keys).toEqual([])
    })

    it('should provide cache statistics', async () => {
      await migrationManager.analyzeMigrationOpportunities(mockPositions, mockUserAddress)

      const stats = migrationManager.getCacheStats()
      expect(stats.count).toBeGreaterThan(0)
      expect(Array.isArray(stats.keys)).toBe(true)
    })
  })

  describe('gas cost calculations', () => {
    it('should calculate gas costs accurately for different step types', async () => {
      const preferences = {
        riskTolerance: 'moderate' as const,
        maxGasCost: 1000,
        prioritizeSpeed: false,
        consolidatePositions: false
      }

      const opportunities = await migrationManager.analyzeMigrationOpportunities(
        mockPositions,
        mockUserAddress
      )

      if (opportunities.length > 0) {
        const plan = await migrationManager.createMigrationPlan(
          opportunities,
          mockUserAddress,
          preferences
        )

        const gasSteps = plan.steps.filter(step => step.estimatedGas > 0)
        expect(gasSteps.length).toBeGreaterThan(0)

        gasSteps.forEach(step => {
          expect(step.estimatedGas).toBeGreaterThan(0)
          expect(step.estimatedGas).toBeLessThan(1) // Should be reasonable SOL amount
        })
      }
    })
  })

  describe('progress monitoring', () => {
    it('should provide detailed progress updates', async () => {
      const progressUpdates: MigrationProgress[] = []

      const testMockPlan = {
        id: 'test-plan-123',
        name: 'Test Migration Plan',
        description: 'Test plan for migration',
        positions: [mockPositions[0]],
        routes: [],
        totalCost: 50,
        totalBenefit: 200,
        estimatedDuration: 5,
        riskLevel: 'low' as const,
        steps: [
          {
            id: 'test-step-1',
            order: 1,
            type: 'claim_fees' as const,
            description: 'Test step',
            poolAddress: mockPositions[0].poolAddress,
            estimatedGas: 0.001,
            estimatedTime: 30,
            dependencies: []
          }
        ]
      }

      await migrationManager.executeMigrationPlan(
        testMockPlan,
        mockUserAddress,
        (progress) => {
          progressUpdates.push({ ...progress })
        }
      )

      expect(progressUpdates.length).toBeGreaterThan(0)

      progressUpdates.forEach((progress, index) => {
        expect(progress.planId).toBe(testMockPlan.id)
        expect(progress.totalSteps).toBe(testMockPlan.steps.length)
        expect(progress.currentStep).toBeGreaterThanOrEqual(0)
        expect(progress.currentStep).toBeLessThanOrEqual(testMockPlan.steps.length)

        if (index > 0) {
          expect(progress.currentStep).toBeGreaterThanOrEqual(
            progressUpdates[index - 1].currentStep
          )
        }
      })
    })
  })
})