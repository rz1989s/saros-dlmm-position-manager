'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  History,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  ExternalLink
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function MigrationHistory() {
  // Historical migrations
  const migrations = [
    {
      id: '1',
      date: '2025-09-28',
      sourcePool: 'SOL/USDC (0.03%)',
      targetPool: 'SOL/USDC (0.25%)',
      amount: '$5,234.50',
      gasCost: '$2.30',
      status: 'success',
      aprImprovement: '+18.5%',
      actualGain: '$967.38',
      projectedGain: '$950.00',
      accuracy: '98.2%'
    },
    {
      id: '2',
      date: '2025-09-25',
      sourcePool: 'RAY/SOL (0.05%)',
      targetPool: 'RAY/SOL (1.00%)',
      amount: '$3,450.00',
      gasCost: '$2.50',
      status: 'success',
      aprImprovement: '+32.1%',
      actualGain: '$1,107.45',
      projectedGain: '$1,100.00',
      accuracy: '99.3%'
    },
    {
      id: '3',
      date: '2025-09-20',
      sourcePool: 'ORCA/USDC (0.03%)',
      targetPool: 'ORCA/USDC (0.05%)',
      amount: '$2,100.00',
      gasCost: '$2.40',
      status: 'success',
      aprImprovement: '+12.3%',
      actualGain: '$258.30',
      projectedGain: '$260.00',
      accuracy: '99.3%'
    },
    {
      id: '4',
      date: '2025-09-15',
      sourcePool: 'SOL/USDT (0.25%)',
      targetPool: 'SOL/USDT (1.00%)',
      amount: '$1,800.00',
      gasCost: '$2.20',
      status: 'rollback',
      aprImprovement: 'N/A',
      actualGain: '-$2.20',
      projectedGain: '$540.00',
      accuracy: 'N/A'
    }
  ]

  // Success rate analytics
  const totalMigrations = migrations.length
  const successfulMigrations = migrations.filter(m => m.status === 'success').length
  const successRate = (successfulMigrations / totalMigrations) * 100

  const totalActualGain = migrations
    .filter(m => m.status === 'success')
    .reduce((sum, m) => sum + parseFloat(m.actualGain.replace(/[$,]/g, '')), 0)

  // Performance over time
  const performanceData = migrations
    .filter(m => m.status === 'success')
    .reverse()
    .map((m, idx) => ({
      migration: `#${idx + 1}`,
      gain: parseFloat(m.actualGain.replace(/[$,]/g, '')),
      projected: parseFloat(m.projectedGain.replace(/[$,]/g, ''))
    }))

  return (
    <div className="space-y-6">
      {/* History Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Migration Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Total Migrations</p>
              <p className="text-3xl font-bold text-blue-600">{totalMigrations}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-green-600">{successRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">{successfulMigrations}/{totalMigrations} successful</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Total Gains</p>
              <p className="text-3xl font-bold text-green-600">
                ${totalActualGain.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">Net profit</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Avg Accuracy</p>
              <p className="text-3xl font-bold text-purple-600">98.9%</p>
              <p className="text-xs text-gray-500 mt-1">Projection accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Actual vs Projected Gains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="migration" />
                <YAxis label={{ value: 'Gain ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="projected" stroke="#3B82F6" strokeWidth={2} name="Projected Gain" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="gain" stroke="#10B981" strokeWidth={2} name="Actual Gain" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Comparison shows high accuracy between projected and actual gains across migrations.</p>
          </div>
        </CardContent>
      </Card>

      {/* Migration List */}
      <Card>
        <CardHeader>
          <CardTitle>Migration History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {migrations.map((migration) => (
              <div
                key={migration.id}
                className={`border rounded-lg p-4 ${
                  migration.status === 'success' ? 'bg-white' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {migration.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : migration.status === 'failed' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-orange-600" />
                      )}
                      <span className="font-medium text-gray-900">
                        {migration.sourcePool} → {migration.targetPool}
                      </span>
                      <Badge
                        variant={migration.status === 'success' ? 'default' : migration.status === 'failed' ? 'destructive' : 'secondary'}
                        className={migration.status === 'success' ? 'bg-green-100 text-green-700' : ''}
                      >
                        {migration.status === 'success' ? 'Success' : migration.status === 'failed' ? 'Failed' : 'Rolled Back'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Date</p>
                        <p className="font-medium">{migration.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-medium">{migration.amount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Gas Cost</p>
                        <p className="font-medium">{migration.gasCost}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">APR Improvement</p>
                        <p className={`font-medium ${migration.status === 'success' ? 'text-green-600' : 'text-gray-600'}`}>
                          {migration.aprImprovement}
                        </p>
                      </div>
                    </div>

                    {migration.status === 'success' && (
                      <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-600 text-xs">Actual Gain</p>
                          <p className="font-bold text-green-600">{migration.actualGain}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-600 text-xs">Projected</p>
                          <p className="font-medium">{migration.projectedGain}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-600 text-xs">Accuracy</p>
                          <p className="font-medium text-purple-600">{migration.accuracy}</p>
                        </div>
                      </div>
                    )}

                    {migration.status === 'rollback' && (
                      <div className="mt-3 bg-red-100 border border-red-200 rounded p-2 text-sm text-red-800">
                        <p><strong>Rollback Reason:</strong> Target pool liquidity dropped below threshold. Position restored to original pool.</p>
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="sm" className="ml-4">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lessons Learned */}
      <Card>
        <CardHeader>
          <CardTitle>Lessons Learned & Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="font-medium text-green-900 mb-1">✓ High Success Rate</p>
              <p className="text-green-800">75% success rate with accurate projections demonstrates robust migration analysis</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="font-medium text-blue-900 mb-1">✓ Prediction Accuracy</p>
              <p className="text-blue-800">98.9% average accuracy between projected and actual gains validates modeling</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="font-medium text-orange-900 mb-1">⚠ Monitor Liquidity</p>
              <p className="text-orange-800">One rollback occurred due to liquidity drop - implement liquidity monitoring</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          Export Full History
        </Button>
        <Button variant="outline" className="flex-1">
          Generate Report
        </Button>
      </div>
    </div>
  )
}
