'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Home, ArrowLeftRight } from 'lucide-react'
import { MigrationDiscovery } from '@/components/migration/migration-discovery'
import { MigrationAnalysis } from '@/components/migration/migration-analysis'
import { MigrationWizard } from '@/components/migration/migration-wizard'
import { MigrationSimulation } from '@/components/migration/migration-simulation'
import { AutomationPanel } from '@/components/migration/automation-panel'
import { MigrationHistory } from '@/components/migration/migration-history'

export default function MigrationPage() {
  const [activeTab, setActiveTab] = useState('discovery')

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold gradient-text">Migration Management Hub</h1>
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
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Cross-Pool Position Migration
          </h2>
          <p className="text-gray-600">
            Discover, analyze, plan, and execute position migrations with advanced risk assessment and automation
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2">
            <TabsTrigger value="discovery">Discovery</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="wizard">Wizard</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="discovery" className="space-y-6">
            <MigrationDiscovery />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <MigrationAnalysis />
          </TabsContent>

          <TabsContent value="wizard" className="space-y-6">
            <MigrationWizard />
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            <MigrationSimulation />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <AutomationPanel />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <MigrationHistory />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8 mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>Built for the Saros DLMM Demo Challenge • Live on Solana Mainnet</p>
        </div>
      </footer>
    </div>
  )
}
