'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Download,
  TrendingUp,
  DollarSign,
  Layers,
  Shield,
  FileText
} from 'lucide-react'
import { DLMMPosition } from '@/lib/types'
import {
  exportPortfolioReport,
  downloadPDF
} from '@/lib/reports/pdf-exporter'
import {
  exportPositionsToCSV,
  exportPortfolioMetricsToCSV,
  exportDetailedPositionsToCSV,
  downloadCSV
} from '@/lib/reports/csv-exporter'
import { saveReportToHistory } from '@/lib/reports/report-generator'

interface PortfolioReportsProps {
  positions: DLMMPosition[]
}

export function PortfolioReports({ positions }: PortfolioReportsProps) {
  const [reportType, setReportType] = useState<'summary' | 'breakdown' | 'fees' | 'risk'>('summary')
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'json'>('pdf')
  const [isGenerating, setIsGenerating] = useState(false)

  // Calculate metrics
  const totalValue = positions.reduce((sum, pos) => sum + (pos.currentValue || 0), 0)
  const totalInvested = positions.reduce((sum, pos) => sum + (pos.initialValue || 0), 0)
  const totalPnL = positions.reduce((sum, pos) => sum + (pos.pnl || 0), 0)
  const totalFees = positions.reduce((sum, pos) => {
    const feeX = parseFloat(pos.feesEarned.tokenX) * pos.tokenX.price
    const feeY = parseFloat(pos.feesEarned.tokenY) * pos.tokenY.price
    return sum + feeX + feeY
  }, 0)

  const activePositions = positions.filter(p => p.isActive).length
  const avgReturn = positions.length > 0 ? totalPnL / positions.length : 0
  const winRate = positions.filter(p => (p.pnl || 0) > 0).length / positions.length * 100

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      let filename = ''
      const timestamp = new Date().toISOString().split('T')[0]

      switch (reportType) {
        case 'summary':
          if (exportFormat === 'pdf') {
            const blob = await exportPortfolioReport(positions)
            filename = `portfolio-summary-${timestamp}.pdf`
            downloadPDF(blob, filename)
            saveReportToHistory({
              id: Date.now().toString(),
              name: 'Portfolio Summary Report',
              type: 'portfolio',
              format: 'pdf',
              size: blob.size,
              generatedAt: new Date()
            })
          } else if (exportFormat === 'csv') {
            const csv = exportPortfolioMetricsToCSV(positions)
            filename = `portfolio-summary-${timestamp}.csv`
            downloadCSV(csv, filename)
            saveReportToHistory({
              id: Date.now().toString(),
              name: 'Portfolio Summary Report',
              type: 'portfolio',
              format: 'csv',
              size: csv.length,
              generatedAt: new Date()
            })
          } else {
            const json = JSON.stringify({
              report: 'Portfolio Summary',
              generatedAt: new Date().toISOString(),
              totalValue,
              totalPnL,
              positions: positions.length
            }, null, 2)
            const blob = new Blob([json], { type: 'application/json' })
            filename = `portfolio-summary-${timestamp}.json`
            downloadPDF(blob, filename)
          }
          break

        case 'breakdown':
          if (exportFormat === 'csv') {
            const csv = exportDetailedPositionsToCSV(positions)
            filename = `position-breakdown-${timestamp}.csv`
            downloadCSV(csv, filename)
            saveReportToHistory({
              id: Date.now().toString(),
              name: 'Position Breakdown Report',
              type: 'breakdown',
              format: 'csv',
              size: csv.length,
              generatedAt: new Date()
            })
          } else {
            const csv = exportPositionsToCSV(positions)
            filename = `position-breakdown-${timestamp}.csv`
            downloadCSV(csv, filename)
          }
          break

        case 'fees':
          const feesCsv = positions.map(p => ({
            Pool: `${p.tokenX.symbol}/${p.tokenY.symbol}`,
            'Token X Fees': p.feesEarned.tokenX,
            'Token Y Fees': p.feesEarned.tokenY,
            'Token X Value': (parseFloat(p.feesEarned.tokenX) * p.tokenX.price).toFixed(2),
            'Token Y Value': (parseFloat(p.feesEarned.tokenY) * p.tokenY.price).toFixed(2),
            'Total Value': (parseFloat(p.feesEarned.tokenX) * p.tokenX.price + parseFloat(p.feesEarned.tokenY) * p.tokenY.price).toFixed(2)
          }))
          const csvContent = [
            Object.keys(feesCsv[0]).join(','),
            ...feesCsv.map(row => Object.values(row).join(','))
          ].join('\n')
          filename = `fee-earnings-${timestamp}.csv`
          downloadCSV(csvContent, filename)
          break

        default:
          const csv = exportPositionsToCSV(positions)
          filename = `portfolio-report-${timestamp}.csv`
          downloadCSV(csv, filename)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const reportTypes = [
    {
      value: 'summary',
      label: 'Performance Summary',
      description: 'Overall portfolio performance and key metrics',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      value: 'breakdown',
      label: 'Position Breakdown',
      description: 'Detailed breakdown of all positions',
      icon: <Layers className="h-5 w-5" />
    },
    {
      value: 'fees',
      label: 'Fee Earnings',
      description: 'Complete fee earnings report',
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      value: 'risk',
      label: 'Risk Assessment',
      description: 'Portfolio risk analysis',
      icon: <Shield className="h-5 w-5" />
    }
  ]

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${totalPnL.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Fees</p>
                <p className="text-2xl font-bold text-gray-900">${totalFees.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Positions</p>
                <p className="text-2xl font-bold text-gray-900">{activePositions}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Portfolio Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Report Type Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Select Report Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {reportTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setReportType(type.value as any)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      reportType === type.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {type.icon}
                      <span className="font-semibold">{type.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Export Format
              </label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
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
              disabled={isGenerating || positions.length === 0}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>Generating Report...</>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Generate & Download Report
                </>
              )}
            </Button>

            {positions.length === 0 && (
              <p className="text-sm text-gray-500 text-center">
                No positions available to generate report
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Average Return</p>
            <p className="text-xl font-bold text-gray-900">${avgReturn.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">per position</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Win Rate</p>
            <p className="text-xl font-bold text-gray-900">{winRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500 mt-1">profitable positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total ROI</p>
            <p className={`text-xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : '0.00'}%
            </p>
            <p className="text-sm text-gray-500 mt-1">return on investment</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
