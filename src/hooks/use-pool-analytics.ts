'use client'

// Cache buster: HOOK_RELOAD_${Date.now()}

import { useState, useEffect, useCallback, useRef } from 'react'
import { PublicKey } from '@solana/web3.js'
import { dlmmClient } from '@/lib/dlmm/client'
import { REFRESH_INTERVALS } from '@/lib/constants'
import type {
  PoolAnalyticsData,
  PoolMetrics,
  FeeDistribution,
  LiquidityConcentration,
  PoolHistoricalPerformance,
  PoolListItem
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
  console.log('🪝 usePoolAnalytics HOOK CALLED with:', {
    poolAddress: poolAddress?.toString(),
    enableRealtime
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
      console.log('🚨 CACHE BUSTER: fetchAnalytics called at', new Date().toISOString())

      const data = await dlmmClient.getPoolAnalytics(publicKey)

      console.log('✅ Pool analytics fetched successfully:', {
        tvl: data.metrics.tvl,
        volume24h: data.metrics.volume24h,
        apr: data.metrics.apr,
        activeBins: data.metrics.activeBins
      })

      setAnalyticsData(data)
      setLastUpdate(new Date())
    } catch (error) {
      handleError(error, 'Failed to fetch pool analytics')
      setAnalyticsData(null)
    }
  }, [poolAddress, handleError])

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
    console.log('🔍 USEEFFECT DEBUG - poolAddress raw:', poolAddress)
    console.log('🔍 USEEFFECT DEBUG - poolAddress type:', typeof poolAddress)
    console.log('🔍 USEEFFECT DEBUG - poolAddress string:', poolAddress ? (typeof poolAddress === 'string' ? poolAddress : poolAddress.toString()) : 'UNDEFINED')
    console.log('🔍 USEEFFECT DEBUG - hasInitialized:', hasInitialized)

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

        console.log('📞 usePoolAnalytics: About to call dlmmClient.getPoolAnalytics...')
        const data = await dlmmClient.getPoolAnalytics(publicKey)
        console.log('🎯 usePoolAnalytics: getPoolAnalytics returned:', data)

        console.log('✅ usePoolAnalytics: Analytics fetched successfully:', {
          tvl: data.metrics.tvl,
          volume24h: data.metrics.volume24h,
          apr: data.metrics.apr,
          activeBins: data.metrics.activeBins
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
  }, [typeof poolAddress === 'string' ? poolAddress : poolAddress?.toString(), hasInitialized]) // FIXED: Proper string dependency tracking

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

  console.log('🔍 usePoolList hook initialized, pools.length:', pools.length)

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