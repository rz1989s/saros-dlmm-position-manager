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
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  DollarSign,
  Zap,
  Bell,
  Target,
  Eye,
  RefreshCw
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM } from '@/hooks/use-dlmm'

interface PerformanceMetrics {
  healthScore: number
  efficiency: number
  utilizationRate: number
  feeYield: number
  impermanentLoss: number
  volumeCapture: number
  trend: 'up' | 'down' | 'stable'
  status: 'excellent' | 'good' | 'warning' | 'critical'
}

interface PerformanceAlert {
  id: string
  type: 'warning' | 'critical' | 'info'
  title: string
  message: string
  timestamp: Date
  action?: string
  priority: 'high' | 'medium' | 'low'
}


const MOCK_PERFORMANCE_DATA: PerformanceMetrics[] = [
  {
    healthScore: 92,
    efficiency: 87,
    utilizationRate: 78,
    feeYield: 24.5,
    impermanentLoss: -2.1,
    volumeCapture: 15.3,
    trend: 'up',
    status: 'excellent'
  },
  {
    healthScore: 68,
    efficiency: 72,
    utilizationRate: 45,
    feeYield: 12.8,
    impermanentLoss: -8.4,
    volumeCapture: 8.7,
    trend: 'down',
    status: 'warning'
  },
  {
    healthScore: 45,
    efficiency: 38,
    utilizationRate: 23,
    feeYield: 5.2,
    impermanentLoss: -15.7,
    volumeCapture: 3.1,
    trend: 'down',
    status: 'critical'
  }
]

const MOCK_ALERTS: PerformanceAlert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'High Impermanent Loss Detected',
    message: 'Position SOL/USDC showing 15.7% impermanent loss. Consider rebalancing.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    action: 'Rebalance Position',
    priority: 'high'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Low Utilization Rate',
    message: 'BTC/SOL position utilization dropped to 23%. Range may be too wide.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    action: 'Adjust Range',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'info',
    title: 'Excellent Performance',
    message: 'ETH/USDC position maintaining 92% health score with optimal fee collection.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    priority: 'low'
  }
]

export default function PerformanceMonitoringDemo() {
  const { publicKey } = useWallet()
  const { connected } = useDLMM()

  // Use variables to satisfy TypeScript
  console.log('Demo initialized:', { connected, hasWallet: !!publicKey })
  const [selectedPosition, setSelectedPosition] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)

  const currentMetrics = MOCK_PERFORMANCE_DATA[selectedPosition] || MOCK_PERFORMANCE_DATA[0]

  useEffect(() => {
    if (!realTimeEnabled) return

    const interval = setInterval(() => {
      // Simulate real-time updates
      // In real implementation, this would fetch live data
    }, 5000)

    return () => clearInterval(interval)
  }, [realTimeEnabled])

  const refreshData = async () => {
    setRefreshing(true)
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500))
    setRefreshing(false)
  }

  const getStatusColor = (status: PerformanceMetrics['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getAlertColor = (type: PerformanceAlert['type']) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
      case 'info': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950'
    }
  }

  const getAlertIcon = (type: PerformanceAlert['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info': return <CheckCircle className="h-5 w-5 text-blue-600" />
      default: return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getTrendIcon = (trend: PerformanceMetrics['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[14] || { id: 14, name: 'Position Performance Monitoring', status: 'live' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-saros-primary to-saros-secondary flex items-center justify-center">
              <Gauge className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-saros-primary to-saros-secondary bg-clip-text text-transparent">
              Position Performance Monitoring
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Real-time position health scoring, performance alerts, and trend analysis with actionable insights for optimal liquidity management.
          </p>
        </motion.div>
      </FeatureIdentifier>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(Number(e.target.value))}
            className="border border-input rounded-md px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={0}>SOL/USDC Pool (Excellent)</option>
            <option value={1}>BTC/SOL Pool (Warning)</option>
            <option value={2}>ETH/USDC Pool (Critical)</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
          >
            <Zap className={`h-4 w-4 mr-2 ${realTimeEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            Real-time: {realTimeEnabled ? 'ON' : 'OFF'}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Performance Overview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(currentMetrics.status)}>
                {currentMetrics.status.toUpperCase()}
              </Badge>
              {getTrendIcon(currentMetrics.trend)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StaggerList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" staggerDelay={0.1}>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                currentMetrics.healthScore >= 80 ? 'text-green-600' :
                currentMetrics.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {currentMetrics.healthScore}
              </div>
              <p className="text-sm text-muted-foreground">Health Score</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    currentMetrics.healthScore >= 80 ? 'bg-green-600' :
                    currentMetrics.healthScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${currentMetrics.healthScore}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-saros-primary mb-2">
                {currentMetrics.efficiency}%
              </div>
              <p className="text-sm text-muted-foreground">Efficiency</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full bg-saros-primary"
                  style={{ width: `${currentMetrics.efficiency}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {currentMetrics.utilizationRate}%
              </div>
              <p className="text-sm text-muted-foreground">Utilization</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${currentMetrics.utilizationRate}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {currentMetrics.feeYield}%
              </div>
              <p className="text-sm text-muted-foreground">Fee Yield</p>
              <p className="text-xs text-muted-foreground mt-1">Annual APY</p>
            </div>

            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                currentMetrics.impermanentLoss > -5 ? 'text-green-600' :
                currentMetrics.impermanentLoss > -10 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {currentMetrics.impermanentLoss}%
              </div>
              <p className="text-sm text-muted-foreground">Impermanent Loss</p>
              <p className="text-xs text-muted-foreground mt-1">vs. Holding</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {currentMetrics.volumeCapture}%
              </div>
              <p className="text-sm text-muted-foreground">Volume Capture</p>
              <p className="text-xs text-muted-foreground mt-1">24h average</p>
            </div>
          </StaggerList>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Performance Alerts</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="insights">Actionable Insights</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Performance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_ALERTS.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                alert.priority === 'high' ? 'border-red-300 text-red-700' :
                                alert.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                                'border-blue-300 text-blue-700'
                              }`}
                            >
                              {alert.priority.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {alert.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm mb-3">{alert.message}</p>
                        {alert.action && (
                          <Button size="sm" variant="outline">
                            <Target className="h-4 w-4 mr-2" />
                            {alert.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Trends (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Trend Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg Health Score</p>
                          <p className="text-2xl font-bold">78</p>
                        </div>
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-xs text-green-600 mt-1">+5.2% from yesterday</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Fee Collection</p>
                          <p className="text-2xl font-bold">2.4 SOL</p>
                        </div>
                        <DollarSign className="h-6 w-6 text-saros-primary" />
                      </div>
                      <p className="text-xs text-saros-primary mt-1">+12.8% from yesterday</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Volume Captured</p>
                          <p className="text-2xl font-bold">$45.2K</p>
                        </div>
                        <Activity className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-xs text-blue-600 mt-1">-2.1% from yesterday</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Utilization</p>
                          <p className="text-2xl font-bold">62%</p>
                        </div>
                        <Gauge className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-xs text-red-600 mt-1">-8.4% from yesterday</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Trend Chart Placeholder */}
                <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Interactive trend charts would display here</p>
                    <p className="text-sm text-muted-foreground">Real implementation would use Recharts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Actionable Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Key Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                            Optimal Range Positioning
                          </h3>
                          <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                            Your SOL/USDC position is perfectly positioned around current market price,
                            capturing 78% of trading volume.
                          </p>
                          <Button size="sm" variant="outline" className="border-green-300 text-green-700">
                            Maintain Strategy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                            Range Adjustment Needed
                          </h3>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                            BTC/SOL position range is too wide, resulting in low capital efficiency.
                            Consider tightening the range.
                          </p>
                          <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700">
                            Adjust Range
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                            High Impermanent Loss
                          </h3>
                          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                            ETH/USDC position experiencing significant IL due to ETH price movement.
                            Consider rebalancing or exit strategy.
                          </p>
                          <Button size="sm" variant="outline" className="border-red-300 text-red-700">
                            Rebalance Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Zap className="h-6 w-6 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                            Fee Tier Optimization
                          </h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                            Current 0.25% fee tier is optimal for current volatility levels.
                            Monitor for potential tier adjustments.
                          </p>
                          <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
                            Monitor Tiers
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Performance Optimization Recommendations</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-saros-primary text-white text-xs flex items-center justify-center mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Increase Position Concentration</p>
                        <p className="text-sm text-muted-foreground">
                          Focus liquidity in tighter ranges around current market price to improve capital efficiency by up to 25%.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-saros-primary text-white text-xs flex items-center justify-center mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Implement Dynamic Rebalancing</p>
                        <p className="text-sm text-muted-foreground">
                          Set up automated rebalancing triggers to maintain optimal range positioning during market movements.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-saros-primary text-white text-xs flex items-center justify-center mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Monitor IL Thresholds</p>
                        <p className="text-sm text-muted-foreground">
                          Set alerts for impermanent loss exceeding 10% to enable timely intervention and risk management.
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