'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, Calendar, Settings, FileSpreadsheet, Mail, Clock } from 'lucide-react'

interface ReportTemplate {
  id: string
  name: string
  description: string
  format: 'PDF' | 'Excel' | 'CSV' | 'JSON'
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  lastGenerated: string
  sections: number
}

interface ScheduledReport {
  id: string
  name: string
  template: string
  schedule: string
  recipients: string[]
  nextRun: string
  status: 'active' | 'paused'
}

interface ReportSection {
  name: string
  included: boolean
  description: string
}

export default function PortfolioReportingDemo() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('TPL-001')
  const [generating, setGenerating] = useState(false)

  const templates: ReportTemplate[] = [
    {
      id: 'TPL-001',
      name: 'Executive Summary',
      description: 'High-level portfolio performance overview for stakeholders',
      format: 'PDF',
      frequency: 'monthly',
      lastGenerated: '2 hours ago',
      sections: 5,
    },
    {
      id: 'TPL-002',
      name: 'Detailed Analytics',
      description: 'Comprehensive position-by-position analysis with metrics',
      format: 'Excel',
      frequency: 'weekly',
      lastGenerated: '1 day ago',
      sections: 12,
    },
    {
      id: 'TPL-003',
      name: 'Risk Report',
      description: 'Risk exposure, correlation, and stress test results',
      format: 'PDF',
      frequency: 'weekly',
      lastGenerated: '3 days ago',
      sections: 8,
    },
    {
      id: 'TPL-004',
      name: 'Transaction Log',
      description: 'Complete transaction history with costs and outcomes',
      format: 'CSV',
      frequency: 'daily',
      lastGenerated: '4 hours ago',
      sections: 3,
    },
    {
      id: 'TPL-005',
      name: 'Performance Attribution',
      description: 'P&L breakdown by position, strategy, and time period',
      format: 'Excel',
      frequency: 'monthly',
      lastGenerated: '5 days ago',
      sections: 10,
    },
  ]

  const scheduledReports: ScheduledReport[] = [
    {
      id: 'SCH-001',
      name: 'Weekly Executive Report',
      template: 'Executive Summary',
      schedule: 'Every Monday at 9:00 AM',
      recipients: ['team@example.com', 'executive@example.com'],
      nextRun: 'Mon, Oct 7 at 9:00 AM',
      status: 'active',
    },
    {
      id: 'SCH-002',
      name: 'Daily Transaction Summary',
      template: 'Transaction Log',
      schedule: 'Every day at 11:59 PM',
      recipients: ['accounting@example.com'],
      nextRun: 'Today at 11:59 PM',
      status: 'active',
    },
    {
      id: 'SCH-003',
      name: 'Monthly Performance Review',
      template: 'Performance Attribution',
      schedule: 'Last day of month at 5:00 PM',
      recipients: ['team@example.com', 'investors@example.com'],
      nextRun: 'Thu, Oct 31 at 5:00 PM',
      status: 'active',
    },
  ]

  const reportSections: ReportSection[] = [
    { name: 'Portfolio Overview', included: true, description: 'Total value, allocation, and summary metrics' },
    { name: 'Position Details', included: true, description: 'Individual position breakdown with P&L' },
    { name: 'Performance Metrics', included: true, description: 'Returns, risk, Sharpe ratio, and benchmarks' },
    { name: 'Risk Analysis', included: true, description: 'Risk decomposition and correlation matrix' },
    { name: 'Fee Analysis', included: true, description: 'Fees collected and fee tier performance' },
    { name: 'Transaction History', included: false, description: 'Complete transaction log with costs' },
    { name: 'Market Context', included: true, description: 'Market conditions and comparative analysis' },
    { name: 'Recommendations', included: false, description: 'AI-powered optimization suggestions' },
  ]

  const exportFormats = [
    { format: 'PDF', icon: FileText, description: 'Professional formatted document', color: 'text-red-600' },
    { format: 'Excel', icon: FileSpreadsheet, description: 'Editable spreadsheet with formulas', color: 'text-green-600' },
    { format: 'CSV', icon: FileText, description: 'Raw data export for analysis', color: 'text-blue-600' },
    { format: 'JSON', icon: FileText, description: 'Structured data for API integration', color: 'text-purple-600' },
  ]

  const handleGenerateReport = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
    }, 2000)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Portfolio Reporting Suite
          </h1>
          <p className="text-muted-foreground mt-2">
            Multi-format export, professional templates, and automated reporting
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Feature #32
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Report Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">Available templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledReports.length}</div>
            <p className="text-xs text-muted-foreground">Active schedules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Export Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exportFormats.length}</div>
            <p className="text-xs text-muted-foreground">Supported formats</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h</div>
            <p className="text-xs text-muted-foreground">Executive Summary</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </TabsTrigger>
          <TabsTrigger value="customize">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Pre-configured professional report templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 space-y-3 cursor-pointer transition-all ${
                      selectedTemplate === template.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{template.name}</div>
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                      </div>
                      <Badge variant="outline">{template.format}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Frequency</div>
                        <div className="font-medium capitalize">{template.frequency}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Sections</div>
                        <div className="font-medium">{template.sections} sections</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last Generated</div>
                        <div className="font-medium">{template.lastGenerated}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default">
                        Generate Now
                      </Button>
                      <Button size="sm" variant="outline">
                        Preview
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scheduled Reports</CardTitle>
                  <CardDescription>Automated report generation and distribution</CardDescription>
                </div>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{report.name}</div>
                        <div className="text-sm text-muted-foreground">{report.template}</div>
                      </div>
                      <Badge variant={report.status === 'active' ? 'default' : 'secondary'}>
                        {report.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Schedule
                        </div>
                        <div className="font-medium">{report.schedule}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Next Run
                        </div>
                        <div className="font-medium">{report.nextRun}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4" />
                        Recipients ({report.recipients.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {report.recipients.map((email, idx) => (
                          <Badge key={idx} variant="secondary">
                            {email}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Run Now
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit Schedule
                      </Button>
                      <Button size="sm" variant="outline">
                        Pause
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Formats</CardTitle>
              <CardDescription>Choose your preferred export format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportFormats.map((format, index) => {
                  const Icon = format.icon
                  return (
                    <div key={index} className="border rounded-lg p-6 space-y-3 hover:border-primary cursor-pointer transition-all">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-8 w-8 ${format.color}`} />
                        <div>
                          <div className="font-semibold">{format.format}</div>
                          <div className="text-sm text-muted-foreground">{format.description}</div>
                        </div>
                      </div>
                      <Button className="w-full" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export as {format.format}
                      </Button>
                    </div>
                  )
                })}
              </div>

              <div className="border-t pt-6 mt-6">
                <div className="font-semibold mb-4">Quick Export</div>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="font-medium mb-2">Current Portfolio Snapshot</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Export current portfolio state with all positions and metrics
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={generating}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button size="sm" variant="outline" disabled={generating}>
                        <Download className="h-4 w-4 mr-2" />
                        Excel
                      </Button>
                      <Button size="sm" variant="outline" disabled={generating}>
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customize Report Sections</CardTitle>
              <CardDescription>Select which sections to include in your reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportSections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={section.included}
                        className="mt-1"
                        readOnly
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{section.name}</div>
                        <div className="text-sm text-muted-foreground">{section.description}</div>
                      </div>
                      <Badge variant={section.included ? 'default' : 'secondary'}>
                        {section.included ? 'Included' : 'Optional'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <label className="font-semibold mb-2 block">Report Branding</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Company Name</div>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="Your Company"
                          defaultValue="Portfolio Manager"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Report Title</div>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="Report Title"
                          defaultValue="DLMM Portfolio Report"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button className="w-full" size="lg" onClick={handleGenerateReport} disabled={generating}>
                      {generating ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Custom Report
                        </>
                      )}
                    </Button>
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