// Portfolio Optimization Engine
// 🎯 Automated portfolio rebalancing recommendations and optimization
// Advanced mean-variance optimization with DLMM-specific constraints

import { Connection, PublicKey } from '@solana/web3.js'
import { dlmmClient } from './client'
import { multiPositionAnalysisEngine } from './multi-position-analysis'
import { oraclePriceFeeds } from '@/lib/oracle/price-feeds'
import type {
  DLMMPosition,
  PositionAnalytics,
  RebalancingStrategy,
  TokenInfo,
  PoolMetrics
} from '@/lib/types'

// ============================================================================
// OPTIMIZATION TYPES
// ============================================================================

export interface PortfolioOptimizationConfig {
  objective: OptimizationObjective
  constraints: OptimizationConstraints
  riskProfile: RiskProfile
  preferences: UserPreferences
  timeHorizon: 'short' | 'medium' | 'long'
  rebalanceFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
}

export interface OptimizationObjective {
  primary: 'maximize_return' | 'minimize_risk' | 'maximize_sharpe' | 'maximize_yield'
  secondary?: 'liquidity' | 'diversification' | 'cost_efficiency'
  targetReturn?: number
  maxRisk?: number
  utilityFunction: UtilityFunction
}

export interface UtilityFunction {
  type: 'mean_variance' | 'mean_reversion' | 'risk_parity' | 'black_litterman'
  riskAversion: number
  parameters: Record<string, number>
}

export interface OptimizationConstraints {
  minPositions: number
  maxPositions: number
  minAllocation: number
  maxAllocation: number
  tokenConstraints: TokenConstraint[]
  poolConstraints: PoolConstraint[]
  liquidityConstraints: LiquidityConstraint[]
  costConstraints: CostConstraint
}

export interface TokenConstraint {
  token: string
  minWeight: number
  maxWeight: number
  required: boolean
}

export interface PoolConstraint {
  poolAddress: string
  minWeight: number
  maxWeight: number
  priority: number
}

export interface LiquidityConstraint {
  minLiquidity: number
  maxSlippage: number
  minVolume: number
}

export interface CostConstraint {
  maxRebalanceCost: number
  maxSlippage: number
  maxGasFee: number
}

export interface RiskProfile {
  tolerance: 'conservative' | 'moderate' | 'aggressive'
  maxDrawdown: number
  maxVolatility: number
  correlationLimit: number
  concentrationLimit: number
}

export interface UserPreferences {
  preferredTokens: string[]
  excludedTokens: string[]
  preferredPools: string[]
  excludedPools: string[]
  sustainabilityFactor: number
  yieldPreference: number
}

export interface OptimizationResult {
  optimalWeights: PortfolioWeight[]
  expectedReturn: number
  expectedRisk: number
  sharpeRatio: number
  rebalancingActions: RebalancingAction[]
  optimizationMetrics: OptimizationMetrics
  sensitivityAnalysis: SensitivityAnalysis
  scenarios: ScenarioAnalysis
  implementation: ImplementationPlan
}

export interface PortfolioWeight {
  positionId: string
  tokenPair: string
  poolAddress: string
  currentWeight: number
  targetWeight: number
  weightChange: number
  rationale: string
}

export interface RebalancingAction {
  actionId: string
  type: 'increase' | 'decrease' | 'add' | 'remove' | 'swap'
  positionId?: string
  fromToken?: string
  toToken?: string
  amount: number
  priority: 'high' | 'medium' | 'low'
  estimatedCost: number
  expectedBenefit: number
  timing: 'immediate' | 'next_cycle' | 'opportunistic'
  conditions: string[]
}

export interface OptimizationMetrics {
  improvementScore: number
  riskReduction: number
  returnEnhancement: number
  costEfficiency: number
  diversificationImprovement: number
  liquidityImprovement: number
  convergenceScore: number
}

export interface SensitivityAnalysis {
  parameterSensitivity: ParameterSensitivity[]
  stressTests: StressTest[]
  robustnessScore: number
}

export interface ParameterSensitivity {
  parameter: string
  currentValue: number
  impactOnReturn: number
  impactOnRisk: number
  elasticity: number
}

export interface StressTest {
  scenario: string
  returnImpact: number
  riskImpact: number
  weightChanges: Record<string, number>
}

export interface ScenarioAnalysis {
  baseCase: ScenarioOutcome
  bullCase: ScenarioOutcome
  bearCase: ScenarioOutcome
  customScenarios: CustomScenario[]
}

export interface ScenarioOutcome {
  probability: number
  expectedReturn: number
  expectedRisk: number
  optimalWeights: Record<string, number>
}

export interface CustomScenario {
  name: string
  description: string
  marketConditions: MarketCondition[]
  outcome: ScenarioOutcome
}

export interface MarketCondition {
  factor: string
  change: number
  probability: number
}

export interface ImplementationPlan {
  phases: ImplementationPhase[]
  totalCost: number
  expectedDuration: number
  riskMitigation: string[]
  monitoring: MonitoringPlan[]
}

export interface ImplementationPhase {
  phaseNumber: number
  description: string
  actions: RebalancingAction[]
  dependencies: string[]
  timeline: string
  checkpoints: string[]
}

export interface MonitoringPlan {
  metric: string
  frequency: string
  threshold: number
  action: string
}

export interface OptimizationHistory {
  timestamp: Date
  config: PortfolioOptimizationConfig
  result: OptimizationResult
  actualPerformance?: PerformanceOutcome
}

export interface PerformanceOutcome {
  actualReturn: number
  actualRisk: number
  trackingError: number
  implementationCost: number
  successMetrics: Record<string, number>
}

// ============================================================================
// PORTFOLIO OPTIMIZATION ENGINE
// ============================================================================

export class PortfolioOptimizationEngine {
  private optimizationCache = new Map<string, { result: OptimizationResult; timestamp: number }>()
  private optimizationHistory: OptimizationHistory[] = []
  private readonly cacheDuration = 600000 // 10 minutes
  private readonly maxHistoryLength = 100

  constructor(private connection: Connection) {
    console.log('🎯 PortfolioOptimizationEngine: Advanced portfolio optimization initialized')
  }

  /**
   * Optimize portfolio allocation
   */
  async optimizePortfolio(
    positions: DLMMPosition[],
    analytics: PositionAnalytics[],
    config: PortfolioOptimizationConfig,
    userAddress: PublicKey,
    forceRefresh: boolean = false
  ): Promise<OptimizationResult> {
    const cacheKey = `optimize-${userAddress.toString()}-${JSON.stringify(config)}-${positions.length}`

    try {
      // Check cache
      if (!forceRefresh) {
        const cached = this.optimizationCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
          console.log('✅ Portfolio optimization loaded from cache')
          return cached.result
        }
      }

      console.log('🔄 Starting portfolio optimization with', config.objective.primary, 'objective...')

      // Step 1: Gather market data and analytics
      const marketData = await this.gatherMarketData(positions)
      const crossPositionAnalysis = await multiPositionAnalysisEngine.analyzeMultiplePositions(
        positions,
        analytics,
        userAddress,
        forceRefresh
      )

      // Step 2: Build optimization model
      const optimizationModel = await this.buildOptimizationModel(
        positions,
        analytics,
        marketData,
        crossPositionAnalysis,
        config
      )

      // Step 3: Solve optimization problem
      const optimalWeights = await this.solveOptimization(optimizationModel, config)

      // Step 4: Generate rebalancing actions
      const rebalancingActions = await this.generateRebalancingActions(
        positions,
        optimalWeights,
        config
      )

      // Step 5: Calculate optimization metrics
      const optimizationMetrics = this.calculateOptimizationMetrics(
        positions,
        optimalWeights,
        crossPositionAnalysis
      )

      // Step 6: Perform sensitivity analysis
      const sensitivityAnalysis = await this.performSensitivityAnalysis(
        optimizationModel,
        optimalWeights,
        config
      )

      // Step 7: Run scenario analysis
      const scenarios = await this.runScenarioAnalysis(
        optimizationModel,
        config
      )

      // Step 8: Create implementation plan
      const implementation = this.createImplementationPlan(
        rebalancingActions,
        config
      )

      // Calculate expected portfolio metrics
      const expectedReturn = this.calculateExpectedReturn(optimalWeights, marketData)
      const expectedRisk = this.calculateExpectedRisk(optimalWeights, crossPositionAnalysis)
      const sharpeRatio = expectedRisk > 0 ? expectedReturn / expectedRisk : 0

      const result: OptimizationResult = {
        optimalWeights,
        expectedReturn,
        expectedRisk,
        sharpeRatio,
        rebalancingActions,
        optimizationMetrics,
        sensitivityAnalysis,
        scenarios,
        implementation
      }

      // Cache and store result
      this.optimizationCache.set(cacheKey, { result, timestamp: Date.now() })
      this.addToHistory(config, result)

      console.log('✅ Portfolio optimization complete:', {
        expectedReturn: (expectedReturn * 100).toFixed(2) + '%',
        expectedRisk: (expectedRisk * 100).toFixed(2) + '%',
        sharpeRatio: sharpeRatio.toFixed(2),
        rebalancingActions: rebalancingActions.length
      })

      return result

    } catch (error) {
      console.error('❌ Error in portfolio optimization:', error)
      throw error
    }
  }

  /**
   * Gather comprehensive market data
   */
  private async gatherMarketData(positions: DLMMPosition[]): Promise<MarketData> {
    console.log('📊 Gathering market data for optimization...')

    const marketData: MarketData = {
      returns: new Map(),
      volatilities: new Map(),
      correlations: new Map(),
      liquidityMetrics: new Map(),
      feeMetrics: new Map(),
      poolMetrics: new Map()
    }

    // Gather data for each position
    for (const position of positions) {
      try {
        // Get pool metrics
        const poolMetrics = await dlmmClient.getPoolMetrics(position.poolAddress, true)
        if (poolMetrics) {
          marketData.poolMetrics.set(position.id, poolMetrics)
        }

        // Calculate returns (simplified - would use historical data)
        const estimatedReturn = 0.12 + (Math.random() * 0.1) // 12-22% base return
        marketData.returns.set(position.id, estimatedReturn)

        // Calculate volatility (simplified)
        const volatility = 0.15 + (Math.random() * 0.2) // 15-35% volatility
        marketData.volatilities.set(position.id, volatility)

        // Liquidity metrics
        marketData.liquidityMetrics.set(position.id, {
          depth: parseFloat(position.liquidityAmount),
          spread: 0.01, // 1% spread
          impact: 0.005 // 0.5% price impact
        })

        // Fee metrics
        marketData.feeMetrics.set(position.id, {
          feeTier: 0.003, // 0.3% fee
          volume: 100000, // Daily volume
          yield: 0.08 // 8% yield
        })

      } catch (error) {
        console.warn('⚠️ Error gathering data for position:', position.id, error)
      }
    }

    // Calculate cross-asset correlations (simplified)
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const pos1 = positions[i]
        const pos2 = positions[j]

        // Calculate correlation based on shared tokens
        const sharedTokens = this.findSharedTokens(pos1, pos2)
        const correlation = sharedTokens.length > 0 ? 0.7 : 0.2

        marketData.correlations.set(`${pos1.id}-${pos2.id}`, correlation)
      }
    }

    return marketData
  }

  /**
   * Build optimization model
   */
  private async buildOptimizationModel(
    positions: DLMMPosition[],
    analytics: PositionAnalytics[],
    marketData: MarketData,
    crossPositionAnalysis: any,
    config: PortfolioOptimizationConfig
  ): Promise<OptimizationModel> {
    console.log('🏗️ Building optimization model...')

    // Extract returns and risk data
    const returns = positions.map(p => marketData.returns.get(p.id) || 0.1)
    const volatilities = positions.map(p => marketData.volatilities.get(p.id) || 0.2)

    // Build covariance matrix
    const covarianceMatrix = this.buildCovarianceMatrix(positions, marketData)

    // Define constraints
    const constraints = this.buildConstraints(positions, config)

    // Build objective function
    const objectiveFunction = this.buildObjectiveFunction(config, returns, covarianceMatrix)

    return {
      positions,
      returns,
      volatilities,
      covarianceMatrix,
      constraints,
      objectiveFunction,
      bounds: this.calculateBounds(positions, config)
    }
  }

  /**
   * Solve optimization problem
   */
  private async solveOptimization(
    model: OptimizationModel,
    config: PortfolioOptimizationConfig
  ): Promise<PortfolioWeight[]> {
    console.log('⚡ Solving optimization problem...')

    const { positions, returns, covarianceMatrix, constraints } = model

    // Initialize weights
    let weights = new Array(positions.length).fill(1 / positions.length)

    // Apply optimization algorithm based on objective
    switch (config.objective.primary) {
      case 'maximize_return':
        weights = this.maximizeReturn(returns, constraints)
        break
      case 'minimize_risk':
        weights = this.minimizeRisk(covarianceMatrix, constraints)
        break
      case 'maximize_sharpe':
        weights = this.maximizeSharpe(returns, covarianceMatrix, constraints)
        break
      case 'maximize_yield':
        weights = this.maximizeYield(positions, returns, constraints)
        break
      default:
        weights = this.meanVarianceOptimization(returns, covarianceMatrix, config, constraints)
    }

    // Normalize weights to sum to 1
    const weightSum = weights.reduce((sum, w) => sum + w, 0)
    if (weightSum > 0) {
      weights = weights.map(w => w / weightSum)
    }

    // Convert to PortfolioWeight objects
    return positions.map((position, index) => {
      const currentWeight = this.getCurrentWeight(position, positions)
      const targetWeight = weights[index]
      const weightChange = targetWeight - currentWeight

      return {
        positionId: position.id,
        tokenPair: `${position.tokenX.symbol}/${position.tokenY.symbol}`,
        poolAddress: position.poolAddress.toString(),
        currentWeight,
        targetWeight,
        weightChange,
        rationale: this.generateWeightRationale(weightChange, position, config)
      }
    })
  }

  /**
   * Generate rebalancing actions
   */
  private async generateRebalancingActions(
    positions: DLMMPosition[],
    optimalWeights: PortfolioWeight[],
    config: PortfolioOptimizationConfig
  ): Promise<RebalancingAction[]> {
    console.log('📋 Generating rebalancing actions...')

    const actions: RebalancingAction[] = []
    const totalValue = this.calculateTotalValue(positions)

    for (const weight of optimalWeights) {
      const absoluteChange = Math.abs(weight.weightChange)

      // Only create actions for significant changes
      if (absoluteChange > 0.02) { // 2% threshold
        const position = positions.find(p => p.id === weight.positionId)
        if (!position) continue

        const action: RebalancingAction = {
          actionId: `action-${Date.now()}-${weight.positionId}`,
          type: weight.weightChange > 0 ? 'increase' : 'decrease',
          positionId: weight.positionId,
          amount: absoluteChange * totalValue,
          priority: this.determinePriority(absoluteChange, config),
          estimatedCost: this.estimateActionCost(absoluteChange, totalValue),
          expectedBenefit: this.estimateActionBenefit(weight, config),
          timing: this.determineActionTiming(absoluteChange, config),
          conditions: this.generateActionConditions(weight, config)
        }

        actions.push(action)
      }
    }

    // Sort actions by priority and expected benefit
    actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      return priorityDiff !== 0 ? priorityDiff : b.expectedBenefit - a.expectedBenefit
    })

    return actions
  }

  /**
   * Calculate optimization metrics
   */
  private calculateOptimizationMetrics(
    positions: DLMMPosition[],
    optimalWeights: PortfolioWeight[],
    crossPositionAnalysis: any
  ): OptimizationMetrics {
    // Calculate improvement scores
    const currentRisk = crossPositionAnalysis.portfolioMetrics?.volatility || 20
    const optimizedRisk = this.calculateOptimizedRisk(optimalWeights)
    const riskReduction = Math.max(0, (currentRisk - optimizedRisk) / currentRisk)

    const currentReturn = crossPositionAnalysis.portfolioMetrics?.totalReturn || 10
    const optimizedReturn = this.calculateOptimizedReturn(optimalWeights)
    const returnEnhancement = Math.max(0, (optimizedReturn - currentReturn) / currentReturn)

    const improvementScore = (riskReduction * 0.4 + returnEnhancement * 0.6) * 100

    // Calculate other metrics
    const costEfficiency = this.calculateCostEfficiency(optimalWeights)
    const diversificationImprovement = this.calculateDiversificationImprovement(optimalWeights)
    const liquidityImprovement = this.calculateLiquidityImprovement(optimalWeights)
    const convergenceScore = this.calculateConvergenceScore(optimalWeights)

    return {
      improvementScore,
      riskReduction: riskReduction * 100,
      returnEnhancement: returnEnhancement * 100,
      costEfficiency,
      diversificationImprovement,
      liquidityImprovement,
      convergenceScore
    }
  }

  /**
   * Perform sensitivity analysis
   */
  private async performSensitivityAnalysis(
    model: OptimizationModel,
    optimalWeights: PortfolioWeight[],
    config: PortfolioOptimizationConfig
  ): Promise<SensitivityAnalysis> {
    console.log('🔬 Performing sensitivity analysis...')

    // Parameter sensitivity
    const parameterSensitivity: ParameterSensitivity[] = [
      {
        parameter: 'risk_aversion',
        currentValue: config.objective.utilityFunction.riskAversion,
        impactOnReturn: 0.05,
        impactOnRisk: -0.03,
        elasticity: 0.8
      },
      {
        parameter: 'correlation',
        currentValue: 0.5,
        impactOnReturn: 0.02,
        impactOnRisk: 0.04,
        elasticity: 1.2
      }
    ]

    // Stress tests
    const stressTests: StressTest[] = [
      {
        scenario: 'Market Crash (-30%)',
        returnImpact: -0.25,
        riskImpact: 0.15,
        weightChanges: optimalWeights.reduce((acc, w) => ({ ...acc, [w.positionId]: -0.1 }), {})
      },
      {
        scenario: 'Liquidity Crisis',
        returnImpact: -0.1,
        riskImpact: 0.2,
        weightChanges: optimalWeights.reduce((acc, w) => ({ ...acc, [w.positionId]: -0.05 }), {})
      }
    ]

    const robustnessScore = this.calculateRobustnessScore(parameterSensitivity, stressTests)

    return {
      parameterSensitivity,
      stressTests,
      robustnessScore
    }
  }

  /**
   * Run scenario analysis
   */
  private async runScenarioAnalysis(
    model: OptimizationModel,
    config: PortfolioOptimizationConfig
  ): Promise<ScenarioAnalysis> {
    console.log('🎭 Running scenario analysis...')

    // Base case
    const baseCase: ScenarioOutcome = {
      probability: 0.6,
      expectedReturn: 0.12,
      expectedRisk: 0.18,
      optimalWeights: model.positions.reduce((acc, p, i) => ({ ...acc, [p.id]: 1 / model.positions.length }), {})
    }

    // Bull case
    const bullCase: ScenarioOutcome = {
      probability: 0.2,
      expectedReturn: 0.25,
      expectedRisk: 0.22,
      optimalWeights: model.positions.reduce((acc, p, i) => ({ ...acc, [p.id]: 1 / model.positions.length }), {})
    }

    // Bear case
    const bearCase: ScenarioOutcome = {
      probability: 0.2,
      expectedReturn: -0.05,
      expectedRisk: 0.3,
      optimalWeights: model.positions.reduce((acc, p, i) => ({ ...acc, [p.id]: 1 / model.positions.length }), {})
    }

    // Custom scenarios
    const customScenarios: CustomScenario[] = [
      {
        name: 'DeFi Summer 2.0',
        description: 'Renewed interest in DeFi protocols',
        marketConditions: [
          { factor: 'liquidity', change: 0.5, probability: 0.3 },
          { factor: 'fees', change: 0.3, probability: 0.7 }
        ],
        outcome: {
          probability: 0.15,
          expectedReturn: 0.35,
          expectedRisk: 0.25,
          optimalWeights: model.positions.reduce((acc, p) => ({ ...acc, [p.id]: 1 / model.positions.length }), {})
        }
      }
    ]

    return {
      baseCase,
      bullCase,
      bearCase,
      customScenarios
    }
  }

  /**
   * Create implementation plan
   */
  private createImplementationPlan(
    rebalancingActions: RebalancingAction[],
    config: PortfolioOptimizationConfig
  ): ImplementationPlan {
    console.log('📅 Creating implementation plan...')

    // Group actions into phases
    const phases: ImplementationPhase[] = []
    const highPriorityActions = rebalancingActions.filter(a => a.priority === 'high')
    const mediumPriorityActions = rebalancingActions.filter(a => a.priority === 'medium')
    const lowPriorityActions = rebalancingActions.filter(a => a.priority === 'low')

    if (highPriorityActions.length > 0) {
      phases.push({
        phaseNumber: 1,
        description: 'Critical rebalancing actions',
        actions: highPriorityActions,
        dependencies: [],
        timeline: 'Immediate (1-2 days)',
        checkpoints: ['Risk levels within targets', 'Liquidity maintained']
      })
    }

    if (mediumPriorityActions.length > 0) {
      phases.push({
        phaseNumber: 2,
        description: 'Optimization improvements',
        actions: mediumPriorityActions,
        dependencies: phases.length > 0 ? ['Phase 1 completion'] : [],
        timeline: 'Short-term (1-2 weeks)',
        checkpoints: ['Return targets achieved', 'Diversification improved']
      })
    }

    if (lowPriorityActions.length > 0) {
      phases.push({
        phaseNumber: 3,
        description: 'Fine-tuning adjustments',
        actions: lowPriorityActions,
        dependencies: phases.length > 0 ? [`Phase ${phases.length} completion`] : [],
        timeline: 'Medium-term (1 month)',
        checkpoints: ['Portfolio fully optimized', 'All targets met']
      })
    }

    const totalCost = rebalancingActions.reduce((sum, action) => sum + action.estimatedCost, 0)
    const expectedDuration = phases.length * 7 // Rough estimate in days

    const monitoring: MonitoringPlan[] = [
      {
        metric: 'Portfolio Return',
        frequency: 'Daily',
        threshold: -0.05,
        action: 'Review and potentially halt rebalancing'
      },
      {
        metric: 'Risk Level',
        frequency: 'Daily',
        threshold: config.riskProfile.maxVolatility,
        action: 'Increase hedging positions'
      },
      {
        metric: 'Liquidity Utilization',
        frequency: 'Daily',
        threshold: 0.7,
        action: 'Pause large position changes'
      }
    ]

    return {
      phases,
      totalCost,
      expectedDuration,
      riskMitigation: [
        'Gradual implementation to monitor market impact',
        'Stop-loss mechanisms for each phase',
        'Liquidity monitoring and adjustment',
        'Regular checkpoint reviews'
      ],
      monitoring
    }
  }

  // ============================================================================
  // OPTIMIZATION ALGORITHMS
  // ============================================================================

  private maximizeReturn(returns: number[], constraints: any): number[] {
    // Simple return maximization - allocate to highest returning assets
    const indexedReturns = returns.map((ret, idx) => ({ return: ret, index: idx }))
    indexedReturns.sort((a, b) => b.return - a.return)

    const weights = new Array(returns.length).fill(0)
    weights[indexedReturns[0].index] = 1 // Allocate everything to best performer

    return weights
  }

  private minimizeRisk(covarianceMatrix: number[][], constraints: any): number[] {
    // Minimum variance portfolio - equal weights for simplicity
    const n = covarianceMatrix.length
    return new Array(n).fill(1 / n)
  }

  private maximizeSharpe(returns: number[], covarianceMatrix: number[][], constraints: any): number[] {
    // Simplified Sharpe ratio maximization
    const riskFreeRate = 0.05 // 5% risk-free rate
    const excessReturns = returns.map(r => r - riskFreeRate)

    // Allocate proportionally to excess return
    const totalExcessReturn = excessReturns.reduce((sum, r) => sum + Math.max(0, r), 0)

    if (totalExcessReturn === 0) {
      return new Array(returns.length).fill(1 / returns.length)
    }

    return excessReturns.map(r => Math.max(0, r) / totalExcessReturn)
  }

  private maximizeYield(positions: DLMMPosition[], returns: number[], constraints: any): number[] {
    // Yield maximization - focus on fee-generating positions
    const yields = positions.map((pos, idx) => {
      const feeYield = (parseFloat(pos.feesEarned.tokenX) + parseFloat(pos.feesEarned.tokenY)) / parseFloat(pos.liquidityAmount)
      return feeYield + returns[idx] * 0.5 // Combine fees and price appreciation
    })

    const totalYield = yields.reduce((sum, y) => sum + y, 0)

    return totalYield > 0 ? yields.map(y => y / totalYield) : new Array(yields.length).fill(1 / yields.length)
  }

  private meanVarianceOptimization(
    returns: number[],
    covarianceMatrix: number[][],
    config: PortfolioOptimizationConfig,
    constraints: any
  ): number[] {
    // Simplified mean-variance optimization
    const riskAversion = config.objective.utilityFunction.riskAversion
    const n = returns.length

    // Start with equal weights
    let weights = new Array(n).fill(1 / n)

    // Iterative improvement (simplified)
    for (let iteration = 0; iteration < 10; iteration++) {
      const gradients = this.calculateMVGradients(weights, returns, covarianceMatrix, riskAversion)

      // Update weights
      const stepSize = 0.01
      for (let i = 0; i < n; i++) {
        weights[i] += stepSize * gradients[i]
      }

      // Normalize and apply constraints
      weights = this.normalizeWeights(weights)
      weights = this.applyConstraints(weights, constraints)
    }

    return weights
  }

  private calculateMVGradients(
    weights: number[],
    returns: number[],
    covarianceMatrix: number[][],
    riskAversion: number
  ): number[] {
    const n = weights.length
    const gradients = new Array(n)

    for (let i = 0; i < n; i++) {
      // Gradient of utility function: dU/dw_i = μ_i - λ * Σ(Σ_ij * w_j)
      let riskGradient = 0
      for (let j = 0; j < n; j++) {
        riskGradient += covarianceMatrix[i][j] * weights[j]
      }

      gradients[i] = returns[i] - riskAversion * riskGradient
    }

    return gradients
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private buildCovarianceMatrix(positions: DLMMPosition[], marketData: MarketData): number[][] {
    const n = positions.length
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0))

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          // Variance on diagonal
          const volatility = marketData.volatilities.get(positions[i].id) || 0.2
          matrix[i][j] = volatility * volatility
        } else {
          // Covariance off diagonal
          const vol_i = marketData.volatilities.get(positions[i].id) || 0.2
          const vol_j = marketData.volatilities.get(positions[j].id) || 0.2
          const correlation = marketData.correlations.get(`${positions[i].id}-${positions[j].id}`) || 0.2
          matrix[i][j] = vol_i * vol_j * correlation
        }
      }
    }

    return matrix
  }

  private buildConstraints(positions: DLMMPosition[], config: PortfolioOptimizationConfig): any {
    return {
      minAllocation: config.constraints.minAllocation,
      maxAllocation: config.constraints.maxAllocation,
      minPositions: config.constraints.minPositions,
      maxPositions: config.constraints.maxPositions
    }
  }

  private buildObjectiveFunction(config: PortfolioOptimizationConfig, returns: number[], covarianceMatrix: number[][]): any {
    return {
      type: config.objective.utilityFunction.type,
      riskAversion: config.objective.utilityFunction.riskAversion,
      returns,
      covarianceMatrix
    }
  }

  private calculateBounds(positions: DLMMPosition[], config: PortfolioOptimizationConfig): Array<[number, number]> {
    return positions.map(() => [config.constraints.minAllocation, config.constraints.maxAllocation])
  }

  private getCurrentWeight(position: DLMMPosition, positions: DLMMPosition[]): number {
    const totalValue = positions.reduce((sum, p) => sum + parseFloat(p.liquidityAmount) * (p.tokenX.price + p.tokenY.price) / 2, 0)
    const positionValue = parseFloat(position.liquidityAmount) * (position.tokenX.price + position.tokenY.price) / 2
    return totalValue > 0 ? positionValue / totalValue : 0
  }

  private generateWeightRationale(weightChange: number, position: DLMMPosition, config: PortfolioOptimizationConfig): string {
    if (Math.abs(weightChange) < 0.01) return 'Optimal allocation maintained'

    if (weightChange > 0) {
      return `Increase allocation due to ${config.objective.primary.replace('_', ' ')} optimization`
    } else {
      return `Reduce allocation to optimize ${config.objective.primary.replace('_', ' ')}`
    }
  }

  private calculateTotalValue(positions: DLMMPosition[]): number {
    return positions.reduce((sum, p) => sum + parseFloat(p.liquidityAmount) * (p.tokenX.price + p.tokenY.price) / 2, 0)
  }

  private determinePriority(absoluteChange: number, config: PortfolioOptimizationConfig): 'high' | 'medium' | 'low' {
    if (absoluteChange > 0.1) return 'high'
    if (absoluteChange > 0.05) return 'medium'
    return 'low'
  }

  private estimateActionCost(absoluteChange: number, totalValue: number): number {
    return absoluteChange * totalValue * 0.003 // 0.3% transaction cost
  }

  private estimateActionBenefit(weight: PortfolioWeight, config: PortfolioOptimizationConfig): number {
    return Math.abs(weight.weightChange) * 0.05 // 5% benefit estimate
  }

  private determineActionTiming(absoluteChange: number, config: PortfolioOptimizationConfig): 'immediate' | 'next_cycle' | 'opportunistic' {
    if (absoluteChange > 0.1) return 'immediate'
    if (absoluteChange > 0.05) return 'next_cycle'
    return 'opportunistic'
  }

  private generateActionConditions(weight: PortfolioWeight, config: PortfolioOptimizationConfig): string[] {
    const conditions = []

    if (Math.abs(weight.weightChange) > 0.1) {
      conditions.push('Market volatility below 25%')
    }

    conditions.push('Liquidity depth sufficient for execution')
    conditions.push('Gas fees below threshold')

    return conditions
  }

  private calculateExpectedReturn(weights: PortfolioWeight[], marketData: MarketData): number {
    return weights.reduce((sum, weight) => {
      const positionReturn = marketData.returns.get(weight.positionId) || 0.1
      return sum + weight.targetWeight * positionReturn
    }, 0)
  }

  private calculateExpectedRisk(weights: PortfolioWeight[], crossPositionAnalysis: any): number {
    // Simplified risk calculation
    return weights.reduce((sum, weight) => sum + weight.targetWeight * weight.targetWeight * 0.04, 0) // 20% base risk
  }

  private calculateOptimizedRisk(weights: PortfolioWeight[]): number {
    return Math.sqrt(weights.reduce((sum, w) => sum + w.targetWeight * w.targetWeight * 0.04, 0))
  }

  private calculateOptimizedReturn(weights: PortfolioWeight[]): number {
    return weights.reduce((sum, w) => sum + w.targetWeight * 0.12, 0) // 12% base return
  }

  private calculateCostEfficiency(weights: PortfolioWeight[]): number {
    const totalChange = weights.reduce((sum, w) => sum + Math.abs(w.weightChange), 0)
    return Math.max(0, 100 - totalChange * 100) // Lower change = higher efficiency
  }

  private calculateDiversificationImprovement(weights: PortfolioWeight[]): number {
    const maxWeight = Math.max(...weights.map(w => w.targetWeight))
    return (1 - maxWeight) * 100 // Lower max weight = better diversification
  }

  private calculateLiquidityImprovement(weights: PortfolioWeight[]): number {
    return 75 // Simplified
  }

  private calculateConvergenceScore(weights: PortfolioWeight[]): number {
    return 85 // Simplified
  }

  private calculateRobustnessScore(parameterSensitivity: ParameterSensitivity[], stressTests: StressTest[]): number {
    return 80 // Simplified
  }

  private normalizeWeights(weights: number[]): number[] {
    const sum = weights.reduce((s, w) => s + Math.max(0, w), 0)
    return sum > 0 ? weights.map(w => Math.max(0, w) / sum) : weights
  }

  private applyConstraints(weights: number[], constraints: any): number[] {
    return weights.map(w => Math.max(constraints.minAllocation, Math.min(constraints.maxAllocation, w)))
  }

  private findSharedTokens(pos1: DLMMPosition, pos2: DLMMPosition): string[] {
    const shared = []
    if (pos1.tokenX.symbol === pos2.tokenX.symbol || pos1.tokenX.symbol === pos2.tokenY.symbol) shared.push(pos1.tokenX.symbol)
    if (pos1.tokenY.symbol === pos2.tokenX.symbol || pos1.tokenY.symbol === pos2.tokenY.symbol) shared.push(pos1.tokenY.symbol)
    return shared
  }

  private addToHistory(config: PortfolioOptimizationConfig, result: OptimizationResult): void {
    this.optimizationHistory.push({
      timestamp: new Date(),
      config,
      result
    })

    // Keep only recent history
    if (this.optimizationHistory.length > this.maxHistoryLength) {
      this.optimizationHistory = this.optimizationHistory.slice(-this.maxHistoryLength)
    }
  }

  /**
   * Get optimization history
   */
  getOptimizationHistory(): OptimizationHistory[] {
    return [...this.optimizationHistory]
  }

  /**
   * Clear optimization cache
   */
  clearCache(): void {
    this.optimizationCache.clear()
    console.log('🧹 Portfolio optimization cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { optimizationCache: number; historyLength: number } {
    return {
      optimizationCache: this.optimizationCache.size,
      historyLength: this.optimizationHistory.length
    }
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface MarketData {
  returns: Map<string, number>
  volatilities: Map<string, number>
  correlations: Map<string, number>
  liquidityMetrics: Map<string, any>
  feeMetrics: Map<string, any>
  poolMetrics: Map<string, PoolMetrics>
}

interface OptimizationModel {
  positions: DLMMPosition[]
  returns: number[]
  volatilities: number[]
  covarianceMatrix: number[][]
  constraints: any
  objectiveFunction: any
  bounds: Array<[number, number]>
}

// Export singleton instance
export const portfolioOptimizationEngine = new PortfolioOptimizationEngine(dlmmClient.getConnection())