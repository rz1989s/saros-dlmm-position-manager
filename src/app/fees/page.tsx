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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold gradient-text">Fee Optimization Center</h1>
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
            Fee Tier Optimization & Analysis
          </h2>
          <p className="text-gray-600">
            Maximize fee earnings with AI-powered recommendations, market intelligence, and advanced simulation
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="optimizer">Optimizer</TabsTrigger>
            <TabsTrigger value="migration">Migration</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

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
