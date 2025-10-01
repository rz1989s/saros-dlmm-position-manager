'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import {
  DollarSign,
  TrendingUp,
  Activity,
  PieChart,
  BarChart3,
  AlertCircle,
  RefreshCw,
  Eye,
  Target,
  Zap,
  Calculator
} from 'lucide-react'

interface ValuationData {
  totalValue: number
  tokenXValue: number
  tokenYValue: number
  confidence: number
  change24h: number
  change7d: number
  change30d: number
  oracleStatus: 'healthy' | 'degraded' | 'stale'
}

interface PnLBreakdown {
  total: number
  totalPercent: number
  feeEarnings: number
  priceAppreciation: number
  impermanentLoss: number
  realized: number
  unrealized: number
}

interface LiquidityDistribution {
  activeLiquidity: number
  inactiveLiquidity: number
  utilizationRate: number
  bins: Array<{
    binId: number
    value: number
    isActive: boolean
    apr: number
  }>
}

interface RiskMetrics {
  volatilityScore: number
  priceDeviation: number
  concentrationRisk: number
  oracleConfidence: number
  overallRiskScore: number
}

const MOCK_VALUATION_DATA: ValuationData[] = [
  {
    totalValue: 15847.32,
    tokenXValue: 7923.66,
    tokenYValue: 7923.66,
    confidence: 98.5,
    change24h: 5.2,
    change7d: 12.8,
    change30d: 24.3,
    oracleStatus: 'healthy'
  },
  {
    totalValue: 8492.15,
    tokenXValue: 4246.08,
    tokenYValue: 4246.07,
    confidence: 95.2,
    change24h: -2.1,
    change7d: 3.4,
    change30d: 8.9,
    oracleStatus: 'healthy'
  },
  {
    totalValue: 4238.91,
    tokenXValue: 2119.45,
    tokenYValue: 2119.46,
    confidence: 87.3,
    change24h: 1.5,
    change7d: -4.2,
    change30d: -1.7,
    oracleStatus: 'degraded'
  }
]

const MOCK_PNL_DATA: PnLBreakdown[] = [
  {
    total: 2847.32,
    totalPercent: 21.88,
    feeEarnings: 1247.50,
    priceAppreciation: 1823.45,
    impermanentLoss: -223.63,
    realized: 1247.50,
    unrealized: 1599.82
  },
  {
    total: 492.15,
    totalPercent: 6.15,
    feeEarnings: 387.20,
    priceAppreciation: 245.80,
    impermanentLoss: -140.85,
    realized: 387.20,
    unrealized: 104.95
  },
  {
    total: -261.09,
    totalPercent: -5.81,
    feeEarnings: 124.30,
    priceAppreciation: -187.45,
    impermanentLoss: -197.94,
    realized: 124.30,
    unrealized: -385.39
  }
]

const MOCK_LIQUIDITY_DATA: LiquidityDistribution[] = [
  {
    activeLiquidity: 12678.25,
    inactiveLiquidity: 3169.07,
    utilizationRate: 80.0,
    bins: [
      { binId: 142, value: 5263.15, isActive: true, apr: 28.5 },
      { binId: 143, value: 4210.52, isActive: true, apr: 32.1 },
      { binId: 144, value: 3204.58, isActive: true, apr: 25.8 },
      { binId: 145, value: 2105.48, isActive: false, apr: 12.3 },
      { binId: 146, value: 1063.59, isActive: false, apr: 8.7 }
    ]
  },
  {
    activeLiquidity: 5947.51,
    inactiveLiquidity: 2544.64,
    utilizationRate: 70.0,
    bins: [
      { binId: 128, value: 3568.51, isActive: true, apr: 22.4 },
      { binId: 129, value: 2379.00, isActive: true, apr: 19.8 },
      { binId: 130, value: 1544.64, isActive: false, apr: 10.5 },
      { binId: 131, value: 1000.00, isActive: false, apr: 7.2 }
    ]
  },
  {
    activeLiquidity: 2543.13,
    inactiveLiquidity: 1695.78,
    utilizationRate: 60.0,
    bins: [
      { binId: 156, value: 1271.57, isActive: true, apr: 15.6 },
      { binId: 157, value: 1271.56, isActive: true, apr: 14.2 },
      { binId: 158, value: 1017.26, isActive: false, apr: 9.8 },
      { binId: 159, value: 678.52, isActive: false, apr: 6.3 }
    ]
  }
]

const MOCK_RISK_DATA: RiskMetrics[] = [
  {
    volatilityScore: 35.2,
    priceDeviation: 8.4,
    concentrationRisk: 42.1,
    oracleConfidence: 98.5,
    overallRiskScore: 28.5
  },
  {
    volatilityScore: 52.8,
    priceDeviation: 15.7,
    concentrationRisk: 58.3,
    oracleConfidence: 95.2,
    overallRiskScore: 45.3
  },
  {
    volatilityScore: 68.4,
    priceDeviation: 24.1,
    concentrationRisk: 71.2,
    oracleConfidence: 87.3,
    overallRiskScore: 62.8
  }
]

export default function PositionValuationDemo() {
  const [selectedPosition, setSelectedPosition] = useState(0)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const currentValuation = MOCK_VALUATION_DATA[selectedPosition]
  const currentPnL = MOCK_PNL_DATA[selectedPosition]
  const currentLiquidity = MOCK_LIQUIDITY_DATA[selectedPosition]
  const currentRisk = MOCK_RISK_DATA[selectedPosition]

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setIsRefreshing(true)
      setTimeout(() => setIsRefreshing(false), 1000)
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const getOracleStatusColor = (status: ValuationData['oracleStatus']) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'degraded': return 'text-yellow-400'
      case 'stale': return 'text-red-400'
    }
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-400'
    if (score < 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <FeatureIdentifier feature={{
        id: 25,
        name: "Position Valuation",
        status: "completed" as const,
        sdkLocation: "src/lib/dlmm/position-valuation.ts",
        description: "Oracle-based position valuation with real-time updates"
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-block p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl mb-4">
            <Calculator className="w-12 h-12 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 text-transparent bg-clip-text">
            Position Valuation System
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Oracle-based position valuation with real-time updates and comprehensive P&L analysis
          </p>
        </motion.div>
      </FeatureIdentifier>

      {/* Feature Overview */}
      <Card className="border-purple-500/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Oracle-Based Valuation Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
              <Eye className="w-8 h-8 text-purple-400 mb-2" />
              <h3 className="font-semibold mb-1">Real-time Oracle Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Pyth Network and Switchboard integration for accurate token pricing
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20">
              <DollarSign className="w-8 h-8 text-pink-400 mb-2" />
              <h3 className="font-semibold mb-1">P&L Attribution</h3>
              <p className="text-sm text-muted-foreground">
                Detailed breakdown of fees, price gains, and impermanent loss
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
              <Activity className="w-8 h-8 text-blue-400 mb-2" />
              <h3 className="font-semibold mb-1">Real-time Updates</h3>
              <p className="text-sm text-muted-foreground">
                Automatic valuation updates with configurable refresh intervals
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position Selector & Controls */}
      <Card className="border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Position Selection</span>
            <div className="flex items-center gap-2">
              <Badge variant={autoRefresh ? "default" : "outline"}>
                {autoRefresh ? `Auto-refresh: ${refreshInterval}s` : 'Manual refresh'}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {MOCK_VALUATION_DATA.map((_, index) => (
              <Button
                key={index}
                variant={selectedPosition === index ? "default" : "outline"}
                onClick={() => setSelectedPosition(index)}
              >
                Position #{index + 1}
              </Button>
            ))}
          </div>
          <div className="flex gap-4">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
            </Button>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-2 rounded-md border border-input bg-background"
              disabled={!autoRefresh}
            >
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Valuation Display */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Current Valuation */}
        <Card className="border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-400" />
                Current Valuation
              </span>
              <Badge className={getOracleStatusColor(currentValuation.oracleStatus)}>
                {currentValuation.oracleStatus}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent">
              <div className="text-4xl font-bold mb-2">
                ${currentValuation.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Oracle Confidence: {currentValuation.confidence}%
              </div>
              <div className="flex justify-center gap-4 text-sm">
                <div className={currentValuation.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  24h: {currentValuation.change24h > 0 ? '+' : ''}{currentValuation.change24h.toFixed(2)}%
                </div>
                <div className={currentValuation.change7d >= 0 ? 'text-green-400' : 'text-red-400'}>
                  7d: {currentValuation.change7d > 0 ? '+' : ''}{currentValuation.change7d.toFixed(2)}%
                </div>
                <div className={currentValuation.change30d >= 0 ? 'text-green-400' : 'text-red-400'}>
                  30d: {currentValuation.change30d > 0 ? '+' : ''}{currentValuation.change30d.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Token X Value</span>
                <span className="font-semibold">${currentValuation.tokenXValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Token Y Value</span>
                <span className="font-semibold">${currentValuation.tokenYValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* P&L Breakdown */}
        <Card className="border-pink-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-pink-400" />
              P&L Attribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-pink-500/10 to-transparent">
              <div className={`text-4xl font-bold mb-2 ${currentPnL.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentPnL.total >= 0 ? '+' : ''}${currentPnL.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-xl ${currentPnL.totalPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentPnL.totalPercent >= 0 ? '+' : ''}{currentPnL.totalPercent.toFixed(2)}%
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fee Earnings</span>
                <span className="font-semibold text-green-400">+${currentPnL.feeEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Price Appreciation</span>
                <span className={`font-semibold ${currentPnL.priceAppreciation >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {currentPnL.priceAppreciation >= 0 ? '+' : ''}${currentPnL.priceAppreciation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Impermanent Loss</span>
                <span className="font-semibold text-red-400">${currentPnL.impermanentLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Realized P&L</span>
                  <span className="font-semibold text-green-400">+${currentPnL.realized.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Unrealized P&L</span>
                  <span className={`font-semibold ${currentPnL.unrealized >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {currentPnL.unrealized >= 0 ? '+' : ''}${currentPnL.unrealized.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liquidity Distribution */}
      <Card className="border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-400" />
            Liquidity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Liquidity</span>
                <span className="font-semibold text-green-400">
                  ${currentLiquidity.activeLiquidity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Inactive Liquidity</span>
                <span className="font-semibold text-muted-foreground">
                  ${currentLiquidity.inactiveLiquidity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {currentLiquidity.utilizationRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Utilization Rate</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold mb-2">Bin Breakdown</h3>
            {currentLiquidity.bins.map((bin) => (
              <div
                key={bin.binId}
                className={`p-3 rounded-lg border ${
                  bin.isActive
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-muted/20 border-muted/20'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Bin #{bin.binId}</span>
                  <Badge variant={bin.isActive ? "default" : "outline"}>
                    {bin.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Value</span>
                  <span className="font-semibold">${bin.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Estimated APR</span>
                  <span className="font-semibold text-green-400">{bin.apr.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card className="border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Volatility Score</span>
                  <span className={`font-semibold ${getRiskColor(currentRisk.volatilityScore)}`}>
                    {currentRisk.volatilityScore.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full"
                    style={{ width: `${currentRisk.volatilityScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Price Deviation</span>
                  <span className={`font-semibold ${getRiskColor(currentRisk.priceDeviation * 4)}`}>
                    {currentRisk.priceDeviation.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full"
                    style={{ width: `${Math.min(currentRisk.priceDeviation * 4, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Concentration Risk</span>
                  <span className={`font-semibold ${getRiskColor(currentRisk.concentrationRisk)}`}>
                    {currentRisk.concentrationRisk.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full"
                    style={{ width: `${currentRisk.concentrationRisk}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Oracle Confidence</span>
                  <span className="font-semibold text-green-400">
                    {currentRisk.oracleConfidence.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${currentRisk.oracleConfidence}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center p-8 rounded-lg bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20">
                <div className={`text-5xl font-bold mb-2 ${getRiskColor(currentRisk.overallRiskScore)}`}>
                  {currentRisk.overallRiskScore.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground mb-4">Overall Risk Score</div>
                <Badge
                  variant={
                    currentRisk.overallRiskScore < 30
                      ? 'default'
                      : currentRisk.overallRiskScore < 60
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {currentRisk.overallRiskScore < 30
                    ? 'Low Risk'
                    : currentRisk.overallRiskScore < 60
                    ? 'Medium Risk'
                    : 'High Risk'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Implementation */}
      <Card className="border-purple-500/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Implementation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-purple-400">Oracle Integration</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Pyth Network real-time price feeds with confidence intervals</li>
                <li>• Switchboard fallback for enhanced reliability</li>
                <li>• Automatic oracle health monitoring and status alerts</li>
                <li>• Price staleness detection and degradation warnings</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-pink-400">Valuation Calculation</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Token value = liquidity × oracle price × (1 / 10^decimals)</li>
                <li>• Total value = tokenX value + tokenY value</li>
                <li>• Confidence = min(oracleX confidence, oracleY confidence)</li>
                <li>• Bin-level valuation with APR estimation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-blue-400">P&L Attribution</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Fee earnings = sum of collected fees from all bins</li>
                <li>• Price appreciation = (current value - initial value) - fees + IL</li>
                <li>• Impermanent loss = current LP value - HODL value</li>
                <li>• Realized vs unrealized P&L tracking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-yellow-400">Risk Metrics</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Volatility score from oracle price prediction models</li>
                <li>• Concentration risk using Herfindahl-Hirschman Index (HHI)</li>
                <li>• Price deviation tracking from initial ratios</li>
                <li>• Weighted overall risk score calculation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SDK Integration Info */}
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
        <CardHeader>
          <CardTitle>SDK Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">File:</span> <code className="text-purple-400">src/lib/dlmm/position-valuation.ts</code>
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Key Functions:</span>
          </p>
          <ul className="space-y-1 text-muted-foreground ml-4">
            <li>• <code className="text-blue-400">getPositionValuation()</code> - Comprehensive valuation with oracle data</li>
            <li>• <code className="text-blue-400">calculatePnL()</code> - Detailed P&L attribution analysis</li>
            <li>• <code className="text-blue-400">calculateLiquidityBreakdown()</code> - Bin-level liquidity distribution</li>
            <li>• <code className="text-blue-400">calculateRiskMetrics()</code> - Multi-factor risk assessment</li>
            <li>• <code className="text-blue-400">startMonitoring()</code> - Real-time valuation updates</li>
          </ul>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Oracle Integration:</span> <code className="text-green-400">src/lib/oracle/price-feeds.ts</code>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
