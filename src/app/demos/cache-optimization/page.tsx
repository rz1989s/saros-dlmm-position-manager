'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { formatNumber } from '@/lib/utils/format'
import {
  Zap,
  TrendingUp,
  Target,
  CheckCircle,
  ArrowRight,
  Clock,
  Activity,
  BarChart3,
  Settings,
  Cpu
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

interface OptimizationStrategy {
  name: string
  description: string
  hitRateImprovement: number
  latencyReduction: number
  memoryImpact: number
  enabled: boolean
}

interface PerformanceComparison {
  metric: string
  before: number
  after: number
  improvement: number
  unit: string
}

interface CacheWarmingProgress {
  phase: string
  progress: number
  itemsWarmed: number
  totalItems: number
  estimatedTime: number
}

export default function CacheOptimizationDemo() {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('predictive')
  const [optimizationActive, setOptimizationActive] = useState(false)
  const [warmingProgress, setWarmingProgress] = useState<CacheWarmingProgress>({
    phase: 'idle',
    progress: 0,
    itemsWarmed: 0,
    totalItems: 100,
    estimatedTime: 0
  })

  const optimizationStrategies: OptimizationStrategy[] = [
    {
      name: 'Predictive Preloading',
      description: 'ML-based prediction of likely cache requests',
      hitRateImprovement: 15.2,
      latencyReduction: 42.5,
      memoryImpact: 8.3,
      enabled: selectedStrategy === 'predictive'
    },
    {
      name: 'Adaptive TTL',
      description: 'Dynamic TTL based on access patterns',
      hitRateImprovement: 12.8,
      latencyReduction: 28.3,
      memoryImpact: 3.2,
      enabled: selectedStrategy === 'adaptive'
    },
    {
      name: 'Tiered Caching',
      description: 'Multi-level cache hierarchy',
      hitRateImprovement: 18.5,
      latencyReduction: 35.7,
      memoryImpact: 12.1,
      enabled: selectedStrategy === 'tiered'
    },
    {
      name: 'Smart Invalidation',
      description: 'Selective cache invalidation based on data sensitivity',
      hitRateImprovement: 9.3,
      latencyReduction: 15.8,
      memoryImpact: 1.5,
      enabled: selectedStrategy === 'smart'
    }
  ]

  const performanceMetrics: PerformanceComparison[] = [
    {
      metric: 'Cache Hit Rate',
      before: 72.5,
      after: 92.3,
      improvement: 27.3,
      unit: '%'
    },
    {
      metric: 'Average Latency',
      before: 45.2,
      after: 12.8,
      improvement: 71.7,
      unit: 'ms'
    },
    {
      metric: 'RPC Calls',
      before: 1850,
      after: 740,
      improvement: 60.0,
      unit: 'calls/min'
    },
    {
      metric: 'Memory Usage',
      before: 128.5,
      after: 145.2,
      improvement: -13.0,
      unit: 'MB'
    },
    {
      metric: 'Response Time (P95)',
      before: 125.3,
      after: 38.7,
      improvement: 69.1,
      unit: 'ms'
    }
  ]

  const radarData = [
    { metric: 'Hit Rate', before: 72, after: 92, fullMark: 100 },
    { metric: 'Speed', before: 55, after: 88, fullMark: 100 },
    { metric: 'Efficiency', before: 68, after: 85, fullMark: 100 },
    { metric: 'Reliability', before: 78, after: 94, fullMark: 100 },
    { metric: 'Cost', before: 62, after: 80, fullMark: 100 }
  ]

  const timelineData = [
    { time: '0s', baseline: 72, optimized: 72 },
    { time: '5s', baseline: 73, optimized: 78 },
    { time: '10s', baseline: 74, optimized: 82 },
    { time: '15s', baseline: 74, optimized: 86 },
    { time: '20s', baseline: 75, optimized: 89 },
    { time: '25s', baseline: 75, optimized: 91 },
    { time: '30s', baseline: 76, optimized: 92 }
  ]

  const strategyComparisonData = optimizationStrategies.map(strategy => ({
    name: strategy.name.split(' ')[0],
    hitRate: strategy.hitRateImprovement,
    latency: strategy.latencyReduction,
    memory: strategy.memoryImpact
  }))

  useEffect(() => {
    if (optimizationActive) {
      const interval = setInterval(() => {
        setWarmingProgress(prev => {
          if (prev.progress >= 100) {
            setOptimizationActive(false)
            return { ...prev, progress: 100, phase: 'complete' }
          }

          const increment = 2.5
          const newProgress = Math.min(prev.progress + increment, 100)
          const newItemsWarmed = Math.floor((newProgress / 100) * prev.totalItems)

          return {
            ...prev,
            progress: newProgress,
            itemsWarmed: newItemsWarmed,
            phase: newProgress < 33 ? 'warming' : newProgress < 66 ? 'optimizing' : 'finalizing',
            estimatedTime: Math.ceil((100 - newProgress) / increment * 0.5)
          }
        })
      }, 500)

      return () => {
        clearInterval(interval)
      }
    }

    return undefined
  }, [optimizationActive])

  const handleStartOptimization = () => {
    setWarmingProgress({
      phase: 'initializing',
      progress: 0,
      itemsWarmed: 0,
      totalItems: 100,
      estimatedTime: 20
    })
    setOptimizationActive(true)
  }

  const handleStopOptimization = () => {
    setOptimizationActive(false)
    setWarmingProgress(prev => ({ ...prev, phase: 'stopped' }))
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[61] || { id: 61, name: 'Cache Optimization', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full">
            <Zap className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Performance Optimization</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Cache Optimization Strategies
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced cache optimization techniques with before/after metrics, strategy comparison, and performance analytics
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3" />
              SDK Feature #61
            </Badge>
            <Badge variant="outline" className="gap-1 border-orange-500 text-orange-700">
              <TrendingUp className="h-3 w-3" />
              92%+ Hit Rate
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      {/* Optimization Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-600" />
            Optimization Control Panel
          </CardTitle>
          <CardDescription>
            Select and apply cache optimization strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optimizationStrategies.map((strategy, index) => (
              <motion.div
                key={strategy.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  strategy.enabled
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedStrategy(strategy.name.split(' ')[0].toLowerCase())}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{strategy.name}</h4>
                  {strategy.enabled && (
                    <Badge variant="default" className="bg-orange-500">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Hit Rate:</span>
                    <span className="font-medium text-green-600">+{strategy.hitRateImprovement}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latency:</span>
                    <span className="font-medium text-blue-600">-{strategy.latencyReduction}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory:</span>
                    <span className="font-medium text-orange-600">+{strategy.memoryImpact}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              onClick={handleStartOptimization}
              disabled={optimizationActive}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              Start Optimization
            </Button>

            {optimizationActive && (
              <Button
                onClick={handleStopOptimization}
                variant="destructive"
                className="gap-2"
              >
                Stop
              </Button>
            )}

            {warmingProgress.phase === 'complete' && (
              <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
                <CheckCircle className="h-3 w-3" />
                Optimization Complete
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cache Warming Progress */}
      {optimizationActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <Activity className="h-5 w-5 animate-pulse" />
                Cache Warming in Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium capitalize">{warmingProgress.phase}</span>
                  <span className="text-muted-foreground">
                    {warmingProgress.itemsWarmed} / {warmingProgress.totalItems} items
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${warmingProgress.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{warmingProgress.progress.toFixed(1)}% Complete</span>
                  <span>~{warmingProgress.estimatedTime}s remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Before vs After Optimization
          </CardTitle>
          <CardDescription>Comprehensive performance metrics comparison</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {performanceMetrics.map((metric, index) => (
            <motion.div
              key={metric.metric}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-gray-50 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{metric.metric}</h4>
                <Badge
                  variant={metric.improvement > 0 ? "default" : "secondary"}
                  className={metric.improvement > 0 ? "bg-green-500" : "bg-orange-500"}
                >
                  {metric.improvement > 0 ? '+' : ''}{metric.improvement.toFixed(1)}%
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Before</div>
                  <div className="text-lg font-bold text-red-600">
                    {formatNumber(metric.before)} {metric.unit}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">After</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatNumber(metric.after)} {metric.unit}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Performance Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Performance Dimensions
            </CardTitle>
            <CardDescription>Multi-dimensional performance analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Before"
                  dataKey="before"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                />
                <Radar
                  name="After"
                  dataKey="after"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.5}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-600" />
              Strategy Comparison
            </CardTitle>
            <CardDescription>Optimization strategy effectiveness</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={strategyComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hitRate" fill="#10b981" name="Hit Rate %" />
                <Bar dataKey="latency" fill="#3b82f6" name="Latency Reduction %" />
                <Bar dataKey="memory" fill="#f59e0b" name="Memory Impact %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Optimization Timeline
          </CardTitle>
          <CardDescription>Hit rate improvement over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[70, 95]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="baseline"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.3}
                name="Baseline"
              />
              <Area
                type="monotone"
                dataKey="optimized"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.5}
                name="Optimized"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Implementation Details */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle className="h-5 w-5" />
            Optimization Features
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-green-800 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Predictive Preloading:</strong> ML-based cache warming reduces cold starts by 42%</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Adaptive TTL:</strong> Dynamic cache duration based on access patterns and volatility</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Tiered Caching:</strong> Multi-level hierarchy for optimal memory utilization</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Smart Invalidation:</strong> Selective cache clearing preserves hot data</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Real-Time Metrics:</strong> Continuous performance monitoring and optimization tuning</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
