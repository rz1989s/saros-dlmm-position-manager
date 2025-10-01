'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useJudgeMode } from '@/contexts/judge-mode-context'
import {
  ArrowLeft,
  Menu,
  X,
  Home,
  Activity,
  Zap,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DemoLayoutProps {
  children: React.ReactNode
}

const DEMO_NAVIGATION = [
  {
    category: 'Core DLMM Operations',
    demos: [
      { id: 'pool-data', title: 'Pool Data Loading', path: '/demos/pool-data', status: 'live' },
      { id: 'position-discovery', title: 'Position Discovery', path: '/demos/position-discovery', status: 'live' },
      { id: 'liquidity-operations', title: 'Liquidity Operations', path: '/demos/liquidity-operations', status: 'live' },
      { id: 'bin-data', title: 'Bin Data Operations', path: '/demos/bin-data', status: 'live' },
      { id: 'swap-operations', title: 'Swap Operations', path: '/demos/swap-operations', status: 'live' },
      { id: 'position-creation', title: 'Position Creation', path: '/demos/position-creation', status: 'live' }
    ]
  },
  {
    category: 'Oracle & Price Feeds',
    demos: [
      { id: 'multi-provider-oracle', title: 'Multi-Provider Oracle', path: '/demos/multi-provider-oracle', status: 'live' },
      { id: 'price-feed-caching', title: 'Price Feed Caching', path: '/demos/price-feed-caching', status: 'live' },
      { id: 'pyth-integration', title: 'Pyth Network', path: '/demos/pyth-integration', status: 'live' },
      { id: 'switchboard', title: 'Switchboard', path: '/demos/switchboard', status: 'live' },
      { id: 'price-confidence', title: 'Price Confidence', path: '/demos/price-confidence', status: 'live' },
      { id: 'oracle-fallback', title: 'Oracle Fallback', path: '/demos/oracle-fallback', status: 'live' },
      { id: 'oracle-caching', title: 'Oracle Caching', path: '/demos/oracle-caching', status: 'live' },
      { id: 'oracle-confidence-advanced', title: 'Advanced Confidence', path: '/demos/oracle-confidence-advanced', status: 'live' },
      { id: 'price-history', title: 'Price History', path: '/demos/price-history', status: 'live' }
    ]
  },
  {
    category: 'Position Analytics',
    demos: [
      { id: 'pnl-tracking', title: 'P&L Tracking', path: '/demos/pnl-tracking', status: 'live' },
      { id: 'portfolio-overview', title: 'Portfolio Overview', path: '/demos/portfolio-overview', status: 'live' },
      { id: 'basic-portfolio-aggregation', title: 'Portfolio Aggregation', path: '/demos/basic-portfolio-aggregation', status: 'live' },
      { id: 'analytics-dashboard', title: 'Analytics Dashboard', path: '/demos/analytics-dashboard', status: 'live' },
      { id: 'performance-tracking', title: 'Performance Tracking', path: '/demos/performance-tracking', status: 'live' },
      { id: 'position-liquidity-analytics', title: 'Liquidity Analytics', path: '/demos/position-liquidity-analytics', status: 'live' },
      { id: 'position-valuation', title: 'Position Valuation', path: '/demos/position-valuation', status: 'live' },
      { id: 'pnl-dashboard-advanced', title: 'Advanced P&L', path: '/demos/pnl-dashboard-advanced', status: 'live' },
      { id: 'advanced-portfolio-analytics', title: 'Advanced Portfolio', path: '/demos/advanced-portfolio-analytics', status: 'live' }
    ]
  },
  {
    category: 'Fee Management',
    demos: [
      { id: 'fee-collection', title: 'Fee Collection', path: '/demos/fee-collection', status: 'live' },
      { id: 'fee-tier-analysis', title: 'Fee Tier Analysis', path: '/demos/fee-tier-analysis', status: 'live' },
      { id: 'fee-optimization', title: 'Fee Optimization', path: '/demos/fee-optimization', status: 'live' },
      { id: 'fee-migration', title: 'Fee Migration', path: '/demos/fee-migration', status: 'live' },
      { id: 'custom-fee-tiers', title: 'Custom Fee Tiers', path: '/demos/custom-fee-tiers', status: 'live' },
      { id: 'market-fee-analysis', title: 'Market Fee Analysis', path: '/demos/market-fee-analysis', status: 'live' },
      { id: 'fee-simulation', title: 'Fee Simulation', path: '/demos/fee-simulation', status: 'live' },
      { id: 'historical-fee-analysis', title: 'Historical Fees', path: '/demos/historical-fee-analysis', status: 'live' }
    ]
  },
  {
    category: 'Advanced Analytics',
    demos: [
      { id: 'rebalancing', title: 'Advanced Rebalancing', path: '/demos/rebalancing', status: 'live' },
      { id: 'performance-monitoring', title: 'Performance Monitoring', path: '/demos/performance-monitoring', status: 'live' },
      { id: 'risk-assessment', title: 'Risk Assessment', path: '/demos/risk-assessment', status: 'live' },
      { id: 'correlation-analysis', title: 'Correlation Analysis', path: '/demos/correlation-analysis', status: 'live' },
      { id: 'market-analysis', title: 'Market Analysis', path: '/demos/market-analysis', status: 'live' },
      { id: 'performance-benchmarking', title: 'Benchmarking', path: '/demos/performance-benchmarking', status: 'live' },
      { id: 'custom-analytics', title: 'Custom Analytics', path: '/demos/custom-analytics', status: 'live' },
      { id: 'market-forecasting', title: 'Market Forecasting', path: '/demos/market-forecasting', status: 'live' },
      { id: 'performance-attribution', title: 'Performance Attribution', path: '/demos/performance-attribution', status: 'live' }
    ]
  },
  {
    category: 'Portfolio Management',
    demos: [
      { id: 'multi-position-analysis', title: 'Multi-Position Analysis', path: '/demos/multi-position-analysis', status: 'live' },
      { id: 'portfolio-optimizer', title: 'Portfolio Optimizer', path: '/demos/portfolio-optimizer', status: 'live' },
      { id: 'diversification', title: 'Diversification', path: '/demos/diversification', status: 'live' },
      { id: 'consolidation', title: 'Consolidation', path: '/demos/consolidation', status: 'live' },
      { id: 'portfolio-reporting', title: 'Portfolio Reporting', path: '/demos/portfolio-reporting', status: 'live' },
      { id: 'portfolio-benchmarking', title: 'Portfolio Benchmark', path: '/demos/portfolio-benchmarking', status: 'live' },
      { id: 'portfolio-alerts', title: 'Portfolio Alerts', path: '/demos/portfolio-alerts', status: 'live' }
    ]
  },
  {
    category: 'Position Migration',
    demos: [
      { id: 'cross-pool-migration', title: 'Cross-Pool Migration', path: '/demos/cross-pool-migration', status: 'live' },
      { id: 'migration-analysis', title: 'Migration Analysis', path: '/demos/migration-analysis', status: 'live' },
      { id: 'migration-automation', title: 'Migration Automation', path: '/demos/migration-automation', status: 'live' },
      { id: 'migration-risk', title: 'Migration Risk', path: '/demos/migration-risk', status: 'live' },
      { id: 'migration-simulation', title: 'Migration Simulation', path: '/demos/migration-simulation', status: 'live' },
      { id: 'migration-rollback', title: 'Migration Rollback', path: '/demos/migration-rollback', status: 'live' },
      { id: 'migration-planning', title: 'Migration Planning', path: '/demos/migration-planning', status: 'live' },
      { id: 'migration-optimizer', title: 'Migration Optimizer', path: '/demos/migration-optimizer', status: 'live' },
      { id: 'bulk-migration', title: 'Bulk Migration', path: '/demos/bulk-migration', status: 'live' },
      { id: 'migration-analytics-dashboard', title: 'Migration Analytics', path: '/demos/migration-analytics-dashboard', status: 'live' }
    ]
  },
  {
    category: 'Performance & Optimization',
    demos: [
      { id: 'intelligent-caching', title: 'Intelligent Caching', path: '/demos/intelligent-caching', status: 'live' },
      { id: 'cache-optimization', title: 'Cache Optimization', path: '/demos/cache-optimization', status: 'live' },
      { id: 'memory-optimization', title: 'Memory Optimization', path: '/demos/memory-optimization', status: 'live' },
      { id: 'network-optimization', title: 'Network Optimization', path: '/demos/network-optimization', status: 'live' },
      { id: 'response-optimization', title: 'Response Optimization', path: '/demos/response-optimization', status: 'live' },
      { id: 'batch-operations', title: 'Batch Operations', path: '/demos/batch-operations', status: 'live' },
      { id: 'data-prefetching', title: 'Data Prefetching', path: '/demos/data-prefetching', status: 'live' }
    ]
  },
  {
    category: 'Enterprise Features',
    demos: [
      { id: 'multi-tenant', title: 'Multi-Tenant', path: '/demos/multi-tenant', status: 'live' },
      { id: 'advanced-security', title: 'Advanced Security', path: '/demos/advanced-security', status: 'live' },
      { id: 'api-platform', title: 'API Platform', path: '/demos/api-platform', status: 'live' },
      { id: 'tax-optimization', title: 'Tax Optimization', path: '/demos/tax-optimization', status: 'live' }
    ]
  }
]

export default function DemosLayout({ children }: DemoLayoutProps) {
  const pathname = usePathname()
  const { isJudgeMode } = useJudgeMode()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Find which category contains the current page
  const currentCategory = DEMO_NAVIGATION.find(cat =>
    cat.demos.some(demo => demo.path === pathname)
  )?.category || 'Core DLMM Operations'

  // Track expanded categories (start with current category expanded)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set([currentCategory])
  )

  const isMainDemoPage = pathname === '/demos'

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-3 xs:px-4 py-3 xs:py-4">
          <div className="flex items-center justify-between gap-2 xs:gap-3">
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 min-w-0 flex-1">
              {!isMainDemoPage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 p-1 xs:p-2"
                >
                  {sidebarOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>
              )}

              <Link href="/demos" className="flex items-center gap-1.5 xs:gap-2 hover:opacity-80 transition-opacity min-w-0 flex-1">
                <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-saros-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-saros-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm xs:text-base sm:text-lg font-semibold truncate">DLMM SDK Demos</h1>
                  <p className="text-[10px] xs:text-xs text-muted-foreground -mt-0.5 xs:-mt-1 truncate hidden xs:block">Interactive SDK Showcase</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-1.5 xs:gap-2 flex-shrink-0">
              {isJudgeMode && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 hidden xs:inline-flex">
                  Judge Mode
                </Badge>
              )}

              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs xs:text-sm px-2 xs:px-3 py-1.5 xs:py-2">
                  <Home className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                  <span className="hidden xs:inline">Main App</span>
                  <span className="xs:hidden">App</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        {!isMainDemoPage && (
          <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 border-r bg-muted/30 min-h-[calc(100vh-73px)]">
              <div className="p-4 space-y-6">
                <Link href="/demos">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Demo Hub
                  </Button>
                </Link>

                <div className="space-y-2">
                  {DEMO_NAVIGATION.map((category) => {
                    const isExpanded = expandedCategories.has(category.category)
                    const demoCount = category.demos.length

                    return (
                      <div key={category.category} className="space-y-1">
                        <button
                          onClick={() => toggleCategory(category.category)}
                          className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                          title={category.category}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span className="truncate">{category.category}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                            {demoCount}
                          </Badge>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1 pl-2">
                                {category.demos.map((demo) => (
                                  <Link key={demo.id} href={demo.path} title={demo.title}>
                                    <Button
                                      variant={pathname === demo.path ? "secondary" : "ghost"}
                                      size="sm"
                                      className="w-full justify-start"
                                    >
                                      <Activity className="h-4 w-4 mr-2 flex-shrink-0" />
                                      <span className="truncate">{demo.title}</span>
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "ml-auto text-xs flex-shrink-0",
                                          demo.status === 'live' ? 'bg-green-100 text-green-700' :
                                          demo.status === 'beta' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-gray-100 text-gray-700'
                                        )}
                                      >
                                        {demo.status}
                                      </Badge>
                                    </Button>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </div>
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.aside
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  className="lg:hidden fixed left-0 top-[73px] bottom-0 w-64 border-r bg-background z-40 overflow-y-auto"
                >
                  <div className="p-4 space-y-6">
                    <Link href="/demos">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Demo Hub
                      </Button>
                    </Link>

                    <div className="space-y-2">
                      {DEMO_NAVIGATION.map((category) => {
                        const isExpanded = expandedCategories.has(category.category)
                        const demoCount = category.demos.length

                        return (
                          <div key={category.category} className="space-y-1">
                            <button
                              onClick={() => toggleCategory(category.category)}
                              className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                              title={category.category}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                )}
                                <span className="truncate">{category.category}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                                {demoCount}
                              </Badge>
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-1 pl-2">
                                    {category.demos.map((demo) => (
                                      <Link key={demo.id} href={demo.path} title={demo.title}>
                                        <Button
                                          variant={pathname === demo.path ? "secondary" : "ghost"}
                                          size="sm"
                                          className="w-full justify-start"
                                          onClick={() => setSidebarOpen(false)}
                                        >
                                          <Activity className="h-4 w-4 mr-2 flex-shrink-0" />
                                          <span className="truncate">{demo.title}</span>
                                          <Badge
                                            variant="outline"
                                            className={cn(
                                              "ml-auto text-xs flex-shrink-0",
                                              demo.status === 'live' ? 'bg-green-100 text-green-700' :
                                              demo.status === 'beta' ? 'bg-yellow-100 text-yellow-700' :
                                              'bg-gray-100 text-gray-700'
                                            )}
                                          >
                                            {demo.status}
                                          </Badge>
                                        </Button>
                                      </Link>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 min-h-[calc(100vh-73px)]",
          !isMainDemoPage && "lg:ml-0"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}