'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { useDLMM } from '@/hooks/use-dlmm'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Shield,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  AlertCircle,
  Target,
  Zap,
  Eye,
  History
} from 'lucide-react'

interface RiskDimension {
  id: string
  name: string
  category: 'market' | 'execution' | 'liquidity' | 'timing' | 'protocol'
  score: number // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  impact: string
  probability: number
  factors: string[]
}

interface MitigationStrategy {
  id: string
  riskId: string
  name: string
  description: string
  effectiveness: number // 0-100
  cost: number
  timeToImplement: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'proposed' | 'active' | 'completed'
  steps: string[]
}

interface RiskAlert {
  id: string
  timestamp: Date
  severity: 'info' | 'warning' | 'error' | 'critical'
  riskType: string
  message: string
  metrics: {
    current: number
    threshold: number
    change: number
  }
}

interface HistoricalMigration {
  id: string
  date: Date
  fromPool: string
  toPool: string
  amount: number
  riskScore: number
  outcome: 'success' | 'partial' | 'failed'
  actualLoss: number
  predictedRisk: number
  lessonLearned: string
}

const MOCK_RISK_DIMENSIONS: RiskDimension[] = [
  {
    id: 'market-1',
    name: 'Price Volatility Risk',
    category: 'market',
    score: 72,
    severity: 'high',
    description: 'High market volatility may cause slippage during migration',
    impact: 'Potential 2-5% value loss due to price movements',
    probability: 0.65,
    factors: ['24h volatility: 8.5%', 'Volume decline: 15%', 'Market uncertainty']
  },
  {
    id: 'market-2',
    name: 'Liquidity Depth Risk',
    category: 'liquidity',
    score: 45,
    severity: 'medium',
    description: 'Target pool liquidity may be insufficient for large positions',
    impact: 'Execution might require multiple transactions',
    probability: 0.35,
    factors: ['Target pool TVL: $2.5M', 'Your position: 8% of TVL', 'Daily volume coverage: 3.2x']
  },
  {
    id: 'execution-1',
    name: 'Transaction Failure Risk',
    category: 'execution',
    score: 28,
    severity: 'low',
    description: 'Network congestion may cause transaction failures',
    impact: 'Delayed execution or partial fills',
    probability: 0.18,
    factors: ['Network TPS: 2,847', 'Gas price: Normal', 'Success rate: 97.2%']
  },
  {
    id: 'timing-1',
    name: 'Opportunity Cost Risk',
    category: 'timing',
    score: 58,
    severity: 'medium',
    description: 'Delayed migration may miss optimal entry timing',
    impact: 'Potential missed APR gains',
    probability: 0.48,
    factors: ['APR gap: 3.5%', 'Target pool trend: Rising', 'Current utilization: 82%']
  },
  {
    id: 'protocol-1',
    name: 'Smart Contract Risk',
    category: 'protocol',
    score: 15,
    severity: 'low',
    description: 'Potential smart contract vulnerabilities in target pool',
    impact: 'Security concerns with new pool',
    probability: 0.08,
    factors: ['Audit status: Completed', 'TVL: $2.5M for 120 days', 'No exploits reported']
  }
]

const MOCK_MITIGATION_STRATEGIES: MitigationStrategy[] = [
  {
    id: 'mit-1',
    riskId: 'market-1',
    name: 'Gradual Migration Strategy',
    description: 'Split migration into multiple smaller transactions over 2-3 days',
    effectiveness: 75,
    cost: 0.5,
    timeToImplement: '2-3 days',
    priority: 'high',
    status: 'proposed',
    steps: [
      'Divide position into 3 equal tranches',
      'Execute first tranche during low volatility window',
      'Monitor market conditions for 24 hours',
      'Execute remaining tranches based on volatility',
      'Adjust timing if volatility exceeds 10%'
    ]
  },
  {
    id: 'mit-2',
    riskId: 'market-1',
    name: 'Limit Order Protection',
    description: 'Use limit orders with strict price bounds to prevent slippage',
    effectiveness: 85,
    cost: 0.2,
    timeToImplement: 'Immediate',
    priority: 'critical',
    status: 'active',
    steps: [
      'Set maximum slippage tolerance to 1.5%',
      'Configure price bands: ±2% from current',
      'Enable automatic cancellation after 1 hour',
      'Monitor order book depth continuously',
      'Adjust limits based on market conditions'
    ]
  },
  {
    id: 'mit-3',
    riskId: 'liquidity-2',
    name: 'Pre-Migration Liquidity Analysis',
    description: 'Analyze target pool liquidity depth before executing migration',
    effectiveness: 70,
    cost: 0.1,
    timeToImplement: '1 hour',
    priority: 'high',
    status: 'completed',
    steps: [
      'Check current TVL and volume metrics',
      'Analyze order book depth at ±5% price levels',
      'Calculate optimal position size for target pool',
      'Identify low-impact execution windows',
      'Set up liquidity monitoring alerts'
    ]
  },
  {
    id: 'mit-4',
    riskId: 'execution-1',
    name: 'Transaction Retry Mechanism',
    description: 'Implement automatic retry with exponential backoff',
    effectiveness: 90,
    cost: 0.3,
    timeToImplement: 'Immediate',
    priority: 'medium',
    status: 'active',
    steps: [
      'Configure maximum retry attempts: 5',
      'Set exponential backoff: 2, 4, 8, 16, 32 seconds',
      'Enable priority fee escalation on retry',
      'Monitor transaction status every 2 seconds',
      'Fail gracefully after max attempts'
    ]
  }
]

const MOCK_RISK_ALERTS: RiskAlert[] = [
  {
    id: 'alert-1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    severity: 'warning',
    riskType: 'Market Volatility',
    message: 'Volatility increased above threshold',
    metrics: { current: 8.5, threshold: 7.0, change: 1.5 }
  },
  {
    id: 'alert-2',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    severity: 'info',
    riskType: 'Liquidity Depth',
    message: 'Target pool liquidity improved',
    metrics: { current: 2.5, threshold: 2.0, change: 0.5 }
  },
  {
    id: 'alert-3',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    severity: 'error',
    riskType: 'Network Congestion',
    message: 'Transaction failure rate increased',
    metrics: { current: 5.2, threshold: 3.0, change: 2.2 }
  },
  {
    id: 'alert-4',
    timestamp: new Date(Date.now() - 90 * 60 * 1000),
    severity: 'critical',
    riskType: 'Price Impact',
    message: 'Estimated price impact exceeds safe limits',
    metrics: { current: 3.8, threshold: 2.5, change: 1.3 }
  }
]

const MOCK_HISTORICAL_MIGRATIONS: HistoricalMigration[] = [
  {
    id: 'hist-1',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    fromPool: 'SOL-USDC (0.25%)',
    toPool: 'SOL-USDC (0.3%)',
    amount: 15000,
    riskScore: 35,
    outcome: 'success',
    actualLoss: 0.2,
    predictedRisk: 0.5,
    lessonLearned: 'Low risk migrations executed successfully with minimal slippage'
  },
  {
    id: 'hist-2',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    fromPool: 'BONK-USDC (0.5%)',
    toPool: 'BONK-USDC (1%)',
    amount: 8500,
    riskScore: 68,
    outcome: 'partial',
    actualLoss: 2.8,
    predictedRisk: 2.2,
    lessonLearned: 'High volatility periods require gradual migration approach'
  },
  {
    id: 'hist-3',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    fromPool: 'JUP-USDC (0.5%)',
    toPool: 'JUP-SOL (0.3%)',
    amount: 22000,
    riskScore: 42,
    outcome: 'success',
    actualLoss: 0.8,
    predictedRisk: 1.2,
    lessonLearned: 'Pre-migration liquidity analysis reduced execution risk'
  },
  {
    id: 'hist-4',
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    fromPool: 'RAY-USDC (0.25%)',
    toPool: 'RAY-SOL (0.5%)',
    amount: 12000,
    riskScore: 78,
    outcome: 'failed',
    actualLoss: 5.5,
    predictedRisk: 4.2,
    lessonLearned: 'Insufficient liquidity in target pool caused high slippage - always verify TVL'
  }
]

export default function MigrationRiskDemo() {
  const { publicKey } = useWallet()
  const { connected } = useDLMM()
  const [, setSelectedRisk] = useState<RiskDimension | null>(null)
  const [activeStrategies] = useState(MOCK_MITIGATION_STRATEGIES)

  console.log('Migration risk demo initialized:', { connected, hasWallet: !!publicKey })

  const overallRiskScore = Math.round(
    MOCK_RISK_DIMENSIONS.reduce((sum, risk) => sum + risk.score, 0) / MOCK_RISK_DIMENSIONS.length
  )

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-500'
    if (score >= 50) return 'text-yellow-500'
    if (score >= 30) return 'text-blue-500'
    return 'text-green-500'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[24] || { id: 24, name: 'Migration Risk Assessment', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-12 w-12 text-saros-primary" />
            <h1 className="text-4xl font-bold">Migration Risk Assessment</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive multi-dimensional risk analysis with real-time monitoring and intelligent mitigation strategies
          </p>

          {/* Overall Risk Score */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`text-5xl font-bold ${getRiskColor(overallRiskScore)}`}>
                    {overallRiskScore}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Overall Risk Score</div>
                    <div className="text-xs text-muted-foreground">
                      {overallRiskScore >= 70 ? 'High Risk' : overallRiskScore >= 50 ? 'Medium Risk' : overallRiskScore >= 30 ? 'Low Risk' : 'Very Low Risk'}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">3 Active Mitigations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Real-time Monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">5 Risk Dimensions</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </FeatureIdentifier>

      {/* Risk Assessment Tabs */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="mitigation">Mitigation Strategies</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="historical">Historical Analysis</TabsTrigger>
        </TabsList>

        {/* Risk Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {MOCK_RISK_DIMENSIONS.map((risk) => (
              <motion.div
                key={risk.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedRisk(risk)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {risk.category === 'market' && <TrendingUp className="h-5 w-5" />}
                          {risk.category === 'liquidity' && <Activity className="h-5 w-5" />}
                          {risk.category === 'execution' && <Zap className="h-5 w-5" />}
                          {risk.category === 'timing' && <Clock className="h-5 w-5" />}
                          {risk.category === 'protocol' && <Shield className="h-5 w-5" />}
                          {risk.name}
                        </CardTitle>
                        <CardDescription>{risk.description}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`text-3xl font-bold ${getRiskColor(risk.score)}`}>
                          {risk.score}
                        </div>
                        <Badge className={getSeverityColor(risk.severity)}>
                          {risk.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Impact</span>
                        <span className="font-medium">{risk.impact}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Probability</span>
                        <span className="font-medium">{(risk.probability * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Risk Factors:</div>
                      <div className="space-y-1">
                        {risk.factors.map((factor, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-1.5 w-1.5 rounded-full bg-saros-primary" />
                            {factor}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Risk Level</span>
                        <span>{risk.score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            risk.score >= 70 ? 'bg-red-500' :
                            risk.score >= 50 ? 'bg-yellow-500' :
                            risk.score >= 30 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${risk.score}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Mitigation Strategies Tab */}
        <TabsContent value="mitigation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-saros-primary" />
                Risk Mitigation Strategies
              </CardTitle>
              <CardDescription>
                Intelligent strategies to reduce migration risks and ensure safe execution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeStrategies.map((strategy) => {
                const relatedRisk = MOCK_RISK_DIMENSIONS.find(r => r.id === strategy.riskId)
                return (
                  <motion.div
                    key={strategy.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="border-l-4 border-saros-primary">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{strategy.name}</CardTitle>
                            <CardDescription>{strategy.description}</CardDescription>
                            {relatedRisk && (
                              <Badge variant="outline" className="mt-2">
                                Targets: {relatedRisk.name}
                              </Badge>
                            )}
                          </div>
                          <Badge className={getSeverityColor(strategy.priority)}>
                            {strategy.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Effectiveness</div>
                            <div className="text-2xl font-bold text-green-600">{strategy.effectiveness}%</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Cost</div>
                            <div className="text-2xl font-bold">${strategy.cost}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Time</div>
                            <div className="text-lg font-semibold">{strategy.timeToImplement}</div>
                          </div>
                        </div>

                        {/* Implementation Steps */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Implementation Steps:</div>
                          <div className="space-y-2">
                            {strategy.steps.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-saros-primary/10 flex items-center justify-center text-xs font-bold text-saros-primary">
                                  {idx + 1}
                                </div>
                                <div className="text-sm text-muted-foreground flex-1">{step}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            {strategy.status === 'active' && (
                              <>
                                <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                                <span className="text-sm font-medium text-green-600">Active</span>
                              </>
                            )}
                            {strategy.status === 'proposed' && (
                              <>
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium text-yellow-600">Proposed</span>
                              </>
                            )}
                            {strategy.status === 'completed' && (
                              <>
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium text-blue-600">Completed</span>
                              </>
                            )}
                          </div>
                          <Button size="sm" variant="outline">
                            {strategy.status === 'proposed' ? 'Activate' : 'Configure'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Risk Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500 animate-pulse" />
                  Live Risk Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_RISK_DIMENSIONS.map((risk) => (
                  <div key={risk.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{risk.name}</div>
                      <div className="text-xs text-muted-foreground">{risk.category}</div>
                    </div>
                    <div className={`text-2xl font-bold ${getRiskColor(risk.score)}`}>
                      {risk.score}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Alert Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Risk Alert Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_RISK_ALERTS.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      {getAlertIcon(alert.severity)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{alert.riskType}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{alert.message}</div>
                        <div className="flex items-center gap-4 text-xs">
                          <span>Current: {alert.metrics.current.toFixed(1)}%</span>
                          <span>Threshold: {alert.metrics.threshold.toFixed(1)}%</span>
                          <span className={alert.metrics.change > 0 ? 'text-red-500' : 'text-green-500'}>
                            {alert.metrics.change > 0 ? '+' : ''}{alert.metrics.change.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monitoring Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Configuration</CardTitle>
              <CardDescription>Configure real-time risk monitoring and alert thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alert Frequency</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm">
                    <option>Real-time</option>
                    <option>Every 5 minutes</option>
                    <option>Every 15 minutes</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Risk Threshold</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm">
                    <option>Critical Only</option>
                    <option>High & Critical</option>
                    <option>All Levels</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto-Mitigation</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm">
                    <option>Enabled</option>
                    <option>Disabled</option>
                    <option>Manual Approval</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notification</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm">
                    <option>Email + SMS</option>
                    <option>Email Only</option>
                    <option>In-App Only</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historical Analysis Tab */}
        <TabsContent value="historical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-saros-primary" />
                Historical Migration Performance
              </CardTitle>
              <CardDescription>
                Learn from past migrations to improve risk assessment accuracy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">75%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">1.8%</div>
                  <div className="text-xs text-muted-foreground">Avg Loss</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">52</div>
                  <div className="text-xs text-muted-foreground">Risk Score Avg</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">$57.5K</div>
                  <div className="text-xs text-muted-foreground">Total Migrated</div>
                </div>
              </div>

              {/* Migration History */}
              <div className="space-y-3">
                {MOCK_HISTORICAL_MIGRATIONS.map((migration) => (
                  <motion.div
                    key={migration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="font-medium">
                                {migration.fromPool} → {migration.toPool}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {migration.date.toLocaleDateString()} • ${migration.amount.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={
                                migration.outcome === 'success' ? 'bg-green-100 text-green-800' :
                                migration.outcome === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {migration.outcome.toUpperCase()}
                              </Badge>
                              <div className={`text-sm font-medium ${getRiskColor(migration.riskScore)}`}>
                                Risk: {migration.riskScore}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded">
                            <div>
                              <div className="text-xs text-muted-foreground">Actual Loss</div>
                              <div className="text-lg font-bold text-red-500">
                                {migration.actualLoss.toFixed(2)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Predicted Risk</div>
                              <div className="text-lg font-bold">
                                {migration.predictedRisk.toFixed(2)}%
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <BarChart3 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-xs font-medium text-blue-900 dark:text-blue-200">
                                Lesson Learned
                              </div>
                              <div className="text-xs text-blue-700 dark:text-blue-300">
                                {migration.lessonLearned}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Wallet Connection Notice */}
      {!connected && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-900 dark:text-yellow-200">
                  Connect Wallet for Live Risk Assessment
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  Connect your wallet to analyze real position risks and receive personalized mitigation strategies
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}