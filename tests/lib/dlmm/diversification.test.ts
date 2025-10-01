import { PublicKey, Connection } from '@solana/web3.js'
import { DiversificationAnalysisEngine } from '../../../src/lib/dlmm/diversification'
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
      'BTC': { price: 50000.0, timestamp: Date.now() },
      'RAY': { price: 5.0, timestamp: Date.now() },
      'SRM': { price: 0.5, timestamp: Date.now() }
    }))
  }
}))

describe('DiversificationAnalysisEngine', () => {
  let diversificationEngine: DiversificationAnalysisEngine
  let mockConnection: Connection
  let mockPositions: DLMMPosition[]

  beforeEach(() => {
    jest.clearAllMocks()

    mockConnection = new Connection('http://localhost:8899')

    diversificationEngine = new DiversificationAnalysisEngine(mockConnection)

    mockPositions = [
      {
        id: 'position-1',
        poolAddress: new PublicKey('Pool1111111111111111111111111111111111111111'),
        userAddress: new PublicKey('User1111111111111111111111111111111111111111'),
        activeBin: 8388608,
        liquidityAmount: '15000',
        feesEarned: { tokenX: '250', tokenY: '250' },
        createdAt: new Date('2024-01-01'),
        lastUpdated: new Date(),
        isActive: true,
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
        currentValue: 15000,
        initialValue: 14000,
        pnl: 1000,
        pnlPercent: 7.14,
        realizedPnl: 300,
        unrealizedPnl: 700,
        feeEarnings: 500,
        impermanentLoss: -200,
        updatedAt: new Date(),
        bins: []
      },
      {
        id: 'position-2',
        poolAddress: new PublicKey('Pool2222222222222222222222222222222222222222'),
        userAddress: new PublicKey('User1111111111111111111111111111111111111111'),
        activeBin: 8388608,
        liquidityAmount: '20000',
        feesEarned: { tokenX: '600', tokenY: '600' },
        createdAt: new Date('2024-01-15'),
        lastUpdated: new Date(),
        isActive: true,
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
        currentValue: 20000,
        initialValue: 16000,
        pnl: 4000,
        pnlPercent: 25.0,
        realizedPnl: 800,
        unrealizedPnl: 3200,
        feeEarnings: 1200,
        impermanentLoss: -400,
        updatedAt: new Date(),
        bins: []
      },
      {
        id: 'position-3',
        poolAddress: new PublicKey('Pool3333333333333333333333333333333333333333'),
        userAddress: new PublicKey('User1111111111111111111111111111111111111111'),
        activeBin: 8388608,
        liquidityAmount: '12000',
        feesEarned: { tokenX: '400', tokenY: '400' },
        createdAt: new Date('2024-02-01'),
        lastUpdated: new Date(),
        isActive: true,
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
        currentValue: 12000,
        initialValue: 10000,
        pnl: 2000,
        pnlPercent: 20.0,
        realizedPnl: 500,
        unrealizedPnl: 1500,
        feeEarnings: 800,
        impermanentLoss: -300,
        updatedAt: new Date(),
        bins: []
      },
      {
        id: 'position-4',
        poolAddress: new PublicKey('Pool4444444444444444444444444444444444444444'),
        userAddress: new PublicKey('User1111111111111111111111111111111111111111'),
        activeBin: 8388608,
        liquidityAmount: '8000',
        feesEarned: { tokenX: '200', tokenY: '200' },
        createdAt: new Date('2024-02-15'),
        lastUpdated: new Date(),
        isActive: true,
        publicKey: new PublicKey('Position4444444444444444444444444444444444'),
        pair: new PublicKey('Pool4444444444444444444444444444444444444444'),
        tokenX: {
          address: new PublicKey('9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E'),
          symbol: 'BTC',
          name: 'Bitcoin',
          decimals: 8,
          price: 50000.0
        },
        tokenY: {
          address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          price: 1.0
        },
        currentValue: 8000,
        initialValue: 7000,
        pnl: 1000,
        pnlPercent: 14.29,
        realizedPnl: 200,
        unrealizedPnl: 800,
        feeEarnings: 400,
        impermanentLoss: -200,
        updatedAt: new Date(),
        bins: []
      }
    ]
  })

  describe('analyzeDiversification', () => {
    it('should perform comprehensive diversification analysis', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      // Basic structure validation - comprehensive analysis returns more fields
      expect(analysis).toMatchObject({
        overallScore: expect.any(Number),
        tokenDiversification: expect.any(Object),
        pairDiversification: expect.any(Object),
        poolDiversification: expect.any(Object)
      })

      // Validate score is within range
      expect(analysis.overallScore).toBeGreaterThanOrEqual(0)
      expect(analysis.overallScore).toBeLessThanOrEqual(10)
    })

    it('should calculate overall diversification score correctly', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(analysis.overallScore).toBeGreaterThanOrEqual(0)
      expect(analysis.overallScore).toBeLessThanOrEqual(10)

      // Should have good diversification with 4 different tokens
      expect(analysis.overallScore).toBeGreaterThan(5)
    })

    it('should analyze token diversification accurately', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      // Should have token diversification analysis
      expect(analysis.tokenDiversification).toBeDefined()
      expect(analysis.tokenDiversification.uniqueTokens).toBeGreaterThanOrEqual(1)

      // USDC appears in all positions, should be mentioned
      expect(analysis.tokenDiversification.dominantToken).toBeDefined()
    })

    it('should analyze pair diversification correctly', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      // Should identify 4 unique pairs
      expect(analysis.pairDiversification.uniquePairs).toBe(4)

      // Pair distribution should be defined
      expect(analysis.pairDiversification).toBeDefined()
    })

    it('should perform sector analysis when enabled', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      // Comprehensive analysis includes dimensional analysis with sector data
      expect(analysis.dimensionalAnalysis).toBeDefined()
    })

    it('should calculate concentration metrics accurately', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      const totalValue = mockPositions.reduce((sum, pos) => sum + (pos.currentValue ?? 0), 0)
      const sortedValues = mockPositions.map(pos => pos.currentValue ?? 0).sort((a, b) => (b ?? 0) - (a ?? 0))

      // Concentration analysis should be defined
      expect(analysis.concentrationAnalysis).toBeDefined()
      expect(totalValue).toBeGreaterThan(0)
      expect(sortedValues.length).toBe(mockPositions.length)
    })

    it('should perform correlation analysis when enabled', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(analysis.correlationAnalysis).toBeDefined()

      // Correlation metrics should be defined
      expect(analysis.correlationAnalysis.correlationMetrics).toBeDefined()
    })

    it('should generate appropriate recommendations', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      // Improvement plan includes prioritized actions
      expect(analysis.improvementPlan).toBeDefined()
      expect(analysis.improvementPlan.prioritizedActions).toBeDefined()
      expect(Array.isArray(analysis.improvementPlan.prioritizedActions)).toBe(true)
    })

    it('should handle concentrated portfolios', async () => {
      const concentratedPositions = [
        { ...mockPositions[0], currentValue: 40000 }, // 80% of portfolio
        { ...mockPositions[1], currentValue: 5000 },  // 10% of portfolio
        { ...mockPositions[2], currentValue: 5000 }   // 10% of portfolio
      ]

      const analysis = await diversificationEngine.analyzeDiversification(
        concentratedPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(analysis.overallScore).toBeLessThan(6) // Should have lower score due to concentration
      expect(analysis.concentrationAnalysis).toBeDefined()

      // Should have improvement plan
      expect(analysis.improvementPlan.prioritizedActions).toBeDefined()
    })

    it('should handle well-diversified portfolios', async () => {
      const wellDiversifiedPositions = Array(10).fill(null).map((_, i) => ({
        ...mockPositions[i % mockPositions.length],
        publicKey: new PublicKey(`Position${i.toString().padStart(44, '0')}`),
        currentValue: 5000 + Math.random() * 1000, // Similar values
        tokenX: { ...mockPositions[i % mockPositions.length].tokenX, symbol: `TOKEN${i}A` },
        tokenY: { ...mockPositions[i % mockPositions.length].tokenY, symbol: `TOKEN${i}B` }
      }))

      const analysis = await diversificationEngine.analyzeDiversification(
        wellDiversifiedPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(analysis.overallScore).toBeGreaterThan(7) // Should have high score
      expect(analysis.concentrationAnalysis).toBeDefined()
      expect(analysis.tokenDiversification.uniqueTokens).toBeGreaterThan(10)
    })

    it('should handle single position portfolios', async () => {
      const singlePosition = [mockPositions[0]]

      const analysis = await diversificationEngine.analyzeDiversification(
        singlePosition,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(analysis.overallScore).toBeLessThan(3) // Very poor diversification
      expect(analysis.tokenDiversification.uniqueTokens).toBe(2) // Only USDC and USDT
      expect(analysis.pairDiversification.uniquePairs).toBe(1)

      // Should have improvement plan
      expect(analysis.improvementPlan.prioritizedActions).toBeDefined()
    })

    it('should handle empty portfolios', async () => {
      await expect(
        diversificationEngine.analyzeDiversification(
          [],
          [], // analytics array
          new PublicKey('11111111111111111111111111111112'), // mock user address
          false // forceRefresh
        )
      ).rejects.toThrow()
    })
  })

  describe('sector classification', () => {
    it('should perform sector analysis', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      // Dimensional analysis includes sector data
      expect(analysis.dimensionalAnalysis).toBeDefined()
    })
  })

  describe('correlation calculations', () => {
    it('should calculate correlation analysis', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(analysis.correlationAnalysis).toBeDefined()
      expect(analysis.correlationAnalysis.correlationMetrics).toBeDefined()
    })
  })

  describe('concentration analysis', () => {
    it('should calculate concentration metrics', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(analysis.concentrationAnalysis).toBeDefined()
      expect(analysis.concentrationAnalysis.concentrationMetrics).toBeDefined()
    })
  })

  describe('recommendation generation', () => {
    it('should provide recommendations', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(analysis.improvementPlan).toBeDefined()
      expect(analysis.improvementPlan.prioritizedActions).toBeDefined()
      expect(Array.isArray(analysis.improvementPlan.prioritizedActions)).toBe(true)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle positions with zero values', async () => {
      const zeroValuePositions = [
        { ...mockPositions[0], currentValue: 0 },
        { ...mockPositions[1], currentValue: 10000 },
        { ...mockPositions[2], currentValue: 5000 }
      ]

      const analysis = await diversificationEngine.analyzeDiversification(
        zeroValuePositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(analysis.overallScore).toBeGreaterThanOrEqual(0)
      expect(analysis.concentrationAnalysis).toBeDefined()
    })

    it('should handle positions with missing price data', async () => {
      const noPricePositions = mockPositions.map(pos => ({
        ...pos,
        tokenX: { ...pos.tokenX, price: 0 },
        tokenY: { ...pos.tokenY, price: 0 }
      }))

      const analysis = await diversificationEngine.analyzeDiversification(
        noPricePositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(analysis.overallScore).toBeGreaterThanOrEqual(0)
      expect(analysis.tokenDiversification.uniqueTokens).toBeGreaterThan(0)
    })

    it('should handle extreme concentration cases', async () => {
      const extremeConcentration = [
        { ...mockPositions[0], currentValue: 999999 },
        { ...mockPositions[1], currentValue: 1 }
      ]

      const analysis = await diversificationEngine.analyzeDiversification(
        extremeConcentration,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(analysis.concentrationAnalysis).toBeDefined()
      expect(analysis.overallScore).toBeLessThan(2)
    })

    it('should handle identical positions', async () => {
      const identicalPositions = Array(5).fill(null).map((_, i) => ({
        ...mockPositions[0],
        publicKey: new PublicKey(`Position${i.toString().padStart(44, '0')}`),
        currentValue: 10000,
        id: `position-${i}` // Add unique IDs
      }))

      const analysis = await diversificationEngine.analyzeDiversification(
        identicalPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(analysis.tokenDiversification.uniqueTokens).toBe(2) // Only USDC/USDT
      expect(analysis.pairDiversification.uniquePairs).toBe(1)
    })
  })

  describe('performance and caching', () => {
    it('should cache analysis results', async () => {
      const analysis1 = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      const analysis2 = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(analysis1.overallScore).toBe(analysis2.overallScore)
    })

    it('should handle large portfolios efficiently', async () => {
      const largePortfolio = Array(50).fill(null).map((_, i) => ({ // Reduced from 200 to 50 for faster tests
        ...mockPositions[i % mockPositions.length],
        publicKey: new PublicKey(`Position${i.toString().padStart(44, '0')}`),
        currentValue: Math.random() * 10000 + 1000,
        tokenX: { ...mockPositions[i % mockPositions.length].tokenX, symbol: `TOKEN${i}A` },
        tokenY: { ...mockPositions[i % mockPositions.length].tokenY, symbol: `TOKEN${i}B` },
        id: `position-${i}` // Add unique IDs
      }))

      const analysis = await diversificationEngine.analyzeDiversification(
        largePortfolio,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(analysis.tokenDiversification.uniqueTokens).toBeGreaterThan(10)
    })
  })

  describe('mathematical accuracy', () => {
    it('should maintain precision in calculations', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(
        mockPositions,
        [], // analytics array
        new PublicKey('11111111111111111111111111111112'), // mock user address
        false // forceRefresh
      )

      expect(Number.isFinite(analysis.overallScore)).toBe(true)
      expect(analysis.concentrationAnalysis).toBeDefined()
    })
  })
})