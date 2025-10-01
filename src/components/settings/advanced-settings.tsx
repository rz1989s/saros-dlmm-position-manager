'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings2, Server, Percent, DollarSign, Code, FlaskConical, AlertTriangle } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'
import { useToast } from '@/hooks/use-toast'

export function AdvancedSettings() {
  const { settings, updateAdvancedSettings } = useSettings()
  const { advanced } = settings
  const { toast } = useToast()

  const handleTestRpc = async () => {
    try {
      const response = await fetch(advanced.rpcEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth',
        }),
      })

      if (response.ok) {
        toast({
          title: 'RPC Connection Successful',
          description: 'Successfully connected to the RPC endpoint',
        })
      } else {
        throw new Error('Connection failed')
      }
    } catch (error) {
      toast({
        title: 'RPC Connection Failed',
        description: 'Unable to connect to the RPC endpoint',
        variant: 'destructive',
      })
    }
  }

  const resetToDefaults = () => {
    updateAdvancedSettings({
      rpcEndpoint: process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com',
      customRpcEnabled: false,
      slippageTolerance: 1,
      priorityFee: 0.00001,
    })
    toast({
      title: 'Settings Reset',
      description: 'Advanced settings have been reset to defaults',
    })
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900 mb-1">Advanced Settings</p>
              <p className="text-sm text-orange-700">
                These settings are for advanced users. Incorrect configuration may affect
                application functionality. Proceed with caution.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RPC Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            RPC Endpoint Configuration
          </CardTitle>
          <CardDescription>Configure custom Solana RPC endpoint</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="customRpc">Use Custom RPC Endpoint</Label>
              <p className="text-sm text-gray-500">
                Override the default RPC endpoint
              </p>
            </div>
            <Switch
              id="customRpc"
              checked={advanced.customRpcEnabled}
              onCheckedChange={(checked) =>
                updateAdvancedSettings({ customRpcEnabled: checked })
              }
            />
          </div>

          {advanced.customRpcEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="rpcEndpoint">RPC Endpoint URL</Label>
                <Input
                  id="rpcEndpoint"
                  placeholder="https://api.mainnet-beta.solana.com"
                  value={advanced.rpcEndpoint}
                  onChange={(e) =>
                    updateAdvancedSettings({ rpcEndpoint: e.target.value })
                  }
                />
                <p className="text-sm text-gray-500">
                  Enter your custom RPC endpoint URL
                </p>
              </div>

              <Button variant="outline" className="w-full" onClick={handleTestRpc}>
                Test Connection
              </Button>
            </>
          )}

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium mb-2">Current Endpoint:</p>
            <p className="text-xs font-mono text-gray-600 break-all">
              {advanced.customRpcEnabled
                ? advanced.rpcEndpoint
                : process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Transaction Settings
          </CardTitle>
          <CardDescription>Configure default transaction parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slippage" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Slippage Tolerance (%)
            </Label>
            <Input
              id="slippage"
              type="number"
              min="0.1"
              max="50"
              step="0.1"
              value={advanced.slippageTolerance}
              onChange={(e) =>
                updateAdvancedSettings({
                  slippageTolerance: parseFloat(e.target.value) || 1,
                })
              }
            />
            <p className="text-sm text-gray-500">
              Maximum acceptable price slippage for swaps
            </p>
            {advanced.slippageTolerance > 5 && (
              <p className="text-sm text-orange-600">
                Warning: High slippage tolerance may result in unfavorable trades
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priorityFee" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Priority Fee (SOL)
            </Label>
            <Input
              id="priorityFee"
              type="number"
              min="0"
              max="1"
              step="0.00001"
              value={advanced.priorityFee}
              onChange={(e) =>
                updateAdvancedSettings({
                  priorityFee: parseFloat(e.target.value) || 0.00001,
                })
              }
            />
            <p className="text-sm text-gray-500">
              Additional fee to prioritize transaction processing
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Recommended Settings:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Slippage: 0.5% - 2% for most trades</li>
              <li>• Priority Fee: 0.00001 - 0.0001 SOL</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Developer Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Developer Mode
          </CardTitle>
          <CardDescription>Enable developer tools and debugging features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="devMode">Enable Developer Mode</Label>
              <p className="text-sm text-gray-500">
                Show additional debugging information
              </p>
            </div>
            <Switch
              id="devMode"
              checked={advanced.developerMode}
              onCheckedChange={(checked) =>
                updateAdvancedSettings({ developerMode: checked })
              }
            />
          </div>

          {advanced.developerMode && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm font-medium">Developer Features Enabled:</p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Console logging for SDK calls</li>
                <li>Performance metrics display</li>
                <li>Network request monitoring</li>
                <li>State inspection tools</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experimental Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Experimental Features
          </CardTitle>
          <CardDescription>Test new features before they&apos;re officially released</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="experimental">Enable Experimental Features</Label>
              <p className="text-sm text-gray-500">
                Access beta features and improvements
              </p>
            </div>
            <Switch
              id="experimental"
              checked={advanced.experimentalFeatures}
              onCheckedChange={(checked) =>
                updateAdvancedSettings({ experimentalFeatures: checked })
              }
            />
          </div>

          {advanced.experimentalFeatures && (
            <div className="space-y-3">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Experimental Mode Active
              </Badge>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-900 mb-2">
                  <strong>Available Experimental Features:</strong>
                </p>
                <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
                  <li>Advanced position analytics</li>
                  <li>ML-powered rebalancing suggestions</li>
                  <li>Cross-chain liquidity tracking</li>
                  <li>Enhanced performance optimization</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Current application and environment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Application Version</span>
              <span className="font-mono">v0.27.1</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Saros SDK Version</span>
              <span className="font-mono">v1.4.0</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Network</span>
              <Badge variant="outline">
                {process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}
              </Badge>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Browser</span>
              <span className="font-mono text-xs">
                {typeof window !== 'undefined' ? navigator.userAgent.split(' ').slice(-2).join(' ') : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset to Defaults */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Reset Advanced Settings</CardTitle>
          <CardDescription>
            Reset all advanced settings to their default values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full text-red-600 hover:bg-red-50" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
