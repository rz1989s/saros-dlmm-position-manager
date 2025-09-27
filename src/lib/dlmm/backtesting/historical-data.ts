import { PublicKey } from '@solana/web3.js'
import { HistoricalData, HistoricalPricePoint, HistoricalLiquidityPoint, BacktestCache } from '@/lib/types'

export interface HistoricalDataConfig {
  cacheSize: number
  cacheTTL: number // milliseconds
  fallbackToMock: boolean
  apiEndpoint?: string
}

export class HistoricalDataService {
  private cache = new Map<string, BacktestCache>()
  private config: HistoricalDataConfig

  constructor(config: Partial<HistoricalDataConfig> = {}) {
    this.config = {
      cacheSize: 100, // Store up to 100 datasets
      cacheTTL: 1000 * 60 * 60 * 24, // 24 hours
      fallbackToMock: true,
      ...config,
    }
  }

  /**
   * Fetch historical data with intelligent fallback to mock data
   */
  async fetchHistoricalData(
    poolAddress: PublicKey,
    startDate: Date,
    endDate: Date,
    interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' = '1h'
  ): Promise<HistoricalData> {
    const cacheKey = this.generateCacheKey(poolAddress, startDate, endDate, interval)

    // Check cache first
    const cached = this.getCachedData(cacheKey)
    if (cached) {
      cached.hits++
      console.log(`📊 Historical data cache hit for ${poolAddress.toString()}`)
      return cached.data
    }

    try {
      // Try to fetch real data from API
      const realData = await this.fetchFromAPI(poolAddress, startDate, endDate, interval)
      if (realData) {
        this.cacheData(cacheKey, realData)
        console.log(`📈 Fetched real historical data for ${poolAddress.toString()}`)
        return realData
      }
    } catch (error) {
      console.log(`⚠️ API fetch failed for ${poolAddress.toString()}:`, error instanceof Error ? error.message : 'Unknown error')
    }

    // Fallback to mock data
    if (this.config.fallbackToMock) {
      // logger.debug(`🎭 Using mock historical data for ${poolAddress.toString()}`)
      const mockData = await this.generateMockData(poolAddress, startDate, endDate, interval)
      this.cacheData(cacheKey, mockData)
      return mockData
    }

    throw new Error('Unable to fetch historical data and mock data is disabled')
  }

  /**
   * Generate realistic mock data for development and testing
   */
  private async generateMockData(
    poolAddress: PublicKey,
    startDate: Date,
    endDate: Date,
    interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  ): Promise<HistoricalData> {
    const intervalMs = this.getIntervalMs(interval)
    const totalPoints = Math.floor((endDate.getTime() - startDate.getTime()) / intervalMs)

    // Base price parameters - realistic for different pools
    const basePrice = 100 + Math.random() * 900 // $100-$1000
    const volatility = this.getRealisticVolatility(interval) // Dynamic volatility based on timeframe
    const trendBias = (Math.random() - 0.5) * 0.0005 // Subtle trend bias

    // Market regime parameters for more realistic patterns
    const regimeSwitchProbability = 0.02 // 2% chance of regime switch per period
    let currentRegime: 'trending' | 'ranging' | 'volatile' = 'ranging'
    let regimeStrength = 0.5 + Math.random() * 0.5

    // logger.debug(`🎭 Generating ${totalPoints} mock data points with ${(volatility * 100).toFixed(1)}% volatility`)

    // Generate price data with realistic patterns
    const priceData: HistoricalPricePoint[] = []
    let currentPrice = basePrice

    for (let i = 0; i < totalPoints; i++) {
      const timestamp = new Date(startDate.getTime() + i * intervalMs)

      // Market regime switching
      if (Math.random() < regimeSwitchProbability) {
        const regimes: Array<'trending' | 'ranging' | 'volatile'> = ['trending', 'ranging', 'volatile']
        currentRegime = regimes[Math.floor(Math.random() * regimes.length)]
        regimeStrength = 0.3 + Math.random() * 0.7
      }

      // Enhanced price movement based on current regime
      let priceChange = 0

      switch (currentRegime) {
        case 'trending':
          // Trending markets have persistent directional movement
          const trendDirection = trendBias > 0 ? 1 : -1
          priceChange = (Math.random() - 0.3) * volatility * regimeStrength * trendDirection
          break

        case 'ranging':
          // Ranging markets have mean reversion
          const meanReversion = (basePrice - currentPrice) * 0.002 * regimeStrength
          const noise = (Math.random() - 0.5) * volatility * 0.5
          priceChange = meanReversion + noise
          break

        case 'volatile':
          // Volatile markets have higher noise and volatility spikes
          const volatilityMultiplier = 1 + regimeStrength
          priceChange = (Math.random() - 0.5) * volatility * volatilityMultiplier
          break
      }

      currentPrice *= (1 + priceChange)

      // Create OHLC data with realistic intrabar movement
      const high = currentPrice * (1 + Math.random() * volatility * 0.3)
      const low = currentPrice * (1 - Math.random() * volatility * 0.3)
      const open = i === 0 ? currentPrice : priceData[i - 1].close
      const close = currentPrice

      // Generate realistic volume based on price movement and regime
      const priceMovementMagnitude = Math.abs(priceChange)
      const volumeMultiplier = this.calculateVolumeMultiplier(priceMovementMagnitude, currentRegime, regimeStrength)
      const baseVolume = this.getBaseVolumeForInterval(interval)
      const volume = (baseVolume * volumeMultiplier * (0.8 + Math.random() * 0.4)).toString()

      priceData.push({
        timestamp,
        open,
        high: Math.max(open, close, high),
        low: Math.min(open, close, low),
        close,
        volume,
        volumeX: (parseFloat(volume) * 0.6).toString(),
        volumeY: (parseFloat(volume) * 0.4).toString(),
      })
    }

    // Generate liquidity data - simulate active bins around current price
    const liquidityData: HistoricalLiquidityPoint[] = []
    const activeBinRange = 20 // Active bins around current price

    for (let i = 0; i < totalPoints; i++) {
      const timestamp = priceData[i].timestamp
      const price = priceData[i].close
      const activeBinId = Math.floor(price) // Simplified bin calculation

      // Generate liquidity for bins around active price
      for (let binOffset = -activeBinRange; binOffset <= activeBinRange; binOffset++) {
        const binId = activeBinId + binOffset
        const distanceFromActive = Math.abs(binOffset)

        // Liquidity decreases with distance from active bin
        const liquidityFactor = Math.exp(-distanceFromActive * 0.1)
        const baseLiquidity = 50000 + Math.random() * 200000
        const liquidity = baseLiquidity * liquidityFactor

        // Higher fee rates for bins further from active
        const baseFeeRate = 0.003 // 0.3%
        const feeRate = baseFeeRate * (1 + distanceFromActive * 0.1)

        liquidityData.push({
          timestamp,
          binId,
          liquidityX: (liquidity * 0.5).toString(),
          liquidityY: (liquidity * 0.5).toString(),
          feeRate,
          isActive: distanceFromActive <= 2,
        })
      }
    }

    return {
      poolAddress,
      timeRange: {
        start: startDate,
        end: endDate,
        interval,
      },
      priceData,
      liquidityData,
      metadata: {
        dataPoints: totalPoints,
        coverage: 1.0, // 100% coverage for mock data
        source: 'mock',
      },
    }
  }

  /**
   * Attempt to fetch real data from API (placeholder for future implementation)
   */
  private async fetchFromAPI(
    _poolAddress: PublicKey,
    _startDate: Date,
    _endDate: Date,
    _interval: string
  ): Promise<HistoricalData | null> {
    // This would integrate with Saros API or other data providers
    // For now, we return null to trigger mock data fallback
    return null

    /* Future API integration:
    const response = await fetch(`${this.config.apiEndpoint}/historical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        poolAddress: poolAddress.toString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        interval,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return await response.json()
    */
  }

  /**
   * Get cached data if available and not expired
   */
  private getCachedData(cacheKey: string): BacktestCache | null {
    const cached = this.cache.get(cacheKey)
    if (!cached) return null

    if (Date.now() > cached.expiresAt.getTime()) {
      this.cache.delete(cacheKey)
      return null
    }

    return cached
  }

  /**
   * Cache historical data with size limits
   */
  private cacheData(cacheKey: string, data: HistoricalData): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.cacheSize) {
      const oldestKey = Array.from(this.cache.keys())[0]
      this.cache.delete(oldestKey)
    }

    const cacheEntry: BacktestCache = {
      key: cacheKey,
      data,
      expiresAt: new Date(Date.now() + this.config.cacheTTL),
      size: this.estimateDataSize(data),
      hits: 0,
    }

    this.cache.set(cacheKey, cacheEntry)
  }

  /**
   * Generate cache key for data lookup
   */
  private generateCacheKey(
    poolAddress: PublicKey,
    startDate: Date,
    endDate: Date,
    interval: string
  ): string {
    return `${poolAddress.toString()}_${startDate.getTime()}_${endDate.getTime()}_${interval}`
  }

  /**
   * Get realistic volatility based on timeframe
   */
  private getRealisticVolatility(interval: string): number {
    const volatilityByInterval = {
      '1m': 0.001 + Math.random() * 0.003, // 0.1-0.4% per minute
      '5m': 0.003 + Math.random() * 0.007, // 0.3-1% per 5 minutes
      '15m': 0.005 + Math.random() * 0.015, // 0.5-2% per 15 minutes
      '1h': 0.01 + Math.random() * 0.03, // 1-4% per hour
      '4h': 0.02 + Math.random() * 0.05, // 2-7% per 4 hours
      '1d': 0.02 + Math.random() * 0.08, // 2-10% per day
    }
    return volatilityByInterval[interval as keyof typeof volatilityByInterval] || volatilityByInterval['1h']
  }

  /**
   * Calculate volume multiplier based on price movement and market regime
   */
  private calculateVolumeMultiplier(
    priceMovementMagnitude: number,
    regime: 'trending' | 'ranging' | 'volatile',
    regimeStrength: number
  ): number {
    let baseMultiplier = 1 + priceMovementMagnitude * 20 // Higher volume during large moves

    switch (regime) {
      case 'trending':
        // Trending markets have sustained higher volume
        baseMultiplier *= 1.2 + regimeStrength * 0.3
        break
      case 'volatile':
        // Volatile markets have explosive volume spikes
        baseMultiplier *= 1.5 + regimeStrength * 0.8
        break
      case 'ranging':
        // Ranging markets have lower average volume
        baseMultiplier *= 0.8 + regimeStrength * 0.2
        break
    }

    // Add some randomness but keep it realistic
    return baseMultiplier * (0.7 + Math.random() * 0.6)
  }

  /**
   * Get base volume appropriate for different timeframes
   */
  private getBaseVolumeForInterval(interval: string): number {
    const baseVolumeByInterval = {
      '1m': 1000 + Math.random() * 4000, // $1K-$5K per minute
      '5m': 5000 + Math.random() * 15000, // $5K-$20K per 5 minutes
      '15m': 15000 + Math.random() * 35000, // $15K-$50K per 15 minutes
      '1h': 50000 + Math.random() * 150000, // $50K-$200K per hour
      '4h': 200000 + Math.random() * 800000, // $200K-$1M per 4 hours
      '1d': 1000000 + Math.random() * 4000000, // $1M-$5M per day
    }
    return baseVolumeByInterval[interval as keyof typeof baseVolumeByInterval] || baseVolumeByInterval['1h']
  }

  /**
   * Convert interval string to milliseconds
   */
  private getIntervalMs(interval: string): number {
    const intervals = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
    }
    return intervals[interval as keyof typeof intervals] || intervals['1h']
  }

  /**
   * Estimate data size for cache management
   */
  private estimateDataSize(data: HistoricalData): number {
    const pricePoints = data.priceData.length
    const liquidityPoints = data.liquidityData.length
    // Rough estimation: each price point ~200 bytes, each liquidity point ~150 bytes
    return (pricePoints * 200) + (liquidityPoints * 150)
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    size: number
    totalHits: number
    totalSize: number
    entries: Array<{ key: string; hits: number; size: number }>
  } {
    let totalHits = 0
    let totalSize = 0
    const entries: Array<{ key: string; hits: number; size: number }> = []

    for (const cache of Array.from(this.cache.values())) {
      totalHits += cache.hits
      totalSize += cache.size
      entries.push({
        key: cache.key,
        hits: cache.hits,
        size: cache.size,
      })
    }

    return {
      size: this.cache.size,
      totalHits,
      totalSize,
      entries: entries.sort((a, b) => b.hits - a.hits), // Sort by hits
    }
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.cache.clear()
    console.log('📊 Historical data cache cleared')
  }

  /**
   * Preload data for common pools and timeframes
   */
  async preloadCommonData(): Promise<void> {
    console.log('📊 Preloading common historical data...')

    // Common pools (these would be real pool addresses)
    const commonPools = [
      new PublicKey('11111111111111111111111111111112'), // SOL/USDC
      new PublicKey('22222222222222222222222222222222'), // ETH/USDC
    ]

    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

    // Preload 1h and 1d data for common pools
    const preloadPromises = commonPools.flatMap(poolAddress =>
      ['1h', '1d'].map(interval =>
        this.fetchHistoricalData(poolAddress, startDate, endDate, interval as any)
      )
    )

    await Promise.all(preloadPromises)
    console.log(`📊 Preloaded data for ${commonPools.length} pools`)
  }
}

// Export singleton instance
export const historicalDataService = new HistoricalDataService({
  fallbackToMock: true,
  cacheSize: 50,
  cacheTTL: 1000 * 60 * 60 * 12, // 12 hours
})