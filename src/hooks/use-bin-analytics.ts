'use client'

// Enhanced Bin Analytics Hooks
// 🚀 Advanced bin data operations with intelligent caching and real-time analysis

import { useState, useEffect, useCallback, useRef } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { advancedBinOperations, type AdvancedBinAnalysis, type BinLiquidityMetrics } from '@/lib/dlmm/bin-operations'
import { REFRESH_INTERVALS } from '@/lib/constants'

/**
 * Enhanced hook for comprehensive bin analysis
 */
export function useAdvancedBinAnalysis(
  poolAddress?: PublicKey | string,
  enableRealtime: boolean = true
) {
  const { publicKey } = useWallet()
  const [analysis, setAnalysis] = useState<AdvancedBinAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAnalysis = useCallback(async () => {
    if (!poolAddress) {
      setAnalysis(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const poolPubkey = typeof poolAddress === 'string' ? new PublicKey(poolAddress) : poolAddress

      console.log('🔄 Enhanced Bin Analysis: Fetching for pool:', poolPubkey.toString())

      const analysisData = await advancedBinOperations.getAdvancedBinAnalysis(
        poolPubkey,
        publicKey || undefined
      )

      console.log('✅ Enhanced Bin Analysis: Complete:', {
        activeBins: analysisData.activeBins.length,
        recommendations: analysisData.recommendedBins.length,
        concentration: (analysisData.liquidityDistribution.concentrated * 100).toFixed(1) + '%'
      })

      setAnalysis(analysisData)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('❌ Enhanced Bin Analysis: Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch bin analysis')
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }, [poolAddress, publicKey])

  // Initial fetch
  useEffect(() => {
    fetchAnalysis()
  }, [fetchAnalysis])

  // Real-time polling
  useEffect(() => {
    if (enableRealtime && poolAddress && !loading) {
      intervalRef.current = setInterval(() => {
        fetchAnalysis()
      }, REFRESH_INTERVALS.analytics) // 60 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }

    // Return undefined for the else case to satisfy TS7030
    return undefined
  }, [enableRealtime, poolAddress, loading, fetchAnalysis])

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    analysis,
    loading,
    error,
    lastUpdate,
    refreshAnalysis: fetchAnalysis
  }
}

/**
 * Enhanced hook for bin liquidity metrics
 */
export function useBinLiquidityMetrics(
  poolAddress?: PublicKey | string,
  enableRealtime: boolean = true
) {
  const { publicKey } = useWallet()
  const [metrics, setMetrics] = useState<BinLiquidityMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchMetrics = useCallback(async () => {
    if (!poolAddress) {
      setMetrics(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const poolPubkey = typeof poolAddress === 'string' ? new PublicKey(poolAddress) : poolAddress

      console.log('🔄 Bin Metrics: Fetching for pool:', poolPubkey.toString())

      const metricsData = await advancedBinOperations.getBinLiquidityMetrics(
        poolPubkey,
        publicKey || undefined
      )

      console.log('✅ Bin Metrics: Complete:', {
        totalLiquidity: metricsData.totalLiquidity,
        activeBins: metricsData.activeBinCount,
        utilization: (metricsData.utilizationRate * 100).toFixed(1) + '%'
      })

      setMetrics(metricsData)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('❌ Bin Metrics: Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch bin metrics')
      setMetrics(null)
    } finally {
      setLoading(false)
    }
  }, [poolAddress, publicKey])

  // Initial fetch
  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  // Real-time polling
  useEffect(() => {
    if (enableRealtime && poolAddress && !loading) {
      intervalRef.current = setInterval(() => {
        fetchMetrics()
      }, REFRESH_INTERVALS.prices) // 30 seconds for metrics

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }

    // Return undefined for the else case to satisfy TS7030
    return undefined
  }, [enableRealtime, poolAddress, loading, fetchMetrics])

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    metrics,
    loading,
    error,
    lastUpdate,
    refreshMetrics: fetchMetrics
  }
}

/**
 * Enhanced hook for individual bin array information
 */
export function useBinArrayInfo(
  poolAddress?: PublicKey | string,
  binArrayIndex?: number,
  _enableRealtime: boolean = false
) {
  const { publicKey } = useWallet()
  const [binArrayInfo, setBinArrayInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBinArrayInfo = useCallback(async () => {
    if (!poolAddress || binArrayIndex === undefined || !publicKey) {
      setBinArrayInfo(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const poolPubkey = typeof poolAddress === 'string' ? new PublicKey(poolAddress) : poolAddress

      console.log('🔄 Bin Array Info: Fetching for:', {
        pool: poolPubkey.toString(),
        index: binArrayIndex
      })

      const info = await advancedBinOperations.getEnhancedBinArrayInfo(
        poolPubkey,
        binArrayIndex,
        publicKey
      )

      console.log('✅ Bin Array Info: Retrieved successfully')
      setBinArrayInfo(info)
    } catch (err) {
      console.error('❌ Bin Array Info: Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch bin array info')
      setBinArrayInfo(null)
    } finally {
      setLoading(false)
    }
  }, [poolAddress, binArrayIndex, publicKey])

  // Fetch when parameters change
  useEffect(() => {
    fetchBinArrayInfo()
  }, [fetchBinArrayInfo])

  return {
    binArrayInfo,
    loading,
    error,
    refreshBinArrayInfo: fetchBinArrayInfo
  }
}

/**
 * Enhanced hook for bin reserves information
 */
export function useBinReserves(
  positionAddress?: PublicKey | string,
  poolAddress?: PublicKey | string,
  _enableRealtime: boolean = false
) {
  const { publicKey } = useWallet()
  const [reserves, setReserves] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBinReserves = useCallback(async () => {
    if (!positionAddress || !poolAddress || !publicKey) {
      setReserves([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const positionPubkey = typeof positionAddress === 'string' ? new PublicKey(positionAddress) : positionAddress
      const poolPubkey = typeof poolAddress === 'string' ? new PublicKey(poolAddress) : poolAddress

      console.log('🔄 Bin Reserves: Fetching for position:', positionPubkey.toString())

      const reserveData = await advancedBinOperations.getEnhancedBinReserves(
        positionPubkey,
        poolPubkey,
        publicKey
      )

      console.log('✅ Bin Reserves: Retrieved', reserveData.length, 'bins')
      setReserves(reserveData)
    } catch (err) {
      console.error('❌ Bin Reserves: Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch bin reserves')
      setReserves([])
    } finally {
      setLoading(false)
    }
  }, [positionAddress, poolAddress, publicKey])

  // Fetch when parameters change
  useEffect(() => {
    fetchBinReserves()
  }, [fetchBinReserves])

  return {
    reserves,
    loading,
    error,
    refreshBinReserves: fetchBinReserves
  }
}

/**
 * Cache management hook for bin operations
 */
export function useBinCacheManagement() {
  const [cacheStats, setCacheStats] = useState(advancedBinOperations.getCacheStats())

  const refreshCacheStats = useCallback(() => {
    setCacheStats(advancedBinOperations.getCacheStats())
  }, [])

  const invalidateCache = useCallback((type?: 'analysis' | 'metrics' | 'all') => {
    console.log('🧹 Manual cache invalidation:', type || 'all')
    advancedBinOperations.invalidateCache(type)
    refreshCacheStats()
  }, [refreshCacheStats])

  // Refresh cache stats every 10 seconds
  useEffect(() => {
    const interval = setInterval(refreshCacheStats, 10000)
    return () => clearInterval(interval)
  }, [refreshCacheStats])

  return {
    cacheStats,
    refreshCacheStats,
    invalidateCache
  }
}

/**
 * Combined hook for comprehensive bin data
 */
export function useComprehensiveBinData(
  poolAddress?: PublicKey | string,
  enableRealtime: boolean = true
) {
  const { analysis, loading: analysisLoading, error: analysisError } = useAdvancedBinAnalysis(poolAddress, enableRealtime)
  const { metrics, loading: metricsLoading, error: metricsError } = useBinLiquidityMetrics(poolAddress, enableRealtime)
  const { cacheStats } = useBinCacheManagement()

  const loading = analysisLoading || metricsLoading
  const error = analysisError || metricsError

  return {
    analysis,
    metrics,
    cacheStats,
    loading,
    error,
    hasData: !!(analysis && metrics)
  }
}