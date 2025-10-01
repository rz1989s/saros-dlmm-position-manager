/**
 * Real-Time Price Fetching Utility
 * Fetches current market prices for tokens from multiple sources
 * Used to provide realistic pricing in demos and mock data
 */

export interface TokenPrice {
  symbol: string
  price: number
  source: 'coingecko' | 'jupiter' | 'fallback'
  timestamp: Date
}

// CoinGecko API IDs for tokens
const COINGECKO_IDS: Record<string, string> = {
  'SOL': 'solana',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'RAY': 'raydium',
  'ORCA': 'orca',
  'JUP': 'jupiter-exchange-solana',
  'MNGO': 'mango-markets'
}

// Fallback prices (used if all APIs fail)
const FALLBACK_PRICES: Record<string, number> = {
  'SOL': 165.45,
  'USDC': 1.00,
  'USDT': 1.00,
  'BTC': 67000,
  'ETH': 3500,
  'RAY': 3.82,
  'ORCA': 4.67,
  'JUP': 1.15,
  'MNGO': 0.025
}

// Price cache (1 minute TTL)
interface CachedPrice {
  price: number
  timestamp: number
}

const priceCache = new Map<string, CachedPrice>()
const CACHE_TTL = 60000 // 1 minute

/**
 * Fetch real-time price from CoinGecko API
 */
async function fetchFromCoinGecko(symbol: string): Promise<number | null> {
  const coinId = COINGECKO_IDS[symbol]
  if (!coinId) return null

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }
    )

    if (!response.ok) {
      console.warn(`CoinGecko API returned ${response.status} for ${symbol}`)
      return null
    }

    const data = await response.json()
    const price = data[coinId]?.usd

    if (typeof price === 'number' && price > 0) {
      return price
    }

    return null
  } catch (error) {
    console.warn(`Failed to fetch ${symbol} price from CoinGecko:`, error)
    return null
  }
}

/**
 * Fetch multiple prices in parallel
 */
async function fetchMultiplePrices(symbols: string[]): Promise<Map<string, number>> {
  const prices = new Map<string, number>()

  // Build CoinGecko IDs query
  const coinIds = symbols
    .map(s => COINGECKO_IDS[s])
    .filter(Boolean)
    .join(',')

  if (!coinIds) {
    // No valid CoinGecko IDs, return fallbacks
    symbols.forEach(symbol => {
      prices.set(symbol, FALLBACK_PRICES[symbol] || 1)
    })
    return prices
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(8000) // 8 second timeout for batch
      }
    )

    if (response.ok) {
      const data = await response.json()

      symbols.forEach(symbol => {
        const coinId = COINGECKO_IDS[symbol]
        if (coinId && data[coinId]?.usd) {
          prices.set(symbol, data[coinId].usd)
        } else {
          // Use fallback for this symbol
          prices.set(symbol, FALLBACK_PRICES[symbol] || 1)
        }
      })
    } else {
      // API failed, use all fallbacks
      symbols.forEach(symbol => {
        prices.set(symbol, FALLBACK_PRICES[symbol] || 1)
      })
    }
  } catch (error) {
    console.warn('Failed to fetch batch prices from CoinGecko:', error)
    // Use fallbacks
    symbols.forEach(symbol => {
      prices.set(symbol, FALLBACK_PRICES[symbol] || 1)
    })
  }

  return prices
}

/**
 * Get real-time price for a token (with caching)
 */
export async function getRealTimePrice(symbol: string): Promise<TokenPrice> {
  // Check cache first
  const cached = priceCache.get(symbol)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      symbol,
      price: cached.price,
      source: 'coingecko',
      timestamp: new Date(cached.timestamp)
    }
  }

  // Try to fetch from CoinGecko
  const price = await fetchFromCoinGecko(symbol)

  if (price !== null) {
    // Cache the result
    priceCache.set(symbol, {
      price,
      timestamp: Date.now()
    })

    return {
      symbol,
      price,
      source: 'coingecko',
      timestamp: new Date()
    }
  }

  // Use fallback price
  const fallbackPrice = FALLBACK_PRICES[symbol] || 1

  return {
    symbol,
    price: fallbackPrice,
    source: 'fallback',
    timestamp: new Date()
  }
}

/**
 * Get real-time prices for multiple tokens at once (more efficient)
 */
export async function getRealTimePrices(symbols: string[]): Promise<Map<string, TokenPrice>> {
  const result = new Map<string, TokenPrice>()

  // Check cache for all symbols
  const uncachedSymbols: string[] = []
  const now = Date.now()

  symbols.forEach(symbol => {
    const cached = priceCache.get(symbol)
    if (cached && now - cached.timestamp < CACHE_TTL) {
      result.set(symbol, {
        symbol,
        price: cached.price,
        source: 'coingecko',
        timestamp: new Date(cached.timestamp)
      })
    } else {
      uncachedSymbols.push(symbol)
    }
  })

  // If all prices are cached, return immediately
  if (uncachedSymbols.length === 0) {
    return result
  }

  // Fetch uncached prices
  const prices = await fetchMultiplePrices(uncachedSymbols)

  // Update cache and result
  prices.forEach((price, symbol) => {
    priceCache.set(symbol, {
      price,
      timestamp: now
    })

    result.set(symbol, {
      symbol,
      price,
      source: price === FALLBACK_PRICES[symbol] ? 'fallback' : 'coingecko',
      timestamp: new Date(now)
    })
  })

  return result
}

/**
 * Clear price cache (useful for forcing refresh)
 */
export function clearPriceCache(): void {
  priceCache.clear()
}

/**
 * Get cache statistics
 */
export function getPriceCacheStats() {
  return {
    size: priceCache.size,
    symbols: Array.from(priceCache.keys()),
    oldestEntry: Math.min(...Array.from(priceCache.values()).map(v => v.timestamp))
  }
}
