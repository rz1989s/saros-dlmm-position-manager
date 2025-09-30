'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingDown, FileText, Calculator } from 'lucide-react'

interface TaxLotOpportunity {
  id: string
  position: string
  currentValue: number
  costBasis: number
  unrealizedLoss: number
  holdingPeriod: string
  taxSavings: number
  recommendation: string
}

interface HarvestingStrategy {
  name: string
  description: string
  potentialSavings: number
  positions: number
  riskLevel: 'low' | 'medium' | 'high'
  enabled: boolean
}

interface TaxReport {
  year: number
  totalGains: number
  totalLosses: number
  netGains: number
  taxLiability: number
  status: 'draft' | 'final' | 'filed'
  transactions: number
}

interface ComplianceItem {
  requirement: string
  status: 'compliant' | 'warning' | 'action-required'
  deadline: string
  description: string
}

export default function TaxOptimizationDemo() {
  const taxLotOpportunities: TaxLotOpportunity[] = [
    {
      id: 'TLO-001',
      position: 'SOL/USDC',
      currentValue: 12500,
      costBasis: 15000,
      unrealizedLoss: -2500,
      holdingPeriod: '45 days',
      taxSavings: 875,
      recommendation: 'High-priority harvest - significant short-term loss',
    },
    {
      id: 'TLO-002',
      position: 'BONK/SOL',
      currentValue: 8200,
      costBasis: 10000,
      unrealizedLoss: -1800,
      holdingPeriod: '120 days',
      taxSavings: 630,
      recommendation: 'Consider harvesting for tax savings',
    },
    {
      id: 'TLO-003',
      position: 'RAY/USDC',
      currentValue: 18500,
      costBasis: 20000,
      unrealizedLoss: -1500,
      holdingPeriod: '280 days',
      taxSavings: 375,
      recommendation: 'Long-term loss - lower tax rate applies',
    },
  ]

  const strategies: HarvestingStrategy[] = [
    {
      name: 'Aggressive Loss Harvesting',
      description: 'Maximize tax savings by harvesting all available losses while maintaining portfolio exposure',
      potentialSavings: 2850,
      positions: 3,
      riskLevel: 'high',
      enabled: false,
    },
    {
      name: 'Balanced Optimization',
      description: 'Harvest losses while considering wash sale rules and portfolio rebalancing needs',
      potentialSavings: 1880,
      positions: 2,
      riskLevel: 'medium',
      enabled: true,
    },
    {
      name: 'Conservative Approach',
      description: 'Only harvest significant losses with >50% certainty of tax benefit',
      potentialSavings: 875,
      positions: 1,
      riskLevel: 'low',
      enabled: false,
    },
  ]

  const taxReports: TaxReport[] = [
    {
      year: 2024,
      totalGains: 48500,
      totalLosses: 12800,
      netGains: 35700,
      taxLiability: 12495,
      status: 'draft',
      transactions: 156,
    },
    {
      year: 2023,
      totalGains: 32400,
      totalLosses: 8500,
      netGains: 23900,
      taxLiability: 8365,
      status: 'filed',
      transactions: 124,
    },
    {
      year: 2022,
      totalGains: 55200,
      totalLosses: 15600,
      netGains: 39600,
      taxLiability: 13860,
      status: 'filed',
      transactions: 198,
    },
  ]

  const complianceItems: ComplianceItem[] = [
    {
      requirement: 'Annual Tax Filing (Form 8949)',
      status: 'compliant',
      deadline: '2025-04-15',
      description: 'Capital gains and losses reporting for crypto transactions',
    },
    {
      requirement: 'Quarterly Estimated Taxes',
      status: 'warning',
      deadline: '2024-09-15',
      description: 'Q3 estimated tax payment due - calculate based on YTD gains',
    },
    {
      requirement: 'FBAR Reporting (FinCEN 114)',
      status: 'compliant',
      deadline: '2025-04-15',
      description: 'Foreign bank account reporting if applicable',
    },
    {
      requirement: 'State Tax Compliance',
      status: 'action-required',
      deadline: '2024-08-31',
      description: 'State-specific crypto tax requirements need review',
    },
  ]

  const overallMetrics = {
    totalPotentialSavings: taxLotOpportunities.reduce((sum, lot) => sum + lot.taxSavings, 0),
    totalUnrealizedLoss: Math.abs(taxLotOpportunities.reduce((sum, lot) => sum + lot.unrealizedLoss, 0)),
    ytdGains: taxReports[0].netGains,
    ytdTaxLiability: taxReports[0].taxLiability,
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'filed':
        return 'text-green-600'
      case 'warning':
      case 'draft':
        return 'text-yellow-600'
      case 'action-required':
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
            <DollarSign className="h-8 w-8" />
            Tax Optimization Suite
          </h1>
          <p className="text-muted-foreground mt-2">
            Tax-loss harvesting, gain/loss optimization, and compliance reporting
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #59
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Potential Tax Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${overallMetrics.totalPotentialSavings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Available to harvest</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unrealized Losses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -${overallMetrics.totalUnrealizedLoss.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">YTD Net Gains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overallMetrics.ytdGains.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">2024 taxable gains</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Estimated Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overallMetrics.ytdTaxLiability.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">2024 liability</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities">
            <TrendingDown className="h-4 w-4 mr-2" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger value="strategies">
            <Calculator className="h-4 w-4 mr-2" />
            Strategies
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Tax Reports
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <DollarSign className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax-Loss Harvesting Opportunities</CardTitle>
              <CardDescription>Positions with unrealized losses available for tax optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxLotOpportunities.map((lot) => (
                  <div key={lot.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{lot.position}</div>
                        <div className="text-sm text-muted-foreground">Holding period: {lot.holdingPeriod}</div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        ${lot.taxSavings} savings
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Current Value</div>
                        <div className="font-medium">${lot.currentValue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Cost Basis</div>
                        <div className="font-medium">${lot.costBasis.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Unrealized Loss</div>
                        <div className="font-medium text-red-600">${lot.unrealizedLoss.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                      💡 {lot.recommendation}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default">
                        Execute Harvest
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Simulate
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total Potential Savings</span>
                    <span className="text-green-600">${overallMetrics.totalPotentialSavings.toLocaleString()}</span>
                  </div>
                  <Button className="w-full" size="lg">
                    Execute All Recommended Harvests
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Harvesting Strategies</CardTitle>
              <CardDescription>Automated strategies for tax optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategies.map((strategy, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{strategy.name}</div>
                        <div className="text-sm text-muted-foreground">{strategy.description}</div>
                      </div>
                      <Badge variant={strategy.enabled ? 'default' : 'secondary'}>
                        {strategy.enabled ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Potential Savings</div>
                        <div className="text-2xl font-bold text-green-600">${strategy.potentialSavings}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Positions Affected</div>
                        <div className="text-2xl font-bold">{strategy.positions}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Risk Level</div>
                        <Badge variant="outline" className={getRiskColor(strategy.riskLevel)}>
                          {strategy.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={strategy.enabled ? 'outline' : 'default'}>
                        {strategy.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Reports & Statements</CardTitle>
              <CardDescription>Annual tax reporting and capital gains/losses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxReports.map((report, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">Tax Year {report.year}</div>
                        <div className="text-sm text-muted-foreground">{report.transactions} transactions</div>
                      </div>
                      <Badge
                        variant={report.status === 'filed' ? 'default' : report.status === 'draft' ? 'secondary' : 'outline'}
                        className={getStatusColor(report.status)}
                      >
                        {report.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Gains</div>
                        <div className="font-medium text-green-600">${report.totalGains.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Losses</div>
                        <div className="font-medium text-red-600">-${report.totalLosses.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Net Gains</div>
                        <div className="font-medium">${report.netGains.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Tax Liability</div>
                        <div className="text-2xl font-bold">${report.taxLiability.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Report
                      </Button>
                      <Button size="sm" variant="outline">
                        Export (PDF)
                      </Button>
                      <Button size="sm" variant="outline">
                        Download Form 8949
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <Button className="w-full" size="lg">
                    Generate 2024 Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Compliance Checklist</CardTitle>
              <CardDescription>Regulatory requirements and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="font-semibold">{item.requirement}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                      <Badge
                        variant={
                          item.status === 'compliant'
                            ? 'default'
                            : item.status === 'warning'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className={getStatusColor(item.status)}
                      >
                        {item.status === 'compliant' ? '✓ COMPLIANT' : item.status === 'warning' ? '⚠ WARNING' : '✗ ACTION REQUIRED'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Deadline</span>
                      <span className="font-medium">{item.deadline}</span>
                    </div>
                    {item.status !== 'compliant' && (
                      <Button size="sm" variant="default">
                        {item.status === 'warning' ? 'Review' : 'Take Action'}
                      </Button>
                    )}
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800">
                    <div className="font-semibold mb-2">💡 Compliance Tips</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Keep detailed records of all crypto transactions</li>
                      <li>Calculate cost basis using FIFO, LIFO, or specific identification</li>
                      <li>Report staking rewards and airdrops as ordinary income</li>
                      <li>Consider consulting a crypto tax professional</li>
                    </ul>
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