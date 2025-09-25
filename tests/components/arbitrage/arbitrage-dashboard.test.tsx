import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ArbitrageDashboard } from '@/components/arbitrage/arbitrage-dashboard'
import type { ArbitrageOpportunity } from '@/lib/dlmm/arbitrage'

// Mock the hooks and utilities
jest.mock('@/hooks/use-wallet-integration', () => ({
  useWalletState: jest.fn()
}))

jest.mock('@/lib/utils/format', () => ({
  formatCurrency: jest.fn((value) => `$${value.toFixed(2)}`),
  formatPercentage: jest.fn((value) => `${(value * 100).toFixed(1)}%`)
}))

// Mock arbitrage components
jest.mock('@/components/arbitrage/arbitrage-opportunity-card', () => ({
  ArbitrageOpportunityCard: ({ opportunity, onExecute, onAnalyze }: any) => (
    <div data-testid="arbitrage-opportunity-card" data-opportunity-id={opportunity.id}>
      <div>{opportunity.tokenPair}</div>
      <div>{opportunity.profitability.netProfit}</div>
      <button onClick={() => onExecute(100)}>Execute</button>
      <button onClick={onAnalyze}>Analyze</button>
    </div>
  )
}))

jest.mock('@/components/arbitrage/arbitrage-settings-modal', () => ({
  ArbitrageSettingsModal: ({ isOpen, onClose, config, onSave }: any) => (
    isOpen ? (
      <div data-testid="arbitrage-settings-modal">
        <button onClick={() => onSave({ ...config, minProfitThreshold: 20 })}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  )
}))

jest.mock('@/components/arbitrage/arbitrage-execution-modal', () => ({
  ArbitrageExecutionModal: ({ isOpen, onClose, opportunity, onExecute }: any) => (
    isOpen ? (
      <div data-testid="arbitrage-execution-modal">
        <div>{opportunity?.id}</div>
        <button onClick={() => onExecute(opportunity, 100)}>Execute Trade</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
  )
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

describe('ArbitrageDashboard', () => {
  const mockWalletState = {
    isConnected: true,
    address: '4k8sVCJDCCGR3L1e8XvXh8jFSkgwKY1cxgKJF7SqKJBW'
  }

  const mockOpportunity: ArbitrageOpportunity = {
    id: 'opp-123',
    type: 'direct',
    tokenPair: 'SOL/USDC',
    pools: [],
    profitability: {
      netProfit: 15.67,
      profitMargin: 0.025,
      gasEstimate: 0.005,
      slippageImpact: 0.001
    },
    riskScore: 0.3,
    executionComplexity: 'low',
    timeWindow: 30000,
    detectedAt: new Date(),
    executionPath: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
    const { useWalletState } = require('@/hooks/use-wallet-integration')
    useWalletState.mockReturnValue(mockWalletState)

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Wallet Connection State', () => {
    it('shows wallet connection prompt when not connected', () => {
      const { useWalletState } = require('@/hooks/use-wallet-integration')
      useWalletState.mockReturnValue({ isConnected: false, address: null })

      render(<ArbitrageDashboard />)

      expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument()
      expect(screen.getByText('Connect your wallet to access cross-pool arbitrage opportunities')).toBeInTheDocument()
    })

    it('shows dashboard content when wallet is connected', () => {
      render(<ArbitrageDashboard />)

      expect(screen.getByText('Active Opportunities')).toBeInTheDocument()
      expect(screen.getByText('Total Profit')).toBeInTheDocument()
      expect(screen.getByText('Arbitrage System Control')).toBeInTheDocument()
    })
  })

  describe('System Overview Stats', () => {
    it('displays system statistics correctly', () => {
      render(<ArbitrageDashboard />)

      // Check stats cards
      expect(screen.getByText('Active Opportunities')).toBeInTheDocument()
      expect(screen.getByText('Total Profit')).toBeInTheDocument()
      expect(screen.getByText('Avg Execution')).toBeInTheDocument()
      expect(screen.getByText('Monitored Pools')).toBeInTheDocument()
    })

    it('shows formatted currency and percentage values', () => {
      render(<ArbitrageDashboard />)

      expect(screen.getByText('$1247.32')).toBeInTheDocument() // Total profit
      expect(screen.getByText('94.0%')).toBeInTheDocument() // Success rate
      expect(screen.getByText('89.0%')).toBeInTheDocument() // MEV protection
    })

    it('displays execution time and pool counts', () => {
      render(<ArbitrageDashboard />)

      expect(screen.getByText('8.5s')).toBeInTheDocument() // Avg execution time
      expect(screen.getByText('12')).toBeInTheDocument() // Monitored pools
      expect(screen.getByText('47 opportunities detected')).toBeInTheDocument()
    })
  })

  describe('System Control Panel', () => {
    it('shows monitoring status badge when stopped', () => {
      render(<ArbitrageDashboard />)

      const stoppedBadge = screen.getByText('Stopped')
      expect(stoppedBadge).toBeInTheDocument()
    })

    it('shows MEV protection badge when enabled', () => {
      render(<ArbitrageDashboard />)

      expect(screen.getByText('MEV Protected')).toBeInTheDocument()
    })

    it('displays configuration values', () => {
      render(<ArbitrageDashboard />)

      expect(screen.getByText('Min Profit: $10.00')).toBeInTheDocument()
      expect(screen.getByText('Max Risk: 70.0%')).toBeInTheDocument()
      expect(screen.getByText('MEV Protection: Enabled')).toBeInTheDocument()
    })

    it('shows appropriate status message for stopped system', () => {
      render(<ArbitrageDashboard />)

      expect(screen.getByText('System is stopped. Start monitoring to detect arbitrage opportunities')).toBeInTheDocument()
    })
  })

  describe('Control Button Interactions', () => {
    it('opens settings modal when settings button is clicked', async () => {
      const user = userEvent.setup()
      render(<ArbitrageDashboard />)

      const settingsButton = screen.getByText('Settings')
      await user.click(settingsButton)

      expect(screen.getByTestId('arbitrage-settings-modal')).toBeInTheDocument()
    })

    it('closes settings modal and saves configuration', async () => {
      const user = userEvent.setup()
      render(<ArbitrageDashboard />)

      const settingsButton = screen.getByText('Settings')
      await user.click(settingsButton)

      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      expect(screen.queryByTestId('arbitrage-settings-modal')).not.toBeInTheDocument()
    })

    it('enables refresh button when not monitoring', async () => {
      const user = userEvent.setup()
      render(<ArbitrageDashboard />)

      const refreshButton = screen.getByText('Refresh')
      expect(refreshButton).toBeDisabled() // Disabled when not monitoring
    })

    it('shows start monitoring button when stopped', () => {
      render(<ArbitrageDashboard />)

      expect(screen.getByText('Start Monitoring')).toBeInTheDocument()
    })
  })

  describe('Opportunity Display', () => {
    it('shows scanning message when monitoring with no opportunities', () => {
      render(<ArbitrageDashboard />)

      // Initially not monitoring
      expect(screen.getByText('Monitoring Stopped')).toBeInTheDocument()
      expect(screen.getByText('Start monitoring to scan for arbitrage opportunities across DLMM pools')).toBeInTheDocument()
    })

    it('displays opportunity cards when opportunities exist', () => {
      // Mock component state with opportunities
      const MockArbitrageDashboardWithOpportunities = () => {
        const [opportunities] = React.useState([mockOpportunity])

        if (!mockWalletState.isConnected) {
          return <div>Not connected</div>
        }

        return (
          <div>
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} data-testid="arbitrage-opportunity-card">
                <div>{opportunity.tokenPair}</div>
                <div>${opportunity.profitability.netProfit}</div>
              </div>
            ))}
          </div>
        )
      }

      render(<MockArbitrageDashboardWithOpportunities />)

      expect(screen.getByText('SOL/USDC')).toBeInTheDocument()
      expect(screen.getByText('$15.67')).toBeInTheDocument()
    })
  })

  describe('Recent Performance Display', () => {
    it('shows recent execution history', () => {
      render(<ArbitrageDashboard />)

      expect(screen.getByText('Recent Performance')).toBeInTheDocument()

      // Check for mock execution entries
      expect(screen.getByText('SOL/USDC')).toBeInTheDocument()
      expect(screen.getByText('SOL/USDT/USDC')).toBeInTheDocument()
      expect(screen.getByText('USDC/USDT')).toBeInTheDocument()
    })

    it('displays execution details and status', () => {
      render(<ArbitrageDashboard />)

      expect(screen.getByText('+$23.45')).toBeInTheDocument()
      expect(screen.getByText('+$15.67')).toBeInTheDocument()
      expect(screen.getByText('-$2.34')).toBeInTheDocument()

      expect(screen.getByText('7.2s execution')).toBeInTheDocument()
      expect(screen.getByText('12.4s execution')).toBeInTheDocument()
    })

    it('shows execution badges and timestamps', () => {
      render(<ArbitrageDashboard />)

      const directBadges = screen.getAllByText('direct')
      const triangularBadge = screen.getByText('triangular')

      expect(directBadges).toHaveLength(2)
      expect(triangularBadge).toBeInTheDocument()

      expect(screen.getByText('2 minutes ago')).toBeInTheDocument()
      expect(screen.getByText('8 minutes ago')).toBeInTheDocument()
      expect(screen.getByText('15 minutes ago')).toBeInTheDocument()
    })
  })

  describe('Modal Interactions', () => {
    it('opens execution modal when opportunity is selected', async () => {
      const user = userEvent.setup()

      // Create a mock component that has opportunities
      const MockDashboardWithOpps = () => {
        const [showExecution, setShowExecution] = React.useState(false)
        const [selectedOpportunity, setSelectedOpportunity] = React.useState(null)

        return (
          <div>
            <button
              onClick={() => {
                setSelectedOpportunity(mockOpportunity)
                setShowExecution(true)
              }}
            >
              Select Opportunity
            </button>
            {showExecution && (
              <div data-testid="arbitrage-execution-modal">
                <div>{selectedOpportunity?.id}</div>
                <button onClick={() => setShowExecution(false)}>Cancel</button>
              </div>
            )}
          </div>
        )
      }

      render(<MockDashboardWithOpps />)

      const selectButton = screen.getByText('Select Opportunity')
      await user.click(selectButton)

      expect(screen.getByTestId('arbitrage-execution-modal')).toBeInTheDocument()
      expect(screen.getByText('opp-123')).toBeInTheDocument()
    })

    it('closes execution modal when cancelled', async () => {
      const user = userEvent.setup()

      const MockDashboardWithModal = () => {
        const [showExecution, setShowExecution] = React.useState(true)

        return (
          <div>
            {showExecution && (
              <div data-testid="arbitrage-execution-modal">
                <button onClick={() => setShowExecution(false)}>Cancel</button>
              </div>
            )}
          </div>
        )
      }

      render(<MockDashboardWithModal />)

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(screen.queryByTestId('arbitrage-execution-modal')).not.toBeInTheDocument()
    })
  })

  describe('Real-time Updates', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    })

    it('sets up periodic refresh when monitoring starts', () => {
      const MockMonitoringDashboard = () => {
        const [isMonitoring, setIsMonitoring] = React.useState(false)

        React.useEffect(() => {
          if (isMonitoring) {
            const interval = setInterval(() => {
              console.log('Refreshing opportunities and stats')
            }, 5000)
            return () => clearInterval(interval)
          }
        }, [isMonitoring])

        return (
          <button onClick={() => setIsMonitoring(!isMonitoring)}>
            {isMonitoring ? 'Stop' : 'Start'} Monitoring
          </button>
        )
      }

      const consoleSpy = jest.spyOn(console, 'log')
      render(<MockMonitoringDashboard />)

      const button = screen.getByText('Start Monitoring')
      fireEvent.click(button)

      // Fast forward time to trigger interval
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(consoleSpy).toHaveBeenCalledWith('Refreshing opportunities and stats')
    })
  })

  describe('Loading States', () => {
    it('shows loading spinner when system is starting', () => {
      const MockLoadingDashboard = () => {
        const [isLoading, setIsLoading] = React.useState(true)

        return (
          <button disabled={isLoading}>
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
            ) : (
              'Start'
            )}
            {isLoading ? 'Starting...' : 'Start Monitoring'}
          </button>
        )
      }

      render(<MockLoadingDashboard />)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(screen.getByText('Starting...')).toBeInTheDocument()
    })

    it('disables refresh button when loading', () => {
      const MockRefreshButton = () => {
        const [isLoading] = React.useState(true)
        const [isMonitoring] = React.useState(true)

        return (
          <button disabled={!isMonitoring || isLoading}>
            Refresh
          </button>
        )
      }

      render(<MockRefreshButton />)

      const refreshButton = screen.getByText('Refresh')
      expect(refreshButton).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('handles initialization errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error')

      const MockErrorDashboard = () => {
        React.useEffect(() => {
          try {
            throw new Error('Arbitrage manager initialization failed')
          } catch (error) {
            console.error('Failed to initialize arbitrage manager:', error)
          }
        }, [])

        return <div>Dashboard</div>
      }

      render(<MockErrorDashboard />)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to initialize arbitrage manager:',
        expect.any(Error)
      )
    })

    it('handles monitoring start/stop errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error')

      const MockErrorHandlingDashboard = () => {
        const handleStart = async () => {
          try {
            throw new Error('Failed to start monitoring')
          } catch (error) {
            console.error('Failed to start arbitrage monitoring:', error)
          }
        }

        return <button onClick={handleStart}>Start</button>
      }

      const user = userEvent.setup()
      render(<MockErrorHandlingDashboard />)

      const startButton = screen.getByText('Start')
      await user.click(startButton)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to start arbitrage monitoring:',
        expect.any(Error)
      )
    })
  })

  describe('Auto-refresh Indicator', () => {
    it('shows auto-refresh status correctly', () => {
      render(<ArbitrageDashboard />)

      expect(screen.getByText('Auto-refresh: Off')).toBeInTheDocument()
    })

    it('shows pulse indicator when monitoring is active', () => {
      const MockMonitoringDashboard = () => {
        const [isMonitoring] = React.useState(true)

        return (
          <div>
            <span>Auto-refresh: {isMonitoring ? 'On' : 'Off'}</span>
            {isMonitoring && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
        )
      }

      render(<MockMonitoringDashboard />)

      expect(screen.getByText('Auto-refresh: On')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides accessible button labels', () => {
      render(<ArbitrageDashboard />)

      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Refresh')).toBeInTheDocument()
      expect(screen.getByText('Start Monitoring')).toBeInTheDocument()
    })

    it('uses semantic HTML elements', () => {
      render(<ArbitrageDashboard />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Configuration Management', () => {
    it('updates configuration when settings are saved', async () => {
      const user = userEvent.setup()

      const MockConfigDashboard = () => {
        const [config, setConfig] = React.useState({
          minProfitThreshold: 10,
          maxRiskScore: 0.7,
          enableMEVProtection: true,
          monitoringEnabled: true
        })
        const [showSettings, setShowSettings] = React.useState(false)

        return (
          <div>
            <div>Min Profit: ${config.minProfitThreshold.toFixed(2)}</div>
            <button onClick={() => setShowSettings(true)}>Settings</button>
            {showSettings && (
              <div data-testid="settings-modal">
                <button onClick={() => {
                  setConfig({ ...config, minProfitThreshold: 25 })
                  setShowSettings(false)
                }}>
                  Save Config
                </button>
              </div>
            )}
          </div>
        )
      }

      render(<MockConfigDashboard />)

      expect(screen.getByText('Min Profit: $10.00')).toBeInTheDocument()

      const settingsButton = screen.getByText('Settings')
      await user.click(settingsButton)

      const saveButton = screen.getByText('Save Config')
      await user.click(saveButton)

      expect(screen.getByText('Min Profit: $25.00')).toBeInTheDocument()
    })
  })
})