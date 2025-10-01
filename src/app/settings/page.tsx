'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Home,
  Settings as SettingsIcon,
  Wallet,
  Monitor,
  Bell,
  Zap,
  Shield,
  Link2,
  Code,
} from 'lucide-react'
import { WalletSettings } from '@/components/settings/wallet-settings'
import { DisplayPreferences } from '@/components/settings/display-preferences'
import { AlertPreferences } from '@/components/settings/alert-preferences'
import { PerformanceSettings } from '@/components/settings/performance-settings'
import { PrivacySettings } from '@/components/settings/privacy-settings'
import { IntegrationSettings } from '@/components/settings/integration-settings'
import { AdvancedSettings } from '@/components/settings/advanced-settings'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-600 to-slate-600 flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Settings & Configuration</h1>
                <p className="text-sm text-gray-500">Manage your preferences and account</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/app">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Applications
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              <SettingsIcon className="w-3 h-3 mr-1" />
              7 Settings Categories
            </Badge>
          </div>
          <p className="text-gray-600 max-w-3xl">
            Customize your Saros DLMM Position Manager experience with comprehensive settings for
            wallet management, display preferences, notifications, performance, privacy, integrations,
            and advanced options. All settings are stored locally and sync across sessions.
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="wallet" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* Wallet Settings Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Management</h2>
              <p className="text-gray-600">
                Manage your connected Solana wallets, view transaction history, and security settings
              </p>
            </div>
            <WalletSettings />
          </TabsContent>

          {/* Display Preferences Tab */}
          <TabsContent value="display" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Display Preferences</h2>
              <p className="text-gray-600">
                Customize the look and feel of the application to match your preferences
              </p>
            </div>
            <DisplayPreferences />
          </TabsContent>

          {/* Alert Preferences Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert Preferences</h2>
              <p className="text-gray-600">
                Configure notifications and alerts for important position events and price changes
              </p>
            </div>
            <AlertPreferences />
          </TabsContent>

          {/* Performance Settings Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Settings</h2>
              <p className="text-gray-600">
                Optimize data refresh rates, caching, and resource usage for your device
              </p>
            </div>
            <PerformanceSettings />
          </TabsContent>

          {/* Privacy & Security Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy & Security</h2>
              <p className="text-gray-600">
                Control your data privacy, security settings, and account management
              </p>
            </div>
            <PrivacySettings />
          </TabsContent>

          {/* Integration Settings Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Integration Settings</h2>
              <p className="text-gray-600">
                Manage API keys, third-party connections, webhooks, and data export settings
              </p>
            </div>
            <IntegrationSettings />
          </TabsContent>

          {/* Advanced Settings Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced Settings</h2>
              <p className="text-gray-600">
                Configure RPC endpoints, transaction parameters, and developer options
              </p>
            </div>
            <AdvancedSettings />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8 mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">Built for the Saros DLMM Demo Challenge</p>
            <p className="text-sm text-gray-500">
              Settings are stored locally and never leave your device
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
