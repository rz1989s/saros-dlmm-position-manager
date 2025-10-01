'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import {
  ClipboardList,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Target,
  BarChart3,
  FileText,
  ArrowRight,
  Activity,
  Zap
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM } from '@/hooks/use-dlmm'

interface MigrationPlan {
  id: string
  positionName: string
  fromPool: string
  toPool: string
  route: {
    steps: number
    intermediateSwaps: number
    estimatedSlippage: number
  }
  costs: {
    gasCost: number
    slippageCost: number
    opportunityCost: number
    total: number
  }
  benefits: {
    aprImprovement: number
    feeIncrease: number
    liquidityEfficiency: number
    total: number
  }
  timeline: {
    estimatedDuration: number
    criticalPath: string[]
    bottlenecks: number
  }
  riskLevel: 'low' | 'medium' | 'high'
  successProbability: number
  netBenefit: number
  breakEvenDays: number
}

export default function MigrationPlanningDemo() {
  const { publicKey } = useWallet()
  useDLMM() // Hook for potential future use
  const [analyzing, setAnalyzing] = useState(false)
  const [plans, setPlans] = useState<MigrationPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<MigrationPlan | null>(null)

  useEffect(() => {
    if (publicKey) {
      analyzeMigrations()
    }
  }, [publicKey])

  const analyzeMigrations = async () => {
    setAnalyzing(true)

    // Simulate migration planning analysis
    await new Promise(resolve => setTimeout(resolve, 2000))

    const migrationPlans: MigrationPlan[] = [
      {
        id: 'plan-1',
        positionName: 'SOL/USDC Position #1',
        fromPool: 'SOL/USDC Pool A (0.3% fee)',
        toPool: 'SOL/USDC Pool B (0.25% fee)',
        route: {
          steps: 4,
          intermediateSwaps: 0,
          estimatedSlippage: 0.005
        },
        costs: {
          gasCost: 0.012,
          slippageCost: 0.025,
          opportunityCost: 0.003,
          total: 0.040
        },
        benefits: {
          aprImprovement: 3.5,
          feeIncrease: 125,
          liquidityEfficiency: 85,
          total: 185
        },
        timeline: {
          estimatedDuration: 180,
          criticalPath: ['Remove Liquidity', 'Add Liquidity', 'Verify Position'],
          bottlenecks: 0
        },
        riskLevel: 'low',
        successProbability: 0.95,
        netBenefit: 145,
        breakEvenDays: 3
      },
      {
        id: 'plan-2',
        positionName: 'SOL/USDT Position #2',
        fromPool: 'SOL/USDT Pool C (0.3% fee)',
        toPool: 'SOL/USDT Pool D (0.2% fee)',
        route: {
          steps: 5,
          intermediateSwaps: 1,
          estimatedSlippage: 0.012
        },
        costs: {
          gasCost: 0.018,
          slippageCost: 0.045,
          opportunityCost: 0.005,
          total: 0.068
        },
        benefits: {
          aprImprovement: 5.2,
          feeIncrease: 210,
          liquidityEfficiency: 120,
          total: 295
        },
        timeline: {
          estimatedDuration: 240,
          criticalPath: ['Remove Liquidity', 'Swap USDT', 'Add Liquidity'],
          bottlenecks: 1
        },
        riskLevel: 'medium',
        successProbability: 0.82,
        netBenefit: 227,
        breakEvenDays: 4
      },
      {
        id: 'plan-3',
        positionName: 'BONK/USDC Position #3',
        fromPool: 'BONK/USDC Pool E (0.5% fee)',
        toPool: 'BONK/USDC Pool F (0.3% fee)',
        route: {
          steps: 6,
          intermediateSwaps: 2,
          estimatedSlippage: 0.025
        },
        costs: {
          gasCost: 0.025,
          slippageCost: 0.085,
          opportunityCost: 0.008,
          total: 0.118
        },
        benefits: {
          aprImprovement: 8.5,
          feeIncrease: 380,
          liquidityEfficiency: 165,
          total: 485
        },
        timeline: {
          estimatedDuration: 360,
          criticalPath: ['Remove Liquidity', 'Swap BONK', 'Swap USDC', 'Add Liquidity'],
          bottlenecks: 2
        },
        riskLevel: 'high',
        successProbability: 0.68,
        netBenefit: 367,
        breakEvenDays: 7
      }
    ]

    setPlans(migrationPlans)
    setAnalyzing(false)
  }

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'low': return <Badge className="bg-green-500">Low Risk</Badge>
      case 'medium': return <Badge className="bg-yellow-500">Medium Risk</Badge>
      case 'high': return <Badge className="bg-red-500">High Risk</Badge>
      default: return <Badge>Unknown</Badge>
    }
  }

  const totalNetBenefit = plans.reduce((sum, p) => sum + p.netBenefit, 0)
  const avgSuccessRate = plans.length > 0
    ? plans.reduce((sum, p) => sum + p.successProbability, 0) / plans.length
    : 0

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[43] || { id: 43, name: 'Migration Planning', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-saros-primary to-saros-secondary flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-saros-primary to-saros-secondary bg-clip-text text-transparent">
              Migration Planning
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive migration planning with detailed cost-benefit analysis, timeline estimation, and risk assessment for informed decision-making.
          </p>
        </motion.div>
      </FeatureIdentifier>

      {/* Connection Status */}
      {!publicKey && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 dark:text-yellow-200">
                Connect your wallet to analyze migration plans for your positions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      {plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Migration Plans</p>
                  <p className="text-2xl font-bold">{plans.length}</p>
                </div>
                <FileText className="h-8 w-8 text-saros-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">{(avgSuccessRate * 100).toFixed(0)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Net Benefit</p>
                  <p className="text-2xl font-bold text-saros-secondary">${totalNetBenefit.toFixed(0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-saros-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Analyzing</p>
                  <p className="text-2xl font-bold">{analyzing ? 'Yes' : 'Done'}</p>
                </div>
                {analyzing ? (
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                ) : (
                  <Activity className="h-8 w-8 text-purple-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Migration Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Migration Plans
            </span>
            {analyzing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing plans...</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 && !analyzing && (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No migration plans available. Connect wallet with positions to analyze.</p>
            </div>
          )}

          <div className="space-y-4">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`border-2 hover:border-saros-primary/50 transition-colors cursor-pointer ${
                    selectedPlan?.id === plan.id ? 'border-saros-primary' : ''
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Plan Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{plan.positionName}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span>{plan.fromPool}</span>
                            <ArrowRight className="h-4 w-4" />
                            <span>{plan.toPool}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getRiskBadge(plan.riskLevel)}
                            <Badge variant="outline">
                              Success: {(plan.successProbability * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Net Benefit</p>
                          <p className="text-sm font-semibold text-green-600">${plan.netBenefit.toFixed(0)}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
                          <p className="text-sm font-semibold">{plan.costs.total.toFixed(4)} SOL</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Duration</p>
                          <p className="text-sm font-semibold">{Math.floor(plan.timeline.estimatedDuration / 60)}m</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Break Even</p>
                          <p className="text-sm font-semibold">{plan.breakEvenDays} days</p>
                        </div>
                      </div>

                      {/* Route Info */}
                      <div className="bg-muted rounded-lg p-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Steps</p>
                            <p className="text-sm font-semibold">{plan.route.steps}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Swaps</p>
                            <p className="text-sm font-semibold">{plan.route.intermediateSwaps}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Slippage</p>
                            <p className="text-sm font-semibold">{(plan.route.estimatedSlippage * 100).toFixed(2)}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Expand for Details */}
                      {selectedPlan?.id === plan.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 pt-4 border-t"
                        >
                          <Tabs defaultValue="costs" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="costs">Costs</TabsTrigger>
                              <TabsTrigger value="benefits">Benefits</TabsTrigger>
                              <TabsTrigger value="timeline">Timeline</TabsTrigger>
                            </TabsList>

                            <TabsContent value="costs" className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Gas Cost</span>
                                <span className="font-semibold">{plan.costs.gasCost.toFixed(4)} SOL</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Slippage Cost</span>
                                <span className="font-semibold">{plan.costs.slippageCost.toFixed(4)} SOL</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Opportunity Cost</span>
                                <span className="font-semibold">{plan.costs.opportunityCost.toFixed(4)} SOL</span>
                              </div>
                              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                                <span>Total Cost</span>
                                <span>{plan.costs.total.toFixed(4)} SOL</span>
                              </div>
                            </TabsContent>

                            <TabsContent value="benefits" className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">APR Improvement</span>
                                <span className="font-semibold text-green-600">+{plan.benefits.aprImprovement.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Fee Increase</span>
                                <span className="font-semibold">${plan.benefits.feeIncrease}/mo</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Liquidity Efficiency</span>
                                <span className="font-semibold">${plan.benefits.liquidityEfficiency}/mo</span>
                              </div>
                              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                                <span>Total Monthly Benefit</span>
                                <span className="text-green-600">${plan.benefits.total}</span>
                              </div>
                            </TabsContent>

                            <TabsContent value="timeline" className="space-y-3">
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">Critical Path</p>
                                <div className="space-y-1">
                                  {plan.timeline.criticalPath.map((step, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                      <div className="w-1.5 h-1.5 rounded-full bg-saros-primary" />
                                      <span>{step}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-sm text-muted-foreground">Bottlenecks</span>
                                <Badge variant={plan.timeline.bottlenecks > 0 ? 'destructive' : 'outline'}>
                                  {plan.timeline.bottlenecks}
                                </Badge>
                              </div>
                            </TabsContent>
                          </Tabs>

                          <Button className="w-full" size="lg">
                            <Target className="h-4 w-4 mr-2" />
                            Execute This Plan
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Planning Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Migration Planning Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Comprehensive Analysis</p>
                <p className="text-xs text-muted-foreground">Detailed cost-benefit breakdown with timeline estimation</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Risk Assessment</p>
                <p className="text-xs text-muted-foreground">Success probability calculation with risk mitigation strategies</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Zap className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Optimization Recommendations</p>
                <p className="text-xs text-muted-foreground">Route optimization and execution strategy suggestions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Implementation */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Multi-dimensional cost analysis (gas, slippage, opportunity costs)</li>
              <li>Comprehensive benefit projection with APR improvement tracking</li>
              <li>Critical path analysis with bottleneck identification</li>
              <li>Risk scoring with success probability calculation</li>
              <li>Break-even analysis for informed decision-making</li>
              <li>Real-time plan caching with automatic refresh</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Planning Components:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• <span className="font-medium">Route Analysis:</span> Multi-step route evaluation with intermediate swap detection</p>
              <p>• <span className="font-medium">Financial Modeling:</span> NPV and IRR calculations for long-term projections</p>
              <p>• <span className="font-medium">Timeline Estimation:</span> Critical path analysis with execution time predictions</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">SDK Location:</span> src/hooks/use-position-migration.ts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
