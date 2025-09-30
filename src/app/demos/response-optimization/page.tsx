'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, Clock, TrendingDown, Settings } from 'lucide-react'

interface ResponseMetric {
  endpoint: string
  p50: number
  p95: number
  p99: number
  avgLatency: number
  improvement: number
}

interface PrefetchStrategy {
  id: string
  name: string
  description: string
  accuracy: number
  hitRate: number
  active: boolean
}

interface LoadingStrategy {
  component: string
  strategy: 'Progressive' | 'Streaming' | 'Lazy' | 'Eager'
  loadTime: number
  optimizedTime: number
  improvement: number
}

interface CacheRule {
  resource: string
  strategy: string
  ttl: number
  hitRate: number
  priority: 'high' | 'medium' | 'low'
}

export default function ResponseOptimizationDemo() {
  const responseMetrics: ResponseMetric[] = [
    { endpoint: '/api/positions', p50: 42, p95: 78, p99: 95, avgLatency: 48, improvement: 58.6 },
    { endpoint: '/api/pools', p50: 38, p95: 72, p99: 88, avgLatency: 45, improvement: 62.1 },
    { endpoint: '/api/analytics', p50: 55, p95: 92, p99: 118, avgLatency: 62, improvement: 51.2 },
    { endpoint: '/api/transactions', p50: 48, p95: 85, p99: 102, avgLatency: 52, improvement: 55.8 },
  ]

  const prefetchStrategies: PrefetchStrategy[] = [
    {
      id: 'STR-001',
      name: 'User Behavior Prediction',
      description: 'ML model predicts next user action based on navigation patterns',
      accuracy: 87.5,
      hitRate: 82.3,
      active: true,
    },
    {
      id: 'STR-002',
      name: 'Time-based Prefetching',
      description: 'Prefetch data based on historical access patterns and time of day',
      accuracy: 75.2,
      hitRate: 71.8,
      active: true,
    },
    {
      id: 'STR-003',
      name: 'Related Resource Loading',
      description: 'Automatically prefetch related resources when viewing a position',
      accuracy: 92.1,
      hitRate: 88.5,
      active: true,
    },
    {
      id: 'STR-004',
      name: 'Viewport-based Preloading',
      description: 'Prefetch data for components about to enter viewport',
      accuracy: 68.9,
      hitRate: 65.2,
      active: false,
    },
  ]

  const loadingStrategies: LoadingStrategy[] = [
    { component: 'Position List', strategy: 'Progressive', loadTime: 1850, optimizedTime: 420, improvement: 77.3 },
    { component: 'Analytics Dashboard', strategy: 'Streaming', loadTime: 2150, optimizedTime: 680, improvement: 68.4 },
    { component: 'Chart Components', strategy: 'Lazy', loadTime: 980, optimizedTime: 180, improvement: 81.6 },
    { component: 'Portfolio Overview', strategy: 'Progressive', loadTime: 1620, optimizedTime: 520, improvement: 67.9 },
    { component: 'Transaction History', strategy: 'Streaming', loadTime: 2380, optimizedTime: 820, improvement: 65.5 },
  ]

  const cacheRules: CacheRule[] = [
    { resource: 'Static Pool Data', strategy: 'Long-term Cache', ttl: 3600, hitRate: 94.5, priority: 'high' },
    { resource: 'User Positions', strategy: 'Smart Invalidation', ttl: 30, hitRate: 88.2, priority: 'high' },
    { resource: 'Price Feeds', strategy: 'Predictive TTL', ttl: 15, hitRate: 76.8, priority: 'medium' },
    { resource: 'Analytics Data', strategy: 'Stale-while-revalidate', ttl: 60, hitRate: 82.1, priority: 'medium' },
    { resource: 'Transaction History', strategy: 'On-demand Cache', ttl: 120, hitRate: 71.3, priority: 'low' },
  ]

  const overallMetrics = {
    avgP95: 81.75,
    avgImprovement: 56.9,
    prefetchHitRate: 76.95,
    cacheHitRate: 82.58,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8" />
            Response Time Optimization
          </h1>
          <p className="text-muted-foreground mt-2">
            Predictive prefetching and progressive loading for sub-100ms responses
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #65
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg P95 Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.avgP95}ms</div>
            <p className="text-xs text-muted-foreground">95th percentile response time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallMetrics.avgImprovement}%</div>
            <p className="text-xs text-muted-foreground">Overall performance gain</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Prefetch Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.prefetchHitRate}%</div>
            <p className="text-xs text-muted-foreground">Successful predictions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.cacheHitRate}%</div>
            <p className="text-xs text-muted-foreground">Cache effectiveness</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">
            <Clock className="h-4 w-4 mr-2" />
            Response Metrics
          </TabsTrigger>
          <TabsTrigger value="prefetch">
            <Zap className="h-4 w-4 mr-2" />
            Prefetch Strategies
          </TabsTrigger>
          <TabsTrigger value="loading">
            <TrendingDown className="h-4 w-4 mr-2" />
            Loading Strategies
          </TabsTrigger>
          <TabsTrigger value="cache">
            <Settings className="h-4 w-4 mr-2" />
            Cache Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Response Time Metrics</CardTitle>
              <CardDescription>Percentile-based response time analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {responseMetrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{metric.endpoint}</div>
                      <Badge variant="outline" className="text-green-600">
                        +{metric.improvement.toFixed(1)}% faster
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">P50</div>
                        <div className="font-medium">{metric.p50}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">P95</div>
                        <div className="font-medium">{metric.p95}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">P99</div>
                        <div className="font-medium">{metric.p99}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Average</div>
                        <div className="font-medium">{metric.avgLatency}ms</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Response Time</span>
                        <span className="font-medium">{metric.p95}ms (P95)</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2"
                          style={{ width: `${100 - metric.improvement}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prefetch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Prefetching Strategies</CardTitle>
              <CardDescription>ML-powered resource preloading for faster interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prefetchStrategies.map((strategy) => (
                  <div key={strategy.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{strategy.name}</div>
                        <div className="text-sm text-muted-foreground">{strategy.description}</div>
                      </div>
                      <Badge variant={strategy.active ? 'default' : 'secondary'}>
                        {strategy.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className="bg-blue-500 rounded-full h-2"
                              style={{ width: `${strategy.accuracy}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{strategy.accuracy.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className="bg-green-500 rounded-full h-2"
                              style={{ width: `${strategy.hitRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-green-600">
                            {strategy.hitRate.toFixed(1)}%
                          </span>
                        </div>
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

        <TabsContent value="loading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progressive Loading Strategies</CardTitle>
              <CardDescription>Component-level loading optimization techniques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingStrategies.map((strategy, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{strategy.component}</div>
                        <div className="text-sm text-muted-foreground">
                          Strategy: {strategy.strategy}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        +{strategy.improvement.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Before</div>
                        <div className="font-medium">{strategy.loadTime}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">After</div>
                        <div className="font-medium text-green-600">{strategy.optimizedTime}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Saved</div>
                        <div className="font-medium">{strategy.loadTime - strategy.optimizedTime}ms</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Load Time Reduction</span>
                        <span className="font-medium text-green-600">
                          -{strategy.improvement.toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2"
                          style={{ width: `${strategy.improvement}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intelligent Caching Rules</CardTitle>
              <CardDescription>Adaptive cache strategies with predictive TTL</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cacheRules.map((rule, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{rule.resource}</div>
                        <div className="text-sm text-muted-foreground">{rule.strategy}</div>
                      </div>
                      <Badge
                        variant={
                          rule.priority === 'high' ? 'default' : rule.priority === 'medium' ? 'secondary' : 'outline'
                        }
                        className={getPriorityColor(rule.priority)}
                      >
                        {rule.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Cache TTL</div>
                        <div className="font-medium">{rule.ttl}s</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Hit Rate</div>
                        <div className="font-medium text-green-600">{rule.hitRate.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Cache Effectiveness</span>
                        <span className="font-medium">{rule.hitRate.toFixed(1)}%</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{ width: `${rule.hitRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <Button className="w-full" size="lg">
                    Configure Cache Rules
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