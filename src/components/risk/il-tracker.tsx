'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TrendingDown,
  DollarSign,
  TrendingUp,
  Activity,
  AlertTriangle
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts'

export function ILTracker() {
  const { positions, loading } = useUserPositions()

  // Calculate IL for each position
  const positionsWithIL = positions.map((position) => {
    const poolName = `${position.tokenX?.symbol}/${position.tokenY?.symbol}`
    const value = parseFloat(position.liquidityAmount || '0') / 1e9 * 1000

    // Simulate IL calculation (in production, use actual initial prices and current prices)
    const priceChange = -5 + Math.random() * 15 // -5% to +10% price divergence
    const ilPercentage = -1 * Math.pow(priceChange / 100, 2) * 100 // Simplified IL formula
    const ilValue = (value * Math.abs(ilPercentage)) / 100

    // Calculate fees earned
    const feesX = parseFloat(position.feesEarned?.tokenX || '0') / Math.pow(10, position.tokenX?.decimals || 9)
    const feesY = parseFloat(position.feesEarned?.tokenY || '0') / Math.pow(10, position.tokenY?.decimals || 9)
    const totalFees = (feesX * (position.tokenX?.price || 0)) + (feesY * (position.tokenY?.price || 0))

    // Net P&L (Fees - IL)
    const netPnL = totalFees - ilValue

    // Historical IL trend (30 days)
    const ilTrend = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      il: ilValue * (0.3 + (i / 30) * 0.7), // Gradual IL accumulation
      fees: totalFees * (i / 30), // Linear fee accumulation
      net: (totalFees * (i / 30)) - (ilValue * (0.3 + (i / 30) * 0.7))
    }))

    // Recovery scenarios
    const recoveryScenarios = [
      {
        scenario: 'Price Returns to Initial',
        timeframe: '7-14 days',
        probability: 45,
        expectedIL: 0,
        outcome: 'Full IL recovery'
      },
      {
        scenario: 'Fees Offset IL',
        timeframe: '30-45 days',
        probability: 70,
        expectedIL: ilValue * 0.3,
        outcome: 'Positive net P&L'
      },
      {
        scenario: 'Price Diverges Further',
        timeframe: 'Ongoing',
        probability: 25,
        expectedIL: ilValue * 1.5,
        outcome: 'Increased IL risk'
      }
    ]

    return {
      id: position.id,
      pool: poolName,
      value,
      ilPercentage,
      ilValue,
      totalFees,
      netPnL,
      priceChange,
      ilTrend,
      recoveryScenarios
    }
  })

  // Portfolio-wide IL metrics
  const totalIL = positionsWithIL.reduce((sum, pos) => sum + pos.ilValue, 0)
  const totalFees = positionsWithIL.reduce((sum, pos) => sum + pos.totalFees, 0)
  const totalNetPnL = totalFees - totalIL
  const ilCoverage = totalIL > 0 ? (totalFees / totalIL) * 100 : 0

  // Aggregate IL trend
  const aggregateILTrend = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    il: totalIL * (0.3 + (i / 30) * 0.7),
    fees: totalFees * (i / 30),
    net: (totalFees * (i / 30)) - (totalIL * (0.3 + (i / 30) * 0.7))
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio IL Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <Badge variant="destructive">IL</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Impermanent Loss</p>
            <p className="text-2xl font-bold text-red-600">
              -${totalIL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-700">Fees</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Fees Earned</p>
            <p className="text-2xl font-bold text-green-600">
              +${totalFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${totalNetPnL >= 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                <TrendingUp className={`h-6 w-6 ${totalNetPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <Badge variant={totalNetPnL >= 0 ? 'default' : 'destructive'}>
                {totalNetPnL >= 0 ? 'Positive' : 'Negative'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Net P&L (Fees - IL)</p>
            <p className={`text-2xl font-bold ${totalNetPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalNetPnL >= 0 ? '+' : ''}${totalNetPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="secondary">{ilCoverage >= 100 ? 'Full' : 'Partial'}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">IL Coverage Ratio</p>
            <p className="text-2xl font-bold text-blue-600">
              {ilCoverage.toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* IL vs Fees Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            IL vs Fees Trend (30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aggregateILTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Legend />
                <Area type="monotone" dataKey="fees" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Fees Earned" />
                <Area type="monotone" dataKey="il" stackId="2" stroke="#DC2626" fill="#DC2626" fillOpacity={0.6} name="Impermanent Loss" />
                <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={2} name="Net P&L" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">Analysis</p>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• {ilCoverage >= 100 ? 'Fees have fully offset impermanent loss' : `Fees cover ${ilCoverage.toFixed(0)}% of impermanent loss`}</li>
              <li>• {totalNetPnL >= 0 ? `Net positive P&L of $${totalNetPnL.toFixed(2)}` : `Net negative P&L of $${Math.abs(totalNetPnL).toFixed(2)}`}</li>
              <li>• Continue monitoring price divergence and fee accrual rate</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Position-Level IL Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Position-Level IL Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positionsWithIL.map((position) => (
              <div key={position.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-gray-900 text-lg">{position.pool}</p>
                    <p className="text-sm text-gray-600">
                      Position Value: ${position.value.toFixed(2)} • Price Change: {position.priceChange >= 0 ? '+' : ''}{position.priceChange.toFixed(2)}%
                    </p>
                  </div>
                  <Badge variant={position.netPnL >= 0 ? 'default' : 'destructive'}>
                    {position.netPnL >= 0 ? 'Profitable' : 'Loss'}
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Impermanent Loss</p>
                    <p className="text-lg font-bold text-red-600">
                      -${position.ilValue.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{position.ilPercentage.toFixed(2)}%</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Fees Earned</p>
                    <p className="text-lg font-bold text-green-600">
                      +${position.totalFees.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Fee income</p>
                  </div>

                  <div className={`${position.netPnL >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-3`}>
                    <p className="text-xs text-gray-600 mb-1">Net P&L</p>
                    <p className={`text-lg font-bold ${position.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {position.netPnL >= 0 ? '+' : ''}${position.netPnL.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Fees - IL</p>
                  </div>
                </div>

                {/* IL Trend for this position */}
                <div className="h-48 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={position.ilTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="fees" stroke="#10B981" strokeWidth={1.5} name="Fees" dot={false} />
                      <Line type="monotone" dataKey="il" stroke="#DC2626" strokeWidth={1.5} name="IL" dot={false} />
                      <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={2} name="Net" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Recovery Scenarios */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Recovery Scenarios</p>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {position.recoveryScenarios.map((scenario, idx) => (
                      <div key={idx} className="bg-gray-50 border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs font-medium text-gray-900">{scenario.scenario}</p>
                          <Badge variant="outline" className="text-xs">
                            {scenario.probability}%
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{scenario.timeframe}</p>
                        <p className="text-xs text-gray-700">{scenario.outcome}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* IL Risk Warning */}
      {totalNetPnL < 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              IL Risk Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">
              Your portfolio currently has negative net P&L due to impermanent loss exceeding fees earned.
              Consider the following actions:
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                Monitor price movements and wait for convergence
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Consider rebalancing to more stable pairs
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Review fee tier optimization opportunities
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
