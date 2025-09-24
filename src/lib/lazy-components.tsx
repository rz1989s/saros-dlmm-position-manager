'use client'

import { lazy } from 'react'
import React from 'react'

// Fallback components for critical chart failures
const ChartFallback = ({ type }: { type: string }) => (
  <div className="w-full h-96 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
    <div className="text-gray-500 text-center">
      <div className="text-xl mb-2">📊</div>
      <h3 className="font-medium mb-1">{type} Chart Unavailable</h3>
      <p className="text-sm">Loading failed. Please refresh the page.</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
)

const BinChartFallback = () => <ChartFallback type="Bin Distribution" />
const PriceChartFallback = () => <ChartFallback type="Price & Volume" />

// Analytics Components
export const LazyPnLTracker = lazy(() =>
  import('@/components/analytics/pnl-tracker').then(module => ({
    default: module.PnLTracker
  }))
)

export const LazyPortfolioOverview = lazy(() =>
  import('@/components/analytics/portfolio-overview').then(module => ({
    default: module.PortfolioOverview
  }))
)

// Chart Components with retry logic
export const LazyBinChart = lazy(() =>
  dynamicImportWithRetry(() =>
    import('@/components/charts/bin-chart').then(module => ({
      default: module.BinChart
    }))
  )
)

export const LazyPriceChart = lazy(() =>
  dynamicImportWithRetry(() =>
    import('@/components/charts/price-chart').then(module => ({
      default: module.PriceChart
    }))
  )
)

// Strategy Components
export const LazyStrategyDashboard = lazy(() =>
  import('@/components/strategy/strategy-dashboard').then(module => ({
    default: module.StrategyDashboard
  }))
)

export const LazyRebalanceModal = lazy(() =>
  import('@/components/strategy/rebalance-modal').then(module => ({
    default: module.RebalanceModal
  }))
)

export const LazyLimitOrderModal = lazy(() =>
  import('@/components/strategy/limit-order-modal').then(module => ({
    default: module.LimitOrderModal
  }))
)

// Position Components
export const LazyPositionsList = lazy(() =>
  import('@/components/positions-list').then(module => ({
    default: module.PositionsList
  }))
)

export const LazyPositionCard = lazy(() =>
  import('@/components/position-card').then(module => ({
    default: module.PositionCard
  }))
)

// Modal Components
export const LazyAddLiquidityModal = lazy(() =>
  import('@/components/modals/add-liquidity-modal-simple').then(module => ({
    default: module.AddLiquidityModal
  }))
)

// Heavy Visualization Components
export const LazyBinVisualization = lazy(() =>
  import('@/components/bin-visualization').then(module => ({
    default: module.BinVisualization
  }))
)

export const LazyAnalyticsPanel = lazy(() =>
  import('@/components/analytics-panel').then(module => ({
    default: module.AnalyticsPanel
  }))
)

export const LazyPositionOverview = lazy(() =>
  import('@/components/position-overview').then(module => ({
    default: module.PositionOverview
  }))
)

// Page-level lazy components
export const LazyAnalyticsPage = lazy(() =>
  import('@/app/analytics/page').then(module => ({
    default: module.default
  }))
)

export const LazyStrategiesPage = lazy(() =>
  import('@/app/strategies/page').then(module => ({
    default: module.default
  }))
)

// Create preload functions for critical components
export const preloadComponents = {
  analytics: () => {
    import('@/components/analytics/pnl-tracker')
    import('@/components/analytics/portfolio-overview')
    import('@/components/charts/bin-chart')
    import('@/components/charts/price-chart')
  },

  strategies: () => {
    import('@/components/strategy/strategy-dashboard')
    import('@/components/strategy/rebalance-modal')
    import('@/components/strategy/limit-order-modal')
  },

  positions: () => {
    import('@/components/positions-list')
    import('@/components/position-card')
    import('@/components/modals/add-liquidity-modal-simple')
  },

  charts: () => {
    import('@/components/charts/bin-chart')
    import('@/components/charts/price-chart')
    import('@/components/bin-visualization')
  }
}

// Bundle splitting utilities
export const componentBundles = {
  analytics: [
    () => import('@/components/analytics/pnl-tracker'),
    () => import('@/components/analytics/portfolio-overview')
  ],

  charts: [
    () => import('@/components/charts/bin-chart'),
    () => import('@/components/charts/price-chart')
  ],

  strategies: [
    () => import('@/components/strategy/strategy-dashboard'),
    () => import('@/components/strategy/rebalance-modal'),
    () => import('@/components/strategy/limit-order-modal')
  ],

  modals: [
    () => import('@/components/modals/add-liquidity-modal-simple'),
    () => import('@/components/strategy/rebalance-modal'),
    () => import('@/components/strategy/limit-order-modal')
  ]
}

// Preload function for route-based code splitting
export const preloadRoute = (route: string) => {
  switch (route) {
    case '/analytics':
      preloadComponents.analytics()
      break
    case '/strategies':
      preloadComponents.strategies()
      break
    case '/':
      preloadComponents.positions()
      break
    default:
      break
  }
}

// Enhanced dynamic import with exponential backoff retry logic
export const dynamicImportWithRetry = (
  importFunction: () => Promise<any>,
  retries: number = 5,
  backoffMs: number = 1000
): Promise<any> => {
  console.log(`🔄 Attempting dynamic import, retries left: ${retries}`)

  return importFunction().catch(error => {
    console.error(`❌ Dynamic import failed:`, error.message)

    if (retries > 0) {
      const delay = backoffMs * (6 - retries) // Exponential backoff: 1s, 2s, 3s, 4s, 5s
      console.log(`⏳ Retrying in ${delay}ms...`)

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(dynamicImportWithRetry(importFunction, retries - 1, backoffMs))
        }, delay)
      })
    }

    console.error(`💥 Dynamic import failed after all retries:`, error)
    throw error
  })
}

// Error boundary for chart components
class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any) {
    console.error('ChartErrorBoundary caught error:', error)
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Chart component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback
      return <FallbackComponent />
    }

    return this.props.children
  }
}

// Safe chart wrappers with error boundaries and suspense
export const SafeBinChart = (props: any) => (
  <ChartErrorBoundary fallback={BinChartFallback}>
    <React.Suspense fallback={<div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg" />}>
      <LazyBinChart {...props} />
    </React.Suspense>
  </ChartErrorBoundary>
)

export const SafePriceChart = (props: any) => (
  <ChartErrorBoundary fallback={PriceChartFallback}>
    <React.Suspense fallback={<div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg" />}>
      <LazyPriceChart {...props} />
    </React.Suspense>
  </ChartErrorBoundary>
)