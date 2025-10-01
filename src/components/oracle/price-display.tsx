'use client'

// Oracle Price Display Components
// 🔮 Real-time price indicators with confidence levels and data sources

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTokenPrice, useMultipleTokenPrices } from '@/hooks/use-oracle-prices'
import { formatCurrency, formatPercentage } from '@/lib/utils'

interface PriceDisplayProps {
  symbol: string
  enableRealtime?: boolean
  showSource?: boolean
  showConfidence?: boolean
  className?: string
}

/**
 * Single token price display with real-time updates
 */
export function PriceDisplay({
  symbol,
  enableRealtime = true,
  showSource = true,
  showConfidence = false,
  className
}: PriceDisplayProps) {
  const { priceData, loading, error } = useTokenPrice(symbol, enableRealtime)

  if (loading && !priceData) {
    return <Skeleton className={`h-6 w-20 ${className}`} />
  }

  if (error || !priceData) {
    return (
      <span className={`text-red-500 text-sm ${className}`}>
        Error loading price
      </span>
    )
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'pyth':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
      case 'switchboard':
        return 'bg-green-500/10 text-green-700 dark:text-green-300'
      case 'fallback':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.95) return 'text-green-600 dark:text-green-400'
    if (confidence >= 0.85) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="font-semibold">
        {formatCurrency(priceData.price)}
      </span>

      {showSource && (
        <Badge variant="outline" className={getSourceColor(priceData.source)}>
          {priceData.source.toUpperCase()}
        </Badge>
      )}

      {showConfidence && (
        <span className={`text-xs ${getConfidenceColor(priceData.confidence)}`}>
          {formatPercentage(priceData.confidence)}
        </span>
      )}
    </div>
  )
}

interface MultiPriceDisplayProps {
  symbols: string[]
  enableRealtime?: boolean
  layout?: 'horizontal' | 'vertical' | 'grid'
  className?: string
}

/**
 * Multiple token prices display
 */
export function MultiPriceDisplay({
  symbols,
  enableRealtime = true,
  layout = 'horizontal',
  className
}: MultiPriceDisplayProps) {
  const { priceData, loading } = useMultipleTokenPrices(symbols, enableRealtime)

  if (loading && Object.keys(priceData).length === 0) {
    return (
      <div className={`flex space-x-4 ${className}`}>
        {symbols.map((symbol) => (
          <Skeleton key={symbol} className="h-16 w-24" />
        ))}
      </div>
    )
  }

  const layoutClasses = {
    horizontal: 'flex flex-wrap gap-4',
    vertical: 'flex flex-col space-y-2',
    grid: 'grid grid-cols-2 md:grid-cols-3 gap-4'
  }

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {symbols.map((symbol) => {
        const price = priceData[symbol]

        if (!price) {
          return (
            <div key={symbol} className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
              <div className="font-medium text-red-700 dark:text-red-300">{symbol}</div>
              <div className="text-sm text-red-600">Price unavailable</div>
            </div>
          )
        }

        return (
          <div
            key={symbol}
            className="text-center p-3 bg-card border rounded-lg"
          >
            <div className="font-medium text-muted-foreground mb-1">{symbol}</div>
            <div className="text-lg font-bold">{formatCurrency(price.price)}</div>
            <div className="flex justify-center mt-1">
              <Badge variant="outline" className="text-xs">
                {price.source.toUpperCase()}
              </Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface PriceCardProps {
  symbol: string
  enableRealtime?: boolean
  showDetails?: boolean
}

/**
 * Detailed price card with timestamp and confidence
 */
export function PriceCard({
  symbol,
  enableRealtime = true,
  showDetails = true
}: PriceCardProps) {
  const { priceData, loading, error, lastUpdate } = useTokenPrice(symbol, enableRealtime)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{symbol} Price</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && !priceData ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        ) : error || !priceData ? (
          <div className="text-center py-4">
            <div className="text-red-500 mb-2">Failed to load price data</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-3xl font-bold">
              {formatCurrency(priceData.price)}
            </div>

            {showDetails && (
              <>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {priceData.source.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatPercentage(priceData.confidence)} confidence
                  </span>
                </div>

                {lastUpdate && (
                  <div className="text-xs text-muted-foreground">
                    Updated: {lastUpdate.toLocaleTimeString()}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface PriceComparisonProps {
  tokenA: string
  tokenB: string
  enableRealtime?: boolean
}

/**
 * Price comparison between two tokens
 */
export function PriceComparison({
  tokenA,
  tokenB,
  enableRealtime = true
}: PriceComparisonProps) {
  const { priceData, loading } = useMultipleTokenPrices([tokenA, tokenB], enableRealtime)

  const priceA = priceData[tokenA]
  const priceB = priceData[tokenB]
  const ratio = priceA && priceB ? priceA.price / priceB.price : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{tokenA}/{tokenB} Ratio</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-32" />
        ) : ratio > 0 ? (
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {ratio.toFixed(6)}
            </div>
            <div className="text-sm text-muted-foreground">
              1 {tokenA} = {ratio.toFixed(6)} {tokenB}
            </div>
            <div className="text-sm text-muted-foreground">
              1 {tokenB} = {(1 / ratio).toFixed(6)} {tokenA}
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground">Price data unavailable</div>
        )}
      </CardContent>
    </Card>
  )
}