'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import {
  Target,
  TrendingUp,
  Zap,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  BarChart3,
  ArrowRight,
  Route,
  Settings,
  Maximize2
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM } from '@/hooks/use-dlmm'

interface OptimizedRoute {
  id: string
  fromPool: string
  toPool: string
  optimizationScore: number
  costEfficiency: number
  timeEfficiency: number
  riskScore: number
  estimatedCost: number
  estimatedTime: number
  savings: number
}

export default function MigrationOptimizerDemo() {
  const { publicKey } = useWallet()
  useDLMM() // Hook for potential future use
  const [optimizing, setOptimizing] = useState(false)
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([])
  const [selectedPreference, setSelectedPreference] = useState<'cost' | 'speed' | 'safety'>('cost')

  useEffect(() => {
    if (publicKey) {
      analyzeRoutes()
    }
  }, [publicKey, selectedPreference])

  const analyzeRoutes = async () => {
    setOptimizing(true)

    // Simulate route optimization analysis
    await new Promise(resolve => setTimeout(resolve, 2000))

    const routes: OptimizedRoute[] = [
      {
        id: 'route-1',
        fromPool: 'SOL/USDC - Pool A',
        toPool: 'SOL/USDC - Pool B',
        optimizationScore: 92,
        costEfficiency: 0.88,
        timeEfficiency: 0.75,
        riskScore: 25,
        estimatedCost: 0.012,
        estimatedTime: 180,
        savings: 0.008
      },
      {
        id: 'route-2',
        fromPool: 'SOL/USDT - Pool C',
        toPool: 'SOL/USDT - Pool D',
        optimizationScore: 85,
        costEfficiency: 0.82,
        timeEfficiency: 0.90,
        riskScore: 30,
        estimatedCost: 0.015,
        estimatedTime: 120,
        savings: 0.005
      },
      {
        id: 'route-3',
        fromPool: 'BONK/USDC - Pool E',
        toPool: 'BONK/USDC - Pool F',
        optimizationScore: 78,
        costEfficiency: 0.75,
        timeEfficiency: 0.68,
        riskScore: 45,
        estimatedCost: 0.020,
        estimatedTime: 240,
        savings: 0.003
      }
    ]

    setOptimizedRoutes(routes)
    setOptimizing(false)
  }

  const avgOptimizationScore = optimizedRoutes.length > 0
    ? optimizedRoutes.reduce((sum, r) => sum + r.optimizationScore, 0) / optimizedRoutes.length
    : 0

  const totalSavings = optimizedRoutes.reduce((sum, r) => sum + r.savings, 0)
  const avgCostEfficiency = optimizedRoutes.length > 0
    ? optimizedRoutes.reduce((sum, r) => sum + r.costEfficiency, 0) / optimizedRoutes.length
    : 0

  const getRiskBadge = (score: number) => {
    if (score < 30) return <Badge className="bg-green-500">Low Risk</Badge>
    if (score < 60) return <Badge className="bg-yellow-500">Medium Risk</Badge>
    return <Badge className="bg-red-500">High Risk</Badge>
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[47] || { id: 47, name: 'Migration Optimizer', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-saros-primary to-saros-secondary flex items-center justify-center">
              <Route className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-saros-primary to-saros-secondary bg-clip-text text-transparent">
              Migration Optimizer
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Advanced migration route optimization with cost minimization, time efficiency, and intelligent route selection for maximum capital efficiency.
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
                Connect your wallet to analyze and optimize migration routes for your positions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Optimization Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant={selectedPreference === 'cost' ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setSelectedPreference('cost')}
            >
              <DollarSign className="h-6 w-6" />
              <span className="font-semibold">Cost Priority</span>
              <span className="text-xs text-muted-foreground">Minimize gas costs</span>
            </Button>

            <Button
              variant={selectedPreference === 'speed' ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setSelectedPreference('speed')}
            >
              <Zap className="h-6 w-6" />
              <span className="font-semibold">Speed Priority</span>
              <span className="text-xs text-muted-foreground">Fastest execution</span>
            </Button>

            <Button
              variant={selectedPreference === 'safety' ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setSelectedPreference('safety')}
            >
              <Shield className="h-6 w-6" />
              <span className="font-semibold">Safety Priority</span>
              <span className="text-xs text-muted-foreground">Lowest risk</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      {optimizedRoutes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Optimization Score</p>
                  <p className="text-2xl font-bold">{avgOptimizationScore.toFixed(0)}/100</p>
                </div>
                <Target className="h-8 w-8 text-saros-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cost Efficiency</p>
                  <p className="text-2xl font-bold text-green-600">{(avgCostEfficiency * 100).toFixed(0)}%</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Savings</p>
                  <p className="text-2xl font-bold text-saros-secondary">{totalSavings.toFixed(3)} SOL</p>
                </div>
                <TrendingUp className="h-8 w-8 text-saros-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Routes Analyzed</p>
                  <p className="text-2xl font-bold">{optimizedRoutes.length}</p>
                </div>
                <Route className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Optimized Routes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Optimized Migration Routes
            </span>
            {optimizing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing routes...</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {optimizedRoutes.length === 0 && !optimizing && (
            <div className="text-center py-12 text-muted-foreground">
              <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No routes available. Connect wallet with positions to analyze.</p>
            </div>
          )}

          <div className="space-y-4">
            {optimizedRoutes.map((route, index) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 hover:border-saros-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Route Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{route.fromPool}</h3>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">{route.toPool}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              Score: {route.optimizationScore}/100
                            </Badge>
                            {getRiskBadge(route.riskScore)}
                          </div>
                        </div>
                      </div>

                      {/* Efficiency Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Cost Efficiency</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-green-600"
                                style={{ width: `${route.costEfficiency * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{(route.costEfficiency * 100).toFixed(0)}%</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Time Efficiency</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                                style={{ width: `${route.timeEfficiency * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{(route.timeEfficiency * 100).toFixed(0)}%</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Estimated Cost</p>
                          <p className="text-sm font-semibold">{route.estimatedCost.toFixed(4)} SOL</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Estimated Time</p>
                          <p className="text-sm font-semibold">{Math.floor(route.estimatedTime / 60)}m {route.estimatedTime % 60}s</p>
                        </div>
                      </div>

                      {/* Savings Highlight */}
                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium">Estimated Savings</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            {route.savings.toFixed(4)} SOL
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button className="w-full" size="lg">
                        <Maximize2 className="h-4 w-4 mr-2" />
                        View Full Optimization Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Batch Transactions</p>
                <p className="text-xs text-muted-foreground">Combine multiple migrations to reduce gas costs by up to 40%</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Optimal Timing</p>
                <p className="text-xs text-muted-foreground">Execute during low network congestion for better gas prices</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Route Caching</p>
                <p className="text-xs text-muted-foreground">Similar routes are cached for faster execution and reduced costs</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Implementation */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Multi-criteria route optimization (cost, time, risk)</li>
              <li>Dynamic slippage tolerance based on market conditions</li>
              <li>Intelligent transaction batching for gas savings</li>
              <li>Real-time route performance monitoring</li>
              <li>Alternative route generation with trade-off analysis</li>
              <li>Cost breakdown analysis with optimization opportunities</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Optimization Algorithms:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• <span className="font-medium">Cost Optimization:</span> Transaction batching, gas timing, route simplification</p>
              <p>• <span className="font-medium">Time Optimization:</span> Parallel execution, pre-approvals, route caching</p>
              <p>• <span className="font-medium">Risk Optimization:</span> Slippage protection, rollback mechanisms, liquidity verification</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">SDK Location:</span> src/lib/dlmm/migration-optimizer.ts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
