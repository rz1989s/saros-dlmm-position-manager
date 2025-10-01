'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, AlertTriangle, TrendingDown, CheckCircle2, Activity, Settings } from 'lucide-react'

interface MemoryMetric {
  category: string
  current: number
  baseline: number
  optimized: number
  reduction: number
}

interface MemoryLeak {
  id: string
  component: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  leakRate: number
  detected: string
  status: 'active' | 'fixed' | 'monitoring'
}

interface OptimizationStrategy {
  name: string
  description: string
  impact: number
  implemented: boolean
  savingsMB: number
}

interface CleanupTask {
  id: string
  task: string
  frequency: string
  lastRun: string
  nextRun: string
  status: 'completed' | 'scheduled' | 'running'
}

export default function MemoryOptimizationDemo() {
  const [isMonitoring, setIsMonitoring] = useState(true)

  const memoryMetrics: MemoryMetric[] = [
    { category: 'Heap Memory', current: 245, baseline: 350, optimized: 245, reduction: 30.0 },
    { category: 'Component Cache', current: 58, baseline: 95, optimized: 58, reduction: 38.9 },
    { category: 'Event Listeners', current: 42, baseline: 78, optimized: 42, reduction: 46.2 },
    { category: 'DOM Nodes', current: 1250, baseline: 1850, optimized: 1250, reduction: 32.4 },
    { category: 'Global Objects', current: 28, baseline: 45, optimized: 28, reduction: 37.8 },
  ]

  const memoryLeaks: MemoryLeak[] = [
    {
      id: 'LEAK-001',
      component: 'PositionsList',
      severity: 'high',
      leakRate: 2.5,
      detected: '2h ago',
      status: 'fixed',
    },
    {
      id: 'LEAK-002',
      component: 'PriceChart',
      severity: 'medium',
      leakRate: 1.2,
      detected: '5h ago',
      status: 'fixed',
    },
    {
      id: 'LEAK-003',
      component: 'WebSocket Connection',
      severity: 'critical',
      leakRate: 4.8,
      detected: '1d ago',
      status: 'fixed',
    },
    {
      id: 'LEAK-004',
      component: 'Analytics Dashboard',
      severity: 'low',
      leakRate: 0.8,
      detected: '3d ago',
      status: 'monitoring',
    },
  ]

  const optimizationStrategies: OptimizationStrategy[] = [
    {
      name: 'Lazy Component Loading',
      description: 'Load components only when needed, reducing initial memory footprint',
      impact: 35,
      implemented: true,
      savingsMB: 87.5,
    },
    {
      name: 'Memoization Strategy',
      description: 'Cache expensive calculations and component renders',
      impact: 28,
      implemented: true,
      savingsMB: 70.0,
    },
    {
      name: 'Event Listener Cleanup',
      description: 'Properly remove event listeners on component unmount',
      impact: 22,
      implemented: true,
      savingsMB: 55.0,
    },
    {
      name: 'Data Structure Optimization',
      description: 'Use efficient data structures (Maps, Sets) instead of arrays',
      impact: 18,
      implemented: true,
      savingsMB: 45.0,
    },
    {
      name: 'Virtual Scrolling',
      description: 'Render only visible items in long lists',
      impact: 25,
      implemented: true,
      savingsMB: 62.5,
    },
  ]

  const cleanupTasks: CleanupTask[] = [
    {
      id: 'CLEAN-001',
      task: 'Clear position cache',
      frequency: 'Every 5 minutes',
      lastRun: '2 min ago',
      nextRun: 'In 3 min',
      status: 'completed',
    },
    {
      id: 'CLEAN-002',
      task: 'Garbage collect unused components',
      frequency: 'Every 10 minutes',
      lastRun: '5 min ago',
      nextRun: 'In 5 min',
      status: 'scheduled',
    },
    {
      id: 'CLEAN-003',
      task: 'Flush analytics buffer',
      frequency: 'Every 2 minutes',
      lastRun: '30 sec ago',
      nextRun: 'In 90 sec',
      status: 'completed',
    },
    {
      id: 'CLEAN-004',
      task: 'Remove stale event listeners',
      frequency: 'Every 15 minutes',
      lastRun: 'Running now',
      nextRun: 'In 15 min',
      status: 'running',
    },
  ]

  const totalMemorySaved = memoryMetrics.reduce(
    (sum, metric) => sum + (metric.baseline - metric.optimized),
    0
  )
  const averageReduction = memoryMetrics.reduce((sum, metric) => sum + metric.reduction, 0) / memoryMetrics.length

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fixed':
        return 'text-green-600'
      case 'active':
        return 'text-red-600'
      case 'monitoring':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Memory Optimization System
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced memory management with leak detection and automated cleanup strategies
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #63
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Memory Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalMemorySaved.toFixed(0)} MB</div>
            <p className="text-xs text-muted-foreground">Total optimization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Reduction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{averageReduction.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all metrics</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Leaks Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memoryLeaks.length}</div>
            <p className="text-xs text-muted-foreground">
              {memoryLeaks.filter((l) => l.status === 'fixed').length} fixed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monitoring Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{isMonitoring ? 'Active' : 'Paused'}</div>
            <p className="text-xs text-muted-foreground">Real-time tracking</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">
            <Activity className="h-4 w-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="leaks">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Leak Detection
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <TrendingDown className="h-4 w-4 mr-2" />
            Optimization
          </TabsTrigger>
          <TabsTrigger value="cleanup">
            <Settings className="h-4 w-4 mr-2" />
            Cleanup Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Metrics</CardTitle>
              <CardDescription>Real-time memory usage tracking and optimization results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {memoryMetrics.map((metric, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{metric.category}</div>
                        <div className="text-sm text-muted-foreground">
                          Baseline: {metric.baseline} MB → Current: {metric.current} MB
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        -{metric.reduction.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Baseline</div>
                        <div className="font-medium text-red-600">{metric.baseline} MB</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Current</div>
                        <div className="font-medium text-blue-600">{metric.current} MB</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Saved</div>
                        <div className="font-medium text-green-600">
                          {(metric.baseline - metric.current).toFixed(0)} MB
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Optimization Progress</span>
                        <span className="font-medium">{metric.reduction.toFixed(1)}%</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2"
                          style={{ width: `${metric.reduction}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Leak Detection</CardTitle>
              <CardDescription>Automated leak detection with real-time monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memoryLeaks.map((leak) => (
                  <div key={leak.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{leak.component}</div>
                        <div className="text-sm text-muted-foreground">
                          {leak.id} • Detected {leak.detected}
                        </div>
                      </div>
                      <Badge variant={getSeverityBadge(leak.severity)} className={getSeverityColor(leak.severity)}>
                        {leak.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Leak Rate</div>
                        <div className="font-medium">{leak.leakRate} MB/min</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <div className={`font-medium ${getStatusColor(leak.status)}`}>
                          {leak.status === 'fixed' && <CheckCircle2 className="h-4 w-4 inline mr-1" />}
                          {leak.status.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Severity</div>
                        <div className={`font-medium ${getSeverityColor(leak.severity)}`}>{leak.severity}</div>
                      </div>
                    </div>
                    {leak.status !== 'fixed' && (
                      <Button size="sm" className="w-full">
                        Fix Memory Leak
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Strategies</CardTitle>
              <CardDescription>Active memory optimization techniques and their impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationStrategies.map((strategy, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{strategy.name}</div>
                        <div className="text-sm text-muted-foreground">{strategy.description}</div>
                      </div>
                      <Badge variant={strategy.implemented ? 'default' : 'outline'}>
                        {strategy.implemented ? 'ACTIVE' : 'PENDING'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Memory Savings</div>
                        <div className="text-xl font-bold text-green-600">{strategy.savingsMB} MB</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Impact</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className="bg-green-500 rounded-full h-2"
                              style={{ width: `${strategy.impact}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-green-600">{strategy.impact}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Total Memory Savings</div>
                      <div className="text-sm text-muted-foreground">
                        From {optimizationStrategies.filter((s) => s.implemented).length} active strategies
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {optimizationStrategies
                        .filter((s) => s.implemented)
                        .reduce((sum, s) => sum + s.savingsMB, 0)
                        .toFixed(1)}{' '}
                      MB
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cleanup" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Automated Cleanup Tasks</CardTitle>
                  <CardDescription>Scheduled memory cleanup and garbage collection</CardDescription>
                </div>
                <Button
                  variant={isMonitoring ? 'destructive' : 'default'}
                  size="sm"
                  onClick={() => setIsMonitoring(!isMonitoring)}
                >
                  {isMonitoring ? 'Pause Monitoring' : 'Resume Monitoring'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cleanupTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{task.task}</div>
                        <div className="text-sm text-muted-foreground">{task.frequency}</div>
                      </div>
                      <Badge
                        variant={
                          task.status === 'completed'
                            ? 'default'
                            : task.status === 'running'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {task.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1 inline" />}
                        {task.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Last Run</div>
                        <div className="font-medium">{task.lastRun}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Next Run</div>
                        <div className="font-medium">{task.nextRun}</div>
                      </div>
                    </div>
                    {task.status === 'running' && (
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Progress</div>
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
      </Tabs>
    </div>
  )
}