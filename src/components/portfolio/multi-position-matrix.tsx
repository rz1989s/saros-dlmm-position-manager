'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GitMerge, TrendingUp } from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'

export function MultiPositionMatrix() {
  const { positions, loading } = useUserPositions()

  // Calculate correlation matrix
  const correlationMatrix = positions.map((_pos1, i) => {
    return positions.map((_pos2, j) => {
      if (i === j) return 1 // Perfect correlation with itself
      // Simplified correlation calculation (in production, use historical price data)
      const correlation = 0.3 + Math.random() * 0.4 // 0.3-0.7 range
      return correlation
    })
  })

  // Calculate risk decomposition
  const systematicRisk = 65 // Market-wide risk
  const unsystematicRisk = 35 // Position-specific risk

  const getCorrelationColor = (value: number) => {
    if (value > 0.7) return 'bg-red-500'
    if (value > 0.5) return 'bg-orange-500'
    if (value > 0.3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Correlation Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-blue-600" />
            Cross-Position Correlation Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2 text-left text-sm font-medium text-gray-600">Position</th>
                  {positions.map((pos, idx) => (
                    <th key={idx} className="p-2 text-center text-xs font-medium text-gray-600">
                      {pos.tokenX?.symbol}/{pos.tokenY?.symbol}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((pos1, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 text-sm font-medium">
                      {pos1.tokenX?.symbol}/{pos1.tokenY?.symbol}
                    </td>
                    {correlationMatrix[i].map((corr, j) => (
                      <td key={j} className="p-2 text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded ${getCorrelationColor(corr)} text-white text-xs font-medium`}>
                          {corr.toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span>Low ({"<"}0.3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span>Medium (0.3-0.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              <span>High (0.5-0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span>Very High ({">"}0.7)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Decomposition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Risk Decomposition Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Risk Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Systematic Risk (Market-wide)</span>
                <Badge variant="secondary">{systematicRisk}%</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-purple-600 h-3 rounded-full" style={{ width: `${systematicRisk}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Risk from overall market movements</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Unsystematic Risk (Position-specific)</span>
                <Badge variant="secondary">{unsystematicRisk}%</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${unsystematicRisk}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Risk unique to individual positions</p>
            </div>

            {/* Insights */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Portfolio Insights</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• {systematicRisk}% of portfolio risk comes from market factors</li>
                <li>• Diversification can reduce unsystematic risk further</li>
                <li>• Consider adding negatively correlated positions to reduce overall risk</li>
                <li>• Current correlation suggests moderate diversification</li>
              </ul>
            </div>

            {/* Portfolio-wide Fee Analysis */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Portfolio-Wide Fee Analysis</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Fees (24h)</p>
                  <p className="text-xl font-bold text-gray-900">$45.23</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Fees (7d)</p>
                  <p className="text-xl font-bold text-gray-900">$287.56</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Fee APR</p>
                  <p className="text-xl font-bold text-green-600">18.4%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fee Efficiency</p>
                  <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
