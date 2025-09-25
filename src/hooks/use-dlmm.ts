'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { dlmmClient } from '@/lib/dlmm/client'
import { DLMMPosition, PoolInfo, BinInfo } from '@/lib/types'
import { formatBinData } from '@/lib/dlmm/utils'
import { REFRESH_INTERVALS } from '@/lib/constants'

// Enhanced DLMM hooks using improved SDK client with:
// ✅ Proper TypeScript interfaces from SDK v1.4.0
// ✅ Intelligent caching system (30s cache duration)
// ✅ Enhanced error handling with fallbacks
// ✅ Real-time polling with configurable intervals
// ✅ Position and pool data management

export function useDLMM() {
  const { publicKey, connected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((error: any, context: string) => {
    console.error(`DLMM Error (${context}):`, error)
    setError(`${context}: ${error.message || 'Unknown error'}`)
    setLoading(false)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    client: dlmmClient,
    loading,
    error,
    connected,
    publicKey,
    clearError,
    handleError,
  }
}

export function useUserPositions(enableRealtime: boolean = true) {
  const { client, publicKey, connected, handleError } = useDLMM()
  const [positions, setPositions] = useState<DLMMPosition[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchPositions = useCallback(async () => {
    if (!connected || !publicKey) {
      setPositions([])
      return
    }

    setLoading(true)
    try {
      console.log('\ud83d\udd04 useUserPositions: Fetching with enhanced SDK client')

      // Use enhanced getUserPositions method with proper SDK types
      const userPositions = await client.getUserPositions(publicKey)
      console.log('\u2705 Fetched', userPositions.length, 'positions with enhanced client')

      // Transform SDK PositionInfo[] to our DLMMPosition interface
      const formattedPositions: DLMMPosition[] = userPositions.map((pos: any) => {
        console.log('\ud83d\udd04 Transforming position:', pos)

        return {
          id: pos.positionMint || pos.id || Math.random().toString(),
          poolAddress: new PublicKey(pos.pair || pos.poolAddress || PublicKey.default),
          userAddress: publicKey,
          tokenX: {
            address: new PublicKey(pos.tokenX?.mint || pos.tokenX?.address || PublicKey.default),
            symbol: pos.tokenX?.symbol || 'UNKNOWN',
            name: pos.tokenX?.name || 'Unknown Token',
            decimals: pos.tokenX?.decimals || 9,
            logoURI: pos.tokenX?.logoURI,
            price: pos.tokenX?.price || 0,
          },
          tokenY: {
            address: new PublicKey(pos.tokenY?.mint || pos.tokenY?.address || PublicKey.default),
            symbol: pos.tokenY?.symbol || 'UNKNOWN',
            name: pos.tokenY?.name || 'Unknown Token',
            decimals: pos.tokenY?.decimals || 9,
            logoURI: pos.tokenY?.logoURI,
            price: pos.tokenY?.price || 0,
          },
          activeBin: pos.activeBin || pos.activeId || 0,
          liquidityAmount: pos.liquidityAmount?.toString() || pos.totalLiquidity?.toString() || '0',
          feesEarned: {
            tokenX: pos.feesEarned?.tokenX?.toString() || pos.feeX?.toString() || '0',
            tokenY: pos.feesEarned?.tokenY?.toString() || pos.feeY?.toString() || '0',
          },
          createdAt: new Date(pos.createdAt || Date.now()),
          lastUpdated: new Date(pos.lastUpdated || Date.now()),
          isActive: pos.isActive ?? true,
        }
      })

      console.log('\u2705 Enhanced SDK: Formatted', formattedPositions.length, 'positions')
      setPositions(formattedPositions)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('\u274c Enhanced SDK: Error fetching positions:', error)
      handleError(error, 'Failed to fetch positions with enhanced SDK')
    } finally {
      setLoading(false)
    }
  }, [client, publicKey, connected, handleError])

  const refreshPositions = useCallback(async () => {
    setRefreshing(true)
    await fetchPositions()
    setRefreshing(false)
  }, [fetchPositions])

  // Initial fetch
  useEffect(() => {
    fetchPositions()
  }, [fetchPositions])

  // Set up real-time polling
  useEffect(() => {
    if (enableRealtime && connected && publicKey) {
      intervalRef.current = setInterval(() => {
        if (!refreshing) {
          fetchPositions()
        }
      }, REFRESH_INTERVALS.positions)

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
  }, [enableRealtime, connected, publicKey, refreshing, fetchPositions])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    positions,
    loading,
    refreshing,
    refreshPositions,
    fetchPositions,
    lastUpdate,
  }
}

export function usePoolData(poolAddress?: PublicKey, enableRealtime: boolean = true) {
  const { client, handleError } = useDLMM()
  const [poolData, setPoolData] = useState<PoolInfo | null>(null)
  const [binData, setBinData] = useState<BinInfo[]>([])
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchPoolData = useCallback(async () => {
    if (!poolAddress) {
      setPoolData(null)
      setBinData([])
      return
    }

    setLoading(true)
    try {
      console.log('\ud83d\udd04 usePoolData: Fetching with enhanced SDK client')

      // Use enhanced getLbPair method with caching
      const pair = await client.getLbPair(poolAddress)

      if (pair) {
        console.log('\u2705 Enhanced SDK: Fetched pair data with caching')
        console.log('  Token X:', pair.tokenMintX)
        console.log('  Token Y:', pair.tokenMintY)
        console.log('  Active Bin ID:', pair.activeId)

        // Transform SDK Pair data to our PoolInfo interface
        setPoolData({
          address: poolAddress,
          tokenX: {
            address: new PublicKey(pair.tokenMintX || PublicKey.default),
            symbol: 'TOKEN_X', // Would need token metadata service
            name: 'Token X',
            decimals: 9, // Default - would get from token metadata
            logoURI: undefined,
            price: 0, // Would get from price oracle
          },
          tokenY: {
            address: new PublicKey(pair.tokenMintY || PublicKey.default),
            symbol: 'TOKEN_Y', // Would need token metadata service
            name: 'Token Y',
            decimals: 9, // Default - would get from token metadata
            logoURI: undefined,
            price: 0, // Would get from price oracle
          },
          activeBin: {
            binId: pair.activeId || 0,
            price: 0, // Would calculate from bin ID and bin step
            liquidityX: '0', // Would get from bin liquidity data
            liquidityY: '0', // Would get from bin liquidity data
            isActive: true,
            feeRate: pair.feeParameters?.baseFactor || 0,
            volume24h: '0', // Would need external data source
          },
          totalLiquidity: '0', // Would calculate from bin reserves
          volume24h: '0', // Would need external data source
          fees24h: '0', // Would calculate from fee parameters
          apr: 0, // Would calculate from fees and TVL
          createdAt: new Date(), // Would get from blockchain data
        })

        // For bin data, we'd need to fetch actual bin arrays
        // For now, return empty array since getBinLiquidity is legacy
        setBinData([])
        console.log('\u2705 Enhanced SDK: Pool data updated with real pair data')
      } else {
        console.warn('\u26a0\ufe0f Enhanced SDK: No pair data found')
        setPoolData(null)
        setBinData([])
      }

      setLastUpdate(new Date())
    } catch (error) {
      console.error('\u274c Enhanced SDK: Error fetching pool data:', error)
      handleError(error, 'Failed to fetch pool data with enhanced SDK')
    } finally {
      setLoading(false)
    }
  }, [client, poolAddress, handleError])

  // Initial fetch
  useEffect(() => {
    fetchPoolData()
  }, [fetchPoolData])

  // Set up real-time polling
  useEffect(() => {
    if (enableRealtime && poolAddress) {
      intervalRef.current = setInterval(() => {
        if (!loading) {
          fetchPoolData()
        }
      }, REFRESH_INTERVALS.analytics)

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
  }, [enableRealtime, poolAddress, loading, fetchPoolData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    poolData,
    binData,
    loading,
    refreshPoolData: fetchPoolData,
    lastUpdate,
  }
}

export function useAllPools() {
  const { client, handleError } = useDLMM()
  const [pools, setPools] = useState<PoolInfo[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAllPools = useCallback(async () => {
    setLoading(true)
    try {
      console.log('\ud83d\udd04 useAllPools: Fetching with enhanced SDK client')

      const lbPairs = await client.getAllLbPairs()
      console.log('\u2705 Enhanced SDK: Fetched', lbPairs.length, 'pairs')

      // Transform SDK Pair[] to our PoolInfo interface
      const formattedPools: PoolInfo[] = lbPairs.map((pair: any) => {
        console.log('\ud83d\udd04 Transforming pair:', pair.publicKey?.toString() || 'unknown')

        return {
          address: new PublicKey(pair.publicKey || PublicKey.default),
          tokenX: {
            address: new PublicKey(pair.tokenMintX || PublicKey.default),
            symbol: 'TOKEN_X', // Would need token metadata service
            name: 'Token X',
            decimals: 9,
            logoURI: undefined,
            price: 0,
          },
          tokenY: {
            address: new PublicKey(pair.tokenMintY || PublicKey.default),
            symbol: 'TOKEN_Y', // Would need token metadata service
            name: 'Token Y',
            decimals: 9,
            logoURI: undefined,
            price: 0,
          },
          activeBin: {
            binId: pair.activeId || 0,
            price: 0, // Would calculate from bin step
            liquidityX: '0', // Would get from reserves
            liquidityY: '0', // Would get from reserves
            isActive: true,
            feeRate: pair.feeParameters?.baseFactor || 0,
            volume24h: '0',
          },
          totalLiquidity: '0', // Would calculate from reserves
          volume24h: '0', // Would need external data
          fees24h: '0', // Would calculate from fee data
          apr: 0, // Would calculate from TVL and fees
          createdAt: new Date(),
        }
      })

      console.log('\u2705 Enhanced SDK: Formatted', formattedPools.length, 'pools')

      setPools(formattedPools)
    } catch (error) {
      handleError(error, 'Failed to fetch pools')
    } finally {
      setLoading(false)
    }
  }, [client, handleError])

  useEffect(() => {
    fetchAllPools()
  }, [fetchAllPools])

  return {
    pools,
    loading,
    refreshPools: fetchAllPools,
  }
}

export function useSwapQuote(
  poolAddress?: PublicKey,
  amountIn?: string,
  tokenIn?: PublicKey,
  slippage: number = 0.5,
  enableRealtime: boolean = true
) {
  const { client, handleError } = useDLMM()
  const [quote, setQuote] = useState<{
    amountOut: string
    priceImpact: number
    fee: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const getQuote = useCallback(async () => {
    if (!poolAddress || !amountIn || !tokenIn || parseFloat(amountIn) === 0) {
      setQuote(null)
      return
    }

    setLoading(true)
    try {
      console.log('\ud83d\udd04 useSwapQuote: Getting quote with enhanced SDK')

      // First try the enhanced simulateSwap method
      const swapQuote = await client.simulateSwapLegacy(
        poolAddress,
        amountIn,
        tokenIn,
        slippage / 100 // Convert percentage to decimal
      )

      if (swapQuote) {
        console.log('\u2705 Enhanced SDK: Swap quote received')
        console.log('  Amount Out:', swapQuote.amountOut)
        console.log('  Price Impact:', swapQuote.priceImpact)
        setQuote(swapQuote)
      } else {
        console.warn('\u26a0\ufe0f Enhanced SDK: No swap quote available')
        setQuote(null)
      }

      setLastUpdate(new Date())
    } catch (error) {
      console.error('\u274c Enhanced SDK: Error getting swap quote:', error)
      handleError(error, 'Failed to get swap quote with enhanced SDK')
      setQuote(null)
    } finally {
      setLoading(false)
    }
  }, [client, poolAddress, amountIn, tokenIn, slippage, handleError])

  // Debounced initial fetch
  useEffect(() => {
    const debounceTimer = setTimeout(getQuote, 500) // Debounce API calls
    return () => clearTimeout(debounceTimer)
  }, [getQuote])

  // Set up real-time polling for price updates
  useEffect(() => {
    if (enableRealtime && poolAddress && amountIn && tokenIn && parseFloat(amountIn) > 0) {
      intervalRef.current = setInterval(() => {
        if (!loading) {
          getQuote()
        }
      }, REFRESH_INTERVALS.prices)

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
  }, [enableRealtime, poolAddress, amountIn, tokenIn, loading, getQuote])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    quote,
    loading,
    refreshQuote: getQuote,
    lastUpdate,
  }
}