import { PublicKey } from '@solana/web3.js'

export interface DLMMPosition {
  id: string
  poolAddress: PublicKey
  userAddress: PublicKey
  tokenX: TokenInfo
  tokenY: TokenInfo
  activeBin: number
  liquidityAmount: string
  feesEarned: {
    tokenX: string
    tokenY: string
  }
  createdAt: Date
  lastUpdated: Date
  isActive: boolean
}

export interface TokenInfo {
  address: PublicKey
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  price: number
}

export interface BinInfo {
  binId: number
  price: number
  liquidityX: string
  liquidityY: string
  isActive: boolean
  feeRate: number
  volume24h: string
}

export interface PoolInfo {
  address: PublicKey
  tokenX: TokenInfo
  tokenY: TokenInfo
  activeBin: BinInfo
  totalLiquidity: string
  volume24h: string
  fees24h: string
  apr: number
  createdAt: Date
}

export interface PositionAnalytics {
  totalValue: number
  pnl: {
    amount: number
    percentage: number
  }
  feesEarned: number
  impermanentLoss: {
    amount: number
    percentage: number
  }
  apr: number
  duration: number
}

export interface RebalanceStrategy {
  id: string
  name: string
  description: string
  parameters: {
    targetRange: number
    rebalanceThreshold: number
    maxSlippage: number
    priority: 'efficiency' | 'fees' | 'balance'
  }
  isActive: boolean
}

export interface LimitOrder {
  id: string
  poolAddress: PublicKey
  type: 'buy' | 'sell'
  amount: string
  targetPrice: number
  currentPrice: number
  status: 'active' | 'filled' | 'cancelled'
  createdAt: Date
  expiresAt?: Date
}

export interface NetworkStats {
  totalValueLocked: string
  totalVolume24h: string
  totalFees24h: string
  activePools: number
  totalTransactions: number
}