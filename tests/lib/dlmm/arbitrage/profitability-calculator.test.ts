import {
  ArbitrageProfitabilityCalculator,
  DetailedProfitabilityAnalysis,
  ProfitabilityScenario,
  RiskAdjustedProfitability,
  CostBreakdown,
  MarketImpactAnalysis,
  ProfitabilityRecommendation,
  SensitivityAnalysis,
  TransactionCost,
  SlippageImpact,
  LiquidityAnalysis,
  CompetitionAnalysis,
  TemporalDecayAnalysis,
  PriceImpactTier
} from '../../../../src/lib/dlmm/arbitrage/profitability-calculator'
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
import { PublicKey } from '@solana/web3.js'
import { BinData } from '@saros-finance/dlmm-sdk'
import { TokenInfo } from '../../../../src/lib/types'

// Mock external dependencies
jest.mock('@solana/web3.js', () => ({
  PublicKey: jest.fn().mockImplementation((key: string) => ({
    toString: () => key,
    equals: jest.fn((other) => key === other.toString())
  }))
}))

describe('ArbitrageProfitabilityCalculator', () => {
  let calculator: ArbitrageProfitabilityCalculator
  let mockOpportunity: ArbitrageOpportunity
  let mockTokenX: TokenInfo
  let mockTokenY: TokenInfo
  let mockPoolAddress: PublicKey

  beforeEach(() => {
    calculator = new ArbitrageProfitabilityCalculator()

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

    const mockRoute: RouteStep[] = [
      {
        poolAddress: mockPoolAddress,
        tokenIn: mockTokenX,
        tokenOut: mockTokenY,
        amountIn: 1000,
        amountOut: 1010,
        priceImpact: 0.001,
        binRange: { min: -10, max: 10 }
      },
      {
        poolAddress: mockPoolAddress,
        tokenIn: mockTokenY,
        tokenOut: mockTokenX,
        amountIn: 1010,
        amountOut: 1020,
        priceImpact: 0.001,
        binRange: { min: -8, max: 12 }
      }
    ]

    mockOpportunity = {
      id: 'test-opportunity',
      type: 'direct',
      pools: [mockPool],
      path: {
        inputToken: mockTokenX,
        outputToken: mockTokenX,
        route: mockRoute,
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
  })

  describe('constructor', () => {
    it('should initialize with correct default values', () => {
      expect(calculator).toBeInstanceOf(ArbitrageProfitabilityCalculator)

      // Test private constants by observing their effects
      const gasPrice = (calculator as any).GAS_PRICE_SOL
      expect(typeof gasPrice).toBe('number')
      expect(gasPrice).toBeGreaterThan(0)
    })

    it('should have correct compute unit constants', () => {
      const swapUnits = (calculator as any).COMPUTE_UNITS_PER_SWAP
      const addLiquidityUnits = (calculator as any).COMPUTE_UNITS_PER_ADD_LIQUIDITY
      const removeLiquidityUnits = (calculator as any).COMPUTE_UNITS_PER_REMOVE_LIQUIDITY

      expect(swapUnits).toBe(200000)
      expect(addLiquidityUnits).toBe(300000)
      expect(removeLiquidityUnits).toBe(250000)
    })

    it('should have correct MEV and slippage constants', () => {
      const mevCost = (calculator as any).MEV_PROTECTION_BASE_COST
      const slippageBuffer = (calculator as any).SLIPPAGE_BUFFER

      expect(mevCost).toBe(0.01)
      expect(slippageBuffer).toBe(1.2)
    })
  })

  describe('calculateDetailedProfitability', () => {
    it('should calculate complete profitability analysis', async () => {
      const inputAmount = 1000
      const analysis = await calculator.calculateDetailedProfitability(mockOpportunity, inputAmount)

      expect(analysis).toBeDefined()
      expect(analysis.baseAnalysis).toBeDefined()
      expect(analysis.scenarios).toBeInstanceOf(Array)
      expect(analysis.scenarios.length).toBeGreaterThan(0)
      expect(analysis.riskAdjustedMetrics).toBeDefined()
      expect(analysis.costBreakdown).toBeDefined()
      expect(analysis.marketImpact).toBeDefined()
      expect(analysis.recommendations).toBeInstanceOf(Array)
      expect(analysis.sensitivity).toBeDefined()
    })

    it('should handle different input amounts correctly', async () => {
      const smallAmount = 100
      const largeAmount = 10000

      const smallAnalysis = await calculator.calculateDetailedProfitability(mockOpportunity, smallAmount)
      const largeAnalysis = await calculator.calculateDetailedProfitability(mockOpportunity, largeAmount)

      expect(smallAnalysis.baseAnalysis.grossProfit).not.toEqual(largeAnalysis.baseAnalysis.grossProfit)
      expect(smallAnalysis.costBreakdown.capitalRequirement).toBe(smallAmount)
      expect(largeAnalysis.costBreakdown.capitalRequirement).toBe(largeAmount)
    })

    it('should handle market conditions parameter', async () => {
      const inputAmount = 1000
      const marketConditions = {
        gasPrice: 0.00001,
        volatilityMultiplier: 1.5,
        competitionLevel: 'high' as const,
        liquidityConditions: 'excellent' as const
      }

      const analysis = await calculator.calculateDetailedProfitability(
        mockOpportunity,
        inputAmount,
        marketConditions
      )

      expect(analysis).toBeDefined()
      expect(analysis.baseAnalysis).toBeDefined()
    })

    it('should handle empty market conditions', async () => {
      const inputAmount = 1000
      const emptyConditions = {}

      const analysis = await calculator.calculateDetailedProfitability(
        mockOpportunity,
        inputAmount,
        emptyConditions
      )

      expect(analysis).toBeDefined()
      expect(analysis.baseAnalysis).toBeDefined()
    })
  })

  describe('calculateBaseProfitability', () => {
    it('should calculate base profitability metrics correctly', async () => {
      const inputAmount = 1000
      const metrics = await calculator.calculateBaseProfitability(mockOpportunity, inputAmount)

      expect(metrics.grossProfit).toBeGreaterThan(0)
      expect(metrics.netProfit).toBeLessThan(metrics.grossProfit)
      expect(metrics.profitMargin).toBe(metrics.netProfit / inputAmount)
      expect(metrics.returnOnInvestment).toBe(metrics.netProfit / inputAmount)
      expect(metrics.gasCosts).toBeGreaterThan(0)
      expect(metrics.priorityFees).toBeGreaterThan(0)
      expect(metrics.breakevenAmount).toBeGreaterThan(0)
      expect(metrics.maxProfitableAmount).toBeGreaterThan(metrics.breakevenAmount)
    })

    it('should calculate costs accurately', async () => {
      const inputAmount = 1000
      const metrics = await calculator.calculateBaseProfitability(mockOpportunity, inputAmount)

      const expectedGasCostPerStep = 200000 * 0.000005 // COMPUTE_UNITS_PER_SWAP * GAS_PRICE_SOL
      const expectedTotalGasCost = expectedGasCostPerStep * 2 // 2 steps
      const expectedPriorityFees = expectedTotalGasCost * 0.5
      const expectedMevCost = inputAmount * 0.01

      expect(metrics.gasCosts).toBe(expectedTotalGasCost + expectedPriorityFees)
      expect(metrics.priorityFees).toBe(expectedPriorityFees)
    })

    it('should handle different step actions', async () => {
      const opportunityWithDifferentActions = {
        ...mockOpportunity,
        executionPlan: [
          {
            stepNumber: 1,
            action: 'add_liquidity' as const,
            pool: mockPoolAddress,
            amount: 1000,
            expectedOutput: 1010,
            maxSlippage: 0.005,
            timeoutMs: 30000,
            dependencies: []
          },
          {
            stepNumber: 2,
            action: 'remove_liquidity' as const,
            pool: mockPoolAddress,
            amount: 1010,
            expectedOutput: 1020,
            maxSlippage: 0.005,
            timeoutMs: 30000,
            dependencies: [1]
          }
        ]
      }

      const inputAmount = 1000
      const metrics = await calculator.calculateBaseProfitability(opportunityWithDifferentActions, inputAmount)

      expect(metrics.gasCosts).toBeGreaterThan(0)
      // Add liquidity costs more than swap
      expect(metrics.gasCosts).toBeGreaterThan(200000 * 0.000005 * 2 * 1.5)
    })

    it('should handle zero profit scenarios', async () => {
      const zeroProfitOpportunity = {
        ...mockOpportunity,
        path: {
          ...mockOpportunity.path,
          route: [
            {
              ...mockOpportunity.path.route[0],
              amountOut: 1000 // Same as input, no profit
            },
            {
              ...mockOpportunity.path.route[1],
              amountOut: 950 // Loss scenario
            }
          ]
        }
      }

      const inputAmount = 1000
      const metrics = await calculator.calculateBaseProfitability(zeroProfitOpportunity, inputAmount)

      expect(metrics.grossProfit).toBeLessThanOrEqual(0)
      expect(metrics.netProfit).toBeLessThan(metrics.grossProfit)
    })
  })

  describe('private calculation methods', () => {
    describe('calculateStepGasCost', () => {
      it('should calculate correct gas cost for swap', () => {
        const swapStep = {
          action: 'swap',
          poolAddress: mockPoolAddress,
          tokenIn: mockTokenX,
          tokenOut: mockTokenY,
          amountIn: 1000,
          amountOut: 1010,
          priceImpact: 0.001,
          binRange: { min: -10, max: 10 }
        } as RouteStep

        const calculateStepGasCost = (calculator as any).calculateStepGasCost.bind(calculator)
        const cost = calculateStepGasCost(swapStep)

        const expectedCost = 200000 * 0.000005 // COMPUTE_UNITS_PER_SWAP * GAS_PRICE_SOL
        expect(cost).toBe(expectedCost)
      })

      it('should calculate correct gas cost for add_liquidity', () => {
        const addLiquidityStep = {
          action: 'add_liquidity',
          poolAddress: mockPoolAddress,
          amountIn: 1000,
          amountOut: 1010,
          priceImpact: 0.001,
          binRange: { min: -10, max: 10 }
        } as RouteStep

        const calculateStepGasCost = (calculator as any).calculateStepGasCost.bind(calculator)
        const cost = calculateStepGasCost(addLiquidityStep)

        const expectedCost = 300000 * 0.000005 // COMPUTE_UNITS_PER_ADD_LIQUIDITY * GAS_PRICE_SOL
        expect(cost).toBe(expectedCost)
      })

      it('should calculate correct gas cost for remove_liquidity', () => {
        const removeLiquidityStep = {
          action: 'remove_liquidity',
          poolAddress: mockPoolAddress,
          amountIn: 1000,
          amountOut: 1010,
          priceImpact: 0.001,
          binRange: { min: -10, max: 10 }
        } as RouteStep

        const calculateStepGasCost = (calculator as any).calculateStepGasCost.bind(calculator)
        const cost = calculateStepGasCost(removeLiquidityStep)

        const expectedCost = 250000 * 0.000005 // COMPUTE_UNITS_PER_REMOVE_LIQUIDITY * GAS_PRICE_SOL
        expect(cost).toBe(expectedCost)
      })

      it('should default to swap cost for unknown actions', () => {
        const unknownStep = {
          action: 'unknown_action',
          poolAddress: mockPoolAddress,
          amountIn: 1000,
          amountOut: 1010,
          priceImpact: 0.001,
          binRange: { min: -10, max: 10 }
        } as RouteStep

        const calculateStepGasCost = (calculator as any).calculateStepGasCost.bind(calculator)
        const cost = calculateStepGasCost(unknownStep)

        const expectedCost = 200000 * 0.000005 // COMPUTE_UNITS_PER_SWAP * GAS_PRICE_SOL
        expect(cost).toBe(expectedCost)
      })

      it('should handle undefined action', () => {
        const undefinedActionStep = {
          poolAddress: mockPoolAddress,
          amountIn: 1000,
          amountOut: 1010,
          priceImpact: 0.001,
          binRange: { min: -10, max: 10 }
        } as RouteStep

        const calculateStepGasCost = (calculator as any).calculateStepGasCost.bind(calculator)
        const cost = calculateStepGasCost(undefinedActionStep)

        const expectedCost = 200000 * 0.000005 // COMPUTE_UNITS_PER_SWAP * GAS_PRICE_SOL
        expect(cost).toBe(expectedCost)
      })
    })

    describe('calculateSlippageImpact', () => {
      it('should calculate slippage impact with buffer', () => {
        const step: RouteStep = {
          poolAddress: mockPoolAddress,
          tokenIn: mockTokenX,
          tokenOut: mockTokenY,
          amountIn: 1000,
          amountOut: 1010,
          priceImpact: 0.002,
          binRange: { min: -10, max: 10 }
        }

        const calculateSlippageImpact = (calculator as any).calculateSlippageImpact.bind(calculator)
        const result = calculateSlippageImpact(step, 1000)

        const expectedSlippage = 0.002 * 1.2 // priceImpact * SLIPPAGE_BUFFER
        const expectedCost = 1000 * expectedSlippage
        const expectedOutput = 1010 * (1 - expectedSlippage)

        expect(result.cost).toBe(expectedCost)
        expect(result.outputAmount).toBe(expectedOutput)
      })

      it('should handle zero price impact', () => {
        const step: RouteStep = {
          poolAddress: mockPoolAddress,
          tokenIn: mockTokenX,
          tokenOut: mockTokenY,
          amountIn: 1000,
          amountOut: 1010,
          priceImpact: 0,
          binRange: { min: -10, max: 10 }
        }

        const calculateSlippageImpact = (calculator as any).calculateSlippageImpact.bind(calculator)
        const result = calculateSlippageImpact(step, 1000)

        expect(result.cost).toBe(0)
        expect(result.outputAmount).toBe(1010)
      })

      it('should handle undefined price impact', () => {
        const step: RouteStep = {
          poolAddress: mockPoolAddress,
          tokenIn: mockTokenX,
          tokenOut: mockTokenY,
          amountIn: 1000,
          amountOut: 1010,
          binRange: { min: -10, max: 10 }
          // priceImpact undefined
        }

        const calculateSlippageImpact = (calculator as any).calculateSlippageImpact.bind(calculator)
        const result = calculateSlippageImpact(step, 1000)

        const defaultSlippage = 0.001 * 1.2
        const expectedCost = 1000 * defaultSlippage
        const expectedOutput = 1010 * (1 - defaultSlippage)

        expect(result.cost).toBe(expectedCost)
        expect(result.outputAmount).toBe(expectedOutput)
      })
    })

    describe('breakeven and max profitable calculations', () => {
      it('should calculate breakeven amount correctly', () => {
        const calculateBreakevenAmount = (calculator as any).calculateBreakevenAmount.bind(calculator)
        const result = calculateBreakevenAmount(mockOpportunity)

        expect(typeof result).toBe('number')
        expect(result).toBeGreaterThan(0)
      })

      it('should return Infinity for unprofitable opportunities', () => {
        const unprofitableOpportunity = {
          ...mockOpportunity,
          profitability: {
            ...mockOpportunity.profitability,
            profitMargin: -0.01 // Negative margin
          }
        }

        const calculateBreakevenAmount = (calculator as any).calculateBreakevenAmount.bind(calculator)
        const result = calculateBreakevenAmount(unprofitableOpportunity)

        expect(result).toBe(Infinity)
      })

      it('should calculate max profitable amount based on liquidity', () => {
        const calculateMaxProfitableAmount = (calculator as any).calculateMaxProfitableAmount.bind(calculator)
        const result = calculateMaxProfitableAmount(mockOpportunity)

        const expectedMax = Math.min(...mockOpportunity.pools.map(pool => pool.liquidity)) * 0.1
        expect(result).toBe(expectedMax)
      })

      it('should handle pools with different liquidities', () => {
        const opportunityWithVariedLiquidity = {
          ...mockOpportunity,
          pools: [
            { ...mockOpportunity.pools[0], liquidity: 50000 },
            { ...mockOpportunity.pools[0], liquidity: 150000 },
            { ...mockOpportunity.pools[0], liquidity: 75000 }
          ]
        }

        const calculateMaxProfitableAmount = (calculator as any).calculateMaxProfitableAmount.bind(calculator)
        const result = calculateMaxProfitableAmount(opportunityWithVariedLiquidity)

        expect(result).toBe(5000) // 50000 * 0.1 (minimum liquidity)
      })
    })

    describe('cost estimation methods', () => {
      it('should estimate fixed costs correctly', () => {
        const estimateFixedCosts = (calculator as any).estimateFixedCosts.bind(calculator)
        const result = estimateFixedCosts(mockOpportunity)

        const expectedCost = mockOpportunity.executionPlan.length * 200000 * 0.000005
        expect(result).toBe(expectedCost)
      })

      it('should estimate variable cost rate', () => {
        const estimateVariableCostRate = (calculator as any).estimateVariableCostRate.bind(calculator)
        const result = estimateVariableCostRate(mockOpportunity)

        expect(typeof result).toBe('number')
        expect(result).toBeGreaterThan(0)
      })

      it('should estimate gross profit rate', () => {
        const estimateGrossProfitRate = (calculator as any).estimateGrossProfitRate.bind(calculator)
        const result = estimateGrossProfitRate(mockOpportunity)

        expect(typeof result).toBe('number')
        expect(result).toBeGreaterThan(0)
      })
    })
  })

  describe('generateProfitabilityScenarios', () => {
    it('should generate three scenarios', async () => {
      const generateProfitabilityScenarios = (calculator as any).generateProfitabilityScenarios.bind(calculator)
      const scenarios = await generateProfitabilityScenarios(mockOpportunity, 1000)

      expect(scenarios).toHaveLength(3)
      expect(scenarios[0].name).toBe('Conservative')
      expect(scenarios[1].name).toBe('Base Case')
      expect(scenarios[2].name).toBe('Optimistic')
    })

    it('should have correct scenario properties', async () => {
      const generateProfitabilityScenarios = (calculator as any).generateProfitabilityScenarios.bind(calculator)
      const scenarios = await generateProfitabilityScenarios(mockOpportunity, 1000)

      scenarios.forEach(scenario => {
        expect(scenario.name).toBeDefined()
        expect(scenario.description).toBeDefined()
        expect(typeof scenario.probability).toBe('number')
        expect(scenario.probability).toBeGreaterThan(0)
        expect(scenario.probability).toBeLessThanOrEqual(1)
        expect(typeof scenario.inputAmount).toBe('number')
        expect(typeof scenario.expectedProfit).toBe('number')
        expect(typeof scenario.executionTime).toBe('number')
        expect(typeof scenario.gasRequired).toBe('number')
        expect(scenario.worstCaseProfit).toBeLessThanOrEqual(scenario.bestCaseProfit)
      })
    })

    it('should have probabilities that sum to 1', async () => {
      const generateProfitabilityScenarios = (calculator as any).generateProfitabilityScenarios.bind(calculator)
      const scenarios = await generateProfitabilityScenarios(mockOpportunity, 1000)

      const totalProbability = scenarios.reduce((sum, scenario) => sum + scenario.probability, 0)
      expect(totalProbability).toBe(1.0)
    })

    it('should scale profits correctly across scenarios', async () => {
      const generateProfitabilityScenarios = (calculator as any).generateProfitabilityScenarios.bind(calculator)
      const scenarios = await generateProfitabilityScenarios(mockOpportunity, 1000)

      const conservativeProfit = scenarios[0].expectedProfit
      const baseProfit = scenarios[1].expectedProfit
      const optimisticProfit = scenarios[2].expectedProfit

      expect(conservativeProfit).toBeLessThan(baseProfit)
      expect(baseProfit).toBeLessThan(optimisticProfit)
    })
  })

  describe('calculateRiskAdjustedMetrics', () => {
    const mockScenarios: ProfitabilityScenario[] = [
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
    ]

    it('should calculate risk-adjusted metrics correctly', async () => {
      const calculateRiskAdjustedMetrics = (calculator as any).calculateRiskAdjustedMetrics.bind(calculator)
      const metrics = await calculateRiskAdjustedMetrics(mockOpportunity, mockScenarios)

      expect(typeof metrics.sharpeRatio).toBe('number')
      expect(typeof metrics.sortinoRatio).toBe('number')
      expect(typeof metrics.maxDrawdown).toBe('number')
      expect(typeof metrics.valueAtRisk).toBe('number')
      expect(typeof metrics.conditionalValueAtRisk).toBe('number')
      expect(typeof metrics.probabilityOfProfit).toBe('number')
      expect(typeof metrics.expectedShortfall).toBe('number')

      expect(metrics.probabilityOfProfit).toBeGreaterThan(0)
      expect(metrics.probabilityOfProfit).toBeLessThanOrEqual(1)
    })

    it('should handle negative profits in scenarios', async () => {
      const scenariosWithLoss = [
        ...mockScenarios,
        {
          name: 'Loss Scenario',
          description: 'Loss scenario',
          probability: 0.1,
          inputAmount: 1000,
          expectedProfit: -5,
          worstCaseProfit: -10,
          bestCaseProfit: -2,
          executionTime: 20000,
          gasRequired: 500000
        }
      ]

      // Adjust probabilities to sum to 1
      scenariosWithLoss[0].probability = 0.27
      scenariosWithLoss[1].probability = 0.45
      scenariosWithLoss[2].probability = 0.18

      const calculateRiskAdjustedMetrics = (calculator as any).calculateRiskAdjustedMetrics.bind(calculator)
      const metrics = await calculateRiskAdjustedMetrics(mockOpportunity, scenariosWithLoss)

      expect(metrics.expectedShortfall).toBeGreaterThan(0) // Should have some expected loss
      expect(metrics.probabilityOfProfit).toBeLessThan(1) // Not 100% profitable
    })

    it('should calculate VaR and CVaR correctly', async () => {
      const calculateVaR = (calculator as any).calculateVaR.bind(calculator)
      const calculateCVaR = (calculator as any).calculateCVaR.bind(calculator)

      const profits = [10, 15, 25, -5]
      const probabilities = [0.3, 0.5, 0.15, 0.05]

      const var95 = calculateVaR(profits, probabilities, 0.05)
      const cvar95 = calculateCVaR(profits, probabilities, 0.05)

      expect(typeof var95).toBe('number')
      expect(typeof cvar95).toBe('number')
      expect(var95).toBeGreaterThanOrEqual(0)
      expect(cvar95).toBeGreaterThanOrEqual(0)
    })

    it('should handle all positive profits', async () => {
      const allPositiveScenarios = mockScenarios.map(s => ({
        ...s,
        expectedProfit: Math.abs(s.expectedProfit) + 1
      }))

      const calculateRiskAdjustedMetrics = (calculator as any).calculateRiskAdjustedMetrics.bind(calculator)
      const metrics = await calculateRiskAdjustedMetrics(mockOpportunity, allPositiveScenarios)

      expect(metrics.probabilityOfProfit).toBe(1.0)
      expect(metrics.expectedShortfall).toBe(0)
    })
  })

  describe('analyzeCosts', () => {
    it('should analyze costs comprehensively', async () => {
      const analyzeCosts = (calculator as any).analyzeCosts.bind(calculator)
      const costBreakdown = await analyzeCosts(mockOpportunity, 1000)

      expect(costBreakdown.transactionFees).toBeInstanceOf(Array)
      expect(costBreakdown.transactionFees.length).toBe(mockOpportunity.executionPlan.length)
      expect(costBreakdown.slippageImpact).toBeInstanceOf(Array)
      expect(costBreakdown.slippageImpact.length).toBe(mockOpportunity.pools.length)
      expect(typeof costBreakdown.mevProtectionCost).toBe('number')
      expect(typeof costBreakdown.opportunityCost).toBe('number')
      expect(typeof costBreakdown.capitalRequirement).toBe('number')
      expect(typeof costBreakdown.totalCosts).toBe('number')
      expect(typeof costBreakdown.costRatio).toBe('number')

      expect(costBreakdown.capitalRequirement).toBe(1000)
      expect(costBreakdown.totalCosts).toBeGreaterThan(0)
    })

    it('should calculate transaction fees for each step', async () => {
      const analyzeCosts = (calculator as any).analyzeCosts.bind(calculator)
      const costBreakdown = await analyzeCosts(mockOpportunity, 1000)

      costBreakdown.transactionFees.forEach((fee: TransactionCost, index: number) => {
        expect(fee.step).toBe(index + 1)
        expect(fee.description).toContain(mockOpportunity.executionPlan[index].action)
        expect(typeof fee.baseFee).toBe('number')
        expect(typeof fee.priorityFee).toBe('number')
        expect(typeof fee.computeUnits).toBe('number')
        expect(typeof fee.estimatedFee).toBe('number')
        expect(fee.estimatedFee).toBe(fee.baseFee + fee.priorityFee)
        expect(fee.baseFee).toBeGreaterThan(0)
        expect(fee.priorityFee).toBeGreaterThan(0)
      })
    })

    it('should calculate slippage impact for each pool', async () => {
      const analyzeCosts = (calculator as any).analyzeCosts.bind(calculator)
      const costBreakdown = await analyzeCosts(mockOpportunity, 1000)

      costBreakdown.slippageImpact.forEach((impact: SlippageImpact) => {
        expect(impact.poolAddress).toBeDefined()
        expect(typeof impact.tokenPair).toBe('string')
        expect(typeof impact.expectedSlippage).toBe('number')
        expect(typeof impact.worstCaseSlippage).toBe('number')
        expect(typeof impact.slippageCost).toBe('number')
        expect(typeof impact.liquidityDepth).toBe('number')

        expect(impact.worstCaseSlippage).toBeGreaterThanOrEqual(impact.expectedSlippage)
        expect(impact.slippageCost).toBeGreaterThanOrEqual(0)
        expect(impact.liquidityDepth).toBeGreaterThan(0)
      })
    })

    it('should calculate opportunity cost correctly', async () => {
      const calculateOpportunityCost = (calculator as any).calculateOpportunityCost.bind(calculator)
      const cost = calculateOpportunityCost(1000, 10) // 10 seconds execution time

      const annualRate = 0.05
      const secondsPerYear = 365 * 24 * 3600
      const expectedCost = 1000 * annualRate * (10 / secondsPerYear)

      expect(cost).toBe(expectedCost)
    })

    it('should handle different execution plan lengths', async () => {
      const longOpportunity = {
        ...mockOpportunity,
        executionPlan: [
          ...mockOpportunity.executionPlan,
          {
            stepNumber: 3,
            action: 'add_liquidity' as const,
            pool: mockPoolAddress,
            amount: 500,
            expectedOutput: 510,
            maxSlippage: 0.005,
            timeoutMs: 30000,
            dependencies: []
          }
        ]
      }

      const analyzeCosts = (calculator as any).analyzeCosts.bind(calculator)
      const costBreakdown = await analyzeCosts(longOpportunity, 1000)

      expect(costBreakdown.transactionFees).toHaveLength(3)
    })
  })

  describe('getComputeUnitsForAction', () => {
    it('should return correct compute units for each action', () => {
      const getComputeUnitsForAction = (calculator as any).getComputeUnitsForAction.bind(calculator)

      expect(getComputeUnitsForAction('swap')).toBe(200000)
      expect(getComputeUnitsForAction('add_liquidity')).toBe(300000)
      expect(getComputeUnitsForAction('remove_liquidity')).toBe(250000)
      expect(getComputeUnitsForAction('unknown')).toBe(200000) // Default to swap
    })
  })

  describe('analyzeMarketImpact', () => {
    it('should analyze market impact comprehensively', async () => {
      const analyzeMarketImpact = (calculator as any).analyzeMarketImpact.bind(calculator)
      const analysis = await analyzeMarketImpact(mockOpportunity, 1000)

      expect(analysis.priceImpact).toBeInstanceOf(Array)
      expect(analysis.priceImpact.length).toBeGreaterThan(0)
      expect(analysis.liquidityAnalysis).toBeDefined()
      expect(analysis.competitionRisk).toBeDefined()
      expect(analysis.temporalDecay).toBeDefined()
    })

    it('should calculate price impact tiers correctly', async () => {
      const analyzeMarketImpact = (calculator as any).analyzeMarketImpact.bind(calculator)
      const analysis = await analyzeMarketImpact(mockOpportunity, 1000)

      analysis.priceImpact.forEach((tier: PriceImpactTier) => {
        expect(typeof tier.amountRange.min).toBe('number')
        expect(typeof tier.amountRange.max).toBe('number')
        expect(typeof tier.averageImpact).toBe('number')
        expect(typeof tier.maximumImpact).toBe('number')
        expect(typeof tier.liquidityUtilization).toBe('number')
        expect(typeof tier.recommendedMaxAmount).toBe('number')

        expect(tier.amountRange.min).toBeLessThan(tier.amountRange.max)
        expect(tier.averageImpact).toBeLessThanOrEqual(tier.maximumImpact)
        expect(tier.liquidityUtilization).toBeGreaterThanOrEqual(0)
      })
    })

    it('should analyze liquidity correctly', () => {
      const analyzeLiquidity = (calculator as any).analyzeLiquidity.bind(calculator)
      const analysis = analyzeLiquidity(mockOpportunity.pools)

      expect(typeof analysis.totalLiquidity).toBe('number')
      expect(typeof analysis.activeLiquidity).toBe('number')
      expect(analysis.liquidityDistribution).toBeInstanceOf(Array)
      expect(typeof analysis.liquidityDepthScore).toBe('number')
      expect(typeof analysis.liquidityStability).toBe('number')

      expect(analysis.activeLiquidity).toBeLessThanOrEqual(analysis.totalLiquidity)
      expect(analysis.liquidityDepthScore).toBeGreaterThanOrEqual(0)
      expect(analysis.liquidityDepthScore).toBeLessThanOrEqual(1)
    })

    it('should analyze competition risk', () => {
      const analyzeCompetition = (calculator as any).analyzeCompetition.bind(calculator)
      const analysis = analyzeCompetition(mockOpportunity)

      expect(typeof analysis.historicalCompetition).toBe('number')
      expect(typeof analysis.mevBotActivity).toBe('number')
      expect(typeof analysis.averageExecutionDelay).toBe('number')
      expect(typeof analysis.successRate).toBe('number')
      expect(['low', 'medium', 'high', 'extreme']).toContain(analysis.competitionPressure)

      expect(analysis.historicalCompetition).toBeGreaterThanOrEqual(0)
      expect(analysis.historicalCompetition).toBeLessThanOrEqual(1)
      expect(analysis.mevBotActivity).toBeGreaterThanOrEqual(0)
      expect(analysis.mevBotActivity).toBeLessThanOrEqual(1)
      expect(analysis.successRate).toBeGreaterThanOrEqual(0)
      expect(analysis.successRate).toBeLessThanOrEqual(1)
    })

    it('should analyze temporal decay', () => {
      const analyzeTemporalDecay = (calculator as any).analyzeTemporalDecay.bind(calculator)
      const analysis = analyzeTemporalDecay(mockOpportunity)

      expect(typeof analysis.halfLife).toBe('number')
      expect(typeof analysis.decayRate).toBe('number')
      expect(typeof analysis.sustainabilityScore).toBe('number')
      expect(typeof analysis.optimalExecutionWindow).toBe('number')

      expect(analysis.halfLife).toBeGreaterThan(0)
      expect(analysis.decayRate).toBeGreaterThan(0)
      expect(analysis.sustainabilityScore).toBeGreaterThanOrEqual(0)
      expect(analysis.sustainabilityScore).toBeLessThanOrEqual(1)
    })

    it('should handle different complexity levels', () => {
      const simpleOpportunity = { ...mockOpportunity, path: { ...mockOpportunity.path, complexity: 'simple' as const } }
      const moderateOpportunity = { ...mockOpportunity, path: { ...mockOpportunity.path, complexity: 'moderate' as const } }
      const complexOpportunity = { ...mockOpportunity, path: { ...mockOpportunity.path, complexity: 'complex' as const } }

      const analyzeTemporalDecay = (calculator as any).analyzeTemporalDecay.bind(calculator)

      const simpleAnalysis = analyzeTemporalDecay(simpleOpportunity)
      const moderateAnalysis = analyzeTemporalDecay(moderateOpportunity)
      const complexAnalysis = analyzeTemporalDecay(complexOpportunity)

      expect(simpleAnalysis.halfLife).toBeGreaterThan(moderateAnalysis.halfLife)
      expect(moderateAnalysis.halfLife).toBeGreaterThan(complexAnalysis.halfLife)
    })
  })

  describe('generateRecommendations', () => {
    const mockMarketImpact: MarketImpactAnalysis = {
      priceImpact: [
        {
          amountRange: { min: 800, max: 1200 },
          averageImpact: 0.005,
          maximumImpact: 0.008,
          liquidityUtilization: 0.01,
          recommendedMaxAmount: 1000
        }
      ],
      liquidityAnalysis: {} as LiquidityAnalysis,
      competitionRisk: {
        historicalCompetition: 0.5,
        mevBotActivity: 0.3,
        averageExecutionDelay: 3000,
        successRate: 0.85,
        competitionPressure: 'medium'
      },
      temporalDecay: {
        halfLife: 15,
        decayRate: 0.046,
        sustainabilityScore: 0.7,
        optimalExecutionWindow: 10
      }
    }

    it('should generate appropriate recommendations', async () => {
      const generateRecommendations = (calculator as any).generateRecommendations.bind(calculator)
      const recommendations = await generateRecommendations(
        mockOpportunity,
        mockOpportunity.profitability,
        mockMarketImpact
      )

      expect(recommendations).toBeInstanceOf(Array)
      recommendations.forEach((rec: ProfitabilityRecommendation) => {
        expect(['amount_optimization', 'timing', 'route_modification', 'risk_mitigation']).toContain(rec.type)
        expect(['high', 'medium', 'low']).toContain(rec.priority)
        expect(typeof rec.description).toBe('string')
        expect(typeof rec.expectedImprovement).toBe('number')
        expect(typeof rec.implementationCost).toBe('number')
        expect(typeof rec.netBenefit).toBe('number')
      })
    })

    it('should generate timing recommendations for short half-life', async () => {
      const shortHalfLifeImpact = {
        ...mockMarketImpact,
        temporalDecay: {
          ...mockMarketImpact.temporalDecay,
          halfLife: 15 // Short half-life
        }
      }

      const generateRecommendations = (calculator as any).generateRecommendations.bind(calculator)
      const recommendations = await generateRecommendations(
        mockOpportunity,
        mockOpportunity.profitability,
        shortHalfLifeImpact
      )

      const timingRec = recommendations.find((r: ProfitabilityRecommendation) => r.type === 'timing')
      expect(timingRec).toBeDefined()
      expect(timingRec.priority).toBe('high')
    })

    it('should generate risk mitigation for high competition', async () => {
      const highCompetitionImpact = {
        ...mockMarketImpact,
        competitionRisk: {
          ...mockMarketImpact.competitionRisk,
          competitionPressure: 'high' as const
        }
      }

      const generateRecommendations = (calculator as any).generateRecommendations.bind(calculator)
      const recommendations = await generateRecommendations(
        mockOpportunity,
        mockOpportunity.profitability,
        highCompetitionImpact
      )

      const riskMitigationRec = recommendations.find((r: ProfitabilityRecommendation) => r.type === 'risk_mitigation')
      expect(riskMitigationRec).toBeDefined()
    })

    it('should sort recommendations by net benefit', async () => {
      const generateRecommendations = (calculator as any).generateRecommendations.bind(calculator)
      const recommendations = await generateRecommendations(
        mockOpportunity,
        mockOpportunity.profitability,
        mockMarketImpact
      )

      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].netBenefit).toBeGreaterThanOrEqual(recommendations[i].netBenefit)
      }
    })
  })

  describe('performSensitivityAnalysis', () => {
    it('should perform comprehensive sensitivity analysis', async () => {
      const performSensitivityAnalysis = (calculator as any).performSensitivityAnalysis.bind(calculator)
      const analysis = await performSensitivityAnalysis(mockOpportunity, 1000)

      expect(analysis.priceVolatility).toBeInstanceOf(Array)
      expect(analysis.gasPrice).toBeInstanceOf(Array)
      expect(analysis.slippage).toBeInstanceOf(Array)
      expect(analysis.competition).toBeInstanceOf(Array)
      expect(analysis.executionTime).toBeInstanceOf(Array)

      // Verify each sensitivity factor has multiple data points
      expect(analysis.priceVolatility.length).toBeGreaterThan(1)
      expect(analysis.gasPrice.length).toBeGreaterThan(1)
      expect(analysis.slippage.length).toBeGreaterThan(1)
      expect(analysis.competition.length).toBeGreaterThan(1)
      expect(analysis.executionTime.length).toBeGreaterThan(1)
    })

    it('should have baseline (factor = 1.0) with zero impact', async () => {
      const performSensitivityAnalysis = (calculator as any).performSensitivityAnalysis.bind(calculator)
      const analysis = await performSensitivityAnalysis(mockOpportunity, 1000)

      const volatilityBaseline = analysis.priceVolatility.find(v => v.factor === 1.0)
      const gasPriceBaseline = analysis.gasPrice.find(g => g.factor === 1.0)
      const slippageBaseline = analysis.slippage.find(s => s.factor === 1.0)
      const competitionBaseline = analysis.competition.find(c => c.factor === 1.0)

      expect(volatilityBaseline?.impactOnProfit).toBe(0)
      expect(gasPriceBaseline?.impactOnProfit).toBe(0)
      expect(slippageBaseline?.impactOnProfit).toBe(0)
      expect(competitionBaseline?.impactOnProfit).toBe(0)
    })

    it('should calculate volatility impact correctly', () => {
      const calculateVolatilityImpact = (calculator as any).calculateVolatilityImpact.bind(calculator)

      const baseProfit = 15

      // Low volatility should reduce opportunities
      const lowVolatilityImpact = calculateVolatilityImpact(baseProfit, 0.5)
      expect(lowVolatilityImpact).toBeLessThan(0)

      // High volatility should increase opportunities but with more risk
      const highVolatilityImpact = calculateVolatilityImpact(baseProfit, 2.0)
      expect(highVolatilityImpact).toBeGreaterThan(0)
    })

    it('should handle extreme sensitivity factors', async () => {
      const performSensitivityAnalysis = (calculator as any).performSensitivityAnalysis.bind(calculator)
      const analysis = await performSensitivityAnalysis(mockOpportunity, 1000)

      // Should handle all sensitivity factors without throwing
      expect(analysis).toBeDefined()

      // Check that impacts make sense (higher factors generally have more negative impact for costs)
      const maxGasFactor = Math.max(...analysis.gasPrice.map(g => g.factor))
      const maxGasImpact = analysis.gasPrice.find(g => g.factor === maxGasFactor)?.impactOnProfit
      expect(maxGasImpact).toBeLessThan(0) // Higher gas prices should reduce profit
    })
  })

  describe('estimateGasRequired', () => {
    it('should sum gas requirements across all execution steps', () => {
      const estimateGasRequired = (calculator as any).estimateGasRequired.bind(calculator)
      const gasRequired = estimateGasRequired(mockOpportunity)

      const expectedTotal = mockOpportunity.executionPlan.reduce((total, step) => {
        return total + 200000 // COMPUTE_UNITS_PER_SWAP for all swap actions
      }, 0)

      expect(gasRequired).toBe(expectedTotal)
    })

    it('should handle mixed action types', () => {
      const mixedOpportunity = {
        ...mockOpportunity,
        executionPlan: [
          { ...mockOpportunity.executionPlan[0], action: 'swap' as const },
          { ...mockOpportunity.executionPlan[1], action: 'add_liquidity' as const }
        ]
      }

      const estimateGasRequired = (calculator as any).estimateGasRequired.bind(calculator)
      const gasRequired = estimateGasRequired(mixedOpportunity)

      const expectedTotal = 200000 + 300000 // swap + add_liquidity
      expect(gasRequired).toBe(expectedTotal)
    })

    it('should handle empty execution plan', () => {
      const emptyOpportunity = {
        ...mockOpportunity,
        executionPlan: []
      }

      const estimateGasRequired = (calculator as any).estimateGasRequired.bind(calculator)
      const gasRequired = estimateGasRequired(emptyOpportunity)

      expect(gasRequired).toBe(0)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle zero input amounts', async () => {
      const analysis = await calculator.calculateDetailedProfitability(mockOpportunity, 0)
      expect(analysis).toBeDefined()
      expect(analysis.baseAnalysis.grossProfit).toBeLessThanOrEqual(0)
    })

    it('should handle negative input amounts', async () => {
      const analysis = await calculator.calculateDetailedProfitability(mockOpportunity, -1000)
      expect(analysis).toBeDefined()
    })

    it('should handle opportunities with no execution plan', async () => {
      const noExecutionOpportunity = {
        ...mockOpportunity,
        executionPlan: []
      }

      const analysis = await calculator.calculateDetailedProfitability(noExecutionOpportunity, 1000)
      expect(analysis).toBeDefined()
      expect(analysis.baseAnalysis.gasCosts).toBe(0)
    })

    it('should handle opportunities with no pools', async () => {
      const noPoolsOpportunity = {
        ...mockOpportunity,
        pools: []
      }

      const analysis = await calculator.calculateDetailedProfitability(noPoolsOpportunity, 1000)
      expect(analysis).toBeDefined()
    })

    it('should handle extreme profit values', async () => {
      const extremeOpportunity = {
        ...mockOpportunity,
        profitability: {
          ...mockOpportunity.profitability,
          grossProfit: Number.MAX_VALUE,
          netProfit: Number.MAX_VALUE
        }
      }

      const analysis = await calculator.calculateDetailedProfitability(extremeOpportunity, 1000)
      expect(analysis).toBeDefined()
    })

    it('should handle invalid route steps', async () => {
      const invalidRouteOpportunity = {
        ...mockOpportunity,
        path: {
          ...mockOpportunity.path,
          route: [
            {
              poolAddress: mockPoolAddress,
              tokenIn: mockTokenX,
              tokenOut: mockTokenY,
              amountIn: NaN,
              amountOut: Infinity,
              priceImpact: -1,
              binRange: { min: 100, max: -100 } // Invalid range
            }
          ]
        }
      }

      const analysis = await calculator.calculateDetailedProfitability(invalidRouteOpportunity, 1000)
      expect(analysis).toBeDefined()
    })

    it('should handle concurrent calculations', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        calculator.calculateDetailedProfitability(mockOpportunity, 1000 + i * 100)
      )

      const results = await Promise.all(promises)
      expect(results).toHaveLength(10)
      results.forEach(result => {
        expect(result).toBeDefined()
        expect(result.baseAnalysis).toBeDefined()
      })
    })

    it('should handle memory intensive scenarios', async () => {
      // Create opportunity with many pools and execution steps
      const largeOpportunity = {
        ...mockOpportunity,
        pools: Array.from({ length: 100 }, (_, i) => ({
          ...mockOpportunity.pools[0],
          poolAddress: new PublicKey(`Pool${i.toString().padStart(44, '0')}`)
        })),
        executionPlan: Array.from({ length: 50 }, (_, i) => ({
          ...mockOpportunity.executionPlan[0],
          stepNumber: i + 1
        }))
      }

      const analysis = await calculator.calculateDetailedProfitability(largeOpportunity, 1000)
      expect(analysis).toBeDefined()
      expect(analysis.costBreakdown.transactionFees).toHaveLength(50)
      expect(analysis.costBreakdown.slippageImpact).toHaveLength(100)
    })

    it('should validate calculation consistency', async () => {
      // Run same calculation multiple times
      const results = await Promise.all([
        calculator.calculateDetailedProfitability(mockOpportunity, 1000),
        calculator.calculateDetailedProfitability(mockOpportunity, 1000),
        calculator.calculateDetailedProfitability(mockOpportunity, 1000)
      ])

      // Results should be identical (no randomness in deterministic calculations)
      expect(results[0].baseAnalysis.grossProfit).toBe(results[1].baseAnalysis.grossProfit)
      expect(results[1].baseAnalysis.grossProfit).toBe(results[2].baseAnalysis.grossProfit)
    })
  })
})