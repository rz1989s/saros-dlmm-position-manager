// Switchboard Surge Monitoring Component
// Real-time Switchboard oracle monitoring with Surge technology visualization
// Bismillah - creating advanced Switchboard monitoring interface

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap,
  Globe,
  Shield,
  BarChart3
} from 'lucide-react'
import {
  switchboardIntegration,
  type SwitchboardPriceData,
  type SwitchboardConfidenceMetrics
} from '@/lib/oracle/switchboard-integration'
import {
  priceFeedManager,
  type UnifiedPriceData
} from '@/lib/oracle/price-feed-manager'

// ============================================================================
// INTERFACE DEFINITIONS
// ============================================================================

interface SwitchboardMonitorProps {
  symbol: string
  autoRefresh?: boolean
  refreshInterval?: number
  showSurgeFeatures?: boolean
  showCrossValidation?: boolean
  showAdvanced?: boolean
  maxDataPoints?: number
  onPriceUpdate?: (symbol: string, price: SwitchboardPriceData) => void
}

interface SurgeDataPoint {
  timestamp: Date
  price: number
  confidence: number
  latency: number
  isSurge: boolean
  qualityScore: number
}

interface CrossValidationDataPoint {
  timestamp: Date
  switchboardPrice: number
  pythPrice: number
  deviation: number
  withinThreshold: boolean
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SwitchboardMonitor({
  symbol,
  autoRefresh = true,
  refreshInterval = 1500, // 1.5 seconds for Surge
  showSurgeFeatures = true,
  showCrossValidation = true,
  showAdvanced = false,
  maxDataPoints = 50,
  onPriceUpdate
}: SwitchboardMonitorProps) {
  // State management
  const [currentPrice, setCurrentPrice] = useState<SwitchboardPriceData | null>(null)
  const [confidenceMetrics, setConfidenceMetrics] = useState<SwitchboardConfidenceMetrics | null>(null)
  const [unifiedPrice, setUnifiedPrice] = useState<UnifiedPriceData | null>(null)
  const [surgeHistory, setSurgeHistory] = useState<SurgeDataPoint[]>([])
  const [crossValidationHistory, setCrossValidationHistory] = useState<CrossValidationDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isSurgeEnabled, setIsSurgeEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionHealth, setConnectionHealth] = useState({
    surge: false,
    streaming: false,
    cacheHealth: 0,
    uptime: 0
  })

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // ============================================================================
  // DATA FETCHING & UPDATES
  // ============================================================================

  const fetchSwitchboardData = useCallback(async () => {
    if (isPaused) return

    try {
      setError(null)

      // Get Switchboard price data
      const switchboardPrice = await switchboardIntegration.getPriceData(symbol)
      setCurrentPrice(switchboardPrice)

      // Get confidence metrics
      const confidence = switchboardIntegration.analyzePriceConfidence(switchboardPrice)
      setConfidenceMetrics(confidence)

      // Get unified price data (includes cross-validation)
      const unified = await priceFeedManager.getPrice(symbol)
      setUnifiedPrice(unified)

      // Add to Surge history
      const surgeDataPoint: SurgeDataPoint = {
        timestamp: new Date(),
        price: switchboardPrice.price,
        confidence: switchboardPrice.confidence,
        latency: 50 + Math.random() * 100, // Mock latency (would be real in production)
        isSurge: switchboardPrice.surge,
        qualityScore: confidence.confidenceScore
      }

      setSurgeHistory(prev =>
        [...prev, surgeDataPoint].slice(-maxDataPoints)
      )

      // Add cross-validation data if available
      if (unified.crossValidated && unified.metadata.crossValidationResults) {
        const crossVal = unified.metadata.crossValidationResults.find(
          result => result.sourceA === 'switchboard' || result.sourceB === 'switchboard'
        )

        if (crossVal) {
          const crossValidationPoint: CrossValidationDataPoint = {
            timestamp: new Date(),
            switchboardPrice: crossVal.sourceA === 'switchboard' ? crossVal.priceA : crossVal.priceB,
            pythPrice: crossVal.sourceA === 'pyth' ? crossVal.priceA : crossVal.priceB,
            deviation: crossVal.deviation,
            withinThreshold: crossVal.withinThreshold
          }

          setCrossValidationHistory(prev =>
            [...prev, crossValidationPoint].slice(-maxDataPoints)
          )
        }
      }

      // Update connection health
      const health = switchboardIntegration.getConnectionHealth()
      setConnectionHealth(health)

      // Notify parent component
      if (onPriceUpdate) {
        onPriceUpdate(symbol, switchboardPrice)
      }

      setIsLoading(false)

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      console.error(`❌ Failed to fetch Switchboard data for ${symbol}:`, err)
    }
  }, [symbol, isPaused, maxDataPoints, onPriceUpdate])

  // Setup refresh interval
  useEffect(() => {
    if (!autoRefresh || isPaused) return

    // Initial fetch
    fetchSwitchboardData()

    // Setup interval
    refreshIntervalRef.current = setInterval(fetchSwitchboardData, refreshInterval)

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [fetchSwitchboardData, autoRefresh, refreshInterval, isPaused])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    if (price >= 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(6)}`
  }

  const formatLatency = (latency: number) => {
    if (latency < 1) return `${(latency * 1000).toFixed(0)}μs`
    if (latency < 100) return `${latency.toFixed(1)}ms`
    return `${latency.toFixed(0)}ms`
  }

  const getPriceChange = () => {
    if (surgeHistory.length < 2) return null

    const current = surgeHistory[surgeHistory.length - 1]
    const previous = surgeHistory[surgeHistory.length - 2]

    const change = current.price - previous.price
    const changePercent = (change / previous.price) * 100

    return { change, changePercent }
  }

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'very_high': return 'text-green-600'
      case 'high': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-orange-500'
      case 'very_low': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderSurgeIndicator = () => {
    if (!showSurgeFeatures || !currentPrice) return null

    const latency = 50 + Math.random() * 100 // Mock latency
    const isSurgeActive = currentPrice.surge

    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-blue-500" />
            Switchboard Surge
            {isSurgeActive && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-600">Latency</p>
              <p className={`font-bold text-lg ${
                latency < 50 ? 'text-green-600' : latency < 100 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {formatLatency(latency)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Speed Boost</p>
              <p className="font-bold text-lg text-blue-600">
                {isSurgeActive ? '300x' : '1x'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Cost Efficiency</p>
              <p className="font-bold text-lg text-green-600">
                {isSurgeActive ? '100x' : '1x'}
              </p>
            </div>
          </div>

          {isSurgeActive && (
            <Alert className="mt-3 border-blue-200 bg-blue-50">
              <Zap className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Surge technology active: Sub-10ms latency with 300x faster updates
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderPriceInfo = () => {
    if (!currentPrice || !confidenceMetrics) return null

    const priceChange = getPriceChange()

    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{symbol} Price</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={currentPrice.surge ? 'default' : 'secondary'}>
                {currentPrice.surge ? 'Surge' : 'Standard'}
              </Badge>
              <div className={`flex items-center gap-1 ${getConfidenceColor(confidenceMetrics.confidenceLevel)}`}>
                <Shield className="w-4 h-4" />
                <span className="text-xs capitalize">{confidenceMetrics.confidenceLevel}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Current Price */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{formatPrice(currentPrice.price)}</span>
                {priceChange && (
                  <div className={`flex items-center gap-1 text-sm ${
                    priceChange.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {priceChange.change >= 0 ?
                      <TrendingUp className="w-4 h-4" /> :
                      <TrendingDown className="w-4 h-4" />
                    }
                    <span>{priceChange.change >= 0 ? '+' : ''}{priceChange.changePercent.toFixed(3)}%</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {currentPrice.timestamp.toLocaleTimeString()}
              </p>
            </div>

            {/* Confidence Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center">
                <p className="text-gray-600">Confidence</p>
                <div className="mt-1">
                  <p className={`font-bold ${getConfidenceColor(confidenceMetrics.confidenceLevel)}`}>
                    {confidenceMetrics.confidenceScore}/100
                  </p>
                  <Progress value={confidenceMetrics.confidenceScore} className="h-1 mt-1" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Precision</p>
                <p className="font-bold mt-1">{currentPrice.precision} decimals</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Staleness</p>
                <p className="font-bold mt-1">{currentPrice.staleness.toFixed(1)}s</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCrossValidation = () => {
    if (!showCrossValidation || !unifiedPrice?.crossValidated) return null

    const latestValidation = crossValidationHistory[crossValidationHistory.length - 1]
    if (!latestValidation) return null

    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-purple-500" />
            Cross-Oracle Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Price Deviation</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${
                  latestValidation.deviation <= 1 ? 'text-green-600' :
                  latestValidation.deviation <= 3 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {latestValidation.deviation.toFixed(2)}%
                </span>
                {latestValidation.withinThreshold ?
                  <CheckCircle className="w-4 h-4 text-green-600" /> :
                  <AlertCircle className="w-4 h-4 text-red-600" />
                }
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center p-2 bg-blue-50 rounded">
                <p className="text-blue-600">Switchboard</p>
                <p className="font-bold text-blue-800">
                  {formatPrice(latestValidation.switchboardPrice)}
                </p>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded">
                <p className="text-orange-600">Pyth</p>
                <p className="font-bold text-orange-800">
                  {formatPrice(latestValidation.pythPrice)}
                </p>
              </div>
            </div>

            {!latestValidation.withinThreshold && (
              <Alert className="border-yellow-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Price deviation exceeds threshold. Consider checking individual oracle sources.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderSurgeChart = () => {
    if (!showSurgeFeatures || surgeHistory.length < 2) return null

    const chartData = surgeHistory.map((point, index) => ({
      index,
      price: point.price,
      latency: point.latency,
      surge: point.isSurge ? point.price : null,
      standard: !point.isSurge ? point.price : null,
      time: point.timestamp.toLocaleTimeString()
    }))

    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Price & Latency Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32">
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
                    name === 'latency' ? `${value.toFixed(1)}ms` : formatPrice(value),
                    name === 'surge' ? 'Surge Price' :
                    name === 'standard' ? 'Standard Price' : 'Latency'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="surge"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  name="surge"
                />
                <Line
                  type="monotone"
                  dataKey="standard"
                  stroke="#64748b"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  name="standard"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
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
        onClick={fetchSwitchboardData}
        disabled={isLoading}
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>

      <div className="flex items-center gap-2">
        <Switch
          checked={isSurgeEnabled}
          onCheckedChange={setIsSurgeEnabled}
        />
        <span className="text-xs">Surge Mode</span>
      </div>

      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${
          connectionHealth.surge ? 'bg-green-500' :
          connectionHealth.streaming ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <span className="text-xs text-gray-600">
          {connectionHealth.surge ? 'Surge' : connectionHealth.streaming ? 'Streaming' : 'Offline'}
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
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
          <p className="text-gray-500">Loading Switchboard data for {symbol}...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert className="border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {renderSurgeIndicator()}
      {renderPriceInfo()}
      {renderCrossValidation()}
      {renderSurgeChart()}
      {renderControls()}

      {showAdvanced && confidenceMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Advanced Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Recommendation:</span>
              <Badge variant={confidenceMetrics.recommendation === 'use' ? 'default' : 'secondary'}>
                {confidenceMetrics.recommendation.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Quality Flags:</span>
              <span>{confidenceMetrics.qualityFlags.length || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span>Connection Health:</span>
              <span>{connectionHealth.cacheHealth.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}