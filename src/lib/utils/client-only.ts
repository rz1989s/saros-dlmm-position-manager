'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to ensure component only renders on client-side to prevent hydration mismatches
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook to safely check if we're in a browser environment
 */
export function useIsBrowser(): boolean {
  const [isBrowser, setIsBrowser] = useState(false)

  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined')
  }, [])

  return isBrowser
}

// Note: ClientOnly component moved to separate file to avoid JSX compilation issues in .ts files

/**
 * Safe localStorage access that won't throw during SSR
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false
    try {
      localStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  },

  removeItem: (key: string): boolean => {
    if (typeof window === 'undefined') return false
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Safe sessionStorage access that won't throw during SSR
 */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false
    try {
      sessionStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  },

  removeItem: (key: string): boolean => {
    if (typeof window === 'undefined') return false
    try {
      sessionStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Safely execute code only in browser environment
 */
export function runInBrowser(fn: () => void): void {
  if (typeof window !== 'undefined') {
    fn()
  }
}

/**
 * Safely get browser APIs that might not exist during SSR
 */
export function getBrowserAPI<T>(getter: () => T): T | null {
  if (typeof window === 'undefined') return null
  try {
    return getter()
  } catch {
    return null
  }
}