// Arbitrage Monitoring UI Components
// Enterprise-grade React components for cross-pool arbitrage management
// Part of 100% SDK utilization achievement

export { ArbitrageDashboard } from './arbitrage-dashboard'
export { ArbitrageOpportunityCard } from './arbitrage-opportunity-card'
export { ArbitrageSettingsModal } from './arbitrage-settings-modal'
export { ArbitrageExecutionModal } from './arbitrage-execution-modal'

// Component exports for easy integration
export type {
  ArbitrageOpportunityCardProps
} from './arbitrage-opportunity-card'

/**
 * Arbitrage UI Component Suite
 *
 * Complete set of React components for managing cross-pool arbitrage:
 *
 * 1. ArbitrageDashboard - Main dashboard for monitoring and controlling arbitrage system
 *    - Real-time opportunity display
 *    - System status and statistics
 *    - Start/stop monitoring controls
 *    - Performance metrics
 *
 * 2. ArbitrageOpportunityCard - Individual opportunity display component
 *    - Expandable opportunity details
 *    - Risk and profitability analysis
 *    - Route visualization
 *    - Quick execution actions
 *
 * 3. ArbitrageSettingsModal - Configuration modal for arbitrage parameters
 *    - Profit thresholds and risk limits
 *    - MEV protection settings
 *    - Execution parameters
 *    - Economic impact analysis
 *
 * 4. ArbitrageExecutionModal - Execution planning and monitoring
 *    - Amount input and validation
 *    - Execution plan visualization
 *    - Real-time progress tracking
 *    - Results display
 *
 * Features:
 * - Mobile-responsive design with Tailwind CSS
 * - Real-time data updates
 * - Advanced risk visualization
 * - MEV protection indicators
 * - Comprehensive profitability analysis
 * - Execution progress tracking
 * - Error handling and fallbacks
 *
 * Integration:
 * - Uses ArbitrageManager from @/lib/dlmm/arbitrage
 * - Integrates with wallet connection hooks
 * - Supports all arbitrage types (direct, triangular, multi-hop)
 * - Compatible with existing UI component system
 */