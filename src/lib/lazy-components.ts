import { lazy } from 'react'

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

// Chart Components
export const LazyBinChart = lazy(() =>
  import('@/components/charts/bin-chart').then(module => ({
    default: module.BinChart
  }))
)

export const LazyPriceChart = lazy(() =>
  import('@/components/charts/price-chart').then(module => ({
    default: module.PriceChart
  }))
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

// Dynamic import with retry logic
export const dynamicImportWithRetry = (
  importFunction: () => Promise<any>,
  retries: number = 3
): Promise<any> => {
  return importFunction().catch(error => {
    if (retries > 0) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(dynamicImportWithRetry(importFunction, retries - 1))
        }, 1000)
      })
    }
    throw error
  })
}