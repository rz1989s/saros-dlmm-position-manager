'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowRight,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  Activity,
  Loader2,
  TrendingUp
} from 'lucide-react'
import { ArbitrageOpportunity } from '@/lib/dlmm/arbitrage'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'

interface ArbitrageExecutionModalProps {
  isOpen: boolean
  onClose: () => void
  opportunity: ArbitrageOpportunity | null
  onExecute: (opportunity: ArbitrageOpportunity, amount: number) => Promise<any>
}

interface ExecutionState {
  status: 'idle' | 'validating' | 'executing' | 'success' | 'error'
  step: string
  progress: number
  error?: string
  results?: any
}

export function ArbitrageExecutionModal({
  isOpen,
  onClose,
  opportunity,
  onExecute
}: ArbitrageExecutionModalProps) {
  const [amount, setAmount] = useState<string>('')
  const [executionState, setExecutionState] = useState<ExecutionState>({
    status: 'idle',
    step: 'Ready',
    progress: 0
  })

  const [executionPlan, setExecutionPlan] = useState<any>(null)
  const [profitabilityAnalysis, setProfitabilityAnalysis] = useState<any>(null)

  // Reset state when modal opens/closes or opportunity changes
  useEffect(() => {
    if (isOpen && opportunity) {
      const suggestedAmount = opportunity.profitability.breakevenAmount * 2
      setAmount(suggestedAmount.toString())
      setExecutionState({
        status: 'idle',
        step: 'Ready',
        progress: 0
      })
      generateExecutionPlan(suggestedAmount)
    }
  }, [isOpen, opportunity])

  const generateExecutionPlan = async (inputAmount: number) => {
    if (!opportunity) return

    // Mock execution plan generation
    const plan = {
      steps: [
        { name: 'Validate Market Conditions', duration: 1000 },
        { name: 'Setup MEV Protection', duration: 2000 },
        { name: 'Execute First Swap', duration: 8000 },
        { name: 'Execute Second Swap', duration: 8000 },
        { name: 'Verify Profit', duration: 1000 }
      ],
      estimatedTime: 20000,
      gasEstimate: 0.015,
      slippageBuffer: 0.005,
      mevProtectionCost: inputAmount * 0.02
    }

    setExecutionPlan(plan)

    // Mock profitability analysis
    const analysis = {
      inputAmount,
      expectedOutput: inputAmount + opportunity.profitability.netProfit,
      grossProfit: opportunity.profitability.grossProfit,
      totalCosts: opportunity.profitability.gasCosts + plan.mevProtectionCost,
      netProfit: opportunity.profitability.netProfit,
      roi: (opportunity.profitability.netProfit / inputAmount) * 100,
      confidence: opportunity.confidence,
      riskScore: (opportunity.risk.liquidityRisk + opportunity.risk.mevRisk + opportunity.risk.competitionRisk) / 3
    }

    setProfitabilityAnalysis(analysis)
  }

  const executeArbitrage = async () => {
    if (!opportunity || !executionPlan) return

    setExecutionState({
      status: 'executing',
      step: 'Initializing execution...',
      progress: 0
    })

    try {
      // Simulate execution steps
      for (let i = 0; i < executionPlan.steps.length; i++) {
        const step = executionPlan.steps[i]

        setExecutionState({
          status: 'executing',
          step: step.name,
          progress: (i / executionPlan.steps.length) * 100
        })

        // Simulate step execution time
        await new Promise(resolve => setTimeout(resolve, step.duration))
      }

      // Execute the actual arbitrage
      const results = await onExecute(opportunity, parseFloat(amount))

      setExecutionState({
        status: 'success',
        step: 'Execution completed successfully',
        progress: 100,
        results
      })

    } catch (error: any) {
      setExecutionState({
        status: 'error',
        step: 'Execution failed',
        progress: 0,
        error: error.message
      })
    }
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      generateExecutionPlan(numValue)
    }
  }

  const handleClose = () => {
    setExecutionState({
      status: 'idle',
      step: 'Ready',
      progress: 0
    })
    onClose()
  }

  if (!opportunity) return null

  const inputAmount = parseFloat(amount) || 0
  const isValidAmount = inputAmount >= opportunity.profitability.breakevenAmount &&
                       inputAmount <= opportunity.profitability.maxProfitableAmount
  const canExecute = isValidAmount && executionState.status === 'idle'

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Execute Arbitrage Opportunity
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Opportunity Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Opportunity Details</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {opportunity.type.replace('_', ' ')}
                  </Badge>
                  <Badge className={
                    opportunity.risk.overallRisk === 'low' ? 'bg-green-100 text-green-800' :
                    opportunity.risk.overallRisk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {opportunity.risk.overallRisk} risk
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(opportunity.profitability.netProfit)}
                  </div>
                  <div className="text-sm text-muted-foreground">Expected Profit</div>
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold">
                    {formatPercentage(opportunity.confidence)}
                  </div>
                  <div className="text-sm text-muted-foreground">Confidence</div>
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold">
                    {opportunity.path.totalDistance}
                  </div>
                  <div className="text-sm text-muted-foreground">Steps</div>
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold">
                    ~{(opportunity.mev.jitterMs / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-muted-foreground">Est. Time</div>
                </div>
              </div>

              {/* Route visualization */}
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  {opportunity.path.route.map((step, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="px-3 py-1 bg-white rounded-full text-sm font-medium">
                        {step.tokenIn.symbol}
                      </div>
                      {index < opportunity.path.route.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amount Input */}
          <Card>
            <CardHeader>
              <CardTitle>Execution Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Input Amount ({opportunity.path.inputToken.symbol})</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder="Enter amount"
                        min={opportunity.profitability.breakevenAmount}
                        max={opportunity.profitability.maxProfitableAmount}
                        step="0.01"
                      />
                    </div>
                    {!isValidAmount && inputAmount > 0 && (
                      <p className="text-sm text-red-600">
                        Amount must be between {formatCurrency(opportunity.profitability.breakevenAmount)} and {formatCurrency(opportunity.profitability.maxProfitableAmount)}
                      </p>
                    )}
                  </div>

                  {profitabilityAnalysis && (
                    <div className="space-y-2">
                      <Label>Expected Results</Label>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Expected Output:</span>
                          <span className="font-medium">{formatCurrency(profitabilityAnalysis.expectedOutput)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Net Profit:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(profitabilityAnalysis.netProfit)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>ROI:</span>
                          <span className="font-medium">
                            {profitabilityAnalysis.roi.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick amount buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Quick amounts:</span>
                  {[0.5, 1, 2, 5].map(multiplier => {
                    const quickAmount = opportunity.profitability.breakevenAmount * multiplier
                    return (
                      <Button
                        key={multiplier}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAmountChange(quickAmount.toString())}
                        disabled={quickAmount > opportunity.profitability.maxProfitableAmount}
                      >
                        {formatCurrency(quickAmount)}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execution Plan */}
          {executionPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Execution Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Execution steps */}
                  <div className="space-y-2">
                    {executionPlan.steps.map((step: any, index: number) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          executionState.status === 'executing' && executionState.step === step.name
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {executionState.status === 'executing' && executionState.step === step.name ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{step.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ~{(step.duration / 1000).toFixed(1)}s
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Execution progress */}
                  {executionState.status === 'executing' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{executionState.step}</span>
                        <span>{executionState.progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${executionState.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Cost breakdown */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Gas Estimate</div>
                        <div className="text-muted-foreground">
                          {formatCurrency(executionPlan.gasEstimate)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">MEV Protection</div>
                        <div className="text-muted-foreground">
                          {formatCurrency(executionPlan.mevProtectionCost)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Slippage Buffer</div>
                        <div className="text-muted-foreground">
                          {formatPercentage(executionPlan.slippageBuffer)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Total Time</div>
                        <div className="text-muted-foreground">
                          ~{(executionPlan.estimatedTime / 1000).toFixed(0)}s
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {executionState.status === 'success' && executionState.results && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Execution Successful
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(executionState.results.actualProfit)}
                    </div>
                    <div className="text-sm text-muted-foreground">Actual Profit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {(executionState.results.executionTime / 1000).toFixed(1)}s
                    </div>
                    <div className="text-sm text-muted-foreground">Execution Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {formatPercentage(executionState.results.slippageEncountered)}
                    </div>
                    <div className="text-sm text-muted-foreground">Slippage</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Protected</span>
                    </div>
                    <div className="text-sm text-muted-foreground">MEV Status</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error state */}
          {executionState.status === 'error' && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Execution Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-red-700">
                  {executionState.error || 'An unexpected error occurred during execution'}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {executionState.status === 'success' ? 'Close' : 'Cancel'}
          </Button>

          {executionState.status === 'idle' && (
            <Button
              onClick={executeArbitrage}
              disabled={!canExecute}
              className="bg-green-600 hover:bg-green-700"
            >
              <Zap className="h-4 w-4 mr-1" />
              Execute Arbitrage
            </Button>
          )}

          {executionState.status === 'error' && (
            <Button
              onClick={executeArbitrage}
              disabled={!canExecute}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Target className="h-4 w-4 mr-1" />
              Retry Execution
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}