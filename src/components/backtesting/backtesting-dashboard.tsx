'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Play, Square, TrendingUp, TrendingDown, Activity, Target, Calendar, Clock } from 'lucide-react'
import { useAdvancedBacktesting } from '@/hooks/use-advanced-dlmm'
import type { BacktestConfig, BacktestResult } from '@/lib/types'
import { PublicKey } from '@solana/web3.js'

export function BacktestingDashboard() {
  const {
    runBacktest,
    cancelBacktest,
    getBacktestHistory,
    activeBacktests,
    loading,
    error,
    isEnabled
  } = useAdvancedBacktesting()

  const [configForm, setConfigForm] = useState<Partial<BacktestConfig>>({
    name: '',
    strategy: {
      id: 'rebalance',
      name: 'Auto Rebalance',
      parameters: {}
    },
    timeframe: {
      startDate: new Date(),
      endDate: new Date(),
      interval: '1h' as const
    },
    capital: {
      initialAmount: 10000,
      currency: 'USD' as const
    },
    costs: {
      gasPrice: 0.1,
      slippage: 0.01,
      transactionFee: 0.0025
    },
    rebalancing: {
      frequency: 'daily' as const,
      minThreshold: 0.05
    }
  })
  const [_selectedBacktest, _setSelectedBacktest] = useState<BacktestResult | null>(null)
  const [backtestHistory, setBacktestHistory] = useState<BacktestResult[]>([])

  useEffect(() => {
    if (isEnabled) {
      const history = getBacktestHistory()
      setBacktestHistory(history || [])
    }
  }, [isEnabled, getBacktestHistory])

  const handleStartBacktest = async () => {
    if (!configForm.name || !configForm.strategy) return

    try {
      const config: BacktestConfig = {
        id: `backtest-${Date.now()}`,
        name: configForm.name!,
        description: `Backtest run for ${configForm.strategy?.name}`,
        strategy: configForm.strategy!,
        market: {
          poolAddress: new PublicKey('11111111111111111111111111111112'), // placeholder
          tokenXSymbol: 'SOL',
          tokenYSymbol: 'USDC'
        },
        timeframe: configForm.timeframe!,
        capital: configForm.capital!,
        costs: configForm.costs!,
        rebalancing: configForm.rebalancing!,
        riskManagement: {
          maxDrawdown: 0.2,
          stopLoss: 0.05,
          takeProfit: 0.1
        }
      }

      const result = await runBacktest(config)
      _setSelectedBacktest(result)
    } catch (err: any) {
      console.error('Failed to start backtest:', err)
    }
  }

  const handleCancelBacktest = () => {
    cancelBacktest()
    _setSelectedBacktest(null)
  }


  if (!isEnabled) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Please connect your wallet to access backtesting features
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Backtesting</h2>
          <p className="text-muted-foreground">Test your DLMM strategies against historical data</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          100% SDK Integration
        </Badge>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive text-sm">{error}</div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="configure" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Backtest Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backtest-name">Backtest Name</Label>
                  <Input
                    id="backtest-name"
                    placeholder="My Strategy Test"
                    value={configForm.name || ''}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strategy">Strategy Type</Label>
                  <Select
                    value={configForm.strategy?.id || ''}
                    onValueChange={(value) => {
                      const strategyMap = {
                        'rebalance': { id: 'rebalance', name: 'Auto Rebalance', parameters: {} },
                        'dca': { id: 'dca', name: 'Dollar Cost Average', parameters: {} },
                        'momentum': { id: 'momentum', name: 'Momentum', parameters: {} },
                        'mean_reversion': { id: 'mean_reversion', name: 'Mean Reversion', parameters: {} }
                      }
                      setConfigForm(prev => ({ ...prev, strategy: strategyMap[value as keyof typeof strategyMap] }))
                    }}
                  >
                    <SelectTrigger id="strategy">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rebalance">Auto Rebalance</SelectItem>
                      <SelectItem value="dca">Dollar Cost Average</SelectItem>
                      <SelectItem value="momentum">Momentum</SelectItem>
                      <SelectItem value="mean_reversion">Mean Reversion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initial-capital">Initial Capital (USD)</Label>
                  <Input
                    id="initial-capital"
                    type="number"
                    placeholder="10000"
                    value={configForm.capital?.initialAmount || ''}
                    onChange={(e) => setConfigForm(prev => ({
                      ...prev,
                      capital: {
                        ...prev.capital,
                        initialAmount: Number(e.target.value),
                        currency: prev.capital?.currency || 'USD'
                      }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rebalance-freq">Rebalance Frequency</Label>
                  <Select
                    value={configForm.rebalancing?.frequency || ''}
                    onValueChange={(value) => setConfigForm(prev => ({
                      ...prev,
                      rebalancing: {
                        ...prev.rebalancing,
                        frequency: value as 'immediate' | 'hourly' | 'daily' | 'weekly',
                        minThreshold: prev.rebalancing?.minThreshold || 0.05
                      }
                    }))}
                  >
                    <SelectTrigger id="rebalance-freq">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Risk Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-drawdown">Min Rebalance Threshold (%)</Label>
                    <Input
                      id="max-drawdown"
                      type="number"
                      placeholder="20"
                      value={(configForm.rebalancing?.minThreshold || 0) * 100}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        rebalancing: {
                          ...prev.rebalancing!,
                          frequency: prev.rebalancing?.frequency || 'daily',
                          minThreshold: Number(e.target.value) / 100
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position-size">Slippage Tolerance (%)</Label>
                    <Input
                      id="position-size"
                      type="number"
                      placeholder="10"
                      value={(configForm.costs?.slippage || 0) * 100}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        costs: {
                          ...prev.costs!,
                          gasPrice: prev.costs?.gasPrice || 0.1,
                          transactionFee: prev.costs?.transactionFee || 0.0025,
                          slippage: Number(e.target.value) / 100
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStartBacktest}
                disabled={loading || !configForm.name || !configForm.strategy?.id}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Running Backtest...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Backtest
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {activeBacktests.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No active backtests. Configure and start a backtest to see results.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeBacktests.map((backtest) => (
                <BacktestResultCard
                  key={backtest.config.id}
                  backtest={backtest}
                  onCancel={() => handleCancelBacktest()}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {!backtestHistory || backtestHistory.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No backtest history available. Run some backtests to see historical results.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {(backtestHistory || []).map((backtest) => (
                <BacktestHistoryCard key={backtest.config.id} backtest={backtest} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BacktestResultCard({ backtest, onCancel }: { backtest: BacktestResult; onCancel: () => void }) {
  const statusColor = {
    pending: 'bg-yellow-500',
    running: 'bg-blue-500',
    completed: 'bg-green-500',
    error: 'bg-red-500'
  }[backtest.status] || 'bg-gray-500'

  const statusIcon = {
    pending: Clock,
    running: Activity,
    completed: TrendingUp,
    error: TrendingDown
  }[backtest.status] || Square

  const StatusIcon = statusIcon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${backtest.status === 'running' ? 'animate-pulse' : ''}`} />
            {backtest.config.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`${statusColor} text-white`}>
              {backtest.status}
            </Badge>
            {backtest.status === 'running' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {backtest.status === 'running' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{backtest.progress}%</span>
            </div>
            <Progress value={backtest.progress} />
            <p className="text-sm text-muted-foreground">Processing backtest...</p>
          </div>
        )}

        {backtest.status === 'completed' && backtest.metrics && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {((backtest.metrics.totalReturn - 1) * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">Total Return</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {backtest.metrics.sharpeRatio.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {(backtest.metrics.maxDrawdown * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">Max Drawdown</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {backtest.metrics.winRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Win Rate</div>
              </div>
            </div>

            {backtest.timeSeriesData && backtest.timeSeriesData.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Equity Curve</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={backtest.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="portfolioValue"
                        stroke="#2563eb"
                        fill="#2563eb"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {backtest.status === 'error' && (
          <div className="text-red-600 text-sm">
            <p>Backtest failed: {backtest.error?.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BacktestHistoryCard({ backtest }: { backtest: BacktestResult }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {backtest.config.name}
          </CardTitle>
          <Badge variant="outline">
            {backtest.completedAt?.toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {backtest.metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Return</div>
              <div className={`text-lg font-bold ${backtest.metrics.totalReturn > 1 ? 'text-green-600' : 'text-red-600'}`}>
                {((backtest.metrics.totalReturn - 1) * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="font-medium">Sharpe</div>
              <div className="text-lg font-bold">
                {backtest.metrics.sharpeRatio.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="font-medium">Max DD</div>
              <div className="text-lg font-bold text-red-600">
                {(backtest.metrics.maxDrawdown * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="font-medium">Win Rate</div>
              <div className="text-lg font-bold">
                {backtest.metrics.winRate.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}