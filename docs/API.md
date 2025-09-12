# API Documentation

This document provides comprehensive API documentation for the Saros DLMM Position Manager application.

## Core DLMM Client API

### `DLMMClient` Class

The main client for interacting with the Saros DLMM SDK.

#### Constructor

```typescript
constructor(connection: Connection, commitment?: Commitment)
```

**Parameters:**
- `connection`: Solana RPC connection
- `commitment`: Transaction commitment level (default: 'confirmed')

#### Methods

##### `getAllLbPairs(): Promise<LbPair[]>`

Fetches all available DLMM liquidity book pairs.

**Returns:** Array of `LbPair` objects

**Example:**
```typescript
const client = new DLMMClient(connection)
const pairs = await client.getAllLbPairs()
console.log(`Found ${pairs.length} DLMM pairs`)
```

##### `getUserPositions(userPubkey: PublicKey): Promise<DLMMPosition[]>`

Retrieves all positions for a specific user.

**Parameters:**
- `userPubkey`: User's public key

**Returns:** Array of `DLMMPosition` objects

**Example:**
```typescript
const positions = await client.getUserPositions(userPublicKey)
positions.forEach(pos => {
  console.log(`Position: ${pos.tokenX.symbol}/${pos.tokenY.symbol}`)
})
```

##### `createAddLiquidityTransaction(params: AddLiquidityParams): Promise<Transaction>`

Creates a transaction for adding liquidity to a DLMM pool.

**Parameters:**
```typescript
interface AddLiquidityParams {
  poolAddress: PublicKey
  userAddress: PublicKey
  amountX: string
  amountY: string
  binRange: {
    minBin: number
    maxBin: number
  }
  strategy: 'spot' | 'curve' | 'bid-ask'
  slippageTolerance: number
}
```

**Returns:** Solana transaction object

**Example:**
```typescript
const transaction = await client.createAddLiquidityTransaction({
  poolAddress: new PublicKey('...'),
  userAddress: userPublicKey,
  amountX: '1.0',
  amountY: '150.0',
  binRange: { minBin: -5, maxBin: 5 },
  strategy: 'spot',
  slippageTolerance: 0.01
})
```

## DLMM Operations API

### `DLMMOperations` Class

Advanced operations for position management and trading strategies.

#### Methods

##### `addLiquidity(params: AddLiquidityParams): Promise<Transaction>`

Add liquidity to a DLMM pool with advanced strategy options.

**Strategy Types:**
- **`spot`**: Concentrated liquidity around current price
- **`curve`**: Distributed liquidity following price curve
- **`bid-ask`**: Asymmetric liquidity for directional strategies

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

### Caching Strategy

- **Position data**: 30 seconds cache
- **Pool data**: 60 seconds cache
- **Historical data**: 5 minutes cache

## WebSocket Events

### Real-time Updates

The application subscribes to real-time events:

```typescript
interface DLMMEvents {
  'position_updated': (position: DLMMPosition) => void
  'pool_updated': (pool: LbPair) => void
  'transaction_confirmed': (signature: string) => void
  'strategy_executed': (result: StrategyExecution) => void
}
```

### Event Subscription Example

```typescript
dlmmClient.on('position_updated', (position) => {
  // Update UI with new position data
  updatePositionCard(position)
})

dlmmClient.on('strategy_executed', (result) => {
  // Show success notification
  showNotification(`Strategy executed successfully. Expected APR: ${result.expectedOutcome.newAPR}%`)
})
```

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