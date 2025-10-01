'use client'

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4">
          <div className="flex items-center justify-between gap-2 xs:gap-3">
            <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-shrink">
              <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                <ArrowLeftRight className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
              </div>
              <h1 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold gradient-text truncate">Migration Management Hub</h1>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/app">
                <Button variant="ghost" size="sm" className="text-xs xs:text-sm px-2 xs:px-3 py-1.5 xs:py-2">
                  <Home className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                  <span className="hidden xs:inline">Applications</span>
                  <span className="xs:hidden">App</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl xs:text-3xl font-bold text-gray-900 mb-2">
            Cross-Pool Position Migration
          </h2>
          <p className="text-sm xs:text-base text-gray-600">
            Discover, analyze, plan, and execute position migrations with advanced risk assessment and automation
          </p>
        </div>

        <Tabs defaultValue="discovery" className="space-y-6">
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
              <TabsList className="inline-flex w-full lg:grid lg:grid-cols-6 min-w-max lg:min-w-0 gap-1">
                <TabsTrigger value="discovery" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">Discovery</TabsTrigger>
                <TabsTrigger value="analysis" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">Analysis</TabsTrigger>
                <TabsTrigger value="wizard" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">Wizard</TabsTrigger>
                <TabsTrigger value="simulation" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">Simulation</TabsTrigger>
                <TabsTrigger value="automation" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">Automation</TabsTrigger>
                <TabsTrigger value="history" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">History</TabsTrigger>
              </TabsList>
            </div>
          </div>

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
