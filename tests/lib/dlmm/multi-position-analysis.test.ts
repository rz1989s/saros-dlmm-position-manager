import { PublicKey, Connection } from '@solana/web3.js'
import { MultiPositionAnalysisEngine } from '../../../src/lib/dlmm/multi-position-analysis'
import type { EnhancedDLMMPosition, PositionAnalytics } from '../../../src/lib/types'

// Mock the DLMM client
jest.mock('../../../src/lib/dlmm/client', () => ({
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
  let mockPositions: EnhancedDLMMPosition[]
  let mockAnalytics: PositionAnalytics[]
  let mockUserAddress: PublicKey

  beforeEach(() => {
    jest.clearAllMocks()

    analysisEngine = new MultiPositionAnalysisEngine(new Connection('http://localhost:8899'))
    mockUserAddress = new PublicKey('User1111111111111111111111111111111111111111')

    mockPositions = [
      {
        id: 'position-1',
        publicKey: new PublicKey('Position1111111111111111111111111111111111'),
        pair: new PublicKey('Pool1111111111111111111111111111111111111111'),
        poolAddress: new PublicKey('Pool1111111111111111111111111111111111111111'),
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
        feesEarned: {
          tokenX: '250',
          tokenY: '250'
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
        lastUpdated: new Date(),
        updatedAt: new Date(),
        isActive: true,
        bins: [
          {
            binId: 8388608,
            price: 1.0,
            liquidityX: '5000',
            liquidityY: '5000',
            isActive: true,
            feeRate: 0.003,
            volume24h: '100000'
          }
        ]
      },
      {
        id: 'position-2',
        publicKey: new PublicKey('Position2222222222222222222222222222222222'),
        pair: new PublicKey('Pool2222222222222222222222222222222222222222'),
        poolAddress: new PublicKey('Pool2222222222222222222222222222222222222222'),
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
        liquidityAmount: '15000',
        feesEarned: {
          tokenX: '800',
          tokenY: '0'
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
        lastUpdated: new Date(),
        updatedAt: new Date(),
        isActive: true,
        bins: [
          {
            binId: 8388600,
            price: 100.0,
            liquidityX: '75',
            liquidityY: '7500',
            isActive: true,
            feeRate: 0.003,
            volume24h: '200000'
          }
        ]
      },
      {
        id: 'position-3',
        publicKey: new PublicKey('Position3333333333333333333333333333333333'),
        pair: new PublicKey('Pool3333333333333333333333333333333333333333'),
        poolAddress: new PublicKey('Pool3333333333333333333333333333333333333333'),
        userAddress: mockUserAddress,
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
        activeBin: 8388590,
        liquidityAmount: '8000',
        feesEarned: {
          tokenX: '400',
          tokenY: '0'
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
        lastUpdated: new Date(),
        updatedAt: new Date(),
        isActive: true,
        bins: [
          {
            binId: 8388590,
            price: 2000.0,
            liquidityX: '2',
            liquidityY: '4000',
            isActive: true,
            feeRate: 0.003,
            volume24h: '150000'
          }
        ]
      }
    ]

    // Create analytics array matching positions
    mockAnalytics = mockPositions.map((pos): PositionAnalytics => ({
      totalValue: pos.currentValue || 0,
      pnl: {
        amount: pos.pnl || 0,
        percentage: pos.pnlPercent || 0
      },
      feesEarned: pos.feeEarnings || 0,
      impermanentLoss: {
        amount: pos.impermanentLoss || 0,
        percentage: (pos.impermanentLoss || 0) / (pos.initialValue || 1) * 100
      },
      apr: 12.5, // Simplified
      duration: Date.now() - pos.createdAt.getTime()
    }))
  })

  describe('analyzeMultiplePositions', () => {
    it('should perform comprehensive cross-position analysis', async () => {
      const analysis = await analysisEngine.analyzeMultiplePositions(
        mockPositions,
        mockAnalytics,
        mockUserAddress,
        false
      )

      // Verify structure matches CrossPositionAnalytics interface
      expect(analysis).toBeDefined()
      expect(analysis.positions).toHaveLength(3)
      expect(analysis.correlationMatrix).toBeDefined()
      expect(analysis.correlationMatrix.pairs).toBeInstanceOf(Array)
      expect(analysis.riskDecomposition).toBeDefined()
      expect(analysis.riskDecomposition.totalRisk).toBeGreaterThanOrEqual(0)
      expect(analysis.performanceAttribution).toBeDefined()
      expect(analysis.liquidityAnalysis).toBeDefined()
      expect(analysis.exposureAnalysis).toBeDefined()
      expect(analysis.optimizationOpportunities).toBeInstanceOf(Array)
      expect(analysis.portfolioMetrics).toBeDefined()
      expect(analysis.portfolioMetrics.totalValue).toBeGreaterThan(0)
      expect(analysis.timeSeriesAnalysis).toBeDefined()
    })

    it('should calculate portfolio metrics accurately', async () => {
      const analysis = await analysisEngine.analyzeMultiplePositions(
        mockPositions,
        mockAnalytics,
        mockUserAddress,
        false
      )

      const expectedTotalValue = mockPositions.reduce((sum: number, pos) => sum + (pos.currentValue || 0), 0)

      expect(analysis.portfolioMetrics.totalValue).toBeCloseTo(expectedTotalValue, 0)
      expect(analysis.portfolioMetrics.totalReturn).toBeGreaterThanOrEqual(0)
    })

    it('should identify correlation patterns', async () => {
      const analysis = await analysisEngine.analyzeMultiplePositions(
        mockPositions,
        mockAnalytics,
        mockUserAddress,
        false
      )

      expect(analysis.correlationMatrix.pairs.length).toBeGreaterThan(0)
      expect(analysis.correlationMatrix.averageCorrelation).toBeGreaterThanOrEqual(-1)
      expect(analysis.correlationMatrix.averageCorrelation).toBeLessThanOrEqual(1)
    })

    it('should calculate risk decomposition', async () => {
      const analysis = await analysisEngine.analyzeMultiplePositions(
        mockPositions,
        mockAnalytics,
        mockUserAddress,
        false
      )

      expect(analysis.riskDecomposition).toBeDefined()
      expect(analysis.riskDecomposition.totalRisk).toBeGreaterThanOrEqual(0)
      expect(analysis.riskDecomposition.riskContributions).toHaveLength(mockPositions.length)

      const totalRiskContribution = analysis.riskDecomposition.riskContributions.reduce(
        (sum: number, contrib) => sum + contrib.riskPercentage, 0
      )
      expect(totalRiskContribution).toBeGreaterThanOrEqual(0)
    })

    it('should provide optimization recommendations', async () => {
      const analysis = await analysisEngine.analyzeMultiplePositions(
        mockPositions,
        mockAnalytics,
        mockUserAddress,
        false
      )

      expect(analysis.optimizationOpportunities).toBeDefined()
      expect(Array.isArray(analysis.optimizationOpportunities)).toBe(true)

      if (analysis.optimizationOpportunities.length > 0) {
        analysis.optimizationOpportunities.forEach((rec) => {
          expect(rec).toMatchObject({
            type: expect.any(String),
            priority: expect.stringMatching(/^(critical|high|medium|low)$/),
            description: expect.any(String)
          })
        })
      }
    })

    it('should handle single position analysis', async () => {
      const singlePosition = [mockPositions[0]]
      const singleAnalytics = [mockAnalytics[0]]

      const analysis = await analysisEngine.analyzeMultiplePositions(
        singlePosition,
        singleAnalytics,
        mockUserAddress,
        false
      )

      expect(analysis.positions).toHaveLength(1)
      expect(analysis.portfolioMetrics).toBeDefined()
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

  describe('cache management', () => {
    it('should provide cache clearing functionality', () => {
      analysisEngine.clearCache()
      const stats = analysisEngine.getCacheStats()

      expect(stats.analysisCache).toBe(0)
      expect(stats.correlationCache).toBe(0)
    })

    it('should provide cache statistics', () => {
      const stats = analysisEngine.getCacheStats()

      expect(stats).toHaveProperty('analysisCache')
      expect(stats).toHaveProperty('correlationCache')
      expect(typeof stats.analysisCache).toBe('number')
      expect(typeof stats.correlationCache).toBe('number')
    })
  })

  describe('mathematical accuracy', () => {
    it('should maintain precision in correlation calculations', () => {
      const returns1 = [0.123456789, 0.987654321, -0.111111111]
      const returns2 = [0.246913578, 1.975308642, -0.222222222]

      const correlation = (analysisEngine as any).calculateCorrelation(returns1, returns2)

      expect(typeof correlation).toBe('number')
      expect(correlation).toBeGreaterThanOrEqual(-1)
      expect(correlation).toBeLessThanOrEqual(1)
    })

    it('should handle zero variance in risk calculations', () => {
      const constantReturns = [0.05, 0.05, 0.05, 0.05, 0.05]

      const volatility = (analysisEngine as any).calculateVolatility(constantReturns)

      expect(volatility).toBe(0)
    })
  })
})