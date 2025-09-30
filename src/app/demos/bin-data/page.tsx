'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { SafeBinChart } from '@/lib/lazy-components'
import { BinInfo } from '@/lib/types'
import {
  BarChart3,
  Activity,
  CheckCircle,
  Info,
  Target
} from 'lucide-react'

// Mock bin data for demonstration
const mockBins: BinInfo[] = Array.from({ length: 40 }, (_, i) => ({
  binId: i - 20,
  price: 100 + (i - 20) * 2.5,
  liquidityX: (Math.random() * 50000 + 10000).toString(),
  liquidityY: (Math.random() * 50000 + 10000).toString(),
  isActive: i === 20,
  feeRate: 0.003 + Math.random() * 0.002,
  volume24h: (Math.random() * 100000 + 20000).toString(),
}))

export default function BinDataDemo() {
  const [, setSelectedBin] = useState<number | null>(null)
  const activeBin = mockBins.find(b => b.isActive)

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <FeatureIdentifier
        feature={SDK_FEATURES[4] || { id: 4, name: 'Bin Data Operations', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Phase 0: Core Operations</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Bin Data Operations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time bin liquidity data with interactive visualization and analytics
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3" />
              SDK Feature #4
            </Badge>
            <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700">
              <Activity className="h-3 w-3" />
              Real-time Data
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      {/* Bin Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Bin Liquidity Distribution
          </CardTitle>
          <CardDescription>
            Interactive visualization of liquidity across price bins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SafeBinChart
            bins={mockBins}
            activeBinId={0}
            userBins={[-2, -1, 0, 1, 2]}
            height={400}
            onBinClick={(binId: number) => setSelectedBin(binId)}
          />
        </CardContent>
      </Card>

      {/* Active Bin Info */}
      {activeBin && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Active Bin (Current Price)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Bin ID</div>
                <div className="text-2xl font-bold">{activeBin.binId}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="text-2xl font-bold">${activeBin.price.toFixed(2)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Liquidity X</div>
                <div className="text-2xl font-bold">{(parseFloat(activeBin.liquidityX) / 1000).toFixed(1)}K</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Fee Rate</div>
                <div className="text-2xl font-bold">{(activeBin.feeRate * 100).toFixed(2)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SDK Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            SDK Implementation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-blue-600">SDK Methods</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <code className="text-xs bg-muted px-1">getBinArrayInfo()</code></li>
                <li>• <code className="text-xs bg-muted px-1">getBinReserves()</code></li>
                <li>• <code className="text-xs bg-muted px-1">getActiveBin()</code></li>
                <li>• <code className="text-xs bg-muted px-1">getBinLiquidity()</code></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-green-600">Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time bin data loading</li>
                <li>• Interactive visualization</li>
                <li>• Active bin tracking</li>
                <li>• Liquidity concentration analysis</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold text-sm mb-2">Implementation</h3>
            <code className="text-xs bg-muted px-2 py-1 rounded">src/lib/dlmm/bin-operations.ts</code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}