const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test environment
  testEnvironment: 'jsdom',

  // Timeout configuration for Solana operations
  testTimeout: 30000, // 30 seconds for complex Solana operations

  // Memory optimization configuration
  maxWorkers: 2, // Reduced from 50% to prevent memory overload
  workerIdleMemoryLimit: '512MB', // Limit worker memory usage
  clearMocks: true, // Clear mocks between tests for isolation
  forceExit: true, // Force Jest to exit after all tests complete
  detectOpenHandles: true, // Detect handles that prevent Jest from exiting cleanly

  // Performance configuration for memory efficiency
  cache: false, // Disable Jest cache to prevent memory accumulation
  logHeapUsage: false, // Disable heap usage logging to reduce overhead

  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Test patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}'
  ],

  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/page.tsx',
    '!src/app/**/layout.tsx',
    '!src/components/ui/**', // Skip shadcn/ui components
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)