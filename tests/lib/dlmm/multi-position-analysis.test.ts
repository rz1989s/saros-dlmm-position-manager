import { PublicKey, Connection } from '@solana/web3.js'
import { MultiPositionAnalysisEngine, CrossPositionAnalysis } from '../../../src/lib/dlmm/multi-position-analysis'
import { DLMMClient } from '../../../src/lib/dlmm/client'
import type { DLMMPosition } from '../../../src/lib/types'

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

describe('MultiPositionAnalysisEngine', () => {
  let analysisEngine: MultiPositionAnalysisEngine
  let mockClient: jest.Mocked<DLMMClient>
  let mockPositions: DLMMPosition[]

  beforeEach(() => {
    jest.clearAllMocks()

    mockClient = {
      getLbPair: jest.fn(),
      getConnection: jest.fn(() => new Connection('http://localhost:8899')),
      getUserPositions: jest.fn(),
      getBinData: jest.fn(),
      getPoolInfo: jest.fn()
    } as any

    analysisEngine = new MultiPositionAnalysisEngine(mockClient)

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
        currentValue: 10000,
        initialValue: 9500,
        pnl: 500,
        pnlPercent: 5.26,
        realizedPnl: 100,
        unrealizedPnl: 400,
        feeEarnings: 250,
        impermanentLoss: -50,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        bins: [
          {
            binId: 8388608,
            price: 1.0,
            liquidityX: 5000,
            liquidityY: 5000,
            reserveX: 5000,
            reserveY: 5000
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
        initialValue: 12000,
        pnl: 3000,
        pnlPercent: 25.0,
        realizedPnl: 500,
        unrealizedPnl: 2500,
        feeEarnings: 800,
        impermanentLoss: -300,
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
        initialValue: 7500,
        pnl: 500,
        pnlPercent: 6.67,
        realizedPnl: 200,
        unrealizedPnl: 300,
        feeEarnings: 400,
        impermanentLoss: -100,
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

  describe('analyzeMultiplePositions', () => {
    it('should perform comprehensive cross-position analysis', async () => {
      const analysis = await analysisEngine.analyzeMultiplePositions(mockPositions, {
        includeCorrelationAnalysis: true,
        includeRiskDecomposition: true,
        includeOptimizationRecommendations: true,
        includeDiversificationAnalysis: true,
        timeframe: '30d'
      })

      expect(analysis).toMatchObject({
        summary: expect.objectContaining({
          totalPositions: 3,
          totalValue: 33000,
          totalPnL: 4000,
          averageReturn: expect.any(Number),
          bestPerformingPosition: expect.any(String),
          worstPerformingPosition: expect.any(String)
        }),
        correlationAnalysis: expect.objectContaining({
          averageCorrelation: expect.any(Number),
          pairCorrelations: expect.any(Object),
          correlationMatrix: expect.any(Array),
          highCorrelationPairs: expect.any(Array),
          lowCorrelationPairs: expect.any(Array)
        }),
        riskMetrics: expect.objectContaining({
          portfolioVaR: expect.any(Number),
          portfolioVolatility: expect.any(Number),
          sharpeRatio: expect.any(Number),
          maxDrawdown: expect.any(Number),
          riskContributions: expect.any(Array)
        }),
        diversificationAnalysis: expect.objectContaining({
          overallScore: expect.any(Number),
          tokenDiversification: expect.any(Object),
          pairDiversification: expect.any(Object),
          concentrationMetrics: expect.any(Object)
        }),
        optimizationRecommendations: expect.arrayContaining([
          expect.objectContaining({
            type: expect.any(String),
            priority: expect.any(String),
            description: expect.any(String)
          })
        ])
      })
    })

    it('should calculate portfolio metrics accurately', async () => {
      const analysis = await analysisEngine.analyzeMultiplePositions(mockPositions, {
        includeCorrelationAnalysis: false,
        includeRiskDecomposition: false,
        includeOptimizationRecommendations: false,
        includeDiversificationAnalysis: false,
        timeframe: '30d'
      })

      const expectedTotalValue = mockPositions.reduce((sum, pos) => sum + pos.currentValue, 0)
      const expectedTotalPnL = mockPositions.reduce((sum, pos) => sum + pos.pnl, 0)
      const expectedAverageReturn = expectedTotalPnL / expectedTotalValue * 100

      expect(analysis.summary.totalValue).toBe(expectedTotalValue)
      expect(analysis.summary.totalPnL).toBe(expectedTotalPnL)
      expect(analysis.summary.averageReturn).toBeCloseTo(expectedAverageReturn, 2)
    })

    it('should identify best and worst performing positions', async () => {
      const analysis = await analysisEngine.analyzeMultiplePositions(mockPositions, {
        includeCorrelationAnalysis: false,
        includeRiskDecomposition: false,
        includeOptimizationRecommendations: false,
        includeDiversificationAnalysis: false,
        timeframe: '30d'
      })

      const bestPerformingPosition = mockPositions.reduce((best, current) =>
        (current.pnlPercent || 0) > (best.pnlPercent || 0) ? current : best
      )
      const worstPerformingPosition = mockPositions.reduce((worst, current) =>
        (current.pnlPercent || 0) < (worst.pnlPercent || 0) ? current : worst
      )

      expect(analysis.summary.bestPerformingPosition).toBe(bestPerformingPosition.publicKey.toString())
      expect(analysis.summary.worstPerformingPosition).toBe(worstPerformingPosition.publicKey.toString())
    })

    it('should calculate correlation analysis when enabled', async () => {
      const analysis = await analysisEngine.analyzeMultiplePositions(mockPositions, {
        includeCorrelationAnalysis: true,
        includeRiskDecomposition: false,
        includeOptimizationRecommendations: false,
        includeDiversificationAnalysis: false,
        timeframe: '30d'
      })

      expect(analysis.correlationAnalysis).toBeDefined()
      expect(analysis.correlationAnalysis.pairCorrelations).toBeDefined()
      expect(analysis.correlationAnalysis.correlationMatrix).toHaveLength(mockPositions.length)
      expect(analysis.correlationAnalysis.averageCorrelation).toBeGreaterThanOrEqual(-1)
      expect(analysis.correlationAnalysis.averageCorrelation).toBeLessThanOrEqual(1)
    })

    it('should calculate risk decomposition when enabled', async () => {
      const analysis = await analysisEngine.analyzeMultiplePositions(mockPositions, {
        includeCorrelationAnalysis: false,
        includeRiskDecomposition: true,
        includeOptimizationRecommendations: false,
        includeDiversificationAnalysis: false,
        timeframe: '30d'
      })

      expect(analysis.riskMetrics).toBeDefined()
      expect(analysis.riskMetrics.portfolioVaR).toBeGreaterThan(0)
      expect(analysis.riskMetrics.portfolioVolatility).toBeGreaterThan(0)
      expect(analysis.riskMetrics.riskContributions).toHaveLength(mockPositions.length)

      const totalRiskContribution = analysis.riskMetrics.riskContributions.reduce(
        (sum, contrib) => sum + contrib.contribution, 0
      )
      expect(totalRiskContribution).toBeCloseTo(100, 1)
    })

    it('should provide optimization recommendations when enabled', async () => {
      const analysis = await analysisEngine.analyzeMultiplePositions(mockPositions, {
        includeCorrelationAnalysis: false,
        includeRiskDecomposition: false,
        includeOptimizationRecommendations: true,
        includeDiversificationAnalysis: false,
        timeframe: '30d'
      })

      expect(analysis.optimizationRecommendations).toBeDefined()
      expect(Array.isArray(analysis.optimizationRecommendations)).toBe(true)

      if (analysis.optimizationRecommendations.length > 0) {
        analysis.optimizationRecommendations.forEach(rec => {
          expect(rec).toMatchObject({
            type: expect.any(String),
            priority: expect.stringMatching(/^(high|medium|low)$/),
            description: expect.any(String),
            expectedImpact: expect.any(String)
          })
        })
      }
    })

    it('should calculate diversification analysis when enabled', async () => {
      const analysis = await analysisEngine.analyzeMultiplePositions(mockPositions, {
        includeCorrelationAnalysis: false,
        includeRiskDecomposition: false,
        includeOptimizationRecommendations: false,
        includeDiversificationAnalysis: true,
        timeframe: '30d'
      })

      expect(analysis.diversificationAnalysis).toBeDefined()
      expect(analysis.diversificationAnalysis.overallScore).toBeGreaterThanOrEqual(0)
      expect(analysis.diversificationAnalysis.overallScore).toBeLessThanOrEqual(10)
      expect(analysis.diversificationAnalysis.tokenDiversification.uniqueTokens).toBe(4) // USDC, USDT, SOL, ETH
      expect(analysis.diversificationAnalysis.pairDiversification.uniquePairs).toBe(3)
    })

    it('should handle single position analysis', async () => {
      const singlePosition = [mockPositions[0]]

      const analysis = await analysisEngine.analyzeMultiplePositions(singlePosition, {
        includeCorrelationAnalysis: true,
        includeRiskDecomposition: true,
        includeOptimizationRecommendations: true,
        includeDiversificationAnalysis: true,
        timeframe: '30d'
      })

      expect(analysis.summary.totalPositions).toBe(1)
      expect(analysis.correlationAnalysis.averageCorrelation).toBe(1) // Single position perfectly correlated with itself
      expect(analysis.diversificationAnalysis.overallScore).toBeLessThan(5) // Poor diversification
    })

    it('should handle empty positions array', async () => {
      await expect(
        analysisEngine.analyzeMultiplePositions([], {
          includeCorrelationAnalysis: true,
          includeRiskDecomposition: true,
          includeOptimizationRecommendations: true,
          includeDiversificationAnalysis: true,
          timeframe: '30d'
        })
      ).rejects.toThrow('No positions provided for analysis')
    })

    it('should respect timeframe parameter', async () => {
      const analysis7d = await analysisEngine.analyzeMultiplePositions(mockPositions, {
        includeCorrelationAnalysis: true,
        includeRiskDecomposition: true,
        includeOptimizationRecommendations: false,
        includeDiversificationAnalysis: false,
        timeframe: '7d'
      })

      const analysis30d = await analysisEngine.analyzeMultiplePositions(mockPositions, {
        includeCorrelationAnalysis: true,
        includeRiskDecomposition: true,
        includeOptimizationRecommendations: false,
        includeDiversificationAnalysis: false,
        timeframe: '30d'
      })

      // Risk metrics should be different for different timeframes
      expect(analysis7d.riskMetrics.portfolioVaR).not.toBe(analysis30d.riskMetrics.portfolioVaR)
    })
  })

  describe('correlation calculations', () => {
    it('should calculate pairwise correlations correctly', () => {
      const returns1 = [0.1, 0.05, -0.02, 0.08, 0.12]
      const returns2 = [0.08, 0.03, -0.01, 0.06, 0.10]

      const correlation = (analysisEngine as any).calculateCorrelation(returns1, returns2)

      expect(correlation).toBeGreaterThan(0.8) // These should be highly correlated
      expect(correlation).toBeLessThanOrEqual(1)
      expect(correlation).toBeGreaterThanOrEqual(-1)
    })

    it('should handle perfectly correlated returns', () => {
      const returns = [0.1, 0.05, -0.02, 0.08, 0.12]

      const correlation = (analysisEngine as any).calculateCorrelation(returns, returns)

      expect(correlation).toBeCloseTo(1, 5)
    })

    it('should handle perfectly anti-correlated returns', () => {
      const returns1 = [0.1, 0.05, -0.02, 0.08, 0.12]
      const returns2 = [-0.1, -0.05, 0.02, -0.08, -0.12]

      const correlation = (analysisEngine as any).calculateCorrelation(returns1, returns2)

      expect(correlation).toBeCloseTo(-1, 1)
    })

    it('should handle zero correlation', () => {
      const returns1 = [0.1, -0.1, 0.1, -0.1, 0.1]
      const returns2 = [0, 0, 0, 0, 0]

      const correlation = (analysisEngine as any).calculateCorrelation(returns1, returns2)

      expect(Number.isNaN(correlation) || correlation === 0).toBe(true)
    })
  })

  describe('risk calculations', () => {
    it('should calculate Value at Risk correctly', () => {
      const returns = [0.1, 0.05, -0.02, 0.08, 0.12, -0.05, 0.03, -0.08, 0.15, -0.1]
      const confidence = 0.95

      const var95 = (analysisEngine as any).calculateVaR(returns, confidence)

      expect(var95).toBeGreaterThan(0)
      expect(var95).toBeLessThan(0.2) // Should be reasonable for these returns
    })

    it('should calculate portfolio volatility correctly', () => {
      const returns = [0.1, 0.05, -0.02, 0.08, 0.12, -0.05, 0.03, -0.08, 0.15, -0.1]

      const volatility = (analysisEngine as any).calculateVolatility(returns)

      expect(volatility).toBeGreaterThan(0)
      expect(volatility).toBeLessThan(1)
    })

    it('should calculate Sharpe ratio correctly', () => {
      const returns = [0.1, 0.05, -0.02, 0.08, 0.12]
      const riskFreeRate = 0.02

      const sharpeRatio = (analysisEngine as any).calculateSharpeRatio(returns, riskFreeRate)

      expect(Number.isFinite(sharpeRatio)).toBe(true)
    })

    it('should handle negative average returns in Sharpe ratio', () => {
      const returns = [-0.1, -0.05, -0.02, -0.08, -0.12]
      const riskFreeRate = 0.02

      const sharpeRatio = (analysisEngine as any).calculateSharpeRatio(returns, riskFreeRate)

      expect(sharpeRatio).toBeLessThan(0)
    })
  })

  describe('diversification scoring', () => {
    it('should score highly diversified portfolios higher', () => {
      const diversifiedPositions = [
        { ...mockPositions[0] }, // USDC/USDT
        { ...mockPositions[1] }, // SOL/USDC
        { ...mockPositions[2] }  // ETH/USDC
      ]

      const concentratedPositions = [
        { ...mockPositions[0] },
        { ...mockPositions[0], publicKey: new PublicKey('Position4444444444444444444444444444444444') },
        { ...mockPositions[0], publicKey: new PublicKey('Position5555555555555555555555555555555555') }
      ]

      const diversifiedScore = (analysisEngine as any).calculateDiversificationScore(diversifiedPositions)
      const concentratedScore = (analysisEngine as any).calculateDiversificationScore(concentratedPositions)

      expect(diversifiedScore).toBeGreaterThan(concentratedScore)
    })

    it('should calculate token diversification metrics', () => {
      const tokenMetrics = (analysisEngine as any).calculateTokenDiversification(mockPositions)

      expect(tokenMetrics.uniqueTokens).toBe(4) // USDC, USDT, SOL, ETH
      expect(tokenMetrics.herfindahlIndex).toBeGreaterThan(0)
      expect(tokenMetrics.herfindahlIndex).toBeLessThanOrEqual(1)
    })

    it('should identify concentration risks', () => {
      const highConcentrationPositions = Array(10).fill(null).map((_, i) => ({
        ...mockPositions[0],
        publicKey: new PublicKey(`Position${i.toString().padStart(44, '0')}`),
        currentValue: i === 0 ? 90000 : 1000 // One position dominates
      }))

      const concentrationMetrics = (analysisEngine as any).calculateConcentrationMetrics(highConcentrationPositions)

      expect(concentrationMetrics.concentrationRisk).toBeGreaterThan(70) // High concentration
      expect(concentrationMetrics.top5Concentration).toBeGreaterThan(0.8) // Top 5 positions hold > 80%
    })
  })

  describe('optimization recommendations', () => {
    it('should recommend rebalancing for unbalanced portfolios', () => {
      const unbalancedPositions = [
        { ...mockPositions[0], currentValue: 50000 }, // Dominant position
        { ...mockPositions[1], currentValue: 1000 },
        { ...mockPositions[2], currentValue: 1000 }
      ]

      const recommendations = (analysisEngine as any).generateOptimizationRecommendations(unbalancedPositions)

      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'rebalance',
            priority: expect.stringMatching(/^(high|medium)$/)
          })
        ])
      )
    })

    it('should recommend diversification for concentrated portfolios', () => {
      const concentratedPositions = [
        { ...mockPositions[0] },
        { ...mockPositions[0], publicKey: new PublicKey('Position4444444444444444444444444444444444') },
        { ...mockPositions[0], publicKey: new PublicKey('Position5555555555555555555555555555555555') }
      ]

      const recommendations = (analysisEngine as any).generateOptimizationRecommendations(concentratedPositions)

      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'diversify',
            priority: expect.stringMatching(/^(high|medium)$/)
          })
        ])
      )
    })

    it('should recommend risk reduction for high-risk portfolios', () => {
      const highRiskPositions = mockPositions.map(pos => ({
        ...pos,
        pnlPercent: -20, // All positions losing money
        currentValue: pos.currentValue * 0.8
      }))

      const recommendations = (analysisEngine as any).generateOptimizationRecommendations(highRiskPositions)

      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: expect.stringMatching(/^(hedge|reduce_risk)$/),
            priority: 'high'
          })
        ])
      )
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle positions with missing price data', async () => {
      const positionsWithMissingPrices = mockPositions.map(pos => ({
        ...pos,
        tokenX: { ...pos.tokenX, price: undefined },
        tokenY: { ...pos.tokenY, price: undefined }
      }))

      const analysis = await analysisEngine.analyzeMultiplePositions(positionsWithMissingPrices, {
        includeCorrelationAnalysis: false,
        includeRiskDecomposition: false,
        includeOptimizationRecommendations: false,
        includeDiversificationAnalysis: false,
        timeframe: '30d'
      })

      expect(analysis.summary.totalValue).toBeGreaterThanOrEqual(0)
      expect(Number.isFinite(analysis.summary.averageReturn)).toBe(true)
    })

    it('should handle positions with extreme values', async () => {
      const extremePositions = [
        { ...mockPositions[0], currentValue: 0.01, pnl: -0.009 },
        { ...mockPositions[1], currentValue: 1000000, pnl: 500000 },
        { ...mockPositions[2], currentValue: 5000, pnl: -4000 }
      ]

      const analysis = await analysisEngine.analyzeMultiplePositions(extremePositions, {
        includeCorrelationAnalysis: true,
        includeRiskDecomposition: true,
        includeOptimizationRecommendations: true,
        includeDiversificationAnalysis: true,
        timeframe: '30d'
      })

      expect(Number.isFinite(analysis.summary.averageReturn)).toBe(true)
      expect(Number.isFinite(analysis.riskMetrics.portfolioVaR)).toBe(true)
    })

    it('should handle invalid timeframe parameters', async () => {
      await expect(
        analysisEngine.analyzeMultiplePositions(mockPositions, {
          includeCorrelationAnalysis: false,
          includeRiskDecomposition: false,
          includeOptimizationRecommendations: false,
          includeDiversificationAnalysis: false,
          timeframe: 'invalid' as any
        })
      ).rejects.toThrow('Invalid timeframe')
    })

    it('should handle positions with identical returns', () => {
      const identicalReturns = [0.05, 0.05, 0.05, 0.05, 0.05]

      const volatility = (analysisEngine as any).calculateVolatility(identicalReturns)
      const var95 = (analysisEngine as any).calculateVaR(identicalReturns, 0.95)

      expect(volatility).toBe(0) // No volatility for identical returns
      expect(var95).toBe(0) // No risk for identical returns
    })
  })

  describe('caching and performance', () => {
    it('should cache analysis results', async () => {
      const startTime = Date.now()

      const analysis1 = await analysisEngine.analyzeMultiplePositions(mockPositions, {
        includeCorrelationAnalysis: true,
        includeRiskDecomposition: true,
        includeOptimizationRecommendations: true,
        includeDiversificationAnalysis: true,
        timeframe: '30d'
      })

      const firstCallTime = Date.now() - startTime

      const startTime2 = Date.now()

      const analysis2 = await analysisEngine.analyzeMultiplePositions(mockPositions, {
        includeCorrelationAnalysis: true,
        includeRiskDecomposition: true,
        includeOptimizationRecommendations: true,
        includeDiversificationAnalysis: true,
        timeframe: '30d'
      })

      const secondCallTime = Date.now() - startTime2

      expect(analysis1).toEqual(analysis2)
      expect(secondCallTime).toBeLessThan(firstCallTime) // Should be faster due to caching
    })

    it('should handle large portfolios efficiently', async () => {
      const largePortfolio = Array(100).fill(null).map((_, i) => ({
        ...mockPositions[i % mockPositions.length],
        publicKey: new PublicKey(`Position${i.toString().padStart(44, '0')}`),
        currentValue: Math.random() * 10000,
        pnl: (Math.random() - 0.5) * 1000
      }))

      const startTime = Date.now()

      const analysis = await analysisEngine.analyzeMultiplePositions(largePortfolio, {
        includeCorrelationAnalysis: true,
        includeRiskDecomposition: true,
        includeOptimizationRecommendations: true,
        includeDiversificationAnalysis: true,
        timeframe: '30d'
      })

      const executionTime = Date.now() - startTime

      expect(analysis.summary.totalPositions).toBe(100)
      expect(executionTime).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })

  describe('mathematical accuracy', () => {
    it('should maintain precision in correlation calculations', () => {
      const returns1 = [0.123456789, 0.987654321, -0.111111111]
      const returns2 = [0.246913578, 1.975308642, -0.222222222]

      const correlation = (analysisEngine as any).calculateCorrelation(returns1, returns2)

      expect(correlation).toBeCloseTo(1, 6) // Should maintain high precision
    })

    it('should handle zero variance in risk calculations', () => {
      const constantReturns = [0.05, 0.05, 0.05, 0.05, 0.05]

      const volatility = (analysisEngine as any).calculateVolatility(constantReturns)
      const sharpeRatio = (analysisEngine as any).calculateSharpeRatio(constantReturns, 0.02)

      expect(volatility).toBe(0)
      expect(sharpeRatio).toBe(Infinity) // Infinite Sharpe ratio for zero volatility with positive excess return
    })

    it('should normalize correlation matrix correctly', async () => {
      const analysis = await analysisEngine.analyzeMultiplePositions(mockPositions, {
        includeCorrelationAnalysis: true,
        includeRiskDecomposition: false,
        includeOptimizationRecommendations: false,
        includeDiversificationAnalysis: false,
        timeframe: '30d'
      })

      const matrix = analysis.correlationAnalysis.correlationMatrix

      // Diagonal elements should be 1
      for (let i = 0; i < matrix.length; i++) {
        expect(matrix[i][i]).toBeCloseTo(1, 5)
      }

      // Matrix should be symmetric
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
          expect(matrix[i][j]).toBeCloseTo(matrix[j][i], 5)
        }
      }
    })
  })
})