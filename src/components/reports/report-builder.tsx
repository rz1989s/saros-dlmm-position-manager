'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Layout,
  Download,
  Settings,
  BarChart3,
  Table,
  FileText
} from 'lucide-react'
import { DLMMPosition } from '@/lib/types'
import { generateReport, getDefaultReportTemplates } from '@/lib/reports/report-generator'
import { downloadPDF } from '@/lib/reports/pdf-exporter'
import { downloadCSV } from '@/lib/reports/csv-exporter'

interface ReportBuilderProps {
  positions: DLMMPosition[]
}

export function ReportBuilder({ positions }: ReportBuilderProps) {
  const [reportName, setReportName] = useState('Custom Report')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'totalValue',
    'totalPnL',
    'totalFees'
  ])
  const [format, setFormat] = useState<'pdf' | 'csv' | 'json'>('pdf')
  const [isGenerating, setIsGenerating] = useState(false)

  const availableMetrics = [
    { id: 'totalValue', label: 'Total Portfolio Value', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'totalPnL', label: 'Total P&L', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'totalFees', label: 'Total Fees Earned', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'avgReturn', label: 'Average Return', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'winRate', label: 'Win Rate', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'positions', label: 'Position Breakdown', icon: <Table className="h-4 w-4" /> },
    { id: 'riskMetrics', label: 'Risk Metrics', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'feeBreakdown', label: 'Fee Breakdown', icon: <Table className="h-4 w-4" /> }
  ]

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metricId)
        ? prev.filter(m => m !== metricId)
        : [...prev, metricId]
    )
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      // Filter positions by date range if specified
      let filteredPositions = positions
      if (dateFrom) {
        filteredPositions = filteredPositions.filter(p =>
          new Date(p.createdAt) >= new Date(dateFrom)
        )
      }
      if (dateTo) {
        filteredPositions = filteredPositions.filter(p =>
          new Date(p.createdAt) <= new Date(dateTo)
        )
      }

      // Use custom template
      const templates = getDefaultReportTemplates()
      const customTemplate = {
        ...templates[0],
        name: reportName,
        sections: templates[0].sections.filter(s =>
          selectedMetrics.some(m => s.id.includes(m))
        )
      }

      const result = await generateReport(customTemplate, filteredPositions, format)
      const timestamp = new Date().toISOString().split('T')[0]

      if (format === 'pdf') {
        downloadPDF(result as Blob, `${reportName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.pdf`)
      } else if (format === 'csv') {
        downloadCSV(result as string, `${reportName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.csv`)
      } else {
        const blob = new Blob([result as string], { type: 'application/json' })
        downloadPDF(blob, `${reportName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.json`)
      }
    } catch (error) {
      console.error('Error generating custom report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Custom Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Report Name */}
            <div>
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateFrom">Start Date (Optional)</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateTo">End Date (Optional)</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Metric Selection */}
            <div>
              <Label className="mb-3 block">Select Metrics to Include</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleMetric(metric.id)}
                  >
                    <Checkbox
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={() => toggleMetric(metric.id)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      {metric.icon}
                      <span className="text-sm font-medium">{metric.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div>
              <Label htmlFor="format">Export Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF - Professional Document</SelectItem>
                  <SelectItem value="csv">CSV - Spreadsheet Format</SelectItem>
                  <SelectItem value="json">JSON - Developer Format</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || selectedMetrics.length === 0}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>Generating Custom Report...</>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Generate Custom Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{reportName}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Date Range: {dateFrom || 'All Time'} to {dateTo || 'Present'}</p>
                <p>Selected Metrics: {selectedMetrics.length}</p>
                <p>Export Format: {format.toUpperCase()}</p>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p className="font-semibold mb-1">Selected Metrics:</p>
              <ul className="list-disc list-inside space-y-1">
                {selectedMetrics.map(metricId => {
                  const metric = availableMetrics.find(m => m.id === metricId)
                  return metric ? <li key={metricId}>{metric.label}</li> : null
                })}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Custom Report Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>Select at least one metric to generate a report</li>
                <li>Use date filters to analyze specific time periods</li>
                <li>PDF format is best for professional presentations</li>
                <li>CSV format is ideal for further analysis in Excel</li>
                <li>JSON format provides raw data for developers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
