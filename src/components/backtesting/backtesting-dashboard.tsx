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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Play, Square, TrendingUp, TrendingDown, Activity, Target, Zap, Calendar } from 'lucide-react'
import { useAdvancedBacktesting } from '@/hooks/use-advanced-dlmm'
import type { BacktestConfig, BacktestResult } from '@/lib/types'

export function BacktestingDashboard() {
  const {
    runBacktest,
    getBacktestResult,
    cancelBacktest,
    getBacktestHistory,
    activeBacktests,
    loading,
    error,
    isEnabled
  } = useAdvancedBacktesting()

  const [configForm, setConfigForm] = useState<Partial<BacktestConfig>>({
    name: '',
    strategy: 'rebalance',
    timeframe: { start: new Date(), end: new Date() },
    initialCapital: 10000,
    riskManagement: {
      maxDrawdown: 0.2,
      positionSize: 0.1,
      stopLoss: 0.05,
      takeProfitMultiplier: 2
    },
    rebalanceFrequency: 'daily'
  })
  const [selectedBacktest, setSelectedBacktest] = useState<string | null>(null)
  const [backtestHistory, setBacktestHistory] = useState<BacktestResult[]>([])

  useEffect(() => {
    if (isEnabled) {
      setBacktestHistory(getBacktestHistory())
    }
  }, [isEnabled, getBacktestHistory])

  const handleStartBacktest = async () => {
    if (!configForm.name || !configForm.strategy) return

    try {
      const config: BacktestConfig = {
        name: configForm.name,
        strategy: configForm.strategy as any,
        timeframe: configForm.timeframe!,
        initialCapital: configForm.initialCapital || 10000,
        riskManagement: configForm.riskManagement!,
        rebalanceFrequency: configForm.rebalanceFrequency as any,
        parameters: {
          binStep: 25,
          feeTier: 0.0025,
          slippageTolerance: 0.01,
          maxGasPrice: 0.1
        }
      }

      const backtestId = await runBacktest(config)
      setSelectedBacktest(backtestId)
    } catch (err: any) {
      console.error('Failed to start backtest:', err)
    }
  }

  const handleCancelBacktest = (backtestId: string) => {
    cancelBacktest(backtestId)
    if (selectedBacktest === backtestId) {
      setSelectedBacktest(null)
    }
  }

  const selectedResult = selectedBacktest ? getBacktestResult(selectedBacktest) : null

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
                    value={configForm.strategy}
                    onValueChange={(value) => setConfigForm(prev => ({ ...prev, strategy: value as any }))}
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
                    value={configForm.initialCapital || ''}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, initialCapital: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rebalance-freq">Rebalance Frequency</Label>
                  <Select
                    value={configForm.rebalanceFrequency}
                    onValueChange={(value) => setConfigForm(prev => ({ ...prev, rebalanceFrequency: value as any }))}
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
                    <Label htmlFor="max-drawdown">Max Drawdown (%)</Label>
                    <Input
                      id="max-drawdown"
                      type="number"
                      placeholder="20"
                      value={(configForm.riskManagement?.maxDrawdown || 0) * 100}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        riskManagement: {
                          ...prev.riskManagement!,
                          maxDrawdown: Number(e.target.value) / 100
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position-size">Position Size (%)</Label>
                    <Input
                      id="position-size"
                      type="number"
                      placeholder="10"
                      value={(configForm.riskManagement?.positionSize || 0) * 100}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        riskManagement: {
                          ...prev.riskManagement!,
                          positionSize: Number(e.target.value) / 100
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStartBacktest}
                disabled={loading || !configForm.name || !configForm.strategy}
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
                  key={backtest.id}
                  backtest={backtest}
                  onCancel={() => handleCancelBacktest(backtest.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {backtestHistory.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No backtest history available. Run some backtests to see historical results.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {backtestHistory.map((backtest) => (
                <BacktestHistoryCard key={backtest.id} backtest={backtest} />
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
    running: 'bg-blue-500',
    completed: 'bg-green-500',
    error: 'bg-red-500',
    cancelled: 'bg-gray-500'
  }[backtest.status]

  const statusIcon = {
    running: Activity,
    completed: TrendingUp,
    error: TrendingDown,
    cancelled: Square
  }[backtest.status]

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
            <p className="text-sm text-muted-foreground">{backtest.currentOperation}</p>
          </div>
        )}

        {backtest.status === 'completed' && backtest.results && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {((backtest.results.totalReturn - 1) * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">Total Return</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {backtest.results.sharpeRatio.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {(backtest.results.maxDrawdown * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">Max Drawdown</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {backtest.results.winRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Win Rate</div>
              </div>
            </div>

            {backtest.results.equityCurve && backtest.results.equityCurve.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Equity Curve</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={backtest.results.equityCurve}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="equity"
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
            <p>Backtest failed: {backtest.error}</p>
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
            {backtest.endTime?.toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {backtest.results && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Return</div>
              <div className={`text-lg font-bold ${backtest.results.totalReturn > 1 ? 'text-green-600' : 'text-red-600'}`}>
                {((backtest.results.totalReturn - 1) * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="font-medium">Sharpe</div>
              <div className="text-lg font-bold">
                {backtest.results.sharpeRatio.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="font-medium">Max DD</div>
              <div className="text-lg font-bold text-red-600">
                {(backtest.results.maxDrawdown * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="font-medium">Win Rate</div>
              <div className="text-lg font-bold">
                {backtest.results.winRate.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}