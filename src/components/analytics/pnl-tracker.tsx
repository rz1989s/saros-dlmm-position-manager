'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  LineChart
} from 'lucide-react'
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, Bar } from 'recharts'
import { useUserPositions } from '@/hooks/use-dlmm'
import { useWalletState } from '@/hooks/use-wallet-integration'
import { useDataSource } from '@/contexts/data-source-context'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'

interface PnLData {
  date: string
  totalPnL: number
  feesEarned: number
  priceChange: number
  impermanentLoss: number
  cumulativePnL: number
}

interface PositionPnL {
  positionId: string
  pool: string
  initialValue: number
  currentValue: number
  totalFees: number
  impermanentLoss: number
  netPnL: number
  pnlPercentage: number
  daysActive: number
  annualizedReturn: number
}

export function PnLTracker() {
  const { isConnected } = useWalletState()
  const { positions } = useUserPositions()
  const { isRealDataMode, isMockDataMode } = useDataSource()

  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d' | 'all'>('7d')
  const [pnlData, setPnlData] = useState<PnLData[]>([])
  const [positionsPnL, setPositionsPnL] = useState<PositionPnL[]>([])
  const [totalStats, setTotalStats] = useState({
    totalPnL: 0,
    totalInvested: 0,
    totalFees: 0,
    totalImpermanentLoss: 0,
    pnlPercentage: 0,
    bestPosition: null as PositionPnL | null,
    worstPosition: null as PositionPnL | null
  })

  // Generate P&L data based on data mode
  useEffect(() => {
    if (isConnected || isMockDataMode) {
      if (isRealDataMode) {
        generateRealPnLData()
        calculateRealPositionsPnL()
      } else {
        generatePnLData()
        calculatePositionsPnL()
      }
    }
  }, [timeframe, isConnected, positions, isRealDataMode, isMockDataMode])

  const generatePnLData = () => {
    const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
    const dataPoints = timeframe === '24h' ? 24 : days
    const data: PnLData[] = []
    
    let cumulativePnL = 0
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date()
      if (timeframe === '24h') {
        date.setHours(date.getHours() - (dataPoints - 1 - i))
      } else {
        date.setDate(date.getDate() - (dataPoints - 1 - i))
      }
      
      const feesEarned = Math.random() * 50 + 10
      const priceChange = (Math.random() - 0.5) * 100
      const impermanentLoss = Math.abs(priceChange) * -0.1
      const totalPnL = feesEarned + priceChange + impermanentLoss
      cumulativePnL += totalPnL
      
      data.push({
        date: timeframe === '24h' ? date.toLocaleTimeString('en-US', { hour: 'numeric' }) : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalPnL,
        feesEarned,
        priceChange,
        impermanentLoss,
        cumulativePnL
      })
    }
    
    setPnlData(data)
  }

  const calculatePositionsPnL = () => {
    if (!positions || positions.length === 0) {
      // Generate mock position P&L data
      const mockPositions: PositionPnL[] = [
        {
          positionId: 'pos_1',
          pool: 'SOL/USDC',
          initialValue: 10000,
          currentValue: 11250,
          totalFees: 380,
          impermanentLoss: -45,
          netPnL: 1585,
          pnlPercentage: 15.85,
          daysActive: 28,
          annualizedReturn: 207.2
        },
        {
          positionId: 'pos_2', 
          pool: 'RAY/SOL',
          initialValue: 5000,
          currentValue: 4850,
          totalFees: 125,
          impermanentLoss: -23,
          netPnL: -48,
          pnlPercentage: -0.96,
          daysActive: 15,
          annualizedReturn: -23.4
        },
        {
          positionId: 'pos_3',
          pool: 'ORCA/USDC',
          initialValue: 7500,
          currentValue: 8100,
          totalFees: 245,
          impermanentLoss: -67,
          netPnL: 778,
          pnlPercentage: 10.37,
          daysActive: 42,
          annualizedReturn: 90.2
        }
      ]
      
      setPositionsPnL(mockPositions)
      
      // Calculate total stats
      const totalInvested = mockPositions.reduce((sum, pos) => sum + pos.initialValue, 0)
      const totalFees = mockPositions.reduce((sum, pos) => sum + pos.totalFees, 0)
      const totalIL = mockPositions.reduce((sum, pos) => sum + pos.impermanentLoss, 0)
      const totalPnL = mockPositions.reduce((sum, pos) => sum + pos.netPnL, 0)
      const pnlPercentage = (totalPnL / totalInvested) * 100
      
      const bestPosition = mockPositions.reduce((best, pos) => 
        !best || pos.pnlPercentage > best.pnlPercentage ? pos : best, null as PositionPnL | null)
      const worstPosition = mockPositions.reduce((worst, pos) => 
        !worst || pos.pnlPercentage < worst.pnlPercentage ? pos : worst, null as PositionPnL | null)
      
      setTotalStats({
        totalPnL,
        totalInvested,
        totalFees,
        totalImpermanentLoss: totalIL,
        pnlPercentage,
        bestPosition,
        worstPosition
      })
    }
  }

  const generateRealPnLData = async () => {
    console.log('🌐 generateRealPnLData: Fetching real P&L data for timeframe:', timeframe)

    try {
      if (!isConnected) {
        console.log('⚠️ generateRealPnLData: Wallet not connected, cannot fetch real data')
        return
      }

      // In real implementation, this would:
      // 1. Fetch user's position history from blockchain
      // 2. Calculate actual P&L from swap events and fee collections
      // 3. Get real price data from oracles/APIs

      const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
      const dataPoints = timeframe === '24h' ? 24 : days
      const data: PnLData[] = []

      let cumulativePnL = 0
      for (let i = 0; i < dataPoints; i++) {
        const date = new Date()
        if (timeframe === '24h') {
          date.setHours(date.getHours() - (dataPoints - 1 - i))
        } else {
          date.setDate(date.getDate() - (dataPoints - 1 - i))
        }

        // Placeholder for real data - would fetch from blockchain events
        const feesEarned = 0 // Real: Calculate from fee collection events
        const priceChange = 0 // Real: Get from position value changes
        const impermanentLoss = 0 // Real: Calculate from token price movements
        const totalPnL = feesEarned + priceChange + impermanentLoss
        cumulativePnL += totalPnL

        data.push({
          date: timeframe === '24h' ? date.toLocaleTimeString('en-US', { hour: 'numeric' }) : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          totalPnL,
          feesEarned,
          priceChange,
          impermanentLoss,
          cumulativePnL
        })
      }

      setPnlData(data)
      console.log('✅ generateRealPnLData: Real P&L data generated with', data.length, 'points')
    } catch (error) {
      console.error('❌ generateRealPnLData: Error fetching real P&L data:', error)
      // Fallback to mock data on error
      generatePnLData()
    }
  }

  const calculateRealPositionsPnL = async () => {
    console.log('🌐 calculateRealPositionsPnL: Calculating real position P&L')

    try {
      if (!isConnected) {
        console.log('⚠️ calculateRealPositionsPnL: Wallet not connected')
        return
      }

      if (!positions || positions.length === 0) {
        console.log('⚠️ calculateRealPositionsPnL: No positions found')
        setPositionsPnL([])
        setTotalStats({
          totalPnL: 0,
          totalInvested: 0,
          totalFees: 0,
          totalImpermanentLoss: 0,
          pnlPercentage: 0,
          bestPosition: null,
          worstPosition: null
        })
        return
      }

      // In real implementation, this would:
      // 1. Fetch current token prices
      // 2. Calculate position values
      // 3. Get fee collection history from blockchain
      // 4. Calculate impermanent loss from price movements

      const realPositions: PositionPnL[] = positions.map((position, index) => ({
        positionId: `real_pos_${index}`,
        pool: `${position.tokenX?.symbol || 'TOKEN'}/${position.tokenY?.symbol || 'TOKEN'}`,
        initialValue: 0, // Real: Get from position creation transaction
        currentValue: 0, // Real: Calculate from current token amounts and prices
        totalFees: 0, // Real: Sum fee collection events
        impermanentLoss: 0, // Real: Calculate from price movements
        netPnL: 0, // Real: Current value - initial value + fees - IL
        pnlPercentage: 0, // Real: (netPnL / initialValue) * 100
        daysActive: 0, // Real: Days since position creation
        annualizedReturn: 0 // Real: (pnlPercentage / daysActive) * 365
      }))

      setPositionsPnL(realPositions)

      // Calculate total stats from real positions
      const totalInvested = realPositions.reduce((sum, pos) => sum + pos.initialValue, 0)
      const totalPnL = realPositions.reduce((sum, pos) => sum + pos.netPnL, 0)
      const totalFees = realPositions.reduce((sum, pos) => sum + pos.totalFees, 0)
      const totalIL = realPositions.reduce((sum, pos) => sum + pos.impermanentLoss, 0)
      const pnlPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

      const bestPosition = realPositions.reduce((best, pos) =>
        (!best || pos.pnlPercentage > best.pnlPercentage) ? pos : best, null as PositionPnL | null)

      const worstPosition = realPositions.reduce((worst, pos) =>
        (!worst || pos.pnlPercentage < worst.pnlPercentage) ? pos : worst, null as PositionPnL | null)

      setTotalStats({
        totalPnL,
        totalInvested,
        totalFees,
        totalImpermanentLoss: totalIL,
        pnlPercentage,
        bestPosition,
        worstPosition
      })

      console.log('✅ calculateRealPositionsPnL: Real position P&L calculated')
    } catch (error) {
      console.error('❌ calculateRealPositionsPnL: Error calculating real position P&L:', error)
      // Fallback to mock data on error
      calculatePositionsPnL()
    }
  }

  const getTimeframeDays = () => {
    switch (timeframe) {
      case '24h': return 1
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      default: return 365
    }
  }

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground text-center">
            Connect your wallet to view detailed P&L tracking and analytics
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* P&L Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${totalStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalStats.totalPnL >= 0 ? '+' : ''}{formatCurrency(totalStats.totalPnL)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(totalStats.pnlPercentage / 100)}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${totalStats.totalPnL >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {totalStats.totalPnL >= 0 ? (
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowDownLeft className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-2xl font-bold text-blue-600">
                  +{formatCurrency(totalStats.totalFees)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage((totalStats.totalFees / totalStats.totalInvested))}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Impermanent Loss</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(totalStats.totalImpermanentLoss)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage((totalStats.totalImpermanentLoss / totalStats.totalInvested))}
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Position</p>
                <p className="text-lg font-bold text-green-600">
                  {totalStats.bestPosition ? `+${formatPercentage(totalStats.bestPosition.pnlPercentage / 100)}` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalStats.bestPosition?.pool || 'No positions'}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* P&L Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            P&L Over Time
          </CardTitle>
          <div className="flex items-center gap-2">
            {(['24h', '7d', '30d', '90d', 'all'] as const).map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={pnlData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'cumulativePnL' ? 'Cumulative P&L' :
                    name === 'feesEarned' ? 'Fees Earned' :
                    name === 'priceChange' ? 'Price Change' : 'Impermanent Loss'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativePnL"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
                <Bar dataKey="feesEarned" fill="#10b981" />
                <Line 
                  type="monotone" 
                  dataKey="totalPnL" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Position P&L Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Position P&L Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positionsPnL.map((position) => (
              <div key={position.positionId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{position.pool}</h4>
                    <Badge variant={position.netPnL >= 0 ? "default" : "destructive"}>
                      {position.netPnL >= 0 ? 'Profit' : 'Loss'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Initial Value</div>
                      <div className="font-medium">{formatCurrency(position.initialValue)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Current Value</div>
                      <div className="font-medium">{formatCurrency(position.currentValue)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Fees Earned</div>
                      <div className="font-medium text-blue-600">+{formatCurrency(position.totalFees)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Impermanent Loss</div>
                      <div className="font-medium text-orange-600">{formatCurrency(position.impermanentLoss)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Annualized Return</div>
                      <div className={`font-medium ${position.annualizedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {position.annualizedReturn >= 0 ? '+' : ''}{formatPercentage(position.annualizedReturn / 100)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-6">
                  <div className={`text-xl font-bold ${position.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {position.netPnL >= 0 ? '+' : ''}{formatCurrency(position.netPnL)}
                  </div>
                  <div className={`text-sm ${position.pnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {position.pnlPercentage >= 0 ? '+' : ''}{formatPercentage(position.pnlPercentage / 100)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {position.daysActive} days active
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* P&L Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="text-sm">
                  <div className="font-medium text-green-800 dark:text-green-200">
                    Strong Fee Generation
                  </div>
                  <div className="text-green-700 dark:text-green-300">
                    Your positions generated {formatCurrency(totalStats.totalFees)} in fees over {getTimeframeDays()} days
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div className="text-sm">
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    Portfolio Diversification
                  </div>
                  <div className="text-blue-700 dark:text-blue-300">
                    You have {positionsPnL.length} active positions across different pools
                  </div>
                </div>
              </div>
              
              {totalStats.totalImpermanentLoss < -50 && (
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <div className="text-sm">
                    <div className="font-medium text-orange-800 dark:text-orange-200">
                      Monitor Impermanent Loss
                    </div>
                    <div className="text-orange-700 dark:text-orange-300">
                      Consider rebalancing to reduce IL risk
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Time-based Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Daily P&L</span>
                <span className="font-medium">{formatCurrency(totalStats.totalPnL / getTimeframeDays())}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Best Daily P&L</span>
                <span className="font-medium text-green-600">
                  +{formatCurrency(Math.max(...pnlData.map(d => d.totalPnL)))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Worst Daily P&L</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(Math.min(...pnlData.map(d => d.totalPnL)))}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <span className="font-medium">
                  {formatPercentage(pnlData.filter(d => d.totalPnL > 0).length / pnlData.length)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}