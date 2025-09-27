/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@saros-finance/dlmm-sdk', '@saros-finance/sdk'],
  typescript: {
    // Temporarily ignore type errors for production build (dependency conflict)
    ignoreBuildErrors: true,
  },

  // Bundle optimization
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 hours
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/solana-labs/token-list/**',
      },
      {
        protocol: 'https',
        hostname: 'static.jup.ag',
        port: '',
        pathname: '/**',
      },
    ],
  },

  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Production optimizations
    if (!dev && !isServer) {
      // Better tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Split chunks optimization
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          solana: {
            name: 'solana',
            chunks: 'all',
            test: /node_modules\/@solana/,
            priority: 30,
          },
          saros: {
            name: 'saros',
            chunks: 'all',
            test: /node_modules\/@saros-finance/,
            priority: 30,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  env: {
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK || 'devnet',
  },
};

module.exports = nextConfig;