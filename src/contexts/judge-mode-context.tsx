'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface JudgeModeContextType {
  isJudgeMode: boolean
  setJudgeMode: (enabled: boolean) => void
  toggleJudgeMode: () => void
  visibleFeatures: Set<number>
  registerFeature: (featureId: number) => void
  unregisterFeature: (featureId: number) => void
}

const JudgeModeContext = createContext<JudgeModeContextType | undefined>(undefined)

interface JudgeModeProviderProps {
  children: React.ReactNode
}

export function JudgeModeProvider({ children }: JudgeModeProviderProps) {
  const [isJudgeMode, setIsJudgeMode] = useState(false)
  const [visibleFeatures, setVisibleFeatures] = useState<Set<number>>(new Set())

  // Load judge mode state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('judge-mode')
      if (savedMode === 'true') {
        setIsJudgeMode(true)
      }
    }
  }, [])

  // Save judge mode state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('judge-mode', isJudgeMode.toString())
    }
  }, [isJudgeMode])

  const setJudgeMode = (enabled: boolean) => {
    setIsJudgeMode(enabled)
  }

  const toggleJudgeMode = () => {
    setIsJudgeMode(!isJudgeMode)
  }

  const registerFeature = (featureId: number) => {
    setVisibleFeatures(prev => new Set(prev).add(featureId))
  }

  const unregisterFeature = (featureId: number) => {
    setVisibleFeatures(prev => {
      const next = new Set(prev)
      next.delete(featureId)
      return next
    })
  }

  const value: JudgeModeContextType = {
    isJudgeMode,
    setJudgeMode,
    toggleJudgeMode,
    visibleFeatures,
    registerFeature,
    unregisterFeature,
  }

  return (
    <JudgeModeContext.Provider value={value}>
      {children}
    </JudgeModeContext.Provider>
  )
}

export function useJudgeMode() {
  const context = useContext(JudgeModeContext)
  if (context === undefined) {
    throw new Error('useJudgeMode must be used within a JudgeModeProvider')
  }
  return context
}