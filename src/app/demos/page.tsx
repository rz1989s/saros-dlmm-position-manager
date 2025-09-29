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
  History
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
  }
]

const EXISTING_DEMOS: Demo[] = [
  {
    id: 'pool-data',
    title: 'Pool Data Loading',
    description: 'Real-time DLMM pool data with liquidity and bin information',
    path: '/positions',
    status: 'live',
    category: 'core',
    priority: 'high',
    complexity: 'basic',
    sdkFeatures: [1],
    icon: Activity
  },
  {
    id: 'position-discovery',
    title: 'Position Discovery',
    description: 'User position discovery with wallet integration',
    path: '/positions',
    status: 'live',
    category: 'core',
    priority: 'high',
    complexity: 'basic',
    sdkFeatures: [2],
    icon: Search
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

  const allDemos = [...EXISTING_DEMOS, ...PHASE_1_DEMOS, ...PHASE_2_DEMOS]

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
            Interactive demonstrations of all 59 Saros DLMM SDK features with real-time data and comprehensive testing capabilities.
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
      </div>

      {/* Phase Information */}
      <Card className="border-saros-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-saros-primary" />
            Phase 1: Core Foundations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Currently implementing Phase 1 demos focusing on essential missing core operations and oracle integration.
            This phase adds 10 new interactive demonstrations to showcase comprehensive SDK capabilities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-saros-primary">{PHASE_1_DEMOS.length}</div>
              <div className="text-sm text-muted-foreground">New Demos</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-saros-secondary">44%</div>
              <div className="text-sm text-muted-foreground">Target Completion</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Real SDK</div>
              <div className="text-sm text-muted-foreground">Integration</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}