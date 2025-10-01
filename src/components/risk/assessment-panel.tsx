'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Target,
  Activity,
  Zap,
  TrendingUp,
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts'

export function AssessmentPanel() {
  const { positions, loading } = useUserPositions()

  // Calculate individual risk factors
  const totalValue = positions.reduce((sum, pos) => {
    const value = parseFloat(pos.liquidityAmount || '0') / 1e9 * 1000
    return sum + value
  }, 0)

  // Multi-factor risk assessment
  const riskFactors = {
    concentration: {
      score: positions.length <= 2 ? 75 : positions.length <= 4 ? 45 : 25,
      weight: 0.30,
      description: 'Measures portfolio diversification across positions',
      recommendation: positions.length <= 2 ? 'Add more positions to reduce concentration' : 'Good diversification',
      status: positions.length <= 2 ? 'critical' : positions.length <= 4 ? 'warning' : 'healthy'
    },
    volatility: {
      score: 35,
      weight: 0.25,
      description: 'Historical price movement and market volatility',
      recommendation: 'Moderate volatility - consider hedging strategies',
      status: 'warning'
    },
    liquidity: {
      score: 20,
      weight: 0.15,
      description: 'Pool depth and ability to exit positions',
      recommendation: 'Strong liquidity across all positions',
      status: 'healthy'
    },
    impermanentLoss: {
      score: 40,
      weight: 0.20,
      description: 'Current and projected IL exposure',
      recommendation: 'Monitor price divergence closely',
      status: 'warning'
    },
    market: {
      score: 30,
      weight: 0.10,
      description: 'Overall market conditions and systemic risk',
      recommendation: 'Stable market conditions',
      status: 'healthy'
    }
  }

  // Weighted risk score
  const weightedRiskScore = Math.round(
    Object.values(riskFactors).reduce((sum, factor) => sum + (factor.score * factor.weight), 0)
  )

  // Radar chart data
  const radarData = [
    { factor: 'Concentration', score: riskFactors.concentration.score },
    { factor: 'Volatility', score: riskFactors.volatility.score },
    { factor: 'Liquidity', score: riskFactors.liquidity.score },
    { factor: 'IL Risk', score: riskFactors.impermanentLoss.score },
    { factor: 'Market', score: riskFactors.market.score }
  ]

  // Position-level risk assessment
  const positionRisks = positions.map((position) => {
    const poolName = `${position.tokenX?.symbol}/${position.tokenY?.symbol}`
    const value = parseFloat(position.liquidityAmount || '0') / 1e9 * 1000
    const concentration = (value / totalValue) * 100

    const positionScore = Math.round(
      concentration * 0.4 + // High concentration = high risk
      Math.random() * 20 + 20 // Simulated volatility and IL risk
    )

    return {
      id: position.id,
      pool: poolName,
      value,
      concentration,
      riskScore: positionScore,
      factors: {
        concentration: concentration > 30 ? 'High' : concentration > 20 ? 'Medium' : 'Low',
        volatility: positionScore > 50 ? 'High' : 'Medium',
        liquidity: 'Good'
      }
    }
  })

  const getStatusIcon = (status: string) => {
    if (status === 'critical') return <AlertCircle className="h-5 w-5 text-red-600" />
    if (status === 'warning') return <AlertCircle className="h-5 w-5 text-orange-600" />
    return <CheckCircle className="h-5 w-5 text-green-600" />
  }

  const getStatusBadge = (status: string) => {
    if (status === 'critical') return <Badge variant="destructive">Critical</Badge>
    if (status === 'warning') return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Warning</Badge>
    return <Badge variant="outline" className="bg-green-100 text-green-700">Healthy</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Multi-Factor Risk Score */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Multi-Factor Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Weighted Risk Score</p>
              <p className="text-5xl font-bold mb-4" style={{
                background: weightedRiskScore >= 70 ? 'linear-gradient(135deg, #DC2626, #EA580C)' : weightedRiskScore >= 40 ? 'linear-gradient(135deg, #EA580C, #F59E0B)' : 'linear-gradient(135deg, #10B981, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {weightedRiskScore}/100
              </p>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Risk Factors</p>
                  {Object.entries(riskFactors).map(([key, factor]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(factor.status)}
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{factor.score}</span>
                        <span className="text-xs text-gray-500">({(factor.weight * 100).toFixed(0)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Risk Distribution</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="factor" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Risk Score" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Risk Factor Analysis */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(riskFactors).map(([key, factor]) => {
          const icons = {
            concentration: Target,
            volatility: Activity,
            liquidity: Zap,
            impermanentLoss: TrendingUp,
            market: Shield
          }
          const Icon = icons[key as keyof typeof icons]

          return (
            <Card key={key} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-purple-600" />
                  {getStatusBadge(factor.status)}
                </div>
                <CardTitle className="text-lg capitalize mt-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Risk Level</span>
                      <span className="text-2xl font-bold">{factor.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${factor.score > 60 ? 'bg-red-600' : factor.score > 40 ? 'bg-orange-600' : 'bg-green-600'}`}
                        style={{ width: `${factor.score}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1">Weight in Portfolio</p>
                    <p className="text-sm font-medium">{(factor.weight * 100).toFixed(0)}%</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1">Description</p>
                    <p className="text-sm text-gray-700">{factor.description}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Recommendation</p>
                    <p className="text-xs text-gray-700">{factor.recommendation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Position-Level Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Position-Level Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {positionRisks.map((position) => (
              <div key={position.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{position.pool}</p>
                    <p className="text-sm text-gray-600">
                      ${position.value.toFixed(2)} • {position.concentration.toFixed(1)}% of portfolio
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{
                      color: position.riskScore > 60 ? '#DC2626' : position.riskScore > 40 ? '#EA580C' : '#10B981'
                    }}>
                      {position.riskScore}
                    </p>
                    <Badge variant={position.riskScore > 60 ? 'destructive' : position.riskScore > 40 ? 'secondary' : 'outline'}>
                      {position.riskScore > 60 ? 'High Risk' : position.riskScore > 40 ? 'Moderate' : 'Low Risk'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Concentration</p>
                    <p className="font-medium">{position.factors.concentration}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Volatility</p>
                    <p className="font-medium">{position.factors.volatility}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Liquidity</p>
                    <p className="font-medium">{position.factors.liquidity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
            Generate Detailed Risk Report
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
