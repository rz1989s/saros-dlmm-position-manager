// Main backtesting module exports
export { BacktestEngine, backtestEngine } from './engine'
export { HistoricalDataService, historicalDataService } from './historical-data'
export { BacktestMetricsCalculator, metricsCalculator } from './metrics'

// Re-export types for convenience
export type {
  BacktestConfig,
  BacktestResult,
  BacktestMetrics,
  HistoricalData,
  HistoricalPricePoint,
  HistoricalLiquidityPoint,
  TimeSeriesPoint,
  StrategyAction,
  PositionSnapshot,
  StrategyComparison,
  BacktestOptimization,
} from '@/lib/types'

// Utility functions for backtesting
export class BacktestUtils {
  /**
   * Generate a default backtest configuration
   */
  static createDefaultConfig(): Partial<BacktestConfig> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

    return {
      timeframe: {
        startDate,
        endDate,
        interval: '1h',
      },
      capital: {
        initialAmount: 1000,
        currency: 'USD',
      },
      costs: {
        gasPrice: 0.001,
        slippage: 0.005,
        transactionFee: 0.25,
      },
      rebalancing: {
        frequency: 'immediate',
        minThreshold: 0.02,
      },
    }
  }

  /**
   * Validate a backtest configuration
   */
  static validateConfig(config: BacktestConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (config.timeframe.startDate >= config.timeframe.endDate) {
      errors.push('Start date must be before end date')
    }

    if (config.capital.initialAmount <= 0) {
      errors.push('Initial capital must be positive')
    }

    if (!config.strategy.id) {
      errors.push('Strategy ID is required')
    }

    if (config.costs.gasPrice < 0) {
      errors.push('Gas price cannot be negative')
    }

    if (config.costs.slippage < 0 || config.costs.slippage > 1) {
      errors.push('Slippage must be between 0 and 1')
    }

    const daysDiff = (config.timeframe.endDate.getTime() - config.timeframe.startDate.getTime()) / (1000 * 60 * 60 * 24)
    if (daysDiff > 365) {
      errors.push('Backtest period cannot exceed 1 year')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Generate a unique ID for backtests
   */
  static generateId(): string {
    return `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Format metrics for display
   */
  static formatMetricsForDisplay(metrics: BacktestMetrics): Record<string, string> {
    return {
      'Total Return': `${(metrics.totalReturn * 100).toFixed(2)}%`,
      'Annualized Return': `${(metrics.annualizedReturn * 100).toFixed(2)}%`,
      'Sharpe Ratio': metrics.sharpeRatio.toFixed(2),
      'Max Drawdown': `${(metrics.maxDrawdown * 100).toFixed(2)}%`,
      'Win Rate': `${(metrics.winRate * 100).toFixed(1)}%`,
      'Total Trades': metrics.totalTrades.toString(),
      'Fees Earned': `$${metrics.totalFeesEarned.toFixed(2)}`,
      'Average APR': `${(metrics.avgApr * 100).toFixed(1)}%`,
    }
  }

  /**
   * Calculate time to run backtest estimate
   */
  static estimateBacktestDuration(config: BacktestConfig): number {
    const daysDiff = (config.timeframe.endDate.getTime() - config.timeframe.startDate.getTime()) / (1000 * 60 * 60 * 24)

    const intervalMultipliers = {
      '1m': 1440,
      '5m': 288,
      '15m': 96,
      '1h': 24,
      '4h': 6,
      '1d': 1,
    }

    const dataPoints = daysDiff * intervalMultipliers[config.timeframe.interval]

    // Rough estimate: 10ms per data point + overhead
    return Math.max(1, Math.floor((dataPoints * 10 + 2000) / 1000)) // seconds
  }

  /**
   * Compare two backtest results
   */
  static compareBacktests(result1: BacktestResult, result2: BacktestResult): {
    winner: 'first' | 'second' | 'tie'
    comparison: Array<{
      metric: string
      first: number
      second: number
      difference: number
      winner: 'first' | 'second' | 'tie'
    }>
  } {
    const metrics: Array<keyof BacktestMetrics> = [
      'totalReturn',
      'sharpeRatio',
      'maxDrawdown',
      'winRate',
      'avgApr',
    ]

    const comparison = metrics.map(metric => {
      const first = result1.metrics[metric]
      const second = result2.metrics[metric]
      const difference = first - second

      let winner: 'first' | 'second' | 'tie'
      if (metric === 'maxDrawdown') {
        // Lower is better for drawdown
        winner = first < second ? 'first' : (first > second ? 'second' : 'tie')
      } else {
        // Higher is better for other metrics
        winner = first > second ? 'first' : (first < second ? 'second' : 'tie')
      }

      return {
        metric: metric.toString(),
        first,
        second,
        difference,
        winner,
      }
    })

    // Determine overall winner based on Sharpe ratio and total return
    const sharpeComparison = comparison.find(c => c.metric === 'sharpeRatio')
    const returnComparison = comparison.find(c => c.metric === 'totalReturn')

    let winner: 'first' | 'second' | 'tie' = 'tie'
    if (sharpeComparison && returnComparison) {
      if (sharpeComparison.winner === returnComparison.winner) {
        winner = sharpeComparison.winner
      } else {
        // Prioritize Sharpe ratio for risk-adjusted performance
        winner = sharpeComparison.winner
      }
    }

    return { winner, comparison }
  }
}