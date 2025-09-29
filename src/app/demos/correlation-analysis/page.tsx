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
  Network,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Target,
  Shield,
  Zap,
  RefreshCw,
  Eye,
  Calculator
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM } from '@/hooks/use-dlmm'

interface Position {
  id: string
  pair: string
  value: number
  allocation: number
  returns30d: number
  volatility: number
  beta: number
}

interface CorrelationMatrix {
  positions: string[]
  correlations: number[][]
}

interface DiversificationMetrics {
  portfolioCorrelation: number
  diversificationRatio: number
  concentrationRisk: number
  effectiveAssets: number
  maxDrawdown: number
  sharpeRatio: number
}

interface RiskContribution {
  position: string
  totalRisk: number
  systematicRisk: number
  idiosyncraticRisk: number
  marginaRiskContribution: number
  percentageContribution: number
}

const MOCK_POSITIONS: Position[] = [
  {
    id: '1',
    pair: 'SOL/USDC',
    value: 15420,
    allocation: 35.2,
    returns30d: 12.8,
    volatility: 18.5,
    beta: 1.15
  },
  {
    id: '2',
    pair: 'BTC/SOL',
    value: 12850,
    allocation: 29.4,
    returns30d: 8.3,
    volatility: 22.1,
    beta: 0.95
  },
  {
    id: '3',
    pair: 'ETH/USDC',
    value: 8930,
    allocation: 20.4,
    returns30d: 15.2,
    volatility: 20.3,
    beta: 1.25
  },
  {
    id: '4',
    pair: 'RAY/SOL',
    value: 4200,
    allocation: 9.6,
    returns30d: -3.1,
    volatility: 35.2,
    beta: 1.45
  },
  {
    id: '5',
    pair: 'USDC/USDT',
    value: 2340,
    allocation: 5.4,
    returns30d: 0.3,
    volatility: 1.2,
    beta: 0.05
  }
]

const CORRELATION_MATRIX: CorrelationMatrix = {
  positions: ['SOL/USDC', 'BTC/SOL', 'ETH/USDC', 'RAY/SOL', 'USDC/USDT'],
  correlations: [
    [1.00, 0.75, 0.68, 0.82, 0.12],
    [0.75, 1.00, 0.71, 0.69, 0.08],
    [0.68, 0.71, 1.00, 0.64, 0.15],
    [0.82, 0.69, 0.64, 1.00, 0.05],
    [0.12, 0.08, 0.15, 0.05, 1.00]
  ]
}

const DIVERSIFICATION_METRICS: DiversificationMetrics = {
  portfolioCorrelation: 0.73,
  diversificationRatio: 1.42,
  concentrationRisk: 0.68,
  effectiveAssets: 2.85,
  maxDrawdown: -18.5,
  sharpeRatio: 1.34
}

const RISK_CONTRIBUTIONS: RiskContribution[] = [
  {
    position: 'SOL/USDC',
    totalRisk: 6.51,
    systematicRisk: 4.85,
    idiosyncraticRisk: 1.66,
    marginaRiskContribution: 2.45,
    percentageContribution: 38.2
  },
  {
    position: 'BTC/SOL',
    totalRisk: 6.49,
    systematicRisk: 4.12,
    idiosyncraticRisk: 2.37,
    marginaRiskContribution: 2.15,
    percentageContribution: 32.8
  },
  {
    position: 'ETH/USDC',
    totalRisk: 4.13,
    systematicRisk: 2.95,
    idiosyncraticRisk: 1.18,
    marginaRiskContribution: 1.35,
    percentageContribution: 20.1
  },
  {
    position: 'RAY/SOL',
    totalRisk: 3.38,
    systematicRisk: 2.71,
    idiosyncraticRisk: 0.67,
    marginaRiskContribution: 0.48,
    percentageContribution: 7.2
  },
  {
    position: 'USDC/USDT',
    totalRisk: 0.06,
    systematicRisk: 0.02,
    idiosyncraticRisk: 0.04,
    marginaRiskContribution: 0.11,
    percentageContribution: 1.7
  }
]

export default function CorrelationAnalysisDemo() {
  const { publicKey } = useWallet()
  const { connected } = useDLMM()
  const [analysisRunning, setAnalysisRunning] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)

  // Use variables to satisfy TypeScript
  console.log('Correlation analysis demo initialized:', { connected, hasWallet: !!publicKey })

  const runCorrelationAnalysis = async () => {
    setAnalysisRunning(true)
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 3000))
    setAnalysisRunning(false)
  }

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation)
    if (abs >= 0.8) return 'bg-red-500'
    if (abs >= 0.6) return 'bg-orange-500'
    if (abs >= 0.4) return 'bg-yellow-500'
    if (abs >= 0.2) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getCorrelationIntensity = (correlation: number) => {
    const abs = Math.abs(correlation)
    return `opacity-${Math.round(abs * 100)}`
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 30) return 'text-red-600'
    if (risk >= 20) return 'text-orange-600'
    if (risk >= 10) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getDiversificationColor = (ratio: number) => {
    if (ratio >= 1.5) return 'text-green-600'
    if (ratio >= 1.2) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[18] || { id: 18, name: 'Cross-Position Correlation Analysis', status: 'live' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-saros-primary to-saros-secondary flex items-center justify-center">
              <Network className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-saros-primary to-saros-secondary bg-clip-text text-transparent">
              Cross-Position Correlation Analysis
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Advanced portfolio correlation analysis with risk decomposition, diversification metrics, and position relationship insights for optimal portfolio construction.
          </p>
        </motion.div>
      </FeatureIdentifier>

      {/* Portfolio Overview */}
      <Card className="border-2 border-dashed border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <BarChart3 className="h-5 w-5" />
              Portfolio Diversification Overview
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={runCorrelationAnalysis}
              disabled={analysisRunning}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${analysisRunning ? 'animate-spin' : ''}`} />
              {analysisRunning ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {(DIVERSIFICATION_METRICS.portfolioCorrelation * 100).toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Avg Correlation</p>
              <Badge className="mt-1 bg-red-100 text-red-800">
                High
              </Badge>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${getDiversificationColor(DIVERSIFICATION_METRICS.diversificationRatio)}`}>
                {DIVERSIFICATION_METRICS.diversificationRatio.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">Diversification Ratio</p>
              <Badge className="mt-1 bg-yellow-100 text-yellow-800">
                Moderate
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {DIVERSIFICATION_METRICS.concentrationRisk.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">Concentration Risk</p>
              <Badge className="mt-1 bg-orange-100 text-orange-800">
                High
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {DIVERSIFICATION_METRICS.effectiveAssets.toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Effective Assets</p>
              <Badge className="mt-1 bg-blue-100 text-blue-800">
                Low
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {DIVERSIFICATION_METRICS.maxDrawdown.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Max Drawdown</p>
              <Badge className="mt-1 bg-red-100 text-red-800">
                Risk
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {DIVERSIFICATION_METRICS.sharpeRatio.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
              <Badge className="mt-1 bg-green-100 text-green-800">
                Good
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="matrix" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matrix">Correlation Matrix</TabsTrigger>
          <TabsTrigger value="risk">Risk Decomposition</TabsTrigger>
          <TabsTrigger value="diversification">Diversification Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Optimization</TabsTrigger>
        </TabsList>

        {/* Correlation Matrix Tab */}
        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Position Correlation Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Correlation Heatmap */}
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-6 gap-1 min-w-[600px]">
                    {/* Headers */}
                    <div></div>
                    {CORRELATION_MATRIX.positions.map((position, index) => (
                      <div key={index} className="text-xs font-medium text-center p-2 bg-muted/50 rounded">
                        {position}
                      </div>
                    ))}

                    {/* Matrix rows */}
                    {CORRELATION_MATRIX.positions.map((rowPosition, rowIndex) => (
                      <React.Fragment key={rowIndex}>
                        <div className="text-xs font-medium text-right p-2 bg-muted/50 rounded">
                          {rowPosition}
                        </div>
                        {CORRELATION_MATRIX.correlations[rowIndex].map((correlation, colIndex) => (
                          <motion.div
                            key={colIndex}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: (rowIndex + colIndex) * 0.05 }}
                            className={`
                              relative h-12 rounded cursor-pointer transition-all duration-200 hover:scale-105
                              ${getCorrelationColor(correlation)}
                              ${getCorrelationIntensity(Math.abs(correlation))}
                            `}
                            onClick={() => setSelectedPosition(`${rowPosition} vs ${CORRELATION_MATRIX.positions[colIndex]}`)}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className={`text-xs font-bold ${
                                Math.abs(correlation) > 0.5 ? 'text-white' : 'text-black'
                              }`}>
                                {correlation.toFixed(2)}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Correlation Legend */}
                <div className="flex items-center justify-center gap-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-xs">Low (0.0-0.2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-xs">Moderate (0.2-0.4)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-xs">Medium (0.4-0.6)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-xs">High (0.6-0.8)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-xs">Very High (0.8+)</span>
                  </div>
                </div>

                {/* Selected Position Details */}
                {selectedPosition && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950"
                  >
                    <h4 className="font-semibold mb-2">Correlation Analysis: {selectedPosition}</h4>
                    <p className="text-sm text-muted-foreground">
                      Detailed correlation analysis shows the relationship strength between these positions.
                      High correlations (0.7+) indicate positions move together, reducing diversification benefits.
                    </p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Decomposition Tab */}
        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Risk Contribution Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StaggerList className="space-y-4" staggerDelay={0.1}>
                {RISK_CONTRIBUTIONS.map((risk, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{risk.position}</h3>
                      <Badge className={`${getRiskColor(risk.percentageContribution)} bg-opacity-10`}>
                        {risk.percentageContribution.toFixed(1)}% of total risk
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Risk</p>
                        <p className="text-lg font-bold">{risk.totalRisk.toFixed(2)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Systematic</p>
                        <p className="text-lg font-bold text-red-600">{risk.systematicRisk.toFixed(2)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Idiosyncratic</p>
                        <p className="text-lg font-bold text-blue-600">{risk.idiosyncraticRisk.toFixed(2)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Marginal Risk</p>
                        <p className="text-lg font-bold text-orange-600">{risk.marginaRiskContribution.toFixed(2)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Portfolio %</p>
                        <p className="text-lg font-bold text-purple-600">{risk.percentageContribution.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Risk visualization bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                        <div
                          className="h-4 bg-red-600 rounded-full"
                          style={{ width: `${(risk.systematicRisk / risk.totalRisk) * 100}%` }}
                        />
                        <div
                          className="h-4 bg-blue-600 rounded-full absolute top-0"
                          style={{
                            left: `${(risk.systematicRisk / risk.totalRisk) * 100}%`,
                            width: `${(risk.idiosyncraticRisk / risk.totalRisk) * 100}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Systematic Risk</span>
                        <span>Idiosyncratic Risk</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </StaggerList>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diversification Analysis Tab */}
        <TabsContent value="diversification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Portfolio Diversification Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Position Allocations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Current Position Allocations</h3>
                  <div className="space-y-3">
                    {MOCK_POSITIONS.map((position, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-yellow-500' :
                            index === 3 ? 'bg-red-500' : 'bg-purple-500'
                          }`} />
                          <span className="font-medium">{position.pair}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">${position.value.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{position.allocation.toFixed(1)}%</p>
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                index === 0 ? 'bg-blue-500' :
                                index === 1 ? 'bg-green-500' :
                                index === 2 ? 'bg-yellow-500' :
                                index === 3 ? 'bg-red-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${Math.min(position.allocation * 2.5, 100)}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Diversification Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                            Concentration Risk Alert
                          </h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Top 2 positions account for 64.6% of portfolio. Consider diversifying
                            to reduce concentration risk and improve resilience.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Eye className="h-6 w-6 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                            Correlation Clustering
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            SOL-related positions show high correlation (0.7+). Adding uncorrelated
                            assets could improve diversification benefits.
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

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Portfolio Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Immediate Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Immediate Optimizations</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Reduce SOL Exposure Concentration</p>
                        <p className="text-sm text-muted-foreground">
                          SOL-related positions (SOL/USDC, BTC/SOL, RAY/SOL) represent 74% of portfolio with high correlation.
                          Consider reducing to 50-60% for better diversification.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Increase Uncorrelated Assets</p>
                        <p className="text-sm text-muted-foreground">
                          Add more stable pairs (USDC/USDT currently only 5.4%) or BTC-based pairs
                          to reduce overall portfolio correlation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optimal Allocation */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-600">Recommended Allocation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Current Allocation</h4>
                      <div className="space-y-2">
                        {MOCK_POSITIONS.map((position, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{position.pair}</span>
                            <span className="font-medium">{position.allocation.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Optimized Allocation</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>SOL/USDC</span>
                          <span className="font-medium text-green-600">25.0% ↓</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>BTC/SOL</span>
                          <span className="font-medium text-green-600">20.0% ↓</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>ETH/USDC</span>
                          <span className="font-medium text-blue-600">22.0% ↑</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>RAY/SOL</span>
                          <span className="font-medium text-red-600">8.0% ↓</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>USDC/USDT</span>
                          <span className="font-medium text-green-600">15.0% ↑</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>BTC/ETH (New)</span>
                          <span className="font-medium text-blue-600">10.0% +</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          Expected Improvement
                        </h4>
                        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          <li>• Portfolio correlation: 0.73 → 0.55 (-25%)</li>
                          <li>• Diversification ratio: 1.42 → 1.78 (+25%)</li>
                          <li>• Effective assets: 2.85 → 3.95 (+39%)</li>
                          <li>• Concentration risk: 0.68 → 0.45 (-34%)</li>
                        </ul>
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