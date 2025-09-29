'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import {
  ArrowRightLeft,
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Shield,
  Target,
  Zap,
  PlayCircle,
  RotateCcw
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM } from '@/hooks/use-dlmm'

interface MigrationScenario {
  fromTier: number
  toTier: number
  name: string
  costBenefit: {
    migrationCost: number
    breakEvenDays: number
    potentialGainLoss: number
    riskLevel: 'low' | 'medium' | 'high'
  }
  steps: MigrationStep[]
  rollbackPlan: RollbackStep[]
  timeEstimate: string
  requirements: string[]
}

interface MigrationStep {
  step: number
  action: string
  description: string
  estimatedTime: string
  gasEstimate: number
  reversible: boolean
}

interface RollbackStep {
  trigger: string
  action: string
  timeframe: string
  cost: number
}

interface SensitivityAnalysis {
  scenario: string
  priceChange: number
  volumeChange: number
  impactOnROI: number
  recommendedAction: string
}

const MIGRATION_SCENARIOS: MigrationScenario[] = [
  {
    fromTier: 0.05,
    toTier: 0.25,
    name: 'Conservative to Optimal',
    costBenefit: {
      migrationCost: 0.45,
      breakEvenDays: 12,
      potentialGainLoss: 18.2,
      riskLevel: 'low'
    },
    steps: [
      {
        step: 1,
        action: 'Position Analysis',
        description: 'Analyze current position performance and optimal exit timing',
        estimatedTime: '5 minutes',
        gasEstimate: 0,
        reversible: true
      },
      {
        step: 2,
        action: 'Liquidity Removal',
        description: 'Remove liquidity from current 0.05% tier position',
        estimatedTime: '10 minutes',
        gasEstimate: 0.15,
        reversible: false
      },
      {
        step: 3,
        action: 'Fee Tier Switch',
        description: 'Configure new position parameters for 0.25% tier',
        estimatedTime: '5 minutes',
        gasEstimate: 0.05,
        reversible: true
      },
      {
        step: 4,
        action: 'Position Recreation',
        description: 'Create new position in 0.25% tier with optimized ranges',
        estimatedTime: '10 minutes',
        gasEstimate: 0.25,
        reversible: false
      }
    ],
    rollbackPlan: [
      {
        trigger: 'Negative performance after 7 days',
        action: 'Migrate back to 0.05% tier',
        timeframe: '24 hours',
        cost: 0.35
      },
      {
        trigger: 'Market volatility exceeds 25%',
        action: 'Emergency position closure',
        timeframe: '1 hour',
        cost: 0.20
      }
    ],
    timeEstimate: '30-45 minutes',
    requirements: ['Minimum 100 SOL position size', 'Market volatility < 20%', 'Sufficient SOL for gas fees']
  },
  {
    fromTier: 0.25,
    toTier: 0.05,
    name: 'Optimal to High Volume',
    costBenefit: {
      migrationCost: 0.38,
      breakEvenDays: 18,
      potentialGainLoss: -8.5,
      riskLevel: 'medium'
    },
    steps: [
      {
        step: 1,
        action: 'Market Condition Check',
        description: 'Verify low volatility conditions suitable for 0.05% tier',
        estimatedTime: '10 minutes',
        gasEstimate: 0,
        reversible: true
      },
      {
        step: 2,
        action: 'Position Closure',
        description: 'Close current 0.25% position and collect fees',
        estimatedTime: '12 minutes',
        gasEstimate: 0.18,
        reversible: false
      },
      {
        step: 3,
        action: 'Range Optimization',
        description: 'Calculate optimal ranges for high-volume 0.05% tier',
        estimatedTime: '8 minutes',
        gasEstimate: 0.03,
        reversible: true
      },
      {
        step: 4,
        action: 'High-Volume Position',
        description: 'Create new position optimized for volume capture',
        estimatedTime: '15 minutes',
        gasEstimate: 0.17,
        reversible: false
      }
    ],
    rollbackPlan: [
      {
        trigger: 'Volume below expectations after 14 days',
        action: 'Migrate back to 0.25% tier',
        timeframe: '48 hours',
        cost: 0.42
      }
    ],
    timeEstimate: '45-60 minutes',
    requirements: ['Market volatility < 10%', 'High trading volume expected', 'Patient capital approach']
  }
]

const SENSITIVITY_SCENARIOS: SensitivityAnalysis[] = [
  {
    scenario: 'Market Crash (-30%)',
    priceChange: -30,
    volumeChange: -50,
    impactOnROI: -45,
    recommendedAction: 'Delay migration until market stabilizes'
  },
  {
    scenario: 'Bull Market (+40%)',
    priceChange: 40,
    volumeChange: 80,
    impactOnROI: 25,
    recommendedAction: 'Accelerate migration to capture higher fees'
  },
  {
    scenario: 'Sideways Market (±5%)',
    priceChange: 2,
    volumeChange: -10,
    impactOnROI: 12,
    recommendedAction: 'Proceed with migration as planned'
  },
  {
    scenario: 'High Volatility (±25%)',
    priceChange: 15,
    volumeChange: 30,
    impactOnROI: 35,
    recommendedAction: 'Consider 0.25% tier for better capture'
  }
]

export default function FeeMigrationDemo() {
  const { publicKey } = useWallet()
  const { connected } = useDLMM()
  const [selectedScenario, setSelectedScenario] = useState(0)
  const [migrationInProgress, setMigrationInProgress] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Use variables to satisfy TypeScript
  console.log('Fee migration demo initialized:', { connected, hasWallet: !!publicKey })

  const runMigrationSimulation = async () => {
    setMigrationInProgress(true)
    setCurrentStep(0)

    const scenario = MIGRATION_SCENARIOS[selectedScenario]
    for (let i = 0; i < scenario.steps.length; i++) {
      setCurrentStep(i + 1)
      // Simulate each step
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    setMigrationInProgress(false)
    setCurrentStep(0)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getROIColor = (impact: number) => {
    if (impact > 0) return 'text-green-600'
    if (impact > -10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const currentScenario = MIGRATION_SCENARIOS[selectedScenario]

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[14] || { id: 14, name: 'Fee Tier Migration Analysis', status: 'live' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-saros-primary to-saros-secondary flex items-center justify-center">
              <ArrowRightLeft className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-saros-primary to-saros-secondary bg-clip-text text-transparent">
              Fee Tier Migration Analysis
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive migration planning with cost-benefit analysis, step-by-step execution, and rollback strategies for optimal fee tier transitions.
          </p>
        </motion.div>
      </FeatureIdentifier>

      {/* Migration Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Migration Scenario Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MIGRATION_SCENARIOS.map((scenario, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                  selectedScenario === index ? 'ring-2 ring-saros-primary bg-blue-50 dark:bg-blue-950' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedScenario(index)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{scenario.name}</h3>
                  <Badge className={getRiskColor(scenario.costBenefit.riskLevel)}>
                    {scenario.costBenefit.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">From:</span>
                    <span className="font-medium">{(scenario.fromTier * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">To:</span>
                    <span className="font-medium">{(scenario.toTier * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Migration Cost:</span>
                    <span className="font-medium text-red-600">{scenario.costBenefit.migrationCost} SOL</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Break-even:</span>
                    <span className="font-medium">{scenario.costBenefit.breakEvenDays} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Potential Gain:</span>
                    <span className={`font-medium ${getROIColor(scenario.costBenefit.potentialGainLoss)}`}>
                      {scenario.costBenefit.potentialGainLoss > 0 ? '+' : ''}{scenario.costBenefit.potentialGainLoss.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Cost-Benefit Analysis</TabsTrigger>
          <TabsTrigger value="execution">Execution Plan</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity Testing</TabsTrigger>
          <TabsTrigger value="rollback">Rollback Strategy</TabsTrigger>
        </TabsList>

        {/* Cost-Benefit Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Migration Cost-Benefit Analysis: {currentScenario.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Financial Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Migration Cost</p>
                          <p className="text-2xl font-bold text-red-600">{currentScenario.costBenefit.migrationCost} SOL</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Break-even Period</p>
                          <p className="text-2xl font-bold text-orange-600">{currentScenario.costBenefit.breakEvenDays} days</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Potential ROI</p>
                          <p className={`text-2xl font-bold ${getROIColor(currentScenario.costBenefit.potentialGainLoss)}`}>
                            {currentScenario.costBenefit.potentialGainLoss > 0 ? '+' : ''}{currentScenario.costBenefit.potentialGainLoss.toFixed(1)}%
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Time Estimate</p>
                          <p className="text-lg font-bold text-blue-600">{currentScenario.timeEstimate}</p>
                        </div>
                        <Zap className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Migration Requirements</h3>
                  <div className="space-y-2">
                    {currentScenario.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Assessment */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
                  <Card className={`border-2 ${
                    currentScenario.costBenefit.riskLevel === 'low' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' :
                    currentScenario.costBenefit.riskLevel === 'medium' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950' :
                    'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Shield className={`h-6 w-6 mt-0.5 ${
                          currentScenario.costBenefit.riskLevel === 'low' ? 'text-green-600' :
                          currentScenario.costBenefit.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                        <div>
                          <h4 className="font-semibold mb-2">
                            {currentScenario.costBenefit.riskLevel.toUpperCase()} RISK MIGRATION
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {currentScenario.costBenefit.riskLevel === 'low'
                              ? 'Low risk migration with high probability of success. Market conditions are favorable and migration cost is minimal.'
                              : currentScenario.costBenefit.riskLevel === 'medium'
                              ? 'Moderate risk migration requiring careful timing. Monitor market conditions closely during execution.'
                              : 'High risk migration with significant uncertainty. Consider postponing until market conditions improve.'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Execution Plan Tab */}
        <TabsContent value="execution" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Step-by-Step Execution Plan
                </CardTitle>
                <Button
                  onClick={runMigrationSimulation}
                  disabled={migrationInProgress}
                >
                  {migrationInProgress ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Executing Step {currentStep}...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Simulate Migration
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentScenario.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0.6 }}
                    animate={{
                      opacity: migrationInProgress && currentStep === step.step ? 1 :
                               migrationInProgress && currentStep > step.step ? 0.8 : 0.6,
                      scale: migrationInProgress && currentStep === step.step ? 1.02 : 1
                    }}
                    className={`border rounded-lg p-4 ${
                      migrationInProgress && currentStep === step.step
                        ? 'border-saros-primary bg-blue-50 dark:bg-blue-950'
                        : migrationInProgress && currentStep > step.step
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        migrationInProgress && currentStep === step.step
                          ? 'bg-saros-primary text-white animate-pulse'
                          : migrationInProgress && currentStep > step.step
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {migrationInProgress && currentStep > step.step ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          step.step
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{step.action}</h3>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              {step.estimatedTime}
                            </Badge>
                            {step.gasEstimate > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {step.gasEstimate} SOL gas
                              </Badge>
                            )}
                            <Badge className={step.reversible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {step.reversible ? 'Reversible' : 'Irreversible'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sensitivity Testing Tab */}
        <TabsContent value="sensitivity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Migration Sensitivity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SENSITIVITY_SCENARIOS.map((scenario, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{scenario.scenario}</h3>
                      <Badge className={getROIColor(scenario.impactOnROI)}>
                        ROI Impact: {scenario.impactOnROI > 0 ? '+' : ''}{scenario.impactOnROI}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Price Change</p>
                        <p className={`text-lg font-bold ${scenario.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {scenario.priceChange > 0 ? '+' : ''}{scenario.priceChange}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Volume Change</p>
                        <p className={`text-lg font-bold ${scenario.volumeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {scenario.volumeChange > 0 ? '+' : ''}{scenario.volumeChange}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">ROI Impact</p>
                        <p className={`text-lg font-bold ${getROIColor(scenario.impactOnROI)}`}>
                          {scenario.impactOnROI > 0 ? '+' : ''}{scenario.impactOnROI}%
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground border-t pt-3">
                      <strong>Recommendation:</strong> {scenario.recommendedAction}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rollback Strategy Tab */}
        <TabsContent value="rollback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Emergency Rollback Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        Rollback Safety Net
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Every migration includes predefined rollback triggers and procedures to minimize losses
                        if the migration doesn&apos;t perform as expected.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Automated Rollback Triggers</h3>
                  {currentScenario.rollbackPlan.map((rollback, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-red-800 dark:text-red-200">
                              Trigger: {rollback.trigger}
                            </h4>
                            <Badge className="bg-red-100 text-red-800">
                              Cost: {rollback.cost} SOL
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground mb-1">Action:</p>
                              <p className="font-medium">{rollback.action}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Execution Time:</p>
                              <p className="font-medium">{rollback.timeframe}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Manual Rollback Process</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Emergency Assessment</p>
                        <p className="text-sm text-muted-foreground">
                          Evaluate current position performance and market conditions to determine rollback necessity.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Position Closure</p>
                        <p className="text-sm text-muted-foreground">
                          Immediately close the underperforming position to minimize further losses.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Rollback Execution</p>
                        <p className="text-sm text-muted-foreground">
                          Execute rollback to previous fee tier with optimized parameters based on current market.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}