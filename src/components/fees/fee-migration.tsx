'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts'

interface FeeTier {
  tier: string
  currentAPR: number
  projectedAPR: number
  tradingVolume: number
  liquidity: number
  migrationCost: number
  breakEvenDays: number
  recommended: boolean
}

export function FeeMigration() {
  const { positions, loading } = useUserPositions()
  const [selectedPosition, setSelectedPosition] = useState(0)
  const [selectedTargetTier, setSelectedTargetTier] = useState<string | null>(null)
  const [migrationStep, setMigrationStep] = useState<'select' | 'analyze' | 'confirm' | 'executing'>('select')

  const position = positions[selectedPosition]
  const poolName = position ? `${position.tokenX?.symbol}/${position.tokenY?.symbol}` : ''
  const positionValue = position ? parseFloat(position.liquidityAmount || '0') / 1e9 * 1000 : 0
  const currentTier = '0.03%'
  const currentAPR = 18.5

  // Available fee tiers with analysis
  const feeTiers: FeeTier[] = [
    {
      tier: '0.01%',
      currentAPR: 18.5,
      projectedAPR: 12.3,
      tradingVolume: 450000,
      liquidity: 2500000,
      migrationCost: 2.50,
      breakEvenDays: 180,
      recommended: false
    },
    {
      tier: '0.03%',
      currentAPR: 18.5,
      projectedAPR: 18.5,
      tradingVolume: 320000,
      liquidity: 1800000,
      migrationCost: 0,
      breakEvenDays: 0,
      recommended: false
    },
    {
      tier: '0.05%',
      currentAPR: 18.5,
      projectedAPR: 21.7,
      tradingVolume: 280000,
      liquidity: 1500000,
      migrationCost: 2.50,
      breakEvenDays: 45,
      recommended: false
    },
    {
      tier: '0.25%',
      currentAPR: 18.5,
      projectedAPR: 28.3,
      tradingVolume: 180000,
      liquidity: 950000,
      migrationCost: 2.50,
      breakEvenDays: 35,
      recommended: true
    },
    {
      tier: '1.00%',
      currentAPR: 18.5,
      projectedAPR: 35.7,
      tradingVolume: 85000,
      liquidity: 420000,
      migrationCost: 2.50,
      breakEvenDays: 25,
      recommended: false
    }
  ]

  const selectedTier = selectedTargetTier
    ? feeTiers.find(t => t.tier === selectedTargetTier)
    : null

  // Migration timeline projection (12 months)
  const projectionData = selectedTier ? Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const currentMonthly = (positionValue * currentAPR / 100) / 12
    const newMonthly = (positionValue * selectedTier.projectedAPR / 100) / 12
    const currentCumulative = currentMonthly * month
    const newCumulative = (newMonthly * month) - selectedTier.migrationCost

    return {
      month: `M${month}`,
      current: currentCumulative,
      new: newCumulative,
      gain: newCumulative - currentCumulative
    }
  }) : []

  // Cost-benefit breakdown
  const annualGain = selectedTier
    ? (positionValue * (selectedTier.projectedAPR - currentAPR) / 100)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Migration Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                migrationStep === 'select' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-600'
              }`}>
                1
              </div>
              <div>
                <p className="font-medium">Select Position</p>
                <p className="text-sm text-gray-600">Choose position to migrate</p>
              </div>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400" />

            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                migrationStep === 'analyze' ? 'bg-green-600 text-white' :
                ['analyze', 'confirm', 'executing'].includes(migrationStep) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                2
              </div>
              <div>
                <p className="font-medium">Analyze Tiers</p>
                <p className="text-sm text-gray-600">Compare fee tiers</p>
              </div>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400" />

            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                migrationStep === 'confirm' ? 'bg-green-600 text-white' :
                ['confirm', 'executing'].includes(migrationStep) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                3
              </div>
              <div>
                <p className="font-medium">Confirm & Execute</p>
                <p className="text-sm text-gray-600">Complete migration</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Position for Fee Migration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {positions.map((pos, idx) => {
              const name = `${pos.tokenX?.symbol}/${pos.tokenY?.symbol}`
              const value = parseFloat(pos.liquidityAmount || '0') / 1e9 * 1000

              return (
                <button
                  key={pos.id}
                  onClick={() => {
                    setSelectedPosition(idx)
                    setMigrationStep('analyze')
                  }}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    selectedPosition === idx
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{name}</p>
                  <p className="text-sm text-gray-600">${value.toFixed(2)}</p>
                  <Badge variant="outline" className="mt-2">{currentTier}</Badge>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fee Tier Comparison */}
      {migrationStep !== 'select' && (
        <Card>
          <CardHeader>
            <CardTitle>Available Fee Tiers for {poolName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feeTiers.map((tier) => {
                const isCurrentTier = tier.tier === currentTier
                const aprDiff = tier.projectedAPR - currentAPR
                const isSelected = selectedTargetTier === tier.tier

                return (
                  <div
                    key={tier.tier}
                    onClick={() => {
                      if (!isCurrentTier) {
                        setSelectedTargetTier(tier.tier)
                        setMigrationStep('confirm')
                      }
                    }}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      isCurrentTier ? 'border-gray-300 bg-gray-50 cursor-not-allowed' :
                      isSelected ? 'border-green-500 bg-green-50 cursor-pointer' :
                      'border-gray-200 hover:border-gray-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-xl font-bold text-gray-900">{tier.tier}</p>
                          {isCurrentTier && (
                            <Badge className="bg-blue-100 text-blue-700">Current Tier</Badge>
                          )}
                          {tier.recommended && !isCurrentTier && (
                            <Badge className="bg-green-600 text-white">Recommended</Badge>
                          )}
                          {aprDiff > 0 && !isCurrentTier && (
                            <Badge className="bg-green-100 text-green-700">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              +{aprDiff.toFixed(1)}% APR
                            </Badge>
                          )}
                          {aprDiff < 0 && !isCurrentTier && (
                            <Badge className="bg-red-100 text-red-700">
                              {aprDiff.toFixed(1)}% APR
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Projected APR</p>
                            <p className="font-bold text-green-600">{tier.projectedAPR}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">24h Volume</p>
                            <p className="font-medium">${(tier.tradingVolume / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Liquidity</p>
                            <p className="font-medium">${(tier.liquidity / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Migration Cost</p>
                            <p className="font-medium">${tier.migrationCost.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Break-even</p>
                            <p className="font-medium">{tier.breakEvenDays} days</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Migration Analysis */}
      {selectedTier && migrationStep === 'confirm' && (
        <>
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle>Migration Analysis: {currentTier} → {selectedTier.tier}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-gray-600">Migration Cost</p>
                  </div>
                  <p className="text-3xl font-bold text-red-600">${selectedTier.migrationCost.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">One-time fee</p>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-gray-600">APR Improvement</p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    +{(selectedTier.projectedAPR - currentAPR).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{currentAPR}% → {selectedTier.projectedAPR}%</p>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <p className="text-sm text-gray-600">Break-even Time</p>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">{selectedTier.breakEvenDays}</p>
                  <p className="text-xs text-gray-500 mt-1">days</p>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <p className="text-sm text-gray-600">Annual Gain</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">${annualGain.toFixed(0)}</p>
                  <p className="text-xs text-gray-500 mt-1">per year</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Earnings Projection */}
          <Card>
            <CardHeader>
              <CardTitle>12-Month Earnings Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Cumulative Earnings ($)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="current" stroke="#94A3B8" strokeWidth={2} name="Current Tier" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="new" stroke="#10B981" strokeWidth={2} name="New Tier" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-900">
                  <strong>Break-even at month {Math.ceil(selectedTier.breakEvenDays / 30)}</strong> •
                  First year gain: ${(annualGain - selectedTier.migrationCost).toFixed(2)} •
                  ROI: {((annualGain / selectedTier.migrationCost) * 100).toFixed(0)}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cost-Benefit Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Cost-Benefit Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Costs</span>
                    <span className="text-sm font-bold text-red-600">${selectedTier.migrationCost.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between pl-4">
                      <span className="text-gray-600">Transaction fee</span>
                      <span>$2.30</span>
                    </div>
                    <div className="flex items-center justify-between pl-4">
                      <span className="text-gray-600">Slippage (estimated)</span>
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
                      <span className="text-gray-600">Increased APR</span>
                      <span>+{(selectedTier.projectedAPR - currentAPR).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between pl-4">
                      <span className="text-gray-600">Additional annual fees</span>
                      <span>+${annualGain.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Net Benefit (First Year)</span>
                    <span className="text-xl font-bold text-green-600">
                      +${(annualGain - selectedTier.migrationCost).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Warnings */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Migration Considerations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• APR projections are based on current market conditions and may vary</li>
                <li>• Migration involves removing liquidity and re-adding to new fee tier</li>
                <li>• There may be brief downtime where your position is not earning fees</li>
                <li>• Gas fees are estimates and may vary with network congestion</li>
                <li>• Higher fee tiers may result in lower trade volume</li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setMigrationStep('executing')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Execute Migration
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSelectedTargetTier(null)
                setMigrationStep('analyze')
              }}
            >
              Cancel
            </Button>
          </div>
        </>
      )}

      {/* Executing State */}
      {migrationStep === 'executing' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Migration in Progress</h3>
            <p className="text-gray-600 mb-4">
              Migrating {poolName} from {currentTier} to {selectedTier?.tier}
            </p>
            <div className="space-y-2 text-sm text-left max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Removing liquidity from current tier...</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                <span>Adding liquidity to new tier...</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Confirming migration...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
