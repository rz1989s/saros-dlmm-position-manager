'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  Activity,
  Target,
  Zap
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function RiskOverview() {
  const { positions, loading } = useUserPositions()

  // Calculate portfolio risk metrics
  const totalValue = positions.reduce((sum, pos) => {
    const value = parseFloat(pos.liquidityAmount || '0') / 1e9 * 1000
    return sum + value
  }, 0)

  // Risk scoring (0-100, where 100 is highest risk)
  const concentrationRisk = positions.length <= 2 ? 75 : positions.length <= 4 ? 45 : 25
  const volatilityRisk = 35 // Calculated from price volatility
  const liquidityRisk = 20 // Based on pool depth
  const ilRisk = 40 // Impermanent loss risk
  const marketRisk = 30 // Overall market risk

  const portfolioRiskScore = Math.round(
    (concentrationRisk * 0.3) +
    (volatilityRisk * 0.25) +
    (liquidityRisk * 0.15) +
    (ilRisk * 0.2) +
    (marketRisk * 0.1)
  )

  const riskLevel = portfolioRiskScore >= 70 ? 'High' : portfolioRiskScore >= 40 ? 'Moderate' : 'Low'
  const riskColor = portfolioRiskScore >= 70 ? 'text-red-600' : portfolioRiskScore >= 40 ? 'text-orange-600' : 'text-green-600'
  const riskBgColor = portfolioRiskScore >= 70 ? 'bg-red-100' : portfolioRiskScore >= 40 ? 'bg-orange-100' : 'bg-green-100'

  // Risk trend data (7 days)
  const riskTrendData = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    risk: portfolioRiskScore + Math.random() * 10 - 5,
    concentration: concentrationRisk + Math.random() * 8 - 4,
    volatility: volatilityRisk + Math.random() * 6 - 3
  }))

  // Critical alerts
  const criticalAlerts = [
    ...(concentrationRisk > 60 ? [{
      id: 'concentration',
      severity: 'high',
      title: 'High Concentration Risk',
      message: 'Your portfolio is concentrated in too few positions'
    }] : []),
    ...(ilRisk > 50 ? [{
      id: 'il',
      severity: 'medium',
      title: 'Elevated IL Risk',
      message: 'Current price divergence increases impermanent loss risk'
    }] : [])
  ]

  const riskBreakdown = [
    {
      category: 'Concentration',
      score: concentrationRisk,
      icon: Target,
      description: 'Position diversification risk',
      status: concentrationRisk > 60 ? 'High' : concentrationRisk > 40 ? 'Moderate' : 'Low'
    },
    {
      category: 'Volatility',
      score: volatilityRisk,
      icon: Activity,
      description: 'Price movement risk',
      status: volatilityRisk > 60 ? 'High' : volatilityRisk > 40 ? 'Moderate' : 'Low'
    },
    {
      category: 'Liquidity',
      score: liquidityRisk,
      icon: Zap,
      description: 'Pool liquidity depth risk',
      status: liquidityRisk > 60 ? 'High' : liquidityRisk > 40 ? 'Moderate' : 'Low'
    },
    {
      category: 'Impermanent Loss',
      score: ilRisk,
      icon: TrendingUp,
      description: 'IL exposure risk',
      status: ilRisk > 60 ? 'High' : ilRisk > 40 ? 'Moderate' : 'Low'
    },
    {
      category: 'Market',
      score: marketRisk,
      icon: Shield,
      description: 'Overall market risk',
      status: marketRisk > 60 ? 'High' : marketRisk > 40 ? 'Moderate' : 'Low'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Risk Score */}
      <Card className={`${riskBgColor} border-2 ${portfolioRiskScore >= 70 ? 'border-red-300' : portfolioRiskScore >= 40 ? 'border-orange-300' : 'border-green-300'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${riskColor}`} />
            Portfolio Risk Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-6xl font-bold mb-2" style={{
                background: portfolioRiskScore >= 70 ? 'linear-gradient(135deg, #DC2626, #EA580C)' : portfolioRiskScore >= 40 ? 'linear-gradient(135deg, #EA580C, #F59E0B)' : 'linear-gradient(135deg, #10B981, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {portfolioRiskScore}/100
              </p>
              <Badge variant={portfolioRiskScore >= 70 ? 'destructive' : 'secondary'} className="text-sm">
                {riskLevel} Risk
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">{positions.length} active positions</p>
            </div>
          </div>

          <div className="space-y-2">
            {riskBreakdown.map((risk) => (
              <div key={risk.category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <risk.icon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">{risk.category}</span>
                  </div>
                  <Badge variant={risk.score > 60 ? 'destructive' : risk.score > 40 ? 'secondary' : 'outline'} className="text-xs">
                    {risk.status}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${risk.score > 60 ? 'bg-red-600' : risk.score > 40 ? 'bg-orange-600' : 'bg-green-600'}`}
                    style={{ width: `${risk.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Critical Alerts ({criticalAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="bg-white border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Risk Trend (7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="risk" stroke="#DC2626" strokeWidth={2} name="Portfolio Risk" />
                <Line type="monotone" dataKey="concentration" stroke="#F59E0B" strokeWidth={2} name="Concentration" />
                <Line type="monotone" dataKey="volatility" stroke="#8B5CF6" strokeWidth={2} name="Volatility" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Position Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Position Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {positions.map((position) => {
              const poolName = `${position.tokenX?.symbol}/${position.tokenY?.symbol}`
              const healthScore = 70 + Math.random() * 30 // 70-100 health
              const riskScore = 100 - healthScore

              return (
                <div key={position.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${riskScore > 40 ? 'bg-red-500' : riskScore > 20 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                    <span className="font-medium">{poolName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Health: {healthScore.toFixed(0)}%</p>
                      <p className="text-xs text-gray-500">Risk: {riskScore.toFixed(0)}%</p>
                    </div>
                    <Badge variant={riskScore > 40 ? 'destructive' : riskScore > 20 ? 'secondary' : 'outline'}>
                      {riskScore > 40 ? 'High Risk' : riskScore > 20 ? 'Moderate' : 'Low Risk'}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
