'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

// Mock data generator for bin visualization
const generateMockBins = () => Array.from({ length: 20 }, (_, i) => ({
  binId: i - 10,
  price: 100 + (i - 10) * 5,
  liquidityX: Math.random() * 1000,
  liquidityY: Math.random() * 1000,
  isActive: i === 10,
  volume: Math.random() * 10000,
}))

export function BinVisualization() {
  const [bins, setBins] = useState<any[]>([])
  const [selectedBin, setSelectedBin] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark as client-side rendered and initialize data
    setIsClient(true)
    setBins(generateMockBins())

    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const maxLiquidity = bins.length > 0 ? Math.max(...bins.map(b => b.liquidityX + b.liquidityY)) : 0

  if (isLoading || !isClient || bins.length === 0) {
    return (
      <Card className="chart-container">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Liquidity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex-1 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="chart-container">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Liquidity Distribution by Bin
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Hover over bins to see liquidity details
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {bins.map((bin) => {
            const totalLiquidity = bin.liquidityX + bin.liquidityY
            const widthPercentage = (totalLiquidity / maxLiquidity) * 100
            
            return (
              <div
                key={bin.binId}
                className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                  selectedBin === bin.binId 
                    ? 'bg-saros-primary/10' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedBin(bin.binId === selectedBin ? null : bin.binId)}
              >
                <div className="w-12 text-xs text-muted-foreground text-right">
                  {bin.price.toFixed(1)}
                </div>
                <div className="flex-1 relative">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        bin.isActive 
                          ? 'bin-active' 
                          : 'bg-saros-primary/30'
                      }`}
                      style={{ width: `${Math.max(widthPercentage, 2)}%` }}
                    />
                  </div>
                  {bin.isActive && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-2 h-2 bg-saros-accent rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <div className="w-20 text-xs text-right">
                  {totalLiquidity.toFixed(0)}
                </div>
              </div>
            )
          })}
        </div>
        
        {selectedBin !== null && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Bin Details (ID: {selectedBin})</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Price: ${bins.find(b => b.binId === selectedBin)?.price.toFixed(2)}</div>
              <div>Total Liquidity: {bins.find(b => b.binId === selectedBin)?.liquidityX.toFixed(0)}</div>
              <div>24h Volume: ${bins.find(b => b.binId === selectedBin)?.volume.toFixed(0)}</div>
              <div>Status: {bins.find(b => b.binId === selectedBin)?.isActive ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}