'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Home, Shield } from 'lucide-react'
import { RiskOverview } from '@/components/risk/risk-overview'
import { AssessmentPanel } from '@/components/risk/assessment-panel'
import { ILTracker } from '@/components/risk/il-tracker'
import { StressTestingPanel } from '@/components/risk/stress-testing-panel'
import { AlertConfigurator } from '@/components/risk/alert-configurator'

export default function RiskPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4">
          <div className="flex items-center justify-between gap-2 xs:gap-3">
            <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-shrink">
              <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
              </div>
              <h1 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold gradient-text truncate">Risk Management Dashboard</h1>
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
            Risk Monitoring & Management
          </h2>
          <p className="text-sm xs:text-base text-gray-600">
            Real-time risk assessment, impermanent loss tracking, and stress testing for your DLMM positions
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
              <TabsList className="inline-flex w-full sm:grid sm:grid-cols-5 min-w-max sm:min-w-0 gap-1">
                <TabsTrigger value="overview" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="assessment" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">Assessment</TabsTrigger>
                <TabsTrigger value="il-tracker" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">IL Tracker</TabsTrigger>
                <TabsTrigger value="stress-test" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">Stress Test</TabsTrigger>
                <TabsTrigger value="alerts" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">Alerts</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <RiskOverview />
          </TabsContent>

          <TabsContent value="assessment" className="space-y-6">
            <AssessmentPanel />
          </TabsContent>

          <TabsContent value="il-tracker" className="space-y-6">
            <ILTracker />
          </TabsContent>

          <TabsContent value="stress-test" className="space-y-6">
            <StressTestingPanel />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertConfigurator />
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
