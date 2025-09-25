import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { FeeTierSelector } from '@/components/fee-optimization/fee-tier-selector'
import type { FeeTier, FeeOptimizationSettings } from '@/lib/dlmm/fee-tiers'

// Mock hooks
jest.mock('@/hooks/use-fee-optimization', () => ({
  useComprehensiveFeeManagement: jest.fn(),
  useMigrationImpact: jest.fn(),
  useCustomFeeTier: jest.fn()
}))

// Mock utilities
jest.mock('@/lib/utils', () => ({
  formatCurrency: jest.fn((value) => `$${value.toFixed(2)}`),
  formatPercentage: jest.fn((value) => `${(value * 100).toFixed(1)}%`)
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, ...props }: any) => <div {...props}>{children}</div>
  }
}))

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick }: any) => (
    <div data-testid="card" className={className} onClick={onClick}>{children}</div>
  ),
  CardContent: ({ children, className }: any) => <div data-testid="card-content" className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div data-testid="card-header" className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <div data-testid="card-title" className={className}>{children}</div>
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, className, ...props }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
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

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => <div data-testid="skeleton" className={className} />
}))

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
  TabsTrigger: ({ children, value, ...props }: any) => (
    <button data-testid="tabs-trigger" data-value={value} {...props}>{children}</button>
  )
}))

jest.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, max, min, step, className }: any) => (
    <input
      data-testid="slider"
      type="range"
      value={value[0]}
      onChange={(e) => onValueChange([parseFloat(e.target.value)])}
      max={max}
      min={min}
      step={step}
      className={className}
    />
  )
}), { virtual: true })

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>
      <div onClick={() => onValueChange('test-value')}>{children}</div>
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-testid="select-item" data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>
}), { virtual: true })

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    open ? <div data-testid="dialog" onClick={() => onOpenChange(false)}>{children}</div> : null
  ),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>
}), { virtual: true })

describe('FeeTierSelector Component', () => {
  const mockUseComprehensiveFeeManagement = require('@/hooks/use-fee-optimization').useComprehensiveFeeManagement
  const mockUseMigrationImpact = require('@/hooks/use-fee-optimization').useMigrationImpact
  const mockOnTierSelect = jest.fn()

  const mockFeeTiers: FeeTier[] = [
    {
      id: 'tier-1',
      name: 'Stable Pair - Low',
      category: 'stable',
      totalFeeBps: 25,
      description: 'For stable pairs with low volatility'
    },
    {
      id: 'tier-2',
      name: 'Volatile Pair - Medium',
      category: 'volatile',
      totalFeeBps: 100,
      description: 'For volatile pairs with medium risk'
    },
    {
      id: 'tier-3',
      name: 'Exotic Pair - High',
      category: 'exotic',
      totalFeeBps: 300,
      description: 'For exotic pairs with high risk and returns'
    }
  ]

  const mockAnalysis = {
    currentTier: mockFeeTiers[0],
    recommendedTier: mockFeeTiers[1],
    potentialSavings: 15.50,
    optimization: {
      timeToBreakeven: 3.2,
      costBenefitRatio: 0.85,
      riskScore: 0.25
    }
  }

  const mockRecommendations = [
    {
      tier: mockFeeTiers[1],
      confidence: 0.9,
      reasoning: 'Best balance of fees and liquidity for your trading volume'
    },
    {
      tier: mockFeeTiers[2],
      confidence: 0.6,
      reasoning: 'Higher fees but potentially better returns in volatile conditions'
    }
  ]

  const mockMigrationImpact = {
    migrationCost: 5.25,
    dailySavings: 2.10,
    breakEvenDays: 2.5,
    annualBenefit: 766.50
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseComprehensiveFeeManagement.mockReturnValue({
      analysis: mockAnalysis,
      feeTiers: mockFeeTiers,
      recommendations: mockRecommendations,
      loading: false,
      error: null
    })

    mockUseMigrationImpact.mockReturnValue({
      impact: mockMigrationImpact,
      loading: false
    })
  })

  describe('Component Rendering and Initialization', () => {
    it('renders the fee tier selector with header', () => {
      render(<FeeTierSelector />)

      expect(screen.getByText('Fee Tier Optimization')).toBeInTheDocument()
      expect(screen.getByText('Available Tiers')).toBeInTheDocument()
      expect(screen.getByText('Recommendations')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('shows savings available badge when recommended tier exists', () => {
      render(<FeeTierSelector />)

      expect(screen.getByText('Savings Available')).toBeInTheDocument()
    })

    it('displays loading skeletons when loading', () => {
      mockUseComprehensiveFeeManagement.mockReturnValue({
        analysis: null,
        feeTiers: [],
        recommendations: [],
        loading: true,
        error: null
      })

      render(<FeeTierSelector />)

      expect(screen.getByText('Fee Tier Selection')).toBeInTheDocument()
      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons).toHaveLength(3)
    })

    it('displays error state when loading fails', () => {
      const errorMessage = 'Failed to fetch fee data'
      mockUseComprehensiveFeeManagement.mockReturnValue({
        analysis: null,
        feeTiers: [],
        recommendations: [],
        loading: false,
        error: errorMessage
      })

      render(<FeeTierSelector />)

      expect(screen.getByText('Failed to load fee tiers')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<FeeTierSelector className="custom-class" />)

      const card = container.querySelector('[data-testid="card"]')
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('Fee Tiers Display', () => {
    it('displays all available fee tiers', () => {
      render(<FeeTierSelector />)

      expect(screen.getByText('Stable Pair - Low')).toBeInTheDocument()
      expect(screen.getByText('Volatile Pair - Medium')).toBeInTheDocument()
      expect(screen.getByText('Exotic Pair - High')).toBeInTheDocument()

      expect(screen.getByText('0.25%')).toBeInTheDocument() // 25 bps
      expect(screen.getByText('1.00%')).toBeInTheDocument() // 100 bps
      expect(screen.getByText('3.00%')).toBeInTheDocument() // 300 bps
    })

    it('shows current tier badge', () => {
      render(<FeeTierSelector currentTier={mockFeeTiers[0]} />)

      expect(screen.getByText('Current')).toBeInTheDocument()
    })

    it('shows recommended tier badge', () => {
      render(<FeeTierSelector />)

      expect(screen.getByText('Recommended')).toBeInTheDocument()
    })

    it('displays tier categories with correct styling', () => {
      render(<FeeTierSelector />)

      const stableBadge = screen.getByText('STABLE')
      const volatileBadge = screen.getByText('VOLATILE')
      const exoticBadge = screen.getByText('EXOTIC')

      expect(stableBadge).toHaveClass('bg-green-500/10', 'text-green-700')
      expect(volatileBadge).toHaveClass('bg-orange-500/10', 'text-orange-700')
      expect(exoticBadge).toHaveClass('bg-purple-500/10', 'text-purple-700')
    })

    it('shows fee descriptions for each tier', () => {
      render(<FeeTierSelector />)

      expect(screen.getByText('For stable pairs with low volatility')).toBeInTheDocument()
      expect(screen.getByText('For volatile pairs with medium risk')).toBeInTheDocument()
      expect(screen.getByText('For exotic pairs with high risk and returns')).toBeInTheDocument()
    })
  })

  describe('Current Analysis Display', () => {
    it('displays current analysis when available', () => {
      render(<FeeTierSelector />)

      expect(screen.getByText('Current Analysis')).toBeInTheDocument()
      expect(screen.getByText('Optimization Available')).toBeInTheDocument()
      expect(screen.getByText('Stable Pair - Low')).toBeInTheDocument() // Current tier
      expect(screen.getByText('$15.50')).toBeInTheDocument() // Potential savings
      expect(screen.getByText('3.2 days')).toBeInTheDocument() // Break-even time
    })

    it('does not show analysis when not available', () => {
      mockUseComprehensiveFeeManagement.mockReturnValue({
        analysis: null,
        feeTiers: mockFeeTiers,
        recommendations: [],
        loading: false,
        error: null
      })

      render(<FeeTierSelector />)

      expect(screen.queryByText('Current Analysis')).not.toBeInTheDocument()
    })
  })

  describe('Tier Selection Functionality', () => {
    it('calls onTierSelect when tier is clicked without current tier', async () => {
      const user = userEvent.setup()
      render(<FeeTierSelector onTierSelect={mockOnTierSelect} />)

      const tierCard = screen.getByText('Volatile Pair - Medium').closest('[data-testid="card"]')
      await user.click(tierCard!)

      expect(mockOnTierSelect).toHaveBeenCalledWith(mockFeeTiers[1])
    })

    it('shows migration dialog when switching from current tier', async () => {
      const user = userEvent.setup()
      render(
        <FeeTierSelector
          currentTier={mockFeeTiers[0]}
          onTierSelect={mockOnTierSelect}
        />
      )

      const tierCard = screen.getByText('Volatile Pair - Medium').closest('[data-testid="card"]')
      await user.click(tierCard!)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(screen.getByText('Confirm Fee Tier Migration')).toBeInTheDocument()
    })

    it('does not show migration dialog when selecting current tier', async () => {
      const user = userEvent.setup()
      render(
        <FeeTierSelector
          currentTier={mockFeeTiers[0]}
          onTierSelect={mockOnTierSelect}
        />
      )

      const currentTierCard = screen.getByText('Stable Pair - Low').closest('[data-testid="card"]')
      await user.click(currentTierCard!)

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
      expect(mockOnTierSelect).toHaveBeenCalledWith(mockFeeTiers[0])
    })

    it('highlights current tier with special styling', () => {
      render(<FeeTierSelector currentTier={mockFeeTiers[0]} />)

      const currentTierCard = screen.getByText('Stable Pair - Low').closest('[data-testid="card"]')
      expect(currentTierCard).toHaveClass('ring-2', 'ring-blue-500', 'bg-blue-50/50')
    })

    it('highlights recommended tier with special styling', () => {
      render(<FeeTierSelector />)

      const recommendedTierCard = screen.getByText('Volatile Pair - Medium').closest('[data-testid="card"]')
      expect(recommendedTierCard).toHaveClass('ring-2', 'ring-green-500', 'bg-green-50/50')
    })
  })

  describe('Recommendations Display', () => {
    it('displays recommendations with confidence levels', () => {
      render(<FeeTierSelector />)

      expect(screen.getByText('90.0% confidence')).toBeInTheDocument()
      expect(screen.getByText('60.0% confidence')).toBeInTheDocument()
      expect(screen.getByText('Best balance of fees and liquidity for your trading volume')).toBeInTheDocument()
      expect(screen.getByText('Best Match')).toBeInTheDocument()
    })

    it('applies confidence level styling', () => {
      render(<FeeTierSelector />)

      const highConfidenceBadge = screen.getByText('90.0% confidence')
      const mediumConfidenceBadge = screen.getByText('60.0% confidence')

      expect(highConfidenceBadge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-300')
      expect(mediumConfidenceBadge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-300')
    })

    it('shows empty state when no recommendations', () => {
      mockUseComprehensiveFeeManagement.mockReturnValue({
        analysis: mockAnalysis,
        feeTiers: mockFeeTiers,
        recommendations: [],
        loading: false,
        error: null
      })

      render(<FeeTierSelector />)

      expect(screen.getByText('No recommendations available')).toBeInTheDocument()
      expect(screen.getByText('Provide token pair and liquidity amount for analysis')).toBeInTheDocument()
    })

    it('allows selecting tier from recommendations', async () => {
      const user = userEvent.setup()
      render(<FeeTierSelector onTierSelect={mockOnTierSelect} />)

      const recommendationCard = screen.getByText('Best balance of fees and liquidity for your trading volume')
        .closest('[data-testid="card"]')
      await user.click(recommendationCard!)

      expect(mockOnTierSelect).toHaveBeenCalledWith(mockFeeTiers[1])
    })
  })

  describe('Settings Configuration', () => {
    it('displays all settings controls', () => {
      render(<FeeTierSelector />)

      expect(screen.getByText('Risk Tolerance')).toBeInTheDocument()
      expect(screen.getByText('Liquidity Range Strategy')).toBeInTheDocument()
      expect(screen.getByText('Prioritize Fee Optimization')).toBeInTheDocument()
    })

    it('shows slippage slider with current value', () => {
      render(<FeeTierSelector />)

      expect(screen.getByText('Max Slippage: 1.0%')).toBeInTheDocument()
      expect(screen.getByTestId('slider')).toBeInTheDocument()
    })

    it('updates slippage setting when slider changes', async () => {
      const user = userEvent.setup()
      render(<FeeTierSelector />)

      const slider = screen.getByTestId('slider')
      await user.clear(slider)
      await user.type(slider, '2.5')

      // Should trigger settings update
      expect(slider).toHaveValue(2.5)
    })

    it('toggles fee prioritization switch', async () => {
      const user = userEvent.setup()
      render(<FeeTierSelector />)

      const switchControl = screen.getByTestId('switch')
      expect(switchControl).toBeChecked() // Default is true

      await user.click(switchControl)
      expect(switchControl).not.toBeChecked()
    })

    it('updates risk tolerance via select', async () => {
      const user = userEvent.setup()
      render(<FeeTierSelector />)

      const riskSelect = screen.getByTestId('select')
      await user.click(riskSelect)

      // Should be in moderate mode by default
      expect(riskSelect).toHaveAttribute('data-value', 'moderate')
    })
  })

  describe('Migration Dialog', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      render(
        <FeeTierSelector
          currentTier={mockFeeTiers[0]}
          onTierSelect={mockOnTierSelect}
        />
      )

      const tierCard = screen.getByText('Volatile Pair - Medium').closest('[data-testid="card"]')
      await user.click(tierCard!)
    })

    it('shows migration dialog with impact details', () => {
      expect(screen.getByText('Confirm Fee Tier Migration')).toBeInTheDocument()
      expect(screen.getByText(/You're about to change from/)).toBeInTheDocument()

      expect(screen.getByText('Migration Cost:')).toBeInTheDocument()
      expect(screen.getByText('$5.25')).toBeInTheDocument()
      expect(screen.getByText('Daily Savings:')).toBeInTheDocument()
      expect(screen.getByText('+$2.10')).toBeInTheDocument()
      expect(screen.getByText('Break-even Time:')).toBeInTheDocument()
      expect(screen.getByText('2.5 days')).toBeInTheDocument()
      expect(screen.getByText('Annual Benefit:')).toBeInTheDocument()
      expect(screen.getByText('+$766.50')).toBeInTheDocument()
    })

    it('shows loading state while calculating impact', () => {
      mockUseMigrationImpact.mockReturnValue({
        impact: null,
        loading: true
      })

      const { rerender } = render(
        <FeeTierSelector
          currentTier={mockFeeTiers[0]}
          onTierSelect={mockOnTierSelect}
        />
      )

      rerender(
        <FeeTierSelector
          currentTier={mockFeeTiers[0]}
          onTierSelect={mockOnTierSelect}
        />
      )

      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('shows warning for negative savings', async () => {
      mockUseMigrationImpact.mockReturnValue({
        impact: {
          ...mockMigrationImpact,
          dailySavings: -1.50,
          annualBenefit: -547.50
        },
        loading: false
      })

      const user = userEvent.setup()
      render(
        <FeeTierSelector
          currentTier={mockFeeTiers[0]}
          onTierSelect={mockOnTierSelect}
        />
      )

      const tierCard = screen.getByText('Volatile Pair - Medium').closest('[data-testid="card"]')
      await user.click(tierCard!)

      expect(screen.getByText('Higher Fee Tier')).toBeInTheDocument()
      expect(screen.getByText(/This migration will increase your daily fees/)).toBeInTheDocument()
      expect(screen.getByText('-$1.50')).toBeInTheDocument()
      expect(screen.getByText('-$547.50')).toBeInTheDocument()
    })

    it('confirms migration when confirm button is clicked', async () => {
      const user = userEvent.setup()

      const confirmButton = screen.getByText('Confirm Migration')
      await user.click(confirmButton)

      expect(mockOnTierSelect).toHaveBeenCalledWith(mockFeeTiers[1])
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })

    it('cancels migration when cancel button is clicked', async () => {
      const user = userEvent.setup()

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(mockOnTierSelect).not.toHaveBeenCalled()
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })

    it('handles infinite break-even time', async () => {
      mockUseMigrationImpact.mockReturnValue({
        impact: {
          ...mockMigrationImpact,
          breakEvenDays: Infinity
        },
        loading: false
      })

      const user = userEvent.setup()
      render(
        <FeeTierSelector
          currentTier={mockFeeTiers[0]}
          onTierSelect={mockOnTierSelect}
        />
      )

      const tierCard = screen.getByText('Volatile Pair - Medium').closest('[data-testid="card"]')
      await user.click(tierCard!)

      expect(screen.getByText('Never')).toBeInTheDocument()
    })

    it('shows fallback message when impact unavailable', async () => {
      mockUseMigrationImpact.mockReturnValue({
        impact: null,
        loading: false
      })

      const user = userEvent.setup()
      render(
        <FeeTierSelector
          currentTier={mockFeeTiers[0]}
          onTierSelect={mockOnTierSelect}
        />
      )

      const tierCard = screen.getByText('Volatile Pair - Medium').closest('[data-testid="card"]')
      await user.click(tierCard!)

      expect(screen.getByText('Unable to calculate migration impact')).toBeInTheDocument()
    })
  })

  describe('Category Icons and Colors', () => {
    it('displays correct icons for different categories', () => {
      const customFeeTiers: FeeTier[] = [
        { id: '1', name: 'Custom', category: 'custom', totalFeeBps: 50, description: 'Custom tier' }
      ]

      mockUseComprehensiveFeeManagement.mockReturnValue({
        analysis: null,
        feeTiers: customFeeTiers,
        recommendations: [],
        loading: false,
        error: null
      })

      render(<FeeTierSelector />)

      // Should show custom category styling
      expect(screen.getByText('CUSTOM')).toHaveClass('bg-blue-500/10', 'text-blue-700')
    })

    it('handles unknown category gracefully', () => {
      const unknownCategoryTiers: FeeTier[] = [
        { id: '1', name: 'Unknown', category: 'unknown', totalFeeBps: 50, description: 'Unknown tier' }
      ]

      mockUseComprehensiveFeeManagement.mockReturnValue({
        analysis: null,
        feeTiers: unknownCategoryTiers,
        recommendations: [],
        loading: false,
        error: null
      })

      render(<FeeTierSelector />)

      expect(screen.getByText('UNKNOWN')).toHaveClass('bg-gray-500/10', 'text-gray-700')
    })
  })

  describe('Props Integration', () => {
    it('passes props to hooks correctly', () => {
      const props = {
        poolAddress: 'pool123',
        liquidityAmount: '1000',
        tokenPair: 'SOL/USDC',
        currentTier: mockFeeTiers[0]
      }

      render(<FeeTierSelector {...props} />)

      expect(mockUseComprehensiveFeeManagement).toHaveBeenCalledWith(
        'pool123',
        '1000',
        'SOL/USDC',
        expect.any(Object)
      )

      expect(mockUseMigrationImpact).toHaveBeenCalledWith(
        mockFeeTiers[0],
        undefined,
        '1000',
        '10000'
      )
    })

    it('handles missing optional props gracefully', () => {
      render(<FeeTierSelector />)

      expect(mockUseComprehensiveFeeManagement).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        expect.any(Object)
      )
    })
  })

  describe('Settings State Management', () => {
    it('maintains settings state across tab switches', async () => {
      const user = userEvent.setup()
      render(<FeeTierSelector />)

      // Change a setting
      const slider = screen.getByTestId('slider')
      await user.clear(slider)
      await user.type(slider, '3.0')

      // Switch tabs and back
      const tiersTab = screen.getByText('Available Tiers')
      await user.click(tiersTab)

      const settingsTab = screen.getByText('Settings')
      await user.click(settingsTab)

      // Setting should be maintained
      expect(screen.getByDisplayValue('3')).toBeInTheDocument()
    })

    it('updates settings and re-triggers analysis', async () => {
      const user = userEvent.setup()
      render(<FeeTierSelector />)

      const switchControl = screen.getByTestId('switch')
      await user.click(switchControl)

      // Should have been called with updated settings
      expect(mockUseComprehensiveFeeManagement).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        expect.objectContaining({
          prioritizeFees: false // Changed from default true
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('displays hook errors gracefully', () => {
      mockUseComprehensiveFeeManagement.mockReturnValue({
        analysis: null,
        feeTiers: [],
        recommendations: [],
        loading: false,
        error: 'Network connection failed'
      })

      render(<FeeTierSelector />)

      expect(screen.getByText('Failed to load fee tiers')).toBeInTheDocument()
      expect(screen.getByText('Network connection failed')).toBeInTheDocument()
    })

    it('handles migration impact errors', async () => {
      mockUseMigrationImpact.mockReturnValue({
        impact: null,
        loading: false,
        error: 'Migration calculation failed'
      })

      const user = userEvent.setup()
      render(
        <FeeTierSelector
          currentTier={mockFeeTiers[0]}
          onTierSelect={mockOnTierSelect}
        />
      )

      const tierCard = screen.getByText('Volatile Pair - Medium').closest('[data-testid="card"]')
      await user.click(tierCard!)

      expect(screen.getByText('Unable to calculate migration impact')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides proper labels and semantic elements', () => {
      render(<FeeTierSelector />)

      expect(screen.getByText('Risk Tolerance')).toBeInTheDocument()
      expect(screen.getByText('Liquidity Range Strategy')).toBeInTheDocument()
      expect(screen.getByText('Prioritize Fee Optimization')).toBeInTheDocument()

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('handles keyboard navigation for tier selection', async () => {
      render(<FeeTierSelector onTierSelect={mockOnTierSelect} />)

      const tierCards = screen.getAllByTestId('card')
      const firstTierCard = tierCards.find(card => card.textContent?.includes('Stable Pair - Low'))

      // Simulate keyboard navigation
      if (firstTierCard) {
        fireEvent.keyDown(firstTierCard, { key: 'Enter' })
      }

      // Should handle keyboard events gracefully
      expect(screen.getByText('Stable Pair - Low')).toBeInTheDocument()
    })
  })
})