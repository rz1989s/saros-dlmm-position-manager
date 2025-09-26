'use client'

import { useState, useCallback } from 'react'
import { useDataSource, DataMode } from '@/contexts/data-source-context'
import { useWalletState } from '@/hooks/use-wallet-integration'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TestTube,
  Globe,
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react'
// Removed tooltip imports as component doesn't exist

interface DataSourceToggleProps {
  showTooltips?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function DataSourceToggle({
  showTooltips = true,
  size = 'md',
  className = ''
}: DataSourceToggleProps) {
  const { dataMode, setDataMode, isRealDataMode, isMockDataMode } = useDataSource()
  const { isConnected, isConnecting } = useWalletState()
  const [isChanging, setIsChanging] = useState(false)

  const handleModeChange = useCallback(async (newMode: DataMode) => {
    if (newMode === dataMode) return

    // Warning for real data without wallet
    if (newMode === 'real' && !isConnected) {
      const proceed = window.confirm(
        'Real data mode requires a connected wallet to fetch your actual positions. ' +
        'Would you like to continue? (You can connect your wallet later)'
      )
      if (!proceed) return
    }

    setIsChanging(true)
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500))
      setDataMode(newMode)
    } finally {
      setIsChanging(false)
    }
  }, [dataMode, setDataMode, isConnected])

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const RadioButton = ({
    mode,
    label,
    icon: Icon,
    description
  }: {
    mode: DataMode
    label: string
    icon: any
    description: string
  }) => {
    const isSelected = dataMode === mode
    const isDisabled = isChanging || isConnecting

    return (
      <Button
        variant={isSelected ? 'default' : 'outline'}
        size={size === 'md' ? 'default' : size}
        onClick={() => handleModeChange(mode)}
        disabled={isDisabled}
        title={showTooltips ? description : undefined}
        className={`
          flex items-center gap-2 transition-all duration-200
          ${isSelected ? 'ring-2 ring-saros-primary/20' : 'hover:bg-accent'}
          ${sizeClasses[size]}
          relative
        `}
      >
        {isChanging && dataMode !== mode ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : (
          <Icon className={iconSizes[size]} />
        )}
        {label}
        {isSelected && (
          <Badge variant="secondary" className="ml-1 text-xs">
            Active
          </Badge>
        )}
      </Button>
    )
  }

  const WarningIndicator = () => {
    if (isRealDataMode && !isConnected) {
      return (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">
            Real data mode active but wallet not connected
          </span>
        </div>
      )
    }

    if (isMockDataMode) {
      return (
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
          <Info className="h-4 w-4" />
          <span className="text-sm">
            Showing simulated data for demonstration
          </span>
        </div>
      )
    }

    return null
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Data Source:
        </span>
        <div className="flex items-center gap-2">
          <RadioButton
            mode="mock"
            label="Mock Data"
            icon={TestTube}
            description="Use simulated data perfect for testing and demonstration. No wallet required."
          />
          <RadioButton
            mode="real"
            label="Real Data"
            icon={Globe}
            description="Fetch actual data from the blockchain. Requires wallet connection to see your positions."
          />
        </div>
      </div>

      <WarningIndicator />
    </div>
  )
}

// Compact version for headers
export function CompactDataSourceToggle({ className = '' }: { className?: string }) {
  return (
    <DataSourceToggle
      size="sm"
      showTooltips={false}
      className={className}
    />
  )
}

// Status indicator only
export function DataSourceStatus({ className = '' }: { className?: string }) {
  const { dataMode } = useDataSource()

  return (
    <Badge
      variant={dataMode === 'real' ? 'default' : 'secondary'}
      className={`flex items-center gap-1 ${className}`}
    >
      {dataMode === 'real' ? (
        <>
          <Globe className="h-3 w-3" />
          Real Data
        </>
      ) : (
        <>
          <TestTube className="h-3 w-3" />
          Mock Data
        </>
      )}
    </Badge>
  )
}