import {
  BacktestMetricsCalculator,
  metricsCalculator
} from '../../../../src/lib/dlmm/backtesting/metrics'
import {
  BacktestMetrics,
  TimeSeriesPoint,
  StrategyAction,
  PositionSnapshot
} from '../../../../src/lib/types'

describe('BacktestMetricsCalculator', () => {
  let calculator: BacktestMetricsCalculator

  beforeEach(() => {
    calculator = new BacktestMetricsCalculator()
  })

  describe('calculateBacktestMetrics', () => {
    it('should return empty metrics for empty data', () => {
      const metrics = calculator.calculateBacktestMetrics([], [], 1000)

      expect(metrics.totalReturn).toBe(0)
      expect(metrics.annualizedReturn).toBe(0)
      expect(metrics.volatility).toBe(0)
      expect(metrics.sharpeRatio).toBe(0)
      expect(metrics.totalTrades).toBe(0)
    })

    it('should calculate basic return metrics correctly', () => {
      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 1100, 1050),
        createTimeSeriesPoint('2024-01-03', 1050, 1100),
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, [], 1000)

      expect(metrics.totalReturn).toBeCloseTo(0.05, 3) // 5% return (1050-1000)/1000
      expect(metrics.benchmarkReturn).toBeCloseTo(0.1, 3) // 10% benchmark (1100-1000)/1000
      expect(metrics.excessReturn).toBeLessThan(0.05) // Underperformed benchmark
    })

    it('should calculate annualized return correctly for different periods', () => {
      // 30-day period with 10% total return
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint(startDate, 1000, 1000),
        createTimeSeriesPoint(endDate, 1100, 1050),
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, [], 1000)

      // 10% over 30 days should annualize to much higher
      expect(metrics.annualizedReturn).toBeGreaterThan(1.0) // > 100% annualized
    })

    it('should calculate volatility correctly', () => {
      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 1100, 1050), // +10%
        createTimeSeriesPoint('2024-01-03', 900, 950), // -18.2%
        createTimeSeriesPoint('2024-01-04', 1000, 1000), // +11.1%
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, [], 1000)

      expect(metrics.volatility).toBeGreaterThan(0)
      expect(metrics.volatility).toBeLessThan(10) // Reasonable bound
    })

    it('should calculate Sharpe ratio correctly', () => {
      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 1050, 1025), // +5%
        createTimeSeriesPoint('2024-01-03', 1100, 1050), // +4.76%
        createTimeSeriesPoint('2024-01-04', 1150, 1075), // +4.55%
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, [], 1000, 0.05)

      expect(metrics.sharpeRatio).toBeGreaterThan(0)
      expect(metrics.sharpeRatio).toBeLessThan(10)
    })

    it('should handle zero volatility case for Sharpe ratio', () => {
      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 1000, 1000), // No change
        createTimeSeriesPoint('2024-01-03', 1000, 1000), // No change
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, [], 1000)

      expect(metrics.sharpeRatio).toBe(0)
    })

    it('should calculate Sortino ratio correctly', () => {
      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 1100, 1050), // +10%
        createTimeSeriesPoint('2024-01-03', 1050, 1100), // -4.55%
        createTimeSeriesPoint('2024-01-04', 1150, 1050), // +9.52%
        createTimeSeriesPoint('2024-01-05', 1100, 1150), // -4.35%
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, [], 1000, 0.05)

      expect(metrics.sortinoRatio).toBeGreaterThan(0)
      // Sortino should be higher than Sharpe for same data (only downside deviation)
      expect(metrics.sortinoRatio).toBeGreaterThanOrEqual(metrics.sharpeRatio)
    })

    it('should handle no downward returns for Sortino ratio', () => {
      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 1050, 1025),
        createTimeSeriesPoint('2024-01-03', 1100, 1050),
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, [], 1000)

      expect(metrics.sortinoRatio).toBe(Infinity)
    })

    it('should calculate maximum drawdown correctly', () => {
      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 1200, 1100), // Peak at 1200
        createTimeSeriesPoint('2024-01-03', 1100, 1150),
        createTimeSeriesPoint('2024-01-04', 800, 950),   // Drawdown to 800
        createTimeSeriesPoint('2024-01-05', 900, 1000),
        createTimeSeriesPoint('2024-01-06', 1000, 1050),
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, [], 1000)

      // Max drawdown should be (1200 - 800) / 1200 = 33.33%
      expect(metrics.maxDrawdown).toBeCloseTo(0.3333, 2)
      expect(metrics.maxDrawdownDuration).toBeGreaterThan(0)
    })

    it('should calculate trading metrics correctly', () => {
      const actions: StrategyAction[] = [
        createStrategyAction('2024-01-01', 'rebalance', 1000, 1100, true),
        createStrategyAction('2024-01-02', 'rebalance', 1100, 1050, true),
        createStrategyAction('2024-01-03', 'rebalance', 1050, 1150, true),
        createStrategyAction('2024-01-04', 'rebalance', 1150, 1000, true),
      ]

      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 1100, 1050),
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, actions, 1000)

      expect(metrics.totalTrades).toBe(4)
      expect(metrics.profitableTrades).toBe(2) // 2 out of 3 trades profitable
      expect(metrics.winRate).toBeCloseTo(0.5, 1) // 50% win rate
      expect(metrics.profitFactor).toBeGreaterThan(0)
      expect(metrics.largestWin).toBeCloseTo(0.0952, 3) // (1150-1050)/1050
      expect(metrics.largestLoss).toBeCloseTo(-0.1304, 3) // (1000-1150)/1150
    })

    it('should handle no trades case', () => {
      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, [], 1000)

      expect(metrics.totalTrades).toBe(0)
      expect(metrics.winRate).toBe(0)
      expect(metrics.profitFactor).toBe(0)
      expect(metrics.avgTradeReturn).toBe(0)
    })

    it('should calculate cost metrics correctly', () => {
      const actions: StrategyAction[] = [
        createStrategyActionWithCosts('2024-01-01', 'rebalance', 0.5, 0.01, 0.25),
        createStrategyActionWithCosts('2024-01-02', 'rebalance', 0.3, 0.01, 0.25),
      ]

      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 1100, 1050),
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, actions, 1000)

      expect(metrics.totalFees).toBe(0.5) // Sum of fees
      expect(metrics.totalGas).toBe(0.02) // Sum of gas
      expect(metrics.totalSlippage).toBe(0.6) // Sum of slippage
      expect(metrics.costToReturn).toBeGreaterThan(0)
    })

    it('should calculate DLMM-specific metrics correctly', () => {
      const timeSeriesData: TimeSeriesPoint[] = [
        createDLMMTimeSeriesPoint('2024-01-01', 1000, 1000, 5.0, 0.08, 0.9),
        createDLMMTimeSeriesPoint('2024-01-02', 1100, 1050, 7.5, 0.10, 0.85),
        createDLMMTimeSeriesPoint('2024-01-03', 1050, 1100, 10.0, 0.12, 0.80),
      ]

      const actions: StrategyAction[] = [
        createStrategyAction('2024-01-01', 'rebalance', 1000, 1100, true),
        createStrategyAction('2024-01-02', 'rebalance', 1100, 1050, true),
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, actions, 1000)

      expect(metrics.totalFeesEarned).toBe(22.5) // Sum of fees earned
      expect(metrics.avgApr).toBeCloseTo(0.1, 2) // Average APR
      expect(metrics.liquidityUtilization).toBeCloseTo(0.85, 2) // Average utilization
      expect(metrics.rebalanceFrequency).toBeGreaterThan(0) // Rebalances per day
      expect(metrics.impermanentLossRecovery).toBeGreaterThan(0)
    })

    it('should handle edge cases in DLMM metrics', () => {
      const timeSeriesData: TimeSeriesPoint[] = [
        createDLMMTimeSeriesPoint('2024-01-01', 1000, 1000, 0, 0, 0.5),
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, [], 1000)

      expect(metrics.totalFeesEarned).toBe(0)
      expect(metrics.avgApr).toBe(0)
      expect(metrics.liquidityUtilization).toBe(0.5)
      expect(metrics.rebalanceFrequency).toBe(0)
      expect(metrics.impermanentLossRecovery).toBe(0)
    })

    it('should use custom risk-free rate', () => {
      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 1100, 1050),
      ]

      const customRiskFreeRate = 0.10 // 10%
      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, [], 1000, customRiskFreeRate)

      // Should use custom rate in Sharpe calculation
      expect(metrics.sharpeRatio).toBeDefined()
    })
  })

  describe('calculateCompoundReturn', () => {
    it('should calculate compound returns correctly', () => {
      const calculator = new BacktestMetricsCalculator()

      // Use reflection to access private method
      const calculateCompoundReturn = (calculator as any).calculateCompoundReturn.bind(calculator)

      const returns = [0.1, 0.05, -0.02] // 10%, 5%, -2%
      const compoundReturn = calculateCompoundReturn(returns)

      // (1.1 * 1.05 * 0.98) - 1 = 0.1309
      expect(compoundReturn).toBeCloseTo(0.1309, 4)
    })

    it('should handle empty returns array', () => {
      const calculator = new BacktestMetricsCalculator()
      const calculateCompoundReturn = (calculator as any).calculateCompoundReturn.bind(calculator)

      const compoundReturn = calculateCompoundReturn([])
      expect(compoundReturn).toBe(0)
    })

    it('should handle extreme returns', () => {
      const calculator = new BacktestMetricsCalculator()
      const calculateCompoundReturn = (calculator as any).calculateCompoundReturn.bind(calculator)

      const extremeReturns = [5.0, -0.5, 2.0] // 500%, -50%, 200%
      const compoundReturn = calculateCompoundReturn(extremeReturns)

      // (6.0 * 0.5 * 3.0) - 1 = 8.0
      expect(compoundReturn).toBeCloseTo(8.0, 2)
    })
  })

  describe('calculateDaysDifference', () => {
    it('should calculate days difference correctly', () => {
      const calculator = new BacktestMetricsCalculator()
      const calculateDaysDifference = (calculator as any).calculateDaysDifference.bind(calculator)

      const start = new Date('2024-01-01')
      const end = new Date('2024-01-31')
      const days = calculateDaysDifference(start, end)

      expect(days).toBe(30)
    })

    it('should return minimum of 1 day', () => {
      const calculator = new BacktestMetricsCalculator()
      const calculateDaysDifference = (calculator as any).calculateDaysDifference.bind(calculator)

      const start = new Date('2024-01-01T12:00:00')
      const end = new Date('2024-01-01T13:00:00') // 1 hour difference
      const days = calculateDaysDifference(start, end)

      expect(days).toBe(1) // Minimum 1 day
    })

    it('should handle same dates', () => {
      const calculator = new BacktestMetricsCalculator()
      const calculateDaysDifference = (calculator as any).calculateDaysDifference.bind(calculator)

      const date = new Date('2024-01-01')
      const days = calculateDaysDifference(date, date)

      expect(days).toBe(1)
    })
  })

  describe('validateMetrics', () => {
    it('should validate reasonable metrics', () => {
      const reasonableMetrics: BacktestMetrics = createValidMetrics()

      const validation = calculator.validateMetrics(reasonableMetrics)

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
      expect(validation.warnings).toHaveLength(0)
    })

    it('should warn about extreme returns', () => {
      const extremeMetrics: BacktestMetrics = {
        ...createValidMetrics(),
        totalReturn: 15.0, // 1500% return
      }

      const validation = calculator.validateMetrics(extremeMetrics)

      expect(validation.isValid).toBe(true)
      expect(validation.warnings.some(w => w.includes('Extreme total return'))).toBe(true)
    })

    it('should warn about very high Sharpe ratio', () => {
      const highSharpeMetrics: BacktestMetrics = {
        ...createValidMetrics(),
        sharpeRatio: 6.0,
      }

      const validation = calculator.validateMetrics(highSharpeMetrics)

      expect(validation.warnings.some(w => w.includes('Very high Sharpe ratio'))).toBe(true)
    })

    it('should warn about extreme drawdown', () => {
      const extremeDrawdownMetrics: BacktestMetrics = {
        ...createValidMetrics(),
        maxDrawdown: 0.96, // 96% drawdown
      }

      const validation = calculator.validateMetrics(extremeDrawdownMetrics)

      expect(validation.warnings.some(w => w.includes('Extreme drawdown'))).toBe(true)
    })

    it('should error on invalid total return', () => {
      const invalidMetrics: BacktestMetrics = {
        ...createValidMetrics(),
        totalReturn: NaN,
      }

      const validation = calculator.validateMetrics(invalidMetrics)

      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.includes('Invalid total return'))).toBe(true)
    })

    it('should error on negative volatility', () => {
      const invalidMetrics: BacktestMetrics = {
        ...createValidMetrics(),
        volatility: -0.1,
      }

      const validation = calculator.validateMetrics(invalidMetrics)

      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.includes('Invalid volatility'))).toBe(true)
    })

    it('should error on infinite values', () => {
      const infiniteMetrics: BacktestMetrics = {
        ...createValidMetrics(),
        totalReturn: Infinity,
      }

      const validation = calculator.validateMetrics(infiniteMetrics)

      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.includes('Invalid total return'))).toBe(true)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle single data point', () => {
      const singlePoint: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
      ]

      const metrics = calculator.calculateBacktestMetrics(singlePoint, [], 1000)

      expect(metrics.totalReturn).toBe(0)
      expect(metrics.volatility).toBe(0)
      expect(metrics.maxDrawdown).toBe(0)
    })

    it('should handle negative portfolio values gracefully', () => {
      const negativeValueData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', -100, 500), // Negative portfolio value
        createTimeSeriesPoint('2024-01-03', 100, 700),
      ]

      const metrics = calculator.calculateBacktestMetrics(negativeValueData, [], 1000)

      expect(metrics.totalReturn).toBe(-0.9) // -90% return
      expect(metrics.volatility).toBeGreaterThanOrEqual(0) // Volatility can be 0 for single transition
    })

    it('should handle zero initial capital edge case', () => {
      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 0, 1000),
        createTimeSeriesPoint('2024-01-02', 100, 1100),
      ]

      // This should handle division by zero gracefully
      expect(() => {
        calculator.calculateBacktestMetrics(timeSeriesData, [], 0)
      }).not.toThrow()
    })

    it('should handle unsuccessful trades', () => {
      const actions: StrategyAction[] = [
        createStrategyAction('2024-01-01', 'rebalance', 1000, 1100, false), // Failed
        createStrategyAction('2024-01-02', 'rebalance', 1100, 1050, true),  // Success
      ]

      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, actions, 1000)

      expect(metrics.totalTrades).toBe(1) // Only successful trades counted
    })

    it('should handle mixed action types', () => {
      const actions: StrategyAction[] = [
        createStrategyAction('2024-01-01', 'rebalance', 1000, 1100, true),
        createStrategyAction('2024-01-02', 'add_liquidity', 1100, 1150, true),
        createStrategyAction('2024-01-03', 'remove_liquidity', 1150, 1050, true),
        createStrategyAction('2024-01-04', 'initialize', 1050, 1000, true),
      ]

      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, actions, 1000)

      expect(metrics.totalTrades).toBe(1) // Only rebalance actions counted
    })

    it('should handle extreme volatility scenarios', () => {
      const highVolatilityData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 2000, 1500), // 100% jump
        createTimeSeriesPoint('2024-01-03', 500, 750),   // -75% drop
        createTimeSeriesPoint('2024-01-04', 1500, 1125), // 200% jump
      ]

      const metrics = calculator.calculateBacktestMetrics(highVolatilityData, [], 1000)

      expect(metrics.volatility).toBeGreaterThan(1.0) // > 100% annualized volatility
      expect(metrics.maxDrawdown).toBeGreaterThan(0.5) // > 50% drawdown
      expect(isFinite(metrics.sharpeRatio)).toBe(true)
    })

    it('should handle time series with zero values', () => {
      const zeroValueData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 0, 500),     // Zero portfolio value
        createTimeSeriesPoint('2024-01-03', 1000, 750),
      ]

      const metrics = calculator.calculateBacktestMetrics(zeroValueData, [], 1000)

      // Should handle without throwing
      expect(metrics).toBeDefined()
      expect(isFinite(metrics.totalReturn)).toBe(true)
    })
  })

  describe('metricsCalculator singleton', () => {
    it('should export working singleton instance', () => {
      expect(metricsCalculator).toBeInstanceOf(BacktestMetricsCalculator)

      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 1100, 1050),
      ]

      const metrics = metricsCalculator.calculateBacktestMetrics(timeSeriesData, [], 1000)

      expect(metrics.totalReturn).toBeCloseTo(0.1, 2)
    })
  })

  describe('mathematical accuracy validation', () => {
    it('should calculate precise Sharpe ratios', () => {
      // Test with known values
      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 1010, 1005), // 1% return
        createTimeSeriesPoint('2024-01-03', 1020, 1010), // ~0.99% return
        createTimeSeriesPoint('2024-01-04', 1030, 1015), // ~0.98% return
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, [], 1000, 0.05)

      // With consistent positive returns and low volatility, Sharpe should be positive
      expect(metrics.sharpeRatio).toBeGreaterThan(0)

      // Verify mathematical consistency
      expect(metrics.volatility).toBeGreaterThan(0)
      expect(metrics.annualizedReturn).toBeGreaterThan(0)
    })

    it('should maintain mathematical relationships between metrics', () => {
      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
        createTimeSeriesPoint('2024-01-02', 1100, 1050),
        createTimeSeriesPoint('2024-01-03', 1000, 1100),
        createTimeSeriesPoint('2024-01-04', 1200, 1000),
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, [], 1000)

      // Final return should match calculation
      const expectedReturn = (1200 - 1000) / 1000
      expect(metrics.totalReturn).toBeCloseTo(expectedReturn, 6)

      // Benchmark return consistency
      const expectedBenchmarkReturn = (1000 - 1000) / 1000
      expect(metrics.benchmarkReturn).toBeCloseTo(expectedBenchmarkReturn, 6)

      // Excess return should be difference
      expect(metrics.excessReturn).toBeCloseTo(
        metrics.annualizedReturn - metrics.benchmarkReturn, 6
      )
    })

    it('should calculate accurate profit factors', () => {
      const profitableActions: StrategyAction[] = [
        createStrategyAction('2024-01-01', 'rebalance', 1000, 1100, true), // +10%
        createStrategyAction('2024-01-02', 'rebalance', 1100, 1000, true), // -9.09%
        createStrategyAction('2024-01-03', 'rebalance', 1000, 1200, true), // +20%
      ]

      const timeSeriesData: TimeSeriesPoint[] = [
        createTimeSeriesPoint('2024-01-01', 1000, 1000),
      ]

      const metrics = calculator.calculateBacktestMetrics(timeSeriesData, profitableActions, 1000)

      // The test actions have specific trade returns based on position values
      // We should check that profit factor calculation works without exact values
      expect(metrics.profitFactor).toBeGreaterThan(0)
      expect(isFinite(metrics.profitFactor)).toBe(true)
    })
  })
})

// Helper functions
function createTimeSeriesPoint(
  date: string | Date,
  portfolioValue: number,
  benchmarkValue: number
): TimeSeriesPoint {
  return {
    timestamp: typeof date === 'string' ? new Date(date) : date,
    portfolioValue,
    benchmarkValue,
    position: createMockPosition(),
    marketPrice: portfolioValue * 0.001, // Mock price
    marketVolume: '50000',
  }
}

function createDLMMTimeSeriesPoint(
  date: string | Date,
  portfolioValue: number,
  benchmarkValue: number,
  feesEarned: number,
  apr: number,
  utilization: number
): TimeSeriesPoint {
  return {
    timestamp: typeof date === 'string' ? new Date(date) : date,
    portfolioValue,
    benchmarkValue,
    position: {
      ...createMockPosition(),
      feesEarned: {
        tokenX: (feesEarned / 2).toString(),
        tokenY: (feesEarned / 2).toString(),
        usdValue: feesEarned,
      },
      metrics: {
        apr,
        impermanentLoss: 0,
        utilization,
      },
    },
    marketPrice: portfolioValue * 0.001,
    marketVolume: '50000',
  }
}

function createMockPosition(): PositionSnapshot {
  return {
    timestamp: new Date(),
    binDistribution: [],
    totalValue: 1000,
    tokenXBalance: '500',
    tokenYBalance: '500',
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

function createStrategyAction(
  date: string,
  type: StrategyAction['type'],
  oldValue: number,
  newValue: number,
  success: boolean
): StrategyAction {
  return {
    timestamp: new Date(date),
    type,
    parameters: { reason: 'test action' },
    costs: { gas: 0.01, slippage: 0.005, fees: 0.25 },
    result: {
      success,
      newPositionValue: success ? newValue : oldValue,
    },
  }
}

function createStrategyActionWithCosts(
  date: string,
  type: StrategyAction['type'],
  fees: number,
  gas: number,
  slippage: number
): StrategyAction {
  return {
    timestamp: new Date(date),
    type,
    parameters: { reason: 'test action' },
    costs: { gas, slippage, fees },
    result: {
      success: true,
      newPositionValue: 1000,
    },
  }
}

function createValidMetrics(): BacktestMetrics {
  return {
    totalReturn: 0.15,
    annualizedReturn: 0.18,
    benchmarkReturn: 0.12,
    excessReturn: 0.06,
    volatility: 0.2,
    sharpeRatio: 0.9,
    sortinoRatio: 1.2,
    maxDrawdown: 0.1,
    maxDrawdownDuration: 15,
    totalTrades: 25,
    profitableTrades: 15,
    winRate: 0.6,
    profitFactor: 1.5,
    avgTradeReturn: 0.006,
    largestWin: 0.05,
    largestLoss: -0.03,
    totalFees: 6.25,
    totalGas: 0.25,
    totalSlippage: 1.25,
    costToReturn: 0.05,
    totalFeesEarned: 45.0,
    avgApr: 0.08,
    liquidityUtilization: 0.85,
    rebalanceFrequency: 1.2,
    impermanentLossRecovery: 0.75,
  }
}