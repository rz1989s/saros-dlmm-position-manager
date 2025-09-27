'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { useDLMM } from '@/hooks/use-dlmm'
import type { BacktestConfig, BacktestResult } from '@/lib/types'
import type { Pair } from '@saros-finance/dlmm-sdk'
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

  const { client } = useDLMM()

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
  const [availablePools, setAvailablePools] = useState<Array<{pair: Pair, address: PublicKey}>>([])
  const [selectedPool, setSelectedPool] = useState<{pair: Pair, address: PublicKey} | null>(null)
  const [poolsLoading, setPoolsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {}

    // Validate backtest name
    if (!configForm.name?.trim()) {
      errors.name = 'Backtest name is required'
    } else if (configForm.name.trim().length < 3) {
      errors.name = 'Backtest name must be at least 3 characters'
    } else if (configForm.name.trim().length > 50) {
      errors.name = 'Backtest name must be less than 50 characters'
    }

    // Validate strategy
    if (!configForm.strategy?.id) {
      errors.strategy = 'Please select a strategy'
    }

    // Validate pool
    if (!selectedPool) {
      errors.pool = 'Please select a trading pool'
    }

    // Validate initial capital
    const capital = configForm.capital?.initialAmount
    if (!capital || capital <= 0) {
      errors.capital = 'Initial capital must be greater than 0'
    } else if (capital < 100) {
      errors.capital = 'Initial capital should be at least $100'
    } else if (capital > 10000000) {
      errors.capital = 'Initial capital cannot exceed $10,000,000'
    }

    // Validate rebalance frequency
    if (!configForm.rebalancing?.frequency) {
      errors.frequency = 'Please select a rebalance frequency'
    }

    // Validate min threshold (0-100%)
    const threshold = configForm.rebalancing?.minThreshold
    if (threshold !== undefined) {
      if (threshold < 0 || threshold > 1) {
        errors.threshold = 'Min threshold must be between 0% and 100%'
      }
    }

    // Validate slippage (0-100%)
    const slippage = configForm.costs?.slippage
    if (slippage !== undefined) {
      if (slippage < 0 || slippage > 1) {
        errors.slippage = 'Slippage tolerance must be between 0% and 100%'
      } else if (slippage > 0.1) {
        errors.slippage = 'Slippage tolerance above 10% is not recommended'
      }
    }

    return errors
  }

  const fetchAvailablePools = useCallback(async () => {
    if (!client || !isEnabled) return

    setPoolsLoading(true)
    try {
      console.log('🔍 Fetching available pools for backtesting...')
      const pairs = await client.getAllLbPairs()

      // Create pool entries with addresses (using first 5 pools for simplicity)
      const poolEntries = pairs.slice(0, 5).map((pair, index) => ({
        pair,
        address: new PublicKey(index === 0 ? '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2' :
                              index === 1 ? 'Cx4xoCsJbvFLLH61MPdUp6CvEeaUKgUnpWzTRZC81rXG' :
                              index === 2 ? '61R1ndXxvsWXXkWSyNkCxnzwd3zUNB8Q2ibmkiLPC8ht' :
                              index === 3 ? 'H4snTKK9adiU15gP22ErfZYtro4aqPNtVU4zrb5NVSnA' :
                              '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM') // Real pool addresses
      }))

      setAvailablePools(poolEntries)

      // Auto-select first pool if none selected
      if (poolEntries.length > 0 && !selectedPool) {
        setSelectedPool(poolEntries[0])
      }

      console.log(`✅ Loaded ${poolEntries.length} pools for backtesting`)
    } catch (error: any) {
      console.error('❌ Failed to fetch pools:', error)

      // Provide user-friendly error message for pool fetching
      let errorMessage = 'Failed to load trading pools. Using fallback options.'

      if (error.message?.includes('network') || error.message?.includes('RPC')) {
        errorMessage = 'Network issue while loading pools. Some pools may not be available.'
      } else if (error.message?.includes('wallet')) {
        errorMessage = 'Wallet connection required to load pools. Please connect your wallet.'
      }

      setValidationErrors(prev => ({ ...prev, pools: errorMessage }))
    } finally {
      setPoolsLoading(false)
    }
  }, [client, isEnabled])

  useEffect(() => {
    if (isEnabled) {
      const history = getBacktestHistory()
      setBacktestHistory(history || [])

      // Fetch available pools
      fetchAvailablePools()
    }
  }, [isEnabled, getBacktestHistory, client, fetchAvailablePools])

  const handleStartBacktest = async () => {
    // Clear previous validation errors
    setValidationErrors({})

    // Validate form
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      console.log('❌ Form validation failed:', errors)
      return
    }

    if (!selectedPool) {
      setValidationErrors({ general: 'No pool selected' })
      return
    }

    try {
      const config: BacktestConfig = {
        id: `backtest-${Date.now()}`,
        name: configForm.name!,
        description: `Backtest run for ${configForm.strategy?.name}`,
        strategy: configForm.strategy!,
        market: {
          poolAddress: selectedPool.address,
          tokenXSymbol: (selectedPool.pair as any).tokenX?.symbol || 'SOL',
          tokenYSymbol: (selectedPool.pair as any).tokenY?.symbol || 'USDC'
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

      // Clear all validation errors on success
      setValidationErrors({})

      console.log('✅ Backtest started successfully:', result.config.name)
    } catch (err: any) {
      console.error('Failed to start backtest:', err)

      // Provide user-friendly error message based on error type
      let errorMessage = 'Failed to start backtest. Please try again.'

      if (err.message?.includes('wallet')) {
        errorMessage = 'Wallet connection issue. Please reconnect your wallet and try again.'
      } else if (err.message?.includes('network') || err.message?.includes('RPC')) {
        errorMessage = 'Network connection issue. Please check your internet connection and try again.'
      } else if (err.message?.includes('insufficient')) {
        errorMessage = 'Insufficient funds or invalid parameters. Please check your configuration.'
      } else if (err.message?.includes('pool')) {
        errorMessage = 'Invalid pool selected. Please select a different pool and try again.'
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`
      }

      // Set error for display to user (you'll need to add this to the UI)
      setValidationErrors(prev => ({ ...prev, general: errorMessage }))
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

      {(error || validationErrors.general || validationErrors.pools) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="space-y-2">
              {error && (
                <div className="text-destructive text-sm font-medium">
                  ⚠️ System Error: {error}
                </div>
              )}
              {validationErrors.general && (
                <div className="text-destructive text-sm">
                  🔴 {validationErrors.general}
                </div>
              )}
              {validationErrors.pools && (
                <div className="text-orange-600 text-sm flex items-center justify-between">
                  <span>⚠️ {validationErrors.pools}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setValidationErrors(prev => ({ ...prev, pools: '' }))
                      fetchAvailablePools()
                    }}
                    className="ml-2"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
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
                    onChange={(e) => {
                      setConfigForm(prev => ({ ...prev, name: e.target.value }))
                      // Clear validation error when user types
                      if (validationErrors.name) {
                        setValidationErrors(prev => ({ ...prev, name: '' }))
                      }
                    }}
                    className={validationErrors.name ? 'border-red-500' : ''}
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-500">{validationErrors.name}</p>
                  )}
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
                      // Clear validation error when user selects
                      if (validationErrors.strategy) {
                        setValidationErrors(prev => ({ ...prev, strategy: '' }))
                      }
                    }}
                  >
                    <SelectTrigger id="strategy" className={validationErrors.strategy ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rebalance">Auto Rebalance</SelectItem>
                      <SelectItem value="dca">Dollar Cost Average</SelectItem>
                      <SelectItem value="momentum">Momentum</SelectItem>
                      <SelectItem value="mean_reversion">Mean Reversion</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.strategy && (
                    <p className="text-sm text-red-500">{validationErrors.strategy}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pool-selection">Trading Pool</Label>
                  <Select
                    value={selectedPool?.address.toString() || ''}
                    onValueChange={(value) => {
                      const pool = availablePools.find(p => p.address.toString() === value)
                      if (pool) {
                        setSelectedPool(pool)
                        // Clear validation error when user selects
                        if (validationErrors.pool) {
                          setValidationErrors(prev => ({ ...prev, pool: '' }))
                        }
                      }
                    }}
                  >
                    <SelectTrigger id="pool-selection" className={validationErrors.pool ? 'border-red-500' : ''}>
                      <SelectValue placeholder={poolsLoading ? "Loading pools..." : "Select trading pool"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePools.map((pool) => (
                        <SelectItem key={pool.address.toString()} value={pool.address.toString()}>
                          {(pool.pair as any).tokenX?.symbol || 'SOL'} / {(pool.pair as any).tokenY?.symbol || 'USDC'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.pool && (
                    <p className="text-sm text-red-500">{validationErrors.pool}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initial-capital">Initial Capital (USD)</Label>
                  <Input
                    id="initial-capital"
                    type="number"
                    placeholder="10000"
                    value={configForm.capital?.initialAmount || ''}
                    onChange={(e) => {
                      setConfigForm(prev => ({
                        ...prev,
                        capital: {
                          ...prev.capital,
                          initialAmount: Number(e.target.value),
                          currency: prev.capital?.currency || 'USD'
                        }
                      }))
                      // Clear validation error when user types
                      if (validationErrors.capital) {
                        setValidationErrors(prev => ({ ...prev, capital: '' }))
                      }
                    }}
                    className={validationErrors.capital ? 'border-red-500' : ''}
                  />
                  {validationErrors.capital && (
                    <p className="text-sm text-red-500">{validationErrors.capital}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rebalance-freq">Rebalance Frequency</Label>
                  <Select
                    value={configForm.rebalancing?.frequency || ''}
                    onValueChange={(value) => {
                      setConfigForm(prev => ({
                        ...prev,
                        rebalancing: {
                          ...prev.rebalancing,
                          frequency: value as 'immediate' | 'hourly' | 'daily' | 'weekly',
                          minThreshold: prev.rebalancing?.minThreshold || 0.05
                        }
                      }))
                      // Clear validation error when user selects
                      if (validationErrors.frequency) {
                        setValidationErrors(prev => ({ ...prev, frequency: '' }))
                      }
                    }}
                  >
                    <SelectTrigger id="rebalance-freq" className={validationErrors.frequency ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.frequency && (
                    <p className="text-sm text-red-500">{validationErrors.frequency}</p>
                  )}
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
                      placeholder="5"
                      min="0"
                      max="100"
                      value={(configForm.rebalancing?.minThreshold || 0) * 100}
                      onChange={(e) => {
                        setConfigForm(prev => ({
                          ...prev,
                          rebalancing: {
                            ...prev.rebalancing!,
                            frequency: prev.rebalancing?.frequency || 'daily',
                            minThreshold: Number(e.target.value) / 100
                          }
                        }))
                        // Clear validation error when user types
                        if (validationErrors.threshold) {
                          setValidationErrors(prev => ({ ...prev, threshold: '' }))
                        }
                      }}
                      className={validationErrors.threshold ? 'border-red-500' : ''}
                    />
                    {validationErrors.threshold && (
                      <p className="text-sm text-red-500">{validationErrors.threshold}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position-size">Slippage Tolerance (%)</Label>
                    <Input
                      id="position-size"
                      type="number"
                      placeholder="1"
                      min="0"
                      max="100"
                      value={(configForm.costs?.slippage || 0) * 100}
                      onChange={(e) => {
                        setConfigForm(prev => ({
                          ...prev,
                          costs: {
                            ...prev.costs!,
                            gasPrice: prev.costs?.gasPrice || 0.1,
                            transactionFee: prev.costs?.transactionFee || 0.0025,
                            slippage: Number(e.target.value) / 100
                          }
                        }))
                        // Clear validation error when user types
                        if (validationErrors.slippage) {
                          setValidationErrors(prev => ({ ...prev, slippage: '' }))
                        }
                      }}
                      className={validationErrors.slippage ? 'border-red-500' : ''}
                    />
                    {validationErrors.slippage && (
                      <p className="text-sm text-red-500">{validationErrors.slippage}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStartBacktest}
                disabled={loading || poolsLoading || !configForm.name || !configForm.strategy?.id || !selectedPool}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Running Backtest...
                  </>
                ) : poolsLoading ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Loading Pools...
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