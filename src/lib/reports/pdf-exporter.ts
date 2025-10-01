import jsPDF from 'jspdf'
import { DLMMPosition } from '@/lib/types'
import { TaxSummary } from './tax-calculator'

export interface PDFReportConfig {
  title: string
  subtitle?: string
  includeHeader?: boolean
  includeFooter?: boolean
  template?: 'professional' | 'minimal' | 'detailed' | 'tax' | 'custom'
  branding?: {
    logo?: string
    companyName?: string
    colors?: {
      primary: string
      secondary: string
    }
  }
}

export interface ReportData {
  positions?: DLMMPosition[]
  taxSummary?: TaxSummary
  customData?: Record<string, any>
  metrics?: Array<{ label: string; value: string | number }>
  charts?: Array<{ title: string; data: any }>
}

/**
 * Generate PDF report with jsPDF
 */
export async function generatePDFReport(
  data: ReportData,
  config: PDFReportConfig
): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20

  // Apply template-specific styling
  applyTemplate(doc, config.template || 'professional', config.branding)

  let yPosition = margin

  // Header
  if (config.includeHeader !== false) {
    yPosition = addHeader(doc, config, yPosition, pageWidth)
  }

  // Title
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(config.title, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10

  if (config.subtitle) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(config.subtitle, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15
  } else {
    yPosition += 10
  }

  // Report date
  doc.setFontSize(10)
  doc.setTextColor(120, 120, 120)
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 15

  // Content based on data type
  if (data.positions && data.positions.length > 0) {
    yPosition = addPositionsSummary(doc, data.positions, yPosition, pageWidth, margin)
  }

  if (data.taxSummary) {
    yPosition = addTaxSummary(doc, data.taxSummary, yPosition, pageWidth, margin)
  }

  if (data.metrics && data.metrics.length > 0) {
    yPosition = addMetricsTable(doc, data.metrics, yPosition, pageWidth, margin)
  }

  // Footer
  if (config.includeFooter !== false) {
    addFooter(doc, pageHeight, pageWidth)
  }

  return doc.output('blob')
}

/**
 * Apply template styling to PDF
 */
function applyTemplate(
  doc: jsPDF,
  template: string,
  _branding?: PDFReportConfig['branding']
): void {
  switch (template) {
    case 'professional':
      doc.setTextColor(40, 40, 40)
      break
    case 'minimal':
      doc.setTextColor(60, 60, 60)
      break
    case 'detailed':
      doc.setTextColor(30, 30, 30)
      break
    case 'tax':
      doc.setTextColor(20, 20, 20)
      break
  }
}

/**
 * Add header to PDF
 */
function addHeader(
  doc: jsPDF,
  config: PDFReportConfig,
  yPosition: number,
  pageWidth: number
): number {
  const companyName = config.branding?.companyName || 'Saros DLMM Position Manager'

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(99, 102, 241) // Indigo color
  doc.text(companyName, 20, yPosition)

  doc.setDrawColor(99, 102, 241)
  doc.setLineWidth(0.5)
  doc.line(20, yPosition + 3, pageWidth - 20, yPosition + 3)

  return yPosition + 10
}

/**
 * Add footer to PDF
 */
function addFooter(doc: jsPDF, pageHeight: number, pageWidth: number): void {
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.setFont('helvetica', 'normal')

  const footerY = pageHeight - 15
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5)
  doc.text('Saros DLMM Position Manager', pageWidth / 2, footerY, { align: 'center' })
  doc.text('Page 1', pageWidth / 2, footerY + 4, { align: 'center' })
}

/**
 * Add positions summary to PDF
 */
function addPositionsSummary(
  doc: jsPDF,
  positions: DLMMPosition[],
  yPosition: number,
  pageWidth: number,
  margin: number
): number {
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('Portfolio Positions', margin, yPosition)
  yPosition += 10

  // Calculate summary metrics
  const totalValue = positions.reduce((sum, pos) => sum + (pos.currentValue || 0), 0)
  const totalPnL = positions.reduce((sum, pos) => sum + (pos.pnl || 0), 0)

  // Summary box
  doc.setFillColor(248, 250, 252)
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)

  doc.text('Total Positions:', margin + 5, yPosition + 8)
  doc.text('Total Value:', margin + 5, yPosition + 16)
  doc.text('Total P&L:', margin + 5, yPosition + 24)

  doc.setFont('helvetica', 'normal')
  doc.text(`${positions.length}`, margin + 60, yPosition + 8)
  doc.text(`$${totalValue.toFixed(2)}`, margin + 60, yPosition + 16)

  const pnlColor = totalPnL >= 0 ? [34, 197, 94] : [239, 68, 68]
  doc.setTextColor(...pnlColor as [number, number, number])
  doc.text(`$${totalPnL.toFixed(2)} (${((totalPnL / (totalValue - totalPnL)) * 100).toFixed(2)}%)`, margin + 60, yPosition + 24)

  yPosition += 40

  // Position table header
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  doc.text('Pool', margin, yPosition)
  doc.text('Value', margin + 60, yPosition)
  doc.text('P&L', margin + 100, yPosition)
  doc.text('Fees', margin + 140, yPosition)

  yPosition += 7

  // Position rows
  doc.setFont('helvetica', 'normal')
  positions.slice(0, 15).forEach(position => {
    const poolName = `${position.tokenX.symbol}/${position.tokenY.symbol}`
    const value = position.currentValue || 0
    const pnl = position.pnl || 0
    const fees = parseFloat(position.feesEarned.tokenX) * position.tokenX.price +
                 parseFloat(position.feesEarned.tokenY) * position.tokenY.price

    doc.text(poolName, margin, yPosition)
    doc.text(`$${value.toFixed(2)}`, margin + 60, yPosition)

    const rowPnlColor = pnl >= 0 ? [34, 197, 94] : [239, 68, 68]
    doc.setTextColor(...rowPnlColor as [number, number, number])
    doc.text(`$${pnl.toFixed(2)}`, margin + 100, yPosition)

    doc.setTextColor(60, 60, 60)
    doc.text(`$${fees.toFixed(2)}`, margin + 140, yPosition)

    yPosition += 6
  })

  return yPosition + 10
}

/**
 * Add tax summary to PDF
 */
function addTaxSummary(
  doc: jsPDF,
  taxSummary: TaxSummary,
  yPosition: number,
  _pageWidth: number,
  margin: number
): number {
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('Tax Summary', margin, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const taxData = [
    ['Short-Term Gains:', `$${taxSummary.shortTermGains.toFixed(2)}`],
    ['Short-Term Losses:', `$${taxSummary.shortTermLosses.toFixed(2)}`],
    ['Long-Term Gains:', `$${taxSummary.longTermGains.toFixed(2)}`],
    ['Long-Term Losses:', `$${taxSummary.longTermLosses.toFixed(2)}`],
    ['Fee Income:', `$${taxSummary.feeIncome.toFixed(2)}`],
    ['Net Gain/Loss:', `$${taxSummary.netGainLoss.toFixed(2)}`]
  ]

  taxData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, margin, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(value, margin + 80, yPosition)
    yPosition += 7
  })

  return yPosition + 10
}

/**
 * Add metrics table to PDF
 */
function addMetricsTable(
  doc: jsPDF,
  metrics: Array<{ label: string; value: string | number }>,
  yPosition: number,
  _pageWidth: number,
  margin: number
): number {
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('Key Metrics', margin, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  metrics.forEach(metric => {
    doc.setFont('helvetica', 'bold')
    doc.text(metric.label, margin, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(String(metric.value), margin + 80, yPosition)
    yPosition += 7
  })

  return yPosition + 10
}

/**
 * Export portfolio performance report
 */
export async function exportPortfolioReport(positions: DLMMPosition[]): Promise<Blob> {
  return generatePDFReport(
    { positions },
    {
      title: 'Portfolio Performance Report',
      subtitle: `${positions.length} Active Positions`,
      template: 'professional',
      includeHeader: true,
      includeFooter: true
    }
  )
}

/**
 * Export tax report
 */
export async function exportTaxReport(
  positions: DLMMPosition[],
  taxSummary: TaxSummary,
  taxYear: number
): Promise<Blob> {
  return generatePDFReport(
    { positions, taxSummary },
    {
      title: `Tax Report ${taxYear}`,
      subtitle: 'Capital Gains and Losses Summary',
      template: 'tax',
      includeHeader: true,
      includeFooter: true
    }
  )
}

/**
 * Download PDF blob as file
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
