// Configuration constants for DLMM Position Manager

// Force mainnet-beta always - devnet has no real DLMM pools
export const SOLANA_NETWORK = 'mainnet-beta';

// Multiple RPC endpoints for fallback and load balancing
export const RPC_ENDPOINTS = {
  mainnet: process.env.NEXT_PUBLIC_RPC_MAINNET || 'https://solana-rpc.publicnode.com',
  fallbacks: [
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.syndica.io/access-token/your-token-here',
    'https://rpc.ankr.com/solana',
    'https://solana.blockdaemon.com',
    'https://solana-mainnet.rpc.extrnode.com'
  ]
};

// RPC Configuration for rate limiting and retries
export const RPC_CONFIG = {
  maxRetries: 5,
  retryDelayMs: 1000,
  timeoutMs: 30000,
  rateLimit: {
    requestsPerSecond: 10,
    burstLimit: 20
  }
};

export const REFRESH_INTERVALS = {
  positions: 30000, // 30 seconds
  prices: 5000,     // 5 seconds
  analytics: 60000, // 1 minute
};

export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const DEFAULT_PRIORITY_FEE = 0.0001; // SOL

export const UI_CONFIG = {
  maxPositionsPerPage: 10,
  chartUpdateInterval: 1000,
  animationDuration: 300,
};