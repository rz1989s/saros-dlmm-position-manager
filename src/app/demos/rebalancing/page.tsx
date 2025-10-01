'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { StaggerList } from '@/components/animations/stagger-list'
import {
  RotateCcw,
  TrendingUp,
  DollarSign,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Timer,
  BarChart3,
  Calculator,
  Target,
  Zap
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM } from '@/hooks/use-dlmm'

interface RebalanceStrategy {
  id: string
  name: string
  description: string
  type: 'conservative' | 'moderate' | 'aggressive'
  frequency: string
  costBenefit: {
    estimatedCost: number
    projectedBenefit: number
    netBenefit: number
    roi: number
  }
  riskScore: number
  conditions: string[]
  implementation: {
    steps: string[]
    estimatedTime: string
    gasEstimate: number
  }
}

interface RebalanceAnalysis {
  currentEfficiency: number
  optimalEfficiency: number
  improvementPotential: number
  riskReduction: number
  recommendations: RebalanceStrategy[]
}

const MOCK_STRATEGIES: RebalanceStrategy[] = [
  {
    id: 'conservative-tight',
    name: 'Conservative Range Tightening',
    description: 'Narrow price ranges around current market price for higher fee collection',
    type: 'conservative',
    frequency: 'Weekly',
    costBenefit: {
      estimatedCost: 0.15,
      projectedBenefit: 0.42,
      netBenefit: 0.27,
      roi: 180
    },
    riskScore: 2,
    conditions: [
      'Low volatility period (< 5% daily)',
      'Stable trading volume',
      'Current position spread > 10%'
    ],
    implementation: {
      steps: [
        'Calculate optimal bin range based on volatility',
        'Estimate gas costs for rebalancing',
        'Execute position rebalancing with minimal slippage',
        'Monitor new position performance'
      ],
      estimatedTime: '15-20 minutes',
      gasEstimate: 0.025
    }
  },
  {
    id: 'moderate-volatility',
    name: 'Volatility-Adjusted Rebalancing',
    description: 'Dynamic range adjustment based on market volatility patterns',
    type: 'moderate',
    frequency: 'Bi-weekly',
    costBenefit: {
      estimatedCost: 0.22,
      projectedBenefit: 0.68,
      netBenefit: 0.46,
      roi: 209
    },
    riskScore: 4,
    conditions: [
      'Medium volatility (5-15% daily)',
      'Clear trend direction',
      'Volume above 30-day average'
    ],
    implementation: {
      steps: [
        'Analyze 30-day volatility patterns',
        'Calculate Bollinger Band-based ranges',
        'Implement dynamic bin allocation',
        'Set up automated monitoring alerts'
      ],
      estimatedTime: '25-30 minutes',
      gasEstimate: 0.035
    }
  },
  {
    id: 'aggressive-momentum',
    name: 'Momentum-Based Aggressive Rebalancing',
    description: 'High-frequency rebalancing for maximum fee capture during trending markets',
    type: 'aggressive',
    frequency: 'Daily',
    costBenefit: {
      estimatedCost: 0.35,
      projectedBenefit: 1.25,
      netBenefit: 0.90,
      roi: 257
    },
    riskScore: 7,
    conditions: [
      'High volatility (> 15% daily)',
      'Strong momentum indicators',
      'High trading volume'
    ],
    implementation: {
      steps: [
        'Implement momentum indicator analysis',
        'Calculate optimal entry/exit points',
        'Execute rapid position adjustments',
        'Continuous performance monitoring'
      ],
      estimatedTime: '10-15 minutes',
      gasEstimate: 0.045
    }
  }
]

export default function RebalancingDemo() {
  const { publicKey } = useWallet()
  const { connected } = useDLMM()
  const [selectedStrategy, setSelectedStrategy] = useState<RebalanceStrategy | null>(null)
  const [analysis, setAnalysis] = useState<RebalanceAnalysis | null>(null)
  const [simulationRunning, setSimulationRunning] = useState(false)

  // Simulate rebalancing analysis
  useEffect(() => {
    if (connected && publicKey) {
      // Simulate analysis calculation
      const mockAnalysis: RebalanceAnalysis = {
        currentEfficiency: 72,
        optimalEfficiency: 89,
        improvementPotential: 17,
        riskReduction: 23,
        recommendations: MOCK_STRATEGIES
      }
      setAnalysis(mockAnalysis)
    }
  }, [connected, publicKey])

  const runSimulation = async (strategy: RebalanceStrategy) => {
    setSimulationRunning(true)
    setSelectedStrategy(strategy)

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    setSimulationRunning(false)
  }

  const getStrategyColor = (type: RebalanceStrategy['type']) => {
    switch (type) {
      case 'conservative': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'aggressive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600'
    if (score <= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[11] || { id: 11, name: 'Advanced Rebalancing System', status: 'live' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-saros-primary to-saros-secondary flex items-center justify-center">
              <RotateCcw className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-saros-primary to-saros-secondary bg-clip-text text-transparent">
              Advanced Rebalancing System
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Intelligent rebalancing strategies with comprehensive cost-benefit analysis, risk assessment, and execution simulation for optimal position management.
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
                Connect your wallet to analyze your positions and generate rebalancing recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Overview */}
      {analysis && (
        <StaggerList className="grid grid-cols-1 md:grid-cols-4 gap-6" staggerDelay={0.1}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Efficiency</p>
                  <p className="text-2xl font-bold">{analysis.currentEfficiency}%</p>
                </div>
                <Gauge className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Optimal Efficiency</p>
                  <p className="text-2xl font-bold text-green-600">{analysis.optimalEfficiency}%</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Improvement Potential</p>
                  <p className="text-2xl font-bold text-saros-primary">+{analysis.improvementPotential}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-saros-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Reduction</p>
                  <p className="text-2xl font-bold text-blue-600">{analysis.riskReduction}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </StaggerList>
      )}

      {/* Main Content */}
      <Tabs defaultValue="strategies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strategies">Rebalancing Strategies</TabsTrigger>
          <TabsTrigger value="simulation">Strategy Simulation</TabsTrigger>
          <TabsTrigger value="analysis">Cost-Benefit Analysis</TabsTrigger>
        </TabsList>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Available Rebalancing Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.1}>
                {MOCK_STRATEGIES.map((strategy) => (
                  <motion.div
                    key={strategy.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold leading-tight mb-2">
                              {strategy.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mb-3">
                              {strategy.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge className={getStrategyColor(strategy.type)}>
                            {strategy.type}
                          </Badge>
                          <Badge variant="outline">
                            {strategy.frequency}
                          </Badge>
                          <Badge variant="outline" className={getRiskColor(strategy.riskScore)}>
                            Risk: {strategy.riskScore}/10
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Cost-Benefit Summary */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Estimated Cost:</span>
                            <span className="text-red-600">-{strategy.costBenefit.estimatedCost} SOL</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Projected Benefit:</span>
                            <span className="text-green-600">+{strategy.costBenefit.projectedBenefit} SOL</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium">
                            <span>Net Benefit:</span>
                            <span className="text-saros-primary">+{strategy.costBenefit.netBenefit} SOL</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium">
                            <span>ROI:</span>
                            <span className="text-saros-secondary">{strategy.costBenefit.roi}%</span>
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => runSimulation(strategy)}
                          disabled={simulationRunning}
                        >
                          {simulationRunning && selectedStrategy?.id === strategy.id ? (
                            <>
                              <Timer className="h-4 w-4 mr-2 animate-spin" />
                              Simulating...
                            </>
                          ) : (
                            <>
                              <Calculator className="h-4 w-4 mr-2" />
                              Run Simulation
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </StaggerList>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulation Tab */}
        <TabsContent value="simulation" className="space-y-6">
          {selectedStrategy ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Strategy Simulation: {selectedStrategy.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Implementation Steps */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Implementation Steps</h3>
                  <div className="space-y-3">
                    {selectedStrategy.implementation.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-saros-primary text-white text-xs flex items-center justify-center mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Required Conditions</h3>
                  <div className="space-y-2">
                    {selectedStrategy.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Execution Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Estimated Time</p>
                          <p className="text-lg font-bold">{selectedStrategy.implementation.estimatedTime}</p>
                        </div>
                        <Timer className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Gas Estimate</p>
                          <p className="text-lg font-bold">{selectedStrategy.implementation.gasEstimate} SOL</p>
                        </div>
                        <DollarSign className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Strategy Selected</h3>
                  <p className="text-muted-foreground">
                    Select a rebalancing strategy from the Strategies tab to run a simulation.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Comprehensive Cost-Benefit Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {MOCK_STRATEGIES.map((strategy) => (
                  <div key={strategy.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{strategy.name}</h3>
                      <Badge className={getStrategyColor(strategy.type)}>
                        {strategy.type}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Cost</p>
                        <p className="text-lg font-bold text-red-600">
                          {strategy.costBenefit.estimatedCost} SOL
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Benefit</p>
                        <p className="text-lg font-bold text-green-600">
                          {strategy.costBenefit.projectedBenefit} SOL
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Net</p>
                        <p className="text-lg font-bold text-saros-primary">
                          {strategy.costBenefit.netBenefit} SOL
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">ROI</p>
                        <p className="text-lg font-bold text-saros-secondary">
                          {strategy.costBenefit.roi}%
                        </p>
                      </div>
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