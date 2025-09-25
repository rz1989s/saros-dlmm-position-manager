// Jest setup file
import '@testing-library/jest-dom'

// Add TextEncoder/TextDecoder for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

// Mock Solana Web3.js modules
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn(() => ({
    getAccountInfo: jest.fn(),
    getBalance: jest.fn(),
  })),
  PublicKey: jest.fn((key) => ({
    toString: () => key,
    equals: jest.fn(),
  })),
  Transaction: jest.fn(),
  TransactionInstruction: jest.fn(),
}))

// Mock Solana Wallet Adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    publicKey: null,
    connected: false,
    connecting: false,
    disconnect: jest.fn(),
    wallet: null,
    wallets: [],
    select: jest.fn(),
  }),
}))

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SOLANA_NETWORK = 'devnet'
process.env.NEXT_PUBLIC_RPC_ENDPOINT = 'https://api.devnet.solana.com'

// Mock IntersectionObserver for chart components
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Suppress console errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning') || args[0].includes('validateDOMNesting'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})