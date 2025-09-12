// Configuration constants for DLMM Position Manager

export const SOLANA_NETWORK = process.env.NODE_ENV === 'production' ? 'mainnet-beta' : 'devnet';

export const RPC_ENDPOINTS = {
  mainnet: process.env.NEXT_PUBLIC_RPC_MAINNET || 'https://api.mainnet-beta.solana.com',
  devnet: process.env.NEXT_PUBLIC_RPC_DEVNET || 'https://api.devnet.solana.com',
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