'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, Users, Shield, DollarSign } from 'lucide-react'

interface Tenant {
  id: string
  name: string
  type: 'Enterprise' | 'Team' | 'Individual'
  users: number
  positions: number
  volume: number
  status: 'active' | 'suspended' | 'trial'
  billingTier: string
}

interface ResourceQuota {
  resource: string
  allocated: number
  used: number
  limit: number
  utilization: number
  status: 'healthy' | 'warning' | 'critical'
}

interface AccessControl {
  feature: string
  enterprise: boolean
  team: boolean
  individual: boolean
  description: string
}

interface BillingMetric {
  tenant: string
  plan: string
  mrr: number
  usage: number
  overage: number
  totalBill: number
}

export default function MultiTenantSupportDemo() {
  const tenants: Tenant[] = [
    {
      id: 'TNT-001',
      name: 'Acme DeFi Fund',
      type: 'Enterprise',
      users: 25,
      positions: 150,
      volume: 2500000,
      status: 'active',
      billingTier: 'Enterprise Plus',
    },
    {
      id: 'TNT-002',
      name: 'Crypto Traders LLC',
      type: 'Team',
      users: 8,
      positions: 45,
      volume: 450000,
      status: 'active',
      billingTier: 'Team Pro',
    },
    {
      id: 'TNT-003',
      name: 'Solo Liquidity Provider',
      type: 'Individual',
      users: 1,
      positions: 12,
      volume: 75000,
      status: 'active',
      billingTier: 'Individual',
    },
    {
      id: 'TNT-004',
      name: 'Beta Testing Group',
      type: 'Team',
      users: 5,
      positions: 8,
      volume: 25000,
      status: 'trial',
      billingTier: 'Trial',
    },
  ]

  const resourceQuotas: ResourceQuota[] = [
    { resource: 'API Calls', allocated: 10000, used: 7200, limit: 10000, utilization: 72.0, status: 'healthy' },
    { resource: 'Active Positions', allocated: 50, used: 45, limit: 50, utilization: 90.0, status: 'warning' },
    { resource: 'Storage (GB)', allocated: 100, used: 68, limit: 100, utilization: 68.0, status: 'healthy' },
    { resource: 'User Seats', allocated: 25, used: 25, limit: 25, utilization: 100.0, status: 'critical' },
    { resource: 'Data Export', allocated: 1000, used: 450, limit: 1000, utilization: 45.0, status: 'healthy' },
  ]

  const accessControls: AccessControl[] = [
    {
      feature: 'Advanced Analytics',
      enterprise: true,
      team: true,
      individual: false,
      description: 'Portfolio analytics with custom metrics',
    },
    {
      feature: 'Multi-Position Management',
      enterprise: true,
      team: true,
      individual: true,
      description: 'Manage multiple DLMM positions',
    },
    {
      feature: 'White-Label Branding',
      enterprise: true,
      team: false,
      individual: false,
      description: 'Custom branding and domain',
    },
    {
      feature: 'API Access',
      enterprise: true,
      team: true,
      individual: false,
      description: 'Programmatic API integration',
    },
    {
      feature: 'Priority Support',
      enterprise: true,
      team: false,
      individual: false,
      description: 'Dedicated support team',
    },
    {
      feature: 'Batch Operations',
      enterprise: true,
      team: true,
      individual: false,
      description: 'Bulk position management',
    },
  ]

  const billingMetrics: BillingMetric[] = [
    { tenant: 'Acme DeFi Fund', plan: 'Enterprise Plus', mrr: 5000, usage: 4500, overage: 850, totalBill: 5850 },
    { tenant: 'Crypto Traders LLC', plan: 'Team Pro', mrr: 1200, usage: 1050, overage: 0, totalBill: 1200 },
    { tenant: 'Solo LP', plan: 'Individual', mrr: 299, usage: 250, overage: 0, totalBill: 299 },
    { tenant: 'Beta Testing', plan: 'Trial', mrr: 0, usage: 0, overage: 0, totalBill: 0 },
  ]

  const overallMetrics = {
    totalTenants: tenants.length,
    activeTenants: tenants.filter((t) => t.status === 'active').length,
    totalUsers: tenants.reduce((sum, t) => sum + t.users, 0),
    totalMrr: billingMetrics.reduce((sum, b) => sum + b.totalBill, 0),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'trial':
        return 'text-blue-600'
      case 'suspended':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getQuotaStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
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
            <Building2 className="h-8 w-8" />
            Multi-Tenant Support System
          </h1>
          <p className="text-muted-foreground mt-2">
            Enterprise-grade tenant isolation with resource management and billing
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #66
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalTenants}</div>
            <p className="text-xs text-muted-foreground">{overallMetrics.activeTenants} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Across all tenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${overallMetrics.totalMrr.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total MRR</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Revenue/Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(overallMetrics.totalMrr / overallMetrics.totalTenants).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Per active tenant</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tenants">
            <Building2 className="h-4 w-4 mr-2" />
            Tenants
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Users className="h-4 w-4 mr-2" />
            Resource Quotas
          </TabsTrigger>
          <TabsTrigger value="access">
            <Shield className="h-4 w-4 mr-2" />
            Access Control
          </TabsTrigger>
          <TabsTrigger value="billing">
            <DollarSign className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Management</CardTitle>
              <CardDescription>Complete tenant lifecycle and isolation management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{tenant.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {tenant.id} • {tenant.billingTier}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{tenant.type}</Badge>
                        <Badge
                          variant={tenant.status === 'active' ? 'default' : tenant.status === 'trial' ? 'secondary' : 'destructive'}
                          className={getStatusColor(tenant.status)}
                        >
                          {tenant.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Users</div>
                        <div className="font-medium">{tenant.users}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Positions</div>
                        <div className="font-medium">{tenant.positions}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Volume</div>
                        <div className="font-medium">${(tenant.volume / 1000).toFixed(0)}K</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Manage Users
                      </Button>
                      <Button size="sm" variant="outline">
                        Settings
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <Button className="w-full" size="lg">
                    Add New Tenant
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Quota Management</CardTitle>
              <CardDescription>Per-tenant resource allocation and usage tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resourceQuotas.map((quota, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{quota.resource}</div>
                        <div className="text-sm text-muted-foreground">
                          {quota.used.toLocaleString()} / {quota.limit.toLocaleString()} used
                        </div>
                      </div>
                      <Badge
                        variant={
                          quota.status === 'healthy' ? 'default' : quota.status === 'warning' ? 'secondary' : 'destructive'
                        }
                        className={getQuotaStatusColor(quota.status)}
                      >
                        {quota.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className={`font-medium ${getQuotaStatusColor(quota.status)}`}>
                          {quota.utilization.toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-secondary rounded-full h-2">
                        <div
                          className={`rounded-full h-2 ${
                            quota.status === 'healthy'
                              ? 'bg-green-500'
                              : quota.status === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${quota.utilization}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {quota.status === 'healthy' && 'Within normal limits'}
                        {quota.status === 'warning' && 'Approaching limit - consider upgrading'}
                        {quota.status === 'critical' && 'Limit reached - upgrade required'}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <Button className="w-full" size="lg">
                    Adjust Quotas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Access Control</CardTitle>
              <CardDescription>Tier-based feature availability matrix</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessControls.map((control, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="space-y-1">
                      <div className="font-semibold">{control.feature}</div>
                      <div className="text-sm text-muted-foreground">{control.description}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border rounded p-2 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Enterprise</div>
                        <Badge variant={control.enterprise ? 'default' : 'outline'}>
                          {control.enterprise ? '✓ Enabled' : '✗ Disabled'}
                        </Badge>
                      </div>
                      <div className="border rounded p-2 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Team</div>
                        <Badge variant={control.team ? 'default' : 'outline'}>
                          {control.team ? '✓ Enabled' : '✗ Disabled'}
                        </Badge>
                      </div>
                      <div className="border rounded p-2 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Individual</div>
                        <Badge variant={control.individual ? 'default' : 'outline'}>
                          {control.individual ? '✓ Enabled' : '✗ Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <Button className="w-full" size="lg">
                    Configure Access
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Revenue Tracking</CardTitle>
              <CardDescription>Usage-based billing with overage management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingMetrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{metric.tenant}</div>
                        <div className="text-sm text-muted-foreground">{metric.plan}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${metric.totalBill.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Monthly bill</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Base MRR</div>
                        <div className="font-medium">${metric.mrr.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Usage</div>
                        <div className="font-medium">${metric.usage.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Overage</div>
                        <div className={`font-medium ${metric.overage > 0 ? 'text-yellow-600' : ''}`}>
                          ${metric.overage.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {metric.overage > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
                        Overage charges applied - consider upgrading plan
                      </div>
                    )}
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total Monthly Revenue</span>
                    <span className="text-green-600">${overallMetrics.totalMrr.toLocaleString()}</span>
                  </div>
                  <Button className="w-full" size="lg">
                    Generate Invoice Reports
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}