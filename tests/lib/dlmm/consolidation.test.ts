import { PublicKey, Connection } from '@solana/web3.js'
import { PositionConsolidationEngine, ConsolidationAnalysis } from '../../../src/lib/dlmm/consolidation'
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

describe('PositionConsolidationEngine', () => {
  let consolidationEngine: PositionConsolidationEngine
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

    consolidationEngine = new PositionConsolidationEngine(mockClient)

    mockPositions = [
      // Two USDC/USDT positions in different pools (consolidation opportunity)
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
        currentValue: 8000,
        initialValue: 7500,
        pnl: 500,
        pnlPercent: 6.67,
        realizedPnl: 150,
        unrealizedPnl: 350,
        feeEarnings: 200,
        impermanentLoss: -50,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        bins: [
          {
            binId: 8388608,
            price: 1.0,
            liquidityX: 4000,
            liquidityY: 4000,
            reserveX: 4000,
            reserveY: 4000
          }
        ]
      },
      {
        publicKey: new PublicKey('Position2222222222222222222222222222222222'),
        pair: new PublicKey('Pool2222222222222222222222222222222222222222'),
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
        currentValue: 12000,
        initialValue: 11000,
        pnl: 1000,
        pnlPercent: 9.09,
        realizedPnl: 300,
        unrealizedPnl: 700,
        feeEarnings: 400,
        impermanentLoss: -100,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
        bins: [
          {
            binId: 8388605,
            price: 1.0,
            liquidityX: 6000,
            liquidityY: 6000,
            reserveX: 6000,
            reserveY: 6000
          }
        ]
      },
      // Small SOL/USDC position (low efficiency - consolidation candidate)
      {
        publicKey: new PublicKey('Position3333333333333333333333333333333333'),
        pair: new PublicKey('Pool3333333333333333333333333333333333333333'),
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
        currentValue: 500, // Very small position
        initialValue: 600,
        pnl: -100,
        pnlPercent: -16.67,
        realizedPnl: -50,
        unrealizedPnl: -50,
        feeEarnings: 5,
        impermanentLoss: -5,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
        bins: [
          {
            binId: 8388590,
            price: 100.0,
            liquidityX: 2.5,
            liquidityY: 250,
            reserveX: 2.5,
            reserveY: 250
          }
        ]
      },
      // Another small ETH/USDC position
      {
        publicKey: new PublicKey('Position4444444444444444444444444444444444'),
        pair: new PublicKey('Pool4444444444444444444444444444444444444444'),
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
        currentValue: 800, // Small position
        initialValue: 1000,
        pnl: -200,
        pnlPercent: -20.0,
        realizedPnl: -100,
        unrealizedPnl: -100,
        feeEarnings: 10,
        impermanentLoss: -10,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date(),
        bins: [
          {
            binId: 8388580,
            price: 2000.0,
            liquidityX: 0.2,
            liquidityY: 400,
            reserveX: 0.2,
            reserveY: 400
          }
        ]
      },
      // Large SOL/USDC position (good reference)
      {
        publicKey: new PublicKey('Position5555555555555555555555555555555555'),
        pair: new PublicKey('Pool5555555555555555555555555555555555555555'),
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
        currentValue: 25000,
        initialValue: 20000,
        pnl: 5000,
        pnlPercent: 25.0,
        realizedPnl: 1500,
        unrealizedPnl: 3500,
        feeEarnings: 2000,
        impermanentLoss: -500,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date(),
        bins: [
          {
            binId: 8388595,
            price: 100.0,
            liquidityX: 125,
            liquidityY: 12500,
            reserveX: 125,
            reserveY: 12500
          }
        ]
      }
    ]
  })

  describe('analyzeConsolidationOpportunities', () => {
    it('should identify comprehensive consolidation opportunities', async () => {
      const analysis = await consolidationEngine.analyzeConsolidationOpportunities(mockPositions, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: true,
        includeExecutionPlan: true,
        includeMonitoringPlan: true,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      expect(analysis).toMatchObject({
        summary: expect.objectContaining({
          totalOpportunities: expect.any(Number),
          potentialSavings: expect.any(Number),
          estimatedCosts: expect.any(Number),
          netBenefit: expect.any(Number),
          recommendedActions: expect.any(Number)
        }),
        opportunities: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            type: expect.stringMatching(/^(similar_pairs|low_efficiency|high_cost|overlapping_ranges)$/),
            positions: expect.any(Array),
            description: expect.any(String),
            analysis: expect.objectContaining({
              currentPositions: expect.any(Array),
              targetPosition: expect.any(Object),
              metrics: expect.any(Object),
              benefits: expect.any(Array),
              costs: expect.any(Array),
              summary: expect.any(Object)
            })
          })
        ]),
        executionPlan: expect.objectContaining({
          totalPhases: expect.any(Number),
          estimatedDuration: expect.any(Number),
          phases: expect.any(Array),
          dependencies: expect.any(Array),
          riskMitigation: expect.any(Array)
        }),
        riskAssessment: expect.objectContaining({
          overallRisk: expect.stringMatching(/^(low|medium|high)$/),
          riskFactors: expect.any(Array),
          mitigationStrategies: expect.any(Array),
          contingencyPlans: expect.any(Array)
        }),
        monitoringPlan: expect.objectContaining({
          keyMetrics: expect.any(Array),
          monitoringFrequency: expect.any(String),
          alertThresholds: expect.any(Array),
          reportingSchedule: expect.any(Array)
        })
      })
    })

    it('should identify similar pair consolidation opportunities', async () => {
      const analysis = await consolidationEngine.analyzeConsolidationOpportunities(mockPositions, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: false,
        includeExecutionPlan: false,
        includeMonitoringPlan: false,
        optimizationObjective: 'cost_reduction',
        timeframe: '30d'
      })

      // Should identify USDC/USDT consolidation opportunity
      const similarPairOpportunity = analysis.opportunities.find(
        opp => opp.type === 'similar_pairs'
      )

      expect(similarPairOpportunity).toBeDefined()
      expect(similarPairOpportunity!.positions).toHaveLength(2) // Two USDC/USDT positions
      expect(similarPairOpportunity!.analysis.benefits.length).toBeGreaterThan(0)

      const gasSavingsBenefit = similarPairOpportunity!.analysis.benefits.find(
        benefit => benefit.category === 'gas_savings'
      )
      expect(gasSavingsBenefit).toBeDefined()
      expect(gasSavingsBenefit!.annualValue).toBeGreaterThan(0)
    })

    it('should identify low efficiency consolidation opportunities', async () => {
      const analysis = await consolidationEngine.analyzeConsolidationOpportunities(mockPositions, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: false,
        includeExecutionPlan: false,
        includeMonitoringPlan: false,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      // Should identify small positions for consolidation
      const lowEfficiencyOpportunities = analysis.opportunities.filter(
        opp => opp.type === 'low_efficiency'
      )

      expect(lowEfficiencyOpportunities.length).toBeGreaterThan(0)

      lowEfficiencyOpportunities.forEach(opp => {
        // Should involve small positions
        const smallPositions = opp.positions.filter(posId => {
          const position = mockPositions.find(p => p.publicKey.toString() === posId.toString())
          return position && position.currentValue < 1000
        })
        expect(smallPositions.length).toBeGreaterThan(0)
      })
    })

    it('should calculate accurate cost-benefit analysis', async () => {
      const analysis = await consolidationEngine.analyzeConsolidationOpportunities(mockPositions, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: false,
        includeExecutionPlan: false,
        includeMonitoringPlan: false,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      analysis.opportunities.forEach(opportunity => {
        expect(opportunity.analysis.summary).toMatchObject({
          netPresentValue: expect.any(Number),
          returnOnInvestment: expect.any(Number),
          paybackPeriod: expect.any(Number),
          breakEvenPoint: expect.any(Number),
          riskAdjustedReturn: expect.any(Number)
        })

        // Benefits should have positive values
        opportunity.analysis.benefits.forEach(benefit => {
          expect(benefit.annualValue).toBeGreaterThan(0)
          expect(benefit.presentValue).toBeGreaterThan(0)
        })

        // Costs should have positive values
        opportunity.analysis.costs.forEach(cost => {
          expect(cost.immediateValue).toBeGreaterThan(0)
        })

        // NPV calculation verification
        const totalBenefits = opportunity.analysis.benefits.reduce(
          (sum, benefit) => sum + benefit.presentValue, 0
        )
        const totalCosts = opportunity.analysis.costs.reduce(
          (sum, cost) => sum + cost.immediateValue, 0
        )
        const expectedNPV = totalBenefits - totalCosts

        expect(opportunity.analysis.summary.netPresentValue).toBeCloseTo(expectedNPV, 2)
      })
    })

    it('should generate execution plans when requested', async () => {
      const analysis = await consolidationEngine.analyzeConsolidationOpportunities(mockPositions, {
        includeCostBenefitAnalysis: false,
        includeRiskAssessment: false,
        includeExecutionPlan: true,
        includeMonitoringPlan: false,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      expect(analysis.executionPlan).toBeDefined()
      expect(analysis.executionPlan.phases).toHaveLength(analysis.executionPlan.totalPhases)

      analysis.executionPlan.phases.forEach((phase, index) => {
        expect(phase).toMatchObject({
          phase: index + 1,
          description: expect.any(String),
          opportunities: expect.any(Array),
          estimatedDuration: expect.any(Number),
          dependencies: expect.any(Array),
          risks: expect.any(Array),
          successCriteria: expect.any(Array)
        })

        expect(phase.estimatedDuration).toBeGreaterThan(0)
      })

      // Total duration should be sum of phase durations
      const totalPhaseDuration = analysis.executionPlan.phases.reduce(
        (sum, phase) => sum + phase.estimatedDuration, 0
      )
      expect(analysis.executionPlan.estimatedDuration).toBeCloseTo(totalPhaseDuration, 1)
    })

    it('should perform risk assessment when requested', async () => {
      const analysis = await consolidationEngine.analyzeConsolidationOpportunities(mockPositions, {
        includeCostBenefitAnalysis: false,
        includeRiskAssessment: true,
        includeExecutionPlan: false,
        includeMonitoringPlan: false,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      expect(analysis.riskAssessment).toBeDefined()
      expect(analysis.riskAssessment.overallRisk).toMatch(/^(low|medium|high)$/)

      analysis.riskAssessment.riskFactors.forEach(factor => {
        expect(factor).toMatchObject({
          category: expect.any(String),
          description: expect.any(String),
          probability: expect.any(Number),
          impact: expect.any(Number),
          severity: expect.stringMatching(/^(low|medium|high|critical)$/),
          mitigation: expect.any(String)
        })

        expect(factor.probability).toBeGreaterThanOrEqual(0)
        expect(factor.probability).toBeLessThanOrEqual(1)
        expect(factor.impact).toBeGreaterThanOrEqual(0)
        expect(factor.impact).toBeLessThanOrEqual(1)
      })

      expect(analysis.riskAssessment.mitigationStrategies.length).toBeGreaterThan(0)
      expect(analysis.riskAssessment.contingencyPlans.length).toBeGreaterThan(0)
    })

    it('should create monitoring plans when requested', async () => {
      const analysis = await consolidationEngine.analyzeConsolidationOpportunities(mockPositions, {
        includeCostBenefitAnalysis: false,
        includeRiskAssessment: false,
        includeExecutionPlan: false,
        includeMonitoringPlan: true,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      expect(analysis.monitoringPlan).toBeDefined()

      analysis.monitoringPlan.keyMetrics.forEach(metric => {
        expect(metric).toMatchObject({
          name: expect.any(String),
          description: expect.any(String),
          target: expect.any(Number),
          threshold: expect.any(Number),
          frequency: expect.any(String),
          alertCondition: expect.any(String)
        })
      })

      analysis.monitoringPlan.alertThresholds.forEach(threshold => {
        expect(threshold).toMatchObject({
          metric: expect.any(String),
          condition: expect.any(String),
          value: expect.any(Number),
          severity: expect.stringMatching(/^(info|warning|critical)$/),
          action: expect.any(String)
        })
      })

      expect(analysis.monitoringPlan.monitoringFrequency).toMatch(/^(realtime|hourly|daily|weekly)$/)
    })

    it('should handle different optimization objectives', async () => {
      const efficiencyAnalysis = await consolidationEngine.analyzeConsolidationOpportunities(mockPositions, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: false,
        includeExecutionPlan: false,
        includeMonitoringPlan: false,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      const costReductionAnalysis = await consolidationEngine.analyzeConsolidationOpportunities(mockPositions, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: false,
        includeExecutionPlan: false,
        includeMonitoringPlan: false,
        optimizationObjective: 'cost_reduction',
        timeframe: '30d'
      })

      const riskReductionAnalysis = await consolidationEngine.analyzeConsolidationOpportunities(mockPositions, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: false,
        includeExecutionPlan: false,
        includeMonitoringPlan: false,
        optimizationObjective: 'risk_reduction',
        timeframe: '30d'
      })

      // Different objectives should produce different recommendations
      expect(efficiencyAnalysis.opportunities.length).toBeGreaterThan(0)
      expect(costReductionAnalysis.opportunities.length).toBeGreaterThan(0)
      expect(riskReductionAnalysis.opportunities.length).toBeGreaterThan(0)

      // Efficiency should prioritize low efficiency positions
      const efficiencyLowEffOpp = efficiencyAnalysis.opportunities.find(
        opp => opp.type === 'low_efficiency'
      )
      expect(efficiencyLowEffOpp).toBeDefined()

      // Cost reduction should prioritize gas savings
      const costReductionOpps = costReductionAnalysis.opportunities.filter(opp => {
        return opp.analysis.benefits.some(benefit => benefit.category === 'gas_savings')
      })
      expect(costReductionOpps.length).toBeGreaterThan(0)
    })

    it('should handle no consolidation opportunities scenario', async () => {
      const wellOptimizedPositions = [mockPositions[4]] // Only one large, efficient position

      const analysis = await consolidationEngine.analyzeConsolidationOpportunities(wellOptimizedPositions, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: true,
        includeExecutionPlan: true,
        includeMonitoringPlan: true,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      expect(analysis.summary.totalOpportunities).toBe(0)
      expect(analysis.opportunities).toHaveLength(0)
      expect(analysis.summary.recommendedActions).toBe(0)
    })

    it('should handle empty positions array', async () => {
      await expect(
        consolidationEngine.analyzeConsolidationOpportunities([], {
          includeCostBenefitAnalysis: true,
          includeRiskAssessment: true,
          includeExecutionPlan: true,
          includeMonitoringPlan: true,
          optimizationObjective: 'efficiency',
          timeframe: '30d'
        })
      ).rejects.toThrow('No positions provided for consolidation analysis')
    })
  })

  describe('consolidation opportunity identification', () => {
    it('should identify similar pair opportunities correctly', () => {
      const similarPairs = (consolidationEngine as any).identifySimilarPairOpportunities(mockPositions)

      expect(similarPairs).toHaveLength(1) // USDC/USDT pair
      expect(similarPairs[0].positions).toHaveLength(2)

      const pairSymbols = similarPairs[0].positions.map(posId => {
        const position = mockPositions.find(p => p.publicKey.toString() === posId.toString())
        return `${position!.tokenX.symbol}/${position!.tokenY.symbol}`
      })

      expect(pairSymbols).toEqual(['USDC/USDT', 'USDC/USDT'])
    })

    it('should identify low efficiency opportunities correctly', () => {
      const lowEfficiencyOpps = (consolidationEngine as any).identifyLowEfficiencyOpportunities(mockPositions)

      expect(lowEfficiencyOpps.length).toBeGreaterThan(0)

      lowEfficiencyOpps.forEach(opp => {
        const position = mockPositions.find(p => p.publicKey.toString() === opp.positions[0].toString())
        expect(position!.currentValue).toBeLessThan(1000) // Small positions
      })
    })

    it('should identify high cost opportunities correctly', () => {
      const highCostOpps = (consolidationEngine as any).identifyHighCostOpportunities(mockPositions)

      // Should identify positions with high fee-to-value ratios
      highCostOpps.forEach(opp => {
        const position = mockPositions.find(p => p.publicKey.toString() === opp.positions[0].toString())
        const feeRatio = (position!.feeEarnings || 0) / position!.currentValue
        expect(feeRatio).toBeLessThan(0.1) // Low fee efficiency indicates high relative costs
      })
    })

    it('should identify overlapping range opportunities', () => {
      const overlappingRangeOpps = (consolidationEngine as any).identifyOverlappingRangeOpportunities(mockPositions)

      // Should identify positions with overlapping price ranges in same pairs
      overlappingRangeOpps.forEach(opp => {
        expect(opp.positions.length).toBeGreaterThanOrEqual(2)
        expect(opp.type).toBe('overlapping_ranges')
      })
    })
  })

  describe('cost-benefit calculations', () => {
    it('should calculate consolidation benefits accurately', () => {
      const positions = [mockPositions[0], mockPositions[1]] // Two similar positions
      const benefits = (consolidationEngine as any).calculateConsolidationBenefits(positions, 'efficiency')

      const gasSavings = benefits.find(b => b.category === 'gas_savings')
      const efficiencyGains = benefits.find(b => b.category === 'efficiency_gains')
      const liquidityBenefits = benefits.find(b => b.category === 'liquidity_benefits')

      expect(gasSavings).toBeDefined()
      expect(efficiencyGains).toBeDefined()
      expect(liquidityBenefits).toBeDefined()

      benefits.forEach(benefit => {
        expect(benefit.annualValue).toBeGreaterThan(0)
        expect(benefit.presentValue).toBeGreaterThan(0)
        expect(benefit.confidence).toBeGreaterThan(0)
        expect(benefit.confidence).toBeLessThanOrEqual(1)
      })
    })

    it('should calculate consolidation costs accurately', () => {
      const positions = [mockPositions[0], mockPositions[1]]
      const costs = (consolidationEngine as any).calculateConsolidationCosts(positions)

      const transactionCosts = costs.find(c => c.category === 'transaction_costs')
      const slippageCosts = costs.find(c => c.category === 'slippage_costs')
      const opportunityCosts = costs.find(c => c.category === 'opportunity_costs')

      expect(transactionCosts).toBeDefined()
      expect(slippageCosts).toBeDefined()
      expect(opportunityCosts).toBeDefined()

      costs.forEach(cost => {
        expect(cost.immediateValue).toBeGreaterThan(0)
        expect(cost.confidence).toBeGreaterThan(0)
        expect(cost.confidence).toBeLessThanOrEqual(1)
      })
    })

    it('should calculate NPV correctly', () => {
      const benefits = [
        { category: 'gas_savings', annualValue: 1000, presentValue: 3000, timeframe: '3 years' },
        { category: 'efficiency_gains', annualValue: 500, presentValue: 1500, timeframe: '3 years' }
      ]
      const costs = [
        { category: 'transaction_costs', immediateValue: 200, timing: 'immediate' },
        { category: 'slippage_costs', immediateValue: 100, timing: 'immediate' }
      ]

      const npv = (consolidationEngine as any).calculateNPV(benefits, costs, 0.1) // 10% discount rate

      const totalBenefitsPV = benefits.reduce((sum, b) => sum + b.presentValue, 0)
      const totalCosts = costs.reduce((sum, c) => sum + c.immediateValue, 0)
      const expectedNPV = totalBenefitsPV - totalCosts

      expect(npv).toBeCloseTo(expectedNPV, 2)
    })

    it('should calculate ROI correctly', () => {
      const benefits = 5000 // Total benefits
      const costs = 1000 // Total costs
      const expectedROI = ((benefits - costs) / costs) * 100

      const roi = (consolidationEngine as any).calculateROI(benefits, costs)

      expect(roi).toBeCloseTo(expectedROI, 2)
    })

    it('should calculate payback period correctly', () => {
      const annualBenefits = 1200 // $1200 per year
      const initialCosts = 3000 // $3000 upfront
      const expectedPayback = initialCosts / annualBenefits // 2.5 years

      const payback = (consolidationEngine as any).calculatePaybackPeriod(annualBenefits, initialCosts)

      expect(payback).toBeCloseTo(expectedPayback, 2)
    })
  })

  describe('execution planning', () => {
    it('should create realistic execution phases', () => {
      const opportunities = [
        {
          id: 'opp1',
          type: 'similar_pairs' as const,
          positions: [mockPositions[0].publicKey, mockPositions[1].publicKey],
          priority: 'high' as const,
          complexity: 'medium' as const
        },
        {
          id: 'opp2',
          type: 'low_efficiency' as const,
          positions: [mockPositions[2].publicKey],
          priority: 'medium' as const,
          complexity: 'low' as const
        }
      ]

      const phases = (consolidationEngine as any).createExecutionPhases(opportunities)

      expect(phases.length).toBeGreaterThan(0)

      phases.forEach((phase, index) => {
        expect(phase.phase).toBe(index + 1)
        expect(phase.opportunities.length).toBeGreaterThan(0)
        expect(phase.estimatedDuration).toBeGreaterThan(0)
        expect(Array.isArray(phase.dependencies)).toBe(true)
        expect(Array.isArray(phase.risks)).toBe(true)
        expect(Array.isArray(phase.successCriteria)).toBe(true)
      })

      // High priority opportunities should be in earlier phases
      const highPriorityPhase = phases.find(p =>
        p.opportunities.some(oppId => oppId === 'opp1')
      )
      const mediumPriorityPhase = phases.find(p =>
        p.opportunities.some(oppId => oppId === 'opp2')
      )

      if (highPriorityPhase && mediumPriorityPhase) {
        expect(highPriorityPhase.phase).toBeLessThanOrEqual(mediumPriorityPhase.phase)
      }
    })

    it('should identify execution dependencies', () => {
      const opportunities = [
        {
          id: 'opp1',
          type: 'similar_pairs' as const,
          positions: [mockPositions[0].publicKey, mockPositions[1].publicKey]
        },
        {
          id: 'opp2',
          type: 'low_efficiency' as const,
          positions: [mockPositions[2].publicKey]
        }
      ]

      const dependencies = (consolidationEngine as any).identifyExecutionDependencies(opportunities)

      expect(Array.isArray(dependencies)).toBe(true)

      dependencies.forEach(dep => {
        expect(dep).toMatchObject({
          prerequisite: expect.any(String),
          dependent: expect.any(String),
          type: expect.stringMatching(/^(blocking|preference|resource)$/),
          description: expect.any(String)
        })
      })
    })

    it('should assess execution risks', () => {
      const opportunities = [
        {
          id: 'opp1',
          type: 'similar_pairs' as const,
          positions: [mockPositions[0].publicKey, mockPositions[1].publicKey],
          analysis: {
            summary: { netPresentValue: 5000 },
            currentPositions: [mockPositions[0], mockPositions[1]]
          }
        }
      ]

      const risks = (consolidationEngine as any).assessExecutionRisks(opportunities)

      expect(Array.isArray(risks)).toBe(true)

      risks.forEach(risk => {
        expect(risk).toMatchObject({
          category: expect.any(String),
          description: expect.any(String),
          probability: expect.any(Number),
          impact: expect.any(Number),
          severity: expect.stringMatching(/^(low|medium|high|critical)$/),
          mitigation: expect.any(String)
        })

        expect(risk.probability).toBeGreaterThanOrEqual(0)
        expect(risk.probability).toBeLessThanOrEqual(1)
        expect(risk.impact).toBeGreaterThanOrEqual(0)
        expect(risk.impact).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('monitoring and alerts', () => {
    it('should define appropriate monitoring metrics', () => {
      const opportunities = [
        {
          id: 'opp1',
          type: 'similar_pairs' as const,
          analysis: {
            metrics: {
              currentTotalFees: 600,
              projectedTotalFees: 400,
              currentEfficiency: 0.6,
              projectedEfficiency: 0.8
            }
          }
        }
      ]

      const metrics = (consolidationEngine as any).defineMonitoringMetrics(opportunities)

      expect(metrics.length).toBeGreaterThan(0)

      metrics.forEach(metric => {
        expect(metric).toMatchObject({
          name: expect.any(String),
          description: expect.any(String),
          target: expect.any(Number),
          threshold: expect.any(Number),
          frequency: expect.stringMatching(/^(realtime|hourly|daily|weekly)$/),
          alertCondition: expect.any(String)
        })

        expect(metric.target).toBeGreaterThan(0)
        expect(metric.threshold).toBeGreaterThan(0)
      })
    })

    it('should set appropriate alert thresholds', () => {
      const metrics = [
        { name: 'portfolio_efficiency', target: 0.8, threshold: 0.7 },
        { name: 'total_fees', target: 400, threshold: 500 },
        { name: 'consolidation_progress', target: 100, threshold: 80 }
      ]

      const thresholds = (consolidationEngine as any).setAlertThresholds(metrics)

      expect(thresholds.length).toBeGreaterThan(0)

      thresholds.forEach(threshold => {
        expect(threshold).toMatchObject({
          metric: expect.any(String),
          condition: expect.stringMatching(/^(above|below|equals)$/),
          value: expect.any(Number),
          severity: expect.stringMatching(/^(info|warning|critical)$/),
          action: expect.any(String)
        })
      })
    })

    it('should create monitoring schedules', () => {
      const metrics = ['portfolio_efficiency', 'total_fees', 'gas_costs']
      const schedule = (consolidationEngine as any).createMonitoringSchedule(metrics)

      expect(Array.isArray(schedule)).toBe(true)

      schedule.forEach(item => {
        expect(item).toMatchObject({
          metric: expect.any(String),
          frequency: expect.stringMatching(/^(realtime|hourly|daily|weekly|monthly)$/),
          timeOfDay: expect.any(String),
          recipients: expect.any(Array),
          format: expect.stringMatching(/^(dashboard|email|webhook)$/)
        })
      })
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle positions with zero values', async () => {
      const zeroValuePositions = [
        { ...mockPositions[0], currentValue: 0 },
        { ...mockPositions[1], currentValue: 5000 }
      ]

      const analysis = await consolidationEngine.analyzeConsolidationOpportunities(zeroValuePositions, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: false,
        includeExecutionPlan: false,
        includeMonitoringPlan: false,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      expect(analysis.summary.totalOpportunities).toBeGreaterThanOrEqual(0)
      expect(Number.isFinite(analysis.summary.netBenefit)).toBe(true)
    })

    it('should handle positions with missing data', async () => {
      const incompletePositions = [
        { ...mockPositions[0], feeEarnings: undefined, pnl: undefined },
        { ...mockPositions[1], currentValue: undefined, initialValue: undefined }
      ]

      const analysis = await consolidationEngine.analyzeConsolidationOpportunities(incompletePositions, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: false,
        includeExecutionPlan: false,
        includeMonitoringPlan: false,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      expect(analysis.summary).toBeDefined()
      expect(Number.isFinite(analysis.summary.potentialSavings)).toBe(true)
    })

    it('should handle invalid optimization objectives', async () => {
      await expect(
        consolidationEngine.analyzeConsolidationOpportunities(mockPositions, {
          includeCostBenefitAnalysis: true,
          includeRiskAssessment: false,
          includeExecutionPlan: false,
          includeMonitoringPlan: false,
          optimizationObjective: 'invalid' as any,
          timeframe: '30d'
        })
      ).rejects.toThrow('Invalid optimization objective')
    })

    it('should handle invalid timeframes', async () => {
      await expect(
        consolidationEngine.analyzeConsolidationOpportunities(mockPositions, {
          includeCostBenefitAnalysis: true,
          includeRiskAssessment: false,
          includeExecutionPlan: false,
          includeMonitoringPlan: false,
          optimizationObjective: 'efficiency',
          timeframe: 'invalid' as any
        })
      ).rejects.toThrow('Invalid timeframe')
    })

    it('should handle single position portfolios', async () => {
      const singlePosition = [mockPositions[0]]

      const analysis = await consolidationEngine.analyzeConsolidationOpportunities(singlePosition, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: false,
        includeExecutionPlan: false,
        includeMonitoringPlan: false,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      expect(analysis.summary.totalOpportunities).toBe(0)
      expect(analysis.opportunities).toHaveLength(0)
    })

    it('should handle extreme position values', async () => {
      const extremePositions = [
        { ...mockPositions[0], currentValue: 0.01 },
        { ...mockPositions[1], currentValue: 1000000000 }
      ]

      const analysis = await consolidationEngine.analyzeConsolidationOpportunities(extremePositions, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: false,
        includeExecutionPlan: false,
        includeMonitoringPlan: false,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      expect(Number.isFinite(analysis.summary.netBenefit)).toBe(true)
      expect(analysis.summary.potentialSavings).toBeGreaterThanOrEqual(0)
    })
  })

  describe('performance and caching', () => {
    it('should cache analysis results', async () => {
      const startTime = Date.now()

      const analysis1 = await consolidationEngine.analyzeConsolidationOpportunities(mockPositions, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: true,
        includeExecutionPlan: true,
        includeMonitoringPlan: true,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      const firstCallTime = Date.now() - startTime

      const startTime2 = Date.now()

      const analysis2 = await consolidationEngine.analyzeConsolidationOpportunities(mockPositions, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: true,
        includeExecutionPlan: true,
        includeMonitoringPlan: true,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      const secondCallTime = Date.now() - startTime2

      expect(analysis1.summary.totalOpportunities).toBe(analysis2.summary.totalOpportunities)
      expect(secondCallTime).toBeLessThan(firstCallTime) // Should be faster due to caching
    })

    it('should handle large portfolios efficiently', async () => {
      const largePortfolio = Array(100).fill(null).map((_, i) => ({
        ...mockPositions[i % mockPositions.length],
        publicKey: new PublicKey(`Position${i.toString().padStart(44, '0')}`),
        currentValue: Math.random() * 10000 + 100,
        pnl: (Math.random() - 0.5) * 2000
      }))

      const startTime = Date.now()

      const analysis = await consolidationEngine.analyzeConsolidationOpportunities(largePortfolio, {
        includeCostBenefitAnalysis: true,
        includeRiskAssessment: true,
        includeExecutionPlan: true,
        includeMonitoringPlan: true,
        optimizationObjective: 'efficiency',
        timeframe: '30d'
      })

      const executionTime = Date.now() - startTime

      expect(analysis.summary.totalOpportunities).toBeGreaterThanOrEqual(0)
      expect(executionTime).toBeLessThan(15000) // Should complete within 15 seconds
    })
  })

  describe('mathematical accuracy', () => {
    it('should maintain precision in financial calculations', () => {
      const benefits = [
        { annualValue: 1234.5678, presentValue: 3703.7034 },
        { annualValue: 987.6543, presentValue: 2962.9629 }
      ]
      const costs = [
        { immediateValue: 456.789 },
        { immediateValue: 123.456 }
      ]

      const totalBenefits = benefits.reduce((sum, b) => sum + b.presentValue, 0)
      const totalCosts = costs.reduce((sum, c) => sum + c.immediateValue, 0)
      const expectedNPV = totalBenefits - totalCosts

      const npv = (consolidationEngine as any).calculateNPV(benefits, costs, 0.1)

      expect(npv).toBeCloseTo(expectedNPV, 6) // High precision
    })

    it('should handle floating point edge cases', () => {
      const verySmallBenefits = 0.000001
      const veryLargeCosts = 1e10

      const roi = (consolidationEngine as any).calculateROI(verySmallBenefits, veryLargeCosts)

      expect(Number.isFinite(roi)).toBe(true)
      expect(roi).toBeLessThan(0) // Should be negative
    })

    it('should handle division by zero gracefully', () => {
      const payback = (consolidationEngine as any).calculatePaybackPeriod(0, 1000)

      expect(payback).toBe(Infinity) // No benefits = infinite payback
    })
  })
})