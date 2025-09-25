'use client'

import { BacktestingDashboard } from '@/components/backtesting/backtesting-dashboard'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Activity, Zap } from 'lucide-react'

export default function BacktestingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-400" />
                Advanced Backtesting
              </h1>
              <p className="text-slate-300 mt-2">
                Test your DLMM strategies against historical data with professional-grade analytics
              </p>
            </div>
            <Badge variant="outline" className="border-green-500 text-green-400">
              100% SDK Utilization
            </Badge>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-white">Historical Simulation</h3>
                    <p className="text-sm text-slate-300">Realistic DLMM bin simulation</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-400" />
                  <div>
                    <h3 className="font-semibold text-white">Advanced Metrics</h3>
                    <p className="text-sm text-slate-300">Sharpe, Sortino, Max Drawdown</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-8 w-8 text-purple-400" />
                  <div>
                    <h3 className="font-semibold text-white">Strategy Testing</h3>
                    <p className="text-sm text-slate-300">Multiple strategy types</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard */}
        <BacktestingDashboard />
      </main>
    </div>
  )
}