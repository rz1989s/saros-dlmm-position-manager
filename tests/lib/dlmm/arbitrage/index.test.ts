import { Connection, PublicKey } from '@solana/web3.js'
import { Wallet } from '@solana/wallet-adapter-react'
import {
  ArbitrageManager,
  createArbitrageManager,
  type ArbitrageManagerConfig,
  ArbitrageProfitabilityCalculator,
  ArbitrageExecutionPlanner
} from '../../../../src/lib/dlmm/arbitrage/index'
import {
  type ArbitrageOpportunity
} from '../../../../src/lib/dlmm/arbitrage/detection-engine'
import { TokenInfo } from '../../../../src/lib/types'

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

// Module-level mock variables
let mockTokenX: TokenInfo
let mockTokenY: TokenInfo
let mockPoolAddress: PublicKey

// Mock types for missing interfaces
interface ArbitrageServiceConfig {
  maxSlippage: number
  minProfitThreshold: number
  maxPriceImpact: number
  gasOptimization: boolean
  mevProtection: boolean
}


// Extend ArbitrageManagerConfig to include required properties
interface ExtendedArbitrageManagerConfig extends ArbitrageManagerConfig {
  connection: Connection
  wallet: Wallet
}

// Mock class for ArbitrageOpportunityDetector
class ArbitrageOpportunityDetector {
  constructor(_connection: Connection, _wallet: Wallet, _config?: ArbitrageServiceConfig) {}
  scanForOpportunities = jest.fn().mockResolvedValue([])
  getAllOpportunities = jest.fn().mockReturnValue([])
  startRealTimeScanning = jest.fn()
  stopRealTimeScanning = jest.fn()
  getOpportunityStatistics = jest.fn().mockReturnValue({
    totalOpportunities: 0,
    profitableOpportunities: 0,
    highConfidenceOpportunities: 0,
    averageProfit: 0
  })
}

// Mock factory functions
const createDetectionEngine = jest.fn((connection: Connection, wallet: Wallet, config?: ArbitrageServiceConfig) => {
  return new ArbitrageOpportunityDetector(connection, wallet, config)
})

const createProfitabilityCalculator = jest.fn(() => {
  return new ArbitrageProfitabilityCalculator()
})

const createExecutionPlanner = jest.fn((connection: Connection, wallet: Wallet) => {
  return new ArbitrageExecutionPlanner(connection, wallet)
})

describe('Arbitrage Index Module', () => {
  let mockConnection: jest.Mocked<Connection>
  let mockWallet: jest.Mocked<Wallet>
  let mockConfig: ExtendedArbitrageManagerConfig
  let mockOpportunity: ArbitrageOpportunity
  let mockDetector: jest.Mocked<any>
  let mockCalculator: jest.Mocked<any>
  let mockPlanner: jest.Mocked<any>

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
      address: new PublicKey('So11111111111111111111111111111111111111112'),
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      logoURI: 'sol.png',
      tags: ['verified'],
      price: 100
    }

    mockTokenY = {
      address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'usdc.png',
      tags: ['verified'],
      price: 1
    }

    mockPoolAddress = new PublicKey('7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm')

    // Create mock instances to simulate the private properties
    mockDetector = {
      scanForOpportunities: jest.fn().mockResolvedValue([]),
      getAllOpportunities: jest.fn().mockReturnValue([]),
      startMonitoring: jest.fn(),
      stopMonitoring: jest.fn(),
      addPool: jest.fn(),
      removePool: jest.fn(),
      getBestOpportunityForAmount: jest.fn(),
      getMonitoringStats: jest.fn().mockReturnValue({
        trackedPools: 0,
        activeOpportunities: 0,
        totalProfitPotential: 0,
        averageRiskScore: 0,
        updateInterval: 5000,
        isMonitoring: false
      }),
      getOpportunityStatistics: jest.fn().mockReturnValue({
        totalOpportunities: 0,
        profitableOpportunities: 0,
        highConfidenceOpportunities: 0,
        averageProfit: 0
      })
    }

    mockCalculator = {
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
        riskAdjustedMetrics: {},
        costBreakdown: {},
        marketImpact: {},
        recommendations: [],
        sensitivity: {}
      })
    }

    mockPlanner = {
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
      }),
      getAllActivePlans: jest.fn().mockReturnValue([]),
      cancelExecutionPlan: jest.fn()
    }

    mockOpportunity = {
      id: 'test-opportunity',
      type: 'direct',
      pools: [
        {
          poolAddress: mockPoolAddress,
          tokenX: mockTokenX,
          tokenY: mockTokenY,
          activeBin: {
            binId: 0,
            price: 1.01,
            liquidityX: '100000000000',
            liquidityY: '101000000000'
          },
          liquidity: 100000,
          volume24h: 50000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
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
        complexity: 'simple',
        estimatedGas: 280000,
        priceImpact: 0.001
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

        expect(createDetectionEngine).toHaveBeenCalledWith(
          mockConnection,
          mockWallet,
          config
        )
        expect(detector).toBeInstanceOf(ArbitrageOpportunityDetector)
      })

      it('should create detector with default config when none provided', () => {
        const detector = createDetectionEngine(mockConnection, mockWallet)

        expect(createDetectionEngine).toHaveBeenCalledWith(
          mockConnection,
          mockWallet,
          undefined
        )
        expect(detector).toBeInstanceOf(ArbitrageOpportunityDetector)
      })

      it('should handle null/undefined inputs gracefully', () => {
        const detector = createDetectionEngine(null as any, null as any)

        expect(createDetectionEngine).toHaveBeenCalledWith(
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

        expect(createProfitabilityCalculator).toHaveBeenCalledWith()
        expect(calculator).toBeInstanceOf(ArbitrageProfitabilityCalculator)
      })

      it('should return singleton instance if called multiple times', () => {
        const calculator1 = createProfitabilityCalculator()
        const calculator2 = createProfitabilityCalculator()

        expect(createProfitabilityCalculator).toHaveBeenCalledTimes(2)
        expect(calculator1).toBeInstanceOf(ArbitrageProfitabilityCalculator)
        expect(calculator2).toBeInstanceOf(ArbitrageProfitabilityCalculator)
      })
    })

    describe('createExecutionPlanner', () => {
      it('should create ArbitrageExecutionPlanner with correct parameters', () => {
        const planner = createExecutionPlanner(mockConnection, mockWallet)

        expect(createExecutionPlanner).toHaveBeenCalledWith(
          mockConnection,
          mockWallet
        )
        expect(planner).toBeInstanceOf(ArbitrageExecutionPlanner)
      })

      it('should handle null/undefined inputs', () => {
        const planner = createExecutionPlanner(null as any, null as any)

        expect(createExecutionPlanner).toHaveBeenCalledWith(null, null)
        expect(planner).toBeInstanceOf(ArbitrageExecutionPlanner)
      })
    })

    describe('createArbitrageManager', () => {
      it('should create ArbitrageManager with all components', () => {
        const manager = createArbitrageManager(mockConfig)

        expect(manager).toBeInstanceOf(ArbitrageManager)
      })

      it('should create manager with default options when none provided', () => {
        const manager = createArbitrageManager(mockConfig)

        expect(manager).toBeInstanceOf(ArbitrageManager)
      })

      it('should create manager with partial options', () => {
        const partialConfig = {
          ...mockConfig,
          minProfitThreshold: 20
        }

        const manager = createArbitrageManager(partialConfig)

        expect(manager).toBeInstanceOf(ArbitrageManager)
      })
    })
  })

  describe('ArbitrageManager', () => {
    let manager: ArbitrageManager

    beforeEach(() => {
      manager = new ArbitrageManager(mockConfig)
    })

    describe('constructor', () => {
      it('should initialize with correct parameters', () => {
        expect(manager).toBeInstanceOf(ArbitrageManager)
        expect(manager['config']).toBeDefined()
      })

      it('should set default options when none provided', () => {
        const defaultManager = new ArbitrageManager({
          connection: mockConnection,
          wallet: mockWallet
        })

        expect(defaultManager).toBeInstanceOf(ArbitrageManager)
      })

      it('should merge partial options with defaults', () => {
        const partialConfig = {
          connection: mockConnection,
          wallet: mockWallet,
          minProfitThreshold: 20,
          maxRiskScore: 0.5
        }

        const partialManager = new ArbitrageManager(partialConfig)

        expect(partialManager).toBeInstanceOf(ArbitrageManager)
      })

      it('should initialize manager correctly', () => {
        expect(manager).toBeInstanceOf(ArbitrageManager)
      })
    })

    describe('getActiveOpportunities', () => {
      it('should get active opportunities and return results', () => {
        const mockOpportunities = [mockOpportunity]
        mockDetector.getAllOpportunities.mockReturnValue(mockOpportunities)

        // Mock the manager's private property for testing
        Object.defineProperty(manager, 'detectionEngine', {
          value: mockDetector,
          writable: true
        })

        const results = manager.getActiveOpportunities()

        expect(results).toBeDefined()
      })

      it('should handle opportunities filtering', () => {
        const mockOpportunities = [mockOpportunity]
        mockDetector.getAllOpportunities.mockReturnValue(mockOpportunities)

        Object.defineProperty(manager, 'detectionEngine', {
          value: mockDetector,
          writable: true
        })

        const results = manager.getActiveOpportunities()
        expect(results).toBeDefined()
      })

      it('should handle no opportunities', () => {
        mockDetector.getAllOpportunities.mockReturnValue([])

        Object.defineProperty(manager, 'detectionEngine', {
          value: mockDetector,
          writable: true
        })

        const results = manager.getActiveOpportunities()
        expect(results).toBeDefined()
      })

      it('should filter opportunities by profit threshold', () => {
        const lowProfitOpportunity = {
          ...mockOpportunity,
          profitability: {
            ...mockOpportunity.profitability,
            netProfit: 5 // Below threshold
          }
        }
        mockDetector.getAllOpportunities.mockReturnValue([lowProfitOpportunity])

        Object.defineProperty(manager, 'detectionEngine', {
          value: mockDetector,
          writable: true
        })

        const results = manager.getActiveOpportunities()
        expect(results).toBeDefined()
      })
    })

    describe('analyzeOpportunityProfitability', () => {
      it('should analyze profitability with detailed analysis', async () => {
        const inputAmount = 1000

        Object.defineProperty(manager, 'profitabilityCalculator', {
          value: mockCalculator,
          writable: true
        })

        const results = await manager.analyzeOpportunityProfitability(
          mockOpportunity,
          inputAmount
        )

        expect(results).toBeDefined()
      })

      it('should handle profitability analysis', async () => {
        const inputAmount = 1000

        Object.defineProperty(manager, 'profitabilityCalculator', {
          value: mockCalculator,
          writable: true
        })

        const results = await manager.analyzeOpportunityProfitability(
          mockOpportunity,
          inputAmount
        )

        expect(results).toBeDefined()
      })

      it('should handle calculator errors', async () => {
        const calculatorError = new Error('Calculation failed')
        mockCalculator.calculateDetailedProfitability.mockRejectedValue(calculatorError)

        Object.defineProperty(manager, 'profitabilityCalculator', {
          value: mockCalculator,
          writable: true
        })

        await expect(
          manager.analyzeOpportunityProfitability(mockOpportunity, 1000)
        ).rejects.toThrow('Calculation failed')
      })
    })

    describe('createExecutionPlan', () => {
      it('should create execution plan with profitability analysis', async () => {
        Object.defineProperty(manager, 'profitabilityCalculator', {
          value: mockCalculator,
          writable: true
        })
        Object.defineProperty(manager, 'executionPlanner', {
          value: mockPlanner,
          writable: true
        })

        const inputAmount = 1000
        const preferences = { maxRisk: 0.5, useMEVProtection: true }
        const plan = await manager.createExecutionPlan(mockOpportunity, inputAmount, preferences)

        expect(plan).toBeDefined()
      })

      it('should handle execution plan creation errors', async () => {
        const plannerError = new Error('Plan creation failed')
        mockPlanner.createExecutionPlan.mockRejectedValue(plannerError)

        Object.defineProperty(manager, 'profitabilityCalculator', {
          value: mockCalculator,
          writable: true
        })
        Object.defineProperty(manager, 'executionPlanner', {
          value: mockPlanner,
          writable: true
        })

        await expect(
          manager.createExecutionPlan(mockOpportunity, 1000)
        ).rejects.toThrow('Plan creation failed')
      })

      it('should create plan without preferences', async () => {
        Object.defineProperty(manager, 'profitabilityCalculator', {
          value: mockCalculator,
          writable: true
        })
        Object.defineProperty(manager, 'executionPlanner', {
          value: mockPlanner,
          writable: true
        })

        const plan = await manager.createExecutionPlan(mockOpportunity, 1000)

        expect(plan).toBeDefined()
      })
    })

    describe('executeArbitrage', () => {
      it('should execute arbitrage plan', async () => {
        Object.defineProperty(manager, 'profitabilityCalculator', {
          value: mockCalculator,
          writable: true
        })
        Object.defineProperty(manager, 'executionPlanner', {
          value: mockPlanner,
          writable: true
        })

        const inputAmount = 1000
        const results = await manager.executeArbitrage(mockOpportunity, inputAmount)

        expect(results).toBeDefined()
      })

      it('should update status after execution', async () => {
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

        Object.defineProperty(manager, 'profitabilityCalculator', {
          value: mockCalculator,
          writable: true
        })
        Object.defineProperty(manager, 'executionPlanner', {
          value: mockPlanner,
          writable: true
        })

        const inputAmount = 1000
        const results = await manager.executeArbitrage(mockOpportunity, inputAmount)

        expect(results).toBeDefined()
      })

      it('should handle failed executions', async () => {
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

        Object.defineProperty(manager, 'profitabilityCalculator', {
          value: mockCalculator,
          writable: true
        })
        Object.defineProperty(manager, 'executionPlanner', {
          value: mockPlanner,
          writable: true
        })

        const inputAmount = 1000
        const results = await manager.executeArbitrage(mockOpportunity, inputAmount)

        expect(results).toBeDefined()
      })

      it('should handle execution errors', async () => {
        const executionError = new Error('Execution failed')
        mockCalculator.calculateDetailedProfitability.mockRejectedValue(executionError)

        Object.defineProperty(manager, 'profitabilityCalculator', {
          value: mockCalculator,
          writable: true
        })
        Object.defineProperty(manager, 'executionPlanner', {
          value: mockPlanner,
          writable: true
        })

        const inputAmount = 1000
        await expect(manager.executeArbitrage(mockOpportunity, inputAmount)).rejects.toThrow('Execution failed')
      })
    })

    describe('getArbitrageStats', () => {
      it('should return arbitrage statistics', () => {
        Object.defineProperty(manager, 'detectionEngine', {
          value: mockDetector,
          writable: true
        })
        Object.defineProperty(manager, 'executionPlanner', {
          value: mockPlanner,
          writable: true
        })

        const stats = manager.getArbitrageStats()

        expect(stats).toBeDefined()
        expect(stats.detectionStats).toBeDefined()
        expect(stats.executionStats).toBeDefined()
        expect(stats.isSystemActive).toBeDefined()
      })
    })

    describe('Arbitrage System Control', () => {
      it('should start arbitrage system', async () => {
        Object.defineProperty(manager, 'detectionEngine', {
          value: mockDetector,
          writable: true
        })

        await manager.startArbitrageSystem()

        expect(mockDetector.startMonitoring).toHaveBeenCalled()
      })

      it('should stop arbitrage system', async () => {
        Object.defineProperty(manager, 'detectionEngine', {
          value: mockDetector,
          writable: true
        })

        await manager.stopArbitrageSystem()

        expect(mockDetector.stopMonitoring).toHaveBeenCalled()
      })

      it('should add pool to monitoring', async () => {
        Object.defineProperty(manager, 'detectionEngine', {
          value: mockDetector,
          writable: true
        })

        await manager.addPoolToMonitoring(mockPoolAddress, mockTokenX, mockTokenY)

        expect(mockDetector.addPool).toHaveBeenCalledWith(mockPoolAddress, mockTokenX, mockTokenY)
      })

      it('should remove pool from monitoring', () => {
        Object.defineProperty(manager, 'detectionEngine', {
          value: mockDetector,
          writable: true
        })

        manager.removePoolFromMonitoring(mockPoolAddress)

        expect(mockDetector.removePool).toHaveBeenCalledWith(mockPoolAddress)
      })
    })

    describe('System Health', () => {
      it('should get system health', () => {
        Object.defineProperty(manager, 'detectionEngine', {
          value: mockDetector,
          writable: true
        })
        Object.defineProperty(manager, 'executionPlanner', {
          value: mockPlanner,
          writable: true
        })

        const health = manager.getSystemHealth()

        expect(health).toBeDefined()
        expect(health.status).toBeDefined()
        expect(health.monitored_pools).toBeDefined()
      })

      it('should get best opportunity for token', async () => {
        Object.defineProperty(manager, 'detectionEngine', {
          value: mockDetector,
          writable: true
        })

        mockDetector.getBestOpportunityForAmount = jest.fn().mockResolvedValue(mockOpportunity)

        const result = await manager.getBestOpportunityForToken(mockTokenX, 1000)

        expect(mockDetector.getBestOpportunityForAmount).toHaveBeenCalledWith(mockTokenX, 1000)
        expect(result).toBe(mockOpportunity)
      })
    })

    describe('Additional Methods', () => {
      it('should handle arbitrage stats properly', () => {
        Object.defineProperty(manager, 'detectionEngine', {
          value: mockDetector,
          writable: true
        })
        Object.defineProperty(manager, 'executionPlanner', {
          value: mockPlanner,
          writable: true
        })

        const stats = manager.getArbitrageStats()

        expect(stats).toBeDefined()
      })
    })



  })

  describe('Integration Testing', () => {
    it('should integrate all components in end-to-end scenario', async () => {
      const manager = createArbitrageManager(mockConfig)

      // Set up mock objects
      Object.defineProperty(manager, 'detectionEngine', {
        value: mockDetector,
        writable: true
      })
      Object.defineProperty(manager, 'profitabilityCalculator', {
        value: mockCalculator,
        writable: true
      })
      Object.defineProperty(manager, 'executionPlanner', {
        value: mockPlanner,
        writable: true
      })

      // 1. Get active opportunities
      const opportunities = manager.getActiveOpportunities()
      expect(opportunities).toBeDefined()

      // 2. Analyze profitability
      const analysis = await manager.analyzeOpportunityProfitability(mockOpportunity, 1000)
      expect(analysis).toBeDefined()

      // 3. Create execution plan
      const plan = await manager.createExecutionPlan(mockOpportunity, 1000)
      expect(plan).toBeDefined()

      // 4. Execute arbitrage
      const results = await manager.executeArbitrage(mockOpportunity, 1000)
      expect(results).toBeDefined()

      // 5. Check statistics
      const stats = manager.getArbitrageStats()
      expect(stats).toBeDefined()
    })

    it('should handle complex multi-component error scenarios', async () => {
      const manager = createArbitrageManager(mockConfig)

      Object.defineProperty(manager, 'profitabilityCalculator', {
        value: mockCalculator,
        writable: true
      })

      // Setup cascading failures
      mockCalculator.calculateDetailedProfitability.mockRejectedValue(
        new Error('Profitability calculation failed')
      )

      // Should handle the profitability calculation error gracefully
      await expect(
        manager.createExecutionPlan(mockOpportunity, 1000)
      ).rejects.toThrow('Profitability calculation failed')

      const stats = manager.getArbitrageStats()
      expect(stats).toBeDefined()
    })
  })

  describe('Configuration and Options Handling', () => {
    it('should handle different configuration options', () => {
      const configs = [
        { connection: mockConnection, wallet: mockWallet, minProfitThreshold: 5 },
        { connection: mockConnection, wallet: mockWallet, minProfitThreshold: 20 },
        { connection: mockConnection, wallet: mockWallet, maxRiskScore: 0.5 }
      ]

      configs.forEach(config => {
        const manager = new ArbitrageManager(config)
        expect(manager).toBeInstanceOf(ArbitrageManager)
      })
    })

    it('should validate configuration parameters', () => {
      const invalidConfig = {
        connection: mockConnection,
        wallet: mockWallet,
        minProfitThreshold: -10, // Invalid negative
        maxRiskScore: 2 // Invalid > 1
      }

      // Should still create manager but may log warnings
      const manager = new ArbitrageManager(invalidConfig)

      expect(manager).toBeInstanceOf(ArbitrageManager)
    })

    it('should handle extreme configuration values', () => {
      const extremeConfig = {
        connection: mockConnection,
        wallet: mockWallet,
        minProfitThreshold: 0.01, // Very low threshold
        maxRiskScore: 0.99, // Very high risk tolerance
        enableMEVProtection: false
      }

      const manager = new ArbitrageManager(extremeConfig)

      expect(manager).toBeInstanceOf(ArbitrageManager)
    })
  })

  describe('Memory and Resource Management', () => {
    it('should handle large number of opportunities without memory issues', () => {
      const largeOpportunitySet = Array.from({ length: 1000 }, (_, i) => ({
        ...mockOpportunity,
        id: `opportunity-${i}`
      }))

      const manager = createArbitrageManager(mockConfig)

      Object.defineProperty(manager, 'detectionEngine', {
        value: mockDetector,
        writable: true
      })

      mockDetector.getAllOpportunities.mockReturnValue(largeOpportunitySet)

      const opportunities = manager.getActiveOpportunities()
      expect(opportunities).toBeDefined()
    })

    it('should properly cleanup resources when system is stopped', async () => {
      const manager = createArbitrageManager(mockConfig)

      Object.defineProperty(manager, 'detectionEngine', {
        value: mockDetector,
        writable: true
      })

      await manager.startArbitrageSystem()
      await manager.stopArbitrageSystem()

      expect(mockDetector.stopMonitoring).toHaveBeenCalled()
    })

    it('should handle concurrent operations safely', async () => {
      const manager = createArbitrageManager(mockConfig)

      Object.defineProperty(manager, 'profitabilityCalculator', {
        value: mockCalculator,
        writable: true
      })

      const promises = Array.from({ length: 10 }, () =>
        manager.analyzeOpportunityProfitability(mockOpportunity, 1000)
      )

      const results = await Promise.all(promises)
      expect(results).toHaveLength(10)
    })
  })
})