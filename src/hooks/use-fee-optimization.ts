'use client'

// Fee Optimization Hooks
// 💰 React hooks for dynamic fee tier management and optimization

import { useState, useEffect, useCallback } from 'react'
import { PublicKey } from '@solana/web3.js'
import {
  feeTierManager,
  type FeeTier,
  type FeeAnalysis,
  type FeeOptimizationSettings
} from '@/lib/dlmm/fee-tiers'

/**
 * Hook for fee optimization analysis
 */
export function useFeeOptimization(
  poolAddress?: PublicKey | string,
  liquidityAmount?: string,
  tokenPair?: string,
  settings?: FeeOptimizationSettings
) {
  const [analysis, setAnalysis] = useState<FeeAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const defaultSettings: FeeOptimizationSettings = {
    riskTolerance: 'moderate',
    liquidityRange: 'moderate',
    rebalanceFrequency: 'daily',
    maxSlippage: 0.01, // 1%
    prioritizeFees: true
  }

  const fetchAnalysis = useCallback(async () => {
    if (!poolAddress || !liquidityAmount || !tokenPair) {
      setAnalysis(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const poolPubkey = typeof poolAddress === 'string' ? new PublicKey(poolAddress) : poolAddress
      const optimizationSettings = settings || defaultSettings

      console.log('💰 Fee Optimization: Analyzing for pool:', poolPubkey.toString())

      const feeAnalysis = await feeTierManager.analyzeFeeOptimization(
        poolPubkey,
        liquidityAmount,
        tokenPair,
        optimizationSettings
      )

      console.log('✅ Fee Optimization: Analysis complete:', {
        currentTier: feeAnalysis.currentTier.name,
        recommendedTier: feeAnalysis.recommendedTier?.name || 'No change',
        potentialSavings: feeAnalysis.potentialSavings.toFixed(2)
      })

      setAnalysis(feeAnalysis)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('❌ Fee Optimization: Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze fee optimization')
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }, [poolAddress, liquidityAmount, tokenPair, settings])

  // Initial fetch
  useEffect(() => {
    fetchAnalysis()
  }, [fetchAnalysis])

  return {
    analysis,
    loading,
    error,
    lastUpdate,
    refreshAnalysis: fetchAnalysis
  }
}

/**
 * Hook for available fee tiers
 */
export function useAvailableFeeTiers(
  tokenPair?: string,
  liquidityAmount?: string
) {
  const [feeTiers, setFeeTiers] = useState<FeeTier[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFeeTiers = useCallback(() => {
    if (!tokenPair || !liquidityAmount) {
      setFeeTiers([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('💰 Fee Tiers: Fetching available tiers for:', tokenPair)

      const availableTiers = feeTierManager.getAvailableFeeTiers(tokenPair, liquidityAmount)

      console.log('✅ Fee Tiers: Found', availableTiers.length, 'available tiers')

      setFeeTiers(availableTiers)
    } catch (err) {
      console.error('❌ Fee Tiers: Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch fee tiers')
      setFeeTiers([])
    } finally {
      setLoading(false)
    }
  }, [tokenPair, liquidityAmount])

  useEffect(() => {
    fetchFeeTiers()
  }, [fetchFeeTiers])

  return {
    feeTiers,
    loading,
    error,
    refreshFeeTiers: fetchFeeTiers
  }
}

/**
 * Hook for market-based fee recommendations
 */
export function useFeeRecommendations(
  tokenPair?: string,
  liquidityAmount?: string
) {
  const [recommendations, setRecommendations] = useState<{
    tier: FeeTier
    confidence: number
    reasoning: string
  }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchRecommendations = useCallback(async () => {
    if (!tokenPair || !liquidityAmount) {
      setRecommendations([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('📊 Fee Recommendations: Analyzing market conditions for:', tokenPair)

      const marketRecommendations = await feeTierManager.getMarketBasedRecommendations(
        tokenPair,
        liquidityAmount
      )

      console.log('✅ Fee Recommendations: Generated', marketRecommendations.length, 'recommendations')

      setRecommendations(marketRecommendations)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('❌ Fee Recommendations: Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to get fee recommendations')
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }, [tokenPair, liquidityAmount])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  return {
    recommendations,
    loading,
    error,
    lastUpdate,
    refreshRecommendations: fetchRecommendations
  }
}

/**
 * Hook for migration impact analysis
 */
export function useMigrationImpact(
  currentTier?: FeeTier,
  targetTier?: FeeTier,
  liquidityAmount?: string,
  volume24h?: string
) {
  const [impact, setImpact] = useState<{
    migrationCost: number
    dailySavings: number
    breakEvenDays: number
    annualBenefit: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateImpact = useCallback(async () => {
    if (!currentTier || !targetTier || !liquidityAmount || !volume24h) {
      setImpact(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('📈 Migration Impact: Calculating for tier change:', `${currentTier.name} → ${targetTier.name}`)

      const migrationImpact = await feeTierManager.calculateMigrationImpact(
        currentTier,
        targetTier,
        liquidityAmount,
        volume24h
      )

      console.log('✅ Migration Impact: Calculated:', {
        cost: migrationImpact.migrationCost.toFixed(2),
        dailySavings: migrationImpact.dailySavings.toFixed(2),
        breakEven: migrationImpact.breakEvenDays.toFixed(1) + ' days'
      })

      setImpact(migrationImpact)
    } catch (err) {
      console.error('❌ Migration Impact: Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to calculate migration impact')
      setImpact(null)
    } finally {
      setLoading(false)
    }
  }, [currentTier, targetTier, liquidityAmount, volume24h])

  useEffect(() => {
    calculateImpact()
  }, [calculateImpact])

  return {
    impact,
    loading,
    error,
    refreshImpact: calculateImpact
  }
}

/**
 * Hook for custom fee tier creation
 */
export function useCustomFeeTier() {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCustomTier = useCallback(async (
    name: string,
    baseFeeBps: number,
    protocolFeeBps: number,
    description: string,
    recommendedFor: string[],
    minLiquidity: string
  ) => {
    setIsCreating(true)
    setError(null)

    try {
      console.log('🔧 Custom Fee Tier: Creating:', name)

      const customTier = feeTierManager.createCustomFeeTier(
        name,
        baseFeeBps,
        protocolFeeBps,
        description,
        recommendedFor,
        minLiquidity
      )

      console.log('✅ Custom Fee Tier: Created successfully:', customTier.name)

      return customTier
    } catch (err) {
      console.error('❌ Custom Fee Tier: Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create custom fee tier')
      throw err
    } finally {
      setIsCreating(false)
    }
  }, [])

  return {
    createCustomTier,
    isCreating,
    error
  }
}

/**
 * Hook for fee tier cache management
 */
export function useFeeTierCache() {
  const [cacheStats, setCacheStats] = useState(feeTierManager.getCacheStats())

  const refreshCacheStats = useCallback(() => {
    setCacheStats(feeTierManager.getCacheStats())
  }, [])

  const clearCache = useCallback(() => {
    console.log('🧹 Fee Tier Cache: Manual clear')
    feeTierManager.clearCache()
    refreshCacheStats()
  }, [refreshCacheStats])

  // Refresh cache stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshCacheStats, 30000)
    return () => clearInterval(interval)
  }, [refreshCacheStats])

  return {
    cacheStats,
    refreshCacheStats,
    clearCache
  }
}

/**
 * Combined hook for comprehensive fee management
 */
export function useComprehensiveFeeManagement(
  poolAddress?: PublicKey | string,
  liquidityAmount?: string,
  tokenPair?: string,
  settings?: FeeOptimizationSettings
) {
  const { analysis, loading: analysisLoading, error: analysisError } = useFeeOptimization(
    poolAddress,
    liquidityAmount,
    tokenPair,
    settings
  )

  const { feeTiers, loading: tiersLoading, error: tiersError } = useAvailableFeeTiers(
    tokenPair,
    liquidityAmount
  )

  const { recommendations, loading: recommendationsLoading, error: recommendationsError } = useFeeRecommendations(
    tokenPair,
    liquidityAmount
  )

  const { cacheStats } = useFeeTierCache()

  const loading = analysisLoading || tiersLoading || recommendationsLoading
  const error = analysisError || tiersError || recommendationsError

  return {
    analysis,
    feeTiers,
    recommendations,
    cacheStats,
    loading,
    error,
    hasData: !!(analysis && feeTiers.length > 0)
  }
}