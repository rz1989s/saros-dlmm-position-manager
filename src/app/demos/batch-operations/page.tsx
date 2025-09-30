'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, Layers, RotateCcw, BarChart3, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'

interface BatchOperation {
  id: string
  type: 'add_liquidity' | 'remove_liquidity' | 'claim_fees' | 'rebalance'
  positions: string[]
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  startTime?: string
  endTime?: string
  savings: number
}

interface Transaction {
  id: string
  operation: string
  position: string
  status: 'pending' | 'confirmed' | 'failed'
  signature?: string
  cost: number
  timestamp: string
}

interface PerformanceMetric {
  metric: string
  individual: number
  batched: number
  improvement: number
  unit: string
}

interface RollbackCheckpoint {
  id: string
  timestamp: string
  operations: number
  status: 'available' | 'active' | 'expired'
  canRestore: boolean
}

export default function BatchOperationsDemo() {
  const [selectedBatch, setSelectedBatch] = useState<string>('BATCH-001')

  const batchOperations: BatchOperation[] = [
    {
      id: 'BATCH-001',
      type: 'claim_fees',
      positions: ['SOL/USDC', 'BONK/SOL', 'RAY/USDC', 'JTO/SOL'],
      status: 'completed',
      progress: 100,
      startTime: '10:30 AM',
      endTime: '10:32 AM',
      savings: 245.80,
    },
    {
      id: 'BATCH-002',
      type: 'rebalance',
      positions: ['SOL/USDC', 'BONK/SOL'],
      status: 'processing',
      progress: 65,
      startTime: '10:35 AM',
      savings: 128.50,
    },
    {
      id: 'BATCH-003',
      type: 'add_liquidity',
      positions: ['RAY/USDC', 'JTO/SOL', 'ORCA/USDC'],
      status: 'queued',
      progress: 0,
      savings: 185.20,
    },
  ]

  const transactions: Transaction[] = [
    {
      id: 'TX-001',
      operation: 'Claim Fees',
      position: 'SOL/USDC',
      status: 'confirmed',
      signature: '5J7x...8K9m',
      cost: 0.00042,
      timestamp: '10:30:15',
    },
    {
      id: 'TX-002',
      operation: 'Claim Fees',
      position: 'BONK/SOL',
      status: 'confirmed',
      signature: '3H8y...7L2n',
      cost: 0.00038,
      timestamp: '10:30:45',
    },
    {
      id: 'TX-003',
      operation: 'Claim Fees',
      position: 'RAY/USDC',
      status: 'confirmed',
      signature: '9K4z...6M1p',
      cost: 0.00035,
      timestamp: '10:31:20',
    },
    {
      id: 'TX-004',
      operation: 'Claim Fees',
      position: 'JTO/SOL',
      status: 'confirmed',
      signature: '2L5w...4N8q',
      cost: 0.00040,
      timestamp: '10:31:55',
    },
  ]

  const performanceMetrics: PerformanceMetric[] = [
    { metric: 'Transaction Cost', individual: 1850, batched: 1385, improvement: 25.1, unit: 'SOL' },
    { metric: 'Execution Time', individual: 180, batched: 120, improvement: 33.3, unit: 'seconds' },
    { metric: 'Network Requests', individual: 24, batched: 8, improvement: 66.7, unit: 'requests' },
    { metric: 'Gas Consumption', individual: 450000, batched: 285000, improvement: 36.7, unit: 'compute units' },
    { metric: 'Success Rate', individual: 92.5, batched: 98.2, improvement: 6.2, unit: '%' },
  ]

  const rollbackCheckpoints: RollbackCheckpoint[] = [
    { id: 'CP-001', timestamp: '10:29 AM', operations: 0, status: 'available', canRestore: true },
    { id: 'CP-002', timestamp: '10:33 AM', operations: 4, status: 'available', canRestore: true },
    { id: 'CP-003', timestamp: '10:36 AM', operations: 2, status: 'active', canRestore: false },
  ]

  const totalSavings = batchOperations.reduce((sum, batch) => sum + batch.savings, 0)
  const completedBatches = batchOperations.filter((b) => b.status === 'completed').length
  const activeBatches = batchOperations.filter((b) => b.status === 'processing').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'text-green-600'
      case 'processing':
      case 'pending':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      case 'queued':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'default'
      case 'processing':
      case 'pending':
        return 'secondary'
      case 'failed':
        return 'destructive'
      case 'queued':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'add_liquidity':
        return '+'
      case 'remove_liquidity':
        return '-'
      case 'claim_fees':
        return '$'
      case 'rebalance':
        return '⚖'
      default:
        return '?'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8" />
            Batch Operations Engine
          </h1>
          <p className="text-muted-foreground mt-2">
            Transaction optimization, rollback mechanisms, and performance tracking
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #33
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From batch optimization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBatches}</div>
            <p className="text-xs text-muted-foreground">Successfully executed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{activeBatches}</div>
            <p className="text-xs text-muted-foreground">Currently processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Efficiency Gain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">33.3%</div>
            <p className="text-xs text-muted-foreground">Average improvement</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="batches" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="batches">
            <Layers className="h-4 w-4 mr-2" />
            Batches
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="rollback">
            <RotateCcw className="h-4 w-4 mr-2" />
            Rollback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Batch Operations</CardTitle>
                  <CardDescription>Optimized transaction batching for multiple operations</CardDescription>
                </div>
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Create Batch
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {batchOperations.map((batch) => (
                  <div
                    key={batch.id}
                    className={`border rounded-lg p-4 space-y-3 cursor-pointer transition-all ${
                      selectedBatch === batch.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedBatch(batch.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                          {getTypeIcon(batch.type)}
                        </div>
                        <div>
                          <div className="font-semibold capitalize">{batch.type.replace('_', ' ')}</div>
                          <div className="text-sm text-muted-foreground">
                            {batch.positions.length} positions
                          </div>
                        </div>
                      </div>
                      <Badge variant={getStatusBadge(batch.status)} className={getStatusColor(batch.status)}>
                        {batch.status.toUpperCase()}
                      </Badge>
                    </div>

                    {batch.status !== 'queued' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{batch.progress}%</span>
                        </div>
                        <div className="bg-secondary rounded-full h-2">
                          <div
                            className={`rounded-full h-2 transition-all ${
                              batch.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${batch.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Positions</div>
                        <div className="font-medium">{batch.positions.length}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Savings</div>
                        <div className="font-medium text-green-600">${batch.savings.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Duration</div>
                        <div className="font-medium">
                          {batch.startTime && batch.endTime
                            ? '2 min'
                            : batch.startTime
                            ? 'In progress'
                            : 'Pending'}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="text-muted-foreground mb-2">Included positions:</div>
                      <div className="flex flex-wrap gap-2">
                        {batch.positions.map((pos, idx) => (
                          <Badge key={idx} variant="secondary">
                            {pos}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Log</CardTitle>
              <CardDescription>Individual transactions within batch operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{tx.operation}</div>
                        <div className="text-sm text-muted-foreground">{tx.position}</div>
                      </div>
                      <Badge variant={getStatusBadge(tx.status)} className={getStatusColor(tx.status)}>
                        {tx.status === 'confirmed' ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : tx.status === 'failed' ? (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {tx.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Signature</div>
                        <div className="font-mono font-medium">{tx.signature || 'Pending...'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Cost</div>
                        <div className="font-medium">{tx.cost.toFixed(5)} SOL</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Timestamp</div>
                        <div className="font-medium">{tx.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
              <CardDescription>Batch operations vs individual transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{metric.metric}</div>
                      <Badge variant="outline" className="text-green-600">
                        {metric.improvement.toFixed(1)}% improvement
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Individual</div>
                        <div className="text-xl font-bold text-red-600">
                          {metric.individual.toLocaleString()} <span className="text-sm font-normal">{metric.unit}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Batched</div>
                        <div className="text-xl font-bold text-green-600">
                          {metric.batched.toLocaleString()} <span className="text-sm font-normal">{metric.unit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Efficiency Gain</span>
                        <span className="font-medium text-green-600">{metric.improvement.toFixed(1)}%</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2"
                          style={{ width: `${metric.improvement}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rollback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rollback Checkpoints</CardTitle>
              <CardDescription>Recovery points for batch operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rollbackCheckpoints.map((checkpoint) => (
                  <div key={checkpoint.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Checkpoint {checkpoint.id}</div>
                        <div className="text-sm text-muted-foreground">{checkpoint.timestamp}</div>
                      </div>
                      <Badge
                        variant={
                          checkpoint.status === 'active'
                            ? 'default'
                            : checkpoint.status === 'available'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {checkpoint.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Operations</div>
                        <div className="font-medium">{checkpoint.operations} completed</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Can Restore</div>
                        <div className={`font-medium ${checkpoint.canRestore ? 'text-green-600' : 'text-red-600'}`}>
                          {checkpoint.canRestore ? 'Yes' : 'No (Active)'}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={!checkpoint.canRestore}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore to this checkpoint
                    </Button>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Rollback checkpoints are created automatically before each batch operation. You can restore to any
                    available checkpoint to undo changes.
                  </div>
                  <Button className="w-full" variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Create Manual Checkpoint
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}