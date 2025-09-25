'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { PublicKey } from '@solana/web3.js'
import { DashboardHeader } from '@/components/dashboard-header'
import { LazyAnalyticsWrapper, LazyChartWrapper } from '@/components/ui/lazy-loading'
import {
  LazyPnLTracker,
  LazyPortfolioOverview,
  SafeBinChart,
  SafePriceChart
} from '@/lib/lazy-components'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataSourceToggle } from '@/components/ui/data-source-toggle'
import { useDataSource } from '@/contexts/data-source-context'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  Percent,
  Zap,
  Target,
  Calendar,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react'
import { BinInfo } from '@/lib/types'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import {
  usePoolAnalytics,
  usePoolList
} from '@/hooks/use-pool-analytics'

// Mock data for demonstration
const mockBins: BinInfo[] = Array.from({ length: 40 }, (_, i) => ({
  binId: i - 20,
  price: 100 + (i - 20) * 2.5,
  liquidityX: (Math.random() * 50000 + 10000).toString(),
  liquidityY: (Math.random() * 50000 + 10000).toString(),
  isActive: i === 20,
  feeRate: 0.003 + Math.random() * 0.002,
  volume24h: (Math.random() * 100000 + 20000).toString(),
}))

const userBins = [-2, -1, 0, 1, 2] // User has liquidity in bins around active bin

// Mock price data for chart
const mockPriceData = Array.from({ length: 24 }, (_, i) => ({
  timestamp: Date.now() - (23 - i) * 60 * 60 * 1000,
  price: 152.45 + (Math.random() - 0.5) * 10,
  volume: Math.random() * 100000 + 50000,
  fees: Math.random() * 1000 + 500,
  volatility: Math.random() * 0.1 + 0.05,
}))

// Memoized handlers for chart interactions
const ChartHandlers = {
  onBinClick: (binId: number) => console.log('Clicked bin:', binId),
  onTimeframeChange: (timeframe: string) => console.log('Changed timeframe:', timeframe)
}

function AnalyticsPageComponent() {
  const [selectedPoolIndex, setSelectedPoolIndex] = useState(0)
  const [selectedMetric, setSelectedMetric] = useState<'liquidity' | 'volume' | 'fees'>('liquidity')
  const [activeTab, setActiveTab] = useState('pnl')
  const { isRealDataMode, isMockDataMode } = useDataSource()

  // Fetch available pools
  const { pools, loading: poolsLoading, refreshPools } = usePoolList()

  // Get selected pool address as string (FIXED: Ensure proper string conversion)
  const selectedPoolAddress = useMemo(() => {
    if (pools.length > 0 && selectedPoolIndex < pools.length) {
      const poolAddress = pools[selectedPoolIndex].address
      // Ensure it's a string, whether input is PublicKey or already string
      return typeof poolAddress === 'string' ? poolAddress : poolAddress.toString()
    }
    return undefined
  }, [pools, selectedPoolIndex])

  // Enhanced tab debugging with useCallback for performance
  const handleTabChange = useCallback((newTab: string) => {
    console.log('🔄 TAB CHANGE EVENT:', {
      from: activeTab,
      to: newTab,
      timestamp: new Date().toISOString(),
      poolSelected: selectedPoolAddress ? 'YES' : 'NO',
      poolAddress: selectedPoolAddress
    })
    setActiveTab(newTab)
    console.log('✅ TAB STATE UPDATED to:', newTab)
  }, [selectedPoolAddress]) // Removed activeTab from dependencies to prevent function recreation

  // Get pool analytics data
  const {
    analyticsData,
    loading: analyticsLoading,
    error: analyticsError,
    refreshAnalytics,
    lastUpdate
  } = usePoolAnalytics(selectedPoolAddress)

  // Memoized pool selection handler
  const handlePoolChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPoolIndex(parseInt(event.target.value))
  }, [])

  // Memoized analytics data extraction (FIXED: removed duplicate hook calls)
  const analytics = useMemo(() => ({
    metrics: analyticsData?.metrics || null,
    feeDistribution: analyticsData?.feeDistribution || [],
    liquidityConcentration: analyticsData?.liquidityConcentration || null,
    historicalPerformance: analyticsData?.historicalPerformance || null
  }), [analyticsData])

  // Destructure for cleaner usage
  const { metrics, feeDistribution, liquidityConcentration, historicalPerformance } = analytics

  const isLoading = poolsLoading || analyticsLoading
  const selectedPool = pools[selectedPoolIndex]

  // Generate real chart data from SDK/blockchain
  const generateRealChartData = useCallback((poolAddress: string) => {
    console.log('🌐 generateRealChartData: Generating real chart data for pool:', poolAddress)

    // In real implementation, this would:
    // 1. Fetch actual bin liquidity distribution from SDK
    // 2. Get real price/volume history from pool events
    // 3. Show actual user positions on bins

    const realBins: BinInfo[] = []
    const realPriceData: any[] = []

    // Placeholder for real data structure
    console.log('📊 generateRealChartData: Real chart data generated (placeholder)')
    return { bins: realBins, priceData: realPriceData }
  }, [])

  // Generate mock chart data
  const generateMockChartData = useCallback(() => {
    console.log('🎭 generateMockChartData: Generating mock chart data')

    const mockBins: BinInfo[] = Array.from({ length: 40 }, (_, i) => ({
      binId: i - 20,
      price: 100 + (i - 20) * 2.5,
      liquidityX: (Math.random() * 50000 + 10000).toString(),
      liquidityY: (Math.random() * 50000 + 10000).toString(),
      isActive: i === 20,
      feeRate: 0.003 + Math.random() * 0.002,
      volume24h: (Math.random() * 100000 + 20000).toString(),
    }))

    const mockPriceData = Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (23 - i) * 60 * 60 * 1000,
      price: 152.45 + (Math.random() - 0.5) * 10,
      volume: Math.random() * 100000 + 50000,
      fees: Math.random() * 1000 + 500,
      volatility: Math.random() * 0.1 + 0.05,
    }))

    return { bins: mockBins, priceData: mockPriceData }
  }, [])

  // Dynamic chart data based on data mode
  const chartData = useMemo(() => {
    if (isRealDataMode && selectedPoolAddress) {
      return generateRealChartData(selectedPoolAddress)
    } else {
      return generateMockChartData()
    }
  }, [isRealDataMode, selectedPoolAddress, generateRealChartData, generateMockChartData])

  // Enhanced debug logging with proper type verification
  console.log('🐛 Analytics Page Debug:', {
    poolsCount: pools.length,
    pools: pools.map(p => ({
      name: p.name,
      address: p.address.toString(),
      addressType: typeof p.address
    })),
    selectedPoolIndex,
    selectedPoolAddress,
    selectedPoolAddressType: typeof selectedPoolAddress,
    selectedPoolValid: selectedPoolAddress ? 'YES' : 'NO',
    activeTab,
    analyticsData,
    metrics,
    isLoading,
    analyticsError
  })

  // Tab state debugging
  console.log('🎯 TAB STATE DEBUG:', {
    currentActiveTab: activeTab,
    tabValid: ['pnl', 'portfolio', 'pools', 'charts'].includes(activeTab),
    timestamp: new Date().toISOString()
  })

  // Verify selectedPoolAddress is properly set
  console.log('🔍 Pool Address Verification:', {
    poolsAvailable: pools.length > 0,
    indexValid: selectedPoolIndex < pools.length,
    poolAtIndex: pools[selectedPoolIndex] ? pools[selectedPoolIndex].name : 'undefined',
    originalAddressType: pools[selectedPoolIndex] ? typeof pools[selectedPoolIndex].address : 'undefined',
    finalAddress: selectedPoolAddress || 'UNDEFINED',
    finalAddressType: typeof selectedPoolAddress,
    isStringConversion: typeof selectedPoolAddress === 'string' ? 'SUCCESS' : 'FAILED'
  })

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
      <DashboardHeader />
      
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive P&L tracking, portfolio insights, and DLMM pool analytics
            </p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedPoolIndex}
              onChange={handlePoolChange}
              disabled={poolsLoading || pools.length === 0}
              className="border border-input rounded-md px-4 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {poolsLoading ? (
                <option value={0}>Loading pools...</option>
              ) : pools.length === 0 ? (
                <option value={0}>No pools available</option>
              ) : (
                pools.map((pool, index) => (
                  <option key={pool.address.toString()} value={index}>
                    {pool.name} - {formatCurrency(parseFloat(pool.tvl))} TVL
                  </option>
                ))
              )}
            </select>
            {lastUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAnalytics}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Data Source Toggle */}
        <div className="border-t pt-4">
          <DataSourceToggle />
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pnl" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            P&L Tracking
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="pools" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Pool Analysis
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Charts
          </TabsTrigger>
        </TabsList>

        {/* P&L Tracking Tab */}
        <TabsContent value="pnl" className="space-y-6">
          <LazyAnalyticsWrapper>
            <LazyPnLTracker />
          </LazyAnalyticsWrapper>
        </TabsContent>

        {/* Portfolio Overview Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <LazyAnalyticsWrapper>
            <LazyPortfolioOverview />
          </LazyAnalyticsWrapper>
        </TabsContent>

        {/* Pool Analysis Tab */}
        <TabsContent value="pools" className="space-y-6">
          {/* Error State */}
          {analyticsError && (
            <Card className="border-destructive">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <h3 className="font-medium text-destructive">Error Loading Pool Data</h3>
                    <p className="text-sm text-muted-foreground">{analyticsError}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={refreshAnalytics}>
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Pool Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pool TVL</p>
                    {isLoading ? (
                      <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                    ) : (
                      <p className="text-2xl font-bold">
                        {metrics ? formatCurrency(parseFloat(metrics.tvl)) : '$0'}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-sm">
                      {isLoading ? (
                        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                      ) : (metrics?.priceChange24h ?? 0) >= 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">+{formatPercentage(Math.abs(metrics?.priceChange24h || 0) / 100)}</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-red-600" />
                          <span className="text-red-600">{formatPercentage(Math.abs(metrics?.priceChange24h || 0) / 100)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    {isLoading ? (
                      <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                    ) : (
                      <p className="text-2xl font-bold">
                        {metrics ? formatCurrency(parseFloat(metrics.volume24h)) : '$0'}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-sm">
                      {isLoading ? (
                        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                      ) : (metrics?.volumeChange24h ?? 0) >= 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">+{formatPercentage(Math.abs(metrics?.volumeChange24h || 0) / 100)}</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-red-600" />
                          <span className="text-red-600">{formatPercentage(Math.abs(metrics?.volumeChange24h || 0) / 100)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pool APR</p>
                    {isLoading ? (
                      <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                    ) : (
                      <p className="text-2xl font-bold">
                        {metrics ? formatPercentage(metrics.apr / 100) : '0%'}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-sm">
                      {isLoading ? (
                        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                      ) : (metrics?.aprChange24h ?? 0) >= 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">+{formatPercentage(Math.abs(metrics?.aprChange24h || 0) / 100)}</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-red-600" />
                          <span className="text-red-600">{formatPercentage(Math.abs(metrics?.aprChange24h || 0) / 100)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-2 bg-saros-primary/10 rounded-lg">
                    <Percent className="h-5 w-5 text-saros-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Bins</p>
                    {isLoading ? (
                      <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                    ) : (
                      <p className="text-2xl font-bold">{metrics?.activeBins || 0}</p>
                    )}
                    <div className="flex items-center gap-1 text-sm">
                      <Zap className="h-3 w-3 text-orange-600" />
                      <span className="text-muted-foreground">
                        {(metrics?.activeBins ?? 0) > 100 ? 'High Activity' :
                         (metrics?.activeBins ?? 0) > 50 ? 'Medium Activity' : 'Low Activity'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Pool Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fee Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Fee Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 bg-muted animate-pulse rounded-full" style={{ width: '60%' }} />
                        </div>
                        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {feeDistribution.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.binRange}</span>
                          <span className="font-medium">
                            {formatCurrency(parseFloat(item.feesCollected))}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-saros-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.percentage}% of total fees
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Liquidity Concentration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Liquidity Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="pt-4 border-t">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                      <div className="space-y-2">
                        {Array.from({ length: 3 }, (_, i) => (
                          <div key={i} className="flex justify-between">
                            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-8 bg-muted animate-pulse rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Concentration Ratio</span>
                        <Badge className={liquidityConcentration?.optimalRange ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {liquidityConcentration?.optimalRange ? 'Optimal' : 'Suboptimal'}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {liquidityConcentration ? formatPercentage(liquidityConcentration.concentrationRatio) : '0%'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        of liquidity is within ±5 bins of active bin
                      </p>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="text-sm font-medium mb-2">Bin Efficiency</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs">High Activity (±2 bins)</span>
                          <span className="text-xs font-medium">
                            {liquidityConcentration ? formatPercentage(liquidityConcentration.binEfficiency.highActivity) : '0%'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Medium Activity (±5 bins)</span>
                          <span className="text-xs font-medium">
                            {liquidityConcentration ? formatPercentage(liquidityConcentration.binEfficiency.mediumActivity) : '0%'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Low Activity (±10 bins)</span>
                          <span className="text-xs font-medium">
                            {liquidityConcentration ? formatPercentage(liquidityConcentration.binEfficiency.lowActivity) : '0%'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pool Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Historical Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <div className="h-4 w-20 bg-muted animate-pulse rounded mb-1" />
                          <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                      </div>
                    ))}
                    <div className="pt-2 mt-4 border-t">
                      <div className="h-9 w-full bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">7-Day APR</div>
                        <div className="font-semibold text-lg">
                          {historicalPerformance ? formatPercentage(historicalPerformance.apr7d / 100) : '0%'}
                        </div>
                      </div>
                      <Badge variant="outline" className={
(historicalPerformance?.aprChange7d ?? 0) >= 0
                          ? "text-green-700 border-green-200"
                          : "text-red-700 border-red-200"
                      }>
                        {(historicalPerformance?.aprChange7d ?? 0) >= 0 ? '+' : ''}
                        {historicalPerformance ? formatPercentage(historicalPerformance.aprChange7d) : '0%'}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">30-Day APR</div>
                        <div className="font-semibold text-lg">
                          {historicalPerformance ? formatPercentage(historicalPerformance.apr30d / 100) : '0%'}
                        </div>
                      </div>
                      <Badge variant="outline" className={
(historicalPerformance?.aprChange30d ?? 0) >= 0
                          ? "text-green-700 border-green-200"
                          : "text-red-700 border-red-200"
                      }>
                        {(historicalPerformance?.aprChange30d ?? 0) >= 0 ? '+' : ''}
                        {historicalPerformance ? formatPercentage(historicalPerformance.aprChange30d) : '0%'}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Pool Age</div>
                        <div className="font-semibold text-lg">
                          {historicalPerformance ? `${historicalPerformance.poolAge} days` : '0 days'}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {historicalPerformance?.poolAgeCategory || 'Unknown'}
                      </Badge>
                    </div>

                    <div className="pt-2 mt-4 border-t">
                      <Button variant="outline" className="w-full" size="sm" disabled={isLoading}>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Full History
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          {/* Data Source Indicator for Charts */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Pool Liquidity & Price Charts</h3>
                <Badge variant={isRealDataMode ? "default" : "secondary"}>
                  {isRealDataMode ? "Real Data" : "Mock Data"}
                </Badge>
              </div>
              {isRealDataMode && !selectedPoolAddress && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Select a pool to view real data</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Charts with Enhanced Error Handling */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Bin Distribution Chart with Dynamic Data */}
            <SafeBinChart
              bins={chartData.bins.length > 0 ? chartData.bins : mockBins}
              activeBinId={0}
              userBins={userBins}
              height={400}
              onBinClick={ChartHandlers.onBinClick}
            />

            {/* Price & Volume Chart with Dynamic Data */}
            <SafePriceChart
              data={chartData.priceData.length > 0 ? chartData.priceData : mockPriceData}
              currentPrice={152.45}
              priceChange24h={0.0325}
              height={400}
              onTimeframeChange={ChartHandlers.onTimeframeChange}
            />
          </div>

          {/* Real Data Status */}
          {isRealDataMode && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Real Data Mode Active</p>
                  <p className="text-blue-700 mt-1">
                    Chart data shows {chartData.bins.length > 0 && chartData.priceData.length > 0
                      ? 'actual blockchain data for the selected pool'
                      : 'placeholder structure - connect to a pool with positions for real data'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Memoized export for performance optimization
export default memo(AnalyticsPageComponent)