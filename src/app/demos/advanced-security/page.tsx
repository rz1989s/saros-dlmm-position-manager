'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Lock, AlertTriangle, FileText } from 'lucide-react'

interface SecurityMetric {
  category: string
  score: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  incidents: number
  lastCheck: string
}

interface EncryptionConfig {
  id: string
  resource: string
  algorithm: string
  keySize: number
  status: 'active' | 'rotating' | 'expired'
  lastRotation: string
  nextRotation: string
}

interface ThreatDetection {
  id: string
  type: 'Brute Force' | 'SQL Injection' | 'XSS' | 'Rate Limit' | 'Suspicious Activity'
  severity: 'critical' | 'high' | 'medium' | 'low'
  source: string
  timestamp: string
  status: 'blocked' | 'monitoring' | 'resolved'
  details: string
}

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  result: 'success' | 'failure' | 'warning'
  ipAddress: string
}

export default function AdvancedSecurityDemo() {
  const securityMetrics: SecurityMetric[] = [
    { category: 'Authentication', score: 98, status: 'excellent', incidents: 0, lastCheck: '2 min ago' },
    { category: 'Data Encryption', score: 95, status: 'excellent', incidents: 0, lastCheck: '5 min ago' },
    { category: 'Access Control', score: 88, status: 'good', incidents: 2, lastCheck: '1 min ago' },
    { category: 'Threat Detection', score: 92, status: 'good', incidents: 5, lastCheck: '30 sec ago' },
    { category: 'Audit Compliance', score: 85, status: 'good', incidents: 1, lastCheck: '10 min ago' },
  ]

  const encryptionConfigs: EncryptionConfig[] = [
    {
      id: 'ENC-001',
      resource: 'User Credentials',
      algorithm: 'AES-256-GCM',
      keySize: 256,
      status: 'active',
      lastRotation: '2024-01-15',
      nextRotation: '2024-04-15',
    },
    {
      id: 'ENC-002',
      resource: 'API Keys',
      algorithm: 'RSA-4096',
      keySize: 4096,
      status: 'active',
      lastRotation: '2024-02-01',
      nextRotation: '2024-05-01',
    },
    {
      id: 'ENC-003',
      resource: 'Position Data',
      algorithm: 'ChaCha20-Poly1305',
      keySize: 256,
      status: 'rotating',
      lastRotation: '2024-03-01',
      nextRotation: '2024-06-01',
    },
    {
      id: 'ENC-004',
      resource: 'Transaction History',
      algorithm: 'AES-256-CBC',
      keySize: 256,
      status: 'active',
      lastRotation: '2024-01-20',
      nextRotation: '2024-04-20',
    },
  ]

  const threatDetections: ThreatDetection[] = [
    {
      id: 'THR-001',
      type: 'Brute Force',
      severity: 'critical',
      source: '192.168.1.100',
      timestamp: '2024-03-15 14:23:45',
      status: 'blocked',
      details: 'Multiple failed login attempts detected',
    },
    {
      id: 'THR-002',
      type: 'Rate Limit',
      severity: 'high',
      source: '10.0.0.25',
      timestamp: '2024-03-15 14:18:22',
      status: 'blocked',
      details: 'API rate limit exceeded (1500 req/min)',
    },
    {
      id: 'THR-003',
      type: 'Suspicious Activity',
      severity: 'medium',
      source: '172.16.0.50',
      timestamp: '2024-03-15 14:15:10',
      status: 'monitoring',
      details: 'Unusual position access pattern detected',
    },
    {
      id: 'THR-004',
      type: 'XSS',
      severity: 'high',
      source: '192.168.2.75',
      timestamp: '2024-03-15 14:10:05',
      status: 'blocked',
      details: 'Attempted XSS injection in input field',
    },
    {
      id: 'THR-005',
      type: 'SQL Injection',
      severity: 'critical',
      source: '10.0.1.200',
      timestamp: '2024-03-15 14:05:30',
      status: 'blocked',
      details: 'SQL injection attempt in query parameter',
    },
  ]

  const auditLogs: AuditLog[] = [
    {
      id: 'AUD-001',
      timestamp: '2024-03-15 14:25:00',
      user: 'admin@acmedefi.com',
      action: 'Position Modified',
      resource: 'POS-12345',
      result: 'success',
      ipAddress: '192.168.1.10',
    },
    {
      id: 'AUD-002',
      timestamp: '2024-03-15 14:22:15',
      user: 'trader@cryptollc.com',
      action: 'Liquidity Added',
      resource: 'POOL-SOL-USDC',
      result: 'success',
      ipAddress: '10.0.0.15',
    },
    {
      id: 'AUD-003',
      timestamp: '2024-03-15 14:20:30',
      user: 'user@example.com',
      action: 'Login Attempt',
      resource: 'AUTH',
      result: 'failure',
      ipAddress: '192.168.1.100',
    },
    {
      id: 'AUD-004',
      timestamp: '2024-03-15 14:18:45',
      user: 'api_client_001',
      action: 'Data Export',
      resource: 'PORTFOLIO-DATA',
      result: 'warning',
      ipAddress: '172.16.0.50',
    },
  ]

  const overallScore = Math.round(securityMetrics.reduce((sum, m) => sum + m.score, 0) / securityMetrics.length)
  const totalIncidents = securityMetrics.reduce((sum, m) => sum + m.incidents, 0)
  const activeThreats = threatDetections.filter((t) => t.status !== 'resolved').length

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-blue-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
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
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case 'success':
        return 'text-green-600'
      case 'failure':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Advanced Security Framework
          </h1>
          <p className="text-muted-foreground mt-2">
            End-to-end encryption, threat detection, and comprehensive audit logging
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #67
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}/100</div>
            <p className="text-xs text-muted-foreground">Overall security rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeThreats}</div>
            <p className="text-xs text-muted-foreground">Detected and monitoring</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidents}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Encryption Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">All data encrypted</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">
            <Shield className="h-4 w-4 mr-2" />
            Security Metrics
          </TabsTrigger>
          <TabsTrigger value="encryption">
            <Lock className="h-4 w-4 mr-2" />
            Encryption
          </TabsTrigger>
          <TabsTrigger value="threats">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Threat Detection
          </TabsTrigger>
          <TabsTrigger value="audit">
            <FileText className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Posture Metrics</CardTitle>
              <CardDescription>Real-time security monitoring and incident tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityMetrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{metric.category}</div>
                        <div className="text-sm text-muted-foreground">
                          Last check: {metric.lastCheck}
                        </div>
                      </div>
                      <Badge
                        variant={
                          metric.status === 'excellent' || metric.status === 'good'
                            ? 'default'
                            : metric.status === 'warning'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className={getStatusColor(metric.status)}
                      >
                        {metric.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Security Score</div>
                        <div className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                          {metric.score}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Incidents (24h)</div>
                        <div className={`text-2xl font-bold ${metric.incidents > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {metric.incidents}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Score</span>
                        <span className={`font-medium ${getScoreColor(metric.score)}`}>{metric.score}/100</span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className={`rounded-full h-2 ${
                            metric.score >= 90
                              ? 'bg-green-500'
                              : metric.score >= 75
                              ? 'bg-blue-500'
                              : metric.score >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${metric.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Encryption Configuration</CardTitle>
              <CardDescription>End-to-end encryption with automatic key rotation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {encryptionConfigs.map((config) => (
                  <div key={config.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{config.resource}</div>
                        <div className="text-sm text-muted-foreground">
                          {config.algorithm} • {config.keySize}-bit
                        </div>
                      </div>
                      <Badge
                        variant={config.status === 'active' ? 'default' : config.status === 'rotating' ? 'secondary' : 'destructive'}
                      >
                        {config.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Last Rotation</div>
                        <div className="font-medium">{config.lastRotation}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Next Rotation</div>
                        <div className="font-medium">{config.nextRotation}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Rotate Now
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <Button className="w-full" size="lg">
                    Configure Encryption
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Detection & Prevention</CardTitle>
              <CardDescription>Real-time threat monitoring and automated response</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatDetections.map((threat) => (
                  <div key={threat.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold flex items-center gap-2">
                          {threat.type}
                          <Badge
                            variant={
                              threat.severity === 'critical'
                                ? 'destructive'
                                : threat.severity === 'high'
                                ? 'secondary'
                                : 'outline'
                            }
                            className={getSeverityColor(threat.severity)}
                          >
                            {threat.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{threat.details}</div>
                      </div>
                      <Badge
                        variant={threat.status === 'blocked' ? 'default' : threat.status === 'monitoring' ? 'secondary' : 'outline'}
                      >
                        {threat.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Source IP</div>
                        <div className="font-medium font-mono">{threat.source}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Detected</div>
                        <div className="font-medium">{threat.timestamp}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Block Source
                      </Button>
                      {threat.status === 'monitoring' && (
                        <Button size="sm" variant="default">
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail & Compliance</CardTitle>
              <CardDescription>Comprehensive activity logging for compliance and forensics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{log.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.user} • {log.resource}
                        </div>
                      </div>
                      <Badge
                        variant={log.result === 'success' ? 'default' : log.result === 'failure' ? 'destructive' : 'secondary'}
                        className={getResultColor(log.result)}
                      >
                        {log.result.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Timestamp</div>
                        <div className="font-medium">{log.timestamp}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">IP Address</div>
                        <div className="font-medium font-mono">{log.ipAddress}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <Button className="w-full" size="lg">
                    Export Audit Logs
                  </Button>
                  <div className="text-xs text-center text-muted-foreground">
                    Logs retained for 90 days • SOC 2 Type II compliant
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