'use client'

// Enhanced Pool Analytics Hook using improved SDK client
// ✅ Proper SDK type integration with caching
// ✅ Real-time polling with configurable intervals
// ✅ Enhanced error handling and fallbacks
// ✅ Data source context integration (mock/real data)

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { PublicKey } from '@solana/web3.js'
import { dlmmClient } from '@/lib/dlmm/client'
import { useDataSource } from '@/contexts/data-source-context'
import { REFRESH_INTERVALS } from '@/lib/constants'
import type {
  PoolAnalyticsData,
  PoolMetrics,
  FeeDistribution,
  LiquidityConcentration,
  PoolHistoricalPerformance,
  PoolListItem,
  DLMMPosition
} from '@/lib/types'

interface UsePoolAnalyticsResult {
  analyticsData: PoolAnalyticsData | null
  loading: boolean
  refreshing: boolean
  error: string | null
  refreshAnalytics: () => Promise<void>
  lastUpdate: Date | null
}

export function usePoolAnalytics(
  poolAddress?: PublicKey | string,
  enableRealtime: boolean = true
): UsePoolAnalyticsResult {
  const { isRealDataMode } = useDataSource()

  console.log('🪝 usePoolAnalytics HOOK CALLED with:', {
    poolAddress: poolAddress?.toString(),
    enableRealtime,
    dataMode: isRealDataMode ? 'REAL' : 'MOCK'
  })

  const [analyticsData, setAnalyticsData] = useState<PoolAnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleError = useCallback((error: any, context: string) => {
    console.error(`${context}:`, error)
    setError(error instanceof Error ? error.message : 'Unknown error occurred')
  }, [])

  const fetchAnalytics = useCallback(async () => {
    if (!poolAddress) {
      setAnalyticsData(null)
      setError(null)
      return
    }

    try {
      setError(null)
      const publicKey = typeof poolAddress === 'string' ? new PublicKey(poolAddress) : poolAddress

      console.log('🔄 Fetching pool analytics for:', publicKey.toString())
      console.log('🚀 Enhanced SDK: Analytics data mode:', isRealDataMode ? 'REAL DATA' : 'MOCK DATA')
      console.log('💡 Enhanced SDK: Using intelligent caching (30s duration)')
      console.log('⏰ Enhanced SDK: fetchAnalytics called at', new Date().toISOString())

      const data = await dlmmClient.getPoolAnalytics(publicKey, isRealDataMode)
      console.log('📊 Enhanced SDK: Current cache stats:', dlmmClient.getCacheStats())

      console.log('✅ Pool analytics fetched successfully:', {
        tvl: data.metrics?.tvl || 'N/A',
        volume24h: data.metrics?.volume24h || 'N/A',
        apr: data.metrics?.apr || 'N/A',
        activeBins: data.metrics?.activeBins || 'N/A'
      })

      setAnalyticsData(data)
      setLastUpdate(new Date())
    } catch (error) {
      handleError(error, 'Failed to fetch pool analytics')
      setAnalyticsData(null)
    }
  }, [poolAddress, handleError, isRealDataMode])

  const refreshAnalytics = useCallback(async () => {
    if (!poolAddress) return

    setRefreshing(true)
    try {
      await fetchAnalytics()
    } finally {
      setRefreshing(false)
    }
  }, [fetchAnalytics, poolAddress])

  // Initial fetch with loading state
  useEffect(() => {
    console.log('🔥🔥🔥 USEEFFECT START - useEffect triggered at:', new Date().toISOString())
    // logger.debug('🔍 USEEFFECT DEBUG - poolAddress raw:', poolAddress)
    // logger.debug('🔍 USEEFFECT DEBUG - poolAddress type:', typeof poolAddress)
    // logger.debug('🔍 USEEFFECT DEBUG - poolAddress string:', poolAddress ? (typeof poolAddress === 'string' ? poolAddress : poolAddress.toString()) : 'UNDEFINED')
    // logger.debug('🔍 USEEFFECT DEBUG - hasInitialized:', hasInitialized)

    if (!poolAddress) {
      console.log('❌ USEEFFECT EXIT - No poolAddress provided')
      setAnalyticsData(null)
      setError(null)
      setLoading(false)
      setHasInitialized(false)
      return
    }

    // Force initialization flag to ensure execution
    if (!hasInitialized) {
      setHasInitialized(true)
      console.log('🚀 FORCE INIT - First time initialization for pool:', poolAddress.toString())
    }

    console.log('✅ USEEFFECT CONTINUE - Valid poolAddress found:', poolAddress.toString())
    console.log('🚀 usePoolAnalytics: useEffect triggered for pool:', poolAddress.toString())
    console.log('🔧 usePoolAnalytics: Forcing analytics fetch execution')
    setLoading(true)

    const initAnalytics = async () => {
      try {
        setError(null)
        const publicKey = typeof poolAddress === 'string' ? new PublicKey(poolAddress) : poolAddress

        console.log('🔄 usePoolAnalytics: Fetching analytics for:', publicKey.toString())

        console.log('📞 usePoolAnalytics: About to call dlmmClient.getPoolAnalytics with mode:', isRealDataMode ? 'REAL' : 'MOCK')
        const data = await dlmmClient.getPoolAnalytics(publicKey, isRealDataMode)
        console.log('🎯 usePoolAnalytics: getPoolAnalytics returned:', data)

        console.log('✅ usePoolAnalytics: Analytics fetched successfully:', {
          tvl: data.metrics?.tvl || 'N/A',
          volume24h: data.metrics?.volume24h || 'N/A',
          apr: data.metrics?.apr || 'N/A',
          activeBins: data.metrics?.activeBins || 'N/A'
        })

        setAnalyticsData(data)
        setLastUpdate(new Date())
      } catch (error) {
        console.error('❌ usePoolAnalytics: Error:', error)
        setError(error instanceof Error ? error.message : 'Unknown error occurred')
        setAnalyticsData(null)
      } finally {
        setLoading(false)
      }
    }

    initAnalytics()
  }, [typeof poolAddress === 'string' ? poolAddress : poolAddress?.toString(), hasInitialized, isRealDataMode]) // FIXED: Include data mode in dependencies

  // Set up real-time polling
  useEffect(() => {
    if (enableRealtime && poolAddress && !loading) {
      intervalRef.current = setInterval(() => {
        if (!refreshing) {
          fetchAnalytics()
        }
      }, REFRESH_INTERVALS.analytics) // 60 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    // Return undefined for the else case to satisfy TS7030
    return undefined
  }, [enableRealtime, poolAddress, loading, refreshing, fetchAnalytics])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    analyticsData,
    loading,
    refreshing,
    error,
    refreshAnalytics,
    lastUpdate
  }
}

interface UsePoolListResult {
  pools: PoolListItem[]
  loading: boolean
  error: string | null
  refreshPools: () => Promise<void>
}

export function usePoolList(): UsePoolListResult {
  // Initialize with fallback pools immediately - known mainnet DLMM pools
  const [pools, setPools] = useState<PoolListItem[]>([
    {
      address: new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'), // SOL/USDC
      name: 'SOL/USDC',
      tokenX: 'SOL',
      tokenY: 'USDC',
      tvl: '2500000',
      volume24h: '1500000',
      apr: 12.5,
      isActive: true
    },
    {
      address: new PublicKey('Cx4xoCsJbvFLLH61MPdUp6CvEeaUKgUnpWzTRZC81rXG'), // RAY/SOL
      name: 'RAY/SOL',
      tokenX: 'RAY',
      tokenY: 'SOL',
      tvl: '1800000',
      volume24h: '900000',
      apr: 15.8,
      isActive: true
    }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // logger.debug('🔍 usePoolList hook initialized, pools.length:', pools.length)

  const handleError = useCallback((error: any, context: string) => {
    console.error(`❌ ${context}:`, error)
    setError(error instanceof Error ? error.message : 'Unknown error occurred')
  }, [])

  const fetchPools = useCallback(async () => {
    try {
      setError(null)
      console.log('🔄 usePoolList: Starting fetchPools() call...')
      console.log('🔧 usePoolList: dlmmClient instance:', !!dlmmClient)

      console.log('🔄 usePoolList: Calling dlmmClient.getAvailablePools()...')
      const poolList = await dlmmClient.getAvailablePools()

      console.log('✅ usePoolList: Available pools fetched:', poolList?.length || 0, 'pools')
      console.log('📊 usePoolList: Pool list data:', poolList)

      if (poolList.length === 0) {
        console.log('⚠️ No pools from SDK, using fallback pools for testing')
        // Fallback to known mainnet DLMM pools for testing
        setPools([
          {
            address: new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'), // SOL/USDC
            name: 'SOL/USDC',
            tokenX: 'SOL',
            tokenY: 'USDC',
            tvl: '2500000',
            volume24h: '1500000',
            apr: 12.5,
            isActive: true
          },
          {
            address: new PublicKey('Cx4xoCsJbvFLLH61MPdUp6CvEeaUKgUnpWzTRZC81rXG'), // RAY/SOL
            name: 'RAY/SOL',
            tokenX: 'RAY',
            tokenY: 'SOL',
            tvl: '1800000',
            volume24h: '900000',
            apr: 15.8,
            isActive: true
          }
        ])
      } else {
        setPools(poolList)
      }
    } catch (error) {
      console.error('❌ Error in fetchPools:', error)
      handleError(error, 'Failed to fetch available pools')

      // Fallback pools even on error
      console.log('⚠️ Using fallback pools due to error')
      setPools([
        {
          address: new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'),
          name: 'SOL/USDC',
          tokenX: 'SOL',
          tokenY: 'USDC',
          tvl: '2500000',
          volume24h: '1500000',
          apr: 12.5,
          isActive: true
        },
        {
          address: new PublicKey('Cx4xoCsJbvFLLH61MPdUp6CvEeaUKgUnpWzTRZC81rXG'),
          name: 'RAY/SOL',
          tokenX: 'RAY',
          tokenY: 'SOL',
          tvl: '1800000',
          volume24h: '900000',
          apr: 15.8,
          isActive: true
        }
      ])
    }
  }, [handleError])

  const refreshPools = useCallback(async () => {
    console.log('🔧 usePoolList: refreshPools() called')
    setLoading(true)
    try {
      await fetchPools()
    } finally {
      setLoading(false)
    }
  }, [fetchPools])

  // Initial fetch on mount only
  useEffect(() => {
    console.log('🚀 usePoolList: useEffect triggered, calling refreshPools...')
    const initFetch = async () => {
      try {
        setError(null)
        console.log('🔄 usePoolList: Direct call to fetchPools()...')
        console.log('🔧 usePoolList: dlmmClient instance:', !!dlmmClient)

        console.log('🔄 usePoolList: Calling dlmmClient.getAvailablePools()...')
        const poolList = await dlmmClient.getAvailablePools()

        console.log('✅ usePoolList: Available pools fetched:', poolList?.length || 0, 'pools')
        console.log('📊 usePoolList: Pool list data:', poolList)

        if (poolList && poolList.length === 0) {
          console.log('⚠️ usePoolList: No pools from SDK, using fallback pools for testing')
          // Fallback to known mainnet DLMM pools for testing
          setPools([
            {
              address: new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'), // SOL/USDC
              name: 'SOL/USDC',
              tokenX: 'SOL',
              tokenY: 'USDC',
              tvl: '2500000',
              volume24h: '1500000',
              apr: 12.5,
              isActive: true
            },
            {
              address: new PublicKey('Cx4xoCsJbvFLLH61MPdUp6CvEeaUKgUnpWzTRZC81rXG'), // RAY/SOL
              name: 'RAY/SOL',
              tokenX: 'RAY',
              tokenY: 'SOL',
              tvl: '1800000',
              volume24h: '900000',
              apr: 15.8,
              isActive: true
            }
          ])
        } else if (poolList) {
          setPools(poolList)
        }
      } catch (error) {
        console.error('❌ usePoolList: Error in initFetch:', error)
        handleError(error, 'Failed to fetch available pools')

        // Fallback pools even on error
        console.log('⚠️ usePoolList: Using fallback pools due to error')
        setPools([
          {
            address: new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'),
            name: 'SOL/USDC',
            tokenX: 'SOL',
            tokenY: 'USDC',
            tvl: '2500000',
            volume24h: '1500000',
            apr: 12.5,
            isActive: true
          },
          {
            address: new PublicKey('Cx4xoCsJbvFLLH61MPdUp6CvEeaUKgUnpWzTRZC81rXG'),
            name: 'RAY/SOL',
            tokenX: 'RAY',
            tokenY: 'SOL',
            tvl: '1800000',
            volume24h: '900000',
            apr: 15.8,
            isActive: true
          }
        ])
      }
    }

    initFetch()
  }, []) // Empty dependency array - only run on mount

  return {
    pools,
    loading,
    error,
    refreshPools
  }
}

// Specialized hooks for individual analytics components
export function usePoolMetrics(poolAddress?: PublicKey | string): {
  metrics: PoolMetrics | null
  loading: boolean
  error: string | null
} {
  const { analyticsData, loading, error } = usePoolAnalytics(poolAddress)

  return {
    metrics: analyticsData?.metrics || null,
    loading,
    error
  }
}

export function usePoolFeeDistribution(poolAddress?: PublicKey | string): {
  feeDistribution: FeeDistribution[]
  loading: boolean
  error: string | null
} {
  const { analyticsData, loading, error } = usePoolAnalytics(poolAddress)

  return {
    feeDistribution: analyticsData?.feeDistribution || [],
    loading,
    error
  }
}

export function usePoolLiquidityConcentration(poolAddress?: PublicKey | string): {
  liquidityConcentration: LiquidityConcentration | null
  loading: boolean
  error: string | null
} {
  const { analyticsData, loading, error } = usePoolAnalytics(poolAddress)

  return {
    liquidityConcentration: analyticsData?.liquidityConcentration || null,
    loading,
    error
  }
}

export function usePoolHistoricalPerformance(poolAddress?: PublicKey | string): {
  historicalPerformance: PoolHistoricalPerformance | null
  loading: boolean
  error: string | null
} {
  const { analyticsData, loading, error } = usePoolAnalytics(poolAddress)

  return {
    historicalPerformance: analyticsData?.historicalPerformance || null,
    loading,
    error
  }
}

// ============================================================================
// ADVANCED ANALYTICS HOOKS
// ============================================================================

import type {
  AdvancedPositionAnalytics,
  PortfolioAnalytics
} from '@/lib/analytics/position-analytics'
import { advancedAnalyticsEngine } from '@/lib/analytics/position-analytics'

/**
 * Hook for advanced position analytics with IL tracking, risk assessment, and performance attribution
 */
export function useAdvancedPositionAnalytics(
  position?: DLMMPosition,
  enableRealtime: boolean = true
): {
  advancedAnalytics: AdvancedPositionAnalytics | null
  loading: boolean
  error: string | null
  refreshAnalytics: () => Promise<void>
  lastUpdate: Date | null
} {
  const { isRealDataMode } = useDataSource()
  const [advancedAnalytics, setAdvancedAnalytics] = useState<AdvancedPositionAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchAdvancedAnalytics = useCallback(async () => {
    if (!position) {
      setAdvancedAnalytics(null)
      setError(null)
      return
    }

    try {
      setError(null)
      console.log('🚀 Fetching advanced position analytics for:', position.poolAddress.toString())

      // Get pool data for the position
      const poolData = await dlmmClient.getPoolAnalytics(position.poolAddress, isRealDataMode)

      // Generate mock historical prices for demo
      const historicalPrices = {
        tokenX: Array.from({ length: 30 }, (_) => position.tokenX.price * (1 + (Math.random() - 0.5) * 0.1)),
        tokenY: Array.from({ length: 30 }, (_) => position.tokenY.price * (1 + (Math.random() - 0.5) * 0.1)),
        timestamps: Array.from({ length: 30 }, (_, i) => new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000))
      }

      // Calculate advanced analytics
      const analytics = await advancedAnalyticsEngine.calculateAdvancedAnalytics(
        position,
        poolData,
        historicalPrices
      )

      console.log('✅ Advanced analytics calculated:', {
        impermanentLoss: analytics.impermanentLoss.percentage.toFixed(2) + '%',
        riskScore: analytics.riskMetrics.overallRiskScore.toFixed(1),
        efficiency: analytics.healthMetrics.efficiency.toFixed(1) + '%'
      })

      setAdvancedAnalytics(analytics)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('❌ Error fetching advanced analytics:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
      setAdvancedAnalytics(null)
    }
  }, [position, isRealDataMode])

  const refreshAnalytics = useCallback(async () => {
    if (!position) return
    setLoading(true)
    try {
      await fetchAdvancedAnalytics()
    } finally {
      setLoading(false)
    }
  }, [fetchAdvancedAnalytics, position])

  // Initial fetch
  useEffect(() => {
    if (position) {
      setLoading(true)
      fetchAdvancedAnalytics().finally(() => setLoading(false))
    }
  }, [position?.poolAddress.toString(), fetchAdvancedAnalytics])

  // Real-time polling
  useEffect(() => {
    if (enableRealtime && position && !loading) {
      const interval = setInterval(() => {
        fetchAdvancedAnalytics()
      }, REFRESH_INTERVALS.analytics)

      return () => clearInterval(interval)
    }
    return undefined
  }, [enableRealtime, position, loading, fetchAdvancedAnalytics])

  return {
    advancedAnalytics,
    loading,
    error,
    refreshAnalytics,
    lastUpdate
  }
}

/**
 * Hook for portfolio-level analytics across multiple positions
 */
export function usePortfolioAnalytics(
  positions: DLMMPosition[] = [],
  enableRealtime: boolean = true
): {
  portfolioAnalytics: PortfolioAnalytics | null
  loading: boolean
  error: string | null
  refreshAnalytics: () => Promise<void>
  lastUpdate: Date | null
} {
  const { isRealDataMode } = useDataSource()
  const [portfolioAnalytics, setPortfolioAnalytics] = useState<PortfolioAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchPortfolioAnalytics = useCallback(async () => {
    if (positions.length === 0) {
      setPortfolioAnalytics(null)
      setError(null)
      return
    }

    try {
      setError(null)
      console.log('🚀 Fetching portfolio analytics for', positions.length, 'positions')

      // Get pool data for all positions
      const poolDataMap = new Map<string, PoolAnalyticsData>()
      await Promise.all(
        positions.map(async (position) => {
          try {
            const poolData = await dlmmClient.getPoolAnalytics(position.poolAddress, isRealDataMode)
            poolDataMap.set(position.poolAddress.toString(), poolData)
          } catch (error) {
            console.warn('Failed to get pool data for', position.poolAddress.toString(), error)
          }
        })
      )

      // Calculate portfolio analytics
      const analytics = await advancedAnalyticsEngine.calculatePortfolioAnalytics(positions, poolDataMap)

      console.log('✅ Portfolio analytics calculated:', {
        totalValue: analytics.totalValue.toFixed(2),
        totalPnL: analytics.totalPnL.toFixed(2),
        diversificationScore: analytics.portfolioRisk.diversificationScore.toFixed(1),
        overallRisk: analytics.portfolioRisk.overallRisk.toFixed(1)
      })

      setPortfolioAnalytics(analytics)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('❌ Error fetching portfolio analytics:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
      setPortfolioAnalytics(null)
    }
  }, [positions, isRealDataMode])

  const refreshAnalytics = useCallback(async () => {
    if (positions.length === 0) return
    setLoading(true)
    try {
      await fetchPortfolioAnalytics()
    } finally {
      setLoading(false)
    }
  }, [fetchPortfolioAnalytics, positions.length])

  // Initial fetch
  useEffect(() => {
    if (positions.length > 0) {
      setLoading(true)
      fetchPortfolioAnalytics().finally(() => setLoading(false))
    }
  }, [positions.length, fetchPortfolioAnalytics])

  // Real-time polling
  useEffect(() => {
    if (enableRealtime && positions.length > 0 && !loading) {
      const interval = setInterval(() => {
        fetchPortfolioAnalytics()
      }, REFRESH_INTERVALS.analytics)

      return () => clearInterval(interval)
    }
    return undefined
  }, [enableRealtime, positions.length, loading, fetchPortfolioAnalytics])

  return {
    portfolioAnalytics,
    loading,
    error,
    refreshAnalytics,
    lastUpdate
  }
}

/**
 * Hook for position health metrics and optimization suggestions
 */
export function usePositionHealth(position?: DLMMPosition): {
  healthMetrics: AdvancedPositionAnalytics['healthMetrics'] | null
  riskMetrics: AdvancedPositionAnalytics['riskMetrics'] | null
  recommendations: string[]
  loading: boolean
  error: string | null
} {
  const { advancedAnalytics, loading, error } = useAdvancedPositionAnalytics(position, false)

  const recommendations = useMemo(() => {
    if (!advancedAnalytics) return []

    const recs: string[] = []
    const { healthMetrics, riskMetrics } = advancedAnalytics

    // Health-based recommendations
    if (healthMetrics.efficiency < 50) {
      recs.push('Consider rebalancing position to improve bin efficiency')
    }
    if (healthMetrics.rebalanceUrgency > 70) {
      recs.push('Position urgently needs rebalancing due to price movement')
    }
    if (healthMetrics.feeOptimization < 60) {
      recs.push('Fee collection could be optimized with better range positioning')
    }
    if (healthMetrics.liquidityUtilization < 40) {
      recs.push('Most liquidity is inactive - consider narrowing price range')
    }

    // Risk-based recommendations
    if (riskMetrics.overallRiskScore > 80) {
      recs.push('High risk position - consider reducing exposure or diversifying')
    }
    if (riskMetrics.volatilityScore > 70) {
      recs.push('High volatility detected - consider wider ranges or reduced position size')
    }
    if (riskMetrics.concentrationRisk > 60) {
      recs.push('Position is highly concentrated - consider spreading across more bins')
    }

    return recs
  }, [advancedAnalytics])

  return {
    healthMetrics: advancedAnalytics?.healthMetrics || null,
    riskMetrics: advancedAnalytics?.riskMetrics || null,
    recommendations,
    loading,
    error
  }
}