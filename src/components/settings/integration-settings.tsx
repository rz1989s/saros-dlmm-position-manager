'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Key, Link2, FileDown, Webhook, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'
import { useToast } from '@/hooks/use-toast'

export function IntegrationSettings() {
  const { settings, updateIntegrationSettings } = useSettings()
  const { integrations } = settings
  const { toast } = useToast()
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [newApiKey, setNewApiKey] = useState({ name: '', key: '' })

  const handleAddApiKey = () => {
    if (newApiKey.name && newApiKey.key) {
      const updatedKeys = { ...integrations.apiKeys, [newApiKey.name]: newApiKey.key }
      updateIntegrationSettings({ apiKeys: updatedKeys })
      setNewApiKey({ name: '', key: '' })
      toast({
        title: 'API Key Added',
        description: `API key for ${newApiKey.name} has been saved`,
      })
    }
  }

  const handleRemoveApiKey = (name: string) => {
    const { [name]: removed, ...remaining } = integrations.apiKeys
    updateIntegrationSettings({ apiKeys: remaining })
    toast({
      title: 'API Key Removed',
      description: `API key for ${name} has been removed`,
    })
  }

  const toggleShowKey = (name: string) => {
    setShowApiKey((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '****'
    return `${key.slice(0, 4)}${'*'.repeat(key.length - 8)}${key.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>Manage API keys for third-party integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing API Keys */}
          {Object.keys(integrations.apiKeys).length > 0 && (
            <div className="space-y-2">
              <Label>Saved API Keys</Label>
              {Object.entries(integrations.apiKeys).map(([name, key]) => (
                <div
                  key={name}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{name}</p>
                    <p className="text-xs font-mono text-gray-600">
                      {showApiKey[name] ? key : maskApiKey(key)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleShowKey(name)}
                  >
                    {showApiKey[name] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveApiKey(name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New API Key */}
          <div className="space-y-3 pt-4 border-t">
            <Label>Add New API Key</Label>
            <div className="grid gap-2">
              <Input
                placeholder="Service name (e.g., Pyth, Switchboard)"
                value={newApiKey.name}
                onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
              />
              <Input
                placeholder="API key"
                type="password"
                value={newApiKey.key}
                onChange={(e) => setNewApiKey({ ...newApiKey, key: e.target.value })}
              />
              <Button
                onClick={handleAddApiKey}
                disabled={!newApiKey.name || !newApiKey.key}
              >
                <Key className="h-4 w-4 mr-2" />
                Add API Key
              </Button>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              API keys are stored locally and never sent to our servers
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Third-Party Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Third-Party Connections
          </CardTitle>
          <CardDescription>Connected services and integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'Pyth Network', connected: true, type: 'Oracle' },
            { name: 'Switchboard', connected: true, type: 'Oracle' },
            { name: 'Jupiter Aggregator', connected: false, type: 'DEX' },
            { name: 'Telegram Bot', connected: false, type: 'Notifications' },
          ].map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-sm">{service.name}</p>
                <p className="text-xs text-gray-600">{service.type}</p>
              </div>
              <Badge
                variant={service.connected ? 'default' : 'outline'}
                className={service.connected ? 'bg-green-100 text-green-700' : ''}
              >
                {service.connected ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
          <CardDescription>Receive real-time alerts via webhooks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook">Webhook URL</Label>
            <Input
              id="webhook"
              placeholder="https://your-webhook-url.com/endpoint"
              value={integrations.webhookUrl}
              onChange={(e) => updateIntegrationSettings({ webhookUrl: e.target.value })}
            />
            <p className="text-sm text-gray-500">
              Receive position updates and alerts at this URL
            </p>
          </div>

          <Button variant="outline" className="w-full" disabled={!integrations.webhookUrl}>
            Test Webhook
          </Button>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium mb-2">Webhook Events:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Position out of range</li>
              <li>• Large price movements</li>
              <li>• Fee earnings milestones</li>
              <li>• Rebalancing recommendations</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Export Settings
          </CardTitle>
          <CardDescription>Configure data export preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exportFormat">Default Export Format</Label>
            <Select
              value={integrations.exportFormat}
              onValueChange={(value) =>
                updateIntegrationSettings({ exportFormat: value as any })
              }
            >
              <SelectTrigger id="exportFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoExport">Auto-Export Reports</Label>
              <p className="text-sm text-gray-500">
                Automatically export performance reports
              </p>
            </div>
            <Switch
              id="autoExport"
              checked={integrations.autoExport}
              onCheckedChange={(checked) =>
                updateIntegrationSettings({ autoExport: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Health</CardTitle>
          <CardDescription>Monitor the status of your integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 mb-1">Active Integrations</p>
              <p className="text-2xl font-bold text-green-900">2</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">API Keys Stored</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(integrations.apiKeys).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
