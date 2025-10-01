'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Home,
  FileText,
  LayoutDashboard,
  PieChart,
  Receipt,
  Layout,
  FileSpreadsheet
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { ReportDashboard } from '@/components/reports/report-dashboard'
import { PortfolioReports } from '@/components/reports/portfolio-reports'
import { TaxOptimizer } from '@/components/reports/tax-optimizer'
import { ReportBuilder } from '@/components/reports/report-builder'
import { TemplateLibrary } from '@/components/reports/template-library'
import { generateReport, type ReportTemplate } from '@/lib/reports/report-generator'
import { downloadPDF } from '@/lib/reports/pdf-exporter'
import { downloadCSV } from '@/lib/reports/csv-exporter'
import { saveReportToHistory } from '@/lib/reports/report-generator'

export default function ReportsPage() {
  const { positions, loading } = useUserPositions()

  const handleGenerateReport = async (template: ReportTemplate) => {
    try {
      const result = await generateReport(template, positions, template.defaultFormat)
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `${template.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${template.defaultFormat}`

      if (template.defaultFormat === 'pdf') {
        downloadPDF(result as Blob, filename)
      } else if (template.defaultFormat === 'csv') {
        downloadCSV(result as string, filename)
      } else {
        const blob = new Blob([result as string], { type: 'application/json' })
        downloadPDF(blob, filename)
      }

      // Save to history
      saveReportToHistory({
        id: Date.now().toString(),
        name: template.name,
        type: template.type,
        format: template.defaultFormat,
        size: typeof result === 'string' ? result.length : (result as Blob).size,
        generatedAt: new Date()
      })
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Reports & Exports</h1>
                <p className="text-sm text-gray-500">Generate comprehensive reports and tax documents</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/app">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Applications
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
              <FileText className="w-3 h-3 mr-1" />
              6 Report Categories
            </Badge>
            <Badge variant="outline">
              {positions.length} Positions
            </Badge>
          </div>
          <p className="text-gray-600 max-w-3xl">
            Generate professional reports, tax documents, and custom analytics. Export to PDF, CSV, or JSON formats
            for comprehensive portfolio analysis and tax preparation.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading position data...</p>
          </div>
        )}

        {/* Reports Tabs */}
        {!loading && (
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Portfolio</span>
              </TabsTrigger>
              <TabsTrigger value="tax" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Tax</span>
              </TabsTrigger>
              <TabsTrigger value="builder" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                <span className="hidden sm:inline">Builder</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Templates</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Dashboard</h2>
                <p className="text-gray-600">
                  Quick access to report templates, recent reports, and scheduled reports
                </p>
              </div>
              <ReportDashboard onGenerateReport={handleGenerateReport} />
            </TabsContent>

            {/* Portfolio Reports Tab */}
            <TabsContent value="portfolio" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Reports</h2>
                <p className="text-gray-600">
                  Generate performance summaries, position breakdowns, and fee earnings reports
                </p>
              </div>
              <PortfolioReports positions={positions} />
            </TabsContent>

            {/* Tax Optimization Tab */}
            <TabsContent value="tax" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tax Optimization</h2>
                <p className="text-gray-600">
                  Tax-loss harvesting opportunities, gain/loss summary, and Form 8949 preparation
                </p>
              </div>
              <TaxOptimizer positions={positions} />
            </TabsContent>

            {/* Report Builder Tab */}
            <TabsContent value="builder" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Custom Report Builder</h2>
                <p className="text-gray-600">
                  Build custom reports with your choice of metrics, date ranges, and export formats
                </p>
              </div>
              <ReportBuilder positions={positions} />
            </TabsContent>

            {/* Export Tab (Placeholder) */}
            <TabsContent value="export" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Configuration</h2>
                <p className="text-gray-600">
                  Configure export settings and bulk export options
                </p>
              </div>
              <div className="bg-white rounded-lg border p-8 text-center">
                <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Options</h3>
                <p className="text-gray-600 mb-4">
                  Use the other tabs to export specific reports. Bulk export features coming soon.
                </p>
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Templates</h2>
                <p className="text-gray-600">
                  Professional report templates for all your reporting needs
                </p>
              </div>
              <TemplateLibrary onUseTemplate={handleGenerateReport} />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8 mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">Built for the Saros DLMM Demo Challenge</p>
            <p className="text-sm text-gray-500">
              Professional reporting and tax optimization tools for DLMM positions
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
