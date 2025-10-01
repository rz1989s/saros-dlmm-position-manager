'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, Brain, Flame, Settings } from 'lucide-react'

interface PrefetchStrategy {
  id: string
  name: string
  type: 'User Behavior' | 'Time-based' | 'Related Resources' | 'Viewport-based'
  description: string
  hitRate: number
  accuracy: number
  active: boolean
  priority: 'high' | 'medium' | 'low'
}

interface CacheWarming {
  resource: string
  strategy: string
  status: 'active' | 'scheduled' | 'completed'
  progress: number
  itemsCached: number
  totalItems: number
  nextRun: string
}

interface PrefetchMetric {
  category: string
  prefetched: number
  used: number
  wasted: number
  hitRate: number
  timeSaved: number
}

interface PreloadRule {
  id: string
  trigger: string
  resources: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
  enabled: boolean
  effectiveness: number
}

export default function DataPrefetchingDemo() {
  const strategies: PrefetchStrategy[] = [
    {
      id: 'STR-001',
      name: 'User Navigation Prediction',
      type: 'User Behavior',
      description: 'ML model predicts next page based on user navigation patterns and history',
      hitRate: 87.5,
      accuracy: 92.3,
      active: true,
      priority: 'high',
    },
    {
      id: 'STR-002',
      name: 'Time-based Prefetching',
      type: 'Time-based',
      description: 'Prefetch resources during idle time and off-peak hours',
      hitRate: 75.2,
      accuracy: 68.9,
      active: true,
      priority: 'medium',
    },
    {
      id: 'STR-003',
      name: 'Related Resource Loading',
      type: 'Related Resources',
      description: 'Automatically load related data when viewing a resource',
      hitRate: 92.1,
      accuracy: 95.7,
      active: true,
      priority: 'high',
    },
    {
      id: 'STR-004',
      name: 'Viewport Preloading',
      type: 'Viewport-based',
      description: 'Prefetch content about to enter viewport during scrolling',
      hitRate: 68.9,
      accuracy: 71.2,
      active: false,
      priority: 'low',
    },
  ]

  const cacheWarming: CacheWarming[] = [
    {
      resource: 'Popular Pool Data',
      strategy: 'Scheduled Warmup',
      status: 'completed',
      progress: 100,
      itemsCached: 50,
      totalItems: 50,
      nextRun: '2024-03-16 00:00:00',
    },
    {
      resource: 'User Position Data',
      strategy: 'On-demand Warmup',
      status: 'active',
      progress: 68,
      itemsCached: 340,
      totalItems: 500,
      nextRun: 'Continuous',
    },
    {
      resource: 'Price Feed History',
      strategy: 'Predictive Warmup',
      status: 'scheduled',
      progress: 0,
      itemsCached: 0,
      totalItems: 1000,
      nextRun: '2024-03-15 18:00:00',
    },
    {
      resource: 'Analytics Data',
      strategy: 'Lazy Warmup',
      status: 'completed',
      progress: 100,
      itemsCached: 150,
      totalItems: 150,
      nextRun: '2024-03-15 20:00:00',
    },
  ]

  const metrics: PrefetchMetric[] = [
    { category: 'Position Data', prefetched: 1250, used: 1125, wasted: 125, hitRate: 90.0, timeSaved: 4500 },
    { category: 'Pool Analytics', prefetched: 850, used: 722, wasted: 128, hitRate: 84.9, timeSaved: 3200 },
    { category: 'Price Feeds', prefetched: 2100, used: 1890, wasted: 210, hitRate: 90.0, timeSaved: 8100 },
    { category: 'Transaction History', prefetched: 650, used: 520, wasted: 130, hitRate: 80.0, timeSaved: 2400 },
  ]

  const preloadRules: PreloadRule[] = [
    {
      id: 'RULE-001',
      trigger: 'User views position list',
      resources: ['Position details', 'Pool analytics', 'Price feeds'],
      priority: 'critical',
      enabled: true,
      effectiveness: 95.2,
    },
    {
      id: 'RULE-002',
      trigger: 'User enters analytics page',
      resources: ['Historical data', 'Chart data', 'Performance metrics'],
      priority: 'high',
      enabled: true,
      effectiveness: 88.7,
    },
    {
      id: 'RULE-003',
      trigger: 'User hovers over position card',
      resources: ['Position bin data', 'Fee history', 'IL data'],
      priority: 'medium',
      enabled: true,
      effectiveness: 76.3,
    },
    {
      id: 'RULE-004',
      trigger: 'User navigates to strategies',
      resources: ['Strategy templates', 'Backtest data', 'Market conditions'],
      priority: 'high',
      enabled: true,
      effectiveness: 82.1,
    },
  ]

  const overallMetrics = {
    totalPrefetched: metrics.reduce((sum, m) => sum + m.prefetched, 0),
    totalUsed: metrics.reduce((sum, m) => sum + m.used, 0),
    avgHitRate: (metrics.reduce((sum, m) => sum + m.hitRate, 0) / metrics.length).toFixed(1),
    totalTimeSaved: metrics.reduce((sum, m) => sum + m.timeSaved, 0),
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'text-green-600'
      case 'scheduled':
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
            <Zap className="h-8 w-8" />
            Data Prefetching System
          </h1>
          <p className="text-muted-foreground mt-2">
            Predictive loading, cache warming, and intelligent preloading for instant UX
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #66
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Prefetched</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalPrefetched.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{overallMetrics.totalUsed.toLocaleString()} used</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallMetrics.avgHitRate}%</div>
            <p className="text-xs text-muted-foreground">Prediction accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(overallMetrics.totalTimeSaved / 1000).toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">Total load time saved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strategies.filter((s) => s.active).length}</div>
            <p className="text-xs text-muted-foreground">Of {strategies.length} total</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="strategies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strategies">
            <Brain className="h-4 w-4 mr-2" />
            Strategies
          </TabsTrigger>
          <TabsTrigger value="warming">
            <Flame className="h-4 w-4 mr-2" />
            Cache Warming
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <Zap className="h-4 w-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Settings className="h-4 w-4 mr-2" />
            Preload Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prefetch Strategies</CardTitle>
              <CardDescription>AI-powered predictive loading strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold flex items-center gap-2">
                          {strategy.name}
                          <Badge variant="outline">{strategy.type}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{strategy.description}</div>
                      </div>
                      <Badge
                        variant={strategy.active ? 'default' : 'secondary'}
                        className={strategy.active ? 'text-green-600' : ''}
                      >
                        {strategy.active ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Hit Rate</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div className="bg-green-500 rounded-full h-2" style={{ width: `${strategy.hitRate}%` }} />
                          </div>
                          <span className="text-sm font-medium text-green-600">{strategy.hitRate}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Accuracy</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div className="bg-blue-500 rounded-full h-2" style={{ width: `${strategy.accuracy}%` }} />
                          </div>
                          <span className="text-sm font-medium">{strategy.accuracy}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Priority</div>
                        <Badge variant="outline" className={getPriorityColor(strategy.priority)}>
                          {strategy.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant={strategy.active ? 'outline' : 'default'}>
                      {strategy.active ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Warming Operations</CardTitle>
              <CardDescription>Proactive cache population for instant data access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cacheWarming.map((warming, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{warming.resource}</div>
                        <div className="text-sm text-muted-foreground">{warming.strategy}</div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(warming.status)}>
                        {warming.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {warming.itemsCached} / {warming.totalItems} items ({warming.progress}%)
                        </span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className={`rounded-full h-2 ${
                            warming.status === 'completed' ? 'bg-green-500' : warming.status === 'active' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${warming.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Next run: {warming.nextRun}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        {warming.status === 'active' ? 'Pause' : 'Start'}
                      </Button>
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <Button className="w-full" size="lg">
                    Add Warmup Task
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prefetch Performance Metrics</CardTitle>
              <CardDescription>Detailed analytics on prefetch effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{metric.category}</div>
                      <Badge variant="outline" className="text-green-600">
                        {metric.hitRate.toFixed(1)}% hit rate
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Prefetched</div>
                        <div className="font-medium">{metric.prefetched}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Used</div>
                        <div className="font-medium text-green-600">{metric.used}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Wasted</div>
                        <div className="font-medium text-red-600">{metric.wasted}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Time Saved</div>
                        <div className="font-medium">{(metric.timeSaved / 1000).toFixed(1)}s</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Efficiency</span>
                        <span className="font-medium text-green-600">{metric.hitRate.toFixed(1)}%</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div className="bg-green-500 rounded-full h-2" style={{ width: `${metric.hitRate}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total Time Saved</span>
                    <span className="text-green-600">{(overallMetrics.totalTimeSaved / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    Prefetching reduced loading time by {overallMetrics.avgHitRate}% on average
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intelligent Preload Rules</CardTitle>
              <CardDescription>Trigger-based resource preloading configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preloadRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="font-semibold">Trigger: {rule.trigger}</div>
                        <div className="text-sm text-muted-foreground">
                          Preloads {rule.resources.length} resources when triggered
                        </div>
                      </div>
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>{rule.enabled ? 'ENABLED' : 'DISABLED'}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rule.resources.map((resource, i) => (
                        <Badge key={i} variant="outline">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Priority</div>
                        <Badge variant="outline" className={getPriorityColor(rule.priority)}>
                          {rule.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Effectiveness</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div className="bg-primary rounded-full h-2" style={{ width: `${rule.effectiveness}%` }} />
                          </div>
                          <span className="text-sm font-medium">{rule.effectiveness}%</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <Button className="w-full" size="lg">
                    Create New Rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}