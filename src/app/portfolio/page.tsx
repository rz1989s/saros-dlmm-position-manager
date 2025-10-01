'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Home,
  TrendingUp,
  PieChart,
  GitMerge,
  Target,
  AlertTriangle,
  ArrowRight
} from 'lucide-react'
import { PortfolioOverview } from '@/components/portfolio/portfolio-overview'
import { MultiPositionMatrix } from '@/components/portfolio/multi-position-matrix'
import { OptimizationPanel } from '@/components/portfolio/optimization-panel'
import { DiversificationChart } from '@/components/portfolio/diversification-chart'
import { BenchmarkingWidget } from '@/components/portfolio/benchmarking-widget'
import { ConsolidationSuggestions } from '@/components/portfolio/consolidation-suggestions'

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Portfolio Management Center</h1>
                <p className="text-sm text-gray-500">Multi-position analysis & optimization</p>
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
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              6 Portfolio Features Integrated
            </Badge>
          </div>
          <p className="text-gray-600 max-w-3xl">
            Comprehensive portfolio management with multi-position analysis, optimization, diversification scoring,
            benchmarking, and consolidation opportunities. All powered by Saros DLMM SDK.
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <GitMerge className="h-4 w-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Optimization
            </TabsTrigger>
            <TabsTrigger value="diversification" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Diversification
            </TabsTrigger>
            <TabsTrigger value="benchmarking" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Benchmarking
            </TabsTrigger>
            <TabsTrigger value="consolidation" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Consolidation
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <PortfolioOverview />
          </TabsContent>

          {/* Multi-Position Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <MultiPositionMatrix />
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <OptimizationPanel />
          </TabsContent>

          {/* Diversification Tab */}
          <TabsContent value="diversification" className="space-y-6">
            <DiversificationChart />
          </TabsContent>

          {/* Benchmarking Tab */}
          <TabsContent value="benchmarking" className="space-y-6">
            <BenchmarkingWidget />
          </TabsContent>

          {/* Consolidation Tab */}
          <TabsContent value="consolidation" className="space-y-6">
            <ConsolidationSuggestions />
          </TabsContent>
        </Tabs>

        {/* Related Demos */}
        <Card className="mt-8 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Related SDK Demos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: 'Multi-Position Analysis', path: '/demos/multi-position-analysis' },
                { name: 'Portfolio Optimizer', path: '/demos/portfolio-optimizer' },
                { name: 'Diversification', path: '/demos/diversification' },
                { name: 'Consolidation', path: '/demos/consolidation' },
                { name: 'Portfolio Benchmarking', path: '/demos/portfolio-benchmarking' },
                { name: 'Advanced Portfolio', path: '/demos/advanced-portfolio-analytics' }
              ].map((demo) => (
                <Link key={demo.path} href={demo.path}>
                  <Button variant="outline" className="w-full justify-between group hover:border-blue-500">
                    {demo.name}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
