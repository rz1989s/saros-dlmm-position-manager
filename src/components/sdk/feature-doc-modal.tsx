'use client'

import React, { useState } from 'react'
import { FeatureInfo } from './feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  HelpCircle,
  Code,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureDocModalProps {
  featureId: number
  trigger?: React.ReactNode
  className?: string
}

export function FeatureDocModal({ featureId, trigger, className }: FeatureDocModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const feature = SDK_FEATURES[featureId]

  if (!feature) {
    return null
  }

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const getStatusIcon = (status: FeatureInfo['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'partial':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'planned':
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: FeatureInfo['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50 text-green-800'
      case 'partial':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800'
      case 'planned':
        return 'border-gray-500 bg-gray-50 text-gray-800'
    }
  }

  // Generate example code based on feature
  const generateExampleCode = (feature: FeatureInfo) => {
    switch (feature.id) {
      case 1: // Pool Data Loading
        return `// Pool Data Loading Example
import { dlmmClient } from '@/lib/dlmm/client'

// Fetch pool pairs
const pairs = await dlmmClient.getPairs()
console.log('Available pairs:', pairs.length)

// Get specific pool data
const poolData = await dlmmClient.getPoolData(poolAddress)
console.log('Pool:', poolData)`

      case 2: // Position Discovery
        return `// Position Discovery Example
import { useUserPositions } from '@/hooks/use-dlmm'

function PositionComponent() {
  const { positions, loading } = useUserPositions()

  return (
    <div>
      {positions.map(position => (
        <div key={position.id}>
          Position: {position.tokenX}/{position.tokenY}
        </div>
      ))}
    </div>
  )
}`

      case 9: // Multi-Provider Oracle
        return `// Multi-Provider Oracle Example
import { oraclePriceFeeds } from '@/lib/oracle/price-feeds'

// Get price with fallback
const price = await oraclePriceFeeds.getPrice('SOL/USD')
console.log('SOL Price:', price.price, 'Source:', price.source)

// Get multiple prices
const prices = await oraclePriceFeeds.getBatchPrices(['SOL/USD', 'BTC/USD'])
console.log('Batch prices:', prices)`

      case 16: // P&L Tracking
        return `// P&L Tracking Example
import { PnLTracker } from '@/components/analytics/pnl-tracker'

<PnLTracker
  positions={userPositions}
  timeframe="7d"
  showBreakdown={true}
/>`

      default:
        return `// ${feature.name} Implementation
// This feature is ${feature.status}
${feature.sdkLocation ? `// Location: ${feature.sdkLocation}` : ''}

// Example implementation will be available when feature is completed
console.log('Feature ${feature.id}: ${feature.name}')
console.log('Status: ${feature.status}')`
    }
  }

  const exampleCode = generateExampleCode(feature)

  const defaultTrigger = (
    <Button
      size="sm"
      variant="ghost"
      className="h-6 w-6 p-0 hover:bg-blue-100"
      title={`View documentation for ${feature.name}`}
    >
      <HelpCircle className="h-4 w-4 text-blue-600" />
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className={className}>
        {trigger || defaultTrigger}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                SDK #{feature.id}
              </Badge>
              {getStatusIcon(feature.status)}
            </div>
            <span>{feature.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="implementation" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Code
              </TabsTrigger>
              <TabsTrigger value="verification" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Verification
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Usage
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="space-y-4">
                {/* Status Banner */}
                <div className={cn(
                  'border-l-4 p-4 rounded-r',
                  getStatusColor(feature.status)
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(feature.status)}
                    <span className="font-semibold capitalize">{feature.status}</span>
                  </div>
                  {feature.description && (
                    <p className="text-sm">{feature.description}</p>
                  )}
                </div>

                {/* Feature Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Feature Information</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Feature ID:</dt>
                        <dd className="font-mono">#{feature.id}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Status:</dt>
                        <dd className="capitalize">{feature.status}</dd>
                      </div>
                      {feature.sdkLocation && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Location:</dt>
                          <dd className="font-mono text-xs">{feature.sdkLocation}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Integration Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>SDK Integration</span>
                        {feature.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Demo Available</span>
                        {feature.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Testing Complete</span>
                        {feature.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="implementation" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Implementation Example</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyCode(exampleCode, 'main')}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-3 w-3" />
                    {copiedCode === 'main' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{exampleCode}</code>
                  </pre>
                </div>

                {feature.sdkLocation && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">Source Location</h5>
                    <p className="text-sm text-blue-700 font-mono">{feature.sdkLocation}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="verification" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">Verification Checklist</h4>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    {feature.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <div className="font-medium">SDK Integration</div>
                      <div className="text-sm text-muted-foreground">
                        Feature is properly integrated with Saros DLMM SDK
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    {feature.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <div className="font-medium">Real Data Usage</div>
                      <div className="text-sm text-muted-foreground">
                        No mock data - all information comes from live SDK calls
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    {feature.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <div className="font-medium">Interactive Demo</div>
                      <div className="text-sm text-muted-foreground">
                        Feature has a working interactive demonstration
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    {feature.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <div className="font-medium">Error Handling</div>
                      <div className="text-sm text-muted-foreground">
                        Proper error handling and user feedback implemented
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">How to Use This Feature</h4>

                <div className="space-y-4">
                  {feature.status === 'completed' ? (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <h5 className="font-semibold text-green-800 mb-2">✅ Ready to Use</h5>
                      <p className="text-sm text-green-700">
                        This feature is fully implemented and available for use.
                        You can find it integrated throughout the application where relevant.
                      </p>
                    </div>
                  ) : feature.status === 'partial' ? (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <h5 className="font-semibold text-yellow-800 mb-2">🚧 Partially Implemented</h5>
                      <p className="text-sm text-yellow-700">
                        This feature has basic functionality implemented but is planned for enhancement.
                        Core features are available but additional capabilities are in development.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-800 mb-2">📋 Planned Implementation</h5>
                      <p className="text-sm text-gray-700">
                        This feature is planned for implementation. The SDK foundation is in place,
                        and the feature will be built according to the demo implementation plan.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h5 className="font-semibold">Integration Steps:</h5>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Import the required components and hooks</li>
                      <li>Set up proper error handling and loading states</li>
                      <li>Integrate with existing UI components</li>
                      <li>Test with real data and user interactions</li>
                      <li>Validate performance and user experience</li>
                    </ol>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}