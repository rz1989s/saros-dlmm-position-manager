import { DashboardHeader } from '@/components/dashboard-header'
import { LazyWrapper } from '@/components/ui/lazy-loading'
import { LazyPositionsList } from '@/lib/lazy-components'
import { DashboardSkeleton } from '@/components/ui/loading-states'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
      <DashboardHeader />
      <LazyWrapper fallback={<DashboardSkeleton />}>
        <LazyPositionsList />
      </LazyWrapper>
    </div>
  )
}