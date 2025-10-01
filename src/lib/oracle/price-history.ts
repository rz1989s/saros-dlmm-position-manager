// Comprehensive Price History Tracking and Analysis
// Historical price data management with trend identification
// Bismillah - implementing intelligent price history tracking

import { priceFeedManager } from './price-feed-manager'
import { logger } from '@/lib/logger'

// ============================================================================
// PRICE HISTORY INTERFACES
// ============================================================================

export interface PriceHistoryPoint {
  timestamp: Date
  price: number
  confidence: number
  source: string
  volume?: number
  staleness: number
}

export interface PriceHistoryConfig {
  symbol: string
  maxDataPoints: number
  retentionPeriod: number // seconds
  samplingInterval: number // seconds
  enableCompression: boolean
  compressionThreshold: number // number of points before compression
  trackVolume: boolean
  calculateMetrics: boolean
}

export interface PriceHistoryStats {
  symbol: string
  dataPoints: number
  timeSpan: number // seconds
  firstTimestamp: Date
  lastTimestamp: Date
  priceRange: {
    min: number
    max: number
    current: number
  }
  averagePrice: number
  averageConfidence: number
  volatility: number
  trend: 'up' | 'down' | 'stable'
}

export interface TrendAnalysis {
  symbol: string
  trend: 'up' | 'down' | 'stable'
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong'
  confidence: number // 0-1
  slope: number // rate of change
  r2: number // correlation coefficient
  prediction: {
    nextPrice: number
    timeHorizon: number // seconds
    confidence: number
  }
  indicators: {
    sma20: number // 20-period Simple Moving Average
    ema20: number // 20-period Exponential Moving Average
    rsi: number // Relative Strength Index (0-100)
    momentum: number // Price momentum
  }
  analysis: {
    momentum: 'bullish' | 'bearish' | 'neutral'
    volatility: 'low' | 'medium' | 'high' | 'extreme'
    support: number // Support level
    resistance: number // Resistance level
  }
}

export interface PriceComparison {
  symbol: string
  timeframe: string
  priceChange: number
  priceChangePercent: number
  high: number
  low: number
  open: number
  close: number
  volatilityChange: number
}

export interface HistoricalChartData {
  symbol: string
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  data: {
    timestamp: Date
    price: number
    confidence: number
    volume?: number
  }[]
  metadata: {
    dataPoints: number
    samplingInterval: number
    compression: boolean
  }
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_HISTORY_CONFIGS: Record<string, PriceHistoryConfig> = {
  'SOL': {
    symbol: 'SOL',
    maxDataPoints: 1000,
    retentionPeriod: 86400, // 24 hours
    samplingInterval: 5, // 5 seconds
    enableCompression: true,
    compressionThreshold: 500,
    trackVolume: true,
    calculateMetrics: true
  },
  'USDC': {
    symbol: 'USDC',
    maxDataPoints: 500,
    retentionPeriod: 86400,
    samplingInterval: 10, // 10 seconds for stablecoins
    enableCompression: true,
    compressionThreshold: 300,
    trackVolume: false,
    calculateMetrics: false
  },
  'ETH': {
    symbol: 'ETH',
    maxDataPoints: 1000,
    retentionPeriod: 86400,
    samplingInterval: 5,
    enableCompression: true,
    compressionThreshold: 500,
    trackVolume: true,
    calculateMetrics: true
  },
  'DEFAULT': {
    symbol: 'DEFAULT',
    maxDataPoints: 500,
    retentionPeriod: 43200, // 12 hours
    samplingInterval: 10,
    enableCompression: true,
    compressionThreshold: 300,
    trackVolume: false,
    calculateMetrics: false
  }
}

// ============================================================================
// COMPREHENSIVE PRICE HISTORY TRACKING
// ============================================================================

export class PriceHistoryTracker {
  private historyData = new Map<string, PriceHistoryPoint[]>()
  private configs = new Map<string, PriceHistoryConfig>()
  private samplingTimers = new Map<string, NodeJS.Timeout>()
  private compressionTimers = new Map<string, NodeJS.Timeout>()
  private readonly cleanupInterval = 300000 // 5 minutes

  constructor() {
    // Load default configurations
    this.loadDefaultConfigs()

    // Start background cleanup
    this.startBackgroundCleanup()

    logger.init('📈 PriceHistoryTracker: Advanced price history tracking initialized')
    console.log('  Default configs loaded:', this.configs.size)
    console.log('  Compression: Enabled')
    console.log('  Trend analysis: Active')
  }

  // ============================================================================
  // CONFIGURATION MANAGEMENT
  // ============================================================================

  /**
   * Load default configurations
   */
  private loadDefaultConfigs(): void {
    for (const [symbol, config] of Object.entries(DEFAULT_HISTORY_CONFIGS)) {
      this.configs.set(symbol, config)
    }
  }

  /**
   * Get configuration for symbol
   */
  private getConfig(symbol: string): PriceHistoryConfig {
    return this.configs.get(symbol) || this.configs.get('DEFAULT')!
  }

  /**
   * Set custom configuration
   */
  setConfig(symbol: string, config: Partial<PriceHistoryConfig>): void {
    const existing = this.getConfig(symbol)
    const newConfig = { ...existing, ...config, symbol }
    this.configs.set(symbol, newConfig)

    console.log(`⚙️ Updated price history config for ${symbol}`)
  }

  // ============================================================================
  // DATA COLLECTION
  // ============================================================================

  /**
   * Start tracking price history for symbol
   */
  async startTracking(symbol: string): Promise<void> {
    console.log(`📊 Starting price history tracking for ${symbol}...`)

    const config = this.getConfig(symbol)

    // Initialize history array if not exists
    if (!this.historyData.has(symbol)) {
      this.historyData.set(symbol, [])
    }

    // Start sampling timer
    const samplingTimer = setInterval(async () => {
      try {
        await this.collectPricePoint(symbol)
      } catch (error) {
        console.error(`❌ Failed to collect price point for ${symbol}:`, error)
      }
    }, config.samplingInterval * 1000)

    this.samplingTimers.set(symbol, samplingTimer)

    // Start compression timer if enabled
    if (config.enableCompression) {
      const compressionTimer = setInterval(() => {
        this.compressHistory(symbol)
      }, 60000) // Compress every minute

      this.compressionTimers.set(symbol, compressionTimer)
    }

    // Collect initial data point
    await this.collectPricePoint(symbol)

    console.log(`✅ Started tracking ${symbol} with ${config.samplingInterval}s interval`)
  }

  /**
   * Stop tracking price history
   */
  stopTracking(symbol: string): void {
    console.log(`⏹️ Stopping price history tracking for ${symbol}...`)

    // Clear sampling timer
    const samplingTimer = this.samplingTimers.get(symbol)
    if (samplingTimer) {
      clearInterval(samplingTimer)
      this.samplingTimers.delete(symbol)
    }

    // Clear compression timer
    const compressionTimer = this.compressionTimers.get(symbol)
    if (compressionTimer) {
      clearInterval(compressionTimer)
      this.compressionTimers.delete(symbol)
    }

    console.log(`✅ Stopped tracking ${symbol}`)
  }

  /**
   * Collect single price point
   */
  private async collectPricePoint(symbol: string): Promise<void> {
    try {
      const config = this.getConfig(symbol)
      const history = this.historyData.get(symbol)!

      // Get unified price data
      const priceData = await priceFeedManager.getPrice(symbol)

      // Create history point
      const point: PriceHistoryPoint = {
        timestamp: new Date(),
        price: priceData.price,
        confidence: priceData.confidence,
        source: priceData.source,
        staleness: priceData.staleness
      }

      // Add to history
      history.push(point)

      // Apply retention policy
      const cutoffTime = Date.now() - (config.retentionPeriod * 1000)
      const filteredHistory = history.filter(p => p.timestamp.getTime() > cutoffTime)

      // Apply max data points limit
      if (filteredHistory.length > config.maxDataPoints) {
        filteredHistory.splice(0, filteredHistory.length - config.maxDataPoints)
      }

      this.historyData.set(symbol, filteredHistory)

    } catch (error) {
      console.error(`❌ Failed to collect price point for ${symbol}:`, error)
    }
  }

  /**
   * Add manual price point
   */
  addPricePoint(symbol: string, price: number, confidence: number, source: string): void {
    const config = this.getConfig(symbol)
    const history = this.historyData.get(symbol) || []

    const point: PriceHistoryPoint = {
      timestamp: new Date(),
      price,
      confidence,
      source,
      staleness: 0
    }

    history.push(point)

    // Apply limits
    const cutoffTime = Date.now() - (config.retentionPeriod * 1000)
    const filteredHistory = history.filter(p => p.timestamp.getTime() > cutoffTime)

    if (filteredHistory.length > config.maxDataPoints) {
      filteredHistory.splice(0, filteredHistory.length - config.maxDataPoints)
    }

    this.historyData.set(symbol, filteredHistory)
  }

  // ============================================================================
  // HISTORY RETRIEVAL
  // ============================================================================

  /**
   * Get complete price history
   */
  getHistory(symbol: string): PriceHistoryPoint[] {
    return this.historyData.get(symbol) || []
  }

  /**
   * Get price history for timeframe
   */
  getHistoryForTimeframe(
    symbol: string,
    timeframeSeconds: number
  ): PriceHistoryPoint[] {
    const history = this.getHistory(symbol)
    const cutoffTime = Date.now() - (timeframeSeconds * 1000)

    return history.filter(p => p.timestamp.getTime() > cutoffTime)
  }

  /**
   * Get historical chart data
   */
  getChartData(
    symbol: string,
    timeframe: HistoricalChartData['timeframe']
  ): HistoricalChartData {
    const timeframeMap: Record<typeof timeframe, number> = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400
    }

    const timeframeSeconds = timeframeMap[timeframe]
    const history = this.getHistoryForTimeframe(symbol, timeframeSeconds)

    const data = history.map(point => ({
      timestamp: point.timestamp,
      price: point.price,
      confidence: point.confidence,
      volume: point.volume
    }))

    const config = this.getConfig(symbol)

    return {
      symbol,
      timeframe,
      data,
      metadata: {
        dataPoints: data.length,
        samplingInterval: config.samplingInterval,
        compression: config.enableCompression
      }
    }
  }

  // ============================================================================
  // STATISTICAL ANALYSIS
  // ============================================================================

  /**
   * Get comprehensive statistics
   */
  getStats(symbol: string): PriceHistoryStats | null {
    const history = this.getHistory(symbol)

    if (history.length === 0) {
      return null
    }

    const prices = history.map(p => p.price)
    const confidences = history.map(p => p.confidence)

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const currentPrice = prices[prices.length - 1]
    const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
    const averageConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length

    // Calculate volatility (standard deviation)
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - averagePrice, 2), 0) / prices.length
    const volatility = Math.sqrt(variance) / averagePrice * 100

    // Calculate trend
    const trendAnalysis = this.analyzeTrend(symbol)
    const trend = trendAnalysis?.trend || 'stable'

    return {
      symbol,
      dataPoints: history.length,
      timeSpan: (history[history.length - 1].timestamp.getTime() - history[0].timestamp.getTime()) / 1000,
      firstTimestamp: history[0].timestamp,
      lastTimestamp: history[history.length - 1].timestamp,
      priceRange: {
        min: minPrice,
        max: maxPrice,
        current: currentPrice
      },
      averagePrice,
      averageConfidence,
      volatility,
      trend
    }
  }

  // ============================================================================
  // TREND ANALYSIS
  // ============================================================================

  /**
   * Analyze price trend
   */
  analyzeTrend(symbol: string): TrendAnalysis | null {
    const history = this.getHistory(symbol)

    if (history.length < 5) {
      console.warn(`⚠️ Insufficient data for trend analysis of ${symbol}`)
      return null
    }

    console.log(`📊 Analyzing trend for ${symbol}...`)

    const prices = history.map(p => p.price)
    const n = prices.length

    // Calculate linear regression
    const { slope, intercept, r2 } = this.calculateLinearRegression(prices)

    // Determine trend direction and strength
    let trend: TrendAnalysis['trend']
    let strength: TrendAnalysis['strength']
    const slopePercent = (slope / prices[0]) * 100

    if (slopePercent > 0.1) trend = 'up'
    else if (slopePercent < -0.1) trend = 'down'
    else trend = 'stable'

    const absSlopePercent = Math.abs(slopePercent)
    if (absSlopePercent > 2) strength = 'very_strong'
    else if (absSlopePercent > 1) strength = 'strong'
    else if (absSlopePercent > 0.3) strength = 'moderate'
    else strength = 'weak'

    // Calculate technical indicators
    const sma20 = this.calculateSMA(prices, 20)
    const ema20 = this.calculateEMA(prices, 20)
    const rsi = this.calculateRSI(prices, 14)
    const momentum = this.calculateMomentum(prices, 10)

    // Predict next price
    const nextPrice = intercept + slope * n
    const prediction = {
      nextPrice: Math.max(0, nextPrice),
      timeHorizon: this.getConfig(symbol).samplingInterval,
      confidence: Math.max(0.1, Math.min(0.9, r2))
    }

    // Analyze momentum
    let momentumAnalysis: TrendAnalysis['analysis']['momentum']
    if (momentum > 0.01) momentumAnalysis = 'bullish'
    else if (momentum < -0.01) momentumAnalysis = 'bearish'
    else momentumAnalysis = 'neutral'

    // Calculate volatility
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / n
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / n
    const volatility = Math.sqrt(variance) / avgPrice * 100

    let volatilityLevel: TrendAnalysis['analysis']['volatility']
    if (volatility < 1) volatilityLevel = 'low'
    else if (volatility < 3) volatilityLevel = 'medium'
    else if (volatility < 8) volatilityLevel = 'high'
    else volatilityLevel = 'extreme'

    // Calculate support and resistance
    const support = Math.min(...prices.slice(-20))
    const resistance = Math.max(...prices.slice(-20))

    const analysis: TrendAnalysis = {
      symbol,
      trend,
      strength,
      confidence: Math.max(0.1, Math.min(0.9, r2)),
      slope,
      r2,
      prediction,
      indicators: {
        sma20,
        ema20,
        rsi,
        momentum
      },
      analysis: {
        momentum: momentumAnalysis,
        volatility: volatilityLevel,
        support,
        resistance
      }
    }

    console.log(`✅ Trend analysis complete for ${symbol}:`, {
      trend,
      strength,
      confidence: analysis.confidence.toFixed(2)
    })

    return analysis
  }

  /**
   * Calculate linear regression
   */
  private calculateLinearRegression(data: number[]): {
    slope: number
    intercept: number
    r2: number
  } {
    const n = data.length
    const sumX = (n * (n - 1)) / 2
    const sumY = data.reduce((sum, val) => sum + val, 0)
    const sumXY = data.reduce((sum, val, i) => sum + i * val, 0)
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calculate R²
    const yMean = sumY / n
    const ssTotal = data.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0)
    const ssResidual = data.reduce((sum, val, i) => {
      const predicted = intercept + slope * i
      return sum + Math.pow(val - predicted, 2)
    }, 0)
    const r2 = 1 - (ssResidual / ssTotal)

    return { slope, intercept, r2 }
  }

  /**
   * Calculate Simple Moving Average
   */
  private calculateSMA(data: number[], period: number): number {
    if (data.length < period) return data[data.length - 1]

    const slice = data.slice(-period)
    return slice.reduce((sum, val) => sum + val, 0) / period
  }

  /**
   * Calculate Exponential Moving Average
   */
  private calculateEMA(data: number[], period: number): number {
    if (data.length < period) return data[data.length - 1]

    const multiplier = 2 / (period + 1)
    let ema = this.calculateSMA(data.slice(0, period), period)

    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema
    }

    return ema
  }

  /**
   * Calculate Relative Strength Index (RSI)
   */
  private calculateRSI(data: number[], period: number = 14): number {
    if (data.length < period + 1) return 50 // Neutral

    const changes = []
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i] - data[i - 1])
    }

    const gains = changes.map(c => c > 0 ? c : 0)
    const losses = changes.map(c => c < 0 ? -c : 0)

    const avgGain = gains.slice(-period).reduce((sum, g) => sum + g, 0) / period
    const avgLoss = losses.slice(-period).reduce((sum, l) => sum + l, 0) / period

    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    const rsi = 100 - (100 / (1 + rs))

    return rsi
  }

  /**
   * Calculate momentum
   */
  private calculateMomentum(data: number[], period: number = 10): number {
    if (data.length < period) return 0

    const current = data[data.length - 1]
    const past = data[data.length - period]

    return (current - past) / past
  }

  // ============================================================================
  // PRICE COMPARISON
  // ============================================================================

  /**
   * Compare prices over timeframe
   */
  compareTimeframe(
    symbol: string,
    timeframeSeconds: number,
    label: string
  ): PriceComparison | null {
    const history = this.getHistoryForTimeframe(symbol, timeframeSeconds)

    if (history.length < 2) {
      return null
    }

    const prices = history.map(p => p.price)
    const open = prices[0]
    const close = prices[prices.length - 1]
    const high = Math.max(...prices)
    const low = Math.min(...prices)

    const priceChange = close - open
    const priceChangePercent = (priceChange / open) * 100

    // Calculate volatility change
    const firstHalfVolatility = this.calculateVolatilityForPeriod(
      prices.slice(0, Math.floor(prices.length / 2))
    )
    const secondHalfVolatility = this.calculateVolatilityForPeriod(
      prices.slice(Math.floor(prices.length / 2))
    )
    const volatilityChange = secondHalfVolatility - firstHalfVolatility

    return {
      symbol,
      timeframe: label,
      priceChange,
      priceChangePercent,
      high,
      low,
      open,
      close,
      volatilityChange
    }
  }

  /**
   * Calculate volatility for price array
   */
  private calculateVolatilityForPeriod(prices: number[]): number {
    if (prices.length < 2) return 0

    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length

    return Math.sqrt(variance) / avg * 100
  }

  // ============================================================================
  // DATA COMPRESSION
  // ============================================================================

  /**
   * Compress historical data
   */
  private compressHistory(symbol: string): void {
    const config = this.getConfig(symbol)
    const history = this.historyData.get(symbol)

    if (!history || !config.enableCompression) return
    if (history.length < config.compressionThreshold) return

    console.log(`🗜️ Compressing history for ${symbol}...`)

    // Simple compression: keep every nth point when over threshold
    const compressionRatio = Math.ceil(history.length / (config.compressionThreshold * 0.8))

    if (compressionRatio > 1) {
      const compressed = history.filter((_point, index) => index % compressionRatio === 0)
      // Always keep the most recent point
      if (compressed[compressed.length - 1] !== history[history.length - 1]) {
        compressed.push(history[history.length - 1])
      }

      this.historyData.set(symbol, compressed)
      console.log(`✅ Compressed ${symbol} history: ${history.length} → ${compressed.length} points`)
    }
  }

  // ============================================================================
  // CLEANUP & MAINTENANCE
  // ============================================================================

  /**
   * Start background cleanup
   */
  private startBackgroundCleanup(): void {
    setInterval(() => {
      this.performCleanup()
    }, this.cleanupInterval)
  }

  /**
   * Perform cleanup of old data
   */
  private performCleanup(): void {
    console.log('🧹 Performing price history cleanup...')

    let totalRemoved = 0

    for (const [symbol, history] of this.historyData) {
      const config = this.getConfig(symbol)
      const cutoffTime = Date.now() - (config.retentionPeriod * 1000)
      const initialLength = history.length

      const filtered = history.filter(p => p.timestamp.getTime() > cutoffTime)
      this.historyData.set(symbol, filtered)

      totalRemoved += initialLength - filtered.length
    }

    if (totalRemoved > 0) {
      console.log(`✅ Cleanup complete: removed ${totalRemoved} stale data points`)
    }
  }

  /**
   * Clear history for symbol
   */
  clearHistory(symbol?: string): void {
    if (symbol) {
      this.historyData.delete(symbol)
      console.log(`🧹 Cleared history for ${symbol}`)
    } else {
      this.historyData.clear()
      console.log('🧹 Cleared all price history')
    }
  }

  /**
   * Stop all tracking
   */
  stopAll(): void {
    for (const symbol of this.samplingTimers.keys()) {
      this.stopTracking(symbol)
    }
    console.log('⏹️ Stopped all price history tracking')
  }

  /**
   * Get system statistics
   */
  getSystemStats(): {
    trackedSymbols: number
    totalDataPoints: number
    memoryUsage: number
    activeTrackers: number
  } {
    const trackedSymbols = this.historyData.size
    const totalDataPoints = Array.from(this.historyData.values())
      .reduce((sum, history) => sum + history.length, 0)
    const activeTrackers = this.samplingTimers.size

    // Rough memory usage estimation
    const avgPointSize = 100 // bytes per point (estimate)
    const memoryUsage = totalDataPoints * avgPointSize

    return {
      trackedSymbols,
      totalDataPoints,
      memoryUsage,
      activeTrackers
    }
  }
}

// Export singleton instance
export const priceHistoryTracker = new PriceHistoryTracker()

// Default export
export default priceHistoryTracker
