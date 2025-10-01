import { DLMMPosition } from '@/lib/types'
import { TaxSummary, Form8949Entry, TaxEvent } from './tax-calculator'

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[], headers: string[]): string {
  const rows = [headers.join(',')]

  data.forEach(item => {
    const values = headers.map(header => {
      const value = item[header] || ''
      // Escape commas and quotes in values
      const stringValue = String(value).replace(/"/g, '""')
      return `"${stringValue}"`
    })
    rows.push(values.join(','))
  })

  return rows.join('\n')
}

/**
 * Download CSV string as file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export positions to CSV
 */
export function exportPositionsToCSV(positions: DLMMPosition[]): string {
  const data = positions.map(pos => ({
    'Position ID': pos.id,
    'Pool': `${pos.tokenX.symbol}/${pos.tokenY.symbol}`,
    'Token X': pos.tokenX.symbol,
    'Token Y': pos.tokenY.symbol,
    'Liquidity Amount': pos.liquidityAmount,
    'Current Value': pos.currentValue?.toFixed(2) || 'N/A',
    'Initial Value': pos.initialValue?.toFixed(2) || 'N/A',
    'P&L': pos.pnl?.toFixed(2) || 'N/A',
    'P&L %': pos.pnlPercent?.toFixed(2) || 'N/A',
    'Fees Earned (Token X)': pos.feesEarned.tokenX,
    'Fees Earned (Token Y)': pos.feesEarned.tokenY,
    'Active Bin': pos.activeBin,
    'Status': pos.isActive ? 'Active' : 'Closed',
    'Created At': pos.createdAt.toISOString(),
    'Last Updated': pos.lastUpdated.toISOString()
  }))

  const headers = [
    'Position ID',
    'Pool',
    'Token X',
    'Token Y',
    'Liquidity Amount',
    'Current Value',
    'Initial Value',
    'P&L',
    'P&L %',
    'Fees Earned (Token X)',
    'Fees Earned (Token Y)',
    'Active Bin',
    'Status',
    'Created At',
    'Last Updated'
  ]

  return arrayToCSV(data, headers)
}

/**
 * Export tax summary to CSV
 */
export function exportTaxSummaryToCSV(taxSummary: TaxSummary, taxYear: number): string {
  const data = [
    {
      'Metric': 'Tax Year',
      'Value': taxYear
    },
    {
      'Metric': 'Short-Term Gains',
      'Value': `$${taxSummary.shortTermGains.toFixed(2)}`
    },
    {
      'Metric': 'Short-Term Losses',
      'Value': `$${taxSummary.shortTermLosses.toFixed(2)}`
    },
    {
      'Metric': 'Long-Term Gains',
      'Value': `$${taxSummary.longTermGains.toFixed(2)}`
    },
    {
      'Metric': 'Long-Term Losses',
      'Value': `$${taxSummary.longTermLosses.toFixed(2)}`
    },
    {
      'Metric': 'Fee Income',
      'Value': `$${taxSummary.feeIncome.toFixed(2)}`
    },
    {
      'Metric': 'Net Gain/Loss',
      'Value': `$${taxSummary.netGainLoss.toFixed(2)}`
    },
    {
      'Metric': 'Total Gains',
      'Value': `$${taxSummary.totalGains.toFixed(2)}`
    },
    {
      'Metric': 'Total Losses',
      'Value': `$${taxSummary.totalLosses.toFixed(2)}`
    }
  ]

  return arrayToCSV(data, ['Metric', 'Value'])
}

/**
 * Export Form 8949 to CSV
 */
export function exportForm8949ToCSV(entries: Form8949Entry[]): string {
  const data = entries.map(entry => ({
    'Description': entry.description,
    'Date Acquired': entry.dateAcquired,
    'Date Sold': entry.dateSold,
    'Proceeds': entry.proceeds.toFixed(2),
    'Cost Basis': entry.costBasis.toFixed(2),
    'Gain/Loss': entry.gainLoss.toFixed(2),
    'Type': entry.isShortTerm ? 'Short-Term' : 'Long-Term'
  }))

  const headers = [
    'Description',
    'Date Acquired',
    'Date Sold',
    'Proceeds',
    'Cost Basis',
    'Gain/Loss',
    'Type'
  ]

  return arrayToCSV(data, headers)
}

/**
 * Export tax events to CSV
 */
export function exportTaxEventsToCSV(events: TaxEvent[]): string {
  const data = events.map(event => ({
    'Date': event.date.toISOString(),
    'Type': event.type,
    'Token': event.tokenSymbol,
    'Amount': event.amount.toFixed(6),
    'Price USD': event.priceUSD.toFixed(2),
    'Cost Basis': event.costBasis.toFixed(2),
    'Proceeds': event.proceeds.toFixed(2),
    'Gain/Loss': event.gainLoss.toFixed(2),
    'Holding Period (days)': event.holdingPeriod,
    'Term': event.isShortTerm ? 'Short-Term' : 'Long-Term',
    'Position ID': event.positionId
  }))

  const headers = [
    'Date',
    'Type',
    'Token',
    'Amount',
    'Price USD',
    'Cost Basis',
    'Proceeds',
    'Gain/Loss',
    'Holding Period (days)',
    'Term',
    'Position ID'
  ]

  return arrayToCSV(data, headers)
}

/**
 * Export portfolio metrics to CSV
 */
export function exportPortfolioMetricsToCSV(positions: DLMMPosition[]): string {
  const totalValue = positions.reduce((sum, pos) => sum + (pos.currentValue || 0), 0)
  const totalInvested = positions.reduce((sum, pos) => sum + (pos.initialValue || 0), 0)
  const totalPnL = positions.reduce((sum, pos) => sum + (pos.pnl || 0), 0)
  const totalFees = positions.reduce((sum, pos) => {
    const feeX = parseFloat(pos.feesEarned.tokenX) * pos.tokenX.price
    const feeY = parseFloat(pos.feesEarned.tokenY) * pos.tokenY.price
    return sum + feeX + feeY
  }, 0)

  const data = [
    { 'Metric': 'Total Positions', 'Value': positions.length },
    { 'Metric': 'Active Positions', 'Value': positions.filter(p => p.isActive).length },
    { 'Metric': 'Closed Positions', 'Value': positions.filter(p => !p.isActive).length },
    { 'Metric': 'Total Value', 'Value': `$${totalValue.toFixed(2)}` },
    { 'Metric': 'Total Invested', 'Value': `$${totalInvested.toFixed(2)}` },
    { 'Metric': 'Total P&L', 'Value': `$${totalPnL.toFixed(2)}` },
    { 'Metric': 'Total P&L %', 'Value': `${((totalPnL / totalInvested) * 100).toFixed(2)}%` },
    { 'Metric': 'Total Fees Earned', 'Value': `$${totalFees.toFixed(2)}` },
    { 'Metric': 'Average Position Value', 'Value': `$${(totalValue / positions.length).toFixed(2)}` },
    { 'Metric': 'Average Position P&L', 'Value': `$${(totalPnL / positions.length).toFixed(2)}` }
  ]

  return arrayToCSV(data, ['Metric', 'Value'])
}

/**
 * Export detailed position breakdown to CSV
 */
export function exportDetailedPositionsToCSV(positions: DLMMPosition[]): string {
  const data = positions.map(pos => {
    const feeXValue = parseFloat(pos.feesEarned.tokenX) * pos.tokenX.price
    const feeYValue = parseFloat(pos.feesEarned.tokenY) * pos.tokenY.price
    const totalFeesValue = feeXValue + feeYValue

    return {
      'Position ID': pos.id,
      'Pool Address': pos.poolAddress.toBase58(),
      'User Address': pos.userAddress.toBase58(),
      'Pool Pair': `${pos.tokenX.symbol}/${pos.tokenY.symbol}`,
      'Token X Symbol': pos.tokenX.symbol,
      'Token X Name': pos.tokenX.name,
      'Token X Address': pos.tokenX.address.toBase58(),
      'Token X Price': pos.tokenX.price.toFixed(6),
      'Token Y Symbol': pos.tokenY.symbol,
      'Token Y Name': pos.tokenY.name,
      'Token Y Address': pos.tokenY.address.toBase58(),
      'Token Y Price': pos.tokenY.price.toFixed(6),
      'Active Bin': pos.activeBin,
      'Liquidity Amount': pos.liquidityAmount,
      'Current Value USD': pos.currentValue?.toFixed(2) || '0',
      'Initial Value USD': pos.initialValue?.toFixed(2) || '0',
      'P&L USD': pos.pnl?.toFixed(2) || '0',
      'P&L Percentage': pos.pnlPercent?.toFixed(2) || '0',
      'Realized P&L': pos.realizedPnl?.toFixed(2) || '0',
      'Unrealized P&L': pos.unrealizedPnl?.toFixed(2) || '0',
      'Fees Earned Token X': pos.feesEarned.tokenX,
      'Fees Earned Token Y': pos.feesEarned.tokenY,
      'Fees Value USD': totalFeesValue.toFixed(2),
      'Impermanent Loss': pos.impermanentLoss?.toFixed(2) || '0',
      'Is Active': pos.isActive ? 'Yes' : 'No',
      'Created At': pos.createdAt.toISOString(),
      'Last Updated': pos.lastUpdated.toISOString(),
      'Holding Period (days)': Math.floor((Date.now() - pos.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    }
  })

  const headers = [
    'Position ID',
    'Pool Address',
    'User Address',
    'Pool Pair',
    'Token X Symbol',
    'Token X Name',
    'Token X Address',
    'Token X Price',
    'Token Y Symbol',
    'Token Y Name',
    'Token Y Address',
    'Token Y Price',
    'Active Bin',
    'Liquidity Amount',
    'Current Value USD',
    'Initial Value USD',
    'P&L USD',
    'P&L Percentage',
    'Realized P&L',
    'Unrealized P&L',
    'Fees Earned Token X',
    'Fees Earned Token Y',
    'Fees Value USD',
    'Impermanent Loss',
    'Is Active',
    'Created At',
    'Last Updated',
    'Holding Period (days)'
  ]

  return arrayToCSV(data, headers)
}
