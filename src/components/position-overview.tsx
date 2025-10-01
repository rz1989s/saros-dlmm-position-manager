'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, TrendingUp, DollarSign, Percent } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'

const mockData = {
  totalValue: 12500.45,
  totalPnL: 850.32,
  pnlPercentage: 0.0729,
  totalFees: 245.18,
  activePositions: 3,
}

export function PositionOverview() {
  const [data] = useState(mockData)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Portfolio Value',
      value: formatCurrency(data.totalValue),
      icon: DollarSign,
      trend: '+2.5%',
      positive: true,
    },
    {
      title: 'Total P&L',
      value: formatCurrency(data.totalPnL),
      icon: TrendingUp,
      trend: formatPercentage(data.pnlPercentage),
      positive: data.totalPnL > 0,
    },
    {
      title: 'Fees Earned',
      value: formatCurrency(data.totalFees),
      icon: Percent,
      trend: '+15.2%',
      positive: true,
    },
    {
      title: 'Active Positions',
      value: data.activePositions.toString(),
      icon: Activity,
      trend: '3 pools',
      positive: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="position-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center space-x-2 text-xs">
              <Badge
                variant={card.positive ? 'default' : 'destructive'}
                className={card.positive ? 'bg-green-100 text-green-800' : ''}
              >
                {card.trend}
              </Badge>
              <span className="text-muted-foreground">24h</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}