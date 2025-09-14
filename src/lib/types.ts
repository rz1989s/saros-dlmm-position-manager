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

// ============================================================================
// BACKTESTING SYSTEM TYPES
// ============================================================================

export interface HistoricalPricePoint {
  timestamp: Date
  open: number
  high: number
  low: number
  close: number
  volume: string
  volumeX: string
  volumeY: string
}

export interface HistoricalLiquidityPoint {
  timestamp: Date
  binId: number
  liquidityX: string
  liquidityY: string
  feeRate: number
  isActive: boolean
}

export interface HistoricalData {
  poolAddress: PublicKey
  timeRange: {
    start: Date
    end: Date
    interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  }
  priceData: HistoricalPricePoint[]
  liquidityData: HistoricalLiquidityPoint[]
  metadata: {
    dataPoints: number
    coverage: number // percentage of time covered
    source: 'api' | 'mock' | 'cached'
  }
}

export interface BacktestConfig {
  id: string
  name: string
  description?: string
  strategy: {
    id: string
    name: string
    parameters: any
  }
  market: {
    poolAddress: PublicKey
    tokenXSymbol: string
    tokenYSymbol: string
  }
  timeframe: {
    startDate: Date
    endDate: Date
    interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  }
  capital: {
    initialAmount: number
    currency: 'USD' | 'tokenX' | 'tokenY'
  }
  costs: {
    gasPrice: number
    slippage: number
    transactionFee: number
  }
  rebalancing: {
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
    minThreshold: number
  }
  riskManagement: {
    maxDrawdown?: number
    stopLoss?: number
    takeProfit?: number
  }
}

export interface StrategyAction {
  timestamp: Date
  type: 'rebalance' | 'add_liquidity' | 'remove_liquidity' | 'close_position' | 'initialize'
  parameters: {
    fromBins?: number[]
    toBins?: number[]
    amountX?: string
    amountY?: string
    reason: string
  }
  costs: {
    gas: number
    slippage: number
    fees: number
  }
  result: {
    success: boolean
    newPositionValue: number
    error?: string
  }
}

export interface PositionSnapshot {
  timestamp: Date
  binDistribution: {
    binId: number
    liquidityX: string
    liquidityY: string
    value: number
  }[]
  totalValue: number
  tokenXBalance: string
  tokenYBalance: string
  feesEarned: {
    tokenX: string
    tokenY: string
    usdValue: number
  }
  metrics: {
    apr: number
    impermanentLoss: number
    utilization: number
  }
}

export interface TimeSeriesPoint {
  timestamp: Date
  portfolioValue: number
  benchmarkValue: number // hold strategy value
  position: PositionSnapshot
  action?: StrategyAction
  marketPrice: number
  marketVolume: string
}

export interface BacktestMetrics {
  // Return metrics
  totalReturn: number
  annualizedReturn: number
  benchmarkReturn: number // vs hold strategy
  excessReturn: number

  // Risk metrics
  volatility: number
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdown: number
  maxDrawdownDuration: number

  // Trading metrics
  totalTrades: number
  profitableTrades: number
  winRate: number
  profitFactor: number
  avgTradeReturn: number
  largestWin: number
  largestLoss: number

  // Cost metrics
  totalFees: number
  totalGas: number
  totalSlippage: number
  costToReturn: number

  // DLMM-specific metrics
  totalFeesEarned: number
  avgApr: number
  liquidityUtilization: number
  rebalanceFrequency: number
  impermanentLossRecovery: number
}

export interface BacktestResult {
  config: BacktestConfig
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  startedAt?: Date
  completedAt?: Date

  metrics: BacktestMetrics
  timeSeriesData: TimeSeriesPoint[]
  actions: StrategyAction[]

  summary: {
    bestPeriod: {
      start: Date
      end: Date
      return: number
    }
    worstPeriod: {
      start: Date
      end: Date
      return: number
    }
    keyInsights: string[]
    recommendations: string[]
  }

  error?: {
    message: string
    timestamp: Date
  }
}

export interface StrategyComparison {
  id: string
  name: string
  strategies: {
    config: BacktestConfig
    result: BacktestResult
    color: string
  }[]
  comparisonMetrics: {
    metric: keyof BacktestMetrics
    values: number[]
    winner: number // index of winning strategy
  }[]
  created: Date
}

export interface BacktestOptimization {
  baseConfig: BacktestConfig
  parameters: {
    name: string
    range: [number, number]
    step: number
    optimal: number
  }[]
  results: {
    parameterValues: Record<string, number>
    metrics: BacktestMetrics
    rank: number
  }[]
  optimalConfig: BacktestConfig
}

export interface BacktestCache {
  key: string
  data: HistoricalData
  expiresAt: Date
  size: number
  hits: number
}