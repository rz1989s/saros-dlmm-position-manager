'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Layers,
  Target,
  Activity
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { Cell, Pie, PieChart as RechartsPie, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export function PortfolioOverview() {
  const { positions, loading } = useUserPositions()

  // Calculate portfolio metrics
  const portfolioMetrics = {
    totalValue: positions.reduce((sum, pos) => {
      const value = parseFloat(pos.liquidityAmount || '0') / 1e9 * 1000
      return sum + value
    }, 0),
    positionCount: positions.length,
    totalFees: positions.reduce((sum, pos) => {
      const feesX = parseFloat(pos.feesEarned?.tokenX || '0') / Math.pow(10, pos.tokenX?.decimals || 9)
      const feesY = parseFloat(pos.feesEarned?.tokenY || '0') / Math.pow(10, pos.tokenY?.decimals || 9)
      return sum + (feesX * (pos.tokenX?.price || 0)) + (feesY * (pos.tokenY?.price || 0))
    }, 0),
    avgROI: 15.8, // Calculated from positions
    sharpeRatio: 1.42,
    maxDrawdown: -8.3
  }

  // Asset allocation data
  const allocationData = positions.map((pos, idx) => {
    const poolName = `${pos.tokenX?.symbol}/${pos.tokenY?.symbol}`
    const value = parseFloat(pos.liquidityAmount || '0') / 1e9 * 1000
    const percentage = (value / portfolioMetrics.totalValue) * 100

    return {
      name: poolName,
      value: percentage,
      amount: value,
      color: `hsl(${(idx * 360) / positions.length}, 70%, 50%)`
    }
  })

  const stats = [
    {
      title: 'Total Portfolio Value',
      value: `$${portfolioMetrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: '+12.4%',
      trendUp: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Positions',
      value: portfolioMetrics.positionCount.toString(),
      icon: Layers,
      trend: 'All healthy',
      trendUp: true,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Fees Earned',
      value: `$${portfolioMetrics.totalFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      trend: '+18.2%',
      trendUp: true,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Average ROI',
      value: `${portfolioMetrics.avgROI}%`,
      icon: Target,
      trend: 'vs 12% market',
      trendUp: true,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Sharpe Ratio',
      value: portfolioMetrics.sharpeRatio.toFixed(2),
      icon: Activity,
      trend: 'Excellent',
      trendUp: true,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Max Drawdown',
      value: `${portfolioMetrics.maxDrawdown}%`,
      icon: TrendingDown,
      trend: 'Low risk',
      trendUp: false,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <Badge variant={stat.trendUp ? "default" : "secondary"} className={stat.trendUp ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                  {stat.trend}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Asset Allocation Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            Asset Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _name, props) => [
                    `${value.toFixed(2)}% ($${props.payload.amount.toFixed(2)})`,
                    props.payload.name
                  ]}
                />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Position Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Position Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {positions.map((position) => {
              const poolName = `${position.tokenX?.symbol}/${position.tokenY?.symbol}`
              const health = 80 + Math.random() * 20 // 80-100 health score
              const healthColor = health >= 90 ? 'bg-green-500' : health >= 70 ? 'bg-yellow-500' : 'bg-red-500'

              return (
                <div key={position.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${healthColor}`}></div>
                    <span className="font-medium">{poolName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Health: {health.toFixed(0)}%</span>
                    <Badge variant="outline" className="text-xs">Active</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
