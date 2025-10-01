'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useJudgeMode } from '@/contexts/judge-mode-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  ChevronDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Wifi,
  WifiOff
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SDKCall {
  id: string
  method: string
  endpoint: string
  timestamp: Date
  duration?: number
  status: 'pending' | 'success' | 'error'
  error?: string
  response?: any
  params?: any
}

interface SDKCallLoggerProps {
  maxLogs?: number
  className?: string
}

// Global store for SDK calls
let globalSDKCalls: SDKCall[] = []
let globalListeners: Set<(calls: SDKCall[]) => void> = new Set()

// Function to add a new SDK call
export function logSDKCall(call: Omit<SDKCall, 'id' | 'timestamp'>): SDKCall {
  const newCall: SDKCall = {
    ...call,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date()
  }

  globalSDKCalls = [newCall, ...globalSDKCalls.slice(0, 99)] // Keep last 100 calls
  globalListeners.forEach(listener => listener([...globalSDKCalls]))
  return newCall
}

// Function to update an existing SDK call
export function updateSDKCall(id: string, updates: Partial<SDKCall>) {
  globalSDKCalls = globalSDKCalls.map(call =>
    call.id === id ? { ...call, ...updates } : call
  )
  globalListeners.forEach(listener => listener([...globalSDKCalls]))
}

// Hook to listen to SDK calls
function useSDKCalls() {
  const [calls, setCalls] = useState<SDKCall[]>([...globalSDKCalls])

  useEffect(() => {
    globalListeners.add(setCalls)
    return () => {
      globalListeners.delete(setCalls)
    }
  }, [])

  const clearCalls = () => {
    globalSDKCalls = []
    globalListeners.forEach(listener => listener([]))
  }

  return { calls, clearCalls }
}

export function SDKCallLogger({ maxLogs = 50, className }: SDKCallLoggerProps) {
  const { isJudgeMode } = useJudgeMode()
  const { calls, clearCalls } = useSDKCalls()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to top when new calls come in
  useEffect(() => {
    if (scrollRef.current && calls.length > 0) {
      scrollRef.current.scrollTop = 0
    }
  }, [calls.length])

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(navigator.onLine)
    }

    window.addEventListener('online', checkConnection)
    window.addEventListener('offline', checkConnection)

    return () => {
      window.removeEventListener('online', checkConnection)
      window.removeEventListener('offline', checkConnection)
    }
  }, [])

  if (!isJudgeMode) {
    return null
  }

  const recentCalls = calls.slice(0, maxLogs)
  const pendingCalls = recentCalls.filter(call => call.status === 'pending').length
  const successCalls = recentCalls.filter(call => call.status === 'success').length
  const errorCalls = recentCalls.filter(call => call.status === 'error').length

  const formatDuration = (duration?: number) => {
    if (!duration) return '--'
    return `${duration}ms`
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + '.' + timestamp.getMilliseconds().toString().padStart(3, '0')
  }

  const getStatusIcon = (status: SDKCall['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-500 animate-pulse" />
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />
    }
  }

  const getStatusColor = (status: SDKCall['status']) => {
    switch (status) {
      case 'pending':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'success':
        return 'border-l-green-500 bg-green-50'
      case 'error':
        return 'border-l-red-500 bg-red-50'
    }
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-[9998] transition-all duration-300',
        isExpanded ? 'w-96 h-80' : 'w-auto h-auto',
        className
      )}
    >
      {!isExpanded && (
        <Button
          onClick={() => setIsExpanded(true)}
          size="sm"
          className="bg-gray-800 hover:bg-gray-700 text-white shadow-lg flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          <span className="text-xs">SDK Calls</span>
          {pendingCalls > 0 && (
            <Badge className="bg-yellow-500 text-white h-4 text-xs px-1">
              {pendingCalls}
            </Badge>
          )}
          {isConnected ? (
            <Wifi className="h-3 w-3 text-green-400" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-400" />
          )}
        </Button>
      )}

      {isExpanded && (
        <Card className="shadow-xl border-2 border-gray-300 bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-600" />
                SDK Call Logger
                {isConnected ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  onClick={clearCalls}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  title="Clear logs"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <Button
                  onClick={() => setIsExpanded(false)}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{successCalls} success</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>{pendingCalls} pending</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>{errorCalls} error</span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div
              ref={scrollRef}
              className="h-56 overflow-y-auto space-y-2 text-xs"
            >
              {recentCalls.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No SDK calls logged yet
                </div>
              ) : (
                recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className={cn(
                      'border-l-4 p-2 rounded-r bg-white border',
                      getStatusColor(call.status)
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(call.status)}
                        <span className="font-mono font-semibold">
                          {call.method}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{formatTime(call.timestamp)}</span>
                        <span>{formatDuration(call.duration)}</span>
                      </div>
                    </div>

                    <div className="text-muted-foreground truncate">
                      {call.endpoint}
                    </div>

                    {call.error && (
                      <div className="text-red-600 mt-1 text-xs">
                        Error: {call.error}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Utility function to wrap fetch calls with logging
export function createSDKCallWrapper() {
  const originalFetch = window.fetch

  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const method = init?.method || 'GET'

    const call = logSDKCall({
      method,
      endpoint: url,
      status: 'pending',
      params: init?.body ? JSON.stringify(init.body) : undefined
    })

    const startTime = Date.now()

    try {
      const response = await originalFetch(input, init)
      const duration = Date.now() - startTime

      updateSDKCall(call.id, {
        status: response.ok ? 'success' : 'error',
        duration,
        error: response.ok ? undefined : `${response.status} ${response.statusText}`
      })

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      updateSDKCall(call.id, {
        status: 'error',
        duration,
        error: error instanceof Error ? error.message : 'Network error'
      })

      throw error
    }
  }

  return originalFetch
}