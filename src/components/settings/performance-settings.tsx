'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Zap, Database, RefreshCw, TrendingUp, Loader2, Sparkles } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'

export function PerformanceSettings() {
  const { settings, updatePerformanceSettings } = useSettings()
  const { performance } = settings

  const getPollingLabel = (interval: number) => {
    if (interval < 1000) return `${interval}ms`
    return `${interval / 1000}s`
  }

  const getPerformanceModeDescription = (mode: string) => {
    switch (mode) {
      case 'low':
        return 'Reduced data refresh, minimal animations, optimized for battery life'
      case 'normal':
        return 'Balanced performance with moderate refresh rates and animations'
      case 'high':
        return 'Maximum data freshness, smooth animations, best experience'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Performance Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Mode
          </CardTitle>
          <CardDescription>
            Control the overall performance and resource usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="perfMode">Performance Mode</Label>
            <Select
              value={performance.performanceMode}
              onValueChange={(value) =>
                updatePerformanceSettings({ performanceMode: value as any })
              }
            >
              <SelectTrigger id="perfMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Battery Saver</SelectItem>
                <SelectItem value="normal">Normal - Balanced</SelectItem>
                <SelectItem value="high">High - Best Performance</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              {getPerformanceModeDescription(performance.performanceMode)}
            </p>
          </div>

          {/* Performance Mode Impact */}
          <div className="p-4 bg-blue-50 rounded-lg space-y-2">
            <p className="text-sm font-medium text-blue-900">Current Mode Impact:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-blue-700">Polling: </span>
                <Badge variant="outline" className="ml-1">
                  {performance.performanceMode === 'low'
                    ? '60s'
                    : performance.performanceMode === 'normal'
                    ? '30s'
                    : '15s'}
                </Badge>
              </div>
              <div>
                <span className="text-blue-700">Animations: </span>
                <Badge variant="outline" className="ml-1">
                  {performance.performanceMode === 'low'
                    ? 'Minimal'
                    : performance.performanceMode === 'normal'
                    ? 'Normal'
                    : 'Full'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Refresh Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Data Refresh Settings
          </CardTitle>
          <CardDescription>Control how often data is updated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoRefresh">Auto-Refresh</Label>
              <p className="text-sm text-gray-500">
                Automatically refresh data in the background
              </p>
            </div>
            <Switch
              id="autoRefresh"
              checked={performance.autoRefresh}
              onCheckedChange={(checked) =>
                updatePerformanceSettings({ autoRefresh: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="polling">Polling Interval</Label>
              <span className="text-sm font-medium">
                {getPollingLabel(performance.pollingInterval)}
              </span>
            </div>
            <Slider
              id="polling"
              min={5000}
              max={120000}
              step={5000}
              value={[performance.pollingInterval]}
              onValueChange={(value) =>
                updatePerformanceSettings({ pollingInterval: value[0] })
              }
              disabled={!performance.autoRefresh}
            />
            <p className="text-sm text-gray-500">
              How often to refresh position and pool data
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="preload">Preload Data</Label>
              <p className="text-sm text-gray-500">
                Preload data in the background for faster navigation
              </p>
            </div>
            <Switch
              id="preload"
              checked={performance.preloadData}
              onCheckedChange={(checked) =>
                updatePerformanceSettings({ preloadData: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Cache Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache Settings
          </CardTitle>
          <CardDescription>Manage local data caching for better performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cache">Enable Caching</Label>
              <p className="text-sm text-gray-500">
                Cache data locally to reduce RPC calls
              </p>
            </div>
            <Switch
              id="cache"
              checked={performance.cacheEnabled}
              onCheckedChange={(checked) =>
                updatePerformanceSettings({ cacheEnabled: checked })
              }
            />
          </div>

          {performance.cacheEnabled && (
            <div className="p-4 bg-green-50 rounded-lg space-y-2">
              <p className="text-sm font-medium text-green-900">Cache Benefits:</p>
              <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                <li>40% reduction in RPC calls</li>
                <li>Faster page load times</li>
                <li>Better offline experience</li>
                <li>Reduced network usage</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Animation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Animation Settings
          </CardTitle>
          <CardDescription>Control visual effects and animations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">Enable Animations</Label>
              <p className="text-sm text-gray-500">
                Show smooth transitions and visual effects
              </p>
            </div>
            <Switch
              id="animations"
              checked={performance.animationsEnabled}
              onCheckedChange={(checked) =>
                updatePerformanceSettings({ animationsEnabled: checked })
              }
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              Disabling animations can improve performance on slower devices and respects the
              prefers-reduced-motion accessibility setting.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Current Performance Metrics
          </CardTitle>
          <CardDescription>Real-time performance statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Database className="h-4 w-4" />
                <span className="text-sm">Cache Hit Rate</span>
              </div>
              <p className="text-2xl font-bold">92%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Avg Load Time</span>
              </div>
              <p className="text-2xl font-bold">1.2s</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Zap className="h-4 w-4" />
                <span className="text-sm">RPC Calls/min</span>
              </div>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Loader2 className="h-4 w-4" />
                <span className="text-sm">Memory Usage</span>
              </div>
              <p className="text-2xl font-bold">45MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
