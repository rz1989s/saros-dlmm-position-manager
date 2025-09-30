'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LayoutGrid, AlertTriangle, Target, Network } from 'lucide-react'

interface Position {
  id: string
  pair: string
  liquidity: number
  apr: number
  risk: number
  correlation: number
}

interface CorrelationPair {
  position1: string
  position2: string
  correlation: number
  diversificationBenefit: number
}

interface RiskContribution {
  position: string
  totalRisk: number
  systematicRisk: number
  idiosyncraticRisk: number
  contribution: number
}

export default function MultiPositionAnalysisDemo() {
  const [selectedPositions] = useState<string[]>(['POS-001', 'POS-002', 'POS-003'])

  const positions: Position[] = [
    { id: 'POS-001', pair: 'SOL/USDC', liquidity: 50000, apr: 18.5, risk: 45, correlation: 1.0 },
    { id: 'POS-002', pair: 'BONK/SOL', liquidity: 25000, apr: 24.2, risk: 72, correlation: 0.68 },
    { id: 'POS-003', pair: 'RAY/USDC', liquidity: 35000, apr: 15.8, risk: 38, correlation: 0.42 },
    { id: 'POS-004', pair: 'JTO/SOL', liquidity: 18000, apr: 28.5, risk: 65, correlation: 0.55 },
  ]

  const correlationMatrix: CorrelationPair[] = [
    { position1: 'SOL/USDC', position2: 'BONK/SOL', correlation: 0.68, diversificationBenefit: 18.5 },
    { position1: 'SOL/USDC', position2: 'RAY/USDC', correlation: 0.42, diversificationBenefit: 32.8 },
    { position1: 'BONK/SOL', position2: 'RAY/USDC', correlation: 0.35, diversificationBenefit: 38.2 },
  ]

  const riskDecomposition: RiskContribution[] = [
    { position: 'SOL/USDC', totalRisk: 45, systematicRisk: 32, idiosyncraticRisk: 13, contribution: 38.5 },
    { position: 'BONK/SOL', totalRisk: 72, systematicRisk: 48, idiosyncraticRisk: 24, contribution: 42.8 },
    { position: 'RAY/USDC', totalRisk: 38, systematicRisk: 28, idiosyncraticRisk: 10, contribution: 18.7 },
  ]

  const portfolioMetrics = {
    totalLiquidity: 110000,
    weightedAPR: 19.8,
    portfolioRisk: 52.3,
    sharpeRatio: 1.85,
    diversificationRatio: 0.72,
    concentrationRisk: 'Medium',
  }

  const optimizationRecommendations = [
    { action: 'Reduce BONK/SOL allocation', impact: '+12.5% risk-adjusted return', priority: 'High', reason: 'High correlation with existing positions' },
    { action: 'Increase RAY/USDC allocation', impact: '+8.2% diversification benefit', priority: 'High', reason: 'Low correlation, strong fundamentals' },
    { action: 'Add stablecoin pair position', impact: '+15.3% risk reduction', priority: 'Medium', reason: 'Portfolio lacks stable income streams' },
    { action: 'Rebalance SOL/USDC weight', impact: '+5.8% efficiency gain', priority: 'Low', reason: 'Slightly overweight in current allocation' },
  ]

  const getRiskColor = (risk: number) => {
    if (risk < 40) return 'text-green-600'
    if (risk < 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCorrelationColor = (corr: number) => {
    if (corr < 0.3) return 'text-green-600'
    if (corr < 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Network className="h-8 w-8" />
            Multi-Position Analysis Engine
          </h1>
          <p className="text-muted-foreground mt-2">
            Cross-position analytics with risk decomposition and portfolio-wide optimization
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #28
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Portfolio Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioMetrics.portfolioRisk}</div>
            <p className="text-xs text-muted-foreground">Risk Score (0-100)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Diversification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioMetrics.diversificationRatio}</div>
            <p className="text-xs text-muted-foreground">Diversification Ratio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioMetrics.sharpeRatio}</div>
            <p className="text-xs text-muted-foreground">Risk-Adjusted Return</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="positions">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Positions
          </TabsTrigger>
          <TabsTrigger value="correlation">
            <Network className="h-4 w-4 mr-2" />
            Correlation
          </TabsTrigger>
          <TabsTrigger value="risk">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <Target className="h-4 w-4 mr-2" />
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Position Overview</CardTitle>
              <CardDescription>Cross-position analytics and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positions.map((position) => (
                  <div key={position.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{position.pair}</div>
                        <div className="text-sm text-muted-foreground">{position.id}</div>
                      </div>
                      <Badge variant={selectedPositions.includes(position.id) ? 'default' : 'outline'}>
                        {selectedPositions.includes(position.id) ? 'Selected' : 'Available'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Liquidity</div>
                        <div className="font-medium">${position.liquidity.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">APR</div>
                        <div className="font-medium text-green-600">{position.apr}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Risk Score</div>
                        <div className={`font-medium ${getRiskColor(position.risk)}`}>{position.risk}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Correlation</div>
                        <div className="font-medium">{position.correlation.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Correlation Matrix</CardTitle>
              <CardDescription>Position correlations and diversification benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {correlationMatrix.map((pair, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{pair.position1} ↔ {pair.position2}</div>
                        <div className="text-sm text-muted-foreground">Pair correlation analysis</div>
                      </div>
                      <Badge variant="outline" className={getCorrelationColor(pair.correlation)}>
                        ρ = {pair.correlation.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Correlation</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{ width: `${pair.correlation * 100}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${getCorrelationColor(pair.correlation)}`}>
                            {(pair.correlation * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Diversification Benefit</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className="bg-green-500 rounded-full h-2"
                              style={{ width: `${pair.diversificationBenefit}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-green-600">
                            {pair.diversificationBenefit.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Decomposition</CardTitle>
              <CardDescription>Systematic vs. idiosyncratic risk analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskDecomposition.map((risk, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{risk.position}</div>
                      <Badge variant="outline">
                        {risk.contribution.toFixed(1)}% contribution
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Risk</span>
                        <span className={`font-medium ${getRiskColor(risk.totalRisk)}`}>{risk.totalRisk}</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1">Systematic</div>
                          <div className="bg-secondary rounded-full h-2">
                            <div
                              className="bg-red-500 rounded-full h-2"
                              style={{ width: `${(risk.systematicRisk / risk.totalRisk) * 100}%` }}
                            />
                          </div>
                          <div className="text-xs font-medium mt-1">{risk.systematicRisk}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1">Idiosyncratic</div>
                          <div className="bg-secondary rounded-full h-2">
                            <div
                              className="bg-yellow-500 rounded-full h-2"
                              style={{ width: `${(risk.idiosyncraticRisk / risk.totalRisk) * 100}%` }}
                            />
                          </div>
                          <div className="text-xs font-medium mt-1">{risk.idiosyncraticRisk}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>AI-powered portfolio optimization suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationRecommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{rec.action}</div>
                        <div className="text-sm text-muted-foreground">{rec.reason}</div>
                      </div>
                      <Badge
                        variant={rec.priority === 'High' ? 'destructive' : rec.priority === 'Medium' ? 'default' : 'secondary'}
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">Expected Impact</div>
                        <div className="text-sm font-medium text-green-600">{rec.impact}</div>
                      </div>
                      <Button size="sm">Apply</Button>
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