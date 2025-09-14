import {
  calculateLiquidityDistribution,
  calculateBinRange,
  formatBinData,
  calculateProfitLoss,
  calculateImpermanentLoss,
} from '../../../src/lib/dlmm/utils'

describe('DLMM Utils', () => {
  describe('calculateLiquidityDistribution', () => {
    it('should calculate spot distribution correctly', () => {
      const result = calculateLiquidityDistribution('spot', 100, 5, 1000)

      expect(result).toHaveLength(5)
      expect(result.every(d => d.xAmount + d.yAmount === 200)).toBe(true) // 1000/5 = 200 per bin
      expect(result.map(d => d.binId)).toEqual([98, 99, 100, 101, 102])
    })

    it('should calculate curve distribution with proper weighting', () => {
      const result = calculateLiquidityDistribution('curve', 100, 5, 1000)

      expect(result).toHaveLength(5)

      // Check that center bin (100) has most liquidity
      const centerBin = result.find(d => d.binId === 100)
      const edgeBins = result.filter(d => d.binId === 98 || d.binId === 102)

      expect((centerBin?.xAmount || 0) + (centerBin?.yAmount || 0)).toBeGreaterThan(
        (edgeBins[0]?.xAmount || 0) + (edgeBins[0]?.yAmount || 0)
      )
    })

    it('should calculate bid-ask distribution correctly', () => {
      const result = calculateLiquidityDistribution('bid-ask', 100, 6, 1000)

      expect(result).toHaveLength(6)

      // Lower bins should have more X tokens (bids)
      const lowerBins = result.filter(d => d.binId < 100)
      const upperBins = result.filter(d => d.binId > 100)

      expect(lowerBins.every(d => d.xAmount > d.yAmount)).toBe(true)
      expect(upperBins.every(d => d.yAmount > d.xAmount)).toBe(true)
    })

    it('should handle edge cases', () => {
      // Single bin
      const singleBin = calculateLiquidityDistribution('spot', 100, 1, 1000)
      expect(singleBin).toHaveLength(1)
      expect(singleBin[0].binId).toBe(100)

      // Zero amount
      const zeroAmount = calculateLiquidityDistribution('spot', 100, 5, 0)
      expect(zeroAmount.every(d => d.xAmount === 0 && d.yAmount === 0)).toBe(true)
    })
  })

  describe('calculateBinRange', () => {
    it('should calculate bin range correctly for odd range', () => {
      const result = calculateBinRange(100, 5)

      expect(result.centerBin).toBe(100)
      expect(result.binIds).toEqual([98, 99, 100, 101, 102])
      expect(result.minBin).toBe(98)
      expect(result.maxBin).toBe(102)
    })

    it('should calculate bin range correctly for even range', () => {
      const result = calculateBinRange(100, 4)

      expect(result.centerBin).toBe(100)
      expect(result.binIds).toEqual([98, 99, 100, 101])
      expect(result.minBin).toBe(98)
      expect(result.maxBin).toBe(101)
    })

    it('should handle single bin range', () => {
      const result = calculateBinRange(100, 1)

      expect(result.centerBin).toBe(100)
      expect(result.binIds).toEqual([100])
      expect(result.minBin).toBe(100)
      expect(result.maxBin).toBe(100)
    })

    it('should handle large ranges', () => {
      const result = calculateBinRange(100, 100)

      expect(result.centerBin).toBe(100)
      expect(result.binIds).toHaveLength(100)
      expect(result.minBin).toBe(50)
      expect(result.maxBin).toBe(149)
    })
  })

  describe('formatBinData', () => {
    const mockRawBinData = [
      {
        binId: 100,
        reserveX: '1000000', // 1 USDC (6 decimals)
        reserveY: '500000000', // 0.5 SOL (9 decimals)
        price: 100.5,
        isActive: true,
      },
      {
        binId: 101,
        reserveX: '2000000',
        reserveY: '1000000000',
        price: 101.5,
        isActive: false,
      },
    ]

    it('should format bin data correctly', () => {
      const result = formatBinData(mockRawBinData)

      expect(result).toHaveLength(2)

      expect(result[0]).toEqual({
        binId: 100,
        price: 100.5,
        liquidityX: '1000000',
        liquidityY: '500000000',
        isActive: true,
        volume24h: '0',
        feeRate: 0,
      })

      expect(result[1]).toEqual({
        binId: 101,
        price: 101.5,
        liquidityX: '2000000',
        liquidityY: '1000000000',
        isActive: false,
        volume24h: '0',
        feeRate: 0,
      })
    })

    it('should handle empty bin data', () => {
      const result = formatBinData([])
      expect(result).toEqual([])
    })

    it('should handle null/undefined data', () => {
      const result = formatBinData(null as any)
      expect(result).toEqual([])
    })

    it('should provide default values for missing properties', () => {
      const incompleteData = [
        {
          binId: 100,
          // Missing other properties
        },
      ]

      const result = formatBinData(incompleteData as any)

      expect(result[0]).toEqual({
        binId: 100,
        price: Math.pow(1.001, 100) * 100, // Calculated by parseBinId for binId 100
        liquidityX: '0',
        liquidityY: '0',
        isActive: false,
        volume24h: '0',
        feeRate: 0,
      })
    })
  })

  describe('calculateProfitLoss', () => {
    const mockPosition = {
      tokenX: { price: 1.0, decimals: 6 }, // USDC
      tokenY: { price: 100.0, decimals: 9 }, // SOL
      liquidityAmount: '1000000', // $1000 worth
      feesEarned: { tokenX: '10000000', tokenY: '5000000' }, // $10 USDC + 0.005 SOL fees
      createdAt: new Date('2024-01-01'),
    }

    const mockInitialPrices = {
      tokenX: 1.0,
      tokenY: 90.0, // SOL was $90 when position created
    }

    it('should calculate profit/loss correctly', () => {
      const result = calculateProfitLoss(mockPosition as any, mockInitialPrices)

      expect(result.totalPnL).toBeGreaterThan(0) // Should be profitable due to SOL price increase
      expect(result.feesEarned).toBeGreaterThan(0)
      expect(result.priceChangePnL).toBeGreaterThan(0) // SOL price went up
      expect(result.totalReturn).toBeGreaterThan(0)
      expect(result.annualizedReturn).toBeGreaterThan(0)
    })

    it('should handle losses correctly', () => {
      const lossScenarioPosition = {
        ...mockPosition,
        tokenY: { ...mockPosition.tokenY, price: 50.0 }, // SOL dropped to $50
      }

      const result = calculateProfitLoss(lossScenarioPosition as any, mockInitialPrices)

      expect(result.priceChangePnL).toBeLessThan(0) // Should show loss from price drop
      expect(result.feesEarned).toBeGreaterThan(0) // Fees still positive
    })

    it('should handle zero fees', () => {
      const noFeesPosition = {
        ...mockPosition,
        feesEarned: { tokenX: '0', tokenY: '0' },
      }

      const result = calculateProfitLoss(noFeesPosition as any, mockInitialPrices)

      expect(result.feesEarned).toBe(0)
      expect(result.totalPnL).toEqual(result.priceChangePnL)
    })
  })

  describe('calculateImpermanentLoss', () => {
    it('should calculate impermanent loss for price increase', () => {
      const initialRatio = 1.0 // 1 SOL = 1 unit of reference
      const currentRatio = 2.0 // SOL doubled in price

      const result = calculateImpermanentLoss(initialRatio, currentRatio)

      expect(result.impermanentLoss).toBeGreaterThan(0) // Should have IL when price changes
      expect(result.impermanentLoss).toBeLessThan(1) // IL should be less than 100%
      expect(result.hodlValue).toBeGreaterThan(result.lpValue) // HODLing should be better
    })

    it('should calculate impermanent loss for price decrease', () => {
      const initialRatio = 1.0
      const currentRatio = 0.5 // SOL halved in price

      const result = calculateImpermanentLoss(initialRatio, currentRatio)

      expect(result.impermanentLoss).toBeGreaterThan(0) // Should have IL
      expect(result.lpValue).toBeGreaterThan(result.hodlValue) // LP is better when price drops due to rebalancing
    })

    it('should return zero IL when no price change', () => {
      const initialRatio = 1.0
      const currentRatio = 1.0 // No price change

      const result = calculateImpermanentLoss(initialRatio, currentRatio)

      expect(result.impermanentLoss).toBe(0)
      expect(result.hodlValue).toBeCloseTo(result.lpValue, 5)
    })

    it('should handle extreme price changes', () => {
      const initialRatio = 1.0
      const currentRatio = 10.0 // 10x price increase

      const result = calculateImpermanentLoss(initialRatio, currentRatio)

      expect(result.impermanentLoss).toBeGreaterThan(0)
      expect(result.impermanentLoss).toBeLessThan(1) // Should never reach 100%
      expect(result.hodlValue).toBeGreaterThan(result.lpValue * 2) // Significant difference
    })

    it('should handle very small price changes', () => {
      const initialRatio = 1.0
      const currentRatio = 1.001 // 0.1% price increase

      const result = calculateImpermanentLoss(initialRatio, currentRatio)

      expect(result.impermanentLoss).toBeGreaterThan(0)
      expect(result.impermanentLoss).toBeLessThan(0.001) // Very small IL
    })
  })
})