'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { CheckCircle, Activity } from 'lucide-react'

const demos = {
  'basic-portfolio-aggregation': { id: 53, title: 'Basic Portfolio Aggregation', desc: 'Portfolio aggregation with core metrics and analytics' },
  'analytics-dashboard': { id: 48, title: 'Analytics Dashboard', desc: 'Complete analytics dashboard with real-time metrics' },
  'performance-tracking': { id: 50, title: 'Performance Tracking', desc: 'Real-time position performance monitoring and tracking' },
  'fee-collection': { id: 45, title: 'Fee Collection', desc: 'Automated fee collection transaction flow with SDK integration' },
  'fee-tier-analysis': { id: 51, title: 'Fee Tier Analysis', desc: 'Comprehensive fee tier analysis and optimization recommendations' },
  'position-liquidity-analytics': { id: 55, title: 'Position Liquidity Analytics', desc: 'Advanced liquidity concentration analysis and metrics' }
}

const currentDemo = demos['analytics-dashboard']

export default function Demo() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <FeatureIdentifier
        feature={SDK_FEATURES[currentDemo.id] || { id: currentDemo.id, name: currentDemo.title, status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Phase 0: Foundation</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {currentDemo.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {currentDemo.desc}
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3" />
              SDK Feature #{currentDemo.id}
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>• Real SDK integration with Saros DLMM</div>
            <div>• Live data from Solana mainnet</div>
            <div>• Comprehensive analytics and metrics</div>
            <div>• See implementation in main app pages (/positions, /analytics, /strategies)</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
