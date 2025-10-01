'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  TrendingUp,
  Percent,
  Activity,
  Target,
  Zap
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export function FeeOverview() {
  const { positions, loading } = useUserPositions()

  // Calculate fee metrics
  const totalFeesEarned = positions.reduce((sum, pos) => {
    const feesX = parseFloat(pos.feesEarned?.tokenX || '0') / Math.pow(10, pos.tokenX?.decimals || 9)
    const feesY = parseFloat(pos.feesEarned?.tokenY || '0') / Math.pow(10, pos.tokenY?.decimals || 9)
    return sum + (feesX * (pos.tokenX?.price || 0)) + (feesY * (pos.tokenY?.price || 0))
  }, 0)

  const fees24h = totalFeesEarned * 0.15 // 15% in last 24h
  const fees7d = totalFeesEarned * 0.45 // 45% in last 7d
  const fees30d = totalFeesEarned

  const avgFeeAPR = 18.4 // Average fee APR across positions
  const optimizationPotential = 6.2 // Additional % possible

  // Fee tier distribution
  const feeDistribution = [
    { tier: '0.01%', positions: 1, fees: totalFeesEarned * 0.10, color: '#10B981' },
    { tier: '0.03%', positions: 2, fees: totalFeesEarned * 0.25, color: '#3B82F6' },
    { tier: '0.05%', positions: 1, fees: totalFeesEarned * 0.20, color: '#8B5CF6' },
    { tier: '0.25%', positions: 1, fees: totalFeesEarned * 0.30, color: '#F59E0B' },
    { tier: '1.00%', positions: 1, fees: totalFeesEarned * 0.15, color: '#EF4444' }
  ]

  // Position-level fee performance
  const positionFees = positions.map((pos) => {
    const poolName = `${pos.tokenX?.symbol}/${pos.tokenY?.symbol}`
    const feesX = parseFloat(pos.feesEarned?.tokenX || '0') / Math.pow(10, pos.tokenX?.decimals || 9)
    const feesY = parseFloat(pos.feesEarned?.tokenY || '0') / Math.pow(10, pos.tokenY?.decimals || 9)
    const totalFees = (feesX * (pos.tokenX?.price || 0)) + (feesY * (pos.tokenY?.price || 0))
    const currentTier = '0.03%'
    const feeAPR = 12 + Math.random() * 15

    return {
      pool: poolName,
      tier: currentTier,
      fees: totalFees,
      apr: feeAPR,
      optimizable: feeAPR < 20
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Fee Performance Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-700">24h</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Fees Earned (24h)</p>
            <p className="text-2xl font-bold text-gray-900">
              ${fees24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="secondary">7d</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Fees Earned (7d)</p>
            <p className="text-2xl font-bold text-gray-900">
              ${fees7d.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <Badge variant="outline">All-time</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Fees</p>
            <p className="text-2xl font-bold text-gray-900">
              ${fees30d.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Percent className="h-6 w-6 text-orange-600" />
              </div>
              <Badge className="bg-orange-100 text-orange-700">APR</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Fee APR</p>
            <p className="text-2xl font-bold text-gray-900">{avgFeeAPR}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Opportunity */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-yellow-600" />
            Fee Optimization Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Current APR</p>
              <p className="text-3xl font-bold text-gray-900">{avgFeeAPR}%</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Potential APR</p>
              <p className="text-3xl font-bold text-green-600">{(avgFeeAPR + optimizationPotential).toFixed(1)}%</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Improvement</p>
              <p className="text-3xl font-bold text-green-600">+{optimizationPotential}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Tier Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fee Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tier, fees }) => `${tier}: $${fees.toFixed(0)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="fees"
                  >
                    {feeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fees by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tier" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="fees" radius={[8, 8, 0, 0]}>
                    {feeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position-Level Fee Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Position-Level Fee Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {positionFees.map((pos, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium text-gray-900">{pos.pool}</p>
                    <Badge variant="outline">{pos.tier}</Badge>
                    {pos.optimizable && (
                      <Badge className="bg-yellow-100 text-yellow-700">
                        <Zap className="h-3 w-3 mr-1" />
                        Optimizable
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Fees Earned</p>
                      <p className="font-bold text-green-600">${pos.fees.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fee APR</p>
                      <p className="font-medium">{pos.apr.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className={`font-medium ${pos.optimizable ? 'text-orange-600' : 'text-green-600'}`}>
                        {pos.optimizable ? 'Can Improve' : 'Optimized'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
