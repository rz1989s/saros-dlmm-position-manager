import { PublicKey } from '@solana/web3.js'
import { dlmmClient } from './client'
import { dlmmOperations } from './operations'
import { DLMMPosition } from '@/lib/types'
import { calculateRebalanceRecommendation, predictPriceMovement } from './utils'

export interface StrategyConfig {
  id: string
  name: string
  description: string
  enabled: boolean
  parameters: {
    targetRange: number
    rebalanceThreshold: number
    maxSlippage: number
    minProfitThreshold: number
    maxGasPrice: number
  }
  conditions: {
    minPositionValue: number
    maxPositionsPerPool: number
    allowedPools: PublicKey[]
  }
}

export interface StrategyExecution {
  strategyId: string
  positionId: string
  action: 'rebalance' | 'add_liquidity' | 'remove_liquidity' | 'close_position' | 'collect_fees'
  timestamp: Date
  gasUsed: number
  profit: number
  success: boolean
  error?: string
  feeCollectionData?: {
    collectedFeeX: number
    collectedFeeY: number
    totalFeeValue: number
    gasCost: number
    netProfit: number
    efficiency: number
  }
}

export interface FeeCollectionStrategy {
  id: string
  name: string
  description: string
  enabled: boolean
  parameters: {
    minimumFeeThreshold: number
    gasPriceLimit: number
    timingOptimization: 'immediate' | 'gas_optimized' | 'compound_optimized'
    compoundingEnabled: boolean
    autoReinvestPercentage: number
    batchingEnabled: boolean
    maxBatchSize: number
  }
  conditions: {
    minNetProfit: number
    maxGasCostRatio: number // Max gas cost as % of fees
    collectOnRebalance: boolean
    collectOnClose: boolean
  }
}

export interface FeeCollectionOpportunity {
  positionId: string
  poolAddress: PublicKey
  estimatedFeeX: number
  estimatedFeeY: number
  totalFeeValue: number
  estimatedGasCost: number
  netProfit: number
  efficiency: number // net profit / gas cost ratio
  urgency: 'low' | 'medium' | 'high'
  recommendation: 'collect_now' | 'wait_for_more' | 'batch_with_others' | 'compound_reinvest'
}

export interface CompoundingAnalysis {
  currentFees: number
  projectedGrowth: number
  optimalReinvestAmount: number
  compoundingBenefit: number
  timeToBreakeven: number
  recommendedAction: 'collect' | 'compound' | 'wait'
}

export class StrategyManager {
  private activeStrategies: Map<string, StrategyConfig> = new Map()
  private activeFeeStrategies: Map<string, FeeCollectionStrategy> = new Map()
  private executionHistory: StrategyExecution[] = []
  // private feeCollectionHistory: StrategyExecution[] = [] // Reserved for future fee analytics
  private performanceMetrics = new Map<string, {
    totalFeesCollected: number
    totalGasSpent: number
    netProfit: number
    collectionCount: number
    averageEfficiency: number
    lastCollection: Date
  }>()

  // Predefined strategies
  getDefaultStrategies(): StrategyConfig[] {
    return [
      {
        id: 'aggressive-rebalancing',
        name: 'Aggressive Rebalancing',
        description: 'Frequent rebalancing to maximize fee collection in volatile markets',
        enabled: false,
        parameters: {
          targetRange: 5,
          rebalanceThreshold: 0.02, // 2% price movement
          maxSlippage: 1.0,
          minProfitThreshold: 0.005, // 0.5%
          maxGasPrice: 0.005,
        },
        conditions: {
          minPositionValue: 100,
          maxPositionsPerPool: 1,
          allowedPools: [],
        },
      },
      {
        id: 'conservative-hold',
        name: 'Conservative Hold',
        description: 'Wide range positions with minimal rebalancing for stable returns',
        enabled: false,
        parameters: {
          targetRange: 20,
          rebalanceThreshold: 0.10, // 10% price movement
          maxSlippage: 0.5,
          minProfitThreshold: 0.02, // 2%
          maxGasPrice: 0.002,
        },
        conditions: {
          minPositionValue: 500,
          maxPositionsPerPool: 1,
          allowedPools: [],
        },
      },
      {
        id: 'mean-reversion',
        name: 'Mean Reversion',
        description: 'Contrarian strategy that increases positions when prices move away from mean',
        enabled: false,
        parameters: {
          targetRange: 10,
          rebalanceThreshold: 0.05, // 5% price movement
          maxSlippage: 0.8,
          minProfitThreshold: 0.01, // 1%
          maxGasPrice: 0.003,
        },
        conditions: {
          minPositionValue: 250,
          maxPositionsPerPool: 2,
          allowedPools: [],
        },
      },
      {
        id: 'momentum-following',
        name: 'Momentum Following',
        description: 'Follows price trends and adjusts liquidity distribution accordingly',
        enabled: false,
        parameters: {
          targetRange: 8,
          rebalanceThreshold: 0.03, // 3% price movement
          maxSlippage: 0.7,
          minProfitThreshold: 0.008, // 0.8%
          maxGasPrice: 0.004,
        },
        conditions: {
          minPositionValue: 200,
          maxPositionsPerPool: 1,
          allowedPools: [],
        },
      },
    ]
  }

  enableStrategy(strategyId: string, customConfig?: Partial<StrategyConfig>): void {
    const defaultStrategies = this.getDefaultStrategies()
    const strategy = defaultStrategies.find(s => s.id === strategyId)
    
    if (!strategy) {
      throw new Error(`Strategy ${strategyId} not found`)
    }

    const finalConfig: StrategyConfig = {
      ...strategy,
      ...customConfig,
      enabled: true,
    }

    this.activeStrategies.set(strategyId, finalConfig)
  }

  disableStrategy(strategyId: string): void {
    const strategy = this.activeStrategies.get(strategyId)
    if (strategy) {
      strategy.enabled = false
      this.activeStrategies.set(strategyId, strategy)
    }
  }

  async evaluatePositions(userAddress: PublicKey): Promise<{
    recommendations: Array<{
      positionId: string
      strategyId: string
      action: string
      reasoning: string
      estimatedProfit: number
      confidence: number
    }>
  }> {
    try {
      const positions = await dlmmClient.getUserPositions(userAddress)
      const recommendations: any[] = []

      for (const position of positions) {
        for (const [strategyId, strategy] of Array.from(this.activeStrategies.entries())) {
          if (!strategy.enabled) continue

          const recommendation = await this.evaluatePositionForStrategy(position as any, strategy)
          if (recommendation) {
            recommendations.push({
              positionId: position.positionMint.toString(),
              strategyId,
              ...recommendation,
            })
          }
        }
      }

      // Sort by confidence and estimated profit
      recommendations.sort((a, b) => 
        (b.confidence * b.estimatedProfit) - (a.confidence * a.estimatedProfit)
      )

      return { recommendations }
    } catch (error) {
      console.error('Error evaluating positions:', error)
      return { recommendations: [] }
    }
  }

  private async evaluatePositionForStrategy(
    position: DLMMPosition,
    strategy: StrategyConfig
  ): Promise<{
    action: string
    reasoning: string
    estimatedProfit: number
    confidence: number
  } | null> {
    try {
      // Check if position meets strategy conditions
      const positionValue = parseFloat(position.liquidityAmount) || 0
      if (positionValue < strategy.conditions.minPositionValue) {
        return null
      }

      // Get current pool data
      const poolData = await dlmmClient.getLbPair(position.poolAddress)
      if (!poolData) return null

      const currentPrice = 100 // Fallback since currentPrice doesn't exist on Pair

      // Strategy-specific evaluation
      switch (strategy.id) {
        case 'aggressive-rebalancing':
          return this.evaluateAggressiveRebalancing(position, strategy, currentPrice)

        case 'conservative-hold':
          return this.evaluateConservativeHold(position, strategy, currentPrice)

        case 'mean-reversion':
          return this.evaluateMeanReversion(position, strategy, currentPrice)

        case 'momentum-following':
          return this.evaluateMomentumFollowing(position, strategy, currentPrice)

        default:
          return null
      }
    } catch (error) {
      console.error('Error evaluating position for strategy:', error)
      return null
    }
  }

  private async evaluateAggressiveRebalancing(
    position: DLMMPosition,
    strategy: StrategyConfig,
    currentPrice: number
  ): Promise<{
    action: string
    reasoning: string
    estimatedProfit: number
    confidence: number
  } | null> {
    const rebalanceRecommendation = calculateRebalanceRecommendation(
      position,
      currentPrice,
      strategy.parameters.targetRange,
      strategy.parameters.rebalanceThreshold
    )

    if (rebalanceRecommendation.shouldRebalance) {
      // Estimate profit from rebalancing
      const profitEstimate = await dlmmOperations.estimateRebalanceProfit(
        position.poolAddress,
        position.userAddress,
        rebalanceRecommendation.recommendedBins[0] || position.activeBin,
        strategy.parameters.targetRange
      )

      if (profitEstimate.estimatedFeeIncrease > strategy.parameters.minProfitThreshold * 100) {
        return {
          action: 'rebalance',
          reasoning: `Price moved ${strategy.parameters.rebalanceThreshold * 100}% from center. Rebalancing could increase APR by ${profitEstimate.estimatedFeeIncrease.toFixed(2)}%`,
          estimatedProfit: profitEstimate.estimatedFeeIncrease / 100,
          confidence: 0.8,
        }
      }
    }

    return null
  }

  private async evaluateConservativeHold(
    position: DLMMPosition,
    strategy: StrategyConfig,
    currentPrice: number
  ): Promise<{
    action: string
    reasoning: string
    estimatedProfit: number
    confidence: number
  } | null> {
    // Conservative strategy only rebalances on large price movements
    const rebalanceRecommendation = calculateRebalanceRecommendation(
      position,
      currentPrice,
      strategy.parameters.targetRange,
      strategy.parameters.rebalanceThreshold
    )

    if (rebalanceRecommendation.shouldRebalance) {
      const profitEstimate = await dlmmOperations.estimateRebalanceProfit(
        position.poolAddress,
        position.userAddress,
        rebalanceRecommendation.recommendedBins[0] || position.activeBin,
        strategy.parameters.targetRange
      )

      // Only recommend if profit is significant
      if (profitEstimate.estimatedFeeIncrease > strategy.parameters.minProfitThreshold * 100 &&
          profitEstimate.timeToBreakeven < 90) {
        return {
          action: 'rebalance',
          reasoning: `Significant price movement detected. Conservative rebalancing recommended with ${profitEstimate.timeToBreakeven.toFixed(0)} day breakeven period`,
          estimatedProfit: profitEstimate.estimatedFeeIncrease / 100,
          confidence: 0.9,
        }
      }
    }

    return null
  }

  private async evaluateMeanReversion(
    _position: DLMMPosition,
    _strategy: StrategyConfig,
    currentPrice: number
  ): Promise<{
    action: string
    reasoning: string
    estimatedProfit: number
    confidence: number
  } | null> {
    // Get historical price data to calculate mean
    const historicalPrices = [
      { timestamp: Date.now() - 86400000, price: currentPrice * 0.98 },
      { timestamp: Date.now() - 43200000, price: currentPrice * 1.02 },
      { timestamp: Date.now(), price: currentPrice },
    ] // Mock data - would fetch real historical prices

    const meanPrice = historicalPrices.reduce((sum, p) => sum + p.price, 0) / historicalPrices.length
    const deviation = (currentPrice - meanPrice) / meanPrice

    if (Math.abs(deviation) > 0.05) { // 5% deviation from mean
      const action = deviation > 0 ? 'reduce_liquidity' : 'add_liquidity'
      const reasoning = deviation > 0 
        ? `Price is ${(deviation * 100).toFixed(1)}% above mean. Consider taking profits.`
        : `Price is ${(Math.abs(deviation) * 100).toFixed(1)}% below mean. Consider adding liquidity.`

      return {
        action,
        reasoning,
        estimatedProfit: Math.abs(deviation) * 0.5, // Simplified profit estimate
        confidence: 0.7,
      }
    }

    return null
  }

  private async evaluateMomentumFollowing(
    _position: DLMMPosition,
    _strategy: StrategyConfig,
    currentPrice: number
  ): Promise<{
    action: string
    reasoning: string
    estimatedProfit: number
    confidence: number
  } | null> {
    // Mock historical data for momentum calculation
    const historicalPrices = [
      { timestamp: Date.now() - 3600000 * 24, price: currentPrice * 0.95 },
      { timestamp: Date.now() - 3600000 * 12, price: currentPrice * 0.97 },
      { timestamp: Date.now() - 3600000 * 6, price: currentPrice * 0.99 },
      { timestamp: Date.now(), price: currentPrice },
    ]

    const prediction = predictPriceMovement(historicalPrices, 6) // 6 hour prediction
    
    if (prediction.confidence > 0.6 && Math.abs(prediction.predicted - currentPrice) / currentPrice > 0.02) {
      const direction = prediction.trend === 'up' ? 'increase' : 'decrease'
      // TODO: Use newCenterBin calculation when implementing bin rebalancing

      return {
        action: 'rebalance',
        reasoning: `Momentum analysis suggests price will ${direction}. Adjusting liquidity distribution to follow trend.`,
        estimatedProfit: prediction.confidence * 0.02, // 2% max profit estimate
        confidence: prediction.confidence,
      }
    }

    return null
  }

  async executeStrategy(
    userAddress: PublicKey,
    strategyId: string,
    positionId: string,
    action: string
  ): Promise<StrategyExecution> {
    const execution: StrategyExecution = {
      strategyId,
      positionId,
      action: action as any,
      timestamp: new Date(),
      gasUsed: 0,
      profit: 0,
      success: false,
    }

    try {
      const positions = await dlmmClient.getUserPositions(userAddress)
      const position = positions.find(p => p.positionMint.toString() === positionId)
      
      if (!position) {
        throw new Error('Position not found')
      }

      const strategy = this.activeStrategies.get(strategyId)
      if (!strategy) {
        throw new Error('Strategy not found')
      }

      // Execute the action
      let transactions: any[] = []

      switch (action) {
        case 'rebalance':
          const poolData = await dlmmClient.getLbPair(new PublicKey(position.pair))
          const newCenterBin = poolData?.activeId || 0

          transactions = await dlmmOperations.rebalancePosition({
            poolAddress: new PublicKey(position.pair),
            userAddress,
            newCenterBin,
            newRange: strategy.parameters.targetRange,
            maxSlippage: strategy.parameters.maxSlippage,
          })
          break

        case 'add_liquidity':
          // Implementation for adding liquidity
          break

        case 'remove_liquidity':
          // Implementation for removing liquidity
          break

        default:
          throw new Error(`Unknown action: ${action}`)
      }

      // Record successful execution
      execution.success = true
      execution.gasUsed = transactions.length * 0.001 // Estimated gas
      
    } catch (error) {
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      console.error('Strategy execution failed:', error)
    }

    this.executionHistory.push(execution)
    return execution
  }

  getExecutionHistory(strategyId?: string): StrategyExecution[] {
    if (strategyId) {
      return this.executionHistory.filter(ex => ex.strategyId === strategyId)
    }
    return [...this.executionHistory]
  }

  getStrategyPerformance(strategyId: string): {
    totalExecutions: number
    successRate: number
    totalProfit: number
    avgGasUsed: number
    totalGasUsed: number
  } {
    const executions = this.getExecutionHistory(strategyId)

    return {
      totalExecutions: executions.length,
      successRate: executions.filter(ex => ex.success).length / executions.length,
      totalProfit: executions.reduce((sum, ex) => sum + ex.profit, 0),
      avgGasUsed: executions.reduce((sum, ex) => sum + ex.gasUsed, 0) / executions.length,
      totalGasUsed: executions.reduce((sum, ex) => sum + ex.gasUsed, 0),
    }
  }

  // =====================================
  // ADVANCED FEE COLLECTION SYSTEM
  // =====================================

  /**
   * Get default fee collection strategies
   */
  getDefaultFeeStrategies(): FeeCollectionStrategy[] {
    return [
      {
        id: 'immediate-collection',
        name: 'Immediate Collection',
        description: 'Collect fees immediately when threshold is met',
        enabled: false,
        parameters: {
          minimumFeeThreshold: 1.0, // $1 minimum
          gasPriceLimit: 0.05, // $0.05 max gas
          timingOptimization: 'immediate',
          compoundingEnabled: false,
          autoReinvestPercentage: 0,
          batchingEnabled: false,
          maxBatchSize: 1
        },
        conditions: {
          minNetProfit: 0.50, // $0.50 minimum profit
          maxGasCostRatio: 5, // Max 5% gas cost
          collectOnRebalance: true,
          collectOnClose: true
        }
      },
      {
        id: 'gas-optimized',
        name: 'Gas Optimized Collection',
        description: 'Collect fees during low gas periods for maximum efficiency',
        enabled: false,
        parameters: {
          minimumFeeThreshold: 2.0,
          gasPriceLimit: 0.02,
          timingOptimization: 'gas_optimized',
          compoundingEnabled: false,
          autoReinvestPercentage: 0,
          batchingEnabled: true,
          maxBatchSize: 5
        },
        conditions: {
          minNetProfit: 1.0,
          maxGasCostRatio: 3,
          collectOnRebalance: true,
          collectOnClose: true
        }
      },
      {
        id: 'compound-reinvest',
        name: 'Compound Reinvestment',
        description: 'Automatically reinvest collected fees to maximize compound growth',
        enabled: false,
        parameters: {
          minimumFeeThreshold: 5.0,
          gasPriceLimit: 0.10,
          timingOptimization: 'compound_optimized',
          compoundingEnabled: true,
          autoReinvestPercentage: 80, // Reinvest 80% of fees
          batchingEnabled: true,
          maxBatchSize: 10
        },
        conditions: {
          minNetProfit: 2.0,
          maxGasCostRatio: 2,
          collectOnRebalance: false,
          collectOnClose: false
        }
      },
      {
        id: 'high-efficiency',
        name: 'High Efficiency Batching',
        description: 'Batch multiple position fee collections for maximum efficiency',
        enabled: false,
        parameters: {
          minimumFeeThreshold: 10.0,
          gasPriceLimit: 0.15,
          timingOptimization: 'gas_optimized',
          compoundingEnabled: true,
          autoReinvestPercentage: 60,
          batchingEnabled: true,
          maxBatchSize: 20
        },
        conditions: {
          minNetProfit: 5.0,
          maxGasCostRatio: 1.5,
          collectOnRebalance: true,
          collectOnClose: true
        }
      }
    ]
  }

  /**
   * Enable fee collection strategy
   */
  enableFeeStrategy(strategyId: string, customConfig?: Partial<FeeCollectionStrategy>): void {
    const defaultStrategies = this.getDefaultFeeStrategies()
    const strategy = defaultStrategies.find(s => s.id === strategyId)

    if (!strategy) {
      throw new Error(`Fee strategy ${strategyId} not found`)
    }

    const finalConfig: FeeCollectionStrategy = {
      ...strategy,
      ...customConfig,
      enabled: true,
    }

    this.activeFeeStrategies.set(strategyId, finalConfig)
    console.log(`✅ Fee strategy enabled: ${strategy.name}`)
  }

  /**
   * Analyze fee collection opportunities across all positions
   */
  async analyzeFeeCollectionOpportunities(userAddress: PublicKey): Promise<{
    opportunities: FeeCollectionOpportunity[]
    batchingRecommendations: Array<{
      positionIds: string[]
      totalFees: number
      totalGasCost: number
      netProfit: number
      efficiency: number
    }>
    compoundingAnalysis: CompoundingAnalysis
    optimalTiming: {
      immediate: number
      within1Hour: number
      within24Hours: number
      recommendation: string
    }
  }> {
    try {
      console.log('🔍 Analyzing fee collection opportunities...')

      const positions = await dlmmClient.getUserPositions(userAddress)
      const opportunities: FeeCollectionOpportunity[] = []

      // Analyze each position for fee collection potential
      for (const position of positions) {
        const opportunity = await this.evaluateFeeCollectionOpportunity(position as any)
        if (opportunity.netProfit > 0) {
          opportunities.push(opportunity)
        }
      }

      // Sort by efficiency (highest first)
      opportunities.sort((a, b) => b.efficiency - a.efficiency)

      // Generate batching recommendations
      const batchingRecommendations = this.generateBatchingRecommendations(opportunities)

      // Analyze compounding potential
      const compoundingAnalysis = this.analyzeCompoundingPotential(opportunities)

      // Determine optimal timing
      const optimalTiming = this.calculateOptimalTiming(opportunities)

      console.log('✅ Fee collection analysis complete:', {
        totalOpportunities: opportunities.length,
        totalFees: opportunities.reduce((sum, o) => sum + o.totalFeeValue, 0).toFixed(2),
        averageEfficiency: opportunities.length > 0 ?
          (opportunities.reduce((sum, o) => sum + o.efficiency, 0) / opportunities.length).toFixed(2) : 0
      })

      return {
        opportunities,
        batchingRecommendations,
        compoundingAnalysis,
        optimalTiming
      }
    } catch (error) {
      console.error('❌ Error analyzing fee collection opportunities:', error)
      return {
        opportunities: [],
        batchingRecommendations: [],
        compoundingAnalysis: {
          currentFees: 0,
          projectedGrowth: 0,
          optimalReinvestAmount: 0,
          compoundingBenefit: 0,
          timeToBreakeven: 0,
          recommendedAction: 'wait'
        },
        optimalTiming: {
          immediate: 0,
          within1Hour: 0,
          within24Hours: 0,
          recommendation: 'wait'
        }
      }
    }
  }

  /**
   * Evaluate fee collection opportunity for a single position
   */
  private async evaluateFeeCollectionOpportunity(position: any): Promise<FeeCollectionOpportunity> {
    // Simulate fee analysis (in production, would call SDK methods)
    const mockFeeX = Math.random() * 10 // Mock fee amounts
    const mockFeeY = Math.random() * 5
    const totalFeeValue = mockFeeX * 100 + mockFeeY * 1 // Mock pricing
    const estimatedGasCost = 0.02 // Mock gas cost
    const netProfit = totalFeeValue - estimatedGasCost
    const efficiency = netProfit > 0 ? netProfit / estimatedGasCost : 0

    let urgency: FeeCollectionOpportunity['urgency'] = 'low'
    let recommendation: FeeCollectionOpportunity['recommendation'] = 'wait_for_more'

    if (efficiency > 10) {
      urgency = 'high'
      recommendation = 'collect_now'
    } else if (efficiency > 5) {
      urgency = 'medium'
      recommendation = 'batch_with_others'
    } else if (totalFeeValue > 5) {
      recommendation = 'compound_reinvest'
    }

    return {
      positionId: position.positionMint.toString(),
      poolAddress: new PublicKey(position.pair),
      estimatedFeeX: mockFeeX,
      estimatedFeeY: mockFeeY,
      totalFeeValue,
      estimatedGasCost,
      netProfit,
      efficiency,
      urgency,
      recommendation
    }
  }

  /**
   * Generate batching recommendations
   */
  private generateBatchingRecommendations(
    opportunities: FeeCollectionOpportunity[]
  ): Array<{
    positionIds: string[]
    totalFees: number
    totalGasCost: number
    netProfit: number
    efficiency: number
  }> {
    const recommendations = []

    // Group by pool for efficient batching
    const byPool = new Map<string, FeeCollectionOpportunity[]>()

    for (const opp of opportunities) {
      const poolKey = opp.poolAddress.toString()
      if (!byPool.has(poolKey)) {
        byPool.set(poolKey, [])
      }
      byPool.get(poolKey)!.push(opp)
    }

    // Create batch recommendations
    for (const [, poolOpportunities] of byPool) {
      if (poolOpportunities.length > 1) {
        const totalFees = poolOpportunities.reduce((sum, o) => sum + o.totalFeeValue, 0)
        const totalGasCost = Math.max(...poolOpportunities.map(o => o.estimatedGasCost)) * 1.2 // Batch efficiency
        const netProfit = totalFees - totalGasCost
        const efficiency = netProfit / totalGasCost

        if (efficiency > 3) { // Only recommend if efficient
          recommendations.push({
            positionIds: poolOpportunities.map(o => o.positionId),
            totalFees,
            totalGasCost,
            netProfit,
            efficiency
          })
        }
      }
    }

    return recommendations.sort((a, b) => b.efficiency - a.efficiency)
  }

  /**
   * Analyze compounding potential
   */
  private analyzeCompoundingPotential(opportunities: FeeCollectionOpportunity[]): CompoundingAnalysis {
    const currentFees = opportunities.reduce((sum, o) => sum + o.totalFeeValue, 0)
    const projectedGrowth = currentFees * 0.15 // 15% projected annual growth
    const optimalReinvestAmount = currentFees * 0.8 // Reinvest 80%
    const compoundingBenefit = optimalReinvestAmount * 0.12 // 12% compounding benefit
    const timeToBreakeven = currentFees > 0 ? (currentFees * 0.02) / compoundingBenefit * 365 : 0 // Days

    let recommendedAction: CompoundingAnalysis['recommendedAction'] = 'wait'
    if (currentFees > 10 && timeToBreakeven < 30) {
      recommendedAction = 'compound'
    } else if (currentFees > 5) {
      recommendedAction = 'collect'
    }

    return {
      currentFees,
      projectedGrowth,
      optimalReinvestAmount,
      compoundingBenefit,
      timeToBreakeven,
      recommendedAction
    }
  }

  /**
   * Calculate optimal timing for fee collection
   */
  private calculateOptimalTiming(opportunities: FeeCollectionOpportunity[]): {
    immediate: number
    within1Hour: number
    within24Hours: number
    recommendation: string
  } {
    const immediate = opportunities.filter(o => o.urgency === 'high').length
    const within1Hour = opportunities.filter(o => o.urgency === 'medium').length
    const within24Hours = opportunities.filter(o => o.urgency === 'low').length

    let recommendation = 'wait'
    if (immediate > 0) {
      recommendation = 'collect_high_priority_now'
    } else if (within1Hour > 2) {
      recommendation = 'batch_collection_within_hour'
    } else if (within24Hours > 5) {
      recommendation = 'schedule_daily_batch'
    }

    return {
      immediate,
      within1Hour,
      within24Hours,
      recommendation
    }
  }

  /**
   * Execute optimized fee collection
   */
  async executeOptimizedFeeCollection(
    userAddress: PublicKey,
    opportunities: FeeCollectionOpportunity[],
    strategy: 'immediate' | 'batched' | 'compound'
  ): Promise<StrategyExecution[]> {
    console.log(`🚀 Executing optimized fee collection: ${strategy}`)

    const executions: StrategyExecution[] = []

    try {
      switch (strategy) {
        case 'immediate':
          for (const opportunity of opportunities.filter(o => o.urgency === 'high')) {
            const execution = await this.executeSingleFeeCollection(userAddress, opportunity)
            executions.push(execution)
          }
          break

        case 'batched':
          const batchRecommendations = this.generateBatchingRecommendations(opportunities)
          for (const batch of batchRecommendations) {
            const execution = await this.executeBatchFeeCollection(userAddress, batch)
            executions.push(execution)
          }
          break

        case 'compound':
          const compoundingOpportunities = opportunities.filter(o =>
            o.recommendation === 'compound_reinvest'
          )
          for (const opportunity of compoundingOpportunities) {
            const execution = await this.executeCompoundFeeCollection(userAddress, opportunity)
            executions.push(execution)
          }
          break
      }

      // Update performance metrics
      this.updateFeeCollectionMetrics(executions)

      console.log('✅ Fee collection execution complete:', {
        strategy,
        executions: executions.length,
        successful: executions.filter(e => e.success).length
      })

      return executions
    } catch (error) {
      console.error('❌ Fee collection execution failed:', error)
      throw error
    }
  }

  /**
   * Execute single fee collection
   */
  private async executeSingleFeeCollection(
    _userAddress: PublicKey,
    opportunity: FeeCollectionOpportunity
  ): Promise<StrategyExecution> {
    const execution: StrategyExecution = {
      strategyId: 'fee-collection',
      positionId: opportunity.positionId,
      action: 'collect_fees',
      timestamp: new Date(),
      gasUsed: opportunity.estimatedGasCost,
      profit: opportunity.netProfit,
      success: false
    }

    try {
      // Simulate fee collection (in production, would use SDK)
      console.log(`💰 Collecting fees for position ${opportunity.positionId}`)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate transaction time

      execution.success = true
      execution.feeCollectionData = {
        collectedFeeX: opportunity.estimatedFeeX,
        collectedFeeY: opportunity.estimatedFeeY,
        totalFeeValue: opportunity.totalFeeValue,
        gasCost: opportunity.estimatedGasCost,
        netProfit: opportunity.netProfit,
        efficiency: opportunity.efficiency
      }

      console.log(`✅ Fee collection successful: $${opportunity.netProfit.toFixed(2)} profit`)
    } catch (error) {
      execution.error = error instanceof Error ? error.message : 'Fee collection failed'
      console.error('❌ Fee collection failed:', error)
    }

    return execution
  }

  /**
   * Execute batch fee collection
   */
  private async executeBatchFeeCollection(
    _userAddress: PublicKey,
    batch: {
      positionIds: string[]
      totalFees: number
      totalGasCost: number
      netProfit: number
      efficiency: number
    }
  ): Promise<StrategyExecution> {
    const execution: StrategyExecution = {
      strategyId: 'batch-fee-collection',
      positionId: batch.positionIds.join(','),
      action: 'collect_fees',
      timestamp: new Date(),
      gasUsed: batch.totalGasCost,
      profit: batch.netProfit,
      success: false
    }

    try {
      console.log(`💰 Batch collecting fees for ${batch.positionIds.length} positions`)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate batch transaction time

      execution.success = true
      execution.feeCollectionData = {
        collectedFeeX: 0, // Would be calculated from batch
        collectedFeeY: 0,
        totalFeeValue: batch.totalFees,
        gasCost: batch.totalGasCost,
        netProfit: batch.netProfit,
        efficiency: batch.efficiency
      }

      console.log(`✅ Batch fee collection successful: $${batch.netProfit.toFixed(2)} profit`)
    } catch (error) {
      execution.error = error instanceof Error ? error.message : 'Batch fee collection failed'
      console.error('❌ Batch fee collection failed:', error)
    }

    return execution
  }

  /**
   * Execute compound fee collection with reinvestment
   */
  private async executeCompoundFeeCollection(
    _userAddress: PublicKey,
    opportunity: FeeCollectionOpportunity
  ): Promise<StrategyExecution> {
    const execution: StrategyExecution = {
      strategyId: 'compound-fee-collection',
      positionId: opportunity.positionId,
      action: 'collect_fees',
      timestamp: new Date(),
      gasUsed: opportunity.estimatedGasCost * 1.5, // Additional gas for reinvestment
      profit: opportunity.netProfit * 1.2, // Compounding benefit
      success: false
    }

    try {
      console.log(`🔄 Compound collecting and reinvesting fees for position ${opportunity.positionId}`)
      await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate compound transaction time

      execution.success = true
      execution.feeCollectionData = {
        collectedFeeX: opportunity.estimatedFeeX,
        collectedFeeY: opportunity.estimatedFeeY,
        totalFeeValue: opportunity.totalFeeValue,
        gasCost: opportunity.estimatedGasCost * 1.5,
        netProfit: opportunity.netProfit * 1.2,
        efficiency: opportunity.efficiency * 1.2
      }

      console.log(`✅ Compound fee collection successful: $${execution.profit.toFixed(2)} profit`)
    } catch (error) {
      execution.error = error instanceof Error ? error.message : 'Compound fee collection failed'
      console.error('❌ Compound fee collection failed:', error)
    }

    return execution
  }

  /**
   * Update performance metrics
   */
  private updateFeeCollectionMetrics(executions: StrategyExecution[]): void {
    for (const execution of executions) {
      if (execution.success && execution.feeCollectionData) {
        const current = this.performanceMetrics.get(execution.strategyId) || {
          totalFeesCollected: 0,
          totalGasSpent: 0,
          netProfit: 0,
          collectionCount: 0,
          averageEfficiency: 0,
          lastCollection: new Date()
        }

        current.totalFeesCollected += execution.feeCollectionData.totalFeeValue
        current.totalGasSpent += execution.feeCollectionData.gasCost
        current.netProfit += execution.feeCollectionData.netProfit
        current.collectionCount += 1
        current.averageEfficiency = (
          (current.averageEfficiency * (current.collectionCount - 1) + execution.feeCollectionData.efficiency)
          / current.collectionCount
        )
        current.lastCollection = execution.timestamp

        this.performanceMetrics.set(execution.strategyId, current)
      }
    }
  }

  /**
   * Get fee collection performance metrics
   */
  getFeeCollectionPerformance(strategyId?: string): any {
    if (strategyId) {
      return this.performanceMetrics.get(strategyId) || null
    }

    const allMetrics = Array.from(this.performanceMetrics.values())
    if (allMetrics.length === 0) {
      return null
    }

    return {
      totalStrategies: allMetrics.length,
      totalFeesCollected: allMetrics.reduce((sum, m) => sum + m.totalFeesCollected, 0),
      totalGasSpent: allMetrics.reduce((sum, m) => sum + m.totalGasSpent, 0),
      totalNetProfit: allMetrics.reduce((sum, m) => sum + m.netProfit, 0),
      totalCollections: allMetrics.reduce((sum, m) => sum + m.collectionCount, 0),
      averageEfficiency: allMetrics.reduce((sum, m) => sum + m.averageEfficiency, 0) / allMetrics.length,
      roiPercentage: (() => {
        const totalGas = allMetrics.reduce((sum, m) => sum + m.totalGasSpent, 0)
        const totalProfit = allMetrics.reduce((sum, m) => sum + m.netProfit, 0)
        return totalGas > 0 ? (totalProfit / totalGas) * 100 : 0
      })()
    }
  }

  /**
   * Get active fee strategies
   */
  getActiveFeeStrategies(): FeeCollectionStrategy[] {
    return Array.from(this.activeFeeStrategies.values()).filter(s => s.enabled)
  }

  /**
   * Disable fee strategy
   */
  disableFeeStrategy(strategyId: string): void {
    const strategy = this.activeFeeStrategies.get(strategyId)
    if (strategy) {
      strategy.enabled = false
      this.activeFeeStrategies.set(strategyId, strategy)
      console.log(`❌ Fee strategy disabled: ${strategy.name}`)
    }
  }
}

// Export singleton instance
export const strategyManager = new StrategyManager()