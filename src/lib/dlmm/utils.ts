import { PublicKey } from '@solana/web3.js'
import { BinInfo, DLMMPosition, PoolInfo, PositionAnalytics } from '@/lib/types'
import { calculatePNL, calculateAPR } from '@/lib/utils'

export function parseBinId(binId: number): { price: number; isValid: boolean } {
  try {
    // DLMM bins represent price points in a logarithmic scale
    // This is a simplified calculation - actual implementation would use SDK methods
    const price = Math.pow(1.001, binId) * 100 // Base price of 100 with 0.1% steps
    return { price, isValid: true }
  } catch (error) {
    return { price: 0, isValid: false }
  }
}

export function calculateBinRange(
  activeBinId: number,
  range: number
): { centerBin: number; minBin: number; maxBin: number; binIds: number[] } {
  const halfRange = Math.floor(range / 2)
  const minBin = activeBinId - halfRange
  const maxBin = activeBinId + (range - halfRange - 1)
  const binIds = Array.from({ length: range }, (_, i) => minBin + i)

  return { centerBin: activeBinId, minBin, maxBin, binIds }
}

export function formatBinData(binData: any[]): BinInfo[] {
  if (!binData || !Array.isArray(binData)) {
    return []
  }

  return binData.map((bin) => ({
    binId: bin.binId || 0,
    price: bin.price || parseBinId(bin.binId || 0).price,
    liquidityX: bin.reserveX || bin.liquidityX || '0',
    liquidityY: bin.reserveY || bin.liquidityY || '0',
    isActive: bin.isActive || false,
    feeRate: bin.feeRate || 0,
    volume24h: bin.volume24h || '0',
  }))
}

export function calculateLiquidityDistribution(
  strategy: 'spot' | 'curve' | 'bid-ask',
  activeBinId: number,
  range: number,
  totalAmount: number
): { binId: number; xAmount: number; yAmount: number }[] {
  const { binIds } = calculateBinRange(activeBinId, range)
  const amountPerBin = totalAmount / binIds.length

  switch (strategy) {
    case 'spot':
      // Even distribution for spot strategy
      return binIds.map((binId) => ({
        binId,
        xAmount: amountPerBin / 2,
        yAmount: amountPerBin / 2,
      }))

    case 'curve':
      // Concentrated around center for curve strategy
      const centerIndex = Math.floor(binIds.length / 2)
      return binIds.map((binId, index) => {
        const distance = Math.abs(index - centerIndex)
        const weight = Math.max(0.1, 1 - distance * 0.3) // More weight to center bins
        const weightedAmount = (totalAmount * weight) / binIds.reduce((sum, _, i) => {
          const d = Math.abs(i - centerIndex)
          return sum + Math.max(0.1, 1 - d * 0.3)
        }, 0)

        return {
          binId,
          xAmount: weightedAmount / 2,
          yAmount: weightedAmount / 2,
        }
      })

    case 'bid-ask':
      // Split between buy (lower bins) and sell (upper bins)
      const midIndex = Math.floor(binIds.length / 2)
      return binIds.map((binId, index) => {
        if (index < midIndex) {
          // Lower bins - more X tokens (bids)
          return { binId, xAmount: amountPerBin * 0.8, yAmount: amountPerBin * 0.2 }
        } else if (index > midIndex) {
          // Upper bins - more Y tokens (asks)
          return { binId, xAmount: amountPerBin * 0.2, yAmount: amountPerBin * 0.8 }
        } else {
          // Middle bin - balanced
          return { binId, xAmount: amountPerBin / 2, yAmount: amountPerBin / 2 }
        }
      })

    default:
      throw new Error(`Unknown strategy: ${strategy}`)
  }
}

export function calculatePositionValue(
  position: DLMMPosition,
  tokenPrices: Record<string, number>
): number {
  const tokenXPrice = tokenPrices[position.tokenX.address.toString()] || 0
  const tokenYPrice = tokenPrices[position.tokenY.address.toString()] || 0
  
  // This is a simplified calculation - actual value would depend on bin distributions
  const liquidityValue = parseFloat(position.liquidityAmount)
  return liquidityValue * (tokenXPrice + tokenYPrice) / 2
}

export function calculatePositionAnalytics(
  position: DLMMPosition,
  currentValue: number,
  initialValue: number,
  totalFeesEarned: number
): PositionAnalytics {
  const duration = Date.now() - position.createdAt.getTime()
  const durationDays = duration / (1000 * 60 * 60 * 24)
  
  const pnl = calculatePNL(currentValue, initialValue)
  const apr = calculateAPR(totalFeesEarned, initialValue, durationDays)
  
  // Simplified IL calculation
  const impermanentLoss = {
    amount: Math.max(0, initialValue - currentValue + totalFeesEarned),
    percentage: initialValue > 0 ? Math.max(0, (initialValue - currentValue + totalFeesEarned) / initialValue) : 0,
  }
  
  return {
    totalValue: currentValue,
    pnl,
    feesEarned: totalFeesEarned,
    impermanentLoss,
    apr,
    duration: Math.floor(duration / 1000),
  }
}

export function findOptimalBins(
  poolData: PoolInfo,
  priceRange: { min: number; max: number },
  strategy: 'maximize_fees' | 'minimize_il' | 'balanced'
): number[] {
  const activeBinId = poolData.activeBin.binId
  const binRange = 10 // Default range
  
  switch (strategy) {
    case 'maximize_fees':
      // Concentrate around active bin for maximum fee collection
      return [activeBinId - 1, activeBinId, activeBinId + 1]
      
    case 'minimize_il':
      // Spread liquidity to reduce impermanent loss
      return Array.from({ length: binRange * 2 }, (_, i) => activeBinId - binRange + i)
      
    case 'balanced':
      // Balanced approach
      return Array.from({ length: 5 }, (_, i) => activeBinId - 2 + i)
      
    default:
      return [activeBinId]
  }
}

export function predictPriceMovement(
  historicalPrices: { timestamp: number; price: number }[],
  timeframe: number
): { predicted: number; confidence: number; trend: 'up' | 'down' | 'stable' } {
  if (historicalPrices.length < 2) {
    return { predicted: 0, confidence: 0, trend: 'stable' }
  }
  
  // Simple linear regression for price prediction
  const recent = historicalPrices.slice(-10)
  const avgPrice = recent.reduce((sum, p) => sum + p.price, 0) / recent.length
  const slope = recent.length > 1 
    ? (recent[recent.length - 1].price - recent[0].price) / (recent.length - 1)
    : 0
  
  const predicted = avgPrice + slope * timeframe
  const trend = Math.abs(slope) < 0.001 ? 'stable' : slope > 0 ? 'up' : 'down'
  const confidence = Math.min(0.95, Math.max(0.1, 1 - Math.abs(slope) / avgPrice))
  
  return { predicted, confidence, trend }
}

export function calculateRebalanceRecommendation(
  position: DLMMPosition,
  currentPrice: number,
  targetRange: number,
  rebalanceThreshold: number
): {
  shouldRebalance: boolean
  reason: string
  recommendedBins: number[]
  estimatedGas: number
} {
  const currentBin = parseBinId(position.activeBin)
  const priceDiff = Math.abs(currentPrice - currentBin.price) / currentBin.price
  
  if (priceDiff > rebalanceThreshold) {
    const newActiveBin = Math.round(Math.log(currentPrice / 100) / Math.log(1.001))
    const { binIds } = calculateBinRange(newActiveBin, targetRange)
    
    return {
      shouldRebalance: true,
      reason: `Price moved ${(priceDiff * 100).toFixed(2)}% from position center`,
      recommendedBins: binIds,
      estimatedGas: 0.001, // SOL
    }
  }
  
  return {
    shouldRebalance: false,
    reason: 'Position is within target range',
    recommendedBins: [],
    estimatedGas: 0,
  }
}

export function formatPoolName(tokenX: string, tokenY: string): string {
  return `${tokenX}/${tokenY}`
}

export function isPoolActive(pool: PoolInfo): boolean {
  const daysSinceCreation = (Date.now() - pool.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  const hasRecentVolume = parseFloat(pool.volume24h) > 0
  const hasLiquidity = parseFloat(pool.totalLiquidity) > 1000 // Minimum $1000

  return daysSinceCreation > 1 && hasRecentVolume && hasLiquidity
}

export function calculateProfitLoss(
  position: any,
  initialPrices: { tokenX: number; tokenY: number }
): {
  totalPnL: number
  feesEarned: number
  priceChangePnL: number
  totalReturn: number
  annualizedReturn: number
} {
  const currentTokenXPrice = position.tokenX.price
  const currentTokenYPrice = position.tokenY.price
  const initialTokenXPrice = initialPrices.tokenX
  const initialTokenYPrice = initialPrices.tokenY

  // Calculate fees earned in USD
  const feesXAmount = parseFloat(position.feesEarned.tokenX) / Math.pow(10, position.tokenX.decimals)
  const feesYAmount = parseFloat(position.feesEarned.tokenY) / Math.pow(10, position.tokenY.decimals)
  const feesEarned = (feesXAmount * currentTokenXPrice) + (feesYAmount * currentTokenYPrice)

  // Calculate price change P&L (simplified)
  const initialValue = parseFloat(position.liquidityAmount)
  const priceChangeRatio = (currentTokenXPrice / initialTokenXPrice + currentTokenYPrice / initialTokenYPrice) / 2
  const currentValue = initialValue * priceChangeRatio
  const priceChangePnL = currentValue - initialValue

  const totalPnL = priceChangePnL + feesEarned
  const totalReturn = initialValue > 0 ? totalPnL / initialValue : 0

  // Calculate annualized return
  const daysSinceCreation = (Date.now() - position.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  const annualizedReturn = daysSinceCreation > 0 ? totalReturn * (365 / daysSinceCreation) : 0

  return {
    totalPnL,
    feesEarned,
    priceChangePnL,
    totalReturn,
    annualizedReturn,
  }
}

export function calculateImpermanentLoss(
  initialRatio: number,
  currentRatio: number
): {
  impermanentLoss: number
  hodlValue: number
  lpValue: number
} {
  // Calculate impermanent loss for a 50/50 AMM position
  // IL = (2 * sqrt(ratio)) / (1 + ratio) - 1

  const ratio = currentRatio / initialRatio
  const sqrtRatio = Math.sqrt(ratio)

  // LP value relative to initial
  const lpValue = (2 * sqrtRatio) / (1 + ratio)

  // HODL value (just hold the tokens)
  const hodlValue = (1 + ratio) / 2

  // Impermanent loss (negative value means loss)
  const impermanentLoss = Math.abs(lpValue - hodlValue) / hodlValue

  return {
    impermanentLoss,
    hodlValue,
    lpValue,
  }
}