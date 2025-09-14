# API Documentation

This document provides comprehensive API documentation for the Saros DLMM Position Manager application.

## Core DLMM Client API

### `DLMMClient` Class

The main client for interacting with the Saros DLMM SDK.

#### Constructor

```typescript
constructor()
```

**Automatically configures:**
- Solana RPC connection based on NEXT_PUBLIC_SOLANA_NETWORK environment variable
- Network mode (mainnet-beta or devnet) with fallback to devnet
- LiquidityBookServices integration with proper MODE configuration
- Connection commitment level set to 'confirmed'

**Example:**
```typescript
// Singleton instance automatically configured
import { dlmmClient } from '@/lib/dlmm/client'

// Access configured connection and services
const connection = dlmmClient.getConnection()
const network = dlmmClient.getNetwork()
const services = dlmmClient.getLiquidityBookServices()
```

#### Methods

##### `getAllLbPairs(): Promise<any[]>`

Fetches all available DLMM liquidity book pairs using the integrated Saros SDK.

**Returns:** Array of LB pair objects from the SDK

**Implementation Status:** ✅ SDK Integration Complete
- Uses LiquidityBookServices for data fetching
- Automatic error handling with fallback to empty array
- Console logging for debugging

**Example:**
```typescript
const pairs = await dlmmClient.getAllLbPairs()
console.log(`Found ${pairs.length} DLMM pairs`)
```

##### `getUserPositions(userPubkey: PublicKey): Promise<any[]>`

Retrieves all positions for a specific user using SDK integration.

**Parameters:**
- `userPubkey`: User's public key

**Returns:** Array of position objects from the SDK

**Implementation Status:** ✅ SDK Integration Complete
- Real-time data fetching with 30-second polling intervals
- Automatic error handling with graceful fallback
- Console logging for debugging and monitoring

**Example:**
```typescript
const positions = await dlmmClient.getUserPositions(userPublicKey)
positions.forEach(pos => {
  console.log(`Position: ${pos.tokenX.symbol}/${pos.tokenY.symbol}`)
})
```

##### `createAddLiquidityTransaction(...params): Promise<any>`

Creates a transaction for adding liquidity to a DLMM pool using SDK integration.

**Parameters:**
- `poolAddress: PublicKey`: Target DLMM pool address
- `userAddress: PublicKey`: User's wallet address
- `amountX: string`: Amount of token X to add
- `amountY: string`: Amount of token Y to add
- `activeBinId: number`: Current active bin ID
- `distributionX: number[]`: X token distribution across bins
- `distributionY: number[]`: Y token distribution across bins

**Returns:** Transaction object from the SDK or null if not available

**Implementation Status:** ✅ SDK Integration Complete
- Uses LiquidityBookServices for transaction building
- Automatic error handling with console logging
- Ready for transaction signing and submission

**Example:**
```typescript
const transaction = await dlmmClient.createAddLiquidityTransaction(
  poolAddress,
  userAddress,
  '1000000', // 1.0 USDC (6 decimals)
  '150000000000', // 150.0 SOL (9 decimals)
  activeBinId,
  [50, 50], // 50% each bin
  [50, 50]  // 50% each bin
)
```

## DLMM Operations API

### New SDK Methods

#### `getLbPair(poolAddress: PublicKey): Promise<any | null>`

Fetch detailed information about a specific DLMM pool.

**Parameters:**
- `poolAddress`: PublicKey of the target pool

**Returns:** Pool data object or null if not found

**Implementation Status:** ✅ SDK Integration Complete

#### `getBinLiquidity(poolAddress: PublicKey): Promise<any[]>`

Retrieve bin liquidity data for a specific pool.

**Parameters:**
- `poolAddress`: PublicKey of the target pool

**Returns:** Array of bin liquidity objects

**Implementation Status:** ✅ SDK Integration Complete

#### `getTokenPrices(tokenAddresses: PublicKey[]): Promise<Record<string, number>>`

Fetch current token prices for multiple addresses.

**Parameters:**
- `tokenAddresses`: Array of token PublicKeys

**Returns:** Map of token address to price in USD

**Implementation Status:** ✅ Mock Implementation (ready for price feed integration)

#### `calculateFees(...params): Promise<{ tokenX: number; tokenY: number }>`

Calculate fees earned by user in a specific pool over a time period.

**Parameters:**
- `poolAddress: PublicKey`: Target pool
- `userAddress: PublicKey`: User's wallet
- `fromTime?: Date`: Start time for calculation
- `toTime?: Date`: End time for calculation

**Returns:** Fee amounts in both tokens

**Implementation Status:** ✅ Mock Implementation (ready for fee calculation integration)

### Advanced Operations API

#### `createRemoveLiquidityTransaction(...params): Promise<any>`

Create transaction to remove liquidity from specific bins.

**Parameters:**
- `poolAddress: PublicKey`: Target pool
- `userAddress: PublicKey`: User's wallet
- `binIds: number[]`: Bins to remove liquidity from
- `liquidityShares: string[]`: Amount shares to remove per bin

**Returns:** Remove liquidity transaction

**Implementation Status:** ✅ SDK Integration Complete

#### `simulateSwap(...params): Promise<{ amountOut: string; priceImpact: number; fee: string }>`

Simulate a swap to get quote information.

**Parameters:**
- `poolAddress: PublicKey`: Target pool
- `amountIn: string`: Input amount
- `tokenIn: PublicKey`: Input token
- `slippageTolerance: number`: Maximum slippage

**Returns:** Swap simulation results

**Implementation Status:** ✅ SDK Integration Complete

### Strategy Types Implementation

**Liquidity Distribution Strategies:**
- **`spot`**: Even distribution across selected bins
- **`curve`**: Concentrated around center with weighted distribution
- **`bid-ask`**: Split between buy (lower bins) and sell (upper bins)

##### `removeLiquidity(params: RemoveLiquidityParams): Promise<Transaction>`

Remove liquidity from specific bins.

**Parameters:**
```typescript
interface RemoveLiquidityParams {
  poolAddress: PublicKey
  userAddress: PublicKey
  binIds: number[]
  amount?: string // Optional: partial removal
}
```

##### `rebalancePosition(params: RebalanceParams): Promise<Transaction[]>`

Rebalance a position with optimal strategy.

**Parameters:**
```typescript
interface RebalanceParams {
  poolAddress: PublicKey
  userAddress: PublicKey
  newCenterBin: number
  newRange: number
  maxSlippage: number
}
```

**Returns:** Array of transactions to execute sequentially

##### `createLimitOrder(params: LimitOrderParams): Promise<Transaction>`

Create limit orders using DLMM bin infrastructure.

**Parameters:**
```typescript
interface LimitOrderParams {
  poolAddress: PublicKey
  userAddress: PublicKey
  side: 'buy' | 'sell'
  amount: string
  targetPrice: number
  expiryTime?: Date
}
```

##### `estimateRebalanceProfit(poolAddress: PublicKey, userAddress: PublicKey, newCenterBin: number, newRange: number): Promise<RebalanceEstimate>`

Estimate the profitability of a rebalance operation.

**Returns:**
```typescript
interface RebalanceEstimate {
  estimatedFeeIncrease: number
  estimatedCost: number
  timeToBreakeven: number
  recommendation: 'recommended' | 'not_recommended' | 'neutral'
}
```

## Strategy Management API

### `StrategyManager` Class

Automated strategy management and recommendations.

#### Methods

##### `getDefaultStrategies(): StrategyConfig[]`

Get available built-in strategies.

**Returns:**
```typescript
interface StrategyConfig {
  id: string
  name: string
  description: string
  enabled: boolean
  parameters: {
    targetRange: number
    rebalanceThreshold: number
    maxSlippage: number
  }
}
```

**Default Strategies:**
- **Conservative**: Wide range, minimal rebalancing
- **Optimal**: Balanced approach for best risk-reward
- **Aggressive**: Narrow range, maximum fee capture

##### `evaluatePositions(userAddress: PublicKey): Promise<StrategyEvaluation>`

Analyze positions and generate recommendations.

**Returns:**
```typescript
interface StrategyEvaluation {
  recommendations: StrategyRecommendation[]
  riskMetrics: RiskMetrics
  performanceMetrics: PerformanceMetrics
}

interface StrategyRecommendation {
  positionId: string
  strategyId: string
  action: 'rebalance' | 'close' | 'adjust'
  confidence: number
  reasoning: string
  estimatedProfit: number
}
```

##### `executeStrategy(userAddress: PublicKey, strategyId: string, positionId: string, action: string): Promise<StrategyExecution>`

Execute a recommended strategy action.

**Returns:**
```typescript
interface StrategyExecution {
  transactions: Transaction[]
  estimatedGas: number
  expectedOutcome: {
    newAPR: number
    costOfRebalancing: number
    timeToBreakeven: number
  }
}
```

##### `getStrategyPerformance(strategyId: string): Promise<StrategyPerformance>`

Get historical performance data for a strategy.

**Returns:**
```typescript
interface StrategyPerformance {
  totalProfit: number
  successRate: number
  averageAPR: number
  riskScore: number
  executionCount: number
}
```

## Analytics API

### Position Analytics

#### `calculatePositionAnalytics(position: DLMMPosition): PositionAnalytics`

Calculate comprehensive analytics for a position.

**Returns:**
```typescript
interface PositionAnalytics {
  totalValue: number
  pnl: {
    amount: number
    percentage: number
  }
  feesEarned: number
  apr: number
  impermanentLoss: {
    amount: number
    percentage: number
  }
  duration: number
  binEfficiency: number
}
```

#### `calculatePositionValue(position: DLMMPosition): number`

Calculate current USD value of a position.

### Portfolio Analytics

#### `calculatePortfolioMetrics(positions: DLMMPosition[]): PortfolioMetrics`

Calculate portfolio-wide metrics.

**Returns:**
```typescript
interface PortfolioMetrics {
  totalValue: number
  totalPnL: number
  averageAPR: number
  riskMetrics: {
    sharpeRatio: number
    maxDrawdown: number
    volatility: number
    concentration: number
  }
  allocation: AllocationData[]
}

interface AllocationData {
  pool: string
  value: number
  percentage: number
  pnl: number
}
```

## Error Handling

### Error Types

All API methods can throw the following error types:

```typescript
class DLMMError extends Error {
  code: string
  details?: any
}

// Error codes:
// - WALLET_NOT_CONNECTED
// - INSUFFICIENT_BALANCE
// - POOL_NOT_FOUND
// - TRANSACTION_FAILED
// - SLIPPAGE_EXCEEDED
// - NETWORK_ERROR
```

### Error Handling Example

```typescript
try {
  const transaction = await dlmmOperations.addLiquidity(params)
  const result = await sendTransaction(transaction)
} catch (error) {
  if (error instanceof DLMMError) {
    switch (error.code) {
      case 'INSUFFICIENT_BALANCE':
        showError('Insufficient balance for this transaction')
        break
      case 'SLIPPAGE_EXCEEDED':
        showError('Price moved too much, try again with higher slippage')
        break
      default:
        showError(`Transaction failed: ${error.message}`)
    }
  }
}
```

## Rate Limiting

### RPC Rate Limits

The application implements intelligent rate limiting:
- **Public RPC**: 50 requests/minute
- **Premium RPC**: 500 requests/minute
- **Automatic retry**: Exponential backoff for failed requests

### Polling Strategy

- **Position data**: 30 seconds polling interval with real-time updates
- **Analytics data**: 60 seconds polling for comprehensive metrics
- **Price data**: 10 seconds polling for current market prices
- **Manual refresh**: Instant updates triggered by user actions
- **Error recovery**: Automatic retry with exponential backoff

## Real-time Data Polling

### Polling Implementation

The application uses configurable polling intervals for real-time updates:

```typescript
// From src/lib/constants.ts
export const REFRESH_INTERVALS = {
  positions: 30000,   // 30 seconds - position data refresh
  analytics: 60000,   // 60 seconds - analytics data refresh
  prices: 10000,      // 10 seconds - price data refresh
}
```

### React Hooks with Real-time Updates

#### `useUserPositions(enableRealtime: boolean = true)`

Hook for fetching user positions with automatic polling.

```typescript
const {
  positions,
  loading,
  refreshing,
  error,
  refreshPositions,
  lastUpdate
} = useUserPositions(true) // Enable real-time updates

// Manual refresh
const handleRefresh = () => {
  refreshPositions()
}
```

#### `usePoolData(poolAddress: PublicKey | undefined, enableRealtime: boolean = false)`

Hook for pool data with optional real-time updates.

```typescript
const {
  poolData,
  binData,
  loading,
  error,
  refreshPoolData
} = usePoolData(poolAddress, true)
```

#### `useSwapQuote(...params, enableRealtime: boolean = false)`

Hook for swap quotes with debounced updates and real-time pricing.

```typescript
const {
  quote,
  loading,
  error
} = useSwapQuote(
  poolAddress,
  '1000',
  tokenInAddress,
  0.5, // 0.5% slippage
  true // Enable real-time price updates
)
```

### Polling Features

- **Automatic Cleanup**: Intervals are cleared when components unmount
- **Error Handling**: Graceful degradation when polling fails
- **Debouncing**: Input changes are debounced to prevent excessive API calls
- **Manual Refresh**: Users can manually trigger data refresh
- **Loading States**: Separate loading and refreshing states for better UX

## Constants and Enums

### Network Configuration

```typescript
export const NETWORKS = {
  MAINNET: {
    name: 'mainnet-beta',
    rpc: 'https://api.mainnet-beta.solana.com',
    sarosApi: 'https://api.saros.finance'
  },
  DEVNET: {
    name: 'devnet',
    rpc: 'https://api.devnet.solana.com',
    sarosApi: 'https://api.devnet.saros.finance'
  }
} as const
```

### Transaction Priorities

```typescript
export enum TransactionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}
```

### Strategy Types

```typescript
export enum StrategyType {
  CONSERVATIVE = 'conservative',
  OPTIMAL = 'optimal',
  AGGRESSIVE = 'aggressive'
}
```

## Testing Utilities

### Mock Data

```typescript
// Generate mock position data for testing
export function createMockPosition(overrides?: Partial<DLMMPosition>): DLMMPosition

// Generate mock analytics data
export function createMockAnalytics(overrides?: Partial<PositionAnalytics>): PositionAnalytics

// Create test wallet
export function createTestWallet(): Keypair
```

### Test Helpers

```typescript
// Setup test environment
export async function setupTestEnvironment(): Promise<{
  connection: Connection
  client: DLMMClient
  testWallet: Keypair
}>

// Clean up test data
export async function cleanupTestEnvironment(): Promise<void>
```