import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ArbitrageOpportunityCard } from '@/components/arbitrage/arbitrage-opportunity-card'
import type { ArbitrageOpportunity } from '@/lib/dlmm/arbitrage'
import { PublicKey } from '@solana/web3.js'

// Mock utilities
jest.mock('@/lib/utils/format', () => ({
  formatCurrency: jest.fn((value) => `$${value.toFixed(2)}`),
  formatPercentage: jest.fn((value) => `${(value * 100).toFixed(1)}%`)
}))

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div data-testid="card-content" className={className}>{children}</div>
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className, ...props }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  )
}))

describe('ArbitrageOpportunityCard', () => {
  const mockOnExecute = jest.fn()
  const mockOnAnalyze = jest.fn()

  const createMockOpportunity = (overrides: Partial<ArbitrageOpportunity> = {}): ArbitrageOpportunity => ({
    id: 'opp-123',
    type: 'direct',
    pools: [
      {
        poolAddress: new PublicKey('11111111111111111111111111111111'),
        tokenX: { symbol: 'SOL', name: 'Solana', decimals: 9, address: new PublicKey('So11111111111111111111111111111111111111112'), price: 150 },
        tokenY: { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), price: 1 },
        activeBin: {
          binId: 12345,
          price: 150,
          liquidityX: '1000000',
          liquidityY: '150000000'
        },
        liquidity: 150000,
        volume24h: 500000,
        fees: 0.0025,
        slippage: 0.001,
        lastUpdated: new Date()
      }
    ],
    profitability: {
      grossProfit: 25.50,
      gasCosts: 0.05,
      priorityFees: 0.02,
      netProfit: 25.43,
      profitMargin: 0.025,
      breakevenAmount: 1000,
      maxProfitableAmount: 10000,
      returnOnInvestment: 0.025
    },
    path: {
      inputToken: { symbol: 'SOL', name: 'Solana', decimals: 9, address: new PublicKey('So11111111111111111111111111111111111111112'), price: 150 },
      outputToken: { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), price: 1 },
      route: [
        {
          poolAddress: new PublicKey('11111111111111111111111111111111'),
          amountIn: 1000,
          amountOut: 150000,
          binRange: { min: 0, max: 10 },
          tokenIn: { symbol: 'SOL', name: 'Solana', decimals: 9, address: new PublicKey('So11111111111111111111111111111111111111112'), price: 150 },
          tokenOut: { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), price: 1 },
          priceImpact: 0.001
        }
      ],
      totalDistance: 1,
      complexity: 'simple',
      estimatedGas: 50000,
      priceImpact: 0.002
    },
    risk: {
      overallRisk: 'low',
      liquidityRisk: 0.1,
      slippageRisk: 0.05,
      mevRisk: 0.02,
      temporalRisk: 0.03,
      competitionRisk: 0.04,
      riskFactors: ['Low liquidity in secondary pool']
    },
    executionPlan: [
      {
        stepNumber: 1,
        action: 'swap',
        pool: new PublicKey('11111111111111111111111111111111'),
        tokenIn: { symbol: 'SOL', name: 'Solana', decimals: 9, address: new PublicKey('So11111111111111111111111111111111111111112'), price: 150 },
        tokenOut: { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), price: 1 },
        amount: 1000,
        expectedOutput: 150000,
        maxSlippage: 0.001,
        timeoutMs: 30000,
        dependencies: []
      }
    ],
    confidence: 0.85,
    mev: {
      strategy: 'private_mempool' as const,
      jitterMs: 8500,
      maxFrontrunProtection: 0.1,
      privateMempoolUsed: true,
      bundlingRequired: false
    },
    timestamp: new Date('2023-12-01T10:00:00Z').getTime(),
    ...overrides
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders the opportunity card with basic information', () => {
      const opportunity = createMockOpportunity()
      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('Direct Arbitrage')).toBeInTheDocument()
      expect(screen.getByText('SOL → USDC')).toBeInTheDocument()
      expect(screen.getByText('$25.43')).toBeInTheDocument() // Net profit
      expect(screen.getByText('85.0%')).toBeInTheDocument() // Confidence
    })

    it('displays opportunity type icon correctly', () => {
      const directOpportunity = createMockOpportunity({ type: 'direct' })
      const { rerender } = render(
        <ArbitrageOpportunityCard
          opportunity={directOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('Direct Arbitrage')).toBeInTheDocument()

      const triangularOpportunity = createMockOpportunity({ type: 'triangular' })
      rerender(
        <ArbitrageOpportunityCard
          opportunity={triangularOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('Triangular Arbitrage')).toBeInTheDocument()
    })

    it('shows complexity and risk badges', () => {
      const opportunity = createMockOpportunity()
      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('simple')).toBeInTheDocument()
      expect(screen.getByText('low risk')).toBeInTheDocument()
    })
  })

  describe('Profitability Display', () => {
    it('displays net profit prominently', () => {
      const opportunity = createMockOpportunity({
        profitability: {
          ...createMockOpportunity().profitability,
          netProfit: 45.67
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('$45.67')).toBeInTheDocument()
      expect(screen.getByText('Net Profit')).toBeInTheDocument()
    })

    it('displays profit margin', () => {
      const opportunity = createMockOpportunity({
        profitability: {
          ...createMockOpportunity().profitability,
          profitMargin: 0.035
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('3.5% margin')).toBeInTheDocument()
    })

    it('highlights high profit opportunities with ring styling', () => {
      const highProfitOpportunity = createMockOpportunity({
        profitability: {
          ...createMockOpportunity().profitability,
          netProfit: 75.00
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={highProfitOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const card = screen.getByTestId('card')
      expect(card).toHaveClass('ring-1', 'ring-green-500/20')
    })
  })

  describe('Risk Assessment Display', () => {
    it('displays risk level with appropriate colors', () => {
      const highRiskOpportunity = createMockOpportunity({
        risk: {
          ...createMockOpportunity().risk,
          overallRisk: 'high'
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={highRiskOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const riskBadge = screen.getByText('high risk')
      expect(riskBadge).toHaveClass('bg-orange-100', 'text-orange-800')
    })

    it('shows confidence indicator with appropriate icon', () => {
      const highConfidenceOpportunity = createMockOpportunity({
        confidence: 0.9
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={highConfidenceOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('90.0%')).toBeInTheDocument()
      expect(screen.getByText('Confidence')).toBeInTheDocument()
    })

    it('shows low confidence warning', () => {
      const lowConfidenceOpportunity = createMockOpportunity({
        confidence: 0.6
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={lowConfidenceOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('60.0%')).toBeInTheDocument()
    })
  })

  describe('Execution Path Information', () => {
    it('displays execution steps and complexity', () => {
      const opportunity = createMockOpportunity({
        path: {
          ...createMockOpportunity().path,
          totalDistance: 3,
          complexity: 'moderate'
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('Steps')).toBeInTheDocument()
      expect(screen.getByText('moderate')).toBeInTheDocument()
    })

    it('shows estimated execution time with MEV protection', () => {
      const opportunity = createMockOpportunity({
        mev: {
          strategy: 'flashbots' as const,
          jitterMs: 12500,
          maxFrontrunProtection: 0.2,
          privateMempoolUsed: false,
          bundlingRequired: true
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('12.5s')).toBeInTheDocument()
      expect(screen.getByText('Est. Time')).toBeInTheDocument()
      expect(screen.getByText('MEV Protected')).toBeInTheDocument()
    })

    it('displays route information for multi-hop opportunities', () => {
      const multiHopOpportunity = createMockOpportunity({
        path: {
          inputToken: { symbol: 'SOL', name: 'Solana', decimals: 9, address: new PublicKey('So11111111111111111111111111111111111111112'), price: 150 },
          outputToken: { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), price: 1 },
          route: [
            {
              poolAddress: new PublicKey('11111111111111111111111111111111'),
          amountIn: 1000,
          amountOut: 150000,
          binRange: { min: 0, max: 10 },
              tokenIn: { symbol: 'SOL', name: 'Solana', decimals: 9, address: new PublicKey('So11111111111111111111111111111111111111112'), price: 150 },
              tokenOut: { symbol: 'USDT', name: 'Tether', decimals: 6, address: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'), price: 1 },
              priceImpact: 0.001
            },
            {
              poolAddress: new PublicKey('22222222222222222222222222222222'),
          amountIn: 150000,
          amountOut: 149850,
          binRange: { min: 0, max: 10 },
              tokenIn: { symbol: 'USDT', name: 'Tether', decimals: 6, address: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'), price: 1 },
              tokenOut: { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), price: 1 },
              priceImpact: 0.0005
            }
          ],
          totalDistance: 2,
          complexity: 'moderate',
          estimatedGas: 85000,
          priceImpact: 0.0015
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={multiHopOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('SOL → USDC via 0 pools')).toBeInTheDocument()
    })
  })

  describe('Expandable Details', () => {
    it('expands and collapses details when chevron is clicked', async () => {
      const user = userEvent.setup()
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      // Initially collapsed
      expect(screen.queryByText('Execution Route')).not.toBeInTheDocument()

      const expandButton = screen.getByRole('button', { name: '' }) // Chevron button
      await user.click(expandButton)

      // Should be expanded
      expect(screen.getByText('Execution Route')).toBeInTheDocument()
      expect(screen.getByText('Risk Analysis')).toBeInTheDocument()
      expect(screen.getByText('Profitability Breakdown')).toBeInTheDocument()
      expect(screen.getByText('Pool Information')).toBeInTheDocument()
    })

    it('displays detailed route information when expanded', async () => {
      const user = userEvent.setup()
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const expandButton = screen.getByRole('button', { name: '' })
      await user.click(expandButton)

      expect(screen.getByText('Route:')).toBeInTheDocument()
      expect(screen.getByText('Total price impact:')).toBeInTheDocument()
    })

    it('shows detailed risk breakdown when expanded', async () => {
      const user = userEvent.setup()
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const expandButton = screen.getByRole('button', { name: '' })
      await user.click(expandButton)

      expect(screen.getByText('10.0%')).toBeInTheDocument() // Liquidity risk
      expect(screen.getByText('Liquidity')).toBeInTheDocument()
      expect(screen.getByText('5.0%')).toBeInTheDocument() // Slippage risk
      expect(screen.getByText('Slippage')).toBeInTheDocument()
      expect(screen.getByText('2.0%')).toBeInTheDocument() // MEV risk
    })

    it('displays profitability breakdown when expanded', async () => {
      const user = userEvent.setup()
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const expandButton = screen.getByRole('button', { name: '' })
      await user.click(expandButton)

      expect(screen.getByText('$25.50')).toBeInTheDocument() // Gross profit
      expect(screen.getByText('Gross Profit')).toBeInTheDocument()
      expect(screen.getByText('-$0.05')).toBeInTheDocument() // Gas costs
      expect(screen.getByText('Gas Costs')).toBeInTheDocument()
      expect(screen.getByText('-$0.02')).toBeInTheDocument() // Priority fees
      expect(screen.getByText('Priority Fees')).toBeInTheDocument()
    })

    it('shows profitable range when expanded', async () => {
      const user = userEvent.setup()
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const expandButton = screen.getByRole('button', { name: '' })
      await user.click(expandButton)

      expect(screen.getByText(/Profitable range:/)).toBeInTheDocument()
      expect(screen.getByText(/\$1000\.00 - \$10000\.00/)).toBeInTheDocument()
    })

    it('displays pool information when expanded', async () => {
      const user = userEvent.setup()
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const expandButton = screen.getByRole('button', { name: '' })
      await user.click(expandButton)

      expect(screen.getByText('Pool Information')).toBeInTheDocument()
      expect(screen.getByText('SOL/USDC')).toBeInTheDocument()
      expect(screen.getByText(/11111111\.\.\./)).toBeInTheDocument() // Pool address truncated
      expect(screen.getByText('$150000.00 liquidity')).toBeInTheDocument()
    })

    it('shows risk factors when present', async () => {
      const user = userEvent.setup()
      const opportunity = createMockOpportunity({
        risk: {
          ...createMockOpportunity().risk,
          riskFactors: ['Low liquidity', 'High volatility', 'MEV competition']
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const expandButton = screen.getByRole('button', { name: '' })
      await user.click(expandButton)

      expect(screen.getByText('Risk Factors:')).toBeInTheDocument()
      expect(screen.getByText('Low liquidity')).toBeInTheDocument()
      expect(screen.getByText('High volatility')).toBeInTheDocument()
      expect(screen.getByText('MEV competition')).toBeInTheDocument()
    })
  })

  describe('Action Button Functionality', () => {
    it('calls onExecute when execute button is clicked', async () => {
      const user = userEvent.setup()
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const executeButton = screen.getByText('Execute Arbitrage')
      await user.click(executeButton)

      expect(mockOnExecute).toHaveBeenCalledWith(2000) // breakevenAmount * 2
    })

    it('calls onAnalyze when analyze button is clicked', async () => {
      const user = userEvent.setup()
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const analyzeButton = screen.getByText('Analyze')
      await user.click(analyzeButton)

      expect(mockOnAnalyze).toHaveBeenCalled()
    })

    it('disables execute button for high risk opportunities', () => {
      const highRiskOpportunity = createMockOpportunity({
        risk: {
          ...createMockOpportunity().risk,
          overallRisk: 'high'
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={highRiskOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const executeButton = screen.getByText('Execute Arbitrage')
      expect(executeButton).toBeDisabled()
    })

    it('disables execute button for critical risk opportunities', () => {
      const criticalRiskOpportunity = createMockOpportunity({
        risk: {
          ...createMockOpportunity().risk,
          overallRisk: 'critical'
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={criticalRiskOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const executeButton = screen.getByText('Execute Arbitrage')
      expect(executeButton).toBeDisabled()
    })
  })

  describe('Risk Warning Display', () => {
    it('shows warning for high risk opportunities', () => {
      const highRiskOpportunity = createMockOpportunity({
        risk: {
          ...createMockOpportunity().risk,
          overallRisk: 'high'
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={highRiskOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('High risk opportunity. Consider the risk factors before execution.')).toBeInTheDocument()
    })

    it('shows warning for critical risk opportunities', () => {
      const criticalRiskOpportunity = createMockOpportunity({
        risk: {
          ...createMockOpportunity().risk,
          overallRisk: 'critical'
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={criticalRiskOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('High risk opportunity. Consider the risk factors before execution.')).toBeInTheDocument()
    })

    it('does not show warning for low risk opportunities', () => {
      const lowRiskOpportunity = createMockOpportunity({
        risk: {
          ...createMockOpportunity().risk,
          overallRisk: 'low'
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={lowRiskOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.queryByText('High risk opportunity. Consider the risk factors before execution.')).not.toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive grid classes for metrics', () => {
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const metricsGrid = screen.getByTestId('card-content').querySelector('.grid')
      expect(metricsGrid).toHaveClass('grid-cols-2', 'md:grid-cols-4')
    })
  })

  describe('Different Opportunity Types', () => {
    it('handles triangular arbitrage display', () => {
      const triangularOpportunity = createMockOpportunity({
        type: 'triangular',
        path: {
          ...createMockOpportunity().path,
          complexity: 'complex'
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={triangularOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('Triangular Arbitrage')).toBeInTheDocument()
      expect(screen.getByText('complex')).toBeInTheDocument()
    })

    it('handles multi-hop arbitrage display', () => {
      const multiHopOpportunity = createMockOpportunity({
        type: 'multi_hop',
        path: {
          ...createMockOpportunity().path,
          totalDistance: 4,
          complexity: 'complex'
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={multiHopOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('Multi hop Arbitrage')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument() // Steps
    })
  })

  describe('Edge Cases', () => {
    it('handles zero profit opportunities', () => {
      const zeroProfitOpportunity = createMockOpportunity({
        profitability: {
          ...createMockOpportunity().profitability,
          netProfit: 0,
          profitMargin: 0
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={zeroProfitOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      expect(screen.getByText('$0.00')).toBeInTheDocument()
      expect(screen.getByText('0.0% margin')).toBeInTheDocument()
    })

    it('handles opportunities with no risk factors', async () => {
      const user = userEvent.setup()
      const noRiskFactorsOpportunity = createMockOpportunity({
        risk: {
          ...createMockOpportunity().risk,
          riskFactors: []
        }
      })

      render(
        <ArbitrageOpportunityCard
          opportunity={noRiskFactorsOpportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const expandButton = screen.getByRole('button', { name: '' })
      await user.click(expandButton)

      expect(screen.queryByText('Risk Factors:')).not.toBeInTheDocument()
    })

    it('handles single step routes', async () => {
      const user = userEvent.setup()
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageOpportunityCard
          opportunity={opportunity}
          onExecute={mockOnExecute}
          onAnalyze={mockOnAnalyze}
        />
      )

      const expandButton = screen.getByRole('button', { name: '' })
      await user.click(expandButton)

      // Should show the single route step
      expect(screen.getByText('SOL')).toBeInTheDocument()
    })
  })
})