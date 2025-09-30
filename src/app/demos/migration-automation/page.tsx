'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import {
  Bot,
  Zap,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Play,
  Pause,
  StopCircle,
  Bell,
  Clock,
  TrendingUp,
  Target,
  BarChart3,
  RefreshCw,
  Lock,
  Unlock
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDLMM } from '@/hooks/use-dlmm'

interface TriggerCondition {
  id: string
  name: string
  type: 'apr' | 'volume' | 'liquidity' | 'price' | 'time'
  operator: 'greater_than' | 'less_than' | 'equals' | 'range'
  threshold: number | { min: number; max: number }
  currentValue: number
  isTriggered: boolean
  priority: 'high' | 'medium' | 'low'
  enabled: boolean
}

interface SafetyMechanism {
  id: string
  name: string
  type: 'limit' | 'validation' | 'cooldown' | 'emergency'
  description: string
  status: 'active' | 'inactive' | 'triggered'
  config: {
    maxDailyMigrations?: number
    minPositionSize?: number
    cooldownPeriod?: number
    emergencyStop?: boolean
  }
}

interface AutomationRule {
  id: string
  name: string
  enabled: boolean
  triggers: TriggerCondition[]
  safety: SafetyMechanism[]
  schedule: {
    frequency: 'immediate' | 'daily' | 'weekly' | 'custom'
    time?: string
    days?: string[]
  }
  lastRun?: Date
  nextRun?: Date
  executionCount: number
  successRate: number
}

interface MonitoringAlert {
  id: string
  timestamp: Date
  severity: 'info' | 'warning' | 'error' | 'critical'
  type: string
  message: string
  action?: string
}

const MOCK_TRIGGERS: TriggerCondition[] = [
  {
    id: '1',
    name: 'APR Improvement Threshold',
    type: 'apr',
    operator: 'greater_than',
    threshold: 15,
    currentValue: 18.5,
    isTriggered: true,
    priority: 'high',
    enabled: true
  },
  {
    id: '2',
    name: 'Volume Increase',
    type: 'volume',
    operator: 'greater_than',
    threshold: 1000000,
    currentValue: 1250000,
    isTriggered: true,
    priority: 'high',
    enabled: true
  },
  {
    id: '3',
    name: 'Market Volatility',
    type: 'price',
    operator: 'less_than',
    threshold: 5,
    currentValue: 3.2,
    isTriggered: true,
    priority: 'medium',
    enabled: true
  },
  {
    id: '4',
    name: 'Scheduled Time Window',
    type: 'time',
    operator: 'equals',
    threshold: 0,
    currentValue: 1,
    isTriggered: false,
    priority: 'low',
    enabled: false
  }
]

const MOCK_SAFETY: SafetyMechanism[] = [
  {
    id: '1',
    name: 'Daily Migration Limit',
    type: 'limit',
    description: 'Maximum 3 migrations per day to prevent excessive activity',
    status: 'active',
    config: { maxDailyMigrations: 3 }
  },
  {
    id: '2',
    name: 'Minimum Position Size',
    type: 'validation',
    description: 'Only migrate positions larger than 100 SOL',
    status: 'active',
    config: { minPositionSize: 100 }
  },
  {
    id: '3',
    name: 'Cooldown Period',
    type: 'cooldown',
    description: '24-hour cooldown between migrations for same position',
    status: 'active',
    config: { cooldownPeriod: 24 }
  },
  {
    id: '4',
    name: 'Emergency Stop',
    type: 'emergency',
    description: 'Manual override to halt all automated migrations',
    status: 'inactive',
    config: { emergencyStop: false }
  }
]

const MOCK_AUTOMATION_RULE: AutomationRule = {
  id: 'rule-1',
  name: 'Optimal APR Migration',
  enabled: true,
  triggers: MOCK_TRIGGERS,
  safety: MOCK_SAFETY,
  schedule: {
    frequency: 'daily',
    time: '02:00 UTC',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  },
  lastRun: new Date(Date.now() - 86400000),
  nextRun: new Date(Date.now() + 3600000),
  executionCount: 47,
  successRate: 95.7
}

const MOCK_ALERTS: MonitoringAlert[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 300000),
    severity: 'info',
    type: 'Trigger Activated',
    message: 'APR improvement threshold met for SOL/USDC pool',
    action: 'Evaluating migration opportunity'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 600000),
    severity: 'warning',
    type: 'Safety Check',
    message: 'Daily migration limit approaching (2/3 used)',
    action: 'Monitoring remaining quota'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1800000),
    severity: 'info',
    type: 'Migration Complete',
    message: 'Successfully migrated position to higher APR pool',
    action: 'Monitoring performance'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 3600000),
    severity: 'error',
    type: 'Execution Failed',
    message: 'Migration failed due to insufficient gas',
    action: 'Retry scheduled'
  }
]

export default function MigrationAutomationDemo() {
  const { publicKey } = useWallet()
  const { connected } = useDLMM()
  const [automationEnabled, setAutomationEnabled] = useState(true)
  const [selectedRule] = useState(MOCK_AUTOMATION_RULE)
  const [alerts] = useState(MOCK_ALERTS)

  console.log('Migration automation demo initialized:', { connected, hasWallet: !!publicKey })

  const toggleAutomation = () => {
    setAutomationEnabled(!automationEnabled)
  }

  const getSeverityColor = (severity: MonitoringAlert['severity']) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'critical': return 'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-100'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority: TriggerCondition['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[23] || { id: 23, name: 'Migration Automation System', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-saros-primary to-saros-secondary flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-saros-primary to-saros-secondary bg-clip-text text-transparent">
              Migration Automation System
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Intelligent automation with configurable trigger conditions, multi-layered safety mechanisms, and real-time monitoring for hands-free position optimization.
          </p>
        </motion.div>
      </FeatureIdentifier>

      {/* Connection Status */}
      {!publicKey && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 dark:text-yellow-200">
                Connect your wallet to configure automation rules and monitor automated migrations.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Panel */}
      <Card className={automationEnabled ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-gray-200'}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${automationEnabled ? 'bg-green-500' : 'bg-gray-400'}`}>
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">
                  {automationEnabled ? 'Automation Active' : 'Automation Paused'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {automationEnabled
                    ? `Next execution in 1 hour • ${selectedRule.executionCount} runs • ${selectedRule.successRate}% success rate`
                    : 'All automated migrations are paused'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleAutomation}
                variant={automationEnabled ? 'destructive' : 'default'}
                size="lg"
                className="gap-2"
              >
                {automationEnabled ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause Automation
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Enable Automation
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="triggers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="triggers">Trigger Conditions</TabsTrigger>
          <TabsTrigger value="safety">Safety Mechanisms</TabsTrigger>
          <TabsTrigger value="schedule">Schedule & Rules</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring & Alerts</TabsTrigger>
        </TabsList>

        {/* Trigger Conditions Tab */}
        <TabsContent value="triggers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automated Trigger Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedRule.triggers.map((trigger) => (
                  <motion.div
                    key={trigger.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`border rounded-lg p-6 ${
                      trigger.isTriggered
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {trigger.isTriggered ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <Clock className="h-6 w-6 text-gray-400" />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold">{trigger.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {trigger.type} • {trigger.operator.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getPriorityColor(trigger.priority)}>
                          {trigger.priority.toUpperCase()}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className={trigger.enabled ? '' : 'opacity-50'}
                        >
                          {trigger.enabled ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Threshold</p>
                        <p className="text-lg font-bold">
                          {typeof trigger.threshold === 'number'
                            ? `${trigger.threshold}${trigger.type === 'apr' ? '%' : ''}`
                            : `${trigger.threshold.min}-${trigger.threshold.max}`
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Value</p>
                        <p className={`text-lg font-bold ${trigger.isTriggered ? 'text-green-600' : ''}`}>
                          {trigger.currentValue}{trigger.type === 'apr' ? '%' : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={trigger.isTriggered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {trigger.isTriggered ? 'TRIGGERED' : 'WAITING'}
                        </Badge>
                      </div>
                    </div>

                    {trigger.isTriggered && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                          <CheckCircle className="h-4 w-4" />
                          <span>Condition met - Migration opportunity detected</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Trigger Summary */}
              <Card className="mt-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Trigger Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedRule.triggers.filter(t => t.isTriggered).length} of {selectedRule.triggers.length} conditions met
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-saros-primary">
                        {Math.round((selectedRule.triggers.filter(t => t.isTriggered).length / selectedRule.triggers.length) * 100)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Trigger Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety Mechanisms Tab */}
        <TabsContent value="safety" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Multi-Layered Safety Mechanisms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedRule.safety.map((safety, index) => (
                  <motion.div
                    key={safety.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border rounded-lg p-6 ${
                      safety.status === 'active'
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                        : safety.status === 'triggered'
                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Shield className={`h-6 w-6 ${
                          safety.status === 'active' ? 'text-green-600' :
                          safety.status === 'triggered' ? 'text-red-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <h3 className="text-lg font-semibold">{safety.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{safety.type}</p>
                        </div>
                      </div>
                      <Badge className={
                        safety.status === 'active' ? 'bg-green-100 text-green-800' :
                        safety.status === 'triggered' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {safety.status.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{safety.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {safety.config.maxDailyMigrations && (
                        <div>
                          <p className="text-sm text-muted-foreground">Max Daily Migrations</p>
                          <p className="text-lg font-bold">{safety.config.maxDailyMigrations}</p>
                        </div>
                      )}
                      {safety.config.minPositionSize && (
                        <div>
                          <p className="text-sm text-muted-foreground">Min Position Size</p>
                          <p className="text-lg font-bold">{safety.config.minPositionSize} SOL</p>
                        </div>
                      )}
                      {safety.config.cooldownPeriod && (
                        <div>
                          <p className="text-sm text-muted-foreground">Cooldown Period</p>
                          <p className="text-lg font-bold">{safety.config.cooldownPeriod}h</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Emergency Stop */}
              <Card className="mt-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StopCircle className="h-8 w-8 text-red-600" />
                      <div>
                        <h4 className="text-lg font-semibold text-red-800 dark:text-red-200">Emergency Stop</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Immediately halt all automated migrations
                        </p>
                      </div>
                    </div>
                    <Button variant="destructive" size="lg">
                      <StopCircle className="h-4 w-4 mr-2" />
                      Emergency Stop
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule & Rules Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Automation Rules & Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Rule Overview */}
                <div className="border rounded-lg p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{selectedRule.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Automated rule for optimal position migrations
                      </p>
                    </div>
                    <Badge className={selectedRule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {selectedRule.enabled ? 'ENABLED' : 'DISABLED'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Execution Count</p>
                      <p className="text-2xl font-bold text-saros-primary">{selectedRule.executionCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">{selectedRule.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Run</p>
                      <p className="text-lg font-bold">1 day ago</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Run</p>
                      <p className="text-lg font-bold">in 1 hour</p>
                    </div>
                  </div>
                </div>

                {/* Schedule Configuration */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Execution Schedule</h4>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Frequency</p>
                          <Badge className="text-lg capitalize">{selectedRule.schedule.frequency}</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Execution Time</p>
                          <p className="text-lg font-semibold">{selectedRule.schedule.time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Active Days</p>
                          <div className="flex gap-2 flex-wrap">
                            {selectedRule.schedule.days?.map(day => (
                              <Badge key={day} variant="outline">{day}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Rule Components */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        Active Triggers
                      </h4>
                      <div className="space-y-2">
                        {selectedRule.triggers.filter(t => t.enabled).map(trigger => (
                          <div key={trigger.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span className="text-sm">{trigger.name}</span>
                            {trigger.isTriggered && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        Safety Checks
                      </h4>
                      <div className="space-y-2">
                        {selectedRule.safety.filter(s => s.status === 'active').map(safety => (
                          <div key={safety.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span className="text-sm">{safety.name}</span>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Edit Rule
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Run Now
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    View History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring & Alerts Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-Time Monitoring & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                          <p className="text-2xl font-bold">1</p>
                        </div>
                        <Target className="h-8 w-8 text-saros-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Triggered Today</p>
                          <p className="text-2xl font-bold text-green-600">3</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                          <p className="text-2xl font-bold text-saros-secondary">95.7%</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-saros-secondary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                          <p className="text-2xl font-bold text-yellow-600">2</p>
                        </div>
                        <Bell className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Alert Feed */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Recent Alerts & Activity</h4>
                  <div className="space-y-3">
                    {alerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            alert.severity === 'info' ? 'bg-blue-100 dark:bg-blue-950' :
                            alert.severity === 'warning' ? 'bg-yellow-100 dark:bg-yellow-950' :
                            alert.severity === 'error' ? 'bg-red-100 dark:bg-red-950' :
                            'bg-red-200 dark:bg-red-900'
                          }`}>
                            {alert.severity === 'info' && <Activity className="h-5 w-5 text-blue-600" />}
                            {alert.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                            {(alert.severity === 'error' || alert.severity === 'critical') && <AlertTriangle className="h-5 w-5 text-red-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{alert.type}</h4>
                                <Badge className={getSeverityColor(alert.severity)}>
                                  {alert.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {Math.round((Date.now() - alert.timestamp.getTime()) / 60000)} min ago
                              </span>
                            </div>
                            <p className="text-sm mb-2">{alert.message}</p>
                            {alert.action && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Action:</strong> {alert.action}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}