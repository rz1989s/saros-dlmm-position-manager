import { PublicKey, Connection } from '@solana/web3.js'
import { PortfolioOptimizationEngine, OptimizationResult } from '../../../src/lib/dlmm/portfolio-optimizer'
import { DLMMClient } from '../../../src/lib/dlmm/client'
import type { EnhancedDLMMPosition } from '../../../src/lib/types'

// Mock the DLMM client
jest.mock('../../../src/lib/dlmm/client', () => ({
  DLMMClient: jest.fn(),
  dlmmClient: {
    getLbPair: jest.fn(),
    getConnection: jest.fn(() => new Connection('http://localhost:8899'))
  }
}))

// Mock oracle price feeds
jest.mock('../../../src/lib/oracle/price-feeds', () => ({
  oraclePriceFeeds: {
    getMultipleTokenPrices: jest.fn(() => Promise.resolve({
      'USDC': { price: 1.0, timestamp: Date.now() },
      'USDT': { price: 1.0, timestamp: Date.now() },
      'SOL': { price: 100.0, timestamp: Date.now() },
      'ETH': { price: 2000.0, timestamp: Date.now() },
      'BTC': { price: 50000.0, timestamp: Date.now() }
    }))
  }
}))

describe('PortfolioOptimizationEngine', () => {
  let optimizationEngine: PortfolioOptimizationEngine
  let mockClient: jest.Mocked<DLMMClient>
  let mockPositions: EnhancedDLMMPosition[]

  beforeEach(() => {
    jest.clearAllMocks()

    mockClient = {
      getLbPair: jest.fn(),
      getConnection: jest.fn(() => new Connection('http://localhost:8899')),
      getUserPositions: jest.fn(),
      getBinData: jest.fn(),
      getPoolInfo: jest.fn()
    } as any

    optimizationEngine = new PortfolioOptimizationEngine(mockClient)

    mockPositions = [
      {
        publicKey: new PublicKey('Position1111111111111111111111111111111111'),
        pair: new PublicKey('Pool1111111111111111111111111111111111111111'),
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
        currentValue: 20000,
        initialValue: 18000,
        pnl: 2000,
        pnlPercent: 11.11,
        realizedPnl: 500,
        unrealizedPnl: 1500,
        feeEarnings: 800,
        impermanentLoss: -300,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        bins: [
          {
            binId: 8388608,
            price: 1.0,
            liquidityX: 10000,
            liquidityY: 10000,
            reserveX: 10000,
            reserveY: 10000
          }
        ]
      },
      {
        publicKey: new PublicKey('Position2222222222222222222222222222222222'),
        pair: new PublicKey('Pool2222222222222222222222222222222222222222'),
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
        currentValue: 15000,
        initialValue: 10000,
        pnl: 5000,
        pnlPercent: 50.0,
        realizedPnl: 1000,
        unrealizedPnl: 4000,
        feeEarnings: 1200,
        impermanentLoss: -200,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
        bins: [
          {
            binId: 8388600,
            price: 100.0,
            liquidityX: 75,
            liquidityY: 7500,
            reserveX: 75,
            reserveY: 7500
          }
        ]
      },
      {
        publicKey: new PublicKey('Position3333333333333333333333333333333333'),
        pair: new PublicKey('Pool3333333333333333333333333333333333333333'),
        tokenX: {
          address: new PublicKey('2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk'),
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 8,
          price: 2000.0
        },
        tokenY: {
          address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          price: 1.0
        },
        currentValue: 8000,
        initialValue: 12000,
        pnl: -4000,
        pnlPercent: -33.33,
        realizedPnl: -1000,
        unrealizedPnl: -3000,
        feeEarnings: 400,
        impermanentLoss: -400,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
        bins: [
          {
            binId: 8388590,
            price: 2000.0,
            liquidityX: 2,
            liquidityY: 4000,
            reserveX: 2,
            reserveY: 4000
          }
        ]
      }
    ]
  })

  describe('optimizePortfolio', () => {
    it('should perform portfolio optimization with max sharpe objective', async () => {
      const optimization = await optimizationEngine.optimizePortfolio(mockPositions, {
        objective: 'max_sharpe',
        constraints: {
          maxWeight: 0.4,
          minWeight: 0.1,
          maxTurnover: 0.5,
          riskBudget: 0.15
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      expect(optimization).toMatchObject({
        optimization: expect.objectContaining({
          objective: 'max_sharpe',
          status: expect.stringMatching(/^(optimal|suboptimal|infeasible)$/),
          optimalWeights: expect.any(Array),
          expectedReturn: expect.any(Number),
          expectedRisk: expect.any(Number),
          sharpeRatio: expect.any(Number)
        }),
        currentMetrics: expect.objectContaining({
          totalValue: expect.any(Number),
          weightedReturn: expect.any(Number),
          portfolioRisk: expect.any(Number),
          sharpeRatio: expect.any(Number),
          efficiency: expect.any(Number)
        }),
        rebalancing: expect.objectContaining({
          required: expect.any(Boolean),
          targetAllocations: expect.any(Array),
          currentAllocations: expect.any(Array),
          rebalanceActions: expect.any(Array),
          estimatedCosts: expect.any(Object)
        }),
        recommendations: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            type: expect.any(String),
            priority: expect.stringMatching(/^(high|medium|low)$/),
            action: expect.any(String)
          })
        ])
      })
    })

    it('should optimize for minimum risk objective', async () => {
      const optimization = await optimizationEngine.optimizePortfolio(mockPositions, {
        objective: 'min_risk',
        constraints: {
          maxWeight: 0.5,
          minWeight: 0.05,
          maxTurnover: 0.3,
          riskBudget: 0.1
        },
        timeframe: '30d',
        rebalanceFrequency: 'monthly'
      })

      expect(optimization.optimizationMetrics.objective).toBe('min_risk')
      expect(optimization.expectedRisk).toBeLessThanOrEqual(0.1)

      // Optimal weights should respect constraints
      optimization.optimalWeights.forEach(weight => {
        expect(weight.weight).toBeGreaterThanOrEqual(0.05)
        expect(weight.weight).toBeLessThanOrEqual(0.5)
      })

      const totalWeight = optimization.optimalWeights.reduce(
        (sum, w) => sum + w.weight, 0
      )
      expect(totalWeight).toBeCloseTo(1, 2)
    })

    it('should optimize for maximum return objective', async () => {
      const optimization = await optimizationEngine.optimizePortfolio(mockPositions, {
        objective: 'max_return',
        constraints: {
          maxWeight: 0.6,
          minWeight: 0.1,
          maxTurnover: 0.4,
          riskBudget: 0.2
        },
        timeframe: '30d',
        rebalanceFrequency: 'daily'
      })

      expect(optimization.optimizationMetrics.objective).toBe('max_return')
      expect(optimization.expectedReturn).toBeGreaterThan(0)

      // Should allocate more to higher-performing positions
      const solPosition = optimization.optimalWeights.find(
        w => w.positionId.includes('Position2222') // SOL position with 50% return
      )
      const ethPosition = optimization.optimalWeights.find(
        w => w.positionId.includes('Position3333') // ETH position with -33% return
      )

      if (solPosition && ethPosition) {
        expect(solPosition.weight).toBeGreaterThan(ethPosition.weight)
      }
    })

    it('should calculate current portfolio metrics accurately', async () => {
      const optimization = await optimizationEngine.optimizePortfolio(mockPositions, {
        objective: 'max_sharpe',
        constraints: {
          maxWeight: 0.4,
          minWeight: 0.1,
          maxTurnover: 0.5,
          riskBudget: 0.15
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      const expectedTotalValue = mockPositions.reduce((sum, pos) => sum + pos.currentValue, 0)
      const expectedWeightedReturn = mockPositions.reduce((sum, pos) => {
        const weight = pos.currentValue / expectedTotalValue
        return sum + (weight * (pos.pnlPercent || 0))
      }, 0)

      expect(optimization.optimizationMetrics.totalValue).toBeCloseTo(expectedTotalValue, 2)
      expect(optimization.expectedReturn).toBeCloseTo(expectedWeightedReturn, 2)
      expect(optimization.sharpeRatio).toBeGreaterThan(-10) // Reasonable bounds
      expect(optimization.sharpeRatio).toBeLessThan(10)
    })

    it('should generate rebalancing recommendations when needed', async () => {
      const unbalancedPositions = [
        { ...mockPositions[0], currentValue: 40000 }, // 80% of portfolio
        { ...mockPositions[1], currentValue: 5000 },  // 10% of portfolio
        { ...mockPositions[2], currentValue: 5000 }   // 10% of portfolio
      ]

      const optimization = await optimizationEngine.optimizePortfolio(unbalancedPositions, {
        objective: 'max_sharpe',
        constraints: {
          maxWeight: 0.4,
          minWeight: 0.2,
          maxTurnover: 0.5,
          riskBudget: 0.15
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      expect(optimization.rebalancingActions.length > 0).toBe(true)
      expect(optimization.rebalancingActions.length).toBeGreaterThan(0)

      optimization.rebalancingActions.forEach(action => {
        expect(action).toMatchObject({
          positionId: expect.any(String),
          action: expect.stringMatching(/^(increase|decrease|maintain)$/),
          currentWeight: expect.any(Number),
          targetWeight: expect.any(Number),
          amountChange: expect.any(Number),
          priority: expect.stringMatching(/^(high|medium|low)$/)
        })
      })
    })

    it('should respect weight constraints', async () => {
      const optimization = await optimizationEngine.optimizePortfolio(mockPositions, {
        objective: 'max_sharpe',
        constraints: {
          maxWeight: 0.3,
          minWeight: 0.2,
          maxTurnover: 0.5,
          riskBudget: 0.15
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      optimization.optimalWeights.forEach(weight => {
        expect(weight.weight).toBeGreaterThanOrEqual(0.2)
        expect(weight.weight).toBeLessThanOrEqual(0.3)
      })
    })

    it('should respect risk budget constraints', async () => {
      const optimization = await optimizationEngine.optimizePortfolio(mockPositions, {
        objective: 'max_return',
        constraints: {
          maxWeight: 0.5,
          minWeight: 0.1,
          maxTurnover: 0.5,
          riskBudget: 0.05 // Very tight risk budget
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      expect(optimization.expectedRisk).toBeLessThanOrEqual(0.05)
    })

    it('should handle infeasible optimization problems', async () => {
      const optimization = await optimizationEngine.optimizePortfolio(mockPositions, {
        objective: 'max_sharpe',
        constraints: {
          maxWeight: 0.2, // Too restrictive - 3 positions need at least 0.33 each
          minWeight: 0.4, // Impossible - min > max
          maxTurnover: 0.01,
          riskBudget: 0.001
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      expect(optimization.optimizationMetrics.status).toBe('infeasible')
      expect(optimization.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'constraint_relaxation',
            priority: 'high'
          })
        ])
      )
    })

    it('should handle different rebalance frequencies', async () => {
      const dailyOpt = await optimizationEngine.optimizePortfolio(mockPositions, {
        objective: 'max_sharpe',
        constraints: {
          maxWeight: 0.4,
          minWeight: 0.1,
          maxTurnover: 0.5,
          riskBudget: 0.15
        },
        timeframe: '30d',
        rebalanceFrequency: 'daily'
      })

      const monthlyOpt = await optimizationEngine.optimizePortfolio(mockPositions, {
        objective: 'max_sharpe',
        constraints: {
          maxWeight: 0.4,
          minWeight: 0.1,
          maxTurnover: 0.5,
          riskBudget: 0.15
        },
        timeframe: '30d',
        rebalanceFrequency: 'monthly'
      })

      // Daily rebalancing should allow more frequent adjustments
      expect(dailyOpt.rebalancing.estimatedCosts.frequency).toBe('daily')
      expect(monthlyOpt.rebalancing.estimatedCosts.frequency).toBe('monthly')
    })
  })

  describe('optimization algorithms', () => {
    it('should correctly calculate expected return', () => {
      const weights = [0.4, 0.3, 0.3]
      const returns = [0.1, 0.5, -0.33]

      const expectedReturn = (optimizationEngine as any).calculateExpectedReturn(weights, returns)
      const manualExpectedReturn = 0.4 * 0.1 + 0.3 * 0.5 + 0.3 * (-0.33)

      expect(expectedReturn).toBeCloseTo(manualExpectedReturn, 5)
    })

    it('should correctly calculate portfolio risk', () => {
      const weights = [0.5, 0.5]
      const covarianceMatrix = [
        [0.04, 0.02],
        [0.02, 0.09]
      ]

      const portfolioRisk = (optimizationEngine as any).calculatePortfolioRisk(weights, covarianceMatrix)
      const manualRisk = Math.sqrt(
        0.5 * 0.5 * 0.04 +
        2 * 0.5 * 0.5 * 0.02 +
        0.5 * 0.5 * 0.09
      )

      expect(portfolioRisk).toBeCloseTo(manualRisk, 5)
    })

    it('should calculate covariance matrix correctly', () => {
      const returns = [
        [0.1, 0.05, -0.02],
        [0.08, 0.12, 0.01],
        [-0.05, 0.15, 0.03]
      ]

      const covMatrix = (optimizationEngine as any).calculateCovarianceMatrix(returns)

      expect(covMatrix).toHaveLength(3)
      expect(covMatrix[0]).toHaveLength(3)

      // Matrix should be symmetric
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          expect(covMatrix[i][j]).toBeCloseTo(covMatrix[j][i], 5)
        }
      }

      // Diagonal elements should be variances (positive)
      for (let i = 0; i < 3; i++) {
        expect(covMatrix[i][i]).toBeGreaterThanOrEqual(0)
      }
    })

    it('should solve quadratic programming problems', () => {
      const Q = [
        [2, -1],
        [-1, 2]
      ]
      const c = [-2, -6]
      const A = [[1, 1]]
      const b = [1]
      const bounds = [[0, 1], [0, 1]]

      const solution = (optimizationEngine as any).solveQP(Q, c, A, b, bounds)

      expect(solution.x).toHaveLength(2)
      expect(solution.x[0] + solution.x[1]).toBeCloseTo(1, 3) // Equality constraint
      expect(solution.x[0]).toBeGreaterThanOrEqual(0)
      expect(solution.x[1]).toBeGreaterThanOrEqual(0)
    })

    it('should handle mean reversion optimization', async () => {
      const optimization = await optimizationEngine.optimizePortfolio(mockPositions, {
        objective: 'mean_reversion',
        constraints: {
          maxWeight: 0.4,
          minWeight: 0.1,
          maxTurnover: 0.5,
          riskBudget: 0.15
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      expect(optimization.optimizationMetrics.objective).toBe('mean_reversion')

      // Should favor underperforming positions expecting reversion
      const ethPosition = optimization.optimalWeights.find(
        w => w.positionId.includes('Position3333') // ETH position with -33% return
      )

      if (ethPosition) {
        expect(ethPosition.weight).toBeGreaterThan(0.1) // Should get meaningful allocation
      }
    })

    it('should handle risk parity optimization', async () => {
      const optimization = await optimizationEngine.optimizePortfolio(mockPositions, {
        objective: 'risk_parity',
        constraints: {
          maxWeight: 0.5,
          minWeight: 0.1,
          maxTurnover: 0.5,
          riskBudget: 0.15
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      expect(optimization.optimizationMetrics.objective).toBe('risk_parity')

      // Risk contributions should be roughly equal
      const riskContributions = optimization.optimalWeights.map(w => w.riskContribution)
      const avgRiskContrib = riskContributions.reduce((sum, rc) => sum + rc, 0) / riskContributions.length

      riskContributions.forEach(rc => {
        expect(Math.abs(rc - avgRiskContrib)).toBeLessThan(avgRiskContrib * 0.5) // Within 50% of average
      })
    })
  })

  describe('rebalancing calculations', () => {
    it('should calculate accurate rebalancing costs', () => {
      const actions = [
        {
          positionId: 'position1',
          action: 'increase' as const,
          currentWeight: 0.2,
          targetWeight: 0.4,
          amountChange: 5000,
          priority: 'high' as const
        },
        {
          positionId: 'position2',
          action: 'decrease' as const,
          currentWeight: 0.5,
          targetWeight: 0.3,
          amountChange: -5000,
          priority: 'medium' as const
        }
      ]

      const costs = (optimizationEngine as any).calculateRebalancingCosts(actions, 'weekly')

      expect(costs).toMatchObject({
        transactionFees: expect.any(Number),
        slippageCosts: expect.any(Number),
        gasCosts: expect.any(Number),
        totalCosts: expect.any(Number),
        frequency: 'weekly'
      })

      expect(costs.totalCosts).toBeGreaterThan(0)
      expect(costs.totalCosts).toBe(costs.transactionFees + costs.slippageCosts + costs.gasCosts)
    })

    it('should prioritize rebalancing actions correctly', () => {
      const currentWeights = [0.7, 0.2, 0.1] // Highly unbalanced
      const targetWeights = [0.4, 0.3, 0.3] // Balanced target

      const actions = (optimizationEngine as any).generateRebalanceActions(
        mockPositions.map((pos, i) => pos.publicKey.toString()),
        currentWeights,
        targetWeights,
        mockPositions.map(pos => pos.currentValue)
      )

      // Largest deviation should have highest priority
      const highPriorityActions = actions.filter(a => a.priority === 'high')
      expect(highPriorityActions.length).toBeGreaterThan(0)

      const largestDeviationAction = actions.reduce((max, action) =>
        Math.abs(action.targetWeight - action.currentWeight) >
        Math.abs(max.targetWeight - max.currentWeight) ? action : max
      )

      expect(largestDeviationAction.priority).toBe('high')
    })

    it('should handle turnover constraints', () => {
      const currentWeights = [0.6, 0.3, 0.1]
      const targetWeights = [0.2, 0.5, 0.3] // Would require high turnover
      const maxTurnover = 0.2 // Low turnover constraint

      const constrainedWeights = (optimizationEngine as any).applyTurnoverConstraint(
        currentWeights,
        targetWeights,
        maxTurnover
      )

      const actualTurnover = constrainedWeights.reduce((sum, weight, i) =>
        sum + Math.abs(weight - currentWeights[i]), 0
      ) / 2

      expect(actualTurnover).toBeLessThanOrEqual(maxTurnover + 0.01) // Allow small numerical error
    })
  })

  describe('recommendation generation', () => {
    it('should generate appropriate recommendations for underperforming portfolios', () => {
      const underperformingPositions = mockPositions.map(pos => ({
        ...pos,
        pnl: -1000,
        pnlPercent: -10
      }))

      const recommendations = (optimizationEngine as any).generateRecommendations(
        { positions: underperformingPositions },
        {
          sharpeRatio: -0.5,
          efficiency: 0.3,
          riskLevel: 'high'
        }
      )

      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: expect.stringMatching(/^(risk_reduction|defensive_rebalancing)$/),
            priority: expect.stringMatching(/^(high|medium)$/)
          })
        ])
      )
    })

    it('should recommend efficiency improvements', () => {
      const inefficientMetrics = {
        sharpeRatio: 0.1,
        efficiency: 0.2, // Low efficiency
        riskLevel: 'medium'
      }

      const recommendations = (optimizationEngine as any).generateRecommendations(
        { positions: mockPositions },
        inefficientMetrics
      )

      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'efficiency_improvement',
            priority: expect.stringMatching(/^(high|medium)$/)
          })
        ])
      )
    })

    it('should recommend diversification for concentrated portfolios', () => {
      const concentratedPositions = [
        { ...mockPositions[0], currentValue: 40000 },
        { ...mockPositions[1], currentValue: 5000 },
        { ...mockPositions[2], currentValue: 5000 }
      ]

      const recommendations = (optimizationEngine as any).generateRecommendations(
        { positions: concentratedPositions },
        {
          sharpeRatio: 0.8,
          efficiency: 0.7,
          riskLevel: 'high'
        }
      )

      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'diversification',
            priority: expect.stringMatching(/^(high|medium)$/)
          })
        ])
      )
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle single position portfolios', async () => {
      const singlePosition = [mockPositions[0]]

      const optimization = await optimizationEngine.optimizePortfolio(singlePosition, {
        objective: 'max_sharpe',
        constraints: {
          maxWeight: 1.0,
          minWeight: 1.0,
          maxTurnover: 0.1,
          riskBudget: 0.15
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      expect(optimization.optimalWeights).toHaveLength(1)
      expect(optimization.optimalWeights[0].weight).toBeCloseTo(1.0, 3)
      expect(optimization.rebalancingActions.length > 0).toBe(false)
    })

    it('should handle positions with zero or negative values', async () => {
      const problematicPositions = [
        { ...mockPositions[0], currentValue: 0 },
        { ...mockPositions[1], currentValue: -1000 },
        { ...mockPositions[2], currentValue: 10000 }
      ]

      const optimization = await optimizationEngine.optimizePortfolio(problematicPositions, {
        objective: 'max_sharpe',
        constraints: {
          maxWeight: 1.0,
          minWeight: 0.0,
          maxTurnover: 0.5,
          riskBudget: 0.15
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      expect(optimization.optimizationMetrics.status).toBeDefined()
      expect(optimization.optimizationMetrics.totalValue).toBeGreaterThan(0)
    })

    it('should handle extreme constraint values', async () => {
      const optimization = await optimizationEngine.optimizePortfolio(mockPositions, {
        objective: 'max_sharpe',
        constraints: {
          maxWeight: 0.999,
          minWeight: 0.001,
          maxTurnover: 0.999,
          riskBudget: 0.999
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      expect(optimization.optimizationMetrics.status).toMatch(/^(optimal|suboptimal)$/)
    })

    it('should handle invalid timeframes', async () => {
      await expect(
        optimizationEngine.optimizePortfolio(mockPositions, {
          objective: 'max_sharpe',
          constraints: {
            maxWeight: 0.4,
            minWeight: 0.1,
            maxTurnover: 0.5,
            riskBudget: 0.15
          },
          timeframe: 'invalid' as any,
          rebalanceFrequency: 'weekly'
        })
      ).rejects.toThrow('Invalid timeframe')
    })

    it('should handle missing or invalid position data', async () => {
      const invalidPositions = [
        { ...mockPositions[0], currentValue: NaN },
        { ...mockPositions[1], pnlPercent: Infinity },
        { ...mockPositions[2], tokenX: { ...mockPositions[2].tokenX, price: undefined } }
      ]

      const optimization = await optimizationEngine.optimizePortfolio(invalidPositions, {
        objective: 'max_sharpe',
        constraints: {
          maxWeight: 0.4,
          minWeight: 0.1,
          maxTurnover: 0.5,
          riskBudget: 0.15
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      expect(optimization.optimizationMetrics.status).toBeDefined()
      expect(Number.isFinite(optimization.optimizationMetrics.totalValue)).toBe(true)
    })
  })

  describe('performance and caching', () => {
    it('should cache optimization results', async () => {
      const startTime = Date.now()

      const optimization1 = await optimizationEngine.optimizePortfolio(mockPositions, {
        objective: 'max_sharpe',
        constraints: {
          maxWeight: 0.4,
          minWeight: 0.1,
          maxTurnover: 0.5,
          riskBudget: 0.15
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      const firstCallTime = Date.now() - startTime

      const startTime2 = Date.now()

      const optimization2 = await optimizationEngine.optimizePortfolio(mockPositions, {
        objective: 'max_sharpe',
        constraints: {
          maxWeight: 0.4,
          minWeight: 0.1,
          maxTurnover: 0.5,
          riskBudget: 0.15
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      const secondCallTime = Date.now() - startTime2

      expect(optimization1.optimization.optimalWeights).toEqual(optimization2.optimization.optimalWeights)
      expect(secondCallTime).toBeLessThan(firstCallTime) // Should be faster due to caching
    })

    it('should handle large portfolios efficiently', async () => {
      const largePortfolio = Array(50).fill(null).map((_, i) => ({
        ...mockPositions[i % mockPositions.length],
        publicKey: new PublicKey(`Position${i.toString().padStart(44, '0')}`),
        currentValue: Math.random() * 10000 + 1000,
        pnl: (Math.random() - 0.5) * 2000,
        pnlPercent: (Math.random() - 0.5) * 40
      }))

      const startTime = Date.now()

      const optimization = await optimizationEngine.optimizePortfolio(largePortfolio, {
        objective: 'max_sharpe',
        constraints: {
          maxWeight: 0.1,
          minWeight: 0.01,
          maxTurnover: 0.5,
          riskBudget: 0.15
        },
        timeframe: '30d',
        rebalanceFrequency: 'weekly'
      })

      const executionTime = Date.now() - startTime

      expect(optimization.optimalWeights).toHaveLength(50)
      expect(executionTime).toBeLessThan(10000) // Should complete within 10 seconds
    })
  })

  describe('mathematical accuracy', () => {
    it('should maintain numerical stability', () => {
      const weights = [0.333333333, 0.333333333, 0.333333334] // Sum to 1
      const returns = [0.123456789, -0.987654321, 0.555555555]

      const expectedReturn = (optimizationEngine as any).calculateExpectedReturn(weights, returns)

      expect(Number.isFinite(expectedReturn)).toBe(true)
      expect(Math.abs(expectedReturn - (weights[0] * returns[0] + weights[1] * returns[1] + weights[2] * returns[2]))).toBeLessThan(1e-10)
    })

    it('should handle matrix operations correctly', () => {
      const matrix = [
        [4, 2, 1],
        [2, 5, 3],
        [1, 3, 6]
      ]

      const inverse = (optimizationEngine as any).invertMatrix(matrix)
      const identity = (optimizationEngine as any).multiplyMatrices(matrix, inverse)

      // Check if result is close to identity matrix
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (i === j) {
            expect(identity[i][j]).toBeCloseTo(1, 5)
          } else {
            expect(identity[i][j]).toBeCloseTo(0, 5)
          }
        }
      }
    })

    it('should handle near-singular matrices', () => {
      const nearSingular = [
        [1, 1, 1],
        [1, 1.0001, 1],
        [1, 1, 1.0001]
      ]

      const result = (optimizationEngine as any).invertMatrix(nearSingular)

      // Should either return a valid inverse or handle gracefully
      expect(result).toBeDefined()
      if (result) {
        result.forEach(row => {
          row.forEach(val => {
            expect(Number.isFinite(val)).toBe(true)
          })
        })
      }
    })
  })
})