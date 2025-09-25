// Mock all external dependencies before imports
jest.mock('../../../../src/lib/dlmm/backtesting/engine')
jest.mock('../../../../src/lib/dlmm/backtesting/historical-data')
jest.mock('../../../../src/lib/dlmm/backtesting/metrics')
jest.mock('../../../../src/lib/dlmm/strategies')

// Mock PublicKey class
const MockPublicKey = class {
  constructor(public key: string) {}
  toString() { return this.key }
  equals(other: any) { return this.key === other.key }
}

describe('Backtesting Module Integration', () => {
  describe('BacktestUtils', () => {
    let BacktestUtils: any

    beforeEach(async () => {
      // Import BacktestUtils without other dependencies
      const indexModule = await import('../../../../src/lib/dlmm/backtesting/index')
      BacktestUtils = indexModule.BacktestUtils
    })

    describe('createDefaultConfig', () => {
      it('should create valid default configuration', () => {
        const defaultConfig = BacktestUtils.createDefaultConfig()

        expect(defaultConfig.timeframe).toBeDefined()
        expect(defaultConfig.capital).toBeDefined()
        expect(defaultConfig.costs).toBeDefined()
        expect(defaultConfig.rebalancing).toBeDefined()

        expect(defaultConfig.timeframe!.startDate).toBeInstanceOf(Date)
        expect(defaultConfig.timeframe!.endDate).toBeInstanceOf(Date)
        expect(defaultConfig.timeframe!.startDate < defaultConfig.timeframe!.endDate).toBe(true)

        expect(defaultConfig.capital!.initialAmount).toBe(1000)
        expect(defaultConfig.capital!.currency).toBe('USD')

        expect(defaultConfig.costs!.gasPrice).toBe(0.001)
        expect(defaultConfig.costs!.slippage).toBe(0.005)
        expect(defaultConfig.costs!.transactionFee).toBe(0.25)
      })

      it('should create 30-day timeframe by default', () => {
        const defaultConfig = BacktestUtils.createDefaultConfig()
        const timeDiff = defaultConfig.timeframe!.endDate.getTime() - defaultConfig.timeframe!.startDate.getTime()
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

        expect(daysDiff).toBeCloseTo(30, 0)
      })

      it('should set reasonable default values', () => {
        const defaultConfig = BacktestUtils.createDefaultConfig()

        expect(defaultConfig.timeframe!.interval).toBe('1h')
        expect(defaultConfig.rebalancing!.frequency).toBe('immediate')
        expect(defaultConfig.rebalancing!.minThreshold).toBe(0.02)
      })
    })

    describe('validateConfig', () => {
      let validConfig: any

      beforeEach(() => {
        validConfig = {
          id: 'test-backtest',
          name: 'Test Backtest',
          strategy: { id: 'rebalance', parameters: {} },
          market: {
            poolAddress: new MockPublicKey('11111111111111111111111111111112'),
            tokenXSymbol: 'SOL',
            tokenYSymbol: 'USDC',
          },
          timeframe: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31'),
            interval: '1h',
          },
          capital: { initialAmount: 1000, currency: 'USD' },
          costs: { gasPrice: 0.001, slippage: 0.005, transactionFee: 0.25 },
          rebalancing: { frequency: 'immediate', minThreshold: 0.02 },
        }
      })

      it('should validate correct configuration', () => {
        const validation = BacktestUtils.validateConfig(validConfig)

        expect(validation.isValid).toBe(true)
        expect(validation.errors).toHaveLength(0)
      })

      it('should reject invalid date range', () => {
        const invalidConfig = {
          ...validConfig,
          timeframe: {
            ...validConfig.timeframe,
            startDate: new Date('2024-01-31'),
            endDate: new Date('2024-01-01'), // End before start
          },
        }

        const validation = BacktestUtils.validateConfig(invalidConfig)

        expect(validation.isValid).toBe(false)
        expect(validation.errors).toContain('Start date must be before end date')
      })

      it('should reject zero or negative capital', () => {
        const invalidConfig = {
          ...validConfig,
          capital: { ...validConfig.capital, initialAmount: 0 },
        }

        const validation = BacktestUtils.validateConfig(invalidConfig)

        expect(validation.isValid).toBe(false)
        expect(validation.errors).toContain('Initial capital must be positive')
      })

      it('should reject missing strategy ID', () => {
        const invalidConfig = {
          ...validConfig,
          strategy: { ...validConfig.strategy, id: '' },
        }

        const validation = BacktestUtils.validateConfig(invalidConfig)

        expect(validation.isValid).toBe(false)
        expect(validation.errors).toContain('Strategy ID is required')
      })

      it('should reject negative gas price', () => {
        const invalidConfig = {
          ...validConfig,
          costs: { ...validConfig.costs, gasPrice: -0.001 },
        }

        const validation = BacktestUtils.validateConfig(invalidConfig)

        expect(validation.isValid).toBe(false)
        expect(validation.errors).toContain('Gas price cannot be negative')
      })

      it('should reject invalid slippage values', () => {
        const lowSlippageConfig = {
          ...validConfig,
          costs: { ...validConfig.costs, slippage: -0.1 },
        }

        const highSlippageConfig = {
          ...validConfig,
          costs: { ...validConfig.costs, slippage: 1.5 },
        }

        const lowValidation = BacktestUtils.validateConfig(lowSlippageConfig)
        const highValidation = BacktestUtils.validateConfig(highSlippageConfig)

        expect(lowValidation.isValid).toBe(false)
        expect(lowValidation.errors).toContain('Slippage must be between 0 and 1')

        expect(highValidation.isValid).toBe(false)
        expect(highValidation.errors).toContain('Slippage must be between 0 and 1')
      })

      it('should reject timeframes longer than 1 year', () => {
        const longConfig = {
          ...validConfig,
          timeframe: {
            ...validConfig.timeframe,
            startDate: new Date('2023-01-01'),
            endDate: new Date('2024-06-01'), // More than 1 year
          },
        }

        const validation = BacktestUtils.validateConfig(longConfig)

        expect(validation.isValid).toBe(false)
        expect(validation.errors).toContain('Backtest period cannot exceed 1 year')
      })

      it('should accumulate multiple errors', () => {
        const multipleErrorConfig = {
          ...validConfig,
          timeframe: {
            ...validConfig.timeframe,
            startDate: new Date('2024-01-31'),
            endDate: new Date('2024-01-01'), // Invalid date range
          },
          capital: { ...validConfig.capital, initialAmount: 0 }, // Invalid capital
          strategy: { ...validConfig.strategy, id: '' }, // Missing strategy
        }

        const validation = BacktestUtils.validateConfig(multipleErrorConfig)

        expect(validation.isValid).toBe(false)
        expect(validation.errors.length).toBeGreaterThanOrEqual(3)
      })
    })

    describe('generateId', () => {
      it('should generate unique IDs', () => {
        const id1 = BacktestUtils.generateId()
        const id2 = BacktestUtils.generateId()

        expect(id1).not.toBe(id2)
        expect(id1).toMatch(/^bt_\d+_[a-z0-9]+$/)
        expect(id2).toMatch(/^bt_\d+_[a-z0-9]+$/)
      })

      it('should include timestamp in ID', () => {
        const beforeTime = Date.now()
        const id = BacktestUtils.generateId()
        const afterTime = Date.now()

        const timestampMatch = id.match(/^bt_(\d+)_/)
        expect(timestampMatch).not.toBeNull()

        const idTimestamp = parseInt(timestampMatch![1])
        expect(idTimestamp).toBeGreaterThanOrEqual(beforeTime)
        expect(idTimestamp).toBeLessThanOrEqual(afterTime)
      })

      it('should generate IDs with sufficient randomness', () => {
        const ids = Array(100).fill(null).map(() => BacktestUtils.generateId())
        const uniqueIds = new Set(ids)

        expect(uniqueIds.size).toBe(100) // All should be unique
      })
    })

    describe('formatMetricsForDisplay', () => {
      it('should format all metrics correctly', () => {
        const metrics = {
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

        const formatted = BacktestUtils.formatMetricsForDisplay(metrics)

        expect(formatted['Total Return']).toBe('15.00%')
        expect(formatted['Annualized Return']).toBe('18.00%')
        expect(formatted['Sharpe Ratio']).toBe('0.90')
        expect(formatted['Max Drawdown']).toBe('10.00%')
        expect(formatted['Win Rate']).toBe('60.0%')
        expect(formatted['Total Trades']).toBe('25')
        expect(formatted['Fees Earned']).toBe('$45.00')
        expect(formatted['Average APR']).toBe('8.0%')
      })

      it('should handle zero and negative values', () => {
        const metrics = {
          totalReturn: -0.05,
          annualizedReturn: 0,
          sharpeRatio: 0,
          maxDrawdown: 0,
          winRate: 0,
          totalTrades: 0,
          totalFeesEarned: 0,
          avgApr: 0,
        }

        const formatted = BacktestUtils.formatMetricsForDisplay(metrics as any)

        expect(formatted['Total Return']).toBe('-5.00%')
        expect(formatted['Sharpe Ratio']).toBe('0.00')
        expect(formatted['Total Trades']).toBe('0')
        expect(formatted['Fees Earned']).toBe('$0.00')
      })
    })

    describe('estimateBacktestDuration', () => {
      it('should estimate duration based on time range and interval', () => {
        const config = {
          timeframe: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-02'), // 1 day
            interval: '1h',
          },
        }

        const duration = BacktestUtils.estimateBacktestDuration(config as any)

        expect(duration).toBeGreaterThan(0)
        expect(duration).toBeLessThan(60) // Should be reasonable
      })

      it('should return minimum of 1 second', () => {
        const shortConfig = {
          timeframe: {
            startDate: new Date('2024-01-01T00:00:00'),
            endDate: new Date('2024-01-01T01:00:00'), // 1 hour with daily interval
            interval: '1d',
          },
        }

        const duration = BacktestUtils.estimateBacktestDuration(shortConfig as any)

        expect(duration).toBeGreaterThanOrEqual(1)
      })
    })

    describe('compareBacktests', () => {
      it('should compare metrics and determine winner', () => {
        const result1 = {
          metrics: {
            totalReturn: 0.15,
            sharpeRatio: 1.2,
            maxDrawdown: 0.08,
            winRate: 0.65,
            avgApr: 0.12,
          },
        }

        const result2 = {
          metrics: {
            totalReturn: 0.10,
            sharpeRatio: 0.9,
            maxDrawdown: 0.12,
            winRate: 0.55,
            avgApr: 0.08,
          },
        }

        const comparison = BacktestUtils.compareBacktests(result1 as any, result2 as any)

        expect(comparison.winner).toBe('first') // Better Sharpe ratio
        expect(comparison.comparison).toHaveLength(5) // 5 metrics compared
      })

      it('should handle tie scenarios', () => {
        const result1 = {
          metrics: {
            totalReturn: 0.15,
            sharpeRatio: 1.2,
            maxDrawdown: 0.08,
            winRate: 0.65,
            avgApr: 0.12,
          },
        }

        const result2 = {
          metrics: {
            totalReturn: 0.15, // Same as result1
            sharpeRatio: 1.2, // Same as result1
            maxDrawdown: 0.08,
            winRate: 0.65,
            avgApr: 0.12,
          },
        }

        const comparison = BacktestUtils.compareBacktests(result1 as any, result2 as any)

        const totalReturnComparison = comparison.comparison.find(c => c.metric === 'totalReturn')
        expect(totalReturnComparison?.winner).toBe('tie')
      })
    })
  })

  describe('integration scenarios', () => {
    let BacktestUtils: any

    beforeEach(async () => {
      const indexModule = await import('../../../../src/lib/dlmm/backtesting/index')
      BacktestUtils = indexModule.BacktestUtils
    })

    it('should work with complete backtesting workflow', async () => {
      // Create a config using utilities
      const defaultConfig = BacktestUtils.createDefaultConfig()
      const fullConfig = {
        id: BacktestUtils.generateId(),
        name: 'Integration Test',
        strategy: { id: 'rebalance', parameters: {} },
        market: {
          poolAddress: new MockPublicKey('11111111111111111111111111111112'),
          tokenXSymbol: 'SOL',
          tokenYSymbol: 'USDC',
        },
        ...defaultConfig,
      }

      // Validate the configuration
      const validation = BacktestUtils.validateConfig(fullConfig)
      expect(validation.isValid).toBe(true)

      // Estimate duration
      const duration = BacktestUtils.estimateBacktestDuration(fullConfig)
      expect(duration).toBeGreaterThan(0)
    })

    it('should handle error scenarios gracefully', () => {
      // Test with invalid configuration
      const invalidConfig = BacktestUtils.createDefaultConfig()
      invalidConfig.capital!.initialAmount = -1000 // Invalid

      const fullInvalidConfig = {
        id: 'invalid',
        name: 'Invalid Test',
        strategy: { id: '', parameters: {} }, // Invalid
        market: {
          poolAddress: new MockPublicKey('11111111111111111111111111111112'),
          tokenXSymbol: 'SOL',
          tokenYSymbol: 'USDC',
        },
        ...invalidConfig,
      }

      const validation = BacktestUtils.validateConfig(fullInvalidConfig)
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    it('should maintain consistency between different utility functions', () => {
      const defaultConfig = BacktestUtils.createDefaultConfig()

      // Generate multiple configurations
      const configs = Array(3).fill(null).map((_, i) => ({
        id: BacktestUtils.generateId(),
        name: `Test Config ${i}`,
        strategy: { id: 'rebalance', parameters: {} },
        market: {
          poolAddress: new MockPublicKey('11111111111111111111111111111112'),
          tokenXSymbol: 'SOL',
          tokenYSymbol: 'USDC',
        },
        ...defaultConfig,
      }))

      // All should be valid
      configs.forEach(config => {
        const validation = BacktestUtils.validateConfig(config)
        expect(validation.isValid).toBe(true)
      })

      // All should have reasonable durations
      configs.forEach(config => {
        const duration = BacktestUtils.estimateBacktestDuration(config)
        expect(duration).toBeGreaterThan(0)
        expect(duration).toBeLessThan(3600) // Less than 1 hour estimate
      })

      // All IDs should be unique
      const ids = configs.map(c => c.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(configs.length)
    })
  })
})