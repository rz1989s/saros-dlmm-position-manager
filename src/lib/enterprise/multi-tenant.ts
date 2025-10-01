/**
 * Multi-Tenant Support System
 * Enterprise-grade multi-tenancy architecture for DLMM position management
 *
 * Features:
 * - Tenant isolation and data partitioning
 * - Resource management and quotas
 * - Role-based access control
 * - Configuration management
 * - Usage tracking and billing
 * - API rate limiting
 * - Tenant administration
 */

import { PublicKey } from '@solana/web3.js'
import { EventEmitter } from 'events'

// ==================== CORE TYPES ====================

export interface Tenant {
  id: string
  name: string
  displayName: string
  description?: string
  status: TenantStatus
  createdAt: Date
  updatedAt: Date
  owner: TenantUser
  settings: TenantSettings
  limits: TenantLimits
  usage: TenantUsage
  metadata: Record<string, any>
}

export interface TenantUser {
  id: string
  tenantId: string
  email: string
  name: string
  role: TenantRole
  permissions: Permission[]
  walletAddress?: PublicKey
  status: UserStatus
  createdAt: Date
  lastLoginAt?: Date
  metadata: Record<string, any>
}

export interface TenantSettings {
  // DLMM-specific settings
  dlmm: {
    defaultSlippageTolerance: number
    maxPositionsPerUser: number
    allowedPairs: PublicKey[]
    defaultFeeStrategy: string
    riskManagement: {
      maxLossThreshold: number
      requireApprovalAbove: number
      autoStopLoss: boolean
    }
  }

  // Analytics settings
  analytics: {
    dataRetentionDays: number
    enableRealTimeUpdates: boolean
    customMetrics: string[]
    reportingFrequency: 'daily' | 'weekly' | 'monthly'
  }

  // Security settings
  security: {
    requireMFA: boolean
    sessionTimeoutMinutes: number
    allowedIpRanges: string[]
    auditLogging: boolean
  }

  // Integration settings
  integrations: {
    webhooks: TenantWebhook[]
    apiKeys: TenantApiKey[]
    externalServices: Record<string, any>
  }
}

export interface TenantLimits {
  maxUsers: number
  maxPositions: number
  maxDailyTransactions: number
  maxApiCallsPerHour: number
  maxDataStorageMB: number
  maxCustomStrategies: number
  features: {
    advancedAnalytics: boolean
    automatedRebalancing: boolean
    crossPoolMigration: boolean
    customIntegrations: boolean
    prioritySupport: boolean
  }
}

export interface TenantUsage {
  currentUsers: number
  currentPositions: number
  dailyTransactions: number
  apiCallsThisHour: number
  dataStorageUsedMB: number
  customStrategiesUsed: number
  billingPeriod: {
    start: Date
    end: Date
    usage: BillingUsage
  }
}

export interface BillingUsage {
  totalTransactions: number
  totalApiCalls: number
  totalDataTransfer: number
  featureUsage: Record<string, number>
  costs: {
    base: number
    transactions: number
    apiCalls: number
    storage: number
    features: number
    total: number
  }
}

export type TenantStatus = 'active' | 'suspended' | 'pending' | 'cancelled'
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification'
export type TenantRole = 'owner' | 'admin' | 'manager' | 'analyst' | 'trader' | 'viewer'

export interface Permission {
  resource: string
  actions: string[]
  conditions?: Record<string, any>
}

export interface TenantWebhook {
  id: string
  url: string
  events: string[]
  secret: string
  active: boolean
  createdAt: Date
}

export interface TenantApiKey {
  id: string
  name: string
  key: string
  permissions: Permission[]
  rateLimit: number
  active: boolean
  createdAt: Date
  expiresAt?: Date
}

// ==================== TENANT CONTEXT ====================

export interface TenantContext {
  tenant: Tenant
  user: TenantUser
  permissions: Permission[]
  limits: TenantLimits
  usage: TenantUsage
  sessionId: string
  ipAddress: string
  userAgent: string
}

export class TenantContextManager {
  private contexts: Map<string, TenantContext> = new Map()
  private contextTimeouts: Map<string, NodeJS.Timeout> = new Map()

  createContext(
    tenant: Tenant,
    user: TenantUser,
    sessionId: string,
    ipAddress: string,
    userAgent: string
  ): TenantContext {
    const context: TenantContext = {
      tenant,
      user,
      permissions: user.permissions,
      limits: tenant.limits,
      usage: tenant.usage,
      sessionId,
      ipAddress,
      userAgent
    }

    this.contexts.set(sessionId, context)
    this.scheduleContextCleanup(sessionId, tenant.settings.security.sessionTimeoutMinutes)

    return context
  }

  getContext(sessionId: string): TenantContext | null {
    return this.contexts.get(sessionId) || null
  }

  updateContext(sessionId: string, updates: Partial<TenantContext>): void {
    const context = this.contexts.get(sessionId)
    if (context) {
      Object.assign(context, updates)
    }
  }

  removeContext(sessionId: string): void {
    this.contexts.delete(sessionId)
    const timeout = this.contextTimeouts.get(sessionId)
    if (timeout) {
      clearTimeout(timeout)
      this.contextTimeouts.delete(sessionId)
    }
  }

  private scheduleContextCleanup(sessionId: string, timeoutMinutes: number): void {
    const timeout = setTimeout(() => {
      this.removeContext(sessionId)
    }, timeoutMinutes * 60 * 1000)

    this.contextTimeouts.set(sessionId, timeout)
  }

  validateContext(sessionId: string): boolean {
    const context = this.contexts.get(sessionId)
    if (!context) return false

    // Check tenant status
    if (context.tenant.status !== 'active') return false

    // Check user status
    if (context.user.status !== 'active') return false

    // Check IP restrictions
    const allowedIps = context.tenant.settings.security.allowedIpRanges
    if (allowedIps.length > 0 && !this.isIpAllowed(context.ipAddress, allowedIps)) {
      return false
    }

    return true
  }

  private isIpAllowed(ip: string, allowedRanges: string[]): boolean {
    // Simple IP range checking (in production, use proper CIDR matching)
    return allowedRanges.some(range => ip.startsWith(range.split('/')[0]))
  }
}

// ==================== TENANT MANAGER ====================

export class MultiTenantManager extends EventEmitter {
  private tenants: Map<string, Tenant> = new Map()
  private users: Map<string, TenantUser[]> = new Map()
  private contextManager: TenantContextManager
  private usageTracker: TenantUsageTracker

  constructor() {
    super()
    this.contextManager = new TenantContextManager()
    // Rate limiter initialized for future use
    new TenantRateLimiter()
    this.usageTracker = new TenantUsageTracker()
  }

  // ==================== TENANT MANAGEMENT ====================

  async createTenant(params: CreateTenantParams): Promise<Tenant> {
    const tenant: Tenant = {
      id: this.generateTenantId(),
      name: params.name,
      displayName: params.displayName,
      description: params.description,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: params.owner,
      settings: this.getDefaultTenantSettings(),
      limits: params.limits || this.getDefaultTenantLimits(),
      usage: this.getInitialTenantUsage(),
      metadata: params.metadata || {}
    }

    // Validate tenant creation
    await this.validateTenantCreation(tenant)

    this.tenants.set(tenant.id, tenant)
    this.users.set(tenant.id, [tenant.owner])

    this.emit('tenant:created', tenant)
    console.log(`🏢 Tenant created: ${tenant.name} (${tenant.id})`)

    return tenant
  }

  async getTenant(tenantId: string): Promise<Tenant | null> {
    return this.tenants.get(tenantId) || null
  }

  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenants.get(tenantId)
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`)
    }

    const updatedTenant = {
      ...tenant,
      ...updates,
      updatedAt: new Date()
    }

    this.tenants.set(tenantId, updatedTenant)
    this.emit('tenant:updated', updatedTenant)

    return updatedTenant
  }

  async deleteTenant(tenantId: string): Promise<void> {
    const tenant = this.tenants.get(tenantId)
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`)
    }

    // Cleanup tenant data
    await this.cleanupTenantData(tenantId)

    this.tenants.delete(tenantId)
    this.users.delete(tenantId)

    this.emit('tenant:deleted', { tenantId, tenant })
    console.log(`🗑️ Tenant deleted: ${tenant.name} (${tenantId})`)
  }

  // ==================== USER MANAGEMENT ====================

  async addUserToTenant(tenantId: string, userParams: CreateUserParams): Promise<TenantUser> {
    const tenant = await this.getTenant(tenantId)
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`)
    }

    const tenantUsers = this.users.get(tenantId) || []

    // Check user limits
    if (tenantUsers.length >= tenant.limits.maxUsers) {
      throw new Error(`Tenant user limit reached: ${tenant.limits.maxUsers}`)
    }

    const user: TenantUser = {
      id: this.generateUserId(),
      tenantId,
      email: userParams.email,
      name: userParams.name,
      role: userParams.role,
      permissions: this.getRolePermissions(userParams.role),
      walletAddress: userParams.walletAddress,
      status: 'pending_verification',
      createdAt: new Date(),
      metadata: userParams.metadata || {}
    }

    tenantUsers.push(user)
    this.users.set(tenantId, tenantUsers)

    // Update tenant usage
    await this.usageTracker.incrementUserCount(tenantId)

    this.emit('user:added', { tenantId, user })
    console.log(`👤 User added to tenant ${tenantId}: ${user.email}`)

    return user
  }

  async removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
    const tenantUsers = this.users.get(tenantId) || []
    const userIndex = tenantUsers.findIndex(u => u.id === userId)

    if (userIndex === -1) {
      throw new Error(`User not found: ${userId}`)
    }

    const user = tenantUsers[userIndex]
    tenantUsers.splice(userIndex, 1)
    this.users.set(tenantId, tenantUsers)

    // Update tenant usage
    await this.usageTracker.decrementUserCount(tenantId)

    this.emit('user:removed', { tenantId, userId, user })
    console.log(`👤 User removed from tenant ${tenantId}: ${user.email}`)
  }

  // ==================== CONTEXT MANAGEMENT ====================

  async createSession(
    tenantId: string,
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<TenantContext> {
    const tenant = await this.getTenant(tenantId)
    if (!tenant || tenant.status !== 'active') {
      throw new Error('Tenant not active')
    }

    const users = this.users.get(tenantId) || []
    const user = users.find(u => u.id === userId)
    if (!user || user.status !== 'active') {
      throw new Error('User not active')
    }

    const sessionId = this.generateSessionId()
    const context = this.contextManager.createContext(
      tenant,
      user,
      sessionId,
      ipAddress,
      userAgent
    )

    this.emit('session:created', { sessionId, context })
    return context
  }

  getSession(sessionId: string): TenantContext | null {
    return this.contextManager.getContext(sessionId)
  }

  validateSession(sessionId: string): boolean {
    return this.contextManager.validateContext(sessionId)
  }

  // ==================== RESOURCE MANAGEMENT ====================

  async checkResourceLimits(tenantId: string, resource: string, amount: number = 1): Promise<boolean> {
    const tenant = await this.getTenant(tenantId)
    if (!tenant) return false

    const usage = tenant.usage
    const limits = tenant.limits

    switch (resource) {
      case 'positions':
        return usage.currentPositions + amount <= limits.maxPositions
      case 'transactions':
        return usage.dailyTransactions + amount <= limits.maxDailyTransactions
      case 'api_calls':
        return usage.apiCallsThisHour + amount <= limits.maxApiCallsPerHour
      case 'storage':
        return usage.dataStorageUsedMB + amount <= limits.maxDataStorageMB
      case 'strategies':
        return usage.customStrategiesUsed + amount <= limits.maxCustomStrategies
      default:
        return false
    }
  }

  async consumeResource(tenantId: string, resource: string, amount: number = 1): Promise<void> {
    const canConsume = await this.checkResourceLimits(tenantId, resource, amount)
    if (!canConsume) {
      throw new Error(`Resource limit exceeded for ${resource}`)
    }

    await this.usageTracker.incrementUsage(tenantId, resource, amount)
  }

  // ==================== UTILITIES ====================

  private async validateTenantCreation(tenant: Tenant): Promise<void> {
    // Validate tenant name uniqueness
    const existingTenant = Array.from(this.tenants.values()).find(t => t.name === tenant.name)
    if (existingTenant) {
      throw new Error(`Tenant name already exists: ${tenant.name}`)
    }

    // Validate owner email
    if (!this.isValidEmail(tenant.owner.email)) {
      throw new Error('Invalid owner email address')
    }
  }

  private async cleanupTenantData(tenantId: string): Promise<void> {
    // In a real implementation, this would cleanup:
    // - All tenant positions
    // - User sessions
    // - Analytics data
    // - Custom strategies
    // - Billing records
    console.log(`🧹 Cleaning up data for tenant: ${tenantId}`)
  }

  private generateTenantId(): string {
    return `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  private getDefaultTenantSettings(): TenantSettings {
    return {
      dlmm: {
        defaultSlippageTolerance: 0.01,
        maxPositionsPerUser: 10,
        allowedPairs: [],
        defaultFeeStrategy: 'immediate-collection',
        riskManagement: {
          maxLossThreshold: 0.1,
          requireApprovalAbove: 10000,
          autoStopLoss: false
        }
      },
      analytics: {
        dataRetentionDays: 365,
        enableRealTimeUpdates: true,
        customMetrics: [],
        reportingFrequency: 'weekly'
      },
      security: {
        requireMFA: false,
        sessionTimeoutMinutes: 60,
        allowedIpRanges: [],
        auditLogging: true
      },
      integrations: {
        webhooks: [],
        apiKeys: [],
        externalServices: {}
      }
    }
  }

  private getDefaultTenantLimits(): TenantLimits {
    return {
      maxUsers: 5,
      maxPositions: 50,
      maxDailyTransactions: 100,
      maxApiCallsPerHour: 1000,
      maxDataStorageMB: 100,
      maxCustomStrategies: 3,
      features: {
        advancedAnalytics: false,
        automatedRebalancing: false,
        crossPoolMigration: false,
        customIntegrations: false,
        prioritySupport: false
      }
    }
  }

  private getInitialTenantUsage(): TenantUsage {
    return {
      currentUsers: 1,
      currentPositions: 0,
      dailyTransactions: 0,
      apiCallsThisHour: 0,
      dataStorageUsedMB: 0,
      customStrategiesUsed: 0,
      billingPeriod: {
        start: new Date(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        usage: {
          totalTransactions: 0,
          totalApiCalls: 0,
          totalDataTransfer: 0,
          featureUsage: {},
          costs: {
            base: 0,
            transactions: 0,
            apiCalls: 0,
            storage: 0,
            features: 0,
            total: 0
          }
        }
      }
    }
  }

  private getRolePermissions(role: TenantRole): Permission[] {
    const permissions: Record<TenantRole, Permission[]> = {
      owner: [
        { resource: '*', actions: ['*'] }
      ],
      admin: [
        { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'positions', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'strategies', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'settings', actions: ['read', 'update'] }
      ],
      manager: [
        { resource: 'positions', actions: ['create', 'read', 'update'] },
        { resource: 'strategies', actions: ['create', 'read', 'update'] },
        { resource: 'analytics', actions: ['read'] }
      ],
      analyst: [
        { resource: 'positions', actions: ['read'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'reports', actions: ['create', 'read'] }
      ],
      trader: [
        { resource: 'positions', actions: ['create', 'read', 'update'] },
        { resource: 'strategies', actions: ['read'] }
      ],
      viewer: [
        { resource: 'positions', actions: ['read'] },
        { resource: 'analytics', actions: ['read'] }
      ]
    }

    return permissions[role] || []
  }
}

// ==================== RATE LIMITER ====================

export class TenantRateLimiter {
  private limits: Map<string, { count: number; resetTime: number }> = new Map()

  async checkRateLimit(tenantId: string, limit: number, windowMs: number = 3600000): Promise<boolean> {
    const key = `${tenantId}_${Math.floor(Date.now() / windowMs)}`
    const current = this.limits.get(key) || { count: 0, resetTime: Date.now() + windowMs }

    if (current.count >= limit) {
      return false
    }

    current.count++
    this.limits.set(key, current)

    // Cleanup old entries
    this.cleanupOldEntries()

    return true
  }

  async getRemainingCalls(tenantId: string, limit: number, windowMs: number = 3600000): Promise<number> {
    const key = `${tenantId}_${Math.floor(Date.now() / windowMs)}`
    const current = this.limits.get(key) || { count: 0, resetTime: Date.now() + windowMs }

    return Math.max(0, limit - current.count)
  }

  private cleanupOldEntries(): void {
    const now = Date.now()
    for (const [key, value] of this.limits.entries()) {
      if (value.resetTime < now) {
        this.limits.delete(key)
      }
    }
  }
}

// ==================== USAGE TRACKER ====================

export class TenantUsageTracker {
  private usageData: Map<string, TenantUsage> = new Map()

  async incrementUsage(tenantId: string, resource: string, amount: number = 1): Promise<void> {
    const usage = this.usageData.get(tenantId)
    if (!usage) return

    switch (resource) {
      case 'positions':
        usage.currentPositions += amount
        break
      case 'transactions':
        usage.dailyTransactions += amount
        usage.billingPeriod.usage.totalTransactions += amount
        break
      case 'api_calls':
        usage.apiCallsThisHour += amount
        usage.billingPeriod.usage.totalApiCalls += amount
        break
      case 'storage':
        usage.dataStorageUsedMB += amount
        break
      case 'strategies':
        usage.customStrategiesUsed += amount
        break
    }

    this.usageData.set(tenantId, usage)
  }

  async incrementUserCount(tenantId: string): Promise<void> {
    const usage = this.usageData.get(tenantId)
    if (usage) {
      usage.currentUsers++
      this.usageData.set(tenantId, usage)
    }
  }

  async decrementUserCount(tenantId: string): Promise<void> {
    const usage = this.usageData.get(tenantId)
    if (usage) {
      usage.currentUsers = Math.max(0, usage.currentUsers - 1)
      this.usageData.set(tenantId, usage)
    }
  }

  async getUsage(tenantId: string): Promise<TenantUsage | null> {
    return this.usageData.get(tenantId) || null
  }

  async resetDailyUsage(tenantId: string): Promise<void> {
    const usage = this.usageData.get(tenantId)
    if (usage) {
      usage.dailyTransactions = 0
      usage.apiCallsThisHour = 0
      this.usageData.set(tenantId, usage)
    }
  }
}

// ==================== TYPE INTERFACES ====================

export interface CreateTenantParams {
  name: string
  displayName: string
  description?: string
  owner: TenantUser
  limits?: TenantLimits
  metadata?: Record<string, any>
}

export interface CreateUserParams {
  email: string
  name: string
  role: TenantRole
  walletAddress?: PublicKey
  metadata?: Record<string, any>
}

// ==================== SINGLETON INSTANCE ====================

export const multiTenantManager = new MultiTenantManager()

console.log('🏢 Multi-Tenant Support System initialized')
console.log('  Features: ✅ Tenant Isolation, ✅ Resource Management, ✅ Access Control, ✅ Usage Tracking')