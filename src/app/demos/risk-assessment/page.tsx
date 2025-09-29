'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { StaggerList } from '@/components/animations/stagger-list'
import {
  AlertTriangle,
  Shield,
  BarChart3,
  Target,
  RefreshCw,
  Calculator,
  Eye
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM } from '@/hooks/use-dlmm'

interface RiskMetrics {
  overallRiskScore: number
  impermanentLossRisk: number
  volatilityRisk: number
  liquidityRisk: number
  concentrationRisk: number
  marketRisk: number
  confidence: number
  timeframe: '24h' | '7d' | '30d'
}

interface StressTestResult {
  scenario: string
  priceChange: number
  expectedLoss: number
  probabilityOfLoss: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendation: string
}

interface RiskFactorBreakdown {
  factor: string
  contribution: number
  severity: 'low' | 'medium' | 'high'
  description: string
  mitigation: string
}

const MOCK_RISK_METRICS: RiskMetrics = {
  overallRiskScore: 67,
  impermanentLossRisk: 72,
  volatilityRisk: 58,
  liquidityRisk: 35,
  concentrationRisk: 81,
  marketRisk: 63,
  confidence: 85,
  timeframe: '7d'
}

const MOCK_STRESS_TESTS: StressTestResult[] = [
  {
    scenario: 'Market Crash (-30%)',
    priceChange: -30,
    expectedLoss: -15.7,
    probabilityOfLoss: 85,
    riskLevel: 'critical',
    recommendation: 'Consider reducing position size or hedging exposure'
  },
  {
    scenario: 'High Volatility (+/-20%)',
    priceChange: 20,
    expectedLoss: -8.3,
    probabilityOfLoss: 65,
    riskLevel: 'high',
    recommendation: 'Widen price ranges to reduce rebalancing frequency'
  },
  {
    scenario: 'Gradual Decline (-15%)',
    priceChange: -15,
    expectedLoss: -6.2,
    probabilityOfLoss: 45,
    riskLevel: 'medium',
    recommendation: 'Monitor position and prepare exit strategy'
  },
  {
    scenario: 'Normal Volatility (+/-10%)',
    priceChange: 10,
    expectedLoss: -2.1,
    probabilityOfLoss: 25,
    riskLevel: 'low',
    recommendation: 'Current position sizing is appropriate'
  }
]

const MOCK_RISK_FACTORS: RiskFactorBreakdown[] = [
  {
    factor: 'Position Concentration',
    contribution: 35,
    severity: 'high',
    description: '65% of portfolio in single SOL/USDC position',
    mitigation: 'Diversify across multiple pools and assets'
  },
  {
    factor: 'Impermanent Loss Exposure',
    contribution: 28,
    severity: 'high',
    description: 'High correlation with SOL price movements',
    mitigation: 'Consider stable pair allocations (USDC/USDT)'
  },
  {
    factor: 'Range Positioning',
    contribution: 20,
    severity: 'medium',
    description: 'Narrow ranges increase rebalancing frequency',
    mitigation: 'Optimize range width based on volatility'
  },
  {
    factor: 'Liquidity Pool Depth',
    contribution: 12,
    severity: 'low',
    description: 'Sufficient liquidity in selected pools',
    mitigation: 'Monitor daily volume and liquidity metrics'
  },
  {
    factor: 'Market Conditions',
    contribution: 5,
    severity: 'low',
    description: 'Current market sentiment is neutral',
    mitigation: 'Stay informed on market developments'
  }
]

export default function RiskAssessmentDemo() {
  const { publicKey } = useWallet()
  const { connected } = useDLMM()

  // Use variables to satisfy TypeScript
  console.log('Risk assessment demo initialized:', { connected, hasWallet: !!publicKey })
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('7d')
  const [assessmentRunning, setAssessmentRunning] = useState(false)
  const [selectedStressTest, setSelectedStressTest] = useState<StressTestResult | null>(null)

  const runRiskAssessment = async () => {
    setAssessmentRunning(true)
    // Simulate risk assessment calculation
    await new Promise(resolve => setTimeout(resolve, 3000))
    setAssessmentRunning(false)
  }

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
    if (score <= 50) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
    if (score <= 70) return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200'
    return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
  }

  const getRiskLevel = (score: number) => {
    if (score <= 30) return 'LOW'
    if (score <= 50) return 'MEDIUM'
    if (score <= 70) return 'HIGH'
    return 'CRITICAL'
  }

  const getStressTestColor = (level: StressTestResult['riskLevel']) => {
    switch (level) {
      case 'low': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
      case 'high': return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
      case 'critical': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
    }
  }

  const getSeverityColor = (severity: RiskFactorBreakdown['severity']) => {
    switch (severity) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[17] || { id: 17, name: 'Risk Assessment Engine', status: 'live' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-saros-primary to-saros-secondary flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-saros-primary to-saros-secondary bg-clip-text text-transparent">
              Risk Assessment Engine
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive portfolio risk scoring with impermanent loss prediction, stress testing, and risk mitigation strategies for informed decision-making.
          </p>
        </motion.div>
      </FeatureIdentifier>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Assessment Period:</span>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as '24h' | '7d' | '30d')}
              className="border border-input rounded-md px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
          </div>
        </div>

        <Button
          onClick={runRiskAssessment}
          disabled={assessmentRunning}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${assessmentRunning ? 'animate-spin' : ''}`} />
          {assessmentRunning ? 'Analyzing...' : 'Run Assessment'}
        </Button>
      </div>

      {/* Risk Overview */}
      <Card className="border-2 border-dashed border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Shield className="h-5 w-5" />
              Overall Portfolio Risk Assessment
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className={getRiskColor(MOCK_RISK_METRICS.overallRiskScore)}>
                {getRiskLevel(MOCK_RISK_METRICS.overallRiskScore)} RISK
              </Badge>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                  {MOCK_RISK_METRICS.overallRiskScore}/100
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">
                  {MOCK_RISK_METRICS.confidence}% Confidence
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StaggerList className="grid grid-cols-2 md:grid-cols-5 gap-6" staggerDelay={0.1}>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {MOCK_RISK_METRICS.impermanentLossRisk}
              </div>
              <p className="text-sm text-muted-foreground">IL Risk</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full bg-red-600"
                  style={{ width: `${MOCK_RISK_METRICS.impermanentLossRisk}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {MOCK_RISK_METRICS.volatilityRisk}
              </div>
              <p className="text-sm text-muted-foreground">Volatility Risk</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full bg-orange-600"
                  style={{ width: `${MOCK_RISK_METRICS.volatilityRisk}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {MOCK_RISK_METRICS.liquidityRisk}
              </div>
              <p className="text-sm text-muted-foreground">Liquidity Risk</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full bg-yellow-600"
                  style={{ width: `${MOCK_RISK_METRICS.liquidityRisk}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {MOCK_RISK_METRICS.concentrationRisk}
              </div>
              <p className="text-sm text-muted-foreground">Concentration</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full bg-red-600"
                  style={{ width: `${MOCK_RISK_METRICS.concentrationRisk}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {MOCK_RISK_METRICS.marketRisk}
              </div>
              <p className="text-sm text-muted-foreground">Market Risk</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full bg-orange-600"
                  style={{ width: `${MOCK_RISK_METRICS.marketRisk}%` }}
                />
              </div>
            </div>
          </StaggerList>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="stress-testing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stress-testing">Stress Testing</TabsTrigger>
          <TabsTrigger value="risk-factors">Risk Factor Analysis</TabsTrigger>
          <TabsTrigger value="mitigation">Risk Mitigation</TabsTrigger>
        </TabsList>

        {/* Stress Testing Tab */}
        <TabsContent value="stress-testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Portfolio Stress Testing Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_STRESS_TESTS.map((test, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${getStressTestColor(test.riskLevel)}`}
                    onClick={() => setSelectedStressTest(test)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{test.scenario}</h3>
                      <Badge
                        className={`${
                          test.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                          test.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          test.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {test.riskLevel.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Price Change</p>
                        <p className={`text-lg font-bold ${test.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {test.priceChange > 0 ? '+' : ''}{test.priceChange}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Expected Loss</p>
                        <p className="text-lg font-bold text-red-600">
                          {test.expectedLoss}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Probability</p>
                        <p className="text-lg font-bold">
                          {test.probabilityOfLoss}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">VaR (95%)</p>
                        <p className="text-lg font-bold text-purple-600">
                          {(test.expectedLoss * 1.2).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground border-t pt-3">
                      <strong>Recommendation:</strong> {test.recommendation}
                    </div>
                  </motion.div>
                ))}
              </div>

              {selectedStressTest && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 bg-muted/50 rounded-lg"
                >
                  <h4 className="font-semibold mb-3">Detailed Analysis: {selectedStressTest.scenario}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-2">Impact Assessment</h5>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Portfolio value impact: {selectedStressTest.expectedLoss}%</li>
                        <li>• Confidence interval: 85% - 95%</li>
                        <li>• Recovery time estimate: 2-4 weeks</li>
                        <li>• Liquidity impact: Minimal</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Mitigation Actions</h5>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Monitor position sizing closely</li>
                        <li>• Set up automated stop-loss triggers</li>
                        <li>• Consider diversification strategies</li>
                        <li>• Prepare emergency exit plan</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Factors Tab */}
        <TabsContent value="risk-factors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Risk Factor Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_RISK_FACTORS.map((factor, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{factor.factor}</h3>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={`${getSeverityColor(factor.severity)} bg-opacity-10`}
                        >
                          {factor.severity.toUpperCase()}
                        </Badge>
                        <span className="text-lg font-bold">{factor.contribution}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className={`h-3 rounded-full ${
                          factor.severity === 'low' ? 'bg-green-600' :
                          factor.severity === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${factor.contribution}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Description:</p>
                        <p>{factor.description}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Mitigation Strategy:</p>
                        <p>{factor.mitigation}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Mitigation Tab */}
        <TabsContent value="mitigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Risk Mitigation Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Immediate Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Immediate Actions Required</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                              Reduce Position Concentration
                            </h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                              65% portfolio concentration in SOL/USDC presents significant risk.
                            </p>
                            <Button size="sm" variant="outline" className="border-red-300 text-red-700">
                              Diversify Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Target className="h-6 w-6 text-orange-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                              Set Stop-Loss Triggers
                            </h4>
                            <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                              Implement automated exit strategies for IL &gt; 10% scenarios.
                            </p>
                            <Button size="sm" variant="outline" className="border-orange-300 text-orange-700">
                              Configure Alerts
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Medium-term Strategies */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-yellow-600">Medium-term Strategies</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="w-6 h-6 rounded-full bg-yellow-600 text-white text-xs flex items-center justify-center mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Portfolio Rebalancing</p>
                        <p className="text-sm text-muted-foreground">
                          Gradually reduce high-risk positions and increase exposure to stable pairs (USDC/USDT).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="w-6 h-6 rounded-full bg-yellow-600 text-white text-xs flex items-center justify-center mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Dynamic Range Management</p>
                        <p className="text-sm text-muted-foreground">
                          Implement volatility-based range adjustments to optimize capital efficiency while managing risk.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="w-6 h-6 rounded-full bg-yellow-600 text-white text-xs flex items-center justify-center mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Hedging Strategies</p>
                        <p className="text-sm text-muted-foreground">
                          Consider implementing delta-neutral strategies to reduce directional exposure.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Long-term Risk Management */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-600">Long-term Risk Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                      <CardContent className="pt-6">
                        <Eye className="h-8 w-8 text-green-600 mb-3" />
                        <h4 className="font-semibold mb-2">Continuous Monitoring</h4>
                        <p className="text-sm text-muted-foreground">
                          Implement real-time risk monitoring with automated alerts and dashboard tracking.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                      <CardContent className="pt-6">
                        <BarChart3 className="h-8 w-8 text-green-600 mb-3" />
                        <h4 className="font-semibold mb-2">Regular Assessment</h4>
                        <p className="text-sm text-muted-foreground">
                          Conduct weekly risk assessments and quarterly strategy reviews for optimization.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                      <CardContent className="pt-6">
                        <Target className="h-8 w-8 text-green-600 mb-3" />
                        <h4 className="font-semibold mb-2">Risk Budgeting</h4>
                        <p className="text-sm text-muted-foreground">
                          Establish clear risk limits and allocation guidelines for each position type.
                        </p>
                      </CardContent>
                    </Card>
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