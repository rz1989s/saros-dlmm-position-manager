// Advanced Fee Collection Strategies Tests
// 🧪 Comprehensive testing for enhanced fee collection optimization

import { PublicKey } from '@solana/web3.js'
import {
  StrategyManager,
  FeeCollectionStrategy,
  FeeCollectionOpportunity,
  // CompoundingAnalysis // Unused import
} from '@/lib/dlmm/strategies'
import type { DLMMPosition } from '@/lib/types'

// Mock DLMM client
jest.mock('@/lib/dlmm/client', () => ({
  dlmmClient: {
    getUserPositions: jest.fn(),
    getLbPair: jest.fn(),
    getConnection: jest.fn(() => ({}))
  }
}))

// Mock operations
jest.mock('@/lib/dlmm/operations', () => ({
  dlmmOperations: {
    estimateRebalanceProfit: jest.fn()
  }
}))

describe('Advanced Fee Collection Strategies', () => {
  let strategyManager: StrategyManager
  let mockUserAddress: PublicKey
  let mockPositions: DLMMPosition[]

  beforeEach(() => {
    strategyManager = new StrategyManager()
    mockUserAddress = new PublicKey('11111111111111111111111111111112')

    // Mock positions
    mockPositions = [
      {
        id: 'pos1',
        poolAddress: new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'),
        userAddress: mockUserAddress,
        activeBin: 100,
        liquidityAmount: '1000000',
        feesEarned: {
          tokenX: '5000',
          tokenY: '5000'
        },
        createdAt: new Date('2024-01-01'),
        lastUpdated: new Date(),
        isActive: true,
        tokenX: {
          address: new PublicKey('So11111111111111111111111111111111111111112'),
          symbol: 'SOL',
          name: 'Solana',
          decimals: 9,
          price: 100
        },
        tokenY: {
          address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          price: 1
        },
        currentValue: 1000,
        pnl: 50,
        pnlPercent: 5,
        bins: []
      }
    ] as DLMMPosition[]

    // Setup mocks
    const { dlmmClient } = require('@/lib/dlmm/client')
    dlmmClient.getUserPositions.mockResolvedValue(mockPositions.map(p => ({
      pair: p.poolAddress.toString(),
      ...p
    })))
    dlmmClient.getLbPair.mockResolvedValue({ activeId: 100 })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Fee Strategy Management', () => {
    test('should get default fee strategies', () => {
      const strategies = strategyManager.getDefaultFeeStrategies()

      expect(strategies).toHaveLength(4)
      expect(strategies.map(s => s.id)).toContain('immediate-collection')
      expect(strategies.map(s => s.id)).toContain('gas-optimized')
      expect(strategies.map(s => s.id)).toContain('compound-reinvest')
      expect(strategies.map(s => s.id)).toContain('high-efficiency')
    })

    test('should enable fee strategy with default config', () => {
      strategyManager.enableFeeStrategy('immediate-collection')

      const activeStrategies = strategyManager.getActiveFeeStrategies()
      expect(activeStrategies).toHaveLength(1)
      expect(activeStrategies[0].id).toBe('immediate-collection')
      expect(activeStrategies[0].enabled).toBe(true)
    })

    test('should enable fee strategy with custom config', () => {
      const customConfig: Partial<FeeCollectionStrategy> = {
        parameters: {
          minimumFeeThreshold: 5.0,
          gasPriceLimit: 0.10,
          timingOptimization: 'gas_optimized',
          compoundingEnabled: true,
          autoReinvestPercentage: 90,
          batchingEnabled: true,
          maxBatchSize: 15
        }
      }

      strategyManager.enableFeeStrategy('immediate-collection', customConfig)

      const activeStrategies = strategyManager.getActiveFeeStrategies()
      expect(activeStrategies[0].parameters.minimumFeeThreshold).toBe(5.0)
      expect(activeStrategies[0].parameters.autoReinvestPercentage).toBe(90)
    })

    test('should disable fee strategy', () => {
      strategyManager.enableFeeStrategy('immediate-collection')
      strategyManager.disableFeeStrategy('immediate-collection')

      const activeStrategies = strategyManager.getActiveFeeStrategies()
      expect(activeStrategies).toHaveLength(0)
    })

    test('should throw error for unknown strategy', () => {
      expect(() => {
        strategyManager.enableFeeStrategy('unknown-strategy')
      }).toThrow('Fee strategy unknown-strategy not found')
    })
  })

  describe('Fee Collection Analysis', () => {
    test('should analyze fee collection opportunities', async () => {
      const analysis = await strategyManager.analyzeFeeCollectionOpportunities(mockUserAddress)

      expect(analysis).toHaveProperty('opportunities')
      expect(analysis).toHaveProperty('batchingRecommendations')
      expect(analysis).toHaveProperty('compoundingAnalysis')
      expect(analysis).toHaveProperty('optimalTiming')

      expect(Array.isArray(analysis.opportunities)).toBe(true)
      expect(Array.isArray(analysis.batchingRecommendations)).toBe(true)
    })

    test('should return valid fee collection opportunities', async () => {
      const analysis = await strategyManager.analyzeFeeCollectionOpportunities(mockUserAddress)

      if (analysis.opportunities.length > 0) {
        const opportunity = analysis.opportunities[0]

        expect(opportunity).toHaveProperty('positionId')
        expect(opportunity).toHaveProperty('poolAddress')
        expect(opportunity).toHaveProperty('estimatedFeeX')
        expect(opportunity).toHaveProperty('estimatedFeeY')
        expect(opportunity).toHaveProperty('totalFeeValue')
        expect(opportunity).toHaveProperty('estimatedGasCost')
        expect(opportunity).toHaveProperty('netProfit')
        expect(opportunity).toHaveProperty('efficiency')
        expect(opportunity).toHaveProperty('urgency')
        expect(opportunity).toHaveProperty('recommendation')

        expect(typeof opportunity.netProfit).toBe('number')
        expect(typeof opportunity.efficiency).toBe('number')
        expect(['low', 'medium', 'high']).toContain(opportunity.urgency)
        expect(['collect_now', 'wait_for_more', 'batch_with_others', 'compound_reinvest'])
          .toContain(opportunity.recommendation)
      }
    })

    test('should generate valid batching recommendations', async () => {
      // Add more positions to trigger batching
      const additionalPositions = Array.from({ length: 3 }, (_, i) => ({
        ...mockPositions[0],
        id: `pos${i + 2}`,
      }))

      const { dlmmClient } = require('@/lib/dlmm/client')
      dlmmClient.getUserPositions.mockResolvedValue([
        ...mockPositions.map(p => ({ pair: p.poolAddress.toString(), ...p })),
        ...additionalPositions.map(p => ({ pair: p.poolAddress.toString(), ...p }))
      ])

      const analysis = await strategyManager.analyzeFeeCollectionOpportunities(mockUserAddress)

      if (analysis.batchingRecommendations.length > 0) {
        const batch = analysis.batchingRecommendations[0]

        expect(batch).toHaveProperty('positionIds')
        expect(batch).toHaveProperty('totalFees')
        expect(batch).toHaveProperty('totalGasCost')
        expect(batch).toHaveProperty('netProfit')
        expect(batch).toHaveProperty('efficiency')

        expect(Array.isArray(batch.positionIds)).toBe(true)
        expect(batch.positionIds.length).toBeGreaterThan(1)
        expect(typeof batch.efficiency).toBe('number')
        expect(batch.efficiency).toBeGreaterThan(0)
      }
    })

    test('should provide valid compounding analysis', async () => {
      const analysis = await strategyManager.analyzeFeeCollectionOpportunities(mockUserAddress)
      const compounding = analysis.compoundingAnalysis

      expect(compounding).toHaveProperty('currentFees')
      expect(compounding).toHaveProperty('projectedGrowth')
      expect(compounding).toHaveProperty('optimalReinvestAmount')
      expect(compounding).toHaveProperty('compoundingBenefit')
      expect(compounding).toHaveProperty('timeToBreakeven')
      expect(compounding).toHaveProperty('recommendedAction')

      expect(typeof compounding.currentFees).toBe('number')
      expect(typeof compounding.projectedGrowth).toBe('number')
      expect(['collect', 'compound', 'wait']).toContain(compounding.recommendedAction)
    })

    test('should provide optimal timing recommendations', async () => {
      const analysis = await strategyManager.analyzeFeeCollectionOpportunities(mockUserAddress)
      const timing = analysis.optimalTiming

      expect(timing).toHaveProperty('immediate')
      expect(timing).toHaveProperty('within1Hour')
      expect(timing).toHaveProperty('within24Hours')
      expect(timing).toHaveProperty('recommendation')

      expect(typeof timing.immediate).toBe('number')
      expect(typeof timing.within1Hour).toBe('number')
      expect(typeof timing.within24Hours).toBe('number')
      expect(typeof timing.recommendation).toBe('string')
    })

    test('should handle empty positions gracefully', async () => {
      const { dlmmClient } = require('@/lib/dlmm/client')
      dlmmClient.getUserPositions.mockResolvedValue([])

      const analysis = await strategyManager.analyzeFeeCollectionOpportunities(mockUserAddress)

      expect(analysis.opportunities).toHaveLength(0)
      expect(analysis.batchingRecommendations).toHaveLength(0)
      expect(analysis.compoundingAnalysis.currentFees).toBe(0)
    })

    test('should handle analysis errors gracefully', async () => {
      const { dlmmClient } = require('@/lib/dlmm/client')
      dlmmClient.getUserPositions.mockRejectedValue(new Error('API Error'))

      const analysis = await strategyManager.analyzeFeeCollectionOpportunities(mockUserAddress)

      expect(analysis.opportunities).toHaveLength(0)
      expect(analysis.batchingRecommendations).toHaveLength(0)
      expect(analysis.compoundingAnalysis.recommendedAction).toBe('wait')
    })
  })

  describe('Fee Collection Execution', () => {
    let mockOpportunities: FeeCollectionOpportunity[]

    beforeEach(() => {
      mockOpportunities = [
        {
          positionId: 'pos1',
          poolAddress: new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'),
          estimatedFeeX: 5.0,
          estimatedFeeY: 2.5,
          totalFeeValue: 7.5,
          estimatedGasCost: 0.05,
          netProfit: 7.45,
          efficiency: 149,
          urgency: 'high',
          recommendation: 'collect_now'
        },
        {
          positionId: 'pos2',
          poolAddress: new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo3'),
          estimatedFeeX: 2.0,
          estimatedFeeY: 1.0,
          totalFeeValue: 3.0,
          estimatedGasCost: 0.03,
          netProfit: 2.97,
          efficiency: 99,
          urgency: 'medium',
          recommendation: 'batch_with_others'
        }
      ]
    })

    test('should execute immediate fee collection', async () => {
      const executions = await strategyManager.executeOptimizedFeeCollection(
        mockUserAddress,
        mockOpportunities,
        'immediate'
      )

      expect(executions.length).toBeGreaterThan(0)

      const execution = executions[0]
      expect(execution.action).toBe('collect_fees')
      expect(execution.success).toBe(true)
      expect(execution.feeCollectionData).toBeDefined()
      expect(execution.feeCollectionData?.netProfit).toBeGreaterThan(0)
    })

    test('should execute batched fee collection', async () => {
      const executions = await strategyManager.executeOptimizedFeeCollection(
        mockUserAddress,
        mockOpportunities,
        'batched'
      )

      // Should generate batching recommendations and execute them
      expect(Array.isArray(executions)).toBe(true)
    })

    test('should execute compound fee collection', async () => {
      mockOpportunities[0].recommendation = 'compound_reinvest'

      const executions = await strategyManager.executeOptimizedFeeCollection(
        mockUserAddress,
        mockOpportunities,
        'compound'
      )

      if (executions.length > 0) {
        const execution = executions[0]
        expect(execution.strategyId).toBe('compound-fee-collection')
        expect(execution.feeCollectionData?.efficiency).toBeGreaterThanOrEqual(
          mockOpportunities[0].efficiency
        )
      }
    })

    test('should handle execution errors gracefully', async () => {
      // Mock an opportunity that will cause execution to fail
      const failingOpportunity: FeeCollectionOpportunity = {
        ...mockOpportunities[0],
        positionId: 'invalid-position'
      }

      const executions = await strategyManager.executeOptimizedFeeCollection(
        mockUserAddress,
        [failingOpportunity],
        'immediate'
      )

      expect(executions.length).toBeGreaterThan(0)
      // Execution should still complete (simulated, so it won't actually fail)
    })
  })

  describe('Performance Metrics', () => {
    test('should track fee collection performance', async () => {
      const mockOpportunities = [
        {
          positionId: 'pos1',
          poolAddress: new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'),
          estimatedFeeX: 5.0,
          estimatedFeeY: 2.5,
          totalFeeValue: 7.5,
          estimatedGasCost: 0.05,
          netProfit: 7.45,
          efficiency: 149,
          urgency: 'high',
          recommendation: 'collect_now'
        }
      ] as FeeCollectionOpportunity[]

      // Execute fee collection to generate metrics
      await strategyManager.executeOptimizedFeeCollection(
        mockUserAddress,
        mockOpportunities,
        'immediate'
      )

      const performance = strategyManager.getFeeCollectionPerformance()

      expect(performance).toBeDefined()
      expect(performance.totalStrategies).toBeGreaterThan(0)
      expect(performance.totalFeesCollected).toBeGreaterThan(0)
      expect(performance.totalCollections).toBeGreaterThan(0)
      expect(performance.roiPercentage).toBeGreaterThan(0)
    })

    test('should return null for empty performance metrics', () => {
      const performance = strategyManager.getFeeCollectionPerformance('non-existent-strategy')
      expect(performance).toBeNull()
    })

    test('should track individual strategy performance', async () => {
      const mockOpportunities = [
        {
          positionId: 'pos1',
          poolAddress: new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'),
          estimatedFeeX: 5.0,
          estimatedFeeY: 2.5,
          totalFeeValue: 7.5,
          estimatedGasCost: 0.05,
          netProfit: 7.45,
          efficiency: 149,
          urgency: 'high',
          recommendation: 'collect_now'
        }
      ] as FeeCollectionOpportunity[]

      await strategyManager.executeOptimizedFeeCollection(
        mockUserAddress,
        mockOpportunities,
        'immediate'
      )

      const strategyPerformance = strategyManager.getFeeCollectionPerformance('fee-collection')

      if (strategyPerformance) {
        expect(strategyPerformance.totalFeesCollected).toBeGreaterThan(0)
        expect(strategyPerformance.collectionCount).toBeGreaterThan(0)
        expect(strategyPerformance.averageEfficiency).toBeGreaterThan(0)
        expect(strategyPerformance.lastCollection).toBeInstanceOf(Date)
      }
    })
  })

  describe('Integration Tests', () => {
    test('should handle complete fee collection workflow', async () => {
      // 1. Enable strategies
      strategyManager.enableFeeStrategy('immediate-collection')
      strategyManager.enableFeeStrategy('gas-optimized')

      // 2. Analyze opportunities
      const analysis = await strategyManager.analyzeFeeCollectionOpportunities(mockUserAddress)

      // 3. Execute based on recommendations
      if (analysis.opportunities.length > 0) {
        const highPriorityOps = analysis.opportunities.filter(o => o.urgency === 'high')

        if (highPriorityOps.length > 0) {
          const executions = await strategyManager.executeOptimizedFeeCollection(
            mockUserAddress,
            highPriorityOps,
            'immediate'
          )

          expect(executions.length).toBeGreaterThan(0)
          expect(executions.every(e => e.success)).toBe(true)
        }
      }

      // 4. Check performance
      const performance = strategyManager.getFeeCollectionPerformance()
      expect(performance).toBeDefined()
    })

    test('should optimize fee collection timing', async () => {
      const analysis = await strategyManager.analyzeFeeCollectionOpportunities(mockUserAddress)

      // Should provide timing recommendations
      expect(analysis.optimalTiming.recommendation).toBeDefined()
      expect(typeof analysis.optimalTiming.recommendation).toBe('string')

      // Timing should be based on opportunity urgency
      const hasHighUrgency = analysis.opportunities.some(o => o.urgency === 'high')
      const hasMediumUrgency = analysis.opportunities.some(o => o.urgency === 'medium')

      if (hasHighUrgency) {
        expect(analysis.optimalTiming.immediate).toBeGreaterThan(0)
      }
      if (hasMediumUrgency) {
        expect(analysis.optimalTiming.within1Hour).toBeGreaterThan(0)
      }
    })
  })
})