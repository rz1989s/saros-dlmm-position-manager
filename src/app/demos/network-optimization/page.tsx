'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wifi, Zap, Layers, BarChart3, Activity, Settings } from 'lucide-react'

interface ConnectionPool {
  id: string
  endpoint: string
  active: number
  idle: number
  maxSize: number
  utilization: number
  avgLatency: number
}

interface Request {
  id: string
  endpoint: string
  method: string
  priority: 'high' | 'medium' | 'low'
  status: 'queued' | 'processing' | 'completed' | 'failed'
  latency?: number
  coalesced: boolean
}

interface PerformanceMetric {
  metric: string
  before: number
  after: number
  improvement: number
  unit: string
}

interface OptimizationRule {
  name: string
  enabled: boolean
  description: string
  impact: number
}

export default function NetworkOptimizationDemo() {
  const [autoOptimize, setAutoOptimize] = useState(true)

  const connectionPools: ConnectionPool[] = [
    {
      id: 'POOL-001',
      endpoint: 'rpc.solana.com',
      active: 8,
      idle: 2,
      maxSize: 10,
      utilization: 80,
      avgLatency: 45,
    },
    {
      id: 'POOL-002',
      endpoint: 'api.pyth.network',
      active: 5,
      idle: 5,
      maxSize: 10,
      utilization: 50,
      avgLatency: 32,
    },
    {
      id: 'POOL-003',
      endpoint: 'hermes.pyth.network',
      active: 3,
      idle: 2,
      maxSize: 5,
      utilization: 60,
      avgLatency: 28,
    },
    {
      id: 'POOL-004',
      endpoint: 'switchboard.xyz',
      active: 4,
      idle: 6,
      maxSize: 10,
      utilization: 40,
      avgLatency: 38,
    },
  ]

  const requests: Request[] = [
    {
      id: 'REQ-001',
      endpoint: 'getPosition',
      method: 'POST',
      priority: 'high',
      status: 'completed',
      latency: 42,
      coalesced: false,
    },
    {
      id: 'REQ-002',
      endpoint: 'getPrice',
      method: 'GET',
      priority: 'high',
      status: 'completed',
      latency: 28,
      coalesced: true,
    },
    {
      id: 'REQ-003',
      endpoint: 'getPrice',
      method: 'GET',
      priority: 'high',
      status: 'completed',
      latency: 28,
      coalesced: true,
    },
    {
      id: 'REQ-004',
      endpoint: 'getBalance',
      method: 'GET',
      priority: 'medium',
      status: 'processing',
      coalesced: false,
    },
    {
      id: 'REQ-005',
      endpoint: 'submitTransaction',
      method: 'POST',
      priority: 'high',
      status: 'processing',
      coalesced: false,
    },
    {
      id: 'REQ-006',
      endpoint: 'getHistory',
      method: 'GET',
      priority: 'low',
      status: 'queued',
      coalesced: false,
    },
  ]

  const performanceMetrics: PerformanceMetric[] = [
    { metric: 'Average Latency', before: 125, after: 68, improvement: 45.6, unit: 'ms' },
    { metric: 'Request Throughput', before: 450, after: 680, improvement: 51.1, unit: 'req/sec' },
    { metric: 'Connection Overhead', before: 85, after: 45, improvement: 47.1, unit: 'ms' },
    { metric: 'Failed Requests', before: 8.5, after: 2.1, improvement: 75.3, unit: '%' },
    { metric: 'Network Bandwidth', before: 12.5, after: 8.2, improvement: 34.4, unit: 'MB/s' },
  ]

  const optimizationRules: OptimizationRule[] = [
    {
      name: 'Connection Pooling',
      enabled: true,
      description: 'Reuse existing connections to reduce overhead',
      impact: 45,
    },
    {
      name: 'Request Coalescing',
      enabled: true,
      description: 'Batch similar requests together',
      impact: 38,
    },
    {
      name: 'Adaptive Prioritization',
      enabled: true,
      description: 'Prioritize critical requests dynamically',
      impact: 28,
    },
    {
      name: 'Connection Keep-Alive',
      enabled: true,
      description: 'Maintain persistent connections',
      impact: 32,
    },
    {
      name: 'Request Deduplication',
      enabled: true,
      description: 'Eliminate duplicate requests',
      impact: 25,
    },
  ]

  const totalActiveConnections = connectionPools.reduce((sum, pool) => sum + pool.active, 0)
  const totalIdleConnections = connectionPools.reduce((sum, pool) => sum + pool.idle, 0)
  const avgUtilization =
    connectionPools.reduce((sum, pool) => sum + pool.utilization, 0) / connectionPools.length
  const coalescedRequests = requests.filter((r) => r.coalesced).length

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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'processing':
        return 'text-blue-600'
      case 'queued':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wifi className="h-8 w-8" />
            Network Optimization Layer
          </h1>
          <p className="text-muted-foreground mt-2">
            Connection pooling, request coalescing, and adaptive prioritization for optimal network performance
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #64
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalActiveConnections}</div>
            <p className="text-xs text-muted-foreground">{totalIdleConnections} idle in pool</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgUtilization.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Pool efficiency</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Coalesced Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{coalescedRequests}</div>
            <p className="text-xs text-muted-foreground">Batched together</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Performance Gain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">45.6%</div>
            <p className="text-xs text-muted-foreground">Latency reduction</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pools" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pools">
            <Layers className="h-4 w-4 mr-2" />
            Connection Pools
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Activity className="h-4 w-4 mr-2" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connection Pools</CardTitle>
              <CardDescription>Managed connection pools for optimal resource utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectionPools.map((pool) => (
                  <div key={pool.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{pool.endpoint}</div>
                        <div className="text-sm text-muted-foreground">{pool.id}</div>
                      </div>
                      <Badge variant="outline">{pool.utilization}% utilized</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Active</div>
                        <div className="font-medium text-blue-600">{pool.active}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Idle</div>
                        <div className="font-medium text-green-600">{pool.idle}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Max Size</div>
                        <div className="font-medium">{pool.maxSize}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Latency</div>
                        <div className="font-medium">{pool.avgLatency}ms</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pool Utilization</span>
                        <span className="font-medium">{pool.utilization}%</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className="bg-blue-500 rounded-full h-2"
                          style={{ width: `${pool.utilization}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Queue</CardTitle>
              <CardDescription>Real-time request monitoring with adaptive prioritization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{request.endpoint}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.id} • {request.method}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.coalesced && (
                          <Badge variant="outline" className="text-purple-600">
                            <Zap className="h-3 w-3 mr-1" />
                            Coalesced
                          </Badge>
                        )}
                        <Badge variant={getPriorityBadge(request.priority)} className={getPriorityColor(request.priority)}>
                          {request.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Priority</div>
                        <div className={`font-medium ${getPriorityColor(request.priority)}`}>{request.priority}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <div className={`font-medium ${getStatusColor(request.status)}`}>{request.status}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Latency</div>
                        <div className="font-medium">{request.latency ? `${request.latency}ms` : 'Pending'}</div>
                      </div>
                    </div>
                    {request.status === 'processing' && (
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Processing</div>
                        <div className="bg-secondary rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-500 rounded-full h-2 animate-pulse" style={{ width: '65%' }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Before vs after network optimization comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{metric.metric}</div>
                      <Badge variant="outline" className="text-green-600">
                        +{metric.improvement.toFixed(1)}% improvement
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Before</div>
                        <div className="text-xl font-bold text-red-600">
                          {metric.before} <span className="text-sm font-normal">{metric.unit}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">After</div>
                        <div className="text-xl font-bold text-green-600">
                          {metric.after} <span className="text-sm font-normal">{metric.unit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Improvement</span>
                        <span className="font-medium text-green-600">{metric.improvement.toFixed(1)}%</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2"
                          style={{ width: `${metric.improvement}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Optimization Rules</CardTitle>
                  <CardDescription>Configure network optimization behavior</CardDescription>
                </div>
                <Button
                  variant={autoOptimize ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAutoOptimize(!autoOptimize)}
                >
                  {autoOptimize ? 'Auto-Optimize ON' : 'Auto-Optimize OFF'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationRules.map((rule, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{rule.name}</div>
                        <div className="text-sm text-muted-foreground">{rule.description}</div>
                      </div>
                      <Badge variant={rule.enabled ? 'default' : 'outline'}>
                        {rule.enabled ? 'ENABLED' : 'DISABLED'}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Impact: {rule.impact}%</div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2"
                          style={{ width: `${rule.impact}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Total Performance Gain</div>
                      <div className="text-sm text-muted-foreground">
                        From {optimizationRules.filter((r) => r.enabled).length} active rules
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {(optimizationRules.reduce((sum, r) => sum + (r.enabled ? r.impact : 0), 0) / optimizationRules.length).toFixed(1)}%
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