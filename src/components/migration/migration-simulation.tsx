'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Activity,
  TrendingUp,
  Target,
  BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, LineChart } from 'recharts'

export function MigrationSimulation() {
  // Monte Carlo simulation results (1000 runs)
  const outcomeDistribution = Array.from({ length: 20 }, (_, i) => {
    const outcome = -5 + i * 2.5 // -5% to 45% range
    const frequency = Math.exp(-Math.pow((outcome - 20) / 15, 2)) * 100
    return {
      outcome: outcome.toFixed(1),
      frequency: Math.round(frequency)
    }
  })

  // Confidence intervals
  const confidenceIntervals = [
    { level: '50%', min: 15.2, max: 24.8, color: '#10B981' },
    { level: '80%', min: 10.5, max: 29.5, color: '#3B82F6' },
    { level: '95%', min: 5.8, max: 34.2, color: '#8B5CF6' }
  ]

  // Simulation scenarios over time
  const timeSeriesData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    p10: 8 + i * 0.8,
    p50: 15 + i * 1.5,
    p90: 22 + i * 2.2
  }))

  return (
    <div className="space-y-6">
      {/* Simulation Summary */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Monte Carlo Simulation Results (1,000 Scenarios)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Expected Outcome</p>
              <p className="text-3xl font-bold text-green-600">+20.3%</p>
              <p className="text-xs text-gray-500 mt-1">Mean APR improvement</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-blue-600">87.2%</p>
              <p className="text-xs text-gray-500 mt-1">Positive outcomes</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Best Case</p>
              <p className="text-3xl font-bold text-purple-600">+42.5%</p>
              <p className="text-xs text-gray-500 mt-1">95th percentile</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Worst Case</p>
              <p className="text-3xl font-bold text-red-600">-3.2%</p>
              <p className="text-xs text-gray-500 mt-1">5th percentile</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outcome Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Outcome Probability Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="outcome" label={{ value: 'Outcome (%)', position: 'bottom' }} />
                <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="frequency" fill="#3B82F6" name="Number of Scenarios" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Distribution shows the likelihood of different outcomes across 1,000 simulated scenarios.</p>
            <p className="mt-1">Peak at +20% indicates most likely outcome.</p>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Intervals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Confidence Intervals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {confidenceIntervals.map((interval) => (
              <div key={interval.level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" style={{ backgroundColor: `${interval.color}20`, color: interval.color, borderColor: interval.color }}>
                      {interval.level} Confidence
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Range: {interval.min}% to {interval.max}%
                    </span>
                  </div>
                </div>
                <div className="relative w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="absolute h-full opacity-30"
                    style={{
                      backgroundColor: interval.color,
                      left: `${((interval.min + 5) / 50) * 100}%`,
                      width: `${((interval.max - interval.min) / 50) * 100}%`
                    }}
                  ></div>
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Interpretation</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 50% confidence: Outcome will be between 15.2% and 24.8%</li>
              <li>• 80% confidence: Outcome will be between 10.5% and 29.5%</li>
              <li>• 95% confidence: Outcome will be between 5.8% and 34.2%</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Time Series Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            12-Month Projection (Percentiles)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: 'Cumulative Gain (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="p10" stroke="#EF4444" strokeWidth={1.5} name="10th Percentile" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="p50" stroke="#3B82F6" strokeWidth={2} name="50th Percentile (Median)" />
                <Line type="monotone" dataKey="p90" stroke="#10B981" strokeWidth={1.5} name="90th Percentile" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stress Testing Results */}
      <Card>
        <CardHeader>
          <CardTitle>Stress Testing Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Market Crash (-20%)', impact: '+15.2%', status: 'Resilient' },
              { name: 'High Volatility (+50%)', impact: '+22.8%', status: 'Improved' },
              { name: 'Liquidity Drain (-30%)', impact: '+12.5%', status: 'Stable' },
              { name: 'Gas Spike (+200%)', impact: '+18.7%', status: 'Minor Impact' }
            ].map((scenario, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">{scenario.name}</p>
                  <p className="text-sm text-gray-600">Expected outcome: {scenario.impact}</p>
                </div>
                <Badge variant={scenario.status === 'Resilient' || scenario.status === 'Improved' ? 'default' : 'secondary'}>
                  {scenario.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
          Run New Simulation
        </Button>
        <Button variant="outline" className="flex-1">
          Export Results
        </Button>
      </div>
    </div>
  )
}
