'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  Activity,
  DollarSign,
  Users,
  BarChart3,
  Zap,
  Globe
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

interface PoolIntelligence {
  pool: string
  tier: string
  volume24h: number
  volumeChange: number
  tvl: number
  tvlChange: number
  feeAPR: number
  trades24h: number
  avgTradeSize: number
  competitiveness: number
}

export function MarketIntelligence() {
  // Market-wide intelligence data
  const poolIntelligence: PoolIntelligence[] = [
    {
      pool: 'SOL/USDC',
      tier: '0.03%',
      volume24h: 2850000,
      volumeChange: 12.5,
      tvl: 8500000,
      tvlChange: 8.3,
      feeAPR: 18.5,
      trades24h: 3240,
      avgTradeSize: 879,
      competitiveness: 92
    },
    {
      pool: 'SOL/USDT',
      tier: '0.25%',
      volume24h: 1920000,
      volumeChange: -3.2,
      tvl: 5200000,
      tvlChange: 2.1,
      feeAPR: 28.3,
      trades24h: 1850,
      avgTradeSize: 1038,
      competitiveness: 85
    },
    {
      pool: 'RAY/SOL',
      tier: '1.00%',
      volume24h: 850000,
      volumeChange: 24.8,
      tvl: 2100000,
      tvlChange: 15.6,
      feeAPR: 35.7,
      trades24h: 920,
      avgTradeSize: 924,
      competitiveness: 78
    },
    {
      pool: 'ORCA/USDC',
      tier: '0.05%',
      volume24h: 720000,
      volumeChange: 5.4,
      tvl: 1800000,
      tvlChange: 3.2,
      feeAPR: 21.7,
      trades24h: 1120,
      avgTradeSize: 643,
      competitiveness: 88
    }
  ]

  // Market trends (7 days)
  const marketTrends = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    totalVolume: 5000000 + (Math.random() - 0.5) * 1000000,
    totalTVL: 18000000 + (Math.random() - 0.5) * 2000000,
    avgAPR: 22 + (Math.random() - 0.5) * 5,
    totalTrades: 6000 + Math.random() * 2000
  }))

  // Fee tier market share
  const tierMarketShare = [
    { tier: '0.01%', volume: 12, tvl: 15, pools: 8 },
    { tier: '0.03%', volume: 42, tvl: 38, pools: 25 },
    { tier: '0.05%', volume: 18, tvl: 20, pools: 12 },
    { tier: '0.25%', volume: 20, tvl: 18, pools: 9 },
    { tier: '1.00%', volume: 8, tvl: 9, pools: 6 }
  ]

  // Competitive positioning radar
  const competitiveMetrics = [
    { metric: 'Volume', yourPosition: 75, marketLeader: 95, marketAvg: 60 },
    { metric: 'APR', yourPosition: 82, marketLeader: 90, marketAvg: 65 },
    { metric: 'Liquidity', yourPosition: 68, marketLeader: 98, marketAvg: 55 },
    { metric: 'Efficiency', yourPosition: 88, marketLeader: 92, marketAvg: 70 },
    { metric: 'Stability', yourPosition: 79, marketLeader: 85, marketAvg: 72 }
  ]

  // Market sentiment indicators
  const sentimentScore = 7.8 // out of 10
  const marketPhase = 'Growth'
  const volatilityIndex = 28.5
  const liquidityHealth = 'Strong'

  // Top performing pools
  const topPerformers = [
    { pool: 'SOL/USDC', tier: '0.03%', apr: 24.5, growth: '+18.2%' },
    { pool: 'RAY/SOL', tier: '1.00%', apr: 38.2, growth: '+24.8%' },
    { pool: 'ORCA/USDC', tier: '0.05%', apr: 22.8, growth: '+12.3%' }
  ]

  // Emerging opportunities
  const emergingOpportunities = [
    {
      pool: 'BONK/SOL',
      reason: 'Volume surged 180% in 24h',
      apr: 42.3,
      risk: 'High',
      timing: 'Immediate'
    },
    {
      pool: 'JUP/USDC',
      reason: 'New listing with strong fundamentals',
      apr: 35.8,
      risk: 'Medium',
      timing: '1-2 days'
    },
    {
      pool: 'PYTH/SOL',
      reason: 'Increased institutional interest',
      apr: 28.5,
      risk: 'Low',
      timing: '3-5 days'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            DLMM Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <p className="text-sm text-gray-600">Total 24h Volume</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">$6.34M</p>
              <p className="text-sm text-green-600 mt-1">↑ 12.5% from yesterday</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-gray-600">Total TVL</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">$17.6M</p>
              <p className="text-sm text-blue-600 mt-1">↑ 7.3% this week</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <p className="text-sm text-gray-600">Avg Fee APR</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">23.2%</p>
              <p className="text-sm text-gray-600 mt-1">Across all pools</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-orange-600" />
                <p className="text-sm text-gray-600">Active Pools</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">60</p>
              <p className="text-sm text-orange-600 mt-1">↑ 5 new this week</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-gray-600 mb-1">Market Sentiment</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: `${sentimentScore * 10}%` }} />
                </div>
                <p className="text-sm font-bold text-green-600">{sentimentScore}/10</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-gray-600 mb-1">Market Phase</p>
              <Badge className="bg-green-100 text-green-700">{marketPhase}</Badge>
            </div>

            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-gray-600 mb-1">Volatility Index</p>
              <p className="text-sm font-bold">{volatilityIndex}%</p>
            </div>

            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-gray-600 mb-1">Liquidity Health</p>
              <Badge className="bg-blue-100 text-blue-700">{liquidityHealth}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Trends */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>7-Day Market Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="totalVolume" stroke="#3B82F6" strokeWidth={2} name="Volume ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="avgAPR" stroke="#10B981" strokeWidth={2} name="Avg APR (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Tier Market Share</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierMarketShare}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tier" />
                  <YAxis label={{ value: 'Share (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="volume" fill="#3B82F6" name="Volume Share" />
                  <Bar dataKey="tvl" fill="#10B981" name="TVL Share" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pool Intelligence */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pools Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {poolIntelligence.map((pool, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-lg">{pool.pool}</p>
                    <Badge variant="outline">{pool.tier}</Badge>
                    <Badge
                      className={pool.competitiveness >= 90 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                    >
                      {pool.competitiveness}/100
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{pool.feeAPR}% APR</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">24h Volume</p>
                    <p className="font-bold">${(pool.volume24h / 1000000).toFixed(2)}M</p>
                    <p className={`text-xs ${pool.volumeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {pool.volumeChange > 0 ? '↑' : '↓'} {Math.abs(pool.volumeChange)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 mb-1">TVL</p>
                    <p className="font-bold">${(pool.tvl / 1000000).toFixed(2)}M</p>
                    <p className={`text-xs ${pool.tvlChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {pool.tvlChange > 0 ? '↑' : '↓'} {Math.abs(pool.tvlChange)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 mb-1">24h Trades</p>
                    <p className="font-bold">{pool.trades24h.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">trades</p>
                  </div>

                  <div>
                    <p className="text-gray-600 mb-1">Avg Trade Size</p>
                    <p className="font-bold">${pool.avgTradeSize.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">per trade</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Positioning */}
      <Card>
        <CardHeader>
          <CardTitle>Your Competitive Positioning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={competitiveMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Your Position" dataKey="yourPosition" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Radar name="Market Leader" dataKey="marketLeader" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                <Radar name="Market Average" dataKey="marketAvg" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.2} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Compare your portfolio's performance against market leaders and averages across key metrics.</p>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Performers (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((performer, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{performer.pool}</p>
                      <Badge variant="outline">{performer.tier}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">APR: {performer.apr}%</p>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {performer.growth}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Emerging Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emergingOpportunities.map((opp, idx) => (
                <div key={idx} className="border rounded-lg p-3 bg-yellow-50 border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{opp.pool}</p>
                    <Badge className={
                      opp.risk === 'High' ? 'bg-red-100 text-red-700' :
                      opp.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }>
                      {opp.risk} Risk
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{opp.reason}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 font-medium">{opp.apr}% APR</span>
                    <span className="text-gray-600">Timing: {opp.timing}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            AI Market Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="font-medium text-green-900 mb-1">📈 Market Momentum</p>
              <p className="text-green-800">
                Overall market showing strong growth with 12.5% volume increase. 0.03% tier capturing majority of volume at 42% market share.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="font-medium text-blue-900 mb-1">💡 Optimization Opportunity</p>
              <p className="text-blue-800">
                Consider diversifying into 0.25% tier pools. They're showing 20% market share with competitive APRs averaging 28.3%.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="font-medium text-yellow-900 mb-1">⚠️ Market Watch</p>
              <p className="text-yellow-800">
                Volatility index at 28.5% - slightly elevated. Higher fee tiers (0.25%-1.00%) may capture more value in current conditions.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="font-medium text-purple-900 mb-1">🎯 Strategic Recommendation</p>
              <p className="text-purple-800">
                Your competitive positioning is strong at 82/100. Focus on maintaining volume leadership while exploring emerging high-APR opportunities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
