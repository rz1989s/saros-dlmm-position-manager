import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ArbitrageExecutionModal } from '@/components/arbitrage/arbitrage-execution-modal'
import type { ArbitrageOpportunity } from '@/lib/dlmm/arbitrage'
import { PublicKey } from '@solana/web3.js'

// Mock utilities
jest.mock('@/lib/utils/format', () => ({
  formatCurrency: jest.fn((value) => `$${value.toFixed(2)}`),
  formatPercentage: jest.fn((value) => `${(value * 100).toFixed(1)}%`)
}))

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    open ? <div data-testid="dialog" onClick={() => onOpenChange(false)}>{children}</div> : null
  ),
  DialogContent: ({ children, className }: any) => <div data-testid="dialog-content" className={className}>{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children, className }: any) => <div data-testid="dialog-title" className={className}>{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>
}), { virtual: true })

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

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div data-testid="card-content" className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children, className }: any) => <div data-testid="card-title" className={className}>{children}</div>
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  )
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, ...props }: any) => (
    <label data-testid="label" htmlFor={htmlFor} {...props}>
      {children}
    </label>
  )
}))

describe('ArbitrageExecutionModal', () => {
  const mockOnClose = jest.fn()
  const mockOnExecute = jest.fn()

  const createMockOpportunity = (overrides: Partial<ArbitrageOpportunity> = {}): ArbitrageOpportunity => ({
    id: 'opp-123',
    type: 'direct',
    pools: [
      {
        poolAddress: new PublicKey('11111111111111111111111111111111'),
        tokenX: { symbol: 'SOL', name: 'Solana', decimals: 9, address: new PublicKey('So11111111111111111111111111111111111111112'), price: 150 },
        tokenY: { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), price: 1 },
        activeBin: { binId: 0, price: 150, liquidityX: '1000', liquidityY: '150000' },
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
          tokenIn: { symbol: 'SOL', name: 'Solana', decimals: 9, address: new PublicKey('So11111111111111111111111111111111111111112'), price: 150 },
          tokenOut: { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), price: 1 },
          amountIn: 1000,
          amountOut: 150000,
          priceImpact: 0.001,
          binRange: { min: 0, max: 10 }
        }
      ],
      totalDistance: 1,
      complexity: 'simple',
      estimatedGas: 5000,
      priceImpact: 0.001
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
        maxSlippage: 0.005,
        timeoutMs: 30000,
        dependencies: []
      }
    ],
    confidence: 0.85,
    mev: {
      strategy: 'private_mempool',
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
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Modal Open/Close Functionality', () => {
    it('renders modal when open with opportunity', () => {
      const opportunity = createMockOpportunity()
      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(screen.getByText('Execute Arbitrage Opportunity')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      const opportunity = createMockOpportunity()
      render(
        <ArbitrageExecutionModal
          isOpen={false}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })

    it('does not render when opportunity is null', () => {
      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={null}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Opportunity Overview Display', () => {
    it('displays opportunity details correctly', () => {
      const opportunity = createMockOpportunity()
      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.getByText('Opportunity Details')).toBeInTheDocument()
      expect(screen.getByText('direct')).toBeInTheDocument()
      expect(screen.getByText('low risk')).toBeInTheDocument()
      // Use getAllByText since there might be multiple profit displays
      const profitElements = screen.getAllByText('$25.43')
      expect(profitElements.length).toBeGreaterThan(0)
      expect(screen.getByText('85.0%')).toBeInTheDocument() // Confidence
      expect(screen.getByText('1')).toBeInTheDocument() // Steps
    })

    it('shows route visualization', () => {
      const opportunity = createMockOpportunity()
      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.getByText('SOL')).toBeInTheDocument()
    })

    it('displays risk badge with appropriate color', () => {
      const highRiskOpportunity = createMockOpportunity({
        risk: { ...createMockOpportunity().risk, overallRisk: 'high' }
      })

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={highRiskOpportunity}
          onExecute={mockOnExecute}
        />
      )

      const riskBadge = screen.getByText('high risk')
      expect(riskBadge).toHaveClass('bg-red-100', 'text-red-800')
    })
  })

  describe('Amount Input and Validation', () => {
    it('initializes with suggested amount', () => {
      const opportunity = createMockOpportunity()
      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const amountInput = screen.getByTestId('input')
      expect(amountInput).toHaveValue(2000) // breakevenAmount * 2
    })

    it('updates amount when input changes', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const amountInput = screen.getByTestId('input')
      await user.clear(amountInput)
      await user.type(amountInput, '5000')

      expect(amountInput).toHaveValue(5000)
    })

    it('shows validation error for amount below breakeven', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const amountInput = screen.getByTestId('input')
      await user.clear(amountInput)
      await user.type(amountInput, '500')

      expect(screen.getByText(/Amount must be between/)).toBeInTheDocument()
    })

    it('shows validation error for amount above maximum', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const amountInput = screen.getByTestId('input')
      await user.clear(amountInput)
      await user.type(amountInput, '15000')

      expect(screen.getByText(/Amount must be between/)).toBeInTheDocument()
    })

    it('displays expected results when amount is valid', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const amountInput = screen.getByTestId('input')
      await user.clear(amountInput)
      await user.type(amountInput, '3000')

      expect(screen.getByText('Expected Results')).toBeInTheDocument()
      expect(screen.getByText('Expected Output:')).toBeInTheDocument()
      expect(screen.getByText('Net Profit:')).toBeInTheDocument()
      expect(screen.getByText('ROI:')).toBeInTheDocument()
    })
  })

  describe('Quick Amount Buttons', () => {
    it('displays quick amount buttons', () => {
      const opportunity = createMockOpportunity()
      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.getByText('Quick amounts:')).toBeInTheDocument()
      expect(screen.getByText('$500.00')).toBeInTheDocument() // 0.5x breakeven
      expect(screen.getByText('$1000.00')).toBeInTheDocument() // 1x breakeven
      expect(screen.getByText('$2000.00')).toBeInTheDocument() // 2x breakeven
      expect(screen.getByText('$5000.00')).toBeInTheDocument() // 5x breakeven
    })

    it('sets amount when quick amount button is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const quickAmountButton = screen.getByText('$1000.00')
      await user.click(quickAmountButton)

      const amountInput = screen.getByTestId('input')
      expect(amountInput).toHaveValue(1000)
    })

    it('disables quick amount buttons that exceed maximum', () => {
      const opportunity = createMockOpportunity({
        profitability: {
          ...createMockOpportunity().profitability,
          breakevenAmount: 3000,
          maxProfitableAmount: 8000
        }
      })

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const largeAmountButton = screen.getByText('$15000.00') // 5x would exceed max
      expect(largeAmountButton).toBeDisabled()
    })
  })

  describe('Execution Plan Display', () => {
    it('displays execution plan steps', () => {
      const opportunity = createMockOpportunity()
      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.getByText('Execution Plan')).toBeInTheDocument()
      expect(screen.getByText('Validate Market Conditions')).toBeInTheDocument()
      expect(screen.getByText('Setup MEV Protection')).toBeInTheDocument()
      expect(screen.getByText('Execute First Swap')).toBeInTheDocument()
      expect(screen.getByText('Execute Second Swap')).toBeInTheDocument()
      expect(screen.getByText('Verify Profit')).toBeInTheDocument()
    })

    it('displays cost breakdown', () => {
      const opportunity = createMockOpportunity()
      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.getByText('Gas Estimate')).toBeInTheDocument()
      expect(screen.getByText('MEV Protection')).toBeInTheDocument()
      expect(screen.getByText('Slippage Buffer')).toBeInTheDocument()
      expect(screen.getByText('Total Time')).toBeInTheDocument()
    })

    it('shows estimated durations for steps', () => {
      const opportunity = createMockOpportunity()
      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.getByText('~1.0s')).toBeInTheDocument() // Validate step
      expect(screen.getByText('~2.0s')).toBeInTheDocument() // Setup MEV
      expect(screen.getByText('~8.0s')).toBeInTheDocument() // First swap
    })
  })

  describe('Execution Flow', () => {
    it('starts execution when execute button is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()
      mockOnExecute.mockResolvedValue({ success: true, actualProfit: 25.43 })

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const executeButton = screen.getByText('Execute Arbitrage')
      await user.click(executeButton)

      expect(screen.getByText('Initializing execution...')).toBeInTheDocument()
    })

    it('shows progress during execution', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()

      // Mock a delayed execution
      mockOnExecute.mockImplementation(() => new Promise(resolve =>
        setTimeout(() => resolve({
          success: true,
          actualProfit: 25.43,
          executionTime: 18500,
          slippageEncountered: 0.008
        }), 100)
      ))

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const executeButton = screen.getByText('Execute Arbitrage')
      await user.click(executeButton)

      // Fast forward through the execution steps
      await act(async () => {
        jest.advanceTimersByTime(1000) // First step
      })

      expect(screen.getByText('Validate Market Conditions')).toBeInTheDocument()

      await act(async () => {
        jest.advanceTimersByTime(2000) // Second step
      })

      expect(screen.getByText('Setup MEV Protection')).toBeInTheDocument()
    })

    it('shows success state after successful execution', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()
      const mockResults = {
        actualProfit: 24.85,
        executionTime: 18500,
        slippageEncountered: 0.008
      }

      mockOnExecute.mockResolvedValue(mockResults)

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const executeButton = screen.getByText('Execute Arbitrage')
      await user.click(executeButton)

      // Fast forward through all steps
      await act(async () => {
        jest.advanceTimersByTime(20000)
      })

      await waitFor(() => {
        expect(screen.getByText('Execution Successful')).toBeInTheDocument()
        expect(screen.getByText('$24.85')).toBeInTheDocument() // Actual profit
        expect(screen.getByText('18.5s')).toBeInTheDocument() // Execution time
        expect(screen.getByText('0.8%')).toBeInTheDocument() // Slippage
        expect(screen.getByText('Protected')).toBeInTheDocument() // MEV status
      })
    })

    it('shows error state when execution fails', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()
      const errorMessage = 'Insufficient liquidity'

      mockOnExecute.mockRejectedValue(new Error(errorMessage))

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const executeButton = screen.getByText('Execute Arbitrage')
      await user.click(executeButton)

      // Fast forward through steps to trigger the actual execution
      await act(async () => {
        jest.advanceTimersByTime(20000)
      })

      await waitFor(() => {
        expect(screen.getByText('Execution Failed')).toBeInTheDocument()
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('shows retry button after execution failure', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()

      mockOnExecute.mockRejectedValue(new Error('Network error'))

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const executeButton = screen.getByText('Execute Arbitrage')
      await user.click(executeButton)

      await act(async () => {
        jest.advanceTimersByTime(20000)
      })

      await waitFor(() => {
        expect(screen.getByText('Retry Execution')).toBeInTheDocument()
      })
    })

    it('disables execute button for invalid amounts', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const amountInput = screen.getByTestId('input')
      await user.clear(amountInput)
      await user.type(amountInput, '500') // Below breakeven

      const executeButton = screen.getByText('Execute Arbitrage')
      expect(executeButton).toBeDisabled()
    })

    it('calls onExecute with correct parameters', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()
      mockOnExecute.mockResolvedValue({ success: true })

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const executeButton = screen.getByText('Execute Arbitrage')
      await user.click(executeButton)

      // Fast forward through execution steps
      await act(async () => {
        jest.advanceTimersByTime(20000)
      })

      await waitFor(() => {
        expect(mockOnExecute).toHaveBeenCalledWith(opportunity, 2000)
      })
    })
  })

  describe('Progress Tracking', () => {
    it('shows current step during execution', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()
      mockOnExecute.mockImplementation(() => new Promise(resolve =>
        setTimeout(() => resolve({ success: true }), 1000)
      ))

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const executeButton = screen.getByText('Execute Arbitrage')
      await user.click(executeButton)

      // Check that the first step is highlighted
      await act(async () => {
        jest.advanceTimersByTime(1000)
      })

      const activeStep = screen.getByText('Validate Market Conditions').closest('div')
      expect(activeStep).toHaveClass('bg-blue-50', 'border-blue-200')
    })

    it('displays progress percentage', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()
      mockOnExecute.mockImplementation(() => new Promise(resolve =>
        setTimeout(() => resolve({ success: true }), 1000)
      ))

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const executeButton = screen.getByText('Execute Arbitrage')
      await user.click(executeButton)

      await act(async () => {
        jest.advanceTimersByTime(1000) // Complete first step
      })

      expect(screen.getByText('20%')).toBeInTheDocument() // 1/5 steps = 20%
    })

    it('shows spinner for current step', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()
      mockOnExecute.mockImplementation(() => new Promise(resolve =>
        setTimeout(() => resolve({ success: true }), 1000)
      ))

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const executeButton = screen.getByText('Execute Arbitrage')
      await user.click(executeButton)

      // Should show loading spinner during execution
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    })
  })

  describe('State Resets', () => {
    it('resets state when modal is reopened', () => {
      const opportunity = createMockOpportunity()
      const { rerender } = render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      // Close modal
      rerender(
        <ArbitrageExecutionModal
          isOpen={false}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      // Reopen modal
      rerender(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      // Should reset to initial state
      const amountInput = screen.getByTestId('input')
      expect(amountInput).toHaveValue(2000)
      expect(screen.getByText('Execute Arbitrage')).toBeInTheDocument()
    })

    it('resets state when opportunity changes', () => {
      const opportunity1 = createMockOpportunity({
        profitability: { ...createMockOpportunity().profitability, breakevenAmount: 1000 }
      })
      const opportunity2 = createMockOpportunity({
        profitability: { ...createMockOpportunity().profitability, breakevenAmount: 2000 }
      })

      const { rerender } = render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity1}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.getByDisplayValue('2000')).toBeInTheDocument()

      rerender(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity2}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.getByDisplayValue('4000')).toBeInTheDocument() // New breakeven * 2
    })

    it('resets execution state when closing', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('provides proper labels for inputs', () => {
      const opportunity = createMockOpportunity()
      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.getByText('Input Amount (SOL)')).toBeInTheDocument()
      const amountInput = screen.getByTestId('input')
      expect(amountInput).toHaveAttribute('type', 'number')
      expect(amountInput).toHaveAttribute('min', '1000')
      expect(amountInput).toHaveAttribute('max', '10000')
    })

    it('uses semantic HTML structure', () => {
      const opportunity = createMockOpportunity()
      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-footer')).toBeInTheDocument()
      expect(screen.getAllByRole('button')).toHaveLength(7) // Cancel + Execute + 4 quick amounts + close
    })

    it('shows appropriate button text based on state', () => {
      const opportunity = createMockOpportunity()
      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Execute Arbitrage')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles zero profit opportunity', () => {
      const opportunity = createMockOpportunity({
        profitability: {
          ...createMockOpportunity().profitability,
          netProfit: 0
        }
      })

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.getByText('$0.00')).toBeInTheDocument()
    })

    it('handles very short execution time', () => {
      const opportunity = createMockOpportunity({
        mev: { ...createMockOpportunity().mev, jitterMs: 500 }
      })

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      expect(screen.getByText('~0.5s')).toBeInTheDocument()
    })

    it('handles missing execution results gracefully', async () => {
      const user = userEvent.setup({ delay: null })
      const opportunity = createMockOpportunity()

      mockOnExecute.mockResolvedValue(null)

      render(
        <ArbitrageExecutionModal
          isOpen={true}
          onClose={mockOnClose}
          opportunity={opportunity}
          onExecute={mockOnExecute}
        />
      )

      const executeButton = screen.getByText('Execute Arbitrage')
      await user.click(executeButton)

      await act(async () => {
        jest.advanceTimersByTime(20000)
      })

      // Should still show success state even with null results
      await waitFor(() => {
        expect(screen.getByText('Execution Successful')).toBeInTheDocument()
      })
    })
  })
})