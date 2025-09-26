'use client'

// Portfolio Aggregation Hooks
// 📊 React hooks for multi-position portfolio management and analysis

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  portfolioAggregationManager,
  type PortfolioPosition,
  type PortfolioSummary,
  type ConsolidationOpportunity,
  type DiversificationAnalysis
} from '@/lib/dlmm/portfolio-aggregation'
import type { DLMMPosition, PositionAnalytics } from '@/lib/types'
import { REFRESH_INTERVALS } from '@/lib/constants'

/**
 * Hook for aggregating positions by token pairs
 */
export function usePortfolioAggregation(
  positions: DLMMPosition[] = [],
  enableRealtime: boolean = false
) {
  const { publicKey } = useWallet()
  const [portfolioPositions, setPortfolioPositions] = useState<PortfolioPosition[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const aggregatePositions = useCallback(async () => {
    if (!publicKey || positions.length === 0) {
      setPortfolioPositions([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('📊 Portfolio Aggregation: Processing', positions.length, 'positions')

      const aggregated = await portfolioAggregationManager.aggregatePositionsByPair(
        positions,
        publicKey
      )

      console.log('✅ Portfolio Aggregation: Aggregated into', aggregated.length, 'portfolio positions')

      setPortfolioPositions(aggregated)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('❌ Portfolio Aggregation: Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to aggregate portfolio positions')
      setPortfolioPositions([])
    } finally {
      setLoading(false)
    }
  }, [positions, publicKey])

  // Initial aggregation
  useEffect(() => {
    aggregatePositions()
  }, [aggregatePositions])

  // Real-time updates
  useEffect(() => {
    if (enableRealtime && positions.length > 0 && !loading) {
      intervalRef.current = setInterval(() => {
        aggregatePositions()
      }, REFRESH_INTERVALS.analytics) // 60 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }

    // Return undefined for the else case to satisfy TS7030
    return undefined
  }, [enableRealtime, positions.length, loading, aggregatePositions])

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    portfolioPositions,
    loading,
    error,
    lastUpdate,
    refreshAggregation: aggregatePositions
  }
}

/**
 * Hook for comprehensive portfolio summary
 */
export function usePortfolioSummary(
  positions: DLMMPosition[] = [],
  analytics: PositionAnalytics[] = []
) {
  const { publicKey } = useWallet()
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const generateSummary = useCallback(async () => {
    if (!publicKey || positions.length === 0) {
      setSummary(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('📊 Portfolio Summary: Generating summary for', positions.length, 'positions')

      const portfolioSummary = await portfolioAggregationManager.generatePortfolioSummary(
        positions,
        analytics,
        publicKey
      )

      console.log('✅ Portfolio Summary: Generated successfully:', {
        totalValue: portfolioSummary.totalValue.toFixed(2),
        pairs: portfolioSummary.diversifiedPairs,
        avgApr: portfolioSummary.performanceMetrics.avgApr.toFixed(2) + '%'
      })

      setSummary(portfolioSummary)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('❌ Portfolio Summary: Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate portfolio summary')
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [positions, analytics, publicKey])

  useEffect(() => {
    generateSummary()
  }, [generateSummary])

  return {
    summary,
    loading,
    error,
    lastUpdate,
    refreshSummary: generateSummary
  }
}

/**
 * Hook for consolidation opportunities
 */
export function useConsolidationOpportunities(
  positions: DLMMPosition[] = []
) {
  const { publicKey } = useWallet()
  const [opportunities, setOpportunities] = useState<ConsolidationOpportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const identifyOpportunities = useCallback(async () => {
    if (!publicKey || positions.length === 0) {
      setOpportunities([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Consolidation: Identifying opportunities for', positions.length, 'positions')

      const consolidationOps = await portfolioAggregationManager.identifyConsolidationOpportunities(
        positions,
        publicKey
      )

      console.log('✅ Consolidation: Found', consolidationOps.length, 'opportunities')

      setOpportunities(consolidationOps)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('❌ Consolidation: Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to identify consolidation opportunities')
      setOpportunities([])
    } finally {
      setLoading(false)
    }
  }, [positions, publicKey])

  useEffect(() => {
    identifyOpportunities()
  }, [identifyOpportunities])

  return {
    opportunities,
    loading,
    error,
    lastUpdate,
    refreshOpportunities: identifyOpportunities
  }
}

/**
 * Hook for portfolio diversification analysis
 */
export function useDiversificationAnalysis(
  positions: DLMMPosition[] = []
) {
  const [analysis, setAnalysis] = useState<DiversificationAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeDiversification = useCallback(() => {
    if (positions.length === 0) {
      setAnalysis(null)
      return
    }

    setLoading(true)

    try {
      console.log('📊 Diversification: Analyzing', positions.length, 'positions')

      const diversificationAnalysis = portfolioAggregationManager.analyzeDiversification(positions)

      console.log('✅ Diversification: Analysis complete, score:', diversificationAnalysis.overallScore.toFixed(1))

      setAnalysis(diversificationAnalysis)
    } catch (err) {
      console.error('❌ Diversification: Error:', err)
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }, [positions])

  useEffect(() => {
    analyzeDiversification()
  }, [analyzeDiversification])

  return {
    analysis,
    loading,
    refreshAnalysis: analyzeDiversification
  }
}

/**
 * Hook for portfolio insights and metrics
 */
export function usePortfolioInsights(
  portfolioPositions: PortfolioPosition[] = [],
  summary: PortfolioSummary | null = null,
  opportunities: ConsolidationOpportunity[] = [],
  diversificationAnalysis: DiversificationAnalysis | null = null
) {
  const insights = {
    // Position insights
    totalAggregatedPositions: portfolioPositions.length,
    positionsPerPair: portfolioPositions.length > 0
      ? portfolioPositions.reduce((sum, pp) => sum + pp.aggregatedMetrics.positionCount, 0) / portfolioPositions.length
      : 0,

    // Value insights
    largestPosition: portfolioPositions.reduce((largest, current) =>
      current.aggregatedMetrics.totalValue > (largest?.aggregatedMetrics.totalValue || 0) ? current : largest,
      null as PortfolioPosition | null
    ),

    // Risk insights
    highRiskPositions: portfolioPositions.filter(pp => pp.riskMetrics.overallRiskScore > 70).length,
    averageRiskScore: portfolioPositions.length > 0
      ? portfolioPositions.reduce((sum, pp) => sum + pp.riskMetrics.overallRiskScore, 0) / portfolioPositions.length
      : 0,

    // Optimization insights
    consolidationPotential: opportunities.length,
    highPriorityConsolidations: opportunities.filter(opp => opp.priority === 'high').length,
    totalPotentialSavings: opportunities.reduce((sum, opp) => sum + opp.projectedSavings, 0),

    // Diversification insights
    diversificationScore: diversificationAnalysis?.overallScore || 0,
    diversificationLevel: diversificationAnalysis?.overallScore
      ? diversificationAnalysis.overallScore > 75 ? 'excellent'
        : diversificationAnalysis.overallScore > 50 ? 'good'
        : diversificationAnalysis.overallScore > 25 ? 'fair'
        : 'poor'
      : 'unknown',

    // Performance insights
    topPerformingPair: summary?.topPerformingPairs[0] || null,
    totalPortfolioValue: summary?.totalValue || 0,
    portfolioApr: summary?.performanceMetrics.avgApr || 0,

    // Action items
    recommendedActions: [
      ...(opportunities.filter(opp => opp.priority === 'high').length > 0
        ? [`Consolidate ${opportunities.filter(opp => opp.priority === 'high').length} high-priority positions`]
        : []
      ),
      ...(diversificationAnalysis?.overallScore && diversificationAnalysis.overallScore < 50
        ? ['Improve portfolio diversification']
        : []
      ),
      ...(portfolioPositions.filter(pp => pp.riskMetrics.overallRiskScore > 70).length > 0
        ? ['Review high-risk positions']
        : []
      )
    ]
  }

  return insights
}

/**
 * Hook for portfolio cache management
 */
export function usePortfolioCache() {
  const [cacheStats, setCacheStats] = useState(portfolioAggregationManager.getCacheStats())

  const refreshCacheStats = useCallback(() => {
    setCacheStats(portfolioAggregationManager.getCacheStats())
  }, [])

  const clearCache = useCallback(() => {
    console.log('🧹 Portfolio Cache: Manual clear')
    portfolioAggregationManager.clearCache()
    refreshCacheStats()
  }, [refreshCacheStats])

  // Refresh cache stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshCacheStats, 30000)
    return () => clearInterval(interval)
  }, [refreshCacheStats])

  return {
    cacheStats,
    refreshCacheStats,
    clearCache
  }
}

/**
 * Combined hook for comprehensive portfolio management
 */
export function useComprehensivePortfolioManagement(
  positions: DLMMPosition[] = [],
  analytics: PositionAnalytics[] = [],
  enableRealtime: boolean = false
) {
  const { portfolioPositions, loading: aggregationLoading, error: aggregationError } = usePortfolioAggregation(
    positions,
    enableRealtime
  )

  const { summary, loading: summaryLoading, error: summaryError } = usePortfolioSummary(
    positions,
    analytics
  )

  const { opportunities, loading: opportunitiesLoading, error: opportunitiesError } = useConsolidationOpportunities(
    positions
  )

  const { analysis: diversificationAnalysis, loading: diversificationLoading } = useDiversificationAnalysis(
    positions
  )

  const insights = usePortfolioInsights(
    portfolioPositions,
    summary,
    opportunities,
    diversificationAnalysis
  )

  const { cacheStats } = usePortfolioCache()

  const loading = aggregationLoading || summaryLoading || opportunitiesLoading || diversificationLoading
  const error = aggregationError || summaryError || opportunitiesError

  return {
    portfolioPositions,
    summary,
    opportunities,
    diversificationAnalysis,
    insights,
    cacheStats,
    loading,
    error,
    hasData: portfolioPositions.length > 0 && summary !== null,
    hasOptimizationOpportunities: opportunities.length > 0 || (insights.diversificationScore < 50)
  }
}