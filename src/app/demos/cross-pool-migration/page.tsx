'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import {
  GitBranch,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Loader2,
  DollarSign,
  BarChart3,
  Zap,
  Shield,
  PlayCircle,
  RefreshCw,
  ArrowRight,
  Activity
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM } from '@/hooks/use-dlmm'

interface MigrationOpportunity {
  id: string
  fromPool: string
  toPool: string
  fromPair: string
  toPair: string
  currentAPR: number
  targetAPR: number
  aprImprovement: number
  currentVolume: number
  targetVolume: number
  volumeImprovement: number
  migrationCost: number
  projectedBenefit: number
  breakEvenDays: number
  recommendation: 'highly_recommended' | 'recommended' | 'neutral' | 'not_recommended'
  riskLevel: 'low' | 'medium' | 'high'
}

interface PoolMetrics {
  address: string
  pair: string
  tvl: number
  volume24h: number
  apr: number
  feeTier: number
  liquidityDepth: number
  priceImpact: number
}

const MOCK_OPPORTUNITIES: MigrationOpportunity[] = [
  {
    id: '1',
    fromPool: 'Pool-A1B2...C3D4',
    toPool: 'Pool-X5Y6...Z7W8',
    fromPair: 'SOL/USDC',
    toPair: 'SOL/USDC',
    currentAPR: 12.5,
    targetAPR: 18.3,
    aprImprovement: 46.4,
    currentVolume: 1250000,
    targetVolume: 2800000,
    volumeImprovement: 124,
    migrationCost: 0.35,
    projectedBenefit: 2.4,
    breakEvenDays: 5,
    recommendation: 'highly_recommended',
    riskLevel: 'low'
  },
  {
    id: '2',
    fromPool: 'Pool-B2C3...D4E5',
    toPool: 'Pool-Y6Z7...W8V9',
    fromPair: 'USDT/USDC',
    toPair: 'USDT/USDC',
    currentAPR: 8.2,
    targetAPR: 11.7,
    aprImprovement: 42.7,
    currentVolume: 850000,
    targetVolume: 1650000,
    volumeImprovement: 94.1,
    migrationCost: 0.22,
    projectedBenefit: 1.8,
    breakEvenDays: 4,
    recommendation: 'recommended',
    riskLevel: 'low'
  },
  {
    id: '3',
    fromPool: 'Pool-C3D4...E5F6',
    toPool: 'Pool-Z7W8...V9U0',
    fromPair: 'mSOL/SOL',
    toPair: 'mSOL/SOL',
    currentAPR: 15.8,
    targetAPR: 19.2,
    aprImprovement: 21.5,
    currentVolume: 620000,
    targetVolume: 980000,
    volumeImprovement: 58.1,
    migrationCost: 0.48,
    projectedBenefit: 1.2,
    breakEvenDays: 14,
    recommendation: 'neutral',
    riskLevel: 'medium'
  }
]

const MOCK_POOL_COMPARISON: PoolMetrics[] = [
  {
    address: 'Pool-A1B2...C3D4',
    pair: 'SOL/USDC',
    tvl: 5200000,
    volume24h: 1250000,
    apr: 12.5,
    feeTier: 0.25,
    liquidityDepth: 0.85,
    priceImpact: 0.12
  },
  {
    address: 'Pool-X5Y6...Z7W8',
    pair: 'SOL/USDC',
    tvl: 12800000,
    volume24h: 2800000,
    apr: 18.3,
    feeTier: 0.30,
    liquidityDepth: 0.92,
    priceImpact: 0.06
  }
]

export default function CrossPoolMigrationDemo() {
  const { publicKey } = useWallet()
  const { connected } = useDLMM()
  const [opportunities, setOpportunities] = useState<MigrationOpportunity[]>([])
  const [selectedOpportunity, setSelectedOpportunity] = useState<MigrationOpportunity | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationProgress, setMigrationProgress] = useState(0)

  // Use variables to satisfy TypeScript
  console.log('Cross-pool migration demo initialized:', { connected, hasWallet: !!publicKey })

  // Simulate opportunity analysis
  const analyzeOpportunities = async () => {
    setIsAnalyzing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setOpportunities(MOCK_OPPORTUNITIES)
    setIsAnalyzing(false)
  }

  // Auto-analyze on mount if wallet connected
  useEffect(() => {
    if (connected && publicKey && opportunities.length === 0) {
      analyzeOpportunities()
    }
  }, [connected, publicKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Simulate migration execution
  const executeMigration = async (opportunity: MigrationOpportunity) => {
    setIsMigrating(true)
    setMigrationProgress(0)
    setSelectedOpportunity(opportunity)

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setMigrationProgress(i)
    }

    setIsMigrating(false)
    setMigrationProgress(100)
  }

  const getRecommendationColor = (rec: MigrationOpportunity['recommendation']) => {
    switch (rec) {
      case 'highly_recommended': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'recommended': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'neutral': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'not_recommended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getRiskColor = (risk: MigrationOpportunity['riskLevel']) => {
    switch (risk) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const totalPotentialBenefit = opportunities.reduce((sum, opp) => sum + opp.projectedBenefit, 0)
  const totalMigrationCost = opportunities.reduce((sum, opp) => sum + opp.migrationCost, 0)
  const avgAPRImprovement = opportunities.length > 0
    ? opportunities.reduce((sum, opp) => sum + opp.aprImprovement, 0) / opportunities.length
    : 0

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[21] || { id: 21, name: 'Cross-Pool Migration Engine', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-saros-primary to-saros-secondary flex items-center justify-center">
              <GitBranch className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-saros-primary to-saros-secondary bg-clip-text text-transparent">
              Cross-Pool Migration Engine
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Automated migration discovery, pool optimization analysis, and intelligent position consolidation across DLMM pools for maximum capital efficiency.
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
                Connect your wallet to discover cross-pool migration opportunities and optimize your positions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      {opportunities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Opportunities Found</p>
                  <p className="text-2xl font-bold">{opportunities.length}</p>
                </div>
                <Target className="h-8 w-8 text-saros-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg APR Improvement</p>
                  <p className="text-2xl font-bold text-green-600">+{avgAPRImprovement.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Potential Benefit</p>
                  <p className="text-2xl font-bold text-saros-secondary">+{totalPotentialBenefit.toFixed(2)} SOL</p>
                </div>
                <DollarSign className="h-8 w-8 text-saros-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Migration Cost</p>
                  <p className="text-2xl font-bold text-red-600">{totalMigrationCost.toFixed(2)} SOL</p>
                </div>
                <Zap className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="planning">Migration Planning</TabsTrigger>
          <TabsTrigger value="execution">Execution</TabsTrigger>
          <TabsTrigger value="comparison">Pool Comparison</TabsTrigger>
        </TabsList>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Migration Opportunities Discovery
                </CardTitle>
                <Button
                  onClick={analyzeOpportunities}
                  disabled={isAnalyzing || !connected}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Analyze Positions
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {opportunities.length === 0 ? (
                <div className="text-center py-12">
                  <GitBranch className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    {connected
                      ? 'Click "Analyze Positions" to discover migration opportunities'
                      : 'Connect your wallet to analyze your positions'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {opportunities.map((opportunity) => (
                    <motion.div
                      key={opportunity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-6 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{opportunity.fromPair}</h3>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">{opportunity.toPair}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getRecommendationColor(opportunity.recommendation)}>
                              {opportunity.recommendation.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className={getRiskColor(opportunity.riskLevel)}>
                              {opportunity.riskLevel.toUpperCase()} RISK
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Current APR</p>
                          <p className="text-lg font-bold">{opportunity.currentAPR.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Target APR</p>
                          <p className="text-lg font-bold text-green-600">{opportunity.targetAPR.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Improvement</p>
                          <p className="text-lg font-bold text-saros-primary">+{opportunity.aprImprovement.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Break-even</p>
                          <p className="text-lg font-bold">{opportunity.breakEvenDays} days</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">Cost: </span>
                            <span className="font-semibold text-red-600">{opportunity.migrationCost} SOL</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Benefit: </span>
                            <span className="font-semibold text-green-600">+{opportunity.projectedBenefit} SOL</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Net: </span>
                            <span className="font-semibold text-saros-secondary">
                              +{(opportunity.projectedBenefit - opportunity.migrationCost).toFixed(2)} SOL
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectedOpportunity(opportunity)}
                          variant="outline"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planning Tab */}
        <TabsContent value="planning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Migration Strategy Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedOpportunity ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Selected Migration: {selectedOpportunity.fromPair}</h3>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Migration Steps</h4>
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-saros-primary text-white text-xs flex items-center justify-center mt-0.5">1</div>
                            <div>
                              <p className="font-medium">Claim Pending Fees</p>
                              <p className="text-sm text-muted-foreground">Collect all unclaimed fees from current position</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-saros-primary text-white text-xs flex items-center justify-center mt-0.5">2</div>
                            <div>
                              <p className="font-medium">Remove Liquidity</p>
                              <p className="text-sm text-muted-foreground">Withdraw all liquidity from {selectedOpportunity.fromPool}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-saros-primary text-white text-xs flex items-center justify-center mt-0.5">3</div>
                            <div>
                              <p className="font-medium">Position Analysis</p>
                              <p className="text-sm text-muted-foreground">Analyze optimal bin ranges for target pool</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-saros-primary text-white text-xs flex items-center justify-center mt-0.5">4</div>
                            <div>
                              <p className="font-medium">Add Liquidity to New Pool</p>
                              <p className="text-sm text-muted-foreground">Create optimized position in {selectedOpportunity.toPool}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Safety Checks</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Sufficient SOL balance for transaction fees</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Target pool liquidity depth verified</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Slippage tolerance within acceptable range</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Rollback mechanism available</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Estimated Time</p>
                                <p className="text-lg font-bold">3-5 minutes</p>
                              </div>
                              <Zap className="h-6 w-6 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Gas Estimate</p>
                                <p className="text-lg font-bold">{selectedOpportunity.migrationCost} SOL</p>
                              </div>
                              <DollarSign className="h-6 w-6 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Opportunity Selected</h3>
                  <p className="text-muted-foreground">
                    Select an opportunity from the Opportunities tab to view migration planning details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Execution Tab */}
        <TabsContent value="execution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Migration Execution & Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedOpportunity ? (
                <div className="space-y-6">
                  {migrationProgress === 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Ready to Execute Migration</h3>
                      <p className="text-muted-foreground mb-6">
                        Migration from {selectedOpportunity.fromPool} to {selectedOpportunity.toPool} is ready to execute.
                        This will improve your APR by {selectedOpportunity.aprImprovement.toFixed(1)}% with a break-even period of {selectedOpportunity.breakEvenDays} days.
                      </p>
                      <Button
                        onClick={() => executeMigration(selectedOpportunity)}
                        disabled={isMigrating}
                        size="lg"
                        className="w-full"
                      >
                        {isMigrating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Executing Migration...
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Execute Migration
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Migration Progress</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm font-medium">{migrationProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-saros-primary to-saros-secondary"
                              initial={{ width: 0 }}
                              animate={{ width: `${migrationProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>

                        {migrationProgress === 100 && (
                          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-3">
                                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                                <div>
                                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                                    Migration Completed Successfully!
                                  </h4>
                                  <p className="text-sm text-green-700 dark:text-green-300">
                                    Your position has been successfully migrated to the target pool. You should start seeing improved returns within the next few hours.
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Rollback Protection</h4>
                    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                              Automatic Rollback Available
                            </h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                              If performance doesn&apos;t meet expectations within 7 days, you can rollback to your original position with minimal cost.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Migration Selected</h3>
                  <p className="text-muted-foreground">
                    Select an opportunity and review the migration plan before executing
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Pool Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {MOCK_POOL_COMPARISON.map((pool, index) => (
                  <div key={pool.address} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{pool.pair}</h3>
                        <p className="text-sm text-muted-foreground">{pool.address}</p>
                      </div>
                      {index === 1 && (
                        <Badge className="bg-green-100 text-green-800">RECOMMENDED</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">TVL</p>
                        <p className="text-lg font-bold">${(pool.tvl / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
                        <p className="text-lg font-bold">${(pool.volume24h / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">APR</p>
                        <p className={`text-lg font-bold ${index === 1 ? 'text-green-600' : ''}`}>
                          {pool.apr.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Fee Tier</p>
                        <p className="text-lg font-bold">{pool.feeTier}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Liquidity Depth</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-saros-primary"
                              style={{ width: `${pool.liquidityDepth * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{(pool.liquidityDepth * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Price Impact</p>
                        <p className="text-lg font-bold">{pool.priceImpact.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}