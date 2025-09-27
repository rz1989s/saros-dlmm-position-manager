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
    getAccountInfo: jest.fn().mockResolvedValue(null),
    getBalance: jest.fn().mockResolvedValue(1000000000),
    getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: 'test', lastValidBlockHeight: 123 }),
    sendTransaction: jest.fn().mockResolvedValue('test-signature'),
    confirmTransaction: jest.fn().mockResolvedValue({ value: { err: null } }),
  })),
  PublicKey: jest.fn((key) => ({
    toString: () => key,
    equals: jest.fn(),
    toBase58: () => key,
  })),
  Transaction: jest.fn(),
  TransactionInstruction: jest.fn(),
  SystemProgram: {
    transfer: jest.fn(),
  },
  LAMPORTS_PER_SOL: 1000000000,
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

// Mock @saros-finance/dlmm-sdk
jest.mock('@saros-finance/dlmm-sdk', () => ({
  DLMM: jest.fn(() => ({
    getLbPair: jest.fn().mockResolvedValue({
      pubkey: 'test-pair-key',
      account: {
        tokenX: 'test-token-x',
        tokenY: 'test-token-y',
        binStep: 100,
        activeBin: { binId: 0, liquidityX: '0', liquidityY: '0', price: 0 },
      }
    }),
    getUserPositions: jest.fn().mockResolvedValue([]),
    getBinArrayInfo: jest.fn().mockResolvedValue([]),
    getBinReserves: jest.fn().mockResolvedValue({ binIdToReserve: new Map() }),
    addLiquidityToPosition: jest.fn().mockResolvedValue({ ixs: [], luts: [] }),
    removeMultipleLiquidity: jest.fn().mockResolvedValue({ ixs: [], luts: [] }),
    initializePositionAndAddLiquidity: jest.fn().mockResolvedValue({ ixs: [], luts: [] }),
    getConnection: jest.fn(),
  })),
  getAllLbPairs: jest.fn().mockResolvedValue([]),
}))

// Mock @coral-xyz/anchor
jest.mock('@coral-xyz/anchor', () => ({
  BN: jest.fn((value) => ({
    toString: () => value?.toString() || '0',
    toNumber: () => Number(value) || 0,
    add: jest.fn().mockReturnThis(),
    sub: jest.fn().mockReturnThis(),
    mul: jest.fn().mockReturnThis(),
    div: jest.fn().mockReturnThis(),
    eq: jest.fn(() => true),
    gt: jest.fn(() => false),
    lt: jest.fn(() => false),
    gte: jest.fn(() => true),
    lte: jest.fn(() => true),
  })),
  Program: jest.fn(),
  AnchorProvider: jest.fn(),
  web3: {
    PublicKey: jest.fn(),
    Connection: jest.fn(),
  },
}))

// Mock Node.js crypto for browser environment
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    },
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  },
})

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
)

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

// Mock timers for interval-based operations
jest.useFakeTimers()

// Suppress console errors in tests but allow explicit error testing
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning') ||
       args[0].includes('validateDOMNesting') ||
       args[0].includes('Failed to fetch pool data') ||
       args[0].includes('Arbitrage monitoring error'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  jest.useRealTimers()
})

// Global test cleanup
afterEach(() => {
  jest.clearAllMocks()
  jest.clearAllTimers()
})