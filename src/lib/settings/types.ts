/**
 * Settings types for the application
 */

export type Theme = 'light' | 'dark' | 'auto'
export type Currency = 'USD' | 'SOL' | 'EUR' | 'GBP'
export type NumberFormat = 'standard' | 'compact' | 'scientific'
export type Language = 'en' | 'es' | 'zh' | 'ja'
export type PerformanceMode = 'low' | 'normal' | 'high'
export type ExportFormat = 'json' | 'csv' | 'xlsx'

export interface DisplayPreferences {
  theme: Theme
  currency: Currency
  numberFormat: NumberFormat
  language: Language
  showDecimals: number
  use24Hour: boolean
  compactNumbers: boolean
}

export interface AlertPreferences {
  emailNotifications: boolean
  browserNotifications: boolean
  soundEnabled: boolean
  alertFrequency: 'realtime' | 'hourly' | 'daily'
  priceChangeThreshold: number
  ilThreshold: number
  feeThreshold: number
}

export interface PerformanceSettings {
  pollingInterval: number
  cacheEnabled: boolean
  autoRefresh: boolean
  performanceMode: PerformanceMode
  preloadData: boolean
  animationsEnabled: boolean
}

export interface PrivacySettings {
  sessionTimeout: number // in minutes
  requireApproval: boolean
  allowAnalytics: boolean
  shareData: boolean
}

export interface IntegrationSettings {
  apiKeys: Record<string, string>
  webhookUrl: string
  exportFormat: ExportFormat
  autoExport: boolean
}

export interface AdvancedSettings {
  rpcEndpoint: string
  customRpcEnabled: boolean
  slippageTolerance: number
  priorityFee: number
  developerMode: boolean
  experimentalFeatures: boolean
}

export interface UserSettings {
  display: DisplayPreferences
  alerts: AlertPreferences
  performance: PerformanceSettings
  privacy: PrivacySettings
  integrations: IntegrationSettings
  advanced: AdvancedSettings
}

export const DEFAULT_SETTINGS: UserSettings = {
  display: {
    theme: 'auto',
    currency: 'USD',
    numberFormat: 'standard',
    language: 'en',
    showDecimals: 2,
    use24Hour: false,
    compactNumbers: true,
  },
  alerts: {
    emailNotifications: false,
    browserNotifications: true,
    soundEnabled: true,
    alertFrequency: 'realtime',
    priceChangeThreshold: 5,
    ilThreshold: 2,
    feeThreshold: 100,
  },
  performance: {
    pollingInterval: 30000,
    cacheEnabled: true,
    autoRefresh: true,
    performanceMode: 'normal',
    preloadData: true,
    animationsEnabled: true,
  },
  privacy: {
    sessionTimeout: 30,
    requireApproval: true,
    allowAnalytics: true,
    shareData: false,
  },
  integrations: {
    apiKeys: {},
    webhookUrl: '',
    exportFormat: 'json',
    autoExport: false,
  },
  advanced: {
    rpcEndpoint: process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com',
    customRpcEnabled: false,
    slippageTolerance: 1,
    priorityFee: 0.00001,
    developerMode: false,
    experimentalFeatures: false,
  },
}
