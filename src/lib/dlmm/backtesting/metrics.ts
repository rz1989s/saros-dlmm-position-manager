import { BacktestMetrics, TimeSeriesPoint, StrategyAction } from '@/lib/types'

export interface MetricsCalculator {
  calculateBacktestMetrics(
    timeSeriesData: TimeSeriesPoint[],
    actions: StrategyAction[],
    initialCapital: number,
    riskFreeRate?: number
  ): BacktestMetrics
}

export class BacktestMetricsCalculator implements MetricsCalculator {
  private readonly RISK_FREE_RATE = 0.05 // 5% annual risk-free rate
  private readonly DAYS_PER_YEAR = 365

  /**
   * Calculate comprehensive backtest metrics
   */
  calculateBacktestMetrics(
    timeSeriesData: TimeSeriesPoint[],
    actions: StrategyAction[],
    initialCapital: number,
    riskFreeRate: number = this.RISK_FREE_RATE
  ): BacktestMetrics {
    if (timeSeriesData.length === 0) {
      return this.createEmptyMetrics()
    }

    console.log(`📊 Calculating metrics for ${timeSeriesData.length} data points and ${actions.length} actions`)

    const returns = this.calculateReturns(timeSeriesData)
    const benchmarkReturns = this.calculateBenchmarkReturns(timeSeriesData)

    // Return metrics
    const totalReturn = this.calculateTotalReturn(timeSeriesData, initialCapital)
    const annualizedReturn = this.calculateAnnualizedReturn(returns, timeSeriesData)
    const benchmarkReturn = this.calculateBenchmarkReturn(benchmarkReturns, initialCapital)
    const excessReturn = annualizedReturn - benchmarkReturn

    // Risk metrics
    const volatility = this.calculateVolatility(returns)
    const sharpeRatio = this.calculateSharpeRatio(returns, riskFreeRate)
    const sortinoRatio = this.calculateSortinoRatio(returns, riskFreeRate)
    const maxDrawdownData = this.calculateMaxDrawdown(timeSeriesData)

    // Trading metrics
    const tradingMetrics = this.calculateTradingMetrics(actions)

    // Cost metrics
    const costMetrics = this.calculateCostMetrics(actions, totalReturn)

    // DLMM-specific metrics
    const dlmmMetrics = this.calculateDLMMMetrics(timeSeriesData, actions)

    return {
      // Return metrics
      totalReturn,
      annualizedReturn,
      benchmarkReturn,
      excessReturn,

      // Risk metrics
      volatility,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown: maxDrawdownData.maxDrawdown,
      maxDrawdownDuration: maxDrawdownData.maxDrawdownDuration,

      // Trading metrics
      totalTrades: tradingMetrics.totalTrades,
      profitableTrades: tradingMetrics.profitableTrades,
      winRate: tradingMetrics.winRate,
      profitFactor: tradingMetrics.profitFactor,
      avgTradeReturn: tradingMetrics.avgTradeReturn,
      largestWin: tradingMetrics.largestWin,
      largestLoss: tradingMetrics.largestLoss,

      // Cost metrics
      totalFees: costMetrics.totalFees,
      totalGas: costMetrics.totalGas,
      totalSlippage: costMetrics.totalSlippage,
      costToReturn: costMetrics.costToReturn,

      // DLMM-specific metrics
      totalFeesEarned: dlmmMetrics.totalFeesEarned,
      avgApr: dlmmMetrics.avgApr,
      liquidityUtilization: dlmmMetrics.liquidityUtilization,
      rebalanceFrequency: dlmmMetrics.rebalanceFrequency,
      impermanentLossRecovery: dlmmMetrics.impermanentLossRecovery,
    }
  }

  /**
   * Calculate period-over-period returns
   */
  private calculateReturns(timeSeriesData: TimeSeriesPoint[]): number[] {
    const returns: number[] = []

    for (let i = 1; i < timeSeriesData.length; i++) {
      const previousValue = timeSeriesData[i - 1].portfolioValue
      const currentValue = timeSeriesData[i].portfolioValue

      if (previousValue > 0) {
        const periodReturn = (currentValue - previousValue) / previousValue
        returns.push(periodReturn)
      }
    }

    return returns
  }

  /**
   * Calculate benchmark (hold strategy) returns
   */
  private calculateBenchmarkReturns(timeSeriesData: TimeSeriesPoint[]): number[] {
    const returns: number[] = []

    for (let i = 1; i < timeSeriesData.length; i++) {
      const previousValue = timeSeriesData[i - 1].benchmarkValue
      const currentValue = timeSeriesData[i].benchmarkValue

      if (previousValue > 0) {
        const periodReturn = (currentValue - previousValue) / previousValue
        returns.push(periodReturn)
      }
    }

    return returns
  }

  /**
   * Calculate total return percentage
   */
  private calculateTotalReturn(timeSeriesData: TimeSeriesPoint[], initialCapital: number): number {
    if (timeSeriesData.length === 0) return 0

    const finalValue = timeSeriesData[timeSeriesData.length - 1].portfolioValue
    return (finalValue - initialCapital) / initialCapital
  }

  /**
   * Calculate annualized return
   */
  private calculateAnnualizedReturn(returns: number[], timeSeriesData: TimeSeriesPoint[]): number {
    if (returns.length === 0 || timeSeriesData.length < 2) return 0

    const totalReturn = this.calculateCompoundReturn(returns)
    const daysDiff = this.calculateDaysDifference(
      timeSeriesData[0].timestamp,
      timeSeriesData[timeSeriesData.length - 1].timestamp
    )

    if (daysDiff <= 0) return 0

    return Math.pow(1 + totalReturn, this.DAYS_PER_YEAR / daysDiff) - 1
  }

  /**
   * Calculate benchmark total return
   */
  private calculateBenchmarkReturn(benchmarkReturns: number[], _initialCapital: number): number {
    return this.calculateCompoundReturn(benchmarkReturns)
  }

  /**
   * Calculate portfolio volatility (annualized)
   */
  private calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1)

    // Annualize volatility (assuming daily returns)
    return Math.sqrt(variance * this.DAYS_PER_YEAR)
  }

  /**
   * Calculate Sharpe Ratio
   */
  private calculateSharpeRatio(returns: number[], riskFreeRate: number): number {
    if (returns.length === 0) return 0

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const volatility = this.calculateVolatility(returns)

    if (volatility === 0) return 0

    // Convert risk-free rate to period return
    const periodRiskFreeRate = riskFreeRate / this.DAYS_PER_YEAR
    return (avgReturn - periodRiskFreeRate) / (volatility / Math.sqrt(this.DAYS_PER_YEAR))
  }

  /**
   * Calculate Sortino Ratio (downside deviation only)
   */
  private calculateSortinoRatio(returns: number[], riskFreeRate: number): number {
    if (returns.length === 0) return 0

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const downwardReturns = returns.filter(r => r < 0)

    if (downwardReturns.length === 0) return Infinity

    const downwardVariance = downwardReturns.reduce((sum, r) => sum + r * r, 0) / returns.length
    const downwardDeviation = Math.sqrt(downwardVariance * this.DAYS_PER_YEAR)

    if (downwardDeviation === 0) return Infinity

    const periodRiskFreeRate = riskFreeRate / this.DAYS_PER_YEAR
    return (avgReturn - periodRiskFreeRate) / downwardDeviation
  }

  /**
   * Calculate maximum drawdown and its duration
   */
  private calculateMaxDrawdown(timeSeriesData: TimeSeriesPoint[]): {
    maxDrawdown: number
    maxDrawdownDuration: number
  } {
    if (timeSeriesData.length === 0) return { maxDrawdown: 0, maxDrawdownDuration: 0 }

    let maxDrawdown = 0
    let maxDrawdownDuration = 0
    let peak = timeSeriesData[0].portfolioValue
    let drawdownStart = 0

    for (let i = 0; i < timeSeriesData.length; i++) {
      const currentValue = timeSeriesData[i].portfolioValue

      if (currentValue > peak) {
        peak = currentValue
        drawdownStart = i
      } else {
        const drawdown = (peak - currentValue) / peak
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown
          maxDrawdownDuration = this.calculateDaysDifference(
            timeSeriesData[drawdownStart].timestamp,
            timeSeriesData[i].timestamp
          )
        }
      }
    }

    return { maxDrawdown, maxDrawdownDuration }
  }

  /**
   * Calculate trading performance metrics
   */
  private calculateTradingMetrics(actions: StrategyAction[]): {
    totalTrades: number
    profitableTrades: number
    winRate: number
    profitFactor: number
    avgTradeReturn: number
    largestWin: number
    largestLoss: number
  } {
    const trades = actions.filter(action =>
      action.type === 'rebalance' && action.result.success
    )

    if (trades.length === 0) {
      return {
        totalTrades: 0,
        profitableTrades: 0,
        winRate: 0,
        profitFactor: 0,
        avgTradeReturn: 0,
        largestWin: 0,
        largestLoss: 0,
      }
    }

    let totalReturn = 0
    let grossProfit = 0
    let grossLoss = 0
    let profitableTrades = 0
    let largestWin = 0
    let largestLoss = 0

    // Simulate trade returns based on value changes
    for (let i = 1; i < trades.length; i++) {
      const prevValue = trades[i - 1].result.newPositionValue
      const currentValue = trades[i].result.newPositionValue
      const tradeReturn = (currentValue - prevValue) / prevValue

      totalReturn += tradeReturn

      if (tradeReturn > 0) {
        grossProfit += tradeReturn
        profitableTrades++
        largestWin = Math.max(largestWin, tradeReturn)
      } else {
        grossLoss += Math.abs(tradeReturn)
        largestLoss = Math.min(largestLoss, tradeReturn)
      }
    }

    const winRate = profitableTrades / trades.length
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit
    const avgTradeReturn = totalReturn / trades.length

    return {
      totalTrades: trades.length,
      profitableTrades,
      winRate,
      profitFactor,
      avgTradeReturn,
      largestWin,
      largestLoss,
    }
  }

  /**
   * Calculate cost-related metrics
   */
  private calculateCostMetrics(actions: StrategyAction[], totalReturn: number): {
    totalFees: number
    totalGas: number
    totalSlippage: number
    costToReturn: number
  } {
    let totalFees = 0
    let totalGas = 0
    let totalSlippage = 0

    for (const action of actions) {
      totalFees += action.costs.fees
      totalGas += action.costs.gas
      totalSlippage += action.costs.slippage
    }

    const totalCosts = totalFees + totalGas + totalSlippage
    const costToReturn = totalReturn !== 0 ? totalCosts / Math.abs(totalReturn) : 0

    return {
      totalFees,
      totalGas,
      totalSlippage,
      costToReturn,
    }
  }

  /**
   * Calculate DLMM-specific metrics
   */
  private calculateDLMMMetrics(
    timeSeriesData: TimeSeriesPoint[],
    actions: StrategyAction[]
  ): {
    totalFeesEarned: number
    avgApr: number
    liquidityUtilization: number
    rebalanceFrequency: number
    impermanentLossRecovery: number
  } {
    let totalFeesEarned = 0
    let totalApr = 0
    let aprCount = 0
    let totalUtilization = 0

    // Calculate fees earned and utilization from time series
    for (const point of timeSeriesData) {
      totalFeesEarned += point.position.feesEarned.usdValue

      if (point.position.metrics.apr > 0) {
        totalApr += point.position.metrics.apr
        aprCount++
      }

      totalUtilization += point.position.metrics.utilization
    }

    const avgApr = aprCount > 0 ? totalApr / aprCount : 0
    const liquidityUtilization = timeSeriesData.length > 0 ? totalUtilization / timeSeriesData.length : 0

    // Calculate rebalance frequency (rebalances per day)
    const rebalanceActions = actions.filter(action => action.type === 'rebalance')
    const daysDiff = timeSeriesData.length > 0 ? this.calculateDaysDifference(
      timeSeriesData[0].timestamp,
      timeSeriesData[timeSeriesData.length - 1].timestamp
    ) : 0
    const rebalanceFrequency = daysDiff > 0 ? rebalanceActions.length / daysDiff : 0

    // Simplified impermanent loss recovery calculation
    // This would be more sophisticated in a real implementation
    const impermanentLossRecovery = totalFeesEarned > 0 ? Math.min(totalFeesEarned / 1000, 1) : 0

    return {
      totalFeesEarned,
      avgApr,
      liquidityUtilization,
      rebalanceFrequency,
      impermanentLossRecovery,
    }
  }

  /**
   * Helper: Calculate compound return from period returns
   */
  private calculateCompoundReturn(returns: number[]): number {
    return returns.reduce((compound, r) => compound * (1 + r), 1) - 1
  }

  /**
   * Helper: Calculate days difference between two dates
   */
  private calculateDaysDifference(startDate: Date, endDate: Date): number {
    return Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  /**
   * Create empty metrics for edge cases
   */
  private createEmptyMetrics(): BacktestMetrics {
    return {
      totalReturn: 0,
      annualizedReturn: 0,
      benchmarkReturn: 0,
      excessReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      maxDrawdown: 0,
      maxDrawdownDuration: 0,
      totalTrades: 0,
      profitableTrades: 0,
      winRate: 0,
      profitFactor: 0,
      avgTradeReturn: 0,
      largestWin: 0,
      largestLoss: 0,
      totalFees: 0,
      totalGas: 0,
      totalSlippage: 0,
      costToReturn: 0,
      totalFeesEarned: 0,
      avgApr: 0,
      liquidityUtilization: 0,
      rebalanceFrequency: 0,
      impermanentLossRecovery: 0,
    }
  }

  /**
   * Validate metrics for reasonableness
   */
  validateMetrics(metrics: BacktestMetrics): {
    isValid: boolean
    warnings: string[]
    errors: string[]
  } {
    const warnings: string[] = []
    const errors: string[] = []

    // Check for unreasonable values
    if (Math.abs(metrics.totalReturn) > 10) { // 1000% return
      warnings.push(`Extreme total return: ${(metrics.totalReturn * 100).toFixed(1)}%`)
    }

    if (metrics.sharpeRatio > 5) {
      warnings.push(`Very high Sharpe ratio: ${metrics.sharpeRatio.toFixed(2)}`)
    }

    if (metrics.maxDrawdown > 0.95) {
      warnings.push(`Extreme drawdown: ${(metrics.maxDrawdown * 100).toFixed(1)}%`)
    }

    // Check for invalid values
    if (isNaN(metrics.totalReturn) || !isFinite(metrics.totalReturn)) {
      errors.push('Invalid total return value')
    }

    if (isNaN(metrics.volatility) || metrics.volatility < 0) {
      errors.push('Invalid volatility value')
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    }
  }
}

// Export singleton instance
export const metricsCalculator = new BacktestMetricsCalculator()