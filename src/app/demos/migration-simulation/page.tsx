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
  Play,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  Clock,
  Target,
  Gauge,
  Shield
} from 'lucide-react'

interface SimulationConfig {
  migrationAmount: number
  fromPool: string
  toPool: string
  slippageTolerance: number
  priceImpactLimit: number
  executionStrategy: 'instant' | 'gradual' | 'smart'
  timeframe: number // hours
  iterations: number
}

interface SimulationScenario {
  id: string
  name: string
  type: 'optimistic' | 'realistic' | 'pessimistic'
  probability: number
  conditions: {
    volatility: number
    liquidityChange: number
    volumeChange: number
    feeChange: number
  }
  results: SimulationResult
}

interface SimulationResult {
  success: boolean
  executionTime: number
  totalCost: number
  priceImpact: number
  slippage: number
  estimatedProfit: number
  riskScore: number
  confidence: number
  warnings: string[]
  recommendations: string[]
}

interface ImpactMetric {
  category: string
  metric: string
  before: number
  after: number
  change: number
  unit: string
  impact: 'positive' | 'negative' | 'neutral'
}

const MOCK_CONFIG: SimulationConfig = {
  migrationAmount: 50000,
  fromPool: 'SOL-USDC (0.25%)',
  toPool: 'SOL-USDC (0.3%)',
  slippageTolerance: 1.5,
  priceImpactLimit: 2.0,
  executionStrategy: 'smart',
  timeframe: 24,
  iterations: 1000
}

const MOCK_SCENARIOS: SimulationScenario[] = [
  {
    id: 'optimistic',
    name: 'Optimistic Scenario',
    type: 'optimistic',
    probability: 0.25,
    conditions: {
      volatility: 2.5,
      liquidityChange: 15,
      volumeChange: 25,
      feeChange: -5
    },
    results: {
      success: true,
      executionTime: 45,
      totalCost: 125.50,
      priceImpact: 0.8,
      slippage: 0.5,
      estimatedProfit: 2847.50,
      riskScore: 25,
      confidence: 92,
      warnings: [],
      recommendations: [
        'Execute during high liquidity window',
        'Market conditions favorable for migration'
      ]
    }
  },
  {
    id: 'realistic',
    name: 'Realistic Scenario',
    type: 'realistic',
    probability: 0.50,
    conditions: {
      volatility: 5.2,
      liquidityChange: 5,
      volumeChange: 10,
      feeChange: 0
    },
    results: {
      success: true,
      executionTime: 120,
      totalCost: 287.30,
      priceImpact: 1.5,
      slippage: 1.2,
      estimatedProfit: 1925.80,
      riskScore: 45,
      confidence: 78,
      warnings: [
        'Moderate price impact expected',
        'Consider gradual execution'
      ],
      recommendations: [
        'Split migration into 2-3 tranches',
        'Monitor liquidity depth during execution',
        'Set limit orders for price protection'
      ]
    }
  },
  {
    id: 'pessimistic',
    name: 'Pessimistic Scenario',
    type: 'pessimistic',
    probability: 0.25,
    conditions: {
      volatility: 12.8,
      liquidityChange: -10,
      volumeChange: -15,
      feeChange: 10
    },
    results: {
      success: false,
      executionTime: 240,
      totalCost: 542.80,
      priceImpact: 3.5,
      slippage: 2.8,
      estimatedProfit: 485.20,
      riskScore: 78,
      confidence: 52,
      warnings: [
        'High price impact risk',
        'Insufficient liquidity in target pool',
        'Volatile market conditions',
        'May not meet profit targets'
      ],
      recommendations: [
        'Delay migration until market stabilizes',
        'Consider alternative pools',
        'Reduce migration amount',
        'Enable automatic rollback mechanisms'
      ]
    }
  }
]

const MOCK_IMPACT_METRICS: ImpactMetric[] = [
  {
    category: 'Returns',
    metric: 'Expected APR',
    before: 15.2,
    after: 18.7,
    change: 3.5,
    unit: '%',
    impact: 'positive'
  },
  {
    category: 'Returns',
    metric: 'Daily Yield',
    before: 20.83,
    after: 25.62,
    change: 4.79,
    unit: '$',
    impact: 'positive'
  },
  {
    category: 'Risk',
    metric: 'Volatility',
    before: 8.5,
    after: 5.2,
    change: -3.3,
    unit: '%',
    impact: 'positive'
  },
  {
    category: 'Risk',
    metric: 'Liquidity Risk',
    before: 35,
    after: 28,
    change: -7,
    unit: 'score',
    impact: 'positive'
  },
  {
    category: 'Costs',
    metric: 'Trading Fees',
    before: 0.25,
    after: 0.30,
    change: 0.05,
    unit: '%',
    impact: 'negative'
  },
  {
    category: 'Costs',
    metric: 'Slippage Cost',
    before: 0,
    after: 1.2,
    change: 1.2,
    unit: '%',
    impact: 'negative'
  },
  {
    category: 'Liquidity',
    metric: 'Available TVL',
    before: 1.8,
    after: 2.5,
    change: 0.7,
    unit: 'M',
    impact: 'positive'
  },
  {
    category: 'Liquidity',
    metric: 'Daily Volume',
    before: 3.2,
    after: 4.1,
    change: 0.9,
    unit: 'M',
    impact: 'positive'
  }
]

export default function MigrationSimulationDemo() {
  const { publicKey } = useWallet()
  const { connected } = useDLMM()
  const [config, setConfig] = useState(MOCK_CONFIG)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [, setSelectedScenario] = useState<SimulationScenario | null>(null)

  console.log('Migration simulation demo initialized:', { connected, hasWallet: !!publicKey })

  const runSimulation = () => {
    setIsSimulating(true)
    setSimulationProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsSimulating(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const getScenarioColor = (type: string) => {
    switch (type) {
      case 'optimistic': return 'text-green-600'
      case 'realistic': return 'text-blue-600'
      case 'pessimistic': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getScenarioBadgeColor = (type: string) => {
    switch (type) {
      case 'optimistic': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'realistic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'pessimistic': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[44] || { id: 44, name: 'Migration Simulation', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <Activity className="h-12 w-12 text-saros-primary" />
            <h1 className="text-4xl font-bold">Migration Simulation</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Test migration scenarios with comprehensive impact analysis, risk quantification, and what-if modeling
          </p>

          {/* Simulation Control */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Simulation Status</div>
                    <div className="text-xs text-muted-foreground">
                      {isSimulating ? `Running... ${simulationProgress}%` : '1000 iterations configured'}
                    </div>
                  </div>
                  <Button
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {isSimulating ? 'Simulating...' : 'Run Simulation'}
                  </Button>
                </div>

                {isSimulating && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-saros-primary transition-all"
                        style={{ width: `${simulationProgress}%` }}
                      />
                    </div>
                    <div className="text-xs text-center text-muted-foreground">
                      Processing {config.iterations} iterations across 3 scenarios
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">25%</div>
                    <div className="text-xs text-muted-foreground">Optimistic</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">50%</div>
                    <div className="text-xs text-muted-foreground">Realistic</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">25%</div>
                    <div className="text-xs text-muted-foreground">Pessimistic</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </FeatureIdentifier>

      {/* Simulation Tabs */}
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Testing</TabsTrigger>
          <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Results Comparison</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-saros-primary" />
                Simulation Configuration
              </CardTitle>
              <CardDescription>
                Configure simulation parameters and constraints for accurate modeling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Migration Details */}
              <div className="space-y-4">
                <h3 className="font-medium">Migration Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From Pool</label>
                    <input
                      type="text"
                      value={config.fromPool}
                      onChange={(e) => setConfig({ ...config, fromPool: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">To Pool</label>
                    <input
                      type="text"
                      value={config.toPool}
                      onChange={(e) => setConfig({ ...config, toPool: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Migration Amount ($)</label>
                    <input
                      type="number"
                      value={config.migrationAmount}
                      onChange={(e) => setConfig({ ...config, migrationAmount: parseFloat(e.target.value) })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Execution Strategy</label>
                    <select
                      value={config.executionStrategy}
                      onChange={(e) => setConfig({ ...config, executionStrategy: e.target.value as any })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="instant">Instant</option>
                      <option value="gradual">Gradual</option>
                      <option value="smart">Smart (AI-Optimized)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Risk Parameters */}
              <div className="space-y-4">
                <h3 className="font-medium">Risk Parameters</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Slippage Tolerance (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.slippageTolerance}
                      onChange={(e) => setConfig({ ...config, slippageTolerance: parseFloat(e.target.value) })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price Impact Limit (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.priceImpactLimit}
                      onChange={(e) => setConfig({ ...config, priceImpactLimit: parseFloat(e.target.value) })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Simulation Settings */}
              <div className="space-y-4">
                <h3 className="font-medium">Simulation Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Timeframe (hours)</label>
                    <input
                      type="number"
                      value={config.timeframe}
                      onChange={(e) => setConfig({ ...config, timeframe: parseInt(e.target.value) })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monte Carlo Iterations</label>
                    <input
                      type="number"
                      step="100"
                      value={config.iterations}
                      onChange={(e) => setConfig({ ...config, iterations: parseInt(e.target.value) })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3">Quick Presets</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Conservative</Button>
                  <Button variant="outline" size="sm">Balanced</Button>
                  <Button variant="outline" size="sm">Aggressive</Button>
                  <Button variant="outline" size="sm">Custom</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenario Testing Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {MOCK_SCENARIOS.map((scenario) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className={`flex items-center gap-2 ${getScenarioColor(scenario.type)}`}>
                          {scenario.type === 'optimistic' && <TrendingUp className="h-5 w-5" />}
                          {scenario.type === 'realistic' && <Target className="h-5 w-5" />}
                          {scenario.type === 'pessimistic' && <TrendingDown className="h-5 w-5" />}
                          {scenario.name}
                        </CardTitle>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getScenarioBadgeColor(scenario.type)}>
                          {(scenario.probability * 100).toFixed(0)}% Probability
                        </Badge>
                        <div className={`text-2xl font-bold ${scenario.results.success ? 'text-green-600' : 'text-red-600'}`}>
                          {scenario.results.confidence}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Market Conditions */}
                    <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="text-xs text-muted-foreground">Volatility</div>
                        <div className="text-lg font-bold">{scenario.conditions.volatility}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Liquidity</div>
                        <div className="text-lg font-bold">{scenario.conditions.liquidityChange > 0 ? '+' : ''}{scenario.conditions.liquidityChange}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Volume</div>
                        <div className="text-lg font-bold">{scenario.conditions.volumeChange > 0 ? '+' : ''}{scenario.conditions.volumeChange}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Fee Change</div>
                        <div className="text-lg font-bold">{scenario.conditions.feeChange > 0 ? '+' : ''}{scenario.conditions.feeChange}%</div>
                      </div>
                    </div>

                    {/* Results */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Estimated Profit</div>
                        <div className="text-xl font-bold text-green-600">
                          ${scenario.results.estimatedProfit.toLocaleString()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Total Cost</div>
                        <div className="text-xl font-bold">${scenario.results.totalCost.toFixed(2)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Risk Score</div>
                        <div className={`text-xl font-bold ${
                          scenario.results.riskScore >= 70 ? 'text-red-500' :
                          scenario.results.riskScore >= 50 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {scenario.results.riskScore}
                        </div>
                      </div>
                    </div>

                    {/* Warnings */}
                    {scenario.results.warnings.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Warnings
                        </div>
                        {scenario.results.warnings.map((warning, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-1.5" />
                            {warning}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recommendations */}
                    {scenario.results.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Recommendations
                        </div>
                        {scenario.results.recommendations.map((rec, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5" />
                            {rec}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-3 border-t flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {scenario.results.executionTime}s
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="h-4 w-4" />
                          {scenario.results.slippage.toFixed(2)}% slippage
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant={scenario.results.success ? "default" : "outline"}
                        disabled={!scenario.results.success}
                      >
                        {scenario.results.success ? 'View Details' : 'Not Recommended'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Impact Analysis Tab */}
        <TabsContent value="impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-saros-primary" />
                Impact Analysis
              </CardTitle>
              <CardDescription>
                Comprehensive before/after comparison of key metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['Returns', 'Risk', 'Costs', 'Liquidity'].map((category) => {
                  const metrics = MOCK_IMPACT_METRICS.filter(m => m.category === category)
                  return (
                    <div key={category} className="space-y-3">
                      <h3 className="font-medium text-lg">{category}</h3>
                      <div className="space-y-2">
                        {metrics.map((metric, idx) => (
                          <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{metric.metric}</span>
                              <Badge className={
                                metric.impact === 'positive' ? 'bg-green-100 text-green-800' :
                                metric.impact === 'negative' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {metric.impact === 'positive' ? '↑' : metric.impact === 'negative' ? '↓' : '→'}
                                {' '}{Math.abs(metric.change)}{metric.unit}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-xs text-muted-foreground">Before</div>
                                <div className="font-semibold">{metric.before}{metric.unit}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">After</div>
                                <div className="font-semibold">{metric.after}{metric.unit}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Change</div>
                                <div className={`font-semibold ${
                                  metric.impact === 'positive' ? 'text-green-600' :
                                  metric.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {metric.change > 0 ? '+' : ''}{metric.change}{metric.unit}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-saros-primary" />
                Scenario Comparison
              </CardTitle>
              <CardDescription>
                Side-by-side comparison of all simulation scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Metric</th>
                      <th className="text-center p-3 font-medium text-green-600">Optimistic</th>
                      <th className="text-center p-3 font-medium text-blue-600">Realistic</th>
                      <th className="text-center p-3 font-medium text-red-600">Pessimistic</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3">Success Rate</td>
                      <td className="text-center p-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Estimated Profit</td>
                      <td className="text-center p-3 font-semibold text-green-600">$2,847.50</td>
                      <td className="text-center p-3 font-semibold text-blue-600">$1,925.80</td>
                      <td className="text-center p-3 font-semibold text-red-600">$485.20</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Total Cost</td>
                      <td className="text-center p-3">$125.50</td>
                      <td className="text-center p-3">$287.30</td>
                      <td className="text-center p-3">$542.80</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Price Impact</td>
                      <td className="text-center p-3">0.8%</td>
                      <td className="text-center p-3">1.5%</td>
                      <td className="text-center p-3">3.5%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Slippage</td>
                      <td className="text-center p-3">0.5%</td>
                      <td className="text-center p-3">1.2%</td>
                      <td className="text-center p-3">2.8%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Risk Score</td>
                      <td className="text-center p-3 font-bold text-green-600">25</td>
                      <td className="text-center p-3 font-bold text-yellow-600">45</td>
                      <td className="text-center p-3 font-bold text-red-600">78</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Confidence</td>
                      <td className="text-center p-3">92%</td>
                      <td className="text-center p-3">78%</td>
                      <td className="text-center p-3">52%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Execution Time</td>
                      <td className="text-center p-3">45s</td>
                      <td className="text-center p-3">120s</td>
                      <td className="text-center p-3">240s</td>
                    </tr>
                    <tr>
                      <td className="p-3">Probability</td>
                      <td className="text-center p-3 font-semibold">25%</td>
                      <td className="text-center p-3 font-semibold">50%</td>
                      <td className="text-center p-3 font-semibold">25%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Expected Value Calculation */}
              <div className="mt-6 p-4 bg-saros-primary/10 rounded-lg">
                <h3 className="font-medium mb-3">Expected Value Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Probability-Weighted Profit</div>
                    <div className="text-2xl font-bold text-green-600">
                      ${(
                        MOCK_SCENARIOS[0].results.estimatedProfit * MOCK_SCENARIOS[0].probability +
                        MOCK_SCENARIOS[1].results.estimatedProfit * MOCK_SCENARIOS[1].probability +
                        MOCK_SCENARIOS[2].results.estimatedProfit * MOCK_SCENARIOS[2].probability
                      ).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Expected Risk Score</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {Math.round(
                        MOCK_SCENARIOS[0].results.riskScore * MOCK_SCENARIOS[0].probability +
                        MOCK_SCENARIOS[1].results.riskScore * MOCK_SCENARIOS[1].probability +
                        MOCK_SCENARIOS[2].results.riskScore * MOCK_SCENARIOS[2].probability
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Recommendation</span>
                    <Badge className="bg-green-100 text-green-800">
                      PROCEED WITH MIGRATION
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Expected value analysis suggests migration is favorable. Use realistic scenario parameters for execution.
                  </p>
                </div>
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
              <Shield className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-900 dark:text-yellow-200">
                  Connect Wallet for Live Simulation
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  Connect your wallet to simulate migrations with your actual positions and real-time market data
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}