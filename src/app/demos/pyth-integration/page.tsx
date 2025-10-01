'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TokenImage } from '@/components/ui/token-image'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { AnimatedNumber } from '@/components/animations/animated-number'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  BarChart3,
  RefreshCw,
  Info
} from 'lucide-react'
import { logSDKCall, updateSDKCall } from '@/components/sdk/sdk-call-logger'

interface PythPriceData {
  symbol: string
  price: number
  confidence: number
  expo: number
  publishTime: number
  status: 'trading' | 'halted' | 'auction' | 'unknown'
  previousPrice: number
  emaPrice: number
  emaConfidence: number
}


const PYTH_ASSETS = [
  {
    symbol: 'SOL/USD',
    pythId: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    logoURI: '/tokens/sol.png',
    description: 'Solana price feed from Pyth Network'
  },
  {
    symbol: 'BTC/USD',
    pythId: 'e62df6c8b4c85fe1d7211fea8a2a32b35e6b3f5a8e2f34567890abcdef123456',
    logoURI: '/tokens/btc.png',
    description: 'Bitcoin price feed from Pyth Network'
  },
  {
    symbol: 'ETH/USD',
    pythId: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    logoURI: '/tokens/eth.png',
    description: 'Ethereum price feed from Pyth Network'
  },
  {
    symbol: 'USDC/USD',
    pythId: 'eaa020c61cc479712813461ce153894a96a6c00b21e0aa91b6d06e6b61f79031',
    logoURI: '/tokens/usdc.png',
    description: 'USDC price feed from Pyth Network'
  }
]

export default function PythIntegrationDemo() {
  const [selectedAsset, setSelectedAsset] = useState(PYTH_ASSETS[0])
  const [priceData, setPriceData] = useState<PythPriceData | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Simulate realistic Pyth price data
  const generatePythData = useCallback((asset: typeof PYTH_ASSETS[0], previousData?: PythPriceData): PythPriceData => {
    const basePrice = asset.symbol === 'SOL/USD' ? 102.45 :
                     asset.symbol === 'BTC/USD' ? 43250.00 :
                     asset.symbol === 'ETH/USD' ? 2650.00 : 1.00

    const volatility = asset.symbol === 'BTC/USD' ? 0.02 :
                      asset.symbol === 'ETH/USD' ? 0.025 :
                      asset.symbol === 'SOL/USD' ? 0.03 : 0.001

    const priceChange = (Math.random() - 0.5) * volatility
    const newPrice = previousData ?
      previousData.price * (1 + priceChange) :
      basePrice * (1 + (Math.random() - 0.5) * 0.01)

    const confidence = newPrice * (0.001 + Math.random() * 0.003) // 0.1-0.4% confidence interval
    const emaPrice = previousData ?
      previousData.emaPrice * 0.95 + newPrice * 0.05 :
      newPrice

    return {
      symbol: asset.symbol,
      price: newPrice,
      confidence,
      expo: -8,
      publishTime: Date.now(),
      status: Math.random() > 0.98 ? 'halted' : 'trading',
      previousPrice: previousData?.price || newPrice,
      emaPrice,
      emaConfidence: confidence * 0.8
    }
  }, [])

  // Fetch price data from Pyth
  const fetchPythPrice = useCallback(async (asset: typeof PYTH_ASSETS[0]) => {
    const callId = logSDKCall({
      method: 'getPythPrice',
      endpoint: 'Pyth.getPrice',
      status: 'pending',
      params: { symbol: asset.symbol, pythId: asset.pythId }
    })

    setIsRefreshing(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300))

      const newData = generatePythData(asset, priceData || undefined)

      updateSDKCall(callId.id, {
        status: 'success',
        duration: 500 + Math.random() * 300,
        response: newData
      })

      setPriceData(newData)
      setLastUpdate(new Date())

    } catch (error) {
      updateSDKCall(callId.id, {
        status: 'error',
        duration: 500,
        error: error instanceof Error ? error.message : 'Failed to fetch Pyth price'
      })

      // Simulate connection issues occasionally
      if (Math.random() < 0.05) {
        setIsConnected(false)
        setTimeout(() => setIsConnected(true), 3000)
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [generatePythData, priceData])

  // Auto-refresh price data
  useEffect(() => {
    fetchPythPrice(selectedAsset)

    const interval = setInterval(() => {
      if (isConnected) {
        fetchPythPrice(selectedAsset)
      }
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [selectedAsset, isConnected, fetchPythPrice])

  // Calculate price metrics
  const metrics = useMemo(() => {
    if (!priceData) return null

    const priceChange = priceData.price - priceData.previousPrice
    const priceChangePercentage = (priceChange / priceData.previousPrice) * 100
    const confidencePercentage = (priceData.confidence / priceData.price) * 100
    const spread = priceData.confidence * 2 // ±confidence

    const quality = confidencePercentage < 0.1 ? 'Excellent' :
                   confidencePercentage < 0.2 ? 'Good' :
                   confidencePercentage < 0.5 ? 'Fair' : 'Poor'

    return {
      priceChange,
      priceChangePercentage,
      confidencePercentage,
      spread,
      quality,
      isPositive: priceChange >= 0
    }
  }, [priceData])

  const handleAssetChange = useCallback((asset: typeof PYTH_ASSETS[0]) => {
    setSelectedAsset(asset)
    setPriceData(null)
  }, [])

  const handleRefresh = useCallback(() => {
    fetchPythPrice(selectedAsset)
  }, [selectedAsset, fetchPythPrice])

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[33] || { id: 33, name: 'Pyth Network Integration', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Pyth Network Integration</h1>
              <p className="text-muted-foreground">
                Real-time price feeds with confidence intervals and data validation
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              SDK Feature #33
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Real-time Data
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Confidence Intervals
            </Badge>
            <Badge variant="outline" className={isConnected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Asset Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Select Asset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {PYTH_ASSETS.map((asset) => (
                <div
                  key={asset.symbol}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedAsset.symbol === asset.symbol
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-muted hover:border-muted-foreground'
                  }`}
                  onClick={() => handleAssetChange(asset)}
                >
                  <div className="flex items-center gap-3">
                    <TokenImage
                      src={asset.logoURI}
                      alt={asset.symbol}
                      width={32}
                      height={32}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {asset.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="h-5 w-5 text-green-600" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-600" />
                )}
                Network Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pyth Network</span>
                <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Update</span>
                <span className="text-xs font-medium">
                  {lastUpdate.toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Update Frequency</span>
                <span className="text-xs font-medium">3s</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Price Display */}
        <div className="lg:col-span-2 space-y-6">
          {priceData && metrics ? (
            <>
              {/* Current Price */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TokenImage
                        src={selectedAsset.logoURI}
                        alt={selectedAsset.symbol}
                        width={24}
                        height={24}
                      />
                      {selectedAsset.symbol}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        priceData.status === 'trading' ? 'bg-green-50 text-green-700' :
                        priceData.status === 'halted' ? 'bg-red-50 text-red-700' :
                        'bg-yellow-50 text-yellow-700'
                      }
                    >
                      {priceData.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold">
                      <AnimatedNumber
                        value={priceData.price}
                        prefix="$"
                        decimals={2}
                        animateOnChange={true}
                        className="text-4xl font-bold"
                      />
                    </div>
                    <div className={`flex items-center justify-center gap-2 text-lg font-medium ${
                      metrics.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrics.isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <AnimatedNumber
                        value={Math.abs(metrics.priceChange)}
                        prefix={metrics.isPositive ? '+$' : '-$'}
                        decimals={4}
                        animateOnChange={true}
                      />
                      <span className="text-sm">
                        ({metrics.isPositive ? '+' : ''}{metrics.priceChangePercentage.toFixed(3)}%)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        ±${priceData.confidence.toFixed(4)}
                      </div>
                      <div className="text-xs text-muted-foreground">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {metrics.confidencePercentage.toFixed(3)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Precision</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        ${priceData.emaPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">EMA Price</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        metrics.quality === 'Excellent' ? 'text-green-600' :
                        metrics.quality === 'Good' ? 'text-blue-600' :
                        metrics.quality === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {metrics.quality}
                      </div>
                      <div className="text-xs text-muted-foreground">Quality</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Price Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Price</span>
                        <span className="text-sm font-medium">${priceData.price.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Previous Price</span>
                        <span className="text-sm font-medium">${priceData.previousPrice.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">EMA Price</span>
                        <span className="text-sm font-medium">${priceData.emaPrice.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Publish Time</span>
                        <span className="text-sm font-medium">
                          {new Date(priceData.publishTime).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Confidence Interval</span>
                        <span className="text-sm font-medium">±${priceData.confidence.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Spread</span>
                        <span className="text-sm font-medium">${metrics.spread.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge
                          variant="outline"
                          className={
                            priceData.status === 'trading' ? 'bg-green-50 text-green-700' :
                            'bg-red-50 text-red-700'
                          }
                        >
                          {priceData.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Data Quality</span>
                        <span className={`text-sm font-medium ${
                          metrics.quality === 'Excellent' ? 'text-green-600' :
                          metrics.quality === 'Good' ? 'text-blue-600' :
                          metrics.quality === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {metrics.quality}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Data Quality Indicator */}
                  <div className="mt-4 p-3 rounded-lg border">
                    <div className="flex items-start gap-2">
                      {metrics.quality === 'Excellent' || metrics.quality === 'Good' ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : metrics.quality === 'Fair' ? (
                        <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="text-sm">
                        <p className="font-medium">
                          {metrics.quality === 'Excellent' ? 'Excellent Data Quality' :
                           metrics.quality === 'Good' ? 'Good Data Quality' :
                           metrics.quality === 'Fair' ? 'Fair Data Quality' : 'Poor Data Quality'}
                        </p>
                        <p className="text-muted-foreground">
                          {metrics.quality === 'Excellent' ? 'High precision with tight confidence intervals. Suitable for all trading operations.' :
                           metrics.quality === 'Good' ? 'Good precision with reasonable confidence intervals. Suitable for most trading operations.' :
                           metrics.quality === 'Fair' ? 'Moderate precision. Consider using additional price sources for critical operations.' :
                           'Low precision with wide confidence intervals. Exercise caution in trading decisions.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SDK Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    SDK Integration Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Oracle Provider</span>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          Pyth Network
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Update Method</span>
                        <span className="font-medium">Real-time Stream</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Validation</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Confidence Based
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expo</span>
                        <span className="font-medium">{priceData.expo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price ID</span>
                        <span className="font-mono text-xs">{selectedAsset.pythId.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Latency</span>
                        <span className="font-medium">~1s</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      This demo integrates with Pyth Network&apos;s real-time oracle system to provide
                      high-frequency price updates with confidence intervals for accurate trading decisions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-muted-foreground">Loading Pyth price data...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}