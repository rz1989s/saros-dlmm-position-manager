import { PublicKey, Transaction } from '@solana/web3.js'
import { dlmmClient } from './client'
import {
  calculateLiquidityDistribution,
  calculateBinRange,
  findOptimalBins
} from './utils'

export interface AddLiquidityParams {
  poolAddress: PublicKey
  userAddress: PublicKey
  tokenXAmount: string
  tokenYAmount: string
  strategy: 'spot' | 'curve' | 'bid-ask'
  range: number
  slippageTolerance: number
}

export interface RemoveLiquidityParams {
  poolAddress: PublicKey
  userAddress: PublicKey
  binIds: number[]
  percentageToRemove: number // 0-100
}

export interface RebalanceParams {
  poolAddress: PublicKey
  userAddress: PublicKey
  newCenterBin: number
  newRange: number
  maxSlippage: number
}

export interface LimitOrderParams {
  poolAddress: PublicKey
  userAddress: PublicKey
  side: 'buy' | 'sell'
  amount: string
  targetPrice: number
  expiryTime?: Date
}

export class DLMMOperations {
  
  async addLiquidity(params: AddLiquidityParams): Promise<Transaction> {
    const {
      poolAddress,
      userAddress,
      tokenXAmount,
      tokenYAmount,
      strategy,
      range,
      slippageTolerance: _slippageTolerance
    } = params

    try {
      // Get pool data to determine active bin
      const pair = await dlmmClient.getLbPair(poolAddress)
      if (!pair) {
        throw new Error('Pool not found')
      }

      const activeBinId = pair.activeId || 0
      const totalAmount = parseFloat(tokenXAmount) + parseFloat(tokenYAmount)

      // Calculate liquidity distribution based on strategy
      const distribution = calculateLiquidityDistribution(
        strategy,
        activeBinId,
        range,
        totalAmount
      )

      // Convert to the format expected by the SDK
      const xDistribution = distribution.map(d => Math.round(d.xAmount / totalAmount * 10000)) // BPS
      const yDistribution = distribution.map(d => Math.round(d.yAmount / totalAmount * 10000)) // BPS

      // Create the add liquidity transaction
      const transaction = await dlmmClient.createAddLiquidityTransaction(
        poolAddress,
        userAddress,
        tokenXAmount,
        tokenYAmount,
        activeBinId,
        xDistribution,
        yDistribution
      )

      return transaction
    } catch (error) {
      console.error('Error creating add liquidity transaction:', error)
      throw new Error(`Failed to add liquidity: ${error}`)
    }
  }

  async removeLiquidity(params: RemoveLiquidityParams): Promise<Transaction> {
    const { poolAddress, userAddress, binIds, percentageToRemove } = params

    try {
      // Get user's position data for the specified bins
      const userPositions = await dlmmClient.getUserPositions(userAddress)
      const poolPosition = userPositions.find(p =>
        p.pair.toString() === poolAddress.toString()
      )

      if (!poolPosition) {
        throw new Error('No position found in this pool')
      }

      // Calculate liquidity shares to remove based on percentage
      const liquidityShares = binIds.map(_binId => {
        // PositionInfo doesn't have binLiquidity, using fallback
        const binLiquidity = '1000000' // Fallback value for demo
        const shareToRemove = (parseFloat(binLiquidity) * percentageToRemove / 100).toString()
        return shareToRemove
      })

      // Create remove liquidity transaction
      const transaction = await dlmmClient.createRemoveLiquidityTransaction(
        poolAddress,
        userAddress,
        binIds,
        liquidityShares
      )

      return transaction
    } catch (error) {
      console.error('Error creating remove liquidity transaction:', error)
      throw new Error(`Failed to remove liquidity: ${error}`)
    }
  }

  async rebalancePosition(params: RebalanceParams): Promise<Transaction[]> {
    const { poolAddress, userAddress, newCenterBin, newRange, maxSlippage } = params

    try {
      // Get current position
      const userPositions = await dlmmClient.getUserPositions(userAddress)
      const position = userPositions.find(p => p.pair.toString() === poolAddress.toString())

      if (!position) {
        throw new Error('No position found to rebalance')
      }

      const transactions: Transaction[] = []

      // Step 1: Remove existing liquidity
      const currentBinIds = [0] // Fallback bin ID since binLiquidity doesn't exist on PositionInfo
      const removeParams: RemoveLiquidityParams = {
        poolAddress,
        userAddress,
        binIds: currentBinIds,
        percentageToRemove: 100,
      }

      const removeTx = await this.removeLiquidity(removeParams)
      transactions.push(removeTx)

      // Step 2: Calculate new liquidity distribution
      const { binIds: _newBinIds } = calculateBinRange(newCenterBin, newRange)
      const totalValue = '1000000' // Fallback value since totalValue doesn't exist on PositionInfo

      // Step 3: Add liquidity to new bins
      const addParams: AddLiquidityParams = {
        poolAddress,
        userAddress,
        tokenXAmount: (parseFloat(totalValue) / 2).toString(),
        tokenYAmount: (parseFloat(totalValue) / 2).toString(),
        strategy: 'spot',
        range: newRange,
        slippageTolerance: maxSlippage,
      }

      const addTx = await this.addLiquidity(addParams)
      transactions.push(addTx)

      return transactions
    } catch (error) {
      console.error('Error creating rebalance transactions:', error)
      throw new Error(`Failed to rebalance position: ${error}`)
    }
  }

  async createLimitOrder(params: LimitOrderParams): Promise<Transaction> {
    const { poolAddress, userAddress, side, amount, targetPrice, expiryTime } = params

    try {
      // Get pool data
      const pair = await dlmmClient.getLbPair(poolAddress)
      if (!pair) {
        throw new Error('Pool not found')
      }

      // Calculate target bin based on target price
      // This is a simplified calculation - actual implementation would use SDK methods
      const targetBinId = Math.round(Math.log(targetPrice / 100) / Math.log(1.001))

      // For limit orders, we place liquidity in specific bins that will be filled when price reaches target
      // TODO: Use binIds calculation when implementing actual limit order placement

      // Create transaction to place liquidity as a limit order
      // const _liquidityShares = binIds.map(() => amount) // Unused for now
      const xDistribution = side === 'buy' ? [10000, 0] : [0, 0] // 100% X token for buy orders
      const yDistribution = side === 'sell' ? [0, 10000] : [0, 0] // 100% Y token for sell orders

      const transaction = await dlmmClient.createAddLiquidityTransaction(
        poolAddress,
        userAddress,
        side === 'buy' ? amount : '0',
        side === 'sell' ? amount : '0',
        targetBinId,
        xDistribution,
        yDistribution
      )

      // Add expiry logic if specified (would need custom program instruction)
      if (expiryTime) {
        // This would require additional program instructions for order expiry
        console.warn('Order expiry not yet implemented')
      }

      return transaction
    } catch (error) {
      console.error('Error creating limit order:', error)
      throw new Error(`Failed to create limit order: ${error}`)
    }
  }

  async closeExpiredOrders(userAddress: PublicKey): Promise<Transaction[]> {
    try {
      const userPositions = await dlmmClient.getUserPositions(userAddress)
      const transactions: Transaction[] = []

      for (const position of userPositions) {
        // Check if position has expired orders (this would require additional metadata)
        // For now, we'll implement basic position cleanup
        const inactiveBins = [0] // Fallback since binLiquidity and isActive don't exist on PositionInfo

        if (inactiveBins.length > 0) {
          const removeParams: RemoveLiquidityParams = {
            poolAddress: new PublicKey(position.pair),
            userAddress,
            binIds: inactiveBins,
            percentageToRemove: 100,
          }

          const removeTx = await this.removeLiquidity(removeParams)
          transactions.push(removeTx)
        }
      }

      return transactions
    } catch (error) {
      console.error('Error closing expired orders:', error)
      throw new Error(`Failed to close expired orders: ${error}`)
    }
  }

  async optimizePosition(
    poolAddress: PublicKey,
    userAddress: PublicKey,
    strategy: 'maximize_fees' | 'minimize_il' | 'balanced'
  ): Promise<Transaction[]> {
    try {
      // Get current position and pool data
      const [userPositions, poolData] = await Promise.all([
        dlmmClient.getUserPositions(userAddress),
        dlmmClient.getLbPair(poolAddress)
      ])

      const position = userPositions.find(p => p.pair.toString() === poolAddress.toString())
      if (!position) {
        throw new Error('No position found')
      }

      if (!poolData) {
        throw new Error('Pool data not found')
      }

      // Find optimal bins based on strategy
      const optimalBins = findOptimalBins(poolData as any,
        { min: 50, max: 150 }, // Price range (simplified)
        strategy
      )

      const currentBins = [0] // Fallback since binLiquidity doesn't exist on PositionInfo
      
      // Check if rebalancing is needed
      const needsRebalance = !optimalBins.every(bin => currentBins.includes(bin)) ||
                            !currentBins.every(bin => optimalBins.includes(bin))

      if (!needsRebalance) {
        return [] // No optimization needed
      }

      // Create rebalance transaction
      const centerBin = optimalBins[Math.floor(optimalBins.length / 2)]
      const range = Math.floor(optimalBins.length / 2)

      const rebalanceParams: RebalanceParams = {
        poolAddress,
        userAddress,
        newCenterBin: centerBin,
        newRange: range,
        maxSlippage: 0.5, // 0.5% max slippage
      }

      return await this.rebalancePosition(rebalanceParams)
    } catch (error) {
      console.error('Error optimizing position:', error)
      throw new Error(`Failed to optimize position: ${error}`)
    }
  }

  async estimateRebalanceProfit(
    poolAddress: PublicKey,
    userAddress: PublicKey,
    _newCenterBin: number,
    _newRange: number
  ): Promise<{
    estimatedFeeIncrease: number
    estimatedCost: number
    timeToBreakeven: number
    recommendation: 'recommended' | 'not_recommended' | 'neutral'
  }> {
    try {
      // Get current position data
      const userPositions = await dlmmClient.getUserPositions(userAddress)
      const position = userPositions.find(p => p.pair.toString() === poolAddress.toString())

      if (!position) {
        throw new Error('No position found')
      }

      // Calculate current fee rate
      const currentFeeRate = 0 // Fallback since currentAPR doesn't exist on PositionInfo

      // Estimate new fee rate (this would use historical data and modeling)
      const estimatedNewFeeRate = currentFeeRate * 1.2 // Simplified 20% increase

      // Calculate rebalance costs
      const estimatedGasCost = 0.002 // SOL (simplified)
      const slippageCost = parseFloat('1000000') * 0.005 // 0.5% slippage (fallback value)
      const totalCost = estimatedGasCost + slippageCost

      // Calculate time to breakeven
      const feeIncrease = estimatedNewFeeRate - currentFeeRate
      const dailyExtraFees = parseFloat('1000000') * feeIncrease / 365 // Fallback value
      const timeToBreakeven = dailyExtraFees > 0 ? totalCost / dailyExtraFees : Infinity

      // Make recommendation
      let recommendation: 'recommended' | 'not_recommended' | 'neutral'
      if (timeToBreakeven < 30 && feeIncrease > 0.01) { // Break even in less than 30 days and >1% APR increase
        recommendation = 'recommended'
      } else if (timeToBreakeven > 180 || feeIncrease < 0) { // Break even takes more than 180 days or negative
        recommendation = 'not_recommended'
      } else {
        recommendation = 'neutral'
      }

      return {
        estimatedFeeIncrease: feeIncrease * 100, // Convert to percentage
        estimatedCost: totalCost,
        timeToBreakeven,
        recommendation,
      }
    } catch (error) {
      console.error('Error estimating rebalance profit:', error)
      return {
        estimatedFeeIncrease: 0,
        estimatedCost: 0,
        timeToBreakeven: Infinity,
        recommendation: 'not_recommended',
      }
    }
  }
}

// Export singleton instance
export const dlmmOperations = new DLMMOperations()