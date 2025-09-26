import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  PriceDisplay,
  MultiPriceDisplay,
  PriceCard,
  PriceComparison
} from '@/components/oracle/price-display'
import type { PriceData } from '@/lib/types'

// Mock the hooks
jest.mock('@/hooks/use-oracle-prices', () => ({
  useTokenPrice: jest.fn(),
  useMultipleTokenPrices: jest.fn()
}))

// Mock utility functions
jest.mock('@/lib/utils', () => ({
  formatCurrency: jest.fn((value) => `$${value.toFixed(2)}`),
  formatPercentage: jest.fn((value) => `${(value * 100).toFixed(1)}%`)
}))

// Mock UI components
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  )
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div data-testid="card-content" className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div data-testid="card-header" className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <div data-testid="card-title" className={className}>{children}</div>
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => <div data-testid="skeleton" className={className} />
}))

describe('PriceDisplay Component', () => {
  const mockUseTokenPrice = require('@/hooks/use-oracle-prices').useTokenPrice

  const mockPriceData: PriceData = {
    symbol: 'SOL',
    price: 100.50,
    source: 'pyth',
    confidence: 0.95,
    timestamp: new Date('2023-12-01T10:00:00Z')
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic PriceDisplay', () => {
    it('renders price with default props', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: mockPriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceDisplay symbol="SOL" />)

      expect(screen.getByText('$100.50')).toBeInTheDocument()
      expect(screen.getByText('PYTH')).toBeInTheDocument()
    })

    it('shows loading skeleton when loading and no price data', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: null,
        loading: true,
        error: null,
        lastUpdate: null
      })

      render(<PriceDisplay symbol="SOL" />)

      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })

    it('shows error message when price fails to load', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: null,
        loading: false,
        error: 'Network timeout',
        lastUpdate: null
      })

      render(<PriceDisplay symbol="SOL" />)

      expect(screen.getByText('Error loading price')).toBeInTheDocument()
    })

    it('shows error when price data is null', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: null,
        loading: false,
        error: null,
        lastUpdate: null
      })

      render(<PriceDisplay symbol="SOL" />)

      expect(screen.getByText('Error loading price')).toBeInTheDocument()
    })

    it('hides source when showSource is false', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: mockPriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceDisplay symbol="SOL" showSource={false} />)

      expect(screen.getByText('$100.50')).toBeInTheDocument()
      expect(screen.queryByText('PYTH')).not.toBeInTheDocument()
    })

    it('shows confidence when showConfidence is true', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: mockPriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceDisplay symbol="SOL" showConfidence={true} />)

      expect(screen.getByText('$100.50')).toBeInTheDocument()
      expect(screen.getByText('95.0%')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: mockPriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      const { container } = render(<PriceDisplay symbol="SOL" className="custom-class" />)

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('disables realtime updates when enableRealtime is false', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: mockPriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceDisplay symbol="SOL" enableRealtime={false} />)

      expect(mockUseTokenPrice).toHaveBeenCalledWith('SOL', false)
    })
  })

  describe('Source Color Mapping', () => {
    it('applies correct colors for different sources', () => {
      const sources = [
        { source: 'pyth', expectedClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
        { source: 'switchboard', expectedClass: 'bg-green-500/10 text-green-700 dark:text-green-300' },
        { source: 'fallback', expectedClass: 'bg-orange-500/10 text-orange-700 dark:text-orange-300' },
        { source: 'unknown', expectedClass: 'bg-gray-500/10 text-gray-700 dark:text-gray-300' }
      ]

      sources.forEach(({ source, expectedClass }) => {
        mockUseTokenPrice.mockReturnValue({
          priceData: { ...mockPriceData, source },
          loading: false,
          error: null,
          lastUpdate: new Date()
        })

        const { unmount } = render(<PriceDisplay symbol="SOL" />)

        const badge = screen.getByTestId('badge')
        expect(badge).toHaveClass(expectedClass)

        unmount()
      })
    })
  })

  describe('Confidence Color Mapping', () => {
    it('applies correct colors for different confidence levels', () => {
      const confidenceLevels = [
        { confidence: 0.98, expectedClass: 'text-green-600 dark:text-green-400' },
        { confidence: 0.90, expectedClass: 'text-yellow-600 dark:text-yellow-400' },
        { confidence: 0.70, expectedClass: 'text-red-600 dark:text-red-400' }
      ]

      confidenceLevels.forEach(({ confidence, expectedClass }) => {
        mockUseTokenPrice.mockReturnValue({
          priceData: { ...mockPriceData, confidence },
          loading: false,
          error: null,
          lastUpdate: new Date()
        })

        const { unmount } = render(<PriceDisplay symbol="SOL" showConfidence={true} />)

        const confidenceSpan = screen.getByText(`${(confidence * 100).toFixed(1)}%`)
        expect(confidenceSpan).toHaveClass(expectedClass)

        unmount()
      })
    })
  })

  describe('Real-time Updates', () => {
    it('shows existing price data while loading new data', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: mockPriceData,
        loading: true,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceDisplay symbol="SOL" />)

      expect(screen.getByText('$100.50')).toBeInTheDocument()
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })
  })
})

describe('MultiPriceDisplay Component', () => {
  const mockUseMultipleTokenPrices = require('@/hooks/use-oracle-prices').useMultipleTokenPrices

  const mockMultiplePriceData = {
    SOL: { price: 100.50, source: 'pyth', confidence: 0.95, timestamp: new Date() },
    USDC: { price: 1.00, source: 'switchboard', confidence: 0.98, timestamp: new Date() }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Multiple Token Display', () => {
    it('renders multiple token prices', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: mockMultiplePriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<MultiPriceDisplay symbols={['SOL', 'USDC']} />)

      expect(screen.getByText('SOL')).toBeInTheDocument()
      expect(screen.getByText('$100.50')).toBeInTheDocument()
      expect(screen.getByText('USDC')).toBeInTheDocument()
      expect(screen.getByText('$1.00')).toBeInTheDocument()
      expect(screen.getByText('PYTH')).toBeInTheDocument()
      expect(screen.getByText('SWITCHBOARD')).toBeInTheDocument()
    })

    it('shows loading skeletons when loading with no data', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: {},
        loading: true,
        error: null,
        lastUpdate: null
      })

      render(<MultiPriceDisplay symbols={['SOL', 'USDC']} />)

      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons).toHaveLength(2)
    })

    it('shows error for unavailable prices', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: { SOL: mockMultiplePriceData.SOL }, // Missing USDC
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<MultiPriceDisplay symbols={['SOL', 'USDC']} />)

      expect(screen.getByText('SOL')).toBeInTheDocument()
      expect(screen.getByText('USDC')).toBeInTheDocument()
      expect(screen.getByText('Price unavailable')).toBeInTheDocument()
    })

    it('applies horizontal layout by default', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: mockMultiplePriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      const { container } = render(<MultiPriceDisplay symbols={['SOL', 'USDC']} />)

      expect(container.firstChild).toHaveClass('flex', 'flex-wrap', 'gap-4')
    })

    it('applies vertical layout when specified', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: mockMultiplePriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      const { container } = render(<MultiPriceDisplay symbols={['SOL', 'USDC']} layout="vertical" />)

      expect(container.firstChild).toHaveClass('flex', 'flex-col', 'space-y-2')
    })

    it('applies grid layout when specified', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: mockMultiplePriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      const { container } = render(<MultiPriceDisplay symbols={['SOL', 'USDC']} layout="grid" />)

      expect(container.firstChild).toHaveClass('grid', 'grid-cols-2', 'md:grid-cols-3', 'gap-4')
    })

    it('applies custom className', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: mockMultiplePriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      const { container } = render(<MultiPriceDisplay symbols={['SOL', 'USDC']} className="custom-class" />)

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('disables realtime when enableRealtime is false', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: mockMultiplePriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<MultiPriceDisplay symbols={['SOL', 'USDC']} enableRealtime={false} />)

      expect(mockUseMultipleTokenPrices).toHaveBeenCalledWith(['SOL', 'USDC'], false)
    })
  })

  describe('Loading States', () => {
    it('shows existing data while loading updates', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: mockMultiplePriceData,
        loading: true,
        error: null,
        lastUpdate: new Date()
      })

      render(<MultiPriceDisplay symbols={['SOL', 'USDC']} />)

      expect(screen.getByText('SOL')).toBeInTheDocument()
      expect(screen.getByText('$100.50')).toBeInTheDocument()
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })
  })
})

describe('PriceCard Component', () => {
  const mockUseTokenPrice = require('@/hooks/use-oracle-prices').useTokenPrice

  const mockPriceData: PriceData = {
    symbol: 'SOL',
    price: 100.50,
    source: 'pyth',
    confidence: 0.95,
    timestamp: new Date('2023-12-01T10:00:00Z')
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Detailed Price Card', () => {
    it('renders price card with full details', () => {
      const lastUpdate = new Date('2023-12-01T10:30:00Z')
      mockUseTokenPrice.mockReturnValue({
        priceData: mockPriceData,
        loading: false,
        error: null,
        lastUpdate
      })

      render(<PriceCard symbol="SOL" />)

      expect(screen.getByText('SOL Price')).toBeInTheDocument()
      expect(screen.getByText('$100.50')).toBeInTheDocument()
      expect(screen.getByText('PYTH')).toBeInTheDocument()
      expect(screen.getByText('95.0% confidence')).toBeInTheDocument()
      expect(screen.getByText(/Updated:/)).toBeInTheDocument()
    })

    it('hides details when showDetails is false', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: mockPriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceCard symbol="SOL" showDetails={false} />)

      expect(screen.getByText('$100.50')).toBeInTheDocument()
      expect(screen.queryByText('95.0% confidence')).not.toBeInTheDocument()
      expect(screen.queryByText(/Updated:/)).not.toBeInTheDocument()
    })

    it('shows loading skeletons when loading', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: null,
        loading: true,
        error: null,
        lastUpdate: null
      })

      render(<PriceCard symbol="SOL" />)

      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons).toHaveLength(3)
    })

    it('shows error state when price fails to load', () => {
      const errorMessage = 'Oracle connection failed'
      mockUseTokenPrice.mockReturnValue({
        priceData: null,
        loading: false,
        error: errorMessage,
        lastUpdate: null
      })

      render(<PriceCard symbol="SOL" />)

      expect(screen.getByText('Failed to load price data')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('shows existing data while loading updates', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: mockPriceData,
        loading: true,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceCard symbol="SOL" />)

      expect(screen.getByText('$100.50')).toBeInTheDocument()
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })

    it('handles missing lastUpdate gracefully', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: mockPriceData,
        loading: false,
        error: null,
        lastUpdate: null
      })

      render(<PriceCard symbol="SOL" />)

      expect(screen.getByText('$100.50')).toBeInTheDocument()
      expect(screen.queryByText(/Updated:/)).not.toBeInTheDocument()
    })

    it('disables realtime when enableRealtime is false', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: mockPriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceCard symbol="SOL" enableRealtime={false} />)

      expect(mockUseTokenPrice).toHaveBeenCalledWith('SOL', false)
    })
  })
})

describe('PriceComparison Component', () => {
  const mockUseMultipleTokenPrices = require('@/hooks/use-oracle-prices').useMultipleTokenPrices

  const mockComparisonPriceData = {
    SOL: { price: 100.50, source: 'pyth', confidence: 0.95, timestamp: new Date() },
    USDC: { price: 1.00, source: 'switchboard', confidence: 0.98, timestamp: new Date() }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Token Price Comparison', () => {
    it('calculates and displays price ratio', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: mockComparisonPriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceComparison tokenA="SOL" tokenB="USDC" />)

      expect(screen.getByText('SOL/USDC Ratio')).toBeInTheDocument()
      expect(screen.getByText('100.500000')).toBeInTheDocument() // 100.50 / 1.00
      expect(screen.getByText('1 SOL = 100.500000 USDC')).toBeInTheDocument()
      expect(screen.getByText('1 USDC = 0.009950 SOL')).toBeInTheDocument()
    })

    it('shows loading skeleton when loading', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: {},
        loading: true,
        error: null,
        lastUpdate: null
      })

      render(<PriceComparison tokenA="SOL" tokenB="USDC" />)

      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })

    it('shows unavailable message when price data is missing', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: { SOL: mockComparisonPriceData.SOL }, // Missing USDC
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceComparison tokenA="SOL" tokenB="USDC" />)

      expect(screen.getByText('Price data unavailable')).toBeInTheDocument()
    })

    it('handles zero or missing prices gracefully', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: {
          SOL: { ...mockComparisonPriceData.SOL, price: 0 },
          USDC: mockComparisonPriceData.USDC
        },
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceComparison tokenA="SOL" tokenB="USDC" />)

      expect(screen.getByText('Price data unavailable')).toBeInTheDocument()
    })

    it('handles reverse ratio calculation correctly', () => {
      const priceData = {
        USDC: { price: 1.00, source: 'switchboard', confidence: 0.98, timestamp: new Date() },
        SOL: { price: 100.50, source: 'pyth', confidence: 0.95, timestamp: new Date() }
      }

      mockUseMultipleTokenPrices.mockReturnValue({
        priceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceComparison tokenA="USDC" tokenB="SOL" />)

      expect(screen.getByText('USDC/SOL Ratio')).toBeInTheDocument()
      expect(screen.getByText('0.009950')).toBeInTheDocument() // 1.00 / 100.50
      expect(screen.getByText('1 USDC = 0.009950 SOL')).toBeInTheDocument()
      expect(screen.getByText('1 SOL = 100.500000 USDC')).toBeInTheDocument()
    })

    it('disables realtime when enableRealtime is false', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: mockComparisonPriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceComparison tokenA="SOL" tokenB="USDC" enableRealtime={false} />)

      expect(mockUseMultipleTokenPrices).toHaveBeenCalledWith(['SOL', 'USDC'], false)
    })
  })

  describe('Edge Cases', () => {
    it('handles very small price ratios', () => {
      const priceData = {
        BTC: { price: 50000.00, source: 'pyth', confidence: 0.95, timestamp: new Date() },
        SOL: { price: 100.50, source: 'pyth', confidence: 0.95, timestamp: new Date() }
      }

      mockUseMultipleTokenPrices.mockReturnValue({
        priceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceComparison tokenA="SOL" tokenB="BTC" />)

      expect(screen.getByText('0.002010')).toBeInTheDocument() // 100.50 / 50000
    })

    it('handles very large price ratios', () => {
      const priceData = {
        SOL: { price: 100.50, source: 'pyth', confidence: 0.95, timestamp: new Date() },
        MICRO: { price: 0.000001, source: 'pyth', confidence: 0.95, timestamp: new Date() }
      }

      mockUseMultipleTokenPrices.mockReturnValue({
        priceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceComparison tokenA="SOL" tokenB="MICRO" />)

      expect(screen.getByText('100500000.000000')).toBeInTheDocument() // 100.50 / 0.000001
    })

    it('handles identical token prices', () => {
      const priceData = {
        USDC: { price: 1.00, source: 'switchboard', confidence: 0.98, timestamp: new Date() },
        USDT: { price: 1.00, source: 'pyth', confidence: 0.96, timestamp: new Date() }
      }

      mockUseMultipleTokenPrices.mockReturnValue({
        priceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<PriceComparison tokenA="USDC" tokenB="USDT" />)

      expect(screen.getByText('1.000000')).toBeInTheDocument()
      expect(screen.getByText('1 USDC = 1.000000 USDT')).toBeInTheDocument()
      expect(screen.getByText('1 USDT = 1.000000 USDC')).toBeInTheDocument()
    })
  })
})

describe('Integration Tests', () => {
  const mockUseTokenPrice = require('@/hooks/use-oracle-prices').useTokenPrice
  const mockUseMultipleTokenPrices = require('@/hooks/use-oracle-prices').useMultipleTokenPrices

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Error Handling', () => {
    it('gracefully handles hook errors', () => {
      mockUseTokenPrice.mockReturnValue({
        priceData: null,
        loading: false,
        error: 'Hook initialization failed',
        lastUpdate: null
      })

      render(<PriceDisplay symbol="SOL" />)

      expect(screen.getByText('Error loading price')).toBeInTheDocument()
    })

    it('handles partial data failures in multi-price display', () => {
      mockUseMultipleTokenPrices.mockReturnValue({
        priceData: {
          SOL: { price: 100.50, source: 'pyth', confidence: 0.95, timestamp: new Date() }
          // Missing USDC data
        },
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      render(<MultiPriceDisplay symbols={['SOL', 'USDC', 'BTC']} />)

      expect(screen.getByText('SOL')).toBeInTheDocument()
      expect(screen.getByText('$100.50')).toBeInTheDocument()

      const unavailableTexts = screen.getAllByText('Price unavailable')
      expect(unavailableTexts).toHaveLength(2) // USDC and BTC
    })

    it('handles hook throwing exceptions', () => {
      mockUseTokenPrice.mockImplementation(() => {
        throw new Error('Hook error')
      })

      // Should not crash the component
      expect(() => render(<PriceDisplay symbol="SOL" />)).toThrow()
    })
  })

  describe('Performance Considerations', () => {
    it('does not re-render unnecessarily when price data is the same', () => {
      const stablePriceData = {
        symbol: 'SOL',
        price: 100.50,
        source: 'pyth' as const,
        confidence: 0.95,
        timestamp: new Date('2023-12-01T10:00:00Z')
      }
      mockUseTokenPrice.mockReturnValue({
        priceData: stablePriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      const { rerender } = render(<PriceDisplay symbol="SOL" />)

      expect(screen.getByText('$100.50')).toBeInTheDocument()

      // Simulate same data returned
      mockUseTokenPrice.mockReturnValue({
        priceData: stablePriceData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      })

      rerender(<PriceDisplay symbol="SOL" />)

      expect(screen.getByText('$100.50')).toBeInTheDocument()
    })
  })
})