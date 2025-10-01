import { DLMMPosition } from '../types';

export interface PerformanceAttribution {
  positionId: string;
  totalReturn: {
    absolute: number; // Total $ return
    percentage: number; // Total % return
    annualized: number; // Annualized return %
  };
  attribution: {
    feeIncome: AttributionComponent;
    priceAppreciation: AttributionComponent;
    impermanentLoss: AttributionComponent;
    rebalancing: AttributionComponent;
    compounding: AttributionComponent;
    timing: AttributionComponent;
  };
  timeWeightedReturn: number; // Time-weighted return %
  moneyWeightedReturn: number; // Money-weighted return %
  riskAdjustedMetrics: RiskAdjustedMetrics;
  benchmarkComparison: BenchmarkComparison;
  contributionAnalysis: ContributionAnalysis;
  factorExposure: FactorExposure;
}

export interface AttributionComponent {
  value: number; // Dollar contribution
  percentage: number; // Percentage of total return
  confidence: number; // 0-100 confidence in attribution
  breakdown: AttributionBreakdown[];
  volatility: number; // Component volatility
  sharpeRatio: number; // Risk-adjusted performance
}

export interface AttributionBreakdown {
  factor: string;
  value: number;
  percentage: number;
  description: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'inception';
}

export interface RiskAdjustedMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  informationRatio: number;
  treynorRatio: number;
  calmarRatio: number;
  maxDrawdown: number;
  valueAtRisk: number; // 95% VaR
  conditionalVaR: number; // Expected shortfall
  beta: number; // Market beta
  alpha: number; // Excess return vs benchmark
}

export interface BenchmarkComparison {
  benchmark: string;
  benchmarkReturn: number;
  relativeReturn: number; // Excess return vs benchmark
  trackingError: number;
  informationRatio: number;
  upCaptureRatio: number;
  downCaptureRatio: number;
  activeBets: ActiveBet[];
}

export interface ActiveBet {
  factor: string;
  exposure: number; // Position vs benchmark
  contribution: number; // Contribution to excess return
  significance: 'high' | 'medium' | 'low';
}

export interface ContributionAnalysis {
  positionSizing: number; // Impact of position size decisions
  entryTiming: number; // Impact of entry timing
  exitTiming: number; // Impact of exit timing
  rangeSelection: number; // Impact of liquidity range selection
  feeStrategy: number; // Impact of fee tier selection
  rebalanceFrequency: number; // Impact of rebalancing decisions
}

export interface FactorExposure {
  market: number; // Overall market exposure
  volatility: number; // Volatility factor exposure
  momentum: number; // Momentum factor exposure
  meanReversion: number; // Mean reversion exposure
  carry: number; // Carry/yield exposure
  quality: number; // Quality factor exposure
  liquidity: number; // Liquidity factor exposure
}

export interface PortfolioAttribution {
  totalPortfolioReturn: {
    absolute: number;
    percentage: number;
    annualized: number;
  };
  positionContributions: PositionContribution[];
  sectorAllocation: SectorAllocation[];
  assetAllocation: AssetAllocation[];
  riskContribution: RiskContribution[];
  performanceDecomposition: PerformanceDecomposition;
  attributionSummary: AttributionSummary;
}

export interface PositionContribution {
  positionId: string;
  tokenPair: string;
  weight: number; // Position weight in portfolio
  return: number; // Position return
  contribution: number; // Contribution to portfolio return
  attribution: PerformanceAttribution;
}

export interface SectorAllocation {
  sector: string; // e.g., "Stablecoins", "DeFi", "GameFi"
  weight: number;
  return: number;
  contribution: number;
  active_weight: number; // Overweight/underweight vs benchmark
}

export interface AssetAllocation {
  asset: string;
  weight: number;
  return: number;
  contribution: number;
  volatility: number;
  correlation: number;
}

export interface RiskContribution {
  source: string;
  contribution: number; // Contribution to portfolio risk
  marginalRisk: number; // Marginal risk contribution
  componentRisk: number; // Component risk
}

export interface PerformanceDecomposition {
  assetAllocation: number; // Return from asset allocation decisions
  stockSelection: number; // Return from position selection
  interaction: number; // Interaction effect
  timing: number; // Return from timing decisions
  currency: number; // Currency effect (if applicable)
}

export interface AttributionSummary {
  topContributors: ContributorSummary[];
  topDetractors: ContributorSummary[];
  riskFactors: RiskFactorSummary[];
  insights: string[];
  recommendations: string[];
}

export interface ContributorSummary {
  name: string;
  type: 'position' | 'factor' | 'sector';
  contribution: number;
  percentage: number;
}

export interface RiskFactorSummary {
  factor: string;
  exposure: number;
  contribution: number;
  description: string;
}

export interface HistoricalAttribution {
  date: Date;
  return: number;
  attribution: {
    fees: number;
    priceChange: number;
    impermanentLoss: number;
    rebalancing: number;
  };
  cumulativeAttribution: {
    fees: number;
    priceChange: number;
    impermanentLoss: number;
    rebalancing: number;
  };
}

export interface AttributionConfig {
  benchmarkIndex: string;
  riskFreeRate: number;
  attributionMethod: 'brinson' | 'geometric' | 'arithmetic';
  rebalancingCost: number;
  confidenceLevel: number; // For VaR calculations
}

export class PerformanceAttributionEngine {
  private attributionHistory: Map<string, HistoricalAttribution[]> = new Map();
  private config: AttributionConfig = {
    benchmarkIndex: 'SOL',
    riskFreeRate: 0.02, // 2% risk-free rate
    attributionMethod: 'geometric',
    rebalancingCost: 0.001, // 0.1% cost
    confidenceLevel: 0.95
  };

  constructor(config?: Partial<AttributionConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.initializeAttributionEngine();
  }

  private initializeAttributionEngine(): void {
    console.log('Performance Attribution Engine initialized');
  }

  /**
   * Analyze performance attribution for a single position
   */
  public async analyzePositionAttribution(
    position: DLMMPosition,
    marketData?: Map<string, any>
  ): Promise<PerformanceAttribution> {
    try {
      const positionId = (position as any).address || `position_${Date.now()}`;

      // Calculate total returns
      const totalReturn = this.calculateTotalReturn(position);

      // Decompose returns into components
      const attribution = await this.decomposeReturns(position, marketData);

      // Calculate risk-adjusted metrics
      const riskAdjustedMetrics = await this.calculateRiskAdjustedMetrics(position);

      // Compare against benchmark
      const benchmarkComparison = await this.compareToBenchmark(position);

      // Analyze contribution factors
      const contributionAnalysis = this.analyzeContributions(position);

      // Calculate factor exposures
      const factorExposure = this.calculateFactorExposure(position);

      // Calculate time and money weighted returns
      const timeWeightedReturn = this.calculateTimeWeightedReturn(position);
      const moneyWeightedReturn = this.calculateMoneyWeightedReturn(position);

      return {
        positionId,
        totalReturn,
        attribution,
        timeWeightedReturn,
        moneyWeightedReturn,
        riskAdjustedMetrics,
        benchmarkComparison,
        contributionAnalysis,
        factorExposure
      };

    } catch (error) {
      console.error('Error analyzing position attribution:', error);
      return this.getEmptyAttribution((position as any).address || `position_${Date.now()}`);
    }
  }

  /**
   * Analyze portfolio-level attribution
   */
  public async analyzePortfolioAttribution(
    positions: DLMMPosition[],
    marketData?: Map<string, any>
  ): Promise<PortfolioAttribution> {
    try {
      if (positions.length === 0) {
        return this.getEmptyPortfolioAttribution();
      }

      // Calculate total portfolio return
      const totalPortfolioReturn = this.calculatePortfolioReturn(positions);

      // Analyze individual position contributions
      const positionContributions = await Promise.all(
        positions.map(async (position) => {
          const attribution = await this.analyzePositionAttribution(position, marketData);
          return this.calculatePositionContribution(position, attribution, totalPortfolioReturn);
        })
      );

      // Sector and asset allocation analysis
      const sectorAllocation = this.analyzeSectorAllocation(positions);
      const assetAllocation = this.analyzeAssetAllocation(positions);

      // Risk contribution analysis
      const riskContribution = this.analyzeRiskContribution(positions);

      // Performance decomposition (Brinson attribution)
      const performanceDecomposition = this.decomposePortfolioPerformance(positions);

      // Generate attribution summary
      const attributionSummary = this.generateAttributionSummary(
        positionContributions,
        sectorAllocation,
        riskContribution
      );

      return {
        totalPortfolioReturn,
        positionContributions,
        sectorAllocation,
        assetAllocation,
        riskContribution,
        performanceDecomposition,
        attributionSummary
      };

    } catch (error) {
      console.error('Error analyzing portfolio attribution:', error);
      return this.getEmptyPortfolioAttribution();
    }
  }

  /**
   * Calculate total return for a position
   */
  private calculateTotalReturn(position: DLMMPosition) {
    const currentValue = (position as any).totalValue || 0;
    const initialValue = (position as any).initialValue || currentValue;

    const absolute = currentValue - initialValue;
    const percentage = initialValue > 0 ? (absolute / initialValue) * 100 : 0;

    // Calculate annualized return
    const daysSinceCreation = position.createdAt
      ? (Date.now() - new Date(position.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      : 1;
    const annualized = daysSinceCreation > 0
      ? Math.pow(1 + percentage / 100, 365 / daysSinceCreation) * 100 - 100
      : percentage;

    return {
      absolute,
      percentage,
      annualized
    };
  }

  /**
   * Decompose returns into attribution components
   */
  private async decomposeReturns(
    position: DLMMPosition,
    _marketData?: Map<string, any>
  ): Promise<PerformanceAttribution['attribution']> {

    // Fee income attribution
    const feeIncome = this.calculateFeeAttribution(position);

    // Price appreciation attribution
    const priceAppreciation = this.calculatePriceAttribution(position);

    // Impermanent loss attribution
    const impermanentLoss = this.calculateILAttribution(position);

    // Rebalancing attribution
    const rebalancing = this.calculateRebalancingAttribution(position);

    // Compounding attribution
    const compounding = this.calculateCompoundingAttribution(position);

    // Timing attribution
    const timing = this.calculateTimingAttribution(position);

    return {
      feeIncome,
      priceAppreciation,
      impermanentLoss,
      rebalancing,
      compounding,
      timing
    };
  }

  /**
   * Calculate fee income attribution
   */
  private calculateFeeAttribution(position: DLMMPosition): AttributionComponent {
    const totalFees = (position as any).fees || 0;
    const totalValue = (position as any).totalValue || 0;
    const percentage = totalValue > 0 ? (totalFees / totalValue) * 100 : 0;

    const breakdown: AttributionBreakdown[] = [
      {
        factor: 'trading_fees',
        value: totalFees * 0.8, // Assume 80% from trading fees
        percentage: percentage * 0.8,
        description: 'Fees earned from trading activity',
        timeframe: 'inception'
      },
      {
        factor: 'volume_bonuses',
        value: totalFees * 0.2, // Assume 20% from volume bonuses
        percentage: percentage * 0.2,
        description: 'Additional fees from high volume periods',
        timeframe: 'inception'
      }
    ];

    return {
      value: totalFees,
      percentage,
      confidence: 95, // High confidence in fee tracking
      breakdown,
      volatility: this.calculateComponentVolatility(position, 'fees'),
      sharpeRatio: this.calculateComponentSharpe(totalFees, 0.01) // Low risk for fees
    };
  }

  /**
   * Calculate price appreciation attribution
   */
  private calculatePriceAttribution(position: DLMMPosition): AttributionComponent {
    const tokenXChange = (position.tokenX as any).priceChange || 0;
    const tokenYChange = (position.tokenY as any).priceChange || 0;

    // Weight by position composition
    const tokenXWeight = 0.5; // Simplified - would calculate actual weights
    const tokenYWeight = 0.5;

    const weightedPriceChange = tokenXChange * tokenXWeight + tokenYChange * tokenYWeight;
    const totalValue = (position as any).totalValue || 0;
    const value = totalValue * (weightedPriceChange / 100);

    const breakdown: AttributionBreakdown[] = [
      {
        factor: 'token_x_price',
        value: value * tokenXWeight,
        percentage: tokenXChange * tokenXWeight,
        description: `${position.tokenX.symbol} price appreciation`,
        timeframe: 'inception'
      },
      {
        factor: 'token_y_price',
        value: value * tokenYWeight,
        percentage: tokenYChange * tokenYWeight,
        description: `${position.tokenY.symbol} price appreciation`,
        timeframe: 'inception'
      }
    ];

    return {
      value,
      percentage: weightedPriceChange,
      confidence: 85,
      breakdown,
      volatility: this.calculateComponentVolatility(position, 'price'),
      sharpeRatio: this.calculateComponentSharpe(value, Math.abs(value) * 0.3)
    };
  }

  /**
   * Calculate impermanent loss attribution
   */
  private calculateILAttribution(position: DLMMPosition): AttributionComponent {
    const ilPercentage = (position as any).impermanentLoss || 0;
    const totalValue = (position as any).totalValue || 0;
    const value = totalValue * (ilPercentage / 100);

    const breakdown: AttributionBreakdown[] = [
      {
        factor: 'price_divergence',
        value: value * 0.8,
        percentage: ilPercentage * 0.8,
        description: 'Loss from token price divergence',
        timeframe: 'inception'
      },
      {
        factor: 'volatility_drag',
        value: value * 0.2,
        percentage: ilPercentage * 0.2,
        description: 'Loss from volatility impact',
        timeframe: 'inception'
      }
    ];

    return {
      value: -Math.abs(value), // IL is always negative
      percentage: -Math.abs(ilPercentage),
      confidence: 75,
      breakdown,
      volatility: this.calculateComponentVolatility(position, 'il'),
      sharpeRatio: this.calculateComponentSharpe(value, Math.abs(value) * 0.5)
    };
  }

  /**
   * Calculate rebalancing attribution
   */
  private calculateRebalancingAttribution(position: DLMMPosition): AttributionComponent {
    // Simplified - would track actual rebalancing transactions
    const rebalanceCount = (position as any).rebalanceHistory?.length || 0;
    const rebalanceCost = rebalanceCount * this.config.rebalancingCost * ((position as any).totalValue || 0);
    const rebalanceBenefit = rebalanceCount * 0.005 * ((position as any).totalValue || 0); // Assume 0.5% benefit per rebalance

    const netValue = rebalanceBenefit - rebalanceCost;
    const percentage = ((position as any).totalValue || 0) > 0 ? (netValue / ((position as any).totalValue || 1)) * 100 : 0;

    const breakdown: AttributionBreakdown[] = [
      {
        factor: 'rebalance_benefit',
        value: rebalanceBenefit,
        percentage: (rebalanceBenefit / ((position as any).totalValue || 1)) * 100,
        description: 'Benefit from optimal range adjustments',
        timeframe: 'inception'
      },
      {
        factor: 'rebalance_cost',
        value: -rebalanceCost,
        percentage: -(rebalanceCost / ((position as any).totalValue || 1)) * 100,
        description: 'Cost of rebalancing transactions',
        timeframe: 'inception'
      }
    ];

    return {
      value: netValue,
      percentage,
      confidence: 70,
      breakdown,
      volatility: this.calculateComponentVolatility(position, 'rebalancing'),
      sharpeRatio: this.calculateComponentSharpe(netValue, Math.abs(netValue) * 0.2)
    };
  }

  /**
   * Calculate compounding attribution
   */
  private calculateCompoundingAttribution(position: DLMMPosition): AttributionComponent {
    const totalFees = (position as any).fees || 0;
    const compoundingBenefit = totalFees * 0.05; // Assume 5% compounding benefit

    const breakdown: AttributionBreakdown[] = [
      {
        factor: 'fee_reinvestment',
        value: compoundingBenefit,
        percentage: (((position as any).totalValue || 0) > 0 ? (compoundingBenefit / ((position as any).totalValue || 1)) * 100 : 0),
        description: 'Benefit from reinvesting earned fees',
        timeframe: 'inception'
      }
    ];

    return {
      value: compoundingBenefit,
      percentage: (((position as any).totalValue || 0) > 0 ? (compoundingBenefit / ((position as any).totalValue || 1)) * 100 : 0),
      confidence: 60,
      breakdown,
      volatility: this.calculateComponentVolatility(position, 'compounding'),
      sharpeRatio: this.calculateComponentSharpe(compoundingBenefit, compoundingBenefit * 0.1)
    };
  }

  /**
   * Calculate timing attribution
   */
  private calculateTimingAttribution(position: DLMMPosition): AttributionComponent {
    // Simplified timing analysis
    const timingValue = ((position as any).totalValue || 0) * 0.001; // Assume small timing impact

    const breakdown: AttributionBreakdown[] = [
      {
        factor: 'entry_timing',
        value: timingValue * 0.6,
        percentage: 0.06, // Small timing impact
        description: 'Impact of position entry timing',
        timeframe: 'inception'
      },
      {
        factor: 'market_timing',
        value: timingValue * 0.4,
        percentage: 0.04,
        description: 'Impact of general market timing',
        timeframe: 'inception'
      }
    ];

    return {
      value: timingValue,
      percentage: 0.1,
      confidence: 40, // Low confidence in timing attribution
      breakdown,
      volatility: this.calculateComponentVolatility(position, 'timing'),
      sharpeRatio: this.calculateComponentSharpe(timingValue, timingValue * 2)
    };
  }

  /**
   * Calculate risk-adjusted metrics
   */
  private async calculateRiskAdjustedMetrics(
    position: DLMMPosition
  ): Promise<RiskAdjustedMetrics> {
    const returns = await this.getPositionReturns(position);
    const benchmarkReturns = await this.getBenchmarkReturns();

    const avgReturn = this.calculateMean(returns);
    const volatility = this.calculateVolatility(returns);
    const downwardVolatility = this.calculateDownwardVolatility(returns);
    const maxDrawdown = this.calculateMaxDrawdown(returns);

    const sharpeRatio = volatility > 0 ? (avgReturn - this.config.riskFreeRate) / volatility : 0;
    const sortinoRatio = downwardVolatility > 0 ? (avgReturn - this.config.riskFreeRate) / downwardVolatility : 0;

    const beta = this.calculateBeta(returns, benchmarkReturns);
    const alpha = avgReturn - (this.config.riskFreeRate + beta * (this.calculateMean(benchmarkReturns) - this.config.riskFreeRate));

    const valueAtRisk = this.calculateVaR(returns, this.config.confidenceLevel);
    const conditionalVaR = this.calculateCVaR(returns, this.config.confidenceLevel);

    return {
      sharpeRatio,
      sortinoRatio,
      informationRatio: 0, // Would need tracking error calculation
      treynorRatio: beta !== 0 ? (avgReturn - this.config.riskFreeRate) / beta : 0,
      calmarRatio: maxDrawdown !== 0 ? avgReturn / Math.abs(maxDrawdown) : 0,
      maxDrawdown,
      valueAtRisk,
      conditionalVaR,
      beta,
      alpha
    };
  }

  /**
   * Compare against benchmark
   */
  private async compareToBenchmark(position: DLMMPosition): Promise<BenchmarkComparison> {
    const positionReturns = await this.getPositionReturns(position);
    const benchmarkReturns = await this.getBenchmarkReturns();

    const positionReturn = this.calculateMean(positionReturns);
    const benchmarkReturn = this.calculateMean(benchmarkReturns);
    const relativeReturn = positionReturn - benchmarkReturn;

    const trackingError = this.calculateTrackingError(positionReturns, benchmarkReturns);
    const informationRatio = trackingError > 0 ? relativeReturn / trackingError : 0;

    const upCaptureRatio = this.calculateCaptureRatio(positionReturns, benchmarkReturns, 'up');
    const downCaptureRatio = this.calculateCaptureRatio(positionReturns, benchmarkReturns, 'down');

    const activeBets = this.identifyActiveBets(position);

    return {
      benchmark: this.config.benchmarkIndex,
      benchmarkReturn,
      relativeReturn,
      trackingError,
      informationRatio,
      upCaptureRatio,
      downCaptureRatio,
      activeBets
    };
  }

  /**
   * Analyze contribution factors
   */
  private analyzeContributions(_position: DLMMPosition): ContributionAnalysis {
    // Simplified contribution analysis
    return {
      positionSizing: 0.5,
      entryTiming: 0.2,
      exitTiming: 0.1,
      rangeSelection: 1.5,
      feeStrategy: 0.8,
      rebalanceFrequency: 0.3
    };
  }

  /**
   * Calculate factor exposure
   */
  private calculateFactorExposure(_position: DLMMPosition): FactorExposure {
    return {
      market: 1.0,
      volatility: 0.3,
      momentum: 0.1,
      meanReversion: -0.2,
      carry: 0.5,
      quality: 0.2,
      liquidity: 0.8
    };
  }

  /**
   * Helper methods for calculations
   */
  private calculateComponentVolatility(_position: DLMMPosition, component: string): number {
    // Simplified volatility calculation
    const baseVolatility = 0.2;
    const multipliers = {
      fees: 0.1,
      price: 1.0,
      il: 0.8,
      rebalancing: 0.3,
      compounding: 0.05,
      timing: 0.6
    };

    return baseVolatility * ((multipliers as any)[component] || 0.5);
  }

  private calculateComponentSharpe(returnValue: number, risk: number): number {
    const annualizedReturn = returnValue * (365 / 30); // Assume monthly calculation
    const annualizedRisk = risk * Math.sqrt(365 / 30);

    return annualizedRisk > 0 ? (annualizedReturn - this.config.riskFreeRate) / annualizedRisk : 0;
  }

  private calculateTimeWeightedReturn(position: DLMMPosition): number {
    // Simplified calculation - would need cash flow data
    return (position as any).pnl?.percentage || 0;
  }

  private calculateMoneyWeightedReturn(position: DLMMPosition): number {
    // Simplified calculation - would need IRR calculation
    return ((position as any).pnl?.percentage || 0) * 0.95; // Typically slightly lower than TWR
  }

  private calculatePortfolioReturn(positions: DLMMPosition[]) {
    const totalValue = positions.reduce((sum, pos) => sum + ((pos as any).totalValue || 0), 0);
    const totalInitialValue = positions.reduce((sum, pos) => sum + ((pos as any).initialValue || (pos as any).totalValue || 0), 0);

    const absolute = totalValue - totalInitialValue;
    const percentage = totalInitialValue > 0 ? (absolute / totalInitialValue) * 100 : 0;

    // Calculate annualized return based on oldest position
    const oldestPosition = positions.reduce((oldest, pos) => {
      const posDate = pos.createdAt ? new Date(pos.createdAt).getTime() : Date.now();
      const oldestDate = oldest.createdAt ? new Date(oldest.createdAt).getTime() : Date.now();
      return posDate < oldestDate ? pos : oldest;
    }, positions[0]);

    const daysSinceCreation = oldestPosition?.createdAt
      ? (Date.now() - new Date(oldestPosition.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      : 1;

    const annualized = daysSinceCreation > 0
      ? Math.pow(1 + percentage / 100, 365 / daysSinceCreation) * 100 - 100
      : percentage;

    return {
      absolute,
      percentage,
      annualized
    };
  }

  private calculatePositionContribution(
    position: DLMMPosition,
    attribution: PerformanceAttribution,
    portfolioReturn: any
  ): PositionContribution {
    const positionValue = (position as any).totalValue || 0;
    const portfolioValue = portfolioReturn.absolute + ((position as any).initialValue || 0); // Simplified
    const weight = portfolioValue > 0 ? positionValue / portfolioValue : 0;

    return {
      positionId: (position as any).address || `position_${Date.now()}`,
      tokenPair: `${position.tokenX.symbol}/${position.tokenY.symbol}`,
      weight,
      return: attribution.totalReturn.percentage,
      contribution: weight * attribution.totalReturn.percentage,
      attribution
    };
  }

  private analyzeSectorAllocation(positions: DLMMPosition[]): SectorAllocation[] {
    // Simplified sector analysis
    const sectors = new Map<string, { weight: number; return: number; positions: DLMMPosition[] }>();

    positions.forEach(position => {
      const sector = this.classifyTokenSector(position.tokenX.symbol, position.tokenY.symbol);
      const value = (position as any).totalValue || 0;

      if (!sectors.has(sector)) {
        sectors.set(sector, { weight: 0, return: 0, positions: [] });
      }

      const sectorData = sectors.get(sector)!;
      sectorData.positions.push(position);
      sectorData.weight += value;
    });

    const totalValue = positions.reduce((sum, pos) => sum + ((pos as any).totalValue || 0), 0);

    return Array.from(sectors.entries()).map(([sector, data]) => ({
      sector,
      weight: totalValue > 0 ? (data.weight / totalValue) * 100 : 0,
      return: data.positions.reduce((sum, pos) => sum + ((pos as any).pnl?.percentage || 0), 0) / data.positions.length,
      contribution: (data.weight / totalValue) * (data.positions.reduce((sum, pos) => sum + ((pos as any).pnl?.percentage || 0), 0) / data.positions.length),
      active_weight: 0 // Would compare to benchmark weights
    }));
  }

  private analyzeAssetAllocation(positions: DLMMPosition[]): AssetAllocation[] {
    const assets = new Map<string, { weight: number; return: number; volatility: number }>();

    positions.forEach(position => {
      // Analyze both tokens in the pair
      [position.tokenX, position.tokenY].forEach(token => {
        const value = ((position as any).totalValue || 0) / 2; // Simplified equal weighting
        const returnPct = (token as any).priceChange || 0;

        if (!assets.has(token.symbol)) {
          assets.set(token.symbol, { weight: 0, return: 0, volatility: 0 });
        }

        const assetData = assets.get(token.symbol)!;
        assetData.weight += value;
        assetData.return = returnPct; // Simplified
        assetData.volatility = Math.abs(returnPct) * 2; // Simplified volatility
      });
    });

    const totalValue = positions.reduce((sum, pos) => sum + ((pos as any).totalValue || 0), 0);

    return Array.from(assets.entries()).map(([asset, data]) => ({
      asset,
      weight: totalValue > 0 ? (data.weight / totalValue) * 100 : 0,
      return: data.return,
      contribution: (data.weight / totalValue) * data.return,
      volatility: data.volatility,
      correlation: 0.5 // Simplified correlation
    }));
  }

  private analyzeRiskContribution(positions: DLMMPosition[]): RiskContribution[] {
    return positions.map(position => ({
      source: `${position.tokenX.symbol}/${position.tokenY.symbol}`,
      contribution: ((position as any).totalValue || 0) * 0.01, // Simplified risk contribution
      marginalRisk: 0.02,
      componentRisk: 0.015
    }));
  }

  private decomposePortfolioPerformance(_positions: DLMMPosition[]): PerformanceDecomposition {
    // Simplified Brinson attribution
    return {
      assetAllocation: 0.5,
      stockSelection: 1.2,
      interaction: 0.1,
      timing: 0.2,
      currency: 0
    };
  }

  private generateAttributionSummary(
    positionContributions: PositionContribution[],
    _sectorAllocation: SectorAllocation[],
    riskContribution: RiskContribution[]
  ): AttributionSummary {
    const topContributors = positionContributions
      .filter(p => p.contribution > 0)
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 5)
      .map(p => ({
        name: p.tokenPair,
        type: 'position' as const,
        contribution: p.contribution,
        percentage: p.return
      }));

    const topDetractors = positionContributions
      .filter(p => p.contribution < 0)
      .sort((a, b) => a.contribution - b.contribution)
      .slice(0, 5)
      .map(p => ({
        name: p.tokenPair,
        type: 'position' as const,
        contribution: p.contribution,
        percentage: p.return
      }));

    const riskFactors = riskContribution.slice(0, 5).map(r => ({
      factor: r.source,
      exposure: r.componentRisk,
      contribution: r.contribution,
      description: `Risk from ${r.source} position`
    }));

    return {
      topContributors,
      topDetractors,
      riskFactors,
      insights: [
        'Fee income remains the most consistent return driver',
        'Price appreciation showing strong momentum in major pairs',
        'Impermanent loss risk is within acceptable ranges'
      ],
      recommendations: [
        'Consider rebalancing overweight positions',
        'Increase exposure to high-performing sectors',
        'Monitor correlation increases during market stress'
      ]
    };
  }

  /**
   * Utility methods
   */
  private async getPositionReturns(_position: DLMMPosition): Promise<number[]> {
    // Mock historical returns - in real implementation, fetch actual data
    return Array.from({ length: 30 }, () => (Math.random() - 0.5) * 0.1);
  }

  private async getBenchmarkReturns(): Promise<number[]> {
    // Mock benchmark returns
    return Array.from({ length: 30 }, () => (Math.random() - 0.5) * 0.08);
  }

  private calculateMean(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  private calculateVolatility(values: number[]): number {
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateDownwardVolatility(values: number[]): number {
    const mean = this.calculateMean(values);
    const downwardValues = values.filter(val => val < mean);
    return this.calculateVolatility(downwardValues);
  }

  private calculateMaxDrawdown(values: number[]): number {
    let maxDrawdown = 0;
    let peak = values[0] || 0;

    for (const value of values) {
      peak = Math.max(peak, value);
      const drawdown = (peak - value) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }

  private calculateBeta(assetReturns: number[], marketReturns: number[]): number {
    if (assetReturns.length !== marketReturns.length || assetReturns.length === 0) return 1;

    const assetMean = this.calculateMean(assetReturns);
    const marketMean = this.calculateMean(marketReturns);

    let covariance = 0;
    let marketVariance = 0;

    for (let i = 0; i < assetReturns.length; i++) {
      covariance += (assetReturns[i] - assetMean) * (marketReturns[i] - marketMean);
      marketVariance += Math.pow(marketReturns[i] - marketMean, 2);
    }

    return marketVariance > 0 ? covariance / marketVariance : 1;
  }

  private calculateVaR(returns: number[], confidence: number): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    return sortedReturns[index] || 0;
  }

  private calculateCVaR(returns: number[], confidence: number): number {
    const var95 = this.calculateVaR(returns, confidence);
    const tailReturns = returns.filter(ret => ret <= var95);
    return tailReturns.length > 0 ? this.calculateMean(tailReturns) : var95;
  }

  private calculateTrackingError(assetReturns: number[], benchmarkReturns: number[]): number {
    const differences = assetReturns.map((ret, i) => ret - (benchmarkReturns[i] || 0));
    return this.calculateVolatility(differences);
  }

  private calculateCaptureRatio(
    assetReturns: number[],
    benchmarkReturns: number[],
    direction: 'up' | 'down'
  ): number {
    const filteredPairs = assetReturns
      .map((ret, i) => ({ asset: ret, benchmark: benchmarkReturns[i] || 0 }))
      .filter(pair => direction === 'up' ? pair.benchmark > 0 : pair.benchmark < 0);

    if (filteredPairs.length === 0) return 1;

    const assetSum = filteredPairs.reduce((sum, pair) => sum + pair.asset, 0);
    const benchmarkSum = filteredPairs.reduce((sum, pair) => sum + pair.benchmark, 0);

    return benchmarkSum !== 0 ? assetSum / benchmarkSum : 1;
  }

  private identifyActiveBets(_position: DLMMPosition): ActiveBet[] {
    return [
      {
        factor: 'concentration',
        exposure: 0.15,
        contribution: 0.05,
        significance: 'medium'
      }
    ];
  }

  private classifyTokenSector(tokenX: string, tokenY: string): string {
    const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD'];
    const defiTokens = ['UNI', 'AAVE', 'COMP', 'SUSHI'];

    if (stablecoins.includes(tokenX) || stablecoins.includes(tokenY)) {
      return 'Stablecoins';
    }
    if (defiTokens.includes(tokenX) || defiTokens.includes(tokenY)) {
      return 'DeFi';
    }
    return 'Other';
  }

  private getEmptyAttribution(positionId: string): PerformanceAttribution {
    const emptyComponent: AttributionComponent = {
      value: 0,
      percentage: 0,
      confidence: 0,
      breakdown: [],
      volatility: 0,
      sharpeRatio: 0
    };

    return {
      positionId,
      totalReturn: { absolute: 0, percentage: 0, annualized: 0 },
      attribution: {
        feeIncome: emptyComponent,
        priceAppreciation: emptyComponent,
        impermanentLoss: emptyComponent,
        rebalancing: emptyComponent,
        compounding: emptyComponent,
        timing: emptyComponent
      },
      timeWeightedReturn: 0,
      moneyWeightedReturn: 0,
      riskAdjustedMetrics: {
        sharpeRatio: 0,
        sortinoRatio: 0,
        informationRatio: 0,
        treynorRatio: 0,
        calmarRatio: 0,
        maxDrawdown: 0,
        valueAtRisk: 0,
        conditionalVaR: 0,
        beta: 1,
        alpha: 0
      },
      benchmarkComparison: {
        benchmark: this.config.benchmarkIndex,
        benchmarkReturn: 0,
        relativeReturn: 0,
        trackingError: 0,
        informationRatio: 0,
        upCaptureRatio: 1,
        downCaptureRatio: 1,
        activeBets: []
      },
      contributionAnalysis: {
        positionSizing: 0,
        entryTiming: 0,
        exitTiming: 0,
        rangeSelection: 0,
        feeStrategy: 0,
        rebalanceFrequency: 0
      },
      factorExposure: {
        market: 0,
        volatility: 0,
        momentum: 0,
        meanReversion: 0,
        carry: 0,
        quality: 0,
        liquidity: 0
      }
    };
  }

  private getEmptyPortfolioAttribution(): PortfolioAttribution {
    return {
      totalPortfolioReturn: { absolute: 0, percentage: 0, annualized: 0 },
      positionContributions: [],
      sectorAllocation: [],
      assetAllocation: [],
      riskContribution: [],
      performanceDecomposition: {
        assetAllocation: 0,
        stockSelection: 0,
        interaction: 0,
        timing: 0,
        currency: 0
      },
      attributionSummary: {
        topContributors: [],
        topDetractors: [],
        riskFactors: [],
        insights: [],
        recommendations: []
      }
    };
  }

  /**
   * Track historical attribution
   */
  public trackHistoricalAttribution(
    positionId: string,
    attribution: PerformanceAttribution
  ): void {
    const history = this.attributionHistory.get(positionId) || [];

    const historicalData: HistoricalAttribution = {
      date: new Date(),
      return: attribution.totalReturn.percentage,
      attribution: {
        fees: attribution.attribution.feeIncome.percentage,
        priceChange: attribution.attribution.priceAppreciation.percentage,
        impermanentLoss: attribution.attribution.impermanentLoss.percentage,
        rebalancing: attribution.attribution.rebalancing.percentage
      },
      cumulativeAttribution: this.calculateCumulativeAttribution(history, {
        fees: attribution.attribution.feeIncome.percentage,
        priceChange: attribution.attribution.priceAppreciation.percentage,
        impermanentLoss: attribution.attribution.impermanentLoss.percentage,
        rebalancing: attribution.attribution.rebalancing.percentage
      })
    };

    history.push(historicalData);
    this.attributionHistory.set(positionId, history.slice(-365)); // Keep 1 year of data
  }

  private calculateCumulativeAttribution(
    history: HistoricalAttribution[],
    current: any
  ): any {
    const latest = history[history.length - 1];

    if (!latest) {
      return current;
    }

    return {
      fees: latest.cumulativeAttribution.fees + current.fees,
      priceChange: latest.cumulativeAttribution.priceChange + current.priceChange,
      impermanentLoss: latest.cumulativeAttribution.impermanentLoss + current.impermanentLoss,
      rebalancing: latest.cumulativeAttribution.rebalancing + current.rebalancing
    };
  }

  /**
   * Get historical attribution data
   */
  public getHistoricalAttribution(positionId: string): HistoricalAttribution[] {
    return this.attributionHistory.get(positionId) || [];
  }

  /**
   * Update attribution configuration
   */
  public updateConfig(newConfig: Partial<AttributionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): AttributionConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const performanceAttributionEngine = new PerformanceAttributionEngine();