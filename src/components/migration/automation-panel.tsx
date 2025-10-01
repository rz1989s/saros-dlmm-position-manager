'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Zap,
  Plus,
  Trash2,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react'

interface AutomationRule {
  id: string
  name: string
  trigger: string
  condition: string
  threshold: number
  action: string
  enabled: boolean
  lastTriggered?: string
  executionCount: number
}

export function AutomationPanel() {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'APR Opportunity Alert',
      trigger: 'APR Improvement',
      condition: 'above',
      threshold: 15,
      action: 'notify',
      enabled: true,
      lastTriggered: '2 hours ago',
      executionCount: 5
    },
    {
      id: '2',
      name: 'Auto-Migrate High Gains',
      trigger: 'APR Improvement',
      condition: 'above',
      threshold: 25,
      action: 'auto-migrate',
      enabled: false,
      executionCount: 0
    }
  ])

  const [newRule, setNewRule] = useState({
    name: '',
    trigger: 'apr_improvement',
    condition: 'above',
    threshold: 0,
    action: 'notify'
  })

  const handleAddRule = () => {
    if (newRule.name && newRule.threshold > 0) {
      const rule: AutomationRule = {
        id: Date.now().toString(),
        name: newRule.name,
        trigger: newRule.trigger,
        condition: newRule.condition,
        threshold: newRule.threshold,
        action: newRule.action,
        enabled: true,
        executionCount: 0
      }

      setRules([...rules, rule])
      setNewRule({
        name: '',
        trigger: 'apr_improvement',
        condition: 'above',
        threshold: 0,
        action: 'notify'
      })
    }
  }

  const handleToggle = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  const handleDelete = (id: string) => {
    setRules(rules.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Automation Summary */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Migration Automation System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Active Rules</p>
              <p className="text-3xl font-bold text-yellow-600">
                {rules.filter(r => r.enabled).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">of {rules.length} total</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Executions (24h)</p>
              <p className="text-3xl font-bold text-orange-600">
                {rules.reduce((sum, r) => sum + r.executionCount, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total triggers</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-green-600">98.5%</p>
              <p className="text-xs text-gray-500 mt-1">Successful executions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create New Rule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Create Automation Rule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                placeholder="e.g., Auto-migrate on high APR"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="trigger">Trigger Type</Label>
              <select
                id="trigger"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={newRule.trigger}
                onChange={(e) => setNewRule({ ...newRule, trigger: e.target.value })}
              >
                <option value="apr_improvement">APR Improvement</option>
                <option value="liquidity_change">Liquidity Change</option>
                <option value="volume_spike">Volume Spike</option>
                <option value="fee_tier_change">Fee Tier Change</option>
              </select>
            </div>

            <div>
              <Label htmlFor="condition">Condition</Label>
              <select
                id="condition"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={newRule.condition}
                onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>

            <div>
              <Label htmlFor="threshold">Threshold (%)</Label>
              <Input
                id="threshold"
                type="number"
                placeholder="e.g., 15"
                value={newRule.threshold || ''}
                onChange={(e) => setNewRule({ ...newRule, threshold: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="action">Action</Label>
              <select
                id="action"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={newRule.action}
                onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
              >
                <option value="notify">Send Notification</option>
                <option value="auto-migrate">Auto-Execute Migration</option>
                <option value="notify-and-queue">Notify and Queue for Review</option>
              </select>
            </div>
          </div>

          <Button onClick={handleAddRule} className="w-full bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Automation Rule
          </Button>
        </CardContent>
      </Card>

      {/* Active Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`border rounded-lg p-4 transition-all ${
                  rule.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{rule.name}</p>
                      {rule.enabled ? (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      ) : (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      When {rule.trigger} is {rule.condition} {rule.threshold}% → {rule.action === 'notify' ? 'Send notification' : rule.action === 'auto-migrate' ? 'Execute migration' : 'Queue for review'}
                    </p>
                    {rule.lastTriggered && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last triggered: {rule.lastTriggered}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(rule.id)}
                    >
                      {rule.enabled ? (
                        <><Pause className="h-4 w-4 mr-1" /> Pause</>
                      ) : (
                        <><Play className="h-4 w-4 mr-1" /> Enable</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Executions: </span>
                    <span className="font-medium">{rule.executionCount}</span>
                  </div>
                  {rule.enabled && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      Monitoring
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Migrations */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Migrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 1, pool: 'SOL/USDC', action: 'Migrate to 0.25%', time: 'Tomorrow at 2:00 AM', status: 'Pending' },
              { id: 2, pool: 'RAY/SOL', action: 'Migrate to ORCA/USDC', time: 'In 3 days', status: 'Scheduled' }
            ].map((migration) => (
              <div key={migration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">{migration.pool}</p>
                  <p className="text-sm text-gray-600">{migration.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{migration.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{migration.status}</Badge>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
