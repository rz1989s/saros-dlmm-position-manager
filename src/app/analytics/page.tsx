'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { LazyAnalyticsWrapper, LazyChartWrapper } from '@/components/ui/lazy-loading'
import {
  LazyPnLTracker,
  LazyPortfolioOverview,
  LazyBinChart,
  LazyPriceChart
} from '@/lib/lazy-components'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Calendar
} from 'lucide-react'
import { BinInfo } from '@/lib/types'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'

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

export default function AnalyticsPage() {
  const [selectedPool, setSelectedPool] = useState('SOL/USDC')
  const [selectedMetric, setSelectedMetric] = useState<'liquidity' | 'volume' | 'fees'>('liquidity')

  const pools = ['SOL/USDC', 'RAY/SOL', 'ORCA/USDC', 'MNGO/SOL']

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
      <DashboardHeader />
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive P&L tracking, portfolio insights, and DLMM pool analytics
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedPool}
            onChange={(e) => setSelectedPool(e.target.value)}
            className="border border-input rounded-md px-4 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {pools.map(pool => (
              <option key={pool} value={pool}>{pool}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="pnl" className="space-y-6">
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
          {/* Key Pool Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pool TVL</p>
                    <p className="text-2xl font-bold">{formatCurrency(2456789)}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">+12.5%</span>
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
                    <p className="text-2xl font-bold">{formatCurrency(1234567)}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingDown className="h-3 w-3 text-red-600" />
                      <span className="text-red-600">-3.2%</span>
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
                    <p className="text-2xl font-bold">{formatPercentage(0.1247)}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">+0.8%</span>
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
                    <p className="text-2xl font-bold">127</p>
                    <div className="flex items-center gap-1 text-sm">
                      <Zap className="h-3 w-3 text-orange-600" />
                      <span className="text-muted-foreground">High Activity</span>
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
                <div className="space-y-3">
                  {[
                    { range: 'Bin -2 to 2', percentage: 45, fees: 1234 },
                    { range: 'Bin -5 to -3', percentage: 25, fees: 687 },
                    { range: 'Bin 3 to 5', percentage: 20, fees: 549 },
                    { range: 'Other Bins', percentage: 10, fees: 275 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.range}</span>
                        <span className="font-medium">{formatCurrency(item.fees)}</span>
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
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Concentration Ratio</span>
                      <Badge className="bg-green-100 text-green-800">Optimal</Badge>
                    </div>
                    <div className="text-2xl font-bold text-green-600">78%</div>
                    <p className="text-xs text-muted-foreground">
                      of liquidity is within ±5 bins of active bin
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium mb-2">Bin Efficiency</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs">High Activity (±2 bins)</span>
                        <span className="text-xs font-medium">92%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs">Medium Activity (±5 bins)</span>
                        <span className="text-xs font-medium">67%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs">Low Activity (±10 bins)</span>
                        <span className="text-xs font-medium">23%</span>
                      </div>
                    </div>
                  </div>
                </div>
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-muted-foreground">7-Day APR</div>
                      <div className="font-semibold text-lg">{formatPercentage(0.1156)}</div>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-200">
                      +8.2%
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-muted-foreground">30-Day APR</div>
                      <div className="font-semibold text-lg">{formatPercentage(0.1089)}</div>
                    </div>
                    <Badge variant="outline" className="text-blue-700 border-blue-200">
                      +12.8%
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Pool Age</div>
                      <div className="font-semibold text-lg">127 days</div>
                    </div>
                    <Badge variant="outline">
                      Mature
                    </Badge>
                  </div>

                  <div className="pt-2 mt-4 border-t">
                    <Button variant="outline" className="w-full" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Full History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          {/* Main Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Bin Distribution Chart */}
            <LazyChartWrapper>
              <LazyBinChart
                bins={mockBins}
                activeBinId={0}
                userBins={userBins}
                height={400}
                onBinClick={(binId) => console.log('Clicked bin:', binId)}
              />
            </LazyChartWrapper>

            {/* Price & Volume Chart */}
            <LazyChartWrapper>
              <LazyPriceChart
                data={mockPriceData}
                currentPrice={152.45}
                priceChange24h={0.0325}
                height={400}
                onTimeframeChange={(timeframe) => console.log('Changed timeframe:', timeframe)}
              />
            </LazyChartWrapper>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}