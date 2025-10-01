/**
 * Unit tests for tax calculation utilities
 * Critical for IRS Form 8949 accuracy
 */

import {
  calculateTaxEvents,
  calculateTaxLiability,
  generateTaxSummary,
  identifyTaxLossHarvestingOpportunities,
  analyzeHoldingPeriods
} from '@/lib/reports/tax-calculator'
import { DLMMPosition } from '@/lib/types'
import { PublicKey } from '@solana/web3.js'

describe('Tax Calculator', () => {
  // Mock PublicKeys
  const mockPubkey1 = new PublicKey('11111111111111111111111111111111')
  const mockPubkey2 = new PublicKey('22222222222222222222222222222222')
  const mockPubkey3 = new PublicKey('33333333333333333333333333333333')

  // Mock position data matching actual DLMMPosition interface
  const mockOpenPosition: DLMMPosition = {
    id: 'test1',
    poolAddress: mockPubkey1,
    userAddress: mockPubkey2,
    tokenX: {
      address: mockPubkey1,
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      price: 100
    },
    tokenY: {
      address: mockPubkey2,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      price: 1
    },
    activeBin: 8388608,
    liquidityAmount: '1000000',
    feesEarned: {
      tokenX: '0',
      tokenY: '0'
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    lastUpdated: new Date(),
    isActive: true,
    currentValue: 10500,
    initialValue: 10000,
    pnl: 500
  }

  const mockClosedProfitPosition: DLMMPosition = {
    id: 'test2',
    poolAddress: mockPubkey1,
    userAddress: mockPubkey2,
    tokenX: {
      address: mockPubkey1,
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      price: 110
    },
    tokenY: {
      address: mockPubkey2,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      price: 1
    },
    activeBin: 8388608,
    liquidityAmount: '1000000',
    feesEarned: {
      tokenX: '10',
      tokenY: '500'
    },
    createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // 400 days ago (long-term)
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    isActive: false,
    currentValue: 11000,
    initialValue: 10000,
    pnl: 1000
  }

  const mockClosedLossPosition: DLMMPosition = {
    id: 'test3',
    poolAddress: mockPubkey3,
    userAddress: mockPubkey2,
    tokenX: {
      address: mockPubkey3,
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 9,
      price: 2000
    },
    tokenY: {
      address: mockPubkey2,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      price: 1
    },
    activeBin: 8388608,
    liquidityAmount: '500000',
    feesEarned: {
      tokenX: '0.5',
      tokenY: '100'
    },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago (short-term)
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isActive: false,
    currentValue: 9700,
    initialValue: 10000,
    pnl: -300
  }

  describe('calculateTaxEvents', () => {
    it('should create liquidity_add event for all positions', () => {
      const events = calculateTaxEvents([mockOpenPosition])

      const addEvents = events.filter(e => e.type === 'liquidity_add')
      expect(addEvents).toHaveLength(1)
      expect(addEvents[0].costBasis).toBe(10000)
    })

    it('should create fee_collection events when fees exist', () => {
      const events = calculateTaxEvents([mockClosedProfitPosition])

      const feeEvents = events.filter(e => e.type === 'fee_collection')
      expect(feeEvents.length).toBeGreaterThan(0)
    })

    it('should create liquidity_remove event for closed positions', () => {
      const events = calculateTaxEvents([mockClosedProfitPosition])

      const removeEvents = events.filter(e => e.type === 'liquidity_remove')
      expect(removeEvents).toHaveLength(1)
      expect(removeEvents[0].gainLoss).toBe(1000)
      expect(removeEvents[0].isShortTerm).toBe(false) // 400 days > 365
    })

    it('should calculate short-term correctly for positions under 365 days', () => {
      const events = calculateTaxEvents([mockClosedLossPosition])

      const removeEvents = events.filter(e => e.type === 'liquidity_remove')
      expect(removeEvents[0].isShortTerm).toBe(true) // 60 days < 365
    })

    it('should handle multiple positions', () => {
      const events = calculateTaxEvents([
        mockClosedProfitPosition,
        mockClosedLossPosition
      ])

      expect(events.length).toBeGreaterThan(0)
    })
  })

  describe('generateTaxSummary', () => {
    it('should calculate correct summary for closed position with loss', () => {
      const summary = generateTaxSummary([mockClosedLossPosition], new Date().getFullYear())

      expect(summary.shortTermLosses).toBeGreaterThan(0)
      expect(summary.netGainLoss).toBeLessThan(0)
    })

    it('should calculate correct summary for closed position with gain', () => {
      const summary = generateTaxSummary([mockClosedProfitPosition], new Date().getFullYear())

      expect(summary.longTermGains).toBeGreaterThan(0)
      expect(summary.feeIncome).toBeGreaterThan(0) // Has fee earnings
    })

    it('should handle mixed positions', () => {
      const summary = generateTaxSummary([
        mockClosedProfitPosition,
        mockClosedLossPosition
      ], new Date().getFullYear())

      expect(summary.totalGains).toBeGreaterThan(0)
      expect(summary.totalLosses).toBeGreaterThan(0)
    })
  })

  describe('calculateTaxLiability', () => {
    it('should calculate correct tax liability from summary', () => {
      const summary = generateTaxSummary([mockClosedProfitPosition], new Date().getFullYear())
      const liability = calculateTaxLiability(summary, 'single')

      expect(liability).toBeGreaterThan(0)
    })

    it('should not generate negative tax liability for losses', () => {
      const summary = generateTaxSummary([mockClosedLossPosition], new Date().getFullYear())
      const liability = calculateTaxLiability(summary, 'single')

      expect(liability).toBeGreaterThanOrEqual(0)
    })
  })

  describe('identifyTaxLossHarvestingOpportunities', () => {
    it('should identify positions with unrealized losses', () => {
      const lossPosition: DLMMPosition = {
        ...mockOpenPosition,
        currentValue: 9500,
        initialValue: 10000,
        pnl: -500
      }

      const opportunities = identifyTaxLossHarvestingOpportunities([lossPosition])

      expect(opportunities).toHaveLength(1)
      expect(opportunities[0].currentLoss).toBeGreaterThan(0)
      expect(opportunities[0].potentialTaxSavings).toBeGreaterThan(0)
    })

    it('should not identify profitable positions', () => {
      const opportunities = identifyTaxLossHarvestingOpportunities([mockOpenPosition])
      expect(opportunities).toHaveLength(0)
    })

    it('should calculate correct potential tax savings', () => {
      const lossPosition: DLMMPosition = {
        ...mockOpenPosition,
        currentValue: 9000,
        initialValue: 10000,
        pnl: -1000
      }

      const opportunities = identifyTaxLossHarvestingOpportunities([lossPosition])

      expect(opportunities[0].currentLoss).toBe(1000)
      expect(opportunities[0].potentialTaxSavings).toBeCloseTo(370, 0) // 37% tax rate
    })

    it('should handle multiple loss positions', () => {
      const lossPosition1: DLMMPosition = {
        ...mockOpenPosition,
        id: 'loss1',
        currentValue: 9500,
        initialValue: 10000
      }
      const lossPosition2: DLMMPosition = {
        ...mockOpenPosition,
        id: 'loss2',
        currentValue: 9700,
        initialValue: 10000
      }
      const profitPosition: DLMMPosition = {
        ...mockOpenPosition,
        id: 'profit1',
        currentValue: 10500,
        initialValue: 10000
      }

      const opportunities = identifyTaxLossHarvestingOpportunities([
        lossPosition1,
        lossPosition2,
        profitPosition
      ])

      expect(opportunities).toHaveLength(2)
      expect(opportunities.every(o => o.currentLoss > 0)).toBe(true)
    })

    it('should sort opportunities by loss amount', () => {
      const smallLoss: DLMMPosition = {
        ...mockOpenPosition,
        id: 'small',
        currentValue: 9900,
        initialValue: 10000
      }
      const largeLoss: DLMMPosition = {
        ...mockOpenPosition,
        id: 'large',
        currentValue: 9000,
        initialValue: 10000
      }

      const opportunities = identifyTaxLossHarvestingOpportunities([smallLoss, largeLoss])

      expect(opportunities[0].currentLoss).toBeGreaterThan(opportunities[1].currentLoss)
    })
  })

  describe('analyzeHoldingPeriods', () => {
    it('should calculate holding periods for all positions', () => {
      const analysis = analyzeHoldingPeriods([mockOpenPosition, mockClosedProfitPosition])

      expect(analysis).toHaveLength(2)
      expect(analysis[0].daysHeld).toBeGreaterThan(0)
    })

    it('should identify short-term holdings', () => {
      const analysis = analyzeHoldingPeriods([mockOpenPosition])

      expect(analysis[0].isShortTerm).toBe(true)
      expect(analysis[0].daysUntilLongTerm).toBeGreaterThan(0)
    })

    it('should identify long-term holdings', () => {
      const longTermPosition: DLMMPosition = {
        ...mockOpenPosition,
        createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000)
      }

      const analysis = analyzeHoldingPeriods([longTermPosition])

      expect(analysis[0].isShortTerm).toBe(false)
      expect(analysis[0].daysUntilLongTerm).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty position array', () => {
      const events = calculateTaxEvents([])
      expect(events).toHaveLength(0)

      const opportunities = identifyTaxLossHarvestingOpportunities([])
      expect(opportunities).toHaveLength(0)

      const summary = generateTaxSummary([])
      expect(summary.netGainLoss).toBe(0)
    })

    it('should handle positions without currentValue or initialValue', () => {
      const incompletePosition: DLMMPosition = {
        ...mockOpenPosition,
        currentValue: undefined,
        initialValue: undefined
      }

      const opportunities = identifyTaxLossHarvestingOpportunities([incompletePosition])
      expect(opportunities).toHaveLength(0)
    })

    it('should handle very large gains/losses', () => {
      const largeGainPosition: DLMMPosition = {
        ...mockClosedProfitPosition,
        currentValue: 1010000,
        initialValue: 10000
      }

      const summary = generateTaxSummary([largeGainPosition])
      const liability = calculateTaxLiability(summary, 'single')

      expect(liability).toBeGreaterThan(0)
    })
  })
})
