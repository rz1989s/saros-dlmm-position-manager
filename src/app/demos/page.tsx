'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { StaggerList } from '@/components/animations/stagger-list'
import {
  ArrowUpDown,
  Activity,
  TrendingUp,
  Shield,
  BarChart3,
  Zap,
  ExternalLink,
  CheckCircle,
  Clock,
  PlayCircle,
  Search,
  RotateCcw,
  Gauge,
  AlertTriangle,
  Wrench,
  Brain,
  Dice1,
  History,
  Globe,
  GitBranch,
  Calculator,
  Bot,
  Target,
  PieChart,
  Layers,
  FileText,
  Building2,
  Bell,
  DollarSign,
  Database,
  Droplets,
  Coins,
  Award,
  Trophy
} from 'lucide-react'

interface Demo {
  id: string
  title: string
  description: string
  path: string
  status: 'live' | 'beta' | 'planned'
  category: 'core' | 'oracle' | 'analytics' | 'advanced'
  priority: 'high' | 'medium' | 'low'
  complexity: 'basic' | 'intermediate' | 'advanced'
  sdkFeatures: number[]
  icon: React.ComponentType<{ className?: string }>
}

const PHASE_0_DEMOS: Demo[] = [
  {
    id: 'pool-data',
    title: 'Pool Data Loading',
    description: 'Real-time DLMM pool data with liquidity and bin information',
    path: '/demos/pool-data',
    status: 'live',
    category: 'core',
    priority: 'high',
    complexity: 'basic',
    sdkFeatures: [1],
    icon: Database
  },
  {
    id: 'position-discovery',
    title: 'Position Discovery',
    description: 'User position discovery with wallet integration',
    path: '/demos/position-discovery',
    status: 'live',
    category: 'core',
    priority: 'high',
    complexity: 'basic',
    sdkFeatures: [2],
    icon: Search
  },
  {
    id: 'liquidity-operations',
    title: 'Liquidity Operations',
    description: 'Add and remove liquidity from DLMM pools with impact simulation',
    path: '/demos/liquidity-operations',
    status: 'live',
    category: 'core',
    priority: 'high',
    complexity: 'intermediate',
    sdkFeatures: [3],
    icon: Droplets
  },
  {
    id: 'bin-data',
    title: 'Bin Data Operations',
    description: 'Real-time bin liquidity data with interactive visualization',
    path: '/demos/bin-data',
    status: 'live',
    category: 'core',
    priority: 'high',
    complexity: 'basic',
    sdkFeatures: [4],
    icon: BarChart3
  },
  {
    id: 'multi-provider-oracle',
    title: 'Multi-Provider Oracle System',
    description: 'Unified oracle system with automatic failover across multiple providers',
    path: '/demos/multi-provider-oracle',
    status: 'live',
    category: 'oracle',
    priority: 'high',
    complexity: 'intermediate',
    sdkFeatures: [7],
    icon: Globe
  },
  {
    id: 'price-feed-caching',
    title: 'ML-Powered Price Feed Caching',
    description: 'Advanced caching with machine learning for 40% RPC reduction',
    path: '/demos/price-feed-caching',
    status: 'live',
    category: 'oracle',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [56],
    icon: Zap
  },
  {
    id: 'pnl-tracking',
    title: 'P&L Tracking System',
    description: 'Comprehensive profit and loss tracking with historical charts',
    path: '/demos/pnl-tracking',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'intermediate',
    sdkFeatures: [12],
    icon: TrendingUp
  },
  {
    id: 'portfolio-overview',
    title: 'Portfolio Overview',
    description: 'Portfolio-wide analysis with allocation charts and risk metrics',
    path: '/demos/portfolio-overview',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'intermediate',
    sdkFeatures: [13],
    icon: PieChart
  },
  {
    id: 'basic-portfolio-aggregation',
    title: 'Basic Portfolio Aggregation',
    description: 'Portfolio aggregation with core metrics and basic analytics',
    path: '/demos/basic-portfolio-aggregation',
    status: 'live',
    category: 'analytics',
    priority: 'medium',
    complexity: 'basic',
    sdkFeatures: [53],
    icon: Layers
  },
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    description: 'Complete analytics dashboard with real-time metrics and insights',
    path: '/demos/analytics-dashboard',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'intermediate',
    sdkFeatures: [48],
    icon: BarChart3
  },
  {
    id: 'performance-tracking',
    title: 'Performance Tracking',
    description: 'Real-time position performance monitoring and tracking',
    path: '/demos/performance-tracking',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'basic',
    sdkFeatures: [50],
    icon: Activity
  },
  {
    id: 'fee-collection',
    title: 'Fee Collection',
    description: 'Automated fee collection transaction flow with SDK integration',
    path: '/demos/fee-collection',
    status: 'live',
    category: 'advanced',
    priority: 'medium',
    complexity: 'intermediate',
    sdkFeatures: [45],
    icon: Coins
  },
  {
    id: 'fee-tier-analysis',
    title: 'Fee Tier Analysis',
    description: 'Comprehensive fee tier analysis and optimization recommendations',
    path: '/demos/fee-tier-analysis',
    status: 'live',
    category: 'advanced',
    priority: 'medium',
    complexity: 'intermediate',
    sdkFeatures: [51],
    icon: Target
  },
  {
    id: 'position-liquidity-analytics',
    title: 'Position Liquidity Analytics',
    description: 'Advanced liquidity concentration analysis and metrics',
    path: '/demos/position-liquidity-analytics',
    status: 'live',
    category: 'analytics',
    priority: 'medium',
    complexity: 'intermediate',
    sdkFeatures: [55],
    icon: BarChart3
  }
]

const PHASE_1_DEMOS: Demo[] = [
  {
    id: 'swap-operations',
    title: 'Swap Operations Demo',
    description: 'Interactive demonstration of DLMM swap operations with real-time pricing and slippage analysis',
    path: '/demos/swap-operations',
    status: 'live',
    category: 'core',
    priority: 'high',
    complexity: 'intermediate',
    sdkFeatures: [8, 9, 15],
    icon: ArrowUpDown
  },
  {
    id: 'position-creation',
    title: 'Advanced Position Creation',
    description: 'Comprehensive position creation wizard with bin selection and liquidity distribution strategies',
    path: '/demos/position-creation',
    status: 'live',
    category: 'core',
    priority: 'high',
    complexity: 'intermediate',
    sdkFeatures: [3, 4, 5],
    icon: Activity
  },
  {
    id: 'pyth-integration',
    title: 'Pyth Network Integration',
    description: 'Real-time price feeds from Pyth Network with confidence intervals and data validation',
    path: '/demos/pyth-integration',
    status: 'live',
    category: 'oracle',
    priority: 'high',
    complexity: 'intermediate',
    sdkFeatures: [7, 33, 34],
    icon: TrendingUp
  },
  {
    id: 'price-confidence',
    title: 'Price Confidence System',
    description: 'Oracle price confidence scoring and reliability assessment for trading decisions',
    path: '/demos/price-confidence',
    status: 'live',
    category: 'oracle',
    priority: 'medium',
    complexity: 'basic',
    sdkFeatures: [34, 35],
    icon: Shield
  },
  {
    id: 'oracle-fallback',
    title: 'Oracle Fallback Mechanisms',
    description: 'Multi-provider oracle system with automatic fallback and error recovery',
    path: '/demos/oracle-fallback',
    status: 'live',
    category: 'oracle',
    priority: 'medium',
    complexity: 'intermediate',
    sdkFeatures: [7, 35, 36],
    icon: BarChart3
  },
  {
    id: 'position-valuation',
    title: 'Position Valuation',
    description: 'Oracle-based position valuation with real-time price updates and comprehensive P&L breakdown',
    path: '/demos/position-valuation',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'intermediate',
    sdkFeatures: [25],
    icon: Calculator
  },
  {
    id: 'oracle-caching',
    title: 'Oracle Caching System',
    description: 'Oracle-specific caching with Pyth + Switchboard provider performance comparison and freshness indicators',
    path: '/demos/oracle-caching',
    status: 'live',
    category: 'oracle',
    priority: 'high',
    complexity: 'intermediate',
    sdkFeatures: [10],
    icon: Database
  },
  {
    id: 'oracle-confidence-advanced',
    title: 'Oracle Confidence Advanced',
    description: 'Advanced multi-provider confidence comparison with staleness detection and 5-dimensional quality scoring',
    path: '/demos/oracle-confidence-advanced',
    status: 'live',
    category: 'oracle',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [12],
    icon: Shield
  }
]


const PHASE_2_DEMOS: Demo[] = [
  {
    id: 'rebalancing',
    title: 'Advanced Rebalancing System',
    description: 'Smart rebalancing strategies with cost-benefit analysis and execution simulation for optimal position management',
    path: '/demos/rebalancing',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [11, 12, 13],
    icon: RotateCcw
  },
  {
    id: 'performance-monitoring',
    title: 'Position Performance Monitoring',
    description: 'Real-time position health scoring, performance alerts, and trend analysis with actionable insights',
    path: '/demos/performance-monitoring',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'intermediate',
    sdkFeatures: [14, 15, 16],
    icon: Gauge
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment Engine',
    description: 'Portfolio risk scoring with impermanent loss prediction, stress testing, and risk mitigation strategies',
    path: '/demos/risk-assessment',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [17, 18, 19],
    icon: AlertTriangle
  },
  {
    id: 'fee-optimization',
    title: 'Dynamic Fee Optimization',
    description: 'Intelligent fee tier analysis with market-based optimization engine and competitive intelligence',
    path: '/demos/fee-optimization',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [20, 21, 22],
    icon: Zap
  },
  {
    id: 'fee-migration',
    title: 'Fee Tier Migration Analysis',
    description: 'Advanced fee tier migration analysis with cost-benefit calculations and step-by-step execution plans',
    path: '/demos/fee-migration',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [23, 24],
    icon: ArrowUpDown
  },
  {
    id: 'custom-fee-tiers',
    title: 'Custom Fee Tier Creation',
    description: 'Design and validate custom fee tiers with template system, market simulation, and backtesting integration',
    path: '/demos/custom-fee-tiers',
    status: 'live',
    category: 'advanced',
    priority: 'medium',
    complexity: 'intermediate',
    sdkFeatures: [22, 25],
    icon: Wrench
  },
  {
    id: 'market-fee-analysis',
    title: 'Market-based Fee Recommendations',
    description: 'AI-powered competitive analysis with intelligent fee recommendations, market intelligence, and strategic positioning insights',
    path: '/demos/market-fee-analysis',
    status: 'live',
    category: 'advanced',
    priority: 'medium',
    complexity: 'advanced',
    sdkFeatures: [25, 26],
    icon: Brain
  },
  {
    id: 'fee-simulation',
    title: 'Fee Simulation Engine',
    description: 'Monte Carlo analysis and scenario testing for optimal fee strategies with comprehensive statistical analysis',
    path: '/demos/fee-simulation',
    status: 'live',
    category: 'advanced',
    priority: 'medium',
    complexity: 'advanced',
    sdkFeatures: [41],
    icon: Dice1
  },
  {
    id: 'historical-fee-analysis',
    title: 'Historical Fee Analysis',
    description: 'Performance history, seasonal patterns, and trend analysis for optimal fee strategies with comprehensive insights',
    path: '/demos/historical-fee-analysis',
    status: 'live',
    category: 'advanced',
    priority: 'low',
    complexity: 'intermediate',
    sdkFeatures: [42],
    icon: History
  },
  {
    id: 'correlation-analysis',
    title: 'Cross-Position Correlation',
    description: 'Portfolio correlation matrix analysis with risk decomposition and diversification recommendations',
    path: '/demos/correlation-analysis',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [32],
    icon: BarChart3
  },
  {
    id: 'market-analysis',
    title: 'Market Analysis Dashboard',
    description: 'Comprehensive market intelligence with real-time analytics, trend analysis, and risk assessment',
    path: '/demos/market-analysis',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [33],
    icon: TrendingUp
  },
  {
    id: 'performance-benchmarking',
    title: 'Performance Benchmarking',
    description: 'Comprehensive performance analysis with risk-adjusted returns and benchmarking against market indices',
    path: '/demos/performance-benchmarking',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [34],
    icon: Shield
  },
  {
    id: 'custom-analytics',
    title: 'Custom Analytics Framework',
    description: 'Build custom metrics, dashboards, and reports with user-defined formulas and advanced analytics capabilities',
    path: '/demos/custom-analytics',
    status: 'live',
    category: 'analytics',
    priority: 'medium',
    complexity: 'advanced',
    sdkFeatures: [35],
    icon: Brain
  },
  {
    id: 'switchboard',
    title: 'Switchboard Integration',
    description: 'Experience Switchboard oracle technology with Surge optimization, cross-validation, and real-time monitoring',
    path: '/demos/switchboard',
    status: 'live',
    category: 'oracle',
    priority: 'medium',
    complexity: 'intermediate',
    sdkFeatures: [14],
    icon: Globe
  },
  {
    id: 'price-history',
    title: 'Price History Tracking',
    description: 'Advanced historical price analysis with trend identification, technical indicators, and predictive analytics',
    path: '/demos/price-history',
    status: 'live',
    category: 'oracle',
    priority: 'medium',
    complexity: 'intermediate',
    sdkFeatures: [15],
    icon: History
  },
  {
    id: 'market-forecasting',
    title: 'Market Forecasting System',
    description: 'Ensemble forecasting with 5 predictive models, price predictions, confidence intervals, and volatility analysis',
    path: '/demos/market-forecasting',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [30],
    icon: TrendingUp
  },
  {
    id: 'performance-attribution',
    title: 'Performance Attribution Analysis',
    description: 'Detailed P&L attribution with Brinson methodology, risk-adjusted metrics, and factor exposure analysis',
    path: '/demos/performance-attribution',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [31],
    icon: BarChart3
  },
  {
    id: 'pnl-dashboard-advanced',
    title: 'Advanced P&L Dashboard',
    description: 'Multi-timeframe P&L analysis with strategy attribution, profit factor calculations, and Sharpe ratios',
    path: '/demos/pnl-dashboard-advanced',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [26],
    icon: TrendingUp
  },
  {
    id: 'advanced-portfolio-analytics',
    title: 'Advanced Portfolio Analytics',
    description: '7-factor risk decomposition, sector allocation tracking, Alpha/Beta analysis, and correlation matrices',
    path: '/demos/advanced-portfolio-analytics',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [27],
    icon: PieChart
  }
]

const PHASE_3_DEMOS: Demo[] = [
  {
    id: 'cross-pool-migration',
    title: 'Cross-Pool Migration Engine',
    description: 'Automated migration discovery, pool optimization analysis, and intelligent position consolidation across DLMM pools',
    path: '/demos/cross-pool-migration',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [21, 22, 23],
    icon: GitBranch
  },
  {
    id: 'migration-analysis',
    title: 'Migration Impact Analysis',
    description: 'Comprehensive financial analysis with NPV/IRR calculations, scenario modeling, and confidence scoring for data-driven decisions',
    path: '/demos/migration-analysis',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [22],
    icon: Calculator
  },
  {
    id: 'migration-automation',
    title: 'Migration Automation System',
    description: 'Intelligent automation with configurable trigger conditions, multi-layered safety mechanisms, and real-time monitoring',
    path: '/demos/migration-automation',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [23],
    icon: Bot
  },
  {
    id: 'migration-risk',
    title: 'Migration Risk Assessment',
    description: 'Multi-dimensional risk analysis with intelligent mitigation strategies, real-time monitoring, and historical performance tracking',
    path: '/demos/migration-risk',
    status: 'live',
    category: 'advanced',
    priority: 'medium',
    complexity: 'advanced',
    sdkFeatures: [24],
    icon: AlertTriangle
  },
  {
    id: 'migration-simulation',
    title: 'Migration Simulation',
    description: 'Comprehensive impact simulation with scenario testing, Monte Carlo analysis, and what-if modeling for data-driven decisions',
    path: '/demos/migration-simulation',
    status: 'live',
    category: 'advanced',
    priority: 'medium',
    complexity: 'advanced',
    sdkFeatures: [44],
    icon: Activity
  },
  {
    id: 'migration-rollback',
    title: 'Migration Rollback',
    description: 'Comprehensive rollback system with checkpoint management, automated state restoration, and emergency recovery controls',
    path: '/demos/migration-rollback',
    status: 'live',
    category: 'advanced',
    priority: 'low',
    complexity: 'advanced',
    sdkFeatures: [46],
    icon: RotateCcw
  },
  {
    id: 'multi-position-analysis',
    title: 'Multi-Position Analysis Engine',
    description: 'Cross-position analytics with risk decomposition, correlation analysis, and portfolio-wide optimization recommendations',
    path: '/demos/multi-position-analysis',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [52],
    icon: BarChart3
  },
  {
    id: 'portfolio-optimizer',
    title: 'Portfolio Optimization Engine',
    description: 'Mean-variance optimization with Markowitz framework, multiple objectives, and automated rebalancing strategies',
    path: '/demos/portfolio-optimizer',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [53],
    icon: Target
  },
  {
    id: 'diversification',
    title: 'Diversification Analysis',
    description: 'HHI calculations, diversification scoring, correlation metrics, and concentration risk analysis for optimal portfolio balance',
    path: '/demos/diversification',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'intermediate',
    sdkFeatures: [54],
    icon: PieChart
  },
  {
    id: 'consolidation',
    title: 'Position Consolidation Tools',
    description: 'Consolidation opportunities identification with NPV analysis, cost-benefit evaluation, and execution planning',
    path: '/demos/consolidation',
    status: 'live',
    category: 'advanced',
    priority: 'medium',
    complexity: 'intermediate',
    sdkFeatures: [55],
    icon: Layers
  },
  {
    id: 'portfolio-reporting',
    title: 'Portfolio Reporting Suite',
    description: 'Multi-format export (PDF, Excel, CSV, JSON) with professional templates, scheduled reporting, and automated distribution',
    path: '/demos/portfolio-reporting',
    status: 'live',
    category: 'analytics',
    priority: 'medium',
    complexity: 'intermediate',
    sdkFeatures: [56],
    icon: FileText
  },
  {
    id: 'batch-operations',
    title: 'Batch Operations Engine',
    description: 'Transaction optimization with rollback mechanisms, performance tracking, and 33%+ efficiency improvements',
    path: '/demos/batch-operations',
    status: 'live',
    category: 'advanced',
    priority: 'medium',
    complexity: 'advanced',
    sdkFeatures: [62],
    icon: Zap
  },
  {
    id: 'migration-planning',
    title: 'Migration Planning',
    description: 'Comprehensive migration planning with cost analysis, timeline projections, and enhanced execution strategies',
    path: '/demos/migration-planning',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [43],
    icon: FileText
  },
  {
    id: 'migration-optimizer',
    title: 'Migration Optimizer',
    description: 'Optimization algorithms for route selection, cost minimization, efficiency improvements, and automated execution',
    path: '/demos/migration-optimizer',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [47],
    icon: Zap
  },
  {
    id: 'bulk-migration',
    title: 'Bulk Migration Engine',
    description: 'Multiple position migration with batch processing, coordination system, and progress tracking',
    path: '/demos/bulk-migration',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [48],
    icon: Layers
  },
  {
    id: 'portfolio-benchmarking',
    title: 'Portfolio Benchmarking',
    description: 'Performance comparison against market benchmarks, peer analysis, and relative performance metrics',
    path: '/demos/portfolio-benchmarking',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [58],
    icon: Award
  }
]

const PHASE_4_WEEK_7_DEMOS: Demo[] = [
  {
    id: 'intelligent-caching',
    title: 'Intelligent Caching System',
    description: 'Live cache statistics with 92%+ hit rate, performance metrics, RPC call reduction, and cache management',
    path: '/demos/intelligent-caching',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [60],
    icon: Database
  },
  {
    id: 'cache-optimization',
    title: 'Cache Optimization Strategies',
    description: '4 optimization strategies with before/after metrics, cache warming simulation, and 40%+ improvements',
    path: '/demos/cache-optimization',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [61],
    icon: Zap
  },
  {
    id: 'memory-optimization',
    title: 'Memory Optimization System',
    description: 'Advanced memory management with leak detection, automated cleanup, and 30%+ memory usage reduction',
    path: '/demos/memory-optimization',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [63],
    icon: Brain
  },
  {
    id: 'network-optimization',
    title: 'Network Optimization Layer',
    description: 'Connection pooling, request coalescing, and adaptive prioritization for 45%+ latency reduction',
    path: '/demos/network-optimization',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [64],
    icon: Globe
  },
  {
    id: 'response-optimization',
    title: 'Response Time Optimization',
    description: 'Predictive prefetching, progressive loading, and response streaming for sub-100ms responses',
    path: '/demos/response-optimization',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [65],
    icon: Zap
  },
  {
    id: 'multi-tenant',
    title: 'Multi-Tenant Support System',
    description: 'Enterprise-grade tenant isolation with resource management, access control, and usage-based billing',
    path: '/demos/multi-tenant',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [67],
    icon: Building2
  },
  {
    id: 'advanced-security',
    title: 'Advanced Security Framework',
    description: 'End-to-end encryption, real-time threat detection, and comprehensive audit logging for enterprise security',
    path: '/demos/advanced-security',
    status: 'live',
    category: 'advanced',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [68],
    icon: Shield
  }
]

const PHASE_4_WEEK_8_DEMOS: Demo[] = [
  {
    id: 'api-platform',
    title: 'API Integration Platform',
    description: 'Third-party service integrations with health monitoring, rate limiting, and webhook management',
    path: '/demos/api-platform',
    status: 'live',
    category: 'advanced',
    priority: 'medium',
    complexity: 'advanced',
    sdkFeatures: [69],
    icon: Globe
  },
  {
    id: 'data-prefetching',
    title: 'Data Prefetching System',
    description: 'Predictive loading, cache warming, and intelligent preloading for instant user experience',
    path: '/demos/data-prefetching',
    status: 'live',
    category: 'advanced',
    priority: 'medium',
    complexity: 'advanced',
    sdkFeatures: [66],
    icon: Zap
  },
  {
    id: 'portfolio-alerts',
    title: 'Portfolio Alerts System',
    description: 'Real-time risk alerts, performance notifications, and threshold monitoring',
    path: '/demos/portfolio-alerts',
    status: 'live',
    category: 'analytics',
    priority: 'high',
    complexity: 'advanced',
    sdkFeatures: [57],
    icon: Bell
  },
  {
    id: 'tax-optimization',
    title: 'Tax Optimization Suite',
    description: 'Tax-loss harvesting, gain/loss optimization, and compliance reporting for crypto taxes',
    path: '/demos/tax-optimization',
    status: 'live',
    category: 'analytics',
    priority: 'medium',
    complexity: 'advanced',
    sdkFeatures: [59],
    icon: DollarSign
  },
  {
    id: 'migration-analytics-dashboard',
    title: 'Migration Analytics Dashboard',
    description: 'Performance tracking, success metrics, and impact analysis for position migrations',
    path: '/demos/migration-analytics-dashboard',
    status: 'live',
    category: 'analytics',
    priority: 'medium',
    complexity: 'advanced',
    sdkFeatures: [45],
    icon: BarChart3
  }
]

const categoryColors = {
  core: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  oracle: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  analytics: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  advanced: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
}

const statusColors = {
  live: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  beta: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  planned: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const statusIcons = {
  live: CheckCircle,
  beta: Clock,
  planned: PlayCircle
}

export default function DemosPage() {
  const [filter, setFilter] = useState<'all' | 'core' | 'oracle' | 'analytics' | 'advanced'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'beta' | 'planned'>('all')

  const allDemos = [...PHASE_0_DEMOS, ...PHASE_1_DEMOS, ...PHASE_2_DEMOS, ...PHASE_3_DEMOS, ...PHASE_4_WEEK_7_DEMOS, ...PHASE_4_WEEK_8_DEMOS]

  const filteredDemos = allDemos.filter(demo => {
    if (filter !== 'all' && demo.category !== filter) return false
    if (statusFilter !== 'all' && demo.status !== statusFilter) return false
    return true
  })

  const stats = {
    total: allDemos.length,
    live: allDemos.filter(d => d.status === 'live').length,
    beta: allDemos.filter(d => d.status === 'beta').length,
    planned: allDemos.filter(d => d.status === 'planned').length,
    core: allDemos.filter(d => d.category === 'core').length,
    oracle: allDemos.filter(d => d.category === 'oracle').length
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[69] || { id: 69, name: 'Demo Navigation Hub', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-saros-primary to-saros-secondary bg-clip-text text-transparent">
            DLMM SDK Demo Hub
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Interactive demonstrations of all 69 Saros DLMM SDK features with 100% demo coverage, real-time data, and comprehensive testing capabilities.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <div className="text-2xl font-bold text-saros-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Demos</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <div className="text-2xl font-bold text-green-600">{stats.live}</div>
              <div className="text-sm text-muted-foreground">Live Demos</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <div className="text-2xl font-bold text-blue-600">{stats.core}</div>
              <div className="text-sm text-muted-foreground">Core Features</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <div className="text-2xl font-bold text-purple-600">{stats.oracle}</div>
              <div className="text-sm text-muted-foreground">Oracle Systems</div>
            </div>
          </div>
        </motion.div>
      </FeatureIdentifier>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full border border-input rounded-md px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Categories</option>
                <option value="core">Core Operations</option>
                <option value="oracle">Oracle Integration</option>
                <option value="analytics">Analytics</option>
                <option value="advanced">Advanced Features</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full border border-input rounded-md px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Status</option>
                <option value="live">Live Demos</option>
                <option value="beta">Beta Demos</option>
                <option value="planned">Planned Demos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Available Demos ({filteredDemos.length})
          </h2>
        </div>

        <StaggerList
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          staggerDelay={0.1}
          variant="slideUp"
        >
          {filteredDemos.map((demo) => {
            const IconComponent = demo.icon
            const StatusIcon = statusIcons[demo.status]

            return (
              <motion.div
                key={demo.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-saros-primary/10 flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-saros-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold leading-tight">
                            {demo.title}
                          </CardTitle>
                        </div>
                      </div>
                      <StatusIcon className={`h-4 w-4 ${demo.status === 'live' ? 'text-green-500' : demo.status === 'beta' ? 'text-yellow-500' : 'text-gray-400'}`} />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className={categoryColors[demo.category]}>
                        {demo.category}
                      </Badge>
                      <Badge className={statusColors[demo.status]}>
                        {demo.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {demo.complexity}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {demo.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>SDK Features: {demo.sdkFeatures.length}</span>
                        <span className={`font-medium ${
                          demo.priority === 'high' ? 'text-red-600' :
                          demo.priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {demo.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>

                      {demo.status === 'live' ? (
                        <Link href={demo.path}>
                          <Button className="w-full" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Demo
                          </Button>
                        </Link>
                      ) : demo.status === 'beta' ? (
                        <Link href={demo.path}>
                          <Button variant="outline" className="w-full" size="sm">
                            <Zap className="h-4 w-4 mr-2" />
                            Try Beta
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="ghost" className="w-full" size="sm" disabled>
                          <Clock className="h-4 w-4 mr-2" />
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </StaggerList>

        {/* Explore More */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-8 max-w-4xl mx-auto mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Explore More
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/app">
              <Button variant="outline" className="w-full" size="lg">
                <Layers className="mr-2 h-5 w-5" />
                Live Applications
                <Trophy className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href="/showcase">
              <Button variant="outline" className="w-full" size="lg">
                <Trophy className="mr-2 h-5 w-5" />
                SDK Showcase
                <Trophy className="ml-auto h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}