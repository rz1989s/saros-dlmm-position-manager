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
  RotateCcw,
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Activity,
  Shield,
  Zap,
  Archive,
  RefreshCw,
  Power
} from 'lucide-react'

interface Checkpoint {
  id: string
  timestamp: Date
  type: 'auto' | 'manual' | 'pre-migration'
  poolState: {
    pool: string
    liquidity: number
    tokenXAmount: number
    tokenYAmount: number
    apr: number
  }
  transactionHash: string
  status: 'valid' | 'expired' | 'corrupted'
  size: number // MB
  canRestore: boolean
}

interface RollbackOperation {
  id: string
  checkpointId: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  startTime: Date
  endTime?: Date
  progress: number
  steps: RollbackStep[]
  estimatedTime: number
  actualTime?: number
}

interface RollbackStep {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
  startTime?: Date
  endTime?: Date
  error?: string
  transactionHash?: string
}

interface RecoveryMetric {
  name: string
  before: number
  current: number
  target: number
  unit: string
  status: 'recovering' | 'recovered' | 'failed'
}

const MOCK_CHECKPOINTS: Checkpoint[] = [
  {
    id: 'checkpoint-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'pre-migration',
    poolState: {
      pool: 'SOL-USDC (0.25%)',
      liquidity: 50000,
      tokenXAmount: 1250,
      tokenYAmount: 48750,
      apr: 15.2
    },
    transactionHash: '5xK2mN8pQ...7Tz9',
    status: 'valid',
    size: 2.4,
    canRestore: true
  },
  {
    id: 'checkpoint-2',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: 'auto',
    poolState: {
      pool: 'SOL-USDC (0.25%)',
      liquidity: 48500,
      tokenXAmount: 1212,
      tokenYAmount: 47288,
      apr: 14.8
    },
    transactionHash: '3gH9fR2sK...4Np2',
    status: 'valid',
    size: 2.3,
    canRestore: true
  },
  {
    id: 'checkpoint-3',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    type: 'manual',
    poolState: {
      pool: 'SOL-USDC (0.3%)',
      liquidity: 45000,
      tokenXAmount: 1125,
      tokenYAmount: 43875,
      apr: 13.5
    },
    transactionHash: '8vL4pT7nM...2Dq5',
    status: 'valid',
    size: 2.1,
    canRestore: true
  },
  {
    id: 'checkpoint-4',
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    type: 'auto',
    poolState: {
      pool: 'SOL-USDC (0.25%)',
      liquidity: 42000,
      tokenXAmount: 1050,
      tokenYAmount: 40950,
      apr: 12.8
    },
    transactionHash: '2cJ6wV3hF...9Rp7',
    status: 'expired',
    size: 2.0,
    canRestore: false
  }
]

const MOCK_ROLLBACK_STEPS: RollbackStep[] = [
  {
    id: 'step-1',
    name: 'Validate checkpoint integrity',
    status: 'completed',
    startTime: new Date(Date.now() - 5 * 60 * 1000),
    endTime: new Date(Date.now() - 4.5 * 60 * 1000),
    transactionHash: '4hN8kL2mP...5Wz3'
  },
  {
    id: 'step-2',
    name: 'Remove liquidity from current pool',
    status: 'completed',
    startTime: new Date(Date.now() - 4.5 * 60 * 1000),
    endTime: new Date(Date.now() - 3 * 60 * 1000),
    transactionHash: '7tR5qK9nS...2Yv6'
  },
  {
    id: 'step-3',
    name: 'Restore token balances',
    status: 'in_progress',
    startTime: new Date(Date.now() - 3 * 60 * 1000)
  },
  {
    id: 'step-4',
    name: 'Re-add liquidity to original pool',
    status: 'pending'
  },
  {
    id: 'step-5',
    name: 'Verify position integrity',
    status: 'pending'
  },
  {
    id: 'step-6',
    name: 'Update position metadata',
    status: 'pending'
  }
]

const MOCK_RECOVERY_METRICS: RecoveryMetric[] = [
  {
    name: 'Liquidity Position',
    before: 50000,
    current: 32500,
    target: 50000,
    unit: '$',
    status: 'recovering'
  },
  {
    name: 'APR',
    before: 18.7,
    current: 16.2,
    target: 15.2,
    unit: '%',
    status: 'recovering'
  },
  {
    name: 'Token X Balance',
    before: 1562,
    current: 1350,
    target: 1250,
    unit: 'SOL',
    status: 'recovering'
  },
  {
    name: 'Token Y Balance',
    before: 61038,
    current: 52650,
    target: 48750,
    unit: 'USDC',
    status: 'recovering'
  }
]

export default function MigrationRollbackDemo() {
  const { publicKey } = useWallet()
  const { connected } = useDLMM()
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null)
  const [rollbackOperation, setRollbackOperation] = useState<RollbackOperation | null>(null)
  const [showEmergency, setShowEmergency] = useState(false)

  console.log('Migration rollback demo initialized:', { connected, hasWallet: !!publicKey })

  const initiateRollback = (checkpoint: Checkpoint) => {
    setRollbackOperation({
      id: `rollback-${Date.now()}`,
      checkpointId: checkpoint.id,
      status: 'in_progress',
      startTime: new Date(),
      progress: 40,
      steps: MOCK_ROLLBACK_STEPS,
      estimatedTime: 6 * 60 // seconds
    })
  }

  const getCheckpointBadgeColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'corrupted': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress': return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[46] || { id: 46, name: 'Migration Rollback', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <RotateCcw className="h-12 w-12 text-saros-primary" />
            <h1 className="text-4xl font-bold">Migration Rollback</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive rollback system with checkpoint management, emergency recovery, and automated state restoration
          </p>

          {/* Rollback Status */}
          {rollbackOperation && (
            <Card className="max-w-2xl mx-auto border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Rollback in Progress</div>
                      <div className="text-xs text-muted-foreground">
                        Step {rollbackOperation.steps.filter(s => s.status === 'completed').length + 1} of {rollbackOperation.steps.length}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{rollbackOperation.progress}%</div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all"
                      style={{ width: `${rollbackOperation.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    Estimated time remaining: {Math.ceil((rollbackOperation.estimatedTime * (100 - rollbackOperation.progress)) / 100)}s
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Rollback Banner */}
          {showEmergency && (
            <Card className="max-w-2xl mx-auto border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-red-900 dark:text-red-200">Emergency Rollback Mode</div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      System will restore to last known good state immediately
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowEmergency(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </FeatureIdentifier>

      {/* Rollback Tabs */}
      <Tabs defaultValue="checkpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checkpoints">Checkpoint Management</TabsTrigger>
          <TabsTrigger value="execution">Rollback Execution</TabsTrigger>
          <TabsTrigger value="recovery">Recovery Status</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Controls</TabsTrigger>
        </TabsList>

        {/* Checkpoint Management Tab */}
        <TabsContent value="checkpoints" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Available Checkpoints</h3>
              <p className="text-sm text-muted-foreground">
                {MOCK_CHECKPOINTS.filter(c => c.status === 'valid').length} valid checkpoints available
              </p>
            </div>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Create Checkpoint
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {MOCK_CHECKPOINTS.map((checkpoint) => (
              <motion.div
                key={checkpoint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card
                  className={`cursor-pointer transition-shadow ${
                    selectedCheckpoint?.id === checkpoint.id ? 'ring-2 ring-saros-primary' : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedCheckpoint(checkpoint)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {checkpoint.type === 'pre-migration' && <Shield className="h-5 w-5 text-blue-500" />}
                          {checkpoint.type === 'manual' && <Save className="h-5 w-5 text-purple-500" />}
                          {checkpoint.type === 'auto' && <RefreshCw className="h-5 w-5 text-green-500" />}
                          {checkpoint.type === 'pre-migration' ? 'Pre-Migration' : checkpoint.type === 'manual' ? 'Manual' : 'Auto'} Checkpoint
                        </CardTitle>
                        <CardDescription>
                          {checkpoint.timestamp.toLocaleString()} • {checkpoint.size} MB
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getCheckpointBadgeColor(checkpoint.status)}>
                          {checkpoint.status.toUpperCase()}
                        </Badge>
                        {checkpoint.canRestore && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Restorable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Pool State */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Pool State</div>
                      <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="text-xs text-muted-foreground">Pool</div>
                          <div className="font-semibold">{checkpoint.poolState.pool}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Liquidity</div>
                          <div className="font-semibold">${checkpoint.poolState.liquidity.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">APR</div>
                          <div className="font-semibold">{checkpoint.poolState.apr}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Transaction</div>
                          <div className="font-mono text-xs">{checkpoint.transactionHash}</div>
                        </div>
                      </div>
                    </div>

                    {/* Token Balances */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/30 rounded">
                        <div className="text-xs text-muted-foreground">Token X</div>
                        <div className="text-lg font-bold">{checkpoint.poolState.tokenXAmount.toFixed(2)} SOL</div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded">
                        <div className="text-xs text-muted-foreground">Token Y</div>
                        <div className="text-lg font-bold">{checkpoint.poolState.tokenYAmount.toFixed(2)} USDC</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Database className="h-4 w-4" />
                          {checkpoint.size} MB
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.floor((Date.now() - checkpoint.timestamp.getTime()) / (60 * 60 * 1000))}h ago
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!checkpoint.canRestore}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          disabled={!checkpoint.canRestore}
                          onClick={(e) => {
                            e.stopPropagation()
                            initiateRollback(checkpoint)
                          }}
                        >
                          Restore
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Rollback Execution Tab */}
        <TabsContent value="execution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-saros-primary" />
                Rollback Execution Status
              </CardTitle>
              <CardDescription>
                Monitor rollback progress and execution steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {rollbackOperation ? (
                <>
                  {/* Operation Info */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="text-lg font-bold capitalize">{rollbackOperation.status.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Progress</div>
                      <div className="text-lg font-bold">{rollbackOperation.progress}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Elapsed Time</div>
                      <div className="text-lg font-bold">
                        {Math.floor((Date.now() - rollbackOperation.startTime.getTime()) / 1000)}s
                      </div>
                    </div>
                  </div>

                  {/* Execution Steps */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Execution Steps</div>
                    {rollbackOperation.steps.map((step) => (
                      <div key={step.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center">
                          {getStepIcon(step.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{step.name}</div>
                            <Badge variant="outline" className="text-xs capitalize">
                              {step.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {step.transactionHash && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Tx: {step.transactionHash}
                            </div>
                          )}
                          {step.error && (
                            <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              {step.error}
                            </div>
                          )}
                          {step.startTime && step.endTime && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Completed in {Math.floor((step.endTime.getTime() - step.startTime.getTime()) / 1000)}s
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" className="flex-1">
                      <Archive className="h-4 w-4 mr-2" />
                      View Logs
                    </Button>
                    <Button variant="destructive" className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Rollback
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <RotateCcw className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <div className="text-lg font-medium">No Active Rollback</div>
                  <div className="text-sm text-muted-foreground">
                    Select a checkpoint from the Checkpoint Management tab to initiate a rollback
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recovery Status Tab */}
        <TabsContent value="recovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-saros-primary" />
                Recovery Status
              </CardTitle>
              <CardDescription>
                Monitor position recovery and state restoration metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_RECOVERY_METRICS.map((metric, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{metric.name}</span>
                    <Badge className={
                      metric.status === 'recovered' ? 'bg-green-100 text-green-800' :
                      metric.status === 'recovering' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {metric.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Before</div>
                      <div className="font-semibold">{metric.before.toLocaleString()}{metric.unit}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Current</div>
                      <div className="font-semibold text-blue-600">{metric.current.toLocaleString()}{metric.unit}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Target</div>
                      <div className="font-semibold text-green-600">{metric.target.toLocaleString()}{metric.unit}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Recovery Progress</span>
                      <span>
                        {Math.round((Math.abs(metric.current - metric.before) / Math.abs(metric.target - metric.before)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          metric.status === 'recovered' ? 'bg-green-500' :
                          metric.status === 'recovering' ? 'bg-blue-500' : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(Math.round((Math.abs(metric.current - metric.before) / Math.abs(metric.target - metric.before)) * 100), 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Overall Recovery Status */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Overall Recovery Progress</div>
                    <div className="text-sm text-muted-foreground">Estimated time remaining: 3 minutes</div>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">65%</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-3">
                  <div className="h-3 rounded-full bg-blue-600 transition-all" style={{ width: '65%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Controls Tab */}
        <TabsContent value="emergency" className="space-y-4">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Power className="h-5 w-5" />
                Emergency Rollback Controls
              </CardTitle>
              <CardDescription>
                Critical controls for immediate rollback in emergency situations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Emergency Status */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium">System Status</div>
                  <div className="text-xs text-muted-foreground">Operational</div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-medium">Safety Checks</div>
                  <div className="text-xs text-muted-foreground">All Passing</div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                  <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-medium">Last Checkpoint</div>
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
              </div>

              {/* Emergency Actions */}
              <div className="space-y-3">
                <div className="text-sm font-medium">Emergency Actions</div>

                <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">Quick Rollback</div>
                        <div className="text-sm text-muted-foreground">
                          Restore to last valid checkpoint (2 hours ago)
                        </div>
                        <Button className="mt-3" variant="outline">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Quick Rollback
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Power className="h-6 w-6 text-red-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-red-900 dark:text-red-200">Emergency Stop</div>
                        <div className="text-sm text-red-700 dark:text-red-300">
                          Immediately halt all operations and restore to safe state
                        </div>
                        <Button
                          className="mt-3"
                          variant="destructive"
                          onClick={() => setShowEmergency(true)}
                        >
                          <Power className="h-4 w-4 mr-2" />
                          Emergency Stop
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Safety Mechanisms */}
              <div className="space-y-3">
                <div className="text-sm font-medium">Safety Mechanisms</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Auto-Checkpoint</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-xs text-muted-foreground">Every 24 hours</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Pre-Migration Backup</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-xs text-muted-foreground">Enabled</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Transaction Verification</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Rollback Simulation</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-xs text-muted-foreground">Before execution</div>
                  </div>
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
                  Connect Wallet for Checkpoint Management
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  Connect your wallet to create checkpoints and manage rollback operations for your positions
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}