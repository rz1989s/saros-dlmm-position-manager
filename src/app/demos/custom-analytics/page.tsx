'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { StaggerList } from '@/components/animations/stagger-list'
import {
  Brain,
  BarChart3,
  Calculator,
  Target,
  Zap,
  Settings,
  Download,
  Upload,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Activity,
  Pause
} from 'lucide-react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const MOCK_POSITION_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  pnl: Math.random() * 1000 - 500,
  volume: Math.random() * 50000 + 10000,
  liquidity: Math.random() * 100000 + 50000,
  fees: Math.random() * 100 + 10,
  efficiency: Math.random() * 100,
  risk_score: Math.random() * 10,
  sharpe_ratio: (Math.random() * 2 - 1) * 3
}))

// Simplified metric interface for demo purposes
interface SimplifiedMetric {
  id: string
  name: string
  description: string
  category: string
  unit: string
  precision: number
  currentValue?: number
  trend?: 'up' | 'down' | 'neutral'
  lastUpdated?: Date
  created_by: string
  created_at: Date
  last_modified: Date
  usage_count: number
  performance_impact: 'low' | 'medium' | 'high'
}

const PREDEFINED_METRICS: SimplifiedMetric[] = [
  {
    id: 'daily-roi',
    name: 'Daily ROI',
    description: 'Return on investment calculated daily',
    category: 'Performance',
    unit: '%',
    precision: 2,
    created_by: 'System',
    created_at: new Date(),
    last_modified: new Date(),
    usage_count: 0,
    performance_impact: 'low'
  },
  {
    id: 'volatility-index',
    name: 'Volatility Index',
    description: 'Portfolio volatility measurement',
    category: 'Risk',
    unit: '',
    precision: 4,
    created_by: 'System',
    created_at: new Date(),
    last_modified: new Date(),
    usage_count: 0,
    performance_impact: 'medium'
  },
  {
    id: 'liquidity-efficiency',
    name: 'Liquidity Efficiency',
    description: 'Measure of liquidity utilization effectiveness',
    category: 'Efficiency',
    unit: '%',
    precision: 2,
    created_by: 'System',
    created_at: new Date(),
    last_modified: new Date(),
    usage_count: 0,
    performance_impact: 'low'
  }
]

// Simplified analytics templates for demo
interface SimpleTemplate {
  id: string
  name: string
  description: string
  category: string
  metrics: string[]
  tags: string[]
}

const ANALYTICS_TEMPLATES: SimpleTemplate[] = [
  {
    id: 'performance-dashboard',
    name: 'Performance Dashboard',
    description: 'Comprehensive performance tracking dashboard',
    category: 'Performance',
    metrics: ['daily-roi', 'volatility-index'],
    tags: ['performance', 'roi', 'volatility']
  },
  {
    id: 'risk-analysis',
    name: 'Risk Analysis Dashboard',
    description: 'Advanced risk management and analysis',
    category: 'Risk',
    metrics: ['volatility-index'],
    tags: ['risk', 'volatility', 'analysis']
  }
]

// ============================================================================
// INTERFACE DEFINITIONS
// ============================================================================

interface MetricBuilder {
  id: string
  name: string
  description: string
  category: string
  formula: string
  frequency: string
  outputType: string
  unit: string
  precision: number
}

interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'alert'
  title: string
  config: any
  position: { x: number; y: number; w: number; h: number }
}

interface CustomDashboardState {
  id: string
  name: string
  description: string
  widgets: DashboardWidget[]
  layout: any
}

// ============================================================================
// COMPONENT DEFINITION
// ============================================================================

export default function CustomAnalyticsFrameworkDemo() {
  // State management
  const [activeTab, setActiveTab] = useState('metrics')
  const [metrics, setMetrics] = useState<SimplifiedMetric[]>(PREDEFINED_METRICS)
  const [isCreatingMetric, setIsCreatingMetric] = useState(false)
  const [dashboards] = useState<CustomDashboardState[]>([])
  const [selectedDashboard] = useState<CustomDashboardState | null>(null)
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [metricBuilder, setMetricBuilder] = useState<MetricBuilder>({
    id: '',
    name: '',
    description: '',
    category: 'Performance',
    formula: '',
    frequency: 'daily',
    outputType: 'number',
    unit: '',
    precision: 2
  })

  // Mock data calculations
  const calculatedMetrics = useMemo(() => {
    return metrics.map(metric => {
      const latestData = MOCK_POSITION_DATA[MOCK_POSITION_DATA.length - 1]
      const previousData = MOCK_POSITION_DATA[MOCK_POSITION_DATA.length - 2]

      let value = 0
      let trend: 'up' | 'down' | 'neutral' = 'neutral'

      switch (metric.id) {
        case 'daily-roi':
          value = ((latestData.pnl - previousData.pnl) / Math.abs(previousData.pnl)) * 100
          trend = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral'
          break
        case 'volatility-index':
          const returns = MOCK_POSITION_DATA.slice(-7).map(d => d.pnl)
          const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length
          const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / returns.length
          value = Math.sqrt(variance) * Math.sqrt(365) / 1000
          trend = value > 0.5 ? 'up' : 'down'
          break
        case 'liquidity-efficiency':
          value = (latestData.fees / latestData.liquidity) * 365 * 100
          trend = value > 10 ? 'up' : value < 5 ? 'down' : 'neutral'
          break
        default:
          value = Math.random() * 100
          trend = 'neutral'
      }

      return {
        ...metric,
        currentValue: value,
        trend,
        lastUpdated: new Date()
      }
    })
  }, [metrics])

  // Event handlers
  const handleCreateMetric = useCallback(() => {
    if (!metricBuilder.name) return

    const newMetric: SimplifiedMetric = {
      id: metricBuilder.id || `custom-${Date.now()}`,
      name: metricBuilder.name,
      description: metricBuilder.description,
      category: metricBuilder.category,
      unit: metricBuilder.unit,
      precision: metricBuilder.precision,
      created_by: 'User',
      created_at: new Date(),
      last_modified: new Date(),
      usage_count: 0,
      performance_impact: 'low'
    }

    setMetrics(prev => [...prev, newMetric])
    setMetricBuilder({
      id: '',
      name: '',
      description: '',
      category: 'Performance',
      formula: '',
      frequency: 'daily',
      outputType: 'number',
      unit: '',
      precision: 2
    })
    setIsCreatingMetric(false)
  }, [metricBuilder])

  const handleDeleteMetric = useCallback((metricId: string) => {
    setMetrics(prev => prev.filter(m => m.id !== metricId))
  }, [])

  const toggleSimulation = useCallback(() => {
    setSimulationRunning(prev => !prev)
  }, [])

  const exportMetrics = useCallback(() => {
    const exportData = {
      metrics: calculatedMetrics,
      timestamp: new Date().toISOString(),
      dashboard_config: selectedDashboard
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [calculatedMetrics, selectedDashboard])

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <FeatureIdentifier
      feature={SDK_FEATURES[35]}
    >
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-blue-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Custom Analytics Framework Demo
            </h1>
          </div>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Build, customize, and deploy advanced analytics with user-defined metrics,
            custom dashboards, and automated reporting systems.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="text-sm">
              <Activity className="h-4 w-4 mr-1" />
              {calculatedMetrics.length} Active Metrics
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <BarChart3 className="h-4 w-4 mr-1" />
              {dashboards.length} Custom Dashboards
            </Badge>
            <Badge variant={simulationRunning ? "default" : "outline"} className="text-sm">
              <Zap className="h-4 w-4 mr-1" />
              {simulationRunning ? "Live Simulation" : "Paused"}
            </Badge>
          </div>
        </motion.div>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Analytics Control Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="simulation-toggle">Real-time Simulation</Label>
                  <Switch
                    id="simulation-toggle"
                    checked={simulationRunning}
                    onCheckedChange={toggleSimulation}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Data
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={exportMetrics}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>

                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Metrics Builder
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard Designer
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Analytics
            </TabsTrigger>
          </TabsList>

          {/* Metrics Builder Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">User-Defined Metrics</h3>
              <Button
                onClick={() => setIsCreatingMetric(true)}
                disabled={isCreatingMetric}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Metric
              </Button>
            </div>

            {isCreatingMetric && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Metric</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="metric-name">Metric Name</Label>
                      <Input
                        id="metric-name"
                        value={metricBuilder.name}
                        onChange={(e) => setMetricBuilder(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Custom ROI"
                      />
                    </div>

                    <div>
                      <Label htmlFor="metric-category">Category</Label>
                      <Select
                        value={metricBuilder.category}
                        onValueChange={(value) => setMetricBuilder(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Performance">Performance</SelectItem>
                          <SelectItem value="Risk">Risk</SelectItem>
                          <SelectItem value="Efficiency">Efficiency</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="metric-description">Description</Label>
                    <Textarea
                      id="metric-description"
                      value={metricBuilder.description}
                      onChange={(e) => setMetricBuilder(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this metric measures..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="metric-formula">Formula</Label>
                    <Textarea
                      id="metric-formula"
                      value={metricBuilder.formula}
                      onChange={(e) => setMetricBuilder(prev => ({ ...prev, formula: e.target.value }))}
                      placeholder="e.g., (profit - fees) / total_investment * 100"
                      rows={3}
                      className="font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="frequency">Update Frequency</Label>
                      <Select
                        value={metricBuilder.frequency}
                        onValueChange={(value) => setMetricBuilder(prev => ({ ...prev, frequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="real_time">Real-time</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="output-type">Output Type</Label>
                      <Select
                        value={metricBuilder.outputType}
                        onValueChange={(value) => setMetricBuilder(prev => ({ ...prev, outputType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="ratio">Ratio</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={metricBuilder.unit}
                        onChange={(e) => setMetricBuilder(prev => ({ ...prev, unit: e.target.value }))}
                        placeholder="%, $, ratio"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button onClick={handleCreateMetric}>
                      <Save className="h-4 w-4 mr-2" />
                      Create Metric
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingMetric(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              <StaggerList>
                {calculatedMetrics.map((metric) => (
                  <motion.div key={metric.id}>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{metric.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {metric.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                daily
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {metric.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">
                                  {metric.currentValue?.toFixed(metric.precision)}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {metric.unit}
                                </span>
                                {metric.trend === 'up' && (
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                )}
                                {metric.trend === 'down' && (
                                  <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Updated: {metric.lastUpdated?.toLocaleTimeString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {metric.created_by === 'User' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteMetric(metric.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </StaggerList>
            </div>
          </TabsContent>

          {/* Dashboard Designer Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Dashboard Designer</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Drag-and-drop dashboard builder with customizable widgets and layouts.
                Create visual representations of your custom metrics.
              </p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Dashboard
              </Button>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <h3 className="text-xl font-semibold">Analytics Templates</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ANALYTICS_TEMPLATES.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {template.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Included Metrics:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.metrics.map((metricId) => {
                          const metric = metrics.find(m => m.id === metricId)
                          return metric ? (
                            <Badge key={metricId} variant="outline" className="text-xs">
                              {metric.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Analytics Tab */}
          <TabsContent value="reports" className="space-y-6">
            <h3 className="text-xl font-semibold">Live Analytics Dashboard</h3>

            {/* Real-time Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calculatedMetrics.slice(0, 3).map((metric) => (
                <Card key={metric.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {metric.currentValue?.toFixed(metric.precision)}
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            {metric.unit}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          vs. previous period
                        </p>
                      </div>
                      <div className={`p-2 rounded-full ${
                        metric.trend === 'up' ? 'bg-green-100 text-green-600' :
                        metric.trend === 'down' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {metric.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                        {metric.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                        {metric.trend === 'neutral' && <Activity className="h-4 w-4" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={MOCK_POSITION_DATA}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        interval={Math.floor(MOCK_POSITION_DATA.length / 6)}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="pnl"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="efficiency"
                        stroke="hsl(var(--secondary))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        yAxisId="right"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Pipeline</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Operational</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Real-time Processing</span>
                    <div className="flex items-center gap-2">
                      {simulationRunning ? (
                        <>
                          <Activity className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600">Paused</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cache Performance</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">94%</span>
                      <Progress value={94} className="w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Daily ROI metric updated</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">2 minutes ago</p>
                  </div>

                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Activity className="h-4 w-4" />
                      <span>Volatility index recalculated</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">5 minutes ago</p>
                  </div>

                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-purple-600">
                      <BarChart3 className="h-4 w-4" />
                      <span>Performance dashboard accessed</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">12 minutes ago</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Framework Status: {metrics.length} metrics active, {dashboards.length} dashboards configured
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
                <Button variant="outline" size="sm" onClick={exportMetrics}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureIdentifier>
  )
}