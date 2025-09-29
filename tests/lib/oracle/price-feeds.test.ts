import { Connection } from '@solana/web3.js'

// Mock the dlmm client module before importing anything else
jest.mock('../../../src/lib/dlmm/client', () => ({
  dlmmClient: {
    getConnection: jest.fn(() => ({
      getAccountInfo: jest.fn(),
      getMultipleAccountsInfo: jest.fn(),
    }))
  }
}))

import { OraclePriceFeeds, PriceFeedConfig } from '../../../src/lib/oracle/price-feeds'

// Mock Solana Web3.js
const mockConnection = {
  getAccountInfo: jest.fn(),
  getMultipleAccountsInfo: jest.fn(),
} as unknown as Connection


describe('OraclePriceFeeds', () => {
  let oracleFeeds: OraclePriceFeeds
  let consoleSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()

    oracleFeeds = new OraclePriceFeeds(mockConnection)

    // Spy on console methods
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // Mock Math.random for consistent test results
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  afterEach(() => {
    jest.useRealTimers()
    consoleSpy.mockRestore()
    jest.restoreAllMocks()
  })

  describe('Constructor', () => {
    it('should initialize with connection and log initialization', () => {
      const testConnection = mockConnection
      const oracle = new OraclePriceFeeds(testConnection)

      expect(oracle).toBeInstanceOf(OraclePriceFeeds)
      expect(consoleSpy).toHaveBeenCalledWith('🔮 OraclePriceFeeds: Initialized with multi-provider support')
    })
  })

  describe('getTokenPrice', () => {
    describe('Cache behavior', () => {
      it('should return cached price when within cache duration', async () => {
        const symbol = 'SOL'

        // First call - should fetch from oracle
        const firstCall = await oracleFeeds.getTokenPrice(symbol)
        expect(firstCall.source).toBe('pyth')

        // Clear console spy to check only the cache call
        consoleSpy.mockClear()

        // Advance time by 5 seconds (less than 10s cache duration)
        jest.advanceTimersByTime(5000)

        // Second call - should return from cache
        const secondCall = await oracleFeeds.getTokenPrice(symbol)

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(`✅ Price loaded from cache for ${symbol}:`),
          expect.any(Number)
        )
        expect(secondCall.source).toBe('pyth')
      })

      it('should fetch new price when cache is expired', async () => {
        const symbol = 'USDC'

        // First call
        await oracleFeeds.getTokenPrice(symbol)

        // Advance time beyond cache duration (10 seconds)
        jest.advanceTimersByTime(11000)

        // Second call - should fetch new price
        await oracleFeeds.getTokenPrice(symbol)

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(`🔄 Fetching price for ${symbol} from oracles...`)
        )
      })
    })

    describe('Provider fallback mechanism', () => {
      it('should use Pyth price when available', async () => {
        const symbol = 'SOL'
        const result = await oracleFeeds.getTokenPrice(symbol)

        expect(result.source).toBe('pyth')
        expect(result.symbol).toBe(symbol)
        expect(result.price).toBeCloseTo(100, 1) // SOL fallback price ±5%
        expect(result.confidence).toBeGreaterThanOrEqual(0.95)
        expect(result.confidence).toBeLessThanOrEqual(0.99)
        expect(result.timestamp).toBeInstanceOf(Date)
      })

      it('should fallback to Switchboard when Pyth fails', async () => {
        // Mock fetchPythPrice to throw error
        const fetchPythPriceSpy = jest.spyOn(oracleFeeds as any, 'fetchPythPrice')
          .mockRejectedValueOnce(new Error('Pyth error'))

        const symbol = 'ETH'
        const result = await oracleFeeds.getTokenPrice(symbol)

        expect(result.source).toBe('switchboard')
        expect(result.symbol).toBe(symbol)
        expect(result.price).toBeCloseTo(3000, 200) // ETH fallback price ±4%
        expect(result.confidence).toBeGreaterThanOrEqual(0.93)
        expect(result.confidence).toBeLessThanOrEqual(0.98)

        fetchPythPriceSpy.mockRestore()
      })

      it('should use fallback price when all oracles fail', async () => {
        // Mock both providers to fail
        const fetchPythPriceSpy = jest.spyOn(oracleFeeds as any, 'fetchPythPrice')
          .mockRejectedValue(new Error('Pyth error'))
        const fetchSwitchboardPriceSpy = jest.spyOn(oracleFeeds as any, 'fetchSwitchboardPrice')
          .mockRejectedValue(new Error('Switchboard error'))

        const symbol = 'RAY'
        const result = await oracleFeeds.getTokenPrice(symbol)

        expect(result.source).toBe('fallback')
        expect(result.symbol).toBe(symbol)
        expect(result.price).toBe(2.5) // RAY fallback price
        expect(result.confidence).toBe(0.5)

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(`⚡ Using fallback price for ${symbol}:`),
          2.5
        )

        fetchPythPriceSpy.mockRestore()
        fetchSwitchboardPriceSpy.mockRestore()
      })
    })

    describe('Error handling', () => {
      it('should return fallback price for unsupported token', async () => {
        const symbol = 'UNSUPPORTED_TOKEN'
        const result = await oracleFeeds.getTokenPrice(symbol)

        expect(result.source).toBe('fallback')
        expect(result.symbol).toBe(symbol)
        expect(result.price).toBe(0) // No fallback price configured
        expect(result.confidence).toBe(0)
      })

      it('should handle general errors gracefully', async () => {
        // Force an error in the main try block by making the cache throw
        const symbol = 'SOL'
        const originalGet = oracleFeeds['priceCache'].get
        oracleFeeds['priceCache'].get = jest.fn(() => {
          throw new Error('Cache error')
        })

        const result = await oracleFeeds.getTokenPrice(symbol)

        expect(result.source).toBe('fallback')
        expect(result.price).toBe(100) // SOL fallback price
        expect(result.confidence).toBe(0)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('❌ Error getting price for SOL:'),
          expect.any(Error)
        )

        // Restore original method
        oracleFeeds['priceCache'].get = originalGet
      })
    })

    describe('Price validation and boundaries', () => {
      it('should handle extreme price variations within bounds', async () => {
        // Mock Math.random to return extreme values
        jest.spyOn(Math, 'random')
          .mockReturnValueOnce(0.95) // +5% variation
          .mockReturnValueOnce(0.05) // -5% variation

        const symbol1 = 'SOL'
        const symbol2 = 'USDC'

        const result1 = await oracleFeeds.getTokenPrice(symbol1)
        const result2 = await oracleFeeds.getTokenPrice(symbol2)

        // Should be within reasonable bounds
        expect(result1.price).toBeGreaterThan(95)  // 100 - 5%
        expect(result1.price).toBeLessThan(105)    // 100 + 5%
        expect(result2.price).toBeGreaterThan(0.95) // 1 - 5%
        expect(result2.price).toBeLessThan(1.05)   // 1 + 5%
      })

      it('should format prices with proper precision', async () => {
        const symbol = 'SOL'
        const result = await oracleFeeds.getTokenPrice(symbol)

        // Price should be formatted to 6 decimal places
        const decimalPlaces = result.price.toString().split('.')[1]?.length || 0
        expect(decimalPlaces).toBeLessThanOrEqual(6)
      })
    })
  })

  describe('getMultipleTokenPrices', () => {
    it('should fetch prices for multiple tokens successfully', async () => {
      const symbols = ['SOL', 'USDC', 'ETH']
      const result = await oracleFeeds.getMultipleTokenPrices(symbols)

      expect(Object.keys(result)).toEqual(symbols)
      expect(result.SOL.symbol).toBe('SOL')
      expect(result.USDC.symbol).toBe('USDC')
      expect(result.ETH.symbol).toBe('ETH')

      expect(consoleSpy).toHaveBeenCalledWith(
        `🔄 Fetching prices for ${symbols.length} tokens:`,
        symbols
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        '✅ Multiple token prices fetched:',
        symbols
      )
    })

    it('should handle partial failures gracefully', async () => {
      // Mock getTokenPrice to fail for one symbol
      const originalGetTokenPrice = oracleFeeds.getTokenPrice
      oracleFeeds.getTokenPrice = jest.fn()
        .mockResolvedValueOnce({
          symbol: 'SOL',
          price: 100,
          confidence: 0.95,
          timestamp: new Date(),
          source: 'pyth' as const
        })
        .mockRejectedValueOnce(new Error('Failed to get BADTOKEN price'))

      const symbols = ['SOL', 'BADTOKEN']
      const result = await oracleFeeds.getMultipleTokenPrices(symbols)

      expect(result.SOL.source).toBe('pyth')
      expect(result.BADTOKEN.source).toBe('fallback')
      expect(result.BADTOKEN.price).toBe(0)
      expect(result.BADTOKEN.confidence).toBe(0)

      // Restore original method
      oracleFeeds.getTokenPrice = originalGetTokenPrice
    })

    it('should return fallback prices when Promise.allSettled throws', async () => {
      // Mock Promise.allSettled to throw
      const originalAllSettled = Promise.allSettled
      Promise.allSettled = jest.fn().mockRejectedValue(new Error('Promise.allSettled error'))

      const symbols = ['SOL', 'USDC']
      const result = await oracleFeeds.getMultipleTokenPrices(symbols)

      expect(result.SOL.source).toBe('fallback')
      expect(result.SOL.price).toBe(100)
      expect(result.USDC.source).toBe('fallback')
      expect(result.USDC.price).toBe(1)

      // Restore original method
      Promise.allSettled = originalAllSettled
    })

    it('should handle empty symbols array', async () => {
      const symbols: string[] = []
      const result = await oracleFeeds.getMultipleTokenPrices(symbols)

      expect(result).toEqual({})
      expect(consoleSpy).toHaveBeenCalledWith(
        '🔄 Fetching prices for 0 tokens:',
        []
      )
    })

    it('should handle symbols with undefined fallback price in multiple fetch', async () => {
      // Mock getTokenPrice to reject for a symbol
      const originalGetTokenPrice = oracleFeeds.getTokenPrice
      oracleFeeds.getTokenPrice = jest.fn()
        .mockRejectedValue(new Error('All oracles failed'))

      const symbols = ['UNDEFINED_FALLBACK_TOKEN']
      const result = await oracleFeeds.getMultipleTokenPrices(symbols)

      expect(result['UNDEFINED_FALLBACK_TOKEN'].source).toBe('fallback')
      expect(result['UNDEFINED_FALLBACK_TOKEN'].price).toBe(0) // Should use 0 when no config found
      expect(result['UNDEFINED_FALLBACK_TOKEN'].confidence).toBe(0)

      // Restore original method
      oracleFeeds.getTokenPrice = originalGetTokenPrice
    })
  })

  describe('Private oracle methods', () => {
    describe('fetchPythPrice', () => {
      it('should simulate Pyth price data correctly', async () => {
        const symbol = 'SOL'
        const priceId = 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'

        const result = await oracleFeeds['fetchPythPrice'](symbol, priceId)

        expect(result.symbol).toBe(symbol)
        expect(result.source).toBe('pyth')
        expect(result.price).toBeCloseTo(100, 10) // SOL base price ±5%
        expect(result.confidence).toBeGreaterThanOrEqual(0.95)
        expect(result.confidence).toBeLessThanOrEqual(0.99)
        expect(result.timestamp).toBeInstanceOf(Date)
      })

      it('should handle different base prices for different tokens', async () => {
        const ethResult = await oracleFeeds['fetchPythPrice']('ETH', 'eth-price-id')
        const usdcResult = await oracleFeeds['fetchPythPrice']('USDC', 'usdc-price-id')

        expect(ethResult.price).toBeCloseTo(3000, 300) // ETH base price
        expect(usdcResult.price).toBeCloseTo(1, 0.1)   // USDC base price
      })
    })

    describe('fetchSwitchboardPrice', () => {
      it('should simulate Switchboard price data correctly', async () => {
        const symbol = 'RAY'
        const feedId = '3Qub3HaAJaa2xNY7SUqPKd3vVwTqDfHF7WqXqyLkGwn3'

        const result = await oracleFeeds['fetchSwitchboardPrice'](symbol, feedId)

        expect(result.symbol).toBe(symbol)
        expect(result.source).toBe('switchboard')
        expect(result.price).toBeCloseTo(2.5, 0.2) // RAY base price ±4%
        expect(result.confidence).toBeGreaterThanOrEqual(0.93)
        expect(result.confidence).toBeLessThanOrEqual(0.98)
        expect(result.timestamp).toBeInstanceOf(Date)
      })

      it('should use different variation rates than Pyth', async () => {
        // Test multiple calls to verify different variation ranges
        const pythResults = await Promise.all([
          oracleFeeds['fetchPythPrice']('SOL', 'pyth-id'),
          oracleFeeds['fetchPythPrice']('SOL', 'pyth-id'),
          oracleFeeds['fetchPythPrice']('SOL', 'pyth-id')
        ])

        const switchboardResults = await Promise.all([
          oracleFeeds['fetchSwitchboardPrice']('SOL', 'switchboard-id'),
          oracleFeeds['fetchSwitchboardPrice']('SOL', 'switchboard-id'),
          oracleFeeds['fetchSwitchboardPrice']('SOL', 'switchboard-id')
        ])

        // Both should use base price but potentially different variations
        expect(pythResults.every(r => r.source === 'pyth')).toBe(true)
        expect(switchboardResults.every(r => r.source === 'switchboard')).toBe(true)
      })
    })
  })

  describe('getPositionValue', () => {
    it('should calculate position value correctly', async () => {
      const tokenXSymbol = 'USDC'
      const tokenYSymbol = 'SOL'
      const tokenXAmount = '1000' // 1000 USDC
      const tokenYAmount = '5'    // 5 SOL

      const result = await oracleFeeds.getPositionValue(
        tokenXSymbol,
        tokenYSymbol,
        tokenXAmount,
        tokenYAmount
      )

      expect(result.tokenXValue).toBeCloseTo(1000, 50) // 1000 * ~1 USDC
      expect(result.tokenYValue).toBeCloseTo(500, 50)  // 5 * ~100 SOL
      expect(result.totalValue).toBeCloseTo(1500, 100) // Sum of both
      expect(result.priceData).toHaveProperty(tokenXSymbol)
      expect(result.priceData).toHaveProperty(tokenYSymbol)

      expect(consoleSpy).toHaveBeenCalledWith(
        `💰 Calculating position value for ${tokenXSymbol}/${tokenYSymbol}`
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        '✅ Position value calculated:',
        expect.objectContaining({
          totalValue: expect.any(String),
          tokenXValue: expect.any(String),
          tokenYValue: expect.any(String)
        })
      )
    })

    it('should handle zero amounts', async () => {
      const result = await oracleFeeds.getPositionValue('USDC', 'SOL', '0', '0')

      expect(result.tokenXValue).toBe(0)
      expect(result.tokenYValue).toBe(0)
      expect(result.totalValue).toBe(0)
      expect(result.priceData).toHaveProperty('USDC')
      expect(result.priceData).toHaveProperty('SOL')
    })

    it('should handle decimal amounts correctly', async () => {
      const result = await oracleFeeds.getPositionValue('USDC', 'SOL', '100.5', '0.1')

      expect(result.tokenXValue).toBeCloseTo(100.5, 5) // ~100.5 * 1
      expect(result.tokenYValue).toBeCloseTo(10, 1)     // ~0.1 * 100
      expect(result.totalValue).toBeCloseTo(110.5, 5)
    })

    it('should propagate errors from price fetching', async () => {
      // Mock getMultipleTokenPrices to throw
      const originalGetMultiple = oracleFeeds.getMultipleTokenPrices
      oracleFeeds.getMultipleTokenPrices = jest.fn().mockRejectedValue(new Error('Price fetch error'))

      await expect(oracleFeeds.getPositionValue('USDC', 'SOL', '100', '1'))
        .rejects.toThrow('Price fetch error')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error calculating position value:'),
        expect.any(Error)
      )

      // Restore original method
      oracleFeeds.getMultipleTokenPrices = originalGetMultiple
    })
  })

  describe('getSupportedTokens', () => {
    it('should return list of supported token symbols', () => {
      const supportedTokens = oracleFeeds.getSupportedTokens()

      expect(supportedTokens).toEqual(['SOL', 'USDC', 'RAY', 'USDT', 'ETH'])
      expect(supportedTokens).toHaveLength(5)
      expect(supportedTokens.every(token => typeof token === 'string')).toBe(true)
    })
  })

  describe('addPriceFeedConfig', () => {
    it('should add new price feed configuration', () => {
      const symbol = 'BTC'
      const config: PriceFeedConfig = {
        symbol: 'BTC',
        pythPriceId: 'btc-pyth-id',
        switchboardFeedId: 'btc-switchboard-id',
        fallbackPrice: 50000
      }

      oracleFeeds.addPriceFeedConfig(symbol, config)

      expect(oracleFeeds.getSupportedTokens()).toContain('BTC')
      expect(consoleSpy).toHaveBeenCalledWith('✅ Added price feed config for BTC')
    })

    it('should allow getting price for newly added token', async () => {
      const symbol = 'MATIC'
      const config: PriceFeedConfig = {
        symbol: 'MATIC',
        pythPriceId: 'matic-pyth-id',
        switchboardFeedId: 'matic-switchboard-id',
        fallbackPrice: 1.5
      }

      oracleFeeds.addPriceFeedConfig(symbol, config)

      const result = await oracleFeeds.getTokenPrice(symbol)
      expect(result.symbol).toBe(symbol)
      expect(result.price).toBeCloseTo(1.5, 0.2)
    })
  })

  describe('clearPriceCache', () => {
    it('should clear all cached prices', async () => {
      // Populate cache
      await oracleFeeds.getTokenPrice('SOL')
      await oracleFeeds.getTokenPrice('USDC')

      let stats = oracleFeeds.getCacheStats()
      expect(stats.basic.count).toBe(2)

      // Clear cache
      oracleFeeds.clearPriceCache()

      stats = oracleFeeds.getCacheStats()
      expect(stats.basic.count).toBe(0)
      expect(stats.basic.symbols).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('🧹 Price cache cleared')
    })
  })

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      const initialStats = oracleFeeds.getCacheStats()
      expect(initialStats.basic.count).toBe(0)
      expect(initialStats.basic.symbols).toEqual([])

      // Add some cached items
      await oracleFeeds.getTokenPrice('SOL')
      await oracleFeeds.getTokenPrice('ETH')

      const stats = oracleFeeds.getCacheStats()
      expect(stats.basic.count).toBe(2)
      expect(stats.basic.symbols).toEqual(expect.arrayContaining(['SOL', 'ETH']))
    })

    it('should correctly parse cache keys to symbols', async () => {
      await oracleFeeds.getTokenPrice('USDC')
      await oracleFeeds.getMultipleTokenPrices(['RAY', 'USDT'])

      const stats = oracleFeeds.getCacheStats()
      expect(stats.basic.count).toBe(3)
      expect(stats.basic.symbols).toEqual(expect.arrayContaining(['USDC', 'RAY', 'USDT']))

      // Should not include the 'price-' prefix
      expect(stats.basic.symbols.every((symbol: string) => !symbol.includes('price-'))).toBe(true)
    })
  })

  describe('Confidence scoring and weighted aggregation', () => {
    it('should provide appropriate confidence scores for different sources', async () => {
      // Mock both providers to return data
      const pythResult = await oracleFeeds['fetchPythPrice']('SOL', 'pyth-id')
      const switchboardResult = await oracleFeeds['fetchSwitchboardPrice']('SOL', 'sb-id')

      expect(pythResult.confidence).toBeGreaterThanOrEqual(0.95)
      expect(pythResult.confidence).toBeLessThanOrEqual(0.99)

      expect(switchboardResult.confidence).toBeGreaterThanOrEqual(0.93)
      expect(switchboardResult.confidence).toBeLessThanOrEqual(0.98)

      // Pyth should generally have higher confidence
      expect(pythResult.confidence).toBeGreaterThan(0.94)
      expect(switchboardResult.confidence).toBeLessThan(0.99)
    })

    it('should assign low confidence to fallback prices', async () => {
      // Force fallback by making both providers fail
      const fetchPythPriceSpy = jest.spyOn(oracleFeeds as any, 'fetchPythPrice')
        .mockRejectedValue(new Error('Pyth error'))
      const fetchSwitchboardPriceSpy = jest.spyOn(oracleFeeds as any, 'fetchSwitchboardPrice')
        .mockRejectedValue(new Error('Switchboard error'))

      const result = await oracleFeeds.getTokenPrice('SOL')

      expect(result.confidence).toBe(0.5) // Fallback confidence
      expect(result.source).toBe('fallback')

      fetchPythPriceSpy.mockRestore()
      fetchSwitchboardPriceSpy.mockRestore()
    })

    it('should assign zero confidence in final error fallback', async () => {
      // Force an error by setting the cache method to throw in the main try block
      const symbol = 'SOL'
      const originalCache = oracleFeeds['priceCache']

      // Replace the cache with a mock that throws on any operation
      oracleFeeds['priceCache'] = {
        get: jest.fn(() => { throw new Error('Cache error') }),
        set: jest.fn(),
        clear: jest.fn(),
        size: 0,
        keys: jest.fn(),
        has: jest.fn(),
        delete: jest.fn(),
        values: jest.fn(),
        entries: jest.fn(),
        forEach: jest.fn(),
        [Symbol.iterator]: jest.fn(),
        [Symbol.toStringTag]: 'Map'
      } as any

      const result = await oracleFeeds.getTokenPrice(symbol)

      expect(result.confidence).toBe(0)
      expect(result.source).toBe('fallback')
      expect(result.price).toBe(100) // SOL fallback price

      // Restore original cache
      oracleFeeds['priceCache'] = originalCache
    })
  })

  describe('Stale price data detection', () => {
    it('should provide fresh timestamps for all price sources', async () => {
      const startTime = Date.now()

      const pythResult = await oracleFeeds['fetchPythPrice']('SOL', 'pyth-id')
      const switchboardResult = await oracleFeeds['fetchSwitchboardPrice']('SOL', 'sb-id')
      const tokenResult = await oracleFeeds.getTokenPrice('USDC')

      const endTime = Date.now()

      // All timestamps should be recent
      expect(pythResult.timestamp.getTime()).toBeGreaterThanOrEqual(startTime)
      expect(pythResult.timestamp.getTime()).toBeLessThanOrEqual(endTime)

      expect(switchboardResult.timestamp.getTime()).toBeGreaterThanOrEqual(startTime)
      expect(switchboardResult.timestamp.getTime()).toBeLessThanOrEqual(endTime)

      expect(tokenResult.timestamp.getTime()).toBeGreaterThanOrEqual(startTime)
      expect(tokenResult.timestamp.getTime()).toBeLessThanOrEqual(endTime)
    })
  })

  describe('Edge cases and extreme scenarios', () => {
    it('should handle malformed price data gracefully', async () => {
      // Test with symbol not in config
      const result = await oracleFeeds.getTokenPrice('MALFORMED_TOKEN')

      expect(result.source).toBe('fallback')
      expect(result.price).toBe(0)
      expect(result.confidence).toBe(0)
      expect(result.symbol).toBe('MALFORMED_TOKEN')
      expect(result.timestamp).toBeInstanceOf(Date)
    })

    it('should handle token with undefined fallback price', async () => {
      // Add a token config with no fallback price
      const symbol = 'NOFALLBACK'
      oracleFeeds.addPriceFeedConfig(symbol, {
        symbol,
        pythPriceId: 'nofallback-pyth-id',
        switchboardFeedId: 'nofallback-switchboard-id'
        // No fallbackPrice set
      })

      // Mock both providers to fail so it uses fallback
      const fetchPythPriceSpy = jest.spyOn(oracleFeeds as any, 'fetchPythPrice')
        .mockRejectedValue(new Error('Pyth error'))
      const fetchSwitchboardPriceSpy = jest.spyOn(oracleFeeds as any, 'fetchSwitchboardPrice')
        .mockRejectedValue(new Error('Switchboard error'))

      const result = await oracleFeeds.getTokenPrice(symbol)

      expect(result.source).toBe('fallback')
      expect(result.price).toBe(0) // Should default to 0 when no fallback price
      expect(result.confidence).toBe(0.5)

      fetchPythPriceSpy.mockRestore()
      fetchSwitchboardPriceSpy.mockRestore()
    })

    it('should use base price of 100 when token config not found in private methods', async () => {
      // Call private methods directly with symbol not in config
      const unknownSymbol = 'UNKNOWN_TOKEN'

      const pythResult = await oracleFeeds['fetchPythPrice'](unknownSymbol, 'fake-id')
      const switchboardResult = await oracleFeeds['fetchSwitchboardPrice'](unknownSymbol, 'fake-id')

      expect(pythResult.price).toBeCloseTo(100, 10) // Should use default base price of 100
      expect(switchboardResult.price).toBeCloseTo(100, 10) // Should use default base price of 100
    })

    it('should handle extreme volatility scenarios', async () => {
      // Mock extreme price variations
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(1.0)  // Maximum positive variation
        .mockReturnValueOnce(0.0)  // Maximum negative variation

      const highResult = await oracleFeeds['fetchPythPrice']('SOL', 'pyth-id')
      const lowResult = await oracleFeeds['fetchPythPrice']('SOL', 'pyth-id')

      // Should still be within reasonable bounds (±5% for Pyth)
      expect(highResult.price).toBeLessThanOrEqual(105) // 100 * (1 + 0.05)
      expect(lowResult.price).toBeGreaterThanOrEqual(95) // 100 * (1 - 0.05)
    })

    it('should handle network timeouts and connection issues', async () => {
      // Simulate network timeout by making fetchPythPrice reject immediately
      const fetchPythPriceSpy = jest.spyOn(oracleFeeds as any, 'fetchPythPrice')
        .mockRejectedValue(new Error('Network timeout'))

      const result = await oracleFeeds.getTokenPrice('SOL')

      // Should fallback to Switchboard since Pyth failed
      expect(result.source).toBe('switchboard')
      expect(result.symbol).toBe('SOL')

      fetchPythPriceSpy.mockRestore()
    })

    it('should handle concurrent requests efficiently', async () => {
      const symbol = 'SOL'

      // Make multiple concurrent requests
      const promises = Array(5).fill(0).map(() => oracleFeeds.getTokenPrice(symbol))
      const results = await Promise.all(promises)

      // All should return valid prices
      results.forEach(result => {
        expect(result.symbol).toBe(symbol)
        expect(result.price).toBeGreaterThan(0)
        expect(result.confidence).toBeGreaterThan(0)
      })

      // Should have used cache for subsequent requests (only 1 cache entry)
      const stats = oracleFeeds.getCacheStats()
      expect(stats.basic.count).toBe(1)
      expect(stats.basic.symbols).toEqual(['SOL'])
    })
  })

  describe('Performance and caching behavior', () => {
    it('should respect cache TTL accurately', async () => {
      const symbol = 'SOL'

      // First call
      await oracleFeeds.getTokenPrice(symbol)

      // Clear console calls
      consoleSpy.mockClear()

      // Advance time to just before expiry (9 seconds)
      jest.advanceTimersByTime(9000)
      await oracleFeeds.getTokenPrice(symbol)

      // Should be from cache
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Price loaded from cache for SOL:'),
        expect.any(Number)
      )

      // Clear console calls
      consoleSpy.mockClear()

      // Advance time past expiry (11 seconds total)
      jest.advanceTimersByTime(2000)
      await oracleFeeds.getTokenPrice(symbol)

      // Should fetch fresh data
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔄 Fetching price for SOL from oracles...')
      )
    })

    it('should handle cache corruption gracefully', async () => {
      const symbol = 'SOL'

      // Populate cache
      await oracleFeeds.getTokenPrice(symbol)

      // Corrupt cache entry
      oracleFeeds['priceCache'].set('price-SOL', null as any)

      // Should handle corrupted cache and fetch fresh data
      const result = await oracleFeeds.getTokenPrice(symbol)

      expect(result.symbol).toBe(symbol)
      expect(result.price).toBeGreaterThan(0)
    })
  })
})