import { DLMMPosition } from '../types';

export interface CustomAnalyticsFramework {
  user_metrics: UserDefinedMetric[];
  custom_dashboards: CustomDashboard[];
  analytics_templates: AnalyticsTemplate[];
  data_sources: DataSourceConfig[];
  notification_rules: NotificationRule[];
  scheduled_reports: ScheduledReport[];
  api_endpoints: CustomApiEndpoint[];
  visualization_configs: VisualizationConfig[];
  user_preferences: UserPreferences;
  framework_statistics: FrameworkStatistics;
}

export interface UserDefinedMetric {
  id: string;
  name: string;
  description: string;
  category: string;
  formula: MetricFormula;
  data_requirements: DataRequirement[];
  calculation_frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  output_type: 'number' | 'percentage' | 'ratio' | 'boolean' | 'text' | 'array';
  unit: string;
  precision: number;
  thresholds: MetricThreshold[];
  historical_tracking: boolean;
  created_by: string;
  created_at: Date;
  last_modified: Date;
  usage_count: number;
  performance_impact: 'low' | 'medium' | 'high';
  validation_rules: ValidationRule[];
}

export interface MetricFormula {
  expression: string; // Mathematical/logical expression
  variables: FormulaVariable[];
  functions: FormulaFunction[];
  conditions: ConditionalLogic[];
  aggregations: AggregationRule[];
  time_series_operations: TimeSeriesOperation[];
}

export interface FormulaVariable {
  name: string;
  type: 'position' | 'market' | 'portfolio' | 'external' | 'constant';
  source: string;
  path: string; // JSONPath to the data
  default_value?: any;
  required: boolean;
  validation?: string;
}

export interface FormulaFunction {
  name: string;
  type: 'mathematical' | 'statistical' | 'financial' | 'custom';
  parameters: FunctionParameter[];
  return_type: string;
  implementation?: string; // JavaScript function code
}

export interface FunctionParameter {
  name: string;
  type: string;
  required: boolean;
  default_value?: any;
  validation?: string;
}

export interface ConditionalLogic {
  condition: string;
  true_expression: string;
  false_expression: string;
  else_if_conditions?: ConditionalLogic[];
}

export interface AggregationRule {
  field: string;
  operation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'median' | 'std' | 'var';
  group_by?: string[];
  filter?: string;
  window?: TimeWindow;
}

export interface TimeSeriesOperation {
  operation: 'rolling' | 'cumulative' | 'difference' | 'percentage_change' | 'lag' | 'lead';
  window?: TimeWindow;
  parameters?: Record<string, any>;
}

export interface TimeWindow {
  size: number;
  unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  alignment?: 'calendar' | 'rolling';
}

export interface DataRequirement {
  source: string;
  fields: string[];
  frequency: string;
  lookback_period?: TimeWindow;
  real_time: boolean;
  backup_sources?: string[];
}

export interface MetricThreshold {
  type: 'warning' | 'critical' | 'target' | 'optimal';
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'between' | 'outside';
  value: number | [number, number];
  color?: string;
  action?: ThresholdAction;
}

export interface ThresholdAction {
  type: 'alert' | 'email' | 'webhook' | 'function';
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface ValidationRule {
  type: 'range' | 'pattern' | 'function' | 'dependency';
  configuration: Record<string, any>;
  error_message: string;
}

export interface CustomDashboard {
  id: string;
  name: string;
  description: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refresh_interval: number; // seconds
  auto_refresh: boolean;
  sharing_settings: SharingSettings;
  access_permissions: AccessPermission[];
  created_by: string;
  created_at: Date;
  last_modified: Date;
  view_count: number;
  favorite: boolean;
  tags: string[];
}

export interface DashboardLayout {
  type: 'grid' | 'flexible' | 'tabbed' | 'sidebar';
  columns: number;
  row_height: number;
  gap: number;
  responsive: boolean;
  breakpoints?: Breakpoint[];
}

export interface Breakpoint {
  name: string;
  width: number;
  columns: number;
  layout_adjustments?: Record<string, any>;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'text' | 'image' | 'iframe' | 'custom';
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: WidgetConfiguration;
  data_source: WidgetDataSource;
  refresh_interval?: number;
  conditional_display?: ConditionalDisplay[];
  interactions: WidgetInteraction[];
}

export interface WidgetPosition {
  x: number;
  y: number;
  z_index?: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  min_width?: number;
  min_height?: number;
  max_width?: number;
  max_height?: number;
  resizable: boolean;
}

export interface WidgetConfiguration {
  chart_type?: string;
  colors?: string[];
  axes?: AxisConfiguration[];
  legend?: LegendConfiguration;
  tooltip?: TooltipConfiguration;
  formatting?: FormattingConfiguration;
  custom_options?: Record<string, any>;
}

export interface AxisConfiguration {
  axis: 'x' | 'y' | 'y2';
  label?: string;
  min?: number;
  max?: number;
  scale_type?: 'linear' | 'logarithmic' | 'time' | 'category';
  grid_lines?: boolean;
  tick_format?: string;
}

export interface LegendConfiguration {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  alignment: 'start' | 'center' | 'end';
  orientation: 'horizontal' | 'vertical';
}

export interface TooltipConfiguration {
  enabled: boolean;
  format?: string;
  custom_template?: string;
  show_all_series?: boolean;
}

export interface FormattingConfiguration {
  number_format?: string;
  date_format?: string;
  currency_symbol?: string;
  decimal_places?: number;
  thousands_separator?: string;
  percentage_multiplier?: boolean;
}

export interface WidgetDataSource {
  type: 'metric' | 'query' | 'api' | 'static' | 'formula';
  source: string;
  parameters?: Record<string, any>;
  filters?: DataFilter[];
  transformations?: DataTransformation[];
  refresh_strategy: 'manual' | 'interval' | 'real_time' | 'on_change';
}

export interface DataFilter {
  field: string;
  operator: string;
  value: any;
  case_sensitive?: boolean;
}

export interface DataTransformation {
  type: 'sort' | 'filter' | 'aggregate' | 'pivot' | 'join' | 'formula';
  configuration: Record<string, any>;
  order: number;
}

export interface ConditionalDisplay {
  condition: string;
  show: boolean;
  styling?: Record<string, any>;
}

export interface WidgetInteraction {
  type: 'click' | 'hover' | 'double_click' | 'context_menu';
  action: 'drill_down' | 'filter' | 'navigate' | 'modal' | 'function';
  configuration: Record<string, any>;
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'dropdown' | 'multi_select' | 'date_range' | 'slider' | 'text' | 'boolean';
  field: string;
  options?: FilterOption[];
  default_value?: any;
  applies_to: string[]; // Widget IDs
  visible: boolean;
  required: boolean;
}

export interface FilterOption {
  label: string;
  value: any;
  color?: string;
  icon?: string;
}

export interface SharingSettings {
  public: boolean;
  shareable_link: boolean;
  embed_enabled: boolean;
  password_protected: boolean;
  password?: string;
  expiration_date?: Date;
  download_enabled: boolean;
  print_enabled: boolean;
}

export interface AccessPermission {
  user_id?: string;
  role?: string;
  team_id?: string;
  permission_level: 'view' | 'edit' | 'admin';
  granted_by: string;
  granted_at: Date;
  expires_at?: Date;
}

export interface AnalyticsTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  use_case: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  metrics: UserDefinedMetric[];
  dashboards: CustomDashboard[];
  setup_instructions: string[];
  preview_image?: string;
  author: string;
  version: string;
  changelog?: TemplateVersion[];
  downloads: number;
  rating: number;
  reviews: TemplateReview[];
  tags: string[];
  compatible_data_sources: string[];
  requirements: TemplateRequirement[];
}

export interface TemplateVersion {
  version: string;
  release_date: Date;
  changes: string[];
  breaking_changes?: string[];
}

export interface TemplateReview {
  user_id: string;
  rating: number;
  comment?: string;
  helpful_votes: number;
  created_at: Date;
}

export interface TemplateRequirement {
  type: 'data_source' | 'plugin' | 'api_key' | 'permission';
  name: string;
  description: string;
  required: boolean;
  version?: string;
}

export interface DataSourceConfig {
  id: string;
  name: string;
  type: 'rest_api' | 'graphql' | 'database' | 'file' | 'webhook' | 'websocket';
  configuration: DataSourceConfiguration;
  authentication: AuthenticationConfig;
  rate_limiting: RateLimitConfig;
  caching: CachingConfig;
  health_check: HealthCheckConfig;
  error_handling: ErrorHandlingConfig;
  enabled: boolean;
  created_at: Date;
  last_tested: Date;
  test_results: TestResult[];
}

export interface DataSourceConfiguration {
  endpoint?: string;
  headers?: Record<string, string>;
  parameters?: Record<string, any>;
  timeout?: number;
  retry_attempts?: number;
  ssl_verification?: boolean;
  custom_options?: Record<string, any>;
}

export interface AuthenticationConfig {
  type: 'none' | 'api_key' | 'bearer_token' | 'basic' | 'oauth2' | 'custom';
  credentials: Record<string, string>;
  refresh_mechanism?: RefreshMechanism;
}

export interface RefreshMechanism {
  type: 'automatic' | 'manual' | 'webhook';
  interval?: number;
  endpoint?: string;
  configuration?: Record<string, any>;
}

export interface RateLimitConfig {
  enabled: boolean;
  requests_per_minute?: number;
  requests_per_hour?: number;
  requests_per_day?: number;
  burst_limit?: number;
  backoff_strategy?: 'exponential' | 'linear' | 'constant';
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number; // seconds
  strategy: 'lru' | 'fifo' | 'ttl' | 'custom';
  max_size?: number;
  compression?: boolean;
  invalidation_triggers?: string[];
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number; // seconds
  timeout: number;
  endpoint?: string;
  expected_status?: number;
  expected_response?: any;
  alert_on_failure: boolean;
}

export interface ErrorHandlingConfig {
  retry_strategy: 'none' | 'exponential' | 'linear' | 'custom';
  max_retries: number;
  timeout_strategy: 'fail' | 'cache' | 'default_value';
  error_logging: boolean;
  alert_on_error: boolean;
  fallback_data_source?: string;
}

export interface TestResult {
  timestamp: Date;
  success: boolean;
  response_time: number;
  error_message?: string;
  status_code?: number;
  data_quality_score?: number;
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  trigger: NotificationTrigger;
  channels: NotificationChannel[];
  message_template: MessageTemplate;
  frequency_limit: FrequencyLimit;
  conditions: NotificationCondition[];
  enabled: boolean;
  created_by: string;
  created_at: Date;
  last_triggered?: Date;
  trigger_count: number;
}

export interface NotificationTrigger {
  type: 'metric_threshold' | 'data_anomaly' | 'system_event' | 'schedule' | 'manual';
  configuration: Record<string, any>;
  debounce_period?: number; // seconds
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'webhook' | 'slack' | 'discord' | 'telegram' | 'push';
  configuration: ChannelConfiguration;
  enabled: boolean;
  priority: number;
  fallback: boolean;
}

export interface ChannelConfiguration {
  recipients?: string[];
  webhook_url?: string;
  api_key?: string;
  template_id?: string;
  custom_headers?: Record<string, string>;
  format?: 'json' | 'xml' | 'text' | 'html';
}

export interface MessageTemplate {
  subject_template: string;
  body_template: string;
  format: 'text' | 'html' | 'markdown';
  variables: TemplateVariable[];
  attachments?: AttachmentConfig[];
}

export interface TemplateVariable {
  name: string;
  source: string;
  format?: string;
  default_value?: string;
}

export interface AttachmentConfig {
  type: 'chart' | 'report' | 'data_export' | 'screenshot';
  configuration: Record<string, any>;
  filename_template: string;
}

export interface FrequencyLimit {
  max_per_hour?: number;
  max_per_day?: number;
  cooldown_period?: number; // seconds
  escalation_rules?: EscalationRule[];
}

export interface EscalationRule {
  condition: string;
  escalation_delay: number; // seconds
  escalation_channels: string[];
  escalation_message?: string;
}

export interface NotificationCondition {
  field: string;
  operator: string;
  value: any;
  logical_operator?: 'AND' | 'OR';
}

export interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  dashboard_id?: string;
  metrics: string[];
  schedule: ReportSchedule;
  format: 'pdf' | 'html' | 'csv' | 'excel' | 'json';
  recipients: ReportRecipient[];
  filters: Record<string, any>;
  parameters: Record<string, any>;
  storage: ReportStorage;
  enabled: boolean;
  created_by: string;
  created_at: Date;
  last_generated?: Date;
  next_generation?: Date;
  generation_count: number;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  time: string; // HH:MM format
  timezone: string;
  days_of_week?: number[]; // 0-6, Sunday = 0
  day_of_month?: number; // 1-31
  custom_cron?: string;
  holidays_excluded?: boolean;
}

export interface ReportRecipient {
  type: 'email' | 'file_share' | 'webhook' | 'api';
  address: string;
  format_preference?: string;
  delivery_options?: Record<string, any>;
}

export interface ReportStorage {
  enabled: boolean;
  location: 'local' | 's3' | 'gcs' | 'azure' | 'custom';
  configuration: Record<string, any>;
  retention_days: number;
  compression: boolean;
  encryption: boolean;
}

export interface CustomApiEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  handler: ApiHandler;
  authentication: EndpointAuthentication;
  rate_limiting: EndpointRateLimit;
  caching: EndpointCaching;
  documentation: ApiDocumentation;
  enabled: boolean;
  created_at: Date;
  usage_stats: EndpointUsageStats;
}

export interface ApiHandler {
  type: 'metric_query' | 'dashboard_export' | 'data_aggregation' | 'custom_function';
  configuration: Record<string, any>;
  input_schema?: JsonSchema;
  output_schema?: JsonSchema;
  custom_code?: string;
}

export interface JsonSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface EndpointAuthentication {
  required: boolean;
  methods: string[];
  permissions: string[];
  rate_limit_exemptions?: string[];
}

export interface EndpointRateLimit {
  enabled: boolean;
  requests_per_minute: number;
  burst_allowance: number;
  per_user_limit: boolean;
}

export interface EndpointCaching {
  enabled: boolean;
  ttl: number;
  vary_by: string[];
  conditional_caching?: Record<string, any>;
}

export interface ApiDocumentation {
  summary: string;
  description: string;
  parameters: ParameterDoc[];
  examples: ApiExample[];
  response_schema: JsonSchema;
}

export interface ParameterDoc {
  name: string;
  type: string;
  description: string;
  required: boolean;
  example?: any;
}

export interface ApiExample {
  name: string;
  description: string;
  request: any;
  response: any;
}

export interface EndpointUsageStats {
  total_requests: number;
  avg_response_time: number;
  error_rate: number;
  last_used: Date;
  usage_by_user: Record<string, number>;
  usage_trend: UsageTrendPoint[];
}

export interface UsageTrendPoint {
  date: Date;
  requests: number;
  avg_response_time: number;
  errors: number;
}

export interface VisualizationConfig {
  id: string;
  name: string;
  type: string;
  library: 'recharts' | 'd3' | 'plotly' | 'custom';
  configuration: VisualizationConfiguration;
  data_mapping: DataMapping;
  interactivity: InteractivityConfig;
  styling: StylingConfig;
  animations: AnimationConfig;
  accessibility: AccessibilityConfig;
  performance: PerformanceConfig;
}

export interface VisualizationConfiguration {
  chart_specific_options: Record<string, any>;
  responsive: boolean;
  aspect_ratio?: number;
  min_height?: number;
  max_height?: number;
  padding?: Padding;
  margins?: Margins;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DataMapping {
  x_axis: string;
  y_axis: string | string[];
  color?: string;
  size?: string;
  shape?: string;
  grouping?: string;
  filtering?: string;
  sorting?: SortingConfig;
}

export interface SortingConfig {
  field: string;
  direction: 'asc' | 'desc';
  type: 'alphabetical' | 'numerical' | 'date' | 'custom';
}

export interface InteractivityConfig {
  zoom: boolean;
  pan: boolean;
  brush: boolean;
  tooltip: boolean;
  click_actions: ClickAction[];
  hover_actions: HoverAction[];
  keyboard_navigation: boolean;
}

export interface ClickAction {
  target: string;
  action: 'filter' | 'drill_down' | 'navigate' | 'modal' | 'custom';
  configuration: Record<string, any>;
}

export interface HoverAction {
  show_tooltip: boolean;
  highlight_related: boolean;
  custom_styling?: Record<string, any>;
  custom_function?: string;
}

export interface StylingConfig {
  theme: string;
  color_palette: string[];
  font_family: string;
  font_size: number;
  custom_css?: string;
  conditional_styling?: ConditionalStyling[];
}

export interface ConditionalStyling {
  condition: string;
  styling: Record<string, any>;
  priority: number;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: string;
  entrance_animation?: string;
  transition_animation?: string;
  exit_animation?: string;
  performance_mode?: 'smooth' | 'performance' | 'auto';
}

export interface AccessibilityConfig {
  alt_text: string;
  keyboard_navigation: boolean;
  screen_reader_support: boolean;
  high_contrast_mode: boolean;
  focus_indicators: boolean;
  aria_labels: Record<string, string>;
}

export interface PerformanceConfig {
  lazy_loading: boolean;
  virtualization: boolean;
  data_sampling: DataSamplingConfig;
  render_optimization: RenderOptimization;
  memory_management: MemoryManagement;
}

export interface DataSamplingConfig {
  enabled: boolean;
  max_data_points: number;
  sampling_strategy: 'random' | 'systematic' | 'adaptive';
  aggregation_fallback: boolean;
}

export interface RenderOptimization {
  canvas_rendering: boolean;
  batch_updates: boolean;
  frame_rate_limit: number;
  adaptive_quality: boolean;
}

export interface MemoryManagement {
  automatic_cleanup: boolean;
  cleanup_interval: number;
  memory_threshold: number;
  garbage_collection_hints: boolean;
}

export interface UserPreferences {
  default_dashboard?: string;
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  date_format: string;
  number_format: string;
  currency: string;
  language: string;
  notification_preferences: NotificationPreferences;
  privacy_settings: PrivacySettings;
  accessibility_settings: AccessibilitySettings;
  performance_settings: PerformanceSettings;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  frequency_preference: 'immediate' | 'digest' | 'off';
  quiet_hours: QuietHours;
  notification_types: Record<string, boolean>;
}

export interface QuietHours {
  enabled: boolean;
  start_time: string;
  end_time: string;
  timezone: string;
  days: number[];
}

export interface PrivacySettings {
  data_sharing: boolean;
  usage_analytics: boolean;
  personalization: boolean;
  data_retention_period: number;
  export_data_allowed: boolean;
}

export interface AccessibilitySettings {
  high_contrast: boolean;
  large_fonts: boolean;
  reduced_motion: boolean;
  screen_reader_optimizations: boolean;
  keyboard_navigation_only: boolean;
}

export interface PerformanceSettings {
  real_time_updates: boolean;
  animation_level: 'none' | 'reduced' | 'full';
  data_quality: 'fast' | 'balanced' | 'accurate';
  cache_preferences: CachePreferences;
}

export interface CachePreferences {
  enabled: boolean;
  aggressive_caching: boolean;
  cache_duration: number;
  auto_refresh: boolean;
}

export interface FrameworkStatistics {
  total_metrics: number;
  active_metrics: number;
  total_dashboards: number;
  active_dashboards: number;
  total_users: number;
  active_users: number;
  api_calls_today: number;
  avg_response_time: number;
  error_rate: number;
  storage_usage: StorageUsage;
  performance_metrics: FrameworkPerformanceMetrics;
  usage_trends: UsageTrend[];
}

export interface StorageUsage {
  total_size: number;
  dashboard_configs: number;
  metric_definitions: number;
  cached_data: number;
  historical_data: number;
  reports: number;
}

export interface FrameworkPerformanceMetrics {
  avg_metric_calculation_time: number;
  avg_dashboard_load_time: number;
  cache_hit_rate: number;
  concurrent_users: number;
  peak_memory_usage: number;
  cpu_utilization: number;
}

export interface UsageTrend {
  date: Date;
  active_users: number;
  dashboard_views: number;
  metric_calculations: number;
  api_calls: number;
  errors: number;
}

export class CustomAnalyticsFrameworkEngine {
  private metrics: Map<string, UserDefinedMetric> = new Map();
  private dashboards: Map<string, CustomDashboard> = new Map();
  private templates: Map<string, AnalyticsTemplate> = new Map();
  private dataSources: Map<string, DataSourceConfig> = new Map();
  private notifications: Map<string, NotificationRule> = new Map();
  private reports: Map<string, ScheduledReport> = new Map();
  private apiEndpoints: Map<string, CustomApiEndpoint> = new Map();
  private visualizations: Map<string, VisualizationConfig> = new Map();
  private metricCache: Map<string, any> = new Map();
  // @ts-ignore - Reserved for future implementation
  private _executionQueue: Map<string, any> = new Map();

  constructor() {
    this.initializeFramework();
  }

  private initializeFramework(): void {
    console.log('Custom Analytics Framework initialized');
    this.loadBuiltInTemplates();
    this.setupDefaultDataSources();
    this.initializeMetricEngine();
  }

  /**
   * Create a new user-defined metric
   */
  public async createMetric(metricDefinition: Omit<UserDefinedMetric, 'id' | 'created_at' | 'last_modified' | 'usage_count'>): Promise<string> {
    try {
      const id = this.generateId();
      const metric: UserDefinedMetric = {
        ...metricDefinition,
        id,
        created_at: new Date(),
        last_modified: new Date(),
        usage_count: 0
      };

      // Validate metric definition
      await this.validateMetric(metric);

      // Test metric calculation
      await this.testMetricCalculation(metric);

      this.metrics.set(id, metric);

      console.log(`Custom metric created: ${metric.name} (${id})`);
      return id;

    } catch (error) {
      console.error('Error creating metric:', error);
      throw error;
    }
  }

  /**
   * Calculate a user-defined metric
   */
  public async calculateMetric(
    metricId: string,
    positions: DLMMPosition[],
    portfolioData?: any,
    marketData?: any
  ): Promise<any> {
    try {
      const metric = this.metrics.get(metricId);
      if (!metric) {
        throw new Error(`Metric not found: ${metricId}`);
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(metricId, positions, portfolioData, marketData);
      const cached = this.metricCache.get(cacheKey);
      if (cached && this.isCacheValid(cached, metric.calculation_frequency)) {
        return cached.value;
      }

      // Gather required data
      const data = await this.gatherMetricData(metric, positions, portfolioData, marketData);

      // Execute metric calculation
      const result = await this.executeMetricFormula(metric, data);

      // Validate result
      this.validateMetricResult(metric, result);

      // Cache result
      this.cacheMetricResult(cacheKey, result, metric.calculation_frequency);

      // Update usage statistics
      metric.usage_count++;
      metric.last_modified = new Date();

      // Check thresholds and trigger alerts
      await this.checkMetricThresholds(metric, result);

      return result;

    } catch (error) {
      console.error(`Error calculating metric ${metricId}:`, error);
      throw error;
    }
  }

  /**
   * Create a custom dashboard
   */
  public async createDashboard(dashboardDefinition: Omit<CustomDashboard, 'id' | 'created_at' | 'last_modified' | 'view_count'>): Promise<string> {
    try {
      const id = this.generateId();
      const dashboard: CustomDashboard = {
        ...dashboardDefinition,
        id,
        created_at: new Date(),
        last_modified: new Date(),
        view_count: 0
      };

      // Validate dashboard configuration
      await this.validateDashboard(dashboard);

      // Initialize dashboard widgets
      await this.initializeDashboardWidgets(dashboard);

      this.dashboards.set(id, dashboard);

      console.log(`Custom dashboard created: ${dashboard.name} (${id})`);
      return id;

    } catch (error) {
      console.error('Error creating dashboard:', error);
      throw error;
    }
  }

  /**
   * Generate dashboard data
   */
  public async generateDashboardData(
    dashboardId: string,
    filters?: Record<string, any>,
    positions?: DLMMPosition[]
  ): Promise<any> {
    try {
      const dashboard = this.dashboards.get(dashboardId);
      if (!dashboard) {
        throw new Error(`Dashboard not found: ${dashboardId}`);
      }

      const widgetData = await Promise.all(
        dashboard.widgets.map(widget => this.generateWidgetData(widget, filters, positions))
      );

      // Update view count
      dashboard.view_count++;

      return {
        dashboard: {
          id: dashboard.id,
          name: dashboard.name,
          layout: dashboard.layout,
          filters: dashboard.filters,
          last_updated: new Date()
        },
        widgets: dashboard.widgets.map((widget, index) => ({
          ...widget,
          data: widgetData[index]
        }))
      };

    } catch (error) {
      console.error(`Error generating dashboard data ${dashboardId}:`, error);
      throw error;
    }
  }

  /**
   * Install analytics template
   */
  public async installTemplate(templateId: string, customizations?: Record<string, any>): Promise<{
    metrics: string[];
    dashboards: string[];
  }> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      const installedMetrics: string[] = [];
      const installedDashboards: string[] = [];

      // Install metrics
      for (const metricTemplate of template.metrics) {
        const customizedMetric = this.applyCustomizations(metricTemplate, customizations);
        const metricId = await this.createMetric(customizedMetric);
        installedMetrics.push(metricId);
      }

      // Install dashboards
      for (const dashboardTemplate of template.dashboards) {
        const customizedDashboard = this.applyCustomizations(dashboardTemplate, customizations);
        // Update widget data sources to reference newly created metrics
        this.updateDashboardMetricReferences(customizedDashboard, template.metrics, installedMetrics);
        const dashboardId = await this.createDashboard(customizedDashboard);
        installedDashboards.push(dashboardId);
      }

      // Update template download count
      template.downloads++;

      console.log(`Template installed: ${template.name} (${templateId})`);
      return { metrics: installedMetrics, dashboards: installedDashboards };

    } catch (error) {
      console.error(`Error installing template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Create custom API endpoint
   */
  public async createApiEndpoint(endpointDefinition: Omit<CustomApiEndpoint, 'id' | 'created_at' | 'usage_stats'>): Promise<string> {
    try {
      const id = this.generateId();
      const endpoint: CustomApiEndpoint = {
        ...endpointDefinition,
        id,
        created_at: new Date(),
        usage_stats: {
          total_requests: 0,
          avg_response_time: 0,
          error_rate: 0,
          last_used: new Date(),
          usage_by_user: {},
          usage_trend: []
        }
      };

      // Validate endpoint configuration
      await this.validateApiEndpoint(endpoint);

      // Register endpoint
      this.apiEndpoints.set(id, endpoint);

      console.log(`Custom API endpoint created: ${endpoint.path} (${id})`);
      return id;

    } catch (error) {
      console.error('Error creating API endpoint:', error);
      throw error;
    }
  }

  /**
   * Execute custom API endpoint
   */
  public async executeApiEndpoint(
    endpointId: string,
    request: any,
    context: any
  ): Promise<any> {
    try {
      const endpoint = this.apiEndpoints.get(endpointId);
      if (!endpoint || !endpoint.enabled) {
        throw new Error(`Endpoint not found or disabled: ${endpointId}`);
      }

      const startTime = Date.now();

      // Authenticate request
      await this.authenticateApiRequest(endpoint, request, context);

      // Apply rate limiting
      await this.applyApiRateLimit(endpoint, context);

      // Check cache
      const cacheKey = this.generateApiCacheKey(endpoint, request);
      if (endpoint.caching.enabled) {
        const cached = this.getCachedApiResponse(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Execute endpoint handler
      const response = await this.executeApiHandler(endpoint, request, context);

      // Cache response
      if (endpoint.caching.enabled) {
        this.cacheApiResponse(cacheKey, response, endpoint.caching.ttl);
      }

      // Update usage statistics
      const responseTime = Date.now() - startTime;
      this.updateApiUsageStats(endpoint, responseTime, true, context);

      return response;

    } catch (error) {
      const responseTime = Date.now() - Date.now();
      const endpoint = this.apiEndpoints.get(endpointId);
      if (endpoint) {
        this.updateApiUsageStats(endpoint, responseTime, false, context);
      }
      console.error(`Error executing API endpoint ${endpointId}:`, error);
      throw error;
    }
  }

  /**
   * Create scheduled report
   */
  public async createScheduledReport(reportDefinition: Omit<ScheduledReport, 'id' | 'created_at' | 'last_generated' | 'next_generation' | 'generation_count'>): Promise<string> {
    try {
      const id = this.generateId();
      const report: ScheduledReport = {
        ...reportDefinition,
        id,
        created_at: new Date(),
        generation_count: 0,
        next_generation: this.calculateNextGeneration(reportDefinition.schedule)
      };

      // Validate report configuration
      await this.validateScheduledReport(report);

      // Schedule report generation
      this.scheduleReportGeneration(report);

      this.reports.set(id, report);

      console.log(`Scheduled report created: ${report.name} (${id})`);
      return id;

    } catch (error) {
      console.error('Error creating scheduled report:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive framework analytics
   */
  public async generateFrameworkAnalytics(): Promise<CustomAnalyticsFramework> {
    try {
      const user_metrics = Array.from(this.metrics.values());
      const custom_dashboards = Array.from(this.dashboards.values());
      const analytics_templates = Array.from(this.templates.values());
      const data_sources = Array.from(this.dataSources.values());
      const notification_rules = Array.from(this.notifications.values());
      const scheduled_reports = Array.from(this.reports.values());
      const api_endpoints = Array.from(this.apiEndpoints.values());
      const visualization_configs = Array.from(this.visualizations.values());

      const user_preferences = await this.getUserPreferences();
      const framework_statistics = await this.calculateFrameworkStatistics();

      return {
        user_metrics,
        custom_dashboards,
        analytics_templates,
        data_sources,
        notification_rules,
        scheduled_reports,
        api_endpoints,
        visualization_configs,
        user_preferences,
        framework_statistics
      };

    } catch (error) {
      console.error('Error generating framework analytics:', error);
      throw error;
    }
  }

  /**
   * Helper methods for framework operations
   */
  private generateId(): string {
    return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async validateMetric(metric: UserDefinedMetric): Promise<void> {
    // Validate formula syntax
    if (!metric.formula.expression) {
      throw new Error('Metric formula expression is required');
    }

    // Validate data requirements
    for (const requirement of metric.data_requirements) {
      if (!requirement.source || !requirement.fields || requirement.fields.length === 0) {
        throw new Error('Invalid data requirement configuration');
      }
    }

    // Validate thresholds
    for (const threshold of metric.thresholds) {
      if (typeof threshold.value !== 'number' && !Array.isArray(threshold.value)) {
        throw new Error('Invalid threshold value');
      }
    }
  }

  private async testMetricCalculation(metric: UserDefinedMetric): Promise<void> {
    // Create test data
    const testData = this.generateTestData(metric);

    try {
      // Attempt calculation with test data
      await this.executeMetricFormula(metric, testData);
    } catch (error) {
      throw new Error(`Metric calculation test failed: ${(error as Error).message}`);
    }
  }

  private generateTestData(metric: UserDefinedMetric): Record<string, any> {
    const testData: Record<string, any> = {};

    for (const variable of metric.formula.variables) {
      switch (variable.type) {
        case 'position':
          testData[variable.name] = 100; // Mock position value
          break;
        case 'market':
          testData[variable.name] = 50; // Mock market value
          break;
        case 'portfolio':
          testData[variable.name] = 1000; // Mock portfolio value
          break;
        case 'constant':
          testData[variable.name] = variable.default_value || 1;
          break;
        default:
          testData[variable.name] = 0;
      }
    }

    return testData;
  }

  private async gatherMetricData(
    metric: UserDefinedMetric,
    positions: DLMMPosition[],
    portfolioData?: any,
    marketData?: any
  ): Promise<Record<string, any>> {
    const data: Record<string, any> = {};

    for (const variable of metric.formula.variables) {
      try {
        switch (variable.type) {
          case 'position':
            data[variable.name] = this.extractPositionData(positions, variable.path);
            break;
          case 'portfolio':
            data[variable.name] = this.extractPortfolioData(portfolioData, variable.path);
            break;
          case 'market':
            data[variable.name] = this.extractMarketData(marketData, variable.path);
            break;
          case 'external':
            data[variable.name] = await this.fetchExternalData(variable.source, variable.path);
            break;
          case 'constant':
            data[variable.name] = variable.default_value;
            break;
        }
      } catch (error) {
        if (variable.required) {
          throw error;
        }
        data[variable.name] = variable.default_value;
      }
    }

    return data;
  }

  private extractPositionData(positions: DLMMPosition[], path: string): any {
    // JSONPath-like extraction from positions
    if (path === 'count') return positions.length;
    if (path === 'totalValue') return positions.reduce((sum, pos) => sum + ((pos as any).totalValue || 0), 0);
    // Add more extraction logic as needed
    return 0;
  }

  private extractPortfolioData(portfolioData: any, path: string): any {
    if (!portfolioData) return 0;
    // JSONPath extraction from portfolio data
    return this.getNestedValue(portfolioData, path) || 0;
  }

  private extractMarketData(marketData: any, path: string): any {
    if (!marketData) return 0;
    // JSONPath extraction from market data
    return this.getNestedValue(marketData, path) || 0;
  }

  private async fetchExternalData(source: string, _path: string): Promise<any> {
    const dataSource = this.dataSources.get(source);
    if (!dataSource) {
      throw new Error(`Data source not found: ${source}`);
    }

    // Fetch data from external source
    // Implementation would depend on data source type
    return 0; // Placeholder
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async executeMetricFormula(metric: UserDefinedMetric, data: Record<string, any>): Promise<any> {
    // Create a safe execution context
    const context = { ...data };

    // Add built-in functions
    context.math = Math;
    context.sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    context.avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    context.min = (arr: number[]) => Math.min(...arr);
    context.max = (arr: number[]) => Math.max(...arr);

    // Add custom functions
    for (const func of metric.formula.functions) {
      if (func.implementation) {
        context[func.name] = new Function(...func.parameters.map(p => p.name), func.implementation);
      }
    }

    try {
      // Execute the formula (in a real implementation, use a safe eval alternative)
      const result = Function(...Object.keys(context), `return ${metric.formula.expression}`)(...Object.values(context));
      return result;
    } catch (error) {
      throw new Error(`Formula execution failed: ${(error as Error).message}`);
    }
  }

  private validateMetricResult(metric: UserDefinedMetric, result: any): void {
    // Validate result type
    if (metric.output_type === 'number' && typeof result !== 'number') {
      throw new Error(`Expected number result, got ${typeof result}`);
    }

    // Apply validation rules
    for (const rule of metric.validation_rules) {
      if (!this.validateRule(rule, result)) {
        throw new Error(rule.error_message);
      }
    }
  }

  private validateRule(rule: ValidationRule, value: any): boolean {
    switch (rule.type) {
      case 'range':
        const { min, max } = rule.configuration;
        return value >= min && value <= max;
      case 'pattern':
        const pattern = new RegExp(rule.configuration.pattern);
        return pattern.test(String(value));
      default:
        return true;
    }
  }

  private generateCacheKey(metricId: string, positions: DLMMPosition[], portfolioData?: any, marketData?: any): string {
    const hash = JSON.stringify({ metricId, positionCount: positions.length, portfolioData, marketData });
    return `metric_${metricId}_${this.simpleHash(hash)}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private isCacheValid(cached: any, frequency: string): boolean {
    const now = Date.now();
    const cacheTime = cached.timestamp;

    const validityPeriods: Record<string, number> = {
      'real_time': 0,
      'hourly': 60 * 60 * 1000,
      'daily': 24 * 60 * 60 * 1000,
      'weekly': 7 * 24 * 60 * 60 * 1000,
      'monthly': 30 * 24 * 60 * 60 * 1000
    };

    const validityPeriod = validityPeriods[frequency] || 0;
    return (now - cacheTime) < validityPeriod;
  }

  private cacheMetricResult(cacheKey: string, result: any, frequency: string): void {
    this.metricCache.set(cacheKey, {
      value: result,
      timestamp: Date.now(),
      frequency
    });
  }

  private async checkMetricThresholds(metric: UserDefinedMetric, result: any): Promise<void> {
    for (const threshold of metric.thresholds) {
      if (this.isThresholdTriggered(threshold, result)) {
        await this.triggerThresholdAction(metric, threshold, result);
      }
    }
  }

  private isThresholdTriggered(threshold: MetricThreshold, value: any): boolean {
    switch (threshold.operator) {
      case '>':
        return value > threshold.value;
      case '<':
        return value < threshold.value;
      case '>=':
        return value >= threshold.value;
      case '<=':
        return value <= threshold.value;
      case '==':
        return value === threshold.value;
      case '!=':
        return value !== threshold.value;
      case 'between':
        const [min, max] = Array.isArray(threshold.value) ? threshold.value : [0, 0];
        return value >= min && value <= max;
      case 'outside':
        const [minOut, maxOut] = Array.isArray(threshold.value) ? threshold.value : [0, 0];
        return value < minOut || value > maxOut;
      default:
        return false;
    }
  }

  private async triggerThresholdAction(metric: UserDefinedMetric, threshold: MetricThreshold, result: any): Promise<void> {
    if (!threshold.action?.enabled) return;

    console.log(`Threshold triggered for metric ${metric.name}: ${threshold.type} (${result})`);

    switch (threshold.action.type) {
      case 'alert':
        await this.sendAlert(metric, threshold, result);
        break;
      case 'email':
        await this.sendEmail(metric, threshold, result);
        break;
      case 'webhook':
        await this.callWebhook(metric, threshold, result);
        break;
      case 'function':
        await this.executeCustomFunction(metric, threshold, result);
        break;
    }
  }

  private async sendAlert(metric: UserDefinedMetric, threshold: MetricThreshold, result: any): Promise<void> {
    // Implementation for sending alerts
    console.log(`Alert: ${metric.name} threshold ${threshold.type} triggered with value ${result}`);
  }

  private async sendEmail(metric: UserDefinedMetric, threshold: MetricThreshold, result: any): Promise<void> {
    // Implementation for sending emails
    console.log(`Email: ${metric.name} threshold ${threshold.type} triggered with value ${result}`);
  }

  private async callWebhook(metric: UserDefinedMetric, threshold: MetricThreshold, result: any): Promise<void> {
    // Implementation for calling webhooks
    console.log(`Webhook: ${metric.name} threshold ${threshold.type} triggered with value ${result}`);
  }

  private async executeCustomFunction(metric: UserDefinedMetric, threshold: MetricThreshold, result: any): Promise<void> {
    // Implementation for executing custom functions
    console.log(`Function: ${metric.name} threshold ${threshold.type} triggered with value ${result}`);
  }

  // Additional helper methods would be implemented here for dashboard operations,
  // template management, API endpoints, etc.

  private async validateDashboard(dashboard: CustomDashboard): Promise<void> {
    // Validate dashboard layout
    if (!dashboard.layout || !dashboard.layout.type) {
      throw new Error('Dashboard layout configuration is required');
    }

    // Validate widgets
    for (const widget of dashboard.widgets) {
      if (!widget.type || !widget.title) {
        throw new Error('Widget type and title are required');
      }
    }
  }

  private async initializeDashboardWidgets(dashboard: CustomDashboard): Promise<void> {
    // Initialize widget data sources and configurations
    for (const widget of dashboard.widgets) {
      await this.validateWidgetDataSource(widget.data_source);
    }
  }

  private async validateWidgetDataSource(dataSource: WidgetDataSource): Promise<void> {
    if (dataSource.type === 'metric' && !this.metrics.has(dataSource.source)) {
      throw new Error(`Metric not found: ${dataSource.source}`);
    }
  }

  private async generateWidgetData(
    widget: DashboardWidget,
    _filters?: Record<string, any>,
    positions?: DLMMPosition[]
  ): Promise<any> {
    switch (widget.data_source.type) {
      case 'metric':
        if (positions) {
          return await this.calculateMetric(widget.data_source.source, positions);
        }
        return null;
      case 'static':
        return widget.data_source.parameters?.data || [];
      default:
        return null;
    }
  }

  private applyCustomizations(template: any, customizations?: Record<string, any>): any {
    if (!customizations) return template;

    // Deep merge customizations into template
    return this.deepMerge(template, customizations);
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  private updateDashboardMetricReferences(
    dashboard: CustomDashboard,
    templateMetrics: UserDefinedMetric[],
    installedMetricIds: string[]
  ): void {
    // Update widget data sources to reference newly created metrics
    dashboard.widgets.forEach(widget => {
      if (widget.data_source.type === 'metric') {
        const templateMetricIndex = templateMetrics.findIndex(
          m => m.name === widget.data_source.source
        );
        if (templateMetricIndex >= 0) {
          widget.data_source.source = installedMetricIds[templateMetricIndex];
        }
      }
    });
  }

  private loadBuiltInTemplates(): void {
    // Load built-in analytics templates
    const basicPortfolioTemplate: AnalyticsTemplate = {
      id: 'basic_portfolio',
      name: 'Basic Portfolio Analytics',
      description: 'Essential portfolio metrics and dashboard',
      category: 'Portfolio Management',
      use_case: 'Basic portfolio tracking and analysis',
      difficulty_level: 'beginner',
      metrics: [],
      dashboards: [],
      setup_instructions: [
        'Install the template',
        'Configure your portfolio data source',
        'Customize thresholds and alerts'
      ],
      author: 'System',
      version: '1.0.0',
      downloads: 0,
      rating: 4.5,
      reviews: [],
      tags: ['portfolio', 'basic', 'analytics'],
      compatible_data_sources: ['positions', 'market_data'],
      requirements: []
    };

    this.templates.set(basicPortfolioTemplate.id, basicPortfolioTemplate);
  }

  private setupDefaultDataSources(): void {
    // Set up default data sources
    const positionsDataSource: DataSourceConfig = {
      id: 'positions',
      name: 'Portfolio Positions',
      type: 'rest_api',
      configuration: {
        endpoint: '/api/positions',
        timeout: 30000
      },
      authentication: {
        type: 'none',
        credentials: {}
      },
      rate_limiting: {
        enabled: false,
        requests_per_minute: 60
      },
      caching: {
        enabled: true,
        ttl: 300,
        strategy: 'ttl'
      },
      health_check: {
        enabled: true,
        interval: 60,
        timeout: 5000,
        alert_on_failure: true
      },
      error_handling: {
        retry_strategy: 'exponential',
        max_retries: 3,
        timeout_strategy: 'cache',
        error_logging: true,
        alert_on_error: true
      },
      enabled: true,
      created_at: new Date(),
      last_tested: new Date(),
      test_results: []
    };

    this.dataSources.set(positionsDataSource.id, positionsDataSource);
  }

  private initializeMetricEngine(): void {
    // Initialize the metric calculation engine
    console.log('Metric calculation engine initialized');
  }

  private async validateApiEndpoint(endpoint: CustomApiEndpoint): Promise<void> {
    if (!endpoint.path || !endpoint.method) {
      throw new Error('API endpoint path and method are required');
    }

    if (!endpoint.handler || !endpoint.handler.type) {
      throw new Error('API endpoint handler configuration is required');
    }
  }

  private async authenticateApiRequest(endpoint: CustomApiEndpoint, _request: any, context: any): Promise<void> {
    if (!endpoint.authentication.required) return;

    // Implement authentication logic based on endpoint configuration
    // This is a simplified implementation
    if (!context.user) {
      throw new Error('Authentication required');
    }
  }

  private async applyApiRateLimit(endpoint: CustomApiEndpoint, context: any): Promise<void> {
    if (!endpoint.rate_limiting.enabled) return;

    // Implement rate limiting logic
    // This is a simplified implementation
    const userId = context.user?.id || 'anonymous';
    const now = Date.now();
    const windowKey = `${endpoint.id}_${userId}_${Math.floor(now / 60000)}`;

    // In a real implementation, you would use a distributed cache like Redis
    // For now, we'll just log the rate limit check
    console.log(`Rate limit check for ${windowKey}`);
  }

  private generateApiCacheKey(endpoint: CustomApiEndpoint, request: any): string {
    const requestHash = this.simpleHash(JSON.stringify(request));
    return `api_${endpoint.id}_${requestHash}`;
  }

  private getCachedApiResponse(_cacheKey: string): any {
    // Implement cache retrieval
    return null; // Placeholder
  }

  private cacheApiResponse(cacheKey: string, _response: any, ttl: number): void {
    // Implement response caching
    console.log(`Caching API response: ${cacheKey} (TTL: ${ttl}s)`);
  }

  private async executeApiHandler(endpoint: CustomApiEndpoint, request: any, context: any): Promise<any> {
    switch (endpoint.handler.type) {
      case 'metric_query':
        return await this.handleMetricQuery(endpoint.handler.configuration, request);
      case 'dashboard_export':
        return await this.handleDashboardExport(endpoint.handler.configuration, request);
      case 'data_aggregation':
        return await this.handleDataAggregation(endpoint.handler.configuration, request);
      case 'custom_function':
        return await this.handleCustomFunction(endpoint.handler.configuration, request, context);
      default:
        throw new Error(`Unknown handler type: ${endpoint.handler.type}`);
    }
  }

  private async handleMetricQuery(config: any, request: any): Promise<any> {
    // Handle metric query requests
    const metricId = config.metric_id || request.metric_id;
    if (!metricId) {
      throw new Error('Metric ID is required');
    }

    // This would integrate with the metric calculation system
    return { metric_id: metricId, value: Math.random() * 100 };
  }

  private async handleDashboardExport(config: any, request: any): Promise<any> {
    // Handle dashboard export requests
    const dashboardId = config.dashboard_id || request.dashboard_id;
    if (!dashboardId) {
      throw new Error('Dashboard ID is required');
    }

    return { dashboard_id: dashboardId, export_url: `/exports/${dashboardId}.pdf` };
  }

  private async handleDataAggregation(_config: any, _request: any): Promise<any> {
    // Handle data aggregation requests
    return { aggregated_data: [] };
  }

  private async handleCustomFunction(config: any, _request: any, _context: any): Promise<any> {
    // Handle custom function execution
    if (config.custom_code) {
      // In a real implementation, execute the custom code in a sandboxed environment
      return { result: 'Custom function executed' };
    }
    return { error: 'No custom code provided' };
  }

  private updateApiUsageStats(endpoint: CustomApiEndpoint, responseTime: number, success: boolean, context: any): void {
    endpoint.usage_stats.total_requests++;
    endpoint.usage_stats.avg_response_time =
      (endpoint.usage_stats.avg_response_time * (endpoint.usage_stats.total_requests - 1) + responseTime) /
      endpoint.usage_stats.total_requests;

    if (!success) {
      const errorCount = endpoint.usage_stats.total_requests * endpoint.usage_stats.error_rate + 1;
      endpoint.usage_stats.error_rate = errorCount / endpoint.usage_stats.total_requests;
    }

    endpoint.usage_stats.last_used = new Date();

    const userId = context.user?.id || 'anonymous';
    endpoint.usage_stats.usage_by_user[userId] = (endpoint.usage_stats.usage_by_user[userId] || 0) + 1;
  }

  private async validateScheduledReport(report: ScheduledReport): Promise<void> {
    if (!report.name || !report.schedule) {
      throw new Error('Report name and schedule are required');
    }

    if (report.dashboard_id && !this.dashboards.has(report.dashboard_id)) {
      throw new Error(`Dashboard not found: ${report.dashboard_id}`);
    }

    for (const metricId of report.metrics) {
      if (!this.metrics.has(metricId)) {
        throw new Error(`Metric not found: ${metricId}`);
      }
    }
  }

  private calculateNextGeneration(schedule: ReportSchedule): Date {
    const now = new Date();
    const nextGen = new Date(now);

    switch (schedule.frequency) {
      case 'daily':
        nextGen.setDate(nextGen.getDate() + 1);
        break;
      case 'weekly':
        nextGen.setDate(nextGen.getDate() + 7);
        break;
      case 'monthly':
        nextGen.setMonth(nextGen.getMonth() + 1);
        break;
      case 'quarterly':
        nextGen.setMonth(nextGen.getMonth() + 3);
        break;
      case 'yearly':
        nextGen.setFullYear(nextGen.getFullYear() + 1);
        break;
      case 'custom':
        // Parse cron expression if provided
        if (schedule.custom_cron) {
          // Simplified - would use a proper cron parser
          nextGen.setDate(nextGen.getDate() + 1);
        }
        break;
    }

    // Set the time
    const [hours, minutes] = schedule.time.split(':').map(Number);
    nextGen.setHours(hours, minutes, 0, 0);

    return nextGen;
  }

  private scheduleReportGeneration(report: ScheduledReport): void {
    // In a real implementation, this would integrate with a job scheduler
    console.log(`Scheduled report: ${report.name} - Next generation: ${report.next_generation}`);
  }

  private async getUserPreferences(): Promise<UserPreferences> {
    // Return default user preferences
    return {
      theme: 'light',
      timezone: 'UTC',
      date_format: 'YYYY-MM-DD',
      number_format: 'en-US',
      currency: 'USD',
      language: 'en',
      notification_preferences: {
        email_enabled: true,
        push_enabled: false,
        frequency_preference: 'digest',
        quiet_hours: {
          enabled: false,
          start_time: '22:00',
          end_time: '08:00',
          timezone: 'UTC',
          days: [0, 6]
        },
        notification_types: {
          alerts: true,
          reports: true,
          system: false
        }
      },
      privacy_settings: {
        data_sharing: false,
        usage_analytics: true,
        personalization: true,
        data_retention_period: 365,
        export_data_allowed: true
      },
      accessibility_settings: {
        high_contrast: false,
        large_fonts: false,
        reduced_motion: false,
        screen_reader_optimizations: false,
        keyboard_navigation_only: false
      },
      performance_settings: {
        real_time_updates: true,
        animation_level: 'full',
        data_quality: 'balanced',
        cache_preferences: {
          enabled: true,
          aggressive_caching: false,
          cache_duration: 300,
          auto_refresh: true
        }
      }
    };
  }

  private async calculateFrameworkStatistics(): Promise<FrameworkStatistics> {
    return {
      total_metrics: this.metrics.size,
      active_metrics: Array.from(this.metrics.values()).filter(m => m.usage_count > 0).length,
      total_dashboards: this.dashboards.size,
      active_dashboards: Array.from(this.dashboards.values()).filter(d => d.view_count > 0).length,
      total_users: 1, // Simplified
      active_users: 1, // Simplified
      api_calls_today: 150, // Mock data
      avg_response_time: 245, // Mock data
      error_rate: 0.02, // Mock data
      storage_usage: {
        total_size: 1024 * 1024 * 50, // 50MB
        dashboard_configs: 1024 * 1024 * 5,
        metric_definitions: 1024 * 1024 * 3,
        cached_data: 1024 * 1024 * 25,
        historical_data: 1024 * 1024 * 15,
        reports: 1024 * 1024 * 2
      },
      performance_metrics: {
        avg_metric_calculation_time: 125,
        avg_dashboard_load_time: 850,
        cache_hit_rate: 0.85,
        concurrent_users: 3,
        peak_memory_usage: 1024 * 1024 * 128, // 128MB
        cpu_utilization: 0.25
      },
      usage_trends: []
    };
  }

  /**
   * Get all user-defined metrics
   */
  public getUserMetrics(): UserDefinedMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get all custom dashboards
   */
  public getCustomDashboards(): CustomDashboard[] {
    return Array.from(this.dashboards.values());
  }

  /**
   * Get all available templates
   */
  public getAnalyticsTemplates(): AnalyticsTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Delete a custom metric
   */
  public deleteMetric(metricId: string): boolean {
    return this.metrics.delete(metricId);
  }

  /**
   * Delete a custom dashboard
   */
  public deleteDashboard(dashboardId: string): boolean {
    return this.dashboards.delete(dashboardId);
  }

  /**
   * Update a custom metric
   */
  public updateMetric(metricId: string, updates: Partial<UserDefinedMetric>): boolean {
    const metric = this.metrics.get(metricId);
    if (!metric) return false;

    const updatedMetric = { ...metric, ...updates, last_modified: new Date() };
    this.metrics.set(metricId, updatedMetric);
    return true;
  }

  /**
   * Update a custom dashboard
   */
  public updateDashboard(dashboardId: string, updates: Partial<CustomDashboard>): boolean {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;

    const updatedDashboard = { ...dashboard, ...updates, last_modified: new Date() };
    this.dashboards.set(dashboardId, updatedDashboard);
    return true;
  }

  /**
   * Clear all caches
   */
  public clearAllCaches(): void {
    this.metricCache.clear();
    console.log('All caches cleared');
  }
}

// Export singleton instance
export const customAnalyticsFramework = new CustomAnalyticsFrameworkEngine();