// Advanced Fee Tier Management System
// 💰 Dynamic fee optimization and tier selection for DLMM positions
// Integrates with Saros SDK for optimal fee structure management

import { Connection, PublicKey } from '@solana/web3.js'
import { dlmmClient } from './client'

export interface FeeTier {
  id: string
  name: string
  baseFeeBps: number // Base fee in basis points (1 bps = 0.01%)
  protocolFeeBps: number
  totalFeeBps: number
  category: 'stable' | 'volatile' | 'exotic' | 'custom'
  description: string
  recommendedFor: string[]
  minLiquidity: string
  maxLiquidity?: string
  isActive: boolean
}

export interface FeeAnalysis {
  currentTier: FeeTier
  recommendedTier: FeeTier | null
  potentialSavings: number
  savingsPercentage: number
  analysisReason: string
  optimization: {
    timeToBreakeven: number // days
    projectedAnnualSavings: number
    riskLevel: 'low' | 'medium' | 'high'
  }
}

export interface FeeOptimizationSettings {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  liquidityRange: 'tight' | 'moderate' | 'wide'
  rebalanceFrequency: 'never' | 'weekly' | 'daily' | 'hourly'
  maxSlippage: number
  prioritizeFees: boolean
}

/**
 * Advanced Fee Tier Management Service
 * Provides intelligent fee tier optimization and management
 */
export class FeeTierManager {
  private feeCache = new Map<string, { analysis: FeeAnalysis; timestamp: number }>()
  private readonly cacheDuration = 300000 // 5 minutes for fee analysis

  // Predefined fee tiers based on Saros DLMM standards
  private readonly standardFeeTiers: FeeTier[] = [
    {
      id: 'stable-low',
      name: 'Stable Low',
      baseFeeBps: 1, // 0.01%
      protocolFeeBps: 0,
      totalFeeBps: 1,
      category: 'stable',
      description: 'Ultra-low fees for stable pairs (USDC/USDT)',
      recommendedFor: ['USDC/USDT', 'DAI/USDC', 'USDC/BUSD'],
      minLiquidity: '1000',
      maxLiquidity: '100000000',
      isActive: true
    },
    {
      id: 'stable-standard',
      name: 'Stable Standard',
      baseFeeBps: 5, // 0.05%
      protocolFeeBps: 0,
      totalFeeBps: 5,
      category: 'stable',
      description: 'Standard fees for major stable pairs',
      recommendedFor: ['SOL/USDC', 'ETH/USDC', 'BTC/USDC'],
      minLiquidity: '10000',
      maxLiquidity: '50000000',
      isActive: true
    },
    {
      id: 'volatile-standard',
      name: 'Volatile Standard',
      baseFeeBps: 30, // 0.30%
      protocolFeeBps: 0,
      totalFeeBps: 30,
      category: 'volatile',
      description: 'Standard fees for volatile token pairs',
      recommendedFor: ['RAY/SOL', 'SRM/SOL', 'ORCA/SOL'],
      minLiquidity: '5000',
      maxLiquidity: '20000000',
      isActive: true
    },
    {
      id: 'volatile-high',
      name: 'Volatile High',
      baseFeeBps: 100, // 1.00%
      protocolFeeBps: 0,
      totalFeeBps: 100,
      category: 'volatile',
      description: 'Higher fees for highly volatile pairs',
      recommendedFor: ['MEME tokens', 'New tokens', 'High volatility pairs'],
      minLiquidity: '1000',
      maxLiquidity: '10000000',
      isActive: true
    },
    {
      id: 'exotic-premium',
      name: 'Exotic Premium',
      baseFeeBps: 300, // 3.00%
      protocolFeeBps: 0,
      totalFeeBps: 300,
      category: 'exotic',
      description: 'Premium fees for exotic or illiquid pairs',
      recommendedFor: ['Long-tail assets', 'NFT tokens', 'Governance tokens'],
      minLiquidity: '500',
      maxLiquidity: '5000000',
      isActive: true
    }
  ]

  constructor(_connection: Connection) {
    console.log('💰 FeeTierManager: Initialized with advanced optimization algorithms')
  }

  /**
   * Analyze current fee structure and recommend optimizations
   */
  async analyzeFeeOptimization(
    poolAddress: PublicKey,
    liquidityAmount: string,
    tokenPair: string,
    settings: FeeOptimizationSettings
  ): Promise<FeeAnalysis> {
    const cacheKey = `fee-analysis-${poolAddress.toString()}-${liquidityAmount}`

    try {
      // Check cache
      const cached = this.feeCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        console.log('✅ Fee analysis loaded from cache')
        return cached.analysis
      }

      console.log('🔄 Analyzing fee optimization for:', {
        pool: poolAddress.toString(),
        liquidity: liquidityAmount,
        pair: tokenPair
      })

      // Get current pool information
      const pool = await dlmmClient.getLbPair(poolAddress)
      if (!pool) {
        throw new Error('Pool not found')
      }

      // Determine current fee tier
      const currentTier = this.getCurrentFeeTier(pool.binStep || 0)

      // Find optimal fee tier based on settings and market conditions
      const recommendedTier = await this.findOptimalFeeTier(
        tokenPair,
        liquidityAmount,
        settings
      )

      // Calculate potential savings
      const analysis = await this.calculateFeeOptimization(
        currentTier,
        recommendedTier,
        parseFloat(liquidityAmount),
        settings
      )

      // Cache the analysis
      this.feeCache.set(cacheKey, { analysis, timestamp: Date.now() })

      console.log('✅ Fee analysis complete:', {
        current: currentTier.name,
        recommended: analysis.recommendedTier?.name || 'No change',
        savings: analysis.potentialSavings.toFixed(2)
      })

      return analysis
    } catch (error) {
      console.error('❌ Error in fee analysis:', error)
      throw error
    }
  }

  /**
   * Get available fee tiers for a token pair
   */
  getAvailableFeeTiers(
    tokenPair: string,
    liquidityAmount: string
  ): FeeTier[] {
    const liquidity = parseFloat(liquidityAmount)

    return this.standardFeeTiers.filter(tier => {
      if (!tier.isActive) return false

      // Check liquidity requirements
      const minLiquidity = parseFloat(tier.minLiquidity)
      const maxLiquidity = tier.maxLiquidity ? parseFloat(tier.maxLiquidity) : Infinity

      if (liquidity < minLiquidity || liquidity > maxLiquidity) {
        return false
      }

      // Check if pair is recommended for this tier
      const isRecommended = tier.recommendedFor.some(recommendation =>
        tokenPair.toLowerCase().includes(recommendation.toLowerCase()) ||
        recommendation.toLowerCase().includes(tokenPair.toLowerCase())
      )

      return isRecommended || tier.category === 'stable' || tier.category === 'volatile'
    }).sort((a, b) => a.totalFeeBps - b.totalFeeBps)
  }

  /**
   * Create custom fee tier configuration
   */
  createCustomFeeTier(
    name: string,
    baseFeeBps: number,
    protocolFeeBps: number,
    description: string,
    recommendedFor: string[],
    minLiquidity: string
  ): FeeTier {
    const customTier: FeeTier = {
      id: `custom-${Date.now()}`,
      name,
      baseFeeBps,
      protocolFeeBps,
      totalFeeBps: baseFeeBps + protocolFeeBps,
      category: 'custom',
      description,
      recommendedFor,
      minLiquidity,
      isActive: true
    }

    console.log('✅ Created custom fee tier:', customTier.name)
    return customTier
  }

  /**
   * Calculate fee tier migration costs and benefits
   */
  async calculateMigrationImpact(
    currentTier: FeeTier,
    targetTier: FeeTier,
    liquidityAmount: string,
    volume24h: string
  ): Promise<{
    migrationCost: number
    dailySavings: number
    breakEvenDays: number
    annualBenefit: number
  }> {
    const liquidity = parseFloat(liquidityAmount)
    const volume = parseFloat(volume24h)

    // Estimate migration costs (gas, slippage, etc.)
    const migrationCost = liquidity * 0.001 // 0.1% of liquidity

    // Calculate daily fee savings
    const currentDailyFees = volume * (currentTier.totalFeeBps / 10000)
    const targetDailyFees = volume * (targetTier.totalFeeBps / 10000)
    const dailySavings = currentDailyFees - targetDailyFees

    // Calculate break-even time
    const breakEvenDays = dailySavings > 0 ? migrationCost / dailySavings : Infinity

    // Calculate annual benefit
    const annualBenefit = (dailySavings * 365) - migrationCost

    console.log('💡 Migration impact calculated:', {
      migrationCost: migrationCost.toFixed(2),
      dailySavings: dailySavings.toFixed(2),
      breakEvenDays: breakEvenDays.toFixed(1)
    })

    return {
      migrationCost,
      dailySavings,
      breakEvenDays,
      annualBenefit
    }
  }

  /**
   * Get fee tier recommendations based on market conditions
   */
  async getMarketBasedRecommendations(
    tokenPair: string,
    liquidityAmount: string
  ): Promise<{
    tier: FeeTier
    confidence: number
    reasoning: string
  }[]> {
    console.log('📊 Analyzing market conditions for fee recommendations...')

    const availableTiers = this.getAvailableFeeTiers(tokenPair, liquidityAmount)
    const recommendations: { tier: FeeTier; confidence: number; reasoning: string }[] = []

    for (const tier of availableTiers) {
      let confidence = 0.5 // Base confidence
      let reasoning = ''

      // Analyze pair characteristics
      if (tokenPair.includes('USDC') || tokenPair.includes('USDT') || tokenPair.includes('DAI')) {
        if (tier.category === 'stable') {
          confidence += 0.3
          reasoning += 'Stable pair detected. '
        }
      }

      if (tokenPair.includes('SOL') || tokenPair.includes('ETH') || tokenPair.includes('BTC')) {
        if (tier.category === 'volatile' && tier.totalFeeBps <= 30) {
          confidence += 0.25
          reasoning += 'Major token pair with moderate volatility. '
        }
      }

      // Liquidity-based adjustments
      const liquidity = parseFloat(liquidityAmount)
      if (liquidity > 50000) {
        if (tier.totalFeeBps <= 30) {
          confidence += 0.15
          reasoning += 'Large liquidity position benefits from lower fees. '
        }
      } else if (liquidity < 5000) {
        if (tier.totalFeeBps >= 30) {
          confidence += 0.1
          reasoning += 'Smaller position can benefit from higher fee capture. '
        }
      }

      // Cap confidence at 1.0
      confidence = Math.min(confidence, 1.0)

      recommendations.push({
        tier,
        confidence,
        reasoning: reasoning.trim() || 'Standard fee tier recommendation.'
      })
    }

    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence)

    console.log('✅ Market-based recommendations generated:', recommendations.length)
    return recommendations
  }

  /**
   * Get current fee tier from pool information
   */
  private getCurrentFeeTier(baseFactor: number): FeeTier {
    // Convert base factor to basis points (this is simplified)
    const estimatedBps = baseFactor / 100

    // Find closest matching tier
    const matchingTier = this.standardFeeTiers.find(tier =>
      Math.abs(tier.totalFeeBps - estimatedBps) < 5
    )

    return matchingTier || this.standardFeeTiers[1] // Default to stable-standard
  }

  /**
   * Find optimal fee tier based on settings
   */
  private async findOptimalFeeTier(
    tokenPair: string,
    liquidityAmount: string,
    settings: FeeOptimizationSettings
  ): Promise<FeeTier | null> {
    const availableTiers = this.getAvailableFeeTiers(tokenPair, liquidityAmount)

    if (availableTiers.length === 0) return null

    // Apply optimization logic based on settings
    if (settings.prioritizeFees) {
      // Find tier with best fee structure
      return availableTiers.find(tier =>
        settings.riskTolerance === 'conservative' ? tier.totalFeeBps <= 30 :
        settings.riskTolerance === 'moderate' ? tier.totalFeeBps <= 100 :
        tier.totalFeeBps <= 300
      ) || availableTiers[0]
    }

    // Default to most suitable tier
    return availableTiers[0]
  }

  /**
   * Calculate fee optimization analysis
   */
  private async calculateFeeOptimization(
    currentTier: FeeTier,
    recommendedTier: FeeTier | null,
    liquidityAmount: number,
    _settings: FeeOptimizationSettings
  ): Promise<FeeAnalysis> {
    if (!recommendedTier || currentTier.id === recommendedTier.id) {
      return {
        currentTier,
        recommendedTier: null,
        potentialSavings: 0,
        savingsPercentage: 0,
        analysisReason: 'Current fee tier is already optimal',
        optimization: {
          timeToBreakeven: 0,
          projectedAnnualSavings: 0,
          riskLevel: 'low'
        }
      }
    }

    // Estimate daily volume (simplified)
    const estimatedDailyVolume = liquidityAmount * 0.1 // 10% daily turnover

    const currentDailyFees = estimatedDailyVolume * (currentTier.totalFeeBps / 10000)
    const recommendedDailyFees = estimatedDailyVolume * (recommendedTier.totalFeeBps / 10000)

    const potentialSavings = currentDailyFees - recommendedDailyFees
    const savingsPercentage = currentDailyFees > 0 ? (potentialSavings / currentDailyFees) * 100 : 0

    const migrationCost = liquidityAmount * 0.001 // Estimated migration cost
    const timeToBreakeven = potentialSavings > 0 ? migrationCost / potentialSavings : Infinity

    return {
      currentTier,
      recommendedTier,
      potentialSavings,
      savingsPercentage,
      analysisReason: `Switching to ${recommendedTier.name} could save ${potentialSavings.toFixed(2)} USD daily`,
      optimization: {
        timeToBreakeven,
        projectedAnnualSavings: potentialSavings * 365,
        riskLevel: recommendedTier.totalFeeBps > currentTier.totalFeeBps ? 'high' : 'low'
      }
    }
  }

  /**
   * Clear fee analysis cache
   */
  clearCache(): void {
    this.feeCache.clear()
    console.log('🧹 Fee tier cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { count: number; keys: string[] } {
    return {
      count: this.feeCache.size,
      keys: Array.from(this.feeCache.keys())
    }
  }
}

// Export singleton instance
export const feeTierManager = new FeeTierManager(dlmmClient.getConnection())