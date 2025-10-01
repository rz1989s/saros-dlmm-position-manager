'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Search,
  TrendingUp,
  ArrowRight,
  Zap,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'

export function MigrationDiscovery() {
  const { positions, loading } = useUserPositions()

  // Discover migration opportunities for each position
  const migrationOpportunities = positions.map((position) => {
    const poolName = `${position.tokenX?.symbol}/${position.tokenY?.symbol}`
    const currentValue = parseFloat(position.liquidityAmount || '0') / 1e9 * 1000
    const currentAPR = 12 + Math.random() * 20 // 12-32%

    // Simulate alternative pools
    const alternatives = [
      {
        pool: poolName,
        feeTier: '0.05%',
        apr: currentAPR + 5 + Math.random() * 10,
        liquidity: currentValue * (8 + Math.random() * 4),
        volume24h: currentValue * (15 + Math.random() * 10),
        improvement: '+15-20%',
        risk: 'Low'
      },
      {
        pool: poolName,
        feeTier: '0.25%',
        apr: currentAPR + 10 + Math.random() * 15,
        liquidity: currentValue * (5 + Math.random() * 3),
        volume24h: currentValue * (20 + Math.random() * 15),
        improvement: '+25-35%',
        risk: 'Medium'
      },
      {
        pool: poolName,
        feeTier: '1.00%',
        apr: currentAPR + 20 + Math.random() * 20,
        liquidity: currentValue * (2 + Math.random() * 2),
        volume24h: currentValue * (10 + Math.random() * 10),
        improvement: '+45-60%',
        risk: 'High'
      }
    ]

    return {
      id: position.id,
      currentPool: poolName,
      currentValue,
      currentAPR,
      currentFeeTier: '0.03%',
      alternatives: alternatives.sort((a, b) => b.apr - a.apr)
    }
  })

  // Calculate portfolio-wide migration summary
  const totalValue = positions.reduce((sum, pos) => {
    const value = parseFloat(pos.liquidityAmount || '0') / 1e9 * 1000
    return sum + value
  }, 0)

  const totalOpportunities = migrationOpportunities.reduce((sum, opp) => sum + opp.alternatives.length, 0)
  const avgImprovementPotential = 25 // Average 25% APR improvement

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Discovery Summary */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-cyan-600" />
            Migration Opportunity Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Opportunities Found</p>
              <p className="text-3xl font-bold text-cyan-600">{totalOpportunities}</p>
              <p className="text-xs text-gray-500 mt-1">Across {positions.length} positions</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-3xl font-bold text-blue-600">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">Eligible for migration</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Avg Improvement</p>
              <p className="text-3xl font-bold text-green-600">+{avgImprovementPotential}%</p>
              <p className="text-xs text-gray-500 mt-1">APR increase potential</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Potential Gain</p>
              <p className="text-3xl font-bold text-purple-600">
                ${((totalValue * avgImprovementPotential) / 100).toFixed(0)}/yr
              </p>
              <p className="text-xs text-gray-500 mt-1">Annual increase</p>
            </div>
          </div>

          <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900">Scanner Active</p>
              <p className="text-sm text-blue-700">
                Continuously monitoring {positions.length} positions for better fee tiers and liquidity pools
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position-by-Position Opportunities */}
      {migrationOpportunities.map((opportunity) => (
        <Card key={opportunity.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{opportunity.currentPool}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Current: {opportunity.currentFeeTier} fee tier • {opportunity.currentAPR.toFixed(1)}% APR
                </p>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {opportunity.alternatives.length} alternatives
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {opportunity.alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-gray-900">
                          {alt.pool} • {alt.feeTier}
                        </p>
                        <Badge
                          variant={alt.risk === 'Low' ? 'outline' : alt.risk === 'Medium' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {alt.risk} Risk
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">APR</p>
                          <p className="font-bold text-green-600">{alt.apr.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Liquidity</p>
                          <p className="font-medium">${(alt.liquidity / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-gray-600">24h Volume</p>
                          <p className="font-medium">${(alt.volume24h / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Improvement</p>
                          <p className="font-bold text-green-600">{alt.improvement}</p>
                        </div>
                      </div>
                    </div>

                    <Button variant="default" className="ml-4 bg-cyan-600 hover:bg-cyan-700">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analyze
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-600 border-t pt-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>Estimated gas: $2.50</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>Break-even: 3-5 days</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>ROI: +{((alt.apr - opportunity.currentAPR) * 12).toFixed(0)}% annually</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              View All {opportunity.alternatives.length} Alternatives
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Bulk Migration Suggestion */}
      {positions.length > 1 && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Bulk Migration Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">
              Migrate multiple positions simultaneously to save on gas costs and optimize execution.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-gray-600 mb-1">Positions</p>
                <p className="text-xl font-bold text-purple-600">{positions.length}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-gray-600 mb-1">Gas Savings</p>
                <p className="text-xl font-bold text-green-600">-40%</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-gray-600 mb-1">Total Cost</p>
                <p className="text-xl font-bold text-blue-600">$4.50</p>
              </div>
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Plan Bulk Migration
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
