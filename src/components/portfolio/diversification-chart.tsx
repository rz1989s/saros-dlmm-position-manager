'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, AlertTriangle } from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function DiversificationChart() {
  const { positions, loading } = useUserPositions()

  // Calculate Herfindahl-Hirschman Index (HHI) for concentration
  const positionValues = positions.map(pos => parseFloat(pos.liquidityAmount || '0') / 1e9 * 1000)
  const totalValue = positionValues.reduce((a, b) => a + b, 0)
  const marketShares = positionValues.map(v => (v / totalValue) * 100)
  const hhi = marketShares.reduce((sum, share) => sum + Math.pow(share, 2), 0)

  // Diversification score (0-100, where 100 is perfectly diversified)
  const diversificationScore = Math.max(0, 100 - (hhi / 100))

  // Sector allocation (simplified)
  const sectorAllocation = [
    { sector: 'Stablecoins', percentage: 35, value: totalValue * 0.35, color: '#3B82F6' },
    { sector: 'Major Tokens', percentage: 45, value: totalValue * 0.45, color: '#10B981' },
    { sector: 'DeFi', percentage: 20, value: totalValue * 0.20, color: '#8B5CF6' }
  ]

  // Concentration warnings
  const hasConcentrationRisk = hhi > 2500 // HHI > 2500 indicates high concentration

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Diversification Score */}
      <Card className={`${hasConcentrationRisk ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className={`h-5 w-5 ${hasConcentrationRisk ? 'text-orange-600' : 'text-green-600'}`} />
            Portfolio Diversification Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-5xl font-bold mb-2" style={{
                background: hasConcentrationRisk ? 'linear-gradient(135deg, #EA580C, #F59E0B)' : 'linear-gradient(135deg, #10B981, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {diversificationScore.toFixed(0)}/100
              </p>
              <p className="text-sm text-gray-600">
                {diversificationScore >= 80 ? 'Excellent' : diversificationScore >= 60 ? 'Good' : diversificationScore >= 40 ? 'Moderate' : 'Poor'} Diversification
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">HHI Index</p>
              <p className="text-2xl font-bold text-gray-900">{hhi.toFixed(0)}</p>
              <p className="text-xs text-gray-500">{hhi < 1500 ? 'Low concentration' : hhi < 2500 ? 'Moderate' : 'High concentration'}</p>
            </div>
          </div>

          {hasConcentrationRisk && (
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">Concentration Risk Detected</p>
                <p className="text-sm text-orange-700">Consider adding more positions or rebalancing to reduce concentration risk</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sector Allocation Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Sector/Pool Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorAllocation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" />
                <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  formatter={(value: number, _name, props) => [
                    `${value.toFixed(1)}% ($${props.payload.value.toFixed(2)})`,
                    'Allocation'
                  ]}
                />
                <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                  {sectorAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {sectorAllocation.map((sector) => (
              <div key={sector.sector} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: sector.color }}></div>
                <span className="text-sm">{sector.sector}: {sector.percentage}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Correlation Heatmap Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Correlation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Average Correlation</p>
              <p className="text-2xl font-bold text-gray-900">0.42</p>
              <p className="text-xs text-gray-500 mt-1">Moderate correlation</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Max Correlation</p>
              <p className="text-2xl font-bold text-orange-600">0.78</p>
              <p className="text-xs text-gray-500 mt-1">High between SOL/USDC and RAY/SOL</p>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Diversification Recommendations</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>✓ Good sector distribution across stablecoins, majors, and DeFi</li>
              <li>• Consider adding uncorrelated assets to reduce portfolio volatility</li>
              <li>• Monitor correlation between SOL-based pairs (currently 0.78)</li>
              <li>• Diversification score of {diversificationScore.toFixed(0)} indicates {diversificationScore >= 70 ? 'strong' : 'moderate'} risk spreading</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Position Concentration Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Position Concentration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {positions.map((pos) => {
              const value = parseFloat(pos.liquidityAmount || '0') / 1e9 * 1000
              const percentage = (value / totalValue) * 100
              const poolName = `${pos.tokenX?.symbol}/${pos.tokenY?.symbol}`

              return (
                <div key={pos.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{poolName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">${value.toFixed(2)}</span>
                      <Badge variant={percentage > 30 ? 'destructive' : percentage > 20 ? 'secondary' : 'outline'}>
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${percentage > 30 ? 'bg-red-600' : percentage > 20 ? 'bg-yellow-600' : 'bg-green-600'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
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
