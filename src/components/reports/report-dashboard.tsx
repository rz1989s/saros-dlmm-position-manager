'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Download,
  Clock,
  Calendar,
  TrendingUp,
  DollarSign,
  Shield,
  FileSpreadsheet
} from 'lucide-react'
import {
  getDefaultReportTemplates,
  getReportHistory,
  type ReportTemplate,
  type GeneratedReport
} from '@/lib/reports/report-generator'

interface ReportDashboardProps {
  onGenerateReport: (template: ReportTemplate) => void
}

export function ReportDashboard({ onGenerateReport }: ReportDashboardProps) {
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([])
  const [templates] = useState<ReportTemplate[]>(getDefaultReportTemplates())

  useEffect(() => {
    // Load recent reports from history
    const history = getReportHistory()
    setRecentReports(history.slice(0, 5))
  }, [])

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'portfolio':
        return <TrendingUp className="h-5 w-5" />
      case 'tax':
        return <FileSpreadsheet className="h-5 w-5" />
      case 'performance':
        return <DollarSign className="h-5 w-5" />
      case 'risk':
        return <Shield className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTemplateColor = (type: string) => {
    switch (type) {
      case 'portfolio':
        return 'from-indigo-600 to-purple-600'
      case 'tax':
        return 'from-green-600 to-emerald-600'
      case 'performance':
        return 'from-blue-600 to-cyan-600'
      case 'risk':
        return 'from-red-600 to-orange-600'
      default:
        return 'from-gray-600 to-slate-600'
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-6">
      {/* Quick Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quick Report Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="border-2 hover:border-indigo-500 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getTemplateColor(template.type)} flex items-center justify-center text-white`}>
                      {getTemplateIcon(template.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {template.sections.length} sections
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.defaultFormat.toUpperCase()}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => onGenerateReport(template)}
                    className="w-full"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No reports generated yet</p>
              <p className="text-sm">Generate your first report using the templates above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{new Date(report.generatedAt).toLocaleString()}</span>
                        <Badge variant="secondary" className="text-xs">
                          {report.format.toUpperCase()}
                        </Badge>
                        <span className="text-xs">{formatBytes(report.size)}</span>
                      </div>
                    </div>
                  </div>
                  {report.downloadUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Reports (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No scheduled reports configured</p>
            <p className="text-sm mb-4">Set up automatic report generation</p>
            <Button variant="outline" size="sm">
              Create Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export History Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{recentReports.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentReports.filter(r => {
                    const date = new Date(r.generatedAt)
                    const now = new Date()
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatBytes(recentReports.reduce((sum, r) => sum + r.size, 0))}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
