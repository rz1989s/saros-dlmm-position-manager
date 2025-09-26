'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Target,
  Clock,
  AlertTriangle,
  Info,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'
import { PublicKey } from '@solana/web3.js'
import { useWalletIntegration } from '@/hooks/use-wallet-integration'
import { dlmmOperations, LimitOrderParams } from '@/lib/dlmm/operations'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/format'

interface LimitOrderModalProps {
  isOpen: boolean
  onClose: () => void
  poolAddress?: PublicKey
  tokenX?: {
    symbol: string
    decimals: number
    balance: number
    price: number
  }
  tokenY?: {
    symbol: string
    decimals: number
    balance: number
    price: number
  }
  currentPrice?: number
  onSuccess?: () => void
}

export function LimitOrderModal({
  isOpen,
  onClose,
  poolAddress,
  tokenX = { symbol: 'SOL', decimals: 9, balance: 10.5, price: 152.45 },
  tokenY = { symbol: 'USDC', decimals: 6, balance: 1500.0, price: 1.0 },
  currentPrice = 152.45,
  onSuccess
}: LimitOrderModalProps) {
  const { sendTransaction, publicKey, isSubmitting } = useWalletIntegration()
  
  // Order parameters
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [expiryHours, setExpiryHours] = useState('24')
  const [useExpiry, setUseExpiry] = useState(false)
  
  // Order analysis
  const [priceImpact, setPriceImpact] = useState(0)
  const [estimatedFees, setEstimatedFees] = useState(0)
  const [probabilityFill, setProbabilityFill] = useState(0)
  
  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Calculate order metrics
  useEffect(() => {
    if (amount && targetPrice) {
      analyzeOrder()
    }
  }, [amount, targetPrice, orderType, currentPrice])

  const analyzeOrder = async () => {
    setIsAnalyzing(true)
    try {
      const orderAmount = parseFloat(amount)
      const price = parseFloat(targetPrice)
      
      // Calculate price impact (simplified)
      const priceChange = Math.abs(price - currentPrice) / currentPrice
      setPriceImpact(priceChange)
      
      // Estimate fees (0.3% base + dynamic component)
      const baseFee = orderAmount * 0.003
      const dynamicFee = baseFee * (1 + priceChange * 2) // Higher fees for larger price moves
      setEstimatedFees(baseFee + dynamicFee)
      
      // Calculate probability of fill based on price distance
      const distanceFromCurrent = Math.abs(price - currentPrice) / currentPrice
      let probability = 1 - (distanceFromCurrent * 10) // Simplified probability model
      probability = Math.max(0.05, Math.min(0.95, probability)) // Clamp between 5-95%
      setProbabilityFill(probability)
      
    } catch (error) {
      console.error('Error analyzing order:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getMaxAmount = () => {
    return orderType === 'buy' 
      ? tokenY.balance / parseFloat(targetPrice || '1')
      : tokenX.balance
  }

  const validateOrder = () => {
    if (!poolAddress || !publicKey) return false
    if (!amount || !targetPrice) return false
    if (parseFloat(amount) <= 0) return false
    if (parseFloat(targetPrice) <= 0) return false
    if (parseFloat(amount) > getMaxAmount()) return false
    return true
  }

  const handleCreateOrder = async () => {
    if (!validateOrder()) return

    setIsCreating(true)
    try {
      const params: LimitOrderParams = {
        poolAddress: poolAddress!,
        userAddress: publicKey!,
        side: orderType,
        amount,
        targetPrice: parseFloat(targetPrice),
        expiryTime: useExpiry ? new Date(Date.now() + parseInt(expiryHours) * 60 * 60 * 1000) : undefined,
      }

      const transaction = await dlmmOperations.createLimitOrder(params)
      const result = await sendTransaction(transaction)

      if (result.success) {
        onSuccess?.()
        onClose()
      } else {
        throw new Error(result.error || 'Transaction failed')
      }
    } catch (error) {
      console.error('Error creating limit order:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const getPricePreset = (percentage: number) => {
    const price = currentPrice * (1 + (orderType === 'buy' ? -percentage : percentage))
    setTargetPrice(price.toFixed(2))
  }

  const orderValue = parseFloat(amount || '0') * parseFloat(targetPrice || '0')
  const currentValue = parseFloat(amount || '0') * currentPrice
  const potentialSavings = orderType === 'buy' 
    ? currentValue - orderValue 
    : orderValue - currentValue

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create Limit Order - {tokenX.symbol}/{tokenY.symbol}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Type Selection */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={orderType === 'buy' ? 'default' : 'outline'}
                  className={`h-16 flex-col ${
                    orderType === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                  onClick={() => setOrderType('buy')}
                >
                  <ArrowUpRight className="h-5 w-5 mb-1" />
                  <span>Buy {tokenX.symbol}</span>
                  <span className="text-xs opacity-80">Buy when price drops</span>
                </Button>
                
                <Button
                  variant={orderType === 'sell' ? 'default' : 'outline'}
                  className={`h-16 flex-col ${
                    orderType === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''
                  }`}
                  onClick={() => setOrderType('sell')}
                >
                  <ArrowDownLeft className="h-5 w-5 mb-1" />
                  <span>Sell {tokenX.symbol}</span>
                  <span className="text-xs opacity-80">Sell when price rises</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Price Input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Target Price
                <Badge variant="outline">
                  Current: {formatCurrency(currentPrice)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 text-2xl bg-transparent border rounded-md px-4 py-3"
                  />
                  <div className="text-lg font-medium">{tokenY.symbol}</div>
                </div>
                
                {targetPrice && (
                  <div className="text-sm text-muted-foreground">
                    {((parseFloat(targetPrice) - currentPrice) / currentPrice * 100).toFixed(2)}% 
                    {parseFloat(targetPrice) > currentPrice ? ' above' : ' below'} current price
                  </div>
                )}
              </div>

              {/* Price Presets */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Quick Presets</div>
                <div className="grid grid-cols-4 gap-2">
                  {[0.01, 0.02, 0.05, 0.1].map((percentage) => (
                    <Button
                      key={percentage}
                      variant="outline"
                      size="sm"
                      onClick={() => getPricePreset(percentage)}
                      className="text-xs"
                    >
                      {orderType === 'buy' ? '-' : '+'}{(percentage * 100).toFixed(0)}%
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amount Input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Amount ({orderType === 'buy' ? tokenX.symbol : tokenX.symbol})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Available Balance</span>
                  <span className="text-sm text-muted-foreground">
                    {formatNumber(orderType === 'buy' ? tokenY.balance : tokenX.balance)}{' '}
                    {orderType === 'buy' ? tokenY.symbol : tokenX.symbol}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 text-xl bg-transparent border rounded-md px-4 py-2"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(getMaxAmount().toString())}
                  >
                    Max
                  </Button>
                </div>
                
                {amount && targetPrice && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Order Value: {formatCurrency(orderValue)}
                  </div>
                )}
              </div>

              {/* Amount Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[0.25, 0.5, 0.75, 1].map((percentage) => (
                  <Button
                    key={percentage}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount((getMaxAmount() * percentage).toFixed(6))}
                    className="text-xs"
                  >
                    {(percentage * 100).toFixed(0)}%
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expiry Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Order Expiry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={useExpiry}
                  onChange={(e) => setUseExpiry(e.target.checked)}
                  className="h-4 w-4"
                />
                <label className="text-sm">Set expiry time</label>
              </div>
              
              {useExpiry && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(e.target.value)}
                    min="1"
                    max="168"
                    className="w-20 px-3 py-2 border rounded-md"
                  />
                  <span className="text-sm">hours</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Analysis */}
          {amount && targetPrice && (
            <Card className="bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Order Analysis
                  {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-saros-primary" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {formatPercentage(priceImpact)}
                    </div>
                    <div className="text-xs text-muted-foreground">Price Impact</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {formatCurrency(estimatedFees)}
                    </div>
                    <div className="text-xs text-muted-foreground">Est. Fees</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {formatPercentage(probabilityFill)}
                    </div>
                    <div className="text-xs text-muted-foreground">Fill Probability</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${
                      potentialSavings > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {potentialSavings >= 0 ? '+' : ''}{formatCurrency(potentialSavings)}
                    </div>
                    <div className="text-xs text-muted-foreground">Potential Savings</div>
                  </div>
                </div>

                {/* Risk Warning */}
                {Math.abs(parseFloat(targetPrice) - currentPrice) / currentPrice > 0.05 && (
                  <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-800">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-orange-800 dark:text-orange-200">
                        Large price difference detected
                      </div>
                      <div className="text-orange-700 dark:text-orange-300 mt-1">
                        Your target price is {formatPercentage(Math.abs(parseFloat(targetPrice) - currentPrice) / currentPrice)} away from current market price. This order may take longer to fill.
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateOrder}
              disabled={!validateOrder() || isCreating || isSubmitting}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating Order...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Create {orderType === 'buy' ? 'Buy' : 'Sell'} Order
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}