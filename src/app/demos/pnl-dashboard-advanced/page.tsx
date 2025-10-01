'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { formatCurrency, formatNumber } from '@/lib/utils/format'
import {
  TrendingUp,
  Activity,
  CheckCircle,
  DollarSign,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface TimeframePnL {
  period: string
  realized: number
  unrealized: number
  total: number
  trades: number
  winRate: number
}

interface StrategyPnL {
  strategy: string
  pnl: number
  trades: number
  winRate: number
  profitFactor: number
  sharpeRatio: number
}

interface HistoricalPnL {
  date: string
  realized: number
  unrealized: number
  total: number
  cumulative: number
}

export default function PnLDashboardAdvancedDemo() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | 'ALL'>('1W')

  const timeframePnL: Record<string, TimeframePnL> = {
    '1D': { period: '24 Hours', realized: 450, unrealized: 320, total: 770, trades: 12, winRate: 75.0 },
    '1W': { period: '7 Days', realized: 2840, unrealized: 1560, total: 4400, trades: 45, winRate: 68.9 },
    '1M': { period: '30 Days', realized: 8950, unrealized: 2100, total: 11050, trades: 156, winRate: 64.1 },
    '3M': { period: '90 Days', realized: 18750, unrealized: 3200, total: 21950, trades: 387, winRate: 61.5 },
    'ALL': { period: 'All Time', realized: 32400, unrealized: 4850, total: 37250, trades: 892, winRate: 62.8 }
  }

  const strategyPnL: StrategyPnL[] = [
    {
      strategy: 'Concentrated Liquidity',
      pnl: 15680,
      trades: 234,
      winRate: 68.4,
      profitFactor: 2.34,
      sharpeRatio: 1.87
    },
    {
      strategy: 'Range Trading',
      pnl: 8920,
      trades: 189,
      winRate: 71.2,
      profitFactor: 2.89,
      sharpeRatio: 2.14
    },
    {
      strategy: 'Mean Reversion',
      pnl: 5450,
      trades: 156,
      winRate: 62.8,
      profitFactor: 1.92,
      sharpeRatio: 1.56
    },
    {
      strategy: 'Trend Following',
      pnl: 3780,
      trades: 98,
      winRate: 58.2,
      profitFactor: 1.67,
      sharpeRatio: 1.23
    },
    {
      strategy: 'Arbitrage',
      pnl: 2340,
      trades: 145,
      winRate: 76.5,
      profitFactor: 3.12,
      sharpeRatio: 2.45
    },
    {
      strategy: 'Market Making',
      pnl: 1080,
      trades: 70,
      winRate: 64.3,
      profitFactor: 1.84,
      sharpeRatio: 1.42
    }
  ]

  const historicalPnL: HistoricalPnL[] = [
    { date: 'Jan 1', realized: 1200, unrealized: 450, total: 1650, cumulative: 1650 },
    { date: 'Jan 8', realized: 1850, unrealized: 680, total: 2530, cumulative: 4180 },
    { date: 'Jan 15', realized: 2340, unrealized: 890, total: 3230, cumulative: 7410 },
    { date: 'Jan 22', realized: 1980, unrealized: 560, total: 2540, cumulative: 9950 },
    { date: 'Jan 29', realized: 2560, unrealized: 920, total: 3480, cumulative: 13430 },
    { date: 'Feb 5', realized: 3120, unrealized: 1100, total: 4220, cumulative: 17650 },
    { date: 'Feb 12', realized: 2890, unrealized: 780, total: 3670, cumulative: 21320 },
    { date: 'Feb 19', realized: 3450, unrealized: 1230, total: 4680, cumulative: 26000 },
    { date: 'Feb 26', realized: 2780, unrealized: 890, total: 3670, cumulative: 29670 },
    { date: 'Mar 5', realized: 3890, unrealized: 1450, total: 5340, cumulative: 35010 },
    { date: 'Mar 12', realized: 2120, unrealized: 650, total: 2770, cumulative: 37780 }
  ]

  const profitFactorData = strategyPnL.map(s => ({
    strategy: s.strategy.split(' ')[0],
    profitFactor: s.profitFactor,
    sharpe: s.sharpeRatio
  }))

  const winRateData = strategyPnL.map(s => ({
    strategy: s.strategy.split(' ')[0],
    winRate: s.winRate,
    trades: s.trades
  }))

  const currentData = timeframePnL[selectedTimeframe]
  const totalPnL = currentData.total
  const pnlPercent = (totalPnL / 125000) * 100

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[26] || { id: 26, name: 'Advanced P&L Dashboard', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Advanced P&L Analysis</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Advanced P&L Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Multi-timeframe P&L analysis with strategy attribution, historical trends, and comprehensive profit factor calculations
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3" />
              SDK Feature #26
            </Badge>
            <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700">
              <TrendingUp className="h-3 w-3" />
              Real-time Tracking
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      {/* Timeframe Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Timeframe Selection
          </CardTitle>
          <CardDescription>Select period for P&L analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['1D', '1W', '1M', '3M', 'ALL'] as const).map((tf) => (
              <Button
                key={tf}
                variant={selectedTimeframe === tf ? 'default' : 'outline'}
                onClick={() => setSelectedTimeframe(tf)}
                className="flex-1"
              >
                {tf}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* P&L Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{formatCurrency(currentData.total)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{pnlPercent.toFixed(2)}% return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Realized P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              +{formatCurrency(currentData.realized)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((currentData.realized / currentData.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unrealized P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              +{formatCurrency(currentData.unrealized)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((currentData.unrealized / currentData.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(currentData.trades)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {formatCurrency(currentData.total / currentData.trades)}/trade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {currentData.winRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.floor(currentData.trades * currentData.winRate / 100)} winning trades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="historical">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="historical">Historical Trends</TabsTrigger>
          <TabsTrigger value="strategy">Strategy Attribution</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        {/* Historical Trends */}
        <TabsContent value="historical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                P&L Historical Trend
              </CardTitle>
              <CardDescription>Realized vs unrealized P&L over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={historicalPnL}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="realized" fill="#3b82f6" name="Realized" />
                  <Bar yAxisId="left" dataKey="unrealized" fill="#8b5cf6" name="Unrealized" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Cumulative P&L"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Weekly P&L Breakdown
                </CardTitle>
                <CardDescription>Total P&L by week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={historicalPnL}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="total" fill="#10b981" name="Total P&L" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Cumulative Returns
                </CardTitle>
                <CardDescription>Total cumulative P&L growth</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={historicalPnL}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                      name="Cumulative P&L"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Strategy Attribution */}
        <TabsContent value="strategy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                P&L by Strategy
              </CardTitle>
              <CardDescription>Performance breakdown by trading strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={strategyPnL} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="strategy" type="category" width={150} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="pnl" fill="#10b981" name="P&L" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Strategy Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strategyPnL.map((strategy, index) => (
                  <motion.div
                    key={strategy.strategy}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{strategy.strategy}</h4>
                      <Badge variant="default" className="bg-green-500">
                        +{formatCurrency(strategy.pnl)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Trades</span>
                        <div className="font-medium">{strategy.trades}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Win Rate</span>
                        <div className="font-medium text-blue-600">{strategy.winRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Profit Factor</span>
                        <div className="font-medium text-green-600">{strategy.profitFactor.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sharpe Ratio</span>
                        <div className="font-medium text-purple-600">{strategy.sharpeRatio.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg P&L</span>
                        <div className="font-medium">
                          {formatCurrency(strategy.pnl / strategy.trades)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Metrics */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Profit Factor by Strategy
                </CardTitle>
                <CardDescription>Risk-adjusted performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={profitFactorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="strategy" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="profitFactor" fill="#10b981" name="Profit Factor" />
                    <Bar dataKey="sharpe" fill="#3b82f6" name="Sharpe Ratio" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  Win Rate Analysis
                </CardTitle>
                <CardDescription>Success rate by strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={winRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="strategy" angle={-45} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="winRate" fill="#f59e0b" name="Win Rate %" />
                    <Bar yAxisId="right" dataKey="trades" fill="#8b5cf6" name="Total Trades" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Best Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-600">Concentrated</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(strategyPnL[0].pnl)} P&L
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Highest Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-blue-600">
                  {Math.max(...strategyPnL.map(s => s.winRate)).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Arbitrage strategy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Best Profit Factor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-600">
                  {Math.max(...strategyPnL.map(s => s.profitFactor)).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Arbitrage strategy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Best Sharpe Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-orange-600">
                  {Math.max(...strategyPnL.map(s => s.sharpeRatio)).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Arbitrage strategy</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Implementation Details */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle className="h-5 w-5" />
            Advanced P&L Features
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-green-800 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Multi-Timeframe Analysis:</strong> P&L tracking across 1D, 1W, 1M, 3M, and all-time periods</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Strategy Attribution:</strong> Detailed P&L breakdown by trading strategy with performance metrics</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Historical Trends:</strong> Comprehensive trend analysis with realized/unrealized separation</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Profit Factor Calculations:</strong> Risk-adjusted performance with Sharpe ratio and win rate analysis</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Real-Time Updates:</strong> Live P&L tracking with automatic recalculation and cumulative totals</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
