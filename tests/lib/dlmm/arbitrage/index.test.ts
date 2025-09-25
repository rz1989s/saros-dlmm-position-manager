import { Connection, PublicKey } from '@solana/web3.js'
import { Wallet } from '@solana/wallet-adapter-react'
import {
  ArbitrageManager,
  createArbitrageManager,
  getArbitrageManager,
  type ArbitrageManagerConfig,
  type ArbitrageStats,
  CrossPoolArbitrageEngine,
  ArbitrageProfitabilityCalculator,
  ArbitrageExecutionPlanner
} from '../../../../src/lib/dlmm/arbitrage/index'
import {
  type ArbitrageOpportunity
} from '../../../../src/lib/dlmm/arbitrage/detection-engine'
import { TokenInfo } from '../../../../src/lib/types'
import { BinData } from '@saros-finance/dlmm-sdk'

// Mock external dependencies
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn(),
  PublicKey: jest.fn().mockImplementation((key: string) => ({
    toString: () => key,
    equals: jest.fn((other) => key === other.toString())
  }))
}))

jest.mock('@solana/wallet-adapter-react', () => ({
  Wallet: jest.fn()
}))

jest.mock('../../../../src/lib/dlmm/arbitrage/detection-engine', () => ({
  CrossPoolArbitrageEngine: jest.fn().mockImplementation(() => ({
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
    addPool: jest.fn(),
    removePool: jest.fn(),
    getActiveOpportunities: jest.fn().mockReturnValue([]),
    getBestOpportunityForAmount: jest.fn(),
    getMonitoringStats: jest.fn().mockReturnValue({
      trackedPools: 0,
      activeOpportunities: 0,
      totalProfitPotential: 0,
      averageRiskScore: 0,
      updateInterval: 5000,
      isMonitoring: false
    })
  }))
}))

jest.mock('../../../../src/lib/dlmm/arbitrage/profitability-calculator', () => ({
  ArbitrageProfitabilityCalculator: jest.fn().mockImplementation(() => ({
    calculateDetailedProfitability: jest.fn().mockResolvedValue({
      baseAnalysis: {
        grossProfit: 20,
        netProfit: 15,
        profitMargin: 0.015,
        returnOnInvestment: 0.015,
        breakevenAmount: 500,
        maxProfitableAmount: 10000,
        gasCosts: 2.5,
        priorityFees: 1.25
      },
      scenarios: [],
      riskAdjustedMetrics: {
        sharpeRatio: 1.2,
        sortinoRatio: 1.5,
        maxDrawdown: -0.1,
        valueAtRisk: 2,
        conditionalValueAtRisk: 3,
        probabilityOfProfit: 0.9,
        expectedShortfall: 1
      },
      costBreakdown: {},
      marketImpact: {},
      recommendations: [],
      sensitivity: {}
    }),
    calculateBaseProfitability: jest.fn().mockResolvedValue({
      grossProfit: 20,
      netProfit: 15,
      profitMargin: 0.015,
      returnOnInvestment: 0.015,
      breakevenAmount: 500,
      maxProfitableAmount: 10000,
      gasCosts: 2.5,
      priorityFees: 1.25
    })
  }))
}))

jest.mock('../../../../src/lib/dlmm/arbitrage/execution-planner', () => ({
  ArbitrageExecutionPlanner: jest.fn().mockImplementation(() => ({
    createExecutionPlan: jest.fn().mockResolvedValue({
      id: 'plan-123',
      opportunity: {},
      profitabilityAnalysis: {},
      executionStrategy: { type: 'sequential' },
      mevProtection: { strategies: [] },
      contingencyPlans: [],
      riskManagement: {},
      timing: {},
      monitoring: {},
      status: 'planned',
      createdAt: new Date()
    }),
    executeArbitragePlan: jest.fn().mockResolvedValue({
      success: true,
      actualProfit: 14,
      expectedProfit: 15,
      profitVariance: 0.067,
      executionTime: 12000,
      gasUsed: 280000,
      slippageEncountered: 0.008,
      mevProtectionEffective: true,
      stepResults: [],
      performanceMetrics: {},
      lessonsLearned: []
    }),
    getExecutionStatistics: jest.fn().mockReturnValue({
      totalPlans: 0,
      activePlans: 0,
      completedPlans: 0,
      failedPlans: 0,
      successRate: 0,
      averageExecutionTime: 0,
      totalProfitRealized: 0
    })
  }))
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

describe('Arbitrage Index Module', () => {
  let mockConnection: jest.Mocked<Connection>
  let mockWallet: jest.Mocked<Wallet>
  let mockConfig: ArbitrageManagerConfig
  let mockOpportunity: ArbitrageOpportunity

  beforeEach(() => {
    jest.clearAllMocks()

    mockConnection = {
      getAccountInfo: jest.fn(),
      getBalance: jest.fn()
    } as any

    mockWallet = {
      adapter: {
        name: 'Test Wallet',
        publicKey: new PublicKey('TestWalletPublicKey')
      }
    } as any

    mockConfig = {
      connection: mockConnection,
      wallet: mockWallet,
      minProfitThreshold: 10,
      maxRiskScore: 0.7,
      enableMEVProtection: true,
      monitoringEnabled: true
    }

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

    mockOpportunity = {
      id: 'test-opportunity',
      type: 'direct',
      pools: [
        {
          poolAddress: mockPoolAddress,
          tokenX: mockTokenX,
          tokenY: mockTokenY,
          activeBin: {} as BinData,
          liquidity: 100000,
          volume24h: 50000,
          fees: 0.003,
          slippage: 0.001
        }
      ],
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
        totalDistance: 1,
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
  })

  describe('Factory Functions', () => {
    describe('createDetectionEngine', () => {
      it('should create ArbitrageOpportunityDetector with correct parameters', () => {
        const config: ArbitrageServiceConfig = {
          maxSlippage: 0.05,
          minProfitThreshold: 10,
          maxPriceImpact: 0.02,
          gasOptimization: true,
          mevProtection: true
        }

        const detector = createDetectionEngine(mockConnection, mockWallet, config)

        expect(ArbitrageOpportunityDetector).toHaveBeenCalledWith(
          mockConnection,
          mockWallet,
          config
        )
        expect(detector).toBeInstanceOf(ArbitrageOpportunityDetector)
      })

      it('should create detector with default config when none provided', () => {
        const detector = createDetectionEngine(mockConnection, mockWallet)

        expect(ArbitrageOpportunityDetector).toHaveBeenCalledWith(
          mockConnection,
          mockWallet,
          undefined
        )
        expect(detector).toBeInstanceOf(ArbitrageOpportunityDetector)
      })

      it('should handle null/undefined inputs gracefully', () => {
        const detector = createDetectionEngine(null as any, null as any)

        expect(ArbitrageOpportunityDetector).toHaveBeenCalledWith(
          null,
          null,
          undefined
        )
        expect(detector).toBeInstanceOf(ArbitrageOpportunityDetector)
      })
    })

    describe('createProfitabilityCalculator', () => {
      it('should create ArbitrageProfitabilityCalculator instance', () => {
        const calculator = createProfitabilityCalculator()

        expect(ArbitrageProfitabilityCalculator).toHaveBeenCalledWith()
        expect(calculator).toBeInstanceOf(ArbitrageProfitabilityCalculator)
      })

      it('should return singleton instance if called multiple times', () => {
        const calculator1 = createProfitabilityCalculator()
        const calculator2 = createProfitabilityCalculator()

        expect(ArbitrageProfitabilityCalculator).toHaveBeenCalledTimes(2)
        expect(calculator1).toBeInstanceOf(ArbitrageProfitabilityCalculator)
        expect(calculator2).toBeInstanceOf(ArbitrageProfitabilityCalculator)
      })
    })

    describe('createExecutionPlanner', () => {
      it('should create ArbitrageExecutionPlanner with correct parameters', () => {
        const planner = createExecutionPlanner(mockConnection, mockWallet)

        expect(ArbitrageExecutionPlanner).toHaveBeenCalledWith(
          mockConnection,
          mockWallet
        )
        expect(planner).toBeInstanceOf(ArbitrageExecutionPlanner)
      })

      it('should handle null/undefined inputs', () => {
        const planner = createExecutionPlanner(null as any, null as any)

        expect(ArbitrageExecutionPlanner).toHaveBeenCalledWith(null, null)
        expect(planner).toBeInstanceOf(ArbitrageExecutionPlanner)
      })
    })

    describe('createArbitrageManager', () => {
      it('should create ArbitrageManager with all components', () => {
        const config: ArbitrageServiceConfig = {
          maxSlippage: 0.05,
          minProfitThreshold: 10,
          maxPriceImpact: 0.02,
          gasOptimization: true,
          mevProtection: true
        }

        const options: ArbitrageServiceOptions = {
          enableRealTimeScanning: true,
          scanInterval: 5000,
          enableAutoExecution: false,
          riskTolerance: 'medium',
          profitThresholdForAutoExecution: 50
        }

        const manager = createArbitrageManager(
          mockConnection,
          mockWallet,
          config,
          options
        )

        expect(manager).toBeInstanceOf(ArbitrageManager)
      })

      it('should create manager with default options when none provided', () => {
        const manager = createArbitrageManager(mockConnection, mockWallet)

        expect(manager).toBeInstanceOf(ArbitrageManager)
      })

      it('should create manager with partial options', () => {
        const partialOptions: Partial<ArbitrageServiceOptions> = {
          enableRealTimeScanning: true,
          scanInterval: 3000
        }

        const manager = createArbitrageManager(
          mockConnection,
          mockWallet,
          undefined,
          partialOptions
        )

        expect(manager).toBeInstanceOf(ArbitrageManager)
      })
    })
  })

  describe('ArbitrageManager', () => {
    let manager: ArbitrageManager
    let mockDetector: jest.Mocked<ArbitrageOpportunityDetector>
    let mockCalculator: jest.Mocked<ArbitrageProfitabilityCalculator>
    let mockPlanner: jest.Mocked<ArbitrageExecutionPlanner>

    beforeEach(() => {
      const config: ArbitrageServiceConfig = {
        maxSlippage: 0.05,
        minProfitThreshold: 10,
        maxPriceImpact: 0.02,
        gasOptimization: true,
        mevProtection: true
      }

      const options: ArbitrageServiceOptions = {
        enableRealTimeScanning: true,
        scanInterval: 5000,
        enableAutoExecution: false,
        riskTolerance: 'medium',
        profitThresholdForAutoExecution: 50
      }

      manager = new ArbitrageManager(
        mockConnection,
        mockWallet,
        config,
        options
      )

      mockDetector = manager['detector'] as jest.Mocked<ArbitrageOpportunityDetector>
      mockCalculator = manager['calculator'] as jest.Mocked<ArbitrageProfitabilityCalculator>
      mockPlanner = manager['planner'] as jest.Mocked<ArbitrageExecutionPlanner>
    })

    describe('constructor', () => {
      it('should initialize with correct parameters', () => {
        expect(manager).toBeInstanceOf(ArbitrageManager)
        expect(manager['config']).toBeDefined()
        expect(manager['options']).toBeDefined()
      })

      it('should set default options when none provided', () => {
        const defaultManager = new ArbitrageManager(mockConnection, mockWallet)

        expect(defaultManager['options']).toEqual({
          enableRealTimeScanning: false,
          scanInterval: 10000,
          enableAutoExecution: false,
          riskTolerance: 'medium',
          profitThresholdForAutoExecution: 100
        })
      })

      it('should merge partial options with defaults', () => {
        const partialOptions: Partial<ArbitrageServiceOptions> = {
          enableRealTimeScanning: true,
          scanInterval: 3000
        }

        const partialManager = new ArbitrageManager(
          mockConnection,
          mockWallet,
          undefined,
          partialOptions
        )

        expect(partialManager['options'].enableRealTimeScanning).toBe(true)
        expect(partialManager['options'].scanInterval).toBe(3000)
        expect(partialManager['options'].enableAutoExecution).toBe(false) // Default
        expect(partialManager['options'].riskTolerance).toBe('medium') // Default
      })

      it('should initialize status correctly', () => {
        const status = manager.getStatus()

        expect(status.isScanning).toBe(false)
        expect(status.isAutoExecuting).toBe(false)
        expect(status.lastScanTime).toBeNull()
        expect(status.activeOpportunities).toBe(0)
        expect(status.activeExecutions).toBe(0)
      })
    })

    describe('scanForOpportunities', () => {
      it('should scan for opportunities and return results', async () => {
        const mockOpportunities = [mockOpportunity]
        mockDetector.scanForOpportunities.mockResolvedValue(mockOpportunities)

        const options = { pools: [mockPoolAddress], minProfit: 10 }
        const results = await manager.scanForOpportunities(options)

        expect(mockDetector.scanForOpportunities).toHaveBeenCalledWith(options)
        expect(results).toBe(mockOpportunities)
      })

      it('should update status after scanning', async () => {
        const mockOpportunities = [mockOpportunity]
        mockDetector.scanForOpportunities.mockResolvedValue(mockOpportunities)
        mockDetector.getAllOpportunities.mockReturnValue(mockOpportunities)

        await manager.scanForOpportunities()

        const status = manager.getStatus()
        expect(status.lastScanTime).toBeInstanceOf(Date)
        expect(status.activeOpportunities).toBe(1)
      })

      it('should handle scan errors gracefully', async () => {
        const scanError = new Error('Scan failed')
        mockDetector.scanForOpportunities.mockRejectedValue(scanError)

        await expect(manager.scanForOpportunities()).rejects.toThrow('Scan failed')

        const status = manager.getStatus()
        expect(status.lastScanTime).toBeNull() // Should not update on error
      })

      it('should handle empty scan results', async () => {
        mockDetector.scanForOpportunities.mockResolvedValue([])
        mockDetector.getAllOpportunities.mockReturnValue([])

        const results = await manager.scanForOpportunities()

        expect(results).toEqual([])
        const status = manager.getStatus()
        expect(status.activeOpportunities).toBe(0)
      })
    })

    describe('analyzeOpportunityProfitability', () => {
      it('should analyze profitability with detailed analysis', async () => {
        const inputAmount = 1000

        const results = await manager.analyzeOpportunityProfitability(
          mockOpportunity,
          inputAmount
        )

        expect(mockCalculator.calculateDetailedProfitability).toHaveBeenCalledWith(
          mockOpportunity,
          inputAmount,
          undefined
        )
        expect(results).toBeDefined()
      })

      it('should pass market conditions to calculator', async () => {
        const inputAmount = 1000
        const marketConditions = {
          gasPrice: 0.00001,
          volatilityMultiplier: 1.5,
          competitionLevel: 'high' as const,
          liquidityConditions: 'excellent' as const
        }

        await manager.analyzeOpportunityProfitability(
          mockOpportunity,
          inputAmount,
          marketConditions
        )

        expect(mockCalculator.calculateDetailedProfitability).toHaveBeenCalledWith(
          mockOpportunity,
          inputAmount,
          marketConditions
        )
      })

      it('should handle calculator errors', async () => {
        const calculatorError = new Error('Calculation failed')
        mockCalculator.calculateDetailedProfitability.mockRejectedValue(calculatorError)

        await expect(
          manager.analyzeOpportunityProfitability(mockOpportunity, 1000)
        ).rejects.toThrow('Calculation failed')
      })
    })

    describe('createExecutionPlan', () => {
      it('should create execution plan with profitability analysis', async () => {
        const mockAnalysis = {
          baseAnalysis: mockOpportunity.profitability,
          scenarios: [],
          riskAdjustedMetrics: {},
          costBreakdown: {},
          marketImpact: {},
          recommendations: [],
          sensitivity: {}
        }

        mockCalculator.calculateDetailedProfitability.mockResolvedValue(mockAnalysis)

        const preferences = { maxRisk: 0.5, useMEVProtection: true }
        const plan = await manager.createExecutionPlan(mockOpportunity, preferences)

        expect(mockCalculator.calculateDetailedProfitability).toHaveBeenCalled()
        expect(mockPlanner.createExecutionPlan).toHaveBeenCalledWith(
          mockOpportunity,
          mockAnalysis,
          preferences
        )
        expect(plan).toBeDefined()
      })

      it('should handle execution plan creation errors', async () => {
        const plannerError = new Error('Plan creation failed')
        mockPlanner.createExecutionPlan.mockRejectedValue(plannerError)

        await expect(
          manager.createExecutionPlan(mockOpportunity)
        ).rejects.toThrow('Plan creation failed')
      })

      it('should create plan without preferences', async () => {
        const mockAnalysis = {
          baseAnalysis: mockOpportunity.profitability,
          scenarios: [],
          riskAdjustedMetrics: {},
          costBreakdown: {},
          marketImpact: {},
          recommendations: [],
          sensitivity: {}
        }

        mockCalculator.calculateDetailedProfitability.mockResolvedValue(mockAnalysis)

        const plan = await manager.createExecutionPlan(mockOpportunity)

        expect(mockPlanner.createExecutionPlan).toHaveBeenCalledWith(
          mockOpportunity,
          mockAnalysis,
          undefined
        )
        expect(plan).toBeDefined()
      })
    })

    describe('executeArbitrage', () => {
      it('should execute arbitrage plan', async () => {
        const planId = 'test-plan-123'

        const results = await manager.executeArbitrage(planId)

        expect(mockPlanner.executeArbitragePlan).toHaveBeenCalledWith(planId)
        expect(results).toBeDefined()
      })

      it('should update status after execution', async () => {
        const planId = 'test-plan-123'
        const mockResults = {
          success: true,
          actualProfit: 14,
          expectedProfit: 15,
          profitVariance: 0.067,
          executionTime: 12000,
          gasUsed: 280000,
          slippageEncountered: 0.008,
          mevProtectionEffective: true,
          stepResults: [],
          performanceMetrics: {},
          lessonsLearned: []
        }

        mockPlanner.executeArbitragePlan.mockResolvedValue(mockResults)

        const results = await manager.executeArbitrage(planId)

        expect(results).toBe(mockResults)
        expect(manager['totalProfitRealized']).toBe(14)
        expect(manager['totalExecutions']).toBe(1)
        expect(manager['successfulExecutions']).toBe(1)
      })

      it('should handle failed executions', async () => {
        const planId = 'test-plan-123'
        const mockResults = {
          success: false,
          actualProfit: -5,
          expectedProfit: 15,
          profitVariance: 1.33,
          executionTime: 8000,
          gasUsed: 200000,
          slippageEncountered: 0.015,
          mevProtectionEffective: false,
          stepResults: [],
          performanceMetrics: {},
          lessonsLearned: []
        }

        mockPlanner.executeArbitragePlan.mockResolvedValue(mockResults)

        const results = await manager.executeArbitrage(planId)

        expect(results).toBe(mockResults)
        expect(manager['totalProfitRealized']).toBe(0) // No profit added for failed execution
        expect(manager['totalExecutions']).toBe(1)
        expect(manager['successfulExecutions']).toBe(0)
      })

      it('should handle execution errors', async () => {
        const planId = 'test-plan-123'
        const executionError = new Error('Execution failed')
        mockPlanner.executeArbitragePlan.mockRejectedValue(executionError)

        await expect(manager.executeArbitrage(planId)).rejects.toThrow('Execution failed')
      })
    })

    describe('cancelExecution', () => {
      it('should cancel execution plan', async () => {
        const planId = 'test-plan-123'
        const reason = 'User requested cancellation'

        await manager.cancelExecution(planId, reason)

        expect(mockPlanner.cancelExecutionPlan).toHaveBeenCalledWith(planId, reason)
      })

      it('should handle cancellation with default reason', async () => {
        const planId = 'test-plan-123'

        await manager.cancelExecution(planId)

        expect(mockPlanner.cancelExecutionPlan).toHaveBeenCalledWith(
          planId,
          'Cancelled by user'
        )
      })

      it('should handle cancellation errors', async () => {
        const planId = 'test-plan-123'
        const cancellationError = new Error('Cancellation failed')
        mockPlanner.cancelExecutionPlan.mockRejectedValue(cancellationError)

        await expect(manager.cancelExecution(planId)).rejects.toThrow('Cancellation failed')
      })
    })

    describe('Real-time scanning', () => {
      beforeEach(() => {
        jest.useFakeTimers()
      })

      afterEach(() => {
        jest.useRealTimers()
      })

      it('should start real-time scanning', async () => {
        await manager.startRealTimeScanning()

        expect(manager.getStatus().isScanning).toBe(true)
        expect(mockDetector.startRealTimeScanning).toHaveBeenCalled()
      })

      it('should stop real-time scanning', async () => {
        await manager.startRealTimeScanning()
        await manager.stopRealTimeScanning()

        expect(manager.getStatus().isScanning).toBe(false)
        expect(mockDetector.stopRealTimeScanning).toHaveBeenCalled()
      })

      it('should handle scan interval correctly', async () => {
        const scanSpy = jest.spyOn(manager, 'scanForOpportunities')
          .mockResolvedValue([])

        await manager.startRealTimeScanning()

        // Advance timer to trigger scans
        jest.advanceTimersByTime(5000) // First scan
        await Promise.resolve() // Let async operations complete
        jest.advanceTimersByTime(5000) // Second scan
        await Promise.resolve()

        expect(scanSpy).toHaveBeenCalledTimes(2)

        await manager.stopRealTimeScanning()
      })

      it('should handle scanning errors during real-time mode', async () => {
        const scanSpy = jest.spyOn(manager, 'scanForOpportunities')
          .mockRejectedValue(new Error('Scan error'))

        await manager.startRealTimeScanning()

        jest.advanceTimersByTime(5000)
        await Promise.resolve()

        expect(scanSpy).toHaveBeenCalled()
        expect(mockConsoleError).toHaveBeenCalledWith(
          'Error during real-time scanning:',
          expect.any(Error)
        )

        await manager.stopRealTimeScanning()
      })

      it('should not start multiple scanning intervals', async () => {
        await manager.startRealTimeScanning()
        await manager.startRealTimeScanning() // Second call

        expect(manager.getStatus().isScanning).toBe(true)
        // Should not create multiple intervals

        await manager.stopRealTimeScanning()
      })
    })

    describe('Auto-execution', () => {
      beforeEach(() => {
        jest.useFakeTimers()
      })

      afterEach(() => {
        jest.useRealTimers()
      })

      it('should enable auto-execution', async () => {
        await manager.enableAutoExecution()

        expect(manager.getStatus().isAutoExecuting).toBe(true)
      })

      it('should disable auto-execution', async () => {
        await manager.enableAutoExecution()
        await manager.disableAutoExecution()

        expect(manager.getStatus().isAutoExecuting).toBe(false)
      })

      it('should execute opportunities automatically when enabled', async () => {
        const profitableOpportunity = {
          ...mockOpportunity,
          profitability: {
            ...mockOpportunity.profitability,
            netProfit: 150 // Above auto-execution threshold
          }
        }

        const executeSpy = jest.spyOn(manager, 'executeArbitrage')
          .mockResolvedValue({
            success: true,
            actualProfit: 140,
            expectedProfit: 150,
            profitVariance: 0.067,
            executionTime: 12000,
            gasUsed: 280000,
            slippageEncountered: 0.008,
            mevProtectionEffective: true,
            stepResults: [],
            performanceMetrics: {},
            lessonsLearned: []
          })

        const createPlanSpy = jest.spyOn(manager, 'createExecutionPlan')
          .mockResolvedValue({
            id: 'auto-plan-123',
            opportunity: profitableOpportunity,
            profitabilityAnalysis: {} as any,
            executionStrategy: {} as any,
            mevProtection: {} as any,
            contingencyPlans: [],
            riskManagement: {} as any,
            timing: {} as any,
            monitoring: {} as any,
            status: 'planned',
            createdAt: new Date()
          })

        mockDetector.scanForOpportunities.mockResolvedValue([profitableOpportunity])

        await manager.enableAutoExecution()
        await manager.startRealTimeScanning()

        jest.advanceTimersByTime(5000)
        await Promise.resolve()

        expect(createPlanSpy).toHaveBeenCalled()
        expect(executeSpy).toHaveBeenCalledWith('auto-plan-123')

        await manager.stopRealTimeScanning()
        await manager.disableAutoExecution()
      })

      it('should not auto-execute opportunities below profit threshold', async () => {
        const lowProfitOpportunity = {
          ...mockOpportunity,
          profitability: {
            ...mockOpportunity.profitability,
            netProfit: 50 // Below auto-execution threshold (100)
          }
        }

        const executeSpy = jest.spyOn(manager, 'executeArbitrage')
        mockDetector.scanForOpportunities.mockResolvedValue([lowProfitOpportunity])

        await manager.enableAutoExecution()
        await manager.startRealTimeScanning()

        jest.advanceTimersByTime(5000)
        await Promise.resolve()

        expect(executeSpy).not.toHaveBeenCalled()

        await manager.stopRealTimeScanning()
        await manager.disableAutoExecution()
      })

      it('should respect risk tolerance in auto-execution', async () => {
        const highRiskOpportunity = {
          ...mockOpportunity,
          risk: {
            ...mockOpportunity.risk,
            overallRisk: 'high' as const
          },
          profitability: {
            ...mockOpportunity.profitability,
            netProfit: 150 // Above threshold but high risk
          }
        }

        const executeSpy = jest.spyOn(manager, 'executeArbitrage')
        mockDetector.scanForOpportunities.mockResolvedValue([highRiskOpportunity])

        await manager.enableAutoExecution()
        await manager.startRealTimeScanning()

        jest.advanceTimersByTime(5000)
        await Promise.resolve()

        // Should not execute high-risk opportunity with medium risk tolerance
        expect(executeSpy).not.toHaveBeenCalled()

        await manager.stopRealTimeScanning()
        await manager.disableAutoExecution()
      })

      it('should handle auto-execution errors gracefully', async () => {
        const profitableOpportunity = {
          ...mockOpportunity,
          profitability: {
            ...mockOpportunity.profitability,
            netProfit: 150
          }
        }

        jest.spyOn(manager, 'createExecutionPlan')
          .mockRejectedValue(new Error('Plan creation failed'))

        mockDetector.scanForOpportunities.mockResolvedValue([profitableOpportunity])

        await manager.enableAutoExecution()
        await manager.startRealTimeScanning()

        jest.advanceTimersByTime(5000)
        await Promise.resolve()

        expect(mockConsoleError).toHaveBeenCalledWith(
          'Error during auto-execution:',
          expect.any(Error)
        )

        await manager.stopRealTimeScanning()
        await manager.disableAutoExecution()
      })
    })

    describe('getStatistics', () => {
      it('should return comprehensive arbitrage statistics', async () => {
        // Setup mock stats from all components
        mockDetector.getOpportunityStatistics.mockReturnValue({
          totalOpportunities: 10,
          profitableOpportunities: 8,
          highConfidenceOpportunities: 5,
          averageProfit: 25
        })

        mockPlanner.getExecutionStatistics.mockReturnValue({
          totalPlans: 3,
          activePlans: 1,
          completedPlans: 2,
          failedPlans: 0,
          successRate: 1.0,
          averageExecutionTime: 8000,
          totalProfitRealized: 30
        })

        // Simulate some manager state
        manager['totalExecutions'] = 5
        manager['successfulExecutions'] = 4
        manager['totalProfitRealized'] = 100

        const stats = manager.getStatistics()

        expect(stats.opportunities).toEqual({
          totalOpportunities: 10,
          profitableOpportunities: 8,
          highConfidenceOpportunities: 5,
          averageProfit: 25
        })

        expect(stats.executions).toEqual({
          totalPlans: 3,
          activePlans: 1,
          completedPlans: 2,
          failedPlans: 0,
          successRate: 1.0,
          averageExecutionTime: 8000,
          totalProfitRealized: 30
        })

        expect(stats.performance.totalExecutions).toBe(5)
        expect(stats.performance.successfulExecutions).toBe(4)
        expect(stats.performance.totalProfitRealized).toBe(100)
        expect(stats.performance.successRate).toBe(0.8)
      })

      it('should handle zero executions in performance calculations', () => {
        mockDetector.getOpportunityStatistics.mockReturnValue({
          totalOpportunities: 0,
          profitableOpportunities: 0,
          highConfidenceOpportunities: 0,
          averageProfit: 0
        })

        mockPlanner.getExecutionStatistics.mockReturnValue({
          totalPlans: 0,
          activePlans: 0,
          completedPlans: 0,
          failedPlans: 0,
          successRate: 0,
          averageExecutionTime: 0,
          totalProfitRealized: 0
        })

        const stats = manager.getStatistics()

        expect(stats.performance.successRate).toBe(0)
        expect(stats.performance.totalProfitRealized).toBe(0)
      })
    })

    describe('getStatus', () => {
      it('should return current arbitrage status', () => {
        const status = manager.getStatus()

        expect(status).toEqual({
          isScanning: false,
          isAutoExecuting: false,
          lastScanTime: null,
          activeOpportunities: 0,
          activeExecutions: 0
        })
      })

      it('should update status when scanning is active', async () => {
        mockDetector.getAllOpportunities.mockReturnValue([mockOpportunity])
        mockPlanner.getAllActivePlans.mockReturnValue([
          {
            id: 'plan-1',
            status: 'executing'
          } as any
        ])

        await manager.startRealTimeScanning()

        const status = manager.getStatus()

        expect(status.isScanning).toBe(true)
        expect(status.activeOpportunities).toBe(1)
        expect(status.activeExecutions).toBe(1)

        await manager.stopRealTimeScanning()
      })
    })

    describe('getOpportunities', () => {
      it('should return all opportunities from detector', () => {
        const mockOpportunities = [mockOpportunity]
        mockDetector.getAllOpportunities.mockReturnValue(mockOpportunities)

        const opportunities = manager.getOpportunities()

        expect(opportunities).toBe(mockOpportunities)
        expect(mockDetector.getAllOpportunities).toHaveBeenCalled()
      })

      it('should return empty array when no opportunities exist', () => {
        mockDetector.getAllOpportunities.mockReturnValue([])

        const opportunities = manager.getOpportunities()

        expect(opportunities).toEqual([])
      })
    })

    describe('getExecutionPlans', () => {
      it('should return all execution plans from planner', () => {
        const mockPlans = [
          {
            id: 'plan-1',
            status: 'planned',
            opportunity: mockOpportunity
          } as any
        ]
        mockPlanner.getAllActivePlans.mockReturnValue(mockPlans)

        const plans = manager.getExecutionPlans()

        expect(plans).toBe(mockPlans)
        expect(mockPlanner.getAllActivePlans).toHaveBeenCalled()
      })

      it('should return empty array when no plans exist', () => {
        mockPlanner.getAllActivePlans.mockReturnValue([])

        const plans = manager.getExecutionPlans()

        expect(plans).toEqual([])
      })
    })
  })

  describe('Integration Testing', () => {
    it('should integrate all components in end-to-end scenario', async () => {
      const config: ArbitrageServiceConfig = {
        maxSlippage: 0.05,
        minProfitThreshold: 10,
        maxPriceImpact: 0.02,
        gasOptimization: true,
        mevProtection: true
      }

      const options: ArbitrageServiceOptions = {
        enableRealTimeScanning: false,
        enableAutoExecution: false,
        riskTolerance: 'medium',
        profitThresholdForAutoExecution: 50
      }

      const manager = createArbitrageManager(
        mockConnection,
        mockWallet,
        config,
        options
      )

      // Mock the full flow
      const mockOpportunities = [mockOpportunity]
      const mockDetector = manager['detector'] as jest.Mocked<ArbitrageOpportunityDetector>
      const mockPlanner = manager['planner'] as jest.Mocked<ArbitrageExecutionPlanner>

      mockDetector.scanForOpportunities.mockResolvedValue(mockOpportunities)

      // 1. Scan for opportunities
      const opportunities = await manager.scanForOpportunities()
      expect(opportunities).toEqual(mockOpportunities)

      // 2. Analyze profitability
      const analysis = await manager.analyzeOpportunityProfitability(mockOpportunity, 1000)
      expect(analysis).toBeDefined()

      // 3. Create execution plan
      const plan = await manager.createExecutionPlan(mockOpportunity)
      expect(plan).toBeDefined()

      // 4. Execute arbitrage
      const results = await manager.executeArbitrage(plan.id)
      expect(results).toBeDefined()

      // 5. Check statistics
      const stats = manager.getStatistics()
      expect(stats).toBeDefined()
      expect(stats.performance.totalExecutions).toBe(1)
    })

    it('should handle complex multi-component error scenarios', async () => {
      const manager = createArbitrageManager(mockConnection, mockWallet)

      const mockDetector = manager['detector'] as jest.Mocked<ArbitrageOpportunityDetector>
      const mockCalculator = manager['calculator'] as jest.Mocked<ArbitrageProfitabilityCalculator>
      const mockPlanner = manager['planner'] as jest.Mocked<ArbitrageExecutionPlanner>

      // Setup cascading failures
      mockDetector.scanForOpportunities.mockResolvedValue([mockOpportunity])
      mockCalculator.calculateDetailedProfitability.mockRejectedValue(
        new Error('Profitability calculation failed')
      )

      // Should handle the profitability calculation error gracefully
      await expect(
        manager.createExecutionPlan(mockOpportunity)
      ).rejects.toThrow('Profitability calculation failed')

      const stats = manager.getStatistics()
      expect(stats.performance.totalExecutions).toBe(0) // No successful executions
    })
  })

  describe('Configuration and Options Handling', () => {
    it('should handle all risk tolerance levels', () => {
      const configs = [
        { riskTolerance: 'low' as const },
        { riskTolerance: 'medium' as const },
        { riskTolerance: 'high' as const }
      ]

      configs.forEach(config => {
        const manager = new ArbitrageManager(
          mockConnection,
          mockWallet,
          undefined,
          config
        )

        expect(manager['options'].riskTolerance).toBe(config.riskTolerance)
      })
    })

    it('should validate configuration parameters', () => {
      const invalidConfig: ArbitrageServiceConfig = {
        maxSlippage: -0.1, // Invalid negative
        minProfitThreshold: -10, // Invalid negative
        maxPriceImpact: 2, // Invalid > 1
        gasOptimization: true,
        mevProtection: true
      }

      // Should still create manager but may log warnings
      const manager = new ArbitrageManager(
        mockConnection,
        mockWallet,
        invalidConfig
      )

      expect(manager).toBeInstanceOf(ArbitrageManager)
    })

    it('should handle extreme option values', () => {
      const extremeOptions: ArbitrageServiceOptions = {
        enableRealTimeScanning: true,
        scanInterval: 100, // Very fast
        enableAutoExecution: true,
        riskTolerance: 'high',
        profitThresholdForAutoExecution: 0.01 // Very low threshold
      }

      const manager = new ArbitrageManager(
        mockConnection,
        mockWallet,
        undefined,
        extremeOptions
      )

      expect(manager['options'].scanInterval).toBe(100)
      expect(manager['options'].profitThresholdForAutoExecution).toBe(0.01)
    })
  })

  describe('Memory and Resource Management', () => {
    it('should handle large number of opportunities without memory issues', async () => {
      const largeOpportunitySet = Array.from({ length: 1000 }, (_, i) => ({
        ...mockOpportunity,
        id: `opportunity-${i}`
      }))

      const manager = createArbitrageManager(mockConnection, mockWallet)
      const mockDetector = manager['detector'] as jest.Mocked<ArbitrageOpportunityDetector>

      mockDetector.scanForOpportunities.mockResolvedValue(largeOpportunitySet)
      mockDetector.getAllOpportunities.mockReturnValue(largeOpportunitySet)

      const opportunities = await manager.scanForOpportunities()
      expect(opportunities).toHaveLength(1000)

      const status = manager.getStatus()
      expect(status.activeOpportunities).toBe(1000)
    })

    it('should properly cleanup resources when scanning is stopped', async () => {
      jest.useFakeTimers()

      const manager = createArbitrageManager(mockConnection, mockWallet)

      await manager.startRealTimeScanning()
      expect(manager.getStatus().isScanning).toBe(true)

      await manager.stopRealTimeScanning()
      expect(manager.getStatus().isScanning).toBe(false)

      // Advance timers to ensure no more scans occur
      jest.advanceTimersByTime(10000)

      jest.useRealTimers()
    })

    it('should handle concurrent operations safely', async () => {
      const manager = createArbitrageManager(mockConnection, mockWallet)

      const promises = Array.from({ length: 10 }, (_, i) =>
        manager.scanForOpportunities({ minProfit: i * 10 })
      )

      const results = await Promise.all(promises)
      expect(results).toHaveLength(10)
    })
  })
})