'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Activity, Clock, BarChart3, Play, Square } from 'lucide-react'
import {
  priceHistoryTracker,
  type PriceHistoryStats,
  type TrendAnalysis,
  type PriceComparison,
  type HistoricalChartData
} from '@/lib/oracle/price-history'

export default function PriceHistoryDemo() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('SOL')
  const [isTracking, setIsTracking] = useState(false)
  const [stats, setStats] = useState<PriceHistoryStats | null>(null)
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null)
  const [chartData, setChartData] = useState<HistoricalChartData | null>(null)
  const [comparison, setComparison] = useState<PriceComparison | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<HistoricalChartData['timeframe']>('1m')
  const [systemStats, setSystemStats] = useState<any>(null)

  const symbols = ['SOL', 'USDC', 'ETH', 'BTC']
  const timeframes: { value: HistoricalChartData['timeframe']; label: string }[] = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' }
  ]

  // Load data
  const loadData = async () => {
    try {
      // Get statistics
      const statsData = priceHistoryTracker.getStats(selectedSymbol)
      setStats(statsData)

      // Get trend analysis
      const trendData = priceHistoryTracker.analyzeTrend(selectedSymbol)
      setTrendAnalysis(trendData)

      // Get chart data
      const chartDataResult = priceHistoryTracker.getChartData(selectedSymbol, selectedTimeframe)
      setChartData(chartDataResult)

      // Get comparison
      const timeframeSeconds = getTimeframeSeconds(selectedTimeframe)
      const comparisonData = priceHistoryTracker.compareTimeframe(
        selectedSymbol,
        timeframeSeconds,
        selectedTimeframe
      )
      setComparison(comparisonData)

      // Get system stats
      const sysStats = priceHistoryTracker.getSystemStats()
      setSystemStats(sysStats)

    } catch (error) {
      console.error('Error loading price history data:', error)
    }
  }

  // Convert timeframe to seconds
  const getTimeframeSeconds = (timeframe: string): number => {
    const map: Record<string, number> = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400
    }
    return map[timeframe] || 60
  }

  // Toggle tracking
  const toggleTracking = async () => {
    if (isTracking) {
      priceHistoryTracker.stopTracking(selectedSymbol)
      setIsTracking(false)
    } else {
      await priceHistoryTracker.startTracking(selectedSymbol)
      setIsTracking(true)
    }
  }

  // Load data periodically
  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [selectedSymbol, selectedTimeframe])

  // Format chart data
  const formattedChartData = chartData?.data.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    price: point.price,
    confidence: point.confidence * 100
  })) || []

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Price History Tracking</h1>
        <p className="text-muted-foreground">
          Feature #15: Historical price analysis with trend identification
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Controls</CardTitle>
          <CardDescription>Configure price history tracking and analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Symbol Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Symbol</label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {symbols.map(symbol => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timeframe Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Timeframe</label>
              <Select value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map(tf => (
                    <SelectItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tracking Toggle */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tracking</label>
              <Button
                onClick={toggleTracking}
                variant={isTracking ? 'destructive' : 'default'}
                className="w-full"
              >
                {isTracking ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop Tracking
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Tracking
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* System Stats */}
          {systemStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Tracked Symbols</p>
                <p className="text-2xl font-bold">{systemStats.trackedSymbols}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Points</p>
                <p className="text-2xl font-bold">{systemStats.totalDataPoints}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Memory Usage</p>
                <p className="text-2xl font-bold">{(systemStats.memoryUsage / 1024).toFixed(1)} KB</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Trackers</p>
                <p className="text-2xl font-bold">{systemStats.activeTrackers}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Price Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current</span>
                  <span className="font-bold">${stats.priceRange.current.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">High</span>
                  <span className="text-green-600">${stats.priceRange.max.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Low</span>
                  <span className="text-red-600">${stats.priceRange.min.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average</span>
                  <span>${stats.averagePrice.toFixed(4)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Data Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data Points</span>
                  <span className="font-bold">{stats.dataPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Time Span</span>
                  <span>{(stats.timeSpan / 60).toFixed(1)} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volatility</span>
                  <span>{stats.volatility.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Trend</span>
                  <Badge variant={stats.trend === 'up' ? 'default' : stats.trend === 'down' ? 'destructive' : 'secondary'}>
                    {stats.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                    {stats.trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                    {stats.trend === 'stable' && <Activity className="w-3 h-3 mr-1" />}
                    {stats.trend.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Confidence</span>
                  <span className="font-bold">{(stats.averageConfidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">First Update</span>
                  <span className="text-xs">{stats.firstTimestamp.toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Update</span>
                  <span className="text-xs">{stats.lastTimestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Price Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price History Chart</CardTitle>
          <CardDescription>Historical price data with confidence intervals</CardDescription>
        </CardHeader>
        <CardContent>
          {formattedChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={formattedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                  name="Price ($)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="confidence"
                  stroke="#82ca9d"
                  strokeWidth={1}
                  dot={false}
                  name="Confidence (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No historical data available</p>
                <p className="text-sm">Start tracking to collect price history</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      {trendAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
            <CardDescription>Technical indicators and trend identification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trend Overview */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Trend Direction</h4>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={trendAnalysis.trend === 'up' ? 'default' : trendAnalysis.trend === 'down' ? 'destructive' : 'secondary'}
                      className="text-lg"
                    >
                      {trendAnalysis.trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
                      {trendAnalysis.trend === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
                      {trendAnalysis.trend === 'stable' && <Activity className="w-4 h-4 mr-1" />}
                      {trendAnalysis.trend.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{trendAnalysis.strength}</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Momentum Analysis</h4>
                  <Badge
                    variant={
                      trendAnalysis.analysis.momentum === 'bullish'
                        ? 'default'
                        : trendAnalysis.analysis.momentum === 'bearish'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {trendAnalysis.analysis.momentum.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Volatility</h4>
                  <Badge variant="outline">{trendAnalysis.analysis.volatility.toUpperCase()}</Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Confidence</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full"
                        style={{ width: `${trendAnalysis.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{(trendAnalysis.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Technical Indicators */}
              <div className="space-y-3">
                <h4 className="font-semibold mb-2">Technical Indicators</h4>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">SMA (20)</span>
                    <span className="font-medium">${trendAnalysis.indicators.sma20.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">EMA (20)</span>
                    <span className="font-medium">${trendAnalysis.indicators.ema20.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">RSI</span>
                    <span className="font-medium">{trendAnalysis.indicators.rsi.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Momentum</span>
                    <span
                      className={`font-medium ${
                        trendAnalysis.indicators.momentum > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {(trendAnalysis.indicators.momentum * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Support</span>
                    <span className="font-medium text-green-600">${trendAnalysis.analysis.support.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Resistance</span>
                    <span className="font-medium text-red-600">${trendAnalysis.analysis.resistance.toFixed(4)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <h5 className="text-sm font-semibold mb-2">Price Prediction</h5>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Next Price</span>
                      <span className="font-medium">${trendAnalysis.prediction.nextPrice.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span>{(trendAnalysis.prediction.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Comparison */}
      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle>
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Price Comparison
            </CardTitle>
            <CardDescription>Performance metrics for selected timeframe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-lg font-bold">${comparison.open.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Close</p>
                <p className="text-lg font-bold">${comparison.close.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High</p>
                <p className="text-lg font-bold text-green-600">${comparison.high.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low</p>
                <p className="text-lg font-bold text-red-600">${comparison.low.toFixed(4)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Price Change</p>
                <p className={`text-xl font-bold ${comparison.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.priceChange >= 0 ? '+' : ''}${comparison.priceChange.toFixed(4)}
                  {' '}
                  ({comparison.priceChangePercent >= 0 ? '+' : ''}{comparison.priceChangePercent.toFixed(2)}%)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volatility Change</p>
                <p className={`text-xl font-bold ${comparison.volatilityChange >= 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                  {comparison.volatilityChange >= 0 ? '+' : ''}{comparison.volatilityChange.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
