'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, AlertTriangle, TrendingUp, Settings } from 'lucide-react'

interface Alert {
  id: string
  type: 'Risk' | 'Performance' | 'Price' | 'Position'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  message: string
  timestamp: string
  status: 'active' | 'acknowledged' | 'resolved'
  position?: string
}

interface AlertRule {
  id: string
  name: string
  type: 'Risk Threshold' | 'Performance Alert' | 'Price Movement' | 'Position Health'
  condition: string
  threshold: string
  enabled: boolean
  triggered: number
  lastTriggered?: string
}

interface NotificationChannel {
  id: string
  type: 'Email' | 'Discord' | 'Telegram' | 'SMS' | 'Webhook'
  destination: string
  enabled: boolean
  priority: 'all' | 'high' | 'critical'
  deliveryRate: number
}

interface ThresholdMonitor {
  metric: string
  current: number
  threshold: number
  status: 'safe' | 'warning' | 'critical'
  trend: 'increasing' | 'stable' | 'decreasing'
  lastUpdate: string
}

export default function PortfolioAlertsDemo() {
  const alerts: Alert[] = [
    {
      id: 'ALT-001',
      type: 'Risk',
      severity: 'critical',
      title: 'High Impermanent Loss Detected',
      message: 'SOL/USDC position experiencing 12.5% IL - consider rebalancing',
      timestamp: '2024-03-15 14:25:00',
      status: 'active',
      position: 'SOL/USDC',
    },
    {
      id: 'ALT-002',
      type: 'Performance',
      severity: 'high',
      title: 'Position Underperforming',
      message: 'BONK/SOL APR dropped below 15% threshold (current: 12.3%)',
      timestamp: '2024-03-15 14:18:30',
      status: 'active',
      position: 'BONK/SOL',
    },
    {
      id: 'ALT-003',
      type: 'Price',
      severity: 'medium',
      title: 'Significant Price Movement',
      message: 'SOL price moved 8.5% in last hour - volatility spike detected',
      timestamp: '2024-03-15 14:10:15',
      status: 'acknowledged',
    },
    {
      id: 'ALT-004',
      type: 'Position',
      severity: 'high',
      title: 'Low Liquidity Warning',
      message: 'RAY/USDC position liquidity concentration in single bin',
      timestamp: '2024-03-15 13:55:00',
      status: 'resolved',
      position: 'RAY/USDC',
    },
  ]

  const alertRules: AlertRule[] = [
    {
      id: 'RULE-001',
      name: 'Impermanent Loss Alert',
      type: 'Risk Threshold',
      condition: 'IL exceeds threshold',
      threshold: '10%',
      enabled: true,
      triggered: 3,
      lastTriggered: '2024-03-15 14:25:00',
    },
    {
      id: 'RULE-002',
      name: 'APR Performance Alert',
      type: 'Performance Alert',
      condition: 'APR drops below minimum',
      threshold: '15%',
      enabled: true,
      triggered: 2,
      lastTriggered: '2024-03-15 14:18:30',
    },
    {
      id: 'RULE-003',
      name: 'Price Volatility Alert',
      type: 'Price Movement',
      condition: 'Price change in 1 hour',
      threshold: '5%',
      enabled: true,
      triggered: 8,
      lastTriggered: '2024-03-15 14:10:15',
    },
    {
      id: 'RULE-004',
      name: 'Position Health Check',
      type: 'Position Health',
      condition: 'Liquidity concentration',
      threshold: '80%',
      enabled: true,
      triggered: 1,
      lastTriggered: '2024-03-15 13:55:00',
    },
    {
      id: 'RULE-005',
      name: 'Portfolio Value Alert',
      type: 'Risk Threshold',
      condition: 'Total portfolio value drop',
      threshold: '20%',
      enabled: false,
      triggered: 0,
    },
  ]

  const notificationChannels: NotificationChannel[] = [
    {
      id: 'CH-001',
      type: 'Email',
      destination: 'user@example.com',
      enabled: true,
      priority: 'all',
      deliveryRate: 99.5,
    },
    {
      id: 'CH-002',
      type: 'Discord',
      destination: '#alerts-channel',
      enabled: true,
      priority: 'high',
      deliveryRate: 98.2,
    },
    {
      id: 'CH-003',
      type: 'Telegram',
      destination: '@trading_bot',
      enabled: true,
      priority: 'critical',
      deliveryRate: 99.8,
    },
    {
      id: 'CH-004',
      type: 'SMS',
      destination: '+1-555-0123',
      enabled: false,
      priority: 'critical',
      deliveryRate: 0,
    },
    {
      id: 'CH-005',
      type: 'Webhook',
      destination: 'https://api.example.com/alerts',
      enabled: true,
      priority: 'all',
      deliveryRate: 97.5,
    },
  ]

  const thresholdMonitors: ThresholdMonitor[] = [
    { metric: 'Portfolio Risk Score', current: 68, threshold: 75, status: 'safe', trend: 'increasing', lastUpdate: '2 min ago' },
    { metric: 'Average IL (%)', current: 8.5, threshold: 10, status: 'warning', trend: 'increasing', lastUpdate: '5 min ago' },
    { metric: 'Portfolio APR (%)', current: 18.2, threshold: 15, status: 'safe', trend: 'stable', lastUpdate: '1 min ago' },
    { metric: 'Liquidity Concentration', current: 85, threshold: 80, status: 'critical', trend: 'stable', lastUpdate: '3 min ago' },
  ]

  const overallMetrics = {
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter((a) => a.status === 'active').length,
    criticalAlerts: alerts.filter((a) => a.severity === 'critical').length,
    enabledRules: alertRules.filter((r) => r.enabled).length,
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Portfolio Alerts System
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time risk alerts, performance notifications, and threshold monitoring
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #57
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">{overallMetrics.activeAlerts} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallMetrics.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alert Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.enabledRules}</div>
            <p className="text-xs text-muted-foreground">Of {alertRules.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Notification Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationChannels.filter((c) => c.enabled).length}</div>
            <p className="text-xs text-muted-foreground">Active channels</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">
            <Bell className="h-4 w-4 mr-2" />
            Active Alerts
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Settings className="h-4 w-4 mr-2" />
            Alert Rules
          </TabsTrigger>
          <TabsTrigger value="channels">
            <TrendingUp className="h-4 w-4 mr-2" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="thresholds">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Thresholds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>Real-time portfolio alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {alert.title}
                          <Badge variant="outline">{alert.type}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{alert.message}</div>
                        {alert.position && (
                          <div className="text-xs text-muted-foreground">Position: {alert.position}</div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge
                          variant={
                            alert.severity === 'critical' || alert.severity === 'high'
                              ? 'destructive'
                              : alert.severity === 'medium'
                              ? 'secondary'
                              : 'outline'
                          }
                          className={getSeverityColor(alert.severity)}
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{alert.status.toUpperCase()}</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{alert.timestamp}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {alert.status === 'active' && (
                        <>
                          <Button size="sm" variant="outline">
                            Acknowledge
                          </Button>
                          <Button size="sm" variant="default">
                            Resolve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Rule Configuration</CardTitle>
              <CardDescription>Automated alert triggers and conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold flex items-center gap-2">
                          {rule.name}
                          <Badge variant="outline">{rule.type}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {rule.condition} • Threshold: {rule.threshold}
                        </div>
                      </div>
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? 'ENABLED' : 'DISABLED'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Times Triggered</div>
                        <div className="font-medium">{rule.triggered}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last Triggered</div>
                        <div className="font-medium">{rule.lastTriggered || 'Never'}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        {rule.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit Rule
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <Button className="w-full" size="lg">
                    Create New Rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Alert delivery methods and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationChannels.map((channel) => (
                  <div key={channel.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold flex items-center gap-2">
                          {channel.type}
                          <Badge variant="outline">{channel.destination}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Priority: {channel.priority} • Delivery rate: {channel.deliveryRate}%
                        </div>
                      </div>
                      <Badge variant={channel.enabled ? 'default' : 'secondary'}>
                        {channel.enabled ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Success Rate</span>
                        <span className="font-medium text-green-600">{channel.deliveryRate}%</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div className="bg-green-500 rounded-full h-2" style={{ width: `${channel.deliveryRate}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        {channel.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        Test
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <Button className="w-full" size="lg">
                    Add Channel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threshold Monitoring</CardTitle>
              <CardDescription>Real-time tracking of key portfolio metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {thresholdMonitors.map((monitor, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{monitor.metric}</div>
                        <div className="text-sm text-muted-foreground">
                          Threshold: {monitor.threshold} • Last update: {monitor.lastUpdate}
                        </div>
                      </div>
                      <Badge
                        variant={
                          monitor.status === 'safe' ? 'default' : monitor.status === 'warning' ? 'secondary' : 'destructive'
                        }
                        className={getStatusColor(monitor.status)}
                      >
                        {monitor.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Current</div>
                        <div className={`text-2xl font-bold ${getStatusColor(monitor.status)}`}>{monitor.current}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Threshold</div>
                        <div className="text-2xl font-bold">{monitor.threshold}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Trend</div>
                        <Badge variant="outline">{monitor.trend.toUpperCase()}</Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress to Threshold</span>
                        <span className={`font-medium ${getStatusColor(monitor.status)}`}>
                          {((monitor.current / monitor.threshold) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className={`rounded-full h-2 ${
                            monitor.status === 'safe'
                              ? 'bg-green-500'
                              : monitor.status === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((monitor.current / monitor.threshold) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}