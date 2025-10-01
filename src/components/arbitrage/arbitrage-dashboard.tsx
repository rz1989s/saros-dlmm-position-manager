'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowUpDown,
  Eye,
  EyeOff,
  Play,
  Pause,
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Activity,
  Target,
  BarChart3,
  Settings
} from 'lucide-react'
import { useWalletState } from '@/hooks/use-wallet-integration'
import { ArbitrageOpportunity, ArbitrageManager } from '@/lib/dlmm/arbitrage'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import { ArbitrageOpportunityCard } from './arbitrage-opportunity-card'
import { ArbitrageSettingsModal } from './arbitrage-settings-modal'
import { ArbitrageExecutionModal } from './arbitrage-execution-modal'

export function ArbitrageDashboard() {
  const { isConnected, address } = useWalletState()

  // Dashboard state
  const [arbitrageManager] = useState<ArbitrageManager | null>(null)
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [systemStats, setSystemStats] = useState<any>({})
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Modal states
  const [showSettings, setShowSettings] = useState(false)
  const [showExecution, setShowExecution] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<ArbitrageOpportunity | null>(null)

  // Monitoring configuration
  const [config, setConfig] = useState({
    minProfitThreshold: 10,
    maxRiskScore: 0.7,
    enableMEVProtection: true,
    monitoringEnabled: true
  })

  // Initialize arbitrage system
  useEffect(() => {
    if (isConnected && address && !arbitrageManager) {
      // Would need actual connection and wallet instances
      console.log('Arbitrage system would initialize here with real connection and wallet')
    }
  }, [isConnected, address, arbitrageManager])

  // Refresh opportunities periodically
  useEffect(() => {
    if (arbitrageManager && isMonitoring) {
      const interval = setInterval(() => {
        refreshOpportunities()
        refreshStats()
      }, 5000) // 5 second intervals

      return () => clearInterval(interval)
    }
    return undefined
  }, [arbitrageManager, isMonitoring])

  const startMonitoring = async () => {
    if (!arbitrageManager) return

    setIsLoading(true)
    try {
      await arbitrageManager.startArbitrageSystem()
      setIsMonitoring(true)
      await refreshOpportunities()
      await refreshStats()
    } catch (error) {
      console.error('Failed to start arbitrage monitoring:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const stopMonitoring = async () => {
    if (!arbitrageManager) return

    setIsLoading(true)
    try {
      await arbitrageManager.stopArbitrageSystem()
      setIsMonitoring(false)
      setOpportunities([])
    } catch (error) {
      console.error('Failed to stop arbitrage monitoring:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshOpportunities = async () => {
    if (!arbitrageManager) return

    try {
      const activeOpps = arbitrageManager.getActiveOpportunities()
      setOpportunities(activeOpps)
    } catch (error) {
      console.error('Failed to refresh opportunities:', error)
    }
  }

  const refreshStats = async () => {
    if (!arbitrageManager) return

    try {
      const stats = arbitrageManager.getArbitrageStats()
      const health = arbitrageManager.getSystemHealth()
      setSystemStats({ ...stats, ...health })
    } catch (error) {
      console.error('Failed to refresh stats:', error)
    }
  }

  const executeOpportunity = async (opportunity: ArbitrageOpportunity, amount: number) => {
    if (!arbitrageManager) return

    try {
      const results = await arbitrageManager.executeArbitrage(opportunity, amount)
      console.log('Arbitrage executed:', results)

      // Refresh data
      await refreshOpportunities()
      await refreshStats()

      return results
    } catch (error) {
      console.error('Arbitrage execution failed:', error)
      throw error
    }
  }

  // Mock data for display when not connected
  const mockStats = {
    totalOpportunitiesDetected: 47,
    totalProfitRealized: 1247.32,
    averageExecutionTime: 8500,
    successRate: 0.94,
    mevProtectionEffectiveness: 0.89,
    monitored_pools: 12,
    active_opportunities: opportunities.length,
    total_profit_potential: opportunities.reduce((sum, opp) => sum + opp.profitability.netProfit, 0)
  }

  const displayStats = systemStats.status ? systemStats : mockStats

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ArrowUpDown className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground text-center">
            Connect your wallet to access cross-pool arbitrage opportunities
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Opportunities</p>
                <p className="text-2xl font-bold">{displayStats.active_opportunities || 0}</p>
                <p className="text-xs text-green-600">
                  {formatCurrency(displayStats.total_profit_potential || 0)} potential
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold">{formatCurrency(displayStats.totalProfitRealized || 0)}</p>
                <p className="text-xs text-blue-600">
                  {formatPercentage(displayStats.successRate || 0.94)} success rate
                </p>
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
                <p className="text-sm text-muted-foreground">Avg Execution</p>
                <p className="text-2xl font-bold">
                  {displayStats.averageExecutionTime ?
                    `${(displayStats.averageExecutionTime / 1000).toFixed(1)}s` : '8.5s'
                  }
                </p>
                <p className="text-xs text-orange-600">
                  MEV Protection: {formatPercentage(displayStats.mevProtectionEffectiveness || 0.89)}
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monitored Pools</p>
                <p className="text-2xl font-bold">{displayStats.monitored_pools || 12}</p>
                <p className="text-xs text-blue-600">
                  {displayStats.totalOpportunitiesDetected || 47} opportunities detected
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Arbitrage System Control
            <div className="flex items-center gap-2">
              <Badge variant={isMonitoring ? "default" : "outline"}>
                {isMonitoring ? (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Monitoring
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Stopped
                  </>
                )}
              </Badge>
              {config.enableMEVProtection && (
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  MEV Protected
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Min Profit: {formatCurrency(config.minProfitThreshold)}</span>
                <span>Max Risk: {formatPercentage(config.maxRiskScore)}</span>
                <span>MEV Protection: {config.enableMEVProtection ? 'Enabled' : 'Disabled'}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isMonitoring
                  ? 'System is actively monitoring for arbitrage opportunities across all tracked pools'
                  : 'System is stopped. Start monitoring to detect arbitrage opportunities'
                }
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshOpportunities}
                disabled={!isMonitoring || isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                disabled={isLoading}
                className={isMonitoring ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                ) : isMonitoring ? (
                  <Pause className="h-4 w-4 mr-1" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arbitrage Opportunities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Active Opportunities
            {opportunities.length > 0 && (
              <Badge className="bg-green-100 text-green-800">
                {opportunities.length} found
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Auto-refresh: {isMonitoring ? 'On' : 'Off'}
            </span>
            {isMonitoring && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {opportunities.length > 0 ? (
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <ArbitrageOpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onExecute={() => {
                    setSelectedOpportunity(opportunity)
                    setShowExecution(true)
                  }}
                  onAnalyze={() => {
                    console.log('Analyze opportunity:', opportunity.id)
                  }}
                />
              ))}
            </div>
          ) : isMonitoring ? (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Scanning for Opportunities</h3>
              <p className="text-muted-foreground">
                The system is actively monitoring {displayStats.monitored_pools || 12} pools for profitable arbitrage opportunities
              </p>
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-saros-primary rounded-full"></div>
                  <div className="w-2 h-2 bg-saros-primary rounded-full"></div>
                  <div className="w-2 h-2 bg-saros-primary rounded-full"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <EyeOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Monitoring Stopped</h3>
              <p className="text-muted-foreground">
                Start monitoring to scan for arbitrage opportunities across DLMM pools
              </p>
              <Button
                className="mt-4"
                onClick={startMonitoring}
                disabled={isLoading}
              >
                <Play className="h-4 w-4 mr-1" />
                Start Monitoring
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mock recent executions */}
            {[
              {
                id: '1',
                type: 'direct',
                pair: 'SOL/USDC',
                profit: 23.45,
                time: '2 minutes ago',
                status: 'success',
                executionTime: 7200
              },
              {
                id: '2',
                type: 'triangular',
                pair: 'SOL/USDT/USDC',
                profit: 15.67,
                time: '8 minutes ago',
                status: 'success',
                executionTime: 12400
              },
              {
                id: '3',
                type: 'direct',
                pair: 'USDC/USDT',
                profit: -2.34,
                time: '15 minutes ago',
                status: 'failed',
                executionTime: 0
              }
            ].map((execution) => (
              <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {execution.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{execution.pair}</span>
                      <Badge variant="outline" className="capitalize">
                        {execution.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {execution.time}
                      {execution.executionTime > 0 && (
                        <span className="ml-2">• {(execution.executionTime / 1000).toFixed(1)}s execution</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-medium ${
                    execution.profit > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {execution.profit > 0 ? '+' : ''}{formatCurrency(execution.profit)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {execution.status === 'success' ? 'Executed' : 'Failed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ArbitrageSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onSave={setConfig}
      />

      <ArbitrageExecutionModal
        isOpen={showExecution}
        onClose={() => {
          setShowExecution(false)
          setSelectedOpportunity(null)
        }}
        opportunity={selectedOpportunity}
        onExecute={executeOpportunity}
      />
    </div>
  )
}