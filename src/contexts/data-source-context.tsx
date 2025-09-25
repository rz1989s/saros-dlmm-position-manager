'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
  // Initialize from localStorage with fallback to mock
  const [dataMode, setDataModeState] = useState<DataMode>('mock')

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DATA_MODE_STORAGE_KEY) as DataMode
      if (stored === 'mock' || stored === 'real') {
        setDataModeState(stored)
      }
    } catch (error) {
      console.warn('Failed to load data mode from localStorage:', error)
    }
  }, [])

  const setDataMode = (mode: DataMode) => {
    try {
      localStorage.setItem(DATA_MODE_STORAGE_KEY, mode)
      setDataModeState(mode)
      console.log(`🔄 Data mode switched to: ${mode}`)
    } catch (error) {
      console.warn('Failed to save data mode to localStorage:', error)
      setDataModeState(mode) // Still update state even if storage fails
    }
  }

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