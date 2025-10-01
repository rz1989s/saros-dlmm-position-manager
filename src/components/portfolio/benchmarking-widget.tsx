'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Award } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function BenchmarkingWidget() {
  // Performance data (last 30 days)
  const performanceData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    portfolio: 100 + Math.random() * 15 + i * 0.5,
    solana: 100 + Math.random() * 10 + i * 0.3,
    defi: 100 + Math.random() * 12 + i * 0.4
  }))

  // Benchmark comparison metrics
  const benchmarks = [
    {
      name: 'Solana Ecosystem',
      return: '+12.4%',
      alpha: '+3.2%',
      beta: 1.15,
      outperformance: true
    },
    {
      name: 'DeFi Index',
      return: '+10.8%',
      alpha: '+4.8%',
      beta: 0.95,
      outperformance: true
    },
    {
      name: 'DLMM Average',
      return: '+11.5%',
      alpha: '+4.1%',
      beta: 1.05,
      outperformance: true
    }
  ]

  // Risk-adjusted returns
  const riskAdjustedMetrics = {
    portfolioReturn: 15.6,
    portfolioRisk: 8.3,
    sharpeRatio: 1.42,
    marketReturn: 12.4,
    marketRisk: 10.2,
    marketSharpe: 0.98,
    riskFreeRate: 4.5
  }

  return (
    <div className="space-y-6">
      {/* Performance vs Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Performance vs Market Indices (30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  label={{ value: 'Days', position: 'bottom' }}
                />
                <YAxis
                  label={{ value: 'Cumulative Return (Base 100)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Your Portfolio"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="solana"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Solana Ecosystem"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="defi"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="DeFi Index"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Benchmark Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Peer Comparison Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium text-gray-600">Benchmark</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-600">Return (30d)</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-600">Alpha</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-600">Beta</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((benchmark, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{benchmark.name}</td>
                    <td className="p-3 text-right">{benchmark.return}</td>
                    <td className="p-3 text-right text-green-600 font-medium">{benchmark.alpha}</td>
                    <td className="p-3 text-right">{benchmark.beta}</td>
                    <td className="p-3 text-right">
                      <Badge variant={benchmark.outperformance ? "default" : "secondary"} className={benchmark.outperformance ? "bg-green-100 text-green-700" : ""}>
                        {benchmark.outperformance ? 'Outperforming' : 'Underperforming'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <span className="font-medium">Excellent Performance:</span> Your portfolio is outperforming all major benchmarks with positive alpha across the board
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alpha/Beta Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Alpha & Beta Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Alpha Generation</h4>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Portfolio Alpha</p>
                  <p className="text-2xl font-bold text-green-600">+4.1%</p>
                  <p className="text-xs text-gray-500 mt-1">Excess return vs market</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Information Ratio</p>
                  <p className="text-2xl font-bold text-gray-900">0.87</p>
                  <p className="text-xs text-gray-500 mt-1">Alpha per unit of risk</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Market Sensitivity (Beta)</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Portfolio Beta</p>
                  <p className="text-2xl font-bold text-blue-600">1.05</p>
                  <p className="text-xs text-gray-500 mt-1">Slightly more volatile than market</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">R-Squared</p>
                  <p className="text-2xl font-bold text-gray-900">0.78</p>
                  <p className="text-xs text-gray-500 mt-1">78% explained by market</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk-Adjusted Returns */}
      <Card>
        <CardHeader>
          <CardTitle>Risk-Adjusted Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 border-2 border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Your Portfolio</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Return</p>
                  <p className="text-xl font-bold text-blue-600">{riskAdjustedMetrics.portfolioReturn}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Risk</p>
                  <p className="text-xl font-bold text-blue-600">{riskAdjustedMetrics.portfolioRisk}%</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-blue-600">{riskAdjustedMetrics.sharpeRatio}</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Market Benchmark</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Return</p>
                  <p className="text-xl font-bold text-gray-900">{riskAdjustedMetrics.marketReturn}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Risk</p>
                  <p className="text-xl font-bold text-gray-900">{riskAdjustedMetrics.marketRisk}%</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-gray-900">{riskAdjustedMetrics.marketSharpe}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Performance Summary</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Your Sharpe ratio ({riskAdjustedMetrics.sharpeRatio}) is {((riskAdjustedMetrics.sharpeRatio / riskAdjustedMetrics.marketSharpe - 1) * 100).toFixed(0)}% better than market ({riskAdjustedMetrics.marketSharpe})</li>
              <li>• Achieving {(riskAdjustedMetrics.portfolioReturn - riskAdjustedMetrics.marketReturn).toFixed(1)}% higher returns with {(riskAdjustedMetrics.marketRisk - riskAdjustedMetrics.portfolioRisk).toFixed(1)}% less risk</li>
              <li>• Consistent alpha generation across multiple benchmarks</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
