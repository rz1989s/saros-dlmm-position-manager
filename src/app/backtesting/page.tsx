'use client'

import { BacktestingDashboard } from '@/components/backtesting/backtesting-dashboard'
import { DashboardHeader } from '@/components/dashboard-header'

export default function BacktestingPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
      <DashboardHeader />
      <BacktestingDashboard />
    </div>
  )
}