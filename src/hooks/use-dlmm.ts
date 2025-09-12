'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { dlmmClient } from '@/lib/dlmm/client'
import { DLMMPosition, PoolInfo, BinInfo } from '@/lib/types'
import { formatBinData } from '@/lib/dlmm/utils'

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

export function useUserPositions() {
  const { client, publicKey, connected, handleError } = useDLMM()
  const [positions, setPositions] = useState<DLMMPosition[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchPositions = useCallback(async () => {
    if (!connected || !publicKey) {
      setPositions([])
      return
    }

    setLoading(true)
    try {
      const userPositions = await client.getUserPositions(publicKey)
      // Transform SDK data to our interface
      const formattedPositions: DLMMPosition[] = userPositions.map((pos: any) => ({
        id: pos.id || Math.random().toString(),
        poolAddress: new PublicKey(pos.poolAddress || PublicKey.default),
        userAddress: publicKey,
        tokenX: {
          address: new PublicKey(pos.tokenX?.address || PublicKey.default),
          symbol: pos.tokenX?.symbol || 'UNKNOWN',
          name: pos.tokenX?.name || 'Unknown Token',
          decimals: pos.tokenX?.decimals || 9,
          logoURI: pos.tokenX?.logoURI,
          price: pos.tokenX?.price || 0,
        },
        tokenY: {
          address: new PublicKey(pos.tokenY?.address || PublicKey.default),
          symbol: pos.tokenY?.symbol || 'UNKNOWN',
          name: pos.tokenY?.name || 'Unknown Token',
          decimals: pos.tokenY?.decimals || 9,
          logoURI: pos.tokenY?.logoURI,
          price: pos.tokenY?.price || 0,
        },
        activeBin: pos.activeBin || 0,
        liquidityAmount: pos.liquidityAmount || '0',
        feesEarned: {
          tokenX: pos.feesEarned?.tokenX || '0',
          tokenY: pos.feesEarned?.tokenY || '0',
        },
        createdAt: new Date(pos.createdAt || Date.now()),
        lastUpdated: new Date(pos.lastUpdated || Date.now()),
        isActive: pos.isActive ?? true,
      }))
      
      setPositions(formattedPositions)
    } catch (error) {
      handleError(error, 'Failed to fetch positions')
    } finally {
      setLoading(false)
    }
  }, [client, publicKey, connected, handleError])

  const refreshPositions = useCallback(async () => {
    setRefreshing(true)
    await fetchPositions()
    setRefreshing(false)
  }, [fetchPositions])

  useEffect(() => {
    fetchPositions()
  }, [fetchPositions])

  return {
    positions,
    loading,
    refreshing,
    refreshPositions,
    fetchPositions,
  }
}

export function usePoolData(poolAddress?: PublicKey) {
  const { client, handleError } = useDLMM()
  const [poolData, setPoolData] = useState<PoolInfo | null>(null)
  const [binData, setBinData] = useState<BinInfo[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPoolData = useCallback(async () => {
    if (!poolAddress) {
      setPoolData(null)
      setBinData([])
      return
    }

    setLoading(true)
    try {
      const [pair, bins] = await Promise.all([
        client.getLbPair(poolAddress),
        client.getBinLiquidity(poolAddress),
      ])

      if (pair) {
        // Transform pair data to our interface
        setPoolData({
          address: poolAddress,
          tokenX: {
            address: new PublicKey(pair.tokenX?.mint || PublicKey.default),
            symbol: pair.tokenX?.symbol || 'UNKNOWN',
            name: pair.tokenX?.name || 'Unknown Token',
            decimals: pair.tokenX?.decimals || 9,
            logoURI: pair.tokenX?.logoURI,
            price: pair.tokenX?.price || 0,
          },
          tokenY: {
            address: new PublicKey(pair.tokenY?.mint || PublicKey.default),
            symbol: pair.tokenY?.symbol || 'UNKNOWN',
            name: pair.tokenY?.name || 'Unknown Token',
            decimals: pair.tokenY?.decimals || 9,
            logoURI: pair.tokenY?.logoURI,
            price: pair.tokenY?.price || 0,
          },
          activeBin: {
            binId: pair.activeBin?.binId || 0,
            price: pair.activeBin?.price || 0,
            liquidityX: pair.activeBin?.reserveX || '0',
            liquidityY: pair.activeBin?.reserveY || '0',
            isActive: true,
            feeRate: pair.activeBin?.feeRate || 0,
            volume24h: pair.activeBin?.volume24h || '0',
          },
          totalLiquidity: pair.totalLiquidity || '0',
          volume24h: pair.volume24h || '0',
          fees24h: pair.fees24h || '0',
          apr: pair.apr || 0,
          createdAt: new Date(pair.createdAt || Date.now()),
        })

        setBinData(formatBinData(bins))
      }
    } catch (error) {
      handleError(error, 'Failed to fetch pool data')
    } finally {
      setLoading(false)
    }
  }, [client, poolAddress, handleError])

  useEffect(() => {
    fetchPoolData()
  }, [fetchPoolData])

  return {
    poolData,
    binData,
    loading,
    refreshPoolData: fetchPoolData,
  }
}

export function useAllPools() {
  const { client, handleError } = useDLMM()
  const [pools, setPools] = useState<PoolInfo[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAllPools = useCallback(async () => {
    setLoading(true)
    try {
      const lbPairs = await client.getAllLbPairs()
      
      // Transform pairs to our interface
      const formattedPools: PoolInfo[] = lbPairs.map((pair: any) => ({
        address: new PublicKey(pair.publicKey || PublicKey.default),
        tokenX: {
          address: new PublicKey(pair.tokenX?.mint || PublicKey.default),
          symbol: pair.tokenX?.symbol || 'UNKNOWN',
          name: pair.tokenX?.name || 'Unknown Token',
          decimals: pair.tokenX?.decimals || 9,
          logoURI: pair.tokenX?.logoURI,
          price: pair.tokenX?.price || 0,
        },
        tokenY: {
          address: new PublicKey(pair.tokenY?.mint || PublicKey.default),
          symbol: pair.tokenY?.symbol || 'UNKNOWN',
          name: pair.tokenY?.name || 'Unknown Token',
          decimals: pair.tokenY?.decimals || 9,
          logoURI: pair.tokenY?.logoURI,
          price: pair.tokenY?.price || 0,
        },
        activeBin: {
          binId: pair.activeBin?.binId || 0,
          price: pair.activeBin?.price || 0,
          liquidityX: pair.activeBin?.reserveX || '0',
          liquidityY: pair.activeBin?.reserveY || '0',
          isActive: true,
          feeRate: pair.activeBin?.feeRate || 0,
          volume24h: pair.activeBin?.volume24h || '0',
        },
        totalLiquidity: pair.totalLiquidity || '0',
        volume24h: pair.volume24h || '0',
        fees24h: pair.fees24h || '0',
        apr: pair.apr || 0,
        createdAt: new Date(pair.createdAt || Date.now()),
      }))

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
  slippage: number = 0.5
) {
  const { client, handleError } = useDLMM()
  const [quote, setQuote] = useState<{
    amountOut: string
    priceImpact: number
    fee: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const getQuote = useCallback(async () => {
    if (!poolAddress || !amountIn || !tokenIn || parseFloat(amountIn) === 0) {
      setQuote(null)
      return
    }

    setLoading(true)
    try {
      const swapQuote = await client.simulateSwap(
        poolAddress,
        amountIn,
        tokenIn,
        slippage
      )
      setQuote(swapQuote)
    } catch (error) {
      handleError(error, 'Failed to get swap quote')
      setQuote(null)
    } finally {
      setLoading(false)
    }
  }, [client, poolAddress, amountIn, tokenIn, slippage, handleError])

  useEffect(() => {
    const debounceTimer = setTimeout(getQuote, 500) // Debounce API calls
    return () => clearTimeout(debounceTimer)
  }, [getQuote])

  return {
    quote,
    loading,
    refreshQuote: getQuote,
  }
}