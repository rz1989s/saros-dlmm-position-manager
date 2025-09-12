'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Info,
  Settings,
  Target,
  DollarSign,
  Clock
} from 'lucide-react'
import { PublicKey } from '@solana/web3.js'
import { useWalletIntegration } from '@/hooks/use-wallet-integration'
import { dlmmOperations } from '@/lib/dlmm/operations'
import { DLMMPosition } from '@/lib/types'
import { formatCurrency, formatPercentage, formatDuration } from '@/lib/utils/format'

interface RebalanceModalProps {
  isOpen: boolean
  onClose: () => void
  position?: DLMMPosition
  currentPrice?: number
  onSuccess?: () => void
}

export function RebalanceModal({
  isOpen,
  onClose,
  position,
  currentPrice = 152.45,
  onSuccess
}: RebalanceModalProps) {
  const { sendTransaction, publicKey, isSubmitting } = useWalletIntegration()
  
  // Rebalance parameters
  const [newCenterBin, setNewCenterBin] = useState(0)
  const [newRange, setNewRange] = useState(10)
  const [maxSlippage, setMaxSlippage] = useState(0.5)
  const [strategy, setStrategy] = useState<'conservative' | 'aggressive' | 'optimal'>('optimal')
  
  // Analysis state
  const [analysis, setAnalysis] = useState<{
    estimatedFeeIncrease: number
    estimatedCost: number
    timeToBreakeven: number
    recommendation: 'recommended' | 'not_recommended' | 'neutral'
  } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  // Update center bin when position changes
  useEffect(() => {
    if (position) {
      setNewCenterBin(position.activeBin)
    }
  }, [position])

  // Analyze rebalance impact whenever parameters change
  useEffect(() => {
    if (position && publicKey) {
      analyzeRebalance()
    }
  }, [newCenterBin, newRange, maxSlippage, position, publicKey])

  const analyzeRebalance = async () => {
    if (!position || !publicKey) return

    setIsAnalyzing(true)
    try {
      const result = await dlmmOperations.estimateRebalanceProfit(
        position.poolAddress,
        publicKey,
        newCenterBin,
        newRange
      )
      setAnalysis(result)
    } catch (error) {
      console.error('Error analyzing rebalance:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExecuteRebalance = async () => {
    if (!position || !publicKey || !analysis) return

    setIsExecuting(true)
    try {
      const transactions = await dlmmOperations.rebalancePosition({
        poolAddress: position.poolAddress,
        userAddress: publicKey,
        newCenterBin,
        newRange,
        maxSlippage,
      })

      // Execute transactions sequentially
      for (const tx of transactions) {
        const result = await sendTransaction(tx)
        if (!result.success) {
          throw new Error(result.error || 'Transaction failed')
        }
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error executing rebalance:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  const getStrategyConfig = (strategyType: typeof strategy) => {
    switch (strategyType) {
      case 'conservative':
        return {
          name: 'Conservative',
          description: 'Wide range, minimal rebalancing frequency',
          range: 20,
          slippage: 0.3,
          color: 'text-blue-600',
        }
      case 'aggressive':
        return {
          name: 'Aggressive',
          description: 'Narrow range, maximum fee capture',
          range: 5,
          slippage: 1.0,
          color: 'text-red-600',
        }
      case 'optimal':
        return {
          name: 'Optimal',
          description: 'Balanced approach for best risk-reward',
          range: 10,
          slippage: 0.5,
          color: 'text-green-600',
        }
    }
  }

  const applyStrategy = (strategyType: typeof strategy) => {
    const config = getStrategyConfig(strategyType)
    setStrategy(strategyType)
    setNewRange(config.range)
    setMaxSlippage(config.slippage)
  }

  const currentBinPrice = currentPrice
  const newBinPrice = currentBinPrice * (1 + (newCenterBin - (position?.activeBin || 0)) * 0.001)
  const priceRange = {
    min: newBinPrice * (1 - newRange * 0.01),
    max: newBinPrice * (1 + newRange * 0.01)
  }

  if (!position) return null

  const poolName = `${position.tokenX.symbol}/${position.tokenY.symbol}`

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Rebalance Position - {poolName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Position Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Current Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Active Bin</div>
                  <div className="font-semibold">{position.activeBin}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Current Price</div>
                  <div className="font-semibold">{formatCurrency(currentPrice)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Position Value</div>
                  <div className="font-semibold">{formatCurrency(12500)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Current APR</div>
                  <div className="font-semibold text-green-600">12.47%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Rebalancing Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {(['conservative', 'optimal', 'aggressive'] as const).map((strategyType) => {
                  const config = getStrategyConfig(strategyType)
                  return (
                    <Button
                      key={strategyType}
                      variant={strategy === strategyType ? "default" : "outline"}
                      className={`h-auto p-4 flex-col items-start ${
                        strategy === strategyType ? 'bg-saros-primary' : ''
                      }`}
                      onClick={() => applyStrategy(strategyType)}
                    >
                      <div className={`font-medium ${config.color}`}>
                        {config.name}
                      </div>
                      <div className="text-xs opacity-80 text-left">
                        {config.description}
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Manual Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manual Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">New Center Bin</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={newCenterBin}
                      onChange={(e) => setNewCenterBin(parseInt(e.target.value))}
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewCenterBin(position.activeBin)}
                    >
                      Reset
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Target price: {formatCurrency(newBinPrice)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Price Range (±%)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={newRange}
                      onChange={(e) => setNewRange(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{newRange}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(priceRange.min)} - {formatCurrency(priceRange.max)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Max Slippage (%)</label>
                  <input
                    type="number"
                    value={maxSlippage}
                    onChange={(e) => setMaxSlippage(parseFloat(e.target.value))}
                    step="0.1"
                    min="0.1"
                    max="10"
                    className="w-full px-3 py-2 border rounded-md mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Analysis */}
          {analysis && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Impact Analysis
                  {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-saros-primary" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                      {analysis.estimatedFeeIncrease >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={analysis.estimatedFeeIncrease >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {analysis.estimatedFeeIncrease >= 0 ? '+' : ''}{analysis.estimatedFeeIncrease.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">APR Change</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(analysis.estimatedCost)}
                    </div>
                    <div className="text-xs text-muted-foreground">Rebalance Cost</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                      <Clock className="h-4 w-4" />
                      {analysis.timeToBreakeven === Infinity ? '∞' : `${Math.floor(analysis.timeToBreakeven)}d`}
                    </div>
                    <div className="text-xs text-muted-foreground">Break-even Time</div>
                  </div>

                  <div className="text-center">
                    <Badge
                      variant={
                        analysis.recommendation === 'recommended' ? 'default' :
                        analysis.recommendation === 'not_recommended' ? 'destructive' : 'secondary'
                      }
                      className="text-sm px-3 py-1"
                    >
                      {analysis.recommendation === 'recommended' && 'Recommended'}
                      {analysis.recommendation === 'not_recommended' && 'Not Recommended'}
                      {analysis.recommendation === 'neutral' && 'Neutral'}
                    </Badge>
                  </div>
                </div>

                {/* Recommendation Details */}
                <div className={`p-4 rounded-lg border ${
                  analysis.recommendation === 'recommended' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : analysis.recommendation === 'not_recommended'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}>
                  <div className="flex items-start gap-2">
                    {analysis.recommendation === 'recommended' ? (
                      <Info className="h-4 w-4 text-green-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                    )}
                    <div className="text-sm">
                      {analysis.recommendation === 'recommended' && (
                        <div>
                          <div className="font-medium text-green-800 dark:text-green-200">
                            Rebalancing is recommended
                          </div>
                          <div className="text-green-700 dark:text-green-300 mt-1">
                            The expected APR increase of {analysis.estimatedFeeIncrease.toFixed(2)}% will cover the rebalancing costs in {Math.floor(analysis.timeToBreakeven)} days.
                          </div>
                        </div>
                      )}
                      {analysis.recommendation === 'not_recommended' && (
                        <div>
                          <div className="font-medium text-red-800 dark:text-red-200">
                            Rebalancing is not recommended
                          </div>
                          <div className="text-red-700 dark:text-red-300 mt-1">
                            The rebalancing costs outweigh the expected benefits. Consider waiting for better market conditions.
                          </div>
                        </div>
                      )}
                      {analysis.recommendation === 'neutral' && (
                        <div>
                          <div className="font-medium text-yellow-800 dark:text-yellow-200">
                            Neutral recommendation
                          </div>
                          <div className="text-yellow-700 dark:text-yellow-300 mt-1">
                            The benefits are marginal. Consider your risk tolerance and market outlook.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isExecuting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleExecuteRebalance}
              disabled={!analysis || isExecuting || isSubmitting}
            >
              {isExecuting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Executing Rebalance...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Execute Rebalance
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}