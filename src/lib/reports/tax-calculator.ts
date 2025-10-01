import { DLMMPosition } from '@/lib/types'

export interface TaxEvent {
  date: Date
  type: 'buy' | 'sell' | 'fee_collection' | 'liquidity_add' | 'liquidity_remove'
  tokenSymbol: string
  amount: number
  priceUSD: number
  costBasis: number
  proceeds: number
  gainLoss: number
  holdingPeriod: number // days
  isShortTerm: boolean
  positionId: string
}

export interface TaxSummary {
  totalGains: number
  totalLosses: number
  netGainLoss: number
  shortTermGains: number
  shortTermLosses: number
  longTermGains: number
  longTermLosses: number
  feeIncome: number
  harvestableOpportunities: TaxLossHarvestingOpportunity[]
  form8949Data: Form8949Entry[]
}

export interface TaxLossHarvestingOpportunity {
  positionId: string
  poolName: string
  currentLoss: number
  potentialTaxSavings: number
  recommendation: string
  riskLevel: 'low' | 'medium' | 'high'
}

export interface Form8949Entry {
  description: string
  dateAcquired: string
  dateSold: string
  proceeds: number
  costBasis: number
  adjustmentCode?: string
  adjustmentAmount?: number
  gainLoss: number
  isShortTerm: boolean
}

export interface HoldingPeriodAnalysis {
  position: DLMMPosition
  daysHeld: number
  isShortTerm: boolean
  daysUntilLongTerm: number
  recommendation: string
}

/**
 * Calculate all taxable events from DLMM position data for IRS reporting.
 *
 * Generates tax events for:
 * - Liquidity additions (cost basis establishment)
 * - Fee collections (ordinary income treatment)
 * - Liquidity removals (capital gains/losses calculation)
 *
 * @param positions - Array of DLMM positions to analyze
 * @returns Array of tax events sorted by date (most recent first)
 *
 * @example
 * ```ts
 * const positions = await dlmmClient.getUserPositions(wallet.publicKey)
 * const events = calculateTaxEvents(positions)
 * console.log(`Found ${events.length} taxable events`)
 * ```
 */
export function calculateTaxEvents(positions: DLMMPosition[]): TaxEvent[] {
  const events: TaxEvent[] = []

  positions.forEach(position => {
    // Add liquidity event
    events.push({
      date: position.createdAt,
      type: 'liquidity_add',
      tokenSymbol: `${position.tokenX.symbol}-${position.tokenY.symbol}`,
      amount: parseFloat(position.liquidityAmount),
      priceUSD: position.initialValue || 0,
      costBasis: position.initialValue || 0,
      proceeds: 0,
      gainLoss: 0,
      holdingPeriod: 0,
      isShortTerm: true,
      positionId: position.id
    })

    // Fee collection events
    const feeX = parseFloat(position.feesEarned.tokenX)
    const feeY = parseFloat(position.feesEarned.tokenY)

    if (feeX > 0) {
      events.push({
        date: position.lastUpdated,
        type: 'fee_collection',
        tokenSymbol: position.tokenX.symbol,
        amount: feeX,
        priceUSD: feeX * position.tokenX.price,
        costBasis: 0,
        proceeds: feeX * position.tokenX.price,
        gainLoss: feeX * position.tokenX.price,
        holdingPeriod: Math.floor((position.lastUpdated.getTime() - position.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        isShortTerm: true,
        positionId: position.id
      })
    }

    if (feeY > 0) {
      events.push({
        date: position.lastUpdated,
        type: 'fee_collection',
        tokenSymbol: position.tokenY.symbol,
        amount: feeY,
        priceUSD: feeY * position.tokenY.price,
        costBasis: 0,
        proceeds: feeY * position.tokenY.price,
        gainLoss: feeY * position.tokenY.price,
        holdingPeriod: Math.floor((position.lastUpdated.getTime() - position.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        isShortTerm: true,
        positionId: position.id
      })
    }

    // If position is closed (not active), add removal event
    if (!position.isActive && position.currentValue !== undefined && position.initialValue !== undefined) {
      const holdingDays = Math.floor((position.lastUpdated.getTime() - position.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      events.push({
        date: position.lastUpdated,
        type: 'liquidity_remove',
        tokenSymbol: `${position.tokenX.symbol}-${position.tokenY.symbol}`,
        amount: parseFloat(position.liquidityAmount),
        priceUSD: position.currentValue,
        costBasis: position.initialValue,
        proceeds: position.currentValue,
        gainLoss: position.currentValue - position.initialValue,
        holdingPeriod: holdingDays,
        isShortTerm: holdingDays < 365,
        positionId: position.id
      })
    }
  })

  return events.sort((a, b) => b.date.getTime() - a.date.getTime())
}

/**
 * Generate comprehensive tax summary for a specific tax year.
 *
 * Calculates short-term and long-term capital gains/losses, fee income,
 * and identifies tax-loss harvesting opportunities. Generates Form 8949 data
 * for IRS reporting.
 *
 * @param positions - Array of DLMM positions to analyze
 * @param taxYear - Tax year to generate summary for (defaults to current year)
 * @returns Complete tax summary with gains/losses breakdown and harvestable opportunities
 *
 * @example
 * ```ts
 * const summary = generateTaxSummary(positions, 2024)
 * console.log(`Net gain/loss: $${summary.netGainLoss.toFixed(2)}`)
 * console.log(`Tax-loss opportunities: ${summary.harvestableOpportunities.length}`)
 * ```
 */
export function generateTaxSummary(positions: DLMMPosition[], taxYear: number = new Date().getFullYear()): TaxSummary {
  const events = calculateTaxEvents(positions).filter(event =>
    event.date.getFullYear() === taxYear
  )

  let shortTermGains = 0
  let shortTermLosses = 0
  let longTermGains = 0
  let longTermLosses = 0
  let feeIncome = 0

  events.forEach(event => {
    if (event.type === 'fee_collection') {
      feeIncome += event.gainLoss
    } else if (event.type === 'liquidity_remove') {
      if (event.isShortTerm) {
        if (event.gainLoss > 0) {
          shortTermGains += event.gainLoss
        } else {
          shortTermLosses += Math.abs(event.gainLoss)
        }
      } else {
        if (event.gainLoss > 0) {
          longTermGains += event.gainLoss
        } else {
          longTermLosses += Math.abs(event.gainLoss)
        }
      }
    }
  })

  const harvestableOpportunities = identifyTaxLossHarvestingOpportunities(positions)
  const form8949Data = generateForm8949Entries(events)

  return {
    totalGains: shortTermGains + longTermGains,
    totalLosses: shortTermLosses + longTermLosses,
    netGainLoss: (shortTermGains + longTermGains) - (shortTermLosses + longTermLosses),
    shortTermGains,
    shortTermLosses,
    longTermGains,
    longTermLosses,
    feeIncome,
    harvestableOpportunities,
    form8949Data
  }
}

/**
 * Identify positions with unrealized losses that can be harvested for tax benefits.
 *
 * Analyzes open positions to find those with unrealized losses. Harvesting these
 * losses can offset capital gains and reduce taxable income (up to $3,000 per year
 * for ordinary income). Calculates potential tax savings assuming highest marginal rate (37%).
 *
 * **Important**: Be aware of IRS wash sale rules (30-day rule) when repurchasing similar assets.
 *
 * @param positions - Array of DLM M positions to analyze (typically open positions only)
 * @returns Array of harvesting opportunities sorted by loss amount (largest first)
 *
 * @example
 * ```ts
 * const opportunities = identifyTaxLossHarvestingOpportunities(openPositions)
 * opportunities.forEach(opp => {
 *   console.log(`${opp.poolName}: Loss $${opp.currentLoss}, Save $${opp.potentialTaxSavings}`)
 * })
 * ```
 */
export function identifyTaxLossHarvestingOpportunities(positions: DLMMPosition[]): TaxLossHarvestingOpportunity[] {
  const opportunities: TaxLossHarvestingOpportunity[] = []

  positions.forEach(position => {
    if (!position.currentValue || !position.initialValue) return

    const unrealizedLoss = position.currentValue - position.initialValue

    // Only consider positions with losses
    if (unrealizedLoss < 0) {
      const lossAmount = Math.abs(unrealizedLoss)
      const taxRate = 0.37 // Assuming highest marginal rate
      const potentialSavings = lossAmount * taxRate

      let riskLevel: 'low' | 'medium' | 'high' = 'medium'
      let recommendation = ''

      if (lossAmount < 100) {
        riskLevel = 'low'
        recommendation = 'Small loss - consider holding unless needed for tax purposes'
      } else if (lossAmount < 1000) {
        riskLevel = 'medium'
        recommendation = 'Moderate loss - good harvesting candidate if you have gains to offset'
      } else {
        riskLevel = 'high'
        recommendation = 'Significant loss - strong harvesting candidate, consider rebalancing'
      }

      opportunities.push({
        positionId: position.id,
        poolName: `${position.tokenX.symbol}/${position.tokenY.symbol}`,
        currentLoss: lossAmount,
        potentialTaxSavings: potentialSavings,
        recommendation,
        riskLevel
      })
    }
  })

  return opportunities.sort((a, b) => b.currentLoss - a.currentLoss)
}

/**
 * Generate IRS Form 8949 entries from tax events for capital gains reporting.
 *
 * Form 8949 is required to report sales and dispositions of capital assets.
 * This function formats tax events into the structure required by the IRS form,
 * separating short-term (Part I) and long-term (Part II) transactions.
 *
 * @param events - Array of tax events (typically from calculateTaxEvents)
 * @returns Array of Form 8949 entries ready for IRS submission
 *
 * @see https://www.irs.gov/forms-pubs/about-form-8949
 *
 * @example
 * ```ts
 * const events = calculateTaxEvents(positions)
 * const form8949 = generateForm8949Entries(events)
 * const shortTerm = form8949.filter(e => e.isShortTerm)
 * const longTerm = form8949.filter(e => !e.isShortTerm)
 * ```
 */
export function generateForm8949Entries(events: TaxEvent[]): Form8949Entry[] {
  return events
    .filter(event => event.type === 'liquidity_remove')
    .map(event => ({
      description: `${event.tokenSymbol} Liquidity Position`,
      dateAcquired: event.date.toLocaleDateString('en-US'),
      dateSold: event.date.toLocaleDateString('en-US'),
      proceeds: event.proceeds,
      costBasis: event.costBasis,
      gainLoss: event.gainLoss,
      isShortTerm: event.isShortTerm
    }))
}

/**
 * Analyze holding periods for all positions to determine tax treatment.
 *
 * Calculates days held for each position and determines if it qualifies for long-term
 * capital gains treatment (365+ days). Provides recommendations on optimal timing
 * for closing positions to minimize tax liability.
 *
 * **Key Tax Rates (2024)**:
 * - Short-term (<365 days): Taxed as ordinary income (up to 37%)
 * - Long-term (365+ days): Preferential rates (0%, 15%, or 20% depending on income)
 *
 * @param positions - Array of DLMM positions to analyze
 * @returns Array of holding period analyses with tax recommendations
 *
 * @example
 * ```ts
 * const analysis = analyzeHoldingPeriods(positions)
 * const nearLongTerm = analysis.filter(a => a.isShortTerm && a.daysUntilLongTerm < 30)
 * console.log(`${nearLongTerm.length} positions becoming long-term soon`)
 * ```
 */
export function analyzeHoldingPeriods(positions: DLMMPosition[]): HoldingPeriodAnalysis[] {
  return positions.map(position => {
    const now = new Date()
    const daysHeld = Math.floor((now.getTime() - position.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    const isShortTerm = daysHeld < 365
    const daysUntilLongTerm = isShortTerm ? 365 - daysHeld : 0

    let recommendation = ''
    if (isShortTerm && daysUntilLongTerm < 30) {
      recommendation = `Consider holding for ${daysUntilLongTerm} more days to qualify for long-term capital gains rates`
    } else if (isShortTerm) {
      recommendation = 'Short-term holding - gains taxed as ordinary income'
    } else {
      recommendation = 'Long-term holding - qualifies for preferential capital gains rates'
    }

    return {
      position,
      daysHeld,
      isShortTerm,
      daysUntilLongTerm,
      recommendation
    }
  })
}

/**
 * Calculate estimated tax liability from tax summary.
 *
 * Estimates total tax owed based on capital gains/losses and fee income.
 * Uses simplified 2024 tax rates (highest brackets for conservative estimate):
 * - Short-term gains & fee income: 37% (ordinary income rate)
 * - Long-term gains: 20% (long-term capital gains rate)
 *
 * **Note**: This is a simplified calculation. Actual tax liability depends on:
 * - Total taxable income
 * - Filing status
 * - State taxes
 * - Other deductions and credits
 *
 * Consult a tax professional for accurate calculations.
 *
 * @param summary - Tax summary from generateTaxSummary()
 * @param _filingStatus - Filing status (currently unused, reserved for future enhancement)
 * @returns Estimated tax liability in USD
 *
 * @example
 * ```ts
 * const summary = generateTaxSummary(positions, 2024)
 * const liability = calculateTaxLiability(summary, 'single')
 * console.log(`Estimated tax: $${liability.toFixed(2)}`)
 * ```
 */
export function calculateTaxLiability(
  summary: TaxSummary,
  _filingStatus: 'single' | 'married' | 'head_of_household' = 'single'
): number {
  // Simplified tax calculation (2024 rates)
  const shortTermRate = 0.37 // Taxed as ordinary income (highest bracket)
  const longTermRate = 0.20 // Long-term capital gains rate (highest bracket)

  const shortTermTax = (summary.shortTermGains - summary.shortTermLosses) * shortTermRate
  const longTermTax = (summary.longTermGains - summary.longTermLosses) * longTermRate
  const feeTax = summary.feeIncome * shortTermRate

  return Math.max(0, shortTermTax + longTermTax + feeTax)
}
