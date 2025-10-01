// Bulk Migration Engine
// 📦 Advanced bulk position migration with parallel processing and batch optimization
// Efficient migration of multiple positions simultaneously

import { Connection, PublicKey } from '@solana/web3.js'
import { logger } from '@/lib/logger'
import type { DLMMPosition } from '@/lib/types'
import type {
  CrossPoolMigrationPlan,
  CrossPoolMigrationResult
} from './cross-pool-migration'
import { crossPoolMigrationEngine } from './cross-pool-migration'
import { migrationOptimizer } from './migration-optimizer'

/**
 * Bulk migration plan for multiple positions
 */
export interface BulkMigrationPlan {
  id: string
  positions: DLMMPosition[]
  individualPlans: CrossPoolMigrationPlan[]
  executionStrategy: 'sequential' | 'parallel' | 'batched' | 'staged'
  totalGasCost: number
  totalExecutionTime: number
  estimatedSavings: number
  batchOptimizations: BatchOptimization[]
  riskAssessment: BulkRiskAssessment
  recommendations: string[]
}

/**
 * Batch optimization details
 */
export interface BatchOptimization {
  id: string
  type: 'transaction_batching' | 'route_sharing' | 'gas_optimization' | 'parallel_execution'
  description: string
  positions: string[]
  estimatedSavings: number
  impact: {
    gasSavings: number
    timeSavings: number
    riskReduction: number
  }
}

/**
 * Bulk migration risk assessment
 */
export interface BulkRiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'extreme'
  riskScore: number // 0-100
  positionRisks: PositionRisk[]
  correlatedRisks: string[]
  mitigationStrategies: string[]
  maxConcurrentMigrations: number
}

/**
 * Individual position risk in bulk migration
 */
export interface PositionRisk {
  positionId: string
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: string[]
  failureImpact: 'isolated' | 'moderate' | 'severe'
  dependentPositions: string[]
}

/**
 * Bulk migration execution result
 */
export interface BulkMigrationResult {
  planId: string
  status: 'success' | 'partial_success' | 'failed'
  totalPositions: number
  successfulMigrations: number
  failedMigrations: number
  results: Array<{
    positionId: string
    result: CrossPoolMigrationResult
  }>
  totalGasUsed: number
  totalExecutionTime: number
  actualSavings: number
  summary: BulkMigrationSummary
}

/**
 * Bulk migration summary
 */
export interface BulkMigrationSummary {
  successRate: number
  avgGasPerPosition: number
  avgTimePerPosition: number
  totalCostSavings: number
  performanceMetrics: {
    plannedVsActual: {
      gasCost: { planned: number; actual: number; variance: number }
      time: { planned: number; actual: number; variance: number }
    }
    efficiencyScore: number
  }
  recommendations: string[]
}

/**
 * Execution progress tracking
 */
export interface BulkMigrationProgress {
  planId: string
  status: 'preparing' | 'executing' | 'completed' | 'failed'
  currentPosition: number
  totalPositions: number
  completedPositions: string[]
  failedPositions: string[]
  currentStep: string
  estimatedTimeRemaining: number
  percentComplete: number
}

/**
 * Bulk Migration Engine
 * Efficient migration of multiple positions with advanced batch processing
 */
export class BulkMigrationEngine {
  private migrationCache = new Map<string, { data: any; timestamp: number }>()
  private readonly cacheDuration = 300000 // 5 minutes
  private readonly maxConcurrentMigrations = 5 // Limit concurrent migrations

  constructor(_connection: Connection) {
    logger.init('📦 BulkMigrationEngine: Advanced bulk migration capabilities initialized')
  }

  /**
   * Create comprehensive bulk migration plan
   */
  async createBulkMigrationPlan(
    positions: DLMMPosition[],
    preferences: {
      executionStrategy?: 'sequential' | 'parallel' | 'batched' | 'staged'
      maxSlippage?: number
      maxGasCost?: number
      prioritizeSpeed?: boolean
      prioritizeSafety?: boolean
      enableRollback?: boolean
    } = {}
  ): Promise<BulkMigrationPlan> {
    const cacheKey = `bulk-plan-${positions.map(p => p.id).join('-')}-${JSON.stringify(preferences)}`

    try {
      // Check cache
      const cached = this.migrationCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        logger.debug('✅ Bulk migration plan loaded from cache')
        return cached.data
      }

      logger.debug('📦 Creating bulk migration plan for', positions.length, 'positions')

      const planId = `bulk-${Date.now()}`

      // Optimize routes for each position
      const optimizedRoutes = await Promise.all(
        positions.map(async (position) => {
          const routes = await migrationOptimizer.optimizeMigrationRoutes(position, {
            prioritizeCost: !preferences.prioritizeSpeed,
            prioritizeSpeed: preferences.prioritizeSpeed,
            prioritizeSafety: preferences.prioritizeSafety,
            maxSlippage: preferences.maxSlippage || 0.01,
            maxGasCost: preferences.maxGasCost || 1.0
          })
          return { position, route: routes[0] }
        })
      )

      // Create individual migration plans
      const individualPlans: CrossPoolMigrationPlan[] = []
      for (const { position, route } of optimizedRoutes) {
        if (route) {
          const plan = await crossPoolMigrationEngine.createMigrationPlan(
            position,
            route,
            {
              maxSlippage: preferences.maxSlippage || 0.01,
              maxGasCost: preferences.maxGasCost || 1.0,
              prioritizeSpeed: preferences.prioritizeSpeed || false,
              enableRollback: preferences.enableRollback || true
            }
          )
          individualPlans.push(plan)
        }
      }

      // Determine execution strategy
      const executionStrategy = preferences.executionStrategy ||
        this.determineOptimalStrategy(individualPlans, preferences)

      // Identify batch optimizations
      const batchOptimizations = this.identifyBatchOptimizations(
        individualPlans,
        executionStrategy
      )

      // Calculate costs and time
      const totalGasCost = individualPlans.reduce((sum, plan) => sum + plan.totalGasCost, 0)
      const estimatedSavings = batchOptimizations.reduce(
        (sum, opt) => sum + opt.estimatedSavings,
        0
      )

      const totalExecutionTime = this.calculateBulkExecutionTime(
        individualPlans,
        executionStrategy
      )

      // Assess risks
      const riskAssessment = this.assessBulkRisks(individualPlans, executionStrategy)

      // Generate recommendations
      const recommendations = this.generateBulkRecommendations(
        individualPlans,
        executionStrategy,
        riskAssessment
      )

      const plan: BulkMigrationPlan = {
        id: planId,
        positions,
        individualPlans,
        executionStrategy,
        totalGasCost: totalGasCost - estimatedSavings,
        totalExecutionTime,
        estimatedSavings,
        batchOptimizations,
        riskAssessment,
        recommendations
      }

      // Cache the plan
      this.migrationCache.set(cacheKey, { data: plan, timestamp: Date.now() })

      logger.debug('✅ Bulk migration plan created:', {
        planId,
        positions: positions.length,
        strategy: executionStrategy,
        estimatedSavings: estimatedSavings.toFixed(4),
        totalTime: (totalExecutionTime / 60).toFixed(1) + ' minutes'
      })

      return plan
    } catch (error) {
      logger.error('❌ Error creating bulk migration plan:', error)
      throw new Error(`Failed to create bulk migration plan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Execute bulk migration plan
   */
  async executeBulkMigrationPlan(
    plan: BulkMigrationPlan,
    userAddress: PublicKey,
    onProgress?: (progress: BulkMigrationProgress) => void
  ): Promise<BulkMigrationResult> {
    const startTime = Date.now()

    const result: BulkMigrationResult = {
      planId: plan.id,
      status: 'failed',
      totalPositions: plan.positions.length,
      successfulMigrations: 0,
      failedMigrations: 0,
      results: [],
      totalGasUsed: 0,
      totalExecutionTime: 0,
      actualSavings: 0,
      summary: {
        successRate: 0,
        avgGasPerPosition: 0,
        avgTimePerPosition: 0,
        totalCostSavings: 0,
        performanceMetrics: {
          plannedVsActual: {
            gasCost: { planned: plan.totalGasCost, actual: 0, variance: 0 },
            time: { planned: plan.totalExecutionTime, actual: 0, variance: 0 }
          },
          efficiencyScore: 0
        },
        recommendations: []
      }
    }

    try {
      logger.debug('🚀 Executing bulk migration plan:', plan.id)

      onProgress?.({
        planId: plan.id,
        status: 'preparing',
        currentPosition: 0,
        totalPositions: plan.positions.length,
        completedPositions: [],
        failedPositions: [],
        currentStep: 'Preparing bulk migration',
        estimatedTimeRemaining: plan.totalExecutionTime,
        percentComplete: 0
      })

      // Execute based on strategy
      switch (plan.executionStrategy) {
        case 'sequential':
          await this.executeSequential(plan, userAddress, result, onProgress)
          break

        case 'parallel':
          await this.executeParallel(plan, userAddress, result, onProgress)
          break

        case 'batched':
          await this.executeBatched(plan, userAddress, result, onProgress)
          break

        case 'staged':
          await this.executeStaged(plan, userAddress, result, onProgress)
          break
      }

      // Calculate final results
      result.totalExecutionTime = Date.now() - startTime
      result.successfulMigrations = result.results.filter(r => r.result.status === 'success').length
      result.failedMigrations = result.results.filter(r => r.result.status === 'failed').length

      if (result.successfulMigrations === plan.positions.length) {
        result.status = 'success'
      } else if (result.successfulMigrations > 0) {
        result.status = 'partial_success'
      } else {
        result.status = 'failed'
      }

      // Generate summary
      result.summary = this.generateBulkSummary(plan, result)

      logger.debug('✅ Bulk migration completed:', {
        planId: plan.id,
        status: result.status,
        successful: result.successfulMigrations,
        failed: result.failedMigrations,
        time: (result.totalExecutionTime / 1000).toFixed(1) + 's'
      })

      onProgress?.({
        planId: plan.id,
        status: 'completed',
        currentPosition: plan.positions.length,
        totalPositions: plan.positions.length,
        completedPositions: result.results.filter(r => r.result.status === 'success').map(r => r.positionId),
        failedPositions: result.results.filter(r => r.result.status === 'failed').map(r => r.positionId),
        currentStep: 'Bulk migration completed',
        estimatedTimeRemaining: 0,
        percentComplete: 100
      })

      return result
    } catch (error) {
      logger.error('❌ Bulk migration execution failed:', error)

      result.status = 'failed'
      result.totalExecutionTime = Date.now() - startTime

      return result
    }
  }

  /**
   * Execute migrations sequentially
   */
  private async executeSequential(
    plan: BulkMigrationPlan,
    userAddress: PublicKey,
    result: BulkMigrationResult,
    onProgress?: (progress: BulkMigrationProgress) => void
  ): Promise<void> {
    logger.debug('🔄 Executing sequential migration')

    for (let i = 0; i < plan.individualPlans.length; i++) {
      const migrationPlan = plan.individualPlans[i]
      const position = plan.positions[i]

      onProgress?.({
        planId: plan.id,
        status: 'executing',
        currentPosition: i + 1,
        totalPositions: plan.positions.length,
        completedPositions: result.results.filter(r => r.result.status === 'success').map(r => r.positionId),
        failedPositions: result.results.filter(r => r.result.status === 'failed').map(r => r.positionId),
        currentStep: `Migrating position ${i + 1}/${plan.positions.length}`,
        estimatedTimeRemaining: (plan.positions.length - i) * (plan.totalExecutionTime / plan.positions.length),
        percentComplete: (i / plan.positions.length) * 100
      })

      try {
        const migrationResult = await crossPoolMigrationEngine.executeMigrationPlan(
          migrationPlan,
          userAddress
        )

        result.results.push({
          positionId: position.id,
          result: migrationResult
        })

        result.totalGasUsed += migrationResult.gasUsed
      } catch (error) {
        logger.error(`❌ Position ${position.id} migration failed:`, error)

        result.results.push({
          positionId: position.id,
          result: {
            planId: migrationPlan.id,
            status: 'failed',
            executedSteps: [],
            failedSteps: [{
              stepId: 'execution',
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date()
            }],
            transactionIds: [],
            gasUsed: 0,
            executionTime: 0
          }
        })
      }

      // Small delay between migrations
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  /**
   * Execute migrations in parallel
   */
  private async executeParallel(
    plan: BulkMigrationPlan,
    userAddress: PublicKey,
    result: BulkMigrationResult,
    onProgress?: (progress: BulkMigrationProgress) => void
  ): Promise<void> {
    logger.debug('⚡ Executing parallel migration')

    // Split into batches to respect maxConcurrentMigrations
    const batches = this.createBatches(
      plan.individualPlans,
      this.maxConcurrentMigrations
    )

    let completedCount = 0

    for (const batch of batches) {
      const batchPromises = batch.map(async (migrationPlan) => {
        const positionIndex = plan.individualPlans.indexOf(migrationPlan)
        const position = plan.positions[positionIndex]

        try {
          const migrationResult = await crossPoolMigrationEngine.executeMigrationPlan(
            migrationPlan,
            userAddress
          )

          return {
            positionId: position.id,
            result: migrationResult
          }
        } catch (error) {
          logger.error(`❌ Position ${position.id} migration failed:`, error)

          return {
            positionId: position.id,
            result: {
              planId: migrationPlan.id,
              status: 'failed' as const,
              executedSteps: [],
              failedSteps: [{
                stepId: 'execution',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
              }],
              transactionIds: [],
              gasUsed: 0,
              executionTime: 0
            }
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      result.results.push(...batchResults)

      completedCount += batch.length

      onProgress?.({
        planId: plan.id,
        status: 'executing',
        currentPosition: completedCount,
        totalPositions: plan.positions.length,
        completedPositions: result.results.filter(r => r.result.status === 'success').map(r => r.positionId),
        failedPositions: result.results.filter(r => r.result.status === 'failed').map(r => r.positionId),
        currentStep: `Completed batch ${batches.indexOf(batch) + 1}/${batches.length}`,
        estimatedTimeRemaining: ((plan.positions.length - completedCount) / this.maxConcurrentMigrations) *
          (plan.totalExecutionTime / plan.positions.length),
        percentComplete: (completedCount / plan.positions.length) * 100
      })

      // Small delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }

    // Calculate total gas used
    result.totalGasUsed = result.results.reduce(
      (sum, r) => sum + r.result.gasUsed,
      0
    )
  }

  /**
   * Execute migrations in batches
   */
  private async executeBatched(
    plan: BulkMigrationPlan,
    userAddress: PublicKey,
    result: BulkMigrationResult,
    onProgress?: (progress: BulkMigrationProgress) => void
  ): Promise<void> {
    logger.debug('📦 Executing batched migration')

    // Group similar migrations together for optimization
    const batches = this.groupSimilarMigrations(plan.individualPlans, plan.positions)

    let completedCount = 0

    for (const batch of batches) {
      onProgress?.({
        planId: plan.id,
        status: 'executing',
        currentPosition: completedCount,
        totalPositions: plan.positions.length,
        completedPositions: result.results.filter(r => r.result.status === 'success').map(r => r.positionId),
        failedPositions: result.results.filter(r => r.result.status === 'failed').map(r => r.positionId),
        currentStep: `Processing batch ${batches.indexOf(batch) + 1}/${batches.length}`,
        estimatedTimeRemaining: (plan.positions.length - completedCount) *
          (plan.totalExecutionTime / plan.positions.length),
        percentComplete: (completedCount / plan.positions.length) * 100
      })

      // Execute batch in parallel
      const batchResults = await Promise.all(
        batch.plans.map(async (migrationPlan) => {
          const position = batch.positions[batch.plans.indexOf(migrationPlan)]

          try {
            const migrationResult = await crossPoolMigrationEngine.executeMigrationPlan(
              migrationPlan,
              userAddress
            )

            return {
              positionId: position.id,
              result: migrationResult
            }
          } catch (error) {
            return {
              positionId: position.id,
              result: {
                planId: migrationPlan.id,
                status: 'failed' as const,
                executedSteps: [],
                failedSteps: [{
                  stepId: 'execution',
                  error: error instanceof Error ? error.message : 'Unknown error',
                  timestamp: new Date()
                }],
                transactionIds: [],
                gasUsed: 0,
                executionTime: 0
              }
            }
          }
        })
      )

      result.results.push(...batchResults)
      completedCount += batch.plans.length

      result.totalGasUsed = result.results.reduce(
        (sum, r) => sum + r.result.gasUsed,
        0
      )

      // Delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
  }

  /**
   * Execute migrations in stages
   */
  private async executeStaged(
    plan: BulkMigrationPlan,
    userAddress: PublicKey,
    result: BulkMigrationResult,
    onProgress?: (progress: BulkMigrationProgress) => void
  ): Promise<void> {
    logger.debug('🎭 Executing staged migration')

    // Split into stages based on risk level
    const stages = this.createRiskBasedStages(plan)

    let completedCount = 0

    for (const stage of stages) {
      onProgress?.({
        planId: plan.id,
        status: 'executing',
        currentPosition: completedCount,
        totalPositions: plan.positions.length,
        completedPositions: result.results.filter(r => r.result.status === 'success').map(r => r.positionId),
        failedPositions: result.results.filter(r => r.result.status === 'failed').map(r => r.positionId),
        currentStep: `Stage ${stages.indexOf(stage) + 1}/${stages.length}: ${stage.riskLevel} risk`,
        estimatedTimeRemaining: (plan.positions.length - completedCount) *
          (plan.totalExecutionTime / plan.positions.length),
        percentComplete: (completedCount / plan.positions.length) * 100
      })

      // Execute stage sequentially for safety
      for (const migrationPlan of stage.plans) {
        const position = stage.positions[stage.plans.indexOf(migrationPlan)]

        try {
          const migrationResult = await crossPoolMigrationEngine.executeMigrationPlan(
            migrationPlan,
            userAddress
          )

          result.results.push({
            positionId: position.id,
            result: migrationResult
          })

          result.totalGasUsed += migrationResult.gasUsed
        } catch (error) {
          result.results.push({
            positionId: position.id,
            result: {
              planId: migrationPlan.id,
              status: 'failed' as const,
              executedSteps: [],
              failedSteps: [{
                stepId: 'execution',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
              }],
              transactionIds: [],
              gasUsed: 0,
              executionTime: 0
            }
          })
        }

        completedCount++

        // Small delay between migrations in same stage
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // Longer delay between stages
      if (stages.indexOf(stage) < stages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 10000))
      }
    }
  }

  /**
   * Determine optimal execution strategy
   */
  private determineOptimalStrategy(
    plans: CrossPoolMigrationPlan[],
    preferences: any
  ): 'sequential' | 'parallel' | 'batched' | 'staged' {
    // Safety-first: use staged approach
    if (preferences.prioritizeSafety) {
      return 'staged'
    }

    // Speed-first: use parallel if safe
    if (preferences.prioritizeSpeed) {
      const highRiskCount = plans.filter(p => p.riskLevel === 'high').length
      return highRiskCount > plans.length * 0.3 ? 'batched' : 'parallel'
    }

    // Default: batched for good balance
    return 'batched'
  }

  /**
   * Identify batch optimizations
   */
  private identifyBatchOptimizations(
    plans: CrossPoolMigrationPlan[],
    strategy: string
  ): BatchOptimization[] {
    const optimizations: BatchOptimization[] = []

    // Transaction batching
    if (strategy === 'batched' || strategy === 'parallel') {
      const gasSavings = plans.length * 0.001 // 0.001 SOL saved per position
      optimizations.push({
        id: 'tx-batching',
        type: 'transaction_batching',
        description: 'Batch multiple migrations to reduce transaction overhead',
        positions: plans.map(p => p.positionId),
        estimatedSavings: gasSavings,
        impact: {
          gasSavings,
          timeSavings: plans.length * 15, // 15 seconds saved per position
          riskReduction: 5 // 5 point risk reduction
        }
      })
    }

    // Route sharing
    const commonRoutes = this.findCommonRoutes(plans)
    if (commonRoutes > 1) {
      const gasSavings = commonRoutes * 0.0005
      optimizations.push({
        id: 'route-sharing',
        type: 'route_sharing',
        description: 'Share routing calculations across similar migrations',
        positions: plans.slice(0, commonRoutes).map(p => p.positionId),
        estimatedSavings: gasSavings,
        impact: {
          gasSavings,
          timeSavings: commonRoutes * 10,
          riskReduction: 0
        }
      })
    }

    return optimizations
  }

  /**
   * Calculate bulk execution time
   */
  private calculateBulkExecutionTime(
    plans: CrossPoolMigrationPlan[],
    strategy: string
  ): number {
    const totalSequentialTime = plans.reduce((sum, plan) => sum + plan.totalExecutionTime, 0)

    switch (strategy) {
      case 'sequential':
        return totalSequentialTime

      case 'parallel':
        // Divide by max concurrent, add overhead
        return (totalSequentialTime / this.maxConcurrentMigrations) * 1.2

      case 'batched':
        // 70% of sequential time due to batching
        return totalSequentialTime * 0.7

      case 'staged':
        // 80% of sequential time with stage delays
        return totalSequentialTime * 0.8

      default:
        return totalSequentialTime
    }
  }

  /**
   * Assess bulk migration risks
   */
  private assessBulkRisks(
    plans: CrossPoolMigrationPlan[],
    strategy: string
  ): BulkRiskAssessment {
    const positionRisks: PositionRisk[] = plans.map(plan => ({
      positionId: plan.positionId,
      riskLevel: plan.riskLevel,
      riskFactors: [
        `${plan.riskLevel} risk migration`,
        `${plan.steps.length} steps required`,
        `${plan.route.intermediateSwaps.length} intermediate swaps`
      ],
      failureImpact: plan.riskLevel === 'high' ? 'severe' : 'moderate',
      dependentPositions: []
    }))

    const avgRiskScore = plans.reduce((sum, plan) => {
      const score = plan.riskLevel === 'high' ? 70 : plan.riskLevel === 'medium' ? 40 : 20
      return sum + score
    }, 0) / plans.length

    const overallRisk = avgRiskScore > 60 ? 'high' :
                       avgRiskScore > 40 ? 'medium' : 'low'

    return {
      overallRisk,
      riskScore: avgRiskScore,
      positionRisks,
      correlatedRisks: [
        'Network congestion may affect all migrations',
        'Market volatility impacts all positions simultaneously',
        'Gas price spikes affect total cost'
      ],
      mitigationStrategies: [
        'Use staged execution for high-risk positions',
        'Implement rollback for all migrations',
        'Monitor network conditions in real-time',
        'Set conservative slippage tolerances'
      ],
      maxConcurrentMigrations: strategy === 'parallel' ? this.maxConcurrentMigrations : 1
    }
  }

  /**
   * Generate bulk migration recommendations
   */
  private generateBulkRecommendations(
    plans: CrossPoolMigrationPlan[],
    strategy: string,
    risks: BulkRiskAssessment
  ): string[] {
    const recommendations: string[] = []

    // Strategy recommendations
    recommendations.push(`Using ${strategy} execution strategy for optimal balance`)

    // Risk recommendations
    if (risks.overallRisk === 'high') {
      recommendations.push('Consider splitting into smaller batches due to high risk')
      recommendations.push('Enable rollback for all migrations')
    }

    // Performance recommendations
    if (plans.length > 10) {
      recommendations.push('Large bulk migration detected - consider multiple sessions')
    }

    // Cost recommendations
    const totalCost = plans.reduce((sum, p) => sum + p.totalGasCost, 0)
    if (totalCost > 0.1) {
      recommendations.push('Significant gas costs - consider gas price optimization')
    }

    return recommendations
  }

  /**
   * Generate bulk migration summary
   */
  private generateBulkSummary(
    plan: BulkMigrationPlan,
    result: BulkMigrationResult
  ): BulkMigrationSummary {
    const successRate = result.successfulMigrations / result.totalPositions

    const avgGasPerPosition = result.totalGasUsed / result.totalPositions
    const avgTimePerPosition = result.totalExecutionTime / result.totalPositions

    const gasCostVariance = ((plan.totalGasCost - result.totalGasUsed) / plan.totalGasCost) * 100
    const timeVariance = ((plan.totalExecutionTime - result.totalExecutionTime) / plan.totalExecutionTime) * 100

    const efficiencyScore = (successRate * 0.5 + (1 - Math.abs(gasCostVariance) / 100) * 0.3 +
      (1 - Math.abs(timeVariance) / 100) * 0.2) * 100

    const recommendations: string[] = []

    if (successRate < 1) {
      recommendations.push('Review failed migrations and retry with adjusted parameters')
    }

    if (Math.abs(gasCostVariance) > 20) {
      recommendations.push('Actual gas costs varied significantly from plan - review gas estimation')
    }

    return {
      successRate,
      avgGasPerPosition,
      avgTimePerPosition,
      totalCostSavings: plan.estimatedSavings,
      performanceMetrics: {
        plannedVsActual: {
          gasCost: {
            planned: plan.totalGasCost,
            actual: result.totalGasUsed,
            variance: gasCostVariance
          },
          time: {
            planned: plan.totalExecutionTime,
            actual: result.totalExecutionTime,
            variance: timeVariance
          }
        },
        efficiencyScore
      },
      recommendations
    }
  }

  /**
   * Create batches from plans
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * Group similar migrations
   */
  private groupSimilarMigrations(
    plans: CrossPoolMigrationPlan[],
    positions: DLMMPosition[]
  ): Array<{ plans: CrossPoolMigrationPlan[]; positions: DLMMPosition[] }> {
    // Simple grouping by target pool
    const groups = new Map<string, { plans: CrossPoolMigrationPlan[]; positions: DLMMPosition[] }>()

    plans.forEach((plan, index) => {
      const targetPool = plan.route.targetPool.toString()
      if (!groups.has(targetPool)) {
        groups.set(targetPool, { plans: [], positions: [] })
      }
      groups.get(targetPool)!.plans.push(plan)
      groups.get(targetPool)!.positions.push(positions[index])
    })

    return Array.from(groups.values())
  }

  /**
   * Create risk-based stages
   */
  private createRiskBasedStages(
    plan: BulkMigrationPlan
  ): Array<{ plans: CrossPoolMigrationPlan[]; positions: DLMMPosition[]; riskLevel: string }> {
    const stages: Array<{ plans: CrossPoolMigrationPlan[]; positions: DLMMPosition[]; riskLevel: string }> = []

    // Group by risk level
    const lowRisk = plan.individualPlans.filter(p => p.riskLevel === 'low')
    const mediumRisk = plan.individualPlans.filter(p => p.riskLevel === 'medium')
    const highRisk = plan.individualPlans.filter(p => p.riskLevel === 'high')

    if (lowRisk.length > 0) {
      stages.push({
        plans: lowRisk,
        positions: lowRisk.map(p => plan.positions[plan.individualPlans.indexOf(p)]),
        riskLevel: 'low'
      })
    }

    if (mediumRisk.length > 0) {
      stages.push({
        plans: mediumRisk,
        positions: mediumRisk.map(p => plan.positions[plan.individualPlans.indexOf(p)]),
        riskLevel: 'medium'
      })
    }

    if (highRisk.length > 0) {
      stages.push({
        plans: highRisk,
        positions: highRisk.map(p => plan.positions[plan.individualPlans.indexOf(p)]),
        riskLevel: 'high'
      })
    }

    return stages
  }

  /**
   * Find common routes
   */
  private findCommonRoutes(plans: CrossPoolMigrationPlan[]): number {
    const targetPools = new Set(plans.map(p => p.route.targetPool.toString()))
    return plans.length - targetPools.size + 1
  }

  /**
   * Clear migration cache
   */
  clearCache(): void {
    this.migrationCache.clear()
    logger.debug('🧹 Bulk migration cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { count: number; keys: string[] } {
    return {
      count: this.migrationCache.size,
      keys: Array.from(this.migrationCache.keys())
    }
  }
}

// Export singleton instance
export const bulkMigrationEngine = new BulkMigrationEngine(
  crossPoolMigrationEngine['connection']
)
