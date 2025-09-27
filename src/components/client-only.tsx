'use client'

import React from 'react'
import { useIsClient } from '@/lib/utils/client-only'

/**
 * Component wrapper that only renders children on client-side
 */
interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isClient = useIsClient()

  if (!isClient) {
    return <>{fallback}</>
  }

  return <>{children}</>
}