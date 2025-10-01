'use client'

/**
 * Settings management hook
 */

import { useState, useEffect, useCallback } from 'react'
import { UserSettings, DEFAULT_SETTINGS } from '@/lib/settings/types'
import { loadSettings, saveSettings, resetSettings as resetStoredSettings } from '@/lib/settings/storage'

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [isDirty, setIsDirty] = useState(false)

  // Load settings on mount
  useEffect(() => {
    const loaded = loadSettings()
    setSettings(loaded)
    setIsLoading(false)
  }, [])

  // Save settings when they change
  useEffect(() => {
    if (!isLoading && isDirty) {
      saveSettings(settings)
      setIsDirty(false)
    }
  }, [settings, isLoading, isDirty])

  // Update settings
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }))
    setIsDirty(true)
  }, [])

  // Update specific section
  const updateDisplayPreferences = useCallback((updates: Partial<UserSettings['display']>) => {
    setSettings((prev) => ({
      ...prev,
      display: { ...prev.display, ...updates },
    }))
    setIsDirty(true)
  }, [])

  const updateAlertPreferences = useCallback((updates: Partial<UserSettings['alerts']>) => {
    setSettings((prev) => ({
      ...prev,
      alerts: { ...prev.alerts, ...updates },
    }))
    setIsDirty(true)
  }, [])

  const updatePerformanceSettings = useCallback((updates: Partial<UserSettings['performance']>) => {
    setSettings((prev) => ({
      ...prev,
      performance: { ...prev.performance, ...updates },
    }))
    setIsDirty(true)
  }, [])

  const updatePrivacySettings = useCallback((updates: Partial<UserSettings['privacy']>) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, ...updates },
    }))
    setIsDirty(true)
  }, [])

  const updateIntegrationSettings = useCallback((updates: Partial<UserSettings['integrations']>) => {
    setSettings((prev) => ({
      ...prev,
      integrations: { ...prev.integrations, ...updates },
    }))
    setIsDirty(true)
  }, [])

  const updateAdvancedSettings = useCallback((updates: Partial<UserSettings['advanced']>) => {
    setSettings((prev) => ({
      ...prev,
      advanced: { ...prev.advanced, ...updates },
    }))
    setIsDirty(true)
  }, [])

  // Reset to defaults
  const resetSettings = useCallback(() => {
    const defaults = resetStoredSettings()
    setSettings(defaults)
    setIsDirty(false)
  }, [])

  return {
    settings,
    isLoading,
    isDirty,
    updateSettings,
    updateDisplayPreferences,
    updateAlertPreferences,
    updatePerformanceSettings,
    updatePrivacySettings,
    updateIntegrationSettings,
    updateAdvancedSettings,
    resetSettings,
  }
}
