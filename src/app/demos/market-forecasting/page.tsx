'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { StaggerList } from '@/components/animations/stagger-list'
import {
  TrendingUp,
  Brain,
  LineChart,
  Activity,
  Zap,
  RefreshCw,
  Target
} from 'lucide-react'

interface PriceForecast {
  timeframe: string
  predicted: number
  low: number
  high: number
  confidence: number
  factors: string[]
}

interface ModelPrediction {
  model: string
  prediction: number
  weight: number
  confidence: number
  accuracy: number
}

interface VolatilityForecast {
  current: number
  oneDay: number
  oneWeek: number
  oneMonth: number
  regime: 'low' | 'normal' | 'high' | 'extreme'
}

const MOCK_FORECASTS: PriceForecast[] = [
  {
    timeframe: '1 Hour',
    predicted: 156.82,
    low: 155.20,
    high: 158.40,
    confidence: 87,
    factors: ['short_term_momentum', 'recent_volatility']
  },
  {
    timeframe: '4 Hours',
    predicted: 157.45,
    low: 153.80,
    high: 161.20,
    confidence: 81,
    factors: ['technical_indicators', 'volume_analysis']
  },
  {
    timeframe: '1 Day',
    predicted: 159.20,
    low: 151.30,
    high: 167.10,
    confidence: 73,
    factors: ['moving_average', 'trend_component']
  },
  {
    timeframe: '3 Days',
    predicted: 162.80,
    low: 148.50,
    high: 177.20,
    confidence: 65,
    factors: ['exponential_smoothing', 'seasonality']
  },
  {
    timeframe: '1 Week',
    predicted: 168.50,
    low: 143.20,
    high: 193.80,
    confidence: 58,
    factors: ['linear_trend', 'market_conditions']
  },
  {
    timeframe: '1 Month',
    predicted: 182.40,
    low: 135.60,
    high: 229.20,
    confidence: 42,
    factors: ['fundamental_analysis', 'macro_factors']
  }
]

const MOCK_MODELS: ModelPrediction[] = [
  {
    model: 'Linear Regression',
    prediction: 159.85,
    weight: 0.25,
    confidence: 82,
    accuracy: 78.5
  },
  {
    model: 'Moving Average',
    prediction: 157.32,
    weight: 0.15,
    confidence: 88,
    accuracy: 72.3
  },
  {
    model: 'Exponential Smoothing',
    prediction: 161.20,
    weight: 0.20,
    confidence: 85,
    accuracy: 81.2
  },
  {
    model: 'Volatility Adjusted',
    prediction: 158.75,
    weight: 0.20,
    confidence: 79,
    accuracy: 75.8
  },
  {
    model: 'Momentum Based',
    prediction: 162.45,
    weight: 0.20,
    confidence: 76,
    accuracy: 69.4
  }
]

const MOCK_VOLATILITY: VolatilityForecast = {
  current: 0.32,
  oneDay: 0.35,
  oneWeek: 0.41,
  oneMonth: 0.48,
  regime: 'normal'
}

const SUPPORT_RESISTANCE = [
  { level: 145.20, type: 'support', strength: 85, touches: 7 },
  { level: 152.80, type: 'support', strength: 72, touches: 5 },
  { level: 165.50, type: 'resistance', strength: 88, touches: 9 },
  { level: 178.90, type: 'resistance', strength: 76, touches: 6 }
]

export default function MarketForecastingDemo() {
  const [loading, setLoading] = useState(false)
  const [currentPrice] = useState(155.60)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1 Day')
  const [ensemble, setEnsemble] = useState(true)

  const handleGenerateForecast = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
  }

  const selectedForecast = MOCK_FORECASTS.find(f => f.timeframe === selectedTimeframe) || MOCK_FORECASTS[2]
  const priceChange = ((selectedForecast.predicted - currentPrice) / currentPrice) * 100

  return (
    <FeatureIdentifier feature={SDK_FEATURES[30]}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-purple-500" />
              <h1 className="text-3xl font-bold">Market Forecasting System</h1>
              <Badge variant="outline" className="ml-2">
                Feature #30
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Ensemble forecasting with 5 models for accurate price predictions
            </p>
          </div>

          {/* Current Price Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Current Market Data
                </CardTitle>
                <Button onClick={handleGenerateForecast} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate Forecast
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <p className="text-2xl font-bold text-green-500">+3.2%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="text-2xl font-bold">$8.4M</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Volatility</p>
                  <p className="text-2xl font-bold">{(MOCK_VOLATILITY.current * 100).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="forecasts" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="forecasts">Price Forecasts</TabsTrigger>
              <TabsTrigger value="models">Model Ensemble</TabsTrigger>
              <TabsTrigger value="volatility">Volatility</TabsTrigger>
              <TabsTrigger value="levels">Support/Resistance</TabsTrigger>
            </TabsList>

            {/* Price Forecasts Tab */}
            <TabsContent value="forecasts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Multi-Timeframe Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                    {MOCK_FORECASTS.map((forecast) => (
                      <Button
                        key={forecast.timeframe}
                        variant={selectedTimeframe === forecast.timeframe ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTimeframe(forecast.timeframe)}
                        className="w-full"
                      >
                        {forecast.timeframe}
                      </Button>
                    ))}
                  </div>

                  <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Predicted Price</p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-4xl font-bold">${selectedForecast.predicted.toFixed(2)}</p>
                              <Badge variant={priceChange >= 0 ? 'default' : 'destructive'}>
                                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Lower Bound</p>
                              <p className="text-xl font-semibold text-red-500">${selectedForecast.low.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Upper Bound</p>
                              <p className="text-xl font-semibold text-green-500">${selectedForecast.high.toFixed(2)}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Confidence Level</p>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${selectedForecast.confidence}%` }}
                                  transition={{ duration: 0.5 }}
                                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                />
                              </div>
                              <span className="text-lg font-semibold w-12">{selectedForecast.confidence}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm font-semibold">Key Factors</p>
                          <StaggerList className="space-y-2">
                            {selectedForecast.factors.map((factor, i) => (
                              <motion.div
                                key={factor}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-2 p-2 bg-muted rounded"
                              >
                                <Badge variant="secondary" className="text-xs">
                                  {factor.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </Badge>
                              </motion.div>
                            ))}
                          </StaggerList>

                          <div className="pt-2">
                            <p className="text-xs text-muted-foreground">
                              Range: ${selectedForecast.low.toFixed(2)} - ${selectedForecast.high.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Spread: {(((selectedForecast.high - selectedForecast.low) / selectedForecast.predicted) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Model Ensemble Tab */}
            <TabsContent value="models" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Ensemble Model Analysis
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Ensemble Mode</span>
                      <Button
                        variant={ensemble ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setEnsemble(!ensemble)}
                      >
                        {ensemble ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {MOCK_MODELS.map((model, i) => (
                      <motion.div
                        key={model.model}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-muted rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{model.model}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Weight: {(model.weight * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">${model.prediction.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                              {((model.prediction - currentPrice) / currentPrice * 100 >= 0 ? '+' : '')}
                              {((model.prediction - currentPrice) / currentPrice * 100).toFixed(2)}%
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-blue-500"
                                  style={{ width: `${model.confidence}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold">{model.confidence}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Historical Accuracy</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-green-500"
                                  style={{ width: `${model.accuracy}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold">{model.accuracy}%</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {ensemble && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border-2 border-purple-500/20">
                      <p className="text-sm font-semibold mb-2">Ensemble Prediction</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold">
                          ${MOCK_MODELS.reduce((sum, m) => sum + m.prediction * m.weight, 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          (Weighted average of {MOCK_MODELS.length} models)
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Volatility Tab */}
            <TabsContent value="volatility" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Volatility Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {[
                        { label: 'Current', value: MOCK_VOLATILITY.current },
                        { label: '1 Day', value: MOCK_VOLATILITY.oneDay },
                        { label: '1 Week', value: MOCK_VOLATILITY.oneWeek },
                        { label: '1 Month', value: MOCK_VOLATILITY.oneMonth }
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <span className="font-medium">{item.label}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-background rounded-full h-3 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-red-500"
                                style={{ width: `${Math.min(item.value * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-lg font-bold w-16 text-right">
                              {(item.value * 100).toFixed(1)}%
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                        <CardContent className="pt-6">
                          <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">Volatility Regime</p>
                            <Badge
                              variant={MOCK_VOLATILITY.regime === 'high' ? 'destructive' : 'secondary'}
                              className="text-lg px-4 py-1"
                            >
                              {MOCK_VOLATILITY.regime.toUpperCase()}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-2">
                              Current market conditions show {MOCK_VOLATILITY.regime} volatility patterns
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <p className="text-sm font-semibold">Volatility Insights</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Volatility trending upward over time</li>
                          <li>• Expected to increase by 50% in next month</li>
                          <li>• Consider wider price ranges</li>
                          <li>• Risk of increased impermanent loss</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Support/Resistance Tab */}
            <TabsContent value="levels" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Support & Resistance Levels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {SUPPORT_RESISTANCE.sort((a, b) => b.level - a.level).map((level, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: level.type === 'resistance' ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-lg border-2 ${
                          level.type === 'resistance'
                            ? 'bg-red-500/5 border-red-500/20'
                            : 'bg-green-500/5 border-green-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={level.type === 'resistance' ? 'destructive' : 'default'}>
                                {level.type.toUpperCase()}
                              </Badge>
                              <span className="text-2xl font-bold">${level.level.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Tested {level.touches} times • Strength: {level.strength}%
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Distance</p>
                            <p className={`text-lg font-semibold ${
                              level.level > currentPrice ? 'text-red-500' : 'text-green-500'
                            }`}>
                              {((Math.abs(level.level - currentPrice) / currentPrice) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${
                                  level.type === 'resistance' ? 'bg-red-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${level.strength}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold">{level.strength}%</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Implementation Details */}
          <Card className="border-2 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Implementation Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Forecasting Models</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Linear Regression (25% weight)</li>
                    <li>• Moving Average (15% weight)</li>
                    <li>• Exponential Smoothing (20% weight)</li>
                    <li>• Volatility Adjusted (20% weight)</li>
                    <li>• Momentum Based (20% weight)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Technical Features</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Ensemble prediction with weighted averaging</li>
                    <li>• GARCH-like volatility forecasting</li>
                    <li>• RSI, MACD, Stochastic indicators</li>
                    <li>• Support/resistance level detection</li>
                    <li>• Time-series operations and analytics</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted rounded text-sm">
                <p className="font-semibold mb-1">SDK Location</p>
                <code className="text-xs">src/lib/analytics/forecasting.ts</code>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </FeatureIdentifier>
  )
}
