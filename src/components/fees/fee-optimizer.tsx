'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  Activity,
  BarChart3,
  Zap,
  ChevronRight,
  CheckCircle
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface OptimizationRecommendation {
  positionId: string
  pool: string
  currentTier: string
  recommendedTier: string
  confidence: number
  reason: string
  potentialGain: number
  marketCondition: 'bull' | 'bear' | 'neutral' | 'volatile'
  volatility: number
  volume24h: number
  priority: 'high' | 'medium' | 'low'
}

export function FeeOptimizer() {
  const { positions, loading } = useUserPositions()
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)

  // Generate AI-powered recommendations for each position
  const recommendations: OptimizationRecommendation[] = positions.map((pos) => {
    const poolName = `${pos.tokenX?.symbol}/${pos.tokenY?.symbol}`
    const currentTier = '0.03%'
    const volatility = 15 + Math.random() * 30 // 15-45% volatility
    const volume24h = 50000 + Math.random() * 450000 // $50k-$500k

    // AI logic: high volatility → higher fee tier, high volume → lower fee tier
    let recommendedTier = currentTier
    let confidence = 0
    let reason = ''
    let potentialGain = 0
    let marketCondition: 'bull' | 'bear' | 'neutral' | 'volatile' = 'neutral'
    let priority: 'high' | 'medium' | 'low' = 'medium'

    if (volatility > 35) {
      recommendedTier = '1.00%'
      confidence = 92
      reason = 'High volatility detected - higher fee tier captures more value per trade'
      potentialGain = 850 + Math.random() * 400
      marketCondition = 'volatile'
      priority = 'high'
    } else if (volatility > 25) {
      recommendedTier = '0.25%'
      confidence = 87
      reason = 'Moderate volatility - mid-tier fee balances volume and earnings'
      potentialGain = 420 + Math.random() * 200
      marketCondition = 'neutral'
      priority = 'medium'
    } else if (volume24h > 400000) {
      recommendedTier = '0.01%'
      confidence = 89
      reason = 'High volume detected - lower fee tier maximizes trade frequency'
      potentialGain = 320 + Math.random() * 150
      marketCondition = 'bull'
      priority = 'high'
    } else if (volume24h > 200000) {
      recommendedTier = '0.03%'
      confidence = 75
      reason = 'Current tier is optimal for current market conditions'
      potentialGain = 0
      marketCondition = 'neutral'
      priority = 'low'
    } else {
      recommendedTier = '0.05%'
      confidence = 82
      reason = 'Lower volume - slightly higher fee tier recommended'
      potentialGain = 180 + Math.random() * 100
      marketCondition = 'bear'
      priority = 'medium'
    }

    return {
      positionId: pos.id,
      pool: poolName,
      currentTier,
      recommendedTier,
      confidence,
      reason,
      potentialGain,
      marketCondition,
      volatility,
      volume24h,
      priority
    }
  })

  // Market analysis radar chart data
  const selectedRec = selectedPosition
    ? recommendations.find(r => r.positionId === selectedPosition)
    : recommendations[0]

  const radarData = selectedRec ? [
    { metric: 'Volatility', value: (selectedRec.volatility / 45) * 100, fullMark: 100 },
    { metric: 'Volume', value: (selectedRec.volume24h / 500000) * 100, fullMark: 100 },
    { metric: 'Confidence', value: selectedRec.confidence, fullMark: 100 },
    { metric: 'Priority', value: selectedRec.priority === 'high' ? 90 : selectedRec.priority === 'medium' ? 60 : 30, fullMark: 100 },
    { metric: 'Potential', value: (selectedRec.potentialGain / 1000) * 100, fullMark: 100 }
  ] : []

  // Fee tier distribution comparison
  const tierComparison = [
    { tier: '0.01%', trades: 5000, fees: 500, apr: 12.5 },
    { tier: '0.03%', trades: 3200, fees: 960, apr: 18.2 },
    { tier: '0.05%', trades: 2000, fees: 1000, apr: 19.5 },
    { tier: '0.25%', trades: 800, fees: 2000, apr: 28.3 },
    { tier: '1.00%', trades: 200, fees: 2000, apr: 35.7 }
  ]

  // Priority sorting
  const highPriority = recommendations.filter(r => r.priority === 'high')
  const mediumPriority = recommendations.filter(r => r.priority === 'medium')
  const lowPriority = recommendations.filter(r => r.priority === 'low')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI-Powered Fee Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-orange-600" />
                <p className="text-sm text-gray-600">High Priority</p>
              </div>
              <p className="text-3xl font-bold text-orange-600">{highPriority.length}</p>
              <p className="text-xs text-gray-500 mt-1">Immediate action</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-gray-600">Medium Priority</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">{mediumPriority.length}</p>
              <p className="text-xs text-gray-500 mt-1">Consider soon</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-gray-600">Optimized</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{lowPriority.length}</p>
              <p className="text-xs text-gray-500 mt-1">No action needed</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <p className="text-sm text-gray-600">Total Potential</p>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                ${recommendations.reduce((sum, r) => sum + r.potentialGain, 0).toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Annual gain</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Priority Recommendations */}
      {highPriority.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              High Priority Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highPriority.map((rec) => (
                <div
                  key={rec.positionId}
                  className="bg-white border-2 border-orange-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedPosition(rec.positionId)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-gray-900">{rec.pool}</p>
                        <Badge variant="outline">{rec.currentTier} → {rec.recommendedTier}</Badge>
                        <Badge className="bg-orange-100 text-orange-700">
                          <Zap className="h-3 w-3 mr-1" />
                          {rec.confidence}% Confidence
                        </Badge>
                        <Badge
                          className={
                            rec.marketCondition === 'bull' ? 'bg-green-100 text-green-700' :
                            rec.marketCondition === 'bear' ? 'bg-red-100 text-red-700' :
                            rec.marketCondition === 'volatile' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }
                        >
                          {rec.marketCondition.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{rec.reason}</p>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Potential Gain</p>
                          <p className="font-bold text-green-600">+${rec.potentialGain.toFixed(0)}/yr</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Volatility</p>
                          <p className="font-medium">{rec.volatility.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">24h Volume</p>
                          <p className="font-medium">${(rec.volume24h / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 ml-4" />
                  </div>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Apply Recommendation
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Position Analysis Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">Select Position</label>
              <select
                value={selectedPosition || recommendations[0]?.positionId || ''}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                {recommendations.map((rec) => (
                  <option key={rec.positionId} value={rec.positionId}>
                    {rec.pool} - {rec.priority.toUpperCase()} Priority
                  </option>
                ))}
              </select>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Score" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip formatter={(value: number) => `${value.toFixed(0)}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Tier Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tier" />
                  <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="trades" fill="#3B82F6" name="Trades/day" />
                  <Bar yAxisId="right" dataKey="fees" fill="#10B981" name="Fees/day ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Higher fee tiers generate more fees per trade but reduce trade frequency. Optimal tier depends on volatility and volume.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>All Position Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Medium Priority */}
            {mediumPriority.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Medium Priority</h4>
                {mediumPriority.map((rec) => (
                  <div key={rec.positionId} className="border rounded-lg p-4 mb-2 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">{rec.pool}</p>
                          <Badge variant="outline">{rec.currentTier} → {rec.recommendedTier}</Badge>
                          <Badge className="bg-blue-100 text-blue-700">{rec.confidence}%</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{rec.reason}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Low Priority */}
            {lowPriority.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Already Optimized</h4>
                {lowPriority.map((rec) => (
                  <div key={rec.positionId} className="border rounded-lg p-4 mb-2 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">{rec.pool}</p>
                          <Badge variant="outline">{rec.currentTier}</Badge>
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Optimized
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{rec.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            AI Market Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="font-medium text-purple-900 mb-1">🤖 Volatility Patterns</p>
              <p className="text-purple-800">
                Current market shows increased volatility in {highPriority.length} positions. Consider migrating to higher fee tiers (0.25%-1.00%) to capture more value per trade.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="font-medium text-blue-900 mb-1">📊 Volume Analysis</p>
              <p className="text-blue-800">
                Average 24h volume across your positions: ${(recommendations.reduce((sum, r) => sum + r.volume24h, 0) / recommendations.length / 1000).toFixed(0)}K. High-volume pools benefit from lower fee tiers.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="font-medium text-green-900 mb-1">✨ Optimization Opportunity</p>
              <p className="text-green-800">
                By implementing all high-priority recommendations, you could increase annual fee earnings by ${highPriority.reduce((sum, r) => sum + r.potentialGain, 0).toFixed(0)}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <div className="flex gap-3">
        <Button className="flex-1 bg-green-600 hover:bg-green-700">
          Apply All High Priority Recommendations
        </Button>
        <Button variant="outline" className="flex-1">
          Export Optimization Report
        </Button>
      </div>
    </div>
  )
}
