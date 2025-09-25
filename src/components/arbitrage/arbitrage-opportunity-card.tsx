'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  AlertTriangle,
  Zap,
  Target,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Shuffle
} from 'lucide-react'
import { ArbitrageOpportunity } from '@/lib/dlmm/arbitrage'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'

interface ArbitrageOpportunityCardProps {
  opportunity: ArbitrageOpportunity
  onExecute: (amount: number) => void
  onAnalyze: () => void
}

export function ArbitrageOpportunityCard({
  opportunity,
  onExecute,
  onAnalyze
}: ArbitrageOpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: ArbitrageOpportunity['type']) => {
    switch (type) {
      case 'direct': return <ArrowRight className="h-4 w-4" />
      case 'triangular': return <Target className="h-4 w-4" />
      case 'multi_hop': return <Shuffle className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600'
      case 'moderate': return 'text-yellow-600'
      case 'complex': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const profitMargin = opportunity.profitability.profitMargin
  const isHighProfit = opportunity.profitability.netProfit > 50
  const isHighRisk = ['high', 'critical'].includes(opportunity.risk.overallRisk)

  return (
    <Card className={`transition-all hover:shadow-md ${isHighProfit ? 'ring-1 ring-green-500/20' : ''}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-saros-primary/10 rounded-lg">
                {getTypeIcon(opportunity.type)}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold capitalize">
                    {opportunity.type.replace('_', ' ')} Arbitrage
                  </h3>
                  <Badge variant="outline" className="capitalize">
                    {opportunity.path.complexity}
                  </Badge>
                  <Badge className={getRiskBadgeColor(opportunity.risk.overallRisk)}>
                    {opportunity.risk.overallRisk} risk
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground">
                  {opportunity.path.inputToken.symbol} → {opportunity.path.outputToken.symbol}
                  {opportunity.path.route.length > 2 && ` via ${opportunity.path.route.length - 2} pools`}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(opportunity.profitability.netProfit)}
              </div>
              <div className="text-sm text-muted-foreground">Net Profit</div>
              <div className="text-xs text-green-600">
                {formatPercentage(profitMargin)} margin
              </div>
            </div>

            <div className="text-center">
              <div className="text-xl font-semibold">
                {formatPercentage(opportunity.confidence)}
              </div>
              <div className="text-sm text-muted-foreground">Confidence</div>
              <div className="flex items-center justify-center mt-1">
                {opportunity.confidence > 0.8 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                )}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xl font-semibold">
                {opportunity.path.totalDistance}
              </div>
              <div className="text-sm text-muted-foreground">Steps</div>
              <div className={`text-xs ${getComplexityColor(opportunity.path.complexity)}`}>
                {opportunity.path.complexity}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xl font-semibold flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                {(opportunity.mev.jitterMs / 1000).toFixed(1)}s
              </div>
              <div className="text-sm text-muted-foreground">Est. Time</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Shield className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-blue-600">MEV Protected</span>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="space-y-4 pt-4 border-t">
              {/* Route Details */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Execution Route
                </h4>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span>Route:</span>
                    <div className="flex items-center gap-2">
                      {opportunity.path.route.map((step, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <span className="px-2 py-1 bg-white rounded text-xs">
                            {step.tokenIn.symbol}
                          </span>
                          {index < opportunity.path.route.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Total price impact: ~{formatPercentage(
                      opportunity.path.route.reduce((sum, step) => sum + (step.priceImpact || 0), 0)
                    )}
                  </div>
                </div>
              </div>

              {/* Risk Breakdown */}
              <div>
                <h4 className="font-medium mb-2">Risk Analysis</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium">{formatPercentage(opportunity.risk.liquidityRisk)}</div>
                    <div className="text-muted-foreground">Liquidity</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{formatPercentage(opportunity.risk.slippageRisk)}</div>
                    <div className="text-muted-foreground">Slippage</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{formatPercentage(opportunity.risk.mevRisk)}</div>
                    <div className="text-muted-foreground">MEV</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{formatPercentage(opportunity.risk.temporalRisk)}</div>
                    <div className="text-muted-foreground">Temporal</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{formatPercentage(opportunity.risk.competitionRisk)}</div>
                    <div className="text-muted-foreground">Competition</div>
                  </div>
                </div>
                {opportunity.risk.riskFactors.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">Risk Factors:</div>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.risk.riskFactors.map((factor, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profitability Breakdown */}
              <div>
                <h4 className="font-medium mb-2">Profitability Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-green-600">
                      {formatCurrency(opportunity.profitability.grossProfit)}
                    </div>
                    <div className="text-muted-foreground">Gross Profit</div>
                  </div>
                  <div>
                    <div className="font-medium text-red-600">
                      -{formatCurrency(opportunity.profitability.gasCosts)}
                    </div>
                    <div className="text-muted-foreground">Gas Costs</div>
                  </div>
                  <div>
                    <div className="font-medium text-red-600">
                      -{formatCurrency(opportunity.profitability.priorityFees)}
                    </div>
                    <div className="text-muted-foreground">Priority Fees</div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-600">
                      {formatCurrency(opportunity.profitability.netProfit)}
                    </div>
                    <div className="text-muted-foreground">Net Profit</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Profitable range: {formatCurrency(opportunity.profitability.breakevenAmount)} - {formatCurrency(opportunity.profitability.maxProfitableAmount)}
                </div>
              </div>

              {/* Pool Information */}
              <div>
                <h4 className="font-medium mb-2">Pool Information</h4>
                <div className="space-y-2">
                  {opportunity.pools.map((pool, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <div>
                        <span className="font-medium">{pool.tokenX.symbol}/{pool.tokenY.symbol}</span>
                        <span className="text-muted-foreground ml-2">
                          {pool.poolAddress.toString().substring(0, 8)}...
                        </span>
                      </div>
                      <div className="text-right">
                        <div>{formatCurrency(pool.liquidity)} liquidity</div>
                        <div className="text-xs text-muted-foreground">
                          {formatPercentage(pool.fees)} fee • {formatPercentage(pool.slippage)} slippage
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => onExecute(opportunity.profitability.breakevenAmount * 2)}
              className="flex-1"
              disabled={isHighRisk}
            >
              <Zap className="h-4 w-4 mr-1" />
              Execute Arbitrage
            </Button>

            <Button
              variant="outline"
              onClick={onAnalyze}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Analyze
            </Button>
          </div>

          {/* Warning for high risk opportunities */}
          {isHighRisk && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <div className="text-sm text-red-800">
                High risk opportunity. Consider the risk factors before execution.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}