'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowDownUp,
  AlertTriangle,
  Zap,
  ArrowDown
} from 'lucide-react'
import { useWalletIntegration } from '@/hooks/use-wallet-integration'
import { swapOperations } from '@/lib/dlmm/swap-operations'
import { PublicKey } from '@solana/web3.js'
import { formatCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

interface SwapModalProps {
  isOpen: boolean
  onClose: () => void
  pairAddress?: PublicKey
  initialTokenIn?: PublicKey
  initialTokenOut?: PublicKey
  onSuccess?: () => void
}

interface TokenInfo {
  address: PublicKey
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  price: number
}

interface SwapQuote {
  expectedAmountOut: bigint
  priceImpact: number
  minimumAmountOut: bigint
  fee: bigint
  success: boolean
  error?: string
}

export function SwapModal({
  isOpen,
  onClose,
  pairAddress,
  initialTokenIn,
  initialTokenOut,
  onSuccess
}: SwapModalProps) {
  const { sendTransaction, publicKey, isSubmitting } = useWalletIntegration()

  // Swap parameters
  const [tokenIn, setTokenIn] = useState<TokenInfo | null>(null)
  const [tokenOut, setTokenOut] = useState<TokenInfo | null>(null)
  const [amountIn, setAmountIn] = useState('')
  const [slippageTolerance, setSlippageTolerance] = useState(0.5)

  // Swap state
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [isQuoting, setIsQuoting] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [validation, setValidation] = useState<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }>({ isValid: false, errors: [], warnings: [] })

  // Mock token data - in a real app, this would come from a token registry
  const mockTokens: TokenInfo[] = useMemo(() => [
    {
      address: new PublicKey('So11111111111111111111111111111111111111112'),
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      price: 152.45
    },
    {
      address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      price: 1.00
    },
    {
      address: new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'),
      symbol: 'RAY',
      name: 'Raydium',
      decimals: 6,
      price: 2.31
    }
  ], [])

  // Initialize tokens from props
  useEffect(() => {
    if (initialTokenIn) {
      const token = mockTokens.find(t => t.address.equals(initialTokenIn))
      if (token) setTokenIn(token)
    }
    if (initialTokenOut) {
      const token = mockTokens.find(t => t.address.equals(initialTokenOut))
      if (token) setTokenOut(token)
    }
  }, [initialTokenIn, initialTokenOut, mockTokens])

  // Get quote when parameters change
  const getQuote = useCallback(async () => {
    if (!tokenIn || !tokenOut || !amountIn || !pairAddress || !publicKey) {
      setQuote(null)
      return
    }

    const amountInBigInt = BigInt(Math.floor(parseFloat(amountIn) * Math.pow(10, tokenIn.decimals)))
    if (amountInBigInt <= 0) {
      setQuote(null)
      return
    }

    setIsQuoting(true)

    try {
      const result = await swapOperations.simulateSwap({
        pairAddress,
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        amountIn: amountInBigInt,
        slippageTolerance
      })

      setQuote(result)

      // Also validate the swap
      const validationResult = await swapOperations.validateSwap({
        pairAddress,
        userAddress: publicKey,
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        amountIn: amountInBigInt,
        slippageTolerance
      })

      setValidation(validationResult)

    } catch (error) {
      console.error('Error getting swap quote:', error)
      setQuote({
        expectedAmountOut: BigInt(0),
        priceImpact: 0,
        minimumAmountOut: BigInt(0),
        fee: BigInt(0),
        success: false,
        error: 'Failed to get quote'
      })
    } finally {
      setIsQuoting(false)
    }
  }, [tokenIn, tokenOut, amountIn, pairAddress, publicKey, slippageTolerance])

  // Debounced quote update
  useEffect(() => {
    const timer = setTimeout(() => {
      getQuote()
    }, 500)

    return () => clearTimeout(timer)
  }, [getQuote])

  // Handle token swap (flip input/output)
  const handleSwapTokens = () => {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setAmountIn('')
    setQuote(null)
  }

  // Execute the swap
  const handleExecuteSwap = async () => {
    if (!tokenIn || !tokenOut || !amountIn || !pairAddress || !publicKey || !quote?.success) {
      return
    }

    setIsExecuting(true)

    try {
      const amountInBigInt = BigInt(Math.floor(parseFloat(amountIn) * Math.pow(10, tokenIn.decimals)))

      const swapResult = await swapOperations.executeSwap({
        pairAddress,
        userAddress: publicKey,
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        amountIn: amountInBigInt,
        minimumAmountOut: quote.minimumAmountOut,
        slippageTolerance
      })

      if (!swapResult.success) {
        throw new Error(swapResult.error || 'Swap execution failed')
      }

      // Send the transaction
      const signature = await sendTransaction(swapResult.transaction)

      if (signature) {
        console.log('✅ Swap executed successfully:', signature)
        onSuccess?.()
        onClose()
      }

    } catch (error) {
      console.error('❌ Swap execution failed:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  // Format amount for display
  const formatAmount = (amount: bigint, decimals: number): string => {
    return swapOperations.formatSwapAmount(amount, decimals)
  }

  // Calculate USD values
  const inputValueUSD = tokenIn && amountIn ? parseFloat(amountIn) * tokenIn.price : 0
  const outputValueUSD = tokenOut && quote ?
    parseFloat(formatAmount(quote.expectedAmountOut, tokenOut.decimals)) * tokenOut.price : 0

  // Get price impact severity
  const priceImpactSeverity = quote ?
    swapOperations.getPriceImpactSeverity(quote.priceImpact) : 'low'

  const canExecuteSwap = !!(
    tokenIn &&
    tokenOut &&
    amountIn &&
    quote?.success &&
    validation.isValid &&
    publicKey &&
    !isSubmitting &&
    !isExecuting
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownUp className="h-5 w-5" />
            Swap Tokens
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Token Input */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label>From</Label>
                <span className="text-sm text-muted-foreground">
                  Balance: 0.00 {tokenIn?.symbol}
                </span>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    className="text-lg"
                  />
                  {inputValueUSD > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ≈ {formatCurrency(inputValueUSD)}
                    </p>
                  )}
                </div>

                <Button variant="outline" className="px-3">
                  {tokenIn ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tokenIn.symbol}</span>
                    </div>
                  ) : (
                    'Select'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Swap Direction Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapTokens}
              className="rounded-full"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Token Output */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label>To</Label>
                <span className="text-sm text-muted-foreground">
                  Balance: 0.00 {tokenOut?.symbol}
                </span>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="h-12 flex items-center px-3 border rounded-md bg-muted/50">
                    {isQuoting ? (
                      <span className="text-muted-foreground">Getting quote...</span>
                    ) : quote?.success ? (
                      <span className="text-lg">
                        {formatAmount(quote.expectedAmountOut, tokenOut?.decimals || 9)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0.00</span>
                    )}
                  </div>
                  {outputValueUSD > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ≈ {formatCurrency(outputValueUSD)}
                    </p>
                  )}
                </div>

                <Button variant="outline" className="px-3">
                  {tokenOut ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tokenOut.symbol}</span>
                    </div>
                  ) : (
                    'Select'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Swap Details */}
          {quote?.success && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price Impact</span>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant={priceImpactSeverity === 'low' ? 'default' :
                              priceImpactSeverity === 'medium' ? 'secondary' :
                              priceImpactSeverity === 'high' ? 'destructive' : 'destructive'}
                      className={cn(
                        priceImpactSeverity === 'critical' && 'animate-pulse'
                      )}
                    >
                      {quote.priceImpact.toFixed(2)}%
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Minimum Received</span>
                  <span className="text-sm">
                    {formatAmount(quote.minimumAmountOut, tokenOut?.decimals || 9)} {tokenOut?.symbol}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Trading Fee</span>
                  <span className="text-sm">
                    {formatAmount(quote.fee, tokenIn?.decimals || 9)} {tokenIn?.symbol}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Slippage Tolerance</span>
                  <span className="text-sm">{slippageTolerance}%</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Warnings */}
          {validation.warnings.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <p key={index} className="text-sm text-yellow-800">{warning}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Errors */}
          {validation.errors.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="space-y-1">
                    {validation.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-800">{error}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleExecuteSwap}
              disabled={!canExecuteSwap}
              className="flex-1 gap-2"
            >
              {isExecuting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Swapping...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Swap Tokens
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}