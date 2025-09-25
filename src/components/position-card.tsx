'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  MoreVertical, 
  ExternalLink,
  Settings,
  Zap,
  DollarSign,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { DLMMPosition, PositionAnalytics } from '@/lib/types'
import { 
  formatCurrency, 
  formatPercentage, 
  formatTokenAmount,
  formatAddress,
  formatDuration
} from '@/lib/utils/format'
import { calculatePositionAnalytics, calculatePositionValue } from '@/lib/dlmm/utils'
import { cardHover, buttonTap, fadeInUp } from '@/lib/animations'
import { AnimatedNumber } from '@/components/animations/animated-number'
import { PriceDisplay } from '@/components/oracle/price-display'

interface PositionCardProps {
  position: DLMMPosition
  analytics: PositionAnalytics
  onManage?: (position: DLMMPosition) => void
  onRebalance?: (position: DLMMPosition) => void
  onClose?: (position: DLMMPosition) => void
}

const PositionCard = memo(function PositionCard({
  position,
  analytics,
  onManage,
  onRebalance,
  onClose
}: PositionCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const poolName = useMemo(() =>
    `${position.tokenX.symbol}/${position.tokenY.symbol}`,
    [position.tokenX.symbol, position.tokenY.symbol]
  )

  const isProfit = useMemo(() =>
    analytics.pnl.amount > 0,
    [analytics.pnl.amount]
  )

  const hasHighIL = useMemo(() =>
    analytics.impermanentLoss.percentage > 0.05,
    [analytics.impermanentLoss.percentage]
  )

  const explorerUrl = useMemo(() =>
    `https://explorer.solana.com/address/${position.poolAddress.toString()}?cluster=devnet`,
    [position.poolAddress]
  )

  const handleDetailsToggle = useCallback(() => {
    setShowDetails(prev => !prev)
  }, [])

  const handleExplorerClick = useCallback(() => {
    window.open(explorerUrl, '_blank')
  }, [explorerUrl])

  const handleManage = useCallback(() => {
    onManage?.(position)
  }, [onManage, position])

  const handleRebalance = useCallback(() => {
    onRebalance?.(position)
  }, [onRebalance, position])

  const handleClose = useCallback(() => {
    onClose?.(position)
  }, [onClose, position])

  return (
    <motion.div
      className="position-card"
      variants={cardHover}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      layout
    >
      <Card className="h-full border-0 shadow-md">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex -space-x-1 sm:-space-x-2 flex-shrink-0">
              {position.tokenX.logoURI && (
                <img 
                  src={position.tokenX.logoURI} 
                  alt={position.tokenX.symbol}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-background"
                />
              )}
              {position.tokenY.logoURI && (
                <img 
                  src={position.tokenY.logoURI} 
                  alt={position.tokenY.symbol}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-background"
                />
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg font-semibold truncate">{poolName}</CardTitle>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <span className="truncate max-w-[120px] sm:max-w-none">{formatAddress(position.poolAddress.toString())}</span>
                <button
                  onClick={handleExplorerClick}
                  className="hover:text-foreground transition-colors flex-shrink-0"
                >
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 flex-shrink-0">
            <Badge 
              variant={position.isActive ? "default" : "secondary"}
              className={`text-xs ${position.isActive ? "bg-green-100 text-green-800" : ""}`}
            >
              {position.isActive ? "Active" : "Inactive"}
            </Badge>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Value</p>
            <div className="text-lg sm:text-xl font-bold">
              <AnimatedNumber
                value={analytics.totalValue}
                prefix="$"
                decimals={2}
                className="text-lg sm:text-xl font-bold"
                animateOnChange={true}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">P&L (24h)</p>
            <div className={`flex items-center gap-1 text-lg sm:text-xl font-bold ${
              isProfit ? 'text-green-600' : 'text-red-600'
            }`}>
              {isProfit ? (
                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              ) : (
                <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              )}
              <AnimatedNumber
                value={Math.abs(analytics.pnl.amount)}
                prefix="$"
                decimals={2}
                className="truncate"
                animateOnChange={true}
                showPriceChange={true}
              />
              <span className="text-xs sm:text-sm whitespace-nowrap">
                (
                <AnimatedNumber
                  value={Math.abs(analytics.pnl.percentage) * 100}
                  suffix="%"
                  decimals={1}
                  animateOnChange={true}
                />
                )
              </span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 p-2 sm:p-3 bg-muted/30 rounded-lg">
          <div className="flex sm:flex-col items-center sm:text-center gap-2 sm:gap-1">
            <div className="flex items-center gap-1 text-base sm:text-lg font-semibold text-saros-primary">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{formatCurrency(analytics.feesEarned)}</span>
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap">Fees Earned</p>
          </div>
          
          <div className="flex sm:flex-col items-center sm:text-center gap-2 sm:gap-1">
            <div className="flex items-center gap-1 text-base sm:text-lg font-semibold text-saros-secondary">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{formatPercentage(analytics.apr)}</span>
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap">APR</p>
          </div>
          
          <div className="flex sm:flex-col items-center sm:text-center gap-2 sm:gap-1">
            <div className="flex items-center gap-1 text-base sm:text-lg font-semibold">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{formatDuration(analytics.duration)}</span>
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap">Duration</p>
          </div>
        </div>

        {/* Impermanent Loss Warning */}
        {hasHighIL && (
          <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-200">
                High Impermanent Loss
              </span>
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
              IL: {formatPercentage(analytics.impermanentLoss.percentage)} 
              ({formatCurrency(analytics.impermanentLoss.amount)})
            </p>
          </div>
        )}

        {/* Position Details Toggle */}
        <div className="space-y-3">
          <button
            onClick={handleDetailsToggle}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
            <TrendingUp className={`h-3 w-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>

          {showDetails && (
            <div className="space-y-3 pt-3 border-t border-border">
              {/* Active Bin Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Active Bin:</span>
                  <span className="ml-2 font-medium">{position.activeBin}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Liquidity:</span>
                  <span className="ml-2 font-medium">
                    {formatTokenAmount(position.liquidityAmount, 9)}
                  </span>
                </div>
              </div>

              {/* Token Balances with Oracle Prices */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Token Prices</h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{position.tokenX.symbol} Price:</span>
                    <PriceDisplay
                      symbol={position.tokenX.symbol}
                      enableRealtime={true}
                      showSource={false}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{position.tokenY.symbol} Price:</span>
                    <PriceDisplay
                      symbol={position.tokenY.symbol}
                      enableRealtime={true}
                      showSource={false}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Fees Breakdown */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Fees Earned</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{position.tokenX.symbol}:</span>
                    <span>{formatTokenAmount(position.feesEarned.tokenX, position.tokenX.decimals)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{position.tokenY.symbol}:</span>
                    <span>{formatTokenAmount(position.feesEarned.tokenY, position.tokenY.decimals)}</span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <span>Created:</span>
                  <div className="font-medium text-foreground">
                    {position.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span>Updated:</span>
                  <div className="font-medium text-foreground">
                    {position.lastUpdated.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <motion.div
            className="flex-1"
            whileTap="tap"
            variants={buttonTap}
          >
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={handleManage}
            >
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Button>
          </motion.div>

          <motion.div
            className="flex-1"
            whileTap="tap"
            variants={buttonTap}
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleRebalance}
            >
              <Zap className="h-4 w-4 mr-1" />
              Rebalance
            </Button>
          </motion.div>

          <motion.div
            whileTap="tap"
            variants={buttonTap}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Close
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  )
})

export { PositionCard }