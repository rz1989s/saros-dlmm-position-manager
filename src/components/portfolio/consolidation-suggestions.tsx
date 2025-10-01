'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GitMerge, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'

export function ConsolidationSuggestions() {
  const { positions, loading } = useUserPositions()

  // Detect similar positions that could be consolidated
  const consolidationOpportunities = [
    {
      positions: ['SOL/USDC #1', 'SOL/USDC #2'],
      pool: 'SOL/USDC',
      totalValue: '$3,245.67',
      gasSavings: '$12.40/month',
      npv: '$148.80',
      managementEfficiency: '+35%',
      recommendation: 'High Priority'
    },
    {
      positions: ['RAY/SOL #1', 'RAY/SOL #3'],
      pool: 'RAY/SOL',
      totalValue: '$1,892.34',
      gasSavings: '$8.20/month',
      npv: '$98.40',
      managementEfficiency: '+28%',
      recommendation: 'Medium Priority'
    }
  ]

  // Gas cost analysis
  const gasAnalysis = {
    currentMonthlyCost: 34.60,
    projectedMonthlyCost: 14.00,
    savingsPerMonth: 20.60,
    savingsPerYear: 247.20,
    consolidationCost: 15.40,
    breakEvenDays: 22
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Consolidation Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-purple-600" />
            Consolidation Opportunities Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Positions to Consolidate</p>
              <p className="text-2xl font-bold text-purple-600">{consolidationOpportunities.length * 2}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Gas Savings</p>
              <p className="text-2xl font-bold text-green-600">${gasAnalysis.savingsPerMonth.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Annual Savings</p>
              <p className="text-2xl font-bold text-green-600">${gasAnalysis.savingsPerYear.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Break-even</p>
              <p className="text-2xl font-bold text-blue-600">{gasAnalysis.breakEvenDays} days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consolidation Opportunities */}
      <div className="space-y-4">
        {consolidationOpportunities.map((opportunity, idx) => (
          <Card key={idx} className="border-2 hover:border-purple-300 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitMerge className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">{opportunity.pool} Consolidation</CardTitle>
                </div>
                <Badge variant={opportunity.recommendation === 'High Priority' ? 'default' : 'secondary'} className={opportunity.recommendation === 'High Priority' ? 'bg-purple-100 text-purple-700' : ''}>
                  {opportunity.recommendation}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Positions to merge */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Positions to Merge:</p>
                  <div className="flex gap-2">
                    {opportunity.positions.map((pos, i) => (
                      <Badge key={i} variant="outline" className="text-sm">
                        {pos}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Financial Analysis */}
                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Combined Value</p>
                    <p className="text-lg font-bold text-gray-900">{opportunity.totalValue}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Gas Savings</p>
                    <p className="text-lg font-bold text-green-600">{opportunity.gasSavings}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">NPV (1 Year)</p>
                    <p className="text-lg font-bold text-blue-600">{opportunity.npv}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Efficiency Gain</p>
                    <p className="text-lg font-bold text-purple-600">{opportunity.managementEfficiency}</p>
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <GitMerge className="mr-2 h-4 w-4" />
                  Execute Consolidation
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gas Cost Savings Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Gas Cost Savings Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Current Costs</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm">Monthly Gas Costs</span>
                  <span className="font-bold text-red-600">${gasAnalysis.currentMonthlyCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Active Positions</span>
                  <span className="font-bold">{positions.length}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">After Consolidation</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">Monthly Gas Costs</span>
                  <span className="font-bold text-green-600">${gasAnalysis.projectedMonthlyCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Active Positions</span>
                  <span className="font-bold">{positions.length - consolidationOpportunities.length * 2 + consolidationOpportunities.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900 mb-2">Consolidation Benefits</p>
                <ul className="space-y-1 text-sm text-green-800">
                  <li>• Save ${gasAnalysis.savingsPerMonth.toFixed(2)}/month in gas costs (${gasAnalysis.savingsPerYear.toFixed(2)}/year)</li>
                  <li>• One-time consolidation cost: ${gasAnalysis.consolidationCost.toFixed(2)}</li>
                  <li>• Break-even in {gasAnalysis.breakEvenDays} days</li>
                  <li>• Simplified portfolio management with fewer positions</li>
                  <li>• Improved capital efficiency and rebalancing ease</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* One-Click Consolidation Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Consolidation Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
              <div className="flex-1">
                <p className="font-medium">Detect Similar Positions</p>
                <p className="text-sm text-gray-600">Automatically identify positions in the same pool</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Complete</Badge>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">2</div>
              <div className="flex-1">
                <p className="font-medium">Calculate NPV & Gas Savings</p>
                <p className="text-sm text-gray-600">Analyze financial impact and break-even timeline</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Complete</Badge>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">3</div>
              <div className="flex-1">
                <p className="font-medium">Execute Consolidation</p>
                <p className="text-sm text-gray-600">One-click merge with transaction preview</p>
              </div>
              <Badge>Ready</Badge>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg opacity-50">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">4</div>
              <div className="flex-1">
                <p className="font-medium">Verify & Track Savings</p>
                <p className="text-sm text-gray-600">Monitor actual gas savings vs projections</p>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>

            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <GitMerge className="mr-2 h-4 w-4" />
              Consolidate All Suggested Positions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {consolidationOpportunities.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No consolidation opportunities detected at this time</p>
            <p className="text-sm text-gray-500 mt-1">Your positions are already optimally distributed</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
