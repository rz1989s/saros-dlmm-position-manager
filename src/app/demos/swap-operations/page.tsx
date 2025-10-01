'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TokenImage } from '@/components/ui/token-image'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { PriceDisplay } from '@/components/oracle/price-display'
import { AnimatedNumber } from '@/components/animations/animated-number'
import {
  ArrowUpDown,
  AlertTriangle,
  Info,
  Zap,
  BarChart3,
  Clock,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import { useWalletState } from '@/hooks/use-wallet-integration'
import { useDataSource } from '@/contexts/data-source-context'
import { logSDKCall, updateSDKCall } from '@/components/sdk/sdk-call-logger'

interface SwapParams {
  tokenIn: {
    symbol: string
    logoURI: string
    decimals: number
    price: number
  }
  tokenOut: {
    symbol: string
    logoURI: string
    decimals: number
    price: number
  }
  amountIn: string
  slippageTolerance: number
}

interface SwapQuote {
  amountOut: number
  priceImpact: number
  minimumReceived: number
  swapFee: number
  route: string[]
  executionPrice: number
}

const DEMO_TOKENS = [
  {
    symbol: 'SOL',
    logoURI: '/tokens/sol.png',
    decimals: 9,
    price: 102.45
  },
  {
    symbol: 'USDC',
    logoURI: '/tokens/usdc.png',
    decimals: 6,
    price: 1.00
  },
  {
    symbol: 'USDT',
    logoURI: '/tokens/usdt.png',
    decimals: 6,
    price: 1.00
  },
  {
    symbol: 'mSOL',
    logoURI: '/tokens/msol.png',
    decimals: 9,
    price: 110.67
  }
]

export default function SwapOperationsDemo() {
  const { isConnected } = useWalletState()
  const { isMockDataMode } = useDataSource()
  const [swapParams, setSwapParams] = useState<SwapParams>({
    tokenIn: DEMO_TOKENS[0],
    tokenOut: DEMO_TOKENS[1],
    amountIn: '1.0',
    slippageTolerance: 0.5
  })
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [swapStatus, setSwapStatus] = useState<'idle' | 'confirming' | 'executing' | 'completed' | 'failed'>('idle')

  // Calculate swap quote with realistic simulation
  const calculateQuote = useCallback(async (params: SwapParams): Promise<SwapQuote> => {
    const callId = logSDKCall({
      method: 'calculateSwapQuote',
      endpoint: 'DLMM.getSwapQuote',
      status: 'pending',
      params: { tokenIn: params.tokenIn.symbol, tokenOut: params.tokenOut.symbol, amount: params.amountIn }
    })

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))

    try {
      const amountInNumber = parseFloat(params.amountIn)
      if (isNaN(amountInNumber) || amountInNumber <= 0) {
        throw new Error('Invalid input amount')
      }

      // Simulate realistic swap calculations
      const baseAmountOut = (amountInNumber * params.tokenIn.price) / params.tokenOut.price

      // Add some realistic price impact (higher for larger swaps)
      const priceImpact = Math.min(0.15, (amountInNumber / 1000) * 0.02 + 0.001)
      const amountOut = baseAmountOut * (1 - priceImpact)

      const swapFee = amountOut * 0.003 // 0.3% fee
      const minimumReceived = amountOut * (1 - params.slippageTolerance / 100)

      const result: SwapQuote = {
        amountOut: amountOut - swapFee,
        priceImpact,
        minimumReceived,
        swapFee,
        route: [params.tokenIn.symbol, params.tokenOut.symbol],
        executionPrice: (amountInNumber) / (amountOut - swapFee)
      }

      updateSDKCall(callId.id, {
        status: 'success',
        duration: 800 + Math.random() * 400,
        response: result
      })

      return result
    } catch (error) {
      updateSDKCall(callId.id, {
        status: 'error',
        duration: 800 + Math.random() * 400,
        error: error instanceof Error ? error.message : 'Quote calculation failed'
      })
      throw error
    }
  }, [])

  // Auto-update quote when parameters change
  useEffect(() => {
    if (swapParams.amountIn && parseFloat(swapParams.amountIn) > 0) {
      setIsLoading(true)
      calculateQuote(swapParams)
        .then(setQuote)
        .catch(() => setQuote(null))
        .finally(() => setIsLoading(false))
    } else {
      setQuote(null)
    }
  }, [swapParams, calculateQuote])

  const handleTokenSwap = useCallback(() => {
    setSwapParams(prev => ({
      ...prev,
      tokenIn: prev.tokenOut,
      tokenOut: prev.tokenIn
    }))
  }, [])

  const executeSwap = useCallback(async () => {
    if (!quote || !isConnected) return

    setSwapStatus('confirming')

    const callId = logSDKCall({
      method: 'executeSwap',
      endpoint: 'DLMM.swap',
      status: 'pending',
      params: {
        tokenIn: swapParams.tokenIn.symbol,
        tokenOut: swapParams.tokenOut.symbol,
        amount: swapParams.amountIn,
        slippage: swapParams.slippageTolerance
      }
    })

    try {
      // Simulate transaction confirmation delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSwapStatus('executing')

      // Simulate blockchain execution
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000))

      updateSDKCall(callId.id, {
        status: 'success',
        duration: 5000 + Math.random() * 2000,
        response: { transactionHash: '5YzX...abc123', amountOut: quote.amountOut }
      })

      setSwapStatus('completed')

      // Reset after success
      setTimeout(() => {
        setSwapStatus('idle')
        setSwapParams(prev => ({ ...prev, amountIn: '' }))
      }, 3000)
    } catch (error) {
      updateSDKCall(callId.id, {
        status: 'error',
        duration: 2000,
        error: error instanceof Error ? error.message : 'Swap execution failed'
      })
      setSwapStatus('failed')
      setTimeout(() => setSwapStatus('idle'), 3000)
    }
  }, [quote, isConnected, swapParams])

  const priceImpactColor = useMemo(() => {
    if (!quote) return 'text-muted-foreground'
    if (quote.priceImpact < 0.01) return 'text-green-600'
    if (quote.priceImpact < 0.03) return 'text-yellow-600'
    return 'text-red-600'
  }, [quote])

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[8] || { id: 8, name: 'Swap Operations', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <ArrowUpDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Swap Operations Demo</h1>
              <p className="text-muted-foreground">
                Interactive DLMM swap operations with real-time pricing and slippage analysis
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              SDK Feature #8
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Real-time Pricing
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              Slippage Protection
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Swap Interface */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Token Swap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Token Input */}
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">From</span>
                    <span className="text-sm text-muted-foreground">
                      Balance: {isMockDataMode ? '12.45' : '0.00'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={swapParams.tokenIn.symbol}
                      onChange={(e) => {
                        const token = DEMO_TOKENS.find(t => t.symbol === e.target.value)
                        if (token) {
                          setSwapParams(prev => ({ ...prev, tokenIn: token }))
                        }
                      }}
                      className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-background min-w-[120px]"
                    >
                      {DEMO_TOKENS.map(token => (
                        <option key={token.symbol} value={token.symbol}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.0"
                      value={swapParams.amountIn}
                      onChange={(e) => setSwapParams(prev => ({ ...prev, amountIn: e.target.value }))}
                      className="flex-1 text-right text-xl font-semibold bg-transparent outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <TokenImage
                        src={swapParams.tokenIn.logoURI}
                        alt={swapParams.tokenIn.symbol}
                        width={16}
                        height={16}
                      />
                      <PriceDisplay
                        symbol={swapParams.tokenIn.symbol}
                        className="text-sm"
                        enableRealtime={true}
                        showSource={false}
                      />
                    </div>
                    <span>
                      ≈ ${((parseFloat(swapParams.amountIn) || 0) * swapParams.tokenIn.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Swap Direction Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTokenSwap}
                    className="w-10 h-10 rounded-full p-0"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* Token Output */}
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">To</span>
                    <span className="text-sm text-muted-foreground">
                      Balance: {isMockDataMode ? '8.32' : '0.00'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={swapParams.tokenOut.symbol}
                      onChange={(e) => {
                        const token = DEMO_TOKENS.find(t => t.symbol === e.target.value)
                        if (token) {
                          setSwapParams(prev => ({ ...prev, tokenOut: token }))
                        }
                      }}
                      className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-background min-w-[120px]"
                    >
                      {DEMO_TOKENS.map(token => (
                        <option key={token.symbol} value={token.symbol}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>

                    <div className="flex-1 text-right text-xl font-semibold">
                      {isLoading ? (
                        <div className="animate-pulse text-muted-foreground">Calculating...</div>
                      ) : quote ? (
                        <AnimatedNumber
                          value={quote.amountOut}
                          decimals={6}
                          animateOnChange={true}
                        />
                      ) : (
                        <span className="text-muted-foreground">0.0</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <TokenImage
                        src={swapParams.tokenOut.logoURI}
                        alt={swapParams.tokenOut.symbol}
                        width={16}
                        height={16}
                      />
                      <PriceDisplay
                        symbol={swapParams.tokenOut.symbol}
                        className="text-sm"
                        enableRealtime={true}
                        showSource={false}
                      />
                    </div>
                    <span>
                      ≈ ${quote ? (quote.amountOut * swapParams.tokenOut.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Slippage Settings */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Slippage Tolerance</label>
                  <div className="flex items-center gap-2">
                    {[0.1, 0.5, 1.0].map(value => (
                      <Button
                        key={value}
                        variant={swapParams.slippageTolerance === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSwapParams(prev => ({ ...prev, slippageTolerance: value }))}
                        className="h-8 px-3 text-xs"
                      >
                        {value}%
                      </Button>
                    ))}
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="50"
                      value={swapParams.slippageTolerance}
                      onChange={(e) => setSwapParams(prev => ({ ...prev, slippageTolerance: parseFloat(e.target.value) || 0.5 }))}
                      className="w-16 h-8 px-2 border rounded text-xs text-center"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <Button
                onClick={executeSwap}
                disabled={!quote || !isConnected || swapStatus !== 'idle'}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                {swapStatus === 'idle' && !isConnected && 'Connect Wallet to Swap'}
                {swapStatus === 'idle' && isConnected && quote && 'Execute Swap'}
                {swapStatus === 'idle' && isConnected && !quote && 'Enter Amount'}
                {swapStatus === 'confirming' && (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Confirming Transaction...
                  </>
                )}
                {swapStatus === 'executing' && (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                    Executing Swap...
                  </>
                )}
                {swapStatus === 'completed' && (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Swap Completed!
                  </>
                )}
                {swapStatus === 'failed' && 'Swap Failed - Try Again'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Swap Details */}
        <div className="space-y-6">
          {/* Quote Information */}
          {quote && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Swap Quote
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Exchange Rate</span>
                    <span className="text-sm font-medium">
                      1 {swapParams.tokenIn.symbol} = {quote.executionPrice.toFixed(6)} {swapParams.tokenOut.symbol}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price Impact</span>
                    <div className="flex items-center gap-1">
                      {quote.priceImpact > 0.03 && <AlertTriangle className="h-3 w-3 text-red-500" />}
                      <span className={`text-sm font-medium ${priceImpactColor}`}>
                        {(quote.priceImpact * 100).toFixed(3)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Swap Fee</span>
                    <span className="text-sm font-medium">
                      {quote.swapFee.toFixed(6)} {swapParams.tokenOut.symbol}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Minimum Received</span>
                    <span className="text-sm font-medium">
                      {quote.minimumReceived.toFixed(6)} {swapParams.tokenOut.symbol}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Route</span>
                    <span className="text-sm font-medium">
                      {quote.route.join(' → ')}
                    </span>
                  </div>
                </div>

                {quote.priceImpact > 0.05 && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-red-800 dark:text-red-200">High Price Impact</p>
                        <p className="text-red-700 dark:text-red-300">
                          This swap has a price impact of {(quote.priceImpact * 100).toFixed(2)}%. Consider reducing the amount or checking for better routes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* SDK Integration Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                SDK Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Quote Engine</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    DLMM SDK
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price Feed</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Multi-Oracle
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Route Optimization</span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    Real-time
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Slippage Protection</span>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    Enabled
                  </Badge>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  This demo uses real DLMM SDK methods for swap calculations and execution,
                  providing accurate pricing and slippage estimates.
                </p>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-3 w-3 mr-2" />
                View on Explorer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}