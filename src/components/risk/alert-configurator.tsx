'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Activity,
  Target
} from 'lucide-react'

interface AlertRule {
  id: string
  name: string
  type: 'risk_score' | 'il' | 'value' | 'health'
  condition: 'above' | 'below'
  threshold: number
  enabled: boolean
  lastTriggered?: string
  triggerCount: number
}

export function AlertConfigurator() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: '1',
      name: 'High Portfolio Risk',
      type: 'risk_score',
      condition: 'above',
      threshold: 70,
      enabled: true,
      lastTriggered: '2 hours ago',
      triggerCount: 3
    },
    {
      id: '2',
      name: 'Significant IL Loss',
      type: 'il',
      condition: 'above',
      threshold: 5,
      enabled: true,
      triggerCount: 0
    },
    {
      id: '3',
      name: 'Portfolio Value Drop',
      type: 'value',
      condition: 'below',
      threshold: 10000,
      enabled: false,
      triggerCount: 0
    }
  ])

  const [newRule, setNewRule] = useState({
    name: '',
    type: 'risk_score' as const,
    condition: 'above' as const,
    threshold: 0
  })

  const handleAddRule = () => {
    if (newRule.name && newRule.threshold > 0) {
      const rule: AlertRule = {
        id: Date.now().toString(),
        name: newRule.name,
        type: newRule.type,
        condition: newRule.condition,
        threshold: newRule.threshold,
        enabled: true,
        triggerCount: 0
      }

      setAlertRules([...alertRules, rule])
      setNewRule({
        name: '',
        type: 'risk_score',
        condition: 'above',
        threshold: 0
      })
    }
  }

  const handleToggleRule = (id: string) => {
    setAlertRules(rules =>
      rules.map(rule =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    )
  }

  const handleDeleteRule = (id: string) => {
    setAlertRules(rules => rules.filter(rule => rule.id !== id))
  }

  // Recent alerts (last 24 hours)
  const recentAlerts = [
    {
      id: 'a1',
      rule: 'High Portfolio Risk',
      message: 'Portfolio risk score exceeded 70 (current: 72)',
      severity: 'high',
      timestamp: '2 hours ago',
      acknowledged: false
    },
    {
      id: 'a2',
      rule: 'Position Health Warning',
      message: 'SOL/USDC position health dropped to 65%',
      severity: 'medium',
      timestamp: '5 hours ago',
      acknowledged: true
    },
    {
      id: 'a3',
      rule: 'IL Threshold Reached',
      message: 'RAY/SOL impermanent loss reached 4.2%',
      severity: 'medium',
      timestamp: '1 day ago',
      acknowledged: true
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'risk_score':
        return <Target className="h-4 w-4" />
      case 'il':
        return <TrendingDown className="h-4 w-4" />
      case 'value':
        return <Activity className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'risk_score':
        return 'Risk Score'
      case 'il':
        return 'Impermanent Loss'
      case 'value':
        return 'Portfolio Value'
      case 'health':
        return 'Position Health'
      default:
        return type
    }
  }

  const getSeverityBadge = (severity: string) => {
    if (severity === 'high') return <Badge variant="destructive">High</Badge>
    if (severity === 'medium') return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Medium</Badge>
    return <Badge variant="outline">Low</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Active Alerts Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Alert System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Active Rules</p>
              <p className="text-3xl font-bold text-blue-600">
                {alertRules.filter(r => r.enabled).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">of {alertRules.length} total rules</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Alerts (24h)</p>
              <p className="text-3xl font-bold text-orange-600">
                {recentAlerts.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {recentAlerts.filter(a => !a.acknowledged).length} unacknowledged
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Total Triggers</p>
              <p className="text-3xl font-bold text-purple-600">
                {alertRules.reduce((sum, rule) => sum + rule.triggerCount, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create New Alert Rule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Create New Alert Rule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                placeholder="e.g., High Risk Alert"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="rule-type">Alert Type</Label>
              <select
                id="rule-type"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={newRule.type}
                onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
              >
                <option value="risk_score">Risk Score</option>
                <option value="il">Impermanent Loss</option>
                <option value="value">Portfolio Value</option>
                <option value="health">Position Health</option>
              </select>
            </div>

            <div>
              <Label htmlFor="rule-condition">Condition</Label>
              <select
                id="rule-condition"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={newRule.condition}
                onChange={(e) => setNewRule({ ...newRule, condition: e.target.value as any })}
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>

            <div>
              <Label htmlFor="rule-threshold">Threshold</Label>
              <Input
                id="rule-threshold"
                type="number"
                placeholder="e.g., 70"
                value={newRule.threshold || ''}
                onChange={(e) => setNewRule({ ...newRule, threshold: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <Button onClick={handleAddRule} className="w-full bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Alert Rule
          </Button>
        </CardContent>
      </Card>

      {/* Alert Rules List */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertRules.map((rule) => (
              <div
                key={rule.id}
                className={`border rounded-lg p-4 transition-all ${
                  rule.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-1 ${rule.enabled ? 'text-blue-600' : 'text-gray-400'}`}>
                      {getTypeIcon(rule.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{rule.name}</p>
                        {rule.enabled ? (
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {getTypeLabel(rule.type)} {rule.condition} {rule.threshold}
                        {rule.type === 'risk_score' || rule.type === 'il' || rule.type === 'health' ? '' : '$'}
                      </p>
                      {rule.lastTriggered && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last triggered: {rule.lastTriggered}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleRule(rule.id)}
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Triggers: </span>
                    <span className="font-medium">{rule.triggerCount}</span>
                  </div>
                  {rule.enabled && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      Monitoring
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${
                  alert.acknowledged ? 'bg-gray-50' : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertCircle className={`h-5 w-5 mt-0.5 ${alert.acknowledged ? 'text-gray-400' : 'text-orange-600'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{alert.rule}</p>
                        {getSeverityBadge(alert.severity)}
                      </div>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                    </div>
                  </div>

                  {alert.acknowledged ? (
                    <Badge variant="outline" className="flex-shrink-0">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      Acknowledged
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm">
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive alerts via email</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Browser Notifications</p>
                <p className="text-sm text-gray-600">Show desktop notifications</p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Alert Frequency</p>
                <p className="text-sm text-gray-600">Maximum alerts per hour</p>
              </div>
              <select className="h-9 px-3 rounded-md border border-input bg-background">
                <option value="5">5 per hour</option>
                <option value="10">10 per hour</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Quiet Hours</p>
                <p className="text-sm text-gray-600">Pause notifications during specific hours</p>
              </div>
              <Button variant="outline" size="sm">
                Set Hours
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
