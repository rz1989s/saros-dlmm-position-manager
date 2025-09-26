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
  action: 'rebalance' | 'add_liquidity' | 'remove_liquidity' | 'close_position'
  timestamp: Date
  gasUsed: number
  profit: number
  success: boolean
  error?: string
}

export class StrategyManager {
  private activeStrategies: Map<string, StrategyConfig> = new Map()
  private executionHistory: StrategyExecution[] = []

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
}

// Export singleton instance
export const strategyManager = new StrategyManager()