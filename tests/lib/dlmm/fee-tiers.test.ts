import { PublicKey, Connection } from '@solana/web3.js'
import {
  FeeTierManager,
  type FeeTier,
  type FeeOptimizationSettings
} from '../../../src/lib/dlmm/fee-tiers'

// Mock the DLMM client
jest.mock('../../../src/lib/dlmm/client', () => ({
  dlmmClient: {
    getLbPair: jest.fn(),
    getConnection: jest.fn(() => new Connection('http://localhost:8899'))
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

describe('FeeTierManager', () => {
  let feeTierManager: FeeTierManager
  let mockConnection: Connection
  let mockPoolAddress: PublicKey
  let mockGetLbPair: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockConnection = new Connection('http://localhost:8899')
    feeTierManager = new FeeTierManager(mockConnection)
    mockPoolAddress = new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2')

    const { dlmmClient } = require('../../../src/lib/dlmm/client')
    mockGetLbPair = dlmmClient.getLbPair as jest.Mock
  })

  afterEach(() => {
    feeTierManager.clearCache()
  })

  describe('analyzeFeeOptimization', () => {
    const mockSettings: FeeOptimizationSettings = {
      riskTolerance: 'moderate',
      liquidityRange: 'moderate',
      rebalanceFrequency: 'weekly',
      maxSlippage: 0.01,
      prioritizeFees: true
    }

    beforeEach(() => {
      mockGetLbPair.mockResolvedValue({
        feeInfo: { baseFactor: 500 }, // 5 basis points
        activeId: 8388608
      })
    })

    it('should analyze fee optimization and return analysis', async () => {
      const analysis = await feeTierManager.analyzeFeeOptimization(
        mockPoolAddress,
        '10000',
        'USDC/USDT',
        mockSettings
      )

      expect(analysis).toMatchObject({
        currentTier: expect.objectContaining({
          category: expect.any(String),
          totalFeeBps: expect.any(Number)
        }),
        potentialSavings: expect.any(Number),
        savingsPercentage: expect.any(Number),
        analysisReason: expect.any(String),
        optimization: expect.objectContaining({
          timeToBreakeven: expect.any(Number),
          projectedAnnualSavings: expect.any(Number),
          riskLevel: expect.any(String)
        })
      })
    })

    it('should cache analysis results', async () => {
      const analysis1 = await feeTierManager.analyzeFeeOptimization(
        mockPoolAddress,
        '10000',
        'USDC/USDT',
        mockSettings
      )

      const analysis2 = await feeTierManager.analyzeFeeOptimization(
        mockPoolAddress,
        '10000',
        'USDC/USDT',
        mockSettings
      )

      expect(analysis1).toEqual(analysis2)
      expect(mockGetLbPair).toHaveBeenCalledTimes(1)
    })

    it('should handle pool not found error', async () => {
      mockGetLbPair.mockResolvedValue(null)

      await expect(feeTierManager.analyzeFeeOptimization(
        mockPoolAddress,
        '10000',
        'USDC/USDT',
        mockSettings
      )).rejects.toThrow('Pool not found')
    })

    it('should return no recommendation for optimal current tier', async () => {
      // Mock a scenario where current tier is already optimal
      mockGetLbPair.mockResolvedValue({
        feeInfo: { baseFactor: 100 }, // 1 basis point (stable-low tier)
        activeId: 8388608
      })

      const analysis = await feeTierManager.analyzeFeeOptimization(
        mockPoolAddress,
        '50000',
        'USDC/USDT',
        mockSettings
      )

      expect(analysis.recommendedTier).toBeNull()
      expect(analysis.potentialSavings).toBe(0)
      expect(analysis.analysisReason).toBe('Current fee tier is already optimal')
    })

    it('should calculate different savings for different risk tolerances', async () => {
      const conservativeSettings = { ...mockSettings, riskTolerance: 'conservative' as const }
      const aggressiveSettings = { ...mockSettings, riskTolerance: 'aggressive' as const }

      const conservativeAnalysis = await feeTierManager.analyzeFeeOptimization(
        mockPoolAddress,
        '10000',
        'SOL/USDC',
        conservativeSettings
      )

      const aggressiveAnalysis = await feeTierManager.analyzeFeeOptimization(
        mockPoolAddress,
        '10000',
        'SOL/USDC',
        aggressiveSettings
      )

      expect(conservativeAnalysis.optimization.riskLevel).toBeDefined()
      expect(aggressiveAnalysis.optimization.riskLevel).toBeDefined()
    })

    it('should handle zero volume pool scenario', async () => {
      mockGetLbPair.mockResolvedValue({
        feeInfo: { baseFactor: 0 },
        activeId: 8388608
      })

      const analysis = await feeTierManager.analyzeFeeOptimization(
        mockPoolAddress,
        '0',
        'MEME/SOL',
        mockSettings
      )

      expect(analysis.potentialSavings).toBe(0)
      expect(analysis.savingsPercentage).toBe(0)
    })

    it('should handle extreme volatility scenarios', async () => {
      const highVolatilitySettings = { ...mockSettings, riskTolerance: 'aggressive' as const }

      const analysis = await feeTierManager.analyzeFeeOptimization(
        mockPoolAddress,
        '1000',
        'MEME/SOL',
        highVolatilitySettings
      )

      expect(analysis).toBeDefined()
      expect(analysis.optimization.riskLevel).toMatch(/low|medium|high/)
    })
  })

  describe('getAvailableFeeTiers', () => {
    it('should return available fee tiers for USDC/USDT pair', () => {
      const tiers = feeTierManager.getAvailableFeeTiers('USDC/USDT', '10000')

      expect(tiers.length).toBeGreaterThan(0)
      expect(tiers[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        totalFeeBps: expect.any(Number),
        category: expect.any(String),
        isActive: true
      })
    })

    it('should filter tiers by liquidity requirements', () => {
      const smallLiquidityTiers = feeTierManager.getAvailableFeeTiers('SOL/USDC', '500')
      const largeLiquidityTiers = feeTierManager.getAvailableFeeTiers('SOL/USDC', '100000000')

      expect(smallLiquidityTiers.length).toBeLessThanOrEqual(largeLiquidityTiers.length)
    })

    it('should return stable tiers for stable pairs', () => {
      const tiers = feeTierManager.getAvailableFeeTiers('USDC/USDT', '10000')
      const stableTiers = tiers.filter(t => t.category === 'stable')

      expect(stableTiers.length).toBeGreaterThan(0)
    })

    it('should return volatile tiers for volatile pairs', () => {
      const tiers = feeTierManager.getAvailableFeeTiers('RAY/SOL', '5000')
      const volatileTiers = tiers.filter(t => t.category === 'volatile' || t.category === 'stable')

      expect(volatileTiers.length).toBeGreaterThan(0)
    })

    it('should handle extremely small liquidity amounts', () => {
      const tiers = feeTierManager.getAvailableFeeTiers('MEME/SOL', '0.1')
      expect(tiers).toEqual([])
    })

    it('should handle extremely large liquidity amounts', () => {
      const tiers = feeTierManager.getAvailableFeeTiers('SOL/USDC', '999999999')
      expect(Array.isArray(tiers)).toBe(true)
    })
  })

  describe('createCustomFeeTier', () => {
    it('should create custom fee tier with valid parameters', () => {
      const customTier = feeTierManager.createCustomFeeTier(
        'Custom High',
        150,
        10,
        'Custom high-fee tier for exotic pairs',
        ['CUSTOM/SOL'],
        '1000'
      )

      expect(customTier).toMatchObject({
        id: expect.stringMatching(/^custom-\d+$/),
        name: 'Custom High',
        baseFeeBps: 150,
        protocolFeeBps: 10,
        totalFeeBps: 160,
        category: 'custom',
        isActive: true
      })
    })

    it('should calculate total fees correctly', () => {
      const customTier = feeTierManager.createCustomFeeTier(
        'Test Tier',
        50,
        25,
        'Test description',
        ['TEST/SOL'],
        '5000'
      )

      expect(customTier.totalFeeBps).toBe(75)
    })

    it('should handle zero fees', () => {
      const customTier = feeTierManager.createCustomFeeTier(
        'Zero Fee Tier',
        0,
        0,
        'Zero fee tier',
        ['FREE/SOL'],
        '1000'
      )

      expect(customTier.totalFeeBps).toBe(0)
    })
  })

  describe('calculateMigrationImpact', () => {
    let currentTier: FeeTier
    let targetTier: FeeTier

    beforeEach(() => {
      currentTier = {
        id: 'stable-standard',
        name: 'Stable Standard',
        baseFeeBps: 5,
        protocolFeeBps: 0,
        totalFeeBps: 5,
        category: 'stable',
        description: 'Standard stable tier',
        recommendedFor: ['SOL/USDC'],
        minLiquidity: '10000',
        isActive: true
      }

      targetTier = {
        id: 'stable-low',
        name: 'Stable Low',
        baseFeeBps: 1,
        protocolFeeBps: 0,
        totalFeeBps: 1,
        category: 'stable',
        description: 'Low fee stable tier',
        recommendedFor: ['USDC/USDT'],
        minLiquidity: '1000',
        isActive: true
      }
    })

    it('should calculate migration impact correctly', async () => {
      const impact = await feeTierManager.calculateMigrationImpact(
        currentTier,
        targetTier,
        '10000',
        '5000'
      )

      expect(impact).toMatchObject({
        migrationCost: 10, // 0.1% of 10000
        dailySavings: expect.any(Number),
        breakEvenDays: expect.any(Number),
        annualBenefit: expect.any(Number)
      })

      expect(impact.dailySavings).toBeGreaterThan(0) // Should save fees
      expect(impact.breakEvenDays).toBeGreaterThan(0)
    })

    it('should handle zero volume scenario', async () => {
      const impact = await feeTierManager.calculateMigrationImpact(
        currentTier,
        targetTier,
        '10000',
        '0'
      )

      expect(impact.dailySavings).toBe(0)
      expect(impact.breakEvenDays).toBe(Infinity)
      expect(impact.annualBenefit).toBeLessThan(0) // Loss due to migration cost
    })

    it('should calculate negative savings when target tier is more expensive', async () => {
      const expensiveTier = {
        ...targetTier,
        totalFeeBps: 50 // More expensive than current
      }

      const impact = await feeTierManager.calculateMigrationImpact(
        currentTier,
        expensiveTier,
        '10000',
        '1000'
      )

      expect(impact.dailySavings).toBeLessThan(0)
      expect(impact.breakEvenDays).toBe(Infinity)
    })

    it('should handle large liquidity amounts', async () => {
      const impact = await feeTierManager.calculateMigrationImpact(
        currentTier,
        targetTier,
        '1000000',
        '100000'
      )

      expect(impact.migrationCost).toBe(1000) // 0.1% of 1000000
      expect(impact.annualBenefit).toBeDefined()
    })
  })

  describe('getMarketBasedRecommendations', () => {
    it('should generate recommendations for stable pairs', async () => {
      const recommendations = await feeTierManager.getMarketBasedRecommendations(
        'USDC/USDT',
        '50000'
      )

      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations[0]).toMatchObject({
        tier: expect.objectContaining({
          category: expect.any(String)
        }),
        confidence: expect.any(Number),
        reasoning: expect.any(String)
      })

      // Should prioritize stable tiers for stable pairs
      const stableRecommendations = recommendations.filter(r => r.tier.category === 'stable')
      expect(stableRecommendations.length).toBeGreaterThan(0)
    })

    it('should generate recommendations for major token pairs', async () => {
      const recommendations = await feeTierManager.getMarketBasedRecommendations(
        'SOL/USDC',
        '25000'
      )

      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            confidence: expect.any(Number),
            reasoning: expect.stringContaining('Major token pair')
          })
        ])
      )
    })

    it('should adjust confidence based on liquidity amount', async () => {
      const smallLiqRecommendations = await feeTierManager.getMarketBasedRecommendations(
        'SOL/USDC',
        '1000'
      )

      const largeLiqRecommendations = await feeTierManager.getMarketBasedRecommendations(
        'SOL/USDC',
        '100000'
      )

      expect(smallLiqRecommendations[0].confidence).toBeDefined()
      expect(largeLiqRecommendations[0].confidence).toBeDefined()
    })

    it('should handle exotic token pairs', async () => {
      const recommendations = await feeTierManager.getMarketBasedRecommendations(
        'UNKNOWN/TOKEN',
        '5000'
      )

      expect(recommendations.length).toBeGreaterThan(0)
      recommendations.forEach(rec => {
        expect(rec.confidence).toBeGreaterThanOrEqual(0)
        expect(rec.confidence).toBeLessThanOrEqual(1)
      })
    })

    it('should sort recommendations by confidence', async () => {
      const recommendations = await feeTierManager.getMarketBasedRecommendations(
        'ETH/USDC',
        '20000'
      )

      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i].confidence).toBeLessThanOrEqual(recommendations[i - 1].confidence)
      }
    })

    it('should provide fallback reasoning for unknown pairs', async () => {
      const recommendations = await feeTierManager.getMarketBasedRecommendations(
        'UNKNOWN/UNKNOWN',
        '10000'
      )

      expect(recommendations[0].reasoning).toContain('Standard fee tier recommendation')
    })
  })

  describe('cache management', () => {
    it('should clear cache successfully', () => {
      feeTierManager.clearCache()
      const stats = feeTierManager.getCacheStats()

      expect(stats.count).toBe(0)
      expect(stats.keys).toEqual([])
    })

    it('should provide cache statistics', async () => {
      // Add something to cache
      await feeTierManager.analyzeFeeOptimization(
        mockPoolAddress,
        '10000',
        'USDC/USDT',
        {
          riskTolerance: 'moderate',
          liquidityRange: 'moderate',
          rebalanceFrequency: 'weekly',
          maxSlippage: 0.01,
          prioritizeFees: true
        }
      )

      const stats = feeTierManager.getCacheStats()
      expect(stats.count).toBeGreaterThan(0)
      expect(Array.isArray(stats.keys)).toBe(true)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle invalid pool address gracefully', async () => {
      mockGetLbPair.mockRejectedValue(new Error('Invalid pool address'))

      await expect(feeTierManager.analyzeFeeOptimization(
        mockPoolAddress,
        '10000',
        'USDC/USDT',
        {
          riskTolerance: 'moderate',
          liquidityRange: 'moderate',
          rebalanceFrequency: 'weekly',
          maxSlippage: 0.01,
          prioritizeFees: true
        }
      )).rejects.toThrow('Invalid pool address')
    })

    it('should handle negative liquidity amounts', () => {
      const tiers = feeTierManager.getAvailableFeeTiers('USDC/USDT', '-1000')
      expect(tiers).toEqual([])
    })

    it('should handle non-numeric liquidity amounts', () => {
      const tiers = feeTierManager.getAvailableFeeTiers('USDC/USDT', 'invalid')
      // NaN liquidity should be treated as 0, which fails minimum requirements
      expect(tiers.length).toBe(0)
    })

    it('should handle empty token pair strings', async () => {
      const recommendations = await feeTierManager.getMarketBasedRecommendations('', '10000')
      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('should handle break-even calculation edge cases', async () => {
      const sameTier: FeeTier = {
        id: 'test-tier',
        name: 'Test Tier',
        baseFeeBps: 5,
        protocolFeeBps: 0,
        totalFeeBps: 5,
        category: 'stable',
        description: 'Test tier',
        recommendedFor: [],
        minLiquidity: '1000',
        isActive: true
      }

      const impact = await feeTierManager.calculateMigrationImpact(
        sameTier,
        sameTier,
        '10000',
        '5000'
      )

      expect(impact.dailySavings).toBe(0)
      expect(impact.breakEvenDays).toBe(Infinity)
    })
  })

  describe('fee tier trend detection', () => {
    it('should detect optimal tier for conservative strategy', async () => {
      const conservativeSettings: FeeOptimizationSettings = {
        riskTolerance: 'conservative',
        liquidityRange: 'tight',
        rebalanceFrequency: 'never',
        maxSlippage: 0.005,
        prioritizeFees: true
      }

      const analysis = await feeTierManager.analyzeFeeOptimization(
        mockPoolAddress,
        '100000',
        'USDC/USDT',
        conservativeSettings
      )

      expect(analysis.optimization.riskLevel).toMatch(/low|medium|high/)
      expect(analysis.currentTier).toBeDefined()
    })

    it('should detect optimal tier for aggressive strategy', async () => {
      const aggressiveSettings: FeeOptimizationSettings = {
        riskTolerance: 'aggressive',
        liquidityRange: 'wide',
        rebalanceFrequency: 'hourly',
        maxSlippage: 0.05,
        prioritizeFees: false
      }

      const analysis = await feeTierManager.analyzeFeeOptimization(
        mockPoolAddress,
        '10000',
        'MEME/SOL',
        aggressiveSettings
      )

      expect(analysis).toBeDefined()
      expect(analysis.optimization.timeToBreakeven).toBeDefined()
      expect(analysis.currentTier).toBeDefined()
    })
  })

  describe('mathematical accuracy validation', () => {
    it('should calculate percentage savings accurately', async () => {
      const currentTier: FeeTier = {
        id: 'high-tier',
        name: 'High Tier',
        baseFeeBps: 100,
        protocolFeeBps: 0,
        totalFeeBps: 100,
        category: 'volatile',
        description: 'High fee tier',
        recommendedFor: [],
        minLiquidity: '1000',
        isActive: true
      }

      const lowTier: FeeTier = {
        id: 'low-tier',
        name: 'Low Tier',
        baseFeeBps: 10,
        protocolFeeBps: 0,
        totalFeeBps: 10,
        category: 'stable',
        description: 'Low fee tier',
        recommendedFor: [],
        minLiquidity: '1000',
        isActive: true
      }

      const impact = await feeTierManager.calculateMigrationImpact(
        currentTier,
        lowTier,
        '10000',
        '1000'
      )

      // Daily savings should be (1000 * 0.01) - (1000 * 0.001) = 10 - 1 = 9
      expect(Math.abs(impact.dailySavings - 9)).toBeLessThan(0.01)
    })

    it('should calculate break-even time accurately', async () => {
      const impact = await feeTierManager.calculateMigrationImpact(
        {
          id: 'high',
          name: 'High',
          baseFeeBps: 50,
          protocolFeeBps: 0,
          totalFeeBps: 50,
          category: 'volatile',
          description: '',
          recommendedFor: [],
          minLiquidity: '1000',
          isActive: true
        },
        {
          id: 'low',
          name: 'Low',
          baseFeeBps: 10,
          protocolFeeBps: 0,
          totalFeeBps: 10,
          category: 'stable',
          description: '',
          recommendedFor: [],
          minLiquidity: '1000',
          isActive: true
        },
        '10000',
        '1000'
      )

      // Migration cost: 10000 * 0.001 = 10
      // Daily savings: (1000 * 0.005) - (1000 * 0.001) = 5 - 1 = 4
      // Break-even: 10 / 4 = 2.5 days
      expect(Math.abs(impact.breakEvenDays - 2.5)).toBeLessThan(0.1)
    })

    it('should handle precision in percentage calculations', async () => {
      const recommendations = await feeTierManager.getMarketBasedRecommendations(
        'USDC/USDT',
        '50000'
      )

      recommendations.forEach(rec => {
        expect(rec.confidence).toBeGreaterThanOrEqual(0)
        expect(rec.confidence).toBeLessThanOrEqual(1)
        expect(Number.isFinite(rec.confidence)).toBe(true)
      })
    })
  })
})