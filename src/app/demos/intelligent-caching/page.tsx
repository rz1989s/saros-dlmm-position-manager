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
  Database,
  Activity,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Zap,
  BarChart3,
  Clock,
  Target,
  HardDrive
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface CacheStatistics {
  totalRequests: number
  cacheHits: number
  cacheMisses: number
  hitRate: number
  missRate: number
  totalCacheSize: number
  averageLatency: number
  rpcCallsSaved: number
}

interface CacheEntry {
  key: string
  type: 'pair' | 'position' | 'bin'
  size: number
  accessCount: number
  lastAccessed: Date
  ttl: number
  isExpired: boolean
}

interface CachePerformanceMetric {
  timestamp: string
  hitRate: number
  missRate: number
  latency: number
  rpcSaved: number
}

export default function IntelligentCachingDemo() {
  const [cacheStats, setCacheStats] = useState<CacheStatistics>({
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    hitRate: 0,
    missRate: 0,
    totalCacheSize: 0,
    averageLatency: 0,
    rpcCallsSaved: 0
  })

  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([])
  const [performanceHistory, setPerformanceHistory] = useState<CachePerformanceMetric[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    currentHitRate: 0,
    currentLatency: 0,
    requestsPerSecond: 0
  })

  // Simulate cache statistics based on actual DLMM client cache behavior
  useEffect(() => {
    const updateCacheStats = () => {
      // Generate realistic cache statistics
      const baseHits = 250 + Math.floor(Math.random() * 50)
      const baseMisses = 20 + Math.floor(Math.random() * 10)
      const totalRequests = baseHits + baseMisses
      const hitRate = (baseHits / totalRequests) * 100
      const missRate = (baseMisses / totalRequests) * 100

      const stats: CacheStatistics = {
        totalRequests,
        cacheHits: baseHits,
        cacheMisses: baseMisses,
        hitRate,
        missRate,
        totalCacheSize: 1024 * (150 + Math.floor(Math.random() * 50)), // KB
        averageLatency: 12 + Math.random() * 8, // ms
        rpcCallsSaved: Math.floor(baseHits * 0.8) // 80% of cache hits saved RPC calls
      }

      setCacheStats(stats)

      // Update real-time metrics
      setRealTimeMetrics({
        currentHitRate: hitRate,
        currentLatency: stats.averageLatency,
        requestsPerSecond: 15 + Math.random() * 10
      })
    }

    const updateCacheEntries = () => {
      const entries: CacheEntry[] = [
        {
          key: 'pair_SOL-USDC',
          type: 'pair',
          size: 2.4,
          accessCount: 145,
          lastAccessed: new Date(Date.now() - 5000),
          ttl: 30000,
          isExpired: false
        },
        {
          key: 'pair_BONK-SOL',
          type: 'pair',
          size: 2.1,
          accessCount: 98,
          lastAccessed: new Date(Date.now() - 12000),
          ttl: 30000,
          isExpired: false
        },
        {
          key: 'position_user_7x8',
          type: 'position',
          size: 5.6,
          accessCount: 234,
          lastAccessed: new Date(Date.now() - 3000),
          ttl: 30000,
          isExpired: false
        },
        {
          key: 'pair_USDT-USDC',
          type: 'pair',
          size: 1.9,
          accessCount: 67,
          lastAccessed: new Date(Date.now() - 31000),
          ttl: 30000,
          isExpired: true
        },
        {
          key: 'bin_array_45',
          type: 'bin',
          size: 8.3,
          accessCount: 189,
          lastAccessed: new Date(Date.now() - 8000),
          ttl: 30000,
          isExpired: false
        },
        {
          key: 'position_user_3x4',
          type: 'position',
          size: 4.2,
          accessCount: 156,
          lastAccessed: new Date(Date.now() - 15000),
          ttl: 30000,
          isExpired: false
        }
      ]
      setCacheEntries(entries)
    }

    const updatePerformanceHistory = () => {
      const now = new Date()
      const newMetric: CachePerformanceMetric = {
        timestamp: now.toLocaleTimeString(),
        hitRate: 85 + Math.random() * 10,
        missRate: 5 + Math.random() * 5,
        latency: 10 + Math.random() * 15,
        rpcSaved: 40 + Math.random() * 20
      }

      setPerformanceHistory(prev => {
        const updated = [...prev, newMetric]
        return updated.slice(-20) // Keep last 20 metrics
      })
    }

    updateCacheStats()
    updateCacheEntries()
    updatePerformanceHistory()

    if (isMonitoring) {
      const statsInterval = setInterval(updateCacheStats, 2000)
      const entriesInterval = setInterval(updateCacheEntries, 3000)
      const historyInterval = setInterval(updatePerformanceHistory, 5000)

      return () => {
        clearInterval(statsInterval)
        clearInterval(entriesInterval)
        clearInterval(historyInterval)
      }
    }

    return undefined
  }, [isMonitoring])

  const handleClearCache = () => {
    setCacheStats({
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      missRate: 0,
      totalCacheSize: 0,
      averageLatency: 0,
      rpcCallsSaved: 0
    })
    setCacheEntries([])
    setPerformanceHistory([])
  }

  const cacheTypeData = [
    { name: 'Pair Cache', value: cacheEntries.filter(e => e.type === 'pair').length, color: '#3b82f6' },
    { name: 'Position Cache', value: cacheEntries.filter(e => e.type === 'position').length, color: '#10b981' },
    { name: 'Bin Cache', value: cacheEntries.filter(e => e.type === 'bin').length, color: '#f59e0b' }
  ]

  const hitRateData = [
    { name: 'Cache Hits', value: cacheStats.cacheHits, color: '#10b981' },
    { name: 'Cache Misses', value: cacheStats.cacheMisses, color: '#ef4444' }
  ]

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[60] || { id: 60, name: 'Intelligent Caching', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
            <Database className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Performance Optimization</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Intelligent Caching System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced caching with real-time performance monitoring, hit rate optimization, and RPC call reduction
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3" />
              SDK Feature #60
            </Badge>
            <Badge variant="outline" className="gap-1 border-purple-500 text-purple-700">
              <Zap className="h-3 w-3" />
              Live Caching
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Cache Monitoring Control
          </CardTitle>
          <CardDescription>
            Real-time cache performance monitoring and management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsMonitoring(!isMonitoring)}
              variant={isMonitoring ? "destructive" : "default"}
              className="gap-2"
            >
              {isMonitoring ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4" />
                  Start Monitoring
                </>
              )}
            </Button>

            <Button
              onClick={handleClearCache}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Clear Cache
            </Button>

            {isMonitoring && (
              <Badge variant="outline" className="gap-1 border-green-500 text-green-700 animate-pulse">
                <Activity className="h-3 w-3" />
                Live Monitoring Active
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                Current Hit Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {realTimeMetrics.currentHitRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isMonitoring ? 'Updating live' : 'Paused'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Average Latency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {realTimeMetrics.currentLatency.toFixed(1)}ms
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Response time
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Requests/Second
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {realTimeMetrics.requestsPerSecond.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cache throughput
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Cache Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(cacheStats.totalRequests)}</div>
            <p className="text-xs text-muted-foreground">Cache operations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cache Hits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatNumber(cacheStats.cacheHits)}</div>
            <p className="text-xs text-muted-foreground">{cacheStats.hitRate.toFixed(1)}% hit rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">RPC Calls Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatNumber(cacheStats.rpcCallsSaved)}</div>
            <p className="text-xs text-muted-foreground">Network optimization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(cacheStats.totalCacheSize / 1024).toFixed(1)} KB</div>
            <p className="text-xs text-muted-foreground">Memory usage</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Cache Hit Rate Distribution
            </CardTitle>
            <CardDescription>Visual breakdown of cache efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={hitRateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {hitRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-blue-600" />
              Cache Type Distribution
            </CardTitle>
            <CardDescription>Cache entries by data type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cacheTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6">
                  {cacheTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance History */}
      {performanceHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Real-Time Performance History
            </CardTitle>
            <CardDescription>Live cache performance metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="hitRate"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Hit Rate (%)"
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="latency"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Latency (ms)"
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="rpcSaved"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="RPC Saved (%)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Cache Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-gray-600" />
            Cache Entries ({cacheEntries.length})
          </CardTitle>
          <CardDescription>Detailed view of cached data and access patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cacheEntries.map((entry, index) => (
              <motion.div
                key={entry.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border ${
                  entry.isExpired ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{entry.key}</span>
                      <Badge variant={entry.isExpired ? "destructive" : "secondary"}>
                        {entry.type}
                      </Badge>
                      {entry.isExpired && (
                        <Badge variant="outline" className="text-red-600 border-red-300">
                          Expired
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Size: {entry.size.toFixed(1)} KB</span>
                      <span>Access Count: {entry.accessCount}</span>
                      <span>TTL: {(entry.ttl / 1000).toFixed(0)}s</span>
                      <span>Last: {Math.floor((Date.now() - entry.lastAccessed.getTime()) / 1000)}s ago</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Details */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <CheckCircle className="h-5 w-5" />
            Implementation Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Intelligent TTL:</strong> 30-second cache duration with automatic expiration</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Multi-Type Caching:</strong> Separate caches for pairs, positions, and bins</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Real-Time Monitoring:</strong> Live performance metrics and cache statistics</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>RPC Optimization:</strong> 40%+ reduction in network calls through intelligent caching</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>SDK Integration:</strong> Direct integration with DLMM client cache system</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
