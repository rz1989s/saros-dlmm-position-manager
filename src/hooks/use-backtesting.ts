'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'
import {
  BacktestConfig,
  BacktestResult,
  BacktestMetrics,
  StrategyComparison,
  BacktestOptimization,
} from '@/lib/types'
import {
  backtestEngine,
  BacktestUtils,
} from '@/lib/dlmm/backtesting'
import { strategyManager } from '@/lib/dlmm/strategies'

// Simple progress interface for backtesting
interface BacktestProgress {
  percentage?: number
  progress?: number
  phase?: string
  currentStep: string
  totalSteps?: number
  currentStepIndex?: number
}

export interface BacktestHookState {
  // Current backtest state
  currentBacktest: BacktestResult | null
  isRunning: boolean
  progress: BacktestProgress | null

  // Results and history
  results: BacktestResult[]
  comparisons: StrategyComparison[]
  optimizations: BacktestOptimization[]

  // Error handling
  error: string | null
  lastError: Error | null
}

export interface BacktestHookActions {
  // Core backtesting
  runBacktest: (config: BacktestConfig) => Promise<BacktestResult>
  cancelBacktest: () => void
  clearResults: () => void

  // Configuration helpers
  createDefaultConfig: () => Partial<BacktestConfig>
  validateConfig: (config: BacktestConfig) => { isValid: boolean; errors: string[] }

  // Results management
  saveResult: (result: BacktestResult) => void
  removeResult: (resultId: string) => void
  exportResults: (format: 'json' | 'csv') => string

  // Strategy comparison
  compareStrategies: (configs: BacktestConfig[]) => Promise<StrategyComparison>
  saveComparison: (comparison: StrategyComparison) => void

  // Parameter optimization
  optimizeParameters: (
    baseConfig: BacktestConfig,
    parametersToOptimize: Array<{
      name: string
      range: [number, number]
      step: number
    }>
  ) => Promise<BacktestOptimization>

  // Utility functions
  estimateDuration: (config: BacktestConfig) => number
  getAvailableStrategies: () => Array<{ id: string; name: string; description: string }>
}

const STORAGE_KEY = 'backtesting_data'
const MAX_STORED_RESULTS = 50

export function useBacktesting(): BacktestHookState & BacktestHookActions {
  // Core state
  const [currentBacktest, setCurrentBacktest] = useState<BacktestResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<BacktestProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastError, setLastError] = useState<Error | null>(null)

  // Results state
  const [results, setResults] = useState<BacktestResult[]>([])
  const [comparisons, setComparisons] = useState<StrategyComparison[]>([])
  const [optimizations, setOptimizations] = useState<BacktestOptimization[]>([])

  // Refs for cleanup
  const progressCallbackRef = useRef<((progress: BacktestProgress) => void) | null>(null)

  // Load stored data on mount
  useEffect(() => {
    loadStoredData()
  }, [])

  // Save data when state changes
  useEffect(() => {
    saveStoredData()
  }, [results, comparisons, optimizations])

  /**
   * Load stored data from localStorage
   */
  const loadStoredData = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        setResults(data.results || [])
        setComparisons(data.comparisons || [])
        setOptimizations(data.optimizations || [])
      }
    } catch (error) {
      console.warn('Failed to load stored backtesting data:', error)
    }
  }, [])

  /**
   * Save data to localStorage
   */
  const saveStoredData = useCallback(() => {
    try {
      const data = {
        results: results.slice(-MAX_STORED_RESULTS), // Keep only recent results
        comparisons: comparisons.slice(-10), // Keep only recent comparisons
        optimizations: optimizations.slice(-5), // Keep only recent optimizations
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save backtesting data:', error)
    }
  }, [results, comparisons, optimizations])

  /**
   * Run a backtest with progress tracking
   */
  const runBacktest = useCallback(async (config: BacktestConfig): Promise<BacktestResult> => {
    try {
      setError(null)
      setLastError(null)
      setIsRunning(true)
      setProgress({ phase: 'initializing', progress: 0, currentStep: 'Starting backtest...' })

      console.log('🚀 Starting backtest:', config.name)

      // Setup progress callback
      progressCallbackRef.current = (progressUpdate: BacktestProgress) => {
        setProgress(progressUpdate)
      }

      // Run the backtest
      const result = await backtestEngine.runBacktest(config, progressCallbackRef.current)

      // Update state
      setCurrentBacktest(result)

      if (result.status === 'completed') {
        // Auto-save successful results
        setResults(prev => {
          const updated = [result, ...prev]
          return updated.slice(0, MAX_STORED_RESULTS)
        })

        console.log('✅ Backtest completed successfully')
        console.log(`📊 Total Return: ${(result.metrics.totalReturn * 100).toFixed(2)}%`)
        console.log(`📈 Sharpe Ratio: ${result.metrics.sharpeRatio.toFixed(2)}`)
      } else if (result.status === 'error') {
        throw new Error(result.error?.message || 'Backtest failed')
      }

      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Backtest failed:', errorMessage)

      setError(errorMessage)
      setLastError(error instanceof Error ? error : new Error(errorMessage))

      // Create error result
      const errorResult: BacktestResult = {
        config,
        status: 'error',
        progress: progress?.progress || 0,
        startedAt: new Date(),
        metrics: {} as any,
        timeSeriesData: [],
        actions: [],
        summary: {
          bestPeriod: { start: new Date(), end: new Date(), return: 0 },
          worstPeriod: { start: new Date(), end: new Date(), return: 0 },
          keyInsights: [],
          recommendations: [],
        },
        error: {
          message: errorMessage,
          timestamp: new Date(),
        },
      }

      setCurrentBacktest(errorResult)
      throw error

    } finally {
      setIsRunning(false)
      progressCallbackRef.current = null
    }
  }, [progress?.progress])

  /**
   * Cancel running backtest
   */
  const cancelBacktest = useCallback(() => {
    if (isRunning) {
      backtestEngine.cancelBacktest()
      setIsRunning(false)
      setProgress(null)
      console.log('🛑 Backtest cancelled by user')
    }
  }, [isRunning])

  /**
   * Clear all results and reset state
   */
  const clearResults = useCallback(() => {
    setResults([])
    setComparisons([])
    setOptimizations([])
    setCurrentBacktest(null)
    setError(null)
    setLastError(null)
    localStorage.removeItem(STORAGE_KEY)
    console.log('🗑️ Cleared all backtest results')
  }, [])

  /**
   * Create default configuration
   */
  const createDefaultConfig = useCallback((): Partial<BacktestConfig> => {
    return {
      id: BacktestUtils.generateId(),
      name: `Backtest ${new Date().toLocaleDateString()}`,
      ...BacktestUtils.createDefaultConfig(),
    }
  }, [])

  /**
   * Validate configuration
   */
  const validateConfig = useCallback((config: BacktestConfig) => {
    return BacktestUtils.validateConfig(config)
  }, [])

  /**
   * Save a backtest result
   */
  const saveResult = useCallback((result: BacktestResult) => {
    setResults(prev => {
      const existing = prev.find(r => r.config.id === result.config.id)
      if (existing) {
        // Update existing result
        return prev.map(r => r.config.id === result.config.id ? result : r)
      } else {
        // Add new result
        return [result, ...prev].slice(0, MAX_STORED_RESULTS)
      }
    })
  }, [])

  /**
   * Remove a backtest result
   */
  const removeResult = useCallback((resultId: string) => {
    setResults(prev => prev.filter(r => r.config.id !== resultId))
    setComparisons(prev => prev.filter(c =>
      !c.strategies.some(s => s.config.id === resultId)
    ))
  }, [])

  /**
   * Export results in different formats
   */
  const exportResults = useCallback((format: 'json' | 'csv'): string => {
    if (format === 'json') {
      return JSON.stringify({ results, comparisons, optimizations }, null, 2)
    } else {
      // CSV export of results summary
      const headers = [
        'Name', 'Strategy', 'Start Date', 'End Date', 'Initial Capital',
        'Total Return', 'Annualized Return', 'Sharpe Ratio', 'Max Drawdown',
        'Win Rate', 'Total Trades', 'Status'
      ]

      const rows = results.map(result => [
        result.config.name,
        result.config.strategy.name,
        result.config.timeframe.startDate.toISOString().split('T')[0],
        result.config.timeframe.endDate.toISOString().split('T')[0],
        result.config.capital.initialAmount.toString(),
        (result.metrics.totalReturn * 100).toFixed(2) + '%',
        (result.metrics.annualizedReturn * 100).toFixed(2) + '%',
        result.metrics.sharpeRatio.toFixed(2),
        (result.metrics.maxDrawdown * 100).toFixed(2) + '%',
        (result.metrics.winRate * 100).toFixed(1) + '%',
        result.metrics.totalTrades.toString(),
        result.status,
      ])

      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
  }, [results, comparisons, optimizations])

  /**
   * Compare multiple strategies
   */
  const compareStrategies = useCallback(async (configs: BacktestConfig[]): Promise<StrategyComparison> => {
    console.log(`📊 Comparing ${configs.length} strategies...`)

    const strategies = await Promise.all(
      configs.map(async (config, index) => {
        const result = await runBacktest(config)
        return {
          config,
          result,
          color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`, // Generate distinct colors
        }
      })
    )

    const comparison: StrategyComparison = {
      id: BacktestUtils.generateId(),
      name: `Strategy Comparison ${new Date().toLocaleDateString()}`,
      strategies,
      comparisonMetrics: [],
      created: new Date(),
    }

    // Calculate comparison metrics
    const metricKeys: Array<keyof BacktestMetrics> = [
      'totalReturn', 'sharpeRatio', 'maxDrawdown', 'winRate', 'avgApr'
    ]

    comparison.comparisonMetrics = metricKeys.map(metric => {
      const values = strategies.map(s => s.result.metrics[metric])
      const maxValue = Math.max(...values)
      const winner = values.findIndex(v => v === maxValue)

      return {
        metric,
        values,
        winner: metric === 'maxDrawdown' ? values.findIndex(v => v === Math.min(...values)) : winner,
      }
    })

    setComparisons(prev => [comparison, ...prev].slice(0, 10))
    return comparison

  }, [runBacktest])

  /**
   * Save a strategy comparison
   */
  const saveComparison = useCallback((comparison: StrategyComparison) => {
    setComparisons(prev => {
      const existing = prev.find(c => c.id === comparison.id)
      if (existing) {
        return prev.map(c => c.id === comparison.id ? comparison : c)
      } else {
        return [comparison, ...prev].slice(0, 10)
      }
    })
  }, [])

  /**
   * Optimize strategy parameters
   */
  const optimizeParameters = useCallback(async (
    baseConfig: BacktestConfig,
    parametersToOptimize: Array<{
      name: string
      range: [number, number]
      step: number
    }>
  ): Promise<BacktestOptimization> => {
    console.log('🎯 Starting parameter optimization...')

    const results = []

    // Generate parameter combinations
    const generateCombinations = (paramIndex: number, currentParams: Record<string, number>): Record<string, number>[] => {
      if (paramIndex >= parametersToOptimize.length) {
        return [currentParams]
      }

      const param = parametersToOptimize[paramIndex]
      const combinations = []

      for (let value = param.range[0]; value <= param.range[1]; value += param.step) {
        const newParams = { ...currentParams, [param.name]: value }
        combinations.push(...generateCombinations(paramIndex + 1, newParams))
      }

      return combinations
    }

    const parameterCombinations = generateCombinations(0, {})
    console.log(`🔬 Testing ${parameterCombinations.length} parameter combinations`)

    // Test each combination
    for (let i = 0; i < parameterCombinations.length; i++) {
      const params = parameterCombinations[i]

      const config: BacktestConfig = {
        ...baseConfig,
        id: BacktestUtils.generateId(),
        name: `Optimization ${i + 1}`,
        strategy: {
          ...baseConfig.strategy,
          parameters: { ...baseConfig.strategy.parameters, ...params },
        },
      }

      try {
        const result = await runBacktest(config)
        results.push({
          parameterValues: params,
          metrics: result.metrics,
          rank: 0, // Will be calculated later
        })
      } catch (error) {
        console.warn(`Optimization step ${i + 1} failed:`, error)
      }
    }

    // Rank results by Sharpe ratio
    results.sort((a, b) => b.metrics.sharpeRatio - a.metrics.sharpeRatio)
    results.forEach((result, index) => {
      result.rank = index + 1
    })

    // Create optimal configuration
    const optimalResult = results[0]
    const optimalConfig: BacktestConfig = {
      ...baseConfig,
      id: BacktestUtils.generateId(),
      name: `${baseConfig.name} (Optimized)`,
      strategy: {
        ...baseConfig.strategy,
        parameters: { ...baseConfig.strategy.parameters, ...optimalResult.parameterValues },
      },
    }

    const optimization: BacktestOptimization = {
      baseConfig,
      parameters: parametersToOptimize.map(param => ({
        ...param,
        optimal: optimalResult.parameterValues[param.name],
      })),
      results,
      optimalConfig,
    }

    setOptimizations(prev => [optimization, ...prev].slice(0, 5))
    console.log('✨ Parameter optimization completed')

    return optimization

  }, [runBacktest])

  /**
   * Estimate backtest duration
   */
  const estimateDuration = useCallback((config: BacktestConfig): number => {
    return BacktestUtils.estimateBacktestDuration(config)
  }, [])

  /**
   * Get available strategies
   */
  const getAvailableStrategies = useCallback(() => {
    return strategyManager.getDefaultStrategies().map(strategy => ({
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
    }))
  }, [])

  return {
    // State
    currentBacktest,
    isRunning,
    progress,
    results,
    comparisons,
    optimizations,
    error,
    lastError,

    // Actions
    runBacktest,
    cancelBacktest,
    clearResults,
    createDefaultConfig,
    validateConfig,
    saveResult,
    removeResult,
    exportResults,
    compareStrategies,
    saveComparison,
    optimizeParameters,
    estimateDuration,
    getAvailableStrategies,
  }
}