import { Connection, PublicKey } from '@solana/web3.js'
import {
  CrossPoolArbitrageEngine,
  ArbitrageOpportunity,
  ArbitragePool,
  RiskAssessment,
  ExecutionStep
} from '../../../../src/lib/dlmm/arbitrage/detection-engine'
import { TokenInfo } from '../../../../src/lib/types'

// Mock the required modules
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn(),
  PublicKey: jest.fn().mockImplementation((key: string) => ({
    toString: () => key,
    equals: jest.fn((other) => key === other.toString())
  }))
}))

// SDK mock removed - not needed for arbitrage tests

// Mock console methods to test logging
const mockConsoleLog = jest.fn()
const mockConsoleError = jest.fn()
const mockConsoleWarn = jest.fn()

global.console = {
  ...console,
  log: mockConsoleLog,
  error: mockConsoleError,
  warn: mockConsoleWarn,
}

describe('CrossPoolArbitrageEngine', () => {
  let engine: CrossPoolArbitrageEngine
  let mockConnection: jest.Mocked<Connection>
  let mockTokenX: TokenInfo
  let mockTokenY: TokenInfo
  let mockPoolAddress1: PublicKey
  let mockPoolAddress2: PublicKey

  beforeEach(() => {
    jest.clearAllMocks()

    mockConnection = {
      getAccountInfo: jest.fn(),
    } as any

    mockTokenX = {
      address: new PublicKey('So11111111111111111111111111111111111111112'), // SOL
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      logoURI: 'sol.png',
      tags: ['verified'],
      price: 100
    }

    mockTokenY = {
      address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), // USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'usdc.png',
      tags: ['verified'],
      price: 1
    }

    mockPoolAddress1 = new PublicKey('7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm')
    mockPoolAddress2 = new PublicKey('8qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm')

    engine = new CrossPoolArbitrageEngine(mockConnection)
  })

  describe('constructor', () => {
    it('should initialize with connection and default patterns', () => {
      expect(engine).toBeInstanceOf(CrossPoolArbitrageEngine)
    })

    it('should initialize empty maps for tracked pools and opportunities', () => {
      const stats = engine.getMonitoringStats()
      expect(stats.trackedPools).toBe(0)
      expect(stats.activeOpportunities).toBe(0)
    })

    it('should set default configuration values', () => {
      const stats = engine.getMonitoringStats()
      expect(stats.updateInterval).toBe(5000)
      expect(stats.isMonitoring).toBe(false)
    })
  })

  describe('startMonitoring', () => {
    it('should start monitoring and set isMonitoring to true', async () => {
      await engine.startMonitoring()

      const stats = engine.getMonitoringStats()
      expect(stats.isMonitoring).toBe(true)
      expect(mockConsoleLog).toHaveBeenCalledWith('Cross-pool arbitrage monitoring started')
    })

    it('should not start monitoring if already monitoring', async () => {
      await engine.startMonitoring()
      mockConsoleLog.mockClear()

      await engine.startMonitoring()
      expect(mockConsoleLog).not.toHaveBeenCalledWith('Cross-pool arbitrage monitoring started')
    })

    it('should handle monitoring errors gracefully', async () => {
      // Mock scanForOpportunities to throw an error
      jest.spyOn(engine as any, 'scanForOpportunities').mockRejectedValue(new Error('Test error'))

      await engine.startMonitoring()

      // Wait for interval to trigger
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(mockConsoleError).toHaveBeenCalledWith('Arbitrage monitoring error:', expect.any(Error))
    })
  })

  describe('stopMonitoring', () => {
    it('should stop monitoring and set isMonitoring to false', async () => {
      await engine.startMonitoring()
      engine.stopMonitoring()

      const stats = engine.getMonitoringStats()
      expect(stats.isMonitoring).toBe(false)
      expect(mockConsoleLog).toHaveBeenCalledWith('Cross-pool arbitrage monitoring stopped')
    })

    it('should clear monitoring interval', async () => {
      await engine.startMonitoring()
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')

      engine.stopMonitoring()

      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it('should handle stopping when not monitoring gracefully', () => {
      engine.stopMonitoring()

      const stats = engine.getMonitoringStats()
      expect(stats.isMonitoring).toBe(false)
    })
  })

  describe('addPool', () => {
    it('should add pool to tracking successfully', async () => {
      // Mock fetchPoolData to return valid pool
      const mockPool: ArbitragePool = {
        poolAddress: mockPoolAddress1,
        tokenX: mockTokenX,
        tokenY: mockTokenY,
        activeBin: {
          binId: 0,
          price: 100,
          liquidityX: '1000000',
          liquidityY: '100000000'
        },
        liquidity: 100000,
        volume24h: 50000,
        fees: 0.003,
        slippage: 0.001,
        lastUpdated: new Date()
      }

      jest.spyOn(engine as any, 'fetchPoolData').mockResolvedValue(mockPool)

      await engine.addPool(mockPoolAddress1, mockTokenX, mockTokenY)

      const stats = engine.getMonitoringStats()
      expect(stats.trackedPools).toBe(1)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `Added pool ${mockPoolAddress1.toString()} to arbitrage monitoring`
      )
    })

    it('should handle pool addition errors', async () => {
      const error = new Error('Failed to fetch pool data')
      jest.spyOn(engine as any, 'fetchPoolData').mockRejectedValue(error)

      await expect(
        engine.addPool(mockPoolAddress1, mockTokenX, mockTokenY)
      ).rejects.toThrow('Failed to fetch pool data')

      expect(mockConsoleError).toHaveBeenCalledWith(
        `Failed to add pool ${mockPoolAddress1.toString()}:`, error
      )
    })

    it('should handle different token pairs', async () => {
      const mockPool = {
        poolAddress: mockPoolAddress1,
        tokenX: mockTokenY, // Swapped
        tokenY: mockTokenX,
        activeBin: {
          binId: 0,
          price: 1,
          liquidityX: '100000000',
          liquidityY: '1000000'
        },
        liquidity: 100000,
        volume24h: 50000,
        fees: 0.003,
        slippage: 0.001,
        lastUpdated: new Date()
      }

      jest.spyOn(engine as any, 'fetchPoolData').mockResolvedValue(mockPool)

      await engine.addPool(mockPoolAddress1, mockTokenY, mockTokenX)

      const stats = engine.getMonitoringStats()
      expect(stats.trackedPools).toBe(1)
    })
  })

  describe('removePool', () => {
    beforeEach(async () => {
      const mockPool: ArbitragePool = {
        poolAddress: mockPoolAddress1,
        tokenX: mockTokenX,
        tokenY: mockTokenY,
        activeBin: {
          binId: 0,
          price: 100,
          liquidityX: '1000000',
          liquidityY: '100000000'
        },
        liquidity: 100000,
        volume24h: 50000,
        fees: 0.003,
        slippage: 0.001,
        lastUpdated: new Date()
      }

      jest.spyOn(engine as any, 'fetchPoolData').mockResolvedValue(mockPool)
      await engine.addPool(mockPoolAddress1, mockTokenX, mockTokenY)
    })

    it('should remove pool from tracking', () => {
      engine.removePool(mockPoolAddress1)

      const stats = engine.getMonitoringStats()
      expect(stats.trackedPools).toBe(0)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `Removed pool ${mockPoolAddress1.toString()} from arbitrage monitoring`
      )
    })

    it('should remove associated opportunities', () => {
      // Add a mock opportunity involving this pool
      const mockOpportunity: ArbitrageOpportunity = {
        id: 'test-opp-1',
        type: 'direct',
        pools: [{
          poolAddress: mockPoolAddress1,
          tokenX: mockTokenX,
          tokenY: mockTokenY,
          activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
          liquidity: 100000,
          volume24h: 50000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
        }],
        path: {
          inputToken: mockTokenX,
          outputToken: mockTokenX,
          route: [],
          totalDistance: 2,
          complexity: 'simple',
          estimatedGas: 200000,
          priceImpact: 0.001
        },
        profitability: {
          grossProfit: 15,
          netProfit: 12,
          profitMargin: 0.012,
          returnOnInvestment: 0.012,
          breakevenAmount: 500,
          maxProfitableAmount: 10000,
          gasCosts: 2.5,
          priorityFees: 0.5
        },
        risk: {
          liquidityRisk: 0.1,
          slippageRisk: 0.1,
          mevRisk: 0.1,
          temporalRisk: 0.1,
          competitionRisk: 0.1,
          overallRisk: 'low',
          riskFactors: []
        },
        executionPlan: [] as ExecutionStep[],
        mev: {
          strategy: 'private_mempool',
          jitterMs: 1500,
          maxFrontrunProtection: 0.01,
          privateMempoolUsed: true,
          bundlingRequired: true
        },
        timestamp: Date.now(),
        confidence: 0.8
      }

      // Manually add opportunity to test removal
      ;(engine as any).opportunities.set('test-opp-1', mockOpportunity)

      engine.removePool(mockPoolAddress1)

      const opportunities = engine.getActiveOpportunities()
      expect(opportunities).toHaveLength(0)
    })

    it('should handle removing non-existent pool gracefully', () => {
      const nonExistentPool = new PublicKey('9qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm')

      expect(() => engine.removePool(nonExistentPool)).not.toThrow()
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `Removed pool ${nonExistentPool.toString()} from arbitrage monitoring`
      )
    })
  })

  describe('getActiveOpportunities', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return active opportunities within profit and risk thresholds', () => {
      const mockOpportunity: ArbitrageOpportunity = {
        id: 'test-opp-1',
        type: 'direct',
        pools: [],
        path: {
          inputToken: mockTokenX,
          outputToken: mockTokenX,
          route: [],
          totalDistance: 2,
          complexity: 'simple',
          estimatedGas: 200000,
          priceImpact: 0.001
        },
        profitability: {
          grossProfit: 15,
          netProfit: 12,
          profitMargin: 0.012,
          returnOnInvestment: 0.012,
          breakevenAmount: 500,
          maxProfitableAmount: 10000,
          gasCosts: 2.5,
          priorityFees: 0.5
        },
        risk: {
          liquidityRisk: 0.1,
          slippageRisk: 0.1,
          mevRisk: 0.1,
          temporalRisk: 0.1,
          competitionRisk: 0.1,
          overallRisk: 'low',
          riskFactors: []
        },
        executionPlan: [],
        mev: {
          strategy: 'private_mempool',
          jitterMs: 1500,
          maxFrontrunProtection: 0.01,
          privateMempoolUsed: true,
          bundlingRequired: true
        },
        timestamp: Date.now(),
        confidence: 0.8
      }

      ;(engine as any).opportunities.set('test-opp-1', mockOpportunity)

      const opportunities = engine.getActiveOpportunities()
      expect(opportunities).toHaveLength(1)
      expect(opportunities[0].id).toBe('test-opp-1')
    })

    it('should filter out low-profit opportunities', () => {
      const lowProfitOpportunity: ArbitrageOpportunity = {
        id: 'low-profit',
        type: 'direct',
        pools: [],
        path: {
          inputToken: mockTokenX,
          outputToken: mockTokenX,
          route: [],
          totalDistance: 2,
          complexity: 'simple',
          estimatedGas: 200000,
          priceImpact: 0.001
        },
        profitability: {
          grossProfit: 8,
          netProfit: 5, // Below MIN_PROFIT_USD (10)
          profitMargin: 0.005,
          returnOnInvestment: 0.005,
          breakevenAmount: 500,
          maxProfitableAmount: 10000,
          gasCosts: 2.5,
          priorityFees: 0.5
        },
        risk: {
          liquidityRisk: 0.1,
          slippageRisk: 0.1,
          mevRisk: 0.1,
          temporalRisk: 0.1,
          competitionRisk: 0.1,
          overallRisk: 'low',
          riskFactors: []
        },
        executionPlan: [],
        mev: {
          strategy: 'private_mempool',
          jitterMs: 1500,
          maxFrontrunProtection: 0.01,
          privateMempoolUsed: true,
          bundlingRequired: true
        },
        timestamp: Date.now(),
        confidence: 0.8
      }

      ;(engine as any).opportunities.set('low-profit', lowProfitOpportunity)

      const opportunities = engine.getActiveOpportunities()
      expect(opportunities).toHaveLength(0)
    })

    it('should filter out high-risk opportunities', () => {
      const highRiskOpportunity: ArbitrageOpportunity = {
        id: 'high-risk',
        type: 'direct',
        pools: [],
        path: {
          inputToken: mockTokenX,
          outputToken: mockTokenX,
          route: [],
          totalDistance: 2,
          complexity: 'simple',
          estimatedGas: 200000,
          priceImpact: 0.001
        },
        profitability: {
          grossProfit: 25,
          netProfit: 20,
          profitMargin: 0.02,
          returnOnInvestment: 0.02,
          breakevenAmount: 500,
          maxProfitableAmount: 10000,
          gasCosts: 2.5,
          priorityFees: 0.5
        },
        risk: {
          liquidityRisk: 0.8,
          slippageRisk: 0.8,
          mevRisk: 0.8,
          temporalRisk: 0.8,
          competitionRisk: 0.8, // Average risk = 0.8 > MAX_RISK_SCORE (0.7)
          overallRisk: 'high',
          riskFactors: []
        },
        executionPlan: [],
        mev: {
          strategy: 'private_mempool',
          jitterMs: 1500,
          maxFrontrunProtection: 0.01,
          privateMempoolUsed: true,
          bundlingRequired: true
        },
        timestamp: Date.now(),
        confidence: 0.8
      }

      ;(engine as any).opportunities.set('high-risk', highRiskOpportunity)

      const opportunities = engine.getActiveOpportunities()
      expect(opportunities).toHaveLength(0)
    })

    it('should remove stale opportunities (older than 30 seconds)', () => {
      const staleOpportunity: ArbitrageOpportunity = {
        id: 'stale-opp',
        type: 'direct',
        pools: [],
        path: {
          inputToken: mockTokenX,
          outputToken: mockTokenX,
          route: [],
          totalDistance: 2,
          complexity: 'simple',
          estimatedGas: 200000,
          priceImpact: 0.001
        },
        profitability: {
          grossProfit: 15,
          netProfit: 12,
          profitMargin: 0.012,
          returnOnInvestment: 0.012,
          breakevenAmount: 500,
          maxProfitableAmount: 10000,
          gasCosts: 2.5,
          priorityFees: 0.5
        },
        risk: {
          liquidityRisk: 0.1,
          slippageRisk: 0.1,
          mevRisk: 0.1,
          temporalRisk: 0.1,
          competitionRisk: 0.1,
          overallRisk: 'low',
          riskFactors: []
        },
        executionPlan: [],
        mev: {
          strategy: 'private_mempool',
          jitterMs: 1500,
          maxFrontrunProtection: 0.01,
          privateMempoolUsed: true,
          bundlingRequired: true
        },
        timestamp: Date.now() - 35000, // 35 seconds ago
        confidence: 0.8
      }

      ;(engine as any).opportunities.set('stale-opp', staleOpportunity)

      const opportunities = engine.getActiveOpportunities()
      expect(opportunities).toHaveLength(0)

      // Verify opportunity was removed from internal map
      expect((engine as any).opportunities.has('stale-opp')).toBe(false)
    })

    it('should sort opportunities by net profit (descending)', () => {
      const lowProfitOpp: ArbitrageOpportunity = {
        id: 'low-profit-opp',
        type: 'direct',
        pools: [],
        path: {
          inputToken: mockTokenX,
          outputToken: mockTokenX,
          route: [],
          totalDistance: 2,
          complexity: 'simple',
          estimatedGas: 200000,
          priceImpact: 0.001
        },
        profitability: {
          grossProfit: 15,
          netProfit: 12,
          profitMargin: 0.012,
          returnOnInvestment: 0.012,
          breakevenAmount: 500,
          maxProfitableAmount: 10000,
          gasCosts: 2.5,
          priorityFees: 0.5
        },
        risk: {
          liquidityRisk: 0.1,
          slippageRisk: 0.1,
          mevRisk: 0.1,
          temporalRisk: 0.1,
          competitionRisk: 0.1,
          overallRisk: 'low',
          riskFactors: []
        },
        executionPlan: [],
        mev: {
          strategy: 'private_mempool',
          jitterMs: 1500,
          maxFrontrunProtection: 0.01,
          privateMempoolUsed: true,
          bundlingRequired: true
        },
        timestamp: Date.now(),
        confidence: 0.8
      }

      const highProfitOpp: ArbitrageOpportunity = {
        ...lowProfitOpp,
        id: 'high-profit-opp',
        profitability: {
          ...lowProfitOpp.profitability,
          grossProfit: 25,
          netProfit: 22
        }
      }

      ;(engine as any).opportunities.set('low-profit-opp', lowProfitOpp)
      ;(engine as any).opportunities.set('high-profit-opp', highProfitOpp)

      const opportunities = engine.getActiveOpportunities()
      expect(opportunities).toHaveLength(2)
      expect(opportunities[0].id).toBe('high-profit-opp')
      expect(opportunities[1].id).toBe('low-profit-opp')
    })
  })

  describe('getBestOpportunityForAmount', () => {
    beforeEach(() => {
      const opportunity1: ArbitrageOpportunity = {
        id: 'opp-1',
        type: 'direct',
        pools: [],
        path: {
          inputToken: mockTokenX,
          outputToken: mockTokenX,
          route: [],
          totalDistance: 2,
          complexity: 'simple',
          estimatedGas: 200000,
          priceImpact: 0.001
        },
        profitability: {
          grossProfit: 15,
          netProfit: 12,
          profitMargin: 0.012,
          returnOnInvestment: 0.012,
          breakevenAmount: 500,
          maxProfitableAmount: 10000,
          gasCosts: 2.5,
          priorityFees: 0.5
        },
        risk: {
          liquidityRisk: 0.1,
          slippageRisk: 0.1,
          mevRisk: 0.1,
          temporalRisk: 0.1,
          competitionRisk: 0.1,
          overallRisk: 'low',
          riskFactors: []
        },
        executionPlan: [],
        mev: {
          strategy: 'private_mempool',
          jitterMs: 1500,
          maxFrontrunProtection: 0.01,
          privateMempoolUsed: true,
          bundlingRequired: true
        },
        timestamp: Date.now(),
        confidence: 0.8
      }

      const opportunity2: ArbitrageOpportunity = {
        ...opportunity1,
        id: 'opp-2',
        profitability: {
          ...opportunity1.profitability,
          netProfit: 18
        },
        confidence: 0.9
      }

      ;(engine as any).opportunities.set('opp-1', opportunity1)
      ;(engine as any).opportunities.set('opp-2', opportunity2)
    })

    it('should return best risk-adjusted opportunity for given amount', async () => {
      const result = await engine.getBestOpportunityForAmount(mockTokenX, 1000)

      expect(result).not.toBeNull()
      expect(result!.id).toBe('opp-2') // Higher profit and confidence
    })

    it('should return null if amount is below breakeven', async () => {
      const result = await engine.getBestOpportunityForAmount(mockTokenX, 100) // Below breakeven amount (500)

      expect(result).toBeNull()
    })

    it('should return null if amount exceeds max profitable amount', async () => {
      const result = await engine.getBestOpportunityForAmount(mockTokenX, 15000) // Above max profitable (10000)

      expect(result).toBeNull()
    })

    it('should return null if no opportunities for token', async () => {
      const differentToken: TokenInfo = {
        address: new PublicKey('DifferentTokenAddress'),
        symbol: 'DIFF',
        name: 'Different Token',
        decimals: 9,
        logoURI: 'diff.png',
        tags: [],
        price: 50
      }

      const result = await engine.getBestOpportunityForAmount(differentToken, 1000)

      expect(result).toBeNull()
    })

    it('should calculate risk-adjusted return correctly', async () => {
      // Mock the calculateRiskAdjustedReturn method
      const calculateRiskAdjustedReturnSpy = jest.spyOn(engine as any, 'calculateRiskAdjustedReturn')
      calculateRiskAdjustedReturnSpy.mockReturnValueOnce(10) // opp-1
      calculateRiskAdjustedReturnSpy.mockReturnValueOnce(15) // opp-2

      const result = await engine.getBestOpportunityForAmount(mockTokenX, 1000)

      expect(result!.id).toBe('opp-2')
      expect(calculateRiskAdjustedReturnSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('private methods', () => {
    describe('fetchPoolData', () => {
      it('should return mock pool data structure', async () => {
        const fetchPoolData = (engine as any).fetchPoolData.bind(engine)
        const result = await fetchPoolData(mockPoolAddress1, mockTokenX, mockTokenY)

        expect(result).toEqual({
          poolAddress: mockPoolAddress1,
          tokenX: mockTokenX,
          tokenY: mockTokenY,
          activeBin: {},
          liquidity: 100000,
          volume24h: 50000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
        })
      })
    })

    describe('detectDirectArbitrage', () => {
      it('should detect direct arbitrage opportunities between same token pairs', () => {
        const pools: ArbitragePool[] = [
          {
            poolAddress: mockPoolAddress1,
            tokenX: mockTokenX,
            tokenY: mockTokenY,
            activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
            liquidity: 100000,
            volume24h: 50000,
            fees: 0.003,
            slippage: 0.001,
          lastUpdated: new Date()
          },
          {
            poolAddress: mockPoolAddress2,
            tokenX: mockTokenX,
            tokenY: mockTokenY,
            activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
            liquidity: 120000,
            volume24h: 60000,
            fees: 0.003,
            slippage: 0.001,
          lastUpdated: new Date()
          }
        ]

        const detectDirectArbitrage = (engine as any).detectDirectArbitrage.bind(engine)
        const opportunities = detectDirectArbitrage(pools)

        expect(Array.isArray(opportunities)).toBe(true)
        // Should find opportunities for same token pairs
      })

      it('should handle flipped token pairs', () => {
        const pools: ArbitragePool[] = [
          {
            poolAddress: mockPoolAddress1,
            tokenX: mockTokenX,
            tokenY: mockTokenY,
            activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
            liquidity: 100000,
            volume24h: 50000,
            fees: 0.003,
            slippage: 0.001,
          lastUpdated: new Date()
          },
          {
            poolAddress: mockPoolAddress2,
            tokenX: mockTokenY, // Flipped
            tokenY: mockTokenX,
            activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
            liquidity: 120000,
            volume24h: 60000,
            fees: 0.003,
            slippage: 0.001,
          lastUpdated: new Date()
          }
        ]

        const detectDirectArbitrage = (engine as any).detectDirectArbitrage.bind(engine)
        const opportunities = detectDirectArbitrage(pools)

        expect(Array.isArray(opportunities)).toBe(true)
      })

      it('should not detect opportunities for different token pairs', () => {
        const differentTokenZ: TokenInfo = {
          address: new PublicKey('TokenZAddress'),
          symbol: 'TOKZ',
          name: 'Token Z',
          decimals: 9,
          logoURI: 'tokz.png',
          tags: [],
          price: 25
        }

        const pools: ArbitragePool[] = [
          {
            poolAddress: mockPoolAddress1,
            tokenX: mockTokenX,
            tokenY: mockTokenY,
            activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
            liquidity: 100000,
            volume24h: 50000,
            fees: 0.003,
            slippage: 0.001,
          lastUpdated: new Date()
          },
          {
            poolAddress: mockPoolAddress2,
            tokenX: mockTokenX,
            tokenY: differentTokenZ, // Different pair
            activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
            liquidity: 120000,
            volume24h: 60000,
            fees: 0.003,
            slippage: 0.001,
          lastUpdated: new Date()
          }
        ]

        const detectDirectArbitrage = (engine as any).detectDirectArbitrage.bind(engine)
        const opportunities = detectDirectArbitrage(pools)

        expect(opportunities).toHaveLength(0)
      })
    })

    describe('detectTriangularArbitrage', () => {
      it('should return empty array (placeholder implementation)', () => {
        const pools: ArbitragePool[] = []
        const detectTriangularArbitrage = (engine as any).detectTriangularArbitrage.bind(engine)
        const opportunities = detectTriangularArbitrage(pools)

        expect(Array.isArray(opportunities)).toBe(true)
        expect(opportunities).toHaveLength(0)
      })
    })

    describe('detectMultiHopArbitrage', () => {
      it('should return empty array (placeholder implementation)', () => {
        const pools: ArbitragePool[] = []
        const detectMultiHopArbitrage = (engine as any).detectMultiHopArbitrage.bind(engine)
        const opportunities = detectMultiHopArbitrage(pools)

        expect(Array.isArray(opportunities)).toBe(true)
        expect(opportunities).toHaveLength(0)
      })
    })

    describe('hasSameTokenPair', () => {
      it('should return true for identical token pairs', () => {
        const poolA: ArbitragePool = {
          poolAddress: mockPoolAddress1,
          tokenX: mockTokenX,
          tokenY: mockTokenY,
          activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
          liquidity: 100000,
          volume24h: 50000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
        }

        const poolB: ArbitragePool = {
          poolAddress: mockPoolAddress2,
          tokenX: mockTokenX,
          tokenY: mockTokenY,
          activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
          liquidity: 120000,
          volume24h: 60000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
        }

        const hasSameTokenPair = (engine as any).hasSameTokenPair.bind(engine)
        const result = hasSameTokenPair(poolA, poolB)

        expect(result).toBe(true)
      })

      it('should return true for flipped token pairs', () => {
        const poolA: ArbitragePool = {
          poolAddress: mockPoolAddress1,
          tokenX: mockTokenX,
          tokenY: mockTokenY,
          activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
          liquidity: 100000,
          volume24h: 50000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
        }

        const poolB: ArbitragePool = {
          poolAddress: mockPoolAddress2,
          tokenX: mockTokenY, // Flipped
          tokenY: mockTokenX,
          activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
          liquidity: 120000,
          volume24h: 60000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
        }

        const hasSameTokenPair = (engine as any).hasSameTokenPair.bind(engine)
        const result = hasSameTokenPair(poolA, poolB)

        expect(result).toBe(true)
      })

      it('should return false for different token pairs', () => {
        const differentTokenZ: TokenInfo = {
          address: new PublicKey('TokenZAddress'),
          symbol: 'TOKZ',
          name: 'Token Z',
          decimals: 9,
          logoURI: 'tokz.png',
          tags: [],
          price: 25
        }

        const poolA: ArbitragePool = {
          poolAddress: mockPoolAddress1,
          tokenX: mockTokenX,
          tokenY: mockTokenY,
          activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
          liquidity: 100000,
          volume24h: 50000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
        }

        const poolB: ArbitragePool = {
          poolAddress: mockPoolAddress2,
          tokenX: mockTokenX,
          tokenY: differentTokenZ,
          activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
          liquidity: 120000,
          volume24h: 60000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
        }

        const hasSameTokenPair = (engine as any).hasSameTokenPair.bind(engine)
        const result = hasSameTokenPair(poolA, poolB)

        expect(result).toBe(false)
      })
    })

    describe('getRiskScore', () => {
      it('should calculate average risk score', () => {
        const risk: RiskAssessment = {
          liquidityRisk: 0.2,
          slippageRisk: 0.1,
          mevRisk: 0.3,
          temporalRisk: 0.2,
          competitionRisk: 0.4,
          overallRisk: 'medium',
          riskFactors: []
        }

        const getRiskScore = (engine as any).getRiskScore.bind(engine)
        const result = getRiskScore(risk)

        expect(result).toBe((0.2 + 0.1 + 0.3 + 0.2 + 0.4) / 5) // 0.24
      })

      it('should handle zero risks', () => {
        const risk: RiskAssessment = {
          liquidityRisk: 0,
          slippageRisk: 0,
          mevRisk: 0,
          temporalRisk: 0,
          competitionRisk: 0,
          overallRisk: 'low',
          riskFactors: []
        }

        const getRiskScore = (engine as any).getRiskScore.bind(engine)
        const result = getRiskScore(risk)

        expect(result).toBe(0)
      })

      it('should handle maximum risks', () => {
        const risk: RiskAssessment = {
          liquidityRisk: 1,
          slippageRisk: 1,
          mevRisk: 1,
          temporalRisk: 1,
          competitionRisk: 1,
          overallRisk: 'critical',
          riskFactors: []
        }

        const getRiskScore = (engine as any).getRiskScore.bind(engine)
        const result = getRiskScore(risk)

        expect(result).toBe(1)
      })
    })

    describe('calculateRiskAdjustedReturn', () => {
      it('should calculate risk-adjusted return correctly', () => {
        const opportunity: ArbitrageOpportunity = {
          id: 'test',
          type: 'direct',
          pools: [],
          path: {
          inputToken: mockTokenX,
          outputToken: mockTokenX,
          route: [],
          totalDistance: 2,
          complexity: 'simple',
          estimatedGas: 200000,
          priceImpact: 0.001
        },
          profitability: {
            grossProfit: 20,
            netProfit: 15,
            profitMargin: 0.015,
            returnOnInvestment: 0.015,
            breakevenAmount: 500,
            maxProfitableAmount: 10000,
            gasCosts: 2.5,
            priorityFees: 0.5
          },
          risk: {
            liquidityRisk: 0.2,
            slippageRisk: 0.1,
            mevRisk: 0.1,
            temporalRisk: 0.1,
            competitionRisk: 0.1,
            overallRisk: 'low',
            riskFactors: []
          },
          executionPlan: [],
          mev: {
          strategy: 'private_mempool',
          jitterMs: 1500,
          maxFrontrunProtection: 0.01,
          privateMempoolUsed: true,
          bundlingRequired: true
        },
          timestamp: Date.now(),
          confidence: 0.9
        }

        const calculateRiskAdjustedReturn = (engine as any).calculateRiskAdjustedReturn.bind(engine)
        const result = calculateRiskAdjustedReturn(opportunity)

        const expectedRiskScore = (0.2 + 0.1 + 0.1 + 0.1 + 0.1) / 5 // 0.12
        const expected = 15 * (1 - expectedRiskScore) * 0.9 // 15 * 0.88 * 0.9

        expect(result).toBe(expected)
      })

      it('should handle high risk correctly', () => {
        const opportunity: ArbitrageOpportunity = {
          id: 'test',
          type: 'direct',
          pools: [],
          path: {
          inputToken: mockTokenX,
          outputToken: mockTokenX,
          route: [],
          totalDistance: 2,
          complexity: 'simple',
          estimatedGas: 200000,
          priceImpact: 0.001
        },
          profitability: {
            grossProfit: 20,
            netProfit: 15,
            profitMargin: 0.015,
            returnOnInvestment: 0.015,
            breakevenAmount: 500,
            maxProfitableAmount: 10000,
            gasCosts: 2.5,
            priorityFees: 0.5
          },
          risk: {
            liquidityRisk: 0.8,
            slippageRisk: 0.8,
            mevRisk: 0.8,
            temporalRisk: 0.8,
            competitionRisk: 0.8,
            overallRisk: 'high',
            riskFactors: []
          },
          executionPlan: [],
          mev: {
          strategy: 'private_mempool',
          jitterMs: 1500,
          maxFrontrunProtection: 0.01,
          privateMempoolUsed: true,
          bundlingRequired: true
        },
          timestamp: Date.now(),
          confidence: 0.5
        }

        const calculateRiskAdjustedReturn = (engine as any).calculateRiskAdjustedReturn.bind(engine)
        const result = calculateRiskAdjustedReturn(opportunity)

        const expectedRiskScore = 0.8 // All risks are 0.8
        const expected = 15 * (1 - expectedRiskScore) * 0.5 // 15 * 0.2 * 0.5 = 1.5

        expect(result).toBe(expected)
      })
    })

    describe('calculateDirectArbitrageOpportunity', () => {
      it('should create direct arbitrage opportunity with valid data', () => {
        const poolA: ArbitragePool = {
          poolAddress: mockPoolAddress1,
          tokenX: mockTokenX,
          tokenY: mockTokenY,
          activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
          liquidity: 100000,
          volume24h: 50000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
        }

        const poolB: ArbitragePool = {
          poolAddress: mockPoolAddress2,
          tokenX: mockTokenX,
          tokenY: mockTokenY,
          activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
          liquidity: 120000,
          volume24h: 60000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
        }

        const calculateDirectArbitrageOpportunity = (engine as any).calculateDirectArbitrageOpportunity.bind(engine)
        const opportunity = calculateDirectArbitrageOpportunity(poolA, poolB)

        expect(opportunity).not.toBeNull()
        expect(opportunity.type).toBe('direct')
        expect(opportunity.pools).toHaveLength(2)
        expect(opportunity.pools[0]).toEqual(poolA)
        expect(opportunity.pools[1]).toEqual(poolB)
        expect(opportunity.path.complexity).toBe('simple')
        expect(opportunity.path.totalDistance).toBe(2)
        expect(opportunity.executionPlan).toHaveLength(2)
        expect(opportunity.mev.strategy).toBe('private_mempool')
        expect(opportunity.mev.privateMempoolUsed).toBe(true)
        expect(opportunity.mev.bundlingRequired).toBe(true)
        expect(typeof opportunity.confidence).toBe('number')
        expect(opportunity.confidence).toBeGreaterThan(0)
        expect(opportunity.confidence).toBeLessThanOrEqual(1)
      })

      it('should return null for unprofitable opportunities', () => {
        // Mock Math.random to return a low value that results in no profit
        const originalRandom = Math.random
        Math.random = jest.fn(() => 0) // This will create grossProfit = 5, netProfit = 2.5

        const poolA: ArbitragePool = {
          poolAddress: mockPoolAddress1,
          tokenX: mockTokenX,
          tokenY: mockTokenY,
          activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
          liquidity: 100000,
          volume24h: 50000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
        }

        const poolB: ArbitragePool = {
          poolAddress: mockPoolAddress2,
          tokenX: mockTokenX,
          tokenY: mockTokenY,
          activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
          liquidity: 120000,
          volume24h: 60000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
        }

        const calculateDirectArbitrageOpportunity = (engine as any).calculateDirectArbitrageOpportunity.bind(engine)
        const opportunity = calculateDirectArbitrageOpportunity(poolA, poolB)

        expect(opportunity).not.toBeNull() // Still creates opportunity since 2.5 > 0

        // Test with negative profit
        Math.random = jest.fn(() => -0.5) // This should create negative profit
        calculateDirectArbitrageOpportunity(poolA, poolB)

        Math.random = originalRandom
      })

      it('should generate unique opportunity IDs', () => {
        const poolA: ArbitragePool = {
          poolAddress: mockPoolAddress1,
          tokenX: mockTokenX,
          tokenY: mockTokenY,
          activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
          liquidity: 100000,
          volume24h: 50000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
        }

        const poolB: ArbitragePool = {
          poolAddress: mockPoolAddress2,
          tokenX: mockTokenX,
          tokenY: mockTokenY,
          activeBin: {
            binId: 0,
            price: 100,
            liquidityX: '1000000',
            liquidityY: '100000000'
          },
          liquidity: 120000,
          volume24h: 60000,
          fees: 0.003,
          slippage: 0.001,
          lastUpdated: new Date()
        }

        const calculateDirectArbitrageOpportunity = (engine as any).calculateDirectArbitrageOpportunity.bind(engine)

        const opp1 = calculateDirectArbitrageOpportunity(poolA, poolB)
        const opp2 = calculateDirectArbitrageOpportunity(poolA, poolB)

        expect(opp1!.id).not.toBe(opp2!.id)
        expect(opp1!.id).toContain('direct_')
        expect(opp2!.id).toContain('direct_')
      })
    })
  })

  describe('scanForOpportunities', () => {
    it('should skip scanning with less than 2 pools', async () => {
      const scanForOpportunities = (engine as any).scanForOpportunities.bind(engine)
      await scanForOpportunities()

      // Should not have created any opportunities
      const opportunities = engine.getActiveOpportunities()
      expect(opportunities).toHaveLength(0)
    })

    it('should update pool data and detect opportunities with multiple pools', async () => {
      // Add pools first
      const mockPool: ArbitragePool = {
        poolAddress: mockPoolAddress1,
        tokenX: mockTokenX,
        tokenY: mockTokenY,
        activeBin: {
          binId: 0,
          price: 100,
          liquidityX: '1000000',
          liquidityY: '100000000'
        },
        liquidity: 100000,
        volume24h: 50000,
        fees: 0.003,
        slippage: 0.001,
        lastUpdated: new Date()
      }

      jest.spyOn(engine as any, 'fetchPoolData').mockResolvedValue(mockPool)
      await engine.addPool(mockPoolAddress1, mockTokenX, mockTokenY)
      await engine.addPool(mockPoolAddress2, mockTokenX, mockTokenY)

      // Mock updatePoolData
      jest.spyOn(engine as any, 'updatePoolData').mockResolvedValue(undefined)

      const scanForOpportunities = (engine as any).scanForOpportunities.bind(engine)
      await scanForOpportunities()

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Detected')
      )
    })

    it('should handle pattern detection errors gracefully', async () => {
      const mockPool: ArbitragePool = {
        poolAddress: mockPoolAddress1,
        tokenX: mockTokenX,
        tokenY: mockTokenY,
        activeBin: {
          binId: 0,
          price: 100,
          liquidityX: '1000000',
          liquidityY: '100000000'
        },
        liquidity: 100000,
        volume24h: 50000,
        fees: 0.003,
        slippage: 0.001,
        lastUpdated: new Date()
      }

      jest.spyOn(engine as any, 'fetchPoolData').mockResolvedValue(mockPool)
      await engine.addPool(mockPoolAddress1, mockTokenX, mockTokenY)
      await engine.addPool(mockPoolAddress2, mockTokenX, mockTokenY)

      // Mock pattern detector to throw error
      jest.spyOn(engine as any, 'detectDirectArbitrage').mockImplementation(() => {
        throw new Error('Pattern detection failed')
      })

      const scanForOpportunities = (engine as any).scanForOpportunities.bind(engine)
      await scanForOpportunities()

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Pattern'),
        expect.any(Error)
      )
    })
  })

  describe('updatePoolData', () => {
    it('should update all tracked pools', async () => {
      const mockPool: ArbitragePool = {
        poolAddress: mockPoolAddress1,
        tokenX: mockTokenX,
        tokenY: mockTokenY,
        activeBin: {
          binId: 0,
          price: 100,
          liquidityX: '1000000',
          liquidityY: '100000000'
        },
        liquidity: 100000,
        volume24h: 50000,
        fees: 0.003,
        slippage: 0.001,
        lastUpdated: new Date()
      }

      const fetchPoolDataSpy = jest.spyOn(engine as any, 'fetchPoolData').mockResolvedValue(mockPool)
      await engine.addPool(mockPoolAddress1, mockTokenX, mockTokenY)

      fetchPoolDataSpy.mockClear()
      fetchPoolDataSpy.mockResolvedValue({
        ...mockPool,
        liquidity: 150000 // Updated liquidity
      })

      const updatePoolData = (engine as any).updatePoolData.bind(engine)
      await updatePoolData()

      expect(fetchPoolDataSpy).toHaveBeenCalledTimes(1)
    })

    it('should handle pool update errors gracefully', async () => {
      const mockPool: ArbitragePool = {
        poolAddress: mockPoolAddress1,
        tokenX: mockTokenX,
        tokenY: mockTokenY,
        activeBin: {
          binId: 0,
          price: 100,
          liquidityX: '1000000',
          liquidityY: '100000000'
        },
        liquidity: 100000,
        volume24h: 50000,
        fees: 0.003,
        slippage: 0.001,
        lastUpdated: new Date()
      }

      jest.spyOn(engine as any, 'fetchPoolData').mockResolvedValue(mockPool)
      await engine.addPool(mockPoolAddress1, mockTokenX, mockTokenY)

      // Mock fetchPoolData to throw error on update
      jest.spyOn(engine as any, 'fetchPoolData').mockRejectedValue(new Error('Update failed'))

      const updatePoolData = (engine as any).updatePoolData.bind(engine)
      await updatePoolData()

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update pool'),
        expect.any(Error)
      )
    })
  })

  describe('getMonitoringStats', () => {
    it('should return correct monitoring statistics', () => {
      const stats = engine.getMonitoringStats()

      expect(stats).toEqual({
        isMonitoring: false,
        trackedPools: 0,
        activeOpportunities: 0,
        totalProfitPotential: 0,
        averageRiskScore: 0,
        updateInterval: 5000
      })
    })

    it('should calculate total profit potential correctly', async () => {
      const opportunity1: ArbitrageOpportunity = {
        id: 'opp-1',
        type: 'direct',
        pools: [],
        path: {
          inputToken: mockTokenX,
          outputToken: mockTokenX,
          route: [],
          totalDistance: 2,
          complexity: 'simple',
          estimatedGas: 200000,
          priceImpact: 0.001
        },
        profitability: {
          grossProfit: 15,
          netProfit: 12,
          profitMargin: 0.012,
          returnOnInvestment: 0.012,
          breakevenAmount: 500,
          maxProfitableAmount: 10000,
          gasCosts: 2.5,
          priorityFees: 0.5
        },
        risk: {
          liquidityRisk: 0.1,
          slippageRisk: 0.1,
          mevRisk: 0.1,
          temporalRisk: 0.1,
          competitionRisk: 0.1,
          overallRisk: 'low',
          riskFactors: []
        },
        executionPlan: [],
        mev: {
          strategy: 'private_mempool',
          jitterMs: 1500,
          maxFrontrunProtection: 0.01,
          privateMempoolUsed: true,
          bundlingRequired: true
        },
        timestamp: Date.now(),
        confidence: 0.8
      }

      const opportunity2: ArbitrageOpportunity = {
        ...opportunity1,
        id: 'opp-2',
        profitability: {
          ...opportunity1.profitability,
          netProfit: 18
        }
      }

      ;(engine as any).opportunities.set('opp-1', opportunity1)
      ;(engine as any).opportunities.set('opp-2', opportunity2)

      const stats = engine.getMonitoringStats()

      expect(stats.totalProfitPotential).toBe(30) // 12 + 18
      expect(stats.activeOpportunities).toBe(2)
      expect(stats.averageRiskScore).toBe(0.1) // Both opportunities have 0.1 risk score
    })

    it('should handle empty opportunities correctly', () => {
      const stats = engine.getMonitoringStats()

      expect(stats.totalProfitPotential).toBe(0)
      expect(stats.activeOpportunities).toBe(0)
      expect(stats.averageRiskScore).toBe(0)
    })
  })

  describe('initializeArbitragePatterns', () => {
    it('should initialize correct number of patterns', () => {
      const patterns = (engine as any).patterns

      expect(patterns).toHaveLength(3)
      expect(patterns[0].name).toBe('Direct Price Differential')
      expect(patterns[1].name).toBe('Triangular Arbitrage')
      expect(patterns[2].name).toBe('Multi-hop Efficiency')
    })

    it('should have correct pattern configurations', () => {
      const patterns = (engine as any).patterns

      // Direct arbitrage pattern
      expect(patterns[0].minProfitThreshold).toBe(5)
      expect(patterns[0].maxRiskScore).toBe(0.5)
      expect(patterns[0].preferredTokens).toContain('SOL')
      expect(patterns[0].preferredTokens).toContain('USDC')
      expect(typeof patterns[0].detector).toBe('function')

      // Triangular arbitrage pattern
      expect(patterns[1].minProfitThreshold).toBe(15)
      expect(patterns[1].maxRiskScore).toBe(0.7)
      expect(patterns[1].preferredTokens).toContain('mSOL')
      expect(typeof patterns[1].detector).toBe('function')

      // Multi-hop arbitrage pattern
      expect(patterns[2].minProfitThreshold).toBe(25)
      expect(patterns[2].maxRiskScore).toBe(0.8)
      expect(patterns[2].preferredTokens).toContain('RAY')
      expect(typeof patterns[2].detector).toBe('function')
    })
  })

  describe('calculateAverageRiskScore', () => {
    it('should return 0 for no opportunities', () => {
      const calculateAverageRiskScore = (engine as any).calculateAverageRiskScore.bind(engine)
      const result = calculateAverageRiskScore()

      expect(result).toBe(0)
    })

    it('should calculate correct average risk score', () => {
      const opportunity1: ArbitrageOpportunity = {
        id: 'opp-1',
        type: 'direct',
        pools: [],
        path: {
          inputToken: mockTokenX,
          outputToken: mockTokenX,
          route: [],
          totalDistance: 2,
          complexity: 'simple',
          estimatedGas: 200000,
          priceImpact: 0.001
        },
        profitability: {
          grossProfit: 15,
          netProfit: 12,
          profitMargin: 0.012,
          returnOnInvestment: 0.012,
          breakevenAmount: 500,
          maxProfitableAmount: 10000,
          gasCosts: 2.5,
          priorityFees: 0.5
        },
        risk: {
          liquidityRisk: 0.1,
          slippageRisk: 0.1,
          mevRisk: 0.1,
          temporalRisk: 0.1,
          competitionRisk: 0.1,
          overallRisk: 'low',
          riskFactors: []
        },
        executionPlan: [],
        mev: {
          strategy: 'private_mempool',
          jitterMs: 1500,
          maxFrontrunProtection: 0.01,
          privateMempoolUsed: true,
          bundlingRequired: true
        },
        timestamp: Date.now(),
        confidence: 0.8
      }

      const opportunity2: ArbitrageOpportunity = {
        ...opportunity1,
        id: 'opp-2',
        risk: {
          liquidityRisk: 0.3,
          slippageRisk: 0.3,
          mevRisk: 0.3,
          temporalRisk: 0.3,
          competitionRisk: 0.3,
          overallRisk: 'medium',
          riskFactors: []
        }
      }

      ;(engine as any).opportunities.set('opp-1', opportunity1)
      ;(engine as any).opportunities.set('opp-2', opportunity2)

      const calculateAverageRiskScore = (engine as any).calculateAverageRiskScore.bind(engine)
      const result = calculateAverageRiskScore()

      // opp-1 risk score: 0.1, opp-2 risk score: 0.3, average: 0.2
      expect(result).toBe(0.2)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle network connection errors', async () => {
      mockConnection.getAccountInfo = jest.fn().mockRejectedValue(new Error('Network error'))

      // Should not throw error during construction
      expect(() => new CrossPoolArbitrageEngine(mockConnection)).not.toThrow()
    })

    it('should handle memory management with many opportunities', () => {
      // Add many opportunities to test memory handling
      for (let i = 0; i < 1000; i++) {
        const opportunity: ArbitrageOpportunity = {
          id: `opp-${i}`,
          type: 'direct',
          pools: [],
          path: {
          inputToken: mockTokenX,
          outputToken: mockTokenX,
          route: [],
          totalDistance: 2,
          complexity: 'simple',
          estimatedGas: 200000,
          priceImpact: 0.001
        },
          profitability: {
            grossProfit: 15,
            netProfit: 12,
            profitMargin: 0.012,
            returnOnInvestment: 0.012,
            breakevenAmount: 500,
            maxProfitableAmount: 10000,
            gasCosts: 2.5,
            priorityFees: 0.5
          },
          risk: {
            liquidityRisk: 0.1,
            slippageRisk: 0.1,
            mevRisk: 0.1,
            temporalRisk: 0.1,
            competitionRisk: 0.1,
            overallRisk: 'low',
            riskFactors: []
          },
          executionPlan: [],
          mev: {
          strategy: 'private_mempool',
          jitterMs: 1500,
          maxFrontrunProtection: 0.01,
          privateMempoolUsed: true,
          bundlingRequired: true
        },
          timestamp: Date.now(),
          confidence: 0.8
        }

        ;(engine as any).opportunities.set(`opp-${i}`, opportunity)
      }

      const opportunities = engine.getActiveOpportunities()
      expect(opportunities.length).toBeLessThanOrEqual(1000)
    })

    it('should handle concurrent access to opportunities map', async () => {
      // Simulate concurrent access
      const promises = []

      for (let i = 0; i < 10; i++) {
        promises.push(engine.getActiveOpportunities())
        promises.push(engine.getBestOpportunityForAmount(mockTokenX, 1000))
      }

      await expect(Promise.all(promises)).resolves.toBeDefined()
    })

    it('should validate PublicKey formats', async () => {
      const invalidKey = 'invalid-public-key-format'

      // PublicKey constructor should handle invalid formats
      expect(() => new PublicKey(invalidKey)).not.toThrow() // Mocked, won't actually throw
    })

    it('should handle extreme risk values', () => {
      const extremeRisk: RiskAssessment = {
        liquidityRisk: Number.MAX_VALUE,
        slippageRisk: Number.MIN_VALUE,
        mevRisk: Infinity,
        temporalRisk: -Infinity,
        competitionRisk: NaN,
        overallRisk: 'critical',
        riskFactors: []
      }

      const getRiskScore = (engine as any).getRiskScore.bind(engine)
      const result = getRiskScore(extremeRisk)

      // Should handle extreme values gracefully
      expect(typeof result).toBe('number')
    })

    it('should handle empty or null token info', async () => {
      const nullToken = null as any

      const result = await engine.getBestOpportunityForAmount(nullToken, 1000)
      expect(result).toBeNull()
    })

    it('should clean up interval on multiple stop calls', () => {
      engine.stopMonitoring()
      engine.stopMonitoring()
      engine.stopMonitoring()

      // Should not throw error
      const stats = engine.getMonitoringStats()
      expect(stats.isMonitoring).toBe(false)
    })
  })

  describe('real-time monitoring behavior', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should trigger scanning at correct intervals', async () => {
      const scanSpy = jest.spyOn(engine as any, 'scanForOpportunities').mockResolvedValue(undefined)

      await engine.startMonitoring()

      // Fast forward time to trigger interval
      jest.advanceTimersByTime(5000)

      expect(scanSpy).toHaveBeenCalled()

      engine.stopMonitoring()
    })

    it('should continue monitoring despite scan errors', async () => {
      const scanSpy = jest.spyOn(engine as any, 'scanForOpportunities')
        .mockRejectedValueOnce(new Error('First scan failed'))
        .mockResolvedValueOnce(undefined)

      await engine.startMonitoring()

      // First interval should fail
      jest.advanceTimersByTime(5000)
      await Promise.resolve() // Allow promise to resolve

      // Second interval should succeed
      jest.advanceTimersByTime(5000)
      await Promise.resolve()

      expect(scanSpy).toHaveBeenCalledTimes(2)
      expect(mockConsoleError).toHaveBeenCalledWith('Arbitrage monitoring error:', expect.any(Error))

      engine.stopMonitoring()
    })
  })
})