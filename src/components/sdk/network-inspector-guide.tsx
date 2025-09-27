'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Monitor,
  Search,
  Network,
  FileCode,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Info,
  ExternalLink,
  Eye,
  RefreshCw,
  Globe
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// Note: Using custom collapsible implementation

interface InspectionStep {
  id: string
  title: string
  description: string
  action: string
  lookFor: string[]
  screenshot?: string
  important?: boolean
}

const inspectionSteps: InspectionStep[] = [
  {
    id: 'open-devtools',
    title: 'Open DevTools',
    description: 'Access browser developer tools to inspect network traffic',
    action: 'Press F12 or Right-click → Inspect Element',
    lookFor: ['Developer Tools panel opens', 'Multiple tabs visible (Elements, Console, Network, etc.)'],
    important: true
  },
  {
    id: 'navigate-network',
    title: 'Go to Network Tab',
    description: 'Switch to the Network tab to monitor HTTP requests',
    action: 'Click "Network" tab in DevTools',
    lookFor: ['Network tab is selected', 'Request list area is visible', 'Filter options are shown'],
    important: true
  },
  {
    id: 'clear-requests',
    title: 'Clear Previous Requests',
    description: 'Start with a clean slate to see only new requests',
    action: 'Click the clear button (🚫) or press Ctrl+L',
    lookFor: ['Request list is empty', 'Clear button is available']
  },
  {
    id: 'trigger-sdk-call',
    title: 'Trigger SDK Activity',
    description: 'Perform actions that will make SDK calls to Solana',
    action: 'Click "Refresh" on any SDK component or navigate between pages',
    lookFor: ['New requests appear in real-time', 'Multiple requests are made'],
    important: true
  },
  {
    id: 'identify-rpc-calls',
    title: 'Identify RPC Calls',
    description: 'Look for requests going to Solana RPC endpoints',
    action: 'Filter by "helius" or look for POST requests',
    lookFor: [
      'Requests to helius-rpc.com',
      'POST method requests',
      'Status code 200 (successful)',
      'JSON response data'
    ],
    important: true
  },
  {
    id: 'inspect-request-details',
    title: 'Inspect Request Details',
    description: 'Click on RPC requests to see detailed information',
    action: 'Click on a helius-rpc.com request',
    lookFor: [
      'Request headers with Content-Type: application/json',
      'Request payload with Solana RPC method calls',
      'Response with blockchain data',
      'Response time in milliseconds'
    ],
    important: true
  },
  {
    id: 'verify-real-data',
    title: 'Verify Real Blockchain Data',
    description: 'Confirm the responses contain actual Solana blockchain data',
    action: 'Look at the Response tab of RPC requests',
    lookFor: [
      'Block heights and hashes',
      'Transaction signatures',
      'Account addresses and balances',
      'Program account data'
    ]
  }
]

export function NetworkInspectorGuide() {
  const [openSteps, setOpenSteps] = useState<string[]>(['open-devtools', 'navigate-network'])
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const toggleStep = (stepId: string) => {
    setOpenSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  const markCompleted = (stepId: string) => {
    setCompletedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  const getStepIcon = (step: InspectionStep) => {
    if (completedSteps.includes(step.id)) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
    }
    if (step.important) {
      return <AlertCircle className="h-5 w-5 text-orange-500" />
    }
    return <Info className="h-5 w-5 text-blue-500" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-blue-500" />
          Network Inspector Guide
          <Badge variant="outline" className="text-xs">
            For Judges
          </Badge>
        </CardTitle>
        <CardDescription>
          Step-by-step guide to verify real SDK connections in browser DevTools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Quick Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
              <Network className="h-4 w-4" />
              What You&apos;ll Verify
            </h4>
            <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <p>• Real HTTP requests to Solana mainnet (helius-rpc.com)</p>
              <p>• Actual blockchain data in responses (block heights, accounts, etc.)</p>
              <p>• SDK method calls happening in real-time</p>
              <p>• Response times proving live network connectivity</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progress: {completedSteps.length} of {inspectionSteps.length} steps completed
            </span>
            <Badge variant={completedSteps.length === inspectionSteps.length ? "default" : "secondary"}>
              {Math.round((completedSteps.length / inspectionSteps.length) * 100)}%
            </Badge>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-saros-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(completedSteps.length / inspectionSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Inspection Steps */}
        <div className="space-y-3">
          {inspectionSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className={`border rounded-lg ${
                completedSteps.includes(step.id)
                  ? 'border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800'
                  : 'border-border'
              }`}>
                <button
                  className="w-full p-4 flex items-center justify-between hover:bg-accent rounded-lg transition-colors"
                  onClick={() => toggleStep(step.id)}
                >
                  <div className="flex items-center gap-3">
                    {getStepIcon(step)}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          Step {index + 1}: {step.title}
                        </span>
                        {step.important && (
                          <Badge variant="outline" className="text-xs">
                            Important
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!completedSteps.includes(step.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          markCompleted(step.id)
                        }}
                        className="text-xs"
                      >
                        Mark Done
                      </Button>
                    )}
                    {openSteps.includes(step.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {openSteps.includes(step.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-4 space-y-3 border-t bg-muted/30"
                  >
                    <div className="space-y-2">
                      <h5 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                        Action Required
                      </h5>
                      <p className="text-sm bg-background px-3 py-2 rounded border">
                        {step.action}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                        What to Look For
                      </h5>
                      <ul className="space-y-1">
                        {step.lookFor.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Success Message */}
        {completedSteps.length === inspectionSteps.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Verification Complete!</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                You have successfully verified that this demo uses real Saros DLMM SDK connections
                to Solana mainnet. The network requests prove authentic blockchain integration.
              </p>
            </div>
          </motion.div>
        )}

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              Quick Verification Tips
            </h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">Look for RPC Endpoints</span>
                </div>
                <p className="text-xs text-muted-foreground pl-5">
                  Requests to helius-rpc.com prove mainnet connectivity
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3 w-3 text-green-500" />
                  <span className="font-medium">Real-time Updates</span>
                </div>
                <p className="text-xs text-muted-foreground pl-5">
                  Click refresh buttons to see new network requests
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileCode className="h-3 w-3 text-orange-500" />
                  <span className="font-medium">Check Response Data</span>
                </div>
                <p className="text-xs text-muted-foreground pl-5">
                  Response bodies contain actual blockchain data
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Search className="h-3 w-3 text-purple-500" />
                  <span className="font-medium">Filter Requests</span>
                </div>
                <p className="text-xs text-muted-foreground pl-5">
                  Use &quot;helius&quot; filter to focus on RPC calls
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Common RPC Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Common SDK Methods You&apos;ll See</h4>
            <div className="grid md:grid-cols-2 gap-2 text-xs">
              <div className="font-mono bg-muted px-2 py-1 rounded">getAccountInfo</div>
              <div className="font-mono bg-muted px-2 py-1 rounded">getMultipleAccounts</div>
              <div className="font-mono bg-muted px-2 py-1 rounded">getBlockHeight</div>
              <div className="font-mono bg-muted px-2 py-1 rounded">getProgramAccounts</div>
            </div>
          </div>
        </motion.div>

      </CardContent>
    </Card>
  )
}