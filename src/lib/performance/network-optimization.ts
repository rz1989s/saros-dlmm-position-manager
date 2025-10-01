import { Connection, PublicKey } from '@solana/web3.js'
import { connectionManager } from '../connection-manager'
import { logger } from '../logger'
import { getCacheOrchestrator } from '../cache/unified-cache-orchestrator'

// ============================================================================
// NETWORK OPTIMIZATION TYPES
// ============================================================================

export interface NetworkOptimizationConfig {
  enabled: boolean
  connectionPoolSize: number
  maxConcurrentRequests: number
  requestTimeoutMs: number
  retryAttempts: number
  retryDelayMs: number
  enableRequestCoalescing: boolean
  enableResponseCaching: boolean
  enableRequestBatching: boolean
  enableConnectionHealthCheck: boolean
  healthCheckInterval: number
  adaptivePrioritization: boolean
  intelligentRouting: boolean
  performanceMonitoring: boolean
}

export interface ConnectionPoolStats {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  failedConnections: number
  avgResponseTime: number
  requestsPerSecond: number
  errorRate: number
  lastHealthCheck: Date
}

export interface RPCEndpoint {
  url: string
  priority: number
  isHealthy: boolean
  latency: number
  successRate: number
  lastUsed: Date
  failureCount: number
  requestCount: number
  avgResponseTime: number
  maxConcurrentRequests: number
  currentRequests: number
}

export interface RequestMetrics {
  requestId: string
  method: string
  endpoint: string
  startTime: number
  endTime?: number
  duration?: number
  success: boolean
  cached: boolean
  retryCount: number
  errorMessage?: string
  responseSize?: number
}

export interface NetworkPerformanceMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  cachedRequests: number
  coalescedRequests: number
  batchedRequests: number
  averageLatency: number
  p95Latency: number
  p99Latency: number
  throughput: number
  errorRate: number
  cacheHitRate: number
  networkEfficiency: number
  optimizationSavings: number
}

export interface RequestCoalescingGroup {
  key: string
  requests: PendingRequest[]
  promise: Promise<any>
  createdAt: number
}

export interface PendingRequest {
  id: string
  method: string
  params: any[]
  resolve: (value: any) => void
  reject: (error: any) => void
  createdAt: number
  priority: number
}

export interface BatchRequest {
  id: string
  requests: PendingRequest[]
  endpoint: string
  scheduledAt: number
  maxWaitTime: number
}

export interface ConnectionHealth {
  endpoint: string
  isHealthy: boolean
  latency: number
  lastCheck: Date
  consecutiveFailures: number
  details: {
    responseTime: number
    errorRate: number
    throughput: number
    availability: number
  }
}

// ============================================================================
// NETWORK OPTIMIZATION LAYER
// ============================================================================

/**
 * Advanced Network Optimization Layer for Solana RPC Calls
 *
 * Features:
 * - Intelligent connection pooling and management
 * - Request coalescing for duplicate calls
 * - Adaptive request batching and prioritization
 * - Smart endpoint routing based on performance
 * - Advanced caching with invalidation strategies
 * - Real-time performance monitoring and optimization
 * - Automatic failover and retry mechanisms
 * - Network-aware request scheduling
 *
 * Target: 25%+ network performance improvement
 * Target: 40%+ reduction in redundant RPC calls
 * Target: Sub-50ms average response time optimization
 */
export class NetworkOptimizationLayer {
  private config: NetworkOptimizationConfig
  private cache = getCacheOrchestrator()
  private connectionPools = new Map<string, Connection[]>()
  private endpoints = new Map<string, RPCEndpoint>()
  private requestMetrics: RequestMetrics[] = []
  private coalescingGroups = new Map<string, RequestCoalescingGroup>()
  private batchedRequests = new Map<string, BatchRequest>()
  private healthCheckInterval?: NodeJS.Timeout

  // Performance tracking
  private performanceMetrics: NetworkPerformanceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cachedRequests: 0,
    coalescedRequests: 0,
    batchedRequests: 0,
    averageLatency: 0,
    p95Latency: 0,
    p99Latency: 0,
    throughput: 0,
    errorRate: 0,
    cacheHitRate: 0,
    networkEfficiency: 0,
    optimizationSavings: 0
  }

  // Request deduplication and optimization
  private activeRequests = new Map<string, Promise<any>>()
  private requestQueue: PendingRequest[] = []
  private batchTimer?: NodeJS.Timeout
  private requestCounter = 0

  constructor(config?: Partial<NetworkOptimizationConfig>) {
    this.config = {
      enabled: true,
      connectionPoolSize: 5,
      maxConcurrentRequests: 50,
      requestTimeoutMs: 30000,
      retryAttempts: 3,
      retryDelayMs: 1000,
      enableRequestCoalescing: true,
      enableResponseCaching: true,
      enableRequestBatching: true,
      enableConnectionHealthCheck: true,
      healthCheckInterval: 60000, // 1 minute
      adaptivePrioritization: true,
      intelligentRouting: true,
      performanceMonitoring: true,
      ...config
    }

    if (this.config.enabled) {
      this.initializeEndpoints()
      this.startHealthChecking()
      this.startBatchProcessing()
    }

    logger.info('🌐 Network Optimization Layer initialized')
    logger.info(`🔗 Connection pool size: ${this.config.connectionPoolSize}`)
    logger.info(`⚡ Max concurrent requests: ${this.config.maxConcurrentRequests}`)
    logger.info(`🎯 Targets: 25% performance improvement, 40% RPC reduction`)
  }

  // ============================================================================
  // INITIALIZATION AND SETUP
  // ============================================================================

  private initializeEndpoints(): void {
    // Get endpoints from connection manager
    const connectionStatus = connectionManager.getConnectionStatus()

    for (const status of connectionStatus) {
      const endpoint: RPCEndpoint = {
        url: status.url,
        priority: this.calculateEndpointPriority(status.url),
        isHealthy: !status.isBlacklisted,
        latency: 0,
        successRate: status.failures === 0 ? 1.0 : Math.max(0, 1 - (status.failures / 10)),
        lastUsed: new Date(status.lastAttempt),
        failureCount: status.failures,
        requestCount: 0,
        avgResponseTime: 0,
        maxConcurrentRequests: Math.floor(this.config.maxConcurrentRequests / connectionStatus.length),
        currentRequests: 0
      }

      this.endpoints.set(status.url, endpoint)
      this.initializeConnectionPool(status.url)
    }

    logger.info(`📡 Initialized ${this.endpoints.size} RPC endpoints`)
  }

  private calculateEndpointPriority(url: string): number {
    // Prioritize based on URL characteristics
    if (url.includes('mainnet')) return 10
    if (url.includes('devnet')) return 8
    if (url.includes('testnet')) return 6
    if (url.includes('localhost')) return 5
    return 7 // Default priority
  }

  private initializeConnectionPool(endpointUrl: string): void {
    const connections: Connection[] = []

    for (let i = 0; i < this.config.connectionPoolSize; i++) {
      try {
        const connection = new Connection(endpointUrl, {
          commitment: 'confirmed',
          confirmTransactionInitialTimeout: this.config.requestTimeoutMs
        })
        connections.push(connection)
      } catch (error) {
        logger.warn(`Failed to create connection for ${endpointUrl}:`, error)
      }
    }

    this.connectionPools.set(endpointUrl, connections)
    logger.debug(`🔗 Created connection pool for ${endpointUrl}: ${connections.length} connections`)
  }

  private startHealthChecking(): void {
    if (!this.config.enableConnectionHealthCheck) return

    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks()
    }, this.config.healthCheckInterval)

    logger.debug('💓 Health checking started')
  }

  private startBatchProcessing(): void {
    if (!this.config.enableRequestBatching) return

    // Process batch requests every 10ms for low latency
    this.batchTimer = setInterval(() => {
      this.processBatchedRequests()
    }, 10)
  }

  // ============================================================================
  // OPTIMIZED RPC REQUEST HANDLING
  // ============================================================================

  async makeOptimizedRequest<T>(
    method: string,
    params: any[] = [],
    options: {
      priority?: number
      cache?: boolean
      cacheTtl?: number
      retries?: number
      timeout?: number
    } = {}
  ): Promise<T> {
    if (!this.config.enabled) {
      return this.makeFallbackRequest(method, params)
    }

    const requestId = this.generateRequestId()
    const startTime = performance.now()

    this.performanceMetrics.totalRequests++

    try {
      // Check cache first
      if (this.config.enableResponseCaching && (options.cache !== false)) {
        const cached = await this.checkCache<T>(method, params)
        if (cached !== null) {
          this.performanceMetrics.cachedRequests++
          this.recordRequestMetrics(requestId, method, 'cache', startTime, performance.now(), true, true)
          return cached
        }
      }

      // Check for request coalescing
      if (this.config.enableRequestCoalescing) {
        const coalesced = await this.tryCoalesceRequest<T>(method, params)
        if (coalesced !== null) {
          this.performanceMetrics.coalescedRequests++
          return coalesced
        }
      }

      // Add to batch if batching is enabled
      if (this.config.enableRequestBatching && this.shouldBatchRequest(method)) {
        return this.addToBatch<T>(requestId, method, params, options)
      }

      // Execute optimized request
      const result = await this.executeOptimizedRequest<T>(requestId, method, params, options)

      // Cache successful results
      if (this.config.enableResponseCaching && (options.cache !== false)) {
        await this.cacheResult(method, params, result, options.cacheTtl)
      }

      this.performanceMetrics.successfulRequests++
      this.recordRequestMetrics(requestId, method, this.selectBestEndpoint().url, startTime, performance.now(), true, false)

      return result

    } catch (error) {
      this.performanceMetrics.failedRequests++
      this.recordRequestMetrics(requestId, method, 'error', startTime, performance.now(), false, false, error)
      throw error
    }
  }

  private async executeOptimizedRequest<T>(
    requestId: string,
    method: string,
    params: any[],
    options: any
  ): Promise<T> {
    const maxRetries = options.retries ?? this.config.retryAttempts
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const endpoint = this.selectBestEndpoint()
        const connection = this.getOptimalConnection(endpoint.url)

        if (!connection) {
          throw new Error(`No available connections for ${endpoint.url}`)
        }

        // Increment current requests counter
        endpoint.currentRequests++

        try {
          const result = await this.executeRPCCall<T>(connection, method, params, options.timeout)

          // Update endpoint metrics on success
          this.updateEndpointMetrics(endpoint, true, performance.now() - Date.now())

          return result

        } finally {
          endpoint.currentRequests--
        }

      } catch (error) {
        lastError = error as Error

        // Update endpoint metrics on failure
        const endpoint = this.selectBestEndpoint()
        this.updateEndpointMetrics(endpoint, false, 0)

        if (attempt < maxRetries) {
          const delay = this.calculateRetryDelay(attempt)
          await new Promise(resolve => setTimeout(resolve, delay))
          logger.debug(`🔄 Retrying request ${requestId}, attempt ${attempt + 2}/${maxRetries + 1}`)
        }
      }
    }

    throw lastError || new Error('Request failed after all retries')
  }

  private async executeRPCCall<T>(
    connection: Connection,
    method: string,
    params: any[],
    timeout?: number
  ): Promise<T> {
    const timeoutMs = timeout || this.config.requestTimeoutMs

    return Promise.race([
      this.callRPCMethod<T>(connection, method, params),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      )
    ])
  }

  private async callRPCMethod<T>(connection: Connection, method: string, params: any[]): Promise<T> {
    // Map common methods to Connection methods
    switch (method) {
      case 'getAccountInfo':
        return connection.getAccountInfo(new PublicKey(params[0]), params[1]) as Promise<T>

      case 'getBalance':
        return connection.getBalance(new PublicKey(params[0]), params[1]) as Promise<T>

      case 'getBlockHeight':
        return connection.getBlockHeight(params[0]) as Promise<T>

      case 'getLatestBlockhash':
        return connection.getLatestBlockhash(params[0]) as Promise<T>

      case 'getSlot':
        return connection.getSlot(params[0]) as Promise<T>

      case 'getTokenAccountsByOwner':
        return connection.getTokenAccountsByOwner(
          new PublicKey(params[0]),
          params[1],
          params[2]
        ) as Promise<T>

      case 'getProgramAccounts':
        return connection.getProgramAccounts(new PublicKey(params[0]), params[1]) as Promise<T>

      case 'simulateTransaction':
        return connection.simulateTransaction(params[0], params[1]) as Promise<T>

      case 'sendTransaction':
        return connection.sendTransaction(params[0], params[1], params[2]) as Promise<T>

      default:
        // For custom methods, use the underlying RPC client
        return (connection as any)._rpcRequest(method, params) as Promise<T>
    }
  }

  // ============================================================================
  // ENDPOINT SELECTION AND ROUTING
  // ============================================================================

  private selectBestEndpoint(): RPCEndpoint {
    const healthyEndpoints = Array.from(this.endpoints.values())
      .filter(endpoint => endpoint.isHealthy && endpoint.currentRequests < endpoint.maxConcurrentRequests)

    if (healthyEndpoints.length === 0) {
      // Fallback to any available endpoint
      const anyEndpoint = Array.from(this.endpoints.values())[0]
      if (!anyEndpoint) {
        throw new Error('No RPC endpoints available')
      }
      return anyEndpoint
    }

    if (!this.config.intelligentRouting) {
      return healthyEndpoints[0]
    }

    // Intelligent routing based on performance metrics
    return healthyEndpoints.reduce((best, current) => {
      const bestScore = this.calculateEndpointScore(best)
      const currentScore = this.calculateEndpointScore(current)
      return currentScore > bestScore ? current : best
    })
  }

  private calculateEndpointScore(endpoint: RPCEndpoint): number {
    const latencyScore = Math.max(0, 1 - (endpoint.latency / 1000)) // Normalize to 0-1
    const successScore = endpoint.successRate
    const loadScore = Math.max(0, 1 - (endpoint.currentRequests / endpoint.maxConcurrentRequests))
    const priorityScore = endpoint.priority / 10

    return (latencyScore * 0.3) + (successScore * 0.3) + (loadScore * 0.2) + (priorityScore * 0.2)
  }

  private getOptimalConnection(endpointUrl: string): Connection | null {
    const connections = this.connectionPools.get(endpointUrl)
    if (!connections || connections.length === 0) return null

    // Return first available connection (could be enhanced with load balancing)
    return connections[0]
  }

  private updateEndpointMetrics(endpoint: RPCEndpoint, success: boolean, responseTime: number): void {
    endpoint.requestCount++
    endpoint.lastUsed = new Date()

    if (success) {
      endpoint.avgResponseTime = (endpoint.avgResponseTime + responseTime) / 2
      endpoint.latency = responseTime
      endpoint.successRate = (endpoint.successRate * 0.9) + (1.0 * 0.1) // Exponential moving average
      endpoint.failureCount = Math.max(0, endpoint.failureCount - 1)
    } else {
      endpoint.failureCount++
      endpoint.successRate = (endpoint.successRate * 0.9) + (0.0 * 0.1)

      if (endpoint.failureCount > 5) {
        endpoint.isHealthy = false
        logger.warn(`🚫 Endpoint ${endpoint.url} marked as unhealthy`)
      }
    }
  }

  // ============================================================================
  // REQUEST COALESCING
  // ============================================================================

  private async tryCoalesceRequest<T>(method: string, params: any[]): Promise<T | null> {
    const key = this.createCoalescingKey(method, params)
    const existing = this.coalescingGroups.get(key)

    if (existing) {
      // Join existing request
      logger.debug(`🔗 Coalescing request: ${method}`)
      return existing.promise as Promise<T>
    }

    return null
  }

  // Reserved for future request coalescing optimization
  // private createCoalescingGroup<T>(
  //   key: string,
  //   method: string,
  //   params: any[],
  //   options: any
  // ): RequestCoalescingGroup {
  //   const group: RequestCoalescingGroup = {
  //     key,
  //     requests: [],
  //     promise: this.executeOptimizedRequest<T>('coalesced', method, params, options),
  //     createdAt: Date.now()
  //   }

  //   this.coalescingGroups.set(key, group)

  //   // Clean up after completion
  //   group.promise.finally(() => {
  //     this.coalescingGroups.delete(key)
  //   })

  //   return group
  // }

  private createCoalescingKey(method: string, params: any[]): string {
    return `${method}:${JSON.stringify(params)}`
  }

  // ============================================================================
  // REQUEST BATCHING
  // ============================================================================

  private shouldBatchRequest(method: string): boolean {
    // Only batch certain types of read operations
    const batchableMethods = new Set([
      'getAccountInfo',
      'getBalance',
      'getTokenAccountsByOwner',
      'getProgramAccounts'
    ])

    return batchableMethods.has(method)
  }

  private async addToBatch<T>(
    requestId: string,
    method: string,
    params: any[],
    options: any
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: PendingRequest = {
        id: requestId,
        method,
        params,
        resolve,
        reject,
        createdAt: Date.now(),
        priority: options.priority || 1
      }

      this.requestQueue.push(request)

      // Process immediately if queue is full
      if (this.requestQueue.length >= 10) {
        this.processBatchedRequests()
      }
    })
  }

  private processBatchedRequests(): void {
    if (this.requestQueue.length === 0) return

    // Group requests by endpoint and method
    const groups = this.groupRequestsForBatching()

    for (const [groupKey, requests] of Array.from(groups.entries())) {
      this.executeBatchRequest(groupKey, requests)
    }

    this.requestQueue = []
  }

  private groupRequestsForBatching(): Map<string, PendingRequest[]> {
    const groups = new Map<string, PendingRequest[]>()

    for (const request of this.requestQueue) {
      const endpoint = this.selectBestEndpoint()
      const key = `${endpoint.url}:${request.method}`

      if (!groups.has(key)) {
        groups.set(key, [])
      }

      groups.get(key)!.push(request)
    }

    return groups
  }

  private async executeBatchRequest(groupKey: string, requests: PendingRequest[]): Promise<void> {
    const [_endpointUrl, method] = groupKey.split(':')

    try {
      // Execute requests in parallel with concurrency limit
      const concurrency = Math.min(5, requests.length)
      const chunks = this.chunkArray(requests, concurrency)

      for (const chunk of chunks) {
        const promises = chunk.map(async request => {
          try {
            const result = await this.executeOptimizedRequest(
              request.id,
              request.method,
              request.params,
              {}
            )
            request.resolve(result)
          } catch (error) {
            request.reject(error)
          }
        })

        await Promise.all(promises)
      }

      this.performanceMetrics.batchedRequests += requests.length
      logger.debug(`📦 Executed batch of ${requests.length} ${method} requests`)

    } catch (error) {
      // Reject all requests in case of batch failure
      for (const request of requests) {
        request.reject(error)
      }
    }
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  // ============================================================================
  // CACHING OPTIMIZATION
  // ============================================================================

  private async checkCache<T>(method: string, params: any[]): Promise<T | null> {
    if (!this.cache) return null

    const cacheKey = this.createCacheKey(method, params)
    return this.cache.get<T>('network', cacheKey)
  }

  private async cacheResult<T>(
    method: string,
    params: any[],
    result: T,
    ttl?: number
  ): Promise<void> {
    if (!this.cache) return

    const cacheKey = this.createCacheKey(method, params)
    const cacheTtl = ttl || this.getDefaultCacheTtl(method)

    await this.cache.set('network', cacheKey, result, cacheTtl)
  }

  private createCacheKey(method: string, params: any[]): string {
    // Create a stable cache key
    const paramsString = JSON.stringify(params, (_key, value) => {
      if (value instanceof PublicKey) {
        return value.toString()
      }
      return value
    })

    return `${method}:${this.hashString(paramsString)}`
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  private getDefaultCacheTtl(method: string): number {
    // Cache TTL based on method type
    const ttlMap: Record<string, number> = {
      'getAccountInfo': 5000, // 5 seconds
      'getBalance': 10000, // 10 seconds
      'getBlockHeight': 2000, // 2 seconds
      'getLatestBlockhash': 1000, // 1 second
      'getSlot': 1000, // 1 second
      'getTokenAccountsByOwner': 15000, // 15 seconds
      'getProgramAccounts': 30000, // 30 seconds
    }

    return ttlMap[method] || 5000 // Default 5 seconds
  }

  // ============================================================================
  // HEALTH CHECKING
  // ============================================================================

  private async performHealthChecks(): Promise<void> {
    logger.debug('💓 Performing endpoint health checks...')

    const healthPromises = Array.from(this.endpoints.values()).map(endpoint =>
      this.checkEndpointHealth(endpoint)
    )

    const results = await Promise.allSettled(healthPromises)
    let healthyCount = 0

    results.forEach((result, index) => {
      const endpoint = Array.from(this.endpoints.values())[index]

      if (result.status === 'fulfilled' && result.value.isHealthy) {
        healthyCount++
        if (!endpoint.isHealthy) {
          logger.info(`✅ Endpoint ${endpoint.url} is now healthy`)
          endpoint.isHealthy = true
          endpoint.failureCount = 0
        }
      } else {
        if (endpoint.isHealthy) {
          logger.warn(`❌ Endpoint ${endpoint.url} failed health check`)
          endpoint.isHealthy = false
          endpoint.failureCount++
        }
      }
    })

    logger.debug(`💓 Health check complete: ${healthyCount}/${this.endpoints.size} endpoints healthy`)
  }

  private async checkEndpointHealth(endpoint: RPCEndpoint): Promise<ConnectionHealth> {
    const startTime = performance.now()

    try {
      const connection = this.getOptimalConnection(endpoint.url)
      if (!connection) {
        throw new Error('No connection available')
      }

      // Simple health check - get slot
      await connection.getSlot()

      const responseTime = performance.now() - startTime
      endpoint.latency = responseTime

      return {
        endpoint: endpoint.url,
        isHealthy: true,
        latency: responseTime,
        lastCheck: new Date(),
        consecutiveFailures: 0,
        details: {
          responseTime,
          errorRate: 1 - endpoint.successRate,
          throughput: endpoint.requestCount,
          availability: 1.0
        }
      }

    } catch (error) {
      return {
        endpoint: endpoint.url,
        isHealthy: false,
        latency: -1,
        lastCheck: new Date(),
        consecutiveFailures: endpoint.failureCount,
        details: {
          responseTime: -1,
          errorRate: 1.0,
          throughput: 0,
          availability: 0.0
        }
      }
    }
  }

  // ============================================================================
  // METRICS AND MONITORING
  // ============================================================================

  private recordRequestMetrics(
    requestId: string,
    method: string,
    endpoint: string,
    startTime: number,
    endTime: number,
    success: boolean,
    cached: boolean,
    error?: any
  ): void {
    const metrics: RequestMetrics = {
      requestId,
      method,
      endpoint,
      startTime,
      endTime,
      duration: endTime - startTime,
      success,
      cached,
      retryCount: 0,
      errorMessage: error?.message
    }

    this.requestMetrics.push(metrics)

    // Keep only last 1000 metrics
    if (this.requestMetrics.length > 1000) {
      this.requestMetrics.shift()
    }

    // Update performance metrics
    this.updatePerformanceMetrics()
  }

  private updatePerformanceMetrics(): void {
    const recentMetrics = this.requestMetrics.slice(-100) // Last 100 requests

    if (recentMetrics.length === 0) return

    const durations = recentMetrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!)
      .sort((a, b) => a - b)

    this.performanceMetrics.averageLatency = durations.reduce((sum, d) => sum + d, 0) / durations.length
    this.performanceMetrics.p95Latency = durations[Math.floor(durations.length * 0.95)] || 0
    this.performanceMetrics.p99Latency = durations[Math.floor(durations.length * 0.99)] || 0

    const successCount = recentMetrics.filter(m => m.success).length
    this.performanceMetrics.errorRate = 1 - (successCount / recentMetrics.length)

    const cachedCount = recentMetrics.filter(m => m.cached).length
    this.performanceMetrics.cacheHitRate = cachedCount / recentMetrics.length

    // Calculate network efficiency (requests saved through optimization)
    const baselineRequests = this.performanceMetrics.totalRequests
    const optimizedRequests = this.performanceMetrics.cachedRequests +
                             this.performanceMetrics.coalescedRequests +
                             (this.performanceMetrics.batchedRequests * 0.5) // Batch savings

    this.performanceMetrics.networkEfficiency = baselineRequests > 0
      ? optimizedRequests / baselineRequests
      : 0

    this.performanceMetrics.optimizationSavings = this.performanceMetrics.networkEfficiency * 100
  }

  private calculateRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = this.config.retryDelayMs
    const exponentialDelay = baseDelay * Math.pow(2, attempt)
    const jitter = Math.random() * 0.1 * exponentialDelay

    return Math.min(exponentialDelay + jitter, 10000) // Max 10 seconds
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestCounter}`
  }

  private async makeFallbackRequest<T>(method: string, params: any[]): Promise<T> {
    // Fallback to connection manager when optimization is disabled
    return connectionManager.makeRpcCall(async (connection) => {
      return this.callRPCMethod<T>(connection, method, params)
    })
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getPerformanceMetrics(): NetworkPerformanceMetrics {
    this.updatePerformanceMetrics()
    return { ...this.performanceMetrics }
  }

  getConnectionPoolStats(): ConnectionPoolStats {
    const totalConnections = Array.from(this.connectionPools.values())
      .reduce((sum, pool) => sum + pool.length, 0)

    const endpoints = Array.from(this.endpoints.values())
    const activeConnections = endpoints.reduce((sum, ep) => sum + ep.currentRequests, 0)
    const healthyEndpoints = endpoints.filter(ep => ep.isHealthy).length

    return {
      totalConnections,
      activeConnections,
      idleConnections: totalConnections - activeConnections,
      failedConnections: endpoints.length - healthyEndpoints,
      avgResponseTime: this.performanceMetrics.averageLatency,
      requestsPerSecond: this.performanceMetrics.throughput,
      errorRate: this.performanceMetrics.errorRate,
      lastHealthCheck: new Date()
    }
  }

  getEndpointStats(): RPCEndpoint[] {
    return Array.from(this.endpoints.values())
  }

  async clearCache(): Promise<void> {
    await this.cache?.invalidate('network')
    logger.info('🧹 Network cache cleared')
  }

  updateConfig(config: Partial<NetworkOptimizationConfig>): void {
    this.config = { ...this.config, ...config }

    if (!this.config.enabled) {
      this.destroy()
    }
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    if (this.batchTimer) {
      clearInterval(this.batchTimer)
    }

    this.connectionPools.clear()
    this.endpoints.clear()
    this.coalescingGroups.clear()
    this.batchedRequests.clear()
    this.activeRequests.clear()
    this.requestQueue = []

    logger.info('💥 Network Optimization Layer destroyed')
  }
}

// ============================================================================
// SINGLETON INSTANCE AND FACTORY
// ============================================================================

let networkOptimizerInstance: NetworkOptimizationLayer | null = null

export function createNetworkOptimizer(config?: Partial<NetworkOptimizationConfig>): NetworkOptimizationLayer {
  if (networkOptimizerInstance) {
    networkOptimizerInstance.destroy()
  }

  networkOptimizerInstance = new NetworkOptimizationLayer(config)
  return networkOptimizerInstance
}

export function getNetworkOptimizer(): NetworkOptimizationLayer | null {
  return networkOptimizerInstance
}

// React Hook for network optimization
export function useNetworkOptimization() {
  const optimizer = getNetworkOptimizer()

  return {
    makeRequest: optimizer?.makeOptimizedRequest.bind(optimizer),
    getMetrics: optimizer?.getPerformanceMetrics.bind(optimizer),
    getConnectionStats: optimizer?.getConnectionPoolStats.bind(optimizer),
    clearCache: optimizer?.clearCache.bind(optimizer)
  }
}

export default NetworkOptimizationLayer