'use client'

import React, { useEffect, useRef } from 'react'
import { useJudgeMode } from '@/contexts/judge-mode-context'
import { FeatureInfo } from './feature-identifier'
import { cn } from '@/lib/utils'

interface FeatureOverlayProps {
  feature: FeatureInfo
  children: React.ReactNode
  highlightColor?: 'blue' | 'green' | 'yellow' | 'red'
  showLabel?: boolean
  className?: string
}

export function FeatureOverlay({
  feature,
  children,
  highlightColor = 'blue',
  showLabel = true,
  className,
}: FeatureOverlayProps) {
  const { isJudgeMode, registerFeature, unregisterFeature } = useJudgeMode()
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isJudgeMode) {
      registerFeature(feature.id)
    } else {
      unregisterFeature(feature.id)
    }

    return () => {
      unregisterFeature(feature.id)
    }
  }, [isJudgeMode, feature.id, registerFeature, unregisterFeature])

  const colorClasses = {
    blue: 'border-blue-500 bg-blue-500/10 shadow-blue-500/20',
    green: 'border-green-500 bg-green-500/10 shadow-green-500/20',
    yellow: 'border-yellow-500 bg-yellow-500/10 shadow-yellow-500/20',
    red: 'border-red-500 bg-red-500/10 shadow-red-500/20',
  }

  const statusColors = {
    completed: 'green',
    partial: 'yellow',
    planned: 'red',
  } as const

  const effectiveColor = highlightColor !== 'blue' ? highlightColor : (statusColors[feature.status] as 'green' | 'yellow' | 'red' | 'blue') || 'blue'

  if (!isJudgeMode) {
    return <>{children}</>
  }

  return (
    <div
      ref={overlayRef}
      className={cn(
        'relative transition-all duration-300',
        className
      )}
    >
      {children}

      {/* Overlay highlight */}
      <div
        className={cn(
          'absolute inset-0 rounded-lg border-2 border-dashed pointer-events-none transition-all duration-300',
          'animate-pulse shadow-lg',
          colorClasses[effectiveColor]
        )}
        style={{
          zIndex: 1000,
        }}
      />

      {/* Feature label */}
      {showLabel && (
        <div
          className={cn(
            'absolute -top-8 left-0 z-[1001] px-2 py-1 rounded text-xs font-mono font-semibold',
            'bg-white border shadow-sm whitespace-nowrap',
            effectiveColor === 'green' && 'text-green-700 border-green-200',
            effectiveColor === 'yellow' && 'text-yellow-700 border-yellow-200',
            effectiveColor === 'red' && 'text-red-700 border-red-200',
            effectiveColor === 'blue' && 'text-blue-700 border-blue-200'
          )}
        >
          SDK #{feature.id}: {feature.name}
        </div>
      )}
    </div>
  )
}

// Hook to automatically register features when components mount
export function useFeatureRegistration(feature: FeatureInfo) {
  const { isJudgeMode, registerFeature, unregisterFeature } = useJudgeMode()

  useEffect(() => {
    if (isJudgeMode) {
      registerFeature(feature.id)
    }

    return () => {
      unregisterFeature(feature.id)
    }
  }, [isJudgeMode, feature.id, registerFeature, unregisterFeature])
}