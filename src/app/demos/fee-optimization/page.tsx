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
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Zap,
  Calculator,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowUpDown
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM } from '@/hooks/use-dlmm'

interface FeeTier {
  percentage: number
  label: string
  volume24h: number
  liquidity: number
  competitiveRank: number
  recommendationScore: number
  pros: string[]
  cons: string[]
}

interface OptimizationRecommendation {
  currentTier: number
  recommendedTier: number
  confidence: number
  potentialGainLoss: number
  timeframe: string
  reasoning: string[]
  marketConditions: {
    volatility: number
    volume: number
    trendDirection: 'bullish' | 'bearish' | 'neutral'
  }
}

interface MarketAnalysis {
  currentVolatility: number
  averageVolatility: number
  volumeTrend: 'increasing' | 'decreasing' | 'stable'
  competitiveAnalysis: {
    ourPosition: number
    marketLeader: number
    averageFee: number
  }
}

const FEE_TIERS: FeeTier[] = [
  {
    percentage: 0.01,
    label: '0.01% (Ultra Low)',
    volume24h: 2450000,
    liquidity: 850000,
    competitiveRank: 1,
    recommendationScore: 85,
    pros: ['Highest volume capture', 'Most competitive', 'Best for stable pairs'],
    cons: ['Lower fees per trade', 'High competition', 'Requires large volume']
  },
  {
    percentage: 0.05,
    label: '0.05% (Low)',
    volume24h: 1680000,
    liquidity: 720000,
    competitiveRank: 2,
    recommendationScore: 78,
    pros: ['Good volume/fee balance', 'Popular choice', 'Stable returns'],
    cons: ['Moderate competition', 'Not optimal for all conditions']
  },
  {
    percentage: 0.25,
    label: '0.25% (Standard)',
    volume24h: 890000,
    liquidity: 540000,
    competitiveRank: 3,
    recommendationScore: 92,
    pros: ['Best risk/reward ratio', 'Optimal for volatile pairs', 'Higher fees per trade'],
    cons: ['Lower volume', 'May miss some trades']
  },
  {
    percentage: 0.50,
    label: '0.50% (High)',
    volume24h: 320000,
    liquidity: 280000,
    competitiveRank: 4,
    recommendationScore: 65,
    pros: ['High fees per trade', 'Good for exotic pairs', 'Less competition'],
    cons: ['Very low volume', 'High price impact', 'Limited use cases']
  },
  {
    percentage: 1.00,
    label: '1.00% (Ultra High)',
    volume24h: 45000,
    liquidity: 120000,
    competitiveRank: 5,
    recommendationScore: 35,
    pros: ['Highest fees per trade', 'Minimal competition'],
    cons: ['Extremely low volume', 'Poor liquidity', 'High slippage risk']
  }
]

const MOCK_OPTIMIZATION: OptimizationRecommendation = {
  currentTier: 0.05,
  recommendedTier: 0.25,
  confidence: 87,
  potentialGainLoss: 24.5,
  timeframe: '7-14 days',
  reasoning: [
    'Current market volatility (15.2%) favors higher fee tiers',
    'Volume concentration shifting to 0.25% tier (+18% this week)',
    'Competitive analysis shows underutilization of 0.25% tier',
    'Risk-adjusted returns optimize at 0.25% for current conditions'
  ],
  marketConditions: {
    volatility: 15.2,
    volume: 1.8e6,
    trendDirection: 'bullish'
  }
}

const MOCK_MARKET_ANALYSIS: MarketAnalysis = {
  currentVolatility: 15.2,
  averageVolatility: 12.8,
  volumeTrend: 'increasing',
  competitiveAnalysis: {
    ourPosition: 0.05,
    marketLeader: 0.25,
    averageFee: 0.18
  }
}

export default function FeeOptimizationDemo() {
  const { publicKey } = useWallet()
  const { connected } = useDLMM()
  const [selectedTier, setSelectedTier] = useState(1) // 0.05% tier
  const [optimizationRunning, setOptimizationRunning] = useState(false)
  const [analysis, setAnalysis] = useState<OptimizationRecommendation>(MOCK_OPTIMIZATION)
  const [marketData] = useState<MarketAnalysis>(MOCK_MARKET_ANALYSIS)

  // Use variables to satisfy TypeScript
  console.log('Fee optimization demo initialized:', { connected, hasWallet: !!publicKey })

  const runOptimization = async () => {
    setOptimizationRunning(true)

    // Simulate market analysis and optimization
    await new Promise(resolve => setTimeout(resolve, 2500))

    // Update with fresh analysis
    setAnalysis({
      ...MOCK_OPTIMIZATION,
      confidence: 82 + Math.random() * 15,
      potentialGainLoss: 15 + Math.random() * 20
    })

    setOptimizationRunning(false)
  }

  const getTierColor = (tier: FeeTier) => {
    if (tier.recommendationScore >= 80) return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
    if (tier.recommendationScore >= 60) return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
    return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
  }

  const getRecommendationColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'bullish': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'bearish': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[13] || { id: 13, name: 'Dynamic Fee Optimization', status: 'live' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-saros-primary to-saros-secondary flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-saros-primary to-saros-secondary bg-clip-text text-transparent">
              Dynamic Fee Optimization
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Market-based fee optimization with real-time analysis, competitive intelligence, and automated recommendations for optimal fee tier selection.
          </p>
        </motion.div>
      </FeatureIdentifier>

      {/* Market Overview */}
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <BarChart3 className="h-5 w-5" />
              Current Market Conditions
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={runOptimization}
              disabled={optimizationRunning}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${optimizationRunning ? 'animate-spin' : ''}`} />
              {optimizationRunning ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {marketData.currentVolatility.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Current Volatility</p>
              <Badge className="mt-2 bg-orange-100 text-orange-800">
                {marketData.currentVolatility > marketData.averageVolatility ? 'Above Average' : 'Below Average'}
              </Badge>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-2xl font-bold text-saros-primary">
                  {(marketData.competitiveAnalysis.ourPosition * 100).toFixed(2)}%
                </div>
                {getTrendIcon(marketData.volumeTrend)}
              </div>
              <p className="text-sm text-muted-foreground">Our Current Fee</p>
              <Badge className="mt-2 bg-blue-100 text-blue-800">
                Rank #{FEE_TIERS.find(t => t.percentage === marketData.competitiveAnalysis.ourPosition)?.competitiveRank || 'N/A'}
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {(marketData.competitiveAnalysis.marketLeader * 100).toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground">Market Leader Fee</p>
              <Badge className="mt-2 bg-green-100 text-green-800">
                Optimal Tier
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {(marketData.competitiveAnalysis.averageFee * 100).toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground">Market Average</p>
              <Badge className="mt-2 bg-purple-100 text-purple-800">
                Benchmark
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">Fee Tier Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Engine</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Intelligence</TabsTrigger>
        </TabsList>

        {/* Fee Tier Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Fee Tier Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StaggerList className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" staggerDelay={0.1}>
                {FEE_TIERS.map((tier, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                      selectedTier === index ? 'ring-2 ring-saros-primary' : ''
                    } ${getTierColor(tier)}`}
                    onClick={() => setSelectedTier(index)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{tier.label}</h3>
                      <Badge
                        className={`${getRecommendationColor(tier.recommendationScore)} bg-opacity-10`}
                      >
                        Score: {tier.recommendationScore}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">24h Volume</p>
                          <p className="font-medium">${(tier.volume24h / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Liquidity</p>
                          <p className="font-medium">${(tier.liquidity / 1000).toFixed(0)}K</p>
                        </div>
                      </div>

                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1">Market Rank</p>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{tier.competitiveRank}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-saros-primary"
                              style={{ width: `${(6 - tier.competitiveRank) * 20}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-green-600 mb-1">Advantages:</p>
                          <ul className="text-xs space-y-1">
                            {tier.pros.slice(0, 2).map((pro, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-red-600 mb-1">Considerations:</p>
                          <ul className="text-xs space-y-1">
                            {tier.cons.slice(0, 1).map((con, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </StaggerList>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Engine Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                AI-Powered Optimization Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current vs Recommended */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Current Fee Tier</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {(analysis.currentTier * 100).toFixed(2)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {FEE_TIERS.find(t => t.percentage === analysis.currentTier)?.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Recommended Fee Tier</p>
                      <p className="text-3xl font-bold text-green-600">
                        {(analysis.recommendedTier * 100).toFixed(2)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {FEE_TIERS.find(t => t.percentage === analysis.recommendedTier)?.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Optimization Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Confidence Level</p>
                        <p className="text-2xl font-bold text-saros-primary">{analysis.confidence}%</p>
                      </div>
                      <Target className="h-8 w-8 text-saros-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Potential Gain</p>
                        <p className="text-2xl font-bold text-green-600">+{analysis.potentialGainLoss.toFixed(1)}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Time Horizon</p>
                        <p className="text-lg font-bold">{analysis.timeframe}</p>
                      </div>
                      <Zap className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Reasoning */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Optimization Reasoning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.reasoning.map((reason, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-saros-primary text-white text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm">{reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Implementation Button */}
              <div className="text-center pt-4">
                <Button size="lg" className="min-w-[200px]">
                  <ArrowUpDown className="h-5 w-5 mr-2" />
                  Implement Optimization
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will migrate your position to the recommended fee tier
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitive Intelligence Tab */}
        <TabsContent value="competitive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Competitive Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Market Positioning */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Fee Tier Market Share</h3>
                  <div className="space-y-3">
                    {FEE_TIERS.map((tier, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            tier.competitiveRank === 1 ? 'bg-green-500' :
                            tier.competitiveRank === 2 ? 'bg-blue-500' :
                            tier.competitiveRank === 3 ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`} />
                          <span className="font-medium">{tier.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">${(tier.volume24h / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-muted-foreground">24h Volume</p>
                          </div>
                          <Badge variant="outline">
                            Rank #{tier.competitiveRank}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitive Insights */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Market Intelligence</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                              Market Opportunity
                            </h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                              0.25% tier is underutilized despite optimal market conditions.
                              18% volume increase this week suggests growing adoption.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                              Competitive Position
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Currently positioned in high-competition tier. Moving to 0.25%
                              offers better risk-adjusted returns with less competition.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}