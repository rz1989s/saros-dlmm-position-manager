import { render, screen, fireEvent } from '@testing-library/react'
import { FeatureBadge } from '@/components/ui/feature-badge'
// import { FeatureTooltip } from '@/components/ui/tooltip' // Unused import
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { JudgeModeProvider, useJudgeMode } from '@/contexts/judge-mode-context'
import { JudgeModeToggle } from '@/components/sdk/judge-mode-toggle'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('Feature Identification System', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  describe('FeatureBadge', () => {
    it('renders badge with correct content', () => {
      render(
        <FeatureBadge
          featureId={1}
          featureName="Test Feature"
          status="completed"
          compact
        />
      )

      expect(screen.getByText('SDK #1 ✓')).toBeInTheDocument()
    })

    it('renders full badge when not compact', () => {
      render(
        <FeatureBadge
          featureId={1}
          featureName="Test Feature"
          status="completed"
          showDetails
        />
      )

      expect(screen.getByText('SDK #1: Test Feature ✓')).toBeInTheDocument()
    })

    it('applies correct status colors', () => {
      const { rerender } = render(
        <FeatureBadge
          featureId={1}
          featureName="Test Feature"
          status="completed"
        />
      )

      let badge = screen.getByText('SDK #1 ✓')
      expect(badge).toHaveClass('bg-green-500')

      rerender(
        <FeatureBadge
          featureId={1}
          featureName="Test Feature"
          status="partial"
        />
      )

      badge = screen.getByText('SDK #1 ◐')
      expect(badge).toHaveClass('bg-yellow-500')

      rerender(
        <FeatureBadge
          featureId={1}
          featureName="Test Feature"
          status="planned"
        />
      )

      badge = screen.getByText('SDK #1 ◯')
      expect(badge).toHaveClass('bg-gray-400')
    })
  })

  describe('JudgeModeContext', () => {
    it('provides judge mode state and controls', () => {
      const TestComponent = () => {
        const { isJudgeMode, toggleJudgeMode, visibleFeatures } = useJudgeMode()
        return (
          <div>
            <span data-testid="judge-mode">{isJudgeMode ? 'on' : 'off'}</span>
            <span data-testid="feature-count">{visibleFeatures.size}</span>
            <button onClick={toggleJudgeMode}>Toggle</button>
          </div>
        )
      }

      render(
        <JudgeModeProvider>
          <TestComponent />
        </JudgeModeProvider>
      )

      expect(screen.getByTestId('judge-mode')).toHaveTextContent('off')
      expect(screen.getByTestId('feature-count')).toHaveTextContent('0')

      fireEvent.click(screen.getByText('Toggle'))
      expect(screen.getByTestId('judge-mode')).toHaveTextContent('on')
    })

    it('persists judge mode state in localStorage', () => {
      const TestComponent = () => {
        const { toggleJudgeMode } = useJudgeMode()
        return <button onClick={toggleJudgeMode}>Toggle</button>
      }

      render(
        <JudgeModeProvider>
          <TestComponent />
        </JudgeModeProvider>
      )

      fireEvent.click(screen.getByText('Toggle'))
      expect(mockLocalStorage.getItem('judge-mode')).toBe('true')
    })
  })

  describe('JudgeModeToggle', () => {
    it('renders button variant correctly', () => {
      render(
        <JudgeModeProvider>
          <JudgeModeToggle variant="button" />
        </JudgeModeProvider>
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText(/Judge Mode/)).toBeInTheDocument()
    })

    it('renders switch variant correctly', () => {
      render(
        <JudgeModeProvider>
          <JudgeModeToggle variant="switch" />
        </JudgeModeProvider>
      )

      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('toggles judge mode when clicked', () => {
      const TestComponent = () => {
        const { isJudgeMode } = useJudgeMode()
        return (
          <div>
            <span data-testid="mode">{isJudgeMode ? 'on' : 'off'}</span>
            <JudgeModeToggle variant="button" />
          </div>
        )
      }

      render(
        <JudgeModeProvider>
          <TestComponent />
        </JudgeModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('off')

      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByTestId('mode')).toHaveTextContent('on')
    })
  })

  describe('FeatureIdentifier', () => {
    const mockFeature = {
      id: 1,
      name: 'Test Feature',
      status: 'completed' as const,
      sdkLocation: 'src/test.ts',
      description: 'Test description'
    }

    it('renders children and badge', () => {
      render(
        <JudgeModeProvider>
          <FeatureIdentifier feature={mockFeature}>
            <div>Test Content</div>
          </FeatureIdentifier>
        </JudgeModeProvider>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
      expect(screen.getByText('SDK #1 ✓')).toBeInTheDocument()
    })

    it('hides badge when showBadge is false', () => {
      render(
        <JudgeModeProvider>
          <FeatureIdentifier feature={mockFeature} showBadge={false}>
            <div>Test Content</div>
          </FeatureIdentifier>
        </JudgeModeProvider>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
      expect(screen.queryByText('SDK #1 ✓')).not.toBeInTheDocument()
    })
  })
})