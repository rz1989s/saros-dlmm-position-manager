'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCcw, Settings } from 'lucide-react'
import { BinInfo } from '@/lib/types'
import { formatNumber, formatCurrency } from '@/lib/utils/format'

interface BinChartProps {
  bins: BinInfo[]
  activeBinId: number
  userBins?: number[]
  // eslint-disable-next-line no-unused-vars
  onBinClick?: (_binId: number) => void
  // eslint-disable-next-line no-unused-vars
  onZoomRange?: (_minBin: number, _maxBin: number) => void
  height?: number
}

interface BinChartData extends Omit<BinInfo, 'totalLiquidity'> {
  totalLiquidity: number
  userLiquidity?: number
  isUserBin: boolean
}

export function BinChart({
  bins,
  activeBinId,
  userBins = [],
  onBinClick,
  height = 400
}: BinChartProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [centerBin, setCenterBin] = useState(activeBinId)
  const [showUserOnly, setShowUserOnly] = useState(false)

  const chartData: BinChartData[] = useMemo(() => {
    const range = Math.floor(20 / zoomLevel)
    const startBin = centerBin - range
    const endBin = centerBin + range

    return bins
      .filter(bin => bin.binId >= startBin && bin.binId <= endBin)
      .filter(bin => !showUserOnly || userBins.includes(bin.binId) || bin.binId === activeBinId)
      .map(bin => ({
        ...bin,
        totalLiquidity: parseFloat(bin.liquidityX) + parseFloat(bin.liquidityY),
        userLiquidity: userBins.includes(bin.binId) ? 
          (parseFloat(bin.liquidityX) + parseFloat(bin.liquidityY)) * 0.1 : 0, // Mock user liquidity
        isUserBin: userBins.includes(bin.binId),
      }))
      .sort((a, b) => a.binId - b.binId)
  }, [bins, centerBin, zoomLevel, userBins, showUserOnly, activeBinId])

  // const maxLiquidity = Math.max(...chartData.map(d => d.totalLiquidity))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as BinChartData
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={data.isActive ? "default" : "secondary"}>
                Bin {data.binId}
              </Badge>
              {data.isUserBin && (
                <Badge className="bg-blue-100 text-blue-800">Your Liquidity</Badge>
              )}
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-medium">${formatNumber(data.price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Liquidity:</span>
                <span className="font-medium">{formatCurrency(data.totalLiquidity)}</span>
              </div>
              {(data.userLiquidity ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span>Your Liquidity:</span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(data.userLiquidity ?? 0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>24h Volume:</span>
                <span className="font-medium">{formatCurrency(parseFloat(data.volume24h))}</span>
              </div>
              <div className="flex justify-between">
                <span>Fee Rate:</span>
                <span className="font-medium">{(data.feeRate * 100).toFixed(3)}%</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const handleZoomIn = () => {
    if (zoomLevel < 4) {
      setZoomLevel(zoomLevel * 1.5)
    }
  }

  const handleZoomOut = () => {
    if (zoomLevel > 0.25) {
      setZoomLevel(zoomLevel / 1.5)
    }
  }

  const handleReset = () => {
    setZoomLevel(1)
    setCenterBin(activeBinId)
    setShowUserOnly(false)
  }

  const handleBarClick = (data: any) => {
    if (data && onBinClick) {
      onBinClick(data.binId)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-base sm:text-lg">Liquidity Distribution</span>
              {showUserOnly && (
                <Badge variant="outline" className="text-xs w-fit">
                  Your Positions Only
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Click bins to interact • Zoom: {(zoomLevel * 100).toFixed(0)}%
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUserOnly(!showUserOnly)}
              className={`${showUserOnly ? "bg-blue-50 border-blue-200" : ""} h-8 w-8 sm:h-9 sm:w-auto sm:px-3`}
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Filter</span>
            </Button>
            
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.25}
                className="rounded-r-none h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 4}
                className="rounded-none border-x h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="rounded-l-none h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              onClick={handleBarClick}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="binId"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#ccc' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#ccc' }}
                tickFormatter={(value) => `$${formatNumber(value / 1000)}K`}
              />
              
              {/* Total liquidity bars */}
              <Bar 
                dataKey="totalLiquidity"
                fill="#e2e8f0"
                stroke="#cbd5e1"
                strokeWidth={1}
                radius={[2, 2, 0, 0]}
                cursor="pointer"
              />
              
              {/* User liquidity overlay */}
              <Bar 
                dataKey="userLiquidity"
                fill="#3b82f6"
                stroke="#2563eb"
                strokeWidth={1}
                radius={[2, 2, 0, 0]}
                cursor="pointer"
              />
              
              {/* Active bin indicator */}
              <ReferenceLine 
                x={activeBinId}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              
              <Tooltip content={<CustomTooltip />} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span>Total Liquidity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Your Liquidity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-green-500 border-dashed rounded"></div>
            <span>Active Bin</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold">
              {chartData.length}
            </div>
            <div className="text-xs text-muted-foreground">Visible Bins</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {formatCurrency(chartData.reduce((sum, bin) => sum + bin.totalLiquidity, 0))}
            </div>
            <div className="text-xs text-muted-foreground">Total Liquidity</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {formatCurrency(chartData.reduce((sum, bin) => sum + (bin.userLiquidity || 0), 0))}
            </div>
            <div className="text-xs text-muted-foreground">Your Liquidity</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}