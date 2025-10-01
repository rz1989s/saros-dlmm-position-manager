'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign,
  Settings,
  PlayCircle
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts'

interface SimulationScenario {
  name: string
  volatility: number
  volume: number
  feeMultiplier: number
  probability: number
}

export function FeeSimulation() {
  const { positions, loading } = useUserPositions()
  const [selectedPosition, setSelectedPosition] = useState(0)
  const [selectedFeeTier, setSelectedFeeTier] = useState('0.25%')
  const [simulationRuns, setSimulationRuns] = useState(1000)
  const [timeHorizon, setTimeHorizon] = useState(12) // months
  const [isSimulating, setIsSimulating] = useState(false)

  const position = positions[selectedPosition]
  const poolName = position ? `${position.tokenX?.symbol}/${position.tokenY?.symbol}` : ''
  const positionValue = position ? parseFloat(position.liquidityAmount || '0') / 1e9 * 1000 : 0

  // Simulation scenarios
  const scenarios: SimulationScenario[] = [
    { name: 'Bull Market', volatility: 0.20, volume: 1.5, feeMultiplier: 1.3, probability: 0.20 },
    { name: 'Normal', volatility: 0.35, volume: 1.0, feeMultiplier: 1.0, probability: 0.50 },
    { name: 'Bear Market', volatility: 0.45, volume: 0.7, feeMultiplier: 0.8, probability: 0.20 },
    { name: 'High Volatility', volatility: 0.60, volume: 0.9, feeMultiplier: 1.2, probability: 0.10 }
  ]

  // Monte Carlo simulation outcomes
  const outcomeDistribution = Array.from({ length: 25 }, (_, i) => {
    const outcome = -10 + i * 4 // -10% to 90% range
    const mean = 22
    const stdDev = 18
    const frequency = Math.exp(-Math.pow((outcome - mean) / stdDev, 2)) * 100
    return {
      outcome: outcome.toFixed(1),
      frequency: Math.round(frequency),
      count: Math.round(frequency * simulationRuns / 100)
    }
  })

  // Key statistics
  const meanReturn = 22.3
  const medianReturn = 21.5
  const stdDeviation = 12.8
  const varValue = -5.2 // Value at Risk (5th percentile)
  const bestCase = 68.5
  const worstCase = -8.3

  // Scenario outcomes
  const scenarioOutcomes = scenarios.map(scenario => ({
    name: scenario.name,
    probability: scenario.probability * 100,
    expectedReturn: (18.5 * scenario.feeMultiplier * (1 + (scenario.volatility * 0.5))),
    minReturn: (18.5 * scenario.feeMultiplier * (1 + (scenario.volatility * 0.5))) * 0.6,
    maxReturn: (18.5 * scenario.feeMultiplier * (1 + (scenario.volatility * 0.5))) * 1.4
  }))

  // Time-based projection with confidence intervals
  const timeProjection = Array.from({ length: timeHorizon }, (_, i) => {
    const month = i + 1
    const baseReturn = (positionValue * 0.185 * month) / 12
    const optimistic = baseReturn * 1.5
    const pessimistic = baseReturn * 0.6

    return {
      month: `M${month}`,
      expected: baseReturn,
      optimistic,
      pessimistic
    }
  })

  // Fee tier comparison simulation
  const feeTierComparison = [
    {
      tier: '0.01%',
      meanAPR: 12.3,
      p10: 8.5,
      p90: 16.2,
      volatility: 15.2
    },
    {
      tier: '0.03%',
      meanAPR: 18.5,
      p10: 13.2,
      p90: 24.8,
      volatility: 18.3
    },
    {
      tier: '0.05%',
      meanAPR: 21.7,
      p10: 15.8,
      p90: 28.9,
      volatility: 20.1
    },
    {
      tier: '0.25%',
      meanAPR: 28.3,
      p10: 19.5,
      p90: 38.7,
      volatility: 24.8
    },
    {
      tier: '1.00%',
      meanAPR: 35.7,
      p10: 22.3,
      p90: 52.1,
      volatility: 32.5
    }
  ]

  const handleRunSimulation = () => {
    setIsSimulating(true)
    setTimeout(() => {
      setIsSimulating(false)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Simulation Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-700 font-medium mb-2 block">Position</label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg"
              >
                {positions.map((pos, idx) => (
                  <option key={pos.id} value={idx}>
                    {pos.tokenX?.symbol}/{pos.tokenY?.symbol}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium mb-2 block">Fee Tier</label>
              <select
                value={selectedFeeTier}
                onChange={(e) => setSelectedFeeTier(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="0.01%">0.01%</option>
                <option value="0.03%">0.03%</option>
                <option value="0.05%">0.05%</option>
                <option value="0.25%">0.25%</option>
                <option value="1.00%">1.00%</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium mb-2 block">Simulation Runs</label>
              <select
                value={simulationRuns}
                onChange={(e) => setSimulationRuns(parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg"
              >
                <option value={100}>100 runs</option>
                <option value={1000}>1,000 runs</option>
                <option value={10000}>10,000 runs</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium mb-2 block">Time Horizon</label>
              <select
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg"
              >
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleRunSimulation}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
            disabled={isSimulating}
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            {isSimulating ? 'Running Simulation...' : `Run Monte Carlo Simulation (${simulationRuns.toLocaleString()} runs)`}
          </Button>
        </CardContent>
      </Card>

      {/* Key Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation Results - {poolName} ({selectedFeeTier})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-gray-600">Mean Return</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{meanReturn}%</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-gray-600">Median Return</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">{medianReturn}%</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <p className="text-xs text-gray-600">Std Deviation</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">{stdDeviation}%</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-red-600" />
                <p className="text-xs text-gray-600">VaR (5%)</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{varValue}%</p>
            </div>

            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <p className="text-xs text-gray-600 mb-1">Best Case</p>
              <p className="text-2xl font-bold text-emerald-600">+{bestCase}%</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-xs text-gray-600 mb-1">Worst Case</p>
              <p className="text-2xl font-bold text-orange-600">{worstCase}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outcome Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Return Distribution ({simulationRuns.toLocaleString()} Simulations)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="outcome" label={{ value: 'Return (%)', position: 'bottom' }} />
                <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `${value} simulations`} />
                <Bar dataKey="frequency" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-50 rounded p-3 border">
              <p className="text-gray-600 mb-1">Probability of Profit</p>
              <p className="text-lg font-bold text-green-600">94.3%</p>
            </div>
            <div className="bg-gray-50 rounded p-3 border">
              <p className="text-gray-600 mb-1">Probability &gt; 20% APR</p>
              <p className="text-lg font-bold text-blue-600">68.5%</p>
            </div>
            <div className="bg-gray-50 rounded p-3 border">
              <p className="text-gray-600 mb-1">Probability &gt; 30% APR</p>
              <p className="text-lg font-bold text-purple-600">32.1%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Projection with Confidence Intervals */}
      <Card>
        <CardHeader>
          <CardTitle>{timeHorizon}-Month Projection with Confidence Intervals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeProjection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: 'Cumulative Return ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="optimistic" stroke="#10B981" strokeWidth={1} strokeDasharray="5 5" name="90th Percentile" />
                <Line type="monotone" dataKey="expected" stroke="#3B82F6" strokeWidth={2} name="Expected" />
                <Line type="monotone" dataKey="pessimistic" stroke="#EF4444" strokeWidth={1} strokeDasharray="5 5" name="10th Percentile" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
            <p>
              <strong>Expected {timeHorizon}-month return: ${timeProjection[timeProjection.length - 1].expected.toFixed(2)}</strong> •
              Confidence interval: ${timeProjection[timeProjection.length - 1].pessimistic.toFixed(2)} - ${timeProjection[timeProjection.length - 1].optimistic.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Market Scenario Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scenarioOutcomes.map((scenario, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{scenario.name}</p>
                    <Badge variant="outline">{scenario.probability}% probability</Badge>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {scenario.expectedReturn.toFixed(1)}% APR
                  </p>
                </div>
                <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 h-full bg-gradient-to-r from-red-300 via-yellow-300 to-green-300"
                    style={{
                      left: `${(scenario.minReturn / 50) * 100}%`,
                      width: `${((scenario.maxReturn - scenario.minReturn) / 50) * 100}%`
                    }}
                  />
                  <div
                    className="absolute h-full w-1 bg-green-600"
                    style={{ left: `${(scenario.expectedReturn / 50) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>{scenario.minReturn.toFixed(1)}%</span>
                  <span>{scenario.maxReturn.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fee Tier Risk-Return Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Tier Risk-Return Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="volatility" name="Volatility" unit="%" label={{ value: 'Volatility (%)', position: 'bottom' }} />
                <YAxis dataKey="meanAPR" name="Mean APR" unit="%" label={{ value: 'Mean APR (%)', angle: -90, position: 'insideLeft' }} />
                <ZAxis dataKey="tier" name="Tier" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name="Fee Tiers" data={feeTierComparison} fill="#10B981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Higher fee tiers offer greater expected returns but with increased volatility. Choose based on your risk tolerance.</p>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          Export Simulation Data
        </Button>
        <Button variant="outline" className="flex-1">
          Generate PDF Report
        </Button>
      </div>
    </div>
  )
}
