# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Saros DLMM Position Manager** - a comprehensive, production-ready Next.js PWA built for the [Saros DLMM Demo Challenge](https://earn.superteam.fun/listing/dlmm-demo-challenge-1). It manages Dynamic Liquidity Market Maker (DLMM) positions on Solana, featuring position tracking, analytics, automated strategies, P&L analysis, advanced animations, WCAG 2.1 AA accessibility, and progressive web app capabilities. **Status: v0.4.0 COMPLETE** with 95/100 competition score.

## Essential Commands

### Development
```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Start production server
npm start

# Run linting
npm run lint

# TypeScript type checking
npm run type-check
```

### Deployment
```bash
# Deploy to Vercel (requires authentication)
vercel login
vercel --prod --yes
```

### Live Demo
**Production URL**: https://saros-demo.rectorspace.com/
**Status**: ✅ Live and fully functional

## Architecture Overview

### Core DLMM Integration (`src/lib/dlmm/`)
- **`client.ts`**: Main DLMM client wrapper around @saros-finance/dlmm-sdk
  - ✅ **Full SDK integration** with LiquidityBookServices
  - Contains all position, bin, and liquidity management methods
  - Real-time error handling and transaction building
  - Singleton pattern with `dlmmClient` export
- **`operations.ts`**: Advanced DLMM operations (add/remove liquidity, rebalancing, limit orders)
- **`strategies.ts`**: Strategy management system with evaluation and execution logic
- **`utils.ts`**: DLMM calculations and utility functions

### Data Flow Architecture
1. **Wallet Integration**: Solana Wallet Adapter provides wallet state
2. **DLMM Client**: Fetches position and bin data via @saros-finance/dlmm-sdk
3. **React Hooks** (`src/hooks/`): Transform raw data with real-time polling
4. **Components**: Display data with live updates and user interactions
5. **Real-time Updates**: Automatic polling with configurable intervals

### Key Data Types (`src/lib/types.ts`)
- **`DLMMPosition`**: Core position data with tokenX/tokenY, bins, fees, P&L
- **`BinInfo`**: Bin-specific liquidity data and pricing
- **`TokenInfo`**: Token metadata with price information
- **`RebalanceStrategy`** & **`LimitOrder`**: Strategy execution types

### Component Architecture

#### Main Pages (`src/app/`)
- **`page.tsx`**: Position dashboard with wallet integration and position list
- **`analytics/page.tsx`**: Tabbed analytics interface (P&L, Portfolio, Pool Analysis, Charts)  
- **`strategies/page.tsx`**: Strategy management hub with rebalancing and limit orders

#### Core Components (`src/components/`)
- **`position-card.tsx`**: Individual position display with expand/collapse analytics
- **`positions-list.tsx`**: Main position listing with search, filters, and add liquidity modal
- **`dashboard-header.tsx`**: Navigation, wallet connection, and network status

#### Analytics Components (`src/components/analytics/`)
- **`pnl-tracker.tsx`**: Comprehensive P&L tracking with historical charts and position breakdown
- **`portfolio-overview.tsx`**: Portfolio-wide analysis with allocation charts and risk metrics

#### Strategy Components (`src/components/strategy/`)
- **`strategy-dashboard.tsx`**: Central strategy management with recommendations
- **`rebalance-modal.tsx`**: Smart rebalancing interface with cost-benefit analysis
- **`limit-order-modal.tsx`**: Limit order creation using DLMM bin infrastructure

#### Chart Components (`src/components/charts/`)
- **`bin-chart.tsx`**: Interactive bin liquidity visualization with zoom/pan
- **`price-chart.tsx`**: Historical price and volume charts with multiple timeframes

### State Management Pattern
- **Custom Hooks**: React hooks with real-time data fetching and polling
  - `useUserPositions()`: Position data with 30s auto-refresh and last update tracking
  - `usePoolData()`: Pool and bin data with 60s auto-refresh
  - `useSwapQuote()`: Real-time price quotes with 5s updates and debouncing
  - `useWalletIntegration()`: Transaction sending and signing
- **Zustand**: Lightweight state management for global app state
- **Real-time Updates**: Configurable polling intervals with automatic cleanup
- **Polling Control**: Enable/disable real-time updates per hook with `enableRealtime` parameter

### Environment Configuration

#### Required Environment Variables
```bash
# Network configuration (devnet for development, mainnet-beta for production)
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com

# Optional API configuration  
NEXT_PUBLIC_API_BASE_URL=https://api.saros.finance
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

#### Network Switching Logic
- **Development**: Automatically uses devnet
- **Production**: Uses mainnet-beta
- **RPC Endpoints**: Configurable via environment variables with fallbacks

## Development Patterns

### Testing Infrastructure
- **Framework**: Jest with React Testing Library
- **Coverage**: Comprehensive test suite with 80%+ coverage thresholds
- **Test Types**: Unit tests, integration tests, hook testing, utility functions
- **Commands**: `npm test`, `npm run test:watch`, `npm run test:coverage`
- **Files**: Tests located in `/tests/` directory with matching source structure

### TypeScript Integration
- All components and utilities use strict TypeScript
- DLMM-specific types in `src/lib/types.ts`
- Solana Web3.js types used extensively for PublicKey handling

### Component Patterns (Phase 4 Enhanced)
- **Mobile-First Design**: Progressive web app with touch gestures and haptic feedback
- **Advanced Animations**: Framer Motion with spring physics and reduced motion support
- **Accessibility**: WCAG 2.1 AA compliance with screen reader and keyboard navigation
- **Error Boundaries**: Critical, page, and component-level error handling
- **Toast Notifications**: Rich notification system with multiple variants and positions
- **PWA Components**: Install prompts, offline indicators, and update notifications

### SDK Integration Status
- **Status**: ✅ **COMPLETED** - Full @saros-finance/dlmm-sdk integration
- **Implementation**: All methods now use real SDK calls with LiquidityBookServices
- **Features**: Real-time data polling, transaction building, error handling, and caching

### Chart and Visualization
- **Recharts**: All charts use Recharts library
- **Interactive Features**: Zoom, pan, hover tooltips on bin charts
- **Real-time Updates**: Charts update automatically as data changes
- **Responsive**: Charts adapt to different screen sizes

## Important Considerations

### Wallet Integration
- Supports multiple Solana wallets (Phantom, Solflare, Ledger)
- Graceful handling of connection/disconnection states
- Transaction signing with priority fees for faster processing
- **Testing**: Uses Phantom Wallet for development testing and validation
- **Persistence**: Wallet connections persist across page refreshes and hard refreshes

### Performance Optimizations (Phase 4 Complete)
- **Code Splitting**: Lazy loading for all major routes and components
- **React Performance**: React.memo, useMemo, useCallback throughout codebase
- **Skeleton Loading**: Progressive loading states for all UI components
- **Bundle Optimization**: Optimized bundle size with tree shaking
- **PWA Features**: Service worker caching and offline support

### Data Management Strategy
- Real-time data fetching from Saros DLMM SDK
- Intelligent caching and polling with configurable intervals
- Robust error handling with graceful fallbacks
- Type-safe data transformation and validation

### Deployment Notes
- **Live Production**: https://saros-demo.rectorspace.com/ ✅ Fully operational
- Built for Vercel deployment with automatic optimization
- All environment variables must be NEXT_PUBLIC_ prefixed for client access
- Production build includes static page generation for improved performance
- Custom domain configured with SSL/TLS encryption