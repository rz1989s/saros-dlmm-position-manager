import { PublicKey, Transaction } from '@solana/web3.js'
import { DLMMOperations } from '../../../src/lib/dlmm/operations'

// Mock the dlmmClient
jest.mock('../../../src/lib/dlmm/client', () => ({
  dlmmClient: {
    getUserPositions: jest.fn(),
    getLbPair: jest.fn(),
    createAddLiquidityTransaction: jest.fn(),
    createRemoveLiquidityTransaction: jest.fn(),
  },
}))

// Mock the utils functions
jest.mock('../../../src/lib/dlmm/utils', () => ({
  calculateLiquidityDistribution: jest.fn(),
  calculateBinRange: jest.fn(),
  calculateRebalanceRecommendation: jest.fn(),
  findOptimalBins: jest.fn(),
}))

import { dlmmClient } from '../../../src/lib/dlmm/client'
import {
  calculateLiquidityDistribution,
  calculateBinRange,
  findOptimalBins,
} from '../../../src/lib/dlmm/utils'

const mockDlmmClient = dlmmClient as jest.Mocked<typeof dlmmClient>
const mockCalculateLiquidityDistribution = calculateLiquidityDistribution as jest.MockedFunction<
  typeof calculateLiquidityDistribution
>
const mockCalculateBinRange = calculateBinRange as jest.MockedFunction<typeof calculateBinRange>
const mockFindOptimalBins = findOptimalBins as jest.MockedFunction<typeof findOptimalBins>

describe('DLMMOperations', () => {
  let operations: DLMMOperations
  const mockPoolAddress = new PublicKey('11111111111111111111111111111112')
  const mockUserAddress = new PublicKey('22222222222222222222222222222222')

  beforeEach(() => {
    operations = new DLMMOperations()
    jest.clearAllMocks()
  })

  describe('addLiquidity', () => {
    const mockAddLiquidityParams = {
      poolAddress: mockPoolAddress,
      userAddress: mockUserAddress,
      tokenXAmount: '1000',
      tokenYAmount: '2000',
      strategy: 'spot' as const,
      range: 10,
      slippageTolerance: 0.5,
    }

    it('should add liquidity successfully', async () => {
      const mockPairData = { activeBinId: 123 }
      const mockTransaction = { signature: 'mock-tx' }
      const mockDistribution = [
        { binId: 122, xAmount: 500, yAmount: 1000 },
        { binId: 123, xAmount: 500, yAmount: 1000 },
      ]

      mockDlmmClient.getLbPair.mockResolvedValue(mockPairData)
      mockCalculateLiquidityDistribution.mockReturnValue(mockDistribution)
      mockDlmmClient.createAddLiquidityTransaction.mockResolvedValue(mockTransaction)

      const result = await operations.addLiquidity(mockAddLiquidityParams)

      expect(mockDlmmClient.getLbPair).toHaveBeenCalledWith(mockPoolAddress)
      expect(mockCalculateLiquidityDistribution).toHaveBeenCalledWith(
        'spot',
        123,
        10,
        3000 // totalAmount
      )
      expect(mockDlmmClient.createAddLiquidityTransaction).toHaveBeenCalled()
      expect(result).toEqual(mockTransaction)
    })

    it('should throw error when pool not found', async () => {
      mockDlmmClient.getLbPair.mockResolvedValue(null)

      await expect(operations.addLiquidity(mockAddLiquidityParams)).rejects.toThrow(
        'Failed to add liquidity: Error: Pool not found'
      )
    })

    it('should handle transaction creation errors', async () => {
      const mockPairData = { activeBinId: 123 }
      mockDlmmClient.getLbPair.mockResolvedValue(mockPairData)
      mockCalculateLiquidityDistribution.mockReturnValue([])
      mockDlmmClient.createAddLiquidityTransaction.mockRejectedValue(
        new Error('Insufficient funds')
      )

      await expect(operations.addLiquidity(mockAddLiquidityParams)).rejects.toThrow(
        'Failed to add liquidity'
      )
    })
  })

  describe('removeLiquidity', () => {
    const mockRemoveLiquidityParams = {
      poolAddress: mockPoolAddress,
      userAddress: mockUserAddress,
      binIds: [123, 124],
      percentageToRemove: 50,
    }

    it('should remove liquidity successfully', async () => {
      const mockUserPositions = [
        {
          poolAddress: {
            equals: jest.fn().mockImplementation((other) => other === mockPoolAddress),
            toString: () => mockPoolAddress.toString()
          },
          binLiquidity: { 123: '1000', 124: '2000' },
        },
      ]
      const mockTransaction = new Transaction()

      mockDlmmClient.getUserPositions.mockResolvedValue(mockUserPositions)
      mockDlmmClient.createRemoveLiquidityTransaction.mockResolvedValue(mockTransaction)

      const result = await operations.removeLiquidity(mockRemoveLiquidityParams)

      expect(mockDlmmClient.getUserPositions).toHaveBeenCalledWith(mockUserAddress)
      expect(mockDlmmClient.createRemoveLiquidityTransaction).toHaveBeenCalledWith(
        mockPoolAddress,
        mockUserAddress,
        [123, 124],
        ['500', '1000'] // 50% of each bin
      )
      expect(result).toEqual(mockTransaction)
    })

    it('should throw error when no position found', async () => {
      mockDlmmClient.getUserPositions.mockResolvedValue([])

      await expect(operations.removeLiquidity(mockRemoveLiquidityParams)).rejects.toThrow(
        'Failed to remove liquidity: Error: No position found in this pool'
      )
    })
  })

  describe('rebalancePosition', () => {
    const mockRebalanceParams = {
      poolAddress: mockPoolAddress,
      userAddress: mockUserAddress,
      newCenterBin: 125,
      newRange: 15,
      maxSlippage: 1.0,
    }

    it('should rebalance position successfully', async () => {
      const mockPosition = {
        poolAddress: {
          equals: jest.fn().mockImplementation((other) => other === mockPoolAddress),
          toString: () => mockPoolAddress.toString()
        },
        binLiquidity: { 120: '500', 121: '800' },
        totalValue: '2000',
      }
      const mockRemoveTransaction = new Transaction()
      const mockAddTransaction = new Transaction()

      mockDlmmClient.getUserPositions.mockResolvedValue([mockPosition])
      mockCalculateBinRange.mockReturnValue({
        centerBin: 125,
        minBin: 118,
        maxBin: 132,
        binIds: [125, 126]
      })

      // Mock the removeLiquidity and addLiquidity calls
      jest.spyOn(operations, 'removeLiquidity').mockResolvedValue(mockRemoveTransaction)
      jest.spyOn(operations, 'addLiquidity').mockResolvedValue(mockAddTransaction)

      const result = await operations.rebalancePosition(mockRebalanceParams)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(mockRemoveTransaction)
      expect(result[1]).toEqual(mockAddTransaction)
    })

    it('should throw error when no position found to rebalance', async () => {
      mockDlmmClient.getUserPositions.mockResolvedValue([])

      await expect(operations.rebalancePosition(mockRebalanceParams)).rejects.toThrow(
        'Failed to rebalance position: Error: No position found to rebalance'
      )
    })
  })

  describe('createLimitOrder', () => {
    const mockLimitOrderParams = {
      poolAddress: mockPoolAddress,
      userAddress: mockUserAddress,
      side: 'buy' as const,
      amount: '1000',
      targetPrice: 100,
    }

    it('should create limit order successfully', async () => {
      const mockPairData = { activeBinId: 123 }
      const mockTransaction = { signature: 'limit-order-tx' }

      mockDlmmClient.getLbPair.mockResolvedValue(mockPairData)
      mockDlmmClient.createAddLiquidityTransaction.mockResolvedValue(mockTransaction)

      const result = await operations.createLimitOrder(mockLimitOrderParams)

      expect(mockDlmmClient.getLbPair).toHaveBeenCalledWith(mockPoolAddress)
      expect(mockDlmmClient.createAddLiquidityTransaction).toHaveBeenCalled()
      expect(result).toEqual(mockTransaction)
    })

    it('should throw error when pool not found', async () => {
      mockDlmmClient.getLbPair.mockResolvedValue(null)

      await expect(operations.createLimitOrder(mockLimitOrderParams)).rejects.toThrow(
        'Failed to create limit order: Error: Pool not found'
      )
    })
  })

  describe('optimizePosition', () => {
    it('should optimize position successfully', async () => {
      const mockPosition = {
        poolAddress: {
          equals: jest.fn().mockImplementation((other) => other === mockPoolAddress),
          toString: () => mockPoolAddress.toString()
        },
        binLiquidity: { 120: '500', 121: '800' },
        totalValue: '2000',
      }
      const mockPoolData = { activeBin: { binId: 123 } }
      const mockOptimalBins = [122, 123, 124]
      const mockRebalanceTransactions = [new Transaction()]

      mockDlmmClient.getUserPositions.mockResolvedValue([mockPosition])
      mockDlmmClient.getLbPair.mockResolvedValue(mockPoolData)
      mockFindOptimalBins.mockReturnValue(mockOptimalBins)
      jest.spyOn(operations, 'rebalancePosition').mockResolvedValue(mockRebalanceTransactions)

      const result = await operations.optimizePosition(
        mockPoolAddress,
        mockUserAddress,
        'maximize_fees'
      )

      expect(result).toEqual(mockRebalanceTransactions)
    })

    it('should return empty array when no optimization needed', async () => {
      const mockPosition = {
        poolAddress: {
          equals: jest.fn().mockImplementation((other) => other === mockPoolAddress),
          toString: () => mockPoolAddress.toString()
        },
        binLiquidity: { 122: '500', 123: '800', 124: '700' },
        totalValue: '2000',
      }
      const mockPoolData = { activeBin: { binId: 123 } }
      const mockOptimalBins = [122, 123, 124] // Same as current bins

      mockDlmmClient.getUserPositions.mockResolvedValue([mockPosition])
      mockDlmmClient.getLbPair.mockResolvedValue(mockPoolData)
      mockFindOptimalBins.mockReturnValue(mockOptimalBins)

      const result = await operations.optimizePosition(
        mockPoolAddress,
        mockUserAddress,
        'maximize_fees'
      )

      expect(result).toEqual([])
    })
  })

  describe('estimateRebalanceProfit', () => {
    it('should estimate rebalance profit with recommendation', async () => {
      const mockPosition = {
        poolAddress: {
          equals: jest.fn().mockImplementation((other) => other === mockPoolAddress),
          toString: () => mockPoolAddress.toString()
        },
        currentAPR: 0.15, // 15% APR
        totalValue: '10000', // $10,000 position
        binLiquidity: { 120: '3000', 121: '4000', 122: '3000' }, // Provide bin liquidity for calculation
      }

      mockDlmmClient.getUserPositions.mockResolvedValue([mockPosition])

      const result = await operations.estimateRebalanceProfit(
        mockPoolAddress,
        mockUserAddress,
        125,
        15
      )

      expect(result.estimatedFeeIncrease).toBeGreaterThan(0)
      expect(result.estimatedCost).toBeGreaterThan(0)
      expect(result.timeToBreakeven).toBeGreaterThan(0)
      expect(['recommended', 'not_recommended', 'neutral']).toContain(result.recommendation)
    })

    it('should return not_recommended when no position found', async () => {
      mockDlmmClient.getUserPositions.mockResolvedValue([])

      const result = await operations.estimateRebalanceProfit(
        mockPoolAddress,
        mockUserAddress,
        125,
        15
      )

      expect(result.recommendation).toBe('not_recommended')
      expect(result.estimatedFeeIncrease).toBe(0)
      expect(result.estimatedCost).toBe(0)
      expect(result.timeToBreakeven).toBe(Infinity)
    })
  })
})