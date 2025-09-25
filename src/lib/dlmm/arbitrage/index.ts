// Cross-Pool Arbitrage Detection System
// Complete enterprise-grade arbitrage infrastructure for DLMM
// Part of 100% SDK utilization achievement (Feature 3/3)

export {
  CrossPoolArbitrageEngine,
  type ArbitrageOpportunity,
  type ArbitragePool,
  type ArbitragePath,
  type RouteStep,
  type ProfitabilityMetrics,
  type RiskAssessment,
  type ExecutionStep,
  type MEVProtection
} from './detection-engine'

export {
  ArbitrageProfitabilityCalculator,
  type DetailedProfitabilityAnalysis,
  type ProfitabilityScenario,
  type RiskAdjustedProfitability,
  type CostBreakdown,
  type MarketImpactAnalysis,
  type ProfitabilityRecommendation,
  type SensitivityAnalysis,
  type TransactionCost,
  type SlippageImpact,
  type LiquidityAnalysis,
  type CompetitionAnalysis,
  type TemporalDecayAnalysis
} from './profitability-calculator'

export {
  ArbitrageExecutionPlanner,
  type ExecutionPlan,
  type ExecutionStrategy,
  type MEVProtectionPlan,
  type MEVProtectionStrategy,
  type ContingencyPlan,
  type RiskManagementPlan,
  type ExecutionTiming,
  type ExecutionResults,
  type ExecutionPreferences
} from './execution-planner'

// Main Arbitrage Manager Class
import { Connection, PublicKey } from '@solana/web3.js'
import { Wallet } from '@solana/wallet-adapter-react'
import { CrossPoolArbitrageEngine } from './detection-engine'
import { ArbitrageProfitabilityCalculator } from './profitability-calculator'
import { ArbitrageExecutionPlanner } from './execution-planner'
import { TokenInfo } from '@/lib/types'

export interface ArbitrageManagerConfig {
  connection: Connection
  wallet: Wallet
  minProfitThreshold?: number
  maxRiskScore?: number
  enableMEVProtection?: boolean
  monitoringEnabled?: boolean
}

export interface ArbitrageStats {
  totalOpportunitiesDetected: number
  totalProfitRealized: number
  averageExecutionTime: number
  successRate: number
  mevProtectionEffectiveness: number
  riskAdjustedReturn: number
}

/**
 * Complete Cross-Pool Arbitrage Management System
 *
 * This class provides enterprise-grade arbitrage capabilities:
 * - Multi-pattern opportunity detection (direct, triangular, multi-hop)
 * - Advanced profitability analysis with risk-adjusted metrics
 * - MEV-protected execution planning with contingencies
 * - Real-time monitoring and performance tracking
 *
 * Features:
 * - AI-powered opportunity detection across DLMM pools
 * - Sophisticated risk analysis (VaR, CVaR, Sharpe ratios)
 * - Anti-MEV execution strategies (private mempool, jitter timing)
 * - Comprehensive cost analysis (gas, slippage, opportunity cost)
 * - Real-time market impact assessment
 * - Automated contingency planning and risk management
 */
export class ArbitrageManager {
  private detectionEngine: CrossPoolArbitrageEngine
  private profitabilityCalculator: ArbitrageProfitabilityCalculator
  private executionPlanner: ArbitrageExecutionPlanner
  private config: ArbitrageManagerConfig
  private stats: ArbitrageStats
  private isActive = false

  constructor(config: ArbitrageManagerConfig) {
    this.config = {
      minProfitThreshold: 10, // $10 minimum
      maxRiskScore: 0.7, // 70% max risk
      enableMEVProtection: true,
      monitoringEnabled: true,
      ...config
    }

    this.detectionEngine = new CrossPoolArbitrageEngine(config.connection)
    this.profitabilityCalculator = new ArbitrageProfitabilityCalculator()
    this.executionPlanner = new ArbitrageExecutionPlanner(config.connection, config.wallet)

    this.stats = {
      totalOpportunitiesDetected: 0,
      totalProfitRealized: 0,
      averageExecutionTime: 0,
      successRate: 0,
      mevProtectionEffectiveness: 0,
      riskAdjustedReturn: 0
    }

    console.log('ArbitrageManager initialized with enterprise-grade features')
  }

  /**
   * Start monitoring for arbitrage opportunities across tracked pools
   */
  async startArbitrageSystem(): Promise<void> {
    if (this.isActive) {
      console.warn('Arbitrage system already active')
      return
    }

    this.isActive = true

    if (this.config.monitoringEnabled) {
      await this.detectionEngine.startMonitoring()
    }

    console.log('✅ Cross-pool arbitrage system started')
    console.log(`🎯 Min profit threshold: $${this.config.minProfitThreshold}`)
    console.log(`⚡ MEV protection: ${this.config.enableMEVProtection ? 'Enabled' : 'Disabled'}`)
    console.log(`📊 Real-time monitoring: ${this.config.monitoringEnabled ? 'Active' : 'Manual'}`)
  }

  /**
   * Stop the arbitrage monitoring system
   */
  async stopArbitrageSystem(): Promise<void> {
    if (!this.isActive) return

    this.detectionEngine.stopMonitoring()
    this.isActive = false

    console.log('🛑 Cross-pool arbitrage system stopped')
  }

  /**
   * Add a DLMM pool to arbitrage monitoring
   */
  async addPoolToMonitoring(
    poolAddress: PublicKey,
    tokenX: TokenInfo,
    tokenY: TokenInfo
  ): Promise<void> {
    await this.detectionEngine.addPool(poolAddress, tokenX, tokenY)
    console.log(`📍 Added pool ${tokenX.symbol}/${tokenY.symbol} to arbitrage monitoring`)
  }

  /**
   * Remove a pool from arbitrage monitoring
   */
  removePoolFromMonitoring(poolAddress: PublicKey): void {
    this.detectionEngine.removePool(poolAddress)
    console.log(`🗑️ Removed pool from arbitrage monitoring`)
  }

  /**
   * Get currently detected arbitrage opportunities
   */
  getActiveOpportunities() {
    const opportunities = this.detectionEngine.getActiveOpportunities()
    this.stats.totalOpportunitiesDetected += opportunities.length

    return opportunities
      .filter(opp => opp.profitability.netProfit >= this.config.minProfitThreshold!)
      .filter(opp => this.calculateRiskScore(opp.risk) <= this.config.maxRiskScore!)
  }

  /**
   * Analyze profitability of a specific opportunity
   */
  async analyzeOpportunityProfitability(
    opportunity: ArbitrageOpportunity,
    inputAmount: number
  ) {
    return await this.profitabilityCalculator.calculateDetailedProfitability(
      opportunity,
      inputAmount
    )
  }

  /**
   * Create execution plan for an arbitrage opportunity
   */
  async createExecutionPlan(
    opportunity: ArbitrageOpportunity,
    inputAmount: number,
    preferences: ExecutionPreferences = {}
  ) {
    const profitabilityAnalysis = await this.analyzeOpportunityProfitability(
      opportunity,
      inputAmount
    )

    const executionPrefs = {
      useMEVProtection: this.config.enableMEVProtection,
      ...preferences
    }

    return await this.executionPlanner.createExecutionPlan(
      opportunity,
      profitabilityAnalysis,
      executionPrefs
    )
  }

  /**
   * Execute an arbitrage opportunity with full protection and monitoring
   */
  async executeArbitrage(
    opportunity: ArbitrageOpportunity,
    inputAmount: number,
    preferences: ExecutionPreferences = {}
  ) {
    try {
      console.log(`🚀 Executing arbitrage: ${opportunity.type} (${opportunity.path.complexity})`)
      console.log(`💰 Expected profit: $${opportunity.profitability.netProfit.toFixed(2)}`)

      const executionPlan = await this.createExecutionPlan(opportunity, inputAmount, preferences)

      console.log(`📋 Execution plan created: ${executionPlan.executionStrategy.type}`)
      console.log(`🛡️ MEV protection: ${executionPlan.mevProtection.strategies.length} strategies`)

      const results = await this.executionPlanner.executeArbitragePlan(executionPlan.id)

      // Update statistics
      this.updateStats(results)

      console.log(`✅ Arbitrage executed successfully`)
      console.log(`💵 Actual profit: $${results.actualProfit.toFixed(2)}`)
      console.log(`⏱️ Execution time: ${results.executionTime}ms`)

      return results

    } catch (error) {
      console.error('❌ Arbitrage execution failed:', error)
      throw error
    }
  }

  /**
   * Get the best arbitrage opportunity for a specific token and amount
   */
  async getBestOpportunityForToken(token: TokenInfo, amount: number) {
    return await this.detectionEngine.getBestOpportunityForAmount(token, amount)
  }

  /**
   * Get comprehensive arbitrage system statistics
   */
  getArbitrageStats(): ArbitrageStats & {
    detectionStats: any
    executionStats: any
    isSystemActive: boolean
  } {
    return {
      ...this.stats,
      detectionStats: this.detectionEngine.getMonitoringStats(),
      executionStats: this.executionPlanner.getExecutionStatistics(),
      isSystemActive: this.isActive
    }
  }

  /**
   * Get system health and performance metrics
   */
  getSystemHealth() {
    const detectionStats = this.detectionEngine.getMonitoringStats()
    const executionStats = this.executionPlanner.getExecutionStatistics()

    return {
      status: this.isActive ? 'active' : 'inactive',
      monitored_pools: detectionStats.trackedPools,
      active_opportunities: detectionStats.activeOpportunities,
      total_profit_potential: detectionStats.totalProfitPotential,
      average_risk_score: detectionStats.averageRiskScore,
      execution_success_rate: executionStats.successRate || 0,
      average_execution_time: executionStats.averageExecutionTime || 0,
      mev_protection_active: this.config.enableMEVProtection,
      last_updated: new Date().toISOString()
    }
  }

  // Private helper methods
  private calculateRiskScore(risk: RiskAssessment): number {
    return (risk.liquidityRisk + risk.slippageRisk + risk.mevRisk +
           risk.temporalRisk + risk.competitionRisk) / 5
  }

  private updateStats(results: ExecutionResults): void {
    if (results.success) {
      this.stats.totalProfitRealized += results.actualProfit
    }

    // Update averages (simplified)
    this.stats.averageExecutionTime =
      (this.stats.averageExecutionTime + results.executionTime) / 2

    // Update success rate (would need proper tracking in real implementation)
    this.stats.successRate = results.success ?
      Math.min(this.stats.successRate + 0.1, 1.0) :
      Math.max(this.stats.successRate - 0.1, 0.0)

    this.stats.mevProtectionEffectiveness = results.mevProtectionEffective ?
      Math.min(this.stats.mevProtectionEffectiveness + 0.05, 1.0) :
      Math.max(this.stats.mevProtectionEffectiveness - 0.05, 0.0)
  }
}

// Export main interfaces from all modules
export type {
  ArbitrageOpportunity,
  ArbitragePool,
  DetailedProfitabilityAnalysis,
  ExecutionPlan,
  ExecutionResults
} from './detection-engine'

export type { ExecutionPreferences } from './execution-planner'

// Singleton instance for global access
let arbitrageManagerInstance: ArbitrageManager | null = null

export function createArbitrageManager(config: ArbitrageManagerConfig): ArbitrageManager {
  arbitrageManagerInstance = new ArbitrageManager(config)
  return arbitrageManagerInstance
}

export function getArbitrageManager(): ArbitrageManager | null {
  return arbitrageManagerInstance
}

export default ArbitrageManager