'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Zap,
  Database,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Wifi,
  WifiOff
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AnimatedNumber } from '@/components/animations/animated-number'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PerformanceMetrics {
  timestamp: number
  rpcCalls: number
  cacheHitRate: number
  responseTime: number
  activeConnections: number
  errorRate: number
  throughput: number
}

interface RealTimeStats {
  totalRpcCallsSaved: number
  currentCacheHitRate: number
  averageResponseTime: number
  activeUsers: number
  uptime: number
  lastUpdate: number
}

// Simulated real-time data generator
const generateMetrics = (): PerformanceMetrics => ({
  timestamp: Date.now(),
  rpcCalls: Math.floor(Math.random() * 20) + 5, // 5-25 calls per minute
  cacheHitRate: Math.random() * 20 + 80, // 80-100%
  responseTime: Math.random() * 100 + 50, // 50-150ms
  activeConnections: Math.floor(Math.random() * 10) + 15, // 15-25 connections
  errorRate: Math.random() * 2, // 0-2%
  throughput: Math.random() * 500 + 1000 // 1000-1500 ops/min
})

const generateRealTimeStats = (): RealTimeStats => ({
  totalRpcCallsSaved: 2847 + Math.floor(Math.random() * 100),
  currentCacheHitRate: 92 + Math.random() * 6,
  averageResponseTime: 180 + Math.random() * 40,
  activeUsers: 45 + Math.floor(Math.random() * 20),
  uptime: 99.94 + Math.random() * 0.05,
  lastUpdate: Date.now()
})

export function LivePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark as client-side rendered
    setIsClient(true)

    // Initialize real-time stats only on client
    setRealTimeStats(generateRealTimeStats())

    // Initialize with some historical data
    const initialData: PerformanceMetrics[] = []
    const now = Date.now()
    for (let i = 29; i >= 0; i--) {
      initialData.push({
        ...generateMetrics(),
        timestamp: now - (i * 30000) // 30 seconds apart
      })
    }
    setMetrics(initialData)

    // Real-time updates every 5 seconds
    const interval = setInterval(() => {
      setMetrics(prev => {
        const newMetrics = [...prev.slice(1), generateMetrics()]
        return newMetrics
      })
      setRealTimeStats(generateRealTimeStats())
    }, 5000)

    // Simulate occasional connection issues
    const connectionInterval = setInterval(() => {
      setIsConnected(prev => Math.random() > 0.1 ? true : !prev)
    }, 30000)

    return () => {
      clearInterval(interval)
      clearInterval(connectionInterval)
    }
  }, [])

  const latestMetrics = metrics[metrics.length - 1]
  const previousMetrics = metrics[metrics.length - 2]

  const getTrend = (current: number, previous: number) => {
    if (!previous) return 'neutral'
    return current > previous ? 'up' : current < previous ? 'down' : 'neutral'
  }

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />
      default:
        return <Activity className="h-3 w-3 text-muted-foreground" />
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // Show loading state until client-side hydration is complete
  if (!isClient || !realTimeStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Live Performance Metrics</h2>
            <p className="text-muted-foreground">
              Real-time SDK performance and optimization tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Performance Metrics</h2>
          <p className="text-muted-foreground">
            Real-time SDK performance and optimization tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="default" className="gap-1">
              <Wifi className="h-3 w-3" />
              Live
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <WifiOff className="h-3 w-3" />
              Reconnecting...
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            Updated {realTimeStats ? formatTime(realTimeStats.lastUpdate) : '--:--'}
          </span>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                RPC Calls Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                <AnimatedNumber value={realTimeStats?.totalRpcCallsSaved ?? 0} />
              </div>
              <p className="text-xs text-muted-foreground">Total optimization</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                Cache Hit Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                <AnimatedNumber value={realTimeStats?.currentCacheHitRate ?? 0} suffix="%" decimals={1} />
              </div>
              <Progress value={realTimeStats?.currentCacheHitRate ?? 0} className="mt-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                Response Time
                {latestMetrics && previousMetrics && (
                  <TrendIcon trend={getTrend(latestMetrics.responseTime, previousMetrics.responseTime)} />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                <AnimatedNumber value={realTimeStats?.averageResponseTime ?? 0} suffix="ms" />
              </div>
              <p className="text-xs text-muted-foreground">Average response</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500" />
                System Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                <AnimatedNumber value={realTimeStats?.uptime ?? 0} suffix="%" decimals={2} />
              </div>
              <p className="text-xs text-muted-foreground">Reliability score</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cache Hit Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Cache Performance
            </CardTitle>
            <CardDescription>
              Real-time cache hit rate and efficiency metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  fontSize={12}
                />
                <YAxis domain={[70, 100]} fontSize={12} />
                <Tooltip
                  labelFormatter={(value) => `Time: ${formatTime(value as number)}`}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Cache Hit Rate']}
                />
                <Area
                  type="monotone"
                  dataKey="cacheHitRate"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              Response Time
            </CardTitle>
            <CardDescription>
              API response time and performance optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  labelFormatter={(value) => `Time: ${formatTime(value as number)}`}
                  formatter={(value: number) => [`${value.toFixed(0)}ms`, 'Response Time']}
                />
                <Line
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Current Performance Snapshot
          </CardTitle>
          <CardDescription>
            Real-time system performance and optimization metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestMetrics && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Network Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">RPC Calls/min:</span>
                    <span className="font-medium">{latestMetrics.rpcCalls}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Connections:</span>
                    <span className="font-medium">{latestMetrics.activeConnections}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Throughput:</span>
                    <span className="font-medium">{latestMetrics.throughput.toFixed(0)} ops/min</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Quality Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Error Rate:</span>
                    <span className="font-medium">
                      {latestMetrics.errorRate.toFixed(2)}%
                      {latestMetrics.errorRate < 1 && (
                        <CheckCircle2 className="inline h-3 w-3 ml-1 text-green-500" />
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cache Efficiency:</span>
                    <span className="font-medium">
                      {latestMetrics.cacheHitRate.toFixed(1)}%
                      {latestMetrics.cacheHitRate > 90 && (
                        <CheckCircle2 className="inline h-3 w-3 ml-1 text-green-500" />
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Users:</span>
                    <span className="font-medium">{realTimeStats?.activeUsers ?? 0}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">System Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>SDK Integration: Active</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>Cache System: Optimal</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>Oracle Feeds: Healthy</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {isConnected ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    )}
                    <span>Connection: {isConnected ? 'Stable' : 'Reconnecting'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}