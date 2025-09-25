import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { Wallet } from '@solana/wallet-adapter-react'
import {
  ArbitrageExecutionPlanner,
  ExecutionPlan,
  ExecutionStrategy,
  MEVProtectionPlan,
  MEVProtectionStrategy,
  ContingencyPlan,
  RiskManagementPlan,
  ExecutionTiming,
  ExecutionResults,
  ExecutionPreferences,
  TransactionGroup,
  JitterConfiguration,
  FrontrunProtectionPlan,
  SandwichProtectionPlan,
  MEVFailsafe,
  TriggerCondition,
  ContingencyResponse,
  StopLossCondition,
  PositionSizingStrategy,
  ExecutionMonitoring,
  ProgressCallback,
  PerformanceMetric
} from '../../../../src/lib/dlmm/arbitrage/execution-planner'
import {
  ArbitrageOpportunity,
  ArbitragePool,
  ArbitragePath,
  RouteStep,
  ProfitabilityMetrics,
  RiskAssessment,
  ExecutionStep,
  MEVProtection
} from '../../../../src/lib/dlmm/arbitrage/detection-engine'
import {
  DetailedProfitabilityAnalysis,
  ProfitabilityScenario,
  RiskAdjustedProfitability,
  CostBreakdown,
  MarketImpactAnalysis
} from '../../../../src/lib/dlmm/arbitrage/profitability-calculator'
import { TokenInfo } from '../../../../src/lib/types'
import { BinData } from '@saros-finance/dlmm-sdk'

// Mock external dependencies
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn(),
  PublicKey: jest.fn().mockImplementation((key: string) => ({
    toString: () => key,
    equals: jest.fn((other) => key === other.toString())
  })),
  Transaction: jest.fn(),
  VersionedTransaction: jest.fn()
}))

jest.mock('@solana/wallet-adapter-react', () => ({
  Wallet: jest.fn()
}))

// Mock console methods
const mockConsoleLog = jest.fn()
const mockConsoleError = jest.fn()
const mockConsoleWarn = jest.fn()

global.console = {
  ...console,
  log: mockConsoleLog,
  error: mockConsoleError,
  warn: mockConsoleWarn,
}

describe('ArbitrageExecutionPlanner', () => {
  let planner: ArbitrageExecutionPlanner
  let mockConnection: jest.Mocked<Connection>
  let mockWallet: jest.Mocked<Wallet>
  let mockOpportunity: ArbitrageOpportunity
  let mockProfitabilityAnalysis: DetailedProfitabilityAnalysis
  let mockTokenX: TokenInfo
  let mockTokenY: TokenInfo
  let mockPoolAddress: PublicKey

  beforeEach(() => {
    jest.clearAllMocks()

    mockConnection = {
      getAccountInfo: jest.fn(),
      getBalance: jest.fn(),
    } as any

    mockWallet = {
      adapter: {
        name: 'Test Wallet',
        publicKey: new PublicKey('TestWalletPublicKey'),
      }
    } as any

    mockTokenX = {
      address: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      logoURI: 'sol.png',
      tags: ['verified'],
      price: 100
    }

    mockTokenY = {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'usdc.png',
      tags: ['verified'],
      price: 1
    }

    mockPoolAddress = new PublicKey('7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm')

    const mockPool: ArbitragePool = {
      poolAddress: mockPoolAddress,
      tokenX: mockTokenX,
      tokenY: mockTokenY,
      activeBin: {} as BinData,
      liquidity: 100000,
      volume24h: 50000,
      fees: 0.003,
      slippage: 0.001
    }

    mockOpportunity = {
      id: 'test-opportunity',
      type: 'direct',
      pools: [mockPool],
      path: {
        inputToken: mockTokenX,
        outputToken: mockTokenX,
        route: [
          {
            poolAddress: mockPoolAddress,
            tokenIn: mockTokenX,
            tokenOut: mockTokenY,
            amountIn: 1000,
            amountOut: 1010,
            priceImpact: 0.001,
            binRange: { min: -10, max: 10 }
          }
        ],
        totalDistance: 2,
        complexity: 'simple'
      },
      profitability: {
        grossProfit: 20,
        netProfit: 15,
        profitMargin: 0.015,
        returnOnInvestment: 0.015,
        breakevenAmount: 500,
        maxProfitableAmount: 10000,
        gasCosts: 3,
        priorityFees: 2
      },
      risk: {
        liquidityRisk: 0.2,
        slippageRisk: 0.1,
        mevRisk: 0.3,
        temporalRisk: 0.2,
        competitionRisk: 0.4,
        overallRisk: 'medium',
        riskFactors: ['MEV competition', 'Price volatility']
      },
      executionPlan: [
        {
          stepNumber: 1,
          action: 'swap',
          pool: mockPoolAddress,
          tokenIn: mockTokenX,
          tokenOut: mockTokenY,
          amount: 1000,
          expectedOutput: 1010,
          maxSlippage: 0.005,
          timeoutMs: 30000,
          dependencies: []
        },
        {
          stepNumber: 2,
          action: 'swap',
          pool: mockPoolAddress,
          tokenIn: mockTokenY,
          tokenOut: mockTokenX,
          amount: 1010,
          expectedOutput: 1020,
          maxSlippage: 0.005,
          timeoutMs: 30000,
          dependencies: [1]
        }
      ],
      mev: {
        strategy: 'private_mempool',
        jitterMs: 1500,
        maxFrontrunProtection: 0.01,
        privateMempoolUsed: true,
        bundlingRequired: true
      },
      timestamp: Date.now(),
      confidence: 0.85
    }

    mockProfitabilityAnalysis = {
      baseAnalysis: mockOpportunity.profitability,
      scenarios: [
        {
          name: 'Conservative',
          description: 'Conservative scenario',
          probability: 0.3,
          inputAmount: 1000,
          expectedProfit: 10,
          worstCaseProfit: 5,
          bestCaseProfit: 15,
          executionTime: 15000,
          gasRequired: 400000
        },
        {
          name: 'Base Case',
          description: 'Base case scenario',
          probability: 0.5,
          inputAmount: 1000,
          expectedProfit: 15,
          worstCaseProfit: 10,
          bestCaseProfit: 20,
          executionTime: 10000,
          gasRequired: 300000
        },
        {
          name: 'Optimistic',
          description: 'Optimistic scenario',
          probability: 0.2,
          inputAmount: 1000,
          expectedProfit: 25,
          worstCaseProfit: 20,
          bestCaseProfit: 30,
          executionTime: 8000,
          gasRequired: 250000
        }
      ],
      riskAdjustedMetrics: {
        sharpeRatio: 1.2,
        sortinoRatio: 1.5,
        maxDrawdown: -0.1,
        valueAtRisk: 2,
        conditionalValueAtRisk: 3,
        probabilityOfProfit: 0.9,
        expectedShortfall: 1
      },
      costBreakdown: {
        transactionFees: [],
        slippageImpact: [],
        mevProtectionCost: 10,
        opportunityCost: 0.1,
        capitalRequirement: 1000,
        totalCosts: 15,
        costRatio: 0.15
      },
      marketImpact: {
        priceImpact: [],
        liquidityAnalysis: {
          totalLiquidity: 100000,
          activeLiquidity: 80000,
          liquidityDistribution: [],
          liquidityDepthScore: 0.8,
          liquidityStability: 0.85
        },
        competitionRisk: {
          historicalCompetition: 0.5,
          mevBotActivity: 0.3,
          averageExecutionDelay: 3000,
          successRate: 0.85,
          competitionPressure: 'medium'
        },
        temporalDecay: {
          halfLife: 30,
          decayRate: 0.023,
          sustainabilityScore: 0.7,
          optimalExecutionWindow: 20
        }
      },
      recommendations: [],
      sensitivity: {
        priceVolatility: [],
        gasPrice: [],
        slippage: [],
        competition: [],
        executionTime: []
      }
    }

    planner = new ArbitrageExecutionPlanner(mockConnection, mockWallet)
  })

  describe('constructor', () => {
    it('should initialize with connection and wallet', () => {
      expect(planner).toBeInstanceOf(ArbitrageExecutionPlanner)
    })

    it('should initialize empty active plans map', () => {
      const stats = planner.getExecutionStatistics()
      expect(stats.totalPlans).toBe(0)
      expect(stats.activePlans).toBe(0)
    })

    it('should set correct default values', () => {
      const maxConcurrent = (planner as any).MAX_CONCURRENT_EXECUTIONS
      const defaultTimeout = (planner as any).DEFAULT_TIMEOUT_MS

      expect(maxConcurrent).toBe(3)
      expect(defaultTimeout).toBe(30000)
    })
  })

  describe('createExecutionPlan', () => {
    it('should create comprehensive execution plan', async () => {
      const plan = await planner.createExecutionPlan(
        mockOpportunity,
        mockProfitabilityAnalysis
      )

      expect(plan).toBeDefined()
      expect(plan.id).toContain('plan_')
      expect(plan.opportunity).toBe(mockOpportunity)
      expect(plan.profitabilityAnalysis).toBe(mockProfitabilityAnalysis)
      expect(plan.executionStrategy).toBeDefined()
      expect(plan.mevProtection).toBeDefined()
      expect(plan.contingencyPlans).toBeInstanceOf(Array)
      expect(plan.riskManagement).toBeDefined()
      expect(plan.timing).toBeDefined()
      expect(plan.monitoring).toBeDefined()
      expect(plan.status).toBe('planned')
    })

    it('should handle execution preferences', async () => {
      const preferences: ExecutionPreferences = {
        maxRisk: 0.5,
        allowParallel: true,
        useMEVProtection: true,
        preferSpeed: true,
        preferCost: false
      }

      const plan = await planner.createExecutionPlan(
        mockOpportunity,
        mockProfitabilityAnalysis,
        preferences
      )

      expect(plan.mevProtection.privateMempoolUsed).toBe(true)
    })

    it('should create unique plan IDs', async () => {
      const plan1 = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)
      const plan2 = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)

      expect(plan1.id).not.toBe(plan2.id)
      expect(plan1.id).toContain(mockOpportunity.id)
      expect(plan2.id).toContain(mockOpportunity.id)
    })

    it('should store plan in active plans map', async () => {
      const plan = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)

      const retrievedPlan = planner.getExecutionPlan(plan.id)
      expect(retrievedPlan).toBe(plan)
    })

    it('should handle empty preferences', async () => {
      const plan = await planner.createExecutionPlan(
        mockOpportunity,
        mockProfitabilityAnalysis,
        {}
      )

      expect(plan).toBeDefined()
      expect(plan.status).toBe('planned')
    })
  })

  describe('executeArbitragePlan', () => {
    let planId: string

    beforeEach(async () => {
      const plan = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)
      planId = plan.id
    })

    it('should execute plan successfully', async () => {
      const results = await planner.executeArbitragePlan(planId)

      expect(results.success).toBe(true)
      expect(results.actualProfit).toBeGreaterThan(0)
      expect(results.executionTime).toBeGreaterThan(0)
      expect(results.stepResults).toBeInstanceOf(Array)

      const plan = planner.getExecutionPlan(planId)
      expect(plan?.status).toBe('completed')
      expect(plan?.results).toBe(results)
    })

    it('should throw error for non-existent plan', async () => {
      await expect(
        planner.executeArbitragePlan('non-existent-plan')
      ).rejects.toThrow('Execution plan non-existent-plan not found')
    })

    it('should respect maximum concurrent executions', async () => {
      // Create multiple plans
      const plans = await Promise.all([
        planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis),
        planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis),
        planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis),
        planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)
      ])

      // Mock executeWithMonitoring to take time
      jest.spyOn(planner as any, 'executeWithMonitoring').mockImplementation(
        () => new Promise(resolve =>
          setTimeout(() => resolve({
            success: true,
            actualProfit: 10,
            expectedProfit: 15,
            profitVariance: 0.33,
            executionTime: 5000,
            gasUsed: 200000,
            slippageEncountered: 0.002,
            mevProtectionEffective: true,
            stepResults: [],
            performanceMetrics: {},
            lessonsLearned: []
          }), 100)
        )
      )

      // Start executions simultaneously
      const executionPromises = plans.map(plan => planner.executeArbitragePlan(plan.id))

      // Fourth execution should fail due to concurrent limit
      await expect(executionPromises[3]).rejects.toThrow('Maximum concurrent executions reached')
    })

    it('should handle execution validation failures', async () => {
      // Mock validateExecutionConditions to fail
      jest.spyOn(planner as any, 'validateExecutionConditions').mockRejectedValue(
        new Error('Execution window expired')
      )

      await expect(planner.executeArbitragePlan(planId)).rejects.toThrow('Execution window expired')

      const plan = planner.getExecutionPlan(planId)
      expect(plan?.status).toBe('failed')
    })

    it('should handle execution errors and cleanup', async () => {
      // Mock executeWithMonitoring to throw error
      jest.spyOn(planner as any, 'executeWithMonitoring').mockRejectedValue(
        new Error('Execution failed')
      )

      const cleanupSpy = jest.spyOn(planner as any, 'cleanupExecution').mockResolvedValue(undefined)

      await expect(planner.executeArbitragePlan(planId)).rejects.toThrow('Execution failed')

      expect(cleanupSpy).toHaveBeenCalled()

      const plan = planner.getExecutionPlan(planId)
      expect(plan?.status).toBe('failed')
    })

    it('should activate MEV protection during execution', async () => {
      const activateMEVProtectionSpy = jest.spyOn(planner as any, 'activateMEVProtection').mockResolvedValue(undefined)

      await planner.executeArbitragePlan(planId)

      expect(activateMEVProtectionSpy).toHaveBeenCalled()
    })

    it('should measure execution time correctly', async () => {
      const results = await planner.executeArbitragePlan(planId)

      expect(results.executionTime).toBeGreaterThan(0)
      expect(typeof results.executionTime).toBe('number')
    })
  })

  describe('cancelExecutionPlan', () => {
    let planId: string

    beforeEach(async () => {
      const plan = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)
      planId = plan.id
    })

    it('should cancel planned execution', async () => {
      await planner.cancelExecutionPlan(planId, 'User requested cancellation')

      const plan = planner.getExecutionPlan(planId)
      expect(plan).toBeUndefined() // Should be removed from map

      expect(mockConsoleLog).toHaveBeenCalledWith(
        `Execution plan ${planId} cancelled: User requested cancellation`
      )
    })

    it('should handle cancellation of executing plan', async () => {
      const emergencyStopSpy = jest.spyOn(planner as any, 'emergencyStop').mockResolvedValue(undefined)

      // Set plan status to executing
      const plan = planner.getExecutionPlan(planId)!
      plan.status = 'executing'

      await planner.cancelExecutionPlan(planId, 'Emergency stop')

      expect(emergencyStopSpy).toHaveBeenCalledWith(plan, 'Emergency stop')
    })

    it('should handle cancellation of non-existent plan', async () => {
      await planner.cancelExecutionPlan('non-existent', 'Test reason')

      // Should not throw error, should handle gracefully
      expect(mockConsoleLog).not.toHaveBeenCalledWith(
        expect.stringContaining('non-existent cancelled')
      )
    })

    it('should remove plan from active plans map', async () => {
      const initialStats = planner.getExecutionStatistics()
      expect(initialStats.totalPlans).toBe(1)

      await planner.cancelExecutionPlan(planId, 'Test cancellation')

      const finalStats = planner.getExecutionStatistics()
      expect(finalStats.totalPlans).toBe(0)
    })
  })

  describe('private method testing', () => {
    describe('designExecutionStrategy', () => {
      it('should design atomic strategy for simple opportunities', async () => {
        const simpleOpportunity = {
          ...mockOpportunity,
          path: { ...mockOpportunity.path, complexity: 'simple' as const },
          executionPlan: [mockOpportunity.executionPlan[0]] // Single step
        }

        const designExecutionStrategy = (planner as any).designExecutionStrategy.bind(planner)
        const strategy = await designExecutionStrategy(simpleOpportunity, {})

        expect(strategy.type).toBe('atomic')
      })

      it('should design batched strategy for complex opportunities', async () => {
        const complexOpportunity = {
          ...mockOpportunity,
          executionPlan: Array.from({ length: 6 }, (_, i) => ({
            ...mockOpportunity.executionPlan[0],
            stepNumber: i + 1
          }))
        }

        const designExecutionStrategy = (planner as any).designExecutionStrategy.bind(planner)
        const strategy = await designExecutionStrategy(complexOpportunity, {})

        expect(strategy.type).toBe('batched')
      })

      it('should design parallel strategy when allowed and possible', async () => {
        const parallelOpportunity = {
          ...mockOpportunity,
          executionPlan: [
            { ...mockOpportunity.executionPlan[0], dependencies: [] },
            { ...mockOpportunity.executionPlan[1], dependencies: [] }
          ]
        }

        const preferences = { allowParallel: true }

        const designExecutionStrategy = (planner as any).designExecutionStrategy.bind(planner)
        const strategy = await designExecutionStrategy(parallelOpportunity, preferences)

        expect(strategy.type).toBe('parallel')
      })

      it('should fall back to sequential strategy', async () => {
        const preferences = { allowParallel: false }

        const designExecutionStrategy = (planner as any).designExecutionStrategy.bind(planner)
        const strategy = await designExecutionStrategy(mockOpportunity, preferences)

        expect(strategy.type).toBe('sequential')
      })

      it('should include gas optimization strategy', async () => {
        const designExecutionStrategy = (planner as any).designExecutionStrategy.bind(planner)
        const strategy = await designExecutionStrategy(mockOpportunity, {})

        expect(strategy.gasOptimization).toBeDefined()
        expect(strategy.gasOptimization.type).toBeDefined()
        expect(strategy.gasOptimization.expectedSavings).toBeGreaterThan(0)
      })

      it('should include slippage management strategy', async () => {
        const designExecutionStrategy = (planner as any).designExecutionStrategy.bind(planner)
        const strategy = await designExecutionStrategy(mockOpportunity, {})

        expect(strategy.slippageManagement).toBeDefined()
        expect(strategy.slippageManagement.type).toBeDefined()
        expect(strategy.slippageManagement.baseSlippage).toBeGreaterThan(0)
        expect(strategy.slippageManagement.maxSlippage).toBeGreaterThan(strategy.slippageManagement.baseSlippage)
      })
    })

    describe('createMEVProtectionPlan', () => {
      it('should create comprehensive MEV protection plan', async () => {
        const createMEVProtectionPlan = (planner as any).createMEVProtectionPlan.bind(planner)
        const plan = await createMEVProtectionPlan(mockOpportunity, { useMEVProtection: true })

        expect(plan.strategies).toBeInstanceOf(Array)
        expect(plan.strategies.length).toBeGreaterThan(0)
        expect(plan.jitterTiming).toBeDefined()
        expect(plan.frontrunProtection).toBeDefined()
        expect(plan.sandwichProtection).toBeDefined()
        expect(plan.failsafes).toBeInstanceOf(Array)
      })

      it('should include private mempool strategy when enabled', async () => {
        const createMEVProtectionPlan = (planner as any).createMEVProtectionPlan.bind(planner)
        const plan = await createMEVProtectionPlan(mockOpportunity, { useMEVProtection: true })

        const privateMempoolStrategy = plan.strategies.find(s => s.type === 'private_mempool')
        expect(privateMempoolStrategy).toBeDefined()
        expect(privateMempoolStrategy!.effectiveness).toBeGreaterThan(0.5)
      })

      it('should include timing randomization strategy', async () => {
        const createMEVProtectionPlan = (planner as any).createMEVProtectionPlan.bind(planner)
        const plan = await createMEVProtectionPlan(mockOpportunity, {})

        const timingStrategy = plan.strategies.find(s => s.type === 'timing_randomization')
        expect(timingStrategy).toBeDefined()
        expect(timingStrategy!.cost).toBe(0)
      })

      it('should configure jitter timing correctly', async () => {
        const createMEVProtectionPlan = (planner as any).createMEVProtectionPlan.bind(planner)
        const plan = await createMEVProtectionPlan(mockOpportunity, {})

        expect(plan.jitterTiming.enabled).toBe(true)
        expect(plan.jitterTiming.minDelayMs).toBeGreaterThan(0)
        expect(plan.jitterTiming.maxDelayMs).toBeGreaterThan(plan.jitterTiming.minDelayMs)
        expect(['uniform', 'exponential', 'normal']).toContain(plan.jitterTiming.randomizationPattern)
      })

      it('should set bundling requirement based on profit', async () => {
        const highProfitOpportunity = {
          ...mockOpportunity,
          profitability: {
            ...mockOpportunity.profitability,
            netProfit: 150 // Above 100 threshold
          }
        }

        const createMEVProtectionPlan = (planner as any).createMEVProtectionPlan.bind(planner)
        const plan = await createMEVProtectionPlan(highProfitOpportunity, {})

        expect(plan.bundlingRequired).toBe(true)
      })

      it('should disable MEV protection when requested', async () => {
        const createMEVProtectionPlan = (planner as any).createMEVProtectionPlan.bind(planner)
        const plan = await createMEVProtectionPlan(mockOpportunity, { useMEVProtection: false })

        expect(plan.privateMempoolUsed).toBe(false)
        const privateMempoolStrategy = plan.strategies.find(s => s.type === 'private_mempool')
        expect(privateMempoolStrategy).toBeUndefined()
      })
    })

    describe('createContingencyPlans', () => {
      it('should create contingency plans for price movements', async () => {
        const createContingencyPlans = (planner as any).createContingencyPlans.bind(planner)
        const plans = await createContingencyPlans(mockOpportunity, mockProfitabilityAnalysis)

        const priceMovementPlan = plans.find(p => p.scenario === 'Adverse Price Movement')
        expect(priceMovementPlan).toBeDefined()
        expect(priceMovementPlan!.triggerConditions).toBeInstanceOf(Array)
        expect(priceMovementPlan!.response.action).toBe('modify')
      })

      it('should create contingency plans for competition', async () => {
        const createContingencyPlans = (planner as any).createContingencyPlans.bind(planner)
        const plans = await createContingencyPlans(mockOpportunity, mockProfitabilityAnalysis)

        const competitionPlan = plans.find(p => p.scenario === 'High Competition Detected')
        expect(competitionPlan).toBeDefined()
        expect(competitionPlan!.response.action).toBe('delay')
        expect(competitionPlan!.response.delayMs).toBeGreaterThan(0)
      })

      it('should include fallback options', async () => {
        const createContingencyPlans = (planner as any).createContingencyPlans.bind(planner)
        const plans = await createContingencyPlans(mockOpportunity, mockProfitabilityAnalysis)

        plans.forEach(plan => {
          expect(plan.fallbackOptions).toBeInstanceOf(Array)
          plan.fallbackOptions.forEach(option => {
            expect(typeof option.description).toBe('string')
            expect(typeof option.costImpact).toBe('number')
            expect(typeof option.successProbability).toBe('number')
            expect(typeof option.implementation).toBe('function')
          })
        })
      })
    })

    describe('createRiskManagementPlan', () => {
      it('should create comprehensive risk management plan', async () => {
        const createRiskManagementPlan = (planner as any).createRiskManagementPlan.bind(planner)
        const plan = await createRiskManagementPlan(mockOpportunity, mockProfitabilityAnalysis)

        expect(plan.maxLossThreshold).toBeLessThan(0) // Should be negative (loss)
        expect(plan.stopLossConditions).toBeInstanceOf(Array)
        expect(plan.positionSizing).toBeDefined()
        expect(plan.diversification).toBeDefined()
        expect(plan.monitoring).toBeDefined()
      })

      it('should set appropriate stop loss conditions', async () => {
        const createRiskManagementPlan = (planner as any).createRiskManagementPlan.bind(planner)
        const plan = await createRiskManagementPlan(mockOpportunity, mockProfitabilityAnalysis)

        const absoluteLossCondition = plan.stopLossConditions.find(c => c.type === 'absolute_loss')
        const percentageLossCondition = plan.stopLossConditions.find(c => c.type === 'percentage_loss')
        const timeBasedCondition = plan.stopLossConditions.find(c => c.type === 'time_based')

        expect(absoluteLossCondition).toBeDefined()
        expect(percentageLossCondition).toBeDefined()
        expect(timeBasedCondition).toBeDefined()

        expect(absoluteLossCondition!.action).toBe('immediate_exit')
        expect(timeBasedCondition!.threshold).toBe(60000) // 60 seconds
      })

      it('should configure position sizing using Kelly criterion', async () => {
        const createRiskManagementPlan = (planner as any).createRiskManagementPlan.bind(planner)
        const plan = await createRiskManagementPlan(mockOpportunity, mockProfitabilityAnalysis)

        expect(plan.positionSizing.method).toBe('kelly_criterion')
        expect(plan.positionSizing.parameters.winRate).toBe(mockProfitabilityAnalysis.riskAdjustedMetrics.probabilityOfProfit)
        expect(plan.positionSizing.maxAllocation).toBe(0.1) // 10%
        expect(plan.positionSizing.minAllocation).toBe(0.01) // 1%
      })

      it('should set diversification limits', async () => {
        const createRiskManagementPlan = (planner as any).createRiskManagementPlan.bind(planner)
        const plan = await createRiskManagementPlan(mockOpportunity, mockProfitabilityAnalysis)

        expect(plan.diversification.maxSingleOpportunityAllocation).toBe(0.05)
        expect(plan.diversification.maxPoolConcentration).toBe(0.2)
        expect(plan.diversification.correlationLimits).toBeDefined()
      })
    })

    describe('optimizeExecutionTiming', () => {
      it('should optimize execution timing', async () => {
        const optimizeExecutionTiming = (planner as any).optimizeExecutionTiming.bind(planner)
        const timing = await optimizeExecutionTiming(mockOpportunity, mockProfitabilityAnalysis)

        expect(timing.optimalExecutionWindow).toBeDefined()
        expect(timing.marketConditionDependencies).toBeInstanceOf(Array)
        expect(timing.competitionAwareness).toBeDefined()
        expect(timing.adaptiveTiming).toBeDefined()
      })

      it('should set correct competition awareness level', async () => {
        const optimizeExecutionTiming = (planner as any).optimizeExecutionTiming.bind(planner)
        const timing = await optimizeExecutionTiming(mockOpportunity, mockProfitabilityAnalysis)

        expect(['low', 'medium', 'high', 'extreme']).toContain(timing.competitionAwareness.competitionLevel)
        expect(timing.competitionAwareness.monitoringEnabled).toBe(true)
      })

      it('should configure adaptive timing', async () => {
        const optimizeExecutionTiming = (planner as any).optimizeExecutionTiming.bind(planner)
        const timing = await optimizeExecutionTiming(mockOpportunity, mockProfitabilityAnalysis)

        expect(timing.adaptiveTiming.enabled).toBe(true)
        expect(timing.adaptiveTiming.learningRate).toBe(0.1)
        expect(timing.adaptiveTiming.historicalDataWindow).toBe(24 * 60 * 60 * 1000) // 24 hours
      })
    })

    describe('setupExecutionMonitoring', () => {
      it('should setup comprehensive monitoring', async () => {
        const setupExecutionMonitoring = (planner as any).setupExecutionMonitoring.bind(planner)
        const monitoring = await setupExecutionMonitoring(mockOpportunity, {})

        expect(monitoring.realTimeTracking).toBe(true)
        expect(monitoring.progressCallbacks).toBeInstanceOf(Array)
        expect(monitoring.performanceMetrics).toBeInstanceOf(Array)
        expect(monitoring.alertConfiguration).toBeDefined()
        expect(monitoring.logging).toBeDefined()
      })

      it('should configure progress callbacks', async () => {
        const setupExecutionMonitoring = (planner as any).setupExecutionMonitoring.bind(planner)
        const monitoring = await setupExecutionMonitoring(mockOpportunity, {})

        monitoring.progressCallbacks.forEach((callback: ProgressCallback) => {
          expect(['step_started', 'step_completed', 'step_failed', 'opportunity_expired', 'profit_realized']).toContain(callback.event)
          expect(typeof callback.callback).toBe('function')
          expect(typeof callback.priority).toBe('number')
        })
      })

      it('should configure performance metrics', async () => {
        const setupExecutionMonitoring = (planner as any).setupExecutionMonitoring.bind(planner)
        const monitoring = await setupExecutionMonitoring(mockOpportunity, {})

        monitoring.performanceMetrics.forEach((metric: PerformanceMetric) => {
          expect(typeof metric.name).toBe('string')
          expect(typeof metric.target).toBe('number')
          expect(typeof metric.tolerance).toBe('number')
          expect(['high', 'medium', 'low']).toContain(metric.criticality)
        })
      })
    })

    describe('helper methods', () => {
      describe('canExecuteInParallel', () => {
        it('should return true for parallel-safe opportunities', () => {
          const parallelOpportunity = {
            ...mockOpportunity,
            executionPlan: [
              { ...mockOpportunity.executionPlan[0], dependencies: [] },
              { ...mockOpportunity.executionPlan[1], dependencies: [] }
            ]
          }

          const canExecuteInParallel = (planner as any).canExecuteInParallel.bind(planner)
          const result = canExecuteInParallel(parallelOpportunity)

          expect(result).toBe(true)
        })

        it('should return false for sequential opportunities', () => {
          const canExecuteInParallel = (planner as any).canExecuteInParallel.bind(planner)
          const result = canExecuteInParallel(mockOpportunity)

          expect(result).toBe(false) // Has dependencies
        })

        it('should handle complex dependency chains', () => {
          const complexOpportunity = {
            ...mockOpportunity,
            executionPlan: [
              { ...mockOpportunity.executionPlan[0], stepNumber: 1, dependencies: [] },
              { ...mockOpportunity.executionPlan[1], stepNumber: 2, dependencies: [1] },
              { ...mockOpportunity.executionPlan[0], stepNumber: 3, dependencies: [1, 2] }
            ]
          }

          const canExecuteInParallel = (planner as any).canExecuteInParallel.bind(planner)
          const result = canExecuteInParallel(complexOpportunity)

          expect(result).toBe(false) // Has complex dependencies
        })
      })

      describe('getStrategyDescription', () => {
        it('should return correct descriptions for each strategy type', () => {
          const getStrategyDescription = (planner as any).getStrategyDescription.bind(planner)

          expect(getStrategyDescription('atomic', mockOpportunity)).toBe('Single atomic transaction execution')
          expect(getStrategyDescription('sequential', mockOpportunity)).toBe('Step-by-step sequential execution')
          expect(getStrategyDescription('parallel', mockOpportunity)).toBe('Parallel execution where possible')
          expect(getStrategyDescription('batched', mockOpportunity)).toBe('Optimized batched execution')
          expect(getStrategyDescription('unknown' as any, mockOpportunity)).toBe('Custom execution strategy')
        })
      })

      describe('estimateExecutionTime', () => {
        it('should estimate execution time based on strategy and steps', () => {
          const estimateExecutionTime = (planner as any).estimateExecutionTime.bind(planner)

          const atomicTime = estimateExecutionTime(mockOpportunity, 'atomic')
          const sequentialTime = estimateExecutionTime(mockOpportunity, 'sequential')
          const parallelTime = estimateExecutionTime(mockOpportunity, 'parallel')
          const batchedTime = estimateExecutionTime(mockOpportunity, 'batched')

          expect(atomicTime).toBeLessThan(sequentialTime)
          expect(parallelTime).toBeLessThan(sequentialTime)
          expect(batchedTime).toBeLessThan(sequentialTime)

          // All should be positive
          expect(atomicTime).toBeGreaterThan(0)
          expect(sequentialTime).toBeGreaterThan(0)
          expect(parallelTime).toBeGreaterThan(0)
          expect(batchedTime).toBeGreaterThan(0)
        })

        it('should scale with number of execution steps', () => {
          const shortOpportunity = {
            ...mockOpportunity,
            executionPlan: [mockOpportunity.executionPlan[0]]
          }

          const longOpportunity = {
            ...mockOpportunity,
            executionPlan: Array.from({ length: 5 }, (_, i) => ({
              ...mockOpportunity.executionPlan[0],
              stepNumber: i + 1
            }))
          }

          const estimateExecutionTime = (planner as any).estimateExecutionTime.bind(planner)

          const shortTime = estimateExecutionTime(shortOpportunity, 'sequential')
          const longTime = estimateExecutionTime(longOpportunity, 'sequential')

          expect(longTime).toBeGreaterThan(shortTime)
        })
      })
    })

    describe('validateExecutionConditions', () => {
      it('should validate execution window', async () => {
        const plan = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)

        const validateExecutionConditions = (planner as any).validateExecutionConditions.bind(planner)

        // Should pass validation when within window
        await expect(validateExecutionConditions(plan)).resolves.toBeUndefined()
      })

      it('should reject expired execution window', async () => {
        const plan = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)

        // Modify timing to be in the past
        plan.timing.optimalExecutionWindow.start = new Date(Date.now() - 60000)
        plan.timing.optimalExecutionWindow.end = new Date(Date.now() - 30000)

        const validateExecutionConditions = (planner as any).validateExecutionConditions.bind(planner)

        await expect(validateExecutionConditions(plan)).rejects.toThrow('Execution window expired')
      })
    })
  })

  describe('getExecutionPlan', () => {
    it('should retrieve execution plan by ID', async () => {
      const plan = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)

      const retrieved = planner.getExecutionPlan(plan.id)
      expect(retrieved).toBe(plan)
    })

    it('should return undefined for non-existent plan', () => {
      const retrieved = planner.getExecutionPlan('non-existent')
      expect(retrieved).toBeUndefined()
    })
  })

  describe('getAllActivePlans', () => {
    it('should return all active plans', async () => {
      const plan1 = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)
      const plan2 = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)

      const allPlans = planner.getAllActivePlans()

      expect(allPlans).toHaveLength(2)
      expect(allPlans).toContain(plan1)
      expect(allPlans).toContain(plan2)
    })

    it('should return empty array when no plans exist', () => {
      const allPlans = planner.getAllActivePlans()
      expect(allPlans).toEqual([])
    })
  })

  describe('getExecutionStatistics', () => {
    beforeEach(async () => {
      // Create some plans with different statuses
      const plan1 = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)
      const plan2 = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)

      plan1.status = 'completed'
      plan1.results = {
        success: true,
        actualProfit: 12,
        expectedProfit: 15,
        profitVariance: 0.2,
        executionTime: 8000,
        gasUsed: 250000,
        slippageEncountered: 0.003,
        mevProtectionEffective: true,
        stepResults: [],
        performanceMetrics: {},
        lessonsLearned: []
      }

      plan2.status = 'failed'
      plan2.results = {
        success: false,
        actualProfit: -5,
        expectedProfit: 15,
        profitVariance: 1.33,
        executionTime: 5000,
        gasUsed: 150000,
        slippageEncountered: 0.008,
        mevProtectionEffective: false,
        stepResults: [],
        performanceMetrics: {},
        lessonsLearned: []
      }
    })

    it('should return correct execution statistics', () => {
      const stats = planner.getExecutionStatistics()

      expect(stats.totalPlans).toBe(2)
      expect(stats.activePlans).toBe(0) // None executing
      expect(stats.completedPlans).toBe(1)
      expect(stats.failedPlans).toBe(1)
      expect(stats.successRate).toBe(0.5) // 1 success out of 2 with results
      expect(stats.averageExecutionTime).toBe(6500) // (8000 + 5000) / 2
      expect(stats.totalProfitRealized).toBe(12) // Only successful plans
    })

    it('should handle empty statistics correctly', () => {
      const emptyPlanner = new ArbitrageExecutionPlanner(mockConnection, mockWallet)
      const stats = emptyPlanner.getExecutionStatistics()

      expect(stats.totalPlans).toBe(0)
      expect(stats.activePlans).toBe(0)
      expect(stats.completedPlans).toBe(0)
      expect(stats.failedPlans).toBe(0)
      expect(stats.successRate).toBe(0)
      expect(stats.averageExecutionTime).toBe(0)
      expect(stats.totalProfitRealized).toBe(0)
    })

    it('should calculate statistics correctly with mixed results', async () => {
      // Add more plans to test edge cases
      const plan3 = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)
      plan3.status = 'executing'

      const stats = planner.getExecutionStatistics()

      expect(stats.totalPlans).toBe(3)
      expect(stats.activePlans).toBe(1) // One executing
      expect(stats.completedPlans).toBe(1)
      expect(stats.failedPlans).toBe(1)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle null/undefined opportunities', async () => {
      const nullOpportunity = null as any

      await expect(
        planner.createExecutionPlan(nullOpportunity, mockProfitabilityAnalysis)
      ).rejects.toThrow()
    })

    it('should handle malformed profitability analysis', async () => {
      const malformedAnalysis = {
        ...mockProfitabilityAnalysis,
        scenarios: null as any
      }

      // Should handle gracefully or throw appropriate error
      await expect(
        planner.createExecutionPlan(mockOpportunity, malformedAnalysis)
      ).resolves.toBeDefined()
    })

    it('should handle extreme execution preferences', async () => {
      const extremePreferences: ExecutionPreferences = {
        maxRisk: Number.MAX_VALUE,
        allowParallel: true,
        useMEVProtection: true,
        preferSpeed: true,
        preferCost: true // Conflicting preferences
      }

      const plan = await planner.createExecutionPlan(
        mockOpportunity,
        mockProfitabilityAnalysis,
        extremePreferences
      )

      expect(plan).toBeDefined()
    })

    it('should handle memory management with many plans', async () => {
      const plans = []

      // Create many plans
      for (let i = 0; i < 100; i++) {
        const plan = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)
        plans.push(plan)
      }

      expect(plans).toHaveLength(100)

      const stats = planner.getExecutionStatistics()
      expect(stats.totalPlans).toBe(100)
    })

    it('should handle concurrent plan creation', async () => {
      const promises = Array.from({ length: 10 }, () =>
        planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)
      )

      const plans = await Promise.all(promises)

      expect(plans).toHaveLength(10)
      plans.forEach(plan => {
        expect(plan).toBeDefined()
        expect(plan.id).toBeDefined()
      })

      // All IDs should be unique
      const ids = plans.map(p => p.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(10)
    })

    it('should cleanup resources properly', async () => {
      const plan = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)

      const cleanupSpy = jest.spyOn(planner as any, 'cleanupExecution').mockResolvedValue(undefined)

      await planner.executeArbitragePlan(plan.id)

      expect(cleanupSpy).toHaveBeenCalled()
    })

    it('should handle wallet connection issues', async () => {
      const disconnectedWallet = null as any
      const plannerWithDisconnectedWallet = new ArbitrageExecutionPlanner(mockConnection, disconnectedWallet)

      // Should still create plans but might fail during execution
      const plan = await plannerWithDisconnectedWallet.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)
      expect(plan).toBeDefined()
    })

    it('should handle network connection issues', async () => {
      const faultyConnection = {
        getAccountInfo: jest.fn().mockRejectedValue(new Error('Network error'))
      } as any

      const plannerWithFaultyConnection = new ArbitrageExecutionPlanner(faultyConnection, mockWallet)

      // Should create plans but might fail during validation/execution
      const plan = await plannerWithFaultyConnection.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)
      expect(plan).toBeDefined()
    })
  })

  describe('MEV protection implementation', () => {
    it('should handle private mempool setup failures gracefully', async () => {
      jest.spyOn(planner as any, 'setupPrivateMempool').mockRejectedValue(new Error('Private mempool failed'))

      const plan = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)

      // Should still create plan but might log error during execution
      expect(plan.mevProtection).toBeDefined()
    })

    it('should implement jitter timing correctly', async () => {
      const plan = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)

      expect(plan.mevProtection.jitterTiming.enabled).toBe(true)
      expect(plan.mevProtection.jitterTiming.minDelayMs).toBeGreaterThan(0)
      expect(plan.mevProtection.jitterTiming.maxDelayMs).toBeGreaterThan(plan.mevProtection.jitterTiming.minDelayMs)
    })

    it('should configure sandwich protection appropriately', async () => {
      const plan = await planner.createExecutionPlan(mockOpportunity, mockProfitabilityAnalysis)

      expect(plan.mevProtection.sandwichProtection.detectionEnabled).toBe(true)
      expect(plan.mevProtection.sandwichProtection.priceImpactThreshold).toBe(0.02)
      expect(plan.mevProtection.sandwichProtection.emergencyExit.enabled).toBe(true)
    })
  })
})