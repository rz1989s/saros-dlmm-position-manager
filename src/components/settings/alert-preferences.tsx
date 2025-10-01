'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Bell, Mail, Volume2, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'
import { useToast } from '@/hooks/use-toast'

export function AlertPreferences() {
  const { settings, updateAlertPreferences } = useSettings()
  const { alerts } = settings
  const { toast } = useToast()

  const handleTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from Saros DLMM Position Manager',
        icon: '/favicon.ico',
      })
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('Test Notification', {
            body: 'Browser notifications are now enabled!',
            icon: '/favicon.ico',
          })
        }
      })
    } else {
      toast({
        title: 'Notifications Blocked',
        description: 'Please enable notifications in your browser settings',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>Choose how you want to receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="browser" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Browser Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Receive notifications in your browser
              </p>
            </div>
            <Switch
              id="browser"
              checked={alerts.browserNotifications}
              onCheckedChange={(checked) => updateAlertPreferences({ browserNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Receive alerts via email (coming soon)
              </p>
            </div>
            <Switch
              id="email"
              checked={alerts.emailNotifications}
              onCheckedChange={(checked) => updateAlertPreferences({ emailNotifications: checked })}
              disabled
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Notification Sounds
              </Label>
              <p className="text-sm text-gray-500">
                Play sound when alerts trigger
              </p>
            </div>
            <Switch
              id="sound"
              checked={alerts.soundEnabled}
              onCheckedChange={(checked) => updateAlertPreferences({ soundEnabled: checked })}
            />
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleTestNotification}
          >
            Test Notification
          </Button>
        </CardContent>
      </Card>

      {/* Alert Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Frequency</CardTitle>
          <CardDescription>Control how often you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select
              value={alerts.alertFrequency}
              onValueChange={(value) => updateAlertPreferences({ alertFrequency: value as any })}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time (Instant)</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Choose how frequently to receive alert notifications
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alert Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alert Thresholds
          </CardTitle>
          <CardDescription>Set thresholds for triggering alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="priceChange" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Price Change Alert (%)
            </Label>
            <Input
              id="priceChange"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={alerts.priceChangeThreshold}
              onChange={(e) =>
                updateAlertPreferences({ priceChangeThreshold: parseFloat(e.target.value) || 0 })
              }
            />
            <p className="text-sm text-gray-500">
              Alert when price changes by more than this percentage
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ilThreshold" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Impermanent Loss Alert (%)
            </Label>
            <Input
              id="ilThreshold"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={alerts.ilThreshold}
              onChange={(e) =>
                updateAlertPreferences({ ilThreshold: parseFloat(e.target.value) || 0 })
              }
            />
            <p className="text-sm text-gray-500">
              Alert when impermanent loss exceeds this percentage
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feeThreshold" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Fee Earnings Alert (USD)
            </Label>
            <Input
              id="feeThreshold"
              type="number"
              min="0"
              step="1"
              value={alerts.feeThreshold}
              onChange={(e) =>
                updateAlertPreferences({ feeThreshold: parseFloat(e.target.value) || 0 })
              }
            />
            <p className="text-sm text-gray-500">
              Alert when accumulated fees exceed this amount
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alert Events */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Events</CardTitle>
          <CardDescription>Choose which events trigger notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Position out of range', checked: true },
              { label: 'Large price movements', checked: true },
              { label: 'Fee earnings milestones', checked: true },
              { label: 'Rebalancing recommendations', checked: true },
              { label: 'Risk threshold breaches', checked: true },
              { label: 'Migration opportunities', checked: false },
            ].map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm">{event.label}</span>
                <Switch defaultChecked={event.checked} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Browser Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle>Browser Permissions</CardTitle>
          <CardDescription>Check notification permission status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Status: </span>
              {typeof window !== 'undefined' && 'Notification' in window
                ? Notification.permission === 'granted'
                  ? 'Granted ✓'
                  : Notification.permission === 'denied'
                  ? 'Denied ✗'
                  : 'Not requested'
                : 'Not supported'}
            </p>
            {typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'denied' && (
                <p className="text-sm text-orange-600 mt-2">
                  Please enable notifications in your browser settings to receive alerts
                </p>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
