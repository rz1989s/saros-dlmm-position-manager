'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { AnimatedNumber } from '@/components/animations/animated-number'
import {
  Shield,
  Wifi,
  WifiOff,
  CheckCircle,
  Clock,
  RotateCcw,
  Activity,
  RefreshCw,
  Info,
  XCircle,
  ArrowRight
} from 'lucide-react'
import { logSDKCall, updateSDKCall } from '@/components/sdk/sdk-call-logger'

interface OracleProvider {
  id: string
  name: string
  priority: number
  isActive: boolean
  responseTime: number
  lastUpdate: number
  price: number | null
  confidence: number
  errorCount: number
  status: 'healthy' | 'degraded' | 'offline' | 'error'
  endpoint: string
}

interface FallbackEvent {
  id: string
  timestamp: number
  type: 'primary_failure' | 'fallback_triggered' | 'recovery' | 'provider_switch'
  fromProvider: string
  toProvider: string
  reason: string
  price: number | null
}

interface SystemHealth {
  overallStatus: 'healthy' | 'degraded' | 'critical'
  activeProviders: number
  totalProviders: number
  currentProvider: string
  uptime: number
  averageResponseTime: number
}

const ORACLE_PROVIDERS: Omit<OracleProvider, 'isActive' | 'responseTime' | 'lastUpdate' | 'price' | 'confidence' | 'errorCount' | 'status'>[] = [
  {
    id: 'pyth',
    name: 'Pyth Network',
    priority: 1,
    endpoint: 'pyth.network/api/v1/price'
  },
  {
    id: 'switchboard',
    name: 'Switchboard',
    priority: 2,
    endpoint: 'switchboard.xyz/api/price'
  },
  {
    id: 'chainlink',
    name: 'Chainlink',
    priority: 3,
    endpoint: 'chainlink.network/api/v1/price'
  },
  {
    id: 'orca',
    name: 'Orca TWAP',
    priority: 4,
    endpoint: 'orca.so/api/twap'
  },
  {
    id: 'jupiter',
    name: 'Jupiter API',
    priority: 5,
    endpoint: 'jup.ag/api/v1/price'
  }
]

export default function OracleFallbackDemo() {
  const [providers, setProviders] = useState<OracleProvider[]>([])
  const [fallbackEvents, setFallbackEvents] = useState<FallbackEvent[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number>(102.45)

  // Initialize providers
  const initializeProviders = useCallback(() => {
    const initialProviders: OracleProvider[] = ORACLE_PROVIDERS.map(provider => ({
      ...provider,
      isActive: Math.random() > 0.1, // 90% initial uptime
      responseTime: 500 + Math.random() * 1500,
      lastUpdate: Date.now(),
      price: 102.45 + (Math.random() - 0.5) * 0.5,
      confidence: 0.95 + Math.random() * 0.05,
      errorCount: 0,
      status: Math.random() > 0.85 ? 'degraded' : 'healthy'
    }))

    setProviders(initialProviders)
  }, [])

  // Simulate oracle behavior
  const simulateOracles = useCallback(async () => {
    const callId = logSDKCall({
      method: 'checkOracleHealth',
      endpoint: 'Oracle.healthCheck',
      status: 'pending',
      params: { providers: providers.length }
    })

    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      setProviders(prev => prev.map(provider => {
        const wasActive = provider.isActive

        // Simulate random failures and recoveries
        let newStatus = provider.status
        let isActive = provider.isActive
        let errorCount = provider.errorCount

        // Random status changes
        const statusRoll = Math.random()
        if (provider.status === 'healthy') {
          if (statusRoll < 0.02) newStatus = 'degraded'
          if (statusRoll < 0.005) { newStatus = 'offline'; isActive = false; errorCount++ }
        } else if (provider.status === 'degraded') {
          if (statusRoll < 0.1) newStatus = 'healthy'
          if (statusRoll < 0.03) { newStatus = 'offline'; isActive = false; errorCount++ }
        } else if (provider.status === 'offline') {
          if (statusRoll < 0.15) { newStatus = 'healthy'; isActive = true }
          if (statusRoll < 0.08) { newStatus = 'degraded'; isActive = true }
        }

        // Generate fallback events for status changes
        if (wasActive && !isActive) {
          const event: FallbackEvent = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            type: 'primary_failure',
            fromProvider: provider.name,
            toProvider: '',
            reason: 'Connection timeout',
            price: provider.price
          }
          setFallbackEvents(prev => [event, ...prev.slice(0, 9)])
        } else if (!wasActive && isActive) {
          const event: FallbackEvent = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            type: 'recovery',
            fromProvider: '',
            toProvider: provider.name,
            reason: 'Service restored',
            price: provider.price
          }
          setFallbackEvents(prev => [event, ...prev.slice(0, 9)])
        }

        return {
          ...provider,
          isActive,
          status: newStatus,
          errorCount,
          responseTime: provider.responseTime + (Math.random() - 0.5) * 200,
          lastUpdate: isActive ? Date.now() : provider.lastUpdate,
          price: isActive ? (provider.price || 102.45) + (Math.random() - 0.5) * 0.1 : provider.price,
          confidence: isActive ? Math.max(0.85, Math.min(0.99, provider.confidence + (Math.random() - 0.5) * 0.05)) : provider.confidence
        }
      }))

      updateSDKCall(callId.id, {
        status: 'success',
        duration: 300,
        response: { providersChecked: providers.length }
      })

    } catch (error) {
      updateSDKCall(callId.id, {
        status: 'error',
        duration: 300,
        error: 'Health check failed'
      })
    }
  }, [providers.length])

  // Calculate system health
  const calculateSystemHealth = useCallback(() => {
    if (providers.length === 0) return null

    const activeProviders = providers.filter(p => p.isActive).length
    const healthyProviders = providers.filter(p => p.status === 'healthy' && p.isActive).length

    const primaryProvider = providers
      .filter(p => p.isActive)
      .sort((a, b) => a.priority - b.priority)[0]

    const avgResponseTime = providers
      .filter(p => p.isActive)
      .reduce((sum, p) => sum + p.responseTime, 0) / Math.max(1, activeProviders)

    const uptime = activeProviders / providers.length

    let overallStatus: SystemHealth['overallStatus'] = 'healthy'
    if (activeProviders === 0 || healthyProviders === 0) {
      overallStatus = 'critical'
    } else if (activeProviders < providers.length * 0.6 || healthyProviders < activeProviders * 0.5) {
      overallStatus = 'degraded'
    }

    // Update current price from primary provider
    if (primaryProvider?.price) {
      setCurrentPrice(primaryProvider.price)
    }

    return {
      overallStatus,
      activeProviders,
      totalProviders: providers.length,
      currentProvider: primaryProvider?.name || 'None',
      uptime,
      averageResponseTime: avgResponseTime
    }
  }, [providers])

  // Auto-simulate oracle behavior
  useEffect(() => {
    if (providers.length === 0) {
      initializeProviders()
      return
    }

    const interval = setInterval(() => {
      simulateOracles()
    }, 2000)

    return () => clearInterval(interval)
  }, [providers.length, initializeProviders, simulateOracles])

  // Update system health when providers change
  useEffect(() => {
    const health = calculateSystemHealth()
    setSystemHealth(health)
  }, [providers, calculateSystemHealth])

  const handleForceFailure = useCallback((providerId: string) => {
    setProviders(prev => prev.map(provider =>
      provider.id === providerId
        ? { ...provider, isActive: false, status: 'offline', errorCount: provider.errorCount + 1 }
        : provider
    ))

    const provider = providers.find(p => p.id === providerId)
    if (provider) {
      const event: FallbackEvent = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        type: 'primary_failure',
        fromProvider: provider.name,
        toProvider: '',
        reason: 'Manual failure simulation',
        price: provider.price
      }
      setFallbackEvents(prev => [event, ...prev.slice(0, 9)])
    }
  }, [providers])

  const handleForceRecovery = useCallback((providerId: string) => {
    setProviders(prev => prev.map(provider =>
      provider.id === providerId
        ? { ...provider, isActive: true, status: 'healthy', lastUpdate: Date.now() }
        : provider
    ))

    const provider = providers.find(p => p.id === providerId)
    if (provider) {
      const event: FallbackEvent = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        type: 'recovery',
        fromProvider: '',
        toProvider: provider.name,
        reason: 'Manual recovery',
        price: provider.price
      }
      setFallbackEvents(prev => [event, ...prev.slice(0, 9)])
    }
  }, [providers])

  const getStatusIcon = (status: OracleProvider['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'degraded': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'offline': return <WifiOff className="h-4 w-4 text-red-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = (status: SystemHealth['overallStatus']) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <FeatureIdentifier
        feature={SDK_FEATURES[35] || { id: 35, name: 'Oracle Fallback Mechanisms', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Oracle Fallback Mechanisms</h1>
              <p className="text-muted-foreground">
                Multi-provider oracle system with automatic fallback and error recovery
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-orange-50 text-orange-700">
              SDK Features #7, #35, #36
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Auto Fallback
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Error Recovery
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      {/* System Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              System Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className={`text-2xl font-bold ${getStatusColor(systemHealth.overallStatus)}`}>
                  {systemHealth.overallStatus.toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground">System Status</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {systemHealth.activeProviders}/{systemHealth.totalProviders}
                </div>
                <div className="text-sm text-muted-foreground">Active Providers</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  <AnimatedNumber
                    value={systemHealth.uptime * 100}
                    suffix="%"
                    decimals={1}
                    animateOnChange={true}
                  />
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  <AnimatedNumber
                    value={systemHealth.averageResponseTime}
                    suffix="ms"
                    decimals={0}
                    animateOnChange={true}
                  />
                </div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  <AnimatedNumber
                    value={currentPrice}
                    prefix="$"
                    decimals={4}
                    animateOnChange={true}
                  />
                </div>
                <div className="text-sm text-muted-foreground">Current Price</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Primary Provider: {systemHealth.currentProvider}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Oracle Providers */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-blue-600" />
                Oracle Providers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {providers.map((provider) => (
                <motion.div
                  key={provider.id}
                  layout
                  className={`p-4 border rounded-lg transition-all ${
                    provider.isActive
                      ? provider.status === 'healthy'
                        ? 'border-green-200 bg-green-50/50'
                        : 'border-yellow-200 bg-yellow-50/50'
                      : 'border-red-200 bg-red-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(provider.status)}
                      <div>
                        <h4 className="font-semibold">{provider.name}</h4>
                        <p className="text-xs text-muted-foreground">{provider.endpoint}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          provider.priority === 1 ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        Priority {provider.priority}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {provider.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleForceFailure(provider.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Force Failure
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleForceRecovery(provider.id)}
                          className="text-green-600 hover:bg-green-50"
                        >
                          Force Recovery
                        </Button>
                      )}
                    </div>
                  </div>

                  {provider.isActive && provider.price && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <span className="ml-2 font-medium">${provider.price.toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="ml-2 font-medium">{(provider.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Response:</span>
                        <span className="ml-2 font-medium">{provider.responseTime.toFixed(0)}ms</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Errors:</span>
                        <span className="ml-2 font-medium">{provider.errorCount}</span>
                      </div>
                    </div>
                  )}

                  {!provider.isActive && (
                    <div className="text-sm text-red-600">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-3 w-3" />
                        Provider offline - fallback active
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Fallback Events & Controls */}
        <div className="space-y-6">
          {/* Fallback Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-orange-600" />
                Fallback Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fallbackEvents.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No fallback events yet
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {fallbackEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`p-3 border rounded-lg text-sm ${
                          event.type === 'recovery' ? 'border-green-200 bg-green-50' :
                          event.type === 'primary_failure' ? 'border-red-200 bg-red-50' :
                          'border-blue-200 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {event.type === 'recovery' && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />}
                          {event.type === 'primary_failure' && <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />}
                          {event.type === 'fallback_triggered' && <ArrowRight className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />}
                          {event.type === 'provider_switch' && <RotateCcw className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />}

                          <div className="flex-1">
                            <div className="font-medium">
                              {event.type === 'recovery' && `${event.toProvider} recovered`}
                              {event.type === 'primary_failure' && `${event.fromProvider} failed`}
                              {event.type === 'fallback_triggered' && `Fallback: ${event.fromProvider} → ${event.toProvider}`}
                              {event.type === 'provider_switch' && `Switched: ${event.fromProvider} → ${event.toProvider}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.reason}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SDK Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Fallback Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failover Strategy</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Priority-based
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Health Check Interval</span>
                  <span className="font-medium">2s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timeout Threshold</span>
                  <span className="font-medium">5s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recovery Attempts</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Circuit Breaker</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Enabled
                  </Badge>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Automatic fallback system ensures continuous price feeds by switching to backup oracles
                  when primary sources fail. Priority-based routing with health monitoring and recovery.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Simulation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}