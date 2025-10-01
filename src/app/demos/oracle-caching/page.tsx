'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { formatCurrency, formatNumber } from '@/lib/utils/format'
import {
  Zap,
  Activity,
  TrendingUp,
  CheckCircle,
  Clock,
  Database,
  Shield,
  RefreshCw
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface OracleCacheEntry {
  symbol: string
  provider: 'pyth' | 'switchboard'
  price: number
  cached: boolean
  age: number
  ttl: number
  hitCount: number
  confidence: number
}

interface ProviderMetrics {
  provider: string
  cacheHitRate: number
  averageLatency: number
  requestCount: number
  cacheSize: number
  freshness: number
}

export default function OracleCachingDemo() {
  const [cacheEntries, setCacheEntries] = useState<OracleCacheEntry[]>([])
  const [providerMetrics, setProviderMetrics] = useState<ProviderMetrics[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [totalStats, setTotalStats] = useState({
    totalHits: 0,
    totalMisses: 0,
    hitRate: 0,
    rpcSaved: 0
  })

  useEffect(() => {
    updateOracleCacheData()
  }, [])

  const updateOracleCacheData = () => {
    // Simulate oracle cache entries
    const entries: OracleCacheEntry[] = [
      {
        symbol: 'SOL/USD',
        provider: 'pyth',
        price: 98.45,
        cached: true,
        age: 5.2,
        ttl: 10,
        hitCount: 234,
        confidence: 0.998
      },
      {
        symbol: 'SOL/USD',
        provider: 'switchboard',
        price: 98.42,
        cached: true,
        age: 3.8,
        ttl: 10,
        hitCount: 189,
        confidence: 0.995
      },
      {
        symbol: 'BONK/USD',
        provider: 'pyth',
        price: 0.000024,
        cached: true,
        age: 7.1,
        ttl: 10,
        hitCount: 156,
        confidence: 0.991
      },
      {
        symbol: 'USDC/USD',
        provider: 'pyth',
        price: 1.0001,
        cached: true,
        age: 2.3,
        ttl: 10,
        hitCount: 412,
        confidence: 0.999
      },
      {
        symbol: 'USDT/USD',
        provider: 'switchboard',
        price: 0.9998,
        cached: false,
        age: 11.5,
        ttl: 10,
        hitCount: 98,
        confidence: 0.997
      },
      {
        symbol: 'JUP/USD',
        provider: 'pyth',
        price: 1.23,
        cached: true,
        age: 4.6,
        ttl: 10,
        hitCount: 167,
        confidence: 0.993
      }
    ]

    setCacheEntries(entries)

    // Calculate provider-specific metrics
    const metrics: ProviderMetrics[] = [
      {
        provider: 'Pyth Network',
        cacheHitRate: 94.2,
        averageLatency: 8.5,
        requestCount: 1243,
        cacheSize: 45.6,
        freshness: 96.8
      },
      {
        provider: 'Switchboard',
        cacheHitRate: 89.7,
        averageLatency: 12.3,
        requestCount: 876,
        cacheSize: 32.1,
        freshness: 92.4
      }
    ]

    setProviderMetrics(metrics)

    // Calculate total statistics
    const totalHits = 1842
    const totalMisses = 197
    const totalRequests = totalHits + totalMisses
    setTotalStats({
      totalHits,
      totalMisses,
      hitRate: (totalHits / totalRequests) * 100,
      rpcSaved: Math.floor(totalHits * 0.85)
    })
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    updateOracleCacheData()
    setIsRefreshing(false)
  }

  const handleInvalidateCache = (symbol: string, provider: string) => {
    setCacheEntries(prev =>
      prev.map(entry =>
        entry.symbol === symbol && entry.provider === provider
          ? { ...entry, cached: false, age: 0, hitCount: 0 }
          : entry
      )
    )
  }

  const cacheDistributionData = [
    { name: 'Pyth Cached', value: cacheEntries.filter(e => e.provider === 'pyth' && e.cached).length, color: '#8b5cf6' },
    { name: 'Switchboard Cached', value: cacheEntries.filter(e => e.provider === 'switchboard' && e.cached).length, color: '#3b82f6' },
    { name: 'Expired/Uncached', value: cacheEntries.filter(e => !e.cached).length, color: '#ef4444' }
  ]

  const hitRateComparisonData = providerMetrics.map(metric => ({
    provider: metric.provider,
    hitRate: metric.cacheHitRate,
    latency: metric.averageLatency
  }))

  const cacheAgeDistribution = [
    { range: '0-2s', pyth: 2, switchboard: 1 },
    { range: '2-4s', pyth: 1, switchboard: 2 },
    { range: '4-6s', pyth: 2, switchboard: 0 },
    { range: '6-8s', pyth: 1, switchboard: 0 },
    { range: '8-10s', pyth: 0, switchboard: 0 },
    { range: '>10s', pyth: 0, switchboard: 1 }
  ]

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[10] || { id: 10, name: 'Oracle Caching', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
            <Zap className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Oracle Integration</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Oracle Price Feed Caching
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Intelligent caching for Pyth and Switchboard oracles with provider-specific optimization and real-time freshness monitoring
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3" />
              SDK Feature #10
            </Badge>
            <Badge variant="outline" className="gap-1 border-purple-500 text-purple-700">
              <Database className="h-3 w-3" />
              Multi-Provider
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Oracle Cache Control
          </CardTitle>
          <CardDescription>
            Manage oracle price feed caching and monitor provider performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh Data
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">
                Cache hit rate: <strong className="text-green-600">{totalStats.hitRate.toFixed(1)}%</strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Cache Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {totalStats.hitRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(totalStats.totalHits)} / {formatNumber(totalStats.totalHits + totalStats.totalMisses)} requests
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              RPC Calls Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {formatNumber(totalStats.rpcSaved)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Network optimization
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-600" />
              Active Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {providerMetrics.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pyth + Switchboard
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-600" />
              Cache Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {cacheEntries.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {cacheEntries.filter(e => e.cached).length} cached
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Provider Hit Rate Comparison
            </CardTitle>
            <CardDescription>Cache efficiency by oracle provider</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hitRateComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="provider" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="hitRate" fill="#10b981" name="Hit Rate (%)" />
                <Bar yAxisId="right" dataKey="latency" fill="#3b82f6" name="Latency (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              Cache Distribution
            </CardTitle>
            <CardDescription>Provider-specific cache status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cacheDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cacheDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Provider Metrics Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providerMetrics.map((metric, index) => (
          <motion.div
            key={metric.provider}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={index === 0 ? 'border-purple-200' : 'border-blue-200'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {index === 0 ? (
                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                  )}
                  {metric.provider}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
                  <span className="font-medium text-green-600">{metric.cacheHitRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Latency</span>
                  <span className="font-medium">{metric.averageLatency.toFixed(1)}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Requests</span>
                  <span className="font-medium">{formatNumber(metric.requestCount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cache Size</span>
                  <span className="font-medium">{metric.cacheSize.toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Data Freshness</span>
                  <span className="font-medium text-blue-600">{metric.freshness.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Cache Age Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Cache Age Distribution
          </CardTitle>
          <CardDescription>Age distribution of cached oracle prices</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cacheAgeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pyth" fill="#8b5cf6" name="Pyth Network" />
              <Bar dataKey="switchboard" fill="#3b82f6" name="Switchboard" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cache Entries Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-gray-600" />
            Cached Oracle Prices ({cacheEntries.length})
          </CardTitle>
          <CardDescription>Real-time oracle cache entries with freshness indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cacheEntries.map((entry, index) => (
              <motion.div
                key={`${entry.symbol}-${entry.provider}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border ${
                  !entry.cached ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${entry.provider === 'pyth' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                    <span className="font-mono text-sm font-medium">{entry.symbol}</span>
                    <Badge variant="secondary" className="text-xs">
                      {entry.provider}
                    </Badge>
                    {!entry.cached && (
                      <Badge variant="destructive" className="text-xs">
                        Expired
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{formatCurrency(entry.price)}</div>
                    <div className="text-xs text-muted-foreground">
                      Confidence: {(entry.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="block mb-1">Age</span>
                    <span className="font-medium text-foreground">{entry.age.toFixed(1)}s</span>
                  </div>
                  <div>
                    <span className="block mb-1">TTL</span>
                    <span className="font-medium text-foreground">{entry.ttl}s</span>
                  </div>
                  <div>
                    <span className="block mb-1">Hit Count</span>
                    <span className="font-medium text-foreground">{entry.hitCount}</span>
                  </div>
                  <div>
                    <span className="block mb-1">Freshness</span>
                    <span className={`font-medium ${entry.cached ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.max(0, 100 - (entry.age / entry.ttl) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {!entry.cached && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 gap-2"
                    onClick={() => handleInvalidateCache(entry.symbol, entry.provider)}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh Cache
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Details */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <CheckCircle className="h-5 w-5" />
            Oracle Caching Features
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-purple-800 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Multi-Provider Support:</strong> Unified caching for Pyth Network and Switchboard oracles</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Smart TTL Management:</strong> 10-second cache duration optimized for oracle update frequencies</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Freshness Monitoring:</strong> Real-time tracking of cache age and data staleness</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Provider-Specific Optimization:</strong> Independent cache strategies per oracle provider</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Confidence Tracking:</strong> Cache quality metrics with confidence interval monitoring</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
