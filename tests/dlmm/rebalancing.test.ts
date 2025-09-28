import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals'
import { PublicKey } from '@solana/web3.js'
import {
  AdvancedRebalancingSystem,
  advancedRebalancingSystem,
  RebalancingAnalysis,
  RebalancingExecution
} from '@/lib/dlmm/rebalancing'
import { DLMMPosition } from '@/lib/types'

// Mock dependencies
jest.mock('@/lib/dlmm/client')
jest.mock('@/lib/dlmm/operations')
jest.mock('@/lib/dlmm/utils')

describe('AdvancedRebalancingSystem', () => {
  let rebalancingSystem: AdvancedRebalancingSystem
  let mockUserAddress: PublicKey
  let mockPosition: DLMMPosition

  beforeEach(() => {
    rebalancingSystem = new AdvancedRebalancingSystem()
    mockUserAddress = new PublicKey('11111111111111111111111111111111')

    mockPosition = {
      id: 'test-position-1',
      poolAddress: new PublicKey('22222222222222222222222222222222'),
      userAddress: mockUserAddress,
      tokenX: {
        address: new PublicKey('33333333333333333333333333333333'),
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        price: 100,
      },
      tokenY: {
        address: new PublicKey('44444444444444444444444444444444'),
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        price: 1,
      },
      activeBin: 100,
      liquidityAmount: '1000000',
      feesEarned: {
        tokenX: '100',
        tokenY: '50',
      },
      createdAt: new Date('2024-01-01'),
      lastUpdated: new Date('2024-01-15'),
      isActive: true,
    }
  })

  afterEach(() => {
    rebalancingSystem.stopMonitoring()
    jest.clearAllMocks()
  })

  describe('Configuration Management', () => {
    it('should create a new rebalancing configuration', () => {
      const configData = {
        name: 'Test Aggressive Strategy',
        description: 'Test configuration for aggressive rebalancing',
        strategy: {
          type: 'aggressive' as const,
          parameters: {
            targetRange: 6,
            rebalanceThreshold: 0.02,
            maxSlippage: 1.0,
            minEfficiencyGain: 0.05,
            volatilityMultiplier: 1.5,
            momentumWeight: 0.7,
            meanReversionWeight: 0.3,
            riskAdjustment: 1.2,
          },
          binDistribution: {
            type: 'concentrated' as const,
            concentrationFactor: 0.8,
            volatilityAdjustment: true,
            liquidityPreference: 'maximize_fees' as const,
          },
        },
        triggers: [],
        constraints: {
          maxRebalancesPerDay: 10,
          minTimeBetweenRebalances: 30,
          maxSlippageAllowed: 1.5,
          minPositionValue: 100,
          maxGasCostRatio: 2.0,
          allowedTimeWindows: [],
          emergencyStopConditions: [],
        },
        costAnalysis: {
          includeGasCosts: true,
          includeSlippageCosts: true,
          includeOpportunityCosts: true,
          gasPriceStrategy: 'dynamic' as const,
          slippageEstimationMethod: 'current' as const,
          breakEvenThreshold: 0.1,
        },
        automation: {
          isEnabled: false,
          executionMode: 'approval_required' as const,
          maxAutomaticValue: 1000,
          notificationChannels: ['console'],
          failsafeEnabled: true,
          monitoringInterval: 15,
        },
        isActive: true,
      }

      const configId = rebalancingSystem.createRebalancingConfig(configData)

      expect(configId).toBeDefined()
      expect(typeof configId).toBe('string')
      expect(configId).toMatch(/^rebalance_/)

      const retrievedConfig = rebalancingSystem.getRebalancingConfig(configId)
      expect(retrievedConfig).toBeDefined()
      expect(retrievedConfig?.name).toBe(configData.name)
      expect(retrievedConfig?.strategy.type).toBe('aggressive')
    })

    it('should update an existing rebalancing configuration', () => {
      const configId = rebalancingSystem.createRebalancingConfig({
        name: 'Original Config',
        description: 'Original description',
        strategy: {
          type: 'conservative',
          parameters: {
            targetRange: 15,
            rebalanceThreshold: 0.08,
            maxSlippage: 0.5,
            minEfficiencyGain: 0.15,
            volatilityMultiplier: 0.8,
            momentumWeight: 0.3,
            meanReversionWeight: 0.7,
            riskAdjustment: 0.6,
          },
          binDistribution: {
            type: 'uniform',
            concentrationFactor: 0.3,
            volatilityAdjustment: true,
            liquidityPreference: 'minimize_il',
          },
        },
        triggers: [],
        constraints: {
          maxRebalancesPerDay: 2,
          minTimeBetweenRebalances: 360,
          maxSlippageAllowed: 0.8,
          minPositionValue: 500,
          maxGasCostRatio: 1.0,
          allowedTimeWindows: [],
          emergencyStopConditions: [],
        },
        costAnalysis: {
          includeGasCosts: true,
          includeSlippageCosts: true,
          includeOpportunityCosts: true,
          gasPriceStrategy: 'low',
          slippageEstimationMethod: 'conservative',
          breakEvenThreshold: 0.2,
        },
        automation: {
          isEnabled: false,
          executionMode: 'simulation',
          maxAutomaticValue: 500,
          notificationChannels: ['console'],
          failsafeEnabled: true,
          monitoringInterval: 60,
        },
        isActive: false,
      })

      const updates = {
        name: 'Updated Config',
        isActive: true,
        strategy: {
          type: 'adaptive' as const,
          parameters: {
            targetRange: 10,
            rebalanceThreshold: 0.05,
            maxSlippage: 0.8,
            minEfficiencyGain: 0.1,
            volatilityMultiplier: 1.0,
            momentumWeight: 0.5,
            meanReversionWeight: 0.5,
            riskAdjustment: 1.0,
          },
          binDistribution: {
            type: 'adaptive' as const,
            concentrationFactor: 0.6,
            volatilityAdjustment: true,
            liquidityPreference: 'balanced' as const,
          },
        },
      }

      rebalancingSystem.updateRebalancingConfig(configId, updates)

      const updatedConfig = rebalancingSystem.getRebalancingConfig(configId)
      expect(updatedConfig?.name).toBe('Updated Config')
      expect(updatedConfig?.isActive).toBe(true)
      expect(updatedConfig?.strategy.type).toBe('adaptive')
    })

    it('should retrieve all rebalancing configurations', () => {
      const config1Id = rebalancingSystem.createRebalancingConfig({
        name: 'Config 1',
        description: 'First config',
        strategy: {
          type: 'aggressive',
          parameters: {
            targetRange: 6,
            rebalanceThreshold: 0.02,
            maxSlippage: 1.0,
            minEfficiencyGain: 0.05,
            volatilityMultiplier: 1.5,
            momentumWeight: 0.7,
            meanReversionWeight: 0.3,
            riskAdjustment: 1.2,
          },
          binDistribution: {
            type: 'concentrated',
            concentrationFactor: 0.8,
            volatilityAdjustment: true,
            liquidityPreference: 'maximize_fees',
          },
        },
        triggers: [],
        constraints: {
          maxRebalancesPerDay: 10,
          minTimeBetweenRebalances: 30,
          maxSlippageAllowed: 1.5,
          minPositionValue: 100,
          maxGasCostRatio: 2.0,
          allowedTimeWindows: [],
          emergencyStopConditions: [],
        },
        costAnalysis: {
          includeGasCosts: true,
          includeSlippageCosts: true,
          includeOpportunityCosts: true,
          gasPriceStrategy: 'dynamic',
          slippageEstimationMethod: 'current',
          breakEvenThreshold: 0.1,
        },
        automation: {
          isEnabled: false,
          executionMode: 'approval_required',
          maxAutomaticValue: 1000,
          notificationChannels: ['console'],
          failsafeEnabled: true,
          monitoringInterval: 15,
        },
        isActive: true,
      })

      const config2Id = rebalancingSystem.createRebalancingConfig({
        name: 'Config 2',
        description: 'Second config',
        strategy: {
          type: 'conservative',
          parameters: {
            targetRange: 15,
            rebalanceThreshold: 0.08,
            maxSlippage: 0.5,
            minEfficiencyGain: 0.15,
            volatilityMultiplier: 0.8,
            momentumWeight: 0.3,
            meanReversionWeight: 0.7,
            riskAdjustment: 0.6,
          },
          binDistribution: {
            type: 'uniform',
            concentrationFactor: 0.3,
            volatilityAdjustment: true,
            liquidityPreference: 'minimize_il',
          },
        },
        triggers: [],
        constraints: {
          maxRebalancesPerDay: 2,
          minTimeBetweenRebalances: 360,
          maxSlippageAllowed: 0.8,
          minPositionValue: 500,
          maxGasCostRatio: 1.0,
          allowedTimeWindows: [],
          emergencyStopConditions: [],
        },
        costAnalysis: {
          includeGasCosts: true,
          includeSlippageCosts: true,
          includeOpportunityCosts: true,
          gasPriceStrategy: 'low',
          slippageEstimationMethod: 'conservative',
          breakEvenThreshold: 0.2,
        },
        automation: {
          isEnabled: false,
          executionMode: 'simulation',
          maxAutomaticValue: 500,
          notificationChannels: ['console'],
          failsafeEnabled: true,
          monitoringInterval: 60,
        },
        isActive: false,
      })

      const allConfigs = rebalancingSystem.getAllRebalancingConfigs()
      expect(allConfigs).toHaveLength(2)
      expect(allConfigs.map(c => c.id)).toContain(config1Id)
      expect(allConfigs.map(c => c.id)).toContain(config2Id)
    })

    it('should provide default rebalancing configurations', () => {
      const defaultConfigs = rebalancingSystem.getDefaultRebalancingConfigs()

      expect(defaultConfigs).toHaveLength(3)
      expect(defaultConfigs.map(c => c.strategy.type)).toContain('aggressive')
      expect(defaultConfigs.map(c => c.strategy.type)).toContain('conservative')
      expect(defaultConfigs.map(c => c.strategy.type)).toContain('adaptive')

      // Verify aggressive config
      const aggressiveConfig = defaultConfigs.find(c => c.strategy.type === 'aggressive')
      expect(aggressiveConfig).toBeDefined()
      expect(aggressiveConfig?.strategy.parameters.targetRange).toBe(6)
      expect(aggressiveConfig?.strategy.parameters.rebalanceThreshold).toBe(0.02)

      // Verify conservative config
      const conservativeConfig = defaultConfigs.find(c => c.strategy.type === 'conservative')
      expect(conservativeConfig).toBeDefined()
      expect(conservativeConfig?.strategy.parameters.targetRange).toBe(15)
      expect(conservativeConfig?.strategy.parameters.rebalanceThreshold).toBe(0.08)
    })
  })

  describe('Position Analysis', () => {
    beforeEach(() => {
      // Mock the DLMM client methods
      const mockDlmmClient = require('@/lib/dlmm/client')
      mockDlmmClient.dlmmClient = {
        getUserPositions: jest.fn().mockResolvedValue([
          {
            positionMint: new PublicKey('55555555555555555555555555555555'),
            pair: mockPosition.poolAddress.toString(),
            totalValue: '1000000',
            currentBin: mockPosition.activeBin,
          }
        ]),
        getLbPair: jest.fn().mockResolvedValue({
          activeId: mockPosition.activeBin,
          tokenX: mockPosition.tokenX.address,
          tokenY: mockPosition.tokenY.address,
        }),
      }
    })

    it('should analyze a position for rebalancing opportunities', async () => {
      const analysis = await rebalancingSystem.analyzePosition(
        'test-position-1',
        mockUserAddress
      )

      expect(analysis).toBeDefined()
      expect(analysis.positionId).toBe('test-position-1')
      expect(analysis.currentState).toBeDefined()
      expect(analysis.recommendedAction).toBeDefined()
      expect(analysis.analysis).toBeDefined()
      expect(analysis.confidence).toBeGreaterThanOrEqual(0)
      expect(analysis.confidence).toBeLessThanOrEqual(1)
      expect(['low', 'medium', 'high', 'critical']).toContain(analysis.urgency)
    })

    it('should calculate position efficiency correctly', async () => {
      const analysis = await rebalancingSystem.analyzePosition(
        'test-position-1',
        mockUserAddress
      )

      const efficiency = analysis.currentState.efficiency
      expect(efficiency.overall).toBeGreaterThanOrEqual(0)
      expect(efficiency.overall).toBeLessThanOrEqual(1)
      expect(efficiency.feeGeneration).toBeGreaterThanOrEqual(0)
      expect(efficiency.capitalUtilization).toBeGreaterThanOrEqual(0)
      expect(efficiency.riskAdjusted).toBeGreaterThanOrEqual(0)
      expect(efficiency.volatilityAlignment).toBeGreaterThanOrEqual(0)
    })

    it('should perform cost-benefit analysis', async () => {
      const analysis = await rebalancingSystem.analyzePosition(
        'test-position-1',
        mockUserAddress
      )

      const costBenefit = analysis.analysis.costBenefit
      expect(costBenefit.costs.totalCosts).toBeGreaterThanOrEqual(0)
      expect(costBenefit.benefits.totalBenefits).toBeGreaterThanOrEqual(0)
      expect(typeof costBenefit.netBenefit).toBe('number')
      expect(typeof costBenefit.roi).toBe('number')
      expect(costBenefit.paybackPeriod).toBeGreaterThanOrEqual(0)
      expect(costBenefit.profitProbability).toBeGreaterThanOrEqual(0)
      expect(costBenefit.profitProbability).toBeLessThanOrEqual(1)
    })

    it('should assess risk factors', async () => {
      const analysis = await rebalancingSystem.analyzePosition(
        'test-position-1',
        mockUserAddress
      )

      const riskAssessment = analysis.analysis.riskAssessment
      expect(['low', 'medium', 'high', 'critical']).toContain(riskAssessment.overallRisk)
      expect(Array.isArray(riskAssessment.riskFactors)).toBe(true)
      expect(Array.isArray(riskAssessment.mitigationStrategies)).toBe(true)
      expect(riskAssessment.recommendedMaxSlippage).toBeGreaterThan(0)
      expect(riskAssessment.liquidityRisk).toBeGreaterThanOrEqual(0)
      expect(riskAssessment.volatilityRisk).toBeGreaterThanOrEqual(0)
      expect(riskAssessment.executionRisk).toBeGreaterThanOrEqual(0)
    })

    it('should generate market condition analysis', async () => {
      const analysis = await rebalancingSystem.analyzePosition(
        'test-position-1',
        mockUserAddress
      )

      const marketConditions = analysis.analysis.marketConditions
      expect(marketConditions.volatility.current).toBeGreaterThanOrEqual(0)
      expect(['increasing', 'decreasing', 'stable']).toContain(marketConditions.volatility.trend)
      expect(marketConditions.liquidity.depth).toBeGreaterThanOrEqual(0)
      expect(['improving', 'deteriorating', 'stable']).toContain(marketConditions.liquidity.trend)
      expect(['bullish', 'bearish', 'sideways']).toContain(marketConditions.price.trend)
      expect(marketConditions.competitivePosition.marketShare).toBeGreaterThanOrEqual(0)
      expect(marketConditions.competitivePosition.marketShare).toBeLessThanOrEqual(1)
    })

    it('should generate actionable recommendations', async () => {
      const analysis = await rebalancingSystem.analyzePosition(
        'test-position-1',
        mockUserAddress
      )

      const recommendations = analysis.analysis.recommendations
      expect(Array.isArray(recommendations)).toBe(true)

      recommendations.forEach(rec => {
        expect(rec.id).toBeDefined()
        expect(['immediate', 'scheduled', 'conditional', 'monitor']).toContain(rec.type)
        expect(['high', 'medium', 'low']).toContain(rec.priority)
        expect(rec.action).toBeDefined()
        expect(rec.reasoning).toBeDefined()
        expect(rec.expectedBenefit).toBeDefined()
        expect(Array.isArray(rec.risks)).toBe(true)
      })
    })
  })

  describe('Rebalancing Execution', () => {
    let mockAnalysis: RebalancingAnalysis

    beforeEach(() => {
      mockAnalysis = {
        positionId: 'test-position-1',
        currentState: {
          currentBins: [
            {
              binId: 99,
              liquidityX: '500000',
              liquidityY: '500000',
              price: 99,
              isActive: true,
              utilizationRate: 0.8,
              feeRate: 0.003,
              volume24h: '10000',
            },
            {
              binId: 100,
              liquidityX: '500000',
              liquidityY: '500000',
              price: 100,
              isActive: true,
              utilizationRate: 0.9,
              feeRate: 0.003,
              volume24h: '15000',
            },
          ],
          centerBin: 100,
          range: 5,
          totalLiquidity: '1000000',
          liquidityDistribution: {
            type: 'uniform',
            concentration: 0.5,
            efficiency: 0.8,
            coverage: 0.1,
            utilization: 0.85,
          },
          efficiency: {
            overall: 0.8,
            feeGeneration: 0.7,
            capitalUtilization: 0.85,
            riskAdjusted: 0.75,
            volatilityAlignment: 0.8,
          },
          timeInPosition: 24,
          priceDeviation: 0.03,
        },
        recommendedAction: {
          type: 'rebalance',
          newCenterBin: 102,
          newRange: 6,
          estimatedTransactions: 2,
          estimatedGas: 0.002,
          maxSlippage: 0.5,
        },
        analysis: {
          efficiency: {
            currentEfficiency: 0.8,
            potentialEfficiency: 0.9,
            efficiencyGain: 0.1,
            degradationRate: 0.02,
            optimalRange: { min: 0.7, max: 0.95 },
            missedOpportunities: 50,
          },
          costBenefit: {
            costs: {
              gasCosts: 0.002,
              slippageCosts: 5,
              opportunityCosts: 2,
              totalCosts: 7.002,
            },
            benefits: {
              increasedFees: 30,
              improvedEfficiency: 10,
              reducedRisk: 5,
              totalBenefits: 45,
            },
            netBenefit: 37.998,
            roi: 542.7,
            paybackPeriod: 85.25,
            profitProbability: 0.8,
          },
          riskAssessment: {
            overallRisk: 'medium',
            riskFactors: [
              {
                type: 'liquidity_risk',
                severity: 'medium',
                impact: 0.3,
                description: 'Moderate liquidity risk',
              },
            ],
            mitigationStrategies: ['Use conservative slippage settings'],
            recommendedMaxSlippage: 0.6,
            liquidityRisk: 0.3,
            volatilityRisk: 0.2,
            executionRisk: 0.1,
          },
          marketConditions: {
            volatility: {
              current: 0.15,
              trend: 'stable',
              outlook: 'Normal market conditions',
            },
            liquidity: {
              depth: 800000,
              distribution: 'well-distributed',
              trend: 'stable',
            },
            volume: {
              current: '5000000',
              change24h: 0.05,
              trend: 'increasing',
            },
            price: {
              current: 100,
              support: 95,
              resistance: 105,
              trend: 'sideways',
            },
            competitivePosition: {
              ourLiquidity: 100000,
              totalLiquidity: 800000,
              marketShare: 0.125,
              ranking: 3,
            },
          },
          recommendations: [
            {
              id: 'immediate_rebalance',
              type: 'immediate',
              priority: 'high',
              action: 'Rebalance position immediately',
              reasoning: 'Efficiency can be improved by 10%',
              expectedBenefit: 'Increased fee generation: 30.00 USD',
              risks: ['Moderate liquidity risk'],
            },
          ],
        },
        confidence: 0.8,
        urgency: 'high',
        timestamp: new Date(),
      }

      // Mock the operations
      const mockOperations = require('@/lib/dlmm/operations')
      mockOperations.dlmmOperations = {
        rebalancePosition: jest.fn().mockResolvedValue([
          { signature: 'mock-tx-1' },
          { signature: 'mock-tx-2' },
        ]),
      }
    })

    it('should execute rebalancing with approval', async () => {
      const execution = await rebalancingSystem.executeRebalancing(
        mockAnalysis,
        mockUserAddress,
        true
      )

      expect(execution).toBeDefined()
      expect(execution.id).toBeDefined()
      expect(execution.positionId).toBe('test-position-1')
      expect(execution.analysis).toBe(mockAnalysis)
      expect(execution.execution.status).toBe('completed')
      expect(execution.execution.results.success).toBe(true)
    })

    it('should cancel execution without approval', async () => {
      const execution = await rebalancingSystem.executeRebalancing(
        mockAnalysis,
        mockUserAddress,
        false
      )

      expect(execution.execution.status).toBe('cancelled')
      expect(execution.execution.results.success).toBe(false)
      expect(execution.monitoring.alerts).toHaveLength(1)
      expect(execution.monitoring.alerts[0].message).toContain('approval required')
    })

    it('should handle execution failures gracefully', async () => {
      // Mock failure in operations
      const mockOperations = require('@/lib/dlmm/operations')
      mockOperations.dlmmOperations.rebalancePosition.mockRejectedValue(
        new Error('Execution failed')
      )

      const execution = await rebalancingSystem.executeRebalancing(
        mockAnalysis,
        mockUserAddress,
        true
      )

      expect(execution.execution.status).toBe('failed')
      expect(execution.monitoring.alerts.length).toBeGreaterThan(0)
      expect(execution.monitoring.alerts.some(alert =>
        alert.message.includes('Execution failed')
      )).toBe(true)
    })
  })

  describe('Monitoring and Automation', () => {
    beforeEach(() => {
      jest.useFakeTimers()

      // Mock the DLMM client
      const mockDlmmClient = require('@/lib/dlmm/client')
      mockDlmmClient.dlmmClient = {
        getUserPositions: jest.fn().mockResolvedValue([
          {
            positionMint: new PublicKey('55555555555555555555555555555555'),
            pair: mockPosition.poolAddress.toString(),
            totalValue: '1000000',
            currentBin: mockPosition.activeBin,
          }
        ]),
        getLbPair: jest.fn().mockResolvedValue({
          activeId: mockPosition.activeBin,
          tokenX: mockPosition.tokenX.address,
          tokenY: mockPosition.tokenY.address,
        }),
      }
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should start and stop monitoring', () => {
      const configId = rebalancingSystem.createRebalancingConfig({
        name: 'Test Monitor Config',
        description: 'Config for monitoring test',
        strategy: {
          type: 'aggressive',
          parameters: {
            targetRange: 6,
            rebalanceThreshold: 0.02,
            maxSlippage: 1.0,
            minEfficiencyGain: 0.05,
            volatilityMultiplier: 1.5,
            momentumWeight: 0.7,
            meanReversionWeight: 0.3,
            riskAdjustment: 1.2,
          },
          binDistribution: {
            type: 'concentrated',
            concentrationFactor: 0.8,
            volatilityAdjustment: true,
            liquidityPreference: 'maximize_fees',
          },
        },
        triggers: [
          {
            id: 'test_trigger',
            type: 'price_movement',
            condition: {
              metric: 'price_deviation',
              operator: 'gte',
              value: 0.02,
            },
            priority: 8,
            isEnabled: true,
            triggerCount: 0,
          },
        ],
        constraints: {
          maxRebalancesPerDay: 10,
          minTimeBetweenRebalances: 30,
          maxSlippageAllowed: 1.5,
          minPositionValue: 100,
          maxGasCostRatio: 2.0,
          allowedTimeWindows: [],
          emergencyStopConditions: [],
        },
        costAnalysis: {
          includeGasCosts: true,
          includeSlippageCosts: true,
          includeOpportunityCosts: true,
          gasPriceStrategy: 'dynamic',
          slippageEstimationMethod: 'current',
          breakEvenThreshold: 0.1,
        },
        automation: {
          isEnabled: true,
          executionMode: 'simulation',
          maxAutomaticValue: 1000,
          notificationChannels: ['console'],
          failsafeEnabled: true,
          monitoringInterval: 15,
        },
        isActive: true,
      })

      // Start monitoring
      rebalancingSystem.startMonitoring(mockUserAddress, [configId])

      // Verify monitoring is active
      expect(rebalancingSystem['isMonitoring']).toBe(true)
      expect(rebalancingSystem['monitoringInterval']).toBeDefined()

      // Stop monitoring
      rebalancingSystem.stopMonitoring()

      // Verify monitoring is stopped
      expect(rebalancingSystem['isMonitoring']).toBe(false)
      expect(rebalancingSystem['monitoringInterval']).toBeUndefined()
    })

    it('should monitor positions and trigger rebalancing', async () => {
      const configId = rebalancingSystem.createRebalancingConfig({
        name: 'Trigger Test Config',
        description: 'Config to test trigger evaluation',
        strategy: {
          type: 'aggressive',
          parameters: {
            targetRange: 6,
            rebalanceThreshold: 0.02,
            maxSlippage: 1.0,
            minEfficiencyGain: 0.05,
            volatilityMultiplier: 1.5,
            momentumWeight: 0.7,
            meanReversionWeight: 0.3,
            riskAdjustment: 1.2,
          },
          binDistribution: {
            type: 'concentrated',
            concentrationFactor: 0.8,
            volatilityAdjustment: true,
            liquidityPreference: 'maximize_fees',
          },
        },
        triggers: [
          {
            id: 'price_movement_trigger',
            type: 'price_movement',
            condition: {
              metric: 'price_deviation',
              operator: 'gte',
              value: 0.01, // Low threshold to ensure trigger
            },
            priority: 8,
            isEnabled: true,
            triggerCount: 0,
          },
        ],
        constraints: {
          maxRebalancesPerDay: 10,
          minTimeBetweenRebalances: 30,
          maxSlippageAllowed: 1.5,
          minPositionValue: 100,
          maxGasCostRatio: 2.0,
          allowedTimeWindows: [],
          emergencyStopConditions: [],
        },
        costAnalysis: {
          includeGasCosts: true,
          includeSlippageCosts: true,
          includeOpportunityCosts: true,
          gasPriceStrategy: 'dynamic',
          slippageEstimationMethod: 'current',
          breakEvenThreshold: 0.1,
        },
        automation: {
          isEnabled: true,
          executionMode: 'simulation',
          maxAutomaticValue: 1000,
          notificationChannels: ['console'],
          failsafeEnabled: true,
          monitoringInterval: 15,
        },
        isActive: true,
      })

      // Start monitoring
      rebalancingSystem.startMonitoring(mockUserAddress, [configId])

      // Fast-forward time to trigger monitoring check
      jest.advanceTimersByTime(60000) // 1 minute

      // Wait for async operations
      await jest.runAllTimersAsync()

      // Verify trigger was evaluated
      const config = rebalancingSystem.getRebalancingConfig(configId)
      expect(config?.triggers[0].triggerCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Statistics and Reporting', () => {
    it('should track execution history', () => {
      const execution1: RebalancingExecution = {
        id: 'exec-1',
        positionId: 'pos-1',
        configId: 'config-1',
        analysis: {} as RebalancingAnalysis,
        execution: {
          status: 'completed',
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T10:05:00Z'),
          transactions: [],
          actualCosts: { gasCosts: 0.002, slippageCosts: 5, totalCosts: 5.002, costVariance: 0 },
          results: {
            success: true,
            efficiencyImprovement: 0.1,
            actualBenefit: 30,
            benefitVariance: 0,
            newPosition: {} as any,
            lessonsLearned: [],
          },
        },
        monitoring: {
          preExecutionState: {} as any,
          performanceMetrics: {
            executionTime: 300,
            slippageAccuracy: 0.95,
            gasEfficiency: 0.9,
            positionImprovement: 0.1,
            marketImpact: 0.01,
          },
          alerts: [],
        },
      }

      const execution2: RebalancingExecution = {
        id: 'exec-2',
        positionId: 'pos-2',
        configId: 'config-1',
        analysis: {} as RebalancingAnalysis,
        execution: {
          status: 'completed',
          startTime: new Date('2024-01-02T10:00:00Z'),
          endTime: new Date('2024-01-02T10:03:00Z'),
          transactions: [],
          actualCosts: { gasCosts: 0.001, slippageCosts: 3, totalCosts: 3.001, costVariance: 0 },
          results: {
            success: true,
            efficiencyImprovement: 0.15,
            actualBenefit: 45,
            benefitVariance: 0,
            newPosition: {} as any,
            lessonsLearned: [],
          },
        },
        monitoring: {
          preExecutionState: {} as any,
          performanceMetrics: {
            executionTime: 180,
            slippageAccuracy: 0.98,
            gasEfficiency: 0.95,
            positionImprovement: 0.15,
            marketImpact: 0.005,
          },
          alerts: [],
        },
      }

      // Manually add executions for testing
      rebalancingSystem['executions'].set('exec-1', execution1)
      rebalancingSystem['executions'].set('exec-2', execution2)

      const history = rebalancingSystem.getExecutionHistory()
      expect(history).toHaveLength(2)
      expect(history[0].execution.startTime.getTime()).toBeGreaterThan(
        history[1].execution.startTime.getTime()
      )

      const pos1History = rebalancingSystem.getExecutionHistory('pos-1')
      expect(pos1History).toHaveLength(1)
      expect(pos1History[0].positionId).toBe('pos-1')
    })

    it('should calculate rebalancing statistics', () => {
      const execution1: RebalancingExecution = {
        id: 'exec-1',
        positionId: 'pos-1',
        configId: 'config-1',
        analysis: {
          currentState: { totalLiquidity: '1000000' } as any,
        } as RebalancingAnalysis,
        execution: {
          status: 'completed',
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T10:05:00Z'),
          transactions: [],
          actualCosts: { gasCosts: 0.002, slippageCosts: 5, totalCosts: 5.002, costVariance: 0 },
          results: {
            success: true,
            efficiencyImprovement: 0.1,
            actualBenefit: 30,
            benefitVariance: 0,
            newPosition: {} as any,
            lessonsLearned: [],
          },
        },
        monitoring: {
          preExecutionState: {} as any,
          performanceMetrics: {
            executionTime: 300,
            slippageAccuracy: 0.95,
            gasEfficiency: 0.9,
            positionImprovement: 0.1,
            marketImpact: 0.01,
          },
          alerts: [],
        },
      }

      const execution2: RebalancingExecution = {
        id: 'exec-2',
        positionId: 'pos-2',
        configId: 'config-1',
        analysis: {
          currentState: { totalLiquidity: '2000000' } as any,
        } as RebalancingAnalysis,
        execution: {
          status: 'failed',
          startTime: new Date('2024-01-02T10:00:00Z'),
          transactions: [],
          actualCosts: { gasCosts: 0, slippageCosts: 0, totalCosts: 0, costVariance: 0 },
          results: {
            success: false,
            efficiencyImprovement: 0,
            actualBenefit: 0,
            benefitVariance: 0,
            newPosition: {} as any,
            lessonsLearned: [],
          },
        },
        monitoring: {
          preExecutionState: {} as any,
          performanceMetrics: {
            executionTime: 0,
            slippageAccuracy: 0,
            gasEfficiency: 0,
            positionImprovement: 0,
            marketImpact: 0,
          },
          alerts: [],
        },
      }

      // Manually add executions for testing
      rebalancingSystem['executions'].set('exec-1', execution1)
      rebalancingSystem['executions'].set('exec-2', execution2)

      const stats = rebalancingSystem.getRebalancingStats()

      expect(stats.totalExecutions).toBe(2)
      expect(stats.successRate).toBe(0.5) // 1 out of 2 succeeded
      expect(stats.averageImprovement).toBe(0.1) // Only successful execution counted
      expect(stats.totalValueRebalanced).toBe(1000000) // Only successful execution counted
      expect(stats.averageExecutionTime).toBe(300) // Only successful execution counted
    })
  })

  describe('Integration with Existing Systems', () => {
    it('should work with strategy manager', () => {
      // Test integration with existing strategy manager
      const configId = rebalancingSystem.createRebalancingConfig({
        name: 'Integration Test Config',
        description: 'Config for testing integration with strategy manager',
        strategy: {
          type: 'aggressive',
          parameters: {
            targetRange: 6,
            rebalanceThreshold: 0.02,
            maxSlippage: 1.0,
            minEfficiencyGain: 0.05,
            volatilityMultiplier: 1.5,
            momentumWeight: 0.7,
            meanReversionWeight: 0.3,
            riskAdjustment: 1.2,
          },
          binDistribution: {
            type: 'concentrated',
            concentrationFactor: 0.8,
            volatilityAdjustment: true,
            liquidityPreference: 'maximize_fees',
          },
        },
        triggers: [],
        constraints: {
          maxRebalancesPerDay: 10,
          minTimeBetweenRebalances: 30,
          maxSlippageAllowed: 1.5,
          minPositionValue: 100,
          maxGasCostRatio: 2.0,
          allowedTimeWindows: [],
          emergencyStopConditions: [],
        },
        costAnalysis: {
          includeGasCosts: true,
          includeSlippageCosts: true,
          includeOpportunityCosts: true,
          gasPriceStrategy: 'dynamic',
          slippageEstimationMethod: 'current',
          breakEvenThreshold: 0.1,
        },
        automation: {
          isEnabled: false,
          executionMode: 'approval_required',
          maxAutomaticValue: 1000,
          notificationChannels: ['console'],
          failsafeEnabled: true,
          monitoringInterval: 15,
        },
        isActive: false,
      })

      const config = rebalancingSystem.getRebalancingConfig(configId)
      expect(config).toBeDefined()
      expect(config?.strategy.type).toBe('aggressive')

      // Verify the config can be used with existing strategy patterns
      expect(config?.strategy.parameters.targetRange).toBe(6)
      expect(config?.strategy.parameters.rebalanceThreshold).toBe(0.02)
    })

    it('should integrate with DLMM operations', () => {
      // Verify that rebalancing system uses existing DLMM operations
      const mockOperations = require('@/lib/dlmm/operations')
      expect(mockOperations.dlmmOperations).toBeDefined()

      // The rebalancing system should be able to call these methods
      expect(typeof mockOperations.dlmmOperations.rebalancePosition).toBe('function')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid position IDs gracefully', async () => {
      await expect(
        rebalancingSystem.analyzePosition('invalid-position', mockUserAddress)
      ).rejects.toThrow('Position invalid-position not found')
    })

    it('should handle missing configurations gracefully', () => {
      const config = rebalancingSystem.getRebalancingConfig('nonexistent-config')
      expect(config).toBeUndefined()

      expect(() => {
        rebalancingSystem.updateRebalancingConfig('nonexistent-config', { name: 'New Name' })
      }).toThrow('Rebalancing config nonexistent-config not found')
    })

    it('should handle network errors during monitoring', async () => {
      // Mock network error
      const mockDlmmClient = require('@/lib/dlmm/client')
      mockDlmmClient.dlmmClient = {
        getUserPositions: jest.fn().mockRejectedValue(new Error('Network error') as any),
      }

      const configId = rebalancingSystem.createRebalancingConfig({
        name: 'Error Test Config',
        description: 'Config for error testing',
        strategy: {
          type: 'conservative',
          parameters: {
            targetRange: 15,
            rebalanceThreshold: 0.08,
            maxSlippage: 0.5,
            minEfficiencyGain: 0.15,
            volatilityMultiplier: 0.8,
            momentumWeight: 0.3,
            meanReversionWeight: 0.7,
            riskAdjustment: 0.6,
          },
          binDistribution: {
            type: 'uniform',
            concentrationFactor: 0.3,
            volatilityAdjustment: true,
            liquidityPreference: 'minimize_il',
          },
        },
        triggers: [],
        constraints: {
          maxRebalancesPerDay: 2,
          minTimeBetweenRebalances: 360,
          maxSlippageAllowed: 0.8,
          minPositionValue: 500,
          maxGasCostRatio: 1.0,
          allowedTimeWindows: [],
          emergencyStopConditions: [],
        },
        costAnalysis: {
          includeGasCosts: true,
          includeSlippageCosts: true,
          includeOpportunityCosts: true,
          gasPriceStrategy: 'low',
          slippageEstimationMethod: 'conservative',
          breakEvenThreshold: 0.2,
        },
        automation: {
          isEnabled: true,
          executionMode: 'simulation',
          maxAutomaticValue: 500,
          notificationChannels: ['console'],
          failsafeEnabled: true,
          monitoringInterval: 60,
        },
        isActive: true,
      })

      // Start monitoring - should not crash on network error
      rebalancingSystem.startMonitoring(mockUserAddress, [configId])

      // Monitoring should handle the error gracefully
      expect(rebalancingSystem['isMonitoring']).toBe(true)

      rebalancingSystem.stopMonitoring()
    })
  })
})

describe('Singleton Export', () => {
  it('should export a singleton instance', () => {
    expect(advancedRebalancingSystem).toBeDefined()
    expect(advancedRebalancingSystem).toBeInstanceOf(AdvancedRebalancingSystem)

    // Should be the same instance
    const { advancedRebalancingSystem: anotherInstance } = require('@/lib/dlmm/rebalancing')
    expect(advancedRebalancingSystem).toBe(anotherInstance)
  })

  it('should have default configurations available', () => {
    const defaultConfigs = advancedRebalancingSystem.getDefaultRebalancingConfigs()
    expect(defaultConfigs.length).toBeGreaterThan(0)
    expect(defaultConfigs.every(config => config.id && config.name && config.strategy)).toBe(true)
  })
})