'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Settings,
  DollarSign,
  Shield,
  AlertTriangle,
  Target,
  Zap,
  Activity,
  Eye
} from 'lucide-react'

interface ArbitrageConfig {
  minProfitThreshold: number
  maxRiskScore: number
  enableMEVProtection: boolean
  monitoringEnabled: boolean
}

interface ArbitrageSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  config: ArbitrageConfig
  onSave: (config: ArbitrageConfig) => void
}

interface AdvancedSettings {
  maxConcurrentExecutions: number
  executionTimeout: number
  slippageTolerance: number
  gasMultiplier: number
  priorityFeeMultiplier: number
  minLiquidityThreshold: number
  maxPriceImpact: number
  competitionAvoidance: boolean
  enablePredictiveMode: boolean
  autoRebalanceThreshold: number
}

export function ArbitrageSettingsModal({
  isOpen,
  onClose,
  config,
  onSave
}: ArbitrageSettingsModalProps) {
  const [localConfig, setLocalConfig] = useState<ArbitrageConfig>(config)
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    maxConcurrentExecutions: 3,
    executionTimeout: 30000,
    slippageTolerance: 0.01,
    gasMultiplier: 1.2,
    priorityFeeMultiplier: 1.5,
    minLiquidityThreshold: 10000,
    maxPriceImpact: 0.02,
    competitionAvoidance: true,
    enablePredictiveMode: true,
    autoRebalanceThreshold: 0.05
  })

  const [activeTab, setActiveTab] = useState<string>('general')

  // Reset local config when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config)
    }
  }, [isOpen, config])

  const handleSave = () => {
    onSave(localConfig)
    onClose()
  }

  const handleReset = () => {
    const defaultConfig: ArbitrageConfig = {
      minProfitThreshold: 10,
      maxRiskScore: 0.7,
      enableMEVProtection: true,
      monitoringEnabled: true
    }
    setLocalConfig(defaultConfig)

    const defaultAdvanced: AdvancedSettings = {
      maxConcurrentExecutions: 3,
      executionTimeout: 30000,
      slippageTolerance: 0.01,
      gasMultiplier: 1.2,
      priorityFeeMultiplier: 1.5,
      minLiquidityThreshold: 10000,
      maxPriceImpact: 0.02,
      competitionAvoidance: true,
      enablePredictiveMode: true,
      autoRebalanceThreshold: 0.05
    }
    setAdvancedSettings(defaultAdvanced)
  }

  const getEconomicAnalysis = () => {
    const dailyOpportunities = 50 // Estimated
    const avgProfit = localConfig.minProfitThreshold * 1.5
    const successRate = localConfig.enableMEVProtection ? 0.9 : 0.7
    const dailyProfit = dailyOpportunities * avgProfit * successRate
    const monthlyProfit = dailyProfit * 30

    return {
      estimatedDailyOpportunities: Math.floor(dailyOpportunities * (1 - localConfig.maxRiskScore * 0.5)),
      estimatedDailyProfit: dailyProfit,
      estimatedMonthlyProfit: monthlyProfit,
      riskAdjustedReturn: dailyProfit * (1 - localConfig.maxRiskScore)
    }
  }

  const analysis = getEconomicAnalysis()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Arbitrage System Configuration
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="risk">Risk & Security</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Opportunity Filtering
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minProfit">Minimum Profit Threshold</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="minProfit"
                        type="number"
                        value={localConfig.minProfitThreshold}
                        onChange={(e) => setLocalConfig(prev => ({
                          ...prev,
                          minProfitThreshold: parseFloat(e.target.value) || 0
                        }))}
                        min="0"
                        step="1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Only execute opportunities with profit above this amount
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxRisk">Maximum Risk Score</Label>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="maxRisk"
                        type="number"
                        value={localConfig.maxRiskScore}
                        onChange={(e) => setLocalConfig(prev => ({
                          ...prev,
                          maxRiskScore: parseFloat(e.target.value) || 0
                        }))}
                        min="0"
                        max="1"
                        step="0.1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Risk threshold from 0.0 (safe) to 1.0 (risky)
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">Real-time Monitoring</div>
                    <div className="text-sm text-muted-foreground">
                      Continuously scan for new arbitrage opportunities
                    </div>
                  </div>
                  <Switch
                    checked={localConfig.monitoringEnabled}
                    onCheckedChange={(checked) => setLocalConfig(prev => ({
                      ...prev,
                      monitoringEnabled: checked
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security & Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      MEV Protection
                      <Badge className="bg-blue-100 text-blue-800">Recommended</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Use private mempool and anti-MEV strategies
                    </div>
                  </div>
                  <Switch
                    checked={localConfig.enableMEVProtection}
                    onCheckedChange={(checked) => setLocalConfig(prev => ({
                      ...prev,
                      enableMEVProtection: checked
                    }))}
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Max Price Impact</Label>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={advancedSettings.maxPriceImpact * 100}
                          onChange={(e) => setAdvancedSettings(prev => ({
                            ...prev,
                            maxPriceImpact: (parseFloat(e.target.value) || 0) / 100
                          }))}
                          min="0"
                          max="10"
                          step="0.1"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Min Liquidity</Label>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={advancedSettings.minLiquidityThreshold}
                          onChange={(e) => setAdvancedSettings(prev => ({
                            ...prev,
                            minLiquidityThreshold: parseFloat(e.target.value) || 0
                          }))}
                          min="0"
                          step="1000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Competition Avoidance</div>
                      <div className="text-sm text-muted-foreground">
                        Add randomization to avoid MEV competition
                      </div>
                    </div>
                    <Switch
                      checked={advancedSettings.competitionAvoidance}
                      onCheckedChange={(checked) => setAdvancedSettings(prev => ({
                        ...prev,
                        competitionAvoidance: checked
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="execution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Execution Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Concurrent Executions</Label>
                    <Input
                      type="number"
                      value={advancedSettings.maxConcurrentExecutions}
                      onChange={(e) => setAdvancedSettings(prev => ({
                        ...prev,
                        maxConcurrentExecutions: parseInt(e.target.value) || 1
                      }))}
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Execution Timeout (seconds)</Label>
                    <Input
                      type="number"
                      value={advancedSettings.executionTimeout / 1000}
                      onChange={(e) => setAdvancedSettings(prev => ({
                        ...prev,
                        executionTimeout: (parseFloat(e.target.value) || 30) * 1000
                      }))}
                      min="10"
                      max="120"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Slippage Tolerance (%)</Label>
                    <Input
                      type="number"
                      value={advancedSettings.slippageTolerance * 100}
                      onChange={(e) => setAdvancedSettings(prev => ({
                        ...prev,
                        slippageTolerance: (parseFloat(e.target.value) || 1) / 100
                      }))}
                      min="0.1"
                      max="5"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gas Price Multiplier</Label>
                    <Input
                      type="number"
                      value={advancedSettings.gasMultiplier}
                      onChange={(e) => setAdvancedSettings(prev => ({
                        ...prev,
                        gasMultiplier: parseFloat(e.target.value) || 1
                      }))}
                      min="1"
                      max="5"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">Predictive Mode</div>
                    <div className="text-sm text-muted-foreground">
                      Use AI to predict and pre-position for opportunities
                    </div>
                  </div>
                  <Switch
                    checked={advancedSettings.enablePredictiveMode}
                    onCheckedChange={(checked) => setAdvancedSettings(prev => ({
                      ...prev,
                      enablePredictiveMode: checked
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Economic Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysis.estimatedDailyOpportunities}
                    </div>
                    <div className="text-sm text-muted-foreground">Daily Opportunities</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${analysis.estimatedDailyProfit.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Estimated Daily</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-saros-primary">
                      ${analysis.estimatedMonthlyProfit.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Estimated Monthly</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${analysis.riskAdjustedReturn.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Risk Adjusted</div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Configuration Impact:</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Profit Threshold Filter:</span>
                      <Badge variant="outline">
                        ~{Math.floor(50 * (10 / localConfig.minProfitThreshold))} daily opportunities
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span>Risk Score Impact:</span>
                      <Badge variant="outline">
                        {Math.floor((1 - localConfig.maxRiskScore) * 100)}% safer opportunities
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span>MEV Protection:</span>
                      <Badge variant={localConfig.enableMEVProtection ? "default" : "outline"}>
                        {localConfig.enableMEVProtection ? "~90% success rate" : "~70% success rate"}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Configuration Score:</strong> {Math.floor(
                        (localConfig.enableMEVProtection ? 30 : 10) +
                        (localConfig.minProfitThreshold <= 20 ? 25 : 15) +
                        (localConfig.maxRiskScore <= 0.7 ? 25 : 15) +
                        (advancedSettings.competitionAvoidance ? 20 : 10)
                      )}/100 (Balanced)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}