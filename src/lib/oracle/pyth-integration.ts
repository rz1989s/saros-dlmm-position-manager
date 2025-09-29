// Pyth Network Integration using Hermes Client
// Real-time, high-confidence price feeds for DLMM position management
// Bismillah - implementing comprehensive Pyth oracle integration

import { HermesClient } from '@pythnetwork/hermes-client'
import { logger } from '@/lib/logger'

// ============================================================================
// PYTH INTEGRATION INTERFACES
// ============================================================================

export interface PythPriceData {
  symbol: string
  priceId: string
  price: number
  confidence: number
  expo: number
  publishTime: number
  timestamp: Date
  staleness: number // seconds since publish
  emaPrice: number
  emaConfidence: number
  status: 'trading' | 'halted' | 'auction' | 'unknown'
  source: 'pyth'
}

export interface PythFeedConfig {
  symbol: string
  priceId: string
  description: string
  assetType: 'crypto' | 'fx' | 'equity' | 'commodity'
  baseAsset: string
  quoteAsset: string
  updateFrequency: number // Expected update frequency in seconds
  maxStaleness: number // Maximum acceptable staleness in seconds
}

export interface PythStreamingConfig {
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
  bufferSize: number
}

export interface PriceConfidenceMetrics {
  confidenceLevel: 'very_high' | 'high' | 'medium' | 'low' | 'very_low'
  confidenceScore: number // 0-100
  staleness: number
  deviationFromEMA: number
  qualityFlags: string[]
  recommendations: string[]
}

// ============================================================================
// REAL PYTH PRICE FEED CONFIGURATIONS
// ============================================================================

export const PYTH_PRICE_FEEDS: Record<string, PythFeedConfig> = {
  'SOL': {
    symbol: 'SOL',
    priceId: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    description: 'Solana / USD',
    assetType: 'crypto',
    baseAsset: 'SOL',
    quoteAsset: 'USD',
    updateFrequency: 1, // 1 second
    maxStaleness: 60   // 60 seconds max
  },
  'USDC': {
    symbol: 'USDC',
    priceId: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
    description: 'USD Coin / USD',
    assetType: 'crypto',
    baseAsset: 'USDC',
    quoteAsset: 'USD',
    updateFrequency: 1,
    maxStaleness: 60
  },
  'ETH': {
    symbol: 'ETH',
    priceId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    description: 'Ethereum / USD',
    assetType: 'crypto',
    baseAsset: 'ETH',
    quoteAsset: 'USD',
    updateFrequency: 1,
    maxStaleness: 60
  },
  'BTC': {
    symbol: 'BTC',
    priceId: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    description: 'Bitcoin / USD',
    assetType: 'crypto',
    baseAsset: 'BTC',
    quoteAsset: 'USD',
    updateFrequency: 1,
    maxStaleness: 60
  },
  'RAY': {
    symbol: 'RAY',
    priceId: '0x91568ba9a4654e5c3d7c84821c931dd6b6b24d8d9fd68a9dd6600ab5d724d044',
    description: 'Raydium / USD',
    assetType: 'crypto',
    baseAsset: 'RAY',
    quoteAsset: 'USD',
    updateFrequency: 2,
    maxStaleness: 120
  },
  'USDT': {
    symbol: 'USDT',
    priceId: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
    description: 'Tether USD / USD',
    assetType: 'crypto',
    baseAsset: 'USDT',
    quoteAsset: 'USD',
    updateFrequency: 1,
    maxStaleness: 60
  }
}

// ============================================================================
// COMPREHENSIVE PYTH INTEGRATION CLIENT
// ============================================================================

export class PythIntegration {
  private hermesClient: HermesClient
  private priceCache = new Map<string, { price: PythPriceData; timestamp: number }>()
  private streamingConnections = new Map<string, EventSource>()
  private readonly cacheDuration = 5000 // 5 seconds for real-time data
  private readonly endpoint: string

  // Streaming configuration
  private streamingConfig: PythStreamingConfig = {
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000,
    bufferSize: 100
  }

  constructor(endpoint: string = 'https://hermes.pyth.network') {
    this.endpoint = endpoint
    this.hermesClient = new HermesClient(endpoint, {})

    logger.init('🔮 PythIntegration: Initialized with Hermes client')
    console.log('  Endpoint:', endpoint)
    console.log('  Supported feeds:', Object.keys(PYTH_PRICE_FEEDS).length)
    console.log('  Cache duration:', this.cacheDuration / 1000, 'seconds')
  }

  // ============================================================================
  // CORE PRICE FETCHING
  // ============================================================================

  /**
   * Get real-time price data for a single symbol
   */
  async getPriceData(symbol: string): Promise<PythPriceData> {
    const config = PYTH_PRICE_FEEDS[symbol]
    if (!config) {
      throw new Error(`No Pyth price feed configuration found for ${symbol}`)
    }

    const cacheKey = `pyth-${symbol}`

    try {
      // Check cache first for very recent data
      const cached = this.priceCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        console.log(`✅ Pyth price loaded from cache for ${symbol}:`, cached.price.price)
        return cached.price
      }

      console.log(`🔄 Fetching real-time Pyth price for ${symbol}...`)

      // Get latest price updates from Hermes
      const priceUpdates = await this.hermesClient.getLatestPriceUpdates([config.priceId])

      if (!priceUpdates.parsed || priceUpdates.parsed.length === 0) {
        throw new Error(`No price data returned for ${symbol}`)
      }

      const priceUpdate = priceUpdates.parsed[0]

      // Extract price data with proper parsing
      const priceData = this.parsePythPriceUpdate(symbol, config, priceUpdate)

      // Cache the price data
      this.priceCache.set(cacheKey, { price: priceData, timestamp: Date.now() })

      console.log(`✅ Real Pyth price for ${symbol}:`, priceData.price, 'confidence:', priceData.confidence)

      return priceData

    } catch (error) {
      console.error(`❌ Error fetching Pyth price for ${symbol}:`, error)
      throw error
    }
  }

  /**
   * Get multiple price feeds efficiently
   */
  async getMultiplePrices(symbols: string[]): Promise<Record<string, PythPriceData>> {
    console.log(`🔄 Fetching Pyth prices for ${symbols.length} symbols:`, symbols)

    try {
      // Get all price IDs for the requested symbols
      const priceIds: string[] = []
      const symbolToPriceId: Record<string, string> = {}

      for (const symbol of symbols) {
        const config = PYTH_PRICE_FEEDS[symbol]
        if (config) {
          priceIds.push(config.priceId)
          symbolToPriceId[config.priceId] = symbol
        } else {
          console.warn(`⚠️ No Pyth configuration for ${symbol}`)
        }
      }

      if (priceIds.length === 0) {
        throw new Error('No valid price IDs found for requested symbols')
      }

      // Fetch all prices in a single request
      const priceUpdates = await this.hermesClient.getLatestPriceUpdates(priceIds)

      if (!priceUpdates.parsed || priceUpdates.parsed.length === 0) {
        throw new Error('No price data returned from Hermes')
      }

      // Parse and organize results
      const results: Record<string, PythPriceData> = {}

      for (const priceUpdate of priceUpdates.parsed) {
        const priceId = '0x' + Buffer.from(priceUpdate.id).toString('hex')
        const symbol = symbolToPriceId[priceId]

        if (symbol && PYTH_PRICE_FEEDS[symbol]) {
          const config = PYTH_PRICE_FEEDS[symbol]
          const priceData = this.parsePythPriceUpdate(symbol, config, priceUpdate)

          results[symbol] = priceData

          // Cache individual price
          const cacheKey = `pyth-${symbol}`
          this.priceCache.set(cacheKey, { price: priceData, timestamp: Date.now() })
        }
      }

      console.log(`✅ Fetched ${Object.keys(results).length} Pyth prices successfully`)
      return results

    } catch (error) {
      console.error('❌ Error fetching multiple Pyth prices:', error)
      throw error
    }
  }

  /**
   * Parse Pyth price update into our standardized format
   */
  private parsePythPriceUpdate(
    symbol: string,
    config: PythFeedConfig,
    priceUpdate: any
  ): PythPriceData {
    const price = priceUpdate.price
    const emaPrice = priceUpdate.ema_price

    // Calculate actual price values considering the exponent
    const actualPrice = Number(price.price) * Math.pow(10, price.expo)
    const actualConfidence = Number(price.conf) * Math.pow(10, price.expo)
    const actualEmaPrice = Number(emaPrice.price) * Math.pow(10, emaPrice.expo)
    const actualEmaConfidence = Number(emaPrice.conf) * Math.pow(10, emaPrice.expo)

    // Calculate staleness
    const publishTime = Number(price.publish_time)
    const currentTime = Date.now() / 1000
    const staleness = Math.max(0, currentTime - publishTime)

    // Determine status
    let status: PythPriceData['status'] = 'unknown'
    if (price.status === 1) status = 'trading'
    else if (price.status === 2) status = 'halted'
    else if (price.status === 3) status = 'auction'

    return {
      symbol,
      priceId: config.priceId,
      price: actualPrice,
      confidence: actualConfidence,
      expo: price.expo,
      publishTime,
      timestamp: new Date(publishTime * 1000),
      staleness,
      emaPrice: actualEmaPrice,
      emaConfidence: actualEmaConfidence,
      status,
      source: 'pyth'
    }
  }

  // ============================================================================
  // REAL-TIME STREAMING
  // ============================================================================

  /**
   * Start real-time price streaming for symbols
   */
  async startPriceStreaming(
    symbols: string[],
    onPriceUpdate: (priceData: PythPriceData) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    console.log(`🌊 Starting Pyth price streaming for ${symbols.length} symbols:`, symbols)

    try {
      // Get price IDs for streaming
      const priceIds: string[] = []
      const priceIdToSymbol: Record<string, string> = {}

      for (const symbol of symbols) {
        const config = PYTH_PRICE_FEEDS[symbol]
        if (config) {
          priceIds.push(config.priceId)
          priceIdToSymbol[config.priceId] = symbol
        }
      }

      if (priceIds.length === 0) {
        throw new Error('No valid price IDs for streaming')
      }

      // Create streaming connection
      const eventSource = await this.hermesClient.getPriceUpdatesStream(priceIds)

      // Handle incoming price updates
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.parsed && data.parsed.length > 0) {
            for (const priceUpdate of data.parsed) {
              const priceId = '0x' + Buffer.from(priceUpdate.id).toString('hex')
              const symbol = priceIdToSymbol[priceId]

              if (symbol && PYTH_PRICE_FEEDS[symbol]) {
                const config = PYTH_PRICE_FEEDS[symbol]
                const priceData = this.parsePythPriceUpdate(symbol, config, priceUpdate)

                // Update cache
                const cacheKey = `pyth-${symbol}`
                this.priceCache.set(cacheKey, { price: priceData, timestamp: Date.now() })

                // Notify callback
                onPriceUpdate(priceData)
              }
            }
          }
        } catch (parseError) {
          console.error('❌ Error parsing streaming price update:', parseError)
          onError?.(parseError)
        }
      }

      // Handle streaming errors
      eventSource.onerror = (error) => {
        console.error('❌ Pyth streaming error:', error)
        onError?.(error)

        // Attempt to reconnect
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect Pyth stream...')
          this.startPriceStreaming(symbols, onPriceUpdate, onError)
        }, this.streamingConfig.reconnectInterval)
      }

      // Store connection for management
      const connectionKey = symbols.join(',')
      this.streamingConnections.set(connectionKey, eventSource)

      console.log('✅ Pyth price streaming started successfully')

    } catch (error) {
      console.error('❌ Error starting Pyth price streaming:', error)
      onError?.(error)
      throw error
    }
  }

  /**
   * Stop price streaming for symbols
   */
  stopPriceStreaming(symbols: string[]): void {
    const connectionKey = symbols.join(',')
    const eventSource = this.streamingConnections.get(connectionKey)

    if (eventSource) {
      eventSource.close()
      this.streamingConnections.delete(connectionKey)
      console.log('✅ Pyth price streaming stopped for:', symbols)
    }
  }

  /**
   * Stop all streaming connections
   */
  stopAllStreaming(): void {
    for (const [_key, eventSource] of this.streamingConnections) {
      eventSource.close()
    }
    this.streamingConnections.clear()
    console.log('✅ All Pyth streaming connections closed')
  }

  // ============================================================================
  // PRICE CONFIDENCE & QUALITY ANALYSIS
  // ============================================================================

  /**
   * Analyze price confidence and quality
   */
  analyzePriceConfidence(priceData: PythPriceData): PriceConfidenceMetrics {
    const config = PYTH_PRICE_FEEDS[priceData.symbol]
    if (!config) {
      throw new Error(`No configuration found for ${priceData.symbol}`)
    }

    // Calculate confidence percentage
    const confidencePercentage = (priceData.confidence / priceData.price) * 100

    // Calculate deviation from EMA
    const emaDeviation = Math.abs((priceData.price - priceData.emaPrice) / priceData.emaPrice) * 100

    // Determine confidence level
    let confidenceLevel: PriceConfidenceMetrics['confidenceLevel']
    let confidenceScore: number

    if (confidencePercentage < 0.1 && priceData.staleness < 10) {
      confidenceLevel = 'very_high'
      confidenceScore = 95
    } else if (confidencePercentage < 0.5 && priceData.staleness < 30) {
      confidenceLevel = 'high'
      confidenceScore = 85
    } else if (confidencePercentage < 1.0 && priceData.staleness < 60) {
      confidenceLevel = 'medium'
      confidenceScore = 70
    } else if (confidencePercentage < 2.0 && priceData.staleness < 120) {
      confidenceLevel = 'low'
      confidenceScore = 50
    } else {
      confidenceLevel = 'very_low'
      confidenceScore = 25
    }

    // Generate quality flags
    const qualityFlags: string[] = []
    const recommendations: string[] = []

    if (priceData.staleness > config.maxStaleness) {
      qualityFlags.push('STALE_DATA')
      recommendations.push('Consider using cached data or alternative sources')
    }

    if (confidencePercentage > 1.0) {
      qualityFlags.push('HIGH_UNCERTAINTY')
      recommendations.push('Price has high uncertainty - use with caution')
    }

    if (emaDeviation > 5.0) {
      qualityFlags.push('PRICE_DEVIATION')
      recommendations.push('Price significantly deviates from EMA - possible volatility')
    }

    if (priceData.status !== 'trading') {
      qualityFlags.push('NON_TRADING_STATUS')
      recommendations.push(`Market status is ${priceData.status} - trading may be restricted`)
    }

    return {
      confidenceLevel,
      confidenceScore,
      staleness: priceData.staleness,
      deviationFromEMA: emaDeviation,
      qualityFlags,
      recommendations
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get all supported symbols
   */
  getSupportedSymbols(): string[] {
    return Object.keys(PYTH_PRICE_FEEDS)
  }

  /**
   * Get feed configuration for symbol
   */
  getFeedConfig(symbol: string): PythFeedConfig | null {
    return PYTH_PRICE_FEEDS[symbol] || null
  }

  /**
   * Check if symbol is supported
   */
  isSymbolSupported(symbol: string): boolean {
    return symbol in PYTH_PRICE_FEEDS
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { count: number; symbols: string[]; hitRate: number } {
    const symbols = Array.from(this.priceCache.keys()).map(key => key.replace('pyth-', ''))
    return {
      count: this.priceCache.size,
      symbols,
      hitRate: 0.95 // Mock hit rate - could be calculated from actual usage
    }
  }

  /**
   * Clear price cache
   */
  clearCache(): void {
    this.priceCache.clear()
    console.log('🧹 Pyth price cache cleared')
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    endpoint: string
    activeStreams: number
    cacheSize: number
    lastUpdate?: Date
  }> {
    return {
      status: 'healthy',
      endpoint: this.endpoint,
      activeStreams: this.streamingConnections.size,
      cacheSize: this.priceCache.size,
      lastUpdate: new Date()
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format price for display with appropriate precision
 */
export function formatPythPrice(priceData: PythPriceData): string {
  const precision = priceData.price < 1 ? 6 : priceData.price < 100 ? 4 : 2
  return priceData.price.toFixed(precision)
}

/**
 * Format confidence interval for display
 */
export function formatConfidenceInterval(priceData: PythPriceData): string {
  const price = priceData.price
  const confidence = priceData.confidence
  const lower = price - confidence
  const upper = price + confidence

  const precision = price < 1 ? 6 : price < 100 ? 4 : 2
  return `${lower.toFixed(precision)} - ${upper.toFixed(precision)}`
}

/**
 * Check if price data is stale
 */
export function isPriceStale(priceData: PythPriceData, maxStaleness?: number): boolean {
  const config = PYTH_PRICE_FEEDS[priceData.symbol]
  const threshold = maxStaleness || config?.maxStaleness || 60
  return priceData.staleness > threshold
}

// Export singleton instance
export const pythIntegration = new PythIntegration()

// Default export
export default pythIntegration