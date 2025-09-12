'use client'

import { DashboardHeader } from '@/components/dashboard-header'
import { StrategyDashboard } from '@/components/strategy/strategy-dashboard'

export default function StrategiesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
      <DashboardHeader />
      <StrategyDashboard />
    </div>
  )
}