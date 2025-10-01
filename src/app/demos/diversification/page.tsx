'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PieChart, AlertCircle, Award, Target } from 'lucide-react'

interface Position {
  pair: string
  weight: number
  asset: string
  sector: string
  correlation: number
}

interface DiversificationMetric {
  name: string
  current: number
  optimal: number
  rating: 'excellent' | 'good' | 'fair' | 'poor'
  description: string
}

interface ConcentrationRisk {
  category: string
  hhi: number
  positions: number
  maxWeight: number
  risk: 'low' | 'medium' | 'high'
}

interface Recommendation {
  action: string
  impact: string
  priority: 'high' | 'medium' | 'low'
  diversificationGain: number
}

export default function DiversificationAnalysisDemo() {
  const positions: Position[] = [
    { pair: 'SOL/USDC', weight: 45.5, asset: 'SOL', sector: 'L1', correlation: 1.0 },
    { pair: 'BONK/SOL', weight: 22.7, asset: 'BONK', sector: 'Meme', correlation: 0.68 },
    { pair: 'RAY/USDC', weight: 18.2, asset: 'RAY', sector: 'DeFi', correlation: 0.52 },
    { pair: 'JTO/SOL', weight: 13.6, asset: 'JTO', sector: 'L1', correlation: 0.58 },
  ]

  const metrics: DiversificationMetric[] = [
    {
      name: 'Portfolio HHI',
      current: 3247,
      optimal: 2500,
      rating: 'fair',
      description: 'Herfindahl-Hirschman Index measures concentration (lower is better)',
    },
    {
      name: 'Effective N',
      current: 3.08,
      optimal: 4.0,
      rating: 'fair',
      description: 'Number of "effective" positions (higher indicates better diversification)',
    },
    {
      name: 'Diversification Ratio',
      current: 0.68,
      optimal: 0.85,
      rating: 'good',
      description: 'Portfolio volatility vs weighted average volatility (higher is better)',
    },
    {
      name: 'Correlation Score',
      current: 0.595,
      optimal: 0.4,
      rating: 'fair',
      description: 'Average pairwise correlation (lower indicates better diversification)',
    },
  ]

  const concentrationRisks: ConcentrationRisk[] = [
    { category: 'By Asset', hhi: 3247, positions: 4, maxWeight: 45.5, risk: 'medium' },
    { category: 'By Sector', hhi: 4285, positions: 3, maxWeight: 59.1, risk: 'high' },
    { category: 'By Protocol', hhi: 10000, positions: 1, maxWeight: 100, risk: 'high' },
  ]

  const recommendations: Recommendation[] = [
    {
      action: 'Reduce SOL/USDC allocation to 35%',
      impact: 'Decrease HHI by 485 points',
      priority: 'high',
      diversificationGain: 14.9,
    },
    {
      action: 'Add new sector (e.g., Gaming, NFT)',
      impact: 'Improve sector diversification by 28%',
      priority: 'high',
      diversificationGain: 22.5,
    },
    {
      action: 'Increase RAY/USDC to balance DeFi exposure',
      impact: 'Better sector balance, +12% diversification',
      priority: 'medium',
      diversificationGain: 12.3,
    },
    {
      action: 'Add uncorrelated asset (e.g., stablecoin pair)',
      impact: 'Reduce average correlation to 0.45',
      priority: 'medium',
      diversificationGain: 18.7,
    },
  ]

  const overallScore = 68.5
  const potentialScore = 85.2

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-blue-600'
      case 'fair':
        return 'text-yellow-600'
      case 'poor':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'default'
      case 'good':
        return 'default'
      case 'fair':
        return 'secondary'
      case 'poor':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PieChart className="h-8 w-8" />
            Diversification Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            HHI calculations, diversification scoring, and correlation analysis
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #30
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Diversification Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{overallScore}/100</div>
              <div className="bg-secondary rounded-full h-2">
                <div
                  className="bg-yellow-500 rounded-full h-2"
                  style={{ width: `${overallScore}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Fair diversification</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Potential Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">{potentialScore}/100</div>
              <div className="bg-secondary rounded-full h-2">
                <div
                  className="bg-green-500 rounded-full h-2"
                  style={{ width: `${potentialScore}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                +{(potentialScore - overallScore).toFixed(1)} with improvements
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Concentration Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">Medium</div>
            <p className="text-xs text-muted-foreground">HHI: 3,247 (target: &lt;2,500)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">
            <Award className="h-4 w-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="positions">
            <PieChart className="h-4 w-4 mr-2" />
            Positions
          </TabsTrigger>
          <TabsTrigger value="concentration">
            <AlertCircle className="h-4 w-4 mr-2" />
            Concentration
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Target className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diversification Metrics</CardTitle>
              <CardDescription>Comprehensive diversification analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {metrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{metric.name}</div>
                        <div className="text-sm text-muted-foreground">{metric.description}</div>
                      </div>
                      <Badge variant={getRatingBadge(metric.rating)} className={getRatingColor(metric.rating)}>
                        {metric.rating.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Current</div>
                        <div className="text-2xl font-bold">{metric.current.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Optimal</div>
                        <div className="text-2xl font-bold text-green-600">
                          {metric.optimal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress to Optimal</span>
                        <span className="font-medium">
                          {((metric.current / metric.optimal) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{ width: `${Math.min((metric.current / metric.optimal) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Position Breakdown</CardTitle>
              <CardDescription>Portfolio allocation and correlation analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positions.map((position, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{position.pair}</div>
                        <div className="text-sm text-muted-foreground">
                          {position.asset} • {position.sector}
                        </div>
                      </div>
                      <Badge variant="outline">{position.weight.toFixed(1)}%</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Weight</span>
                        <span className="font-medium">{position.weight.toFixed(1)}%</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{ width: `${position.weight}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Avg Correlation</span>
                        <span className="font-medium">{position.correlation.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concentration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Concentration Risk Analysis</CardTitle>
              <CardDescription>HHI analysis across different dimensions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {concentrationRisks.map((risk, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{risk.category}</div>
                        <div className="text-sm text-muted-foreground">
                          {risk.positions} positions • Max weight: {risk.maxWeight.toFixed(1)}%
                        </div>
                      </div>
                      <Badge
                        variant={risk.risk === 'low' ? 'default' : risk.risk === 'medium' ? 'secondary' : 'destructive'}
                        className={getRiskColor(risk.risk)}
                      >
                        {risk.risk.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">HHI Score</span>
                        <span className="font-medium">{risk.hhi.toLocaleString()}</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className={`rounded-full h-2 ${
                            risk.risk === 'high'
                              ? 'bg-red-500'
                              : risk.risk === 'medium'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((risk.hhi / 10000) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {risk.hhi < 1500
                          ? 'Low concentration - well diversified'
                          : risk.hhi < 2500
                          ? 'Moderate concentration - acceptable'
                          : 'High concentration - consider diversifying'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diversification Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions to improve portfolio diversification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="font-semibold">{rec.action}</div>
                        <div className="text-sm text-muted-foreground">{rec.impact}</div>
                      </div>
                      <Badge
                        variant={
                          rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'
                        }
                      >
                        {rec.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">Diversification Gain</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className="bg-green-500 rounded-full h-2"
                              style={{ width: `${rec.diversificationGain}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-green-600">
                            +{rec.diversificationGain.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <Button className="w-full" size="lg">
                    Apply All Recommendations
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}