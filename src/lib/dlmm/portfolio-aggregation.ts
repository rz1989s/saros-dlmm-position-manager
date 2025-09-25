// Multi-Position Portfolio Aggregation System
// 📊 Advanced portfolio management with position consolidation and analytics
// Comprehensive multi-position analysis and optimization tools

import { Connection, PublicKey } from '@solana/web3.js'
import { dlmmClient } from './client'
import { oraclePriceFeeds } from '@/lib/oracle/price-feeds'
import type { DLMMPosition, PositionAnalytics, TokenInfo } from '@/lib/types'

export interface PortfolioPosition {
  id: string
  positions: DLMMPosition[]
  tokenPair: string
  tokenX: TokenInfo
  tokenY: TokenInfo
  aggregatedMetrics: {
    totalLiquidity: string
    totalValue: number
    weightedApr: number
    totalFeesEarned: number
    averageActiveBin: number
    positionCount: number
  }
  diversificationScore: number
  riskMetrics: {
    concentrationRisk: number
    correlationRisk: number
    liquidityRisk: number
    overallRiskScore: number
  }
  optimization: {
    canConsolidate: boolean
    consolidationBenefit: number
    recommendedActions: string[]
  }
}

export interface PortfolioSummary {
  totalPositions: number
  totalValue: number
  totalLiquidity: string
  diversifiedPairs: number
  topPerformingPairs: string[]
  underPerformingPairs: string[]
  riskDistribution: {
    low: number
    medium: number
    high: number
  }
  assetAllocation: Array<{
    symbol: string
    percentage: number
    value: number
    positions: number
  }>
  performanceMetrics: {
    totalPnl: number
    totalPnlPercentage: number
    bestPosition: DLMMPosition | null
    worstPosition: DLMMPosition | null
    avgApr: number
    totalFeesEarned: number
  }
}

export interface ConsolidationOpportunity {
  id: string
  targetPair: string
  positions: DLMMPosition[]
  currentPools: PublicKey[]
  recommendedPool: PublicKey
  benefits: {
    reducedGasCosts: number
    improvedLiquidity: number
    betterApr: number
    simplifiedManagement: boolean
  }
  consolidationCost: number
  projectedSavings: number
  priority: 'high' | 'medium' | 'low'
}

export interface DiversificationAnalysis {
  overallScore: number // 0-100
  tokenDiversification: {
    uniqueTokens: number
    dominantToken: string
    dominantPercentage: number
    recommendations: string[]
  }
  pairDiversification: {
    uniquePairs: number
    topPairs: Array<{ pair: string; percentage: number }>
    concentrationWarnings: string[]
  }
  poolDiversification: {
    uniquePools: number
    averagePoolSize: string
    liquidityDistribution: 'concentrated' | 'distributed' | 'balanced'
  }
}

export interface RebalancingStrategy {
  id: string
  name: string
  description: string
  targetAllocation: Record<string, number> // token symbol -> percentage
  currentAllocation: Record<string, number>
  requiredActions: Array<{
    type: 'increase' | 'decrease' | 'add' | 'remove'
    tokenPair: string
    currentAmount: string
    targetAmount: string
    priority: number
  }>
  estimatedCost: number
  projectedImprovement: {
    diversificationImprovement: number
    riskReduction: number
    expectedAprIncrease: number
  }
}

/**
 * Portfolio Aggregation Manager
 * Manages multi-position analysis, consolidation, and optimization
 */
export class PortfolioAggregationManager {
  private connection: Connection
  private portfolioCache = new Map<string, { data: any; timestamp: number }>()
  private readonly cacheDuration = 120000 // 2 minutes for portfolio data

  constructor(connection: Connection) {
    this.connection = connection
    console.log('📊 PortfolioAggregationManager: Initialized with comprehensive multi-position analysis')
  }

  /**
   * Aggregate positions by token pairs
   */
  async aggregatePositionsByPair(
    positions: DLMMPosition[],
    userAddress: PublicKey
  ): Promise<PortfolioPosition[]> {
    const cacheKey = `aggregated-${userAddress.toString()}-${positions.length}`

    try {
      // Check cache
      const cached = this.portfolioCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        console.log('✅ Aggregated positions loaded from cache')
        return cached.data
      }

      console.log('🔄 Aggregating', positions.length, 'positions by token pairs...')

      // Group positions by token pair
      const pairGroups = new Map<string, DLMMPosition[]>()

      for (const position of positions) {
        const pairKey = `${position.tokenX.symbol}/${position.tokenY.symbol}`
        if (!pairGroups.has(pairKey)) {
          pairGroups.set(pairKey, [])
        }
        pairGroups.get(pairKey)!.push(position)
      }

      const portfolioPositions: PortfolioPosition[] = []

      for (const [pairKey, pairPositions] of pairGroups) {
        const portfolioPosition = await this.createPortfolioPosition(pairKey, pairPositions)
        portfolioPositions.push(portfolioPosition)
      }

      // Sort by total value
      portfolioPositions.sort((a, b) => b.aggregatedMetrics.totalValue - a.aggregatedMetrics.totalValue)

      // Cache the results
      this.portfolioCache.set(cacheKey, { data: portfolioPositions, timestamp: Date.now() })

      console.log('✅ Position aggregation complete:', {
        uniquePairs: portfolioPositions.length,
        totalPositions: positions.length,
        avgPositionsPerPair: (positions.length / portfolioPositions.length).toFixed(1)
      })

      return portfolioPositions
    } catch (error) {
      console.error('❌ Error aggregating positions:', error)
      throw error
    }
  }

  /**
   * Generate comprehensive portfolio summary
   */
  async generatePortfolioSummary(
    positions: DLMMPosition[],
    analytics: PositionAnalytics[],
    userAddress: PublicKey
  ): Promise<PortfolioSummary> {
    console.log('📊 Generating portfolio summary for', positions.length, 'positions...')

    // Get current token prices for accurate valuation
    const uniqueTokens = Array.from(new Set([
      ...positions.map(p => p.tokenX.symbol),
      ...positions.map(p => p.tokenY.symbol)
    ]))

    const tokenPrices = await oraclePriceFeeds.getMultipleTokenPrices(uniqueTokens)

    // Calculate total portfolio value
    let totalValue = 0
    let totalLiquidity = 0
    let totalFeesEarned = 0
    let totalPnl = 0

    const pairCounts = new Map<string, number>()
    const tokenValues = new Map<string, number>()

    for (let i = 0; i < positions.length; i++) {
      const position = positions[i]
      const analytic = analytics[i]

      // Calculate position value using oracle prices
      const tokenXPrice = tokenPrices[position.tokenX.symbol]?.price || position.tokenX.price
      const tokenYPrice = tokenPrices[position.tokenY.symbol]?.price || position.tokenY.price

      const positionValue = analytic?.totalValue ||
        (parseFloat(position.liquidityAmount) * (tokenXPrice + tokenYPrice) / 2)

      totalValue += positionValue
      totalLiquidity += parseFloat(position.liquidityAmount)
      totalFeesEarned += analytic?.feesEarned || 0
      totalPnl += analytic?.pnl.amount || 0

      // Track pair distribution
      const pairKey = `${position.tokenX.symbol}/${position.tokenY.symbol}`
      pairCounts.set(pairKey, (pairCounts.get(pairKey) || 0) + 1)

      // Track token allocation
      const xValue = positionValue * 0.5 // Simplified 50/50 allocation
      const yValue = positionValue * 0.5

      tokenValues.set(position.tokenX.symbol, (tokenValues.get(position.tokenX.symbol) || 0) + xValue)
      tokenValues.set(position.tokenY.symbol, (tokenValues.get(position.tokenY.symbol) || 0) + yValue)
    }

    // Find best and worst performing positions
    let bestPosition: DLMMPosition | null = null
    let worstPosition: DLMMPosition | null = null
    let bestPnl = -Infinity
    let worstPnl = Infinity

    for (let i = 0; i < positions.length; i++) {
      const pnl = analytics[i]?.pnl.amount || 0
      if (pnl > bestPnl) {
        bestPnl = pnl
        bestPosition = positions[i]
      }
      if (pnl < worstPnl) {
        worstPnl = pnl
        worstPosition = positions[i]
      }
    }

    // Calculate asset allocation
    const assetAllocation = Array.from(tokenValues.entries()).map(([symbol, value]) => ({
      symbol,
      percentage: (value / totalValue) * 100,
      value,
      positions: positions.filter(p => p.tokenX.symbol === symbol || p.tokenY.symbol === symbol).length
    })).sort((a, b) => b.value - a.value)

    // Calculate risk distribution (simplified)
    const riskDistribution = {
      low: Math.floor(positions.length * 0.3),
      medium: Math.floor(positions.length * 0.5),
      high: Math.floor(positions.length * 0.2)
    }

    // Get top and underperforming pairs
    const pairPerformance = Array.from(pairCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const summary: PortfolioSummary = {
      totalPositions: positions.length,
      totalValue,
      totalLiquidity: totalLiquidity.toString(),
      diversifiedPairs: pairCounts.size,
      topPerformingPairs: pairPerformance.slice(0, 3).map(([pair]) => pair),
      underPerformingPairs: pairPerformance.slice(-2).map(([pair]) => pair),
      riskDistribution,
      assetAllocation,
      performanceMetrics: {
        totalPnl,
        totalPnlPercentage: totalValue > 0 ? (totalPnl / totalValue) * 100 : 0,
        bestPosition,
        worstPosition,
        avgApr: analytics.reduce((sum, a) => sum + (a?.apr || 0), 0) / analytics.length,
        totalFeesEarned
      }
    }

    console.log('✅ Portfolio summary generated:', {
      totalValue: totalValue.toFixed(2),
      pairs: pairCounts.size,
      avgApr: summary.performanceMetrics.avgApr.toFixed(2) + '%'
    })

    return summary
  }

  /**
   * Identify consolidation opportunities
   */
  async identifyConsolidationOpportunities(
    positions: DLMMPosition[],
    userAddress: PublicKey
  ): Promise<ConsolidationOpportunity[]> {
    console.log('🔄 Identifying consolidation opportunities...')

    const opportunities: ConsolidationOpportunity[] = []

    // Group positions by token pairs
    const pairGroups = new Map<string, DLMMPosition[]>()
    for (const position of positions) {
      const pairKey = `${position.tokenX.symbol}/${position.tokenY.symbol}`
      if (!pairGroups.has(pairKey)) {
        pairGroups.set(pairKey, [])
      }
      pairGroups.get(pairKey)!.push(position)
    }

    // Find pairs with multiple positions that can be consolidated
    for (const [pairKey, pairPositions] of pairGroups) {
      if (pairPositions.length > 1) {
        const opportunity = await this.evaluateConsolidationOpportunity(pairKey, pairPositions)
        opportunities.push(opportunity)
      }
    }

    // Sort by priority and projected savings
    opportunities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.projectedSavings - a.projectedSavings
    })

    console.log('✅ Consolidation opportunities identified:', opportunities.length)

    return opportunities
  }

  /**
   * Analyze portfolio diversification
   */
  analyzeDiversification(
    positions: DLMMPosition[]
  ): DiversificationAnalysis {
    console.log('📊 Analyzing portfolio diversification...')

    // Token analysis
    const tokenCounts = new Map<string, number>()
    const tokenValues = new Map<string, number>()

    for (const position of positions) {
      const value = parseFloat(position.liquidityAmount) // Simplified

      tokenCounts.set(position.tokenX.symbol, (tokenCounts.get(position.tokenX.symbol) || 0) + 1)
      tokenCounts.set(position.tokenY.symbol, (tokenCounts.get(position.tokenY.symbol) || 0) + 1)

      tokenValues.set(position.tokenX.symbol, (tokenValues.get(position.tokenX.symbol) || 0) + value * 0.5)
      tokenValues.set(position.tokenY.symbol, (tokenValues.get(position.tokenY.symbol) || 0) + value * 0.5)
    }

    const totalValue = Array.from(tokenValues.values()).reduce((sum, val) => sum + val, 0)
    const tokenPercentages = Array.from(tokenValues.entries())
      .map(([symbol, value]) => ({ symbol, percentage: (value / totalValue) * 100 }))
      .sort((a, b) => b.percentage - a.percentage)

    const dominantToken = tokenPercentages[0]

    // Pair analysis
    const pairCounts = new Map<string, number>()
    for (const position of positions) {
      const pairKey = `${position.tokenX.symbol}/${position.tokenY.symbol}`
      pairCounts.set(pairKey, (pairCounts.get(pairKey) || 0) + 1)
    }

    const pairTotal = positions.length
    const topPairs = Array.from(pairCounts.entries())
      .map(([pair, count]) => ({ pair, percentage: (count / pairTotal) * 100 }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)

    // Pool analysis
    const uniquePools = new Set(positions.map(p => p.poolAddress.toString())).size
    const avgPoolSize = positions.reduce((sum, p) => sum + parseFloat(p.liquidityAmount), 0) / positions.length

    // Calculate overall diversification score
    let overallScore = 50 // Base score

    // Token diversification component (40% weight)
    let tokenDiv = Math.min((tokenCounts.size / 10) * 40, 40)
    if (dominantToken.percentage < 30) tokenDiv += 10
    else if (dominantToken.percentage > 50) tokenDiv -= 15

    // Pair diversification component (35% weight)
    const pairDiv = Math.min((pairCounts.size / 8) * 35, 35)

    // Pool diversification component (25% weight)
    const poolDiv = Math.min((uniquePools / 6) * 25, 25)

    overallScore = Math.min(tokenDiv + pairDiv + poolDiv, 100)

    const analysis: DiversificationAnalysis = {
      overallScore,
      tokenDiversification: {
        uniqueTokens: tokenCounts.size,
        dominantToken: dominantToken.symbol,
        dominantPercentage: dominantToken.percentage,
        recommendations: this.generateTokenDiversificationRecommendations(tokenPercentages)
      },
      pairDiversification: {
        uniquePairs: pairCounts.size,
        topPairs,
        concentrationWarnings: topPairs.filter(p => p.percentage > 25)
          .map(p => `High concentration in ${p.pair} (${p.percentage.toFixed(1)}%)`)
      },
      poolDiversification: {
        uniquePools,
        averagePoolSize: avgPoolSize.toString(),
        liquidityDistribution: uniquePools > positions.length * 0.8 ? 'distributed' :
          uniquePools < positions.length * 0.3 ? 'concentrated' : 'balanced'
      }
    }

    console.log('✅ Diversification analysis complete:', {
      score: overallScore.toFixed(1),
      tokens: tokenCounts.size,
      pairs: pairCounts.size,
      pools: uniquePools
    })

    return analysis
  }

  /**
   * Create portfolio position from grouped positions
   */
  private async createPortfolioPosition(
    pairKey: string,
    positions: DLMMPosition[]
  ): Promise<PortfolioPosition> {
    // Calculate aggregated metrics
    let totalLiquidity = 0
    let totalValue = 0
    let totalFeesEarned = 0
    let weightedApr = 0
    let totalActiveBins = 0

    for (const position of positions) {
      const liquidity = parseFloat(position.liquidityAmount)
      const fees = parseFloat(position.feesEarned.tokenX) + parseFloat(position.feesEarned.tokenY)

      totalLiquidity += liquidity
      totalFeesEarned += fees
      totalActiveBins += position.activeBin

      // Simplified value calculation
      totalValue += liquidity * ((position.tokenX.price + position.tokenY.price) / 2)

      // Weighted APR (simplified)
      weightedApr += 12.5 * liquidity // Mock APR
    }

    weightedApr = totalLiquidity > 0 ? weightedApr / totalLiquidity : 0
    const averageActiveBin = totalActiveBins / positions.length

    // Calculate diversification score
    const uniquePools = new Set(positions.map(p => p.poolAddress.toString())).size
    const diversificationScore = Math.min((uniquePools / positions.length) * 100, 100)

    // Calculate risk metrics
    const concentrationRisk = positions.length > 3 ? 30 : 70 // Lower is better
    const correlationRisk = 40 // Mock correlation risk
    const liquidityRisk = totalLiquidity > 10000 ? 20 : 60
    const overallRiskScore = (concentrationRisk + correlationRisk + liquidityRisk) / 3

    // Consolidation analysis
    const canConsolidate = positions.length > 1 && uniquePools > 1
    const consolidationBenefit = canConsolidate ? positions.length * 50 : 0 // Mock benefit

    return {
      id: `portfolio-${pairKey.replace('/', '-')}`,
      positions,
      tokenPair: pairKey,
      tokenX: positions[0].tokenX,
      tokenY: positions[0].tokenY,
      aggregatedMetrics: {
        totalLiquidity: totalLiquidity.toString(),
        totalValue,
        weightedApr,
        totalFeesEarned,
        averageActiveBin,
        positionCount: positions.length
      },
      diversificationScore,
      riskMetrics: {
        concentrationRisk,
        correlationRisk,
        liquidityRisk,
        overallRiskScore
      },
      optimization: {
        canConsolidate,
        consolidationBenefit,
        recommendedActions: this.generateOptimizationRecommendations(positions, {
          canConsolidate,
          diversificationScore,
          overallRiskScore
        })
      }
    }
  }

  /**
   * Evaluate consolidation opportunity
   */
  private async evaluateConsolidationOpportunity(
    pairKey: string,
    positions: DLMMPosition[]
  ): Promise<ConsolidationOpportunity> {
    const currentPools = positions.map(p => p.poolAddress)
    const totalLiquidity = positions.reduce((sum, p) => sum + parseFloat(p.liquidityAmount), 0)

    // Find the pool with highest liquidity (mock selection)
    const recommendedPool = currentPools.reduce((best, current, index) => {
      const currentLiquidity = parseFloat(positions[index].liquidityAmount)
      const bestLiquidity = parseFloat(positions[currentPools.indexOf(best)].liquidityAmount)
      return currentLiquidity > bestLiquidity ? current : best
    })

    // Calculate benefits
    const reducedGasCosts = (positions.length - 1) * 50 // $50 per position saved
    const improvedLiquidity = totalLiquidity * 0.05 // 5% improvement
    const betterApr = 2.5 // 2.5% better APR

    const consolidationCost = positions.length * 25 // $25 per position to migrate
    const projectedSavings = reducedGasCosts + (improvedLiquidity * 0.1) + (totalLiquidity * betterApr / 100)

    let priority: 'high' | 'medium' | 'low' = 'low'
    if (projectedSavings > consolidationCost * 3) priority = 'high'
    else if (projectedSavings > consolidationCost * 1.5) priority = 'medium'

    return {
      id: `consolidation-${pairKey.replace('/', '-')}`,
      targetPair: pairKey,
      positions,
      currentPools,
      recommendedPool,
      benefits: {
        reducedGasCosts,
        improvedLiquidity,
        betterApr,
        simplifiedManagement: true
      },
      consolidationCost,
      projectedSavings,
      priority
    }
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(
    positions: DLMMPosition[],
    metrics: { canConsolidate: boolean; diversificationScore: number; overallRiskScore: number }
  ): string[] {
    const recommendations: string[] = []

    if (metrics.canConsolidate) {
      recommendations.push(`Consider consolidating ${positions.length} positions for reduced gas costs`)
    }

    if (metrics.diversificationScore < 50) {
      recommendations.push('Diversify across more pools for better risk management')
    }

    if (metrics.overallRiskScore > 60) {
      recommendations.push('High risk detected - consider rebalancing positions')
    }

    const totalLiquidity = positions.reduce((sum, p) => sum + parseFloat(p.liquidityAmount), 0)
    if (totalLiquidity < 1000) {
      recommendations.push('Consider increasing position sizes for better fee efficiency')
    }

    return recommendations
  }

  /**
   * Generate token diversification recommendations
   */
  private generateTokenDiversificationRecommendations(
    tokenPercentages: Array<{ symbol: string; percentage: number }>
  ): string[] {
    const recommendations: string[] = []

    if (tokenPercentages[0].percentage > 50) {
      recommendations.push(`Reduce exposure to ${tokenPercentages[0].symbol} (${tokenPercentages[0].percentage.toFixed(1)}%)`)
    }

    if (tokenPercentages.length < 4) {
      recommendations.push('Add more token pairs for better diversification')
    }

    const stableCoins = ['USDC', 'USDT', 'DAI']
    const stableExposure = tokenPercentages
      .filter(t => stableCoins.includes(t.symbol))
      .reduce((sum, t) => sum + t.percentage, 0)

    if (stableExposure < 20) {
      recommendations.push('Consider increasing stable coin exposure for risk management')
    } else if (stableExposure > 70) {
      recommendations.push('Consider reducing stable coin concentration for higher yields')
    }

    return recommendations
  }

  /**
   * Clear portfolio cache
   */
  clearCache(): void {
    this.portfolioCache.clear()
    console.log('🧹 Portfolio aggregation cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { count: number; keys: string[] } {
    return {
      count: this.portfolioCache.size,
      keys: Array.from(this.portfolioCache.keys())
    }
  }
}

// Export singleton instance
export const portfolioAggregationManager = new PortfolioAggregationManager(dlmmClient.getConnection())