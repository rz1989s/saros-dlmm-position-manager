'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Clock,
  BarChart3,
  AlertTriangle
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts'

export function MigrationAnalysis() {
  const { positions, loading } = useUserPositions()
  const [selectedPosition, setSelectedPosition] = useState(0)

  const position = positions[selectedPosition]
  const poolName = position ? `${position.tokenX?.symbol}/${position.tokenY?.symbol}` : ''
  const positionValue = position ? parseFloat(position.liquidityAmount || '0') / 1e9 * 1000 : 0

  // Financial Analysis Data
  const currentAPR = 15.5
  const targetAPR = 28.3
  const migrationCost = 2.50
  const annualFeesCurrent = (positionValue * currentAPR) / 100
  const annualFeesTarget = (positionValue * targetAPR) / 100
  const annualGain = annualFeesTarget - annualFeesCurrent

  // NPV Calculation (3-year projection)
  const discountRate = 0.10 // 10% discount rate
  const npvCashFlows = Array.from({ length: 36 }, (_, i) => {
    const month = i + 1
    const monthlyCurrent = annualFeesCurrent / 12
    const monthlyTarget = annualFeesTarget / 12
    const cashFlow = monthlyTarget - monthlyCurrent
    const discountedCashFlow = cashFlow / Math.pow(1 + discountRate / 12, month)
    return {
      month,
      cashFlow,
      discountedCashFlow,
      cumulative: 0 // Will be calculated
    }
  })

  // Calculate cumulative
  let cumulative = -migrationCost
  npvCashFlows.forEach(flow => {
    cumulative += flow.discountedCashFlow
    flow.cumulative = cumulative
  })

  const npv = cumulative

  // IRR Calculation (simplified approximation)
  const irr = ((annualGain / migrationCost) * 100).toFixed(1)

  // Break-even calculation
  const breakEvenDays = Math.ceil((migrationCost / annualGain) * 365)

  // Scenario comparison
  const scenarios = [
    {
      name: 'Conservative',
      apr: 22.0,
      probability: 30,
      npv: npv * 0.7,
      gain: annualGain * 0.7
    },
    {
      name: 'Expected',
      apr: 28.3,
      probability: 50,
      npv: npv,
      gain: annualGain
    },
    {
      name: 'Optimistic',
      apr: 35.0,
      probability: 20,
      npv: npv * 1.4,
      gain: annualGain * 1.4
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Position Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Position for Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {positions.map((pos, idx) => {
              const name = `${pos.tokenX?.symbol}/${pos.tokenY?.symbol}`
              const value = parseFloat(pos.liquidityAmount || '0') / 1e9 * 1000

              return (
                <button
                  key={pos.id}
                  onClick={() => setSelectedPosition(idx)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    selectedPosition === idx
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{name}</p>
                  <p className="text-sm text-gray-600">${value.toFixed(2)}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* NPV/IRR Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-600" />
            Financial Analysis: {poolName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <p className="text-sm text-gray-600">Net Present Value</p>
              </div>
              <p className="text-3xl font-bold text-green-600">${npv.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">3-year projection</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-gray-600">Internal Rate of Return</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">{irr}%</p>
              <p className="text-xs text-gray-500 mt-1">Annual return</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <p className="text-sm text-gray-600">Break-Even Time</p>
              </div>
              <p className="text-3xl font-bold text-orange-600">{breakEvenDays}</p>
              <p className="text-xs text-gray-500 mt-1">days</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <p className="text-sm text-gray-600">Annual Gain</p>
              </div>
              <p className="text-3xl font-bold text-purple-600">${annualGain.toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-1">per year</p>
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-gray-600 mb-1">Migration Cost</p>
              <p className="text-lg font-bold text-red-600">${migrationCost.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-gray-600 mb-1">Current APR</p>
              <p className="text-lg font-bold text-gray-700">{currentAPR}%</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-gray-600 mb-1">Target APR</p>
              <p className="text-lg font-bold text-green-600">{targetAPR}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost-Benefit Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cost-Benefit Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Costs</span>
                <span className="text-sm font-bold text-red-600">${migrationCost.toFixed(2)}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between pl-4">
                  <span className="text-gray-600">Gas fees</span>
                  <span>$2.30</span>
                </div>
                <div className="flex items-center justify-between pl-4">
                  <span className="text-gray-600">Slippage (est.)</span>
                  <span>$0.20</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Benefits (Annual)</span>
                <span className="text-sm font-bold text-green-600">+${annualGain.toFixed(2)}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between pl-4">
                  <span className="text-gray-600">Increased fees</span>
                  <span>+${(annualFeesTarget - annualFeesCurrent).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pl-4">
                  <span className="text-gray-600">APR improvement</span>
                  <span>+{(targetAPR - currentAPR).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Net Benefit (First Year)</span>
                <span className="text-xl font-bold text-green-600">
                  +${(annualGain - migrationCost).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NPV Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle>NPV Cumulative Projection (3 Years)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={npvCashFlows} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Month', position: 'bottom' }} />
                <YAxis label={{ value: 'NPV ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="cumulative" stroke="#10B981" strokeWidth={2} name="Cumulative NPV" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-900">
              <strong>Break-even at month {Math.ceil(breakEvenDays / 30)}</strong> •
              Final NPV: ${npv.toFixed(2)} •
              Payback period: {breakEvenDays} days
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarios}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="npv" fill="#10B981" name="NPV ($)" />
                <Bar dataKey="gain" fill="#3B82F6" name="Annual Gain ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {scenarios.map((scenario) => (
              <div key={scenario.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{scenario.name}</p>
                  <Badge variant="outline">{scenario.probability}%</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">APR:</span>
                    <span className="font-medium">{scenario.apr}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">NPV:</span>
                    <span className="font-medium text-green-600">${scenario.npv.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual:</span>
                    <span className="font-medium">${scenario.gain.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Warnings */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Risk Considerations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• APR projections are estimates based on current market conditions</li>
            <li>• Gas costs may vary with network congestion</li>
            <li>• Pool liquidity and volume can affect actual returns</li>
            <li>• Price volatility may impact impermanent loss</li>
            <li>• Break-even analysis assumes stable market conditions</li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
          Proceed to Migration Wizard
        </Button>
        <Button variant="outline" className="flex-1">
          Export Analysis Report
        </Button>
      </div>
    </div>
  )
}
