'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Activity, Clock } from 'lucide-react'
import { formatCurrency, formatPercentage, formatDuration } from '@/lib/utils/format'

const getMockAnalytics = () => ({
  totalVolume24h: 125678.45,
  totalFees24h: 1234.67,
  avgAPR: 0.1245,
  totalPositions: 3,
  bestPerforming: {
    pool: 'SOL/USDC',
    apr: 0.1567,
    fees24h: 456.78,
  },
  recentActivity: [
    { type: 'deposit', amount: 1000, pool: 'SOL/USDC', time: new Date(Date.now() - 3600000) },
    { type: 'fees', amount: 25.45, pool: 'RAY/SOL', time: new Date(Date.now() - 7200000) },
    { type: 'rebalance', amount: 0, pool: 'ORCA/USDC', time: new Date(Date.now() - 10800000) },
  ]
})

export function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark as client-side rendered and initialize data
    setIsClient(true)
    setAnalytics(getMockAnalytics())

    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading || !isClient || !analytics) {
    return (
      <Card className="chart-container">
        <CardHeader>
          <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="chart-container">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Analytics Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">24h Volume</p>
            <p className="text-xl font-semibold">
              {formatCurrency(analytics.totalVolume24h)}
            </p>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+12.5%</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">24h Fees</p>
            <p className="text-xl font-semibold">
              {formatCurrency(analytics.totalFees24h)}
            </p>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+8.2%</span>
            </div>
          </div>
        </div>

        {/* Average APR */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Average APR</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-saros-primary">
              {formatPercentage(analytics.avgAPR)}
            </span>
            <Badge className="bg-green-100 text-green-800">
              Above Market
            </Badge>
          </div>
        </div>

        {/* Best Performing Pool */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Best Performing Pool</p>
          <div className="p-3 bg-gradient-to-r from-saros-primary/5 to-saros-secondary/5 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{analytics.bestPerforming.pool}</h4>
              <Badge variant="secondary">
                {formatPercentage(analytics.bestPerforming.apr)} APR
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              24h Fees: {formatCurrency(analytics.bestPerforming.fees24h)}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Recent Activity</p>
          <div className="space-y-2">
            {analytics.recentActivity.map((activity: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  {activity.type === 'deposit' && <TrendingUp className="h-4 w-4 text-green-600" />}
                  {activity.type === 'fees' && <Activity className="h-4 w-4 text-blue-600" />}
                  {activity.type === 'rebalance' && <Clock className="h-4 w-4 text-orange-600" />}
                  <div>
                    <p className="text-sm font-medium capitalize">{activity.type}</p>
                    <p className="text-xs text-muted-foreground">{activity.pool}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.amount > 0 && (
                    <p className="text-sm font-medium">
                      {formatCurrency(activity.amount)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(Math.floor((Date.now() - activity.time.getTime()) / 1000))} ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}