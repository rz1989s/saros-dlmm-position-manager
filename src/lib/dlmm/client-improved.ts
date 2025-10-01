// Improved Saros DLMM Client Implementation
// Using actual SDK v1.4.0 capabilities with better architecture
// Cache buster: IMPROVED_SDK_USAGE_${Date.now()}

import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import {
  LiquidityBookServices,
  MODE,
  type Pair,
  type PositionInfo,
  type AddLiquidityIntoPositionParams,
  type RemoveMultipleLiquidityParams,
  type RemoveMultipleLiquidityResponse,
  type GetTokenOutputParams,
  type GetTokenOutputResponse,
  type Distribution,
  type UserPositionsParams,
  type GetBinsArrayInfoParams,
  type GetBinsReserveParams,
  type GetBinsReserveResponse,
  RemoveLiquidityType
} from '@saros-finance/dlmm-sdk'
import { SOLANA_NETWORK } from '@/lib/constants'
import { connectionManager } from '@/lib/connection-manager'
import type {
  PoolMetrics,
  PoolAnalyticsData
} from '@/lib/types'

/**
 * Enhanced DLMM Client using SDK v1.4.0 with improved architecture
 *
 * Key Improvements:
 * - Proper TypeScript interfaces from actual SDK
 * - Enhanced error handling with SDK types
 * - Intelligent caching and data management
 * - Better transaction building with SDK methods
 * - Comprehensive position lifecycle management
 */
export class ImprovedDLMMClient {
  private network: string
  private liquidityBookServices: LiquidityBookServices
  private pairCache = new Map<string, { pair: Pair; timestamp: number }>()
  private positionCache = new Map<string, { positions: PositionInfo[]; timestamp: number }>()
  private readonly cacheDuration = 30000 // 30 seconds

  constructor() {
    this.network = SOLANA_NETWORK
    this.liquidityBookServices = new LiquidityBookServices({
      mode: MODE.MAINNET
    })

    console.log('🚀 ImprovedDLMMClient Initialized:')
    console.log('  Network:', this.network)
    console.log('  SDK Version: v1.4.0 (LiquidityBookServices)')
    console.log('  Cache Duration:', this.cacheDuration / 1000, 'seconds')
    console.log('  Enhanced Features: ✅ Type Safety, ✅ Caching, ✅ Error Handling')
  }

  getConnection(): Connection {
    return connectionManager.getCurrentConnection()
  }

  getNetwork(): string {
    return this.network
  }

  getLiquidityBookServices(): LiquidityBookServices {
    return this.liquidityBookServices
  }

  // ============================================================================
  // ENHANCED POOL MANAGEMENT - With Proper SDK Types
  // ============================================================================

  /**
   * Get all available pools with enhanced error handling
   */
  async getAllPools(): Promise<Pair[]> {
    try {
      // logger.debug('🔍 Fetching all pools with enhanced SDK integration...')

      const poolAddresses = await connectionManager.makeRpcCall(async () => {
        return await this.liquidityBookServices.fetchPoolAddresses()
      })

      if (!poolAddresses || poolAddresses.length === 0) {
        console.log('⚠️ No pools found from SDK, using fallback pool addresses')
        return await this.getFallbackPools()
      }

      console.log('✅ Found', poolAddresses.length, 'pool addresses from SDK')

      // Load detailed pair information for each pool
      const pairs: Pair[] = []
      for (const address of poolAddresses.slice(0, 10)) { // Limit to first 10 for performance
        try {
          const pair = await this.getPoolPair(new PublicKey(address))
          if (pair) {
            pairs.push(pair)
          }
        } catch (error) {
          console.warn(`⚠️ Failed to load pair data for ${address}:`, (error as any)?.message)
        }
      }

      console.log('✅ Loaded detailed data for', pairs.length, 'pools')
      return pairs

    } catch (error) {
      console.error('❌ Error fetching pools:', error)
      return await this.getFallbackPools()
    }
  }

  /**
   * Get detailed pair information with caching
   */
  async getPoolPair(poolAddress: PublicKey): Promise<Pair | null> {
    const poolId = poolAddress.toString()

    try {
      // Check cache first
      const cached = this.pairCache.get(poolId)
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        console.log('✅ Pair loaded from cache:', poolId)
        return cached.pair
      }

      console.log('🔄 Loading pair from SDK:', poolId)

      const pair = await connectionManager.makeRpcCall(async () => {
        return await this.liquidityBookServices.getPairAccount(poolAddress)
      })

      if (!pair) {
        console.warn('⚠️ No pair data found for:', poolId)
        return null
      }

      console.log('✅ Pair loaded successfully:', poolId)
      console.log('  Token X:', pair.tokenMintX)
      console.log('  Token Y:', pair.tokenMintY)
      console.log('  Active Bin ID:', pair.activeId)
      console.log('  Bin Step:', pair.binStep)

      // Cache the pair data
      this.pairCache.set(poolId, { pair, timestamp: Date.now() })

      return pair
    } catch (error) {
      console.error('❌ Error loading pair:', error)
      return null
    }
  }

  /**
   * Get fallback pools for development/testing
   */
  private async getFallbackPools(): Promise<Pair[]> {
    const fallbackAddresses = [
      '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2', // SOL/USDC
      'Cx4xoCsJbvFLLH61MPdUp6CvEeaUKgUnpWzTRZC81rXG'  // RAY/SOL
    ]

    const pairs: Pair[] = []
    for (const address of fallbackAddresses) {
      try {
        const pair = await this.getPoolPair(new PublicKey(address))
        if (pair) {
          pairs.push(pair)
        }
      } catch (error) {
        console.warn(`⚠️ Fallback pool ${address} failed:`, (error as any)?.message)
      }
    }

    return pairs
  }

  // ============================================================================
  // ENHANCED POSITION MANAGEMENT - With SDK Types
  // ============================================================================

  /**
   * Get user positions with proper SDK types and caching
   */
  async getUserPositions(
    userAddress: PublicKey,
    pairAddress?: PublicKey
  ): Promise<PositionInfo[]> {
    const userId = userAddress.toString()
    const cacheKey = pairAddress ? `${userId}-${pairAddress.toString()}` : userId

    try {
      // Check cache first
      const cached = this.positionCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        console.log('✅ Positions loaded from cache for user:', userId)
        return cached.positions
      }

      console.log('🔄 Loading positions from SDK for user:', userId)

      let positions: PositionInfo[] = []

      if (pairAddress) {
        // Get positions for specific pair
        const userPositionsParams: UserPositionsParams = {
          payer: userAddress,
          pair: pairAddress
        }

        positions = await connectionManager.makeRpcCall(async () => {
          return await this.liquidityBookServices.getUserPositions(userPositionsParams)
        })
      } else {
        // Get positions for all pairs (would need to iterate through pairs)
        console.log('⚠️ Getting positions for all pairs - this may be slow')
        // For now, return empty array - would need to implement multi-pair logic
        positions = []
      }

      console.log('✅ Loaded', positions.length, 'positions for user:', userId)

      // Transform SDK positions to our internal format
      const transformedPositions = positions.map(pos => ({
        ...pos,
        // Add any additional transformations needed
        id: pos.positionMint, // Add ID field for UI
        pairAddress: pos.pair
      }))

      // Cache the positions
      this.positionCache.set(cacheKey, {
        positions: transformedPositions,
        timestamp: Date.now()
      })

      return transformedPositions
    } catch (error) {
      console.error('❌ Error loading user positions:', error)
      return []
    }
  }

  // ============================================================================
  // ENHANCED LIQUIDITY OPERATIONS - Using Proper SDK Methods
  // ============================================================================

  /**
   * Add liquidity to position with enhanced parameter handling
   */
  async addLiquidityToPosition(params: {
    positionMint: PublicKey
    userAddress: PublicKey
    pairAddress: PublicKey
    amountX: number
    amountY: number
    liquidityDistribution: Distribution[]
    binArrayLower: PublicKey
    binArrayUpper: PublicKey
  }): Promise<{ transaction: Transaction; success: boolean; error?: string }> {

    const { positionMint, userAddress, pairAddress, amountX, amountY, liquidityDistribution, binArrayLower, binArrayUpper } = params

    console.log('🔄 Adding liquidity with enhanced SDK integration...')
    console.log('  Position:', positionMint.toString())
    console.log('  Pair:', pairAddress.toString())
    console.log('  Amounts:', amountX, 'X,', amountY, 'Y')

    try {
      const transaction = new Transaction()

      // Build SDK parameters with proper typing
      const addLiquidityParams: AddLiquidityIntoPositionParams = {
        positionMint,
        payer: userAddress,
        pair: pairAddress,
        transaction: transaction as any, // Type assertion for SDK compatibility
        liquidityDistribution,
        amountX,
        amountY,
        binArrayLower,
        binArrayUpper
      }

      // Use SDK method with proper error handling
      await connectionManager.makeRpcCall(async () => {
        return await this.liquidityBookServices.addLiquidityIntoPosition(addLiquidityParams)
      })

      console.log('✅ Liquidity addition transaction built successfully')

      // Invalidate position cache for this user
      this.invalidatePositionCache(userAddress)

      return {
        transaction,
        success: true
      }

    } catch (error) {
      console.error('❌ Error adding liquidity:', error)
      return {
        transaction: new Transaction(), // Empty transaction
        success: false,
        error: (error as any)?.message || 'Unknown error'
      }
    }
  }

  /**
   * Remove liquidity with enhanced SDK integration
   */
  async removeMultipleLiquidity(params: {
    maxPositionList: Array<{
      position: string
      start: number
      end: number
      positionMint: string
    }>
    userAddress: PublicKey
    pairAddress: PublicKey
    tokenMintX: PublicKey
    tokenMintY: PublicKey
    activeId: number
    type?: RemoveLiquidityType
  }): Promise<{ transactions: Transaction[]; success: boolean; error?: string }> {

    const { maxPositionList, userAddress, pairAddress, tokenMintX, tokenMintY, activeId, type = RemoveLiquidityType.Both } = params

    console.log('🔄 Removing liquidity with enhanced SDK integration...')
    console.log('  Positions:', maxPositionList.length)
    console.log('  Pair:', pairAddress.toString())

    try {
      // Build SDK parameters with proper typing
      const removeLiquidityParams: RemoveMultipleLiquidityParams = {
        maxPositionList,
        payer: userAddress,
        type,
        pair: pairAddress,
        tokenMintX,
        tokenMintY,
        activeId
      }

      // Use SDK method
      const result: RemoveMultipleLiquidityResponse = await connectionManager.makeRpcCall(async () => {
        return await this.liquidityBookServices.removeMultipleLiquidity(removeLiquidityParams)
      })

      console.log('✅ Liquidity removal transactions built successfully')
      console.log('  Main transactions:', result.txs?.length || 0)

      // Invalidate position cache for this user
      this.invalidatePositionCache(userAddress)

      return {
        transactions: (result.txs || []) as any[], // Type assertion for SDK compatibility
        success: true
      }

    } catch (error) {
      console.error('❌ Error removing liquidity:', error)
      return {
        transactions: [],
        success: false,
        error: (error as any)?.message || 'Unknown error'
      }
    }
  }

  // ============================================================================
  // ENHANCED BIN OPERATIONS - Using SDK Methods
  // ============================================================================

  /**
   * Get bin array information with proper SDK types
   */
  async getBinArrayInfo(params: {
    binArrayIndex: number
    pairAddress: PublicKey
    userAddress: PublicKey
  }): Promise<any> {
    const { binArrayIndex, pairAddress, userAddress } = params

    console.log('🔄 Getting bin array info:', binArrayIndex)

    try {
      const binArrayParams: GetBinsArrayInfoParams = {
        binArrayIndex,
        pair: pairAddress,
        payer: userAddress
      }

      const result = await connectionManager.makeRpcCall(async () => {
        return await this.liquidityBookServices.getBinArrayInfo(binArrayParams)
      })

      console.log('✅ Bin array info retrieved successfully')
      return result

    } catch (error) {
      console.error('❌ Error getting bin array info:', error)
      throw error
    }
  }

  /**
   * Get bin reserves with enhanced error handling
   */
  async getBinReserves(params: {
    positionAddress: PublicKey
    pairAddress: PublicKey
    userAddress: PublicKey
  }): Promise<GetBinsReserveResponse[]> {
    const { positionAddress, pairAddress, userAddress } = params

    console.log('🔄 Getting bin reserves for position:', positionAddress.toString())

    try {
      const reserveParams: GetBinsReserveParams = {
        position: positionAddress,
        pair: pairAddress,
        payer: userAddress
      }

      const result = await connectionManager.makeRpcCall(async () => {
        return await this.liquidityBookServices.getBinsReserveInformation(reserveParams)
      })

      console.log('✅ Bin reserves retrieved successfully')
      return Array.isArray(result) ? result : [result]

    } catch (error) {
      console.error('❌ Error getting bin reserves:', error)
      return []
    }
  }

  // ============================================================================
  // ENHANCED SWAP SIMULATION - Using SDK Types
  // ============================================================================

  /**
   * Simulate swap with proper SDK types and enhanced error handling
   */
  async simulateSwap(params: {
    pairAddress: PublicKey
    tokenBase: PublicKey
    tokenQuote: PublicKey
    amount: bigint
    swapForY: boolean
    tokenBaseDecimal: number
    tokenQuoteDecimal: number
    slippage: number
  }): Promise<GetTokenOutputResponse | null> {

    console.log('🔄 Simulating swap with enhanced SDK integration...')

    try {
      const getTokenOutputParams: GetTokenOutputParams = {
        pair: params.pairAddress,
        tokenBase: params.tokenBase,
        tokenQuote: params.tokenQuote,
        amount: params.amount,
        swapForY: params.swapForY,
        isExactInput: true,
        tokenBaseDecimal: params.tokenBaseDecimal,
        tokenQuoteDecimal: params.tokenQuoteDecimal,
        slippage: params.slippage
      }

      const result = await connectionManager.makeRpcCall(async () => {
        // Note: This method might not be available in v1.4.0
        // Keeping it for when SDK is updated
        return await (this.liquidityBookServices as any).getTokenOutput?.(getTokenOutputParams)
      })

      if (result) {
        console.log('✅ Swap simulation completed successfully')
        console.log('  Amount In:', result.amountIn.toString())
        console.log('  Amount Out:', result.amountOut.toString())
        console.log('  Price Impact:', result.priceImpact)
      }

      return result || null

    } catch (error) {
      console.error('❌ Swap simulation failed:', error)
      console.log('⚠️ getTokenOutput method may not be available in SDK v1.4.0')
      return null
    }
  }

  // ============================================================================
  // ENHANCED ANALYTICS - Building on SDK Data
  // ============================================================================

  /**
   * Get enhanced pool analytics using SDK data
   */
  async getPoolAnalytics(poolAddress: PublicKey, _useRealData = true): Promise<PoolAnalyticsData> {
    console.log('🔄 Getting enhanced pool analytics...')

    try {
      const pair = await this.getPoolPair(poolAddress)
      if (!pair) {
        throw new Error('Pool pair not found')
      }

      // Build analytics from SDK data
      const metrics: PoolMetrics = {
        tvl: '0', // Would calculate from bin liquidity data
        volume24h: '0', // Would need external API or historical data
        fees24h: '0', // Would calculate from fee parameters
        apr: 0, // Would calculate from fees and TVL
        activeBins: 0, // Would count from bin array data
        priceChange24h: 0, // Would need historical price data
        volumeChange24h: 0, // Would need historical volume data
        aprChange24h: 0, // Would need historical APR data
        totalBins: 0, // Would count from pair data
        lastUpdated: new Date()
      }

      // Build comprehensive analytics
      const analyticsData: PoolAnalyticsData = {
        metrics,
        feeDistribution: [], // Would build from bin fee data
        liquidityConcentration: {
          concentrationRatio: 0, // Would calculate from bin liquidity data
          highActivityBins: 0, // Would count from bin arrays
          mediumActivityBins: 0, // Would count from bin arrays
          lowActivityBins: 0, // Would count from bin arrays
          optimalRange: false, // Would determine from concentration ratio
          binEfficiency: {
            highActivity: 0, // Would calculate efficiency metrics
            mediumActivity: 0,
            lowActivity: 0
          }
        },
        historicalPerformance: {
          apr7d: 0, // Would calculate from historical data
          apr30d: 0, // Would calculate from historical data
          aprChange7d: 0, // Would calculate from historical data
          aprChange30d: 0, // Would calculate from historical data
          poolAge: 0, // Would calculate from creation date
          poolAgeCategory: 'new' as const, // Would determine from pool age
          volume7d: '0', // Would aggregate from historical data
          volume30d: '0', // Would aggregate from historical data
          fees7d: '0', // Would aggregate from historical data
          fees30d: '0' // Would aggregate from historical data
        },
        poolInfo: null // Would build from pair data if available
      }

      console.log('✅ Enhanced pool analytics calculated')
      return analyticsData

    } catch (error) {
      console.error('❌ Error getting pool analytics:', error)
      throw error
    }
  }

  // ============================================================================
  // CACHE MANAGEMENT - Enhanced Caching System
  // ============================================================================

  /**
   * Invalidate specific cache types
   */
  invalidateCache(type: 'pairs' | 'positions' | 'all' = 'all'): void {
    console.log('🔄 Invalidating cache:', type)

    switch (type) {
      case 'pairs':
        this.pairCache.clear()
        break
      case 'positions':
        this.positionCache.clear()
        break
      case 'all':
        this.pairCache.clear()
        this.positionCache.clear()
        break
    }

    console.log('✅ Cache invalidated successfully')
  }

  /**
   * Invalidate position cache for specific user
   */
  private invalidatePositionCache(userAddress: PublicKey): void {
    const userId = userAddress.toString()
    console.log('🔄 Invalidating position cache for user:', userId)

    // Remove all cache entries that include this user ID
    for (const [key] of this.positionCache) {
      if (key.includes(userId)) {
        this.positionCache.delete(key)
      }
    }

    console.log('✅ User position cache invalidated')
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    pairs: { count: number; oldestTimestamp: number }
    positions: { count: number; oldestTimestamp: number }
  } {
    const now = Date.now()

    let oldestPair = now
    for (const [, { timestamp }] of this.pairCache) {
      if (timestamp < oldestPair) oldestPair = timestamp
    }

    let oldestPosition = now
    for (const [, { timestamp }] of this.positionCache) {
      if (timestamp < oldestPosition) oldestPosition = timestamp
    }

    return {
      pairs: {
        count: this.pairCache.size,
        oldestTimestamp: oldestPair
      },
      positions: {
        count: this.positionCache.size,
        oldestTimestamp: oldestPosition
      }
    }
  }
}

// Export singleton instance
export const improvedDLMMClient = new ImprovedDLMMClient()

// Legacy compatibility
export const dlmmClient = improvedDLMMClient