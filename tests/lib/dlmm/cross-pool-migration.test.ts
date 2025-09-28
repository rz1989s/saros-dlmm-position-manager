import { PublicKey, Connection } from '@solana/web3.js'
import {
  CrossPoolMigrationEngine,
  type CrossPoolRoute,
  type CrossPoolMigrationPlan,
  type CrossPoolMigrationResult,
  type PoolCompatibility
} from '../../../src/lib/dlmm/cross-pool-migration'
import type { DLMMPosition } from '../../../src/lib/types'
import type { Pair } from '@saros-finance/dlmm-sdk'

// Mock the DLMM client
jest.mock('../../../src/lib/dlmm/client', () => ({
  dlmmClient: {
    getLiquidityBookServices: jest.fn(() => ({
      fetchPoolAddresses: jest.fn(),
      getLbPair: jest.fn()
    })),
    getAllLbPairs: jest.fn(),
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

// Mock SDK tracker
jest.mock('../../../src/lib/sdk-tracker', () => ({
  sdkTracker: {
    trackSDKCall: jest.fn(async (name, endpoint, fn) => fn())
  }
}))

// Mock logger
jest.mock('../../../src/lib/logger', () => ({
  logger: {
    init: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}))

describe('CrossPoolMigrationEngine', () => {
  let migrationEngine: CrossPoolMigrationEngine
  let mockConnection: Connection
  let mockUserAddress: PublicKey
  let mockSourcePosition: DLMMPosition
  let mockTargetPool: Pair

  beforeEach(() => {
    jest.clearAllMocks()
    mockConnection = new Connection('http://localhost:8899')
    migrationEngine = new CrossPoolMigrationEngine(mockConnection)
    mockUserAddress = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')

    // Mock source position
    mockSourcePosition = {
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
      liquidityAmount: '50000',
      feesEarned: { tokenX: '100', tokenY: '100' },
      createdAt: new Date(),
      lastUpdated: new Date(),
      isActive: true
    }

    // Mock target pool
    mockTargetPool = {
      address: new PublicKey('7djbVF7BSTi2Qzq8H9GXDCFuhhMHKBJtpCzFr6BzxuCz'),
      tokenX: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), // USDC
      tokenY: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'), // USDT
      binStep: 25,
      baseFactor: 5000,
      filterLifetime: 10,
      decayPeriod: 600,
      reductionFactor: 5000,
      variableFeeControl: 40000,
      maxVolatilityAccumulated: 350000,
      minBinId: -887272,
      maxBinId: 887272,
      protocolShare: 1000,
      pairCreatedAt: new Date(),
      reserveX: '1000000',
      reserveY: '1000000',
      totalSupply: '2000000'
    } as Pair
  })

  afterEach(() => {
    migrationEngine.clearCache()
    jest.restoreAllMocks()
  })

  describe('discoverMigrationRoutes', () => {
    beforeEach(() => {
      // Mock getAllLbPairs to return target pool
      const { dlmmClient } = require('../../../src/lib/dlmm/client')
      dlmmClient.getAllLbPairs.mockResolvedValue([mockTargetPool])
    })

    it('should discover migration routes successfully', async () => {
      const routes = await migrationEngine.discoverMigrationRoutes(
        mockSourcePosition,
        { minLiquidity: 1000000 }
      )

      expect(Array.isArray(routes)).toBe(true)
      routes.forEach(route => {
        expect(route).toMatchObject({
          id: expect.any(String),
          sourcePool: expect.objectContaining({
            toString: expect.any(Function)
          }),
          targetPool: expect.objectContaining({
            toString: expect.any(Function)
          }),
          estimatedSlippage: expect.any(Number),
          estimatedGasCost: expect.any(Number),
          estimatedExecutionTime: expect.any(Number),
          liquidityBridgeRequired: expect.any(Boolean),
          intermediateSwaps: expect.any(Array),
          confidence: expect.any(Number)
        })

        // Validate confidence is between 0 and 1
        expect(route.confidence).toBeGreaterThanOrEqual(0)
        expect(route.confidence).toBeLessThanOrEqual(1)

        // Validate slippage is reasonable
        expect(route.estimatedSlippage).toBeGreaterThan(0)
        expect(route.estimatedSlippage).toBeLessThan(0.1) // Less than 10%

        // Validate gas cost is positive
        expect(route.estimatedGasCost).toBeGreaterThan(0)
      })
    })

    it('should cache migration routes', async () => {
      const routes1 = await migrationEngine.discoverMigrationRoutes(
        mockSourcePosition,
        { minLiquidity: 1000000 }
      )

      const routes2 = await migrationEngine.discoverMigrationRoutes(
        mockSourcePosition,
        { minLiquidity: 1000000 }
      )

      expect(routes1).toEqual(routes2)
    })

    it('should filter out same pool', async () => {
      // Add source pool to mock results
      const poolsWithSource = [
        {
          ...mockTargetPool,
          address: mockSourcePosition.poolAddress
        },
        mockTargetPool
      ]

      const { dlmmClient } = require('../../../src/lib/dlmm/client')
      dlmmClient.getAllLbPairs.mockResolvedValue(poolsWithSource)

      const routes = await migrationEngine.discoverMigrationRoutes(
        mockSourcePosition
      )

      // Should not include route to same pool
      expect(routes.every(route =>
        !route.sourcePool.equals(route.targetPool)
      )).toBe(true)
    })

    it('should respect excluded pools', async () => {
      const excludedPool = mockTargetPool.address

      const routes = await migrationEngine.discoverMigrationRoutes(
        mockSourcePosition,
        { excludePools: [excludedPool] }
      )

      // Should not include routes to excluded pools
      expect(routes.every(route =>
        !route.targetPool.equals(excludedPool)
      )).toBe(true)
    })

    it('should handle no compatible pools', async () => {
      const { dlmmClient } = require('../../../src/lib/dlmm/client')
      dlmmClient.getAllLbPairs.mockResolvedValue([])

      const routes = await migrationEngine.discoverMigrationRoutes(
        mockSourcePosition
      )

      expect(routes).toEqual([])
    })

    it('should sort routes by confidence and cost', async () => {
      // Mock multiple pools with different characteristics
      const multiplePools = [
        mockTargetPool,
        {
          ...mockTargetPool,
          address: new PublicKey('BetterPoolAddress1111111111111111111111111111'),
          reserveX: '5000000', // Higher liquidity
          reserveY: '5000000'
        }
      ]

      const { dlmmClient } = require('../../../src/lib/dlmm/client')
      dlmmClient.getAllLbPairs.mockResolvedValue(multiplePools)

      const routes = await migrationEngine.discoverMigrationRoutes(
        mockSourcePosition
      )

      if (routes.length > 1) {
        // Routes should be sorted by score (confidence * 0.7 - cost * 0.3)
        for (let i = 1; i < routes.length; i++) {
          const scoreA = routes[i-1].confidence * 0.7 - (routes[i-1].estimatedGasCost / 1000) * 0.3
          const scoreB = routes[i].confidence * 0.7 - (routes[i].estimatedGasCost / 1000) * 0.3
          expect(scoreA).toBeGreaterThanOrEqual(scoreB)
        }
      }
    })

    it('should limit results to reasonable number', async () => {
      // Mock many pools
      const manyPools = Array.from({ length: 20 }, (_, i) => ({
        ...mockTargetPool,
        address: new PublicKey(`Pool${i.toString().padStart(44, '1')}`)
      }))

      const { dlmmClient } = require('../../../src/lib/dlmm/client')
      dlmmClient.getAllLbPairs.mockResolvedValue(manyPools)

      const routes = await migrationEngine.discoverMigrationRoutes(
        mockSourcePosition
      )

      expect(routes.length).toBeLessThanOrEqual(10) // Should limit to 10
    })
  })

  describe('assessPoolCompatibility', () => {
    it('should assess compatible pool correctly', async () => {
      const compatibility = await migrationEngine.assessPoolCompatibility(
        mockSourcePosition,
        mockTargetPool
      )

      expect(compatibility).toMatchObject({
        compatible: expect.any(Boolean),
        compatibilityScore: expect.any(Number),
        tokenMatches: expect.any(Boolean),
        liquidityAdequate: expect.any(Boolean),
        feeStructureCompatible: expect.any(Boolean),
        warnings: expect.any(Array),
        recommendations: expect.any(Array)
      })

      expect(compatibility.compatibilityScore).toBeGreaterThanOrEqual(0)
      expect(compatibility.compatibilityScore).toBeLessThanOrEqual(1)
    })

    it('should identify token matches correctly', async () => {
      // Test with matching tokens
      const compatibility = await migrationEngine.assessPoolCompatibility(
        mockSourcePosition,
        mockTargetPool
      )

      expect(compatibility.tokenMatches).toBe(true)
    })

    it('should identify incompatible pools', async () => {
      // Create pool with completely different tokens
      const incompatiblePool = {
        ...mockTargetPool,
        tokenX: new PublicKey('So11111111111111111111111111111111111111112'), // SOL
        tokenY: new PublicKey('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So') // mSOL
      }

      const compatibility = await migrationEngine.assessPoolCompatibility(
        mockSourcePosition,
        incompatiblePool
      )

      expect(compatibility.tokenMatches).toBe(false)
      expect(compatibility.warnings.length).toBeGreaterThan(0)
      expect(compatibility.recommendations.length).toBeGreaterThan(0)
    })

    it('should handle assessment errors gracefully', async () => {
      // Mock error in assessment
      const invalidPool = null as any

      const compatibility = await migrationEngine.assessPoolCompatibility(
        mockSourcePosition,
        invalidPool
      )

      expect(compatibility.compatible).toBe(false)
      expect(compatibility.compatibilityScore).toBe(0)
      expect(compatibility.warnings).toContain('Error during compatibility assessment')
    })
  })

  describe('createMigrationPlan', () => {
    let mockRoute: CrossPoolRoute

    beforeEach(() => {
      mockRoute = {
        id: 'route-test-123',
        sourcePool: mockSourcePosition.poolAddress,
        targetPool: mockTargetPool.address,
        sourcePair: {
          address: mockSourcePosition.poolAddress,
          tokenX: mockSourcePosition.tokenX.address,
          tokenY: mockSourcePosition.tokenY.address
        } as Pair,
        targetPair: mockTargetPool,
        estimatedSlippage: 0.005,
        estimatedGasCost: 0.01,
        estimatedExecutionTime: 180,
        liquidityBridgeRequired: false,
        intermediateSwaps: [],
        confidence: 0.85
      }
    })

    it('should create comprehensive migration plan', async () => {
      const preferences = {
        maxSlippage: 0.02,
        maxGasCost: 0.05,
        prioritizeSpeed: false,
        enableRollback: true
      }

      const plan = await migrationEngine.createMigrationPlan(
        mockSourcePosition,
        mockRoute,
        preferences
      )

      expect(plan).toMatchObject({
        id: expect.stringMatching(/^cross-pool-plan-\d+$/),
        positionId: mockSourcePosition.id,
        route: mockRoute,
        steps: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            order: expect.any(Number),
            type: expect.stringMatching(/remove_liquidity|swap_tokens|add_liquidity|verify_position/),
            description: expect.any(String),
            poolAddress: expect.objectContaining({
              toString: expect.any(Function)
            }),
            parameters: expect.any(Object),
            estimatedGas: expect.any(Number),
            estimatedTime: expect.any(Number),
            dependencies: expect.any(Array),
            criticalStep: expect.any(Boolean)
          })
        ]),
        totalGasCost: expect.any(Number),
        totalExecutionTime: expect.any(Number),
        rollbackPlan: expect.objectContaining({
          id: expect.any(String),
          triggerConditions: expect.any(Array),
          rollbackSteps: expect.any(Array),
          recoveryInstructions: expect.any(Array),
          emergencyContacts: expect.any(Array)
        }),
        riskLevel: expect.stringMatching(/low|medium|high/),
        successProbability: expect.any(Number)
      })

      expect(plan.successProbability).toBeGreaterThan(0)
      expect(plan.successProbability).toBeLessThanOrEqual(1)
      expect(plan.totalGasCost).toBeGreaterThan(0)
      expect(plan.totalExecutionTime).toBeGreaterThan(0)
    })

    it('should create plan with intermediate swaps', async () => {
      const routeWithSwaps = {
        ...mockRoute,
        intermediateSwaps: [
          {
            id: 'swap-1',
            fromToken: mockSourcePosition.tokenX,
            toToken: mockSourcePosition.tokenY,
            estimatedSlippage: 0.005,
            requiredAmount: '25000',
            expectedOutput: '24875'
          }
        ],
        liquidityBridgeRequired: true
      }

      const plan = await migrationEngine.createMigrationPlan(
        mockSourcePosition,
        routeWithSwaps,
        {
          maxSlippage: 0.02,
          maxGasCost: 0.05,
          prioritizeSpeed: false,
          enableRollback: false
        }
      )

      const swapSteps = plan.steps.filter(step => step.type === 'swap_tokens')
      expect(swapSteps.length).toBe(1)
      expect(swapSteps[0].dependencies).toContain(`remove-${mockSourcePosition.id}`)
    })

    it('should create proper step dependencies', async () => {
      const plan = await migrationEngine.createMigrationPlan(
        mockSourcePosition,
        mockRoute,
        {
          maxSlippage: 0.02,
          maxGasCost: 0.05,
          prioritizeSpeed: false,
          enableRollback: false
        }
      )

      // Remove step should have no dependencies
      const removeStep = plan.steps.find(s => s.type === 'remove_liquidity')
      expect(removeStep?.dependencies).toEqual([])

      // Add step should depend on remove step
      const addStep = plan.steps.find(s => s.type === 'add_liquidity')
      expect(addStep?.dependencies).toContain(`remove-${mockSourcePosition.id}`)

      // Verify step should depend on add step
      const verifyStep = plan.steps.find(s => s.type === 'verify_position')
      expect(verifyStep?.dependencies).toContain(`add-${mockRoute.targetPool.toString()}`)
    })

    it('should calculate risk level correctly', async () => {
      // Test low risk scenario
      const lowRiskRoute = { ...mockRoute, estimatedSlippage: 0.001, confidence: 0.95 }
      const lowRiskPlan = await migrationEngine.createMigrationPlan(
        mockSourcePosition,
        lowRiskRoute,
        { maxSlippage: 0.02, maxGasCost: 0.1, prioritizeSpeed: false, enableRollback: false }
      )
      expect(lowRiskPlan.riskLevel).toBe('low')

      // Test high risk scenario
      const highRiskRoute = { ...mockRoute, estimatedSlippage: 0.03, confidence: 0.5, intermediateSwaps: [
        { id: 'swap1', fromToken: mockSourcePosition.tokenX, toToken: mockSourcePosition.tokenY, estimatedSlippage: 0.01, requiredAmount: '1000', expectedOutput: '990' },
        { id: 'swap2', fromToken: mockSourcePosition.tokenY, toToken: mockSourcePosition.tokenX, estimatedSlippage: 0.01, requiredAmount: '1000', expectedOutput: '990' },
        { id: 'swap3', fromToken: mockSourcePosition.tokenX, toToken: mockSourcePosition.tokenY, estimatedSlippage: 0.01, requiredAmount: '1000', expectedOutput: '990' }
      ] }
      const highRiskPlan = await migrationEngine.createMigrationPlan(
        mockSourcePosition,
        highRiskRoute,
        { maxSlippage: 0.02, maxGasCost: 0.005, prioritizeSpeed: false, enableRollback: false }
      )
      expect(highRiskPlan.riskLevel).toBe('high')
    })

    it('should create rollback plan when enabled', async () => {
      const plan = await migrationEngine.createMigrationPlan(
        mockSourcePosition,
        mockRoute,
        {
          maxSlippage: 0.02,
          maxGasCost: 0.05,
          prioritizeSpeed: false,
          enableRollback: true
        }
      )

      expect(plan.rollbackPlan.rollbackSteps.length).toBeGreaterThan(0)
      expect(plan.rollbackPlan.triggerConditions.length).toBeGreaterThan(0)
      expect(plan.rollbackPlan.recoveryInstructions.length).toBeGreaterThan(0)
    })

    it('should handle plan creation errors', async () => {
      const invalidRoute = null as any

      await expect(
        migrationEngine.createMigrationPlan(
          mockSourcePosition,
          invalidRoute,
          { maxSlippage: 0.02, maxGasCost: 0.05, prioritizeSpeed: false, enableRollback: false }
        )
      ).rejects.toThrow('Failed to create migration plan')
    })
  })

  describe('executeMigrationPlan', () => {
    let mockPlan: CrossPoolMigrationPlan
    let progressCallback: jest.Mock

    beforeEach(() => {
      progressCallback = jest.fn()

      mockPlan = {
        id: 'test-cross-pool-plan-123',
        positionId: mockSourcePosition.id,
        route: {
          id: 'route-test-123',
          sourcePool: mockSourcePosition.poolAddress,
          targetPool: mockTargetPool.address,
          sourcePair: {} as Pair,
          targetPair: mockTargetPool,
          estimatedSlippage: 0.005,
          estimatedGasCost: 0.01,
          estimatedExecutionTime: 180,
          liquidityBridgeRequired: false,
          intermediateSwaps: [],
          confidence: 0.85
        },
        steps: [
          {
            id: 'remove-position-1',
            order: 1,
            type: 'remove_liquidity',
            description: 'Remove liquidity from source pool',
            poolAddress: mockSourcePosition.poolAddress,
            parameters: {},
            estimatedGas: 0.002,
            estimatedTime: 45,
            dependencies: [],
            criticalStep: true
          },
          {
            id: 'add-target-pool',
            order: 2,
            type: 'add_liquidity',
            description: 'Add liquidity to target pool',
            poolAddress: mockTargetPool.address,
            parameters: {},
            estimatedGas: 0.0025,
            estimatedTime: 60,
            dependencies: ['remove-position-1'],
            criticalStep: true
          },
          {
            id: 'verify-migration',
            order: 3,
            type: 'verify_position',
            description: 'Verify migration success',
            poolAddress: mockTargetPool.address,
            parameters: {},
            estimatedGas: 0.0005,
            estimatedTime: 15,
            dependencies: ['add-target-pool'],
            criticalStep: false
          }
        ],
        totalGasCost: 0.005,
        totalExecutionTime: 120,
        rollbackPlan: {
          id: 'rollback-test',
          triggerConditions: [],
          rollbackSteps: [],
          recoveryInstructions: [],
          emergencyContacts: []
        },
        riskLevel: 'low',
        successProbability: 0.9
      }
    })

    it('should execute migration plan successfully', async () => {
      // Mock step execution to be faster
      jest.spyOn(migrationEngine, 'executeStep' as any).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10)) // 10ms instead of real execution
        return { transactionId: 'mock-tx-id', gasUsed: 0.001 }
      })

      const result = await migrationEngine.executeMigrationPlan(
        mockPlan,
        mockUserAddress,
        progressCallback
      )

      expect(result).toMatchObject({
        planId: mockPlan.id,
        status: 'success',
        executedSteps: mockPlan.steps.map(s => s.id),
        failedSteps: [],
        transactionIds: expect.arrayContaining(['mock-tx-id']),
        gasUsed: expect.any(Number),
        executionTime: expect.any(Number)
      })

      expect(progressCallback).toHaveBeenCalledTimes(mockPlan.steps.length * 2) // Before and after each step
      expect(result.gasUsed).toBeGreaterThan(0)
      expect(result.executionTime).toBeGreaterThan(0)
    })

    it('should handle step execution failure gracefully', async () => {
      // Mock step execution to fail on second step
      jest.spyOn(migrationEngine, 'executeStep' as any).mockImplementation(async (step: any) => {
        await new Promise(resolve => setTimeout(resolve, 5))
        if (step.id === 'add-target-pool') {
          throw new Error('Simulated step failure')
        }
        return { transactionId: 'mock-tx-id', gasUsed: 0.001 }
      })

      const result = await migrationEngine.executeMigrationPlan(
        mockPlan,
        mockUserAddress,
        progressCallback
      )

      expect(result.status).toBe('failed') // Critical step failed
      expect(result.failedSteps.length).toBeGreaterThan(0)
      expect(result.failedSteps[0]).toMatchObject({
        stepId: 'add-target-pool',
        error: 'Simulated step failure',
        timestamp: expect.any(Date)
      })
    })

    it('should handle non-critical step failures', async () => {
      // Mock step execution to fail on verification step (non-critical)
      jest.spyOn(migrationEngine, 'executeStep' as any).mockImplementation(async (step: any) => {
        await new Promise(resolve => setTimeout(resolve, 5))
        if (step.id === 'verify-migration') {
          throw new Error('Verification failed')
        }
        return { transactionId: 'mock-tx-id', gasUsed: 0.001 }
      })

      const result = await migrationEngine.executeMigrationPlan(
        mockPlan,
        mockUserAddress,
        progressCallback
      )

      expect(result.status).toBe('partial_success') // Non-critical failure
      expect(result.executedSteps).toContain('remove-position-1')
      expect(result.executedSteps).toContain('add-target-pool')
      expect(result.failedSteps.length).toBe(1)
      expect(result.failedSteps[0].stepId).toBe('verify-migration')
    })

    it('should track progress correctly', async () => {
      jest.spyOn(migrationEngine, 'executeStep' as any).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 5))
        return { transactionId: 'mock-tx-id', gasUsed: 0.001 }
      })

      await migrationEngine.executeMigrationPlan(
        mockPlan,
        mockUserAddress,
        progressCallback
      )

      const progressCalls = progressCallback.mock.calls.map(call => call[0])

      // First call should be start of first step
      expect(progressCalls[0]).toMatchObject({
        step: 1,
        total: mockPlan.steps.length,
        status: expect.stringContaining('Executing')
      })

      // Last call should be completion of last step
      expect(progressCalls[progressCalls.length - 1]).toMatchObject({
        step: mockPlan.steps.length,
        total: mockPlan.steps.length,
        status: expect.stringContaining('Completed'),
        transactionId: 'mock-tx-id'
      })
    })

    it('should execute rollback on critical failure', async () => {
      const planWithRollback = {
        ...mockPlan,
        rollbackPlan: {
          id: 'rollback-test',
          triggerConditions: ['critical_step_failure'],
          rollbackSteps: [
            {
              id: 'rollback-add-original',
              order: 1,
              type: 'add_liquidity' as const,
              description: 'Rollback: Re-add to original pool',
              poolAddress: mockSourcePosition.poolAddress,
              parameters: {},
              estimatedGas: 0.003,
              estimatedTime: 60,
              dependencies: [],
              criticalStep: true
            }
          ],
          recoveryInstructions: ['Check wallet balance'],
          emergencyContacts: ['support@saros.finance']
        }
      }

      // Mock rollback execution
      jest.spyOn(migrationEngine, 'executeRollback' as any).mockImplementation(async () => {
        return { success: true, actions: ['✅ Executed: Rollback operation'] }
      })

      // Mock step execution to fail on critical step
      jest.spyOn(migrationEngine, 'executeStep' as any).mockImplementation(async (step: any) => {
        await new Promise(resolve => setTimeout(resolve, 5))
        if (step.criticalStep && step.id === 'add-target-pool') {
          throw new Error('Critical step failure')
        }
        return { transactionId: 'mock-tx-id', gasUsed: 0.001 }
      })

      const result = await migrationEngine.executeMigrationPlan(
        planWithRollback,
        mockUserAddress,
        progressCallback
      )

      expect(result.status).toBe('rolled_back')
      expect(result.recoveryActions).toContain('✅ Executed: Rollback operation')
    })

    it('should handle empty plan gracefully', async () => {
      const emptyPlan = { ...mockPlan, steps: [] }

      const result = await migrationEngine.executeMigrationPlan(
        emptyPlan,
        mockUserAddress,
        progressCallback
      )

      expect(result.status).toBe('success')
      expect(result.executedSteps).toEqual([])
      expect(result.failedSteps).toEqual([])
    })

    it('should calculate execution time accurately', async () => {
      jest.spyOn(migrationEngine, 'executeStep' as any).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10)) // Controlled delay
        return { transactionId: 'mock-tx-id', gasUsed: 0.001 }
      })

      const result = await migrationEngine.executeMigrationPlan(
        mockPlan,
        mockUserAddress,
        progressCallback
      )

      expect(result.executionTime).toBeGreaterThan(0)
      expect(result.executionTime).toBeLessThan(1000) // Should be under 1 second with mocking
    })
  })

  describe('step execution methods', () => {
    it('should execute remove liquidity step', async () => {
      const removeStep = {
        id: 'remove-test',
        order: 1,
        type: 'remove_liquidity' as const,
        description: 'Test remove liquidity',
        poolAddress: mockSourcePosition.poolAddress,
        parameters: {},
        estimatedGas: 0.002,
        estimatedTime: 45,
        dependencies: [],
        criticalStep: true
      }

      const result = await (migrationEngine as any).executeStep(removeStep, mockUserAddress)

      expect(result).toMatchObject({
        transactionId: expect.stringMatching(/^remove-tx-\d+$/),
        gasUsed: removeStep.estimatedGas
      })
    })

    it('should execute token swap step', async () => {
      const swapStep = {
        id: 'swap-test',
        order: 1,
        type: 'swap_tokens' as const,
        description: 'Test token swap',
        poolAddress: mockTargetPool.address,
        parameters: {},
        estimatedGas: 0.0015,
        estimatedTime: 30,
        dependencies: [],
        criticalStep: false
      }

      const result = await (migrationEngine as any).executeStep(swapStep, mockUserAddress)

      expect(result).toMatchObject({
        transactionId: expect.stringMatching(/^swap-tx-\d+$/),
        gasUsed: swapStep.estimatedGas
      })
    })

    it('should execute add liquidity step', async () => {
      const addStep = {
        id: 'add-test',
        order: 1,
        type: 'add_liquidity' as const,
        description: 'Test add liquidity',
        poolAddress: mockTargetPool.address,
        parameters: {},
        estimatedGas: 0.0025,
        estimatedTime: 60,
        dependencies: [],
        criticalStep: true
      }

      const result = await (migrationEngine as any).executeStep(addStep, mockUserAddress)

      expect(result).toMatchObject({
        transactionId: expect.stringMatching(/^add-tx-\d+$/),
        gasUsed: addStep.estimatedGas
      })
    })

    it('should execute verify position step', async () => {
      const verifyStep = {
        id: 'verify-test',
        order: 1,
        type: 'verify_position' as const,
        description: 'Test position verification',
        poolAddress: mockTargetPool.address,
        parameters: {},
        estimatedGas: 0.0005,
        estimatedTime: 15,
        dependencies: [],
        criticalStep: false
      }

      const result = await (migrationEngine as any).executeStep(verifyStep, mockUserAddress)

      expect(result).toMatchObject({
        gasUsed: verifyStep.estimatedGas
      })

      // Verify step doesn't return transaction ID
      expect(result.transactionId).toBeUndefined()
    })

    it('should handle unknown step type', async () => {
      const unknownStep = {
        id: 'unknown-test',
        order: 1,
        type: 'unknown_type' as any,
        description: 'Unknown step type',
        poolAddress: mockTargetPool.address,
        parameters: {},
        estimatedGas: 0.001,
        estimatedTime: 30,
        dependencies: [],
        criticalStep: false
      }

      await expect(
        (migrationEngine as any).executeStep(unknownStep, mockUserAddress)
      ).rejects.toThrow('Unknown step type: unknown_type')
    })
  })

  describe('cache management', () => {
    it('should clear cache successfully', () => {
      migrationEngine.clearCache()
      const stats = migrationEngine.getCacheStats()

      expect(stats.count).toBe(0)
      expect(stats.keys).toEqual([])
    })

    it('should provide cache statistics', async () => {
      // Add something to cache
      await migrationEngine.discoverMigrationRoutes(mockSourcePosition)

      const stats = migrationEngine.getCacheStats()
      expect(stats.count).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(stats.keys)).toBe(true)
    })
  })

  describe('utility methods', () => {
    it('should calculate route confidence correctly', async () => {
      const routes = await migrationEngine.discoverMigrationRoutes(mockSourcePosition)

      routes.forEach(route => {
        expect(route.confidence).toBeGreaterThanOrEqual(0)
        expect(route.confidence).toBeLessThanOrEqual(0.95) // Capped at 95%
      })
    })

    it('should estimate costs reasonably', async () => {
      const routes = await migrationEngine.discoverMigrationRoutes(mockSourcePosition)

      routes.forEach(route => {
        expect(route.estimatedGasCost).toBeGreaterThan(0)
        expect(route.estimatedGasCost).toBeLessThan(1) // Should be reasonable SOL amount
        expect(route.estimatedExecutionTime).toBeGreaterThan(0)
        expect(route.estimatedSlippage).toBeGreaterThan(0)
        expect(route.estimatedSlippage).toBeLessThan(0.1) // Less than 10%
      })
    })

    it('should handle edge cases in calculations', async () => {
      // Test with very small position
      const smallPosition = {
        ...mockSourcePosition,
        liquidityAmount: '1'
      }

      const routes = await migrationEngine.discoverMigrationRoutes(smallPosition)

      routes.forEach(route => {
        expect(Number.isFinite(route.confidence)).toBe(true)
        expect(Number.isFinite(route.estimatedGasCost)).toBe(true)
        expect(Number.isFinite(route.estimatedSlippage)).toBe(true)
      })

      // Test with very large position
      const largePosition = {
        ...mockSourcePosition,
        liquidityAmount: '10000000'
      }

      const largeRoutes = await migrationEngine.discoverMigrationRoutes(largePosition)

      largeRoutes.forEach(route => {
        expect(Number.isFinite(route.confidence)).toBe(true)
        expect(Number.isFinite(route.estimatedGasCost)).toBe(true)
        expect(Number.isFinite(route.estimatedSlippage)).toBe(true)
      })
    })
  })
})