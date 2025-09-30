'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { useWalletIntegration } from '@/hooks/use-wallet-integration'
import { useUserPositions } from '@/hooks/use-dlmm'
import { formatCurrency } from '@/lib/utils/format'
import {
  Search,
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  TrendingUp,
  DollarSign,
  Coins
} from 'lucide-react'

export default function PositionDiscoveryDemo() {
  const { publicKey, connected } = useWalletIntegration()
  const { positions, loading } = useUserPositions(publicKey || undefined)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[2] || { id: 2, name: 'Position Discovery', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
            <Search className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Phase 0: Core Operations</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Position Discovery
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Automatic discovery of user DLMM positions with wallet integration and real-time updates
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3" />
              SDK Feature #2
            </Badge>
            <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700">
              <Wallet className="h-3 w-3" />
              Wallet Integration
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      {/* Wallet Status */}
      <Card className={connected ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {connected ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900">Wallet Connected</div>
                    <div className="text-sm text-green-700 font-mono">
                      {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                  <div>
                    <div className="font-medium text-yellow-900">Wallet Not Connected</div>
                    <div className="text-sm text-yellow-700">
                      Connect your wallet to discover your positions
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discovery Status */}
      {connected && (
        <Card className={loading ? 'border-yellow-200' : 'border-green-200'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                    <span className="font-medium text-yellow-900">Discovering positions...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      {positions.length} position{positions.length !== 1 ? 's' : ''} discovered
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Positions Grid */}
      {connected && positions.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Discovered Positions</h2>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {positions.length} Total
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {positions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {position.tokenX.symbol}/{position.tokenY.symbol}
                      </CardTitle>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Position Value */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Total Value
                        </span>
                        <span className="font-bold text-lg">
                          {formatCurrency(parseFloat(position.totalValue || '0'))}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          Liquidity
                        </span>
                        <span className="font-medium text-sm">
                          {parseFloat(position.liquidityX || '0').toFixed(2)} {position.tokenX.symbol}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          P&L
                        </span>
                        <span className={`font-medium text-sm ${
                          (position.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(position.pnl || 0) >= 0 ? '+' : ''}{formatCurrency(position.pnl || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Pool Info */}
                    <div className="pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        Pool: {position.poolAddress.toString().slice(0, 8)}...{position.poolAddress.toString().slice(-8)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Bins: {position.bins?.length || 0} active
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* SDK Integration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Position Discovery Process
          </CardTitle>
          <CardDescription>
            How the SDK discovers and loads your DLMM positions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-2">
                1
              </div>
              <h3 className="font-semibold text-sm mb-1">Wallet Connected</h3>
              <p className="text-xs text-muted-foreground">
                User connects Solana wallet
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold mb-2">
                2
              </div>
              <h3 className="font-semibold text-sm mb-1">SDK Query</h3>
              <p className="text-xs text-muted-foreground">
                Query positions via DLMM SDK
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold mb-2">
                3
              </div>
              <h3 className="font-semibold text-sm mb-1">Data Enrichment</h3>
              <p className="text-xs text-muted-foreground">
                Load bin data and metrics
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-orange-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold mb-2">
                4
              </div>
              <h3 className="font-semibold text-sm mb-1">Display Results</h3>
              <p className="text-xs text-muted-foreground">
                Show positions with analytics
              </p>
            </div>
          </div>

          {/* Technical Toggle */}
          <div className="flex items-center justify-between pt-4 border-t">
            <h3 className="font-semibold text-sm">Technical Implementation</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            >
              {showTechnicalDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>

          {showTechnicalDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-blue-600">SDK Methods Used</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <code className="text-xs bg-muted px-1 rounded">getUserPositions()</code></li>
                    <li>• <code className="text-xs bg-muted px-1 rounded">getPositionInfo()</code></li>
                    <li>• <code className="text-xs bg-muted px-1 rounded">getBinArrayInfo()</code></li>
                    <li>• <code className="text-xs bg-muted px-1 rounded">calculatePnL()</code></li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-green-600">Performance Features</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cached position data (30s TTL)</li>
                    <li>• Real-time polling support</li>
                    <li>• Optimistic UI updates</li>
                    <li>• Automatic retry logic</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold text-sm mb-2">Implementation Location</h3>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  src/hooks/use-dlmm.ts → useUserPositions()
                </code>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}