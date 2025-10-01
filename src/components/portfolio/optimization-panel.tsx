'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp } from 'lucide-react'
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ScatterChart, ZAxis } from 'recharts'

export function OptimizationPanel() {
  // Efficient frontier data (risk vs return)
  const efficientFrontier = Array.from({ length: 50 }, (_, i) => {
    const risk = (i + 1) * 0.5 // 0.5% to 25% risk
    const return_ = Math.sqrt(risk) * 8 + Math.random() * 2 // Diminishing returns curve
    return { risk, return: return_ }
  })

  // Current portfolio and optimal portfolio points
  const portfolioPoints = [
    { risk: 8.3, return: 15.8, name: 'Current Portfolio', fill: '#3B82F6' },
    { risk: 6.2, return: 16.5, name: 'Optimal Portfolio', fill: '#10B981' }
  ]

  // Rebalancing recommendations
  const recommendations = [
    { pool: 'SOL/USDC', action: 'Increase', amount: '+$500', reason: 'High Sharpe ratio, low correlation' },
    { pool: 'RAY/SOL', action: 'Decrease', amount: '-$300', reason: 'High correlation with existing positions' },
    { pool: 'ORCA/USDC', action: 'Maintain', amount: '$0', reason: 'Optimal allocation' }
  ]

  return (
    <div className="space-y-6">
      {/* Optimization Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Portfolio Optimization Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Potential Return Improvement</p>
              <p className="text-2xl font-bold text-green-600">+0.7%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Risk Reduction</p>
              <p className="text-2xl font-bold text-green-600">-2.1%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Improved Sharpe Ratio</p>
              <p className="text-2xl font-bold text-green-600">1.42 → 1.68</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Efficient Frontier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Efficient Frontier Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="risk"
                  name="Risk (%)"
                  label={{ value: 'Risk (Volatility %)', position: 'bottom' }}
                />
                <YAxis
                  type="number"
                  dataKey="return"
                  name="Return (%)"
                  label={{ value: 'Expected Return (%)', angle: -90, position: 'left' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value: number) => value.toFixed(2) + '%'}
                />

                {/* Efficient Frontier Line */}
                <Line
                  data={efficientFrontier}
                  type="monotone"
                  dataKey="return"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={false}
                />

                {/* Portfolio Points */}
                <Scatter
                  data={portfolioPoints}
                  fill="#8884d8"
                >
                  <ZAxis type="number" range={[100, 200]} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-600"></div>
              <span>Current Portfolio (Risk: 8.3%, Return: 15.8%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-600"></div>
              <span>Optimal Portfolio (Risk: 6.2%, Return: 16.5%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rebalancing Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Rebalancing Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{rec.pool}</span>
                    <Badge variant={rec.action === 'Increase' ? 'default' : rec.action === 'Decrease' ? 'destructive' : 'secondary'}>
                      {rec.action}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{rec.reason}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${rec.action === 'Increase' ? 'text-green-600' : rec.action === 'Decrease' ? 'text-red-600' : 'text-gray-600'}`}>
                    {rec.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
            Apply Optimization
          </Button>
        </CardContent>
      </Card>

      {/* Risk-Adjusted Return Calculations */}
      <Card>
        <CardHeader>
          <CardTitle>Risk-Adjusted Return Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Sharpe Ratio</p>
              <p className="text-2xl font-bold text-gray-900">1.42</p>
              <p className="text-xs text-gray-500 mt-1">Excellent risk-adjusted returns</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Sortino Ratio</p>
              <p className="text-2xl font-bold text-gray-900">1.89</p>
              <p className="text-xs text-gray-500 mt-1">Strong downside protection</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Calmar Ratio</p>
              <p className="text-2xl font-bold text-gray-900">1.90</p>
              <p className="text-xs text-gray-500 mt-1">Return vs max drawdown</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Information Ratio</p>
              <p className="text-2xl font-bold text-gray-900">0.87</p>
              <p className="text-xs text-gray-500 mt-1">Alpha generation efficiency</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
