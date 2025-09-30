'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, Activity, Webhook, Settings } from 'lucide-react'

interface Integration {
  id: string
  name: string
  provider: string
  status: 'active' | 'inactive' | 'error'
  type: 'Analytics' | 'Notifications' | 'Data Feed' | 'Payment'
  uptime: number
  requests: number
  lastSync: string
}

interface HealthMetric {
  service: string
  status: 'healthy' | 'degraded' | 'down'
  latency: number
  errorRate: number
  uptime: number
  lastCheck: string
}

interface WebhookConfig {
  id: string
  endpoint: string
  events: string[]
  status: 'active' | 'paused' | 'failed'
  successRate: number
  avgLatency: number
  lastTrigger: string
}

interface RateLimitConfig {
  service: string
  limit: number
  used: number
  window: string
  resetAt: string
  utilization: number
  status: 'healthy' | 'warning' | 'critical'
}

export default function APIPlatformDemo() {
  const integrations: Integration[] = [
    {
      id: 'INT-001',
      name: 'Pyth Network',
      provider: 'Pyth',
      status: 'active',
      type: 'Data Feed',
      uptime: 99.98,
      requests: 125000,
      lastSync: '2024-03-15 14:30:00',
    },
    {
      id: 'INT-002',
      name: 'Switchboard',
      provider: 'Switchboard',
      status: 'active',
      type: 'Data Feed',
      uptime: 99.95,
      requests: 98000,
      lastSync: '2024-03-15 14:29:45',
    },
    {
      id: 'INT-003',
      name: 'Helius RPC',
      provider: 'Helius',
      status: 'active',
      type: 'Data Feed',
      uptime: 99.92,
      requests: 245000,
      lastSync: '2024-03-15 14:30:10',
    },
    {
      id: 'INT-004',
      name: 'Discord Notifications',
      provider: 'Discord',
      status: 'active',
      type: 'Notifications',
      uptime: 99.87,
      requests: 5420,
      lastSync: '2024-03-15 14:25:30',
    },
    {
      id: 'INT-005',
      name: 'Telegram Alerts',
      provider: 'Telegram',
      status: 'inactive',
      type: 'Notifications',
      uptime: 0,
      requests: 0,
      lastSync: 'Never',
    },
  ]

  const healthMetrics: HealthMetric[] = [
    { service: 'Pyth Network', status: 'healthy', latency: 45, errorRate: 0.02, uptime: 99.98, lastCheck: '30 sec ago' },
    { service: 'Switchboard', status: 'healthy', latency: 52, errorRate: 0.05, uptime: 99.95, lastCheck: '25 sec ago' },
    { service: 'Helius RPC', status: 'healthy', latency: 38, errorRate: 0.08, uptime: 99.92, lastCheck: '15 sec ago' },
    { service: 'Discord', status: 'degraded', latency: 285, errorRate: 2.5, uptime: 99.87, lastCheck: '1 min ago' },
  ]

  const webhooks: WebhookConfig[] = [
    {
      id: 'WHK-001',
      endpoint: 'https://api.example.com/webhooks/position-updates',
      events: ['position.created', 'position.updated', 'position.closed'],
      status: 'active',
      successRate: 99.2,
      avgLatency: 145,
      lastTrigger: '2024-03-15 14:28:30',
    },
    {
      id: 'WHK-002',
      endpoint: 'https://api.example.com/webhooks/price-alerts',
      events: ['price.threshold', 'price.volatility'],
      status: 'active',
      successRate: 98.5,
      avgLatency: 210,
      lastTrigger: '2024-03-15 14:26:15',
    },
    {
      id: 'WHK-003',
      endpoint: 'https://api.example.com/webhooks/fee-collection',
      events: ['fee.collected', 'fee.pending'],
      status: 'paused',
      successRate: 85.2,
      avgLatency: 320,
      lastTrigger: '2024-03-15 10:15:00',
    },
  ]

  const rateLimits: RateLimitConfig[] = [
    { service: 'Pyth Network', limit: 10000, used: 7200, window: '1 hour', resetAt: '15:00:00', utilization: 72.0, status: 'healthy' },
    { service: 'Switchboard', limit: 5000, used: 4250, window: '1 hour', resetAt: '15:00:00', utilization: 85.0, status: 'warning' },
    { service: 'Helius RPC', limit: 25000, used: 24500, window: '1 hour', resetAt: '15:00:00', utilization: 98.0, status: 'critical' },
    { service: 'Discord API', limit: 1000, used: 450, window: '1 hour', resetAt: '15:00:00', utilization: 45.0, status: 'healthy' },
  ]

  const overallMetrics = {
    totalIntegrations: integrations.length,
    activeIntegrations: integrations.filter((i) => i.status === 'active').length,
    totalRequests: integrations.reduce((sum, i) => sum + i.requests, 0),
    avgUptime: (integrations.reduce((sum, i) => sum + i.uptime, 0) / integrations.length).toFixed(2),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
        return 'text-green-600'
      case 'inactive':
      case 'paused':
      case 'warning':
      case 'degraded':
        return 'text-yellow-600'
      case 'error':
      case 'failed':
      case 'down':
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
        return 'default'
      case 'inactive':
      case 'paused':
      case 'warning':
      case 'degraded':
        return 'secondary'
      case 'error':
      case 'failed':
      case 'down':
      case 'critical':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            API Integration Platform
          </h1>
          <p className="text-muted-foreground mt-2">
            Third-party service integrations with health monitoring and rate limiting
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #69
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalIntegrations}</div>
            <p className="text-xs text-muted-foreground">{overallMetrics.activeIntegrations} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(overallMetrics.totalRequests / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallMetrics.avgUptime}%</div>
            <p className="text-xs text-muted-foreground">All services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations">
            <Globe className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="health">
            <Activity className="h-4 w-4 mr-2" />
            Health Monitoring
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="ratelimits">
            <Settings className="h-4 w-4 mr-2" />
            Rate Limits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Integrations</CardTitle>
              <CardDescription>Third-party service connections and usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{integration.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {integration.provider} • {integration.type}
                        </div>
                      </div>
                      <Badge variant={getStatusBadge(integration.status)} className={getStatusColor(integration.status)}>
                        {integration.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Uptime</div>
                        <div className="font-medium">{integration.uptime}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Requests</div>
                        <div className="font-medium">{integration.requests.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last Sync</div>
                        <div className="font-medium">{integration.lastSync}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={integration.status === 'active' ? 'outline' : 'default'}>
                        {integration.status === 'active' ? 'Pause' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        View Logs
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <Button className="w-full" size="lg">
                    Add New Integration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Health Monitoring</CardTitle>
              <CardDescription>Real-time health metrics and performance monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{metric.service}</div>
                        <div className="text-sm text-muted-foreground">Last check: {metric.lastCheck}</div>
                      </div>
                      <Badge variant={getStatusBadge(metric.status)} className={getStatusColor(metric.status)}>
                        {metric.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Latency</div>
                        <div className="font-medium">{metric.latency}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Error Rate</div>
                        <div className={`font-medium ${metric.errorRate > 1 ? 'text-red-600' : 'text-green-600'}`}>
                          {metric.errorRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Uptime</div>
                        <div className="font-medium">{metric.uptime}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <div className={`font-medium ${getStatusColor(metric.status)}`}>{metric.status}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Health Score</span>
                        <span className={`font-medium ${getStatusColor(metric.status)}`}>
                          {metric.status === 'healthy' ? '100%' : metric.status === 'degraded' ? '75%' : '0%'}
                        </span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className={`rounded-full h-2 ${
                            metric.status === 'healthy' ? 'bg-green-500' : metric.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: metric.status === 'healthy' ? '100%' : metric.status === 'degraded' ? '75%' : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>Event-driven integrations and webhook management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="font-semibold font-mono text-sm">{webhook.endpoint}</div>
                        <div className="text-sm text-muted-foreground">Last trigger: {webhook.lastTrigger}</div>
                      </div>
                      <Badge variant={getStatusBadge(webhook.status)} className={getStatusColor(webhook.status)}>
                        {webhook.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event, i) => (
                        <Badge key={i} variant="outline">
                          {event}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Success Rate</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div className="bg-green-500 rounded-full h-2" style={{ width: `${webhook.successRate}%` }} />
                          </div>
                          <span className="text-sm font-medium text-green-600">{webhook.successRate}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Latency</div>
                        <div className="font-medium mt-1">{webhook.avgLatency}ms</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Test Webhook
                      </Button>
                      <Button size="sm" variant="outline">
                        View Logs
                      </Button>
                      <Button size="sm" variant={webhook.status === 'paused' ? 'default' : 'outline'}>
                        {webhook.status === 'paused' ? 'Resume' : 'Pause'}
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <Button className="w-full" size="lg">
                    Create New Webhook
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratelimits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Management</CardTitle>
              <CardDescription>API rate limits and usage tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rateLimits.map((limit, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{limit.service}</div>
                        <div className="text-sm text-muted-foreground">
                          {limit.used.toLocaleString()} / {limit.limit.toLocaleString()} requests ({limit.window})
                        </div>
                      </div>
                      <Badge variant={getStatusBadge(limit.status)} className={getStatusColor(limit.status)}>
                        {limit.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className={`font-medium ${getStatusColor(limit.status)}`}>{limit.utilization.toFixed(1)}%</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className={`rounded-full h-2 ${
                            limit.status === 'healthy' ? 'bg-green-500' : limit.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${limit.utilization}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Resets at: {limit.resetAt}</div>
                    </div>
                    {limit.utilization > 80 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
                        {limit.utilization > 95
                          ? '⚠️ Critical: Rate limit almost reached - consider upgrading'
                          : '⚠️ Warning: Approaching rate limit threshold'}
                      </div>
                    )}
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