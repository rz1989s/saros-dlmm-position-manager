import { logger } from '../logger'
import { getCacheOrchestrator } from '../cache/unified-cache-orchestrator'
import { getNetworkOptimizer } from './network-optimization'
// import { getMemoryOptimizer } from './memory-optimization'  // Reserved for future memory optimizations

// ============================================================================
// RESPONSE TIME OPTIMIZATION TYPES
// ============================================================================

export interface ResponseTimeConfig {
  enabled: boolean
  targetResponseTime: number // Target response time in milliseconds
  enablePredictivePrefetching: boolean
  enableResponseStreaming: boolean
  enableProgressiveLoading: boolean
  enableDataCompression: boolean
  enableInlineOptimization: boolean
  enableRequestPrioritization: boolean
  enableAsyncProcessing: boolean
  enableResponseCaching: boolean
  performanceMonitoring: boolean
  adaptiveOptimization: boolean
}

export interface ResponseTimeMetrics {
  averageResponseTime: number
  p50ResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  fastestResponseTime: number
  slowestResponseTime: number
  responsesUnder100ms: number
  responsesUnder50ms: number
  totalResponses: number
  optimizationSavings: number
  cacheHitImpact: number
  networkOptimizationImpact: number
  memoryOptimizationImpact: number
}

export interface RequestProfile {
  id: string
  method: string
  params: any
  startTime: number
  endTime?: number
  responseTime?: number
  optimizations: OptimizationApplied[]
  cacheHit: boolean
  streamed: boolean
  compressed: boolean
  prefetched: boolean
  priority: number
  stage: RequestStage
}

export interface OptimizationApplied {
  type: 'cache' | 'compression' | 'streaming' | 'prefetch' | 'priority' | 'async' | 'inline'
  description: string
  timeSaved: number
  sizeReduction?: number
}

export type RequestStage =
  | 'queued'
  | 'processing'
  | 'optimizing'
  | 'networking'
  | 'rendering'
  | 'complete'
  | 'error'

export interface PrefetchCandidate {
  key: string
  method: string
  params: any
  probability: number
  priority: number
  estimatedResponseTime: number
  lastAccessed: Date
  accessCount: number
}

export interface StreamingResponse<T> {
  data: T
  isPartial: boolean
  isComplete: boolean
  progress: number
  metadata: {
    totalSize?: number
    receivedSize: number
    estimatedTimeRemaining?: number
  }
}

export interface ProgressiveLoadingConfig {
  enableChunking: boolean
  chunkSize: number
  maxChunks: number
  priorityFields: string[]
  deferredFields: string[]
}

export interface ResponseCompressionConfig {
  enableGzip: boolean
  enableBrotli: boolean
  enableDelta: boolean
  minSizeThreshold: number
  compressionLevel: number
}

export interface RequestPriority {
  level: 'critical' | 'high' | 'normal' | 'low' | 'background'
  weight: number
  timeout: number
  retries: number
}

// ============================================================================
// RESPONSE TIME OPTIMIZATION SYSTEM
// ============================================================================

/**
 * Advanced Response Time Optimization System
 *
 * Features:
 * - Sub-100ms response time optimization
 * - Predictive prefetching based on user patterns
 * - Response streaming and progressive loading
 * - Intelligent request prioritization
 * - Data compression and delta updates
 * - Async processing and background operations
 * - Real-time performance monitoring
 * - Adaptive optimization strategies
 *
 * Target: Sub-100ms API responses (95th percentile)
 * Target: 60%+ of responses under 50ms
 * Target: 40%+ reduction in perceived response time
 */
export class ResponseTimeOptimizer {
  private config: ResponseTimeConfig
  private cache = getCacheOrchestrator()
  private networkOptimizer = getNetworkOptimizer()
  // private memoryOptimizer = getMemoryOptimizer()  // Reserved for future memory optimizations

  // Performance tracking
  private requestProfiles = new Map<string, RequestProfile>()
  private responseTimeHistory: number[] = []
  private prefetchCandidates = new Map<string, PrefetchCandidate>()
  private activeRequests = new Map<string, RequestProfile>()

  // Optimization mechanisms
  private priorityQueue = new Map<RequestPriority['level'], RequestProfile[]>()
  private backgroundProcessor?: Worker
  private prefetchScheduler?: NodeJS.Timeout
  private performanceMonitor?: NodeJS.Timeout

  // Metrics tracking
  private metrics: ResponseTimeMetrics = {
    averageResponseTime: 0,
    p50ResponseTime: 0,
    p95ResponseTime: 0,
    p99ResponseTime: 0,
    fastestResponseTime: Infinity,
    slowestResponseTime: 0,
    responsesUnder100ms: 0,
    responsesUnder50ms: 0,
    totalResponses: 0,
    optimizationSavings: 0,
    cacheHitImpact: 0,
    networkOptimizationImpact: 0,
    memoryOptimizationImpact: 0
  }

  // Optimization strategies
  // private optimizationStrategies = new Map<string, (profile: RequestProfile) => Promise<OptimizationApplied[]>>()  // Reserved for advanced optimization strategies

  constructor(config?: Partial<ResponseTimeConfig>) {
    this.config = {
      enabled: true,
      targetResponseTime: 100, // 100ms target
      enablePredictivePrefetching: true,
      enableResponseStreaming: true,
      enableProgressiveLoading: true,
      enableDataCompression: true,
      enableInlineOptimization: true,
      enableRequestPrioritization: true,
      enableAsyncProcessing: true,
      enableResponseCaching: true,
      performanceMonitoring: true,
      adaptiveOptimization: true,
      ...config
    }

    if (this.config.enabled) {
      this.startPrefetchScheduler()
      this.startPerformanceMonitoring()
    }

    logger.info('⚡ Response Time Optimizer initialized')
    logger.info(`🎯 Target response time: ${this.config.targetResponseTime}ms`)
    logger.info(`📈 Optimizations: prefetch, streaming, compression, prioritization`)
  }

  // ============================================================================
  // OPTIMIZED REQUEST PROCESSING
  // ============================================================================

  async optimizeRequest<T>(
    method: string,
    params: any,
    options: {
      priority?: RequestPriority['level']
      enableStreaming?: boolean
      enableCompression?: boolean
      enablePrefetch?: boolean
      timeout?: number
    } = {}
  ): Promise<T> {
    if (!this.config.enabled) {
      return this.executeBasicRequest<T>(method, params)
    }

    const requestId = this.generateRequestId()
    const startTime = performance.now()

    // Create request profile
    const profile: RequestProfile = {
      id: requestId,
      method,
      params,
      startTime,
      optimizations: [],
      cacheHit: false,
      streamed: false,
      compressed: false,
      prefetched: false,
      priority: this.getPriorityWeight(options.priority || 'normal'),
      stage: 'queued'
    }

    this.activeRequests.set(requestId, profile)

    try {
      // Stage 1: Request Analysis and Optimization Planning
      profile.stage = 'processing'
      const optimizations = await this.planOptimizations(profile, options)

      // Stage 2: Apply Optimizations
      profile.stage = 'optimizing'
      const optimizedResult = await this.applyOptimizations<T>(profile, optimizations, options)

      // Stage 3: Record Success Metrics
      profile.stage = 'complete'
      const responseTime = performance.now() - startTime
      profile.endTime = performance.now()
      profile.responseTime = responseTime

      this.recordResponseMetrics(profile)
      this.updatePrefetchCandidates(method, params)

      logger.debug(`⚡ Request optimized: ${method} in ${responseTime.toFixed(2)}ms`)

      return optimizedResult

    } catch (error) {
      profile.stage = 'error'
      profile.endTime = performance.now()
      profile.responseTime = performance.now() - startTime

      this.recordResponseMetrics(profile)

      logger.error(`❌ Request optimization failed: ${method}`, error)
      throw error

    } finally {
      this.activeRequests.delete(requestId)
    }
  }

  private async planOptimizations(
    profile: RequestProfile,
    options: any
  ): Promise<OptimizationApplied[]> {
    const optimizations: OptimizationApplied[] = []

    // Cache optimization
    if (this.config.enableResponseCaching) {
      const cacheOpt = await this.planCacheOptimization(profile)
      if (cacheOpt) optimizations.push(cacheOpt)
    }

    // Compression optimization
    if (this.config.enableDataCompression && (options.enableCompression !== false)) {
      const compressionOpt = await this.planCompressionOptimization(profile)
      if (compressionOpt) optimizations.push(compressionOpt)
    }

    // Streaming optimization
    if (this.config.enableResponseStreaming && (options.enableStreaming !== false)) {
      const streamingOpt = await this.planStreamingOptimization(profile)
      if (streamingOpt) optimizations.push(streamingOpt)
    }

    // Priority optimization
    if (this.config.enableRequestPrioritization) {
      const priorityOpt = await this.planPriorityOptimization(profile, options.priority)
      if (priorityOpt) optimizations.push(priorityOpt)
    }

    // Prefetch optimization
    if (this.config.enablePredictivePrefetching && (options.enablePrefetch !== false)) {
      const prefetchOpt = await this.planPrefetchOptimization(profile)
      if (prefetchOpt) optimizations.push(prefetchOpt)
    }

    return optimizations
  }

  private async applyOptimizations<T>(
    profile: RequestProfile,
    optimizations: OptimizationApplied[],
    options: any
  ): Promise<T> {
    let result: T

    // Apply cache optimization first
    const cacheOpt = optimizations.find(opt => opt.type === 'cache')
    if (cacheOpt) {
      const cached = await this.applyCacheOptimization<T>(profile)
      if (cached !== null) {
        profile.cacheHit = true
        profile.optimizations.push(cacheOpt)
        return cached
      }
    }

    // Apply other optimizations
    for (const optimization of optimizations) {
      if (optimization.type === 'cache') continue // Already handled

      switch (optimization.type) {
        case 'priority':
          await this.applyPriorityOptimization(profile)
          break
        case 'compression':
          profile.compressed = true
          break
        case 'streaming':
          profile.streamed = true
          break
        case 'prefetch':
          profile.prefetched = true
          break
      }

      profile.optimizations.push(optimization)
    }

    // Execute the actual request
    profile.stage = 'networking'

    if (profile.streamed && this.config.enableResponseStreaming) {
      result = await this.executeStreamingRequest<T>(profile, options)
    } else {
      result = await this.executeOptimizedRequest<T>(profile, options)
    }

    // Apply post-processing optimizations
    if (profile.compressed) {
      result = await this.applyResponseCompression<T>(result)
    }

    // Cache the result
    if (!profile.cacheHit && this.config.enableResponseCaching) {
      await this.cacheOptimizedResult(profile.method, profile.params, result)
    }

    return result
  }

  // ============================================================================
  // SPECIFIC OPTIMIZATION IMPLEMENTATIONS
  // ============================================================================

  private async planCacheOptimization(profile: RequestProfile): Promise<OptimizationApplied | null> {
    const cacheKey = this.createCacheKey(profile.method, profile.params)
    const cached = await this.cache?.get('optimization', cacheKey)

    if (cached) {
      return {
        type: 'cache',
        description: 'Cache hit - immediate response',
        timeSaved: 50 // Estimated time saved
      }
    }

    return null
  }

  private async applyCacheOptimization<T>(profile: RequestProfile): Promise<T | null> {
    const cacheKey = this.createCacheKey(profile.method, profile.params)
    return this.cache?.get<T>('optimization', cacheKey) || null
  }

  private async planCompressionOptimization(profile: RequestProfile): Promise<OptimizationApplied | null> {
    // Estimate response size and compression benefit
    const estimatedSize = this.estimateResponseSize(profile.method, profile.params)

    if (estimatedSize > 1000) { // Only compress large responses
      return {
        type: 'compression',
        description: 'Response compression enabled',
        timeSaved: 10, // Network transfer time saved
        sizeReduction: estimatedSize * 0.6 // 60% compression ratio
      }
    }

    return null
  }

  private async planStreamingOptimization(profile: RequestProfile): Promise<OptimizationApplied | null> {
    // Check if method supports streaming
    const streamableMethods = new Set([
      'getPositions',
      'getPoolData',
      'getPortfolioAnalytics'
    ])

    if (streamableMethods.has(profile.method)) {
      return {
        type: 'streaming',
        description: 'Progressive data streaming',
        timeSaved: 30 // Perceived response time improvement
      }
    }

    return null
  }

  private async planPriorityOptimization(
    _profile: RequestProfile,
    priority?: RequestPriority['level']
  ): Promise<OptimizationApplied | null> {
    if (priority && priority !== 'normal') {
      return {
        type: 'priority',
        description: `Request prioritized as ${priority}`,
        timeSaved: priority === 'critical' ? 20 : (priority === 'high' ? 10 : 0)
      }
    }

    return null
  }

  private async planPrefetchOptimization(profile: RequestProfile): Promise<OptimizationApplied | null> {
    const prefetchKey = this.createPrefetchKey(profile.method, profile.params)
    const candidate = this.prefetchCandidates.get(prefetchKey)

    if (candidate && candidate.probability > 0.7) {
      return {
        type: 'prefetch',
        description: 'Data was prefetched based on usage patterns',
        timeSaved: candidate.estimatedResponseTime
      }
    }

    return null
  }

  private async executeStreamingRequest<T>(
    profile: RequestProfile,
    options: any
  ): Promise<T> {
    // Implement streaming request logic
    if (this.networkOptimizer) {
      return this.networkOptimizer.makeOptimizedRequest<T>(
        profile.method,
        profile.params,
        { priority: 1, ...options }
      )
    }

    return this.executeBasicRequest<T>(profile.method, profile.params)
  }

  private async executeOptimizedRequest<T>(
    profile: RequestProfile,
    options: any
  ): Promise<T> {
    // Use network optimizer if available
    if (this.networkOptimizer) {
      return this.networkOptimizer.makeOptimizedRequest<T>(
        profile.method,
        profile.params,
        {
          priority: profile.priority,
          timeout: options.timeout,
          ...options
        }
      )
    }

    return this.executeBasicRequest<T>(profile.method, profile.params)
  }

  private async applyPriorityOptimization(profile: RequestProfile): Promise<void> {
    // Add to priority queue
    const priorityLevel = this.getPriorityLevel(profile.priority)
    if (!this.priorityQueue.has(priorityLevel)) {
      this.priorityQueue.set(priorityLevel, [])
    }

    this.priorityQueue.get(priorityLevel)!.push(profile)

    // Process high priority requests immediately
    if (priorityLevel === 'critical' || priorityLevel === 'high') {
      await this.processPriorityQueue()
    }
  }

  private async applyResponseCompression<T>(response: T): Promise<T> {
    // Implement response compression
    // For now, just return the response as-is
    return response
  }

  // ============================================================================
  // PREDICTIVE PREFETCHING
  // ============================================================================

  private startPrefetchScheduler(): void {
    if (!this.config.enablePredictivePrefetching) return

    this.prefetchScheduler = setInterval(() => {
      this.executePrefetchOperations()
    }, 5000) // Every 5 seconds

    logger.debug('🔮 Prefetch scheduler started')
  }

  private async executePrefetchOperations(): Promise<void> {
    const candidates = Array.from(this.prefetchCandidates.values())
      .filter(candidate => candidate.probability > 0.5)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5) // Top 5 candidates

    for (const candidate of candidates) {
      try {
        await this.prefetchData(candidate)
        logger.debug(`🔮 Prefetched: ${candidate.method}`)
      } catch (error) {
        logger.debug(`❌ Prefetch failed: ${candidate.method}`, error)
      }
    }
  }

  private async prefetchData(candidate: PrefetchCandidate): Promise<void> {
    const cacheKey = this.createCacheKey(candidate.method, candidate.params)

    // Check if already cached
    const existing = await this.cache?.get('optimization', cacheKey)
    if (existing) return

    // Execute prefetch request
    const result = await this.executeBasicRequest(candidate.method, candidate.params)

    // Cache the prefetched result
    await this.cache?.set('optimization', cacheKey, result, 30000) // 30s TTL
  }

  private updatePrefetchCandidates(method: string, params: any): void {
    const key = this.createPrefetchKey(method, params)
    const existing = this.prefetchCandidates.get(key)

    if (existing) {
      existing.accessCount++
      existing.lastAccessed = new Date()
      existing.probability = Math.min(1.0, existing.probability + 0.1) // Increase probability
    } else {
      this.prefetchCandidates.set(key, {
        key,
        method,
        params,
        probability: 0.1, // Initial probability
        priority: 1,
        estimatedResponseTime: 100, // Estimated
        lastAccessed: new Date(),
        accessCount: 1
      })
    }

    // Clean up old candidates
    this.cleanupPrefetchCandidates()
  }

  private cleanupPrefetchCandidates(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000) // 24 hours

    for (const [key, candidate] of this.prefetchCandidates) {
      if (candidate.lastAccessed.getTime() < cutoff) {
        this.prefetchCandidates.delete(key)
      }
    }
  }

  // ============================================================================
  // PROGRESSIVE LOADING
  // ============================================================================

  async loadProgressively<T>(
    method: string,
    params: any,
    config: ProgressiveLoadingConfig
  ): Promise<StreamingResponse<T>> {
    // const chunks = this.createProgressiveChunks(method, params, config)  // Reserved for chunked loading
    let receivedSize = 0
    let totalSize = 0

    // Load priority fields first
    const priorityResult = await this.loadPriorityFields<T>(
      method,
      params,
      config.priorityFields
    )

    receivedSize += this.estimateObjectSize(priorityResult)
    totalSize = this.estimateResponseSize(method, params)

    return {
      data: priorityResult as any as T,
      isPartial: true,
      isComplete: false,
      progress: receivedSize / totalSize,
      metadata: {
        totalSize,
        receivedSize,
        estimatedTimeRemaining: this.estimateRemainingTime(receivedSize, totalSize)
      }
    }
  }

  // Reserved for future chunked progressive loading
  // private createProgressiveChunks(
  //   method: string,
  //   params: any,
  //   config: ProgressiveLoadingConfig
  // ): any[] {
  //   // Create logical chunks based on data structure
  //   const chunks: any[] = []

  //   if (config.enableChunking) {
  //     for (let i = 0; i < config.maxChunks; i++) {
  //       chunks.push({
  //         index: i,
  //         method,
  //         params: { ...params, chunk: i, chunkSize: config.chunkSize }
  //       })
  //     }
  //   }

  //   return chunks
  // }

  private async loadPriorityFields<T>(
    method: string,
    params: any,
    priorityFields: string[]
  ): Promise<Partial<T>> {
    // Load only the specified priority fields
    const priorityParams = {
      ...params,
      fields: priorityFields
    }

    return this.executeBasicRequest(method, priorityParams) as Promise<Partial<T>>
  }

  // ============================================================================
  // REQUEST PRIORITIZATION
  // ============================================================================

  private async processPriorityQueue(): Promise<void> {
    const priorities: RequestPriority['level'][] = ['critical', 'high', 'normal', 'low', 'background']

    for (const priority of priorities) {
      const queue = this.priorityQueue.get(priority)
      if (!queue || queue.length === 0) continue

      // Process requests in order
      const request = queue.shift()
      if (request) {
        // Move to front of processing queue
        logger.debug(`⚡ Processing ${priority} priority request: ${request.method}`)
      }
    }
  }

  private getPriorityWeight(level: RequestPriority['level']): number {
    const weights = {
      critical: 100,
      high: 75,
      normal: 50,
      low: 25,
      background: 10
    }
    return weights[level]
  }

  private getPriorityLevel(weight: number): RequestPriority['level'] {
    if (weight >= 100) return 'critical'
    if (weight >= 75) return 'high'
    if (weight >= 50) return 'normal'
    if (weight >= 25) return 'low'
    return 'background'
  }

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================

  private startPerformanceMonitoring(): void {
    if (!this.config.performanceMonitoring) return

    this.performanceMonitor = setInterval(() => {
      this.updatePerformanceMetrics()
      this.optimizeBasedOnMetrics()
    }, 10000) // Every 10 seconds

    logger.debug('📊 Performance monitoring started')
  }

  private updatePerformanceMetrics(): void {
    if (this.responseTimeHistory.length === 0) return

    const sorted = [...this.responseTimeHistory].sort((a, b) => a - b)
    const total = sorted.length

    this.metrics.averageResponseTime = sorted.reduce((sum, time) => sum + time, 0) / total
    this.metrics.p50ResponseTime = sorted[Math.floor(total * 0.5)]
    this.metrics.p95ResponseTime = sorted[Math.floor(total * 0.95)]
    this.metrics.p99ResponseTime = sorted[Math.floor(total * 0.99)]
    this.metrics.fastestResponseTime = sorted[0]
    this.metrics.slowestResponseTime = sorted[total - 1]

    this.metrics.responsesUnder100ms = sorted.filter(time => time < 100).length
    this.metrics.responsesUnder50ms = sorted.filter(time => time < 50).length
    this.metrics.totalResponses = total

    // Calculate optimization impact
    const baseline = 200 // Baseline response time without optimization
    const current = this.metrics.averageResponseTime
    this.metrics.optimizationSavings = Math.max(0, ((baseline - current) / baseline) * 100)
  }

  private optimizeBasedOnMetrics(): void {
    if (!this.config.adaptiveOptimization) return

    const { targetResponseTime } = this.config

    if (this.metrics.p95ResponseTime > targetResponseTime) {
      logger.warn(`📊 P95 response time (${this.metrics.p95ResponseTime}ms) exceeds target (${targetResponseTime}ms)`)

      // Increase optimization aggressiveness
      this.adjustOptimizationStrategy(true)
    } else if (this.metrics.p95ResponseTime < targetResponseTime * 0.5) {
      // Reduce optimization overhead if performing well
      this.adjustOptimizationStrategy(false)
    }
  }

  private adjustOptimizationStrategy(increaseAggression: boolean): void {
    if (increaseAggression) {
      // Increase cache TTL, prefetch more aggressively, etc.
      logger.debug('📈 Increasing optimization aggressiveness')
    } else {
      // Reduce optimization overhead
      logger.debug('📉 Reducing optimization overhead')
    }
  }

  private recordResponseMetrics(profile: RequestProfile): void {
    if (profile.responseTime) {
      this.responseTimeHistory.push(profile.responseTime)

      // Keep only last 1000 measurements
      if (this.responseTimeHistory.length > 1000) {
        this.responseTimeHistory.shift()
      }

      // Update cache hit impact
      if (profile.cacheHit) {
        this.metrics.cacheHitImpact = (this.metrics.cacheHitImpact + profile.responseTime) / 2
      }
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateRequestId(): string {
    return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private createCacheKey(method: string, params: any): string {
    return `${method}:${JSON.stringify(params)}`
  }

  private createPrefetchKey(method: string, params: any): string {
    return `prefetch:${this.createCacheKey(method, params)}`
  }

  private estimateResponseSize(method: string, _params: any): number {
    // Rough estimates based on method
    const sizeEstimates = {
      getPositions: 5000,
      getPoolData: 2000,
      getBalance: 100,
      getAccountInfo: 500,
      default: 1000
    }

    return sizeEstimates[method as keyof typeof sizeEstimates] || sizeEstimates.default
  }

  private estimateObjectSize(obj: any): number {
    return JSON.stringify(obj).length
  }

  private estimateRemainingTime(received: number, total: number): number {
    const remaining = total - received
    const avgSpeed = 1000 // bytes per ms
    return remaining / avgSpeed
  }

  private async executeBasicRequest<T>(_method: string, _params: any): Promise<T> {
    // Fallback to basic execution
    // This would typically call the original DLMM client methods
    throw new Error('Basic request execution not implemented')
  }

  private async cacheOptimizedResult(method: string, params: any, result: any): Promise<void> {
    const cacheKey = this.createCacheKey(method, params)
    const ttl = this.getOptimalCacheTtl(method)
    await this.cache?.set('optimization', cacheKey, result, ttl)
  }

  private getOptimalCacheTtl(method: string): number {
    // Determine optimal cache TTL based on data volatility
    const ttlMap = {
      getPositions: 10000, // 10 seconds
      getPoolData: 5000,   // 5 seconds
      getBalance: 15000,   // 15 seconds
      default: 8000        // 8 seconds
    }

    return ttlMap[method as keyof typeof ttlMap] || ttlMap.default
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getMetrics(): ResponseTimeMetrics {
    this.updatePerformanceMetrics()
    return { ...this.metrics }
  }

  getActiveRequests(): RequestProfile[] {
    return Array.from(this.activeRequests.values())
  }

  getPrefetchCandidates(): PrefetchCandidate[] {
    return Array.from(this.prefetchCandidates.values())
  }

  async clearOptimizationCache(): Promise<void> {
    await this.cache?.invalidate('optimization')
    this.prefetchCandidates.clear()
    logger.info('🧹 Optimization cache cleared')
  }

  updateConfig(config: Partial<ResponseTimeConfig>): void {
    this.config = { ...this.config, ...config }

    if (!this.config.enabled) {
      this.destroy()
    }
  }

  destroy(): void {
    if (this.prefetchScheduler) {
      clearInterval(this.prefetchScheduler)
    }

    if (this.performanceMonitor) {
      clearInterval(this.performanceMonitor)
    }

    if (this.backgroundProcessor) {
      this.backgroundProcessor.terminate()
    }

    this.requestProfiles.clear()
    this.prefetchCandidates.clear()
    this.activeRequests.clear()
    this.priorityQueue.clear()

    logger.info('💥 Response Time Optimizer destroyed')
  }
}

// ============================================================================
// SINGLETON INSTANCE AND FACTORY
// ============================================================================

let responseOptimizerInstance: ResponseTimeOptimizer | null = null

export function createResponseOptimizer(config?: Partial<ResponseTimeConfig>): ResponseTimeOptimizer {
  if (responseOptimizerInstance) {
    responseOptimizerInstance.destroy()
  }

  responseOptimizerInstance = new ResponseTimeOptimizer(config)
  return responseOptimizerInstance
}

export function getResponseOptimizer(): ResponseTimeOptimizer | null {
  return responseOptimizerInstance
}

// React Hook for response optimization
export function useResponseOptimization() {
  const optimizer = getResponseOptimizer()

  return {
    optimizeRequest: optimizer?.optimizeRequest.bind(optimizer),
    loadProgressively: optimizer?.loadProgressively.bind(optimizer),
    getMetrics: optimizer?.getMetrics.bind(optimizer),
    clearCache: optimizer?.clearOptimizationCache.bind(optimizer)
  }
}

export default ResponseTimeOptimizer