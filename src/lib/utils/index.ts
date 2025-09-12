import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

export function getRandomColor(seed?: string): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
    '#f59e0b', '#ef4444', '#ec4899', '#84cc16'
  ]
  
  if (seed) {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return colors[Math.abs(hash) % colors.length]
  }
  
  return colors[Math.floor(Math.random() * colors.length)]
}

export function calculatePNL(
  currentValue: number,
  initialValue: number
): { amount: number; percentage: number } {
  const amount = currentValue - initialValue
  const percentage = initialValue > 0 ? amount / initialValue : 0
  
  return { amount, percentage }
}

export function calculateImpermanentLoss(
  priceRatio: number,
  initialPriceRatio: number
): number {
  if (initialPriceRatio === 0) return 0
  
  const x = priceRatio / initialPriceRatio
  const il = (2 * Math.sqrt(x)) / (1 + x) - 1
  
  return Math.abs(il)
}

export function calculateAPR(
  feesEarned: number,
  liquidityProvided: number,
  durationDays: number
): number {
  if (liquidityProvided === 0 || durationDays === 0) return 0
  
  const dailyReturn = feesEarned / liquidityProvided / durationDays
  return dailyReturn * 365
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    const decoded = Buffer.from(address, 'base64')
    return decoded.length === 32
  } catch {
    return false
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false)
}