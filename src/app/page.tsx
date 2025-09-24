import { DashboardHeader } from '@/components/dashboard-header'
import PositionsList from '@/components/positions-list'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
      <DashboardHeader />
      <PositionsList />
    </div>
  )
}