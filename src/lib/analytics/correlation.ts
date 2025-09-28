import { DLMMPosition } from '@/lib/types';

export interface CorrelationMatrix {
  positions: string[]; // Position IDs
  correlations: number[][]; // NxN correlation matrix
  eigenvalues: number[]; // Principal component eigenvalues
  variance_explained: number[]; // Variance explained by each component
  condition_number: number; // Matrix condition number for stability
  timestamp: Date;
}

export interface TokenPairCorrelation {
  tokenX: string;
  tokenY: string;
  correlation: number;
  confidence: number; // Statistical confidence (0-100)
  sample_size: number;
  timeframe: string;
  p_value: number; // Statistical significance
  last_updated: Date;
}

export interface CorrelationAnalysis {
  portfolio_correlation_matrix: CorrelationMatrix;
  token_correlations: TokenPairCorrelation[];
  risk_factor_correlations: RiskFactorCorrelation[];
  time_varying_correlations: TimeVaryingCorrelation[];
  diversification_metrics: DiversificationMetrics;
  correlation_breakdown: CorrelationBreakdown;
  portfolio_optimization_insights: OptimizationInsights;
  stress_test_correlations: StressTestCorrelation[];
}

export interface RiskFactorCorrelation {
  factor1: string;
  factor2: string;
  correlation: number;
  rolling_correlation: number[]; // 30-day rolling
  stability_score: number; // How stable the correlation is
  regime_dependent: boolean; // Does correlation change with market regime
}

export interface TimeVaryingCorrelation {
  position_pair: string;
  correlations: {
    date: Date;
    correlation: number;
    volatility: number;
  }[];
  average_correlation: number;
  correlation_volatility: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  regime_shifts: RegimeShift[];
}

export interface RegimeShift {
  date: Date;
  from_correlation: number;
  to_correlation: number;
  magnitude: number;
  persistence: number; // How long the shift lasted
  trigger: string; // Market event that triggered shift
}

export interface DiversificationMetrics {
  effective_positions: number; // Effective number of independent positions
  diversification_ratio: number; // Portfolio vol / weighted avg vol
  concentration_risk: number; // HHI-based concentration measure
  correlation_adjusted_risk: number; // Risk after correlation adjustment
  optimal_position_count: number; // Suggested number of positions
  diversification_score: number; // Overall diversification quality (0-100)
  marginal_diversification: MarginalDiversification[]; // Impact of each position
}

export interface MarginalDiversification {
  position_id: string;
  current_weight: number;
  marginal_contribution: number; // Contribution to portfolio correlation
  diversification_benefit: number; // Benefit of including this position
  replacement_candidates: string[]; // Better diversification alternatives
}

export interface CorrelationBreakdown {
  market_correlation: number; // Overall market correlation
  sector_correlations: SectorCorrelation[];
  size_factor_correlation: number;
  volatility_factor_correlation: number;
  momentum_factor_correlation: number;
  mean_reversion_correlation: number;
  liquidity_factor_correlation: number;
  idiosyncratic_correlation: number; // Position-specific correlation
}

export interface SectorCorrelation {
  sector: string;
  internal_correlation: number; // Correlation within sector
  external_correlation: number; // Correlation with other sectors
  weight: number; // Sector weight in portfolio
  contribution: number; // Contribution to overall correlation
}

export interface OptimizationInsights {
  overconcentrated_pairs: string[]; // Highly correlated position pairs
  diversification_opportunities: DiversificationOpportunity[];
  rebalancing_recommendations: RebalancingRecommendation[];
  risk_reduction_potential: number; // Potential risk reduction %
  optimal_weights: OptimalWeight[];
}

export interface DiversificationOpportunity {
  current_correlation: number;
  target_correlation: number;
  action: 'add_position' | 'reduce_position' | 'replace_position';
  position_id: string;
  expected_benefit: number;
  implementation_cost: number;
  priority: 'high' | 'medium' | 'low';
}

export interface RebalancingRecommendation {
  position_id: string;
  current_weight: number;
  recommended_weight: number;
  reason: string;
  expected_correlation_impact: number;
  risk_impact: number;
}

export interface OptimalWeight {
  position_id: string;
  current_weight: number;
  optimal_weight: number;
  adjustment_needed: number;
  confidence: number;
}

export interface StressTestCorrelation {
  scenario: string;
  normal_correlation: number;
  stress_correlation: number;
  correlation_increase: number;
  affected_positions: string[];
  risk_multiplier: number;
  recovery_time: number; // Days to return to normal correlation
}

export interface CorrelationConfig {
  correlation_window: number; // Days for correlation calculation
  rolling_window: number; // Days for rolling correlation
  significance_level: number; // For statistical tests
  regime_change_threshold: number; // Threshold for regime detection
  stress_test_scenarios: string[]; // Scenarios to test
  min_observations: number; // Minimum data points required
}

export interface HistoricalCorrelationData {
  date: Date;
  position_pair: string;
  correlation: number;
  volatility_x: number;
  volatility_y: number;
  market_regime: 'bull' | 'bear' | 'sideways' | 'volatile';
}

export class CrossPositionCorrelationEngine {
  private correlationHistory: Map<string, HistoricalCorrelationData[]> = new Map();
  private correlationCache: Map<string, CorrelationMatrix> = new Map();
  private config: CorrelationConfig = {
    correlation_window: 90, // 90 days
    rolling_window: 30, // 30 days
    significance_level: 0.05,
    regime_change_threshold: 0.3,
    stress_test_scenarios: ['market_crash', 'liquidity_crisis', 'sector_rotation'],
    min_observations: 30
  };

  constructor(config?: Partial<CorrelationConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.initializeCorrelationEngine();
  }

  private initializeCorrelationEngine(): void {
    console.log('Cross-Position Correlation Engine initialized');
  }

  /**
   * Perform comprehensive correlation analysis for portfolio
   */
  public async analyzePortfolioCorrelations(
    positions: DLMMPosition[],
    marketData?: Map<string, any>
  ): Promise<CorrelationAnalysis> {
    try {
      if (positions.length < 2) {
        return this.getEmptyCorrelationAnalysis();
      }

      // Generate correlation matrix for all positions
      const portfolio_correlation_matrix = await this.calculateCorrelationMatrix(positions);

      // Analyze token pair correlations
      const token_correlations = await this.analyzeTokenCorrelations(positions);

      // Analyze risk factor correlations
      const risk_factor_correlations = await this.analyzeRiskFactorCorrelations(positions);

      // Calculate time-varying correlations
      const time_varying_correlations = await this.calculateTimeVaryingCorrelations(positions);

      // Calculate diversification metrics
      const diversification_metrics = this.calculateDiversificationMetrics(
        positions,
        portfolio_correlation_matrix
      );

      // Breakdown correlation sources
      const correlation_breakdown = this.analyzeCorrelationBreakdown(positions, marketData);

      // Generate optimization insights
      const portfolio_optimization_insights = this.generateOptimizationInsights(
        positions,
        portfolio_correlation_matrix,
        diversification_metrics
      );

      // Perform stress testing
      const stress_test_correlations = await this.performStressTestCorrelations(positions);

      return {
        portfolio_correlation_matrix,
        token_correlations,
        risk_factor_correlations,
        time_varying_correlations,
        diversification_metrics,
        correlation_breakdown,
        portfolio_optimization_insights,
        stress_test_correlations
      };

    } catch (error) {
      console.error('Error analyzing portfolio correlations:', error);
      return this.getEmptyCorrelationAnalysis();
    }
  }

  /**
   * Calculate correlation matrix for all positions
   */
  private async calculateCorrelationMatrix(positions: DLMMPosition[]): Promise<CorrelationMatrix> {
    const positionIds = positions.map(p => (p as any).address || `pos_${Date.now()}`);
    const n = positions.length;

    // Initialize correlation matrix
    const correlations: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));

    // Get return series for each position
    const returnSeries = await Promise.all(
      positions.map(position => this.getPositionReturns(position))
    );

    // Calculate pairwise correlations
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          correlations[i][j] = 1.0;
        } else {
          correlations[i][j] = this.calculatePearsonCorrelation(
            returnSeries[i],
            returnSeries[j]
          );
        }
      }
    }

    // Calculate eigenvalues and variance explained
    const eigenAnalysis = this.calculateEigenvalues(correlations);

    return {
      positions: positionIds,
      correlations,
      eigenvalues: eigenAnalysis.eigenvalues,
      variance_explained: eigenAnalysis.variance_explained,
      condition_number: eigenAnalysis.condition_number,
      timestamp: new Date()
    };
  }

  /**
   * Analyze correlations between token pairs
   */
  private async analyzeTokenCorrelations(positions: DLMMPosition[]): Promise<TokenPairCorrelation[]> {
    const correlations: TokenPairCorrelation[] = [];
    const tokenPairs = new Set<string>();

    // Extract unique token pairs
    positions.forEach(position => {
      const tokenX = position.tokenX.symbol;
      const tokenY = position.tokenY.symbol;
      const pair = [tokenX, tokenY].sort().join('/');
      tokenPairs.add(pair);
    });

    // Calculate correlation for each unique token pair
    for (const pair of Array.from(tokenPairs)) {
      const [tokenX, tokenY] = pair.split('/');

      // Get price series for both tokens
      const priceSeriesX = await this.getTokenPriceReturns(tokenX);
      const priceSeriesY = await this.getTokenPriceReturns(tokenY);

      if (priceSeriesX.length >= this.config.min_observations &&
          priceSeriesY.length >= this.config.min_observations) {

        const correlation = this.calculatePearsonCorrelation(priceSeriesX, priceSeriesY);
        const confidence = this.calculateCorrelationConfidence(priceSeriesX, priceSeriesY);
        const pValue = this.calculateCorrelationPValue(correlation, priceSeriesX.length);

        correlations.push({
          tokenX,
          tokenY,
          correlation,
          confidence,
          sample_size: Math.min(priceSeriesX.length, priceSeriesY.length),
          timeframe: `${this.config.correlation_window}d`,
          p_value: pValue,
          last_updated: new Date()
        });
      }
    }

    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  /**
   * Analyze risk factor correlations
   */
  private async analyzeRiskFactorCorrelations(
    positions: DLMMPosition[]
  ): Promise<RiskFactorCorrelation[]> {
    const riskFactors = [
      'market_beta',
      'volatility',
      'momentum',
      'mean_reversion',
      'liquidity',
      'size',
      'quality'
    ];

    const correlations: RiskFactorCorrelation[] = [];

    // Calculate correlations between all risk factor pairs
    for (let i = 0; i < riskFactors.length; i++) {
      for (let j = i + 1; j < riskFactors.length; j++) {
        const factor1 = riskFactors[i];
        const factor2 = riskFactors[j];

        const factor1Series = await this.getRiskFactorSeries(factor1, positions);
        const factor2Series = await this.getRiskFactorSeries(factor2, positions);

        const correlation = this.calculatePearsonCorrelation(factor1Series, factor2Series);
        const rollingCorrelation = this.calculateRollingCorrelation(
          factor1Series,
          factor2Series,
          this.config.rolling_window
        );

        const stabilityScore = this.calculateCorrelationStability(rollingCorrelation);
        const regimeDependent = this.isCorrelationRegimeDependent(
          factor1Series,
          factor2Series
        );

        correlations.push({
          factor1,
          factor2,
          correlation,
          rolling_correlation: rollingCorrelation,
          stability_score: stabilityScore,
          regime_dependent: regimeDependent
        });
      }
    }

    return correlations;
  }

  /**
   * Calculate time-varying correlations
   */
  private async calculateTimeVaryingCorrelations(
    positions: DLMMPosition[]
  ): Promise<TimeVaryingCorrelation[]> {
    const timeVaryingCorrelations: TimeVaryingCorrelation[] = [];

    // Calculate for all position pairs
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const pos1 = positions[i];
        const pos2 = positions[j];
        const pairId = `${(pos1 as any).address || i}_${(pos2 as any).address || j}`;

        const returns1 = await this.getPositionReturns(pos1);
        const returns2 = await this.getPositionReturns(pos2);

        const timeSeriesCorrelations = this.calculateTimeSeriesCorrelations(
          returns1,
          returns2,
          this.config.rolling_window
        );

        const averageCorrelation = this.calculateMean(
          timeSeriesCorrelations.map(tc => tc.correlation)
        );

        const correlationVolatility = this.calculateVolatility(
          timeSeriesCorrelations.map(tc => tc.correlation)
        );

        const trend = this.analyzeTrend(
          timeSeriesCorrelations.map(tc => tc.correlation)
        );

        const regimeShifts = this.detectRegimeShifts(timeSeriesCorrelations);

        timeVaryingCorrelations.push({
          position_pair: pairId,
          correlations: timeSeriesCorrelations,
          average_correlation: averageCorrelation,
          correlation_volatility: correlationVolatility,
          trend,
          regime_shifts: regimeShifts
        });
      }
    }

    return timeVaryingCorrelations;
  }

  /**
   * Calculate diversification metrics
   */
  private calculateDiversificationMetrics(
    positions: DLMMPosition[],
    correlationMatrix: CorrelationMatrix
  ): DiversificationMetrics {
    const weights = this.calculatePositionWeights(positions);
    const correlations = correlationMatrix.correlations;

    // Calculate effective number of positions
    const effectivePositions = this.calculateEffectivePositions(weights, correlations);

    // Calculate diversification ratio
    const diversificationRatio = this.calculateDiversificationRatio(weights, correlations);

    // Calculate concentration risk (HHI)
    const concentrationRisk = weights.reduce((sum, w) => sum + w * w, 0) * 100;

    // Calculate correlation-adjusted risk
    const correlationAdjustedRisk = this.calculateCorrelationAdjustedRisk(weights, correlations);

    // Suggest optimal position count
    const optimalPositionCount = this.calculateOptimalPositionCount(correlations);

    // Overall diversification score
    const diversificationScore = this.calculateDiversificationScore(
      effectivePositions,
      concentrationRisk,
      diversificationRatio
    );

    // Calculate marginal diversification for each position
    const marginalDiversification = this.calculateMarginalDiversification(
      positions,
      weights,
      correlations
    );

    return {
      effective_positions: effectivePositions,
      diversification_ratio: diversificationRatio,
      concentration_risk: concentrationRisk,
      correlation_adjusted_risk: correlationAdjustedRisk,
      optimal_position_count: optimalPositionCount,
      diversification_score: diversificationScore,
      marginal_diversification: marginalDiversification
    };
  }

  /**
   * Analyze correlation breakdown by factors
   */
  private analyzeCorrelationBreakdown(
    positions: DLMMPosition[],
    marketData?: Map<string, any>
  ): CorrelationBreakdown {
    // Calculate market correlation (beta)
    const marketCorrelation = this.calculateMarketCorrelation(positions);

    // Analyze sector correlations
    const sectorCorrelations = this.analyzeSectorCorrelations(positions);

    // Calculate factor correlations
    const sizeFactorCorrelation = this.calculateFactorCorrelation(positions, 'size');
    const volatilityFactorCorrelation = this.calculateFactorCorrelation(positions, 'volatility');
    const momentumFactorCorrelation = this.calculateFactorCorrelation(positions, 'momentum');
    const meanReversionCorrelation = this.calculateFactorCorrelation(positions, 'mean_reversion');
    const liquidityFactorCorrelation = this.calculateFactorCorrelation(positions, 'liquidity');

    // Calculate idiosyncratic correlation
    const idiosyncraticCorrelation = this.calculateIdiosyncraticCorrelation(positions);

    return {
      market_correlation: marketCorrelation,
      sector_correlations: sectorCorrelations,
      size_factor_correlation: sizeFactorCorrelation,
      volatility_factor_correlation: volatilityFactorCorrelation,
      momentum_factor_correlation: momentumFactorCorrelation,
      mean_reversion_correlation: meanReversionCorrelation,
      liquidity_factor_correlation: liquidityFactorCorrelation,
      idiosyncratic_correlation: idiosyncraticCorrelation
    };
  }

  /**
   * Generate portfolio optimization insights
   */
  private generateOptimizationInsights(
    positions: DLMMPosition[],
    correlationMatrix: CorrelationMatrix,
    diversificationMetrics: DiversificationMetrics
  ): OptimizationInsights {
    // Identify overconcentrated pairs
    const overconcentratedPairs = this.identifyOverconcentratedPairs(
      correlationMatrix,
      0.8 // High correlation threshold
    );

    // Find diversification opportunities
    const diversificationOpportunities = this.identifyDiversificationOpportunities(
      positions,
      correlationMatrix,
      diversificationMetrics
    );

    // Generate rebalancing recommendations
    const rebalancingRecommendations = this.generateRebalancingRecommendations(
      positions,
      correlationMatrix
    );

    // Calculate risk reduction potential
    const riskReductionPotential = this.calculateRiskReductionPotential(
      correlationMatrix,
      diversificationMetrics
    );

    // Calculate optimal weights using mean-variance optimization
    const optimalWeights = this.calculateOptimalWeights(positions, correlationMatrix);

    return {
      overconcentrated_pairs: overconcentratedPairs,
      diversification_opportunities: diversificationOpportunities,
      rebalancing_recommendations: rebalancingRecommendations,
      risk_reduction_potential: riskReductionPotential,
      optimal_weights: optimalWeights
    };
  }

  /**
   * Perform stress test correlations
   */
  private async performStressTestCorrelations(
    positions: DLMMPosition[]
  ): Promise<StressTestCorrelation[]> {
    const stressTests: StressTestCorrelation[] = [];

    for (const scenario of this.config.stress_test_scenarios) {
      const normalCorrelation = await this.calculateNormalCorrelation(positions);
      const stressCorrelation = await this.calculateStressCorrelation(positions, scenario);

      const correlationIncrease = stressCorrelation - normalCorrelation;
      const affectedPositions = this.identifyAffectedPositions(positions, scenario);
      const riskMultiplier = this.calculateRiskMultiplier(correlationIncrease);
      const recoveryTime = this.estimateRecoveryTime(scenario);

      stressTests.push({
        scenario,
        normal_correlation: normalCorrelation,
        stress_correlation: stressCorrelation,
        correlation_increase: correlationIncrease,
        affected_positions: affectedPositions,
        risk_multiplier: riskMultiplier,
        recovery_time: recoveryTime
      });
    }

    return stressTests;
  }

  /**
   * Helper methods for statistical calculations
   */
  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateEigenvalues(matrix: number[][]): {
    eigenvalues: number[];
    variance_explained: number[];
    condition_number: number;
  } {
    // Simplified eigenvalue calculation (in practice, would use numerical library)
    const n = matrix.length;
    const eigenvalues = Array(n).fill(1); // Simplified

    const totalVariance = eigenvalues.reduce((sum, val) => sum + val, 0);
    const variance_explained = eigenvalues.map(val => val / totalVariance);

    const maxEigen = Math.max(...eigenvalues);
    const minEigen = Math.min(...eigenvalues.filter(val => val > 0));
    const condition_number = maxEigen / minEigen;

    return { eigenvalues, variance_explained, condition_number };
  }

  private async getPositionReturns(position: DLMMPosition): Promise<number[]> {
    // Mock return series - in real implementation, fetch actual historical data
    return Array.from({ length: this.config.correlation_window },
      () => (Math.random() - 0.5) * 0.1
    );
  }

  private async getTokenPriceReturns(tokenSymbol: string): Promise<number[]> {
    // Mock price return series
    return Array.from({ length: this.config.correlation_window },
      () => (Math.random() - 0.5) * 0.08
    );
  }

  private async getRiskFactorSeries(factor: string, positions: DLMMPosition[]): Promise<number[]> {
    // Mock risk factor series
    return Array.from({ length: this.config.correlation_window },
      () => Math.random()
    );
  }

  private calculateRollingCorrelation(
    x: number[],
    y: number[],
    window: number
  ): number[] {
    const rolling: number[] = [];

    for (let i = window - 1; i < x.length; i++) {
      const xWindow = x.slice(i - window + 1, i + 1);
      const yWindow = y.slice(i - window + 1, i + 1);
      rolling.push(this.calculatePearsonCorrelation(xWindow, yWindow));
    }

    return rolling;
  }

  private calculateCorrelationStability(rollingCorrelations: number[]): number {
    if (rollingCorrelations.length === 0) return 0;

    const volatility = this.calculateVolatility(rollingCorrelations);
    return Math.max(0, 100 - volatility * 100);
  }

  private isCorrelationRegimeDependent(x: number[], y: number[]): boolean {
    // Simplified regime dependence check
    const midpoint = Math.floor(x.length / 2);
    const firstHalf = this.calculatePearsonCorrelation(
      x.slice(0, midpoint),
      y.slice(0, midpoint)
    );
    const secondHalf = this.calculatePearsonCorrelation(
      x.slice(midpoint),
      y.slice(midpoint)
    );

    return Math.abs(firstHalf - secondHalf) > this.config.regime_change_threshold;
  }

  private calculateTimeSeriesCorrelations(
    x: number[],
    y: number[],
    window: number
  ): Array<{ date: Date; correlation: number; volatility: number }> {
    const correlations: Array<{ date: Date; correlation: number; volatility: number }> = [];
    const now = new Date();

    for (let i = window - 1; i < x.length; i++) {
      const xWindow = x.slice(i - window + 1, i + 1);
      const yWindow = y.slice(i - window + 1, i + 1);

      const date = new Date(now.getTime() - (x.length - i - 1) * 24 * 60 * 60 * 1000);
      const correlation = this.calculatePearsonCorrelation(xWindow, yWindow);
      const volatility = Math.sqrt(
        (this.calculateVolatility(xWindow) + this.calculateVolatility(yWindow)) / 2
      );

      correlations.push({ date, correlation, volatility });
    }

    return correlations;
  }

  private detectRegimeShifts(
    timeSeriesCorr: Array<{ date: Date; correlation: number; volatility: number }>
  ): RegimeShift[] {
    const shifts: RegimeShift[] = [];

    for (let i = 1; i < timeSeriesCorr.length; i++) {
      const current = timeSeriesCorr[i];
      const previous = timeSeriesCorr[i - 1];

      const correlationChange = Math.abs(current.correlation - previous.correlation);

      if (correlationChange > this.config.regime_change_threshold) {
        shifts.push({
          date: current.date,
          from_correlation: previous.correlation,
          to_correlation: current.correlation,
          magnitude: correlationChange,
          persistence: this.calculateShiftPersistence(timeSeriesCorr, i),
          trigger: this.identifyShiftTrigger(current.date)
        });
      }
    }

    return shifts;
  }

  private calculateShiftPersistence(
    timeSeriesCorr: Array<{ date: Date; correlation: number; volatility: number }>,
    shiftIndex: number
  ): number {
    // Simplified persistence calculation
    return Math.min(30, timeSeriesCorr.length - shiftIndex);
  }

  private identifyShiftTrigger(date: Date): string {
    // Simplified trigger identification
    return 'market_volatility';
  }

  private calculatePositionWeights(positions: DLMMPosition[]): number[] {
    const totalValue = positions.reduce((sum, pos) => sum + ((pos as any).totalValue || 0), 0);

    if (totalValue === 0) {
      return positions.map(() => 1 / positions.length);
    }

    return positions.map(pos => ((pos as any).totalValue || 0) / totalValue);
  }

  private calculateEffectivePositions(weights: number[], correlations: number[][]): number {
    // Calculate using inverse of sum of squared weights adjusted for correlations
    let sumSquaredWeights = 0;
    let correlationAdjustment = 0;

    for (let i = 0; i < weights.length; i++) {
      sumSquaredWeights += weights[i] * weights[i];

      for (let j = 0; j < weights.length; j++) {
        if (i !== j) {
          correlationAdjustment += weights[i] * weights[j] * correlations[i][j];
        }
      }
    }

    return 1 / (sumSquaredWeights + correlationAdjustment);
  }

  private calculateDiversificationRatio(weights: number[], correlations: number[][]): number {
    // Simplified diversification ratio calculation
    const weightedAvgVol = weights.reduce((sum, w) => sum + w * 0.2, 0); // Assuming 20% volatility
    const portfolioVol = Math.sqrt(
      weights.reduce((sum, wi, i) =>
        sum + weights.reduce((innerSum, wj, j) =>
          innerSum + wi * wj * correlations[i][j] * 0.04, 0), 0) // 0.04 = 0.2^2
    );

    return portfolioVol > 0 ? weightedAvgVol / portfolioVol : 1;
  }

  private calculateCorrelationAdjustedRisk(weights: number[], correlations: number[][]): number {
    // Portfolio variance calculation
    let portfolioVariance = 0;

    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        portfolioVariance += weights[i] * weights[j] * correlations[i][j] * 0.04; // Assuming 20% vol
      }
    }

    return Math.sqrt(portfolioVariance) * 100; // Return as percentage
  }

  private calculateOptimalPositionCount(correlations: number[][]): number {
    const avgCorrelation = this.calculateAverageCorrelation(correlations);

    // Optimal count based on correlation level
    if (avgCorrelation < 0.2) return 15;
    if (avgCorrelation < 0.4) return 12;
    if (avgCorrelation < 0.6) return 8;
    return 5;
  }

  private calculateAverageCorrelation(correlations: number[][]): number {
    let sum = 0;
    let count = 0;

    for (let i = 0; i < correlations.length; i++) {
      for (let j = i + 1; j < correlations.length; j++) {
        sum += Math.abs(correlations[i][j]);
        count++;
      }
    }

    return count > 0 ? sum / count : 0;
  }

  private calculateDiversificationScore(
    effectivePositions: number,
    concentrationRisk: number,
    diversificationRatio: number
  ): number {
    // Composite score combining multiple metrics
    const positionScore = Math.min(effectivePositions / 10 * 100, 100);
    const concentrationScore = Math.max(0, 100 - concentrationRisk);
    const ratioScore = Math.min(diversificationRatio * 100, 100);

    return (positionScore * 0.4 + concentrationScore * 0.3 + ratioScore * 0.3);
  }

  private calculateMarginalDiversification(
    positions: DLMMPosition[],
    weights: number[],
    correlations: number[][]
  ): MarginalDiversification[] {
    return positions.map((position, i) => ({
      position_id: (position as any).address || `pos_${i}`,
      current_weight: weights[i],
      marginal_contribution: this.calculateMarginalContribution(i, weights, correlations),
      diversification_benefit: this.calculateDiversificationBenefit(i, correlations),
      replacement_candidates: this.findReplacementCandidates(i, correlations)
    }));
  }

  private calculateMarginalContribution(
    positionIndex: number,
    weights: number[],
    correlations: number[][]
  ): number {
    // Calculate marginal risk contribution
    let marginalContrib = 0;

    for (let j = 0; j < weights.length; j++) {
      marginalContrib += weights[j] * correlations[positionIndex][j];
    }

    return marginalContrib * weights[positionIndex];
  }

  private calculateDiversificationBenefit(positionIndex: number, correlations: number[][]): number {
    const avgCorrelationWithOthers = correlations[positionIndex]
      .filter((_, j) => j !== positionIndex)
      .reduce((sum, corr) => sum + Math.abs(corr), 0) / (correlations.length - 1);

    return Math.max(0, 100 - avgCorrelationWithOthers * 100);
  }

  private findReplacementCandidates(positionIndex: number, correlations: number[][]): string[] {
    // Simplified - would implement actual candidate identification
    return [];
  }

  // Additional helper methods for breakdown analysis
  private calculateMarketCorrelation(positions: DLMMPosition[]): number {
    // Simplified market beta calculation
    return 0.7; // Assuming 70% market correlation
  }

  private analyzeSectorCorrelations(positions: DLMMPosition[]): SectorCorrelation[] {
    // Group positions by sector and calculate correlations
    const sectors = ['DeFi', 'Stablecoins', 'GameFi', 'Other'];

    return sectors.map(sector => ({
      sector,
      internal_correlation: 0.6, // High internal correlation
      external_correlation: 0.3, // Lower external correlation
      weight: 25, // Equal weighting for simplicity
      contribution: 15 // Contribution to overall correlation
    }));
  }

  private calculateFactorCorrelation(positions: DLMMPosition[], factor: string): number {
    // Simplified factor correlation calculation
    const factorMap = {
      'size': 0.4,
      'volatility': 0.5,
      'momentum': 0.3,
      'mean_reversion': -0.2,
      'liquidity': 0.6
    };

    return factorMap[factor] || 0.3;
  }

  private calculateIdiosyncraticCorrelation(positions: DLMMPosition[]): number {
    // Correlation not explained by common factors
    return 0.15; // 15% idiosyncratic correlation
  }

  // Optimization insights helper methods
  private identifyOverconcentratedPairs(
    correlationMatrix: CorrelationMatrix,
    threshold: number
  ): string[] {
    const overconcentrated: string[] = [];
    const correlations = correlationMatrix.correlations;
    const positions = correlationMatrix.positions;

    for (let i = 0; i < correlations.length; i++) {
      for (let j = i + 1; j < correlations.length; j++) {
        if (Math.abs(correlations[i][j]) > threshold) {
          overconcentrated.push(`${positions[i]}_${positions[j]}`);
        }
      }
    }

    return overconcentrated;
  }

  private identifyDiversificationOpportunities(
    positions: DLMMPosition[],
    correlationMatrix: CorrelationMatrix,
    diversificationMetrics: DiversificationMetrics
  ): DiversificationOpportunity[] {
    // Simplified opportunity identification
    return [{
      current_correlation: 0.8,
      target_correlation: 0.4,
      action: 'add_position',
      position_id: 'new_uncorrelated_position',
      expected_benefit: 15, // 15% risk reduction
      implementation_cost: 50, // $50 in fees
      priority: 'high'
    }];
  }

  private generateRebalancingRecommendations(
    positions: DLMMPosition[],
    correlationMatrix: CorrelationMatrix
  ): RebalancingRecommendation[] {
    const weights = this.calculatePositionWeights(positions);

    return positions.map((position, i) => ({
      position_id: (position as any).address || `pos_${i}`,
      current_weight: weights[i],
      recommended_weight: weights[i] * 0.9, // Reduce by 10%
      reason: 'Reduce concentration risk',
      expected_correlation_impact: -0.05,
      risk_impact: -2.5 // 2.5% risk reduction
    }));
  }

  private calculateRiskReductionPotential(
    correlationMatrix: CorrelationMatrix,
    diversificationMetrics: DiversificationMetrics
  ): number {
    const currentDiversification = diversificationMetrics.diversification_score;
    const maxPossibleDiversification = 95; // Theoretical maximum

    return (maxPossibleDiversification - currentDiversification) / 2; // Conservative estimate
  }

  private calculateOptimalWeights(
    positions: DLMMPosition[],
    correlationMatrix: CorrelationMatrix
  ): OptimalWeight[] {
    const currentWeights = this.calculatePositionWeights(positions);

    // Simplified mean-variance optimization
    return positions.map((position, i) => {
      const optimalWeight = 1 / positions.length; // Equal weighting as baseline

      return {
        position_id: (position as any).address || `pos_${i}`,
        current_weight: currentWeights[i],
        optimal_weight: optimalWeight,
        adjustment_needed: optimalWeight - currentWeights[i],
        confidence: 75
      };
    });
  }

  // Stress testing helper methods
  private async calculateNormalCorrelation(positions: DLMMPosition[]): Promise<number> {
    const correlationMatrix = await this.calculateCorrelationMatrix(positions);
    return this.calculateAverageCorrelation(correlationMatrix.correlations);
  }

  private async calculateStressCorrelation(
    positions: DLMMPosition[],
    scenario: string
  ): Promise<number> {
    const normalCorr = await this.calculateNormalCorrelation(positions);

    // Stress scenarios increase correlations
    const stressMultipliers = {
      'market_crash': 1.8,
      'liquidity_crisis': 1.6,
      'sector_rotation': 1.3
    };

    return Math.min(normalCorr * (stressMultipliers[scenario] || 1.5), 0.95);
  }

  private identifyAffectedPositions(positions: DLMMPosition[], scenario: string): string[] {
    // All positions are affected in stress scenarios
    return positions.map((pos, i) => (pos as any).address || `pos_${i}`);
  }

  private calculateRiskMultiplier(correlationIncrease: number): number {
    // Risk increases non-linearly with correlation
    return 1 + correlationIncrease * 2;
  }

  private estimateRecoveryTime(scenario: string): number {
    const recoveryTimes = {
      'market_crash': 180, // 6 months
      'liquidity_crisis': 90, // 3 months
      'sector_rotation': 45 // 1.5 months
    };

    return recoveryTimes[scenario] || 90;
  }

  // Statistical helper methods
  private calculateMean(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  private calculateVolatility(values: number[]): number {
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private analyzeTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = this.calculateMean(values.slice(0, Math.floor(values.length / 2)));
    const secondHalf = this.calculateMean(values.slice(Math.floor(values.length / 2)));

    const change = secondHalf - firstHalf;
    const threshold = 0.05;

    if (change > threshold) return 'increasing';
    if (change < -threshold) return 'decreasing';
    return 'stable';
  }

  private calculateCorrelationConfidence(x: number[], y: number[]): number {
    // Simplified confidence calculation based on sample size
    const n = Math.min(x.length, y.length);
    return Math.min(100, (n / this.config.min_observations) * 80);
  }

  private calculateCorrelationPValue(correlation: number, sampleSize: number): number {
    // Simplified p-value calculation
    const tStat = correlation * Math.sqrt((sampleSize - 2) / (1 - correlation * correlation));
    return Math.min(0.5, Math.abs(tStat) * 0.1); // Very simplified
  }

  private getEmptyCorrelationAnalysis(): CorrelationAnalysis {
    return {
      portfolio_correlation_matrix: {
        positions: [],
        correlations: [],
        eigenvalues: [],
        variance_explained: [],
        condition_number: 1,
        timestamp: new Date()
      },
      token_correlations: [],
      risk_factor_correlations: [],
      time_varying_correlations: [],
      diversification_metrics: {
        effective_positions: 0,
        diversification_ratio: 1,
        concentration_risk: 100,
        correlation_adjusted_risk: 0,
        optimal_position_count: 1,
        diversification_score: 0,
        marginal_diversification: []
      },
      correlation_breakdown: {
        market_correlation: 0,
        sector_correlations: [],
        size_factor_correlation: 0,
        volatility_factor_correlation: 0,
        momentum_factor_correlation: 0,
        mean_reversion_correlation: 0,
        liquidity_factor_correlation: 0,
        idiosyncratic_correlation: 0
      },
      portfolio_optimization_insights: {
        overconcentrated_pairs: [],
        diversification_opportunities: [],
        rebalancing_recommendations: [],
        risk_reduction_potential: 0,
        optimal_weights: []
      },
      stress_test_correlations: []
    };
  }

  /**
   * Track historical correlation data
   */
  public trackHistoricalCorrelation(
    positionPair: string,
    correlation: number,
    marketRegime: 'bull' | 'bear' | 'sideways' | 'volatile'
  ): void {
    const history = this.correlationHistory.get(positionPair) || [];

    const historicalData: HistoricalCorrelationData = {
      date: new Date(),
      position_pair: positionPair,
      correlation,
      volatility_x: 0.2, // Simplified
      volatility_y: 0.2, // Simplified
      market_regime: marketRegime
    };

    history.push(historicalData);
    this.correlationHistory.set(positionPair, history.slice(-365)); // Keep 1 year
  }

  /**
   * Get historical correlation data
   */
  public getHistoricalCorrelation(positionPair: string): HistoricalCorrelationData[] {
    return this.correlationHistory.get(positionPair) || [];
  }

  /**
   * Update correlation configuration
   */
  public updateConfig(newConfig: Partial<CorrelationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clear correlation cache
   */
  public clearCorrelationCache(): void {
    this.correlationCache.clear();
  }

  /**
   * Get correlation configuration
   */
  public getConfig(): CorrelationConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const crossPositionCorrelationEngine = new CrossPositionCorrelationEngine();