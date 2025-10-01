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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold gradient-text">Risk Management Dashboard</h1>
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
            Risk Monitoring & Management
          </h2>
          <p className="text-gray-600">
            Real-time risk assessment, impermanent loss tracking, and stress testing for your DLMM positions
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="il-tracker">IL Tracker</TabsTrigger>
            <TabsTrigger value="stress-test">Stress Test</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

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
