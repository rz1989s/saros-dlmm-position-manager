'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { StaggerList } from '@/components/animations/stagger-list'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Activity,
  LineChart,
  PieChart,
  Gauge,
  Target,
  ArrowUpDown,
  AlertCircle,
  CheckCircle,
  History
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM, useUserPositions } from '@/hooks/use-dlmm'

interface HistoricalDataPoint {
  timestamp: number
  feeTier: number
  volume: number
  fees: number
  liquidity: number
  apy: number
  marketCondition: 'bull' | 'bear' | 'sideways' | 'volatile'
  majorEvent?: string
}

interface SeasonalPattern {
  period: string
  avgPerformance: number
  volatility: number
  bestFeeTier: number
  frequency: number
  confidence: number
  description: string
}

interface TrendAnalysis {
  period: string
  direction: 'increasing' | 'decreasing' | 'stable'
  strength: number
  confidence: number
  predictions: {
    shortTerm: number
    mediumTerm: number
    longTerm: number
  }
  reasoning: string[]
}

interface PerformanceAttribution {
  period: string
  totalReturn: number
  feeContribution: number
  volumeContribution: number
  liquidityContribution: number
  marketContribution: number
  activeManagement: number
  attribution: {
    factor: string
    contribution: number
    percentage: number
  }[]
}

interface FeeTierEvolution {
  date: string
  oldTier: number
  newTier: number
  reason: string
  impact: number
  marketCondition: string
  duration: number
}

// Mock historical data generation
const generateHistoricalData = (months: number): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = []
  const now = Date.now()
  const msPerDay = 24 * 60 * 60 * 1000
  const days = months * 30

  const marketEvents = [
    { day: 45, event: "DeFi Summer Peak", condition: 'bull' as const },
    { day: 120, event: "Terra Luna Collapse", condition: 'bear' as const },
    { day: 180, event: "FTX Bankruptcy", condition: 'volatile' as const },
    { day: 240, event: "ETF Approval Rumors", condition: 'bull' as const },
    { day: 300, event: "Fed Rate Hike", condition: 'bear' as const }
  ]

  for (let i = 0; i < days; i++) {
    const timestamp = now - (days - i) * msPerDay
    const dayOfYear = new Date(timestamp).getDayOfYear()

    // Seasonal patterns
    const isWinter = dayOfYear < 90 || dayOfYear > 270
    const isSummer = dayOfYear > 150 && dayOfYear < 240
    const seasonalMultiplier = isWinter ? 0.8 : isSummer ? 1.3 : 1.0

    // Market events
    const event = marketEvents.find(e => Math.abs(e.day - i) < 5)
    let marketCondition: 'bull' | 'bear' | 'sideways' | 'volatile' = 'sideways'

    if (event) {
      marketCondition = event.condition
    } else {
      // Base market condition with some randomness
      const rand = Math.random()
      if (rand < 0.3) marketCondition = 'bull'
      else if (rand < 0.6) marketCondition = 'bear'
      else if (rand < 0.9) marketCondition = 'sideways'
      else marketCondition = 'volatile'
    }

    // Fee tier selection based on market conditions
    let feeTier = 0.5
    if (marketCondition === 'volatile') feeTier = 1.0
    else if (marketCondition === 'bull') feeTier = 0.25
    else if (marketCondition === 'bear') feeTier = 0.1

    // Volume patterns
    const baseVolume = 1000000
    const marketMultiplier = {
      bull: 1.5,
      bear: 0.6,
      sideways: 1.0,
      volatile: 2.0
    }[marketCondition]

    const volume = baseVolume * marketMultiplier * seasonalMultiplier * (0.7 + Math.random() * 0.6)
    const fees = volume * (feeTier / 100)
    const liquidity = 500000 + Math.random() * 1000000
    const apy = (fees * 365) / liquidity * 100

    data.push({
      timestamp,
      feeTier,
      volume,
      fees,
      liquidity,
      apy,
      marketCondition,
      majorEvent: event?.event
    })
  }

  return data
}

// Add to Date prototype for day of year calculation
declare global {
  interface Date {
    getDayOfYear(): number
  }
}

Date.prototype.getDayOfYear = function() {
  const start = new Date(this.getFullYear(), 0, 0)
  const diff = this.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export default function HistoricalFeeAnalysisDemo() {
  const { } = useWallet()
  const { } = useDLMM()
  const { } = useUserPositions()

  const [selectedPeriod, setSelectedPeriod] = useState('12')
  const [analysisType, setAnalysisType] = useState('performance')
  const [activeTab, setActiveTab] = useState('overview')

  // Generate historical data based on selected period
  const historicalData = useMemo(() =>
    generateHistoricalData(parseInt(selectedPeriod)),
    [selectedPeriod]
  )

  // Calculate seasonal patterns
  const seasonalPatterns = useMemo((): SeasonalPattern[] => {
    const seasons = {
      'Q1 (Winter)': historicalData.filter(d => {
        const month = new Date(d.timestamp).getMonth()
        return month >= 0 && month <= 2
      }),
      'Q2 (Spring)': historicalData.filter(d => {
        const month = new Date(d.timestamp).getMonth()
        return month >= 3 && month <= 5
      }),
      'Q3 (Summer)': historicalData.filter(d => {
        const month = new Date(d.timestamp).getMonth()
        return month >= 6 && month <= 8
      }),
      'Q4 (Fall)': historicalData.filter(d => {
        const month = new Date(d.timestamp).getMonth()
        return month >= 9 && month <= 11
      })
    }

    return Object.entries(seasons).map(([period, data]) => {
      const avgPerformance = data.reduce((sum, d) => sum + d.apy, 0) / data.length
      const returns = data.map(d => d.apy)
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgPerformance, 2), 0) / returns.length
      const volatility = Math.sqrt(variance)

      // Find best performing fee tier for this season
      const tierPerformance = new Map<number, number[]>()
      data.forEach(d => {
        if (!tierPerformance.has(d.feeTier)) tierPerformance.set(d.feeTier, [])
        tierPerformance.get(d.feeTier)!.push(d.apy)
      })

      let bestFeeTier = 0.5
      let bestAvg = 0
      tierPerformance.forEach((apys, tier) => {
        const avg = apys.reduce((sum, apy) => sum + apy, 0) / apys.length
        if (avg > bestAvg) {
          bestAvg = avg
          bestFeeTier = tier
        }
      })

      const confidence = Math.min(95, 60 + (data.length / 10))

      return {
        period,
        avgPerformance,
        volatility,
        bestFeeTier,
        frequency: data.length,
        confidence,
        description: `${period} shows ${avgPerformance > 15 ? 'strong' : avgPerformance > 10 ? 'moderate' : 'weak'} performance with ${volatility > 5 ? 'high' : 'low'} volatility`
      }
    })
  }, [historicalData])

  // Calculate trend analysis
  const trendAnalysis = useMemo((): TrendAnalysis[] => {
    const periods = ['7D', '30D', '90D', '1Y']

    return periods.map(period => {
      const days = period === '7D' ? 7 : period === '30D' ? 30 : period === '90D' ? 90 : 365
      const recentData = historicalData.slice(-days)

      if (recentData.length < 2) {
        return {
          period,
          direction: 'stable' as const,
          strength: 0,
          confidence: 0,
          predictions: { shortTerm: 0, mediumTerm: 0, longTerm: 0 },
          reasoning: ['Insufficient data']
        }
      }

      // Calculate trend using linear regression
      const x = recentData.map((_, i) => i)
      const y = recentData.map(d => d.apy)
      const n = recentData.length

      const sumX = x.reduce((sum, val) => sum + val, 0)
      const sumY = y.reduce((sum, val) => sum + val, 0)
      const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
      const sumXX = x.reduce((sum, val) => sum + val * val, 0)

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)

      // Determine direction and strength
      const direction = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable'
      const strength = Math.abs(slope) * 10
      const confidence = Math.min(95, 50 + Math.abs(slope) * 100)

      // Simple predictions based on trend
      const currentAvg = y[y.length - 1]
      const predictions = {
        shortTerm: currentAvg + slope * 7,
        mediumTerm: currentAvg + slope * 30,
        longTerm: currentAvg + slope * 90
      }

      const reasoning = [
        `${direction} trend detected over ${period}`,
        `Trend strength: ${strength > 5 ? 'Strong' : strength > 2 ? 'Moderate' : 'Weak'}`,
        `Current performance: ${currentAvg.toFixed(2)}% APY`,
        confidence > 70 ? 'High confidence prediction' : 'Moderate confidence prediction'
      ]

      return {
        period,
        direction,
        strength,
        confidence,
        predictions,
        reasoning
      }
    })
  }, [historicalData])

  // Calculate performance attribution
  const performanceAttribution = useMemo((): PerformanceAttribution[] => {
    const periods = ['1M', '3M', '6M', '1Y']

    return periods.map(period => {
      const days = period === '1M' ? 30 : period === '3M' ? 90 : period === '6M' ? 180 : 365
      const periodData = historicalData.slice(-days)

      if (periodData.length === 0) {
        return {
          period,
          totalReturn: 0,
          feeContribution: 0,
          volumeContribution: 0,
          liquidityContribution: 0,
          marketContribution: 0,
          activeManagement: 0,
          attribution: []
        }
      }

      const totalReturn = periodData.reduce((sum, d) => sum + d.apy, 0) / periodData.length
      const avgVolume = periodData.reduce((sum, d) => sum + d.volume, 0) / periodData.length
      const avgFees = periodData.reduce((sum, d) => sum + d.fees, 0) / periodData.length
      const avgLiquidity = periodData.reduce((sum, d) => sum + d.liquidity, 0) / periodData.length

      // Attribution factors (simplified model)
      const feeContribution = (avgFees / avgLiquidity) * 365 * 100
      const volumeContribution = Math.log(avgVolume / 1000000) * 2
      const liquidityContribution = Math.log(avgLiquidity / 500000) * 1.5
      const marketContribution = totalReturn - feeContribution - volumeContribution - liquidityContribution
      const activeManagement = Math.random() * 2 - 1 // Random for demo

      const attribution = [
        { factor: 'Fee Earnings', contribution: feeContribution, percentage: (feeContribution / totalReturn) * 100 },
        { factor: 'Volume Impact', contribution: volumeContribution, percentage: (volumeContribution / totalReturn) * 100 },
        { factor: 'Liquidity Efficiency', contribution: liquidityContribution, percentage: (liquidityContribution / totalReturn) * 100 },
        { factor: 'Market Conditions', contribution: marketContribution, percentage: (marketContribution / totalReturn) * 100 },
        { factor: 'Active Management', contribution: activeManagement, percentage: (activeManagement / totalReturn) * 100 }
      ]

      return {
        period,
        totalReturn,
        feeContribution,
        volumeContribution,
        liquidityContribution,
        marketContribution,
        activeManagement,
        attribution
      }
    })
  }, [historicalData])

  // Calculate fee tier evolution
  const feeTierEvolution = useMemo((): FeeTierEvolution[] => {
    const evolutions: FeeTierEvolution[] = []
    let currentTier = historicalData[0]?.feeTier || 0.5
    let tierStartDate = historicalData[0]?.timestamp || Date.now()

    historicalData.forEach((data, index) => {
      if (data.feeTier !== currentTier && index > 0) {
        const duration = Math.floor((data.timestamp - tierStartDate) / (1000 * 60 * 60 * 24))
        const prevData = historicalData[index - 1]
        const impact = data.apy - prevData.apy

        evolutions.push({
          date: new Date(data.timestamp).toLocaleDateString(),
          oldTier: currentTier,
          newTier: data.feeTier,
          reason: `Market condition: ${data.marketCondition}${data.majorEvent ? ` (${data.majorEvent})` : ''}`,
          impact,
          marketCondition: data.marketCondition,
          duration
        })

        currentTier = data.feeTier
        tierStartDate = data.timestamp
      }
    })

    return evolutions.slice(-10) // Show last 10 changes
  }, [historicalData])

  // Performance summary
  const performanceSummary = useMemo(() => {
    if (historicalData.length === 0) return null

    const totalFees = historicalData.reduce((sum, d) => sum + d.fees, 0)
    const avgApy = historicalData.reduce((sum, d) => sum + d.apy, 0) / historicalData.length
    const maxApy = Math.max(...historicalData.map(d => d.apy))
    const minApy = Math.min(...historicalData.map(d => d.apy))
    const avgVolume = historicalData.reduce((sum, d) => sum + d.volume, 0) / historicalData.length
    const totalDays = historicalData.length
    const uniqueFeeTiers = new Set(historicalData.map(d => d.feeTier)).size

    // Best performing fee tier
    const tierPerformance = new Map<number, number[]>()
    historicalData.forEach(d => {
      if (!tierPerformance.has(d.feeTier)) tierPerformance.set(d.feeTier, [])
      tierPerformance.get(d.feeTier)!.push(d.apy)
    })

    let bestTier = 0.5
    let bestAvgApy = 0
    tierPerformance.forEach((apys, tier) => {
      const avg = apys.reduce((sum, apy) => sum + apy, 0) / apys.length
      if (avg > bestAvgApy) {
        bestAvgApy = avg
        bestTier = tier
      }
    })

    return {
      totalFees,
      avgApy,
      maxApy,
      minApy,
      avgVolume,
      totalDays,
      uniqueFeeTiers,
      bestTier,
      bestAvgApy
    }
  }, [historicalData])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <History className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Historical Fee Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Performance history, seasonal patterns, and trend analysis for optimal fee strategies
            </p>
          </div>
        </div>

        <FeatureIdentifier
          feature={SDK_FEATURES[42]}
          className="mb-6"
        >
          {performanceSummary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    ${performanceSummary.totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Fees Earned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {performanceSummary.avgApy.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average APY</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceSummary.bestTier}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Best Fee Tier</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {performanceSummary.totalDays}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Days Analyzed</div>
                </CardContent>
              </Card>
            </div>
          )}
        </FeatureIdentifier>
      </motion.div>

      <div className="mb-6 flex gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 Months</SelectItem>
            <SelectItem value="6">6 Months</SelectItem>
            <SelectItem value="12">12 Months</SelectItem>
            <SelectItem value="24">24 Months</SelectItem>
          </SelectContent>
        </Select>

        <Select value={analysisType} onValueChange={setAnalysisType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="performance">Performance Analysis</SelectItem>
            <SelectItem value="risk">Risk Analysis</SelectItem>
            <SelectItem value="efficiency">Efficiency Analysis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Seasonal
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="attribution" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Attribution
          </TabsTrigger>
          <TabsTrigger value="evolution" className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            Evolution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Performance Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Interactive APY timeline chart
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Showing {historicalData.length} data points over {selectedPeriod} months
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  Fee Tier Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[0.01, 0.05, 0.1, 0.25, 0.5, 1.0].map(tier => {
                    const tierData = historicalData.filter(d => d.feeTier === tier)
                    const percentage = (tierData.length / historicalData.length) * 100
                    const avgApy = tierData.length > 0 ?
                      tierData.reduce((sum, d) => sum + d.apy, 0) / tierData.length : 0

                    return (
                      <div key={tier} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{tier}%</Badge>
                          <span className="text-sm">{percentage.toFixed(1)}% usage</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{avgApy.toFixed(2)}%</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Avg APY</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Performance Metrics Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {performanceSummary.maxApy.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Peak APY</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {performanceSummary.minApy.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Minimum APY</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ${(performanceSummary.avgVolume / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Daily Volume</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {performanceSummary.uniqueFeeTiers}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Fee Tiers Used</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Seasonal Performance Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StaggerList className="space-y-4">
                {seasonalPatterns.map((pattern) => (
                  <motion.div
                    key={pattern.period}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{pattern.period}</Badge>
                        <span className="font-medium">
                          {pattern.avgPerformance.toFixed(2)}% Average APY
                        </span>
                        <Badge
                          variant={pattern.confidence > 80 ? "default" : pattern.confidence > 60 ? "secondary" : "destructive"}
                        >
                          {pattern.confidence.toFixed(0)}% Confidence
                        </Badge>
                      </div>
                      <Badge variant="outline">
                        Best: {pattern.bestFeeTier}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-semibold mb-1">Performance</div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Volatility: {pattern.volatility.toFixed(2)}%
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Data Points: {pattern.frequency}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold mb-1">Optimal Strategy</div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Fee Tier: {pattern.bestFeeTier}%
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Risk Level: {pattern.volatility > 5 ? 'High' : pattern.volatility > 3 ? 'Medium' : 'Low'}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold mb-1">Analysis</div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs">
                          {pattern.description}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </StaggerList>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seasonal Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Summer Strategy (Q3)</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    High activity period. Consider lower fee tiers (0.1-0.25%) to capture increased volume.
                  </p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-r-lg">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Winter Strategy (Q1)</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Lower activity period. Higher fee tiers (0.5-1.0%) may be more profitable due to reduced competition.
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Transition Periods (Q2, Q4)</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Moderate activity. Balanced approach with 0.25-0.5% fee tiers works best.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trendAnalysis.map((trend) => (
              <Card key={trend.period}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {trend.direction === 'increasing' ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : trend.direction === 'decreasing' ? (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    ) : (
                      <Activity className="w-5 h-5 text-gray-600" />
                    )}
                    {trend.period} Trend Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Direction</span>
                    <Badge
                      variant={
                        trend.direction === 'increasing' ? 'default' :
                        trend.direction === 'decreasing' ? 'destructive' : 'secondary'
                      }
                    >
                      {trend.direction}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Strength</span>
                    <span className="font-medium">
                      {trend.strength > 5 ? 'Strong' : trend.strength > 2 ? 'Moderate' : 'Weak'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Confidence</span>
                    <span className="font-medium">{trend.confidence.toFixed(0)}%</span>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Predictions</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{trend.predictions.shortTerm.toFixed(2)}%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">7 Days</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{trend.predictions.mediumTerm.toFixed(2)}%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">30 Days</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{trend.predictions.longTerm.toFixed(2)}%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">90 Days</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Analysis</h4>
                    <ul className="space-y-1 text-sm">
                      {trend.reasoning.map((reason, index) => (
                        <li key={index} className="text-gray-600 dark:text-gray-400">
                          • {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attribution" className="space-y-6">
          <StaggerList className="space-y-6">
            {performanceAttribution.map((attribution) => (
              <Card key={attribution.period}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    {attribution.period} Performance Attribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Total Return: {attribution.totalReturn.toFixed(2)}%</h4>
                      <div className="space-y-3">
                        {attribution.attribution.map((factor) => (
                          <div key={factor.factor} className="flex items-center justify-between">
                            <span className="text-sm">{factor.factor}</span>
                            <div className="text-right">
                              <div className={`font-medium ${
                                factor.contribution > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {factor.contribution > 0 ? '+' : ''}{factor.contribution.toFixed(2)}%
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {factor.percentage.toFixed(1)}% of total
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Attribution Breakdown</h4>
                      <div className="h-48 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <PieChart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Performance attribution chart
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Showing contribution by factor
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </StaggerList>
        </TabsContent>

        <TabsContent value="evolution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5" />
                Fee Tier Evolution History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feeTierEvolution.length > 0 ? (
                <StaggerList className="space-y-4">
                  {feeTierEvolution.map((evolution, index) => (
                    <motion.div
                      key={index}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{evolution.date}</Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{evolution.oldTier}%</span>
                            <ArrowUpDown className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">{evolution.newTier}%</span>
                          </div>
                        </div>
                        <Badge
                          variant={evolution.impact > 0 ? "default" : "destructive"}
                        >
                          {evolution.impact > 0 ? '+' : ''}{evolution.impact.toFixed(2)}% APY
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-semibold mb-1">Duration</div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {evolution.duration} days
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold mb-1">Market Condition</div>
                          <Badge variant="outline" className="text-xs">
                            {evolution.marketCondition}
                          </Badge>
                        </div>
                        <div>
                          <div className="font-semibold mb-1">Reason</div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs">
                            {evolution.reason}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </StaggerList>
              ) : (
                <div className="text-center py-8">
                  <ArrowUpDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Fee Tier Changes
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No fee tier evolution detected in the selected period.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Successful Adaptations
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {feeTierEvolution.filter(e => e.impact > 0).length} fee tier changes resulted in improved performance.
                  </p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-r-lg">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Areas for Improvement
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Consider more frequent adjustments during volatile market periods to optimize returns.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    <Target className="w-4 h-4 inline mr-2" />
                    Strategic Recommendations
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Based on historical patterns, implementing automated fee tier adjustments could improve returns by 2-5%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}