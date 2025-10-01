'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Download,
  FileSpreadsheet,
  TrendingDown,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  DollarSign
} from 'lucide-react'
import { DLMMPosition } from '@/lib/types'
import {
  generateTaxSummary,
  identifyTaxLossHarvestingOpportunities,
  analyzeHoldingPeriods,
  calculateTaxLiability
} from '@/lib/reports/tax-calculator'
import {
  exportTaxReport,
  downloadPDF
} from '@/lib/reports/pdf-exporter'
import {
  exportTaxSummaryToCSV,
  exportForm8949ToCSV,
  downloadCSV
} from '@/lib/reports/csv-exporter'
import { saveReportToHistory } from '@/lib/reports/report-generator'

interface TaxOptimizerProps {
  positions: DLMMPosition[]
}

export function TaxOptimizer({ positions }: TaxOptimizerProps) {
  const [taxYear, setTaxYear] = useState<number>(new Date().getFullYear())
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf')
  const [isGenerating, setIsGenerating] = useState(false)

  // Calculate tax data
  const taxSummary = useMemo(() => generateTaxSummary(positions, taxYear), [positions, taxYear])
  const harvestingOpportunities = useMemo(() => identifyTaxLossHarvestingOpportunities(positions), [positions])
  const holdingAnalysis = useMemo(() => analyzeHoldingPeriods(positions), [positions])
  const taxLiability = useMemo(() => calculateTaxLiability(taxSummary), [taxSummary])

  const handleExportTaxReport = async () => {
    setIsGenerating(true)
    try {
      const timestamp = new Date().toISOString().split('T')[0]

      if (exportFormat === 'pdf') {
        const blob = await exportTaxReport(positions, taxSummary, taxYear)
        const filename = `tax-report-${taxYear}-${timestamp}.pdf`
        downloadPDF(blob, filename)
        saveReportToHistory({
          id: Date.now().toString(),
          name: `Tax Report ${taxYear}`,
          type: 'tax',
          format: 'pdf',
          size: blob.size,
          generatedAt: new Date()
        })
      } else {
        const csv = exportTaxSummaryToCSV(taxSummary, taxYear)
        const filename = `tax-summary-${taxYear}-${timestamp}.csv`
        downloadCSV(csv, filename)
        saveReportToHistory({
          id: Date.now().toString(),
          name: `Tax Summary ${taxYear}`,
          type: 'tax',
          format: 'csv',
          size: csv.length,
          generatedAt: new Date()
        })
      }
    } catch (error) {
      console.error('Error exporting tax report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportForm8949 = () => {
    const csv = exportForm8949ToCSV(taxSummary.form8949Data)
    const timestamp = new Date().toISOString().split('T')[0]
    downloadCSV(csv, `form-8949-${taxYear}-${timestamp}.csv`)
  }

  const availableYears = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2
  ]

  return (
    <div className="space-y-6">
      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Short-Term Gains</p>
                <p className="text-xl font-bold text-green-600">${taxSummary.shortTermGains.toFixed(2)}</p>
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
                <p className="text-sm text-gray-600 mb-1">Short-Term Losses</p>
                <p className="text-xl font-bold text-red-600">${taxSummary.shortTermLosses.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Long-Term Gains</p>
                <p className="text-xl font-bold text-green-600">${taxSummary.longTermGains.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Long-Term Losses</p>
                <p className="text-xl font-bold text-red-600">${taxSummary.longTermLosses.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net Position & Tax Liability */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Net Gain/Loss</p>
                <p className={`text-2xl font-bold ${taxSummary.netGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${taxSummary.netGainLoss.toFixed(2)}
                </p>
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
                <p className="text-sm text-gray-600 mb-1">Fee Income</p>
                <p className="text-2xl font-bold text-gray-900">${taxSummary.feeIncome.toFixed(2)}</p>
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
                <p className="text-sm text-gray-600 mb-1">Est. Tax Liability</p>
                <p className="text-2xl font-bold text-gray-900">${taxLiability.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax-Loss Harvesting Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Tax-Loss Harvesting Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {harvestingOpportunities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tax-loss harvesting opportunities identified</p>
              <p className="text-sm">All positions are currently profitable</p>
            </div>
          ) : (
            <div className="space-y-3">
              {harvestingOpportunities.slice(0, 5).map((opp) => (
                <div
                  key={opp.positionId}
                  className="p-4 border rounded-lg hover:border-indigo-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{opp.poolName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={opp.riskLevel === 'high' ? 'destructive' : opp.riskLevel === 'medium' ? 'secondary' : 'outline'}>
                          {opp.riskLevel} opportunity
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Current Loss</p>
                      <p className="text-lg font-bold text-red-600">${opp.currentLoss.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Potential Savings: ${opp.potentialTaxSavings.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{opp.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Holding Period Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Holding Period Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {holdingAnalysis.slice(0, 5).map((analysis) => (
              <div
                key={analysis.position.id}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {analysis.position.tokenX.symbol}/{analysis.position.tokenY.symbol}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={analysis.isShortTerm ? 'secondary' : 'default'}>
                        {analysis.isShortTerm ? 'Short-Term' : 'Long-Term'}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {analysis.daysHeld} days held
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {analysis.isShortTerm && (
                      <p className="text-sm text-orange-600">
                        {analysis.daysUntilLongTerm} days until long-term
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{analysis.recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export Tax Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Tax Year Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Tax Year
              </label>
              <Select value={taxYear.toString()} onValueChange={(v) => setTaxYear(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                </SelectContent>
              </Select>
            </div>

            {/* Export Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={handleExportTaxReport}
                disabled={isGenerating}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Export Tax Report'}
              </Button>

              <Button
                onClick={handleExportForm8949}
                variant="outline"
                className="w-full"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Form 8949
              </Button>
            </div>

            <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">Tax Filing Information</p>
              <p>
                Form 8949 is required for reporting capital gains and losses from cryptocurrency transactions.
                Consult with a tax professional for proper filing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
