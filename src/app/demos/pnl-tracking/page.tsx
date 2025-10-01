'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { LazyPnLTracker } from '@/lib/lazy-components'
import {  CheckCircle, DollarSign } from 'lucide-react'

export default function PnLTrackingDemo() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <FeatureIdentifier
        feature={SDK_FEATURES[12] || { id: 12, name: 'P&L Tracking System', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Phase 0: Portfolio Basics</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            P&L Tracking System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive profit and loss tracking with historical charts and position breakdown
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3" />
              SDK Feature #12
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      <LazyPnLTracker />

      <Card>
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>• Real-time P&L calculation across all positions</div>
            <div>• Historical performance tracking</div>
            <div>• Per-position breakdown with fees</div>
            <div>• Implementation: <code className="text-xs bg-muted px-2 py-1 rounded">src/components/analytics/pnl-tracker.tsx</code></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}