import { PublicKey } from '@solana/web3.js'
import { ArbitrageOpportunity, ArbitragePool, RouteStep, ProfitabilityMetrics } from './detection-engine'
import { TokenInfo } from '@/lib/types'

export interface DetailedProfitabilityAnalysis {
  baseAnalysis: ProfitabilityMetrics
  scenarios: ProfitabilityScenario[]
  riskAdjustedMetrics: RiskAdjustedProfitability
  costBreakdown: CostBreakdown
  marketImpact: MarketImpactAnalysis
  recommendations: ProfitabilityRecommendation[]
  sensitivity: SensitivityAnalysis
}

export interface ProfitabilityScenario {
  name: string
  description: string
  probability: number
  inputAmount: number
  expectedProfit: number
  worstCaseProfit: number
  bestCaseProfit: number
  executionTime: number
  gasRequired: number
}

export interface RiskAdjustedProfitability {
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdown: number
  valueAtRisk: number // 95% VaR
  conditionalValueAtRisk: number // 95% CVaR
  probabilityOfProfit: number
  expectedShortfall: number
}

export interface CostBreakdown {
  transactionFees: TransactionCost[]
  slippageImpact: SlippageImpact[]
  mevProtectionCost: number
  opportunityCost: number
  capitalRequirement: number
  totalCosts: number
  costRatio: number // costs / potential profit
}

export interface TransactionCost {
  step: number
  description: string
  baseFee: number
  priorityFee: number
  computeUnits: number
  estimatedFee: number
}

export interface SlippageImpact {
  poolAddress: PublicKey
  tokenPair: string
  expectedSlippage: number
  worstCaseSlippage: number
  slippageCost: number
  liquidityDepth: number
}

export interface MarketImpactAnalysis {
  priceImpact: PriceImpactTier[]
  liquidityAnalysis: LiquidityAnalysis
  competitionRisk: CompetitionAnalysis
  temporalDecay: TemporalDecayAnalysis
}

export interface PriceImpactTier {
  amountRange: { min: number; max: number }
  averageImpact: number
  maximumImpact: number
  liquidityUtilization: number
  recommendedMaxAmount: number
}

export interface LiquidityAnalysis {
  totalLiquidity: number
  activeLiquidity: number
  liquidityDistribution: { binId: number; liquidity: number; distance: number }[]
  liquidityDepthScore: number
  liquidityStability: number
}

export interface CompetitionAnalysis {
  historicalCompetition: number
  mevBotActivity: number
  averageExecutionDelay: number
  successRate: number
  competitionPressure: 'low' | 'medium' | 'high' | 'extreme'
}

export interface TemporalDecayAnalysis {
  halfLife: number // seconds until 50% profit decay
  decayRate: number
  sustainabilityScore: number
  optimalExecutionWindow: number
}

export interface ProfitabilityRecommendation {
  type: 'amount_optimization' | 'timing' | 'route_modification' | 'risk_mitigation'
  priority: 'high' | 'medium' | 'low'
  description: string
  expectedImprovement: number
  implementationCost: number
  netBenefit: number
}

export interface SensitivityAnalysis {
  priceVolatility: { factor: number; impactOnProfit: number }[]
  gasPrice: { factor: number; impactOnProfit: number }[]
  slippage: { factor: number; impactOnProfit: number }[]
  competition: { factor: number; impactOnProfit: number }[]
  executionTime: { delaySeconds: number; impactOnProfit: number }[]
}

export class ArbitrageProfitabilityCalculator {
  private readonly GAS_PRICE_SOL = 0.000005 // 5 lamports per compute unit
  private readonly COMPUTE_UNITS_PER_SWAP = 200000
  private readonly COMPUTE_UNITS_PER_ADD_LIQUIDITY = 300000
  private readonly COMPUTE_UNITS_PER_REMOVE_LIQUIDITY = 250000
  private readonly MEV_PROTECTION_BASE_COST = 0.01 // 1% of trade value
  private readonly SLIPPAGE_BUFFER = 1.2 // 20% buffer on estimated slippage

  async calculateDetailedProfitability(
    opportunity: ArbitrageOpportunity,
    inputAmount: number,
    marketConditions: MarketConditions = {}
  ): Promise<DetailedProfitabilityAnalysis> {

    const baseAnalysis = await this.calculateBaseProfitability(opportunity, inputAmount)
    const scenarios = await this.generateProfitabilityScenarios(opportunity, inputAmount)
    const riskAdjustedMetrics = await this.calculateRiskAdjustedMetrics(opportunity, scenarios)
    const costBreakdown = await this.analyzeCosts(opportunity, inputAmount)
    const marketImpact = await this.analyzeMarketImpact(opportunity, inputAmount)
    const recommendations = await this.generateRecommendations(opportunity, baseAnalysis, marketImpact)
    const sensitivity = await this.performSensitivityAnalysis(opportunity, inputAmount)

    return {
      baseAnalysis,
      scenarios,
      riskAdjustedMetrics,
      costBreakdown,
      marketImpact,
      recommendations,
      sensitivity
    }
  }

  async calculateBaseProfitability(
    opportunity: ArbitrageOpportunity,
    inputAmount: number
  ): Promise<ProfitabilityMetrics> {

    const route = opportunity.path.route
    let currentAmount = inputAmount
    let totalGasCost = 0
    let totalSlippageCost = 0

    // Simulate execution through route
    for (const step of route) {
      const stepGasCost = this.calculateStepGasCost(step)
      const slippageImpact = this.calculateSlippageImpact(step, currentAmount)

      totalGasCost += stepGasCost
      totalSlippageCost += slippageImpact.cost
      currentAmount = slippageImpact.outputAmount
    }

    const grossProfit = currentAmount - inputAmount
    const mevProtectionCost = inputAmount * this.MEV_PROTECTION_BASE_COST
    const priorityFees = totalGasCost * 0.5 // 50% markup for priority
    const totalCosts = totalGasCost + totalSlippageCost + mevProtectionCost + priorityFees
    const netProfit = grossProfit - totalCosts

    return {
      grossProfit,
      netProfit,
      profitMargin: netProfit / inputAmount,
      returnOnInvestment: netProfit / inputAmount,
      breakevenAmount: this.calculateBreakevenAmount(opportunity),
      maxProfitableAmount: this.calculateMaxProfitableAmount(opportunity),
      gasCosts: totalGasCost + priorityFees,
      priorityFees
    }
  }

  private calculateStepGasCost(step: RouteStep): number {
    let computeUnits = 0

    switch (step.action || 'swap') {
      case 'swap':
        computeUnits = this.COMPUTE_UNITS_PER_SWAP
        break
      case 'add_liquidity':
        computeUnits = this.COMPUTE_UNITS_PER_ADD_LIQUIDITY
        break
      case 'remove_liquidity':
        computeUnits = this.COMPUTE_UNITS_PER_REMOVE_LIQUIDITY
        break
      default:
        computeUnits = this.COMPUTE_UNITS_PER_SWAP
    }

    return computeUnits * this.GAS_PRICE_SOL
  }

  private calculateSlippageImpact(step: RouteStep, inputAmount: number): { cost: number; outputAmount: number } {
    const expectedSlippage = step.priceImpact || 0.001
    const bufferedSlippage = expectedSlippage * this.SLIPPAGE_BUFFER

    const slippageCost = inputAmount * bufferedSlippage
    const outputAmount = step.amountOut * (1 - bufferedSlippage)

    return { cost: slippageCost, outputAmount }
  }

  private calculateBreakevenAmount(opportunity: ArbitrageOpportunity): number {
    // Calculate minimum amount needed to break even given fixed and variable costs
    const fixedCosts = this.estimateFixedCosts(opportunity)
    const variableCostRate = this.estimateVariableCostRate(opportunity)
    const grossProfitRate = this.estimateGrossProfitRate(opportunity)

    if (grossProfitRate <= variableCostRate) return Infinity

    return fixedCosts / (grossProfitRate - variableCostRate)
  }

  private calculateMaxProfitableAmount(opportunity: ArbitrageOpportunity): number {
    // Calculate maximum amount before slippage makes trade unprofitable
    const pools = opportunity.pools
    const minLiquidity = Math.min(...pools.map(pool => pool.liquidity))

    // Conservative estimate: use 10% of minimum pool liquidity
    return minLiquidity * 0.1
  }

  private estimateFixedCosts(opportunity: ArbitrageOpportunity): number {
    return opportunity.executionPlan.length * this.COMPUTE_UNITS_PER_SWAP * this.GAS_PRICE_SOL
  }

  private estimateVariableCostRate(opportunity: ArbitrageOpportunity): number {
    // Variable costs as percentage of trade amount (slippage, MEV protection)
    const avgSlippage = opportunity.path.route.reduce((sum, step) => sum + (step.priceImpact || 0), 0) / opportunity.path.route.length
    return avgSlippage * this.SLIPPAGE_BUFFER + this.MEV_PROTECTION_BASE_COST
  }

  private estimateGrossProfitRate(opportunity: ArbitrageOpportunity): number {
    // Gross profit rate based on price differential
    return opportunity.profitability.profitMargin + this.estimateVariableCostRate(opportunity)
  }

  private async generateProfitabilityScenarios(
    opportunity: ArbitrageOpportunity,
    baseAmount: number
  ): Promise<ProfitabilityScenario[]> {

    const scenarios: ProfitabilityScenario[] = []

    // Conservative scenario (75% of expected profit)
    scenarios.push({
      name: 'Conservative',
      description: 'Higher slippage, competition, and execution delays',
      probability: 0.3,
      inputAmount: baseAmount,
      expectedProfit: opportunity.profitability.netProfit * 0.75,
      worstCaseProfit: opportunity.profitability.netProfit * 0.5,
      bestCaseProfit: opportunity.profitability.netProfit * 0.9,
      executionTime: 15000, // 15 seconds
      gasRequired: this.estimateGasRequired(opportunity) * 1.5
    })

    // Base scenario (expected profit)
    scenarios.push({
      name: 'Base Case',
      description: 'Expected market conditions and execution',
      probability: 0.5,
      inputAmount: baseAmount,
      expectedProfit: opportunity.profitability.netProfit,
      worstCaseProfit: opportunity.profitability.netProfit * 0.8,
      bestCaseProfit: opportunity.profitability.netProfit * 1.2,
      executionTime: 8000, // 8 seconds
      gasRequired: this.estimateGasRequired(opportunity)
    })

    // Optimistic scenario (125% of expected profit)
    scenarios.push({
      name: 'Optimistic',
      description: 'Favorable conditions, fast execution, low competition',
      probability: 0.2,
      inputAmount: baseAmount,
      expectedProfit: opportunity.profitability.netProfit * 1.25,
      worstCaseProfit: opportunity.profitability.netProfit,
      bestCaseProfit: opportunity.profitability.netProfit * 1.5,
      executionTime: 5000, // 5 seconds
      gasRequired: this.estimateGasRequired(opportunity) * 0.8
    })

    return scenarios
  }

  private async calculateRiskAdjustedMetrics(
    opportunity: ArbitrageOpportunity,
    scenarios: ProfitabilityScenario[]
  ): Promise<RiskAdjustedProfitability> {

    const profits = scenarios.map(s => s.expectedProfit)
    const probabilities = scenarios.map(s => s.probability)

    const expectedReturn = profits.reduce((sum, profit, i) => sum + profit * probabilities[i], 0)
    const variance = profits.reduce((sum, profit, i) =>
      sum + probabilities[i] * Math.pow(profit - expectedReturn, 2), 0)
    const stdDev = Math.sqrt(variance)

    const negativeProfits = profits.filter(p => p < 0)
    const negativeVariance = negativeProfits.length > 0 ?
      negativeProfits.reduce((sum, profit) => sum + Math.pow(profit, 2), 0) / negativeProfits.length : 0
    const downsideDeviation = Math.sqrt(negativeVariance)

    return {
      sharpeRatio: stdDev > 0 ? expectedReturn / stdDev : 0,
      sortinoRatio: downsideDeviation > 0 ? expectedReturn / downsideDeviation : 0,
      maxDrawdown: Math.min(...profits) / expectedReturn,
      valueAtRisk: this.calculateVaR(profits, probabilities, 0.05),
      conditionalValueAtRisk: this.calculateCVaR(profits, probabilities, 0.05),
      probabilityOfProfit: probabilities.reduce((sum, prob, i) =>
        profits[i] > 0 ? sum + prob : sum, 0),
      expectedShortfall: this.calculateExpectedShortfall(profits, probabilities)
    }
  }

  private calculateVaR(profits: number[], probabilities: number[], confidence: number): number {
    // Calculate Value at Risk at given confidence level
    const sortedData = profits
      .map((profit, i) => ({ profit, prob: probabilities[i] }))
      .sort((a, b) => a.profit - b.profit)

    let cumulativeProb = 0
    for (const { profit, prob } of sortedData) {
      cumulativeProb += prob
      if (cumulativeProb >= confidence) {
        return Math.abs(profit) // Return positive value for loss
      }
    }
    return 0
  }

  private calculateCVaR(profits: number[], probabilities: number[], confidence: number): number {
    // Calculate Conditional Value at Risk (expected loss beyond VaR)
    const valueAtRisk = this.calculateVaR(profits, probabilities, confidence)
    const worseLosses = profits.filter(p => p <= -valueAtRisk)

    if (worseLosses.length === 0) return 0

    return Math.abs(worseLosses.reduce((sum, loss) => sum + loss, 0) / worseLosses.length)
  }

  private calculateExpectedShortfall(profits: number[], probabilities: number[]): number {
    const negativeProfits = profits.filter(p => p < 0)
    if (negativeProfits.length === 0) return 0

    return Math.abs(negativeProfits.reduce((sum, profit) => sum + profit, 0) / negativeProfits.length)
  }

  private async analyzeCosts(
    opportunity: ArbitrageOpportunity,
    inputAmount: number
  ): Promise<CostBreakdown> {

    const transactionFees: TransactionCost[] = []
    let totalTransactionCost = 0

    // Calculate transaction costs for each step
    opportunity.executionPlan.forEach((step, index) => {
      const computeUnits = this.getComputeUnitsForAction(step.action)
      const baseFee = computeUnits * this.GAS_PRICE_SOL
      const priorityFee = baseFee * 0.5
      const estimatedFee = baseFee + priorityFee

      transactionFees.push({
        step: index + 1,
        description: `${step.action} on ${step.pool.toString().substring(0, 8)}...`,
        baseFee,
        priorityFee,
        computeUnits,
        estimatedFee
      })

      totalTransactionCost += estimatedFee
    })

    const slippageImpact: SlippageImpact[] = opportunity.pools.map(pool => ({
      poolAddress: pool.poolAddress,
      tokenPair: `${pool.tokenX.symbol}/${pool.tokenY.symbol}`,
      expectedSlippage: pool.slippage,
      worstCaseSlippage: pool.slippage * this.SLIPPAGE_BUFFER,
      slippageCost: inputAmount * pool.slippage * this.SLIPPAGE_BUFFER,
      liquidityDepth: pool.liquidity
    }))

    const totalSlippageCost = slippageImpact.reduce((sum, impact) => sum + impact.slippageCost, 0)
    const mevProtectionCost = inputAmount * this.MEV_PROTECTION_BASE_COST
    const opportunityCost = this.calculateOpportunityCost(inputAmount, opportunity.executionPlan.length * 8)
    const totalCosts = totalTransactionCost + totalSlippageCost + mevProtectionCost + opportunityCost

    return {
      transactionFees,
      slippageImpact,
      mevProtectionCost,
      opportunityCost,
      capitalRequirement: inputAmount,
      totalCosts,
      costRatio: totalCosts / opportunity.profitability.grossProfit
    }
  }

  private getComputeUnitsForAction(action: string): number {
    switch (action) {
      case 'swap': return this.COMPUTE_UNITS_PER_SWAP
      case 'add_liquidity': return this.COMPUTE_UNITS_PER_ADD_LIQUIDITY
      case 'remove_liquidity': return this.COMPUTE_UNITS_PER_REMOVE_LIQUIDITY
      default: return this.COMPUTE_UNITS_PER_SWAP
    }
  }

  private calculateOpportunityCost(amount: number, executionTimeSeconds: number): number {
    // Opportunity cost based on risk-free rate (assume 5% APY)
    const annualRate = 0.05
    const secondsPerYear = 365 * 24 * 3600
    return amount * annualRate * (executionTimeSeconds / secondsPerYear)
  }

  private async analyzeMarketImpact(
    opportunity: ArbitrageOpportunity,
    inputAmount: number
  ): Promise<MarketImpactAnalysis> {

    // Price impact analysis across different trade sizes
    const priceImpact: PriceImpactTier[] = []
    const amounts = [inputAmount * 0.1, inputAmount * 0.5, inputAmount, inputAmount * 2, inputAmount * 5]

    for (const amount of amounts) {
      const impact = this.calculatePriceImpactForAmount(opportunity, amount)
      priceImpact.push({
        amountRange: { min: amount * 0.8, max: amount * 1.2 },
        averageImpact: impact.average,
        maximumImpact: impact.maximum,
        liquidityUtilization: amount / Math.min(...opportunity.pools.map(p => p.liquidity)),
        recommendedMaxAmount: impact.recommendedMax
      })
    }

    // Liquidity analysis
    const liquidityAnalysis = this.analyzeLiquidity(opportunity.pools)

    // Competition analysis
    const competitionRisk = this.analyzeCompetition(opportunity)

    // Temporal decay analysis
    const temporalDecay = this.analyzeTemporalDecay(opportunity)

    return {
      priceImpact,
      liquidityAnalysis,
      competitionRisk,
      temporalDecay
    }
  }

  private calculatePriceImpactForAmount(opportunity: ArbitrageOpportunity, amount: number) {
    const impacts = opportunity.path.route.map(step => {
      const utilization = amount / (step.binRange.max - step.binRange.min) / 1000 // Mock calculation
      return Math.min(utilization * 0.01, 0.1) // Cap at 10%
    })

    return {
      average: impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length,
      maximum: Math.max(...impacts),
      recommendedMax: amount * (1 - Math.max(...impacts))
    }
  }

  private analyzeLiquidity(pools: ArbitragePool[]): LiquidityAnalysis {
    const totalLiquidity = pools.reduce((sum, pool) => sum + pool.liquidity, 0)
    const activeLiquidity = totalLiquidity * 0.8 // Assume 80% is actively tradeable

    return {
      totalLiquidity,
      activeLiquidity,
      liquidityDistribution: pools.map((pool, i) => ({
        binId: i,
        liquidity: pool.liquidity,
        distance: Math.random() * 20 - 10 // Mock distance from current price
      })),
      liquidityDepthScore: Math.min(activeLiquidity / 100000, 1), // Score out of 1
      liquidityStability: 0.85 // Mock stability score
    }
  }

  private analyzeCompetition(opportunity: ArbitrageOpportunity): CompetitionAnalysis {
    // Mock competition analysis - would use historical data in real implementation
    const competitionLevel = opportunity.profitability.netProfit > 50 ? 'high' :
                            opportunity.profitability.netProfit > 20 ? 'medium' : 'low'

    return {
      historicalCompetition: Math.random() * 0.8,
      mevBotActivity: Math.random() * 0.6,
      averageExecutionDelay: Math.random() * 5000 + 2000,
      successRate: 1 - (Math.random() * 0.3),
      competitionPressure: competitionLevel as 'low' | 'medium' | 'high'
    }
  }

  private analyzeTemporalDecay(opportunity: ArbitrageOpportunity): TemporalDecayAnalysis {
    const complexityMultiplier = opportunity.path.complexity === 'simple' ? 1 :
                                 opportunity.path.complexity === 'moderate' ? 0.7 : 0.4

    return {
      halfLife: 30 * complexityMultiplier, // seconds
      decayRate: 0.023 * (1 / complexityMultiplier), // per second
      sustainabilityScore: complexityMultiplier,
      optimalExecutionWindow: 10 * complexityMultiplier
    }
  }

  private async generateRecommendations(
    opportunity: ArbitrageOpportunity,
    profitability: ProfitabilityMetrics,
    marketImpact: MarketImpactAnalysis
  ): Promise<ProfitabilityRecommendation[]> {

    const recommendations: ProfitabilityRecommendation[] = []

    // Amount optimization
    if (marketImpact.priceImpact.length > 0) {
      const optimalTier = marketImpact.priceImpact.reduce((best, current) =>
        (current.averageImpact < best.averageImpact) ? current : best)

      recommendations.push({
        type: 'amount_optimization',
        priority: 'high',
        description: `Optimize trade size to ${optimalTier.recommendedMaxAmount.toFixed(2)} for minimal price impact`,
        expectedImprovement: profitability.netProfit * 0.15,
        implementationCost: 0,
        netBenefit: profitability.netProfit * 0.15
      })
    }

    // Timing optimization
    if (marketImpact.temporalDecay.halfLife < 20) {
      recommendations.push({
        type: 'timing',
        priority: 'high',
        description: 'Execute immediately - opportunity has short half-life',
        expectedImprovement: profitability.netProfit * 0.1,
        implementationCost: profitability.gasCosts * 0.2,
        netBenefit: profitability.netProfit * 0.1 - profitability.gasCosts * 0.2
      })
    }

    // Competition mitigation
    if (marketImpact.competitionRisk.competitionPressure === 'high') {
      recommendations.push({
        type: 'risk_mitigation',
        priority: 'medium',
        description: 'Use private mempool or MEV protection to avoid frontrunning',
        expectedImprovement: profitability.netProfit * 0.2,
        implementationCost: profitability.netProfit * 0.05,
        netBenefit: profitability.netProfit * 0.15
      })
    }

    return recommendations.sort((a, b) => b.netBenefit - a.netBenefit)
  }

  private async performSensitivityAnalysis(
    opportunity: ArbitrageOpportunity,
    inputAmount: number
  ): Promise<SensitivityAnalysis> {

    const baseProfit = opportunity.profitability.netProfit

    return {
      priceVolatility: [
        { factor: 0.5, impactOnProfit: this.calculateVolatilityImpact(baseProfit, 0.5) },
        { factor: 1.0, impactOnProfit: 0 }, // baseline
        { factor: 1.5, impactOnProfit: this.calculateVolatilityImpact(baseProfit, 1.5) },
        { factor: 2.0, impactOnProfit: this.calculateVolatilityImpact(baseProfit, 2.0) }
      ],
      gasPrice: [
        { factor: 0.5, impactOnProfit: opportunity.profitability.gasCosts * 0.5 },
        { factor: 1.0, impactOnProfit: 0 },
        { factor: 2.0, impactOnProfit: -opportunity.profitability.gasCosts },
        { factor: 5.0, impactOnProfit: -opportunity.profitability.gasCosts * 4 }
      ],
      slippage: [
        { factor: 0.5, impactOnProfit: inputAmount * 0.005 },
        { factor: 1.0, impactOnProfit: 0 },
        { factor: 2.0, impactOnProfit: -inputAmount * 0.01 },
        { factor: 3.0, impactOnProfit: -inputAmount * 0.02 }
      ],
      competition: [
        { factor: 0.5, impactOnProfit: baseProfit * 0.1 },
        { factor: 1.0, impactOnProfit: 0 },
        { factor: 2.0, impactOnProfit: -baseProfit * 0.2 },
        { factor: 3.0, impactOnProfit: -baseProfit * 0.4 }
      ],
      executionTime: [
        { delaySeconds: 0, impactOnProfit: 0 },
        { delaySeconds: 5, impactOnProfit: -baseProfit * 0.05 },
        { delaySeconds: 15, impactOnProfit: -baseProfit * 0.2 },
        { delaySeconds: 30, impactOnProfit: -baseProfit * 0.5 }
      ]
    }
  }

  private calculateVolatilityImpact(baseProfit: number, volatilityFactor: number): number {
    // Higher volatility can increase opportunities but also risk
    if (volatilityFactor < 1) {
      return -baseProfit * (1 - volatilityFactor) * 0.3 // Less opportunity
    } else {
      return baseProfit * (volatilityFactor - 1) * 0.2 // More opportunity but more risk
    }
  }

  private estimateGasRequired(opportunity: ArbitrageOpportunity): number {
    return opportunity.executionPlan.reduce((total, step) => {
      return total + this.getComputeUnitsForAction(step.action)
    }, 0)
  }
}

interface MarketConditions {
  gasPrice?: number
  volatilityMultiplier?: number
  competitionLevel?: 'low' | 'medium' | 'high'
  liquidityConditions?: 'poor' | 'normal' | 'excellent'
}

export default ArbitrageProfitabilityCalculator