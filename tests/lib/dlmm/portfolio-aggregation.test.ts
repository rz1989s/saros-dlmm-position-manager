import { PublicKey, Connection } from '@solana/web3.js'
import {
  PortfolioAggregationManager,
  type PortfolioPosition,
  type PortfolioSummary,
  type ConsolidationOpportunity,
  type DiversificationAnalysis,
  type RebalancingStrategy
} from '../../../src/lib/dlmm/portfolio-aggregation'
import type { DLMMPosition, PositionAnalytics } from '../../../src/lib/types'

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

describe('PortfolioAggregationManager', () => {
  let portfolioManager: PortfolioAggregationManager
  let mockConnection: Connection
  let mockUserAddress: PublicKey
  let mockPositions: DLMMPosition[]
  let mockAnalytics: PositionAnalytics[]

  beforeEach(() => {
    jest.clearAllMocks()
    mockConnection = new Connection('http://localhost:8899')
    portfolioManager = new PortfolioAggregationManager(mockConnection)
    mockUserAddress = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')

    // Create comprehensive mock positions with various scenarios
    mockPositions = [
      // USDC/USDT positions (2 positions - consolidation opportunity)
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
        activeBin: 8388600,
        liquidityAmount: '15000',
        feesEarned: { tokenX: '75', tokenY: '75' },
        createdAt: new Date(),
        lastUpdated: new Date(),
        isActive: true
      },
      // SOL/USDC position
      {
        id: 'position-3',
        poolAddress: new PublicKey('BetterPoolAddress3333333333333333333333333333'),
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
        activeBin: 8388590,
        liquidityAmount: '5000',
        feesEarned: { tokenX: '25', tokenY: '2500' },
        createdAt: new Date(),
        lastUpdated: new Date(),
        isActive: true
      },
      // ETH/USDC position
      {
        id: 'position-4',
        poolAddress: new PublicKey('EthPoolAddress444444444444444444444444444444'),
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
        activeBin: 8388580,
        liquidityAmount: '8000',
        feesEarned: { tokenX: '4', tokenY: '8000' },
        createdAt: new Date(),
        lastUpdated: new Date(),
        isActive: true
      }
    ]

    // Create corresponding analytics
    mockAnalytics = [
      {
        totalValue: 10000,
        pnl: { amount: 500, percentage: 5.0 },
        feesEarned: 100,
        impermanentLoss: { amount: -50, percentage: -0.5 },
        apr: 12.5,
        duration: 30
      },
      {
        totalValue: 15000,
        pnl: { amount: 750, percentage: 5.0 },
        feesEarned: 150,
        impermanentLoss: { amount: -75, percentage: -0.5 },
        apr: 12.5,
        duration: 30
      },
      {
        totalValue: 5000,
        pnl: { amount: 1000, percentage: 20.0 },
        feesEarned: 2525,
        impermanentLoss: { amount: -200, percentage: -4.0 },
        apr: 25.0,
        duration: 60
      },
      {
        totalValue: 8000,
        pnl: { amount: 1600, percentage: 20.0 },
        feesEarned: 8004,
        impermanentLoss: { amount: -320, percentage: -4.0 },
        apr: 30.0,
        duration: 45
      }
    ]
  })

  afterEach(() => {
    portfolioManager.clearCache()
  })

  describe('aggregatePositionsByPair', () => {
    it('should aggregate positions by token pairs correctly', async () => {
      const portfolioPositions = await portfolioManager.aggregatePositionsByPair(
        mockPositions,
        mockUserAddress
      )

      expect(portfolioPositions).toHaveLength(3) // USDC/USDT, SOL/USDC, ETH/USDC

      // Find USDC/USDT aggregated position
      const usdcUsdtPosition = portfolioPositions.find(p => p.tokenPair === 'USDC/USDT')
      expect(usdcUsdtPosition).toBeDefined()
      expect(usdcUsdtPosition!.positions).toHaveLength(2)
      expect(usdcUsdtPosition!.aggregatedMetrics.positionCount).toBe(2)
      expect(parseFloat(usdcUsdtPosition!.aggregatedMetrics.totalLiquidity)).toBe(25000)
    })

    it('should cache aggregated results', async () => {
      const positions1 = await portfolioManager.aggregatePositionsByPair(
        mockPositions,
        mockUserAddress
      )

      const positions2 = await portfolioManager.aggregatePositionsByPair(
        mockPositions,
        mockUserAddress
      )

      expect(positions1).toEqual(positions2)
    })

    it('should sort positions by total value', async () => {
      const portfolioPositions = await portfolioManager.aggregatePositionsByPair(
        mockPositions,
        mockUserAddress
      )

      for (let i = 1; i < portfolioPositions.length; i++) {
        expect(portfolioPositions[i].aggregatedMetrics.totalValue).toBeLessThanOrEqual(
          portfolioPositions[i - 1].aggregatedMetrics.totalValue
        )
      }
    })

    it('should calculate risk metrics accurately', async () => {
      const portfolioPositions = await portfolioManager.aggregatePositionsByPair(
        mockPositions,
        mockUserAddress
      )

      portfolioPositions.forEach(position => {
        expect(position.riskMetrics).toMatchObject({
          concentrationRisk: expect.any(Number),
          correlationRisk: expect.any(Number),
          liquidityRisk: expect.any(Number),
          overallRiskScore: expect.any(Number)
        })

        expect(position.riskMetrics.overallRiskScore).toBeGreaterThan(0)
        expect(position.riskMetrics.overallRiskScore).toBeLessThan(100)
      })
    })

    it('should handle single position per pair', async () => {
      const singlePositions = [mockPositions[2]] // Only SOL/USDC

      const portfolioPositions = await portfolioManager.aggregatePositionsByPair(
        singlePositions,
        mockUserAddress
      )

      expect(portfolioPositions).toHaveLength(1)
      expect(portfolioPositions[0].aggregatedMetrics.positionCount).toBe(1)
      expect(portfolioPositions[0].optimization.canConsolidate).toBe(false)
    })

    it('should handle empty positions array', async () => {
      const portfolioPositions = await portfolioManager.aggregatePositionsByPair(
        [],
        mockUserAddress
      )

      expect(portfolioPositions).toEqual([])
    })

    it('should calculate diversification scores correctly', async () => {
      const portfolioPositions = await portfolioManager.aggregatePositionsByPair(
        mockPositions,
        mockUserAddress
      )

      const multiPositionPair = portfolioPositions.find(p => p.positions.length > 1)
      const singlePositionPair = portfolioPositions.find(p => p.positions.length === 1)

      if (multiPositionPair && singlePositionPair) {
        expect(multiPositionPair.diversificationScore).toBeGreaterThan(
          singlePositionPair.diversificationScore
        )
      }
    })
  })

  describe('generatePortfolioSummary', () => {
    it('should generate comprehensive portfolio summary', async () => {
      const summary = await portfolioManager.generatePortfolioSummary(
        mockPositions,
        mockAnalytics,
        mockUserAddress
      )

      expect(summary).toMatchObject({
        totalPositions: mockPositions.length,
        totalValue: expect.any(Number),
        totalLiquidity: expect.any(String),
        diversifiedPairs: 3, // USDC/USDT, SOL/USDC, ETH/USDC
        topPerformingPairs: expect.any(Array),
        underPerformingPairs: expect.any(Array),
        riskDistribution: expect.objectContaining({
          low: expect.any(Number),
          medium: expect.any(Number),
          high: expect.any(Number)
        }),
        assetAllocation: expect.arrayContaining([
          expect.objectContaining({
            symbol: expect.any(String),
            percentage: expect.any(Number),
            value: expect.any(Number),
            positions: expect.any(Number)
          })
        ]),
        performanceMetrics: expect.objectContaining({
          totalPnl: expect.any(Number),
          totalPnlPercentage: expect.any(Number),
          bestPosition: expect.any(Object),
          worstPosition: expect.any(Object),
          avgApr: expect.any(Number),
          totalFeesEarned: expect.any(Number)
        })
      })
    })

    it('should calculate total values correctly', async () => {
      const summary = await portfolioManager.generatePortfolioSummary(
        mockPositions,
        mockAnalytics,
        mockUserAddress
      )

      const expectedTotalValue = mockAnalytics.reduce((sum, a) => sum + a.totalValue, 0)
      const expectedTotalFees = mockAnalytics.reduce((sum, a) => sum + a.feesEarned, 0)
      const expectedTotalPnl = mockAnalytics.reduce((sum, a) => sum + a.pnl.amount, 0)

      expect(summary.totalValue).toBeCloseTo(expectedTotalValue, 2)
      expect(summary.performanceMetrics.totalFeesEarned).toBeCloseTo(expectedTotalFees, 2)
      expect(summary.performanceMetrics.totalPnl).toBeCloseTo(expectedTotalPnl, 2)
    })

    it('should identify best and worst performing positions', async () => {
      const summary = await portfolioManager.generatePortfolioSummary(
        mockPositions,
        mockAnalytics,
        mockUserAddress
      )

      expect(summary.performanceMetrics.bestPosition).toBeDefined()
      expect(summary.performanceMetrics.worstPosition).toBeDefined()

      // Best position should have highest PnL
      const bestPnl = mockAnalytics.reduce((max, a, i) =>
        a.pnl.amount > max.pnl ? { pnl: a.pnl.amount, index: i } : max,
        { pnl: -Infinity, index: 0 }
      )

      expect(summary.performanceMetrics.bestPosition!.id).toBe(
        mockPositions[bestPnl.index].id
      )
    })

    it('should calculate asset allocation percentages correctly', async () => {
      const summary = await portfolioManager.generatePortfolioSummary(
        mockPositions,
        mockAnalytics,
        mockUserAddress
      )

      const totalPercentage = summary.assetAllocation.reduce(
        (sum, asset) => sum + asset.percentage,
        0
      )

      expect(totalPercentage).toBeCloseTo(200, 1) // ~200% because each position contributes to 2 assets
    })

    it('should handle zero total value gracefully', async () => {
      const zeroAnalytics = mockAnalytics.map(a => ({ ...a, totalValue: 0 }))

      const summary = await portfolioManager.generatePortfolioSummary(
        mockPositions,
        zeroAnalytics,
        mockUserAddress
      )

      expect(summary.performanceMetrics.totalPnlPercentage).toBe(0)
      expect(Number.isFinite(summary.performanceMetrics.avgApr)).toBe(true)
    })

    it('should sort asset allocation by value', async () => {
      const summary = await portfolioManager.generatePortfolioSummary(
        mockPositions,
        mockAnalytics,
        mockUserAddress
      )

      for (let i = 1; i < summary.assetAllocation.length; i++) {
        expect(summary.assetAllocation[i].value).toBeLessThanOrEqual(
          summary.assetAllocation[i - 1].value
        )
      }
    })
  })

  describe('identifyConsolidationOpportunities', () => {
    it('should identify consolidation opportunities for duplicate pairs', async () => {
      const opportunities = await portfolioManager.identifyConsolidationOpportunities(
        mockPositions,
        mockUserAddress
      )

      expect(opportunities).toHaveLength(1) // Only USDC/USDT pair has multiple positions

      const usdcUsdtOpportunity = opportunities[0]
      expect(usdcUsdtOpportunity.targetPair).toBe('USDC/USDT')
      expect(usdcUsdtOpportunity.positions).toHaveLength(2)
      expect(usdcUsdtOpportunity.currentPools).toHaveLength(2)
    })

    it('should calculate consolidation benefits accurately', async () => {
      const opportunities = await portfolioManager.identifyConsolidationOpportunities(
        mockPositions,
        mockUserAddress
      )

      opportunities.forEach(opp => {
        expect(opp.benefits).toMatchObject({
          reducedGasCosts: expect.any(Number),
          improvedLiquidity: expect.any(Number),
          betterApr: expect.any(Number),
          simplifiedManagement: true
        })

        expect(opp.consolidationCost).toBeGreaterThan(0)
        expect(opp.projectedSavings).toBeGreaterThan(0)
      })
    })

    it('should prioritize opportunities by projected savings', async () => {
      // Create more consolidation opportunities
      const duplicatedPositions = [
        ...mockPositions,
        { ...mockPositions[2], id: 'position-5', poolAddress: new PublicKey('DuplicateSOLUSDC44444444444444444444444444') }
      ]

      const opportunities = await portfolioManager.identifyConsolidationOpportunities(
        duplicatedPositions,
        mockUserAddress
      )

      for (let i = 1; i < opportunities.length; i++) {
        const current = opportunities[i]
        const previous = opportunities[i - 1]

        // If same priority, should be sorted by projected savings
        if (current.priority === previous.priority) {
          expect(current.projectedSavings).toBeLessThanOrEqual(previous.projectedSavings)
        }
      })
    })

    it('should handle positions with no consolidation opportunities', async () => {
      const uniquePositions = [mockPositions[2], mockPositions[3]] // SOL/USDC and ETH/USDC

      const opportunities = await portfolioManager.identifyConsolidationOpportunities(
        uniquePositions,
        mockUserAddress
      )

      expect(opportunities).toEqual([])
    })

    it('should assign appropriate priority levels', async () => {
      const opportunities = await portfolioManager.identifyConsolidationOpportunities(
        mockPositions,
        mockUserAddress
      )

      opportunities.forEach(opp => {
        expect(['high', 'medium', 'low']).toContain(opp.priority)

        // High priority should have significant projected savings
        if (opp.priority === 'high') {
          expect(opp.projectedSavings).toBeGreaterThan(opp.consolidationCost * 3)
        }
      })
    })
  })

  describe('analyzeDiversification', () => {
    it('should analyze portfolio diversification comprehensively', () => {
      const analysis = portfolioManager.analyzeDiversification(mockPositions)

      expect(analysis).toMatchObject({
        overallScore: expect.any(Number),
        tokenDiversification: expect.objectContaining({
          uniqueTokens: expect.any(Number),
          dominantToken: expect.any(String),
          dominantPercentage: expect.any(Number),
          recommendations: expect.any(Array)
        }),
        pairDiversification: expect.objectContaining({
          uniquePairs: expect.any(Number),
          topPairs: expect.any(Array),
          concentrationWarnings: expect.any(Array)
        }),
        poolDiversification: expect.objectContaining({
          uniquePools: expect.any(Number),
          averagePoolSize: expect.any(String),
          liquidityDistribution: expect.stringMatching(/concentrated|distributed|balanced/)
        })
      })
    })

    it('should calculate diversification scores correctly', () => {
      const analysis = portfolioManager.analyzeDiversification(mockPositions)

      expect(analysis.overallScore).toBeGreaterThan(0)
      expect(analysis.overallScore).toBeLessThanOrEqual(100)

      // Should have 4 unique tokens (USDC, USDT, SOL, ETH)
      expect(analysis.tokenDiversification.uniqueTokens).toBe(4)

      // Should have 3 unique pairs
      expect(analysis.pairDiversification.uniquePairs).toBe(3)

      // Should have 4 unique pools
      expect(analysis.poolDiversification.uniquePools).toBe(4)
    })

    it('should identify dominant tokens correctly', () => {
      const analysis = portfolioManager.analyzeDiversification(mockPositions)

      // USDC appears in all positions, should likely be dominant
      expect(analysis.tokenDiversification.dominantToken).toBe('USDC')
      expect(analysis.tokenDiversification.dominantPercentage).toBeGreaterThan(0)
    })

    it('should provide appropriate diversification recommendations', () => {
      const analysis = portfolioManager.analyzeDiversification(mockPositions)

      expect(Array.isArray(analysis.tokenDiversification.recommendations)).toBe(true)

      // Should provide recommendations based on diversification level
      if (analysis.tokenDiversification.dominantPercentage > 50) {
        expect(analysis.tokenDiversification.recommendations).toEqual(
          expect.arrayContaining([
            expect.stringContaining('Reduce exposure')
          ])
        )
      }
    })

    it('should identify concentration warnings', () => {
      const analysis = portfolioManager.analyzeDiversification(mockPositions)

      analysis.pairDiversification.concentrationWarnings.forEach(warning => {
        expect(warning).toContain('High concentration')
        expect(warning).toContain('%')
      })
    })

    it('should handle single position portfolio', () => {
      const singlePosition = [mockPositions[0]]
      const analysis = portfolioManager.analyzeDiversification(singlePosition)

      expect(analysis.overallScore).toBeLessThan(50) // Should have low diversification score
      expect(analysis.tokenDiversification.uniqueTokens).toBe(2) // USDC and USDT
      expect(analysis.pairDiversification.uniquePairs).toBe(1)
      expect(analysis.poolDiversification.uniquePools).toBe(1)
    })

    it('should handle large portfolios correctly', () => {
      // Create a large portfolio (100+ positions)
      const largePortfolio: DLMMPosition[] = []
      for (let i = 0; i < 100; i++) {
        largePortfolio.push({
          ...mockPositions[i % mockPositions.length],
          id: `position-${i}`,
          poolAddress: new PublicKey(`Pool${i.toString().padStart(44, '0')}`),
          liquidityAmount: (Math.random() * 10000).toString()
        })
      }

      const analysis = portfolioManager.analyzeDiversification(largePortfolio)

      expect(analysis.overallScore).toBeGreaterThan(0)
      expect(analysis.poolDiversification.uniquePools).toBe(100)
      expect(analysis.poolDiversification.liquidityDistribution).toBe('distributed')
    })
  })

  describe('mathematical calculations accuracy', () => {
    it('should calculate weighted APR correctly', async () => {
      const portfolioPositions = await portfolioManager.aggregatePositionsByPair(
        mockPositions,
        mockUserAddress
      )

      const usdcUsdtPosition = portfolioPositions.find(p => p.tokenPair === 'USDC/USDT')!

      // Weighted APR should be calculated based on liquidity amounts
      const totalLiquidity = parseFloat(usdcUsdtPosition.aggregatedMetrics.totalLiquidity)
      expect(totalLiquidity).toBe(25000) // 10000 + 15000
      expect(usdcUsdtPosition.aggregatedMetrics.weightedApr).toBeGreaterThan(0)
    })

    it('should calculate concentration risk accurately', async () => {
      const portfolioPositions = await portfolioManager.aggregatePositionsByPair(
        mockPositions,
        mockUserAddress
      )

      portfolioPositions.forEach(position => {
        // Multiple positions should have lower concentration risk
        if (position.positions.length > 1) {
          expect(position.riskMetrics.concentrationRisk).toBeLessThan(50)
        } else {
          expect(position.riskMetrics.concentrationRisk).toBeGreaterThan(50)
        }
      })
    })

    it('should calculate portfolio value with oracle prices', async () => {
      const summary = await portfolioManager.generatePortfolioSummary(
        mockPositions,
        mockAnalytics,
        mockUserAddress
      )

      // Total value should account for oracle prices
      expect(summary.totalValue).toBeGreaterThan(0)

      // ETH positions should have higher value due to price (2000 vs 1)
      const ethAllocation = summary.assetAllocation.find(a => a.symbol === 'ETH')
      const usdcAllocation = summary.assetAllocation.find(a => a.symbol === 'USDC')

      if (ethAllocation && usdcAllocation) {
        // ETH should have higher per-token value
        const ethPerTokenValue = ethAllocation.value / ethAllocation.positions
        const usdcPerTokenValue = usdcAllocation.value / usdcAllocation.positions

        expect(ethPerTokenValue).toBeGreaterThan(usdcPerTokenValue)
      }
    })

    it('should handle edge cases in percentage calculations', async () => {
      const summary = await portfolioManager.generatePortfolioSummary(
        mockPositions,
        mockAnalytics,
        mockUserAddress
      )

      summary.assetAllocation.forEach(asset => {
        expect(Number.isFinite(asset.percentage)).toBe(true)
        expect(asset.percentage).toBeGreaterThanOrEqual(0)
      })

      expect(Number.isFinite(summary.performanceMetrics.totalPnlPercentage)).toBe(true)
    })
  })

  describe('risk assessment algorithms', () => {
    it('should assess liquidity risk correctly', async () => {
      const portfolioPositions = await portfolioManager.aggregatePositionsByPair(
        mockPositions,
        mockUserAddress
      )

      portfolioPositions.forEach(position => {
        const totalLiquidity = parseFloat(position.aggregatedMetrics.totalLiquidity)

        if (totalLiquidity > 10000) {
          expect(position.riskMetrics.liquidityRisk).toBeLessThan(40)
        } else {
          expect(position.riskMetrics.liquidityRisk).toBeGreaterThan(40)
        }
      })
    })

    it('should calculate overall risk score as average', async () => {
      const portfolioPositions = await portfolioManager.aggregatePositionsByPair(
        mockPositions,
        mockUserAddress
      )

      portfolioPositions.forEach(position => {
        const { concentrationRisk, correlationRisk, liquidityRisk, overallRiskScore } = position.riskMetrics
        const expectedOverallRisk = (concentrationRisk + correlationRisk + liquidityRisk) / 3

        expect(overallRiskScore).toBeCloseTo(expectedOverallRisk, 1)
      })
    })

    it('should provide risk-based recommendations', async () => {
      const portfolioPositions = await portfolioManager.aggregatePositionsByPair(
        mockPositions,
        mockUserAddress
      )

      const highRiskPositions = portfolioPositions.filter(p => p.riskMetrics.overallRiskScore > 60)

      highRiskPositions.forEach(position => {
        expect(position.optimization.recommendedActions).toEqual(
          expect.arrayContaining([
            expect.stringContaining('High risk detected')
          ])
        )
      })
    })
  })

  describe('edge cases and boundary conditions', () => {
    it('should handle extremely small liquidity amounts', async () => {
      const tinyPositions = mockPositions.map(p => ({ ...p, liquidityAmount: '0.001' }))

      const portfolioPositions = await portfolioManager.aggregatePositionsByPair(
        tinyPositions,
        mockUserAddress
      )

      portfolioPositions.forEach(position => {
        expect(position.optimization.recommendedActions).toEqual(
          expect.arrayContaining([
            expect.stringContaining('Consider increasing position sizes')
          ])
        )
      })
    })

    it('should handle positions with zero fees', async () => {
      const zeroFeePositions = mockPositions.map(p => ({
        ...p,
        feesEarned: { tokenX: '0', tokenY: '0' }
      }))

      const portfolioPositions = await portfolioManager.aggregatePositionsByPair(
        zeroFeePositions,
        mockUserAddress
      )

      portfolioPositions.forEach(position => {
        expect(position.aggregatedMetrics.totalFeesEarned).toBe(0)
      })
    })

    it('should handle invalid token prices gracefully', async () => {
      const invalidPricePositions = mockPositions.map(p => ({
        ...p,
        tokenX: { ...p.tokenX, price: NaN },
        tokenY: { ...p.tokenY, price: Infinity }
      }))

      const portfolioPositions = await portfolioManager.aggregatePositionsByPair(
        invalidPricePositions,
        mockUserAddress
      )

      portfolioPositions.forEach(position => {
        expect(Number.isFinite(position.aggregatedMetrics.totalValue)).toBe(true)
      })
    })

    it('should handle empty diversification analysis', () => {
      const analysis = portfolioManager.analyzeDiversification([])

      expect(analysis.overallScore).toBe(50) // Base score
      expect(analysis.tokenDiversification.uniqueTokens).toBe(0)
      expect(analysis.pairDiversification.uniquePairs).toBe(0)
    })

    it('should handle single-pool portfolios', async () => {
      const singlePoolPositions = mockPositions.map(p => ({
        ...p,
        poolAddress: mockPositions[0].poolAddress
      }))

      const opportunities = await portfolioManager.identifyConsolidationOpportunities(
        singlePoolPositions,
        mockUserAddress
      )

      // All positions in same pool, no consolidation needed
      expect(opportunities).toEqual([])
    })
  })

  describe('cache management', () => {
    it('should clear cache successfully', () => {
      portfolioManager.clearCache()
      const stats = portfolioManager.getCacheStats()

      expect(stats.count).toBe(0)
      expect(stats.keys).toEqual([])
    })

    it('should provide cache statistics', async () => {
      await portfolioManager.aggregatePositionsByPair(mockPositions, mockUserAddress)

      const stats = portfolioManager.getCacheStats()
      expect(stats.count).toBeGreaterThan(0)
      expect(Array.isArray(stats.keys)).toBe(true)
    })
  })

  describe('various portfolio sizes and market conditions', () => {
    it('should handle concentrated portfolios', () => {
      // All positions in same pair
      const concentratedPositions = mockPositions.map((p, i) => ({
        ...p,
        id: `concentrated-${i}`,
        tokenX: mockPositions[0].tokenX,
        tokenY: mockPositions[0].tokenY
      }))

      const analysis = portfolioManager.analyzeDiversification(concentratedPositions)

      expect(analysis.overallScore).toBeLessThan(50)
      expect(analysis.pairDiversification.uniquePairs).toBe(1)
      expect(analysis.pairDiversification.concentrationWarnings.length).toBeGreaterThan(0)
    })

    it('should handle highly diversified portfolios', () => {
      // Create positions with unique pairs
      const diversifiedPositions: DLMMPosition[] = []
      const tokens = ['USDC', 'USDT', 'SOL', 'ETH', 'BTC', 'RAY', 'SRM', 'ORCA']

      for (let i = 0; i < tokens.length - 1; i++) {
        diversifiedPositions.push({
          ...mockPositions[0],
          id: `diversified-${i}`,
          poolAddress: new PublicKey(`DiversePool${i.toString().padStart(40, '0')}`),
          tokenX: { ...mockPositions[0].tokenX, symbol: tokens[i] },
          tokenY: { ...mockPositions[0].tokenY, symbol: tokens[i + 1] }
        })
      }

      const analysis = portfolioManager.analyzeDiversification(diversifiedPositions)

      expect(analysis.overallScore).toBeGreaterThan(70)
      expect(analysis.tokenDiversification.uniqueTokens).toBe(8)
      expect(analysis.pairDiversification.uniquePairs).toBe(7)
    })

    it('should handle bull market conditions (high positive PnL)', async () => {
      const bullMarketAnalytics = mockAnalytics.map(a => ({
        ...a,
        pnl: { amount: a.totalValue * 0.5, percentage: 50 }, // 50% gains
        apr: 50
      }))

      const summary = await portfolioManager.generatePortfolioSummary(
        mockPositions,
        bullMarketAnalytics,
        mockUserAddress
      )

      expect(summary.performanceMetrics.totalPnlPercentage).toBeGreaterThan(40)
      expect(summary.performanceMetrics.avgApr).toBeGreaterThan(40)
    })

    it('should handle bear market conditions (negative PnL)', async () => {
      const bearMarketAnalytics = mockAnalytics.map(a => ({
        ...a,
        pnl: { amount: -a.totalValue * 0.3, percentage: -30 }, // 30% losses
        apr: 2,
        impermanentLoss: { amount: -a.totalValue * 0.1, percentage: -10 }
      }))

      const summary = await portfolioManager.generatePortfolioSummary(
        mockPositions,
        bearMarketAnalytics,
        mockUserAddress
      )

      expect(summary.performanceMetrics.totalPnlPercentage).toBeLessThan(-20)
      expect(summary.performanceMetrics.avgApr).toBeLessThan(5)
    })
  })
})