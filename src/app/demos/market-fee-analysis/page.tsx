'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { StaggerList } from '@/components/animations/stagger-list'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Zap,
  Brain,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  Users,
  Crown,
  Lightbulb,
  Activity,
  ArrowUpDown,
  Star,
  Award,
  Shield
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM } from '@/hooks/use-dlmm'

interface Competitor {
  id: string
  name: string
  protocolType: 'DLMM' | 'AMM' | 'Order Book'
  marketShare: number
  avgFeeRate: number
  volume24h: number
  liquidity: number
  pairs: number
  reputation: number
  advantages: string[]
  weaknesses: string[]
}

interface MarketRecommendation {
  recommendedFeeRate: number
  confidence: number
  reasoning: string[]
  targetMarketShare: number
  expectedVolume: number
  riskLevel: 'low' | 'medium' | 'high'
  timeHorizon: string
  competitiveAdvantage: string
  marketPositioning: 'aggressive' | 'conservative' | 'balanced'
  aiInsights: {
    marketTrend: string
    optimalTiming: string
    successProbability: number
    keyFactors: string[]
  }
}

interface PeerAnalysis {
  competitorId: string
  feeComparison: number // percentage difference
  volumeComparison: number
  liquidityComparison: number
  efficiencyScore: number
  marketPosition: 'leader' | 'challenger' | 'follower'
  threatLevel: 'high' | 'medium' | 'low'
  strategicGaps: string[]
}

interface MarketIntelligence {
  marketSize: number
  growthRate: number
  competitiveIntensity: number
  barrierToEntry: number
  innovationIndex: number
  userSentiment: number
  seasonalPatterns: {
    q1: number
    q2: number
    q3: number
    q4: number
  }
  emergingTrends: string[]
}

const COMPETITORS: Competitor[] = [
  {
    id: 'uniswap-v3',
    name: 'Uniswap V3',
    protocolType: 'DLMM',
    marketShare: 28.5,
    avgFeeRate: 0.30,
    volume24h: 950000000,
    liquidity: 4200000000,
    pairs: 1250,
    reputation: 95,
    advantages: ['Largest liquidity', 'Brand recognition', 'Developer ecosystem'],
    weaknesses: ['High gas fees', 'Complex UX', 'Ethereum dependency']
  },
  {
    id: 'pancakeswap',
    name: 'PancakeSwap V3',
    protocolType: 'DLMM',
    marketShare: 15.2,
    avgFeeRate: 0.25,
    volume24h: 420000000,
    liquidity: 1800000000,
    pairs: 850,
    reputation: 88,
    advantages: ['Low fees', 'High APY', 'BSC ecosystem'],
    weaknesses: ['Centralization concerns', 'Limited innovation', 'BSC dependency']
  },
  {
    id: 'orca',
    name: 'Orca DLMM',
    protocolType: 'DLMM',
    marketShare: 8.3,
    avgFeeRate: 0.20,
    volume24h: 125000000,
    liquidity: 680000000,
    pairs: 320,
    reputation: 82,
    advantages: ['Solana speed', 'Low fees', 'Great UX'],
    weaknesses: ['Smaller ecosystem', 'Limited pairs', 'Solana risks']
  },
  {
    id: 'raydium',
    name: 'Raydium DLMM',
    protocolType: 'DLMM',
    marketShare: 12.1,
    avgFeeRate: 0.25,
    volume24h: 280000000,
    liquidity: 920000000,
    pairs: 450,
    reputation: 85,
    advantages: ['Solana native', 'Serum integration', 'Yield farming'],
    weaknesses: ['Complex fee structure', 'UI complexity', 'Competition']
  },
  {
    id: 'saros',
    name: 'Saros DLMM',
    protocolType: 'DLMM',
    marketShare: 4.2,
    avgFeeRate: 0.18,
    volume24h: 85000000,
    liquidity: 420000000,
    pairs: 180,
    reputation: 78,
    advantages: ['Advanced features', 'Innovation', 'Developer tools'],
    weaknesses: ['Brand awareness', 'Market penetration', 'Liquidity gaps']
  }
]

const MOCK_RECOMMENDATION: MarketRecommendation = {
  recommendedFeeRate: 0.22,
  confidence: 87,
  reasoning: [
    'Current market gap exists between 0.20% and 0.25% fee tiers',
    'Volume analysis shows optimal capture at 0.22% for current market conditions',
    'Competitive positioning allows for premium pricing vs. Orca while undercutting Raydium',
    'Market sentiment favors mid-tier fee structures with high-quality execution'
  ],
  targetMarketShare: 6.8,
  expectedVolume: 145000000,
  riskLevel: 'medium',
  timeHorizon: '3-6 months',
  competitiveAdvantage: 'Advanced analytics and superior UX',
  marketPositioning: 'balanced',
  aiInsights: {
    marketTrend: 'Growing demand for transparent fee structures',
    optimalTiming: 'Q4 2024 - market consolidation phase',
    successProbability: 73,
    keyFactors: ['User experience', 'Fee transparency', 'Liquidity depth', 'Innovation pace']
  }
}

const MOCK_MARKET_INTELLIGENCE: MarketIntelligence = {
  marketSize: 2800000000,
  growthRate: 24.5,
  competitiveIntensity: 78,
  barrierToEntry: 65,
  innovationIndex: 82,
  userSentiment: 71,
  seasonalPatterns: {
    q1: 85,
    q2: 110,
    q3: 95,
    q4: 120
  },
  emergingTrends: [
    'Cross-chain liquidity aggregation',
    'AI-powered market making',
    'Intent-based trading protocols',
    'Gasless transaction execution',
    'Advanced MEV protection'
  ]
}

export default function MarketFeeAnalysisDemo() {
  const { publicKey } = useWallet()
  const { connected } = useDLMM()
  const [analysisRunning, setAnalysisRunning] = useState(false)
  const [recommendation, setRecommendation] = useState<MarketRecommendation>(MOCK_RECOMMENDATION)
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('')
  const [marketIntel] = useState<MarketIntelligence>(MOCK_MARKET_INTELLIGENCE)

  // Use variables to satisfy TypeScript
  console.log('Market fee analysis demo initialized:', { connected, hasWallet: !!publicKey })

  const runMarketAnalysis = async () => {
    setAnalysisRunning(true)

    // Simulate comprehensive market analysis
    await new Promise(resolve => setTimeout(resolve, 4000))

    // Update recommendation with fresh analysis
    setRecommendation({
      ...MOCK_RECOMMENDATION,
      confidence: 80 + Math.random() * 15,
      recommendedFeeRate: 0.18 + Math.random() * 0.12,
      targetMarketShare: 5.5 + Math.random() * 3,
      aiInsights: {
        ...MOCK_RECOMMENDATION.aiInsights,
        successProbability: 65 + Math.random() * 20
      }
    })

    setAnalysisRunning(false)
  }

  const getCompetitorRanking = (competitor: Competitor) => {
    const score = (competitor.marketShare * 0.3) +
                 (competitor.reputation * 0.25) +
                 ((competitor.volume24h / 1000000000) * 100 * 0.25) +
                 ((competitor.liquidity / 1000000000) * 100 * 0.2)

    if (score >= 80) return { rank: 'Leader', color: 'text-green-600', icon: Crown }
    if (score >= 60) return { rank: 'Challenger', color: 'text-blue-600', icon: Award }
    return { rank: 'Follower', color: 'text-orange-600', icon: Target }
  }

  const getMarketPositionColor = (position: string) => {
    switch (position) {
      case 'aggressive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'balanced': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'conservative': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-blue-600'
    if (confidence >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[25] || { id: 25, name: 'Market-based Fee Recommendations', status: 'live' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-saros-primary to-saros-secondary flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-saros-primary to-saros-secondary bg-clip-text text-transparent">
              Market-based Fee Recommendations
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            AI-powered competitive analysis with intelligent fee recommendations, market intelligence, and strategic positioning insights for optimal market capture.
          </p>
        </motion.div>
      </FeatureIdentifier>

      {/* AI Recommendation Overview */}
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Brain className="h-5 w-5" />
              AI Market Intelligence Summary
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={runMarketAnalysis}
              disabled={analysisRunning}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${analysisRunning ? 'animate-spin' : ''}`} />
              {analysisRunning ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${getConfidenceColor(recommendation.confidence)}`}>
                {recommendation.confidence}%
              </div>
              <p className="text-sm text-muted-foreground">AI Confidence</p>
              <Badge className="mt-2 bg-blue-100 text-blue-800">
                {recommendation.confidence >= 80 ? 'High' : recommendation.confidence >= 60 ? 'Medium' : 'Low'} Certainty
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-saros-primary mb-2">
                {(recommendation.recommendedFeeRate * 100).toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground">Recommended Fee</p>
              <Badge className="mt-2 bg-green-100 text-green-800">
                Optimal Rate
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {recommendation.targetMarketShare.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Target Market Share</p>
              <Badge className="mt-2 bg-purple-100 text-purple-800">
                Growth Target
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {recommendation.aiInsights.successProbability}%
              </div>
              <p className="text-sm text-muted-foreground">Success Probability</p>
              <Badge className={getMarketPositionColor(recommendation.marketPositioning)}>
                {recommendation.marketPositioning.charAt(0).toUpperCase() + recommendation.marketPositioning.slice(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="competitive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="competitive">Competitive Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="intelligence">Market Intelligence</TabsTrigger>
          <TabsTrigger value="positioning">Strategic Positioning</TabsTrigger>
        </TabsList>

        {/* Competitive Analysis Tab */}
        <TabsContent value="competitive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Competitive Landscape Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StaggerList className="space-y-4" staggerDelay={0.1}>
                {COMPETITORS.map((competitor) => {
                  const ranking = getCompetitorRanking(competitor)
                  const RankIcon = ranking.icon
                  const isSelected = selectedCompetitor === competitor.id

                  return (
                    <motion.div
                      key={competitor.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`border rounded-lg p-6 cursor-pointer transition-all duration-300 ${
                        isSelected ? 'ring-2 ring-saros-primary border-saros-primary' : 'hover:border-saros-primary/50'
                      } ${competitor.name === 'Saros DLMM' ? 'bg-saros-primary/5' : ''}`}
                      onClick={() => setSelectedCompetitor(competitor.id)}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <RankIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{competitor.name}</h3>
                                {competitor.name === 'Saros DLMM' && (
                                  <Badge className="bg-saros-primary text-white">US</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{competitor.protocolType}</Badge>
                                <Badge className={ranking.color.includes('green') ? 'bg-green-100 text-green-800' :
                                                ranking.color.includes('blue') ? 'bg-blue-100 text-blue-800' :
                                                'bg-orange-100 text-orange-800'}>
                                  {ranking.rank}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-saros-primary">
                              {competitor.marketShare.toFixed(1)}%
                            </p>
                            <p className="text-sm text-muted-foreground">Market Share</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Avg Fee Rate</p>
                            <p className="font-medium">{(competitor.avgFeeRate * 100).toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">24h Volume</p>
                            <p className="font-medium">${(competitor.volume24h / 1000000).toFixed(0)}M</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Liquidity</p>
                            <p className="font-medium">${(competitor.liquidity / 1000000000).toFixed(1)}B</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Reputation</p>
                            <div className="flex items-center gap-1">
                              <p className="font-medium">{competitor.reputation}</p>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${
                                    i < Math.floor(competitor.reputation / 20) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`} />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-green-600 mb-2">Competitive Advantages:</p>
                            <ul className="text-sm space-y-1">
                              {competitor.advantages.slice(0, 3).map((advantage, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                  {advantage}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-red-600 mb-2">Weaknesses:</p>
                            <ul className="text-sm space-y-1">
                              {competitor.weaknesses.slice(0, 3).map((weakness, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                                  {weakness}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pt-4 border-t"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-lg font-bold text-blue-600">{competitor.pairs}</p>
                                <p className="text-sm text-muted-foreground">Trading Pairs</p>
                              </div>
                              <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-lg font-bold text-purple-600">
                                  {((competitor.volume24h / competitor.liquidity) * 100).toFixed(1)}%
                                </p>
                                <p className="text-sm text-muted-foreground">Volume/Liquidity Ratio</p>
                              </div>
                              <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-lg font-bold text-green-600">
                                  {(competitor.volume24h * competitor.avgFeeRate / 365 / 1000000).toFixed(1)}M
                                </p>
                                <p className="text-sm text-muted-foreground">Daily Fee Revenue</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </StaggerList>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI-Powered Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Recommendation */}
              <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                        Primary Recommendation
                      </h3>
                      <p className="text-3xl font-bold text-green-600">
                        {(recommendation.recommendedFeeRate * 100).toFixed(2)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Optimal Fee Rate</p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                        Expected Impact
                      </h3>
                      <p className="text-2xl font-bold text-green-600">
                        +{recommendation.targetMarketShare.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Market Share Growth</p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                        Risk Level
                      </h3>
                      <Badge className={
                        recommendation.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                        recommendation.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {recommendation.riskLevel.toUpperCase()} RISK
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">{recommendation.timeHorizon}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Reasoning */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Analysis & Reasoning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendation.reasoning.map((reason, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-saros-primary text-white text-sm flex items-center justify-center mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm flex-1">{reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Success Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Success Probability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">AI Confidence</span>
                        <span className="text-sm font-bold">{recommendation.aiInsights.successProbability}%</span>
                      </div>
                      <Progress value={recommendation.aiInsights.successProbability} className="h-3" />

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Key Success Factors:</p>
                        <ul className="text-sm space-y-1">
                          {recommendation.aiInsights.keyFactors.map((factor, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Target className="h-3 w-3 text-saros-primary flex-shrink-0" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Market Timing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Market Trend</p>
                        <p className="text-sm">{recommendation.aiInsights.marketTrend}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Optimal Timing</p>
                        <p className="text-sm">{recommendation.aiInsights.optimalTiming}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Competitive Advantage</p>
                        <p className="text-sm">{recommendation.competitiveAdvantage}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Implementation Action */}
              <div className="text-center pt-4">
                <Button size="lg" className="min-w-[250px]">
                  <ArrowUpDown className="h-5 w-5 mr-2" />
                  Implement AI Recommendation
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will configure your fee structure based on AI analysis
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Intelligence Tab */}
        <TabsContent value="intelligence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Market Intelligence Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Market Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-saros-primary">
                        ${(marketIntel.marketSize / 1000000000).toFixed(1)}B
                      </p>
                      <p className="text-sm text-muted-foreground">Total Market Size</p>
                      <div className="flex items-center justify-center mt-2">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">
                          +{marketIntel.growthRate.toFixed(1)}% YoY
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {marketIntel.competitiveIntensity}
                      </p>
                      <p className="text-sm text-muted-foreground">Competitive Intensity</p>
                      <Badge className="mt-2 bg-orange-100 text-orange-800">
                        {marketIntel.competitiveIntensity > 75 ? 'High' :
                         marketIntel.competitiveIntensity > 50 ? 'Medium' : 'Low'} Competition
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {marketIntel.innovationIndex}
                      </p>
                      <p className="text-sm text-muted-foreground">Innovation Index</p>
                      <div className="flex items-center justify-center mt-2">
                        <Zap className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm text-blue-600">
                          {marketIntel.innovationIndex > 80 ? 'High' :
                           marketIntel.innovationIndex > 60 ? 'Medium' : 'Low'} Innovation
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Seasonal Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Seasonal Market Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {Object.entries(marketIntel.seasonalPatterns).map(([quarter, value]) => (
                      <div key={quarter} className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-lg font-bold text-saros-primary">{value}</p>
                        <p className="text-sm text-muted-foreground">{quarter.toUpperCase()}</p>
                        <div className="mt-2">
                          {value > 100 ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Emerging Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Emerging Market Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {marketIntel.emergingTrends.map((trend, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-saros-primary/10 flex items-center justify-center">
                          <Activity className="h-4 w-4 text-saros-primary" />
                        </div>
                        <span className="text-sm font-medium">{trend}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Market Sentiment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Sentiment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Sentiment</span>
                        <span className="text-sm font-bold">{marketIntel.userSentiment}%</span>
                      </div>
                      <Progress value={marketIntel.userSentiment} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        {marketIntel.userSentiment > 70 ? 'Positive market sentiment with growing confidence' :
                         marketIntel.userSentiment > 50 ? 'Neutral sentiment with mixed opinions' :
                         'Cautious sentiment with some concerns'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Barrier to Entry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Entry Difficulty</span>
                        <span className="text-sm font-bold">{marketIntel.barrierToEntry}%</span>
                      </div>
                      <Progress value={marketIntel.barrierToEntry} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        {marketIntel.barrierToEntry > 70 ? 'High barriers - established players dominate' :
                         marketIntel.barrierToEntry > 50 ? 'Medium barriers - opportunities exist' :
                         'Low barriers - new entrants welcome'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategic Positioning Tab */}
        <TabsContent value="positioning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Strategic Market Positioning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Position vs Target */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        Current Position
                      </h3>
                      <p className="text-3xl font-bold text-blue-600">4.2%</p>
                      <p className="text-sm text-muted-foreground mt-1">Market Share</p>
                      <Badge className="mt-2 bg-orange-100 text-orange-800">Follower</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                        Target Position
                      </h3>
                      <p className="text-3xl font-bold text-green-600">
                        {recommendation.targetMarketShare.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Market Share</p>
                      <Badge className="mt-2 bg-blue-100 text-blue-800">Challenger</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Strategic Gaps Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Strategic Gaps & Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-red-600 mb-3">Critical Gaps</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          Brand awareness (22% gap)
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          Liquidity depth (35% gap)
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          Trading pair variety (45% gap)
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-yellow-600 mb-3">Growth Opportunities</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                          <Target className="h-3 w-3 text-yellow-500" />
                          Advanced analytics adoption
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Target className="h-3 w-3 text-yellow-500" />
                          Mobile-first user experience
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Target className="h-3 w-3 text-yellow-500" />
                          Developer tool ecosystem
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-green-600 mb-3">Competitive Advantages</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Innovation velocity (+15%)
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Fee transparency (+20%)
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Technical architecture (+25%)
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Strategic Action Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-red-600 mb-2">Short-term (1-3 months)</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Implement AI fee recommendations</li>
                          <li>• Launch competitive analysis dashboard</li>
                          <li>• Optimize fee structure for market gaps</li>
                          <li>• Enhance user onboarding experience</li>
                        </ul>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-yellow-600 mb-2">Medium-term (3-6 months)</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Expand trading pair offerings</li>
                          <li>• Build strategic partnerships</li>
                          <li>• Develop mobile application</li>
                          <li>• Increase liquidity mining incentives</li>
                        </ul>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-green-600 mb-2">Long-term (6-12 months)</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Launch cross-chain capabilities</li>
                          <li>• Build institutional products</li>
                          <li>• Develop API ecosystem</li>
                          <li>• Scale to challenger position</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}