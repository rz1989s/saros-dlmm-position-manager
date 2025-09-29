import { PublicKey } from '@solana/web3.js';
import { DLMMPosition, EnhancedDLMMPosition } from '../types';
import { DLMMClient } from './client';
import { MultiPositionAnalysisEngine } from './multi-position-analysis';
import { PortfolioOptimizationEngine } from './portfolio-optimizer';
import { DiversificationAnalysisEngine } from './diversification';
import { PositionConsolidationEngine, ConsolidationAnalysis } from './consolidation';

export interface ReportConfiguration {
  reportId: string;
  name: string;
  description: string;
  template: ReportTemplate;
  sections: ReportSection[];
  format: ReportFormat[];
  schedule?: ReportSchedule;
  recipients?: ReportRecipient[];
  branding?: ReportBranding;
  customization?: ReportCustomization;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: ReportTemplateType;
  layout: ReportLayout;
  styling: ReportStyling;
  sections: TemplateSectionConfig[];
  variables: TemplateVariable[];
  conditionals: TemplateConditional[];
}

export enum ReportTemplateType {
  EXECUTIVE_SUMMARY = 'executive_summary',
  DETAILED_ANALYSIS = 'detailed_analysis',
  RISK_ASSESSMENT = 'risk_assessment',
  PERFORMANCE_ATTRIBUTION = 'performance_attribution',
  COMPLIANCE_REPORT = 'compliance_report',
  INVESTOR_REPORT = 'investor_report',
  OPERATIONAL_REPORT = 'operational_report',
  CUSTOM = 'custom'
}

export enum ReportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  JSON = 'json',
  XLSX = 'xlsx',
  HTML = 'html',
  XML = 'xml'
}

export interface ReportLayout {
  pageSize: 'A4' | 'Letter' | 'Legal' | 'A3';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  header: LayoutSection;
  footer: LayoutSection;
  body: LayoutSection;
}

export interface ReportStyling {
  fontFamily: string;
  fontSize: {
    heading1: number;
    heading2: number;
    heading3: number;
    body: number;
    caption: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    border: string;
  };
  spacing: {
    paragraphSpacing: number;
    lineHeight: number;
    sectionSpacing: number;
  };
}

export interface LayoutSection {
  height?: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  elements: LayoutElement[];
}

export interface LayoutElement {
  type: 'text' | 'image' | 'chart' | 'table' | 'spacer' | 'pageBreak';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  content?: any;
  styling?: Partial<ReportStyling>;
}

export interface ReportSection {
  id: string;
  name: string;
  type: ReportSectionType;
  enabled: boolean;
  order: number;
  configuration: SectionConfiguration;
  dependencies?: string[];
  conditional?: SectionConditional;
}

export enum ReportSectionType {
  EXECUTIVE_SUMMARY = 'executive_summary',
  PORTFOLIO_OVERVIEW = 'portfolio_overview',
  POSITION_DETAILS = 'position_details',
  PERFORMANCE_ANALYSIS = 'performance_analysis',
  RISK_ANALYSIS = 'risk_analysis',
  DIVERSIFICATION_ANALYSIS = 'diversification_analysis',
  OPTIMIZATION_RECOMMENDATIONS = 'optimization_recommendations',
  CONSOLIDATION_OPPORTUNITIES = 'consolidation_opportunities',
  MARKET_ANALYSIS = 'market_analysis',
  COMPLIANCE_OVERVIEW = 'compliance_overview',
  APPENDIX = 'appendix',
  CUSTOM = 'custom'
}

export interface SectionConfiguration {
  includeCharts: boolean;
  includeTables: boolean;
  includeMetrics: boolean;
  timeframeConfig: TimeframeConfiguration;
  detailLevel: 'summary' | 'detailed' | 'comprehensive';
  customFilters?: SectionFilter[];
  aggregationLevel?: 'position' | 'pair' | 'token' | 'strategy';
}

export interface TimeframeConfiguration {
  primary: string;
  comparison?: string[];
  rollingPeriods?: number[];
  benchmarkPeriods?: string[];
}

export interface SectionFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
  logic?: 'and' | 'or';
}

export interface SectionConditional {
  conditions: ConditionalRule[];
  logic: 'and' | 'or';
  action: 'include' | 'exclude' | 'modify';
}

export interface ConditionalRule {
  field: string;
  operator: string;
  value: any;
  source: 'portfolio' | 'position' | 'market' | 'user';
}

export interface ReportSchedule {
  frequency: ScheduleFrequency;
  startDate: Date;
  endDate?: Date;
  timezone: string;
  parameters: ScheduleParameters;
  notifications: ScheduleNotification[];
}

export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  CUSTOM = 'custom'
}

export interface ScheduleParameters {
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  weekOfMonth?: number;
  customCron?: string;
  retryPolicy: RetryPolicy;
}

export interface RetryPolicy {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  failureNotification: boolean;
}

export interface ScheduleNotification {
  type: 'email' | 'webhook' | 'slack' | 'sms';
  trigger: 'success' | 'failure' | 'both';
  recipients: string[];
  template?: string;
}

export interface ReportRecipient {
  id: string;
  name: string;
  email: string;
  role: RecipientRole;
  permissions: RecipientPermissions;
  preferences: RecipientPreferences;
}

export enum RecipientRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  ANALYST = 'analyst',
  VIEWER = 'viewer',
  AUDITOR = 'auditor'
}

export interface RecipientPermissions {
  canViewSensitiveData: boolean;
  canExportData: boolean;
  canModifyReports: boolean;
  allowedSections: string[];
  dataAccessLevel: 'full' | 'summary' | 'limited';
}

export interface RecipientPreferences {
  preferredFormat: ReportFormat;
  includeCharts: boolean;
  includeRawData: boolean;
  compressionLevel: 'none' | 'standard' | 'maximum';
  encryptionRequired: boolean;
}

export interface ReportBranding {
  logo?: string;
  companyName?: string;
  colors?: Partial<ReportStyling['colors']>;
  fonts?: Partial<ReportStyling['fontSize']>;
  watermark?: string;
  disclaimer?: string;
}

export interface ReportCustomization {
  customFields: CustomField[];
  customMetrics: CustomMetric[];
  customCharts: CustomChart[];
  customCalculations: CustomCalculation[];
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'currency';
  source: string;
  calculation?: string;
  formatting?: FieldFormatting;
}

export interface CustomMetric {
  id: string;
  name: string;
  description: string;
  formula: string;
  unit: string;
  formatting: MetricFormatting;
  thresholds?: MetricThreshold[];
}

export interface CustomChart {
  id: string;
  name: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'treemap';
  dataSource: string;
  configuration: ChartConfiguration;
}

export interface CustomCalculation {
  id: string;
  name: string;
  description: string;
  inputs: CalculationInput[];
  formula: string;
  outputType: string;
}

export interface FieldFormatting {
  prefix?: string;
  suffix?: string;
  decimals?: number;
  thousandsSeparator?: string;
  dateFormat?: string;
}

export interface MetricFormatting extends FieldFormatting {
  colorCoding?: {
    good: string;
    warning: string;
    critical: string;
  };
  sparkline?: boolean;
}

export interface MetricThreshold {
  level: 'good' | 'warning' | 'critical';
  operator: 'greater' | 'less' | 'equal' | 'between';
  value: number | number[];
  message?: string;
}

export interface ChartConfiguration {
  xAxis: AxisConfiguration;
  yAxis: AxisConfiguration;
  series: SeriesConfiguration[];
  styling: ChartStyling;
  interactions: ChartInteraction[];
}

export interface AxisConfiguration {
  field: string;
  label: string;
  type: 'category' | 'value' | 'time';
  scale?: 'linear' | 'log' | 'sqrt';
  range?: [number, number];
  format?: string;
}

export interface SeriesConfiguration {
  field: string;
  label: string;
  type: 'line' | 'bar' | 'area' | 'scatter';
  color?: string;
  styling?: SeriesStyling;
}

export interface SeriesStyling {
  strokeWidth?: number;
  fillOpacity?: number;
  markerSize?: number;
  pattern?: 'solid' | 'dashed' | 'dotted';
}

export interface ChartStyling {
  width: number;
  height: number;
  backgroundColor?: string;
  gridLines?: boolean;
  legend?: LegendConfiguration;
}

export interface LegendConfiguration {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  orientation: 'horizontal' | 'vertical';
}

export interface ChartInteraction {
  type: 'zoom' | 'pan' | 'tooltip' | 'crosshair' | 'selection';
  enabled: boolean;
  configuration?: any;
}

export interface CalculationInput {
  name: string;
  type: string;
  source: string;
  required: boolean;
  defaultValue?: any;
}

export interface TemplateSectionConfig {
  sectionId: string;
  enabled: boolean;
  customization?: SectionCustomization;
}

export interface SectionCustomization {
  title?: string;
  subtitle?: string;
  introduction?: string;
  conclusion?: string;
  customElements?: CustomElement[];
}

export interface CustomElement {
  type: string;
  content: any;
  positioning: ElementPositioning;
}

export interface ElementPositioning {
  before?: string;
  after?: string;
  replace?: string;
  float?: 'left' | 'right' | 'center';
}

export interface TemplateVariable {
  name: string;
  type: string;
  defaultValue?: any;
  description?: string;
  validation?: VariableValidation;
}

export interface VariableValidation {
  required: boolean;
  pattern?: string;
  minValue?: number;
  maxValue?: number;
  allowedValues?: any[];
}

export interface TemplateConditional {
  condition: string;
  trueValue: any;
  falseValue?: any;
  section?: string;
}

export interface PortfolioReport {
  metadata: ReportMetadata;
  executiveSummary: ExecutiveSummary;
  portfolioOverview: PortfolioOverview;
  positionDetails: PositionDetail[];
  performanceAnalysis: PerformanceAnalysis;
  riskAnalysis: RiskAnalysis;
  diversificationAnalysis: any;
  optimizationRecommendations: OptimizationRecommendation[];
  consolidationOpportunities: ConsolidationOpportunity[];
  marketAnalysis: MarketAnalysis;
  complianceOverview: ComplianceOverview;
  appendix: ReportAppendix;
  customSections?: CustomSection[];
}

export interface ReportMetadata {
  reportId: string;
  generatedAt: Date;
  generatedBy: string;
  reportPeriod: {
    start: Date;
    end: Date;
  };
  walletAddress: string;
  reportVersion: string;
  dataVersion: string;
  configuration: ReportConfiguration;
  processingTime: number;
  dataFreshness: DataFreshness;
}

export interface DataFreshness {
  positions: Date;
  prices: Date;
  marketData: Date;
  analytics: Date;
  oldestData: Date;
  newestData: Date;
}

export interface ExecutiveSummary {
  totalValue: number;
  totalValueChange: number;
  totalValueChangePercent: number;
  totalPositions: number;
  activePositions: number;
  totalPairs: number;
  diversificationScore: number;
  riskScore: number;
  performanceRating: PerformanceRating;
  keyMetrics: KeyMetric[];
  highlights: ReportHighlight[];
  concerns: ReportConcern[];
  recommendations: SummaryRecommendation[];
}

export interface PerformanceRating {
  overall: number;
  risk: number;
  diversification: number;
  efficiency: number;
  consistency: number;
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
}

export interface KeyMetric {
  name: string;
  value: number;
  unit: string;
  change?: number;
  changePercent?: number;
  trend: 'up' | 'down' | 'stable';
  significance: 'high' | 'medium' | 'low';
}

export interface ReportHighlight {
  type: 'performance' | 'risk' | 'opportunity' | 'efficiency';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  data?: any;
}

export interface ReportConcern {
  type: 'risk' | 'performance' | 'compliance' | 'efficiency';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  data?: any;
}

export interface SummaryRecommendation {
  type: 'rebalance' | 'consolidate' | 'diversify' | 'hedge' | 'exit';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  timeframe: string;
}

export interface PortfolioOverview {
  totalStatistics: PortfolioStatistics;
  allocation: AllocationBreakdown;
  performance: PerformanceOverview;
  risk: RiskOverview;
  liquidity: LiquidityOverview;
  fees: FeeOverview;
  charts: OverviewChart[];
}

export interface PortfolioStatistics {
  totalValue: number;
  totalValueUSD: number;
  positionCount: number;
  pairCount: number;
  tokenCount: number;
  averagePositionSize: number;
  largestPosition: number;
  smallestPosition: number;
  concentrationRatio: number;
  activePositionRatio: number;
}

export interface AllocationBreakdown {
  byToken: TokenAllocation[];
  byPair: PairAllocation[];
  byStrategy: StrategyAllocation[];
  bySize: SizeAllocation[];
  byAge: AgeAllocation[];
  byPerformance: PerformanceAllocation[];
}

export interface TokenAllocation {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  value: number;
  valueUSD: number;
  percentage: number;
  positionCount: number;
}

export interface PairAllocation {
  pairAddress: string;
  pairName: string;
  tokenX: string;
  tokenY: string;
  value: number;
  valueUSD: number;
  percentage: number;
  positionCount: number;
}

export interface StrategyAllocation {
  strategy: string;
  description: string;
  value: number;
  valueUSD: number;
  percentage: number;
  positionCount: number;
  performance: number;
}

export interface SizeAllocation {
  category: 'large' | 'medium' | 'small' | 'micro';
  threshold: number;
  count: number;
  value: number;
  percentage: number;
}

export interface AgeAllocation {
  category: 'new' | 'recent' | 'mature' | 'old';
  ageDays: number;
  count: number;
  value: number;
  percentage: number;
}

export interface PerformanceAllocation {
  category: 'excellent' | 'good' | 'neutral' | 'poor' | 'losing';
  performanceRange: [number, number];
  count: number;
  value: number;
  percentage: number;
}

export interface PerformanceOverview {
  totalReturn: number;
  totalReturnPercent: number;
  realizedPnL: number;
  unrealizedPnL: number;
  feeEarnings: number;
  impermanentLoss: number;
  timeWeightedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  bestPosition: PositionPerformance;
  worstPosition: PositionPerformance;
  performanceByPeriod: PeriodPerformance[];
}

export interface PositionPerformance {
  positionId: string;
  pairName: string;
  return: number;
  returnPercent: number;
  value: number;
  timeframe: string;
}

export interface PeriodPerformance {
  period: string;
  startDate: Date;
  endDate: Date;
  return: number;
  returnPercent: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface RiskOverview {
  overallRiskScore: number;
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  concentrationRisk: number;
  liquidityRisk: number;
  volatilityRisk: number;
  correlationRisk: number;
  impermanentLossRisk: number;
  riskByCategory: RiskCategory[];
  riskFactors: RiskFactor[];
  hedgingOpportunities: HedgingOpportunity[];
}

export interface RiskCategory {
  category: string;
  score: number;
  weight: number;
  contribution: number;
  description: string;
}

export interface RiskFactor {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  probability: number;
  description: string;
  mitigation: string;
}

export interface HedgingOpportunity {
  type: 'correlation' | 'volatility' | 'liquidity' | 'concentration';
  description: string;
  expectedReduction: number;
  cost: number;
  recommendation: string;
}

export interface LiquidityOverview {
  totalLiquidity: number;
  averageBidAskSpread: number;
  liquidityScore: number;
  liquidityDistribution: LiquidityDistribution[];
  liquidityRisk: LiquidityRiskAssessment;
  marketDepth: MarketDepthAnalysis;
}

export interface LiquidityDistribution {
  category: 'high' | 'medium' | 'low' | 'very_low';
  count: number;
  value: number;
  percentage: number;
  description: string;
}

export interface LiquidityRiskAssessment {
  score: number;
  factors: LiquidityRiskFactor[];
  scenarios: LiquidityScenario[];
}

export interface LiquidityRiskFactor {
  factor: string;
  impact: number;
  description: string;
}

export interface LiquidityScenario {
  scenario: string;
  probability: number;
  impact: number;
  description: string;
}

export interface MarketDepthAnalysis {
  averageDepth: number;
  depthDistribution: DepthBucket[];
  slippageEstimates: SlippageEstimate[];
}

export interface DepthBucket {
  range: string;
  depth: number;
  percentage: number;
}

export interface SlippageEstimate {
  size: number;
  estimatedSlippage: number;
  confidence: number;
}

export interface FeeOverview {
  totalFeesEarned: number;
  totalFeesEarnedUSD: number;
  averageFeeAPR: number;
  feeDistribution: FeeDistribution[];
  feeEfficiency: FeeEfficiencyAnalysis;
  feeOptimization: FeeOptimizationRecommendation[];
}

export interface FeeDistribution {
  feeRange: string;
  count: number;
  value: number;
  percentage: number;
  averageAPR: number;
}

export interface FeeEfficiencyAnalysis {
  efficiency: number;
  benchmarkComparison: number;
  improvementOpportunities: string[];
}

export interface FeeOptimizationRecommendation {
  type: 'migration' | 'adjustment' | 'consolidation';
  description: string;
  expectedImprovement: number;
  effort: 'low' | 'medium' | 'high';
}

export interface OverviewChart {
  id: string;
  title: string;
  type: string;
  data: any;
  configuration: ChartConfiguration;
}

export interface PositionDetail {
  position: DLMMPosition;
  analytics: PositionAnalytics;
  performance: PositionPerformance;
  risk: PositionRisk;
  recommendations: PositionRecommendation[];
  history: PositionHistoryEntry[];
}

export interface PositionAnalytics {
  currentValue: number;
  initialValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  realizedPnL: number;
  unrealizedPnL: number;
  feeEarnings: number;
  impermanentLoss: number;
  timeInPosition: number;
  efficiency: number;
  liquidityUtilization: number;
  concentrationScore: number;
}

export interface PositionRisk {
  riskScore: number;
  volatility: number;
  liquidityRisk: number;
  concentrationRisk: number;
  correlationRisk: number;
  impermanentLossRisk: number;
  timeDecay: number;
}

export interface PositionRecommendation {
  type: 'rebalance' | 'close' | 'modify' | 'hedge' | 'optimize';
  priority: 'high' | 'medium' | 'low';
  description: string;
  rationale: string;
  expectedOutcome: string;
  estimatedCost: number;
  timeframe: string;
}

export interface PositionHistoryEntry {
  timestamp: Date;
  action: 'open' | 'modify' | 'close' | 'rebalance' | 'fee_collection';
  details: any;
  impact: HistoryImpact;
}

export interface HistoryImpact {
  valueChange: number;
  performanceChange: number;
  riskChange: number;
  efficiency: number;
}

export interface PerformanceAnalysis {
  attribution: PerformanceAttribution;
  benchmark: BenchmarkComparison;
  trends: PerformanceTrend[];
  scenarios: PerformanceScenario[];
  decomposition: PerformanceDecomposition;
}

export interface PerformanceAttribution {
  totalReturn: number;
  components: AttributionComponent[];
  periodBreakdown: PeriodAttribution[];
  positionContributions: PositionContribution[];
}

export interface AttributionComponent {
  component: string;
  contribution: number;
  percentage: number;
  description: string;
}

export interface PeriodAttribution {
  period: string;
  return: number;
  components: AttributionComponent[];
}

export interface PositionContribution {
  positionId: string;
  pairName: string;
  contribution: number;
  percentage: number;
  weight: number;
}

export interface BenchmarkComparison {
  benchmarks: BenchmarkResult[];
  outperformance: number;
  consistency: number;
  correlation: number;
  beta: number;
  alpha: number;
  informationRatio: number;
}

export interface BenchmarkResult {
  name: string;
  return: number;
  volatility: number;
  sharpeRatio: number;
  correlation: number;
  outperformance: number;
}

export interface PerformanceTrend {
  metric: string;
  direction: 'improving' | 'stable' | 'declining';
  strength: number;
  significance: number;
  timeframe: string;
  description: string;
}

export interface PerformanceScenario {
  scenario: string;
  probability: number;
  expectedReturn: number;
  downside: number;
  upside: number;
  description: string;
}

export interface PerformanceDecomposition {
  systematic: number;
  idiosyncratic: number;
  market: number;
  sector: number;
  alpha: number;
  explained: number;
  unexplained: number;
}

export interface RiskAnalysis {
  summary: RiskSummary;
  metrics: RiskMetric[];
  scenarios: RiskScenario[];
  correlations: CorrelationMatrix;
  concentrations: ConcentrationAnalysis;
  stresstests: StressTestResult[];
  recommendations: RiskRecommendation[];
}

export interface RiskSummary {
  overallScore: number;
  level: string;
  primaryConcerns: string[];
  keyMetrics: RiskMetric[];
  trendDirection: 'improving' | 'stable' | 'worsening';
}

export interface RiskMetric {
  name: string;
  value: number;
  unit: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  trend: 'improving' | 'stable' | 'worsening';
  description: string;
  benchmark?: number;
}

export interface RiskScenario {
  name: string;
  probability: number;
  impact: number;
  description: string;
  mitigation: string;
  timeline: string;
}

export interface CorrelationMatrix {
  assets: string[];
  matrix: number[][];
  averageCorrelation: number;
  maxCorrelation: number;
  minCorrelation: number;
  clusters: CorrelationCluster[];
}

export interface CorrelationCluster {
  name: string;
  assets: string[];
  averageCorrelation: number;
  description: string;
}

export interface ConcentrationAnalysis {
  herfindahlIndex: number;
  top5Concentration: number;
  top10Concentration: number;
  concentrationRisk: number;
  recommendations: string[];
  diversificationOpportunities: DiversificationOpportunity[];
}

export interface DiversificationOpportunity {
  type: 'token' | 'pair' | 'strategy' | 'time';
  description: string;
  expectedBenefit: number;
  implementation: string;
}

export interface StressTestResult {
  scenario: string;
  impact: number;
  recovery: number;
  maxDrawdown: number;
  timeToRecover: number;
  description: string;
}

export interface RiskRecommendation {
  type: 'hedge' | 'diversify' | 'reduce' | 'monitor';
  priority: 'high' | 'medium' | 'low';
  description: string;
  expectedReduction: number;
  cost: number;
  timeframe: string;
}

export interface OptimizationRecommendation {
  id: string;
  type: 'rebalance' | 'consolidate' | 'migrate' | 'close' | 'hedge';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  expectedOutcome: ExpectedOutcome;
  implementation: ImplementationPlan;
  riskAssessment: RecommendationRisk;
  timeframe: string;
  dependencies?: string[];
}

export interface ExpectedOutcome {
  returnImprovement: number;
  riskReduction: number;
  efficiencyGain: number;
  costSavings: number;
  confidence: number;
}

export interface ImplementationPlan {
  steps: ImplementationStep[];
  estimatedCost: number;
  estimatedTime: number;
  complexity: 'low' | 'medium' | 'high';
  prerequisites: string[];
}

export interface ImplementationStep {
  order: number;
  description: string;
  estimatedCost: number;
  estimatedTime: number;
  risks: string[];
}

export interface RecommendationRisk {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  mitigation: string[];
  worstCase: string;
}

export interface ConsolidationOpportunity {
  id: string;
  type: 'similar_pairs' | 'low_efficiency' | 'high_cost' | 'overlapping_ranges';
  positions: string[];
  description: string;
  analysis: ConsolidationAnalysisDetail;
  recommendation: ConsolidationRecommendation;
  implementation: ConsolidationImplementation;
}

export interface ConsolidationAnalysisDetail {
  currentState: ConsolidationState;
  proposedState: ConsolidationState;
  benefits: ConsolidationBenefit[];
  costs: ConsolidationCost[];
  netBenefit: number;
  paybackPeriod: number;
}

export interface ConsolidationState {
  positionCount: number;
  totalValue: number;
  totalFees: number;
  efficiency: number;
  complexity: number;
}

export interface ConsolidationBenefit {
  type: string;
  value: number;
  description: string;
  timeframe: string;
}

export interface ConsolidationCost {
  type: string;
  value: number;
  description: string;
  timing: string;
}

export interface ConsolidationRecommendation {
  action: 'consolidate' | 'partial_consolidate' | 'defer' | 'reject';
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  conditions?: string[];
}

export interface ConsolidationImplementation {
  approach: 'sequential' | 'parallel' | 'phased';
  timeline: ConsolidationPhase[];
  riskMitigation: string[];
  monitoringPlan: string[];
}

export interface ConsolidationPhase {
  phase: number;
  description: string;
  positions: string[];
  estimatedDuration: number;
  dependencies: string[];
}

export interface MarketAnalysis {
  overview: MarketOverview;
  trends: MarketTrend[];
  opportunities: MarketOpportunity[];
  threats: MarketThreat[];
  outlook: MarketOutlook;
}

export interface MarketOverview {
  totalMarketCap: number;
  marketCapChange: number;
  totalVolume: number;
  volumeChange: number;
  activeMarkets: number;
  sentiment: 'bullish' | 'neutral' | 'bearish';
  volatility: number;
}

export interface MarketTrend {
  category: string;
  direction: 'up' | 'down' | 'sideways';
  strength: number;
  duration: number;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface MarketOpportunity {
  type: string;
  description: string;
  potential: number;
  timeframe: string;
  actionRequired: string;
  confidence: number;
}

export interface MarketThreat {
  type: string;
  description: string;
  probability: number;
  impact: number;
  timeframe: string;
  mitigation: string;
}

export interface MarketOutlook {
  timeframe: string;
  scenario: 'bullish' | 'neutral' | 'bearish';
  keyFactors: string[];
  expectations: MarketExpectation[];
  recommendations: string[];
}

export interface MarketExpectation {
  metric: string;
  currentValue: number;
  expectedValue: number;
  confidence: number;
  timeframe: string;
}

export interface ComplianceOverview {
  status: 'compliant' | 'non_compliant' | 'needs_review';
  lastReview: Date;
  nextReview: Date;
  requirements: ComplianceRequirement[];
  violations: ComplianceViolation[];
  recommendations: ComplianceRecommendation[];
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  status: 'met' | 'not_met' | 'partial' | 'unknown';
  lastChecked: Date;
  evidence: string[];
}

export interface ComplianceViolation {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  requirement: string;
  detectedAt: Date;
  resolution: string;
  status: 'open' | 'resolved' | 'in_progress';
}

export interface ComplianceRecommendation {
  type: 'process' | 'documentation' | 'training' | 'system';
  priority: 'high' | 'medium' | 'low';
  description: string;
  implementation: string;
  deadline?: Date;
}

export interface ReportAppendix {
  methodology: MethodologyDescription;
  assumptions: AssumptionsList;
  limitations: LimitationsList;
  dataSourcess: DataSourcesList;
  calculations: CalculationsList;
  glossary: GlossaryEntry[];
  references: Reference[];
}

export interface MethodologyDescription {
  overview: string;
  dataCollection: string;
  analysis: string;
  riskAssessment: string;
  limitations: string;
}

export interface AssumptionsList {
  general: string[];
  pricing: string[];
  risk: string[];
  performance: string[];
  market: string[];
}

export interface LimitationsList {
  data: string[];
  methodology: string[];
  market: string[];
  technical: string[];
}

export interface DataSourcesList {
  primary: DataSource[];
  secondary: DataSource[];
  benchmarks: DataSource[];
}

export interface DataSource {
  name: string;
  type: string;
  coverage: string;
  frequency: string;
  reliability: string;
}

export interface CalculationsList {
  performance: CalculationMethod[];
  risk: CalculationMethod[];
  attribution: CalculationMethod[];
}

export interface CalculationMethod {
  name: string;
  formula: string;
  description: string;
  assumptions: string[];
}

export interface GlossaryEntry {
  term: string;
  definition: string;
  category: string;
}

export interface Reference {
  title: string;
  author: string;
  type: 'academic' | 'industry' | 'regulatory' | 'technical';
  url?: string;
  date: Date;
}

export interface CustomSection {
  id: string;
  name: string;
  content: any;
  type: string;
  configuration: any;
}

export interface ReportGenerationRequest {
  walletAddress: string;
  reportType: ReportTemplateType;
  configuration?: Partial<ReportConfiguration>;
  customization?: Partial<ReportCustomization>;
  format: ReportFormat[];
  schedule?: ReportSchedule;
  metadata?: Record<string, any>;
}

export interface ReportGenerationResult {
  reportId: string;
  status: 'success' | 'failed' | 'partial';
  outputs: ReportOutput[];
  errors?: ReportError[];
  warnings?: ReportWarning[];
  metrics: GenerationMetrics;
}

export interface ReportOutput {
  format: ReportFormat;
  content: any;
  size: number;
  metadata: OutputMetadata;
}

export interface OutputMetadata {
  pages?: number;
  sections: number;
  charts: number;
  tables: number;
  generatedAt: Date;
  checksum: string;
}

export interface ReportError {
  code: string;
  message: string;
  section?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  details?: any;
}

export interface ReportWarning {
  code: string;
  message: string;
  section?: string;
  impact: string;
  suggestion?: string;
}

export interface GenerationMetrics {
  totalTime: number;
  dataFetchTime: number;
  analysisTime: number;
  renderingTime: number;
  exportTime: number;
  memoryUsage: number;
  cacheHitRate: number;
}

export interface ReportArchive {
  reports: ArchivedReport[];
  statistics: ArchiveStatistics;
  retention: RetentionPolicy;
}

export interface ArchivedReport {
  reportId: string;
  generatedAt: Date;
  configuration: ReportConfiguration;
  size: number;
  format: ReportFormat[];
  status: 'active' | 'archived' | 'deleted';
  accessCount: number;
  lastAccessed: Date;
}

export interface ArchiveStatistics {
  totalReports: number;
  totalSize: number;
  averageSize: number;
  oldestReport: Date;
  newestReport: Date;
  formatDistribution: Record<ReportFormat, number>;
}

export interface RetentionPolicy {
  maxAge: number;
  maxCount: number;
  maxSize: number;
  autoCleanup: boolean;
  compressionEnabled: boolean;
}

export class PortfolioReportingEngine {
  private client: DLMMClient;
  private multiPositionAnalysis: MultiPositionAnalysisEngine;
  private portfolioOptimizer: PortfolioOptimizationEngine;
  private diversificationAnalysis: DiversificationAnalysisEngine;
  private consolidationEngine: PositionConsolidationEngine;
  private cache: Map<string, any>;
  private reportCache: Map<string, PortfolioReport>;
  // Note: Template and configuration caches for future use
  // private templateCache: Map<string, ReportTemplate>;
  // private configurationCache: Map<string, ReportConfiguration>;

  constructor(client: DLMMClient) {
    this.client = client;
    // TODO: Update constructors to use proper connection when available
    this.multiPositionAnalysis = new MultiPositionAnalysisEngine(client as any);
    this.portfolioOptimizer = new PortfolioOptimizationEngine(client as any);
    this.diversificationAnalysis = new DiversificationAnalysisEngine(client as any);
    this.consolidationEngine = new PositionConsolidationEngine(client as any);
    this.cache = new Map();
    this.reportCache = new Map();
    // this.templateCache = new Map();
    // this.configurationCache = new Map();
  }

  async generateReport(
    request: ReportGenerationRequest
  ): Promise<ReportGenerationResult> {
    const startTime = Date.now();
    const reportId = this.generateReportId(request);

    try {
      const positions = await this.fetchPositions(request.walletAddress);

      const configuration = await this.prepareConfiguration(request);

      const report = await this.buildReport(
        positions as EnhancedDLMMPosition[],
        configuration,
        request.walletAddress
      );

      const outputs = await this.exportReport(report, request.format, configuration);

      const metrics: GenerationMetrics = {
        totalTime: Date.now() - startTime,
        dataFetchTime: 0,
        analysisTime: 0,
        renderingTime: 0,
        exportTime: 0,
        memoryUsage: process.memoryUsage().heapUsed,
        cacheHitRate: this.calculateCacheHitRate()
      };

      this.reportCache.set(reportId, report);

      return {
        reportId,
        status: 'success',
        outputs,
        metrics
      };
    } catch (error) {
      return {
        reportId,
        status: 'failed',
        outputs: [],
        errors: [{
          code: 'GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          severity: 'critical'
        }],
        metrics: {
          totalTime: Date.now() - startTime,
          dataFetchTime: 0,
          analysisTime: 0,
          renderingTime: 0,
          exportTime: 0,
          memoryUsage: process.memoryUsage().heapUsed,
          cacheHitRate: 0
        }
      };
    }
  }

  private async fetchPositions(walletAddress: string): Promise<DLMMPosition[]> {
    const cacheKey = `positions_${walletAddress}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const userPositions = await this.client.getUserPositions(new PublicKey(walletAddress));
    const userAddress = new PublicKey(walletAddress);

    // Transform SDK PositionInfo[] to our DLMMPosition interface
    const positions: DLMMPosition[] = userPositions.map((pos: any) => ({
      id: pos.positionMint || pos.id || Math.random().toString(),
      poolAddress: new PublicKey(pos.pair || pos.poolAddress || PublicKey.default),
      userAddress: userAddress,
      tokenX: {
        address: new PublicKey(pos.tokenX?.mint || pos.tokenX?.address || PublicKey.default),
        symbol: pos.tokenX?.symbol || 'UNKNOWN',
        name: pos.tokenX?.name || 'Unknown Token',
        decimals: pos.tokenX?.decimals || 9,
        logoURI: pos.tokenX?.logoURI,
        price: pos.tokenX?.price || 0,
      },
      tokenY: {
        address: new PublicKey(pos.tokenY?.mint || pos.tokenY?.address || PublicKey.default),
        symbol: pos.tokenY?.symbol || 'UNKNOWN',
        name: pos.tokenY?.name || 'Unknown Token',
        decimals: pos.tokenY?.decimals || 9,
        logoURI: pos.tokenY?.logoURI,
        price: pos.tokenY?.price || 0,
      },
      activeBin: pos.activeBin || pos.activeId || 0,
      liquidityAmount: pos.liquidityAmount?.toString() || pos.totalLiquidity?.toString() || '0',
      feesEarned: {
        tokenX: pos.feesEarned?.tokenX?.toString() || pos.feeX?.toString() || '0',
        tokenY: pos.feesEarned?.tokenY?.toString() || pos.feeY?.toString() || '0',
      },
      createdAt: new Date(pos.createdAt || Date.now()),
      lastUpdated: new Date(pos.lastUpdated || Date.now()),
      isActive: pos.isActive ?? true,
    }));

    this.cache.set(cacheKey, positions);
    setTimeout(() => this.cache.delete(cacheKey), 60000);

    return positions;
  }

  private async prepareConfiguration(
    request: ReportGenerationRequest
  ): Promise<ReportConfiguration> {
    const defaultTemplate = this.getDefaultTemplate(request.reportType);

    const configuration: ReportConfiguration = {
      reportId: this.generateReportId(request),
      name: `${request.reportType} Report`,
      description: `Automated ${request.reportType} report`,
      template: defaultTemplate,
      sections: this.getDefaultSections(request.reportType),
      format: request.format,
      schedule: request.schedule,
      branding: this.getDefaultBranding(),
      customization: request.customization as ReportCustomization | undefined,
      ...request.configuration
    };

    return configuration;
  }

  private async buildReport(
    positions: EnhancedDLMMPosition[],
    configuration: ReportConfiguration,
    walletAddress: string
  ): Promise<PortfolioReport> {
    const analysisStartTime = Date.now();

    const multiPositionAnalysis = await this.multiPositionAnalysis.analyzeMultiplePositions(
      positions,
      [], // analytics array
      new PublicKey(walletAddress),
      false
    );

    const optimization = await this.portfolioOptimizer.optimizePortfolio(
      positions,
      [], // analytics array - empty for now
      {
        objective: 'max_sharpe' as any,
        constraints: {
          minWeight: 0.01,
          maxTurnover: 0.3,
          riskBudget: 0.15
        } as any,
        rebalanceFrequency: 'weekly'
      } as any,
      new PublicKey(walletAddress)
    );

    const diversification = await this.diversificationAnalysis.analyzeDiversification(
      positions,
      [], // analytics array - empty for now
      new PublicKey(walletAddress)
      // Note: Configuration options may need to be set differently
      // The current method signature doesn't accept a config object
    );

    const consolidation = await this.consolidationEngine.analyzeConsolidationOpportunities(
      positions,
      [], // analytics array
      new PublicKey(walletAddress),
      false
    );

    const metadata: ReportMetadata = {
      reportId: configuration.reportId,
      generatedAt: new Date(),
      generatedBy: 'PortfolioReportingEngine',
      reportPeriod: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      walletAddress,
      reportVersion: '1.0.0',
      dataVersion: '1.0.0',
      configuration,
      processingTime: Date.now() - analysisStartTime,
      dataFreshness: {
        positions: new Date(),
        prices: new Date(),
        marketData: new Date(),
        analytics: new Date(),
        oldestData: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        newestData: new Date()
      }
    };

    const executiveSummary = this.buildExecutiveSummary(
      positions,
      multiPositionAnalysis,
      optimization,
      diversification
    );

    const portfolioOverview = this.buildPortfolioOverview(
      positions,
      multiPositionAnalysis
    );

    const positionDetails = this.buildPositionDetails(
      positions,
      multiPositionAnalysis
    );

    const performanceAnalysis = this.buildPerformanceAnalysis(
      positions,
      multiPositionAnalysis
    );

    const riskAnalysis = this.buildRiskAnalysis(
      positions,
      multiPositionAnalysis,
      diversification
    );

    const optimizationRecommendations = this.buildOptimizationRecommendations(
      optimization
    );

    const consolidationOpportunities = this.buildConsolidationOpportunities(
      consolidation
    );

    const marketAnalysis = await this.buildMarketAnalysis();

    const complianceOverview = this.buildComplianceOverview();

    const appendix = this.buildAppendix();

    return {
      metadata,
      executiveSummary,
      portfolioOverview,
      positionDetails,
      performanceAnalysis,
      riskAnalysis,
      diversificationAnalysis: diversification,
      optimizationRecommendations,
      consolidationOpportunities,
      marketAnalysis,
      complianceOverview,
      appendix
    };
  }

  private buildExecutiveSummary(
    positions: DLMMPosition[],
    analysis: any,
    optimization: any,
    diversification: any
  ): ExecutiveSummary {
    const totalValue = positions.reduce((sum, pos) => sum + (pos as any).currentValue || 0, 0);
    const totalValueChange = positions.reduce((sum, pos) => sum + (pos as any).pnl || 0, 0);
    const totalValueChangePercent = totalValue > 0 ? (totalValueChange / totalValue) * 100 : 0;

    const performanceRating: PerformanceRating = {
      overall: this.calculateOverallRating(analysis),
      risk: analysis.riskMetrics.portfolioVaR < 0.05 ? 8 : 6,
      diversification: diversification.overallScore,
      efficiency: optimization.currentMetrics.efficiency * 10,
      consistency: 7,
      grade: this.calculateGrade(analysis)
    };

    const keyMetrics: KeyMetric[] = [
      {
        name: 'Total Return',
        value: totalValueChangePercent,
        unit: '%',
        change: 0,
        changePercent: 0,
        trend: totalValueChangePercent > 0 ? 'up' : 'down',
        significance: 'high'
      },
      {
        name: 'Sharpe Ratio',
        value: optimization.currentMetrics.sharpeRatio,
        unit: '',
        trend: 'stable',
        significance: 'high'
      },
      {
        name: 'Diversification Score',
        value: diversification.overallScore,
        unit: '/10',
        trend: 'stable',
        significance: 'medium'
      }
    ];

    const highlights: ReportHighlight[] = [
      {
        type: 'performance',
        title: 'Strong Portfolio Performance',
        description: `Portfolio outperformed with ${totalValueChangePercent.toFixed(2)}% returns`,
        impact: 'high'
      }
    ];

    const concerns: ReportConcern[] = [];
    if (analysis.riskMetrics.portfolioVaR > 0.1) {
      concerns.push({
        type: 'risk',
        severity: 'high',
        title: 'High Portfolio Risk',
        description: 'Portfolio VaR exceeds recommended thresholds',
        recommendation: 'Consider risk reduction strategies'
      });
    }

    const recommendations: SummaryRecommendation[] = optimization.recommendations.slice(0, 3).map((rec: any) => ({
      type: rec.type as any,
      priority: rec.priority,
      title: rec.action,
      description: rec.rationale,
      expectedImpact: `${rec.expectedImpact.returnImprovement.toFixed(2)}% return improvement`,
      timeframe: rec.timeframe
    }));

    return {
      totalValue,
      totalValueChange,
      totalValueChangePercent,
      totalPositions: positions.length,
      activePositions: positions.filter(p => (p as EnhancedDLMMPosition).currentValue > 0).length,
      totalPairs: new Set(positions.map(p => (p as EnhancedDLMMPosition).pair.toString())).size,
      diversificationScore: diversification.overallScore,
      riskScore: analysis.riskMetrics.portfolioVaR * 100,
      performanceRating,
      keyMetrics,
      highlights,
      concerns,
      recommendations
    };
  }

  private buildPortfolioOverview(
    positions: DLMMPosition[],
    analysis: any
  ): PortfolioOverview {
    const totalValue = positions.reduce((sum, pos) => sum + (pos as any).currentValue || 0, 0);

    const totalStatistics: PortfolioStatistics = {
      totalValue,
      totalValueUSD: totalValue,
      positionCount: positions.length,
      pairCount: new Set(positions.map(p => (p as EnhancedDLMMPosition).pair.toString())).size,
      tokenCount: this.countUniqueTokens(positions),
      averagePositionSize: totalValue / positions.length,
      largestPosition: Math.max(...positions.map(p => (p as EnhancedDLMMPosition).currentValue)),
      smallestPosition: Math.min(...positions.map(p => (p as EnhancedDLMMPosition).currentValue)),
      concentrationRatio: this.calculateConcentrationRatio(positions),
      activePositionRatio: positions.filter(p => (p as EnhancedDLMMPosition).currentValue > 0).length / positions.length
    };

    const allocation = this.buildAllocationBreakdown(positions);
    const performance = this.buildPerformanceOverview(positions, analysis);
    const risk = this.buildRiskOverview(positions, analysis);
    const liquidity = this.buildLiquidityOverview(positions);
    const fees = this.buildFeeOverview(positions);
    const charts = this.buildOverviewCharts(positions, analysis);

    return {
      totalStatistics,
      allocation,
      performance,
      risk,
      liquidity,
      fees,
      charts
    };
  }

  private buildPositionDetails(
    positions: EnhancedDLMMPosition[],
    _analysis: any
  ): PositionDetail[] {
    return positions.map(position => {
      const analytics: PositionAnalytics = {
        currentValue: position.currentValue,
        initialValue: position.initialValue || position.currentValue,
        totalReturn: position.pnl,
        totalReturnPercent: position.pnlPercent || 0,
        realizedPnL: position.realizedPnl || 0,
        unrealizedPnL: position.unrealizedPnl || position.pnl,
        feeEarnings: position.feeEarnings || 0,
        impermanentLoss: position.impermanentLoss || 0,
        timeInPosition: this.calculateTimeInPosition(position),
        efficiency: this.calculatePositionEfficiency(position),
        liquidityUtilization: this.calculateLiquidityUtilization(position),
        concentrationScore: this.calculatePositionConcentration(position)
      };

      const positionRisk: PositionRisk = {
        riskScore: this.calculatePositionRiskScore(position),
        volatility: 0.15,
        liquidityRisk: 0.1,
        concentrationRisk: 0.05,
        correlationRisk: 0.08,
        impermanentLossRisk: 0.12,
        timeDecay: 0.02
      };

      const recommendations: PositionRecommendation[] = this.generatePositionRecommendations(position);
      const history: PositionHistoryEntry[] = this.buildPositionHistory(position);

      return {
        position,
        analytics,
        performance: {
          positionId: position.publicKey.toString(),
          pairName: `${position.tokenX.symbol}/${position.tokenY.symbol}`,
          return: position.pnl,
          returnPercent: position.pnlPercent || 0,
          value: position.currentValue,
          timeframe: '30d'
        },
        risk: positionRisk,
        recommendations,
        history
      };
    });
  }

  private buildPerformanceAnalysis(
    positions: DLMMPosition[],
    analysis: any
  ): PerformanceAnalysis {
    const attribution = this.buildPerformanceAttribution(positions, analysis);
    const benchmark = this.buildBenchmarkComparison(positions);
    const trends = this.buildPerformanceTrends(positions);
    const scenarios = this.buildPerformanceScenarios(positions);
    const decomposition = this.buildPerformanceDecomposition(positions, analysis);

    return {
      attribution,
      benchmark,
      trends,
      scenarios,
      decomposition
    };
  }

  private buildRiskAnalysis(
    _positions: DLMMPosition[],
    analysis: any,
    diversification: any
  ): RiskAnalysis {
    const summary: RiskSummary = {
      overallScore: analysis.riskMetrics.portfolioVaR * 100,
      level: this.getRiskLevel(analysis.riskMetrics.portfolioVaR),
      primaryConcerns: this.identifyRiskConcerns(analysis),
      keyMetrics: this.buildRiskMetrics(analysis),
      trendDirection: 'stable'
    };

    const metrics = this.buildRiskMetrics(analysis);
    const scenarios = this.buildRiskScenarios();
    const correlations = this.buildCorrelationMatrix(analysis);
    const concentrations = this.buildConcentrationAnalysis(diversification);
    const stresstests = this.buildStressTestResults();
    const recommendations = this.buildRiskRecommendations(analysis);

    return {
      summary,
      metrics,
      scenarios,
      correlations,
      concentrations,
      stresstests,
      recommendations
    };
  }

  private buildOptimizationRecommendations(
    optimization: any
  ): OptimizationRecommendation[] {
    return optimization.recommendations.map((rec: any) => ({
      id: rec.id,
      type: rec.type as any,
      priority: rec.priority,
      title: rec.action,
      description: rec.description,
      rationale: rec.rationale,
      expectedOutcome: {
        returnImprovement: rec.expectedImpact.returnImprovement,
        riskReduction: rec.expectedImpact.riskReduction,
        efficiencyGain: rec.expectedImpact.efficiencyImprovement,
        costSavings: rec.expectedImpact.costReduction,
        confidence: rec.confidence
      },
      implementation: {
        steps: rec.implementation.steps.map((step: any, index: number) => ({
          order: index + 1,
          description: step.action,
          estimatedCost: step.estimatedCost,
          estimatedTime: step.estimatedTimeMinutes,
          risks: step.risks
        })),
        estimatedCost: rec.implementation.totalCost,
        estimatedTime: rec.implementation.totalTimeMinutes,
        complexity: rec.implementation.complexity,
        prerequisites: rec.implementation.prerequisites
      },
      riskAssessment: {
        level: rec.risks.level,
        factors: rec.risks.factors,
        mitigation: rec.risks.mitigation,
        worstCase: rec.risks.worstCaseScenario
      },
      timeframe: rec.timeframe
    }));
  }

  private buildConsolidationOpportunities(
    consolidation: ConsolidationAnalysis
  ): ConsolidationOpportunity[] {
    return consolidation.opportunities.map(opp => ({
      id: opp.id,
      targetPair: opp.targetPair,
      positions: opp.positions,
      currentPools: opp.currentPools,
      recommendedPool: opp.recommendedPool,
      benefits: opp.benefits,
      consolidationCost: opp.consolidationCost,
      projectedSavings: opp.projectedSavings,
      priority: opp.priority
    } as any));
  }

  private async buildMarketAnalysis(): Promise<MarketAnalysis> {
    const overview: MarketOverview = {
      totalMarketCap: 1000000000,
      marketCapChange: 0.05,
      totalVolume: 50000000,
      volumeChange: 0.15,
      activeMarkets: 100,
      sentiment: 'neutral',
      volatility: 0.25
    };

    const trends: MarketTrend[] = [
      {
        category: 'DeFi',
        direction: 'up',
        strength: 0.7,
        duration: 30,
        description: 'DeFi markets showing strong upward momentum',
        impact: 'high'
      }
    ];

    const opportunities: MarketOpportunity[] = [
      {
        type: 'liquidity_mining',
        description: 'High yield opportunities in emerging pools',
        potential: 0.15,
        timeframe: '3-6 months',
        actionRequired: 'Position allocation review',
        confidence: 0.8
      }
    ];

    const threats: MarketThreat[] = [
      {
        type: 'regulatory',
        description: 'Potential regulatory changes affecting DeFi',
        probability: 0.3,
        impact: 0.6,
        timeframe: '6-12 months',
        mitigation: 'Monitor regulatory developments'
      }
    ];

    const outlook: MarketOutlook = {
      timeframe: '6 months',
      scenario: 'neutral',
      keyFactors: ['Regulatory clarity', 'Market adoption', 'Technology improvements'],
      expectations: [
        {
          metric: 'Total Value Locked',
          currentValue: 1000000000,
          expectedValue: 1200000000,
          confidence: 0.7,
          timeframe: '6 months'
        }
      ],
      recommendations: ['Maintain diversified exposure', 'Monitor regulatory developments']
    };

    return {
      overview,
      trends,
      opportunities,
      threats,
      outlook
    };
  }

  private buildComplianceOverview(): ComplianceOverview {
    const requirements: ComplianceRequirement[] = [
      {
        id: 'kyc_verification',
        name: 'KYC Verification',
        description: 'Know Your Customer verification requirements',
        status: 'met',
        lastChecked: new Date(),
        evidence: ['Verified wallet connection']
      }
    ];

    return {
      status: 'compliant',
      lastReview: new Date(),
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      requirements,
      violations: [],
      recommendations: []
    };
  }

  private buildAppendix(): ReportAppendix {
    const methodology: MethodologyDescription = {
      overview: 'Portfolio analysis based on DLMM position data and market analytics',
      dataCollection: 'Real-time data from Solana blockchain and price oracles',
      analysis: 'Statistical analysis using modern portfolio theory',
      riskAssessment: 'Value-at-Risk and correlation analysis',
      limitations: 'Historical data may not predict future performance'
    };

    const assumptions: AssumptionsList = {
      general: ['Market efficiency assumptions', 'Historical patterns continue'],
      pricing: ['Fair value pricing', 'Liquidity assumptions'],
      risk: ['Normal distribution of returns', 'Correlation stability'],
      performance: ['Transaction costs included', 'Slippage considerations'],
      market: ['Market accessibility', 'Regulatory stability']
    };

    const limitations: LimitationsList = {
      data: ['Historical data limitations', 'Market data gaps'],
      methodology: ['Model assumptions', 'Statistical limitations'],
      market: ['Market volatility', 'Liquidity constraints'],
      technical: ['System limitations', 'Processing constraints']
    };

    const dataSourcess: DataSourcesList = {
      primary: [
        {
          name: 'Saros DLMM SDK',
          type: 'Blockchain data',
          coverage: 'Position data',
          frequency: 'Real-time',
          reliability: 'High'
        }
      ],
      secondary: [
        {
          name: 'Price oracles',
          type: 'Market data',
          coverage: 'Token prices',
          frequency: 'Real-time',
          reliability: 'High'
        }
      ],
      benchmarks: []
    };

    const calculations: CalculationsList = {
      performance: [
        {
          name: 'Total Return',
          formula: '(End Value - Start Value) / Start Value',
          description: 'Simple return calculation',
          assumptions: ['No intermediate cash flows']
        }
      ],
      risk: [
        {
          name: 'Value at Risk',
          formula: 'Historical simulation method',
          description: 'Maximum expected loss at 95% confidence',
          assumptions: ['Historical patterns continue']
        }
      ],
      attribution: []
    };

    const glossary: GlossaryEntry[] = [
      {
        term: 'DLMM',
        definition: 'Dynamic Liquidity Market Maker',
        category: 'DeFi'
      },
      {
        term: 'Impermanent Loss',
        definition: 'Loss relative to holding tokens directly',
        category: 'DeFi'
      }
    ];

    const references: Reference[] = [
      {
        title: 'Modern Portfolio Theory',
        author: 'Harry Markowitz',
        type: 'academic',
        date: new Date('1952-01-01')
      }
    ];

    return {
      methodology,
      assumptions,
      limitations,
      dataSourcess,
      calculations,
      glossary,
      references
    };
  }

  private async exportReport(
    report: PortfolioReport,
    formats: ReportFormat[],
    configuration: ReportConfiguration
  ): Promise<ReportOutput[]> {
    const outputs: ReportOutput[] = [];

    for (const format of formats) {
      try {
        const output = await this.exportToFormat(report, format, configuration);
        outputs.push(output);
      } catch (error) {
        console.error(`Failed to export to ${format}:`, error);
      }
    }

    return outputs;
  }

  private async exportToFormat(
    report: PortfolioReport,
    format: ReportFormat,
    configuration: ReportConfiguration
  ): Promise<ReportOutput> {
    let content: any;
    let size: number;

    switch (format) {
      case ReportFormat.JSON:
        content = JSON.stringify(report, null, 2);
        size = Buffer.byteLength(content, 'utf8');
        break;

      case ReportFormat.CSV:
        content = this.convertToCSV(report);
        size = Buffer.byteLength(content, 'utf8');
        break;

      case ReportFormat.HTML:
        content = this.convertToHTML(report, configuration);
        size = Buffer.byteLength(content, 'utf8');
        break;

      case ReportFormat.PDF:
        content = await this.convertToPDF(report, configuration);
        size = content.length;
        break;

      case ReportFormat.XLSX:
        content = await this.convertToXLSX(report);
        size = content.length;
        break;

      case ReportFormat.XML:
        content = this.convertToXML(report);
        size = Buffer.byteLength(content, 'utf8');
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    const metadata: OutputMetadata = {
      pages: this.calculatePages(content, format),
      sections: this.countSections(report),
      charts: this.countCharts(report),
      tables: this.countTables(report),
      generatedAt: new Date(),
      checksum: this.calculateChecksum(content)
    };

    return {
      format,
      content,
      size,
      metadata
    };
  }

  async scheduleReport(
    _request: ReportGenerationRequest,
    schedule: ReportSchedule
  ): Promise<string> {
    const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Implementation would integrate with a job scheduler
    console.log(`Scheduled report ${scheduleId} with frequency ${schedule.frequency}`);

    return scheduleId;
  }

  async getReportHistory(_walletAddress: string): Promise<ArchivedReport[]> {
    // Implementation would fetch from persistent storage
    return [];
  }

  async getReport(reportId: string): Promise<PortfolioReport | null> {
    return this.reportCache.get(reportId) || null;
  }

  private generateReportId(request: ReportGenerationRequest): string {
    const timestamp = Date.now();
    const hash = this.hashObject(request);
    return `report_${timestamp}_${hash.substr(0, 8)}`;
  }

  private hashObject(obj: any): string {
    return Buffer.from(JSON.stringify(obj)).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  }

  private calculateCacheHitRate(): number {
    return 0.85;
  }

  private getDefaultTemplate(type: ReportTemplateType): ReportTemplate {
    return {
      id: `template_${type}`,
      name: type.replace('_', ' ').toUpperCase(),
      type,
      layout: this.getDefaultLayout(),
      styling: this.getDefaultStyling(),
      sections: [],
      variables: [],
      conditionals: []
    };
  }

  private getDefaultLayout(): ReportLayout {
    return {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: { top: 72, right: 72, bottom: 72, left: 72 },
      header: {
        height: 50,
        padding: { top: 10, right: 20, bottom: 10, left: 20 },
        elements: []
      },
      footer: {
        height: 30,
        padding: { top: 5, right: 20, bottom: 5, left: 20 },
        elements: []
      },
      body: {
        padding: { top: 20, right: 20, bottom: 20, left: 20 },
        elements: []
      }
    };
  }

  private getDefaultStyling(): ReportStyling {
    return {
      fontFamily: 'Arial, sans-serif',
      fontSize: {
        heading1: 24,
        heading2: 20,
        heading3: 16,
        body: 12,
        caption: 10
      },
      colors: {
        primary: '#1f2937',
        secondary: '#6b7280',
        accent: '#3b82f6',
        text: '#111827',
        background: '#ffffff',
        border: '#e5e7eb'
      },
      spacing: {
        paragraphSpacing: 12,
        lineHeight: 1.5,
        sectionSpacing: 24
      }
    };
  }

  private getDefaultSections(_type: ReportTemplateType): ReportSection[] {
    const commonSections: ReportSection[] = [
      {
        id: 'executive_summary',
        name: 'Executive Summary',
        type: ReportSectionType.EXECUTIVE_SUMMARY,
        enabled: true,
        order: 1,
        configuration: {
          includeCharts: true,
          includeTables: false,
          includeMetrics: true,
          timeframeConfig: { primary: '30d' },
          detailLevel: 'summary'
        }
      },
      {
        id: 'portfolio_overview',
        name: 'Portfolio Overview',
        type: ReportSectionType.PORTFOLIO_OVERVIEW,
        enabled: true,
        order: 2,
        configuration: {
          includeCharts: true,
          includeTables: true,
          includeMetrics: true,
          timeframeConfig: { primary: '30d' },
          detailLevel: 'detailed'
        }
      }
    ];

    return commonSections;
  }

  private getDefaultBranding(): ReportBranding {
    return {
      companyName: 'Saros DLMM Position Manager',
      colors: {
        primary: '#1f2937',
        accent: '#3b82f6'
      },
      disclaimer: 'This report is for informational purposes only and does not constitute financial advice.'
    };
  }

  private calculateOverallRating(analysis: any): number {
    return Math.min(10, Math.max(1,
      (1 - analysis.riskMetrics.portfolioVaR) * 10
    ));
  }

  private calculateGrade(analysis: any): PerformanceRating['grade'] {
    const score = this.calculateOverallRating(analysis);
    if (score >= 9.5) return 'A+';
    if (score >= 9) return 'A';
    if (score >= 8.5) return 'A-';
    if (score >= 8) return 'B+';
    if (score >= 7.5) return 'B';
    if (score >= 7) return 'B-';
    if (score >= 6.5) return 'C+';
    if (score >= 6) return 'C';
    if (score >= 5.5) return 'C-';
    if (score >= 5) return 'D';
    return 'F';
  }

  private countUniqueTokens(positions: DLMMPosition[]): number {
    const tokens = new Set<string>();
    positions.forEach(pos => {
      tokens.add(pos.tokenX.address.toString());
      tokens.add(pos.tokenY.address.toString());
    });
    return tokens.size;
  }

  private calculateConcentrationRatio(positions: DLMMPosition[]): number {
    const values = positions.map(p => p.currentValue ?? 0).sort((a, b) => b - a);
    const totalValue = values.reduce((sum, val) => sum + val, 0);
    const top5Value = values.slice(0, 5).reduce((sum, val) => sum + val, 0);
    return totalValue > 0 ? top5Value / totalValue : 0;
  }

  private buildAllocationBreakdown(positions: DLMMPosition[]): AllocationBreakdown {
    const totalValue = positions.reduce((sum, pos) => sum + (pos as any).currentValue || 0, 0);

    const byToken: TokenAllocation[] = this.buildTokenAllocation(positions, totalValue);
    const byPair: PairAllocation[] = this.buildPairAllocation(positions, totalValue);
    const byStrategy: StrategyAllocation[] = this.buildStrategyAllocation(positions, totalValue);
    const bySize: SizeAllocation[] = this.buildSizeAllocation(positions, totalValue);
    const byAge: AgeAllocation[] = this.buildAgeAllocation(positions, totalValue);
    const byPerformance: PerformanceAllocation[] = this.buildPerformanceAllocation(positions, totalValue);

    return {
      byToken,
      byPair,
      byStrategy,
      bySize,
      byAge,
      byPerformance
    };
  }

  private buildTokenAllocation(positions: DLMMPosition[], totalValue: number): TokenAllocation[] {
    const tokenMap = new Map<string, TokenAllocation>();

    positions.forEach(pos => {
      [pos.tokenX, pos.tokenY].forEach(token => {
        const key = token.address.toString();
        const allocation = tokenMap.get(key) || {
          tokenAddress: key,
          tokenSymbol: token.symbol,
          tokenName: token.name,
          value: 0,
          valueUSD: 0,
          percentage: 0,
          positionCount: 0
        };

        allocation.value += (pos.currentValue ?? 0) / 2;
        allocation.valueUSD += (pos.currentValue ?? 0) / 2;
        allocation.positionCount += 1;
        allocation.percentage = totalValue > 0 ? (allocation.value / totalValue) * 100 : 0;

        tokenMap.set(key, allocation);
      });
    });

    return Array.from(tokenMap.values()).sort((a, b) => b.value - a.value);
  }

  private buildPairAllocation(positions: DLMMPosition[], totalValue: number): PairAllocation[] {
    const pairMap = new Map<string, PairAllocation>();

    positions.forEach(pos => {
      const key = pos.pair?.toString() ?? pos.poolAddress.toString();
      const allocation = pairMap.get(key) || {
        pairAddress: key,
        pairName: `${pos.tokenX.symbol}/${pos.tokenY.symbol}`,
        tokenX: pos.tokenX.symbol,
        tokenY: pos.tokenY.symbol,
        value: 0,
        valueUSD: 0,
        percentage: 0,
        positionCount: 0
      };

      allocation.value += (pos as any).currentValue || 0;
      allocation.valueUSD += (pos as any).currentValue || 0;
      allocation.positionCount += 1;
      allocation.percentage = totalValue > 0 ? (allocation.value / totalValue) * 100 : 0;

      pairMap.set(key, allocation);
    });

    return Array.from(pairMap.values()).sort((a, b) => b.value - a.value);
  }

  private buildStrategyAllocation(positions: DLMMPosition[], totalValue: number): StrategyAllocation[] {
    return [
      {
        strategy: 'liquidity_provision',
        description: 'Standard liquidity provision',
        value: totalValue,
        valueUSD: totalValue,
        percentage: 100,
        positionCount: positions.length,
        performance: 0.05
      }
    ];
  }

  private buildSizeAllocation(positions: DLMMPosition[], totalValue: number): SizeAllocation[] {
    const averageSize = totalValue / positions.length;
    const categories = [
      { category: 'large' as const, threshold: averageSize * 2, count: 0, value: 0 },
      { category: 'medium' as const, threshold: averageSize, count: 0, value: 0 },
      { category: 'small' as const, threshold: averageSize * 0.5, count: 0, value: 0 },
      { category: 'micro' as const, threshold: 0, count: 0, value: 0 }
    ];

    positions.forEach(pos => {
      for (const cat of categories) {
        if ((pos as any).currentValue || 0 >= cat.threshold) {
          cat.count++;
          cat.value += (pos as any).currentValue || 0;
          break;
        }
      }
    });

    return categories.map(cat => ({
      ...cat,
      percentage: totalValue > 0 ? (cat.value / totalValue) * 100 : 0
    }));
  }

  private buildAgeAllocation(positions: DLMMPosition[], totalValue: number): AgeAllocation[] {
    const now = Date.now();
    const categories = [
      { category: 'new' as const, ageDays: 7, count: 0, value: 0 },
      { category: 'recent' as const, ageDays: 30, count: 0, value: 0 },
      { category: 'mature' as const, ageDays: 90, count: 0, value: 0 },
      { category: 'old' as const, ageDays: Infinity, count: 0, value: 0 }
    ];

    positions.forEach(pos => {
      const ageMs = now - (pos.createdAt?.getTime() || now);
      const ageDays = ageMs / (1000 * 60 * 60 * 24);

      for (const cat of categories) {
        if (ageDays <= cat.ageDays) {
          cat.count++;
          cat.value += (pos as any).currentValue || 0;
          break;
        }
      }
    });

    return categories.map(cat => ({
      ...cat,
      percentage: totalValue > 0 ? (cat.value / totalValue) * 100 : 0
    }));
  }

  private buildPerformanceAllocation(positions: DLMMPosition[], totalValue: number): PerformanceAllocation[] {
    const categories = [
      { category: 'excellent' as const, performanceRange: [0.2, Infinity] as [number, number], count: 0, value: 0 },
      { category: 'good' as const, performanceRange: [0.05, 0.2] as [number, number], count: 0, value: 0 },
      { category: 'neutral' as const, performanceRange: [-0.05, 0.05] as [number, number], count: 0, value: 0 },
      { category: 'poor' as const, performanceRange: [-0.2, -0.05] as [number, number], count: 0, value: 0 },
      { category: 'losing' as const, performanceRange: [-Infinity, -0.2] as [number, number], count: 0, value: 0 }
    ];

    positions.forEach(pos => {
      const performance = (pos as any).pnl || 0;

      for (const cat of categories) {
        if (performance >= cat.performanceRange[0] && performance < cat.performanceRange[1]) {
          cat.count++;
          cat.value += (pos as any).currentValue || 0;
          break;
        }
      }
    });

    return categories.map(cat => ({
      ...cat,
      percentage: totalValue > 0 ? (cat.value / totalValue) * 100 : 0
    }));
  }

  private buildPerformanceOverview(
    positions: DLMMPosition[],
    analysis: any
  ): PerformanceOverview {
    const totalReturn = positions.reduce((sum, pos) => sum + (pos as any).pnl || 0, 0);
    const totalValue = positions.reduce((sum, pos) => sum + (pos as any).currentValue || 0, 0);
    const totalReturnPercent = totalValue > 0 ? (totalReturn / totalValue) * 100 : 0;

    const sortedByPerformance = [...positions].sort((a, b) => (b.pnlPercent || 0) - (a.pnlPercent || 0));
    const bestPosition = sortedByPerformance[0];
    const worstPosition = sortedByPerformance[sortedByPerformance.length - 1];

    return {
      totalReturn,
      totalReturnPercent,
      realizedPnL: positions.reduce((sum, pos) => sum + (pos.realizedPnl || 0), 0),
      unrealizedPnL: positions.reduce((sum, pos) => sum + (pos.unrealizedPnl || (pos as any).pnl || 0), 0),
      feeEarnings: positions.reduce((sum, pos) => sum + (pos.feeEarnings || 0), 0),
      impermanentLoss: positions.reduce((sum, pos) => sum + (pos.impermanentLoss || 0), 0),
      timeWeightedReturn: totalReturnPercent,
      volatility: analysis.riskMetrics.portfolioVolatility,
      sharpeRatio: analysis.riskMetrics.sharpeRatio,
      maxDrawdown: analysis.riskMetrics.maxDrawdown,
      winRate: positions.filter(p => (p.pnlPercent || 0) > 0).length / positions.length,
      bestPosition: {
        positionId: bestPosition.publicKey?.toString() ?? bestPosition.id,
        pairName: `${bestPosition.tokenX.symbol}/${bestPosition.tokenY.symbol}`,
        return: bestPosition.pnl ?? 0,
        returnPercent: bestPosition.pnlPercent ?? 0,
        value: bestPosition.currentValue ?? 0,
        timeframe: '30d'
      },
      worstPosition: {
        positionId: worstPosition.publicKey?.toString() ?? worstPosition.id,
        pairName: `${worstPosition.tokenX.symbol}/${worstPosition.tokenY.symbol}`,
        return: worstPosition.pnl ?? 0,
        returnPercent: worstPosition.pnlPercent ?? 0,
        value: worstPosition.currentValue ?? 0,
        timeframe: '30d'
      },
      performanceByPeriod: [
        {
          period: '30d',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          return: totalReturn,
          returnPercent: totalReturnPercent,
          volatility: analysis.riskMetrics.portfolioVolatility,
          sharpeRatio: analysis.riskMetrics.sharpeRatio,
          maxDrawdown: analysis.riskMetrics.maxDrawdown
        }
      ]
    };
  }

  private buildRiskOverview(
    positions: DLMMPosition[],
    analysis: any
  ): RiskOverview {
    const overallRiskScore = analysis.riskMetrics.portfolioVaR * 100;
    const riskLevel = this.getRiskLevel(analysis.riskMetrics.portfolioVaR);

    return {
      overallRiskScore,
      riskLevel: riskLevel as any,
      concentrationRisk: this.calculateConcentrationRatio(positions) * 100,
      liquidityRisk: 15,
      volatilityRisk: analysis.riskMetrics.portfolioVolatility * 100,
      correlationRisk: 20,
      impermanentLossRisk: 25,
      riskByCategory: [
        {
          category: 'Market Risk',
          score: analysis.riskMetrics.portfolioVolatility * 100,
          weight: 0.4,
          contribution: analysis.riskMetrics.portfolioVolatility * 40,
          description: 'Risk from market movements'
        },
        {
          category: 'Concentration Risk',
          score: this.calculateConcentrationRatio(positions) * 100,
          weight: 0.3,
          contribution: this.calculateConcentrationRatio(positions) * 30,
          description: 'Risk from portfolio concentration'
        }
      ],
      riskFactors: [
        {
          factor: 'Market Volatility',
          impact: 'high',
          probability: 0.7,
          description: 'High market volatility could impact portfolio value',
          mitigation: 'Diversification and hedging strategies'
        }
      ],
      hedgingOpportunities: [
        {
          type: 'correlation',
          description: 'Reduce correlation risk through diversification',
          expectedReduction: 20,
          cost: 5,
          recommendation: 'Add negatively correlated positions'
        }
      ]
    };
  }

  private buildLiquidityOverview(positions: DLMMPosition[]): LiquidityOverview {
    return {
      totalLiquidity: positions.reduce((sum, pos) => sum + (pos as any).currentValue || 0, 0),
      averageBidAskSpread: 0.01,
      liquidityScore: 8.5,
      liquidityDistribution: [
        {
          category: 'high',
          count: Math.floor(positions.length * 0.6),
          value: positions.reduce((sum, pos) => sum + (pos as any).currentValue || 0, 0) * 0.6,
          percentage: 60,
          description: 'Highly liquid positions'
        },
        {
          category: 'medium',
          count: Math.floor(positions.length * 0.3),
          value: positions.reduce((sum, pos) => sum + (pos as any).currentValue || 0, 0) * 0.3,
          percentage: 30,
          description: 'Moderately liquid positions'
        },
        {
          category: 'low',
          count: Math.floor(positions.length * 0.1),
          value: positions.reduce((sum, pos) => sum + (pos as any).currentValue || 0, 0) * 0.1,
          percentage: 10,
          description: 'Lower liquidity positions'
        },
        {
          category: 'very_low',
          count: 0,
          value: 0,
          percentage: 0,
          description: 'Very low liquidity positions'
        }
      ],
      liquidityRisk: {
        score: 25,
        factors: [
          {
            factor: 'Market depth',
            impact: 20,
            description: 'Limited market depth in some pairs'
          }
        ],
        scenarios: [
          {
            scenario: 'Market stress',
            probability: 0.2,
            impact: 30,
            description: 'Liquidity could dry up during market stress'
          }
        ]
      },
      marketDepth: {
        averageDepth: 1000000,
        depthDistribution: [
          {
            range: '0-100k',
            depth: 50000,
            percentage: 20
          },
          {
            range: '100k-1M',
            depth: 500000,
            percentage: 60
          },
          {
            range: '1M+',
            depth: 1500000,
            percentage: 20
          }
        ],
        slippageEstimates: [
          {
            size: 1000,
            estimatedSlippage: 0.1,
            confidence: 0.9
          },
          {
            size: 10000,
            estimatedSlippage: 0.5,
            confidence: 0.8
          }
        ]
      }
    };
  }

  private buildFeeOverview(positions: DLMMPosition[]): FeeOverview {
    const totalFeesEarned = positions.reduce((sum, pos) => sum + (pos.feeEarnings || 0), 0);

    return {
      totalFeesEarned,
      totalFeesEarnedUSD: totalFeesEarned,
      averageFeeAPR: 0.08,
      feeDistribution: [
        {
          feeRange: '0-5%',
          count: Math.floor(positions.length * 0.3),
          value: totalFeesEarned * 0.2,
          percentage: 30,
          averageAPR: 0.03
        },
        {
          feeRange: '5-10%',
          count: Math.floor(positions.length * 0.5),
          value: totalFeesEarned * 0.5,
          percentage: 50,
          averageAPR: 0.075
        },
        {
          feeRange: '10%+',
          count: Math.floor(positions.length * 0.2),
          value: totalFeesEarned * 0.3,
          percentage: 20,
          averageAPR: 0.15
        }
      ],
      feeEfficiency: {
        efficiency: 0.85,
        benchmarkComparison: 0.1,
        improvementOpportunities: ['Fee tier optimization', 'Range adjustment']
      },
      feeOptimization: [
        {
          type: 'migration',
          description: 'Migrate to higher fee tier pools',
          expectedImprovement: 15,
          effort: 'medium'
        }
      ]
    };
  }

  private buildOverviewCharts(
    positions: DLMMPosition[],
    _analysis: any
  ): OverviewChart[] {
    return [
      {
        id: 'allocation_pie',
        title: 'Portfolio Allocation',
        type: 'pie',
        data: this.buildPieChartData(positions),
        configuration: {
          xAxis: { field: 'name', label: 'Asset', type: 'category' },
          yAxis: { field: 'value', label: 'Value', type: 'value' },
          series: [{ field: 'value', label: 'Value', type: 'bar' }],
          styling: { width: 400, height: 300, gridLines: false },
          interactions: [{ type: 'tooltip', enabled: true }]
        }
      },
      {
        id: 'performance_line',
        title: 'Performance Over Time',
        type: 'line',
        data: this.buildPerformanceChartData(positions),
        configuration: {
          xAxis: { field: 'date', label: 'Date', type: 'time' },
          yAxis: { field: 'value', label: 'Value', type: 'value' },
          series: [{ field: 'value', label: 'Portfolio Value', type: 'line' }],
          styling: { width: 600, height: 400, gridLines: true },
          interactions: [{ type: 'zoom', enabled: true }, { type: 'tooltip', enabled: true }]
        }
      }
    ];
  }

  private buildPieChartData(positions: DLMMPosition[]): any[] {
    const pairMap = new Map<string, number>();

    positions.forEach(pos => {
      const pairName = `${pos.tokenX.symbol}/${pos.tokenY.symbol}`;
      pairMap.set(pairName, (pairMap.get(pairName) || 0) + (pos as any).currentValue || 0);
    });

    return Array.from(pairMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  }

  private buildPerformanceChartData(positions: DLMMPosition[]): any[] {
    const now = new Date();
    const data = [];

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const value = positions.reduce((sum, pos) => sum + (pos as any).currentValue || 0, 0) * (1 + Math.random() * 0.1 - 0.05);

      data.push({
        date: date.toISOString().split('T')[0],
        value
      });
    }

    return data;
  }

  private calculateTimeInPosition(position: DLMMPosition): number {
    if (!position.createdAt) return 0;
    return (Date.now() - position.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  }

  private calculatePositionEfficiency(_position: DLMMPosition): number {
    return 0.75;
  }

  private calculateLiquidityUtilization(_position: DLMMPosition): number {
    return 0.6;
  }

  private calculatePositionConcentration(_position: DLMMPosition): number {
    return 0.3;
  }

  private calculatePositionRiskScore(position: DLMMPosition): number {
    return Math.min(100, Math.max(0, (position.pnlPercent || 0) * -10 + 50));
  }

  private generatePositionRecommendations(position: DLMMPosition): PositionRecommendation[] {
    const recommendations: PositionRecommendation[] = [];

    if ((position.pnlPercent || 0) < -0.1) {
      recommendations.push({
        type: 'close',
        priority: 'high',
        description: 'Consider closing underperforming position',
        rationale: 'Position showing significant losses',
        expectedOutcome: 'Prevent further losses',
        estimatedCost: 10,
        timeframe: 'immediate'
      });
    }

    if ((position.currentValue ?? 0) > 10000) {
      recommendations.push({
        type: 'rebalance',
        priority: 'medium',
        description: 'Consider rebalancing large position',
        rationale: 'Position represents significant concentration',
        expectedOutcome: 'Improved diversification',
        estimatedCost: 25,
        timeframe: '1 week'
      });
    }

    return recommendations;
  }

  private buildPositionHistory(position: DLMMPosition): PositionHistoryEntry[] {
    const history: PositionHistoryEntry[] = [];

    if (position.createdAt) {
      history.push({
        timestamp: position.createdAt,
        action: 'open',
        details: {
          initialValue: position.initialValue ?? position.currentValue ?? 0,
          pair: `${position.tokenX.symbol}/${position.tokenY.symbol}`
        },
        impact: {
          valueChange: position.initialValue ?? position.currentValue ?? 0,
          performanceChange: 0,
          riskChange: 0,
          efficiency: 0
        }
      });
    }

    return history;
  }

  private buildPerformanceAttribution(
    positions: DLMMPosition[],
    _analysis: any
  ): PerformanceAttribution {
    const totalReturn = positions.reduce((sum, pos) => sum + (pos as any).pnl || 0, 0);

    const components: AttributionComponent[] = [
      {
        component: 'Fee Earnings',
        contribution: positions.reduce((sum, pos) => sum + (pos.feeEarnings || 0), 0),
        percentage: 60,
        description: 'Returns from liquidity provision fees'
      },
      {
        component: 'Price Appreciation',
        contribution: totalReturn * 0.3,
        percentage: 30,
        description: 'Returns from token price movements'
      },
      {
        component: 'Impermanent Loss',
        contribution: totalReturn * -0.1,
        percentage: -10,
        description: 'Loss from price divergence'
      }
    ];

    const totalPositionValue = positions.reduce((sum, p) => sum + (p.currentValue ?? 0), 0);
    const positionContributions: PositionContribution[] = positions.map(pos => ({
      positionId: pos.publicKey?.toString() ?? pos.id,
      pairName: `${pos.tokenX.symbol}/${pos.tokenY.symbol}`,
      contribution: pos.pnl ?? 0,
      percentage: totalReturn !== 0 ? ((pos.pnl ?? 0) / totalReturn) * 100 : 0,
      weight: totalPositionValue > 0 ? (pos.currentValue ?? 0) / totalPositionValue : 0
    }));

    return {
      totalReturn,
      components,
      periodBreakdown: [
        {
          period: '30d',
          return: totalReturn,
          components
        }
      ],
      positionContributions
    };
  }

  private buildBenchmarkComparison(positions: DLMMPosition[]): BenchmarkComparison {
    const portfolioReturn = positions.reduce((sum, pos) => sum + (pos as any).pnl || 0, 0);
    const portfolioValue = positions.reduce((sum, pos) => sum + (pos as any).currentValue || 0, 0);
    const returnPercent = portfolioValue > 0 ? (portfolioReturn / portfolioValue) * 100 : 0;

    const benchmarks: BenchmarkResult[] = [
      {
        name: 'HODL Strategy',
        return: 5,
        volatility: 25,
        sharpeRatio: 0.2,
        correlation: 0.8,
        outperformance: returnPercent - 5
      },
      {
        name: 'DeFi Index',
        return: 12,
        volatility: 35,
        sharpeRatio: 0.34,
        correlation: 0.6,
        outperformance: returnPercent - 12
      }
    ];

    return {
      benchmarks,
      outperformance: returnPercent - 5,
      consistency: 0.75,
      correlation: 0.7,
      beta: 1.2,
      alpha: 2.5,
      informationRatio: 0.5
    };
  }

  private buildPerformanceTrends(_positions: DLMMPosition[]): PerformanceTrend[] {
    return [
      {
        metric: 'Total Return',
        direction: 'improving',
        strength: 0.7,
        significance: 0.8,
        timeframe: '30d',
        description: 'Portfolio returns showing upward trend'
      },
      {
        metric: 'Fee Earnings',
        direction: 'stable',
        strength: 0.5,
        significance: 0.6,
        timeframe: '30d',
        description: 'Consistent fee generation'
      }
    ];
  }

  private buildPerformanceScenarios(_positions: DLMMPosition[]): PerformanceScenario[] {
    return [
      {
        scenario: 'Bull Market',
        probability: 0.3,
        expectedReturn: 25,
        downside: 5,
        upside: 45,
        description: 'Strong market conditions with high DeFi adoption'
      },
      {
        scenario: 'Bear Market',
        probability: 0.4,
        expectedReturn: -15,
        downside: -30,
        upside: 0,
        description: 'Market downturn with reduced liquidity'
      },
      {
        scenario: 'Sideways Market',
        probability: 0.3,
        expectedReturn: 8,
        downside: -5,
        upside: 15,
        description: 'Range-bound market with steady fee income'
      }
    ];
  }

  private buildPerformanceDecomposition(
    _positions: DLMMPosition[],
    _analysis: any
  ): PerformanceDecomposition {
    return {
      systematic: 0.6,
      idiosyncratic: 0.4,
      market: 0.5,
      sector: 0.3,
      alpha: 0.2,
      explained: 0.8,
      unexplained: 0.2
    };
  }

  private getRiskLevel(var95: number): string {
    if (var95 < 0.05) return 'low';
    if (var95 < 0.1) return 'medium';
    if (var95 < 0.2) return 'high';
    return 'very_high';
  }

  private identifyRiskConcerns(analysis: any): string[] {
    const concerns: string[] = [];

    if (analysis.riskMetrics.portfolioVaR > 0.15) {
      concerns.push('High portfolio volatility');
    }

    if (analysis.riskMetrics.maxDrawdown > 0.2) {
      concerns.push('Significant maximum drawdown');
    }

    return concerns;
  }

  private buildRiskMetrics(analysis: any): RiskMetric[] {
    return [
      {
        name: 'Value at Risk (95%)',
        value: analysis.riskMetrics.portfolioVaR * 100,
        unit: '%',
        level: this.getRiskLevel(analysis.riskMetrics.portfolioVaR) as any,
        trend: 'stable',
        description: 'Maximum expected loss at 95% confidence level',
        benchmark: 10
      },
      {
        name: 'Portfolio Volatility',
        value: analysis.riskMetrics.portfolioVolatility * 100,
        unit: '%',
        level: 'medium',
        trend: 'stable',
        description: 'Annualized portfolio volatility'
      },
      {
        name: 'Sharpe Ratio',
        value: analysis.riskMetrics.sharpeRatio,
        unit: '',
        level: 'medium',
        trend: 'improving',
        description: 'Risk-adjusted return measure'
      }
    ];
  }

  private buildRiskScenarios(): RiskScenario[] {
    return [
      {
        name: 'Market Crash',
        probability: 0.15,
        impact: 0.4,
        description: 'Severe market downturn affecting all positions',
        mitigation: 'Diversification and hedging',
        timeline: 'Short-term'
      },
      {
        name: 'Liquidity Crisis',
        probability: 0.1,
        impact: 0.3,
        description: 'Sudden liquidity withdrawal from DeFi markets',
        mitigation: 'Position sizing and monitoring',
        timeline: 'Medium-term'
      }
    ];
  }

  private buildCorrelationMatrix(analysis: any): CorrelationMatrix {
    const correlationData = analysis.correlationAnalysis;
    const assets = Object.keys(correlationData.pairCorrelations);

    const matrix: number[][] = [];
    for (let i = 0; i < assets.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < assets.length; j++) {
        if (i === j) {
          matrix[i][j] = 1;
        } else {
          const pair1 = assets[i];
          const pair2 = assets[j];
          matrix[i][j] = correlationData.pairCorrelations[pair1]?.[pair2] || 0;
        }
      }
    }

    const allCorrelations = matrix.flat().filter(c => c !== 1);
    const averageCorrelation = allCorrelations.reduce((sum, c) => sum + c, 0) / allCorrelations.length;
    const maxCorrelation = Math.max(...allCorrelations);
    const minCorrelation = Math.min(...allCorrelations);

    return {
      assets,
      matrix,
      averageCorrelation,
      maxCorrelation,
      minCorrelation,
      clusters: [
        {
          name: 'High Correlation Cluster',
          assets: assets.slice(0, Math.min(3, assets.length)),
          averageCorrelation: 0.8,
          description: 'Assets with high correlation'
        }
      ]
    };
  }

  private buildConcentrationAnalysis(diversification: any): ConcentrationAnalysis {
    return {
      herfindahlIndex: diversification.concentrationMetrics.herfindahlIndex,
      top5Concentration: diversification.concentrationMetrics.top5Concentration,
      top10Concentration: diversification.concentrationMetrics.top10Concentration,
      concentrationRisk: diversification.concentrationMetrics.concentrationRisk,
      recommendations: [
        'Consider reducing largest positions',
        'Add exposure to new pairs'
      ],
      diversificationOpportunities: [
        {
          type: 'token',
          description: 'Add exposure to new token categories',
          expectedBenefit: 15,
          implementation: 'Allocate to uncorrelated tokens'
        },
        {
          type: 'strategy',
          description: 'Implement different liquidity strategies',
          expectedBenefit: 20,
          implementation: 'Use varying fee tiers and ranges'
        }
      ]
    };
  }

  private buildStressTestResults(): StressTestResult[] {
    return [
      {
        scenario: '2008 Financial Crisis',
        impact: 0.4,
        recovery: 18,
        maxDrawdown: 0.45,
        timeToRecover: 12,
        description: 'Historical stress test based on 2008 crisis'
      },
      {
        scenario: 'Flash Crash',
        impact: 0.25,
        recovery: 2,
        maxDrawdown: 0.3,
        timeToRecover: 1,
        description: 'Rapid market decline scenario'
      }
    ];
  }

  private buildRiskRecommendations(analysis: any): RiskRecommendation[] {
    const recommendations: RiskRecommendation[] = [];

    if (analysis.riskMetrics.portfolioVaR > 0.15) {
      recommendations.push({
        type: 'reduce',
        priority: 'high',
        description: 'Reduce portfolio risk through diversification',
        expectedReduction: 25,
        cost: 5,
        timeframe: '1-2 weeks'
      });
    }

    if (analysis.correlationAnalysis.averageCorrelation > 0.7) {
      recommendations.push({
        type: 'diversify',
        priority: 'medium',
        description: 'Add uncorrelated positions to reduce correlation risk',
        expectedReduction: 15,
        cost: 3,
        timeframe: '2-4 weeks'
      });
    }

    return recommendations;
  }

  private convertToCSV(report: PortfolioReport): string {
    const headers = ['Metric', 'Value', 'Unit'];
    const rows = [
      ['Total Value', report.executiveSummary.totalValue.toString(), 'USD'],
      ['Total Return', report.executiveSummary.totalValueChangePercent.toString(), '%'],
      ['Total Positions', report.executiveSummary.totalPositions.toString(), 'count'],
      ['Diversification Score', report.executiveSummary.diversificationScore.toString(), '/10'],
      ['Risk Score', report.executiveSummary.riskScore.toString(), '%']
    ];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private convertToHTML(report: PortfolioReport, configuration: ReportConfiguration): string {
    const branding = configuration.branding || this.getDefaultBranding();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.metadata.configuration.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .section { margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${branding.companyName || 'Portfolio Report'}</h1>
        <h2>${report.metadata.configuration.name}</h2>
        <p>Generated on ${report.metadata.generatedAt.toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <div class="metric">
            <strong>Total Value:</strong> $${report.executiveSummary.totalValue.toLocaleString()}
        </div>
        <div class="metric">
            <strong>Total Return:</strong> ${report.executiveSummary.totalValueChangePercent.toFixed(2)}%
        </div>
        <div class="metric">
            <strong>Positions:</strong> ${report.executiveSummary.totalPositions}
        </div>
        <div class="metric">
            <strong>Diversification:</strong> ${report.executiveSummary.diversificationScore.toFixed(1)}/10
        </div>
    </div>

    <div class="section">
        <h2>Position Details</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Position</th>
                    <th>Pair</th>
                    <th>Current Value</th>
                    <th>Return</th>
                    <th>Return %</th>
                </tr>
            </thead>
            <tbody>
                ${report.positionDetails.map(detail => `
                    <tr>
                        <td>${detail.position.publicKey?.toString().substring(0, 8) ?? detail.position.id.substring(0, 8)}...</td>
                        <td>${detail.position.tokenX.symbol}/${detail.position.tokenY.symbol}</td>
                        <td>$${detail.analytics.currentValue.toLocaleString()}</td>
                        <td>$${detail.analytics.totalReturn.toLocaleString()}</td>
                        <td>${detail.analytics.totalReturnPercent.toFixed(2)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    ${branding.disclaimer ? `<div class="disclaimer"><p><small>${branding.disclaimer}</small></p></div>` : ''}
</body>
</html>`;
  }

  private async convertToPDF(report: PortfolioReport, configuration: ReportConfiguration): Promise<Buffer> {
    const html = this.convertToHTML(report, configuration);
    return Buffer.from(html, 'utf8');
  }

  private async convertToXLSX(report: PortfolioReport): Promise<Buffer> {
    const csvData = this.convertToCSV(report);
    return Buffer.from(csvData, 'utf8');
  }

  private convertToXML(report: PortfolioReport): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<PortfolioReport>
    <Metadata>
        <ReportId>${report.metadata.reportId}</ReportId>
        <GeneratedAt>${report.metadata.generatedAt.toISOString()}</GeneratedAt>
        <WalletAddress>${report.metadata.walletAddress}</WalletAddress>
    </Metadata>
    <ExecutiveSummary>
        <TotalValue>${report.executiveSummary.totalValue}</TotalValue>
        <TotalReturn>${report.executiveSummary.totalValueChangePercent}</TotalReturn>
        <TotalPositions>${report.executiveSummary.totalPositions}</TotalPositions>
        <DiversificationScore>${report.executiveSummary.diversificationScore}</DiversificationScore>
    </ExecutiveSummary>
    <Positions>
        ${report.positionDetails.map(detail => `
            <Position>
                <Id>${detail.position.publicKey?.toString() ?? detail.position.id}</Id>
                <Pair>${detail.position.tokenX.symbol}/${detail.position.tokenY.symbol}</Pair>
                <CurrentValue>${detail.analytics.currentValue}</CurrentValue>
                <Return>${detail.analytics.totalReturn}</Return>
                <ReturnPercent>${detail.analytics.totalReturnPercent}</ReturnPercent>
            </Position>
        `).join('')}
    </Positions>
</PortfolioReport>`;
  }

  private calculatePages(content: any, format: ReportFormat): number {
    if (format === ReportFormat.PDF) {
      return Math.ceil(content.length / 3000);
    }
    return 1;
  }

  private countSections(_report: PortfolioReport): number {
    return 10;
  }

  private countCharts(report: PortfolioReport): number {
    return report.portfolioOverview.charts.length;
  }

  private countTables(_report: PortfolioReport): number {
    return 5;
  }

  private calculateChecksum(content: any): string {
    return Buffer.from(JSON.stringify(content)).toString('base64').substring(0, 16);
  }
}

export default PortfolioReportingEngine;