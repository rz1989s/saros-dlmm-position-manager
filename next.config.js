/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@saros-finance/dlmm-sdk', '@saros-finance/sdk'],
  typescript: {
    // Temporarily ignore type errors for production build (dependency conflict)
    ignoreBuildErrors: true,
  },
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