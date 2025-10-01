// Real-time Price Feed Monitor Component
// Individual symbol tracking with streaming updates and mini charts
// Bismillah - creating real-time price monitoring interface

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine
} from 'recharts'
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause,
  Play,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  WifiOff
} from 'lucide-react'
import {
  priceFeedManager,
  type UnifiedPriceData
} from '@/lib/oracle/price-feed-manager'
import { pythIntegration } from '@/lib/oracle/pyth-integration'
import { priceConfidenceSystem, type PriceQualityReport } from '@/lib/oracle/confidence-system'

// ============================================================================
// INTERFACE DEFINITIONS
// ============================================================================

interface PriceFeedMonitorProps {
  symbol: string
  autoRefresh?: boolean
  refreshInterval?: number
  showChart?: boolean
  showAdvanced?: boolean
  showStreaming?: boolean
  maxDataPoints?: number
  onPriceUpdate?: (symbol: string, price: UnifiedPriceData) => void
}

interface PriceDataPoint {
  timestamp: Date
  price: number
  confidence: number
  staleness: number
  source: string
  qualityScore: number
}

interface StreamingStatus {
  isActive: boolean
  connectionHealth: 'connected' | 'disconnected' | 'error'
  lastHeartbeat: Date | null
  dataCount: number
}

// ============================================================================
// MAIN MONITOR COMPONENT
// ============================================================================

export default function PriceFeedMonitor({
  symbol,
  autoRefresh = true,
  refreshInterval = 2000,
  showChart = true,
  showAdvanced = false,
  showStreaming = true,
  maxDataPoints = 50,
  onPriceUpdate
}: PriceFeedMonitorProps) {
  // State management
  const [currentPrice, setCurrentPrice] = useState<UnifiedPriceData | null>(null)
  const [qualityReport, setQualityReport] = useState<PriceQualityReport | null>(null)
  const [priceHistory, setPriceHistory] = useState<PriceDataPoint[]>([])
  const [streamingStatus, setStreamingStatus] = useState<StreamingStatus>({
    isActive: false,
    connectionHealth: 'disconnected',
    lastHeartbeat: null,
    dataCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isStreamingEnabled, setIsStreamingEnabled] = useState(showStreaming)
  const [error, setError] = useState<string | null>(null)

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamingRef = useRef<boolean>(false)

  // ============================================================================
  // DATA FETCHING & UPDATES
  // ============================================================================

  const fetchPriceData = useCallback(async () => {
    if (isPaused) return

    try {
      setError(null)

      // Get unified price data
      const price = await priceFeedManager.getPrice(symbol)
      setCurrentPrice(price)

      // Get quality report
      const quality = await priceConfidenceSystem.generateQualityReport(symbol)
      setQualityReport(quality)

      // Add to history
      const dataPoint: PriceDataPoint = {
        timestamp: new Date(),
        price: price.price,
        confidence: price.confidence,
        staleness: price.staleness,
        source: price.source,
        qualityScore: quality.overallScore
      }

      setPriceHistory(prev => {
        const newHistory = [...prev, dataPoint].slice(-maxDataPoints)
        return newHistory
      })

      // Notify parent component
      if (onPriceUpdate) {
        onPriceUpdate(symbol, price)
      }

      setIsLoading(false)

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      console.error(`❌ Failed to fetch price for ${symbol}:`, err)
    }
  }, [symbol, isPaused, maxDataPoints, onPriceUpdate])

  // Initialize streaming if enabled
  const initializeStreaming = useCallback(async () => {
    if (!isStreamingEnabled || streamingRef.current) return

    try {
      console.log(`🌊 Initializing streaming for ${symbol}...`)

      streamingRef.current = true
      setStreamingStatus(prev => ({
        ...prev,
        isActive: true,
        connectionHealth: 'connected',
        lastHeartbeat: new Date()
      }))

      // Start streaming updates
      const onUpdate = (_priceData: any) => {
        if (!streamingRef.current) return

        setStreamingStatus(prev => ({
          ...prev,
          lastHeartbeat: new Date(),
          dataCount: prev.dataCount + 1
        }))

        // Trigger a refresh to get updated data
        fetchPriceData()
      }

      await pythIntegration.startPriceStreaming([symbol], onUpdate)

      console.log(`✅ Streaming initialized for ${symbol}`)

    } catch (error) {
      console.error(`❌ Failed to initialize streaming for ${symbol}:`, error)
      setStreamingStatus(prev => ({
        ...prev,
        isActive: false,
        connectionHealth: 'error'
      }))
    }
  }, [symbol, isStreamingEnabled, fetchPriceData])

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (streamingRef.current) {
      streamingRef.current = false
      setStreamingStatus(prev => ({
        ...prev,
        isActive: false,
        connectionHealth: 'disconnected'
      }))
      console.log(`⏹️ Streaming stopped for ${symbol}`)
    }
  }, [symbol])

  // Setup refresh interval
  useEffect(() => {
    if (!autoRefresh || isPaused) return

    // Initial fetch
    fetchPriceData()

    // Setup interval
    refreshIntervalRef.current = setInterval(fetchPriceData, refreshInterval)

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [fetchPriceData, autoRefresh, refreshInterval, isPaused])

  // Setup streaming
  useEffect(() => {
    if (isStreamingEnabled && !isPaused) {
      initializeStreaming()
    } else {
      stopStreaming()
    }

    return () => {
      stopStreaming()
    }
  }, [isStreamingEnabled, isPaused, initializeStreaming, stopStreaming])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

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

  const getPriceChange = () => {
    if (priceHistory.length < 2) return null

    const current = priceHistory[priceHistory.length - 1]
    const previous = priceHistory[priceHistory.length - 2]

    const change = current.price - previous.price
    const changePercent = (change / previous.price) * 100

    return { change, changePercent }
  }

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'healthy':
      case 'fresh':
      case 'connected': return 'text-green-600'
      case 'degraded':
      case 'acceptable':
      case 'stale': return 'text-yellow-600'
      case 'failed':
      case 'expired':
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected': return <CheckCircle className="w-4 h-4" />
      case 'degraded':
      case 'stale': return <AlertCircle className="w-4 h-4" />
      case 'failed':
      case 'error': return <WifiOff className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderPriceChart = () => {
    if (!showChart || priceHistory.length < 2) return null

    const chartData = priceHistory.map((point, index) => ({
      index,
      price: point.price,
      confidence: point.confidence * 100,
      time: point.timestamp.toLocaleTimeString()
    }))

    const currentPriceValue = currentPrice?.price || 0
    const priceChange = getPriceChange()

    return (
      <div className="h-32 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value: number, name: string) => [
                name === 'price' ? formatPrice(value) : `${value.toFixed(1)}%`,
                name === 'price' ? 'Price' : 'Confidence'
              ]}
            />
            <ReferenceLine
              y={currentPriceValue}
              stroke="#6b7280"
              strokeDasharray="2 2"
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={priceChange && priceChange.change >= 0 ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const renderControls = () => (
    <div className="flex items-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsPaused(!isPaused)}
      >
        {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
        {isPaused ? 'Resume' : 'Pause'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={fetchPriceData}
        disabled={isLoading}
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>

      {showStreaming && (
        <div className="flex items-center gap-2">
          <Switch
            checked={isStreamingEnabled}
            onCheckedChange={setIsStreamingEnabled}
            disabled={isPaused}
          />
          <span className="text-xs">Stream</span>
        </div>
      )}

      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${
          streamingStatus.connectionHealth === 'connected' ? 'bg-green-500' :
          streamingStatus.connectionHealth === 'error' ? 'bg-red-500' : 'bg-gray-400'
        }`} />
        <span className="text-xs text-gray-600">
          {streamingStatus.isActive ? 'Live' : 'Polling'}
        </span>
      </div>
    </div>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isLoading && !currentPrice) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading {symbol} price data...</p>
        </CardContent>
      </Card>
    )
  }

  const priceChange = getPriceChange()

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{symbol}</CardTitle>
          <div className="flex items-center gap-2">
            {/* Status indicators */}
            {qualityReport && (
              <div className={`flex items-center gap-1 ${getStatusColor(qualityReport.staleness.level)}`}>
                {getStatusIcon(qualityReport.staleness.level)}
                <span className="text-xs capitalize">{qualityReport.staleness.level}</span>
              </div>
            )}

            {streamingStatus.isActive && (
              <Badge variant="outline" className="text-xs">
                <Activity className="w-3 h-3 mr-1" />
                Streaming
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {error && (
          <Alert className="mb-4 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {currentPrice && (
          <div className="space-y-3">
            {/* Current Price */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatPrice(currentPrice.price)}</span>
                {priceChange && (
                  <div className={`flex items-center gap-1 text-sm ${
                    priceChange.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {priceChange.change >= 0 ?
                      <TrendingUp className="w-3 h-3" /> :
                      <TrendingDown className="w-3 h-3" />
                    }
                    <span>{priceChange.change >= 0 ? '+' : ''}{priceChange.changePercent.toFixed(2)}%</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                via {currentPrice.source} {currentPrice.aggregated && '(aggregated)'}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <p className="text-gray-500">Confidence</p>
                <p className={`font-medium ${
                  currentPrice.confidence >= 0.9 ? 'text-green-600' :
                  currentPrice.confidence >= 0.7 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(currentPrice.confidence * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Quality</p>
                <p className="font-medium">
                  {qualityReport?.overallScore || 0}/100
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Age</p>
                <p className="font-medium">{formatStaleness(currentPrice.staleness)}</p>
              </div>
            </div>

            {/* Price Chart */}
            {renderPriceChart()}

            {/* Advanced Information */}
            {showAdvanced && qualityReport && (
              <div className="space-y-2 pt-2 border-t">
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Recommendation:</span>
                    <Badge
                      variant={qualityReport.recommendation === 'use' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {qualityReport.recommendation.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Stability:</span>
                    <span className="capitalize">{qualityReport.consistency.stability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Source Success:</span>
                    <span>{qualityReport.reliability.successRate.toFixed(1)}%</span>
                  </div>
                </div>

                {qualityReport.warnings.length > 0 && (
                  <Alert className="border-yellow-200">
                    <AlertCircle className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      {qualityReport.warnings[0]}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Controls */}
            {renderControls()}

            {/* Streaming Stats */}
            {isStreamingEnabled && streamingStatus.isActive && (
              <div className="text-xs text-gray-500 pt-2 border-t">
                <div className="flex justify-between">
                  <span>Stream updates:</span>
                  <span>{streamingStatus.dataCount}</span>
                </div>
                {streamingStatus.lastHeartbeat && (
                  <div className="flex justify-between">
                    <span>Last heartbeat:</span>
                    <span>{streamingStatus.lastHeartbeat.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}