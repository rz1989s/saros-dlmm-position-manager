'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { StaggerList } from '@/components/animations/stagger-list'
import {
  Globe,
  Zap,
  Shield,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Gauge,
  Settings,
  Eye,
  Network,
  Server,
  Wifi
} from 'lucide-react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts'

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

interface SwitchboardFeed {
  id: string
  name: string
  symbol: string
  price: number
  confidence: number
  lastUpdate: Date
  updateCount: number
  deviation: number
  staleness: number
  status: 'active' | 'stale' | 'error'
  provider: 'switchboard' | 'pyth' | 'chainlink'
  network: 'solana' | 'ethereum'
  feedAddress: string
}

interface SurgeMetrics {
  responseTime: number
  reliability: number
  costEfficiency: number
  dataQuality: number
  throughput: number
  errorRate: number
}

interface ComparisonData {
  provider: string
  latency: number
  accuracy: number
  uptime: number
  cost: number
  coverage: number
}

const MOCK_FEEDS: SwitchboardFeed[] = [
  {
    id: 'sb-sol-usd',
    name: 'SOL/USD Price Feed',
    symbol: 'SOL/USD',
    price: 23.45 + Math.random() * 2 - 1,
    confidence: 99.8,
    lastUpdate: new Date(),
    updateCount: 1247,
    deviation: 0.12,
    staleness: 0,
    status: 'active',
    provider: 'switchboard',
    network: 'solana',
    feedAddress: 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR'
  },
  {
    id: 'sb-btc-usd',
    name: 'BTC/USD Price Feed',
    symbol: 'BTC/USD',
    price: 43250 + Math.random() * 1000 - 500,
    confidence: 99.9,
    lastUpdate: new Date(Date.now() - 2000),
    updateCount: 892,
    deviation: 0.08,
    staleness: 2,
    status: 'active',
    provider: 'switchboard',
    network: 'solana',
    feedAddress: '8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6dilSJie'
  },
  {
    id: 'pyth-eth-usd',
    name: 'ETH/USD Price Feed',
    symbol: 'ETH/USD',
    price: 2420 + Math.random() * 100 - 50,
    confidence: 99.5,
    lastUpdate: new Date(Date.now() - 1500),
    updateCount: 1567,
    deviation: 0.15,
    staleness: 1.5,
    status: 'active',
    provider: 'pyth',
    network: 'solana',
    feedAddress: 'JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB'
  },
  {
    id: 'cl-link-usd',
    name: 'LINK/USD Price Feed',
    symbol: 'LINK/USD',
    price: 14.67 + Math.random() * 1 - 0.5,
    confidence: 98.2,
    lastUpdate: new Date(Date.now() - 5000),
    updateCount: 723,
    deviation: 0.25,
    staleness: 5,
    status: 'stale',
    provider: 'chainlink',
    network: 'ethereum',
    feedAddress: '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c'
  }
]

const SURGE_METRICS: SurgeMetrics = {
  responseTime: 45, // ms
  reliability: 99.97, // %
  costEfficiency: 87, // %
  dataQuality: 98.5, // %
  throughput: 1250, // updates/min
  errorRate: 0.03 // %
}

const COMPARISON_DATA: ComparisonData[] = [
  {
    provider: 'Switchboard',
    latency: 45,
    accuracy: 99.8,
    uptime: 99.97,
    cost: 0.0001,
    coverage: 95
  },
  {
    provider: 'Pyth Network',
    latency: 38,
    accuracy: 99.6,
    uptime: 99.8,
    cost: 0.0002,
    coverage: 85
  },
  {
    provider: 'Chainlink',
    latency: 120,
    accuracy: 99.2,
    uptime: 99.5,
    cost: 0.005,
    coverage: 78
  }
]

// Generate time series data
const generateTimeSeriesData = (symbol: string, hours: number = 24) => {
  const data = []
  const basePrice = MOCK_FEEDS.find(f => f.symbol === symbol)?.price || 100
  const now = Date.now()

  for (let i = hours; i >= 0; i--) {
    const timestamp = now - (i * 60 * 60 * 1000)
    const price = basePrice + Math.sin(i / 4) * (basePrice * 0.02) + (Math.random() - 0.5) * (basePrice * 0.01)
    const confidence = 98 + Math.random() * 2

    data.push({
      timestamp: new Date(timestamp).toISOString(),
      time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      price: Number(price.toFixed(2)),
      confidence: Number(confidence.toFixed(1)),
      deviation: (Math.random() * 0.5).toFixed(3),
      volume: Math.floor(Math.random() * 10000) + 1000
    })
  }

  return data
}

// ============================================================================
// COMPONENT DEFINITION
// ============================================================================

export default function SwitchboardIntegrationDemo() {
  // State management
  const [activeTab, setActiveTab] = useState('feeds')
  const [selectedFeed, setSelectedFeed] = useState<SwitchboardFeed>(MOCK_FEEDS[0])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5) // seconds
  const [feeds, setFeeds] = useState<SwitchboardFeed[]>(MOCK_FEEDS)
  const [surgeEnabled, setSurgeEnabled] = useState(true)
  const [crossValidation, setCrossValidation] = useState(true)
  const [alertsEnabled, setAlertsEnabled] = useState(true)

  // Simulated real-time updates
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setFeeds(prevFeeds =>
        prevFeeds.map(feed => ({
          ...feed,
          price: feed.price + (Math.random() - 0.5) * (feed.price * 0.001),
          confidence: Math.max(95, Math.min(100, feed.confidence + (Math.random() - 0.5) * 0.5)),
          lastUpdate: new Date(),
          updateCount: feed.updateCount + 1,
          staleness: Math.random() * 3
        }))
      )
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  // Memoized data
  const timeSeriesData = useMemo(() => {
    return generateTimeSeriesData(selectedFeed.symbol, 24)
  }, [selectedFeed.symbol])

  const healthMetrics = useMemo(() => {
    const activeFeeds = feeds.filter(f => f.status === 'active').length
    const averageConfidence = feeds.reduce((sum, f) => sum + f.confidence, 0) / feeds.length
    const averageStaleness = feeds.reduce((sum, f) => sum + f.staleness, 0) / feeds.length

    return {
      activeFeeds,
      totalFeeds: feeds.length,
      averageConfidence: Number(averageConfidence.toFixed(1)),
      averageStaleness: Number(averageStaleness.toFixed(1)),
      healthScore: Math.max(0, Math.min(100, 100 - averageStaleness * 10))
    }
  }, [feeds])

  // Event handlers
  const handleRefreshFeed = useCallback((feedId: string) => {
    setFeeds(prevFeeds =>
      prevFeeds.map(feed =>
        feed.id === feedId
          ? {
              ...feed,
              price: feed.price + (Math.random() - 0.5) * (feed.price * 0.002),
              confidence: Math.min(100, feed.confidence + Math.random()),
              lastUpdate: new Date(),
              updateCount: feed.updateCount + 1,
              staleness: 0
            }
          : feed
      )
    )
  }, [])


  const exportData = useCallback(() => {
    const exportData = {
      feeds: feeds,
      timeSeriesData: timeSeriesData,
      surgeMetrics: SURGE_METRICS,
      comparison: COMPARISON_DATA,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `switchboard-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [feeds, timeSeriesData])

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <FeatureIdentifier
      feature={SDK_FEATURES[14]}
    >
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <Globe className="h-8 w-8 text-green-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Switchboard Integration Demo
            </h1>
          </div>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience Switchboard&apos;s advanced oracle technology with Surge optimization,
            cross-validation, and comprehensive feed monitoring capabilities.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="text-sm">
              <Network className="h-4 w-4 mr-1" />
              {healthMetrics.activeFeeds}/{healthMetrics.totalFeeds} Feeds Active
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Zap className="h-4 w-4 mr-1" />
              Surge {surgeEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Shield className="h-4 w-4 mr-1" />
              {healthMetrics.averageConfidence}% Avg Confidence
            </Badge>
          </div>
        </motion.div>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Oracle Control Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh">Auto Refresh</Label>
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="surge-enabled">Surge Technology</Label>
                <Switch
                  id="surge-enabled"
                  checked={surgeEnabled}
                  onCheckedChange={setSurgeEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="cross-validation">Cross Validation</Label>
                <Switch
                  id="cross-validation"
                  checked={crossValidation}
                  onCheckedChange={setCrossValidation}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="alerts">Price Alerts</Label>
                <Switch
                  id="alerts"
                  checked={alertsEnabled}
                  onCheckedChange={setAlertsEnabled}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="refresh-interval">Refresh Interval (s):</Label>
                <Select
                  value={refreshInterval.toString()}
                  onValueChange={(value) => setRefreshInterval(Number(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1s</SelectItem>
                    <SelectItem value="5">5s</SelectItem>
                    <SelectItem value="10">10s</SelectItem>
                    <SelectItem value="30">30s</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="sm" onClick={exportData}>
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Network Health</p>
                  <p className="text-2xl font-bold">{healthMetrics.healthScore}%</p>
                </div>
                <Gauge className={`h-8 w-8 ${
                  healthMetrics.healthScore > 90 ? 'text-green-500' :
                  healthMetrics.healthScore > 70 ? 'text-yellow-500' : 'text-red-500'
                }`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                  <p className="text-2xl font-bold">{SURGE_METRICS.responseTime}ms</p>
                </div>
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Quality</p>
                  <p className="text-2xl font-bold">{SURGE_METRICS.dataQuality}%</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Throughput</p>
                  <p className="text-2xl font-bold">{SURGE_METRICS.throughput}/min</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feeds" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Feeds
            </TabsTrigger>
            <TabsTrigger value="surge" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Surge Technology
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Provider Comparison
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
          </TabsList>

          {/* Live Feeds Tab */}
          <TabsContent value="feeds" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Feed List */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold">Active Price Feeds</h3>
                <StaggerList>
                  {feeds.map((feed) => (
                    <motion.div key={feed.id}>
                      <Card
                        className={`cursor-pointer transition-all ${
                          selectedFeed.id === feed.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedFeed(feed)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                feed.status === 'active' ? 'bg-green-500' :
                                feed.status === 'stale' ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                              <span className="font-medium">{feed.symbol}</span>
                              <Badge variant="outline" className="text-xs">
                                {feed.provider}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRefreshFeed(feed.id)
                              }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold">
                                ${feed.price.toFixed(feed.symbol.includes('BTC') ? 0 : 2)}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-muted-foreground">
                                  {feed.confidence.toFixed(1)}%
                                </span>
                                <Shield className="h-3 w-3 text-green-500" />
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Updated: {Math.floor(feed.staleness)}s ago</span>
                              <span>{feed.updateCount} updates</span>
                            </div>

                            {feed.staleness > 10 && (
                              <Alert className="mt-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  Feed may be stale
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </StaggerList>
              </div>

              {/* Feed Details */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedFeed.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedFeed.status === 'active' ? 'default' : 'destructive'}>
                      {selectedFeed.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedFeed.feedAddress.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                {/* Price Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Price History (24h)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="time"
                            tick={{ fontSize: 12 }}
                            interval={Math.floor(timeSeriesData.length / 6)}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            activeDot={{ r: 4 }}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Feed Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Confidence</span>
                          <span className="font-medium">{selectedFeed.confidence.toFixed(1)}%</span>
                        </div>
                        <Progress value={selectedFeed.confidence} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Deviation</span>
                          <span className="font-medium">{selectedFeed.deviation.toFixed(3)}%</span>
                        </div>
                        <Progress value={selectedFeed.deviation * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Surge Technology Tab */}
          <TabsContent value="surge" className="space-y-6">
            <div className="text-center py-8">
              <Zap className="h-16 w-16 mx-auto text-blue-500 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Switchboard Surge Technology</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience next-generation oracle performance with Surge&apos;s optimized data delivery,
                reduced latency, and enhanced reliability features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{SURGE_METRICS.responseTime}ms</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Lightning-fast oracle responses with Surge optimization
                  </p>
                  <Progress value={(100 - SURGE_METRICS.responseTime)} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Reliability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{SURGE_METRICS.reliability}%</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enterprise-grade uptime and reliability guarantees
                  </p>
                  <Progress value={SURGE_METRICS.reliability} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Throughput
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{SURGE_METRICS.throughput}</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Updates per minute across all feeds
                  </p>
                  <Progress value={(SURGE_METRICS.throughput / 1500) * 100} className="h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Surge Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData.slice(-12)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="confidence"
                        stackId="1"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Surge Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Optimized Data Paths</p>
                      <p className="text-sm text-muted-foreground">Direct routing for minimal latency</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Intelligent Caching</p>
                      <p className="text-sm text-muted-foreground">Smart cache invalidation and updates</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Load Balancing</p>
                      <p className="text-sm text-muted-foreground">Automatic traffic distribution</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Real-time Monitoring</p>
                      <p className="text-sm text-muted-foreground">Continuous performance tracking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Network Usage</span>
                        <span className="text-sm font-medium">-23%</span>
                      </div>
                      <Progress value={77} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Computational Load</span>
                        <span className="text-sm font-medium">-31%</span>
                      </div>
                      <Progress value={69} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Overall Efficiency</span>
                        <span className="text-sm font-medium">{SURGE_METRICS.costEfficiency}%</span>
                      </div>
                      <Progress value={SURGE_METRICS.costEfficiency} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Provider Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <h3 className="text-xl font-semibold">Oracle Provider Comparison</h3>

            {/* Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={COMPARISON_DATA}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="provider" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="accuracy" fill="hsl(var(--primary))" name="Accuracy %" />
                      <Bar dataKey="uptime" fill="hsl(var(--secondary))" name="Uptime %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Provider Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Provider</th>
                        <th className="text-left py-3 px-4">Latency (ms)</th>
                        <th className="text-left py-3 px-4">Accuracy (%)</th>
                        <th className="text-left py-3 px-4">Uptime (%)</th>
                        <th className="text-left py-3 px-4">Cost (per update)</th>
                        <th className="text-left py-3 px-4">Market Coverage</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON_DATA.map((provider) => (
                        <tr key={provider.provider} className="border-b">
                          <td className="py-3 px-4 font-medium">{provider.provider}</td>
                          <td className="py-3 px-4">{provider.latency}</td>
                          <td className="py-3 px-4">{provider.accuracy}</td>
                          <td className="py-3 px-4">{provider.uptime}</td>
                          <td className="py-3 px-4">${provider.cost}</td>
                          <td className="py-3 px-4">{provider.coverage}%</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-600">Active</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Cross-Validation Results */}
            <Card>
              <CardHeader>
                <CardTitle>Cross-Validation Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">98.7%</div>
                    <p className="text-sm text-muted-foreground">Agreement Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">0.12%</div>
                    <p className="text-sm text-muted-foreground">Max Deviation</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">2.3s</div>
                    <p className="text-sm text-muted-foreground">Validation Time</p>
                  </div>
                </div>

                {crossValidation && (
                  <Alert className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Cross-validation is active. All price feeds are being validated against multiple sources.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <h3 className="text-xl font-semibold">System Monitoring & Health</h3>

            {/* Alert System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Feed Staleness Warning:</strong> LINK/USD feed hasn&apos;t updated in 5 seconds
                  </AlertDescription>
                </Alert>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>System Health:</strong> All primary feeds operational
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Network Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Network Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span>Solana Mainnet</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">Operational</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-blue-500" />
                      <span>Switchboard Network</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">Healthy</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-purple-500" />
                      <span>Cross-chain Bridge</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <span className="text-sm font-medium text-green-600">{SURGE_METRICS.errorRate}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cache Hit Rate</span>
                    <span className="text-sm font-medium">94.2%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Freshness</span>
                    <span className="text-sm font-medium">99.8%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Validation Success</span>
                    <span className="text-sm font-medium text-green-600">99.9%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Real-time Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">12:34:56</span>
                    <span>SOL/USD price updated: $23.45</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">12:34:51</span>
                    <span>Cross-validation completed for BTC/USD</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-muted-foreground">12:34:48</span>
                    <span>Surge optimization applied to ETH/USD feed</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-muted-foreground">12:34:43</span>
                    <span>LINK/USD feed staleness warning cleared</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">12:34:40</span>
                    <span>Network health check passed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Switchboard Integration: {feeds.filter(f => f.provider === 'switchboard').length} feeds active,
                Surge {surgeEnabled ? 'enabled' : 'disabled'},
                Cross-validation {crossValidation ? 'active' : 'inactive'}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={exportData}>
                  Export Data
                </Button>
                <Button variant="outline" size="sm">
                  View Documentation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureIdentifier>
  )
}