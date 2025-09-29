'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TokenImage } from '@/components/ui/token-image'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { AnimatedNumber } from '@/components/animations/animated-number'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Target,
  RefreshCw,
  Info,
  XCircle
} from 'lucide-react'
import { logSDKCall, updateSDKCall } from '@/components/sdk/sdk-call-logger'

interface PriceSource {
  id: string
  name: string
  price: number
  confidence: number
  latency: number
  isActive: boolean
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  weight: number
}

interface ConfidenceMetrics {
  overallScore: number
  reliability: number
  consensus: number
  volatility: number
  latency: number
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  recommendation: 'safe' | 'caution' | 'risk' | 'avoid'
}

interface Asset {
  symbol: string
  logoURI: string
  description: string
  baseVolatility: number
}

const DEMO_ASSETS: Asset[] = [
  {
    symbol: 'SOL/USD',
    logoURI: '/tokens/sol.png',
    description: 'Solana price with multi-oracle confidence',
    baseVolatility: 0.03
  },
  {
    symbol: 'BTC/USD',
    logoURI: '/tokens/btc.png',
    description: 'Bitcoin price with high confidence',
    baseVolatility: 0.02
  },
  {
    symbol: 'ETH/USD',
    logoURI: '/tokens/eth.png',
    description: 'Ethereum price with good liquidity',
    baseVolatility: 0.025
  },
  {
    symbol: 'USDC/USD',
    logoURI: '/tokens/usdc.png',
    description: 'Stablecoin with excellent confidence',
    baseVolatility: 0.001
  }
]

export default function PriceConfidenceDemo() {
  const [selectedAsset, setSelectedAsset] = useState(DEMO_ASSETS[0])
  const [priceSources, setPriceSources] = useState<PriceSource[]>([])
  const [confidenceMetrics, setConfidenceMetrics] = useState<ConfidenceMetrics | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Generate realistic price sources
  const generatePriceSources = useCallback((asset: Asset): PriceSource[] => {
    const basePrice = asset.symbol === 'SOL/USD' ? 102.45 :
                     asset.symbol === 'BTC/USD' ? 43250.00 :
                     asset.symbol === 'ETH/USD' ? 2650.00 : 1.00

    const sources = [
      {
        id: 'pyth',
        name: 'Pyth Network',
        weight: 0.3,
        baseLatency: 1000,
        reliability: 0.98
      },
      {
        id: 'switchboard',
        name: 'Switchboard',
        weight: 0.25,
        baseLatency: 1200,
        reliability: 0.96
      },
      {
        id: 'chainlink',
        name: 'Chainlink',
        weight: 0.2,
        baseLatency: 2000,
        reliability: 0.99
      },
      {
        id: 'orca',
        name: 'Orca TWAP',
        weight: 0.15,
        baseLatency: 500,
        reliability: 0.94
      },
      {
        id: 'jupiter',
        name: 'Jupiter Price API',
        weight: 0.1,
        baseLatency: 800,
        reliability: 0.92
      }
    ]

    return sources.map(source => {
      const priceVariation = (Math.random() - 0.5) * asset.baseVolatility * 0.5
      const price = basePrice * (1 + priceVariation)

      const confidenceVariation = Math.random() * 0.3
      const confidence = 1 - (confidenceVariation * (1 - source.reliability))

      const latencyVariation = Math.random() * 0.5 + 0.5
      const latency = source.baseLatency * latencyVariation

      const isActive = Math.random() > 0.05 // 95% uptime

      const quality = confidence > 0.95 ? 'excellent' :
                     confidence > 0.9 ? 'good' :
                     confidence > 0.8 ? 'fair' : 'poor'

      return {
        id: source.id,
        name: source.name,
        price,
        confidence,
        latency,
        isActive,
        quality,
        weight: source.weight
      }
    })
  }, [])

  // Calculate confidence metrics
  const calculateConfidenceMetrics = useCallback((sources: PriceSource[]): ConfidenceMetrics => {
    const activeSources = sources.filter(s => s.isActive)

    if (activeSources.length === 0) {
      return {
        overallScore: 0,
        reliability: 0,
        consensus: 0,
        volatility: 1,
        latency: 0,
        grade: 'F',
        recommendation: 'avoid'
      }
    }

    // Calculate weighted average price
    const totalWeight = activeSources.reduce((sum, s) => sum + s.weight, 0)
    const weightedPrice = activeSources.reduce((sum, s) => sum + (s.price * s.weight), 0) / totalWeight

    // Calculate consensus (how close prices are)
    const priceDeviations = activeSources.map(s => Math.abs(s.price - weightedPrice) / weightedPrice)
    const maxDeviation = Math.max(...priceDeviations)
    const consensus = Math.max(0, 1 - maxDeviation * 10)

    // Calculate overall reliability
    const reliability = activeSources.reduce((sum, s) => sum + (s.confidence * s.weight), 0) / totalWeight

    // Calculate volatility (lower is better)
    const volatility = Math.min(1, maxDeviation * 5)

    // Calculate latency score (lower latency is better)
    const avgLatency = activeSources.reduce((sum, s) => sum + s.latency, 0) / activeSources.length
    const latencyScore = Math.max(0, 1 - avgLatency / 5000)

    // Calculate overall score
    const overallScore = (
      reliability * 0.4 +
      consensus * 0.3 +
      (1 - volatility) * 0.2 +
      latencyScore * 0.1
    )

    // Determine grade and recommendation
    const grade = overallScore >= 0.95 ? 'A+' :
                 overallScore >= 0.9 ? 'A' :
                 overallScore >= 0.8 ? 'B' :
                 overallScore >= 0.7 ? 'C' :
                 overallScore >= 0.6 ? 'D' : 'F'

    const recommendation = overallScore >= 0.9 ? 'safe' :
                          overallScore >= 0.8 ? 'caution' :
                          overallScore >= 0.6 ? 'risk' : 'avoid'

    return {
      overallScore,
      reliability,
      consensus,
      volatility,
      latency: avgLatency,
      grade,
      recommendation
    }
  }, [])

  // Analyze price confidence
  const analyzeConfidence = useCallback(async (asset: Asset) => {
    const callId = logSDKCall({
      method: 'analyzePriceConfidence',
      endpoint: 'Oracle.analyzeConfidence',
      status: 'pending',
      params: { symbol: asset.symbol }
    })

    setIsAnalyzing(true)

    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

      const sources = generatePriceSources(asset)
      const metrics = calculateConfidenceMetrics(sources)

      updateSDKCall(callId.id, {
        status: 'success',
        duration: 1500 + Math.random() * 1000,
        response: { sources: sources.length, overallScore: metrics.overallScore }
      })

      setPriceSources(sources)
      setConfidenceMetrics(metrics)
      setLastUpdate(new Date())

    } catch (error) {
      updateSDKCall(callId.id, {
        status: 'error',
        duration: 1500,
        error: error instanceof Error ? error.message : 'Confidence analysis failed'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [generatePriceSources, calculateConfidenceMetrics])

  // Auto-refresh analysis
  useEffect(() => {
    analyzeConfidence(selectedAsset)

    const interval = setInterval(() => {
      analyzeConfidence(selectedAsset)
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [selectedAsset, analyzeConfidence])

  const handleAssetChange = useCallback((asset: Asset) => {
    setSelectedAsset(asset)
    setPriceSources([])
    setConfidenceMetrics(null)
  }, [])

  const handleRefresh = useCallback(() => {
    analyzeConfidence(selectedAsset)
  }, [selectedAsset, analyzeConfidence])

  const getRecommendationColor = useCallback((recommendation: string) => {
    switch (recommendation) {
      case 'safe': return 'text-green-600'
      case 'caution': return 'text-yellow-600'
      case 'risk': return 'text-orange-600'
      case 'avoid': return 'text-red-600'
      default: return 'text-muted-foreground'
    }
  }, [])

  const getGradeColor = useCallback((grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600'
    if (grade === 'B') return 'text-blue-600'
    if (grade === 'C') return 'text-yellow-600'
    if (grade === 'D') return 'text-orange-600'
    return 'text-red-600'
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[34] || { id: 34, name: 'Price Confidence System', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Price Confidence System</h1>
              <p className="text-muted-foreground">
                Oracle price confidence scoring and reliability assessment for trading decisions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
              SDK Feature #34
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Multi-Oracle Analysis
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              Confidence Scoring
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Asset Selection & Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-600" />
                Select Asset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {DEMO_ASSETS.map((asset) => (
                <div
                  key={asset.symbol}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedAsset.symbol === asset.symbol
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
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
                      <div className="text-xs text-muted-foreground">
                        {asset.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Analysis Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Analysis Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleRefresh}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Analysis
              </Button>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Update</span>
                  <span className="font-medium">
                    {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Update Frequency</span>
                  <span className="font-medium">10s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sources</span>
                  <span className="font-medium">{priceSources.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Confidence Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {confidenceMetrics ? (
            <>
              {/* Overall Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    Confidence Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className={`text-6xl font-bold ${getGradeColor(confidenceMetrics.grade)}`}>
                      {confidenceMetrics.grade}
                    </div>
                    <div className="text-2xl font-semibold">
                      <AnimatedNumber
                        value={confidenceMetrics.overallScore * 100}
                        suffix="%"
                        decimals={1}
                        animateOnChange={true}
                        className="text-2xl font-semibold"
                      />
                    </div>
                    <div className={`text-lg font-medium capitalize ${getRecommendationColor(confidenceMetrics.recommendation)}`}>
                      {confidenceMetrics.recommendation === 'safe' && (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Safe to Trade
                        </div>
                      )}
                      {confidenceMetrics.recommendation === 'caution' && (
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="h-5 w-5" />
                          Exercise Caution
                        </div>
                      )}
                      {confidenceMetrics.recommendation === 'risk' && (
                        <div className="flex items-center justify-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          High Risk
                        </div>
                      )}
                      {confidenceMetrics.recommendation === 'avoid' && (
                        <div className="flex items-center justify-center gap-2">
                          <XCircle className="h-5 w-5" />
                          Avoid Trading
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metrics Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        <AnimatedNumber
                          value={confidenceMetrics.reliability * 100}
                          suffix="%"
                          decimals={1}
                          animateOnChange={true}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Reliability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        <AnimatedNumber
                          value={confidenceMetrics.consensus * 100}
                          suffix="%"
                          decimals={1}
                          animateOnChange={true}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Consensus</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">
                        <AnimatedNumber
                          value={confidenceMetrics.volatility * 100}
                          suffix="%"
                          decimals={1}
                          animateOnChange={true}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Volatility</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        <AnimatedNumber
                          value={confidenceMetrics.latency}
                          suffix="ms"
                          decimals={0}
                          animateOnChange={true}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Latency</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Oracle Sources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {priceSources.map((source) => (
                    <div
                      key={source.id}
                      className={`p-3 border rounded-lg ${
                        source.isActive ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{source.name}</span>
                          <Badge
                            variant="outline"
                            className={source.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
                          >
                            {source.isActive ? 'Active' : 'Offline'}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              source.quality === 'excellent' ? 'bg-green-50 text-green-700' :
                              source.quality === 'good' ? 'bg-blue-50 text-blue-700' :
                              source.quality === 'fair' ? 'bg-yellow-50 text-yellow-700' :
                              'bg-red-50 text-red-700'
                            }
                          >
                            {source.quality}
                          </Badge>
                        </div>
                        <span className="text-sm font-semibold">
                          Weight: {(source.weight * 100).toFixed(0)}%
                        </span>
                      </div>

                      {source.isActive && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Price:</span>
                            <span className="ml-2 font-medium">${source.price.toFixed(4)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Confidence:</span>
                            <span className="ml-2 font-medium">{(source.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Latency:</span>
                            <span className="ml-2 font-medium">{source.latency.toFixed(0)}ms</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Trading Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {confidenceMetrics.recommendation === 'safe' && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-green-800">Safe Trading Conditions</p>
                            <p className="text-green-700">
                              High confidence with good consensus across oracles. Suitable for all trading strategies including large positions.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {confidenceMetrics.recommendation === 'caution' && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-yellow-800">Exercise Caution</p>
                            <p className="text-yellow-700">
                              Moderate confidence levels. Consider using smaller position sizes and additional confirmations.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {confidenceMetrics.recommendation === 'risk' && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-orange-800">High Risk Conditions</p>
                            <p className="text-orange-700">
                              Low confidence or poor consensus. Use minimal position sizes and wait for better conditions.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {confidenceMetrics.recommendation === 'avoid' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-red-800">Avoid Trading</p>
                            <p className="text-red-700">
                              Very low confidence or oracle failures detected. Do not trade until conditions improve.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Recommendations are based on real-time analysis of oracle reliability, price consensus,
                      and data quality metrics. Always combine with your own analysis.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-muted-foreground">
                    {isAnalyzing ? 'Analyzing price confidence...' : 'Loading confidence analysis...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}