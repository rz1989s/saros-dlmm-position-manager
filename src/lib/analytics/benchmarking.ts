import { DLMMPosition } from '../types';

export interface PerformanceBenchmarkAnalysis {
  portfolio_performance: PortfolioPerformance;
  benchmark_comparisons: BenchmarkComparison[];
  risk_adjusted_metrics: RiskAdjustedComparison;
  attribution_analysis: AttributionVsBenchmark;
  rolling_performance: RollingPerformanceAnalysis;
  peer_comparison: PeerComparisonAnalysis;
  style_analysis: StyleAnalysis;
  tracking_analysis: TrackingAnalysis;
  active_share_analysis: ActiveShareAnalysis;
  performance_persistence: PerformancePersistence;
  rankings: PerformanceRankings;
  outlier_analysis: OutlierAnalysis;
}

export interface PortfolioPerformance {
  total_return: number;
  annualized_return: number;
  volatility: number;
  max_drawdown: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  calmar_ratio: number;
  upside_capture: number;
  downside_capture: number;
  win_rate: number;
  profit_factor: number;
  var_95: number;
  cvar_95: number;
  skewness: number;
  kurtosis: number;
  performance_periods: PerformancePeriod[];
}

export interface PerformancePeriod {
  period: string;
  return: number;
  volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  benchmark_return?: number;
  excess_return?: number;
}

export interface BenchmarkComparison {
  benchmark_name: string;
  benchmark_type: 'market_index' | 'sector_index' | 'peer_group' | 'custom';
  benchmark_return: number;
  benchmark_volatility: number;
  benchmark_sharpe: number;
  excess_return: number;
  excess_volatility: number;
  information_ratio: number;
  tracking_error: number;
  correlation: number;
  beta: number;
  alpha: number;
  r_squared: number;
  treynor_ratio: number;
  up_capture_ratio: number;
  down_capture_ratio: number;
  hit_rate: number;
  outperformance_consistency: number;
  relative_performance_periods: RelativePerformancePeriod[];
}

export interface RelativePerformancePeriod {
  period: string;
  portfolio_return: number;
  benchmark_return: number;
  excess_return: number;
  outperformed: boolean;
  percentile_rank: number;
}

export interface RiskAdjustedComparison {
  portfolio_metrics: RiskMetrics;
  benchmark_metrics: Map<string, RiskMetrics>;
  relative_metrics: RelativeRiskMetrics;
  risk_efficiency: RiskEfficiencyMetrics;
  risk_decomposition: RiskDecomposition;
}

export interface RiskMetrics {
  volatility: number;
  downside_deviation: number;
  maximum_drawdown: number;
  var_95: number;
  cvar_95: number;
  semi_variance: number;
  tail_ratio: number;
  gain_pain_ratio: number;
  sterling_ratio: number;
  burke_ratio: number;
}

export interface RelativeRiskMetrics {
  relative_volatility: number;
  relative_downside_deviation: number;
  relative_max_drawdown: number;
  relative_var: number;
  tracking_error: number;
  active_risk: number;
  residual_risk: number;
}

export interface RiskEfficiencyMetrics {
  risk_adjusted_excess_return: number;
  return_per_unit_risk: number;
  excess_return_per_unit_tracking_error: number;
  risk_efficiency_ratio: number;
  risk_return_ranking: number;
}

export interface RiskDecomposition {
  systematic_risk: number;
  specific_risk: number;
  style_risk: number;
  selection_risk: number;
  interaction_risk: number;
  currency_risk: number;
}

export interface AttributionVsBenchmark {
  total_excess_return: number;
  allocation_effect: number;
  selection_effect: number;
  interaction_effect: number;
  currency_effect: number;
  sector_attribution: SectorAttribution[];
  security_attribution: SecurityAttribution[];
  factor_attribution: FactorAttribution[];
}

export interface SectorAttribution {
  sector: string;
  portfolio_weight: number;
  benchmark_weight: number;
  portfolio_return: number;
  benchmark_return: number;
  allocation_effect: number;
  selection_effect: number;
  total_effect: number;
}

export interface SecurityAttribution {
  security: string;
  portfolio_weight: number;
  benchmark_weight: number;
  security_return: number;
  contribution_to_return: number;
  contribution_to_excess_return: number;
}

export interface FactorAttribution {
  factor: string;
  factor_exposure: number;
  factor_return: number;
  contribution_to_return: number;
  contribution_to_risk: number;
}

export interface RollingPerformanceAnalysis {
  rolling_periods: RollingPeriod[];
  rolling_correlations: RollingCorrelation[];
  rolling_betas: RollingBeta[];
  rolling_tracking_error: RollingTrackingError[];
  performance_consistency: PerformanceConsistency;
  regime_performance: RegimePerformanceAnalysis;
}

export interface RollingPeriod {
  end_date: Date;
  period_length: number; // days
  portfolio_return: number;
  benchmark_return: number;
  excess_return: number;
  tracking_error: number;
  information_ratio: number;
  sharpe_ratio: number;
  max_drawdown: number;
}

export interface RollingCorrelation {
  date: Date;
  correlation: number;
  correlation_stability: number;
}

export interface RollingBeta {
  date: Date;
  beta: number;
  beta_stability: number;
  up_beta: number;
  down_beta: number;
}

export interface RollingTrackingError {
  date: Date;
  tracking_error: number;
  tracking_error_trend: 'increasing' | 'decreasing' | 'stable';
}

export interface PerformanceConsistency {
  consistency_ratio: number;
  positive_periods: number;
  negative_periods: number;
  outperformance_frequency: number;
  average_outperformance: number;
  average_underperformance: number;
  longest_outperformance_streak: number;
  longest_underperformance_streak: number;
}

export interface RegimePerformanceAnalysis {
  bull_market_performance: RegimePerformance;
  bear_market_performance: RegimePerformance;
  sideways_market_performance: RegimePerformance;
  volatile_market_performance: RegimePerformance;
  regime_consistency: number;
}

export interface RegimePerformance {
  regime: string;
  portfolio_return: number;
  benchmark_return: number;
  excess_return: number;
  hit_rate: number;
  up_capture: number;
  down_capture: number;
  regime_beta: number;
}

export interface PeerComparisonAnalysis {
  peer_universe: PeerUniverse;
  percentile_rankings: PercentileRankings;
  peer_relative_performance: PeerRelativePerformance;
  style_peer_comparison: StylePeerComparison;
  risk_peer_comparison: RiskPeerComparison;
}

export interface PeerUniverse {
  universe_name: string;
  universe_size: number;
  universe_description: string;
  inclusion_criteria: string[];
  peer_characteristics: PeerCharacteristics;
}

export interface PeerCharacteristics {
  median_aum: number;
  median_return: number;
  median_volatility: number;
  median_sharpe_ratio: number;
  return_dispersion: number;
  risk_dispersion: number;
}

export interface PercentileRankings {
  return_ranking: PercentileRanking;
  risk_ranking: PercentileRanking;
  risk_adjusted_ranking: PercentileRanking;
  consistency_ranking: PercentileRanking;
  drawdown_ranking: PercentileRanking;
  composite_ranking: PercentileRanking;
}

export interface PercentileRanking {
  metric: string;
  percentile: number;
  quartile: number;
  decile: number;
  rank: number;
  total_funds: number;
  value: number;
  peer_median: number;
  peer_average: number;
}

export interface PeerRelativePerformance {
  outperformance_frequency: number;
  average_outperformance: number;
  outperformance_consistency: number;
  relative_volatility: number;
  correlation_with_peers: number;
  peer_tracking_error: number;
}

export interface StylePeerComparison {
  style_category: string;
  style_peers: number;
  style_ranking: number;
  style_percentile: number;
  style_consistency: number;
  style_drift: number;
}

export interface RiskPeerComparison {
  risk_category: string;
  risk_ranking: number;
  risk_percentile: number;
  relative_risk: number;
  risk_efficiency: number;
  tail_risk_ranking: number;
}

export interface StyleAnalysis {
  style_classification: StyleClassification;
  style_exposures: StyleExposure[];
  style_drift: StyleDrift;
  style_consistency: StyleConsistency;
  factor_loadings: FactorLoading[];
  style_timing: StyleTiming;
}

export interface StyleClassification {
  primary_style: string;
  secondary_style: string;
  style_confidence: number;
  style_purity: number;
  classification_stability: number;
}

export interface StyleExposure {
  style_factor: string;
  exposure: number;
  benchmark_exposure: number;
  active_exposure: number;
  exposure_significance: number;
  contribution_to_return: number;
}

export interface StyleDrift {
  drift_magnitude: number;
  drift_direction: string;
  drift_persistence: number;
  drift_significance: number;
  style_migration: StyleMigration[];
}

export interface StyleMigration {
  from_style: string;
  to_style: string;
  migration_date: Date;
  migration_speed: number;
  migration_completeness: number;
}

export interface StyleConsistency {
  consistency_score: number;
  style_volatility: number;
  factor_stability: FactorStability[];
  style_predictability: number;
}

export interface FactorStability {
  factor: string;
  stability_score: number;
  volatility: number;
  mean_reversion: number;
}

export interface FactorLoading {
  factor: string;
  loading: number;
  loading_significance: number;
  loading_stability: number;
  factor_contribution: number;
}

export interface StyleTiming {
  timing_ability: number;
  timing_frequency: number;
  successful_timing: number;
  timing_value_added: number;
  timing_consistency: number;
}

export interface TrackingAnalysis {
  tracking_error: number;
  tracking_error_components: TrackingErrorComponent[];
  tracking_error_attribution: TrackingErrorAttribution;
  tracking_efficiency: TrackingEfficiency;
  tracking_stability: TrackingStability;
}

export interface TrackingErrorComponent {
  component: string;
  contribution: number;
  percentage: number;
  stability: number;
}

export interface TrackingErrorAttribution {
  asset_allocation: number;
  security_selection: number;
  sector_allocation: number;
  currency_allocation: number;
  interaction_effects: number;
  residual: number;
}

export interface TrackingEfficiency {
  information_ratio: number;
  tracking_error_efficiency: number;
  return_per_unit_tracking_error: number;
  tracking_error_utilization: number;
}

export interface TrackingStability {
  tracking_error_volatility: number;
  tracking_error_predictability: number;
  regime_stability: number;
  time_stability: number;
}

export interface ActiveShareAnalysis {
  active_share: number;
  active_share_components: ActiveShareComponent[];
  active_share_efficiency: ActiveShareEfficiency;
  active_share_evolution: ActiveShareEvolution[];
  concentration_analysis: ConcentrationAnalysis;
}

export interface ActiveShareComponent {
  component: string;
  active_share_contribution: number;
  return_contribution: number;
  risk_contribution: number;
}

export interface ActiveShareEfficiency {
  return_per_unit_active_share: number;
  risk_per_unit_active_share: number;
  efficiency_ratio: number;
  efficiency_ranking: number;
}

export interface ActiveShareEvolution {
  date: Date;
  active_share: number;
  active_share_trend: 'increasing' | 'decreasing' | 'stable';
  efficiency: number;
}

export interface ConcentrationAnalysis {
  portfolio_concentration: number;
  benchmark_concentration: number;
  relative_concentration: number;
  top_holdings_concentration: TopHoldingsConcentration[];
  sector_concentration: SectorConcentration[];
}

export interface TopHoldingsConcentration {
  top_n: number;
  portfolio_weight: number;
  benchmark_weight: number;
  active_weight: number;
}

export interface SectorConcentration {
  sector: string;
  portfolio_concentration: number;
  benchmark_concentration: number;
  relative_concentration: number;
}

export interface PerformancePersistence {
  persistence_metrics: PersistenceMetric[];
  performance_predictability: PerformancePredictability;
  hot_hand_analysis: HotHandAnalysis;
  regime_persistence: RegimePersistence[];
}

export interface PersistenceMetric {
  metric: string;
  persistence_coefficient: number;
  significance: number;
  predictive_power: number;
  time_decay: number;
}

export interface PerformancePredictability {
  r_squared: number;
  forecast_accuracy: number;
  forecast_bias: number;
  forecast_consistency: number;
  predictability_factors: PredictabilityFactor[];
}

export interface PredictabilityFactor {
  factor: string;
  predictive_power: number;
  significance: number;
  stability: number;
}

export interface HotHandAnalysis {
  hot_hand_probability: number;
  cold_hand_probability: number;
  streak_persistence: StreakPersistence;
  momentum_effects: MomentumEffect[];
}

export interface StreakPersistence {
  average_winning_streak: number;
  average_losing_streak: number;
  longest_winning_streak: number;
  longest_losing_streak: number;
  streak_predictability: number;
}

export interface MomentumEffect {
  timeframe: string;
  momentum_coefficient: number;
  significance: number;
  decay_rate: number;
}

export interface RegimePersistence {
  regime: string;
  performance_persistence: number;
  risk_persistence: number;
  alpha_persistence: number;
  factor_persistence: number;
}

export interface PerformanceRankings {
  absolute_rankings: AbsoluteRanking[];
  relative_rankings: RelativeRanking[];
  risk_adjusted_rankings: RiskAdjustedRanking[];
  consistency_rankings: ConsistencyRanking[];
  composite_ranking: CompositeRanking;
}

export interface AbsoluteRanking {
  period: string;
  rank: number;
  percentile: number;
  quartile: number;
  return: number;
  universe_size: number;
}

export interface RelativeRanking {
  benchmark: string;
  rank: number;
  percentile: number;
  excess_return: number;
  information_ratio: number;
  hit_rate: number;
}

export interface RiskAdjustedRanking {
  metric: string;
  rank: number;
  percentile: number;
  value: number;
  peer_median: number;
  peer_average: number;
}

export interface ConsistencyRanking {
  consistency_metric: string;
  rank: number;
  percentile: number;
  consistency_score: number;
  volatility_of_returns: number;
}

export interface CompositeRanking {
  overall_score: number;
  overall_rank: number;
  overall_percentile: number;
  component_scores: ComponentScore[];
  ranking_methodology: string;
}

export interface ComponentScore {
  component: string;
  score: number;
  weight: number;
  contribution: number;
  rank: number;
}

export interface OutlierAnalysis {
  outlier_detection: OutlierDetection;
  outlier_attribution: OutlierAttribution[];
  outlier_persistence: OutlierPersistence;
  outlier_impact: OutlierImpact;
}

export interface OutlierDetection {
  outlier_periods: OutlierPeriod[];
  outlier_frequency: number;
  outlier_magnitude: number;
  outlier_clustering: number;
}

export interface OutlierPeriod {
  date: Date;
  return: number;
  benchmark_return: number;
  excess_return: number;
  z_score: number;
  outlier_type: 'positive' | 'negative';
  outlier_magnitude: 'mild' | 'moderate' | 'extreme';
}

export interface OutlierAttribution {
  outlier_date: Date;
  attribution_factors: AttributionFactor[];
  primary_driver: string;
  systematic_vs_idiosyncratic: number;
}

export interface AttributionFactor {
  factor: string;
  contribution: number;
  significance: number;
  factor_type: 'systematic' | 'idiosyncratic' | 'market';
}

export interface OutlierPersistence {
  persistence_probability: number;
  mean_reversion_speed: number;
  clustering_tendency: number;
  regime_dependence: number;
}

export interface OutlierImpact {
  portfolio_impact: number;
  risk_impact: number;
  ranking_impact: number;
  benchmark_impact: number;
}

export interface BenchmarkingConfig {
  benchmarks: BenchmarkConfig[];
  peer_universes: PeerUniverseConfig[];
  analysis_periods: string[];
  rolling_window_sizes: number[];
  risk_free_rate: number;
  confidence_levels: number[];
  outlier_thresholds: OutlierThreshold[];
}

export interface BenchmarkConfig {
  name: string;
  type: 'market_index' | 'sector_index' | 'peer_group' | 'custom';
  description: string;
  data_source: string;
  weight: number;
  primary: boolean;
}

export interface PeerUniverseConfig {
  name: string;
  description: string;
  inclusion_criteria: string[];
  exclusion_criteria: string[];
  minimum_track_record: number;
  minimum_aum: number;
}

export interface OutlierThreshold {
  method: 'standard_deviation' | 'iqr' | 'mad';
  threshold: number;
  confidence_level: number;
}

export class PerformanceBenchmarkingEngine {
  private benchmarkCache: Map<string, any> = new Map();
  // private _performanceHistory: Map<string, any[]> = new Map(); // Unused, kept for future extension
  private config: BenchmarkingConfig = {
    benchmarks: [
      {
        name: 'SOL Index',
        type: 'market_index',
        description: 'Solana ecosystem benchmark',
        data_source: 'chainlink',
        weight: 0.4,
        primary: true
      },
      {
        name: 'DeFi Index',
        type: 'sector_index',
        description: 'DeFi sector benchmark',
        data_source: 'pyth',
        weight: 0.3,
        primary: false
      },
      {
        name: 'DLMM Peer Group',
        type: 'peer_group',
        description: 'Similar DLMM strategies',
        data_source: 'custom',
        weight: 0.3,
        primary: false
      }
    ],
    peer_universes: [
      {
        name: 'DLMM Strategies',
        description: 'All DLMM-based strategies',
        inclusion_criteria: ['dlmm_strategy', 'minimum_liquidity'],
        exclusion_criteria: ['synthetic_strategies'],
        minimum_track_record: 90,
        minimum_aum: 1000000
      }
    ],
    analysis_periods: ['1M', '3M', '6M', '1Y', '2Y', 'ITD'],
    rolling_window_sizes: [30, 60, 90, 180, 365],
    risk_free_rate: 0.02,
    confidence_levels: [0.90, 0.95, 0.99],
    outlier_thresholds: [
      { method: 'standard_deviation', threshold: 2.5, confidence_level: 0.95 },
      { method: 'iqr', threshold: 1.5, confidence_level: 0.90 }
    ]
  };

  constructor(config?: Partial<BenchmarkingConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.initializeBenchmarkingEngine();
  }

  private initializeBenchmarkingEngine(): void {
    console.log('Performance Benchmarking Engine initialized');
  }

  /**
   * Perform comprehensive performance benchmarking analysis
   */
  public async performBenchmarkingAnalysis(
    positions: DLMMPosition[],
    portfolioReturns: number[],
    portfolioValue: number
  ): Promise<PerformanceBenchmarkAnalysis> {
    try {
      // Calculate portfolio performance metrics
      const portfolio_performance = this.calculatePortfolioPerformance(
        portfolioReturns,
        portfolioValue
      );

      // Compare against all configured benchmarks
      const benchmark_comparisons = await this.performBenchmarkComparisons(
        portfolioReturns,
        portfolio_performance
      );

      // Calculate risk-adjusted comparisons
      const risk_adjusted_metrics = await this.calculateRiskAdjustedComparisons(
        portfolioReturns,
        benchmark_comparisons
      );

      // Perform attribution analysis vs benchmarks
      const attribution_analysis = await this.performAttributionAnalysis(
        positions,
        portfolioReturns,
        benchmark_comparisons
      );

      // Calculate rolling performance analysis
      const rolling_performance = this.calculateRollingPerformance(
        portfolioReturns,
        benchmark_comparisons
      );

      // Perform peer comparison analysis
      const peer_comparison = await this.performPeerComparison(
        portfolio_performance,
        portfolioReturns
      );

      // Perform style analysis
      const style_analysis = await this.performStyleAnalysis(
        positions,
        portfolioReturns,
        benchmark_comparisons
      );

      // Calculate tracking analysis
      const tracking_analysis = this.calculateTrackingAnalysis(
        portfolioReturns,
        benchmark_comparisons
      );

      // Calculate active share analysis
      const active_share_analysis = this.calculateActiveShareAnalysis(
        positions,
        benchmark_comparisons
      );

      // Analyze performance persistence
      const performance_persistence = this.analyzePerformancePersistence(
        portfolioReturns,
        benchmark_comparisons
      );

      // Calculate performance rankings
      const rankings = await this.calculatePerformanceRankings(
        portfolio_performance,
        peer_comparison
      );

      // Perform outlier analysis
      const outlier_analysis = this.performOutlierAnalysis(
        portfolioReturns,
        benchmark_comparisons
      );

      return {
        portfolio_performance,
        benchmark_comparisons,
        risk_adjusted_metrics,
        attribution_analysis,
        rolling_performance,
        peer_comparison,
        style_analysis,
        tracking_analysis,
        active_share_analysis,
        performance_persistence,
        rankings,
        outlier_analysis
      };

    } catch (error) {
      console.error('Error performing benchmarking analysis:', error);
      return this.getEmptyBenchmarkingAnalysis();
    }
  }

  /**
   * Calculate comprehensive portfolio performance metrics
   */
  private calculatePortfolioPerformance(
    returns: number[],
    _portfolioValue: number
  ): PortfolioPerformance {
    const totalReturn = this.calculateTotalReturn(returns);
    const annualizedReturn = this.calculateAnnualizedReturn(returns);
    const volatility = this.calculateVolatility(returns);
    const maxDrawdown = this.calculateMaxDrawdown(returns);
    const sharpeRatio = this.calculateSharpeRatio(returns, this.config.risk_free_rate);
    const sortinoRatio = this.calculateSortinoRatio(returns, this.config.risk_free_rate);
    const calmarRatio = maxDrawdown !== 0 ? annualizedReturn / Math.abs(maxDrawdown) : 0;

    const positiveReturns = returns.filter(r => r > 0);
    const negativeReturns = returns.filter(r => r < 0);

    const upsideCapture = this.calculateUpsideCapture(returns);
    const downsideCapture = this.calculateDownsideCapture(returns);
    const winRate = positiveReturns.length / returns.length * 100;

    const avgWin = positiveReturns.length > 0
      ? positiveReturns.reduce((sum, r) => sum + r, 0) / positiveReturns.length
      : 0;
    const avgLoss = negativeReturns.length > 0
      ? Math.abs(negativeReturns.reduce((sum, r) => sum + r, 0) / negativeReturns.length)
      : 1;

    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
    const var95 = this.calculateVaR(returns, 0.95);
    const cvar95 = this.calculateCVaR(returns, 0.95);
    const skewness = this.calculateSkewness(returns);
    const kurtosis = this.calculateKurtosis(returns);

    const performancePeriods = this.calculatePerformancePeriods(returns);

    return {
      total_return: totalReturn,
      annualized_return: annualizedReturn,
      volatility: volatility,
      max_drawdown: maxDrawdown,
      sharpe_ratio: sharpeRatio,
      sortino_ratio: sortinoRatio,
      calmar_ratio: calmarRatio,
      upside_capture: upsideCapture,
      downside_capture: downsideCapture,
      win_rate: winRate,
      profit_factor: profitFactor,
      var_95: var95,
      cvar_95: cvar95,
      skewness: skewness,
      kurtosis: kurtosis,
      performance_periods: performancePeriods
    };
  }

  /**
   * Perform comparisons against all benchmarks
   */
  private async performBenchmarkComparisons(
    portfolioReturns: number[],
    portfolioPerformance: PortfolioPerformance
  ): Promise<BenchmarkComparison[]> {
    const comparisons: BenchmarkComparison[] = [];

    for (const benchmarkConfig of this.config.benchmarks) {
      const benchmarkReturns = await this.getBenchmarkReturns(benchmarkConfig.name);

      if (benchmarkReturns.length === 0) {
        continue;
      }

      const benchmarkReturn = this.calculateTotalReturn(benchmarkReturns);
      const benchmarkVolatility = this.calculateVolatility(benchmarkReturns);
      const benchmarkSharpe = this.calculateSharpeRatio(benchmarkReturns, this.config.risk_free_rate);

      const excessReturn = portfolioPerformance.total_return - benchmarkReturn;
      const excessVolatility = portfolioPerformance.volatility - benchmarkVolatility;

      const trackingError = this.calculateTrackingError(portfolioReturns, benchmarkReturns);
      const informationRatio = trackingError > 0 ? excessReturn / trackingError : 0;

      const correlation = this.calculateCorrelation(portfolioReturns, benchmarkReturns);
      const beta = this.calculateBeta(portfolioReturns, benchmarkReturns);
      const alpha = this.calculateAlpha(portfolioReturns, benchmarkReturns, this.config.risk_free_rate);
      const rSquared = correlation * correlation;
      const treynorRatio = beta !== 0
        ? (portfolioPerformance.annualized_return - this.config.risk_free_rate) / beta
        : 0;

      const upCaptureRatio = this.calculateCaptureRatio(portfolioReturns, benchmarkReturns, 'up');
      const downCaptureRatio = this.calculateCaptureRatio(portfolioReturns, benchmarkReturns, 'down');

      const hitRate = this.calculateHitRate(portfolioReturns, benchmarkReturns);
      const outperformanceConsistency = this.calculateOutperformanceConsistency(
        portfolioReturns,
        benchmarkReturns
      );

      const relativePerformancePeriods = this.calculateRelativePerformancePeriods(
        portfolioReturns,
        benchmarkReturns
      );

      comparisons.push({
        benchmark_name: benchmarkConfig.name,
        benchmark_type: benchmarkConfig.type,
        benchmark_return: benchmarkReturn,
        benchmark_volatility: benchmarkVolatility,
        benchmark_sharpe: benchmarkSharpe,
        excess_return: excessReturn,
        excess_volatility: excessVolatility,
        information_ratio: informationRatio,
        tracking_error: trackingError,
        correlation: correlation,
        beta: beta,
        alpha: alpha,
        r_squared: rSquared,
        treynor_ratio: treynorRatio,
        up_capture_ratio: upCaptureRatio,
        down_capture_ratio: downCaptureRatio,
        hit_rate: hitRate,
        outperformance_consistency: outperformanceConsistency,
        relative_performance_periods: relativePerformancePeriods
      });
    }

    return comparisons;
  }

  /**
   * Statistical calculation helper methods
   */
  private calculateTotalReturn(returns: number[]): number {
    return returns.reduce((cumulative, ret) => cumulative * (1 + ret / 100), 1) - 1;
  }

  private calculateAnnualizedReturn(returns: number[]): number {
    const totalReturn = this.calculateTotalReturn(returns);
    const years = returns.length / 252; // Assuming daily returns
    return Math.pow(1 + totalReturn, 1 / years) - 1;
  }

  private calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    return Math.sqrt(variance * 252); // Annualized
  }

  private calculateMaxDrawdown(returns: number[]): number {
    let maxDrawdown = 0;
    let peak = 1;
    let cumulative = 1;

    for (const ret of returns) {
      cumulative *= (1 + ret / 100);
      peak = Math.max(peak, cumulative);
      const drawdown = (peak - cumulative) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }

  private calculateSharpeRatio(returns: number[], riskFreeRate: number): number {
    const excessReturns = returns.map(r => r - riskFreeRate / 252);
    const meanExcess = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
    const volatility = this.calculateVolatility(excessReturns);
    return volatility > 0 ? (meanExcess * 252) / volatility : 0;
  }

  private calculateSortinoRatio(returns: number[], riskFreeRate: number): number {
    const excessReturns = returns.map(r => r - riskFreeRate / 252);
    const meanExcess = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
    const downwardDeviations = excessReturns.filter(r => r < 0);

    if (downwardDeviations.length === 0) return 0;

    const downwardVariance = downwardDeviations.reduce((sum, r) => sum + r * r, 0) / downwardDeviations.length;
    const downwardVolatility = Math.sqrt(downwardVariance * 252);

    return downwardVolatility > 0 ? (meanExcess * 252) / downwardVolatility : 0;
  }

  private calculateUpsideCapture(returns: number[]): number {
    // Simplified - would compare against benchmark
    const positiveReturns = returns.filter(r => r > 0);
    const avgPositive = positiveReturns.length > 0
      ? positiveReturns.reduce((sum, r) => sum + r, 0) / positiveReturns.length
      : 0;
    return avgPositive * 100;
  }

  private calculateDownsideCapture(returns: number[]): number {
    // Simplified - would compare against benchmark
    const negativeReturns = returns.filter(r => r < 0);
    const avgNegative = negativeReturns.length > 0
      ? negativeReturns.reduce((sum, r) => sum + r, 0) / negativeReturns.length
      : 0;
    return Math.abs(avgNegative) * 100;
  }

  private calculateVaR(returns: number[], confidence: number): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    return sortedReturns[index] || 0;
  }

  private calculateCVaR(returns: number[], confidence: number): number {
    const var95 = this.calculateVaR(returns, confidence);
    const tailReturns = returns.filter(r => r <= var95);
    return tailReturns.length > 0
      ? tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length
      : var95;
  }

  private calculateSkewness(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const skewness = returns.reduce((sum, r) => sum + Math.pow(r - mean, 3), 0) / returns.length;
    return skewness / Math.pow(variance, 1.5);
  }

  private calculateKurtosis(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const kurtosis = returns.reduce((sum, r) => sum + Math.pow(r - mean, 4), 0) / returns.length;
    return kurtosis / Math.pow(variance, 2) - 3; // Excess kurtosis
  }

  private calculatePerformancePeriods(returns: number[]): PerformancePeriod[] {
    const periods = ['1M', '3M', '6M', '1Y'];
    const periodsData: PerformancePeriod[] = [];

    const periodLengths: Record<string, number> = {
      '1M': 21,
      '3M': 63,
      '6M': 126,
      '1Y': 252
    };

    for (const period of periods) {
      const length = periodLengths[period];
      if (returns.length >= length) {
        const periodReturns = returns.slice(-length);
        const periodReturn = this.calculateTotalReturn(periodReturns);
        const periodVolatility = this.calculateVolatility(periodReturns);
        const periodSharpe = this.calculateSharpeRatio(periodReturns, this.config.risk_free_rate);
        const periodDrawdown = this.calculateMaxDrawdown(periodReturns);

        periodsData.push({
          period,
          return: periodReturn,
          volatility: periodVolatility,
          sharpe_ratio: periodSharpe,
          max_drawdown: periodDrawdown
        });
      }
    }

    return periodsData;
  }

  private calculateTrackingError(portfolioReturns: number[], benchmarkReturns: number[]): number {
    const minLength = Math.min(portfolioReturns.length, benchmarkReturns.length);
    const excessReturns = portfolioReturns.slice(-minLength)
      .map((ret, i) => ret - benchmarkReturns.slice(-minLength)[i]);

    return this.calculateVolatility(excessReturns);
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const minLength = Math.min(x.length, y.length);
    const xData = x.slice(-minLength);
    const yData = y.slice(-minLength);

    const meanX = xData.reduce((sum, val) => sum + val, 0) / xData.length;
    const meanY = yData.reduce((sum, val) => sum + val, 0) / yData.length;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < xData.length; i++) {
      const diffX = xData[i] - meanX;
      const diffY = yData[i] - meanY;
      numerator += diffX * diffY;
      denomX += diffX * diffX;
      denomY += diffY * diffY;
    }

    const denominator = Math.sqrt(denomX * denomY);
    return denominator > 0 ? numerator / denominator : 0;
  }

  private calculateBeta(portfolioReturns: number[], benchmarkReturns: number[]): number {
    const minLength = Math.min(portfolioReturns.length, benchmarkReturns.length);
    const portReturns = portfolioReturns.slice(-minLength);
    const benchReturns = benchmarkReturns.slice(-minLength);

    const meanPort = portReturns.reduce((sum, r) => sum + r, 0) / portReturns.length;
    const meanBench = benchReturns.reduce((sum, r) => sum + r, 0) / benchReturns.length;

    let covariance = 0;
    let benchVariance = 0;

    for (let i = 0; i < portReturns.length; i++) {
      const portDiff = portReturns[i] - meanPort;
      const benchDiff = benchReturns[i] - meanBench;
      covariance += portDiff * benchDiff;
      benchVariance += benchDiff * benchDiff;
    }

    return benchVariance > 0 ? covariance / benchVariance : 1;
  }

  private calculateAlpha(
    portfolioReturns: number[],
    benchmarkReturns: number[],
    riskFreeRate: number
  ): number {
    const beta = this.calculateBeta(portfolioReturns, benchmarkReturns);
    const portfolioReturn = this.calculateAnnualizedReturn(portfolioReturns);
    const benchmarkReturn = this.calculateAnnualizedReturn(benchmarkReturns);

    return portfolioReturn - (riskFreeRate + beta * (benchmarkReturn - riskFreeRate));
  }

  private calculateCaptureRatio(
    portfolioReturns: number[],
    benchmarkReturns: number[],
    direction: 'up' | 'down'
  ): number {
    const minLength = Math.min(portfolioReturns.length, benchmarkReturns.length);
    const portReturns = portfolioReturns.slice(-minLength);
    const benchReturns = benchmarkReturns.slice(-minLength);

    const filteredPairs = portReturns
      .map((ret, i) => ({ port: ret, bench: benchReturns[i] }))
      .filter(pair => direction === 'up' ? pair.bench > 0 : pair.bench < 0);

    if (filteredPairs.length === 0) return 1;

    const portSum = filteredPairs.reduce((sum, pair) => sum + pair.port, 0);
    const benchSum = filteredPairs.reduce((sum, pair) => sum + pair.bench, 0);

    return benchSum !== 0 ? portSum / benchSum : 1;
  }

  private calculateHitRate(portfolioReturns: number[], benchmarkReturns: number[]): number {
    const minLength = Math.min(portfolioReturns.length, benchmarkReturns.length);
    const outperformance = portfolioReturns.slice(-minLength)
      .map((ret, i) => ret > benchmarkReturns.slice(-minLength)[i]);

    return outperformance.filter(Boolean).length / outperformance.length * 100;
  }

  private calculateOutperformanceConsistency(
    portfolioReturns: number[],
    benchmarkReturns: number[]
  ): number {
    // Rolling 12-period outperformance consistency
    const windowSize = 12;
    const consistencyScores = [];

    for (let i = windowSize - 1; i < Math.min(portfolioReturns.length, benchmarkReturns.length); i++) {
      const window = portfolioReturns.slice(i - windowSize + 1, i + 1);
      const benchWindow = benchmarkReturns.slice(i - windowSize + 1, i + 1);
      const hitRate = this.calculateHitRate(window, benchWindow);
      consistencyScores.push(hitRate);
    }

    return consistencyScores.length > 0
      ? consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length
      : 0;
  }

  private calculateRelativePerformancePeriods(
    _portfolioReturns: number[],
    _benchmarkReturns: number[]
  ): RelativePerformancePeriod[] {
    // Simplified implementation
    return this.config.analysis_periods.map(period => ({
      period,
      portfolio_return: Math.random() * 20 - 10, // Mock data
      benchmark_return: Math.random() * 15 - 7.5,
      excess_return: Math.random() * 10 - 5,
      outperformed: Math.random() > 0.5,
      percentile_rank: Math.random() * 100
    }));
  }

  // Additional helper methods would be implemented here for the remaining functionality
  private async getBenchmarkReturns(_benchmarkName: string): Promise<number[]> {
    // Mock benchmark returns - in real implementation, fetch from data source
    return Array.from({ length: 252 }, () => (Math.random() - 0.5) * 4);
  }

  private async calculateRiskAdjustedComparisons(
    portfolioReturns: number[],
    _benchmarkComparisons: BenchmarkComparison[]
  ): Promise<RiskAdjustedComparison> {
    // Mock implementation
    return {
      portfolio_metrics: {
        volatility: this.calculateVolatility(portfolioReturns),
        downside_deviation: 0.15,
        maximum_drawdown: this.calculateMaxDrawdown(portfolioReturns),
        var_95: this.calculateVaR(portfolioReturns, 0.95),
        cvar_95: this.calculateCVaR(portfolioReturns, 0.95),
        semi_variance: 0.02,
        tail_ratio: 1.2,
        gain_pain_ratio: 1.5,
        sterling_ratio: 0.8,
        burke_ratio: 0.7
      },
      benchmark_metrics: new Map(),
      relative_metrics: {
        relative_volatility: 0.05,
        relative_downside_deviation: 0.03,
        relative_max_drawdown: -0.02,
        relative_var: 0.01,
        tracking_error: 0.08,
        active_risk: 0.06,
        residual_risk: 0.04
      },
      risk_efficiency: {
        risk_adjusted_excess_return: 3.5,
        return_per_unit_risk: 0.45,
        excess_return_per_unit_tracking_error: 0.75,
        risk_efficiency_ratio: 1.2,
        risk_return_ranking: 15
      },
      risk_decomposition: {
        systematic_risk: 0.6,
        specific_risk: 0.3,
        style_risk: 0.2,
        selection_risk: 0.15,
        interaction_risk: 0.05,
        currency_risk: 0.02
      }
    };
  }

  // Mock implementations for remaining methods to complete the interface
  private async performAttributionAnalysis(
    _positions: DLMMPosition[],
    _portfolioReturns: number[],
    _benchmarkComparisons: BenchmarkComparison[]
  ): Promise<AttributionVsBenchmark> {
    return {
      total_excess_return: 2.5,
      allocation_effect: 1.2,
      selection_effect: 1.8,
      interaction_effect: -0.3,
      currency_effect: -0.2,
      sector_attribution: [],
      security_attribution: [],
      factor_attribution: []
    };
  }

  private calculateRollingPerformance(
    _portfolioReturns: number[],
    _benchmarkComparisons: BenchmarkComparison[]
  ): RollingPerformanceAnalysis {
    return {
      rolling_periods: [],
      rolling_correlations: [],
      rolling_betas: [],
      rolling_tracking_error: [],
      performance_consistency: {
        consistency_ratio: 0.75,
        positive_periods: 180,
        negative_periods: 72,
        outperformance_frequency: 65,
        average_outperformance: 1.8,
        average_underperformance: -1.2,
        longest_outperformance_streak: 12,
        longest_underperformance_streak: 6
      },
      regime_performance: {
        bull_market_performance: {
          regime: 'bull',
          portfolio_return: 25.5,
          benchmark_return: 20.2,
          excess_return: 5.3,
          hit_rate: 72,
          up_capture: 115,
          down_capture: 85,
          regime_beta: 1.1
        },
        bear_market_performance: {
          regime: 'bear',
          portfolio_return: -12.5,
          benchmark_return: -18.2,
          excess_return: 5.7,
          hit_rate: 68,
          up_capture: 105,
          down_capture: 70,
          regime_beta: 0.8
        },
        sideways_market_performance: {
          regime: 'sideways',
          portfolio_return: 3.2,
          benchmark_return: 1.8,
          excess_return: 1.4,
          hit_rate: 58,
          up_capture: 90,
          down_capture: 95,
          regime_beta: 0.9
        },
        volatile_market_performance: {
          regime: 'volatile',
          portfolio_return: 8.5,
          benchmark_return: 6.2,
          excess_return: 2.3,
          hit_rate: 62,
          up_capture: 120,
          down_capture: 110,
          regime_beta: 1.3
        },
        regime_consistency: 0.68
      }
    };
  }

  private async performPeerComparison(
    portfolioPerformance: PortfolioPerformance,
    _portfolioReturns: number[]
  ): Promise<PeerComparisonAnalysis> {
    return {
      peer_universe: {
        universe_name: 'DLMM Strategies',
        universe_size: 150,
        universe_description: 'All active DLMM-based liquidity strategies',
        inclusion_criteria: ['minimum_3m_track_record', 'dlmm_focused', 'active_management'],
        peer_characteristics: {
          median_aum: 5000000,
          median_return: 12.5,
          median_volatility: 0.18,
          median_sharpe_ratio: 0.65,
          return_dispersion: 0.25,
          risk_dispersion: 0.08
        }
      },
      percentile_rankings: {
        return_ranking: {
          metric: 'Total Return',
          percentile: 78,
          quartile: 1,
          decile: 2,
          rank: 33,
          total_funds: 150,
          value: portfolioPerformance.total_return,
          peer_median: 0.125,
          peer_average: 0.134
        },
        risk_ranking: {
          metric: 'Volatility',
          percentile: 45,
          quartile: 2,
          decile: 5,
          rank: 82,
          total_funds: 150,
          value: portfolioPerformance.volatility,
          peer_median: 0.18,
          peer_average: 0.19
        },
        risk_adjusted_ranking: {
          metric: 'Sharpe Ratio',
          percentile: 85,
          quartile: 1,
          decile: 1,
          rank: 22,
          total_funds: 150,
          value: portfolioPerformance.sharpe_ratio,
          peer_median: 0.65,
          peer_average: 0.58
        },
        consistency_ranking: {
          metric: 'Consistency',
          percentile: 72,
          quartile: 1,
          decile: 3,
          rank: 42,
          total_funds: 150,
          value: 0.68,
          peer_median: 0.55,
          peer_average: 0.52
        },
        drawdown_ranking: {
          metric: 'Max Drawdown',
          percentile: 65,
          quartile: 2,
          decile: 3,
          rank: 52,
          total_funds: 150,
          value: portfolioPerformance.max_drawdown,
          peer_median: 0.12,
          peer_average: 0.15
        },
        composite_ranking: {
          metric: 'Composite Score',
          percentile: 80,
          quartile: 1,
          decile: 2,
          rank: 30,
          total_funds: 150,
          value: 0.78,
          peer_median: 0.50,
          peer_average: 0.48
        }
      },
      peer_relative_performance: {
        outperformance_frequency: 68,
        average_outperformance: 2.3,
        outperformance_consistency: 0.72,
        relative_volatility: -0.02,
        correlation_with_peers: 0.65,
        peer_tracking_error: 0.08
      },
      style_peer_comparison: {
        style_category: 'Concentrated DLMM',
        style_peers: 45,
        style_ranking: 12,
        style_percentile: 75,
        style_consistency: 0.82,
        style_drift: 0.15
      },
      risk_peer_comparison: {
        risk_category: 'Moderate Risk',
        risk_ranking: 25,
        risk_percentile: 55,
        relative_risk: -0.05,
        risk_efficiency: 1.25,
        tail_risk_ranking: 18
      }
    };
  }

  // Continue with remaining mock implementations...
  private async performStyleAnalysis(
    _positions: DLMMPosition[],
    _portfolioReturns: number[],
    _benchmarkComparisons: BenchmarkComparison[]
  ): Promise<StyleAnalysis> {
    return {
      style_classification: {
        primary_style: 'Concentrated DLMM',
        secondary_style: 'Dynamic Range',
        style_confidence: 0.85,
        style_purity: 0.78,
        classification_stability: 0.82
      },
      style_exposures: [],
      style_drift: {
        drift_magnitude: 0.15,
        drift_direction: 'more_concentrated',
        drift_persistence: 0.65,
        drift_significance: 0.025,
        style_migration: []
      },
      style_consistency: {
        consistency_score: 0.78,
        style_volatility: 0.12,
        factor_stability: [],
        style_predictability: 0.68
      },
      factor_loadings: [],
      style_timing: {
        timing_ability: 0.35,
        timing_frequency: 8,
        successful_timing: 0.62,
        timing_value_added: 1.2,
        timing_consistency: 0.45
      }
    };
  }

  private calculateTrackingAnalysis(
    _portfolioReturns: number[],
    benchmarkComparisons: BenchmarkComparison[]
  ): TrackingAnalysis {
    const primaryBenchmark = benchmarkComparisons.find(b => b.benchmark_type === 'market_index');
    const trackingError = primaryBenchmark?.tracking_error || 0;

    return {
      tracking_error: trackingError,
      tracking_error_components: [
        { component: 'Asset Allocation', contribution: 0.04, percentage: 50, stability: 0.8 },
        { component: 'Security Selection', contribution: 0.03, percentage: 37.5, stability: 0.6 },
        { component: 'Interaction Effects', contribution: 0.01, percentage: 12.5, stability: 0.4 }
      ],
      tracking_error_attribution: {
        asset_allocation: 0.04,
        security_selection: 0.03,
        sector_allocation: 0.02,
        currency_allocation: 0.005,
        interaction_effects: 0.01,
        residual: 0.005
      },
      tracking_efficiency: {
        information_ratio: primaryBenchmark?.information_ratio || 0,
        tracking_error_efficiency: 0.75,
        return_per_unit_tracking_error: 0.85,
        tracking_error_utilization: 0.68
      },
      tracking_stability: {
        tracking_error_volatility: 0.02,
        tracking_error_predictability: 0.65,
        regime_stability: 0.72,
        time_stability: 0.78
      }
    };
  }

  private calculateActiveShareAnalysis(
    _positions: DLMMPosition[],
    _benchmarkComparisons: BenchmarkComparison[]
  ): ActiveShareAnalysis {
    return {
      active_share: 0.65,
      active_share_components: [
        { component: 'Overweight Positions', active_share_contribution: 0.35, return_contribution: 2.1, risk_contribution: 0.08 },
        { component: 'Underweight Positions', active_share_contribution: 0.20, return_contribution: 0.8, risk_contribution: 0.04 },
        { component: 'Non-benchmark Holdings', active_share_contribution: 0.10, return_contribution: 1.2, risk_contribution: 0.06 }
      ],
      active_share_efficiency: {
        return_per_unit_active_share: 6.2,
        risk_per_unit_active_share: 0.28,
        efficiency_ratio: 2.2,
        efficiency_ranking: 25
      },
      active_share_evolution: [],
      concentration_analysis: {
        portfolio_concentration: 0.25,
        benchmark_concentration: 0.15,
        relative_concentration: 0.10,
        top_holdings_concentration: [
          { top_n: 5, portfolio_weight: 35, benchmark_weight: 25, active_weight: 10 },
          { top_n: 10, portfolio_weight: 55, benchmark_weight: 45, active_weight: 10 }
        ],
        sector_concentration: []
      }
    };
  }

  private analyzePerformancePersistence(
    _portfolioReturns: number[],
    _benchmarkComparisons: BenchmarkComparison[]
  ): PerformancePersistence {
    return {
      persistence_metrics: [
        { metric: 'Return Persistence', persistence_coefficient: 0.35, significance: 0.02, predictive_power: 0.25, time_decay: 0.15 },
        { metric: 'Alpha Persistence', persistence_coefficient: 0.28, significance: 0.04, predictive_power: 0.18, time_decay: 0.22 }
      ],
      performance_predictability: {
        r_squared: 0.15,
        forecast_accuracy: 0.62,
        forecast_bias: -0.05,
        forecast_consistency: 0.58,
        predictability_factors: []
      },
      hot_hand_analysis: {
        hot_hand_probability: 0.68,
        cold_hand_probability: 0.32,
        streak_persistence: {
          average_winning_streak: 4.2,
          average_losing_streak: 2.8,
          longest_winning_streak: 12,
          longest_losing_streak: 7,
          streak_predictability: 0.35
        },
        momentum_effects: []
      },
      regime_persistence: []
    };
  }

  private async calculatePerformanceRankings(
    portfolioPerformance: PortfolioPerformance,
    _peerComparison: PeerComparisonAnalysis
  ): Promise<PerformanceRankings> {
    return {
      absolute_rankings: this.config.analysis_periods.map(period => ({
        period,
        rank: Math.floor(Math.random() * 150) + 1,
        percentile: Math.random() * 100,
        quartile: Math.floor(Math.random() * 4) + 1,
        return: Math.random() * 30 - 10,
        universe_size: 150
      })),
      relative_rankings: [
        {
          benchmark: 'SOL Index',
          rank: 25,
          percentile: 83,
          excess_return: 2.5,
          information_ratio: 0.85,
          hit_rate: 68
        }
      ],
      risk_adjusted_rankings: [
        {
          metric: 'Sharpe Ratio',
          rank: 22,
          percentile: 85,
          value: portfolioPerformance.sharpe_ratio,
          peer_median: 0.65,
          peer_average: 0.58
        }
      ],
      consistency_rankings: [
        {
          consistency_metric: 'Outperformance Consistency',
          rank: 35,
          percentile: 77,
          consistency_score: 0.72,
          volatility_of_returns: 0.18
        }
      ],
      composite_ranking: {
        overall_score: 0.78,
        overall_rank: 30,
        overall_percentile: 80,
        component_scores: [
          { component: 'Returns', score: 0.85, weight: 0.4, contribution: 0.34, rank: 25 },
          { component: 'Risk Management', score: 0.72, weight: 0.3, contribution: 0.216, rank: 45 },
          { component: 'Consistency', score: 0.75, weight: 0.3, contribution: 0.225, rank: 40 }
        ],
        ranking_methodology: 'Weighted composite of return, risk, and consistency metrics'
      }
    };
  }

  private performOutlierAnalysis(
    portfolioReturns: number[],
    _benchmarkComparisons: BenchmarkComparison[]
  ): OutlierAnalysis {
    const threshold = 2.5; // Standard deviations
    const mean = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    const std = Math.sqrt(
      portfolioReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / portfolioReturns.length
    );

    const outlierPeriods = portfolioReturns
      .map((ret, i) => ({
        date: new Date(Date.now() - (portfolioReturns.length - i) * 24 * 60 * 60 * 1000),
        return: ret,
        z_score: (ret - mean) / std
      }))
      .filter(period => Math.abs(period.z_score) > threshold)
      .map(period => ({
        date: period.date,
        return: period.return,
        benchmark_return: 0, // Would need actual benchmark data
        excess_return: period.return, // Simplified
        z_score: period.z_score,
        outlier_type: (period.return > mean ? 'positive' : 'negative') as 'positive' | 'negative',
        outlier_magnitude: (Math.abs(period.z_score) > 3 ? 'extreme' :
                          Math.abs(period.z_score) > 2.5 ? 'moderate' : 'mild') as 'mild' | 'moderate' | 'extreme'
      }));

    return {
      outlier_detection: {
        outlier_periods: outlierPeriods,
        outlier_frequency: outlierPeriods.length / portfolioReturns.length * 100,
        outlier_magnitude: outlierPeriods.reduce((sum, p) => sum + Math.abs(p.z_score), 0) / outlierPeriods.length,
        outlier_clustering: 0.25 // Simplified clustering measure
      },
      outlier_attribution: [],
      outlier_persistence: {
        persistence_probability: 0.15,
        mean_reversion_speed: 0.65,
        clustering_tendency: 0.25,
        regime_dependence: 0.35
      },
      outlier_impact: {
        portfolio_impact: 1.8,
        risk_impact: 0.25,
        ranking_impact: 5,
        benchmark_impact: 1.2
      }
    };
  }

  private getEmptyBenchmarkingAnalysis(): PerformanceBenchmarkAnalysis {
    return {
      portfolio_performance: {
        total_return: 0,
        annualized_return: 0,
        volatility: 0,
        max_drawdown: 0,
        sharpe_ratio: 0,
        sortino_ratio: 0,
        calmar_ratio: 0,
        upside_capture: 0,
        downside_capture: 0,
        win_rate: 0,
        profit_factor: 0,
        var_95: 0,
        cvar_95: 0,
        skewness: 0,
        kurtosis: 0,
        performance_periods: []
      },
      benchmark_comparisons: [],
      risk_adjusted_metrics: {
        portfolio_metrics: {
          volatility: 0, downside_deviation: 0, maximum_drawdown: 0, var_95: 0, cvar_95: 0,
          semi_variance: 0, tail_ratio: 0, gain_pain_ratio: 0, sterling_ratio: 0, burke_ratio: 0
        },
        benchmark_metrics: new Map(),
        relative_metrics: {
          relative_volatility: 0, relative_downside_deviation: 0, relative_max_drawdown: 0,
          relative_var: 0, tracking_error: 0, active_risk: 0, residual_risk: 0
        },
        risk_efficiency: {
          risk_adjusted_excess_return: 0, return_per_unit_risk: 0, excess_return_per_unit_tracking_error: 0,
          risk_efficiency_ratio: 0, risk_return_ranking: 0
        },
        risk_decomposition: {
          systematic_risk: 0, specific_risk: 0, style_risk: 0, selection_risk: 0,
          interaction_risk: 0, currency_risk: 0
        }
      },
      attribution_analysis: {
        total_excess_return: 0, allocation_effect: 0, selection_effect: 0, interaction_effect: 0,
        currency_effect: 0, sector_attribution: [], security_attribution: [], factor_attribution: []
      },
      rolling_performance: {
        rolling_periods: [], rolling_correlations: [], rolling_betas: [], rolling_tracking_error: [],
        performance_consistency: {
          consistency_ratio: 0, positive_periods: 0, negative_periods: 0, outperformance_frequency: 0,
          average_outperformance: 0, average_underperformance: 0, longest_outperformance_streak: 0,
          longest_underperformance_streak: 0
        },
        regime_performance: {
          bull_market_performance: { regime: 'bull', portfolio_return: 0, benchmark_return: 0, excess_return: 0, hit_rate: 0, up_capture: 0, down_capture: 0, regime_beta: 0 },
          bear_market_performance: { regime: 'bear', portfolio_return: 0, benchmark_return: 0, excess_return: 0, hit_rate: 0, up_capture: 0, down_capture: 0, regime_beta: 0 },
          sideways_market_performance: { regime: 'sideways', portfolio_return: 0, benchmark_return: 0, excess_return: 0, hit_rate: 0, up_capture: 0, down_capture: 0, regime_beta: 0 },
          volatile_market_performance: { regime: 'volatile', portfolio_return: 0, benchmark_return: 0, excess_return: 0, hit_rate: 0, up_capture: 0, down_capture: 0, regime_beta: 0 },
          regime_consistency: 0
        }
      },
      peer_comparison: {
        peer_universe: { universe_name: '', universe_size: 0, universe_description: '', inclusion_criteria: [], peer_characteristics: { median_aum: 0, median_return: 0, median_volatility: 0, median_sharpe_ratio: 0, return_dispersion: 0, risk_dispersion: 0 } },
        percentile_rankings: {
          return_ranking: { metric: '', percentile: 0, quartile: 0, decile: 0, rank: 0, total_funds: 0, value: 0, peer_median: 0, peer_average: 0 },
          risk_ranking: { metric: '', percentile: 0, quartile: 0, decile: 0, rank: 0, total_funds: 0, value: 0, peer_median: 0, peer_average: 0 },
          risk_adjusted_ranking: { metric: '', percentile: 0, quartile: 0, decile: 0, rank: 0, total_funds: 0, value: 0, peer_median: 0, peer_average: 0 },
          consistency_ranking: { metric: '', percentile: 0, quartile: 0, decile: 0, rank: 0, total_funds: 0, value: 0, peer_median: 0, peer_average: 0 },
          drawdown_ranking: { metric: '', percentile: 0, quartile: 0, decile: 0, rank: 0, total_funds: 0, value: 0, peer_median: 0, peer_average: 0 },
          composite_ranking: { metric: '', percentile: 0, quartile: 0, decile: 0, rank: 0, total_funds: 0, value: 0, peer_median: 0, peer_average: 0 }
        },
        peer_relative_performance: { outperformance_frequency: 0, average_outperformance: 0, outperformance_consistency: 0, relative_volatility: 0, correlation_with_peers: 0, peer_tracking_error: 0 },
        style_peer_comparison: { style_category: '', style_peers: 0, style_ranking: 0, style_percentile: 0, style_consistency: 0, style_drift: 0 },
        risk_peer_comparison: { risk_category: '', risk_ranking: 0, risk_percentile: 0, relative_risk: 0, risk_efficiency: 0, tail_risk_ranking: 0 }
      },
      style_analysis: {
        style_classification: { primary_style: '', secondary_style: '', style_confidence: 0, style_purity: 0, classification_stability: 0 },
        style_exposures: [], style_drift: { drift_magnitude: 0, drift_direction: '', drift_persistence: 0, drift_significance: 0, style_migration: [] },
        style_consistency: { consistency_score: 0, style_volatility: 0, factor_stability: [], style_predictability: 0 },
        factor_loadings: [], style_timing: { timing_ability: 0, timing_frequency: 0, successful_timing: 0, timing_value_added: 0, timing_consistency: 0 }
      },
      tracking_analysis: {
        tracking_error: 0, tracking_error_components: [], tracking_error_attribution: { asset_allocation: 0, security_selection: 0, sector_allocation: 0, currency_allocation: 0, interaction_effects: 0, residual: 0 },
        tracking_efficiency: { information_ratio: 0, tracking_error_efficiency: 0, return_per_unit_tracking_error: 0, tracking_error_utilization: 0 },
        tracking_stability: { tracking_error_volatility: 0, tracking_error_predictability: 0, regime_stability: 0, time_stability: 0 }
      },
      active_share_analysis: {
        active_share: 0, active_share_components: [], active_share_efficiency: { return_per_unit_active_share: 0, risk_per_unit_active_share: 0, efficiency_ratio: 0, efficiency_ranking: 0 },
        active_share_evolution: [], concentration_analysis: { portfolio_concentration: 0, benchmark_concentration: 0, relative_concentration: 0, top_holdings_concentration: [], sector_concentration: [] }
      },
      performance_persistence: {
        persistence_metrics: [], performance_predictability: { r_squared: 0, forecast_accuracy: 0, forecast_bias: 0, forecast_consistency: 0, predictability_factors: [] },
        hot_hand_analysis: { hot_hand_probability: 0, cold_hand_probability: 0, streak_persistence: { average_winning_streak: 0, average_losing_streak: 0, longest_winning_streak: 0, longest_losing_streak: 0, streak_predictability: 0 }, momentum_effects: [] },
        regime_persistence: []
      },
      rankings: {
        absolute_rankings: [], relative_rankings: [], risk_adjusted_rankings: [], consistency_rankings: [],
        composite_ranking: { overall_score: 0, overall_rank: 0, overall_percentile: 0, component_scores: [], ranking_methodology: '' }
      },
      outlier_analysis: {
        outlier_detection: { outlier_periods: [], outlier_frequency: 0, outlier_magnitude: 0, outlier_clustering: 0 },
        outlier_attribution: [], outlier_persistence: { persistence_probability: 0, mean_reversion_speed: 0, clustering_tendency: 0, regime_dependence: 0 },
        outlier_impact: { portfolio_impact: 0, risk_impact: 0, ranking_impact: 0, benchmark_impact: 0 }
      }
    };
  }

  /**
   * Update benchmarking configuration
   */
  public updateConfig(newConfig: Partial<BenchmarkingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): BenchmarkingConfig {
    return { ...this.config };
  }

  /**
   * Clear performance cache
   */
  public clearPerformanceCache(): void {
    this.benchmarkCache.clear();
  }
}

// Export singleton instance
export const performanceBenchmarkingEngine = new PerformanceBenchmarkingEngine();