'use client'

import { Suspense, ComponentType, LazyExoticComponent, useState, useEffect } from 'react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { AnalyticsSkeleton, ChartSkeleton, StrategySkeleton } from '@/components/ui/loading-states'

interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback || <Skeleton className="h-64 w-full" />}>
      {children}
    </Suspense>
  )
}

export function LazyAnalyticsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      {children}
    </Suspense>
  )
}

export function LazyChartWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      {children}
    </Suspense>
  )
}

export function LazyStrategyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<StrategySkeleton />}>
      {children}
    </Suspense>
  )
}

interface LazyComponentProps<T extends Record<string, any> = {}> {
  component: LazyExoticComponent<ComponentType<T>>
  fallback?: React.ReactNode
  props?: T
}

export function LazyComponent<T extends Record<string, any> = {}>({
  component: Component,
  fallback,
  props
}: LazyComponentProps<T>) {
  return (
    <Suspense fallback={fallback || <Skeleton className="h-64 w-full" />}>
      <Component {...(props || {} as any)} />
    </Suspense>
  )
}

export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <Skeleton className="h-64 w-full" />}>
        <Component {...props} />
      </Suspense>
    )
  }
}

interface ProgressiveLoadingProps {
  children: React.ReactNode
  when: boolean
  fallback?: React.ReactNode
  delay?: number
}

export function ProgressiveLoading({
  children,
  when,
  fallback,
  delay = 0
}: ProgressiveLoadingProps) {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    if (when) {
      const timer = setTimeout(() => {
        setShouldLoad(true)
      }, delay)

      return () => clearTimeout(timer)
    }

    // Return undefined for the else case to satisfy TS7030
    return undefined
  }, [when, delay])

  if (when && shouldLoad) {
    return <>{children}</>
  }

  return <>{fallback || <Skeleton className="h-64 w-full" />}</>
}

export function LazyImage({
  src,
  alt,
  className,
  placeholder
}: {
  src: string
  alt: string
  className?: string
  placeholder?: string
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div className={className}>
      {!loaded && !error && (
        <Skeleton className="w-full h-full" />
      )}
      <Image
        src={src}
        alt={alt}
        width={400}
        height={300}
        className={`transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ display: loaded ? 'block' : 'none' }}
      />
      {error && placeholder && (
        <Image
          src={placeholder}
          alt={alt}
          width={400}
          height={300}
          className={className}
        />
      )}
    </div>
  )
}