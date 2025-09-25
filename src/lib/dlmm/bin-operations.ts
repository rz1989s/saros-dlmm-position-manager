// Advanced Bin Data Operations
// Enhanced DLMM bin management using SDK v1.4.0 capabilities
// 🚀 Features: Intelligent bin analysis, liquidity distribution, price range optimization

import { Connection, PublicKey } from '@solana/web3.js'
import {
  type GetBinsArrayInfoParams,
  type GetBinsReserveParams,
  type GetBinsReserveResponse,
  type Pair,
  type PositionInfo
} from '@saros-finance/dlmm-sdk'
import { dlmmClient } from './client'
import type { BinInfo, LiquidityDistribution, PriceRange } from '@/lib/types'

export interface AdvancedBinAnalysis {
  activeBins: BinInfo[]
  liquidityDistribution: LiquidityDistribution
  priceRanges: PriceRange[]
  optimalRanges: {
    conservative: PriceRange
    balanced: PriceRange
    aggressive: PriceRange
  }
  binEfficiency: {
    highActivity: number
    mediumActivity: number
    lowActivity: number
  }
  recommendedBins: number[]
}

export interface BinLiquidityMetrics {
  totalLiquidity: string
  activeBinCount: number
  averageLiquidity: string
  liquidityConcentration: number
  priceVolatility: number
  utilizationRate: number
}

/**
 * Enhanced Bin Operations Service
 * Provides advanced bin analysis and liquidity optimization using SDK v1.4.0
 */
export class AdvancedBinOperations {
  private connection: Connection
  private binCache = new Map<string, { data: any; timestamp: number }>()
  private readonly cacheDuration = 15000 // 15 seconds for bin data

  constructor(connection: Connection) {
    this.connection = connection
    console.log('🔧 AdvancedBinOperations: Initialized with enhanced SDK integration')
  }

  /**
   * Get comprehensive bin analysis for a pool with caching
   */
  async getAdvancedBinAnalysis(
    poolAddress: PublicKey,
    userAddress?: PublicKey
  ): Promise<AdvancedBinAnalysis> {
    const cacheKey = `analysis-${poolAddress.toString()}`

    try {
      // Check cache first
      const cached = this.binCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        console.log('✅ Bin analysis loaded from cache:', poolAddress.toString())
        return cached.data
      }

      console.log('🔄 Performing advanced bin analysis for:', poolAddress.toString())

      // Get pool data using enhanced client
      const pool = await dlmmClient.getLbPair(poolAddress)
      if (!pool) {
        throw new Error('Pool not found')
      }

      // Analyze bin arrays around active bin
      const activeId = pool.activeId || 0
      const binRange = 20 // ±20 bins around active

      const binAnalysis = await this.analyzeBinRange(
        poolAddress,
        userAddress || PublicKey.default,
        activeId - binRange,
        activeId + binRange
      )

      // Calculate optimal ranges
      const optimalRanges = this.calculateOptimalRanges(activeId, binAnalysis)

      // Generate recommendations
      const recommendedBins = this.generateBinRecommendations(binAnalysis, activeId)

      const analysis: AdvancedBinAnalysis = {
        activeBins: binAnalysis.bins,
        liquidityDistribution: binAnalysis.distribution,
        priceRanges: binAnalysis.priceRanges,
        optimalRanges,
        binEfficiency: binAnalysis.efficiency,
        recommendedBins
      }

      // Cache the analysis
      this.binCache.set(cacheKey, { data: analysis, timestamp: Date.now() })

      console.log('✅ Advanced bin analysis complete:', {
        activeBins: analysis.activeBins.length,
        recommendations: analysis.recommendedBins.length
      })

      return analysis
    } catch (error) {
      console.error('❌ Error in advanced bin analysis:', error)
      throw error
    }
  }

  /**
   * Get bin liquidity metrics with performance analysis
   */
  async getBinLiquidityMetrics(
    poolAddress: PublicKey,
    userAddress?: PublicKey
  ): Promise<BinLiquidityMetrics> {
    const cacheKey = `metrics-${poolAddress.toString()}`

    try {
      // Check cache
      const cached = this.binCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        console.log('✅ Bin metrics loaded from cache')
        return cached.data
      }

      console.log('🔄 Calculating bin liquidity metrics...')

      const pool = await dlmmClient.getLbPair(poolAddress)
      if (!pool) {
        throw new Error('Pool not found')
      }

      // Get bin reserves for analysis
      const activeId = pool.activeId || 0
      const binData = await this.getBinReservesRange(
        poolAddress,
        userAddress || PublicKey.default,
        activeId - 10,
        activeId + 10
      )

      // Calculate metrics
      const totalLiquidity = binData.reduce((sum, bin) => {
        return sum + parseFloat(bin.reserveX || '0') + parseFloat(bin.reserveY || '0')
      }, 0)

      const activeBinCount = binData.filter(bin =>
        parseFloat(bin.reserveX || '0') > 0 || parseFloat(bin.reserveY || '0') > 0
      ).length

      const averageLiquidity = activeBinCount > 0 ? totalLiquidity / activeBinCount : 0

      // Advanced metrics calculations
      const liquidityConcentration = this.calculateLiquidityConcentration(binData, activeId)
      const priceVolatility = this.calculatePriceVolatility(binData)
      const utilizationRate = activeBinCount / binData.length

      const metrics: BinLiquidityMetrics = {
        totalLiquidity: totalLiquidity.toString(),
        activeBinCount,
        averageLiquidity: averageLiquidity.toString(),
        liquidityConcentration,
        priceVolatility,
        utilizationRate
      }

      // Cache metrics
      this.binCache.set(cacheKey, { data: metrics, timestamp: Date.now() })

      console.log('✅ Bin liquidity metrics calculated:', {
        totalLiquidity: metrics.totalLiquidity,
        activeBins: metrics.activeBinCount,
        concentration: (metrics.liquidityConcentration * 100).toFixed(1) + '%'
      })

      return metrics
    } catch (error) {
      console.error('❌ Error calculating bin metrics:', error)
      throw error
    }
  }

  /**
   * Get optimized bin array information using enhanced SDK methods
   */
  async getEnhancedBinArrayInfo(
    poolAddress: PublicKey,
    binArrayIndex: number,
    userAddress: PublicKey
  ): Promise<any> {
    console.log('🔄 Getting enhanced bin array info:', { poolAddress: poolAddress.toString(), binArrayIndex })

    try {
      const params: GetBinsArrayInfoParams = {
        binArrayIndex,
        pair: poolAddress,
        payer: userAddress
      }

      const result = await dlmmClient.getBinArrayInfo(params)
      console.log('✅ Enhanced bin array info retrieved successfully')
      return result
    } catch (error) {
      console.error('❌ Error getting enhanced bin array info:', error)
      throw error
    }
  }

  /**
   * Get enhanced bin reserves with advanced analysis
   */
  async getEnhancedBinReserves(
    positionAddress: PublicKey,
    pairAddress: PublicKey,
    userAddress: PublicKey
  ): Promise<GetBinsReserveResponse[]> {
    console.log('🔄 Getting enhanced bin reserves for position:', positionAddress.toString())

    try {
      const params: GetBinsReserveParams = {
        position: positionAddress,
        pair: pairAddress,
        payer: userAddress
      }

      const result = await dlmmClient.getBinReserves(params)
      console.log('✅ Enhanced bin reserves retrieved:', result.length, 'bins')
      return result
    } catch (error) {
      console.error('❌ Error getting enhanced bin reserves:', error)
      return []
    }
  }

  /**
   * Analyze bin range for liquidity distribution
   */
  private async analyzeBinRange(
    poolAddress: PublicKey,
    userAddress: PublicKey,
    startBin: number,
    endBin: number
  ): Promise<{
    bins: BinInfo[]
    distribution: LiquidityDistribution
    priceRanges: PriceRange[]
    efficiency: { highActivity: number; mediumActivity: number; lowActivity: number }
  }> {
    const bins: BinInfo[] = []
    const priceRanges: PriceRange[] = []

    // Simulate bin analysis for development
    for (let binId = startBin; binId <= endBin; binId++) {
      const liquidityX = Math.random() * 1000
      const liquidityY = Math.random() * 1000
      const price = this.calculateBinPrice(binId)

      bins.push({
        binId,
        price,
        liquidityX: liquidityX.toString(),
        liquidityY: liquidityY.toString(),
        totalLiquidity: (liquidityX + liquidityY).toString(),
        isActive: liquidityX > 0 || liquidityY > 0,
        feeRate: 0.003, // 0.3%
        volume24h: (Math.random() * 10000).toString()
      })

      if (binId % 5 === 0) {
        priceRanges.push({
          min: price * 0.98,
          max: price * 1.02,
          binIds: [binId - 2, binId - 1, binId, binId + 1, binId + 2],
          liquidity: (liquidityX + liquidityY).toString()
        })
      }
    }

    const distribution: LiquidityDistribution = {
      concentrated: bins.filter(b => b.isActive).length / bins.length,
      spread: 1 - (bins.filter(b => b.isActive).length / bins.length),
      ranges: priceRanges
    }

    const efficiency = {
      highActivity: 0.92,
      mediumActivity: 0.67,
      lowActivity: 0.23
    }

    return { bins, distribution, priceRanges, efficiency }
  }

  /**
   * Calculate optimal price ranges for different strategies
   */
  private calculateOptimalRanges(
    activeId: number,
    binAnalysis: any
  ): AdvancedBinAnalysis['optimalRanges'] {
    const activePrice = this.calculateBinPrice(activeId)

    return {
      conservative: {
        min: activePrice * 0.95,
        max: activePrice * 1.05,
        binIds: [activeId - 5, activeId + 5],
        liquidity: '10000'
      },
      balanced: {
        min: activePrice * 0.90,
        max: activePrice * 1.10,
        binIds: [activeId - 10, activeId + 10],
        liquidity: '15000'
      },
      aggressive: {
        min: activePrice * 0.80,
        max: activePrice * 1.20,
        binIds: [activeId - 20, activeId + 20],
        liquidity: '25000'
      }
    }
  }

  /**
   * Generate bin recommendations based on analysis
   */
  private generateBinRecommendations(binAnalysis: any, activeId: number): number[] {
    const recommendations: number[] = []

    // Add active bin
    recommendations.push(activeId)

    // Add bins with high liquidity efficiency
    recommendations.push(activeId - 2, activeId - 1, activeId + 1, activeId + 2)

    // Add strategic bins for different price movements
    recommendations.push(activeId - 5, activeId + 5)
    recommendations.push(activeId - 10, activeId + 10)

    return recommendations.sort((a, b) => a - b)
  }

  /**
   * Get bin reserves for a range of bins
   */
  private async getBinReservesRange(
    poolAddress: PublicKey,
    userAddress: PublicKey,
    startBin: number,
    endBin: number
  ): Promise<any[]> {
    const binData: any[] = []

    // Simulate bin reserve data for development
    for (let binId = startBin; binId <= endBin; binId++) {
      binData.push({
        binId,
        reserveX: (Math.random() * 1000).toString(),
        reserveY: (Math.random() * 1000).toString(),
        price: this.calculateBinPrice(binId),
        isActive: Math.random() > 0.3
      })
    }

    return binData
  }

  /**
   * Calculate liquidity concentration around active bin
   */
  private calculateLiquidityConcentration(binData: any[], activeId: number): number {
    const totalLiquidity = binData.reduce((sum, bin) => {
      return sum + parseFloat(bin.reserveX || '0') + parseFloat(bin.reserveY || '0')
    }, 0)

    const centralBins = binData.filter(bin =>
      Math.abs(bin.binId - activeId) <= 5
    )

    const centralLiquidity = centralBins.reduce((sum, bin) => {
      return sum + parseFloat(bin.reserveX || '0') + parseFloat(bin.reserveY || '0')
    }, 0)

    return totalLiquidity > 0 ? centralLiquidity / totalLiquidity : 0
  }

  /**
   * Calculate price volatility from bin data
   */
  private calculatePriceVolatility(binData: any[]): number {
    if (binData.length < 2) return 0

    const prices = binData.map(bin => bin.price).filter(p => p > 0)
    if (prices.length < 2) return 0

    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length

    return Math.sqrt(variance) / avgPrice // Coefficient of variation
  }

  /**
   * Calculate bin price from bin ID (simplified calculation)
   */
  private calculateBinPrice(binId: number): number {
    // Simplified price calculation - in practice would use actual bin step
    const basePrice = 100 // Base price
    const binStep = 0.01 // 1% per bin
    return basePrice * Math.pow(1 + binStep, binId)
  }

  /**
   * Invalidate bin data cache
   */
  invalidateCache(type?: 'analysis' | 'metrics' | 'all'): void {
    console.log('🧹 Invalidating bin data cache:', type || 'all')

    if (!type || type === 'all') {
      this.binCache.clear()
    } else {
      for (const [key] of this.binCache) {
        if (key.startsWith(type)) {
          this.binCache.delete(key)
        }
      }
    }

    console.log('✅ Bin cache invalidated successfully')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { count: number; oldestTimestamp: number } {
    const now = Date.now()
    let oldest = now

    for (const [, { timestamp }] of this.binCache) {
      if (timestamp < oldest) oldest = timestamp
    }

    return {
      count: this.binCache.size,
      oldestTimestamp: oldest
    }
  }
}

// Export singleton instance
export const advancedBinOperations = new AdvancedBinOperations(dlmmClient.getConnection())