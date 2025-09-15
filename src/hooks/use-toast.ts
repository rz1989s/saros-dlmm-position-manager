'use client'

import * as React from 'react'
import type {
  ToastActionElement,
  ToastProps,
} from '@/components/ui/toast'

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info' | 'loading'
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  showIcon?: boolean
  persistent?: boolean
  onAction?: () => void
  onDismiss?: () => void
}

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  CLEAR_TOASTS: 'CLEAR_TOASTS',
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType['ADD_TOAST']
      toast: ToasterToast
    }
  | {
      type: ActionType['UPDATE_TOAST']
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType['DISMISS_TOAST']
      toastId?: ToasterToast['id']
    }
  | {
      type: ActionType['REMOVE_TOAST']
      toastId?: ToasterToast['id']
    }
  | {
      type: ActionType['CLEAR_TOASTS']
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case 'DISMISS_TOAST': {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }

    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }

    case 'CLEAR_TOASTS':
      state.toasts.forEach((toast) => {
        if (toastTimeouts.has(toast.id)) {
          clearTimeout(toastTimeouts.get(toast.id))
          toastTimeouts.delete(toast.id)
        }
      })
      return {
        ...state,
        toasts: [],
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, 'id'>

// Enhanced toast function with better API
function toast({
  title,
  description,
  variant = 'default',
  duration = 5000,
  position = 'top-right',
  showIcon = true,
  persistent = false,
  action,
  onAction,
  onDismiss,
  ...props
}: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    })

  const dismiss = () => {
    dispatch({
      type: 'DISMISS_TOAST',
      toastId: id,
    })
    onDismiss?.()
  }

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      title,
      description,
      variant,
      duration: persistent ? undefined : duration,
      position,
      showIcon,
      action,
      onAction,
      onDismiss: dismiss,
      open: true,
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

// Convenience methods for different toast types
toast.success = (
  title: React.ReactNode,
  description?: React.ReactNode,
  options?: Omit<ToasterToast, 'title' | 'description' | 'variant'>
) =>
  toast({
    title: title as any,
    description: description as any,
    variant: 'success',
    ...options,
  })

toast.error = (
  title: React.ReactNode,
  description?: React.ReactNode,
  options?: Omit<ToasterToast, 'title' | 'description' | 'variant'>
) =>
  toast({
    title: title as any,
    description: description as any,
    variant: 'destructive',
    ...options,
  })

toast.warning = (
  title: React.ReactNode,
  description?: React.ReactNode,
  options?: Omit<ToasterToast, 'title' | 'description' | 'variant'>
) =>
  toast({
    title: title as any,
    description: description as any,
    variant: 'warning',
    ...options,
  })

toast.info = (
  title: React.ReactNode,
  description?: React.ReactNode,
  options?: Omit<ToasterToast, 'title' | 'description' | 'variant'>
) =>
  toast({
    title: title as any,
    description: description as any,
    variant: 'info',
    ...options,
  })

toast.loading = (
  title: React.ReactNode,
  description?: React.ReactNode,
  options?: Omit<ToasterToast, 'title' | 'description' | 'variant'>
) =>
  toast({
    title: title as any,
    description: description as any,
    variant: 'loading',
    persistent: true,
    ...options,
  })

// Promise-based toast for async operations
toast.promise = <T>(
  promise: Promise<T>,
  {
    loading: loadingOptions,
    success: successOptions,
    error: errorOptions,
  }: {
    loading: { title: React.ReactNode; description?: React.ReactNode }
    success:
      | { title: React.ReactNode; description?: React.ReactNode }
      | ((data: T) => { title: React.ReactNode; description?: React.ReactNode })
    error:
      | { title: React.ReactNode; description?: React.ReactNode }
      | ((error: any) => { title: React.ReactNode; description?: React.ReactNode })
  }
) => {
  const loadingToast = toast.loading(loadingOptions.title, loadingOptions.description)

  promise
    .then((data) => {
      const options = typeof successOptions === 'function' ? successOptions(data) : successOptions
      loadingToast.update({
        ...options,
        variant: 'success',
        persistent: false,
        duration: 5000,
      } as any)
    })
    .catch((error) => {
      const options = typeof errorOptions === 'function' ? errorOptions(error) : errorOptions
      loadingToast.update({
        ...options,
        variant: 'destructive',
        persistent: false,
        duration: 5000,
      } as any)
    })

  return loadingToast
}

// Clear all toasts
toast.dismiss = (toastId?: string) => {
  dispatch({
    type: 'DISMISS_TOAST',
    toastId,
  })
}

toast.clear = () => {
  dispatch({
    type: 'CLEAR_TOASTS',
  })
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: toast.dismiss,
    clear: toast.clear,
  }
}

// Hook for toast queue management
export function useToastQueue() {
  const { toasts } = useToast()

  const getToastsByPosition = (position: ToasterToast['position'] = 'top-right') => {
    return toasts.filter(toast => toast.position === position)
  }

  const getToastCount = () => toasts.length

  const getToastsByVariant = (variant: ToasterToast['variant']) => {
    return toasts.filter(toast => toast.variant === variant)
  }

  return {
    toasts,
    getToastsByPosition,
    getToastCount,
    getToastsByVariant,
  }
}

// Hook for enhanced toast patterns
export function useEnhancedToast() {
  const { toast: baseToast } = useToast()

  // Transaction toast pattern
  const transactionToast = (
    operation: Promise<any>,
    {
      pending = 'Transaction pending...',
      success = 'Transaction successful!',
      error = 'Transaction failed',
    }: {
      pending?: string
      success?: string | ((result: any) => string)
      error?: string | ((error: any) => string)
    } = {}
  ) => {
    return baseToast.promise(operation, {
      loading: { title: 'Processing Transaction', description: pending },
      success: (result) => ({
        title: 'Transaction Complete',
        description: typeof success === 'function' ? success(result) : success,
      }),
      error: (error) => ({
        title: 'Transaction Failed',
        description: typeof error === 'function' ? error(error) : error,
      }),
    })
  }

  // Position update toast
  const positionUpdateToast = (action: string, success: boolean, details?: string) => {
    if (success) {
      baseToast.success(`Position ${action}`, details)
    } else {
      baseToast.error(`Failed to ${action.toLowerCase()} position`, details)
    }
  }

  // Strategy notification toast
  const strategyToast = (
    type: 'executed' | 'failed' | 'triggered',
    strategyName: string,
    details?: string
  ) => {
    const messages = {
      executed: { title: 'Strategy Executed', variant: 'success' as const },
      failed: { title: 'Strategy Failed', variant: 'destructive' as const },
      triggered: { title: 'Strategy Triggered', variant: 'info' as const },
    }

    const { title, variant } = messages[type]
    baseToast({
      title,
      description: `${strategyName}${details ? `: ${details}` : ''}`,
      variant,
    })
  }

  // Network status toast
  const networkToast = (isOnline: boolean) => {
    if (isOnline) {
      baseToast.success('Back Online', 'Connection restored')
    } else {
      baseToast.warning('Connection Lost', 'Working in offline mode')
    }
  }

  return {
    toast: baseToast,
    transactionToast,
    positionUpdateToast,
    strategyToast,
    networkToast,
  }
}