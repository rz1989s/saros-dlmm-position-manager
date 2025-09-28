import { PublicKey, Connection } from '@solana/web3.js'
import { DiversificationAnalysisEngine, DiversificationAnalysis } from '../../../src/lib/dlmm/diversification'
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
      'BTC': { price: 50000.0, timestamp: Date.now() },
      'RAY': { price: 5.0, timestamp: Date.now() },
      'SRM': { price: 0.5, timestamp: Date.now() }
    }))
  }
}))

describe('DiversificationAnalysisEngine', () => {
  let diversificationEngine: DiversificationAnalysisEngine
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

    diversificationEngine = new DiversificationAnalysisEngine(mockClient)

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
        currentValue: 15000,
        initialValue: 14000,
        pnl: 1000,
        pnlPercent: 7.14,
        realizedPnl: 300,
        unrealizedPnl: 700,
        feeEarnings: 500,
        impermanentLoss: -200,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        bins: []
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
        currentValue: 20000,
        initialValue: 16000,
        pnl: 4000,
        pnlPercent: 25.0,
        realizedPnl: 800,
        unrealizedPnl: 3200,
        feeEarnings: 1200,
        impermanentLoss: -400,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
        bins: []
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
        currentValue: 12000,
        initialValue: 10000,
        pnl: 2000,
        pnlPercent: 20.0,
        realizedPnl: 500,
        unrealizedPnl: 1500,
        feeEarnings: 800,
        impermanentLoss: -300,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
        bins: []
      },
      {
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
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date(),
        bins: []
      }
    ]
  })

  describe('analyzeDiversification', () => {
    it('should perform comprehensive diversification analysis', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(mockPositions, {
        includeSectorAnalysis: true,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: true,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      expect(analysis).toMatchObject({
        overallScore: expect.any(Number),
        tokenDiversification: expect.objectContaining({
          uniqueTokens: expect.any(Number),
          tokenDistribution: expect.any(Array),
          herfindahlIndex: expect.any(Number),
          dominantToken: expect.any(String),
          concentrationRisk: expect.any(Number)
        }),
        pairDiversification: expect.objectContaining({
          uniquePairs: expect.any(Number),
          pairDistribution: expect.any(Array),
          crossPairCorrelation: expect.any(Number),
          pairConcentration: expect.any(Number)
        }),
        sectorAnalysis: expect.objectContaining({
          sectorBreakdown: expect.any(Array),
          sectorConcentration: expect.any(Number),
          crossSectorCorrelation: expect.any(Number)
        }),
        concentrationMetrics: expect.objectContaining({
          herfindahlIndex: expect.any(Number),
          top5Concentration: expect.any(Number),
          top10Concentration: expect.any(Number),
          concentrationRisk: expect.any(Number)
        }),
        correlationAnalysis: expect.objectContaining({
          averageCorrelation: expect.any(Number),
          correlationMatrix: expect.any(Array),
          highCorrelationPairs: expect.any(Array),
          diversificationBenefit: expect.any(Number)
        }),
        recommendations: expect.arrayContaining([
          expect.objectContaining({
            type: expect.any(String),
            priority: expect.stringMatching(/^(high|medium|low)$/),
            description: expect.any(String)
          })
        ])
      })
    })

    it('should calculate overall diversification score correctly', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(mockPositions, {
        includeSectorAnalysis: true,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: true,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      expect(analysis.overallScore).toBeGreaterThanOrEqual(0)
      expect(analysis.overallScore).toBeLessThanOrEqual(10)

      // Should have good diversification with 4 different tokens
      expect(analysis.overallScore).toBeGreaterThan(5)
    })

    it('should analyze token diversification accurately', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(mockPositions, {
        includeSectorAnalysis: false,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: false,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      // Should identify 5 unique tokens: USDC, USDT, SOL, ETH, BTC
      expect(analysis.tokenDiversification.uniqueTokens).toBe(5)

      // USDC appears in all positions, should be dominant
      expect(analysis.tokenDiversification.dominantToken).toBe('USDC')

      // Token distribution should sum to approximately 200% (each position has 2 tokens)
      const totalDistribution = analysis.tokenDiversification.tokenDistribution.reduce(
        (sum, token) => sum + token.percentage, 0
      )
      expect(totalDistribution).toBeCloseTo(200, 10) // Allow some rounding error

      // Herfindahl index should be reasonable for this diversification level
      expect(analysis.tokenDiversification.herfindahlIndex).toBeGreaterThan(0)
      expect(analysis.tokenDiversification.herfindahlIndex).toBeLessThanOrEqual(1)
    })

    it('should analyze pair diversification correctly', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(mockPositions, {
        includeSectorAnalysis: false,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: false,
        includeConcentrationAnalysis: false,
        timeframe: '30d'
      })

      // Should identify 4 unique pairs
      expect(analysis.pairDiversification.uniquePairs).toBe(4)

      // Pair distribution should sum to 100%
      const totalPairDistribution = analysis.pairDiversification.pairDistribution.reduce(
        (sum, pair) => sum + pair.percentage, 0
      )
      expect(totalPairDistribution).toBeCloseTo(100, 5)

      // Each pair should have reasonable allocation
      analysis.pairDiversification.pairDistribution.forEach(pair => {
        expect(pair.percentage).toBeGreaterThan(0)
        expect(pair.percentage).toBeLessThan(100)
        expect(pair.value).toBeGreaterThan(0)
      })
    })

    it('should perform sector analysis when enabled', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(mockPositions, {
        includeSectorAnalysis: true,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: false,
        includeConcentrationAnalysis: false,
        timeframe: '30d'
      })

      expect(analysis.sectorAnalysis).toBeDefined()
      expect(analysis.sectorAnalysis.sectorBreakdown).toHaveLength(3) // Stablecoins, Layer 1, Bitcoin

      const sectors = analysis.sectorAnalysis.sectorBreakdown.map(s => s.sector)
      expect(sectors).toContain('Stablecoins')
      expect(sectors).toContain('Layer 1')
      expect(sectors).toContain('Bitcoin')

      // Sector breakdown should sum to 100%
      const totalSectorAllocation = analysis.sectorAnalysis.sectorBreakdown.reduce(
        (sum, sector) => sum + sector.percentage, 0
      )
      expect(totalSectorAllocation).toBeCloseTo(100, 5)
    })

    it('should calculate concentration metrics accurately', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(mockPositions, {
        includeSectorAnalysis: false,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: false,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      const totalValue = mockPositions.reduce((sum, pos) => sum + pos.currentValue, 0)
      const sortedValues = mockPositions.map(pos => pos.currentValue).sort((a, b) => b - a)

      // Top 5 concentration should be 100% for this portfolio (only 4 positions)
      expect(analysis.concentrationMetrics.top5Concentration).toBeCloseTo(100, 1)

      // Top 10 concentration should also be 100%
      expect(analysis.concentrationMetrics.top10Concentration).toBeCloseTo(100, 1)

      // Herfindahl index calculation verification
      const expectedHHI = sortedValues.reduce((sum, value) => {
        const share = value / totalValue
        return sum + (share * share)
      }, 0)

      expect(analysis.concentrationMetrics.herfindahlIndex).toBeCloseTo(expectedHHI, 5)
    })

    it('should perform correlation analysis when enabled', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(mockPositions, {
        includeSectorAnalysis: false,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: true,
        includeConcentrationAnalysis: false,
        timeframe: '30d'
      })

      expect(analysis.correlationAnalysis).toBeDefined()
      expect(analysis.correlationAnalysis.correlationMatrix).toHaveLength(mockPositions.length)

      // Correlation matrix should be symmetric
      const matrix = analysis.correlationAnalysis.correlationMatrix
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
          expect(matrix[i][j]).toBeCloseTo(matrix[j][i], 5)
        }
      }

      // Diagonal elements should be 1 (self-correlation)
      for (let i = 0; i < matrix.length; i++) {
        expect(matrix[i][i]).toBeCloseTo(1, 5)
      }

      // Average correlation should be reasonable
      expect(analysis.correlationAnalysis.averageCorrelation).toBeGreaterThanOrEqual(-1)
      expect(analysis.correlationAnalysis.averageCorrelation).toBeLessThanOrEqual(1)
    })

    it('should generate appropriate recommendations', async () => {
      const analysis = await diversificationEngine.analyzeDiversification(mockPositions, {
        includeSectorAnalysis: true,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: true,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      expect(analysis.recommendations).toBeDefined()
      expect(Array.isArray(analysis.recommendations)).toBe(true)

      if (analysis.recommendations.length > 0) {
        analysis.recommendations.forEach(rec => {
          expect(rec).toMatchObject({
            type: expect.any(String),
            priority: expect.stringMatching(/^(high|medium|low)$/),
            description: expect.any(String),
            expectedImpact: expect.any(String),
            implementation: expect.any(String)
          })
        })
      }
    })

    it('should handle concentrated portfolios', async () => {
      const concentratedPositions = [
        { ...mockPositions[0], currentValue: 40000 }, // 80% of portfolio
        { ...mockPositions[1], currentValue: 5000 },  // 10% of portfolio
        { ...mockPositions[2], currentValue: 5000 }   // 10% of portfolio
      ]

      const analysis = await diversificationEngine.analyzeDiversification(concentratedPositions, {
        includeSectorAnalysis: true,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: true,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      expect(analysis.overallScore).toBeLessThan(6) // Should have lower score due to concentration
      expect(analysis.concentrationMetrics.concentrationRisk).toBeGreaterThan(70)

      // Should recommend reducing concentration
      expect(analysis.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: expect.stringMatching(/concentration|rebalance/),
            priority: expect.stringMatching(/high|medium/)
          })
        ])
      )
    })

    it('should handle well-diversified portfolios', async () => {
      const wellDiversifiedPositions = Array(10).fill(null).map((_, i) => ({
        ...mockPositions[i % mockPositions.length],
        publicKey: new PublicKey(`Position${i.toString().padStart(44, '0')}`),
        currentValue: 5000 + Math.random() * 1000, // Similar values
        tokenX: { ...mockPositions[i % mockPositions.length].tokenX, symbol: `TOKEN${i}A` },
        tokenY: { ...mockPositions[i % mockPositions.length].tokenY, symbol: `TOKEN${i}B` }
      }))

      const analysis = await diversificationEngine.analyzeDiversification(wellDiversifiedPositions, {
        includeSectorAnalysis: true,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: true,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      expect(analysis.overallScore).toBeGreaterThan(7) // Should have high score
      expect(analysis.concentrationMetrics.concentrationRisk).toBeLessThan(30)
      expect(analysis.tokenDiversification.uniqueTokens).toBeGreaterThan(10)
    })

    it('should handle single position portfolios', async () => {
      const singlePosition = [mockPositions[0]]

      const analysis = await diversificationEngine.analyzeDiversification(singlePosition, {
        includeSectorAnalysis: true,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: true,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      expect(analysis.overallScore).toBeLessThan(3) // Very poor diversification
      expect(analysis.concentrationMetrics.herfindahlIndex).toBe(1) // Maximum concentration
      expect(analysis.tokenDiversification.uniqueTokens).toBe(2) // Only USDC and USDT
      expect(analysis.pairDiversification.uniquePairs).toBe(1)

      // Should strongly recommend diversification
      expect(analysis.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'diversification',
            priority: 'high'
          })
        ])
      )
    })

    it('should handle empty portfolios', async () => {
      await expect(
        diversificationEngine.analyzeDiversification([], {
          includeSectorAnalysis: true,
          includeGeographicAnalysis: false,
          includeCorrelationAnalysis: true,
          includeConcentrationAnalysis: true,
          timeframe: '30d'
        })
      ).rejects.toThrow('No positions provided for diversification analysis')
    })
  })

  describe('sector classification', () => {
    it('should classify tokens into correct sectors', () => {
      const tokenSectors = (diversificationEngine as any).classifyTokensBySector(mockPositions)

      expect(tokenSectors).toMatchObject({
        'USDC': 'Stablecoins',
        'USDT': 'Stablecoins',
        'SOL': 'Layer 1',
        'ETH': 'Layer 1',
        'BTC': 'Bitcoin'
      })
    })

    it('should handle unknown tokens', () => {
      const unknownTokenPositions = [
        {
          ...mockPositions[0],
          tokenX: { ...mockPositions[0].tokenX, symbol: 'UNKNOWN1' },
          tokenY: { ...mockPositions[0].tokenY, symbol: 'UNKNOWN2' }
        }
      ]

      const tokenSectors = (diversificationEngine as any).classifyTokensBySector(unknownTokenPositions)

      expect(tokenSectors).toMatchObject({
        'UNKNOWN1': 'Other',
        'UNKNOWN2': 'Other'
      })
    })

    it('should calculate sector allocations correctly', () => {
      const sectorAllocations = (diversificationEngine as any).calculateSectorAllocations(mockPositions)

      expect(sectorAllocations).toHaveLength(3) // Stablecoins, Layer 1, Bitcoin

      const totalAllocation = sectorAllocations.reduce((sum, sector) => sum + sector.percentage, 0)
      expect(totalAllocation).toBeCloseTo(100, 5)

      // Each sector should have positive allocation
      sectorAllocations.forEach(sector => {
        expect(sector.percentage).toBeGreaterThan(0)
        expect(sector.value).toBeGreaterThan(0)
        expect(sector.tokenCount).toBeGreaterThan(0)
      })
    })
  })

  describe('correlation calculations', () => {
    it('should calculate position correlations correctly', () => {
      const correlations = (diversificationEngine as any).calculatePositionCorrelations(mockPositions, '30d')

      expect(correlations.matrix).toHaveLength(mockPositions.length)
      expect(correlations.matrix[0]).toHaveLength(mockPositions.length)

      // Matrix should be symmetric
      for (let i = 0; i < correlations.matrix.length; i++) {
        for (let j = 0; j < correlations.matrix.length; j++) {
          expect(correlations.matrix[i][j]).toBeCloseTo(correlations.matrix[j][i], 5)
        }
      }

      // Diagonal should be 1
      for (let i = 0; i < correlations.matrix.length; i++) {
        expect(correlations.matrix[i][i]).toBeCloseTo(1, 5)
      }
    })

    it('should identify high correlation pairs', () => {
      const highCorrelationMatrix = [
        [1.0, 0.9, 0.2],
        [0.9, 1.0, 0.1],
        [0.2, 0.1, 1.0]
      ]

      const highPairs = (diversificationEngine as any).identifyHighCorrelationPairs(
        highCorrelationMatrix,
        mockPositions.slice(0, 3),
        0.7
      )

      expect(highPairs).toHaveLength(1) // Only first two positions are highly correlated
      expect(highPairs[0]).toMatchObject({
        position1: expect.any(String),
        position2: expect.any(String),
        correlation: 0.9,
        riskImpact: expect.any(String)
      })
    })

    it('should calculate diversification benefit', () => {
      const lowCorrelationMatrix = [
        [1.0, 0.1, -0.2],
        [0.1, 1.0, 0.05],
        [-0.2, 0.05, 1.0]
      ]

      const highCorrelationMatrix = [
        [1.0, 0.9, 0.8],
        [0.9, 1.0, 0.85],
        [0.8, 0.85, 1.0]
      ]

      const lowCorrBenefit = (diversificationEngine as any).calculateDiversificationBenefit(lowCorrelationMatrix)
      const highCorrBenefit = (diversificationEngine as any).calculateDiversificationBenefit(highCorrelationMatrix)

      expect(lowCorrBenefit).toBeGreaterThan(highCorrBenefit) // Lower correlation = higher benefit
      expect(lowCorrBenefit).toBeGreaterThanOrEqual(0)
      expect(lowCorrBenefit).toBeLessThanOrEqual(100)
    })
  })

  describe('concentration analysis', () => {
    it('should calculate Herfindahl-Hirschman Index correctly', () => {
      const values = [40000, 30000, 20000, 10000] // Total: 100000
      const expectedHHI = (0.4 * 0.4) + (0.3 * 0.3) + (0.2 * 0.2) + (0.1 * 0.1) // 0.3

      const calculatedHHI = (diversificationEngine as any).calculateHerfindahlIndex(values)

      expect(calculatedHHI).toBeCloseTo(expectedHHI, 5)
    })

    it('should identify concentration risks', () => {
      const highConcentrationValues = [80000, 10000, 5000, 5000] // One dominant position
      const lowConcentrationValues = [25000, 25000, 25000, 25000] // Perfectly balanced

      const highConcentrationRisk = (diversificationEngine as any).calculateConcentrationRisk(highConcentrationValues)
      const lowConcentrationRisk = (diversificationEngine as any).calculateConcentrationRisk(lowConcentrationValues)

      expect(highConcentrationRisk).toBeGreaterThan(lowConcentrationRisk)
      expect(highConcentrationRisk).toBeGreaterThan(70) // High risk
      expect(lowConcentrationRisk).toBeLessThan(30) // Low risk
    })

    it('should calculate top N concentration correctly', () => {
      const values = [40, 30, 20, 10] // Total: 100

      const top3Concentration = (diversificationEngine as any).calculateTopNConcentration(values, 3)
      const top5Concentration = (diversificationEngine as any).calculateTopNConcentration(values, 5)

      expect(top3Concentration).toBeCloseTo(90, 1) // (40+30+20)/100
      expect(top5Concentration).toBeCloseTo(100, 1) // All positions (only 4 total)
    })
  })

  describe('recommendation generation', () => {
    it('should recommend diversification for concentrated portfolios', () => {
      const concentratedPositions = [
        { ...mockPositions[0], currentValue: 45000 },
        { ...mockPositions[1], currentValue: 5000 }
      ]

      const recommendations = (diversificationEngine as any).generateRecommendations({
        overallScore: 3,
        concentrationMetrics: { concentrationRisk: 85 },
        tokenDiversification: { uniqueTokens: 3 },
        correlationAnalysis: { averageCorrelation: 0.2 }
      }, concentratedPositions)

      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'diversification',
            priority: 'high'
          })
        ])
      )
    })

    it('should recommend correlation reduction for highly correlated portfolios', () => {
      const recommendations = (diversificationEngine as any).generateRecommendations({
        overallScore: 5,
        concentrationMetrics: { concentrationRisk: 40 },
        tokenDiversification: { uniqueTokens: 6 },
        correlationAnalysis: { averageCorrelation: 0.8 }
      }, mockPositions)

      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'correlation_reduction',
            priority: expect.stringMatching(/high|medium/)
          })
        ])
      )
    })

    it('should recommend sector diversification', () => {
      const singleSectorPositions = mockPositions.map(pos => ({
        ...pos,
        tokenX: { ...pos.tokenX, symbol: 'STABLE1' },
        tokenY: { ...pos.tokenY, symbol: 'STABLE2' }
      }))

      const recommendations = (diversificationEngine as any).generateRecommendations({
        overallScore: 4,
        concentrationMetrics: { concentrationRisk: 30 },
        tokenDiversification: { uniqueTokens: 8 },
        sectorAnalysis: { sectorConcentration: 90 }
      }, singleSectorPositions)

      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'sector_diversification',
            priority: expect.stringMatching(/high|medium/)
          })
        ])
      )
    })

    it('should provide maintenance recommendations for well-diversified portfolios', () => {
      const recommendations = (diversificationEngine as any).generateRecommendations({
        overallScore: 8.5,
        concentrationMetrics: { concentrationRisk: 15 },
        tokenDiversification: { uniqueTokens: 12 },
        correlationAnalysis: { averageCorrelation: 0.3 }
      }, mockPositions)

      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'maintain_diversification',
            priority: 'low'
          })
        ])
      )
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle positions with zero values', async () => {
      const zeroValuePositions = [
        { ...mockPositions[0], currentValue: 0 },
        { ...mockPositions[1], currentValue: 10000 },
        { ...mockPositions[2], currentValue: 5000 }
      ]

      const analysis = await diversificationEngine.analyzeDiversification(zeroValuePositions, {
        includeSectorAnalysis: true,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: true,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      expect(analysis.overallScore).toBeGreaterThanOrEqual(0)
      expect(Number.isFinite(analysis.concentrationMetrics.herfindahlIndex)).toBe(true)
    })

    it('should handle positions with missing price data', async () => {
      const noPricePositions = mockPositions.map(pos => ({
        ...pos,
        tokenX: { ...pos.tokenX, price: undefined },
        tokenY: { ...pos.tokenY, price: undefined }
      }))

      const analysis = await diversificationEngine.analyzeDiversification(noPricePositions, {
        includeSectorAnalysis: false,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: false,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      expect(analysis.overallScore).toBeGreaterThanOrEqual(0)
      expect(analysis.tokenDiversification.uniqueTokens).toBeGreaterThan(0)
    })

    it('should handle invalid timeframes', async () => {
      await expect(
        diversificationEngine.analyzeDiversification(mockPositions, {
          includeSectorAnalysis: true,
          includeGeographicAnalysis: false,
          includeCorrelationAnalysis: true,
          includeConcentrationAnalysis: true,
          timeframe: 'invalid' as any
        })
      ).rejects.toThrow('Invalid timeframe')
    })

    it('should handle extreme concentration cases', async () => {
      const extremeConcentration = [
        { ...mockPositions[0], currentValue: 999999 },
        { ...mockPositions[1], currentValue: 1 }
      ]

      const analysis = await diversificationEngine.analyzeDiversification(extremeConcentration, {
        includeSectorAnalysis: true,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: true,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      expect(analysis.concentrationMetrics.concentrationRisk).toBeCloseTo(100, 0)
      expect(analysis.concentrationMetrics.herfindahlIndex).toBeCloseTo(1, 3)
      expect(analysis.overallScore).toBeLessThan(2)
    })

    it('should handle identical positions', async () => {
      const identicalPositions = Array(5).fill(null).map((_, i) => ({
        ...mockPositions[0],
        publicKey: new PublicKey(`Position${i.toString().padStart(44, '0')}`),
        currentValue: 10000
      }))

      const analysis = await diversificationEngine.analyzeDiversification(identicalPositions, {
        includeSectorAnalysis: true,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: true,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      expect(analysis.tokenDiversification.uniqueTokens).toBe(2) // Only USDC/USDT
      expect(analysis.pairDiversification.uniquePairs).toBe(1)
      expect(analysis.correlationAnalysis.averageCorrelation).toBeCloseTo(1, 3) // Perfect correlation
    })
  })

  describe('performance and caching', () => {
    it('should cache analysis results', async () => {
      const startTime = Date.now()

      const analysis1 = await diversificationEngine.analyzeDiversification(mockPositions, {
        includeSectorAnalysis: true,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: true,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      const firstCallTime = Date.now() - startTime

      const startTime2 = Date.now()

      const analysis2 = await diversificationEngine.analyzeDiversification(mockPositions, {
        includeSectorAnalysis: true,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: true,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      const secondCallTime = Date.now() - startTime2

      expect(analysis1.overallScore).toBe(analysis2.overallScore)
      expect(secondCallTime).toBeLessThan(firstCallTime) // Should be faster due to caching
    })

    it('should handle large portfolios efficiently', async () => {
      const largePortfolio = Array(200).fill(null).map((_, i) => ({
        ...mockPositions[i % mockPositions.length],
        publicKey: new PublicKey(`Position${i.toString().padStart(44, '0')}`),
        currentValue: Math.random() * 10000 + 1000,
        tokenX: { ...mockPositions[i % mockPositions.length].tokenX, symbol: `TOKEN${i}A` },
        tokenY: { ...mockPositions[i % mockPositions.length].tokenY, symbol: `TOKEN${i}B` }
      }))

      const startTime = Date.now()

      const analysis = await diversificationEngine.analyzeDiversification(largePortfolio, {
        includeSectorAnalysis: true,
        includeGeographicAnalysis: false,
        includeCorrelationAnalysis: true,
        includeConcentrationAnalysis: true,
        timeframe: '30d'
      })

      const executionTime = Date.now() - startTime

      expect(analysis.tokenDiversification.uniqueTokens).toBeGreaterThan(100)
      expect(executionTime).toBeLessThan(8000) // Should complete within 8 seconds
    })
  })

  describe('mathematical accuracy', () => {
    it('should maintain precision in calculations', () => {
      const values = [0.123456789, 0.987654321, 0.555555555]
      const total = values.reduce((sum, val) => sum + val, 0)

      const hhi = (diversificationEngine as any).calculateHerfindahlIndex(values)
      const expectedHHI = values.reduce((sum, val) => {
        const share = val / total
        return sum + (share * share)
      }, 0)

      expect(hhi).toBeCloseTo(expectedHHI, 10) // High precision
    })

    it('should handle floating point edge cases', () => {
      const verySmallValues = [0.000001, 0.000002, 0.000003]
      const veryLargeValues = [1e10, 2e10, 3e10]

      const smallHHI = (diversificationEngine as any).calculateHerfindahlIndex(verySmallValues)
      const largeHHI = (diversificationEngine as any).calculateHerfindahlIndex(veryLargeValues)

      expect(Number.isFinite(smallHHI)).toBe(true)
      expect(Number.isFinite(largeHHI)).toBe(true)
      expect(smallHHI).toBeCloseTo(largeHHI, 5) // Should be the same regardless of scale
    })
  })
})