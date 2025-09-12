# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Saros DLMM Position Manager** - a comprehensive Next.js application built for the [Saros DLMM Demo Challenge](https://earn.superteam.fun/listing/dlmm-demo-challenge-1). It manages Dynamic Liquidity Market Maker (DLMM) positions on Solana, featuring position tracking, analytics, automated strategies, and P&L analysis.

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

## Architecture Overview

### Core DLMM Integration (`src/lib/dlmm/`)
- **`client.ts`**: Main DLMM client wrapper around @saros-finance/dlmm-sdk
  - Currently uses mock implementations due to SDK integration issues
  - Contains all position, bin, and liquidity management methods
  - Singleton pattern with `dlmmClient` export
- **`operations.ts`**: Advanced DLMM operations (add/remove liquidity, rebalancing, limit orders)
- **`strategies.ts`**: Strategy management system with evaluation and execution logic
- **`utils.ts`**: DLMM calculations and utility functions

### Data Flow Architecture
1. **Wallet Integration**: Solana Wallet Adapter provides wallet state
2. **DLMM Client**: Fetches position and bin data via SDK (or mock data)
3. **React Hooks** (`src/hooks/`): Transform raw data into component-ready state
4. **Components**: Display data with real-time updates and user interactions

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
- **Custom Hooks**: Use React hooks for data fetching and state management
  - `useUserPositions()`: Position data and refresh methods
  - `useWalletState()`: Wallet connection state and address
  - `useWalletIntegration()`: Transaction sending and signing
- **Zustand**: Lightweight state management for global app state
- **Real-time Updates**: Polling intervals defined in `src/lib/constants.ts`

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

### TypeScript Integration
- All components and utilities use strict TypeScript
- DLMM-specific types in `src/lib/types.ts`
- Solana Web3.js types used extensively for PublicKey handling

### Component Patterns
- **Responsive Design**: Mobile-first with Tailwind CSS breakpoints  
- **shadcn/ui**: Consistent component library for UI elements
- **Error Boundaries**: Graceful error handling with fallback states
- **Loading States**: Skeleton loaders and loading indicators throughout

### SDK Integration Status
- **Current**: Mock implementations for stable deployment
- **TODO**: Replace mock methods with actual @saros-finance/dlmm-sdk calls
- **Key Files to Update**: `client.ts` has TODO comments marking integration points

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

### Performance Optimizations
- Static generation for public pages
- Optimized bundle size (<500KB gzipped)
- Lazy loading for chart components
- Efficient re-rendering with React.memo and useMemo

### Mock Data Strategy
- Mock data generators in components for development/demo
- Realistic data patterns matching expected DLMM structures  
- Easy to replace with real API calls when SDK integration is complete

### Deployment Notes
- Built for Vercel deployment with automatic optimization
- All environment variables must be NEXT_PUBLIC_ prefixed for client access
- Production build includes static page generation for improved performance