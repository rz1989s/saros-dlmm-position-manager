'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { safeLocalStorage } from '@/lib/utils/client-only'

export type DataMode = 'mock' | 'real'

interface DataSourceContextType {
  dataMode: DataMode
  setDataMode: (mode: DataMode) => void
  isRealDataMode: boolean
  isMockDataMode: boolean
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined)

interface DataSourceProviderProps {
  children: ReactNode
}

const DATA_MODE_STORAGE_KEY = 'saros-data-mode'

export function DataSourceProvider({ children }: DataSourceProviderProps) {
  // Initialize with default to prevent hydration mismatch
  const [dataMode, setDataModeState] = useState<DataMode>('mock')
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    const stored = safeLocalStorage.getItem(DATA_MODE_STORAGE_KEY) as DataMode | null
    if (stored === 'mock' || stored === 'real') {
      setDataModeState(stored)
    }
    setIsHydrated(true)
  }, [])

  const setDataMode = (mode: DataMode) => {
    const success = safeLocalStorage.setItem(DATA_MODE_STORAGE_KEY, mode)
    if (!success) {
      console.warn('Failed to save data mode to localStorage')
    }
    setDataModeState(mode)
    console.log(`🔄 Data mode switched to: ${mode}`)
  }

  // Always return consistent value to prevent hydration mismatch
  const value: DataSourceContextType = {
    dataMode,
    setDataMode,
    isRealDataMode: dataMode === 'real',
    isMockDataMode: dataMode === 'mock'
  }

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  )
}

export function useDataSource() {
  const context = useContext(DataSourceContext)
  if (context === undefined) {
    throw new Error('useDataSource must be used within a DataSourceProvider')
  }
  return context
}

// Convenience hook for just checking data mode
export function useDataMode() {
  const { dataMode, isRealDataMode, isMockDataMode } = useDataSource()
  return { dataMode, isRealDataMode, isMockDataMode }
}