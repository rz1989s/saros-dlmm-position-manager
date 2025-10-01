'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  TrendingDown,
  Activity,
  Zap,
  Play
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function StressTestingPanel() {
  const { positions, loading } = useUserPositions()
  const [selectedScenario, setSelectedScenario] = useState<string>('market-crash-20')

  const totalValue = positions.reduce((sum, pos) => {
    const value = parseFloat(pos.liquidityAmount || '0') / 1e9 * 1000
    return sum + value
  }, 0)

  // Stress test scenarios
  const scenarios = [
    {
      id: 'market-crash-20',
      name: 'Market Crash -20%',
      description: 'Sudden 20% market decline across all assets',
      severity: 'medium',
      icon: TrendingDown,
      impact: {
        portfolioValue: totalValue * 0.80,
        ilIncrease: totalValue * 0.05,
        liquidityRisk: 35,
        expectedLoss: totalValue * 0.20,
        recovery: '7-14 days'
      }
    },
    {
      id: 'market-crash-50',
      name: 'Market Crash -50%',
      description: 'Severe market crash with 50% decline',
      severity: 'high',
      icon: TrendingDown,
      impact: {
        portfolioValue: totalValue * 0.50,
        ilIncrease: totalValue * 0.15,
        liquidityRisk: 70,
        expectedLoss: totalValue * 0.50,
        recovery: '30-60 days'
      }
    },
    {
      id: 'market-crash-80',
      name: 'Market Crash -80%',
      description: 'Catastrophic market collapse',
      severity: 'critical',
      icon: AlertTriangle,
      impact: {
        portfolioValue: totalValue * 0.20,
        ilIncrease: totalValue * 0.30,
        liquidityRisk: 95,
        expectedLoss: totalValue * 0.80,
        recovery: '90+ days'
      }
    },
    {
      id: 'volatility-spike',
      name: 'Volatility Spike',
      description: '3x increase in market volatility',
      severity: 'medium',
      icon: Activity,
      impact: {
        portfolioValue: totalValue * 0.92,
        ilIncrease: totalValue * 0.10,
        liquidityRisk: 45,
        expectedLoss: totalValue * 0.08,
        recovery: '3-7 days'
      }
    },
    {
      id: 'liquidity-crisis',
      name: 'Liquidity Crisis',
      description: 'Sudden liquidity drain from pools',
      severity: 'high',
      icon: Zap,
      impact: {
        portfolioValue: totalValue * 0.85,
        ilIncrease: totalValue * 0.08,
        liquidityRisk: 85,
        expectedLoss: totalValue * 0.15,
        recovery: '14-21 days'
      }
    }
  ]

  const selectedTest = scenarios.find(s => s.id === selectedScenario)!

  // Position-level stress test results
  const positionStressResults = positions.map((position) => {
    const poolName = `${position.tokenX?.symbol}/${position.tokenY?.symbol}`
    const value = parseFloat(position.liquidityAmount || '0') / 1e9 * 1000

    const multipliers = {
      'market-crash-20': 0.80,
      'market-crash-50': 0.50,
      'market-crash-80': 0.20,
      'volatility-spike': 0.92,
      'liquidity-crisis': 0.85
    }

    const multiplier = multipliers[selectedScenario as keyof typeof multipliers]
    const stressedValue = value * multiplier
    const loss = value - stressedValue
    const lossPercentage = ((loss / value) * 100)

    return {
      pool: poolName,
      currentValue: value,
      stressedValue,
      loss,
      lossPercentage,
      survivalRating: lossPercentage < 20 ? 'High' : lossPercentage < 50 ? 'Medium' : 'Low'
    }
  })

  // Comparative stress test results
  const comparativeResults = scenarios.map(scenario => {
    const multipliers = {
      'market-crash-20': 0.80,
      'market-crash-50': 0.50,
      'market-crash-80': 0.20,
      'volatility-spike': 0.92,
      'liquidity-crisis': 0.85
    }

    const multiplier = multipliers[scenario.id as keyof typeof multipliers]

    return {
      name: scenario.name.replace(/Market Crash |Volatility |Liquidity /, ''),
      loss: totalValue * (1 - multiplier),
      ilRisk: scenario.impact.ilIncrease,
      liquidityRisk: scenario.impact.liquidityRisk
    }
  })

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return 'text-red-600'
    if (severity === 'high') return 'text-orange-600'
    return 'text-yellow-600'
  }

  const getSeverityBgColor = (severity: string) => {
    if (severity === 'critical') return 'bg-red-100 border-red-300'
    if (severity === 'high') return 'bg-orange-100 border-orange-300'
    return 'bg-yellow-100 border-yellow-300'
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
      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
            Select Stress Test Scenario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scenarios.map((scenario) => {
              const Icon = scenario.icon
              const isSelected = selectedScenario === scenario.id

              return (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? `${getSeverityBgColor(scenario.severity)} border-current`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-5 w-5 ${isSelected ? getSeverityColor(scenario.severity) : 'text-gray-600'}`} />
                    <Badge variant={scenario.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                      {scenario.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="font-medium text-gray-900 mb-1">{scenario.name}</p>
                  <p className="text-xs text-gray-600">{scenario.description}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stress Test Results */}
      <Card className={`border-2 ${getSeverityBgColor(selectedTest.severity)}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <selectedTest.icon className={`h-5 w-5 ${getSeverityColor(selectedTest.severity)}`} />
            {selectedTest.name} - Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Portfolio Value</p>
              <p className="text-2xl font-bold text-red-600">
                ${selectedTest.impact.portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                from ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Expected Loss</p>
              <p className="text-2xl font-bold text-red-600">
                -${selectedTest.impact.expectedLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((selectedTest.impact.expectedLoss / totalValue) * 100).toFixed(1)}% decline
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">IL Increase</p>
              <p className="text-2xl font-bold text-orange-600">
                +${selectedTest.impact.ilIncrease.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">Additional IL risk</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Liquidity Risk</p>
              <p className="text-2xl font-bold text-orange-600">
                {selectedTest.impact.liquidityRisk}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Exit difficulty</p>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg p-4 border">
            <p className="text-sm font-medium text-gray-700 mb-2">Recovery Estimate</p>
            <p className="text-lg font-bold text-gray-900">{selectedTest.impact.recovery}</p>
            <p className="text-xs text-gray-600 mt-1">Expected time to recover to current value</p>
          </div>
        </CardContent>
      </Card>

      {/* Comparative Stress Test Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparative Scenario Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativeResults} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Legend />
                <Bar dataKey="loss" fill="#DC2626" name="Expected Loss ($)" />
                <Bar dataKey="ilRisk" fill="#F59E0B" name="IL Increase ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Position-Level Stress Results */}
      <Card>
        <CardHeader>
          <CardTitle>Position-Level Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {positionStressResults.map((result, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{result.pool}</p>
                    <p className="text-sm text-gray-600">
                      Current: ${result.currentValue.toFixed(2)} → Stressed: ${result.stressedValue.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant={result.lossPercentage > 50 ? 'destructive' : result.lossPercentage > 20 ? 'secondary' : 'outline'}>
                    {result.survivalRating} Survival
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Expected Loss</p>
                    <p className="text-lg font-bold text-red-600">
                      -${result.loss.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Loss Percentage</p>
                    <p className="text-lg font-bold text-red-600">
                      -{result.lossPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${result.lossPercentage > 50 ? 'bg-red-600' : result.lossPercentage > 20 ? 'bg-orange-600' : 'bg-yellow-600'}`}
                      style={{ width: `${result.lossPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Mitigation Actions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-4">
            Based on {selectedTest.name.toLowerCase()}, consider these risk mitigation strategies:
          </p>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-white" size="sm">
              Reduce position sizes in high-risk pools
            </Button>
            <Button variant="outline" className="w-full justify-start bg-white" size="sm">
              Add stablecoin pairs for portfolio stability
            </Button>
            <Button variant="outline" className="w-full justify-start bg-white" size="sm">
              Set up automated stop-loss triggers
            </Button>
            <Button variant="outline" className="w-full justify-start bg-white" size="sm">
              Increase liquidity buffer for quick exits
            </Button>
          </div>

          <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
            Apply Recommended Mitigations
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
