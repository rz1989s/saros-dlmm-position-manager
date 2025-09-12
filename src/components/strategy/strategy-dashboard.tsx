'use client'

import { useState, useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RebalanceModal } from '@/components/strategy/rebalance-modal'
import { LimitOrderModal } from '@/components/strategy/limit-order-modal'
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { useWalletState } from '@/hooks/use-wallet-integration'
import { strategyManager } from '@/lib/dlmm/strategies'
import { DLMMPosition } from '@/lib/types'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'

export function StrategyDashboard() {
  const { isConnected, address } = useWalletState()
  const { positions, refreshPositions } = useUserPositions()
  
  // Modal states
  const [showRebalance, setShowRebalance] = useState(false)
  const [showLimitOrder, setShowLimitOrder] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<DLMMPosition | null>(null)
  
  // Strategy states
  const [activeStrategies, setActiveStrategies] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [performance, setPerformance] = useState<any>({})

  // Load active strategies and recommendations
  useEffect(() => {
    if (isConnected && address) {
      loadStrategies()
      analyzePositions()
    }
  }, [isConnected, address, positions])

  const loadStrategies = () => {
    const strategies = strategyManager.getDefaultStrategies()
    const active = strategies.filter(s => s.enabled).map(s => s.id)
    setActiveStrategies(active)

    // Load performance data for each strategy
    const perfData: any = {}
    active.forEach(strategyId => {
      perfData[strategyId] = strategyManager.getStrategyPerformance(strategyId)
    })
    setPerformance(perfData)
  }

  const analyzePositions = async () => {
    if (!address) return

    setIsAnalyzing(true)
    try {
      const result = await strategyManager.evaluatePositions(new PublicKey(address))
      setRecommendations(result.recommendations)
    } catch (error) {
      console.error('Error analyzing positions:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const toggleStrategy = (strategyId: string) => {
    try {
      if (activeStrategies.includes(strategyId)) {
        strategyManager.disableStrategy(strategyId)
        setActiveStrategies(prev => prev.filter(id => id !== strategyId))
      } else {
        strategyManager.enableStrategy(strategyId)
        setActiveStrategies(prev => [...prev, strategyId])
      }
      loadStrategies()
    } catch (error) {
      console.error('Error toggling strategy:', error)
    }
  }

  const executeRecommendation = async (recommendation: any) => {
    if (!address) return

    try {
      await strategyManager.executeStrategy(
        new PublicKey(address),
        recommendation.strategyId,
        recommendation.positionId,
        recommendation.action
      )
      
      // Refresh data
      await refreshPositions()
      await analyzePositions()
    } catch (error) {
      console.error('Error executing recommendation:', error)
    }
  }

  const strategies = strategyManager.getDefaultStrategies()
  const totalRecommendations = recommendations.length
  const highConfidenceRecs = recommendations.filter(r => r.confidence > 0.8).length

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground text-center">
            Connect your wallet to access automated trading strategies
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Strategies</p>
                <p className="text-2xl font-bold">{activeStrategies.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recommendations</p>
                <p className="text-2xl font-bold">{totalRecommendations}</p>
                <p className="text-xs text-green-600">{highConfidenceRecs} high confidence</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold">{formatCurrency(1247.32)}</p>
                <p className="text-xs text-green-600">+12.3% this week</p>
              </div>
              <div className="p-2 bg-saros-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-saros-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Executions</p>
                <p className="text-2xl font-bold">23</p>
                <p className="text-xs text-blue-600">95% success rate</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="h-16 flex-col"
              onClick={() => setShowRebalance(true)}
            >
              <Zap className="h-5 w-5 mb-1" />
              <span>Smart Rebalance</span>
              <span className="text-xs opacity-80">Optimize current positions</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-16 flex-col"
              onClick={() => setShowLimitOrder(true)}
            >
              <Target className="h-5 w-5 mb-1" />
              <span>Limit Orders</span>
              <span className="text-xs opacity-80">Set price targets</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-16 flex-col"
              onClick={analyzePositions}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mb-1" />
              ) : (
                <RotateCcw className="h-5 w-5 mb-1" />
              )}
              <span>Analyze Positions</span>
              <span className="text-xs opacity-80">Get recommendations</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Strategies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Automated Strategies</CardTitle>
          <Button variant="outline" size="sm" onClick={loadStrategies}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategies.map((strategy) => {
              const isActive = activeStrategies.includes(strategy.id)
              const perf = performance[strategy.id]
              
              return (
                <div key={strategy.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{strategy.name}</h4>
                      <Badge variant={isActive ? "default" : "outline"}>
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {perf && perf.successRate > 0.8 && (
                        <Badge className="bg-green-100 text-green-800">
                          {formatPercentage(perf.successRate)} success
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {strategy.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Range: ±{strategy.parameters.targetRange}%</span>
                      <span>Threshold: {formatPercentage(strategy.parameters.rebalanceThreshold)}</span>
                      <span>Max Slippage: {strategy.parameters.maxSlippage}%</span>
                      {perf && (
                        <span className="text-green-600">
                          Profit: {formatCurrency(perf.totalProfit)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleStrategy(strategy.id)}
                    className={isActive ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {isActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Enable
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Strategy Recommendations
              {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-saros-primary" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.slice(0, 5).map((rec, index) => {
                const position = positions.find(p => p.id === rec.positionId)
                const poolName = position ? `${position.tokenX.symbol}/${position.tokenY.symbol}` : 'Unknown'
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{poolName}</h4>
                        <Badge variant="outline" className="capitalize">
                          {rec.action}
                        </Badge>
                        <Badge 
                          className={`${
                            rec.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                            rec.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {formatPercentage(rec.confidence)} confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {rec.reasoning}
                      </p>
                      <div className="text-xs text-green-600">
                        Estimated profit: {formatCurrency(rec.estimatedProfit)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {rec.confidence > 0.8 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : rec.confidence > 0.6 ? (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => executeRecommendation(rec)}
                        disabled={rec.confidence < 0.6}
                      >
                        Execute
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <RebalanceModal
        isOpen={showRebalance}
        onClose={() => {
          setShowRebalance(false)
          setSelectedPosition(null)
        }}
        position={selectedPosition || undefined}
        onSuccess={() => {
          refreshPositions()
          analyzePositions()
        }}
      />

      <LimitOrderModal
        isOpen={showLimitOrder}
        onClose={() => setShowLimitOrder(false)}
        onSuccess={() => {
          refreshPositions()
          analyzePositions()
        }}
      />
    </div>
  )
}