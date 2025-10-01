'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Layers, DollarSign, GitMerge, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react'

interface ConsolidationOpportunity {
  id: string
  positions: string[]
  targetPair: string
  currentPositions: number
  totalLiquidity: number
  savingsPerYear: number
  npv: number
  roi: number
  priority: 'high' | 'medium' | 'low'
}

interface CostBenefit {
  category: string
  current: number
  consolidated: number
  savings: number
}

interface ExecutionStep {
  step: number
  action: string
  position: string
  status: 'pending' | 'in-progress' | 'completed'
  estimatedTime: string
  cost: number
}

export default function ConsolidationDemo() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>('OPP-001')

  const opportunities: ConsolidationOpportunity[] = [
    {
      id: 'OPP-001',
      positions: ['SOL/USDC-A', 'SOL/USDC-B', 'SOL/USDC-C'],
      targetPair: 'SOL/USDC',
      currentPositions: 3,
      totalLiquidity: 85000,
      savingsPerYear: 2580,
      npv: 18450,
      roi: 215.5,
      priority: 'high',
    },
    {
      id: 'OPP-002',
      positions: ['BONK/SOL-A', 'BONK/SOL-B'],
      targetPair: 'BONK/SOL',
      currentPositions: 2,
      totalLiquidity: 42000,
      savingsPerYear: 1240,
      npv: 8850,
      roi: 185.2,
      priority: 'high',
    },
    {
      id: 'OPP-003',
      positions: ['RAY/USDC-A', 'RAY/USDC-B'],
      targetPair: 'RAY/USDC',
      currentPositions: 2,
      totalLiquidity: 28000,
      savingsPerYear: 780,
      npv: 5580,
      roi: 158.8,
      priority: 'medium',
    },
  ]

  const costBenefitAnalysis: CostBenefit[] = [
    { category: 'Transaction Fees', current: 450, consolidated: 150, savings: 300 },
    { category: 'Gas Costs (Annual)', current: 1200, consolidated: 400, savings: 800 },
    { category: 'Management Time', current: 180, consolidated: 60, savings: 120 },
    { category: 'Slippage Costs', current: 950, consolidated: 320, savings: 630 },
    { category: 'Rebalancing Costs', current: 800, consolidated: 270, savings: 530 },
  ]

  const executionPlan: ExecutionStep[] = [
    {
      step: 1,
      action: 'Remove liquidity from',
      position: 'SOL/USDC-A',
      status: 'completed',
      estimatedTime: '2 min',
      cost: 45.2,
    },
    {
      step: 2,
      action: 'Remove liquidity from',
      position: 'SOL/USDC-B',
      status: 'completed',
      estimatedTime: '2 min',
      cost: 42.8,
    },
    {
      step: 3,
      action: 'Remove liquidity from',
      position: 'SOL/USDC-C',
      status: 'in-progress',
      estimatedTime: '2 min',
      cost: 38.5,
    },
    {
      step: 4,
      action: 'Create consolidated position',
      position: 'SOL/USDC-Consolidated',
      status: 'pending',
      estimatedTime: '3 min',
      cost: 65.0,
    },
    {
      step: 5,
      action: 'Add combined liquidity to',
      position: 'SOL/USDC-Consolidated',
      status: 'pending',
      estimatedTime: '3 min',
      cost: 58.5,
    },
  ]

  const consolidationMetrics = {
    totalSavings: 2580,
    oneTimeCost: 250,
    netBenefit: 2330,
    paybackPeriod: 35,
    npv: 18450,
    irr: 215.5,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'in-progress':
        return <AlertTriangle className="h-4 w-4 text-yellow-600 animate-pulse" />
      case 'pending':
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layers className="h-8 w-8" />
            Position Consolidation Tools
          </h1>
          <p className="text-muted-foreground mt-2">
            NPV analysis, consolidation opportunities, and execution planning
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #31
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Annual Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${consolidationMetrics.totalSavings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Projected annual benefit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">NPV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${consolidationMetrics.npv.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Net present value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{consolidationMetrics.irr}%</div>
            <p className="text-xs text-muted-foreground">Internal rate of return</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Payback Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consolidationMetrics.paybackPeriod} days</div>
            <p className="text-xs text-muted-foreground">Time to break even</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities">
            <Layers className="h-4 w-4 mr-2" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <DollarSign className="h-4 w-4 mr-2" />
            Cost-Benefit
          </TabsTrigger>
          <TabsTrigger value="execution">
            <GitMerge className="h-4 w-4 mr-2" />
            Execution
          </TabsTrigger>
          <TabsTrigger value="impact">
            <TrendingUp className="h-4 w-4 mr-2" />
            Impact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consolidation Opportunities</CardTitle>
              <CardDescription>Identified positions that can be consolidated for efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className={`border rounded-lg p-4 space-y-3 cursor-pointer transition-all ${
                      selectedOpportunity === opp.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedOpportunity(opp.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{opp.targetPair} Consolidation</div>
                        <div className="text-sm text-muted-foreground">
                          {opp.currentPositions} positions → 1 position
                        </div>
                      </div>
                      <Badge variant={getPriorityBadge(opp.priority)} className={getPriorityColor(opp.priority)}>
                        {opp.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Liquidity</div>
                        <div className="font-medium">${opp.totalLiquidity.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Annual Savings</div>
                        <div className="font-medium text-green-600">${opp.savingsPerYear.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">NPV</div>
                        <div className="font-medium text-purple-600">${opp.npv.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">ROI</div>
                        <div className="font-medium text-blue-600">{opp.roi}%</div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground mb-2">Positions to consolidate:</div>
                      <div className="flex flex-wrap gap-2">
                        {opp.positions.map((pos, idx) => (
                          <Badge key={idx} variant="secondary">
                            {pos}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost-Benefit Analysis</CardTitle>
              <CardDescription>Detailed breakdown of costs and savings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costBenefitAnalysis.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="font-semibold">{item.category}</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Current (Annual)</div>
                        <div className="font-medium text-red-600">${item.current.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Consolidated</div>
                        <div className="font-medium text-blue-600">${item.consolidated.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Savings</div>
                        <div className="font-medium text-green-600">${item.savings.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Savings Rate</span>
                        <span className="font-medium">
                          {((item.savings / item.current) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2"
                          style={{ width: `${(item.savings / item.current) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total Annual Savings</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${costBenefitAnalysis.reduce((sum, item) => sum + item.savings, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">One-time Consolidation Cost</span>
                    <span className="text-xl font-bold text-red-600">
                      ${consolidationMetrics.oneTimeCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-semibold">Net Annual Benefit</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${consolidationMetrics.netBenefit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution Plan</CardTitle>
              <CardDescription>Step-by-step consolidation process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executionPlan.map((step) => (
                  <div key={step.step} className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary bg-background">
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : step.status === 'in-progress' ? (
                          <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse" />
                        ) : (
                          <span className="text-sm font-medium">{step.step}</span>
                        )}
                      </div>
                      {step.step < executionPlan.length && (
                        <div className="w-0.5 h-16 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{step.action}</div>
                          <div className="text-sm text-muted-foreground">{step.position}</div>
                        </div>
                        {getStatusIcon(step.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Time: </span>
                          <span className="font-medium">{step.estimatedTime}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost: </span>
                          <span className="font-medium">${step.cost.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status: </span>
                          <Badge
                            variant={
                              step.status === 'completed'
                                ? 'default'
                                : step.status === 'in-progress'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {step.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-semibold">Total Execution Cost</div>
                      <div className="text-sm text-muted-foreground">
                        {executionPlan.filter((s) => s.status === 'completed').length}/{executionPlan.length} steps
                        completed
                      </div>
                    </div>
                    <div className="text-2xl font-bold">
                      ${executionPlan.reduce((sum, step) => sum + step.cost, 0).toFixed(2)}
                    </div>
                  </div>
                  <Button className="w-full" size="lg" disabled>
                    Continue Execution
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Impact Analysis</CardTitle>
              <CardDescription>Long-term benefits of consolidation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="font-semibold mb-2">Efficiency Gains</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Management Overhead Reduction</span>
                      <span className="text-sm font-medium text-green-600">-66.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Transaction Cost Savings</span>
                      <span className="text-sm font-medium text-green-600">-66.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Gas Efficiency Improvement</span>
                      <span className="text-sm font-medium text-green-600">-66.7%</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="font-semibold mb-2">Financial Impact</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Year 1 Savings</span>
                      <span className="text-sm font-medium text-green-600">
                        ${consolidationMetrics.totalSavings.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">3-Year NPV</span>
                      <span className="text-sm font-medium text-green-600">
                        ${consolidationMetrics.npv.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">IRR</span>
                      <span className="text-sm font-medium text-green-600">{consolidationMetrics.irr}%</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="font-semibold mb-2">Operational Benefits</div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Simplified position management with fewer active positions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Reduced monitoring and rebalancing complexity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Lower transaction costs through consolidated operations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Improved capital efficiency with optimized allocation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}