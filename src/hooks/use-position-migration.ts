'use client'

// Position Migration Hooks
// 🔄 React hooks for cross-pool position migration and management

import { useState, useEffect, useCallback, useRef } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  positionMigrationManager,
  type CrossPoolOpportunity,
  type MigrationPlan,
  type MigrationProgress
} from '@/lib/dlmm/position-migration'
import type { DLMMPosition } from '@/lib/types'

/**
 * Hook for analyzing migration opportunities
 */
export function useMigrationOpportunities(
  positions: DLMMPosition[] = [],
  enableRealtime: boolean = false
) {
  const { publicKey } = useWallet()
  const [opportunities, setOpportunities] = useState<CrossPoolOpportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const analyzeOpportunities = useCallback(async () => {
    if (!publicKey || positions.length === 0) {
      setOpportunities([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Migration Analysis: Analyzing opportunities for', positions.length, 'positions')

      const migrationOpportunities = await positionMigrationManager.analyzeMigrationOpportunities(
        positions,
        publicKey
      )

      console.log('✅ Migration Analysis: Found', migrationOpportunities.length, 'opportunities')

      setOpportunities(migrationOpportunities)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('❌ Migration Analysis: Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze migration opportunities')
      setOpportunities([])
    } finally {
      setLoading(false)
    }
  }, [positions, publicKey])

  // Initial analysis
  useEffect(() => {
    analyzeOpportunities()
  }, [analyzeOpportunities])

  // Real-time updates
  useEffect(() => {
    if (enableRealtime && positions.length > 0 && !loading) {
      intervalRef.current = setInterval(() => {
        analyzeOpportunities()
      }, 300000) // 5 minutes

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [enableRealtime, positions.length, loading, analyzeOpportunities])

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    opportunities,
    loading,
    error,
    lastUpdate,
    refreshOpportunities: analyzeOpportunities
  }
}

/**
 * Hook for creating and managing migration plans
 */
export function useMigrationPlan() {
  const { publicKey } = useWallet()
  const [plan, setPlan] = useState<MigrationPlan | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPlan = useCallback(async (
    opportunities: CrossPoolOpportunity[],
    preferences: {
      riskTolerance: 'conservative' | 'moderate' | 'aggressive'
      maxGasCost: number
      prioritizeSpeed: boolean
      consolidatePositions: boolean
    }
  ) => {
    if (!publicKey) {
      throw new Error('Wallet not connected')
    }

    setCreating(true)
    setError(null)

    try {
      console.log('📋 Migration Plan: Creating plan for', opportunities.length, 'opportunities')

      const migrationPlan = await positionMigrationManager.createMigrationPlan(
        opportunities,
        publicKey,
        preferences
      )

      console.log('✅ Migration Plan: Created successfully:', {
        routes: migrationPlan.routes.length,
        steps: migrationPlan.steps.length,
        estimatedDuration: migrationPlan.estimatedDuration.toFixed(1) + ' minutes'
      })

      setPlan(migrationPlan)
      return migrationPlan
    } catch (err) {
      console.error('❌ Migration Plan: Error creating plan:', err)
      setError(err instanceof Error ? err.message : 'Failed to create migration plan')
      throw err
    } finally {
      setCreating(false)
    }
  }, [publicKey])

  const clearPlan = useCallback(() => {
    setPlan(null)
    setError(null)
  }, [])

  return {
    plan,
    creating,
    error,
    createPlan,
    clearPlan
  }
}

/**
 * Hook for executing migration plans with progress tracking
 */
export function useMigrationExecution() {
  const { publicKey } = useWallet()
  const [progress, setProgress] = useState<MigrationProgress | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executePlan = useCallback(async (plan: MigrationPlan) => {
    if (!publicKey) {
      throw new Error('Wallet not connected')
    }

    setIsExecuting(true)
    setError(null)

    try {
      console.log('🚀 Migration Execution: Starting plan execution:', plan.id)

      const executionProgress = await positionMigrationManager.executeMigrationPlan(
        plan,
        publicKey,
        (progress) => {
          console.log('📈 Migration Progress:', {
            step: `${progress.currentStep}/${progress.totalSteps}`,
            status: progress.status
          })
          setProgress({ ...progress })
        }
      )

      console.log('✅ Migration Execution: Completed:', {
        status: executionProgress.status,
        completedSteps: executionProgress.completedSteps.length,
        failedSteps: executionProgress.failedSteps.length
      })

      setProgress(executionProgress)
      return executionProgress
    } catch (err) {
      console.error('❌ Migration Execution: Error:', err)
      setError(err instanceof Error ? err.message : 'Migration execution failed')
      throw err
    } finally {
      setIsExecuting(false)
    }
  }, [publicKey])

  const resetExecution = useCallback(() => {
    setProgress(null)
    setError(null)
    setIsExecuting(false)
  }, [])

  return {
    progress,
    isExecuting,
    error,
    executePlan,
    resetExecution
  }
}

/**
 * Hook for migration statistics and insights
 */
export function useMigrationInsights(opportunities: CrossPoolOpportunity[] = []) {
  const insights = {
    totalOpportunities: opportunities.length,
    highlyRecommended: opportunities.filter(o => o.recommendation === 'highly_recommended').length,
    recommended: opportunities.filter(o => o.recommendation === 'recommended').length,
    neutral: opportunities.filter(o => o.recommendation === 'neutral').length,
    totalPotentialBenefit: opportunities.reduce((sum, o) => sum + o.projectedBenefit, 0),
    totalMigrationCost: opportunities.reduce((sum, o) => sum + o.migrationCost, 0),
    averageAprImprovement: opportunities.length > 0
      ? opportunities.reduce((sum, o) => sum + o.improvementMetrics.aprImprovement, 0) / opportunities.length
      : 0,
    bestOpportunity: opportunities.length > 0
      ? opportunities.reduce((best, current) =>
          current.projectedBenefit > best.projectedBenefit ? current : best
        )
      : null
  }

  return insights
}

/**
 * Hook for migration cache management
 */
export function useMigrationCache() {
  const [cacheStats, setCacheStats] = useState(positionMigrationManager.getCacheStats())

  const refreshCacheStats = useCallback(() => {
    setCacheStats(positionMigrationManager.getCacheStats())
  }, [])

  const clearCache = useCallback(() => {
    console.log('🧹 Migration Cache: Manual clear')
    positionMigrationManager.clearCache()
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
 * Combined hook for comprehensive migration management
 */
export function useComprehensiveMigration(
  positions: DLMMPosition[] = [],
  enableRealtime: boolean = false
) {
  const { opportunities, loading: opportunitiesLoading, error: opportunitiesError } = useMigrationOpportunities(
    positions,
    enableRealtime
  )

  const { plan, creating: planCreating, error: planError, createPlan, clearPlan } = useMigrationPlan()

  const {
    progress,
    isExecuting,
    error: executionError,
    executePlan,
    resetExecution
  } = useMigrationExecution()

  const insights = useMigrationInsights(opportunities)
  const { cacheStats } = useMigrationCache()

  const loading = opportunitiesLoading || planCreating
  const error = opportunitiesError || planError || executionError

  const executeSelectedOpportunities = useCallback(async (
    selectedOpportunities: CrossPoolOpportunity[],
    preferences: {
      riskTolerance: 'conservative' | 'moderate' | 'aggressive'
      maxGasCost: number
      prioritizeSpeed: boolean
      consolidatePositions: boolean
    }
  ) => {
    try {
      // Clear any existing plan
      clearPlan()
      resetExecution()

      // Create new plan
      const newPlan = await createPlan(selectedOpportunities, preferences)

      // Execute the plan
      return await executePlan(newPlan)
    } catch (error) {
      console.error('❌ Migration: Error executing selected opportunities:', error)
      throw error
    }
  }, [createPlan, executePlan, clearPlan, resetExecution])

  return {
    opportunities,
    plan,
    progress,
    insights,
    cacheStats,
    loading,
    isExecuting,
    error,
    createPlan,
    executePlan,
    executeSelectedOpportunities,
    clearPlan,
    resetExecution,
    hasOpportunities: opportunities.length > 0,
    hasHighValueOpportunities: opportunities.filter(o =>
      o.recommendation === 'highly_recommended' || o.projectedBenefit > 100
    ).length > 0
  }
}