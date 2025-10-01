'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Home, DollarSign } from 'lucide-react'
import { FeeOverview } from '@/components/fees/fee-overview'
import { FeeOptimizer } from '@/components/fees/fee-optimizer'
import { FeeMigration } from '@/components/fees/fee-migration'
import { FeeSimulation } from '@/components/fees/fee-simulation'
import { MarketIntelligence } from '@/components/fees/market-intelligence'
import { HistoricalAnalysis } from '@/components/fees/historical-analysis'

export default function FeesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4">
          <div className="flex items-center justify-between gap-2 xs:gap-3">
            <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-shrink">
              <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
              </div>
              <h1 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold gradient-text truncate">Fee Optimization Center</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Fee Tier Optimization & Analysis
          </h2>
          <p className="text-gray-600">
            Maximize fee earnings with AI-powered recommendations, market intelligence, and advanced simulation
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
              <TabsList className="inline-flex w-full lg:grid lg:grid-cols-6 min-w-max lg:min-w-0 gap-1">
                <TabsTrigger value="overview" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="optimizer" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">Optimizer</TabsTrigger>
                <TabsTrigger value="migration" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">Migration</TabsTrigger>
                <TabsTrigger value="simulation" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">Simulation</TabsTrigger>
                <TabsTrigger value="market" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">Market</TabsTrigger>
                <TabsTrigger value="history" className="whitespace-nowrap px-3 py-2 text-xs xs:text-sm">History</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <FeeOverview />
          </TabsContent>

          <TabsContent value="optimizer" className="space-y-6">
            <FeeOptimizer />
          </TabsContent>

          <TabsContent value="migration" className="space-y-6">
            <FeeMigration />
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            <FeeSimulation />
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <MarketIntelligence />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <HistoricalAnalysis />
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
