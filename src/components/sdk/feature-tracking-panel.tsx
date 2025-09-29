'use client'

import React, { useState, useEffect } from 'react'
import { useJudgeMode } from '@/contexts/judge-mode-context'
import { SDK_FEATURES, getFeatureStats } from '@/lib/sdk-showcase/feature-registry'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// Using div with overflow for scrolling
import {
  ChevronRight,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Hash
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureTrackingPanelProps {
  className?: string
}

export function FeatureTrackingPanel({ className }: FeatureTrackingPanelProps) {
  const { isJudgeMode, visibleFeatures } = useJudgeMode()
  const [isExpanded, setIsExpanded] = useState(false)
  const [_currentPage, setCurrentPage] = useState('/')

  // Track current page for context
  useEffect(() => {
    setCurrentPage(window.location.pathname)
  }, [])

  // Get feature statistics
  const stats = getFeatureStats()
  const visibleFeaturesArray = Array.from(visibleFeatures)
    .map(id => SDK_FEATURES[id])
    .filter(Boolean)

  // Calculate completion percentage
  const completionPercentage = Math.round(
    ((stats.completed + stats.partial) / stats.total) * 100
  )

  if (!isJudgeMode) {
    return null
  }

  const toggleExpanded = () => setIsExpanded(!isExpanded)

  return (
    <div
      className={cn(
        'fixed top-20 right-4 z-[9999] transition-all duration-300',
        isExpanded ? 'w-80' : 'w-12',
        className
      )}
    >
      {/* Collapsed state - just toggle button */}
      {!isExpanded && (
        <Button
          onClick={toggleExpanded}
          size="sm"
          className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          title="Open Feature Tracking Panel"
        >
          <BarChart3 className="h-5 w-5" />
        </Button>
      )}

      {/* Expanded state - full panel */}
      {isExpanded && (
        <Card className="shadow-xl border-2 border-blue-200 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                Judge Panel
              </CardTitle>
              <Button
                onClick={toggleExpanded}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">SDK Progress</span>
                <span className="font-semibold">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Feature Stats */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="font-semibold">{stats.completed}</span>
                </div>
                <div className="text-muted-foreground">Complete</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3 text-yellow-500" />
                  <span className="font-semibold">{stats.partial}</span>
                </div>
                <div className="text-muted-foreground">Partial</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <AlertCircle className="h-3 w-3 text-gray-500" />
                  <span className="font-semibold">{stats.planned}</span>
                </div>
                <div className="text-muted-foreground">Planned</div>
              </div>
            </div>

            {/* Current Page Features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Hash className="h-3 w-3" />
                Current Page Features
              </div>

              {visibleFeaturesArray.length > 0 ? (
                <div className="h-32 overflow-y-auto">
                  <div className="space-y-1">
                    {visibleFeaturesArray.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-center gap-2 p-2 rounded text-xs bg-gray-50"
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs px-1 py-0',
                            feature.status === 'completed' && 'border-green-500 text-green-700',
                            feature.status === 'partial' && 'border-yellow-500 text-yellow-700',
                            feature.status === 'planned' && 'border-gray-500 text-gray-700'
                          )}
                        >
                          #{feature.id}
                        </Badge>
                        <span className="flex-1 truncate" title={feature.name}>
                          {feature.name}
                        </span>
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          feature.status === 'completed' && 'bg-green-500',
                          feature.status === 'partial' && 'bg-yellow-500',
                          feature.status === 'planned' && 'bg-gray-400'
                        )} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No features visible on this page
                </div>
              )}
            </div>

            {/* Quick Navigation */}
            <div className="space-y-2">
              <div className="text-xs font-semibold">Quick Navigation</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => window.location.href = '/positions'}
                >
                  Positions
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => window.location.href = '/analytics'}
                >
                  Analytics
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => window.location.href = '/strategies'}
                >
                  Strategies
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => window.location.href = '/showcase'}
                >
                  Showcase
                </Button>
              </div>
            </div>

            {/* Total Visible Features Counter */}
            <div className="pt-2 border-t text-center">
              <div className="text-xs text-muted-foreground">
                {visibleFeatures.size} of {stats.total} features visible
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}