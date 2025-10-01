// Comprehensive Price Feed Management System
// Unified oracle management with intelligent fallback and caching
// Bismillah - implementing robust price feed architecture

import { pythIntegration } from './pyth-integration'
import { switchboardIntegration } from './switchboard-integration'
import { priceConfidenceSystem, type AggregatedPriceData } from './confidence-system'
import { oraclePriceFeeds } from './price-feeds'
import { logger } from '@/lib/logger'

// ============================================================================
// FEED MANAGER INTERFACES
// ============================================================================

export interface PriceFeedConfig {
  symbol: string
  primarySource: 'pyth' | 'switchboard' | 'fallback'
  fallbackSources: string[]
  refreshInterval: number // seconds
  maxStaleness: number // seconds
  confidenceThreshold: number // 0-1
  enableAggregation: boolean
  enableCrossValidation: boolean // Enable cross-oracle price validation
  priceDeviationThreshold: number // Max % deviation between oracles
  retryAttempts: number
  retryDelay: number // milliseconds
}

export interface PriceFeedStatus {
  symbol: string
  status: 'healthy' | 'degraded' | 'failed' | 'unknown'
  primarySource: string
  activeSources: string[]
  lastUpdate: Date
  staleness: number
  confidence: number
  errorCount: number
  lastError?: string
}

export interface UnifiedPriceData {
  symbol: string
  price: number
  confidence: number
  staleness: number
  source: string
  aggregated: boolean
  qualityScore: number
  timestamp: Date
  crossValidated: boolean // Whether price was cross-validated
  priceDeviation?: number // % deviation from other oracles
  metadata: {
    sources: string[]
    aggregationMethod?: string
    crossValidationResults?: CrossValidationResult[]
    warnings: string[]
    actions: string[]
  }
}

export interface CrossValidationResult {
  sourceA: string
  sourceB: string
  priceA: number
  priceB: number
  deviation: number // % deviation
  withinThreshold: boolean
  timestamp: Date
}

export interface FeedManagerStats {
  totalFeeds: number
  healthyFeeds: number
  degradedFeeds: number
  failedFeeds: number
  totalRequests: number
  cacheHitRate: number
  averageResponseTime: number
  uptime: number
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_FEED_CONFIGS: Record<string, PriceFeedConfig> = {
  'SOL': {
    symbol: 'SOL',
    primarySource: 'pyth',
    fallbackSources: ['switchboard', 'fallback'],
    refreshInterval: 5, // 5 seconds for major tokens
    maxStaleness: 30,
    confidenceThreshold: 0.8,
    enableAggregation: true,
    enableCrossValidation: true,
    priceDeviationThreshold: 2.0, // 2% max deviation
    retryAttempts: 3,
    retryDelay: 1000
  },
  'USDC': {
    symbol: 'USDC',
    primarySource: 'pyth',
    fallbackSources: ['switchboard', 'fallback'],
    refreshInterval: 10, // Longer for stablecoins
    maxStaleness: 60,
    confidenceThreshold: 0.9,
    enableAggregation: true,
    enableCrossValidation: true,
    priceDeviationThreshold: 0.5, // 0.5% for stablecoins
    retryAttempts: 3,
    retryDelay: 1000
  },
  'ETH': {
    symbol: 'ETH',
    primarySource: 'pyth',
    fallbackSources: ['switchboard', 'fallback'],
    refreshInterval: 5,
    maxStaleness: 30,
    confidenceThreshold: 0.8,
    enableAggregation: true,
    enableCrossValidation: true,
    priceDeviationThreshold: 2.0, // 2% max deviation
    retryAttempts: 3,
    retryDelay: 1000
  },
  'BTC': {
    symbol: 'BTC',
    primarySource: 'pyth',
    fallbackSources: ['switchboard', 'fallback'],
    refreshInterval: 5,
    maxStaleness: 30,
    confidenceThreshold: 0.8,
    enableAggregation: true,
    enableCrossValidation: true,
    priceDeviationThreshold: 1.5, // 1.5% for BTC (more stable)
    retryAttempts: 3,
    retryDelay: 1000
  },
  'DEFAULT': {
    symbol: 'DEFAULT',
    primarySource: 'pyth',
    fallbackSources: ['switchboard', 'fallback'],
    refreshInterval: 15, // Longer for other tokens
    maxStaleness: 120,
    confidenceThreshold: 0.7,
    enableAggregation: false,
    enableCrossValidation: false, // Disabled for unknown tokens
    priceDeviationThreshold: 5.0, // 5% for other tokens
    retryAttempts: 2,
    retryDelay: 2000
  }
}

// ============================================================================
// COMPREHENSIVE PRICE FEED MANAGER
// ============================================================================

export class PriceFeedManager {
  private feedConfigs = new Map<string, PriceFeedConfig>()
  private feedStatuses = new Map<string, PriceFeedStatus>()
  private priceCache = new Map<string, UnifiedPriceData>()
  private refreshTimers = new Map<string, NodeJS.Timeout>()
  private stats: FeedManagerStats
  private startTime: Date

  constructor() {
    this.stats = {
      totalFeeds: 0,
      healthyFeeds: 0,
      degradedFeeds: 0,
      failedFeeds: 0,
      totalRequests: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
      uptime: 0
    }
    this.startTime = new Date()

    // Load default configurations
    this.loadDefaultConfigs()

    logger.init('🎛️ PriceFeedManager: Unified price feed management initialized')
    console.log('  Default configs loaded:', this.feedConfigs.size)
    console.log('  Cache management: Active')
    console.log('  Health monitoring: Enabled')
  }

  // ============================================================================
  // CORE PRICE RETRIEVAL
  // ============================================================================

  /**
   * Get unified price data with intelligent fallback
   */
  async getPrice(symbol: string, forceRefresh = false): Promise<UnifiedPriceData> {
    const startTime = Date.now()
    this.stats.totalRequests++

    console.log(`💰 Getting price for ${symbol}${forceRefresh ? ' (force refresh)' : ''}...`)

    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = this.getCachedPrice(symbol)
        if (cached && this.isCacheValid(cached, symbol)) {
          console.log(`⚡ Using cached price for ${symbol}`)
          this.updateStats(startTime, true)
          return cached
        }
      }

      // Get configuration
      const config = this.getFeedConfig(symbol)

      // Update feed status to show we're fetching
      this.updateFeedStatus(symbol, {
        status: 'unknown',
        primarySource: config.primarySource,
        activeSources: [],
        lastUpdate: new Date(),
        staleness: 0,
        confidence: 0,
        errorCount: 0
      })

      let priceData: UnifiedPriceData | null = null
      const errors: string[] = []

      // Try primary source with retries
      for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
        try {
          priceData = await this.fetchFromPrimarySource(symbol, config)
          break
        } catch (error) {
          const errorMsg = `Primary source attempt ${attempt}/${config.retryAttempts} failed: ${error}`
          errors.push(errorMsg)
          console.warn(`⚠️ ${errorMsg}`)

          if (attempt < config.retryAttempts) {
            await this.delay(config.retryDelay * attempt) // Exponential backoff
          }
        }
      }

      // Try fallback sources if primary failed
      if (!priceData && config.fallbackSources.length > 0) {
        console.log(`🔄 Trying fallback sources for ${symbol}...`)
        priceData = await this.fetchFromFallbackSources(symbol, config)
      }

      // Try aggregation if enabled and we have some data
      if (!priceData && config.enableAggregation) {
        console.log(`🔄 Trying price aggregation for ${symbol}...`)
        try {
          const aggregated = await priceConfidenceSystem.aggregatePricesWithConfidence(symbol)
          priceData = this.convertAggregatedToUnified(aggregated)
        } catch (error) {
          errors.push(`Aggregation failed: ${error}`)
        }
      }

      if (!priceData) {
        throw new Error(`All price sources failed for ${symbol}: ${errors.join(', ')}`)
      }

      // Update feed status
      this.updateFeedStatus(symbol, {
        status: priceData.qualityScore >= 80 ? 'healthy' : 'degraded',
        primarySource: priceData.source,
        activeSources: [priceData.source],
        lastUpdate: priceData.timestamp,
        staleness: priceData.staleness,
        confidence: priceData.confidence,
        errorCount: errors.length
      })

      // Cache the result
      this.priceCache.set(symbol, priceData)

      // Schedule next refresh
      this.scheduleRefresh(symbol, config)

      this.updateStats(startTime, false)

      console.log(`✅ Price retrieved for ${symbol}:`, {
        price: priceData.price.toFixed(4),
        source: priceData.source,
        quality: priceData.qualityScore,
        confidence: priceData.confidence
      })

      return priceData

    } catch (error) {
      this.stats.totalRequests--
      this.updateFeedStatus(symbol, {
        status: 'failed',
        primarySource: this.getFeedConfig(symbol).primarySource,
        activeSources: [],
        lastUpdate: new Date(),
        staleness: 0,
        confidence: 0,
        errorCount: this.getFeedStatus(symbol)?.errorCount || 0 + 1,
        lastError: error instanceof Error ? error.message : String(error)
      })

      console.error(`❌ Failed to get price for ${symbol}:`, error)
      throw error
    }
  }

  /**
   * Get prices for multiple symbols
   */
  async getPrices(symbols: string[], forceRefresh = false): Promise<Map<string, UnifiedPriceData>> {
    console.log(`💰 Getting prices for ${symbols.length} symbols...`)

    const results = new Map<string, UnifiedPriceData>()
    const promises = symbols.map(async (symbol) => {
      try {
        const price = await this.getPrice(symbol, forceRefresh)
        results.set(symbol, price)
      } catch (error) {
        console.error(`Failed to get price for ${symbol}:`, error)
      }
    })

    await Promise.allSettled(promises)

    console.log(`✅ Retrieved prices for ${results.size}/${symbols.length} symbols`)
    return results
  }

  // ============================================================================
  // PRICE SOURCE IMPLEMENTATIONS
  // ============================================================================

  /**
   * Fetch from primary source
   */
  private async fetchFromPrimarySource(symbol: string, config: PriceFeedConfig): Promise<UnifiedPriceData> {
    switch (config.primarySource) {
      case 'pyth':
        return await this.fetchFromPyth(symbol, config)

      case 'switchboard':
        return await this.fetchFromSwitchboard(symbol, config)

      case 'fallback':
        return await this.fetchFromFallback(symbol, config)

      default:
        throw new Error(`Unknown primary source: ${config.primarySource}`)
    }
  }

  /**
   * Fetch from Pyth Network
   */
  private async fetchFromPyth(symbol: string, config: PriceFeedConfig): Promise<UnifiedPriceData> {
    const pythPrice = await pythIntegration.getPriceData(symbol)
    const confidence = pythIntegration.analyzePriceConfidence(pythPrice)
    const qualityReport = await priceConfidenceSystem.generateQualityReport(symbol)

    let crossValidationResults: CrossValidationResult[] = []
    let priceDeviation: number | undefined
    let crossValidated = false

    // Perform cross-validation if enabled
    if (config.enableCrossValidation) {
      try {
        const validationResult = await this.performCrossValidation(symbol, pythPrice.price, 'pyth', config)
        crossValidationResults = validationResult.results
        priceDeviation = validationResult.maxDeviation
        crossValidated = true
      } catch (error) {
        console.warn(`⚠️ Cross-validation failed for ${symbol}:`, error)
      }
    }

    return {
      symbol,
      price: pythPrice.price,
      confidence: confidence.confidenceScore / 100,
      staleness: pythPrice.staleness,
      source: 'pyth',
      aggregated: false,
      qualityScore: qualityReport.overallScore,
      timestamp: pythPrice.timestamp,
      crossValidated,
      priceDeviation,
      metadata: {
        sources: ['pyth'],
        crossValidationResults,
        warnings: qualityReport.warnings,
        actions: qualityReport.actions
      }
    }
  }

  /**
   * Fetch from Switchboard Network
   */
  private async fetchFromSwitchboard(symbol: string, config: PriceFeedConfig): Promise<UnifiedPriceData> {
    const switchboardPrice = await switchboardIntegration.getPriceData(symbol)
    const confidence = switchboardIntegration.analyzePriceConfidence(switchboardPrice)

    let crossValidationResults: CrossValidationResult[] = []
    let priceDeviation: number | undefined
    let crossValidated = false

    // Perform cross-validation if enabled
    if (config.enableCrossValidation) {
      try {
        const validationResult = await this.performCrossValidation(symbol, switchboardPrice.price, 'switchboard', config)
        crossValidationResults = validationResult.results
        priceDeviation = validationResult.maxDeviation
        crossValidated = true
      } catch (error) {
        console.warn(`⚠️ Cross-validation failed for ${symbol}:`, error)
      }
    }

    return {
      symbol,
      price: switchboardPrice.price,
      confidence: confidence.confidenceScore / 100,
      staleness: switchboardPrice.staleness,
      source: 'switchboard',
      aggregated: false,
      qualityScore: confidence.confidenceScore,
      timestamp: switchboardPrice.timestamp,
      crossValidated,
      priceDeviation,
      metadata: {
        sources: ['switchboard'],
        crossValidationResults,
        warnings: confidence.recommendation === 'reject' ? ['Low confidence Switchboard data'] : [],
        actions: confidence.recommendation === 'use_with_caution' ? ['Consider using additional sources'] : []
      }
    }
  }

  /**
   * Fetch from fallback sources
   */
  private async fetchFromFallback(symbol: string, _config: PriceFeedConfig): Promise<UnifiedPriceData> {
    const fallbackPrice = await oraclePriceFeeds.getTokenPrice(symbol)

    return {
      symbol,
      price: fallbackPrice.price,
      confidence: fallbackPrice.confidence,
      staleness: (Date.now() - fallbackPrice.timestamp.getTime()) / 1000,
      source: fallbackPrice.source,
      aggregated: false,
      qualityScore: fallbackPrice.confidence * 100,
      timestamp: fallbackPrice.timestamp,
      crossValidated: false, // Fallback sources don't support cross-validation
      metadata: {
        sources: [fallbackPrice.source],
        warnings: [],
        actions: []
      }
    }
  }

  /**
   * Try multiple fallback sources
   */
  private async fetchFromFallbackSources(symbol: string, config: PriceFeedConfig): Promise<UnifiedPriceData | null> {
    for (const fallbackSource of config.fallbackSources) {
      try {
        if (fallbackSource === 'switchboard') {
          return await this.fetchFromSwitchboard(symbol, config)
        } else if (fallbackSource === 'pyth') {
          return await this.fetchFromPyth(symbol, config)
        } else if (fallbackSource === 'fallback') {
          return await this.fetchFromFallback(symbol, config)
        }
      } catch (error) {
        console.warn(`⚠️ Fallback source ${fallbackSource} failed for ${symbol}:`, error)
      }
    }
    return null
  }

  // ============================================================================
  // CROSS-ORACLE VALIDATION
  // ============================================================================

  /**
   * Perform cross-validation between multiple oracle sources
   */
  private async performCrossValidation(
    symbol: string,
    primaryPrice: number,
    primarySource: string,
    config: PriceFeedConfig
  ): Promise<{ results: CrossValidationResult[]; maxDeviation: number }> {
    console.log(`🔄 Performing cross-validation for ${symbol} from ${primarySource}...`)

    const results: CrossValidationResult[] = []
    const crossPrices: { source: string; price: number }[] = []

    // Try to get price from other oracle sources
    try {
      if (primarySource !== 'pyth') {
        const pythPrice = await pythIntegration.getPriceData(symbol)
        crossPrices.push({ source: 'pyth', price: pythPrice.price })
      }
    } catch (error) {
      console.warn(`⚠️ Failed to get Pyth price for cross-validation:`, error)
    }

    try {
      if (primarySource !== 'switchboard') {
        const switchboardPrice = await switchboardIntegration.getPriceData(symbol)
        crossPrices.push({ source: 'switchboard', price: switchboardPrice.price })
      }
    } catch (error) {
      console.warn(`⚠️ Failed to get Switchboard price for cross-validation:`, error)
    }

    // Calculate deviations and generate validation results
    let maxDeviation = 0
    const timestamp = new Date()

    for (const crossPrice of crossPrices) {
      const deviation = Math.abs(primaryPrice - crossPrice.price) / primaryPrice * 100
      maxDeviation = Math.max(maxDeviation, deviation)

      const withinThreshold = deviation <= config.priceDeviationThreshold

      results.push({
        sourceA: primarySource,
        sourceB: crossPrice.source,
        priceA: primaryPrice,
        priceB: crossPrice.price,
        deviation,
        withinThreshold,
        timestamp
      })

      if (!withinThreshold) {
        console.warn(`⚠️ Price deviation detected for ${symbol}: ${deviation.toFixed(2)}% between ${primarySource} and ${crossPrice.source}`)
      }
    }

    console.log(`✅ Cross-validation complete for ${symbol}: ${results.length} comparisons, max deviation: ${maxDeviation.toFixed(2)}%`)

    return { results, maxDeviation }
  }

  // ============================================================================
  // CONFIGURATION MANAGEMENT
  // ============================================================================

  /**
   * Load default configurations
   */
  private loadDefaultConfigs(): void {
    for (const [symbol, config] of Object.entries(DEFAULT_FEED_CONFIGS)) {
      this.feedConfigs.set(symbol, config)
    }
  }

  /**
   * Get feed configuration
   */
  private getFeedConfig(symbol: string): PriceFeedConfig {
    return this.feedConfigs.get(symbol) || this.feedConfigs.get('DEFAULT')!
  }

  /**
   * Set feed configuration
   */
  setFeedConfig(symbol: string, config: Partial<PriceFeedConfig>): void {
    const existingConfig = this.getFeedConfig(symbol)
    const newConfig = { ...existingConfig, ...config, symbol }
    this.feedConfigs.set(symbol, newConfig)

    console.log(`⚙️ Updated feed config for ${symbol}`)
  }

  // ============================================================================
  // STATUS & MONITORING
  // ============================================================================

  /**
   * Update feed status
   */
  private updateFeedStatus(symbol: string, status: Partial<PriceFeedStatus>): void {
    const existing = this.feedStatuses.get(symbol)
    const newStatus: PriceFeedStatus = {
      symbol,
      status: 'unknown',
      primarySource: '',
      activeSources: [],
      lastUpdate: new Date(),
      staleness: 0,
      confidence: 0,
      errorCount: 0,
      ...existing,
      ...status
    }

    this.feedStatuses.set(symbol, newStatus)
    this.updateStatsFromStatuses()
  }

  /**
   * Get feed status
   */
  getFeedStatus(symbol: string): PriceFeedStatus | null {
    return this.feedStatuses.get(symbol) || null
  }

  /**
   * Get all feed statuses
   */
  getAllFeedStatuses(): Map<string, PriceFeedStatus> {
    return new Map(this.feedStatuses)
  }

  /**
   * Get system health overview
   */
  getSystemHealth(): {
    overallHealth: 'healthy' | 'degraded' | 'critical'
    healthPercentage: number
    activeFeeds: number
    issues: string[]
  } {
    const statuses = Array.from(this.feedStatuses.values())
    const healthyCount = statuses.filter(s => s.status === 'healthy').length
    const healthPercentage = statuses.length > 0 ? (healthyCount / statuses.length) * 100 : 100

    let overallHealth: 'healthy' | 'degraded' | 'critical'
    if (healthPercentage >= 90) overallHealth = 'healthy'
    else if (healthPercentage >= 70) overallHealth = 'degraded'
    else overallHealth = 'critical'

    const issues: string[] = []
    for (const status of statuses) {
      if (status.status === 'failed') {
        issues.push(`${status.symbol} feed failed: ${status.lastError || 'Unknown error'}`)
      } else if (status.status === 'degraded') {
        issues.push(`${status.symbol} feed degraded: Low confidence or high staleness`)
      }
    }

    return {
      overallHealth,
      healthPercentage,
      activeFeeds: statuses.filter(s => s.status !== 'failed').length,
      issues
    }
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Check if cached price is valid
   */
  private isCacheValid(cachedData: UnifiedPriceData, symbol: string): boolean {
    const config = this.getFeedConfig(symbol)
    const age = (Date.now() - cachedData.timestamp.getTime()) / 1000

    return age < config.refreshInterval && cachedData.staleness < config.maxStaleness
  }

  /**
   * Get cached price
   */
  private getCachedPrice(symbol: string): UnifiedPriceData | null {
    return this.priceCache.get(symbol) || null
  }

  /**
   * Clear cache for symbol
   */
  clearCache(symbol?: string): void {
    if (symbol) {
      this.priceCache.delete(symbol)
      console.log(`🧹 Cleared cache for ${symbol}`)
    } else {
      this.priceCache.clear()
      console.log('🧹 Cleared all price cache')
    }
  }

  // ============================================================================
  // REFRESH SCHEDULING
  // ============================================================================

  /**
   * Schedule automatic refresh
   */
  private scheduleRefresh(symbol: string, config: PriceFeedConfig): void {
    // Clear existing timer
    const existingTimer = this.refreshTimers.get(symbol)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Schedule new refresh
    const timer = setTimeout(async () => {
      try {
        await this.getPrice(symbol, true)
      } catch (error) {
        console.error(`🔄 Auto-refresh failed for ${symbol}:`, error)
      }
    }, config.refreshInterval * 1000)

    this.refreshTimers.set(symbol, timer)
  }

  /**
   * Stop all refresh timers
   */
  stopAllRefresh(): void {
    for (const timer of this.refreshTimers.values()) {
      clearTimeout(timer)
    }
    this.refreshTimers.clear()
    console.log('⏹️ Stopped all refresh timers')
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Convert aggregated data to unified format
   */
  private convertAggregatedToUnified(aggregated: AggregatedPriceData): UnifiedPriceData {
    // Calculate price deviation from aggregated sources
    const prices = aggregated.sources.map(s => s.price)
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const maxDeviation = Math.max(...prices.map(price => Math.abs(price - avgPrice) / avgPrice * 100))

    return {
      symbol: aggregated.symbol,
      price: aggregated.primaryPrice,
      confidence: aggregated.confidence,
      staleness: aggregated.staleness,
      source: 'aggregated',
      aggregated: true,
      qualityScore: aggregated.qualityScore,
      timestamp: new Date(),
      crossValidated: aggregated.sources.length > 1, // Cross-validated if multiple sources
      priceDeviation: aggregated.sources.length > 1 ? maxDeviation : undefined,
      metadata: {
        sources: aggregated.sources.map(s => s.source),
        aggregationMethod: aggregated.aggregationMethod,
        warnings: maxDeviation > 3 ? [`High price deviation: ${maxDeviation.toFixed(2)}%`] : [],
        actions: maxDeviation > 5 ? ['Consider validating individual oracle sources'] : []
      }
    }
  }

  /**
   * Update statistics
   */
  private updateStats(startTime: number, cacheHit: boolean): void {
    const responseTime = Date.now() - startTime

    // Update cache hit rate
    this.stats.cacheHitRate = cacheHit
      ? (this.stats.cacheHitRate * (this.stats.totalRequests - 1) + 1) / this.stats.totalRequests
      : (this.stats.cacheHitRate * (this.stats.totalRequests - 1)) / this.stats.totalRequests

    // Update average response time (only for non-cache hits)
    if (!cacheHit) {
      this.stats.averageResponseTime =
        (this.stats.averageResponseTime * (this.stats.totalRequests - 1) + responseTime) / this.stats.totalRequests
    }

    // Update uptime
    this.stats.uptime = (Date.now() - this.startTime.getTime()) / 1000
  }

  /**
   * Update stats from feed statuses
   */
  private updateStatsFromStatuses(): void {
    const statuses = Array.from(this.feedStatuses.values())
    this.stats.totalFeeds = statuses.length
    this.stats.healthyFeeds = statuses.filter(s => s.status === 'healthy').length
    this.stats.degradedFeeds = statuses.filter(s => s.status === 'degraded').length
    this.stats.failedFeeds = statuses.filter(s => s.status === 'failed').length
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get system statistics
   */
  getStats(): FeedManagerStats {
    return { ...this.stats }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopAllRefresh()
    this.clearCache()
    console.log('🧹 PriceFeedManager cleaned up')
  }
}

// Export singleton instance
export const priceFeedManager = new PriceFeedManager()

// Default export
export default priceFeedManager