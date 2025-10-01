'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Download, Trash2, AlertTriangle, Clock } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'
import { useToast } from '@/hooks/use-toast'
import { exportSettings } from '@/lib/settings/storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function PrivacySettings() {
  const { settings, updatePrivacySettings } = useSettings()
  const { privacy } = settings
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const handleExportData = () => {
    try {
      const data = exportSettings(settings)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `saros-settings-${new Date().toISOString()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Data Exported',
        description: 'Your settings have been exported successfully',
      })
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export settings',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteData = () => {
    if (deleteConfirmation === 'DELETE') {
      // Clear all local storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      toast({
        title: 'Data Deleted',
        description: 'All local data has been deleted',
      })

      setShowDeleteDialog(false)
      setDeleteConfirmation('')

      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Session Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Settings
          </CardTitle>
          <CardDescription>Configure session timeout and security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timeout">Session Timeout (minutes)</Label>
            <Input
              id="timeout"
              type="number"
              min="5"
              max="480"
              step="5"
              value={privacy.sessionTimeout}
              onChange={(e) =>
                updatePrivacySettings({ sessionTimeout: parseInt(e.target.value) || 30 })
              }
            />
            <p className="text-sm text-gray-500">
              Automatically disconnect wallet after this period of inactivity
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="approval">Require Transaction Approval</Label>
              <p className="text-sm text-gray-500">
                Always prompt before sending transactions
              </p>
            </div>
            <Switch
              id="approval"
              checked={privacy.requireApproval}
              onCheckedChange={(checked) =>
                updatePrivacySettings({ requireApproval: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>Control data collection and sharing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Allow Analytics</Label>
              <p className="text-sm text-gray-500">
                Help improve the app by sharing anonymous usage data
              </p>
            </div>
            <Switch
              id="analytics"
              checked={privacy.allowAnalytics}
              onCheckedChange={(checked) =>
                updatePrivacySettings({ allowAnalytics: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="shareData">Share Performance Data</Label>
              <p className="text-sm text-gray-500">
                Share aggregated performance metrics
              </p>
            </div>
            <Switch
              id="shareData"
              checked={privacy.shareData}
              onCheckedChange={(checked) => updatePrivacySettings({ shareData: checked })}
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Privacy Notice:</strong> We never collect or store your private keys, seed
              phrases, or transaction details. All data is stored locally on your device.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Export or delete your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Export Your Data</Label>
            <p className="text-sm text-gray-500 mb-2">
              Download a copy of your settings and preferences
            </p>
            <Button variant="outline" className="w-full" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2">
              <Label className="text-red-600">Delete All Data</Label>
              <p className="text-sm text-gray-500 mb-2">
                Permanently delete all stored data from this device
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
          <CardDescription>Best practices for keeping your data secure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Use a hardware wallet</p>
                <p className="text-sm text-gray-600">
                  For maximum security with large amounts
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Enable transaction approval</p>
                <p className="text-sm text-gray-600">
                  Review every transaction before signing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Set a session timeout</p>
                <p className="text-sm text-gray-600">
                  Automatically disconnect after inactivity
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete All Data
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your settings, preferences, and cached data will be
              permanently deleted from this device.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirm">
                Type <strong>DELETE</strong> to confirm:
              </Label>
              <Input
                id="confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteData}
              disabled={deleteConfirmation !== 'DELETE'}
            >
              Delete All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
