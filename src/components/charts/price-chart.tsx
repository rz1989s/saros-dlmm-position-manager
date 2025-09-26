'use client'

import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react'
import { formatCurrency, formatPercentage, formatTime } from '@/lib/utils/format'

interface PriceData {
  timestamp: number
  price: number
  volume: number
  fees: number
  volatility: number
}

interface PriceChartProps {
  data: PriceData[]
  currentPrice: number
  priceChange24h: number
  // eslint-disable-next-line no-unused-vars
  onTimeframeChange?: (_timeframe: string) => void
  height?: number
}

// Mock data generator for demonstration
const generateMockData = (hours: number): PriceData[] => {
  const data: PriceData[] = []
  const basePrice = 150
  const now = Date.now()
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = now - (i * 60 * 60 * 1000)
    const randomWalk = (Math.random() - 0.5) * 0.1
    const price = basePrice * (1 + Math.sin(i * 0.1) * 0.05 + randomWalk)
    const volume = Math.random() * 100000 + 50000
    const fees = volume * 0.003 // 0.3% fees
    const volatility = Math.abs(randomWalk) * 100
    
    data.push({
      timestamp,
      price,
      volume,
      fees,
      volatility,
    })
  }
  
  return data
}

export function PriceChart({
  data = generateMockData(24),
  currentPrice = 152.45,
  priceChange24h = 0.0325,
  onTimeframeChange, // eslint-disable-line no-unused-vars
  height = 300
}: PriceChartProps) {
  const [timeframe, setTimeframe] = useState('24H')
  const [metric, setMetric] = useState<'price' | 'volume' | 'fees' | 'volatility'>('price')
  const [showMA, setShowMA] = useState(false)

  // Calculate moving average
  const dataWithMA = useMemo(() => {
    const period = 5
    
    return data.map((point, index) => {
      if (index < period - 1) {
        return { ...point, ma: null }
      }
      
      const sum = data.slice(index - period + 1, index + 1)
        .reduce((acc, p) => acc + p[metric], 0)
      
      return {
        ...point,
        ma: sum / period
      }
    })
  }, [data, metric])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as PriceData & { ma?: number }
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {formatTime(data.timestamp)}
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <span>Price:</span>
                <span className="font-medium">{formatCurrency(data.price)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Volume:</span>
                <span className="font-medium">{formatCurrency(data.volume)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Fees:</span>
                <span className="font-medium">{formatCurrency(data.fees)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Volatility:</span>
                <span className="font-medium">{data.volatility.toFixed(2)}%</span>
              </div>
              {showMA && data.ma && (
                <div className="flex justify-between gap-4">
                  <span>MA(5):</span>
                  <span className="font-medium text-orange-600">{formatCurrency(data.ma)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const getMetricColor = () => {
    switch (metric) {
      case 'price': return '#10b981'
      case 'volume': return '#3b82f6'
      case 'fees': return '#f59e0b'
      case 'volatility': return '#ef4444'
      default: return '#10b981'
    }
  }

  const timeframes = ['1H', '4H', '24H', '7D', '30D']
  const metrics = [
    { key: 'price', label: 'Price', icon: TrendingUp },
    { key: 'volume', label: 'Volume', icon: Activity },
    { key: 'fees', label: 'Fees', icon: Clock },
    { key: 'volatility', label: 'Volatility', icon: TrendingDown },
  ]

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              Price & Volume Analysis
              <Badge variant={priceChange24h >= 0 ? "default" : "destructive"}>
                {priceChange24h >= 0 ? '+' : ''}{formatPercentage(priceChange24h)} 24h
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-4 mt-1">
              <div className="text-2xl font-bold">
                {formatCurrency(currentPrice)}
              </div>
              <div className="text-sm text-muted-foreground">
                Current Price
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Selection */}
            <div className="flex border rounded-md">
              {metrics.map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  onClick={() => setMetric(key as any)}
                  className={`rounded-none first:rounded-l-md last:rounded-r-md ${
                    metric === key ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Timeframe Selection */}
            <div className="flex border rounded-md">
              {timeframes.map((tf) => (
                <Button
                  key={tf}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTimeframe(tf)
                    onTimeframeChange?.(tf)
                  }}
                  className={`rounded-none first:rounded-l-md last:rounded-r-md ${
                    timeframe === tf ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  {tf}
                </Button>
              ))}
            </div>

            {/* Moving Average Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMA(!showMA)}
              className={showMA ? "bg-orange-50 border-orange-200" : ""}
            >
              MA
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            {metric === 'volume' ? (
              <AreaChart data={dataWithMA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatTime(value)}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke={getMetricColor()}
                  fillOpacity={1}
                  fill="url(#volumeGradient)"
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
              </AreaChart>
            ) : (
              <LineChart data={dataWithMA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatTime(value)}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => 
                    metric === 'price' ? `$${value.toFixed(0)}` :
                    metric === 'fees' ? `$${(value / 1000).toFixed(1)}K` :
                    `${value.toFixed(1)}%`
                  }
                />
                
                {/* Main metric line */}
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke={getMetricColor()}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: getMetricColor() }}
                />
                
                {/* Moving average line */}
                {showMA && (
                  <Line
                    type="monotone"
                    dataKey="ma"
                    stroke="#f97316"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    dot={false}
                    connectNulls={false}
                  />
                )}
                
                {/* Current price reference line */}
                {metric === 'price' && (
                  <ReferenceLine 
                    y={currentPrice}
                    stroke="#6366f1"
                    strokeDasharray="2 2"
                    label={{ value: "Current", position: "right" }}
                  />
                )}
                
                <Tooltip content={<CustomTooltip />} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">24h High</div>
            <div className="font-semibold text-green-600">
              {formatCurrency(Math.max(...data.map(d => d.price)))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">24h Low</div>
            <div className="font-semibold text-red-600">
              {formatCurrency(Math.min(...data.map(d => d.price)))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Volume</div>
            <div className="font-semibold">
              {formatCurrency(data.reduce((sum, d) => sum + d.volume, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Fees Earned</div>
            <div className="font-semibold text-saros-primary">
              {formatCurrency(data.reduce((sum, d) => sum + d.fees, 0))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}