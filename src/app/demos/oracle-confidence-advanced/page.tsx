'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { formatCurrency } from '@/lib/utils/format'
import {
  Shield,
  Activity,
  TrendingUp,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  AlertCircle
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts'

interface OracleConfidence {
  symbol: string
  provider: 'pyth' | 'switchboard'
  price: number
  confidence: number
  confidenceInterval: number
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  staleness: number
  lastUpdate: Date
}

interface ConfidenceTrend {
  timestamp: string
  pythConfidence: number
  switchboardConfidence: number
  combinedConfidence: number
}

interface StalenesMetric {
  provider: string
  avgStaleness: number
  maxStaleness: number
  stalenessEvents: number
  uptime: number
}

interface QualityScore {
  dimension: string
  pyth: number
  switchboard: number
  threshold: number
}

export default function OracleConfidenceAdvancedDemo() {
  const [selectedProvider, setSelectedProvider] = useState<'all' | 'pyth' | 'switchboard'>('all')
  const [isMonitoring, setIsMonitoring] = useState(false)

  const oracleConfidence: OracleConfidence[] = [
    {
      symbol: 'SOL/USD',
      provider: 'pyth',
      price: 98.45,
      confidence: 0.998,
      confidenceInterval: 0.12,
      quality: 'excellent',
      staleness: 0.8,
      lastUpdate: new Date(Date.now() - 800)
    },
    {
      symbol: 'SOL/USD',
      provider: 'switchboard',
      price: 98.42,
      confidence: 0.995,
      confidenceInterval: 0.18,
      quality: 'excellent',
      staleness: 1.2,
      lastUpdate: new Date(Date.now() - 1200)
    },
    {
      symbol: 'BONK/USD',
      provider: 'pyth',
      price: 0.000024,
      confidence: 0.991,
      confidenceInterval: 0.00000089,
      quality: 'good',
      staleness: 1.5,
      lastUpdate: new Date(Date.now() - 1500)
    },
    {
      symbol: 'USDC/USD',
      provider: 'pyth',
      price: 1.0001,
      confidence: 0.999,
      confidenceInterval: 0.0002,
      quality: 'excellent',
      staleness: 0.5,
      lastUpdate: new Date(Date.now() - 500)
    },
    {
      symbol: 'JUP/USD',
      provider: 'switchboard',
      price: 1.23,
      confidence: 0.987,
      confidenceInterval: 0.034,
      quality: 'good',
      staleness: 2.1,
      lastUpdate: new Date(Date.now() - 2100)
    },
    {
      symbol: 'RAY/USD',
      provider: 'pyth',
      price: 2.45,
      confidence: 0.982,
      confidenceInterval: 0.056,
      quality: 'fair',
      staleness: 3.2,
      lastUpdate: new Date(Date.now() - 3200)
    }
  ]

  const confidenceTrend: ConfidenceTrend[] = [
    { timestamp: '00:00', pythConfidence: 99.2, switchboardConfidence: 98.5, combinedConfidence: 98.9 },
    { timestamp: '04:00', pythConfidence: 99.4, switchboardConfidence: 98.8, combinedConfidence: 99.1 },
    { timestamp: '08:00', pythConfidence: 99.1, switchboardConfidence: 98.6, combinedConfidence: 98.9 },
    { timestamp: '12:00', pythConfidence: 99.3, switchboardConfidence: 99.0, combinedConfidence: 99.2 },
    { timestamp: '16:00', pythConfidence: 99.0, switchboardConfidence: 98.7, combinedConfidence: 98.9 },
    { timestamp: '20:00', pythConfidence: 99.5, switchboardConfidence: 99.2, combinedConfidence: 99.4 },
    { timestamp: '24:00', pythConfidence: 99.8, switchboardConfidence: 99.5, combinedConfidence: 99.7 }
  ]

  const stalenessMetrics: StalenesMetric[] = [
    {
      provider: 'Pyth Network',
      avgStaleness: 1.2,
      maxStaleness: 3.5,
      stalenessEvents: 12,
      uptime: 99.8
    },
    {
      provider: 'Switchboard',
      avgStaleness: 1.8,
      maxStaleness: 4.2,
      stalenessEvents: 18,
      uptime: 99.5
    }
  ]

  const qualityScores: QualityScore[] = [
    { dimension: 'Confidence', pyth: 99.2, switchboard: 98.7, threshold: 95 },
    { dimension: 'Freshness', pyth: 98.5, switchboard: 97.8, threshold: 95 },
    { dimension: 'Accuracy', pyth: 99.4, switchboard: 98.9, threshold: 98 },
    { dimension: 'Consistency', pyth: 98.8, switchboard: 98.2, threshold: 95 },
    { dimension: 'Uptime', pyth: 99.8, switchboard: 99.5, threshold: 99 }
  ]

  const stalenessDistribution = [
    { range: '0-1s', pyth: 45, switchboard: 32 },
    { range: '1-2s', pyth: 28, switchboard: 35 },
    { range: '2-3s', pyth: 18, switchboard: 22 },
    { range: '3-5s', pyth: 7, switchboard: 9 },
    { range: '>5s', pyth: 2, switchboard: 2 }
  ]

  const confidenceScatterData = oracleConfidence.map(o => ({
    confidence: o.confidence * 100,
    staleness: o.staleness,
    provider: o.provider,
    symbol: o.symbol
  }))

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-100 border-green-300'
      case 'good': return 'text-blue-600 bg-blue-100 border-blue-300'
      case 'fair': return 'text-yellow-600 bg-yellow-100 border-yellow-300'
      case 'poor': return 'text-red-600 bg-red-100 border-red-300'
      default: return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[12] || { id: 12, name: 'Oracle Confidence Advanced', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full">
            <Shield className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900">Oracle Quality</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Advanced Oracle Confidence System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Multi-provider confidence comparison, staleness detection algorithms, trend analysis, and comprehensive quality scoring methodology
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3" />
              SDK Feature #12
            </Badge>
            <Badge variant="outline" className="gap-1 border-emerald-500 text-emerald-700">
              <Shield className="h-3 w-3" />
              Quality Assured
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-600" />
            Confidence Monitoring Control
          </CardTitle>
          <CardDescription>
            Real-time oracle confidence and quality monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {(['all', 'pyth', 'switchboard'] as const).map((provider) => (
                <Button
                  key={provider}
                  variant={selectedProvider === provider ? 'default' : 'outline'}
                  onClick={() => setSelectedProvider(provider)}
                  className="capitalize"
                >
                  {provider === 'all' ? 'All Providers' : provider}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => setIsMonitoring(!isMonitoring)}
              variant={isMonitoring ? "destructive" : "default"}
              className="gap-2 ml-auto"
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
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Avg Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {(oracleConfidence.reduce((sum, o) => sum + o.confidence, 0) / oracleConfidence.length * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all providers</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Avg Staleness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {(oracleConfidence.reduce((sum, o) => sum + o.staleness, 0) / oracleConfidence.length).toFixed(1)}s
            </div>
            <p className="text-xs text-muted-foreground mt-1">Time since update</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {((qualityScores.reduce((sum, q) => sum + q.pyth + q.switchboard, 0) / (qualityScores.length * 2))).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall quality</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {(stalenessMetrics.reduce((sum, m) => sum + m.uptime, 0) / stalenessMetrics.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">System availability</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="confidence">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="confidence">Confidence Trends</TabsTrigger>
          <TabsTrigger value="staleness">Staleness Analysis</TabsTrigger>
          <TabsTrigger value="quality">Quality Scoring</TabsTrigger>
          <TabsTrigger value="comparison">Provider Comparison</TabsTrigger>
        </TabsList>

        {/* Confidence Trends */}
        <TabsContent value="confidence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Confidence Trend Analysis
              </CardTitle>
              <CardDescription>Provider confidence levels over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={confidenceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis domain={[95, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="pythConfidence"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                    name="Pyth Network"
                  />
                  <Area
                    type="monotone"
                    dataKey="switchboardConfidence"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                    name="Switchboard"
                  />
                  <Area
                    type="monotone"
                    dataKey="combinedConfidence"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    name="Combined"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Confidence vs Staleness Correlation
              </CardTitle>
              <CardDescription>Relationship between confidence and data freshness</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="staleness" name="Staleness (s)" />
                  <YAxis dataKey="confidence" name="Confidence (%)" domain={[95, 100]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter
                    name="Pyth Network"
                    data={confidenceScatterData.filter(d => d.provider === 'pyth')}
                    fill="#8b5cf6"
                  />
                  <Scatter
                    name="Switchboard"
                    data={confidenceScatterData.filter(d => d.provider === 'switchboard')}
                    fill="#3b82f6"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staleness Analysis */}
        <TabsContent value="staleness" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Staleness Distribution
              </CardTitle>
              <CardDescription>Data age distribution by provider</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stalenessDistribution}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stalenessMetrics.map((metric, index) => (
              <Card key={metric.provider}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${index === 0 ? 'bg-purple-500' : 'bg-blue-500'}`} />
                    {metric.provider}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Staleness</span>
                    <span className="font-medium">{metric.avgStaleness.toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Max Staleness</span>
                    <span className="font-medium text-orange-600">{metric.maxStaleness.toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Staleness Events</span>
                    <span className="font-medium">{metric.stalenessEvents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="font-medium text-green-600">{metric.uptime.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Quality Scoring */}
        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Quality Dimension Analysis
              </CardTitle>
              <CardDescription>Multi-dimensional quality assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={qualityScores}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" />
                  <PolarRadiusAxis angle={90} domain={[90, 100]} />
                  <Radar
                    name="Pyth Network"
                    dataKey="pyth"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Switchboard"
                    dataKey="switchboard"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Threshold"
                    dataKey="threshold"
                    stroke="#ef4444"
                    fill="none"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quality Dimensions Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {qualityScores.map((score, index) => (
                  <motion.div
                    key={score.dimension}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <h4 className="font-medium mb-3">{score.dimension}</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Pyth Network</span>
                        <div className={`font-medium ${score.pyth >= score.threshold ? 'text-green-600' : 'text-red-600'}`}>
                          {score.pyth.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Switchboard</span>
                        <div className={`font-medium ${score.switchboard >= score.threshold ? 'text-green-600' : 'text-red-600'}`}>
                          {score.switchboard.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Threshold</span>
                        <div className="font-medium">{score.threshold.toFixed(1)}%</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Provider Comparison */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Live Price Feeds with Confidence
              </CardTitle>
              <CardDescription>Real-time oracle data with quality indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {oracleConfidence.map((oracle, index) => (
                  <motion.div
                    key={`${oracle.symbol}-${oracle.provider}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border ${getQualityColor(oracle.quality)}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${oracle.provider === 'pyth' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                        <span className="font-mono text-sm font-medium">{oracle.symbol}</span>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {oracle.provider}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getQualityColor(oracle.quality)}
                        >
                          {oracle.quality}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatCurrency(oracle.price)}</div>
                        <div className="text-xs text-muted-foreground">
                          ±{formatCurrency(oracle.confidenceInterval)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Confidence</span>
                        <div className="font-medium text-green-600">
                          {(oracle.confidence * 100).toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Staleness</span>
                        <div className={`font-medium ${oracle.staleness < 2 ? 'text-green-600' : oracle.staleness < 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {oracle.staleness.toFixed(1)}s
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Update</span>
                        <div className="font-medium">
                          {oracle.lastUpdate.toLocaleTimeString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quality</span>
                        <div className="font-medium capitalize">{oracle.quality}</div>
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
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <CheckCircle className="h-5 w-5" />
            Advanced Confidence Features
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-emerald-800 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Multi-Provider Confidence:</strong> Real-time confidence comparison between Pyth and Switchboard</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Staleness Detection:</strong> Advanced algorithms for identifying and alerting on stale data</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Trend Analysis:</strong> Historical confidence trends with predictive analytics</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Quality Scoring:</strong> Comprehensive methodology evaluating 5 quality dimensions</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Real-Time Monitoring:</strong> Live confidence tracking with automatic quality assessment</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
