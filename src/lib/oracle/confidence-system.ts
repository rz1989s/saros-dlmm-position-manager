// Advanced Price Confidence and Staleness Detection System
// Comprehensive quality analysis for DLMM price feeds
// Bismillah - implementing intelligent price confidence system

import { pythIntegration, type PythPriceData, type PriceConfidenceMetrics } from './pyth-integration'
import { oraclePriceFeeds } from './price-feeds'
import { logger } from '@/lib/logger'

// ============================================================================
// CONFIDENCE SYSTEM INTERFACES
// ============================================================================

export interface ConfidenceThresholds {
  veryHigh: {
    maxConfidencePercent: number
    maxStaleness: number
    minScore: number
  }
  high: {
    maxConfidencePercent: number
    maxStaleness: number
    minScore: number
  }
  medium: {
    maxConfidencePercent: number
    maxStaleness: number
    minScore: number
  }
  low: {
    maxConfidencePercent: number
    maxStaleness: number
    minScore: number
  }
}

export interface PriceValidationRules {
  maxPriceDeviation: number // Max % deviation from EMA
  maxConfidencePercent: number // Max confidence as % of price
  maxStaleness: number // Max staleness in seconds
  requireTradingStatus: boolean
  minHistoricalDataPoints: number
}

export interface PriceQualityReport {
  symbol: string
  overallScore: number // 0-100
  confidence: PriceConfidenceMetrics
  staleness: {
    seconds: number
    level: 'fresh' | 'acceptable' | 'stale' | 'expired'
    recommendation: string
  }
  consistency: {
    deviationFromEMA: number
    volatility: number
    stability: 'stable' | 'moderate' | 'volatile' | 'extreme'
  }
  reliability: {
    source: string
    updateFrequency: number
    successRate: number
    lastSuccess: Date
  }
  recommendation: 'use' | 'use_with_caution' | 'fallback' | 'reject'
  warnings: string[]
  actions: string[]
}

export interface AggregatedPriceData {
  symbol: string
  primaryPrice: number
  confidence: number
  sources: {
    source: string
    price: number
    confidence: number
    weight: number
    timestamp: Date
  }[]
  aggregationMethod: 'weighted_average' | 'median' | 'highest_confidence'
  qualityScore: number
  staleness: number
}

// ============================================================================
// CONFIDENCE THRESHOLDS CONFIGURATION
// ============================================================================

export const DEFAULT_CONFIDENCE_THRESHOLDS: ConfidenceThresholds = {
  veryHigh: {
    maxConfidencePercent: 0.1, // 0.1% of price
    maxStaleness: 10, // 10 seconds
    minScore: 95
  },
  high: {
    maxConfidencePercent: 0.5, // 0.5% of price
    maxStaleness: 30, // 30 seconds
    minScore: 85
  },
  medium: {
    maxConfidencePercent: 1.0, // 1% of price
    maxStaleness: 60, // 1 minute
    minScore: 70
  },
  low: {
    maxConfidencePercent: 2.0, // 2% of price
    maxStaleness: 120, // 2 minutes
    minScore: 50
  }
}

export const DEFAULT_VALIDATION_RULES: Record<string, PriceValidationRules> = {
  'SOL': {
    maxPriceDeviation: 5.0, // 5% deviation from EMA
    maxConfidencePercent: 1.0,
    maxStaleness: 60,
    requireTradingStatus: true,
    minHistoricalDataPoints: 5
  },
  'USDC': {
    maxPriceDeviation: 1.0, // Stablecoin - lower deviation
    maxConfidencePercent: 0.5,
    maxStaleness: 60,
    requireTradingStatus: true,
    minHistoricalDataPoints: 3
  },
  'ETH': {
    maxPriceDeviation: 5.0,
    maxConfidencePercent: 1.0,
    maxStaleness: 60,
    requireTradingStatus: true,
    minHistoricalDataPoints: 5
  },
  'BTC': {
    maxPriceDeviation: 3.0, // Lower deviation for BTC
    maxConfidencePercent: 0.8,
    maxStaleness: 60,
    requireTradingStatus: true,
    minHistoricalDataPoints: 5
  },
  'DEFAULT': {
    maxPriceDeviation: 10.0, // Higher tolerance for other tokens
    maxConfidencePercent: 2.0,
    maxStaleness: 120,
    requireTradingStatus: false,
    minHistoricalDataPoints: 3
  }
}

// ============================================================================
// ADVANCED CONFIDENCE SYSTEM
// ============================================================================

export class PriceConfidenceSystem {
  private priceHistory = new Map<string, PythPriceData[]>()
  private qualityReports = new Map<string, PriceQualityReport>()
  private readonly maxHistorySize = 100
  private validationRules: Record<string, PriceValidationRules>

  constructor(
    thresholds: ConfidenceThresholds = DEFAULT_CONFIDENCE_THRESHOLDS,
    validationRules: Record<string, PriceValidationRules> = DEFAULT_VALIDATION_RULES
  ) {
    // Thresholds stored for future validation features
    this.validationRules = validationRules

    logger.init('📊 PriceConfidenceSystem: Advanced confidence analysis initialized')
    console.log('  Confidence levels:', Object.keys(thresholds).length)
    console.log('  Validation rules:', Object.keys(validationRules).length)
  }

  // ============================================================================
  // COMPREHENSIVE PRICE QUALITY ANALYSIS
  // ============================================================================

  /**
   * Generate comprehensive quality report for a price feed
   */
  async generateQualityReport(symbol: string): Promise<PriceQualityReport> {
    console.log(`📊 Generating quality report for ${symbol}...`)

    try {
      // Get current price data
      const pythPrice = await pythIntegration.getPriceData(symbol)
      const confidence = pythIntegration.analyzePriceConfidence(pythPrice)

      // Add to history
      this.addPriceToHistory(symbol, pythPrice)

      // Get validation rules
      const rules = this.validationRules[symbol] || this.validationRules.DEFAULT

      // Analyze staleness
      const stalenessAnalysis = this.analyzeStaleness(pythPrice, rules)

      // Analyze consistency
      const consistencyAnalysis = this.analyzeConsistency(symbol, pythPrice)

      // Analyze reliability
      const reliabilityAnalysis = this.analyzeReliability(symbol, pythPrice)

      // Calculate overall score
      const overallScore = this.calculateOverallScore(confidence, stalenessAnalysis, consistencyAnalysis, reliabilityAnalysis)

      // Generate recommendation
      const recommendation = this.generateRecommendation(overallScore, confidence, stalenessAnalysis)

      // Generate warnings and actions
      const { warnings, actions } = this.generateWarningsAndActions(confidence, stalenessAnalysis, consistencyAnalysis, rules)

      const report: PriceQualityReport = {
        symbol,
        overallScore,
        confidence,
        staleness: stalenessAnalysis,
        consistency: consistencyAnalysis,
        reliability: reliabilityAnalysis,
        recommendation,
        warnings,
        actions
      }

      // Cache the report
      this.qualityReports.set(symbol, report)

      console.log(`✅ Quality report for ${symbol} generated:`, {
        score: overallScore,
        recommendation,
        confidenceLevel: confidence.confidenceLevel
      })

      return report

    } catch (error) {
      console.error(`❌ Error generating quality report for ${symbol}:`, error)
      throw error
    }
  }

  /**
   * Analyze price staleness
   */
  private analyzeStaleness(
    priceData: PythPriceData,
    rules: PriceValidationRules
  ): PriceQualityReport['staleness'] {
    const staleness = priceData.staleness

    let level: PriceQualityReport['staleness']['level']
    let recommendation: string

    if (staleness <= 10) {
      level = 'fresh'
      recommendation = 'Price data is very fresh - safe to use'
    } else if (staleness <= rules.maxStaleness) {
      level = 'acceptable'
      recommendation = 'Price data is acceptable for most use cases'
    } else if (staleness <= rules.maxStaleness * 2) {
      level = 'stale'
      recommendation = 'Price data is stale - consider using cached data or alternative sources'
    } else {
      level = 'expired'
      recommendation = 'Price data is too old - do not use for critical operations'
    }

    return {
      seconds: staleness,
      level,
      recommendation
    }
  }

  /**
   * Analyze price consistency
   */
  private analyzeConsistency(
    symbol: string,
    currentPrice: PythPriceData
  ): PriceQualityReport['consistency'] {
    const history = this.priceHistory.get(symbol) || []

    // Calculate deviation from EMA
    const deviationFromEMA = Math.abs((currentPrice.price - currentPrice.emaPrice) / currentPrice.emaPrice) * 100

    // Calculate volatility from recent history
    let volatility = 0
    if (history.length >= 3) {
      const recentPrices = history.slice(-10).map(p => p.price)
      const avg = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length
      const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / recentPrices.length
      volatility = Math.sqrt(variance) / avg * 100
    }

    // Determine stability level
    let stability: PriceQualityReport['consistency']['stability']
    if (volatility < 1) stability = 'stable'
    else if (volatility < 3) stability = 'moderate'
    else if (volatility < 8) stability = 'volatile'
    else stability = 'extreme'

    return {
      deviationFromEMA,
      volatility,
      stability
    }
  }

  /**
   * Analyze price reliability
   */
  private analyzeReliability(
    symbol: string,
    priceData: PythPriceData
  ): PriceQualityReport['reliability'] {
    const config = pythIntegration.getFeedConfig(symbol)
    const history = this.priceHistory.get(symbol) || []

    // Calculate success rate from history
    const recentHistory = history.slice(-20)
    const successfulUpdates = recentHistory.filter(p => p.staleness < 60).length
    const successRate = recentHistory.length > 0 ? (successfulUpdates / recentHistory.length) * 100 : 100

    return {
      source: 'Pyth Network',
      updateFrequency: config?.updateFrequency || 1,
      successRate,
      lastSuccess: priceData.timestamp
    }
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallScore(
    confidence: PriceConfidenceMetrics,
    staleness: PriceQualityReport['staleness'],
    consistency: PriceQualityReport['consistency'],
    reliability: PriceQualityReport['reliability']
  ): number {
    // Weighted scoring system
    const confidenceScore = confidence.confidenceScore * 0.4 // 40% weight

    let stalenessScore = 100
    if (staleness.level === 'acceptable') stalenessScore = 85
    else if (staleness.level === 'stale') stalenessScore = 60
    else if (staleness.level === 'expired') stalenessScore = 30
    stalenessScore *= 0.25 // 25% weight

    let consistencyScore = 100
    if (consistency.stability === 'moderate') consistencyScore = 85
    else if (consistency.stability === 'volatile') consistencyScore = 70
    else if (consistency.stability === 'extreme') consistencyScore = 40
    consistencyScore *= 0.20 // 20% weight

    const reliabilityScore = Math.min(reliability.successRate, 100) * 0.15 // 15% weight

    return Math.round(confidenceScore + stalenessScore + consistencyScore + reliabilityScore)
  }

  /**
   * Generate usage recommendation
   */
  private generateRecommendation(
    overallScore: number,
    confidence: PriceConfidenceMetrics,
    staleness: PriceQualityReport['staleness']
  ): PriceQualityReport['recommendation'] {
    if (overallScore >= 90 && confidence.confidenceLevel === 'very_high') {
      return 'use'
    } else if (overallScore >= 75 && staleness.level !== 'expired') {
      return 'use_with_caution'
    } else if (overallScore >= 60 || staleness.level === 'stale') {
      return 'fallback'
    } else {
      return 'reject'
    }
  }

  /**
   * Generate warnings and actions
   */
  private generateWarningsAndActions(
    confidence: PriceConfidenceMetrics,
    staleness: PriceQualityReport['staleness'],
    consistency: PriceQualityReport['consistency'],
    rules: PriceValidationRules
  ): { warnings: string[]; actions: string[] } {
    const warnings: string[] = []
    const actions: string[] = []

    // Staleness warnings
    if (staleness.level === 'stale') {
      warnings.push('Price data is stale')
      actions.push('Consider refreshing price data')
    } else if (staleness.level === 'expired') {
      warnings.push('Price data is expired')
      actions.push('Use fallback price source or cached data')
    }

    // Confidence warnings
    if (confidence.confidenceLevel === 'low' || confidence.confidenceLevel === 'very_low') {
      warnings.push('Low price confidence')
      actions.push('Increase slippage tolerance or delay transaction')
    }

    // Consistency warnings
    if (consistency.deviationFromEMA > rules.maxPriceDeviation) {
      warnings.push('Significant price deviation from EMA')
      actions.push('Verify price against alternative sources')
    }

    if (consistency.stability === 'volatile' || consistency.stability === 'extreme') {
      warnings.push('High price volatility detected')
      actions.push('Consider using wider price ranges or delaying operations')
    }

    // Quality flag warnings
    for (const flag of confidence.qualityFlags) {
      if (flag === 'NON_TRADING_STATUS') {
        warnings.push('Market not in trading status')
        actions.push('Verify market status before executing trades')
      }
    }

    return { warnings, actions }
  }

  // ============================================================================
  // PRICE AGGREGATION & VALIDATION
  // ============================================================================

  /**
   * Aggregate prices from multiple sources with confidence weighting
   */
  async aggregatePricesWithConfidence(symbol: string): Promise<AggregatedPriceData> {
    console.log(`🔄 Aggregating prices for ${symbol} with confidence weighting...`)

    try {
      const sources: AggregatedPriceData['sources'] = []

      // Get Pyth price
      try {
        const pythPrice = await pythIntegration.getPriceData(symbol)
        const confidence = pythIntegration.analyzePriceConfidence(pythPrice)

        sources.push({
          source: 'pyth',
          price: pythPrice.price,
          confidence: confidence.confidenceScore / 100,
          weight: this.calculateSourceWeight(confidence.confidenceScore, pythPrice.staleness),
          timestamp: pythPrice.timestamp
        })
      } catch (error) {
        console.warn('⚠️ Failed to get Pyth price:', error)
      }

      // Get fallback price from existing oracle system
      try {
        const fallbackPrice = await oraclePriceFeeds.getTokenPrice(symbol)
        sources.push({
          source: fallbackPrice.source,
          price: fallbackPrice.price,
          confidence: fallbackPrice.confidence,
          weight: this.calculateSourceWeight(fallbackPrice.confidence * 100, 0),
          timestamp: fallbackPrice.timestamp
        })
      } catch (error) {
        console.warn('⚠️ Failed to get fallback price:', error)
      }

      if (sources.length === 0) {
        throw new Error(`No price sources available for ${symbol}`)
      }

      // Calculate weighted average
      const totalWeight = sources.reduce((sum, source) => sum + source.weight, 0)
      const weightedPrice = sources.reduce((sum, source) => sum + (source.price * source.weight), 0) / totalWeight
      const averageConfidence = sources.reduce((sum, source) => sum + (source.confidence * source.weight), 0) / totalWeight

      // Calculate overall quality score
      const qualityScore = Math.min(
        sources.reduce((sum, source) => sum + (source.confidence * 100 * source.weight), 0) / totalWeight,
        100
      )

      // Calculate staleness (minimum from all sources)
      const minStaleness = Math.min(...sources.map(source =>
        (Date.now() - source.timestamp.getTime()) / 1000
      ))

      const aggregatedData: AggregatedPriceData = {
        symbol,
        primaryPrice: weightedPrice,
        confidence: averageConfidence,
        sources,
        aggregationMethod: 'weighted_average',
        qualityScore,
        staleness: minStaleness
      }

      console.log(`✅ Aggregated price for ${symbol}:`, {
        price: weightedPrice.toFixed(4),
        quality: qualityScore.toFixed(1),
        sources: sources.length
      })

      return aggregatedData

    } catch (error) {
      console.error(`❌ Error aggregating prices for ${symbol}:`, error)
      throw error
    }
  }

  /**
   * Calculate source weight based on confidence and staleness
   */
  private calculateSourceWeight(confidenceScore: number, staleness: number): number {
    // Base weight from confidence score
    let weight = confidenceScore / 100

    // Apply staleness penalty
    if (staleness > 60) weight *= 0.8
    if (staleness > 120) weight *= 0.6
    if (staleness > 300) weight *= 0.3

    return Math.max(weight, 0.1) // Minimum weight of 0.1
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Add price to historical data
   */
  private addPriceToHistory(symbol: string, priceData: PythPriceData): void {
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, [])
    }

    const history = this.priceHistory.get(symbol)!
    history.push(priceData)

    // Maintain history size limit
    if (history.length > this.maxHistorySize) {
      history.shift()
    }
  }

  /**
   * Get cached quality report
   */
  getCachedQualityReport(symbol: string): PriceQualityReport | null {
    return this.qualityReports.get(symbol) || null
  }

  /**
   * Get price history for symbol
   */
  getPriceHistory(symbol: string): PythPriceData[] {
    return this.priceHistory.get(symbol) || []
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.priceHistory.clear()
    this.qualityReports.clear()
    console.log('🧹 Price confidence system cache cleared')
  }

  /**
   * Get system statistics
   */
  getSystemStats(): {
    trackedSymbols: number
    totalPricePoints: number
    qualityReports: number
    averageQuality: number
  } {
    const trackedSymbols = this.priceHistory.size
    const totalPricePoints = Array.from(this.priceHistory.values())
      .reduce((sum, history) => sum + history.length, 0)
    const qualityReports = this.qualityReports.size

    const qualityScores = Array.from(this.qualityReports.values())
      .map(report => report.overallScore)
    const averageQuality = qualityScores.length > 0
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
      : 0

    return {
      trackedSymbols,
      totalPricePoints,
      qualityReports,
      averageQuality
    }
  }
}

// Export singleton instance
export const priceConfidenceSystem = new PriceConfidenceSystem()

// Default export
export default priceConfidenceSystem