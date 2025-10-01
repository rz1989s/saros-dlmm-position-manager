'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FeatureIdentifier } from '@/components/sdk/feature-identifier'
import { SDK_FEATURES } from '@/lib/sdk-showcase/feature-registry'
import { Globe, CheckCircle, Shield } from 'lucide-react'

export default function MultiProviderOracleDemo() {
  const [providers] = useState([
    { name: 'Pyth Network', status: 'active', latency: 120, confidence: 0.98, price: 152.45 },
    { name: 'Switchboard', status: 'active', latency: 150, confidence: 0.95, price: 152.43 },
    { name: 'Chainlink', status: 'fallback', latency: 200, confidence: 0.97, price: 152.40 }
  ])

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <FeatureIdentifier
        feature={SDK_FEATURES[7] || { id: 7, name: 'Multi-Provider Oracle System', status: 'completed' }}
        badgePosition="top-right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
            <Globe className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Phase 0: Oracle Integration</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Multi-Provider Oracle System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unified oracle system with automatic failover across multiple price feed providers
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3" />
              SDK Feature #7
            </Badge>
            <Badge variant="outline" className="gap-1 border-purple-500 text-purple-700">
              <Shield className="h-3 w-3" />
              Redundant System
            </Badge>
          </div>
        </motion.div>
      </FeatureIdentifier>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Card key={provider.name} className={provider.status === 'active' ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{provider.name}</span>
                <Badge className={provider.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                  {provider.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="font-bold">${provider.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <span className="font-bold">{(provider.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Latency</span>
                <span className="font-bold">{provider.latency}ms</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>• <strong>Primary:</strong> Pyth Network (fastest, most reliable)</div>
            <div>• <strong>Secondary:</strong> Switchboard (automatic failover)</div>
            <div>• <strong>Fallback:</strong> Chainlink (emergency backup)</div>
            <div>• <strong>File:</strong> <code className="text-xs bg-muted px-2 py-1 rounded">src/lib/oracle/price-feeds.ts</code></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}