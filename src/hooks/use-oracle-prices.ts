'use client'

// Oracle Price Feeds Hooks
// 🔮 React hooks for real-time price data integration with DLMM positions

import { useState, useEffect, useCallback, useRef } from 'react'
import { oraclePriceFeeds, type PriceData } from '@/lib/oracle/price-feeds'
import { REFRESH_INTERVALS } from '@/lib/constants'

/**
 * Hook for single token price with real-time updates
 */
export function useTokenPrice(
  symbol?: string,
  enableRealtime: boolean = true
) {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchPrice = useCallback(async () => {
    if (!symbol) {
      setPriceData(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // logger.debug('🔮 Oracle: Fetching price for', symbol)

      const price = await oraclePriceFeeds.getTokenPrice(symbol)

      console.log('✅ Oracle: Price fetched:', {
        symbol: price.symbol,
        price: price.price,
        source: price.source,
        confidence: (price.confidence * 100).toFixed(1) + '%'
      })

      setPriceData(price)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('❌ Oracle: Error fetching price:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch price')
      setPriceData(null)
    } finally {
      setLoading(false)
    }
  }, [symbol])

  // Initial fetch
  useEffect(() => {
    fetchPrice()
  }, [fetchPrice])

  // Real-time polling
  useEffect(() => {
    if (enableRealtime && symbol && !loading) {
      intervalRef.current = setInterval(() => {
        fetchPrice()
      }, REFRESH_INTERVALS.prices) // 30 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }

    // Return undefined for the else case to satisfy TS7030
    return undefined
  }, [enableRealtime, symbol, loading, fetchPrice])

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    priceData,
    loading,
    error,
    lastUpdate,
    refreshPrice: fetchPrice
  }
}

/**
 * Hook for multiple token prices
 */
export function useMultipleTokenPrices(
  symbols: string[] = [],
  enableRealtime: boolean = true
) {
  const [priceData, setPriceData] = useState<Record<string, PriceData>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchPrices = useCallback(async () => {
    if (symbols.length === 0) {
      setPriceData({})
      return
    }

    setLoading(true)
    setError(null)

    try {
      // logger.debug('🔮 Oracle: Fetching prices for multiple tokens:', symbols)

      const prices = await oraclePriceFeeds.getMultipleTokenPrices(symbols)

      console.log('✅ Oracle: Multiple prices fetched:', {
        count: Object.keys(prices).length,
        symbols: Object.keys(prices)
      })

      setPriceData(prices)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('❌ Oracle: Error fetching multiple prices:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch prices')
      setPriceData({})
    } finally {
      setLoading(false)
    }
  }, [symbols])

  // Initial fetch
  useEffect(() => {
    fetchPrices()
  }, [fetchPrices])

  // Real-time polling
  useEffect(() => {
    if (enableRealtime && symbols.length > 0 && !loading) {
      intervalRef.current = setInterval(() => {
        fetchPrices()
      }, REFRESH_INTERVALS.prices) // 30 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }

    // Return undefined for the else case to satisfy TS7030
    return undefined
  }, [enableRealtime, symbols.length, loading, fetchPrices])

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    priceData,
    loading,
    error,
    lastUpdate,
    refreshPrices: fetchPrices
  }
}

/**
 * Hook for enhanced position valuation using oracle prices
 */
export function usePositionValuation(
  tokenXSymbol?: string,
  tokenYSymbol?: string,
  tokenXAmount?: string,
  tokenYAmount?: string,
  enableRealtime: boolean = true
) {
  const [valuation, setValuation] = useState<{
    totalValue: number
    tokenXValue: number
    tokenYValue: number
    priceData: Record<string, PriceData>
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const calculateValuation = useCallback(async () => {
    if (!tokenXSymbol || !tokenYSymbol || !tokenXAmount || !tokenYAmount) {
      setValuation(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('💰 Oracle: Calculating position valuation for', `${tokenXSymbol}/${tokenYSymbol}`)

      const valuationData = await oraclePriceFeeds.getPositionValue(
        tokenXSymbol,
        tokenYSymbol,
        tokenXAmount,
        tokenYAmount
      )

      console.log('✅ Oracle: Valuation calculated:', {
        totalValue: valuationData.totalValue.toFixed(2),
        tokenXValue: valuationData.tokenXValue.toFixed(2),
        tokenYValue: valuationData.tokenYValue.toFixed(2)
      })

      setValuation(valuationData)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('❌ Oracle: Error calculating valuation:', err)
      setError(err instanceof Error ? err.message : 'Failed to calculate position valuation')
      setValuation(null)
    } finally {
      setLoading(false)
    }
  }, [tokenXSymbol, tokenYSymbol, tokenXAmount, tokenYAmount])

  // Initial calculation
  useEffect(() => {
    calculateValuation()
  }, [calculateValuation])

  // Real-time updates
  useEffect(() => {
    if (enableRealtime && tokenXSymbol && tokenYSymbol && !loading) {
      intervalRef.current = setInterval(() => {
        calculateValuation()
      }, REFRESH_INTERVALS.prices) // 30 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }

    // Return undefined for the else case to satisfy TS7030
    return undefined
  }, [enableRealtime, tokenXSymbol, tokenYSymbol, loading, calculateValuation])

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    valuation,
    loading,
    error,
    lastUpdate,
    refreshValuation: calculateValuation
  }
}

/**
 * Hook for supported tokens and oracle cache management
 */
export function useOracleCache() {
  const [cacheStats, setCacheStats] = useState(oraclePriceFeeds.getCacheStats())
  const [supportedTokens] = useState(oraclePriceFeeds.getSupportedTokens())

  const refreshCacheStats = useCallback(() => {
    setCacheStats(oraclePriceFeeds.getCacheStats())
  }, [])

  const clearCache = useCallback(() => {
    console.log('🧹 Oracle: Manual cache clear')
    oraclePriceFeeds.clearPriceCache()
    refreshCacheStats()
  }, [refreshCacheStats])

  // Refresh cache stats every 15 seconds
  useEffect(() => {
    const interval = setInterval(refreshCacheStats, 15000)
    return () => clearInterval(interval)
  }, [refreshCacheStats])

  return {
    cacheStats,
    supportedTokens,
    refreshCacheStats,
    clearCache
  }
}

/**
 * Combined hook for comprehensive price data management
 */
export function useComprehensivePriceData(
  symbols: string[] = [],
  enableRealtime: boolean = true
) {
  const { priceData, loading: pricesLoading, error: pricesError } = useMultipleTokenPrices(symbols, enableRealtime)
  const { cacheStats, supportedTokens } = useOracleCache()

  const loading = pricesLoading
  const error = pricesError

  return {
    priceData,
    cacheStats,
    supportedTokens,
    loading,
    error,
    hasData: Object.keys(priceData).length > 0
  }
}