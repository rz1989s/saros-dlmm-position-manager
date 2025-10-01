import { DLMMPosition } from '@/lib/types'
import { generateTaxSummary } from './tax-calculator'
import {
  exportPortfolioReport,
  exportTaxReport,
  generatePDFReport,
  ReportData
} from './pdf-exporter'
import {
  exportPositionsToCSV,
  exportTaxSummaryToCSV,
  exportPortfolioMetricsToCSV,
  exportDetailedPositionsToCSV
} from './csv-exporter'

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'portfolio' | 'tax' | 'performance' | 'risk' | 'custom'
  sections: ReportSection[]
  defaultFormat: 'pdf' | 'csv' | 'json'
}

export interface ReportSection {
  id: string
  title: string
  type: 'summary' | 'table' | 'chart' | 'metrics' | 'text'
  enabled: boolean
  config?: any
}

export interface ReportSchedule {
  id: string
  name: string
  template: ReportTemplate
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  format: 'pdf' | 'csv' | 'json'
  nextRun: Date
  enabled: boolean
  emailRecipients?: string[]
}

export interface GeneratedReport {
  id: string
  name: string
  type: string
  format: string
  size: number
  generatedAt: Date
  downloadUrl?: string
}

/**
 * Generate a complete report based on template
 */
export async function generateReport(
  template: ReportTemplate,
  positions: DLMMPosition[],
  format: 'pdf' | 'csv' | 'json' = 'pdf'
): Promise<Blob | string> {
  switch (template.type) {
    case 'portfolio':
      return generatePortfolioReport(positions, format)
    case 'tax':
      return generateTaxReportFull(positions, format)
    case 'performance':
      return generatePerformanceReport(positions, format)
    case 'risk':
      return generateRiskReport(positions, format)
    default:
      return generateCustomReport(template, positions, format)
  }
}

/**
 * Generate portfolio report
 */
async function generatePortfolioReport(
  positions: DLMMPosition[],
  format: 'pdf' | 'csv' | 'json'
): Promise<Blob | string> {
  if (format === 'pdf') {
    return exportPortfolioReport(positions)
  } else if (format === 'csv') {
    return exportPositionsToCSV(positions)
  } else {
    return JSON.stringify({
      report: 'Portfolio Report',
      generatedAt: new Date().toISOString(),
      positions: positions.map(p => ({
        id: p.id,
        pool: `${p.tokenX.symbol}/${p.tokenY.symbol}`,
        value: p.currentValue,
        pnl: p.pnl,
        fees: {
          tokenX: p.feesEarned.tokenX,
          tokenY: p.feesEarned.tokenY
        }
      }))
    }, null, 2)
  }
}

/**
 * Generate tax report
 */
async function generateTaxReportFull(
  positions: DLMMPosition[],
  format: 'pdf' | 'csv' | 'json'
): Promise<Blob | string> {
  const taxYear = new Date().getFullYear()
  const taxSummary = generateTaxSummary(positions, taxYear)

  if (format === 'pdf') {
    return exportTaxReport(positions, taxSummary, taxYear)
  } else if (format === 'csv') {
    return exportTaxSummaryToCSV(taxSummary, taxYear)
  } else {
    return JSON.stringify({
      report: 'Tax Report',
      taxYear,
      generatedAt: new Date().toISOString(),
      summary: taxSummary
    }, null, 2)
  }
}

/**
 * Generate performance report
 */
async function generatePerformanceReport(
  positions: DLMMPosition[],
  format: 'pdf' | 'csv' | 'json'
): Promise<Blob | string> {
  const metrics = calculatePerformanceMetrics(positions)

  if (format === 'pdf') {
    return generatePDFReport(
      { metrics },
      {
        title: 'Performance Report',
        subtitle: 'Portfolio Performance Analysis',
        template: 'detailed'
      }
    )
  } else if (format === 'csv') {
    return exportPortfolioMetricsToCSV(positions)
  } else {
    return JSON.stringify({
      report: 'Performance Report',
      generatedAt: new Date().toISOString(),
      metrics
    }, null, 2)
  }
}

/**
 * Generate risk report
 */
async function generateRiskReport(
  positions: DLMMPosition[],
  format: 'pdf' | 'csv' | 'json'
): Promise<Blob | string> {
  const riskMetrics = calculateRiskMetrics(positions)

  if (format === 'pdf') {
    return generatePDFReport(
      { metrics: riskMetrics },
      {
        title: 'Risk Assessment Report',
        subtitle: 'Portfolio Risk Analysis',
        template: 'detailed'
      }
    )
  } else if (format === 'csv') {
    return exportPortfolioMetricsToCSV(positions)
  } else {
    return JSON.stringify({
      report: 'Risk Assessment Report',
      generatedAt: new Date().toISOString(),
      metrics: riskMetrics
    }, null, 2)
  }
}

/**
 * Generate custom report based on template
 */
async function generateCustomReport(
  template: ReportTemplate,
  positions: DLMMPosition[],
  format: 'pdf' | 'csv' | 'json'
): Promise<Blob | string> {
  const data: ReportData = {
    positions,
    metrics: []
  }

  // Build report data based on enabled sections
  template.sections.forEach(section => {
    if (section.enabled) {
      switch (section.type) {
        case 'metrics':
          data.metrics = calculatePerformanceMetrics(positions)
          break
        case 'summary':
          // Add summary data
          break
      }
    }
  })

  if (format === 'pdf') {
    return generatePDFReport(data, {
      title: template.name,
      subtitle: template.description,
      template: 'custom'
    })
  } else if (format === 'csv') {
    return exportDetailedPositionsToCSV(positions)
  } else {
    return JSON.stringify({
      report: template.name,
      generatedAt: new Date().toISOString(),
      data
    }, null, 2)
  }
}

/**
 * Calculate performance metrics
 */
function calculatePerformanceMetrics(positions: DLMMPosition[]): Array<{ label: string; value: string }> {
  const totalValue = positions.reduce((sum, pos) => sum + (pos.currentValue || 0), 0)
  const totalInvested = positions.reduce((sum, pos) => sum + (pos.initialValue || 0), 0)
  const totalPnL = positions.reduce((sum, pos) => sum + (pos.pnl || 0), 0)
  const totalFees = positions.reduce((sum, pos) => {
    const feeX = parseFloat(pos.feesEarned.tokenX) * pos.tokenX.price
    const feeY = parseFloat(pos.feesEarned.tokenY) * pos.tokenY.price
    return sum + feeX + feeY
  }, 0)

  const avgReturn = positions.length > 0 ? totalPnL / positions.length : 0
  const winRate = positions.filter(p => (p.pnl || 0) > 0).length / positions.length * 100

  return [
    { label: 'Total Portfolio Value', value: `$${totalValue.toFixed(2)}` },
    { label: 'Total Invested', value: `$${totalInvested.toFixed(2)}` },
    { label: 'Total P&L', value: `$${totalPnL.toFixed(2)}` },
    { label: 'Total ROI', value: `${((totalPnL / totalInvested) * 100).toFixed(2)}%` },
    { label: 'Total Fees Earned', value: `$${totalFees.toFixed(2)}` },
    { label: 'Average Position P&L', value: `$${avgReturn.toFixed(2)}` },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%` },
    { label: 'Number of Positions', value: positions.length.toString() }
  ]
}

/**
 * Calculate risk metrics
 */
function calculateRiskMetrics(positions: DLMMPosition[]): Array<{ label: string; value: string }> {
  const totalValue = positions.reduce((sum, pos) => sum + (pos.currentValue || 0), 0)
  const positionsAtRisk = positions.filter(p => (p.pnl || 0) < -100).length
  const maxLoss = Math.min(...positions.map(p => p.pnl || 0))
  const avgLoss = positions.filter(p => (p.pnl || 0) < 0).reduce((sum, p) => sum + (p.pnl || 0), 0) /
                  positions.filter(p => (p.pnl || 0) < 0).length || 0

  const concentration = calculateConcentrationRisk(positions)

  return [
    { label: 'Total Portfolio Value', value: `$${totalValue.toFixed(2)}` },
    { label: 'Positions at Risk', value: positionsAtRisk.toString() },
    { label: 'Maximum Single Loss', value: `$${maxLoss.toFixed(2)}` },
    { label: 'Average Loss per Position', value: `$${avgLoss.toFixed(2)}` },
    { label: 'Concentration Risk', value: `${(concentration * 100).toFixed(1)}%` },
    { label: 'Risk Score', value: calculateRiskScore(positions) }
  ]
}

/**
 * Calculate concentration risk (HHI)
 */
function calculateConcentrationRisk(positions: DLMMPosition[]): number {
  const totalValue = positions.reduce((sum, pos) => sum + (pos.currentValue || 0), 0)
  if (totalValue === 0) return 0

  const hhi = positions.reduce((sum, pos) => {
    const weight = (pos.currentValue || 0) / totalValue
    return sum + (weight * weight)
  }, 0)

  return hhi
}

/**
 * Calculate overall risk score
 */
function calculateRiskScore(positions: DLMMPosition[]): string {
  const concentration = calculateConcentrationRisk(positions)
  const lossRate = positions.filter(p => (p.pnl || 0) < 0).length / positions.length

  if (concentration > 0.5 || lossRate > 0.5) return 'High Risk'
  if (concentration > 0.3 || lossRate > 0.3) return 'Medium Risk'
  return 'Low Risk'
}

/**
 * Get default report templates
 */
export function getDefaultReportTemplates(): ReportTemplate[] {
  return [
    {
      id: 'portfolio-summary',
      name: 'Portfolio Summary',
      description: 'Complete overview of all positions and performance',
      type: 'portfolio',
      defaultFormat: 'pdf',
      sections: [
        { id: 'summary', title: 'Portfolio Summary', type: 'summary', enabled: true },
        { id: 'positions', title: 'Position Details', type: 'table', enabled: true },
        { id: 'metrics', title: 'Key Metrics', type: 'metrics', enabled: true }
      ]
    },
    {
      id: 'tax-report',
      name: 'Tax Report',
      description: 'Complete tax report with Form 8949 data',
      type: 'tax',
      defaultFormat: 'pdf',
      sections: [
        { id: 'summary', title: 'Tax Summary', type: 'summary', enabled: true },
        { id: 'gains-losses', title: 'Gains and Losses', type: 'table', enabled: true },
        { id: 'form-8949', title: 'Form 8949', type: 'table', enabled: true }
      ]
    },
    {
      id: 'performance-analysis',
      name: 'Performance Analysis',
      description: 'Detailed performance metrics and analysis',
      type: 'performance',
      defaultFormat: 'pdf',
      sections: [
        { id: 'metrics', title: 'Performance Metrics', type: 'metrics', enabled: true },
        { id: 'charts', title: 'Performance Charts', type: 'chart', enabled: true }
      ]
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment',
      description: 'Portfolio risk analysis and recommendations',
      type: 'risk',
      defaultFormat: 'pdf',
      sections: [
        { id: 'risk-metrics', title: 'Risk Metrics', type: 'metrics', enabled: true },
        { id: 'recommendations', title: 'Recommendations', type: 'text', enabled: true }
      ]
    },
    {
      id: 'fee-earnings',
      name: 'Fee Earnings Report',
      description: 'Detailed breakdown of all fee earnings',
      type: 'custom',
      defaultFormat: 'csv',
      sections: [
        { id: 'fees', title: 'Fee Breakdown', type: 'table', enabled: true }
      ]
    }
  ]
}

/**
 * Save report to history
 */
export function saveReportToHistory(report: GeneratedReport): void {
  const history = getReportHistory()
  history.unshift(report)
  // Keep only last 50 reports
  const trimmedHistory = history.slice(0, 50)
  localStorage.setItem('report-history', JSON.stringify(trimmedHistory))
}

/**
 * Get report history from localStorage
 */
export function getReportHistory(): GeneratedReport[] {
  const stored = localStorage.getItem('report-history')
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Clear report history
 */
export function clearReportHistory(): void {
  localStorage.removeItem('report-history')
}
