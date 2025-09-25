'use client'

// Fee Tier Selector Components
// 💰 Interactive fee tier selection and optimization UI

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Settings,
  Sparkles
} from 'lucide-react'
import {
  useComprehensiveFeeManagement,
  useMigrationImpact,
  useCustomFeeTier
} from '@/hooks/use-fee-optimization'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import type { FeeTier, FeeOptimizationSettings } from '@/lib/dlmm/fee-tiers'

interface FeeTierSelectorProps {
  poolAddress?: string
  liquidityAmount?: string
  tokenPair?: string
  currentTier?: FeeTier
  onTierSelect?: (tier: FeeTier) => void
  className?: string
}

export function FeeTierSelector({
  poolAddress,
  liquidityAmount,
  tokenPair,
  currentTier,
  onTierSelect,
  className
}: FeeTierSelectorProps) {
  const [settings, setSettings] = useState<FeeOptimizationSettings>({
    riskTolerance: 'moderate',
    liquidityRange: 'moderate',
    rebalanceFrequency: 'daily',
    maxSlippage: 0.01,
    prioritizeFees: true
  })

  const [selectedTier, setSelectedTier] = useState<FeeTier | null>(null)
  const [showMigrationDialog, setShowMigrationDialog] = useState(false)

  const {
    analysis,
    feeTiers,
    recommendations,
    loading,
    error
  } = useComprehensiveFeeManagement(
    poolAddress,
    liquidityAmount,
    tokenPair,
    settings
  )

  const { impact: migrationImpact, loading: impactLoading } = useMigrationImpact(
    currentTier,
    selectedTier || undefined,
    liquidityAmount,
    '10000' // Mock 24h volume
  )

  const handleTierSelect = (tier: FeeTier) => {
    setSelectedTier(tier)
    if (currentTier && tier.id !== currentTier.id) {
      setShowMigrationDialog(true)
    } else {
      onTierSelect?.(tier)
    }
  }

  const confirmMigration = () => {
    if (selectedTier) {
      onTierSelect?.(selectedTier)
    }
    setShowMigrationDialog(false)
  }

  const getTierCategoryIcon = (category: string) => {
    switch (category) {
      case 'stable':
        return <Shield className="h-4 w-4" />
      case 'volatile':
        return <TrendingUp className="h-4 w-4" />
      case 'exotic':
        return <Sparkles className="h-4 w-4" />
      case 'custom':
        return <Settings className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getTierCategoryColor = (category: string) => {
    switch (category) {
      case 'stable':
        return 'bg-green-500/10 text-green-700 dark:text-green-300'
      case 'volatile':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
      case 'exotic':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
      case 'custom':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Fee Tier Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load fee tiers</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fee Tier Optimization
            </CardTitle>
            {analysis?.recommendedTier && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                <Zap className="h-3 w-3 mr-1" />
                Savings Available
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="tiers" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tiers">Available Tiers</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="tiers" className="space-y-4">
              {/* Current Analysis */}
              {analysis && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Analysis</span>
                    {analysis.recommendedTier && (
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Optimization Available
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Tier:</span>
                      <div className="font-medium">{analysis.currentTier.name}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Daily Savings:</span>
                      <div className="font-medium text-green-600">
                        {formatCurrency(analysis.potentialSavings)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Break-even:</span>
                      <div className="font-medium">
                        {analysis.optimization.timeToBreakeven.toFixed(1)} days
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fee Tiers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feeTiers.map((tier) => {
                  const isCurrentTier = currentTier?.id === tier.id
                  const isRecommended = analysis?.recommendedTier?.id === tier.id

                  return (
                    <motion.div
                      key={tier.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all ${
                          isCurrentTier
                            ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                            : isRecommended
                            ? 'ring-2 ring-green-500 bg-green-50/50 dark:bg-green-900/20'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleTierSelect(tier)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getTierCategoryIcon(tier.category)}
                              <span className="font-medium">{tier.name}</span>
                            </div>
                            {isCurrentTier && (
                              <Badge variant="secondary" className="text-xs">
                                Current
                              </Badge>
                            )}
                            {isRecommended && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                <Zap className="h-3 w-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Fee Rate:</span>
                              <span className="font-semibold">
                                {(tier.totalFeeBps / 100).toFixed(2)}%
                              </span>
                            </div>

                            <Badge
                              variant="outline"
                              className={getTierCategoryColor(tier.category)}
                            >
                              {tier.category.toUpperCase()}
                            </Badge>

                            <p className="text-xs text-muted-foreground">
                              {tier.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <Card
                      key={rec.tier.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        index === 0 ? 'ring-1 ring-green-500 bg-green-50/30 dark:bg-green-900/10' : ''
                      }`}
                      onClick={() => handleTierSelect(rec.tier)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTierCategoryIcon(rec.tier.category)}
                            <span className="font-medium">{rec.tier.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`${
                                rec.confidence >= 0.8
                                  ? 'bg-green-100 text-green-800 border-green-300'
                                  : rec.confidence >= 0.6
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                  : 'bg-gray-100 text-gray-800 border-gray-300'
                              }`}
                            >
                              {formatPercentage(rec.confidence)} confidence
                            </Badge>
                            {index === 0 && (
                              <Badge className="bg-green-600 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Best Match
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <p>No recommendations available</p>
                  <p className="text-sm">Provide token pair and liquidity amount for analysis</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Risk Tolerance</Label>
                  <Select
                    value={settings.riskTolerance}
                    onValueChange={(value: any) =>
                      setSettings(prev => ({ ...prev, riskTolerance: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Liquidity Range Strategy</Label>
                  <Select
                    value={settings.liquidityRange}
                    onValueChange={(value: any) =>
                      setSettings(prev => ({ ...prev, liquidityRange: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight Range</SelectItem>
                      <SelectItem value="moderate">Moderate Range</SelectItem>
                      <SelectItem value="wide">Wide Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Slippage: {formatPercentage(settings.maxSlippage)}</Label>
                  <Slider
                    value={[settings.maxSlippage * 100]}
                    onValueChange={([value]) =>
                      setSettings(prev => ({ ...prev, maxSlippage: value / 100 }))
                    }
                    max={5}
                    min={0.1}
                    step={0.1}
                    className="py-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Prioritize Fee Optimization</Label>
                    <p className="text-sm text-muted-foreground">
                      Focus on minimizing fees over other factors
                    </p>
                  </div>
                  <Switch
                    checked={settings.prioritizeFees}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, prioritizeFees: checked }))
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Migration Confirmation Dialog */}
      <Dialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Fee Tier Migration</DialogTitle>
            <DialogDescription>
              You're about to change from {currentTier?.name} to {selectedTier?.name}.
              Review the impact below before confirming.
            </DialogDescription>
          </DialogHeader>

          {impactLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : migrationImpact ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Migration Cost:</span>
                  <div className="font-semibold text-red-600">
                    {formatCurrency(migrationImpact.migrationCost)}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Daily Savings:</span>
                  <div className={`font-semibold ${
                    migrationImpact.dailySavings > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {migrationImpact.dailySavings > 0 ? '+' : ''}
                    {formatCurrency(migrationImpact.dailySavings)}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Break-even Time:</span>
                  <div className="font-semibold">
                    {migrationImpact.breakEvenDays === Infinity
                      ? 'Never'
                      : `${migrationImpact.breakEvenDays.toFixed(1)} days`
                    }
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Annual Benefit:</span>
                  <div className={`font-semibold ${
                    migrationImpact.annualBenefit > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {migrationImpact.annualBenefit > 0 ? '+' : ''}
                    {formatCurrency(migrationImpact.annualBenefit)}
                  </div>
                </div>
              </div>

              {migrationImpact.dailySavings <= 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Higher Fee Tier
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This migration will increase your daily fees. Consider if the benefits justify the higher costs.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Unable to calculate migration impact
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMigrationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmMigration}
              className={migrationImpact?.dailySavings && migrationImpact.dailySavings > 0 ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {migrationImpact?.dailySavings && migrationImpact.dailySavings > 0 ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              Confirm Migration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}