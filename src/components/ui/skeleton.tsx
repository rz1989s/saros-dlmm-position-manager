'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  )
}

export function SkeletonText({
  className,
  lines = 1,
  ...props
}: SkeletonProps & { lines?: number }) {
  if (lines === 1) {
    return <Skeleton className={cn('h-4', className)} {...props} />
  }

  return (
    <div className="space-y-2" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && 'w-3/4',
            className
          )}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({
  className,
  children,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-6 space-y-3',
        className
      )}
      {...props}
    >
      {children || (
        <>
          <SkeletonText className="w-1/2" />
          <SkeletonText lines={2} />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </>
      )}
    </div>
  )
}

export function SkeletonChart({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      <Skeleton className="h-4 w-32" />
      <div className="relative h-64 rounded border bg-muted/20">
        <Skeleton className="absolute inset-4" />
        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-2 w-2 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({
  rows = 3,
  columns = 4,
  className,
  ...props
}: SkeletonProps & { rows?: number; columns?: number }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn(
                'h-4 flex-1',
                colIndex === 0 && 'w-24 flex-none',
                colIndex === columns - 1 && 'w-16 flex-none'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}