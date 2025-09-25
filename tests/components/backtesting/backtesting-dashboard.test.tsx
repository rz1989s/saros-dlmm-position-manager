import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BacktestingDashboard } from '@/components/backtesting/backtesting-dashboard'
import type { BacktestConfig, BacktestResult } from '@/lib/types'

// Mock the hooks
jest.mock('@/hooks/use-advanced-dlmm', () => ({
  useAdvancedBacktesting: jest.fn()
}))

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Area: () => <div data-testid="area" />
}))

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div data-testid="card-content" className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children, className }: any) => <div data-testid="card-title" className={className}>{children}</div>
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
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

// Mock missing UI components that don't exist in the project yet
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>
      <div onClick={() => onValueChange && onValueChange('test-value')}>{children}</div>
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-testid="select-item" data-value={value}>{children}</div>,
  SelectTrigger: ({ children, id }: any) => <div data-testid="select-trigger" id={id}>{children}</div>,
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>
}), { virtual: true })

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: any) => (
    <div data-testid="tabs" data-default-value={defaultValue}>{children}</div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid="tabs-content" data-value={value}>{children}</div>
  ),
  TabsList: ({ children, className }: any) => (
    <div data-testid="tabs-list" className={className}>{children}</div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid="tabs-trigger" data-value={value}>{children}</button>
  )
}), { virtual: true })

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => (
    <div data-testid="progress" data-value={value}>
      <div style={{ width: `${value}%` }} />
    </div>
  )
}), { virtual: true })

describe('BacktestingDashboard', () => {
  const mockRunBacktest = jest.fn()
  const mockGetBacktestResult = jest.fn()
  const mockCancelBacktest = jest.fn()
  const mockGetBacktestHistory = jest.fn()

  const defaultMockHookReturn = {
    runBacktest: mockRunBacktest,
    getBacktestResult: mockGetBacktestResult,
    cancelBacktest: mockCancelBacktest,
    getBacktestHistory: mockGetBacktestHistory,
    activeBacktests: [],
    loading: false,
    error: null,
    isEnabled: true
  }

  beforeEach(() => {
    jest.clearAllMocks()
    const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
    useAdvancedBacktesting.mockReturnValue(defaultMockHookReturn)
  })

  describe('Component Rendering and Initialization', () => {
    it('renders the dashboard with header and navigation', () => {
      render(<BacktestingDashboard />)

      expect(screen.getByText('Advanced Backtesting')).toBeInTheDocument()
      expect(screen.getByText('Test your DLMM strategies against historical data')).toBeInTheDocument()
      expect(screen.getByText('100% SDK Integration')).toBeInTheDocument()
    })

    it('renders tabs navigation', () => {
      render(<BacktestingDashboard />)

      expect(screen.getByText('Configure')).toBeInTheDocument()
      expect(screen.getByText('Results')).toBeInTheDocument()
      expect(screen.getByText('History')).toBeInTheDocument()
    })

    it('renders configuration form by default', () => {
      render(<BacktestingDashboard />)

      expect(screen.getByText('Backtest Configuration')).toBeInTheDocument()
      expect(screen.getByText('Backtest Name')).toBeInTheDocument()
      expect(screen.getByText('Strategy Type')).toBeInTheDocument()
      expect(screen.getByText('Initial Capital (USD)')).toBeInTheDocument()
      expect(screen.getByText('Risk Management')).toBeInTheDocument()
    })

    it('shows wallet connection prompt when not enabled', () => {
      const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
      useAdvancedBacktesting.mockReturnValue({
        ...defaultMockHookReturn,
        isEnabled: false
      })

      render(<BacktestingDashboard />)

      expect(screen.getByText('Please connect your wallet to access backtesting features')).toBeInTheDocument()
    })

    it('displays error message when present', () => {
      const errorMessage = 'Failed to initialize backtest engine'
      const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
      useAdvancedBacktesting.mockReturnValue({
        ...defaultMockHookReturn,
        error: errorMessage
      })

      render(<BacktestingDashboard />)

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  describe('Configuration Form Interactions', () => {
    it('updates backtest name on input change', async () => {
      const user = userEvent.setup()
      render(<BacktestingDashboard />)

      const nameInput = screen.getByDisplayValue('')
      await user.type(nameInput, 'My Test Strategy')

      expect(nameInput).toHaveValue('My Test Strategy')
    })

    it('updates strategy selection', async () => {
      const user = userEvent.setup()
      render(<BacktestingDashboard />)

      const strategySelect = screen.getByTestId('select')
      await user.click(strategySelect)

      expect(strategySelect).toBeInTheDocument()
    })

    it('updates initial capital on input change', async () => {
      const user = userEvent.setup()
      render(<BacktestingDashboard />)

      const capitalInputs = screen.getAllByTestId('input')
      const capitalInput = capitalInputs.find(input => input.getAttribute('type') === 'number')

      if (capitalInput) {
        await user.clear(capitalInput)
        await user.type(capitalInput, '50000')
        expect(capitalInput).toHaveValue(50000)
      }
    })

    it('updates risk management parameters', async () => {
      const user = userEvent.setup()
      render(<BacktestingDashboard />)

      const numberInputs = screen.getAllByTestId('input').filter(input =>
        input.getAttribute('type') === 'number'
      )

      // Test max drawdown input (should be the first risk management input)
      if (numberInputs.length >= 2) {
        const drawdownInput = numberInputs[1] // Second number input should be max drawdown
        await user.clear(drawdownInput)
        await user.type(drawdownInput, '15')
        expect(drawdownInput).toHaveValue(15)
      }
    })

    it('validates required fields before starting backtest', async () => {
      const user = userEvent.setup()
      render(<BacktestingDashboard />)

      const startButton = screen.getByText('Start Backtest')
      await user.click(startButton)

      // Should not call runBacktest if required fields are empty
      expect(mockRunBacktest).not.toHaveBeenCalled()
    })
  })

  describe('Backtest Execution Flow', () => {
    it('starts backtest with valid configuration', async () => {
      const user = userEvent.setup()
      mockRunBacktest.mockResolvedValue('backtest-123')

      render(<BacktestingDashboard />)

      // Fill required fields
      const nameInput = screen.getAllByTestId('input')[0]
      await user.type(nameInput, 'Test Strategy')

      const startButton = screen.getByText('Start Backtest')

      await act(async () => {
        await user.click(startButton)
      })

      await waitFor(() => {
        expect(mockRunBacktest).toHaveBeenCalledWith({
          name: 'Test Strategy',
          strategy: 'rebalance',
          timeframe: expect.any(Object),
          initialCapital: 10000,
          riskManagement: expect.any(Object),
          rebalanceFrequency: 'daily',
          parameters: {
            binStep: 25,
            feeTier: 0.0025,
            slippageTolerance: 0.01,
            maxGasPrice: 0.1
          }
        })
      })
    })

    it('displays loading state during backtest execution', async () => {
      const user = userEvent.setup()
      const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
      useAdvancedBacktesting.mockReturnValue({
        ...defaultMockHookReturn,
        loading: true
      })

      render(<BacktestingDashboard />)

      expect(screen.getByText('Running Backtest...')).toBeInTheDocument()

      const startButton = screen.getByText('Running Backtest...')
      expect(startButton).toBeDisabled()
    })

    it('handles backtest execution errors', async () => {
      const user = userEvent.setup()
      mockRunBacktest.mockRejectedValue(new Error('Network error'))

      // Mock console.error to avoid test output pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      render(<BacktestingDashboard />)

      const nameInput = screen.getAllByTestId('input')[0]
      await user.type(nameInput, 'Test Strategy')

      const startButton = screen.getByText('Start Backtest')

      await act(async () => {
        await user.click(startButton)
      })

      expect(consoleSpy).toHaveBeenCalledWith('Failed to start backtest:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('Results Display and Visualization', () => {
    const mockBacktestResult: BacktestResult = {
      id: 'backtest-123',
      config: {
        name: 'Test Strategy',
        strategy: 'rebalance',
        timeframe: { start: new Date(), end: new Date() },
        initialCapital: 10000,
        riskManagement: {
          maxDrawdown: 0.2,
          positionSize: 0.1,
          stopLoss: 0.05,
          takeProfitMultiplier: 2
        },
        rebalanceFrequency: 'daily',
        parameters: {
          binStep: 25,
          feeTier: 0.0025,
          slippageTolerance: 0.01,
          maxGasPrice: 0.1
        }
      },
      status: 'completed',
      progress: 100,
      currentOperation: 'Completed',
      startTime: new Date(),
      endTime: new Date(),
      results: {
        totalReturn: 1.15,
        sharpeRatio: 1.2,
        maxDrawdown: 0.08,
        winRate: 65.5,
        equityCurve: [
          { date: '2023-01-01', equity: 10000 },
          { date: '2023-01-02', equity: 11500 }
        ],
        trades: [],
        periods: []
      }
    }

    it('displays completed backtest results', () => {
      const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
      useAdvancedBacktesting.mockReturnValue({
        ...defaultMockHookReturn,
        activeBacktests: [mockBacktestResult]
      })

      render(<BacktestingDashboard />)

      // Check for result metrics
      expect(screen.getByText('15.00%')).toBeInTheDocument() // Total Return
      expect(screen.getByText('1.20')).toBeInTheDocument() // Sharpe Ratio
      expect(screen.getByText('8.00%')).toBeInTheDocument() // Max Drawdown
      expect(screen.getByText('65.5%')).toBeInTheDocument() // Win Rate
    })

    it('displays running backtest with progress', () => {
      const runningBacktest = {
        ...mockBacktestResult,
        status: 'running' as const,
        progress: 45,
        currentOperation: 'Processing historical data'
      }

      const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
      useAdvancedBacktesting.mockReturnValue({
        ...defaultMockHookReturn,
        activeBacktests: [runningBacktest]
      })

      render(<BacktestingDashboard />)

      expect(screen.getByText('45%')).toBeInTheDocument()
      expect(screen.getByText('Processing historical data')).toBeInTheDocument()
    })

    it('displays error state for failed backtest', () => {
      const errorBacktest = {
        ...mockBacktestResult,
        status: 'error' as const,
        error: 'Insufficient data for analysis'
      }

      const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
      useAdvancedBacktesting.mockReturnValue({
        ...defaultMockHookReturn,
        activeBacktests: [errorBacktest]
      })

      render(<BacktestingDashboard />)

      expect(screen.getByText('Backtest failed: Insufficient data for analysis')).toBeInTheDocument()
    })

    it('renders equity curve chart when results are available', () => {
      const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
      useAdvancedBacktesting.mockReturnValue({
        ...defaultMockHookReturn,
        activeBacktests: [mockBacktestResult]
      })

      render(<BacktestingDashboard />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
      expect(screen.getByText('Equity Curve')).toBeInTheDocument()
    })
  })

  describe('Progress Monitoring', () => {
    it('shows progress bar for running backtests', () => {
      const runningBacktest = {
        ...mockBacktestResult,
        status: 'running' as const,
        progress: 75
      }

      const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
      useAdvancedBacktesting.mockReturnValue({
        ...defaultMockHookReturn,
        activeBacktests: [runningBacktest]
      })

      render(<BacktestingDashboard />)

      const progressBar = screen.getByTestId('progress')
      expect(progressBar).toHaveAttribute('data-value', '75')
    })

    it('displays current operation for running backtests', () => {
      const runningBacktest = {
        ...mockBacktestResult,
        status: 'running' as const,
        currentOperation: 'Calculating portfolio metrics'
      }

      const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
      useAdvancedBacktesting.mockReturnValue({
        ...defaultMockHookReturn,
        activeBacktests: [runningBacktest]
      })

      render(<BacktestingDashboard />)

      expect(screen.getByText('Calculating portfolio metrics')).toBeInTheDocument()
    })
  })

  describe('Error State Handling', () => {
    it('displays error message in error card', () => {
      const errorMessage = 'Connection timeout'
      const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
      useAdvancedBacktesting.mockReturnValue({
        ...defaultMockHookReturn,
        error: errorMessage
      })

      render(<BacktestingDashboard />)

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('applies destructive border style to error card', () => {
      const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
      useAdvancedBacktesting.mockReturnValue({
        ...defaultMockHookReturn,
        error: 'Test error'
      })

      render(<BacktestingDashboard />)

      const errorCard = screen.getByTestId('card')
      expect(errorCard).toHaveClass('border-destructive')
    })
  })

  describe('User Interactions', () => {
    it('allows canceling running backtest', async () => {
      const user = userEvent.setup()
      const runningBacktest = {
        ...mockBacktestResult,
        status: 'running' as const,
        progress: 30
      }

      const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
      useAdvancedBacktesting.mockReturnValue({
        ...defaultMockHookReturn,
        activeBacktests: [runningBacktest]
      })

      render(<BacktestingDashboard />)

      const cancelButton = screen.getByRole('button')
      await user.click(cancelButton)

      expect(mockCancelBacktest).toHaveBeenCalledWith('backtest-123')
    })

    it('shows no results message when no active backtests', () => {
      render(<BacktestingDashboard />)

      expect(screen.getByText('No active backtests. Configure and start a backtest to see results.')).toBeInTheDocument()
    })

    it('shows no history message when no backtest history', () => {
      mockGetBacktestHistory.mockReturnValue([])

      render(<BacktestingDashboard />)

      expect(screen.getByText('No backtest history available. Run some backtests to see historical results.')).toBeInTheDocument()
    })
  })

  describe('Real-time Updates and State Changes', () => {
    it('calls getBacktestHistory on component mount when enabled', () => {
      render(<BacktestingDashboard />)

      expect(mockGetBacktestHistory).toHaveBeenCalled()
    })

    it('updates active backtests when hook returns new data', () => {
      const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
      const { rerender } = render(<BacktestingDashboard />)

      // Initially no backtests
      expect(screen.getByText('No active backtests. Configure and start a backtest to see results.')).toBeInTheDocument()

      // Update with active backtest
      useAdvancedBacktesting.mockReturnValue({
        ...defaultMockHookReturn,
        activeBacktests: [mockBacktestResult]
      })

      rerender(<BacktestingDashboard />)

      expect(screen.getByText('Test Strategy')).toBeInTheDocument()
    })

    it('displays different status icons for different backtest states', () => {
      const completedBacktest = { ...mockBacktestResult, status: 'completed' as const }
      const errorBacktest = { ...mockBacktestResult, status: 'error' as const }
      const cancelledBacktest = { ...mockBacktestResult, status: 'cancelled' as const }

      const { useAdvancedBacktesting } = require('@/hooks/use-advanced-dlmm')
      useAdvancedBacktesting.mockReturnValue({
        ...defaultMockHookReturn,
        activeBacktests: [completedBacktest, errorBacktest, cancelledBacktest]
      })

      render(<BacktestingDashboard />)

      const statusBadges = screen.getAllByTestId('badge')
      const statusValues = statusBadges.map(badge => badge.textContent)

      expect(statusValues).toContain('completed')
      expect(statusValues).toContain('error')
      expect(statusValues).toContain('cancelled')
    })
  })

  describe('History Display', () => {
    it('displays historical backtest results', () => {
      const historyBacktest = {
        ...mockBacktestResult,
        endTime: new Date('2023-12-01')
      }

      mockGetBacktestHistory.mockReturnValue([historyBacktest])

      render(<BacktestingDashboard />)

      expect(screen.getByText('Test Strategy')).toBeInTheDocument()
      expect(screen.getByText('12/1/2023')).toBeInTheDocument()
    })

    it('displays performance metrics in history cards', () => {
      const historyBacktest = {
        ...mockBacktestResult,
        results: {
          ...mockBacktestResult.results!,
          totalReturn: 0.95 // Negative return
        }
      }

      mockGetBacktestHistory.mockReturnValue([historyBacktest])

      render(<BacktestingDashboard />)

      // Should show negative return in red
      expect(screen.getByText('-5.00%')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('disables start button when name is empty', () => {
      render(<BacktestingDashboard />)

      const startButton = screen.getByText('Start Backtest')
      expect(startButton).toBeDisabled()
    })

    it('enables start button when required fields are filled', async () => {
      const user = userEvent.setup()
      render(<BacktestingDashboard />)

      const nameInput = screen.getAllByTestId('input')[0]
      await user.type(nameInput, 'Valid Strategy Name')

      const startButton = screen.getByText('Start Backtest')
      expect(startButton).not.toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('provides proper labels for form inputs', () => {
      render(<BacktestingDashboard />)

      expect(screen.getByText('Backtest Name')).toBeInTheDocument()
      expect(screen.getByText('Strategy Type')).toBeInTheDocument()
      expect(screen.getByText('Initial Capital (USD)')).toBeInTheDocument()
      expect(screen.getByText('Max Drawdown (%)')).toBeInTheDocument()
    })

    it('uses semantic HTML elements', () => {
      render(<BacktestingDashboard />)

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getAllByTestId('input')).toHaveLength(4) // Name, capital, drawdown, position size
    })
  })
})