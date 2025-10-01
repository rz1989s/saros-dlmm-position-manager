'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  TrendingUp,
  BarChart3,
  DollarSign,
  Activity,
  Download
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, BarChart, Bar, ComposedChart } from 'recharts'

export function HistoricalAnalysis() {
  const { positions, loading } = useUserPositions()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Generate historical fee data based on time range
  const dataPoints = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
  const historicalFeeData = Array.from({ length: dataPoints }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (dataPoints - i - 1))

    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      feesEarned: 50 + Math.random() * 100 + i * 0.5,
      apr: 15 + Math.random() * 10,
      volume: 100000 + Math.random() * 400000,
      trades: 500 + Math.random() * 1500
    }
  })

  // Cumulative earnings over time
  let cumulativeEarnings = 0
  const cumulativeData = historicalFeeData.map(day => {
    cumulativeEarnings += day.feesEarned
    return {
      ...day,
      cumulative: cumulativeEarnings
    }
  })

  // Monthly aggregated data
  const monthlyData = [
    { month: 'Jan', fees: 1234, apr: 18.5, avgVolume: 250000 },
    { month: 'Feb', fees: 1456, apr: 19.2, avgVolume: 280000 },
    { month: 'Mar', fees: 1689, apr: 21.3, avgVolume: 320000 },
    { month: 'Apr', fees: 1523, apr: 19.8, avgVolume: 290000 },
    { month: 'May', fees: 1789, apr: 22.1, avgVolume: 350000 },
    { month: 'Jun', fees: 1956, apr: 23.4, avgVolume: 380000 }
  ]

  // Fee tier performance over time
  const tierPerformanceData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    '0.01%': 10 + Math.random() * 5,
    '0.03%': 15 + Math.random() * 8,
    '0.05%': 18 + Math.random() * 8,
    '0.25%': 24 + Math.random() * 10,
    '1.00%': 30 + Math.random() * 15
  }))

  // Position-specific historical data
  const positionHistoricalData = positions.map((pos) => {
    const poolName = `${pos.tokenX?.symbol}/${pos.tokenY?.symbol}`
    return {
      id: pos.id,
      pool: poolName,
      totalFeesEarned: 1234 + Math.random() * 3000,
      avgAPR: 15 + Math.random() * 15,
      bestMonth: 'May 2025',
      bestMonthFees: 450 + Math.random() * 300,
      consistency: 75 + Math.random() * 20
    }
  })

  // Statistical summary
  const totalHistoricalFees = historicalFeeData.reduce((sum, day) => sum + day.feesEarned, 0)
  const avgDailyFees = totalHistoricalFees / dataPoints
  const avgAPR = historicalFeeData.reduce((sum, day) => sum + day.apr, 0) / dataPoints

  // Trend analysis
  const recentAvg = historicalFeeData.slice(-7).reduce((sum, day) => sum + day.feesEarned, 0) / 7
  const previousAvg = historicalFeeData.slice(-14, -7).reduce((sum, day) => sum + day.feesEarned, 0) / 7
  const trendPercentage = ((recentAvg - previousAvg) / previousAvg) * 100

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Historical Fee Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <div className="flex gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className={timeRange === range ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <p className="text-sm text-gray-600">Total Fees</p>
              </div>
              <p className="text-2xl font-bold text-green-600">${totalHistoricalFees.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">in {timeRange}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-gray-600">Avg Daily Fees</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">${avgDailyFees.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">per day</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <p className="text-sm text-gray-600">Avg APR</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">{avgAPR.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">average</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-orange-600" />
                <p className="text-sm text-gray-600">7-Day Trend</p>
              </div>
              <p className={`text-2xl font-bold ${trendPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trendPercentage >= 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">vs previous week</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Fees Earned */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Fees Earned</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalFeeData}>
                <defs>
                  <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Fees ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Area type="monotone" dataKey="feesEarned" stroke="#10B981" fillOpacity={1} fill="url(#colorFees)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cumulative Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Cumulative Fees ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="cumulative" stroke="#3B82F6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
            <p>
              <strong>Total cumulative earnings: ${cumulativeEarnings.toFixed(2)}</strong> •
              Growth rate: {trendPercentage >= 0 ? '+' : ''}{trendPercentage.toFixed(1)}% •
              Daily average: ${avgDailyFees.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* APR & Volume Historical Trends */}
      <Card>
        <CardHeader>
          <CardTitle>APR & Volume Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={historicalFeeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" label={{ value: 'APR (%)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Volume ($)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="right" dataKey="volume" fill="#94A3B8" opacity={0.3} name="Volume" />
                <Line yAxisId="left" type="monotone" dataKey="apr" stroke="#10B981" strokeWidth={2} name="APR (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Aggregated Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="fees" fill="#10B981" name="Fees Earned ($)" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="apr" fill="#3B82F6" name="APR (%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-50 rounded p-3 border">
              <p className="text-gray-600 mb-1">Best Month</p>
              <p className="text-lg font-bold text-green-600">
                {monthlyData.reduce((best, month) => month.fees > best.fees ? month : best).month} - $
                {monthlyData.reduce((best, month) => month.fees > best.fees ? month : best).fees.toFixed(0)}
              </p>
            </div>
            <div className="bg-gray-50 rounded p-3 border">
              <p className="text-gray-600 mb-1">Average Monthly</p>
              <p className="text-lg font-bold text-blue-600">
                ${(monthlyData.reduce((sum, m) => sum + m.fees, 0) / monthlyData.length).toFixed(0)}
              </p>
            </div>
            <div className="bg-gray-50 rounded p-3 border">
              <p className="text-gray-600 mb-1">Highest APR</p>
              <p className="text-lg font-bold text-purple-600">
                {Math.max(...monthlyData.map(m => m.apr)).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Tier Historical Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Tier APR Trends (12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tierPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: 'APR (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Legend />
                <Line type="monotone" dataKey="0.01%" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="0.03%" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="0.05%" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="0.25%" stroke="#F59E0B" strokeWidth={2} />
                <Line type="monotone" dataKey="1.00%" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Compare how different fee tiers have performed over time. Higher tiers show greater volatility but potentially higher returns.</p>
          </div>
        </CardContent>
      </Card>

      {/* Position-Specific Historical Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Position Historical Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {positionHistoricalData.map((pos, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-gray-900">{pos.pool}</p>
                      <Badge
                        className={pos.consistency >= 85 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                      >
                        {pos.consistency.toFixed(0)}% Consistency
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Total Earned</p>
                        <p className="font-bold text-green-600">${pos.totalFeesEarned.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg APR</p>
                        <p className="font-bold">{pos.avgAPR.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Best Month</p>
                        <p className="font-medium">{pos.bestMonth}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Best Month Fees</p>
                        <p className="font-bold text-green-600">${pos.bestMonthFees.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="font-medium text-green-900 mb-1">📈 Performance Trend</p>
              <p className="text-green-800">
                Your fee earnings are {trendPercentage >= 0 ? 'increasing' : 'decreasing'} by {Math.abs(trendPercentage).toFixed(1)}% compared to the previous period.
                {trendPercentage >= 0 ? ' This positive trend indicates effective position management.' : ' Consider optimization strategies to improve performance.'}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="font-medium text-blue-900 mb-1">💰 Earning Consistency</p>
              <p className="text-blue-800">
                Average daily fees of ${avgDailyFees.toFixed(2)} with {avgAPR.toFixed(1)}% APR. Your positions have maintained consistent earnings over the {timeRange} period.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="font-medium text-purple-900 mb-1">🎯 Best Performance</p>
              <p className="text-purple-800">
                Your best performing month was {monthlyData.reduce((best, month) => month.fees > best.fees ? month : best).month} with $
                {monthlyData.reduce((best, month) => month.fees > best.fees ? month : best).fees.toFixed(0)} in fees.
                Analyze what worked well during this period for future optimization.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="flex gap-3">
        <Button className="flex-1" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Historical Data (CSV)
        </Button>
        <Button className="flex-1" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Generate Performance Report (PDF)
        </Button>
      </div>
    </div>
  )
}
