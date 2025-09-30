'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { LazyPortfolioOverview } from '@/lib/lazy-components'
import { PieChart, CheckCircle } from 'lucide-react'

export default function PortfolioOverviewDemo() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <FeatureIdentifier
        feature={SDK_FEATURES[13] || { id: 13, name: 'Portfolio Overview', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
            <PieChart className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Phase 0: Portfolio Basics</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Portfolio Overview
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive portfolio analysis with allocation charts and risk metrics
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3" />
              SDK Feature #13
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      <LazyPortfolioOverview />

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>• Portfolio-wide metrics and analytics</div>
            <div>• Asset allocation visualization</div>
            <div>• Risk assessment and diversification scores</div>
            <div>• Implementation: <code className="text-xs bg-muted px-2 py-1 rounded">src/components/analytics/portfolio-overview.tsx</code></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}