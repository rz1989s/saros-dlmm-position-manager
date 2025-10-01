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
  PieChart,
  TrendingUp,
  Target,
  DollarSign,
  Activity,
  RefreshCw,
  BarChart3
} from 'lucide-react'

interface AttributionComponent {
  name: string
  value: number
  percentage: number
  confidence: number
  volatility: number
  sharpeRatio: number
  description: string
}

interface RiskAdjustedMetric {
  metric: string
  value: number
  benchmark: number
  percentile: number
  rating: 'excellent' | 'good' | 'average' | 'poor'
}

interface FactorExposure {
  factor: string
  exposure: number
  contribution: number
  description: string
}

const MOCK_ATTRIBUTION: AttributionComponent[] = [
  {
    name: 'Fee Income',
    value: 1250.80,
    percentage: 42.5,
    confidence: 95,
    volatility: 0.08,
    sharpeRatio: 3.2,
    description: 'Fees earned from trading activity in the position'
  },
  {
    name: 'Price Appreciation',
    value: 980.40,
    percentage: 33.3,
    confidence: 85,
    volatility: 0.35,
    sharpeRatio: 1.8,
    description: 'Gains from token price movements'
  },
  {
    name: 'Compounding',
    value: 420.15,
    percentage: 14.3,
    confidence: 88,
    volatility: 0.12,
    sharpeRatio: 2.4,
    description: 'Returns from fee reinvestment and compounding'
  },
  {
    name: 'Rebalancing',
    value: 345.70,
    percentage: 11.7,
    confidence: 72,
    volatility: 0.22,
    sharpeRatio: 1.4,
    description: 'Net benefit from range adjustments'
  },
  {
    name: 'Impermanent Loss',
    value: -285.50,
    percentage: -9.7,
    confidence: 78,
    volatility: 0.45,
    sharpeRatio: -0.8,
    description: 'Loss from token price divergence'
  },
  {
    name: 'Timing',
    value: 230.60,
    percentage: 7.8,
    confidence: 45,
    volatility: 0.52,
    sharpeRatio: 0.6,
    description: 'Impact of entry and exit timing decisions'
  }
]

const MOCK_RISK_METRICS: RiskAdjustedMetric[] = [
  { metric: 'Sharpe Ratio', value: 2.45, benchmark: 1.20, percentile: 85, rating: 'excellent' },
  { metric: 'Sortino Ratio', value: 3.12, benchmark: 1.50, percentile: 82, rating: 'excellent' },
  { metric: 'Information Ratio', value: 1.85, benchmark: 0.80, percentile: 78, rating: 'good' },
  { metric: 'Calmar Ratio', value: 4.20, benchmark: 2.00, percentile: 88, rating: 'excellent' },
  { metric: 'Alpha', value: 0.082, benchmark: 0.000, percentile: 75, rating: 'good' },
  { metric: 'Beta', value: 0.92, benchmark: 1.00, percentile: 65, rating: 'good' }
]

const MOCK_FACTOR_EXPOSURE: FactorExposure[] = [
  { factor: 'Market', exposure: 1.0, contribution: 2.5, description: 'Overall market exposure' },
  { factor: 'Liquidity', exposure: 0.8, contribution: 1.8, description: 'Liquidity provision premium' },
  { factor: 'Volatility', exposure: 0.3, contribution: 0.9, description: 'Exposure to volatility changes' },
  { factor: 'Carry', exposure: 0.5, contribution: 1.2, description: 'Yield/carry strategy exposure' },
  { factor: 'Momentum', exposure: 0.1, contribution: 0.3, description: 'Price momentum exposure' },
  { factor: 'Mean Reversion', exposure: -0.2, contribution: -0.4, description: 'Counter-trend positioning' }
]

const BENCHMARK_COMPARISON = {
  portfolio: 12.5,
  benchmark: 8.3,
  excess: 4.2,
  upCapture: 115,
  downCapture: 78,
  trackingError: 5.2
}

export default function PerformanceAttributionDemo() {
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const handleAnalyze = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
  }

  const totalReturn = MOCK_ATTRIBUTION.reduce((sum, comp) => sum + comp.value, 0)
  const positiveContributions = MOCK_ATTRIBUTION.filter(c => c.value > 0)
  const negativeContributions = MOCK_ATTRIBUTION.filter(c => c.value < 0)

  return (
    <FeatureIdentifier feature={SDK_FEATURES[31]}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold">Performance Attribution Analysis</h1>
              <Badge variant="outline" className="ml-2">
                Feature #31
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Detailed P&L attribution with Brinson methodology and risk-adjusted metrics
            </p>
          </div>

          {/* Summary Card */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Total Return Attribution
                </CardTitle>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="90d">90 Days</option>
                    <option value="1y">1 Year</option>
                  </select>
                  <Button onClick={handleAnalyze} disabled={loading} size="sm">
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Activity className="mr-2 h-3 w-3" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Return</p>
                  <p className="text-3xl font-bold text-green-500">${totalReturn.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">+{(totalReturn / 20000 * 100).toFixed(2)}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Positive Contributors</p>
                  <p className="text-3xl font-bold">{positiveContributions.length}</p>
                  <p className="text-xs text-muted-foreground">
                    ${positiveContributions.reduce((sum, c) => sum + c.value, 0).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Negative Contributors</p>
                  <p className="text-3xl font-bold text-red-500">{negativeContributions.length}</p>
                  <p className="text-xs text-muted-foreground">
                    ${Math.abs(negativeContributions.reduce((sum, c) => sum + c.value, 0)).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Annualized Return</p>
                  <p className="text-3xl font-bold">{((totalReturn / 20000) * 12).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Based on {selectedPeriod}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="components" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="risk">Risk-Adjusted</TabsTrigger>
              <TabsTrigger value="factors">Factor Exposure</TabsTrigger>
              <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
            </TabsList>

            {/* Attribution Components Tab */}
            <TabsContent value="components" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Return Components Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StaggerList className="space-y-3">
                    {MOCK_ATTRIBUTION.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).map((component, i) => (
                      <motion.div
                        key={component.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-lg border-2 ${
                          component.value >= 0
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-red-500/5 border-red-500/20'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{component.name}</h3>
                              <Badge variant={component.value >= 0 ? 'default' : 'destructive'}>
                                {component.percentage >= 0 ? '+' : ''}{component.percentage.toFixed(1)}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{component.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className={`text-2xl font-bold ${
                              component.value >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {component.value >= 0 ? '+' : ''}${component.value.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${component.confidence}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold">{component.confidence}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Volatility</p>
                            <p className="text-sm font-semibold">{(component.volatility * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Sharpe Ratio</p>
                            <p className={`text-sm font-semibold ${
                              component.sharpeRatio >= 1 ? 'text-green-500' : 'text-orange-500'
                            }`}>
                              {component.sharpeRatio.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </StaggerList>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Risk-Adjusted Metrics Tab */}
            <TabsContent value="risk" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Risk-Adjusted Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_RISK_METRICS.map((metric, i) => (
                      <motion.div
                        key={metric.metric}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-muted rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold mb-1">{metric.metric}</h3>
                            <Badge variant={
                              metric.rating === 'excellent' ? 'default' :
                              metric.rating === 'good' ? 'secondary' : 'outline'
                            }>
                              {metric.rating.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {metric.metric === 'Alpha' || metric.metric === 'Beta'
                                ? metric.value.toFixed(3)
                                : metric.value.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              vs {metric.benchmark.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Percentile Rank</span>
                            <span className="font-semibold">{metric.percentile}th</span>
                          </div>
                          <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${
                                metric.rating === 'excellent' ? 'bg-green-500' :
                                metric.rating === 'good' ? 'bg-blue-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${metric.percentile}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border-2 border-green-500/20">
                    <p className="text-sm font-semibold mb-2">Overall Rating: EXCELLENT</p>
                    <p className="text-xs text-muted-foreground">
                      Portfolio demonstrates superior risk-adjusted returns across multiple metrics.
                      Performance is in the top quartile compared to benchmark and peer group.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Factor Exposure Tab */}
            <TabsContent value="factors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Factor Exposure Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {MOCK_FACTOR_EXPOSURE.map((factor, i) => (
                      <motion.div
                        key={factor.factor}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-muted rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{factor.factor}</h3>
                            <p className="text-sm text-muted-foreground">{factor.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm text-muted-foreground mb-1">Contribution</p>
                            <p className={`text-xl font-bold ${
                              factor.contribution >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {factor.contribution >= 0 ? '+' : ''}{factor.contribution.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Exposure: {factor.exposure.toFixed(2)}x
                          </p>
                          <div className="relative w-full h-3 bg-background rounded-full overflow-hidden">
                            <div
                              className="absolute h-full left-1/2 -translate-x-1/2 w-px bg-muted-foreground/30"
                            />
                            <div
                              className={`absolute h-full ${
                                factor.exposure >= 0 ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{
                                width: `${Math.abs(factor.exposure) * 25}%`,
                                left: factor.exposure >= 0 ? '50%' : `${50 - Math.abs(factor.exposure) * 25}%`
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>-1.0</span>
                            <span>0</span>
                            <span>+1.0</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Benchmark Comparison Tab */}
            <TabsContent value="benchmark" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Benchmark Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-2 border-green-500/20">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-1">Portfolio Return</p>
                        <p className="text-3xl font-bold text-green-500">
                          +{BENCHMARK_COMPARISON.portfolio.toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-1">Benchmark Return</p>
                        <p className="text-3xl font-bold">
                          +{BENCHMARK_COMPARISON.benchmark.toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/20">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-1">Excess Return (Alpha)</p>
                        <p className="text-3xl font-bold text-purple-500">
                          +{BENCHMARK_COMPARISON.excess.toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-3">Capture Ratios</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Upside Capture</span>
                            <span className="font-bold text-green-500">
                              {BENCHMARK_COMPARISON.upCapture}%
                            </span>
                          </div>
                          <div className="w-full bg-background rounded-full h-2">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${Math.min(BENCHMARK_COMPARISON.upCapture, 150)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Capturing {BENCHMARK_COMPARISON.upCapture}% of market gains
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Downside Capture</span>
                            <span className="font-bold text-blue-500">
                              {BENCHMARK_COMPARISON.downCapture}%
                            </span>
                          </div>
                          <div className="w-full bg-background rounded-full h-2">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${BENCHMARK_COMPARISON.downCapture}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Only experiencing {BENCHMARK_COMPARISON.downCapture}% of market losses
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-3">Tracking Analysis</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Tracking Error</span>
                          <span className="font-bold">{BENCHMARK_COMPARISON.trackingError.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Information Ratio</span>
                          <span className="font-bold">
                            {(BENCHMARK_COMPARISON.excess / BENCHMARK_COMPARISON.trackingError).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Active Return</span>
                          <span className="font-bold text-green-500">
                            +{BENCHMARK_COMPARISON.excess.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          Strong alpha generation with moderate tracking error indicates
                          effective active management and good risk-adjusted outperformance.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Implementation Details */}
          <Card className="border-2 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Implementation Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Attribution Components</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Fee income tracking and attribution</li>
                    <li>• Price appreciation decomposition</li>
                    <li>• Impermanent loss analysis</li>
                    <li>• Rebalancing cost/benefit analysis</li>
                    <li>• Compounding effect calculation</li>
                    <li>• Timing impact assessment</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Methodology</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Brinson attribution model</li>
                    <li>• Risk-adjusted metrics (Sharpe, Sortino, etc.)</li>
                    <li>• Factor exposure analysis</li>
                    <li>• Benchmark comparison framework</li>
                    <li>• Time and money-weighted returns</li>
                    <li>• Statistical confidence intervals</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted rounded text-sm">
                <p className="font-semibold mb-1">SDK Location</p>
                <code className="text-xs">src/lib/analytics/attribution.ts</code>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </FeatureIdentifier>
  )
}
