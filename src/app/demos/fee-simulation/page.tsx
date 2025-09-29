'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { StaggerList } from '@/components/animations/stagger-list'
import {
  Dice1,
  Play,
  Pause,
  TrendingUp,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Brain,
  LineChart,
  Shield,
  Settings
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM, useUserPositions } from '@/hooks/use-dlmm'

interface SimulationParameters {
  iterations: number
  timeHorizon: number // days
  baseFeeTier: number
  volatilityRange: [number, number]
  volumeRange: [number, number]
  liquidityRange: [number, number]
  scenarioType: 'bull' | 'bear' | 'sideways' | 'volatile' | 'stress'
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
}

interface SimulationResult {
  feeTier: number
  averageReturn: number
  standardDeviation: number
  maxReturn: number
  minReturn: number
  winRate: number
  sharpeRatio: number
  maxDrawdown: number
  valueAtRisk: number
  expectedShortfall: number
  calmarRatio: number
  sortinoRatio: number
}

interface MonteCarloData {
  iteration: number
  finalReturn: number
  maxDrawdown: number
  path: number[]
}

interface StressTestScenario {
  name: string
  description: string
  marketShock: number
  volumeChange: number
  liquidityChange: number
  duration: number
  probability: number
}

const FEE_TIERS = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0]

const STRESS_SCENARIOS: StressTestScenario[] = [
  {
    name: "Black Swan Event",
    description: "Extreme market volatility with 50%+ price swings",
    marketShock: -0.5,
    volumeChange: 3.0,
    liquidityChange: -0.7,
    duration: 7,
    probability: 0.02
  },
  {
    name: "Market Crash",
    description: "Traditional bear market conditions",
    marketShock: -0.3,
    volumeChange: 0.5,
    liquidityChange: -0.4,
    duration: 30,
    probability: 0.15
  },
  {
    name: "Liquidity Crisis",
    description: "Severe liquidity withdrawal",
    marketShock: -0.15,
    volumeChange: -0.6,
    liquidityChange: -0.8,
    duration: 14,
    probability: 0.08
  },
  {
    name: "Flash Crash",
    description: "Rapid algorithmic selling pressure",
    marketShock: -0.25,
    volumeChange: 5.0,
    liquidityChange: -0.3,
    duration: 1,
    probability: 0.05
  },
  {
    name: "Regulatory Shock",
    description: "Sudden regulatory announcement impact",
    marketShock: -0.2,
    volumeChange: -0.4,
    liquidityChange: -0.5,
    duration: 21,
    probability: 0.10
  }
]

export default function FeeSimulationDemo() {
  const { } = useWallet()
  const { } = useDLMM()
  const { } = useUserPositions()

  const [params, setParams] = useState<SimulationParameters>({
    iterations: 10000,
    timeHorizon: 30,
    baseFeeTier: 0.5,
    volatilityRange: [0.1, 0.8],
    volumeRange: [0.5, 3.0],
    liquidityRange: [0.3, 2.0],
    scenarioType: 'bull',
    riskTolerance: 'moderate'
  })

  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [results, setResults] = useState<SimulationResult[]>([])
  const [monteCarloData, setMonteCarloData] = useState<MonteCarloData[]>([])
  const [stressTestResults, setStressTestResults] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('parameters')

  // Monte Carlo simulation engine
  const runMonteCarloSimulation = useCallback(async (feeTier: number) => {
    const results: MonteCarloData[] = []
    const dailyReturns: number[] = []

    for (let i = 0; i < params.iterations; i++) {
      let value = 100 // Starting value
      const path: number[] = [value]
      let maxValue = value
      let maxDD = 0

      for (let day = 0; day < params.timeHorizon; day++) {
        // Generate random market factors
        const volatility = params.volatilityRange[0] +
          Math.random() * (params.volatilityRange[1] - params.volatilityRange[0])
        const volume = params.volumeRange[0] +
          Math.random() * (params.volumeRange[1] - params.volatilityRange[0])
        const liquidity = params.liquidityRange[0] +
          Math.random() * (params.liquidityRange[1] - params.liquidityRange[0])

        // Market scenario adjustments
        let marketMultiplier = 1
        switch (params.scenarioType) {
          case 'bull':
            marketMultiplier = 1.02 + Math.random() * 0.03
            break
          case 'bear':
            marketMultiplier = 0.97 - Math.random() * 0.03
            break
          case 'volatile':
            marketMultiplier = 0.95 + Math.random() * 0.1
            break
          case 'stress':
            marketMultiplier = 0.9 + Math.random() * 0.2
            break
          default:
            marketMultiplier = 0.995 + Math.random() * 0.01
        }

        // Fee tier impact on returns
        const feeImpact = 1 - (feeTier / 100) * volume * 0.1
        const volatilityImpact = Math.random() * volatility * (Math.random() > 0.5 ? 1 : -1)
        const liquidityImpact = Math.log(liquidity) * 0.05

        const dailyReturn = marketMultiplier * feeImpact * (1 + volatilityImpact + liquidityImpact) - 1
        value *= (1 + dailyReturn)
        path.push(value)

        // Track maximum drawdown
        if (value > maxValue) maxValue = value
        const currentDD = (maxValue - value) / maxValue
        if (currentDD > maxDD) maxDD = currentDD
      }

      const finalReturn = (value - 100) / 100
      dailyReturns.push(finalReturn)
      results.push({
        iteration: i,
        finalReturn,
        maxDrawdown: maxDD,
        path
      })

      // Update progress
      if (i % 100 === 0) {
        setSimulationProgress((i / params.iterations) * 100)
        await new Promise(resolve => setTimeout(resolve, 1))
      }
    }

    // Calculate statistics
    const avgReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length
    const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length
    const stdDev = Math.sqrt(variance)
    const maxReturn = Math.max(...dailyReturns)
    const minReturn = Math.min(...dailyReturns)
    const winRate = dailyReturns.filter(r => r > 0).length / dailyReturns.length
    const sharpeRatio = avgReturn / stdDev
    const maxDD = Math.max(...results.map(r => r.maxDrawdown))
    const calmarRatio = avgReturn / maxDD

    // Value at Risk (5th percentile)
    const sortedReturns = [...dailyReturns].sort((a, b) => a - b)
    const varIndex = Math.floor(sortedReturns.length * 0.05)
    const valueAtRisk = -sortedReturns[varIndex]

    // Expected Shortfall (average of losses beyond VaR)
    const tailLosses = sortedReturns.slice(0, varIndex)
    const expectedShortfall = tailLosses.length > 0 ?
      -tailLosses.reduce((sum, r) => sum + r, 0) / tailLosses.length : 0

    // Sortino Ratio (downside deviation)
    const downsideReturns = dailyReturns.filter(r => r < 0)
    const downsideVariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downsideReturns.length
    const downsideDeviation = Math.sqrt(downsideVariance)
    const sortinoRatio = avgReturn / downsideDeviation

    return {
      feeTier,
      averageReturn: avgReturn,
      standardDeviation: stdDev,
      maxReturn,
      minReturn,
      winRate,
      sharpeRatio: isFinite(sharpeRatio) ? sharpeRatio : 0,
      maxDrawdown: maxDD,
      valueAtRisk,
      expectedShortfall,
      calmarRatio: isFinite(calmarRatio) ? calmarRatio : 0,
      sortinoRatio: isFinite(sortinoRatio) ? sortinoRatio : 0,
      iteration: 0,
      finalReturn: avgReturn,
      path: []
    }
  }, [params])

  // Run stress tests
  const runStressTests = useCallback(async () => {
    const results = []

    for (const scenario of STRESS_SCENARIOS) {
      const impactResults = []

      for (const feeTier of FEE_TIERS) {
        let portfolioValue = 100

        // Apply stress scenario
        const volumeImpact = 1 + scenario.volumeChange
        const liquidityImpact = 1 + scenario.liquidityChange

        // Simulate scenario duration
        for (let day = 0; day < scenario.duration; day++) {
          const feeEarnings = portfolioValue * (feeTier / 100) * volumeImpact * 0.1
          const marketImpact = portfolioValue * scenario.marketShock / scenario.duration
          const liquidityPenalty = portfolioValue * (1 - liquidityImpact) * 0.05

          portfolioValue += feeEarnings + marketImpact - liquidityPenalty
        }

        const totalReturn = (portfolioValue - 100) / 100

        impactResults.push({
          feeTier,
          return: totalReturn,
          survivability: portfolioValue > 50 ? 'High' : portfolioValue > 20 ? 'Medium' : 'Low'
        })
      }

      results.push({
        scenario: scenario.name,
        description: scenario.description,
        probability: scenario.probability,
        impacts: impactResults
      })
    }

    return results
  }, [])

  // Main simulation runner
  const runSimulation = useCallback(async () => {
    setIsSimulating(true)
    setSimulationProgress(0)

    try {
      // Run Monte Carlo for each fee tier
      const simulationResults: SimulationResult[] = []

      for (let i = 0; i < FEE_TIERS.length; i++) {
        const feeTier = FEE_TIERS[i]
        const result = await runMonteCarloSimulation(feeTier)
        simulationResults.push(result)

        // Update overall progress
        setSimulationProgress(((i + 1) / FEE_TIERS.length) * 80) // 80% for Monte Carlo
      }

      setResults(simulationResults)

      // Run stress tests
      setSimulationProgress(85)
      const stressResults = await runStressTests()
      setStressTestResults(stressResults)

      // Generate sample Monte Carlo paths for visualization
      setSimulationProgress(95)
      const sampleData = await runMonteCarloSimulation(params.baseFeeTier)
      setMonteCarloData([sampleData])

      setSimulationProgress(100)
      setActiveTab('results')

    } catch (error) {
      console.error('Simulation error:', error)
    } finally {
      setIsSimulating(false)
    }
  }, [runMonteCarloSimulation, runStressTests, params.baseFeeTier])

  // Get best performing fee tier
  const bestFeeTier = useMemo(() => {
    if (results.length === 0) return null

    return results.reduce((best, current) => {
      const bestScore = best.sharpeRatio + best.calmarRatio - best.maxDrawdown
      const currentScore = current.sharpeRatio + current.calmarRatio - current.maxDrawdown
      return currentScore > bestScore ? current : best
    })
  }, [results])

  // Risk-adjusted recommendations
  const getRiskAdjustedRecommendation = useCallback(() => {
    if (results.length === 0) return null

    const recommendations = results.map(result => {
      let score = 0

      // Score based on risk tolerance
      switch (params.riskTolerance) {
        case 'conservative':
          score = result.sortinoRatio * 0.4 + (1 - result.maxDrawdown) * 0.4 + result.winRate * 0.2
          break
        case 'moderate':
          score = result.sharpeRatio * 0.3 + result.calmarRatio * 0.3 + result.averageReturn * 0.4
          break
        case 'aggressive':
          score = result.averageReturn * 0.5 + result.maxReturn * 0.3 + result.sharpeRatio * 0.2
          break
      }

      return { ...result, score }
    })

    return recommendations.sort((a, b) => b.score - a.score)[0]
  }, [results, params.riskTolerance])

  const recommendation = getRiskAdjustedRecommendation()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Dice1 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Fee Simulation Engine
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monte Carlo analysis and scenario testing for optimal fee strategies
            </p>
          </div>
        </div>

        <FeatureIdentifier
          feature={SDK_FEATURES[41]}
          className="mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{params.iterations.toLocaleString()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Monte Carlo Iterations</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{FEE_TIERS.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Fee Tiers Analyzed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{STRESS_SCENARIOS.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Stress Scenarios</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{params.timeHorizon}d</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Simulation Horizon</div>
              </CardContent>
            </Card>
          </div>
        </FeatureIdentifier>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="parameters" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Parameters
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="stress" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Stress Tests
          </TabsTrigger>
          <TabsTrigger value="monte-carlo" className="flex items-center gap-2">
            <LineChart className="w-4 h-4" />
            Monte Carlo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Simulation Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="iterations">Monte Carlo Iterations</Label>
                  <Select
                    value={params.iterations.toString()}
                    onValueChange={(value) => setParams(prev => ({ ...prev, iterations: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">1,000 (Fast)</SelectItem>
                      <SelectItem value="10000">10,000 (Standard)</SelectItem>
                      <SelectItem value="100000">100,000 (Precise)</SelectItem>
                      <SelectItem value="1000000">1,000,000 (Ultra-Precise)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeHorizon">Time Horizon (Days)</Label>
                  <Input
                    id="timeHorizon"
                    type="number"
                    value={params.timeHorizon}
                    onChange={(e) => setParams(prev => ({ ...prev, timeHorizon: parseInt(e.target.value) || 30 }))}
                    min="1"
                    max="365"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseFeeTier">Base Fee Tier (%)</Label>
                  <Select
                    value={params.baseFeeTier.toString()}
                    onValueChange={(value) => setParams(prev => ({ ...prev, baseFeeTier: parseFloat(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEE_TIERS.map(tier => (
                        <SelectItem key={tier} value={tier.toString()}>{tier}%</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scenarioType">Market Scenario</Label>
                  <Select
                    value={params.scenarioType}
                    onValueChange={(value: any) => setParams(prev => ({ ...prev, scenarioType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bull">Bull Market</SelectItem>
                      <SelectItem value="bear">Bear Market</SelectItem>
                      <SelectItem value="sideways">Sideways Market</SelectItem>
                      <SelectItem value="volatile">High Volatility</SelectItem>
                      <SelectItem value="stress">Stress Conditions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                  <Select
                    value={params.riskTolerance}
                    onValueChange={(value: any) => setParams(prev => ({ ...prev, riskTolerance: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Volatility Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={params.volatilityRange[0]}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        volatilityRange: [parseFloat(e.target.value) || 0.1, prev.volatilityRange[1]]
                      }))}
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={params.volatilityRange[1]}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        volatilityRange: [prev.volatilityRange[0], parseFloat(e.target.value) || 0.8]
                      }))}
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Volume Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={params.volumeRange[0]}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        volumeRange: [parseFloat(e.target.value) || 0.5, prev.volumeRange[1]]
                      }))}
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={params.volumeRange[1]}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        volumeRange: [prev.volumeRange[0], parseFloat(e.target.value) || 3.0]
                      }))}
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Liquidity Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={params.liquidityRange[0]}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        liquidityRange: [parseFloat(e.target.value) || 0.3, prev.liquidityRange[1]]
                      }))}
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={params.liquidityRange[1]}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        liquidityRange: [prev.liquidityRange[0], parseFloat(e.target.value) || 2.0]
                      }))}
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  {isSimulating ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Simulation
                    </>
                  )}
                </Button>

                {isSimulating && (
                  <div className="flex-1 max-w-md">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Progress: {simulationProgress.toFixed(1)}%
                      </div>
                    </div>
                    <Progress value={simulationProgress} className="w-full" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {results.length > 0 && (
            <>
              {recommendation && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-400">
                      <Target className="w-5 h-5" />
                      Recommended Fee Tier: {recommendation.feeTier}%
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {(recommendation.averageReturn * 100).toFixed(2)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Expected Return</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          {recommendation.sharpeRatio.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Sharpe Ratio</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600">
                          {(recommendation.maxDrawdown * 100).toFixed(2)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Max Drawdown</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">
                          {(recommendation.winRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Win Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Simulation Results by Fee Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <StaggerList className="space-y-4">
                    {results.map((result) => (
                      <motion.div
                        key={result.feeTier}
                        className={`p-4 rounded-lg border ${
                          bestFeeTier?.feeTier === result.feeTier
                            ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={result.feeTier === bestFeeTier?.feeTier ? "default" : "secondary"}>
                              {result.feeTier}% Fee Tier
                            </Badge>
                            {result.feeTier === bestFeeTier?.feeTier && (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Best Overall
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {(result.averageReturn * 100).toFixed(2)}%
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Return</div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                          <div>
                            <div className="font-semibold">{result.sharpeRatio.toFixed(2)}</div>
                            <div className="text-gray-600 dark:text-gray-400">Sharpe</div>
                          </div>
                          <div>
                            <div className="font-semibold">{result.calmarRatio.toFixed(2)}</div>
                            <div className="text-gray-600 dark:text-gray-400">Calmar</div>
                          </div>
                          <div>
                            <div className="font-semibold">{(result.maxDrawdown * 100).toFixed(1)}%</div>
                            <div className="text-gray-600 dark:text-gray-400">Max DD</div>
                          </div>
                          <div>
                            <div className="font-semibold">{(result.valueAtRisk * 100).toFixed(1)}%</div>
                            <div className="text-gray-600 dark:text-gray-400">VaR (5%)</div>
                          </div>
                          <div>
                            <div className="font-semibold">{(result.winRate * 100).toFixed(1)}%</div>
                            <div className="text-gray-600 dark:text-gray-400">Win Rate</div>
                          </div>
                          <div>
                            <div className="font-semibold">{result.sortinoRatio.toFixed(2)}</div>
                            <div className="text-gray-600 dark:text-gray-400">Sortino</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </StaggerList>
                </CardContent>
              </Card>
            </>
          )}

          {results.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Dice1 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Simulation Results Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Configure your parameters and run the Monte Carlo simulation to see results.
                </p>
                <Button onClick={() => setActiveTab('parameters')}>
                  Set Parameters
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {results.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Risk-Return Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.map((result) => (
                      <div key={result.feeTier} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{result.feeTier}% Fee Tier</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Risk: {(result.standardDeviation * 100).toFixed(1)}% |
                            Return: {(result.averageReturn * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {result.sharpeRatio.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Sharpe</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Drawdown Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.map((result) => (
                      <div key={result.feeTier} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{result.feeTier}% Fee Tier</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Max DD: {(result.maxDrawdown * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {result.calmarRatio.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Calmar</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Statistical Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Best Risk-Adjusted Returns</h4>
                      <div className="space-y-2">
                        {results
                          .sort((a, b) => b.sharpeRatio - a.sharpeRatio)
                          .slice(0, 3)
                          .map((result, index) => (
                            <div key={result.feeTier} className="flex items-center gap-2">
                              <Badge variant={index === 0 ? "default" : "secondary"}>
                                #{index + 1}
                              </Badge>
                              <span className="text-sm">
                                {result.feeTier}% (Sharpe: {result.sharpeRatio.toFixed(2)})
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Lowest Drawdown</h4>
                      <div className="space-y-2">
                        {results
                          .sort((a, b) => a.maxDrawdown - b.maxDrawdown)
                          .slice(0, 3)
                          .map((result, index) => (
                            <div key={result.feeTier} className="flex items-center gap-2">
                              <Badge variant={index === 0 ? "default" : "secondary"}>
                                #{index + 1}
                              </Badge>
                              <span className="text-sm">
                                {result.feeTier}% ({(result.maxDrawdown * 100).toFixed(1)}% DD)
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Highest Win Rate</h4>
                      <div className="space-y-2">
                        {results
                          .sort((a, b) => b.winRate - a.winRate)
                          .slice(0, 3)
                          .map((result, index) => (
                            <div key={result.feeTier} className="flex items-center gap-2">
                              <Badge variant={index === 0 ? "default" : "secondary"}>
                                #{index + 1}
                              </Badge>
                              <span className="text-sm">
                                {result.feeTier}% ({(result.winRate * 100).toFixed(1)}%)
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="stress" className="space-y-6">
          {stressTestResults.length > 0 && (
            <StaggerList className="space-y-4">
              {stressTestResults.map((stress, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      {stress.scenario}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stress.description} (Probability: {(stress.probability * 100).toFixed(1)}%)
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {stress.impacts.map((impact: any) => (
                        <div
                          key={impact.feeTier}
                          className={`p-3 border rounded-lg ${
                            impact.return > 0
                              ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                              : impact.return > -0.2
                              ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10'
                              : 'border-red-300 bg-red-50 dark:bg-red-900/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{impact.feeTier}%</Badge>
                            <Badge
                              variant={
                                impact.survivability === 'High' ? 'default' :
                                impact.survivability === 'Medium' ? 'secondary' : 'destructive'
                              }
                            >
                              {impact.survivability}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${
                              impact.return > 0 ? 'text-green-600' :
                              impact.return > -0.2 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {(impact.return * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Return</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </StaggerList>
          )}

          {stressTestResults.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Stress Test Results
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Run the simulation to see how fee tiers perform under stress scenarios.
                </p>
                <Button onClick={() => setActiveTab('parameters')}>
                  Run Simulation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="monte-carlo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Monte Carlo Path Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monteCarloData.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-center text-gray-600 dark:text-gray-400">
                    Sample simulation paths for {params.baseFeeTier}% fee tier over {params.timeHorizon} days
                  </div>

                  <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Interactive Monte Carlo chart would be displayed here
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Showing portfolio value evolution over time
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {params.iterations.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Simulation Paths
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {params.timeHorizon}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Days Simulated
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {params.baseFeeTier}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Fee Tier Analyzed
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Monte Carlo Data
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Run the simulation to generate Monte Carlo path visualizations.
                  </p>
                  <Button onClick={() => setActiveTab('parameters')}>
                    Configure Simulation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}