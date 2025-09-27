'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  level?: 'page' | 'component' | 'critical'
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId: string
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId?: NodeJS.Timeout

  constructor(props: Props) {
    super(props)

    this.state = {
      hasError: false,
      errorId: this.generateErrorId()
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Error caught:', error)
    console.error('[ErrorBoundary] Error info:', errorInfo)

    this.setState({
      error,
      errorInfo,
      errorId: this.generateErrorId()
    })

    // Call the error callback if provided
    this.props.onError?.(error, errorInfo)

    // Track error for analytics
    this.trackError(error, errorInfo)

    // Auto-retry for non-critical errors after delay
    if (this.props.level !== 'critical') {
      this.resetTimeoutId = setTimeout(() => {
        this.handleRetry()
      }, 10000)
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  private trackError(error: Error, errorInfo: ErrorInfo) {
    // In a real app, send to error tracking service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: this.props.level === 'critical',
        custom_map: {
          error_boundary_level: this.props.level || 'component',
          component_stack: errorInfo.componentStack
        }
      })
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: this.generateErrorId()
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private getErrorSeverity(error: Error) {
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch') || message.includes('rpc')) {
      return 'network'
    }
    if (message.includes('403') || message.includes('forbidden')) {
      return 'rpc-forbidden'
    }
    if (message.includes('401') || message.includes('unauthorized')) {
      return 'rpc-unauthorized'
    }
    if (message.includes('rate limit') || message.includes('429')) {
      return 'rate-limit'
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'permission'
    }
    if (message.includes('wallet') || message.includes('solana')) {
      return 'wallet'
    }
    if (message.includes('chunk') || message.includes('loading')) {
      return 'loading'
    }
    if (message.includes('manifest') || message.includes('service worker')) {
      return 'pwa'
    }

    return 'unknown'
  }

  private getErrorActions(severity: string, level: string) {
    const actions = []

    if (severity === 'network') {
      actions.push({
        label: 'Retry',
        action: this.handleRetry,
        variant: 'default' as const,
        icon: RefreshCw
      })
    }

    if (severity === 'loading' || severity === 'network') {
      actions.push({
        label: 'Reload Page',
        action: this.handleReload,
        variant: 'outline' as const,
        icon: RefreshCw
      })
    }

    if (level === 'page' || level === 'critical') {
      actions.push({
        label: 'Go Home',
        action: this.handleGoHome,
        variant: 'outline' as const,
        icon: Home
      })
    } else {
      actions.push({
        label: 'Try Again',
        action: this.handleRetry,
        variant: 'default' as const,
        icon: RefreshCw
      })
    }

    return actions
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo } = this.state
      const level = this.props.level || 'component'
      const severity = error ? this.getErrorSeverity(error) : 'unknown'
      const actions = this.getErrorActions(severity, level)

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center min-h-[200px] p-4"
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <CardTitle className="text-lg">
                {level === 'critical' ? 'Critical Error' : 'Something went wrong'}
              </CardTitle>

              <CardDescription>
                {level === 'critical'
                  ? 'A critical error occurred that requires immediate attention.'
                  : level === 'page'
                  ? 'This page encountered an error and cannot be displayed.'
                  : 'This component encountered an error and cannot be displayed.'}
              </CardDescription>

              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {severity}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {level}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="text-sm text-muted-foreground text-center">
                  <p className="font-medium mb-1">Error Details:</p>
                  <p className="break-words">{error.message}</p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant}
                    onClick={action.action}
                    className="gap-2"
                  >
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                ))}
              </div>

              {this.props.showDetails && error && errorInfo && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">
                    Technical Details
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Error ID:</strong> {this.state.errorId}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1 text-xs">
                        {error.stack}
                      </pre>
                    </div>
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1 text-xs">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    return this.props.children
  }
}

// Specialized error boundaries for different contexts
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="page"
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        console.error('[PageErrorBoundary]', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({
  children,
  fallback
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <ErrorBoundary
      level="component"
      fallback={fallback}
      onError={(error, errorInfo) => {
        console.warn('[ComponentErrorBoundary]', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function CriticalErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="critical"
      showDetails={true}
      onError={(error, errorInfo) => {
        console.error('[CriticalErrorBoundary]', error, errorInfo)
        // In production, this would send to error monitoring service
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Error boundary for async components
export function AsyncErrorBoundary({
  children,
  loading = <div>Loading...</div>
}: {
  children: ReactNode
  loading?: ReactNode
}) {
  return (
    <ErrorBoundary
      level="component"
      fallback={
        <Card className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
          <p className="text-sm text-muted-foreground">
            Failed to load component
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Reload
          </Button>
        </Card>
      }
    >
      <React.Suspense fallback={loading}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  )
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryConfig?: {
    level?: 'page' | 'component' | 'critical'
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
  }
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary
      level={errorBoundaryConfig?.level || 'component'}
      fallback={errorBoundaryConfig?.fallback}
      onError={errorBoundaryConfig?.onError}
    >
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}