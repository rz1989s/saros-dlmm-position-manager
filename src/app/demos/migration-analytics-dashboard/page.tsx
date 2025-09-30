'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, CheckCircle, Clock } from 'lucide-react'

interface MigrationMetric {
  id: string
  fromPool: string
  toPool: string
  status: 'completed' | 'in-progress' | 'failed'
  timestamp: string
  costSavings: number
  aprImprovement: number
  executionTime: number
}

interface PerformanceMetric {
  category: string
  before: number
  after: number
  improvement: number
  impact: 'high' | 'medium' | 'low'
}

interface SuccessMetric {
  metric: string
  value: number
  target: number
  status: 'exceeds' | 'meets' | 'below'
  trend: 'up' | 'stable' | 'down'
}

interface HistoricalData {
  date: string
  migrations: number
  successRate: number
  avgCostSavings: number
  avgAprImprovement: number
}

export default function MigrationAnalyticsDashboard() {
  const recentMigrations: MigrationMetric[] = [
    {
      id: 'MIG-001',
      fromPool: 'SOL/USDC (0.3%)',
      toPool: 'SOL/USDC (0.25%)',
      status: 'completed',
      timestamp: '2024-03-15 14:30:00',
      costSavings: 1250,
      aprImprovement: 2.5,
      executionTime: 45,
    },
    {
      id: 'MIG-002',
      fromPool: 'BONK/SOL (1.0%)',
      toPool: 'BONK/SOL (0.5%)',
      status: 'completed',
      timestamp: '2024-03-15 13:15:00',
      costSavings: 850,
      aprImprovement: 3.8,
      executionTime: 38,
    },
    {
      id: 'MIG-003',
      fromPool: 'RAY/USDC (0.5%)',
      toPool: 'RAY/USDC (0.3%)',
      status: 'in-progress',
      timestamp: '2024-03-15 14:40:00',
      costSavings: 0,
      aprImprovement: 0,
      executionTime: 0,
    },
    {
      id: 'MIG-004',
      fromPool: 'JTO/SOL (1.5%)',
      toPool: 'JTO/SOL (1.0%)',
      status: 'failed',
      timestamp: '2024-03-15 12:45:00',
      costSavings: 0,
      aprImprovement: 0,
      executionTime: 25,
    },
  ]

  const performanceMetrics: PerformanceMetric[] = [
    { category: 'Average APR', before: 15.5, after: 18.2, improvement: 17.4, impact: 'high' },
    { category: 'Monthly Costs', before: 5200, after: 3850, improvement: 26.0, impact: 'high' },
    { category: 'Liquidity Utilization', before: 68, after: 82, improvement: 20.6, impact: 'medium' },
    { category: 'Position Efficiency', before: 72, after: 88, improvement: 22.2, impact: 'high' },
  ]

  const successMetrics: SuccessMetric[] = [
    { metric: 'Migration Success Rate', value: 92.5, target: 90, status: 'exceeds', trend: 'up' },
    { metric: 'Average Cost Savings', value: 1150, target: 1000, status: 'exceeds', trend: 'up' },
    { metric: 'APR Improvement', value: 2.8, target: 2.5, status: 'exceeds', trend: 'stable' },
    { metric: 'Execution Time (seconds)', value: 42, target: 60, status: 'exceeds', trend: 'down' },
  ]

  const historicalData: HistoricalData[] = [
    { date: '2024-03-11', migrations: 5, successRate: 100, avgCostSavings: 1200, avgAprImprovement: 2.5 },
    { date: '2024-03-12', migrations: 8, successRate: 87.5, avgCostSavings: 1100, avgAprImprovement: 3.2 },
    { date: '2024-03-13', migrations: 6, successRate: 100, avgCostSavings: 950, avgAprImprovement: 2.8 },
    { date: '2024-03-14', migrations: 7, successRate: 85.7, avgCostSavings: 1300, avgAprImprovement: 2.9 },
    { date: '2024-03-15', migrations: 4, successRate: 75, avgCostSavings: 1050, avgAprImprovement: 3.1 },
  ]

  const overallMetrics = {
    totalMigrations: recentMigrations.length,
    completedMigrations: recentMigrations.filter((m) => m.status === 'completed').length,
    totalCostSavings: recentMigrations.filter((m) => m.status === 'completed').reduce((sum, m) => sum + m.costSavings, 0),
    avgAprImprovement: (
      recentMigrations.filter((m) => m.status === 'completed').reduce((sum, m) => sum + m.aprImprovement, 0) /
      recentMigrations.filter((m) => m.status === 'completed').length
    ).toFixed(1),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'exceeds':
        return 'text-green-600'
      case 'in-progress':
      case 'meets':
        return 'text-blue-600'
      case 'failed':
      case 'below':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Migration Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Performance tracking, success metrics, and migration impact analysis
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #45
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Migrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalMigrations}</div>
            <p className="text-xs text-muted-foreground">{overallMetrics.completedMigrations} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Cost Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${overallMetrics.totalCostSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg APR Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{overallMetrics.avgAprImprovement}%</div>
            <p className="text-xs text-muted-foreground">Per migration</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((overallMetrics.completedMigrations / overallMetrics.totalMigrations) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Recent migrations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-2" />
            Recent Migrations
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="success">
            <CheckCircle className="h-4 w-4 mr-2" />
            Success Metrics
          </TabsTrigger>
          <TabsTrigger value="historical">
            <BarChart3 className="h-4 w-4 mr-2" />
            Historical Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Migration Activity</CardTitle>
              <CardDescription>Latest position migrations and their outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMigrations.map((migration) => (
                  <div key={migration.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{migration.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {migration.fromPool} → {migration.toPool}
                        </div>
                        <div className="text-xs text-muted-foreground">{migration.timestamp}</div>
                      </div>
                      <Badge
                        variant={
                          migration.status === 'completed'
                            ? 'default'
                            : migration.status === 'in-progress'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className={getStatusColor(migration.status)}
                      >
                        {migration.status === 'completed' ? '✓ COMPLETED' : migration.status === 'in-progress' ? '⏳ IN PROGRESS' : '✗ FAILED'}
                      </Badge>
                    </div>
                    {migration.status === 'completed' && (
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Cost Savings</div>
                          <div className="font-medium text-green-600">${migration.costSavings.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">APR Improvement</div>
                          <div className="font-medium text-green-600">+{migration.aprImprovement}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Execution Time</div>
                          <div className="font-medium">{migration.executionTime}s</div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {migration.status === 'failed' && (
                        <Button size="sm" variant="default">
                          Retry Migration
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Impact Analysis</CardTitle>
              <CardDescription>Before vs. after migration performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{metric.category}</div>
                        <div className="text-sm text-muted-foreground">Performance improvement after migrations</div>
                      </div>
                      <Badge variant="outline" className={getImpactColor(metric.impact)}>
                        {metric.impact.toUpperCase()} IMPACT
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Before</div>
                        <div className="text-2xl font-bold">
                          {metric.category.includes('Costs') ? '$' : ''}
                          {metric.before.toLocaleString()}
                          {metric.category.includes('%') || !metric.category.includes('Costs') && metric.before < 100 ? '%' : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">After</div>
                        <div className="text-2xl font-bold text-green-600">
                          {metric.category.includes('Costs') ? '$' : ''}
                          {metric.after.toLocaleString()}
                          {metric.category.includes('%') || !metric.category.includes('Costs') && metric.after < 100 ? '%' : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Improvement</div>
                        <div className="text-2xl font-bold text-green-600">+{metric.improvement.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Improvement</span>
                        <span className="font-medium text-green-600">{metric.improvement.toFixed(1)}%</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div className="bg-green-500 rounded-full h-2" style={{ width: `${Math.min(metric.improvement, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="success" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Success Metrics & KPIs</CardTitle>
              <CardDescription>Key performance indicators tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {successMetrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{metric.metric}</div>
                        <div className="text-sm text-muted-foreground">Target: {metric.target.toLocaleString()}</div>
                      </div>
                      <Badge
                        variant={metric.status === 'exceeds' ? 'default' : metric.status === 'meets' ? 'secondary' : 'destructive'}
                        className={getStatusColor(metric.status)}
                      >
                        {metric.status === 'exceeds' ? '✓ EXCEEDS' : metric.status === 'meets' ? '✓ MEETS' : '✗ BELOW'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Current Value</div>
                        <div className={`text-3xl font-bold ${getStatusColor(metric.status)}`}>
                          {metric.metric.includes('Rate') ? `${metric.value}%` : metric.value.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Trend</div>
                        <Badge variant="outline">
                          {metric.trend === 'up' ? '↗ INCREASING' : metric.trend === 'down' ? '↘ DECREASING' : '→ STABLE'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">vs. Target</span>
                        <span className={`font-medium ${getStatusColor(metric.status)}`}>
                          {((metric.value / metric.target) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className={`rounded-full h-2 ${metric.status === 'exceeds' ? 'bg-green-500' : metric.status === 'meets' ? 'bg-blue-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Migration Data</CardTitle>
              <CardDescription>Trends and patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historicalData.map((data, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{data.date}</div>
                      <Badge variant="outline">{data.migrations} migrations</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Success Rate</div>
                        <div className="font-medium text-green-600">{data.successRate}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Cost Savings</div>
                        <div className="font-medium">${data.avgCostSavings}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg APR Improvement</div>
                        <div className="font-medium">+{data.avgAprImprovement}%</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Migrations</div>
                      <div className="text-2xl font-bold">{historicalData.reduce((sum, d) => sum + d.migrations, 0)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Avg Success Rate</div>
                      <div className="text-2xl font-bold text-green-600">
                        {(historicalData.reduce((sum, d) => sum + d.successRate, 0) / historicalData.length).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Savings</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${historicalData.reduce((sum, d) => sum + d.avgCostSavings * d.migrations, 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}