import { DLMMPosition } from '@/lib/types';

export interface RiskMetrics {
  overallRiskScore: number; // 0-100 (0 = low risk, 100 = extreme risk)
  impermanentLossRisk: number; // Expected IL percentage
  liquidityRisk: number; // Risk of low liquidity
  volatilityRisk: number; // Price volatility risk
  concentrationRisk: number; // Portfolio concentration risk
  marketRisk: number; // Overall market conditions risk
  timeHorizonRisk: number; // Risk based on position duration
}

export interface RiskFactors {
  priceVolatility: number; // Historical price volatility
  liquidityDepth: number; // Available liquidity in bins
  positionSize: number; // Size relative to pool
  timeInPosition: number; // Days since position opened
  marketConditions: 'bull' | 'bear' | 'sideways' | 'volatile';
  correlationFactor: number; // Correlation between token pairs
  concentrationLevel: number; // Portfolio concentration
}

export interface ImpermanentLossAnalysis {
  currentIL: number; // Current IL percentage
  predictedIL: {
    oneDay: number;
    oneWeek: number;
    oneMonth: number;
  };
  worstCaseIL: number; // Maximum potential IL
  breakEvenPrice: {
    tokenX: number;
    tokenY: number;
  };
  riskAdjustedReturn: number;
}

export interface PortfolioRiskAssessment {
  totalValue: number;
  riskMetrics: RiskMetrics;
  riskFactors: RiskFactors;
  ilAnalysis: ImpermanentLossAnalysis;
  recommendations: RiskRecommendation[];
  alerts: RiskAlert[];
  diversificationScore: number; // 0-100
  sharpeRatio: number;
  maxDrawdown: number;
  valueAtRisk: number; // VaR at 95% confidence
}

export interface RiskRecommendation {
  type: 'reduce_exposure' | 'rebalance' | 'diversify' | 'hedge' | 'monitor';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  actionItems: string[];
  expectedImpact: number; // Expected risk reduction percentage
  estimatedCost: number; // Estimated cost in USD
}

export interface RiskAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  type: 'impermanent_loss' | 'liquidity' | 'volatility' | 'concentration' | 'market';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  acknowledged: boolean;
}

export interface HistoricalRiskData {
  date: Date;
  riskScore: number;
  ilPercentage: number;
  portfolioValue: number;
  volatility: number;
}

export class RiskAssessmentEngine {
  private positions: DLMMPosition[] = [];
  private priceHistory: Map<string, number[]> = new Map();
  private riskThresholds = {
    highRisk: 70,
    mediumRisk: 40,
    lowRisk: 20,
    criticalIL: 15,
    warningIL: 10,
    maxConcentration: 40,
    minLiquidity: 10000
  };

  constructor() {
    this.initializeRiskEngine();
  }

  private initializeRiskEngine(): void {
    // Initialize risk assessment parameters
    console.log('Risk Assessment Engine initialized');
  }

  /**
   * Assess overall portfolio risk
   */
  public async assessPortfolioRisk(
    positions: DLMMPosition[],
    marketData?: Map<string, any>
  ): Promise<PortfolioRiskAssessment> {
    try {
      this.positions = positions;

      if (positions.length === 0) {
        return this.getEmptyRiskAssessment();
      }

      const totalValue = this.calculateTotalValue(positions);
      const riskFactors = await this.calculateRiskFactors(positions, marketData);
      const riskMetrics = this.calculateRiskMetrics(riskFactors, positions);
      const ilAnalysis = await this.analyzeImpermanentLoss(positions);
      const recommendations = this.generateRecommendations(riskMetrics, positions);
      const alerts = this.generateRiskAlerts(riskMetrics, ilAnalysis);

      const diversificationScore = this.calculateDiversificationScore(positions);
      const sharpeRatio = this.calculateSharpeRatio(positions);
      const maxDrawdown = this.calculateMaxDrawdown(positions);
      const valueAtRisk = this.calculateValueAtRisk(positions, 0.95);

      return {
        totalValue,
        riskMetrics,
        riskFactors,
        ilAnalysis,
        recommendations,
        alerts,
        diversificationScore,
        sharpeRatio,
        maxDrawdown,
        valueAtRisk
      };

    } catch (error) {
      console.error('Error assessing portfolio risk:', error);
      return this.getEmptyRiskAssessment();
    }
  }

  /**
   * Calculate risk factors for positions
   */
  private async calculateRiskFactors(
    positions: DLMMPosition[],
    marketData?: Map<string, any>
  ): Promise<RiskFactors> {
    const priceVolatility = await this.calculatePriceVolatility(positions);
    const liquidityDepth = this.calculateLiquidityDepth(positions);
    const positionSize = this.calculateAveragePositionSize(positions);
    const timeInPosition = this.calculateAverageTimeInPosition(positions);
    const marketConditions = this.assessMarketConditions(marketData);
    const correlationFactor = await this.calculateCorrelationFactor(positions);
    const concentrationLevel = this.calculateConcentrationLevel(positions);

    return {
      priceVolatility,
      liquidityDepth,
      positionSize,
      timeInPosition,
      marketConditions,
      correlationFactor,
      concentrationLevel
    };
  }

  /**
   * Calculate overall risk metrics
   */
  private calculateRiskMetrics(
    factors: RiskFactors,
    positions: DLMMPosition[]
  ): RiskMetrics {
    // Weighted risk scoring algorithm
    const volatilityRisk = Math.min(factors.priceVolatility * 100, 100);
    const liquidityRisk = Math.max(0, 100 - factors.liquidityDepth / 1000);
    const concentrationRisk = factors.concentrationLevel;
    const marketRisk = this.getMarketRiskScore(factors.marketConditions);
    const timeHorizonRisk = this.calculateTimeHorizonRisk(factors.timeInPosition);

    // IL risk based on volatility and correlation
    const impermanentLossRisk = this.calculateILRisk(
      factors.priceVolatility,
      factors.correlationFactor
    );

    // Overall risk score (weighted average)
    const overallRiskScore = Math.min(
      (volatilityRisk * 0.25 +
       liquidityRisk * 0.15 +
       concentrationRisk * 0.20 +
       marketRisk * 0.15 +
       timeHorizonRisk * 0.10 +
       impermanentLossRisk * 0.15), 100
    );

    return {
      overallRiskScore,
      impermanentLossRisk,
      liquidityRisk,
      volatilityRisk,
      concentrationRisk,
      marketRisk,
      timeHorizonRisk
    };
  }

  /**
   * Analyze impermanent loss for all positions
   */
  private async analyzeImpermanentLoss(
    positions: DLMMPosition[]
  ): Promise<ImpermanentLossAnalysis> {
    let totalCurrentIL = 0;
    let totalValue = 0;

    const ilPredictions = {
      oneDay: 0,
      oneWeek: 0,
      oneMonth: 0
    };

    for (const position of positions) {
      const positionIL = this.calculatePositionIL(position);
      const positionValue = (position as any).totalValue || 0;

      totalCurrentIL += positionIL * positionValue;
      totalValue += positionValue;

      // Predict future IL based on historical volatility
      const volatility = await this.getTokenPairVolatility(
        position.tokenX.address,
        position.tokenY.address
      );

      ilPredictions.oneDay += this.predictIL(volatility, 1) * positionValue;
      ilPredictions.oneWeek += this.predictIL(volatility, 7) * positionValue;
      ilPredictions.oneMonth += this.predictIL(volatility, 30) * positionValue;
    }

    const currentIL = totalValue > 0 ? (totalCurrentIL / totalValue) * 100 : 0;

    const predictedIL = {
      oneDay: totalValue > 0 ? (ilPredictions.oneDay / totalValue) * 100 : 0,
      oneWeek: totalValue > 0 ? (ilPredictions.oneWeek / totalValue) * 100 : 0,
      oneMonth: totalValue > 0 ? (ilPredictions.oneMonth / totalValue) * 100 : 0
    };

    const worstCaseIL = Math.max(predictedIL.oneMonth * 2, 25); // Conservative estimate

    // Calculate break-even prices (simplified)
    const breakEvenPrice = {
      tokenX: 0, // Would need current prices to calculate
      tokenY: 0
    };

    const riskAdjustedReturn = this.calculateRiskAdjustedReturn(positions, currentIL);

    return {
      currentIL,
      predictedIL,
      worstCaseIL,
      breakEvenPrice,
      riskAdjustedReturn
    };
  }

  /**
   * Generate risk-based recommendations
   */
  private generateRecommendations(
    metrics: RiskMetrics,
    positions: DLMMPosition[]
  ): RiskRecommendation[] {
    const recommendations: RiskRecommendation[] = [];

    // High overall risk
    if (metrics.overallRiskScore > this.riskThresholds.highRisk) {
      recommendations.push({
        type: 'reduce_exposure',
        priority: 'high',
        description: 'Portfolio risk is elevated. Consider reducing overall exposure.',
        actionItems: [
          'Remove liquidity from highest-risk positions',
          'Diversify across different token pairs',
          'Consider reducing position sizes'
        ],
        expectedImpact: 25,
        estimatedCost: 50
      });
    }

    // High IL risk
    if (metrics.impermanentLossRisk > this.riskThresholds.criticalIL) {
      recommendations.push({
        type: 'hedge',
        priority: 'critical',
        description: 'High impermanent loss risk detected.',
        actionItems: [
          'Consider hedging strategies',
          'Narrow price ranges for volatile pairs',
          'Monitor positions more frequently'
        ],
        expectedImpact: 30,
        estimatedCost: 75
      });
    }

    // High concentration risk
    if (metrics.concentrationRisk > this.riskThresholds.maxConcentration) {
      recommendations.push({
        type: 'diversify',
        priority: 'medium',
        description: 'Portfolio is too concentrated in specific tokens.',
        actionItems: [
          'Add positions in different token pairs',
          'Reduce largest position sizes',
          'Consider correlation between tokens'
        ],
        expectedImpact: 20,
        estimatedCost: 100
      });
    }

    // Low liquidity risk
    if (metrics.liquidityRisk > this.riskThresholds.mediumRisk) {
      recommendations.push({
        type: 'monitor',
        priority: 'medium',
        description: 'Some positions have low liquidity.',
        actionItems: [
          'Monitor liquidity levels closely',
          'Consider moving to higher liquidity pools',
          'Set up liquidity alerts'
        ],
        expectedImpact: 15,
        estimatedCost: 25
      });
    }

    return recommendations;
  }

  /**
   * Generate risk alerts
   */
  private generateRiskAlerts(
    metrics: RiskMetrics,
    ilAnalysis: ImpermanentLossAnalysis
  ): RiskAlert[] {
    const alerts: RiskAlert[] = [];

    // Critical IL alert
    if (ilAnalysis.currentIL > this.riskThresholds.criticalIL) {
      alerts.push({
        id: `il_critical_${Date.now()}`,
        severity: 'critical',
        type: 'impermanent_loss',
        message: `Critical impermanent loss detected: ${ilAnalysis.currentIL.toFixed(2)}%`,
        threshold: this.riskThresholds.criticalIL,
        currentValue: ilAnalysis.currentIL,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // High volatility alert
    if (metrics.volatilityRisk > this.riskThresholds.highRisk) {
      alerts.push({
        id: `volatility_high_${Date.now()}`,
        severity: 'warning',
        type: 'volatility',
        message: `High volatility risk detected: ${metrics.volatilityRisk.toFixed(1)}/100`,
        threshold: this.riskThresholds.highRisk,
        currentValue: metrics.volatilityRisk,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Concentration risk alert
    if (metrics.concentrationRisk > this.riskThresholds.maxConcentration) {
      alerts.push({
        id: `concentration_high_${Date.now()}`,
        severity: 'warning',
        type: 'concentration',
        message: `High concentration risk: ${metrics.concentrationRisk.toFixed(1)}%`,
        threshold: this.riskThresholds.maxConcentration,
        currentValue: metrics.concentrationRisk,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    return alerts;
  }

  /**
   * Calculate price volatility for positions
   */
  private async calculatePriceVolatility(positions: DLMMPosition[]): Promise<number> {
    if (positions.length === 0) return 0;

    let totalVolatility = 0;
    let validPositions = 0;

    for (const position of positions) {
      try {
        const volatility = await this.getTokenPairVolatility(
          position.tokenX.address,
          position.tokenY.address
        );
        totalVolatility += volatility;
        validPositions++;
      } catch (error) {
        console.warn('Error calculating volatility for position:', error);
      }
    }

    return validPositions > 0 ? totalVolatility / validPositions : 0.2; // Default 20% volatility
  }

  /**
   * Calculate liquidity depth
   */
  private calculateLiquidityDepth(positions: DLMMPosition[]): number {
    return positions.reduce((total, position) => {
      return total + ((position as any).totalValue || 0);
    }, 0);
  }

  /**
   * Calculate average position size
   */
  private calculateAveragePositionSize(positions: DLMMPosition[]): number {
    if (positions.length === 0) return 0;

    const totalValue = positions.reduce((sum, pos) => sum + (pos.totalValue || 0), 0);
    return totalValue / positions.length;
  }

  /**
   * Calculate average time in position
   */
  private calculateAverageTimeInPosition(positions: DLMMPosition[]): number {
    if (positions.length === 0) return 0;

    const now = Date.now();
    const totalDays = positions.reduce((sum, position) => {
      const createdAt = (position as any).createdAt ? new Date((position as any).createdAt).getTime() : now;
      const days = (now - createdAt) / (1000 * 60 * 60 * 24);
      return sum + Math.max(days, 0);
    }, 0);

    return totalDays / positions.length;
  }

  /**
   * Assess market conditions
   */
  private assessMarketConditions(marketData?: Map<string, any>): 'bull' | 'bear' | 'sideways' | 'volatile' {
    // Simplified market assessment
    if (!marketData) return 'sideways';

    // Would implement sophisticated market analysis here
    return 'sideways';
  }

  /**
   * Calculate correlation factor between token pairs
   */
  private async calculateCorrelationFactor(positions: DLMMPosition[]): Promise<number> {
    // Simplified correlation calculation
    // In a real implementation, would calculate actual price correlations
    return 0.3; // Default moderate correlation
  }

  /**
   * Calculate portfolio concentration level
   */
  private calculateConcentrationLevel(positions: DLMMPosition[]): number {
    if (positions.length === 0) return 0;

    const totalValue = positions.reduce((sum, pos) => sum + (pos.totalValue || 0), 0);

    if (totalValue === 0) return 0;

    // Calculate Herfindahl-Hirschman Index (HHI) for concentration
    let hhi = 0;
    for (const position of positions) {
      const weight = ((position as any).totalValue || 0) / totalValue;
      hhi += weight * weight;
    }

    // Convert to percentage (0-100)
    return hhi * 100;
  }

  /**
   * Helper methods
   */
  private getMarketRiskScore(conditions: string): number {
    const riskMap = {
      'bull': 30,
      'bear': 70,
      'sideways': 40,
      'volatile': 80
    };
    return riskMap[conditions] || 50;
  }

  private calculateTimeHorizonRisk(days: number): number {
    // Risk decreases with time (IL risk smooths out)
    if (days < 1) return 80;
    if (days < 7) return 60;
    if (days < 30) return 40;
    if (days < 90) return 25;
    return 15;
  }

  private calculateILRisk(volatility: number, correlation: number): number {
    // IL risk increases with volatility and decreases with correlation
    const baseRisk = volatility * 100;
    const correlationAdjustment = (1 - correlation) * 20;
    return Math.min(baseRisk + correlationAdjustment, 100);
  }

  private calculatePositionIL(position: DLMMPosition): number {
    // Simplified IL calculation
    // Would need current prices vs entry prices for accurate calculation
    return Math.random() * 5; // Placeholder: 0-5% IL
  }

  private async getTokenPairVolatility(tokenX: string, tokenY: string): Promise<number> {
    // Would fetch historical price data and calculate volatility
    // Placeholder: return moderate volatility
    return 0.25; // 25% annualized volatility
  }

  private predictIL(volatility: number, days: number): number {
    // Simplified IL prediction based on volatility
    const timeAdjustment = Math.sqrt(days / 365);
    return volatility * timeAdjustment * 0.1; // Conservative IL estimate
  }

  private calculateRiskAdjustedReturn(positions: DLMMPosition[], ilPercentage: number): number {
    // Calculate risk-adjusted return considering IL
    const totalReturn = positions.reduce((sum, pos) => {
      return sum + (pos.pnl?.percentage || 0);
    }, 0);

    return totalReturn - ilPercentage;
  }

  private calculateDiversificationScore(positions: DLMMPosition[]): number {
    if (positions.length === 0) return 0;

    // Simple diversification score based on number of unique token pairs
    const uniquePairs = new Set(positions.map(p => `${p.tokenX.address}-${p.tokenY.address}`));
    const diversificationRatio = uniquePairs.size / Math.max(positions.length, 1);

    return Math.min(diversificationRatio * 100, 100);
  }

  private calculateSharpeRatio(positions: DLMMPosition[]): number {
    // Simplified Sharpe ratio calculation
    if (positions.length === 0) return 0;

    const returns = positions.map(p => p.pnl?.percentage || 0);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    return stdDev > 0 ? avgReturn / stdDev : 0;
  }

  private calculateMaxDrawdown(positions: DLMMPosition[]): number {
    // Simplified max drawdown calculation
    if (positions.length === 0) return 0;

    const returns = positions.map(p => p.pnl?.percentage || 0);
    let maxDrawdown = 0;
    let peak = 0;

    for (const returnValue of returns) {
      peak = Math.max(peak, returnValue);
      const drawdown = peak - returnValue;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }

  private calculateValueAtRisk(positions: DLMMPosition[], confidence: number): number {
    // Simplified VaR calculation
    if (positions.length === 0) return 0;

    const returns = positions.map(p => p.pnl?.percentage || 0).sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * returns.length);

    return returns[index] || 0;
  }

  private getEmptyRiskAssessment(): PortfolioRiskAssessment {
    return {
      totalValue: 0,
      riskMetrics: {
        overallRiskScore: 0,
        impermanentLossRisk: 0,
        liquidityRisk: 0,
        volatilityRisk: 0,
        concentrationRisk: 0,
        marketRisk: 0,
        timeHorizonRisk: 0
      },
      riskFactors: {
        priceVolatility: 0,
        liquidityDepth: 0,
        positionSize: 0,
        timeInPosition: 0,
        marketConditions: 'sideways',
        correlationFactor: 0,
        concentrationLevel: 0
      },
      ilAnalysis: {
        currentIL: 0,
        predictedIL: { oneDay: 0, oneWeek: 0, oneMonth: 0 },
        worstCaseIL: 0,
        breakEvenPrice: { tokenX: 0, tokenY: 0 },
        riskAdjustedReturn: 0
      },
      recommendations: [],
      alerts: [],
      diversificationScore: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      valueAtRisk: 0
    };
  }

  /**
   * Historical risk tracking
   */
  public trackHistoricalRisk(
    riskAssessment: PortfolioRiskAssessment
  ): HistoricalRiskData {
    return {
      date: new Date(),
      riskScore: riskAssessment.riskMetrics.overallRiskScore,
      ilPercentage: riskAssessment.ilAnalysis.currentIL,
      portfolioValue: riskAssessment.totalValue,
      volatility: riskAssessment.riskFactors.priceVolatility
    };
  }

  /**
   * Update risk thresholds
   */
  public updateRiskThresholds(newThresholds: Partial<typeof this.riskThresholds>): void {
    this.riskThresholds = { ...this.riskThresholds, ...newThresholds };
  }

  /**
   * Get risk threshold configuration
   */
  public getRiskThresholds() {
    return { ...this.riskThresholds };
  }
}

// Export singleton instance
export const riskAssessmentEngine = new RiskAssessmentEngine();