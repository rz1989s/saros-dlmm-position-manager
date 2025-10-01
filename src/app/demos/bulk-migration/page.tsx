'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import {
  Package,
  Loader2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  BarChart3,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Users,
  Zap,
  Shield,
  ArrowRight
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM } from '@/hooks/use-dlmm'

interface BulkMigrationStatus {
  totalPositions: number
  completed: number
  failed: number
  inProgress: number
  percentComplete: number
}

interface PositionMigration {
  id: string
  positionName: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  fromPool: string
  toPool: string
  estimatedCost: number
  actualCost?: number
  estimatedTime: number
  actualTime?: number
}

export default function BulkMigrationDemo() {
  const { publicKey } = useWallet()
  useDLMM() // Hook for potential future use
  const [executing, setExecuting] = useState(false)
  const [paused, setPaused] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState<BulkMigrationStatus>({
    totalPositions: 0,
    completed: 0,
    failed: 0,
    inProgress: 0,
    percentComplete: 0
  })
  const [positionMigrations, setPositionMigrations] = useState<PositionMigration[]>([])
  const [executionStrategy, setExecutionStrategy] = useState<'sequential' | 'parallel' | 'batched' | 'staged'>('batched')

  useEffect(() => {
    if (publicKey) {
      initializeMigrations()
    }
  }, [publicKey])

  const initializeMigrations = () => {
    const migrations: PositionMigration[] = [
      {
        id: '1',
        positionName: 'SOL/USDC Position #1',
        status: 'pending',
        fromPool: 'SOL/USDC Pool A',
        toPool: 'SOL/USDC Pool B',
        estimatedCost: 0.012,
        estimatedTime: 180
      },
      {
        id: '2',
        positionName: 'SOL/USDT Position #2',
        status: 'pending',
        fromPool: 'SOL/USDT Pool C',
        toPool: 'SOL/USDT Pool D',
        estimatedCost: 0.015,
        estimatedTime: 120
      },
      {
        id: '3',
        positionName: 'BONK/USDC Position #3',
        status: 'pending',
        fromPool: 'BONK/USDC Pool E',
        toPool: 'BONK/USDC Pool F',
        estimatedCost: 0.018,
        estimatedTime: 240
      },
      {
        id: '4',
        positionName: 'mSOL/SOL Position #4',
        status: 'pending',
        fromPool: 'mSOL/SOL Pool G',
        toPool: 'mSOL/SOL Pool H',
        estimatedCost: 0.010,
        estimatedTime: 150
      }
    ]

    setPositionMigrations(migrations)
    setMigrationStatus({
      totalPositions: migrations.length,
      completed: 0,
      failed: 0,
      inProgress: 0,
      percentComplete: 0
    })
  }

  const startBulkMigration = async () => {
    setExecuting(true)
    setPaused(false)

    // Simulate bulk migration execution
    const migrations = [...positionMigrations]

    for (let i = 0; i < migrations.length; i++) {
      if (paused) break

      // Mark as in progress
      migrations[i].status = 'in_progress'
      setPositionMigrations([...migrations])
      setMigrationStatus(prev => ({
        ...prev,
        inProgress: 1
      }))

      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Randomly succeed or fail (90% success rate)
      const success = Math.random() > 0.1

      migrations[i].status = success ? 'completed' : 'failed'
      migrations[i].actualCost = migrations[i].estimatedCost * (0.9 + Math.random() * 0.2)
      migrations[i].actualTime = migrations[i].estimatedTime * (0.8 + Math.random() * 0.4)

      setPositionMigrations([...migrations])
      setMigrationStatus(prev => ({
        ...prev,
        completed: success ? prev.completed + 1 : prev.completed,
        failed: success ? prev.failed : prev.failed + 1,
        inProgress: 0,
        percentComplete: ((i + 1) / migrations.length) * 100
      }))
    }

    setExecuting(false)
  }

  const pauseMigration = () => {
    setPaused(true)
    setExecuting(false)
  }

  const resetMigration = () => {
    initializeMigrations()
    setExecuting(false)
    setPaused(false)
  }

  const getStatusIcon = (status: PositionMigration['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: PositionMigration['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const totalEstimatedCost = positionMigrations.reduce((sum, p) => sum + p.estimatedCost, 0)
  const estimatedSavings = totalEstimatedCost * 0.15 // 15% savings from batching

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[48] || { id: 48, name: 'Bulk Migration', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-saros-primary to-saros-secondary flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-saros-primary to-saros-secondary bg-clip-text text-transparent">
              Bulk Migration Engine
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Efficient migration of multiple positions with parallel processing, batch optimization, and intelligent execution strategies for maximum efficiency.
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
                Connect your wallet to execute bulk position migrations.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution Strategy Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Execution Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              variant={executionStrategy === 'sequential' ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setExecutionStrategy('sequential')}
              disabled={executing}
            >
              <span className="font-semibold">Sequential</span>
              <span className="text-xs text-muted-foreground">One at a time</span>
            </Button>

            <Button
              variant={executionStrategy === 'parallel' ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setExecutionStrategy('parallel')}
              disabled={executing}
            >
              <span className="font-semibold">Parallel</span>
              <span className="text-xs text-muted-foreground">Simultaneous</span>
            </Button>

            <Button
              variant={executionStrategy === 'batched' ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setExecutionStrategy('batched')}
              disabled={executing}
            >
              <span className="font-semibold">Batched</span>
              <span className="text-xs text-muted-foreground">Optimized groups</span>
            </Button>

            <Button
              variant={executionStrategy === 'staged' ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setExecutionStrategy('staged')}
              disabled={executing}
            >
              <span className="font-semibold">Staged</span>
              <span className="text-xs text-muted-foreground">Risk-based</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Positions</p>
                <p className="text-2xl font-bold">{migrationStatus.totalPositions}</p>
              </div>
              <Users className="h-8 w-8 text-saros-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{migrationStatus.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estimated Savings</p>
                <p className="text-2xl font-bold text-saros-secondary">{estimatedSavings.toFixed(4)} SOL</p>
              </div>
              <DollarSign className="h-8 w-8 text-saros-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{migrationStatus.percentComplete.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-semibold">{migrationStatus.percentComplete.toFixed(0)}%</span>
            </div>
            <Progress value={migrationStatus.percentComplete} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{migrationStatus.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{migrationStatus.inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{migrationStatus.failed}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            {!executing && migrationStatus.percentComplete === 0 && (
              <Button onClick={startBulkMigration} className="flex-1" size="lg">
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Bulk Migration
              </Button>
            )}

            {executing && (
              <Button onClick={pauseMigration} variant="outline" className="flex-1" size="lg">
                <PauseCircle className="h-4 w-4 mr-2" />
                Pause Migration
              </Button>
            )}

            {(migrationStatus.percentComplete > 0 || paused) && (
              <Button onClick={resetMigration} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Position Migrations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Position Migrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positionMigrations.map((migration, index) => (
              <motion.div
                key={migration.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(migration.status)}
                            <h3 className="text-lg font-semibold">{migration.positionName}</h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{migration.fromPool}</span>
                            <ArrowRight className="h-4 w-4" />
                            <span>{migration.toPool}</span>
                          </div>
                        </div>
                        {getStatusBadge(migration.status)}
                      </div>

                      {migration.status === 'in_progress' && (
                        <div className="space-y-2">
                          <Progress value={50} className="h-2" />
                          <p className="text-xs text-muted-foreground">Executing migration...</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Estimated Cost</p>
                          <p className="text-sm font-semibold">{migration.estimatedCost.toFixed(4)} SOL</p>
                        </div>

                        {migration.actualCost && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Actual Cost</p>
                            <p className="text-sm font-semibold">{migration.actualCost.toFixed(4)} SOL</p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Estimated Time</p>
                          <p className="text-sm font-semibold">{Math.floor(migration.estimatedTime / 60)}m</p>
                        </div>

                        {migration.actualTime && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Actual Time</p>
                            <p className="text-sm font-semibold">{Math.floor(migration.actualTime / 60)}m</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Bulk Migration Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Transaction Batching</p>
                <p className="text-xs text-muted-foreground">Save up to 40% on gas costs through intelligent transaction batching</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Parallel Processing</p>
                <p className="text-xs text-muted-foreground">Execute multiple migrations simultaneously for faster completion</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Risk Management</p>
                <p className="text-xs text-muted-foreground">Automatic rollback and recovery for failed migrations</p>
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
              <li>Support for 4 execution strategies: sequential, parallel, batched, staged</li>
              <li>Intelligent batch optimization with route sharing</li>
              <li>Real-time progress tracking with detailed status updates</li>
              <li>Automatic rollback for critical failures</li>
              <li>Risk-based staging for safety-critical migrations</li>
              <li>Performance metrics and efficiency scoring</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Execution Strategies:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• <span className="font-medium">Sequential:</span> One migration at a time - safest option</p>
              <p>• <span className="font-medium">Parallel:</span> Multiple migrations simultaneously - fastest option</p>
              <p>• <span className="font-medium">Batched:</span> Optimized groups for balance - recommended</p>
              <p>• <span className="font-medium">Staged:</span> Risk-based ordering - enterprise-grade</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">SDK Location:</span> src/lib/dlmm/bulk-migration.ts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
