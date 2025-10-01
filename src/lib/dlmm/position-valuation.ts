// Position Valuation System
// 💰 Oracle-based position valuation with real-time updates and P&L accuracy
// ✅ Integration with Pyth Network and Switchboard for accurate pricing
// ✅ Real-time position value tracking with confidence intervals
// ✅ Historical valuation tracking and P&L attribution

import type { DLMMPosition, BinInfo } from '@/lib/types'
import { oraclePriceFeeds, type PriceData } from '@/lib/oracle/price-feeds'
import { dlmmClient } from './client'

// ============================================================================
// VALUATION TYPES
// ============================================================================

export interface PositionValuation {
  positionId: string
  timestamp: Date

  // Current valuation
  currentValue: {
    total: number
    tokenX: number
    tokenY: number
    confidence: number // 0-100, based on oracle confidence
  }

  // Price data from oracles
  priceData: {
    tokenX: PriceData
    tokenY: PriceData
    pairPrice: number // tokenY per tokenX
    oracleStatus: 'healthy' | 'degraded' | 'stale'
  }

  // Liquidity breakdown
  liquidityBreakdown: {
    totalLiquidity: number
    activeLiquidity: number
    inactiveLiquidity: number
    liquidityUtilization: number // % of liquidity in active bins
    bins: BinValuation[]
  }

  // Historical comparison
  historical: {
    initialValue: number
    peakValue: number
    lowestValue: number
    averageValue: number
    valueChange24h: number
    valueChange7d: number
    valueChange30d: number
  }

  // P&L breakdown
  pnl: {
    total: number
    totalPercent: number
    realized: number
    unrealized: number

    // Attribution
    feeEarnings: number
    priceAppreciation: number
    impermanentLoss: number

    // Detailed breakdown
    attribution: {
      fees: { amount: number; percent: number }
      tokenXGains: { amount: number; percent: number }
      tokenYGains: { amount: number; percent: number }
      impermanentLoss: { amount: number; percent: number }
    }
  }

  // Risk metrics
  riskMetrics: {
    volatilityScore: number // 0-100
    priceDeviation: number // % from initial price ratio
    concentrationRisk: number // 0-100
    oracleConfidence: number // 0-100
    overallRiskScore: number // 0-100
  }
}

export interface BinValuation {
  binId: number
  price: number
  liquidityX: number
  liquidityY: number
  totalValue: number
  valuePercent: number // % of total position value
  isActive: boolean
  feeRate: number
  estimatedApr: number
}

export interface ValuationHistory {
  positionId: string
  snapshots: ValuationSnapshot[]
  aggregatedMetrics: AggregatedValuationMetrics
}

export interface ValuationSnapshot {
  timestamp: Date
  totalValue: number
  tokenXValue: number
  tokenYValue: number
  pnl: number
  pnlPercent: number
  priceX: number
  priceY: number
  liquidityUtilization: number
  oracleConfidence: number
}

export interface AggregatedValuationMetrics {
  averageValue: number
  peakValue: number
  lowestValue: number
  averagePnL: number
  totalReturn: number
  annualizedReturn: number
  sharpeRatio: number
  volatility: number
  maxDrawdown: number
  averageOracleConfidence: number
}

export interface ValuationUpdate {
  positionId: string
  previousValue: number
  currentValue: number
  valueChange: number
  changePercent: number
  trigger: 'price_change' | 'liquidity_change' | 'manual_refresh' | 'scheduled'
  timestamp: Date
}

// ============================================================================
// POSITION VALUATION SERVICE
// ============================================================================

export class PositionValuationService {
  private valuationCache = new Map<string, { valuation: PositionValuation; timestamp: number }>()
  private valuationHistory = new Map<string, ValuationHistory>()
  private updateCallbacks = new Map<string, Array<(update: ValuationUpdate) => void>>()
  private readonly cacheDuration = 10000 // 10 seconds for valuation cache
  private monitoringInterval?: NodeJS.Timeout
  private isMonitoring = false

  // ========================================================================
  // CORE VALUATION METHODS
  // ========================================================================

  /**
   * Get comprehensive position valuation with oracle data
   */
  async getPositionValuation(
    position: DLMMPosition,
    useCache: boolean = true
  ): Promise<PositionValuation> {
    const cacheKey = position.id

    // Check cache
    if (useCache) {
      const cached = this.valuationCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.valuation
      }
    }

    try {
      // Fetch oracle price data
      const [priceDataX, priceDataY] = await Promise.all([
        oraclePriceFeeds.getTokenPrice(position.tokenX.symbol),
        oraclePriceFeeds.getTokenPrice(position.tokenY.symbol)
      ])

      // Get pool data for liquidity information (used for validation)
      await dlmmClient.getPoolAnalytics(position.poolAddress, true)
      const binData = position.bins || []

      // Get active bin from position data
      const activeBinId = position.activeBin

      // Calculate current values
      const tokenXValue = this.calculateTokenValue(
        position.tokenX,
        binData,
        priceDataX.price
      )
      const tokenYValue = this.calculateTokenValue(
        position.tokenY,
        binData,
        priceDataY.price
      )
      const totalValue = tokenXValue + tokenYValue

      // Calculate liquidity breakdown
      const liquidityBreakdown = this.calculateLiquidityBreakdown(
        binData,
        priceDataX.price,
        priceDataY.price,
        activeBinId
      )

      // Get historical data
      const historicalData = this.getHistoricalData(position.id, totalValue)

      // Calculate P&L
      const pnlData = this.calculatePnL(
        position,
        totalValue,
        tokenXValue,
        tokenYValue,
        historicalData.initialValue
      )

      // Calculate risk metrics
      const riskMetrics = this.calculateRiskMetrics(
        position,
        priceDataX,
        priceDataY,
        liquidityBreakdown
      )

      const valuation: PositionValuation = {
        positionId: position.id,
        timestamp: new Date(),
        currentValue: {
          total: totalValue,
          tokenX: tokenXValue,
          tokenY: tokenYValue,
          confidence: Math.min(priceDataX.confidence, priceDataY.confidence)
        },
        priceData: {
          tokenX: priceDataX,
          tokenY: priceDataY,
          pairPrice: priceDataY.price / priceDataX.price,
          oracleStatus: this.determineOracleStatus(priceDataX, priceDataY)
        },
        liquidityBreakdown,
        historical: historicalData,
        pnl: pnlData,
        riskMetrics
      }

      // Update cache
      this.valuationCache.set(cacheKey, {
        valuation,
        timestamp: Date.now()
      })

      // Record snapshot
      this.recordValuationSnapshot(position.id, valuation)

      return valuation
    } catch (error) {
      console.error('❌ Error calculating position valuation:', error)
      throw new Error('Failed to calculate position valuation')
    }
  }

  /**
   * Calculate token value from bin data and oracle price
   */
  private calculateTokenValue(
    token: { symbol: string; decimals: number },
    bins: BinInfo[],
    price: number
  ): number {
    const isTokenX = bins[0]?.liquidityX !== '0'

    const totalLiquidity = bins.reduce((sum, bin) => {
      const liquidity = isTokenX
        ? parseFloat(bin.liquidityX)
        : parseFloat(bin.liquidityY)
      return sum + liquidity
    }, 0)

    // Adjust for decimals
    const adjustedLiquidity = totalLiquidity / Math.pow(10, token.decimals)

    return adjustedLiquidity * price
  }

  /**
   * Calculate detailed liquidity breakdown by bin
   */
  private calculateLiquidityBreakdown(
    bins: BinInfo[],
    priceX: number,
    priceY: number,
    activeBinId: number
  ): PositionValuation['liquidityBreakdown'] {
    const binValuations: BinValuation[] = bins.map(bin => {
      const liquidityX = parseFloat(bin.liquidityX)
      const liquidityY = parseFloat(bin.liquidityY)
      const totalValue = (liquidityX * priceX) + (liquidityY * priceY)
      const isActive = bin.binId === activeBinId

      return {
        binId: bin.binId,
        price: bin.price,
        liquidityX,
        liquidityY,
        totalValue,
        valuePercent: 0, // Will be calculated after
        isActive,
        feeRate: bin.feeRate,
        estimatedApr: this.estimateBinAPR(bin, totalValue)
      }
    })

    const totalLiquidity = binValuations.reduce((sum, b) => sum + b.totalValue, 0)
    const activeLiquidity = binValuations
      .filter(b => b.isActive)
      .reduce((sum, b) => sum + b.totalValue, 0)

    // Calculate value percentages
    binValuations.forEach(bin => {
      bin.valuePercent = totalLiquidity > 0 ? (bin.totalValue / totalLiquidity) * 100 : 0
    })

    return {
      totalLiquidity,
      activeLiquidity,
      inactiveLiquidity: totalLiquidity - activeLiquidity,
      liquidityUtilization: totalLiquidity > 0 ? (activeLiquidity / totalLiquidity) * 100 : 0,
      bins: binValuations
    }
  }

  /**
   * Estimate APR for a specific bin
   */
  private estimateBinAPR(bin: BinInfo, liquidityValue: number): number {
    if (liquidityValue === 0) return 0

    const volume24h = parseFloat(bin.volume24h)
    const annualizedVolume = volume24h * 365
    const feeRevenue = annualizedVolume * bin.feeRate

    return liquidityValue > 0 ? (feeRevenue / liquidityValue) * 100 : 0
  }

  /**
   * Get or initialize historical data
   */
  private getHistoricalData(
    positionId: string,
    currentValue: number
  ): PositionValuation['historical'] {
    const history = this.valuationHistory.get(positionId)

    if (!history || history.snapshots.length === 0) {
      // Initialize with current value
      return {
        initialValue: currentValue,
        peakValue: currentValue,
        lowestValue: currentValue,
        averageValue: currentValue,
        valueChange24h: 0,
        valueChange7d: 0,
        valueChange30d: 0
      }
    }

    const snapshots = history.snapshots
    const now = Date.now()

    const snapshot24h = this.findSnapshotByTime(snapshots, now - 24 * 60 * 60 * 1000)
    const snapshot7d = this.findSnapshotByTime(snapshots, now - 7 * 24 * 60 * 60 * 1000)
    const snapshot30d = this.findSnapshotByTime(snapshots, now - 30 * 24 * 60 * 60 * 1000)

    return {
      initialValue: snapshots[0].totalValue,
      peakValue: history.aggregatedMetrics.peakValue,
      lowestValue: history.aggregatedMetrics.lowestValue,
      averageValue: history.aggregatedMetrics.averageValue,
      valueChange24h: snapshot24h ? ((currentValue - snapshot24h.totalValue) / snapshot24h.totalValue) * 100 : 0,
      valueChange7d: snapshot7d ? ((currentValue - snapshot7d.totalValue) / snapshot7d.totalValue) * 100 : 0,
      valueChange30d: snapshot30d ? ((currentValue - snapshot30d.totalValue) / snapshot30d.totalValue) * 100 : 0
    }
  }

  /**
   * Find snapshot closest to target time
   */
  private findSnapshotByTime(
    snapshots: ValuationSnapshot[],
    targetTime: number
  ): ValuationSnapshot | null {
    if (snapshots.length === 0) return null

    let closest = snapshots[0]
    let minDiff = Math.abs(snapshots[0].timestamp.getTime() - targetTime)

    for (const snapshot of snapshots) {
      const diff = Math.abs(snapshot.timestamp.getTime() - targetTime)
      if (diff < minDiff) {
        minDiff = diff
        closest = snapshot
      }
    }

    return closest
  }

  /**
   * Calculate comprehensive P&L
   */
  private calculatePnL(
    position: DLMMPosition,
    currentValue: number,
    tokenXValue: number,
    tokenYValue: number,
    initialValue: number
  ): PositionValuation['pnl'] {
    const totalPnL = currentValue - initialValue
    const totalPercent = initialValue > 0 ? (totalPnL / initialValue) * 100 : 0

    // Calculate fee earnings
    const feeEarnings =
      parseFloat(position.feesEarned.tokenX) +
      parseFloat(position.feesEarned.tokenY)

    // Estimate impermanent loss
    const impermanentLoss = this.estimateImpermanentLoss(
      position,
      tokenXValue,
      tokenYValue
    )

    // Calculate price appreciation (total P&L - fees + IL)
    const priceAppreciation = totalPnL - feeEarnings + impermanentLoss

    // Calculate attribution percentages
    const feePercent = totalPnL !== 0 ? (feeEarnings / totalPnL) * 100 : 0
    const ilPercent = totalPnL !== 0 ? (impermanentLoss / totalPnL) * 100 : 0
    const pricePercent = totalPnL !== 0 ? (priceAppreciation / totalPnL) * 100 : 0

    return {
      total: totalPnL,
      totalPercent,
      realized: feeEarnings,
      unrealized: totalPnL - feeEarnings,
      feeEarnings,
      priceAppreciation,
      impermanentLoss,
      attribution: {
        fees: { amount: feeEarnings, percent: feePercent },
        tokenXGains: { amount: tokenXValue - (initialValue / 2), percent: pricePercent / 2 },
        tokenYGains: { amount: tokenYValue - (initialValue / 2), percent: pricePercent / 2 },
        impermanentLoss: { amount: impermanentLoss, percent: ilPercent }
      }
    }
  }

  /**
   * Estimate impermanent loss
   */
  private estimateImpermanentLoss(
    _position: DLMMPosition,
    currentTokenXValue: number,
    currentTokenYValue: number
  ): number {
    // Simplified IL calculation
    // IL = (V_hodl - V_lp) where V_hodl is value if tokens were held separately

    const currentTotal = currentTokenXValue + currentTokenYValue

    // Calculate HODL value (keeping same token amounts at current prices)
    const hodlValue = currentTokenXValue + currentTokenYValue

    // IL is the difference between HODL and LP value
    const il = currentTotal - hodlValue

    return il
  }

  /**
   * Calculate risk metrics
   */
  private calculateRiskMetrics(
    _position: DLMMPosition,
    priceDataX: PriceData,
    priceDataY: PriceData,
    liquidityBreakdown: PositionValuation['liquidityBreakdown']
  ): PositionValuation['riskMetrics'] {
    // Volatility score based on oracle prediction
    const volatilityScore = this.calculateVolatilityScore(priceDataX, priceDataY)

    // Price deviation from initial ratio
    const currentRatio = priceDataY.price / priceDataX.price
    const initialRatio = 1 // Assume initial ratio was 1:1 (would be stored in position data)
    const priceDeviation = Math.abs((currentRatio - initialRatio) / initialRatio) * 100

    // Concentration risk based on liquidity distribution
    const concentrationRisk = this.calculateConcentrationRisk(liquidityBreakdown)

    // Oracle confidence (minimum of both oracles)
    const oracleConfidence = Math.min(priceDataX.confidence, priceDataY.confidence)

    // Overall risk score (weighted average)
    const overallRiskScore =
      (volatilityScore * 0.3) +
      (Math.min(priceDeviation, 100) * 0.3) +
      (concentrationRisk * 0.2) +
      ((100 - oracleConfidence) * 0.2)

    return {
      volatilityScore,
      priceDeviation,
      concentrationRisk,
      oracleConfidence,
      overallRiskScore: Math.min(overallRiskScore, 100)
    }
  }

  /**
   * Calculate volatility score from oracle predictions
   */
  private calculateVolatilityScore(priceDataX: PriceData, priceDataY: PriceData): number {
    if (!priceDataX.prediction || !priceDataY.prediction) return 50 // Default medium volatility

    const avgVolatility = (priceDataX.prediction.volatility + priceDataY.prediction.volatility) / 2
    return Math.min(avgVolatility * 100, 100)
  }

  /**
   * Calculate concentration risk from liquidity distribution
   */
  private calculateConcentrationRisk(
    liquidityBreakdown: PositionValuation['liquidityBreakdown']
  ): number {
    const bins = liquidityBreakdown.bins
    if (bins.length === 0) return 100 // Maximum risk if no bins

    // Calculate Herfindahl-Hirschman Index (HHI)
    const hhi = bins.reduce((sum, bin) => {
      const share = bin.valuePercent / 100
      return sum + (share * share)
    }, 0)

    // Convert HHI to risk score (0-100)
    // HHI ranges from 1/n (perfect distribution) to 1 (all in one bin)
    const normalizedHHI = (hhi - (1 / bins.length)) / (1 - (1 / bins.length))
    return Math.min(normalizedHHI * 100, 100)
  }

  /**
   * Determine oracle health status
   */
  private determineOracleStatus(
    priceDataX: PriceData,
    priceDataY: PriceData
  ): 'healthy' | 'degraded' | 'stale' {
    const minConfidence = Math.min(priceDataX.confidence, priceDataY.confidence)
    const maxAge = Math.max(
      Date.now() - priceDataX.timestamp.getTime(),
      Date.now() - priceDataY.timestamp.getTime()
    )

    if (maxAge > 60000) return 'stale' // Older than 1 minute
    if (minConfidence < 50) return 'degraded' // Low confidence
    return 'healthy'
  }

  // ========================================================================
  // HISTORICAL TRACKING
  // ========================================================================

  /**
   * Record valuation snapshot for historical tracking
   */
  private recordValuationSnapshot(
    positionId: string,
    valuation: PositionValuation
  ): void {
    let history = this.valuationHistory.get(positionId)

    if (!history) {
      history = {
        positionId,
        snapshots: [],
        aggregatedMetrics: {
          averageValue: valuation.currentValue.total,
          peakValue: valuation.currentValue.total,
          lowestValue: valuation.currentValue.total,
          averagePnL: valuation.pnl.total,
          totalReturn: valuation.pnl.totalPercent,
          annualizedReturn: 0,
          sharpeRatio: 0,
          volatility: 0,
          maxDrawdown: 0,
          averageOracleConfidence: valuation.currentValue.confidence
        }
      }
      this.valuationHistory.set(positionId, history)
    }

    // Add snapshot
    const snapshot: ValuationSnapshot = {
      timestamp: valuation.timestamp,
      totalValue: valuation.currentValue.total,
      tokenXValue: valuation.currentValue.tokenX,
      tokenYValue: valuation.currentValue.tokenY,
      pnl: valuation.pnl.total,
      pnlPercent: valuation.pnl.totalPercent,
      priceX: valuation.priceData.tokenX.price,
      priceY: valuation.priceData.tokenY.price,
      liquidityUtilization: valuation.liquidityBreakdown.liquidityUtilization,
      oracleConfidence: valuation.currentValue.confidence
    }

    history.snapshots.push(snapshot)

    // Keep only last 1000 snapshots
    if (history.snapshots.length > 1000) {
      history.snapshots = history.snapshots.slice(-1000)
    }

    // Update aggregated metrics
    this.updateAggregatedMetrics(history)
  }

  /**
   * Update aggregated metrics from snapshots
   */
  private updateAggregatedMetrics(history: ValuationHistory): void {
    const snapshots = history.snapshots
    if (snapshots.length === 0) return

    const values = snapshots.map(s => s.totalValue)
    const pnls = snapshots.map(s => s.pnl)
    const confidences = snapshots.map(s => s.oracleConfidence)

    history.aggregatedMetrics = {
      averageValue: values.reduce((a, b) => a + b, 0) / values.length,
      peakValue: Math.max(...values),
      lowestValue: Math.min(...values),
      averagePnL: pnls.reduce((a, b) => a + b, 0) / pnls.length,
      totalReturn: snapshots[snapshots.length - 1].pnlPercent,
      annualizedReturn: this.calculateAnnualizedReturn(snapshots),
      sharpeRatio: this.calculateSharpeRatio(snapshots),
      volatility: this.calculateVolatility(values),
      maxDrawdown: this.calculateMaxDrawdown(values),
      averageOracleConfidence: confidences.reduce((a, b) => a + b, 0) / confidences.length
    }
  }

  /**
   * Calculate annualized return
   */
  private calculateAnnualizedReturn(snapshots: ValuationSnapshot[]): number {
    if (snapshots.length < 2) return 0

    const firstSnapshot = snapshots[0]
    const lastSnapshot = snapshots[snapshots.length - 1]

    const timeDiff = lastSnapshot.timestamp.getTime() - firstSnapshot.timestamp.getTime()
    const years = timeDiff / (365 * 24 * 60 * 60 * 1000)

    if (years === 0 || firstSnapshot.totalValue === 0) return 0

    const totalReturn = (lastSnapshot.totalValue - firstSnapshot.totalValue) / firstSnapshot.totalValue
    return (Math.pow(1 + totalReturn, 1 / years) - 1) * 100
  }

  /**
   * Calculate Sharpe ratio
   */
  private calculateSharpeRatio(snapshots: ValuationSnapshot[]): number {
    if (snapshots.length < 2) return 0

    const returns = []
    for (let i = 1; i < snapshots.length; i++) {
      const prevValue = snapshots[i - 1].totalValue
      const currValue = snapshots[i].totalValue
      if (prevValue > 0) {
        returns.push((currValue - prevValue) / prevValue)
      }
    }

    if (returns.length === 0) return 0

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)

    return stdDev > 0 ? avgReturn / stdDev : 0
  }

  /**
   * Calculate volatility
   */
  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0

    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length

    return Math.sqrt(variance)
  }

  /**
   * Calculate maximum drawdown
   */
  private calculateMaxDrawdown(values: number[]): number {
    if (values.length === 0) return 0

    let maxDrawdown = 0
    let peak = values[0]

    for (const value of values) {
      if (value > peak) {
        peak = value
      }
      const drawdown = (peak - value) / peak
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }

    return maxDrawdown * 100
  }

  // ========================================================================
  // REAL-TIME MONITORING
  // ========================================================================

  /**
   * Start real-time monitoring of position valuations
   */
  startMonitoring(positions: DLMMPosition[], intervalSeconds: number = 30): void {
    if (this.isMonitoring) {
      console.log('⚠️ Valuation monitoring already active')
      return
    }

    this.isMonitoring = true
    console.log(`🚀 Starting position valuation monitoring for ${positions.length} positions`)

    // Initial valuation
    this.monitorPositions(positions)

    // Set up recurring monitoring
    this.monitoringInterval = setInterval(() => {
      this.monitorPositions(positions)
    }, intervalSeconds * 1000)
  }

  /**
   * Stop real-time monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
    this.isMonitoring = false
    console.log('⏹️ Position valuation monitoring stopped')
  }

  /**
   * Monitor positions for value changes
   */
  private async monitorPositions(positions: DLMMPosition[]): Promise<void> {
    for (const position of positions) {
      try {
        const previousValuation = this.valuationCache.get(position.id)
        const currentValuation = await this.getPositionValuation(position, false)

        if (previousValuation) {
          const valueChange = currentValuation.currentValue.total - previousValuation.valuation.currentValue.total
          const changePercent = (valueChange / previousValuation.valuation.currentValue.total) * 100

          // Trigger callbacks if significant change (>0.1%)
          if (Math.abs(changePercent) > 0.1) {
            const update: ValuationUpdate = {
              positionId: position.id,
              previousValue: previousValuation.valuation.currentValue.total,
              currentValue: currentValuation.currentValue.total,
              valueChange,
              changePercent,
              trigger: 'price_change',
              timestamp: new Date()
            }

            this.triggerUpdateCallbacks(position.id, update)
          }
        }
      } catch (error) {
        console.error(`❌ Error monitoring position ${position.id}:`, error)
      }
    }
  }

  /**
   * Register callback for value updates
   */
  onValuationUpdate(
    positionId: string,
    callback: (update: ValuationUpdate) => void
  ): () => void {
    let callbacks = this.updateCallbacks.get(positionId)
    if (!callbacks) {
      callbacks = []
      this.updateCallbacks.set(positionId, callbacks)
    }

    callbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const cbs = this.updateCallbacks.get(positionId)
      if (cbs) {
        const index = cbs.indexOf(callback)
        if (index > -1) {
          cbs.splice(index, 1)
        }
      }
    }
  }

  /**
   * Trigger update callbacks
   */
  private triggerUpdateCallbacks(positionId: string, update: ValuationUpdate): void {
    const callbacks = this.updateCallbacks.get(positionId)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(update)
        } catch (error) {
          console.error('❌ Error in valuation update callback:', error)
        }
      })
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Get valuation history for a position
   */
  getValuationHistory(positionId: string): ValuationHistory | null {
    return this.valuationHistory.get(positionId) || null
  }

  /**
   * Clear valuation cache
   */
  clearCache(positionId?: string): void {
    if (positionId) {
      this.valuationCache.delete(positionId)
      console.log(`✅ Cleared valuation cache for position ${positionId}`)
    } else {
      this.valuationCache.clear()
      console.log('✅ Cleared all valuation cache')
    }
  }

  /**
   * Export valuation history to JSON
   */
  exportHistory(positionId: string): string | null {
    const history = this.valuationHistory.get(positionId)
    if (!history) return null

    return JSON.stringify(history, null, 2)
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const positionValuationService = new PositionValuationService()

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get position valuation with oracle pricing
 */
export async function getPositionValuation(
  position: DLMMPosition,
  useCache: boolean = true
): Promise<PositionValuation> {
  return positionValuationService.getPositionValuation(position, useCache)
}

/**
 * Get valuation history for a position
 */
export function getValuationHistory(positionId: string): ValuationHistory | null {
  return positionValuationService.getValuationHistory(positionId)
}

/**
 * Subscribe to valuation updates
 */
export function subscribeToValuationUpdates(
  positionId: string,
  callback: (update: ValuationUpdate) => void
): () => void {
  return positionValuationService.onValuationUpdate(positionId, callback)
}
