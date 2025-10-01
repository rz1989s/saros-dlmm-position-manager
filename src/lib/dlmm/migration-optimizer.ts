// Migration Route Optimizer
// 🎯 Advanced migration route optimization with cost minimization and efficiency maximization
// Intelligent routing algorithms for optimal cross-pool migrations

import { Connection } from '@solana/web3.js'
import { logger } from '@/lib/logger'
import type { DLMMPosition } from '@/lib/types'
import type {
  CrossPoolRoute
} from './cross-pool-migration'
import { crossPoolMigrationEngine } from './cross-pool-migration'

/**
 * Optimized migration route with detailed metrics
 */
export interface OptimizedMigrationRoute extends CrossPoolRoute {
  optimizationScore: number // 0-100
  costEfficiency: number // 0-1
  timeEfficiency: number // 0-1
  riskScore: number // 0-100
  alternativeRoutes: AlternativeRoute[]
  optimizations: RouteOptimization[]
}

/**
 * Alternative migration route
 */
export interface AlternativeRoute {
  id: string
  route: CrossPoolRoute
  score: number
  advantages: string[]
  disadvantages: string[]
  recommendedFor: string[]
}

/**
 * Route optimization details
 */
export interface RouteOptimization {
  id: string
  type: 'cost' | 'time' | 'risk' | 'slippage'
  description: string
  impact: number
  applied: boolean
}

/**
 * Route comparison analysis
 */
export interface RouteComparison {
  routes: OptimizedMigrationRoute[]
  bestOverall: OptimizedMigrationRoute
  bestCost: OptimizedMigrationRoute
  bestSpeed: OptimizedMigrationRoute
  bestSafety: OptimizedMigrationRoute
  comparison: ComparisonMetrics
}

/**
 * Comparison metrics between routes
 */
export interface ComparisonMetrics {
  costRange: { min: number; max: number; average: number }
  timeRange: { min: number; max: number; average: number }
  riskRange: { min: number; max: number; average: number }
  recommendations: RouteRecommendation[]
}

/**
 * Route recommendation based on user preferences
 */
export interface RouteRecommendation {
  scenario: string
  recommendedRouteId: string
  reasoning: string[]
  tradeoffs: string[]
}

/**
 * Cost breakdown analysis
 */
export interface CostBreakdown {
  totalCost: number
  gasCosts: number
  slippageCosts: number
  opportunityCosts: number
  contingencyCosts: number
  breakdown: Array<{
    category: string
    amount: number
    percentage: number
    optimizable: boolean
  }>
}

/**
 * Time efficiency analysis
 */
export interface TimeEfficiency {
  totalTime: number // seconds
  criticalPath: string[]
  parallelizableSteps: string[]
  bottlenecks: Array<{
    step: string
    delay: number
    cause: string
    mitigation: string
  }>
  optimizedTime: number
  timeSaved: number
}

/**
 * Migration Optimizer Engine
 * Advanced route optimization with cost minimization and efficiency maximization
 */
export class MigrationOptimizer {
  private optimizationCache = new Map<string, { data: any; timestamp: number }>()
  private readonly cacheDuration = 300000 // 5 minutes

  constructor(_connection: Connection) {
    logger.init('🎯 MigrationOptimizer: Advanced route optimization capabilities initialized')
  }

  /**
   * Find and optimize migration routes
   */
  async optimizeMigrationRoutes(
    sourcePosition: DLMMPosition,
    preferences: {
      prioritizeCost?: boolean
      prioritizeSpeed?: boolean
      prioritizeSafety?: boolean
      maxSlippage?: number
      maxGasCost?: number
      maxExecutionTime?: number
    } = {}
  ): Promise<OptimizedMigrationRoute[]> {
    const cacheKey = `optimize-${sourcePosition.id}-${JSON.stringify(preferences)}`

    try {
      // Check cache
      const cached = this.optimizationCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        logger.debug('✅ Optimized routes loaded from cache')
        return cached.data
      }

      logger.debug('🎯 Optimizing migration routes for position:', sourcePosition.id)

      // Discover available routes
      const availableRoutes = await crossPoolMigrationEngine.discoverMigrationRoutes(
        sourcePosition,
        {
          minLiquidity: 100000,
          maxFeeRate: 0.01
        }
      )

      if (availableRoutes.length === 0) {
        logger.warn('⚠️ No migration routes found')
        return []
      }

      // Optimize each route
      const optimizedRoutes: OptimizedMigrationRoute[] = []

      for (const route of availableRoutes) {
        const optimized = await this.optimizeRoute(route, sourcePosition, preferences)
        optimizedRoutes.push(optimized)
      }

      // Sort by optimization score
      optimizedRoutes.sort((a, b) => b.optimizationScore - a.optimizationScore)

      // Cache the results
      this.optimizationCache.set(cacheKey, { data: optimizedRoutes, timestamp: Date.now() })

      logger.debug('✅ Routes optimized:', {
        totalRoutes: optimizedRoutes.length,
        topScore: optimizedRoutes[0]?.optimizationScore.toFixed(1)
      })

      return optimizedRoutes
    } catch (error) {
      logger.error('❌ Error optimizing migration routes:', error)
      return []
    }
  }

  /**
   * Optimize individual route
   */
  async optimizeRoute(
    route: CrossPoolRoute,
    sourcePosition: DLMMPosition,
    preferences: any
  ): Promise<OptimizedMigrationRoute> {
    try {
      const optimizations: RouteOptimization[] = []

      // Cost optimization
      const costOptimization = this.optimizeCosts(route, sourcePosition)
      optimizations.push(...costOptimization.optimizations)

      // Time optimization
      const timeOptimization = this.optimizeTime(route)
      optimizations.push(...timeOptimization.optimizations)

      // Risk optimization
      const riskOptimization = this.optimizeRisk(route)
      optimizations.push(...riskOptimization.optimizations)

      // Slippage optimization
      const slippageOptimization = this.optimizeSlippage(route, preferences.maxSlippage || 0.01)
      optimizations.push(...slippageOptimization.optimizations)

      // Calculate efficiency metrics
      const costEfficiency = this.calculateCostEfficiency(costOptimization)
      const timeEfficiency = this.calculateTimeEfficiency(timeOptimization)
      const riskScore = this.calculateRiskScore(route, riskOptimization)

      // Calculate overall optimization score
      const optimizationScore = this.calculateOptimizationScore(
        costEfficiency,
        timeEfficiency,
        riskScore,
        preferences
      )

      // Generate alternative routes
      const alternativeRoutes = this.generateAlternativeRoutes(route, sourcePosition)

      return {
        ...route,
        optimizationScore,
        costEfficiency,
        timeEfficiency,
        riskScore,
        alternativeRoutes,
        optimizations
      }
    } catch (error) {
      logger.error('❌ Error optimizing route:', error)
      throw error
    }
  }

  /**
   * Compare multiple routes and provide recommendations
   */
  async compareRoutes(
    routes: OptimizedMigrationRoute[],
    preferences: any
  ): Promise<RouteComparison> {
    try {
      logger.debug('📊 Comparing migration routes:', routes.length)

      // Find best routes for different criteria
      const bestOverall = routes.reduce((best, route) =>
        route.optimizationScore > best.optimizationScore ? route : best
      )

      const bestCost = routes.reduce((best, route) =>
        route.estimatedGasCost < best.estimatedGasCost ? route : best
      )

      const bestSpeed = routes.reduce((best, route) =>
        route.estimatedExecutionTime < best.estimatedExecutionTime ? route : best
      )

      const bestSafety = routes.reduce((best, route) =>
        route.riskScore < best.riskScore ? route : best
      )

      // Calculate comparison metrics
      const costs = routes.map(r => r.estimatedGasCost)
      const times = routes.map(r => r.estimatedExecutionTime)
      const risks = routes.map(r => r.riskScore)

      const comparison: ComparisonMetrics = {
        costRange: {
          min: Math.min(...costs),
          max: Math.max(...costs),
          average: costs.reduce((a, b) => a + b, 0) / costs.length
        },
        timeRange: {
          min: Math.min(...times),
          max: Math.max(...times),
          average: times.reduce((a, b) => a + b, 0) / times.length
        },
        riskRange: {
          min: Math.min(...risks),
          max: Math.max(...risks),
          average: risks.reduce((a, b) => a + b, 0) / risks.length
        },
        recommendations: this.generateRecommendations(routes, preferences)
      }

      return {
        routes,
        bestOverall,
        bestCost,
        bestSpeed,
        bestSafety,
        comparison
      }
    } catch (error) {
      logger.error('❌ Error comparing routes:', error)
      throw error
    }
  }

  /**
   * Optimize migration costs
   */
  private optimizeCosts(
    route: CrossPoolRoute,
    _sourcePosition: DLMMPosition
  ): { optimizations: RouteOptimization[]; estimatedSavings: number } {
    const optimizations: RouteOptimization[] = []
    let estimatedSavings = 0

    // Batch transaction optimization
    if (route.intermediateSwaps.length > 1) {
      optimizations.push({
        id: 'batch-swaps',
        type: 'cost',
        description: 'Batch multiple swaps into single transaction to reduce gas costs',
        impact: route.estimatedGasCost * 0.3,
        applied: true
      })
      estimatedSavings += route.estimatedGasCost * 0.3
    }

    // Route simplification
    if (route.intermediateSwaps.length > 2) {
      optimizations.push({
        id: 'simplify-route',
        type: 'cost',
        description: 'Find more direct route to reduce swap costs',
        impact: route.estimatedGasCost * 0.2,
        applied: false
      })
    }

    // Timing optimization for gas costs
    optimizations.push({
      id: 'gas-timing',
      type: 'cost',
      description: 'Execute during low-congestion periods for lower gas costs',
      impact: route.estimatedGasCost * 0.15,
      applied: false
    })

    return { optimizations, estimatedSavings }
  }

  /**
   * Optimize execution time
   */
  private optimizeTime(
    route: CrossPoolRoute
  ): { optimizations: RouteOptimization[]; estimatedTimeSaved: number } {
    const optimizations: RouteOptimization[] = []
    let estimatedTimeSaved = 0

    // Parallel execution optimization
    optimizations.push({
      id: 'parallel-execution',
      type: 'time',
      description: 'Execute independent steps in parallel',
      impact: route.estimatedExecutionTime * 0.25,
      applied: true
    })
    estimatedTimeSaved += route.estimatedExecutionTime * 0.25

    // Pre-approval optimization
    optimizations.push({
      id: 'pre-approval',
      type: 'time',
      description: 'Pre-approve tokens to reduce transaction count',
      impact: 30, // 30 seconds saved
      applied: true
    })
    estimatedTimeSaved += 30

    // Route caching
    if (route.intermediateSwaps.length > 0) {
      optimizations.push({
        id: 'route-caching',
        type: 'time',
        description: 'Cache swap routes for faster execution',
        impact: 15, // 15 seconds saved
        applied: true
      })
      estimatedTimeSaved += 15
    }

    return { optimizations, estimatedTimeSaved }
  }

  /**
   * Optimize risk factors
   */
  private optimizeRisk(
    route: CrossPoolRoute
  ): { optimizations: RouteOptimization[]; riskReduction: number } {
    const optimizations: RouteOptimization[] = []
    let riskReduction = 0

    // Slippage protection
    optimizations.push({
      id: 'slippage-protection',
      type: 'risk',
      description: 'Implement dynamic slippage tolerance based on market conditions',
      impact: 15, // 15 point risk reduction
      applied: true
    })
    riskReduction += 15

    // Rollback mechanism
    optimizations.push({
      id: 'rollback-mechanism',
      type: 'risk',
      description: 'Enable automatic rollback on critical failures',
      impact: 20, // 20 point risk reduction
      applied: true
    })
    riskReduction += 20

    // Price monitoring
    optimizations.push({
      id: 'price-monitoring',
      type: 'risk',
      description: 'Real-time price monitoring during migration',
      impact: 10, // 10 point risk reduction
      applied: true
    })
    riskReduction += 10

    // Liquidity verification
    if (route.intermediateSwaps.length > 0) {
      optimizations.push({
        id: 'liquidity-verification',
        type: 'risk',
        description: 'Verify adequate liquidity before each swap',
        impact: 12, // 12 point risk reduction
        applied: true
      })
      riskReduction += 12
    }

    return { optimizations, riskReduction }
  }

  /**
   * Optimize slippage
   */
  private optimizeSlippage(
    route: CrossPoolRoute,
    maxSlippage: number
  ): { optimizations: RouteOptimization[]; slippageReduction: number } {
    const optimizations: RouteOptimization[] = []
    let slippageReduction = 0

    // Dynamic slippage adjustment
    if (route.estimatedSlippage > maxSlippage * 0.5) {
      optimizations.push({
        id: 'dynamic-slippage',
        type: 'slippage',
        description: 'Adjust slippage tolerance based on market depth',
        impact: route.estimatedSlippage * 0.2,
        applied: true
      })
      slippageReduction += route.estimatedSlippage * 0.2
    }

    // Split large orders
    if (route.estimatedSlippage > 0.01) {
      optimizations.push({
        id: 'split-orders',
        type: 'slippage',
        description: 'Split large migrations into smaller chunks to reduce price impact',
        impact: route.estimatedSlippage * 0.3,
        applied: false
      })
    }

    // TWAP execution
    optimizations.push({
      id: 'twap-execution',
      type: 'slippage',
      description: 'Use time-weighted average price execution',
      impact: route.estimatedSlippage * 0.15,
      applied: false
    })

    return { optimizations, slippageReduction }
  }

  /**
   * Calculate cost efficiency
   */
  private calculateCostEfficiency(
    costOptimization: { estimatedSavings: number }
  ): number {
    const efficiency = costOptimization.estimatedSavings / 0.01 // Normalize against 0.01 SOL

    return Math.min(efficiency * 0.8 + 0.2, 1) // Scale to 0.2-1.0
  }

  /**
   * Calculate time efficiency
   */
  private calculateTimeEfficiency(
    timeOptimization: { estimatedTimeSaved: number }
  ): number {
    const efficiency = timeOptimization.estimatedTimeSaved / 60 // Normalize against 60 seconds

    return Math.min(efficiency * 0.7 + 0.3, 1) // Scale to 0.3-1.0
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(
    route: CrossPoolRoute,
    riskOptimization: { riskReduction: number }
  ): number {
    let baseRisk = 50 // Start at moderate risk

    // Increase risk for complex routes
    baseRisk += route.intermediateSwaps.length * 10

    // Increase risk for high slippage
    if (route.estimatedSlippage > 0.02) baseRisk += 15
    else if (route.estimatedSlippage > 0.01) baseRisk += 10

    // Reduce risk with optimizations
    baseRisk -= riskOptimization.riskReduction

    // Adjust based on confidence
    baseRisk -= (route.confidence - 0.5) * 40

    return Math.max(Math.min(baseRisk, 100), 0)
  }

  /**
   * Calculate overall optimization score
   */
  private calculateOptimizationScore(
    costEfficiency: number,
    timeEfficiency: number,
    riskScore: number,
    preferences: any
  ): number {
    // Weight factors based on preferences
    let costWeight = 0.35
    let timeWeight = 0.30
    let riskWeight = 0.35

    if (preferences.prioritizeCost) {
      costWeight = 0.50
      timeWeight = 0.20
      riskWeight = 0.30
    } else if (preferences.prioritizeSpeed) {
      costWeight = 0.25
      timeWeight = 0.45
      riskWeight = 0.30
    } else if (preferences.prioritizeSafety) {
      costWeight = 0.25
      timeWeight = 0.20
      riskWeight = 0.55
    }

    // Calculate weighted score
    const riskScore_normalized = 1 - (riskScore / 100) // Convert to 0-1, lower is better
    const score =
      costEfficiency * costWeight +
      timeEfficiency * timeWeight +
      riskScore_normalized * riskWeight

    return score * 100 // Scale to 0-100
  }

  /**
   * Generate alternative routes
   */
  private generateAlternativeRoutes(
    _route: CrossPoolRoute,
    _sourcePosition: DLMMPosition
  ): AlternativeRoute[] {
    const alternatives: AlternativeRoute[] = []

    // Direct route alternative (if available)
    alternatives.push({
      id: 'direct-route',
      route: _route, // Would be replaced with actual direct route
      score: 85,
      advantages: [
        'No intermediate swaps required',
        'Lower gas costs',
        'Faster execution',
        'Reduced slippage risk'
      ],
      disadvantages: [
        'May not be available for all token pairs',
        'Potentially lower liquidity'
      ],
      recommendedFor: ['Users prioritizing speed and cost', 'Small to medium positions']
    })

    // Multi-hop route alternative
    alternatives.push({
      id: 'multi-hop-route',
      route: _route,
      score: 70,
      advantages: [
        'Better liquidity across multiple pools',
        'Potentially better price execution',
        'More flexibility in token selection'
      ],
      disadvantages: [
        'Higher gas costs',
        'Longer execution time',
        'More complex route management',
        'Higher slippage risk'
      ],
      recommendedFor: ['Large positions', 'Users prioritizing price over speed']
    })

    // Staged migration alternative
    alternatives.push({
      id: 'staged-migration',
      route: _route,
      score: 75,
      advantages: [
        'Reduced risk through gradual migration',
        'Better price discovery',
        'Lower market impact',
        'Rollback flexibility'
      ],
      disadvantages: [
        'Longer total execution time',
        'Multiple transaction fees',
        'Requires more monitoring'
      ],
      recommendedFor: ['Very large positions', 'Risk-averse users', 'Volatile market conditions']
    })

    return alternatives
  }

  /**
   * Generate route recommendations
   */
  private generateRecommendations(
    routes: OptimizedMigrationRoute[],
    _preferences: any
  ): RouteRecommendation[] {
    const recommendations: RouteRecommendation[] = []

    // Best for cost-conscious users
    const bestCostRoute = routes.reduce((best, route) =>
      route.estimatedGasCost < best.estimatedGasCost ? route : best
    )

    recommendations.push({
      scenario: 'Cost-Conscious Migration',
      recommendedRouteId: bestCostRoute.id,
      reasoning: [
        'Lowest gas costs among all routes',
        'Good balance of cost and risk',
        'Suitable for smaller positions'
      ],
      tradeoffs: [
        'May take slightly longer than fastest route',
        'Acceptable risk level for most users'
      ]
    })

    // Best for time-sensitive users
    const bestTimeRoute = routes.reduce((best, route) =>
      route.estimatedExecutionTime < best.estimatedExecutionTime ? route : best
    )

    recommendations.push({
      scenario: 'Time-Sensitive Migration',
      recommendedRouteId: bestTimeRoute.id,
      reasoning: [
        'Fastest execution among all routes',
        'Minimizes exposure to market volatility',
        'Ideal for urgent migrations'
      ],
      tradeoffs: [
        'May have higher gas costs',
        'Slightly higher risk due to speed priority'
      ]
    })

    // Best for risk-averse users
    const bestSafetyRoute = routes.reduce((best, route) =>
      route.riskScore < best.riskScore ? route : best
    )

    recommendations.push({
      scenario: 'Safety-First Migration',
      recommendedRouteId: bestSafetyRoute.id,
      reasoning: [
        'Lowest risk score among all routes',
        'Maximum safety features enabled',
        'Best for large positions'
      ],
      tradeoffs: [
        'May be slower than other routes',
        'Potentially higher costs for safety features'
      ]
    })

    return recommendations
  }

  /**
   * Analyze detailed cost breakdown
   */
  async analyzeCostBreakdown(route: OptimizedMigrationRoute): Promise<CostBreakdown> {
    try {
      const gasCosts = route.estimatedGasCost
      const slippageCosts = route.estimatedSlippage * 0.5 // Estimate based on slippage
      const opportunityCosts = (route.estimatedExecutionTime / 3600) * 0.001 // Hourly opportunity cost
      const contingencyCosts = gasCosts * 0.1 // 10% contingency

      const totalCost = gasCosts + slippageCosts + opportunityCosts + contingencyCosts

      const breakdown = [
        {
          category: 'Gas Costs',
          amount: gasCosts,
          percentage: (gasCosts / totalCost) * 100,
          optimizable: true
        },
        {
          category: 'Slippage Costs',
          amount: slippageCosts,
          percentage: (slippageCosts / totalCost) * 100,
          optimizable: true
        },
        {
          category: 'Opportunity Costs',
          amount: opportunityCosts,
          percentage: (opportunityCosts / totalCost) * 100,
          optimizable: false
        },
        {
          category: 'Contingency Reserve',
          amount: contingencyCosts,
          percentage: (contingencyCosts / totalCost) * 100,
          optimizable: false
        }
      ]

      return {
        totalCost,
        gasCosts,
        slippageCosts,
        opportunityCosts,
        contingencyCosts,
        breakdown
      }
    } catch (error) {
      logger.error('❌ Error analyzing cost breakdown:', error)
      throw error
    }
  }

  /**
   * Analyze time efficiency
   */
  async analyzeTimeEfficiency(route: OptimizedMigrationRoute): Promise<TimeEfficiency> {
    try {
      const criticalPath = ['remove_liquidity', 'swap_tokens', 'add_liquidity']
      const parallelizableSteps = ['verify_position', 'update_analytics']

      const bottlenecks = route.intermediateSwaps.map((_swap, index) => ({
        step: `swap-${index}`,
        delay: 30, // 30 seconds per swap
        cause: 'Sequential swap execution required',
        mitigation: 'Use flash loans to parallelize swaps'
      }))

      const optimizedTime = route.estimatedExecutionTime * 0.75 // 25% time savings
      const timeSaved = route.estimatedExecutionTime - optimizedTime

      return {
        totalTime: route.estimatedExecutionTime,
        criticalPath,
        parallelizableSteps,
        bottlenecks,
        optimizedTime,
        timeSaved
      }
    } catch (error) {
      logger.error('❌ Error analyzing time efficiency:', error)
      throw error
    }
  }

  /**
   * Clear optimization cache
   */
  clearCache(): void {
    this.optimizationCache.clear()
    logger.debug('🧹 Migration optimizer cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { count: number; keys: string[] } {
    return {
      count: this.optimizationCache.size,
      keys: Array.from(this.optimizationCache.keys())
    }
  }
}

// Export singleton instance
export const migrationOptimizer = new MigrationOptimizer(
  crossPoolMigrationEngine['connection']
)
