'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Target, Scale, Zap, BarChart3, Settings } from 'lucide-react'

interface Position {
  pair: string
  current: number
  optimal: number
  apr: number
  risk: number
}

interface OptimizationObjective {
  name: string
  weight: number
  current: number
  optimal: number
  improvement: number
}

interface RebalanceAction {
  type: 'increase' | 'decrease' | 'maintain'
  position: string
  from: number
  to: number
  change: number
  cost: number
}

export default function PortfolioOptimizerDemo() {
  const [riskTolerance, setRiskTolerance] = useState([50])
  const [returnTarget, setReturnTarget] = useState([75])
  const [liquidityWeight, setLiquidityWeight] = useState([60])

  const positions: Position[] = [
    { pair: 'SOL/USDC', current: 45.5, optimal: 38.2, apr: 18.5, risk: 45 },
    { pair: 'BONK/SOL', current: 22.7, optimal: 15.8, apr: 24.2, risk: 72 },
    { pair: 'RAY/USDC', current: 31.8, optimal: 35.5, apr: 15.8, risk: 38 },
    { pair: 'JTO/SOL', current: 0, optimal: 10.5, apr: 28.5, risk: 65 },
  ]

  const objectives: OptimizationObjective[] = [
    { name: 'Expected Return', weight: 35, current: 19.2, optimal: 22.8, improvement: 18.8 },
    { name: 'Risk Minimization', weight: 30, current: 58.3, optimal: 46.5, improvement: 20.2 },
    { name: 'Sharpe Ratio', weight: 25, current: 1.62, optimal: 2.15, improvement: 32.7 },
    { name: 'Diversification', weight: 10, current: 0.68, optimal: 0.85, improvement: 25.0 },
  ]

  const rebalanceActions: RebalanceAction[] = [
    { type: 'decrease', position: 'SOL/USDC', from: 45.5, to: 38.2, change: -7.3, cost: 125.50 },
    { type: 'decrease', position: 'BONK/SOL', from: 22.7, to: 15.8, change: -6.9, cost: 98.20 },
    { type: 'increase', position: 'RAY/USDC', from: 31.8, to: 35.5, change: 3.7, cost: 85.30 },
    { type: 'increase', position: 'JTO/SOL', from: 0, to: 10.5, change: 10.5, cost: 142.80 },
  ]

  const efficientFrontier = [
    { risk: 30, return: 12.5, sharpe: 1.45 },
    { risk: 35, return: 15.2, sharpe: 1.72 },
    { risk: 40, return: 17.8, sharpe: 1.95 },
    { risk: 45, return: 20.5, sharpe: 2.15 },
    { risk: 50, return: 22.8, sharpe: 2.08 },
    { risk: 55, return: 24.5, sharpe: 1.85 },
    { risk: 60, return: 25.8, sharpe: 1.62 },
  ]

  const optimizationMetrics = {
    currentReturn: 19.2,
    optimalReturn: 22.8,
    currentRisk: 58.3,
    optimalRisk: 46.5,
    currentSharpe: 1.62,
    optimalSharpe: 2.15,
    totalCost: 451.80,
    expectedGain: 1847.50,
  }

  const getActionColor = (type: string) => {
    if (type === 'increase') return 'text-green-600'
    if (type === 'decrease') return 'text-red-600'
    return 'text-gray-600'
  }

  const getActionBadge = (type: string) => {
    if (type === 'increase') return 'default'
    if (type === 'decrease') return 'destructive'
    return 'secondary'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8" />
            Portfolio Optimization Engine
          </h1>
          <p className="text-muted-foreground mt-2">
            Mean-variance optimization with Markowitz framework and multi-objective analysis
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #29
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expected Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {optimizationMetrics.optimalReturn}%
            </div>
            <p className="text-xs text-muted-foreground">
              +{(optimizationMetrics.optimalReturn - optimizationMetrics.currentReturn).toFixed(1)}% improvement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Portfolio Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {optimizationMetrics.optimalRisk}
            </div>
            <p className="text-xs text-muted-foreground">
              -{(optimizationMetrics.currentRisk - optimizationMetrics.optimalRisk).toFixed(1)} reduction
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {optimizationMetrics.optimalSharpe}
            </div>
            <p className="text-xs text-muted-foreground">
              +{((optimizationMetrics.optimalSharpe / optimizationMetrics.currentSharpe - 1) * 100).toFixed(1)}% better
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net Benefit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(optimizationMetrics.expectedGain - optimizationMetrics.totalCost).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Annual expected gain</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="objectives" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="objectives">
            <Scale className="h-4 w-4 mr-2" />
            Objectives
          </TabsTrigger>
          <TabsTrigger value="allocation">
            <BarChart3 className="h-4 w-4 mr-2" />
            Allocation
          </TabsTrigger>
          <TabsTrigger value="rebalance">
            <Zap className="h-4 w-4 mr-2" />
            Rebalance
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="objectives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Objectives</CardTitle>
              <CardDescription>Multi-objective portfolio optimization results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {objectives.map((obj, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{obj.name}</div>
                        <div className="text-sm text-muted-foreground">Weight: {obj.weight}%</div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        +{obj.improvement.toFixed(1)}% improvement
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Current</div>
                        <div className="text-2xl font-bold">{obj.current.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Optimal</div>
                        <div className="text-2xl font-bold text-green-600">{obj.optimal.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="bg-secondary rounded-full h-2">
                      <div
                        className="bg-green-500 rounded-full h-2 transition-all"
                        style={{ width: `${obj.improvement}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimal Allocation</CardTitle>
              <CardDescription>Current vs. optimal position weights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positions.map((position, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{position.pair}</div>
                        <div className="text-sm text-muted-foreground">
                          APR: {position.apr}% | Risk: {position.risk}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {position.optimal > position.current ? '+' : ''}
                        {(position.optimal - position.current).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Current Allocation</span>
                        <span className="font-medium">{position.current.toFixed(1)}%</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className="bg-blue-500 rounded-full h-2"
                          style={{ width: `${position.current}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Optimal Allocation</span>
                        <span className="font-medium text-green-600">{position.optimal.toFixed(1)}%</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2"
                          style={{ width: `${position.optimal}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rebalance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rebalancing Actions</CardTitle>
              <CardDescription>Automated rebalancing execution plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rebalanceActions.map((action, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{action.position}</div>
                        <div className={`text-sm ${getActionColor(action.type)}`}>
                          {action.type.toUpperCase()}: {action.from.toFixed(1)}% → {action.to.toFixed(1)}%
                        </div>
                      </div>
                      <Badge variant={getActionBadge(action.type)}>
                        {action.change > 0 ? '+' : ''}{action.change.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Transaction Cost</div>
                        <div className="font-medium">${action.cost.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Action Type</div>
                        <div className={`font-medium ${getActionColor(action.type)}`}>
                          {action.type === 'increase' ? 'Add Liquidity' : action.type === 'decrease' ? 'Remove Liquidity' : 'No Change'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-semibold">Total Rebalancing Cost</div>
                      <div className="text-sm text-muted-foreground">All transactions combined</div>
                    </div>
                    <div className="text-2xl font-bold">${optimizationMetrics.totalCost.toFixed(2)}</div>
                  </div>
                  <Button className="w-full" size="lg">
                    Execute Rebalancing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Parameters</CardTitle>
              <CardDescription>Adjust optimization constraints and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Risk Tolerance</label>
                  <span className="text-sm text-muted-foreground">{riskTolerance[0]}%</span>
                </div>
                <Slider
                  value={riskTolerance}
                  onValueChange={setRiskTolerance}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher values allow for riskier allocations with potentially higher returns
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Return Target</label>
                  <span className="text-sm text-muted-foreground">{returnTarget[0]}%</span>
                </div>
                <Slider
                  value={returnTarget}
                  onValueChange={setReturnTarget}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Target return level for portfolio optimization
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Liquidity Weight</label>
                  <span className="text-sm text-muted-foreground">{liquidityWeight[0]}%</span>
                </div>
                <Slider
                  value={liquidityWeight}
                  onValueChange={setLiquidityWeight}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Importance of liquidity in optimization (higher = prefer liquid positions)
                </p>
              </div>

              <div className="pt-4">
                <Button className="w-full">
                  Recalculate Optimization
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Efficient Frontier</CardTitle>
              <CardDescription>Risk-return tradeoff analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {efficientFrontier.map((point, index) => (
                  <div key={index} className="flex items-center gap-4 text-sm">
                    <div className="w-20">Risk: {point.risk}</div>
                    <div className="w-24">Return: {point.return}%</div>
                    <div className="w-28">Sharpe: {point.sharpe}</div>
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${(point.sharpe / 2.15) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}