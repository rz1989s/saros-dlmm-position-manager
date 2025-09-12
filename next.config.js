/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@saros-finance/dlmm-sdk', '@saros-finance/sdk'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK || 'devnet',
  },
};

module.exports = nextConfig;