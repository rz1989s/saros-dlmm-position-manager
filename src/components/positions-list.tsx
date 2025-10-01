'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PositionCard } from '@/components/position-card'
import { WalletStatus } from '@/components/wallet-status'
import { AddLiquidityModal } from '@/components/modals/add-liquidity-modal-simple'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { PositionCardSkeleton } from '@/components/ui/loading-states'
import { StaggerList } from '@/components/animations/stagger-list'
import { DataSourceToggle } from '@/components/ui/data-source-toggle'
import { 
  RefreshCw,
  Plus,
  Filter,
  Search,
  AlertCircle,
  Wallet
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-dlmm'
import { useWalletState } from '@/hooks/use-wallet-integration'
import { useDataSource } from '@/contexts/data-source-context'
import { DLMMPosition, PositionAnalytics } from '@/lib/types'
import { calculatePositionAnalytics } from '@/lib/dlmm/utils'
import { getMockPositionAnalytics } from '@/lib/dlmm/mock-positions'

interface PositionsListProps {
  onCreatePosition?: () => void
  onManagePosition?: (position: DLMMPosition) => void
  onRebalancePosition?: (position: DLMMPosition) => void
  onCollectFees?: (position: DLMMPosition) => void
  onClosePosition?: (position: DLMMPosition) => void
}

const PositionsList = memo(function PositionsList({
  onCreatePosition,
  onManagePosition,
  onRebalancePosition,
  onCollectFees,
  onClosePosition,
}: PositionsListProps) {
  const { isConnected } = useWalletState()
  const { isMockDataMode } = useDataSource()
  const { positions, loading, refreshing, refreshPositions } = useUserPositions()
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [analytics, setAnalytics] = useState<Map<string, PositionAnalytics>>(new Map())
  const [showAddLiquidity, setShowAddLiquidity] = useState(false)

  // Calculate analytics for each position with stable values
  useEffect(() => {
    if (positions.length > 0) {
      const newAnalytics = new Map<string, PositionAnalytics>()

      positions.forEach(position => {
        // Use getMockPositionAnalytics for realistic, varied position data
        const mockAnalytics = getMockPositionAnalytics(position)

        // Convert mock analytics to PositionAnalytics format
        const positionAnalytics = calculatePositionAnalytics(
          position,
          mockAnalytics.currentValue,
          mockAnalytics.initialValue,
          mockAnalytics.totalFeesUsd
        )

        newAnalytics.set(position.id, positionAnalytics)
      })

      setAnalytics(newAnalytics)
    }
  }, [positions])

  const filteredPositions = useMemo(() => {
    return positions.filter(position => {
      // Filter by status
      if (filter === 'active' && !position.isActive) return false
      if (filter === 'inactive' && position.isActive) return false

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const poolName = `${position.tokenX.symbol}/${position.tokenY.symbol}`.toLowerCase()
        const address = position.poolAddress.toString().toLowerCase()

        if (!poolName.includes(query) && !address.includes(query)) {
          return false
        }
      }

      return true
    })
  }, [positions, filter, searchQuery])

  const activePositions = useMemo(() =>
    positions.filter(p => p.isActive).length,
    [positions]
  )

  const totalValue = useMemo(() =>
    Array.from(analytics.values()).reduce((sum, a) => sum + a.totalValue, 0),
    [analytics]
  )

  const totalPnL = useMemo(() =>
    Array.from(analytics.values()).reduce((sum, a) => sum + a.pnl.amount, 0),
    [analytics]
  )

  const handleCreatePosition = useCallback(() => {
    setShowAddLiquidity(true)
    onCreatePosition?.()
  }, [onCreatePosition])

  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setFilter('all')
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as 'all' | 'active' | 'inactive')
  }, [])

  const handleModalClose = useCallback(() => {
    setShowAddLiquidity(false)
  }, [])

  // Show wallet connection prompt only in real data mode when not connected
  if (!isConnected && !isMockDataMode) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Connect your Solana wallet to view and manage your DLMM positions
            </p>
            <WalletStatus />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <FeatureIdentifier
        feature={SDK_FEATURES[18]}
        badgePosition="top-right"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Positions</p>
                <p className="text-2xl font-bold">{positions.length}</p>
              </div>
              <Badge variant={activePositions > 0 ? "default" : "secondary"}>
                {activePositions} Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </FeatureIdentifier>

      {/* Controls */}
      <FeatureIdentifier
        feature={SDK_FEATURES[2]}
        badgePosition="top-left"
      >
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Positions</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPositions}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                size="sm"
                onClick={handleCreatePosition}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Position
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search positions..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={handleFilterChange}
                className="border border-input rounded-md px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Positions</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Data Source Toggle */}
          <div className="border-t pt-4">
            <DataSourceToggle />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <PositionCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && positions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Positions Found</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                You don&apos;t have any DLMM positions yet. Create your first position to start earning fees from liquidity provision.
              </p>
              <Button onClick={handleCreatePosition}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Position
              </Button>
            </div>
          )}

          {/* No Results */}
          {!loading && positions.length > 0 && filteredPositions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Positions Match</h3>
              <p className="text-muted-foreground text-center mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Positions Grid */}
          {!loading && filteredPositions.length > 0 && (
            <StaggerList
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              staggerDelay={0.1}
              variant="slideUp"
            >
              {filteredPositions.map((position) => {
                const positionAnalytics = analytics.get(position.id)
                if (!positionAnalytics) return null

                return (
                  <PositionCard
                    key={position.id}
                    position={position}
                    analytics={positionAnalytics}
                    onManage={onManagePosition}
                    onRebalance={onRebalancePosition}
                    onCollectFees={onCollectFees}
                    onClose={onClosePosition}
                  />
                )
              })}
            </StaggerList>
          )}

          {/* Pagination could be added here if needed */}
        </CardContent>
        </Card>
      </FeatureIdentifier>

      {/* Add Liquidity Modal */}
      <AddLiquidityModal
        isOpen={showAddLiquidity}
        onClose={handleModalClose}
      />
    </div>
  )
})

export default PositionsList