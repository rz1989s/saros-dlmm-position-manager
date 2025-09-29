'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  Shield,
  Brain,
  BarChart3,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react'
import { useWalletIntegration } from '@/hooks/use-wallet-integration'
import {
  advancedPositionCreation,
  POSITION_STRATEGIES,
  getRecommendedStrategy,
  calculateOptimalAllocation,
  type PositionStrategy,
  type PositionCreationParams,
  type PositionProjection,
  type RiskParameters
} from '@/lib/dlmm/position-creation'
import { PublicKey } from '@solana/web3.js'
import { formatCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

interface AdvancedPositionCreationWizardProps {
  isOpen: boolean
  onClose: () => void
  pairAddress?: PublicKey
  onSuccess?: () => void
}

type WizardStep = 'strategy' | 'parameters' | 'risk' | 'preview' | 'execute'

export function AdvancedPositionCreationWizard({
  isOpen,
  onClose,
  pairAddress,
  onSuccess
}: AdvancedPositionCreationWizardProps) {
  const { sendTransaction, publicKey } = useWalletIntegration()

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('strategy')
  const [selectedStrategy, setSelectedStrategy] = useState<PositionStrategy>(POSITION_STRATEGIES.MARKET_MAKING)

  // Position parameters
  const [totalCapital, setTotalCapital] = useState('1000')
  const [tokenXRatio, setTokenXRatio] = useState(50) // 50% default
  const [priceRange, setPriceRange] = useState({
    lower: 140,
    upper: 165,
    centerPrice: 152.45
  })

  // Risk parameters
  const [riskParams, setRiskParams] = useState<RiskParameters>({
    maxPositionSize: 20, // 20% of portfolio
    maxPriceImpact: 2,   // 2% max price impact
    stopLossThreshold: 15, // 15% stop loss
    maxSlippage: 1,      // 1% max slippage
    diversificationLimit: 3 // Max 3 positions in same pair
  })

  // Auto-rebalancing
  const [autoRebalance, setAutoRebalance] = useState({
    enabled: false,
    threshold: 10, // 10% price movement
    frequency: 'daily' as const
  })

  // Position projection
  const [projection, setProjection] = useState<PositionProjection | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Mock user data
  const userPortfolio = 25000 // $25,000 total portfolio
  const existingPositions = 2

  // Calculate position projection
  const calculateProjection = useCallback(async () => {
    if (!publicKey || !pairAddress) return

    setIsCalculating(true)

    try {
      const params: PositionCreationParams = {
        pairAddress,
        userAddress: publicKey,
        strategy: selectedStrategy,
        totalCapital: parseFloat(totalCapital),
        tokenXRatio: tokenXRatio / 100,
        priceRange,
        riskParams,
        autoRebalance
      }

      const result = await advancedPositionCreation.createAdvancedPosition(params)
      if (result.success) {
        setProjection(result.projection)
      }
    } catch (error) {
      console.error('Error calculating projection:', error)
    } finally {
      setIsCalculating(false)
    }
  }, [publicKey, pairAddress, selectedStrategy, totalCapital, tokenXRatio, priceRange, riskParams, autoRebalance])

  // Update projection when parameters change
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateProjection()
    }, 1000)

    return () => clearTimeout(timer)
  }, [calculateProjection])

  // Get recommended strategy
  const recommendedStrategy = useMemo(() => {
    return getRecommendedStrategy(0.25, 'moderate', parseFloat(totalCapital))
  }, [totalCapital])

  // Calculate optimal allocation
  const optimalAllocation = useMemo(() => {
    return calculateOptimalAllocation(selectedStrategy, userPortfolio, existingPositions)
  }, [selectedStrategy, userPortfolio, existingPositions])

  // Execute position creation
  const handleCreatePosition = async () => {
    if (!publicKey || !pairAddress || !projection) return

    setIsCreating(true)

    try {
      const params: PositionCreationParams = {
        pairAddress,
        userAddress: publicKey,
        strategy: selectedStrategy,
        totalCapital: parseFloat(totalCapital),
        tokenXRatio: tokenXRatio / 100,
        priceRange,
        riskParams,
        autoRebalance
      }

      const result = await advancedPositionCreation.createAdvancedPosition(params)

      if (result.success) {
        // Send the transaction
        const signature = await sendTransaction(result.transaction)

        if (signature) {
          console.log('✅ Position created successfully:', signature)
          onSuccess?.()
          onClose()
        }
      } else {
        throw new Error(result.error || 'Position creation failed')
      }
    } catch (error) {
      console.error('❌ Position creation failed:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Wizard navigation
  const steps: WizardStep[] = ['strategy', 'parameters', 'risk', 'preview', 'execute']
  const currentStepIndex = steps.indexOf(currentStep)
  const canGoNext = currentStep !== 'execute'
  const canGoPrevious = currentStepIndex > 0

  const nextStep = () => {
    if (canGoNext) {
      setCurrentStep(steps[currentStepIndex + 1])
    }
  }

  const previousStep = () => {
    if (canGoPrevious) {
      setCurrentStep(steps[currentStepIndex - 1])
    }
  }

  // Risk level colors
  const getRiskColor = (level: PositionStrategy['riskLevel']) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'extreme': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            Advanced Position Creation
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="space-y-6">
          {/* Step 1: Strategy Selection */}
          {currentStep === 'strategy' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Choose Your Strategy</h3>
                <p className="text-muted-foreground">Select a position strategy that matches your goals and risk tolerance</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(POSITION_STRATEGIES).map((strategy) => (
                  <Card
                    key={strategy.type}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      selectedStrategy.type === strategy.type && "ring-2 ring-blue-500"
                    )}
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{strategy.name}</h4>
                          <Badge className={getRiskColor(strategy.riskLevel)}>
                            {strategy.riskLevel}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">{strategy.description}</p>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span>{strategy.expectedAPR.toFixed(1)}% APR</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span>{strategy.capitalEfficiency}% Efficiency</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recommended Strategy */}
              {recommendedStrategy.type !== selectedStrategy.type && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">AI Recommendation</h4>
                        <p className="text-sm text-green-700">
                          Based on your portfolio size and market conditions, we recommend{' '}
                          <strong>{recommendedStrategy.name}</strong> for optimal risk-adjusted returns.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 border-green-300 text-green-700"
                          onClick={() => setSelectedStrategy(recommendedStrategy)}
                        >
                          Use Recommendation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Parameters */}
          {currentStep === 'parameters' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Position Parameters</h3>
                <p className="text-muted-foreground">Configure your position size and liquidity distribution</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Capital Allocation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Capital Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Total Capital (USD)</Label>
                      <Input
                        type="number"
                        value={totalCapital}
                        onChange={(e) => setTotalCapital(e.target.value)}
                        placeholder="1000"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Optimal: {formatCurrency(optimalAllocation)} ({((optimalAllocation / userPortfolio) * 100).toFixed(1)}% of portfolio)
                      </p>
                    </div>

                    <div>
                      <Label>Token X / Token Y Ratio</Label>
                      <div className="mt-2">
                        <Slider
                          value={[tokenXRatio]}
                          onValueChange={([value]) => setTokenXRatio(value)}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>{tokenXRatio}% SOL</span>
                          <span>{100 - tokenXRatio}% USDC</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Price Range */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Price Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Lower Price</Label>
                        <Input
                          type="number"
                          value={priceRange.lower}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, lower: parseFloat(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label>Upper Price</Label>
                        <Input
                          type="number"
                          value={priceRange.upper}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, upper: parseFloat(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Current Price</Label>
                      <div className="text-2xl font-bold text-green-600">
                        ${priceRange.centerPrice}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Range: {(((priceRange.upper - priceRange.lower) / priceRange.centerPrice) * 100).toFixed(1)}% width
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Auto-Rebalancing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Auto-Rebalancing (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={autoRebalance.enabled}
                      onChange={(e) => setAutoRebalance(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="rounded"
                    />
                    <Label>Enable automatic rebalancing</Label>
                  </div>

                  {autoRebalance.enabled && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <Label>Rebalance Threshold ({autoRebalance.threshold}%)</Label>
                        <Slider
                          value={[autoRebalance.threshold]}
                          onValueChange={([value]) => setAutoRebalance(prev => ({ ...prev, threshold: value }))}
                          min={5}
                          max={50}
                          step={5}
                          className="w-full mt-2"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Risk Management */}
          {currentStep === 'risk' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Risk Management</h3>
                <p className="text-muted-foreground">Configure risk parameters to protect your position</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Position Limits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Max Position Size ({riskParams.maxPositionSize}% of portfolio)</Label>
                      <Slider
                        value={[riskParams.maxPositionSize]}
                        onValueChange={([value]) => setRiskParams(prev => ({ ...prev, maxPositionSize: value }))}
                        min={5}
                        max={50}
                        step={5}
                        className="w-full mt-2"
                      />
                    </div>

                    <div>
                      <Label>Max Price Impact ({riskParams.maxPriceImpact}%)</Label>
                      <Slider
                        value={[riskParams.maxPriceImpact]}
                        onValueChange={([value]) => setRiskParams(prev => ({ ...prev, maxPriceImpact: value }))}
                        min={0.5}
                        max={10}
                        step={0.5}
                        className="w-full mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Risk Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Stop Loss Threshold ({riskParams.stopLossThreshold}%)</Label>
                      <Slider
                        value={[riskParams.stopLossThreshold]}
                        onValueChange={([value]) => setRiskParams(prev => ({ ...prev, stopLossThreshold: value }))}
                        min={5}
                        max={50}
                        step={5}
                        className="w-full mt-2"
                      />
                    </div>

                    <div>
                      <Label>Max Slippage ({riskParams.maxSlippage}%)</Label>
                      <Slider
                        value={[riskParams.maxSlippage]}
                        onValueChange={([value]) => setRiskParams(prev => ({ ...prev, maxSlippage: value }))}
                        min={0.1}
                        max={5}
                        step={0.1}
                        className="w-full mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {currentStep === 'preview' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Position Preview</h3>
                <p className="text-muted-foreground">Review your position before creation</p>
              </div>

              {isCalculating ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                  <p className="mt-2 text-muted-foreground">Calculating position projection...</p>
                </div>
              ) : projection ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Position Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Position Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Strategy:</span>
                        <Badge className={getRiskColor(selectedStrategy.riskLevel)}>
                          {selectedStrategy.name}
                        </Badge>
                      </div>

                      <div className="flex justify-between">
                        <span>Total Capital:</span>
                        <span className="font-medium">{formatCurrency(parseFloat(totalCapital))}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>SOL Amount:</span>
                        <span className="font-medium">{projection.capitalRequirement.tokenX.toFixed(4)} SOL</span>
                      </div>

                      <div className="flex justify-between">
                        <span>USDC Amount:</span>
                        <span className="font-medium">{projection.capitalRequirement.tokenY.toFixed(2)} USDC</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Active Bins:</span>
                        <span className="font-medium">{projection.binDistribution.length}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Projections */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Projections
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Estimated APR:</span>
                        <span className="font-medium text-green-600">{projection.estimatedAPR.toFixed(2)}%</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Daily Fees:</span>
                        <span className="font-medium">{formatCurrency(projection.estimatedFees24h)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Monthly Fees:</span>
                        <span className="font-medium">{formatCurrency(projection.estimatedFees30d)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>IL Risk:</span>
                        <span className="font-medium text-orange-600">{(projection.impermanentLossRisk * 100).toFixed(1)}%</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Value at Risk:</span>
                        <span className="font-medium text-red-600">{formatCurrency(projection.riskMetrics.valueAtRisk)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No projection available
                </div>
              )}
            </div>
          )}

          {/* Step 5: Execute */}
          {currentStep === 'execute' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Create Position</h3>
                <p className="text-muted-foreground">Ready to create your advanced position</p>
              </div>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <Sparkles className="h-12 w-12 text-green-600 mx-auto" />
                    <h4 className="text-lg font-semibold text-green-800">All Set!</h4>
                    <p className="text-green-700">
                      Your {selectedStrategy.name} position is ready to be created with{' '}
                      {formatCurrency(parseFloat(totalCapital))} capital.
                    </p>
                    <p className="text-sm text-green-600">
                      Estimated APR: {projection?.estimatedAPR.toFixed(2)}% | Risk Level: {selectedStrategy.riskLevel}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={!canGoPrevious}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>

              {currentStep === 'execute' ? (
                <Button
                  onClick={handleCreatePosition}
                  disabled={!publicKey || isCreating || !projection}
                  className="flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Create Position
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canGoNext}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}