import { useCallback, useState } from 'react'
import { connectionManager } from '@/lib/connection-manager'

export interface ErrorState {
  error: Error | null
  isRetrying: boolean
  retryCount: number
  maxRetries: number
  canRetry: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface ErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  onError?: (error: Error) => void
  onRetry?: (retryCount: number) => void
  onMaxRetriesReached?: (error: Error) => void
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onRetry,
    onMaxRetriesReached
  } = options

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    maxRetries,
    canRetry: true,
    severity: 'low'
  })

  const classifyError = useCallback((error: Error): ErrorState['severity'] => {
    const message = error.message.toLowerCase()

    // Critical errors that shouldn't be retried
    if (message.includes('wallet not connected') ||
        message.includes('user rejected') ||
        message.includes('insufficient funds')) {
      return 'critical'
    }

    // High severity - connection issues
    if (message.includes('all rpc endpoints failed') ||
        message.includes('network error') ||
        message.includes('connection refused')) {
      return 'high'
    }

    // Medium severity - temporary issues
    if (message.includes('403') ||
        message.includes('429') ||
        message.includes('rate limit') ||
        message.includes('timeout')) {
      return 'medium'
    }

    // Low severity - retryable issues
    return 'low'
  }, [])

  const shouldRetry = useCallback((error: Error, retryCount: number): boolean => {
    const severity = classifyError(error)
    const message = error.message.toLowerCase()

    // Never retry critical errors
    if (severity === 'critical') return false

    // Don't retry if max retries reached
    if (retryCount >= maxRetries) return false

    // Don't retry auth errors
    if (message.includes('401') || message.includes('unauthorized')) return false

    // Don't retry if all endpoints are blacklisted
    if (message.includes('all rpc endpoints failed')) {
      // Reset blacklisted connections and allow one retry
      connectionManager.resetBlacklistedConnections()
      return retryCount === 0
    }

    return true
  }, [maxRetries, classifyError])

  const handleError = useCallback((error: Error) => {
    console.warn('[useErrorHandler] Handling error:', error.message)

    const severity = classifyError(error)
    const canRetry = shouldRetry(error, 0)

    setErrorState(prevState => ({
      ...prevState,
      error,
      severity,
      canRetry,
      retryCount: 0,
      isRetrying: false
    }))

    onError?.(error)
  }, [classifyError, shouldRetry, onError])

  const retry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    if (!errorState.canRetry || errorState.retryCount >= maxRetries) {
      console.warn('[useErrorHandler] Cannot retry - max retries reached or error not retryable')
      return null
    }

    const newRetryCount = errorState.retryCount + 1

    setErrorState(prevState => ({
      ...prevState,
      isRetrying: true,
      retryCount: newRetryCount
    }))

    onRetry?.(newRetryCount)

    try {
      // Add exponential backoff delay
      const delay = retryDelay * Math.pow(2, newRetryCount - 1)
      await new Promise(resolve => setTimeout(resolve, delay))

      console.log(`[useErrorHandler] Retry attempt ${newRetryCount}/${maxRetries}`)
      const result = await operation()

      // Success - clear error state
      setErrorState({
        error: null,
        isRetrying: false,
        retryCount: 0,
        maxRetries,
        canRetry: true,
        severity: 'low'
      })

      console.log(`[useErrorHandler] Retry ${newRetryCount} successful`)
      return result

    } catch (retryError) {
      console.error(`[useErrorHandler] Retry ${newRetryCount} failed:`, retryError)

      const canRetryAgain = shouldRetry(retryError as Error, newRetryCount)

      setErrorState(prevState => ({
        ...prevState,
        error: retryError as Error,
        isRetrying: false,
        retryCount: newRetryCount,
        canRetry: canRetryAgain,
        severity: classifyError(retryError as Error)
      }))

      if (!canRetryAgain) {
        onMaxRetriesReached?.(retryError as Error)
      }

      return null
    }
  }, [errorState, maxRetries, retryDelay, shouldRetry, classifyError, onRetry, onMaxRetriesReached])

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      maxRetries,
      canRetry: true,
      severity: 'low'
    })
  }, [maxRetries])

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: { silent?: boolean }
  ): Promise<T | null> => {
    try {
      clearError()
      const result = await operation()
      return result
    } catch (error) {
      if (!options?.silent) {
        handleError(error as Error)
      }
      return null
    }
  }, [handleError, clearError])

  return {
    errorState,
    handleError,
    retry,
    clearError,
    executeWithErrorHandling,

    // Convenience getters
    hasError: !!errorState.error,
    canRetry: errorState.canRetry,
    isRetrying: errorState.isRetrying,
    errorMessage: errorState.error?.message || null,
    severity: errorState.severity
  }
}

// Specialized hook for RPC operations
export function useRpcErrorHandler(options: ErrorHandlerOptions = {}) {
  const errorHandler = useErrorHandler({
    maxRetries: 5,
    retryDelay: 2000,
    ...options
  })

  const executeRpcCall = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName?: string
  ): Promise<T | null> => {
    console.log(`[useRpcErrorHandler] Executing RPC call: ${operationName || 'unknown'}`)

    return errorHandler.executeWithErrorHandling(async () => {
      try {
        return await operation()
      } catch (error) {
        const message = (error as Error).message

        // Add context to RPC errors
        if (message.includes('403') || message.includes('Forbidden')) {
          throw new Error(`RPC 403 Forbidden - This is expected in demo mode (${operationName || 'RPC call'})`)
        }

        if (message.includes('401') || message.includes('Unauthorized')) {
          throw new Error(`RPC 401 Unauthorized - API key required (${operationName || 'RPC call'})`)
        }

        if (message.includes('429') || message.includes('rate limit')) {
          throw new Error(`RPC Rate Limited - Too many requests (${operationName || 'RPC call'})`)
        }

        throw error
      }
    })
  }, [errorHandler])

  return {
    ...errorHandler,
    executeRpcCall
  }
}