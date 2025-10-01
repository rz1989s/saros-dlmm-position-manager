'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TokenImage } from '@/components/ui/token-image'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { AnimatedNumber } from '@/components/animations/animated-number'
import {
  Plus,
  BarChart3,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { useWalletState } from '@/hooks/use-wallet-integration'
import { logSDKCall, updateSDKCall } from '@/components/sdk/sdk-call-logger'

interface LiquidityStrategy {
  id: string
  name: string
  description: string
  distribution: 'uniform' | 'concentrated' | 'normal' | 'custom'
  riskLevel: 'low' | 'medium' | 'high'
  expectedAPR: number
}

interface BinRange {
  activeBin: number
  minBin: number
  maxBin: number
  binWidth: number
}

interface PositionParams {
  poolPair: string
  tokenX: {
    symbol: string
    logoURI: string
    amount: string
    price: number
  }
  tokenY: {
    symbol: string
    logoURI: string
    amount: string
    price: number
  }
  strategy: LiquidityStrategy
  binRange: BinRange
  feeTier: number
}

const LIQUIDITY_STRATEGIES: LiquidityStrategy[] = [
  {
    id: 'conservative',
    name: 'Conservative Range',
    description: 'Wide range with uniform distribution for stable returns',
    distribution: 'uniform',
    riskLevel: 'low',
    expectedAPR: 8.5
  },
  {
    id: 'concentrated',
    name: 'Concentrated Liquidity',
    description: 'Narrow range around current price for higher capital efficiency',
    distribution: 'concentrated',
    riskLevel: 'medium',
    expectedAPR: 15.2
  },
  {
    id: 'normal',
    name: 'Normal Distribution',
    description: 'Bell curve distribution centered on current price',
    distribution: 'normal',
    riskLevel: 'medium',
    expectedAPR: 12.8
  },
  {
    id: 'custom',
    name: 'Custom Strategy',
    description: 'Define your own bin range and distribution pattern',
    distribution: 'custom',
    riskLevel: 'high',
    expectedAPR: 18.7
  }
]

const DEMO_POOLS = [
  {
    pair: 'SOL/USDC',
    tokenX: { symbol: 'SOL', logoURI: '/tokens/sol.png', price: 102.45 },
    tokenY: { symbol: 'USDC', logoURI: '/tokens/usdc.png', price: 1.00 },
    currentBin: 8432,
    feeTier: 0.003
  },
  {
    pair: 'mSOL/SOL',
    tokenX: { symbol: 'mSOL', logoURI: '/tokens/msol.png', price: 110.67 },
    tokenY: { symbol: 'SOL', logoURI: '/tokens/sol.png', price: 102.45 },
    currentBin: 7891,
    feeTier: 0.0025
  }
]

export default function PositionCreationDemo() {
  const { isConnected } = useWalletState()
  const [currentStep, setCurrentStep] = useState(0)
  const [positionParams, setPositionParams] = useState<PositionParams>({
    poolPair: DEMO_POOLS[0].pair,
    tokenX: { ...DEMO_POOLS[0].tokenX, amount: '10.0' },
    tokenY: { ...DEMO_POOLS[0].tokenY, amount: '1000.0' },
    strategy: LIQUIDITY_STRATEGIES[0],
    binRange: {
      activeBin: DEMO_POOLS[0].currentBin,
      minBin: DEMO_POOLS[0].currentBin - 50,
      maxBin: DEMO_POOLS[0].currentBin + 50,
      binWidth: 100
    },
    feeTier: DEMO_POOLS[0].feeTier
  })
  const [isCreating, setIsCreating] = useState(false)
  const [creationStatus, setCreationStatus] = useState<'idle' | 'creating' | 'completed' | 'failed'>('idle')

  const steps = [
    { title: 'Select Pool', description: 'Choose trading pair and fee tier' },
    { title: 'Set Strategy', description: 'Define liquidity distribution strategy' },
    { title: 'Configure Range', description: 'Set bin range and parameters' },
    { title: 'Add Liquidity', description: 'Specify token amounts' },
    { title: 'Review & Create', description: 'Confirm and create position' }
  ]


  // Calculate estimated returns and analytics
  const analytics = useMemo(() => {
    const totalValue = (parseFloat(positionParams.tokenX.amount) || 0) * positionParams.tokenX.price +
                      (parseFloat(positionParams.tokenY.amount) || 0) * positionParams.tokenY.price

    const estimatedDailyFees = totalValue * (positionParams.strategy.expectedAPR / 100 / 365)
    const impermanentLossRisk = positionParams.strategy.riskLevel === 'high' ? 0.15 :
                               positionParams.strategy.riskLevel === 'medium' ? 0.08 : 0.03

    return {
      totalValue,
      estimatedDailyFees,
      estimatedMonthlyFees: estimatedDailyFees * 30,
      impermanentLossRisk,
      capitalEfficiency: positionParams.binRange.binWidth < 50 ? 'High' :
                        positionParams.binRange.binWidth < 100 ? 'Medium' : 'Low'
    }
  }, [positionParams])

  const createPosition = useCallback(async () => {
    setIsCreating(true)
    setCreationStatus('creating')

    const callId = logSDKCall({
      method: 'createPosition',
      endpoint: 'DLMM.addLiquidity',
      status: 'pending',
      params: {
        pool: positionParams.poolPair,
        tokenXAmount: positionParams.tokenX.amount,
        tokenYAmount: positionParams.tokenY.amount,
        strategy: positionParams.strategy.id,
        binRange: positionParams.binRange
      }
    })

    try {
      // Simulate position creation process
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000))

      updateSDKCall(callId.id, {
        status: 'success',
        duration: 3000 + Math.random() * 2000,
        response: {
          positionId: 'pos_' + Date.now(),
          transactionHash: '7XmN...def456',
          binIds: Array.from({length: positionParams.binRange.binWidth}, (_, i) => positionParams.binRange.minBin + i)
        }
      })

      setCreationStatus('completed')
    } catch (error) {
      updateSDKCall(callId.id, {
        status: 'error',
        duration: 3000,
        error: error instanceof Error ? error.message : 'Position creation failed'
      })
      setCreationStatus('failed')
    } finally {
      setIsCreating(false)
    }
  }, [positionParams])

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, steps.length])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Trading Pair</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEMO_POOLS.map((pool) => (
                  <Card
                    key={pool.pair}
                    className={`cursor-pointer transition-all ${
                      positionParams.poolPair === pool.pair
                        ? 'ring-2 ring-saros-primary border-saros-primary'
                        : 'hover:border-muted-foreground'
                    }`}
                    onClick={() => setPositionParams(prev => ({
                      ...prev,
                      poolPair: pool.pair,
                      tokenX: { ...pool.tokenX, amount: prev.tokenX.amount },
                      tokenY: { ...pool.tokenY, amount: prev.tokenY.amount },
                      binRange: { ...prev.binRange, activeBin: pool.currentBin },
                      feeTier: pool.feeTier
                    }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex -space-x-2">
                          <TokenImage
                            src={pool.tokenX.logoURI}
                            alt={pool.tokenX.symbol}
                            width={32}
                            height={32}
                            className="border-2 border-background"
                          />
                          <TokenImage
                            src={pool.tokenY.logoURI}
                            alt={pool.tokenY.symbol}
                            width={32}
                            height={32}
                            className="border-2 border-background"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">{pool.pair}</h4>
                          <p className="text-sm text-muted-foreground">Fee: {(pool.feeTier * 100).toFixed(2)}%</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">{pool.tokenX.symbol}:</span>
                          <span className="ml-1 font-medium">${pool.tokenX.price.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{pool.tokenY.symbol}:</span>
                          <span className="ml-1 font-medium">${pool.tokenY.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose Liquidity Strategy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LIQUIDITY_STRATEGIES.map((strategy) => (
                  <Card
                    key={strategy.id}
                    className={`cursor-pointer transition-all ${
                      positionParams.strategy.id === strategy.id
                        ? 'ring-2 ring-saros-primary border-saros-primary'
                        : 'hover:border-muted-foreground'
                    }`}
                    onClick={() => setPositionParams(prev => ({ ...prev, strategy }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{strategy.name}</h4>
                        <Badge
                          variant="outline"
                          className={
                            strategy.riskLevel === 'low' ? 'bg-green-50 text-green-700' :
                            strategy.riskLevel === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-700'
                          }
                        >
                          {strategy.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Expected APR:</span>
                        <span className="font-semibold text-saros-primary">{strategy.expectedAPR}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Configure Bin Range</h3>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Min Bin</label>
                      <input
                        type="number"
                        value={positionParams.binRange.minBin}
                        onChange={(e) => setPositionParams(prev => ({
                          ...prev,
                          binRange: {
                            ...prev.binRange,
                            minBin: parseInt(e.target.value) || prev.binRange.minBin,
                            binWidth: Math.max(1, (prev.binRange.maxBin - (parseInt(e.target.value) || prev.binRange.minBin)))
                          }
                        }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Active Bin</label>
                      <input
                        type="number"
                        value={positionParams.binRange.activeBin}
                        onChange={(e) => setPositionParams(prev => ({
                          ...prev,
                          binRange: { ...prev.binRange, activeBin: parseInt(e.target.value) || prev.binRange.activeBin }
                        }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Max Bin</label>
                      <input
                        type="number"
                        value={positionParams.binRange.maxBin}
                        onChange={(e) => setPositionParams(prev => ({
                          ...prev,
                          binRange: {
                            ...prev.binRange,
                            maxBin: parseInt(e.target.value) || prev.binRange.maxBin,
                            binWidth: Math.max(1, ((parseInt(e.target.value) || prev.binRange.maxBin) - prev.binRange.minBin))
                          }
                        }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Bin Width:</span>
                      <span className="font-medium">{positionParams.binRange.binWidth} bins</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Capital Efficiency:</span>
                      <span className="font-medium">{analytics.capitalEfficiency}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Add Liquidity Amounts</h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <TokenImage
                        src={positionParams.tokenX.logoURI}
                        alt={positionParams.tokenX.symbol}
                        width={24}
                        height={24}
                      />
                      <span className="font-medium">{positionParams.tokenX.symbol}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        step="0.001"
                        placeholder="0.0"
                        value={positionParams.tokenX.amount}
                        onChange={(e) => setPositionParams(prev => ({
                          ...prev,
                          tokenX: { ...prev.tokenX, amount: e.target.value }
                        }))}
                        className="flex-1 text-lg font-semibold border rounded-lg px-3 py-2"
                      />
                      <span className="text-sm text-muted-foreground">
                        ≈ ${((parseFloat(positionParams.tokenX.amount) || 0) * positionParams.tokenX.price).toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <TokenImage
                        src={positionParams.tokenY.logoURI}
                        alt={positionParams.tokenY.symbol}
                        width={24}
                        height={24}
                      />
                      <span className="font-medium">{positionParams.tokenY.symbol}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        step="0.001"
                        placeholder="0.0"
                        value={positionParams.tokenY.amount}
                        onChange={(e) => setPositionParams(prev => ({
                          ...prev,
                          tokenY: { ...prev.tokenY, amount: e.target.value }
                        }))}
                        className="flex-1 text-lg font-semibold border rounded-lg px-3 py-2"
                      />
                      <span className="text-sm text-muted-foreground">
                        ≈ ${((parseFloat(positionParams.tokenY.amount) || 0) * positionParams.tokenY.price).toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Review Position</h3>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Position Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pool:</span>
                      <span className="font-medium">{positionParams.poolPair}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Strategy:</span>
                      <span className="font-medium">{positionParams.strategy.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Value:</span>
                      <span className="font-medium">${analytics.totalValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected APR:</span>
                      <span className="font-medium text-saros-primary">{positionParams.strategy.expectedAPR}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Fees:</span>
                      <span className="font-medium">${analytics.estimatedDailyFees.toFixed(4)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={createPosition}
                  disabled={!isConnected || isCreating || creationStatus === 'completed'}
                  className="w-full h-12 text-lg font-semibold"
                  size="lg"
                >
                  {!isConnected && 'Connect Wallet to Create Position'}
                  {isConnected && creationStatus === 'idle' && 'Create Position'}
                  {creationStatus === 'creating' && (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-pulse" />
                      Creating Position...
                    </>
                  )}
                  {creationStatus === 'completed' && (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Position Created!
                    </>
                  )}
                  {creationStatus === 'failed' && 'Creation Failed - Try Again'}
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[3] || { id: 3, name: 'Advanced Position Creation', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Advanced Position Creation</h1>
              <p className="text-muted-foreground">
                Comprehensive position creation wizard with strategy selection and optimization
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              SDK Features #3, #4, #5
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Strategy Wizard
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              Bin Configuration
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Progress Steps */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Creation Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all ${
                    index === currentStep
                      ? 'border-saros-primary bg-saros-primary/5'
                      : index < currentStep
                      ? 'border-green-200 bg-green-50'
                      : 'border-muted bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === currentStep
                          ? 'bg-saros-primary text-white'
                          : index < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-saros-primary" />
                {steps[currentStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              {currentStep < 4 && (
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button onClick={nextStep}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analytics Panel */}
          {currentStep >= 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Position Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-saros-primary">
                      <AnimatedNumber
                        value={analytics.totalValue}
                        prefix="$"
                        decimals={2}
                        animateOnChange={true}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">Total Value</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {positionParams.strategy.expectedAPR.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Expected APR</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      <AnimatedNumber
                        value={analytics.estimatedDailyFees}
                        prefix="$"
                        decimals={4}
                        animateOnChange={true}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">Daily Fees</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {analytics.capitalEfficiency}
                    </div>
                    <div className="text-xs text-muted-foreground">Efficiency</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}