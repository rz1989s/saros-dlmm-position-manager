'use client'

import { PublicKey } from '@solana/web3.js'
import { DLMMPosition } from '@/lib/types'
import { getRealTimePrices } from '@/lib/utils/real-time-prices'

/**
 * Generate realistic mock DLMM positions for demonstration and testing
 * Now uses real-time prices from CoinGecko API with fallback to hardcoded values
 */
export async function generateMockPositions(userAddress?: PublicKey): Promise<DLMMPosition[]> {
  const defaultUserAddress = userAddress || new PublicKey('11111111111111111111111111111112')

  // Fetch real-time prices for all tokens
  const tokenSymbols = ['SOL', 'USDC', 'RAY', 'ORCA', 'MNGO', 'JUP']
  let prices: Map<string, { price: number }> = new Map()

  try {
    console.log('🔄 Fetching real-time prices for tokens...')
    prices = await getRealTimePrices(tokenSymbols)
    console.log('✅ Real-time prices fetched:', Array.from(prices.entries()).map(([s, p]) => `${s}: $${p.price.toFixed(2)}`).join(', '))
  } catch (error) {
    console.warn('⚠️ Failed to fetch real-time prices, using fallbacks:', error)
    // Set fallback prices if API fails
    prices.set('SOL', { price: 165.45 })
    prices.set('USDC', { price: 1.00 })
    prices.set('RAY', { price: 3.82 })
    prices.set('ORCA', { price: 4.67 })
    prices.set('MNGO', { price: 0.025 })
    prices.set('JUP', { price: 1.15 })
  }

  // Helper to get price or fallback
  const getPrice = (symbol: string, fallback: number): number => {
    return prices.get(symbol)?.price || fallback
  }

  const mockPositions: DLMMPosition[] = [
    // Profitable SOL/USDC position
    {
      id: 'mock_position_1',
      poolAddress: new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'),
      userAddress: defaultUserAddress,
      tokenX: {
        address: new PublicKey('So11111111111111111111111111111111111111112'),
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        price: getPrice('SOL', 165.45),
      },
      tokenY: {
        address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        price: getPrice('USDC', 1.00),
      },
      activeBin: 8388608,
      liquidityAmount: '15750000000',
      feesEarned: {
        tokenX: '2850000000', // 2.85 SOL
        tokenY: '495000000',  // 495 USDC
      },
      createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
      lastUpdated: new Date(),
      isActive: true,
    },

    // Small loss position RAY/SOL
    {
      id: 'mock_position_2',
      poolAddress: new PublicKey('AVs9TA4nWDzfPJE9gGVNJMVhcQy3V9PGazuz33BfG2RA'),
      userAddress: defaultUserAddress,
      tokenX: {
        address: new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'),
        symbol: 'RAY',
        name: 'Raydium',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
        price: getPrice('RAY', 3.82),
      },
      tokenY: {
        address: new PublicKey('So11111111111111111111111111111111111111112'),
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        price: getPrice('SOL', 165.45),
      },
      activeBin: 8388590,
      liquidityAmount: '8200000000',
      feesEarned: {
        tokenX: '125000000', // 125 RAY
        tokenY: '850000000', // 0.85 SOL
      },
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      lastUpdated: new Date(),
      isActive: true,
    },

    // Profitable ORCA/USDC position
    {
      id: 'mock_position_3',
      poolAddress: new PublicKey('2p7nYbtPBgtmY69NsE8DAW6szpRJn7tQvDnqvoEWQvjY'),
      userAddress: defaultUserAddress,
      tokenX: {
        address: new PublicKey('orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE'),
        symbol: 'ORCA',
        name: 'Orca',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png',
        price: getPrice('ORCA', 4.67),
      },
      tokenY: {
        address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        price: getPrice('USDC', 1.00),
      },
      activeBin: 8388620,
      liquidityAmount: '12500000000',
      feesEarned: {
        tokenX: '245000000', // 245 ORCA
        tokenY: '325000000', // 325 USDC
      },
      createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000), // 42 days ago
      lastUpdated: new Date(),
      isActive: true,
    },

    // Inactive position - MNGO/USDC (closed)
    {
      id: 'mock_position_4',
      poolAddress: new PublicKey('3d4rzwpy9iGdCZvgxcu7B1YocYffVLsQXPXkBZKt2zLc'),
      userAddress: defaultUserAddress,
      tokenX: {
        address: new PublicKey('MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac'),
        symbol: 'MNGO',
        name: 'Mango',
        decimals: 6,
        logoURI: undefined,
        price: getPrice('MNGO', 0.025),
      },
      tokenY: {
        address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        price: getPrice('USDC', 1.00),
      },
      activeBin: 8388580,
      liquidityAmount: '0',
      feesEarned: {
        tokenX: '0',
        tokenY: '0',
      },
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Closed 5 days ago
      isActive: false,
    },

    // Small JUP/SOL position
    {
      id: 'mock_position_5',
      poolAddress: new PublicKey('8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj'),
      userAddress: defaultUserAddress,
      tokenX: {
        address: new PublicKey('JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'),
        symbol: 'JUP',
        name: 'Jupiter',
        decimals: 6,
        logoURI: 'https://static.jup.ag/jup/icon.png',
        price: getPrice('JUP', 1.15),
      },
      tokenY: {
        address: new PublicKey('So11111111111111111111111111111111111111112'),
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        price: getPrice('SOL', 165.45),
      },
      activeBin: 8388595,
      liquidityAmount: '5250000000',
      feesEarned: {
        tokenX: '78000000',  // 78 JUP
        tokenY: '185000000', // 0.185 SOL
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      lastUpdated: new Date(),
      isActive: true,
    },
  ]

  return mockPositions
}

/**
 * Get mock position analytics for demonstration
 */
export function getMockPositionAnalytics(position: DLMMPosition) {
  // Generate realistic analytics based on position data
  const initialValue = parseFloat(position.liquidityAmount) / 1e9 * 1000 // Simulate initial value
  const feesEarnedX = parseFloat(position.feesEarned.tokenX) / Math.pow(10, position.tokenX.decimals)
  const feesEarnedY = parseFloat(position.feesEarned.tokenY) / Math.pow(10, position.tokenY.decimals)
  const totalFeesUsd = (feesEarnedX * position.tokenX.price) + (feesEarnedY * position.tokenY.price)

  // Simulate current value based on mock data
  let currentValueMultiplier = 1.0
  switch (position.id) {
    case 'mock_position_1': // SOL/USDC - profitable
      currentValueMultiplier = 1.158
      break
    case 'mock_position_2': // RAY/SOL - small loss
      currentValueMultiplier = 0.976
      break
    case 'mock_position_3': // ORCA/USDC - profitable
      currentValueMultiplier = 1.104
      break
    case 'mock_position_4': // MNGO/USDC - closed
      currentValueMultiplier = 0.92
      break
    case 'mock_position_5': // JUP/SOL - new position
      currentValueMultiplier = 1.025
      break
    default:
      currentValueMultiplier = 1.0
  }

  const currentValue = initialValue * currentValueMultiplier
  const pnlAmount = currentValue - initialValue + totalFeesUsd
  const pnlPercentage = (pnlAmount / initialValue) * 100

  return {
    initialValue,
    currentValue,
    totalFeesUsd,
    pnlAmount,
    pnlPercentage,
    isProfit: pnlAmount > 0,
  }
}

/**
 * Generate mock position summary stats
 */
export function getMockPositionsSummary(positions: DLMMPosition[]) {
  const activePositions = positions.filter(p => p.isActive)
  const analytics = positions.map(getMockPositionAnalytics)

  const totalValue = analytics.reduce((sum, a) => sum + a.currentValue, 0)
  const totalPnL = analytics.reduce((sum, a) => sum + a.pnlAmount, 0)
  const totalFees = analytics.reduce((sum, a) => sum + a.totalFeesUsd, 0)

  return {
    totalPositions: positions.length,
    activePositions: activePositions.length,
    totalValue,
    totalPnL,
    totalFees,
    avgPnLPercentage: analytics.length > 0 ? analytics.reduce((sum, a) => sum + a.pnlPercentage, 0) / analytics.length : 0,
  }
}