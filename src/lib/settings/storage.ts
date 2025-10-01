/**
 * Settings storage and persistence utilities
 */

import { UserSettings, DEFAULT_SETTINGS } from './types'

const STORAGE_KEY = 'saros-dlmm-settings'
const STORAGE_VERSION = '1.0.0'

interface StoredSettings {
  version: string
  settings: UserSettings
  lastUpdated: string
}

/**
 * Load settings from localStorage
 */
export function loadSettings(): UserSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return DEFAULT_SETTINGS
    }

    const parsed: StoredSettings = JSON.parse(stored)

    // Version check - if version mismatch, use defaults
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Settings version mismatch, using defaults')
      return DEFAULT_SETTINGS
    }

    // Merge with defaults to handle new settings
    return mergeSettings(DEFAULT_SETTINGS, parsed.settings)
  } catch (error) {
    console.error('Failed to load settings:', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const stored: StoredSettings = {
      version: STORAGE_VERSION,
      settings,
      lastUpdated: new Date().toISOString(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

/**
 * Reset settings to defaults
 */
export function resetSettings(): UserSettings {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
  return DEFAULT_SETTINGS
}

/**
 * Export settings as JSON
 */
export function exportSettings(settings: UserSettings): string {
  const exported: StoredSettings = {
    version: STORAGE_VERSION,
    settings,
    lastUpdated: new Date().toISOString(),
  }
  return JSON.stringify(exported, null, 2)
}

/**
 * Import settings from JSON
 */
export function importSettings(json: string): UserSettings {
  try {
    const parsed: StoredSettings = JSON.parse(json)

    // Validate version
    if (parsed.version !== STORAGE_VERSION) {
      throw new Error('Invalid settings version')
    }

    // Merge with defaults
    return mergeSettings(DEFAULT_SETTINGS, parsed.settings)
  } catch (error) {
    console.error('Failed to import settings:', error)
    throw error
  }
}

/**
 * Deep merge settings objects
 */
function mergeSettings(defaults: UserSettings, overrides: Partial<UserSettings>): UserSettings {
  return {
    display: { ...defaults.display, ...overrides.display },
    alerts: { ...defaults.alerts, ...overrides.alerts },
    performance: { ...defaults.performance, ...overrides.performance },
    privacy: { ...defaults.privacy, ...overrides.privacy },
    integrations: { ...defaults.integrations, ...overrides.integrations },
    advanced: { ...defaults.advanced, ...overrides.advanced },
  }
}

/**
 * Validate settings object
 */
export function validateSettings(settings: unknown): settings is UserSettings {
  if (typeof settings !== 'object' || settings === null) {
    return false
  }

  const s = settings as Record<string, unknown>

  return (
    typeof s.display === 'object' &&
    typeof s.alerts === 'object' &&
    typeof s.performance === 'object' &&
    typeof s.privacy === 'object' &&
    typeof s.integrations === 'object' &&
    typeof s.advanced === 'object'
  )
}
