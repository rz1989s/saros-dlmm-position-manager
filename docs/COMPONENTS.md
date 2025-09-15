# Component Documentation (v0.3.0 - Phase 4 Complete)

This document provides detailed documentation for all React components in the Saros DLMM Position Manager application, including the new Phase 4 UI/UX Excellence components.

## Core Components

### DashboardHeader

Main navigation and header component with wallet integration.

**Location:** `src/components/dashboard-header.tsx`

**Features:**
- Responsive navigation tabs (Positions, Analytics, Strategies)
- Integrated wallet connection button
- Live network status indicator
- Mobile-optimized layout

**Props:** None (uses routing context)

**Example Usage:**
```typescript
import { DashboardHeader } from '@/components/dashboard-header'

export default function Page() {
  return (
    <div className="container">
      <DashboardHeader />
      {/* Page content */}
    </div>
  )
}
```

### PositionCard

Individual DLMM position display with comprehensive analytics.

**Location:** `src/components/position-card.tsx`

**Props:**
```typescript
interface PositionCardProps {
  position: DLMMPosition
  analytics: PositionAnalytics
  onManage?: (position: DLMMPosition) => void
  onRebalance?: (position: DLMMPosition) => void
  onClose?: (position: DLMMPosition) => void
}
```

**Features:**
- Real-time P&L tracking with visual indicators
- Performance metrics (APR, fees earned, duration)
- Impermanent loss warnings
- Expandable detailed view
- Action buttons for position management

**Example Usage:**
```typescript
<PositionCard
  position={position}
  analytics={analytics}
  onManage={handleManage}
  onRebalance={handleRebalance}
  onClose={handleClose}
/>
```

### PositionsList

Main container for displaying all user positions with search/filter functionality.

**Location:** `src/components/positions-list.tsx`

**Features:**
- Search positions by pool name or token symbols
- Filter by status (Active/Inactive), profitability
- Sort by various metrics (Value, P&L, APR, Duration)
- Responsive grid layout
- Empty state handling

**Props:**
```typescript
interface PositionsListProps {
  showFilters?: boolean
  defaultSort?: 'value' | 'pnl' | 'apr' | 'duration'
}
```

## Chart Components

### BinChart

Interactive visualization of DLMM bin liquidity distribution.

**Location:** `src/components/charts/bin-chart.tsx`

**Props:**
```typescript
interface BinChartProps {
  bins: BinInfo[]
  activeBinId: number
  userBins?: number[]
  onBinClick?: (binId: number) => void
  onZoomRange?: (minBin: number, maxBin: number) => void
  height?: number
}
```

**Features:**
- Zoomable and pannable bin visualization
- User position highlighting
- Interactive bin tooltips with detailed metrics
- Zoom controls and reset functionality
- Responsive design with mobile optimization

**Example Usage:**
```typescript
<BinChart
  bins={mockBins}
  activeBinId={0}
  userBins={[-2, -1, 0, 1, 2]}
  height={400}
  onBinClick={(binId) => console.log('Clicked bin:', binId)}
/>
```

### PriceChart

Historical price and volume visualization with multiple timeframes.

**Location:** `src/components/charts/price-chart.tsx`

**Props:**
```typescript
interface PriceChartProps {
  currentPrice: number
  priceChange24h: number
  height?: number
  onTimeframeChange?: (timeframe: string) => void
  data?: PriceData[]
}
```

**Features:**
- Multiple timeframes (1H, 4H, 24H, 7D, 30D)
- Price and volume overlay
- Interactive crosshair with data point details
- Responsive chart scaling
- Real-time price updates

## Modal Components

### AddLiquidityModal

Comprehensive modal for adding liquidity to DLMM pools.

**Location:** `src/components/modals/add-liquidity-modal.tsx`

**Props:**
```typescript
interface AddLiquidityModalProps {
  isOpen: boolean
  onClose: () => void
  poolAddress?: PublicKey
  tokenX?: TokenInfo
  tokenY?: TokenInfo
  activeBinId?: number
  currentPrice?: number
}
```

**Features:**
- Three liquidity strategies (Spot, Curve, Bid-Ask)
- Visual bin range selector
- Real-time fee estimates
- Slippage tolerance configuration
- Transaction simulation and preview

### RebalanceModal

Smart rebalancing interface with cost-benefit analysis.

**Location:** `src/components/strategy/rebalance-modal.tsx`

**Props:**
```typescript
interface RebalanceModalProps {
  isOpen: boolean
  onClose: () => void
  position?: DLMMPosition
  currentPrice?: number
  onSuccess?: () => void
}
```

**Features:**
- Strategy selection (Conservative, Optimal, Aggressive)
- Manual parameter adjustment
- Impact analysis with break-even calculation
- Risk assessment and recommendations
- Multi-transaction execution

### LimitOrderModal

Advanced limit order creation using DLMM bin infrastructure.

**Location:** `src/components/strategy/limit-order-modal.tsx`

**Props:**
```typescript
interface LimitOrderModalProps {
  isOpen: boolean
  onClose: () => void
  poolAddress?: PublicKey
  tokenX?: TokenInfo
  tokenY?: TokenInfo
  currentPrice?: number
  onSuccess?: () => void
}
```

**Features:**
- Buy/Sell order types
- Target price configuration with presets
- Fill probability analysis
- Expiry time settings
- Order value and potential savings calculation

## Analytics Components

### PnLTracker

Comprehensive P&L tracking with historical analysis.

**Location:** `src/components/analytics/pnl-tracker.tsx`

**Features:**
- Multiple timeframe analysis (24h, 7d, 30d, 90d, all)
- Combined area/bar/line chart for P&L breakdown
- Position-by-position P&L analysis
- Performance insights and recommendations
- Time-based metrics (daily P&L, win rate, etc.)

**Props:**
```typescript
interface PnLTrackerProps {
  timeframe?: '24h' | '7d' | '30d' | '90d' | 'all'
  showDetails?: boolean
}
```

### PortfolioOverview

Complete portfolio analysis with risk metrics and allocation charts.

**Location:** `src/components/analytics/portfolio-overview.tsx`

**Features:**
- Portfolio allocation pie chart
- Risk analysis (concentration, correlation, volatility)
- Performance metrics (Sharpe ratio, max drawdown)
- Automated recommendations based on risk assessment
- Refreshable data with loading states

**Props:**
```typescript
interface PortfolioOverviewProps {
  refreshInterval?: number
  showRiskWarnings?: boolean
}
```

## Strategy Components

### StrategyDashboard

Central hub for automated strategy management.

**Location:** `src/components/strategy/strategy-dashboard.tsx`

**Features:**
- Strategy overview metrics
- Quick action buttons (Smart Rebalance, Limit Orders, Analyze)
- Available strategies with enable/disable toggles
- Real-time recommendations with confidence scores
- Strategy performance tracking

**Props:**
```typescript
interface StrategyDashboardProps {
  autoRefresh?: boolean
  showAdvanced?: boolean
}
```

## UI Components

### WalletStatus

Wallet connection status and balance display.

**Location:** `src/components/wallet-status.tsx`

**Props:**
```typescript
interface WalletStatusProps {
  showBalance?: boolean
  showNetwork?: boolean
  compact?: boolean
}
```

**Features:**
- Connection status indicator
- SOL balance display
- Network selection
- Wallet switching
- Mobile-optimized layout

## Hook Components

### useUserPositions

Custom hook for fetching and managing user positions with real-time polling.

**Location:** `src/hooks/use-dlmm.ts`

**Parameters:**
```typescript
useUserPositions(enableRealtime: boolean = true)
```

**Returns:**
```typescript
interface UseUserPositionsReturn {
  positions: any[]
  loading: boolean
  refreshing: boolean
  error: Error | null
  refreshPositions: () => Promise<void>
  lastUpdate: Date
}
```

**Features:**
- ✅ **Real-time Polling**: 30-second automatic updates when `enableRealtime` is true
- ✅ **Manual Refresh**: `refreshPositions()` for user-triggered updates
- ✅ **Loading States**: Separate `loading` (initial) and `refreshing` (updates) states
- ✅ **Error Handling**: Graceful error recovery with console logging
- ✅ **Last Update Tracking**: `lastUpdate` timestamp for UI display
- ✅ **Automatic Cleanup**: Polling intervals cleared on component unmount
- ✅ **Wallet Integration**: Automatically fetches when wallet is connected

**Example Usage:**
```typescript
const {
  positions,
  loading,
  refreshing,
  refreshPositions,
  lastUpdate
} = useUserPositions(true) // Enable real-time updates

// Manual refresh button
<Button onClick={refreshPositions} disabled={refreshing}>
  {refreshing ? 'Refreshing...' : 'Refresh'}
</Button>

// Last update display
<span className="text-sm text-gray-500">
  Last updated: {lastUpdate.toLocaleTimeString()}
</span>
```

### usePoolData

Custom hook for fetching pool data with optional real-time updates.

**Location:** `src/hooks/use-dlmm.ts`

**Parameters:**
```typescript
usePoolData(
  poolAddress: PublicKey | undefined,
  enableRealtime: boolean = false
)
```

**Returns:**
```typescript
interface UsePoolDataReturn {
  poolData: any | null
  binData: any[]
  loading: boolean
  error: Error | null
  refreshPoolData: () => Promise<void>
}
```

**Features:**
- ✅ **Pool Information**: Fetches comprehensive pool data from SDK
- ✅ **Bin Liquidity**: Retrieves bin distribution and liquidity data
- ✅ **Real-time Updates**: 60-second polling when enabled
- ✅ **Manual Refresh**: User-triggered data updates
- ✅ **Conditional Loading**: Only fetches when poolAddress is provided
- ✅ **Error Recovery**: Graceful error handling with fallbacks

**Example Usage:**
```typescript
const {
  poolData,
  binData,
  loading,
  refreshPoolData
} = usePoolData(selectedPoolAddress, true)
```

### useSwapQuote

Custom hook for fetching swap quotes with debouncing and real-time price updates.

**Location:** `src/hooks/use-dlmm.ts`

**Parameters:**
```typescript
useSwapQuote(
  poolAddress: PublicKey | undefined,
  amountIn: string | undefined,
  tokenIn: PublicKey | undefined,
  slippageTolerance: number,
  enableRealtime: boolean = false
)
```

**Returns:**
```typescript
interface UseSwapQuoteReturn {
  quote: {
    amountOut: string
    priceImpact: number
    fee: string
  } | null
  loading: boolean
  error: Error | null
}
```

**Features:**
- ✅ **Debounced Requests**: 500ms debouncing to prevent excessive API calls
- ✅ **Real-time Pricing**: 10-second price updates when enabled
- ✅ **Input Validation**: Only fetches quotes for valid inputs
- ✅ **Zero Amount Handling**: Skips requests for zero amounts
- ✅ **Multiple Parameters**: Handles complex parameter validation

**Example Usage:**
```typescript
const {
  quote,
  loading,
  error
} = useSwapQuote(
  poolAddress,
  '1000000', // 1 USDC
  usdcTokenAddress,
  0.5, // 0.5% slippage
  true // Enable real-time price updates
)
```

### useWalletIntegration

Enhanced wallet integration with transaction management.

**Location:** `src/hooks/use-wallet-integration.ts`

**Returns:**
```typescript
interface UseWalletIntegrationReturn {
  publicKey: PublicKey | null
  isConnected: boolean
  isSubmitting: boolean
  sendTransaction: (transaction: Transaction) => Promise<TransactionResult>
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
  balance: number
  network: string
}
```

**Features:**
- Multi-wallet support
- Transaction signing and submission
- Balance tracking
- Network detection
- Error handling with user-friendly messages

## Responsive Design Patterns

### Container Layouts

All major components follow consistent responsive patterns:

```typescript
// Standard responsive container
className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"

// Responsive grid layouts
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"

// Flexible header layouts
className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
```

### Mobile Optimizations

- **Touch-friendly buttons**: Minimum 44px touch targets
- **Readable text**: Responsive text sizing with proper line heights
- **Accessible interactions**: Proper focus states and ARIA labels
- **Performance**: Lazy loading for non-critical components

## Testing Components

### Component Testing Utilities

```typescript
// Test wrapper with providers
export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions)

// Mock wallet provider
export function MockWalletProvider({ children }: { children: React.ReactNode })

// Mock position data factory
export function createMockPosition(overrides?: Partial<DLMMPosition>): DLMMPosition
```

### Testing Examples

```typescript
import { renderWithProviders, createMockPosition } from '@/test-utils'
import { PositionCard } from '@/components/position-card'

describe('PositionCard', () => {
  it('displays position metrics correctly', () => {
    const mockPosition = createMockPosition({
      tokenX: { symbol: 'SOL' },
      tokenY: { symbol: 'USDC' }
    })
    
    const { getByText } = renderWithProviders(
      <PositionCard position={mockPosition} analytics={mockAnalytics} />
    )
    
    expect(getByText('SOL/USDC')).toBeInTheDocument()
  })
})
```

## Performance Considerations

### Optimization Strategies

1. **React.memo**: Critical for position cards and chart components
2. **useMemo/useCallback**: For expensive calculations and event handlers
3. **Lazy loading**: Non-critical modals and chart components
4. **Virtual scrolling**: For large position lists
5. **Debounced inputs**: Search and filter inputs

### Bundle Splitting

```typescript
// Dynamic imports for modals
const AddLiquidityModal = lazy(() => import('./modals/add-liquidity-modal'))
const RebalanceModal = lazy(() => import('./strategy/rebalance-modal'))

// Chart components
const BinChart = lazy(() => import('./charts/bin-chart'))
const PriceChart = lazy(() => import('./charts/price-chart'))
```

## Accessibility

### ARIA Labels and Roles

All components include proper ARIA attributes:

```typescript
// Button with descriptive label
<Button aria-label="Add liquidity to SOL/USDC pool">
  <Plus className="h-4 w-4" />
</Button>

// Chart with description
<div role="img" aria-label="Liquidity distribution across price bins">
  <BinChart bins={bins} />
</div>
```

### Keyboard Navigation

- **Modal dialogs**: Proper focus trap and escape key handling
- **Interactive charts**: Keyboard navigation for data points
- **Form inputs**: Tab order and validation feedback
- **Buttons**: Enter and space key activation

## Error Boundaries

### Component Error Handling

```typescript
export function ComponentErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="p-4 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800">Component Error</h3>
          <p className="text-sm text-red-600">{error.message}</p>
          <Button onClick={resetError} className="mt-2">
            Try Again
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
```

## Phase 4 UI/UX Excellence Components (v0.3.0)

### Mobile Components

#### BottomSheet
**Location:** `src/components/mobile/bottom-sheet.tsx`

Modal component optimized for mobile with snap points and drag gestures.

**Features:**
- Multiple snap points (30%, 70%, 95%)
- Drag-to-resize functionality
- Backdrop blur and auto-dismiss
- Keyboard and touch support

#### FloatingActionButton (FAB)
**Location:** `src/components/mobile/fab.tsx`

Floating action buttons with multiple variants and expandable menus.

**Features:**
- Primary, secondary, accent variants
- ExpandableFAB with action menus
- SpeedDialFAB for radial menus
- Position control and animations

#### SwipeableCard
**Location:** `src/components/mobile/swipeable-card.tsx`

Touch-optimized cards with left/right swipe actions and haptic feedback.

**Features:**
- Configurable left/right actions
- Haptic feedback support
- Visual indicators and progress
- QuickSwipeCard preset

### PWA Components

#### InstallPrompt
**Location:** `src/components/pwa/install-prompt.tsx`

Smart install prompts for Progressive Web App installation.

**Features:**
- Platform detection (iOS, Android, Desktop)
- Multiple variants (banner, modal, inline)
- Install benefits showcase
- Dismissible with delay

#### PWAProvider
**Location:** `src/components/pwa/pwa-provider.tsx`

Comprehensive PWA state management and UI orchestration.

**Features:**
- Service worker registration
- Install prompt management
- Offline indicators
- Update notifications

### Accessibility Components

#### AccessibleComponents
**Location:** `src/components/accessibility/accessible-components.tsx`

WCAG 2.1 AA compliant components with full accessibility support.

**Features:**
- ScreenReaderOnly text
- CollapsibleSection with ARIA
- StatusBadge with announcements
- AccessibleTable with sorting
- ProgressIndicator with labels

### Error Boundaries

#### ErrorBoundary
**Location:** `src/components/error-boundary.tsx`

Comprehensive error handling with different severity levels.

**Features:**
- Critical, page, and component boundaries
- User-friendly error displays
- Automatic retry mechanisms
- Error reporting integration

### Toast System

#### Toast & Toaster
**Location:** `src/components/ui/toast.tsx` & `src/components/ui/toaster.tsx`

Rich notification system with multiple variants and positions.

**Features:**
- Success, error, warning, info, loading variants
- Multiple position support
- Animation and sound effects
- Promise-based toast patterns

### Animation Components

#### AnimatedNumber
**Location:** `src/components/animations/animated-number.tsx`

Smooth number transitions with spring physics.

#### StaggerList
**Location:** `src/components/animations/stagger-list.tsx`

List animations with staggered child reveals.

#### PageTransition
**Location:** `src/components/animations/page-transition.tsx`

Smooth page and modal transitions.

### Performance Components

#### Skeleton Components
**Location:** `src/components/ui/skeleton.tsx` & `src/components/ui/loading-states.tsx`

Progressive loading states for all major UI components.

### Gesture Hooks

#### useGesture
**Location:** `src/hooks/use-gesture.ts`

Comprehensive touch gesture detection including:
- Swipe gestures (all directions)
- Pinch-to-zoom
- Long press detection
- Pull-to-refresh
- Haptic feedback

This comprehensive component documentation ensures developers can understand, maintain, and extend the application effectively, including all the new Phase 4 UI/UX Excellence features.