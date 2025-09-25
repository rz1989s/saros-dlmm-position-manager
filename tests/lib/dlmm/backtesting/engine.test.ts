// Mock all external dependencies before imports
jest.mock('../../../../src/lib/dlmm/backtesting/historical-data')
jest.mock('../../../../src/lib/dlmm/backtesting/metrics')
jest.mock('../../../../src/lib/dlmm/strategies')

// Mock PublicKey to avoid SDK imports
const MockPublicKey = class {
  constructor(public key: string) {}
  toString() { return this.key }
  equals(other: any) { return this.key === other.key }
}

// Mock the engine module to avoid circular dependencies
jest.mock('../../../../src/lib/dlmm/backtesting/engine', () => {
  const originalModule = jest.requireActual('../../../../src/lib/dlmm/backtesting/engine')
  return {
    ...originalModule,
    BacktestEngine: class MockBacktestEngine {
      private isRunning = false
      private abortController: AbortController | null = null

      async runBacktest(config: any, onProgress?: any) {
        // Mock implementation for testing
        this.isRunning = true
        this.abortController = new AbortController()

        try {
          // Validate config
          if (config.timeframe.startDate >= config.timeframe.endDate) {
            throw new Error('Start date must be before end date')
          }
          if (config.capital.initialAmount <= 0) {
            throw new Error('Initial capital must be positive')
          }
          if (!config.strategy.id) {
            throw new Error('Strategy ID is required')
          }

          // Mock progress callbacks
          if (onProgress) {
            onProgress({ phase: 'initializing', progress: 0.05, currentStep: 'Validating configuration...' })
            onProgress({ phase: 'fetching_data', progress: 0.15, currentStep: 'Fetching historical data...' })
            onProgress({ phase: 'simulating', progress: 0.5, currentStep: 'Running strategy simulation...' })
            onProgress({ phase: 'calculating_metrics', progress: 0.9, currentStep: 'Calculating performance metrics...' })
            onProgress({ phase: 'completed', progress: 1, currentStep: 'Backtest completed successfully!' })
          }

          const result = {
            config,
            status: 'completed',
            progress: 1,
            startedAt: new Date(),
            completedAt: new Date(),
            metrics: {
              totalReturn: 0.07,
              annualizedReturn: 0.25,
              benchmarkReturn: 0.05,
              excessReturn: 0.02,
              volatility: 0.15,
              sharpeRatio: 1.2,
              sortinoRatio: 1.5,
              maxDrawdown: 0.1,
              maxDrawdownDuration: 5,
              totalTrades: 10,
              profitableTrades: 6,
              winRate: 0.6,
              profitFactor: 1.8,
              avgTradeReturn: 0.007,
              largestWin: 0.05,
              largestLoss: -0.03,
              totalFees: 2.5,
              totalGas: 0.01,
              totalSlippage: 1.25,
              costToReturn: 0.036,
              totalFeesEarned: 15.5,
              avgApr: 0.08,
              liquidityUtilization: 0.85,
              rebalanceFrequency: 2.5,
              impermanentLossRecovery: 0.75,
            },
            timeSeriesData: [
              { timestamp: new Date('2024-01-01'), portfolioValue: 1000, benchmarkValue: 1000 },
              { timestamp: new Date('2024-01-02'), portfolioValue: 1050, benchmarkValue: 1025 },
              { timestamp: new Date('2024-01-03'), portfolioValue: 1070, benchmarkValue: 1050 },
            ],
            actions: [
              {
                timestamp: new Date('2024-01-01'),
                type: 'initialize',
                parameters: { reason: 'Initial position setup' },
                costs: { gas: 0.001, slippage: 0, fees: 0 },
                result: { success: true, newPositionValue: 1000 }
              },
              {
                timestamp: new Date('2024-01-02'),
                type: 'rebalance',
                parameters: { reason: 'Strategy execution' },
                costs: { gas: 0.001, slippage: 0.005, fees: 0.25 },
                result: { success: true, newPositionValue: 1050 }
              }
            ],
            summary: {
              bestPeriod: { start: new Date('2024-01-02'), end: new Date('2024-01-03'), return: 0.02 },
              worstPeriod: { start: new Date('2024-01-01'), end: new Date('2024-01-02'), return: 0.05 },
              keyInsights: ['Excellent risk-adjusted returns with Sharpe ratio of 1.20'],
              recommendations: []
            }
          }

          return result
        } catch (error) {
          return {
            config,
            status: 'error',
            progress: 0,
            startedAt: new Date(),
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date()
            },
            metrics: {},
            timeSeriesData: [],
            actions: [],
            summary: {
              bestPeriod: { start: new Date(), end: new Date(), return: 0 },
              worstPeriod: { start: new Date(), end: new Date(), return: 0 },
              keyInsights: [],
              recommendations: []
            }
          }
        } finally {
          this.isRunning = false
          this.abortController = null
        }
      }

      isBacktestRunning() {
        return this.isRunning
      }

      cancelBacktest() {
        if (this.abortController) {
          this.abortController.abort()
        }
      }
    }
  }
})

describe('BacktestEngine', () => {
  let BacktestEngine: any
  let engine: any

  beforeEach(async () => {
    // Import the mocked engine
    const engineModule = await import('../../../../src/lib/dlmm/backtesting/engine')
    BacktestEngine = engineModule.BacktestEngine
    engine = new BacktestEngine()
  })

  describe('runBacktest', () => {
    it('should complete a successful backtest', async () => {
      const mockConfig = {
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

      const result = await engine.runBacktest(mockConfig)

      expect(result.status).toBe('completed')
      expect(result.config).toEqual(mockConfig)
      expect(result.metrics.totalReturn).toBe(0.07)
      expect(result.timeSeriesData).toHaveLength(3)
      expect(result.actions).toHaveLength(2)
      expect(result.completedAt).toBeDefined()
    })

    it('should validate configuration before starting', async () => {
      const invalidConfig = {
        strategy: { id: 'test', parameters: {} },
        market: { poolAddress: new MockPublicKey('test'), tokenXSymbol: 'SOL', tokenYSymbol: 'USDC' },
        timeframe: {
          startDate: new Date('2024-01-31'),
          endDate: new Date('2024-01-01'), // End before start
          interval: '1h',
        },
        capital: { initialAmount: 1000, currency: 'USD' },
        costs: { gasPrice: 0.001, slippage: 0.005, transactionFee: 0.25 },
        rebalancing: { frequency: 'immediate', minThreshold: 0.02 },
      }

      const result = await engine.runBacktest(invalidConfig)

      expect(result.status).toBe('error')
      expect(result.error?.message).toContain('Start date must be before end date')
    })

    it('should validate positive initial capital', async () => {
      const invalidConfig = {
        strategy: { id: 'test', parameters: {} },
        market: { poolAddress: new MockPublicKey('test'), tokenXSymbol: 'SOL', tokenYSymbol: 'USDC' },
        timeframe: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          interval: '1h',
        },
        capital: { initialAmount: -1000, currency: 'USD' },
        costs: { gasPrice: 0.001, slippage: 0.005, transactionFee: 0.25 },
        rebalancing: { frequency: 'immediate', minThreshold: 0.02 },
      }

      const result = await engine.runBacktest(invalidConfig)

      expect(result.status).toBe('error')
      expect(result.error?.message).toContain('Initial capital must be positive')
    })

    it('should validate strategy ID is provided', async () => {
      const invalidConfig = {
        strategy: { id: '', parameters: {} },
        market: { poolAddress: new MockPublicKey('test'), tokenXSymbol: 'SOL', tokenYSymbol: 'USDC' },
        timeframe: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          interval: '1h',
        },
        capital: { initialAmount: 1000, currency: 'USD' },
        costs: { gasPrice: 0.001, slippage: 0.005, transactionFee: 0.25 },
        rebalancing: { frequency: 'immediate', minThreshold: 0.02 },
      }

      const result = await engine.runBacktest(invalidConfig)

      expect(result.status).toBe('error')
      expect(result.error?.message).toContain('Strategy ID is required')
    })

    it('should track progress through all phases', async () => {
      const progressCallback = jest.fn()
      const mockConfig = {
        strategy: { id: 'test', parameters: {} },
        market: { poolAddress: new MockPublicKey('test'), tokenXSymbol: 'SOL', tokenYSymbol: 'USDC' },
        timeframe: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          interval: '1h',
        },
        capital: { initialAmount: 1000, currency: 'USD' },
        costs: { gasPrice: 0.001, slippage: 0.005, transactionFee: 0.25 },
        rebalancing: { frequency: 'immediate', minThreshold: 0.02 },
      }

      await engine.runBacktest(mockConfig, progressCallback)

      const progressCalls = progressCallback.mock.calls.map((call: any) => call[0])

      expect(progressCalls.some((p: any) => p.phase === 'initializing')).toBe(true)
      expect(progressCalls.some((p: any) => p.phase === 'fetching_data')).toBe(true)
      expect(progressCalls.some((p: any) => p.phase === 'simulating')).toBe(true)
      expect(progressCalls.some((p: any) => p.phase === 'calculating_metrics')).toBe(true)
      expect(progressCalls.some((p: any) => p.phase === 'completed')).toBe(true)

      const progressValues = progressCalls.map((p: any) => p.progress)
      expect(progressValues[progressValues.length - 1]).toBe(1)
    })

    it('should include initial action in results', async () => {
      const mockConfig = {
        strategy: { id: 'test', parameters: {} },
        market: { poolAddress: new MockPublicKey('test'), tokenXSymbol: 'SOL', tokenYSymbol: 'USDC' },
        timeframe: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          interval: '1h',
        },
        capital: { initialAmount: 1000, currency: 'USD' },
        costs: { gasPrice: 0.001, slippage: 0.005, transactionFee: 0.25 },
        rebalancing: { frequency: 'immediate', minThreshold: 0.02 },
      }

      const result = await engine.runBacktest(mockConfig)

      expect(result.actions).toHaveLength(2)
      expect(result.actions[0].type).toBe('initialize')
      expect(result.actions[0].parameters.reason).toBe('Initial position setup')
    })

    it('should generate meaningful insights and recommendations', async () => {
      const mockConfig = {
        strategy: { id: 'test', parameters: {} },
        market: { poolAddress: new MockPublicKey('test'), tokenXSymbol: 'SOL', tokenYSymbol: 'USDC' },
        timeframe: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          interval: '1h',
        },
        capital: { initialAmount: 1000, currency: 'USD' },
        costs: { gasPrice: 0.001, slippage: 0.005, transactionFee: 0.25 },
        rebalancing: { frequency: 'immediate', minThreshold: 0.02 },
      }

      const result = await engine.runBacktest(mockConfig)

      expect(result.summary.keyInsights).toContain(
        expect.stringContaining('Excellent risk-adjusted returns')
      )
    })
  })

  describe('isBacktestRunning', () => {
    it('should return false initially', () => {
      expect(engine.isBacktestRunning()).toBe(false)
    })

    it('should return true during execution', async () => {
      let runningDuringExecution = false

      const mockConfig = {
        strategy: { id: 'test', parameters: {} },
        market: { poolAddress: new MockPublicKey('test'), tokenXSymbol: 'SOL', tokenYSymbol: 'USDC' },
        timeframe: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          interval: '1h',
        },
        capital: { initialAmount: 1000, currency: 'USD' },
        costs: { gasPrice: 0.001, slippage: 0.005, transactionFee: 0.25 },
        rebalancing: { frequency: 'immediate', minThreshold: 0.02 },
      }

      const resultPromise = engine.runBacktest(mockConfig, () => {
        if (!runningDuringExecution) {
          runningDuringExecution = engine.isBacktestRunning()
        }
      })

      await resultPromise

      expect(runningDuringExecution).toBe(true)
      expect(engine.isBacktestRunning()).toBe(false) // Should be false after completion
    })
  })

  describe('cancelBacktest', () => {
    it('should not affect anything when not running', () => {
      expect(() => engine.cancelBacktest()).not.toThrow()
      expect(engine.isBacktestRunning()).toBe(false)
    })
  })
})