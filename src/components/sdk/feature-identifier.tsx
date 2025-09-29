'use client'

import React from 'react'
import { FeatureBadge } from '@/components/ui/feature-badge'
import { FeatureTooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type FeatureStatus = "completed" | "partial" | "planned"

export interface FeatureInfo {
  id: number
  name: string
  status: FeatureStatus
  sdkLocation?: string
  description?: string
}

interface FeatureIdentifierProps {
  feature: FeatureInfo
  children: React.ReactNode
  showBadge?: boolean
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className?: string
}

export function FeatureIdentifier({
  feature,
  children,
  showBadge = true,
  badgePosition = 'top-right',
  className,
}: FeatureIdentifierProps) {
  const badgePositionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  }

  return (
    <div className={cn('relative', className)}>
      {children}
      {showBadge && (
        <FeatureTooltip
          featureId={feature.id}
          featureName={feature.name}
          status={feature.status}
          sdkLocation={feature.sdkLocation}
          description={feature.description}
        >
          <div className={cn(
            'absolute z-10 cursor-help',
            badgePositionClasses[badgePosition]
          )}>
            <FeatureBadge
              featureId={feature.id}
              featureName={feature.name}
              status={feature.status}
              compact
            />
          </div>
        </FeatureTooltip>
      )}
    </div>
  )
}

// Higher-order component version for easy wrapping
export function withFeatureIdentifier<P extends object>(
  Component: React.ComponentType<P>,
  feature: FeatureInfo,
  options?: Pick<FeatureIdentifierProps, 'showBadge' | 'badgePosition' | 'className'>
) {
  const WrappedComponent = (props: P) => (
    <FeatureIdentifier feature={feature} {...options}>
      <Component {...props} />
    </FeatureIdentifier>
  )

  WrappedComponent.displayName = `withFeatureIdentifier(${Component.displayName || Component.name})`

  return WrappedComponent
}