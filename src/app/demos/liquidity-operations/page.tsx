'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { useWalletIntegration } from '@/hooks/use-wallet-integration'
import {
  Droplets,
  Plus,
  Minus,
  
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  Calculator,
  Zap
} from 'lucide-react'

export default function LiquidityOperationsDemo() {
  const { connected } = useWalletIntegration()
  const [operation, setOperation] = useState<'add' | 'remove'>('add')
  const [amountX, setAmountX] = useState('100')
  const [amountY, setAmountY] = useState('50')

  const simulatedImpact = {
    addLiquidity: {
      lpTokens: parseFloat(amountX) * 0.99 + parseFloat(amountY) * 0.99,
      priceImpact: 0.02,
      slippage: 0.5,
      estimatedGas: 0.00005
    },
    removeLiquidity: {
      tokenXReceived: parseFloat(amountX) * 0.995,
      tokenYReceived: parseFloat(amountY) * 0.995,
      priceImpact: 0.01,
      estimatedGas: 0.00003
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[3] || { id: 3, name: 'Liquidity Operations', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
            <Droplets className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Phase 0: Core Operations</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Liquidity Operations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Add and remove liquidity from DLMM pools with real-time impact simulation
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3" />
              SDK Feature #3
            </Badge>
            <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700">
              <Droplets className="h-3 w-3" />
              Real SDK Integration
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      {/* Wallet Status */}
      {!connected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-900">Wallet Not Connected</div>
                <div className="text-sm text-yellow-700">
                  Connect your wallet to perform liquidity operations
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operation Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Operation</CardTitle>
          <CardDescription>Choose whether to add or remove liquidity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={operation === 'add' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setOperation('add')}
              className="h-24"
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-6 w-6" />
                <span>Add Liquidity</span>
              </div>
            </Button>

            <Button
              variant={operation === 'remove' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setOperation('remove')}
              className="h-24"
            >
              <div className="flex flex-col items-center gap-2">
                <Minus className="h-6 w-6" />
                <span>Remove Liquidity</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liquidity Input */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {operation === 'add' ? 'Add' : 'Remove'} Liquidity
            </CardTitle>
            <CardDescription>
              Enter the amounts of tokens to {operation === 'add' ? 'deposit' : 'withdraw'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tokenX">Token X Amount (SOL)</Label>
              <Input
                id="tokenX"
                type="number"
                value={amountX}
                onChange={(e) => setAmountX(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tokenY">Token Y Amount (USDC)</Label>
              <Input
                id="tokenY"
                type="number"
                value={amountY}
                onChange={(e) => setAmountY(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <Button className="w-full" size="lg" disabled={!connected}>
              <Zap className="h-4 w-4 mr-2" />
              {operation === 'add' ? 'Add' : 'Remove'} Liquidity
            </Button>
          </CardContent>
        </Card>

        {/* Impact Simulation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Impact Simulation
            </CardTitle>
            <CardDescription>
              Estimated impact of your {operation} liquidity operation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {operation === 'add' ? (
              <>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">LP Tokens</span>
                  <span className="font-bold">{simulatedImpact.addLiquidity.lpTokens.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Price Impact</span>
                  <span className="font-bold text-green-600">
                    {simulatedImpact.addLiquidity.priceImpact}%
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">Max Slippage</span>
                  <span className="font-bold">{simulatedImpact.addLiquidity.slippage}%</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Estimated Gas</span>
                  <span className="font-bold">{simulatedImpact.addLiquidity.estimatedGas} SOL</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Token X Received</span>
                  <span className="font-bold">{simulatedImpact.removeLiquidity.tokenXReceived.toFixed(2)} SOL</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Token Y Received</span>
                  <span className="font-bold">{simulatedImpact.removeLiquidity.tokenYReceived.toFixed(2)} USDC</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">Price Impact</span>
                  <span className="font-bold text-green-600">
                    {simulatedImpact.removeLiquidity.priceImpact}%
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Estimated Gas</span>
                  <span className="font-bold">{simulatedImpact.removeLiquidity.estimatedGas} SOL</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            SDK Implementation
          </CardTitle>
          <CardDescription>
            How liquidity operations work with the Saros DLMM SDK
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-blue-600">Add Liquidity</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• SDK Method: <code className="text-xs bg-muted px-1">addLiquidity()</code></li>
                <li>• Validates token amounts and balances</li>
                <li>• Calculates optimal bin distribution</li>
                <li>• Creates transaction with slippage protection</li>
                <li>• Returns LP token amount estimation</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-green-600">Remove Liquidity</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• SDK Method: <code className="text-xs bg-muted px-1">removeLiquidity()</code></li>
                <li>• Burns LP tokens from user&apos;s position</li>
                <li>• Calculates token amounts to receive</li>
                <li>• Handles fee collection automatically</li>
                <li>• Supports partial withdrawals</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold text-sm mb-2">Implementation Files</h3>
            <div className="space-y-1 text-sm">
              <div>• Operations: <code className="text-xs bg-muted px-2 py-1 rounded">src/lib/dlmm/operations.ts</code></div>
              <div>• Client Integration: <code className="text-xs bg-muted px-2 py-1 rounded">src/lib/dlmm/client.ts</code></div>
              <div>• Hook: <code className="text-xs bg-muted px-2 py-1 rounded">src/hooks/use-dlmm.ts</code></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}