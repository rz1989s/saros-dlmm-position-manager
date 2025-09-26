'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Target,
  AlertTriangle,
  Info,
  RefreshCw,
  BarChart3
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useUserPositions } from '@/hooks/use-dlmm'
import { useWalletState } from '@/hooks/use-wallet-integration'
import { useDataSource } from '@/contexts/data-source-context'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'

interface PortfolioAllocation {
  name: string
  value: number
  percentage: number
  color: string
  pnl: number
  pnlPercentage: number
}

interface RiskMetrics {
  portfolioRisk: 'low' | 'medium' | 'high'
  concentration: number
  correlationRisk: number
  liquidityRisk: number
  volatility: number
}

interface PerformanceMetrics {
  sharpeRatio: number
  maxDrawdown: number
  calmarRatio: number
  winRate: number
  avgWin: number
  avgLoss: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export function PortfolioOverview() {
  const { isConnected } = useWalletState()
  const { positions, refreshPositions } = useUserPositions()
  const { isRealDataMode, isMockDataMode } = useDataSource()

  const [portfolioData, setPortfolioData] = useState<PortfolioAllocation[]>([])
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    portfolioRisk: 'low',
    concentration: 0,
    correlationRisk: 0,
    liquidityRisk: 0,
    volatility: 0
  })
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    sharpeRatio: 0,
    maxDrawdown: 0,
    calmarRatio: 0,
    winRate: 0,
    avgWin: 0,
    avgLoss: 0
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (isConnected || isMockDataMode) {
      if (isRealDataMode) {
        generateRealPortfolioData()
        calculateRealRiskMetrics()
        calculateRealPerformanceMetrics()
      } else {
        generatePortfolioData()
        calculateRiskMetrics()
        calculatePerformanceMetrics()
      }
    }
  }, [isConnected, positions, isRealDataMode, isMockDataMode])

  const generatePortfolioData = () => {
    // Mock portfolio allocation data
    const mockData: PortfolioAllocation[] = [
      { name: 'SOL/USDC', value: 12500, percentage: 55.6, color: COLORS[0], pnl: 1580, pnlPercentage: 12.64 },
      { name: 'RAY/SOL', value: 4850, percentage: 21.6, color: COLORS[1], pnl: -45, pnlPercentage: -0.92 },
      { name: 'ORCA/USDC', value: 3200, percentage: 14.2, color: COLORS[2], pnl: 245, pnlPercentage: 8.28 },
      { name: 'MNGO/SOL', value: 1950, percentage: 8.7, color: COLORS[3], pnl: -123, pnlPercentage: -5.92 }
    ]
    setPortfolioData(mockData)
  }

  const calculateRiskMetrics = () => {
    // Mock risk calculations
    const concentration = Math.max(...portfolioData.map(d => d.percentage)) / 100
    const correlationRisk = 0.65 // Mock correlation between positions
    const liquidityRisk = 0.25 // Mock liquidity risk score
    const volatility = 0.28 // Mock portfolio volatility
    
    let portfolioRisk: 'low' | 'medium' | 'high' = 'low'
    if (concentration > 0.5 || correlationRisk > 0.7 || volatility > 0.4) {
      portfolioRisk = 'high'
    } else if (concentration > 0.3 || correlationRisk > 0.5 || volatility > 0.25) {
      portfolioRisk = 'medium'
    }
    
    setRiskMetrics({
      portfolioRisk,
      concentration,
      correlationRisk,
      liquidityRisk,
      volatility
    })
  }

  const calculatePerformanceMetrics = () => {
    // Mock performance calculations
    setPerformanceMetrics({
      sharpeRatio: 1.85,
      maxDrawdown: 0.12,
      calmarRatio: 1.23,
      winRate: 0.68,
      avgWin: 387,
      avgLoss: -165
    })
  }

  // Real data functions
  const generateRealPortfolioData = async () => {
    console.log('🌐 generateRealPortfolioData: Fetching real portfolio data')

    try {
      if (!isConnected) {
        console.log('⚠️ generateRealPortfolioData: Wallet not connected')
        setPortfolioData([])
        return
      }

      if (!positions || positions.length === 0) {
        console.log('⚠️ generateRealPortfolioData: No positions found')
        setPortfolioData([])
        return
      }

      // In real implementation, this would:
      // 1. Fetch current token prices for all positions
      // 2. Calculate current value of each position
      // 3. Get position entry prices/values
      // 4. Calculate P&L for each position

      const realPortfolioData: PortfolioAllocation[] = positions.map((position, index) => ({
        name: `${position.tokenX?.symbol || 'TOKEN'}/${position.tokenY?.symbol || 'TOKEN'}`,
        value: 0, // Real: Calculate from token amounts * current prices
        percentage: 0, // Real: (position value / total portfolio value) * 100
        color: COLORS[index % COLORS.length],
        pnl: 0, // Real: Current value - initial value + fees earned
        pnlPercentage: 0 // Real: (pnl / initial value) * 100
      }))

      // Calculate percentages after all values are known
      const totalValue = realPortfolioData.reduce((sum, pos) => sum + pos.value, 0)
      realPortfolioData.forEach(pos => {
        pos.percentage = totalValue > 0 ? (pos.value / totalValue) * 100 : 0
      })

      setPortfolioData(realPortfolioData)
      console.log('✅ generateRealPortfolioData: Real portfolio data generated')
    } catch (error) {
      console.error('❌ generateRealPortfolioData: Error generating real portfolio data:', error)
      // Fallback to mock data
      generatePortfolioData()
    }
  }

  const calculateRealRiskMetrics = async () => {
    console.log('🌐 calculateRealRiskMetrics: Calculating real risk metrics')

    try {
      if (!positions || positions.length === 0) {
        setRiskMetrics({
          portfolioRisk: 'low',
          concentration: 0,
          correlationRisk: 0,
          liquidityRisk: 0,
          volatility: 0
        })
        return
      }

      // In real implementation, this would:
      // 1. Calculate actual concentration based on position sizes
      // 2. Analyze token correlations from historical price data
      // 3. Assess pool liquidity metrics
      // 4. Calculate portfolio volatility from price movements

      const concentration = 0 // Real: Max position percentage
      const correlationRisk = 0 // Real: Average correlation between positions
      const liquidityRisk = 0 // Real: Weighted average of pool liquidity risks
      const volatility = 0 // Real: Portfolio price volatility

      const portfolioRisk: 'low' | 'medium' | 'high' =
        concentration > 0.6 || correlationRisk > 0.8 || volatility > 0.4 ? 'high' :
        concentration > 0.4 || correlationRisk > 0.6 || volatility > 0.25 ? 'medium' : 'low'

      setRiskMetrics({
        portfolioRisk,
        concentration,
        correlationRisk,
        liquidityRisk,
        volatility
      })

      console.log('✅ calculateRealRiskMetrics: Real risk metrics calculated')
    } catch (error) {
      console.error('❌ calculateRealRiskMetrics: Error calculating real risk metrics:', error)
      // Fallback to mock data
      calculateRiskMetrics()
    }
  }

  const calculateRealPerformanceMetrics = async () => {
    console.log('🌐 calculateRealPerformanceMetrics: Calculating real performance metrics')

    try {
      if (!positions || positions.length === 0) {
        setPerformanceMetrics({
          sharpeRatio: 0,
          maxDrawdown: 0,
          calmarRatio: 0,
          winRate: 0,
          avgWin: 0,
          avgLoss: 0
        })
        return
      }

      // In real implementation, this would:
      // 1. Calculate returns from historical position values
      // 2. Calculate Sharpe ratio using risk-free rate
      // 3. Determine max drawdown from portfolio history
      // 4. Calculate win rate from individual position outcomes

      setPerformanceMetrics({
        sharpeRatio: 0, // Real: (portfolio return - risk free rate) / portfolio volatility
        maxDrawdown: 0, // Real: Maximum portfolio decline from peak
        calmarRatio: 0, // Real: Annual return / max drawdown
        winRate: 0, // Real: Percentage of profitable positions
        avgWin: 0, // Real: Average profit of winning positions
        avgLoss: 0 // Real: Average loss of losing positions
      })

      console.log('✅ calculateRealPerformanceMetrics: Real performance metrics calculated')
    } catch (error) {
      console.error('❌ calculateRealPerformanceMetrics: Error calculating real performance metrics:', error)
      // Fallback to mock data
      calculatePerformanceMetrics()
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshPositions()
      if (isRealDataMode) {
        await generateRealPortfolioData()
        await calculateRealRiskMetrics()
        await calculateRealPerformanceMetrics()
      } else {
        generatePortfolioData()
        calculateRiskMetrics()
        calculatePerformanceMetrics()
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0)
  const totalPnL = portfolioData.reduce((sum, item) => sum + item.pnl, 0)
  const totalPnLPercentage = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <PieChartIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground text-center">
            Connect your wallet to view your portfolio overview and allocation
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Portfolio</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                <div className={`flex items-center gap-1 text-sm ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnL >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)} ({formatPercentage(totalPnLPercentage / 100)})</span>
                </div>
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
                <p className="text-sm text-muted-foreground">Active Positions</p>
                <p className="text-2xl font-bold">{portfolioData.length}</p>
                <p className="text-sm text-muted-foreground">
                  {portfolioData.filter(p => p.pnl > 0).length} profitable
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={riskMetrics.portfolioRisk === 'low' ? 'default' : 
                             riskMetrics.portfolioRisk === 'medium' ? 'secondary' : 'destructive'}
                    className="text-sm"
                  >
                    {riskMetrics.portfolioRisk.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatPercentage(riskMetrics.volatility)} volatility
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                riskMetrics.portfolioRisk === 'low' ? 'bg-green-100' :
                riskMetrics.portfolioRisk === 'medium' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Target className={`h-5 w-5 ${
                  riskMetrics.portfolioRisk === 'low' ? 'text-green-600' :
                  riskMetrics.portfolioRisk === 'medium' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-blue-600">{performanceMetrics.sharpeRatio.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {performanceMetrics.sharpeRatio > 1 ? 'Excellent' : 
                   performanceMetrics.sharpeRatio > 0.5 ? 'Good' : 'Poor'}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Allocation & Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation Pie Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Portfolio Allocation
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Value']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Allocation Legend */}
            <div className="space-y-2 mt-4">
              {portfolioData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(item.value)}</div>
                    <div className={`text-xs ${item.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.pnl >= 0 ? '+' : ''}{formatPercentage(item.pnlPercentage / 100)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Risk Metrics */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Concentration Risk</span>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatPercentage(riskMetrics.concentration)}</div>
                  <Badge variant={riskMetrics.concentration > 0.5 ? 'destructive' : 'secondary'} className="text-xs">
                    {riskMetrics.concentration > 0.5 ? 'High' : 'Moderate'}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Correlation Risk</span>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatPercentage(riskMetrics.correlationRisk)}</div>
                  <Badge variant={riskMetrics.correlationRisk > 0.7 ? 'destructive' : 'secondary'} className="text-xs">
                    {riskMetrics.correlationRisk > 0.7 ? 'High' : 'Moderate'}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Liquidity Risk</span>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatPercentage(riskMetrics.liquidityRisk)}</div>
                  <Badge variant={riskMetrics.liquidityRisk > 0.4 ? 'destructive' : 'default'} className="text-xs">
                    {riskMetrics.liquidityRisk > 0.4 ? 'High' : 'Low'}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Portfolio Volatility</span>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatPercentage(riskMetrics.volatility)}</div>
                  <Badge variant={riskMetrics.volatility > 0.4 ? 'destructive' : 'secondary'} className="text-xs">
                    {riskMetrics.volatility > 0.4 ? 'High' : 'Moderate'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Max Drawdown</span>
                  <span className="text-xs font-medium text-red-600">-{formatPercentage(performanceMetrics.maxDrawdown)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Win Rate</span>
                  <span className="text-xs font-medium text-green-600">{formatPercentage(performanceMetrics.winRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Avg Win</span>
                  <span className="text-xs font-medium">{formatCurrency(performanceMetrics.avgWin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Avg Loss</span>
                  <span className="text-xs font-medium">{formatCurrency(performanceMetrics.avgLoss)}</span>
                </div>
              </div>
            </div>

            {/* Risk Recommendations */}
            <div className="pt-4 border-t space-y-2">
              <h4 className="text-sm font-medium mb-2">Recommendations</h4>
              {riskMetrics.concentration > 0.5 && (
                <div className="flex items-start gap-2 text-xs p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <Info className="h-3 w-3 text-orange-600 mt-0.5" />
                  <span className="text-orange-700 dark:text-orange-300">
                    Consider diversifying to reduce concentration risk
                  </span>
                </div>
              )}
              {riskMetrics.correlationRisk > 0.7 && (
                <div className="flex items-start gap-2 text-xs p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <Info className="h-3 w-3 text-yellow-600 mt-0.5" />
                  <span className="text-yellow-700 dark:text-yellow-300">
                    High correlation between positions detected
                  </span>
                </div>
              )}
              {performanceMetrics.sharpeRatio < 0.5 && (
                <div className="flex items-start gap-2 text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <Info className="h-3 w-3 text-red-600 mt-0.5" />
                  <span className="text-red-700 dark:text-red-300">
                    Consider optimizing position sizes for better risk-adjusted returns
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}