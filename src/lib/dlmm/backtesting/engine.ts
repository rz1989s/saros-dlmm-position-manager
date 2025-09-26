import { PublicKey } from '@solana/web3.js'
import {
  BacktestConfig,
  BacktestResult,
  BacktestMetrics,
  TimeSeriesPoint,
  StrategyAction,
  PositionSnapshot,
  HistoricalData,
  HistoricalPricePoint,
} from '@/lib/types'
import { historicalDataService } from './historical-data'
import { metricsCalculator } from './metrics'
import { strategyManager } from '../strategies'

export interface BacktestProgress {
  phase: 'initializing' | 'fetching_data' | 'simulating' | 'calculating_metrics' | 'completed' | 'error'
  progress: number // 0-1
  currentStep: string
  estimatedTimeRemaining?: number // seconds
}

export class BacktestEngine {
  private isRunning = false
  private abortController: AbortController | null = null

  /**
   * Run a complete backtest simulation
   */
  async runBacktest(
    config: BacktestConfig,
    onProgress?: (progress: BacktestProgress) => void
  ): Promise<BacktestResult> {
    const startTime = Date.now()
    console.log(`🚀 Starting backtest: ${config.name}`)

    // Initialize result structure
    const result: BacktestResult = {
      config,
      status: 'running',
      progress: 0,
      startedAt: new Date(),
      metrics: {} as BacktestMetrics,
      timeSeriesData: [],
      actions: [],
      summary: {
        bestPeriod: { start: new Date(), end: new Date(), return: 0 },
        worstPeriod: { start: new Date(), end: new Date(), return: 0 },
        keyInsights: [],
        recommendations: [],
      },
    }

    try {
      this.isRunning = true
      this.abortController = new AbortController()

      // Phase 1: Initialize and validate
      this.updateProgress(onProgress, {
        phase: 'initializing',
        progress: 0.05,
        currentStep: 'Validating configuration...',
      })

      this.validateConfig(config)

      // Phase 2: Fetch historical data
      this.updateProgress(onProgress, {
        phase: 'fetching_data',
        progress: 0.15,
        currentStep: 'Fetching historical data...',
      })

      const historicalData = await historicalDataService.fetchHistoricalData(
        config.market.poolAddress,
        config.timeframe.startDate,
        config.timeframe.endDate,
        config.timeframe.interval
      )

      // Phase 3: Run simulation
      this.updateProgress(onProgress, {
        phase: 'simulating',
        progress: 0.25,
        currentStep: 'Running strategy simulation...',
      })

      const simulationData = await this.runSimulation(
        config,
        historicalData,
        (progress) => {
          this.updateProgress(onProgress, {
            phase: 'simulating',
            progress: 0.25 + progress * 0.65, // 25% to 90%
            currentStep: 'Simulating strategy decisions...',
            estimatedTimeRemaining: this.estimateTimeRemaining(startTime, 0.25 + progress * 0.65),
          })
        }
      )

      result.timeSeriesData = simulationData.timeSeriesData
      result.actions = simulationData.actions

      // Phase 4: Calculate metrics
      this.updateProgress(onProgress, {
        phase: 'calculating_metrics',
        progress: 0.90,
        currentStep: 'Calculating performance metrics...',
      })

      result.metrics = metricsCalculator.calculateBacktestMetrics(
        result.timeSeriesData,
        result.actions,
        config.capital.initialAmount
      )

      // Phase 5: Generate summary and insights
      this.updateProgress(onProgress, {
        phase: 'calculating_metrics',
        progress: 0.95,
        currentStep: 'Generating insights and recommendations...',
      })

      result.summary = this.generateSummary(result)

      // Complete
      result.status = 'completed'
      result.progress = 1
      result.completedAt = new Date()

      this.updateProgress(onProgress, {
        phase: 'completed',
        progress: 1,
        currentStep: 'Backtest completed successfully!',
      })

      const duration = (Date.now() - startTime) / 1000
      console.log(`✅ Backtest completed in ${duration.toFixed(2)}s`)
      console.log(`📊 Total return: ${(result.metrics.totalReturn * 100).toFixed(2)}%`)
      console.log(`📈 Sharpe ratio: ${result.metrics.sharpeRatio.toFixed(2)}`)

      return result

    } catch (error) {
      console.error('❌ Backtest failed:', error)

      result.status = 'error'
      result.error = {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      }

      this.updateProgress(onProgress, {
        phase: 'error',
        progress: result.progress,
        currentStep: `Error: ${result.error.message}`,
      })

      return result

    } finally {
      this.isRunning = false
      this.abortController = null
    }
  }

  /**
   * Run the core simulation logic
   */
  private async runSimulation(
    config: BacktestConfig,
    historicalData: HistoricalData,
    onProgress?: (progress: number) => void
  ): Promise<{
    timeSeriesData: TimeSeriesPoint[]
    actions: StrategyAction[]
  }> {
    const { priceData } = historicalData
    const timeSeriesData: TimeSeriesPoint[] = []
    const actions: StrategyAction[] = []

    // Initialize position
    let currentPosition = this.initializePosition(config)
    let benchmarkPosition = this.initializeBenchmarkPosition(config, priceData[0])

    // Add initial action
    actions.push({
      timestamp: priceData[0].timestamp,
      type: 'initialize',
      parameters: {
        reason: 'Initial position setup',
      },
      costs: { gas: 0.001, slippage: 0, fees: 0 },
      result: {
        success: true,
        newPositionValue: currentPosition.totalValue,
      },
    })

    // Simulate each time period
    for (let i = 0; i < priceData.length; i++) {
      if (this.abortController?.signal.aborted) {
        throw new Error('Backtest was cancelled')
      }

      const pricePoint = priceData[i]
      const timestamp = pricePoint.timestamp

      // Update position values based on current market conditions
      currentPosition = this.updatePositionValue(currentPosition, pricePoint)
      benchmarkPosition = this.updateBenchmarkValue(benchmarkPosition, pricePoint)

      // Check if strategy wants to take action
      const strategyAction = await this.evaluateStrategy(
        config,
        currentPosition,
        pricePoint,
        historicalData
      )

      if (strategyAction) {
        // Execute the action and update position
        currentPosition = this.executeStrategyAction(
          currentPosition,
          strategyAction,
          pricePoint,
          config
        )
        actions.push(strategyAction)
      }

      // Record time series point
      timeSeriesData.push({
        timestamp,
        portfolioValue: currentPosition.totalValue,
        benchmarkValue: benchmarkPosition.totalValue,
        position: currentPosition,
        action: strategyAction || undefined,
        marketPrice: pricePoint.close,
        marketVolume: pricePoint.volume,
      })

      // Update progress
      if (onProgress && i % Math.max(1, Math.floor(priceData.length / 100)) === 0) {
        onProgress(i / priceData.length)
      }
    }

    return { timeSeriesData, actions }
  }

  /**
   * Initialize starting position based on config
   */
  private initializePosition(config: BacktestConfig): PositionSnapshot {
    const timestamp = config.timeframe.startDate

    // Distribute initial capital across bins (simplified)
    const binDistribution = []
    const binRange = 10 // Start with 10 bins around current price
    const liquidityPerBin = config.capital.initialAmount / binRange

    for (let i = 0; i < binRange; i++) {
      binDistribution.push({
        binId: 1000 + i, // Simplified bin IDs
        liquidityX: (liquidityPerBin * 0.5).toString(),
        liquidityY: (liquidityPerBin * 0.5).toString(),
        value: liquidityPerBin,
      })
    }

    return {
      timestamp,
      binDistribution,
      totalValue: config.capital.initialAmount,
      tokenXBalance: (config.capital.initialAmount * 0.5).toString(),
      tokenYBalance: (config.capital.initialAmount * 0.5).toString(),
      feesEarned: {
        tokenX: '0',
        tokenY: '0',
        usdValue: 0,
      },
      metrics: {
        apr: 0,
        impermanentLoss: 0,
        utilization: 1.0,
      },
    }
  }

  /**
   * Initialize benchmark (hold) position
   */
  private initializeBenchmarkPosition(
    config: BacktestConfig,
    initialPricePoint: HistoricalPricePoint
  ): { totalValue: number; tokenXAmount: number; tokenYAmount: number } {
    // Simple 50/50 hold strategy
    const halfCapital = config.capital.initialAmount / 2
    return {
      totalValue: config.capital.initialAmount,
      tokenXAmount: halfCapital / initialPricePoint.close, // Assuming price is X/Y
      tokenYAmount: halfCapital,
    }
  }

  /**
   * Update position value based on current market conditions
   */
  private updatePositionValue(
    position: PositionSnapshot,
    pricePoint: HistoricalPricePoint
  ): PositionSnapshot {
    // Simulate fee earning (simplified)
    const feeEarningRate = 0.003 / (24 * 60) // 0.3% daily fees distributed per minute
    const newFeesUsd = position.totalValue * feeEarningRate

    // Update position value with fees and price changes
    const updatedPosition: PositionSnapshot = {
      ...position,
      timestamp: pricePoint.timestamp,
      totalValue: position.totalValue * (1 + (Math.random() - 0.5) * 0.001), // Small random drift
      feesEarned: {
        tokenX: (parseFloat(position.feesEarned.tokenX) + newFeesUsd / 2 / pricePoint.close).toString(),
        tokenY: (parseFloat(position.feesEarned.tokenY) + newFeesUsd / 2).toString(),
        usdValue: position.feesEarned.usdValue + newFeesUsd,
      },
      metrics: {
        ...position.metrics,
        apr: this.calculateCurrentAPR(position, newFeesUsd),
      },
    }

    return updatedPosition
  }

  /**
   * Update benchmark position value
   */
  private updateBenchmarkValue(
    benchmarkPosition: { totalValue: number; tokenXAmount: number; tokenYAmount: number },
    pricePoint: HistoricalPricePoint
  ): { totalValue: number; tokenXAmount: number; tokenYAmount: number } {
    // Simple hold value calculation
    const newValue = benchmarkPosition.tokenXAmount * pricePoint.close + benchmarkPosition.tokenYAmount

    return {
      ...benchmarkPosition,
      totalValue: newValue,
    }
  }

  /**
   * Evaluate if strategy wants to take action
   */
  private async evaluateStrategy(
    config: BacktestConfig,
    position: PositionSnapshot,
    pricePoint: HistoricalPricePoint,
    _historicalData: HistoricalData
  ): Promise<StrategyAction | null> {
    // Convert position to DLMMPosition format for strategy evaluation
    const mockDLMMPosition = {
      id: 'backtest-position',
      poolAddress: config.market.poolAddress,
      userAddress: new PublicKey('11111111111111111111111111111112'), // Mock address
      tokenX: { symbol: config.market.tokenXSymbol } as any,
      tokenY: { symbol: config.market.tokenYSymbol } as any,
      activeBin: position.binDistribution[0]?.binId || 1000,
      liquidityAmount: position.totalValue.toString(),
      feesEarned: {
        tokenX: position.feesEarned.tokenX,
        tokenY: position.feesEarned.tokenY,
      },
      createdAt: config.timeframe.startDate,
      lastUpdated: position.timestamp,
      isActive: true,
    }

    // Use existing strategy evaluation logic
    try {
      const strategyConfig = strategyManager.getDefaultStrategies()
        .find(s => s.id === config.strategy.id)

      if (!strategyConfig) return null

      const evaluation = await (strategyManager as any).evaluatePositionForStrategy(
        mockDLMMPosition,
        { ...strategyConfig, parameters: config.strategy.parameters }
      )

      if (evaluation && this.shouldExecuteAction(evaluation, config)) {
        return {
          timestamp: pricePoint.timestamp,
          type: this.mapActionType(evaluation.action),
          parameters: {
            reason: evaluation.reasoning,
          },
          costs: this.calculateActionCosts(evaluation, config),
          result: {
            success: true,
            newPositionValue: position.totalValue * (1 + evaluation.estimatedProfit),
          },
        }
      }
    } catch (error) {
      console.warn('Strategy evaluation error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return null
  }

  /**
   * Execute a strategy action and update position
   */
  private executeStrategyAction(
    position: PositionSnapshot,
    action: StrategyAction,
    pricePoint: HistoricalPricePoint,
    _config: BacktestConfig
  ): PositionSnapshot {
    // Apply costs and update position
    const totalCosts = action.costs.gas + action.costs.slippage + action.costs.fees
    const newTotalValue = Math.max(0, position.totalValue - totalCosts)

    return {
      ...position,
      timestamp: action.timestamp,
      totalValue: newTotalValue,
      metrics: {
        ...position.metrics,
        utilization: this.calculateUtilization(position, pricePoint),
      },
    }
  }

  /**
   * Helper methods
   */
  private validateConfig(config: BacktestConfig): void {
    if (config.timeframe.startDate >= config.timeframe.endDate) {
      throw new Error('Start date must be before end date')
    }

    if (config.capital.initialAmount <= 0) {
      throw new Error('Initial capital must be positive')
    }

    if (!config.strategy.id) {
      throw new Error('Strategy ID is required')
    }
  }

  private shouldExecuteAction(evaluation: any, config: BacktestConfig): boolean {
    // Check if action meets minimum thresholds
    if (evaluation.estimatedProfit < config.strategy.parameters.minProfitThreshold / 100) {
      return false
    }

    if (evaluation.confidence < 0.5) {
      return false
    }

    return true
  }

  private mapActionType(actionString: string): StrategyAction['type'] {
    switch (actionString) {
      case 'rebalance': return 'rebalance'
      case 'add_liquidity': return 'add_liquidity'
      case 'remove_liquidity': return 'remove_liquidity'
      default: return 'rebalance'
    }
  }

  private calculateActionCosts(evaluation: any, config: BacktestConfig): {
    gas: number
    slippage: number
    fees: number
  } {
    return {
      gas: config.costs.gasPrice,
      slippage: config.costs.slippage * evaluation.estimatedProfit,
      fees: config.costs.transactionFee,
    }
  }

  private calculateCurrentAPR(position: PositionSnapshot, newFees: number): number {
    // Simplified APR calculation based on recent fees
    const dailyFees = newFees * 24 * 60 // Convert per-minute to daily
    const annualFees = dailyFees * 365
    return position.totalValue > 0 ? annualFees / position.totalValue : 0
  }

  private calculateUtilization(_position: PositionSnapshot, _pricePoint: HistoricalPricePoint): number {
    // Simplified utilization based on how close we are to current price
    return Math.max(0.1, 1 - Math.abs(Math.random() - 0.5)) // Mock calculation
  }

  private generateSummary(result: BacktestResult): BacktestResult['summary'] {
    const { timeSeriesData, metrics } = result

    // Find best and worst periods
    let bestReturn = -Infinity
    let worstReturn = Infinity
    let bestPeriod = { start: timeSeriesData[0]?.timestamp || new Date(), end: new Date(), return: 0 }
    let worstPeriod = { start: timeSeriesData[0]?.timestamp || new Date(), end: new Date(), return: 0 }

    // Analyze 30-day rolling periods
    const windowSize = Math.min(30, Math.floor(timeSeriesData.length / 4))
    for (let i = 0; i <= timeSeriesData.length - windowSize; i++) {
      const startValue = timeSeriesData[i].portfolioValue
      const endValue = timeSeriesData[i + windowSize - 1].portfolioValue
      const periodReturn = (endValue - startValue) / startValue

      if (periodReturn > bestReturn) {
        bestReturn = periodReturn
        bestPeriod = {
          start: timeSeriesData[i].timestamp,
          end: timeSeriesData[i + windowSize - 1].timestamp,
          return: periodReturn,
        }
      }

      if (periodReturn < worstReturn) {
        worstReturn = periodReturn
        worstPeriod = {
          start: timeSeriesData[i].timestamp,
          end: timeSeriesData[i + windowSize - 1].timestamp,
          return: periodReturn,
        }
      }
    }

    // Generate insights
    const insights: string[] = []
    const recommendations: string[] = []

    if (metrics.sharpeRatio > 1) {
      insights.push(`Excellent risk-adjusted returns with Sharpe ratio of ${metrics.sharpeRatio.toFixed(2)}`)
    } else if (metrics.sharpeRatio < 0.5) {
      insights.push(`Low risk-adjusted returns (Sharpe: ${metrics.sharpeRatio.toFixed(2)}) suggest strategy needs optimization`)
    }

    if (metrics.maxDrawdown > 0.2) {
      insights.push(`High maximum drawdown of ${(metrics.maxDrawdown * 100).toFixed(1)}% indicates significant risk`)
      recommendations.push('Consider implementing stop-loss or position sizing controls')
    }

    if (metrics.winRate < 0.4) {
      insights.push(`Low win rate of ${(metrics.winRate * 100).toFixed(1)}% but strategy may still be profitable`)
      recommendations.push('Focus on risk management and let winners run')
    }

    if (metrics.rebalanceFrequency > 2) {
      insights.push(`High rebalancing frequency (${metrics.rebalanceFrequency.toFixed(1)} times/day) increases costs`)
      recommendations.push('Consider increasing rebalance thresholds to reduce transaction costs')
    }

    return {
      bestPeriod,
      worstPeriod,
      keyInsights: insights,
      recommendations,
    }
  }

  private updateProgress(
    onProgress: ((progress: BacktestProgress) => void) | undefined,
    progress: BacktestProgress
  ): void {
    onProgress?.(progress)
  }

  private estimateTimeRemaining(startTime: number, currentProgress: number): number {
    if (currentProgress <= 0) return 0
    const elapsed = (Date.now() - startTime) / 1000
    const totalEstimated = elapsed / currentProgress
    return Math.max(0, totalEstimated - elapsed)
  }

  /**
   * Cancel running backtest
   */
  cancelBacktest(): void {
    if (this.isRunning && this.abortController) {
      this.abortController.abort()
      console.log('🛑 Backtest cancelled')
    }
  }

  /**
   * Check if engine is currently running
   */
  isBacktestRunning(): boolean {
    return this.isRunning
  }
}

// Export singleton instance
export const backtestEngine = new BacktestEngine()