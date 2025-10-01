// Comprehensive Price Feed Dashboard
// Real-time monitoring and management of all oracle price feeds
// Bismillah - creating intelligent price feed monitoring interface

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Wifi,
  WifiOff,
  Zap,
  Eye,
  Settings
} from 'lucide-react'
import {
  priceFeedManager,
  type UnifiedPriceData,
  type PriceFeedStatus,
  type FeedManagerStats
} from '@/lib/oracle/price-feed-manager'
import { priceConfidenceSystem, type PriceQualityReport } from '@/lib/oracle/confidence-system'

// ============================================================================
// INTERFACE DEFINITIONS
// ============================================================================

interface PriceFeedDashboardProps {
  symbols?: string[]
  autoRefresh?: boolean
  refreshInterval?: number
  showAdvanced?: boolean
}

interface SystemHealthStatus {
  overallHealth: 'healthy' | 'degraded' | 'critical'
  healthPercentage: number
  activeFeeds: number
  issues: string[]
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function PriceFeedDashboard({
  symbols = ['SOL', 'USDC', 'ETH', 'BTC'],
  autoRefresh = true,
  refreshInterval = 5000,
  showAdvanced = true
}: PriceFeedDashboardProps) {
  // State management
  const [priceData, setPriceData] = useState<Map<string, UnifiedPriceData>>(new Map())
  const [feedStatuses, setFeedStatuses] = useState<Map<string, PriceFeedStatus>>(new Map())
  const [qualityReports, setQualityReports] = useState<Map<string, PriceQualityReport>>(new Map())
  const [systemStats, setSystemStats] = useState<FeedManagerStats | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedSymbol, setSelectedSymbol] = useState<string>(symbols[0] || 'SOL')

  // ============================================================================
  // DATA FETCHING & UPDATES
  // ============================================================================

  const refreshAllData = useCallback(async () => {
    try {
      console.log('🔄 Refreshing price feed dashboard data...')

      // Get all price data
      const prices = await priceFeedManager.getPrices(symbols)
      setPriceData(prices)

      // Get feed statuses
      const statuses = priceFeedManager.getAllFeedStatuses()
      setFeedStatuses(statuses)

      // Get quality reports
      const reports = new Map<string, PriceQualityReport>()
      for (const symbol of symbols) {
        try {
          const report = await priceConfidenceSystem.generateQualityReport(symbol)
          reports.set(symbol, report)
        } catch (error) {
          console.warn(`Failed to get quality report for ${symbol}:`, error)
        }
      }
      setQualityReports(reports)

      // Get system stats
      const stats = priceFeedManager.getStats()
      setSystemStats(stats)

      // Get system health
      const health = priceFeedManager.getSystemHealth()
      setSystemHealth(health)

      setLastUpdate(new Date())
      setIsLoading(false)

      console.log('✅ Dashboard data refreshed successfully')

    } catch (error) {
      console.error('❌ Failed to refresh dashboard data:', error)
      setIsLoading(false)
    }
  }, [symbols])

  // Auto-refresh setup
  useEffect(() => {
    // Initial load
    refreshAllData()

    if (!autoRefresh) return

    const interval = setInterval(refreshAllData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshAllData, autoRefresh, refreshInterval])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getStatusColor = (status: PriceFeedStatus['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: PriceFeedStatus['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'degraded': return <AlertCircle className="w-4 h-4" />
      case 'failed': return <WifiOff className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'healthy': return 'default'
      case 'degraded': return 'secondary'
      case 'critical': return 'destructive'
      default: return 'outline'
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    if (price >= 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(6)}`
  }

  const formatStaleness = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    return `${Math.round(seconds / 3600)}h`
  }

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderSystemOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* System Health */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Health</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getHealthBadgeVariant(systemHealth?.overallHealth || 'unknown')}>
                  {systemHealth?.overallHealth || 'Unknown'}
                </Badge>
                <span className="text-sm text-gray-500">
                  {systemHealth?.healthPercentage.toFixed(0)}%
                </span>
              </div>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* Active Feeds */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Feeds</p>
              <p className="text-2xl font-bold">
                {systemHealth?.activeFeeds || 0}
                <span className="text-sm text-gray-500 ml-1">
                  /{systemStats?.totalFeeds || 0}
                </span>
              </p>
            </div>
            <Wifi className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* Cache Performance */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cache Hit Rate</p>
              <p className="text-2xl font-bold">
                {systemStats ? `${(systemStats.cacheHitRate * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <Zap className="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      {/* Response Time */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold">
                {systemStats ? `${systemStats.averageResponseTime.toFixed(0)}ms` : '0ms'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPriceFeedGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {symbols.map(symbol => {
        const price = priceData.get(symbol)
        const status = feedStatuses.get(symbol)
        const quality = qualityReports.get(symbol)

        return (
          <Card
            key={symbol}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedSymbol === symbol ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedSymbol(symbol)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{symbol}</CardTitle>
                <div className={`flex items-center gap-1 ${getStatusColor(status?.status || 'unknown')}`}>
                  {getStatusIcon(status?.status || 'unknown')}
                  <span className="text-xs capitalize">{status?.status || 'Unknown'}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {price ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold">{formatPrice(price.price)}</p>
                    <p className="text-xs text-gray-500">
                      via {price.source} {price.aggregated && '(aggregated)'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Confidence:</span>
                      <span className={`font-medium ${
                        price.confidence >= 0.9 ? 'text-green-600' :
                        price.confidence >= 0.7 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(price.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={price.confidence * 100} className="h-1" />
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Quality: {quality?.overallScore || 0}/100</span>
                    <span>Age: {formatStaleness(price.staleness)}</span>
                  </div>

                  {price.metadata.warnings.length > 0 && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        {price.metadata.warnings[0]}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <WifiOff className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const renderDetailedView = () => {
    const price = priceData.get(selectedSymbol)
    const quality = qualityReports.get(selectedSymbol)

    if (!price || !quality) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <WifiOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No detailed data available for {selectedSymbol}</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Detailed View: {selectedSymbol}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price Information */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Price Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Current Price:</span>
                    <span className="font-mono text-lg">{formatPrice(price.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Source:</span>
                    <Badge variant="outline">{price.source}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Aggregated:</span>
                    <span>{price.aggregated ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Update:</span>
                    <span className="text-sm">{price.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Quality Metrics */}
              <div>
                <h4 className="font-medium mb-2">Quality Metrics</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Score:</span>
                      <span className="font-medium">{quality.overallScore}/100</span>
                    </div>
                    <Progress value={quality.overallScore} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confidence:</span>
                      <span className="font-medium">{(price.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={price.confidence * 100} />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Staleness:</span>
                    <Badge variant={
                      quality.staleness.level === 'fresh' ? 'default' :
                      quality.staleness.level === 'acceptable' ? 'secondary' :
                      quality.staleness.level === 'stale' ? 'destructive' : 'destructive'
                    }>
                      {quality.staleness.level} ({formatStaleness(quality.staleness.seconds)})
                    </Badge>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Stability:</span>
                    <Badge variant="outline">{quality.consistency.stability}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Warnings and Actions */}
            <div className="space-y-4">
              {quality.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-yellow-600">Warnings</h4>
                  <div className="space-y-2">
                    {quality.warnings.map((warning, index) => (
                      <Alert key={index} className="border-yellow-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{warning}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {quality.actions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-blue-600">Recommended Actions</h4>
                  <div className="space-y-2">
                    {quality.actions.map((action, index) => (
                      <Alert key={index} className="border-blue-200">
                        <Settings className="h-4 w-4" />
                        <AlertDescription className="text-sm">{action}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Information */}
              {price.metadata.sources.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Sources</h4>
                  <div className="space-y-1">
                    {price.metadata.sources.map((source, index) => (
                      <Badge key={index} variant="outline" className="mr-2">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderSystemIssues = () => {
    if (!systemHealth?.issues.length) return null

    return (
      <Alert className="mb-4 border-red-200">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>System Issues Detected</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2">
            {systemHealth.issues.map((issue, index) => (
              <li key={index} className="text-sm">{issue}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
          <p className="text-gray-500">Loading price feed dashboard...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Price Feed Dashboard</h2>
          <p className="text-gray-600">
            Real-time monitoring of oracle price feeds • Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={refreshAllData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Issues */}
      {renderSystemIssues()}

      {/* System Overview */}
      {renderSystemOverview()}

      {/* Main Content */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Price Grid</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          {showAdvanced && <TabsTrigger value="system">System Stats</TabsTrigger>}
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {renderPriceFeedGrid()}
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Symbol:</label>
            <div className="flex gap-2">
              {symbols.map(symbol => (
                <Button
                  key={symbol}
                  variant={selectedSymbol === symbol ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSymbol(symbol)}
                >
                  {symbol}
                </Button>
              ))}
            </div>
          </div>
          {renderDetailedView()}
        </TabsContent>

        {showAdvanced && (
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {systemStats && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{systemStats.totalRequests}</p>
                      <p className="text-sm text-gray-600">Total Requests</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{(systemStats.cacheHitRate * 100).toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Cache Hit Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{systemStats.averageResponseTime.toFixed(0)}ms</p>
                      <p className="text-sm text-gray-600">Avg Response Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{Math.round(systemStats.uptime / 60)}m</p>
                      <p className="text-sm text-gray-600">Uptime</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{systemStats.healthyFeeds}</p>
                      <p className="text-sm text-gray-600">Healthy Feeds</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{systemStats.failedFeeds}</p>
                      <p className="text-sm text-gray-600">Failed Feeds</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}