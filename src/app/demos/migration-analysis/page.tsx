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
  Calculator,
  TrendingUp,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  DollarSign,
  Percent,
  ArrowRight,
  Clock,
  Activity,
  Brain
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM } from '@/hooks/use-dlmm'

interface FinancialMetrics {
  npv: number
  irr: number
  roi: number
  paybackPeriod: number
  breakEvenDays: number
  totalCost: number
  totalBenefit: number
  netBenefit: number
}

interface ScenarioAnalysis {
  scenario: 'best' | 'base' | 'worst'
  probability: number
  aprChange: number
  volumeChange: number
  costMultiplier: number
  expectedReturn: number
  riskScore: number
}

interface ImpactProjection {
  month: number
  cumulativeBenefit: number
  cumulativeCost: number
  netPosition: number
  apr: number
  confidence: number
}

const MOCK_FINANCIAL_METRICS: FinancialMetrics = {
  npv: 2847.50,
  irr: 42.8,
  roi: 285.5,
  paybackPeriod: 4.2,
  breakEvenDays: 8,
  totalCost: 0.45,
  totalBenefit: 3.29,
  netBenefit: 2.84
}

const MOCK_SCENARIOS: ScenarioAnalysis[] = [
  {
    scenario: 'best',
    probability: 25,
    aprChange: 65,
    volumeChange: 150,
    costMultiplier: 0.8,
    expectedReturn: 4850,
    riskScore: 3
  },
  {
    scenario: 'base',
    probability: 50,
    aprChange: 42,
    volumeChange: 95,
    costMultiplier: 1.0,
    expectedReturn: 2847,
    riskScore: 4
  },
  {
    scenario: 'worst',
    probability: 25,
    aprChange: 18,
    volumeChange: 35,
    costMultiplier: 1.3,
    expectedReturn: 980,
    riskScore: 7
  }
]

const MOCK_PROJECTIONS: ImpactProjection[] = [
  { month: 1, cumulativeBenefit: 0.28, cumulativeCost: 0.45, netPosition: -0.17, apr: 14.2, confidence: 0.85 },
  { month: 2, cumulativeBenefit: 0.64, cumulativeCost: 0.45, netPosition: 0.19, apr: 15.8, confidence: 0.88 },
  { month: 3, cumulativeBenefit: 1.12, cumulativeCost: 0.45, netPosition: 0.67, apr: 17.1, confidence: 0.90 },
  { month: 6, cumulativeBenefit: 2.48, cumulativeCost: 0.45, netPosition: 2.03, apr: 18.6, confidence: 0.92 },
  { month: 12, cumulativeBenefit: 5.42, cumulativeCost: 0.45, netPosition: 4.97, apr: 19.2, confidence: 0.95 }
]

export default function MigrationAnalysisDemo() {
  const { publicKey } = useWallet()
  const { connected } = useDLMM()
  const [selectedScenario, setSelectedScenario] = useState<ScenarioAnalysis>(MOCK_SCENARIOS[1])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  console.log('Migration analysis demo initialized:', { connected, hasWallet: !!publicKey })

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsAnalyzing(false)
  }

  const getScenarioColor = (scenario: ScenarioAnalysis['scenario']) => {
    switch (scenario) {
      case 'best': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'base': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'worst': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600'
    if (score <= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.8) return 'text-blue-600'
    return 'text-yellow-600'
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[22] || { id: 22, name: 'Migration Impact Analysis', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-saros-primary to-saros-secondary flex items-center justify-center">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-saros-primary to-saros-secondary bg-clip-text text-transparent">
              Migration Impact Analysis
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive financial analysis with NPV/IRR calculations, scenario modeling, and confidence scoring for data-driven migration decisions.
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
                Connect your wallet to analyze migration impact and view personalized financial projections.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">NPV</p>
                <p className="text-2xl font-bold text-green-600">${MOCK_FINANCIAL_METRICS.npv.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">IRR</p>
                <p className="text-2xl font-bold text-saros-primary">{MOCK_FINANCIAL_METRICS.irr.toFixed(1)}%</p>
              </div>
              <Percent className="h-8 w-8 text-saros-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ROI</p>
                <p className="text-2xl font-bold text-saros-secondary">{MOCK_FINANCIAL_METRICS.roi.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-saros-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payback</p>
                <p className="text-2xl font-bold">{MOCK_FINANCIAL_METRICS.paybackPeriod.toFixed(1)} months</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">Financial Analysis</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Modeling</TabsTrigger>
          <TabsTrigger value="projections">Impact Projections</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Financial Analysis Tab */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Comprehensive Financial Analysis
                </CardTitle>
                <Button onClick={runAnalysis} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Run Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Net Present Value */}
                <div className="border rounded-lg p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Net Present Value (NPV)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Benefit</p>
                      <p className="text-2xl font-bold text-green-600">
                        +${MOCK_FINANCIAL_METRICS.totalBenefit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-2xl font-bold text-red-600">
                        -${MOCK_FINANCIAL_METRICS.totalCost.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Net Benefit</p>
                      <p className="text-2xl font-bold text-saros-primary">
                        ${MOCK_FINANCIAL_METRICS.netBenefit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>NPV Analysis:</strong> With an NPV of ${MOCK_FINANCIAL_METRICS.npv.toFixed(2)},
                      this migration is <strong className="text-green-600">highly profitable</strong>. The positive NPV
                      indicates that the present value of future benefits exceeds the migration cost by a significant margin.
                    </p>
                  </div>
                </div>

                {/* Internal Rate of Return */}
                <div className="border rounded-lg p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Percent className="h-5 w-5 text-blue-600" />
                    Internal Rate of Return (IRR)
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Annualized Return</p>
                      <p className="text-3xl font-bold text-blue-600">{MOCK_FINANCIAL_METRICS.irr.toFixed(1)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">vs. Market Average</p>
                      <p className="text-2xl font-bold text-green-600">+{(MOCK_FINANCIAL_METRICS.irr - 15).toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{ width: `${Math.min(MOCK_FINANCIAL_METRICS.irr, 100)}%` }}
                    />
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>IRR Analysis:</strong> An IRR of {MOCK_FINANCIAL_METRICS.irr.toFixed(1)}% significantly exceeds
                      typical market returns. This <strong className="text-blue-600">exceptional rate</strong> suggests the migration
                      will generate substantial value relative to the investment.
                    </p>
                  </div>
                </div>

                {/* ROI & Payback */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
                    <CardContent className="pt-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        Return on Investment
                      </h4>
                      <p className="text-4xl font-bold text-purple-600 mb-2">
                        {MOCK_FINANCIAL_METRICS.roi.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        For every $1 invested, expect ${(MOCK_FINANCIAL_METRICS.roi / 100 + 1).toFixed(2)} return
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                    <CardContent className="pt-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-600" />
                        Payback Period
                      </h4>
                      <p className="text-4xl font-bold text-orange-600 mb-2">
                        {MOCK_FINANCIAL_METRICS.paybackPeriod.toFixed(1)} months
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Break-even in {MOCK_FINANCIAL_METRICS.breakEvenDays} days - rapid capital recovery
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenario Modeling Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Scenario Analysis & Modeling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_SCENARIOS.map((scenario) => (
                  <motion.div
                    key={scenario.scenario}
                    whileHover={{ scale: 1.01 }}
                    className={`border rounded-lg p-6 cursor-pointer transition-all duration-300 ${
                      selectedScenario.scenario === scenario.scenario
                        ? 'ring-2 ring-saros-primary bg-blue-50 dark:bg-blue-950'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedScenario(scenario)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold capitalize">{scenario.scenario} Case</h3>
                        <Badge className={getScenarioColor(scenario.scenario)}>
                          {scenario.scenario.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Probability</p>
                        <p className="text-2xl font-bold">{scenario.probability}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">APR Change</p>
                        <p className={`text-lg font-bold ${scenario.aprChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          +{scenario.aprChange}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Volume Change</p>
                        <p className={`text-lg font-bold ${scenario.volumeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          +{scenario.volumeChange}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expected Return</p>
                        <p className="text-lg font-bold text-saros-primary">
                          ${scenario.expectedReturn.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Risk Score</p>
                        <p className={`text-lg font-bold ${getRiskColor(scenario.riskScore)}`}>
                          {scenario.riskScore}/10
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        {scenario.scenario === 'best' && (
                          <>
                            <strong>Optimistic scenario:</strong> Market conditions highly favorable with increased liquidity
                            and trading volume. Migration costs lower than expected.
                          </>
                        )}
                        {scenario.scenario === 'base' && (
                          <>
                            <strong>Expected scenario:</strong> Normal market conditions with typical migration costs and
                            moderate performance improvements as projected.
                          </>
                        )}
                        {scenario.scenario === 'worst' && (
                          <>
                            <strong>Conservative scenario:</strong> Unfavorable market conditions with lower than expected
                            improvements and higher migration costs.
                          </>
                        )}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Weighted Average Analysis */}
              <Card className="mt-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <CardContent className="pt-6">
                  <h4 className="text-lg font-semibold mb-4">Probability-Weighted Expected Value</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Weighted Return</p>
                      <p className="text-2xl font-bold text-saros-primary">
                        ${(MOCK_SCENARIOS.reduce((sum, s) => sum + (s.expectedReturn * s.probability / 100), 0)).toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Risk-Adjusted Return</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${((MOCK_SCENARIOS.reduce((sum, s) => sum + (s.expectedReturn * s.probability / 100), 0)) * 0.85).toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence Level</p>
                      <p className="text-2xl font-bold text-blue-600">87%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impact Projections Tab */}
        <TabsContent value="projections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                12-Month Impact Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Visual Timeline */}
                <div className="space-y-4">
                  {MOCK_PROJECTIONS.map((projection, index) => (
                    <motion.div
                      key={projection.month}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-saros-primary text-white flex items-center justify-center font-bold">
                            {projection.month}M
                          </div>
                          <div>
                            <p className="font-semibold">Month {projection.month}</p>
                            <p className="text-sm text-muted-foreground">
                              APR: {projection.apr.toFixed(1)}% | Confidence: {(projection.confidence * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Net Position</p>
                          <p className={`text-xl font-bold ${projection.netPosition > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {projection.netPosition > 0 ? '+' : ''}{projection.netPosition.toFixed(2)} SOL
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Cumulative Benefit</p>
                          <p className="font-semibold text-green-600">+{projection.cumulativeBenefit.toFixed(2)} SOL</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cumulative Cost</p>
                          <p className="font-semibold text-red-600">-{projection.cumulativeCost.toFixed(2)} SOL</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Confidence</p>
                          <p className={`font-semibold ${getConfidenceColor(projection.confidence)}`}>
                            {(projection.confidence * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-saros-primary to-green-500"
                            style={{ width: `${(projection.netPosition / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Key Milestones */}
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CardContent className="pt-6">
                    <h4 className="text-lg font-semibold mb-4">Key Milestones</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Break-Even: Month 2</p>
                          <p className="text-sm text-muted-foreground">
                            Migration costs fully recovered, net positive position begins
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">ROI Target: Month 6</p>
                          <p className="text-sm text-muted-foreground">
                            Projected 200%+ ROI achieved with strong confidence
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Peak Performance: Month 12</p>
                          <p className="text-sm text-muted-foreground">
                            Cumulative benefit of 5.42 SOL with 95% confidence
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Decision Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Overall Recommendation */}
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="h-8 w-8 text-green-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-3">
                          ✅ HIGHLY RECOMMENDED
                        </h3>
                        <p className="text-green-700 dark:text-green-300 mb-4">
                          This migration presents an <strong>exceptional opportunity</strong> with strong financial metrics
                          across all key indicators. The combination of high NPV, strong IRR, and rapid payback period
                          makes this a <strong>low-risk, high-reward decision</strong>.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-semibold text-green-800 dark:text-green-200">Financial Score</p>
                            <p className="text-2xl font-bold text-green-600">9.2/10</p>
                          </div>
                          <div>
                            <p className="font-semibold text-green-800 dark:text-green-200">Risk Score</p>
                            <p className="text-2xl font-bold text-green-600">3.5/10</p>
                          </div>
                          <div>
                            <p className="font-semibold text-green-800 dark:text-green-200">Confidence</p>
                            <p className="text-2xl font-bold text-green-600">92%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Strengths */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Key Strengths
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium mb-1">Exceptional NPV</p>
                            <p className="text-sm text-muted-foreground">
                              ${MOCK_FINANCIAL_METRICS.npv.toFixed(2)} NPV indicates very strong value creation
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Percent className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium mb-1">High IRR</p>
                            <p className="text-sm text-muted-foreground">
                              {MOCK_FINANCIAL_METRICS.irr.toFixed(1)}% IRR significantly exceeds market returns
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                          <div>
                            <p className="font-medium mb-1">Rapid Payback</p>
                            <p className="text-sm text-muted-foreground">
                              Break-even in just {MOCK_FINANCIAL_METRICS.breakEvenDays} days
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="font-medium mb-1">Outstanding ROI</p>
                            <p className="text-sm text-muted-foreground">
                              {MOCK_FINANCIAL_METRICS.roi.toFixed(1)}% ROI demonstrates excellent capital efficiency
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Risk Considerations */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Risk Considerations
                  </h4>
                  <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2" />
                          <div>
                            <p className="font-medium">Market Volatility</p>
                            <p className="text-sm text-muted-foreground">
                              Returns could be impacted by unexpected market conditions (25% probability in worst-case scenario)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2" />
                          <div>
                            <p className="font-medium">Execution Timing</p>
                            <p className="text-sm text-muted-foreground">
                              Optimal execution during low volatility periods recommended for best results
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2" />
                          <div>
                            <p className="font-medium">Cost Overruns</p>
                            <p className="text-sm text-muted-foreground">
                              Migration costs could increase by up to 30% in worst-case scenario
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Items */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-saros-primary" />
                    Recommended Action Items
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-saros-primary text-white text-xs flex items-center justify-center mt-0.5">1</div>
                      <div className="flex-1">
                        <p className="font-medium">Proceed with Migration</p>
                        <p className="text-sm text-muted-foreground">
                          Execute migration during next low-volatility window (recommended within 7 days)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-saros-primary text-white text-xs flex items-center justify-center mt-0.5">2</div>
                      <div className="flex-1">
                        <p className="font-medium">Set Up Monitoring</p>
                        <p className="text-sm text-muted-foreground">
                          Configure performance alerts to track actual vs. projected metrics
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-saros-primary text-white text-xs flex items-center justify-center mt-0.5">3</div>
                      <div className="flex-1">
                        <p className="font-medium">Prepare Rollback Plan</p>
                        <p className="text-sm text-muted-foreground">
                          Have contingency plan ready in case of underperformance (low probability)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Card className="border-saros-primary bg-blue-50 dark:bg-blue-950">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold mb-2">Ready to Proceed?</h4>
                        <p className="text-sm text-muted-foreground">
                          All financial indicators support immediate migration execution
                        </p>
                      </div>
                      <Button size="lg" className="gap-2">
                        Execute Migration
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}